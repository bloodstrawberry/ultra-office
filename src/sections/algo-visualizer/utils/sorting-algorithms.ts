import type { SortStep, SortingAlgorithm } from '../types';

// ----------------------------------------------------------------------

export function generateRandomArray(size: number = 30): number[] {
  const arr: number[] = [];
  for (let i = 0; i < size; i++) {
    arr.push(Math.floor(Math.random() * 85) + 10);
  }
  return arr;
}

/**
 * Bubble Sort Step Generator
 */
export function generateBubbleSortSteps(initial: number[]): SortStep[] {
  const arr = [...initial];
  const steps: SortStep[] = [];
  let comparisons = 0;
  let swaps = 0;
  const sorted: number[] = [];

  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      comparisons++;
      steps.push({
        array: [...arr],
        comparing: [j, j + 1],
        swapping: [],
        sorted: [...sorted],
        comparisons,
        swaps,
        description: `${arr[j]}와(과) ${arr[j + 1]} 비교`,
      });

      if (arr[j] > arr[j + 1]) {
        swaps++;
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;

        steps.push({
          array: [...arr],
          comparing: [],
          swapping: [j, j + 1],
          sorted: [...sorted],
          comparisons,
          swaps,
          description: `${arr[j]} <-> ${arr[j + 1]} 위치 교환`,
        });
      }
    }
    sorted.unshift(arr.length - 1 - i);
  }

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: arr.map((_, idx) => idx),
    comparisons,
    swaps,
    description: '버블 정렬 완료!',
  });

  return steps;
}

/**
 * Quick Sort Step Generator
 */
export function generateQuickSortSteps(initial: number[]): SortStep[] {
  const arr = [...initial];
  const steps: SortStep[] = [];
  let comparisons = 0;
  let swaps = 0;
  const sorted: number[] = [];

  function quickSort(low: number, high: number) {
    if (low < high) {
      const pi = partition(low, high);
      quickSort(low, pi - 1);
      quickSort(pi + 1, high);
    } else if (low === high) {
      sorted.push(low);
    }
  }

  function partition(low: number, high: number): number {
    const pivot = arr[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
      comparisons++;
      steps.push({
        array: [...arr],
        comparing: [j, high],
        swapping: [],
        sorted: [...sorted],
        comparisons,
        swaps,
        description: `피벗(${pivot})과 원소(${arr[j]}) 비교`,
      });

      if (arr[j] < pivot) {
        i++;
        swaps++;
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;

        steps.push({
          array: [...arr],
          comparing: [],
          swapping: [i, j],
          sorted: [...sorted],
          comparisons,
          swaps,
          description: `피벗보다 작은 원소 ${arr[i]} 좌측으로 이동`,
        });
      }
    }

    swaps++;
    const temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    sorted.push(i + 1);

    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [i + 1, high],
      sorted: [...sorted],
      comparisons,
      swaps,
      description: `피벗 ${arr[i + 1]} 최종 정렬 위치 확정`,
    });

    return i + 1;
  }

  quickSort(0, arr.length - 1);

  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    sorted: arr.map((_, idx) => idx),
    comparisons,
    swaps,
    description: '퀵 정렬 완료!',
  });

  return steps;
}

/**
 * Universal step generator router
 */
export function generateSortSteps(algorithm: SortingAlgorithm, array: number[]): SortStep[] {
  switch (algorithm) {
    case 'quick':
      return generateQuickSortSteps(array);
    case 'bubble':
    default:
      return generateBubbleSortSteps(array);
  }
}
