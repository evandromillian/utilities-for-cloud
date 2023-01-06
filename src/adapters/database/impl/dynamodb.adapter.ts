import { CompareType, DatabaseAdapter, QueryDesc } from "../database.adapter";
import { DatabaseAtomicAdapter } from "../database_atomic.adapter";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient,
         PutCommand,
         UpdateCommand,
         DeleteCommand,
         GetCommand, 
         TransactWriteCommand,
         TranslateConfig,
         QueryCommand} from "@aws-sdk/lib-dynamodb";

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

    async query(desc: QueryDesc): Promise<Record<string, any>[]> {
        const cmd = this.parseQuery(desc);
        const ret = await this.docClient.send(cmd);

        return ret.Items || [];
    }

    private static readonly compareTypeToStr: Record<CompareType, string> = {
        [CompareType.Equals]: '=',
        [CompareType.GreaterThan]: '>=',
        [CompareType.GreaterOrEqual]: '=',
        [CompareType.LesserThan]: '<',
        [CompareType.LesserOrEqual]: '<=',
    }

    private parseQuery(desc: QueryDesc): QueryCommand {
        const cmd = new QueryCommand({
            TableName: this.tableName,
            ConsistentRead: false,      // to not throw error querying secondary indexes
            KeyConditionExpression: '',
            ExpressionAttributeValues: {},
            //Limit: 10,
            //ScanIndexForward: true,
        });

        let fieldCount = 1;

        // Parse compare
        for (const it of desc.compare || []) {
            const itKey = Object.keys(it)[0];
            const { type, value } = it[itKey];

            const tName = DynamoDBAdapter.compareTypeToStr[type];
            const vName = ':val' + fieldCount++;

            cmd.input.KeyConditionExpression += ` ${itKey} ${tName} ${vName} `;
            cmd.input.ExpressionAttributeValues![vName] = value;
        }
        
        // Parse between
        for (const it of desc.between || []) {
            const itKey = Object.keys(it)[0];
            const { left, right } = it[itKey];
            
            //const lType = typeof left;
            //const rType = typeof right;
            //if ((lType === 'number' || lType === 'boolean') && 
            //    (rType === 'number' || rType === 'boolean')) {
                    const lName = ':val' + fieldCount++;
                    const rName = ':val' + fieldCount++;
                    cmd.input.KeyConditionExpression += ` ${itKey} BETWEEN ${lName} AND ${rName} `;
                
                    cmd.input.ExpressionAttributeValues![lName] = left;
                    cmd.input.ExpressionAttributeValues![rName] = right;
            //}
        }

        //console.log('Key conditions: ' + cmd.input.KeyConditionExpression);
        
        
        // FilterExpression are evaluated after the items were fetched, 
        // so try to save data using good key conditions and indexes
        
        
        // ExpressionAttributeNames
        
        
        // ExpressionAttributeValues

        return cmd;
    }
}