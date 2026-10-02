import { it, expect } from 'vitest';
import { hashPassword, verifyPassword, tokenHash, sessionToken } from '../server/crypto';
import { credentialsSchema, campaignSchema } from '../src/shared/validation';
import { createCampaign } from '../src/game/campaign';
import { sameCampaign } from '../src/game/state';
it('password hashes are salted and reject wrong passwords', async () => {
  const hash = await hashPassword('a-long-test-password');
  expect(hash).not.toContain('a-long-test-password');
  expect(await verifyPassword('a-long-test-password', hash)).toBe(true);
  expect(await verifyPassword('another-test-password', hash)).toBe(false);
}, 20000);
it('opaque session tokens are unique and stored by hash', () => {
  const a = sessionToken(),
    b = sessionToken();
  expect(a).not.toBe(b);
  expect(tokenHash(a)).not.toBe(a);
  expect(tokenHash(a)).toHaveLength(64);
});
it('only bounded username/password credentials are accepted', () => {
  expect(
    credentialsSchema.safeParse({ username: 'Crawler_1', password: 'long-password123' }).success,
  ).toBe(true);
  expect(
    credentialsSchema.safeParse({ username: '<script>', password: 'long-password123' }).success,
  ).toBe(false);
  expect(credentialsSchema.safeParse({ username: 'valid', password: 'short' }).success).toBe(false);
});
it('rejects oversized inventories, invalid levels and unsupported schemas', () => {
  const c = createCampaign('breaker', 'QA');
  expect(campaignSchema.safeParse(c).success).toBe(true);
  expect(campaignSchema.safeParse({ ...c, level: 21 }).success).toBe(false);
  expect(campaignSchema.safeParse({ ...c, schema: 99 }).success).toBe(false);
  expect(
    campaignSchema.safeParse({ ...c, inventory: Array(25).fill(c.inventory[0]) }).success,
  ).toBe(false);
});
it('cloud equality tolerates JSONB key ordering but never hides divergent progress behind equal timestamps', () => {
  const c = createCampaign('breaker', 'QA'),
    cloud = Object.fromEntries(Object.entries(c).reverse()) as typeof c;
  cloud.updatedAt += 1000;
  expect(sameCampaign(c, cloud)).toBe(true);
  cloud.scrap++;
  cloud.updatedAt = c.updatedAt;
  expect(sameCampaign(c, cloud)).toBe(false);
});
