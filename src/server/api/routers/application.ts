import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@app/server/api/trpc";
import {
  InputJsonValueSchema,
  JsonNullValueInputSchema,
} from "@app/generated/zod";
import { UserRole } from "@prisma/client";

export const applicationRouter = createTRPCRouter({
  getUserApplication: protectedProcedure.query(async ({ ctx }) => {
    const application = await ctx.db.application.findUnique({
      where: {
        createdById: ctx.session.user.id,
      },
      include: {
        createdBy: true,
      },
    });

    return application ?? null;
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

  create: publicProcedure
    .input(
      z.object({
        data: z.union([
          z.lazy(() => JsonNullValueInputSchema),
          InputJsonValueSchema,
        ]),
        userId: z.string().optional(),
        email: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.application.create({
        data: {
          data: input.data,
          email: input.email,
          createdBy: input.userId
            ? {
                connect: {
                  id: input.userId,
                },
              }
            : undefined,
        },
      });
    }),

  getSome: protectedProcedure
    .input(
      z.object({
        page: z.number().int().optional().default(0),
        size: z.number().int().optional().default(10),
        q: z.string().optional().default(""),
      }),
    )
    .query(async ({ ctx, input: { q, size, page } }) => {
      const applications = await ctx.db.application.findMany({
        where: {
          // https://www.prisma.io/docs/orm/prisma-client/special-fields-and-types/working-with-json-fields#filter-on-a-json-field-advanced
          data: {
            path: ["name"],
            string_contains: q,
          },
        },
        take: size,
        skip: page * size,
      });

      return applications ?? [];
    }),
});
