import type { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import { ensureLoggedIn } from '../../../lib/ensure-logged-in';
import { getIkas } from '../../../lib/ikas-api';
import { RedisDB } from '../../../lib/redis';
import { Product, ProductTypeEnum } from '@ikas/api-client';
import { ApiErrorResponse } from '../../../globals/types';

export type AddProductApiRequest = {
  name: string;
  sellPrice: number;
  discountPrice?: number;
};

export type AddProductApiResponse = Partial<Product>;

/**
 * This api creates simple product on ikas with name, sellPrice and discountPrice
 */
const handler = nc<NextApiRequest, NextApiResponse<AddProductApiResponse | ApiErrorResponse>>()
  .use(ensureLoggedIn)
  .post(async (req, res) => {
    try {
      const data = req.body as AddProductApiRequest;
      const token = await RedisDB.token.get(req.user!.authorizedAppId);
      if (token) {
        const ikas = getIkas(token);
        const productsRes = await ikas.adminApi.mutations.saveProduct({
          variables: {
            input: {
              name: data.name,
              type: ProductTypeEnum.PHYSICAL,
              variants: [
                {
                  prices: [
                    {
                      discountPrice: data.discountPrice,
                      sellPrice: data.sellPrice,
                    },
                  ],
                },
              ],
            },
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
