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
import { mainOffices } from './mainOffices.schema';
import { users } from './users.schema';
import { transferPeriods } from './transferPeriods.schema';
import { Positions } from './class.schema';

export const competitors = pgTable('competitors', {
  id: serial('id').primaryKey(),
  officeId: integer('office_id')
    .notNull()
    .references(() => mainOffices.id),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  classId: integer('class_id')
    .notNull()
    .references(() => Positions.id),
  score: decimal('score', { precision: 10, scale: 2 }).notNull(),
  winner: varchar('winner', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
