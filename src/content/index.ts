import type { Lang, Text } from '../game/types';

export const text = (de: string, en: string): Text => ({ de, en });
export const label = (value: Text, language: Lang): string => value[language];

export { CLASSES } from './classes';
export { FLOORS } from './floors';
export { ITEMS, AFFIXES, SETS, RECIPES } from './items';
export { QUESTS, QUEST_PREREQUISITES, QUEST_REWARDS, NPCS, ACTS, ENDINGS, FACTIONS } from './story';
export { ROOM_PREFABS, ENCOUNTERS } from './world';
export { BOSS_VARIANTS, ALL_BOSSES, floorBosses, RUN_MODIFIERS } from './bosses';
export { ORIGINS, CITIES, CITY_QUESTS, STORY_CHAPTERS } from './narrative';
