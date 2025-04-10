import { LoginToKeepTrack } from '@app/components/login-to-keep-track';
import { Logout } from '@app/components/logout';
import { ThemeToggle } from '@app/components/theme';
import { auth } from '@app/server/auth';
import Link from 'next/link';
import { ArrowRight } from 'react-feather';

export async function MainHeader() {
  const session = await auth();
  return (
    <header>
      <div className='container mx-auto my-4 max-w-xl px-4'>
        <div className='flex flex-row items-center justify-between'>
          <h1 className='app-title'>Apply!</h1>

          <div className='flex flex-row gap-2'>
            {!session && <LoginToKeepTrack />}
            {session && <Logout />}

            <ThemeToggle />

            <Link className='btn btn-outline btn-primary' href='/apply'>
              <span>Apply here</span>
              <ArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
