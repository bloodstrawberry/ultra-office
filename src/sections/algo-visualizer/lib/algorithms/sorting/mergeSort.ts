import type { Step } from '../types';

export const MERGE_SORT_CODE = `function mergeSort(arr: number[], left = 0, right = arr.length - 1): number[] {
  if (left >= right) return arr;
  const mid = Math.floor((left + right) / 2);
  mergeSort(arr, left, mid);
  mergeSort(arr, mid + 1, right);
  merge(arr, left, mid, right);
  return arr;
}

function merge(arr: number[], left: number, mid: number, right: number): void {
  const temp: number[] = [];
  let i = left, j = mid + 1;
  while (i <= mid && j <= right) {
    if (arr[i] <= arr[j]) temp.push(arr[i++]);
    else temp.push(arr[j++]);
  }
  while (i <= mid) temp.push(arr[i++]);
  while (j <= right) temp.push(arr[j++]);
  for (let k = 0; k < temp.length; k++) {
    arr[left + k] = temp[k];
  }
}`;

export function generateMergeSortSteps(initialArray: number[]): Step[] {
  const arr = [...initialArray];
  const n = arr.length;
  const steps: Step[] = [];
  const sortedIndices: Set<number> = new Set();

  let stepCount = 0;

  steps.push({
    stepIndex: stepCount++,
    line: 1,
    description: `병합 정렬을 시작합니다. 분할 정복(Divide & Conquer) 방식으로 전체 배열 크기: ${n}`,
    variables: { left: 0, right: n - 1, mid: '-' },
    array: [...arr],
    comparingIndices: [],
    swappingIndices: [],
    sortedIndices: [],
    soundType: 'step',
  });

  function merge(left: number, mid: number, right: number) {
    const temp: number[] = [];
    let i = left;
    let j = mid + 1;

    steps.push({
      stepIndex: stepCount++,
      line: 11,
      description: `두 정렬된 부분 배열 [${left}~${mid}]과 [${mid + 1}~${right}]의 병합을 시작합니다.`,
      variables: { left, mid, right, i, j },
      array: [...arr],
      comparingIndices: [i, j],
      swappingIndices: [],
      sortedIndices: Array.from(sortedIndices),
      pointers: [
        { label: 'i', index: i, color: 'blue' },
        { label: 'j', index: j, color: 'purple' },
      ],
      soundType: 'step',
    });

    while (i <= mid && j <= right) {
      steps.push({
        stepIndex: stepCount++,
        line: 13,
        description: `arr[${i}](${arr[i]})와 arr[${j}](${arr[j]})를 비교하여 더 작은 원소를 임시 배열에 추가합니다.`,
        variables: { left, mid, right, i, j, 'arr[i]': arr[i], 'arr[j]': arr[j] },
        array: [...arr],
        comparingIndices: [i, j],
        swappingIndices: [],
        sortedIndices: Array.from(sortedIndices),
        soundType: 'compare',
        soundValue: Math.min(arr[i], arr[j]),
      });

      if (arr[i] <= arr[j]) {
        temp.push(arr[i]);
        i++;
      } else {
        temp.push(arr[j]);
        j++;
      }
    }

    while (i <= mid) {
      temp.push(arr[i]);
      i++;
    }

    while (j <= right) {
      temp.push(arr[j]);
      j++;
    }

    for (let k = 0; k < temp.length; k++) {
      arr[left + k] = temp[k];
      if (left === 0 && right === n - 1) {
        sortedIndices.add(left + k);
      }

      steps.push({
        stepIndex: stepCount++,
        line: 19,
        description: `임시 배열의 정렬된 값 ${temp[k]}을 원본 배열 인덱스 ${left + k}에 덮어씁니다.`,
        variables: { k, targetIndex: left + k, value: temp[k] },
        array: [...arr],
        comparingIndices: [],
        swappingIndices: [left + k],
        sortedIndices: Array.from(sortedIndices),
        soundType: 'swap',
        soundValue: temp[k],
      });
    }
  }

  function sort(left: number, right: number) {
    if (left >= right) return;
    const mid = Math.floor((left + right) / 2);

    steps.push({
      stepIndex: stepCount++,
      line: 3,
      description: `구간 [${left}~${right}]을 중간 mid=${mid} 기준으로 두 하위 구간으로 분할합니다.`,
      variables: { left, mid, right },
      array: [...arr],
      comparingIndices: [],
      swappingIndices: [],
      sortedIndices: Array.from(sortedIndices),
      pointers: [
        { label: 'L', index: left, color: 'blue' },
        { label: 'M', index: mid, color: 'amber' },
        { label: 'R', index: right, color: 'rose' },
      ],
      soundType: 'pivot',
    });

    sort(left, mid);
    sort(mid + 1, right);
    merge(left, mid, right);
  }

  sort(0, n - 1);

  const allSorted = Array.from({ length: n }, (_, k) => k);
  steps.push({
    stepIndex: stepCount++,
    line: 7,
    description: `병합 정렬이 성공적으로 완료되었습니다!`,
    variables: { status: '완료', totalElements: n },
    array: [...arr],
    comparingIndices: [],
    swappingIndices: [],
    sortedIndices: allSorted,
    soundType: 'complete',
  });

  return steps;
}
