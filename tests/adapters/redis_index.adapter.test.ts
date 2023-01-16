//const Redis = require('ioredis-mock');

import Redis from 'ioredis';
//import { CompareType } from '../../src/adapters';
import { RedisIndex } from '../../src/adapters/database/impl/redis.index';

let redis: Redis;
var index: RedisIndex;

describe('Redis Index tests', () => {

    beforeAll(async () => {
        redis = new Redis();

        index = new RedisIndex(redis, 'index');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Test add key with RedisIndex', async () => {
        const spy = jest.spyOn(redis, 'zadd').mockResolvedValue('1');
        const spy2 = jest.spyOn(redis, 'sadd').mockResolvedValue(1);
        const result = await index.addKey('key');
        expect(result).toBe(true); 
        expect(spy).toHaveBeenCalledWith('indexCompare', 0, 'key');
        expect(spy2).toHaveBeenCalledWith('indexBeginsWith', 'key');
    });
    it('Test add key failure with RedisIndex', async () => {
        const spy = jest.spyOn(redis, 'zadd').mockResolvedValue('0');
        const spy2 = jest.spyOn(redis, 'sadd').mockResolvedValue(0);
        const result = await index.addKey('key');
        expect(result).toBe(false);
        expect(spy).toHaveBeenCalledWith('indexCompare', 0, 'key');
        expect(spy2).toHaveBeenCalledWith('indexBeginsWith', 'key');
    });

    it('Test remove key with RedisIndex', async () => {
        const spy = jest.spyOn(redis, 'zrem').mockResolvedValue(1);
        const spy2 = jest.spyOn(redis, 'srem').mockResolvedValue(1);
        const result = await index.removeKey('key');
        expect(result).toBe(true);
        expect(spy).toHaveBeenCalledWith('indexCompare', 'key');
        expect(spy2).toHaveBeenCalledWith('indexBeginsWith', 'key');
    });
    it('Test remove key failure with RedisIndex', async () => {
        const spy = jest.spyOn(redis, 'zrem').mockResolvedValue(0);
        const spy2 = jest.spyOn(redis, 'srem').mockResolvedValue(0);
        const result = await index.removeKey('key');
        expect(result).toBe(false);
        expect(spy).toHaveBeenCalledWith('indexCompare', 'key');
        expect(spy2).toHaveBeenCalledWith('indexBeginsWith', 'key');
    });

});