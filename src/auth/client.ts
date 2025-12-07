import { createAuthClient } from 'better-auth/client';
import { magicLinkClient, multiSessionClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  plugins: [magicLinkClient(), multiSessionClient()],
});
