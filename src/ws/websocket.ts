import { WebSocketServer } from 'ws';

export default function createSocket(port: number): void {
  const wss = new WebSocketServer({ port });
  console.log(`Websocket opened on ws://localhost:${port}`);

  wss.on('connection', (socket: WebSocket) => {
    console.log(`Websocket connection`);
  })

  wss.on('close', () => 'WebSocket server was closed');
}