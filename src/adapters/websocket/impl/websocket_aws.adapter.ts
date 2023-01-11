import {
  ApiGatewayManagementApiClient,
  ApiGatewayManagementApiClientConfig,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi';
import { WebSocketAdapter } from '../websocket.adapter';

export class AWSWebsocketAdapter implements WebSocketAdapter {
  private static readonly DEFAULT_REGION = 'us-east-1';
  private static readonly WS_LOCALHOST_URL = 'http://localhost:3001';

  client!: ApiGatewayManagementApiClient;
  url: string = '';

  constructor(event?: any) {
    if (event) {
      this._setupClient(event);
    }
  }

  async sendMessage(connId: any, payload: any): Promise<any> {
    // Cheat and allow event to be passed in this also lets us default to setupClient too
    this._setupClient(connId);

    let connectionId = connId;
    if (typeof connId === 'object') {
      // Extract connection id from API Gateway event
      connectionId = connectionId.requestContext.connectionId;
    }

    // Convert to binary buffer to send payload
    // Always send string, it's easy to integration with any platform
    const payloadArray = new Uint8Array(Buffer.from(JSON.stringify(payload)));
    const cmd = new PostToConnectionCommand({
      ConnectionId: connectionId,
      Data: payloadArray,
    });

    return await this.client.send(cmd);
  }

  /**
   * Helper method to setup client based on the call flow
   *
   * @param config
   */
  private _setupClient(config: any): void {
    if (!this.client) {
      const options: ApiGatewayManagementApiClientConfig = {};

      if (process.env.IS_OFFLINE) {
        options.endpoint = AWSWebsocketAdapter.WS_LOCALHOST_URL;
        options.region = config.region || AWSWebsocketAdapter.DEFAULT_REGION;
      } else if (config.url !== undefined && config.url !== '') {
        options.endpoint = config.url;
        options.region = process.env.REGION || config.region || AWSWebsocketAdapter.DEFAULT_REGION;
      } else {
        options.endpoint = process.env.APIG_WS_ENDPOINT;
        options.region = process.env.REGION || config.region || AWSWebsocketAdapter.DEFAULT_REGION;
      }

      this.client = new ApiGatewayManagementApiClient(options);
    }
  }
}
