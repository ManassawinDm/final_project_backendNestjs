import { integer, pgTable, serial, text, timestamp, varchar, boolean } from "drizzle-orm/pg-core";
import { users } from "./users.schema";

export const refreshToken = pgTable("refreshToken", {
  id: serial("id").primaryKey(),
  refreshToken: varchar("refreshToken", { length: 255 }),
  userId: integer("user_id").references(() => users.id).notNull(),
});