import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  boolean,
  decimal,
} from 'drizzle-orm/pg-core';
import { transferRequests } from './transferRequests.schema';

export const usersReject = pgTable('users_reject', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  class: integer('class').notNull(),
  experience: integer('experience').notNull(),
  latitude: decimal('latitude', { precision: 10, scale: 8 }).notNull(),
  longitude: decimal('longitude', { precision: 11, scale: 8 }).notNull(),
  ai_keyword: text('ai_keyword').notNull(),
  civil: varchar('civil', { length: 100 }).notNull(),
  criminal: varchar('criminal', { length: 100 }).notNull(),
  administrative: varchar('administrative', { length: 100 }).notNull(),
  narcotics: varchar('narcotics', { length: 100 }).notNull(),
  general: varchar('general', { length: 100 }).notNull(),
  sick: varchar('sick', { length: 100 }).notNull(),
  spouse: varchar('spouse', { length: 100 }).notNull(),
  score: decimal('score', { precision: 10, scale: 2 }),
  requestId: integer('request_id')
    .references(() => transferRequests.id)
    .notNull(),
});
