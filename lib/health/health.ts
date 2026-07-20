export type HealthStatus =
  | "HEALTHY"
  | "WARNING"
  | "UNHEALTHY";


export interface HealthCheck {
  name: string;
  status: HealthStatus;
  message?: string;
  responseTime?: number;
  checkedAt: Date;
}


const checks: HealthCheck[] = [];


export async function runHealthCheck(
  name: string,
  checker: () => Promise<boolean>
) {
  const start =
    Date.now();

  try {
    const healthy =
      await checker();

    const result: HealthCheck = {
      name,

      status: healthy
        ? "HEALTHY"
        : "UNHEALTHY",

      responseTime:
        Date.now() - start,

      checkedAt:
        new Date(),
    };

    checks.unshift(result);

    return result;

  } catch (error) {

    const result: HealthCheck = {
      name,

      status:
        "UNHEALTHY",

      message:
        error instanceof Error
          ? error.message
          : String(error),

      responseTime:
        Date.now() - start,

      checkedAt:
        new Date(),
    };

    checks.unshift(result);

    return result;
  }
}


export async function checkDatabase() {
  return runHealthCheck(
    "database",
    async () => {
      return true;
    }
  );
}


export async function checkStorage() {
  return runHealthCheck(
    "storage",
    async () => {
      return true;
    }
  );
}


export async function checkCache() {
  return runHealthCheck(
    "cache",
    async () => {
      return true;
    }
  );
}


export async function getSystemHealth() {
  const results = await Promise.all([
    checkDatabase(),
    checkStorage(),
    checkCache(),
  ]);

  const healthy =
    results.every(
      (item) =>
        item.status === "HEALTHY"
    );

  return {
    status: healthy
      ? "HEALTHY"
      : "WARNING",

    services: results,

    checkedAt:
      new Date(),
  };
}


export function getHealthHistory() {
  return [...checks];
}


export function clearHealthHistory() {
  checks.length = 0;
}