import { DatabaseAdapter } from "../database.adapter";
import { DatabaseAtomicAdapter } from "../database_atomic.adapter";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient,
         PutCommand,
         UpdateCommand,
         DeleteCommand,
         GetCommand, 
         TransactWriteCommand} from "@aws-sdk/lib-dynamodb";

export class DynamoDBAdapter implements DatabaseAdapter, DatabaseAtomicAdapter {

    private static readonly COUNTER_VALUE = 'CounterValue';

    docClient: DynamoDBDocumentClient;

    constructor(private tableName: string, client?: DynamoDBClient) {
        const marshallOptions = {
            convertEmptyValues: false,
            removeUndefinedValues: false,
            convertClassInstanceToMap: false,
        };
        
        const unmarshallOptions = {
            wrapNumbers: false,
        };

        if (!client) {
            client = new DynamoDBClient({});
        }

        this.docClient = DynamoDBDocumentClient.from(client, { marshallOptions, unmarshallOptions });
    }
    
    async create(data: Record<string, any>): Promise<boolean> {
        
        const cmd = new PutCommand({
            TableName: this.tableName,
            Item: data
        });
        
        return await this.docClient.send(cmd)
                                    .then(_ => true);
    }

    async update(id: string, _data: Record<string, any>): Promise<boolean> {
        const cmd = new UpdateCommand({
            TableName: this.tableName,
            Key: { id },

        });

        return await this.docClient.send(cmd).then(_ => true);
    }

    async delete(id: string): Promise<boolean> {
        const cmd = new DeleteCommand({
            TableName: this.tableName,
            Key: { id }
        });

        return await this.docClient.send(cmd)
                                    .then(_ => true);
    }

    async findOne(id: string): Promise<Record<string, any>> {
        const cmd = new GetCommand({
            TableName: this.tableName,
            Key: { id },
            ConsistentRead: true
        });

        const ret = await this.docClient.send(cmd);

        return ret.Item ? ret.Item : {};
    }

    async find(_data: Record<string, any>): Promise<Record<string, any>> {
        throw new Error("Method not implemented.");
    }

    /**
     * Implements DatabaseAtomicAdapter::checkCounter using some predefinitions:
     * - counter variable column: CounterValue
     * 
     */
    async checkCounter(id: string): Promise<number> {
        const it = await this.findOne(id);
        return it.CounterValue;
    }

    /**
     * Implements DatabaseAtomicAdapter::incrementCounter using some predefinitions:
     * - counter variable column: CounterValue
     * 
     */
    async incrementCounter(id: string, maxValue: number): Promise<boolean> {
        const cmd = new TransactWriteCommand({
            TransactItems: [
                {
                    Put: {
                        TableName: this.tableName,
                        Item: {
                            id,
                            CounterValue: 0
                        },
                        ConditionExpression: 'attribute_not_exists(id)'
                    }
                },
                {
                    Update: {
                        TableName: this.tableName,
                        Key: {
                            id,
                        },
                        UpdateExpression: 'SET #counter = if_not_exists(#counter, :init) + :one',
                        ConditionExpression: '#counter <= :maxvalue',
                        ExpressionAttributeNames: {
                          '#counter': DynamoDBAdapter.COUNTER_VALUE
                        },
                        ExpressionAttributeValues: {
                          ':init': 0,
                          ':one': 1,
                          ':maxvalue': maxValue,
                        }
                    }
                }
            ]
        })
        
        return await this.docClient.send(cmd)
                                   .then(_ => true);
    }

    /**
     * Implements DatabaseAtomicAdapter::decrementCounter using some predefinitions:
     * - counter variable column: CounterValue
     * 
     */
    async decrementCounter(id: string): Promise<boolean> {
        const cmd = new UpdateCommand({
            TableName: this.tableName,
            Key: {
              id,
            },
            UpdateExpression: 'SET #counter = if_not_exists(#counter, :init) - :one',
            ConditionExpression: '#counter > :zero',
            ExpressionAttributeNames: {
                '#counter': DynamoDBAdapter.COUNTER_VALUE
            },
            ExpressionAttributeValues: {
              ':init': 0,
              ':one': 1,
              ':zero': 0,
            }
        });
        
        return await this.docClient.send(cmd)
                                   .then(_ => true);
    }
}