import { pgTable, serial, varchar, decimal } from "drizzle-orm/pg-core";

export const mainOffices = pgTable("main_offices", {
    id: serial("id").primaryKey(),
    name: varchar("name", {length:255}).notNull(), // Add name to the schema
    short_name: varchar("short_name", { length: 255 }).notNull(),
    address: varchar("address", { length: 255 }).notNull(),
    latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
    longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
    province: varchar("province", { length: 255 }).notNull(),
    area: varchar("area", { length: 255 }).notNull(),
    type: varchar("type", { length: 10 }).notNull(),
});