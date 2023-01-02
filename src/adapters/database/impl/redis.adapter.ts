import { DatabaseAdapter } from '../database.adapter';

import Redis from 'ioredis';

export class RedisAdapter implements DatabaseAdapter {
  constructor(private redis: Redis) {}

  async create(data: Record<string, string>): Promise<boolean> {
    const ret = await this.redis.hset(data.id, data);
    return ret > 0;
  }

  async update(id: string, data: Record<string, string>): Promise<boolean> {
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

  async findOne(id: string): Promise<Record<string, string>> {
    return await this.redis.hgetall(id);
  }

  async find(_data: Record<string, string>): Promise<Record<string, string>> {
    throw new Error('Method not implemented.');
  }
}
