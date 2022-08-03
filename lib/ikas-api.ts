import { ikas, OAuthAPI, OnCheckTokenCallback } from '@ikas/api-client';
import moment from 'moment';
import { AuthToken, RedisDB } from './redis';
import { config } from '../globals/config';

/**
 * This is a helper function that creates new `ikas` object with your app config and token object
 * We use this function every time before we need to make an API call to ikas
 *
 * @param token
 */
export function getIkas(token: AuthToken): ikas<AuthToken> {
  return new ikas({
    clientId: config.appId,
    clientSecret: config.appSecret,
    accessToken: token.access_token,
    tokenData: token,
    onCheckToken,
  });
}

/**
 * This function is called before every api call by ikas client to let app check the token expiration date and refresh it.
 * Otherwise, ikas APIs will return Unauthorized error on api response, and you need check token expiration manually.
 *
 * @param token AuthToken model
 */
const onCheckToken: OnCheckTokenCallback<AuthToken> = async (token) => {
  if (token) {
    const now = new Date();

    const expireDate = new Date(token.expireDate);

    // Check if token expired and refresh and update token on db if it is expired
    if (now.getTime() >= expireDate.getTime()) {
      const response = await OAuthAPI.refreshToken(
        {
          refresh_token: token.refresh_token,
          client_id: config.appId,
          client_secret: config.appSecret,
        },
        {
          storeName: 'api',
        },
      );

      if (response.data) {
        const expireDate = moment().add(response.data.expires_in, 'seconds').toDate().toISOString();

        token.access_token = response.data.access_token;
        token.refresh_token = response.data.refresh_token;
        token.token_type = response.data.token_type;
        token.expires_in = response.data.expires_in;
        token.expireDate = expireDate;

        // Save updated token
        await RedisDB.token.set(token.authorizedAppId, token);

        return { accessToken: token.access_token, tokenData: token };
      }
    }
  }

  return { accessToken: undefined };
};
