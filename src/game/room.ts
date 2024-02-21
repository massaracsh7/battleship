import { PlayerInfo } from '../types/types';

export interface Room {
  roomUsers: PlayerInfo[];
  roomId: number;
}

export interface RoomData2 {
  indexRoom: number;
}

export class RoomsData {
  private rooms: Room[] = [];
  private activeUsers = new Set<string>();

  public createRoom(): Room {
    const room: Room = { roomUsers: [], roomId: this.rooms.length };
    this.rooms.push(room);
    return room;
  }

  public addUserToRoom(roomID: number, player: PlayerInfo): Room {
    const room = this.rooms.find((r) => r.roomId === roomID);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.roomUsers.length >= 2) {
      throw new Error('Room is full');
    }

    if (this.activeUsers.has(player.name)) {
      throw new Error('Player is already in a room');
    }

    player.index = room.roomUsers.length;
    room.roomUsers.push(player);
    this.activeUsers.add(player.name);

    return room;
  }

  public joinRoom(player: PlayerInfo, roomData: RoomData2): { error: boolean } | undefined {
    const room = this.rooms[roomData.indexRoom];

    if (!room || room.roomUsers.length >= 2) {
      throw new Error('Room is full');
    }

    if (this.activeUsers.has(player.name)) {
      return { error: true };
    }

    player.index = room.roomUsers.length;
    room.roomUsers.push(player);
    this.activeUsers.add(player.name);

    return { error: false };
  }


  public updateRoomState() {
    const roomsWithOnePlayer = this.rooms.filter(({ roomUsers }) => roomUsers.length === 1);
    return roomsWithOnePlayer;
  }

}

export class RoomService {
  private manager: RoomData2;

  constructor() {
    this.manager = new RoomData();
  }

  public createRoomAndJoin(player: PlayerInfo): Room {
    try {
      return this.manager.createRoom();
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  }

  public addUserToRoom(player: PlayerInfo, roomData: unknown): { error: boolean } | undefined {
    if (!this.isValidRoomData(roomData)) {
      throw Error('Invalid room data');
    }

    return this.manager.joinRoom(player, roomData as RoomData);
  }

  public isValidRoomData(data: unknown): data is RoomData {
    if (typeof data !== 'object' || data == null) return false;
    if (!('indexRoom' in data) || typeof (data as RoomData).indexRoom !== 'number') return false;

    return true;
  }

}