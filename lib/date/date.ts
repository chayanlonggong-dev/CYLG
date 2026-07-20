export function now(): Date {
  return new Date();
}

export function today(): string {
  return now().toISOString().split("T")[0];
}

export function addDays(
  date: Date,
  days: number
): Date {
  const result = new Date(date);

  result.setDate(result.getDate() + days);

  return result;
}

export function addHours(
  date: Date,
  hours: number
): Date {
  const result = new Date(date);

  result.setHours(result.getHours() + hours);

  return result;
}

export function isExpired(
  date: Date
): boolean {
  return date.getTime() <= Date.now();
}

export function diffInDays(
  start: Date,
  end: Date
): number {
  const diff =
    end.getTime() - start.getTime();

  return Math.floor(
    diff / (1000 * 60 * 60 * 24)
  );
}

export function unixTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

export function unixMilliseconds(): number {
  return Date.now();
}

export function toISOString(
  date: Date
): string {
  return date.toISOString();
}