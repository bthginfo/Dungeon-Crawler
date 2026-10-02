import { FLOORS, ROOM_PREFABS, RUN_MODIFIERS, floorBosses, NPCS, STORY_CHAPTERS } from '../content';
import type { CityDef } from './narrative-types';
import type { Room, RoomKind, WorldData, WorldObject } from './types';
import { actor, TILE } from './world';
import { rng, hashSeed } from './random';

type Random = ReturnType<typeof rng>;
type Route = NonNullable<WorldData['route']>;
const t = (de: string, en: string) => ({ de, en });
function shuffle<T>(values: T[], random: Random): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = random.int(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function baseWorld(
  floor: number,
  seed: number,
  classId: string,
  tiles: number[][],
  rooms: Room[],
): WorldData {
  const first = rooms[0],
    x = (first.x + first.w / 2) * TILE,
    y = (first.y + first.h / 2) * TILE;
  return {
    id: `world-${floor}-${seed}`,
    seed,
    rng: hashSeed(`${seed}:loot`),
    floor,
    width: tiles[0].length,
    height: tiles.length,
    tiles,
    rooms,
    enemies: [],
    objects: [],
    projectiles: [],
    effects: [],
    player: actor('player', classId, 'player', x, y, first.id),
    nix: actor('nix', 'nix', 'nix', x - 44, y + 20, first.id),
    tick: 0,
    elapsed: 0,
    kills: 0,
    bossKilled: false,
    guardianKilled: false,
    huntKilled: false,
    roomId: first.id,
    attackAnim: 0,
  };
}
function carver(tiles: number[][]) {
  const height = tiles.length,
    width = tiles[0].length;
  const carve = (x: number, y: number) => {
    if (x > 0 && y > 0 && x < width - 1 && y < height - 1) tiles[y][x] = 1;
  };
  const corridor = (x1: number, y1: number, x2: number, y2: number, verticalFirst = false) => {
    if (verticalFirst) {
      for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++)
        for (let d = -1; d <= 1; d++) carve(x1 + d, y);
      for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++)
        for (let d = -1; d <= 1; d++) carve(x, y2 + d);
    } else {
      for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++)
        for (let d = -1; d <= 1; d++) carve(x, y1 + d);
      for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++)
        for (let d = -1; d <= 1; d++) carve(x2 + d, y);
    }
  };
  return { carve, corridor };
}
const center = (r: Room) => [r.x + Math.floor(r.w / 2), r.y + Math.floor(r.h / 2)] as const;

/** A connected frontier graph with extra loops, varied footprints and independent content streams.
 * Room zero remains the safe entry; neither array order nor prefab ID determines traversal. */
export function generateWorld(
  floor: number,
  seed: number,
  classId = 'breaker',
  route: Route = 'balanced',
): WorldData {
  const random = rng(seed),
    width = 134,
    height = 119;
  const tiles = Array.from({ length: height }, () => Array<number>(width).fill(0));
  const { carve, corridor } = carver(tiles);
  const neighbours = (cell: number) =>
    [
      cell % 5 > 0 ? cell - 1 : -1,
      cell % 5 < 4 ? cell + 1 : -1,
      cell > 4 ? cell - 5 : -1,
      cell < 20 ? cell + 5 : -1,
    ].filter((c) => c >= 0);
  const borders = Array.from({ length: 25 }, (_, i) => i).filter(
    (i) => i % 5 === 0 || i % 5 === 4 || i < 5 || i >= 20,
  );
  const start = borders[random.int(borders.length)];
  const cells = [start],
    occupied = new Set(cells),
    tree: [number, number][] = [];
  const count = 18 + random.int(4) + (route === 'balanced' ? 0 : 2);
  while (cells.length < count) {
    const frontier = cells.flatMap((a) =>
      neighbours(a)
        .filter((b) => !occupied.has(b))
        .map((b) => [a, b] as [number, number]),
    );
    const edge = frontier[random.int(frontier.length)];
    tree.push(edge);
    cells.push(edge[1]);
    occupied.add(edge[1]);
  }
  const edges = [...tree];
  for (const a of cells)
    for (const b of neighbours(a))
      if (
        a < b &&
        occupied.has(b) &&
        !edges.some(([u, v]) => (u === a && v === b) || (u === b && v === a)) &&
        random.next() < 0.4
      )
        edges.push([a, b]);
  // Always include a loop when the frontier has a possible neighbouring edge.
  if (edges.length === tree.length) {
    const extra = cells.flatMap((a) =>
      neighbours(a)
        .filter(
          (b) =>
            a < b &&
            occupied.has(b) &&
            !edges.some(([u, v]) => (u === a && v === b) || (u === b && v === a)),
        )
        .map((b) => [a, b] as [number, number]),
    )[0];
    if (extra) edges.push(extra);
  }
  const distances = new Map([[start, 0]]),
    parents = new Map<number, number>(),
    queue = [start];
  for (let i = 0; i < queue.length; i++) {
    const a = queue[i];
    for (const [u, v] of edges) {
      const b = u === a ? v : v === a ? u : -1;
      if (b >= 0 && !distances.has(b)) {
        distances.set(b, distances.get(a)! + 1);
        parents.set(b, a);
        queue.push(b);
      }
    }
  }
  const far = shuffle(cells.slice(1), random).sort((a, b) => distances.get(b)! - distances.get(a)!);
  const boss = far[0],
    path = [boss];
  while (path[path.length - 1] !== start) path.push(parents.get(path[path.length - 1])!);
  path.reverse();
  const guardian = path[Math.max(1, Math.floor((path.length - 1) * 0.55))];
  const kinds = new Map<number, RoomKind>([
    [start, 'rest'],
    [boss, 'boss'],
    [guardian, 'guardian'],
  ]);
  const free = shuffle(
    cells.filter((c) => !kinds.has(c)),
    random,
  );
  const take = (kind: RoomKind) => {
    const cell = free.shift()!;
    kinds.set(cell, kind);
    return cell;
  };
  // A bounty has its own branch, but its location and creature can change on every run.
  free.sort((a, b) => {
    const degree = (c: number) => edges.filter((e) => e.includes(c)).length;
    return degree(a) - degree(b);
  });
  take('hunt');
  for (const kind of [
    'puzzle',
    'puzzle',
    'event',
    'event',
    'event',
    'treasure',
    'treasure',
  ] as RoomKind[])
    take(kind);
  if (route === 'exploration') {
    take('treasure');
    if (random.next() < 0.35) take('rest');
  }
  free.forEach((cell) => kinds.set(cell, 'combat'));
  const ordered = [
    start,
    ...shuffle(
      cells.filter((c) => c !== start && c !== boss),
      random,
    ),
    boss,
  ];
  const byCell = new Map<number, Room>();
  const rooms = ordered.map((cell, i) => {
    const kind = kinds.get(cell)!;
    const large = ['boss', 'guardian', 'hunt'].includes(kind);
    // Even dimensions preserve tile-centred spawn and interaction approaches.
    const w = large ? 22 : 16 + random.int(4) * 2,
      h = large ? 18 : 14 + random.int(3) * 2;
    const cx = 16 + (cell % 5) * 26 + (random.int(3) - 1),
      cy = 13 + Math.floor(cell / 5) * 23 + (random.int(3) - 1);
    const x = cx - w / 2,
      y = cy - h / 2;
    const candidates = ROOM_PREFABS.filter((p) => p.floor === floor && p.kind === kind);
    const prefab = candidates[random.int(candidates.length)];
    const biome =
      i === 0 || large || random.next() > 0.3
        ? floor
        : Math.min(12, Math.max(1, floor + (floor === 1 || random.next() < 0.5 ? 1 : -1)));
    const room: Room = {
      id: `room-${i}`,
      prefab: prefab.id,
      x,
      y,
      w,
      h,
      kind,
      visited: i === 0,
      cleared: kind === 'rest',
      spawned: kind === 'rest',
      name: prefab.name,
      biome,
    };
    byCell.set(cell, room);
    const shape = random.int(5),
      cover = random.int(6);
    for (let dy = 0; dy < h; dy++)
      for (let dx = 0; dx < w; dx++) {
        const ux = Math.abs(dx - w / 2),
          uy = Math.abs(dy - h / 2);
        const axes = ux < 2 || uy < 2;
        const footprint =
          shape === 0
            ? true
            : shape === 1
              ? (ux / (w / 2)) ** 2 + (uy / (h / 2)) ** 2 < 0.95
              : shape === 2
                ? ux + uy < (w + h) / 2 - 4
                : shape === 3
                  ? !(dx < w / 3 && dy < h / 3)
                  : !(dx > w * 0.7 && dy > h * 0.7);
        if (axes || footprint) carve(x + dx, y + dy);
        if (!large && kind !== 'rest' && !axes && dx > 2 && dy > 2 && dx < w - 3 && dy < h - 3) {
          const solid =
            cover === 0
              ? dx % 5 === 0 && dy % 4 === 0
              : cover === 1
                ? dy === 4 && dx % 4 < 2
                : cover === 2
                  ? dx === w - 5 && dy % 4 < 2
                  : cover === 3
                    ? dx === 4 && (dy < 6 || dy > h - 7)
                    : cover === 4
                      ? (dx === 4 || dx === w - 5) && (dy === 4 || dy === h - 5)
                      : false;
          if (solid) tiles[y + dy][x + dx] = 0;
        }
      }
    return room;
  });
  for (const [a, b] of edges) {
    const [x1, y1] = center(byCell.get(a)!),
      [x2, y2] = center(byCell.get(b)!);
    corridor(x1, y1, x2, y2, random.next() < 0.5);
  }
  const world = baseWorld(floor, seed, classId, tiles, rooms);
  world.route = route;
  world.edges = edges.map(([a, b]) => [byCell.get(a)!.id, byCell.get(b)!.id]);
  world.modifiers = shuffle(
    RUN_MODIFIERS.map((m) => m.id),
    random,
  ).slice(0, route === 'dangerous' ? 2 : 1);
  const mainPool = floorBosses(floor),
    selected = mainPool[random.int(mainPool.length)];
  const secondary = shuffle(
    [...FLOORS[floor - 1].minibosses, ...mainPool.filter((b) => b.id !== selected.id)],
    random,
  );
  world.bossIds = { boss: selected.id, guardian: secondary[0].id, hunt: secondary[1].id };
  const scenes = shuffle(STORY_CHAPTERS.find((c) => c.floor === floor)?.scenes ?? [], random);
  let scene = 0;
  const add = (
    r: Room,
    type: WorldObject['type'],
    dx: number,
    dy: number,
    label: WorldObject['label'],
    data?: string,
  ) => {
    const [cx, cy] = center(r),
      tx = cx + Math.round(dx / TILE),
      ty = cy + Math.round(dy / TILE);
    // Carve a genuine approach from the room centre, not merely an isolated target tile.
    corridor(cx, cy, tx, ty);
    world.objects.push({
      id: `obj-${r.id}-${world.objects.length}`,
      type,
      x: (tx + 0.5) * TILE,
      y: (ty + 0.5) * TILE,
      room: r.id,
      active: true,
      label,
      data,
    });
  };
  for (const r of rooms) {
    if (r.kind === 'puzzle')
      for (let p = 0; p < 3; p++)
        add(
          r,
          'terminal',
          (p - 1) * 96,
          32,
          t(`Leitung ${p + 1} aktivieren`, `Activate conduit ${p + 1}`),
          `conduit-${p}`,
        );
    if (r.kind === 'event')
      add(
        r,
        'terminal',
        0,
        0,
        t('Ungeschnittene Erinnerung', 'Unedited memory'),
        scenes[scene++]?.id ?? 'story',
      );
    if (r.kind === 'hunt')
      add(r, 'shrine', 0, 64, t('Jagdziel herausfordern', 'Challenge the bounty target'), 'hunt');
    if (r.kind === 'treasure') {
      add(r, 'chest', 0, 0, t('Versiegelte Beutekiste', 'Sealed loot cache'));
      add(r, 'shrine', 96, -64, t('Sponsorvertrag', 'Sponsor contract'), 'contract');
    }
    if (r.kind === 'rest') add(r, 'fountain', 0, 64, t('Reparaturstation', 'Repair station'));
    if (r.kind === 'boss')
      add(r, 'exit', (r.w * TILE) / 2 - 96, 0, t('Sichere Schleuse', 'Safe airlock'));
    if (r.kind === 'combat' && random.next() < 0.6)
      add(r, 'chest', (-r.w * TILE) / 2 + 96, 64, t('Beutekiste öffnen', 'Open loot cache'));
  }
  // At least three caches support every authored city contract on a single expedition.
  for (const r of rooms.filter((r) => r.kind === 'combat')) {
    if (world.objects.filter((o) => o.type === 'chest').length >= 3) break;
    add(r, 'chest', 96, 64, t('Vorratskiste öffnen', 'Open supply cache'));
  }
  const mechanic = FLOORS[floor - 1].mechanic;
  const hazard =
    mechanic === 'water'
      ? 2
      : mechanic === 'oil'
        ? 3
        : mechanic === 'ice'
          ? 4
          : mechanic === 'heat'
            ? 5
            : 6;
  for (const r of rooms.filter((r) => ['combat', 'treasure'].includes(r.kind))) {
    const patches = world.modifiers.includes('unstable') ? 3 : 1;
    for (let p = 0; p < patches; p++) {
      const hx = r.x + 2 + random.int(Math.max(1, r.w - 8)),
        hy = r.y + 2 + random.int(Math.max(1, r.h - 6));
      for (let dy = 0; dy < 2; dy++)
        for (let dx = 0; dx < 4; dx++) {
          const tx = hx + dx,
            ty = hy + dy;
          if (
            tiles[ty][tx] &&
            !world.objects.some(
              (o) => Math.abs(o.x / TILE - tx) < 2 && Math.abs(o.y / TILE - ty) < 2,
            )
          )
            tiles[ty][tx] = hazard;
        }
    }
  }
  return world;
}

/** Cities are authored safe spaces, rather than a dungeon with its combat disabled.
 * A central square connects four districts with buildings, stalls and accessible NPCs. */
export function generateCity(city: CityDef, seed: number, classId: string): WorldData {
  const random = rng(seed),
    tiles = Array.from({ length: 76 }, () => Array<number>(88).fill(0));
  const { carve, corridor } = carver(tiles);
  const layouts: Record<string, [number, number][]> = {
    haven: [
      [7, 8],
      [53, 8],
      [7, 47],
      [53, 47],
    ],
    lantern: [
      [6, 12],
      [54, 6],
      [12, 48],
      [50, 48],
    ],
    meridian: [
      [8, 8],
      [52, 8],
      [8, 48],
      [52, 48],
    ],
  };
  const plaza: Room = {
    id: `city-${city.id}-plaza`,
    prefab: `city-${city.id}-plaza`,
    x: 36,
    y: 32,
    w: 16,
    h: 12,
    kind: 'rest',
    visited: true,
    cleared: true,
    spawned: true,
    name: city.name,
    biome: city.materialFloor,
  };
  const rooms = [
    plaza,
    ...city.districts.map((d, i): Room => ({
      id: `city-${city.id}-${i}`,
      prefab: `city-${city.id}-${d.kind}`,
      x: layouts[city.id][i][0],
      y: layouts[city.id][i][1],
      w: 26,
      h: 20,
      kind: 'event',
      visited: true,
      cleared: true,
      spawned: true,
      name: d.name,
      district: d.kind,
      biome: city.materialFloor,
    })),
  ];
  for (const r of rooms) {
    for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) carve(x, y);
    if (r.district) {
      // Small building blocks leave a broad central avenue and public side lanes.
      for (const bx of [r.x + 3, r.x + r.w - 9]) {
        const bh = 4 + random.int(3);
        for (let y = r.y + 3; y < r.y + 3 + bh; y++)
          for (let x = bx; x < bx + 6; x++) tiles[y][x] = 0;
        for (let y = r.y + r.h - 7; y < r.y + r.h - 3; y++)
          for (let x = bx; x < bx + 6; x++) tiles[y][x] = 0;
      }
    }
  }
  const [px, py] = center(plaza);
  for (const r of rooms.slice(1)) {
    const [cx, cy] = center(r);
    corridor(px, py, cx, cy, city.id === 'lantern');
  }
  const world = baseWorld(city.materialFloor, seed, classId, tiles, rooms);
  world.id = `city-${city.id}-${seed}`;
  world.region = city.id;
  world.edges = rooms.slice(1).map((r) => [plaza.id, r.id]);
  const add = (
    r: Room,
    type: WorldObject['type'],
    dx: number,
    dy: number,
    label: WorldObject['label'],
    data?: string,
  ) => {
    const [cx, cy] = center(r),
      tx = cx + dx,
      ty = cy + dy;
    corridor(cx, cy, tx, ty);
    world.objects.push({
      id: `town-${city.id}-${world.objects.length}`,
      type,
      x: (tx + 0.5) * TILE,
      y: (ty + 0.5) * TILE,
      room: r.id,
      active: true,
      label,
      data,
    });
  };
  const locations: Record<string, number> = {
    tam: 1,
    mira: 2,
    ilya: 3,
    nix: 0,
    zuv: 2,
    sera: 3,
    enno: 1,
    oris: 3,
    rhea: 2,
  };
  const slots = new Map<number, number>();
  for (const id of city.npcIds) {
    const rIndex = locations[id] ?? 1,
      r = rooms[rIndex],
      n = slots.get(rIndex) ?? 0;
    slots.set(rIndex, n + 1);
    const npc = NPCS.find((n) => n.id === id)!;
    add(
      r,
      'npc',
      n % 2 ? 3 : -3,
      -2 + Math.floor(n / 2) * 3,
      t(`Mit ${npc.name} sprechen`, `Talk to ${npc.name}`),
      id,
    );
  }
  const companion = world.objects.find((o) => o.type === 'npc' && o.data === 'nix');
  if (companion) {
    companion.x = world.nix.x;
    companion.y = world.nix.y;
  }
  add(plaza, 'fountain', 0, 3, t('Klinik: vollständig erholen', 'Clinic: fully recover'));
  add(rooms[1], 'shrine', 0, 4, t('Markt besuchen', 'Visit the market'), 'shop');
  add(rooms[2], 'shrine', 0, 4, t('Werkstatt benutzen', 'Use the workshop'), 'craft');
  add(rooms[3], 'terminal', 0, 4, t('Stadtchronik lesen', 'Read the city chronicle'), 'city-lore');
  add(
    rooms[4],
    'exit',
    0,
    4,
    t('Expeditionen und Reisewege', 'Expeditions and travel routes'),
    'city-gate',
  );
  return world;
}
