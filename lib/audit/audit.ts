export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "UPLOAD"
  | "SETTINGS_CHANGE";

export interface AuditLog {
  id: string;
  action: AuditAction;
  entity?: string;
  entityId?: string | number;
  userId?: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const logs: AuditLog[] = [];

function generateId() {
  return (
    Date.now().toString(36) +
    Math.random()
      .toString(36)
      .slice(2, 10)
  );
}

export function createAuditLog(
  data: Omit<
    AuditLog,
    "id" | "createdAt"
  >
) {
  const log: AuditLog = {
    id: generateId(),
    createdAt: new Date(),
    ...data,
  };

  logs.unshift(log);

  if (logs.length > 10000) {
    logs.pop();
  }

  return log;
}

export function getAuditLogs() {
  return [...logs];
}

export function getAuditLogsByUser(
  userId: string
) {
  return logs.filter(
    (log) =>
      log.userId === userId
  );
}

export function getAuditLogsByEntity(
  entity: string,
  entityId?: string | number
) {
  return logs.filter(
    (log) =>
      log.entity === entity &&
      (
        !entityId ||
        log.entityId === entityId
      )
  );
}

export function clearAuditLogs() {
  logs.length = 0;
}

export function countAuditLogs(
  action?: AuditAction
) {
  if (!action) {
    return logs.length;
  }

  return logs.filter(
    (log) =>
      log.action === action
  ).length;
}