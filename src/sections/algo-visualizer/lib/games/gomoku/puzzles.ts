import type { GomokuProblem } from './types';

function createGomokuProblem(
  id: string,
  title: string,
  difficulty: '초급',
  category: '오목완성' | '열린4' | '4-3공격' | '3-3공격' | '수비',
  blackStones: [number, number][],
  whiteStones: [number, number][],
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
): GomokuProblem {
  return {
    id,
    title,
    difficulty,
    category,
    initialBlack: blackStones.map(([r, c]) => ({ r, c })),
    initialWhite: whiteStones.map(([r, c]) => ({ r, c })),
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
                comment: followUpComment || '정답 완료! 완벽하게 5목을 완성했습니다.',
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

export const GOMOKU_PUZZLE_LIST: GomokuProblem[] = [
  createGomokuProblem(
    'gomoku-open4-1',
    '1. 열린 4 (Open 4) 만들기 - 확정 승리 수법',
    '초급',
    '열린4',
    [
      [7, 6],
      [7, 7],
      [7, 8],
    ],
    [
      [5, 5],
      [6, 6],
      [8, 8],
    ],
    '흑선(Black) - (7, 5) F8에 착수하여 양쪽이 모두 뚫린 열린 4를 완성하세요.',
    '(7, 5)에 두면 좌우가 모두 열린 4목이 되어 백이 한쪽을 막아도 반대쪽으로 즉시 5목이 완성됩니다.',
    [7, 5],
    '정답! 열린 4(Open 4)가 완성되어 다음 턴에 무조건 승리합니다.',
    '오목에서 양쪽 끝이 열린 4(Open Four)는 상대가 한 번에 두 곳을 막을 수 없으므로 확정적인 승리를 보장하는 기본 전술입니다.',
    '다중 승리 경로(Multi-Branch Win State) 강제 생성'
  ),
  createGomokuProblem(
    'gomoku-four-three-1',
    '2. 4-3 공격 콤비네이션 (VCF 기초)',
    '초급',
    '4-3공격',
    [
      [6, 6],
      [6, 7],
      [6, 8],
      [4, 9],
      [5, 9],
    ],
    [
      [6, 5],
      [7, 7],
      [8, 9],
    ],
    '흑선(Black) - (6, 9) J7에 착수하여 4목 위협과 열린 3을 동시에 만드세요.',
    '(6, 9) 위치에 두면 가로 4목과 세로 3목이 교차하는 강력한 4-3 공격이 완성됩니다.',
    [6, 9],
    '정답! 4-3 양수겸장 공격으로 백의 방어선을 무너뜨렸습니다.',
    '4-3 공격은 상대에게 4목을 막도록 강제(Forced Defense)한 뒤, 남아있는 열린 3을 4목으로 연계하여 연속 공격으로 끝내는 핵심 전술입니다.',
    '강제적 상태 전이(Forced State Transition) 체이닝'
  ),
  createGomokuProblem(
    'gomoku-double-three-1',
    '3. 3-3 양수겸장 공격 (Double Three)',
    '초급',
    '3-3공격',
    [
      [5, 6],
      [5, 7],
      [6, 5],
      [7, 5],
    ],
    [
      [3, 3],
      [4, 4],
      [8, 8],
    ],
    '흑선(Black) - (5, 5) F6에 착수하여 가로와 세로 두 방향의 열린 3을 동시에 만드세요.',
    '(5, 5) 교차점에 두어 두 개의 열린 3을 동시에 활성화하세요.',
    [5, 5],
    '정답! 3-3 양수겸장으로 다음 턴에 반드시 열린 4를 만들 수 있습니다.',
    '3-3 공격은 동시에 두 개의 열린 3을 생성하여 상대가 하나의 3을 막더라도 다른 쪽에서 열린 4를 완성하게 만듭니다.',
    '동시 위협 분기(Dual-Threat Branching) 알고리즘'
  ),
  createGomokuProblem(
    'gomoku-defense-1',
    '4. 상대 열린 3 선제 방어 (Block Open 3)',
    '초급',
    '수비',
    [
      [4, 4],
      [8, 8],
    ],
    [
      [7, 6],
      [7, 7],
      [7, 8],
    ],
    '흑선(Black) - 백의 열린 3을 차단하여 백이 열린 4를 만드는 것을 막으세요.',
    '(7, 5) F8 또는 (7, 9) J8 위치를 막아 백의 연결을 차단하세요.',
    [7, 5],
    '정답! 백의 위험한 열린 3을 선제 차단하여 위기를 넘겼습니다.',
    '상대가 열린 3을 만들었을 때는 즉시 한쪽 끝을 막아 닫힌 3(Blocked Three)으로 만들어야 상대가 열린 4로 즉시 승리하는 것을 방지할 수 있습니다.',
    '위험도 기반 우선순위 탐색(Minimax Cutoff & Defense Priority)'
  ),
  createGomokuProblem(
    'gomoku-win-five-1',
    '5. 5목 완성 (5 in a Row) - 즉시 승리 결정타',
    '초급',
    '오목완성',
    [
      [7, 4],
      [7, 5],
      [7, 6],
      [7, 7],
    ],
    [
      [6, 5],
      [6, 6],
      [6, 7],
      [8, 6],
    ],
    '흑선(Black) - (7, 8) I8에 착수하여 가로 5목을 완성하고 즉시 승리하세요.',
    '(7, 8) 위치에 돌을 놓아 완벽한 5목을 만드세요.',
    [7, 8],
    '정답! 5목(Five in a Row)이 완성되어 흑이 완승을 거두었습니다!',
    '5개의 돌을 가로, 세로, 또는 대각선으로 빈틈없이 연결하면 오목 게임에서 즉시 승리합니다.',
    '종료 조건(Terminal Goal State) 도달 검증'
  ),
];
