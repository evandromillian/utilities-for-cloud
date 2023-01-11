const Redis = require('ioredis-mock')

import { RedisAdapter } from '../../src/adapters';

import { BaseRepository } from '../../src/repository';

interface User {
    id: string;
    username: string;
    email: string;
}

class UserRepository extends BaseRepository<User> {
    toEntity(item: Record<string, string>): User {
        return {
            id: item.id, 
            username: item.username, 
            email: item.email
        };
    }
}

var repository: UserRepository;

describe('Repository with Redis tests', () => {

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

        // Creating test items using the adapter, to correctly fill the indexes
        const adapter = new RedisAdapter(redis);
        await adapter.create({ id: 'user:2', username: 'batman', email: 'bruce@wayne.enterprises' });
        await adapter.create({ id: 'user:3', username: 'ww', email: 'diana@lesbos.island' });
        await adapter.create({ id: 'user:4', username: 'flash', email: 'barry.allen@ny.com' });
        await adapter.create({ id: 'user:69', username: 'aquaman', email: 'arthur.curry@ocean.com' });

        repository = new UserRepository(adapter);
    });

    it('Test create entity', async () => {
        const user = { id: 'user:1', username: 'superman', email: 'test@test.com' };
        const ret = await repository.create(user);

        expect(ret).toBe(true);
    });

    it('Test update entity', async () => {
        const user = { id: 'user:3', username: 'wonder-woman', email: 'diana.prince@olympus.com' };
        const ret = await repository.update(user.id, user);

        expect(ret).toBe(true);
    });

    it('Test find entity', async () => {
        const user = await repository.findOne('user:2');

        expect(user.id).toBe('user:2');
        expect(user.username).toBe('batman');
        expect(user.email).toBe('bruce@wayne.enterprises');
    });

    it('Test delete entity', async () => {
        const ret = await repository.delete('user:4');

        expect(ret).toBe(true);
    });
});