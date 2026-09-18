import type {
  Position,
  Direction,
  FruitItem,
  SnakeBird,
  SpikeItem,
  MoveResult,
  SnakebirdGameState,
} from './snakebird-types';

export const DIR_OFFSETS: Record<Direction, Position> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

/** Deep clone a GameState */
export function cloneGameState(state: SnakebirdGameState): SnakebirdGameState {
  return {
    width: state.width,
    height: state.height,
    walls: state.walls.map((w) => ({ ...w })),
    fruits: state.fruits.map((f) => ({ ...f })),
    spikes: state.spikes.map((s) => ({ ...s })),
    portal: { ...state.portal },
    birds: state.birds.map((b) => ({
      ...b,
      segments: b.segments.map((s) => ({ ...s })),
    })),
    activeBirdId: state.activeBirdId,
    moveCount: state.moveCount,
    isClear: state.isClear,
    isGameOver: state.isGameOver,
    gameOverReason: state.gameOverReason,
    fallingBirdIds: [...state.fallingBirdIds],
  };
}

/** Check if two positions are equal */
export function posEqual(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}

/** Check if position is a wall */
export function isWall(walls: Position[], pos: Position): boolean {
  return walls.some((w) => posEqual(w, pos));
}

/** Check if position is a spike */
export function getSpikeAt(spikes: SpikeItem[], pos: Position): SpikeItem | undefined {
  return spikes.find((s) => s.x === pos.x && s.y === pos.y);
}

/** Check if position has fruit */
export function getFruitAt(fruits: FruitItem[], pos: Position): FruitItem | undefined {
  return fruits.find((f) => f.x === pos.x && f.y === pos.y);
}

/** Get bird segment at position */
export function getBirdAt(
  birds: SnakeBird[],
  pos: Position,
  excludeBirdId?: string
): { bird: SnakeBird; segmentIndex: number } | null {
  for (const bird of birds) {
    if (bird.isExited || bird.isDead) continue;
    if (excludeBirdId && bird.id === excludeBirdId) continue;
    const segIdx = bird.segments.findIndex((s) => posEqual(s, pos));
    if (segIdx !== -1) {
      return { bird, segmentIndex: segIdx };
    }
  }
  return null;
}

/**
 * Check if a bird can be pushed by offset (dx, dy)
 * Handles chain pushing of multiple birds.
 */
export function canPushBirds(
  birds: SnakeBird[],
  walls: Position[],
  spikes: SpikeItem[],
  width: number,
  height: number,
  pushingBirdIds: Set<string>,
  dir: Direction
): { canPush: boolean; allPushedBirdIds: Set<string> } {
  const { x: dx, y: dy } = DIR_OFFSETS[dir];
  const allPushed = new Set<string>(pushingBirdIds);
  let newlyAdded = true;

  while (newlyAdded) {
    newlyAdded = false;
    for (const birdId of Array.from(allPushed)) {
      const bird = birds.find((b) => b.id === birdId);
      if (!bird || bird.isExited || bird.isDead) continue;

      for (const seg of bird.segments) {
        const targetPos: Position = { x: seg.x + dx, y: seg.y + dy };

        // Wall obstacle
        if (isWall(walls, targetPos)) {
          return { canPush: false, allPushedBirdIds: allPushed };
        }

        // Out of horizontal bounds or top bound
        if (targetPos.x < 0 || targetPos.x >= width || targetPos.y < 0) {
          return { canPush: false, allPushedBirdIds: allPushed };
        }

        // Another bird obstacle
        const otherBirdHit = getBirdAt(birds, targetPos);
        if (otherBirdHit && !allPushed.has(otherBirdHit.bird.id)) {
          allPushed.add(otherBirdHit.bird.id);
          newlyAdded = true;
        }
      }
    }
  }

  return { canPush: true, allPushedBirdIds: allPushed };
}

/**
 * Perform a single player move for the active bird.
 */
export function moveBird(
  currentState: SnakebirdGameState,
  birdId: string,
  dir: Direction
): MoveResult {
  if (currentState.isGameOver || currentState.isClear) {
    return { success: false, state: currentState };
  }

  const state = cloneGameState(currentState);
  const bird = state.birds.find((b) => b.id === birdId);

  if (!bird || bird.isExited || bird.isDead || bird.segments.length === 0) {
    return { success: false, state: currentState };
  }

  const head = bird.segments[0];
  const offset = DIR_OFFSETS[dir];
  const targetPos: Position = { x: head.x + offset.x, y: head.y + offset.y };

  // 1. Neck check: cannot immediately reverse into its own neck
  if (bird.segments.length > 1 && posEqual(targetPos, bird.segments[1])) {
    return { success: false, state: currentState };
  }

  // 2. Bound check (left, right, top)
  if (targetPos.x < 0 || targetPos.x >= state.width || targetPos.y < 0) {
    return { success: false, state: currentState };
  }

  // 3. Wall check
  if (isWall(state.walls, targetPos)) {
    return { success: false, state: currentState };
  }

  // 4. Fruit check
  const fruitEaten = getFruitAt(state.fruits, targetPos);

  // 5. Self-collision check
  // Note: If NOT eating fruit, the last tail segment moves, so moving onto the tail is allowed.
  const tailIdx = bird.segments.length - 1;
  for (let i = 1; i < bird.segments.length; i++) {
    if (i === tailIdx && !fruitEaten && posEqual(targetPos, bird.segments[tailIdx])) {
      continue; // Tail is vacating this cell
    }
    if (posEqual(targetPos, bird.segments[i])) {
      return { success: false, state: currentState }; // Self collision
    }
  }

  // 6. Other bird collision & pushing check
  const otherHit = getBirdAt(state.birds, targetPos, bird.id);
  const pushedBirds = new Set<string>();

  if (otherHit) {
    const pushResult = canPushBirds(
      state.birds,
      state.walls,
      state.spikes,
      state.width,
      state.height,
      new Set([otherHit.bird.id]),
      dir
    );

    if (!pushResult.canPush) {
      return { success: false, state: currentState };
    }

    // Apply push translation to all pushed birds
    for (const pId of Array.from(pushResult.allPushedBirdIds)) {
      pushedBirds.add(pId);
      const pBird = state.birds.find((b) => b.id === pId);
      if (pBird) {
        pBird.segments = pBird.segments.map((s) => ({
          x: s.x + offset.x,
          y: s.y + offset.y,
        }));
      }
    }
  }

  // 7. Move active bird forward
  bird.facingDir = dir;
  if (fruitEaten) {
    // Grow length by 1: insert new head at targetPos, keep all previous segments
    bird.segments = [targetPos, ...bird.segments];
    state.fruits = state.fruits.filter((f) => f.id !== fruitEaten.id);
  } else {
    // Normal crawl: new head, shift all segments forward, drop old tail
    bird.segments = [targetPos, ...bird.segments.slice(0, bird.segments.length - 1)];
  }

  state.moveCount += 1;
  const movedBirdIds = [bird.id, ...Array.from(pushedBirds)];

  // 8. Check direct spike hit on head move
  const spikeOnHead = getSpikeAt(state.spikes, targetPos);
  if (spikeOnHead) {
    bird.isDead = true;
    state.isGameOver = true;
    state.gameOverReason = 'spike';
    return {
      success: true,
      state,
      fruitEaten,
      birdsMoved: movedBirdIds,
      died: true,
      deathReason: 'spike',
    };
  }

  // 9. Apply Gravity & Multi-bird physical resolution
  const gravityRes = applyGravity(state);

  // 10. Check Portal Entry & Stage Clear
  checkPortalAndClear(gravityRes.state);

  return {
    success: true,
    state: gravityRes.state,
    fruitEaten,
    birdsMoved: movedBirdIds,
    died: gravityRes.died,
    deathReason: gravityRes.deathReason,
  };
}

/**
 * Find all birds that are supported (grounded or resting on supported birds).
 */
export function findSupportedBirds(birds: SnakeBird[], walls: Position[]): Set<string> {
  const supported = new Set<string>();

  // 1. Birds directly resting on a Wall
  for (const bird of birds) {
    if (bird.isExited || bird.isDead) continue;
    const isDirectlyGrounded = bird.segments.some((seg) =>
      isWall(walls, { x: seg.x, y: seg.y + 1 })
    );
    if (isDirectlyGrounded) {
      supported.add(bird.id);
    }
  }

  // 2. Iteratively add birds resting on already supported birds
  let changed = true;
  while (changed) {
    changed = false;
    for (const bird of birds) {
      if (bird.isExited || bird.isDead || supported.has(bird.id)) continue;

      // Check if any segment of this bird rests on a segment of a supported bird
      const restsOnSupported = bird.segments.some((seg) => {
        const belowPos: Position = { x: seg.x, y: seg.y + 1 };
        const belowBird = getBirdAt(birds, belowPos, bird.id);
        return belowBird && supported.has(belowBird.bird.id);
      });

      if (restsOnSupported) {
        supported.add(bird.id);
        changed = true;
      }
    }
  }

  return supported;
}

/**
 * Simulate turn gravity until state is completely stable or dead.
 */
export function applyGravity(state: SnakebirdGameState): {
  state: SnakebirdGameState;
  died: boolean;
  deathReason?: 'spike' | 'fall';
} {
  let step = 0;
  const maxSteps = state.height + 5;
  const fallingBirdsOverall = new Set<string>();

  while (step < maxSteps) {
    step++;
    const livingBirds = state.birds.filter((b) => !b.isExited && !b.isDead);
    if (livingBirds.length === 0) break;

    const supportedBirdIds = findSupportedBirds(livingBirds, state.walls);

    const unsupportedBirds = livingBirds.filter((b) => !supportedBirdIds.has(b.id));

    if (unsupportedBirds.length === 0) {
      // All birds are stable!
      break;
    }

    // Fall 1 tile down for all unsupported birds
    for (const bird of unsupportedBirds) {
      fallingBirdsOverall.add(bird.id);
      bird.segments = bird.segments.map((s) => ({ x: s.x, y: s.y + 1 }));

      // Check Fall Out of bounds (Void/Water at bottom)
      const isOffScreen = bird.segments.some((s) => s.y >= state.height);
      if (isOffScreen) {
        bird.isDead = true;
        state.isGameOver = true;
        state.gameOverReason = 'fall';
        state.fallingBirdIds = Array.from(fallingBirdsOverall);
        return { state, died: true, deathReason: 'fall' };
      }

      // Check Spike collision during fall
      const hitSpike = bird.segments.some((s) => getSpikeAt(state.spikes, s));
      if (hitSpike) {
        bird.isDead = true;
        state.isGameOver = true;
        state.gameOverReason = 'spike';
        state.fallingBirdIds = Array.from(fallingBirdsOverall);
        return { state, died: true, deathReason: 'spike' };
      }
    }
  }

  state.fallingBirdIds = Array.from(fallingBirdsOverall);
  return { state, died: false };
}

/**
 * Check if any bird enters the portal and if all birds have exited.
 */
export function checkPortalAndClear(state: SnakebirdGameState): void {
  if (state.isGameOver || state.isClear) return;

  const allFruitsEaten = state.fruits.length === 0;

  if (allFruitsEaten) {
    for (const bird of state.birds) {
      if (bird.isExited || bird.isDead || bird.segments.length === 0) continue;

      // Head reaches portal
      const head = bird.segments[0];
      if (posEqual(head, state.portal)) {
        bird.isExited = true;
      }
    }

    // Check if all birds have exited
    const livingBirds = state.birds.filter((b) => !b.isDead);
    if (livingBirds.length > 0 && livingBirds.every((b) => b.isExited)) {
      state.isClear = true;
    }
  }
}

/**
 * Cycle to the next living, non-exited bird.
 */
export function getNextActiveBirdId(state: SnakebirdGameState): string {
  const availableBirds = state.birds.filter((b) => !b.isExited && !b.isDead);
  if (availableBirds.length === 0) return state.activeBirdId;

  const currentIndex = availableBirds.findIndex((b) => b.id === state.activeBirdId);
  if (currentIndex === -1) {
    return availableBirds[0].id;
  }
  const nextIndex = (currentIndex + 1) % availableBirds.length;
  return availableBirds[nextIndex].id;
}
