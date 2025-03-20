import { MainLayout } from '@app/components/layouts/main';

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <MainLayout>
      <>{children}</>
    </MainLayout>
  );
}
