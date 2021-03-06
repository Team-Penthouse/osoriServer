import jwt from 'jsonwebtoken';
import sequelize from '../models';
import { user } from '../models/user';
import { PaginationInterface, SearchInterface } from '../types/CommonTypes';

export const trimNull = (object: any) => {
  const trimmingObject = object;
  Object.keys(object).forEach((key) => {
    // eslint-disable-next-line no-param-reassign
    if (object[key] === null) delete trimmingObject[key];
  });
  return trimmingObject;
};

export const makeFilter = (
  filter: any,
): { filter: PaginationInterface & SearchInterface; offset: number } => {
  const converting = { ...filter };
  Object.keys(converting).forEach((key) => {
    if (key === 'searchKeyword') return;
    converting[key] = Number(converting[key]);
  });

  if (!filter?.page || filter.page === 0) {
    converting.page = 0;
  }
  if (!filter?.size) {
    converting.size = 10;
  }

  return {
    filter: converting as PaginationInterface & SearchInterface,
    offset: converting.page * converting.size,
  };
};

export const makePagination = (
  filter: PaginationInterface & SearchInterface,
  currentCount: number,
  totalCount: number,
) => {
  /**
   * @Initialize
   */
  const totalPages = Math.ceil(totalCount / (filter.size || 10));
  const pagination: PaginationInterface & SearchInterface = {
    ...filter,
    totalCount,
    totalPages,
  };
  const page = pagination.page!;
  const size = pagination.size!;

  /**
   * @HasNext, HasPrevious
   */
  pagination.hasNext = page * size + currentCount < totalCount;
  pagination.hasPrevious = page === totalPages;

  /**
   * @Delete
   */
  delete pagination.searchKeyword;

  return JSON.stringify(pagination);
};

/**
 * @param token headers['Authorization']
 */
export const getCaller = async (token: string | undefined) => {
  if (typeof token !== 'undefined') {
    const splited = token.split(' '); // Trim Bear
    if (splited.length === 2) {
      console.log(splited);
      // @ts-ignore
      const parsedUser = (jwt.decode(splited[1]) as string).user as user;
      const user = await sequelize.user.findOne({ where: { id: parsedUser?.id } });
      if (user) {
        return user;
      }
      return undefined;
    }
    return undefined;
  }
  return undefined;
};
