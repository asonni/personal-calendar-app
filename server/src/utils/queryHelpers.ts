import { Knex } from 'knex';

type TQueryOptions = {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  searchBy?: string;
  searchValue?: string;
  filterBy?: string;
  filterValue?: string;
};

type TPaginationResult<T> = {
  success: boolean;
  data: T[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
};

export async function queryWithHelpers<T>(
  queryBuilder: Knex.QueryBuilder,
  queryOptions: TQueryOptions
): Promise<TPaginationResult<T>> {
  const {
    page = 1,
    pageSize = 10,
    sortBy,
    sortOrder = 'asc',
    searchBy,
    searchValue,
    filterBy,
    filterValue
  } = queryOptions;

  // Apply filtering
  if (filterBy && filterValue) {
    queryBuilder.where(filterBy, filterValue);
  }

  // Apply searching
  if (searchBy && searchValue) {
    queryBuilder.where(searchBy, 'like', `%${searchValue}%`);
  }

  // Apply sorting
  if (sortBy) {
    queryBuilder.orderBy(sortBy, sortOrder);
  }

  const offset = (page - 1) * pageSize;

  // Clone the query to use for counting total items
  const countQuery = queryBuilder
    .clone()
    .clearSelect()
    .clearOrder()
    .count('* as total');

  const [{ total }] = await countQuery;
  const totalItems = parseInt(total, 10);

  const data = await queryBuilder.offset(offset).limit(pageSize);

  return {
    success: true,
    data,
    pagination: {
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      currentPage: page,
      pageSize
    }
  };
}
