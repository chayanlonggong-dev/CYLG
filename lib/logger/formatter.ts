export interface LogFormatInput {
  level: string;
  message: string;
  timestamp?: Date;
  context?: unknown;
}

export function formatLog(
  input: LogFormatInput
) {
  const timestamp =
    (
      input.timestamp ??
      new Date()
    ).toISOString();

  const context =
    input.context
      ? ` ${JSON.stringify(input.context)}`
      : "";

  return `[${timestamp}] [${input.level.toUpperCase()}] ${input.message}${context}`;
}

export function formatErrorLog(
  error: unknown
) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    message: String(error),
  };
}

export function sanitizeLogData(
  data: Record<string, unknown>
) {
  const sensitiveKeys = [
    "password",
    "token",
    "secret",
    "authorization",
  ];

  const result = {
    ...data,
  };

  for (const key of sensitiveKeys) {
    if (key in result) {
      result[key] = "***";
    }
  }

  return result;
}