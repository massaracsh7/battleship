import { Server as WebSocketServer } from 'ws'; // Fix import statement

import { PlayerModel } from '../player/player';
import { RoomModel } from '../game/room';
import { GameData } from '../game/game';
import GameSocket from '../game/gameSocket';

export default function createSocket(port: number): void {
  const wss = new WebSocketServer({ port });
  console.log(`Websocket opened on ws://localhost:${port}`);
  const playerModel = new PlayerModel(); // Create an instance of PlayerModel
  const roomModel = new RoomModel(); // Create an instance of RoomModel
  const gameData = new GameData(); // Create an instance of GameData
  const gameServer = new GameSocket(port, playerModel, roomModel, gameData); // Pass instances

  wss.on('connection', (ws) => {
    console.log(`Websocket connection`);

    ws.on('message', (data: string) => {
      const command = JSON.parse(data);
      console.log("Received command:", command);
      const response = {
        type: "response",
        data: "Received command: " + JSON.stringify(command),
        id: 0,
      };
      ws.send(JSON.stringify(response));
    });

    ws.on('close', () => {
      console.log(`Socket was closed`);
    });
  })

  wss.on('close', () => console.log('WebSocket server was closed')); // Fix close event handler
}
