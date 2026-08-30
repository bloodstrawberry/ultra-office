import type { GridConfig } from './graph/gridUtils';
import type { AlgorithmId, AlgorithmCategory, AlgorithmDefinition } from './types';

import { BST_CODE, generateBSTSteps } from './tree/bst';
import { BFS_CODE, generateBFSSteps } from './graph/bfs';
import { DFS_CODE, generateDFSSteps } from './graph/dfs';
import { MST_CODE, generateMSTSteps } from './graph/mst';
import { ASTAR_CODE, generateAStarSteps } from './graph/astar';
import { MAX_FLOW_CODE, generateMaxFlowSteps } from './graph/maxFlow';
import { DIJKSTRA_CODE, generateDijkstraSteps } from './graph/dijkstra';
import { N_QUEENS_CODE, generateNQueensSteps } from './recursion/nQueens';
import { HEAP_SORT_CODE, generateHeapSortSteps } from './sorting/heapSort';
import { QUICK_SORT_CODE, generateQuickSortSteps } from './sorting/quickSort';
import { MERGE_SORT_CODE, generateMergeSortSteps } from './sorting/mergeSort';
import { STACK_QUEUE_CODE, generateStackQueueSteps } from './tree/stackQueue';
import { RECURSION_CODE, generateRecursionSteps } from './recursion/recursion';
import { TWO_POINTER_CODE, generateTwoPointerSteps } from './search/twoPointer';
import { BUBBLE_SORT_CODE, generateBubbleSortSteps } from './sorting/bubbleSort';
import { KADANE_CODE, generateKadaneSteps, DEFAULT_KADANE_ARRAY } from './dp/kadane';
import { LINEAR_SEARCH_CODE, generateLinearSearchSteps } from './search/linearSearch';
import { BINARY_SEARCH_CODE, generateBinarySearchSteps } from './search/binarySearch';
import { FLOYD_WARSHALL_CODE, generateFloydWarshallSteps } from './graph/floydWarshall';
import { SELECTION_SORT_CODE, generateSelectionSortSteps } from './sorting/selectionSort';
import { INSERTION_SORT_CODE, generateInsertionSortSteps } from './sorting/insertionSort';
import { BIPARTITE_MATCH_CODE, generateBipartiteMatchSteps } from './graph/bipartiteMatch';
import { PLANE_SWEEPING_CODE, generatePlaneSweepingSteps } from './geometry/planeSweeping';
import { LCS_CODE, generateLCSSteps, DEFAULT_LCS_TEXT1, DEFAULT_LCS_TEXT2 } from './dp/lcs';
import { TOPOLOGICAL_SORT_CODE, generateTopologicalSortSteps } from './graph/topologicalSort';
import { KMP_CODE, generateKMPSteps, DEFAULT_KMP_TEXT, DEFAULT_KMP_PATTERN } from './string/kmp';
import { RADIX_SORT_CODE, DEFAULT_RADIX_ARRAY, generateRadixSortSteps } from './sorting/radixSort';
import {
  COUNTING_SORT_CODE,
  DEFAULT_COUNTING_ARRAY,
  generateCountingSortSteps,
} from './sorting/countingSort';
import {
  PERMUTATION_COMBINATION_CODE,
  generatePermutationCombinationSteps,
} from './recursion/permutationCombination';
import {
  DEFAULT_WINDOW_K,
  SLIDING_WINDOW_CODE,
  DEFAULT_WINDOW_ARRAY,
  generateSlidingWindowSteps,
} from './search/slidingWindow';
import {
  DEFAULT_TREES,
  DEFAULT_TARGET_WOOD,
  PARAMETRIC_SEARCH_CODE,
  generateParametricSearchSteps,
} from './search/parametricSearch';
import {
  DEFAULT_KNAPSACK_ITEMS,
  DYNAMIC_PROGRAMMING_CODE,
  DEFAULT_KNAPSACK_CAPACITY,
  generateDynamicProgrammingSteps,
} from './dp/dynamicProgramming';

export const DEFAULT_SORT_ARRAY = [44, 18, 67, 23, 91, 5, 52, 38, 77, 12, 85, 30];
export const DEFAULT_SEARCH_ARRAY = [12, 23, 34, 45, 56, 67, 78, 89, 95, 108, 124, 150];
export const DEFAULT_BST_VALUES = [50, 30, 70, 20, 40, 60, 80, 35];

export const ALGORITHMS: Record<AlgorithmId, AlgorithmDefinition> = {
  // 1. Sorting (8종)
  bubbleSort: {
    id: 'bubbleSort',
    name: '버블 정렬',
    englishName: 'Bubble Sort',
    category: 'sorting',
    icon: '🫧',
    tag: '기초 정렬',
    tagColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    shortDescription: '인접한 두 원소를 비교하여 큰 값을 뒤로 계속 교환(Bubble-up)하며 정렬합니다.',
    keyFeatures: ['구현이 매우 단순', '안정 정렬 (Stable)', '이미 정렬된 경우 O(N) 최적화 가능'],
    complexity: {
      timeBest: 'O(N)',
      timeAverage: 'O(N²)',
      timeWorst: 'O(N²)',
      spaceWorst: 'O(1)',
      isStable: true,
      isInPlace: true,
    },
    code: BUBBLE_SORT_CODE,
    codeLanguage: 'typescript',
    defaultInput: DEFAULT_SORT_ARRAY,
    generateSteps: (input?: unknown) =>
      generateBubbleSortSteps(Array.isArray(input) ? (input as number[]) : DEFAULT_SORT_ARRAY),
  },

  selectionSort: {
    id: 'selectionSort',
    name: '선택 정렬',
    englishName: 'Selection Sort',
    category: 'sorting',
    icon: '🎯',
    tag: '기초 정렬',
    tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    shortDescription: '남은 구간에서 최솟값을 찾아 맨 앞의 원소와 위치를 교환하며 정렬합니다.',
    keyFeatures: ['최솟값 선택 방식', '교환 횟수 최소화 O(N)', '불안정 정렬 (Unstable)'],
    complexity: {
      timeBest: 'O(N²)',
      timeAverage: 'O(N²)',
      timeWorst: 'O(N²)',
      spaceWorst: 'O(1)',
      isStable: false,
      isInPlace: true,
    },
    code: SELECTION_SORT_CODE,
    codeLanguage: 'typescript',
    defaultInput: DEFAULT_SORT_ARRAY,
    generateSteps: (input?: unknown) =>
      generateSelectionSortSteps(Array.isArray(input) ? (input as number[]) : DEFAULT_SORT_ARRAY),
  },

  insertionSort: {
    id: 'insertionSort',
    name: '삽입 정렬',
    englishName: 'Insertion Sort',
    category: 'sorting',
    icon: '📥',
    tag: '기초 정렬',
    tagColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    shortDescription: '원소를 하나씩 이미 정렬된 앞쪽 부분에 알맞은 위치에 끼워 넣으며 정렬합니다.',
    keyFeatures: [
      '거의 정렬된 데이터에서 최강 효율 O(N)',
      '온라인 알고리즘(실시간 수신 데이터 적합)',
      '안정 정렬',
    ],
    complexity: {
      timeBest: 'O(N)',
      timeAverage: 'O(N²)',
      timeWorst: 'O(N²)',
      spaceWorst: 'O(1)',
      isStable: true,
      isInPlace: true,
    },
    code: INSERTION_SORT_CODE,
    codeLanguage: 'typescript',
    defaultInput: DEFAULT_SORT_ARRAY,
    generateSteps: (input?: unknown) =>
      generateInsertionSortSteps(Array.isArray(input) ? (input as number[]) : DEFAULT_SORT_ARRAY),
  },

  quickSort: {
    id: 'quickSort',
    name: '퀵 정렬',
    englishName: 'Quick Sort',
    category: 'sorting',
    icon: '⚡',
    tag: '고급 분할정복',
    tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    shortDescription:
      '피벗(Pivot)을 기준으로 작은 값과 큰 값을 분할(Partition)하여 재귀적으로 정렬합니다.',
    keyFeatures: [
      '실무 표준 및 압도적인 평균 속도',
      '추가 메모리 거의 불필요 (In-place)',
      '최악의 경우 피벗 불균형 주의',
    ],
    complexity: {
      timeBest: 'O(N log N)',
      timeAverage: 'O(N log N)',
      timeWorst: 'O(N²)',
      spaceWorst: 'O(log N)',
      isStable: false,
      isInPlace: true,
    },
    code: QUICK_SORT_CODE,
    codeLanguage: 'typescript',
    defaultInput: DEFAULT_SORT_ARRAY,
    generateSteps: (input?: unknown) =>
      generateQuickSortSteps(Array.isArray(input) ? (input as number[]) : DEFAULT_SORT_ARRAY),
  },

  mergeSort: {
    id: 'mergeSort',
    name: '병합 정렬',
    englishName: 'Merge Sort',
    category: 'sorting',
    icon: '🧩',
    tag: '고급 분할정복',
    tagColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    shortDescription:
      '배열을 절반씩 분할(Divide)한 뒤 정렬하면서 병합(Conquer)하는 알고리즘입니다.',
    keyFeatures: [
      '어떤 상황에서도 항상 O(N log N) 보장',
      '안정 정렬 (Stable)',
      '연결 리스트(Linked List) 정렬에 최적',
    ],
    complexity: {
      timeBest: 'O(N log N)',
      timeAverage: 'O(N log N)',
      timeWorst: 'O(N log N)',
      spaceWorst: 'O(N)',
      isStable: true,
      isInPlace: false,
    },
    code: MERGE_SORT_CODE,
    codeLanguage: 'typescript',
    defaultInput: DEFAULT_SORT_ARRAY,
    generateSteps: (input?: unknown) =>
      generateMergeSortSteps(Array.isArray(input) ? (input as number[]) : DEFAULT_SORT_ARRAY),
  },

  heapSort: {
    id: 'heapSort',
    name: '힙 정렬',
    englishName: 'Heap Sort',
    category: 'sorting',
    icon: '🏔️',
    tag: '트리 기반 정렬',
    tagColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    shortDescription: '최대 힙(Max Heap) 트리를 구축하고 루트 최댓값을 하나씩 추출하며 정렬합니다.',
    keyFeatures: ['최악에도 O(N log N) 보장', '추가 배열 공간 불필요 O(1)', '우선순위 큐 기반'],
    complexity: {
      timeBest: 'O(N log N)',
      timeAverage: 'O(N log N)',
      timeWorst: 'O(N log N)',
      spaceWorst: 'O(1)',
      isStable: false,
      isInPlace: true,
    },
    code: HEAP_SORT_CODE,
    codeLanguage: 'typescript',
    defaultInput: DEFAULT_SORT_ARRAY,
    generateSteps: (input?: unknown) =>
      generateHeapSortSteps(Array.isArray(input) ? (input as number[]) : DEFAULT_SORT_ARRAY),
  },

  countingSort: {
    id: 'countingSort',
    name: '계수 정렬',
    englishName: 'Counting Sort',
    category: 'sorting',
    icon: '🔢',
    tag: '선형 시간 정렬',
    tagColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    shortDescription:
      '원소 간의 비교 없이 각 숫자의 등장 횟수를 카운팅하여 O(N + K) 시간에 정렬합니다.',
    keyFeatures: [
      '비교 연산이 없는 O(N+K) 선형 정렬',
      '안정 정렬 (Stable)',
      '값의 범위 K가 작을 때 압도적 속도',
    ],
    complexity: {
      timeBest: 'O(N + K)',
      timeAverage: 'O(N + K)',
      timeWorst: 'O(N + K)',
      spaceWorst: 'O(N + K)',
      isStable: true,
      isInPlace: false,
    },
    code: COUNTING_SORT_CODE,
    codeLanguage: 'typescript',
    defaultInput: DEFAULT_COUNTING_ARRAY,
    generateSteps: (input?: unknown) =>
      generateCountingSortSteps(
        Array.isArray(input) ? (input as number[]) : DEFAULT_COUNTING_ARRAY
      ),
  },

  radixSort: {
    id: 'radixSort',
    name: '기수 정렬',
    englishName: 'Radix Sort',
    category: 'sorting',
    icon: '🗂️',
    tag: '자릿수 분배 정렬',
    tagColor: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
    shortDescription:
      '낮은 자릿수(1의 자리)부터 높은 자릿수까지 0~9 버킷 큐에 순차 분배하며 정렬합니다.',
    keyFeatures: ['비교 연산 없음', '자릿수 d에 비례한 O(d·(N+K)) 속도', '안정 정렬 (Stable)'],
    complexity: {
      timeBest: 'O(d·(N + K))',
      timeAverage: 'O(d·(N + K))',
      timeWorst: 'O(d·(N + K))',
      spaceWorst: 'O(N + K)',
      isStable: true,
      isInPlace: false,
    },
    code: RADIX_SORT_CODE,
    codeLanguage: 'typescript',
    defaultInput: DEFAULT_RADIX_ARRAY,
    generateSteps: (input?: unknown) =>
      generateRadixSortSteps(Array.isArray(input) ? (input as number[]) : DEFAULT_RADIX_ARRAY),
  },

  // 2. Search (5종)
  linearSearch: {
    id: 'linearSearch',
    name: '선형 탐색',
    englishName: 'Linear Search',
    category: 'search',
    icon: '🔍',
    tag: '기초 탐색',
    tagColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    shortDescription: '배열의 처음부터 끝까지 순차적으로 원소를 하나씩 비교하며 타겟을 찾습니다.',
    keyFeatures: [
      '정렬되지 않은 데이터에서도 동작',
      '가장 직관적인 순차 탐색',
      '데이터가 커지면 비효율적',
    ],
    complexity: {
      timeBest: 'O(1)',
      timeAverage: 'O(N)',
      timeWorst: 'O(N)',
      spaceWorst: 'O(1)',
    },
    code: LINEAR_SEARCH_CODE,
    codeLanguage: 'typescript',
    defaultInput: { array: DEFAULT_SORT_ARRAY, target: 52 },
    generateSteps: (input?: unknown) => {
      if (input && typeof input === 'object' && 'array' in input) {
        const inp = input as { array: number[]; target: number };
        return generateLinearSearchSteps(inp.array, inp.target);
      }
      return generateLinearSearchSteps(DEFAULT_SORT_ARRAY, 52);
    },
  },

  binarySearch: {
    id: 'binarySearch',
    name: '이진 탐색',
    englishName: 'Binary Search',
    category: 'search',
    icon: '⚖️',
    tag: '로그 탐색',
    tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    shortDescription:
      '정렬된 배열에서 중간값(mid)을 비교하여 매 단계마다 탐색 범위를 절반씩 줄입니다.',
    keyFeatures: [
      '반드시 정렬된 배열 필요',
      '로그 시간 O(log N)의 초고속 탐색',
      '코딩 테스트 필수 알고리즘',
    ],
    complexity: {
      timeBest: 'O(1)',
      timeAverage: 'O(log N)',
      timeWorst: 'O(log N)',
      spaceWorst: 'O(1)',
    },
    code: BINARY_SEARCH_CODE,
    codeLanguage: 'typescript',
    defaultInput: { array: DEFAULT_SEARCH_ARRAY, target: 78 },
    generateSteps: (input?: unknown) => {
      if (input && typeof input === 'object' && 'array' in input) {
        const inp = input as { array: number[]; target: number };
        return generateBinarySearchSteps(inp.array, inp.target);
      }
      return generateBinarySearchSteps(DEFAULT_SEARCH_ARRAY, 78);
    },
  },

  twoPointer: {
    id: 'twoPointer',
    name: '투 포인터 합 탐색',
    englishName: 'Two Pointers (Target Sum)',
    category: 'search',
    icon: '👉👈',
    tag: '포인터 기법',
    tagColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    shortDescription:
      '정렬된 배열의 양 끝(Left, Right)에서 포인터를 이동하며 목표 합(Target Sum)을 찾습니다.',
    keyFeatures: [
      'O(N²) 2중 루프를 O(N)으로 대폭 단축',
      '정렬된 배열 조건 활용',
      '슬라이딩 윈도우와 함께 코테 빈출',
    ],
    complexity: {
      timeBest: 'O(1)',
      timeAverage: 'O(N)',
      timeWorst: 'O(N)',
      spaceWorst: 'O(1)',
    },
    code: TWO_POINTER_CODE,
    codeLanguage: 'typescript',
    defaultInput: { array: DEFAULT_SEARCH_ARRAY, targetSum: 101 },
    generateSteps: (input?: unknown) => {
      if (input && typeof input === 'object' && 'array' in input) {
        const inp = input as { array: number[]; targetSum: number };
        return generateTwoPointerSteps(inp.array, inp.targetSum);
      }
      return generateTwoPointerSteps(DEFAULT_SEARCH_ARRAY, 101);
    },
  },

  parametricSearch: {
    id: 'parametricSearch',
    name: '매개변수 탐색',
    englishName: 'Parametric Search',
    category: 'search',
    icon: '🎯',
    tag: '결정 문제 이진 탐색',
    tagColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    shortDescription:
      '최적화 문제를 결정 문제(True/False)로 바꾸어 이진 탐색으로 최적의 기준값을 찾습니다.',
    keyFeatures: [
      '나무 자르기/공유기 설치 등 최적화 문제 해결',
      '단조 증가/감소 조건 활용',
      'O(log(Range) × Check)',
    ],
    complexity: {
      timeBest: 'O(log(Max) × N)',
      timeAverage: 'O(log(Max) × N)',
      timeWorst: 'O(log(Max) × N)',
      spaceWorst: 'O(1)',
    },
    code: PARAMETRIC_SEARCH_CODE,
    codeLanguage: 'typescript',
    defaultInput: { trees: DEFAULT_TREES, targetWood: DEFAULT_TARGET_WOOD },
    generateSteps: (input?: unknown) => {
      if (input && typeof input === 'object' && 'trees' in input) {
        const inp = input as { trees: number[]; targetWood: number };
        return generateParametricSearchSteps(inp.trees, inp.targetWood);
      }
      return generateParametricSearchSteps(DEFAULT_TREES, DEFAULT_TARGET_WOOD);
    },
  },

  slidingWindow: {
    id: 'slidingWindow',
    name: '슬라이딩 윈도우',
    englishName: 'Sliding Window',
    category: 'search',
    icon: '🪟',
    tag: '구간 윈도우 탐색',
    tagColor: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40',
    shortDescription:
      '고정된 크기의 창문(Window)을 오른쪽으로 밀며 중복 계산 없이 O(N)에 최댓값을 찾습니다.',
    keyFeatures: [
      'O(N·K) 연속합 계산을 O(N)으로 최적화',
      '네트워크 패킷 윈도우 및 시계열 데이터 분석',
      '슬라이딩 덱 응용',
    ],
    complexity: {
      timeBest: 'O(N)',
      timeAverage: 'O(N)',
      timeWorst: 'O(N)',
      spaceWorst: 'O(1)',
    },
    code: SLIDING_WINDOW_CODE,
    codeLanguage: 'typescript',
    defaultInput: { array: DEFAULT_WINDOW_ARRAY, k: DEFAULT_WINDOW_K },
    generateSteps: (input?: unknown) => {
      if (input && typeof input === 'object' && 'array' in input) {
        const inp = input as { array: number[]; k: number };
        return generateSlidingWindowSteps(inp.array, inp.k);
      }
      return generateSlidingWindowSteps(DEFAULT_WINDOW_ARRAY, DEFAULT_WINDOW_K);
    },
  },

  // 3. Tree & Linear Data Structures (2종)
  bst: {
    id: 'bst',
    name: '이진 탐색 트리',
    englishName: 'Binary Search Tree (BST)',
    category: 'tree',
    icon: '🌳',
    tag: '계층 구조',
    tagColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    shortDescription:
      '왼쪽 자식은 작고 오른쪽 자식은 큰 규칙을 지키며 삽입/탐색/중위 순회를 수행합니다.',
    keyFeatures: [
      '중위 순회(Inorder) 시 오름차순 정렬',
      '평균 O(log N) 탐색',
      '동적 삽입과 삭제 용이',
    ],
    complexity: {
      timeBest: 'O(log N)',
      timeAverage: 'O(log N)',
      timeWorst: 'O(N)',
      spaceWorst: 'O(N)',
    },
    code: BST_CODE,
    codeLanguage: 'typescript',
    defaultInput: DEFAULT_BST_VALUES,
    generateSteps: (input?: unknown) =>
      generateBSTSteps(Array.isArray(input) ? (input as number[]) : DEFAULT_BST_VALUES),
  },

  stackQueue: {
    id: 'stackQueue',
    name: '스택 & 큐',
    englishName: 'Stack & Queue Operations',
    category: 'tree',
    icon: '🥞',
    tag: '핵심 자료구조',
    tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    shortDescription:
      '후입선출(LIFO) 스택과 선입선출(FIFO) 큐의 원소 Push/Pop/Enqueue/Dequeue 연산 시뮬레이션입니다.',
    keyFeatures: [
      '스택: 함수 호출 스택, 뒤로가기, 괄호 검사',
      '큐: 프로세스 스케줄링, BFS 탐색',
      '모든 연산 O(1)',
    ],
    complexity: {
      timeBest: 'O(1)',
      timeAverage: 'O(1)',
      timeWorst: 'O(1)',
      spaceWorst: 'O(N)',
    },
    code: STACK_QUEUE_CODE,
    codeLanguage: 'typescript',
    defaultInput: null,
    generateSteps: () => generateStackQueueSteps(),
  },

  // 4. Graph & Grid (4종)
  dijkstra: {
    id: 'dijkstra',
    name: '다익스트라 최단 경로',
    englishName: 'Dijkstra Algorithm',
    category: 'graph',
    icon: '🗺️',
    tag: '최단 경로',
    tagColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    shortDescription:
      '시작점부터 모든 노드까지의 최단 거리를 가중치 기반 우선순위 큐로 탐색합니다.',
    keyFeatures: [
      '비음수 가중치 최단 경로 보장',
      '네비게이션 및 네트워크 라우팅의 핵심',
      '확산형 탐색',
    ],
    complexity: {
      timeBest: 'O((V + E) log V)',
      timeAverage: 'O((V + E) log V)',
      timeWorst: 'O(V²)',
      spaceWorst: 'O(V)',
    },
    code: DIJKSTRA_CODE,
    codeLanguage: 'typescript',
    defaultInput: {},
    generateSteps: (input?: unknown) => generateDijkstraSteps((input as Partial<GridConfig>) || {}),
  },

  astar: {
    id: 'astar',
    name: 'A* (A-Star) 길찾기',
    englishName: 'A* Search Algorithm',
    category: 'graph',
    icon: '🧭',
    tag: '휴리스틱 최단 경로',
    tagColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    shortDescription:
      '실제 이동 비용 g(n)과 목적지까지의 예상 휴리스틱 h(n)을 결합해 목표 방향으로 최단 경로를 빠르게 찾습니다.',
    keyFeatures: [
      '게임 AI 및 자율주행 길찾기 표준',
      '다익스트라 대비 탐색 노드 수 대폭 감소',
      '최적성(Admissibility) 보장',
    ],
    complexity: {
      timeBest: 'O(d)',
      timeAverage: 'O(b^d)',
      timeWorst: 'O(V²)',
      spaceWorst: 'O(V)',
    },
    code: ASTAR_CODE,
    codeLanguage: 'typescript',
    defaultInput: {},
    generateSteps: (input?: unknown) => generateAStarSteps((input as Partial<GridConfig>) || {}),
  },

  bfs: {
    id: 'bfs',
    name: '너비 우선 탐색 (BFS)',
    englishName: 'Breadth-First Search',
    category: 'graph',
    icon: '🌊',
    tag: '그래프 탐색',
    tagColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    shortDescription:
      '큐(Queue)를 활용하여 시작 노드에서 가까운 노드부터 레벨 순서대로 물결치듯 탐색합니다.',
    keyFeatures: [
      '가중치 없는 그래프 최단 경로 보장',
      '큐(FIFO) 자료구조 활용',
      '소셜 네트워크 친구 추천 / 바이러스 전파',
    ],
    complexity: {
      timeBest: 'O(V + E)',
      timeAverage: 'O(V + E)',
      timeWorst: 'O(V + E)',
      spaceWorst: 'O(V)',
    },
    code: BFS_CODE,
    codeLanguage: 'typescript',
    defaultInput: {},
    generateSteps: (input?: unknown) => generateBFSSteps((input as Partial<GridConfig>) || {}),
  },

  dfs: {
    id: 'dfs',
    name: '깊이 우선 탐색 (DFS)',
    englishName: 'Depth-First Search',
    category: 'graph',
    icon: '⛏️',
    tag: '그래프 탐색',
    tagColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    shortDescription:
      '스택(Stack) 또는 재귀를 활용하여 한 경로가 끝날 때까지 깊게 파고든 뒤 백트래킹합니다.',
    keyFeatures: [
      '미로 탈출 및 사이클 검출에 용이',
      '스택 또는 재귀 함수 활용',
      '모든 경우의 수 완전 탐색 (Backtracking)',
    ],
    complexity: {
      timeBest: 'O(V + E)',
      timeAverage: 'O(V + E)',
      timeWorst: 'O(V + E)',
      spaceWorst: 'O(V)',
    },
    code: DFS_CODE,
    codeLanguage: 'typescript',
    defaultInput: {},
    generateSteps: (input?: unknown) => generateDFSSteps((input as Partial<GridConfig>) || {}),
  },

  // 5. Advanced Graph & Network (5종)
  floydWarshall: {
    id: 'floydWarshall',
    name: '플로이드-워셜',
    englishName: 'Floyd-Warshall Algorithm',
    category: 'advancedGraph',
    icon: '🌐',
    tag: '전쌍 최단 경로',
    tagColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    shortDescription:
      '3중 반복문(k, i, j)을 통해 모든 정점 쌍 간의 최단 거리를 O(V³) 시간에 구합니다.',
    keyFeatures: [
      '모든 노드 쌍 최단 경로 한 번에 계산',
      '음수 가중치 간선 허용',
      'V×V 최단 거리 행렬 도출',
    ],
    complexity: {
      timeBest: 'O(V³)',
      timeAverage: 'O(V³)',
      timeWorst: 'O(V³)',
      spaceWorst: 'O(V²)',
    },
    code: FLOYD_WARSHALL_CODE,
    codeLanguage: 'typescript',
    defaultInput: {},
    generateSteps: () => generateFloydWarshallSteps(),
  },

  topologicalSort: {
    id: 'topologicalSort',
    name: '위상 정렬',
    englishName: "Topological Sort (Kahn's)",
    category: 'advancedGraph',
    icon: '📋',
    tag: 'DAG 순서화',
    tagColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    shortDescription:
      '방향 비순환 그래프(DAG)에서 선수 과목 순서를 진입 차수(In-degree) 큐를 이용해 정렬합니다.',
    keyFeatures: [
      '작업 의존성(Dependency) 해결',
      '빌드 시스템 컴파일 순서 결정',
      '사이클 존재 시 정렬 불가 판별',
    ],
    complexity: {
      timeBest: 'O(V + E)',
      timeAverage: 'O(V + E)',
      timeWorst: 'O(V + E)',
      spaceWorst: 'O(V)',
    },
    code: TOPOLOGICAL_SORT_CODE,
    codeLanguage: 'typescript',
    defaultInput: {},
    generateSteps: () => generateTopologicalSortSteps(),
  },

  mst: {
    id: 'mst',
    name: '최소 신장 트리 (MST)',
    englishName: "Kruskal's MST",
    category: 'advancedGraph',
    icon: '🌲',
    tag: '최소 비용 네트워크',
    tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    shortDescription:
      '간선들을 가중치 오름차순으로 정렬한 뒤 유니온-파인드로 사이클 없이 N-1개 간선을 선택합니다.',
    keyFeatures: [
      '그리디(Greedy) 기법의 정수',
      '유니온-파인드 사이클 검출',
      '통신망/도로망 최소 비용 가설',
    ],
    complexity: {
      timeBest: 'O(E log E)',
      timeAverage: 'O(E log E)',
      timeWorst: 'O(E log E)',
      spaceWorst: 'O(V + E)',
    },
    code: MST_CODE,
    codeLanguage: 'typescript',
    defaultInput: {},
    generateSteps: () => generateMSTSteps(),
  },

  bipartiteMatch: {
    id: 'bipartiteMatch',
    name: '이분 매칭',
    englishName: 'Bipartite Matching',
    category: 'advancedGraph',
    icon: '🔗',
    tag: '네트워크 1:1 매칭',
    tagColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    shortDescription:
      '두 개의 독립된 그룹 A와 B 간에 간선이 겹치지 않는 최대 1:1 매칭 쌍을 DFS로 탐색합니다.',
    keyFeatures: [
      '구직자-회사 / 학생-기숙사 최적 배정',
      '증가 경로(Augmenting Path) 탐색',
      '네트워크 유량의 특수 케이스',
    ],
    complexity: {
      timeBest: 'O(V · E)',
      timeAverage: 'O(V · E)',
      timeWorst: 'O(V · E)',
      spaceWorst: 'O(V)',
    },
    code: BIPARTITE_MATCH_CODE,
    codeLanguage: 'typescript',
    defaultInput: {},
    generateSteps: () => generateBipartiteMatchSteps(),
  },

  maxFlow: {
    id: 'maxFlow',
    name: '에드몬드-카프 최대 유량',
    englishName: 'Edmonds-Karp Max Flow',
    category: 'advancedGraph',
    icon: '🚰',
    tag: '네트워크 유량',
    tagColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    shortDescription:
      'BFS를 사용하여 잔여 용량이 있는 증가 경로를 찾아 수원지(S)에서 수요지(T)로의 최대 유량을 계산합니다.',
    keyFeatures: [
      '최대 유량 최소 컷 정리(Max-Flow Min-Cut)',
      '역방향 간선 유량 상쇄 메커니즘',
      '물류/교통 흐름 최적화',
    ],
    complexity: {
      timeBest: 'O(V · E²)',
      timeAverage: 'O(V · E²)',
      timeWorst: 'O(V · E²)',
      spaceWorst: 'O(V + E)',
    },
    code: MAX_FLOW_CODE,
    codeLanguage: 'typescript',
    defaultInput: {},
    generateSteps: () => generateMaxFlowSteps(),
  },

  // 6. Dynamic Programming (3종)
  knapsack: {
    id: 'knapsack',
    name: '0-1 배낭 문제 (Knapsack)',
    englishName: '0-1 Knapsack DP',
    category: 'dp',
    icon: '🎒',
    tag: '2D DP 최적화',
    tagColor: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
    shortDescription:
      '제한된 배낭 용량 내에서 담을 수 있는 물건들의 최대 가치 조합을 2D DP 테이블로 구합니다.',
    keyFeatures: [
      '하위 문제의 최적 부분 구조(Optimal Substructure)',
      '중복 하위 문제 메모이제이션',
      '자원 할당 최적화의 기본',
    ],
    complexity: {
      timeBest: 'O(N · W)',
      timeAverage: 'O(N · W)',
      timeWorst: 'O(N · W)',
      spaceWorst: 'O(N · W)',
    },
    code: DYNAMIC_PROGRAMMING_CODE,
    codeLanguage: 'typescript',
    defaultInput: { items: DEFAULT_KNAPSACK_ITEMS, capacity: DEFAULT_KNAPSACK_CAPACITY },
    generateSteps: (input?: unknown) => {
      if (input && typeof input === 'object' && 'items' in input) {
        const inp = input as { items: typeof DEFAULT_KNAPSACK_ITEMS; capacity: number };
        return generateDynamicProgrammingSteps(inp.items, inp.capacity);
      }
      return generateDynamicProgrammingSteps(DEFAULT_KNAPSACK_ITEMS, DEFAULT_KNAPSACK_CAPACITY);
    },
  },

  lcs: {
    id: 'lcs',
    name: '최장 공통 부분 수열 (LCS)',
    englishName: 'Longest Common Subsequence',
    category: 'dp',
    icon: '🧬',
    tag: '문자열 2D DP',
    tagColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    shortDescription:
      '두 문자열에서 순서를 유지하며 공통으로 나타나는 가장 긴 부분 수열을 2D DP로 구합니다.',
    keyFeatures: [
      'Git Diff 및 파일 변경점 비교의 핵심 원리',
      'DNA 염기서열 유사도 분석',
      'O(M·N) 시간 및 공간 복잡도',
    ],
    complexity: {
      timeBest: 'O(M · N)',
      timeAverage: 'O(M · N)',
      timeWorst: 'O(M · N)',
      spaceWorst: 'O(M · N)',
    },
    code: LCS_CODE,
    codeLanguage: 'typescript',
    defaultInput: { text1: DEFAULT_LCS_TEXT1, text2: DEFAULT_LCS_TEXT2 },
    generateSteps: (input?: unknown) => {
      if (input && typeof input === 'object' && 'text1' in input) {
        const inp = input as { text1: string; text2: string };
        return generateLCSSteps(inp.text1, inp.text2);
      }
      return generateLCSSteps(DEFAULT_LCS_TEXT1, DEFAULT_LCS_TEXT2);
    },
  },

  kadane: {
    id: 'kadane',
    name: '카데인 최대 부분 배열 합',
    englishName: "Kadane's Algorithm",
    category: 'dp',
    icon: '📈',
    tag: '1D 연속합 DP',
    tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    shortDescription:
      '음수가 포함된 배열에서 연속된 부분 배열의 최대 합을 O(N) 단 한 번의 순회로 계산합니다.',
    keyFeatures: [
      'O(N²) 완탐을 O(N)으로 압축',
      '주식 최대 수익률 구간 분석',
      '공간 복잡도 O(1) 최적화 가능',
    ],
    complexity: {
      timeBest: 'O(N)',
      timeAverage: 'O(N)',
      timeWorst: 'O(N)',
      spaceWorst: 'O(1)',
    },
    code: KADANE_CODE,
    codeLanguage: 'typescript',
    defaultInput: DEFAULT_KADANE_ARRAY,
    generateSteps: (input?: unknown) =>
      generateKadaneSteps(Array.isArray(input) ? (input as number[]) : DEFAULT_KADANE_ARRAY),
  },

  // 7. Recursion & Backtracking (3종)
  recursion: {
    id: 'recursion',
    name: '재귀 & 호출 스택',
    englishName: 'Recursion & Call Stack',
    category: 'recursion',
    icon: '🥞',
    tag: '함수 호출 스택',
    tagColor: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
    shortDescription:
      '자기 자신을 호출하는 재귀 함수의 실행 컨텍스트와 호출 스택(Call Stack) 프레임을 추적합니다.',
    keyFeatures: [
      '기저 조건(Base Case)의 중요성',
      '스택 오버플로우(Stack Overflow) 원리 이해',
      '분할 정복의 기초',
    ],
    complexity: {
      timeBest: 'O(N)',
      timeAverage: 'O(N)',
      timeWorst: 'O(N)',
      spaceWorst: 'O(N)',
    },
    code: RECURSION_CODE,
    codeLanguage: 'typescript',
    defaultInput: 4,
    generateSteps: (input?: unknown) =>
      generateRecursionSteps(typeof input === 'number' ? input : 4),
  },

  permutationCombination: {
    id: 'permutationCombination',
    name: '순열 & 조합 백트래킹',
    englishName: 'Permutations & Combinations',
    category: 'recursion',
    icon: '🎲',
    tag: '경우의 수 탐색',
    tagColor: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40',
    shortDescription:
      '원소 집합에서 nPr 순열과 nCr 조합의 모든 경우의 수를 상태 공간 트리 백트래킹으로 생성합니다.',
    keyFeatures: [
      '상태 복원(Backtracking)의 핵심 패턴',
      '가지치기(Pruning)를 통한 불필요 탐색 제거',
      '완전 탐색 필수 기법',
    ],
    complexity: {
      timeBest: 'O(N!)',
      timeAverage: 'O(N!)',
      timeWorst: 'O(N!)',
      spaceWorst: 'O(N)',
    },
    code: PERMUTATION_COMBINATION_CODE,
    codeLanguage: 'typescript',
    defaultInput: { items: [1, 2, 3], r: 2 },
    generateSteps: (input?: unknown) => {
      if (input && typeof input === 'object' && 'items' in input) {
        const inp = input as { items: number[]; r: number };
        return generatePermutationCombinationSteps(inp.items, inp.r);
      }
      return generatePermutationCombinationSteps([1, 2, 3], 2);
    },
  },

  nQueens: {
    id: 'nQueens',
    name: 'N-Queen 문제',
    englishName: 'N-Queens Backtracking',
    category: 'recursion',
    icon: '👑',
    tag: '체스판 백트래킹',
    tagColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    shortDescription:
      'N×N 체스판 위에 N개의 퀸을 서로 공격하지 못하도록 배치하는 고전 백트래킹 문제를 시각화합니다.',
    keyFeatures: [
      '행, 열, 대각선 충돌 검사',
      '불가능한 경로의 조기 가지치기',
      '상태 공간 트리 시각화',
    ],
    complexity: {
      timeBest: 'O(N!)',
      timeAverage: 'O(N!)',
      timeWorst: 'O(N!)',
      spaceWorst: 'O(N)',
    },
    code: N_QUEENS_CODE,
    codeLanguage: 'typescript',
    defaultInput: 4,
    generateSteps: (input?: unknown) => generateNQueensSteps(typeof input === 'number' ? input : 4),
  },

  // 8. Geometry (1종)
  planeSweeping: {
    id: 'planeSweeping',
    name: '평면 스위핑 (직사각형 합집합 면적)',
    englishName: 'Plane Sweeping Algorithm',
    category: 'geometry',
    icon: '📐',
    tag: '계산 기하학',
    tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    shortDescription:
      '가상의 수직선(Sweep Line)을 왼쪽에서 오른쪽으로 이동하며 여러 직사각형의 합집합 넓이를 계산합니다.',
    keyFeatures: [
      '이벤트 정렬 및 구간 병합(Interval Merging)',
      '지리 정보 시스템(GIS) 면적 연산',
      'O(N log N) 고속 기하 처리',
    ],
    complexity: {
      timeBest: 'O(N log N)',
      timeAverage: 'O(N log N)',
      timeWorst: 'O(N log N)',
      spaceWorst: 'O(N)',
    },
    code: PLANE_SWEEPING_CODE,
    codeLanguage: 'typescript',
    defaultInput: {},
    generateSteps: () => generatePlaneSweepingSteps(),
  },

  // 9. String (1종)
  kmp: {
    id: 'kmp',
    name: 'KMP 문자열 패턴 매칭',
    englishName: 'Knuth-Morris-Pratt (KMP)',
    category: 'string',
    icon: '🔍',
    tag: '접두사 실패 함수',
    tagColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    shortDescription:
      '패턴의 접두사-접미사 일치 테이블(π 배열)을 전처리하여 불필요한 비교 없이 O(N + M)에 문자열을 검색합니다.',
    keyFeatures: [
      '본문 포인터를 절대 뒤로 돌리지 않음',
      '실패 함수(Failure Function) 활용',
      '대용량 텍스트 검색 엔진 표준',
    ],
    complexity: {
      timeBest: 'O(N + M)',
      timeAverage: 'O(N + M)',
      timeWorst: 'O(N + M)',
      spaceWorst: 'O(M)',
    },
    code: KMP_CODE,
    codeLanguage: 'typescript',
    defaultInput: { text: DEFAULT_KMP_TEXT, pattern: DEFAULT_KMP_PATTERN },
    generateSteps: (input?: unknown) => {
      if (input && typeof input === 'object' && 'text' in input) {
        const inp = input as { text: string; pattern: string };
        return generateKMPSteps(inp.text, inp.pattern);
      }
      return generateKMPSteps(DEFAULT_KMP_TEXT, DEFAULT_KMP_PATTERN);
    },
  },
};

export const CATEGORIES: { id: AlgorithmCategory; label: string; icon: string; count: number }[] = [
  { id: 'sorting', label: '정렬 (Sorting)', icon: '📊', count: 8 },
  { id: 'search', label: '탐색 (Search)', icon: '🔍', count: 5 },
  { id: 'tree', label: '트리 & 기본 자료구조', icon: '🌲', count: 2 },
  { id: 'graph', label: '그래프 & 길찾기', icon: '🗺️', count: 4 },
  { id: 'advancedGraph', label: '고급 네트워크 & 그래프', icon: '🕸️', count: 5 },
  { id: 'dp', label: '동적 계획법 (DP)', icon: '📈', count: 3 },
  { id: 'recursion', label: '재귀 & 백트래킹', icon: '🎲', count: 3 },
  { id: 'geometry', label: '기하 & 스위핑', icon: '📐', count: 1 },
  { id: 'string', label: '문자열 알고리즘', icon: '🔤', count: 1 },
];

export function getAlgorithmsByCategory(category: AlgorithmCategory): AlgorithmDefinition[] {
  return Object.values(ALGORITHMS).filter((algo) => algo.category === category);
}

export function getAlgorithmById(id: string): AlgorithmDefinition | undefined {
  return ALGORITHMS[id as AlgorithmId];
}
