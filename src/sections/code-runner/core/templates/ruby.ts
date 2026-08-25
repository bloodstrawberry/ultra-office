import type { CodeTemplate } from '../../types';

// ----------------------------------------------------------------------

export const RUBY_TEMPLATES: CodeTemplate[] = [
  {
    id: 'ruby-01-hello-io',
    title: '01. Hello World & 표준 입출력 (I/O)',
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
    id: 'ruby-02-dfs',
    title: '02. 깊이 우선 탐색 (DFS & 연결 요소)',
    category: 'Backend & Scripting',
    language: 'ruby',
    engine: 'ruby',
    description: 'Hash 인접 리스트 기반 재귀 DFS 그래프 순회',
    mainFile: 'main.rb',
    tags: ['DFS', 'Graph', 'Recursion'],
    files: {
      'main.rb': `# ==========================================
# 💎 [02] Ruby: 깊이 우선 탐색 (DFS)
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
    id: 'ruby-03-bfs',
    title: '03. 너비 우선 탐색 (BFS & 2D 최단 경로)',
    category: 'Backend & Scripting',
    language: 'ruby',
    engine: 'ruby',
    description: '배열 큐를 활용한 2D 미로 탈출 최단 거리 BFS',
    mainFile: 'main.rb',
    tags: ['BFS', 'Queue', 'Shortest Path'],
    files: {
      'main.rb': `# ==========================================
# 💎 [03] Ruby: 너비 우선 탐색 (BFS) 최단 경로
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
    id: 'ruby-04-dp',
    title: '04. 다이나믹 프로그래밍 (DP & 0/1 배낭)',
    category: 'Backend & Scripting',
    language: 'ruby',
    engine: 'ruby',
    description: '0/1 Knapsack 배낭 DP 테이블 2차원 최적화',
    mainFile: 'main.rb',
    tags: ['DP', 'Knapsack', 'Optimization'],
    files: {
      'main.rb': `# ==========================================
# 💎 [04] Ruby: 다이나믹 프로그래밍 (0/1 배낭)
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
    id: 'ruby-05-binary-search',
    title: '05. 이진 탐색 & bsearch',
    category: 'Backend & Scripting',
    language: 'ruby',
    engine: 'ruby',
    description: 'bsearch 및 파라메트릭 서치(랜선 자르기)',
    mainFile: 'main.rb',
    tags: ['Binary Search', 'bsearch'],
    files: {
      'main.rb': `# ==========================================
# 💎 [05] Ruby: 이진 탐색 & 파라메트릭 서치
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
    id: 'ruby-06-dijkstra',
    title: '06. 다익스트라 최단 경로 (Dijkstra Algorithm)',
    category: 'Backend & Scripting',
    language: 'ruby',
    engine: 'ruby',
    description: '가중치 해시 그래프 기반 최단 경로 산출',
    mainFile: 'main.rb',
    tags: ['Dijkstra', 'Graph'],
    files: {
      'main.rb': `# ==========================================
# 💎 [06] Ruby: 다익스트라 최단 경로
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
    id: 'ruby-07-sorting',
    title: '07. 퀵 정렬 (QuickSort Algorithm)',
    category: 'Backend & Scripting',
    language: 'ruby',
    engine: 'ruby',
    description: '분할 정복 QuickSort 구현',
    mainFile: 'main.rb',
    tags: ['QuickSort', 'Sorting'],
    files: {
      'main.rb': `# ==========================================
# 💎 [07] Ruby: 퀵 정렬
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
    id: 'ruby-08-backtracking',
    title: '08. 백트래킹 (N-Queens 체스)',
    category: 'Backend & Scripting',
    language: 'ruby',
    engine: 'ruby',
    description: '재귀적 유망성 검사를 통한 N-Queens 해답 탐색',
    mainFile: 'main.rb',
    tags: ['Backtracking', 'N-Queens'],
    files: {
      'main.rb': `# ==========================================
# 💎 [08] Ruby: 백트래킹 (N-Queens)
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
    id: 'ruby-09-two-pointers',
    title: '09. 투 포인터 & 슬라이딩 윈도우',
    category: 'Backend & Scripting',
    language: 'ruby',
    engine: 'ruby',
    description: 'Two Sum 투 포인터 선형 시간 탐색 O(N)',
    mainFile: 'main.rb',
    tags: ['Two Pointers', 'O(N)'],
    files: {
      'main.rb': `# ==========================================
# 💎 [09] Ruby: 투 포인터 (Two Sum)
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
    id: 'ruby-10-greedy',
    title: '10. 그리디 알고리즘 (Greedy - 회의실 배정)',
    category: 'Backend & Scripting',
    language: 'ruby',
    engine: 'ruby',
    description: '종료 시간 정렬 기반 회의실 최대 배정',
    mainFile: 'main.rb',
    tags: ['Greedy', 'Activity Selection'],
    files: {
      'main.rb': `# ==========================================
# 💎 [10] Ruby: 그리디 (회의실 배정)
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
];
