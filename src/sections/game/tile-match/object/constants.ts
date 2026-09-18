export const BLOCK_NONE = -1;
export const BLOCK_EMPTY = 0;
export const BLOCK_WALL = 1;
export const BLOCK_STRAWBERRY = 2;
export const BLOCK_PINEAPPLE = 3;
export const BLOCK_CHESTNUT = 4;
export const BLOCK_CORN = 4;
export const BLOCK_WATERMELON = 5;
export const BLOCK_SWEET_POTATO = 6;
export const BLOCK_APPLE = 7;
export const BLOCK_PEACH = 8;
export const BLOCK_KOREAN_MELON = 9;
export const BLOCK_BLUEBERRY = 10;
export const BLOCK_GRAPE = 11;
export const BLOCK_BOMB = 30;
export const BLOCK_SPIKE_U = 40;
export const BLOCK_SPIKE_D = 41;
export const BLOCK_SPIKE_L = 42;
export const BLOCK_SPIKE_R = 43;

export const BLOCK_PORTAL_1 = 51;
export const BLOCK_PORTAL_2 = 52;
export const BLOCK_PORTAL_3 = 53;
export const BLOCK_PORTAL_4 = 54;
export const BLOCK_PORTAL_5 = 55;
export const BLOCK_PORTAL_6 = 56;
export const BLOCK_PORTAL_7 = 57;

export const BLOCK_BLACKHOLE_1 = 61;
export const BLOCK_BLACKHOLE_2 = 62;
export const BLOCK_BLACKHOLE_3 = 63;
export const BLOCK_BLACKHOLE_4 = 64;
export const BLOCK_BLACKHOLE_5 = 65;
export const BLOCK_BLACKHOLE_6 = 66;
export const BLOCK_BLACKHOLE_7 = 67;

// Aliases for backward compatibility
export const BLOCK_WORMHOLE_1 = BLOCK_PORTAL_1;
export const BLOCK_WORMHOLE_2 = BLOCK_PORTAL_2;
export const BLOCK_WORMHOLE_3 = BLOCK_PORTAL_3;
export const BLOCK_WORMHOLE_4 = BLOCK_PORTAL_4;
export const BLOCK_WORMHOLE_5 = BLOCK_PORTAL_5;
export const BLOCK_WORMHOLE_6 = BLOCK_PORTAL_6;
export const BLOCK_WORMHOLE_7 = BLOCK_PORTAL_7;

export const PORTAL_BLOCK_TYPES: BlockId[] = [
  BLOCK_PORTAL_1,
  BLOCK_PORTAL_2,
  BLOCK_PORTAL_3,
  BLOCK_PORTAL_4,
  BLOCK_PORTAL_5,
  BLOCK_PORTAL_6,
  BLOCK_PORTAL_7,
];
export const WORMHOLE_BLOCK_TYPES = PORTAL_BLOCK_TYPES;

export function isPortalBlock(id: BlockId): boolean {
  return id >= BLOCK_PORTAL_1 && id <= BLOCK_PORTAL_7;
}
export const isWormholeBlock = isPortalBlock;

export const BLACKHOLE_BLOCK_TYPES: BlockId[] = [
  BLOCK_BLACKHOLE_1,
  BLOCK_BLACKHOLE_2,
  BLOCK_BLACKHOLE_3,
  BLOCK_BLACKHOLE_4,
  BLOCK_BLACKHOLE_5,
  BLOCK_BLACKHOLE_6,
  BLOCK_BLACKHOLE_7,
];

export function isBlackholeBlock(id: BlockId): boolean {
  return id >= BLOCK_BLACKHOLE_1 && id <= BLOCK_BLACKHOLE_7;
}

export function validatePortals(grid: BlockId[][]): {
  valid: boolean;
  invalidPortalId?: BlockId;
  count?: number;
} {
  const counts: Record<BlockId, number> = {
    [BLOCK_PORTAL_1]: 0,
    [BLOCK_PORTAL_2]: 0,
    [BLOCK_PORTAL_3]: 0,
    [BLOCK_PORTAL_4]: 0,
    [BLOCK_PORTAL_5]: 0,
    [BLOCK_PORTAL_6]: 0,
    [BLOCK_PORTAL_7]: 0,
  };

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const cell = grid[r][c];
      if (isPortalBlock(cell)) {
        counts[cell] = (counts[cell] || 0) + 1;
      }
    }
  }

  for (const portalId of PORTAL_BLOCK_TYPES) {
    const count = counts[portalId];
    if (count !== 0 && count !== 2) {
      return { valid: false, invalidPortalId: portalId, count };
    }
  }

  return { valid: true };
}
export const validateWormholes = validatePortals;

export function validateBlackholes(grid: BlockId[][]): {
  valid: boolean;
  invalidBlackholeId?: BlockId;
  count?: number;
} {
  const counts: Record<BlockId, number> = {
    [BLOCK_BLACKHOLE_1]: 0,
    [BLOCK_BLACKHOLE_2]: 0,
    [BLOCK_BLACKHOLE_3]: 0,
    [BLOCK_BLACKHOLE_4]: 0,
    [BLOCK_BLACKHOLE_5]: 0,
    [BLOCK_BLACKHOLE_6]: 0,
    [BLOCK_BLACKHOLE_7]: 0,
  };

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const cell = grid[r][c];
      if (isBlackholeBlock(cell)) {
        counts[cell] = (counts[cell] || 0) + 1;
      }
    }
  }

  for (const bhId of BLACKHOLE_BLOCK_TYPES) {
    const count = counts[bhId];
    if (count !== 0 && count !== 2) {
      return { valid: false, invalidBlackholeId: bhId, count };
    }
  }

  return { valid: true };
}

export const BLOCK_NUM_1 = 71;
export const BLOCK_NUM_2 = 72;
export const BLOCK_NUM_3 = 73;
export const BLOCK_NUM_4 = 74;
export const BLOCK_NUM_5 = 75;

export const BLOCK_LETTER_A = 81;
export const BLOCK_LETTER_B = 82;
export const BLOCK_LETTER_C = 83;
export const BLOCK_LETTER_D = 84;
export const BLOCK_LETTER_E = 85;

export const BLOCK_STRAW_1 = 91;
export const BLOCK_STRAW_2 = 92;
export const BLOCK_STRAW_3 = 93;
export const BLOCK_STRAW_4 = 94;
export const BLOCK_STRAW_5 = 95;

export const BLOCK_SHEEP = 101;
export const BLOCK_RABBIT = 102;
export const BLOCK_CHICKEN = 103;
export const BLOCK_CHICKEN_D = 103;
export const BLOCK_CHICKEN_U = 108;
export const BLOCK_CHICKEN_L = 109;
export const BLOCK_CHICKEN_R = 110;
export const BLOCK_EGG = 104;
export const BLOCK_PATH = 105;
export const BLOCK_COW_MALE = 106;
export const BLOCK_COW_FEMALE = 107;

// ── Path Tile Types for statusMap ──
export const PATH_NONE = 0;
export const PATH_H = 1; // Horizontal ─ (Left <-> Right)
export const PATH_V = 2; // Vertical │ (Up <-> Down)
export const PATH_CORNER_TL = 3; // ┌ (Down <-> Right)
export const PATH_CORNER_TR = 4; // ┐ (Down <-> Left)
export const PATH_CORNER_BR = 5; // ┘ (Up <-> Left)
export const PATH_CORNER_BL = 6; // └ (Up <-> Right)
export const PATH_CROSS = 7; // ┼ (Up, Down, Left, Right)
export const PATH_T_DOWN = 8; // ┬ (Left, Right, Down)
export const PATH_T_UP = 9; // ┴ (Left, Right, Up)
export const PATH_T_RIGHT = 10; // ├ (Up, Down, Right)
export const PATH_T_LEFT = 11; // ┤ (Up, Down, Left)

// ── Waterway (수로) Tile Types for statusMap ──
// Straight Flow
export const WATER_R = 21; // Flow East (Left -> Right: →)
export const WATER_L = 22; // Flow West (Right -> Left: ←)
export const WATER_D = 23; // Flow South (Up -> Down: ↓)
export const WATER_U = 24; // Flow North (Down -> Up: ↑)

// Curved Corners (CW: Clockwise, CCW: Counter-Clockwise)
export const WATER_CORNER_TL_CW = 25; // ┌ (Down to Right: ↑ then →)
export const WATER_CORNER_TL_CCW = 26; // ┌ (Right to Down: ← then ↓)
export const WATER_CORNER_TR_CW = 27; // ┐ (Left to Down: → then ↓)
export const WATER_CORNER_TR_CCW = 28; // ┐ (Down to Left: ↑ then ←)
export const WATER_CORNER_BR_CW = 29; // ┘ (Up to Left: ↓ then ←)
export const WATER_CORNER_BR_CCW = 30; // ┘ (Left to Up: → then ↑)
export const WATER_CORNER_BL_CW = 31; // └ (Right to Up: ← then ↑)
export const WATER_CORNER_BL_CCW = 32; // └ (Up to Right: ↓ then →)

// Ends with Rocks (Dead End / Terminus: flow stops at stone)
export const WATER_END_R = 33; // Flow Right into Stone (→ [Rock])
export const WATER_END_L = 34; // Flow Left into Stone (← [Rock])
export const WATER_END_D = 35; // Flow Down into Stone (↓ [Rock])
export const WATER_END_U = 36; // Flow Up into Stone (↑ [Rock])

// Starts with Rocks (Source: flow emerges from stone)
export const WATER_START_R = 37; // [Rock] Source Flowing Right (→)
export const WATER_START_L = 38; // [Rock] Source Flowing Left (←)
export const WATER_START_D = 39; // [Rock] Source Flowing Down (↓)
export const WATER_START_U = 40; // [Rock] Source Flowing Up (↑)

export function isWaterTile(tileType: number): boolean {
  return tileType >= WATER_R && tileType <= WATER_START_U;
}

export function getWaterFlowVector(tileType: number): { dx: number; dy: number } | null {
  switch (tileType) {
    case WATER_R:
    case WATER_CORNER_TL_CW:
    case WATER_CORNER_BL_CCW:
    case WATER_START_R:
      return { dx: 1, dy: 0 };

    case WATER_L:
    case WATER_CORNER_TR_CCW:
    case WATER_CORNER_BR_CW:
    case WATER_START_L:
      return { dx: -1, dy: 0 };

    case WATER_D:
    case WATER_CORNER_TL_CCW:
    case WATER_CORNER_TR_CW:
    case WATER_START_D:
      return { dx: 0, dy: 1 };

    case WATER_U:
    case WATER_CORNER_BR_CCW:
    case WATER_CORNER_BL_CW:
    case WATER_START_U:
      return { dx: 0, dy: -1 };

    case WATER_END_R:
    case WATER_END_L:
    case WATER_END_D:
    case WATER_END_U:
    default:
      return null;
  }
}

export interface PathConnections {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

export function getPathConnections(pathType: number): PathConnections {
  switch (pathType) {
    case PATH_H:
      return { up: false, down: false, left: true, right: true };
    case PATH_V:
      return { up: true, down: true, left: false, right: false };
    case PATH_CORNER_TL:
      return { up: false, down: true, left: false, right: true };
    case PATH_CORNER_TR:
      return { up: false, down: true, left: true, right: false };
    case PATH_CORNER_BR:
      return { up: true, down: false, left: true, right: false };
    case PATH_CORNER_BL:
      return { up: true, down: false, left: false, right: true };
    case PATH_CROSS:
      return { up: true, down: true, left: true, right: true };
    case PATH_T_DOWN:
      return { up: false, down: true, left: true, right: true };
    case PATH_T_UP:
      return { up: true, down: false, left: true, right: true };
    case PATH_T_RIGHT:
      return { up: true, down: true, left: false, right: true };
    case PATH_T_LEFT:
      return { up: true, down: true, left: true, right: false };

    // Waterway Straight
    case WATER_R:
    case WATER_L:
      return { up: false, down: false, left: true, right: true };
    case WATER_D:
    case WATER_U:
      return { up: true, down: true, left: false, right: false };

    // Waterway Corners
    case WATER_CORNER_TL_CW:
    case WATER_CORNER_TL_CCW:
      return { up: false, down: true, left: false, right: true };
    case WATER_CORNER_TR_CW:
    case WATER_CORNER_TR_CCW:
      return { up: false, down: true, left: true, right: false };
    case WATER_CORNER_BR_CW:
    case WATER_CORNER_BR_CCW:
      return { up: true, down: false, left: true, right: false };
    case WATER_CORNER_BL_CW:
    case WATER_CORNER_BL_CCW:
      return { up: true, down: false, left: false, right: true };

    // Waterway Ends & Starts
    case WATER_END_R:
    case WATER_START_L:
      return { up: false, down: false, left: true, right: false };
    case WATER_END_L:
    case WATER_START_R:
      return { up: false, down: false, left: false, right: true };
    case WATER_END_D:
    case WATER_START_U:
      return { up: true, down: false, left: false, right: false };
    case WATER_END_U:
    case WATER_START_D:
      return { up: false, down: true, left: false, right: false };

    default:
      return { up: false, down: false, left: false, right: false };
  }
}

export const TARGET_ANIMAL_BLOCK_TYPES: BlockId[] = [
  BLOCK_SHEEP,
  BLOCK_RABBIT,
  BLOCK_CHICKEN,
  BLOCK_CHICKEN_D,
  BLOCK_CHICKEN_U,
  BLOCK_CHICKEN_L,
  BLOCK_CHICKEN_R,
  BLOCK_EGG,
  BLOCK_COW_MALE,
  BLOCK_COW_FEMALE,
];

export function isTargetAnimalBlock(id: BlockId): boolean {
  const baseId = getBaseBlockId(id);
  return TARGET_ANIMAL_BLOCK_TYPES.includes(baseId);
}

export const CHICKEN_BLOCK_TYPES: BlockId[] = [
  BLOCK_CHICKEN,
  BLOCK_CHICKEN_D,
  BLOCK_CHICKEN_U,
  BLOCK_CHICKEN_L,
  BLOCK_CHICKEN_R,
];

export function isChickenBlock(id: BlockId): boolean {
  const baseId = getBaseBlockId(id);
  return (
    baseId === BLOCK_CHICKEN ||
    baseId === BLOCK_CHICKEN_U ||
    baseId === BLOCK_CHICKEN_L ||
    baseId === BLOCK_CHICKEN_R
  );
}

export function getInitialChickenDirection(id: BlockId): 'up' | 'down' | 'left' | 'right' {
  const baseId = getBaseBlockId(id);
  switch (baseId) {
    case BLOCK_CHICKEN_U:
      return 'up';
    case BLOCK_CHICKEN_L:
      return 'left';
    case BLOCK_CHICKEN_R:
      return 'right';
    case BLOCK_CHICKEN_D:
    case BLOCK_CHICKEN:
    default:
      return 'down';
  }
}

export const STRAW_BLOCK_TYPES: BlockId[] = [
  BLOCK_STRAW_1,
  BLOCK_STRAW_2,
  BLOCK_STRAW_3,
  BLOCK_STRAW_4,
  BLOCK_STRAW_5,
];

export function isStrawBlock(id: BlockId): boolean {
  return id >= BLOCK_STRAW_1 && id <= BLOCK_STRAW_5;
}

export function getNextStrawBlockId(id: BlockId): BlockId {
  if (id > BLOCK_STRAW_1 && id <= BLOCK_STRAW_5) {
    return id - 1;
  }
  return BLOCK_EMPTY;
}

export type BlockId = number;

export const BLOCK_ICE_OFFSET = 1000;

export function isFrozenBlock(id: BlockId): boolean {
  return id >= BLOCK_ICE_OFFSET;
}

export function getBaseBlockId(id: BlockId): BlockId {
  return isFrozenBlock(id) ? id - BLOCK_ICE_OFFSET : id;
}

export function canBeFrozen(id: BlockId): boolean {
  const baseId = getBaseBlockId(id);
  if (baseId <= 0) return false; // BLOCK_NONE (-1), BLOCK_EMPTY (0)
  if (baseId === BLOCK_WALL) return false; // BLOCK_WALL (1)
  if (baseId >= BLOCK_SPIKE_U && baseId <= BLOCK_SPIKE_R) return false; // SPIKES (40-43)
  if (isPortalBlock(baseId)) return false; // PORTALS (51-57)
  if (isBlackholeBlock(baseId)) return false; // BLACKHOLES (61-67)
  if (isStrawBlock(baseId)) return false; // STRAWS (91-95)
  return true;
}

export function getFrozenBlockId(id: BlockId): BlockId {
  if (!canBeFrozen(id)) return id;
  return isFrozenBlock(id) ? id : id + BLOCK_ICE_OFFSET;
}

export function unfreezeBlockId(id: BlockId): BlockId {
  return getBaseBlockId(id);
}

// Array of matchable puzzle block types (10 types in total)
export const PUZZLE_BLOCK_TYPES: BlockId[] = [
  BLOCK_STRAWBERRY,
  BLOCK_PINEAPPLE,
  BLOCK_CHESTNUT,
  BLOCK_WATERMELON,
  BLOCK_SWEET_POTATO,
  BLOCK_APPLE,
  BLOCK_PEACH,
  BLOCK_KOREAN_MELON,
  BLOCK_BLUEBERRY,
  BLOCK_GRAPE,
  BLOCK_NUM_1,
  BLOCK_NUM_2,
  BLOCK_NUM_3,
  BLOCK_NUM_4,
  BLOCK_NUM_5,
  BLOCK_LETTER_A,
  BLOCK_LETTER_B,
  BLOCK_LETTER_C,
  BLOCK_LETTER_D,
  BLOCK_LETTER_E,
  BLOCK_SHEEP,
  BLOCK_RABBIT,
  BLOCK_CHICKEN,
  BLOCK_COW_MALE,
  BLOCK_COW_FEMALE,
];

// Sizing and spacing constants for blocks on the stage play board
// Adjust these to change the visual padding/spacing between blocks.
export const STAGE_BLOCK_SIZE_PERCENT = 100; // Block size percentage relative to the grid cell (e.g. 88% width/height, leaving 12% padding)
export const STAGE_GRID_GAP_REM = 0.0; // Gap between grid cells in rem (0.0 = seamless grid board)
export const STAGE_MAX_HEIGHT_VH_PERCENT = 76; // Maximum screen height percentage occupied by the stage tile board (e.g. 80 = 80%)

// ============================================================================
// 개별 오브젝트 크기 조절 변수 (Scale Multipliers for Object Components)
// 1.0 = 기본 100% 크기, 1.2 = 120% 크기, 0.8 = 80% 크기 등 각각 자유롭게 조절할 수 있습니다.
// ============================================================================
export const OBJECT_SCALES = {
  strawberry: 1.2,
  pineapple: 1.2,
  chestnut: 1.2,
  corn: 1.2,
  watermelon: 1.2,
  sweetPotato: 1.2,
  apple: 1.2,
  peach: 1.2,
  koreanMelon: 1.2,
  blueberry: 1.2,
  grape: 1.2,
  wall: 1.0,
  wallV: 1.0,
  wallH: 1.1,
  wallAutoV: 1.1,
  wallAutoH: 1.1,
  bomb: 1.2,
  spike: 1.0,
  numBlock: 1.2,
  letterBlock: 1.2,
  straw: 1.2,
  soilTileDark: 1.0,
  soilTileLight: 1.0,
  portal: 1.0,
  wormhole: 1.0,
  blackhole: 1.0,
  sheep: 1.2,
  rabbit: 1.2,
  chicken: 1.2,
  egg: 1.1,
  pathTile: 1.0,
  cowMale: 1.2,
  cowFemale: 1.2,
};

// Soil tile outer border thickness percentage (e.g. 6 = 6% thickness, adjust to change border size)
export const SOIL_TILE_BORDER_WIDTH = 4;

export interface BlockProperties {
  canSelect: boolean;
  canBeDestroyedByShooter: boolean;
  canFall: boolean;
}

export const BLOCK_PROPERTIES: Record<BlockId, BlockProperties> = {
  [BLOCK_NONE]: {
    canSelect: false,
    canBeDestroyedByShooter: false,
    canFall: false,
  },
  [BLOCK_EMPTY]: {
    canSelect: false,
    canBeDestroyedByShooter: false,
    canFall: false,
  },
  [BLOCK_WALL]: {
    canSelect: false,
    canBeDestroyedByShooter: false,
    canFall: false,
  },
  [BLOCK_STRAWBERRY]: {
    canSelect: true,
    canBeDestroyedByShooter: true,
    canFall: true,
  },
  [BLOCK_PINEAPPLE]: {
    canSelect: true,
    canBeDestroyedByShooter: true,
    canFall: true,
  },
  [BLOCK_CHESTNUT]: {
    canSelect: true,
    canBeDestroyedByShooter: true,
    canFall: true,
  },
  [BLOCK_WATERMELON]: {
    canSelect: true,
    canBeDestroyedByShooter: true,
    canFall: true,
  },
  [BLOCK_SWEET_POTATO]: {
    canSelect: true,
    canBeDestroyedByShooter: true,
    canFall: true,
  },
  [BLOCK_APPLE]: {
    canSelect: true,
    canBeDestroyedByShooter: true,
    canFall: true,
  },
  [BLOCK_PEACH]: {
    canSelect: true,
    canBeDestroyedByShooter: true,
    canFall: true,
  },
  [BLOCK_KOREAN_MELON]: {
    canSelect: true,
    canBeDestroyedByShooter: true,
    canFall: true,
  },
  [BLOCK_BLUEBERRY]: {
    canSelect: true,
    canBeDestroyedByShooter: true,
    canFall: true,
  },
  [BLOCK_GRAPE]: {
    canSelect: true,
    canBeDestroyedByShooter: true,
    canFall: true,
  },
  [BLOCK_BOMB]: {
    canSelect: true,
    canBeDestroyedByShooter: true,
    canFall: true,
  },
  [BLOCK_SPIKE_U]: {
    canSelect: false,
    canBeDestroyedByShooter: false,
    canFall: false,
  },
  [BLOCK_SPIKE_D]: {
    canSelect: false,
    canBeDestroyedByShooter: false,
    canFall: false,
  },
  [BLOCK_SPIKE_L]: {
    canSelect: false,
    canBeDestroyedByShooter: false,
    canFall: false,
  },
  [BLOCK_SPIKE_R]: {
    canSelect: false,
    canBeDestroyedByShooter: false,
    canFall: false,
  },
  [BLOCK_PORTAL_1]: {
    canSelect: false,
    canBeDestroyedByShooter: false,
    canFall: false,
  },
  [BLOCK_PORTAL_2]: {
    canSelect: false,
    canBeDestroyedByShooter: false,
    canFall: false,
  },
  [BLOCK_PORTAL_3]: {
    canSelect: false,
    canBeDestroyedByShooter: false,
    canFall: false,
  },
  [BLOCK_PORTAL_4]: {
    canSelect: false,
    canBeDestroyedByShooter: false,
    canFall: false,
  },
  [BLOCK_PORTAL_5]: {
    canSelect: false,
    canBeDestroyedByShooter: false,
    canFall: false,
  },
  [BLOCK_PORTAL_6]: {
    canSelect: false,
    canBeDestroyedByShooter: false,
    canFall: false,
  },
  [BLOCK_PORTAL_7]: {
    canSelect: false,
    canBeDestroyedByShooter: false,
    canFall: false,
  },
  [BLOCK_BLACKHOLE_1]: {
    canSelect: false,
    canBeDestroyedByShooter: false,
    canFall: false,
  },
  [BLOCK_BLACKHOLE_2]: {
    canSelect: false,
    canBeDestroyedByShooter: false,
    canFall: false,
  },
  [BLOCK_BLACKHOLE_3]: {
    canSelect: false,
    canBeDestroyedByShooter: false,
    canFall: false,
  },
  [BLOCK_BLACKHOLE_4]: {
    canSelect: false,
    canBeDestroyedByShooter: false,
    canFall: false,
  },
  [BLOCK_BLACKHOLE_5]: {
    canSelect: false,
    canBeDestroyedByShooter: false,
    canFall: false,
  },
  [BLOCK_BLACKHOLE_6]: {
    canSelect: false,
    canBeDestroyedByShooter: false,
    canFall: false,
  },
  [BLOCK_BLACKHOLE_7]: {
    canSelect: false,
    canBeDestroyedByShooter: false,
    canFall: false,
  },
  [BLOCK_NUM_1]: {
    canSelect: true,
    canBeDestroyedByShooter: true,
    canFall: true,
  },
  [BLOCK_NUM_2]: {
    canSelect: true,
    canBeDestroyedByShooter: true,
    canFall: true,
  },
  [BLOCK_NUM_3]: {
    canSelect: true,
    canBeDestroyedByShooter: true,
    canFall: true,
  },
  [BLOCK_NUM_4]: {
    canSelect: true,
    canBeDestroyedByShooter: true,
    canFall: true,
  },
  [BLOCK_NUM_5]: {
    canSelect: true,
    canBeDestroyedByShooter: true,
    canFall: true,
  },
  [BLOCK_LETTER_A]: {
    canSelect: true,
    canBeDestroyedByShooter: true,
    canFall: true,
  },
  [BLOCK_LETTER_B]: {
    canSelect: true,
    canBeDestroyedByShooter: true,
    canFall: true,
  },
  [BLOCK_LETTER_C]: {
    canSelect: true,
    canBeDestroyedByShooter: true,
    canFall: true,
  },
  [BLOCK_LETTER_D]: {
    canSelect: true,
    canBeDestroyedByShooter: true,
    canFall: true,
  },
  [BLOCK_LETTER_E]: {
    canSelect: true,
    canBeDestroyedByShooter: true,
    canFall: true,
  },
  [BLOCK_STRAW_1]: {
    canSelect: false,
    canBeDestroyedByShooter: false,
    canFall: true,
  },
  [BLOCK_STRAW_2]: {
    canSelect: false,
    canBeDestroyedByShooter: false,
    canFall: true,
  },
  [BLOCK_STRAW_3]: {
    canSelect: false,
    canBeDestroyedByShooter: false,
    canFall: true,
  },
  [BLOCK_STRAW_4]: {
    canSelect: false,
    canBeDestroyedByShooter: false,
    canFall: true,
  },
  [BLOCK_STRAW_5]: {
    canSelect: false,
    canBeDestroyedByShooter: false,
    canFall: true,
  },
  [BLOCK_SHEEP]: {
    canSelect: true,
    canBeDestroyedByShooter: true,
    canFall: true,
  },
  [BLOCK_RABBIT]: {
    canSelect: false,
    canBeDestroyedByShooter: true,
    canFall: true,
  },
  [BLOCK_CHICKEN]: {
    canSelect: false,
    canBeDestroyedByShooter: true,
    canFall: true,
  },
  [BLOCK_CHICKEN_U]: {
    canSelect: false,
    canBeDestroyedByShooter: true,
    canFall: true,
  },
  [BLOCK_CHICKEN_L]: {
    canSelect: false,
    canBeDestroyedByShooter: true,
    canFall: true,
  },
  [BLOCK_CHICKEN_R]: {
    canSelect: false,
    canBeDestroyedByShooter: true,
    canFall: true,
  },
  [BLOCK_EGG]: {
    canSelect: false,
    canBeDestroyedByShooter: false,
    canFall: true,
  },
  [BLOCK_PATH]: {
    canSelect: false,
    canBeDestroyedByShooter: false,
    canFall: false,
  },
  [BLOCK_COW_MALE]: {
    canSelect: true,
    canBeDestroyedByShooter: true,
    canFall: true,
  },
  [BLOCK_COW_FEMALE]: {
    canSelect: true,
    canBeDestroyedByShooter: true,
    canFall: true,
  },
};

export function isBlockActive(id: BlockId, grid?: BlockId[][]): boolean {
  const baseId = getBaseBlockId(id);
  if (baseId < BLOCK_NUM_1 || baseId > BLOCK_NUM_5) {
    return true;
  }
  if (!grid) {
    return true; // Default to active if grid is not provided (e.g. editor panel)
  }

  // Active if there are no smaller number blocks present on the grid.
  for (let prevId = BLOCK_NUM_1; prevId < baseId; prevId++) {
    for (let r = 0; r < grid.length; r++) {
      if (grid[r].some((cell) => getBaseBlockId(cell) === prevId)) {
        return false;
      }
    }
  }
  return true;
}

export function isLetterBlockActive(id: BlockId, grid?: BlockId[][]): boolean {
  const baseId = getBaseBlockId(id);
  if (baseId < BLOCK_LETTER_A || baseId > BLOCK_LETTER_E) {
    return true;
  }
  if (!grid) {
    return true; // Default to active if grid is not provided
  }

  // Active (can be destroyed) if there are no smaller letter blocks present on the grid.
  for (let prevId = BLOCK_LETTER_A; prevId < baseId; prevId++) {
    for (let r = 0; r < grid.length; r++) {
      if (grid[r].some((cell) => getBaseBlockId(cell) === prevId)) {
        return false;
      }
    }
  }
  return true;
}

export function getBlockProperties(id: BlockId, grid?: BlockId[][]): BlockProperties {
  const isFrozen = isFrozenBlock(id);
  const baseId = getBaseBlockId(id);

  const staticProps = BLOCK_PROPERTIES[baseId] ?? {
    canSelect: false,
    canBeDestroyedByShooter: false,
    canFall: false,
  };

  let baseProps = { ...staticProps };

  if (baseId >= BLOCK_NUM_1 && baseId <= BLOCK_NUM_5) {
    if (grid) {
      const active = isBlockActive(baseId, grid);
      baseProps = active
        ? { canSelect: true, canBeDestroyedByShooter: true, canFall: true }
        : { canSelect: false, canBeDestroyedByShooter: false, canFall: false };
    }
  } else if (baseId >= BLOCK_LETTER_A && baseId <= BLOCK_LETTER_E) {
    if (grid) {
      const active = isLetterBlockActive(baseId, grid);
      baseProps = {
        canSelect: true,
        canBeDestroyedByShooter: active,
        canFall: true,
      };
    }
  }

  if (isFrozen) {
    return {
      canSelect: false, // Requirement 2: Frozen blocks are NOT selectable
      canBeDestroyedByShooter: baseProps.canBeDestroyedByShooter, // Requirement 1: Frozen target blocks count for clearing
      canFall: baseProps.canFall, // Requirement 3: Same canFall as base block
    };
  }

  return baseProps;
}

export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH || '').trim();

export function getBlockAssetPath(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const base = (process.env.NEXT_PUBLIC_BASE_PATH || '').trim();
  return `${base}${cleanPath}`;
}

export function resolveDynamicPath(targetPath: string): string {
  if (typeof window === 'undefined') return targetPath;

  const href = window.location.href;

  // 1. Get the clean URL without query string or hash
  const urlWithoutQuery = href.split('?')[0].split('#')[0];

  // 2. Find the root directory URL of the application
  let appRootUrl = urlWithoutQuery;

  if (appRootUrl.endsWith('/index.html')) {
    appRootUrl = appRootUrl.slice(0, -11);
  }

  // Strip sub-folder route names if we are inside a sub-route page
  const subFolders = ['/game', '/editor', '/home'];
  for (const folder of subFolders) {
    if (appRootUrl.endsWith(folder)) {
      appRootUrl = appRootUrl.slice(0, -folder.length);
      break;
    } else if (appRootUrl.endsWith(folder + '/')) {
      appRootUrl = appRootUrl.slice(0, -(folder.length + 1));
      break;
    }
  }

  // Ensure root URL ends with a trailing slash
  if (!appRootUrl.endsWith('/')) {
    appRootUrl += '/';
  }

  // 3. Prepare clean target path
  const cleanTarget = targetPath.startsWith('/') ? targetPath.slice(1) : targetPath;
  const [pathPart, queryPart] = cleanTarget.split('?');
  const queryStr = queryPart ? `?${queryPart}` : '';

  const isLocal =
    process.env.NEXT_PUBLIC_APP_ENV?.toUpperCase() === 'LOCAL' ||
    process.env.NODE_ENV === 'development';
  const useIndexHtml = !isLocal || href.includes('index.html');

  let targetFilePath = pathPart;
  if (useIndexHtml) {
    if (targetFilePath.endsWith('/')) {
      targetFilePath = `${targetFilePath}index.html`;
    } else if (targetFilePath === '') {
      targetFilePath = `index.html`;
    } else {
      targetFilePath = `${targetFilePath}/index.html`;
    }
  }

  try {
    const resolved = new URL(targetFilePath + queryStr, appRootUrl);
    return resolved.href;
  } catch {
    return targetPath;
  }
}
