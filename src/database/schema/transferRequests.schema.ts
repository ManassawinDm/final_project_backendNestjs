import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  boolean,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { mainOffices } from './mainOffices.schema';
import { transferPeriods } from './transferPeriods.schema';

export const transferStatusEnum = pgEnum('transfer_status', ['Pending', 'Approved', 'Rejected']);

export const transferRequests = pgTable('transfer_requests', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  officeId: integer('office_id')
    .notNull()
    .references(() => mainOffices.id),  
  priority: integer('priority'),
  targetOfficeId: integer('target_office_id').references(() => mainOffices.id),
  classId: integer('class_id').notNull(),
  reason: text('reason'),
  sick: varchar('sick', { length: 100 }),
  spouse: varchar('spouse', { length: 100 }),
  status: transferStatusEnum('status').default('Pending').notNull(),
  transferPeriods: integer('transferPeriods')
    .references(() => transferPeriods.id),
    // .notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});
