export interface SearchItem {
  id: string | number;
  title: string;
  description?: string;
  keywords?: string[];
  metadata?: Record<string, unknown>;
}

export interface SearchResult<T extends SearchItem> {
  item: T;
  score: number;
}

const searchIndex: SearchItem[] = [];

export function addToSearchIndex<T extends SearchItem>(
  item: T
) {
  const exists =
    searchIndex.some(
      (record) =>
        record.id === item.id
    );

  if (!exists) {
    searchIndex.push(item);
  }

  return item;
}

export function removeFromSearchIndex(
  id: string | number
) {
  const index =
    searchIndex.findIndex(
      (item) =>
        item.id === id
    );

  if (index === -1) {
    return false;
  }

  searchIndex.splice(index, 1);

  return true;
}

export function clearSearchIndex() {
  searchIndex.length = 0;
}

export function search<T extends SearchItem>(
  query: string
): SearchResult<T>[] {
  const keyword =
    query
      .toLowerCase()
      .trim();

  if (!keyword) {
    return [];
  }

  return searchIndex
    .map((item) => {
      const content =
        [
          item.title,
          item.description,
          ...(item.keywords ?? []),
        ]
          .join(" ")
          .toLowerCase();

      const score =
        content.includes(keyword)
          ? 1
          : 0;

      return {
        item: item as T,
        score,
      };
    })
    .filter(
      (result) =>
        result.score > 0
    )
    .sort(
      (a, b) =>
        b.score - a.score
    );
}

export function getSearchIndex() {
  return [...searchIndex];
}