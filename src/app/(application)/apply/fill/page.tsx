import { FoundPreviousApplication } from '@app/components/found-previous-application';
import { LoginToKeepTrack } from '@app/components/login-to-keep-track';
import { SingleApply } from '@app/components/single-apply';
import { auth } from '@app/server/auth/better-auth';
import { api, HydrateClient } from '@app/trpc/server';
import { ApplicationStatus } from '@app/types/application-status';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function ApplyFill() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return (
      <HydrateClient>
        <main className='flex flex-col gap-4'>
          <section className='flex flex-col gap-4'>
            <h1 className='app-title'>Sign in to apply</h1>
            <p>
              You need to sign in with your email before you can start and
              submit an application. This allows you to save your progress and
              come back later.
            </p>
            <div>
              <LoginToKeepTrack />
            </div>
          </section>
        </main>
      </HydrateClient>
    );
  }

  const [previousApplications, draftApplication] = await Promise.all([
    api.application.getUserApplication(),
    api.application.getUserDraftApplication(),
  ]);

  const actionableDraft =
    draftApplication ??
    previousApplications.find(
      (application) =>
        application.status === ApplicationStatus.NEED_APPLICANT_INTERVENTION,
    ) ??
    null;

  const submittedApplications = previousApplications.filter(
    (application) =>
      application.status !== ApplicationStatus.NEED_APPLICANT_INTERVENTION &&
      application.status !== ApplicationStatus.DRAFT,
  );

  if (!actionableDraft && submittedApplications.length) {
    const target = submittedApplications[0];
    redirect(
      target ? `/apply/follow?application_id=${target.id}` : '/apply/follow',
    );
  }

  return (
    <HydrateClient>
      <main className='flex flex-col gap-4'>
        {submittedApplications.length > 0 && (
          <FoundPreviousApplication application={submittedApplications[0]!} />
        )}

        <SingleApply
          user={session.user}
          application={actionableDraft}
        />
      </main>
    </HydrateClient>
  );
}
