import { signOut } from '@app/server/auth';
import { LogOut } from 'react-feather';

export function Logout() {
  return (
    <form
      action={async () => {
        'use server';
        await signOut();
      }}>
      <button className='btn btn-soft btn-error btn-circle' type='submit'>
        <LogOut />
      </button>
    </form>
  );
}
