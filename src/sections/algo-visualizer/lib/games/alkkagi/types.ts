export type AlkkagiBoardType = 'baduk' | 'janggi';

export type AlkkagiGameMode = 'vs-ai' | 'pass-and-play' | 'practice';

export type AlkkagiSide = 'A' | 'B'; // A: Black / Cho, B: White / Han

export type AlkkagiPieceType =
  | 'BADUK'
  | 'KING'
  | 'CHARIOT'
  | 'CANNON'
  | 'HORSE'
  | 'ELEPHANT'
  | 'GUARD'
  | 'SOLDIER';

export interface AlkkagiStone {
  id: string;
  side: AlkkagiSide;
  pieceType: AlkkagiPieceType;
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  isAlive: boolean;
  falling: boolean;
  fallProgress: number; // 0 to 1
}

export type AlkkagiFormation = 'standard5' | 'battle7' | 'fortress' | 'triangle';

export interface AlkkagiPhysicsConfig {
  friction: number; // 0.985
  restitution: number; // 0.94
  powerMultiplier: number; // 0.18
  maxPower: number; // 40
}
