import { integer, pgTable, serial, text, timestamp, varchar, boolean } from "drizzle-orm/pg-core";
import { transferPeriods } from "./transferPeriods.schema";

export const Report = pgTable("report_result", {
  id: serial("id").primaryKey(),
  seniority_number: integer("seniority_number").notNull(),
  firstname: varchar("firstname", { length: 255 }).notNull(),
  lastname: varchar("lastname", { length: 255 }).notNull(),
  class: varchar("class", { length: 255 }).notNull(),
  current_office: varchar("current_office", { length: 255 }).notNull(),
  target_office: varchar("target_office", { length: 255 }).notNull(),
  current_class: varchar("current_class", { length: 255 }).notNull(),
  target_class: varchar("target_class", { length: 255 }).notNull(),
  reason: varchar("reason", { length: 255 }).notNull(),
  year_id:integer("year_id").references(()=>transferPeriods.id).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(), 
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});