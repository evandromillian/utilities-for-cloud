import { Arg, CompareType, DatabaseAdapter, QueryDesc } from '../database.adapter';

import { Redis, ScanStream } from 'ioredis';

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

/**
 * Helper class to handle indexes structures for Redis
 * TODO add extensions to create custom indexes for different patterns
 */
class RedisIndex {
  private static readonly MIN_INF = '-';
  private static readonly MAX_INF = '+';
  private static readonly INCLUSIVE = '[';
  private static readonly EXCLUSIVE = '(';

  constructor(private redis: Redis, private indexName: string) {}

  public get name(): string {
    return this.indexName;
  }

  /**
   * Add a new key to the index structures
   * @param key
   * @returns
   */
  async addKey(key: string): Promise<boolean> {
    let ret = await this.redis.zadd(this.indexName + 'Compare', 0, key);
    ret += await this.redis.sadd(this.indexName + 'BeginsWith', key);

    return ret > 0;
  }

  /**
   * Remove an existing key from the index structures
   * @param key
   * @returns
   */
  async removeKey(key: string): Promise<boolean> {
    let ret = await this.redis.zrem(this.indexName + 'Compare', key);
    ret += await this.redis.srem(this.indexName + 'BeginsWith', key);

    return ret > 0;
  }

  /**
   * Fetch keys by comparing between provided value
   * @param min min value for comparison
   * @param max max value for comparison
   * @returns matched keys
   */
  async fetchKeysBetween(min: Arg, max: Arg): Promise<string[]> {
    min = RedisIndex.INCLUSIVE + min!.toString();
    max = RedisIndex.INCLUSIVE + max!.toString();
    return await this.redis.zrange(this.indexName + 'Compare', min, max, 'BYLEX');
  }

  /**
   * Fetch keys by comparing with provided value
   * @param field
   * @param compare comparison type
   * @returns matched keys
   */
  async fetchKeysCompare(field: Arg, compare: CompareType): Promise<string[]> {
    let min = '';
    let max = '';
    switch (compare) {
      case CompareType.Equals:
        {
          min = RedisIndex.INCLUSIVE + field!.toString();
          max = min;
        }
        break;
      case CompareType.GreaterThan:
        {
          min = RedisIndex.EXCLUSIVE + field!.toString();
          max = RedisIndex.MAX_INF;
        }
        break;
      case CompareType.GreaterOrEqual:
        {
          min = RedisIndex.INCLUSIVE + field!.toString();
          max = RedisIndex.MAX_INF;
        }
        break;
      case CompareType.LesserThan:
        {
          min = RedisIndex.MIN_INF;
          max = RedisIndex.EXCLUSIVE + field!.toString();
        }
        break;
      case CompareType.LesserOrEqual:
        {
          min = RedisIndex.MIN_INF;
          max = RedisIndex.INCLUSIVE + field!.toString();
        }
        break;
      default:
        break;
    }

    return await this.redis.zrange(this.indexName + 'Compare', min, max, 'BYLEX');
  }

  /**
   * Fetch keys that begins with the given prefix
   *
   * @param prefix value prefix to search
   * @returns matched keys
   */
  async fetchKeysBeginsWith(prefix: string): Promise<string[]> {
    const stream = this.redis.sscanStream(this.indexName + 'BeginsWith', {
      match: prefix + '*',
    });

    return await this.handleStream(stream);
  }

  /**
   * Extract data from the Redis stream in set of unique values
   *
   * @param stream scan stream
   * @returns keys extracted from the stream
   */
  private async handleStream(stream: ScanStream): Promise<string[]> {
    const keySet = new Set<string>();

    return new Promise((resolve) => {
      stream.on('data', (keys = []) => {
        for (const key of keys) {
          keySet.add(key);
        }
      });

      stream.on('end', () => {
        resolve(Array.from(keySet));
      });
    });
  }
}
