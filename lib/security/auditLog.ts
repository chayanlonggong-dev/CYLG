export type AuditAction =
  | "LOGIN"
  | "LOGOUT"
  | "CREATE_MODEL"
  | "UPDATE_MODEL"
  | "DELETE_MODEL"
  | "UPDATE_SETTINGS"
  | "UPLOAD_FILE"
  | "SYSTEM";

export interface AuditLog {
  id: string;
  action: AuditAction;
  message: string;
  ip?: string;
  user?: string;
  createdAt: Date;
}

const logs: AuditLog[] = [];

function generateId() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 10)
  );
}

export function writeAuditLog(
  action: AuditAction,
  message: string,
  options?: {
    ip?: string;
    user?: string;
  }
) {
  const log: AuditLog = {
    id: generateId(),
    action,
    message,
    ip: options?.ip,
    user: options?.user,
    createdAt: new Date(),
  };

  logs.unshift(log);

  if (logs.length > 1000) {
    logs.pop();
  }

  return log;
}

export function getAuditLogs() {
  return [...logs];
}

export function clearAuditLogs() {
  logs.length = 0;
}

export function getLatestAuditLogs(limit = 20) {
  return logs.slice(0, limit);
}