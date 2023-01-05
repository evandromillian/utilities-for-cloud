import { DatabaseAdapter } from '../database.adapter';

import Redis from 'ioredis';

/**
 * 
 */
export class RedisAdapter implements DatabaseAdapter {
  constructor(private redis: Redis, private parseKey: (item: Record<string, any>) => string = (i) => i.id) {}

  async create(data: Record<string, any>): Promise<boolean> {
    const ret = await this.redis.hset(this.parseKey(data), data);
    return ret > 0;
  }

  async update(key: Record<string, any>, data: Record<string, any>): Promise<boolean> {
    const id = this.parseKey(key);
    const exists = await this.redis.exists(id);
    if (exists > 0) {
      await this.redis.hset(id, data);
    }

    return exists > 0;
  }

  async delete(key: Record<string, any>): Promise<boolean> {
    const ret = await this.redis.del(this.parseKey(key));
    return ret > 0;
  }

  async findOne(key: Record<string, any>): Promise<Record<string, any>> {
    return await this.redis.hgetall(this.parseKey(key));
  }

  async find(_data: Record<string, any>): Promise<Record<string, any>> {
    throw new Error('Method not implemented.');
  }
}
