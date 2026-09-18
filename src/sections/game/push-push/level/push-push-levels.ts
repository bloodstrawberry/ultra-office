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
    name: '1. 첫 번째 푸시 (First Push)',
    parMoves: 4,
    hint: '방향키를 눌러 상자를 파란색 목표 지점까지 밀어보세요!',
    asciiMap: ['-------', '--###--', '--#.#--', '--#$#--', '--#@#--', '--###--', '-------'],
  },
  {
    id: 2,
    name: '2. 두 개의 상자 (Twin Boxes)',
    parMoves: 9,
    hint: '상자를 하나씩 순서대로 밀어 넣으세요. 벽에 밀착되면 빼낼 수 없으니 주의하세요!',
    asciiMap: ['--------', '-######-', '-#@ $ .#-', '-#  $ .#-', '-######-', '--------'],
  },
  {
    id: 3,
    name: '3. 코너의 덫 (Corner Trap)',
    parMoves: 15,
    hint: '모퉁이 구석으로 상자를 밀면 되돌릴 수 없습니다. 안전한 경로를 만드세요.',
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
    name: '4. 작은 창고 (Small Depot)',
    parMoves: 18,
    hint: '상자를 밀 공간을 확보하기 위해 빈 공간을 적절히 돌아다니세요.',
    asciiMap: ['-------', '-#####-', '-#.  #-', '-#$$@#-', '-#.  #-', '-#####-', '-------'],
  },
  {
    id: 5,
    name: '5. 통로 정리 (Clear the Hall)',
    parMoves: 21,
    hint: '복도 안쪽부터 차례대로 상자를 채워야 길이 막히지 않습니다.',
    asciiMap: ['--------', '-######-', '-#..  #-', '-# #$ #-', '-#@ $ #-', '-######-', '--------'],
  },
  {
    id: 6,
    name: '6. 애니콜 클래식 1 (Anycall Retro)',
    parMoves: 28,
    hint: '추억의 핸드폰 푸시푸시 명작 스테이지! 중앙의 상자 배치를 신중히 파악하세요.',
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
  {
    id: 7,
    name: '7. T자 갈림길 (T-Junction)',
    parMoves: 25,
    hint: '어떤 상자를 먼저 밀어야 다른 상자의 길을 터줄 수 있을까요?',
    asciiMap: [
      '---------',
      '-#######-',
      '-#  #  #-',
      '-#..#..#-',
      '-# $$$ #-',
      '-#  @  #-',
      '-#######-',
      '---------',
    ],
  },
  {
    id: 8,
    name: '8. 사각 루프 (Square Loop)',
    parMoves: 32,
    hint: '벽 주위를 빙 둘러서 상자 뒤편으로 이동할 수 있습니다.',
    asciiMap: [
      '---------',
      '-#######-',
      '-#     #-',
      '-# ### #-',
      '-# #.# #-',
      '-# $$@ #-',
      '-# ..# #-',
      '-#######-',
      '---------',
    ],
  },
  {
    id: 9,
    name: '9. 다이아몬드 퍼즐 (Diamond)',
    parMoves: 36,
    hint: '가장자리로 상자를 보낼 때는 반대편에 밀 수 있는 위치가 있는지 확인하세요.',
    asciiMap: [
      '---------',
      '---###---',
      '--##.##--',
      '-## $ ##-',
      '-# $.$ #-',
      '-##$@$##-',
      '--##.##--',
      '---###---',
      '---------',
    ],
  },
  {
    id: 10,
    name: '10. 미니 미로 (Mini Maze)',
    parMoves: 34,
    hint: '복잡해 보이지만 순서대로 하나씩 채워 넣으면 길이 열립니다.',
    asciiMap: [
      '----------',
      '-########-',
      '-#@ #   #-',
      '-# $$ . #-',
      '-# ## . #-',
      '-#    ###-',
      '-########-',
      '----------',
    ],
  },
  {
    id: 11,
    name: '11. 크로스 로드 (Crossroads)',
    parMoves: 40,
    hint: '중앙 교차로는 모든 상자가 지나가는 핵심 요충지입니다.',
    asciiMap: [
      '---------',
      '---###---',
      '---#.#---',
      '-###$###-',
      '-#.$@$.#-',
      '-###$###-',
      '---#.#---',
      '---###---',
      '---------',
    ],
  },
  {
    id: 12,
    name: '12. 트윈 룸 (Twin Rooms)',
    parMoves: 45,
    hint: '왼쪽 방에서 오른쪽 방으로 상자를 하나씩 전달해야 합니다.',
    asciiMap: [
      '-----------',
      '-#########-',
      '-#   #...#-',
      '-#$$$#...#-',
      '-# @     #-',
      '-#########-',
      '-----------',
    ],
  },
  {
    id: 13,
    name: '13. 창고지기의 고민 (Warehouse Keeper)',
    parMoves: 42,
    hint: '공간이 좁을수록 단 한 걸음의 실수가 상자를 고립시킵니다. Undo(되돌리기)를 적극 활용하세요.',
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
    id: 14,
    name: '14. 풍차 (The Windmill)',
    parMoves: 48,
    hint: '네 귀퉁이의 목표 지점으로 상자를 분산시켜 밀어 넣으세요.',
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
    id: 15,
    name: '15. 역방향 발상 (Reverse Thinking)',
    parMoves: 50,
    hint: '목표 지점과 상자의 위치를 거꾸로 추적해보면 정답 경로가 보입니다.',
    asciiMap: [
      '----------',
      '-########-',
      '-#  #   #-',
      '-# $#$. #-',
      '-#  $ . #-',
      '-# @#.. #-',
      '-########-',
      '----------',
    ],
  },
  {
    id: 16,
    name: '16. 세 개의 기둥 (Three Pillars)',
    parMoves: 55,
    hint: '기둥 사이로 상자를 빼내려면 돌아가는 길을 미리 확보해야 합니다.',
    asciiMap: [
      '-----------',
      '-#########-',
      '-#.#.#.# #-',
      '-#       #-',
      '-# $$$$@ #-',
      '-#       #-',
      '-#########-',
      '-----------',
    ],
  },
  {
    id: 17,
    name: '17. 대형 물류 센터 (Logistics Hub)',
    parMoves: 60,
    hint: '중앙의 4개 상자를 4개의 사방 모퉁이 홀에 정확하게 배송하세요.',
    asciiMap: [
      '-----------',
      '-#########-',
      '-#.     .#-',
      '-#  $$$  #-',
      '-#  $@$  #-',
      '-#  $$$  #-',
      '-#.     .#-',
      '-#########-',
      '-----------',
    ],
  },
  {
    id: 18,
    name: '18. 정밀 격자 (Precision Grid)',
    parMoves: 65,
    hint: '한 치의 오차도 허용하지 않는 정밀 퍼즐입니다.',
    asciiMap: [
      '----------',
      '-########-',
      '-#   #..#-',
      '-# $$#..#-',
      '-# #$#  #-',
      '-# @    #-',
      '-########-',
      '----------',
    ],
  },
  {
    id: 19,
    name: '19. 마스터 챌린지 (Master Challenge)',
    parMoves: 72,
    hint: '골목을 오가며 상자들의 우선순위를 정해보세요.',
    asciiMap: [
      '-----------',
      '-#########-',
      '-#  ...  #-',
      '-# #$$$# #-',
      '-#  $@$  #-',
      '-# #...# #-',
      '-#  $$$  #-',
      '-#########-',
      '-----------',
    ],
  },
  {
    id: 20,
    name: '20. 그랜드 마스터 (Grand Master)',
    parMoves: 85,
    hint: '푸시푸시의 모든 정수를 담은 최종 스테이지! 최고의 창고지기 영예에 도전하세요!',
    asciiMap: [
      '------------',
      '-##########-',
      '-#  ....  #-',
      '-# ##$$## #-',
      '-#  $  $  #-',
      '-# ##$$## #-',
      '-#   @    #-',
      '-#  ....  #-',
      '-##########-',
      '------------',
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
