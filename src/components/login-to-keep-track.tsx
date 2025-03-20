import { signIn } from '@app/server/auth';
import { LogIn } from 'react-feather';

export function LoginToKeepTrack() {
  return (
    <form
      action={async () => {
        'use server';
        await signIn('keycloak');
      }}>
      <button className='btn btn-soft btn-primary' type='submit'>
        <span>Sign in</span>
        <LogIn />
      </button>
    </form>
  );
}
