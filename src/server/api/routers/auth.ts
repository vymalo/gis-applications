import { createTRPCRouter, protectedProcedure } from '@app/server/api/trpc';
import { toDateString } from '@app/server/application-normalizer';
import { user } from '@app/server/db/schema';
import { eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const authRouter = createTRPCRouter({
  me: protectedProcedure.query(({ ctx }) => {
    const currentUser = ctx.session.user as
      | { id?: string; name?: string | null; email?: string | null; role?: string }
      | undefined;

    return {
      user: currentUser ?? null,
    };
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        birthDate: z.union([z.date(), z.string().min(1)]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      if (!userId) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      const name = `${input.firstName} ${input.lastName}`.trim();
      const birthDate = input.birthDate
        ? toDateString(input.birthDate) ?? null
        : null;

      await ctx.db
        .update(user)
        .set({
          name,
          birthDate,
        })
        .where(eq(user.id, userId));

      return { name, birthDate };
    }),
});
