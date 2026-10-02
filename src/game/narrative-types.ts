import type { Text } from './types';

export interface OriginDef {
  id: string;
  name: Text;
  profession: Text;
  description: Text;
  opening: Text[];
  personalGoal: Text;
  keepsake: Text;
}
export interface CityDef {
  id: string;
  name: Text;
  tagline: Text;
  description: Text;
  unlockFloor: number;
  materialFloor: number;
  npcIds: string[];
  districts: { name: Text; kind: 'market' | 'residential' | 'archive' | 'gate' }[];
  ambientLines: Text[];
}
export interface NarrativeChoice {
  id: string;
  label: Text;
  consequence: Text;
  faction: 'union' | 'residents' | 'archive' | 'sponsors';
  reputation: number;
  scrap?: number;
  marks?: number;
}
export interface CityQuestDef {
  id: string;
  cityId: string;
  giver: string;
  name: Text;
  description: Text;
  briefing: Text[];
  objective: 'talk' | 'kills' | 'terminal' | 'hunt' | 'chest' | 'boss' | 'puzzle' | 'delivery';
  target: number;
  floor: number;
  targetNpc?: string;
  requires?: string[];
  reward: { scrap: number; marks: number; itemId?: string };
  conclusion: Text[];
  choices?: NarrativeChoice[];
}
export interface StoryScene {
  id: string;
  title: Text;
  speaker: string;
  lines: Text[];
  choices: NarrativeChoice[];
}
export interface StoryChapter {
  floor: number;
  title: Text;
  arrival: Text[];
  scenes: StoryScene[];
  aftermath: Text[];
}
