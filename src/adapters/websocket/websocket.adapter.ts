/**
 * Adapter used to send websocket messages.
 * Remembering that reception of websocket messages is dependent on the implementation
 */
export interface WebSocketAdapter {

    /**
     * Send message to a single connection id
     * 
     * @param connId 
     * @param payload 
     */
    sendMessage(connId: string | any, payload: any): Promise<any>;
}