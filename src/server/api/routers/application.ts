import { z } from 'zod';

import {
  InputJsonValueSchema,
  JsonNullValueInputSchema,
} from '@app/generated/zod';
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from '@app/server/api/trpc';
import { UserRole } from '@prisma/client';

export const applicationRouter = createTRPCRouter({
  getUserApplication: protectedProcedure.query(async ({ ctx }) => {
    const application = await ctx.db.application.findMany({
      where: {
        createdById: ctx.session.user.id,
      },
      include: {
        createdBy: true,
      },
    });

    return application;
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
      }),
    )
    .query(async ({ ctx, input: { q, size, page } }) => {
      const applications = await ctx.db.application.findMany({
        where: q ? ({
          OR: [
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
            }
          ]
        }) : ({ }),
        take: size,
        skip: page * size,
      });

      return applications ?? [];
    }),
});
