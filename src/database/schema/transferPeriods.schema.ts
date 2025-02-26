import { integer, pgTable, serial, text, timestamp, varchar, boolean } from "drizzle-orm/pg-core";

export const transferPeriods = pgTable("transfer_periods", {
  id: serial("id").primaryKey(),
  round: integer("round").notNull(), 
  year: integer("year").notNull(), 
  startDate: timestamp("start_date").notNull(), 
  endDate: timestamp("end_date").notNull(),
  status: varchar("status", { length: 50 }).notNull(), 
  created_at: timestamp("created_at").defaultNow().notNull(), 
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});