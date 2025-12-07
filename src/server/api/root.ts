import { applicationRouter } from '@app/server/api/routers/application';
import { authRouter } from '@app/server/api/routers/auth';
import { createCallerFactory, createTRPCRouter } from '@app/server/api/trpc';
import { mailRouter } from './routers/mail';
import { uploadRouter } from './routers/upload';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  application: applicationRouter,
  auth: authRouter,
  upload: uploadRouter,
  mail: mailRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.application.all();
 *       ^? Application[]
 */
export const createCaller = createCallerFactory(appRouter);
