import type { OthelloProblem } from './types';

function createOthelloProblem(
  id: string,
  title: string,
  difficulty: '초급',
  category: '모서리' | '착수선택' | '변장악' | '패리티' | '전멸',
  blackDiscs: [number, number][],
  whiteDiscs: [number, number][],
  objective: string,
  hint: string,
  solutionMove: [number, number],
  comment: string,
  explanation: string,
  csConcept: string,
  aiResponseMove?: [number, number],
  aiComment?: string,
  followUpMove?: [number, number],
  followUpComment?: string
): OthelloProblem {
  return {
    id,
    title,
    difficulty,
    category,
    initialBlack: blackDiscs.map(([r, c]) => ({ r, c })),
    initialWhite: whiteDiscs.map(([r, c]) => ({ r, c })),
    playerColor: 'B',
    objective,
    hint,
    solutionTree: [
      {
        move: { r: solutionMove[0], c: solutionMove[1] },
        comment,
        isCorrect: true,
        aiResponse: aiResponseMove ? { r: aiResponseMove[0], c: aiResponseMove[1] } : undefined,
        aiComment,
        children: followUpMove
          ? [
              {
                move: { r: followUpMove[0], c: followUpMove[1] },
                comment: followUpComment || '정답 완료! 완벽하게 오셀로 전술을 성공시켰습니다.',
                isCorrect: true,
              },
            ]
          : undefined,
      },
    ],
    explanation,
    csConcept,
  };
}

export const OTHELLO_PUZZLE_LIST: OthelloProblem[] = [
  createOthelloProblem(
    'othello-corner-1',
    '1. 모서리(Corner) 선점 기초 - 불변석 굳히기',
    '초급',
    '모서리',
    [
      [1, 1],
      [2, 2],
      [3, 3],
      [0, 2],
      [0, 3],
    ],
    [
      [0, 1],
      [1, 0],
      [2, 0],
    ],
    '흑선(Black) - (0, 0) A1 모서리를 차지하여 절대 뒤집히지 않는 불변석을 만드세요.',
    '(0, 0) A1 위치에 착수하면 가로/세로 백돌을 동시에 뒤집으며 모서리를 선점합니다.',
    [0, 0],
    '정답! A1 모서리를 선점하여 승리의 핵심 발판인 불변석을 확보했습니다.',
    '오셀로에서 네 모서리(Corner)는 상대가 절대 뒤집을 수 없는 불변의 자리(Anchor)입니다. 모서리를 얻으면 인접한 변(Edge)으로 안전하게 영역을 확장할 수 있습니다.',
    '불변 상태(Invariant State) 정의 및 점진적 영역 확장'
  ),
  createOthelloProblem(
    'othello-xsquare-1',
    '2. C-Square / X-Square 함정 회피 - 안전한 외곽 착수',
    '초급',
    '착수선택',
    [
      [2, 2],
      [2, 3],
      [3, 2],
    ],
    [
      [1, 0],
      [2, 1],
      [3, 1],
    ],
    '흑선(Black) - 위험한 B2 (1, 1) 자리를 피하고 안전한 A3 (2, 0) 변을 장악하세요.',
    '(2, 0) A3 자리에 두어 좌측 변을 차지하세요.',
    [2, 0],
    '정답! 모서리를 내주는 X-스퀘어(B2)를 피하고 좌측 변을 견고하게 차지했습니다.',
    '모서리 대각선 바로 옆인 X-Square(B2, G2, B7, G7)나 C-Square에 섣불리 두면 상대에게 모서리를 바로 헌납하게 됩니다. 안전한 외곽이나 안쪽을 먼저 두어야 합니다.',
    '함정 노드(Trap Node) 회피 및 가중치 기반 분기 선택'
  ),
  createOthelloProblem(
    'othello-edge-1',
    '3. 변(Edge) 안정화 및 날개(Wing) 형성',
    '초급',
    '변장악',
    [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 3],
    ],
    [
      [0, 3],
      [0, 4],
      [1, 4],
    ],
    '흑선(Black) - 상단 1행의 백돌을 뒤집어 상단 변 전체를 흑 진영으로 굳히세요.',
    '(0, 5) F1 위치에 두어 상단 변의 주도권을 장악하세요.',
    [0, 5],
    '정답! 상단 변의 백돌들을 모두 흑으로 뒤집어 견고한 벽을 구축했습니다.',
    '모서리와 연결된 변(Edge) 라인은 쉽게 뒤집히지 않는 강력한 방어선을 만듭니다.',
    '단방향 경계선 제약(Boundary Invariant Constraint)'
  ),
  createOthelloProblem(
    'othello-quiet-1',
    '4. 조용한 수 (Quiet Move) - 착수 가능 수(Mobility) 보존',
    '초급',
    '착수선택',
    [
      [3, 3],
      [3, 4],
      [4, 4],
    ],
    [
      [2, 3],
      [2, 4],
      [4, 3],
    ],
    '흑선(Black) - 외곽으로 돌을 노출시키지 않고 내부 백돌 1개만 뒤집는 조용한 수를 두세요.',
    '(1, 4) E2 자리에 두어 상대의 착수 경로를 제한하세요.',
    [1, 4],
    '정답! 돌을 많이 뒤집지 않고 내부를 찌르는 조용한 수로 백의 응수를 묶었습니다.',
    '오셀로 초중반에는 돌을 너무 많이 뒤집으면 상대에게 많은 착수 기회(Mobility)를 주게 됩니다. 내부의 돌 1~2개만 뒤집는 조용한 수(Quiet Move)가 핵심 전략입니다.',
    '상대 유효 액션 공간(Action Space) 최소화 탐색'
  ),
  createOthelloProblem(
    'othello-wipeout-1',
    '5. 완전 포위 (Wipeout) - 단숨에 상대 돌 전멸',
    '초급',
    '전멸',
    [[0, 0]],
    [
      [1, 1],
      [2, 2],
      [3, 3],
    ],
    '흑선(Black) - (4, 4) E5에 착수하여 대각선 상의 모든 백돌을 흑으로 뒤집어 전멸시키세요.',
    '(4, 4) E5 위치에 착수하여 (0, 0)과 연결하세요.',
    [4, 4],
    '정답! 대각선의 모든 백돌을 흑으로 뒤집어 상대를 완벽히 전멸(Wipeout)시켰습니다.',
    '오셀로에서는 한 번의 착수로 판 위의 모든 상대 돌을 뒤집어 게임 도중 즉시 승리(Wipeout)할 수도 있습니다.',
    '전역 상태 전이(Global State Annihilation) 유도'
  ),
];
