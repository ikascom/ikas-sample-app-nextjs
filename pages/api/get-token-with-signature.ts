import type { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import { AuthConnectParams, validateAuthSignature } from '@ikas/api-client';
import { config } from '../../globals/config';
import { JwtHelpers } from '../../lib/jwt-helpers';
import { ApiErrorResponse } from '../../globals/types';

export type GetTokenWithSignatureApiRequest = AuthConnectParams;

export type GetTokenWithSignatureApiResponse = { token: string } | ApiErrorResponse;

/**
 * This API is implemented for external apps but can also be used by iframe apps.
 * Since external apps do not have access to AppBridge they require a different mechanism to identify stores.
 * When the merchant clicks your app from the ikas dashboard it adds some query variables to your app URL, and you should validate these variables with your app secret.
 */
const handler = nc<NextApiRequest, NextApiResponse<GetTokenWithSignatureApiResponse>>().post(async (req, res) => {
  try {
    // Validate the query parameters
    if (!req.body.authorizedAppId) res.status(400).json({ statusCode: 400, message: 'authorizedAppId is required' });
    if (!req.body.merchantId) res.status(400).json({ statusCode: 400, message: 'merchantId is required' });
    if (!req.body.signature) res.status(400).json({ statusCode: 400, message: 'signature is required' });
    if (!req.body.storeName) res.status(400).json({ statusCode: 400, message: 'storeName is required' });
    if (!req.body.timestamp) res.status(400).json({ statusCode: 400, message: 'timestamp is required' });

    const data = req.body as GetTokenWithSignatureApiRequest;

    // signature should be equal with sha256 hash of `${storeName}${merchantId}${timestamp}` string which is hashed by your appSecret
    const isValid = validateAuthSignature(data, config.appSecret);

    if (isValid) {
      res.json({ token: JwtHelpers.createToken(data.storeName, data.merchantId, data.authorizedAppId) });
    }
  } catch (err: any) {
    res.status(500).json({ statusCode: 500, message: err.message });
  }
});

export default handler;
