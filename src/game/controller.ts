import {
  CLASSES,
  FLOORS,
  ITEMS,
  QUESTS,
  RECIPES,
  NPCS,
  AFFIXES,
  ALL_BOSSES,
  ORIGINS,
  CITIES,
  CITY_QUESTS,
  STORY_CHAPTERS,
  RUN_MODIFIERS,
} from '../content';
import type { NarrativeChoice } from './narrative-types';
import {
  contractStatus,
  acceptContract,
  progressContracts,
  bankContracts,
  rollbackContracts,
  applyChoice,
  settleContract,
} from './contracts';
import type {
  Campaign,
  GameView,
  Panel,
  Lang,
  Settings,
  Actor,
  Room,
  ItemInstance,
  QuestDef,
  Dialog,
  WorldObject,
} from './types';
import { generateWorld, generateCity, actor, roomAt, nearestInteraction, TILE } from './world';
import { Simulation, effectiveStats, type Input } from './engine';
import { hashSeed, nextRandom } from './random';
import {
  saveCampaign,
  loadCampaign,
  allSaves,
  removeSave,
  savePreferences,
  loadPreferences,
  DEFAULT_SETTINGS,
  validCampaign,
  ConcurrentSaveError,
} from './save';
import { AudioDirector } from './audio';
import { api, ApiError, type CloudSave } from './cloud';
import { createCampaign } from './campaign';
import { sameCampaign } from './state';
const txt = (de: string, en: string) => ({ de, en });
const errors: Record<string, ReturnType<typeof txt>> = {
  invalid_credentials: txt(
    'Benutzername oder Passwort stimmt nicht.',
    'Username or password is incorrect.',
  ),
  username_taken: txt(
    'Dieser Benutzername ist bereits vergeben.',
    'This username is already taken.',
  ),
  invalid_input: txt(
    'Benutzername: 3–24 Zeichen (Buchstaben, Zahlen, _ und -). Passwort: mindestens 10 Zeichen.',
    'Username: 3–24 characters (letters, numbers, _ and -). Password: at least 10 characters.',
  ),
  rate_limited: txt(
    'Zu viele Versuche. Bitte später erneut versuchen.',
    'Too many attempts. Please try again later.',
  ),
  unavailable: txt(
    'Cloud gerade nicht erreichbar. Dein lokaler Spielstand bleibt erhalten.',
    'Cloud is currently unavailable. Your local save is retained.',
  ),
  unauthorized: txt('Bitte erneut anmelden.', 'Please sign in again.'),
  invalid_save: txt(
    'Dieser Spielstand ist ungültig oder gehört zu einer anderen Version.',
    'This save is invalid or belongs to a different version.',
  ),
};
export class GameController {
  world = generateWorld(1, hashSeed('broadcast-attract'), 'breaker');
  input: Input = {
    moveX: 0,
    moveY: 0,
    aimX: this.world.player.x + 100,
    aimY: this.world.player.y,
    attacking: false,
  };
  private campaign: Campaign | null = null;
  private simulation: Simulation | null = null;
  private listeners = new Set<() => void>();
  private accumulator = 0;
  private publishClock = 0;
  private saveClock = 0;
  private cloudClock = 0;
  private saving = false;
  private pendingSave = false;
  private cloudBusy = false;
  private dirty = 0;
  private cloudRevisions: Record<number, number> = {};
  private mutation: {
    slot: number;
    revision: number;
    id: string;
    campaign: Campaign;
    dirty: number;
  } | null = null;
  private dialogHandler: ((id: string) => void) | null = null;
  private audio = new AudioDirector();
  private view: GameView = {
    renderer: { status: 'loading', progress: 0 },
    cityId: null,
    questGiver: null,
    phase: 'title',
    panel: 'none',
    paused: false,
    lang: typeof navigator !== 'undefined' && navigator.language.startsWith('de') ? 'de' : 'en',
    campaign: null,
    settings: structuredClone(DEFAULT_SETTINGS),
    floor: 1,
    hp: 100,
    maxHp: 100,
    resource: 100,
    maxResource: 100,
    shield: 0,
    cooldowns: {},
    ultimate: 0,
    boss: null,
    quest: null,
    interaction: null,
    dialog: null,
    toasts: [],
    saveStatus: 'local',
    slots: [],
    account: { username: null, available: false, status: 'local', message: '' },
    shop: [],
    stats: { damage: 10, armor: 0, crit: 0.06, speed: 140 },
  };
  constructor() {
    void this.initialize();
    if (typeof document !== 'undefined')
      document.addEventListener(
        'visibilitychange',
        () => {
          if (document.hidden) {
            this.pause(true);
            void this.persist();
            this.audio.suspend();
          }
        },
        { signal: this.lifecycle.signal },
      );
    if (typeof window !== 'undefined') {
      window.addEventListener(
        'pagehide',
        () => {
          void this.persist();
        },
        { signal: this.lifecycle.signal },
      );
      window.addEventListener(
        'online',
        () => {
          void this.sync();
        },
        { signal: this.lifecycle.signal },
      );
    }
  }
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };
  getSnapshot = () => this.view;
  reportRenderer(status: GameView['renderer']['status'], progress = this.view.renderer.progress) {
    this.view.renderer = { status, progress: Math.max(0, Math.min(1, progress)) };
    this.emit();
  }
  private cloudSlots: GameView['slots'] = [];
  private lifecycle = new AbortController();
  destroy() {
    this.lifecycle.abort();
    this.audio.destroy();
    this.listeners.clear();
  }
  private async refreshSlots(cloud = false) {
    const local = await allSaves();
    if (cloud && this.view.account.username) {
      const result = await api<{ saves: GameView['slots'] }>('saves');
      this.cloudSlots = result.saves;
    }
    this.view.slots = [
      ...local,
      ...this.cloudSlots.filter((c) => !local.some((l) => l.slot === c.slot)),
    ].sort((a, b) => a.slot - b.slot);
  }
  private async initialize() {
    try {
      const prefs = await loadPreferences();
      if (prefs) {
        this.view.lang = prefs.lang;
        this.view.settings = {
          ...DEFAULT_SETTINGS,
          ...prefs.settings,
          bindings: { ...DEFAULT_SETTINGS.bindings, ...prefs.settings.bindings },
        };
      }
      this.view.slots = await allSaves();
    } catch {
      this.toast(
        txt(
          'Lokaler Speicher ist nicht verfügbar. Exportiere deinen Stand vor dem Schließen.',
          'Local storage is unavailable. Export your save before closing.',
        ),
        'error',
      );
    }
    this.emit();
    try {
      const session = await api<{ available: boolean; username: string | null }>('session');
      this.view.account = {
        ...this.view.account,
        available: session.available,
        username: session.username,
      };
      await this.refreshSlots(true);
      this.emit();
    } catch {
      /* Offline guest play needs no server. */
    }
  }
  private emit() {
    const sim = this.simulation,
      p = this.world.player;
    const boss = this.world.enemies.find(
      (a) =>
        !a.dead &&
        ['boss', 'guardian', 'hunt'].includes(a.type) &&
        Math.hypot(a.x - p.x, a.y - p.y) < 650,
    );
    const def = boss && ALL_BOSSES.find((d) => d.id === boss.defId);
    const interaction = nearestInteraction(this.world);
    const q =
      this.campaign &&
      QUESTS.find(
        (q) =>
          q.floor === this.world.floor &&
          q.category === 'main' &&
          !this.campaign!.questProgress[q.id]?.confirmed &&
          (this.campaign!.questProgress[q.id]?.count ?? 0) < q.target,
      );
    this.view = {
      ...this.view,
      campaign: this.campaign
        ? {
            ...this.campaign,
            world: null,
            inventory: [...this.campaign.inventory],
            equipment: { ...this.campaign.equipment },
            questProgress: { ...this.campaign.questProgress },
            talents: [...this.campaign.talents],
            relics: [...this.campaign.relics],
          }
        : null,
      floor: this.world.floor,
      hp: Math.ceil(p.hp),
      maxHp: p.maxHp,
      resource: sim?.resource ?? 100,
      maxResource: sim?.stats.maxResource ?? 100,
      shield: sim?.shield ?? 0,
      cooldowns: { ...sim?.cooldowns },
      ultimate: sim?.ultimate ?? 0,
      boss:
        boss && def ? { name: def.name, hp: boss.hp, maxHp: boss.maxHp, phase: boss.phase } : null,
      quest: q || null,
      interaction: interaction?.label ?? null,
      stats: sim?.stats ?? this.view.stats,
    };
    for (const fn of this.listeners) fn();
  }
  private toast(text: ReturnType<typeof txt>, tone = 'info') {
    const id = crypto.randomUUID();
    this.view.toasts = [...this.view.toasts.slice(-3), { id, text, tone }];
    this.emit();
    setTimeout(() => {
      this.view.toasts = this.view.toasts.filter((t) => t.id !== id);
      this.emit();
    }, 4500);
  }
  private attach(c: Campaign) {
    this.campaign = c;
    const cls = CLASSES.find((k) => k.id === c.classId) ?? CLASSES[0];
    this.world =
      c.world ?? generateWorld(c.floorUnlocked, hashSeed(`${c.createdAt}:${c.run}`), cls.id);
    this.simulation = new Simulation(this.world, c, this.view.settings, {
      kill: (a) => this.onKill(a),
      room: (r) => this.onRoom(r),
      death: () => this.onDeath(),
      feedback: (kind) => this.audio.play(kind),
    });
    this.world.player.defId = c.classId;
    this.input.aimX = this.world.player.x + 100;
    this.input.aimY = this.world.player.y;
    this.accumulator = 0;
  }
  newGame(classId: string, name: string, slot = 0) {
    if (!CLASSES.some((c) => c.id === classId) || ![0, 1, 2].includes(slot)) return;
    this.audio.unlock();
    this.audio.volume(this.view.settings.sound, this.view.settings.music);
    this.attach(createCampaign(classId, name, slot));
    this.view.phase = 'origin';
    this.view.panel = 'none';
    this.view.cityId = null;
    this.view.questGiver = null;
    this.view.paused = false;
    this.emit();
  }
  finishOrigin(originId: string, motivation: 'family' | 'truth' | 'revenge') {
    const c = this.campaign;
    if (
      !c ||
      this.view.phase !== 'origin' ||
      !ORIGINS.some((o) => o.id === originId) ||
      !['family', 'truth', 'revenge'].includes(motivation)
    )
      return;
    c.origin = originId;
    c.choices.motivation = motivation;
    for (const faction of ['union', 'residents', 'archive', 'sponsors'])
      c.relationships[`faction-${faction}`] = 50;
    c.relationships[
      `faction-${motivation === 'family' ? 'residents' : motivation === 'truth' ? 'archive' : 'union'}`
    ] = 58;
    c.choices.currentCity = 'haven';
    this.returnHub();
    this.visitCity('haven');
    this.showDialog(
      {
        speaker: 'NIX',
        title: txt('Unter der letzten Stadt', 'Below the last city'),
        lines: [
          ORIGINS.find((o) => o.id === originId)!.personalGoal,
          CITIES[0].description,
          txt(
            'Tam hält den Kesselhafen offen. Sprich mit ihm über Aufträge; Ilya sucht nach den ungeschnittenen Zuglisten. Am Reisetor beginnt deine erste Expedition.',
            'Tam keeps Boilerhaven open. Ask him about contracts; Ilya is looking for unedited train records. Your first expedition begins at the travel gate.',
          ),
        ],
        choices: [{ id: 'explore', label: txt('Den Kesselhafen erkunden', 'Explore Boilerhaven') }],
      },
      () => this.closePanel(),
    );
  }
  async loadSlot(slot: number) {
    const local = await loadCampaign(slot);
    if (local && validCampaign(local)) {
      this.attach(local);
      this.view.phase = this.savedPhase(local);
      this.view.cityId = null;
      this.view.questGiver = null;
      this.view.panel = 'none';
      this.view.paused = false;
      if (!local.world) this.restoreRefuge();
      this.audio.unlock();
      this.emit();
    }
    if (this.view.account.username) {
      try {
        const cloud = await api<CloudSave>(`saves?slot=${slot}`);
        this.cloudRevisions[slot] = cloud.revision;
        if (!local) {
          await saveCampaign(cloud.campaign);
          this.attach(cloud.campaign);
          this.view.phase = this.savedPhase(cloud.campaign);
          this.view.panel = 'none';
          this.view.paused = false;
          this.audio.unlock();
          this.view.cityId = null;
          this.view.questGiver = null;
          if (!cloud.campaign.world) this.restoreRefuge();
        } else if (!sameCampaign(local, cloud.campaign)) {
          this.view.account = {
            ...this.view.account,
            status: 'conflict',
            conflict: { local, cloud: cloud.campaign, revision: cloud.revision },
          };
          this.openPanel('account');
        }
      } catch (e) {
        if (!(e instanceof ApiError && e.status === 404)) this.view.account.status = 'offline';
      }
      this.emit();
    }
  }
  private makeHub() {
    if (!this.campaign) return;
    this.world = generateWorld(
      Math.min(12, this.campaign.floorUnlocked),
      hashSeed(`hub:${this.campaign.classId}`),
      this.campaign.classId,
    );
    const first = this.world.rooms[0];
    this.world.rooms = this.world.rooms.slice(0, 1);
    this.world.objects = this.world.objects.filter((o) => o.room === first.id);
    NPCS.filter((npc) => this.npcAvailable(npc.id)).forEach((npc, i) => {
      this.world.objects.push({
        id: `npc-${npc.id}`,
        type: 'npc',
        x: (first.x + 2 + (i % 5) * 3) * TILE,
        y: (first.y + 2 + Math.floor(i / 5) * 6) * TILE,
        room: first.id,
        active: true,
        label: txt(`Mit ${npc.name} sprechen`, `Talk to ${npc.name}`),
        data: npc.id,
      });
    });
    this.campaign.world = null;
    this.simulation = new Simulation(this.world, this.campaign, this.view.settings, {
      kill: (a) => this.onKill(a),
      room: (r) => this.onRoom(r),
      death: () => this.onDeath(),
      feedback: (kind) => this.audio.play(kind),
    });
    this.world.player.hp = this.world.player.maxHp;
  }
  private restoreRefuge() {
    const c = this.campaign!;
    if (c.ending && c.choices.refuge !== 'town') {
      this.makeHub();
      return;
    }
    const city = CITIES.find(
      (s) => s.id === c.choices.currentCity && s.unlockFloor <= c.floorUnlocked,
    );
    if (c.choices.refuge === 'town' && city) this.visitCity(city.id);
    else this.makeHub();
  }
  private savedPhase(c: Campaign): GameView['phase'] {
    return c.world
      ? 'playing'
      : c.ending && !['hub', 'town'].includes(c.choices.refuge)
        ? 'ending'
        : 'hub';
  }
  visitCity(id: string) {
    const c = this.campaign,
      city = CITIES.find((s) => s.id === id);
    if (
      !c ||
      !city ||
      city.unlockFloor > c.floorUnlocked ||
      (this.view.phase === 'playing' && c.world)
    )
      return;
    this.world = generateCity(city, hashSeed(`city:${id}:${c.createdAt}`), c.classId);
    c.world = null;
    c.choices.currentCity = id;
    c.choices.refuge = 'town';
    this.view.cityId = id;
    this.view.questGiver = null;
    this.view.phase = 'town';
    this.view.panel = 'none';
    this.view.dialog = null;
    this.view.paused = false;
    this.input.moveX = this.input.moveY = 0;
    this.input.attacking = false;
    this.simulation = new Simulation(this.world, c, this.view.settings, {
      kill() {},
      room: (r) => this.onRoom(r),
      death() {},
      feedback: (kind) => this.audio.play(kind),
    });
    this.world.player.hp = this.world.player.maxHp;
    this.rebuildShop();
    this.emit();
    void this.persist();
  }
  leaveCity() {
    if (this.view.phase !== 'town') return;
    this.returnHub();
  }
  setRoute(route: 'balanced' | 'dangerous' | 'exploration') {
    if (!this.campaign || !['balanced', 'dangerous', 'exploration'].includes(route)) return;
    this.campaign.choices.route = route;
    this.emit();
    void this.persist();
  }
  cityQuestStatus(id: string): 'locked' | 'available' | 'active' | 'ready' | 'completed' {
    return this.campaign ? contractStatus(this.campaign, id) : 'locked';
  }
  openQuestBoard(npcId?: string) {
    this.view.questGiver = npcId && this.nearQuestGiver(npcId) ? npcId : null;
    this.openPanel('contracts');
  }
  private nearQuestGiver(id: string) {
    return (
      this.view.phase === 'town' &&
      this.world.objects.some(
        (o) =>
          o.type === 'npc' &&
          o.data === id &&
          Math.hypot(o.x - this.world.player.x, o.y - this.world.player.y) < 100,
      )
    );
  }
  acceptQuest(id: string) {
    const c = this.campaign,
      q = CITY_QUESTS.find((q) => q.id === id);
    if (!c || !q || this.cityQuestStatus(id) !== 'available') return;
    if (this.view.cityId !== q.cityId || !this.nearQuestGiver(q.giver)) {
      this.toast(
        txt(
          'Sprich mit dem Auftraggeber in seiner Stadt, um diesen Auftrag anzunehmen.',
          'Speak to the giver in their city to accept this contract.',
        ),
      );
      return;
    }
    if (!acceptContract(c, id)) return;
    this.dirty++;
    this.toast(txt(`Angenommen: ${q.name.de}`, `Accepted: ${q.name.en}`), 'success');
    void this.persist();
  }
  claimQuest(id: string, choiceId?: string) {
    const c = this.campaign,
      q = CITY_QUESTS.find((q) => q.id === id);
    if (
      !c ||
      !q ||
      this.cityQuestStatus(id) !== 'ready' ||
      this.view.cityId !== q.cityId ||
      !this.nearQuestGiver(q.giver)
    )
      return;
    const settle = (selected?: string) => {
      if (this.cityQuestStatus(id) !== 'ready') return;
      const choice = q.choices?.find((v) => v.id === selected);
      if (q.choices?.length && !choice) return;
      const settled = settleContract(c, id, selected);
      if (!settled) return;
      if (q.reward.itemId) this.addItem(q.reward.itemId);
      if (choice) this.toast(choice.consequence);
      this.dirty++;
      this.closePanel();
      this.toast(txt(`Abgegeben: ${q.name.de}`, `Completed: ${q.name.en}`), 'success');
      this.openQuestBoard(q.giver);
      void this.persist();
    };
    if (choiceId || !q.choices?.length) {
      if (!choiceId)
        this.showDialog(
          {
            speaker: NPCS.find((n) => n.id === q.giver)!.name,
            title: q.name,
            lines: q.conclusion,
            choices: [{ id: 'claim', label: txt('Auftrag abschließen', 'Complete contract') }],
          },
          () => settle(),
        );
      else settle(choiceId);
    } else
      this.showDialog(
        {
          speaker: NPCS.find((n) => n.id === q.giver)!.name,
          title: q.name,
          lines: q.conclusion,
          choices: q.choices.map((v) => ({ id: v.id, label: v.label })),
        },
        (selected) => settle(selected),
      );
  }
  private applyNarrativeChoice(key: string, choice: NarrativeChoice) {
    if (applyChoice(this.campaign!, key, choice)) this.toast(choice.consequence);
  }
  private bankCityQuests() {
    bankContracts(this.campaign!);
  }

  private resetRunQuests(death = false) {
    const c = this.campaign!;
    if (death) rollbackContracts(c);
    for (const [id, state] of Object.entries(c.questProgress))
      if (!state.confirmed) {
        if (c.acceptedQuests?.includes(id)) {
          if (death) state.count = c.cityQuestBank?.[id] ?? 0;
        } else delete c.questProgress[id];
      }
  }
  returnHub() {
    if (!this.campaign) {
      this.view.phase = 'title';
      this.closePanel();
      return;
    }
    const c = this.campaign;
    if (
      this.view.phase === 'playing' &&
      c.world &&
      (roomAt(this.world, this.world.player.x, this.world.player.y)?.kind !== 'rest' ||
        this.world.enemies.some(
          (a) => !a.dead && Math.hypot(a.x - this.world.player.x, a.y - this.world.player.y) < 350,
        ))
    ) {
      this.toast(
        txt(
          'Kehre zum sicheren Eingangsraum zurück, um die Expedition mit Beute zu verlassen.',
          'Return to the safe entry room to leave the expedition with your loot.',
        ),
      );
      return;
    }
    c.scrap += c.runScrap;
    c.runScrap = 0;
    c.unbanked = [];
    this.bankCityQuests();
    this.resetRunQuests();
    c.choices.refuge = 'hub';
    this.view.cityId = null;
    this.view.questGiver = null;
    this.view.phase = 'hub';
    this.view.paused = false;
    this.view.panel = 'none';
    this.view.dialog = null;
    this.input.attacking = false;
    this.makeHub();
    this.rebuildShop();
    this.emit();
    void this.persist();
  }
  enterFloor(floor = this.campaign?.floorUnlocked ?? 1) {
    const c = this.campaign;
    if (!c || floor < 1 || floor > c.floorUnlocked || floor > 12) return;
    c.run++;
    c.runScrap = 0;
    c.unbanked = [];
    const cls = CLASSES.find((k) => k.id === c.classId) ?? CLASSES[0];
    const route = ['dangerous', 'exploration'].includes(c.choices.route)
      ? (c.choices.route as 'dangerous' | 'exploration')
      : 'balanced';
    c.world = generateWorld(floor, hashSeed(`${c.createdAt}:${c.run}:${floor}`), cls.id, route);
    c.world.player.hp = effectiveStats(c).maxHp;
    this.attach(c);
    this.view.phase = 'playing';
    this.view.cityId = null;
    this.view.questGiver = null;
    this.view.paused = false;
    this.view.panel = 'none';
    this.view.dialog = null;
    this.audio.unlock();
    this.emit();
    void this.persist();
    this.toast(
      txt(
        `Floor ${floor}: ${FLOORS[floor - 1].name.de}`,
        `Floor ${floor}: ${FLOORS[floor - 1].name.en}`,
      ),
    );
    const chapter = STORY_CHAPTERS.find((s) => s.floor === floor);
    if (chapter && !c.choices[`arrival-${floor}`]) {
      this.showDialog(
        {
          speaker: 'NIX',
          title: chapter.title,
          lines: chapter.arrival,
          choices: [{ id: 'continue', label: txt('Die Spur aufnehmen', 'Follow the trail') }],
        },
        () => {
          c.choices[`arrival-${floor}`] = 'read';
          this.closePanel();
        },
      );
    } else {
      const mod = RUN_MODIFIERS.find((m) => m.id === this.world.modifiers?.[0]);
      if (mod) this.toast(mod.name);
    }
  }
  retry() {
    const c = this.campaign;
    if (!c) return;
    const act = Math.max(1, Math.ceil(this.world.floor / 3));
    c.level = (act - 1) * 5 + 1;
    c.xp = 0;
    this.enterFloor((act - 1) * 3 + 1);
  }
  pause(value: boolean) {
    this.view.paused = value;
    this.input.moveX = 0;
    this.input.moveY = 0;
    this.input.attacking = false;
    if (!value) this.audio.unlock();
    this.emit();
    if (value) void this.persist();
  }
  openPanel(panel: Panel) {
    this.view.panel = panel;
    this.view.paused = panel !== 'none' && ['playing', 'town'].includes(this.view.phase);
    this.input.attacking = false;
    this.input.moveX = this.input.moveY = 0;
    this.emit();
  }
  closePanel() {
    this.view.panel = 'none';
    this.view.dialog = null;
    this.dialogHandler = null;
    this.view.paused = false;
    this.emit();
  }
  setLanguage(lang: Lang) {
    this.view.lang = lang;
    document.documentElement.lang = lang;
    void savePreferences(lang, this.view.settings);
    this.emit();
  }
  updateSettings(settings: Partial<Settings>) {
    this.view.settings = { ...this.view.settings, ...settings };
    if (this.simulation) this.simulation.settings = this.view.settings;
    this.audio.volume(this.view.settings.sound, this.view.settings.music);
    void savePreferences(this.view.lang, this.view.settings);
    this.emit();
  }
  step(deltaMs: number) {
    if (
      this.view.renderer.status !== 'ready' ||
      !['playing', 'town'].includes(this.view.phase) ||
      this.view.paused ||
      !this.simulation
    )
      return;
    this.accumulator += Math.min(100, Math.max(0, deltaMs)) / 1000;
    let ticks = 0;
    while (this.accumulator >= 1 / 60 && ticks++ < 6) {
      this.simulation.step(1 / 60, this.input);
      this.accumulator -= 1 / 60;
      if (!['playing', 'town'].includes(this.view.phase) || this.view.paused) break;
    }
    this.publishClock += deltaMs;
    this.saveClock += deltaMs;
    this.cloudClock += deltaMs;
    if (this.publishClock >= 100) {
      this.publishClock = 0;
      this.emit();
    }
    if (this.saveClock >= 10000) {
      this.saveClock = 0;
      void this.persist();
    }
    if (this.cloudClock >= 60000) {
      this.cloudClock = 0;
      void this.sync();
    }
  }
  requestAction(action: string) {
    this.audio.unlock();
    this.audio.volume(this.view.settings.sound, this.view.settings.music);
    if (action === 'interact') {
      this.interact();
      return;
    }
    if (this.view.phase === 'playing' && !this.view.paused) {
      this.simulation?.action(action, this.input);
      this.emit();
    }
  }
  private onRoom(r: Room) {
    if (!this.campaign) return;
    if (!this.campaign.discovered.includes(r.prefab)) this.campaign.discovered.push(r.prefab);
    if (r.kind === 'boss' && !this.world.guardianKilled)
      this.toast(
        txt(
          'Der Bühnenzugang ist gesperrt. Besiege den Floorwächter.',
          'Stage access is sealed. Defeat the floor guardian first.',
        ),
      );
  }
  private progress(
    objective: QuestDef['objective'],
    amount = 1,
    npc?: string,
    storyTerminal = false,
  ) {
    const c = this.campaign;
    if (!c) return;
    for (const q of QUESTS.filter(
      (q) =>
        q.objective === objective &&
        (q.category === 'relationship'
          ? q.npc === npc && q.floor <= c.floorUnlocked
          : q.floor === this.world.floor),
    )) {
      const old = c.questProgress[q.id] ?? { count: 0, confirmed: false };
      if (old.confirmed) continue;
      if (q.category === 'relationship') {
        const earlier = QUESTS.filter(
          (t) => t.category === 'relationship' && t.npc === q.npc && t.id < q.id,
        );
        if (earlier.some((t) => !c.questProgress[t.id]?.confirmed)) continue;
      }
      const count = Math.min(q.target, old.count + amount);
      c.questProgress[q.id] = { ...old, count };
      if (count >= q.target && old.count < q.target) {
        this.toast(
          txt(`Ziel erreicht: ${q.name.de}`, `Objective complete: ${q.name.en}`),
          'success',
        );
        if (this.view.phase === 'hub' || this.view.phase === 'town') {
          c.questProgress[q.id].confirmed = true;
          c.marks += q.reward;
          if (q.category === 'relationship') break;
        }
      }
    }
    if (this.view.phase === 'playing' || this.view.phase === 'town')
      for (const q of progressContracts(c, {
        objective,
        amount,
        floor: this.world.floor,
        town: this.view.phase === 'town',
        cityId: this.view.cityId,
        npc,
        storyTerminal,
      }))
        this.toast(
          txt(`Rückkehr zum Auftraggeber: ${q.name.de}`, `Return to the giver: ${q.name.en}`),
          'success',
        );
  }

  private onKill(a: Actor) {
    const c = this.campaign;
    if (!c) return;
    this.world.kills++;
    c.discovered.push(a.defId);
    c.discovered = Array.from(new Set(c.discovered));
    c.xp +=
      a.type === 'boss'
        ? 75
        : a.type === 'guardian' || a.type === 'hunt'
          ? 40
          : a.type === 'elite'
            ? 18
            : 8;
    c.runScrap += Math.round(
      (a.type === 'mob' ? 5 : 15) *
        (1 + (this.simulation?.stats.gold ?? 0)) *
        (this.world.route === 'dangerous' ? 1.35 : 1),
    );
    this.progress('kills');
    while (c.xp >= c.level * 60 && c.level < 20) {
      c.xp -= c.level * 60;
      c.level++;
      this.simulation!.recalculate();
      this.world.player.hp = Math.min(
        this.world.player.maxHp,
        this.world.player.hp + this.world.player.maxHp * 0.12,
      );
      this.toast(
        txt(`Level ${c.level} · Talentpunkt erhalten`, `Level ${c.level} · Talent point earned`),
        'success',
      );
    }
    const f = FLOORS[this.world.floor - 1];
    const bossDef = ALL_BOSSES.find((b) => b.id === a.defId);
    let unique: string | undefined;
    if (a.type === 'boss') {
      this.world.bossKilled = true;
      this.progress('boss');
      unique = bossDef?.unique ?? f.boss.unique;
    }
    if (a.type === 'guardian') {
      this.world.guardianKilled = true;
      unique = bossDef?.unique ?? f.minibosses[0].unique;
    }
    if (a.type === 'hunt') {
      this.world.huntKilled = true;
      this.progress('hunt');
      unique = bossDef?.unique ?? f.minibosses[1].unique;
    }
    if (unique) this.addItem(unique);
    if (['boss', 'guardian', 'hunt'].includes(a.type)) {
      this.toast(
        txt(`Besiegt: ${bossDef?.name.de ?? a.defId}`, `Defeated: ${bossDef?.name.en ?? a.defId}`),
        'success',
      );
      this.world.objects.push({
        id: `reward-${a.id}`,
        type: 'chest',
        x: a.x,
        y: a.y,
        room: a.room,
        active: true,
        label: txt('Bossbeute sichern', 'Collect boss loot'),
        data: 'boss',
      });
      void this.persist();
    } else if (this.simulation!.random() < 0.16) this.randomLoot();
    this.dirty++;
  }
  private onDeath() {
    const c = this.campaign;
    if (!c) return;
    const lost = new Set(c.unbanked);
    c.inventory = c.inventory.filter((i) => !lost.has(i.uid));
    c.stash = c.stash.filter((i) => !lost.has(i.uid));
    for (const slot of Object.keys(c.equipment) as (keyof Campaign['equipment'])[])
      if (lost.has(c.equipment[slot] ?? '')) c.equipment[slot] = null;
    c.relics = c.relics.filter((uid) => !lost.has(uid));
    c.runScrap = 0;
    c.unbanked = [];
    this.resetRunQuests(true);
    c.world = null;
    this.view.phase = 'dead';
    this.view.paused = true;
    this.input.attacking = false;
    this.audio.play('death');
    this.toast(
      txt(
        'Bestätigte Story und Ausrüstung bleiben erhalten. Ungesicherte Beute geht verloren.',
        'Confirmed story and equipment are retained. Unbanked loot is lost.',
      ),
    );
    this.emit();
    void this.persist();
  }
  private addItem(defId: string) {
    const c = this.campaign,
      def = ITEMS.find((i) => i.id === defId);
    if (!c || !def) return;
    if (def.kind === 'key') {
      if (c.inventory.some((i) => i.defId === defId)) return;
    }
    if (def.kind === 'consumable') {
      const stack = c.inventory.find(
        (i) =>
          i.defId === defId &&
          i.quantity < 99 &&
          (this.view.phase !== 'playing' || c.unbanked.includes(i.uid)),
      );
      if (stack) {
        stack.quantity++;
        this.emit();
        return;
      }
    }
    if (
      c.inventory.length >= 24 &&
      (def.kind === 'key' || def.id.startsWith('unique-')) &&
      c.stash.length < 200
    ) {
      const movable = c.inventory.find(
        (i) =>
          !Object.values(c.equipment).includes(i.uid) && !c.relics.includes(i.uid) && !i.favorite,
      );
      if (movable) {
        c.inventory = c.inventory.filter((i) => i.uid !== movable.uid);
        c.stash.push(movable);
        this.toast(
          txt(
            'Seltene Beute gesichert: Ein Gegenstand wurde ins Lager gelegt.',
            'Rare loot protected: an item was moved into your stash.',
          ),
        );
      }
    }
    if (c.inventory.length >= 24) {
      c.runScrap += Math.ceil(def.price * 0.35);
      this.toast(
        txt(
          'Rucksack voll: Beute automatisch in Schrott umgewandelt.',
          'Backpack full: loot automatically converted to scrap.',
        ),
      );
      return;
    }
    const uid = `loot-${c.run}-${this.world.tick}-${c.inventory.length}-${def.id}`;
    const item: ItemInstance = {
      uid,
      defId,
      level: c.level,
      affixes: [],
      favorite: false,
      quantity: 1,
    };
    if (def.kind === 'gear' && def.slot && def.rarity >= 2) {
      const affixes = AFFIXES.filter((a) => a.slots.includes(def.slot!));
      if (affixes.length)
        item.affixes = [
          affixes[Math.floor((this.simulation?.random() ?? 0.1) * affixes.length)].id,
        ];
    }
    c.inventory.push(item);
    if (this.view.phase === 'playing') c.unbanked.push(uid);
    this.audio.play('loot');
    this.toast(txt(`Beute: ${def.name.de}`, `Loot: ${def.name.en}`), 'loot');
    this.dirty++;
    this.emit();
  }
  private randomLoot() {
    const choices = ITEMS.filter(
      (i) =>
        i.kind !== 'key' &&
        i.floor <= this.world.floor &&
        i.floor >= Math.max(1, this.world.floor - 2) &&
        i.rarity <= 4 &&
        !i.id.startsWith('unique-'),
    );
    if (choices.length)
      this.addItem(choices[Math.floor(this.simulation!.random() * choices.length)].id);
  }
  interact() {
    if (this.view.paused || !this.campaign || !['playing', 'town', 'hub'].includes(this.view.phase))
      return;
    const p = this.world.player;
    const obj = nearestInteraction(this.world);
    if (!obj) return;
    const room = this.world.rooms.find((r) => r.id === obj.room);
    if (obj.type === 'npc') {
      this.talk(obj.data!);
      return;
    }
    if (obj.type === 'chest') {
      if (this.world.enemies.some((a) => !a.dead && a.room === obj.room)) {
        this.toast(txt('Sichere erst den Raum.', 'Secure the room first.'));
        return;
      }
      obj.active = false;
      this.randomLoot();
      if (obj.data === 'boss') this.randomLoot();
      this.campaign.runScrap += this.world.modifiers?.includes('scarcity') ? 35 : 20;
      this.progress('chest');
    }
    if (obj.type === 'fountain') {
      obj.active = this.view.phase === 'town';
      p.hp = this.world.modifiers?.includes('scarcity')
        ? Math.min(p.maxHp, p.hp + p.maxHp * 0.5)
        : p.maxHp;
      this.simulation!.resource = this.simulation!.stats.maxResource;
      this.audio.play('heal');
      this.toast(
        txt('Leben und Ressource wiederhergestellt.', 'Health and resource restored.'),
        'success',
      );
    }
    if (obj.type === 'terminal') {
      if (this.view.phase === 'town') {
        const city = CITIES.find((s) => s.id === this.view.cityId)!;
        this.showDialog(
          {
            speaker: city.name[this.view.lang],
            title: txt('Stimmen der Stadt', 'Voices of the city'),
            lines: city.ambientLines,
            choices: [{ id: 'continue', label: txt('Weiter erkunden', 'Keep exploring') }],
          },
          () => this.closePanel(),
        );
        return;
      }
      const scene = STORY_CHAPTERS.find((c) => c.floor === this.world.floor)?.scenes.find(
        (s) => s.id === obj.data,
      );
      if (scene) {
        const c = this.campaign;
        c.choices[`seen:${scene.id}`] = 'read';
        const recorded = scene.choices.find((v) => v.id === c.choices[scene.id]);
        this.showDialog(
          {
            speaker: scene.speaker,
            title: scene.title,
            lines: [...scene.lines, ...(recorded ? [recorded.consequence] : [])],
            choices: recorded
              ? [{ id: 'continue', label: txt('Erinnerung schließen', 'Close memory') }]
              : scene.choices.map((v) => ({ id: v.id, label: v.label })),
          },
          (id) => {
            const selected = scene.choices.find((v) => v.id === id);
            if (!recorded && !selected) return;
            if (selected) this.applyNarrativeChoice(scene.id, selected);
            obj.active = false;
            this.progress('terminal', 1, undefined, true);
            this.closePanel();
          },
        );
      } else if (obj.data === 'story') {
        this.showDialog(
          {
            speaker: 'NIX',
            title: FLOORS[this.world.floor - 1].name,
            lines: [FLOORS[this.world.floor - 1].story],
            choices: [{ id: 'continue', label: txt('Fragment archivieren', 'Archive fragment') }],
          },
          () => {
            obj.active = false;
            this.progress('terminal', 1, undefined, true);
            const key = `fragment-${this.world.floor}`;
            if (!this.campaign!.choices[key]) {
              this.campaign!.choices[key] = 'archived';
              this.campaign!.marks++;
            }
            this.closePanel();
          },
        );
      } else {
        obj.active = false;
        this.progress('terminal');
        if (
          room?.kind === 'puzzle' &&
          !this.world.objects.some((o) => o.room === room.id && o.type === 'terminal' && o.active)
        ) {
          this.progress('puzzle');
          room.cleared = true;
          this.toast(
            txt(
              'Mechanismus gelöst. Der Wartungsweg ist frei.',
              'Mechanism solved. The maintenance route is open.',
            ),
            'success',
          );
        } else
          this.toast(
            txt(
              'Leitung aktiv. Aktiviere die übrigen Leitungen dieses Raumes.',
              'Conduit active. Activate the remaining conduits in this room.',
            ),
          );
      }
    }
    if (obj.type === 'shrine') {
      if (this.view.phase === 'town') {
        if (obj.data === 'shop' || obj.data === 'craft') this.openPanel(obj.data);
        return;
      }
      if (obj.data === 'hunt' && room) {
        obj.active = false;
        this.simulation!.spawnRoom(room);
        this.toast(
          txt(
            'Jagdvertrag angenommen. Viel Glück vor laufender Kamera.',
            'Bounty accepted. Good luck on camera.',
          ),
        );
      } else
        this.showDialog(
          {
            speaker: 'SERA',
            title: txt('Ein Angebot des Senders', 'An offer from the broadcaster'),
            lines: [
              txt(
                'Ein Verstärker für dich. Eine weitere Unterschrift für uns. Du darfst auch einfach Nein sagen.',
                'An amplifier for you. Another signature for us. You may simply say no.',
              ),
            ],
            choices: [
              {
                id: 'accept',
                label: txt(
                  'Annehmen: +Schrott, nächste Begegnung schwerer',
                  'Accept: +scrap, harder next encounter',
                ),
              },
              { id: 'decline', label: txt('Ablehnen: +Archivmarke', 'Decline: +archive mark') },
            ],
          },
          (id) => {
            obj.active = false;
            this.campaign!.choices[obj.id] = id;
            if (id === 'accept') {
              this.campaign!.runScrap += 75;
              this.world.contractBoost = true;
            } else this.campaign!.marks++;
            this.closePanel();
          },
        );
    }
    if (obj.type === 'exit') {
      if (this.view.phase === 'town') {
        this.leaveCity();
        return;
      }
      if (!this.world.bossKilled || !this.world.guardianKilled) {
        this.toast(
          txt(
            'Besiege Hauptboss und Floorwächter, um die Schleuse zu öffnen.',
            'Defeat the main boss and floor guardian to open the airlock.',
          ),
        );
        return;
      }
      this.completeFloor();
    }
    this.dirty++;
    this.emit();
    void this.persist();
  }
  private completeFloor() {
    const c = this.campaign!;
    const floor = this.world.floor;
    this.progress('exit');
    const missing = QUESTS.find(
      (q) =>
        q.floor === floor &&
        q.category === 'main' &&
        q.objective !== 'exit' &&
        (c.questProgress[q.id]?.count ?? 0) < q.target,
    );
    if (missing) {
      this.toast(
        txt(
          `Vor der Schleuse: ${missing.description.de}`,
          `Before leaving: ${missing.description.en}`,
        ),
      );
      return;
    }
    for (const q of QUESTS.filter((q) => q.floor === floor)) {
      const state = c.questProgress[q.id];
      if (state && !state.confirmed && state.count >= q.target) {
        state.confirmed = true;
        c.marks += q.reward;
        if (q.category === 'side') {
          const side = QUESTS.filter((v) => v.floor === floor && v.category === 'side').indexOf(q);
          if (side < 2)
            this.addItem(`unique-quest-${String((floor - 1) * 2 + side + 1).padStart(2, '0')}`);
        }
      }
    }
    const first = !c.completedFloors.includes(floor);
    if (first) {
      c.completedFloors.push(floor);
      c.floorUnlocked = Math.min(12, Math.max(c.floorUnlocked, floor + 1));
      c.actUnlocked = Math.max(c.actUnlocked, Math.min(4, Math.floor(floor / 3) + 1));
      c.mastery = Math.min(15, c.mastery + 1);
      c.marks += 5;
    }
    c.scrap += c.runScrap;
    c.runScrap = 0;
    c.unbanked = [];
    c.world = null;
    this.bankCityQuests();
    c.choices[`aftermath-${floor}`] = 'read';
    if (floor === 10) c.choices.lea = 'rescued';
    const chapter = STORY_CHAPTERS.find((s) => s.floor === floor);
    this.dirty++;
    if (floor === 12) {
      this.showDialog(
        {
          speaker: 'NIX',
          title: txt('Wem gehört morgen?', 'Who owns tomorrow?'),
          lines: [
            ...(chapter?.aftermath ?? []),
            ...this.personalAftermath(),
            txt(
              'Die Regie ist still. Zum ersten Mal kannst du entscheiden, ohne dass jemand die Antwort geschnitten hat.',
              'The control room is quiet. For the first time, you can choose without someone editing the answer.',
            ),
            txt(
              'Befreie die Archive, übernimm die Regie oder verhandle einen neuen Vertrag. Jede Entscheidung hat einen Preis.',
              'Free the archives, take control, or negotiate a new contract. Every choice has a cost.',
            ),
          ],
          choices: [
            { id: 'liberate', label: txt('Die Archive befreien', 'Liberate the archives') },
            { id: 'control', label: txt('Die Regie übernehmen', 'Take control') },
            {
              id: 'negotiate',
              label: txt('Einen neuen Vertrag aushandeln', 'Negotiate a new contract'),
            },
          ],
        },
        (id) => this.chooseEnding(id),
      );
      void this.persist();
      return;
    }
    this.showDialog(
      {
        speaker: 'SERA',
        title: txt('Fortschritt bestätigt', 'Progress confirmed'),
        lines: [
          txt(
            `Floor ${floor} abgeschlossen. Story, Beute und ${c.marks} Archivmarken sind gesichert.`,
            `Floor ${floor} complete. Story, loot and ${c.marks} archive marks are secured.`,
          ),
          ...(chapter?.aftermath ?? [FLOORS[floor - 1].story]),
        ],
        choices: [
          { id: 'next', label: txt('Zum nächsten Floor', 'Continue to next floor') },
          { id: 'town', label: txt('In die Stadt zurückkehren', 'Return to the city') },
          { id: 'hub', label: txt('Zurück zum Zufluchtshub', 'Return to the refuge hub') },
        ],
      },
      (id) => {
        this.closePanel();
        if (id === 'next') this.enterFloor(Math.min(12, floor + 1));
        else if (id === 'town')
          this.visitCity([...CITIES].reverse().find((s) => s.unlockFloor <= c.floorUnlocked)!.id);
        else this.returnHub();
      },
    );
    void this.persist();
    void this.sync();
  }
  private showDialog(dialog: Dialog, handler: (id: string) => void) {
    this.view.dialog = dialog;
    this.dialogHandler = handler;
    this.openPanel('dialog');
  }
  chooseDialog(id: string) {
    if (this.dialogHandler) {
      if (!this.view.dialog?.choices.some((c) => c.id === id)) return;
      const handler = this.dialogHandler;
      this.dialogHandler = null;
      handler(id);
      this.emit();
      void this.persist();
    } else if (NPCS.some((n) => n.id === id)) this.talk(id);
  }
  npcAvailable(npcId: string) {
    const c = this.campaign;
    if (!c || npcId === 'veyl') return false;
    if (
      this.view.phase === 'town' &&
      CITIES.find((s) => s.id === this.view.cityId)?.npcIds.includes(npcId)
    )
      return true;
    const threshold: Record<string, number> = {
      nix: 0,
      tam: 0,
      ilya: 0,
      mira: 2,
      sera: 3,
      zuv: 4,
      rhea: 6,
      oris: 6,
      enno: 7,
    };
    return (
      threshold[npcId] !== undefined &&
      (threshold[npcId] === 0 || c.completedFloors.includes(threshold[npcId]))
    );
  }
  talk(npcId: string) {
    const c = this.campaign,
      npc = NPCS.find((n) => n.id === npcId);
    if (!c || !npc || !this.npcAvailable(npcId)) return;
    if (this.view.phase === 'town' && !this.nearQuestGiver(npcId)) return;
    c.discovered = Array.from(new Set([...c.discovered, npcId]));
    const stage = Math.min(npc.lines.length - 1, Math.max(0, c.floorUnlocked - 1));
    if (this.view.phase === 'town') {
      this.view.questGiver = npcId;
      this.progress('talk', 1, npcId);
    }
    const quest = QUESTS.find(
      (q) =>
        q.category === 'relationship' &&
        q.npc === npcId &&
        q.floor <= c.floorUnlocked &&
        !c.questProgress[q.id]?.confirmed,
    );
    this.showDialog(
      {
        speaker: npc.name,
        title: quest?.name ?? npc.role,
        lines: [
          npc.lines[stage] ?? npc.lines[0],
          quest?.description ?? npc.description,
          txt(
            'Ein ehrliches Gespräch ist hier eine kleine Form von Widerstand.',
            'An honest conversation is a small act of resistance here.',
          ),
        ],
        choices: [
          { id: 'trust', label: txt('Zuhören und Hilfe anbieten', 'Listen and offer help') },
          {
            id: 'practical',
            label: txt('Nach dem nächsten Schritt fragen', 'Ask about the next step'),
          },
          { id: 'leave', label: txt('Bis später', 'See you later') },
          ...(this.view.phase === 'town'
            ? [{ id: 'contracts', label: txt('Nach Aufträgen fragen', 'Ask about contracts') }]
            : []),
        ],
      },
      (id) => {
        if (id === 'contracts') {
          this.closePanel();
          this.openQuestBoard(npcId);
          return;
        }
        if (id !== 'leave') {
          c.relationships[npc.id] = Math.min(100, (c.relationships[npc.id] ?? 0) + 1);
          this.progress('talk', 1, npc.id);
          this.toast(
            id === 'trust'
              ? txt(
                  `${npc.name} vertraut dir ein wenig mehr.`,
                  `${npc.name} trusts you a little more.`,
                )
              : txt(FLOORS[c.floorUnlocked - 1].story.de, FLOORS[c.floorUnlocked - 1].story.en),
          );
        }
        this.closePanel();
      },
    );
  }
  chooseEnding(id: string) {
    if (id === 'takeover') id = 'control';
    if (!['liberate', 'control', 'negotiate'].includes(id) || !this.campaign) return;
    this.campaign.ending = id;
    this.campaign.choices.ending = id;
    this.campaign.choices.refuge = 'epilogue';
    this.campaign.world = null;
    this.view.phase = 'ending';
    this.closePanel();
    this.progress('exit');
    void this.persist();
    void this.sync();
    this.emit();
  }
  personalAftermath() {
    const c = this.campaign;
    if (!c) return [];
    const union = c.relationships['faction-union'] ?? 50;
    const sponsors = c.relationships['faction-sponsors'] ?? 50;
    return [
      c.choices.lea === 'rescued'
        ? txt(
            'Lea lebt. Im Kesselhafen zählt sie nicht Zuschauer, sondern die Menschen, die tatsächlich aus Wagen Sieben heimgekehrt sind.',
            'Lea is alive. In Boilerhaven she counts the people who actually returned from Carriage Seven, rather than viewers.',
          )
        : txt(
            'Leas Spur bleibt in den ungeschnittenen Aufnahmen. Die Städte führen die Suche weiter, auch wenn deine eigene Expedition endet.',
            'Lea’s trail remains in the unedited recordings. The cities continue searching even when your own expedition ends.',
          ),
      union >= sponsors
        ? txt(
            'Die Reparaturteams tragen deine Vereinbarungen in die Städte. Niemand darf erneut aus einem Fluchtweg eine Bewerbung machen.',
            'The repair crews carry your agreements into the cities. Nobody may turn an escape route into an audition again.',
          )
        : txt(
            'Die Sponsoren unterzeichnen überprüfbare Pflichten. Oris weiß, dass die Städte jetzt ihre eigenen Kopien der Verträge behalten.',
            'The sponsors sign auditable obligations. Oris knows the cities now retain their own copies of the contracts.',
          ),
    ];
  }
  equip(uid: string) {
    const c = this.campaign;
    if (!c) return;
    const instance = c.inventory.find((i) => i.uid === uid) ?? c.stash.find((i) => i.uid === uid);
    if (!instance) return;
    const def = ITEMS.find((i) => i.id === instance.defId);
    if (!def) return;
    if (!c.inventory.includes(instance)) {
      if (c.inventory.length >= 24) return;
      c.stash = c.stash.filter((i) => i.uid !== uid);
      c.inventory.push(instance);
    }
    if (def.kind === 'gear' && def.slot)
      c.equipment[def.slot] = c.equipment[def.slot] === uid ? null : uid;
    else if (def.kind === 'relic') {
      if (c.relics.includes(uid)) c.relics = c.relics.filter((x) => x !== uid);
      else if (c.relics.length < 2) c.relics.push(uid);
      else c.relics = [c.relics[1], uid];
    }
    this.simulation?.recalculate();
    this.dirty++;
    this.emit();
    void this.persist();
  }
  toggleFavorite(uid: string) {
    const c = this.campaign,
      item = c?.inventory.find((i) => i.uid === uid) ?? c?.stash.find((i) => i.uid === uid);
    if (!c || !item) return;
    item.favorite = !item.favorite;
    this.dirty++;
    this.emit();
    void this.persist();
  }
  moveStash(uid: string, target: 'stash' | 'inventory') {
    const c = this.campaign;
    if (!c || !['hub', 'town'].includes(this.view.phase)) return;
    const source = target === 'stash' ? c.inventory : c.stash,
      destination = target === 'stash' ? c.stash : c.inventory,
      item = source.find((i) => i.uid === uid);
    if (
      !item ||
      Object.values(c.equipment).includes(uid) ||
      c.relics.includes(uid) ||
      destination.length >= (target === 'stash' ? 200 : 24)
    )
      return;
    destination.push(item);
    if (target === 'stash') c.inventory = source.filter((i) => i.uid !== uid);
    else c.stash = source.filter((i) => i.uid !== uid);
    this.dirty++;
    this.emit();
    void this.persist();
  }
  salvage(uid: string) {
    const c = this.campaign,
      item = c?.inventory.find((i) => i.uid === uid) ?? c?.stash.find((i) => i.uid === uid);
    if (
      !c ||
      !item ||
      item.favorite ||
      Object.values(c.equipment).includes(uid) ||
      c.relics.includes(uid) ||
      (c.stash.includes(item) && !['hub', 'town'].includes(this.view.phase))
    )
      return;
    const def = ITEMS.find((d) => d.id === item.defId);
    if (!def || def.kind === 'key') return;
    const value = Math.ceil(def.price * 0.35) * item.quantity;
    if (c.unbanked.includes(uid)) c.runScrap += value;
    else c.scrap += value;
    c.inventory = c.inventory.filter((i) => i.uid !== uid);
    c.stash = c.stash.filter((i) => i.uid !== uid);
    c.unbanked = c.unbanked.filter((i) => i !== uid);
    this.dirty++;
    this.emit();
    void this.persist();
  }
  useItem(uid: string) {
    const c = this.campaign,
      item = c?.inventory.find((i) => i.uid === uid);
    const def = ITEMS.find((d) => d.id === item?.defId);
    if (!c || !item || !def || def.kind !== 'consumable') return;
    if (!this.simulation?.useConsumable(def)) return;
    if (--item.quantity <= 0) {
      c.inventory = c.inventory.filter((i) => i.uid !== uid);
      c.unbanked = c.unbanked.filter((i) => i !== uid);
    }
    this.dirty++;
    this.emit();
    void this.persist();
  }
  private rebuildShop() {
    const f = this.campaign?.floorUnlocked ?? 1;
    this.view.shop = ITEMS.filter(
      (i) =>
        i.floor <= f &&
        i.floor >= Math.max(1, f - 2) &&
        i.kind !== 'key' &&
        i.rarity <= 3 &&
        !i.id.startsWith('unique'),
    )
      .filter((_, i) => i % 7 === 0)
      .slice(0, 16)
      .map((i) => i.id);
  }
  shopPrice(id: string) {
    const base = ITEMS.find((i) => i.id === id)?.price ?? 0;
    const reputation = this.campaign?.relationships['faction-sponsors'] ?? 50;
    return Math.ceil(base * (1 - (reputation - 50) / 500));
  }
  craftPrice(id: string) {
    const base = RECIPES.find((i) => i.id === id)?.cost ?? 0;
    const reputation = this.campaign?.relationships['faction-union'] ?? 50;
    return Math.ceil(base * (1 - (reputation - 50) / 500));
  }
  buy(id: string) {
    const c = this.campaign,
      item = ITEMS.find((i) => i.id === id);
    if (!c || !item || !['hub', 'town'].includes(this.view.phase) || !this.view.shop.includes(id))
      return;
    const price = this.shopPrice(id);
    if (c.scrap < price) {
      this.toast(txt('Nicht genug Schrott.', 'Not enough scrap.'));
      return;
    }
    if (c.inventory.length >= 24) {
      this.toast(txt('Rucksack ist voll.', 'Your backpack is full.'));
      return;
    }
    c.scrap -= price;
    this.addItem(id);
    void this.persist();
  }
  craft(id: string) {
    const c = this.campaign,
      recipe = RECIPES.find((r) => r.id === id);
    if (
      !c ||
      !recipe ||
      !['hub', 'town'].includes(this.view.phase) ||
      recipe.floor > c.floorUnlocked
    )
      return;
    const price = this.craftPrice(id);
    if (c.scrap < price || c.inventory.length >= 24) {
      this.toast(
        txt(
          'Es fehlt Schrott oder ein freier Rucksackplatz.',
          'You need more scrap or an empty backpack slot.',
        ),
      );
      return;
    }
    c.scrap -= price;
    this.addItem(recipe.item);
    void this.persist();
  }
  learnTalent(id: string) {
    const c = this.campaign,
      cls = CLASSES.find((k) => k.id === c?.classId);
    if (
      !c ||
      !cls?.talents.some((t) => t.id === id) ||
      c.talents.includes(id) ||
      c.talents.length >= Math.min(10, c.level - 1)
    )
      return;
    c.talents.push(id);
    this.simulation?.recalculate();
    this.dirty++;
    this.emit();
    void this.persist();
  }
  respec() {
    const c = this.campaign;
    if (!c || !['hub', 'town'].includes(this.view.phase) || !c.talents.length || c.marks < 25)
      return;
    c.marks -= 25;
    c.talents = [];
    this.simulation?.recalculate();
    this.dirty++;
    this.emit();
    void this.persist();
  }
  setSpecialization(index: number) {
    if (!this.campaign || this.campaign.level < 5 || ![0, 1].includes(index)) return;
    this.campaign.specialization = index;
    this.simulation?.recalculate();
    this.dirty++;
    this.emit();
    void this.persist();
  }
  chooseSkill(slot: number, id: string) {
    const c = this.campaign,
      cls = CLASSES.find((k) => k.id === c?.classId);
    if (!c || ![0, 1].includes(slot) || !cls?.abilities.some((a) => a.id === id)) return;
    c.skills[slot] = id;
    this.emit();
    void this.persist();
  }
  private async persist() {
    if (!this.campaign) return;
    if (this.saving) {
      this.pendingSave = true;
      return;
    }
    this.saving = true;
    this.campaign.updatedAt = Math.max(Date.now(), this.campaign.updatedAt + 1);
    if (this.view.phase === 'playing' && this.campaign.world !== null) {
      if (this.simulation) this.world.combat = this.simulation.combatState();
      this.campaign.world = this.world;
    }
    this.view.saveStatus = 'saving';
    try {
      await saveCampaign(this.campaign);
      this.view.saveStatus = 'saved';
      await this.refreshSlots();
      this.dirty++;
    } catch (e) {
      this.view.saveStatus = 'error';
      if (e instanceof ConcurrentSaveError) {
        this.view.paused = true;
        this.toast(
          txt(
            'Dieser Spielstand wurde in einem anderen Tab geändert. Lade ihn erneut oder exportiere deine Version.',
            'This save changed in another tab. Reload it or export your version.',
          ),
          'error',
        );
      } else
        this.toast(
          txt(
            'Speichern fehlgeschlagen. Bitte Spielstand exportieren.',
            'Saving failed. Please export your save.',
          ),
          'error',
        );
    } finally {
      this.saving = false;
      this.emit();
      if (this.pendingSave) {
        this.pendingSave = false;
        void this.persist();
      }
    }
  }
  exportSave() {
    if (!this.campaign) return;
    const blob = new Blob([JSON.stringify(this.campaign)], { type: 'application/json' }),
      url = URL.createObjectURL(blob),
      a = document.createElement('a');
    a.href = url;
    a.download = `broadcast-${this.campaign.slot + 1}-${Date.now()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
  async importSave(file: File) {
    try {
      if (file.size > 256 * 1024) throw new Error();
      const data = JSON.parse(await file.text());
      if (
        !validCampaign(data) ||
        !CLASSES.some((c) => c.id === data.classId) ||
        data.inventory.some((i: ItemInstance) => !ITEMS.some((d) => d.id === i.defId))
      )
        throw new Error();
      await saveCampaign(data, true);
      await this.loadSlot(data.slot);
    } catch {
      this.toast(errors.invalid_save, 'error');
    }
  }
  async deleteSlot(slot: number) {
    await removeSave(slot);
    if (this.view.account.username)
      try {
        await api(`saves?slot=${slot}`, 'DELETE');
      } catch {
        this.toast(errors.unavailable, 'error');
      }
    this.view.slots = await allSaves();
    if (this.campaign?.slot === slot) {
      this.campaign = null;
      this.simulation = null;
      this.view.phase = 'title';
    }
    this.emit();
  }
  async auth(username: string, password: string, mode: 'login' | 'register') {
    try {
      const account = await api<{ username: string }>(`auth/${mode}`, 'POST', {
        username,
        password,
      });
      this.view.account = {
        username: account.username,
        available: true,
        status: 'local',
        message: '',
      };
      this.cloudRevisions = {};
      this.cloudSlots = [];
      this.mutation = null;
      await this.refreshSlots(true);
      if (this.campaign) {
        try {
          const cloud = await api<CloudSave>(`saves?slot=${this.campaign.slot}`);
          this.cloudRevisions[this.campaign.slot] = cloud.revision;
          if (!sameCampaign(cloud.campaign, this.campaign))
            this.view.account = {
              ...this.view.account,
              status: 'conflict',
              conflict: {
                local: structuredClone(this.campaign),
                cloud: cloud.campaign,
                revision: cloud.revision,
              },
            };
        } catch (e) {
          if (e instanceof ApiError && e.status === 404)
            this.cloudRevisions[this.campaign.slot] = 0;
          else throw e;
        }
        if (this.view.account.status !== 'conflict') await this.sync();
      }
      this.toast(
        txt(`Angemeldet als ${account.username}`, `Signed in as ${account.username}`),
        'success',
      );
      this.emit();
    } catch (e) {
      const error =
        e instanceof ApiError ? (errors[e.code] ?? errors.unavailable) : errors.unavailable;
      this.view.account.message = error[this.view.lang];
      this.emit();
      throw new Error(error[this.view.lang]);
    }
  }
  async logout() {
    await api('auth/logout', 'POST', {});
    this.view.account = { username: null, available: true, status: 'local', message: '' };
    this.cloudRevisions = {};
    this.cloudSlots = [];
    this.mutation = null;
    await this.refreshSlots();
    this.emit();
  }
  async deleteAccount() {
    await api('account', 'DELETE');
    this.view.account = { username: null, available: true, status: 'local', message: '' };
    this.cloudRevisions = {};
    this.cloudSlots = [];
    this.mutation = null;
    await this.refreshSlots();
    this.toast(
      txt(
        'Konto und Cloud-Spielstände gelöscht. Lokale Spielstände bleiben erhalten.',
        'Account and cloud saves deleted. Local saves are retained.',
      ),
      'success',
    );
    this.emit();
  }
  async sync() {
    if (
      !this.campaign ||
      !this.view.account.username ||
      this.cloudBusy ||
      this.view.account.status === 'conflict'
    )
      return;
    this.cloudBusy = true;
    this.view.account.status = 'syncing';
    this.emit();
    if (this.view.phase === 'playing' && this.campaign.world !== null && this.simulation)
      this.campaign.world.combat = this.simulation.combatState();
    try {
      const slot = this.campaign.slot;
      if (this.cloudRevisions[slot] === undefined) {
        try {
          const cloud = await api<CloudSave>(`saves?slot=${slot}`);
          this.cloudRevisions[slot] = cloud.revision;
          if (!sameCampaign(cloud.campaign, this.campaign)) {
            this.view.account = {
              ...this.view.account,
              status: 'conflict',
              conflict: {
                local: structuredClone(this.campaign),
                cloud: cloud.campaign,
                revision: cloud.revision,
              },
            };
            return;
          }
        } catch (e) {
          if (e instanceof ApiError && e.status === 404) this.cloudRevisions[slot] = 0;
          else throw e;
        }
      }
      if (!this.mutation)
        this.mutation = {
          slot,
          revision: this.cloudRevisions[slot],
          id: crypto.randomUUID(),
          campaign: structuredClone(this.campaign),
          dirty: this.dirty,
        };
      const result = await api<{ revision: number }>(`saves?slot=${this.mutation.slot}`, 'PUT', {
        campaign: this.mutation.campaign,
        expectedRevision: this.mutation.revision,
        mutationId: this.mutation.id,
      });
      this.cloudRevisions[this.mutation.slot] = result.revision;
      this.mutation = null;
      this.view.account.status = 'synced';
      this.view.account.message = '';
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        try {
          const cloud = await api<CloudSave>(`saves?slot=${this.campaign.slot}`);
          this.view.account = {
            ...this.view.account,
            status: 'conflict',
            conflict: {
              local: structuredClone(this.campaign),
              cloud: cloud.campaign,
              revision: cloud.revision,
            },
          };
          this.mutation = null;
        } catch {
          this.view.account.status = 'offline';
        }
      } else this.view.account.status = 'offline';
    } finally {
      this.cloudBusy = false;
      this.emit();
    }
  }
  async resolveConflict(choice: 'local' | 'cloud' | 'copy') {
    const conflict = this.view.account.conflict;
    if (!conflict) return;
    this.cloudRevisions[conflict.local.slot] = conflict.revision;
    this.mutation = null;
    if (choice === 'cloud') {
      await saveCampaign(conflict.cloud, true);
      this.attach(conflict.cloud);
      this.view.phase = this.savedPhase(conflict.cloud);
      this.view.cityId = null;
      this.view.questGiver = null;
      if (!conflict.cloud.world) this.restoreRefuge();
    } else if (choice === 'copy') {
      const slots = await allSaves(),
        free = [0, 1, 2].find((s) => !slots.some((x) => x.slot === s));
      if (free === undefined) {
        this.toast(
          txt(
            'Für die Kopie wird ein freier Spielstandplatz benötigt.',
            'You need an empty save slot for the copy.',
          ),
        );
        return;
      }
      const copy = { ...structuredClone(conflict.local), slot: free };
      await saveCampaign(copy);
      await saveCampaign(conflict.cloud, true);
      this.attach(copy);
      this.view.phase = this.savedPhase(copy);
      this.view.cityId = null;
      this.view.questGiver = null;
      if (!copy.world) this.restoreRefuge();
      this.cloudRevisions[free] = 0;
    }
    this.view.account = { ...this.view.account, status: 'local', conflict: undefined };
    this.emit();
    if (choice !== 'cloud') await this.sync();
    await this.persist();
  }
}
export const game = new GameController();
if (import.meta.hot) import.meta.hot.dispose(() => game.destroy());
