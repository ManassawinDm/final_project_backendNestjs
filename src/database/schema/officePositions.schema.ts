import { integer, pgTable, serial, text, timestamp, varchar, boolean } from "drizzle-orm/pg-core";
import { mainOffices } from "./mainOffices.schema";
import { users } from "./users.schema";
import { Positions } from "./class.schema";

export const officePositions = pgTable("office_positions", {
  id: serial("id").primaryKey(),
  officeId: integer("office_id").notNull().references(()=>mainOffices.id), // ผูกกับสำนักงานหลักหรือย่อย
  class: integer("class").notNull().references(()=>Positions.id), // ยศที่ต้องการ (1-8)
  quantity: integer("quantity").default(0).notNull(), // จำนวนตำแหน่งที่รับ
});