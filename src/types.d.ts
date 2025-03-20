declare global {
  namespace PrismaJson {
    type AppJsonType = string | Record<string, AppJsonType>;
  }
}

declare module 'app-types' {
  import type { Application, User } from '@prisma/client';

  declare type ApplicationUser = Omit<Application, 'createdById'> & {
    createdBy: User | null;
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
