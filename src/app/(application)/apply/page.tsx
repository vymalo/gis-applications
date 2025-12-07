import { FoundPreviousApplication } from '@app/components/found-previous-application';
import { LoginToKeepTrack } from '@app/components/login-to-keep-track';
import { SingleApply } from '@app/components/single-apply';
import { auth } from '@app/server/auth/better-auth';
import { api, HydrateClient } from '@app/trpc/server';
import { type ApplicationUser } from 'app-types';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AlertTriangle } from 'react-feather';

export default async function ApplyNow() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const application = await api.application.getUserApplication();

  return (
    <HydrateClient>
      <main className='flex flex-col gap-4'>
        {application.length === 1 && (
          <FoundPreviousApplication application={application[0]!} />
        )}
        <SingleApply user={session?.user} />
      </main>
    </HydrateClient>
  );
}
