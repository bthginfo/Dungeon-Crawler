import { describe, expect, it } from 'vitest';
import { CITIES, CITY_QUESTS, BOSS_VARIANTS, STORY_CHAPTERS } from '../src/content';
import { createCampaign } from '../src/game/campaign';
import {
  generateCity,
  generateWorld,
  nearestInteraction,
  reachableTiles,
  TILE,
} from '../src/game/world';
import {
  contractStatus,
  acceptContract,
  progressContracts,
  bankContracts,
  rollbackContracts,
  settleContract,
  applyChoice,
} from '../src/game/contracts';
import { Simulation, effectiveStats } from '../src/game/engine';
import { DEFAULT_SETTINGS } from '../src/game/save';
import { campaignSchema } from '../src/shared/validation';
const quiet = { kill() {}, room() {}, death() {}, feedback() {} };
const chest = { objective: 'chest' as const, floor: 1, amount: 1, town: false, cityId: null };

describe('story and city contracts', () => {
  it('requires reading story terminals for archive work, rather than toggling puzzle conduits', () => {
    const c = createCampaign('breaker', 'Archive work');
    acceptContract(c, 'haven-unlisted');
    const event = {
      objective: 'terminal' as const,
      amount: 3,
      floor: 1,
      town: false,
      cityId: null,
    };
    progressContracts(c, event);
    expect(contractStatus(c, 'haven-unlisted')).toBe('active');
    expect(c.questProgress['haven-unlisted'].count).toBe(0);
    progressContracts(c, { ...event, storyTerminal: true });
    expect(contractStatus(c, 'haven-unlisted')).toBe('ready');
  });
  it('counts accepted work on the named floor, requires claim for prerequisites and rewards only once', () => {
    const c = createCampaign('breaker', 'Lea');
    const q = CITY_QUESTS.find((q) => q.id === 'haven-last-boiler')!;
    progressContracts(c, chest);
    expect(c.questProgress[q.id]).toBeUndefined();
    expect(acceptContract(c, q.id)).toBe(true);
    progressContracts(c, { ...chest, floor: 2, amount: 20 });
    expect(contractStatus(c, q.id)).toBe('active');
    progressContracts(c, { ...chest, amount: 2 });
    expect(contractStatus(c, q.id)).toBe('ready');
    expect(contractStatus(c, 'haven-corridor')).toBe('locked');
    expect(settleContract(c, q.id, 'unknown-choice')).toBeNull();
    const prior = c.scrap;
    expect(settleContract(c, q.id, 'union')).not.toBeNull();
    expect(c.scrap).toBe(prior + q.reward.scrap + 80);
    expect(c.choices[q.id]).toBe('union');
    expect(c.relationships['faction-union']).toBe(58);
    expect(c.relationships['faction-sponsors']).toBe(46);
    expect(contractStatus(c, 'haven-corridor')).toBe('available');
    const committed = structuredClone(c);
    expect(settleContract(c, q.id, 'union')).toBeNull();
    expect(c).toEqual(committed);
  });
  it('retains banked objectives and acceptance but loses later dungeon work on death', () => {
    const c = createCampaign('breaker', 'Tests');
    acceptContract(c, 'haven-last-boiler');
    progressContracts(c, chest);
    bankContracts(c);
    progressContracts(c, chest);
    expect(contractStatus(c, 'haven-last-boiler')).toBe('ready');
    rollbackContracts(c);
    expect(c.questProgress['haven-last-boiler'].count).toBe(1);
    expect(contractStatus(c, 'haven-last-boiler')).toBe('active');
    expect(c.acceptedQuests).toContain('haven-last-boiler');
  });
  it('conversation quests require the target NPC in its city and survive JSON/cloud validation', () => {
    const c = createCampaign('shade-runner', 'Tests');
    c.completedCityQuests = ['haven-unlisted'];
    expect(acceptContract(c, 'haven-shared-name')).toBe(true);
    const q = CITY_QUESTS.find((q) => q.id === 'haven-shared-name')!;
    progressContracts(c, {
      ...chest,
      objective: 'talk',
      npc: q.targetNpc,
      town: false,
      cityId: 'haven',
    });
    expect(contractStatus(c, q.id)).toBe('active');
    progressContracts(c, {
      ...chest,
      objective: 'talk',
      npc: q.targetNpc,
      town: true,
      cityId: 'lantern',
    });
    expect(contractStatus(c, q.id)).toBe('active');
    progressContracts(c, {
      ...chest,
      objective: 'talk',
      npc: q.targetNpc,
      town: true,
      cityId: 'haven',
    });
    rollbackContracts(c);
    expect(contractStatus(c, q.id)).toBe('ready');
    expect(campaignSchema.parse(JSON.parse(JSON.stringify(c)))).toEqual(c);
  });
  it('story consequences are permanent, bounded and cannot be farmed by revisiting a scene', () => {
    const c = createCampaign('breaker', 'Tests');
    const scene = STORY_CHAPTERS[0].scenes[0];
    c.relationships[`faction-${scene.choices[0].faction}`] = 98;
    expect(applyChoice(c, scene.id, scene.choices[0])).toBe(true);
    const once = structuredClone(c);
    expect(applyChoice(c, scene.id, scene.choices[1])).toBe(false);
    expect(c).toEqual(once);
    expect(Object.values(c.relationships).every((r) => r >= 0 && r <= 100)).toBe(true);
  });
});

describe('world diversity and combat pressure', () => {
  it('creates different branched layouts and boss casts for repeat visits, while a saved seed reproduces exactly', () => {
    const layouts = new Set<string>(),
      bosses = new Set<string>(),
      kinds = new Set<string>();
    for (let seed = 1; seed <= 48; seed++) {
      const w = generateWorld(4, seed);
      const degrees = new Map<string, number>();
      for (const [a, b] of w.edges!) {
        degrees.set(a, (degrees.get(a) ?? 0) + 1);
        degrees.set(b, (degrees.get(b) ?? 0) + 1);
      }
      expect(Math.max(...degrees.values())).toBeGreaterThanOrEqual(3);
      expect(w.edges!.length).toBeGreaterThanOrEqual(w.rooms.length); // at least one loop
      expect(new Set(Object.values(w.bossIds!)).size).toBe(3);
      layouts.add(JSON.stringify(w.rooms.map((r) => [r.x, r.y, r.w, r.h, r.kind])));
      bosses.add(w.bossIds!.boss);
      kinds.add(w.rooms.map((r) => r.kind).join(','));
      expect(generateWorld(4, seed)).toEqual(w);
    }
    expect(layouts.size).toBe(48);
    expect(kinds.size).toBeGreaterThan(40);
    expect(bosses.size).toBe(3);
  }, 30000);
  it('keeps every city service reachable and movement safe even with autoattack enabled', () => {
    for (const city of CITIES) {
      const c = createCampaign('breaker', 'Tests');
      c.floorUnlocked = 12;
      const w = generateCity(city, 714, c.classId),
        reachable = reachableTiles(w);
      c.world = w;
      for (const o of w.objects)
        expect(reachable.has(`${Math.floor(o.x / TILE)},${Math.floor(o.y / TILE)}`)).toBe(true);
      const s = new Simulation(w, c, { ...DEFAULT_SETTINGS, autoAttack: true }, quiet);
      const x = w.player.x,
        health = w.player.hp;
      for (let n = 0; n < 120; n++)
        s.step(1 / 60, { moveX: 1, moveY: 0, attacking: true, aimX: 10, aimY: 10 });
      expect(w.player.x).toBeGreaterThan(x);
      expect(w.player.hp).toBe(health);
      expect(w.enemies).toHaveLength(0);
      expect(w.projectiles).toHaveLength(0);
      const contact = w.objects.find((o) => o.type === 'npc' && o.data !== 'nix')!;
      w.player.x = contact.x;
      w.player.y = contact.y + 70;
      const companion = w.objects.find((o) => o.type === 'npc' && o.data === 'nix');
      if (companion) {
        companion.x = w.player.x - 30;
        companion.y = w.player.y;
        expect(nearestInteraction(w)?.id).toBe(contact.id);
      }
    }
  });
  it('standard encounters have more pressure than story mode and dangerous routes add genuine risk', () => {
    const fixture = (
      difficulty: typeof DEFAULT_SETTINGS.difficulty,
      route: 'balanced' | 'dangerous',
    ) => {
      const c = createCampaign('breaker', 'Tests');
      c.world = generateWorld(1, 771, c.classId, route);
      c.world.modifiers = [];
      const s = new Simulation(c.world, c, { ...DEFAULT_SETTINGS, difficulty }, quiet);
      s.spawnRoom(s.world.rooms.find((r) => r.kind === 'combat')!);
      return s;
    };
    const story = fixture('story', 'balanced'),
      standard = fixture('standard', 'balanced'),
      dangerous = fixture('standard', 'dangerous');
    expect(standard.world.enemies[0].maxHp).toBeGreaterThan(story.world.enemies[0].maxHp);
    expect(standard.world.enemies[0].speed).toBeGreaterThan(story.world.enemies[0].speed);
    expect(dangerous.world.enemies.length).toBeGreaterThanOrEqual(6);
    const loss = (s: Simulation) => {
      const old = s.world.player.hp;
      s.hit(s.world.player, 20);
      return old - s.world.player.hp;
    };
    expect(loss(standard)).toBeGreaterThan(loss(story) * 2);
    expect(BOSS_VARIANTS.some((b) => b.patterns.includes('eruption'))).toBe(true);
  });
  it('loads version-one campaigns without expansion fields and preserves full new expedition metadata', () => {
    const old = createCampaign('breaker', 'Old save');
    delete old.acceptedQuests;
    delete old.completedCityQuests;
    delete old.cityQuestBank;
    expect(campaignSchema.safeParse(old).success).toBe(true);
    old.origin = 'dispatch';
    old.world = generateWorld(7, 922, old.classId, 'exploration');
    old.world.player.hp = effectiveStats(old).maxHp;
    expect(campaignSchema.parse(JSON.parse(JSON.stringify(old)))).toEqual(old);
  });
});
