import { InferModel } from 'drizzle-orm';
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const ApplicationStatusEnum = pgEnum('ApplicationStatus', [
  'INIT',
  'PHONE_INTERVIEW_PHASE',
  'ONSITE_INTERVIEW_PHASE',
  'ACCEPTED',
  'REJECTED',
]);

export const UserRoleEnum = pgEnum('UserRole', ['USER', 'ADMIN']);

export const users = pgTable(
  'User',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()`),
    name: text('name'),
    email: text('email'),
    emailVerified: timestamp('email_verified'),
    image: text('image'),
    role: UserRoleEnum('role').default('USER').notNull(),
  },
  (table) => ({
    emailUnique: uniqueIndex('user_email_unique').on(table.email),
  }),
);

export const applications = pgTable(
  'Application',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()`),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    createdById: text('createdById').references(() => users.id),
    meta: jsonb('meta'),
    data: jsonb('data').notNull(),
    status: ApplicationStatusEnum('status').default('INIT').notNull(),
    email: text('email').notNull(),
  },
  (table) => ({
    createdByIdx: index('application_created_by_id_idx').on(
      table.createdById,
    ),
  }),
);

export const accounts = pgTable(
  'Account',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()`),
    userId: text('userId').references(() => users.id).notNull(),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
    refresh_token_expires_in: integer('refresh_token_expires_in'),
  },
  (table) => ({
    providerAccountUnique: uniqueIndex('account_provider_account_unique').on(
      table.provider,
      table.providerAccountId,
    ),
  }),
);

export const sessions = pgTable('Session', {
  id: text('id').primaryKey().default(sql`gen_random_uuid()`),
  sessionToken: text('sessionToken').unique().notNull(),
  userId: text('userId').references(() => users.id).notNull(),
  expires: timestamp('expires').notNull(),
});

export const verificationTokens = pgTable(
  'VerificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').unique().notNull(),
    expires: timestamp('expires').notNull(),
  },
  (table) => ({
    identifierTokenUnique: uniqueIndex(
      'verification_token_identifier_token',
    ).on(table.identifier, table.token),
  }),
);

export const dbSchema = {
  Application: applications,
  User: users,
  Account: accounts,
  Session: sessions,
  VerificationToken: verificationTokens,
} as const;

export type Application = InferModel<typeof applications>;
export type ApplicationInsert = InferModel<typeof applications, 'insert'>;

export type User = InferModel<typeof users>;
export type Account = InferModel<typeof accounts>;
export type Session = InferModel<typeof sessions>;
export type VerificationToken = InferModel<typeof verificationTokens>;
