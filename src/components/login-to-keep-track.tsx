'use client';

import { authClient } from '@app/auth/client';
import { LogIn } from 'react-feather';

export function LoginToKeepTrack() {
  async function onClick() {
    // Primary login: magic link via email. For now we just prompt for email;
    // this can be replaced by a proper form later.
    const email = window.prompt('Enter your email to receive a login link');
    if (!email) return;

    await authClient.signIn.magicLink({
      email,
      callbackURL: '/apply',
    });
  }

  return (
    <button
      className='btn btn-soft btn-primary'
      type='button'
      onClick={onClick}>
      <span>Sign in</span>
      <LogIn />
    </button>
  );
}
