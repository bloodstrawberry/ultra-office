import { Step } from '../types';

export const FLOYD_WARSHALL_CODE = `// 모든 정점 쌍 간의 최단 경로 거리 행렬을 구하는 플로이드-워셜
function floydWarshall(V: number, dist: number[][]): number[][] {
  const INF = 999;
  
  // 1. k: 거쳐가는 경유 정점 (가장 바깥쪽 루프)
  for (let k = 0; k < V; k++) {
    // 2. i: 출발 정점
    for (let i = 0; i < V; i++) {
      // 3. j: 도착 정점
      for (let j = 0; j < V; j++) {
        if (dist[i][k] + dist[k][j] < dist[i][j]) {
          dist[i][j] = dist[i][k] + dist[k][j];
        }
      }
    }
  }

  return dist;
}`;

export const DEFAULT_FLOYD_LABELS = ['A', 'B', 'C', 'D'];
export const DEFAULT_FLOYD_MATRIX: (number | string)[][] = [
  [0, 5, '∞', 8],
  [7, 0, 9, '∞'],
  [2, '∞', 0, 4],
  ['∞', '∞', 3, 0],
];

export function generateFloydWarshallSteps(
  labels: string[] = DEFAULT_FLOYD_LABELS,
  initialMatrix = DEFAULT_FLOYD_MATRIX
): Step[] {
  const steps: Step[] = [];
  const V = labels.length;
  const INF = 999;

  // Clone numeric matrix
  const dist: number[][] = initialMatrix.map((row, r) =>
    row.map((val, c) => (r === c ? 0 : val === '∞' ? INF : Number(val)))
  );

  function toDisplayMatrix(mat: number[][]): (number | string)[][] {
    return mat.map((row) => row.map((v) => (v >= INF ? '∞' : v)));
  }

  steps.push({
    stepIndex: 0,
    line: 2,
    description: `플로이드-워셜 시작: ${V}개 정점 간의 초기 인접 거리 행렬을 구성합니다. (INF: 직접 연결 간선 없음)`,
    variables: { V, INF: '∞', phase: '행렬 초기화' },
    matrix: toDisplayMatrix(dist),
    matrixLabels: labels,
    matrixK: null,
    matrixI: null,
    matrixJ: null,
    soundType: 'step',
  });

  for (let k = 0; k < V; k++) {
    const kLabel = labels[k];

    steps.push({
      stepIndex: steps.length,
      line: 6,
      description: `[경유 노드 k = ${kLabel}(${k}) 선택] 모든 출발점 i와 도착점 j에 대해 노드 ${kLabel}을 거쳐가는 경로를 탐색합니다.`,
      variables: { viaNode_k: kLabel, kIndex: k, phase: '경유 노드 설정' },
      matrix: toDisplayMatrix(dist),
      matrixLabels: labels,
      matrixK: k,
      matrixI: null,
      matrixJ: null,
      soundType: 'step',
    });

    for (let i = 0; i < V; i++) {
      for (let j = 0; j < V; j++) {
        if (i === j || i === k || j === k) continue;

        const directDist = dist[i][j];
        const detourDist = dist[i][k] + dist[k][j];
        const isBetter = detourDist < directDist;

        if (isBetter) {
          dist[i][j] = detourDist;
          steps.push({
            stepIndex: steps.length,
            line: 12,
            description: `거리 단축 발견! ${labels[i]}➔${labels[j]} 기존 거리(${directDist >= INF ? '∞' : directDist}) > ${labels[i]}➔${kLabel}➔${labels[j]} (${dist[i][k]} + ${dist[k][j]} = ${detourDist}). 행렬 값을 ${detourDist}로 갱신합니다.`,
            variables: {
              from_i: labels[i],
              via_k: kLabel,
              to_j: labels[j],
              oldDist: directDist >= INF ? '∞' : directDist,
              newDist: detourDist,
            },
            matrix: toDisplayMatrix(dist),
            matrixLabels: labels,
            matrixK: k,
            matrixI: i,
            matrixJ: j,
            matrixUpdating: true,
            soundType: 'swap',
            soundValue: detourDist * 10,
          });
        }
      }
    }
  }

  steps.push({
    stepIndex: steps.length,
    line: 19,
    description: `플로이드-워셜 완료! O(V³) 시간으로 모든 정점 쌍 간의 최단 경로 거리가 최종 확정되었습니다.`,
    variables: { status: '최단 경로 행렬 계산 완료' },
    matrix: toDisplayMatrix(dist),
    matrixLabels: labels,
    matrixK: null,
    matrixI: null,
    matrixJ: null,
    soundType: 'complete',
  });

  return steps;
}
