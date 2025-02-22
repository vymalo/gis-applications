import { MainLayout } from "@app/components/layouts/main";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <MainLayout>
      <>{children}</>
    </MainLayout>
  );
}
