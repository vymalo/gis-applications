import {PrismaAdapter} from "@auth/prisma-adapter";
import {type DefaultSession, type NextAuthConfig} from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

import {db} from "@app/server/db";
import {type UserRole} from "@prisma/client";
import {env} from "@app/env";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [KeycloakProvider],
  adapter: PrismaAdapter(db),

  session: {
    strategy: "database",
    // use validation environment variables
    maxAge: env.AUTH_SESSION_MAX_AGE,
    updateAge: env.AUTH_SESSION_UPDATE_AGE,
  },

  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
} satisfies NextAuthConfig;
