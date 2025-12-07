import { auth } from '@app/server/auth/better-auth';
import { UserRole } from '@prisma/client';
import { type Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'GIS Application Management',
  description: 'Internal GIS Application Management',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/login');
  }

  if ((session?.user as any)?.role !== UserRole.ADMIN) {
    redirect('/');
  }

  return <div className='container mx-auto max-w-7xl p-4'>{children}</div>;
}
