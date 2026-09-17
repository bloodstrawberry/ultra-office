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
export const BLOCK_WALL_V = 20;
export const BLOCK_WALL_H = 21;
export const BLOCK_AUTO_WALL_V = 22;
export const BLOCK_AUTO_WALL_H = 23;
export const BLOCK_BOMB = 30;
export const BLOCK_SHOOTER_L = 31;
export const BLOCK_SHOOTER_R = 32;
export const BLOCK_SHOOTER_L_ONCE = 33;
export const BLOCK_SHOOTER_R_ONCE = 34;
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
  shooter: 1.0,
  spike: 1.0,
  numBlock: 1.2,
  letterBlock: 1.2,
  straw: 1.2,
  soilTileDark: 1.0,
  soilTileLight: 1.0,
  portal: 1.0,
  wormhole: 1.0,
  blackhole: 1.0,
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
  [BLOCK_WALL_V]: {
    canSelect: true,
    canBeDestroyedByShooter: false,
    canFall: false,
  },
  [BLOCK_WALL_H]: {
    canSelect: true,
    canBeDestroyedByShooter: false,
    canFall: false,
  },
  [BLOCK_AUTO_WALL_V]: {
    canSelect: false,
    canBeDestroyedByShooter: false,
    canFall: false,
  },
  [BLOCK_AUTO_WALL_H]: {
    canSelect: false,
    canBeDestroyedByShooter: false,
    canFall: false,
  },
  [BLOCK_BOMB]: {
    canSelect: true,
    canBeDestroyedByShooter: true,
    canFall: true,
  },
  [BLOCK_SHOOTER_L]: {
    canSelect: false,
    canBeDestroyedByShooter: false,
    canFall: false,
  },
  [BLOCK_SHOOTER_R]: {
    canSelect: false,
    canBeDestroyedByShooter: false,
    canFall: false,
  },
  [BLOCK_SHOOTER_L_ONCE]: {
    canSelect: false,
    canBeDestroyedByShooter: false,
    canFall: false,
  },
  [BLOCK_SHOOTER_R_ONCE]: {
    canSelect: false,
    canBeDestroyedByShooter: false,
    canFall: false,
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
