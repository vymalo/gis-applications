import type { Application, User } from '@prisma/client';

declare global {
  namespace PrismaJson {
    type AppJsonType = string | Record<string, AppJsonType>;
  }
}

declare module 'next-compose-plugins' {
  import { type NextConfig } from 'next';

  type NextConfigFunction = (nextConfig: NextConfig) => NextConfig;

  export default function withPlugins(
    plugins: [NextConfigFunction][],
    nextConfig: NextConfig,
  ): NextConfig;
}

declare type ApplicationUser = Omit<Application, 'createdById'> & {
  createdBy: User | null;
};
