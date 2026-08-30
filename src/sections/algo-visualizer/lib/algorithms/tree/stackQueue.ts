import type { Step } from '../types';

export const STACK_QUEUE_CODE = `// 1. Stack (LIFO: Last In First Out)
class Stack<T> {
  private items: T[] = [];
  push(item: T) { this.items.push(item); }
  pop(): T | undefined { return this.items.pop(); }
  peek(): T | undefined { return this.items[this.items.length - 1]; }
}

// 2. Queue (FIFO: First In First Out)
class Queue<T> {
  private items: T[] = [];
  enqueue(item: T) { this.items.push(item); }
  dequeue(): T | undefined { return this.items.shift(); }
  front(): T | undefined { return this.items[0]; }
}`;

export function generateStackQueueSteps(
  operations: Array<{ type: 'push' | 'pop' | 'enqueue' | 'dequeue'; value?: number }> = [
    { type: 'push', value: 10 },
    { type: 'push', value: 20 },
    { type: 'push', value: 30 },
    { type: 'pop' },
    { type: 'push', value: 40 },
    { type: 'enqueue', value: 100 },
    { type: 'enqueue', value: 200 },
    { type: 'dequeue' },
    { type: 'enqueue', value: 300 },
  ]
): Step[] {
  const steps: Step[] = [];
  let stepCount = 0;

  const stack: number[] = [];
  const queue: number[] = [];

  steps.push({
    stepIndex: stepCount++,
    line: 1,
    description: `스택(LIFO)과 큐(FIFO) 자료구조 동작 비교 시뮬레이션을 시작합니다.`,
    variables: { stackSize: 0, queueSize: 0 },
    stackItems: [...stack],
    queueItems: [...queue],
    soundType: 'step',
  });

  for (const op of operations) {
    if (op.type === 'push' && op.value !== undefined) {
      stack.push(op.value);
      steps.push({
        stepIndex: stepCount++,
        line: 4,
        description: `[Stack Push] 스택 최상단(Top)에 원소 ${op.value}을(를) 삽입합니다. (LIFO)`,
        variables: {
          operation: 'Stack.push',
          value: op.value,
          stackTop: op.value,
          stackLength: stack.length,
        },
        stackItems: [...stack],
        queueItems: [...queue],
        soundType: 'swap',
        soundValue: op.value,
      });
    } else if (op.type === 'pop') {
      const popped = stack.pop();
      steps.push({
        stepIndex: stepCount++,
        line: 5,
        description: `[Stack Pop] 가장 최근에 들어간 스택 최상단 원소 ${popped}을(를) 꺼냅니다. (LIFO)`,
        variables: { operation: 'Stack.pop', poppedValue: popped, stackLength: stack.length },
        stackItems: [...stack],
        queueItems: [...queue],
        soundType: 'pivot',
        soundValue: popped,
      });
    } else if (op.type === 'enqueue' && op.value !== undefined) {
      queue.push(op.value);
      steps.push({
        stepIndex: stepCount++,
        line: 12,
        description: `[Queue Enqueue] 큐 맨 뒤(Rear)에 원소 ${op.value}을(를) 줄세웁니다. (FIFO)`,
        variables: { operation: 'Queue.enqueue', value: op.value, queueLength: queue.length },
        stackItems: [...stack],
        queueItems: [...queue],
        soundType: 'swap',
        soundValue: op.value,
      });
    } else if (op.type === 'dequeue') {
      const dequeued = queue.shift();
      steps.push({
        stepIndex: stepCount++,
        line: 13,
        description: `[Queue Dequeue] 큐 맨 앞(Front)에서 가장 먼저 들어왔던 원소 ${dequeued}을(를) 꺼냅니다. (FIFO)`,
        variables: {
          operation: 'Queue.dequeue',
          dequeuedValue: dequeued,
          queueLength: queue.length,
        },
        stackItems: [...stack],
        queueItems: [...queue],
        soundType: 'pivot',
        soundValue: dequeued,
      });
    }
  }

  steps.push({
    stepIndex: stepCount++,
    line: 15,
    description: `스택 및 큐 연산 시뮬레이션 완료! 스택 남은 원소: [${stack.join(', ')}], 큐 남은 원소: [${queue.join(', ')}]`,
    variables: { status: '완료', finalStack: stack.length, finalQueue: queue.length },
    stackItems: [...stack],
    queueItems: [...queue],
    soundType: 'complete',
  });

  return steps;
}
