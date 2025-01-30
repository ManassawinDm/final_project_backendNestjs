import { integer, pgTable, serial, text, timestamp, varchar, boolean } from "drizzle-orm/pg-core";
import { transferRequests } from "./transferRequests.schema";


export const usersReject = pgTable("users_reject", {
    id: serial("id").primaryKey(),
    experience: varchar("experience", { length: 100 }).notNull(),
    distance: integer("distance").notNull(),
    ai_keyword: varchar("distance", { length: 20 }).notNull(),
    sick:integer("sick").notNull(),
    spouse :integer("spouse").notNull(),
    score:integer("score"),
    requestId:integer("requestId").references(()=>transferRequests.id).notNull()
});

