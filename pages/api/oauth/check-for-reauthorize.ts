import type { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import { ensureLoggedIn } from '../../../lib/ensure-logged-in';
import { getIkas } from '../../../lib/ikas-api';
import { RedisDB } from '../../../lib/redis';
import { config } from '../../../globals/config';
import { ApiErrorResponse } from '../../../globals/types';

export type CheckForReauthorizeApiRequest = {};

export type CheckForReauthorizeApiResponse = {
  required: boolean;
  authorizeData?: {
    redirectUri: string;
    scope: string;
    state: string;
  };
};

/**
 * This API checks if scope is different from scope granted by merchant
 */
const handler = nc<NextApiRequest, NextApiResponse<CheckForReauthorizeApiResponse | ApiErrorResponse>>()
  .use(ensureLoggedIn)
  .get(async (req, res) => {
    try {
      const token = await RedisDB.token.get(req.user!.authorizedAppId);
      if (token) {
        const ikas = getIkas(token);
        // Get app info from ikas
        const meRes = await ikas.adminApi.queries.me({});

        if (meRes.isSuccess && meRes.data) {
          // Compare scopes
          if (meRes.data.scope != config.scope) {
            const state = Math.random().toFixed(16);
            await RedisDB.state.set(state, state, 60);

            // Return saved state and scope to client side
            res.status(200).json({
              required: true,
              authorizeData: {
                state,
                scope: config.scope,
                redirectUri: config.callbackUrl,
              },
            });
          }
        }
      }
      res.status(200).json({ required: false });
    } catch (err: any) {
      res.status(500).json({ statusCode: 500, message: err.message });
    }
  });

export default handler;
