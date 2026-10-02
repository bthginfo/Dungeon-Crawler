import { readFile } from 'node:fs/promises';
import { neon } from '@neondatabase/serverless';
const connection =
  process.env.DATABASE_URL_UNPOOLED ??
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.DATABASE_URL ??
  process.env.POSTGRES_URL;
if (!connection) throw new Error('Set DATABASE_URL in .env.local first.');
const source = await readFile(new URL('../migrations/001_initial.sql', import.meta.url), 'utf8');
const sql = neon(connection);
const statements = source
  .split(';')
  .map((s) => s.trim())
  .filter(Boolean);
await sql.transaction(statements.map((statement) => sql.query(statement, [])));
console.log('Database migration 001 applied successfully. No credentials were printed.');
