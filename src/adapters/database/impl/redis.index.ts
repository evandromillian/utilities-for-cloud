import { Redis, ScanStream } from 'ioredis';
import { Arg, CompareType } from '../database.adapter';

/**
 * Helper class to handle indexes structures for Redis
 * TODO add extensions to create custom indexes for different patterns
 */
export class RedisIndex {
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
  