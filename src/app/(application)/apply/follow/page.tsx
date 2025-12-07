import { ApplicationStatusPipeline } from '@app/components/application-status-pipeline';
import { auth } from '@app/server/auth/better-auth';
import { api } from '@app/trpc/server';
import { ApplicationStatus } from '@app/types/application-status';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function FollowApplications({
  searchParams,
}: {
  searchParams: Promise<{ application_id?: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/apply/fill');
  }

  const [draftApplication, applications] = await Promise.all([
    api.application.getUserDraftApplication(),
    api.application.getUserApplication(),
  ]);
  
  console.log({draftApplication, applications});

  if (draftApplication) {
    redirect('/apply/fill');
  }

  const needsApplicant = applications.some(
    (application) =>
      application.status === ApplicationStatus.NEED_APPLICANT_INTERVENTION ||
      application.status === ApplicationStatus.DRAFT,
  );

  if (needsApplicant) {
    redirect('/apply/fill');
  }

  const submittedApplications = applications.filter(
    (application) =>
      application.status !== ApplicationStatus.NEED_APPLICANT_INTERVENTION &&
      application.status !== ApplicationStatus.DRAFT,
  );

  if (!submittedApplications.length) {
    redirect('/apply/fill');
  }

  const { application_id } = await searchParams;
  const selectedApplication =
    submittedApplications.find(
      (application) => application.id === application_id,
    ) ?? submittedApplications[0]!;

  return (
    <main className='flex flex-col gap-6'>
      <header className='flex flex-col gap-2'>
        <h1 className='app-title'>Follow your application</h1>
        <p className='opacity-80'>
          We&apos;ll email you whenever a step changes. You can also check
          progress here anytime.
        </p>
      </header>

      <div className='grid gap-4'>
        {submittedApplications.map((application) => (
          <ApplicationStatusPipeline
            key={application.id}
            application={application}
            isPrimary={application.id === selectedApplication.id}
          />
        ))}
      </div>
    </main>
  );
}
