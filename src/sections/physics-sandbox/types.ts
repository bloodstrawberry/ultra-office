export interface PhysicsBody {
  id: string;
  type: 'circle' | 'box';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius?: number;
  width?: number;
  height?: number;
  mass: number;
  restitution: number; // 0 ~ 1
  color: string;
  isStatic?: boolean;
}

export interface DoublePendulumState {
  l1: number;
  l2: number;
  m1: number;
  m2: number;
  theta1: number;
  theta2: number;
  omega1: number;
  omega2: number;
  trace: Array<{ x: number; y: number }>;
}

export interface PeriodicElement {
  number: number;
  symbol: string;
  name: string;
  koreanName: string;
  mass: number;
  category: string;
  group: number;
  period: number;
}
