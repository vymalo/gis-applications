import { eq } from 'drizzle-orm';
import {
  createTRPCRouter,
  protectedProcedure,
  type TRPCContext,
} from '@app/server/api/trpc';
import {
  applications,
  type Application,
} from '@app/server/db/schema';
import type { ApplicationMeta } from '@app/types/application-data';
import { transporter } from '@app/server/nodemailer';
import {
  getAcceptedOptions,
  getRejectedOptions,
  getSendOnsiteInterviewOptions,
  getSendPhoneInterviewOptions,
} from '@app/server/mails/send';
import { ApplicationStatus } from '@app/types/application-status';
import type { SendMailOptions } from 'nodemailer';
import { z } from 'zod';

const shouldSendEmail = (
  application: Application,
  status: ApplicationStatus,
): boolean => {
  const meta = (application.meta ?? {}) as ApplicationMeta;
  return !meta.status?.invited?.[status];
};

const markAsInvited = (
  application: Application,
  status: ApplicationStatus,
): Application['meta'] => {
  const meta = (application.meta ?? {}) as ApplicationMeta;
  meta.status = meta.status ?? {};
  meta.status.invited = meta.status.invited ?? {};
  meta.status.invited[status] = true;
  return meta;
};

const sendBatch = async ({
  ctx,
  status,
  getOptions,
}: {
  ctx: TRPCContext;
  status: ApplicationStatus;
  getOptions: (params: { application: Application }) => Promise<SendMailOptions>;
}) => {
  const applicationsToUpdate = await ctx.db
    .select()
    .from(applications)
    .where(eq(applications.status, status));

  const batch = applicationsToUpdate.map(async (application) => {
    if (!shouldSendEmail(application, status)) {
      return;
    }

    try {
      const options = await getOptions({ application });
      await ctx.transporter.sendMail(options);
      await ctx.db
        .update(applications)
        .set({
          meta: markAsInvited(application, status),
        })
        .where(eq(applications.id, application.id));
    } catch (error) {
      console.error(error);
    }
  });

  await Promise.all(batch);
};

export const mailRouter = createTRPCRouter({
  sendPhoneInterview: protectedProcedure
    .input(z.object({}))
    .mutation(async ({ ctx }) => {
      await sendBatch({
        ctx,
        status: ApplicationStatus.PHONE_INTERVIEW_PHASE,
        getOptions: getSendPhoneInterviewOptions,
      });
    }),

  sendOnsiteInterview: protectedProcedure
    .input(z.object({}))
    .mutation(async ({ ctx }) => {
      await sendBatch({
        ctx,
        status: ApplicationStatus.ONSITE_INTERVIEW_PHASE,
        getOptions: getSendOnsiteInterviewOptions,
      });
    }),

  sendAcceptance: protectedProcedure
    .input(z.object({}))
    .mutation(async ({ ctx }) => {
      await sendBatch({
        ctx,
        status: ApplicationStatus.ACCEPTED,
        getOptions: getAcceptedOptions,
      });
    }),

  sendRejection: protectedProcedure
    .input(z.object({}))
    .mutation(async ({ ctx }) => {
      await sendBatch({
        ctx,
        status: ApplicationStatus.REJECTED,
        getOptions: getRejectedOptions,
      });
    }),
});
