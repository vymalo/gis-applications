import { FoundPreviousApplication } from '@app/components/found-previous-application';
import { LoginToKeepTrack } from '@app/components/login-to-keep-track';
import { SingleApply } from '@app/components/single-apply';
import { auth } from '@app/server/auth';
import { api, HydrateClient } from '@app/trpc/server';
import type { Application, User } from '@prisma/client';

export default async function ApplyNow() {
  const session = await auth();
  let application: (Application & { createdBy: User | null }) | null = null;

  if (session?.user) {
    application = await api.application.getUserApplication();
  }

  return (
    <HydrateClient>
      <main className='flex flex-col gap-4'>
        {application && <FoundPreviousApplication application={application} />}
        {!session?.user && <LoginToKeepTrack />}
        <SingleApply />
      </main>
    </HydrateClient>
  );
}
