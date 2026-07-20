export type LogLevel =
  | "debug"
  | "info"
  | "warn"
  | "error";

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: unknown;
}

const logs: LogEntry[] = [];

const MAX_LOGS = 1000;

function write(
  level: LogLevel,
  message: string,
  context?: unknown
) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date(),
    context,
  };

  logs.unshift(entry);

  if (logs.length > MAX_LOGS) {
    logs.pop();
  }

  const method =
    level === "debug"
      ? console.debug
      : level === "info"
      ? console.info
      : level === "warn"
      ? console.warn
      : console.error;

  method(
    `[${entry.timestamp.toISOString()}] [${level.toUpperCase()}] ${message}`,
    context ?? ""
  );

  return entry;
}

export function debug(
  message: string,
  context?: unknown
) {
  return write("debug", message, context);
}

export function info(
  message: string,
  context?: unknown
) {
  return write("info", message, context);
}

export function warn(
  message: string,
  context?: unknown
) {
  return write("warn", message, context);
}

export function error(
  message: string,
  context?: unknown
) {
  return write("error", message, context);
}

export function getLogs() {
  return [...logs];
}

export function clearLogs() {
  logs.length = 0;
}