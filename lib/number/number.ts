export function clampNumber(
  value: number,
  min: number,
  max: number
) {
  return Math.min(
    Math.max(value, min),
    max
  );
}

export function randomNumber(
  min: number,
  max: number
) {
  return Math.floor(
    Math.random() *
      (max - min + 1)
  ) + min;
}

export function formatDecimal(
  value: number,
  decimals = 2
) {
  return Number(
    value.toFixed(decimals)
  );
}

export function round(
  value: number,
  decimals = 0
) {
  const factor =
    Math.pow(10, decimals);

  return (
    Math.round(value * factor) /
    factor
  );
}

export function percentage(
  value: number,
  total: number
) {
  if (total === 0) {
    return 0;
  }

  return (
    (value / total) *
    100
  );
}

export function sum(
  values: number[]
) {
  return values.reduce(
    (total, value) =>
      total + value,
    0
  );
}

export function average(
  values: number[]
) {
  if (values.length === 0) {
    return 0;
  }

  return (
    sum(values) /
    values.length
  );
}

export function isNumber(
  value: unknown
): value is number {
  return (
    typeof value === "number" &&
    !Number.isNaN(value)
  );
}

export function toNumber(
  value: unknown,
  fallback = 0
) {
  const numberValue =
    Number(value);

  return Number.isNaN(numberValue)
    ? fallback
    : numberValue;
}