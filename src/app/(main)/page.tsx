import { Logout } from '@app/components/logout';
import { ToApplication } from '@app/components/to-application';
import { auth } from '@app/server/auth';
import { api, HydrateClient } from '@app/trpc/server';
import type { Application, User } from '@prisma/client';
import Link from 'next/link';
import { ArrowRight } from 'react-feather';

export default async function Home() {
  const session = await auth();
  let application:
    | (Omit<Application, 'createdById'> & { createdBy: User })
    | null = null;
  if (session?.user) {
    application = await api.application.getUserApplication();
  }

  return (
    <HydrateClient>
      <main>
        <p>Welcome!</p>

        {application && (
          <>
            <p>Your application is in progress</p>
            <ToApplication application={application} />
            <p>
              To start a new application, you need to logout and login using
              another account
            </p>

            <Logout />
          </>
        )}

        {!application && (
          <Link className='btn btn-soft btn-primary' href='/apply'>
            <span>Apply here</span>
            <ArrowRight />
          </Link>
        )}
      </main>
    </HydrateClient>
  );
}
