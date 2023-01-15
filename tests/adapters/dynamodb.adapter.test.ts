import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { DynamoDBAdapter, QueryDesc, CompareType } from '../../src/adapters';

var client: DynamoDBClient;
var adapter: DynamoDBAdapter;

describe('DynamoDB tests', () => {

    beforeAll(async () => {
        client = new DynamoDBClient({
            ...(process.env.MOCK_DYNAMODB_ENDPOINT && {
              endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
              sslEnabled: false,
              region: "local",
            }),
        });

        adapter = new DynamoDBAdapter('table', client);
    });

    afterAll(() => {
        client.destroy();
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

    it.skip('Test query entities using begins with DynamoDB', async () => {
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

    it('Test query entities using equals than with DynamoDB', async () => {
        const query: QueryDesc = {
            compare: {
                id: { type: CompareType.Equals, value: 'user:3' }
            }
        };
        const user = await adapter.query(query);
        
        expect(user.length).toBe(1);
        expect(user[0].id).toBe('user:3');
    });

    it.skip('Test query entities using greater than with DynamoDB', async () => {
        const query: QueryDesc = {
            compare: {
                id: { type: CompareType.GreaterThan, value: 'user:2' }
            }
        };
        const user = await adapter.query(query);
        
        expect(user.length).toBe(1);
        expect(user[0].id).toBe('user:3');
    });

    it.skip('Test query entities using lesser than with DynamoDB', async () => {
        const query: QueryDesc = {
            compare: {
                id: { type: CompareType.LesserThan, value: 'user:3' }
            }
        };
        const user = await adapter.query(query);
        
        expect(user.length).toBe(1);
        expect(user[0].id).toBe('user:2');
    });

    it.skip('Test query entities using greater or equals than with DynamoDB', async () => {
        const query: QueryDesc = {
            compare: {
                id: { type: CompareType.GreaterThan, value: 'user:2' }
            }
        };
        const user = await adapter.query(query);
        
        expect(user.length).toBe(2);
        expect(user[0].id).toBe('user:2');
        expect(user[1].id).toBe('user:3');
    });

    it.skip('Test query entities using lesser or equals than with DynamoDB', async () => {
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

    it.skip('Test query entities between with DynamoDB', async () => {
        const query: QueryDesc = {
            between: {
                id: { left: 'user:2', right: 'user:69' }
            }
        };
        const user = await adapter.query(query);
        
        expect(user.length).toBe(1);
        expect(user[0].id).toBe('user:3');
    });
});