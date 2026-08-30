import type { Step, TreeNodeData, CallStackFrame } from '../types';

export const RECURSION_CODE = `// 팩토리얼(Factorial) & 피보나치 재귀 함수 (Call Stack 시각화)
function factorial(n: number): number {
  // 1. 기저 조건 (Base Case)
  if (n <= 1) {
    return 1;
  }
  // 2. 재귀 호출 (Recursive Call)
  const subResult = factorial(n - 1);
  return n * subResult;
}`;

export const DEFAULT_RECURSION_N = 4;

export function generateRecursionSteps(n: number = DEFAULT_RECURSION_N): Step[] {
  const steps: Step[] = [];
  const targetN = Math.max(1, Math.min(6, n));
  const stack: CallStackFrame[] = [];

  function buildTree(currentN: number, depth: number): TreeNodeData {
    return {
      id: `f-${currentN}`,
      value: currentN,
      label: `f(${currentN})`,
      x: 200,
      y: 50 + depth * 55,
      status: 'default',
      children: currentN > 1 ? [buildTree(currentN - 1, depth + 1)] : [],
    };
  }

  const rootTree = buildTree(targetN, 0);

  // Step 0: Start
  steps.push({
    stepIndex: 0,
    line: 2,
    description: `재귀(Recursion) 시작: 자기 자신을 재참조하는 factorial(${targetN})을 호출하여 호출 스택(Call Stack)에 프레임을 적재합니다.`,
    variables: { n: targetN, phase: '호출 시작' },
    callStack: [],
    treeRoot: rootTree,
    soundType: 'step',
  });

  function recurse(k: number, depth: number): number {
    const frameId = `frame-${k}`;
    const frame: CallStackFrame = {
      id: frameId,
      name: 'factorial',
      args: `n = ${k}`,
      depth,
      status: 'calling',
    };
    stack.push(frame);

    steps.push({
      stepIndex: steps.length,
      line: 2,
      description: `[Call Stack Push] factorial(${k}) 호출! 깊이(Depth) ${depth}에 실행 프레임이 추가되었습니다.`,
      variables: { currentN: k, stackDepth: stack.length, frame: `factorial(${k})` },
      callStack: stack.map((s) => ({ ...s })),
      activeNodeId: `f-${k}`,
      soundType: 'compare',
      soundValue: k * 20,
    });

    if (k <= 1) {
      frame.returnValue = 1;
      frame.status = 'returning';
      steps.push({
        stepIndex: steps.length,
        line: 4,
        description: `[Base Case 도달] factorial(${k}) 기저 조건 만족! 반환값 1을 상위 호출자에게 되돌려줍니다.`,
        variables: { currentN: k, returnValue: 1, baseCase: 'n <= 1' },
        callStack: stack.map((s) => ({ ...s })),
        activeNodeId: `f-${k}`,
        soundType: 'found',
        soundValue: 90,
      });

      stack.pop();
      return 1;
    }

    const sub = recurse(k - 1, depth + 1);
    const result = k * sub;
    frame.returnValue = result;
    frame.status = 'returning';

    steps.push({
      stepIndex: steps.length,
      line: 8,
      description: `[Call Stack Pop] factorial(${k}) 복귀: ${k} × factorial(${k - 1})(${sub}) = ${result} 계산 완료 후 스택에서 제거(Pop)됩니다.`,
      variables: { currentN: k, subResult: sub, returnedTotal: result },
      callStack: stack.map((s) => ({ ...s })),
      activeNodeId: `f-${k}`,
      soundType: 'swap',
      soundValue: result * 10,
    });

    stack.pop();
    return result;
  }

  const finalAns = recurse(targetN, 1);

  steps.push({
    stepIndex: steps.length,
    line: 9,
    description: `재귀 호출 완료! factorial(${targetN})의 최종 계산 결과는 ${finalAns} 입니다. 호출 스택이 모두 비워졌습니다.`,
    variables: { finalResult: finalAns, totalStackFrames: 0 },
    callStack: [],
    soundType: 'complete',
  });

  return steps;
}
