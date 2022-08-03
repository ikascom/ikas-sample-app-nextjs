import { NextApiRequest, NextApiResponse } from 'next';
import nc from 'next-connect';
import { getParsedIkasWebhookData, IWebhookData, validateIkasWebhookMiddleware } from '@ikas/api-client';
import { config } from '../../../globals/config';
import { ApiErrorResponse } from '../../../globals/types';

/**
 * ikas Webhook handler for incoming webhooks from ikas `validateIkasWebhookMiddleware` validates webhook signature with app secret
 * and returns HTTP 401 if signature is not valid.
 * Also `getParsedIkasWebhookData` validates and parses webhook data.
 *
 * W
 *
 *
 */
const handler = nc<NextApiRequest, NextApiResponse<ApiErrorResponse | undefined>>()
  .use(validateIkasWebhookMiddleware(config.appSecret)) // Validates ikas webhook with your app secret
  .post(async (req, res) => {
    try {
      // id of the webhook
      if (!req.body.id) res.status(400).json({ statusCode: 400, message: 'id is required' });
      // webhook send date
      if (!req.body.createdAt) res.status(400).json({ statusCode: 400, message: 'createdAt is required' });
      // scope of the webhook such as store/product/created. For other scopes please check `WebhookScope` enum.
      if (!req.body.scope) res.status(400).json({ statusCode: 400, message: 'scope is required' });
      if (!req.body.merchantId) res.status(400).json({ statusCode: 400, message: 'merchantId is required' });
      if (!req.body.signature) res.status(400).json({ statusCode: 400, message: 'signature is required' });
      if (!req.body.data) res.status(400).json({ statusCode: 400, message: 'data is required' });

      // This also validates ikas webhook signature and returns parsed webhook data with type definitions
      const data: IWebhookData = getParsedIkasWebhookData(req.body, config.appSecret);
      console.log('Received webhook', req.body.id, req.body.scope, data);

      res.status(200).send(undefined);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ statusCode: 500, message: err?.message || 'Error occurred' });
    }
  });

export default handler;
