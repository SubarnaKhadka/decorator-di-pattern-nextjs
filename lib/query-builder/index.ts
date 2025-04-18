import { SQL, asc, desc, like, or } from "drizzle-orm";

import { db } from "@/db";

import {
  PaginationConfig,
  QueryResult,
  SearchConfig,
  SortConfig,
} from "./types";

export class QueryBuilder {
  private searchParams: URLSearchParams;
  private paginationConfig: PaginationConfig;
  private searchConfig?: SearchConfig<any>;
  private sortConfig?: SortConfig<any>;

  constructor(searchParams: URLSearchParams) {
    this.searchParams = searchParams;
    this.paginationConfig = {
      defaultLimit: 20,
      maxLimit: 100,
    };

    this.sortConfig = {
      defaultSort: "createdAt",
      defaultOrder: "desc",
      sortableFields: undefined,
    };
  }

  configurePagination(config: PaginationConfig): this {
    this.paginationConfig = { ...this.paginationConfig, ...config };
    return this;
  }

  configureSearch<T>(config: SearchConfig<T>): this {
    this.searchConfig = config;
    return this;
  }

  configureSort<S>(config: SortConfig<S>): this {
    this.sortConfig = { ...this.sortConfig, ...config };
    return this;
  }

  private buildPagination() {
    const limit = Math.min(
      Number(this.searchParams.get("limit")) ||
        this.paginationConfig.defaultLimit!,
      this.paginationConfig.maxLimit!
    );

    const page = Math.max(1, Number(this.searchParams.get("page")) || 1);
    const offset = (page - 1) * limit;

    return { limit, page, offset };
  }

  private buildSearch() {
    if (!this.searchConfig) return { where: undefined, searchByKeys: [] };

    const search = this.searchParams?.get("search") ?? "";
    const searchBy = this.searchParams?.get("searchBy");

    const { searchableFields, defaultSearchField } = this.searchConfig;

    if (!search) return { where: undefined, searchByKeys: [] };

    const searchByKeys = searchBy
      ? searchBy.split(",").filter((key) => key in searchableFields)
      : defaultSearchField
      ? [defaultSearchField]
      : Object.keys(searchableFields);

    const where = searchByKeys.reduce<SQL | undefined>((acc, key) => {
      const condition = like(searchableFields[key], `%${search}%`);
      return acc ? or(acc, condition) : condition;
    }, undefined);

    return { where, searchByKeys };
  }

  private buildSort() {
    if (!this.sortConfig || !this.sortConfig.sortableFields) return [];

    const sortBy = this.searchParams?.get("sortBy");
    const order = this.searchParams?.get("order") ?? "";

    const { sortableFields, defaultSort, defaultOrder } = this.sortConfig;

    const sortableColumns = sortBy
      ? sortBy?.split(",").filter((key) => key in sortableFields)
      : [];

    const defaultSortOrder =
      defaultOrder === "desc"
        ? desc(sortableFields[defaultSort!])
        : asc(sortableFields[defaultSort!]);

    return sortableColumns?.length > 0
      ? sortableColumns?.map((item) =>
          order === "desc"
            ? desc(sortableFields[item])
            : asc(sortableFields[item])
        )
      : [defaultSortOrder];
  }

  async executeQuery<T>(
    queryFn: (
      params: {
        limit: number;
        offset: number;
        orderBy: SQL[];
        where?: SQL;
      },
      tx: any
    ) => Promise<T[]>,
    countFn: (tx?: any) => Promise<number>
  ): Promise<QueryResult<T>> {
    const pagination = this.buildPagination();
    const { where } = this.buildSearch();
    const orderBy = this.buildSort();

    const { data, total } = await db.transaction(async (tx) => {
      const results = await queryFn(
        {
          limit: pagination.limit,
          offset: pagination.offset,
          orderBy,
          where,
        },
        tx
      );

      const totalCount = await countFn(tx);

      return {
        data: results,
        total: totalCount,
      };
    });

    const pageCount = Math.ceil(total / pagination.limit);

    return {
      data,
      pagination: {
        page: pagination.page,
        total,
        totalPage: pageCount,
      },
    };
  }
}
