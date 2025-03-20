import { FoundPreviousApplication } from '@app/components/found-previous-application';
import { LoginToKeepTrack } from '@app/components/login-to-keep-track';
import { SingleApply } from '@app/components/single-apply';
import { auth } from '@app/server/auth';
import { api, HydrateClient } from '@app/trpc/server';
import { type ApplicationUser } from 'app-types';
import { AlertTriangle } from 'react-feather';

export default async function ApplyNow() {
  const session = await auth();
  let application: ApplicationUser[] = [];

  if (session?.user) {
    application = await api.application.getUserApplication();
  }

  return (
    <HydrateClient>
      <main className='flex flex-col gap-4'>
        {application.length === 1 && (
          <FoundPreviousApplication application={application[0]!} />
        )}
        {!session?.user && (
          <>
            <div role='alert' className='alert alert-info'>
              <AlertTriangle />
              <span>Logging in helps you track your application</span>
            </div>
            <LoginToKeepTrack />
          </>
        )}
        <SingleApply user={session?.user} />
      </main>
    </HydrateClient>
  );
}
