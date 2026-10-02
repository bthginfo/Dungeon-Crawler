import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import {
  AFFIXES,
  CLASSES,
  ENCOUNTERS,
  ENDINGS,
  FLOORS,
  ITEMS,
  NPCS,
  QUEST_PREREQUISITES,
  QUEST_REWARDS,
  QUESTS,
  RECIPES,
  ROOM_PREFABS,
  SETS,
} from '../src/content';
import { generateWorld, reachableTiles, TILE, walkable } from '../src/game/world';

const slots = ['weapon', 'offhand', 'head', 'body', 'hands', 'feet', 'amulet', 'talisman'];
const stats = new Set([
  'damage',
  'armor',
  'crit',
  'speed',
  'maxHp',
  'maxResource',
  'regen',
  'cooldown',
  'healing',
  'dodge',
  'lifesteal',
  'elemental',
  'nix',
  'gold',
]);
const effects = new Set([
  'lifesteal',
  'chain',
  'burn',
  'frost',
  'thorns',
  'dodge-shield',
  'turret',
  'execute',
  'crit',
  'healing',
  'nix',
  'gold',
  'speed',
  'armor',
  'stagger',
]);
const patterns = new Set(['ring', 'line', 'charge', 'burst', 'summon', 'pool', 'cleave']);
const roles = new Set([
  'chaser',
  'flanker',
  'shooter',
  'summoner',
  'tank',
  'support',
  'controller',
  'ambusher',
]);

const uniqueIds = (rows: { id: string }[], name: string) => {
  const ids = rows.map((row) => row.id);
  assert.equal(new Set(ids).size, ids.length, `${name}: duplicate IDs`);
  assert.ok(
    ids.every((id) => id.length > 0 && !id.includes(' ')),
    `${name}: empty or invalid ID`,
  );
};
const translations = (value: unknown, path = 'content') => {
  if (value === null || value === undefined) return;
  if (Array.isArray(value)) {
    value.forEach((v, i) => translations(v, `${path}[${i}]`));
    return;
  }
  if (typeof value !== 'object') return;
  const row = value as Record<string, unknown>;
  if ('de' in row || 'en' in row) {
    assert.equal(typeof row.de, 'string', `${path}: missing German`);
    assert.equal(typeof row.en, 'string', `${path}: missing English`);
    assert.ok(
      (row.de as string).trim().length > 0 && (row.en as string).trim().length > 0,
      `${path}: empty translation`,
    );
    assert.ok(
      !/\b(?:TODO|Lorem ipsum|Coming soon|Platzhalter)\b/i.test(`${row.de} ${row.en}`),
      `${path}: unfinished text`,
    );
  }
  Object.entries(row).forEach(([key, v]) => translations(v, `${path}.${key}`));
};

export function validateQuestGraph(graph: Record<string, string[]>, ids: Set<string>) {
  const visiting = new Set<string>(),
    done = new Set<string>();
  const visit = (id: string) => {
    assert.ok(ids.has(id), `Unknown prerequisite quest ${id}`);
    assert.ok(!visiting.has(id), `Quest prerequisite cycle at ${id}`);
    if (done.has(id)) return;
    visiting.add(id);
    assert.ok(Array.isArray(graph[id]), `Missing graph entry ${id}`);
    graph[id].forEach(visit);
    visiting.delete(id);
    done.add(id);
  };
  ids.forEach(visit);
  return done.size;
}

export function auditDefinitions() {
  assert.equal(FLOORS.length, 12);
  assert.equal(CLASSES.length, 6);
  assert.equal(ITEMS.length, 576);
  assert.equal(AFFIXES.length, 160);
  assert.equal(SETS.length, 12);
  assert.equal(RECIPES.length, 36);
  assert.equal(QUESTS.length, 102);
  assert.equal(NPCS.length, 10);
  assert.equal(ROOM_PREFABS.length, 336);
  assert.equal(ENCOUNTERS.length, 240);
  [FLOORS, CLASSES, ITEMS, AFFIXES, SETS, RECIPES, QUESTS, NPCS, ROOM_PREFABS, ENCOUNTERS].forEach(
    (rows, i) => {
      uniqueIds(rows, `table ${i}`);
      translations(rows);
    },
  );
  translations(ENDINGS);
  assert.deepEqual(
    ENDINGS.map((e) => e.id),
    ['liberate', 'control', 'negotiate'],
  );
  const itemMap = new Map(ITEMS.map((i) => [i.id, i])),
    npcIds = new Set(NPCS.map((n) => n.id)),
    setIds = new Set(SETS.map((s) => s.id));
  assert.equal(ITEMS.filter((i) => i.kind === 'gear').length, 360);
  assert.equal(ITEMS.filter((i) => i.id.startsWith('unique-')).length, 72);
  assert.equal(ITEMS.filter((i) => i.set).length, 48);
  assert.equal(ITEMS.filter((i) => i.kind === 'relic').length, 120);
  assert.equal(ITEMS.filter((i) => i.kind === 'consumable').length, 72);
  assert.equal(ITEMS.filter((i) => i.kind === 'key').length, 24);
  slots.forEach((slot) => {
    assert.equal(
      ITEMS.filter((i) => i.slot === slot).length,
      45,
      `${slot}: expected 45 definitions`,
    );
    assert.equal(
      ITEMS.filter((i) => i.slot === slot && i.id.startsWith('unique-')).length,
      9,
      `${slot}: expected 9 uniques`,
    );
    assert.equal(
      ITEMS.filter((i) => i.slot === slot && i.set).length,
      6,
      `${slot}: expected 6 set pieces`,
    );
    assert.equal(
      ITEMS.filter((i) => i.slot === slot && !i.set && !i.id.startsWith('unique-')).length,
      30,
      `${slot}: expected 30 ordinary pieces`,
    );
  });
  ITEMS.forEach((i) => {
    assert.ok(stats.has(i.stat), `${i.id}: unsupported stat ${i.stat}`);
    assert.ok(!i.effect || effects.has(i.effect), `${i.id}: unsupported effect ${i.effect}`);
    assert.ok(
      Number.isInteger(i.floor) && i.floor >= 1 && i.floor <= 12,
      `${i.id}: unavailable floor`,
    );
    assert.ok(
      Number.isInteger(i.rarity) && i.rarity >= 0 && i.rarity <= 5,
      `${i.id}: invalid rarity`,
    );
    assert.ok(Number.isFinite(i.value) && i.value >= 0, `${i.id}: invalid value`);
    assert.ok(
      Number.isInteger(i.icon) && i.icon >= 0 && i.icon < 128,
      `${i.id}: missing icon range`,
    );
    assert.ok(Number.isFinite(i.price) && i.price >= 0, `${i.id}: invalid price`);
    if (i.kind === 'gear') assert.ok(i.slot && slots.includes(i.slot), `${i.id}: gear has no slot`);
    else assert.equal(i.slot, undefined, `${i.id}: non-gear consumes equipment slot`);
    if (i.kind === 'key') {
      assert.equal(i.price, 0);
      assert.equal(i.value, 0);
      assert.equal(i.effect, undefined);
    }
    if (i.set) {
      assert.ok(setIds.has(i.set), `${i.id}: unknown set`);
      assert.ok(!i.id.startsWith('unique-'), `${i.id}: unique counted as set item`);
    }
  });
  SETS.forEach((s) => {
    const pieces = ITEMS.filter((i) => i.set === s.id);
    assert.equal(pieces.length, 4, `${s.id}: must have four pieces`);
    assert.equal(new Set(pieces.map((i) => i.slot)).size, 4, `${s.id}: duplicate set slot`);
    assert.ok(effects.has(s.effect) && stats.has(s.stat), `${s.id}: unsupported bonus`);
  });
  AFFIXES.forEach((a) => {
    assert.ok(stats.has(a.stat), `${a.id}: unsupported stat`);
    assert.ok(
      a.slots.length > 0 && a.slots.every((slot) => slots.includes(slot)),
      `${a.id}: unusable affix`,
    );
    assert.ok(a.value > 0 && Number.isFinite(a.value), `${a.id}: nonpositive affix`);
    if (
      [
        'damage',
        'crit',
        'speed',
        'cooldown',
        'healing',
        'dodge',
        'lifesteal',
        'elemental',
        'nix',
        'gold',
      ].includes(a.stat)
    )
      assert.ok(a.value < 1, `${a.id}: percentage unintentionally flat`);
  });
  RECIPES.forEach((r) => {
    const item = itemMap.get(r.item);
    assert.ok(item, `${r.id}: missing result ${r.item}`);
    assert.ok(item.kind !== 'key', `${r.id}: cannot manufacture quest key`);
    assert.ok(
      r.floor >= item.floor && r.floor <= 12,
      `${r.id}: recipe available before item floor`,
    );
    assert.ok(Number.isInteger(r.cost) && r.cost > 0, `${r.id}: invalid cost`);
  });
  const abilities = CLASSES.flatMap((c) => [...c.abilities, c.ultimate]);
  uniqueIds(abilities, 'abilities');
  uniqueIds(
    CLASSES.flatMap((c) => c.talents),
    'talents',
  );
  CLASSES.forEach((c) => {
    assert.equal(c.abilities.length, 4);
    assert.equal(c.specs.length, 2);
    assert.equal(c.talents.length, 10);
    assert.ok(
      c.hp > 0 && c.resource > 0 && c.speed > 0 && c.power > 0,
      `${c.id}: invalid starting stats`,
    );
    c.talents.forEach((talent) =>
      assert.ok(stats.has(talent.stat), `${talent.id}: unsupported talent`),
    );
    c.specs.forEach((spec) =>
      assert.ok(stats.has(spec.stat), `${c.id}: unsupported specialization`),
    );
    [...c.abilities, c.ultimate].forEach((a) =>
      assert.ok(
        a.power > 0 && a.range > 0 && a.cooldown > 0 && a.cost >= 0,
        `${a.id}: uncastable ability`,
      ),
    );
  });
  const mobs = FLOORS.flatMap((f) => [...f.mobs, ...f.elites]);
  uniqueIds(mobs, 'bestiary');
  const bosses = FLOORS.flatMap((f) => [...f.minibosses, f.boss]);
  uniqueIds(bosses, 'bosses');
  assert.equal(
    new Set(bosses.map((b) => b.unique)).size,
    36,
    'Boss rewards must not share an item',
  );
  assert.equal(
    new Set(bosses.map((b) => b.patterns.join(','))).size,
    36,
    'Every named encounter needs its own pattern sequence',
  );
  FLOORS.forEach((f, i) => {
    assert.equal(f.index, i + 1);
    assert.equal(f.act, Math.ceil((i + 1) / 3));
    assert.equal(f.mobs.length, 8);
    assert.equal(f.elites.length, 2);
    assert.equal(f.minibosses.length, 2);
    assert.ok(
      f.mobs.every((m) => !m.elite) && f.elites.every((m) => m.elite),
      `${f.id}: mixed normal/elite counts`,
    );
    [...f.mobs, ...f.elites].forEach((m) =>
      assert.ok(
        roles.has(m.role) && m.hp > 0 && m.damage > 0 && m.speed > 0,
        `${m.id}: invalid encounter role/stats`,
      ),
    );
    [...f.minibosses, f.boss].forEach((b) => {
      assert.ok(
        b.patterns.length >= 3 && b.patterns.every((p) => patterns.has(p)),
        `${b.id}: invalid phases`,
      );
      assert.ok(b.hp > 0 && b.damage > 0, `${b.id}: empty boss`);
      const reward = itemMap.get(b.unique);
      assert.ok(
        reward && reward.floor === f.index && reward.id.startsWith('unique-'),
        `${b.id}: reward cannot be obtained at its floor`,
      );
    });
    const rooms = ROOM_PREFABS.filter((r) => r.floor === f.index);
    assert.equal(rooms.length, 28);
    assert.equal(new Set(rooms.map((r) => r.layout)).size, 28, `${f.id}: repeated layout index`);
    const roomCounts = Object.fromEntries(
      ['combat', 'puzzle', 'event', 'rest', 'guardian', 'hunt', 'boss', 'treasure'].map((kind) => [
        kind,
        rooms.filter((r) => r.kind === kind).length,
      ]),
    );
    assert.deepEqual(roomCounts, {
      combat: 16,
      puzzle: 3,
      event: 3,
      rest: 2,
      guardian: 1,
      hunt: 1,
      boss: 1,
      treasure: 1,
    });
    const encounters = ENCOUNTERS.filter((e) => e.floor === f.index);
    assert.equal(encounters.length, 20);
    const ownMobs = new Set(f.mobs.map((m) => m.id));
    encounters.forEach((e) =>
      assert.ok(
        e.mobs.length > 0 && e.mobs.every((m) => ownMobs.has(m)),
        `${e.id}: missing/cross-floor mob`,
      ),
    );
    assert.equal(
      new Set(encounters.flatMap((e) => e.mobs)).size,
      8,
      `${f.id}: unreachable bestiary type`,
    );
    const quests = QUESTS.filter((q) => q.floor === f.index);
    assert.equal(quests.filter((q) => q.category === 'main').length, 3);
    assert.equal(quests.filter((q) => q.category === 'side').length, 4);
    quests.forEach((q) =>
      assert.ok(
        q.target > 0 && Number.isInteger(q.target) && (!q.npc || npcIds.has(q.npc)),
        `${q.id}: unreachable quest objective`,
      ),
    );
  });
  assert.equal(QUESTS.filter((q) => q.category === 'relationship').length, 18);
  ['nix', 'mira', 'ilya', 'tam', 'zuv', 'enno'].forEach((npc) =>
    assert.equal(QUESTS.filter((q) => q.category === 'relationship' && q.npc === npc).length, 3),
  );
  const questIds = new Set(QUESTS.map((q) => q.id));
  assert.equal(validateQuestGraph(QUEST_PREREQUISITES, questIds), 102);
  Object.entries(QUEST_REWARDS).forEach(([quest, reward]) => {
    assert.ok(questIds.has(quest), `Reward assigned to missing quest ${quest}`);
    const q = QUESTS.find((q) => q.id === quest)!,
      item = itemMap.get(reward);
    assert.ok(
      item && item.floor === q.floor && item.id.startsWith('unique-quest-'),
      `${quest}: wrong unique discovery reward`,
    );
  });
  assert.equal(new Set(Object.values(QUEST_REWARDS)).size, 24);
  NPCS.forEach((n) => assert.ok(n.lines.length >= 12, `${n.id}: incomplete dialogue arc`));
  return {
    floors: 12,
    mobs: 96,
    elites: 24,
    minibosses: 24,
    bosses: 12,
    classes: 6,
    abilities: 30,
    talents: 60,
    items: 576,
    affixes: 160,
    sets: 12,
    recipes: 36,
    quests: 102,
    npcs: 10,
    dialogueLines: NPCS.reduce((n, p) => n + p.lines.length, 0),
    prefabs: 336,
    encounters: 240,
  };
}

/** Validate authored requirements against real generated instances, including
 * exact interaction coordinates and approaches, not only room graph edges. */
export function auditWorlds(seedsPerFloor = 24) {
  let worlds = 0,
    targets = 0;
  for (let floor = 1; floor <= 12; floor++)
    for (let i = 0; i < seedsPerFloor; i++) {
      const w = generateWorld(floor, (0x51eaf + i * 7919 + floor * 31337) >>> 0),
        reachable = reachableTiles(w);
      const location = (x: number, y: number) => `${Math.floor(x / TILE)},${Math.floor(y / TILE)}`;
      assert.ok(walkable(w, w.player.x, w.player.y), `F${floor} seed ${i}: invalid start`);
      for (const room of w.rooms) {
        const cx = (room.x + room.w / 2) * TILE,
          cy = (room.y + room.h / 2) * TILE;
        assert.ok(
          reachable.has(location(cx, cy)),
          `F${floor} seed ${i}: unreachable ${room.kind} room ${room.prefab}`,
        );
      }
      for (const o of w.objects) {
        assert.ok(
          reachable.has(location(o.x, o.y)),
          `F${floor} seed ${i}: unreachable ${o.type} ${o.id}`,
        );
        assert.ok(
          walkable(w, o.x, o.y, 10),
          `F${floor} seed ${i}: blocked interaction approach ${o.id}`,
        );
        targets++;
      }
      assert.ok(
        w.rooms.some((r) => r.kind === 'guardian') &&
          w.rooms.some((r) => r.kind === 'hunt') &&
          w.rooms.some((r) => r.kind === 'boss'),
        `F${floor}: missing named encounter`,
      );
      assert.equal(
        w.objects.filter((o) => o.type === 'exit').length,
        1,
        `F${floor}: ambiguous extraction`,
      );
      const terminalCount = w.objects.filter((o) => o.type === 'terminal').length,
        chestCount = w.objects.filter((o) => o.type === 'chest').length,
        puzzleCount = w.rooms.filter((r) => r.kind === 'puzzle').length;
      const killCapacity = w.rooms.filter((r) => r.kind === 'combat').length * 4;
      for (const q of QUESTS.filter((q) => q.floor === floor && q.category !== 'relationship')) {
        const available =
          q.objective === 'terminal'
            ? terminalCount
            : q.objective === 'chest'
              ? chestCount
              : q.objective === 'puzzle'
                ? puzzleCount
                : q.objective === 'kills'
                  ? killCapacity
                  : q.objective === 'boss' || q.objective === 'hunt' || q.objective === 'exit'
                    ? 1
                    : Infinity;
        assert.ok(
          available >= q.target,
          `${q.id}: generated world cannot satisfy ${q.objective} ${q.target}`,
        );
      }
      worlds++;
    }
  return { worlds, targets };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const definitions = auditDefinitions(),
    instances = auditWorlds(Number(process.env.CONTENT_SEEDS_PER_FLOOR ?? 24));
  console.log(JSON.stringify({ status: 'passed', definitions, instances }, null, 2));
}
