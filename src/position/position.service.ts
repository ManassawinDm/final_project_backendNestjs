import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZEL } from 'src/database/database.module';
import * as schema from '../database/schema/schema';
import { eq } from 'drizzle-orm';
import { UpdatePositionDto } from './dto/updatePos.dto';

@Injectable()
export class PositionService {
  constructor(
    @Inject(DRIZZEL)
    private readonly database: NodePgDatabase<typeof schema>,
  ) {}

  async getPosition() {
    try {
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
        );
      return positions;
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

      const currentQuantity = currentPosition[0].currentQuantity;

      if (currentQuantity + quantity < 0) {
        throw new Error(
          `Insufficient quantity. Current quantity is ${currentQuantity}.`,
        );
      }

      await this.database
        .update(schema.officePositions)
        .set({
          quantity: currentQuantity + quantity, 
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
