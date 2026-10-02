import type { Campaign } from './types';
export class ApiError extends Error {
  constructor(
    public code: string,
    public status: number,
    public data: Record<string, unknown> = {},
  ) {
    super(code);
  }
}
export async function api<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const response = await fetch(`/api/${path}`, {
    method,
    credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15000),
  });
  const data = await response.json().catch(() => ({ code: 'unavailable' }));
  if (!response.ok) throw new ApiError(data.code ?? 'unavailable', response.status, data);
  return data as T;
}
export interface CloudSave {
  campaign: Campaign;
  revision: number;
}
