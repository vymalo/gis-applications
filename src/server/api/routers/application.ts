import {
  and,
  eq,
  ilike,
  or,
  sql,
} from 'drizzle-orm';
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@app/server/api/trpc';
import {
  applications,
  user,
  type Application,
  type User,
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
  NormalizedApplication,
} from '@app/types/application-data';
import * as _ from 'lodash';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';

const normalizeApplication = (row: {
  application: Application;
  createdBy: User | null;
}): NormalizedApplication => {
  const {
    metaInvitedStatuses,
    metaDocumentStatuses,
    metaDocumentComments,
    ...application
  } = row.application;

  const status =
    application.status ?? ApplicationStatus.INIT;

  return {
    ...application,
    createdBy: row.createdBy ?? null,
    data: buildApplicationData(row.application),
    meta: buildApplicationMeta(row.application),
    status: status as ApplicationStatus,
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

export const applicationRouter = createTRPCRouter({
  getUserApplication: protectedProcedure.query(async ({ ctx }) => {
    const applicationRows = await ctx.db
      .select({
        application: applications,
        createdBy: user,
      })
      .from(applications)
      .leftJoin(user, eq(user.id, applications.createdById))
      .where(eq(applications.createdById, ctx.session.user.id));

    return applicationRows.map(normalizeApplication);
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

      return normalizeApplication(row);
    }),

  save: publicProcedure
    .input(
      z.object({
        data: z.object({}).passthrough(),
        id: z.string().optional(),
        email: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      const applicationData = mapApplicationDataToColumns(
        input.data as ApplicationData,
      );
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

      if (!existing) {
        const [inserted] = await ctx.db
          .insert(applications)
          .values({
            id: input.id ?? randomUUID(),
            email: input.email,
            createdById: userId ?? null,
            ...applicationData,
          })
          .returning();

        return inserted ?? null;
      }

      const [updated] = await ctx.db
        .update(applications)
        .set({
          email: input.email,
          ...applicationData,
          updatedAt: sql`now()`,
        })
        .where(eq(applications.id, input.id!))
        .returning();

      return updated ?? null;
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

      const normalized = rows.map(normalizeApplication);
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

      return updated ?? null;
    }),
});
