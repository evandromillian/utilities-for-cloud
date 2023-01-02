import { DatabaseAdapter } from '../database.adapter';

import Redis from 'ioredis';

export class RedisAdapter implements DatabaseAdapter {
  constructor(private redis: Redis) {}

  async create(data: Record<string, any>): Promise<boolean> {
    const ret = await this.redis.hset(data.id, data);
    return ret > 0;
  }

  async update(id: string, data: Record<string, any>): Promise<boolean> {
    const exists = await this.redis.exists(id);
    if (exists > 0) {
      await this.redis.hset(data.id, data);
    }

    return exists > 0;
  }

  async delete(id: string): Promise<boolean> {
    const ret = await this.redis.del(id);
    return ret > 0;
  }

  async findOne(id: string): Promise<Record<string, any>> {
    return await this.redis.hgetall(id);
  }

  async find(_data: Record<string, any>): Promise<Record<string, any>> {
    throw new Error('Method not implemented.');
  }
}
