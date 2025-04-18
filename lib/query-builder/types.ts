export type PaginationParams = {
  limit: number;
  page: number;
  offset: number;
};

export type PaginationConfig = {
  defaultLimit?: number;
  maxLimit?: number;
};

export type SearchParams<T> = {
  search: string;
  searchBy?: string;
  searchableFields: T;
};

export type SearchConfig<T> = {
  searchableFields: T;
  defaultSearchField?: keyof T;
};

export type SortParams<T> = {
  sortBy?: string;
  order?: "asc" | "desc";
  sortableFields: T;
  defaultSort: keyof T;
};

export type QueryResult<T> = {
  data: T[];
  pagination: {
    page: number;
    total: number;
    totalPage: number;
  };
};

export type SortConfig<S> = {
  sortableFields: S;
  defaultSort?: keyof S;
  defaultOrder?: "asc" | "desc";
};
