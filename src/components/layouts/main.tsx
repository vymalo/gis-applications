import { MainFooter } from '@app/components/layouts/main-footer';
import { MainHeader } from '@app/components/layouts/main-header';
import { type PropsWithChildren } from 'react';

export async function MainLayout({ children }: PropsWithChildren) {
  return (
    <>
      <MainHeader />
      <div className='container mx-auto max-w-xl px-4'>{children}</div>
      <MainFooter />
    </>
  );
}
