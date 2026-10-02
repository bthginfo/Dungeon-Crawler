import { describe, expect, it } from 'vitest';
import { auditDefinitions, auditWorlds, validateQuestGraph } from '../scripts/validate-content';
import { ITEMS, QUEST_PREREQUISITES, QUESTS, RECIPES } from '../src/content';

describe('production content integrity', () => {
  it('verifies counts, bilingual fields, equipment allocation and every cross-reference', () => {
    expect(auditDefinitions()).toMatchObject({
      floors: 12,
      mobs: 96,
      minibosses: 24,
      items: 576,
      quests: 102,
      prefabs: 336,
      encounters: 240,
    });
  });
  it('rejects circular story prerequisites, including cycles beyond the first act', () => {
    const graph = structuredClone(QUEST_PREREQUISITES);
    graph['F03-M01'] = ['F12-M03'];
    expect(() => validateQuestGraph(graph, new Set(QUESTS.map((q) => q.id)))).toThrow(/cycle/);
  });
  it('rejects missing prerequisite targets rather than silently unlocking them', () => {
    const graph = structuredClone(QUEST_PREREQUISITES);
    graph['F01-M02'] = ['unwritten-story'];
    expect(() => validateQuestGraph(graph, new Set(QUESTS.map((q) => q.id)))).toThrow(
      /Unknown prerequisite/,
    );
  });
  it('keeps crafted uniques in their authored floor and makes story keys unobtainable through crafting', () => {
    const crafted = RECIPES.filter((r) => r.id.startsWith('recipe-unique-'));
    expect(crafted).toHaveLength(12);
    for (const r of crafted) {
      const result = ITEMS.find((i) => i.id === r.item)!;
      expect(result.floor).toBe(r.floor);
      expect(result.kind).toBe('gear');
      expect(result.id).toMatch(/^unique-craft-/);
    }
    expect(RECIPES.some((r) => ITEMS.find((i) => i.id === r.item)?.kind === 'key')).toBe(false);
  });
  it('makes every required interaction and encounter reachable across all twelve floors', () => {
    expect(auditWorlds(8).worlds).toBe(96);
  }, 30000);
});
