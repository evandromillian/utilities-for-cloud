import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { CompareType, DynamoDBAdapter, QueryDesc } from "../../src/adapters";

import { BaseRepository, PrefixedKeyStrategy } from '../../src/repository';

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

var client: DynamoDBClient;
var repository: UserRepository;

describe('Repository with DynamoDB tests', () => {

    beforeAll(async () => {
        client = new DynamoDBClient({
            ...(process.env.MOCK_DYNAMODB_ENDPOINT && {
              endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
              sslEnabled: false,
              region: "local",
            }),
        });
        const adapter = new DynamoDBAdapter('table_sk', client);
        repository = new UserRepository(adapter, new PrefixedKeyStrategy('user'));
    });

    afterAll(() => {
        client.destroy();
    });

    it('Test create entity', async () => {
        const user = { id: '1', username: 'superman', email: 'test@test.com' };
        const ret = await repository.create(user);

        expect(ret).toBe(true);
    });

    it('Test update entity', async () => {
        const user = { id: '3', username: 'wonder-woman', email: 'diana.prince@olympus.com' };
        const ret = await repository.update(user.id, user);

        expect(ret).toBe(true);
    });

    it('Test find entity', async () => {
        const user = await repository.findOne('2');

        expect(user.id).toBe('2');
        expect(user.username).toBe('batman');
        expect(user.email).toBe('bruce@wayne.enterprises');
    });

    it('Test delete entity', async () => {
        const ret = await repository.delete('4');

        expect(ret).toBe(true);
    });

    it('Test query entities', async () => {
        const query: QueryDesc = {
            compare: {
                id: { type: CompareType.GreaterThan, value: '3' }
            }
        };

        const ret = await repository.query(query);

        expect(ret).not.toBeUndefined();
        expect(ret.length).toBe(1);
        expect(ret[0]).toStrictEqual({
            id: '69',
            username: 'aquaman', 
            email: 'arthur.curry@ocean.com'
        })
    });
});