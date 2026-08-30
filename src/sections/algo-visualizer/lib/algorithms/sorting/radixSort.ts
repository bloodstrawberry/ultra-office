import type { Step } from '../types';

export const RADIX_SORT_CODE = `// 기수 정렬 (LSD Radix Sort) - 1의 자리부터 최상위 자리까지 버킷 정렬
function radixSort(arr: number[]): number[] {
  const max = Math.max(...arr);
  let exp = 1; // 1, 10, 100...

  while (Math.floor(max / exp) > 0) {
    const buckets: number[][] = Array.from({ length: 10 }, () => []);

    // 1. 현재 자릿수(exp)를 기준으로 0~9 버킷에 분배
    for (let i = 0; i < arr.length; i++) {
      const digit = Math.floor(arr[i] / exp) % 10;
      buckets[digit].push(arr[i]);
    }

    // 2. 버킷에서 순서대로 꺼내 배열에 재배치
    let idx = 0;
    for (let d = 0; d < 10; d++) {
      for (const val of buckets[d]) {
        arr[idx++] = val;
      }
    }

    exp *= 10;
  }

  return arr;
}`;

export const DEFAULT_RADIX_ARRAY = [170, 45, 75, 90, 802, 24, 2, 66];

export function generateRadixSortSteps(inputArray: number[] = DEFAULT_RADIX_ARRAY): Step[] {
  const steps: Step[] = [];
  const arr = [...inputArray];
  const max = Math.max(...arr);
  let exp = 1;

  steps.push({
    stepIndex: 0,
    line: 2,
    description: `기수 정렬 시작: 최댓값 ${max}의 자릿수(${String(max).length}자리)만큼 1의 자리(1s)부터 0~9 버킷 분배를 반복합니다.`,
    variables: { max, arrayLength: arr.length, currentExp: '1s 자리', phase: '초기화' },
    array: [...arr],
    radixBuckets: Array.from({ length: 10 }, () => []),
    radixDigitExp: exp,
    soundType: 'step',
  });

  while (Math.floor(max / exp) > 0) {
    const buckets: number[][] = Array.from({ length: 10 }, () => []);
    const digitName = exp === 1 ? '1의 자리' : exp === 10 ? '10의 자리' : '100의 자리';

    steps.push({
      stepIndex: steps.length,
      line: 6,
      description: `[자릿수 ${digitName} 분배 시작] 배열의 각 숫자의 ${digitName} 숫자를 기준으로 0~9 버킷에 넣습니다.`,
      variables: { currentExp: digitName, divisor: exp, phase: '버킷 분배' },
      array: [...arr],
      radixBuckets: buckets.map((b) => [...b]),
      radixDigitExp: exp,
      soundType: 'step',
    });

    for (let i = 0; i < arr.length; i++) {
      const val = arr[i];
      const digit = Math.floor(val / exp) % 10;
      buckets[digit].push(val);

      steps.push({
        stepIndex: steps.length,
        line: 9,
        description: `원소 ${val}의 ${digitName}는 [${digit}] ➔ 버킷 #${digit}에 분배`,
        variables: { currentVal: val, digit, targetBucket: `#${digit}` },
        array: [...arr],
        comparingIndices: [i],
        radixBuckets: buckets.map((b) => [...b]),
        radixDigitExp: exp,
        soundType: 'compare',
        soundValue: digit * 10 + 10,
      });
    }

    // 수거 단계
    let idx = 0;
    for (let d = 0; d < 10; d++) {
      for (const val of buckets[d]) {
        arr[idx] = val;
        idx++;
      }
    }

    steps.push({
      stepIndex: steps.length,
      line: 15,
      description: `[자릿수 ${digitName} 수거 완료] 0번부터 9번 버킷까지 순서대로 꺼내 배열을 재구성했습니다.`,
      variables: { currentExp: digitName, phase: '버킷 수거 완료' },
      array: [...arr],
      radixBuckets: buckets.map((b) => [...b]),
      radixDigitExp: exp,
      soundType: 'swap',
      soundValue: 60,
    });

    exp *= 10;
  }

  steps.push({
    stepIndex: steps.length,
    line: 23,
    description: `기수 정렬 완료! 비교 연산 없이 O(d × (N + K))의 선형 시간으로 모든 원소가 정렬되었습니다.`,
    variables: { status: '정렬 완료', totalElements: arr.length },
    array: [...arr],
    sortedIndices: Array.from({ length: arr.length }, (_, i) => i),
    radixBuckets: Array.from({ length: 10 }, () => []),
    soundType: 'complete',
  });

  return steps;
}
