import type { CodeTemplate } from '../../types';

// ----------------------------------------------------------------------

export const CSHARP_TEMPLATES: CodeTemplate[] = [
  {
    id: 'cs-01-hello-io',
    title: '01. Hello World & 표준 입출력 (I/O)',
    category: 'Backend & Scripting',
    language: 'csharp',
    engine: 'wasm',
    description: '.NET 8 / C# 12 최상위 문(Top-level statements) 및 Console 출력',
    mainFile: 'Program.cs',
    tags: ['C#', 'Hello World', 'Console', '.NET 8'],
    files: {
      'Program.cs': `// ==========================================
// 🟣 [01] C#: Hello World & 표준 입출력
// ==========================================
using System;

Console.WriteLine("\\033[96m✨ Hello from C# 12 (.NET 8 Wasm / Roslyn)!\\033[0m");
Console.WriteLine("------------------------------------------");

string clrVersion = Environment.Version.ToString();
string osVersion = Environment.OSVersion.ToString();

Console.WriteLine($"CLR 런타임 버전: {clrVersion}");
Console.WriteLine($"호스트 OS 환경: {osVersion}");
Console.WriteLine("C# 알고리즘 실행기 환경 준비 완료!");
`,
    },
  },
  {
    id: 'cs-02-dfs',
    title: '02. 깊이 우선 탐색 (DFS & 연결 요소)',
    category: 'Backend & Scripting',
    language: 'csharp',
    engine: 'wasm',
    description: 'Dictionary<int, List<int>> 기반 DFS 그래프 순회',
    mainFile: 'Program.cs',
    tags: ['DFS', 'Graph', 'Recursion'],
    files: {
      'Program.cs': `// ==========================================
// 🟣 [02] C#: 깊이 우선 탐색 (DFS)
// ==========================================
using System;
using System.Collections.Generic;

Console.WriteLine("\\033[96m⚡ [DFS] C# 딕셔너리 그래프 순회\\033[0m");
Console.WriteLine("------------------------------------------");

var graph = new Dictionary<int, List<int>>
{
    [1] = new() { 2, 3 },
    [2] = new() { 1, 4, 5 },
    [3] = new() { 1, 6 },
    [4] = new() { 2 },
    [5] = new() { 2 },
    [6] = new() { 3 },
    [7] = new() { 8 },
    [8] = new() { 7 }
};

var visited = new HashSet<int>();

void Dfs(int node)
{
    visited.Add(node);
    Console.Write($"{node} ");

    if (graph.TryGetValue(node, out var neighbors))
    {
        foreach (var next in neighbors)
        {
            if (!visited.Contains(next))
                Dfs(next);
        }
    }
}

Console.Write("노드 1 기준 DFS 순회: ");
Dfs(1);
Console.WriteLine();
`,
    },
  },
  {
    id: 'cs-03-bfs',
    title: '03. 너비 우선 탐색 (BFS & Queue<(int, int)>)',
    category: 'Backend & Scripting',
    language: 'csharp',
    engine: 'wasm',
    description: 'Queue 및 튜플 좌표계를 이용한 2D 미로 최단 거리 BFS',
    mainFile: 'Program.cs',
    tags: ['BFS', 'Queue', 'Shortest Path'],
    files: {
      'Program.cs': `// ==========================================
// 🟣 [03] C#: 너비 우선 탐색 (BFS) 최단 경로
// ==========================================
using System;
using System.Collections.Generic;

Console.WriteLine("\\033[96m⚡ [BFS] 2D 미로 최단 거리 탐색\\033[0m");
Console.WriteLine("------------------------------------------");

int[][] maze = [
    [0, 0, 1, 0, 0, 0],
    [1, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 1, 0],
    [0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0]
];

int H = maze.Length, W = maze[0].Length;
var visited = new bool[H, W];
var queue = new Queue<(int x, int y, int dist)>();

queue.Enqueue((0, 0, 1));
visited[0, 0] = true;

int[] dx = [0, 0, 1, -1];
int[] dy = [1, -1, 0, 0];
int ans = -1;

while (queue.Count > 0)
{
    var (x, y, dist) = queue.Dequeue();

    if (x == W - 1 && y == H - 1)
    {
        ans = dist;
        break;
    }

    for (int i = 0; i < 4; i++)
    {
        int nx = x + dx[i];
        int ny = y + dy[i];

        if (nx >= 0 && nx < W && ny >= 0 && ny < H)
        {
            if (!visited[ny, nx] && maze[ny][nx] == 0)
            {
                visited[ny, nx] = true;
                queue.Enqueue((nx, ny, dist + 1));
            }
        }
    }
}

Console.WriteLine($"✨ 미로 탈출 최단 거리: {ans}칸");
`,
    },
  },
  {
    id: 'cs-04-dp',
    title: '04. 다이나믹 프로그래밍 (DP & 0/1 Knapsack)',
    category: 'Backend & Scripting',
    language: 'csharp',
    engine: 'wasm',
    description: '0/1 Knapsack 배낭 DP 테이블 2차원 최적화',
    mainFile: 'Program.cs',
    tags: ['DP', 'Knapsack', 'Optimization'],
    files: {
      'Program.cs': `// ==========================================
// 🟣 [04] C#: 다이나믹 프로그래밍 (0/1 배낭)
// ==========================================
using System;

Console.WriteLine("\\033[96m⚡ [DP] 0/1 Knapsack 배낭 문제 최적화\\033[0m");
Console.WriteLine("------------------------------------------");

(string Name, int Weight, int Value)[] items = [
    ("노트북", 3, 50),
    ("카메라", 1, 40),
    ("스마트폰", 1, 30),
    ("보조배터리", 2, 20),
    ("헤드폰", 2, 35)
];

int capacity = 5;
int n = items.Length;
int[,] dp = new int[n + 1, capacity + 1];

for (int i = 1; i <= n; i++)
{
    int w = items[i - 1].Weight;
    int v = items[i - 1].Value;
    for (int cap = 0; cap <= capacity; cap++)
    {
        if (w <= cap)
            dp[i, cap] = Math.Max(dp[i - 1, cap], dp[i - 1, cap - w] + v);
        else
            dp[i, cap] = dp[i - 1, cap];
    }
}

Console.WriteLine($"✨ 배낭에 담을 수 있는 최대 가치: {dp[n, capacity]}만원");
`,
    },
  },
  {
    id: 'cs-05-binary-search',
    title: '05. 이진 탐색 & 파라메트릭 서치',
    category: 'Backend & Scripting',
    language: 'csharp',
    engine: 'wasm',
    description: 'Array.BinarySearch 및 파라메트릭 서치(랜선 자르기)',
    mainFile: 'Program.cs',
    tags: ['Binary Search', 'Parametric Search'],
    files: {
      'Program.cs': `// ==========================================
// 🟣 [05] C#: 이진 탐색 & 파라메트릭 서치
// ==========================================
using System;
using System.Linq;

Console.WriteLine("\\033[96m⚡ [Binary Search] 이진 탐색 & 파라메트릭 서치\\033[0m");
Console.WriteLine("------------------------------------------");

int[] arr = [3, 7, 12, 19, 24, 38, 45, 56, 72, 88, 91];
int target = 56;
int idx = Array.BinarySearch(arr, target);
Console.WriteLine($"타겟 {target} 위치 인덱스: {idx}");

// 파라메트릭 서치
long[] cables = [802, 743, 457, 539];
long needed = 11;
long left = 1, right = 802, best = 0;

while (left <= right)
{
    long mid = (left + right) / 2;
    long count = cables.Sum(c => c / mid);

    if (count >= needed)
    {
        best = mid;
        left = mid + 1;
    }
    else
    {
        right = mid - 1;
    }
}

Console.WriteLine($"✨ 만들 수 있는 최대 랜선 길이: {best}cm");
`,
    },
  },
  {
    id: 'cs-06-dijkstra',
    title: '06. 다익스트라 최단 경로 (PriorityQueue)',
    category: 'Backend & Scripting',
    language: 'csharp',
    engine: 'wasm',
    description: 'PriorityQueue<int, int>를 이용한 다익스트라 최단 경로',
    mainFile: 'Program.cs',
    tags: ['Dijkstra', 'PriorityQueue', 'Graph'],
    files: {
      'Program.cs': `// ==========================================
// 🟣 [06] C#: 다익스트라 최단 경로
// ==========================================
using System;
using System.Collections.Generic;

Console.WriteLine("\\033[96m⚡ [Dijkstra] PriorityQueue 가중치 최단 경로\\033[0m");
Console.WriteLine("------------------------------------------");

int n = 5;
var adj = new List<(int to, int cost)>[n + 1];
for (int i = 0; i <= n; i++) adj[i] = [];

adj[1].Add((2, 4));
adj[1].Add((3, 2));
adj[2].Add((3, 1));
adj[2].Add((4, 5));
adj[3].Add((4, 8));
adj[4].Add((5, 2));

var dist = new int[n + 1];
Array.Fill(dist, int.MaxValue);
dist[1] = 0;

var pq = new PriorityQueue<int, int>();
pq.Enqueue(1, 0);

while (pq.Count > 0)
{
    pq.TryDequeue(out int u, out int d);
    if (d > dist[u]) continue;

    foreach (var (v, cost) in adj[u])
    {
        if (dist[u] + cost < dist[v])
        {
            dist[v] = dist[u] + cost;
            pq.Enqueue(v, dist[v]);
        }
    }
}

Console.WriteLine($"노드 1에서 노드 5까지 최단 비용: {dist[5]}");
`,
    },
  },
  {
    id: 'cs-07-sorting',
    title: '07. 퀵 정렬 (QuickSort Algorithm)',
    category: 'Backend & Scripting',
    language: 'csharp',
    engine: 'wasm',
    description: '분할 정복 QuickSort 구현',
    mainFile: 'Program.cs',
    tags: ['QuickSort', 'Sorting'],
    files: {
      'Program.cs': `// ==========================================
// 🟣 [07] C#: 퀵 정렬
// ==========================================
using System;

void QuickSort(int[] arr, int low, int high)
{
    if (low >= high) return;
    int pivot = arr[high];
    int i = low - 1;

    for (int j = low; j < high; j++)
    {
        if (arr[j] < pivot)
        {
            (arr[++i], arr[j]) = (arr[j], arr[i]);
        }
    }
    (arr[i + 1], arr[high]) = (arr[high], arr[i + 1]);
    int p = i + 1;

    QuickSort(arr, low, p - 1);
    QuickSort(arr, p + 1, high);
}

Console.WriteLine("\\033[96m⚡ [Sorting] 분할 정복 퀵 정렬\\033[0m");
Console.WriteLine("------------------------------------------");

int[] numbers = [64, 34, 25, 12, 22, 11, 90, 88, 45, 50, 7];
QuickSort(numbers, 0, numbers.Length - 1);
Console.WriteLine($"정렬 결과: [{string.Join(", ", numbers)}]");
`,
    },
  },
  {
    id: 'cs-08-backtracking',
    title: '08. 백트래킹 (N-Queens 체스)',
    category: 'Backend & Scripting',
    language: 'csharp',
    engine: 'wasm',
    description: '재귀적 유망성 검사를 통한 N-Queens 해답 탐색',
    mainFile: 'Program.cs',
    tags: ['Backtracking', 'N-Queens'],
    files: {
      'Program.cs': `// ==========================================
// 🟣 [08] C#: 백트래킹 (N-Queens)
// ==========================================
using System;

int solutions = 0;

bool IsSafe(int row, int col, int[] board)
{
    for (int r = 0; r < row; r++)
    {
        int c = board[r];
        if (c == col || Math.Abs(row - r) == Math.Abs(col - c))
            return false;
    }
    return true;
}

void Backtrack(int row, int N, int[] board)
{
    if (row == N)
    {
        solutions++;
        return;
    }
    for (int col = 0; col < N; col++)
    {
        if (IsSafe(row, col, board))
        {
            board[row] = col;
            Backtrack(row + 1, N, board);
            board[row] = -1;
        }
    }
}

Console.WriteLine("\\033[96m⚡ [Backtracking] N-Queens 체스판 배치\\033[0m");
Console.WriteLine("------------------------------------------");

int N = 8;
int[] b = new int[N];
Array.Fill(b, -1);
Backtrack(0, N, b);

Console.WriteLine($"{N}x{N} 체스판 유효한 퀸 배치 해답: {solutions}가지");
`,
    },
  },
  {
    id: 'cs-09-two-pointers',
    title: '09. 투 포인터 & 슬라이딩 윈도우',
    category: 'Backend & Scripting',
    language: 'csharp',
    engine: 'wasm',
    description: 'Two Sum 투 포인터 탐색 O(N)',
    mainFile: 'Program.cs',
    tags: ['Two Pointers', 'O(N)'],
    files: {
      'Program.cs': `// ==========================================
// 🟣 [09] C#: 투 포인터 (Two Sum)
// ==========================================
using System;

Console.WriteLine("\\033[96m⚡ [Two Pointers] O(N) 선형 탐색\\033[0m");
Console.WriteLine("------------------------------------------");

int[] arr = [1, 2, 3, 4, 6, 8, 9, 11, 15];
int target = 12;

int left = 0, right = arr.Length - 1;
Console.WriteLine($"합이 {target}인 쌍:");
while (left < right)
{
    int sum = arr[left] + arr[right];
    if (sum == target)
    {
        Console.WriteLine($"  ➜ ({arr[left]} + {arr[right]} = 12)");
        left++;
        right--;
    }
    else if (sum < target)
    {
        left++;
    }
    else
    {
        right--;
    }
}
`,
    },
  },
  {
    id: 'cs-10-greedy',
    title: '10. 그리디 알고리즘 (Greedy - 회의실 배정)',
    category: 'Backend & Scripting',
    language: 'csharp',
    engine: 'wasm',
    description: '종료 시간 정렬 기반 회의실 최대 배정',
    mainFile: 'Program.cs',
    tags: ['Greedy', 'Activity Selection'],
    files: {
      'Program.cs': `// ==========================================
// 🟣 [10] C#: 그리디 (회의실 배정)
// ==========================================
using System;
using System.Collections.Generic;

Console.WriteLine("\\033[96m⚡ [Greedy] 회의실 배정 (Activity Selection)\\033[0m");
Console.WriteLine("------------------------------------------");

List<(string Id, int Start, int End)> meetings = [
    ("M1", 1, 4), ("M2", 3, 5), ("M3", 0, 6), ("M4", 5, 7),
    ("M5", 3, 8), ("M6", 5, 9), ("M7", 6, 10), ("M8", 8, 11),
    ("M9", 8, 12), ("M10", 12, 14)
];

meetings.Sort((a, b) => a.End.CompareTo(b.End));

int count = 0;
int lastEnd = 0;

foreach (var m in meetings)
{
    if (m.Start >= lastEnd)
    {
        count++;
        lastEnd = m.End;
        Console.WriteLine($"  ➜ {m.Id}: {m.Start}시 ~ {m.End}시");
    }
}

Console.WriteLine($"✨ 배정 가능한 최대 회의 수: {count}개");
`,
    },
  },
];
