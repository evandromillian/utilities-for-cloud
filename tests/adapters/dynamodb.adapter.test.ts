import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { DynamoDBAdapter, QueryDesc, CompareType } from '../../src/adapters';

var adapter: DynamoDBAdapter;

describe('DynamoDB tests', () => {

    beforeAll(async () => {
        const client = new DynamoDBClient({
            ...(process.env.MOCK_DYNAMODB_ENDPOINT && {
              endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
              sslEnabled: false,
              region: "local",
            }),
        });

        adapter = new DynamoDBAdapter('table', client);
    });

    it('Test create entity with DynamoDB', async () => {
        const user = { id: 'user:1', username: 'superman', email: 'test@test.com' };
        const ret = await adapter.create(user);

        expect(ret).toBe(true);
    });

    it('Test update entity with DynamoDB', async () => {
        const user = { id: 'user:3', username: 'wonder-woman', email: 'diana.prince@olympus.com' };
        const ret = await adapter.update({ id: user.id }, user);

        expect(ret).toBe(true);
    });

    it('Test find entity with DynamoDB', async () => {
        const userFound = await adapter.findOne({ id: 'user:2' });

        expect(userFound.id).toBe('user:2');
        expect(userFound.username).toBe('batman');
        expect(userFound.email).toBe('bruce@wayne.enterprises');
    });

    it('Test delete entity with DynamoDB', async () => {
        const ret = await adapter.delete({ id: 'user:4' });

        expect(ret).toBe(true);
    });

    it('Test query entities with equals comparison with DynamoDB', async () => {
        const query: QueryDesc = {
            compare: [
                { 
                    id: { type: CompareType.Equals, value: 'user:2' }
                }
            ]
        };
        const ret = await adapter.query(query);
        
        expect(ret.length).toBe(1);
    });
});