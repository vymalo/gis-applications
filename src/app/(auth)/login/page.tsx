import { LoginToKeepTrack } from '@app/components/login-to-keep-track';

export default async function LoginPage() {
  return (
    <div className='flex flex-col gap-4'>
      <h1 className='app-title'>Login gateway</h1>

      <LoginToKeepTrack />
    </div>
  );
}
