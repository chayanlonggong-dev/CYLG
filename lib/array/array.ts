export function unique<T>(
  array: T[]
) {
  return [
    ...new Set(array),
  ];
}

export function chunk<T>(
  array: T[],
  size: number
) {
  const result: T[][] = [];

  for (
    let i = 0;
    i < array.length;
    i += size
  ) {
    result.push(
      array.slice(i, i + size)
    );
  }

  return result;
}

export function groupBy<T>(
  array: T[],
  key: keyof T
) {
  return array.reduce(
    (
      result,
      item
    ) => {
      const value = String(
        item[key]
      );

      if (!result[value]) {
        result[value] = [];
      }

      result[value].push(item);

      return result;
    },
    {} as Record<string, T[]>
  );
}

export function first<T>(
  array: T[]
) {
  return array[0] ?? null;
}

export function last<T>(
  array: T[]
) {
  return (
    array[array.length - 1] ??
    null
  );
}

export function compact<T>(
  array: (T | null | undefined | false)[]
) {
  return array.filter(
    Boolean
  ) as T[];
}

export function shuffle<T>(
  array: T[]
) {
  const result = [...array];

  for (
    let i = result.length - 1;
    i > 0;
    i--
  ) {
    const j = Math.floor(
      Math.random() *
        (i + 1)
    );

    [
      result[i],
      result[j],
    ] = [
      result[j],
      result[i],
    ];
  }

  return result;
}

export function sortBy<T>(
  array: T[],
  key: keyof T
) {
  return [...array].sort(
    (a, b) =>
      String(a[key]).localeCompare(
        String(b[key])
      )
  );
}