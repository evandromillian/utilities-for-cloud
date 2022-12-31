import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { DynamoDBSemaphoreService } from '../../src/services';

var semaphore: DynamoDBSemaphoreService;

describe('Semaphore tests', () => {

    beforeAll(async () => {
        const client = new DynamoDBClient({
            ...(process.env.MOCK_DYNAMODB_ENDPOINT && {
              endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
              sslEnabled: false,
              region: "local",
            }),
        });

        semaphore = new DynamoDBSemaphoreService('table', 'lock-test', client);
    });

    it('Acquire semaphore', async () => {
        const ret = await semaphore.acquire();
        
        expect(ret).toBe(true);
    });

    it('Release semaphore', async () => {
        const ret = await semaphore.release();
        
        expect(ret).toBe(true);
    });

    it('Acquire semaphore multiple (failure)', async () => {
        let ret = await semaphore.acquire();
        expect(ret).toBe(true);

        ret = await semaphore.acquire();
        expect(ret).toBe(false);
    });
});