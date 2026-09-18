export type Direction = 'up' | 'down' | 'left' | 'right';

export type BirdColor = 'red' | 'green' | 'blue' | 'yellow';

export interface Position {
  x: number;
  y: number;
}

export type SpikeDirection = 'up' | 'down' | 'left' | 'right' | 'all';

export interface SnakeBird {
  id: string;
  color: BirdColor;
  segments: Position[]; // index 0 is head, last is tail
  isExited?: boolean;
  isDead?: boolean;
  facingDir?: Direction;
}

export type FruitType = 'strawberry' | 'apple' | 'pineapple' | 'watermelon' | 'blueberry' | 'grape';

export interface FruitItem {
  id: string;
  x: number;
  y: number;
  type: FruitType;
}

export interface SpikeItem {
  id: string;
  x: number;
  y: number;
  direction: SpikeDirection;
}

export interface PortalItem {
  x: number;
  y: number;
}

export interface SnakebirdLevelData {
  name: string;
  width: number;
  height: number;
  walls: Position[];
  fruits: FruitItem[];
  spikes: SpikeItem[];
  portal: PortalItem;
  birds: SnakeBird[];
  timeLimit?: number;
  hint?: string[];
}

export interface SnakebirdGameState {
  width: number;
  height: number;
  walls: Position[];
  fruits: FruitItem[];
  spikes: SpikeItem[];
  portal: PortalItem;
  birds: SnakeBird[];
  activeBirdId: string;
  moveCount: number;
  isClear: boolean;
  isGameOver: boolean;
  gameOverReason?: 'spike' | 'fall' | 'stuck';
  fallingBirdIds: string[];
}

export interface MoveResult {
  success: boolean;
  state: SnakebirdGameState;
  fruitEaten?: FruitItem;
  birdsMoved?: string[];
  birdsExited?: string[];
  died?: boolean;
  deathReason?: 'spike' | 'fall';
}
