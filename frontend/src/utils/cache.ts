interface CacheItem<T> {
  data: T;
  expiry: number;
}

const cache = new Map<string, CacheItem<unknown>>();

export function setCache<T>(key: string, data: T, ttlMs: number): void {
  const expiry = Date.now() + ttlMs;
  cache.set(key, { data, expiry });
}

export function getCache<T>(key: string): T | null {
  const item = cache.get(key);
  if (!item) return null;
  
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  
  return item.data as T;
}

export function hasCache(key: string): boolean {
  const item = cache.get(key);
  if (!item) return false;
  
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return false;
  }
  
  return true;
}

export function clearCache(key?: string): void {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}