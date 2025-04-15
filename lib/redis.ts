import Redis from 'ioredis';
import { OAuthTokenResponse } from '@ikas/api-client';

export const redis = new Redis();

/**
 * RedisOps class manages redis storage methods for given type
 */
class RedisOps<T extends string | object> {
  private readonly prefix: string;
  private readonly isObjectType?: boolean;

  constructor(prefix: string, isObjectType?: boolean) {
    this.prefix = prefix;
    this.isObjectType = isObjectType;
  }

  private getKey(key: string) {
    return `${this.prefix}-${key}`;
  }

  async set(key: string, val: T, ttlSeconds?: number) {
    const valStr = this.isObjectType ? JSON.stringify(val) : (val as string);

    if (ttlSeconds) await redis.set(this.getKey(key), valStr, 'EX', ttlSeconds);
    else await redis.set(this.getKey(key), valStr);
  }

  async get(key: string): Promise<T | null> {
    try {
      const res = await redis.get(this.getKey(key));
      if (res == null) return res;
      if (this.isObjectType) return JSON.parse(res);
      return res as T;
    } catch {}
    return null;
  }

  async del(key: string) {
    try {
      return await redis.del(this.getKey(key));
    } catch {}
    return;
  }
}

export interface AuthToken extends OAuthTokenResponse {
  authorizedAppId: string;
  expireDate: string;
}

/**
 * Container class for redis models
 */
export class RedisDB {
  static state = new RedisOps<string>('state');
  static token = new RedisOps<AuthToken>('token', true);
}
