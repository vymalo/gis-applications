import { createTRPCRouter, protectedProcedure } from '@app/server/api/trpc';

export const authRouter = createTRPCRouter({
  me: protectedProcedure.query(({ ctx }) => {
    const user = ctx.session.user as
      | { id?: string; name?: string | null; email?: string | null; role?: string }
      | undefined;

    return {
      user: user ?? null,
    };
  }),
});

