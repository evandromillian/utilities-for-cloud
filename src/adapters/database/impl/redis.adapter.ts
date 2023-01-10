import { DatabaseAdapter, QueryDesc } from '../database.adapter';

import { Redis, ScanStream } from 'ioredis';

/**
 * 
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
   * compare -
   * between -
   * beginsWith - uses SSCAN with match option to find the ids
   * 
   * @param desc 
   * @returns array of records, each representing an item in the database
   */
  async query(desc: QueryDesc): Promise<Record<string, any>[]> {
    let keysSet: string[] = [];
    
    if (desc.index) {

    }

    /*
    const compare = desc.compare || {};
    for (const it of Object.keys(compare)) {
      const { type, /*_field,/ value } = compare[it];


    }

    // Parse between
    const between = desc.between || {};
    for (const it of Object.keys(between)) {
      const { left, right } = between[it];


    }
    */

    const beginsWith = desc.beginsWith || {};
    for (const it of Object.keys(beginsWith)) {
      const value = beginsWith[it].value as string;

      keysSet = await this.indexes.fetchKeysBeginsWith(value);

      console.log(`Keys begins with ${value}: ${JSON.stringify(keysSet)}`);
    }

    return await this.MHGETALL(keysSet);
  }

  /**
   * 
   * https://icodealot.com/get-multiple-redis-hashes-in-node-js/
   * @param keys 
   * @returns 
   */
  private async MHGETALL(keys: string[]): Promise<Record<string, any>[]> {
    const m = await this.redis.multi({ pipeline: true });

    keys.forEach((key) => { m.hgetall(key); });

    const ret = await m.exec() || [];

    return ret.map(value => value[1] as Record<string, any>);
  }
}

/**
 * Helper class to handle indexes structures for Redis
 * 
 */
class RedisIndex {
  constructor(private redis: Redis, private indexName: string) { }

  public get name(): string { return this.indexName; }

  async addKey(key: string): Promise<boolean> {
    const ret = await this.redis.sadd(this.indexName + 'beginsWith', key);
    return ret > 0;
  }

  async removeKey(key: string): Promise<boolean> {
    const ret = await this.redis.srem(this.indexName + 'beginsWith', key);
    return ret > 0;
  }

  /**
   * 
   * @param prefix 
   * @returns unique indexes that begins with a given prefix
   */
  async fetchKeysBeginsWith(prefix: string): Promise<string[]> {
    const stream = this.redis.sscanStream(this.indexName + 'beginsWith', {
      match: prefix  + "*"
    });

    return await this.handleStream(stream);
  }

  /**
   * Extract data from the Redis stream in set of unique values
   * 
   * @param stream 
   * @returns 
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
        //console.log(`Stream finished with ${keySet.size} keys ${Date.now()}`);
        resolve(Array.from(keySet));
      });
    });
  }
}