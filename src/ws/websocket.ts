import { WebSocketServer, WebSocket } from 'ws';
import Game from '../game/game';

const game = new Game();

export default function createSocket(port: number): void {
  const ws: WebSocketServer = new WebSocketServer({ port: port, clientTracking: true });
  console.log(`Websocket opened on ws://localhost:${port}`);
  ws.on('connection', (socket: WebSocket) => {
    game.setSocket(socket);
  })

  ws.on('close', () => 'Websocket server was closed');
}
