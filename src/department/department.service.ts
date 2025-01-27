import { Inject, Injectable } from '@nestjs/common';
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
}
