import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { admin, magicLink, multiSession, twoFactor } from 'better-auth/plugins';
import { getMagicLinkOptions } from '@app/server/mails/send';
import { transporter } from '@app/server/nodemailer';
import { db } from '@app/server/db';

/**
 * Better Auth configuration using the Drizzle adapter.
 *
 * This file is intentionally kept separate from the existing NextAuth-based
 * `src/server/auth/index.ts` so we can introduce Better Auth alongside
 * NextAuth and migrate usage incrementally.
 *
 * The CLI (`@better-auth/cli`) expects an exported `auth` instance.
 */
export const auth = betterAuth({
  experimental: { joins: true },
  appName: 'GIS Applications',
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  session: {
    // 30 minutes in seconds
    expiresIn: 60 * 30, // 30min
    updateAge: 60 * 60 * 2, // 2h
  },
  plugins: [
    // Primary login for regular users: one-time magic link sent by email.
    magicLink({
      async sendMagicLink({ email, url }) {
        const options = await getMagicLinkOptions({ email, url });
        await transporter.sendMail(options);
      },
    }),
    multiSession(),
    nextCookies(),
    admin(),
  ],
  // Note: BETTER_AUTH_SECRET and BETTER_AUTH_URL are read from process.env
  // by Better Auth itself. They are also validated in `src/env.js`.
});
