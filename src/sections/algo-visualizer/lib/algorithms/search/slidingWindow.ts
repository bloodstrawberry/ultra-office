import { Step } from '../types';

export const SLIDING_WINDOW_CODE = `// 고정 크기 K의 슬라이딩 윈도우 최대 부분 배열 합 (Max Subarray Sum of size K)
function maxSubarraySum(arr: number[], k: number): number {
  let maxSum = 0;
  let windowSum = 0;

  // 1. 첫 번째 윈도우 합 계산
  for (let i = 0; i < k; i++) {
    windowSum += arr[i];
  }
  maxSum = windowSum;

  // 2. 윈도우를 한 칸씩 오른쪽으로 밀며 (새 원소 더하고, 빠지는 원소 빼기)
  for (let i = k; i < arr.length; i++) {
    windowSum += arr[i] - arr[i - k];
    maxSum = Math.max(maxSum, windowSum);
  }

  return maxSum;
}`;

export const DEFAULT_WINDOW_ARRAY = [2, 1, 5, 1, 3, 2, 7, 4, 3, 6];
export const DEFAULT_WINDOW_K = 3;

export function generateSlidingWindowSteps(
  array: number[] = DEFAULT_WINDOW_ARRAY,
  k: number = DEFAULT_WINDOW_K
): Step[] {
  const steps: Step[] = [];
  const arr = [...array];
  const windowSize = Math.max(1, Math.min(arr.length, k));

  let windowSum = 0;
  for (let i = 0; i < windowSize; i++) {
    windowSum += arr[i];
  }
  let maxSum = windowSum;
  let bestStart = 0;

  steps.push({
    stepIndex: 0,
    line: 3,
    description: `슬라이딩 윈도우 시작: 크기 K = ${windowSize}인 윈도우의 첫 번째 부분합을 계산합니다. [${arr.slice(0, windowSize).join(' + ')}] = ${windowSum}`,
    variables: { k: windowSize, windowSum, maxSum, window: `[0 ~ ${windowSize - 1}]` },
    array: [...arr],
    windowStart: 0,
    windowEnd: windowSize - 1,
    windowSum,
    maxWindowSum: maxSum,
    pointers: [
      { label: 'Start', index: 0, color: 'blue' },
      { label: 'End', index: windowSize - 1, color: 'purple' },
    ],
    soundType: 'step',
  });

  for (let i = windowSize; i < arr.length; i++) {
    const entering = arr[i];
    const leaving = arr[i - windowSize];
    const prevSum = windowSum;
    windowSum = windowSum + entering - leaving;

    const startIdx = i - windowSize + 1;
    const endIdx = i;
    const isNewMax = windowSum > maxSum;
    if (isNewMax) {
      maxSum = windowSum;
      bestStart = startIdx;
    }

    steps.push({
      stepIndex: steps.length,
      line: 13,
      description: `[윈도우 슬라이드 ➔ 인덱스 ${startIdx}~${endIdx}] 빠지는 원소(${leaving}) 빼고 새로 들어온 원소(${entering}) 더함: ${prevSum} - ${leaving} + ${entering} = ${windowSum} ${
        isNewMax ? `(🎉 새로운 최대합 갱신!)` : `(기존 최대합 ${maxSum} 유지)`
      }`,
      variables: {
        windowRange: `[${startIdx} ~ ${endIdx}]`,
        leavingVal: leaving,
        enteringVal: entering,
        windowSum,
        maxSum,
      },
      array: [...arr],
      windowStart: startIdx,
      windowEnd: endIdx,
      windowSum,
      maxWindowSum: maxSum,
      comparingIndices: [i - windowSize, i],
      pointers: [
        { label: 'Start', index: startIdx, color: 'blue' },
        { label: 'End', index: endIdx, color: 'purple' },
      ],
      soundType: isNewMax ? 'found' : 'compare',
      soundValue: windowSum * 5,
    });
  }

  steps.push({
    stepIndex: steps.length,
    line: 18,
    description: `슬라이딩 윈도우 탐색 완료! 크기 ${windowSize}인 구간의 최댓값은 [인덱스 ${bestStart}~${
      bestStart + windowSize - 1
    }] 구간의 ${maxSum} 입니다. O(N) 선형 시간으로 모든 구간을 검사했습니다.`,
    variables: {
      finalMaxSum: maxSum,
      bestSubarray: `[${arr.slice(bestStart, bestStart + windowSize).join(', ')}]`,
    },
    array: [...arr],
    windowStart: bestStart,
    windowEnd: bestStart + windowSize - 1,
    windowSum: maxSum,
    maxWindowSum: maxSum,
    soundType: 'complete',
  });

  return steps;
}
