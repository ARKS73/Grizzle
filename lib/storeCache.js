// In-Memory Fast Cache for Store API routes (Products & Categories)
const cacheStore = new Map();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL

export function getCachedData(key) {
  const item = cacheStore.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    cacheStore.delete(key);
    return null;
  }
  return item.data;
}

export function setCachedData(key, data, ttlMs = CACHE_TTL_MS) {
  cacheStore.set(key, {
    data,
    expiry: Date.now() + ttlMs,
  });
}

export function clearStoreCache() {
  cacheStore.clear();
}
