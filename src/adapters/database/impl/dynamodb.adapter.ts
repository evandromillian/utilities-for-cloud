import { DatabaseAdapter } from "../database.adapter";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient,
         PutCommand,
         UpdateCommand,
         DeleteCommand,
         GetCommand } from "@aws-sdk/lib-dynamodb";

export class DynamoDBAdapter implements DatabaseAdapter {
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
}