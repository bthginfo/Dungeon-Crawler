import { randomBytes, scrypt, timingSafeEqual, createHash, createHmac } from 'node:crypto';
const options = { N: 131072, r: 8, p: 1, maxmem: 160 * 1024 * 1024 };
function derive(password: string, salt: string) {
  return new Promise<Buffer>((resolve, reject) =>
    scrypt(password, salt, 64, options, (e, key) => (e ? reject(e) : resolve(key))),
  );
}
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = await derive(password, salt);
  return `scrypt:131072:8:1:${salt}:${hash.toString('hex')}`;
}
export async function verifyPassword(password: string, encoded: string) {
  const [algorithm, n, r, p, salt, hash] = encoded.split(':');
  if (algorithm !== 'scrypt' || n !== '131072' || r !== '8' || p !== '1' || !salt || !hash)
    return false;
  const expected = Buffer.from(hash, 'hex'),
    actual = await derive(password, salt);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
export function sessionToken() {
  return randomBytes(32).toString('base64url');
}
export function tokenHash(token: string) {
  return createHash('sha256').update(token).digest('hex');
}
export function privateKey(value: string) {
  return createHmac('sha256', process.env.SESSION_SECRET ?? 'development-only-unconfigured')
    .update(value)
    .digest('hex');
}
export const DUMMY_PASSWORD =
  'scrypt:131072:8:1:00000000000000000000000000000000:00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
