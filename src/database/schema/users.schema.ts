import { integer, pgTable, serial, text, timestamp, varchar, boolean } from "drizzle-orm/pg-core";
import { mainOffices } from "./mainOffices.schema";
import { Positions } from "./class.schema";


export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  seniority_number: integer("seniority_number").notNull(),
  firstname: varchar("firstname", { length: 255 }).notNull(),
  lastname: varchar("lastname", { length: 255 }).notNull(),
  class: integer("class").references(()=> Positions.id).notNull(), 
  departmentId: integer("department_id").references(() => mainOffices.id),
  positionDescription: varchar("position_description", { length: 255 }).notNull(), 
});

