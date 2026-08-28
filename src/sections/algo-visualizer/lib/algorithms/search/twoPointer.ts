import { Step } from '../types';

export const TWO_POINTER_CODE = `function twoPointerTargetSum(arr: number[], targetSum: number): [number, number] | null {
  // Array must be sorted
  let left = 0;
  let right = arr.length - 1;

  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === targetSum) {
      return [left, right]; // Found pair
    } else if (sum < targetSum) {
      left++; // Need a larger sum
    } else {
      right--; // Need a smaller sum
    }
  }
  return null; // No pair found
}`;

export function generateTwoPointerSteps(initialArray: number[], targetSum?: number): Step[] {
  const arr = [...initialArray].sort((a, b) => a - b);
  const n = arr.length;
  const target = targetSum !== undefined ? targetSum : arr[0] + arr[Math.floor(n / 2)];

  const steps: Step[] = [];
  let stepCount = 0;

  steps.push({
    stepIndex: stepCount++,
    line: 1,
    description: `투 포인터 합 탐색 시작: 목표 합(Target Sum) = ${target}`,
    variables: { targetSum: target, left: 0, right: n - 1, sum: '-' },
    array: [...arr],
    comparingIndices: [],
    swappingIndices: [],
    pointers: [
      { label: 'Left', index: 0, color: 'blue' },
      { label: 'Right', index: n - 1, color: 'purple' },
    ],
    soundType: 'step',
  });

  let left = 0;
  let right = n - 1;
  let found = false;

  while (left < right) {
    const currentSum = arr[left] + arr[right];

    steps.push({
      stepIndex: stepCount++,
      line: 7,
      description: `arr[${left}](${arr[left]}) + arr[${right}](${arr[right]}) = ${currentSum} 계산 (목표: ${target})`,
      variables: {
        left,
        right,
        'arr[left]': arr[left],
        'arr[right]': arr[right],
        currentSum,
        targetSum: target,
      },
      array: [...arr],
      comparingIndices: [left, right],
      swappingIndices: [],
      pointers: [
        { label: 'Left', index: left, color: 'blue' },
        { label: 'Right', index: right, color: 'purple' },
      ],
      soundType: 'compare',
      soundValue: currentSum,
    });

    if (currentSum === target) {
      found = true;
      steps.push({
        stepIndex: stepCount++,
        line: 9,
        description: `목표 합 ${target}을 만드는 두 원소 쌍 (${arr[left]}, ${arr[right]}) 발견!`,
        variables: { leftIndex: left, rightIndex: right, value1: arr[left], value2: arr[right] },
        array: [...arr],
        comparingIndices: [left, right],
        swappingIndices: [],
        pointers: [
          { label: 'Match L', index: left, color: 'emerald' },
          { label: 'Match R', index: right, color: 'emerald' },
        ],
        soundType: 'found',
      });
      break;
    } else if (currentSum < target) {
      steps.push({
        stepIndex: stepCount++,
        line: 11,
        description: `합(${currentSum}) < 목표(${target})이므로 더 큰 합을 위해 left 포인터를 오른쪽(${left + 1})으로 이동`,
        variables: { prevLeft: left, newLeft: left + 1, right, targetSum: target },
        array: [...arr],
        comparingIndices: [],
        swappingIndices: [],
        pointers: [
          { label: 'Left', index: left + 1, color: 'blue' },
          { label: 'Right', index: right, color: 'purple' },
        ],
        soundType: 'pivot',
      });
      left++;
    } else {
      steps.push({
        stepIndex: stepCount++,
        line: 13,
        description: `합(${currentSum}) > 목표(${target})이므로 더 작은 합을 위해 right 포인터를 왼쪽(${right - 1})으로 이동`,
        variables: { left, prevRight: right, newRight: right - 1, targetSum: target },
        array: [...arr],
        comparingIndices: [],
        swappingIndices: [],
        pointers: [
          { label: 'Left', index: left, color: 'blue' },
          { label: 'Right', index: right - 1, color: 'purple' },
        ],
        soundType: 'pivot',
      });
      right--;
    }
  }

  if (!found) {
    steps.push({
      stepIndex: stepCount++,
      line: 16,
      description: `두 포인터가 교차하여 목표 합 ${target}을 만족하는 쌍을 찾지 못했습니다.`,
      variables: { result: null, status: '탐색 실패' },
      array: [...arr],
      comparingIndices: [],
      swappingIndices: [],
      soundType: 'step',
    });
  }

  return steps;
}
