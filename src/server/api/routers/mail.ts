import { eq, sql } from 'drizzle-orm';
import {
  createTRPCRouter,
  protectedProcedure,
  type TRPCContext,
} from '@app/server/api/trpc';
import {
  applications,
  type Application,
} from '@app/server/db/schema';
import { buildApplicationData } from '@app/server/application-normalizer';
import type { ApplicationData } from '@app/types/application-data';
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
  const invited = application.metaInvitedStatuses ?? {};
  return !invited?.[status];
};

const markAsInvited = (
  application: Application,
  status: ApplicationStatus,
): Application['metaInvitedStatuses'] => ({
  ...(application.metaInvitedStatuses ?? {}),
  [status]: true,
});

const sendBatch = async ({
  ctx,
  status,
  getOptions,
}: {
  ctx: TRPCContext;
  status: ApplicationStatus;
  getOptions: (params: {
    application: Application;
    data: ApplicationData;
  }) => Promise<SendMailOptions>;
}) => {
  const applicationsToUpdate = await ctx.db
    .select()
    .from(applications)
    .where(eq(applications.status, status));

  const batch = applicationsToUpdate.map(async (application) => {
    if (!shouldSendEmail(application, status)) {
      return;
    }

    const data = buildApplicationData(application);

    try {
      const options = await getOptions({ application, data });
      await ctx.transporter.sendMail(options);
      await ctx.db
        .update(applications)
        .set({
          metaInvitedStatuses: markAsInvited(application, status),
          updatedAt: sql`now()`,
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
