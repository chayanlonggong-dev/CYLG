type LoginRecord = {
  attempts: number;
  lockedUntil: number;
};

const loginStore = new Map<string, LoginRecord>();

const MAX_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000;

export function canLogin(ip: string) {
  const record = loginStore.get(ip);

  if (!record) {
    return true;
  }

  if (record.lockedUntil <= Date.now()) {
    loginStore.delete(ip);
    return true;
  }

  return false;
}

export function recordFailedLogin(ip: string) {
  const now = Date.now();

  const record = loginStore.get(ip) ?? {
    attempts: 0,
    lockedUntil: 0,
  };

  record.attempts++;

  if (record.attempts >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCK_TIME_MS;
  }

  loginStore.set(ip, record);

  return {
    attempts: record.attempts,
    remaining: Math.max(
      MAX_ATTEMPTS - record.attempts,
      0
    ),
    locked: record.lockedUntil > now,
    lockedUntil: record.lockedUntil,
  };
}

export function recordSuccessfulLogin(ip: string) {
  loginStore.delete(ip);
}

export function getLoginStatus(ip: string) {
  const record = loginStore.get(ip);

  if (!record) {
    return {
      attempts: 0,
      locked: false,
      remaining: MAX_ATTEMPTS,
    };
  }

  return {
    attempts: record.attempts,
    locked: record.lockedUntil > Date.now(),
    remaining: Math.max(
      MAX_ATTEMPTS - record.attempts,
      0
    ),
    lockedUntil: record.lockedUntil,
  };
}

export function clearLoginProtection() {
  loginStore.clear();
}