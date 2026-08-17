import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';

export class RealtimeService {
  private static instance: RealtimeService;
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();

  private constructor() {}

  public static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService();
    }
    return RealtimeService.instance;
  }

  public initialize(server: HttpServer) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket) => {
      this.clients.add(ws);
      console.log(`🔌 WebSocket client connected (Total: ${this.clients.size})`);

      // Send initial welcome state
      ws.send(JSON.stringify({
        type: 'SYSTEM_STATUS',
        payload: { status: 'ONLINE', timestamp: new Date() }
      }));

      ws.on('close', () => {
        this.clients.delete(ws);
        console.log(`🔌 WebSocket client disconnected (Total: ${this.clients.size})`);
      });

      ws.on('error', (err) => {
        console.error('WebSocket client error:', err);
      });
    });
  }

  public broadcast(type: string, payload: any) {
    const message = JSON.stringify({ type, payload, timestamp: new Date() });
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }
}
