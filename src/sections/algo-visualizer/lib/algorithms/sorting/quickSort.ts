import type { Step } from '../types';

export const QUICK_SORT_CODE = `function quickSort(arr: number[], low = 0, high = arr.length - 1): number[] {
  if (low < high) {
    const pivotIdx = partition(arr, low, high);
    quickSort(arr, low, pivotIdx - 1);
    quickSort(arr, pivotIdx + 1, high);
  }
  return arr;
}

function partition(arr: number[], low: number, high: number): number {
  const pivot = arr[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}`;

export function generateQuickSortSteps(initialArray: number[]): Step[] {
  const arr = [...initialArray];
  const n = arr.length;
  const steps: Step[] = [];
  const sortedIndices: Set<number> = new Set();

  let stepCount = 0;

  steps.push({
    stepIndex: stepCount++,
    line: 1,
    description: `퀵 정렬을 시작합니다. 배열 크기: ${n}`,
    variables: { low: 0, high: n - 1, pivot: '-' },
    array: [...arr],
    comparingIndices: [],
    swappingIndices: [],
    sortedIndices: [],
    soundType: 'step',
  });

  function partition(low: number, high: number): number {
    const pivot = arr[high];
    let i = low - 1;

    steps.push({
      stepIndex: stepCount++,
      line: 11,
      description: `구간 [${low} ~ ${high}]의 피벗으로 마지막 원소 arr[${high}] = ${pivot} 선택.`,
      variables: { low, high, pivot, i },
      array: [...arr],
      comparingIndices: [],
      swappingIndices: [],
      sortedIndices: Array.from(sortedIndices),
      pivotIndex: high,
      pointers: [
        { label: 'low', index: low, color: 'blue' },
        { label: 'high', index: high, color: 'rose' },
      ],
      soundType: 'pivot',
      soundValue: pivot,
    });

    for (let j = low; j < high; j++) {
      steps.push({
        stepIndex: stepCount++,
        line: 14,
        description: `arr[${j}](${arr[j]})와 피벗(${pivot}) 비교`,
        variables: { low, high, pivot, i, j, 'arr[j]': arr[j] },
        array: [...arr],
        comparingIndices: [j, high],
        swappingIndices: [],
        sortedIndices: Array.from(sortedIndices),
        pivotIndex: high,
        pointers: [
          { label: 'i', index: Math.max(0, i), color: 'amber' },
          { label: 'j', index: j, color: 'purple' },
        ],
        soundType: 'compare',
        soundValue: arr[j],
      });

      if (arr[j] < pivot) {
        i++;
        if (i !== j) {
          const temp = arr[i];
          arr[i] = arr[j];
          arr[j] = temp;

          steps.push({
            stepIndex: stepCount++,
            line: 16,
            description: `${arr[i]} < ${pivot}이므로 i를 ${i}로 증가시키고 arr[${i}]와 arr[${j}]를 교환합니다.`,
            variables: { low, high, pivot, i, j },
            array: [...arr],
            comparingIndices: [],
            swappingIndices: [i, j],
            sortedIndices: Array.from(sortedIndices),
            pivotIndex: high,
            soundType: 'swap',
            soundValue: arr[i],
          });
        }
      }
    }

    const temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;

    const pivotFinalPos = i + 1;
    sortedIndices.add(pivotFinalPos);

    steps.push({
      stepIndex: stepCount++,
      line: 19,
      description: `피벗(${arr[pivotFinalPos]})을 최종 분할 위치인 인덱스 ${pivotFinalPos}로 이동 확정합니다.`,
      variables: { pivotFinalPos, pivotValue: arr[pivotFinalPos] },
      array: [...arr],
      comparingIndices: [],
      swappingIndices: [pivotFinalPos, high],
      sortedIndices: Array.from(sortedIndices),
      pivotIndex: pivotFinalPos,
      soundType: 'pivot',
      soundValue: arr[pivotFinalPos],
    });

    return pivotFinalPos;
  }

  function sort(low: number, high: number) {
    if (low < high) {
      const pi = partition(low, high);
      sort(low, pi - 1);
      sort(pi + 1, high);
    } else if (low === high) {
      sortedIndices.add(low);
      steps.push({
        stepIndex: stepCount++,
        line: 3,
        description: `원소가 1개인 구간 [${low}] 정렬 확정.`,
        variables: { low, high, sortedIdx: low },
        array: [...arr],
        comparingIndices: [],
        swappingIndices: [],
        sortedIndices: Array.from(sortedIndices),
        soundType: 'step',
      });
    }
  }

  sort(0, n - 1);

  const allSorted = Array.from({ length: n }, (_, k) => k);
  steps.push({
    stepIndex: stepCount++,
    line: 6,
    description: `퀵 정렬이 성공적으로 완료되었습니다!`,
    variables: { status: '완료', totalElements: n },
    array: [...arr],
    comparingIndices: [],
    swappingIndices: [],
    sortedIndices: allSorted,
    soundType: 'complete',
  });

  return steps;
}
