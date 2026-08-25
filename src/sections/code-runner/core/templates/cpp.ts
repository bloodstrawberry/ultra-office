import type { CodeTemplate } from '../../types';

// ----------------------------------------------------------------------

export const CPP_TEMPLATES: CodeTemplate[] = [
  {
    id: 'cpp-01-hello-io',
    title: '01. Hello World & std::cout 입출력',
    category: 'Systems & Native',
    language: 'cpp',
    engine: 'wasm',
    description: 'Modern C++20 표준 스트림(std::cout) 및 서식화 출력',
    mainFile: 'main.cpp',
    tags: ['C++', 'Hello World', 'iostream', 'C++20'],
    files: {
      'main.cpp': `// ==========================================
// 🔵 [01] C++: Hello World & 표준 입출력
// ==========================================
#include <iostream>
#include <string>
#include <vector>

int main() {
    std::cout << "\\033[96m✨ Hello, Modern C++20 Clang/Wasm!\\033[0m\\n";
    std::cout << "------------------------------------------\\n";

    std::string name = "C++ 개발자";
    int year = 2026;
    std::cout << "작성자: " << name << " (기준 연도: " << year << "년)\\n";
    std::cout << "지원 표준: ISO/IEC 14882:2020 (C++20)\\n";

    return 0;
}
`,
    },
  },
  {
    id: 'cpp-02-dfs',
    title: '02. 깊이 우선 탐색 (DFS & 연결 요소)',
    category: 'Systems & Native',
    language: 'cpp',
    engine: 'wasm',
    description: 'std::vector 인접 리스트와 재귀를 이용한 DFS 그래프 순회',
    mainFile: 'main.cpp',
    tags: ['DFS', 'Graph', 'Recursion', 'STL'],
    files: {
      'main.cpp': `// ==========================================
// 🔵 [02] C++: 깊이 우선 탐색 (DFS)
// ==========================================
#include <iostream>
#include <vector>

void dfs(int node, const std::vector<std::vector<int>>& graph, std::vector<bool>& visited) {
    visited[node] = true;
    std::cout << node << " ";

    for (int next : graph[node]) {
        if (!visited[next]) {
            dfs(next, graph, visited);
        }
    }
}

int main() {
    std::cout << "\\033[96m⚡ [DFS] C++ STL 벡터 기반 그래프 순회\\033[0m\\n";
    std::cout << "------------------------------------------\\n";

    int n = 8;
    std::vector<std::vector<int>> graph(n + 1);
    graph[1] = {2, 3};
    graph[2] = {1, 4, 5};
    graph[3] = {1, 6};
    graph[4] = {2};
    graph[5] = {2};
    graph[6] = {3};
    graph[7] = {8};
    graph[8] = {7};

    std::vector<bool> visited(n + 1, false);

    std::cout << "[1] 노드 1 기준 DFS 순회: ";
    dfs(1, graph, visited);
    std::cout << "\\n";

    return 0;
}
`,
    },
  },
  {
    id: 'cpp-03-bfs',
    title: '03. 너비 우선 탐색 (BFS & std::queue)',
    category: 'Systems & Native',
    language: 'cpp',
    engine: 'wasm',
    description: 'std::queue를 이용한 2D 미로 탈출 최단 거리 BFS',
    mainFile: 'main.cpp',
    tags: ['BFS', 'std::queue', 'Shortest Path', 'Grid'],
    files: {
      'main.cpp': `// ==========================================
// 🔵 [03] C++: 너비 우선 탐색 (BFS) 최단 경로
// ==========================================
#include <iostream>
#include <vector>
#include <queue>
#include <tuple>

int main() {
    std::cout << "\\033[96m⚡ [BFS] std::queue 2D 미로 최단 거리\\033[0m\\n";
    std::cout << "------------------------------------------\\n";

    std::vector<std::vector<int>> maze = {
        {0, 0, 1, 0, 0, 0},
        {1, 0, 1, 0, 1, 0},
        {0, 0, 0, 0, 1, 0},
        {0, 1, 1, 0, 0, 0},
        {0, 0, 0, 1, 1, 0}
    };

    int H = maze.size();
    int W = maze[0].size();

    std::queue<std::tuple<int, int, int>> q;
    std::vector<std::vector<bool>> visited(H, std::vector<bool>(W, false));

    q.push({0, 0, 1});
    visited[0][0] = true;

    int dx[] = {0, 0, 1, -1};
    int dy[] = {1, -1, 0, 0};
    int ans = -1;

    while (!q.empty()) {
        auto [x, y, dist] = q.front();
        q.pop();

        if (x == W - 1 && y == H - 1) {
            ans = dist;
            break;
        }

        for (int i = 0; i < 4; i++) {
            int nx = x + dx[i];
            int ny = y + dy[i];

            if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
                if (!visited[ny][nx] && maze[ny][nx] == 0) {
                    visited[ny][nx] = true;
                    q.push({nx, ny, dist + 1});
                }
            }
        }
    }

    std::cout << "✨ 미로 탈출 최단 거리: " << ans << "칸\\n";
    return 0;
}
`,
    },
  },
  {
    id: 'cpp-04-dp',
    title: '04. 다이나믹 프로그래밍 (DP & 0/1 Knapsack)',
    category: 'Systems & Native',
    language: 'cpp',
    engine: 'wasm',
    description: '0/1 Knapsack 배낭 DP 테이블 2차원 최적화',
    mainFile: 'main.cpp',
    tags: ['DP', 'Knapsack', 'Optimization'],
    files: {
      'main.cpp': `// ==========================================
// 🔵 [04] C++: 다이나믹 프로그래밍 (0/1 배낭)
// ==========================================
#include <iostream>
#include <vector>
#include <algorithm>

struct Item {
    std::string name;
    int weight;
    int value;
};

int main() {
    std::cout << "\\033[96m⚡ [DP] 0/1 Knapsack 배낭 문제 최적화\\033[0m\\n";
    std::cout << "------------------------------------------\\n";

    std::vector<Item> items = {
        {"노트북", 3, 50},
        {"카메라", 1, 40},
        {"스마트폰", 1, 30},
        {"보조배터리", 2, 20},
        {"헤드폰", 2, 35}
    };

    int capacity = 5;
    int n = items.size();
    std::vector<std::vector<int>> dp(n + 1, std::vector<int>(capacity + 1, 0));

    for (int i = 1; i <= n; i++) {
        int w = items[i - 1].weight;
        int v = items[i - 1].value;
        for (int cap = 0; cap <= capacity; cap++) {
            if (w <= cap) {
                dp[i][cap] = std::max(dp[i - 1][cap], dp[i - 1][cap - w] + v);
            } else {
                dp[i][cap] = dp[i - 1][cap];
            }
        }
    }

    std::cout << "✨ 배낭에 담을 수 있는 최대 가치: " << dp[n][capacity] << "만원\\n";
    return 0;
}
`,
    },
  },
  {
    id: 'cpp-05-binary-search',
    title: '05. 이진 탐색 & std::lower_bound',
    category: 'Systems & Native',
    language: 'cpp',
    engine: 'wasm',
    description: 'STL std::lower_bound 및 파라메트릭 서치(랜선 자르기)',
    mainFile: 'main.cpp',
    tags: ['Binary Search', 'lower_bound', 'Parametric Search'],
    files: {
      'main.cpp': `// ==========================================
// 🔵 [05] C++: 이진 탐색 & 파라메트릭 서치
// ==========================================
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::cout << "\\033[96m⚡ [Binary Search] 이진 탐색 & 파라메트릭 서치\\033[0m\\n";
    std::cout << "------------------------------------------\\n";

    std::vector<int> arr = {3, 7, 12, 19, 24, 38, 45, 56, 72, 88, 91};
    int target = 56;

    auto it = std::lower_bound(arr.begin(), arr.end(), target);
    if (it != arr.end() && *it == target) {
        std::cout << "타겟값 " << target << " 인덱스: " << (it - arr.begin()) << "\\n";
    }

    // 파라메트릭 서치
    std::vector<long long> cables = {802, 743, 457, 539};
    long long needed = 11;
    long long left = 1, right = 802, best = 0;

    while (left <= right) {
        long long mid = (left + right) / 2;
        long long count = 0;
        for (auto c : cables) count += c / mid;

        if (count >= needed) {
            best = mid;
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    std::cout << "✨ 만들 수 있는 최대 랜선 길이: " << best << "cm\\n";
    return 0;
}
`,
    },
  },
  {
    id: 'cpp-06-dijkstra',
    title: '06. 다익스트라 최단 경로 (std::priority_queue)',
    category: 'Systems & Native',
    language: 'cpp',
    engine: 'wasm',
    description: 'std::priority_queue를 이용한 가중치 그래프 다익스트라 최단 경로',
    mainFile: 'main.cpp',
    tags: ['Dijkstra', 'priority_queue', 'Graph'],
    files: {
      'main.cpp': `// ==========================================
// 🔵 [06] C++: 다익스트라 최단 경로
// ==========================================
#include <iostream>
#include <vector>
#include <queue>

const int INF = 1e9;

int main() {
    std::cout << "\\033[96m⚡ [Dijkstra] priority_queue 가중치 최단 경로\\033[0m\\n";
    std::cout << "------------------------------------------\\n";

    int n = 5;
    std::vector<std::vector<std::pair<int, int>>> adj(n + 1);
    adj[1].push_back({2, 4});
    adj[1].push_back({3, 2});
    adj[2].push_back({3, 1});
    adj[2].push_back({4, 5});
    adj[3].push_back({4, 8});
    adj[4].push_back({5, 2});

    std::vector<int> dist(n + 1, INF);
    std::priority_queue<std::pair<int, int>, std::vector<std::pair<int, int>>, std::greater<>> pq;

    dist[1] = 0;
    pq.push({0, 1});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();

        if (d > dist[u]) continue;

        for (auto [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }

    std::cout << "노드 1에서 노드 5까지의 최단 비용: " << dist[5] << "\\n";
    return 0;
}
`,
    },
  },
  {
    id: 'cpp-07-sorting',
    title: '07. 퀵 정렬 & std::sort (Sorting Algorithms)',
    category: 'Systems & Native',
    language: 'cpp',
    engine: 'wasm',
    description: '분할 정복 QuickSort 구현 및 C++ STL std::sort 비교',
    mainFile: 'main.cpp',
    tags: ['QuickSort', 'std::sort', 'Sorting'],
    files: {
      'main.cpp': `// ==========================================
// 🔵 [07] C++: 퀵 정렬 & std::sort
// ==========================================
#include <iostream>
#include <vector>
#include <algorithm>

void quickSort(std::vector<int>& arr, int low, int high) {
    if (low >= high) return;
    int pivot = arr[high];
    int i = low - 1;

    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            std::swap(arr[++i], arr[j]);
        }
    }
    std::swap(arr[i + 1], arr[high]);
    int p = i + 1;

    quickSort(arr, low, p - 1);
    quickSort(arr, p + 1, high);
}

int main() {
    std::cout << "\\033[96m⚡ [Sorting] 분할 정복 퀵 정렬\\033[0m\\n";
    std::cout << "------------------------------------------\\n";

    std::vector<int> numbers = {64, 34, 25, 12, 22, 11, 90, 88, 45, 50, 7};
    quickSort(numbers, 0, numbers.size() - 1);

    std::cout << "퀵 정렬 완료: ";
    for (int x : numbers) std::cout << x << " ";
    std::cout << "\\n";

    return 0;
}
`,
    },
  },
  {
    id: 'cpp-08-backtracking',
    title: '08. 백트래킹 (N-Queens 체스 퍼즐)',
    category: 'Systems & Native',
    language: 'cpp',
    engine: 'wasm',
    description: '재귀적 유망성 검사를 이용한 N-Queens 체스판 배치',
    mainFile: 'main.cpp',
    tags: ['Backtracking', 'N-Queens', 'Recursion'],
    files: {
      'main.cpp': `// ==========================================
// 🔵 [08] C++: 백트래킹 (N-Queens)
// ==========================================
#include <iostream>
#include <vector>
#include <cmath>

int countSolutions = 0;

bool isSafe(int row, int col, const std::vector<int>& board) {
    for (int r = 0; r < row; r++) {
        int c = board[r];
        if (c == col || std::abs(row - r) == std::abs(col - c)) {
            return false;
        }
    }
    return true;
}

void backtrack(int row, int N, std::vector<int>& board) {
    if (row == N) {
        countSolutions++;
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
    std::cout << "\\033[96m⚡ [Backtracking] N-Queens 체스판 배치\\033[0m\\n";
    std::cout << "------------------------------------------\\n";

    int N = 8;
    std::vector<int> board(N, -1);
    backtrack(0, N, board);

    std::cout << N << "x" << N << " 체스판 유효한 퀸 배치 해답 수: " << countSolutions << "가지\\n";
    return 0;
}
`,
    },
  },
  {
    id: 'cpp-09-two-pointers',
    title: '09. 투 포인터 & 슬라이딩 윈도우',
    category: 'Systems & Native',
    language: 'cpp',
    engine: 'wasm',
    description: '정렬 배열 Two Sum 및 고정 크기 슬라이딩 윈도우 O(N)',
    mainFile: 'main.cpp',
    tags: ['Two Pointers', 'Sliding Window', 'O(N)'],
    files: {
      'main.cpp': `// ==========================================
// 🔵 [09] C++: 투 포인터 & 슬라이딩 윈도우
// ==========================================
#include <iostream>
#include <vector>

int main() {
    std::cout << "\\033[96m⚡ [Two Pointers] 선형 시간 O(N) 탐색\\033[0m\\n";
    std::cout << "------------------------------------------\\n";

    std::vector<int> arr = {1, 2, 3, 4, 6, 8, 9, 11, 15};
    int target = 12;

    int left = 0, right = arr.size() - 1;
    std::cout << "Target " << target << " 일치 쌍:\\n";
    while (left < right) {
        int sum = arr[left] + arr[right];
        if (sum == target) {
            std::cout << "  ➜ (" << arr[left] << " + " << arr[right] << " = 12)\\n";
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
    id: 'cpp-10-greedy',
    title: '10. 그리디 알고리즘 (Greedy - 회의실 배정)',
    category: 'Systems & Native',
    language: 'cpp',
    engine: 'wasm',
    description: 'std::sort 종료 시간 오름차순 기반 Activity Selection 회의실 배정',
    mainFile: 'main.cpp',
    tags: ['Greedy', 'Activity Selection', 'Sorting'],
    files: {
      'main.cpp': `// ==========================================
// 🔵 [10] C++: 그리디 (회의실 배정)
// ==========================================
#include <iostream>
#include <vector>
#include <algorithm>

struct Meeting {
    std::string id;
    int start;
    int end;
};

int main() {
    std::cout << "\\033[96m⚡ [Greedy] 회의실 배정 (Activity Selection)\\033[0m\\n";
    std::cout << "------------------------------------------\\n";

    std::vector<Meeting> meetings = {
        {"M1", 1, 4}, {"M2", 3, 5}, {"M3", 0, 6}, {"M4", 5, 7},
        {"M5", 3, 8}, {"M6", 5, 9}, {"M7", 6, 10}, {"M8", 8, 11},
        {"M9", 8, 12}, {"M10", 12, 14}
    };

    std::sort(meetings.begin(), meetings.end(), [](const Meeting& a, const Meeting& b) {
        return a.end < b.end;
    });

    int count = 0;
    int lastEnd = 0;

    for (const auto& m : meetings) {
        if (m.start >= lastEnd) {
            count++;
            lastEnd = m.end;
            std::cout << "  ➜ " << m.id << ": " << m.start << "시 ~ " << m.end << "시\\n";
        }
    }

    std::cout << "✨ 배정 가능한 최대 회의 수: " << count << "개\\n";
    return 0;
}
`,
    },
  },
];
