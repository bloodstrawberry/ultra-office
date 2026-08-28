import { Step, NetworkNode, NetworkEdge } from '../types';

export const BIPARTITE_MATCH_CODE = `// 이분 그래프 최대 매칭 (Bipartite Matching using DFS)
function bipartiteMatch(groupA: number[], adj: number[][]): number {
  const matchB = new Array(groupA.length).fill(-1);
  let matchCount = 0;

  function dfs(u: number, visited: boolean[]): boolean {
    for (const v of adj[u]) {
      if (visited[v]) continue;
      visited[v] = true;

      // v가 아직 매칭되지 않았거나, v와 매칭된 기존 정점이 다른 정점과 매칭될 수 있다면
      if (matchB[v] === -1 || dfs(matchB[v], visited)) {
        matchB[v] = u;
        return true;
      }
    }
    return false;
  }

  for (let u = 0; u < groupA.length; u++) {
    const visited = new Array(groupA.length).fill(false);
    if (dfs(u, visited)) {
      matchCount++;
    }
  }

  return matchCount;
}`;

export const DEFAULT_BIPARTITE_NODES: NetworkNode[] = [
  { id: 'A1', label: '개발자1', x: 80, y: 40, group: 'A', status: 'default' },
  { id: 'A2', label: '개발자2', x: 80, y: 100, group: 'A', status: 'default' },
  { id: 'A3', label: '개발자3', x: 80, y: 160, group: 'A', status: 'default' },
  { id: 'A4', label: '개발자4', x: 80, y: 220, group: 'A', status: 'default' },

  { id: 'B1', label: '프로젝트A', x: 300, y: 40, group: 'B', status: 'default' },
  { id: 'B2', label: '프로젝트B', x: 300, y: 100, group: 'B', status: 'default' },
  { id: 'B3', label: '프로젝트C', x: 300, y: 160, group: 'B', status: 'default' },
  { id: 'B4', label: '프로젝트D', x: 300, y: 220, group: 'B', status: 'default' },
];

export const DEFAULT_BIPARTITE_EDGES: NetworkEdge[] = [
  { id: 'e11', from: 'A1', to: 'B1', status: 'default' },
  { id: 'e12', from: 'A1', to: 'B2', status: 'default' },
  { id: 'e21', from: 'A2', to: 'B1', status: 'default' },
  { id: 'e23', from: 'A2', to: 'B3', status: 'default' },
  { id: 'e32', from: 'A3', to: 'B2', status: 'default' },
  { id: 'e34', from: 'A3', to: 'B4', status: 'default' },
  { id: 'e43', from: 'A4', to: 'B3', status: 'default' },
];

export function generateBipartiteMatchSteps(
  nodes: NetworkNode[] = DEFAULT_BIPARTITE_NODES,
  rawEdges: NetworkEdge[] = DEFAULT_BIPARTITE_EDGES
): Step[] {
  const steps: Step[] = [];
  const edges: NetworkEdge[] = rawEdges.map((e) => ({ ...e, status: 'default' }));
  const matchedPairs: [string, string][] = [];

  steps.push({
    stepIndex: 0,
    line: 3,
    description: `이분 매칭(Bipartite Match) 시작: 그룹 A(구직자)와 그룹 B(프로젝트) 간에 간선이 겹치지 않는 최대 1:1 매칭 쌍을 탐색합니다.`,
    variables: { totalGroupA: 4, totalGroupB: 4, totalMatches: 0 },
    networkNodes: nodes.map((n) => ({ ...n })),
    networkEdges: edges.map((e) => ({ ...e })),
    bipartiteMatches: [],
    soundType: 'step',
  });

  // Step 1: Match A1 -> B1
  const e1 = edges.find((e) => e.id === 'e11');
  if (e1) e1.status = 'matched';
  matchedPairs.push(['A1', 'B1']);
  steps.push({
    stepIndex: steps.length,
    line: 11,
    description: `개발자1(A1) ➔ 프로젝트A(B1) 매칭 성공! (현재 매칭 수: 1)`,
    variables: { currentA: 'A1', targetB: 'B1', totalMatches: 1 },
    networkNodes: nodes.map((n) => ({
      ...n,
      status: n.id === 'A1' || n.id === 'B1' ? 'matched' : n.status,
    })),
    networkEdges: edges.map((e) => ({ ...e })),
    bipartiteMatches: [...matchedPairs],
    soundType: 'found',
    soundValue: 40,
  });

  // Step 2: A2 wants B1 (occupied by A1), A1 can switch to B2!
  const e2 = edges.find((e) => e.id === 'e21');
  const e1_switch = edges.find((e) => e.id === 'e12');
  if (e1) e1.status = 'default';
  if (e1_switch) e1_switch.status = 'matched';
  if (e2) e2.status = 'matched';
  matchedPairs[0] = ['A1', 'B2'];
  matchedPairs.push(['A2', 'B1']);

  steps.push({
    stepIndex: steps.length,
    line: 13,
    description: `[DFS 증가 경로 갱신] 개발자2(A2)가 프로젝트A를 원하여, 기존 개발자1(A1)을 프로젝트B(B2)로 재배치하고 A2 ➔ B1 매칭 성공! (현재 매칭 수: 2)`,
    variables: { reassigned: 'A1 ➔ B2', newMatched: 'A2 ➔ B1', totalMatches: 2 },
    networkNodes: nodes.map((n) => ({
      ...n,
      status: ['A1', 'A2', 'B1', 'B2'].includes(n.id) ? 'matched' : n.status,
    })),
    networkEdges: edges.map((e) => ({ ...e })),
    bipartiteMatches: [...matchedPairs],
    soundType: 'swap',
    soundValue: 60,
  });

  // Step 3: Match A3 -> B4
  const e3 = edges.find((e) => e.id === 'e34');
  if (e3) e3.status = 'matched';
  matchedPairs.push(['A3', 'B4']);

  steps.push({
    stepIndex: steps.length,
    line: 11,
    description: `개발자3(A3) ➔ 프로젝트D(B4) 매칭 성공! (현재 매칭 수: 3)`,
    variables: { currentA: 'A3', targetB: 'B4', totalMatches: 3 },
    networkNodes: nodes.map((n) => ({
      ...n,
      status: ['A1', 'A2', 'A3', 'B1', 'B2', 'B4'].includes(n.id) ? 'matched' : n.status,
    })),
    networkEdges: edges.map((e) => ({ ...e })),
    bipartiteMatches: [...matchedPairs],
    soundType: 'found',
    soundValue: 80,
  });

  // Step 4: Match A4 -> B3
  const e4 = edges.find((e) => e.id === 'e43');
  if (e4) e4.status = 'matched';
  matchedPairs.push(['A4', 'B3']);

  steps.push({
    stepIndex: steps.length,
    line: 11,
    description: `개발자4(A4) ➔ 프로젝트C(B3) 매칭 성공! (현재 매칭 수: 4)`,
    variables: { currentA: 'A4', targetB: 'B3', totalMatches: 4 },
    networkNodes: nodes.map((n) => ({ ...n, status: 'matched' })),
    networkEdges: edges.map((e) => ({ ...e })),
    bipartiteMatches: [...matchedPairs],
    soundType: 'found',
    soundValue: 100,
  });

  steps.push({
    stepIndex: steps.length,
    line: 23,
    description: `최대 이분 매칭 완료! 총 4개 그룹 쌍이 충돌 없이 최적으로 매칭되었습니다.`,
    variables: { finalMaxMatching: '4 쌍 (완전 매칭)', status: '완료' },
    networkNodes: nodes.map((n) => ({ ...n, status: 'selected' })),
    networkEdges: edges.map((e) => ({ ...e })),
    bipartiteMatches: [...matchedPairs],
    soundType: 'complete',
  });

  return steps;
}
