import { Logout } from '@app/components/logout';
import { ToApplication } from '@app/components/to-application';
import { auth } from '@app/server/auth';
import { api, HydrateClient } from '@app/trpc/server';
import { type ApplicationUser } from '@app/types';
import Link from 'next/link';
import { ArrowRight } from 'react-feather';

export default async function Home() {
  const session = await auth();
  let applications: ApplicationUser[] = [];
  if (session?.user) {
    applications = await api.application.getUserApplication();
  }

  return (
    <HydrateClient>
      <main className='flex flex-col gap-4'>
        <p>Welcome! Here you can apply for our GIS Training Center</p>

        {applications.length > 0 && (
          <div className='flex flex-col gap-4'>
            <p>You have one application in progress</p>
            <div>
              <ToApplication application={applications[0]!} />
            </div>
            <p>
              To start a new application, you need to logout and login using
              another account
            </p>
          </div>
        )}

        {!applications.length && (
          <Link className='btn btn-soft btn-primary' href='/apply'>
            <span>Apply here</span>
            <ArrowRight />
          </Link>
        )}
      </main>
    </HydrateClient>
  );
}
