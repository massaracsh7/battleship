export interface Winner {
  name: string;
  wins: number;
}

export interface Player {
  name: string;
  password: string;
}

export interface PlayerInfo {
  name: string;
  index: number;
  error?: boolean;
  errorText?: string;
}

export enum CommandType {
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

export interface Ship {
  position: { x: number; y: number };
  direction: boolean; // true horizontal, false vertical
  length: number;
  type: 'small' | 'medium' | 'large' | 'huge';
  hits: boolean[]; 
}