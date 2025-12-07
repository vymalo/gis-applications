import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { magicLink, multiSession } from 'better-auth/plugins';
import { getMagicLinkOptions } from '@app/server/mails/send';
import { transporter } from '@app/server/nodemailer';
import { db } from '@app/server/db';

/**
 * Better Auth configuration using the Prisma adapter.
 *
 * This file is intentionally kept separate from the existing NextAuth-based
 * `src/server/auth/index.ts` so we can introduce Better Auth alongside
 * NextAuth and migrate usage incrementally.
 *
 * The CLI (`@better-auth/cli`) expects an exported `auth` instance.
 */
export const auth = betterAuth({
  appName: 'GIS Applications',
  database: prismaAdapter(db, {
    provider: 'postgresql',
  }),
  session: {
    // 30 minutes in seconds
    expiresIn: 60 * 30,
    updateAge: 60 * 30,
  },
  plugins: [
    // Primary login for regular users: one-time magic link sent by email.
    magicLink({
      async sendMagicLink({ email, url }) {
        const options = await getMagicLinkOptions({ email, url });
        await transporter.sendMail(options);
      },
    }),
    // Allow multiple active sessions (e.g. different browsers/devices).
    multiSession(),
    // Integrates Better Auth with Next.js App Router cookies/session handling.
    nextCookies(),
  ],
  // Note: BETTER_AUTH_SECRET and BETTER_AUTH_URL are read from process.env
  // by Better Auth itself. They are also validated in `src/env.js`.
});
