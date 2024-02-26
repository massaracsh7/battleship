export interface PlayerData {
  name: string,
  index: number,
  error: boolean,
  errorText: string,
}

export interface PlayerWin {
  name: string,
  wins: number,
}

export interface PlayerLogin {
  name: string,
  password: string,
}

export interface ShipInfo {
  position: Position,
  direction: boolean,
  length: number,
  type: "small" | "medium" | "large" | "huge",
}

export interface Position {
  x: number,
  y: number
}

export interface RoomInfo {
  indexRoom: number
}

export interface UpdateRoom {
  roomId: number,
  roomUsers: RoomPlayers[]
}

export interface RoomPlayers {
  name: string,
  index: number,
}

export interface Cell {
  x: number,
  y: number,
  disrupt: boolean
}

export type Grid = {
  position: Cell[],
  type: "small" | "medium" | "large" | "huge",
  sink: boolean;
}

export interface GameData {
  idGame: number,
  idPlayer: number,
}

export interface AddShipInfo {
  gameId: number,
  ships: ShipInfo[]
  indexPlayer: number
}

export interface StartInfo {
  ships: ShipInfo[]
  currentPlayerIndex: number
}

export interface AttackReqInfo {
  gameId: number,
  indexPlayer: number,
  x: number,
  y: number,
}

export interface Attack {
  position: Position
  status: "miss" | "killed" | "shot"
}

export interface AttackResInfo {
  currentPlayer: number,
  position: Position
  status: "miss" | "killed" | "shot"
}

export interface RandomReq {
  gameId: number,
  indexPlayer: number
}

export interface Turn {
  currentPlayer: number
}

export interface FinishInfo {
  winPlayer: number
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


export enum ShipsTypes {
  huge = 4,
  large = 3,
  medium = 2,
  small = 1
}

export interface CreatedShip {
  ship: ShipInfo,
  shipPoints: Position[],
  banPoints: Position[]
}

export interface ConsoleMessage {
  type: string,
  data: string,
  id: number
}
