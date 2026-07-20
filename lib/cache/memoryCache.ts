type CacheItem<T> = {
  value: T;
  expiresAt: number;
};

const cache = new Map<string, CacheItem<unknown>>();

export function setCache<T>(
  key: string,
  value: T,
  ttlSeconds = 60
) {
  cache.set(key, {
    value,
    expiresAt:
      Date.now() + ttlSeconds * 1000,
  });
}

export function getCache<T>(
  key: string
): T | null {
  const item = cache.get(key);

  if (!item) {
    return null;
  }

  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    return null;
  }

  return item.value as T;
}

export function hasCache(
  key: string
) {
  return getCache(key) !== null;
}

export function deleteCache(
  key: string
) {
  cache.delete(key);
}

export function clearCache() {
  cache.clear();
}

export function cacheSize() {
  return cache.size;
}

export function cleanupExpiredCache() {
  const now = Date.now();

  for (const [key, item] of cache.entries()) {
    if (item.expiresAt <= now) {
      cache.delete(key);
    }
  }
}