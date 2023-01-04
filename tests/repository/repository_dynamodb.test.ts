import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBAdapter } from "../../src/adapters";

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
        const client = new DynamoDBClient({
            ...(process.env.MOCK_DYNAMODB_ENDPOINT && {
              endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
              sslEnabled: false,
              region: "local",
            }),
        });


        const adapter = new DynamoDBAdapter('table', client);
        repository = new UserRepository(adapter);
    });

    it('Test create entity with DynamoDB', async () => {
        const user = { id: 'user:1', username: 'superman', email: 'test@test.com' };
        const ret = await repository.create(user);

        expect(ret).toBe(true);
    });

    it('Test update entity with DynamoDB', async () => {
        const user = { id: 'user:3', username: 'wonder-woman', email: 'diana.prince@olympus.com' };
        const ret = await repository.update(user.id, user);

        expect(ret).toBe(true);
    });

    it('Test find entity with DynamoDB', async () => {
        const user = await repository.findOne('user:2');

        expect(user.id).toBe('user:2');
        expect(user.username).toBe('batman');
        expect(user.email).toBe('bruce@wayne.enterprises');
    });

    it('Test delete entity with DynamoDB', async () => {
        const ret = await repository.delete('user:4');

        expect(ret).toBe(true);
    });
});