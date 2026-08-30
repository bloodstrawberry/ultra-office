import type { Step, TreeNodeData } from '../types';

export const BST_CODE = `class BSTNode {
  value: number;
  left: BSTNode | null = null;
  right: BSTNode | null = null;
  constructor(val: number) { this.value = val; }
}

function insertBST(root: BSTNode | null, val: number): BSTNode {
  if (!root) return new BSTNode(val);
  if (val < root.value) {
    root.left = insertBST(root.left, val);
  } else if (val > root.value) {
    root.right = insertBST(root.right, val);
  }
  return root;
}

function inorder(root: BSTNode | null, result: number[] = []): number[] {
  if (!root) return result;
  inorder(root.left, result);
  result.push(root.value);
  inorder(root.right, result);
  return result;
}`;

export function calculateTreeLayout(root: TreeNodeData | null): TreeNodeData | null {
  if (!root) return null;

  function clone(node: TreeNodeData | null): TreeNodeData | null {
    if (!node) return null;
    return {
      id: node.id,
      value: node.value,
      left: clone(node.left || null),
      right: clone(node.right || null),
    };
  }

  const newRoot = clone(root);
  if (!newRoot) return null;

  function assignPositions(
    node: TreeNodeData | null,
    depth: number,
    leftBoundary: number,
    rightBoundary: number
  ) {
    if (!node) return;
    const x = (leftBoundary + rightBoundary) / 2;
    const y = 40 + depth * 60;
    node.x = x;
    node.y = y;

    assignPositions(node.left || null, depth + 1, leftBoundary, x);
    assignPositions(node.right || null, depth + 1, x, rightBoundary);
  }

  assignPositions(newRoot, 0, 20, 380);
  return newRoot;
}

export function generateBSTSteps(
  valuesToInsert: number[] = [50, 30, 70, 20, 40, 60, 80, 35]
): Step[] {
  const steps: Step[] = [];
  let stepCount = 0;
  let root: TreeNodeData | null = null;

  steps.push({
    stepIndex: stepCount++,
    line: 8,
    description: `이진 탐색 트리(BST) 생성 및 노드 삽입을 시작합니다.`,
    variables: { totalNodes: valuesToInsert.length },
    treeRoot: null,
    visitedNodeIds: [],
    soundType: 'step',
  });

  for (const val of valuesToInsert) {
    const visitedIds: string[] = [];

    steps.push({
      stepIndex: stepCount++,
      line: 8,
      description: `새로운 노드 값 [${val}] 삽입 시작`,
      variables: { insertingValue: val },
      treeRoot: calculateTreeLayout(root),
      activeNodeId: null,
      visitedNodeIds: [...visitedIds],
      soundType: 'step',
      soundValue: val,
    });

    if (!root) {
      root = { id: `node-${val}`, value: val };
      steps.push({
        stepIndex: stepCount++,
        line: 9,
        description: `루트 노드가 비어있으므로 [${val}]을 루트 노드로 생성합니다.`,
        variables: { rootValue: val },
        treeRoot: calculateTreeLayout(root),
        activeNodeId: `node-${val}`,
        visitedNodeIds: [`node-${val}`],
        soundType: 'found',
        soundValue: val,
      });
      continue;
    }

    let curr: TreeNodeData = root;
    let inserted = false;

    while (!inserted) {
      visitedIds.push(curr.id);

      steps.push({
        stepIndex: stepCount++,
        line: 10,
        description: `삽입할 값(${val})과 현재 노드 [${curr.value}]를 비교합니다.`,
        variables: { insertVal: val, currentNodeVal: curr.value },
        treeRoot: calculateTreeLayout(root),
        activeNodeId: curr.id,
        visitedNodeIds: [...visitedIds],
        soundType: 'compare',
        soundValue: curr.value,
      });

      if (val < curr.value) {
        if (!curr.left) {
          curr.left = { id: `node-${val}`, value: val };
          inserted = true;
          steps.push({
            stepIndex: stepCount++,
            line: 11,
            description: `${val} < ${curr.value}이고 왼쪽 자식이 없으므로 왼쪽에 [${val}] 노드를 연결합니다.`,
            variables: { parent: curr.value, direction: 'left', newNode: val },
            treeRoot: calculateTreeLayout(root),
            activeNodeId: `node-${val}`,
            visitedNodeIds: [...visitedIds, `node-${val}`],
            soundType: 'swap',
            soundValue: val,
          });
        } else {
          steps.push({
            stepIndex: stepCount++,
            line: 11,
            description: `${val} < ${curr.value}이므로 왼쪽 자식 노드 [${curr.left.value}]로 이동합니다.`,
            variables: { parent: curr.value, nextNode: curr.left.value },
            treeRoot: calculateTreeLayout(root),
            activeNodeId: curr.left.id,
            visitedNodeIds: [...visitedIds],
            soundType: 'pivot',
          });
          curr = curr.left;
        }
      } else if (val > curr.value) {
        if (!curr.right) {
          curr.right = { id: `node-${val}`, value: val };
          inserted = true;
          steps.push({
            stepIndex: stepCount++,
            line: 13,
            description: `${val} > ${curr.value}이고 오른쪽 자식이 없으므로 오른쪽에 [${val}] 노드를 연결합니다.`,
            variables: { parent: curr.value, direction: 'right', newNode: val },
            treeRoot: calculateTreeLayout(root),
            activeNodeId: `node-${val}`,
            visitedNodeIds: [...visitedIds, `node-${val}`],
            soundType: 'swap',
            soundValue: val,
          });
        } else {
          steps.push({
            stepIndex: stepCount++,
            line: 13,
            description: `${val} > ${curr.value}이므로 오른쪽 자식 노드 [${curr.right.value}]로 이동합니다.`,
            variables: { parent: curr.value, nextNode: curr.right.value },
            treeRoot: calculateTreeLayout(root),
            activeNodeId: curr.right.id,
            visitedNodeIds: [...visitedIds],
            soundType: 'pivot',
          });
          curr = curr.right;
        }
      } else {
        // Duplicate
        inserted = true;
        break;
      }
    }
  }

  // Inorder traversal demo step
  const traversalResult: number[] = [];
  function inorderTraverse(node: TreeNodeData | null) {
    if (!node) return;
    inorderTraverse(node.left || null);
    traversalResult.push(node.value);
    steps.push({
      stepIndex: stepCount++,
      line: 20,
      description: `중위 순회(Inorder Traversal): 노드 [${node.value}] 방문 -> 정렬된 결과: [${traversalResult.join(', ')}]`,
      variables: { visitedNode: node.value, traversalCount: traversalResult.length },
      treeRoot: calculateTreeLayout(root),
      activeNodeId: node.id,
      visitedNodeIds: traversalResult.map((v) => `node-${v}`),
      traversalResult: [...traversalResult],
      soundType: 'found',
      soundValue: node.value,
    });
    inorderTraverse(node.right || null);
  }

  steps.push({
    stepIndex: stepCount++,
    line: 18,
    description: `BST 구성 완료! 이제 중위 순회(Left -> Root -> Right)를 통해 오름차순 출력을 확인합니다.`,
    variables: { status: '중위 순회 시작' },
    treeRoot: calculateTreeLayout(root),
    activeNodeId: null,
    visitedNodeIds: [],
    soundType: 'step',
  });

  inorderTraverse(root);

  steps.push({
    stepIndex: stepCount++,
    line: 22,
    description: `이진 탐색 트리 삽입 및 중위 순회가 완료되었습니다! (오름차순 정렬 특성 확인)`,
    variables: { finalSorted: traversalResult.join(', ') },
    treeRoot: calculateTreeLayout(root),
    activeNodeId: null,
    visitedNodeIds: traversalResult.map((v) => `node-${v}`),
    traversalResult: [...traversalResult],
    soundType: 'complete',
  });

  return steps;
}
