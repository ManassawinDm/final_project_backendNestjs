import { integer, pgTable, serial, text, timestamp, varchar, boolean } from "drizzle-orm/pg-core";
import { users } from "./users.schema";

export const authUsers = pgTable("auth_users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull(), 
  userId: integer("user_id").references(() => users.id),
});