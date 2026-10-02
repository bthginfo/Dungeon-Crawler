import { CLASSES, ITEMS } from '../content';
import type { Campaign } from './types';
export function createCampaign(classId: string, name: string, slot = 0): Campaign {
  const cls = CLASSES.find((c) => c.id === classId) ?? CLASSES[0];
  const now = Date.now();
  const c: Campaign = {
    schema: 1,
    slot,
    name: name.trim().slice(0, 24) || 'Crawler',
    classId: cls.id,
    level: 1,
    xp: 0,
    mastery: 1,
    floorUnlocked: 1,
    actUnlocked: 1,
    completedFloors: [],
    scrap: 180,
    marks: 0,
    inventory: [],
    stash: [],
    equipment: {
      weapon: null,
      offhand: null,
      head: null,
      body: null,
      hands: null,
      feet: null,
      amulet: null,
      talisman: null,
    },
    relics: [],
    talents: [],
    specialization: -1,
    skills: cls.abilities.slice(0, 2).map((a) => a.id),
    questProgress: {},
    discovered: ['nix'],
    relationships: {},
    choices: {},
    ending: null,
    world: null,
    updatedAt: now,
    createdAt: now,
    run: 0,
    runScrap: 0,
    unbanked: [],
    acceptedQuests: [],
    completedCityQuests: [],
    cityQuestBank: {},
  };
  const starter =
    ITEMS.find((i) => i.kind === 'gear' && i.slot === 'weapon' && i.floor === 1 && i.rarity < 3) ??
    ITEMS.find((i) => i.slot === 'weapon');
  const potion =
    ITEMS.find(
      (i) =>
        i.kind === 'consumable' && i.floor === 1 && ['healing', 'maxHp', 'regen'].includes(i.stat),
    ) ?? ITEMS.find((i) => i.kind === 'consumable');
  if (starter) {
    c.inventory.push({
      uid: 'starter-weapon',
      defId: starter.id,
      level: 1,
      affixes: [],
      favorite: true,
      quantity: 1,
    });
    c.equipment.weapon = 'starter-weapon';
  }
  if (potion)
    c.inventory.push({
      uid: 'starter-potion',
      defId: potion.id,
      level: 1,
      affixes: [],
      favorite: false,
      quantity: 5,
    });
  return c;
}
