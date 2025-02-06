import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZEL } from 'src/database/database.module';
import * as schema from '../database/schema/schema';
import { asc, eq } from 'drizzle-orm';
import { UpdatePositionDto } from './dto/updatePos.dto';

@Injectable()
export class PositionService {
  constructor(
    @Inject(DRIZZEL)
    private readonly database: NodePgDatabase<typeof schema>,
  ) {}

  // async getPosition() {
  //   try {
  //     const positions = await this.database
  //       .select({
  //         id: schema.officePositions.id,
  //         departmentName: schema.mainOffices.name,
  //         className: schema.Positions.description,
  //         quantity: schema.officePositions.quantity,
  //       })
  //       .from(schema.Positions)
  //       .fullJoin(
  //         schema.officePositions,
  //         eq(schema.Positions.id, schema.officePositions.class),
  //       )
  //       .fullJoin(
  //         schema.mainOffices,
  //         eq(schema.officePositions.officeId, schema.mainOffices.id),
  //       );
        
  //     return positions;
  //   } catch (error) {
  //     console.error('Error fetching positions:', error);
  //     throw new Error('Failed to fetch positions. Please try again later.');
  //   }
  // }
  async getPosition() {

    try {
      // ดึงข้อมูลจากฐานข้อมูล
      const positions = await this.database
        .select({
          id: schema.officePositions.id,
          departmentName: schema.mainOffices.name,
          className: schema.Positions.description,
          quantity: schema.officePositions.quantity,
        })
        .from(schema.Positions)
        .fullJoin(
          schema.officePositions,
          eq(schema.Positions.id, schema.officePositions.class),
        )
        .fullJoin(
          schema.mainOffices,
          eq(schema.officePositions.officeId, schema.mainOffices.id),
        )
        .orderBy(asc(schema.mainOffices.id), asc(schema.Positions.id)); 
  
      // จัดกลุ่มข้อมูลตาม departmentName
      const groupedData = positions.reduce((acc, curr) => {
        const { departmentName, ...position } = curr;
  
        // ตรวจสอบว่า departmentName ไม่เป็น null หรือ undefined
        if (departmentName != null) {
          // หากยังไม่มี departmentName ใน accumulator ให้สร้างใหม่
          if (!acc[departmentName]) {
            acc[departmentName] = {
              departmentName,
              positions: [],
            };
          }
  
          // เพิ่ม position เข้าไปใน department ที่ตรงกัน
          acc[departmentName].positions.push(position);
        }
  
        return acc;
      }, {} as Record<string, { departmentName: string; positions: any[] }>); // กำหนดค่าเริ่มต้นให้ acc เป็น object
  
      // แปลง object กลับเป็น array
      const result = Object.values(groupedData);
  
      return result;
    } catch (error) {
      console.error('Error fetching positions:', error);
      throw new Error('Failed to fetch positions. Please try again later.');
    }
  }

  async updatePosition(data:UpdatePositionDto) {
    const {id,quantity} = data
    try {
      const currentPosition = await this.database
        .select({
          currentQuantity: schema.officePositions.quantity,
        })
        .from(schema.officePositions)
        .where(eq(schema.officePositions.id, id))
        .limit(1);

      if (!currentPosition || currentPosition.length === 0) {
        throw new Error(`Position with id ${id} not found.`);
      }

      await this.database
        .update(schema.officePositions)
        .set({
          quantity: quantity, 
        })
        .where(eq(schema.officePositions.id, id));

      return {
        message: `Quantity updated successfully`,
      };
    } catch (error) {
      console.error('Error updating or fetching positions:', error);
      throw new Error(
        'Failed to update and fetch positions. Please try again later.',
      );
    }
  }

}
