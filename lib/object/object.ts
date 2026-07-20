export function pick<
  T extends Record<string, unknown>,
  K extends keyof T
>(
  object: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;

  for (const key of keys) {
    result[key] = object[key];
  }

  return result;
}

export function omit<
  T extends Record<string, unknown>,
  K extends keyof T
>(
  object: T,
  keys: K[]
): Omit<T, K> {
  const result = {
    ...object,
  };

  for (const key of keys) {
    delete result[key];
  }

  return result as Omit<T, K>;
}

export function isEmptyObject(
  object: Record<string, unknown>
) {
  return Object.keys(object).length === 0;
}

export function deepClone<T>(
  value: T
): T {
  return JSON.parse(
    JSON.stringify(value)
  );
}

export function mergeObjects<
  T extends Record<string, unknown>,
  U extends Record<string, unknown>
>(
  first: T,
  second: U
): T & U {
  return {
    ...first,
    ...second,
  };
}

export function removeUndefined<
  T extends Record<string, unknown>
>(
  object: T
) {
  return Object.fromEntries(
    Object.entries(object).filter(
      ([, value]) =>
        value !== undefined
    )
  ) as Partial<T>;
}

export function hasKey<
  T extends object
>(
  object: T,
  key: PropertyKey
): key is keyof T {
  return key in object;
}

export function getNestedValue(
  object: unknown,
  path: string
) {
  return path
    .split(".")
    .reduce(
      (current: any, key) =>
        current?.[key],
      object
    );
}

export function mapValues<
  T extends Record<string, unknown>,
  R
>(
  object: T,
  callback: (
    value: T[keyof T],
    key: keyof T
  ) => R
) {
  return Object.fromEntries(
    Object.entries(object).map(
      ([key, value]) => [
        key,
        callback(
          value as T[keyof T],
          key as keyof T
        ),
      ]
    )
  ) as Record<keyof T, R>;
}