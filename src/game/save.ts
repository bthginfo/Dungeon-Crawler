import Dexie, { type EntityTable } from 'dexie';
import type { Campaign, Lang, Settings } from './types';
import { campaignSchema } from '../shared/validation';
export const SAVE_SCHEMA = 1;
const observed = new Map<number, number>();
export class ConcurrentSaveError extends Error {}
const db = new Dexie('below-the-broadcast') as Dexie & {
  saves: EntityTable<{ slot: number; campaign: Campaign }, 'slot'>;
  backups: EntityTable<{ id: string; slot: number; campaign: Campaign; at: number }, 'id'>;
  prefs: EntityTable<{ id: string; value: unknown }, 'id'>;
};
db.version(1).stores({ saves: 'slot', backups: 'id,slot,at', prefs: 'id' });
export const DEFAULT_SETTINGS: Settings = {
  music: 0.35,
  sound: 0.6,
  shake: true,
  reducedMotion: false,
  highContrast: false,
  autoAttack: false,
  leftHanded: false,
  difficulty: 'standard',
  textScale: 1,
  quality: 'auto',
  bindings: {
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
    inventory: 'KeyI',
    journal: 'KeyJ',
    map: 'KeyM',
    character: 'KeyK',
    pause: 'Escape',
  },
};
export async function saveCampaign(c: Campaign, replace = false) {
  const snapshot = structuredClone(c);
  await db.transaction('rw', db.saves, db.backups, async () => {
    const old = await db.saves.get(c.slot);
    if (!replace && old && observed.has(c.slot) && old.campaign.updatedAt !== observed.get(c.slot))
      throw new ConcurrentSaveError('This slot was changed in another tab.');
    if (old) {
      await db.backups.put({
        id: `${c.slot}-${Date.now()}`,
        slot: c.slot,
        campaign: old.campaign,
        at: Date.now(),
      });
      const previous = await db.backups.where('slot').equals(c.slot).sortBy('at');
      if (previous.length > 3) await db.backups.bulkDelete(previous.slice(0, -3).map((p) => p.id));
    }
    await db.saves.put({ slot: c.slot, campaign: snapshot });
  });
  observed.set(c.slot, snapshot.updatedAt);
}
export async function loadCampaign(slot: number) {
  const record = await db.saves.get(slot);
  if (record) observed.set(slot, record.campaign.updatedAt);
  else observed.delete(slot);
  return record?.campaign ?? null;
}
export async function allSaves() {
  return (await db.saves.toArray()).map((v) => {
    if (!observed.has(v.slot)) observed.set(v.slot, v.campaign.updatedAt);
    return {
      slot: v.slot,
      name: v.campaign.name,
      classId: v.campaign.classId,
      floor: v.campaign.floorUnlocked,
      level: v.campaign.level,
      updatedAt: v.campaign.updatedAt,
    };
  });
}
export async function removeSave(slot: number) {
  await db.transaction('rw', db.saves, db.backups, async () => {
    await db.saves.delete(slot);
    await db.backups.where('slot').equals(slot).delete();
  });
  observed.delete(slot);
}
export async function savePreferences(lang: Lang, settings: Settings) {
  await db.prefs.put({ id: 'preferences', value: { lang, settings } });
}
export async function loadPreferences() {
  return (await db.prefs.get('preferences'))?.value as
    { lang: Lang; settings: Settings } | undefined;
}
export function validCampaign(value: unknown): value is Campaign {
  return campaignSchema.safeParse(value).success;
}
