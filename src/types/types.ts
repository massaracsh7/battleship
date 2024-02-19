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
  error: boolean;
  errorText: string;
}


export interface Ship {
  position: { x: number; y: number };
  direction: boolean; // true horizontal, false vertical
  length: number;
  type: 'small' | 'medium' | 'large' | 'huge';
  hits: boolean[]; 
}