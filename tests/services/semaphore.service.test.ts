import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBAdapter } from "../../src/adapters";
import { SemaphoreService } from '../../src/services';

var semaphore: SemaphoreService;

describe('Semaphore tests, skipping due to problem in Jest Dynalite', () => {

    beforeAll(async () => {
        const client = new DynamoDBClient({
            ...(process.env.MOCK_DYNAMODB_ENDPOINT && {
              endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
              sslEnabled: false,
              region: "local",
            }),
        });

        const adapter = new DynamoDBAdapter('table', client);
        semaphore = new SemaphoreService(adapter, 'lock-test', 1);
    });

    it.skip('Acquire semaphore', async () => {
        const ret = await semaphore.acquire();
        
        expect(ret).toBe(true);
    });

    it.skip('Release semaphore', async () => {
        const ret = await semaphore.release();
        
        expect(ret).toBe(true);
    });
    
    it.skip('Acquire semaphore multiple (failure)', async () => {
        let ret = await semaphore.acquire();
        expect(ret).toBe(true);

        ret = await semaphore.acquire();
        expect(ret).toBe(false);
    });
});