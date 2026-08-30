import type { Step, CallStackFrame } from '../types';

export const PERMUTATION_COMBINATION_CODE = `// 순열(Permutation: nPr) & 조합(Combination: nCr) 백트래킹 생성
function generatePermutations(items: number[], r: number): number[][] {
  const result: number[][] = [];
  const visited = new Array(items.length).fill(false);
  const current: number[] = [];

  function backtrack(depth: number) {
    if (depth === r) {
      result.push([...current]);
      return;
    }
    for (let i = 0; i < items.length; i++) {
      if (!visited[i]) {
        visited[i] = true;
        current.push(items[i]);
        backtrack(depth + 1);
        current.pop();
        visited[i] = false;
      }
    }
  }

  backtrack(0);
  return result;
}`;

export const DEFAULT_PERM_ITEMS = [1, 2, 3];
export const DEFAULT_PERM_R = 2;

export function generatePermutationCombinationSteps(
  items: number[] = DEFAULT_PERM_ITEMS,
  r: number = DEFAULT_PERM_R
): Step[] {
  const steps: Step[] = [];
  const source = items.slice(0, 4);
  const targetR = Math.min(source.length, Math.max(1, r));
  const visited = new Array(source.length).fill(false);
  const current: number[] = [];
  const generated: number[][] = [];
  const stack: CallStackFrame[] = [];

  steps.push({
    stepIndex: 0,
    line: 2,
    description: `순열/조합 생성 시작: 원소 집합 {${source.join(', ')}}에서 ${targetR}개를 선택하는 모든 순열 3P2(총 ${source.length * (source.length - 1)}가지)를 백트래킹으로 탐색합니다.`,
    variables: { items: `[${source.join(', ')}]`, r: targetR, totalCount: 0 },
    currentSelection: [],
    generatedCombinations: [],
    callStack: [],
    soundType: 'step',
  });

  function backtrack(depth: number) {
    const frame: CallStackFrame = {
      id: `depth-${depth}-${current.join('-')}`,
      name: 'backtrack',
      args: `depth = ${depth}, curr = [${current.join(',')}]`,
      depth,
      status: 'active',
    };
    stack.push(frame);

    if (depth === targetR) {
      const foundPerm = [...current];
      generated.push(foundPerm);

      steps.push({
        stepIndex: steps.length,
        line: 9,
        description: `[순열 완성!] 원소 (${foundPerm.join(', ')}) 생성 완료! (현재까지 총 ${generated.length}개 탐색)`,
        variables: { currentSelection: `[${foundPerm.join(', ')}]`, totalFound: generated.length },
        currentSelection: [...current],
        generatedCombinations: generated.map((arr) => [...arr]),
        callStack: stack.map((s) => ({ ...s })),
        totalWaysCount: generated.length,
        soundType: 'found',
        soundValue: generated.length * 20,
      });

      stack.pop();
      return;
    }

    for (let i = 0; i < source.length; i++) {
      if (!visited[i]) {
        visited[i] = true;
        current.push(source[i]);

        steps.push({
          stepIndex: steps.length,
          line: 15,
          description: `원소 ${source[i]} 선택 (인덱스 ${i}) ➔ 다음 깊이 backtrack(depth: ${depth + 1}) 재귀 호출`,
          variables: {
            pickedItem: source[i],
            currentList: `[${current.join(', ')}]`,
            depth: depth + 1,
          },
          currentSelection: [...current],
          generatedCombinations: generated.map((arr) => [...arr]),
          callStack: stack.map((s) => ({ ...s })),
          soundType: 'compare',
          soundValue: source[i] * 25,
        });

        backtrack(depth + 1);

        // Backtrack
        current.pop();
        visited[i] = false;

        steps.push({
          stepIndex: steps.length,
          line: 18,
          description: `[백트래킹 복귀] 원소 ${source[i]} 선택 해제 후 다음 분기 탐색`,
          variables: { unpickedItem: source[i], currentList: `[${current.join(', ')}]` },
          currentSelection: [...current],
          generatedCombinations: generated.map((arr) => [...arr]),
          callStack: stack.map((s) => ({ ...s })),
          soundType: 'step',
        });
      }
    }

    stack.pop();
  }

  backtrack(0);

  steps.push({
    stepIndex: steps.length,
    line: 23,
    description: `순열 생성 완료! 총 ${generated.length}개의 모든 경우의 수를 완벽히 도출하였습니다.`,
    variables: { totalPermutations: generated.length, status: '완료' },
    currentSelection: [],
    generatedCombinations: generated.map((arr) => [...arr]),
    callStack: [],
    totalWaysCount: generated.length,
    soundType: 'complete',
  });

  return steps;
}
