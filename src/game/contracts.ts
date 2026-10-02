import { CITIES, CITY_QUESTS } from '../content';
import type { Campaign, QuestDef } from './types';
import type { NarrativeChoice } from './narrative-types';

export type ContractStatus = 'locked' | 'available' | 'active' | 'ready' | 'completed';
export function contractStatus(c: Campaign, id: string): ContractStatus {
  const q = CITY_QUESTS.find((q) => q.id === id);
  if (!q) return 'locked';
  if (c.completedCityQuests?.includes(id)) return 'completed';
  if (c.acceptedQuests?.includes(id))
    return (c.questProgress[id]?.count ?? 0) >= q.target ? 'ready' : 'active';
  const city = CITIES.find((s) => s.id === q.cityId)!;
  return city.unlockFloor > c.floorUnlocked ||
    q.requires?.some((p) => !c.completedCityQuests?.includes(p))
    ? 'locked'
    : 'available';
}
export function acceptContract(c: Campaign, id: string) {
  if (contractStatus(c, id) !== 'available') return false;
  c.acceptedQuests = [...(c.acceptedQuests ?? []), id];
  c.questProgress[id] = { count: 0, confirmed: false };
  c.cityQuestBank ??= {};
  c.cityQuestBank[id] = 0;
  return true;
}
export function progressContracts(
  c: Campaign,
  event: {
    objective: QuestDef['objective'];
    amount: number;
    floor: number;
    town: boolean;
    cityId: string | null;
    npc?: string;
    storyTerminal?: boolean;
  },
) {
  const ready = [];
  for (const q of CITY_QUESTS) {
    if (
      !c.acceptedQuests?.includes(q.id) ||
      c.completedCityQuests?.includes(q.id) ||
      q.objective !== event.objective
    )
      continue;
    if (q.objective === 'terminal' && !event.storyTerminal) continue;
    if (
      event.objective === 'talk'
        ? !event.town || q.targetNpc !== event.npc || event.cityId !== q.cityId
        : event.town || q.floor !== event.floor
    )
      continue;
    const previous = c.questProgress[q.id]?.count ?? 0;
    c.questProgress[q.id] = {
      count: Math.min(q.target, previous + Math.max(0, Math.floor(event.amount))),
      confirmed: false,
    };
    if (event.objective === 'talk') {
      c.cityQuestBank ??= {};
      c.cityQuestBank[q.id] = c.questProgress[q.id].count;
    }
    if (previous < q.target && c.questProgress[q.id].count >= q.target) ready.push(q);
  }
  return ready;
}
export function bankContracts(c: Campaign) {
  c.cityQuestBank ??= {};
  for (const id of c.acceptedQuests ?? []) c.cityQuestBank[id] = c.questProgress[id]?.count ?? 0;
}
export function rollbackContracts(c: Campaign) {
  for (const id of c.acceptedQuests ?? [])
    if (!c.completedCityQuests?.includes(id))
      c.questProgress[id] = { count: c.cityQuestBank?.[id] ?? 0, confirmed: false };
}
export function applyChoice(c: Campaign, key: string, choice: NarrativeChoice) {
  if (c.choices[key]) return false;
  c.choices[key] = choice.id;
  const faction = `faction-${choice.faction}`;
  c.relationships[faction] = Math.max(
    0,
    Math.min(100, (c.relationships[faction] ?? 50) + choice.reputation),
  );
  if (choice.faction === 'union' || choice.faction === 'sponsors') {
    const rival = `faction-${choice.faction === 'union' ? 'sponsors' : 'union'}`;
    c.relationships[rival] = Math.max(
      0,
      Math.min(100, (c.relationships[rival] ?? 50) - Math.ceil(choice.reputation / 2)),
    );
  }
  c.scrap += choice.scrap ?? 0;
  c.marks += choice.marks ?? 0;
  return true;
}
/** Quest rewards and choices form a single idempotent transaction in the saved campaign. */
export function settleContract(c: Campaign, id: string, choiceId?: string) {
  const q = CITY_QUESTS.find((q) => q.id === id);
  if (!q || contractStatus(c, id) !== 'ready') return null;
  const choice = q.choices?.find((v) => v.id === choiceId);
  if (q.choices?.length && !choice) return null;
  if (choice) applyChoice(c, id, choice);
  else c.choices[id] = 'completed';
  c.completedCityQuests = [...(c.completedCityQuests ?? []), id];
  c.questProgress[id] = { count: q.target, confirmed: true };
  c.cityQuestBank ??= {};
  c.cityQuestBank[id] = q.target;
  c.scrap += q.reward.scrap;
  c.marks += q.reward.marks;
  return { quest: q, choice };
}
