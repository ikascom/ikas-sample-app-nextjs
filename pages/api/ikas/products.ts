import type { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import { ensureLoggedIn } from '../../../lib/ensure-logged-in';
import { getIkas } from '../../../lib/ikas-api';
import { RedisDB } from '../../../lib/redis';
import { PaginationInput, ProductPaginationResponse } from '@ikas/api-client';
import { ApiErrorResponse } from '../../../globals/types';

export type ProductsApiRequest = {
  pagination?: PaginationInput;
};

export type ProductsApiResponse = Partial<ProductPaginationResponse>;

/**
 * This api queries paginated product list from ikas and returns it to the client
 */
const handler = nc<NextApiRequest, NextApiResponse<ProductsApiResponse | ApiErrorResponse>>()
  .use(ensureLoggedIn)
  .post(async (req, res) => {
    try {
      const data = req.body as ProductsApiRequest;
      const token = await RedisDB.token.get(req.user!.authorizedAppId);
      if (token) {
        const ikas = getIkas(token);
        const productsRes = await ikas.adminApi.queries.listProduct({
          variables: {
            pagination: data.pagination || {
              page: 1,
              limit: 10,
            },
            sort: '-createdAt',
          },
        });

        if (productsRes.isSuccess && productsRes.data) res.status(200).json(productsRes.data);
      }
      res.status(400).json({ statusCode: 400, message: 'Bad Request' });
    } catch (err: any) {
      res.status(500).json({ statusCode: 500, message: err.message });
    }
  });

export default handler;
