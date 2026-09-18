import {
  CELL_VOID,
  CELL_FLOOR,
  CELL_WALL,
  CELL_TARGET,
  CELL_BOX,
  CELL_BOX_ON_TARGET,
  CELL_PLAYER,
  CELL_PLAYER_ON_TARGET,
  type ParsedLevel,
  type PushPushLevelData,
} from '../game/push-push-types';

export const PUSH_PUSH_LEVELS: PushPushLevelData[] = [
  {
    id: 1,
    name: '1. 첫 번째 푸시',
    parMoves: 1,
    hint: '상자를 위로 한 칸 밀어 목표 지점에 놓으세요.',
    asciiMap: ['-------', '--###--', '--#.#--', '--#$#--', '--#@#--', '--###--', '-------'],
  },
  {
    id: 2,
    name: '2. 방향 바꾸기',
    parMoves: 6,
    hint: '상자를 오른쪽으로 옮긴 뒤 아래로 돌아가 위로 밀어보세요.',
    asciiMap: [
      '--------',
      '-######-',
      '-#   .#-',
      '-# ## #-',
      '-#@$  #-',
      '-#    #-',
      '-######-',
      '--------',
    ],
  },
  {
    id: 3,
    name: '3. 코너의 덫',
    parMoves: 7,
    hint: '상자를 벽 모퉁이에 몰아넣지 말고 뒤편으로 돌아가세요.',
    asciiMap: [
      '--------',
      '-######-',
      '-#    #-',
      '-#@$  #-',
      '-# $  #-',
      '-# .. #-',
      '-######-',
      '--------',
    ],
  },
  {
    id: 4,
    name: '4. 나란한 상자',
    parMoves: 8,
    hint: '두 상자를 차례대로 오른쪽 목표 지점으로 미세요.',
    asciiMap: ['---------', '-#######-', '-#@ $ .#-', '-#  $ .#-', '-#######-', '---------'],
  },
  {
    id: 5,
    name: '5. 두 갈래 길',
    parMoves: 12,
    hint: '상자 뒤에 설 공간을 남겨 두고 각각 위쪽 목표로 옮기세요.',
    asciiMap: [
      '----------',
      '-########-',
      '-# .   .#-',
      '-#  $ $ #-',
      '-#   #  #-',
      '-#   @  #-',
      '-########-',
      '----------',
    ],
  },
  {
    id: 6,
    name: '6. 작은 창고',
    parMoves: 14,
    hint: '가운데 상자 두 개를 분리해서 위아래 목표에 넣으세요.',
    asciiMap: ['-------', '-#####-', '-#.  #-', '-#$$@#-', '-#.  #-', '-#####-', '-------'],
  },
  {
    id: 7,
    name: '7. 세 번째 상자',
    parMoves: 16,
    hint: '위쪽 목표를 먼저 살펴보고 아래쪽 상자를 움직일 경로를 확보하세요.',
    asciiMap: [
      '----------',
      '-########-',
      '-# . .  #-',
      '-# $ $  #-',
      '-#  ##  #-',
      '-# @ $ .#-',
      '-########-',
      '----------',
    ],
  },
  {
    id: 8,
    name: '8. 창고지기의 고민',
    parMoves: 19,
    hint: '중앙의 기둥을 돌아서 상자들을 아래쪽 목표로 밀어보세요.',
    asciiMap: [
      '---------',
      '-#######-',
      '-#  @  #-',
      '-# $$$ #-',
      '-#  #  #-',
      '-# ... #-',
      '-#######-',
      '---------',
    ],
  },
  {
    id: 9,
    name: '9. 풍차',
    parMoves: 26,
    hint: '중앙을 막지 않도록 네 귀퉁이의 목표로 상자를 나눠 보내세요.',
    asciiMap: [
      '-----------',
      '-#########-',
      '-#.  #  .#-',
      '-# $   $ #-',
      '-#  #@#  #-',
      '-# $   $ #-',
      '-#.  #  .#-',
      '-#########-',
      '-----------',
    ],
  },
  {
    id: 10,
    name: '10. 마지막 창고',
    parMoves: 30,
    hint: '위아래 상자를 모두 처리하려면 가운데 통로를 계속 열어 두어야 합니다.',
    asciiMap: [
      '---------',
      '-#######-',
      '-#  .  #-',
      '-# $#$ #-',
      '-# .@. #-',
      '-# $#$ #-',
      '-#  .  #-',
      '-#######-',
      '---------',
    ],
  },
];

export function parseLevel(levelData: PushPushLevelData): ParsedLevel {
  const { asciiMap } = levelData;
  const height = asciiMap.length;
  let width = 0;
  asciiMap.forEach((row) => {
    if (row.length > width) width = row.length;
  });

  const grid: number[][] = Array.from({ length: height }, () => Array(width).fill(CELL_VOID));
  let playerPos = { x: 0, y: 0 };
  let targetCount = 0;

  for (let y = 0; y < height; y += 1) {
    const rowStr = asciiMap[y];
    for (let x = 0; x < width; x += 1) {
      const char = x < rowStr.length ? rowStr[x] : '-';

      switch (char) {
        case '#':
          grid[y][x] = CELL_WALL;
          break;
        case '.':
          grid[y][x] = CELL_TARGET;
          targetCount += 1;
          break;
        case '$':
          grid[y][x] = CELL_BOX;
          break;
        case '*':
          grid[y][x] = CELL_BOX_ON_TARGET;
          targetCount += 1;
          break;
        case '@':
          grid[y][x] = CELL_PLAYER;
          playerPos = { x, y };
          break;
        case '+':
          grid[y][x] = CELL_PLAYER_ON_TARGET;
          playerPos = { x, y };
          targetCount += 1;
          break;
        case ' ':
          grid[y][x] = CELL_FLOOR;
          break;
        case '-':
        default:
          grid[y][x] = CELL_VOID;
          break;
      }
    }
  }

  return {
    id: levelData.id,
    name: levelData.name,
    width,
    height,
    grid: grid as ParsedLevel['grid'],
    playerPos,
    targetCount,
    parMoves: levelData.parMoves,
    hint: levelData.hint,
  };
}
