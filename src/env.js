import { createEnv } from '@t3-oss/env-nextjs';
import moment from 'moment';
import { z } from 'zod';

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    AUTH_SECRET:
      process.env.NODE_ENV === 'production'
        ? z.string()
        : z.string().optional(),
    AUTH_KEYCLOAK_ID: z.string(),
    AUTH_KEYCLOAK_SECRET: z.string(),
    AUTH_KEYCLOAK_ISSUER: z.string(),
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),

    S3_ENDPOINT: z.string(),
    S3_ACCESS_KEY: z.string(),
    S3_SECRET_KEY: z.string(),
    S3_PORT: z.number(),
    S3_SCHEME: z.string(),
    S3_BUCKET: z.string(),
    S3_CDN_URL: z.string(),

    APP_URL: z.string().url(),

    SMTP_URL: z.string().url(),
    SMTP_FROM: z.string(),
    SMTP_CC: z.string().optional(),
    SMTP_REPLY_TO: z.string(),

    AUTH_SESSION_MAX_AGE: z.string().transform(Number),
    AUTH_SESSION_UPDATE_AGE: z.string().transform(Number),

    APP_LAST_APPLICATION_DATE: z.string().transform((r) => moment(r)),

    REDIS_URL: z.string().url().optional(),
    REDIS_PREFIX: z.string().optional(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_KEYCLOAK_ID: process.env.AUTH_KEYCLOAK_ID,
    AUTH_KEYCLOAK_SECRET: process.env.AUTH_KEYCLOAK_SECRET,
    AUTH_KEYCLOAK_ISSUER: process.env.AUTH_KEYCLOAK_ISSUER,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,

    S3_ENDPOINT: process.env.S3_ENDPOINT,
    S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
    S3_SECRET_KEY: process.env.S3_SECRET_KEY,
    S3_PORT: Number(process.env.S3_PORT),
    S3_SCHEME: process.env.S3_SCHEME,
    S3_BUCKET: process.env.S3_BUCKET,
    S3_CDN_URL: process.env.S3_CDN_URL,

    APP_URL: process.env.APP_URL,

    SMTP_URL: process.env.SMTP_URL,
    SMTP_FROM: process.env.SMTP_FROM,
    SMTP_CC: process.env.SMTP_CC,
    SMTP_REPLY_TO: process.env.SMTP_REPLY_TO,

    AUTH_SESSION_MAX_AGE: process.env.AUTH_SESSION_MAX_AGE,
    AUTH_SESSION_UPDATE_AGE: process.env.AUTH_SESSION_UPDATE_AGE,

    APP_LAST_APPLICATION_DATE: process.env.APP_LAST_APPLICATION_DATE,
    
    REDIS_URL: process.env.REDIS_URL,
    REDIS_PREFIX: process.env.REDIS_PREFIX,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
