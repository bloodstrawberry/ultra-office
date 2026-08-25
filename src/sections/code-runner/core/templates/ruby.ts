import type { CodeTemplate } from '../../types';

// ----------------------------------------------------------------------

export const RUBY_TEMPLATES: CodeTemplate[] = [
  // --- [Part 1: 언어 문법 및 블록 10선] ---
  {
    id: 'ruby-01-hello-world',
    title: '01. Hello World & puts 입출력',
    category: 'Backend & Scripting',
    language: 'ruby',
    engine: 'ruby',
    description: 'Ruby 3.3 puts 및 문자열 보간 표준 출력',
    mainFile: 'main.rb',
    tags: ['Ruby', 'Hello World', 'puts'],
    files: {
      'main.rb': `# ==========================================
# 💎 [01] Ruby: Hello World & 기본 입출력
# ==========================================

puts "\\033[96m✨ Hello from Ruby 3.3 (CRuby Wasm)!\\033[0m"
puts "------------------------------------------"
puts "루비 런타임 버전: #{RUBY_VERSION}"
puts "플랫폼: #{RUBY_PLATFORM}"
puts "객체 지향 & 알고리즘 스크립트 실행 환경 준비 완료"
`,
    },
  },
  {
    id: 'ruby-02-variables-symbols',
    title: '02. 변수, 심볼(:symbol) & 문자열',
    category: 'Backend & Scripting',
    language: 'ruby',
    engine: 'ruby',
    description: '지역 변수, 불변 심볼(:name), 동적 문자열 메서드',
    mainFile: 'main.rb',
    tags: ['Ruby', 'Variables', 'Symbols', 'String'],
    files: {
      'main.rb': `# ==========================================
# 💎 [02] Ruby: 심볼과 문자열
# ==========================================

user = {
  name: "루비 개발자",
  role: :fullstack,
  skills: [:ruby, :rails, :wasm]
}

puts "이름: #{user[:name]}"
puts "직무 심볼: #{user[:role]} (object_id: #{user[:role].object_id})"
puts "기술 스택: #{user[:skills].map(&:to_s).join(', ')}"
`,
    },
  },
  {
    id: 'ruby-03-blocks-iterators',
    title: '03. 블록(Block), each & times 이터레이터',
    category: 'Backend & Scripting',
    language: 'ruby',
    engine: 'ruby',
    description: 'do..end / {...} 블록, yield 및 내장 이터레이터',
    mainFile: 'main.rb',
    tags: ['Ruby', 'Blocks', 'each', 'times', 'yield'],
    files: {
      'main.rb': `# ==========================================
# 💎 [03] Ruby: 블록과 이터레이터
# ==========================================

puts "[1] times 이터레이터:"
3.times { |i| puts "  반복 #{i + 1}회차" }

puts "\\n[2] each 배열 순회:"
["Apple", "Banana", "Cherry"].each_with_index do |fruit, idx|
  puts "  #{idx + 1}. #{fruit}"
end
`,
    },
  },
  {
    id: 'ruby-04-enumerable-methods',
    title: '04. Enumerable 파이프라인 (map, select, reduce)',
    category: 'Backend & Scripting',
    language: 'ruby',
    engine: 'ruby',
    description: '함수형 데이터 가공: select, map, inject(reduce), partition',
    mainFile: 'main.rb',
    tags: ['Ruby', 'Enumerable', 'map', 'select', 'reduce'],
    files: {
      'main.rb': `# ==========================================
# 💎 [04] Ruby: Enumerable 파이프라인
# ==========================================

numbers = (1..10).to_a
evens_squared = numbers.select(&:even?).map { |n| n ** 2 }
sum = evens_squared.reduce(0, :+)

puts "1~10 짝수 제곱: #{evens_squared.inspect}"
puts "제곱수 총합: #{sum}"
`,
    },
  },
  {
    id: 'ruby-05-oop-classes',
    title: '05. 객체 지향 (Class & attr_accessor)',
    category: 'Backend & Scripting',
    language: 'ruby',
    engine: 'ruby',
    description: '인스턴스 변수(@), attr_accessor, 상속(<) 및 메서드 오버라이딩',
    mainFile: 'main.rb',
    tags: ['Ruby', 'OOP', 'Class', 'attr_accessor'],
    files: {
      'main.rb': `# ==========================================
# 💎 [05] Ruby: 클래스와 객체 지향
# ==========================================

class BankAccount
  attr_reader :owner, :balance

  def initialize(owner, initial_deposit = 0)
    @owner = owner
    @balance = initial_deposit
  end

  def deposit(amount)
    @balance += amount
    @balance
  end

  def to_s
    "#{@owner}님의 계좌 잔액: #{@balance}원"
  end
end

account = BankAccount.new("홍길동", 50000)
account.deposit(25000)
puts account
`,
    },
  },
  {
    id: 'ruby-06-modules-mixins',
    title: '06. 모듈(Module) & 믹스인(Mixin)',
    category: 'Backend & Scripting',
    language: 'ruby',
    engine: 'ruby',
    description: 'include / extend 믹스인을 통한 다중 행동 합성',
    mainFile: 'main.rb',
    tags: ['Ruby', 'Module', 'Mixin', 'include'],
    files: {
      'main.rb': `# ==========================================
# 💎 [06] Ruby: 모듈과 믹스인
# ==========================================

module Loggable
  def log(msg)
    puts "[LOG] #{Time.now.strftime('%H:%M:%S')} - #{msg}"
  end
end

class PaymentGateway
  include Loggable

  def charge(amount)
    log("#{amount}원 결제 요청 승인")
  end
end

gw = PaymentGateway.new
gw.charge(120000)
`,
    },
  },
  {
    id: 'ruby-07-exception-handling',
    title: '07. 예외 처리 (begin..rescue..ensure)',
    category: 'Backend & Scripting',
    language: 'ruby',
    engine: 'ruby',
    description: 'rescue StandardError => e, raise 및 ensure 정리',
    mainFile: 'main.rb',
    tags: ['Ruby', 'Exception', 'rescue', 'ensure'],
    files: {
      'main.rb': `# ==========================================
# 💎 [07] Ruby: 예외 처리
# ==========================================

def divide(a, b)
  raise ArgumentError, "0으로 나눌 수 없습니다." if b == 0
  a / b
end

begin
  puts "10 / 2 = #{divide(10, 2)}"
  puts "10 / 0 = #{divide(10, 0)}"
rescue ArgumentError => e
  puts "\\033[91m예외 감지: #{e.message}\\033[0m"
ensure
  puts "작업 완료 (ensure)"
end
`,
    },
  },
  {
    id: 'ruby-08-procs-lambdas',
    title: '08. Proc & Lambda 익명 함수',
    category: 'Backend & Scripting',
    language: 'ruby',
    engine: 'ruby',
    description: 'Proc vs Lambda 차이점(인자 검사, return 스코프)',
    mainFile: 'main.rb',
    tags: ['Ruby', 'Proc', 'Lambda', 'Closures'],
    files: {
      'main.rb': `# ==========================================
# 💎 [08] Ruby: Proc vs Lambda
# ==========================================

my_lambda = ->(x, y) { x * y + 10 }
puts "Lambda 호출 (5, 4): #{my_lambda.call(5, 4)}"

multiplier = ->(factor) { ->(n) { n * factor } }
triple = multiplier.call(3)
puts "클로저 triple(7): #{triple.call(7)}"
`,
    },
  },
  {
    id: 'ruby-09-regex-scan',
    title: '09. 정규표현식(Regexp) & scan',
    category: 'Backend & Scripting',
    language: 'ruby',
    engine: 'ruby',
    description: '패턴 매칭, scan, gsub를 이용한 텍스트 파싱',
    mainFile: 'main.rb',
    tags: ['Ruby', 'Regexp', 'scan', 'gsub'],
    files: {
      'main.rb': `# ==========================================
# 💎 [09] Ruby: 정규표현식
# ==========================================

log = "2026-08-25 [WARN] dev@test.co.kr (code: 404), admin@system.io (code: 200)"
emails = log.scan(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+/)
codes = log.scan(/code:\\s*(\\d+)/).flatten

puts "추출된 이메일: #{emails.inspect}"
puts "추출된 상태코드: #{codes.inspect}"
`,
    },
  },
  {
    id: 'ruby-10-bst-tree',
    title: '10. 이진 탐색 트리 (BST 자료구조)',
    category: 'Backend & Scripting',
    language: 'ruby',
    engine: 'ruby',
    description: '루비 객체 지향 이진 탐색 트리 구현',
    mainFile: 'main.rb',
    tags: ['Ruby', 'BST', 'Tree', 'Data Structures'],
    files: {
      'main.rb': `# ==========================================
# 💎 [10] Ruby: 이진 탐색 트리 (BST)
# ==========================================

class TreeNode
  attr_accessor :val, :left, :right
  def initialize(val)
    @val = val
    @left = nil
    @right = nil
  end
end

class BST
  attr_accessor :root

  def insert(val)
    @root = insert_rec(@root, val)
  end

  def insert_rec(node, val)
    return TreeNode.new(val) if node.nil?
    if val < node.val
      node.left = insert_rec(node.left, val)
    else
      node.right = insert_rec(node.right, val)
    end
    node
  end

  def inorder(node, res = [])
    return res if node.nil?
    inorder(node.left, res)
    res << node.val
    inorder(node.right, res)
    res
  end
end

tree = BST.new
[50, 30, 70, 20, 40, 60, 80].each { |x| tree.insert(x) }
puts "BST 중위 순회 (정렬 출력): #{tree.inorder(tree.root).inspect}"
`,
    },
  },

  // --- [Part 2: 핵심 알고리즘 10선] ---
  {
    id: 'ruby-11-algo-dfs',
    title: '11. [알고리즘] 깊이 우선 탐색 (DFS & 연결 요소)',
    category: 'Backend & Scripting',
    language: 'ruby',
    engine: 'ruby',
    description: 'Hash 인접 리스트 기반 재귀 DFS 그래프 순회',
    mainFile: 'main.rb',
    tags: ['DFS', 'Graph', 'Recursion'],
    files: {
      'main.rb': `# ==========================================
# 🧠 [11] Ruby Algorithm: 깊이 우선 탐색 (DFS)
# ==========================================
require 'set'

puts "\\033[96m⚡ [DFS] Ruby 해시 기반 그래프 순회\\033[0m"
puts "------------------------------------------"

graph = {
  1 => [2, 3],
  2 => [1, 4, 5],
  3 => [1, 6],
  4 => [2],
  5 => [2],
  6 => [3],
  7 => [8],
  8 => [7]
}

visited = Set.new
traversal = []

dfs = ->(node) {
  visited.add(node)
  traversal << node
  (graph[node] || []).each do |nxt|
    dfs.call(nxt) unless visited.include?(nxt)
  end
}

dfs.call(1)
puts "노드 1 기준 DFS 순회: #{traversal.join(' ➔ ')}"
`,
    },
  },
  {
    id: 'ruby-12-algo-bfs',
    title: '12. [알고리즘] 너비 우선 탐색 (BFS & 2D 최단 경로)',
    category: 'Backend & Scripting',
    language: 'ruby',
    engine: 'ruby',
    description: '배열 큐를 활용한 2D 미로 탈출 최단 거리 BFS',
    mainFile: 'main.rb',
    tags: ['BFS', 'Queue', 'Shortest Path'],
    files: {
      'main.rb': `# ==========================================
# 🧠 [12] Ruby Algorithm: 너비 우선 탐색 (BFS) 최단 경로
# ==========================================

puts "\\033[96m⚡ [BFS] 2D 미로 최단 거리 탐색\\033[0m"
puts "------------------------------------------"

maze = [
  [0, 0, 1, 0, 0, 0],
  [1, 0, 1, 0, 1, 0],
  [0, 0, 0, 0, 1, 0],
  [0, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0]
]

h, w = maze.length, maze[0].length
visited = Array.new(h) { Array.new(w, false) }
queue = [[0, 0, 1]]
visited[0][0] = true

dx = [0, 0, 1, -1]
dy = [1, -1, 0, 0]
ans = -1

while !queue.empty?
  x, y, dist = queue.shift

  if x == w - 1 && y == h - 1
    ans = dist
    break
  end

  4.times do |i|
    nx = x + dx[i]
    ny = y + dy[i]
    if nx >= 0 && nx < w && ny >= 0 && ny < h
      if !visited[ny][nx] && maze[ny][nx] == 0
        visited[ny][nx] = true
        queue << [nx, ny, dist + 1]
      end
    end
  end
end

puts "✨ 미로 탈출 최단 거리: #{ans}칸"
`,
    },
  },
  {
    id: 'ruby-13-algo-dp',
    title: '13. [알고리즘] 다이나믹 프로그래밍 (DP & 0/1 배낭)',
    category: 'Backend & Scripting',
    language: 'ruby',
    engine: 'ruby',
    description: '0/1 Knapsack 배낭 DP 테이블 2차원 최적화',
    mainFile: 'main.rb',
    tags: ['DP', 'Knapsack', 'Optimization'],
    files: {
      'main.rb': `# ==========================================
# 🧠 [13] Ruby Algorithm: 다이나믹 프로그래밍 (0/1 배낭)
# ==========================================

puts "\\033[96m⚡ [DP] 0/1 Knapsack 배낭 문제 최적화\\033[0m"
puts "------------------------------------------"

items = [
  { name: "노트북", weight: 3, value: 50 },
  { name: "카메라", weight: 1, value: 40 },
  { name: "스마트폰", weight: 1, value: 30 },
  { name: "보조배터리", weight: 2, value: 20 },
  { name: "헤드폰", weight: 2, value: 35 }
]

capacity = 5
n = items.length
dp = Array.new(n + 1) { Array.new(capacity + 1, 0) }

(1..n).each do |i|
  w = items[i - 1][:weight]
  v = items[i - 1][:value]
  (0..capacity).each do |cap|
    if w <= cap
      dp[i][cap] = [dp[i - 1][cap], dp[i - 1][cap - w] + v].max
    else
      dp[i][cap] = dp[i - 1][cap]
    end
  end
end

puts "✨ 배낭에 담을 수 있는 최대 가치: #{dp[n][capacity]}만원"
`,
    },
  },
  {
    id: 'ruby-14-algo-binary-search',
    title: '14. [알고리즘] 이진 탐색 & bsearch',
    category: 'Backend & Scripting',
    language: 'ruby',
    engine: 'ruby',
    description: 'bsearch 및 파라메트릭 서치(랜선 자르기)',
    mainFile: 'main.rb',
    tags: ['Binary Search', 'bsearch'],
    files: {
      'main.rb': `# ==========================================
# 🧠 [14] Ruby Algorithm: 이진 탐색 & 파라메트릭 서치
# ==========================================

puts "\\033[96m⚡ [Binary Search] 이진 탐색 & 파라메트릭 서치\\033[0m"
puts "------------------------------------------"

arr = [3, 7, 12, 19, 24, 38, 45, 56, 72, 88, 91]
target = 56
found = arr.bsearch { |x| target <=> x }
puts "탐색된 값: #{found}"

# 파라메트릭 서치
cables = [802, 743, 457, 539]
needed = 11
left, right = 1, 802
best = 0

while left <= right
  mid = (left + right) / 2
  count = cables.sum { |c| c / mid }

  if count >= needed
    best = mid
    left = mid + 1
  else
    right = mid - 1
  end
end

puts "✨ 만들 수 있는 최대 랜선 길이: #{best}cm"
`,
    },
  },
  {
    id: 'ruby-15-algo-dijkstra',
    title: '15. [알고리즘] 다익스트라 최단 경로 (Dijkstra Algorithm)',
    category: 'Backend & Scripting',
    language: 'ruby',
    engine: 'ruby',
    description: '가중치 해시 그래프 기반 최단 경로 산출',
    mainFile: 'main.rb',
    tags: ['Dijkstra', 'Graph'],
    files: {
      'main.rb': `# ==========================================
# 🧠 [15] Ruby Algorithm: 다익스트라 최단 경로
# ==========================================

puts "\\033[96m⚡ [Dijkstra] 가중치 최단 경로\\033[0m"
puts "------------------------------------------"

graph = {
  'A' => [{ to: 'B', cost: 4 }, { to: 'C', cost: 2 }],
  'B' => [{ to: 'C', cost: 1 }, { to: 'D', cost: 5 }],
  'C' => [{ to: 'B', cost: 1 }, { to: 'D', cost: 8 }, { to: 'E', cost: 10 }],
  'D' => [{ to: 'E', cost: 2 }, { to: 'Z', cost: 6 }],
  'E' => [{ to: 'D', cost: 2 }, { to: 'Z', cost: 3 }],
  'Z' => []
}

dist = Hash.new(Float::INFINITY)
dist['A'] = 0
unvisited = graph.keys.to_set

while !unvisited.empty?
  curr = unvisited.min_by { |n| dist[n] }
  break if dist[curr] == Float::INFINITY
  unvisited.delete(curr)

  graph[curr].each do |edge|
    if dist[curr] + edge[:cost] < dist[edge[:to]]
      dist[edge[:to]] = dist[curr] + edge[:cost]
    end
  end
end

puts "출발지 [A] 기준 최단 비용: Z ➔ #{dist['Z']}"
`,
    },
  },
  {
    id: 'ruby-16-algo-sorting',
    title: '16. [알고리즘] 퀵 정렬 (QuickSort Algorithm)',
    category: 'Backend & Scripting',
    language: 'ruby',
    engine: 'ruby',
    description: '분할 정복 QuickSort 구현',
    mainFile: 'main.rb',
    tags: ['QuickSort', 'Sorting'],
    files: {
      'main.rb': `# ==========================================
# 🧠 [16] Ruby Algorithm: 퀵 정렬
# ==========================================

def quick_sort(arr)
  return arr if arr.length <= 1
  pivot = arr[arr.length / 2]
  left = arr.select { |x| x < pivot }
  mid = arr.select { |x| x == pivot }
  right = arr.select { |x| x > pivot }
  quick_sort(left) + mid + quick_sort(right)
end

puts "\\033[96m⚡ [Sorting] 분할 정복 퀵 정렬\\033[0m"
puts "------------------------------------------"

numbers = [64, 34, 25, 12, 22, 11, 90, 88, 45, 50, 7]
puts "정렬 결과: #{quick_sort(numbers).inspect}"
`,
    },
  },
  {
    id: 'ruby-17-algo-backtracking',
    title: '17. [알고리즘] 백트래킹 (N-Queens 체스)',
    category: 'Backend & Scripting',
    language: 'ruby',
    engine: 'ruby',
    description: '재귀적 유망성 검사를 통한 N-Queens 해답 탐색',
    mainFile: 'main.rb',
    tags: ['Backtracking', 'N-Queens'],
    files: {
      'main.rb': `# ==========================================
# 🧠 [17] Ruby Algorithm: 백트래킹 (N-Queens)
# ==========================================

solutions = 0

is_safe = ->(row, col, board) {
  row.times do |r|
    c = board[r]
    return false if c == col || (row - r).abs == (col - c).abs
  end
  true
}

backtrack = ->(row, n, board) {
  if row == n
    solutions += 1
    return
  end
  n.times do |col|
    if is_safe.call(row, col, board)
      board[row] = col
      backtrack.call(row + 1, n, board)
      board[row] = -1
    end
  end
}

puts "\\033[96m⚡ [Backtracking] N-Queens 체스판 배치\\033[0m"
puts "------------------------------------------"

n = 8
board = Array.new(n, -1)
backtrack.call(0, n, board)
puts "#{n}x#{n} 체스판 유효한 퀸 배치 해답: #{solutions}가지"
`,
    },
  },
  {
    id: 'ruby-18-algo-two-pointers',
    title: '18. [알고리즘] 투 포인터 & 슬라이딩 윈도우',
    category: 'Backend & Scripting',
    language: 'ruby',
    engine: 'ruby',
    description: 'Two Sum 투 포인터 선형 시간 탐색 O(N)',
    mainFile: 'main.rb',
    tags: ['Two Pointers', 'O(N)'],
    files: {
      'main.rb': `# ==========================================
# 🧠 [18] Ruby Algorithm: 투 포인터 (Two Sum)
# ==========================================

puts "\\033[96m⚡ [Two Pointers] O(N) 선형 탐색\\033[0m"
puts "------------------------------------------"

arr = [1, 2, 3, 4, 6, 8, 9, 11, 15]
target = 12
l, r = 0, arr.length - 1

puts "합이 #{target}인 쌍:"
while l < r
  sum = arr[l] + arr[r]
  if sum == target
    puts "  ➜ (#{arr[l]} + #{arr[r]} = 12)"
    l += 1
    r -= 1
  elsif sum < target
    l += 1
  else
    r -= 1
  end
end
`,
    },
  },
  {
    id: 'ruby-19-algo-greedy',
    title: '19. [알고리즘] 그리디 알고리즘 (회의실 배정)',
    category: 'Backend & Scripting',
    language: 'ruby',
    engine: 'ruby',
    description: '종료 시간 정렬 기반 회의실 최대 배정',
    mainFile: 'main.rb',
    tags: ['Greedy', 'Activity Selection'],
    files: {
      'main.rb': `# ==========================================
# 🧠 [19] Ruby Algorithm: 그리디 (회의실 배정)
# ==========================================

puts "\\033[96m⚡ [Greedy] 회의실 배정 (Activity Selection)\\033[0m"
puts "------------------------------------------"

meetings = [
  { id: "M1", start: 1, end: 4 }, { id: "M2", start: 3, end: 5 },
  { id: "M3", start: 0, end: 6 }, { id: "M4", start: 5, end: 7 },
  { id: "M5", start: 3, end: 8 }, { id: "M6", start: 5, end: 9 },
  { id: "M7", start: 6, end: 10 }, { id: "M8", start: 8, end: 11 },
  { id: "M9", start: 8, end: 12 }, { id: "M10", start: 12, end: 14 }
]

sorted = meetings.sort_by { |m| m[:end] }
count = 0
last_end = 0

sorted.each do |m|
  if m[:start] >= last_end
    count += 1
    last_end = m[:end]
    puts "  ➜ #{m[:id]}: #{m[:start]}시 ~ #{m[:end]}시"
  end
end

puts "✨ 배정 가능한 최대 회의 수: #{count}개"
`,
    },
  },
  {
    id: 'ruby-20-algo-trie-topo',
    title: '20. [알고리즘] 트라이 & 위상 정렬 (Trie & TopoSort)',
    category: 'Backend & Scripting',
    language: 'ruby',
    engine: 'ruby',
    description: '트라이 사전 검색 및 진입차수(In-degree) 기반 위상 정렬',
    mainFile: 'main.rb',
    tags: ['Trie', 'Topological Sort', 'DAG'],
    files: {
      'main.rb': `# ==========================================
# 🧠 [20] Ruby Algorithm: 트라이 & 위상 정렬
# ==========================================

puts "\\033[96m⚡ [1] Ruby Trie 접두사 트리\\033[0m"
class TrieNode
  attr_accessor :children, :is_end
  def initialize
    @children = {}
    @is_end = false
  end
end

root = TrieNode.new
["apple", "app", "application", "banana"].each do |word|
  cur = root
  word.each_char do |ch|
    cur.children[ch] ||= TrieNode.new
    cur = cur.children[ch]
  end
  cur.is_end = true
end
puts "  단어 사전 삽입 완료 (apple, app, application, banana)"

puts "\\n\\033[96m⚡ [2] 위상 정렬 (Topological Sort)\\033[0m"
n = 5
adj = Hash.new { |h, k| h[k] = [] }
in_degree = Hash.new(0)
(1..n).each { |i| in_degree[i] = 0 }

add_edge = ->(u, v) {
  adj[u] << v
  in_degree[v] += 1
}

add_edge.call(1, 2); add_edge.call(2, 3); add_edge.call(2, 4); add_edge.call(3, 5); add_edge.call(4, 5)

q = (1..n).select { |i| in_degree[i] == 0 }
order = []

while !q.empty?
  cur = q.shift
  order << cur
  adj[cur].each do |nxt|
    in_degree[nxt] -= 1
    q << nxt if in_degree[nxt] == 0
  end
end

puts "  ✨ 빌드 순서: #{order.join(' ➔ ')}"
`,
    },
  },
];
