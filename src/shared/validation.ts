import { z } from 'zod';
const number = z.number().finite(),
  coord = number.min(-100).max(100000),
  text = z.object({ de: z.string().max(2000), en: z.string().max(2000) });
const element = z.enum([
  'physical',
  'fire',
  'frost',
  'shock',
  'corrosion',
  'bleed',
  'stagger',
  'shield',
  'exposed',
]);
const actor = z.object({
  id: z.string().max(100),
  defId: z.string().max(80),
  type: z.enum(['player', 'mob', 'elite', 'guardian', 'hunt', 'boss', 'nix']),
  room: z.string().max(40),
  x: coord,
  y: coord,
  hp: number.min(0).max(100000),
  maxHp: number.min(1).max(100000),
  radius: number.min(1).max(100),
  speed: number.min(0).max(1000),
  damage: number.min(0).max(100000),
  direction: number.min(0).max(3),
  cooldown: number.min(0).max(10000),
  tell: number.min(0).max(10000),
  aimX: coord,
  aimY: coord,
  pattern: z.string().max(40),
  phase: number.min(1).max(3),
  statuses: z
    .array(
      z.object({
        element,
        until: number.min(0),
        source: z.string().max(100),
        power: number.min(0).max(100000),
        next: number.min(0),
      }),
    )
    .max(9),
  dead: z.boolean(),
});
const item = z.object({
  uid: z.string().max(160),
  defId: z.string().max(80),
  level: z.number().int().min(1).max(20),
  affixes: z.array(z.string().max(80)).max(4),
  favorite: z.boolean(),
  quantity: z.number().int().min(1).max(99),
});
const combat = z.object({
  resource: number.min(0).max(10000),
  shield: number.min(0).max(10000),
  ultimate: number.min(0).max(100),
  invulnerable: number.min(0).max(10),
  cooldowns: z.record(z.string().max(80), number.min(0).max(10000)),
  buffs: z
    .array(
      z.object({ effect: z.string().max(40), until: number.min(0), value: number.min(0).max(10) }),
    )
    .max(16)
    .optional(),
});
const world = z
  .object({
    id: z.string().max(100),
    seed: z.number().int().min(0),
    rng: z.number().int().min(0),
    floor: z.number().int().min(1).max(12),
    width: z.number().int().min(1).max(150),
    height: z.number().int().min(1).max(150),
    tiles: z.array(z.array(z.number().int().min(0).max(6)).max(150)).max(150),
    rooms: z
      .array(
        z.object({
          id: z.string().max(50),
          prefab: z.string().max(80),
          x: number.min(0),
          y: number.min(0),
          w: number.min(1),
          h: number.min(1),
          kind: z.enum([
            'combat',
            'event',
            'rest',
            'puzzle',
            'guardian',
            'hunt',
            'boss',
            'treasure',
          ]),
          visited: z.boolean(),
          cleared: z.boolean(),
          spawned: z.boolean(),
          name: text,
        }),
      )
      .max(40),
    enemies: z.array(actor).max(200),
    objects: z
      .array(
        z.object({
          id: z.string().max(140),
          type: z.enum(['chest', 'terminal', 'fountain', 'exit', 'npc', 'shrine']),
          x: coord,
          y: coord,
          room: z.string().max(50),
          active: z.boolean(),
          label: text,
          data: z.string().max(100).optional(),
        }),
      )
      .max(100),
    projectiles: z
      .array(
        z.object({
          id: z.string().max(100),
          x: coord,
          y: coord,
          vx: number,
          vy: number,
          radius: number.min(1).max(100),
          power: number.min(0).max(100000),
          element,
          owner: z.enum(['player', 'enemy']),
          ttl: number.min(0).max(100),
          color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
          hits: z.array(z.string().max(100)).max(50),
        }),
      )
      .max(160),
    effects: z
      .array(
        z.object({
          id: z.string().max(100),
          x: coord,
          y: coord,
          type: z.enum(['hit', 'ring', 'line', 'heal', 'text', 'telegraph', 'trap', 'turret']),
          radius: number.min(0).max(1000),
          angle: number,
          color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
          ttl: number.min(0).max(100),
          duration: number.min(0).max(100),
          text: z.string().max(120).optional(),
          power: number.min(0).max(100000).optional(),
          source: z.string().max(100).optional(),
        }),
      )
      .max(150),
    player: actor,
    nix: actor,
    tick: z.number().int().min(0),
    elapsed: number.min(0),
    kills: z.number().int().min(0),
    bossKilled: z.boolean(),
    guardianKilled: z.boolean(),
    huntKilled: z.boolean(),
    roomId: z.string().max(50),
    attackAnim: number.min(0).max(10),
    seq: z.number().int().min(0).optional(),
    contractBoost: z.boolean().optional(),
    combat: combat.optional(),
  })
  .refine(
    (w) => w.tiles.length === w.height && w.tiles.every((row) => row.length === w.width),
    'Map dimensions differ',
  );
export const campaignSchema = z.object({
  schema: z.literal(1),
  slot: z.number().int().min(0).max(2),
  name: z.string().min(1).max(24),
  classId: z.string().max(50),
  level: z.number().int().min(1).max(20),
  xp: number.min(0).max(100000),
  mastery: z.number().int().min(1).max(15),
  floorUnlocked: z.number().int().min(1).max(12),
  actUnlocked: z.number().int().min(1).max(4),
  completedFloors: z.array(z.number().int().min(1).max(12)).max(12),
  scrap: number.min(0).max(10000000),
  marks: number.min(0).max(10000000),
  inventory: z.array(item).max(24),
  stash: z.array(item).max(200),
  equipment: z.object({
    weapon: z.string().nullable(),
    offhand: z.string().nullable(),
    head: z.string().nullable(),
    body: z.string().nullable(),
    hands: z.string().nullable(),
    feet: z.string().nullable(),
    amulet: z.string().nullable(),
    talisman: z.string().nullable(),
  }),
  relics: z.array(z.string().max(160)).max(2),
  talents: z.array(z.string().max(80)).max(10),
  specialization: z.number().int().min(-1).max(1),
  skills: z.array(z.string().max(80)).length(2),
  questProgress: z.record(
    z.string().max(80),
    z.object({ count: z.number().int().min(0).max(10000), confirmed: z.boolean() }),
  ),
  discovered: z.array(z.string().max(80)).max(1000),
  relationships: z.record(z.string().max(50), number.min(0).max(100000)),
  choices: z.record(z.string().max(100), z.string().max(100)),
  ending: z.enum(['liberate', 'control', 'negotiate']).nullable(),
  world: world.nullable(),
  updatedAt: number.min(0),
  createdAt: number.min(0),
  run: z.number().int().min(0),
  runScrap: number.min(0).max(10000000),
  unbanked: z.array(z.string().max(160)).max(224),
});
export const credentialsSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(24)
    .regex(/^[A-Za-z0-9_-]+$/),
  password: z.string().min(10).max(128),
});
export const saveRequestSchema = z.object({
  campaign: campaignSchema,
  expectedRevision: z.number().int().min(0),
  mutationId: z.string().uuid(),
});
