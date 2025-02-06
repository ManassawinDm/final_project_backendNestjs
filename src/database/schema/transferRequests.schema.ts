import { integer, pgTable, serial, text, timestamp, varchar, boolean, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { mainOffices } from "./mainOffices.schema";
import { transferPeriods } from "./transferPeriods.schema";

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
    targetOfficeId: integer("target_office_id") 
      .references(() => mainOffices.id),
    classId: integer("class_id").notNull(),
    status: transferStatusEnum("status").default("Pending").notNull(),
    reason: text("reason"),
    transferPeriods : integer("transferPeriods").references(()=>transferPeriods.id).notNull(),
  });