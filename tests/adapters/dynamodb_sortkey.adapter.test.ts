import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { DynamoDBAdapter, QueryDesc, CompareType } from '../../src/adapters';

var client: DynamoDBClient;
var adapter: DynamoDBAdapter;

describe('DynamoDB sort key tests', () => {

    beforeAll(async () => {
        client = new DynamoDBClient({
            ...(process.env.MOCK_DYNAMODB_ENDPOINT && {
              endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
              sslEnabled: false,
              region: "local",
            }),
        });

        adapter = new DynamoDBAdapter('table_sk', client);
    });

    afterAll(() => {
        client.destroy();
    });

    it('Test create entity with DynamoDB', async () => {
        const user = { pk: 'user', sk: '1', username: 'superman', email: 'test@test.com' };
        const ret = await adapter.create(user);

        expect(ret).toBe(true);
    });

    it('Test update entity with DynamoDB', async () => {
        const user = { pk: 'user', sk: '3', username: 'wonder-woman', email: 'diana.prince@olympus.com' };
        const ret = await adapter.update({ pk: user.pk, sk: user.sk }, user);

        expect(ret).toBe(true);
    });

    it('Test find entity with DynamoDB', async () => {
        const userFound = await adapter.findOne({ pk: 'user', sk: '2' });

        expect(userFound.pk).toBe('user');
        expect(userFound.sk).toBe('2');
        expect(userFound.username).toBe('batman');
        expect(userFound.email).toBe('bruce@wayne.enterprises');
    });

    it('Test delete entity with DynamoDB', async () => {
        const ret = await adapter.delete({ pk: 'user', sk: '4' });

        expect(ret).toBe(true);
    });

    it('Test query entities with begins_with comparison with DynamoDB', async () => {
        const query: QueryDesc = {
            compare: { 
                pk: { type: CompareType.Equals, value: 'user' }
            },
            beginsWith: { 
                sk: '6'
            }
        };
        const user = await adapter.query(query);
        
        expect(user.length).toBe(1);
        expect(user[0].pk).toBe('user');
        expect(user[0].sk).toBe('69');
        expect(user[0].username).toBe('aquaman');
        expect(user[0].email).toBe('arthur.curry@ocean.com');
    });

    it('Test query entities with equals comparison with DynamoDB', async () => {
        const query: QueryDesc = {
            compare: { 
                pk: { type: CompareType.Equals, value: 'user' },
                sk: { type: CompareType.GreaterThan, value: '2' }
            }
        };
        const user = await adapter.query(query);
        
        expect(user.length).toBeGreaterThan(0);
    });

    it('Test query entities using greater than with DynamoDB', async () => {
        const query: QueryDesc = {
            compare: {
                pk: { type: CompareType.Equals, value: 'user' },
                sk: { type: CompareType.GreaterThan, value: '2' }
            }
        };
        const user = await adapter.query(query);
        
        expect(user.length).toBe(2);
        expect(user[0].sk).toBe('3');
        expect(user[1].sk).toBe('69');
    });

    it('Test query entities using lesser than with DynamoDB', async () => {
        const query: QueryDesc = {
            compare: {
                pk: { type: CompareType.Equals, value: 'user' },
                sk: { type: CompareType.LesserThan, value: '3' }
            }
        };
        const user = await adapter.query(query);
        
        expect(user.length).toBe(2);
        expect(user[0].sk).toBe('1');
        expect(user[1].sk).toBe('2');
    });

    it('Test query entities using greater or equals than with DynamoDB', async () => {
        const query: QueryDesc = {
            compare: {
                pk: { type: CompareType.Equals, value: 'user' },
                sk: { type: CompareType.GreaterOrEqual, value: '3' }
            }
        };
        const user = await adapter.query(query);
        
        expect(user.length).toBe(2);
        expect(user[0].sk).toBe('3');
        expect(user[1].sk).toBe('69');
    });

    it('Test query entities using lesser or equals than with DynamoDB', async () => {
        const query: QueryDesc = {
            compare: {
                pk: { type: CompareType.Equals, value: 'user' },
                sk: { type: CompareType.LesserOrEqual, value: '3' }
            }
        };
        const user = await adapter.query(query);
        
        expect(user.length).toBe(3);
        expect(user[0].sk).toBe('1');
        expect(user[1].sk).toBe('2');
        expect(user[2].sk).toBe('3');
    });

    it('Test query entities between with DynamoDB', async () => {
        const query: QueryDesc = {
            compare: {
                pk: { type: CompareType.Equals, value: 'user' },
            },
            between: {
                sk: { left: '2', right: '69' }
            }
        };
        const user = await adapter.query(query);
        
        expect(user.length).toBe(3);
        expect(user[0].sk).toBe('2');
        expect(user[1].sk).toBe('3');
        expect(user[2].sk).toBe('69');
    });
});