import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { admin, haveIBeenPwned, magicLink } from 'better-auth/plugins';
import { getMagicLinkOptions } from '@app/server/mails/send';
import { transporter } from '@app/server/nodemailer';
import { db } from '@app/server/db';
import * as schema from '@app/server/db/schema';

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
  //experimental: { joins: true },
  appName: 'GIS Applications',
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      ...schema,
    }
  }),
  session: {
    // 30 minutes in seconds
    expiresIn: 60 * 60 * 3, // 3h
    updateAge: 60 * 60 * 7, // 7h
  },
  plugins: [
    // Primary login for regular users: one-time magic link sent by email.
    magicLink({
      async sendMagicLink({ email, url }) {
        const options = await getMagicLinkOptions({ email, url });
        await transporter.sendMail(options);
      },
    }),
    haveIBeenPwned(),
    nextCookies(),
    admin(),
  ],
  // Note: BETTER_AUTH_SECRET and BETTER_AUTH_URL are read from process.env
  // by Better Auth itself. They are also validated in `src/env.js`.
});
