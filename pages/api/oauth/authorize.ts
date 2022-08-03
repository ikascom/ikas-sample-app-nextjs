import type { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import { OAuthAPI } from '@ikas/api-client';
import { RedisDB } from '../../../lib/redis';
import { config } from '../../../globals/config';
import { ApiErrorResponse } from '../../../globals/types';

type AuthorizeApiRequest = {
  storeName: string;
};

type AuthorizeApiResponse = ApiErrorResponse;

/**
 * This API creates an OAuth authorize URL and starts the authorization process to an ikas store
 */
const handler = nc<NextApiRequest, NextApiResponse<AuthorizeApiResponse>>().get(async (req, res) => {
  try {
    // Validate if storeName exists on req.query
    if (!req.query.storeName) res.status(400).json({ statusCode: 400, message: 'storeName is required' });

    const { storeName } = req.query as AuthorizeApiRequest;

    // state is a dynamic variable that should be saved before starting authorization flow
    // and should be validated on callback. This is used to prevent CSRF attacks.
    const state = Math.random().toFixed(16);

    // save your state variable to a temporary key-value database like Redis, Memcached
    // or any other storage, so you can retrieve and validate on callback
    await RedisDB.state.set(state, state, 60);

    // OAuthAPI.getOAuthUrl generates a root url for your app by using given storeName
    const oauthUrl = OAuthAPI.getOAuthUrl({ storeName });

    // Create authorize url for ikas store and redirect to it
    const url = `${oauthUrl}/authorize?client_id=${config.appId}&redirect_uri=${config.callbackUrl}&scope=${config.scope}&state=${state}`;

    res.redirect(url);
    return;
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ statusCode: 500, message: err.message });
  }
});

export default handler;
