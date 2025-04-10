import { ThemeToggle } from '@app/components/theme';
import { type Metadata } from 'next';
import Link from 'next/link';
import { Home } from 'react-feather';

export const metadata: Metadata = {
  title: 'GIS Application Management',
  description: 'Internal GIS Application Management',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default async function ApplicationsLayout({
  children,
  application,
}: Readonly<{
  application: React.ReactNode;
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className='mb-2 flex flex-row items-center justify-between gap-4 md:mb-4'>
        <Link href='/applications' className='btn btn-outline btn-primary'>
          <Home />
          <span>Applications</span>
        </Link>

        <ThemeToggle />
      </div>

      {children}
      {application}
    </>
  );
}
