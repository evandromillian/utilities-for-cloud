import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

import { ISemaphoreService } from "../../semaphore.service";

/**
 * 
 */
export class DynamoDBSemaphoreService implements ISemaphoreService {
    dynamoClient: DynamoDBClient;

    constructor(private tableName: string, 
                private keyName: string, 
                client?: DynamoDBClient) {
        if (client) {
            this.dynamoClient = client;
        } else {
            this.dynamoClient = new DynamoDBClient({});
        }
    }

    /**
     * Acquire the semaphore
     * @returns true is semaphore has been successfully acquired
     */
    async acquire(): Promise<boolean> {
        try {
            await this.dispathCommand(true);
        } catch (error) {
            //console.error(error);
            return Promise.resolve(false);
        }

        return Promise.resolve(true);
    }

    /**
     * Release the semaphore
     * @returns true is semaphore has been successfully released
     */
    async release(): Promise<boolean> {
        try {
            await this.dispathCommand(false);
        } catch (error) {
            //console.error(error);
            return Promise.resolve(false);
        }

        return Promise.resolve(true);
    }

    /**
     * 
     * @param requestLock true to request lock to be acquired
     * @returns promise to be resolved
     */
    private async dispathCommand(requestLock: boolean): Promise<any> {
        const cmd = new UpdateItemCommand({
            TableName: this.tableName,
            Key: {
                PK: { S: this.keyName }
            },
            UpdateExpression: 'SET LockValue = :NewValue',
            ConditionExpression: 'LockValue = :OldValue'
        });

        if (requestLock) {
            cmd.input.ExpressionAttributeValues = {
                ':NewValue': { N: '1' },
                ':OldValue': { N: '0' },
            }
        } else {
            cmd.input.ExpressionAttributeValues = {
                ':NewValue': { N: '0' },
                ':OldValue': { N: '1' },
            }
        }

        return await this.dynamoClient.send(cmd);
    }
}