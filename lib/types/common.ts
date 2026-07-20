export type Nullable<T> =
  | T
  | null;

export type Optional<T> =
  | T
  | undefined;

export type Maybe<T> =
  | T
  | null
  | undefined;

export type ID =
  | string
  | number;

export type Timestamp = {
  createdAt: Date;
  updatedAt: Date;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: Pagination;
};

export type ApiError = {
  message: string;
  code?: string;
  details?: unknown;
};

export type SelectOption<T = string> = {
  label: string;
  value: T;
};

export type Status =
  | "ACTIVE"
  | "INACTIVE"
  | "PENDING"
  | "DELETED";

export type SortOrder =
  | "asc"
  | "desc";