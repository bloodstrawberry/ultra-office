import { Step } from '../types';

export const COUNTING_SORT_CODE = `function countingSort(arr: number[]): number[] {
  const max = Math.max(...arr);
  const count = new Array(max + 1).fill(0);
  const output = new Array(arr.length);

  // 1. 각 원소의 등장 횟수 카운팅
  for (let i = 0; i < arr.length; i++) {
    count[arr[i]]++;
  }

  // 2. 누적 합 계산 (위치 결정)
  for (let i = 1; i <= max; i++) {
    count[i] += count[i - 1];
  }

  // 3. 안정 정렬을 위해 뒤에서부터 출력 배열에 배치
  for (let i = arr.length - 1; i >= 0; i--) {
    const val = arr[i];
    output[count[val] - 1] = val;
    count[val]--;
  }

  return output;
}`;

export const DEFAULT_COUNTING_ARRAY = [4, 2, 2, 8, 3, 3, 1, 6, 4, 2];

export function generateCountingSortSteps(inputArray: number[] = DEFAULT_COUNTING_ARRAY): Step[] {
  const steps: Step[] = [];
  const arr = [...inputArray];
  const max = Math.max(...arr, 8);
  const count = new Array(max + 1).fill(0);
  const output: (number | null)[] = new Array(arr.length).fill(null);

  // Step 0: Initial
  steps.push({
    stepIndex: 0,
    line: 1,
    description: `계수 정렬 시작: 최댓값(Max = ${max})을 기준으로 카운트 배열(크기 ${max + 1})을 초기화합니다.`,
    variables: { max, arrayLength: arr.length, phase: '시작' },
    array: [...arr],
    countArray: [...count],
    outputArray: [...output],
    countPhase: 'count',
    soundType: 'step',
  });

  // Phase 1: Counting occurrences
  for (let i = 0; i < arr.length; i++) {
    const val = arr[i];
    count[val]++;
    steps.push({
      stepIndex: steps.length,
      line: 8,
      description: `원소 arr[${i}] = ${val} 발견! count[${val}]을 1 증가시켜 ${count[val]}로 갱신합니다.`,
      variables: { i, 'arr[i]': val, [`count[${val}]`]: count[val], phase: '1. 등장 횟수 세기' },
      array: [...arr],
      comparingIndices: [i],
      countArray: [...count],
      outputArray: [...output],
      countPhase: 'count',
      activeCountIdx: val,
      soundType: 'compare',
      soundValue: val * 10,
    });
  }

  // Phase 2: Prefix Sum Accumulation
  for (let i = 1; i <= max; i++) {
    const prev = count[i - 1];
    const curr = count[i];
    count[i] += prev;
    steps.push({
      stepIndex: steps.length,
      line: 13,
      description: `누적 합 갱신: count[${i}] = count[${i}](${curr}) + count[${i - 1}](${prev}) = ${count[i]} (원소 ${i} 이하의 누적 개수)`,
      variables: { i, [`count[${i}]`]: count[i], phase: '2. 누적합 계산' },
      array: [...arr],
      countArray: [...count],
      outputArray: [...output],
      countPhase: 'accumulate',
      activeCountIdx: i,
      soundType: 'step',
    });
  }

  // Phase 3: Building Output Array (from back to keep stability)
  for (let i = arr.length - 1; i >= 0; i--) {
    const val = arr[i];
    const targetIdx = count[val] - 1;
    output[targetIdx] = val;
    count[val]--;

    steps.push({
      stepIndex: steps.length,
      line: 19,
      description: `원소 arr[${i}] = ${val}을(를) 정렬 위치 output[${targetIdx}]에 배치하고 count[${val}]을 ${count[val]}로 감소시킵니다.`,
      variables: { i, val, targetIdx, [`count[${val}]`]: count[val], phase: '3. 결과 배열 배치' },
      array: [...arr],
      comparingIndices: [i],
      countArray: [...count],
      outputArray: [...output],
      countPhase: 'output',
      activeCountIdx: val,
      soundType: 'swap',
      soundValue: val * 10,
    });
  }

  // Step final: Done
  steps.push({
    stepIndex: steps.length,
    line: 23,
    description: `계수 정렬 완료! O(N + K)의 선형 시간으로 모든 원소가 완벽히 안정(Stable) 정렬되었습니다.`,
    variables: { status: '정렬 완료', totalElements: arr.length },
    array: output.map((x) => x ?? 0),
    countArray: [...count],
    outputArray: [...output],
    countPhase: 'done',
    sortedIndices: Array.from({ length: arr.length }, (_, i) => i),
    soundType: 'complete',
  });

  return steps;
}
