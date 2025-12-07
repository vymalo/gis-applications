declare module 'app-types' {
  import type { Application, User } from '@app/server/db/schema';
  import type {
    ApplicationData,
    ApplicationMeta,
  } from '@app/types/application-data';

  declare type ApplicationUser = Omit<
    Application,
    'createdById' | 'data' | 'meta'
  > & {
    createdBy: User | null;
    data: ApplicationData;
    meta: ApplicationMeta | null;
  };
}

declare module 'next-compose-plugins' {
  import { type NextConfig } from 'next';

  type NextConfigFunction = (nextConfig: NextConfig) => NextConfig;

  export default function withPlugins(
    plugins: [NextConfigFunction][],
    nextConfig: NextConfig,
  ): NextConfig;
}
