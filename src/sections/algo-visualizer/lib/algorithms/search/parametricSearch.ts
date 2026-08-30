import type { Step } from '../types';

export const PARAMETRIC_SEARCH_CODE = `// 문제: 길이 H로 나무를 절단하여 최소 M미터의 목재를 확보할 수 있는 절단기 최대 높이 H 구하기
function parametricSearch(treeHeights: number[], targetM: number): number {
  let low = 0;
  let high = Math.max(...treeHeights);
  let bestHeight = 0;

  function isValid(cutHeight: number): boolean {
    let woodObtained = 0;
    for (const h of treeHeights) {
      if (h > cutHeight) {
        woodObtained += (h - cutHeight);
      }
    }
    return woodObtained >= targetM;
  }

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (isValid(mid)) {
      bestHeight = mid; // 조건 만족: 더 높은 절단 높이 탐색
      low = mid + 1;
    } else {
      high = mid - 1;   // 목재 부족: 절단 높이 낮추기
    }
  }

  return bestHeight;
}`;

export const DEFAULT_TREES = [20, 15, 10, 17];
export const DEFAULT_TARGET_WOOD = 7;

export function generateParametricSearchSteps(
  trees: number[] = DEFAULT_TREES,
  targetWood: number = DEFAULT_TARGET_WOOD
): Step[] {
  const steps: Step[] = [];
  const maxH = Math.max(...trees, 20);
  let low = 0;
  let high = maxH;
  let bestHeight = 0;

  function calcWood(cutH: number): number {
    return trees.reduce((acc, h) => acc + (h > cutH ? h - cutH : 0), 0);
  }

  steps.push({
    stepIndex: 0,
    line: 3,
    description: `매개변수 탐색 시작: 절단 높이 범위 [${low}, ${high}]에서 목표 목재(${targetWood}m)를 얻는 최대 높이를 결정 문제(Decision Problem)로 변환해 탐색합니다.`,
    variables: { low, high, bestHeight: 0, targetWood },
    array: [...trees],
    searchLow: low,
    searchHigh: high,
    searchMid: Math.floor((low + high) / 2),
    isMidFeasible: null,
    bestAnswer: null,
    soundType: 'step',
  });

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const obtained = calcWood(mid);
    const feasible = obtained >= targetWood;

    steps.push({
      stepIndex: steps.length,
      line: 18,
      description: `중간 절단 높이 Mid = ${mid}m 검사: 나무들을 ${mid}m에서 잘랐을 때 얻는 목재는 총 ${obtained}m 입니다.`,
      variables: { low, high, mid, woodObtained: `${obtained}m`, targetRequired: `${targetWood}m` },
      array: [...trees],
      searchLow: low,
      searchHigh: high,
      searchMid: mid,
      isMidFeasible: null,
      bestAnswer: bestHeight > 0 ? bestHeight : null,
      soundType: 'compare',
      soundValue: mid * 4,
    });

    if (feasible) {
      bestHeight = mid;
      steps.push({
        stepIndex: steps.length,
        line: 20,
        description: `조건 충족 (True)! ${obtained}m >= ${targetWood}m 이므로 높이 ${mid}m는 가능합니다. 최적해를 ${mid}m로 갱신하고 더 높은 높이를 찾기 위해 Low = ${mid + 1}로 좁힙니다.`,
        variables: { mid, status: '목재 충족 (가능)', nextLow: mid + 1, bestHeight },
        array: [...trees],
        searchLow: low,
        searchHigh: high,
        searchMid: mid,
        isMidFeasible: true,
        bestAnswer: bestHeight,
        soundType: 'found',
        soundValue: 80,
      });
      low = mid + 1;
    } else {
      steps.push({
        stepIndex: steps.length,
        line: 23,
        description: `조건 불충족 (False)! ${obtained}m < ${targetWood}m 로 목재가 부족합니다. 절단 높이를 낮추기 위해 High = ${mid - 1}로 좁힙니다.`,
        variables: { mid, status: '목재 부족 (불가능)', nextHigh: mid - 1, bestHeight },
        array: [...trees],
        searchLow: low,
        searchHigh: high,
        searchMid: mid,
        isMidFeasible: false,
        bestAnswer: bestHeight > 0 ? bestHeight : null,
        soundType: 'swap',
      });
      high = mid - 1;
    }
  }

  steps.push({
    stepIndex: steps.length,
    line: 27,
    description: `매개변수 탐색 완료! 목표 ${targetWood}m를 확보하는 절단기 최대 높이는 ${bestHeight}m 입니다.`,
    variables: { finalMaxHeight: `${bestHeight}m`, status: '최적화 완료' },
    array: [...trees],
    searchLow: low,
    searchHigh: high,
    searchMid: bestHeight,
    isMidFeasible: true,
    bestAnswer: bestHeight,
    soundType: 'complete',
  });

  return steps;
}
