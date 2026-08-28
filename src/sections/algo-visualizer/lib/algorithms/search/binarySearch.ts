import { Step } from '../types';

export const BINARY_SEARCH_CODE = `function binarySearch(arr: number[], target: number): number {
  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) {
      return mid; // Target found
    } else if (arr[mid] < target) {
      low = mid + 1; // Search right half
    } else {
      high = mid - 1; // Search left half
    }
  }
  return -1; // Not found
}`;

export function generateBinarySearchSteps(initialArray: number[], target?: number): Step[] {
  // Binary search requires a sorted array
  const arr = [...initialArray].sort((a, b) => a - b);
  const n = arr.length;
  const targetVal = target !== undefined ? target : arr[Math.floor(n / 2)];
  const steps: Step[] = [];

  let stepCount = 0;

  steps.push({
    stepIndex: stepCount++,
    line: 1,
    description: `이진 탐색 시작 (정렬된 배열): 타겟 값 = ${targetVal}`,
    variables: { target: targetVal, low: 0, high: n - 1, mid: '-' },
    array: [...arr],
    comparingIndices: [],
    swappingIndices: [],
    targetValue: targetVal,
    pointers: [
      { label: 'Low', index: 0, color: 'blue' },
      { label: 'High', index: n - 1, color: 'rose' },
    ],
    soundType: 'step',
  });

  let low = 0;
  let high = n - 1;
  let found = false;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    steps.push({
      stepIndex: stepCount++,
      line: 6,
      description: `중간 인덱스 mid = (${low} + ${high}) / 2 = ${mid} (값: ${arr[mid]}) 계산`,
      variables: { low, high, mid, 'arr[mid]': arr[mid], target: targetVal },
      array: [...arr],
      comparingIndices: [mid],
      swappingIndices: [],
      targetValue: targetVal,
      pivotIndex: mid,
      pointers: [
        { label: 'Low', index: low, color: 'blue' },
        { label: 'Mid', index: mid, color: 'amber' },
        { label: 'High', index: high, color: 'rose' },
      ],
      soundType: 'compare',
      soundValue: arr[mid],
    });

    if (arr[mid] === targetVal) {
      found = true;
      steps.push({
        stepIndex: stepCount++,
        line: 8,
        description: `arr[${mid}] === ${targetVal}! 타겟을 인덱스 ${mid}에서 찾았습니다!`,
        variables: { low, high, mid, targetFoundAt: mid },
        array: [...arr],
        comparingIndices: [],
        swappingIndices: [],
        foundIndex: mid,
        targetValue: targetVal,
        pointers: [{ label: 'Target', index: mid, color: 'emerald' }],
        soundType: 'found',
      });
      break;
    } else if (arr[mid] < targetVal) {
      steps.push({
        stepIndex: stepCount++,
        line: 10,
        description: `arr[mid](${arr[mid]}) < target(${targetVal})이므로 오른쪽 구간 탐색 (low = mid + 1 = ${mid + 1})`,
        variables: { prevLow: low, newLow: mid + 1, high, target: targetVal },
        array: [...arr],
        comparingIndices: [],
        swappingIndices: [],
        targetValue: targetVal,
        pointers: [
          { label: 'Low', index: mid + 1, color: 'blue' },
          { label: 'High', index: high, color: 'rose' },
        ],
        soundType: 'pivot',
      });
      low = mid + 1;
    } else {
      steps.push({
        stepIndex: stepCount++,
        line: 12,
        description: `arr[mid](${arr[mid]}) > target(${targetVal})이므로 왼쪽 구간 탐색 (high = mid - 1 = ${mid - 1})`,
        variables: { low, prevHigh: high, newHigh: mid - 1, target: targetVal },
        array: [...arr],
        comparingIndices: [],
        swappingIndices: [],
        targetValue: targetVal,
        pointers: [
          { label: 'Low', index: low, color: 'blue' },
          { label: 'High', index: Math.max(0, mid - 1), color: 'rose' },
        ],
        soundType: 'pivot',
      });
      high = mid - 1;
    }
  }

  if (!found) {
    steps.push({
      stepIndex: stepCount++,
      line: 15,
      description: `low > high 상태가 되어 탐색 범위가 소진되었습니다. 타겟(${targetVal}) 없음.`,
      variables: { low, high, result: -1 },
      array: [...arr],
      comparingIndices: [],
      swappingIndices: [],
      targetValue: targetVal,
      soundType: 'step',
    });
  }

  return steps;
}
