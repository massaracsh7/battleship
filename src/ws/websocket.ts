import { Server as WebSocketServer, WebSocket } from 'ws';
import { PlayerModel } from '../player/player';
import { RoomManager, RoomService } from '../game/room';
import { GameData } from '../game/game';
import { PlayerInfo } from '../types/types';

enum CommandType {
  Reg = 'reg',
  CreateRoom = 'create_room',
  AddUserToRoom = 'add_user_to_room',
  AddShips = 'add_ships',
  Attack = 'attack',
  RandomAttack = 'randomAttack',
}

interface ValidRequest {
  type: CommandType;
  data: unknown;
  id: number;
}

interface ConnectionData {
  user?: {
    name: string;
    index: number;
  };
}

export default class GameSocket {
  private server: WebSocketServer;
  private activeConnections = new Map<WebSocket, ConnectionData>();
  private playerModel: PlayerModel;
  private roomModel: RoomManager;
  private roomService: RoomService;
  private gameModel: GameData;

  constructor(port: number) {
    this.server = new WebSocketServer({ port });
    console.log(`WebSocket opened on ws://localhost:${port}`);

    this.playerModel = new PlayerModel();
    this.roomModel = new RoomManager();
    this.roomService = new RoomService();
    this.gameModel = new GameData();

    this.server.on('connection', this.handleConnection.bind(this));
    this.server.on('close', () => console.log('WebSocket server was closed'));
  }

  private handleConnection(websocket: WebSocket) {
    websocket.on('error', console.error);
    websocket.on('open', () => {
      this.activeConnections.set(websocket, {});
    });
    websocket.on('close', () => {
      this.activeConnections.delete(websocket);
    });
    websocket.on('message', (rawRequest) => {
      try {
        const request = JSON.parse(rawRequest.toString()) as ValidRequest;
        console.log('Received message:', request);
        this.handleCommand(request.type, request.data, websocket);
      } catch (error) {
        console.error('Error processing request:', error);
        // Optionally: Send an error response to the client
      }
    });
  }

  private handleCommand(type: CommandType, data: unknown, websocket: WebSocket) {
    switch (type) {
      case CommandType.Reg:
        this.handleRegistrationCommand(data, websocket);
        break;
      case CommandType.CreateRoom:
        this.handleCreateRoomCommand(websocket);
        break;
      case CommandType.AddUserToRoom:
        this.handleAddUserToRoomCommand(data as string, websocket);
        break;
      case CommandType.AddShips:
        this.handleAddShipsCommand(data);
        break;
      case CommandType.Attack:
      case CommandType.RandomAttack:
        this.handleAttackCommand(data);
        break;
      default:
        console.error('Unknown command:', type);
        break;
    }
  }

  private handleAddUserToRoomCommand(data: string, websocket: WebSocket) {
    try {
      const roomData = JSON.parse(data);
      const player = this.playerModel.getPlayerByName(roomData.playerName);
      if (player) {
        const result = this.roomService.addUserToRoom(player, roomData);
        if (result && result.error) {
          console.error('Error adding user to room: Player already in a room');
          return;
        }
      }
      this.sendResponse(websocket, CommandType.AddUserToRoom, {
        message: 'Player added to room successfully',
      });
      // Simulate creating a game
      // this.sendResponse(websocket, CommandType.CreateGame, {
      //   idGame: 12345,
      //   idPlayer: player.index,
      // });
    } catch (error) {
      console.error('Error adding user to room:', error);
    }
  }

  private handleRegistrationCommand(data: unknown, websocket: WebSocket) {
    console.log(data);
    const { name, password } = data as { name: string; password: string };
    try {
      const player = this.playerModel.loginPlayer({ name, password });
      this.sendResponse(websocket, CommandType.Reg, JSON.stringify(player));
    } catch (error) {
      console.error('Error registering/login in player:', error);
    }
  }

  private handleCreateRoomCommand(websocket: WebSocket) {
    try {
      const room = this.roomModel.createRoom();
      this.sendResponse(websocket, CommandType.CreateRoom, room);
    } catch (error) {
      console.error('Error creating room:', error);
    }
  }

  private handleAddShipsCommand(data: unknown) {
    // Implement handleAddShipsCommand method
  }

  private handleAttackCommand(data: unknown) {
    // Implement handleAttackCommand method
  }

  private sendResponse(websocket: WebSocket, type: CommandType, data: any) {
    const response = {
      type,
      data,
      id: 0,
    };
    websocket.send(JSON.stringify(response));
  }
}