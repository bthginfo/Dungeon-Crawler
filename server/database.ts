import { neon } from '@neondatabase/serverless';
export function database() {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!url) throw new Error('Database is not configured');
  return neon(url);
}
export function configured() {
  return Boolean(
    (process.env.DATABASE_URL ?? process.env.POSTGRES_URL) &&
    process.env.SESSION_SECRET &&
    process.env.SESSION_SECRET.length >= 32,
  );
}
