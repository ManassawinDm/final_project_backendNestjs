import { integer, pgTable, serial, text, timestamp, varchar, boolean } from "drizzle-orm/pg-core";
import { mainOffices } from "./mainOffices.schema";
import { Positions } from "./class.schema";


export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firstname: varchar("firstname", { length: 255 }),
  lastname: varchar("lastname", { length: 255 }),
  class: integer("class").references(()=> Positions.id).notNull(), 
  departmentId: integer("department_id").references(() => mainOffices.id),
  position: varchar("position", { length: 255 }), 
});

