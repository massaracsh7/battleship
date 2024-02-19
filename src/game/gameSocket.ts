import { WebSocketServer, WebSocket } from 'ws';
import { PlayerModel, PlayerData } from '../player/player';
import { RoomData, RoomModel } from './room';
import { GameData } from './game';

enum CommandType {
  Reg = 'reg',
  UpdateWinners = 'update_winners',
  CreateRoom = 'create_room',
  UpdateRoom = 'update_room',
  AddUserToRoom = 'add_user_to_room',
  CreateGame = 'create_game',
  AddShips = 'add_ships',
  StartGame = 'start_game',
  Attack = 'attack',
  RandomAttack = 'randomAttack',
  Turn = 'turn',
  Finish = 'finish',
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

  constructor(
    port: number,
    private playerData: PlayerModel,
    private roomModel: RoomModel,
    private gameModel: GameData
  ) {
    this.server = new WebSocketServer({ port });

    this.server.on('connection', this.handleConnection.bind(this));
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
        const request = this.unwrapRawRequest(`${rawRequest}`);
        this.handleCommand(request.type, request.data, websocket);
      } catch (error) {
        console.log('Received: %s', JSON.parse(rawRequest.toString()));
        console.error(error);
      }
    });
  }

  private handleCommand(commandType: CommandType, data: unknown, websocket: WebSocket) {
    switch (commandType) {
      case CommandType.Reg:
        this.handleRegistrationCommand(data, websocket);
        break;
      case CommandType.CreateRoom:
        this.handleCreateRoomCommand(websocket);
        break;
      case CommandType.AddUserToRoom:
        this.handleAddUserToRoomCommand(data, websocket);
        break;
      case CommandType.AddShips:
        this.handleAddShipsCommand(data);
        break;
      case CommandType.Attack:
      case CommandType.RandomAttack:
        this.handleAttackCommand(data);
        break;
      default:
        throw new Error('Invalid command');
    }
  }

  private handleRegistrationCommand(data: unknown, websocket: WebSocket) {
    // Logic for handling player registration/login command
  }

  private handleCreateRoomCommand(websocket: WebSocket) {
    // Logic for handling create room command
  }

  private handleAddUserToRoomCommand(data: unknown, websocket: WebSocket) {
    // Logic for handling add user to room command
  }

  private handleAddShipsCommand(data: unknown) {
    // Logic for handling add ships to the game board command
  }

  private handleAttackCommand(data: unknown) {
    // Logic for handling attack command
  }

  private createResponseJSON<D>(type: CommandType, data: D): ValidRequest {
    return {
      type,
      data,
      id: 0,
    };
  }

  private unwrapRawRequest(rawRequest: string): ValidRequest {
    const request = JSON.parse(rawRequest);

    if (!this.isValidRequest(request)) throw new Error('Invalid client request');

    return request;
  }

  private isValidRequest(request: any): request is ValidRequest {
    // Validate the structure of the request
    return true;
  }

  private updateActiveUser({ name, index }: { name: string; index: number }, websocket: WebSocket) {
    this.activeConnections.set(websocket, { user: { name, index } });
  }
}
