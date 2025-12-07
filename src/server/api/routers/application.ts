import {
  and,
  eq,
  ilike,
  inArray, 
  not,
  or,
  sql,
} from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { createId } from '@paralleldrive/cuid2';
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@app/server/api/trpc';
import {
  applications,
  applicationConsents,
  applicationDocuments,
  applicationEducations,
  applicationPhones,
  applicationProgramChoices,
  applicationStatusHistory,
  user,
  type Application,
  type ApplicationConsent,
  type ApplicationConsentInsert,
  type ApplicationDocument,
  type ApplicationDocumentInsert,
  type ApplicationEducation as ApplicationEducationRow,
  type ApplicationEducationInsert,
  type ApplicationPhone as ApplicationPhoneRow,
  type ApplicationPhoneInsert,
  type ApplicationProgramChoice,
  type ApplicationProgramChoiceInsert,
  type ApplicationStatusHistory,
  type User, ApplicationStatusEnum,
} from '@app/server/db/schema';
import {
  buildApplicationData,
  buildApplicationMeta,
  mapApplicationDataToColumns,
} from '@app/server/application-normalizer';
import { getDocumentKey } from '@app/server/constants';
import {
  ApplicationStatus,
  ApplicationStatusSchema,
} from '@app/types/application-status';
import type {
  ApplicationData,
  ApplicationEducationStatus,
  ApplicationEducationType,
  ApplicationDocument as ApplicationDocumentDto,
  ApplicationPhoneKind,
  ApplicationEducation as ApplicationEducationDto,
  ApplicationProgramChoice as ApplicationProgramChoiceDto,
  ApplicationPhone as ApplicationPhoneDto,
  ApplicationConsent as ApplicationConsentDto,
  ApplicationStoredDocument,
  NormalizedApplication,
} from '@app/types/application-data';
import * as _ from 'lodash';
import { z } from 'zod';
import {
  normalizeArray,
  toDateString,
} from '@app/server/application-normalizer';

type ApplicationRelations = {
  programChoices: Record<string, ApplicationProgramChoice[]>;
  educations: Record<string, ApplicationEducationRow[]>;
  documents: Record<string, ApplicationDocument[]>;
  phones: Record<string, ApplicationPhoneRow[]>;
  consents: Record<string, ApplicationConsent[]>;
  statusHistory: Record<string, ApplicationStatusHistory[]>;
};

const editableStatusesForApplicant: ApplicationStatus[] = [
  ApplicationStatus.DRAFT,
  ApplicationStatus.NEED_APPLICANT_INTERVENTION,
];

const groupByApplicationId = <T extends { applicationId: string }>(
  items: T[],
): Record<string, T[]> => {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const list = acc[item.applicationId] ?? [];
    list.push(item);
    acc[item.applicationId] = list;
    return acc;
  }, {});
};

const toStoredDocument = (
  doc: ApplicationDocument,
): ApplicationStoredDocument => ({
  id: doc.id,
  applicationId: doc.applicationId,
  educationId: doc.educationId ?? undefined,
  kind: doc.kind,
  name: doc.name,
  publicUrl: doc.publicUrl,
  status: doc.status,
  reviewerComment: doc.reviewerComment ?? null,
});

const toPhoneDto = (phone: ApplicationPhoneRow) => ({
  id: phone.id,
  phoneNumber: phone.phoneNumber,
  whatsappCall: phone.whatsappCall ?? false,
  normalCall: phone.normalCall ?? false,
  kind: phone.kind as ApplicationPhoneKind,
});

const toProgramChoiceDto = (
  choice: ApplicationProgramChoice,
): ApplicationProgramChoiceDto => ({
  id: choice.id,
  rank: choice.rank ?? undefined,
  programCode: choice.programCode,
  campus: choice.campus ?? undefined,
  startTerm: choice.startTerm ?? undefined,
  studyMode: choice.studyMode ?? undefined,
  fundingType: choice.fundingType ?? undefined,
});

const toEducationDto = (edu: ApplicationEducationRow) => ({
  id: edu.id,
  type: edu.type as ApplicationEducationType,
  schoolName: edu.schoolName,
  city: edu.city ?? undefined,
  country: edu.country ?? undefined,
  fieldOfStudy: edu.fieldOfStudy ?? undefined,
  startDate: edu.startDate ?? undefined,
  endDate: edu.endDate ?? undefined,
  completionDate: edu.completionDate ?? undefined,
  status: edu.status as ApplicationEducationStatus | undefined,
  gpa: edu.gpa ?? undefined,
  candidateNumber: edu.candidateNumber ?? undefined,
  sessionYear: edu.sessionYear ?? undefined,
});

const toConsentDto = (consent: ApplicationConsent) => ({
  id: consent.id,
  consentType: consent.consentType,
  value: consent.value,
  grantedAt: consent.grantedAt ?? undefined,
  version: consent.version ?? undefined,
});

const toStatusHistoryDto = (entry: ApplicationStatusHistory) => ({
  id: entry.id,
  status: entry.status as ApplicationStatus,
  changedAt: entry.changedAt ?? undefined,
  changedById: entry.changedById ?? undefined,
  note: entry.note ?? undefined,
});

const applyPhonesToData = (
  data: ApplicationData,
  phones: ApplicationPhoneRow[],
) => {
  if (!phones.length) {
    return { data, phoneDtos: [] };
  }
  const phoneDtos = phones.map(toPhoneDto);
  return { data, phoneDtos };
};

const applyDocumentsToData = (
  data: ApplicationData,
  docs: ApplicationDocument[],
) => {
  if (!docs.length) {
    return { data, storedDocuments: [] as ApplicationStoredDocument[] };
  }

  const storedDocuments = docs.map(toStoredDocument);

  return {
    data,
    storedDocuments,
  };
};

const loadApplicationRelations = async (
  db: typeof import('@app/server/db').db,
  applicationIds: string[],
): Promise<ApplicationRelations> => {
  if (!applicationIds.length) {
    return {
      programChoices: {},
      educations: {},
      documents: {},
      phones: {},
      consents: {},
      statusHistory: {},
    };
  }

  const [
    programChoices,
    educations,
    documents,
    phones,
    consents,
    statusHistory,
  ] = await Promise.all([
    db
      .select()
      .from(applicationProgramChoices)
      .where(inArray(applicationProgramChoices.applicationId, applicationIds)),
    db
      .select()
      .from(applicationEducations)
      .where(inArray(applicationEducations.applicationId, applicationIds)),
    db
      .select()
      .from(applicationDocuments)
      .where(inArray(applicationDocuments.applicationId, applicationIds)),
    db
      .select()
      .from(applicationPhones)
      .where(inArray(applicationPhones.applicationId, applicationIds)),
    db
      .select()
      .from(applicationConsents)
      .where(inArray(applicationConsents.applicationId, applicationIds)),
    db
      .select()
      .from(applicationStatusHistory)
      .where(inArray(applicationStatusHistory.applicationId, applicationIds)),
  ]);

  return {
    programChoices: groupByApplicationId(programChoices),
    educations: groupByApplicationId(educations),
    documents: groupByApplicationId(documents),
    phones: groupByApplicationId(phones),
    consents: groupByApplicationId(consents),
    statusHistory: groupByApplicationId(statusHistory),
  };
};

const normalizeApplication = (
  row: {
    application: Application;
    createdBy: User | null;
  },
  relations?: ApplicationRelations,
): NormalizedApplication => {
  const {
    metaInvitedStatuses,
    metaDocumentStatuses,
    metaDocumentComments,
    ...application
  } = row.application;

  const status =
    application.status ?? ApplicationStatus.DRAFT;

  const relationSet = relations
    ? {
        programChoices:
          relations.programChoices[application.id] ?? [],
        educations: relations.educations[application.id] ?? [],
        documents: relations.documents[application.id] ?? [],
        phones: relations.phones[application.id] ?? [],
        consents: relations.consents[application.id] ?? [],
        statusHistory:
          relations.statusHistory[application.id] ?? [],
      }
    : {
        programChoices: [],
        educations: [],
        documents: [],
        phones: [],
        consents: [],
        statusHistory: [],
      };

  const baseData = buildApplicationData(row.application);
  const { data: withPhones, phoneDtos } = applyPhonesToData(
    baseData,
    relationSet.phones,
  );
  const { data: withDocuments, storedDocuments } =
    applyDocumentsToData(withPhones, relationSet.documents);

  return {
    ...application,
    createdBy: row.createdBy ?? null,
    data: withDocuments,
    meta: buildApplicationMeta(row.application),
    status: status as ApplicationStatus,
    programChoices: relationSet.programChoices.map(toProgramChoiceDto),
    educations: relationSet.educations.map(toEducationDto),
    documents: storedDocuments,
    phones: phoneDtos,
    consents: relationSet.consents.map(toConsentDto),
    statusHistory: relationSet.statusHistory.map(toStatusHistoryDto),
  };
};

const buildSearchConditions = (query: string) => {
  const fields = [
    applications.lastName,
    applications.firstName,
    applications.whoAreYou,
    applications.whereAreYou,
  ];
  return fields.map((field) => ilike(field, `%${query}%`));
};

const SaveInputSchema = z.object({
  data: z.object({}).passthrough(),
  id: z.string().optional(),
  email: z.string(),
  programChoices: z.array(z.object({}).passthrough()).optional(),
  educations: z.array(z.object({}).passthrough()).optional(),
  documents: z.array(z.object({}).passthrough()).optional(),
  phones: z.array(z.object({}).passthrough()).optional(),
  consents: z.array(z.object({}).passthrough()).optional(),
});

const deriveProgramChoices = (
  choices: unknown[] | undefined,
): ApplicationProgramChoiceInsert[] =>
  (choices as ApplicationProgramChoiceDto[] | undefined)?.map(
    (choice) => ({
      applicationId: '',
      id: createId(),
      rank: choice.rank ?? 1,
      programCode: choice.programCode,
      campus: choice.campus ?? null,
      startTerm: choice.startTerm ?? null,
      studyMode: choice.studyMode ?? null,
      fundingType: choice.fundingType ?? null,
    }),
  ) ?? [];

const deriveEducations = (
  educations: unknown[] | undefined,
): ApplicationEducationInsert[] =>
  (educations as ApplicationEducationDto[] | undefined)?.map((education) => ({
    applicationId: '',
    id: createId(),
    type: education.type,
    schoolName: education.schoolName,
    city: education.city ?? null,
    country: education.country ?? null,
    fieldOfStudy: education.fieldOfStudy ?? null,
    startDate: toDateString(education.startDate) ?? null,
    endDate: toDateString(education.endDate) ?? null,
    completionDate: toDateString(education.completionDate) ?? null,
    status: (education.status as ApplicationEducationStatus | null) ?? 'IN_PROGRESS',
    gpa: education.gpa ?? null,
    candidateNumber: education.candidateNumber ?? null,
    sessionYear: education.sessionYear ?? null,
  })) ?? [];

const derivePhones = (
  phones: unknown[] | undefined,
  data: ApplicationData,
): ApplicationPhoneInsert[] => {
  const base =
    (phones as ApplicationPhoneDto[] | undefined) ??
    normalizeArray(data.phoneNumbers ?? []);

  return base
    .filter((phone) => phone.phoneNumber?.length)
    .map((phone) => {
      const phoneWithKind = phone as ApplicationPhoneDto;
      return {
        applicationId: '',
        id: createId(),
        phoneNumber: phone.phoneNumber,
        whatsappCall: !!phone.whatsappCall,
        normalCall: !!phone.normalCall,
        kind:
          (phoneWithKind.kind as ApplicationPhoneKind | undefined) ??
          'PRIMARY',
      };
    });
};

const deriveDocuments = (
  documents: unknown[] | undefined,
): ApplicationDocumentInsert[] => {
  const provided = (documents as (ApplicationStoredDocument & {
    files?: { publicUrl: string; name?: string }[];
  })[] | undefined) ?? [];

  const mapped: (ApplicationDocumentInsert | null)[] = provided.map((doc) => {
    const kind = doc.kind ?? 'OTHER';
    const firstFile = doc.files?.[0];
    const publicUrl = doc.publicUrl || firstFile?.publicUrl || '';
    if (!publicUrl) {
      return null;
    }
    const fallbackName = firstFile?.name || kind;
    const name =
      (doc.name && doc.name.trim().length ? doc.name : fallbackName) ??
      kind;
    const educationId =
      doc.educationId && doc.educationId.trim().length
        ? doc.educationId
        : null;
    return {
      applicationId: '',
      id: createId(),
      educationId,
      kind,
      name,
      publicUrl,
      status: doc.status ?? 'pending',
      reviewerComment: doc.reviewerComment ?? null,
    } satisfies ApplicationDocumentInsert;
  });

  return mapped.filter(Boolean) as ApplicationDocumentInsert[];
};

const deriveConsents = (
  consents: unknown[] | undefined,
): ApplicationConsentInsert[] =>
  (consents as ApplicationConsentDto[] | undefined)?.map((consent) => ({
    applicationId: '',
    id: createId(),
    consentType: consent.consentType,
    value: consent.value,
    grantedAt:
      consent.grantedAt != null
        ? new Date(consent.grantedAt)
        : undefined,
    version: consent.version ?? null,
  })) ?? [];

export const applicationRouter = createTRPCRouter({
  getUserApplication: protectedProcedure.query(async ({ ctx }) => {
    const applicationRows = await ctx.db
      .select({
        application: applications,
        createdBy: user,
      })
      .from(applications)
      .leftJoin(user, eq(user.id, applications.createdById))
      .where(
        and(
          eq(applications.createdById, ctx.session.user.id),
          not(eq(applications.status, ApplicationStatus.DRAFT)),
        ),
      );

    const relations = await loadApplicationRelations(
      ctx.db,
      applicationRows.map((row) => row.application.id),
    );

    return applicationRows.map((row) =>
      normalizeApplication(row, relations),
    );
  }),

  getUserDraftApplication: protectedProcedure.query(async ({ ctx }) => {
    const draftRows = await ctx.db
      .select({
        application: applications,
        createdBy: user,
      })
      .from(applications)
      .leftJoin(user, eq(user.id, applications.createdById))
      .where(
        and(
          eq(applications.createdById, ctx.session.user.id),
          inArray(applications.status, [
            ApplicationStatus.DRAFT,
            ApplicationStatus.NEED_APPLICANT_INTERVENTION,
          ]),
        ),
      )
      .limit(1);

    const row = draftRows[0];
    if (!row) {
      return null;
    }

    const relations = await loadApplicationRelations(ctx.db, [
      row.application.id,
    ]);

    return normalizeApplication(row, relations);
  }),

  getApplication: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const sessionUser = ctx.session.user;
      const filters = [
        eq(applications.id, input.id),
        ...(sessionUser.role === 'ADMIN'
          ? []
          : [eq(applications.createdById, sessionUser.id)]),
      ];

      const [row] = await ctx.db
        .select({
          application: applications,
          createdBy: user,
        })
        .from(applications)
        .leftJoin(user, eq(user.id, applications.createdById))
        .where(and(...filters))
        .limit(1)
;

      if (!row) {
        return null;
      }

      const relations = await loadApplicationRelations(ctx.db, [
        row.application.id,
      ]);

      return normalizeApplication(row, relations);
  }),

  save: publicProcedure
    .input(SaveInputSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id ?? null;
      const isAdmin = ctx.session?.user?.role === 'ADMIN';
      const applicationData = mapApplicationDataToColumns(
        input.data as ApplicationData,
      );

      const programChoices = deriveProgramChoices(input.programChoices);
      const educations = deriveEducations(input.educations);
      const phones = derivePhones(
        input.phones,
        input.data as ApplicationData,
      );
      const documents = deriveDocuments(input.documents);
      const consents = deriveConsents(input.consents);

      const filters = input.id
        ? [
            eq(applications.id, input.id),
            ...(userId ? [eq(applications.createdById, userId)] : []),
          ]
        : [];

      const existing =
        filters.length > 0
          ? (
              await ctx.db
                .select()
                .from(applications)
                .where(and(...filters))
                .limit(1)
            )[0]
          : null;

      if (existing && !isAdmin) {
        const currentStatus = existing.status as ApplicationStatus;
        if (!editableStatusesForApplicant.includes(currentStatus)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message:
              'Application can no longer be updated by the applicant at this stage.',
          });
        }
      }

      let applicationId = input.id ?? createId();

      await ctx.db.transaction(async (tx) => {
        if (!existing) {
          const [inserted] = await tx
            .insert(applications)
            .values({
              id: applicationId,
              email: input.email,
              createdById: userId,
              status: ApplicationStatus.DRAFT,
              ...applicationData,
            })
            .returning();

          applicationId = inserted?.id ?? applicationId;
        } else {
          const [updated] = await tx
            .update(applications)
            .set({
              email: input.email,
              ...applicationData,
              updatedAt: sql`now()`,
            })
            .where(eq(applications.id, existing.id))
            .returning();

          applicationId = updated?.id ?? applicationId;
        }

        await tx
          .delete(applicationProgramChoices)
          .where(eq(applicationProgramChoices.applicationId, applicationId));
        if (programChoices.length) {
          await tx
            .insert(applicationProgramChoices)
            .values(
              programChoices.map((choice) => ({
                ...choice,
                applicationId,
              })),
            );
        }

        await tx
          .delete(applicationEducations)
          .where(eq(applicationEducations.applicationId, applicationId));
        if (educations.length) {
          await tx
            .insert(applicationEducations)
            .values(
              educations.map((education) => ({
                ...education,
                applicationId,
              })),
            );
        }

        await tx
          .delete(applicationPhones)
          .where(eq(applicationPhones.applicationId, applicationId));
        if (phones.length) {
          await tx
            .insert(applicationPhones)
            .values(
              phones.map((phone) => ({
                ...phone,
                applicationId,
              })),
            );
        }

        await tx
          .delete(applicationDocuments)
          .where(eq(applicationDocuments.applicationId, applicationId));
        if (documents.length) {
          await tx
            .insert(applicationDocuments)
            .values(
              documents.map((doc) => ({
                ...doc,
                applicationId,
              })),
            );
        }

        await tx
          .delete(applicationConsents)
          .where(eq(applicationConsents.applicationId, applicationId));
        if (consents.length) {
          await tx
            .insert(applicationConsents)
            .values(
              consents.map((consent) => ({
                ...consent,
                applicationId,
              })),
            );
        }
      });

      const [row] = await ctx.db
        .select({
          application: applications,
          createdBy: user,
        })
        .from(applications)
        .leftJoin(user, eq(user.id, applications.createdById))
        .where(eq(applications.id, applicationId))
        .limit(1);

      if (!row) {
        return null;
      }

      const relations = await loadApplicationRelations(ctx.db, [
        applicationId,
      ]);

      return normalizeApplication(row, relations);
    }),

  getSome: protectedProcedure
    .input(
      z.object({
        page: z.number().int().optional().default(0),
        size: z.number().int().optional().default(10),
        q: z.string().optional().default(''),
        groupBy: z.string(),
      }),
    )
    .query(async ({ ctx, input: { q, size, page, groupBy } }) => {
      const searchConditions = q ? buildSearchConditions(q) : [];

      const rows = await ctx.db
        .select({
          application: applications,
          createdBy: user,
        })
        .from(applications)
        .leftJoin(user, eq(user.id, applications.createdById))
        .where(searchConditions.length ? or(...searchConditions) : undefined)
        .limit(size)
        .offset(page * size);

      const relations = await loadApplicationRelations(
        ctx.db,
        rows.map((row) => row.application.id),
      );

      const normalized = rows.map((row) =>
        normalizeApplication(row, relations),
      );
      const grouped = _.groupBy(normalized, groupBy);
      return _.entries(grouped);
    }),

  saveDocumentComment: protectedProcedure
    .input(
      z.object({
        comment: z.string().optional().default(''),
        publicUrl: z.string(),
        applicationId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input: { comment, applicationId, publicUrl } }) => {
      const [application] = await ctx.db
        .select()
        .from(applications)
        .where(eq(applications.id, applicationId))
        .limit(1);

      if (!application) {
        return null;
      }

      const key = getDocumentKey(publicUrl, 'comment');
      const comments =
        (application.metaDocumentComments ?? {}) as Record<string, string>;
      const metaDocumentComments = {
        ...comments,
        [key]: comment,
      };

      await ctx.db
        .update(applications)
        .set({
          metaDocumentComments,
          updatedAt: sql`now()`,
        })
        .where(eq(applications.id, applicationId));

      return comment;
    }),

  getDocumentComment: protectedProcedure
    .input(
      z.object({
        publicUrl: z.string(),
        applicationId: z.string(),
      }),
    )
    .query(async ({ ctx, input: { applicationId, publicUrl } }) => {
      const [application] = await ctx.db
        .select()
        .from(applications)
        .where(eq(applications.id, applicationId))
        .limit(1);

      const key = getDocumentKey(publicUrl, 'comment');
      const value =
        (application?.metaDocumentComments ?? {})[key];
      return typeof value === 'string' ? value : null;
    }),

  saveDocumentCheckStatus: protectedProcedure
    .input(
      z.object({
        publicUrl: z.string(),
        applicationId: z.string(),
        status: z.enum(['approved', 'rejected', 'pending']),
      }),
    )
    .mutation(async ({ ctx, input: { applicationId, publicUrl, status } }) => {
      const [application] = await ctx.db
        .select()
        .from(applications)
        .where(eq(applications.id, applicationId))
        .limit(1);

      if (!application) {
        return null;
      }

      const key = getDocumentKey(publicUrl, 'status');
      const metaDocumentStatuses = {
        ...(application.metaDocumentStatuses ?? {}),
        [key]: status,
      };

      await ctx.db
        .update(applications)
        .set({
          metaDocumentStatuses,
          updatedAt: sql`now()`,
        })
        .where(eq(applications.id, applicationId));

      return status;
    }),

  getDocumentCheckStatus: protectedProcedure
    .input(
      z.object({
        publicUrl: z.string(),
        applicationId: z.string(),
      }),
    )
    .query(async ({ ctx, input: { applicationId, publicUrl } }) => {
      const [application] = await ctx.db
        .select()
        .from(applications)
        .where(eq(applications.id, applicationId))
        .limit(1);

      const key = getDocumentKey(publicUrl, 'status');
      const value =
        (application?.metaDocumentStatuses ?? {})[key];
      return typeof value === 'string' ? value : null;
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        status: ApplicationStatusSchema,
        applicationId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input: { applicationId, status } }) => {
      const [updated] = await ctx.db
        .update(applications)
        .set({
          status,
          updatedAt: sql`now()`,
        })
        .where(eq(applications.id, applicationId))
        .returning();

      if (updated) {
        await ctx.db
          .insert(applicationStatusHistory)
          .values({
            id: createId(),
            applicationId,
            status,
            changedById: ctx.session.user.id,
          });
      }

      return updated ?? null;
    }),
});
