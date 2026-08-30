import type { Step } from '../types';

export const KADANE_CODE = `// 카데인 알고리즘 (Kadane's Algorithm) - O(N) 최대 부분 배열 합 (Maximum Subarray Sum)
function maxSubArray(nums: number[]): number {
  let maxSoFar = nums[0];
  let currentMax = nums[0];

  for (let i = 1; i < nums.length; i++) {
    // 이전 연속합에 현재 원소를 더하는 것 vs 현재 원소부터 새로 시작하는 것 중 큰 값
    currentMax = Math.max(nums[i], currentMax + nums[i]);
    maxSoFar = Math.max(maxSoFar, currentMax);
  }

  return maxSoFar;
}`;

export const DEFAULT_KADANE_ARRAY = [-2, 1, -3, 4, -1, 2, 1, -5, 4];

export function generateKadaneSteps(inputArray: number[] = DEFAULT_KADANE_ARRAY): Step[] {
  const steps: Step[] = [];
  const nums = [...inputArray];

  let currentMax = nums[0];
  let maxSoFar = nums[0];
  let startIdx = 0;
  let endIdx = 0;
  let tempStart = 0;

  steps.push({
    stepIndex: 0,
    line: 2,
    description: `카데인 알고리즘 시작: 첫 번째 원소 nums[0] = ${nums[0]}으로 현재 연속합(currentMax)과 역대 최대합(maxSoFar)을 초기화합니다.`,
    variables: { i: 0, 'nums[0]': nums[0], currentMax, maxSoFar },
    array: [...nums],
    comparingIndices: [0],
    kadaneCurrentSum: currentMax,
    kadaneMaxSum: maxSoFar,
    kadaneBestRange: [0, 0],
    pointers: [{ label: 'curr', index: 0, color: 'blue' }],
    soundType: 'step',
  });

  for (let i = 1; i < nums.length; i++) {
    const val = nums[i];
    const continuedSum = currentMax + val;
    const startNew = val > continuedSum;

    if (startNew) {
      currentMax = val;
      tempStart = i;
    } else {
      currentMax = continuedSum;
    }

    const isNewGlobalMax = currentMax > maxSoFar;
    if (isNewGlobalMax) {
      maxSoFar = currentMax;
      startIdx = tempStart;
      endIdx = i;
    }

    steps.push({
      stepIndex: steps.length,
      line: 7,
      description: `[인덱스 ${i}: 값 ${val}] 기존 연속합 연장(${continuedSum}) vs 새 출발(${val}) ➔ currentMax = ${currentMax} ${
        isNewGlobalMax
          ? `(🎉 역대 최대합 maxSoFar = ${maxSoFar} 갱신!)`
          : `(maxSoFar = ${maxSoFar} 유지)`
      }`,
      variables: {
        i,
        val,
        continuedSum,
        currentMax,
        maxSoFar,
        choice: startNew ? '새로 시작' : '연속합 이어가기',
      },
      array: [...nums],
      comparingIndices: [i],
      kadaneCurrentSum: currentMax,
      kadaneMaxSum: maxSoFar,
      kadaneBestRange: [startIdx, endIdx],
      pointers: [{ label: 'i', index: i, color: isNewGlobalMax ? 'emerald' : 'blue' }],
      soundType: isNewGlobalMax ? 'found' : 'compare',
      soundValue: Math.max(10, currentMax * 10),
    });
  }

  steps.push({
    stepIndex: steps.length,
    line: 12,
    description: `카데인 알고리즘 완료! 최대 부분 배열 합은 [인덱스 ${startIdx}~${endIdx}] 구간 [${nums
      .slice(startIdx, endIdx + 1)
      .join(', ')}]의 합인 ${maxSoFar} 입니다. O(N) 단 한 번의 순회로 최적해를 도출했습니다.`,
    variables: {
      finalMaxSum: maxSoFar,
      bestSubarray: `[${nums.slice(startIdx, endIdx + 1).join(', ')}]`,
    },
    array: [...nums],
    sortedIndices: Array.from({ length: endIdx - startIdx + 1 }, (_, k) => startIdx + k),
    kadaneCurrentSum: maxSoFar,
    kadaneMaxSum: maxSoFar,
    kadaneBestRange: [startIdx, endIdx],
    soundType: 'complete',
  });

  return steps;
}
