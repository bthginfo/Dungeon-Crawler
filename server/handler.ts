import type { IncomingMessage, ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import { credentialsSchema, saveRequestSchema } from '../src/shared/validation.ts';
import { configured, database } from './database.ts';
import {
  DUMMY_PASSWORD,
  hashPassword,
  verifyPassword,
  sessionToken,
  tokenHash,
  privateKey,
} from './crypto.ts';
const cookieName = process.env.VERCEL ? '__Host-broadcast-session' : 'broadcast-session';
class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code);
  }
}
function respond(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify(data));
}
function originCheck(req: IncomingMessage) {
  const origin = req.headers.origin;
  if (!origin) throw new HttpError(403, 'invalid_origin');
  const expected = new Set(
    [
      process.env.APP_ORIGIN,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
      `${process.env.VERCEL ? 'https' : 'http'}://${req.headers.host}`,
    ].filter(Boolean),
  );
  if (!expected.has(origin)) throw new HttpError(403, 'invalid_origin');
}
async function body(req: IncomingMessage & { body?: unknown }) {
  if (!String(req.headers['content-type']).startsWith('application/json'))
    throw new HttpError(415, 'invalid_input');
  if (Number(req.headers['content-length'] ?? 0) > 270000) throw new HttpError(413, 'invalid_save');
  if (req.body !== undefined) {
    const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (Buffer.byteLength(JSON.stringify(data)) > 270000) throw new HttpError(413, 'invalid_save');
    return data;
  }
  let bytes = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    const b = Buffer.from(chunk);
    bytes += b.length;
    if (bytes > 270000) throw new HttpError(413, 'invalid_save');
    chunks.push(b);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new HttpError(400, 'invalid_input');
  }
}
async function owner(req: IncomingMessage) {
  const raw = (req.headers.cookie ?? '')
    .split(';')
    .map((s) => s.trim())
    .find((s) => s.startsWith(cookieName + '='))
    ?.slice(cookieName.length + 1);
  if (!raw || raw.length > 100) return null;
  const rows =
    await database()`SELECT u.id,u.username FROM crawler_sessions s JOIN crawler_users u ON u.id=s.owner WHERE s.token_hash=${tokenHash(raw)} AND s.expires_at>now()`;
  return rows[0] as { id: string; username: string } | undefined;
}
async function throttle(req: IncomingMessage, username: string, mode: string) {
  const ip = String(req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? 'unknown')
      .split(',')[0]
      .trim(),
    bucket = Math.floor(Date.now() / 900000);
  const ipkey = privateKey(`${mode}:ip:${ip}`),
    userkey = privateKey(`${mode}:user:${username}`);
  const rows =
    await database()`WITH pruned AS (DELETE FROM crawler_auth_limits WHERE bucket<${bucket - 8}), ip AS (INSERT INTO crawler_auth_limits(key,bucket,hits) VALUES(${ipkey},${bucket},1) ON CONFLICT(key,bucket) DO UPDATE SET hits=crawler_auth_limits.hits+1 RETURNING hits), account AS (INSERT INTO crawler_auth_limits(key,bucket,hits) VALUES(${userkey},${bucket},1) ON CONFLICT(key,bucket) DO UPDATE SET hits=crawler_auth_limits.hits+1 RETURNING hits) SELECT (SELECT hits FROM ip) AS ip_hits,(SELECT hits FROM account) AS account_hits`;
  if (Number(rows[0].ip_hits) > 20 || Number(rows[0].account_hits) > 60)
    throw new HttpError(429, 'rate_limited');
}
async function setSession(res: ServerResponse, userId: string) {
  const token = sessionToken();
  await database()`INSERT INTO crawler_sessions(token_hash,owner,expires_at) VALUES(${tokenHash(token)},${userId},now()+interval '30 days')`;
  res.setHeader(
    'Set-Cookie',
    `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${process.env.VERCEL ? '; Secure' : ''}`,
  );
}
export async function handleApi(req: IncomingMessage & { body?: unknown }, res: ServerResponse) {
  try {
    const url = new URL(req.url ?? '/api/health', `http://${req.headers.host ?? 'localhost'}`),
      route = url.searchParams.get('path') ?? url.pathname.replace(/^\/api\/?/, '');
    const method = req.method ?? 'GET';
    if (route === 'health') {
      respond(res, 200, { ok: true, version: '1.0.0', cloud: configured() });
      return;
    }
    if (route === 'session' && method === 'GET') {
      const user = configured() ? await owner(req) : null;
      respond(res, 200, { available: configured(), username: user?.username ?? null });
      return;
    }
    if (!configured()) throw new HttpError(503, 'unavailable');
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) originCheck(req);
    const db = database();
    if ((route === 'auth/register' || route === 'auth/login') && method === 'POST') {
      const result = credentialsSchema.safeParse(await body(req));
      if (!result.success) throw new HttpError(400, 'invalid_input');
      const { password } = result.data,
        username = result.data.username.toLowerCase();
      await throttle(req, username, route);
      if (route === 'auth/register') {
        const encoded = await hashPassword(password),
          id = randomUUID();
        let user;
        try {
          const rows =
            await db`INSERT INTO crawler_users(id,username,password_hash) VALUES(${id},${username},${encoded}) ON CONFLICT(username) DO NOTHING RETURNING id,username`;
          user = rows[0];
        } catch {
          throw new HttpError(503, 'unavailable');
        }
        if (!user) throw new HttpError(409, 'username_taken');
        await setSession(res, id);
        respond(res, 201, { username });
        return;
      }
      const users =
        await db`SELECT id,username,password_hash FROM crawler_users WHERE username=${username}`;
      const user = users[0];
      const valid = await verifyPassword(password, String(user?.password_hash ?? DUMMY_PASSWORD));
      if (!user || !valid) throw new HttpError(401, 'invalid_credentials');
      await setSession(res, String(user.id));
      respond(res, 200, { username: user.username });
      return;
    }
    if (route === 'auth/logout' && method === 'POST') {
      const raw = (req.headers.cookie ?? '')
        .split(';')
        .map((s) => s.trim())
        .find((s) => s.startsWith(cookieName + '='))
        ?.slice(cookieName.length + 1);
      if (raw) await db`DELETE FROM crawler_sessions WHERE token_hash=${tokenHash(raw)}`;
      res.setHeader(
        'Set-Cookie',
        `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${process.env.VERCEL ? '; Secure' : ''}`,
      );
      respond(res, 200, { ok: true });
      return;
    }
    const user = await owner(req);
    if (!user) throw new HttpError(401, 'unauthorized');
    if (route === 'saves') {
      const rawSlot = url.searchParams.get('slot');
      if (rawSlot === null && method === 'GET') {
        const rows =
          await db`SELECT slot,revision,snapshot->>'updatedAt' AS updated_at,snapshot->>'name' AS name,snapshot->>'classId' AS class_id,snapshot->>'floorUnlocked' AS floor,snapshot->>'level' AS level FROM crawler_saves WHERE owner=${user.id} ORDER BY slot`;
        const saves = rows.map((r) => ({
          slot: Number(r.slot),
          revision: Number(r.revision),
          name: r.name,
          classId: r.class_id,
          floor: Number(r.floor),
          level: Number(r.level),
          updatedAt: Number(r.updated_at),
        }));
        respond(res, 200, { saves });
        return;
      }
      if (rawSlot === null || !['0', '1', '2'].includes(rawSlot))
        throw new HttpError(400, 'invalid_input');
      const slot = Number(rawSlot);
      if (method === 'GET') {
        const rows =
          await db`SELECT revision,snapshot FROM crawler_saves WHERE owner=${user.id} AND slot=${slot}`;
        if (!rows.length) throw new HttpError(404, 'not_found');
        respond(res, 200, { revision: Number(rows[0].revision), campaign: rows[0].snapshot });
        return;
      }
      if (method === 'PUT') {
        const parsed = saveRequestSchema.safeParse(await body(req));
        if (!parsed.success || parsed.data.campaign.slot !== slot)
          throw new HttpError(400, 'invalid_save');
        const { campaign, expectedRevision, mutationId } = parsed.data;
        if (Buffer.byteLength(JSON.stringify(campaign)) > 256 * 1024)
          throw new HttpError(413, 'invalid_save');
        const snapshot = JSON.stringify(campaign);
        const rows =
          await db`WITH receipt AS MATERIALIZED (SELECT revision FROM crawler_save_receipts WHERE owner=${user.id} AND mutation_id=${mutationId}), existing AS MATERIALIZED (SELECT revision FROM crawler_saves WHERE owner=${user.id} AND slot=${slot}), changed AS (INSERT INTO crawler_saves(owner,slot,revision,snapshot,updated_at) SELECT ${user.id},${slot},1,${snapshot}::jsonb,now() WHERE NOT EXISTS(SELECT 1 FROM receipt) AND (${expectedRevision}=0 OR EXISTS(SELECT 1 FROM existing WHERE revision=${expectedRevision})) ON CONFLICT(owner,slot) DO UPDATE SET previous=crawler_saves.snapshot,snapshot=EXCLUDED.snapshot,revision=crawler_saves.revision+1,updated_at=now() WHERE crawler_saves.revision=${expectedRevision} RETURNING revision), logged AS (INSERT INTO crawler_save_receipts(owner,mutation_id,slot,revision) SELECT ${user.id},${mutationId},${slot},revision FROM changed ON CONFLICT(owner,mutation_id) DO NOTHING RETURNING revision), pruned AS (DELETE FROM crawler_save_receipts WHERE owner=${user.id} AND created_at<now()-interval '7 days') SELECT revision FROM receipt UNION ALL SELECT revision FROM logged LIMIT 1`;
        if (!rows.length) throw new HttpError(409, 'conflict');
        respond(res, 200, { revision: Number(rows[0].revision) });
        return;
      }
      if (method === 'DELETE') {
        await db.transaction([
          db`DELETE FROM crawler_saves WHERE owner=${user.id} AND slot=${slot}`,
          db`DELETE FROM crawler_save_receipts WHERE owner=${user.id} AND slot=${slot}`,
        ]);
        respond(res, 200, { ok: true });
        return;
      }
    }
    if (route === 'account' && method === 'DELETE') {
      await db`DELETE FROM crawler_users WHERE id=${user.id}`;
      res.setHeader(
        'Set-Cookie',
        `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${process.env.VERCEL ? '; Secure' : ''}`,
      );
      respond(res, 200, { ok: true });
      return;
    }
    throw new HttpError(404, 'not_found');
  } catch (e) {
    if (e instanceof HttpError) {
      if (e.status === 429) res.setHeader('Retry-After', '900');
      respond(res, e.status, { code: e.code });
    } else respond(res, 503, { code: 'unavailable' });
  }
}
