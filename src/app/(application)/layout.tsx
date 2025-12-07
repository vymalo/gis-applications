import { Logout } from '@app/components/logout';
import { ThemeToggle } from '@app/components/theme';
import { auth } from '@app/server/auth/better-auth';
import { type Metadata } from 'next';
import Link from 'next/link';
import { type PropsWithChildren } from 'react';
import { ArrowLeft } from 'react-feather';
import { headers } from 'next/headers';

export const metadata: Metadata = {
  title: 'Apply for GIS',
  description: 'Apply for GIS',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default async function RootLayout({
  children,
}: Readonly<PropsWithChildren>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return (
    <div className='container mx-auto w-full max-w-3xl p-4'>
      <div className='mb-2 flex flex-row items-center justify-between gap-4 md:mb-4'>
        <Link href='/' className='btn btn-outline btn-primary'>
          <ArrowLeft />
          <span>Home</span>
        </Link>

        <div className='flex flex-row items-center gap-2'>
          <ThemeToggle />
          {session && <Logout />}
        </div>
      </div>

      <>{children}</>
    </div>
  );
}
