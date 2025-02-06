import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DRIZZEL } from 'src/database/database.module';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema/schema';
import * as xlsx from 'xlsx';

@Injectable()
export class ClassService {
  constructor(
    @Inject(DRIZZEL)
    private readonly database: NodePgDatabase<typeof schema>,
  ) {}

  async processExcel(file: Express.Multer.File) {
    interface classType {
      code: number;
      description: string;
    }

    if (!file.mimetype.includes('spreadsheetml')) {
      throw new BadRequestException('Invalid file type');
    }

    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json<classType>(worksheet);

    if (!data.length) {
      throw new Error('No data found in the Excel file');
    }

    try {
      for (const row of data) {
        await this.database.insert(schema.Positions).values({
          id: row.code,
          description: row.description,
        });
      }
      return { message: 'Data inserted successfully' };
    } catch (error) {
      throw new Error(`Error inserting data into database: ${error.message}`);
    }
  }
}
