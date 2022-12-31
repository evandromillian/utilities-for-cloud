const Redis = require('ioredis-mock')

import { RedisAdapter } from '../../src/adapters';

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
                //'user:1': { id: 'user:1', username: 'superman', email: 'clark@daily.planet' },
                'user:2': { id: 'user:2', username: 'batman', email: 'bruce@wayne.enterprises' },
                'user:3': { id: 'user:3', username: 'ww', email: 'diana@lesbos.island' },
                'user:4': { id: 'user:4', username: 'flash', email: 'barry.allen@ny.com' },
              },
        });

        adapter = new RedisAdapter(redis);
    });

    it('Test create entity with Redis', async () => {
        const user = { id: 'user:1', username: 'superman', email: 'test@test.com' };
        const ret = await adapter.create(user);

        expect(ret).toBe(true);
    });

    it('Test update entity with Redis', async () => {
        const user = { id: 'user:3', username: 'wonder-woman', email: 'diana.prince@olympus.com' };
        const ret = await adapter.update(user.id, user);

        expect(ret).toBe(true);
    });

    it('Test find entity with Redis', async () => {
        const user = await adapter.findOne('user:2');

        expect(user.id).toBe('user:2');
        expect(user.username).toBe('batman');
        expect(user.email).toBe('bruce@wayne.enterprises');
    });

    it('Test delete entity with Redis', async () => {
        const ret = await adapter.delete('user:4');

        expect(ret).toBe(true);
    });
});