const Redis = require('ioredis-mock')

import { RedisAdapter, QueryDesc } from '../../src/adapters';

var adapter: RedisAdapter;

describe('Redis tests', () => {

    beforeAll(async () => {
        const redis = new Redis({
            data: {
                user_next: '3',
                emails: {
                  'clark@daily.planet': '1',
                  'bruce@wayne.enterprises': '2',
                },
              },
        });

        adapter = new RedisAdapter(redis);
        await adapter.create({ id: 'user:2', username: 'batman', email: 'bruce@wayne.enterprises' });
        await adapter.create({ id: 'user:3', username: 'ww', email: 'diana@lesbos.island' });
        await adapter.create({ id: 'user:4', username: 'flash', email: 'barry.allen@ny.com' });
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

    it('Test query entities with begins with comparison with Redis', async () => {
        const query: QueryDesc = {
            beginsWith: {
                id: { value: 'user:2' }
            }
        };
        const user = await adapter.query(query);
        
        expect(user.length).toBe(1);
        expect(user[0].id).toBe('user:2');
        expect(user[0].username).toBe('batman');
        expect(user[0].email).toBe('bruce@wayne.enterprises');
    });
});