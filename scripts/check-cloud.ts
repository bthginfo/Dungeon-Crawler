import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createCampaign } from '../src/game/campaign';
import { generateWorld, TILE } from '../src/game/world';
import { Simulation } from '../src/game/engine';
import { DEFAULT_SETTINGS } from '../src/game/save';
const origin = process.argv[2] ?? 'http://127.0.0.1:5173';
const password = randomUUID() + randomUUID();
let cookie = '',
  secondCookie = '';
async function request(
  path: string,
  method = 'GET',
  body?: unknown,
  session = cookie,
  requestOrigin = origin,
) {
  const response = await fetch(`${origin}/api/${path}`, {
    method,
    headers: {
      Origin: requestOrigin,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(session ? { Cookie: session } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  return { response, data };
}
let passed = 0;
function check(value: unknown, label: string) {
  assert.ok(value, label);
  passed++;
  console.log(`PASS ${label}`);
}
try {
  const name = `qa_${randomUUID().replaceAll('-', '').slice(0, 16)}`;
  const registration = await request('auth/register', 'POST', { username: name, password });
  check(registration.response.status === 201, 'username/password registration');
  cookie = registration.response.headers.get('set-cookie')!.split(';')[0];
  check((await request('session')).data.username === name, 'session cookie authenticates');
  const c = createCampaign('breaker', 'Cloud QA', 0);
  const mutationId = randomUUID();
  const first = await request('saves?slot=0', 'PUT', {
    campaign: c,
    expectedRevision: 0,
    mutationId,
  });
  check(first.response.status === 200 && first.data.revision === 1, 'first cloud save');
  const repeat = await request('saves?slot=0', 'PUT', {
    campaign: c,
    expectedRevision: 0,
    mutationId,
  });
  check(repeat.data.revision === 1, 'retry is idempotent');
  check(
    (
      await request('saves?slot=0', 'PUT', {
        campaign: c,
        expectedRevision: 0,
        mutationId: randomUUID(),
      })
    ).response.status === 409,
    'stale write cannot replace newer save',
  );
  c.scrap = 420;
  c.updatedAt++;
  check(
    (
      await request('saves?slot=0', 'PUT', {
        campaign: c,
        expectedRevision: 1,
        mutationId: randomUUID(),
      })
    ).data.revision === 2,
    'revision advances atomically',
  );
  check((await request('saves?slot=0')).data.campaign.scrap === 420, 'saved progress loads');
  check((await request('saves')).data.saves[0].level === 1, 'new devices can discover cloud slots');
  c.world = generateWorld(1, 123, 'breaker');
  const room = c.world.rooms.find((r) => r.kind === 'combat')!;
  c.world.player.x = (room.x + room.w / 2) * TILE;
  c.world.player.y = (room.y + room.h / 2) * TILE;
  const sim = new Simulation(c.world, c, structuredClone(DEFAULT_SETTINGS), {
    kill() {},
    room() {},
    death() {},
    feedback() {},
  });
  sim.spawnRoom(room);
  for (let t = 0; t < 120; t++)
    sim.step(1 / 60, { moveX: 0, moveY: 0, aimX: 400, aimY: 400, attacking: false });
  c.world.combat = sim.combatState();
  check(
    (
      await request('saves?slot=0', 'PUT', {
        campaign: c,
        expectedRevision: 2,
        mutationId: randomUUID(),
      })
    ).data.revision === 3,
    'active world and combat state pass server validation',
  );
  check(
    (await request('saves?slot=0')).data.campaign.world.enemies.length === c.world.enemies.length,
    'active expedition reload retains enemies',
  );
  check(
    (await request('saves?slot=0', 'GET', undefined, '')).response.status === 401,
    'guests cannot read cloud saves',
  );
  const other = await request('auth/register', 'POST', { username: name + '_b', password }, '');
  check(other.response.status === 201, 'second account registration');
  secondCookie = other.response.headers.get('set-cookie')!.split(';')[0];
  check(
    (await request('saves?slot=0', 'GET', undefined, secondCookie)).response.status === 404,
    'account ownership isolates saves',
  );
  check(
    (
      await request('saves?slot=0', 'PUT', {
        campaign: { ...c, level: -1 },
        expectedRevision: 3,
        mutationId: randomUUID(),
      })
    ).response.status === 400,
    'invalid snapshots are rejected',
  );
  check(
    (await request('saves?slot=0', 'DELETE', undefined, cookie, 'https://untrusted.example'))
      .response.status === 403,
    'cross-origin write is rejected',
  );
  await request('auth/logout', 'POST', {});
  check((await request('session')).data.username === null, 'logout invalidates session');
  check(
    (await request('auth/login', 'POST', { username: name, password: 'wrongpassword123' }, ''))
      .response.status === 401,
    'incorrect password is rejected',
  );
  const login = await request('auth/login', 'POST', { username: name, password }, '');
  check(login.response.status === 200, 'password login restores account');
  cookie = login.response.headers.get('set-cookie')!.split(';')[0];
  check((await request('saves?slot=0')).data.campaign.scrap === 420, 'save persists across login');
  console.log(`${passed} live cloud checks passed. Temporary accounts will be deleted.`);
} finally {
  if (cookie) await request('account', 'DELETE', undefined, cookie);
  if (secondCookie) await request('account', 'DELETE', undefined, secondCookie);
}
