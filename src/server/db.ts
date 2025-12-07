import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { env } from '@app/env';

const createPgPool = () => new Pool({
  connectionString: env.DATABASE_URL,
  ssl:
    env.NODE_ENV === 'production'
      ? {
        rejectUnauthorized: false,
      }
      : undefined,
});

type Globals = {
  postgresClient?: ReturnType<typeof createPgPool>;
  drizzle?: ReturnType<typeof drizzle>;
};

const globalForDrizzle = globalThis as Globals;

const pgPool =
  globalForDrizzle.postgresClient ?? createPgPool();

if (env.NODE_ENV !== 'production') {
  globalForDrizzle.postgresClient = pgPool;
}

export const db =
  globalForDrizzle.drizzle ?? drizzle({ client: pgPool });

if (env.NODE_ENV !== 'production') {
  globalForDrizzle.drizzle = db;
}
