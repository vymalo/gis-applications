import { multiSessionLogin } from '@app/components/multi-session-login';

const MultiSessionLogin = multiSessionLogin;

export default function loginPage() {
  return (
    <div className='mx-auto flex max-w-3xl flex-col gap-6 px-2 sm:px-0'>
      <header className='flex flex-col gap-2'>
        <h1 className='app-title'>Sign in</h1>
        <p className='text-sm opacity-80'>
          Choose one of your saved sessions or request a new magic link. You can keep up to five concurrent sessions on this device.
        </p>
      </header>

      <MultiSessionLogin />
    </div>
  );
}
