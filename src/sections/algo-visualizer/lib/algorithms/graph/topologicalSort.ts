import { Step, NetworkNode, NetworkEdge } from '../types';

export const TOPOLOGICAL_SORT_CODE = `// Kahn 알고리즘을 이용한 방향 비순환 그래프(DAG) 위상 정렬
function topologicalSort(V: number, adj: number[][], inDegree: number[]): number[] {
  const queue: number[] = [];
  const result: number[] = [];

  // 1. 진입 차수(In-Degree)가 0인 정점들을 큐에 삽입
  for (let i = 0; i < V; i++) {
    if (inDegree[i] === 0) {
      queue.push(i);
    }
  }

  // 2. 큐에서 원소를 꺼내며 연결된 간선 제거(이웃 진입차수 감소)
  while (queue.length > 0) {
    const u = queue.shift()!;
    result.push(u);

    for (const v of adj[u]) {
      inDegree[v]--;
      if (inDegree[v] === 0) {
        queue.push(v);
      }
    }
  }

  return result;
}`;

export const DEFAULT_TOPO_NODES: NetworkNode[] = [
  { id: '0', label: '기초프로그래밍', x: 60, y: 70, inDegree: 0, status: 'default' },
  { id: '1', label: '자료구조', x: 180, y: 50, inDegree: 1, status: 'default' },
  { id: '2', label: '알고리즘', x: 300, y: 50, inDegree: 2, status: 'default' },
  { id: '3', label: '이산수학', x: 60, y: 160, inDegree: 0, status: 'default' },
  { id: '4', label: '컴퓨터구조', x: 180, y: 160, inDegree: 1, status: 'default' },
  { id: '5', label: '시스템프로그래밍', x: 300, y: 160, inDegree: 2, status: 'default' },
];

export const DEFAULT_TOPO_EDGES: NetworkEdge[] = [
  { id: 'e01', from: '0', to: '1', isDirected: true, status: 'default' },
  { id: 'e12', from: '1', to: '2', isDirected: true, status: 'default' },
  { id: 'e32', from: '3', to: '2', isDirected: true, status: 'default' },
  { id: 'e34', from: '3', to: '4', isDirected: true, status: 'default' },
  { id: 'e45', from: '4', to: '5', isDirected: true, status: 'default' },
  { id: 'e05', from: '0', to: '5', isDirected: true, status: 'default' },
];

export function generateTopologicalSortSteps(
  rawNodes: NetworkNode[] = DEFAULT_TOPO_NODES,
  rawEdges: NetworkEdge[] = DEFAULT_TOPO_EDGES
): Step[] {
  const steps: Step[] = [];
  const V = rawNodes.length;
  const inDegree = new Array(V).fill(0);
  const adj: number[][] = Array.from({ length: V }, () => []);

  for (const edge of rawEdges) {
    const u = parseInt(edge.from);
    const v = parseInt(edge.to);
    adj[u].push(v);
    inDegree[v]++;
  }

  const nodes: NetworkNode[] = rawNodes.map((nd, idx) => ({
    ...nd,
    inDegree: inDegree[idx],
    status: 'default',
  }));
  const edges: NetworkEdge[] = rawEdges.map((e) => ({ ...e, status: 'default' }));
  const queue: number[] = [];
  const result: string[] = [];

  steps.push({
    stepIndex: 0,
    line: 6,
    description: `위상 정렬 시작: 모든 정점의 진입 차수(In-degree: 나에게 들어오는 화살표 수)를 계산합니다.`,
    variables: { totalVertices: V, inDegrees: inDegree.join(', '), phase: '초기화' },
    networkNodes: nodes.map((n) => ({ ...n })),
    networkEdges: edges.map((e) => ({ ...e })),
    topoOrder: [],
    soundType: 'step',
  });

  for (let i = 0; i < V; i++) {
    if (inDegree[i] === 0) {
      queue.push(i);
      nodes[i].status = 'active';
    }
  }

  steps.push({
    stepIndex: steps.length,
    line: 8,
    description: `진입 차수가 0인 선수 과목 노드 [${queue.map((idx) => nodes[idx].label).join(', ')}]을(를) 큐에 삽입했습니다.`,
    variables: { queue: queue.map((idx) => nodes[idx].label).join(', ') },
    networkNodes: nodes.map((n) => ({ ...n })),
    networkEdges: edges.map((e) => ({ ...e })),
    topoOrder: [],
    soundType: 'found',
  });

  while (queue.length > 0) {
    const u = queue.shift()!;
    const uNode = nodes[u];
    uNode.status = 'selected';
    result.push(uNode.label);

    steps.push({
      stepIndex: steps.length,
      line: 15,
      description: `[큐 Pop] 노드 '${uNode.label}' 방문 완료 ➔ 위상 정렬 결과 목록에 추가합니다.`,
      variables: { currentPopped: uNode.label, topoResult: result.join(' ➔ ') },
      networkNodes: nodes.map((n) => ({ ...n })),
      networkEdges: edges.map((e) => ({ ...e })),
      topoOrder: [...result],
      soundType: 'compare',
      soundValue: u * 15 + 30,
    });

    for (const v of adj[u]) {
      inDegree[v]--;
      nodes[v].inDegree = inDegree[v];

      const edgeIdx = edges.findIndex((e) => e.from === `${u}` && e.to === `${v}`);
      if (edgeIdx !== -1) edges[edgeIdx].status = 'comparing';

      steps.push({
        stepIndex: steps.length,
        line: 18,
        description: `간선 (${uNode.label} ➔ ${nodes[v].label}) 제거: 노드 '${nodes[v].label}'의 진입 차수가 ${inDegree[v] + 1}에서 ${inDegree[v]}로 감소했습니다.`,
        variables: { neighbor: nodes[v].label, newInDegree: inDegree[v] },
        networkNodes: nodes.map((n) => ({ ...n })),
        networkEdges: edges.map((e) => ({ ...e })),
        topoOrder: [...result],
        soundType: 'step',
      });

      if (inDegree[v] === 0) {
        queue.push(v);
        nodes[v].status = 'active';
        steps.push({
          stepIndex: steps.length,
          line: 20,
          description: `노드 '${nodes[v].label}'의 진입 차수가 0이 되어 모든 선수 조건이 만족되었으므로 큐에 추가합니다.`,
          variables: {
            newlyEnqueued: nodes[v].label,
            queue: queue.map((idx) => nodes[idx].label).join(', '),
          },
          networkNodes: nodes.map((n) => ({ ...n })),
          networkEdges: edges.map((e) => ({ ...e })),
          topoOrder: [...result],
          soundType: 'found',
          soundValue: 70,
        });
      }
    }
  }

  steps.push({
    stepIndex: steps.length,
    line: 25,
    description: `위상 정렬 완료! 순서: ${result.join(' ➔ ')}`,
    variables: { finalTopologicalOrder: result.join(' ➔ '), status: '정렬 완료' },
    networkNodes: nodes.map((n) => ({ ...n, status: 'selected' })),
    networkEdges: edges.map((e) => ({ ...e, status: 'selected' })),
    topoOrder: [...result],
    soundType: 'complete',
  });

  return steps;
}
