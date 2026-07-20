type RedisValue = {
  value: unknown;
  expiresAt?: number;
};

const store = new Map<string, RedisValue>();

export async function redisSet<T>(
  key: string,
  value: T,
  ttlSeconds?: number
) {
  store.set(key, {
    value,
    expiresAt: ttlSeconds
      ? Date.now() + ttlSeconds * 1000
      : undefined,
  });

  return true;
}

export async function redisGet<T>(
  key: string
): Promise<T | null> {
  const item =
    store.get(key);

  if (!item) {
    return null;
  }

  if (
    item.expiresAt &&
    Date.now() > item.expiresAt
  ) {
    store.delete(key);

    return null;
  }

  return item.value as T;
}

export async function redisDelete(
  key: string
) {
  return store.delete(key);
}

export async function redisExists(
  key: string
) {
  return store.has(key);
}

export async function redisClear() {
  store.clear();

  return true;
}

export async function redisKeys() {
  return Array.from(
    store.keys()
  );
}