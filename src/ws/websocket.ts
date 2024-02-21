import { WebSocketServer, WebSocket } from 'ws';
import GameManage from '../game/gameManage';

const game = new GameManage();

export default function createSocket(port: number): void {
  const ws: WebSocketServer = new WebSocketServer({ port: port, clientTracking: true });


  console.log(`Websocket opened on ws://localhost:${port}`);

  ws.on('connection', (socket: WebSocket) => {
    game.setSocket(socket);
  })

  ws.on('close', () => 'WebSocket server was closed');
}