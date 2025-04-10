import { ThemeToggle } from '@app/components/theme';
import { type Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'react-feather';

export const metadata: Metadata = {
  title: 'Auth',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className='container mx-auto max-w-xl p-4'>
      <div className='mb-2 flex flex-row items-center justify-between gap-4 md:mb-4'>
        <Link href='/' className='btn btn-outline btn-primary'>
          <ArrowLeft />
          <span>Home</span>
        </Link>

        <ThemeToggle />
      </div>
      {children}
    </div>
  );
}
