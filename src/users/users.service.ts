import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZEL } from 'src/database/database.module';
import * as schema from '../database/schema/schema';
import { AddUsersDto } from 'src/auth/dtos/addUsers.dto';
import * as bcrypt from 'bcrypt';
import * as xlsx from 'xlsx';
import { EncodePasswordDto } from 'src/auth/dtos/encodePwd.dto';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DRIZZEL)
    private readonly database: NodePgDatabase<typeof schema>,
  ) {}

  async getUsersAll() {
    return this.database.query.users.findMany();
  }

  async EncodePassword(credentials: EncodePasswordDto) {
    const { password } = credentials;
    const hashPassword = await bcrypt.hash(password, 10);

    return { hashPassword };
  }

  async addUsers(credentials: AddUsersDto) {
    const {
      email,
      password,
      firstname,
      lastname,
      userClass,
      department_id,
      position,
    } = credentials;
    const hashPassword = await bcrypt.hash(password, 10);
  }

  async processExcel(file: Express.Multer.File) {
    interface UsersData {
      CODE: number;
      FIRSTNAME: string;
      LASTNAME: string;
      class_predict: number;
      Predict_Dept: string;
      POSITION_clean: string;
    }
    if (!file.mimetype.includes('spreadsheetml')) {
      throw new BadRequestException('Invalid file type');
    }

    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json<UsersData>(worksheet);

    if (!data.length) {
      throw new Error('No data found in the Excel file');
    }

    try {
        for (const row of data) {

            if (!row.CODE || isNaN(Number(row.CODE))) {
              console.warn(`Skipping row with invalid CODE: '${row.CODE}'`);
              continue;
            }   
            const userId = Number(row.CODE);    
            // ตรวจสอบว่ามี id อยู่แล้วหรือไม่
            const existingUser = await this.database
              .select({ id: schema.users.seniority_number })
              .from(schema.users)
              .where(eq(schema.users.seniority_number, userId))
              .limit(1);
          
            if (existingUser.length > 0) {
              console.warn(`Skipping insert: User with id ${userId} already exists.`);
              continue;  // ข้ามแถวนี้ไป
            }
          
            // หา ID ของตำแหน่ง (Positions)
            const position = await this.database
              .select({ id: schema.Positions.id })
              .from(schema.Positions)
              .where(eq(schema.Positions.id, row.class_predict as any))
              .limit(1);
          
            const positionId = position.length > 0 ? position[0].id : 999;
          
            // หา ID ของ department (mainOffices)
            const department = await this.database
              .select({ id: schema.mainOffices.id })
              .from(schema.mainOffices)
              .where(eq(schema.mainOffices.name, row.Predict_Dept as any))
              .limit(1);
          
            const departmentId = department.length > 0 ? department[0].id : null;
          
            await this.database.insert(schema.users).values({
              seniority_number:row.CODE,
              firstname: row.FIRSTNAME || "Unknown", 
              lastname: row.LASTNAME || "Unknown",
              class: positionId,
              departmentId: departmentId,
              positionDescription: row.POSITION_clean || "",
            });
          }
      return { message: 'Data inserted successfully' };
    } catch (error) {
      throw new Error(`Error inserting data into database: ${error.message}`);
    }
  }


  // new 
  async importFile(file: Express.Multer.File) {
  
      if (!file.mimetype.includes('spreadsheetml')) {
        throw new BadRequestException('Invalid file type');
      }
  
      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);
  
      if (!data.length) {
        throw new Error('No data found in the Excel file');
      }
  
      try {
        console.log(data)
        return { message: 'Data inserted successfully' };
      } catch (error) {
        throw new Error(`Error inserting data into database: ${error.message}`);
      }
    }
}
