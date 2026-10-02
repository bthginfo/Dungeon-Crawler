import Phaser from 'phaser';
import { CLASSES, FLOORS } from '../content';
import { game } from './controller';
import type { Actor, GameView, WorldData, WorldObject } from './types';
import assetData from './assets-manifest.json';

type SpriteSheet = { path: string; width: number; height: number; frames: number };
type SpriteFamily = Record<string, SpriteSheet>;
const ASSETS = assetData as unknown as { sprites: Record<string, SpriteFamily> };
const TILE = 32;
const DIRECTIONS = ['down', 'left', 'right', 'up'];
const DEFAULT_BINDINGS: Record<string, string> = {
  moveUp: 'KeyW',
  moveDown: 'KeyS',
  moveLeft: 'KeyA',
  moveRight: 'KeyD',
  attack: 'Enter',
  dodge: 'Space',
  skill1: 'KeyQ',
  skill2: 'KeyR',
  ultimate: 'KeyF',
  heal: 'KeyC',
  interact: 'KeyE',
};
const COLOR = {
  ink: 0x131c1a,
  jade: 0x8ce2b7,
  amber: 0xe5b16b,
  danger: 0xd66b58,
  parchment: 0xeee1c8,
};
const hex = (value: string) => Number.parseInt(value.replace('#', ''), 16);
const mix = (a: number, b: number, amount: number) => {
  const c = (shift: number) =>
    Math.round(((a >> shift) & 255) * (1 - amount) + ((b >> shift) & 255) * amount);
  return (c(16) << 16) | (c(8) << 8) | c(0);
};
const hash = (x: number, y: number, seed: number) => {
  let value = Math.imul(x + 13, 374761393) ^ Math.imul(y + 11, 668265263) ^ seed;
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return (value ^ (value >>> 16)) >>> 0;
};
const editable = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || !!target.closest('input, textarea, select, [role="textbox"]'));

interface ActorView {
  sprite: Phaser.GameObjects.Sprite;
  shadow: Phaser.GameObjects.Image;
  lastX: number;
  lastY: number;
  family: string;
  lastHp: number;
  hurtUntil: number;
  attackUntil: number;
}
interface ObjectView {
  image: Phaser.GameObjects.Image;
  glow: Phaser.GameObjects.Image;
  label: Phaser.GameObjects.Text;
}

/** The renderer observes the domain. Movement, damage, random loot and saves stay in the simulation. */
class BroadcastScene extends Phaser.Scene {
  private worldId = '';
  private layer: Phaser.Tilemaps.TilemapLayer | Phaser.Tilemaps.TilemapGPULayer | null = null;
  private wallLayer: Phaser.Tilemaps.TilemapLayer | Phaser.Tilemaps.TilemapGPULayer | null = null;
  private maps: Phaser.Tilemaps.Tilemap[] = [];
  private decorations: Phaser.GameObjects.GameObject[] = [];
  private animatedDecorations: Phaser.GameObjects.Sprite[] = [];
  private actorViews = new Map<string, ActorView>();
  private objectViews = new Map<string, ObjectView>();
  private effectViews = new Map<string, Phaser.GameObjects.Sprite>();
  private textViews = new Map<string, Phaser.GameObjects.Text>();
  private particleViews = new Map<string, Phaser.GameObjects.Image>();
  private effects!: Phaser.GameObjects.Graphics;
  private bars!: Phaser.GameObjects.Graphics;
  private fog!: Phaser.GameObjects.Graphics;
  private vignette!: Phaser.GameObjects.Image;
  private keys = new Set<string>();
  private pointerHeld = false;
  private keyboardUsed = false;
  private pointerAim = false;
  private padButtons = new Set<number>();
  private padMoving = false;
  private padAttacking = false;
  private definitions = new Map<string, { sprite: string; color: string }>();
  private disposeListeners: (() => void)[] = [];
  private lastPhase = '';
  private lastHealth = -1;
  private lastTime = 0;
  private assetsFailed = false;

  constructor() {
    super('broadcast-world');
  }

  preload() {
    game.reportRenderer('loading', 0);
    this.load.on('progress', (progress: number) => {
      game.reportRenderer(this.assetsFailed ? 'error' : 'loading', progress);
    });
    this.load.on('loaderror', () => {
      this.assetsFailed = true;
      game.reportRenderer('error');
    });
    this.load.spritesheet('tiles', '/assets/world/tiles.png', { frameWidth: 32, frameHeight: 32 });
    this.load.atlas('actors', '/assets/sprites/actors.png', '/assets/sprites/actors.json');
    for (const key of [
      'banner',
      'statue',
      'statue-shield',
      'pillar',
      'door',
      'large-door',
      'rug',
      'grate',
      'ground-bones',
      'terminal',
      'camera',
      'crate',
      'chest',
      'fountain',
      'exit',
      'antenna',
      'pipe',
      'mushroom',
      'furnace',
      'bookshelf',
      'clock',
      'mirror',
      'bones',
      'reactor',
      'shrine',
      'glow',
      'shadow',
      'vignette',
    ]) {
      this.load.image(key, `/assets/world/${key}.png`);
    }
    this.load.spritesheet('flame', '/assets/world/torch-animated.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('campfire', '/assets/world/campfire.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet('impact', '/assets/sprites/impact.png', {
      frameWidth: 48,
      frameHeight: 48,
    });
  }

  create() {
    if (this.assetsFailed) return;
    this.cameras.main.setBackgroundColor(COLOR.ink).setRoundPixels(true);
    this.effects = this.add.graphics().setDepth(9000);
    this.bars = this.add.graphics().setDepth(9010);
    this.fog = this.add.graphics().setDepth(8500);
    this.vignette = this.add
      .image(0, 0, 'vignette')
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(10000)
      .setAlpha(0.34);
    this.anims.create({
      key: 'torch-loop',
      frames: this.anims.generateFrameNumbers('flame', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: 'campfire-loop',
      frames: this.anims.generateFrameNumbers('campfire', { start: 0, end: 3 }),
      frameRate: 7,
      repeat: -1,
    });
    const projectile = this.make.graphics({ x: 0, y: 0 });
    projectile.fillStyle(0xffffff).fillTriangle(2, 8, 9, 2, 15, 8).fillTriangle(2, 8, 9, 14, 15, 8);
    projectile.fillStyle(0xa7bdae).fillRect(6, 6, 5, 5);
    projectile.generateTexture('projectile', 16, 16);
    projectile.destroy();

    const keydown = (event: KeyboardEvent) => {
      if (
        editable(event.target) ||
        event.defaultPrevented ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey
      )
        return;
      const view = game.getSnapshot();
      if (event.code === (view.settings.bindings.pause ?? 'Escape')) {
        event.preventDefault();
        if (view.panel !== 'none') game.closePanel();
        else if (view.phase === 'playing') game.pause(!view.paused);
        return;
      }
      if (view.phase !== 'playing' || view.panel !== 'none' || view.paused) return;
      const panelActions = ['inventory', 'journal', 'map', 'character'] as const;
      const panelAction = panelActions.find(
        (action) =>
          event.code ===
          (view.settings.bindings[action] ??
            { inventory: 'KeyI', journal: 'KeyJ', map: 'KeyM', character: 'KeyK' }[action]),
      );
      if (panelAction) {
        if (!event.repeat) game.openPanel(panelAction);
        event.preventDefault();
        return;
      }
      this.keyboardUsed = true;
      this.keys.add(event.code);
      const action = this.actionForKey(event, view);
      if (
        action ||
        [
          'ArrowUp',
          'ArrowDown',
          'ArrowLeft',
          'ArrowRight',
          'KeyW',
          'KeyA',
          'KeyS',
          'KeyD',
        ].includes(event.code)
      )
        event.preventDefault();
      if (action && !event.repeat) {
        if (action === 'attack') game.input.attacking = true;
        game.requestAction(action);
      }
    };
    const keyup = (event: KeyboardEvent) => {
      this.keys.delete(event.code);
      if (this.actionForKey(event, game.getSnapshot()) === 'attack') game.input.attacking = false;
      if (this.keys.size === 0 && this.keyboardUsed) {
        game.input.moveX = game.input.moveY = 0;
        this.keyboardUsed = false;
      }
    };
    const reset = () => {
      this.keys.clear();
      this.pointerHeld = false;
      this.keyboardUsed = false;
      game.input.moveX = game.input.moveY = 0;
      game.input.attacking = false;
      if (game.getSnapshot().phase === 'playing') game.pause(true);
    };
    const visibility = () => {
      if (document.hidden) reset();
    };
    const canvas = this.game.canvas;
    const pointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || event.button !== 0) return;
      const view = game.getSnapshot();
      if (view.phase !== 'playing' || view.panel !== 'none' || view.paused) return;
      this.pointerHeld = true;
      this.pointerAim = true;
      this.updatePointer(event);
      game.requestAction('attack');
    };
    const pointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') {
        this.pointerAim = true;
        this.updatePointer(event);
      }
    };
    const pointerUp = () => {
      this.pointerHeld = false;
      game.input.attacking = false;
    };
    const contextLost = (event: Event) => {
      event.preventDefault();
      reset();
    };
    const contextRestored = () => {
      this.worldId = '';
    };
    window.addEventListener('keydown', keydown);
    window.addEventListener('keyup', keyup);
    window.addEventListener('blur', reset);
    document.addEventListener('visibilitychange', visibility);
    canvas.addEventListener('pointerdown', pointerDown);
    canvas.addEventListener('pointermove', pointerMove);
    window.addEventListener('pointerup', pointerUp);
    canvas.addEventListener('webglcontextlost', contextLost);
    canvas.addEventListener('webglcontextrestored', contextRestored);
    this.disposeListeners.push(() => {
      window.removeEventListener('keydown', keydown);
      window.removeEventListener('keyup', keyup);
      window.removeEventListener('blur', reset);
      document.removeEventListener('visibilitychange', visibility);
      canvas.removeEventListener('pointerdown', pointerDown);
      canvas.removeEventListener('pointermove', pointerMove);
      window.removeEventListener('pointerup', pointerUp);
      canvas.removeEventListener('webglcontextlost', contextLost);
      canvas.removeEventListener('webglcontextrestored', contextRestored);
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.dispose());
    this.events.once(Phaser.Scenes.Events.DESTROY, () => this.dispose());
    this.scale.on(Phaser.Scale.Events.RESIZE, () => this.resizeCamera());
    this.resizeCamera();
    game.reportRenderer('ready', 1);
  }

  private actionForKey(
    event: KeyboardEvent,
    view: GameView,
  ): 'attack' | 'dodge' | 'skill1' | 'skill2' | 'ultimate' | 'heal' | 'interact' | null {
    for (const action of [
      'attack',
      'dodge',
      'skill1',
      'skill2',
      'ultimate',
      'heal',
      'interact',
    ] as const) {
      const binding = view.settings.bindings[action] ?? DEFAULT_BINDINGS[action];
      if (
        binding === event.code ||
        binding.toLowerCase() === event.key.toLowerCase() ||
        (binding === 'Space' && event.key === ' ')
      )
        return action;
    }
    return null;
  }

  private updatePointer(event: PointerEvent) {
    const bounds = this.game.canvas.getBoundingClientRect();
    const point = this.cameras.main.getWorldPoint(
      ((event.clientX - bounds.left) * this.scale.width) / bounds.width,
      ((event.clientY - bounds.top) * this.scale.height) / bounds.height,
    );
    if (game.world) {
      game.input.aimX = point.x;
      game.input.aimY = point.y;
    }
  }

  private resizeCamera() {
    if (!this.cameras?.main) return;
    const { width, height } = this.scale;
    const zoom = Math.max(0.85, Math.min(2.5, width / 410, height / 450));
    this.cameras.main.setZoom(zoom);
    this.vignette
      ?.setPosition(width / 2, height / 2)
      .setOrigin(0.5)
      .setDisplaySize(width / zoom, height / zoom);
  }

  private rebuild(world: WorldData) {
    this.worldId = world.id;
    this.maps.forEach((map) => map.destroy());
    this.maps = [];
    this.layer = null;
    this.wallLayer = null;
    this.decorations.forEach((object) => object.destroy());
    this.decorations = [];
    this.animatedDecorations = [];
    for (const view of this.actorViews.values()) {
      view.sprite.destroy();
      view.shadow.destroy();
    }
    this.actorViews.clear();
    for (const view of this.objectViews.values()) {
      view.image.destroy();
      view.glow.destroy();
      view.label.destroy();
    }
    this.objectViews.clear();
    for (const view of this.effectViews.values()) view.destroy();
    this.effectViews.clear();
    for (const view of this.textViews.values()) view.destroy();
    this.textViews.clear();
    for (const view of this.particleViews.values()) view.destroy();
    this.particleViews.clear();
    const floor = FLOORS[world.floor - 1] ?? FLOORS[0];
    this.definitions = new Map(
      [...floor.mobs, ...floor.elites, ...floor.minibosses, floor.boss].map((def) => [def.id, def]),
    );
    const ground = world.tiles.map((row, y) =>
      row.map((tile, x) => {
        if (!tile) return -1;
        if (tile > 1)
          return ({ 2: 21, 3: 22, 4: 23, 5: 24, 6: 25 } as Record<number, number>)[tile] ?? 0;
        const n = hash(x, y, world.seed);
        if (world.floor === 4) return n % 7 === 0 ? 28 : 27;
        if (world.floor === 5) return n % 9 === 0 ? 17 : 29;
        if (world.floor === 6 || world.floor === 8)
          return n % 13 === 0 ? (world.floor === 6 ? 18 : 17) : 28;
        if (world.floor === 7) return n % 11 === 0 ? 19 : 23;
        if (world.floor === 1) {
          const room = world.rooms.find(
            (r) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h,
          );
          // Service gutters are authored as strips rather than isolated floor noise.
          if (
            room &&
            (x === room.x + 1 || x === room.x + room.w - 2) &&
            y > room.y + 1 &&
            y < room.y + room.h - 2
          )
            return 17;
          if (
            room?.kind === 'rest' &&
            y === room.y + room.h - 3 &&
            x > room.x + 3 &&
            x < room.x + room.w - 4
          )
            return 19;
          return n % 8 === 0 ? 1 + (n % 2) : 0;
        }
        if ([5, 8, 11, 12].includes(world.floor) && n % 9 === 0)
          return world.floor === 12 ? 20 : 17;
        if (world.floor === 9) return n % 11 === 0 ? 18 : 3 + (n % 3);
        if ([7, 11].includes(world.floor)) return 19;
        return n % 13 === 0 ? 1 + (n % 2) : world.floor === 3 ? 6 : 3;
      }),
    );
    const walls = world.tiles.map((row, y) =>
      row.map((tile, x) => {
        if (tile) return -1;
        const next = (dx: number, dy: number) => world.tiles[y + dy]?.[x + dx] ?? 0;
        if (
          world.floor === 4 &&
          (next(0, 1) || next(0, 2) || next(1, 0) || next(-1, 0) || next(0, -1))
        )
          return 30;
        if (world.floor === 5 && (next(0, 1) || next(0, 2))) return 31;
        if (next(0, 1)) return 8 + (hash(x, y, world.seed) % 3);
        if (next(0, 2)) return 11 + (hash(x, y, world.seed) % 3);
        if (next(1, 0) || next(-1, 0) || next(0, -1)) return 14;
        return -1;
      }),
    );
    const map = this.make.tilemap({ data: ground, tileWidth: TILE, tileHeight: TILE });
    this.maps.push(map);
    const tileset = map.addTilesetImage('tiles', 'tiles', 32, 32, 0, 0);
    if (tileset) {
      this.layer = map.createLayer(0, tileset, 0, 0);
      this.layer?.setDepth(-20);
      map.forEachTile((tile) => {
        tile.tint = mix(0xcbd1c1, hex(floor.colors.floor), 0.2);
      });
      const wallMap = this.make.tilemap({ data: walls, tileWidth: TILE, tileHeight: TILE });
      this.maps.push(wallMap);
      const wallTiles = wallMap.addTilesetImage('tiles', 'tiles', 32, 32, 0, 0);
      if (wallTiles) this.wallLayer = wallMap.createLayer(0, wallTiles, 0, 0);
      this.wallLayer?.setDepth(-10);
      wallMap.forEachTile((tile) => {
        tile.tint = mix(0xede1c6, hex(floor.colors.wall), 0.13);
      });
    }
    // Padding gives the title composition room and avoids clipping at the outer walls.
    this.cameras.main.setBounds(-400, -350, world.width * TILE + 800, world.height * TILE + 700);
    this.cameras.main.setZoom(
      Math.max(0.85, Math.min(2.5, this.scale.width / 410, this.scale.height / 450)),
    );
    for (const room of world.rooms) this.dressRoom(world, room, hex(floor.colors.accent));
    this.lastHealth = world.player.hp;
  }

  private decoration(key: string, x: number, y: number, depth = y, scale = 1, tint?: number) {
    const image = this.add.image(x, y, key).setOrigin(0.5, 0.75).setDepth(depth).setScale(scale);
    if (tint) image.setTint(tint);
    this.decorations.push(image);
    return image;
  }

  private dressRoom(world: WorldData, room: WorldData['rooms'][number], accent: number) {
    const x = room.x * TILE,
      y = room.y * TILE,
      w = room.w * TILE,
      h = room.h * TILE;
    const n = hash(room.x, room.y, world.seed);
    const biomeProp =
      [
        'camera',
        'pipe',
        'statue',
        'mushroom',
        'furnace',
        'banner',
        'bookshelf',
        'clock',
        'mirror',
        'bones',
        'antenna',
        'reactor',
      ][world.floor - 1] ?? 'camera';
    const propScale = biomeProp === 'banner' ? 0.7 : 1;
    const shadow = this.add.graphics().setDepth(-5);
    shadow.fillStyle(0x07110f, 0.28).fillRect(x, y, w, 14).fillRect(x, y, 9, h);
    shadow.lineStyle(1, 0xd4c79b, 0.14).strokeRect(x + 13, y + 13, w - 26, h - 26);
    this.decorations.push(shadow);
    // Place set dressing against walls, leaving the readable combat centre clear.
    for (const [dx, dy] of [
      [48, 45],
      [w - 49, 45],
      [49, h - 35],
      [w - 49, h - 35],
    ]) {
      this.decoration('shadow', x + dx, y + dy + 9, -4, 0.3).setAlpha(0.7);
      this.decoration(biomeProp, x + dx, y + dy, y + dy, propScale, mix(0xffffff, accent, 0.18));
    }
    if (room.kind === 'boss' || room.kind === 'guardian' || room.kind === 'hunt') {
      this.decoration(
        'rug',
        x + w / 2,
        y + h / 2 + 35,
        -3,
        room.kind === 'boss' ? 2.3 : 1.5,
      ).setAlpha(0.72);
      for (const dx of [w * 0.25, w * 0.75])
        this.decoration('statue-shield', x + dx, y + 41, y + 41, 1.25);
      const insignia = this.add.graphics().setDepth(-2);
      insignia
        .lineStyle(2, accent, 0.42)
        .strokeCircle(x + w / 2, y + h / 2, room.kind === 'boss' ? 90 : 60);
      insignia
        .lineStyle(1, accent, 0.24)
        .strokeCircle(x + w / 2, y + h / 2, room.kind === 'boss' ? 105 : 72);
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4,
          r = room.kind === 'boss' ? 98 : 66;
        insignia
          .lineStyle(2, accent, 0.5)
          .lineBetween(
            x + w / 2 + Math.cos(angle) * (r - 4),
            y + h / 2 + Math.sin(angle) * (r - 4),
            x + w / 2 + Math.cos(angle) * (r + 4),
            y + h / 2 + Math.sin(angle) * (r + 4),
          );
      }
      this.decorations.push(insignia);
    }
    if (room.kind === 'rest') {
      this.decoration('rug', x + w / 2, y + h / 2 + 45, -4, 1.45).setTint(0x788f78);
      this.decoration('crate', x + 95, y + h - 35);
      this.decoration('bookshelf', x + w - 98, y + 45);
      for (const dx of [w * 0.27, w * 0.73]) {
        this.decoration('bookshelf', x + dx, y + 55, y + 55, 0.95);
        this.decoration('banner', x + dx + 47, y + 47, y + 48, 0.65, 0xaeb6a1);
        this.decoration('camera', x + dx, y + h - 63, y + h - 63, 0.95);
        this.decoration('crate', x + dx + 36, y + h - 48, y + h - 48, 0.8);
      }
      this.decoration('terminal', x + 120, y + 118, y + 118, 1.05);
      this.decoration('antenna', x + w - 113, y + 115, y + 115, 1.05);
      this.decoration('pipe', x + 74, y + h - 122, y + h - 122, 1.1);
      this.decoration('pipe', x + w - 74, y + h - 122, y + h - 122, 1.1);
      const circuit = this.add.graphics().setDepth(-3);
      circuit
        .lineStyle(2, 0x8eaf9b, 0.18)
        .lineBetween(x + 120, y + 123, x + 120, y + h - 77)
        .lineBetween(x + 120, y + h - 77, x + w - 113, y + h - 77)
        .lineBetween(x + w - 113, y + h - 77, x + w - 113, y + 122);
      this.decorations.push(circuit);
      const fire = this.add
        .sprite(x + 85, y + h / 2 + 36, 'campfire')
        .setDepth(y + h / 2 + 36)
        .play('campfire-loop');
      this.decorations.push(fire);
      this.animatedDecorations.push(fire);
      const light = this.add
        .image(fire.x, fire.y - 10, 'glow')
        .setDisplaySize(165, 140)
        .setTint(COLOR.amber)
        .setAlpha(0.44)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(7000);
      this.decorations.push(light);
    }
    if (room.kind === 'puzzle') {
      const lines = this.add.graphics().setDepth(-1).lineStyle(2, accent, 0.32);
      lines.lineBetween(x + w * 0.25, y + h / 2 + 35, x + w * 0.75, y + h / 2 + 35);
      lines.lineBetween(x + w / 2, y + 55, x + w / 2, y + h / 2 + 35);
      this.decorations.push(lines);
    }
    // Torches anchor the wall silhouettes and cast warm light without hiding hazards.
    for (const dx of [96, w - 96]) {
      const torch = this.add
        .sprite(x + dx, y - 2, 'flame')
        .setDepth(y + 2)
        .setScale(0.9)
        .play('torch-loop');
      const glow = this.add
        .image(x + dx, y + 19, 'glow')
        .setDisplaySize(150, 140)
        .setTint(world.floor === 7 ? 0xb1d1d0 : world.floor === 11 ? COLOR.jade : COLOR.amber)
        .setAlpha(0.52)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(7100);
      this.decorations.push(torch, glow);
      this.animatedDecorations.push(torch);
    }
    if (n % 3 !== 0 && room.kind !== 'rest')
      this.decoration(
        n % 2 ? 'crate' : 'bones',
        x + 45,
        y + h / 2 + 40,
        y + h / 2 + 40,
        0.85,
      ).setAlpha(0.88);
    // An in-world broadcast notice, no implementation labels on the player's map.
    if (room.kind === 'event')
      this.decoration('camera', x + w / 2 + 76, y + h / 2 - 45, y + h / 2 - 45);
    // Rich silhouettes at each room boundary give the entire 12-floor route a
    // coherent place, while the simulation's open combat centre remains readable.
    if (room.kind !== 'rest') {
      for (const dx of [w * 0.3, w * 0.7]) {
        const prop =
          world.floor === 4
            ? 'mushroom'
            : world.floor === 5
              ? 'furnace'
              : world.floor === 10
                ? 'bones'
                : 'statue';
        this.decoration(prop, x + dx, y + 48, y + 49, 0.9, mix(0xffffff, accent, 0.08));
      }
      const wallProp = world.floor >= 11 ? 'terminal' : world.floor === 6 ? 'mirror' : 'banner';
      this.decoration(wallProp, x + w / 2, y + 39, y + 39, wallProp === 'banner' ? 0.7 : 1);
    }
  }

  private familyFor(actor: Actor): string {
    if (actor.type === 'nix') return 'nix';
    if (actor.type === 'player')
      return CLASSES.find((c) => c.id === actor.defId)?.sprite ?? 'warrior';
    if (ASSETS.sprites[actor.defId]) return actor.defId;
    const def = this.definitions.get(actor.defId);
    return def?.sprite && ASSETS.sprites[def.sprite]
      ? def.sprite
      : actor.type === 'boss'
        ? 'skeleton-king'
        : 'construct';
  }

  private actorTint(actor: Actor): number {
    if (actor.type === 'player' || actor.type === 'nix') return 0xffffff;
    const def = this.definitions.get(actor.defId);
    return mix(0xffffff, def ? hex(def.color) : COLOR.parchment, actor.type === 'mob' ? 0.2 : 0.14);
  }

  private renderActor(actor: Actor, time: number, world: WorldData, view: GameView) {
    if (actor.dead) return;
    let display = this.actorViews.get(actor.id);
    const family = this.familyFor(actor);
    if (!display || display.family !== family) {
      display?.sprite.destroy();
      display?.shadow.destroy();
      const sprite = this.add
        .sprite(actor.x, actor.y, 'actors', `${family}:down-idle:0`)
        .setOrigin(0.5, 0.68);
      const shadow = this.add
        .image(actor.x, actor.y + 4, 'shadow')
        .setDisplaySize(35, 15)
        .setAlpha(0.6);
      display = {
        sprite,
        shadow,
        family,
        lastX: actor.x,
        lastY: actor.y,
        lastHp: actor.hp,
        hurtUntil: 0,
        attackUntil: 0,
      };
      this.actorViews.set(actor.id, display);
    }
    const moved = Math.hypot(actor.x - display.lastX, actor.y - display.lastY) > 0.05;
    if (actor.hp < display.lastHp) display.hurtUntil = time + 105;
    if (actor.type === 'player' && world.attackAnim > 0) display.attackUntil = time + 90;
    if (actor.tell > 0) display.attackUntil = time + 80;
    const action =
      display.hurtUntil > time
        ? 'hurt'
        : display.attackUntil > time
          ? 'attack'
          : moved
            ? 'walk'
            : 'idle';
    let facing = actor.direction;
    if ((actor.type === 'player' && world.attackAnim > 0) || actor.tell > 0) {
      const ax = actor.type === 'player' ? game.input.aimX : actor.aimX;
      const ay = actor.type === 'player' ? game.input.aimY : actor.aimY;
      const dx = ax - actor.x,
        dy = ay - actor.y;
      facing = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 1 : 2) : dy < 0 ? 3 : 0;
    }
    const direction = DIRECTIONS[facing] ?? 'down';
    const descriptor =
      ASSETS.sprites[family]?.[`${direction}-${action}`] ?? ASSETS.sprites[family]?.['down-idle'];
    const key = `${family}:${direction}-${action}`;
    const frame =
      Math.floor(time / (action === 'walk' ? 92 : action === 'attack' ? 76 : 150)) %
      (descriptor?.frames ?? 1);
    display.sprite.setTexture(
      'actors',
      this.textures.get('actors').has(`${key}:${frame}`)
        ? `${key}:${frame}`
        : `${family}:down-idle:0`,
    );
    const scale =
      actor.type === 'boss'
        ? 2.4
        : actor.type === 'guardian' || actor.type === 'hunt'
          ? 1.9
          : actor.type === 'elite'
            ? 1.45
            : actor.type === 'nix'
              ? 0.9
              : actor.type === 'player'
                ? 1.35
                : 1.2;
    display.sprite
      .setPosition(Math.round(actor.x), Math.round(actor.y))
      .setScale(scale)
      .setDepth(actor.y + 30);
    display.sprite.setTint(display.hurtUntil > time ? 0xffc5a5 : this.actorTint(actor));
    if (family.startsWith('f') || ['rat', 'slime', 'bat', 'construct', 'nix'].includes(family))
      display.sprite.setFlipX(facing === 1);
    else display.sprite.setFlipX(false);
    if (family === 'bat') display.sprite.y -= 5 + Math.sin(time / 150 + actor.x) * 2;
    display.shadow
      .setPosition(actor.x, actor.y + 6)
      .setDisplaySize(25 * scale, 10 * scale)
      .setDepth(actor.y - 1);
    display.lastX = actor.x;
    display.lastY = actor.y;
    display.lastHp = actor.hp;
    const strong = ['boss', 'guardian', 'hunt', 'elite'].includes(actor.type);
    if ((actor.hp < actor.maxHp || strong) && actor.type !== 'player' && actor.type !== 'nix') {
      const width = strong ? 43 : 25,
        y = actor.y - 30 * scale;
      this.bars.fillStyle(COLOR.ink, 0.9).fillRect(actor.x - width / 2 - 1, y - 1, width + 2, 4);
      this.bars
        .fillStyle(strong ? COLOR.amber : COLOR.danger)
        .fillRect(actor.x - width / 2, y, width * Math.max(0, actor.hp / actor.maxHp), 2);
    }
    if (actor.type === 'player' && !view.settings.reducedMotion) {
      this.bars.lineStyle(1, COLOR.jade, 0.34).strokeEllipse(actor.x, actor.y + 5, 30, 12);
    }
    if (actor.tell > 0 && actor.type !== 'player' && actor.type !== 'nix')
      this.renderTell(actor, world, view);
    for (const status of actor.statuses.slice(0, 3)) {
      const colors: Record<string, number> = {
        fire: 0xe8a269,
        frost: 0xafd7d8,
        shock: 0xcbe9a5,
        corrosion: 0xa8c97b,
        shield: 0x8ce2b7,
        bleed: 0xd66b58,
        exposed: 0xe5b16b,
        stagger: 0xc6c4b0,
      };
      this.bars
        .lineStyle(1, colors[status.element] ?? COLOR.jade, 0.8)
        .strokeEllipse(actor.x, actor.y + 2, 33 * scale, 15 * scale);
    }
  }

  private renderTell(actor: Actor, world: WorldData, view: GameView) {
    const g = this.effects,
      strong = actor.type === 'boss' || actor.type === 'guardian' || actor.type === 'hunt';
    const color = view.settings.highContrast ? 0xffa374 : COLOR.danger;
    if (actor.pattern === 'pool') {
      g.fillStyle(color, 0.1)
        .fillCircle(actor.aimX, actor.aimY, 75)
        .lineStyle(2, color, 0.8)
        .strokeCircle(actor.aimX, actor.aimY, 75);
      return;
    }
    const radial = /nova|ring|pulse|shock|summon|cleave/.test(actor.pattern);
    if (radial) {
      const radius =
        actor.pattern === 'cleave'
          ? 90
          : actor.pattern === 'ring' || actor.pattern === 'summon'
            ? 45
            : strong
              ? 125
              : 62;
      g.fillStyle(color, 0.09)
        .fillCircle(actor.x, actor.y, radius)
        .lineStyle(2, color, 0.8)
        .strokeCircle(actor.x, actor.y, radius);
      g.lineStyle(1, 0xffd8ab, 0.7).strokeCircle(actor.x, actor.y, radius - 4);
    } else {
      const dx = actor.aimX - actor.x,
        dy = actor.aimY - actor.y;
      const angle = Math.atan2(dy || world.player.y - actor.y, dx || world.player.x - actor.x);
      const range = actor.pattern === 'charge' ? 240 : 230,
        width = actor.pattern === 'burst' ? 0.47 : actor.pattern === 'charge' ? 0.34 : 0.16;
      const points: Phaser.Math.Vector2[] = [new Phaser.Math.Vector2(actor.x, actor.y)];
      for (let i = 0; i <= 10; i++) {
        const a = angle - width + (i / 10) * width * 2;
        points.push(
          new Phaser.Math.Vector2(actor.x + Math.cos(a) * range, actor.y + Math.sin(a) * range),
        );
      }
      g.fillStyle(color, 0.11)
        .fillPoints(points, true)
        .lineStyle(2, color, 0.75)
        .strokePoints(points, true);
    }
  }

  private renderObjects(world: WorldData, time: number, view: GameView) {
    const active = new Set<string>();
    for (const object of world.objects) {
      active.add(object.id);
      let display = this.objectViews.get(object.id);
      if (!display) {
        const npcFamily =
          object.data === 'nix'
            ? 'nix'
            : ASSETS.sprites[`npc-${object.data}`]
              ? `npc-${object.data}`
              : 'warrior';
        const key = object.type === 'npc' ? 'actors' : object.type;
        const image = this.add
          .image(
            object.x,
            object.y,
            this.textures.exists(key) ? key : 'terminal',
            object.type === 'npc' ? `${npcFamily}:down-idle:0` : undefined,
          )
          .setOrigin(0.5, 0.75)
          .setDepth(object.y + 2);
        if (object.type === 'npc') image.setScale(1.35);
        const glow = this.add
          .image(object.x, object.y + 2, 'glow')
          .setDisplaySize(85, 65)
          .setDepth(object.y - 2)
          .setAlpha(0.28)
          .setBlendMode(Phaser.BlendModes.ADD)
          .setTint(object.type === 'chest' ? COLOR.amber : COLOR.jade);
        const label = this.add
          .text(object.x, object.y - 44, '', {
            fontFamily: 'Inter, sans-serif',
            fontSize: '10px',
            color: '#eee1c8',
            backgroundColor: '#182320',
            padding: { x: 5, y: 3 },
          })
          .setOrigin(0.5, 1)
          .setDepth(9500);
        display = { image, glow, label };
        this.objectViews.set(object.id, display);
      }
      const near =
        Math.hypot(world.player.x - object.x, world.player.y - object.y) < 90 &&
        view.phase === 'playing';
      const isExit = object.type === 'exit';
      display.image.setAlpha(object.active ? 1 : 0.48).setTint(object.active ? 0xffffff : 0x738177);
      display.glow
        .setVisible(object.active && (!isExit || world.bossKilled))
        .setAlpha(
          view.settings.reducedMotion ? 0.23 : 0.2 + Math.sin(time / 600 + object.x) * 0.07,
        );
      display.label
        .setText(object.label[view.lang])
        .setVisible(near && !view.interaction && object.active && (!isExit || world.bossKilled));
      if (isExit && !world.bossKilled) display.image.setTint(0x695e50).setAlpha(0.6);
    }
    for (const [id, display] of this.objectViews)
      if (!active.has(id)) {
        display.image.destroy();
        display.glow.destroy();
        display.label.destroy();
        this.objectViews.delete(id);
      }
  }

  private renderEffects(world: WorldData, time: number, view: GameView) {
    const particleIds = new Set<string>();
    for (const projectile of world.projectiles) {
      particleIds.add(projectile.id);
      let image = this.particleViews.get(projectile.id);
      if (!image) {
        image = this.add.image(projectile.x, projectile.y, 'projectile').setDepth(9100);
        this.particleViews.set(projectile.id, image);
      }
      image
        .setPosition(projectile.x, projectile.y)
        .setRotation(Math.atan2(projectile.vy, projectile.vx))
        .setTint(hex(projectile.color))
        .setDisplaySize(Math.max(8, projectile.radius * 2.5), Math.max(8, projectile.radius * 2.5));
      if (!view.settings.reducedMotion)
        this.effects
          .lineStyle(2, hex(projectile.color), 0.35)
          .lineBetween(
            projectile.x,
            projectile.y,
            projectile.x - projectile.vx * 0.035,
            projectile.y - projectile.vy * 0.035,
          );
    }
    for (const [id, image] of this.particleViews)
      if (!particleIds.has(id)) {
        image.destroy();
        this.particleViews.delete(id);
      }
    const effectIds = new Set<string>(),
      textIds = new Set<string>();
    for (const effect of world.effects) {
      const alpha = Math.min(1, Math.max(0, effect.ttl / Math.max(0.001, effect.duration))),
        color = hex(effect.color);
      if (effect.type === 'text' && effect.text) {
        textIds.add(effect.id);
        let text = this.textViews.get(effect.id);
        if (!text) {
          text = this.add
            .text(effect.x, effect.y, effect.text, {
              fontFamily: 'Tiny5, monospace',
              fontSize: '16px',
              color: effect.color,
              stroke: '#13211c',
              strokeThickness: 3,
            })
            .setOrigin(0.5)
            .setDepth(9700);
          this.textViews.set(effect.id, text);
        }
        text
          .setPosition(
            effect.x,
            effect.y - 14 - (view.settings.reducedMotion ? 0 : (1 - alpha) * 22),
          )
          .setAlpha(alpha);
      } else if (effect.type === 'hit') {
        effectIds.add(effect.id);
        let sprite = this.effectViews.get(effect.id);
        if (!sprite) {
          sprite = this.add.sprite(effect.x, effect.y, 'impact').setDepth(9200);
          this.effectViews.set(effect.id, sprite);
        }
        sprite
          .setFrame(Math.min(5, Math.floor((1 - alpha) * 6)))
          .setAlpha(alpha)
          .setTint(color)
          .setScale(Math.max(0.7, effect.radius / 20));
      } else if (effect.type === 'ring' || effect.type === 'heal') {
        this.effects
          .lineStyle(2, color, alpha * 0.75)
          .strokeCircle(effect.x, effect.y, effect.radius * (1.05 - alpha * 0.2));
        this.effects
          .lineStyle(1, color, alpha * 0.35)
          .strokeCircle(effect.x, effect.y, effect.radius * 0.7);
      } else if (effect.type === 'line') {
        const length = effect.radius;
        this.effects
          .lineStyle(3, color, alpha * 0.8)
          .lineBetween(
            effect.x,
            effect.y,
            effect.x + Math.cos(effect.angle) * length,
            effect.y + Math.sin(effect.angle) * length,
          );
      } else if (effect.type === 'telegraph' || effect.type === 'trap') {
        this.effects.fillStyle(color, alpha * 0.1).fillCircle(effect.x, effect.y, effect.radius);
        this.effects
          .lineStyle(effect.type === 'trap' ? 1 : 2, color, alpha * 0.75)
          .strokeCircle(effect.x, effect.y, effect.radius);
        this.effects
          .lineStyle(1, color, alpha)
          .lineBetween(effect.x - 4, effect.y, effect.x + 4, effect.y)
          .lineBetween(effect.x, effect.y - 4, effect.x, effect.y + 4);
      } else if (effect.type === 'turret') {
        effectIds.add(effect.id);
        let sprite = this.effectViews.get(effect.id);
        if (!sprite) {
          sprite = this.add
            .sprite(effect.x, effect.y, 'camera')
            .setOrigin(0.5, 0.75)
            .setDepth(effect.y + 25);
          this.effectViews.set(effect.id, sprite);
        }
        sprite
          .setScale(0.6)
          .setTint(mix(0xffffff, color, 0.2))
          .setAlpha(Math.min(1, alpha * 3));
        this.effects.lineStyle(1, color, 0.45).strokeEllipse(effect.x, effect.y + 1, 29, 13);
      }
    }
    for (const [id, sprite] of this.effectViews)
      if (!effectIds.has(id)) {
        sprite.destroy();
        this.effectViews.delete(id);
      }
    for (const [id, text] of this.textViews)
      if (!textIds.has(id)) {
        text.destroy();
        this.textViews.delete(id);
      }
  }

  private updateInput(view: GameView) {
    if (
      view.phase !== 'playing' ||
      view.paused ||
      view.panel !== 'none' ||
      editable(document.activeElement)
    ) {
      game.input.attacking = false;
      if (this.keyboardUsed) {
        game.input.moveX = game.input.moveY = 0;
        this.keys.clear();
        this.keyboardUsed = false;
      }
      return;
    }
    const pressed = (action: string, extra: string) => {
      const legacyAction = (
        { moveUp: 'up', moveDown: 'down', moveLeft: 'left', moveRight: 'right' } as Record<
          string,
          string
        >
      )[action];
      const value =
        view.settings.bindings[action] ??
        view.settings.bindings[legacyAction] ??
        DEFAULT_BINDINGS[action];
      const code = value.length === 1 ? `Key${value.toUpperCase()}` : value;
      return this.keys.has(code) || this.keys.has(extra);
    };
    if (this.keyboardUsed) {
      const x =
        Number(pressed('moveRight', 'ArrowRight')) - Number(pressed('moveLeft', 'ArrowLeft'));
      const y = Number(pressed('moveDown', 'ArrowDown')) - Number(pressed('moveUp', 'ArrowUp'));
      const length = Math.hypot(x, y) || 1;
      game.input.moveX = x / length;
      game.input.moveY = y / length;
      if (!this.pointerAim && (x || y)) {
        game.input.aimX = game.world.player.x + x * 350;
        game.input.aimY = game.world.player.y + y * 350;
      }
    }
    // Do not overwrite the touch UI's held primary-attack flag when no mouse is down.
    if (this.pointerHeld) game.input.attacking = true;
    const pad = navigator.getGamepads?.().find((p) => p?.connected);
    if (!pad) {
      if (this.padMoving) {
        game.input.moveX = game.input.moveY = 0;
        this.padMoving = false;
      }
      if (this.padAttacking) {
        game.input.attacking = false;
        this.padAttacking = false;
      }
      this.padButtons.clear();
      return;
    }
    const deadzone = (n: number) => (Math.abs(n) < 0.18 ? 0 : n);
    const x = deadzone(pad.axes[0] ?? 0),
      y = deadzone(pad.axes[1] ?? 0);
    if (x || y) {
      game.input.moveX = x;
      game.input.moveY = y;
      this.keyboardUsed = false;
      this.padMoving = true;
    } else if (this.padMoving) {
      game.input.moveX = game.input.moveY = 0;
      this.padMoving = false;
    }
    const aimX = deadzone(pad.axes[2] ?? 0),
      aimY = deadzone(pad.axes[3] ?? 0);
    if (aimX || aimY) {
      game.input.aimX = game.world.player.x + aimX * 350;
      game.input.aimY = game.world.player.y + aimY * 350;
      this.pointerAim = false;
    }
    const map: Record<number, Parameters<typeof game.requestAction>[0]> = {
      0: 'dodge',
      1: 'interact',
      2: 'attack',
      3: 'heal',
      4: 'skill1',
      5: 'skill2',
      7: 'ultimate',
    };
    pad.buttons.forEach((button, index) => {
      if (button.pressed && !this.padButtons.has(index)) {
        if (map[index]) game.requestAction(map[index]);
        if (index === 9) game.pause(true);
      }
      if (button.pressed) this.padButtons.add(index);
      else this.padButtons.delete(index);
    });
    if (pad.buttons[2]?.pressed) {
      game.input.attacking = true;
      this.padAttacking = true;
    } else if (this.padAttacking) {
      game.input.attacking = false;
      this.padAttacking = false;
    }
    // A centred stick releases its own movement rather than trapping the player.
    if (!x && !y && !this.keyboardUsed && this.padButtons.size) {
      game.input.moveX = game.input.moveY = 0;
    }
  }

  update(time: number, delta: number) {
    const view = game.getSnapshot();
    if (view.renderer.status !== 'ready') return;
    this.updateInput(view);
    game.step(Math.min(delta, 100));
    const world = game.world;
    if (!world) return;
    this.game.canvas.setAttribute(
      'aria-label',
      view.lang === 'de' ? 'Dungeon-Spielwelt' : 'Dungeon game world',
    );
    if (world.id !== this.worldId) this.rebuild(world);
    this.effects.clear();
    this.bars.clear();
    this.fog.clear();
    this.renderObjects(world, time, view);
    const visible = new Set<string>();
    for (const actor of [world.player, world.nix, ...world.enemies]) {
      if (actor.dead) continue;
      visible.add(actor.id);
      this.renderActor(actor, time, world, view);
    }
    for (const [id, display] of this.actorViews)
      if (!visible.has(id)) {
        display.sprite.destroy();
        display.shadow.destroy();
        this.actorViews.delete(id);
      }
    this.renderEffects(world, time, view);
    if (
      view.phase === 'playing' &&
      !view.settings.reducedMotion &&
      view.settings.shake &&
      this.lastHealth > world.player.hp
    )
      this.cameras.main.shake(80, 0.002);
    this.lastHealth = world.player.hp;
    const camera = this.cameras.main;
    const title = view.phase === 'title' || view.phase === 'classselect';
    const offset = title && this.scale.width > 700 ? (this.scale.width * 0.21) / camera.zoom : 0;
    const centreX = world.player.x - offset,
      centreY = world.player.y;
    if (this.lastPhase !== view.phase || this.lastTime === 0) camera.centerOn(centreX, centreY);
    else {
      const currentX = camera.scrollX + camera.width / 2;
      const currentY = camera.scrollY + camera.height / 2;
      const amount = view.settings.reducedMotion ? 1 : 1 - Math.exp(-Math.min(delta, 100) / 85);
      camera.centerOn(
        Phaser.Math.Linear(currentX, centreX, amount),
        Phaser.Math.Linear(currentY, centreY, amount),
      );
    }
    this.lastTime = time;
    this.lastPhase = view.phase;
    this.vignette.setAlpha(view.settings.highContrast ? 0.16 : 0.28);
    // Unexplored rooms stay atmospheric, while player silhouettes are never hidden.
    if (!title && view.phase === 'playing')
      for (const room of world.rooms)
        if (!room.visited) {
          this.fog
            .fillStyle(COLOR.ink, 0.87)
            .fillRect(room.x * TILE, room.y * TILE, room.w * TILE, room.h * TILE);
        }
  }

  private dispose() {
    this.disposeListeners.forEach((fn) => fn());
    this.disposeListeners = [];
    game.input.moveX = game.input.moveY = 0;
    game.input.attacking = false;
  }
}

/** One persistent canvas for title, hub and expeditions. Idempotent disposal supports React strict mode. */
export function createRenderer(parent: HTMLElement): { destroy(): void } {
  const renderer = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: Math.max(320, parent.clientWidth || window.innerWidth),
    height: Math.max(240, parent.clientHeight || window.innerHeight),
    backgroundColor: '#131c1a',
    transparent: false,
    pixelArt: true,
    roundPixels: true,
    antialias: false,
    render: { antialias: false, pixelArt: true, roundPixels: true, powerPreference: 'default' },
    scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
    fps: { target: 60, forceSetTimeOut: false, smoothStep: false },
    input: { keyboard: false, mouse: false, touch: false, gamepad: false },
    scene: [BroadcastScene],
    audio: { noAudio: true },
    banner: false,
  });
  renderer.canvas.setAttribute('aria-label', 'Dungeon world');
  renderer.canvas.setAttribute('role', 'img');
  renderer.canvas.style.imageRendering = 'pixelated';
  const resize = new ResizeObserver(() => {
    if (renderer.scale)
      renderer.scale.resize(Math.max(320, parent.clientWidth), Math.max(240, parent.clientHeight));
  });
  resize.observe(parent);
  let destroyed = false;
  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      resize.disconnect();
      renderer.destroy(true);
    },
  };
}
