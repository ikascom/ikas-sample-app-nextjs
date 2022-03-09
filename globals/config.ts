export const config = {
  appId: process.env.NEXT_PUBLIC_APP_KEY || '',
  appSecret: process.env.APP_SECRET || '',
  // Api access scopes will be used to start oauth2 flow
  // Update scopes according to app requirements
  scope: 'read_products,write_products',
  deployUrl: process.env.DEPLOY_URL || 'http://localhost:3000',
  callbackUrl: (process.env.DEPLOY_URL || 'http://localhost:3000') + '/api/oauth/callback',
};
