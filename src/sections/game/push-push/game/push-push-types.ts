export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Position {
  x: number;
  y: number;
}

export const CELL_VOID = 0; // Out of bounds / void
export const CELL_FLOOR = 1; // Empty walkable floor
export const CELL_WALL = 2; // Impassable wall
export const CELL_TARGET = 3; // Target goal spot
export const CELL_BOX = 4; // Pushable crate/ball on floor
export const CELL_BOX_ON_TARGET = 5; // Box placed on target
export const CELL_PLAYER = 6; // Player on floor
export const CELL_PLAYER_ON_TARGET = 7; // Player standing on target

export type CellValue = number;

export interface PushPushLevelData {
  id: number;
  name: string;
  parMoves: number;
  hint?: string;
  /** ASCII map representation of the level */
  asciiMap: string[];
}

export interface ParsedLevel {
  id: number;
  name: string;
  width: number;
  height: number;
  grid: CellValue[][];
  playerPos: Position;
  targetCount: number;
  parMoves: number;
  hint?: string;
}

export interface UndoSnapshot {
  grid: CellValue[][];
  playerPos: Position;
  playerFacing: Direction;
  moves: number;
  pushes: number;
}

export interface GameState {
  grid: CellValue[][];
  playerPos: Position;
  playerFacing: Direction;
  isMoving: boolean;
  moves: number;
  pushes: number;
  isCleared: boolean;
  targetsRemaining: number;
  totalTargets: number;
}
