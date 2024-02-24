import { WebSocketServer, WebSocket } from 'ws';
import Game from '../game/game';

const game = new Game();

export default function createSocket(port: number): void {
  const ws: WebSocketServer = new WebSocketServer({ port: port, clientTracking: true });
  console.log(`Websocket opened on ws://localhost:${port}`);
  ws.on('connection', (socket: WebSocket) => {
    game.addSocket(socket);
  })

  ws.on('close', () => 'WebSocket server was closed');
}
