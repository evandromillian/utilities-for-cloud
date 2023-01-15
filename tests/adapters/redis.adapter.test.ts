const Redis = require('ioredis-mock')

import { RedisAdapter, QueryDesc, CompareType } from '../../src/adapters';

var redis: typeof Redis;
var zrangeMockSpy: jest.SpyInstance<any>;
var adapter: RedisAdapter;

describe('Redis tests', () => {
    
    beforeAll(async () => {
        redis = new Redis({
            data: {
                user_next: '3',
                emails: {
                  'clark@daily.planet': '1',
                  'bruce@wayne.enterprises': '2',
                },
              },
        });

        // Mock Redis.zrange because ioredis-mock doesn't support BYLEX operations
        zrangeMockSpy = jest.spyOn(redis, 'zrange');

        // Creating test items using the adapter, to correctly fill the indexes
        adapter = new RedisAdapter(redis);
        await adapter.create({ id: 'user:2', username: 'batman', email: 'bruce@wayne.enterprises' });
        await adapter.create({ id: 'user:3', username: 'ww', email: 'diana@lesbos.island' });
        await adapter.create({ id: 'user:4', username: 'flash', email: 'barry.allen@ny.com' });
        await adapter.create({ id: 'user:69', username: 'aquaman', email: 'arthur.curry@ocean.com' });
    });

    it('Test create entity with Redis', async () => {
        const user = { id: 'user:1', username: 'superman', email: 'test@test.com' };
        const ret = await adapter.create(user);

        expect(ret).toBe(true);
    });

    it('Test update entity with Redis', async () => {
        const user = { id: 'user:3', username: 'wonder-woman', email: 'diana.prince@olympus.com' };
        const ret = await adapter.update({ id: user.id }, user);

        expect(ret).toBe(true);
    });

    it('Test find entity with Redis', async () => {
        const user = await adapter.findOne({ id: 'user:2' });

        expect(user.id).toBe('user:2');
        expect(user.username).toBe('batman');
        expect(user.email).toBe('bruce@wayne.enterprises');
    });

    it('Test delete entity with Redis', async () => {
        const ret = await adapter.delete({ id: 'user:4' });

        expect(ret).toBe(true);
    });

    it('Test query entities using begins with Redis', async () => {
        const query: QueryDesc = {
            beginsWith: {
                id: 'user:2'
            }
        };
        const user = await adapter.query(query);
        
        expect(user.length).toBe(1);
        expect(user[0].id).toBe('user:2');
        expect(user[0].username).toBe('batman');
        expect(user[0].email).toBe('bruce@wayne.enterprises');
    });

    it('Test query entities using equals than with Redis', async () => {
        zrangeMockSpy.mockReturnValue(["user:3"]);

        const query: QueryDesc = {
            compare: {
                id: { type: CompareType.Equals, value: 'user:3' }
            }
        };
        const user = await adapter.query(query);
        
        expect(user.length).toBe(1);
        expect(user[0].id).toBe('user:3');
    });

    it('Test query entities using greater than with Redis', async () => {
        zrangeMockSpy.mockReturnValue(["user:3", 'user:69']);

        const query: QueryDesc = {
            compare: {
                id: { type: CompareType.GreaterThan, value: 'user:2' }
            }
        };
        const user = await adapter.query(query);
        
        expect(user.length).toBe(2);
        expect(user[0].id).toBe('user:3');
        expect(user[1].id).toBe('user:69');
    });

    it('Test query entities using lesser than with Redis', async () => {
        zrangeMockSpy.mockReturnValue(["user:2"]);

        const query: QueryDesc = {
            compare: {
                id: { type: CompareType.LesserThan, value: 'user:3' }
            }
        };
        const user = await adapter.query(query);
        
        expect(user.length).toBe(1);
        expect(user[0].id).toBe('user:2');
    });

    it('Test query entities using greater or equals than with Redis', async () => {
        zrangeMockSpy.mockReturnValue(["user:2", "user:3", "user:69"]);

        const query: QueryDesc = {
            compare: {
                id: { type: CompareType.GreaterOrEqual, value: 'user:2' }
            }
        };
        const user = await adapter.query(query);
        
        expect(user.length).toBe(3);
        expect(user[0].id).toBe('user:2');
        expect(user[1].id).toBe('user:3');
        expect(user[2].id).toBe('user:69');
    });

    it('Test query entities using lesser or equals than with Redis', async () => {
        zrangeMockSpy.mockReturnValue(["user:2", "user:3"]);

        const query: QueryDesc = {
            compare: {
                id: { type: CompareType.LesserOrEqual, value: 'user:3' }
            }
        };
        const user = await adapter.query(query);
        
        expect(user.length).toBe(2);
        expect(user[0].id).toBe('user:2');
        expect(user[1].id).toBe('user:3');
    });

    it('Test query entities between with Redis', async () => {
        zrangeMockSpy.mockReturnValue(["user:2", "user:3", "user:69"]);

        const query: QueryDesc = {
            between: {
                id: { left: 'user:2', right: 'user:69' }
            }
        };
        const user = await adapter.query(query);
        
        expect(user.length).toBe(3);
        expect(user[0].id).toBe('user:2');
        expect(user[1].id).toBe('user:3');
        expect(user[2].id).toBe('user:69');
    });
});