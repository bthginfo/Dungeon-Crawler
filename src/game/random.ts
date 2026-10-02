/** Independent reproducible random streams. Never use Math.random in the simulation. */
export function nextRandom(seed: number): number {
  let x = seed >>> 0 || 0x9e3779b9;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return x >>> 0;
}
export function rng(seed: number) {
  let state = seed >>> 0;
  return {
    next() {
      state = nextRandom(state);
      return state / 4294967296;
    },
    int(max: number) {
      return Math.floor(this.next() * max);
    },
    get state() {
      return state;
    },
  };
}
export function hashSeed(text: string) {
  let h = 2166136261;
  for (const c of text) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}
