import { Redis } from 'ioredis';

import { DatabaseAdapter, QueryDesc } from '../database.adapter';
import { RedisIndex } from './redis.index';

/**
 * Database adapter for Redis
 */
export class RedisAdapter implements DatabaseAdapter {
  indexes: RedisIndex;

  constructor(private redis: Redis, private parseKey: (item: Record<string, any>) => string = (i) => i.id) {
    this.indexes = new RedisIndex(this.redis, 'defaultIdx');
  }

  async create(data: Record<string, any>): Promise<boolean> {
    const itemKey = this.parseKey(data);
    const ret = await this.redis.hset(itemKey, data);

    const iret = await this.indexes.addKey(itemKey);

    return ret > 0 && iret;
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
    const itemKey = this.parseKey(key);
    const ret = await this.redis.del(itemKey);

    const iret = await this.indexes.removeKey(itemKey);

    return ret > 0 && iret;
  }

  async findOne(key: Record<string, any>): Promise<Record<string, any>> {
    return await this.redis.hgetall(this.parseKey(key));
  }

  async find(_data: Record<string, any>): Promise<Record<string, any>> {
    throw new Error('Method not implemented.');
  }

  /**
   * Query in Redis works in a different way than DynamoDB and other NoSQL database.
   * There is a module calls Redis Search, but it's difficult for it to exists in public services.
   *
   * So we'll implement a simple index that works for the operations required by DatabaseAdapter::query.
   *
   * compare - uses ZRANGE with BYLEX option
   * between - uses ZRANGE with BYLEX option
   * beginsWith - uses SSCAN with MATCH option to find the ids
   *
   * @param desc
   * @returns array of records, each representing an item in the database
   */
  async query(desc: QueryDesc): Promise<Record<string, any>[]> {
    const keysSet = new Set<string>();

    if (desc.index) {
      // TODO fetch user created indexes
    }

    // Parse compare
    const compare = desc.compare || {};
    for (const it of Object.keys(compare)) {
      const { type, /*_field,*/ value } = compare[it];

      const keys = await this.indexes.fetchKeysCompare(value, type);
      keys.forEach((key) => keysSet.add(key));
    }

    // Parse between
    const between = desc.between || {};
    for (const it of Object.keys(between)) {
      const { left, right } = between[it];

      const keys = await this.indexes.fetchKeysBetween(left, right);
      keys.forEach((key) => keysSet.add(key));
    }

    // Parse begins with
    const beginsWith = desc.beginsWith || {};
    for (const it of Object.keys(beginsWith)) {
      const value = beginsWith[it].value as string;

      const keys = await this.indexes.fetchKeysBeginsWith(value);
      keys.forEach((key) => keysSet.add(key));
    }

    const keysArray = Array.from(keysSet);
    return await this.MHGETALL(keysArray);
  }

  /**
   * Fetch multiple hashes with its values in one single transaction,
   * using code from [this tutorial](https://icodealot.com/get-multiple-redis-hashes-in-node-js/)
   * @param keys keys to fetch items
   * @returns hash items
   */
  private async MHGETALL(keys: string[]): Promise<Record<string, any>[]> {
    const m = await this.redis.multi({ pipeline: true });

    keys.forEach((key) => {
      m.hgetall(key);
    });

    const ret = (await m.exec()) || [];

    return ret.map((value) => value[1] as Record<string, any>);
  }
}