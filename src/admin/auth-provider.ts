import { trpcClient } from '@app/trpc/client';
import { authClient } from '@app/auth/client';
import type { AuthProvider } from 'ra-core';

export const adminAuthProvider: AuthProvider = {
  login: async (params?: { email?: string }) => {
    // Admin login via magic link. RA can pass email in params; otherwise prompt.
    let email = params?.email as string | undefined;
    if (!email && typeof window !== 'undefined') {
      email = window.prompt('Admin email for login') ?? undefined;
    }
    if (!email) return;

    await authClient.signIn.magicLink({
      email,
      callbackURL: '/applications',
    });
  },
  logout: async () => {
    await authClient.signOut();
  },
  checkAuth: async () => {
    const { user } = await trpcClient.auth.me.query();

    if (!user || user.role !== 'ADMIN') {
      return Promise.reject();
    }

    return Promise.resolve();
  },
  checkError: async () => {
    return Promise.resolve();
  },
  getIdentity: async () => {
    const { user } = await trpcClient.auth.me.query();

    if (!user) {
      return Promise.reject();
    }

    return Promise.resolve({
      id: user.id ?? '',
      fullName: (user.name as string | null) ?? (user.email as string | null) ?? '',
      email: (user.email as string | null) ?? '',
    });
  },
  getPermissions: async () => {
    const { user } = await trpcClient.auth.me.query();
    return user?.role ?? null;
  },
};
