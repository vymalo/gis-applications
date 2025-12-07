import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import SuperJSON from 'superjson';

import type { AppRouter } from '@app/server/api/root';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

export const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: SuperJSON,
    }),
  ],
});

