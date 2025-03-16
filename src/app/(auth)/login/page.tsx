import { LoginToKeepTrack } from '@app/components/login-to-keep-track';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  const { redirect_url } = await searchParams;
  return (
    <div className='flex flex-col gap-4'>
      <h1 className='app-title'>Login gateway</h1>

      <LoginToKeepTrack />
    </div>
  );
}
