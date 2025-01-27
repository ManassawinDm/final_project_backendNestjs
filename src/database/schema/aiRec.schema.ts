import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users.schema";

// ตาราง ai_recommendations
export const aiRecommendations = pgTable("ai_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(), // ผูกกับผู้ใช้
  officeId: integer("office_id").notNull(), // สำนักงานที่แนะนำ
  predictedReason: text("predicted_reason"), // เหตุผลที่ AI แนะนำให้ย้ายไปสำนักงานนี้
  createdAt: timestamp("created_at").defaultNow(), // วันที่สร้างคำแนะนำ
  updatedAt: timestamp("updated_at").defaultNow(), // วันที่อัพเดทคำแนะนำ
});
