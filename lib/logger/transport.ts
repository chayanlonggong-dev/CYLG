export type LogTransport =
  | "CONSOLE"
  | "MEMORY";

export interface TransportLog {
  level: string;
  message: string;
  createdAt: Date;
}

const memoryLogs: TransportLog[] = [];

export function writeLog(
  level: string,
  message: string,
  transport: LogTransport = "CONSOLE"
) {
  const log: TransportLog = {
    level,
    message,
    createdAt: new Date(),
  };

  if (transport === "MEMORY") {
    memoryLogs.unshift(log);

    if (memoryLogs.length > 1000) {
      memoryLogs.pop();
    }
  }

  if (transport === "CONSOLE") {
    console.log(
      `[${log.createdAt.toISOString()}] [${level}] ${message}`
    );
  }

  return log;
}

export function getMemoryLogs() {
  return [...memoryLogs];
}

export function clearMemoryLogs() {
  memoryLogs.length = 0;
}

export function createTransport(
  type: LogTransport
) {
  return {
    write(
      level: string,
      message: string
    ) {
      return writeLog(
        level,
        message,
        type
      );
    },
  };
}