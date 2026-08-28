import { Step } from '../types';

export const DYNAMIC_PROGRAMMING_CODE = `// 0-1 배낭 문제 (0-1 Knapsack Problem) DP 테이블 채우기
function knapsack(weights: number[], values: number[], maxCapacity: number): number {
  const n = weights.length;
  // dp[i][w]: i번째 물건까지 고려하고 배낭 용량이 w일 때의 최대 가치
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(maxCapacity + 1).fill(0)
  );

  for (let i = 1; i <= n; i++) {
    const wt = weights[i - 1];
    const val = values[i - 1];

    for (let w = 0; w <= maxCapacity; w++) {
      if (wt <= w) {
        // 물건을 넣지 않는 경우 vs 물건을 넣는 경우 중 최댓값
        dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - wt] + val);
      } else {
        // 물건 무게가 배낭 용량을 초과하면 이전 상태 유지
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  return dp[n][maxCapacity];
}`;

export const DEFAULT_KNAPSACK_ITEMS = [
  { name: '물건1', weight: 2, value: 3 },
  { name: '물건2', weight: 3, value: 4 },
  { name: '물건3', weight: 4, value: 5 },
  { name: '물건4', weight: 5, value: 8 },
];
export const DEFAULT_KNAPSACK_CAPACITY = 6;

export function generateDynamicProgrammingSteps(
  items = DEFAULT_KNAPSACK_ITEMS,
  capacity = DEFAULT_KNAPSACK_CAPACITY
): Step[] {
  const steps: Step[] = [];
  const n = items.length;
  const W = capacity;

  // dp table [n+1][W+1]
  const dp: (number | string | null)[][] = Array.from({ length: n + 1 }, () =>
    new Array(W + 1).fill(0)
  );

  const rowLabels = ['초기값(0)', ...items.map((it) => `${it.name}(w:${it.weight},v:${it.value})`)];
  const colLabels = Array.from({ length: W + 1 }, (_, w) => `용량 ${w}`);

  steps.push({
    stepIndex: 0,
    line: 5,
    description: `동적 계획법(DP) 시작: 하위 문제들의 최적해를 저장할 ${n + 1} × ${W + 1} 2D DP 테이블을 0으로 초기화합니다.`,
    variables: { totalItems: n, maxCapacity: W, phase: 'DP 테이블 초기화' },
    dp2D: dp.map((row) => [...row]),
    dpRowLabels: rowLabels,
    dpColLabels: colLabels,
    dpActiveCell: null,
    soundType: 'step',
  });

  for (let i = 1; i <= n; i++) {
    const item = items[i - 1];
    const wt = item.weight;
    const val = item.value;

    for (let w = 0; w <= W; w++) {
      let cellVal = 0;
      let desc = '';
      const sourceCells: [number, number][] = [];

      if (wt <= w) {
        const withoutItem = Number(dp[i - 1][w] ?? 0);
        const withItem = Number(dp[i - 1][w - wt] ?? 0) + val;
        cellVal = Math.max(withoutItem, withItem);
        sourceCells.push([i - 1, w], [i - 1, w - wt]);

        desc = `[${item.name}] 용량 ${w}: 미선택(dp[${i - 1}][${w}] = ${withoutItem}) vs 선택(dp[${i - 1}][${w - wt}] + ${val} = ${withItem}) 중 최댓값 ${cellVal} 결정`;
      } else {
        cellVal = Number(dp[i - 1][w] ?? 0);
        sourceCells.push([i - 1, w]);
        desc = `[${item.name}] 무게(${wt})가 현재 용량(${w}) 초과 ➔ 이전 행의 최적해 dp[${i - 1}][${w}] = ${cellVal} 계승`;
      }

      dp[i][w] = cellVal;

      steps.push({
        stepIndex: steps.length,
        line: 14,
        description: desc,
        variables: { item: item.name, weight: wt, value: val, currentCap: w, bestValue: cellVal },
        dp2D: dp.map((row) => [...row]),
        dpRowLabels: rowLabels,
        dpColLabels: colLabels,
        dpActiveCell: [i, w],
        dpSourceCells: sourceCells,
        soundType: 'compare',
        soundValue: cellVal * 10 + 20,
      });
    }
  }

  const finalAnswer = dp[n][W];

  steps.push({
    stepIndex: steps.length,
    line: 23,
    description: `DP 연산 완료! 용량 ${W} 이하에서 얻을 수 있는 최대 배낭 가치는 ${finalAnswer} 입니다.`,
    variables: { maxKnapsackValue: finalAnswer, status: '최적화 완료' },
    dp2D: dp.map((row) => [...row]),
    dpRowLabels: rowLabels,
    dpColLabels: colLabels,
    dpActiveCell: [n, W],
    soundType: 'complete',
  });

  return steps;
}
