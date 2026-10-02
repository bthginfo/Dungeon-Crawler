import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { CLASSES, FLOORS, ITEMS, floorBosses } from '../src/content';
import { Simulation, effectiveStats, type Input } from '../src/game/engine';
import { createCampaign } from '../src/game/campaign';
import { actor, generateWorld, moveActor, reachableTiles, TILE } from '../src/game/world';
import { DEFAULT_SETTINGS } from '../src/game/save';
import { campaignSchema } from '../src/shared/validation';
const quiet = { kill() {}, room() {}, death() {}, feedback() {} };
const input: Input = { moveX: 0, moveY: 0, aimX: 400, aimY: 400, attacking: false };
function fixture(floor = 1, classId = 'breaker', seed = 123) {
  const c = createCampaign(classId, 'Tests');
  c.createdAt = c.updatedAt = 1;
  c.world = generateWorld(floor, seed, classId);
  c.world.player.hp = effectiveStats(c).maxHp;
  return new Simulation(c.world, c, structuredClone(DEFAULT_SETTINGS), quiet);
}
describe('simulation', () => {
  it('reproduces a continued expedition exactly after JSON save/load', () => {
    const original = fixture();
    const combat = original.world.rooms.find((r) => r.kind === 'combat')!;
    original.world.player.x = (combat.x + combat.w / 2) * TILE;
    original.world.player.y = (combat.y + combat.h / 2) * TILE;
    for (let t = 0; t < 240; t++) original.step(1 / 60, { ...input, attacking: true });
    original.world.combat = original.combatState();
    const c = JSON.parse(JSON.stringify(original.campaign));
    const restored = new Simulation(c.world, c, structuredClone(DEFAULT_SETTINGS), quiet);
    for (let t = 0; t < 240; t++) {
      const i = { ...input, moveX: t < 60 ? 1 : 0 };
      original.step(1 / 60, { ...i });
      restored.step(1 / 60, { ...i });
    }
    expect(restored.world).toEqual(original.world);
    expect(restored.combatState()).toEqual(original.combatState());
  });
  it('has reachable interactions and preserves collision under varied seeds', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 0xffffffff }),
        fc.integer({ min: 1, max: 12 }),
        (seed, floor) => {
          const w = generateWorld(floor, seed, 'breaker'),
            reachable = reachableTiles(w);
          for (const o of w.objects)
            expect(reachable.has(`${Math.floor(o.x / TILE)},${Math.floor(o.y / TILE)}`)).toBe(true);
          const p = w.player;
          moveActor(w, p, -2000, 0);
          expect(p.x).toBeGreaterThan(0);
          expect(w.tiles[Math.floor(p.y / TILE)][Math.floor(p.x / TILE)]).not.toBe(0);
        },
      ),
      { numRuns: 300 },
    );
  }, 30000);
  it('all 360 boss/class matchups run without invalid state or unbounded summons', () => {
    for (const f of FLOORS)
      for (const cls of CLASSES)
        for (const def of [...floorBosses(f.index), ...f.minibosses]) {
          const s = fixture(f.index, cls.id);
          s.campaign.level = 20;
          s.recalculate();
          s.world.player.hp = 100000;
          const room = s.world.rooms.find((r) => r.kind === 'boss')!;
          const p = s.world.player;
          p.x = (room.x + room.w / 2) * TILE;
          p.y = (room.y + room.h / 2) * TILE;
          s.world.roomId = room.id;
          room.spawned = true;
          const enemy = actor(
            'matrix',
            def.id,
            def === f.boss ? 'boss' : 'guardian',
            p.x + 100,
            p.y - 80,
            room.id,
          );
          enemy.hp = enemy.maxHp = def.hp;
          enemy.damage = def.damage;
          enemy.speed = 78;
          s.world.enemies = [enemy];
          for (let t = 0; t < 360; t++) s.step(1 / 60, { ...input, aimX: enemy.x, aimY: enemy.y });
          expect(Number.isFinite(p.hp)).toBe(true);
          expect(s.world.enemies.filter((e) => !e.dead).length).toBeLessThanOrEqual(10);
          expect(s.world.effects.length).toBeLessThanOrEqual(150);
          expect(s.world.projectiles.length).toBeLessThanOrEqual(160);
        }
  }, 30000);
  it('healing never consumes a tactical charge and avoids consuming at full health', () => {
    const s = fixture(),
      tactical = ITEMS.find((i) => i.id.startsWith('consumable-tactical'))!;
    s.campaign.inventory.unshift({
      uid: 'tactical',
      defId: tactical.id,
      level: 1,
      affixes: [],
      favorite: false,
      quantity: 2,
    });
    s.action('heal', input);
    expect(s.campaign.inventory.find((i) => i.uid === 'starter-potion')!.quantity).toBe(5);
    s.world.player.hp = 1;
    s.action('heal', input);
    expect(s.world.player.hp).toBeGreaterThan(1);
    expect(s.campaign.inventory[0].quantity).toBe(2);
    expect(s.campaign.inventory.find((i) => i.uid === 'starter-potion')!.quantity).toBe(4);
  });
  it('tactical effects expire and survive a save/reload', () => {
    const s = fixture(),
      item = ITEMS.find((i) => i.effect === 'chain' && i.kind === 'consumable')!;
    expect(s.useConsumable(item)).toBe(true);
    expect(s.stats.effects.has('chain')).toBe(true);
    s.world.combat = s.combatState();
    const c = structuredClone(s.campaign),
      restored = new Simulation(c.world!, c, structuredClone(DEFAULT_SETTINGS), quiet);
    expect(restored.stats.effects.has('chain')).toBe(true);
    restored.world.tick += 2700;
    restored.step(1 / 60, { ...input });
    expect(restored.stats.effects.has('chain')).toBe(false);
  });
  it('stacking equipment remains within combat caps', () => {
    const s = fixture();
    s.campaign.level = 20;
    s.campaign.talents = CLASSES[0].talents.map((t) => t.id);
    s.recalculate();
    const stats = effectiveStats(s.campaign);
    expect(stats.crit).toBeLessThanOrEqual(0.65);
    expect(stats.cooldown).toBeLessThanOrEqual(0.55);
    expect(stats.speed).toBeLessThanOrEqual(250);
    expect(campaignSchema.safeParse(s.campaign).success).toBe(true);
  });
});
