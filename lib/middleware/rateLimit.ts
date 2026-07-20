type RateLimitRecord = {
  count: number;
  resetAt: number;
};

const requests = new Map<string, RateLimitRecord>();

const WINDOW_MS = 60 * 1000;

const MAX_REQUESTS = 120;

export function checkRateLimit(
  identifier: string
) {
  const now = Date.now();

  const record =
    requests.get(identifier);

  if (!record || now >= record.resetAt) {
    requests.set(identifier, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });

    return {
      allowed: true,
      remaining: MAX_REQUESTS - 1,
    };
  }

  record.count++;

  requests.set(
    identifier,
    record
  );

  return {
    allowed:
      record.count <= MAX_REQUESTS,

    remaining: Math.max(
      MAX_REQUESTS - record.count,
      0
    ),

    resetAt: record.resetAt,
  };
}

export function getRateLimitStatus(
  identifier: string
) {
  return (
    requests.get(identifier) ?? {
      count: 0,
      resetAt: Date.now(),
    }
  );
}

export function clearRateLimit() {
  requests.clear();
}

export function cleanupRateLimit() {
  const now = Date.now();

  for (const [
    key,
    record,
  ] of requests.entries()) {
    if (now >= record.resetAt) {
      requests.delete(key);
    }
  }
}