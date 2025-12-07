import { env } from '@app/env';
import moment from 'moment/moment';
import { redirect } from 'next/navigation';
import { type PropsWithChildren } from 'react';
import { auth } from '@app/server/auth/better-auth';
import { headers } from 'next/headers';

export default async function ApplyLayout({ children }: PropsWithChildren) {
  const isPastDeadline = moment().isAfter(env.APP_LAST_APPLICATION_DATE);
  if (isPastDeadline) {
    redirect('/closed');
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/login');
  }

  return <>{children}</>;
}
