import { InferInsertModel, InferSelectModel, relations, sql } from 'drizzle-orm';
import { boolean, date, index, integer, jsonb, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import type {
  ApplicationDocument as ApplicationDocumentDto,
  ApplicationMeta,
  ApplicationPhoneNumber,
} from '@app/types/application-data';
import type { ApplicationStatus } from '@app/types/application-status';

export const ApplicationStatusEnum = pgEnum('ApplicationStatus', [
  'DRAFT',
  'INIT',
  'PHONE_INTERVIEW_PHASE',
  'ONSITE_INTERVIEW_PHASE',
  'ACCEPTED',
  'REJECTED',
  'NEED_APPLICANT_INTERVENTION',
]);

export const ApplicationEducationTypeEnum = pgEnum(
  'ApplicationEducationType',
  [
    'GCE_OL',
    'GCE_AL',
    'BAC',
    'PROBATOIRE',
    'BTS',
    'BACHELOR',
    'OTHER',
  ],
);

export const ApplicationEducationStatusEnum = pgEnum(
  'ApplicationEducationStatus',
  ['IN_PROGRESS', 'COMPLETED'],
);

export const ApplicationDocumentKindEnum = pgEnum(
  'ApplicationDocumentKind',
  [
    'ID',
    'GCE_OL_CERT',
    'PROBATOIRE_CERT',
    'GCE_AL_CERT',
    'BAC_CERT',
    'UNIVERSITY_CERT',
    'RECOMMENDATION',
    'MOTIVATION',
    'CV',
    'TRANSCRIPT',
    'OTHER',
  ],
);

export const ApplicationDocumentStatusEnum = pgEnum(
  'ApplicationDocumentStatus',
  ['approved', 'rejected', 'pending'],
);

export const ApplicationPhoneKindEnum = pgEnum('ApplicationPhoneKind', [
  'PRIMARY',
  'SECONDARY',
  'GUARDIAN',
  'OTHER',
]);

export const user = pgTable('user', {
    id: text('id').primaryKey().$defaultFn(createId),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    image: text('image'),
    birthDate: date('birth_date', { mode: 'string' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    banned: boolean('banned').default(false),
    banReason: text('ban_reason'),
    banExpires: timestamp('ban_expires'),
    role: text('role').default('user').notNull(),
  },
);

export const applications = pgTable(
  'application',
  {
    id: text('id').primaryKey().$defaultFn(createId),
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
      .$type<ApplicationDocumentDto[]>()
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
      .$type<ApplicationDocumentDto[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    highSchoolGceALBACDate: date('high_school_gce_al_bac_date', {
      mode: 'string',
    }),
    highSchoolGceALBACCertificates: jsonb(
      'high_school_gce_al_bac_certificates',
    )
      .$type<ApplicationDocumentDto[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    universityStudent: boolean('university_student')
      .default(false)
      .notNull(),
    universityStartDate: date('university_start_date', { mode: 'string' }),
    universityEndDate: date('university_end_date', { mode: 'string' }),
    universityCertificates: jsonb('university_certificates')
      .$type<ApplicationDocumentDto[]>()
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

export const applicationProgramChoices = pgTable(
  'application_program_choice',
  {
    id: text('id').primaryKey().$defaultFn(createId),
    applicationId: text('application_id')
      .notNull()
      .references(() => applications.id, { onDelete: 'cascade' }),
    rank: integer('rank').default(1).notNull(),
    programCode: text('program_code').notNull(),
    campus: text('campus'),
    startTerm: text('start_term'),
    studyMode: text('study_mode'),
    fundingType: text('funding_type'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('application_program_choice_application_idx').on(
      table.applicationId,
    ),
  ],
);

export const applicationEducations = pgTable(
  'application_education',
  {
    id: text('id').primaryKey().$defaultFn(createId),
    applicationId: text('application_id')
      .notNull()
      .references(() => applications.id, { onDelete: 'cascade' }),
    type: ApplicationEducationTypeEnum('type').notNull(),
    schoolName: text('school_name').notNull(),
    city: text('city'),
    country: text('country'),
    fieldOfStudy: text('field_of_study'),
    startDate: date('start_date', { mode: 'string' }),
    endDate: date('end_date', { mode: 'string' }),
    completionDate: date('completion_date', { mode: 'string' }),
    status: ApplicationEducationStatusEnum('status').default('IN_PROGRESS'),
    gpa: text('gpa'),
    candidateNumber: text('candidate_number'),
    sessionYear: integer('session_year'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('application_education_application_idx').on(
      table.applicationId,
    ),
    index('application_education_type_idx').on(table.type),
  ],
);

export const applicationDocuments = pgTable(
  'application_document',
  {
    id: text('id').primaryKey().$defaultFn(createId),
    applicationId: text('application_id')
      .notNull()
      .references(() => applications.id, { onDelete: 'cascade' }),
    educationId: text('education_id').references(
      () => applicationEducations.id,
      {
        onDelete: 'set null',
      },
    ),
    kind: ApplicationDocumentKindEnum('kind').notNull(),
    // Required column in DB; keep it in the schema to match migrations
    name: text('name').notNull(),
    publicUrl: text('public_url').notNull(),
    status: ApplicationDocumentStatusEnum('status')
      .default('pending')
      .notNull(),
    reviewerComment: text('reviewer_comment'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('application_document_application_idx').on(
      table.applicationId,
    ),
    index('application_document_education_idx').on(table.educationId),
    index('application_document_status_idx').on(table.status),
    index('application_document_kind_idx').on(table.kind),
  ],
);

export const applicationPhones = pgTable(
  'application_phone',
  {
    id: text('id').primaryKey().$defaultFn(createId),
    applicationId: text('application_id')
      .notNull()
      .references(() => applications.id, { onDelete: 'cascade' }),
    phoneNumber: text('phone_number').notNull(),
    whatsappCall: boolean('whatsapp_call').default(false).notNull(),
    normalCall: boolean('normal_call').default(false).notNull(),
    kind: ApplicationPhoneKindEnum('kind').default('PRIMARY').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('application_phone_application_idx').on(table.applicationId),
  ],
);

export const applicationConsents = pgTable(
  'application_consent',
  {
    id: text('id').primaryKey().$defaultFn(createId),
    applicationId: text('application_id')
      .notNull()
      .references(() => applications.id, { onDelete: 'cascade' }),
    consentType: text('consent_type').notNull(),
    value: boolean('value').notNull(),
    grantedAt: timestamp('granted_at').defaultNow().notNull(),
    version: text('version'),
  },
  (table) => [
    index('application_consent_application_idx').on(table.applicationId),
  ],
);

export const applicationStatusHistory = pgTable(
  'application_status_history',
  {
    id: text('id').primaryKey().$defaultFn(createId),
    applicationId: text('application_id')
      .notNull()
      .references(() => applications.id, { onDelete: 'cascade' }),
    status: ApplicationStatusEnum('status').notNull(),
    changedAt: timestamp('changed_at').defaultNow().notNull(),
    changedById: text('changed_by_id').references(() => user.id, {
      onDelete: 'set null',
    }),
    note: text('note'),
  },
  (table) => [
    index('application_status_history_application_idx').on(
      table.applicationId,
    ),
  ],
);

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey().$defaultFn(createId),
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
    id: text('id').primaryKey().$defaultFn(createId),
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
    id: text('id').primaryKey().$defaultFn(createId),
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
export type ApplicationProgramChoice = InferSelectModel<
  typeof applicationProgramChoices
>;
export type ApplicationProgramChoiceInsert = InferInsertModel<
  typeof applicationProgramChoices
>;
export type ApplicationEducation = InferSelectModel<
  typeof applicationEducations
>;
export type ApplicationEducationInsert = InferInsertModel<
  typeof applicationEducations
>;
export type ApplicationDocument = InferSelectModel<
  typeof applicationDocuments
>;
export type ApplicationDocumentInsert = InferInsertModel<
  typeof applicationDocuments
>;
export type ApplicationPhone = InferSelectModel<typeof applicationPhones>;
export type ApplicationPhoneInsert = InferInsertModel<
  typeof applicationPhones
>;
export type ApplicationConsent = InferSelectModel<typeof applicationConsents>;
export type ApplicationConsentInsert = InferInsertModel<
  typeof applicationConsents
>;
export type ApplicationStatusHistory = InferSelectModel<
  typeof applicationStatusHistory
>;
export type ApplicationStatusHistoryInsert = InferInsertModel<
  typeof applicationStatusHistory
>;
