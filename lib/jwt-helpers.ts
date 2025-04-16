import { config } from '@/globals/config';
import { JwtPayload, sign, verify } from 'jsonwebtoken';
import * as uuid from 'uuid';

/**
 * JWT helper methods
 */
export class JwtHelpers {
  /**
   * This api decodes and verify JWT Token by app secret
   *
   * @param token Encoded JWT Token string
   */
  static verifyToken(token: string) {
    try {
      return verify(token, config.appSecret || '', {}) as JwtPayload;
    } catch (e) {
      console.error(e);
      return;
    }
  }

  /**
   * This api returns new JWT Token that contains same data as ikas created.
   *
   * @param merchantId Id of the merchant's store
   * @param authorizedAppId Id of the app which is unique per store and per installation
   */
  static createToken(merchantId: string, authorizedAppId: string) {
    return sign({}, config.appSecret, {
      expiresIn: '4h', // 4 Hours
      algorithm: 'HS256',
      subject: merchantId,
      issuer: config.deployUrl,
      audience: authorizedAppId,
      jwtid: uuid.v4(),
    });
  }
}
