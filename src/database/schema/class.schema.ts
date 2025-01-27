import { integer, pgTable, serial, text, timestamp, varchar, boolean } from "drizzle-orm/pg-core";

export const Positions = pgTable("position", {
  id: serial("id").primaryKey(),
  description:varchar("description", { length: 255 }).notNull(),
});