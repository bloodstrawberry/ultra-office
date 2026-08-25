import type { CodeTemplate } from '../../types';

// ----------------------------------------------------------------------

export const PYTHON_TEMPLATES: CodeTemplate[] = [
  {
    id: 'py-01-hello-io',
    title: '01. Hello World & 표준 입출력 (I/O)',
    category: 'Python',
    language: 'python',
    engine: 'pyodide',
    description: 'Python 3 f-string 포맷팅 및 시스템 정보 표준 출력',
    mainFile: 'main.py',
    tags: ['Python', 'Hello World', 'I/O', 'f-string'],
    files: {
      'main.py': `# ==========================================
# 🐍 [01] Python: Hello World & 기본 입출력
# ==========================================
import sys
import platform

print("\\033[96m✨ Hello from Python 3 (Pyodide Wasm)!\\033[0m")
print("-" * 42)

print(f"파이썬 버전: {sys.version.split()[0]}")
print(f"플랫폼 아키텍처: {platform.machine()}")

def greet(name: str, score: int = 100) -> str:
    return f"환영합니다, {name}님! (알고리즘 점수: {score}점)"

print("\\n[인사말 출력]")
print(" ➜", greet("파이써니", 98))
print(" ➜", greet("알고리즘 마스터", 100))
`,
    },
  },
  {
    id: 'py-02-dfs',
    title: '02. 깊이 우선 탐색 (DFS & 연결 요소)',
    category: 'Python',
    language: 'python',
    engine: 'pyodide',
    description: '딕셔너리 그래프와 재귀를 이용한 DFS 탐색 및 독립 네트워크 개수 산출',
    mainFile: 'main.py',
    tags: ['DFS', 'Graph', 'Recursion', 'Connected Components'],
    files: {
      'main.py': `# ==========================================
# 🐍 [02] Python: 깊이 우선 탐색 (DFS)
# ==========================================

print("\\033[96m⚡ [DFS] Depth-First Search 그래프 순회\\033[0m")
print("-" * 42)

# 인접 리스트 그래프
graph = {
    1: [2, 3],
    2: [1, 4, 5],
    3: [1, 6],
    4: [2],
    5: [2],
    6: [3],
    7: [8],
    8: [7],
    9: []
}

visited = set()

def dfs(node, path=None):
    if path is None:
        path = []
    visited.add(node)
    path.append(node)

    for neighbor in graph.get(node, []):
        if neighbor not in visited:
            dfs(neighbor, path)
    return path

print("[1] 노드 1 기준 DFS 순회 경로:")
cluster1 = dfs(1)
print("  ➜", " ➔ ".join(map(str, cluster1)))

# 독립 연결 요소 분할
visited.clear()
components = []

for node in graph:
    if node not in visited:
        components.append(dfs(node))

print("\\n[2] 독립 연결 요소 분석:")
for idx, comp in enumerate(components, 1):
    print(f"  • 서브네트워크 #{idx} (노드 {len(comp)}개): {comp}")

print(f"\\n\\033[92m총 독립 네트워크 수: {len(components)}개\\033[0m")
`,
    },
  },
  {
    id: 'py-03-bfs',
    title: '03. 너비 우선 탐색 (BFS & 2D 최단 거리)',
    category: 'Python',
    language: 'python',
    engine: 'pyodide',
    description: 'collections.deque를 활용한 2D 미로 탈출 최단 거리 및 이동 경로 역추적',
    mainFile: 'main.py',
    tags: ['BFS', 'collections.deque', 'Shortest Path', 'Maze'],
    files: {
      'main.py': `# ==========================================
# 🐍 [03] Python: 너비 우선 탐색 (BFS) 최단 경로
# ==========================================
from collections import deque

print("\\033[96m⚡ [BFS] 2D 미로 탈출 최단 거리 탐색\\033[0m")
print("-" * 42)

# 0: 길, 1: 벽
maze = [
    [0, 0, 1, 0, 0, 0],
    [1, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 1, 0],
    [0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0],
]

H, W = len(maze), len(maze[0])

def solve_maze_bfs(start, end):
    queue = deque([(start[0], start[1], 1, [start])])
    visited = [[False] * W for _ in range(H)]
    visited[start[1]][start[0]] = True

    dx = [0, 0, 1, -1]
    dy = [1, -1, 0, 0]

    while queue:
        x, y, dist, path = queue.popleft()

        if (x, y) == end:
            return dist, path

        for i in range(4):
            nx, ny = x + dx[i], y + dy[i]
            if 0 <= nx < W and 0 <= ny < H:
                if not visited[ny][nx] and maze[ny][nx] == 0:
                    visited[ny][nx] = True
                    queue.append((nx, ny, dist + 1, path + [(nx, ny)]))
    return None

start = (0, 0)
end = (W - 1, H - 1)
res = solve_maze_bfs(start, end)

if res:
    dist, path = res
    print(f"\\033[92m✨ 최단 이동 거리: {dist}칸\\033[0m")
    print("이동 경로:")
    print(" ➔ ".join(str(pt) for pt in path))
`,
    },
  },
  {
    id: 'py-04-dp',
    title: '04. 다이나믹 프로그래밍 (DP & 0/1 배낭)',
    category: 'Python',
    language: 'python',
    engine: 'pyodide',
    description: '0/1 Knapsack 배낭 DP 테이블 2차원 최적화 및 선택 물품 역추적',
    mainFile: 'main.py',
    tags: ['DP', 'Dynamic Programming', 'Knapsack', 'Optimization'],
    files: {
      'main.py': `# ==========================================
# 🐍 [04] Python: 다이나믹 프로그래밍 (0/1 배낭)
# ==========================================

print("\\033[96m⚡ [DP] 0/1 Knapsack 배낭 문제 최적화\\033[0m")
print("-" * 42)

items = [
    {"name": "노트북", "weight": 3, "value": 50},
    {"name": "카메라", "weight": 1, "value": 40},
    {"name": "스마트폰", "weight": 1, "value": 30},
    {"name": "보조배터리", "weight": 2, "value": 20},
    {"name": "헤드폰", "weight": 2, "value": 35},
]

max_cap = 5

def knapsack_dp(items, capacity):
    n = len(items)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]

    for i in range(1, n + 1):
        wt = items[i - 1]["weight"]
        val = items[i - 1]["value"]
        for w in range(capacity + 1):
            if wt <= w:
                dp[i][w] = max(dp[i - 1][w], dp[i - 1][w - wt] + val)
            else:
                dp[i][w] = dp[i - 1][w]

    # 선택 물품 역추적
    selected = []
    curr_w = capacity
    for i in range(n, 0, -1):
        if dp[i][curr_w] != dp[i - 1][curr_w]:
            selected.append(items[i - 1])
            curr_w -= items[i - 1]["weight"]

    return dp[n][capacity], selected

max_val, chosen = knapsack_dp(items, max_cap)
print(f"배낭 최대 용량: {max_cap}kg")
print(f"\\033[92m✨ 담을 수 있는 최대 가치: {max_val}만원\\033[0m")
print("선택된 아이템:")
for it in chosen:
    print(f"  ➜ {it['name']} ({it['weight']}kg, {it['value']}만원)")
`,
    },
  },
  {
    id: 'py-05-binary-search',
    title: '05. 이진 탐색 & 파라메트릭 서치',
    category: 'Python',
    language: 'python',
    engine: 'pyodide',
    description: 'bisect 라이브러리 및 최적화 결정 문제를 푸는 파라메트릭 서치(랜선 자르기)',
    mainFile: 'main.py',
    tags: ['Binary Search', 'Parametric Search', 'bisect'],
    files: {
      'main.py': `# ==========================================
# 🐍 [05] Python: 이진 탐색 & 파라메트릭 서치
# ==========================================
import bisect

print("\\033[96m⚡ [Binary Search] 이진 탐색 알고리즘\\033[0m")
print("-" * 42)

# 1. bisect 이진 탐색
arr = [3, 7, 12, 19, 24, 38, 45, 56, 72, 88, 91]
target = 56
idx = bisect.bisect_left(arr, target)
print(f"정렬 배열: {arr}")
print(f"  ➜ 타겟값 {target} 위치 인덱스: {idx}\\n")

# 2. 파라메트릭 서치 (랜선 자르기)
cables = [802, 743, 457, 539]
needed = 11

def parametric_search(cables, needed):
    left, right = 1, max(cables)
    best = 0

    while left <= right:
        mid = (left + right) // 2
        count = sum(c // mid for c in cables)

        if count >= needed:
            best = mid
            left = mid + 1
        else:
            right = mid - 1
    return best

max_len = parametric_search(cables, needed)
print(f"[파라메트릭 서치 결과]")
print(f"\\033[92m  ✨ 만들 수 있는 최대 랜선 길이: {max_len}cm\\033[0m")
`,
    },
  },
  {
    id: 'py-06-dijkstra',
    title: '06. 다익스트라 최단 경로 (heapq Priority Queue)',
    category: 'Python',
    language: 'python',
    engine: 'pyodide',
    description: 'heapq 우선순위 큐를 이용한 O((V+E) log V) 다익스트라 최단 경로',
    mainFile: 'main.py',
    tags: ['Dijkstra', 'heapq', 'Priority Queue', 'Graph'],
    files: {
      'main.py': `# ==========================================
# 🐍 [06] Python: 다익스트라 최단 경로 (heapq)
# ==========================================
import heapq

print("\\033[96m⚡ [Dijkstra] heapq 기반 최단 경로\\033[0m")
print("-" * 42)

graph = {
    'A': [('B', 4), ('C', 2)],
    'B': [('C', 1), ('D', 5)],
    'C': [('B', 1), ('D', 8), ('E', 10)],
    'D': [('E', 2), ('Z', 6)],
    'E': [('D', 2), ('Z', 3)],
    'Z': []
}

def dijkstra(graph, start):
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    pq = [(0, start)]

    while pq:
        cur_dist, cur_node = heapq.heappop(pq)

        if cur_dist > distances[cur_node]:
            continue

        for neighbor, weight in graph[cur_node]:
            dist = cur_dist + weight
            if dist < distances[neighbor]:
                distances[neighbor] = dist
                heapq.heappush(pq, (dist, neighbor))

    return distances

dist = dijkstra(graph, 'A')
print("출발지 [A] 기준 각 노드별 최단 비용:")
for node, cost in dist.items():
    print(f"  • 목적지 [{node}]: {cost}")
`,
    },
  },
  {
    id: 'py-07-sorting',
    title: '07. 퀵 정렬 & 병합 정렬 (Sorting Algorithms)',
    category: 'Python',
    language: 'python',
    engine: 'pyodide',
    description: '리스트 컴프리헨션을 활용한 파이써닉 퀵 정렬 및 병합 정렬',
    mainFile: 'main.py',
    tags: ['QuickSort', 'MergeSort', 'Sorting'],
    files: {
      'main.py': `# ==========================================
# 🐍 [07] Python: 퀵 정렬 & 병합 정렬
# ==========================================

print("\\033[96m⚡ [Sorting] 분할 정복 정렬\\033[0m")
print("-" * 42)

def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    mid = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + mid + quick_sort(right)

numbers = [64, 34, 25, 12, 22, 11, 90, 88, 45, 50, 7]
print("원본 리스트:", numbers)
print("\\033[92m퀵 정렬 결과:", quick_sort(numbers), "\\033[0m")
`,
    },
  },
  {
    id: 'py-08-backtracking',
    title: '08. 백트래킹 (N-Queens 체스 퍼즐)',
    category: 'Python',
    language: 'python',
    engine: 'pyodide',
    description: '유망성 검사를 통한 N-Queens 해답 탐색 및 체스판 시각화',
    mainFile: 'main.py',
    tags: ['Backtracking', 'N-Queens', 'Recursion'],
    files: {
      'main.py': `# ==========================================
# 🐍 [08] Python: 백트래킹 (N-Queens)
# ==========================================

print("\\033[96m⚡ [Backtracking] N-Queens 퍼즐\\033[0m")
print("-" * 42)

def solve_n_queens(N):
    solutions = []
    board = [-1] * N

    def is_safe(row, col):
        for r in range(row):
            c = board[r]
            if c == col or abs(row - r) == abs(col - c):
                return False
        return True

    def backtrack(row):
        if row == N:
            solutions.append(list(board))
            return
        for col in range(N):
            if is_safe(row, col):
                board[row] = col
                backtrack(row + 1)
                board[row] = -1

    backtrack(0)
    return solutions

N = 4
sols = solve_n_queens(N)
print(f"{N}x{N} 유효한 퀸 배치 해답: {len(sols)}가지\\n")
for idx, sol in enumerate(sols, 1):
    print(f"[해답 #{idx}]")
    for r in range(N):
        print("  " + "".join(" 👑" if sol[r] == c else " ⬜" for c in range(N)))
    print()
`,
    },
  },
  {
    id: 'py-09-two-pointers',
    title: '09. 투 포인터 & 슬라이딩 윈도우 (Two Pointers)',
    category: 'Python',
    language: 'python',
    engine: 'pyodide',
    description: 'Two Sum 투 포인터 및 고정 크기 슬라이딩 윈도우 최대 합',
    mainFile: 'main.py',
    tags: ['Two Pointers', 'Sliding Window', 'O(N)'],
    files: {
      'main.py': `# ==========================================
# 🐍 [09] Python: 투 포인터 & 슬라이딩 윈도우
# ==========================================

print("\\033[96m⚡ [Two Pointers] O(N) 고속 선형 탐색\\033[0m")
print("-" * 42)

def two_sum_sorted(arr, target):
    l, r = 0, len(arr) - 1
    pairs = []
    while l < r:
        s = arr[l] + arr[r]
        if s == target:
            pairs.append((arr[l], arr[r]))
            l += 1
            r -= 1
        elif s < target:
            l += 1
        else:
            r -= 1
    return pairs

nums = [1, 2, 3, 4, 6, 8, 9, 11, 15]
target = 12
print("정렬 리스트:", nums)
print("합이 12인 쌍:", two_sum_sorted(nums, target))
`,
    },
  },
  {
    id: 'py-10-greedy',
    title: '10. 그리디 알고리즘 (Greedy - 회의실 배정)',
    category: 'Python',
    language: 'python',
    engine: 'pyodide',
    description: '종료 시간 기준 정렬을 통한 Activity Selection 최적 회의실 배정',
    mainFile: 'main.py',
    tags: ['Greedy', 'Activity Selection', 'Scheduling'],
    files: {
      'main.py': `# ==========================================
# 🐍 [10] Python: 그리디 (회의실 배정)
# ==========================================

print("\\033[96m⚡ [Greedy] 회의실 배정 (Activity Selection)\\033[0m")
print("-" * 42)

meetings = [
    {"id": "M1", "start": 1, "end": 4},
    {"id": "M2", "start": 3, "end": 5},
    {"id": "M3", "start": 0, "end": 6},
    {"id": "M4", "start": 5, "end": 7},
    {"id": "M5", "start": 3, "end": 8},
    {"id": "M6", "start": 5, "end": 9},
    {"id": "M7", "start": 6, "end": 10},
    {"id": "M8", "start": 8, "end": 11},
    {"id": "M9", "start": 8, "end": 12},
    {"id": "M10", "start": 12, "end": 14},
]

def schedule_meetings(meetings):
    sorted_m = sorted(meetings, key=lambda x: (x["end"], x["start"]))
    selected = []
    last_end = 0

    for m in sorted_m:
        if m["start"] >= last_end:
            selected.append(m)
            last_end = m["end"]
    return selected

chosen = schedule_meetings(meetings)
print(f"신청 회의: {len(meetings)}개 ➜ 배정 성공: {len(chosen)}개")
for m in chosen:
    print(f"  ➜ {m['id']}: {m['start']}시 ~ {m['end']}시 ({m['end'] - m['start']}시간)")
`,
    },
  },
];
