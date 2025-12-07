import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '@app/server/api/trpc';
import {
  createPresignedGetUrl,
  createPresignedPostUrl,
} from '@app/server/s3';

export const uploadRouter = createTRPCRouter({
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        filename: z.string(),
      }),
    )
    .output(
      z.object({
        url: z.url(),
        publicUrl: z.url(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { filename } = input;
      const { url, publicUrl } = await createPresignedPostUrl({
        filename,
        userId: ctx.session.user.id,
      });
      return { url, publicUrl };
    }),

  getViewUrl: protectedProcedure
    .input(
      z.object({
        publicUrl: z.url(),
      }),
    )
    .output(z.object({ url: z.url() }))
    .query(async ({ input }) => {
      const { url } = await createPresignedGetUrl(input.publicUrl);
      return { url };
    }),
});
