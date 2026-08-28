import type { CodeTemplate } from '../../types';

// ----------------------------------------------------------------------

export const CSHARP_TEMPLATES: CodeTemplate[] = [
  // --- [Part 1: 언어 문법 및 LINQ 10선] ---
  {
    id: 'cs-01-hello-world',
    title: '01. Hello World & 최상위 문 (Top-level)',
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
    id: 'cs-02-pattern-matching',
    title: '02. 패턴 매칭 (Pattern Matching is/switch)',
    category: 'Backend & Scripting',
    language: 'csharp',
    engine: 'wasm',
    description: '위치 패턴, 속성 패턴, 관계형 패턴 매칭',
    mainFile: 'Program.cs',
    tags: ['C#', 'Pattern Matching', 'switch', 'is'],
    files: {
      'Program.cs': `// ==========================================
// 🟣 [02] C#: Modern 패턴 매칭
// ==========================================
using System;

string GetWaterState(int temp) => temp switch
{
    <= 0 => "얼음 (Solid)",
    > 0 and < 100 => "물 (Liquid)",
    >= 100 => "수증기 (Gas)"
};

Console.WriteLine($"영하 5도: {GetWaterState(-5)}");
Console.WriteLine($"영상 25도: {GetWaterState(25)}");
Console.WriteLine($"120도: {GetWaterState(120)}");
`,
    },
  },
  {
    id: 'cs-03-records-immutability',
    title: '03. Record 불변 레코드 & with 표현식',
    category: 'Backend & Scripting',
    language: 'csharp',
    engine: 'wasm',
    description: 'record struct / class 불변성 및 비파괴적 변이(with)',
    mainFile: 'Program.cs',
    tags: ['C#', 'Record', 'Immutability', 'with'],
    files: {
      'Program.cs': `// ==========================================
// 🟣 [03] C#: Record & with 표현식
// ==========================================
using System;

public record UserProfile(string Username, string Email, int Level);

var user1 = new UserProfile("alice", "alice@dotnet.org", 3);
var user2 = user1 with { Level = 4 };

Console.WriteLine($"User 1: {user1}");
Console.WriteLine($"User 2 (레벨업): {user2}");
Console.WriteLine($"동등성 비교 (user1 == user2): {user1 == user2}");
`,
    },
  },
  {
    id: 'cs-04-linq-queries',
    title: '04. LINQ 쿼리 표현식 & 람다 체이닝',
    category: 'Backend & Scripting',
    language: 'csharp',
    engine: 'wasm',
    description: 'Where, Select, GroupBy, OrderBy LINQ 쿼리 파이프라인',
    mainFile: 'Program.cs',
    tags: ['C#', 'LINQ', 'Lambda', 'Functional'],
    files: {
      'Program.cs': `// ==========================================
// 🟣 [04] C#: LINQ 데이터 파이프라인
// ==========================================
using System;
using System.Linq;
using System.Collections.Generic;

var products = new[]
{
    new { Name = "노트북", Category = "IT", Price = 1500000 },
    new { Name = "키보드", Category = "IT", Price = 120000 },
    new { Name = "커피머신", Category = "가전", Price = 280000 },
    new { Name = "모니터", Category = "IT", Price = 450000 }
};

var itProducts = products
    .Where(p => p.Category == "IT" && p.Price >= 200000)
    .OrderByDescending(p => p.Price)
    .Select(p => $"{p.Name} ({p.Price:N0}원)");

Console.WriteLine("고가 IT 제품:");
foreach (var p in itProducts)
{
    Console.WriteLine($"  • {p}");
}
`,
    },
  },
  {
    id: 'cs-05-generics-collections',
    title: '05. 제네릭 컬렉션 (Dictionary, HashSet)',
    category: 'Backend & Scripting',
    language: 'csharp',
    engine: 'wasm',
    description: 'Dictionary<TKey, TValue> 및 HashSet<T> 고속 검색',
    mainFile: 'Program.cs',
    tags: ['C#', 'Generics', 'Dictionary', 'HashSet'],
    files: {
      'Program.cs': `// ==========================================
// 🟣 [05] C#: 제네릭 컬렉션
// ==========================================
using System;
using System.Collections.Generic;

var dict = new Dictionary<string, int>
{
    ["C#"] = 12,
    ["TypeScript"] = 5,
    ["Python"] = 3
};

dict["Rust"] = 1;

foreach (var (lang, ver) in dict)
{
    Console.WriteLine($"  • {lang} ➔ Major Ver: {ver}");
}
`,
    },
  },
  {
    id: 'cs-06-async-await-tasks',
    title: '06. 비동기 Task & async/await',
    category: 'Backend & Scripting',
    language: 'csharp',
    engine: 'wasm',
    description: 'Task.WhenAll 병렬 비동기 요청 처리',
    mainFile: 'Program.cs',
    tags: ['C#', 'Async', 'Task', 'async/await'],
    files: {
      'Program.cs': `// ==========================================
// 🟣 [06] C#: Task & async/await
// ==========================================
using System;
using System.Threading.Tasks;

async Task<string> FetchDataAsync(string source, int delayMs)
{
    await Task.Delay(delayMs);
    return $"[{source}] 데이터 수신 완료 ({delayMs}ms)";
}

Console.WriteLine("병렬 비동기 작업 개시...");
var t1 = FetchDataAsync("AuthService", 100);
var t2 = FetchDataAsync("DataService", 200);

var results = await Task.WhenAll(t1, t2);
foreach (var r in results) Console.WriteLine(r);
`,
    },
  },
  {
    id: 'cs-07-exception-handling',
    title: '07. 예외 처리 & Exception Filters',
    category: 'Backend & Scripting',
    language: 'csharp',
    engine: 'wasm',
    description: 'try-catch-when 조건부 예외 필터링',
    mainFile: 'Program.cs',
    tags: ['C#', 'Exception', 'when filter'],
    files: {
      'Program.cs': `// ==========================================
// 🟣 [07] C#: 조건부 예외 필터 (when)
// ==========================================
using System;

void Validate(int code)
{
    if (code == 404) throw new HttpRequestException("Resource Not Found", null, System.Net.HttpStatusCode.NotFound);
    if (code >= 500) throw new HttpRequestException("Server Error", null, System.Net.HttpStatusCode.InternalServerError);
}

try
{
    Validate(404);
}
catch (HttpRequestException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
{
    Console.WriteLine("\\033[93m404 Not Found 감지: 대체 리소스 요청\\033[0m");
}
`,
    },
  },
  {
    id: 'cs-08-tuples-deconstruction',
    title: '08. 튜플(Tuple) & 분해 할당(Deconstruction)',
    category: 'Backend & Scripting',
    language: 'csharp',
    engine: 'wasm',
    description: '위치 튜플 (int, int), 명명 튜플 및 분해 문법',
    mainFile: 'Program.cs',
    tags: ['C#', 'Tuple', 'Deconstruction'],
    files: {
      'Program.cs': `// ==========================================
// 🟣 [08] C#: 튜플 & 분해 할당
// ==========================================
using System;

(int Min, int Max, double Avg) GetStats(int[] numbers)
{
    int min = int.MaxValue, max = int.MinValue, sum = 0;
    foreach (var n in numbers)
    {
        if (n < min) min = n;
        if (n > max) max = n;
        sum += n;
    }
    return (min, max, (double)sum / numbers.Length);
}

var data = new[] { 10, 45, 23, 89, 56, 12 };
var (min, max, avg) = GetStats(data);
Console.WriteLine($"통계 분석 ➔ 최소: {min}, 최대: {max}, 평균: {avg:F2}");
`,
    },
  },
  {
    id: 'cs-09-span-memory',
    title: '09. 고성능 메모리 Span<T> & ReadOnlySpan',
    category: 'Backend & Scripting',
    language: 'csharp',
    engine: 'wasm',
    description: '힙 할당 없는 슬라이싱(Zero-allocation Memory Slice)',
    mainFile: 'Program.cs',
    tags: ['C#', 'Span<T>', 'High Performance', 'Memory'],
    files: {
      'Program.cs': `// ==========================================
// 🟣 [09] C#: Span<T> 고성능 메모리 슬라이스
// ==========================================
using System;

ReadOnlySpan<char> logLine = "2026-08-25|INFO|UserAuthenticationSuccess".AsSpan();

var date = logLine.Slice(0, 10);
var level = logLine.Slice(11, 4);
var message = logLine.Slice(16);

Console.WriteLine($"날짜: {date.ToString()}");
Console.WriteLine($"등급: {level.ToString()}");
Console.WriteLine($"메시지: {message.ToString()}");
`,
    },
  },
  {
    id: 'cs-10-bst-tree',
    title: '10. 이진 탐색 트리 (BST 자료구조)',
    category: 'Backend & Scripting',
    language: 'csharp',
    engine: 'wasm',
    description: 'C# 객체 기반 이진 탐색 트리(Binary Search Tree) 구현',
    mainFile: 'Program.cs',
    tags: ['C#', 'BST', 'Tree', 'Data Structures'],
    files: {
      'Program.cs': `// ==========================================
// 🟣 [10] C#: 이진 탐색 트리 (BST)
// ==========================================
using System;

class TreeNode
{
    public int Val;
    public TreeNode? Left, Right;
    public TreeNode(int v) => Val = v;
}

class BST
{
    public TreeNode? Root;
    public void Insert(int val)
    {
        Root = InsertRec(Root, val);
    }
    private TreeNode InsertRec(TreeNode? node, int val)
    {
        if (node == null) return new TreeNode(val);
        if (val < node.Val) node.Left = InsertRec(node.Left, val);
        else node.Right = InsertRec(node.Right, val);
        return node;
    }
    public void Inorder(TreeNode? node)
    {
        if (node == null) return;
        Inorder(node.Left);
        Console.Write($"{node.Val} ");
        Inorder(node.Right);
    }
}

var bst = new BST();
foreach (var x in new[] { 50, 30, 70, 20, 40, 60, 80 }) bst.Insert(x);

Console.Write("BST 중위 순회 (정렬 출력): ");
bst.Inorder(bst.Root);
Console.WriteLine();
`,
    },
  },

  // --- [Part 2: 핵심 알고리즘 10선] ---
  {
    id: 'cs-11-algo-dfs',
    title: '11. [알고리즘] 깊이 우선 탐색 (DFS & 연결 요소)',
    category: 'Backend & Scripting',
    language: 'csharp',
    engine: 'wasm',
    description: 'Dictionary<int, List<int>> 기반 DFS 그래프 순회',
    mainFile: 'Program.cs',
    tags: ['DFS', 'Graph', 'Recursion'],
    files: {
      'Program.cs': `// ==========================================
// 🧠 [11] C# Algorithm: 깊이 우선 탐색 (DFS)
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
    id: 'cs-12-algo-bfs',
    title: '12. [알고리즘] 너비 우선 탐색 (BFS & Queue<(int, int)>)',
    category: 'Backend & Scripting',
    language: 'csharp',
    engine: 'wasm',
    description: 'Queue 및 튜플 좌표계를 이용한 2D 미로 최단 거리 BFS',
    mainFile: 'Program.cs',
    tags: ['BFS', 'Queue', 'Shortest Path'],
    files: {
      'Program.cs': `// ==========================================
// 🧠 [12] C# Algorithm: 너비 우선 탐색 (BFS) 최단 경로
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
    id: 'cs-13-algo-dp',
    title: '13. [알고리즘] 다이나믹 프로그래밍 (DP & 0/1 Knapsack)',
    category: 'Backend & Scripting',
    language: 'csharp',
    engine: 'wasm',
    description: '0/1 Knapsack 배낭 DP 테이블 2차원 최적화',
    mainFile: 'Program.cs',
    tags: ['DP', 'Knapsack', 'Optimization'],
    files: {
      'Program.cs': `// ==========================================
// 🧠 [13] C# Algorithm: 다이나믹 프로그래밍 (0/1 배낭)
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
    id: 'cs-14-algo-binary-search',
    title: '14. [알고리즘] 이진 탐색 & 파라메트릭 서치',
    category: 'Backend & Scripting',
    language: 'csharp',
    engine: 'wasm',
    description: 'Array.BinarySearch 및 파라메트릭 서치(랜선 자르기)',
    mainFile: 'Program.cs',
    tags: ['Binary Search', 'Parametric Search'],
    files: {
      'Program.cs': `// ==========================================
// 🧠 [14] C# Algorithm: 이진 탐색 & 파라메트릭 서치
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
    id: 'cs-15-algo-dijkstra',
    title: '15. [알고리즘] 다익스트라 최단 경로 (PriorityQueue)',
    category: 'Backend & Scripting',
    language: 'csharp',
    engine: 'wasm',
    description: 'PriorityQueue<int, int>를 이용한 다익스트라 최단 경로',
    mainFile: 'Program.cs',
    tags: ['Dijkstra', 'PriorityQueue', 'Graph'],
    files: {
      'Program.cs': `// ==========================================
// 🧠 [15] C# Algorithm: 다익스트라 최단 경로
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
    id: 'cs-16-algo-sorting',
    title: '16. [알고리즘] 퀵 정렬 (QuickSort Algorithm)',
    category: 'Backend & Scripting',
    language: 'csharp',
    engine: 'wasm',
    description: '분할 정복 QuickSort 구현',
    mainFile: 'Program.cs',
    tags: ['QuickSort', 'Sorting'],
    files: {
      'Program.cs': `// ==========================================
// 🧠 [16] C# Algorithm: 퀵 정렬
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
    id: 'cs-17-algo-backtracking',
    title: '17. [알고리즘] 백트래킹 (N-Queens 체스)',
    category: 'Backend & Scripting',
    language: 'csharp',
    engine: 'wasm',
    description: '재귀적 유망성 검사를 통한 N-Queens 해답 탐색',
    mainFile: 'Program.cs',
    tags: ['Backtracking', 'N-Queens'],
    files: {
      'Program.cs': `// ==========================================
// 🧠 [17] C# Algorithm: 백트래킹 (N-Queens)
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
    id: 'cs-18-algo-two-pointers',
    title: '18. [알고리즘] 투 포인터 & 슬라이딩 윈도우',
    category: 'Backend & Scripting',
    language: 'csharp',
    engine: 'wasm',
    description: 'Two Sum 투 포인터 탐색 O(N)',
    mainFile: 'Program.cs',
    tags: ['Two Pointers', 'O(N)'],
    files: {
      'Program.cs': `// ==========================================
// 🧠 [18] C# Algorithm: 투 포인터 (Two Sum)
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
    id: 'cs-19-algo-greedy',
    title: '19. [알고리즘] 그리디 알고리즘 (회의실 배정)',
    category: 'Backend & Scripting',
    language: 'csharp',
    engine: 'wasm',
    description: '종료 시간 정렬 기반 회의실 최대 배정',
    mainFile: 'Program.cs',
    tags: ['Greedy', 'Activity Selection'],
    files: {
      'Program.cs': `// ==========================================
// 🧠 [19] C# Algorithm: 그리디 (회의실 배정)
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
  {
    id: 'cs-20-algo-trie-topo',
    title: '20. [알고리즘] 트라이 & 위상 정렬 (Trie & TopoSort)',
    category: 'Backend & Scripting',
    language: 'csharp',
    engine: 'wasm',
    description: '트라이 사전 검색 및 진입차수(In-degree) 기반 위상 정렬',
    mainFile: 'Program.cs',
    tags: ['Trie', 'Topological Sort', 'DAG'],
    files: {
      'Program.cs': `// ==========================================
// 🧠 [20] C# Algorithm: 트라이 & 위상 정렬
// ==========================================
using System;
using System.Collections.Generic;

Console.WriteLine("\\033[96m⚡ [1] C# Trie 접두사 트리\\033[0m");
class TrieNode
{
    public Dictionary<char, TrieNode> Children = new();
    public bool IsEnd;
}

var root = new TrieNode();
foreach (var w in new[] { "apple", "app", "application", "banana" })
{
    var cur = root;
    foreach (var c in w)
    {
        if (!cur.Children.ContainsKey(c)) cur.Children[c] = new();
        cur = cur.Children[c];
    }
    cur.IsEnd = true;
}
Console.WriteLine("  Trie 단어 사전 구축 완료 (apple, app, application, banana)");

Console.WriteLine("\\n\\033[96m⚡ [2] 위상 정렬 (Topological Sort)\\033[0m");
int n = 5;
var adj = new List<int>[n + 1];
for (int i = 0; i <= n; i++) adj[i] = [];
var inDegree = new int[n + 1];

void AddEdge(int u, int v)
{
    adj[u].Add(v);
    inDegree[v]++;
}

AddEdge(1, 2); AddEdge(2, 3); AddEdge(2, 4); AddEdge(3, 5); AddEdge(4, 5);

var q = new Queue<int>();
for (int i = 1; i <= n; i++) if (inDegree[i] == 0) q.Enqueue(i);

Console.Write("  ✨ 빌드 순서: ");
while (q.Count > 0)
{
    int cur = q.Dequeue();
    Console.Write($"{cur} ➔ ");
    foreach (var nxt in adj[cur])
    {
        if (--inDegree[nxt] == 0) q.Enqueue(nxt);
    }
}
Console.WriteLine("Done");
`,
    },
  },
  {
    id: 'cs-21-linq-records-pattern-matching',
    title: '21. [라이브러리] C# LINQ & Records (패턴 매칭 & 그룹 집계)',
    category: 'Backend & Scripting',
    language: 'csharp',
    engine: 'wasm',
    description:
      'C# 10+ record 불변 객체, LINQ(GroupBy, Select, OrderByDescending) 및 switch 패턴 매칭',
    mainFile: 'Program.cs',
    tags: ['C#', '.NET', 'LINQ', 'Records', 'Pattern Matching'],
    files: {
      'Program.cs': `// ==========================================
// 🔷 [21] C#: Records & LINQ 데이터 집계
// ==========================================
using System;
using System.Collections.Generic;
using System.Linq;

// C# 불변 레코드 타입
public record Transaction(string Id, string User, string Category, int Amount);

public class Program
{
    public static void Main()
    {
        Console.WriteLine("\\033[96m✨ [C# LINQ & Records] 트랜잭션 집계 파이프라인\\033[0m");
        Console.WriteLine("------------------------------------------");

        var transactions = new List<Transaction>
        {
            new("TX101", "김철수", "IT", 150000),
            new("TX102", "이영희", "도서", 25000),
            new("TX103", "김철수", "IT", 320000),
            new("TX104", "박지훈", "식품", 48000),
            new("TX105", "이영희", "IT", 89000),
            new("TX106", "최유진", "도서", 18000)
        };

        // 1. LINQ 카테고리별 그룹 집계
        var categorySummary = transactions
            .GroupBy(t => t.Category)
            .Select(g => new
            {
                Category = g.Key,
                Count = g.Count(),
                TotalAmount = g.Sum(t => t.Amount)
            })
            .OrderByDescending(x => x.TotalAmount);

        Console.WriteLine("[1] 카테고리별 매출 집계 (LINQ GroupBy):");
        foreach (var item in categorySummary)
        {
            Console.WriteLine($"  • {item.Category,-6}: 총 {item.Count}건 | 합계: {item.TotalAmount:N0}원");
        }

        // 2. LINQ 사용자별 최대 결제액
        var topUser = transactions
            .GroupBy(t => t.User)
            .Select(g => new { User = g.Key, TotalSpent = g.Sum(t => t.Amount) })
            .OrderByDescending(x => x.TotalSpent)
            .First();

        Console.WriteLine($"\\n[2] VIP 고객 선정:");
        Console.WriteLine($"  ➜ \\033[92m{topUser.User}\\033[0m님 (총 결제액: {topUser.TotalSpent:N0}원)");
    }
}
`,
    },
  },
];
