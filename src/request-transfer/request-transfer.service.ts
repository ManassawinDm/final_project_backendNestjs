import { JwtService } from '@nestjs/jwt';
import { Inject, Injectable } from '@nestjs/common';
import * as schema from '../database/schema/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZEL } from 'src/database/database.module';
import { asc, eq, gt } from 'drizzle-orm';

interface GroupedRequest {
  userId: number;
  class: number;
  officeId: number[];
  reason: string[];
}
interface RejectedUser {
  userId: number;
  reason: string[];
}

@Injectable()
export class RequestTransferService {
  constructor(
    @Inject(DRIZZEL)
    private readonly database: NodePgDatabase<typeof schema>,
    private readonly jwtService: JwtService,
  ) {}

  async processTransfers() {
    // Cache offices data
    const offices = await this.database
      .select({
        officeId: schema.officePositions.officeId,
        class: schema.officePositions.class,
        quantity: schema.officePositions.quantity,
      })
      .from(schema.officePositions)
      .where(gt(schema.officePositions.quantity, 0));

    // Fetch transfer requests and related user data
    const requests = await this.database
      .select({
        userId: schema.transferRequests.userId,
        officeId: schema.transferRequests.officeId,
        reason: schema.transferRequests.reason,
        class: schema.users.class,
      })
      .from(schema.transferRequests)
      .innerJoin(
        schema.users,
        eq(schema.transferRequests.userId, schema.users.id),
      )
      .orderBy(asc(schema.users.id), asc(schema.transferRequests.id));

    // Group requests by userId
    const groupedRequests = requests.reduce(
      (acc, request) => {
        if (!acc[request.userId]) {
          acc[request.userId] = {
            userId: request.userId,
            class: request.class,
            officeId: [],
            reason: [],
          };
        }

        acc[request.userId].officeId.push(request.officeId);
        acc[request.userId].reason.push(request.reason ?? '');
        return acc;
      },
      {} as Record<number, GroupedRequest>,
    );

    // Prepare update data
    const updateOffice: Record<number, number> = {};
    const approveUserID: number[] = [];
    const rejectUserID: RejectedUser[] = [];

    // Process grouped requests
    for (const [userId, data] of Object.entries(groupedRequests)) {
      for (const officeId of data.officeId) {
        // Find the corresponding office with matching officeId and class
        const office = offices.find(
          (o) => o.officeId === officeId && o.class === data.class,
        );

        if (office && office.quantity > 0) {
          // Decrement the office quantity
          office.quantity -= 1;
          approveUserID.push(Number(userId));

          // Update the updateOffice object
          if (updateOffice[officeId] !== undefined) {
            updateOffice[officeId] -= 1;
          } else {
            updateOffice[officeId] = office.quantity;
          }
          // Break since the user's request has been approved
          break;
        }else{
          rejectUserID.push({
            userId: Number(userId),
            reason: data.reason,
          });
          break;
        }
      }
    }
    console.log('Updated office data:', updateOffice);
    console.log('Approved user IDs:', approveUserID);
    console.log('Approved user IDs:', rejectUserID);
  }
}
