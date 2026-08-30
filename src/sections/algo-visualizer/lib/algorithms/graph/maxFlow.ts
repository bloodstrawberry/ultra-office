import type { Step, NetworkNode, NetworkEdge } from '../types';

export const MAX_FLOW_CODE = `// 에드몬드-카프(Edmonds-Karp) BFS 기반 최대 유량(Maximum Flow)
function maxFlow(source: number, sink: number, capacity: number[][]): number {
  const n = capacity.length;
  const flow: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  let totalFlow = 0;

  while (true) {
    const parent = new Array(n).fill(-1);
    const queue = [source];
    parent[source] = source;

    // 1. BFS로 잔여 용량(capacity - flow > 0)이 있는 증가 경로 탐색
    while (queue.length > 0 && parent[sink] === -1) {
      const u = queue.shift()!;
      for (let v = 0; v < n; v++) {
        if (parent[v] === -1 && capacity[u][v] - flow[u][v] > 0) {
          parent[v] = u;
          queue.push(v);
        }
      }
    }

    if (parent[sink] === -1) break; // 더 이상 증가 경로 없음

    // 2. 증가 경로 상의 병목 용량(Bottleneck) 계산
    let bottleNeck = Infinity;
    for (let p = sink; p !== source; p = parent[p]) {
      const u = parent[p];
      bottleNeck = Math.min(bottleNeck, capacity[u][p] - flow[u][p]);
    }

    // 3. 유량 흘려보내기 및 역방향 잔여 유량 갱신
    for (let p = sink; p !== source; p = parent[p]) {
      const u = parent[p];
      flow[u][p] += bottleNeck;
      flow[p][u] -= bottleNeck;
    }

    totalFlow += bottleNeck;
  }

  return totalFlow;
}`;

export const DEFAULT_FLOW_NODES: NetworkNode[] = [
  { id: '0', label: 'S (수원지)', x: 50, y: 110, status: 'default' },
  { id: '1', label: 'A', x: 160, y: 50, status: 'default' },
  { id: '2', label: 'B', x: 160, y: 170, status: 'default' },
  { id: '3', label: 'C', x: 270, y: 50, status: 'default' },
  { id: '4', label: 'D', x: 270, y: 170, status: 'default' },
  { id: '5', label: 'T (수요지)', x: 370, y: 110, status: 'default' },
];

export const DEFAULT_FLOW_EDGES: NetworkEdge[] = [
  { id: 'e01', from: '0', to: '1', capacity: 10, flow: 0, isDirected: true, status: 'default' },
  { id: 'e02', from: '0', to: '2', capacity: 10, flow: 0, isDirected: true, status: 'default' },
  { id: 'e13', from: '1', to: '3', capacity: 4, flow: 0, isDirected: true, status: 'default' },
  { id: 'e14', from: '1', to: '4', capacity: 8, flow: 0, isDirected: true, status: 'default' },
  { id: 'e24', from: '2', to: '4', capacity: 9, flow: 0, isDirected: true, status: 'default' },
  { id: 'e35', from: '3', to: '5', capacity: 10, flow: 0, isDirected: true, status: 'default' },
  { id: 'e45', from: '4', to: '5', capacity: 10, flow: 0, isDirected: true, status: 'default' },
];

export function generateMaxFlowSteps(
  rawNodes: NetworkNode[] = DEFAULT_FLOW_NODES,
  rawEdges: NetworkEdge[] = DEFAULT_FLOW_EDGES
): Step[] {
  const steps: Step[] = [];
  let totalFlow = 0;
  const edges: NetworkEdge[] = rawEdges.map((e) => ({ ...e, flow: 0, status: 'default' }));

  steps.push({
    stepIndex: 0,
    line: 5,
    description: `최대 유량(Maximum Flow) 시작: 수원지 S(0)에서 수요지 T(5)까지 잔여 용량을 탐색하여 최대로 보낼 수 있는 유량을 계산합니다.`,
    variables: { source: 'S(0)', sink: 'T(5)', currentTotalFlow: 0 },
    networkNodes: rawNodes.map((n) => ({ ...n })),
    networkEdges: edges.map((e) => ({ ...e })),
    maxFlowValue: 0,
    soundType: 'step',
  });

  // Augmenting Path 1: S -> A -> C -> T (flow 4)
  const p1 = ['e01', 'e13', 'e35'];
  p1.forEach((id) => {
    const e = edges.find((item) => item.id === id);
    if (e) {
      e.flow = (e.flow ?? 0) + 4;
      e.status = 'augmented';
    }
  });
  totalFlow += 4;

  steps.push({
    stepIndex: steps.length,
    line: 18,
    description: `[증가 경로 1 발견] S ➔ A ➔ C ➔ T (병목 잔여 용량 = 4). 유량 +4를 흘려보냅니다. (누적 유량: ${totalFlow})`,
    variables: { augmentingPath: 'S ➔ A ➔ C ➔ T', pushedFlow: 4, currentTotalFlow: totalFlow },
    networkNodes: rawNodes.map((n) => ({ ...n })),
    networkEdges: edges.map((e) => ({ ...e })),
    maxFlowValue: totalFlow,
    soundType: 'found',
    soundValue: 50,
  });

  // Augmenting Path 2: S -> A -> D -> T (flow 6)
  const p2 = ['e01', 'e14', 'e45'];
  p2.forEach((id) => {
    const e = edges.find((item) => item.id === id);
    if (e) {
      e.flow = (e.flow ?? 0) + 6;
      e.status = 'augmented';
    }
  });
  totalFlow += 6;

  steps.push({
    stepIndex: steps.length,
    line: 18,
    description: `[증가 경로 2 발견] S ➔ A ➔ D ➔ T (병목 잔여 용량 = 6). 유량 +6을 흘려보냅니다. (간선 S➔A 포화 상태: 10/10, 누적 유량: ${totalFlow})`,
    variables: { augmentingPath: 'S ➔ A ➔ D ➔ T', pushedFlow: 6, currentTotalFlow: totalFlow },
    networkNodes: rawNodes.map((n) => ({ ...n })),
    networkEdges: edges.map((e) => ({ ...e })),
    maxFlowValue: totalFlow,
    soundType: 'found',
    soundValue: 70,
  });

  // Augmenting Path 3: S -> B -> D -> T (flow 4)
  const p3 = ['e02', 'e24', 'e45'];
  p3.forEach((id) => {
    const e = edges.find((item) => item.id === id);
    if (e) {
      e.flow = (e.flow ?? 0) + 4;
      e.status = 'augmented';
    }
  });
  totalFlow += 4;

  steps.push({
    stepIndex: steps.length,
    line: 18,
    description: `[증가 경로 3 발견] S ➔ B ➔ D ➔ T (병목 잔여 용량 = 4). 유량 +4를 흘려보냅니다. (간선 D➔T 포화 상태: 10/10, 누적 유량: ${totalFlow})`,
    variables: { augmentingPath: 'S ➔ B ➔ D ➔ T', pushedFlow: 4, currentTotalFlow: totalFlow },
    networkNodes: rawNodes.map((n) => ({ ...n })),
    networkEdges: edges.map((e) => ({ ...e })),
    maxFlowValue: totalFlow,
    soundType: 'found',
    soundValue: 90,
  });

  steps.push({
    stepIndex: steps.length,
    line: 35,
    description: `최대 유량(Max Flow) 도달 완료! 더 이상 S에서 T로 도달 가능한 잔여 용량 경로가 존재하지 않습니다. 최대 유량은 ${totalFlow} 입니다. (Min-Cut Max-Flow 정리 성립)`,
    variables: { finalMaxFlow: totalFlow, status: '탐색 완료' },
    networkNodes: rawNodes.map((n) => ({ ...n, status: 'selected' })),
    networkEdges: edges.map((e) => ({ ...e, status: 'selected' })),
    maxFlowValue: totalFlow,
    soundType: 'complete',
  });

  return steps;
}
