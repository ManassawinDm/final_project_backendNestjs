import {
    integer,
    pgTable,
    serial,
    text,
    timestamp,
    varchar,
    boolean,
    decimal
  } from 'drizzle-orm/pg-core';
  import { transferRequests } from './transferRequests.schema';
  
  export const usersReject = pgTable('users_reject', {
    id: serial('id').primaryKey(),
    userId:integer('userId').notNull(),
    experience: varchar('experience', { length: 100 }).notNull(),
    latitude: decimal('latitude', { precision: 10, scale: 8 }).notNull(),
    longitude: decimal('longitude', { precision: 11, scale: 8 }).notNull(),
    ai_keyword: varchar('ai_keyword', { length: 20 }).notNull(),
    sick: varchar('sick', { length: 100 }).notNull(),
    spouse: varchar('spouse', { length: 100 }).notNull(),
    score: integer('score'),
    requestId: integer('requestId')
      .references(() => transferRequests.id)
      .notNull(),
  });