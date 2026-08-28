import { Step } from '../types';

export const INSERTION_SORT_CODE = `function insertionSort(arr: number[]): number[] {
  const n = arr.length;
  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}`;

export function generateInsertionSortSteps(initialArray: number[]): Step[] {
  const arr = [...initialArray];
  const n = arr.length;
  const steps: Step[] = [];
  const sortedIndices: number[] = [0];

  let stepCount = 0;

  steps.push({
    stepIndex: stepCount++,
    line: 2,
    description: `삽입 정렬을 시작합니다. 첫 번째 원소(인덱스 0: ${arr[0]})는 이미 정렬된 상태로 간주합니다.`,
    variables: { n, i: '-', key: '-', j: '-' },
    array: [...arr],
    comparingIndices: [],
    swappingIndices: [],
    sortedIndices: [0],
    soundType: 'step',
  });

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;

    steps.push({
      stepIndex: stepCount++,
      line: 4,
      description: `삽입할 타겟 key = ${key} (인덱스 ${i})을 선택하고 앞쪽 정렬 구간과 비교를 시작합니다.`,
      variables: { i, key, j, 'arr[i]': key },
      array: [...arr],
      comparingIndices: [],
      swappingIndices: [],
      sortedIndices: [...sortedIndices],
      pivotIndex: i,
      soundType: 'pivot',
      soundValue: key,
    });

    while (j >= 0 && arr[j] > key) {
      steps.push({
        stepIndex: stepCount++,
        line: 6,
        description: `arr[${j}](${arr[j]}) > key(${key})이므로 arr[${j}]를 오른쪽(인덱스 ${j + 1})으로 한 칸 이동합니다.`,
        variables: { i, key, j, 'arr[j]': arr[j] },
        array: [...arr],
        comparingIndices: [j, j + 1],
        swappingIndices: [],
        sortedIndices: [...sortedIndices],
        pivotIndex: i,
        soundType: 'compare',
        soundValue: arr[j],
      });

      arr[j + 1] = arr[j];

      steps.push({
        stepIndex: stepCount++,
        line: 7,
        description: `인덱스 ${j + 1} 위치에 ${arr[j]} 값을 복사하여 밀어냈습니다.`,
        variables: { i, key, j, movedVal: arr[j] },
        array: [...arr],
        comparingIndices: [],
        swappingIndices: [j, j + 1],
        sortedIndices: [...sortedIndices],
        soundType: 'swap',
        soundValue: arr[j],
      });

      j--;
    }

    arr[j + 1] = key;
    sortedIndices.push(i);

    steps.push({
      stepIndex: stepCount++,
      line: 10,
      description: `적절한 위치(인덱스 ${j + 1})를 찾아 key(${key})를 삽입 완료했습니다.`,
      variables: { i, key, insertedAt: j + 1 },
      array: [...arr],
      comparingIndices: [],
      swappingIndices: [],
      sortedIndices: Array.from({ length: i + 1 }, (_, k) => k),
      soundType: 'step',
      soundValue: key,
    });
  }

  const allSorted = Array.from({ length: n }, (_, k) => k);
  steps.push({
    stepIndex: stepCount++,
    line: 12,
    description: `삽입 정렬이 완료되었습니다!`,
    variables: { status: '완료', totalElements: n },
    array: [...arr],
    comparingIndices: [],
    swappingIndices: [],
    sortedIndices: allSorted,
    soundType: 'complete',
  });

  return steps;
}
