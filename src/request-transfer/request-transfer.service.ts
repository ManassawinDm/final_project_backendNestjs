import { JwtService } from '@nestjs/jwt';
import { Inject, Injectable } from '@nestjs/common';
import * as schema from '../database/schema/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZEL } from 'src/database/database.module';
import {
  and,
  asc,
  count,
  countDistinct,
  eq,
  gt,
  inArray,
  sql,
} from 'drizzle-orm';

interface IrejectUser {
  userId: number;
  requestId: number;
  latitude: string;
  longitude: string;
  departmentId: number | null;

  reason: (string | null)[];
}

@Injectable()
export class RequestTransferService {
  constructor(
    @Inject(DRIZZEL)
    private readonly database: NodePgDatabase<typeof schema>,
    private readonly jwtService: JwtService,
  ) {}

  async fetchAll() {
    const processedResult = await this.database
      .select({
        description: schema.Positions.description,
        usersAll: countDistinct(schema.users.id).as('usersAll'),
        usersRequest: countDistinct(schema.transferRequests.userId).as(
          'usersRequest',
        ),
        usersRemaining: countDistinct(schema.users.id).as('usersRemaining'),
        officeAll: countDistinct(schema.officePositions.id).as('officeAll'),
        usersApprove: countDistinct(
          sql`CASE WHEN ${schema.transferRequests.status} = 'Approved' THEN 1 END`,
        ).as('usersApprove'),
        usersReject: countDistinct(
          sql`CASE WHEN ${schema.transferRequests.status} = 'Rejected' THEN 1 END`,
        ).as('usersReject'),
      })
      .from(schema.Positions)
      .leftJoin(schema.users, eq(schema.users.class, schema.Positions.id))
      .leftJoin(
        schema.transferRequests,
        eq(schema.transferRequests.userId, schema.users.id),
      )
      .leftJoin(
        schema.officePositions,
        eq(schema.officePositions.class, schema.Positions.id),
      )
      .where(gt(schema.officePositions.quantity, 0))
      .groupBy(schema.Positions.id, schema.Positions.description);

    const result = processedResult.map((row) => ({
      ...row,
      combinedField: `${row.usersApprove} / ${row.usersReject} / ${row.officeAll}`,
    }));

    return {
      result,
    };
  }

  async usersRequest() {
    const result = await this.database
      .selectDistinct({
        id: schema.users.id,
        fullname: sql`${schema.users.firstname} || ' ' || ${schema.users.lastname}`,
        officeName: schema.mainOffices.name,
        class: schema.Positions.description,
      })
      .from(schema.transferRequests)
      .innerJoin(
        schema.users,
        eq(schema.transferRequests.userId, schema.users.id),
      )
      .innerJoin(
        schema.mainOffices,
        eq(schema.mainOffices.id, schema.users.departmentId),
      )
      .innerJoin(schema.Positions, eq(schema.Positions.id, schema.users.class))
      .orderBy(schema.users.id);

    return {
      result,
    };
  }

  async processTransfers() {
    const approvedList = new Set();
    const officeQualityMap = new Map();
    const rejectList: IrejectUser[] = [];

    const requests = await this.database
      .select({
        userId: schema.transferRequests.userId,
        firstName: schema.users.firstname,
        lastName: schema.users.lastname,
        department: schema.users.departmentId,
        requestId: schema.transferRequests.id,
        officeId: schema.transferRequests.officeId,
        officeName: schema.mainOffices.name,
        latitude: schema.mainOffices.latitude,
        longitude: schema.mainOffices.longitude,
        class: schema.officePositions.class,
        reason: schema.transferRequests.reason,
        quantityId: schema.officePositions.id,
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
      .where(eq(schema.transferRequests.status, 'Pending'))
      .orderBy(asc(schema.transferRequests.id));

    const sortedRequests = requests.sort((a, b) => a.userId - b.userId);

    const groupedRequests = sortedRequests.reduce(
      (acc, request) => {
        if (!acc[request.userId]) {
          acc[request.userId] = [];
        }
        acc[request.userId].push(request);
        return acc;
      },
      {} as Record<number, typeof requests>
    );

    for (const userId in groupedRequests) {
      const userRequests = groupedRequests[userId];

      if (approvedList.has(Number(userId))) continue;

      let i = 0;
      let isApproved = false;

      for (const request of userRequests) {
        i++;

        const currentQuantity = officeQualityMap.has(request.quantityId)
          ? officeQualityMap.get(request.quantityId)
          : request.quantity;

        if (currentQuantity > 0) {
          approvedList.add({
            userId: request.userId,
            officeId: request.officeId,
            requestId: request.requestId,
            priority: i,
          });
          officeQualityMap.set(
            request.quantityId,
            Math.max(0, currentQuantity - 1),
          );

          isApproved = true;
          break;
        }
      }
      if (!isApproved) {
        rejectList.push({
          userId: Number(userId),
          requestId: userRequests[0].requestId,
          departmentId:userRequests[0].department,
          latitude: userRequests[0].latitude,
          longitude: userRequests[0].longitude,
          reason: userRequests.map((req) => req.reason),
        });
      }
    }







    



    // const officeQualityArray = Array.from(officeQualityMap.entries());
    // const approvedArray = Array.from(approvedList) as {
    //   userId: number;
    //   officeId: number;
    //   requestId: number;
    //   priority: number;
    // }[];

    // const requestUpdates = approvedArray.map((approval) => ({
    //   requestId: approval.requestId,
    //   officeId: approval.officeId,
    // }));

    // const positionUpdates = officeQualityArray.map(
    //   ([quantityId, newQuantity]) => ({
    //     quantityId,
    //     newQuantity,
    //   }),
    // );

    // const updateTransferRequests = async () => {
    //   const requestIds = requestUpdates.map((r) => r.requestId);

    //   await this.database
    //     .update(schema.transferRequests)
    //     .set({
    //       status: 'Approved',
    //     })
    //     .where(inArray(schema.transferRequests.id, requestIds));

    //   await Promise.all(
    //     requestUpdates.map(async (approval) => {
    //       await this.database
    //         .update(schema.transferRequests)
    //         .set({
    //           targetOfficeId: approval.officeId,
    //         })
    //         .where(eq(schema.transferRequests.id, approval.requestId));
    //     }),
    //   );
    // };

    // const updateOfficePositions = async () => {
    //   const quantityIds = positionUpdates.map((p) => p.quantityId);
    //   await Promise.all(
    //     positionUpdates.map(async ({ quantityId, newQuantity }) => {
    //       await this.database
    //         .update(schema.officePositions)
    //         .set({ quantity: newQuantity })
    //         .where(eq(schema.officePositions.id, quantityId));
    //     }),
    //   );
    // };
    // const rejectArray = Array.from(rejectList) as {
    //   userId: number;
    //   requestId: number;
    //   departmentId: number;
    //   latitude: string;
    //   longitude: string;
    //   reason: string[];
    // }[];
    
    // // ฟังก์ชันอัปเดต users_reject
    // const updateUsersReject = async () => {
    //   await Promise.all(
    //     rejectArray.map(async (reject) => {
    //       await this.database
    //         .insert(schema.usersReject)
    //         .values({
    //           userId: reject.userId,
    //           experience: reject.departmentId.toString(),
    //           latitude: reject.latitude,
    //           longitude: reject.longitude,
    //           requestId: reject.requestId,
    //           ai_keyword: reject.reason.join(','), 
    //           sick: '', 
    //           spouse: '', 
    //           score: null, 
    //         });
    //     })
    //   );
    // };

    // await Promise.all([
    //   updateTransferRequests(),
    //   updateOfficePositions(),
    //   updateUsersReject(),
    // ]);

    // const apiResponse = await apiModelPython('http://localhost:5001/transfer-reasons', {
    //   rejectList,
    // });
    // const updates = apiResponse.map((response) => ({
    //   userId: response.userId,
    //   sick: response.health ? 'true' : 'false', 
    //   spouse: response.couple ? 'true' : 'false',
    // }));
    // await Promise.all(
    //   updates.map(async (update) => {
    //     await this.database
    //       .update(schema.usersReject)
    //       .set({
    //         sick: update.sick,
    //         spouse: update.spouse,
    //       })
    //       .where(eq(schema.usersReject.userId, update.userId));
    //   })
    // )
    console.log('approvedList', approvedList);
    console.log('officeQualityMap', officeQualityMap);
    console.log('rejectList', rejectList);


    
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
        .set({ status: 'Pending' ,targetOfficeId:null})
        .where(eq(schema.transferRequests.id, request.requestId)),
    );
    await Promise.all([...updateOfficePosition, ...updateTransferRequest]);
    console.log(`Updated ${requests.length} transfer requests.`);
  }
}

async function apiModelPython(url: string, data: object) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error(`Failed: ${response.statusText}`);

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
  }
}
