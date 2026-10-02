import { FLOORS, ROOM_PREFABS } from '../content';
import type { Actor, Room, RoomKind, WorldData, WorldObject } from './types';
import { rng, hashSeed } from './random';
export const TILE = 32;
export function actor(
  id: string,
  defId: string,
  type: Actor['type'],
  x: number,
  y: number,
  room = '',
): Actor {
  return {
    id,
    defId,
    type,
    x,
    y,
    room,
    hp: 100,
    maxHp: 100,
    radius: 10,
    speed: 130,
    damage: 10,
    direction: 0,
    cooldown: 0,
    tell: 0,
    aimX: x,
    aimY: y,
    pattern: 'cleave',
    phase: 1,
    statuses: [],
    dead: false,
  };
}
export function generateWorld(floor: number, seed: number, classId = 'breaker'): WorldData {
  const random = rng(seed);
  const width = 99,
    height = 75;
  const tiles = Array.from({ length: height }, () => Array<number>(width).fill(0));
  const kinds: RoomKind[] = [
    'rest',
    'combat',
    'puzzle',
    'combat',
    'event',
    'combat',
    'treasure',
    'combat',
    'puzzle',
    'guardian',
    'rest',
    'combat',
    'hunt',
    'boss',
  ];
  const rooms: Room[] = [];
  const carve = (x: number, y: number) => {
    if (x > 0 && y > 0 && x < width - 1 && y < height - 1) tiles[y][x] = 1;
  };
  kinds.forEach((kind, i) => {
    const row = Math.floor(i / 4),
      col = row % 2 ? 3 - (i % 4) : i % 4;
    const x = 4 + col * 24,
      y = 4 + row * 18,
      w = 18 + (i === 13 ? 2 : random.int(3)),
      h = 13 + random.int(2);
    const candidates = ROOM_PREFABS.filter((p) => p.floor === floor && p.kind === kind);
    const prefab = candidates[random.int(Math.max(1, candidates.length))];
    const room: Room = {
      id: `room-${i}`,
      prefab: prefab?.id ?? `f${floor}-r${i}`,
      x,
      y,
      w,
      h,
      kind,
      visited: i === 0,
      cleared: kind === 'rest',
      spawned: kind === 'rest',
      name: prefab?.name ?? {
        de: kind === 'boss' ? 'Hauptbühne' : 'Wartungskorridor',
        en: kind === 'boss' ? 'Main stage' : 'Service corridor',
      },
    };
    rooms.push(room);
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) carve(xx, yy);
    if (i > 0) {
      const prev = rooms[i - 1],
        px = prev.x + Math.floor(prev.w / 2),
        py = prev.y + Math.floor(prev.h / 2),
        cx = x + Math.floor(w / 2),
        cy = y + Math.floor(h / 2);
      for (let xx = Math.min(px, cx); xx <= Math.max(px, cx); xx++)
        for (let t = -1; t <= 1; t++) carve(xx, py + t);
      for (let yy = Math.min(py, cy); yy <= Math.max(py, cy); yy++)
        for (let t = -1; t <= 1; t++) carve(cx + t, yy);
    }
    // Hand-authored prefab variants: structural columns never seal the main centreline.
    const variant = prefab?.layout ?? random.int(28);
    if (['combat', 'event', 'treasure'].includes(kind)) {
      const rotation = Math.floor(variant / 7) % 4,
        shape = variant % 7;
      for (let yy = 2; yy < h - 2; yy++)
        for (let xx = 2; xx < w - 2; xx++) {
          if (Math.abs(xx - w / 2) < 2 || Math.abs(yy - h / 2) < 2) continue;
          const u = rotation % 2 ? yy : xx,
            v = rotation % 2 ? xx : yy,
            uw = rotation % 2 ? h : w,
            vh = rotation % 2 ? w : h;
          const a = rotation > 1 ? uw - u : u,
            b = rotation === 1 || rotation === 2 ? vh - v : v;
          const solid =
            shape === 0
              ? (a === 3 || a === uw - 4) && (b === 3 || b === vh - 4)
              : shape === 1
                ? a < 5 && b < 5
                : shape === 2
                  ? b === 3 && a % 4 < 2
                  : shape === 3
                    ? a % 5 === 0 && b % 4 === 0
                    : shape === 4
                      ? a < 4 && (b < 5 || b > vh - 6)
                      : shape === 5
                        ? a === uw - 4 && (b < 5 || b > vh - 6)
                        : (a === 4 || a === uw - 5) && (b === 4 || b === vh - 5);
          if (solid) tiles[y + yy][x + xx] = 0;
        }
    }
    const mechanic = FLOORS[floor - 1]?.mechanic;
    const tile =
      mechanic === 'water'
        ? 2
        : mechanic === 'heat'
          ? 5
          : mechanic === 'ice'
            ? 4
            : mechanic === 'oil'
              ? 3
              : [
                    'conveyors',
                    'magnet',
                    'spores',
                    'cycles',
                    'mirrors',
                    'nodes',
                    'network',
                    'signal',
                    'protocols',
                    'core',
                  ].includes(mechanic ?? '')
                ? 6
                : 0;
    if (tile && !['rest', 'boss', 'guardian', 'hunt', 'puzzle'].includes(kind)) {
      const hx = x + 3,
        hy = y + 3;
      for (let yy = hy; yy < hy + 2; yy++)
        for (let xx = hx; xx < hx + 5; xx++) if (tiles[yy][xx]) tiles[yy][xx] = tile;
    }
  });
  const first = rooms[0],
    startX = (first.x + first.w / 2) * TILE,
    startY = (first.y + first.h / 2) * TILE;
  const player = actor('player', classId, 'player', startX, startY, first.id);
  const nix = actor('nix', 'nix', 'nix', startX - 44, startY + 20, first.id);
  const objects: WorldObject[] = [];
  rooms.forEach((r, i) => {
    const cx = (r.x + r.w / 2) * TILE,
      cy = (r.y + r.h / 2) * TILE;
    const add = (
      type: WorldObject['type'],
      dx: number,
      dy: number,
      label: WorldObject['label'],
      data?: string,
    ) =>
      objects.push({
        id: `obj-${i}-${objects.length}`,
        type,
        x: cx + dx,
        y: cy + dy,
        room: r.id,
        active: true,
        label,
        data,
      });
    if (r.kind === 'puzzle')
      for (let p = 0; p < 3; p++)
        add(
          'terminal',
          (p - 1) * 100,
          20,
          { de: `Leitung ${p + 1} aktivieren`, en: `Activate conduit ${p + 1}` },
          String(p),
        );
    if (r.kind === 'event')
      add('terminal', 0, 0, { de: 'Archivfragment lesen', en: 'Read archive fragment' }, 'story');
    if (r.kind === 'hunt')
      add(
        'shrine',
        0,
        70,
        { de: 'Jagdziel herausfordern', en: 'Challenge the bounty target' },
        'hunt',
      );
    if (r.kind === 'treasure') {
      add('chest', 0, 0, { de: 'Versiegelte Beutekiste', en: 'Sealed loot cache' });
      add('shrine', 120, -80, { de: 'Sponsorvertrag', en: 'Sponsor contract' }, 'contract');
    }
    if (r.kind === 'rest') add('fountain', 0, 60, { de: 'Reparaturstation', en: 'Repair station' });
    if (r.kind === 'boss')
      add('exit', (r.w * TILE) / 2 - 80, 0, { de: 'Sichere Schleuse', en: 'Safe airlock' });
    if (r.kind === 'combat' && i % 2 === 1)
      add('chest', (-r.w * TILE) / 2 + 90, 60, { de: 'Beutekiste öffnen', en: 'Open loot cache' });
  });
  // Interaction targets and their approaches are always navigable, regardless of prefab cover.
  for (const o of objects) {
    const tx = Math.floor(o.x / TILE),
      ty = Math.floor(o.y / TILE);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) carve(tx + dx, ty + dy);
  }
  return {
    id: `world-${floor}-${seed}`,
    seed,
    rng: hashSeed(`${seed}:loot`),
    floor,
    width,
    height,
    tiles,
    rooms,
    enemies: [],
    objects,
    projectiles: [],
    effects: [],
    player,
    nix,
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
export function tileAt(world: WorldData, x: number, y: number) {
  return world.tiles[Math.floor(y / TILE)]?.[Math.floor(x / TILE)] ?? 0;
}
export function walkable(world: WorldData, x: number, y: number, radius = 10) {
  return [
    [radius, 0],
    [-radius, 0],
    [0, radius],
    [0, -radius],
    [radius * 0.7, radius * 0.7],
    [-radius * 0.7, -radius * 0.7],
  ].every(([dx, dy]) => tileAt(world, x + dx, y + dy) !== 0);
}
export function moveActor(world: WorldData, a: Actor, dx: number, dy: number) {
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 8));
  for (let i = 0; i < steps; i++) {
    if (walkable(world, a.x + dx / steps, a.y, a.radius)) a.x += dx / steps;
    if (walkable(world, a.x, a.y + dy / steps, a.radius)) a.y += dy / steps;
  }
  if (Math.abs(dx) + Math.abs(dy) > 0.01)
    a.direction = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : dy < 0 ? 3 : 0;
}
export function roomAt(world: WorldData, x: number, y: number) {
  return world.rooms.find(
    (r) => x >= r.x * TILE && y >= r.y * TILE && x < (r.x + r.w) * TILE && y < (r.y + r.h) * TILE,
  );
}
export function reachableTiles(world: WorldData) {
  const start = [Math.floor(world.player.x / TILE), Math.floor(world.player.y / TILE)];
  const queue = [start],
    visited = new Set([start.join(',')]);
  for (let i = 0; i < queue.length; i++)
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const x = queue[i][0] + dx,
        y = queue[i][1] + dy,
        k = `${x},${y}`;
      if (world.tiles[y]?.[x] && !visited.has(k)) {
        visited.add(k);
        queue.push([x, y]);
      }
    }
  return visited;
}
