import { JwtService } from '@nestjs/jwt';
import { Inject, Injectable } from '@nestjs/common';
import * as schema from '../database/schema/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZEL } from 'src/database/database.module';
import { and, asc, eq, gt } from 'drizzle-orm';

interface GroupedRequest {
  userId: number;
  requestId: number;
  priority: number;
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

  //   async processTransfers() {
  //     // Cache offices data
  //     const offices = await this.database
  //       .select({
  //         officeId: schema.officePositions.officeId,
  //         class: schema.officePositions.class,
  //         quantity: schema.officePositions.quantity,
  //       })
  //       .from(schema.officePositions)
  //       .where(gt(schema.officePositions.quantity, 0));

  //     // Fetch transfer requests and related user data
  //     const requests = await this.database
  //       .select({
  //         userId: schema.transferRequests.userId,
  //         officeId: schema.transferRequests.officeId,
  //         reason: schema.transferRequests.reason,
  //         class: schema.users.class,
  //       })
  //       .from(schema.transferRequests)
  //       .innerJoin(
  //         schema.users,
  //         eq(schema.transferRequests.userId, schema.users.id),
  //       )
  //       .orderBy(asc(schema.users.id), asc(schema.transferRequests.id));

  //     // Group requests by userId
  //     const groupedRequests = requests.reduce(
  //       (acc, request) => {
  //         if (!acc[request.userId]) {
  //           acc[request.userId] = {
  //             userId: request.userId,
  //             class: request.class,
  //             officeId: [],
  //             reason: [],
  //           };
  //         }

  //         acc[request.userId].officeId.push(request.officeId);
  //         acc[request.userId].reason.push(request.reason ?? '');
  //         return acc;
  //       },
  //       {} as Record<number, GroupedRequest>,
  //     );

  //     // Prepare update data
  //     const updateOffice: Record<number, number> = {};
  //     const approveUserID: number[] = [];
  //     const rejectUserID: RejectedUser[] = [];

  //     // Process grouped requests
  //     for (const [userId, data] of Object.entries(groupedRequests)) {
  //       for (const officeId of data.officeId) {
  //         // Find the corresponding office with matching officeId and class
  //         const office = offices.find(
  //           (o) => o.officeId === officeId && o.class === data.class,
  //         );

  //         if (office && office.quantity > 0) {
  //           // Decrement the office quantity
  //           office.quantity -= 1;
  //           approveUserID.push(Number(userId));

  //           // Update the updateOffice object
  //           if (updateOffice[officeId] !== undefined) {
  //             updateOffice[officeId] -= 1;
  //           } else {
  //             updateOffice[officeId] = office.quantity;
  //           }
  //           // Break since the user's request has been approved
  //           break;
  //         }else{
  //           rejectUserID.push({
  //             userId: Number(userId),
  //             reason: data.reason,
  //           });
  //           break;
  //         }
  //       }
  //     }
  //     console.log('Updated office data:', updateOffice);
  //     console.log('Approved user IDs:', approveUserID);
  //     console.log('Approved user IDs:', rejectUserID);
  //   }
  // }

  async processTransfers() {
    const selectedTransfers: GroupedRequest[] = [];
    const alreadyApprovedUsers = new Set(
      (
        await this.database
          .select({ userId: schema.transferRequests.userId })
          .from(schema.transferRequests)
          .where(eq(schema.transferRequests.status, 'Approved'))
      ).map((row) => row.userId),
    );

    const requests = await this.database
      .select({
        userId: schema.transferRequests.userId,
        firstName: schema.users.firstname,
        lastName: schema.users.lastname,
        requestId: schema.transferRequests.id,
        officeId: schema.transferRequests.officeId,
        officeName: schema.mainOffices.name,
        class: schema.officePositions.class,
        reason: schema.transferRequests.reason,
        quantity: schema.officePositions.quantity,
      })
      .from(schema.Positions)
      .innerJoin(schema.users, eq(schema.users.class, schema.Positions.id))
      .innerJoin(
        schema.transferRequests,
        eq(schema.transferRequests.userId, schema.users.id),
      )
      .innerJoin(
        schema.officePositions,
        and(
          eq(schema.officePositions.class, schema.Positions.id),
          eq(schema.officePositions.officeId, schema.transferRequests.officeId),
        ),
      )
      .innerJoin(
        schema.mainOffices,
        eq(schema.transferRequests.officeId, schema.mainOffices.id),
      )
      .orderBy(asc(schema.transferRequests.id));

    const groupedRequests = requests.reduce(
      (acc, request) => {
        if (!acc[request.userId]) {
          acc[request.userId] = [];
        }
        acc[request.userId].push(request);
        return acc;
      },
      {} as Record<number, typeof requests>,
    );

    const updateOfficePromises: Promise<any>[] = [];
    const updateTransferPromises: Promise<any>[] = [];

    for (const userId in groupedRequests) {
      let i = 0;
      const userRequests = groupedRequests[userId];
      if (alreadyApprovedUsers.has(Number(userId))) continue;
      for (const request of userRequests) {
        i++;
        if (request.quantity > 0) {
          selectedTransfers.push({
            userId: request.userId,
            requestId: request.requestId,
            priority: i,
          });
          alreadyApprovedUsers.add(request.userId);
          updateOfficePromises.push(
            this.database
              .update(schema.officePositions)
              .set({ quantity: request.quantity - 1 })
              .where(
                and(
                  eq(schema.officePositions.officeId, request.officeId),
                  eq(schema.officePositions.class, request.class),
                ),
              ),
          );
          updateTransferPromises.push(
            this.database
              .update(schema.transferRequests)
              .set({ status: 'Approved' })
              .where(eq(schema.transferRequests.id, request.requestId)),
          );
          i = 0;
          break;
        }
      }
    }
    await Promise.all([...updateOfficePromises, ...updateTransferPromises]);
    console.log(selectedTransfers);
    console.log(alreadyApprovedUsers);
  }

  async deleteProccess() {
    const requests = await this.database
      .select({
        requestId: schema.transferRequests.id,
        userId: schema.transferRequests.userId,
        class: schema.users.class,
        officeId: schema.transferRequests.officeId,
        status: schema.transferRequests.status,
        quantity: schema.officePositions.quantity,
      })
      .from(schema.transferRequests)
      .innerJoin(
        schema.users,
        eq(schema.users.id, schema.transferRequests.userId),
      )
      .innerJoin(
        schema.officePositions,
        and(
          eq(schema.officePositions.officeId, schema.transferRequests.officeId),
          eq(schema.officePositions.class, schema.users.class),
        ),
      )
      .where(eq(schema.transferRequests.status, 'Approved'));

    if (requests.length === 0) return;
    const updateOfficePosition = requests.map((request) =>
      this.database
        .update(schema.officePositions)
        .set({ quantity: request.quantity + 1 })
        .where(
          and(
            eq(schema.officePositions.class, request.class),
            eq(schema.officePositions.officeId, request.officeId),
          ),
        ),
    );
    const updateTransferRequest = requests.map((request) =>
      this.database
        .update(schema.transferRequests)
        .set({ status: 'Pending' })
        .where(eq(schema.transferRequests.id, request.requestId)),
    );
    await Promise.all([...updateOfficePosition, ...updateTransferRequest]);
    console.log(`Updated ${requests.length} transfer requests.`);
  }
}
