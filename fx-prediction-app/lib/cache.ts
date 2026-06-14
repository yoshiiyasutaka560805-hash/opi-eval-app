interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

declare global {
  var cacheInstance: Map<string, CacheEntry<unknown>>;
  var apiQuotaInstance: { used: number; limit: number; resetAt: string };
}

function getNextResetTime(): string {
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  return tomorrow.toISOString();
}

if (!global.cacheInstance) {
  global.cacheInstance = new Map();
}
if (!global.apiQuotaInstance) {
  global.apiQuotaInstance = { used: 0, limit: 25, resetAt: getNextResetTime() };
}

const cache = global.cacheInstance;
const quotaStore = global.apiQuotaInstance;

export function getCache<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

export function setCache<T>(key: string, data: T, ttlMs: number): void {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

export function getApiQuota(): { used: number; limit: number; resetAt: string; remaining: number } {
  if (new Date() > new Date(quotaStore.resetAt)) {
    quotaStore.used = 0;
    quotaStore.resetAt = getNextResetTime();
  }
  return { ...quotaStore, remaining: quotaStore.limit - quotaStore.used };
}

export function recordApiCalls(count: number): void {
  if (new Date() > new Date(quotaStore.resetAt)) {
    quotaStore.used = 0;
    quotaStore.resetAt = getNextResetTime();
  }
  quotaStore.used += count;
}

export function canMakeApiCalls(needed: number = 1): boolean {
  const quota = getApiQuota();
  return quota.remaining >= needed;
}
