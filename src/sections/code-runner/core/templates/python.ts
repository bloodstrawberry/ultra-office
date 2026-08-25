import type { CodeTemplate } from '../../types';

// ----------------------------------------------------------------------

export const PYTHON_TEMPLATES: CodeTemplate[] = [
  // --- [Part 1: 언어 기초 및 라이브러리 10선] ---
  {
    id: 'py-01-hello-world',
    title: '01. Hello World & 기본 입출력',
    category: 'Python',
    language: 'python',
    engine: 'pyodide',
    description: 'Python 3 f-string 서식화, 표준 출력 및 런타임 환경 정보',
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
    id: 'py-02-variables-types',
    title: '02. 변수, 자료형 & f-string 포맷팅',
    category: 'Python',
    language: 'python',
    engine: 'pyodide',
    description: 'int, float, bool, str, list, dict 원시/참조 타입 및 언패킹',
    mainFile: 'main.py',
    tags: ['Python', 'Types', 'Unpacking', 'f-string'],
    files: {
      'main.py': `# ==========================================
# 🐍 [02] Python: 변수와 자료형 & 구조 분해
# ==========================================

name = "홍길동"
age = 29
scores = [95, 88, 92, 100, 78]
meta = {"city": "서울", "role": "Python Developer"}

# 리스트 언패킹
first_score, *middle_scores, last_score = scores

print(f"이름: {name} (나이: {age}세)")
print(f"첫 시험 점수: {first_score}, 중간 점수들: {middle_scores}, 마지막 점수: {last_score}")
print(f"평균 점수: {sum(scores) / len(scores):.2f}점")
print(f"거주지: {meta.get('city', '미등록')}")
`,
    },
  },
  {
    id: 'py-03-list-comprehension',
    title: '03. 리스트 & 딕셔너리 컴프리헨션',
    category: 'Python',
    language: 'python',
    engine: 'pyodide',
    description: '파이써닉한 데이터 가공 문법 (조건부 필터링 및 변환)',
    mainFile: 'main.py',
    tags: ['Python', 'Comprehension', 'List', 'Dict'],
    files: {
      'main.py': `# ==========================================
# 🐍 [03] Python: 컴프리헨션(Comprehension)
# ==========================================

# 1. 1부터 20까지 짝수의 제곱 리스트
even_squares = [x**2 for x in range(1, 21) if x % 2 == 0]
print("[1] 짝수 제곱수 리스트:")
print(even_squares)

# 2. 딕셔너리 컴프리헨션
fruits = ["apple", "banana", "cherry", "dragonfruit", "elderberry"]
fruit_lengths = {f: len(f) for f in fruits if len(f) >= 6}
print("\\n[2] 길이가 6 이상인 과일 글자 수:")
print(fruit_lengths)
`,
    },
  },
  {
    id: 'py-04-functions-args',
    title: '04. 함수 가변 인자 (*args, **kwargs)',
    category: 'Python',
    language: 'python',
    engine: 'pyodide',
    description: '위치 가변 인자(*args), 키워드 가변 인자(**kwargs), 데코레이터 패턴',
    mainFile: 'main.py',
    tags: ['Python', 'Functions', 'args', 'kwargs', 'Decorator'],
    files: {
      'main.py': `# ==========================================
# 🐍 [04] Python: 함수 가변 인자 & 데코레이터
# ==========================================
import time

def timing_decorator(func):
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = (time.perf_counter() - start) * 1000
        print(f"  ⏱ [{func.__name__}] 실행 시간: {elapsed:.3f}ms")
        return result
    return wrapper

@timing_decorator
def calculate_statistics(*numbers, **options):
    multiplier = options.get("multiplier", 1)
    scaled = [n * multiplier for n in numbers]
    return {
        "count": len(scaled),
        "total": sum(scaled),
        "avg": sum(scaled) / len(scaled) if scaled else 0
    }

print("[가변 인자 통계 계산]")
res = calculate_statistics(10, 20, 30, 40, 50, multiplier=2)
print("결과:", res)
`,
    },
  },
  {
    id: 'py-05-oop-classes',
    title: '05. 객체 지향 (클래스 & 매직 메서드)',
    category: 'Python',
    language: 'python',
    engine: 'pyodide',
    description: '__init__, __str__, __repr__, __eq__, 상속 및 캡슐화',
    mainFile: 'main.py',
    tags: ['Python', 'OOP', 'Class', 'Magic Methods'],
    files: {
      'main.py': `# ==========================================
# 🐍 [05] Python: 객체 지향 프로그래밍 (OOP)
# ==========================================

class Vector2D:
    def __init__(self, x: float, y: float):
        self.x = x
        self.y = y

    def __add__(self, other):
        if isinstance(other, Vector2D):
            return Vector2D(self.x + other.x, self.y + other.y)
        raise TypeError("Vector2D끼리만 덧셈이 가능합니다.")

    def __repr__(self):
        return f"Vector2D(x={self.x}, y={self.y})"

    def magnitude(self) -> float:
        return (self.x**2 + self.y**2) ** 0.5

v1 = Vector2D(3, 4)
v2 = Vector2D(1, 2)
v3 = v1 + v2

print("v1:", v1, "| 크기:", v1.magnitude())
print("v2:", v2)
print("v1 + v2 덧셈 결과:", v3)
`,
    },
  },
  {
    id: 'py-06-exception-handling',
    title: '06. 예외 처리 & Custom Exception',
    category: 'Python',
    language: 'python',
    engine: 'pyodide',
    description: 'try-except-else-finally 구문 및 사용자 정의 예외 클래스',
    mainFile: 'main.py',
    tags: ['Python', 'Exception', 'try-except', 'Error'],
    files: {
      'main.py': `# ==========================================
# 🐍 [06] Python: 예외 처리와 Custom Exception
# ==========================================

class InsufficientBalanceError(Exception):
    def __init__(self, current: int, requested: int):
        super().__init__(f"잔액 부족 (현재 잔액: {current}원, 요청액: {requested}원)")
        self.current = current
        self.requested = requested

class BankWallet:
    def __init__(self, initial: int = 0):
        self.balance = initial

    def withdraw(self, amount: int):
        if amount > self.balance:
            raise InsufficientBalanceError(self.balance, amount)
        self.balance -= amount
        return self.balance

wallet = BankWallet(50000)

try:
    print("1. 30,000원 출금 시도...")
    wallet.withdraw(30000)
    print(f"  ➜ 출금 성공! 남은 잔액: {wallet.balance:,}원")

    print("\\n2. 40,000원 초과 출금 시도...")
    wallet.withdraw(40000)
except InsufficientBalanceError as e:
    print(f"\\033[91m  ❌ 출금 거절: {e}\\033[0m")
finally:
    print("\\n트랜잭션 세션이 안전하게 닫혔습니다.")
`,
    },
  },
  {
    id: 'py-07-regex-parsing',
    title: '07. 정규표현식(re) & 문자열 파싱',
    category: 'Python',
    language: 'python',
    engine: 'pyodide',
    description: 're.findall, re.sub, 그룹 캡처를 이용한 이메일/전화번호 마스킹',
    mainFile: 'main.py',
    tags: ['Python', 're', 'Regex', 'String'],
    files: {
      'main.py': `# ==========================================
# 🐍 [07] Python: 정규표현식 데이터 정제
# ==========================================
import re

text = """
[고객 센터 접수 목록]
- 김영희: 010-4455-6677 (younghee@company.co.kr)
- 박지훈: 010-8899-0011 (jihoon.park@service.io)
- 최유진: 02-778-9900 (yujin_choi@gmail.com)
"""

email_pattern = r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+"
phone_pattern = r"(?:010|02)-\\d{3,4}-\\d{4}"

emails = re.findall(email_pattern, text)
phones = re.findall(phone_pattern, text)

print("\\033[96m[1] 정규식 추출 결과\\033[0m")
print(f"• 추출된 이메일: {emails}")
print(f"• 추출된 연락처: {phones}")

# 휴대폰 번호 마스킹
masked_text = re.sub(r"(\\d{2,3})-(\\d{3,4})-(\\d{4})", r"\\1-****-\\3", text)
print("\\n\\033[96m[2] 마스킹 처리된 본문\\033[0m")
print(masked_text.strip())
`,
    },
  },
  {
    id: 'py-08-numpy-pandas',
    title: '08. NumPy & Pandas 데이터 분석',
    category: 'Python',
    language: 'python',
    engine: 'pyodide',
    description: 'DataFrame 생성, GroupBy 집계, 행렬 연산 및 기술 통계 분석',
    mainFile: 'main.py',
    tags: ['Python', 'NumPy', 'Pandas', 'Data Analysis'],
    files: {
      'main.py': `# ==========================================
# 🐍 [08] Python: NumPy & Pandas 데이터 분석
# ==========================================
import numpy as np
import pandas as pd

# 가상 매출 데이터프레임 생성
data = {
    "Department": ["IT", "IT", "HR", "Sales", "Sales", "IT", "HR"],
    "Employee": ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace"],
    "Salary": [7500, 6800, 5200, 6100, 7200, 8400, 5600],
    "ExperienceYears": [5, 4, 3, 4, 7, 9, 3]
}

df = pd.DataFrame(data)

print("\\033[96m[1] 원본 데이터프레임\\033[0m")
print(df)

print("\\n\\033[96m[2] 부서별 평균 급여 & 인원수 분석\\033[0m")
dept_stats = df.groupby("Department").agg(
    AvgSalary=("Salary", "mean"),
    TotalEmployees=("Employee", "count"),
    MaxExperience=("ExperienceYears", "max")
)
print(dept_stats)
`,
    },
  },
  {
    id: 'py-09-matplotlib-chart',
    title: '09. Matplotlib 그래프 시각화 (PNG 출력)',
    category: 'Python',
    language: 'python',
    engine: 'pyodide',
    description: 'Pyodide 가상 캔버스에서 다중 서브플롯 차트 렌더링 및 이미지 생성',
    mainFile: 'main.py',
    tags: ['Python', 'Matplotlib', 'Visualization', 'Charts'],
    files: {
      'main.py': `# ==========================================
# 🐍 [09] Python: Matplotlib 시각화 차트
# ==========================================
import matplotlib.pyplot as plt
import numpy as np

# 데이터 생성
x = np.linspace(0, 10, 100)
y1 = np.sin(x)
y2 = np.cos(x)

fig, ax = plt.subplots(figsize=(8, 4))
ax.plot(x, y1, label='Sin(x)', color='#38bdf8', lw=2)
ax.plot(x, y2, label='Cos(x)', color='#f43f5e', lw=2, linestyle='--')

ax.set_title('Trigonometric Waveforms (Pyodide Wasm)', fontsize=14, color='white')
ax.set_facecolor('#0f172a')
fig.patch.set_facecolor('#0f172a')
ax.tick_params(colors='white')
ax.legend(facecolor='#1e293b', edgecolor='none', labelcolor='white')
ax.grid(True, alpha=0.2)

plt.tight_layout()
plt.show()

print("✨ 차트가 에디터 우측 플롯 패널에 시각화되었습니다!")
`,
    },
  },
  {
    id: 'py-10-bst-tree',
    title: '10. 이진 탐색 트리 (Binary Search Tree)',
    category: 'Python',
    language: 'python',
    engine: 'pyodide',
    description: '이진 탐색 트리(BST) 삽입, 전위/중위/후위 순회 및 값 검색',
    mainFile: 'main.py',
    tags: ['Python', 'Data Structures', 'Tree', 'BST'],
    files: {
      'main.py': `# ==========================================
# 🐍 [10] Python: 이진 탐색 트리 (BST)
# ==========================================

class TreeNode:
    def __init__(self, val: int):
        self.val = val
        self.left = None
        self.right = None

class BST:
    def __init__(self):
        self.root = None

    def insert(self, val: int):
        if not self.root:
            self.root = TreeNode(val)
            return
        curr = self.root
        while True:
            if val < curr.val:
                if not curr.left:
                    curr.left = TreeNode(val)
                    break
                curr = curr.left
            else:
                if not curr.right:
                    curr.right = TreeNode(val)
                    break
                curr = curr.right

    def inorder(self, node, res=None):
        if res is None:
            res = []
        if node:
            self.inorder(node.left, res)
            res.append(node.val)
            self.inorder(node.right, res)
        return res

tree = BST()
for num in [50, 30, 70, 20, 40, 60, 80]:
    tree.insert(num)

print("중위 순회 (정렬된 결과):", tree.inorder(tree.root))
`,
    },
  },

  // --- [Part 2: 핵심 알고리즘 10선] ---
  {
    id: 'py-11-algo-dfs',
    title: '11. [알고리즘] 깊이 우선 탐색 (DFS & 연결 요소)',
    category: 'Python',
    language: 'python',
    engine: 'pyodide',
    description: '딕셔너리 그래프와 재귀를 이용한 DFS 탐색 및 독립 네트워크 개수 산출',
    mainFile: 'main.py',
    tags: ['DFS', 'Graph', 'Recursion', 'Connected Components'],
    files: {
      'main.py': `# ==========================================
# 🧠 [11] Python Algorithm: 깊이 우선 탐색 (DFS)
# ==========================================

print("\\033[96m⚡ [DFS] Depth-First Search 그래프 순회\\033[0m")
print("-" * 42)

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
    id: 'py-12-algo-bfs',
    title: '12. [알고리즘] 너비 우선 탐색 (BFS & 2D 최단 거리)',
    category: 'Python',
    language: 'python',
    engine: 'pyodide',
    description: 'collections.deque를 활용한 2D 미로 탈출 최단 거리 및 이동 경로 역추적',
    mainFile: 'main.py',
    tags: ['BFS', 'collections.deque', 'Shortest Path', 'Maze'],
    files: {
      'main.py': `# ==========================================
# 🧠 [12] Python Algorithm: 너비 우선 탐색 (BFS) 최단 경로
# ==========================================
from collections import deque

print("\\033[96m⚡ [BFS] 2D 미로 탈출 최단 거리 탐색\\033[0m")
print("-" * 42)

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
    id: 'py-13-algo-dp',
    title: '13. [알고리즘] 다이나믹 프로그래밍 (DP & 0/1 배낭)',
    category: 'Python',
    language: 'python',
    engine: 'pyodide',
    description: '0/1 Knapsack 배낭 DP 테이블 2차원 최적화 및 선택 물품 역추적',
    mainFile: 'main.py',
    tags: ['DP', 'Dynamic Programming', 'Knapsack', 'Optimization'],
    files: {
      'main.py': `# ==========================================
# 🧠 [13] Python Algorithm: 다이나믹 프로그래밍 (0/1 배낭)
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
    id: 'py-14-algo-binary-search',
    title: '14. [알고리즘] 이진 탐색 & 파라메트릭 서치',
    category: 'Python',
    language: 'python',
    engine: 'pyodide',
    description: 'bisect 라이브러리 및 최적화 결정 문제를 푸는 파라메트릭 서치(랜선 자르기)',
    mainFile: 'main.py',
    tags: ['Binary Search', 'Parametric Search', 'bisect'],
    files: {
      'main.py': `# ==========================================
# 🧠 [14] Python Algorithm: 이진 탐색 & 파라메트릭 서치
# ==========================================
import bisect

print("\\033[96m⚡ [Binary Search] 이진 탐색 알고리즘\\033[0m")
print("-" * 42)

arr = [3, 7, 12, 19, 24, 38, 45, 56, 72, 88, 91]
target = 56
idx = bisect.bisect_left(arr, target)
print(f"정렬 배열: {arr}")
print(f"  ➜ 타겟값 {target} 위치 인덱스: {idx}\\n")

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
    id: 'py-15-algo-dijkstra',
    title: '15. [알고리즘] 다익스트라 최단 경로 (heapq Priority Queue)',
    category: 'Python',
    language: 'python',
    engine: 'pyodide',
    description: 'heapq 우선순위 큐를 이용한 O((V+E) log V) 다익스트라 최단 경로',
    mainFile: 'main.py',
    tags: ['Dijkstra', 'heapq', 'Priority Queue', 'Graph'],
    files: {
      'main.py': `# ==========================================
# 🧠 [15] Python Algorithm: 다익스트라 최단 경로 (heapq)
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
    id: 'py-16-algo-sorting',
    title: '16. [알고리즘] 퀵 정렬 & 병합 정렬 (Sorting Algorithms)',
    category: 'Python',
    language: 'python',
    engine: 'pyodide',
    description: '리스트 컴프리헨션을 활용한 파이써닉 퀵 정렬 및 병합 정렬',
    mainFile: 'main.py',
    tags: ['QuickSort', 'MergeSort', 'Sorting'],
    files: {
      'main.py': `# ==========================================
# 🧠 [16] Python Algorithm: 퀵 정렬 & 병합 정렬
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
    id: 'py-17-algo-backtracking',
    title: '17. [알고리즘] 백트래킹 (N-Queens 체스 퍼즐)',
    category: 'Python',
    language: 'python',
    engine: 'pyodide',
    description: '유망성 검사를 통한 N-Queens 해답 탐색 및 체스판 시각화',
    mainFile: 'main.py',
    tags: ['Backtracking', 'N-Queens', 'Recursion'],
    files: {
      'main.py': `# ==========================================
# 🧠 [17] Python Algorithm: 백트래킹 (N-Queens)
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
    id: 'py-18-algo-two-pointers',
    title: '18. [알고리즘] 투 포인터 & 슬라이딩 윈도우',
    category: 'Python',
    language: 'python',
    engine: 'pyodide',
    description: 'Two Sum 투 포인터 및 고정 크기 슬라이딩 윈도우 최대 합',
    mainFile: 'main.py',
    tags: ['Two Pointers', 'Sliding Window', 'O(N)'],
    files: {
      'main.py': `# ==========================================
# 🧠 [18] Python Algorithm: 투 포인터 & 슬라이딩 윈도우
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
    id: 'py-19-algo-greedy',
    title: '19. [알고리즘] 그리디 알고리즘 (회의실 배정)',
    category: 'Python',
    language: 'python',
    engine: 'pyodide',
    description: '종료 시간 기준 정렬을 통한 Activity Selection 최적 회의실 배정',
    mainFile: 'main.py',
    tags: ['Greedy', 'Activity Selection', 'Scheduling'],
    files: {
      'main.py': `# ==========================================
# 🧠 [19] Python Algorithm: 그리디 (회의실 배정)
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
  {
    id: 'py-20-algo-trie-topo',
    title: '20. [알고리즘] 트라이 & 위상 정렬 (Trie & TopoSort)',
    category: 'Python',
    language: 'python',
    engine: 'pyodide',
    description: 'Trie 문자열 사전 검색 및 DAG 기반 위상 정렬',
    mainFile: 'main.py',
    tags: ['Trie', 'Topological Sort', 'DAG', 'Autocomplete'],
    files: {
      'main.py': `# ==========================================
# 🧠 [20] Python Algorithm: 트라이 & 위상 정렬
# ==========================================
from collections import defaultdict, deque

print("\\033[96m⚡ [1] Python Trie 접두사 자동완성\\033[0m")

class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str):
        curr = self.root
        for ch in word:
            if ch not in curr.children:
                curr.children[ch] = TrieNode()
            curr = curr.children[ch]
        curr.is_end = True

    def autocomplete(self, prefix: str):
        curr = self.root
        for ch in prefix:
            if ch not in curr.children:
                return []
            curr = curr.children[ch]

        results = []
        def dfs(node, word):
            if node.is_end:
                results.append(word)
            for ch, nxt in node.children.items():
                dfs(nxt, word + ch)

        dfs(curr, prefix)
        return results

trie = Trie()
for w in ["apple", "app", "application", "apply", "aptitude", "banana"]:
    trie.insert(w)

print("  🔍 'app' 자동완성:", trie.autocomplete("app"))

print("\\n\\033[96m⚡ [2] 위상 정렬 (Topological Sort)\\033[0m")
tasks = ["Lint", "Compile", "Test", "Bundle", "Deploy"]
deps = [
    ("Lint", "Compile"),
    ("Compile", "Test"),
    ("Compile", "Bundle"),
    ("Test", "Deploy"),
    ("Bundle", "Deploy")
]

in_degree = {t: 0 for t in tasks}
adj = defaultdict(list)
for u, v in deps:
    adj[u].append(v)
    in_degree[v] += 1

q = deque([t for t in tasks if in_degree[t] == 0])
order = []
while q:
    cur = q.popleft()
    order.append(cur)
    for nxt in adj[cur]:
        in_degree[nxt] -= 1
        if in_degree[nxt] == 0:
            q.append(nxt)

print("  ✨ 빌드 태스크 실행 순서:", " ➔ ".join(order))
`,
    },
  },
];
