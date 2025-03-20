import { env } from '@app/env';
import moment from 'moment/moment';
import { redirect } from 'next/navigation';
import { type PropsWithChildren } from 'react';

export default async function ApplyLayout({ children }: PropsWithChildren) {
  const isPastDeadline = moment().isAfter(env.APP_LAST_APPLICATION_DATE);
  if (isPastDeadline) {
    redirect('/closed');
  }

  return <>{children}</>;
}
