import type { Campaign } from './types';
function canonical(value: unknown): string {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value !== null && typeof value === 'object')
    return (
      '{' +
      Object.entries(value)
        .filter(([, v]) => v !== undefined)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => JSON.stringify(k) + ':' + canonical(v))
        .join(',') +
      '}'
    );
  return JSON.stringify(value);
}
/** Database JSONB may reorder keys. Wall-clock timestamps never decide ownership. */
export function sameCampaign(a: Campaign, b: Campaign) {
  return canonical({ ...a, updatedAt: 0 }) === canonical({ ...b, updatedAt: 0 });
}
