import { DatabaseAdapter } from "../database.adapter";
import { DatabaseAtomicAdapter } from "../database_atomic.adapter";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient,
         PutCommand,
         UpdateCommand,
         DeleteCommand,
         GetCommand, 
         TransactWriteCommand,
         TranslateConfig} from "@aws-sdk/lib-dynamodb";

export class DynamoDBAdapter implements DatabaseAdapter, DatabaseAtomicAdapter {
    private static readonly COUNTER_VALUE = 'CounterValue';

    docClient: DynamoDBDocumentClient;

    constructor(private tableName: string, client?: DynamoDBClient) {
        if (!client) {
            client = new DynamoDBClient({});
        }

        const translateConfig: TranslateConfig = {
            marshallOptions: {
                convertEmptyValues: false,
                removeUndefinedValues: false,
                convertClassInstanceToMap: false,
            }, unmarshallOptions: {
                wrapNumbers: false,
            }   
        };
        this.docClient = DynamoDBDocumentClient.from(client, translateConfig);
    }
    
    async create(data: Record<string, any>): Promise<boolean> {        
        const cmd = new PutCommand({
            TableName: this.tableName,
            Item: data
        });
        
        return await this.docClient.send(cmd)
                                    .then(_ => true);
    }

    async update(key: Record<string, any>, _data: Record<string, any>): Promise<boolean> {
        const cmd = new UpdateCommand({
            TableName: this.tableName,
            Key: key,

        });

        return await this.docClient.send(cmd).then(_ => true);
    }

    async delete(key: Record<string, any>): Promise<boolean> {
        const cmd = new DeleteCommand({
            TableName: this.tableName,
            Key: key
        });

        return await this.docClient.send(cmd)
                                    .then(_ => true);
    }

    async findOne(key: Record<string, any>): Promise<Record<string, any>> {
        const cmd = new GetCommand({
            TableName: this.tableName,
            Key: key,
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
    async checkCounter(key: Record<string, any>): Promise<number> {
        const it = await this.findOne(key);
        return it.CounterValue;
    }

    /**
     * This implementation tries to update the counter row IF it exists, otherwise its created with value 1 (enabled)
     * Implements DatabaseAtomicAdapter::incrementCounter using some predefinitions:
     * - counter variable column: CounterValue
     * 
     */
    async incrementCounter(key: Record<string, any>, maxValue: number): Promise<boolean> {
        const cmd = new TransactWriteCommand({
            TransactItems: [
                {
                    Put: {
                        TableName: this.tableName,
                        Item: {
                            ...key,
                            CounterValue: 1
                        },
                        ConditionExpression: 'attribute_not_exists(id)'
                    }
                },
                {
                    Update: {
                        TableName: this.tableName,
                        Key: key,
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
    async decrementCounter(key: Record<string, any>): Promise<boolean> {
        const cmd = new UpdateCommand({
            TableName: this.tableName,
            Key: key,
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