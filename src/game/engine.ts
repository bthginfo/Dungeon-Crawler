import { CLASSES, FLOORS, ITEMS, AFFIXES, SETS, ENCOUNTERS, ALL_BOSSES } from '../content';
import type {
  AbilityDef,
  Actor,
  Campaign,
  Element,
  Effect,
  MobDef,
  Settings,
  WorldData,
  Room,
  BossDef,
  ItemDef,
} from './types';
import { actor, moveActor, roomAt, tileAt, TILE, walkable } from './world';
import { nextRandom } from './random';
export interface Input {
  moveX: number;
  moveY: number;
  aimX: number;
  aimY: number;
  attacking: boolean;
}
export interface Stats {
  damage: number;
  armor: number;
  crit: number;
  speed: number;
  maxHp: number;
  maxResource: number;
  regen: number;
  cooldown: number;
  healing: number;
  lifesteal: number;
  nix: number;
  gold: number;
  elemental: number;
  effects: Set<string>;
}
const slots = ['weapon', 'offhand', 'head', 'body', 'hands', 'feet', 'amulet', 'talisman'] as const;
const mobMap = new Map(FLOORS.flatMap((f) => [...f.mobs, ...f.elites]).map((m) => [m.id, m]));
const bossMap = new Map(ALL_BOSSES.map((b) => [b.id, b]));
export function effectiveStats(c: Campaign): Stats {
  const cls = CLASSES.find((k) => k.id === c.classId) ?? CLASSES[0];
  const stats: Stats = {
    damage: (cls.power + Math.max(0, c.level - 1) * 2.4) * (1 + Math.max(0, c.mastery - 1) * 0.015),
    armor: 0,
    crit: 0.06,
    speed: cls.speed,
    maxHp: cls.hp + (c.level - 1) * 8 + Math.max(0, c.mastery - 1) * 2,
    maxResource: cls.resource,
    regen: 5,
    cooldown: 0,
    healing: 0,
    lifesteal: 0,
    nix: 0,
    gold: 0,
    elemental: 0,
    effects: new Set(),
  };
  const modifiers: Record<string, number> = {};
  const setCounts: Record<string, number> = {};
  let flatDamage = 0,
    percentDamage = 0;
  const add = (stat: string, value: number) => {
    if (stat === 'damage') {
      if (value >= 1) flatDamage += value;
      else percentDamage += value;
    } else modifiers[stat] = (modifiers[stat] ?? 0) + value;
  };
  for (const uid of [...slots.map((s) => c.equipment[s]), ...c.relics]) {
    if (!uid) continue;
    const instance = c.inventory.find((i) => i.uid === uid) ?? c.stash.find((i) => i.uid === uid);
    const item = ITEMS.find((i) => i.id === (instance?.defId ?? uid));
    if (!item) continue;
    add(item.stat, item.value);
    if (item.effect) stats.effects.add(item.effect);
    if (item.set) setCounts[item.set] = (setCounts[item.set] ?? 0) + 1;
    for (const affixId of instance?.affixes ?? []) {
      const affix = AFFIXES.find((a) => a.id === affixId);
      if (affix) add(affix.stat, affix.value);
    }
  }
  for (const t of cls.talents) if (c.talents.includes(t.id)) add(t.stat, t.value);
  const spec = cls.specs[c.specialization];
  if (spec) {
    add(spec.stat, spec.value);
    if (c.specialization === 0) stats.effects.add('dodge-shield');
    else stats.effects.add('execute');
  }
  for (const s of SETS) {
    const n = setCounts[s.id] ?? 0;
    if (n >= 2) add(s.stat, s.value);
    if (n >= 4) stats.effects.add(s.effect);
  }
  for (const [k, v] of Object.entries(modifiers)) {
    if (k === 'damage') stats.damage += v >= 1 ? v : stats.damage * v;
    else if (k === 'speed') stats.speed *= 1 + v;
    else if (k in stats && typeof stats[k as keyof Stats] === 'number')
      (stats as unknown as Record<string, number>)[k] += v;
  }
  stats.damage = (stats.damage + flatDamage) * (1 + percentDamage);
  if (stats.effects.has('crit')) stats.crit += 0.08;
  if (stats.effects.has('armor')) stats.armor += 8;
  if (stats.effects.has('speed')) stats.speed *= 1.1;
  if (stats.effects.has('healing')) stats.healing += 0.15;
  if (stats.effects.has('gold')) stats.gold += 0.2;
  if (stats.effects.has('nix')) stats.nix += 0.25;
  stats.crit = Math.min(0.65, stats.crit);
  stats.cooldown = Math.min(0.55, stats.cooldown);
  stats.armor = Math.min(65, stats.armor);
  stats.lifesteal = Math.min(0.2, stats.lifesteal);
  stats.speed = Math.min(250, stats.speed);
  stats.maxHp = Math.max(50, stats.maxHp);
  return stats;
}
export interface SimulationEvents {
  kill(a: Actor): void;
  room(r: Room): void;
  death(): void;
  feedback(kind: 'attack' | 'hit' | 'loot' | 'heal' | 'dodge' | 'death' | 'boss' | 'click'): void;
}
export class Simulation {
  world: WorldData;
  campaign: Campaign;
  settings: Settings;
  events: SimulationEvents;
  resource: number;
  shield = 0;
  ultimate = 0;
  cooldowns: Record<string, number> = {};
  invulnerable = 0;
  stats: Stats;
  private deferredSpawn: Actor[] = [];
  private buffs: { effect: string; until: number; value: number }[] = [];
  private flow = new Int32Array();
  private flowTarget = -1;
  constructor(w: WorldData, c: Campaign, s: Settings, e: SimulationEvents) {
    this.world = w;
    this.campaign = c;
    this.settings = s;
    this.events = e;
    this.stats = effectiveStats(c);
    this.buffs = [...(w.combat?.buffs ?? [])];
    this.recalculate();
    this.resource = w.combat?.resource ?? this.stats.maxResource;
    this.shield = w.combat?.shield ?? 0;
    this.ultimate = w.combat?.ultimate ?? 0;
    this.invulnerable = w.combat?.invulnerable ?? 0;
    this.cooldowns = { ...w.combat?.cooldowns };
  }
  recalculate() {
    this.stats = effectiveStats(this.campaign);
    for (const b of this.buffs)
      if (b.until > this.world.tick) {
        this.stats.effects.add(b.effect);
        this.stats.elemental += b.value;
      }
    this.world.player.maxHp = this.stats.maxHp;
    this.world.player.hp = Math.min(this.world.player.hp, this.stats.maxHp);
  }
  combatState() {
    return {
      resource: this.resource,
      shield: this.shield,
      ultimate: this.ultimate,
      invulnerable: this.invulnerable,
      cooldowns: { ...this.cooldowns },
      buffs: this.buffs.map((b) => ({ ...b })),
    };
  }
  useConsumable(def: ItemDef) {
    const p = this.world.player;
    if (p.dead) return false;
    if (def.stat === 'healing' || def.stat === 'maxHp') {
      if (p.hp >= p.maxHp) return false;
      p.hp = Math.min(
        p.maxHp,
        p.hp + (def.value >= 1 ? def.value : p.maxHp * def.value) * (1 + this.stats.healing),
      );
      this.effect(p.x, p.y, 'heal', 45, '#8ce2b7', 0.7);
      this.events.feedback('heal');
      return true;
    }
    if (def.stat === 'regen' || def.stat === 'maxResource') {
      if (this.resource >= this.stats.maxResource) return false;
      this.resource = Math.min(this.stats.maxResource, this.resource + 25);
      return true;
    }
    if (def.effect) {
      this.buffs = this.buffs.filter((b) => b.effect !== def.effect);
      this.buffs.push({
        effect: def.effect,
        until: this.world.tick + 45 * 60,
        value: def.stat === 'elemental' ? def.value : 0,
      });
      this.recalculate();
      this.effect(p.x, p.y, 'ring', 42, '#eacb8a', 0.6);
      return true;
    }
    return false;
  }
  private navigation(a: Actor) {
    const w = this.world,
      p = w.player,
      tx = Math.floor(p.x / TILE),
      ty = Math.floor(p.y / TILE),
      target = ty * w.width + tx;
    if (this.flowTarget !== target) {
      this.flowTarget = target;
      this.flow = new Int32Array(w.width * w.height).fill(-1);
      const queue = new Int32Array(this.flow.length);
      let head = 0,
        tail = 0;
      queue[tail++] = target;
      this.flow[target] = 0;
      while (head < tail) {
        const id = queue[head++],
          x = id % w.width,
          y = Math.floor(id / w.width);
        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ]) {
          const nx = x + dx,
            ny = y + dy,
            n = ny * w.width + nx;
          if (
            nx >= 0 &&
            ny >= 0 &&
            nx < w.width &&
            ny < w.height &&
            w.tiles[ny][nx] &&
            this.flow[n] < 0
          ) {
            this.flow[n] = this.flow[id] + 1;
            queue[tail++] = n;
          }
        }
      }
    }
    const ax = Math.floor(a.x / TILE),
      ay = Math.floor(a.y / TILE),
      id = ay * w.width + ax;
    let best = this.flow[id],
      bx = p.x,
      by = p.y;
    if (best > 1) {
      bx = (ax + 0.5) * TILE;
      by = (ay + 0.5) * TILE;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const x = ax + dx,
          y = ay + dy,
          n = y * w.width + x,
          d = this.flow[n];
        if (
          x >= 0 &&
          y >= 0 &&
          x < w.width &&
          y < w.height &&
          d >= 0 &&
          d < best &&
          walkable(w, (x + 0.5) * TILE, (y + 0.5) * TILE, a.radius)
        ) {
          best = d;
          bx = (x + 0.5) * TILE;
          by = (y + 0.5) * TILE;
        }
      }
    }
    const dx = bx - a.x,
      dy = by - a.y,
      len = Math.hypot(dx, dy) || 1;
    return { x: dx / len, y: dy / len };
  }
  random() {
    this.world.rng = nextRandom(this.world.rng);
    return this.world.rng / 4294967296;
  }
  private uid(prefix: string) {
    this.world.seq = (this.world.seq ?? 0) + 1;
    return `${prefix}-${this.world.tick}-${this.world.seq}`;
  }
  effect(
    x: number,
    y: number,
    type: Effect['type'],
    radius: number,
    color: string,
    ttl = 0.4,
    text?: string,
    power?: number,
  ) {
    const effect = {
      id: this.uid('fx'),
      x,
      y,
      type,
      radius,
      color,
      ttl,
      duration: ttl,
      angle: 0,
      text,
      power,
    };
    this.world.effects.push(effect);
    if (this.world.effects.length > 150)
      this.world.effects.splice(0, this.world.effects.length - 150);
    return effect as Effect;
  }
  private addStatus(a: Actor, element: Element, power: number, source = 'player', seconds = 3) {
    if (element === 'physical' || element === 'shield') return;
    const found = a.statuses.find((s) => s.element === element);
    const until = this.world.tick + Math.round(seconds * 60);
    if (found) {
      found.until = Math.max(found.until, until);
      found.power = Math.max(found.power, power);
    } else a.statuses.push({ element, until, power, source, next: this.world.tick + 30 });
    if (element === 'stagger') {
      a.tell = 0;
      a.cooldown = Math.max(a.cooldown, 0.8);
    }
  }
  hit(
    target: Actor,
    power: number,
    element: Element = 'physical',
    source = 'player',
    procs = true,
  ) {
    if (target.dead) return;
    if (target.type === 'player') {
      if (this.invulnerable > 0) return;
      const difficulty =
        this.settings.difficulty === 'story'
          ? 0.65
          : this.settings.difficulty === 'challenge'
            ? 1.8
            : 1.4;
      let damage =
        power *
        difficulty *
        (1 - this.stats.armor / 100) *
        (element === 'shock' && tileAt(this.world, target.x, target.y) === 2 ? 1.3 : 1);
      const absorb = Math.min(this.shield, damage);
      this.shield -= absorb;
      damage -= absorb;
      target.hp = Math.max(0, target.hp - damage);
      this.invulnerable = 0.18;
      this.effect(target.x, target.y - 25, 'text', 0, '#f88777', 0.65, `−${Math.ceil(damage)}`);
      this.events.feedback('hit');
      if (this.stats.effects.has('thorns')) {
        const enemy = this.world.enemies.find((a) => a.id === source);
        if (enemy) this.hit(enemy, power * 0.25, 'physical', 'thorns', false);
      }
      if (procs && ['fire', 'frost', 'bleed', 'corrosion'].includes(element))
        this.addStatus(target, element, damage * 0.06, source, 2);
      if (target.hp <= 0) {
        target.dead = true;
        this.events.death();
      }
    } else {
      const crit = source === 'player' && this.random() < this.stats.crit;
      let damage =
        power * (crit ? 1.65 : 1) * (element !== 'physical' ? 1 + this.stats.elemental : 1);
      const def = mobMap.get(target.defId);
      if (def?.role === 'tank' && element === 'physical') {
        const facing = [
          [0, 1],
          [-1, 0],
          [1, 0],
          [0, -1],
        ][target.direction];
        const dx = this.world.player.x - target.x,
          dy = this.world.player.y - target.y,
          dist = Math.hypot(dx, dy) || 1;
        damage *= (dx * facing[0] + dy * facing[1]) / dist > 0.25 ? 0.5 : 1.1;
      }
      if (target.statuses.some((s) => s.element === 'exposed' || s.element === 'corrosion'))
        damage *= 1.2;
      if (this.stats.effects.has('execute') && target.hp < target.maxHp * 0.2) damage *= 1.35;
      target.hp = Math.max(0, target.hp - damage);
      this.effect(
        target.x,
        target.y - 25,
        'text',
        0,
        crit ? '#ffdc82' : '#e5dbc7',
        0.5,
        `${Math.ceil(damage)}${crit ? '!' : ''}`,
      );
      this.effect(target.x, target.y, 'hit', 15, crit ? '#eec675' : '#ffffff', 0.14);
      if (procs) this.addStatus(target, element, damage * 0.13, source);
      this.ultimate = Math.min(100, this.ultimate + damage * 0.075);
      if (procs && source === 'player') {
        const steal = this.stats.lifesteal + (this.stats.effects.has('lifesteal') ? 0.025 : 0);
        this.world.player.hp = Math.min(this.stats.maxHp, this.world.player.hp + damage * steal);
        if (this.stats.effects.has('burn')) this.addStatus(target, 'fire', damage * 0.1);
        if (this.stats.effects.has('frost')) this.addStatus(target, 'frost', 0);
        if (this.stats.effects.has('stagger')) this.addStatus(target, 'stagger', 0, 'player', 0.5);
        if (this.stats.effects.has('chain') && this.random() < 0.18) {
          const others = this.world.enemies
            .filter(
              (a) =>
                !a.dead && a.id !== target.id && Math.hypot(a.x - target.x, a.y - target.y) < 150,
            )
            .slice(0, 2);
          for (const a of others) this.hit(a, damage * 0.4, 'shock', 'chain', false);
        }
        if (
          this.stats.effects.has('turret') &&
          this.random() < 0.1 &&
          !this.world.effects.some((e) => e.type === 'turret')
        )
          this.effect(
            this.world.player.x - 25,
            this.world.player.y,
            'turret',
            180,
            '#8ce2b7',
            3,
            undefined,
            this.stats.damage * 0.25,
          );
      }
      if (target.hp <= 0) {
        target.dead = true;
        this.events.kill(target);
      }
    }
  }
  spawnRoom(room: Room) {
    if (room.spawned) return;
    room.spawned = true;
    if (this.world.region) {
      room.cleared = true;
      return;
    }
    const f = FLOORS[this.world.floor - 1];
    const mods = this.world.modifiers ?? [];
    const spawn = (def: MobDef | BossDef, type: Actor['type'], x: number, y: number) => {
      const a = actor(this.uid('enemy'), def.id, type, x, y, room.id);
      const hpScale =
        this.settings.difficulty === 'story'
          ? 0.85
          : this.settings.difficulty === 'challenge'
            ? 1.5
            : 1.22;
      const secondary =
        type !== 'boss' && bossMap.has(def.id) && !f.minibosses.some((b) => b.id === def.id)
          ? 0.55
          : 1;
      a.hp = a.maxHp =
        def.hp *
        hpScale *
        secondary *
        (mods.includes('warded') ? 1.2 : 1) *
        (this.world.route === 'dangerous' ? 1.1 : 1);
      a.damage = def.damage * (this.world.route === 'dangerous' ? 1.12 : 1);
      a.speed =
        ('speed' in def ? def.speed : 86) *
        (this.settings.difficulty === 'story'
          ? 0.95
          : this.settings.difficulty === 'challenge'
            ? 1.22
            : 1.12) *
        (mods.includes('stalkers') ? 1.2 : 1);
      a.radius = type === 'boss' ? 23 : type === 'guardian' || type === 'hunt' ? 18 : 11;
      a.cooldown = 0.35 + this.random() * 0.75;
      this.world.enemies.push(a);
      return a;
    };
    const centerX = (room.x + room.w / 2) * TILE,
      centerY = (room.y + room.h / 2) * TILE;
    if (room.kind === 'boss' || room.kind === 'guardian' || room.kind === 'hunt') {
      const def =
        bossMap.get(this.world.bossIds?.[room.kind] ?? '') ??
        (room.kind === 'boss' ? f.boss : f.minibosses[room.kind === 'guardian' ? 0 : 1]);
      spawn(def, room.kind === 'boss' ? 'boss' : room.kind, centerX, centerY - 70);
      this.events.feedback('boss');
    } else if (room.kind === 'combat') {
      const forms = ENCOUNTERS.filter((e) => e.floor === f.index);
      const form = forms[Math.floor(this.random() * forms.length)];
      const ids = [...(form?.mobs ?? [f.mobs[0].id, f.mobs[2].id, f.mobs[4].id])];
      const minimum =
        (this.settings.difficulty === 'story' ? 4 : 5) +
        (mods.includes('swarm') ? 2 : 0) +
        (this.world.route === 'dangerous' ? 1 : 0);
      while (ids.length < minimum) ids.push(f.mobs[Math.floor(this.random() * f.mobs.length)].id);
      if (mods.includes('invasion')) {
        const neighbour =
          FLOORS[Math.max(0, Math.min(11, f.index - 1 + (f.index === 12 ? -1 : 1)))];
        ids[0] = neighbour.mobs[Math.floor(this.random() * neighbour.mobs.length)].id;
        ids[ids.length - 1] = neighbour.mobs[Math.floor(this.random() * neighbour.mobs.length)].id;
      }
      for (let i = 0; i < Math.min(ids.length, 9); i++) {
        const def = mobMap.get(ids[i]) ?? f.mobs[i % 8];
        let x = centerX + Math.cos(i * 2.399) * 120,
          y = centerY + Math.sin(i * 2.399) * 100;
        if (!walkable(this.world, x, y)) {
          x = centerX;
          y = centerY;
        }
        spawn(def, def.elite ? 'elite' : 'mob', x, y);
      }
      if (
        this.random() <
        (mods.includes('veterans') ? 0.6 : this.world.route === 'dangerous' ? 0.3 : 0.16)
      )
        spawn(f.elites[Math.floor(this.random() * 2)], 'elite', centerX, centerY);
    } else room.cleared = true;
    if (this.world.contractBoost) {
      const spawned = this.world.enemies.filter((e) => e.room === room.id && !e.dead);
      if (spawned.length) {
        for (const e of spawned) {
          e.hp = e.maxHp *= 1.15;
          e.damage *= 1.1;
        }
        this.world.contractBoost = false;
      }
    }
  }
  private projectile(
    x: number,
    y: number,
    angle: number,
    power: number,
    element: Element,
    owner: 'player' | 'enemy',
    speed = 280,
    color = '#eacb8a',
  ) {
    this.world.projectiles.push({
      id: this.uid('projectile'),
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: owner === 'enemy' ? 7 : 5,
      power,
      element,
      owner,
      ttl: 2.6,
      color,
      hits: [],
    });
  }
  primary(input: Input) {
    if ((this.cooldowns.attack ?? 0) > 0) return;
    const p = this.world.player,
      cls = CLASSES.find((c) => c.id === this.campaign.classId) ?? CLASSES[0];
    const angle = Math.atan2(input.aimY - p.y, input.aimX - p.x);
    this.cooldowns.attack = 0.36 * (1 - this.stats.cooldown);
    this.world.attackAnim = 0.24;
    this.events.feedback('attack');
    if (cls.ranged)
      this.projectile(p.x, p.y, angle, this.stats.damage, 'physical', 'player', 430, cls.color);
    else {
      const enemies = this.world.enemies.filter(
        (a) =>
          !a.dead &&
          Math.hypot(a.x - p.x, a.y - p.y) < 80 &&
          Math.cos(Math.atan2(a.y - p.y, a.x - p.x) - angle) > 0.25,
      );
      for (const a of enemies.slice(0, 4)) this.hit(a, this.stats.damage);
      this.effect(
        p.x + Math.cos(angle) * 35,
        p.y + Math.sin(angle) * 35,
        'ring',
        42,
        cls.color,
        0.18,
      );
    }
  }
  action(action: string, input: Input) {
    const p = this.world.player;
    if (p.dead) return;
    if (action === 'attack') {
      this.primary(input);
      return;
    }
    if (action === 'dodge') {
      if ((this.cooldowns.dodge ?? 0) > 0) return;
      let x = input.moveX,
        y = input.moveY;
      if (Math.hypot(x, y) < 0.1) {
        const a = Math.atan2(input.aimY - p.y, input.aimX - p.x);
        x = Math.cos(a);
        y = Math.sin(a);
      }
      const len = Math.hypot(x, y) || 1;
      moveActor(this.world, p, (x / len) * 110, (y / len) * 110);
      this.invulnerable = 0.45;
      this.cooldowns.dodge = 1.7 * (1 - this.stats.cooldown);
      if (this.stats.effects.has('dodge-shield')) this.shield = Math.min(60, this.shield + 12);
      this.effect(p.x, p.y, 'ring', 35, '#a8c7b7', 0.3);
      this.events.feedback('dodge');
      return;
    }
    if (action === 'heal') {
      if ((this.cooldowns.heal ?? 0) > 0 || p.hp >= this.stats.maxHp) return;
      const potion = this.campaign.inventory.find((i) => {
          const d = ITEMS.find((d) => d.id === i.defId);
          return d?.kind === 'consumable' && ['healing', 'maxHp'].includes(d.stat);
        }),
        def = ITEMS.find((d) => d.id === potion?.defId);
      if (!potion || !def || !this.useConsumable(def)) return;
      if (--potion.quantity <= 0) {
        this.campaign.inventory = this.campaign.inventory.filter((i) => i.uid !== potion.uid);
        this.campaign.unbanked = this.campaign.unbanked.filter((i) => i !== potion.uid);
      }
      this.cooldowns.heal = this.settings.difficulty === 'story' ? 8 : 12;
      return;
    }
    const cls = CLASSES.find((c) => c.id === this.campaign.classId) ?? CLASSES[0];
    const ability =
      action === 'ultimate'
        ? cls.ultimate
        : cls.abilities.find((a) => a.id === this.campaign.skills[action === 'skill1' ? 0 : 1]);
    if (!ability) return;
    if (
      (this.cooldowns[ability.id] ?? 0) > 0 ||
      (action === 'ultimate' ? this.ultimate < 100 : this.resource < ability.cost)
    )
      return;
    if (action === 'ultimate') this.ultimate = 0;
    else this.resource -= ability.cost;
    this.cooldowns[ability.id] = ability.cooldown * (1 - this.stats.cooldown);
    this.cast(ability, input);
  }
  private cast(ability: AbilityDef, input: Input) {
    const p = this.world.player,
      angle = Math.atan2(input.aimY - p.y, input.aimX - p.x);
    const power = this.stats.damage * ability.power;
    this.world.attackAnim = 0.3;
    this.events.feedback('attack');
    const near = (x: number, y: number, range: number) =>
      this.world.enemies.filter((a) => !a.dead && Math.hypot(a.x - x, a.y - y) <= range);
    switch (ability.kind) {
      case 'projectile':
        for (let i = -1; i <= 1; i++)
          this.projectile(
            p.x,
            p.y,
            angle + i * 0.12,
            power / 1.7,
            ability.element,
            'player',
            400,
            ability.color,
          );
        break;
      case 'dash':
        moveActor(
          this.world,
          p,
          Math.cos(angle) * Math.min(ability.range, 170),
          Math.sin(angle) * Math.min(ability.range, 170),
        );
        this.invulnerable = 0.3;
        for (const a of near(p.x, p.y, 95)) this.hit(a, power, ability.element);
        this.effect(p.x, p.y, 'ring', 90, ability.color, 0.35);
        break;
      case 'shield':
        this.shield = Math.min(this.stats.maxHp * 0.65, this.shield + power * 1.2);
        this.effect(p.x, p.y, 'ring', 45, ability.color, 0.8);
        break;
      case 'heal':
        p.hp = Math.min(this.stats.maxHp, p.hp + power);
        this.resource = Math.min(this.stats.maxResource, this.resource + 10);
        this.effect(p.x, p.y, 'heal', 60, ability.color, 0.6);
        break;
      case 'trap':
        this.effect(
          p.x + Math.cos(angle) * 80,
          p.y + Math.sin(angle) * 80,
          'trap',
          70,
          ability.color,
          8,
          undefined,
          power,
        );
        break;
      case 'turret':
        this.world.effects = this.world.effects.filter((e) => e.type !== 'turret');
        this.effect(p.x - 30, p.y + 20, 'turret', 180, ability.color, 10, undefined, power * 0.3);
        break;
      case 'mark':
      case 'curse':
        for (const a of near(p.x, p.y, ability.range)) {
          this.addStatus(
            a,
            ability.element === 'physical' ? 'exposed' : ability.element,
            power * 0.1,
            'player',
            6,
          );
          this.hit(a, power * 0.65, ability.element);
        }
        this.effect(p.x, p.y, 'ring', Math.min(220, ability.range), ability.color, 0.5);
        break;
      case 'strike':
      case 'nova':
        for (const a of near(p.x, p.y, Math.min(240, ability.range)))
          this.hit(a, power, ability.element);
        this.effect(p.x, p.y, 'ring', Math.min(240, ability.range), ability.color, 0.4);
        break;
    }
  }
  private attackEnemy(a: Actor) {
    const p = this.world.player,
      def = bossMap.get(a.defId) ?? mobMap.get(a.defId),
      element = def?.element ?? 'physical',
      angle = Math.atan2(a.aimY - a.y, a.aimX - a.x),
      pattern = a.pattern;
    if (pattern === 'charge') {
      moveActor(this.world, a, Math.cos(angle) * 180, Math.sin(angle) * 180);
      if (Math.hypot(a.x - p.x, a.y - p.y) < 70) this.hit(p, a.damage, element, a.id);
      this.effect(a.x, a.y, 'ring', 50, '#f19663', 0.3);
    } else if (pattern === 'ring') {
      for (let i = 0; i < 10 + a.phase * 2; i++)
        this.projectile(
          a.x,
          a.y,
          (i * Math.PI * 2) / (10 + a.phase * 2),
          a.damage * 0.75,
          element,
          'enemy',
          150 + a.phase * 15,
          '#e88c70',
        );
    } else if (pattern === 'line') {
      for (let i = -1; i <= 1; i++)
        this.projectile(a.x, a.y, angle + i * 0.1, a.damage, element, 'enemy', 300, '#dc9a67');
    } else if (pattern === 'burst') {
      for (let i = -2; i <= 2; i++)
        this.projectile(
          a.x,
          a.y,
          angle + i * 0.22,
          a.damage * 0.85,
          element,
          'enemy',
          220,
          '#e7aa61',
        );
    } else if (pattern === 'pool') {
      this.effect(a.aimX, a.aimY, 'trap', 75, '#d76b58', 3, undefined, a.damage * 0.4).source =
        'enemy';
      if (Math.hypot(a.aimX - p.x, a.aimY - p.y) < 75) this.hit(p, a.damage, element, a.id);
    } else if (pattern === 'cross') {
      const rotation = a.phase === 2 ? Math.PI / 4 : 0;
      for (let arm = 0; arm < 4; arm++)
        for (let lane = -1; lane <= 1; lane++)
          this.projectile(
            a.x,
            a.y,
            rotation + (arm * Math.PI) / 2 + lane * 0.08,
            a.damage * 0.85,
            element,
            'enemy',
            245,
            '#e88c70',
          );
    } else if (pattern === 'sweep') {
      // Two fans leave a deliberate gap along the aimed centreline.
      for (let ray = -5; ray <= 5; ray++)
        if (Math.abs(ray) > 1)
          this.projectile(
            a.x,
            a.y,
            angle + ray * 0.19,
            a.damage * 0.8,
            element,
            'enemy',
            260,
            '#e7aa61',
          );
    } else if (pattern === 'orbit') {
      const rotation = this.world.elapsed * 0.4;
      for (let ray = 0; ray < 9; ray++)
        this.projectile(
          a.x,
          a.y,
          rotation + (ray * Math.PI * 2) / 9,
          a.damage * 0.72,
          element,
          'enemy',
          165 + a.phase * 18,
          '#dc9a67',
        );
    } else if (pattern === 'eruption') {
      for (const offset of [-100, 0, 100]) {
        const x = a.aimX + Math.cos(angle + Math.PI / 2) * offset;
        const y = a.aimY + Math.sin(angle + Math.PI / 2) * offset;
        if (walkable(this.world, x, y, 1))
          this.effect(x, y, 'trap', 42, '#d76b58', 2.5, undefined, a.damage * 0.3).source = 'enemy';
      }
    } else if (pattern === 'snare') {
      this.effect(a.aimX, a.aimY, 'trap', 60, '#d76b58', 3.5, undefined, a.damage * 0.25).source =
        'enemy';
      for (let ray = -1; ray <= 1; ray++)
        this.projectile(
          a.x,
          a.y,
          angle + ray * 0.28,
          a.damage * 0.7,
          'frost',
          'enemy',
          190,
          '#99c7d2',
        );
    } else if (pattern === 'summon') {
      const count = this.world.enemies.filter((e) => !e.dead && e.room === a.room).length;
      if (count < 8) {
        const m = FLOORS[this.world.floor - 1].mobs[(a.phase + count) % 8];
        for (let i = 0; i < 2; i++) {
          const e = actor(
            this.uid('summon'),
            m.id,
            'mob',
            a.x + Math.cos(i * Math.PI) * 60,
            a.y + 40,
            a.room,
          );
          e.hp = e.maxHp = m.hp * (this.settings.difficulty === 'story' ? 0.6 : 0.85);
          e.damage = m.damage;
          e.speed = m.speed;
          if (
            this.world.enemies.length + this.deferredSpawn.length < 180 &&
            walkable(this.world, e.x, e.y, e.radius)
          )
            this.deferredSpawn.push(e);
        }
      }
    } else if (Math.hypot(a.x - p.x, a.y - p.y) < 90) this.hit(p, a.damage, element, a.id);
    a.cooldown =
      (bossMap.has(a.defId) ? Math.max(0.85, 2.4 - a.phase * 0.35) : 1.3) *
      (this.world.modifiers?.includes('fury') ? 0.72 : 1) *
      (this.settings.difficulty === 'challenge'
        ? 0.8
        : this.settings.difficulty === 'story'
          ? 1.25
          : 1);
    a.tell = 0;
  }
  step(dt: number, input: Input) {
    const w = this.world,
      p = w.player;
    w.tick++;
    w.elapsed += dt;
    if (this.buffs.some((b) => b.until <= w.tick)) {
      this.buffs = this.buffs.filter((b) => b.until > w.tick);
      this.recalculate();
    }
    this.invulnerable = Math.max(0, this.invulnerable - dt);
    w.attackAnim = Math.max(0, w.attackAnim - dt);
    for (const k of Object.keys(this.cooldowns))
      this.cooldowns[k] = Math.max(0, this.cooldowns[k] - dt);
    this.resource = Math.min(this.stats.maxResource, this.resource + this.stats.regen * dt);
    this.shield = Math.max(0, this.shield - dt * 0.5);
    const terrain = tileAt(w, p.x, p.y);
    const slow =
      (terrain === 2 ? 0.72 : terrain === 4 ? 0.86 : 1) *
      (p.statuses.some((s) => s.element === 'frost') ? 0.6 : 1);
    const len = Math.hypot(input.moveX, input.moveY),
      scale = len > 1 ? 1 / len : 1;
    moveActor(
      w,
      p,
      input.moveX * scale * this.stats.speed * slow * dt,
      input.moveY * scale * this.stats.speed * slow * dt,
    );
    if (w.region) {
      const room = roomAt(w, p.x, p.y);
      if (room && room.id !== w.roomId) {
        w.roomId = p.room = room.id;
        if (!room.visited) {
          room.visited = true;
          this.events.room(room);
        }
      }
      const d = Math.hypot(w.nix.x - p.x, w.nix.y - p.y);
      if (d > 450) {
        w.nix.x = p.x - 30;
        w.nix.y = p.y;
      } else if (d > 50)
        moveActor(w, w.nix, ((p.x - w.nix.x) / d) * 160 * dt, ((p.y - w.nix.y) / d) * 160 * dt);
      const companion = w.objects.find((o) => o.type === 'npc' && o.data === 'nix');
      if (companion) {
        companion.x = w.nix.x;
        companion.y = w.nix.y;
      }
      return;
    }
    if (terrain === 5 && w.tick % 60 === 0)
      this.hit(p, 5 + this.world.floor, 'fire', 'environment');
    if (terrain === 6) {
      if (w.floor === 1) moveActor(w, p, 32 * dt, 0);
      else if (w.floor === 3) {
        const r = roomAt(w, p.x, p.y);
        if (r) {
          const dx = (r.x + r.w / 2) * TILE - p.x,
            dy = (r.y + r.h / 2) * TILE - p.y,
            d = Math.hypot(dx, dy) || 1;
          moveActor(w, p, (dx / d) * 35 * dt, (dy / d) * 35 * dt);
        }
      } else if (w.floor === 4 && w.tick % 60 === 0) this.hit(p, 9, 'corrosion', 'environment');
      else if (w.floor === 10 && w.tick % 60 === 0) {
        this.resource = Math.max(0, this.resource - 12);
        for (const e of w.enemies.filter((e) => !e.dead && Math.hypot(e.x - p.x, e.y - p.y) < 200))
          e.hp = Math.min(e.maxHp, e.hp + 8);
      } else if (
        (w.floor === 8 || w.floor === 11 || w.floor === 12) &&
        w.tick % 240 < 90 &&
        w.tick % 60 === 0
      )
        this.hit(p, 12, 'shock', 'environment');
    }
    const current = roomAt(w, p.x, p.y);
    if (current && w.roomId !== current.id) {
      w.roomId = current.id;
      p.room = current.id;
      if (!current.visited) {
        current.visited = true;
        this.events.room(current);
      }
      if (current.kind !== 'hunt' && (current.kind !== 'boss' || w.guardianKilled))
        this.spawnRoom(current);
    }
    if (
      current &&
      !current.spawned &&
      current.kind !== 'hunt' &&
      (current.kind !== 'boss' || w.guardianKilled)
    )
      this.spawnRoom(current);
    if (input.attacking || this.settings.autoAttack) {
      if (this.settings.autoAttack) {
        const target = w.enemies
          .filter((a) => !a.dead && Math.hypot(a.x - p.x, a.y - p.y) < 450)
          .sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0];
        if (target) {
          input.aimX = target.x;
          input.aimY = target.y;
          this.primary(input);
        }
      } else this.primary(input);
    }
    for (const a of [...w.enemies, p]) {
      a.statuses = a.statuses.filter((s) => s.until > w.tick);
      for (const status of a.statuses)
        if (status.next <= w.tick) {
          status.next = w.tick + 30;
          if (['fire', 'bleed', 'corrosion'].includes(status.element))
            this.hit(a, status.power, status.element, status.source, false);
        }
      if (a.dead || a.type === 'player') continue;
      const distance = Math.hypot(p.x - a.x, p.y - a.y);
      if (a.room !== w.roomId && distance > (w.modifiers?.includes('stalkers') ? 1350 : 950))
        continue;
      const m = mobMap.get(a.defId),
        boss = bossMap.get(a.defId);
      a.phase = boss ? (a.hp / a.maxHp < 0.33 ? 3 : a.hp / a.maxHp < 0.66 ? 2 : 1) : 1;
      a.cooldown = Math.max(0, a.cooldown - dt);
      if (a.statuses.some((s) => s.element === 'stagger')) continue;
      if (a.tell > 0) {
        a.tell -= dt;
        if (a.tell <= 0) this.attackEnemy(a);
        continue;
      }
      const angle = Math.atan2(p.y - a.y, p.x - a.x),
        speed = a.speed * (a.statuses.some((s) => s.element === 'frost') ? 0.45 : 1);
      const role = m?.role ?? 'chaser';
      const preferred =
        role === 'shooter' || role === 'controller'
          ? 220
          : role === 'support'
            ? 260
            : role === 'summoner'
              ? 230
              : 58;
      if (distance > preferred) {
        const path = this.navigation(a);
        if (role === 'flanker' && distance < 150) {
          const flank = angle + 0.65;
          if (walkable(w, a.x + Math.cos(flank) * 20, a.y + Math.sin(flank) * 20, a.radius)) {
            path.x = Math.cos(flank);
            path.y = Math.sin(flank);
          }
        }
        moveActor(w, a, path.x * speed * dt, path.y * speed * dt);
      } else if (role === 'shooter' && distance < 130)
        moveActor(w, a, -Math.cos(angle) * speed * dt, -Math.sin(angle) * speed * dt);
      if (
        a.cooldown <= 0 &&
        distance <
          (boss
            ? 420
            : role === 'shooter' ||
                role === 'controller' ||
                role === 'summoner' ||
                role === 'support'
              ? 340
              : 110)
      ) {
        const patterns =
          boss?.patterns ??
          (role === 'shooter'
            ? ['line']
            : role === 'controller'
              ? ['pool']
              : role === 'summoner'
                ? ['summon']
                : role === 'flanker'
                  ? ['charge']
                  : role === 'tank'
                    ? ['cleave']
                    : ['cleave']);
        a.pattern = patterns[(Math.floor(w.elapsed / 3) + a.phase) % patterns.length] ?? 'cleave';
        a.aimX = p.x;
        a.aimY = p.y;
        a.tell =
          (boss ? 0.9 : role === 'ambusher' ? 0.7 : 0.55) *
          (this.settings.difficulty === 'story' ? 1.2 : 1);
        if (a.pattern === 'eruption')
          for (const offset of [-100, 0, 100])
            this.effect(
              p.x + Math.cos(angle + Math.PI / 2) * offset,
              p.y + Math.sin(angle + Math.PI / 2) * offset,
              'telegraph',
              42,
              '#db7c61',
              a.tell,
            );
        this.effect(
          ['pool', 'snare'].includes(a.pattern) ? p.x : a.x,
          ['pool', 'snare'].includes(a.pattern) ? p.y : a.y,
          'telegraph',
          a.pattern === 'pool' ? 75 : a.pattern === 'snare' ? 60 : a.pattern === 'cleave' ? 85 : 45,
          '#db7c61',
          a.tell,
        );
      }
      if (role === 'support' && w.tick % 180 === 0)
        for (const ally of w.enemies.filter((t) => !t.dead && t.room === a.room && t.id !== a.id))
          ally.hp = Math.min(ally.maxHp, ally.hp + ally.maxHp * 0.05);
    }
    if (this.deferredSpawn.length) {
      w.enemies.push(...this.deferredSpawn);
      this.deferredSpawn = [];
    }
    for (const projectile of w.projectiles) {
      projectile.ttl -= dt;
      projectile.x += projectile.vx * dt;
      projectile.y += projectile.vy * dt;
      if (
        w.floor === 9 &&
        projectile.owner === 'enemy' &&
        tileAt(w, projectile.x, projectile.y) === 6
      ) {
        projectile.owner = 'player';
        projectile.vx *= -1;
        projectile.vy *= -1;
        projectile.color = '#bf8ba9';
      }
      if (tileAt(w, projectile.x, projectile.y) === 0) projectile.ttl = 0;
      const targets = projectile.owner === 'player' ? w.enemies : [p];
      for (const a of targets)
        if (
          !a.dead &&
          !projectile.hits.includes(a.id) &&
          Math.hypot(a.x - projectile.x, a.y - projectile.y) < a.radius + projectile.radius
        ) {
          projectile.hits.push(a.id);
          this.hit(
            a,
            projectile.power,
            projectile.element,
            projectile.owner === 'player' ? 'player' : 'projectile',
          );
          projectile.ttl = 0;
          break;
        }
    }
    w.projectiles = w.projectiles.filter((q) => q.ttl > 0).slice(-160);
    for (const e of w.effects) {
      e.ttl -= dt;
      if (e.type === 'trap') {
        if (e.source === 'enemy') {
          if (w.tick % 45 === 0 && Math.hypot(p.x - e.x, p.y - e.y) < e.radius)
            this.hit(p, e.power ?? 10, 'corrosion', 'pool');
        } else {
          const target = w.enemies.find(
            (a) => !a.dead && Math.hypot(a.x - e.x, a.y - e.y) < e.radius,
          );
          if (target) {
            this.hit(target, e.power ?? 20, 'stagger');
            e.ttl = 0;
            this.effect(e.x, e.y, 'ring', e.radius, e.color, 0.35);
          }
        }
      }
      if (e.type === 'turret' && w.tick % 45 === 0) {
        const target = w.enemies.find(
          (a) => !a.dead && Math.hypot(a.x - e.x, a.y - e.y) < e.radius,
        );
        if (target)
          this.projectile(
            e.x,
            e.y,
            Math.atan2(target.y - e.y, target.x - e.x),
            e.power ?? 10,
            'shock',
            'player',
            350,
            e.color,
          );
      }
    }
    w.effects = w.effects.filter((e) => e.ttl > 0);
    const nixDistance = Math.hypot(w.nix.x - p.x, w.nix.y - p.y);
    if (nixDistance > 600) {
      w.nix.x = p.x - 30;
      w.nix.y = p.y;
    } else if (nixDistance > 55)
      moveActor(
        w,
        w.nix,
        ((p.x - w.nix.x) / nixDistance) * 155 * dt,
        ((p.y - w.nix.y) / nixDistance) * 155 * dt,
      );
    if (w.tick % 120 === 0) {
      const enemy = w.enemies.find(
        (a) => !a.dead && Math.hypot(a.x - w.nix.x, a.y - w.nix.y) < 210,
      );
      if (enemy)
        this.projectile(
          w.nix.x,
          w.nix.y,
          Math.atan2(enemy.y - w.nix.y, enemy.x - w.nix.x),
          this.stats.damage * 0.4 * (1 + this.stats.nix),
          'shock',
          'player',
          340,
          '#a7d6ba',
        );
    }
    for (const room of w.rooms)
      if (room.spawned && !room.cleared && !w.enemies.some((e) => !e.dead && e.room === room.id))
        room.cleared = true;
    w.enemies = w.enemies.filter((e) => !e.dead);
  }
}
