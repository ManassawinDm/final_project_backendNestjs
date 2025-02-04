import {
  Inject,
  Injectable,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import * as xlsx from 'xlsx';
import { Express } from 'express';
import { DRIZZEL } from 'src/database/database.module';
import * as schema from '../database/schema/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class DepartmentService {
  constructor(
    @Inject(DRIZZEL)
    private readonly database: NodePgDatabase<typeof schema>,
    private jwtService: JwtService,
  ) {}

  async getDepartmentsAll() {
    const departmentData = await this.database
      .select()
      .from(schema.mainOffices);

    return departmentData;
  }

  async getDepartmentById(id: number, type: 'main' | 'sub') {
    try {
      if (type === 'main') {
        return await this.database
          .select()
          .from(schema.mainOffices)
          .where(eq(schema.mainOffices.id, id));
      } else if (type === 'sub') {
        return await this.database
          .select()
          .from(schema.mainOffices)
          .where(eq(schema.mainOffices.id, id));
      } else {
        throw new Error('Invalid type specified');
      }
    } catch (error) {
      console.error('Error GetDepament:', error);
      throw new Error(`Failed to GetDepament: ${error.message}`);
    }
  }

  async deleteDepartmentById(id: number) {
    try {
      const result = await this.database
        .delete(schema.mainOffices)
        .where(eq(schema.mainOffices.id, id));

      if (result.rowCount === 0) {
        throw new Error('No record found to delete');
      }

      return `${id} has been deleted successfully.`;
    } catch (error) {
      console.error('Error deleting record:', error);
      throw new Error(`Failed to delete record: ${error.message}`);
    }
  }

  async addDepartment(department: {
    name: string;
    short_name: string;
    address: string;
    latitude: string;
    longitude: string;
    province: string;
    area: string;
    type: string;
  }) {
    try {
      const result = await this.database
        .insert(schema.mainOffices)
        .values({
          name: department.name,
          short_name: department.short_name,
          address: department.address,
          latitude: department.latitude,
          longitude: department.longitude,
          province: department.province,
          area: department.area,
          type: department.type,
        })
        .execute();

      console.log('Department added successfully:', result);
      return result;
    } catch (error) {
      console.error('Error occurred while adding department:', error);
      throw new Error('Error occurred while adding department');
    }
  }

  async processExcel(file: Express.Multer.File) {
    interface OfficeData {
      org_name: string;
      org_abbr: string;
      org_address: string;
      latitude: number;
      longitude: number;
      org_province: string;
      district: string;
      org_area_desc: string;
    }
    if (!file.mimetype.includes('spreadsheetml')) {
      throw new BadRequestException('Invalid file type');
    }

    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json<OfficeData>(worksheet);

    if (!data.length) {
      throw new Error('No data found in the Excel file');
    }

    try {
      // console.log(data)
      for (const row of data) {
        await this.database.insert(schema.mainOffices).values({
          name: row.org_name,
          short_name: row.org_abbr,
          address: row.org_address,
          latitude: row.latitude.toString(), 
          longitude: row.longitude.toString(), 
          province: row.org_province,
          area: row.district ? row.district : 'Unknown',
          type: row.org_area_desc.substring(0, 10),
        });
      }
      return { message: 'Data inserted successfully' };
    } catch (error) {
      throw new Error(`Error inserting data into database: ${error.message}`);
    }
  }
}
