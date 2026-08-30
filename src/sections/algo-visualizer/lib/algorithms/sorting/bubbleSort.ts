import type { Step } from '../types';

export const BUBBLE_SORT_CODE = `function bubbleSort(arr: number[]): number[] {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return arr;
}`;

export function generateBubbleSortSteps(initialArray: number[]): Step[] {
  const arr = [...initialArray];
  const n = arr.length;
  const steps: Step[] = [];
  const sortedIndices: number[] = [];

  let stepCount = 0;

  // Step 0: Start
  steps.push({
    stepIndex: stepCount++,
    line: 2,
    description: `버블 정렬을 시작합니다. 배열 길이: ${n}`,
    variables: { n, i: '-', j: '-', swapped: '-' },
    array: [...arr],
    comparingIndices: [],
    swappingIndices: [],
    sortedIndices: [...sortedIndices],
    soundType: 'step',
  });

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;

    steps.push({
      stepIndex: stepCount++,
      line: 3,
      description: `외부 반복문 i = ${i} 시작. (0 ~ ${n - 2})`,
      variables: { n, i, j: '-', swapped: false },
      array: [...arr],
      comparingIndices: [],
      swappingIndices: [],
      sortedIndices: [...sortedIndices],
      soundType: 'step',
    });

    for (let j = 0; j < n - 1 - i; j++) {
      // Comparison step
      steps.push({
        stepIndex: stepCount++,
        line: 6,
        description: `인덱스 ${j}(${arr[j]})와 ${j + 1}(${arr[j + 1]})을 비교합니다.`,
        variables: { n, i, j, 'arr[j]': arr[j], 'arr[j+1]': arr[j + 1], swapped },
        array: [...arr],
        comparingIndices: [j, j + 1],
        swappingIndices: [],
        sortedIndices: [...sortedIndices],
        soundType: 'compare',
        soundValue: arr[j],
      });

      if (arr[j] > arr[j + 1]) {
        // Swap step
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        swapped = true;

        steps.push({
          stepIndex: stepCount++,
          line: 7,
          description: `${arr[j + 1]} > ${arr[j]}이므로 두 원소의 위치를 교환합니다.`,
          variables: { n, i, j, 'arr[j]': arr[j], 'arr[j+1]': arr[j + 1], swapped: true },
          array: [...arr],
          comparingIndices: [],
          swappingIndices: [j, j + 1],
          sortedIndices: [...sortedIndices],
          soundType: 'swap',
          soundValue: arr[j + 1],
        });
      }
    }

    // Mark the last element of this pass as sorted
    sortedIndices.push(n - 1 - i);

    steps.push({
      stepIndex: stepCount++,
      line: 11,
      description: `i = ${i} 회차 완료. 인덱스 ${n - 1 - i}(값 ${arr[n - 1 - i]}) 정렬 확정.`,
      variables: { n, i, swapped, lastSorted: n - 1 - i },
      array: [...arr],
      comparingIndices: [],
      swappingIndices: [],
      sortedIndices: [...sortedIndices],
      soundType: 'pivot',
    });

    if (!swapped) {
      steps.push({
        stepIndex: stepCount++,
        line: 11,
        description: `교환이 일어나지 않았으므로 이미 정렬 완료되었습니다 (조기 종료).`,
        variables: { n, i, swapped: false, earlyExit: true },
        array: [...arr],
        comparingIndices: [],
        swappingIndices: [],
        sortedIndices: Array.from({ length: n }, (_, k) => k),
        soundType: 'complete',
      });
      break;
    }
  }

  // Final sorted step
  const allSorted = Array.from({ length: n }, (_, k) => k);
  steps.push({
    stepIndex: stepCount++,
    line: 13,
    description: `버블 정렬이 성공적으로 완료되었습니다!`,
    variables: { status: '완료', totalElements: n },
    array: [...arr],
    comparingIndices: [],
    swappingIndices: [],
    sortedIndices: allSorted,
    soundType: 'complete',
  });

  return steps;
}
