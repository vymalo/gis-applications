import { SingleApply } from '@app/components/single-apply';
import { env } from '@app/env';
import { auth } from '@app/server/auth';
import { api, HydrateClient } from '@app/trpc/server';
import moment from 'moment';
import { notFound } from 'next/navigation';

export default async function ApplicationAgain({
  params,
}: {
  params: Promise<{ application_id: string }>;
}) {
  if (env.APP_LAST_APPLICATION_DATE.isBefore(moment())) {
    return null;
  }

  const session = await auth();
  const { application_id } = await params;
  const application = await api.application
    .getApplication({
      id: application_id,
    })
    .catch((err) => {
      console.warn(err);
      return null;
    });

  if (!application) {
    notFound();
  }

  if (application.status !== 'INIT') {
    return (
      <main className='flex flex-col gap-4'>
        <h1 className='app-title md:col-span-2'>
          Submitted already!
        </h1>
        <p>
          This application was already submitted!
        </p>
        <p>
          When an application is submitted, it cannot be changed. Please consult
          your mailbox (for <span className='underline italic'>{application.email}</span>) for more updates.
        </p>
      </main>
    );
  }

  return (
    <HydrateClient>
      <main>
        <SingleApply application={application} user={session?.user} />
      </main>
    </HydrateClient>
  );
}
