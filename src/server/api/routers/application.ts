import { and, eq, inArray, not, or, sql } from 'drizzle-orm';
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
} from '@app/server/db/schema';
import { mapApplicationDataToColumns } from '@app/server/application-normalizer';
import {
  applicationService,
  editableStatusesForApplicant,
} from '@app/server/services/application-service';
import { getDocumentKey } from '@app/server/constants';
import {
  ApplicationStatus,
  ApplicationStatusSchema,
} from '@app/types/application-status';
import type { ApplicationData } from '@app/types/application-data';
import * as _ from 'lodash';
import { z } from 'zod';

const SaveInputSchema = z.object({
  data: z.object({}).passthrough(),
  id: z.string().optional(),
  email: z.string(),
  status: ApplicationStatusSchema.optional(),
  programChoices: z.array(z.object({}).passthrough()).optional(),
  educations: z.array(z.object({}).passthrough()).optional(),
  documents: z.array(z.object({}).passthrough()).optional(),
  phones: z.array(z.object({}).passthrough()).optional(),
  consents: z.array(z.object({}).passthrough()).optional(),
});

const assertAdmin = (ctx: { session: { user: { role?: string } } }) => {
  if (ctx.session.user.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
};

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

    const relations = await applicationService.loadApplicationRelations(
      ctx.db,
      applicationRows.map((row) => row.application.id),
    );

    return applicationRows.map((row) =>
      applicationService.normalizeApplication(row, relations),
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

    const relations = await applicationService.loadApplicationRelations(
      ctx.db,
      [row.application.id],
    );

    return applicationService.normalizeApplication(row, relations);
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

      const relations = await applicationService.loadApplicationRelations(
        ctx.db,
        [row.application.id],
      );

      return applicationService.normalizeApplication(row, relations);
  }),

  save: publicProcedure
    .input(SaveInputSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id ?? null;
      const isAdmin = ctx.session?.user?.role === 'ADMIN';
      const applicationData = mapApplicationDataToColumns(
        input.data as ApplicationData,
      );

      const programChoices = applicationService.deriveProgramChoices(
        input.programChoices,
      );
      const educations = applicationService.deriveEducations(
        input.educations,
      );
      const phones = applicationService.derivePhones(
        input.phones,
        input.data as ApplicationData,
      );
      const documents = applicationService.deriveDocuments(
        input.documents,
      );
      const consents = applicationService.deriveConsents(
        input.consents,
      );
      const requestedStatus =
        input.status && ApplicationStatusSchema.safeParse(input.status).success
          ? (input.status as ApplicationStatus)
          : undefined;

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
      let previousStatus: ApplicationStatus | null = null;
      let nextStatus: ApplicationStatus | null = null;

      await ctx.db.transaction(async (tx) => {
        if (!existing) {
          nextStatus = requestedStatus ?? ApplicationStatus.DRAFT;
          const [inserted] = await tx
            .insert(applications)
            .values({
              id: applicationId,
              email: input.email,
              createdById: userId,
              status: nextStatus,
              ...applicationData,
            })
            .returning();

          applicationId = inserted?.id ?? applicationId;
        } else {
          previousStatus = existing.status as ApplicationStatus;
          nextStatus = requestedStatus ?? previousStatus ?? ApplicationStatus.DRAFT;

          const [updated] = await tx
            .update(applications)
            .set({
              email: input.email,
              status: nextStatus,
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

        // Log status change when it actually changes
        if (
          previousStatus &&
          nextStatus &&
          previousStatus !== nextStatus
        ) {
          await tx.insert(applicationStatusHistory).values({
            id: createId(),
            applicationId,
            status: nextStatus,
            changedById: userId ?? undefined,
          });
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

      const relations = await applicationService.loadApplicationRelations(
        ctx.db,
        [applicationId],
      );

      return applicationService.normalizeApplication(row, relations);
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
      assertAdmin(ctx);
      const searchConditions = q
        ? applicationService.buildSearchConditions(q)
        : [];

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

      const relations = await applicationService.loadApplicationRelations(
        ctx.db,
        rows.map((row) => row.application.id),
      );

      const normalized = rows.map((row) =>
        applicationService.normalizeApplication(row, relations),
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
      assertAdmin(ctx);
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
      assertAdmin(ctx);
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
      assertAdmin(ctx);
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
      assertAdmin(ctx);
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
      assertAdmin(ctx);
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
