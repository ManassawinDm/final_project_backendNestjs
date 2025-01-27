import { integer, pgTable, serial, text, timestamp, varchar, boolean, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { Positions } from "./class.schema";

export const transferStatusEnumResult = pgEnum("transfer_status", [
    "Pending",
    "Approved",
    "Rejected",
  ]);

export const transferResults = pgTable("transfer_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(), // ผู้ที่ได้รับการย้าย
  officeId: integer("office_id"), // สำนักงานที่ได้รับการย้าย
  status: transferStatusEnumResult("status").default("Pending").notNull(),
  class: integer("class").references(()=>Positions.id).notNull(), // ยศตำแหน่งของผู้ที่ได้รับการย้าย
});