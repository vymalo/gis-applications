import { createTRPCRouter, protectedProcedure } from '@app/server/api/trpc';
import {
  getAcceptedOptions,
  getRejectedOptions,
  getSendOnsiteInterviewOptions,
  getSendPhoneInterviewOptions,
} from '@app/server/mails/send';
import { Application, ApplicationStatus } from '@prisma/client';
import { z } from 'zod';

export const mailRouter = createTRPCRouter({
  sendPhoneInterview: protectedProcedure
    .input(z.object({}))
    .mutation(async ({ ctx, input: _ }) => {
      const applications = await ctx.db.application.findMany({
        where: {
          status: ApplicationStatus.PHONE_INTERVIEW_PHASE,
        },
      });

      const batch = applications.map(async (application: Application) => {
        try {
          const meta = application.meta ?? {};
          if (meta.status?.invited?.[ApplicationStatus.PHONE_INTERVIEW_PHASE]) {
            return;
          }

          const options = await getSendPhoneInterviewOptions({ application });
          await ctx.transporter.sendMail(options);

          meta.status = meta.status ?? {};
          meta.status.invited = meta.status.invited ?? {};
          meta.status.invited[ApplicationStatus.PHONE_INTERVIEW_PHASE] = true;

          await ctx.db.application.update({
            where: {
              id: application.id,
            },
            data: {
              meta,
            },
          });
        } catch (e) {
          console.error(e);
        }
      });

      await Promise.all(batch);
    }),

  sendOnsiteInterview: protectedProcedure
    .input(z.object({}))
    .mutation(async ({ ctx, input: _ }) => {
      const applications = await ctx.db.application.findMany({
        where: {
          status: ApplicationStatus.ONSITE_INTERVIEW_PHASE,
        },
      });

      const batch = applications.map(async (application: Application) => {
        try {
          const meta = application.meta ?? {};
          if (
            meta.status?.invited?.[ApplicationStatus.ONSITE_INTERVIEW_PHASE]
          ) {
            return;
          }

          const options = await getSendOnsiteInterviewOptions({ application });
          await ctx.transporter.sendMail(options);

          meta.status = meta.status ?? {};
          meta.status.invited = meta.status.invited ?? {};
          meta.status.invited[ApplicationStatus.ONSITE_INTERVIEW_PHASE] = true;

          await ctx.db.application.update({
            where: {
              id: application.id,
            },
            data: {
              meta,
            },
          });
        } catch (e) {
          console.error(e);
        }
      });

      await Promise.all(batch);
    }),

  sendAcceptance: protectedProcedure
    .input(z.object({}))
    .mutation(async ({ ctx, input: _ }) => {
      const applications = await ctx.db.application.findMany({
        where: {
          status: ApplicationStatus.ACCEPTED,
        },
      });

      const batch = applications.map(async (application: Application) => {
        try {
          const meta = application.meta ?? {};
          if (meta.status?.invited?.[ApplicationStatus.ACCEPTED]) {
            return;
          }

          const options = await getAcceptedOptions({ application });
          await ctx.transporter.sendMail(options);

          meta.status = meta.status ?? {};
          meta.status.invited = meta.status.invited ?? {};
          meta.status.invited[ApplicationStatus.ACCEPTED] = true;

          await ctx.db.application.update({
            where: {
              id: application.id,
            },
            data: {
              meta,
            },
          });
        } catch (e) {
          console.error(e);
        }
      });

      await Promise.all(batch);
    }),

  sendRejection: protectedProcedure
    .input(z.object({}))
    .mutation(async ({ ctx, input: _ }) => {
      const applications = await ctx.db.application.findMany({
        where: {
          status: ApplicationStatus.REJECTED,
        },
      });

      const batch = applications.map(async (application: Application) => {
        try {
          const meta = application.meta ?? {};
          if (meta.status?.invited?.[ApplicationStatus.REJECTED]) {
            return;
          }

          const options = await getRejectedOptions({ application });

          await ctx.transporter.sendMail(options);

          meta.status = meta.status ?? {};
          meta.status.invited = meta.status.invited ?? {};
          meta.status.invited[ApplicationStatus.REJECTED] = true;

          await ctx.db.application.update({
            where: {
              id: application.id,
            },
            data: {
              meta,
            },
          });
        } catch (e) {
          console.error(e);
        }
      });

      await Promise.all(batch);
    }),
});
