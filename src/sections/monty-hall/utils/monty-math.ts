// ----------------------------------------------------------------------
// Monty Hall & Probability Paradox Math Utilities
// ----------------------------------------------------------------------

import type {
  Action,
  StrategyId,
  StrategyInfo,
  SimpsonsDataset,
  TournamentRound,
  StrategyLeaderboardItem,
} from '../types';

/**
 * 1. Monty Hall Simulation
 */
export function simulateMontyHallBatch(
  rounds: number,
  doorCount: number = 3
): { switchWins: number; stayWins: number } {
  let switchWins = 0;
  let stayWins = 0;

  for (let i = 0; i < rounds; i += 1) {
    const winningDoor = Math.floor(Math.random() * doorCount);
    const playerChoice = Math.floor(Math.random() * doorCount);

    // If player originally chose the car, staying wins.
    if (playerChoice === winningDoor) {
      stayWins += 1;
    } else {
      // If player originally chose a goat, host opens all other goats except 1 remaining door.
      // Switching to the remaining door is guaranteed to win!
      switchWins += 1;
    }
  }

  return { switchWins, stayWins };
}

/**
 * 2. Birthday Paradox Theoretical Probability
 * P(N) = 1 - (365/365 * 364/365 * ... * (365 - N + 1)/365)
 */
export function calculateBirthdayProbability(n: number): number {
  if (n <= 1) return 0;
  if (n > 365) return 1;

  let pNoCollision = 1.0;
  for (let i = 0; i < n; i += 1) {
    pNoCollision *= (365 - i) / 365;
  }
  return 1 - pNoCollision;
}

/**
 * 3. Prisoner's Dilemma Strategies
 */
export const PD_STRATEGIES: Record<StrategyId, StrategyInfo> = {
  'tit-for-tat': {
    id: 'tit-for-tat',
    name: '팃포탯 (Tit for Tat)',
    description: '첫 턴에는 무조건 협력하고, 이후에는 상대의 직전 선택을 그대로 따라합니다.',
    color: '#10B981',
  },
  'always-defect': {
    id: 'always-defect',
    name: '항상 배신 (Always Defect)',
    description: '어떤 상황에서도 무조건 배신(Defect)만 선택하는 이기적 전략입니다.',
    color: '#EF4444',
  },
  'always-cooperate': {
    id: 'always-cooperate',
    name: '항상 협력 (Always Cooperate)',
    description: '상대가 배신하더라도 항상 협력(Cooperate)만 선택하는 이타적 전략입니다.',
    color: '#3B82F6',
  },
  grudger: {
    id: 'grudger',
    name: '원한 품기 (Grudger)',
    description: '협력하다가 상대가 단 한 번이라도 배신하면 영원히 배신합니다.',
    color: '#8B5CF6',
  },
  pavlov: {
    id: 'pavlov',
    name: '파블로프 (Win-Stay, Lose-Shift)',
    description: '직전 라운드에서 승리(3~5점)했으면 동일 선택을 유지하고, 실패했으면 바꿉니다.',
    color: '#F59E0B',
  },
  random: {
    id: 'random',
    name: '무작위 (Random)',
    description: '협력과 배신을 50% 확률로 무작위 선택합니다.',
    color: '#64748B',
  },
};

export function getStrategyAction(
  strategyId: StrategyId,
  round: number,
  historySelf: Action[],
  historyOpponent: Action[]
): Action {
  if (strategyId === 'always-cooperate') return 'cooperate';
  if (strategyId === 'always-defect') return 'defect';
  if (strategyId === 'random') return Math.random() < 0.5 ? 'cooperate' : 'defect';

  if (round === 0) return 'cooperate';

  if (strategyId === 'tit-for-tat') {
    return historyOpponent[round - 1];
  }

  if (strategyId === 'grudger') {
    const hasOpponentDefected = historyOpponent.includes('defect');
    return hasOpponentDefected ? 'defect' : 'cooperate';
  }

  if (strategyId === 'pavlov') {
    const lastSelf = historySelf[round - 1];
    const lastOpponent = historyOpponent[round - 1];
    // If both cooperated (3 pts) or self defected & opp cooperated (5 pts) -> Win, stay
    if (
      (lastSelf === 'cooperate' && lastOpponent === 'cooperate') ||
      (lastSelf === 'defect' && lastOpponent === 'cooperate')
    ) {
      return lastSelf;
    }
    // Lose -> shift
    return lastSelf === 'cooperate' ? 'defect' : 'cooperate';
  }

  return 'cooperate';
}

export function playTournament(roundsPerMatch: number = 20): {
  matches: TournamentRound[];
  leaderboard: StrategyLeaderboardItem[];
} {
  const strategyList: StrategyId[] = [
    'tit-for-tat',
    'always-defect',
    'always-cooperate',
    'grudger',
    'pavlov',
    'random',
  ];

  const scores: Record<
    StrategyId,
    { totalScore: number; wins: number; coopCount: number; totalMoves: number }
  > = {
    'tit-for-tat': { totalScore: 0, wins: 0, coopCount: 0, totalMoves: 0 },
    'always-defect': { totalScore: 0, wins: 0, coopCount: 0, totalMoves: 0 },
    'always-cooperate': { totalScore: 0, wins: 0, coopCount: 0, totalMoves: 0 },
    grudger: { totalScore: 0, wins: 0, coopCount: 0, totalMoves: 0 },
    pavlov: { totalScore: 0, wins: 0, coopCount: 0, totalMoves: 0 },
    random: { totalScore: 0, wins: 0, coopCount: 0, totalMoves: 0 },
  };

  const allMatchRounds: TournamentRound[] = [];

  for (let i = 0; i < strategyList.length; i += 1) {
    for (let j = i; j < strategyList.length; j += 1) {
      const stratA = strategyList[i];
      const stratB = strategyList[j];

      const histA: Action[] = [];
      const histB: Action[] = [];
      let matchScoreA = 0;
      let matchScoreB = 0;

      for (let r = 0; r < roundsPerMatch; r += 1) {
        const actA = getStrategyAction(stratA, r, histA, histB);
        const actB = getStrategyAction(stratB, r, histB, histA);

        histA.push(actA);
        histB.push(actB);

        // Payoff Matrix:
        // C & C: (3, 3)
        // D & C: (5, 0)
        // C & D: (0, 5)
        // D & D: (1, 1)
        let ptsA = 1;
        let ptsB = 1;
        if (actA === 'cooperate' && actB === 'cooperate') {
          ptsA = 3;
          ptsB = 3;
        } else if (actA === 'defect' && actB === 'cooperate') {
          ptsA = 5;
          ptsB = 0;
        } else if (actA === 'cooperate' && actB === 'defect') {
          ptsA = 0;
          ptsB = 5;
        }

        matchScoreA += ptsA;
        matchScoreB += ptsB;

        scores[stratA].totalScore += ptsA;
        scores[stratA].totalMoves += 1;
        if (actA === 'cooperate') scores[stratA].coopCount += 1;

        if (i !== j) {
          scores[stratB].totalScore += ptsB;
          scores[stratB].totalMoves += 1;
          if (actB === 'cooperate') scores[stratB].coopCount += 1;
        }

        if (i === 0 && j === 1) {
          allMatchRounds.push({
            round: r + 1,
            actionA: actA,
            actionB: actB,
            scoreA: ptsA,
            scoreB: ptsB,
          });
        }
      }

      if (matchScoreA > matchScoreB) scores[stratA].wins += 1;
      else if (matchScoreB > matchScoreA && i !== j) scores[stratB].wins += 1;
    }
  }

  const leaderboard: StrategyLeaderboardItem[] = strategyList
    .map((id) => ({
      id,
      name: PD_STRATEGIES[id].name,
      totalScore: scores[id].totalScore,
      winCount: scores[id].wins,
      cooperationRate: (scores[id].coopCount / (scores[id].totalMoves || 1)) * 100,
    }))
    .sort((a, b) => b.totalScore - a.totalScore);

  return { matches: allMatchRounds, leaderboard };
}

/**
 * 4. Simpson's Paradox Datasets
 */
export const SIMPSONS_DATASETS: SimpsonsDataset[] = [
  {
    id: 'kidney-stones',
    title: '신장 결석 치료법 A vs B (실제 의학 연구)',
    treatmentName: '치료법 A (개복 수술)',
    controlName: '치료법 B (경피적 쇄석술)',
    group1Name: '작은 결석 환자군',
    group2Name: '큰 결석 환자군',
    g1TreatmentSuccess: 81,
    g1TreatmentTotal: 87, // 93%
    g1ControlSuccess: 234,
    g1ControlTotal: 270, // 87%
    g2TreatmentSuccess: 192,
    g2TreatmentTotal: 263, // 73%
    g2ControlSuccess: 55,
    g2ControlTotal: 80, // 69%
    description:
      '작은 결석군(93% > 87%)과 큰 결석군(73% > 69%) 모두에서 치료법 A가 더 우수하지만, 두 그룹을 합산하면 B(83%)가 A(78%)보다 성공률이 높아 보이는 대표적 역설입니다. 치료법 A에 난이도가 높은 큰 결석 환자가 훨씬 많이 배정되었기 때문입니다.',
  },
  {
    id: 'batting-average',
    title: '프로야구 타자 타율 비교 (1995-1996 시즌)',
    treatmentName: '타자 A (데릭 지터)',
    controlName: '타자 B (데이비드 저스티스)',
    group1Name: '1995 시즌',
    group2Name: '1996 시즌',
    g1TreatmentSuccess: 12,
    g1TreatmentTotal: 48, // .250
    g1ControlSuccess: 104,
    g1ControlTotal: 411, // .253
    g2TreatmentSuccess: 183,
    g2TreatmentTotal: 582, // .314
    g2ControlSuccess: 45,
    g2ControlTotal: 140, // .321
    description:
      '1995년(.253 > .250)과 1996년(.321 > .314) 두 시즌 모두 타자 B의 타율이 더 높았으나, 2개 시즌 통산 타율을 합산하면 타자 A(.310)가 타자 B(.270)보다 압도적으로 높게 나타납니다.',
  },
];
