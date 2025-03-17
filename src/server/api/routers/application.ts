import { ApplicationStatusSchema } from '@app/generated/zod';
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@app/server/api/trpc';
import { getDocumentKey } from '@app/server/constants';
import { UserRole } from '@prisma/client';
import * as _ from 'lodash';
import { z } from 'zod';

export const applicationRouter = createTRPCRouter({
  getUserApplication: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.application.findMany({
      where: {
        createdById: ctx.session.user.id,
      },
      include: {
        createdBy: true,
      },
    });
  }),

  getApplication: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId =
        ctx.session.user.role === UserRole.ADMIN
          ? undefined
          : ctx.session.user.id;

      const application = await ctx.db.application.findUnique({
        where: {
          id: input.id,
          createdById: userId,
        },
      });

      return application ?? null;
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
      const id = input.id;
      let previousCount = 0;

      if (id || userId) {
        previousCount = await ctx.db.application.count({
          where: {
            createdById: userId,
            id: input.id,
          },
        });
      }

      if (previousCount === 0) {
        return ctx.db.application.create({
          data: {
            data: input.data,
            email: input.email,
            createdBy: userId
              ? {
                  connect: {
                    id: userId,
                  },
                }
              : undefined,
          },
        });
      }

      return ctx.db.application.update({
        where: {
          id: input.id,
        },
        data: {
          data: input.data,
          email: input.email,
        },
      });
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
      const applications = await ctx.db.application.findMany({
        where: q
          ? {
              OR: [
                {
                  // https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-json-fields#filter-on-a-json-field-advanced
                  data: {
                    path: ['lastName'],
                    string_contains: q,
                  },
                },
                {
                  // https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-json-fields#filter-on-a-json-field-advanced
                  data: {
                    path: ['firstName'],
                    string_contains: q,
                  },
                },
                {
                  // https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-json-fields#filter-on-a-json-field-advanced
                  data: {
                    path: ['whoAreYou'],
                    string_contains: q,
                  },
                },
                {
                  // https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-json-fields#filter-on-a-json-field-advanced
                  data: {
                    path: ['whereAreYou'],
                    string_contains: q,
                  },
                },

                {
                  // https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-json-fields#filter-on-a-json-field-advanced
                  data: {
                    path: ['lastName'],
                    string_contains: q.toUpperCase(),
                  },
                },
                {
                  // https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-json-fields#filter-on-a-json-field-advanced
                  data: {
                    path: ['firstName'],
                    string_contains: q.toUpperCase(),
                  },
                },
                {
                  // https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-json-fields#filter-on-a-json-field-advanced
                  data: {
                    path: ['whoAreYou'],
                    string_contains: q.toUpperCase(),
                  },
                },
                {
                  // https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-json-fields#filter-on-a-json-field-advanced
                  data: {
                    path: ['whereAreYou'],
                    string_contains: q.toUpperCase(),
                  },
                },

                {
                  // https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-json-fields#filter-on-a-json-field-advanced
                  data: {
                    path: ['lastName'],
                    string_contains: q.toLowerCase(),
                  },
                },
                {
                  // https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-json-fields#filter-on-a-json-field-advanced
                  data: {
                    path: ['firstName'],
                    string_contains: q.toLowerCase(),
                  },
                },
                {
                  // https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-json-fields#filter-on-a-json-field-advanced
                  data: {
                    path: ['whoAreYou'],
                    string_contains: q.toLowerCase(),
                  },
                },
                {
                  // https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-json-fields#filter-on-a-json-field-advanced
                  data: {
                    path: ['whereAreYou'],
                    string_contains: q.toLowerCase(),
                  },
                },
              ],
            }
          : {},
        take: size,
        skip: page * size,
      });

      const emailDict = _.groupBy(applications, groupBy);
      return _.entries(emailDict);
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
      const application = await ctx.db.application.findUnique({
        where: {
          id: applicationId,
        },
      });

      if (!application) {
        return null;
      }

      const meta = application.meta ?? {};
      const key = getDocumentKey(publicUrl, 'comment');
      meta[key] = comment;

      await ctx.db.application.update({
        where: {
          id: applicationId,
        },
        data: {
          meta,
        },
      });

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
      const application = await ctx.db.application.findUnique({
        where: {
          id: applicationId,
        },
      });

      const meta = application?.meta ?? {};
      const key = getDocumentKey(publicUrl, 'comment');
      return meta[key] ?? null;
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
      const application = await ctx.db.application.findUnique({
        where: {
          id: applicationId,
        },
      });

      if (!application) {
        return null;
      }

      const meta = application.meta ?? {};
      const key = getDocumentKey(publicUrl, 'status');
      meta[key] = status;

      await ctx.db.application.update({
        where: {
          id: applicationId,
        },
        data: {
          meta,
        },
      });

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
      const application = await ctx.db.application.findUnique({
        where: {
          id: applicationId,
        },
      });

      const meta = application?.meta ?? {};
      const key = getDocumentKey(publicUrl, 'status');
      return meta[key] ?? null;
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        status: ApplicationStatusSchema,
        applicationId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input: { applicationId, status } }) => {
      return await ctx.db.application.update({
        where: {
          id: applicationId,
        },
        data: {
          status,
        },
      });
    }),

  //invite: protectedProcedure,
});
