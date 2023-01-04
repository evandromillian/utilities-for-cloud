import { ApiGatewayManagementApiClient } from '@aws-sdk/client-apigatewaymanagementapi';
import { PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
import { mockClient } from 'aws-sdk-client-mock';

import { AWSWebsocketAdapter } from '../../src/adapters';

describe('API Gateway WebSocket tests', () => {

    const apiGwClientMock = mockClient(ApiGatewayManagementApiClient);

    var adapter: AWSWebsocketAdapter;


    beforeAll(async () => {
        adapter = new AWSWebsocketAdapter();

        apiGwClientMock.reset();
    });

    it('Send message', async () => {
        apiGwClientMock.on(PostToConnectionCommand).resolves({});

        await adapter.sendMessage('123', {

        });

        expect(apiGwClientMock.calls().length).toBe(1);
    });
});
