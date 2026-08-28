import { Step } from '../types';

export const LINEAR_SEARCH_CODE = `function linearSearch(arr: number[], target: number): number {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    if (arr[i] === target) {
      return i; // Target found
    }
  }
  return -1; // Not found
}`;

export function generateLinearSearchSteps(initialArray: number[], target: number = 42): Step[] {
  const arr = [...initialArray];
  const n = arr.length;
  const steps: Step[] = [];
  let stepCount = 0;

  steps.push({
    stepIndex: stepCount++,
    line: 1,
    description: `선형 탐색 시작: 찾고자 하는 타겟 값 = ${target}`,
    variables: { target, n, i: '-' },
    array: [...arr],
    comparingIndices: [],
    swappingIndices: [],
    targetValue: target,
    soundType: 'step',
  });

  let found = false;
  for (let i = 0; i < n; i++) {
    steps.push({
      stepIndex: stepCount++,
      line: 4,
      description: `인덱스 ${i}(값 ${arr[i]})이 타겟(${target})과 일치하는지 비교합니다.`,
      variables: { i, 'arr[i]': arr[i], target },
      array: [...arr],
      comparingIndices: [i],
      swappingIndices: [],
      targetValue: target,
      pointers: [{ label: 'i', index: i, color: 'amber' }],
      soundType: 'compare',
      soundValue: arr[i],
    });

    if (arr[i] === target) {
      found = true;
      steps.push({
        stepIndex: stepCount++,
        line: 5,
        description: `타겟 값 ${target}을 인덱스 ${i}에서 찾았습니다!`,
        variables: { targetFoundAt: i, value: target },
        array: [...arr],
        comparingIndices: [],
        swappingIndices: [],
        foundIndex: i,
        targetValue: target,
        pointers: [{ label: 'Target', index: i, color: 'emerald' }],
        soundType: 'found',
      });
      break;
    }
  }

  if (!found) {
    steps.push({
      stepIndex: stepCount++,
      line: 8,
      description: `배열 전체를 순회하였으나 타겟(${target})을 찾지 못했습니다. (-1 반환)`,
      variables: { result: -1, status: '탐색 실패' },
      array: [...arr],
      comparingIndices: [],
      swappingIndices: [],
      targetValue: target,
      soundType: 'step',
    });
  }

  return steps;
}
