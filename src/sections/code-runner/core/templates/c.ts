import type { CodeTemplate } from '../../types';

// ----------------------------------------------------------------------

export const C_TEMPLATES: CodeTemplate[] = [
  {
    id: 'c-01-hello-io',
    title: '01. Hello World & printf 표준 출력',
    category: 'Systems & Native',
    language: 'c',
    engine: 'wasm',
    description: 'C 언어 표준 입출력 및 서식 지정자(%s, %d)',
    mainFile: 'main.c',
    tags: ['C', 'Hello World', 'printf', 'I/O'],
    files: {
      'main.c': `// ==========================================
// ⚡ [01] C Language: Hello World & 기본 입출력
// ==========================================
#include <stdio.h>

int main() {
    printf("\\033[96m✨ Hello from C Language (Clang Wasm)!\\033[0m\\n");
    printf("------------------------------------------\\n");
    printf("표준 라이브러리: stdio.h, stdlib.h\\n");
    printf("컴파일 타겟: WebAssembly (Wasm32-Wasi)\\n");
    printf("C 언어 알고리즘 템플릿 환경 준비 완료\\n");
    return 0;
}
`,
    },
  },
  {
    id: 'c-02-dfs',
    title: '02. 깊이 우선 탐색 (DFS & 연결 요소)',
    category: 'Systems & Native',
    language: 'c',
    engine: 'wasm',
    description: '인접 행렬 기반 재귀 DFS 그래프 순회',
    mainFile: 'main.c',
    tags: ['DFS', 'Graph', 'Recursion'],
    files: {
      'main.c': `// ==========================================
// ⚡ [02] C Language: 깊이 우선 탐색 (DFS)
// ==========================================
#include <stdio.h>

#define MAX 10

int graph[MAX][MAX];
int visited[MAX];
int n = 8;

void dfs(int node) {
    visited[node] = 1;
    printf("%d ", node);

    for (int i = 1; i <= n; i++) {
        if (graph[node][i] && !visited[i]) {
            dfs(i);
        }
    }
}

int main() {
    printf("\\033[96m⚡ [DFS] C 언어 인접 행렬 그래프 순회\\033[0m\\n");
    printf("------------------------------------------\\n");

    graph[1][2] = graph[2][1] = 1;
    graph[1][3] = graph[3][1] = 1;
    graph[2][4] = graph[4][2] = 1;
    graph[2][5] = graph[5][2] = 1;
    graph[3][6] = graph[6][3] = 1;
    graph[7][8] = graph[8][7] = 1;

    printf("노드 1 기준 DFS 순회: ");
    dfs(1);
    printf("\\n");

    return 0;
}
`,
    },
  },
  {
    id: 'c-03-bfs',
    title: '03. 너비 우선 탐색 (BFS & 2D 미로 최단 경로)',
    category: 'Systems & Native',
    language: 'c',
    engine: 'wasm',
    description: '배열 큐를 활용한 2D 격자 미로 탈출 최단 거리 BFS',
    mainFile: 'main.c',
    tags: ['BFS', 'Queue', 'Shortest Path', 'Maze'],
    files: {
      'main.c': `// ==========================================
// ⚡ [03] C Language: 너비 우선 탐색 (BFS) 최단 경로
// ==========================================
#include <stdio.h>

#define H 5
#define W 6

int maze[H][W] = {
    {0, 0, 1, 0, 0, 0},
    {1, 0, 1, 0, 1, 0},
    {0, 0, 0, 0, 1, 0},
    {0, 1, 1, 0, 0, 0},
    {0, 0, 0, 1, 1, 0}
};

int visited[H][W];

typedef struct {
    int x, y, dist;
} Point;

Point queue[100];
int front = 0, rear = 0;

int main() {
    printf("\\033[96m⚡ [BFS] 2D 미로 최단 거리 탐색\\033[0m\\n");
    printf("------------------------------------------\\n");

    queue[rear++] = (Point){0, 0, 1};
    visited[0][0] = 1;

    int dx[] = {0, 0, 1, -1};
    int dy[] = {1, -1, 0, 0};
    int ans = -1;

    while (front < rear) {
        Point cur = queue[front++];

        if (cur.x == W - 1 && cur.y == H - 1) {
            ans = cur.dist;
            break;
        }

        for (int i = 0; i < 4; i++) {
            int nx = cur.x + dx[i];
            int ny = cur.y + dy[i];

            if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
                if (!visited[ny][nx] && maze[ny][nx] == 0) {
                    visited[ny][nx] = 1;
                    queue[rear++] = (Point){nx, ny, cur.dist + 1};
                }
            }
        }
    }

    printf("✨ 미로 탈출 최단 거리: %d칸\\n", ans);
    return 0;
}
`,
    },
  },
  {
    id: 'c-04-dp',
    title: '04. 다이나믹 프로그래밍 (DP & 0/1 Knapsack)',
    category: 'Systems & Native',
    language: 'c',
    engine: 'wasm',
    description: '0/1 Knapsack 배낭 DP 테이블 최적화',
    mainFile: 'main.c',
    tags: ['DP', 'Knapsack', 'Optimization'],
    files: {
      'main.c': `// ==========================================
// ⚡ [04] C Language: 다이나믹 프로그래밍 (0/1 배낭)
// ==========================================
#include <stdio.h>

#define MAX_ITEMS 5
#define MAX_CAP 5

int max(int a, int b) { return a > b ? a : b; }

int main() {
    printf("\\033[96m⚡ [DP] 0/1 Knapsack 배낭 문제 최적화\\033[0m\\n");
    printf("------------------------------------------\\n");

    int weights[] = {3, 1, 1, 2, 2};
    int values[] = {50, 40, 30, 20, 35};
    int n = 5;
    int capacity = 5;

    int dp[MAX_ITEMS + 1][MAX_CAP + 1] = {0};

    for (int i = 1; i <= n; i++) {
        int w = weights[i - 1];
        int v = values[i - 1];
        for (int cap = 0; cap <= capacity; cap++) {
            if (w <= cap) {
                dp[i][cap] = max(dp[i - 1][cap], dp[i - 1][cap - w] + v);
            } else {
                dp[i][cap] = dp[i - 1][cap];
            }
        }
    }

    printf("✨ 배낭에 담을 수 있는 최대 가치: %d만원\\n", dp[n][capacity]);
    return 0;
}
`,
    },
  },
  {
    id: 'c-05-binary-search',
    title: '05. 이진 탐색 & 파라메트릭 서치',
    category: 'Systems & Native',
    language: 'c',
    engine: 'wasm',
    description: 'O(log N) 이진 탐색 및 파라메트릭 서치(랜선 자르기)',
    mainFile: 'main.c',
    tags: ['Binary Search', 'Parametric Search'],
    files: {
      'main.c': `// ==========================================
// ⚡ [05] C Language: 이진 탐색 & 파라메트릭 서치
// ==========================================
#include <stdio.h>

int binarySearch(int arr[], int n, int target) {
    int l = 0, r = n - 1;
    while (l <= r) {
        int mid = (l + r) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) l = mid + 1;
        else r = mid - 1;
    }
    return -1;
}

int main() {
    printf("\\033[96m⚡ [Binary Search] 이진 탐색 & 파라메트릭 서치\\033[0m\\n");
    printf("------------------------------------------\\n");

    int arr[] = {3, 7, 12, 19, 24, 38, 45, 56, 72, 88, 91};
    int target = 56;
    printf("타겟 %d 인덱스: %d\\n", target, binarySearch(arr, 11, target));

    // 파라메트릭 서치
    int cables[] = {802, 743, 457, 539};
    int needed = 11;
    long long left = 1, right = 802, best = 0;

    while (left <= right) {
        long long mid = (left + right) / 2;
        long long count = 0;
        for (int i = 0; i < 4; i++) count += cables[i] / mid;

        if (count >= needed) {
            best = mid;
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    printf("✨ 만들 수 있는 최대 랜선 길이: %lldcm\\n", best);
    return 0;
}
`,
    },
  },
  {
    id: 'c-06-dijkstra',
    title: '06. 다익스트라 최단 경로 (Dijkstra Algorithm)',
    category: 'Systems & Native',
    language: 'c',
    engine: 'wasm',
    description: '가중치 인접 행렬 기반 단일 출발점 다익스트라 최단 경로',
    mainFile: 'main.c',
    tags: ['Dijkstra', 'Graph'],
    files: {
      'main.c': `// ==========================================
// ⚡ [06] C Language: 다익스트라 최단 경로
// ==========================================
#include <stdio.h>

#define INF 1000000
#define N 5

int cost[N + 1][N + 1];
int dist[N + 1];
int visited[N + 1];

int main() {
    printf("\\033[96m⚡ [Dijkstra] 가중치 그래프 최단 경로\\033[0m\\n");
    printf("------------------------------------------\\n");

    for (int i = 1; i <= N; i++) {
        for (int j = 1; j <= N; j++) {
            cost[i][j] = (i == j) ? 0 : INF;
        }
    }

    cost[1][2] = 4; cost[1][3] = 2;
    cost[2][3] = 1; cost[2][4] = 5;
    cost[3][4] = 8; cost[4][5] = 2;

    for (int i = 1; i <= N; i++) dist[i] = INF;
    dist[1] = 0;

    for (int i = 1; i <= N; i++) {
        int u = -1, minD = INF;
        for (int j = 1; j <= N; j++) {
            if (!visited[j] && dist[j] < minD) {
                minD = dist[j];
                u = j;
            }
        }

        if (u == -1 || minD == INF) break;
        visited[u] = 1;

        for (int v = 1; v <= N; v++) {
            if (!visited[v] && cost[u][v] != INF) {
                if (dist[u] + cost[u][v] < dist[v]) {
                    dist[v] = dist[u] + cost[u][v];
                }
            }
        }
    }

    printf("노드 1에서 노드 5까지 최단 비용: %d\\n", dist[5]);
    return 0;
}
`,
    },
  },
  {
    id: 'c-07-sorting',
    title: '07. 퀵 정렬 (QuickSort Algorithm)',
    category: 'Systems & Native',
    language: 'c',
    engine: 'wasm',
    description: '분할 정복 QuickSort 구현',
    mainFile: 'main.c',
    tags: ['QuickSort', 'Sorting'],
    files: {
      'main.c': `// ==========================================
// ⚡ [07] C Language: 퀵 정렬 (QuickSort)
// ==========================================
#include <stdio.h>

void swap(int *a, int *b) { int t = *a; *a = *b; *b = t; }

void quickSort(int arr[], int low, int high) {
    if (low >= high) return;
    int pivot = arr[high];
    int i = low - 1;

    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            swap(&arr[++i], &arr[j]);
        }
    }
    swap(&arr[i + 1], &arr[high]);
    int p = i + 1;

    quickSort(arr, low, p - 1);
    quickSort(arr, p + 1, high);
}

int main() {
    printf("\\033[96m⚡ [Sorting] 분할 정복 퀵 정렬\\033[0m\\n");
    printf("------------------------------------------\\n");

    int numbers[] = {64, 34, 25, 12, 22, 11, 90, 88, 45, 50, 7};
    int len = sizeof(numbers) / sizeof(numbers[0]);

    quickSort(numbers, 0, len - 1);
    printf("정렬 결과: ");
    for (int i = 0; i < len; i++) printf("%d ", numbers[i]);
    printf("\\n");

    return 0;
}
`,
    },
  },
  {
    id: 'c-08-backtracking',
    title: '08. 백트래킹 (N-Queens 체스)',
    category: 'Systems & Native',
    language: 'c',
    engine: 'wasm',
    description: '재귀적 유망성 검사를 통한 N-Queens 해답 탐색',
    mainFile: 'main.c',
    tags: ['Backtracking', 'N-Queens'],
    files: {
      'main.c': `// ==========================================
// ⚡ [08] C Language: 백트래킹 (N-Queens)
// ==========================================
#include <stdio.h>
#include <stdlib.h>

int solutions = 0;
int board[10];

int isSafe(int row, int col) {
    for (int r = 0; r < row; r++) {
        int c = board[r];
        if (c == col || abs(row - r) == abs(col - c)) {
            return 0;
        }
    }
    return 1;
}

void backtrack(int row, int N) {
    if (row == N) {
        solutions++;
        return;
    }
    for (int col = 0; col < N; col++) {
        if (isSafe(row, col)) {
            board[row] = col;
            backtrack(row + 1, N);
            board[row] = -1;
        }
    }
}

int main() {
    printf("\\033[96m⚡ [Backtracking] N-Queens 체스판 배치\\033[0m\\n");
    printf("------------------------------------------\\n");

    int N = 8;
    for (int i = 0; i < N; i++) board[i] = -1;
    backtrack(0, N);

    printf("%dx%d 체스판 퀸 배치 해답 수: %d가지\\n", N, N, solutions);
    return 0;
}
`,
    },
  },
  {
    id: 'c-09-two-pointers',
    title: '09. 투 포인터 & 슬라이딩 윈도우',
    category: 'Systems & Native',
    language: 'c',
    engine: 'wasm',
    description: 'Two Sum 투 포인터 탐색 O(N)',
    mainFile: 'main.c',
    tags: ['Two Pointers', 'O(N)'],
    files: {
      'main.c': `// ==========================================
// ⚡ [09] C Language: 투 포인터 (Two Sum)
// ==========================================
#include <stdio.h>

int main() {
    printf("\\033[96m⚡ [Two Pointers] O(N) 선형 탐색\\033[0m\\n");
    printf("------------------------------------------\\n");

    int arr[] = {1, 2, 3, 4, 6, 8, 9, 11, 15};
    int n = sizeof(arr) / sizeof(arr[0]);
    int target = 12;

    int left = 0, right = n - 1;
    printf("합이 %d인 쌍:\\n", target);

    while (left < right) {
        int sum = arr[left] + arr[right];
        if (sum == target) {
            printf("  ➜ (%d + %d = 12)\\n", arr[left], arr[right]);
            left++;
            right--;
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }
    return 0;
}
`,
    },
  },
  {
    id: 'c-10-greedy',
    title: '10. 그리디 알고리즘 (Greedy - 회의실 배정)',
    category: 'Systems & Native',
    language: 'c',
    engine: 'wasm',
    description: '종료 시간 정렬 기반 회의실 최대 배정',
    mainFile: 'main.c',
    tags: ['Greedy', 'Activity Selection'],
    files: {
      'main.c': `// ==========================================
// ⚡ [10] C Language: 그리디 (회의실 배정)
// ==========================================
#include <stdio.h>
#include <stdlib.h>

typedef struct {
    const char *id;
    int start, end;
} Meeting;

int cmp(const void *a, const void *b) {
    Meeting *m1 = (Meeting *)a;
    Meeting *m2 = (Meeting *)b;
    return m1->end - m2->end;
}

int main() {
    printf("\\033[96m⚡ [Greedy] 회의실 배정 (Activity Selection)\\033[0m\\n");
    printf("------------------------------------------\\n");

    Meeting meetings[] = {
        {"M1", 1, 4}, {"M2", 3, 5}, {"M3", 0, 6}, {"M4", 5, 7},
        {"M5", 3, 8}, {"M6", 5, 9}, {"M7", 6, 10}, {"M8", 8, 11},
        {"M9", 8, 12}, {"M10", 12, 14}
    };
    int n = sizeof(meetings) / sizeof(meetings[0]);

    qsort(meetings, n, sizeof(Meeting), cmp);

    int count = 0;
    int lastEnd = 0;

    for (int i = 0; i < n; i++) {
        if (meetings[i].start >= lastEnd) {
            count++;
            lastEnd = meetings[i].end;
            printf("  ➜ %s: %d시 ~ %d시\\n", meetings[i].id, meetings[i].start, meetings[i].end);
        }
    }

    printf("✨ 배정 가능한 최대 회의 수: %d개\\n", count);
    return 0;
}
`,
    },
  },
];
