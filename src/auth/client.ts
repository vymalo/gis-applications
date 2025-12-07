import { createAuthClient } from 'better-auth/client';
import { magicLinkClient, twoFactorClient, multiSessionClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  plugins: [magicLinkClient(), twoFactorClient(), multiSessionClient()],
});
