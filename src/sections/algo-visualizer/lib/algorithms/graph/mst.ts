import { Step, NetworkNode, NetworkEdge } from '../types';

export const MST_CODE = `// 크루스칼(Kruskal) 알고리즘을 이용한 최소 신장 트리(MST)
interface Edge { u: number; v: number; weight: number; }

function kruskalMST(n: number, edges: Edge[]): { mstEdges: Edge[]; totalCost: number } {
  // 1. 간선들을 가중치 오름차순으로 정렬
  edges.sort((a, b) => a.weight - b.weight);

  const parent = Array.from({ length: n }, (_, i) => i);
  function find(x: number): number {
    if (parent[x] === x) return x;
    return (parent[x] = find(parent[x]));
  }
  function union(a: number, b: number): boolean {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA === rootB) return false; // 사이클 형성
    parent[rootB] = rootA;
    return true;
  }

  const mstEdges: Edge[] = [];
  let totalCost = 0;

  for (const edge of edges) {
    if (union(edge.u, edge.v)) {
      mstEdges.push(edge);
      totalCost += edge.weight;
      if (mstEdges.length === n - 1) break;
    }
  }

  return { mstEdges, totalCost };
}`;

export const DEFAULT_MST_NODES: NetworkNode[] = [
  { id: '0', label: 'A', x: 60, y: 70, status: 'default' },
  { id: '1', label: 'B', x: 180, y: 40, status: 'default' },
  { id: '2', label: 'C', x: 300, y: 70, status: 'default' },
  { id: '3', label: 'D', x: 100, y: 170, status: 'default' },
  { id: '4', label: 'E', x: 260, y: 170, status: 'default' },
];

export const DEFAULT_MST_EDGES: NetworkEdge[] = [
  { id: 'e01', from: '0', to: '1', weight: 2, status: 'default' },
  { id: 'e03', from: '0', to: '3', weight: 6, status: 'default' },
  { id: 'e12', from: '1', to: '2', weight: 3, status: 'default' },
  { id: 'e13', from: '1', to: '3', weight: 8, status: 'default' },
  { id: 'e14', from: '1', to: '4', weight: 5, status: 'default' },
  { id: 'e24', from: '2', to: '4', weight: 7, status: 'default' },
  { id: 'e34', from: '3', to: '4', weight: 9, status: 'default' },
];

export function generateMSTSteps(
  nodes: NetworkNode[] = DEFAULT_MST_NODES,
  rawEdges: NetworkEdge[] = DEFAULT_MST_EDGES
): Step[] {
  const steps: Step[] = [];
  const n = nodes.length;
  const edges = [...rawEdges].sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0));

  const parent = Array.from({ length: n }, (_, i) => i);
  function findRoot(x: number): number {
    if (parent[x] === x) return x;
    return (parent[x] = findRoot(parent[x]));
  }

  let totalWeight = 0;
  const currentEdges: NetworkEdge[] = edges.map((e) => ({ ...e, status: 'default' }));

  steps.push({
    stepIndex: 0,
    line: 6,
    description: `최소 신장 트리(MST) 시작: 모든 간선(${edges.length}개)을 가중치 오름차순으로 정렬했습니다. 유니온-파인드로 사이클 없이 N-1(${n - 1})개 간선을 선택합니다.`,
    variables: { totalNodes: n, totalEdges: edges.length, mstWeight: 0 },
    networkNodes: nodes.map((nd) => ({ ...nd })),
    networkEdges: currentEdges.map((e) => ({ ...e })),
    mstTotalWeight: 0,
    soundType: 'step',
  });

  for (const edge of edges) {
    const u = parseInt(edge.from);
    const v = parseInt(edge.to);
    const rootU = findRoot(u);
    const rootV = findRoot(v);

    const edgeIdx = currentEdges.findIndex((e) => e.id === edge.id);
    if (edgeIdx !== -1) {
      currentEdges[edgeIdx].status = 'comparing';
    }

    if (rootU !== rootV) {
      parent[rootV] = rootU;
      totalWeight += edge.weight ?? 0;
      if (edgeIdx !== -1) currentEdges[edgeIdx].status = 'selected';

      steps.push({
        stepIndex: steps.length,
        line: 22,
        description: `간선 (${nodes[u].label} - ${nodes[v].label}, 가중치 ${edge.weight}) 선택! 루트가 다르므로 사이클이 발생하지 않습니다. (누적 가중치: ${totalWeight})`,
        variables: {
          edge: `${nodes[u].label}-${nodes[v].label}`,
          weight: edge.weight,
          mstTotalWeight: totalWeight,
          status: 'MST 포함',
        },
        networkNodes: nodes.map((nd) => ({
          ...nd,
          status: nd.id === edge.from || nd.id === edge.to ? 'active' : nd.status,
        })),
        networkEdges: currentEdges.map((e) => ({ ...e })),
        mstTotalWeight: totalWeight,
        soundType: 'found',
        soundValue: (edge.weight ?? 1) * 20,
      });
    } else {
      if (edgeIdx !== -1) currentEdges[edgeIdx].status = 'rejected';

      steps.push({
        stepIndex: steps.length,
        line: 16,
        description: `간선 (${nodes[u].label} - ${nodes[v].label}, 가중치 ${edge.weight}) 제외! 두 정점이 이미 같은 집합(루트 ${nodes[rootU].label})에 속해 사이클(Cycle)이 형성됩니다.`,
        variables: {
          edge: `${nodes[u].label}-${nodes[v].label}`,
          weight: edge.weight,
          status: '사이클 발생으로 거부',
        },
        networkNodes: nodes.map((nd) => ({ ...nd })),
        networkEdges: currentEdges.map((e) => ({ ...e })),
        mstTotalWeight: totalWeight,
        soundType: 'swap',
      });
    }
  }

  steps.push({
    stepIndex: steps.length,
    line: 28,
    description: `최소 신장 트리(MST) 완성! 모든 ${n}개 정점을 최소 비용(총 가중치 ${totalWeight})으로 완벽히 연결했습니다.`,
    variables: { finalMSTWeight: totalWeight, status: 'MST 구성 완료' },
    networkNodes: nodes.map((nd) => ({ ...nd, status: 'selected' })),
    networkEdges: currentEdges.map((e) => ({ ...e })),
    mstTotalWeight: totalWeight,
    soundType: 'complete',
  });

  return steps;
}
