import type { Step } from '../types';

export const HEAP_SORT_CODE = `function heapSort(arr: number[]): number[] {
  const n = arr.length;
  // 1. Build Max Heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i);
  }
  // 2. Extract elements from heap one by one
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    heapify(arr, i, 0);
  }
  return arr;
}

function heapify(arr: number[], n: number, i: number): void {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;
  if (left < n && arr[left] > arr[largest]) largest = left;
  if (right < n && arr[right] > arr[largest]) largest = right;
  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    heapify(arr, n, largest);
  }
}`;

export function generateHeapSortSteps(initialArray: number[]): Step[] {
  const arr = [...initialArray];
  const n = arr.length;
  const steps: Step[] = [];
  const sortedIndices: Set<number> = new Set();

  let stepCount = 0;

  steps.push({
    stepIndex: stepCount++,
    line: 1,
    description: `힙 정렬을 시작합니다. 배열 크기: ${n}`,
    variables: { n, phase: '최대 힙(Max Heap) 구성' },
    array: [...arr],
    comparingIndices: [],
    swappingIndices: [],
    sortedIndices: [],
    soundType: 'step',
  });

  function heapify(size: number, i: number) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    steps.push({
      stepIndex: stepCount++,
      line: 14,
      description: `노드 ${i}(값 ${arr[i]})와 자식 노드들(L:${left < size ? arr[left] : '-'}, R:${right < size ? arr[right] : '-'})을 비교합니다.`,
      variables: { size, i, left, right, largest },
      array: [...arr],
      comparingIndices: [i, ...(left < size ? [left] : []), ...(right < size ? [right] : [])],
      swappingIndices: [],
      sortedIndices: Array.from(sortedIndices),
      pivotIndex: i,
      soundType: 'compare',
      soundValue: arr[i],
    });

    if (left < size && arr[left] > arr[largest]) {
      largest = left;
    }
    if (right < size && arr[right] > arr[largest]) {
      largest = right;
    }

    if (largest !== i) {
      const temp = arr[i];
      arr[i] = arr[largest];
      arr[largest] = temp;

      steps.push({
        stepIndex: stepCount++,
        line: 20,
        description: `부모(${arr[largest]})보다 큰 자식(${arr[i]})을 상위 노드로 교환합니다.`,
        variables: { size, i, largest, swapped: true },
        array: [...arr],
        comparingIndices: [],
        swappingIndices: [i, largest],
        sortedIndices: Array.from(sortedIndices),
        soundType: 'swap',
        soundValue: arr[i],
      });

      heapify(size, largest);
    }
  }

  // 1. Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(n, i);
  }

  steps.push({
    stepIndex: stepCount++,
    line: 7,
    description: `최대 힙 구축 완료! 루트(인덱스 0)의 최댓값을 뒤로 보내며 정렬을 진행합니다.`,
    variables: { maxRoot: arr[0], n },
    array: [...arr],
    comparingIndices: [],
    swappingIndices: [],
    sortedIndices: [],
    pivotIndex: 0,
    soundType: 'pivot',
  });

  // 2. Extract
  for (let i = n - 1; i > 0; i--) {
    const temp = arr[0];
    arr[0] = arr[i];
    arr[i] = temp;
    sortedIndices.add(i);

    steps.push({
      stepIndex: stepCount++,
      line: 9,
      description: `현재 최대값 ${temp}을 맨 뒤(인덱스 ${i})로 보내고 정렬 확정합니다.`,
      variables: { currentMax: temp, sortedAt: i },
      array: [...arr],
      comparingIndices: [],
      swappingIndices: [0, i],
      sortedIndices: Array.from(sortedIndices),
      soundType: 'swap',
      soundValue: temp,
    });

    heapify(i, 0);
  }

  sortedIndices.add(0);

  const allSorted = Array.from({ length: n }, (_, k) => k);
  steps.push({
    stepIndex: stepCount++,
    line: 12,
    description: `힙 정렬이 성공적으로 완료되었습니다!`,
    variables: { status: '완료', totalElements: n },
    array: [...arr],
    comparingIndices: [],
    swappingIndices: [],
    sortedIndices: allSorted,
    soundType: 'complete',
  });

  return steps;
}
