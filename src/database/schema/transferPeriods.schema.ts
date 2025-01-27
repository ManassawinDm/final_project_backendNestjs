import { integer, pgTable, serial, text, timestamp, varchar, boolean } from "drizzle-orm/pg-core";

export const transferPeriods = pgTable("transfer_periods", {
  id: serial("id").primaryKey(),
  round: integer("round").notNull(), // รอบที่ (1-4)
  startDate: timestamp("start_date").notNull(), // วันที่เริ่มเปิด
  endDate: timestamp("end_date").notNull(), // วันที่ปิด
  status: varchar("status", { length: 50 }).notNull(), // open หรือ closed
});