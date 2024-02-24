export interface PlayerData {
  name: string;
  index: number;
  hasError: boolean;
  errorText: string;
}

export interface PlayerWin {
  name: string;
  wins: number;
}

export interface PlayerLogin {
  name: string;
  password: string;
}

export interface ConsoleMessage {
  type: string;
  data: string;
  id: number;
}

export enum Command {
  REG = 'reg',
  CREATE_ROOM = 'create_room',
  SINGLE_PLAY = 'single_play',
  UPDATE_WINNERS = 'update_winners',
  ADD_USER_TO_ROOM = 'add_user_to_room',
  CREATE_GAME = 'create_game',
  UPDATE_ROOM = 'update_room',
  ADD_SHIPS = 'add_ships',
  START_GAME = 'start_game',
  ATTACK = 'attack',
  RANDOM_ATTACK = 'randomAttack',
  TURN = 'turn',
  FINISH = 'finish'
}

export type ShipSize = "small" | "medium" | "large" | "huge";

export interface ShipData {
  position: GridPoint;
  direction: boolean;
  length: number;
  size: ShipSize;
}

export interface GridPoint {
  x: number;
  y: number;
}

export interface GameData {
  gameId: number;
  playerId: number;
}

export interface ShipPlacementData {
  gameId: number;
  ships: ShipData[];
  indexPlayer: number;
}

export interface GameStartData {
  ships: ShipData[];
  currentPlayerIndex: number;
}

export interface Attack {
  position: GridPoint;
  status: AttackResult;
}

export interface AttackRequest {
  gameId: number;
  indexPlayer: number;
  x: number;
  y: number;
}

export type AttackResult = "miss" | "killed" | "shot";

export interface AttackResponse {
  position: GridPoint;
  result: AttackResult;
  currentPlayer: number;
}

export interface RandomAttackRequest {
  gameId: number;
  indexPlayer: number;
}

export interface TurnData {
  currentPlayer: number;
}

export interface GameEndData {
  winningPlayer: number;
}

export interface Cell {
  x: number;
  y: number;
  isHole: boolean;
}

export interface Grid {
  cells: Cell[];
  size: ShipSize;
  isDead: boolean;
}

export interface RoomData {
  roomId: number;
}

export interface RoomUpdate {
  roomId: number;
  players: RoomPlayerData[];
}

export interface RoomPlayerData {
  name: string;
  index: number;
}

export enum ShipTypes {
  huge = 4,
  large = 3,
  medium = 2,
  small = 1
}

export interface CreatedShipData {
  ship: ShipData;
  shipPoints: GridPoint[];
  forbiddenPoints: GridPoint[];
}
