import { InferInsertModel, InferSelectModel, relations, sql } from 'drizzle-orm';
import { boolean, date, index, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import type { ApplicationDocument, ApplicationMeta, ApplicationPhoneNumber } from '@app/types/application-data';
import type { ApplicationStatus } from '@app/types/application-status';

export const ApplicationStatusEnum = pgEnum('ApplicationStatus', [
  'INIT',
  'PHONE_INTERVIEW_PHASE',
  'ONSITE_INTERVIEW_PHASE',
  'ACCEPTED',
  'REJECTED',
]);

export const UserRoleEnum = pgEnum('UserRole', ['USER', 'ADMIN']);

export const user = pgTable('user', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    image: text('image'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    banned: boolean('banned').default(false),
    banReason: text('ban_reason'),
    banExpires: timestamp('ban_expires'),
    role: UserRoleEnum('role').default('USER').notNull(),
  },
  (table) => ({
    emailUnique: uniqueIndex('user_email_unique').on(table.email),
  }),
);

export const applications = pgTable(
  'application',
  {
    id: text('id').primaryKey(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    createdById: text('createdById').references(() => user.id),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    birthDate: date('birth_date', { mode: 'string' }).notNull(),
    whoAreYou: text('who_are_you'),
    phoneNumbers: jsonb('phone_numbers')
      .$type<ApplicationPhoneNumber[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    country: text('country').notNull(),
    city: text('city').notNull(),
    whereAreYou: text('where_are_you'),
    hasIdCartOrPassport: boolean('has_id_cart_or_passport')
      .default(false)
      .notNull(),
    idCartOrPassportOrReceipt: jsonb(
      'id_cart_or_passport_or_receipt',
    )
      .$type<ApplicationDocument[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    highSchoolOver: boolean('high_school_over').default(false).notNull(),
    highSchoolGceOLProbatoirDate: date(
      'high_school_gce_ol_probatoir_date',
      { mode: 'string' },
    ),
    highSchoolGceOLProbatoireCertificates: jsonb(
      'high_school_gce_ol_probatoire_certificates',
    )
      .$type<ApplicationDocument[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    highSchoolGceALBACDate: date('high_school_gce_al_bac_date', {
      mode: 'string',
    }),
    highSchoolGceALBACCertificates: jsonb(
      'high_school_gce_al_bac_certificates',
    )
      .$type<ApplicationDocument[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    universityStudent: boolean('university_student')
      .default(false)
      .notNull(),
    universityStartDate: date('university_start_date', { mode: 'string' }),
    universityEndDate: date('university_end_date', { mode: 'string' }),
    universityCertificates: jsonb('university_certificates')
      .$type<ApplicationDocument[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    metaInvitedStatuses: jsonb('meta_invited_statuses')
      .$type<Partial<Record<ApplicationStatus, boolean>>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    metaDocumentStatuses: jsonb('meta_document_statuses')
      .$type<ApplicationMeta['documentStatuses']>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    metaDocumentComments: jsonb('meta_document_comments')
      .$type<ApplicationMeta['documentComments']>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    status: ApplicationStatusEnum('status').default('INIT').notNull(),
    email: text('email').notNull(),
  },
  (table) => ({
    createdByIdx: index('application_created_by_id_idx').on(
      table.createdById,
    ),
  }),
);

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    impersonatedBy: text('impersonated_by'),
  },
  (table) => [index('session_userId_idx').on(table.userId)],
);

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index('account_userId_idx').on(table.userId)],
);

export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export type Application = InferSelectModel<typeof applications>;
export type ApplicationInsert = InferInsertModel<typeof applications>;

export type User = InferSelectModel<typeof user>;