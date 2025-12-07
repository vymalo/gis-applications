import { auth } from '@app/server/auth/better-auth';
import { api } from '@app/trpc/server';
import { ApplicationStatus } from '@app/types/application-status';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function ApplyRouter() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect('/apply/fill');
  }

  const [previousApplications, draftApplication] = await Promise.all([
    api.application.getUserApplication(),
    api.application.getUserDraftApplication(),
  ]);

  const requiresApplicantAction =
    !!draftApplication ||
    previousApplications.some(
      (application) =>
        application.status === ApplicationStatus.NEED_APPLICANT_INTERVENTION,
    );

  const submittedApplications = previousApplications.filter(
    (application) =>
      application.status !== ApplicationStatus.NEED_APPLICANT_INTERVENTION &&
      application.status !== ApplicationStatus.DRAFT,
  );

  if (requiresApplicantAction || !submittedApplications.length) {
    redirect('/apply/fill');
  }

  const targetApplication = submittedApplications[0];
  const followUrl = targetApplication
    ? `/apply/follow?application_id=${targetApplication.id}`
    : '/apply/follow';

  redirect(followUrl);
}
