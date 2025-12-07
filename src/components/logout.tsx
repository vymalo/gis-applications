import { authClient } from '@app/auth/client';
import { LogOut } from 'react-feather';

export function Logout() {
  return (
    <button
      className="btn btn-soft btn-error btn-circle"
      type="button"
      onClick={async () => {
        await authClient.signOut();
        // Optional: force navigation to clear any cached UI
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }}>
      <LogOut />
    </button>
  );
}
