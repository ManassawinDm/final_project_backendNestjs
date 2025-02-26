import { JwtService } from '@nestjs/jwt';
import { Inject, Injectable } from '@nestjs/common';
import * as schema from '../database/schema/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZEL } from 'src/database/database.module';
import axios from 'axios';
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
import { ProccessDto } from './dto/proccess.dto';
import { ConfigService } from '@nestjs/config';
import { ConfirmOfficeDto } from './dto/confirmOffice.dto';

interface IAppovedUserAi {
  userId: number;
  requestId: number;
  reason: (string | null)[];
}

interface ITransferRequest {
  userId: number;
  seniority_number: number;
  firstName: string;
  lastName: string;
  userOfficeId: number | null;
  requestId: number;
  officeId: number;
  officeName: string;
  latitude: string;
  longitude: string;
  class: number;
  reason: string | null;
  quantityId: number;
  quantity: number;
}

interface IApprovedUser {
  userId: number;
  officeId: number;
  requestId: number;
  priority: number;
  reason: string | null;
}

interface IRejectUser {
  userId: number;
  class: number;
  requestId: number;
  departmentId: number | null;
  latitude: string;
  longitude: string;
  reason: (string | null)[];
}

interface IApprovedUserAi {
  userId: number;
  requestId: number;
  reason: (string | null)[];
}

interface ITransferPrediction {
  userId: number;
  couple: boolean;
  health: boolean;
  experience: any[];
  ner_results: INerResult[];
}

interface INerResult {
  index: number;
  reason: string;
  tags: string[];
}

interface IRejectedUserData {
  userId: number;
  seniority_number: number;
  latitude: string;
  longitude: string;
  experience: number;
  aiKeyword: string;
  sick: string;
  spouse: string;
  class: number;
  score: string | null;
}

@Injectable()
export class RequestTransferService {
  constructor(
    @Inject(DRIZZEL)
    private readonly database: NodePgDatabase<typeof schema>,
    private readonly configService: ConfigService,
  ) {}

  async fetchAll() {
    const processedResult = await this.database
      .select({
        classId: schema.Positions.id,
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
      // .where(gt(schema.officePositions.quantity, 0))
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

  async resultProcessTransfers(classId: number) {
    const targetMainOffices = this.database
      .select({
        id: schema.mainOffices.id,
        name: schema.mainOffices.name,
      })
      .from(schema.mainOffices)
      .as('targetMainOffices');

    const currenOffices = this.database
      .select({
        id: schema.mainOffices.id,
        name: schema.mainOffices.name,
      })
      .from(schema.mainOffices)
      .as('currenOffices');

    const currenPosition = this.database
      .select({
        id: schema.Positions.id,
        description: schema.Positions.description,
      })
      .from(schema.Positions)
      .as('currenPosition');

    const result = await this.database
      .select({
        requestId: schema.transferRequests.id,
        userId: schema.transferRequests.userId,
        name: sql<string>`CONCAT(${schema.users.firstname}, ' ', ${schema.users.lastname})`,
        class: schema.users.class,
        currenClassId: currenPosition.id,
        currenClass: currenPosition.description,
        className: schema.Positions.description,
        officeId: currenOffices.id,
        officeName: currenOffices.name,
        priority:schema.transferRequests.priority,
        targetOffice: schema.transferRequests.targetOfficeId,
        targetOfficeName: targetMainOffices.name,
        sick: schema.transferRequests.sick,
        spouse: schema.transferRequests.spouse,
        civil: schema.usersReject.civil,
        criminal: schema.usersReject.criminal,
        administrative: schema.usersReject.administrative,
        narcotics: schema.usersReject.narcotics,
        general: schema.usersReject.general,
        status: schema.transferRequests.status,
      })
      .from(schema.transferRequests)
      .innerJoin(
        schema.users,
        eq(schema.users.id, schema.transferRequests.userId),
      )
      .innerJoin(
        schema.mainOffices,
        eq(schema.mainOffices.id, schema.transferRequests.officeId),
      )
      .innerJoin(
        schema.Positions,
        eq(schema.Positions.id, schema.transferRequests.classId),
      )
      .leftJoin(
        schema.usersReject,
        eq(schema.usersReject.id, schema.transferRequests.id),
      )
      .leftJoin(
        targetMainOffices,
        eq(targetMainOffices.id, schema.transferRequests.targetOfficeId),
      )
      .leftJoin(
        currenOffices,
        eq(currenOffices.id, schema.users.departmentId),
      )
      .leftJoin(currenPosition, eq(currenPosition.id, schema.users.class))
      .where(
        and(
          inArray(schema.transferRequests.status, ['Approved', 'Rejected']),
          eq(schema.transferRequests.classId, classId),
        ),
      )
      .orderBy(asc(schema.users.id));

    const formattedResult = result.map((row) => {
      const tags: string[] = [];

      if (row.sick === 'true') tags.push('sick');
      if (row.spouse === 'true') tags.push('spouse');
      if (row.civil === 'true') tags.push('civil');
      if (row.criminal === 'true') tags.push('criminal');
      if (row.administrative === 'true') tags.push('administrative');
      if (row.narcotics === 'true') tags.push('narcotics');
      if (row.general === 'true') tags.push('general');

      return {
        requestId: row.requestId,
        userId: row.userId,
        name: row.name,
        class: row.class,
        currenClassId: row.currenClassId,
        currenClass: row.currenClass,
        className: row.className,
        officeId: row.officeId,
        officeName: row.officeName,
        priority: row.priority,
        targetOffice: row.targetOffice,
        targetOfficeName: row.targetOfficeName,
        status: row.status,
        tags,
      };
    });

    return formattedResult;
  }

  async resultViewOfficeProcessTransfers(classId: number) {
    const result = await this.database
    .select({
      id:schema.competitors.id,
      office_id:schema.competitors.officeId,
      office_name:schema.mainOffices.name,
      user_id:schema.competitors.userId,
      user_name:sql<string>`CONCAT(${schema.users.firstname}, ' ', ${schema.users.lastname})`,
      class_id:schema.competitors.classId,
      class_name:schema.Positions.description,
      winner:schema.competitors.winner,
      score:schema.competitors.score,
    })
    .from(schema.competitors)
    .innerJoin(
      schema.mainOffices,
      eq(schema.competitors.officeId, schema.mainOffices.id),
    )
    .innerJoin(
      schema.users,
      eq(schema.competitors.userId, schema.users.id),
    )
    .innerJoin(
      schema.Positions,
      eq(schema.competitors.classId, schema.Positions.id),
    )
    .where(eq(schema.competitors.classId,classId))
    
    const groupedResult = result.reduce((acc, row) => {
      let office = acc.find((o) => o.office_id === row.office_id);
    
      if (!office) {
        office = {
          office_id: row.office_id,
          office_name: row.office_name,
          class_id: row.class_id,
          class_name: row.class_name,
          users: [],
        };
        acc.push(office);
      }
      office.users.push({
        user_id: row.user_id,
        user_name: row.user_name.trim(), 
        winner: row.winner,
        score: row.score,
      });
    
      return acc;
    }, [] as Array<{ office_id: number; office_name: string; class_id: number; class_name: string; users: any[] }>);
    
    return {
      groupedResult,
    };
    
  }

  async ComfirmTargetOffice(data: ConfirmOfficeDto) {
    const { requestId, classId, officeId } = data;

    await this.database
      .update(schema.transferRequests)
      .set({
        status: "Approved",
      })
      .where(eq(schema.transferRequests.id, requestId));

    const getofficePositionId = await this.database
      .select({
        officePositionId: schema.officePositions.id,
        quantity: schema.officePositions.quantity,
      })
      .from(schema.officePositions)
      .innerJoin(schema.mainOffices, eq(schema.mainOffices.id, schema.officePositions.officeId))
      .innerJoin(schema.Positions, eq(schema.Positions.id, schema.officePositions.class))
      .where(
        and(eq(schema.mainOffices.id, officeId), eq(schema.Positions.id, classId))
      );

    await Promise.all(
      getofficePositionId.map((id) =>
        this.database
          .update(schema.officePositions)
          .set({
            quantity: id.quantity - 1, 
          })
          .where(eq(schema.officePositions.id, id.officePositionId))
      )
    );

  }

  async processTransfers(data: ProccessDto) {
    const { classId } = data;
    const approvedList = new Set<IApprovedUser>();
    const officeQualityMap = new Map();
    const rejectList: IRejectUser[] = [];
    const approvedListForAi: IAppovedUserAi[] = [];
    const apiBaseUrl = this.configService.get<string>('PYTHON_API_BASE_URL');

    const requests = await this.database
      .select({
        userId: schema.transferRequests.userId,
        seniority_number: schema.users.seniority_number,
        firstName: schema.users.firstname,
        lastName: schema.users.lastname,
        userOfficeId: schema.users.departmentId,
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
      .where(
        and(
          eq(schema.transferRequests.status, 'Pending'),
          eq(schema.transferRequests.classId, classId),
        ),
      )
      .orderBy(asc(schema.transferRequests.id));

    const sortedRequests = requests.sort(
      (a, b) => a.seniority_number - b.seniority_number,
    );

    const groupedRequests = this.makeGroupRequestsByUser(sortedRequests);

    this.processUserRequests(
      groupedRequests,
      approvedList,
      officeQualityMap,
      rejectList,
      approvedListForAi,
    );

    // **ส่งข้อมูลคนที่โยกย้ายสำเร็จไปตรวจสุขภาพและคู่สมรส**
    const apiPythonApprovedPredict = await apiModelPython(
      `${apiBaseUrl}/transfer-reasons`,
      { approvedListForAi },
    );

    //**อัปเดตข้อมูลสุขภาพและคู่สมรสของคนที่โยกย้ายสำเร็จ**
    await this.updateForPythonApprovedPredict(apiPythonApprovedPredict);

    // อัปเดตสถานะเป็น "Approved"
    await this.updateStatusApprovedRequests(approvedList);

    // อัปเดต targetOfficeId ใน transferRequests
    await this.updateTargetOfficeUserApproved(approvedList);

    // อัปเดตจำนวนตำแหน่งใน officePositions
    await this.updateOfficePositions(officeQualityMap);

    // **บันทึกข้อมูลคนที่ถูกปฏิเสธไปยัง `usersReject`**
    await this.saveRejectedRequests(rejectList);

    // **ส่งข้อมูลคนที่โยกย้ายไม่สำเร็จไปตรวจสุขภาพและคู่สมรส**
    const apiPythonRejectPredict = await apiModelPython(
      `${apiBaseUrl}/transfer-reasons`,
      { rejectList },
    );

    // **อัปเดตข้อมูลคนที่โยกย้ายไม่สำเร็จไปตรวจสุขภาพและคู่สมรส**
    await this.updateForPythonRejectPredict(apiPythonRejectPredict);

    // สำนักงานที่ลอยทั้งหมด
    const filterDepartments = await this.database
      .select({
        officeId: schema.officePositions.officeId,
        // officeName: schema.mainOffices.name,
        // class: schema.officePositions.class,
        latitude: schema.mainOffices.latitude,
        longitude: schema.mainOffices.longitude,
        quality: schema.officePositions.quantity,
      })
      .from(schema.officePositions)
      .innerJoin(
        schema.mainOffices,
        eq(schema.mainOffices.id, schema.officePositions.officeId),
      )
      .where(
        and(
          gt(schema.officePositions.quantity, 0),
          eq(schema.officePositions.class, classId),
        ),
      );

    // ผู้ใช้ที่ลอยทั้งหมด
    const usersRejectData = await this.database
      .select({
        userId: schema.usersReject.userId,
        seniority_number: schema.users.seniority_number,
        latitude: schema.usersReject.latitude,
        longitude: schema.usersReject.longitude,
        experience: schema.usersReject.experience,
        aiKeyword: schema.usersReject.ai_keyword,
        sick: schema.usersReject.sick,
        spouse: schema.usersReject.spouse,
        class: schema.usersReject.class,
        score: schema.usersReject.score,
        requestId: schema.usersReject.requestId,
        Periods: schema.transferRequests.transferPeriods,
      })
      .from(schema.usersReject)
      .innerJoin(schema.users, eq(schema.users.id, schema.usersReject.userId))
      .innerJoin(
        schema.transferRequests,
        eq(schema.transferRequests.id, schema.usersReject.requestId),
      )
      .orderBy(schema.users.seniority_number);

    const distanceMap = new Map<string, number>();
    const ranking: {
      userId: number;
      requestId: number;
      office: number;
      classId: number;
      score: number;
      quantity: number;
      Periods: number | null;
    }[] = [];
    const maxSeniority = Math.max(
      ...usersRejectData.map((u) => u.seniority_number),
    );
    const minSeniority = Math.min(
      ...usersRejectData.map((u) => u.seniority_number),
    );

    for (const user of usersRejectData) {
      const p1_lng = user.longitude;
      const p1_lat = user.latitude;

      for (const office of filterDepartments) {
        const p2_lng = office.longitude;
        const p2_lat = office.latitude;

        const key = `${p1_lng},${p1_lat},${p2_lng},${p2_lat}`;

        let distance = 0;

        if (distanceMap.has(key)) {
          distance = distanceMap.get(key) ?? 0;
          // console.log('cached', distance);
        } else {
          const result = await axios.get(
            `http://localhost:5000/route/v1/driving/${p1_lng},${p1_lat};${p2_lng},${p2_lat}?overview=false`,
          );

          distance = result.data.routes[0].distance / 1000;
          distanceMap.set(key, distance);
        }
        const score = this.calculateScore(
          distance,
          user,
          maxSeniority,
          minSeniority,
        );
        ranking.push({
          userId: user.userId,
          requestId: user.requestId,
          office: office.officeId,
          classId: user.class,
          quantity: office.quality,
          score: score,
          Periods: user.Periods,
        });
      }
    }

    const groupedRanking = this.groupRanking(ranking);

    Object.keys(groupedRanking).forEach((officeId) => {
      groupedRanking[Number(officeId)].users.sort((a, b) => b.score - a.score);
    });

    const finalAssignment: {
      userId: number;
      requestId: number;
      officeId: number;
      classId: number;
      score: number;
      Periods: number | null;
    }[] = [];
    const competitorLog: Record<
      number,
      { userId: number; score: number; winner: string; classId: number }[]
    > = {};

    const officeCapacities = Object.fromEntries(
      Object.entries(groupedRanking).map(([officeId, { quantity }]) => [
        Number(officeId),
        quantity,
      ]),
    );

    const userMaxScores = this.extractUserMaxScores(groupedRanking);
    // userMaxScores.map((i)=>{
    //   console.log("beforSort",i)
    // })

    userMaxScores.forEach((user) => {
      user.officeScores.sort((a, b) => b.score - a.score);
    });
    // userMaxScores.map((i)=>{
    //   console.log("AffterSort",i)
    // })
    const unassignedUsers = new Set(userMaxScores.map((u) => u.userId));

    for (const { userId, officeScores } of userMaxScores) {
      for (const {
        officeId,
        score,
        classId,
        requestId,
        Periods,
      } of officeScores) {
        // console.log("Befor",userId,officeId)
        // console.log("--------------------------------------------------------------------")
        if (officeCapacities[officeId] > 0) {
          // console.log("Atfer \n",userId,officeId)
          competitorLog[officeId] = this.generateCompetitorLog(
            userMaxScores,
            officeId,
            unassignedUsers,
          );
          finalAssignment.push({
            userId,
            officeId,
            classId,
            score,
            requestId,
            Periods,
          });
          officeCapacities[officeId]--;
          unassignedUsers.delete(userId);
          competitorLog[officeId] = competitorLog[officeId].map((c) =>
            c.userId === userId ? { ...c, winner: 'true' } : c,
          );
          break;
        }
      }
    }

    const competitorData = this.formatCompetitorData(competitorLog);

    await this.database.insert(schema.competitors).values(
      competitorData.map(({ classId, officeId, score, userId, winner }) => ({
        classId,
        officeId,
        score: score.toString(),
        userId,
        winner,
      })),
    );

    await Promise.all(
      finalAssignment.map(async (assignment) => {
        await this.updateUsersReject(assignment);
        await this.updateTransferRequests(assignment);
      }),
    );

    // แสดงผลลัพธ์
    // console.log('\n🎯 Final Assignment:');
    // console.log(finalAssignment);

    // console.log('\n📌 Competitor Log:');
    // console.log(competitorLog);

    // console.log('approvedList', approvedList);
    // console.log('officeQualityMap', officeQualityMap);
    // console.log('rejectList', rejectList);

    return {
      success: true,
      message: 'Transfer processing completed successfully.',
    };
  }

  async deleteProccess(data: ProccessDto) {
    const { classId } = data;
    const requests = await this.database
      .select({
        requestId: schema.transferRequests.id,
        userId: schema.transferRequests.userId,
        class: schema.users.class,
        officeId: schema.transferRequests.targetOfficeId,
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
          eq(schema.officePositions.class, schema.transferRequests.classId),
        ),
      )
      .where(
        and(
          inArray(schema.transferRequests.status, ['Approved', 'Rejected']),
          eq(schema.transferRequests.classId, classId),
        ),
      );

    if (requests.length === 0) return;

    await this.database
      .delete(schema.usersReject)
      .where(eq(schema.usersReject.class, classId));

    await this.database
      .delete(schema.competitors)
      .where(eq(schema.competitors.classId, classId));

    const approvedRequests = requests.filter(
      (request) => request.status === 'Approved',
    );

  const updateOfficePosition = approvedRequests
  .filter((request) => request.officeId !== null) 
  .map((request) =>
    this.database
      .update(schema.officePositions)
      .set({ quantity: request.quantity + 1 })
      .where(
        and(
          eq(schema.officePositions.class, request.class),
          eq(schema.officePositions.officeId, request.officeId as number), 
        ),
      ),
  );

    const updateTransferRequest = requests.map((request) =>
      this.database
        .update(schema.transferRequests)
        .set({ status: 'Pending', targetOfficeId: null ,priority:null})
        .where(eq(schema.transferRequests.id, request.requestId)),
    );
    await Promise.all([...updateOfficePosition, ...updateTransferRequest]);
    console.log(`Updated ${requests.length} transfer requests.`);

    return {
      success: true,
      message: 'Delete successfully.',
    };
  }

  async test(): Promise<{ data: string }> {
    const result = await this.database
      .select({
        id: schema.mainOffices.id,
        area: schema.mainOffices.area,
        latitude: schema.mainOffices.latitude,
        longitude: schema.mainOffices.longitude,
      })
      .from(schema.mainOffices)
      .where(
        sql`${schema.mainOffices.id} IN (
        SELECT MIN(${schema.mainOffices.id}) 
        FROM ${schema.mainOffices} 
        GROUP BY ${schema.mainOffices.area}
      )`,
      )
      .limit(3)
      .execute();
    console.log(result);

    const BATCH_SIZE = 50; // ปรับตาม Limit ของ API
    const requests: Promise<void>[] = [];

    // สร้าง locations list
    const locations = result
      .map((row) => `${row.longitude},${row.latitude}`)
      .join(';');

    for (let i = 0; i < result.length; i += BATCH_SIZE) {
      for (let j = 0; j < result.length; j += BATCH_SIZE) {
        const sources = Array.from(
          { length: Math.min(BATCH_SIZE, result.length - i) },
          (_, k) => i + k,
        ).join(';');

        const destinations = Array.from(
          { length: Math.min(BATCH_SIZE, result.length - j) },
          (_, k) => j + k,
        ).join(';');

        console.log(`sources: ${sources}`);
        console.log(`destinations: ${destinations}`);

        requests.push(
          axios
            .get(
              `http://localhost:5000/table/v1/driving/${locations}?sources=${sources}&destinations=${destinations}`,
            )
            .then((res) => {
              console.log(res.data);
            })
            .catch((err) => {
              console.error(
                'Error fetching batch:',
                err.response?.data || err.message,
              );
            }),
        );
      }
    }

    await Promise.all(requests);
    return { data: 'null' };
  }

  private makeGroupRequestsByUser(
    requests: ITransferRequest[],
  ): Record<number, ITransferRequest[]> {
    return requests.reduce(
      (acc, request) => {
        if (!acc[request.userId]) {
          acc[request.userId] = [];
        }
        acc[request.userId].push(request);
        return acc;
      },
      {} as Record<number, ITransferRequest[]>,
    );
  }

  private async updateForPythonApprovedPredict(
    predictions: ITransferPrediction[],
  ): Promise<void> {
    const updates = predictions.map((response) => ({
      userId: response.userId,
      sick: response.health ? 'true' : 'false',
      spouse: response.couple ? 'true' : 'false',
    }));

    await Promise.all(
      updates.map(async (update) => {
        await this.database
          .update(schema.transferRequests)
          .set({
            sick: update.sick,
            spouse: update.spouse,
          })
          .where(eq(schema.transferRequests.userId, update.userId));
      }),
    );
  }

  private processUserRequests(
    makeGroupedRequests: Record<number, ITransferRequest[]>,
    approvedList: Set<IApprovedUser>,
    officeQualityMap: Map<number, number>,
    rejectList: IRejectUser[],
    approvedListForAi: IApprovedUserAi[],
  ): void {
    for (const userId in makeGroupedRequests) {
      const userRequests = makeGroupedRequests[userId];

      if (approvedList.has({ userId: Number(userId) } as IApprovedUser))
        continue;

      let i = 0;
      let isApproved = false;

      for (const request of userRequests) {
        i++;

        const currentQuantity =
          officeQualityMap.get(request.quantityId) ?? request.quantity;

        if (currentQuantity > 0) {
          approvedList.add({
            userId: request.userId,
            officeId: request.officeId,
            requestId: request.requestId,
            priority: i,
            reason: request.reason,
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
          class: userRequests[0].class,
          requestId: userRequests[0].requestId,
          departmentId: userRequests[0].userOfficeId,
          latitude: userRequests[0].latitude,
          longitude: userRequests[0].longitude,
          reason: userRequests.map((req) => req.reason),
        });
      } else {
        approvedListForAi.push({
          userId: Number(userId),
          requestId: userRequests[0].requestId,
          reason: userRequests.map((req) => req.reason),
        });
      }
    }
  }

  private async updateStatusApprovedRequests(
    approvedList: Set<IApprovedUser>,
  ): Promise<void> {
    const approvedArray = Array.from(approvedList) as {
      userId: number;
      officeId: number;
      requestId: number;
      priority: number;
    }[];

    const requestUpdates = approvedArray.map((approval) => approval.requestId);

    await this.database
      .update(schema.transferRequests)
      .set({ status: 'Approved' })
      .where(inArray(schema.transferRequests.id, requestUpdates));
  }

  private async updateTargetOfficeUserApproved(
    approvedList: Set<IApprovedUser>,
  ): Promise<void> {
    const approvedArray = Array.from(approvedList) as {
      userId: number;
      officeId: number;
      requestId: number;
      priority: number;
    }[];

    await Promise.all(
      approvedArray.map(async (approval) => {
        await this.database
          .update(schema.transferRequests)
          .set({
            targetOfficeId: approval.officeId,
            priority: approval.priority,
          })
          .where(eq(schema.transferRequests.id, approval.requestId));
      }),
    );
  }
  private async updateOfficePositions(
    officeQualityMap: Map<number, number>,
  ): Promise<void> {
    const officeQualityArray = Array.from(officeQualityMap.entries());
    const positionUpdates = officeQualityArray.map(
      ([quantityId, newQuantity]) => ({
        quantityId,
        newQuantity,
      }),
    );

    await Promise.all(
      positionUpdates.map(async ({ quantityId, newQuantity }) => {
        await this.database
          .update(schema.officePositions)
          .set({ quantity: newQuantity })
          .where(eq(schema.officePositions.id, quantityId));
      }),
    );
  }

  private async saveRejectedRequests(rejectList: IRejectUser[]): Promise<void> {
    const rejectArray = Array.from(rejectList) as {
      userId: number;
      class: number;
      requestId: number;
      departmentId: number;
      latitude: string;
      longitude: string;
      reason: string[];
    }[];

    await Promise.all(
      rejectArray.map(async (reject) => {
        await this.database.insert(schema.usersReject).values({
          userId: reject.userId,
          class: reject.class,
          experience: reject.departmentId,
          latitude: reject.latitude,
          longitude: reject.longitude,
          requestId: reject.requestId,
          ai_keyword: reject.reason.join(','),
          civil: '',
          criminal: '',
          administrative: '',
          narcotics: '',
          general: '',
          sick: '',
          spouse: '',
          score: null,
        });
      }),
    );
  }

  private async updateForPythonRejectPredict(
    predictions: ITransferPrediction[],
  ): Promise<void> {
    const updates = predictions.map((response) => ({
      userId: response.userId,
      sick: response.health ? 'true' : 'false',
      spouse: response.couple ? 'true' : 'false',
    }));

    await Promise.all(
      updates.map(async (update) => {
        await this.database
          .update(schema.usersReject)
          .set({
            sick: update.sick,
            spouse: update.spouse,
          })
          .where(eq(schema.usersReject.userId, update.userId));
      }),
    );
  }

  private calculateScore(
    distance: number,
    user: IRejectedUserData,
    maxSeniority: number,
    minSeniority: number,
  ): number {
    const distanceWeight = 0.35;
    const seniorityWeight = 0.45;
    const sickWeight = 0.05;
    const spouseWeight = 0.05;
    const aiKeywordWeight = 0.1;

    const distanceScore =
      distance <= 50
        ? 100
        : distance <= 500
          ? (100 * (500 - distance)) / 450
          : 0;

    const seniorityScore =
      minSeniority === maxSeniority
        ? 0
        : ((maxSeniority - user.seniority_number) /
            (maxSeniority - minSeniority)) *
          100;

    const sickScore = user.sick === 'true' ? 100 : 0;
    const spouseScore = user.spouse === 'true' ? 100 : 0;
    const aiKeywordScore = Math.min(user.aiKeyword.split(',').length * 10, 100);

    const totalScore =
      distanceScore * distanceWeight +
      seniorityScore * seniorityWeight +
      sickScore * sickWeight +
      spouseScore * spouseWeight +
      aiKeywordScore * aiKeywordWeight;

    return parseFloat(totalScore.toFixed(2));
  }

  private groupRanking(
    ranking: {
      userId: number;
      office: number;
      requestId: number;
      score: number;
      quantity: number;
      classId: number;
      Periods: number | null;
    }[],
  ): Record<
    number,
    {
      quantity: number;
      users: {
        userId: number;
        classId: number;
        score: number;
        requestId: number;
        Periods: number | null;
      }[];
    }
  > {
    return ranking.reduce(
      (
        acc,
        { userId, office, score, quantity, classId, requestId, Periods },
      ) => {
        if (!acc[office]) {
          acc[office] = { quantity: quantity, users: [] };
        }
        acc[office].users.push({ userId, score, classId, requestId, Periods });
        return acc;
      },
      {} as Record<
        number,
        {
          quantity: number;
          users: {
            userId: number;
            classId: number;
            score: number;
            requestId: number;
            Periods: number | null;
          }[];
        }
      >,
    );
  }

  private extractUserMaxScores(
    groupedRanking: Record<
      number,
      {
        users: {
          userId: number;
          classId: number;
          score: number;
          requestId: number;
          Periods: number | null;
        }[];
      }
    >,
  ): {
    userId: number;
    officeScores: {
      officeId: number;
      classId: number;
      score: number;
      requestId: number;
      Periods: number | null;
    }[];
  }[] {
    const userMaxScores: {
      userId: number;
      officeScores: {
        officeId: number;
        classId: number;
        score: number;
        requestId: number;
        Periods: number | null;
      }[];
    }[] = [];

    Object.entries(groupedRanking).forEach(([officeId, { users }]) => {
      users.forEach(({ userId, score, classId, requestId, Periods }) => {
        let userEntry = userMaxScores.find((u) => u.userId === userId);
        if (!userEntry) {
          userEntry = { userId, officeScores: [] };
          userMaxScores.push(userEntry);
        }
        userEntry.officeScores.push({
          officeId: Number(officeId),
          requestId: requestId,
          classId: classId,
          score,
          Periods: Periods,
        });
      });
    });

    return userMaxScores;
  }

  private generateCompetitorLog(
    userMaxScores: {
      userId: number;
      officeScores: { officeId: number; classId: number; score: number }[];
    }[],
    officeId: number,
    unassignedUsers: Set<number>,
  ): { userId: number; score: number; classId: number; winner: string }[] {
    return userMaxScores
      .filter((u) => unassignedUsers.has(u.userId))
      .map((u) => ({
        userId: u.userId,
        score:
          u.officeScores.find((os) => os.officeId === officeId)?.score || 0,
        classId:
          u.officeScores.find((os) => os.officeId === officeId)?.classId || 0,
        winner: 'false',
      }))
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  private formatCompetitorData(
    competitorLog: Record<
      number,
      { userId: number; score: number; winner: string; classId: number }[]
    >,
  ): {
    officeId: number;
    userId: number;
    classId: number;
    score: number;
    winner: string;
  }[] {
    return Object.entries(competitorLog).flatMap(([officeId, users]) =>
      users.map(({ userId, score, classId, winner }) => ({
        officeId: Number(officeId),
        userId,
        classId,
        score: Number(score.toFixed(2)),
        winner,
      })),
    );
  }

  private async updateUsersReject(assignment: {
    userId: number;
    score: number;
  }) {
    await this.database
      .update(schema.usersReject)
      .set({
        score: assignment.score.toString(),
      })
      .where(eq(schema.usersReject.userId, assignment.userId));
  }

  private async updateTransferRequests(assignment: {
    requestId: number;
    officeId: number;
  }) {
    await this.database
      .update(schema.transferRequests)
      .set({
        targetOfficeId: assignment.officeId,
        status: 'Rejected',
      })
      .where(eq(schema.transferRequests.id, assignment.requestId));
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
