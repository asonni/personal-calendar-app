import { Knex } from 'knex';

interface PaginationResult<T> {
  data: T[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

export async function paginate<T>(
  knexQuery: Knex.QueryBuilder,
  page: number = 1,
  pageSize: number = 10
): Promise<PaginationResult<T>> {
  const offset = (page - 1) * pageSize;

  // Clone the query to use for counting total items
  const countQuery = knexQuery
    .clone()
    .clearSelect()
    .clearOrder()
    .count('* as total');

  const [{ total }] = await countQuery;
  const totalItems = parseInt(total, 10);

  const data = await knexQuery.offset(offset).limit(pageSize);

  return {
    data,
    pagination: {
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      currentPage: page,
      pageSize
    }
  };
}
