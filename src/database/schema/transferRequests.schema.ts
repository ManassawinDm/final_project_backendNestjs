import { integer, pgTable, serial, text, timestamp, varchar, boolean, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { transferPeriods } from "./transferPeriods.schema";
import { mainOffices } from "./mainOffices.schema";
import { Positions } from "./class.schema";

export const transferStatusEnum = pgEnum("transfer_status", [
    "Pending",
    "Approved",
    "Rejected",
  ]);

  export const transferRequests = pgTable("transfer_requests", {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .references(() => users.id)
      .notNull(),
    officeId: integer("office_id")
      .notNull()
      .references(() => mainOffices.id),
    targetOfficeId: integer("target_office_id") // เปลี่ยนชื่อคอลัมน์เพื่อไม่ให้ซ้ำ
      .references(() => mainOffices.id),
    classId: integer("class_id") // เปลี่ยนชื่อคอลัมน์เพื่อไม่ให้ซ้ำ
      .notNull()
      .references(() => users.class), // อ้างอิงไปยังคอลัมน์ class ในตาราง users
    status: transferStatusEnum("status").default("Pending").notNull(),
    reason: text("reason"),
  });