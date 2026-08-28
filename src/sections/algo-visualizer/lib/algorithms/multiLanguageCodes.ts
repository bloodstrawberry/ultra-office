import { AlgorithmId, MultiLanguageCode, ProblemRecommendation } from './types';

export const MULTI_LANG_CODES: Partial<Record<AlgorithmId, MultiLanguageCode>> = {
  quickSort: {
    typescript: `// TypeScript 퀵 정렬 (Quick Sort)
function quickSort(arr: number[], low = 0, high = arr.length - 1): void {
  if (low < high) {
    const pivotIdx = partition(arr, low, high);
    quickSort(arr, low, pivotIdx - 1);
    quickSort(arr, pivotIdx + 1, high);
  }
}

function partition(arr: number[], low: number, high: number): number {
  const pivot = arr[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}`,
    python: `# Python 퀵 정렬 (Quick Sort) - Lomuto 분할
def quick_sort(arr, low=0, high=None):
    if high is None:
        high = len(arr) - 1
    if low < high:
        p_idx = partition(arr, low, high)
        quick_sort(arr, low, p_idx - 1)
        quick_sort(arr, p_idx + 1, high)

def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] < pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1`,
    cpp: `// C++ 퀵 정렬 (Quick Sort)
#include <vector>
#include <algorithm>

int partition(std::vector<int>& arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; ++j) {
        if (arr[j] < pivot) {
            ++i;
            std::swap(arr[i], arr[j]);
        }
    }
    std::swap(arr[i + 1], arr[high]);
    return i + 1;
}

void quickSort(std::vector<int>& arr, int low, int high) {
    if (low < high) {
        int pIdx = partition(arr, low, high);
        quickSort(arr, low, pIdx - 1);
        quickSort(arr, pIdx + 1, high);
    }
}`,
    java: `// Java 퀵 정렬 (Quick Sort)
public class QuickSort {
    public static void quickSort(int[] arr, int low, int high) {
        if (low < high) {
            int pIdx = partition(arr, low, high);
            quickSort(arr, low, pIdx - 1);
            quickSort(arr, pIdx + 1, high);
        }
    }

    private static int partition(int[] arr, int low, int high) {
        int pivot = arr[high];
        int i = low - 1;
        for (int j = low; j < high; j++) {
            if (arr[j] < pivot) {
                i++;
                int temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
            }
        }
        int temp = arr[i + 1];
        arr[i + 1] = arr[high];
        arr[high] = temp;
        return i + 1;
    }
}`,
  },

  binarySearch: {
    typescript: `// TypeScript 이진 탐색 (Binary Search)
function binarySearch(arr: number[], target: number): number {
  let low = 0;
  let high = arr.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}`,
    python: `# Python 이진 탐색 (Binary Search)
# 또는 bisect 라이브러리 활용: from bisect import bisect_left
def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`,
    cpp: `// C++ 이진 탐색 (Binary Search)
// 또는 STL 활용: std::lower_bound, std::binary_search
#include <vector>

int binarySearch(const std::vector<int>& arr, int target) {
    int low = 0, high = arr.size() - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
    java: `// Java 이진 탐색 (Binary Search)
// 또는 java.util.Arrays.binarySearch(arr, target)
public class BinarySearch {
    public static int binarySearch(int[] arr, int target) {
        int low = 0, high = arr.length - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (arr[mid] == target) return mid;
            if (arr[mid] < target) low = mid + 1;
            else high = mid - 1;
        }
        return -1;
    }
}`,
  },

  dijkstra: {
    typescript: `// TypeScript 다익스트라 최단 경로 (Dijkstra)
interface Edge { to: number; cost: number; }

function dijkstra(n: number, graph: Edge[][], start: number): number[] {
  const dist = new Array(n).fill(Infinity);
  dist[start] = 0;
  // 우선순위 큐(PQ) 또는 최소 거리 배열 순회
  const visited = new Array(n).fill(false);

  for (let i = 0; i < n; i++) {
    let u = -1;
    for (let v = 0; v < n; v++) {
      if (!visited[v] && (u === -1 || dist[v] < dist[u])) u = v;
    }
    if (dist[u] === Infinity) break;
    visited[u] = true;

    for (const edge of graph[u]) {
      if (dist[u] + edge.cost < dist[edge.to]) {
        dist[edge.to] = dist[u] + edge.cost;
      }
    }
  }
  return dist;
}`,
    python: `# Python 다익스트라 (우선순위 큐 heapq 활용 O((V+E)logV))
import heapq

def dijkstra(n, graph, start):
    dist = [float('inf')] * n
    dist[start] = 0
    pq = [(0, start)]  # (cost, node)

    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue

        for v, cost in graph[u]:
            next_dist = d + cost
            if next_dist < dist[v]:
                dist[v] = next_dist
                heapq.heappush(pq, (next_dist, v))

    return dist`,
    cpp: `// C++ 다익스트라 (std::priority_queue 활용)
#include <vector>
#include <queue>

std::vector<int> dijkstra(int n, const std::vector<std::vector<std::pair<int, int>>>& graph, int start) {
    const int INF = 1e9;
    std::vector<int> dist(n, INF);
    std::priority_queue<std::pair<int, int>, std::vector<std::pair<int, int>>, std::greater<>> pq;

    dist[start] = 0;
    pq.push({0, start});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();
        if (d > dist[u]) continue;

        for (auto& [v, cost] : graph[u]) {
            if (dist[u] + cost < dist[v]) {
                dist[v] = dist[u] + cost;
                pq.push({dist[v], v});
            }
        }
    }
    return dist;
}`,
    java: `// Java 다익스트라 (PriorityQueue 활용)
import java.util.*;

public class Dijkstra {
    record Edge(int to, int cost) {}
    record Node(int id, int dist) implements Comparable<Node> {
        public int compareTo(Node o) { return Integer.compare(this.dist, o.dist); }
    }

    public static int[] dijkstra(int n, List<List<Edge>> graph, int start) {
        int[] dist = new int[n];
        Arrays.fill(dist, Integer.MAX_VALUE);
        PriorityQueue<Node> pq = new PriorityQueue<>();

        dist[start] = 0;
        pq.offer(new Node(start, 0));

        while (!pq.isEmpty()) {
            Node curr = pq.poll();
            if (curr.dist > dist[curr.id]) continue;

            for (Edge e : graph.get(curr.id)) {
                if (dist[curr.id] + e.cost < dist[e.to]) {
                    dist[e.to] = dist[curr.id] + e.cost;
                    pq.offer(new Node(e.to, dist[e.to]));
                }
            }
        }
        return dist;
    }
}`,
  },

  knapsack: {
    typescript: `// TypeScript 0-1 Knapsack DP
function knapsack(weights: number[], values: number[], maxCapacity: number): number {
  const n = weights.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(maxCapacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const w = weights[i - 1];
    const v = values[i - 1];
    for (let cap = 0; cap <= maxCapacity; cap++) {
      if (w <= cap) {
        dp[i][cap] = Math.max(dp[i - 1][cap], dp[i - 1][cap - w] + v);
      } else {
        dp[i][cap] = dp[i - 1][cap];
      }
    }
  }
  return dp[n][maxCapacity];
}`,
    python: `# Python 0-1 Knapsack DP (1차원 공간 최적화 O(W))
def knapsack(weights, values, max_capacity):
    dp = [0] * (max_capacity + 1)
    for w, v in zip(weights, values):
        for cap in range(max_capacity, w - 1, -1):
            dp[cap] = max(dp[cap], dp[cap - w] + v)
    return dp[max_capacity]`,
    cpp: `// C++ 0-1 Knapsack DP (1D Vector Optimization)
#include <vector>
#include <algorithm>

int knapsack(const std::vector<int>& weights, const std::vector<int>& values, int maxCap) {
    std::vector<int> dp(maxCap + 1, 0);
    for (size_t i = 0; i < weights.size(); ++i) {
        for (int cap = maxCap; cap >= weights[i]; --cap) {
            dp[cap] = std::max(dp[cap], dp[cap - weights[i]] + values[i]);
        }
    }
    return dp[maxCap];
}`,
    java: `// Java 0-1 Knapsack DP
public class Knapsack {
    public static int knapsack(int[] weights, int[] values, int maxCapacity) {
        int[] dp = new int[maxCapacity + 1];
        for (int i = 0; i < weights.length; i++) {
            for (int cap = maxCapacity; cap >= weights[i]; cap--) {
                dp[cap] = Math.max(dp[cap], dp[cap - weights[i]] + values[i]);
            }
        }
        return dp[maxCapacity];
    }
}`,
  },
};

export const CODING_TEST_RECOMMENDATIONS: Partial<
  Record<AlgorithmId, { problems: ProblemRecommendation[]; patterns: string[] }>
> = {
  quickSort: {
    problems: [
      {
        platform: 'BOJ',
        title: '2751번: 수 정렬하기 2',
        difficulty: 'Silver',
        url: 'https://www.acmicpc.net/problem/2751',
        keyTakeaway: 'N=1,000,000 대용량 데이터에서 O(N log N) 정렬 구현',
      },
      {
        platform: 'Programmers',
        title: '가장 큰 수',
        difficulty: 'Lv2',
        url: 'https://school.programmers.co.kr/learn/courses/30/lessons/42746',
        keyTakeaway: '사용자 정의 비교기(Comparator) 정렬 활용',
      },
      {
        platform: 'LeetCode',
        title: '912. Sort an Array',
        difficulty: 'Medium',
        url: 'https://leetcode.com/problems/sort-an-array/',
        keyTakeaway: '피벗 무작위화(Randomized Pivot)로 최악 O(N²) 방지',
      },
    ],
    patterns: [
      '대용량 데이터 정렬 요구 (N > 10,000)',
      'K번째 최댓값/최솟값 찾기 (Quick Select 응용)',
      '특수 조건에 따른 커스텀 우선순위 정렬',
    ],
  },
  binarySearch: {
    problems: [
      {
        platform: 'BOJ',
        title: '1920번: 수 찾기',
        difficulty: 'Silver',
        url: 'https://www.acmicpc.net/problem/1920',
        keyTakeaway: '정렬된 배열에서 O(log N) 값 탐색',
      },
      {
        platform: 'Programmers',
        title: '입국심사',
        difficulty: 'Lv3',
        url: 'https://school.programmers.co.kr/learn/courses/30/lessons/43238',
        keyTakeaway: '시간 범위를 이진 탐색하는 결정 문제(Parametric Search)',
      },
      {
        platform: 'LeetCode',
        title: '704. Binary Search',
        difficulty: 'Easy',
        url: 'https://leetcode.com/problems/binary-search/',
        keyTakeaway: '기본 이진 탐색 오버플로우 없는 mid 계산',
      },
    ],
    patterns: [
      '이미 정렬된 데이터에서 특정 값 존재 여부 O(log N) 탐색',
      '중복 원소가 있을 때의 처음/마지막 인덱스 (Lower / Upper Bound)',
      '최적화 문제 ➔ 결정 문제 변환(Parametric Search)',
    ],
  },
  dijkstra: {
    problems: [
      {
        platform: 'BOJ',
        title: '1753번: 최단경로',
        difficulty: 'Gold',
        url: 'https://www.acmicpc.net/problem/1753',
        keyTakeaway: '우선순위 큐(Min-Heap)를 이용한 다익스트라 기본 템플릿',
      },
      {
        platform: 'Programmers',
        title: '배달',
        difficulty: 'Lv2',
        url: 'https://school.programmers.co.kr/learn/courses/30/lessons/12978',
        keyTakeaway: '특정 거리 이하 노드 개수 카운팅',
      },
      {
        platform: 'LeetCode',
        title: '743. Network Delay Time',
        difficulty: 'Medium',
        url: 'https://leetcode.com/problems/network-delay-time/',
        keyTakeaway: '모든 노드 도달 최대 최단 시간 산출',
      },
    ],
    patterns: [
      '양의 가중치를 가진 그래프에서 단일 시작점 최단 거리',
      '내비게이션 경로 탐색, 네트워크 패킷 전달 지연 최소화',
      '격자(Grid) 지도에서 칸 이동 비용이 서로 다른 최단 경로',
    ],
  },
  knapsack: {
    problems: [
      {
        platform: 'BOJ',
        title: '12865번: 평범한 배낭',
        difficulty: 'Gold',
        url: 'https://www.acmicpc.net/problem/12865',
        keyTakeaway: '0-1 Knapsack DP 전형적인 대표 기출',
      },
      {
        platform: 'Programmers',
        title: 'N으로 표현',
        difficulty: 'Lv3',
        url: 'https://school.programmers.co.kr/learn/courses/30/lessons/42895',
        keyTakeaway: '집합을 이용한 부분 문제 확장 DP',
      },
      {
        platform: 'LeetCode',
        title: '416. Partition Equal Subset Sum',
        difficulty: 'Medium',
        url: 'https://leetcode.com/problems/partition-equal-subset-sum/',
        keyTakeaway: '목표 합 Target = Sum/2를 만드는 부분집합 배낭 DP',
      },
    ],
    patterns: [
      '제한된 예산/용량 내에서 이익/가치를 최대화하는 조합',
      '물건을 한 번만 선택 가능 ➔ 0-1 Knapsack (역순 1D 순회)',
      '물건을 무한히 선택 가능 ➔ Unbounded Knapsack / 동전 거스름돈 (정방향 1D 순회)',
    ],
  },
  kmp: {
    problems: [
      {
        platform: 'BOJ',
        title: '1786번: 찾기',
        difficulty: 'Platinum',
        url: 'https://www.acmicpc.net/problem/1786',
        keyTakeaway: '백만 자 텍스트에서 KMP 패턴 매칭',
      },
      {
        platform: 'LeetCode',
        title: '28. Find the Index of the First Occurrence in a String',
        difficulty: 'Easy',
        url: 'https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/',
        keyTakeaway: 'KMP 또는 슬라이딩 윈도우 문자열 검색',
      },
    ],
    patterns: [
      '대용량 본문 텍스트 내에서 특정 키워드 위치 검색',
      '문자열의 주기성(Periodicity) 및 접두사-접미사 일치 길이 분석',
    ],
  },
  mst: {
    problems: [
      {
        platform: 'BOJ',
        title: '1197번: 최소 스패닝 트리',
        difficulty: 'Gold',
        url: 'https://www.acmicpc.net/problem/1197',
        keyTakeaway: '크루스칼 유니온-파인드 기본 문제',
      },
      {
        platform: 'Programmers',
        title: '섬 연결하기',
        difficulty: 'Lv3',
        url: 'https://school.programmers.co.kr/learn/courses/30/lessons/42861',
        keyTakeaway: '모든 섬을 최소 비용으로 연결하는 MST',
      },
    ],
    patterns: [
      '모든 정점을 최소 비용으로 하나로 연결하는 네트워크 설계',
      '간선 가중치 오름차순 정렬 후 사이클 방지',
    ],
  },
};
