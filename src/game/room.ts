import { Player, PlayerModel } from '../player/player';

export interface Room {
  roomUsers: {
    name: string;
    index: number;
  }[];
  roomId: number;
}

export interface RoomData {
  indexRoom: number;
}

export class RoomModel {
  constructor(
    private rooms: Room[] = [],
    private activeUsers = new Set<string>(),
  ) { }

  public createRoomAndJoin(playerData: Omit<Player, 'wins' | 'password'>): void {
    if (this.activeUsers.has(playerData.name)) {
      return;
    }

    this.activeUsers.add(playerData.name);
    this.rooms.push({ roomUsers: [playerData], roomId: this.rooms.length });
  }

  public joinRoom(playerData: Omit<Player, 'wins' | 'password'>, { indexRoom }: RoomData): { error: boolean } | undefined {
    const room = this.rooms[indexRoom];

    if (!room || room.roomUsers.length >= 2) {
      throw new Error('Room is full');
    }

    if (this.activeUsers.has(playerData.name)) {
      return { error: true };
    }

    this.activeUsers.add(playerData.name);
    room.roomUsers.push(playerData);

    return { error: false };
  }

  public createGameForRoom({ indexRoom }: RoomData): { idGame: number; idPlayer: number }[] {
    const room = this.rooms[indexRoom];

    if (!room) {
      throw new Error('Room not found');
    }

    return room.roomUsers.map((player) => ({
      idGame: indexRoom,
      idPlayer: player.index,
    }));
  }

  public getWaitingRooms(): Room[] {
    return this.rooms.filter(({ roomUsers }) => roomUsers.length === 1);
  }
}

export class RoomApi {
  constructor(private model = new RoomModel()) { }

  public createRoom(playerDto: Omit<Player, 'wins' | 'password'>): void {
    this.model.createRoomAndJoin(playerDto);
  }

  public addUserToRoom(playerData: Omit<Player, 'wins' | 'password'>, roomData: unknown): { error: boolean } | undefined {
    if (!this.isValidRoomData(roomData)) {
      throw Error('Invalid room data');
    }

    return this.model.joinRoom(playerData, roomData as RoomData);
  }

  public updateRoomState(): Room[] {
    return this.model.getWaitingRooms();
  }

  public isValidRoomData(data: unknown): data is RoomData {
    if (typeof data !== 'object' || data == null) return false;
    if (!('indexRoom' in data) || typeof (data as RoomData).indexRoom !== 'number') return false;

    return true;
  }

  public createGame(data: unknown): { idGame: number; idPlayer: number }[] {
    if (!this.isValidRoomData(data)) {
      throw Error('Invalid room data');
    }

    return this.model.createGameForRoom(data as RoomData);
  }
}
