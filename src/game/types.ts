export type Lang = 'de' | 'en';
export type Text = { de: string; en: string };
export type Phase =
  'title' | 'classselect' | 'origin' | 'hub' | 'town' | 'playing' | 'dead' | 'ending';
export type Panel =
  | 'none'
  | 'inventory'
  | 'journal'
  | 'map'
  | 'character'
  | 'settings'
  | 'codex'
  | 'shop'
  | 'craft'
  | 'account'
  | 'slots'
  | 'cities'
  | 'contracts'
  | 'story'
  | 'dialog';
export type Element =
  | 'physical'
  | 'fire'
  | 'frost'
  | 'shock'
  | 'corrosion'
  | 'bleed'
  | 'stagger'
  | 'shield'
  | 'exposed';
export type Role =
  'chaser' | 'flanker' | 'shooter' | 'summoner' | 'tank' | 'support' | 'controller' | 'ambusher';
export type GearSlot =
  'weapon' | 'offhand' | 'head' | 'body' | 'hands' | 'feet' | 'amulet' | 'talisman';
export type AbilityKind =
  | 'strike'
  | 'nova'
  | 'projectile'
  | 'dash'
  | 'shield'
  | 'heal'
  | 'trap'
  | 'mark'
  | 'turret'
  | 'curse';
export interface AbilityDef {
  id: string;
  name: Text;
  description: Text;
  kind: AbilityKind;
  element: Element;
  power: number;
  range: number;
  cooldown: number;
  cost: number;
  color: string;
}
export interface TalentDef {
  id: string;
  name: Text;
  description: Text;
  stat: string;
  value: number;
}
export interface ClassDef {
  id: string;
  name: Text;
  description: Text;
  lore: Text;
  color: string;
  sprite: string;
  hp: number;
  resource: number;
  speed: number;
  power: number;
  ranged: boolean;
  abilities: AbilityDef[];
  ultimate: AbilityDef;
  specs: { name: Text; description: Text; stat: string; value: number }[];
  talents: TalentDef[];
}
export interface MobDef {
  id: string;
  name: Text;
  description: Text;
  role: Role;
  element: Element;
  hp: number;
  damage: number;
  speed: number;
  color: string;
  sprite: string;
  elite?: boolean;
}
export interface BossDef {
  id: string;
  name: Text;
  description: Text;
  patterns: string[];
  element: Element;
  hp: number;
  damage: number;
  color: string;
  sprite: string;
  unique: string;
}
export interface FloorDef {
  id: string;
  index: number;
  act: number;
  name: Text;
  description: Text;
  story: Text;
  colors: { floor: string; wall: string; accent: string; light: string };
  mechanic: string;
  mobs: MobDef[];
  elites: MobDef[];
  minibosses: BossDef[];
  boss: BossDef;
}
export interface ItemDef {
  id: string;
  name: Text;
  description: Text;
  kind: 'gear' | 'relic' | 'consumable' | 'key';
  slot?: GearSlot;
  rarity: number;
  floor: number;
  icon: number;
  stat: string;
  value: number;
  effect?: string;
  set?: string;
  price: number;
}
export interface AffixDef {
  id: string;
  name: Text;
  stat: string;
  value: number;
  slots: GearSlot[];
}
export interface ItemInstance {
  uid: string;
  defId: string;
  level: number;
  affixes: string[];
  favorite: boolean;
  quantity: number;
}
export interface QuestDef {
  id: string;
  name: Text;
  description: Text;
  floor: number;
  category: 'main' | 'side' | 'relationship';
  objective: 'terminal' | 'boss' | 'exit' | 'kills' | 'chest' | 'hunt' | 'talk' | 'puzzle';
  target: number;
  npc?: string;
  reward: number;
}
export interface RecipeDef {
  id: string;
  name: Text;
  item: string;
  cost: number;
  floor: number;
}
export interface NpcDef {
  id: string;
  name: string;
  role: Text;
  description: Text;
  lines: Text[];
  color: string;
}
export interface SetDef {
  id: string;
  name: Text;
  two: Text;
  four: Text;
  stat: string;
  value: number;
  effect: string;
}
export interface RoomPrefab {
  id: string;
  floor: number;
  kind: RoomKind;
  layout: number;
  name: Text;
}
export type RoomKind =
  'combat' | 'event' | 'rest' | 'puzzle' | 'guardian' | 'hunt' | 'boss' | 'treasure';
export interface Room {
  id: string;
  prefab: string;
  x: number;
  y: number;
  w: number;
  h: number;
  kind: RoomKind;
  visited: boolean;
  cleared: boolean;
  spawned: boolean;
  name: Text;
  biome?: number;
  district?: 'market' | 'residential' | 'archive' | 'gate';
}
export interface Status {
  element: Element;
  until: number;
  source: string;
  power: number;
  next: number;
}
export interface Actor {
  id: string;
  defId: string;
  type: 'player' | 'mob' | 'elite' | 'guardian' | 'hunt' | 'boss' | 'nix';
  room: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  radius: number;
  speed: number;
  damage: number;
  direction: number;
  cooldown: number;
  tell: number;
  aimX: number;
  aimY: number;
  pattern: string;
  phase: number;
  statuses: Status[];
  dead: boolean;
}
export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  power: number;
  element: Element;
  owner: 'player' | 'enemy';
  ttl: number;
  color: string;
  hits: string[];
}
export interface Effect {
  id: string;
  x: number;
  y: number;
  type: 'hit' | 'ring' | 'line' | 'heal' | 'text' | 'telegraph' | 'trap' | 'turret';
  radius: number;
  angle: number;
  color: string;
  ttl: number;
  duration: number;
  text?: string;
  power?: number;
  source?: string;
}
export interface WorldObject {
  id: string;
  type: 'chest' | 'terminal' | 'fountain' | 'exit' | 'npc' | 'shrine';
  x: number;
  y: number;
  room: string;
  active: boolean;
  label: Text;
  data?: string;
}
export interface WorldData {
  id: string;
  seed: number;
  rng: number;
  floor: number;
  width: number;
  height: number;
  tiles: number[][];
  rooms: Room[];
  enemies: Actor[];
  objects: WorldObject[];
  projectiles: Projectile[];
  effects: Effect[];
  player: Actor;
  nix: Actor;
  tick: number;
  elapsed: number;
  kills: number;
  bossKilled: boolean;
  guardianKilled: boolean;
  huntKilled: boolean;
  roomId: string;
  attackAnim: number;
  seq?: number;
  contractBoost?: boolean;
  region?: string;
  route?: 'balanced' | 'dangerous' | 'exploration';
  modifiers?: string[];
  bossIds?: { boss: string; guardian: string; hunt: string };
  edges?: [string, string][];
  combat?: {
    resource: number;
    shield: number;
    ultimate: number;
    invulnerable: number;
    cooldowns: Record<string, number>;
    buffs?: { effect: string; until: number; value: number }[];
  };
}
export interface Campaign {
  schema: 1;
  slot: number;
  name: string;
  classId: string;
  level: number;
  xp: number;
  mastery: number;
  floorUnlocked: number;
  actUnlocked: number;
  completedFloors: number[];
  scrap: number;
  marks: number;
  inventory: ItemInstance[];
  stash: ItemInstance[];
  equipment: Record<GearSlot, string | null>;
  relics: string[];
  talents: string[];
  specialization: number;
  skills: string[];
  questProgress: Record<string, { count: number; confirmed: boolean }>;
  discovered: string[];
  relationships: Record<string, number>;
  choices: Record<string, string>;
  ending: string | null;
  world: WorldData | null;
  updatedAt: number;
  createdAt: number;
  run: number;
  runScrap: number;
  unbanked: string[];
  origin?: string;
  acceptedQuests?: string[];
  completedCityQuests?: string[];
  cityQuestBank?: Record<string, number>;
}
export interface Settings {
  music: number;
  sound: number;
  shake: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  autoAttack: boolean;
  leftHanded: boolean;
  difficulty: 'story' | 'standard' | 'challenge';
  textScale: number;
  quality: 'auto' | 'high' | 'low';
  bindings: Record<string, string>;
}
export interface Dialog {
  speaker: string;
  title: Text;
  lines: Text[];
  choices: { id: string; label: Text }[];
}
export interface AccountView {
  username: string | null;
  available: boolean;
  status: 'local' | 'synced' | 'syncing' | 'offline' | 'error' | 'conflict';
  message: string;
  conflict?: { local: Campaign; cloud: Campaign; revision: number };
}
export interface GameView {
  renderer: { status: 'loading' | 'ready' | 'error'; progress: number };
  cityId: string | null;
  questGiver: string | null;
  phase: Phase;
  panel: Panel;
  paused: boolean;
  lang: Lang;
  campaign: Campaign | null;
  settings: Settings;
  floor: number;
  hp: number;
  maxHp: number;
  resource: number;
  maxResource: number;
  shield: number;
  cooldowns: Record<string, number>;
  ultimate: number;
  boss: { name: Text; hp: number; maxHp: number; phase: number } | null;
  quest: QuestDef | null;
  interaction: Text | null;
  dialog: Dialog | null;
  toasts: { id: string; text: Text; tone: string }[];
  saveStatus: string;
  slots: {
    slot: number;
    name: string;
    classId: string;
    floor: number;
    level: number;
    updatedAt: number;
  }[];
  account: AccountView;
  shop: string[];
  stats: { damage: number; armor: number; crit: number; speed: number };
}
