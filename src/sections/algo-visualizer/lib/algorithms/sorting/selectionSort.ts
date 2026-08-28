import { Step } from '../types';

export const SELECTION_SORT_CODE = `function selectionSort(arr: number[]): number[] {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
  }
  return arr;
}`;

export function generateSelectionSortSteps(initialArray: number[]): Step[] {
  const arr = [...initialArray];
  const n = arr.length;
  const steps: Step[] = [];
  const sortedIndices: number[] = [];

  let stepCount = 0;

  steps.push({
    stepIndex: stepCount++,
    line: 2,
    description: `선택 정렬을 시작합니다. 배열 크기: ${n}`,
    variables: { n, i: '-', minIdx: '-', j: '-' },
    array: [...arr],
    comparingIndices: [],
    swappingIndices: [],
    sortedIndices: [...sortedIndices],
    soundType: 'step',
  });

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    steps.push({
      stepIndex: stepCount++,
      line: 4,
      description: `인덱스 ${i}부터 최솟값을 찾습니다. 초기 최솟값 후보 minIdx = ${i} (값: ${arr[i]})`,
      variables: { n, i, minIdx, 'arr[minIdx]': arr[minIdx] },
      array: [...arr],
      comparingIndices: [],
      swappingIndices: [],
      sortedIndices: [...sortedIndices],
      pivotIndex: minIdx,
      soundType: 'step',
    });

    for (let j = i + 1; j < n; j++) {
      steps.push({
        stepIndex: stepCount++,
        line: 6,
        description: `인덱스 ${j}(값 ${arr[j]})와 현재 최솟값 인덱스 ${minIdx}(값 ${arr[minIdx]}) 비교`,
        variables: { i, j, minIdx, 'arr[j]': arr[j], 'arr[minIdx]': arr[minIdx] },
        array: [...arr],
        comparingIndices: [j, minIdx],
        swappingIndices: [],
        sortedIndices: [...sortedIndices],
        pivotIndex: minIdx,
        soundType: 'compare',
        soundValue: arr[j],
      });

      if (arr[j] < arr[minIdx]) {
        minIdx = j;
        steps.push({
          stepIndex: stepCount++,
          line: 7,
          description: `더 작은 값 발견! 새로운 최솟값 인덱스 minIdx = ${minIdx} (값: ${arr[minIdx]})`,
          variables: { i, j, minIdx, newMin: arr[minIdx] },
          array: [...arr],
          comparingIndices: [],
          swappingIndices: [],
          sortedIndices: [...sortedIndices],
          pivotIndex: minIdx,
          soundType: 'pivot',
          soundValue: arr[minIdx],
        });
      }
    }

    if (minIdx !== i) {
      const temp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = temp;

      steps.push({
        stepIndex: stepCount++,
        line: 11,
        description: `최솟값 인덱스 ${minIdx}(값 ${arr[i]})과 인덱스 ${i}(값 ${arr[minIdx]})를 교환합니다.`,
        variables: { i, minIdx, 'arr[i]': arr[i], 'arr[minIdx]': arr[minIdx] },
        array: [...arr],
        comparingIndices: [],
        swappingIndices: [i, minIdx],
        sortedIndices: [...sortedIndices],
        soundType: 'swap',
        soundValue: arr[i],
      });
    }

    sortedIndices.push(i);
    steps.push({
      stepIndex: stepCount++,
      line: 13,
      description: `인덱스 ${i}(값 ${arr[i]}) 정렬 확정`,
      variables: { i, sortedCount: sortedIndices.length },
      array: [...arr],
      comparingIndices: [],
      swappingIndices: [],
      sortedIndices: [...sortedIndices],
      soundType: 'step',
    });
  }

  const allSorted = Array.from({ length: n }, (_, k) => k);
  steps.push({
    stepIndex: stepCount++,
    line: 14,
    description: `선택 정렬이 완료되었습니다!`,
    variables: { status: '완료', totalElements: n },
    array: [...arr],
    comparingIndices: [],
    swappingIndices: [],
    sortedIndices: allSorted,
    soundType: 'complete',
  });

  return steps;
}
