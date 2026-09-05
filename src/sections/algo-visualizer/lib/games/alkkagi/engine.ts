import {
  type AlkkagiSide,
  type AlkkagiStone,
  type AlkkagiBoardType,
  type AlkkagiFormation,
  type AlkkagiPhysicsConfig,
} from './types';

export const BOARD_WIDTH = 640;
export const BOARD_HEIGHT = 640;
export const BOARD_PADDING = 36;

export const DEFAULT_PHYSICS: AlkkagiPhysicsConfig = {
  friction: 0.986,
  restitution: 0.94,
  powerMultiplier: 0.22,
  maxPower: 42,
};

export function createInitialStones(
  boardType: AlkkagiBoardType,
  formation: AlkkagiFormation = 'standard5'
): AlkkagiStone[] {
  const stones: AlkkagiStone[] = [];
  const midX = BOARD_WIDTH / 2;

  if (boardType === 'baduk') {
    const r = 18;
    const m = 1.0;

    if (formation === 'standard5') {
      // 5 vs 5 line formation
      const cols = [120, 220, 320, 420, 520];
      // Black (Bottom, y=550)
      cols.forEach((x, i) => {
        stones.push({
          id: `b-${i}`,
          side: 'A',
          pieceType: 'BADUK',
          label: '',
          x,
          y: 550,
          vx: 0,
          vy: 0,
          radius: r,
          mass: m,
          isAlive: true,
          falling: false,
          fallProgress: 0,
        });
      });
      // White (Top, y=90)
      cols.forEach((x, i) => {
        stones.push({
          id: `w-${i}`,
          side: 'B',
          pieceType: 'BADUK',
          label: '',
          x,
          y: 90,
          vx: 0,
          vy: 0,
          radius: r,
          mass: m,
          isAlive: true,
          falling: false,
          fallProgress: 0,
        });
      });
    } else if (formation === 'battle7') {
      // 7 vs 7 battle
      const colsA = [100, 180, 260, 320, 380, 460, 540];
      const colsB = [100, 180, 260, 320, 380, 460, 540];
      colsA.forEach((x, i) => {
        const y = i % 2 === 0 ? 550 : 480;
        stones.push({
          id: `b-${i}`,
          side: 'A',
          pieceType: 'BADUK',
          label: '',
          x,
          y,
          vx: 0,
          vy: 0,
          radius: r,
          mass: m,
          isAlive: true,
          falling: false,
          fallProgress: 0,
        });
      });
      colsB.forEach((x, i) => {
        const y = i % 2 === 0 ? 90 : 160;
        stones.push({
          id: `w-${i}`,
          side: 'B',
          pieceType: 'BADUK',
          label: '',
          x,
          y,
          vx: 0,
          vy: 0,
          radius: r,
          mass: m,
          isAlive: true,
          falling: false,
          fallProgress: 0,
        });
      });
    } else if (formation === 'triangle') {
      // Triangle wedge
      const ptsA = [
        { x: midX, y: 440 },
        { x: midX - 60, y: 510 },
        { x: midX + 60, y: 510 },
        { x: midX - 120, y: 570 },
        { x: midX, y: 570 },
        { x: midX + 120, y: 570 },
      ];
      const ptsB = [
        { x: midX, y: 200 },
        { x: midX - 60, y: 130 },
        { x: midX + 60, y: 130 },
        { x: midX - 120, y: 70 },
        { x: midX, y: 70 },
        { x: midX + 120, y: 70 },
      ];
      ptsA.forEach((pt, i) => {
        stones.push({
          id: `b-${i}`,
          side: 'A',
          pieceType: 'BADUK',
          label: '',
          x: pt.x,
          y: pt.y,
          vx: 0,
          vy: 0,
          radius: r,
          mass: m,
          isAlive: true,
          falling: false,
          fallProgress: 0,
        });
      });
      ptsB.forEach((pt, i) => {
        stones.push({
          id: `w-${i}`,
          side: 'B',
          pieceType: 'BADUK',
          label: '',
          x: pt.x,
          y: pt.y,
          vx: 0,
          vy: 0,
          radius: r,
          mass: m,
          isAlive: true,
          falling: false,
          fallProgress: 0,
        });
      });
    } else {
      // Fortress
      const ptsA = [
        { x: midX, y: 540 },
        { x: midX - 80, y: 540 },
        { x: midX + 80, y: 540 },
        { x: midX - 40, y: 470 },
        { x: midX + 40, y: 470 },
      ];
      const ptsB = [
        { x: midX, y: 100 },
        { x: midX - 80, y: 100 },
        { x: midX + 80, y: 100 },
        { x: midX - 40, y: 170 },
        { x: midX + 40, y: 170 },
      ];
      ptsA.forEach((pt, i) => {
        stones.push({
          id: `b-${i}`,
          side: 'A',
          pieceType: 'BADUK',
          label: '',
          x: pt.x,
          y: pt.y,
          vx: 0,
          vy: 0,
          radius: r,
          mass: m,
          isAlive: true,
          falling: false,
          fallProgress: 0,
        });
      });
      ptsB.forEach((pt, i) => {
        stones.push({
          id: `w-${i}`,
          side: 'B',
          pieceType: 'BADUK',
          label: '',
          x: pt.x,
          y: pt.y,
          vx: 0,
          vy: 0,
          radius: r,
          mass: m,
          isAlive: true,
          falling: false,
          fallProgress: 0,
        });
      });
    }
  } else {
    // Janggi Board Pieces (Different weights, sizes, labels)
    if (formation === 'standard5') {
      const choPieces = [
        { label: '車', type: 'CHARIOT' as const, x: 120, y: 550, r: 21, m: 1.5 },
        { label: '包', type: 'CANNON' as const, x: 220, y: 550, r: 21, m: 1.5 },
        { label: '楚', type: 'KING' as const, x: 320, y: 550, r: 25, m: 2.2 },
        { label: '馬', type: 'HORSE' as const, x: 420, y: 550, r: 19, m: 1.2 },
        { label: '卒', type: 'SOLDIER' as const, x: 520, y: 550, r: 17, m: 0.9 },
      ];
      const hanPieces = [
        { label: '車', type: 'CHARIOT' as const, x: 120, y: 90, r: 21, m: 1.5 },
        { label: '包', type: 'CANNON' as const, x: 220, y: 90, r: 21, m: 1.5 },
        { label: '漢', type: 'KING' as const, x: 320, y: 90, r: 25, m: 2.2 },
        { label: '馬', type: 'HORSE' as const, x: 420, y: 90, r: 19, m: 1.2 },
        { label: '兵', type: 'SOLDIER' as const, x: 520, y: 90, r: 17, m: 0.9 },
      ];

      choPieces.forEach((p, i) => {
        stones.push({
          id: `cho-${i}`,
          side: 'A',
          pieceType: p.type,
          label: p.label,
          x: p.x,
          y: p.y,
          vx: 0,
          vy: 0,
          radius: p.r,
          mass: p.m,
          isAlive: true,
          falling: false,
          fallProgress: 0,
        });
      });
      hanPieces.forEach((p, i) => {
        stones.push({
          id: `han-${i}`,
          side: 'B',
          pieceType: p.type,
          label: p.label,
          x: p.x,
          y: p.y,
          vx: 0,
          vy: 0,
          radius: p.r,
          mass: p.m,
          isAlive: true,
          falling: false,
          fallProgress: 0,
        });
      });
    } else {
      // 7 Pieces Fortress/Battle
      const choPieces = [
        { label: '車', type: 'CHARIOT' as const, x: 140, y: 560, r: 21, m: 1.5 },
        { label: '包', type: 'CANNON' as const, x: 230, y: 500, r: 21, m: 1.5 },
        { label: '楚', type: 'KING' as const, x: 320, y: 560, r: 25, m: 2.2 },
        { label: '士', type: 'GUARD' as const, x: 320, y: 490, r: 17, m: 0.9 },
        { label: '包', type: 'CANNON' as const, x: 410, y: 500, r: 21, m: 1.5 },
        { label: '車', type: 'CHARIOT' as const, x: 500, y: 560, r: 21, m: 1.5 },
        { label: '卒', type: 'SOLDIER' as const, x: 320, y: 430, r: 17, m: 0.9 },
      ];
      const hanPieces = [
        { label: '車', type: 'CHARIOT' as const, x: 140, y: 80, r: 21, m: 1.5 },
        { label: '包', type: 'CANNON' as const, x: 230, y: 140, r: 21, m: 1.5 },
        { label: '漢', type: 'KING' as const, x: 320, y: 80, r: 25, m: 2.2 },
        { label: '士', type: 'GUARD' as const, x: 320, y: 150, r: 17, m: 0.9 },
        { label: '包', type: 'CANNON' as const, x: 410, y: 140, r: 21, m: 1.5 },
        { label: '車', type: 'CHARIOT' as const, x: 500, y: 80, r: 21, m: 1.5 },
        { label: '兵', type: 'SOLDIER' as const, x: 320, y: 210, r: 17, m: 0.9 },
      ];

      choPieces.forEach((p, i) => {
        stones.push({
          id: `cho-${i}`,
          side: 'A',
          pieceType: p.type,
          label: p.label,
          x: p.x,
          y: p.y,
          vx: 0,
          vy: 0,
          radius: p.r,
          mass: p.m,
          isAlive: true,
          falling: false,
          fallProgress: 0,
        });
      });
      hanPieces.forEach((p, i) => {
        stones.push({
          id: `han-${i}`,
          side: 'B',
          pieceType: p.type,
          label: p.label,
          x: p.x,
          y: p.y,
          vx: 0,
          vy: 0,
          radius: p.r,
          mass: p.m,
          isAlive: true,
          falling: false,
          fallProgress: 0,
        });
      });
    }
  }

  return stones;
}

export interface CollisionEvent {
  s1: AlkkagiStone;
  s2: AlkkagiStone;
  relativeSpeed: number;
}

export function updatePhysicsStep(
  stones: AlkkagiStone[],
  config: AlkkagiPhysicsConfig
): {
  hasMoving: boolean;
  collisions: CollisionEvent[];
  newlyFallen: AlkkagiStone[];
} {
  let hasMoving = false;
  const collisions: CollisionEvent[] = [];
  const newlyFallen: AlkkagiStone[] = [];

  const minSpeed = 0.04;

  // 1. Move & Apply Friction
  for (const s of stones) {
    if (!s.isAlive) continue;

    if (s.falling) {
      s.fallProgress += 0.06;
      s.x += s.vx * 0.5;
      s.y += s.vy * 0.5;
      hasMoving = true;
      if (s.fallProgress >= 1) {
        s.isAlive = false;
        s.vx = 0;
        s.vy = 0;
      }
      continue;
    }

    const speed = Math.hypot(s.vx, s.vy);
    if (speed > 0) {
      hasMoving = true;
      s.x += s.vx;
      s.y += s.vy;

      s.vx *= config.friction;
      s.vy *= config.friction;

      if (speed < minSpeed) {
        s.vx = 0;
        s.vy = 0;
      }

      // Check board boundaries (falling off the board edge)
      if (
        s.x < BOARD_PADDING ||
        s.x > BOARD_WIDTH - BOARD_PADDING ||
        s.y < BOARD_PADDING ||
        s.y > BOARD_HEIGHT - BOARD_PADDING
      ) {
        s.falling = true;
        s.fallProgress = 0;
        newlyFallen.push(s);
      }
    }
  }

  // 2. Circle-to-Circle Elastic Collision
  const n = stones.length;
  for (let i = 0; i < n; i += 1) {
    const s1 = stones[i];
    if (!s1.isAlive || s1.falling) continue;

    for (let j = i + 1; j < n; j += 1) {
      const s2 = stones[j];
      if (!s2.isAlive || s2.falling) continue;

      const dx = s2.x - s1.x;
      const dy = s2.y - s1.y;
      const dist = Math.hypot(dx, dy);
      const minDist = s1.radius + s2.radius;

      if (dist < minDist && dist > 0.0001) {
        // Normal vector
        const nx = dx / dist;
        const ny = dy / dist;

        // Relative velocity
        const rvx = s2.vx - s1.vx;
        const rvy = s2.vy - s1.vy;
        const velAlongNormal = rvx * nx + rvy * ny;

        // Only resolve if objects are approaching each other
        if (velAlongNormal < 0) {
          const e = config.restitution;
          const impulse = (-(1 + e) * velAlongNormal) / (1 / s1.mass + 1 / s2.mass);

          const impulseX = impulse * nx;
          const impulseY = impulse * ny;

          s1.vx -= impulseX / s1.mass;
          s1.vy -= impulseY / s1.mass;
          s2.vx += impulseX / s2.mass;
          s2.vy += impulseY / s2.mass;

          // Positional separation correction to prevent overlap sticking
          const overlap = (minDist - dist) * 0.5;
          s1.x -= overlap * nx;
          s1.y -= overlap * ny;
          s2.x += overlap * nx;
          s2.y += overlap * ny;

          hasMoving = true;
          collisions.push({
            s1,
            s2,
            relativeSpeed: Math.abs(velAlongNormal),
          });
        }
      }
    }
  }

  return { hasMoving, collisions, newlyFallen };
}

/**
 * AI Bot Aiming Calculation
 * Finds the optimal angle and power to strike an opponent stone towards board boundary
 */
export function calculateAIAim(
  stones: AlkkagiStone[],
  aiSide: AlkkagiSide,
  config: AlkkagiPhysicsConfig
): {
  shooterId: string;
  impulseX: number;
  impulseY: number;
  targetId: string;
} | null {
  const myStones = stones.filter((s) => s.isAlive && !s.falling && s.side === aiSide);
  const oppStones = stones.filter((s) => s.isAlive && !s.falling && s.side !== aiSide);

  if (myStones.length === 0 || oppStones.length === 0) return null;

  let bestShooter = myStones[0];
  let bestOpponent = oppStones[0];
  let bestScore = -Infinity;
  let bestImpulseX = 0;
  let bestImpulseY = 0;

  for (const my of myStones) {
    for (const opp of oppStones) {
      const dx = opp.x - my.x;
      const dy = opp.y - my.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 1) continue;

      const dirX = dx / dist;
      const dirY = dy / dist;

      // Check distance from opponent to board edges
      const distToEdge = Math.min(
        opp.x - BOARD_PADDING,
        BOARD_WIDTH - BOARD_PADDING - opp.x,
        opp.y - BOARD_PADDING,
        BOARD_HEIGHT - BOARD_PADDING - opp.y
      );

      // Score: prefer closer opponents that are near edges
      const score = 1000 / (dist + 50) + (200 - distToEdge) * 1.5 + (opp.mass < my.mass ? 50 : 0);

      if (score > bestScore) {
        bestScore = score;
        bestShooter = my;
        bestOpponent = opp;

        // Power calculation: enough to push opponent beyond edge + slight jitter
        const reqPower = Math.min(
          config.maxPower,
          Math.max(16, dist * 0.08 + distToEdge * 0.12 + 10)
        );

        // Add slight realistic human-like variance (-0.03 to +0.03 rad)
        const jitter = (Math.random() - 0.5) * 0.04;
        const cosJ = Math.cos(jitter);
        const sinJ = Math.sin(jitter);
        const shootX = dirX * cosJ - dirY * sinJ;
        const shootY = dirX * sinJ + dirY * cosJ;

        bestImpulseX = shootX * reqPower;
        bestImpulseY = shootY * reqPower;
      }
    }
  }

  return {
    shooterId: bestShooter.id,
    impulseX: bestImpulseX,
    impulseY: bestImpulseY,
    targetId: bestOpponent.id,
  };
}
