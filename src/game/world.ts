import type { Actor, WorldData } from './types';
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
export { generateWorld, generateCity } from './generation';
export function nearestInteraction(world: WorldData, radius = 85) {
  const { x, y } = world.player;
  const candidates = world.objects.filter((o) => o.active && Math.hypot(o.x - x, o.y - y) < radius);
  // The following companion must not intercept a market contact or a service at the player's feet.
  const preferred = world.region
    ? candidates.filter((o) => !(o.type === 'npc' && o.data === 'nix'))
    : candidates;
  return (preferred.length ? preferred : candidates).sort(
    (a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y),
  )[0];
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
