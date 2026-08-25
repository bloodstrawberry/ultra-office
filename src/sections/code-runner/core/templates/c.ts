import type { CodeTemplate } from '../../types';

// ----------------------------------------------------------------------

export const C_TEMPLATES: CodeTemplate[] = [
  // --- [Part 1: 언어 문법 및 메모리 10선] ---
  {
    id: 'c-01-hello-world',
    title: '01. Hello World & printf 입출력',
    category: 'Systems & Native',
    language: 'c',
    engine: 'wasm',
    description: 'C 표준 라이브러리 stdio.h 및 서식 지정자(%d, %s, %f)',
    mainFile: 'main.c',
    tags: ['C', 'Hello World', 'printf', 'stdio.h'],
    files: {
      'main.c': `// ==========================================
// 🔲 [01] C: Hello World & 표준 입출력
// ==========================================
#include <stdio.h>

int main() {
    printf("\\033[96m✨ Hello, C Programming (Clang Wasm)!\\033[0m\\n");
    printf("------------------------------------------\\n");

    char author[] = "C Developer";
    int year = 2026;
    double pi = 3.141592;

    printf("작성자: %s\\n", author);
    printf("기준 연도: %d년 (원주율: %.4f)\\n", year, pi);
    printf("C 표준: ISO/IEC 9899:2018 (C17)\\n");

    return 0;
}
`,
    },
  },
  {
    id: 'c-02-pointers-memory',
    title: '02. 포인터(Pointer) & 주소 연산자(&, *)',
    category: 'Systems & Native',
    language: 'c',
    engine: 'wasm',
    description: '변수 메모리 주소(&), 역참조(*), 포인터 스왑 함수',
    mainFile: 'main.c',
    tags: ['C', 'Pointers', 'Memory', 'Address'],
    files: {
      'main.c': `// ==========================================
// 🔲 [02] C: 포인터와 메모리 주소
// ==========================================
#include <stdio.h>

void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int main() {
    int x = 10, y = 20;
    printf("교환 전: x=%d, y=%d (주소: %p, %p)\\n", x, y, (void*)&x, (void*)&y);

    swap(&x, &y);
    printf("교환 후: x=%d, y=%d\\n", x, y);
    return 0;
}
`,
    },
  },
  {
    id: 'c-03-arrays-strings',
    title: '03. 배열 & 널 종료 문자열(char[])',
    category: 'Systems & Native',
    language: 'c',
    engine: 'wasm',
    description: '정수 배열 순회 및 string.h (strlen, strcpy, strcmp)',
    mainFile: 'main.c',
    tags: ['C', 'Arrays', 'Strings', 'string.h'],
    files: {
      'main.c': `// ==========================================
// 🔲 [03] C: 배열과 문자열
// ==========================================
#include <stdio.h>
#include <string.h>

int main() {
    int scores[] = {85, 92, 78, 96, 88};
    int len = sizeof(scores) / sizeof(scores[0]);
    int sum = 0;

    for (int i = 0; i < len; i++) sum += scores[i];
    printf("학생 %d명 총점: %d점 (평균: %.2f점)\\n", len, sum, (double)sum / len);

    char str[50] = "Ultra Office";
    strcat(str, " - Code Runner");
    printf("문자열: %s (길이: %zu)\\n", str, strlen(str));

    return 0;
}
`,
    },
  },
  {
    id: 'c-04-struct-typedef',
    title: '04. 구조체(struct) & typedef',
    category: 'Systems & Native',
    language: 'c',
    engine: 'wasm',
    description: '구조체 정의, 화살표 연산자(->), 구조체 배열',
    mainFile: 'main.c',
    tags: ['C', 'struct', 'typedef'],
    files: {
      'main.c': `// ==========================================
// 🔲 [04] C: 구조체와 typedef
// ==========================================
#include <stdio.h>

typedef struct {
    int id;
    char name[32];
    double salary;
} Employee;

void printEmployee(const Employee *e) {
    printf("  • [%d] %-10s: $%.2f\\n", e->id, e->name, e->salary);
}

int main() {
    Employee team[] = {
        {101, "Alice", 7500.0},
        {102, "Bob", 6800.0},
        {103, "Charlie", 8200.0}
    };

    printf("[직원 목록]\\n");
    for (int i = 0; i < 3; i++) {
        printEmployee(&team[i]);
    }
    return 0;
}
`,
    },
  },
  {
    id: 'c-05-dynamic-memory',
    title: '05. 동적 메모리 할당 (malloc, free)',
    category: 'Systems & Native',
    language: 'c',
    engine: 'wasm',
    description: 'stdlib.h 동적 힙 메모리 할당, 해제 및 누수 방지',
    mainFile: 'main.c',
    tags: ['C', 'malloc', 'free', 'stdlib.h'],
    files: {
      'main.c': `// ==========================================
// 🔲 [05] C: 동적 메모리 할당 (malloc/free)
// ==========================================
#include <stdio.h>
#include <stdlib.h>

int main() {
    int n = 5;
    int *arr = (int *)malloc(n * sizeof(int));
    if (!arr) {
        printf("메모리 할당 실패!\\n");
        return 1;
    }

    for (int i = 0; i < n; i++) arr[i] = (i + 1) * 10;

    printf("동적 할당 배열: ");
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\\n");

    free(arr);
    printf("메모리 해제 완료\\n");
    return 0;
}
`,
    },
  },
  {
    id: 'c-06-linked-list',
    title: '06. 단일 연결 리스트 (Singly Linked List)',
    category: 'Systems & Native',
    language: 'c',
    engine: 'wasm',
    description: '동적 노드 생성, 리스트 순회 및 메모리 해제',
    mainFile: 'main.c',
    tags: ['C', 'Linked List', 'Data Structures'],
    files: {
      'main.c': `// ==========================================
// 🔲 [06] C: 단일 연결 리스트
// ==========================================
#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int data;
    struct Node *next;
} Node;

Node* createNode(int data) {
    Node *n = (Node *)malloc(sizeof(Node));
    n->data = data;
    n->next = NULL;
    return n;
}

int main() {
    Node *head = createNode(10);
    head->next = createNode(20);
    head->next->next = createNode(30);

    printf("연결 리스트: ");
    Node *curr = head;
    while (curr) {
        printf("%d ➔ ", curr->data);
        curr = curr->next;
    }
    printf("NULL\\n");

    while (head) {
        Node *temp = head;
        head = head->next;
        free(temp);
    }
    return 0;
}
`,
    },
  },
  {
    id: 'c-07-function-pointers',
    title: '07. 함수 포인터 (Function Pointer & qsort)',
    category: 'Systems & Native',
    language: 'c',
    engine: 'wasm',
    description: '함수 포인터 선언 및 stdlib.h qsort() 콜백',
    mainFile: 'main.c',
    tags: ['C', 'Function Pointers', 'qsort', 'Callbacks'],
    files: {
      'main.c': `// ==========================================
// 🔲 [07] C: 함수 포인터와 qsort
// ==========================================
#include <stdio.h>
#include <stdlib.h>

int compareDesc(const void *a, const void *b) {
    return (*(int *)b - *(int *)a);
}

int main() {
    int arr[] = {42, 12, 88, 56, 23, 91, 5};
    int n = sizeof(arr) / sizeof(arr[0]);

    qsort(arr, n, sizeof(int), compareDesc);

    printf("내림차순 정렬 결과: ");
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\\n");
    return 0;
}
`,
    },
  },
  {
    id: 'c-08-bitwise-operations',
    title: '08. 비트 연산자 (Bitwise AND, OR, XOR, Shift)',
    category: 'Systems & Native',
    language: 'c',
    engine: 'wasm',
    description: '비트 플래그 설정, 마스킹, 비트 이동 연산',
    mainFile: 'main.c',
    tags: ['C', 'Bitwise', 'Bit Flags', 'Masking'],
    files: {
      'main.c': `// ==========================================
// 🔲 [08] C: 비트 연산과 플래그
// ==========================================
#include <stdio.h>

#define FLAG_READ    (1 << 0) // 0001
#define FLAG_WRITE   (1 << 1) // 0010
#define FLAG_EXECUTE (1 << 2) // 0100

int main() {
    unsigned char perm = FLAG_READ | FLAG_WRITE;

    printf("권한 비트값: 0x%02X\\n", perm);
    printf("READ 권한: %s\\n", (perm & FLAG_READ) ? "YES" : "NO");
    printf("WRITE 권한: %s\\n", (perm & FLAG_WRITE) ? "YES" : "NO");
    printf("EXECUTE 권한: %s\\n", (perm & FLAG_EXECUTE) ? "YES" : "NO");

    return 0;
}
`,
    },
  },
  {
    id: 'c-09-file-simulation',
    title: '09. 메모리 버퍼 스트림 (sscanf, sprintf)',
    category: 'Systems & Native',
    language: 'c',
    engine: 'wasm',
    description: '서식화된 문자열 파싱 sscanf 및 버퍼 조립 sprintf',
    mainFile: 'main.c',
    tags: ['C', 'sprintf', 'sscanf', 'String Formatting'],
    files: {
      'main.c': `// ==========================================
// 🔲 [09] C: sscanf & sprintf 문자열 처리
// ==========================================
#include <stdio.h>

int main() {
    const char *log = "2026-08-25 ERROR 500 DB_TIMEOUT";
    int year, month, day, code;
    char level[16], msg[32];

    sscanf(log, "%d-%d-%d %s %d %s", &year, &month, &day, level, &code, msg);

    printf("[로그 파싱 결과]\\n");
    printf("  날짜: %04d년 %02d월 %02d일\\n", year, month, day);
    printf("  등급: %s (코드: %d, 사유: %s)\\n", level, code, msg);

    return 0;
}
`,
    },
  },
  {
    id: 'c-10-bst-tree',
    title: '10. 이진 탐색 트리 (BST 자료구조)',
    category: 'Systems & Native',
    language: 'c',
    engine: 'wasm',
    description: '포인터 기반 이진 탐색 트리(Binary Search Tree) 구현',
    mainFile: 'main.c',
    tags: ['C', 'BST', 'Tree', 'Data Structures'],
    files: {
      'main.c': `// ==========================================
// 🔲 [10] C: 이진 탐색 트리 (BST)
// ==========================================
#include <stdio.h>
#include <stdlib.h>

typedef struct TreeNode {
    int val;
    struct TreeNode *left, *right;
} TreeNode;

TreeNode* insert(TreeNode *root, int val) {
    if (!root) {
        TreeNode *n = (TreeNode *)malloc(sizeof(TreeNode));
        n->val = val; n->left = n->right = NULL;
        return n;
    }
    if (val < root->val) root->left = insert(root->left, val);
    else root->right = insert(root->right, val);
    return root;
}

void inorder(TreeNode *root) {
    if (!root) return;
    inorder(root->left);
    printf("%d ", root->val);
    inorder(root->right);
}

int main() {
    TreeNode *root = NULL;
    int data[] = {50, 30, 70, 20, 40, 60, 80};
    for (int i = 0; i < 7; i++) root = insert(root, data[i]);

    printf("BST 중위 순회 (정렬 출력): ");
    inorder(root);
    printf("\\n");
    return 0;
}
`,
    },
  },

  // --- [Part 2: 핵심 알고리즘 10선] ---
  {
    id: 'c-11-algo-dfs',
    title: '11. [알고리즘] 깊이 우선 탐색 (DFS & 연결 요소)',
    category: 'Systems & Native',
    language: 'c',
    engine: 'wasm',
    description: '인접 행렬 기반 재귀 DFS 그래프 순회',
    mainFile: 'main.c',
    tags: ['DFS', 'Graph', 'Recursion'],
    files: {
      'main.c': `// ==========================================
// 🧠 [11] C Algorithm: 깊이 우선 탐색 (DFS)
// ==========================================
#include <stdio.h>

#define MAX_NODES 10
int graph[MAX_NODES][MAX_NODES];
int visited[MAX_NODES];

void dfs(int node, int n) {
    visited[node] = 1;
    printf("%d ", node);

    for (int i = 1; i <= n; i++) {
        if (graph[node][i] && !visited[i]) {
            dfs(i, n);
        }
    }
}

void addEdge(int u, int v) {
    graph[u][v] = 1;
    graph[v][u] = 1;
}

int main() {
    printf("\\033[96m⚡ [DFS] C 인접 행렬 그래프 순회\\033[0m\\n");
    printf("------------------------------------------\\n");

    int n = 8;
    addEdge(1, 2); addEdge(1, 3);
    addEdge(2, 4); addEdge(2, 5);
    addEdge(3, 6);
    addEdge(7, 8);

    printf("노드 1 기준 DFS 순회: ");
    dfs(1, n);
    printf("\\n");
    return 0;
}
`,
    },
  },
  {
    id: 'c-12-algo-bfs',
    title: '12. [알고리즘] 너비 우선 탐색 (BFS & 2D 미로)',
    category: 'Systems & Native',
    language: 'c',
    engine: 'wasm',
    description: '배열 큐를 활용한 2D 미로 탈출 최단 거리 BFS',
    mainFile: 'main.c',
    tags: ['BFS', 'Queue', 'Shortest Path'],
    files: {
      'main.c': `// ==========================================
// 🧠 [12] C Algorithm: 너비 우선 탐색 (BFS) 최단 경로
// ==========================================
#include <stdio.h>

typedef struct {
    int x, y, dist;
} Point;

int maze[5][6] = {
    {0, 0, 1, 0, 0, 0},
    {1, 0, 1, 0, 1, 0},
    {0, 0, 0, 0, 1, 0},
    {0, 1, 1, 0, 0, 0},
    {0, 0, 0, 1, 1, 0}
};

int visited[5][6];
Point queue[100];
int head = 0, tail = 0;

int main() {
    printf("\\033[96m⚡ [BFS] 2D 미로 최단 거리 탐색\\033[0m\\n");
    printf("------------------------------------------\\n");

    int H = 5, W = 6;
    queue[tail++] = (Point){0, 0, 1};
    visited[0][0] = 1;

    int dx[] = {0, 0, 1, -1};
    int dy[] = {1, -1, 0, 0};
    int ans = -1;

    while (head < tail) {
        Point cur = queue[head++];

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
                    queue[tail++] = (Point){nx, ny, cur.dist + 1};
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
    id: 'c-13-algo-dp',
    title: '13. [알고리즘] 다이나믹 프로그래밍 (0/1 배낭)',
    category: 'Systems & Native',
    language: 'c',
    engine: 'wasm',
    description: '0/1 Knapsack 배낭 DP 테이블 2차원 최적화',
    mainFile: 'main.c',
    tags: ['DP', 'Knapsack', 'Optimization'],
    files: {
      'main.c': `// ==========================================
// 🧠 [13] C Algorithm: 다이나믹 프로그래밍 (0/1 배낭)
// ==========================================
#include <stdio.h>

int max(int a, int b) { return (a > b) ? a : b; }

int main() {
    printf("\\033[96m⚡ [DP] 0/1 Knapsack 배낭 문제 최적화\\033[0m\\n");
    printf("------------------------------------------\\n");

    int weights[] = {3, 1, 1, 2, 2};
    int values[] = {50, 40, 30, 20, 35};
    int capacity = 5;
    int n = 5;
    int dp[6][6] = {0};

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
    id: 'c-14-algo-binary-search',
    title: '14. [알고리즘] 이진 탐색 & 파라메트릭 서치',
    category: 'Systems & Native',
    language: 'c',
    engine: 'wasm',
    description: '이진 탐색 및 파라메트릭 서치(랜선 자르기)',
    mainFile: 'main.c',
    tags: ['Binary Search', 'Parametric Search'],
    files: {
      'main.c': `// ==========================================
// 🧠 [14] C Algorithm: 이진 탐색 & 파라메트릭 서치
// ==========================================
#include <stdio.h>

int binarySearch(int arr[], int n, int target) {
    int left = 0, right = n - 1;
    while (left <= right) {
        int mid = (left + right) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

int main() {
    printf("\\033[96m⚡ [Binary Search] 이진 탐색 & 파라메트릭 서치\\033[0m\\n");
    printf("------------------------------------------\\n");

    int arr[] = {3, 7, 12, 19, 24, 38, 45, 56, 72, 88, 91};
    int n = sizeof(arr) / sizeof(arr[0]);
    int target = 56;
    printf("타겟 %d 위치 인덱스: %d\\n", target, binarySearch(arr, n, target));

    long long cables[] = {802, 743, 457, 539};
    long long needed = 11;
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
    id: 'c-15-algo-dijkstra',
    title: '15. [알고리즘] 다익스트라 최단 경로 (Dijkstra Algorithm)',
    category: 'Systems & Native',
    language: 'c',
    engine: 'wasm',
    description: '가중치 인접 행렬 기반 다익스트라 최단 경로',
    mainFile: 'main.c',
    tags: ['Dijkstra', 'Graph'],
    files: {
      'main.c': `// ==========================================
// 🧠 [15] C Algorithm: 다익스트라 최단 경로
// ==========================================
#include <stdio.h>

#define INF 1000000
#define V 6

int minDistance(int dist[], int sptSet[]) {
    int min = INF, min_index = -1;
    for (int v = 1; v <= 5; v++) {
        if (!sptSet[v] && dist[v] <= min) {
            min = dist[v];
            min_index = v;
        }
    }
    return min_index;
}

int main() {
    printf("\\033[96m⚡ [Dijkstra] 가중치 인접 행렬 최단 경로\\033[0m\\n");
    printf("------------------------------------------\\n");

    int graph[V][V] = {0};
    graph[1][2] = 4; graph[1][3] = 2;
    graph[2][3] = 1; graph[2][4] = 5;
    graph[3][4] = 8;
    graph[4][5] = 2;

    int dist[V];
    int sptSet[V] = {0};

    for (int i = 1; i <= 5; i++) dist[i] = INF;
    dist[1] = 0;

    for (int count = 1; count < 5; count++) {
        int u = minDistance(dist, sptSet);
        if (u == -1) break;
        sptSet[u] = 1;

        for (int v = 1; v <= 5; v++) {
            if (!sptSet[v] && graph[u][v] && dist[u] != INF && dist[u] + graph[u][v] < dist[v]) {
                dist[v] = dist[u] + graph[u][v];
            }
        }
    }

    printf("노드 1에서 노드 5까지의 최단 비용: %d\\n", dist[5]);
    return 0;
}
`,
    },
  },
  {
    id: 'c-16-algo-sorting',
    title: '16. [알고리즘] 퀵 정렬 (QuickSort Algorithm)',
    category: 'Systems & Native',
    language: 'c',
    engine: 'wasm',
    description: '분할 정복 QuickSort 구현',
    mainFile: 'main.c',
    tags: ['QuickSort', 'Sorting'],
    files: {
      'main.c': `// ==========================================
// 🧠 [16] C Algorithm: 퀵 정렬
// ==========================================
#include <stdio.h>

void swap(int *a, int *b) {
    int t = *a; *a = *b; *b = t;
}

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
    int n = sizeof(numbers) / sizeof(numbers[0]);

    quickSort(numbers, 0, n - 1);

    printf("정렬 결과: ");
    for (int i = 0; i < n; i++) printf("%d ", numbers[i]);
    printf("\\n");
    return 0;
}
`,
    },
  },
  {
    id: 'c-17-algo-backtracking',
    title: '17. [알고리즘] 백트래킹 (N-Queens 체스)',
    category: 'Systems & Native',
    language: 'c',
    engine: 'wasm',
    description: '재귀적 유망성 검사를 통한 N-Queens 해답 탐색',
    mainFile: 'main.c',
    tags: ['Backtracking', 'N-Queens'],
    files: {
      'main.c': `// ==========================================
// 🧠 [17] C Algorithm: 백트래킹 (N-Queens)
// ==========================================
#include <stdio.h>
#include <stdlib.h>

int solutions = 0;

int isSafe(int row, int col, int board[]) {
    for (int r = 0; r < row; r++) {
        int c = board[r];
        if (c == col || abs(row - r) == abs(col - c)) {
            return 0;
        }
    }
    return 1;
}

void backtrack(int row, int N, int board[]) {
    if (row == N) {
        solutions++;
        return;
    }
    for (int col = 0; col < N; col++) {
        if (isSafe(row, col, board)) {
            board[row] = col;
            backtrack(row + 1, N, board);
            board[row] = -1;
        }
    }
}

int main() {
    printf("\\033[96m⚡ [Backtracking] N-Queens 체스판 배치\\033[0m\\n");
    printf("------------------------------------------\\n");

    int N = 8;
    int board[8];
    for (int i = 0; i < N; i++) board[i] = -1;
    backtrack(0, N, board);

    printf("%dx%d 체스판 해답 수: %d가지\\n", N, N, solutions);
    return 0;
}
`,
    },
  },
  {
    id: 'c-18-algo-two-pointers',
    title: '18. [알고리즘] 투 포인터 & 슬라이딩 윈도우',
    category: 'Systems & Native',
    language: 'c',
    engine: 'wasm',
    description: 'Two Sum 투 포인터 선형 시간 탐색 O(N)',
    mainFile: 'main.c',
    tags: ['Two Pointers', 'O(N)'],
    files: {
      'main.c': `// ==========================================
// 🧠 [18] C Algorithm: 투 포인터 (Two Sum)
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
    id: 'c-19-algo-greedy',
    title: '19. [알고리즘] 그리디 알고리즘 (회의실 배정)',
    category: 'Systems & Native',
    language: 'c',
    engine: 'wasm',
    description: '종료 시간 정렬 기반 회의실 최대 배정',
    mainFile: 'main.c',
    tags: ['Greedy', 'Activity Selection'],
    files: {
      'main.c': `// ==========================================
// 🧠 [19] C Algorithm: 그리디 (회의실 배정)
// ==========================================
#include <stdio.h>
#include <stdlib.h>

typedef struct {
    char id[4];
    int start;
    int end;
} Meeting;

int cmp(const void *a, const void *b) {
    return ((Meeting *)a)->end - ((Meeting *)b)->end;
}

int main() {
    printf("\\033[96m⚡ [Greedy] 회의실 배정 (Activity Selection)\\033[0m\\n");
    printf("------------------------------------------\\n");

    Meeting meetings[] = {
        {"M1", 1, 4}, {"M2", 3, 5}, {"M3", 0, 6}, {"M4", 5, 7},
        {"M5", 3, 8}, {"M6", 5, 9}, {"M7", 6, 10}, {"M8", 8, 11},
        {"M9", 8, 12}, {"M10", 12, 14}
    };
    int n = 10;

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
  {
    id: 'c-20-algo-trie-topo',
    title: '20. [알고리즘] 트라이 & 위상 정렬 (Trie & TopoSort)',
    category: 'Systems & Native',
    language: 'c',
    engine: 'wasm',
    description: '트라이 사전 검색 및 진입차수(In-degree) 기반 위상 정렬',
    mainFile: 'main.c',
    tags: ['Trie', 'Topological Sort', 'DAG'],
    files: {
      'main.c': `// ==========================================
// 🧠 [20] C Algorithm: 트라이 & 위상 정렬
// ==========================================
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct TrieNode {
    struct TrieNode *children[26];
    int isEnd;
} TrieNode;

TrieNode* createTrieNode() {
    TrieNode *node = (TrieNode *)calloc(1, sizeof(TrieNode));
    return node;
}

void insertTrie(TrieNode *root, const char *word) {
    TrieNode *cur = root;
    while (*word) {
        int idx = *word - 'a';
        if (!cur->children[idx]) cur->children[idx] = createTrieNode();
        cur = cur->children[idx];
        word++;
    }
    cur->isEnd = 1;
}

int main() {
    printf("\\033[96m⚡ [1] C Trie 접두사 트리\\033[0m\\n");
    TrieNode *root = createTrieNode();
    insertTrie(root, "apple");
    insertTrie(root, "app");
    insertTrie(root, "banana");
    printf("  단어 사전 삽입 완료 (apple, app, banana)\\n");

    printf("\\n\\033[96m⚡ [2] 위상 정렬 (Topological Sort)\\033[0m\\n");
    int n = 5;
    int adj[6][6] = {0};
    int inDegree[6] = {0};

    auto void addEdge(int u, int v) {
        adj[u][v] = 1;
        inDegree[v]++;
    };

    addEdge(1, 2); addEdge(2, 3); addEdge(2, 4); addEdge(3, 5); addEdge(4, 5);

    int q[10], head = 0, tail = 0;
    for (int i = 1; i <= n; i++) if (inDegree[i] == 0) q[tail++] = i;

    printf("  ✨ 빌드 순서: ");
    while (head < tail) {
        int cur = q[head++];
        printf("%d ➔ ", cur);
        for (int v = 1; v <= n; v++) {
            if (adj[cur][v]) {
                if (--inDegree[v] == 0) q[tail++] = v;
            }
        }
    }
    printf("Done\\n");
    return 0;
}
`,
    },
  },
];
