import type { CodeTemplate } from '../../types';

// ----------------------------------------------------------------------

export const LUA_TEMPLATES: CodeTemplate[] = [
  {
    id: 'lua-01-hello-io',
    title: '01. Hello World & 표준 입출력 (I/O)',
    category: 'Backend & Scripting',
    language: 'lua',
    engine: 'lua',
    description: 'Lua 5.3 print 함수 및 _VERSION 환경 정보',
    mainFile: 'main.lua',
    tags: ['Lua', 'Hello World', 'print'],
    files: {
      'main.lua': `-- ==========================================
-- 🌙 [01] Lua: Hello World & 기본 입출력
-- ==========================================

print("\\033[96m✨ Hello from Lua 5.3 (LuaJIT / Wasm)!\\033[0m")
print("------------------------------------------")
print("Lua 런타임 버전: " .. _VERSION)
print("경량 임베디드 스크립트 및 알고리즘 샌드박스 준비 완료")
`,
    },
  },
  {
    id: 'lua-02-dfs',
    title: '02. 깊이 우선 탐색 (DFS & 연결 요소)',
    category: 'Backend & Scripting',
    language: 'lua',
    engine: 'lua',
    description: '테이블 인접 리스트 기반 재귀 DFS 그래프 순회',
    mainFile: 'main.lua',
    tags: ['DFS', 'Graph', 'Recursion'],
    files: {
      'main.lua': `-- ==========================================
-- 🌙 [02] Lua: 깊이 우선 탐색 (DFS)
-- ==========================================

print("\\033[96m⚡ [DFS] Lua 테이블 기반 그래프 순회\\033[0m")
print("------------------------------------------")

local graph = {
    [1] = {2, 3},
    [2] = {1, 4, 5},
    [3] = {1, 6},
    [4] = {2},
    [5] = {2},
    [6] = {3},
    [7] = {8},
    [8] = {7}
}

local visited = {}
local traversal = {}

local function dfs(node)
    visited[node] = true
    table.insert(traversal, node)

    for _, nxt in ipairs(graph[node] or {}) do
        if not visited[nxt] then
            dfs(nxt)
        end
    end
end

dfs(1)
print("노드 1 기준 DFS 순회: " .. table.concat(traversal, " ➔ "))
`,
    },
  },
  {
    id: 'lua-03-bfs',
    title: '03. 너비 우선 탐색 (BFS & 2D 최단 경로)',
    category: 'Backend & Scripting',
    language: 'lua',
    engine: 'lua',
    description: '테이블 큐를 이용한 2D 미로 탈출 최단 거리 BFS',
    mainFile: 'main.lua',
    tags: ['BFS', 'Queue', 'Shortest Path'],
    files: {
      'main.lua': `-- ==========================================
-- 🌙 [03] Lua: 너비 우선 탐색 (BFS) 최단 경로
-- ==========================================

print("\\033[96m⚡ [BFS] 2D 미로 최단 거리 탐색\\033[0m")
print("------------------------------------------")

local maze = {
    {0, 0, 1, 0, 0, 0},
    {1, 0, 1, 0, 1, 0},
    {0, 0, 0, 0, 1, 0},
    {0, 1, 1, 0, 0, 0},
    {0, 0, 0, 1, 1, 0}
}

local H = #maze
local W = #maze[1]

local visited = {}
for y = 1, H do
    visited[y] = {}
    for x = 1, W do visited[y][x] = false end
end

local queue = {{x = 1, y = 1, dist = 1}}
visited[1][1] = true

local dx = {0, 0, 1, -1}
local dy = {1, -1, 0, 0}
local ans = -1

while #queue > 0 do
    local cur = table.remove(queue, 1)

    if cur.x == W and cur.y == H then
        ans = cur.dist
        break
    end

    for i = 1, 4 do
        local nx = cur.x + dx[i]
        local ny = cur.y + dy[i]

        if nx >= 1 and nx <= W and ny >= 1 and ny <= H then
            if not visited[ny][nx] and maze[ny][nx] == 0 then
                visited[ny][nx] = true
                table.insert(queue, {x = nx, y = ny, dist = cur.dist + 1})
            end
        end
    end
end

print("✨ 미로 탈출 최단 거리: " .. ans .. "칸")
`,
    },
  },
  {
    id: 'lua-04-dp',
    title: '04. 다이나믹 프로그래밍 (DP & 0/1 배낭)',
    category: 'Backend & Scripting',
    language: 'lua',
    engine: 'lua',
    description: '0/1 Knapsack 배낭 DP 테이블 2차원 최적화',
    mainFile: 'main.lua',
    tags: ['DP', 'Knapsack', 'Optimization'],
    files: {
      'main.lua': `-- ==========================================
-- 🌙 [04] Lua: 다이나믹 프로그래밍 (0/1 배낭)
-- ==========================================

print("\\033[96m⚡ [DP] 0/1 Knapsack 배낭 최적화\\033[0m")
print("------------------------------------------")

local items = {
    {name = "노트북", weight = 3, value = 50},
    {name = "카메라", weight = 1, value = 40},
    {name = "스마트폰", weight = 1, value = 30},
    {name = "보조배터리", weight = 2, value = 20},
    {name = "헤드폰", weight = 2, value = 35}
}

local capacity = 5
local n = #items
local dp = {}
for i = 0, n do
    dp[i] = {}
    for w = 0, capacity do dp[i][w] = 0 end
end

for i = 1, n do
    local w = items[i].weight
    local v = items[i].value
    for cap = 0, capacity do
        if w <= cap then
            dp[i][cap] = math.max(dp[i - 1][cap], dp[i - 1][cap - w] + v)
        else
            dp[i][cap] = dp[i - 1][cap]
        end
    end
end

print("✨ 배낭에 담을 수 있는 최대 가치: " .. dp[n][capacity] .. "만원")
`,
    },
  },
  {
    id: 'lua-05-binary-search',
    title: '05. 이진 탐색 & 파라메트릭 서치',
    category: 'Backend & Scripting',
    language: 'lua',
    engine: 'lua',
    description: '이진 탐색 및 파라메트릭 서치(랜선 자르기)',
    mainFile: 'main.lua',
    tags: ['Binary Search', 'Parametric Search'],
    files: {
      'main.lua': `-- ==========================================
-- 🌙 [05] Lua: 이진 탐색 & 파라메트릭 서치
-- ==========================================

print("\\033[96m⚡ [Binary Search] 이진 탐색 & 파라메트릭 서치\\033[0m")
print("------------------------------------------")

local function binarySearch(arr, target)
    local l, r = 1, #arr
    while l <= r do
        local mid = math.floor((l + r) / 2)
        if arr[mid] == target then return mid
        elseif arr[mid] < target then l = mid + 1
        else r = mid - 1 end
    end
    return -1
end

local arr = {3, 7, 12, 19, 24, 38, 45, 56, 72, 88, 91}
local target = 56
print("타겟 " .. target .. " 인덱스: " .. binarySearch(arr, target))

-- 파라메트릭 서치
local cables = {802, 743, 457, 539}
local needed = 11
local left, right = 1, 802
local best = 0

while left <= right do
    local mid = math.floor((left + right) / 2)
    local count = 0
    for _, c in ipairs(cables) do count = count + math.floor(c / mid) end

    if count >= needed then
        best = mid
        left = mid + 1
    else
        right = mid - 1
    end
end

print("✨ 만들 수 있는 최대 랜선 길이: " .. best .. "cm")
`,
    },
  },
  {
    id: 'lua-06-dijkstra',
    title: '06. 다익스트라 최단 경로 (Dijkstra Algorithm)',
    category: 'Backend & Scripting',
    language: 'lua',
    engine: 'lua',
    description: '가중치 테이블 그래프 기반 다익스트라 최단 경로',
    mainFile: 'main.lua',
    tags: ['Dijkstra', 'Graph'],
    files: {
      'main.lua': `-- ==========================================
-- 🌙 [06] Lua: 다익스트라 최단 경로
-- ==========================================

print("\\033[96m⚡ [Dijkstra] 가중치 그래프 최단 경로\\033[0m")
print("------------------------------------------")

local graph = {
    A = {{to = 'B', cost = 4}, {to = 'C', cost = 2}},
    B = {{to = 'C', cost = 1}, {to = 'D', cost = 5}},
    C = {{to = 'B', cost = 1}, {to = 'D', cost = 8}, {to = 'E', cost = 10}},
    D = {{to = 'E', cost = 2}, {to = 'Z', cost = 6}},
    E = {{to = 'D', cost = 2}, {to = 'Z', cost = 3}},
    Z = {}
}

local dist = {}
local unvisited = {}
for k in pairs(graph) do
    dist[k] = math.huge
    unvisited[k] = true
end
dist['A'] = 0

while next(unvisited) do
    local minD = math.huge
    local curr = nil

    for node in pairs(unvisited) do
        if dist[node] < minD then
            minD = dist[node]
            curr = node
        end
    end

    if not curr or minD == math.huge then break end
    unvisited[curr] = nil

    for _, edge in ipairs(graph[curr]) do
        if dist[curr] + edge.cost < dist[edge.to] then
            dist[edge.to] = dist[curr] + edge.cost
        end
    end
end

print("출발지 [A] 기준 최단 비용: Z ➔ " .. dist['Z'])
`,
    },
  },
  {
    id: 'lua-07-sorting',
    title: '07. 퀵 정렬 (QuickSort Algorithm)',
    category: 'Backend & Scripting',
    language: 'lua',
    engine: 'lua',
    description: '분할 정복 QuickSort 구현',
    mainFile: 'main.lua',
    tags: ['QuickSort', 'Sorting'],
    files: {
      'main.lua': `-- ==========================================
-- 🌙 [07] Lua: 퀵 정렬
-- ==========================================

local function quickSort(arr)
    if #arr <= 1 then return arr end
    local pivot = arr[math.floor(#arr / 2)]
    local left, mid, right = {}, {}, {}

    for _, x in ipairs(arr) do
        if x < pivot then table.insert(left, x)
        elseif x == pivot then table.insert(mid, x)
        else table.insert(right, x) end
    end

    local sortedLeft = quickSort(left)
    local sortedRight = quickSort(right)

    local res = {}
    for _, x in ipairs(sortedLeft) do table.insert(res, x) end
    for _, x in ipairs(mid) do table.insert(res, x) end
    for _, x in ipairs(sortedRight) do table.insert(res, x) end
    return res
end

print("\\033[96m⚡ [Sorting] 분할 정복 퀵 정렬\\033[0m")
print("------------------------------------------")

local numbers = {64, 34, 25, 12, 22, 11, 90, 88, 45, 50, 7}
local sorted = quickSort(numbers)
print("정렬 결과: " .. table.concat(sorted, ", "))
`,
    },
  },
  {
    id: 'lua-08-backtracking',
    title: '08. 백트래킹 (N-Queens 체스)',
    category: 'Backend & Scripting',
    language: 'lua',
    engine: 'lua',
    description: '재귀적 유망성 검사를 통한 N-Queens 해답 탐색',
    mainFile: 'main.lua',
    tags: ['Backtracking', 'N-Queens'],
    files: {
      'main.lua': `-- ==========================================
-- 🌙 [08] Lua: 백트래킹 (N-Queens)
-- ==========================================

local solutions = 0

local function isSafe(row, col, board)
    for r = 1, row - 1 do
        local c = board[r]
        if c == col or math.abs(row - r) == math.abs(col - c) then
            return false
        end
    end
    return true
end

local function backtrack(row, n, board)
    if row > n then
        solutions = solutions + 1
        return
    end
    for col = 1, n do
        if isSafe(row, col, board) then
            board[row] = col
            backtrack(row + 1, n, board)
            board[row] = nil
        end
    end
end

print("\\033[96m⚡ [Backtracking] N-Queens 체스판 배치\\033[0m")
print("------------------------------------------")

local n = 8
local board = {}
backtrack(1, n, board)
print(n .. "x" .. n .. " 체스판 유효한 퀸 배치 해답: " .. solutions .. "가지")
`,
    },
  },
  {
    id: 'lua-09-two-pointers',
    title: '09. 투 포인터 & 슬라이딩 윈도우',
    category: 'Backend & Scripting',
    language: 'lua',
    engine: 'lua',
    description: 'Two Sum 투 포인터 선형 시간 탐색 O(N)',
    mainFile: 'main.lua',
    tags: ['Two Pointers', 'O(N)'],
    files: {
      'main.lua': `-- ==========================================
-- 🌙 [09] Lua: 투 포인터 (Two Sum)
-- ==========================================

print("\\033[96m⚡ [Two Pointers] O(N) 선형 탐색\\033[0m")
print("------------------------------------------")

local arr = {1, 2, 3, 4, 6, 8, 9, 11, 15}
local target = 12
local l, r = 1, #arr

print("합이 " .. target .. "인 쌍:")
while l < r do
    local sum = arr[l] + arr[r]
    if sum == target then
        print("  ➜ (" .. arr[l] .. " + " .. arr[r] .. " = 12)")
        l = l + 1
        r = r - 1
    elseif sum < target then
        l = l + 1
    else
        r = r - 1
    end
end
`,
    },
  },
  {
    id: 'lua-10-greedy',
    title: '10. 그리디 알고리즘 (Greedy - 회의실 배정)',
    category: 'Backend & Scripting',
    language: 'lua',
    engine: 'lua',
    description: '종료 시간 정렬 기반 회의실 최대 배정',
    mainFile: 'main.lua',
    tags: ['Greedy', 'Activity Selection'],
    files: {
      'main.lua': `-- ==========================================
-- 🌙 [10] Lua: 그리디 (회의실 배정)
-- ==========================================

print("\\033[96m⚡ [Greedy] 회의실 배정 (Activity Selection)\\033[0m")
print("------------------------------------------")

local meetings = {
    {id = "M1", start = 1, ["end"] = 4}, {id = "M2", start = 3, ["end"] = 5},
    {id = "M3", start = 0, ["end"] = 6}, {id = "M4", start = 5, ["end"] = 7},
    {id = "M5", start = 3, ["end"] = 8}, {id = "M6", start = 5, ["end"] = 9},
    {id = "M7", start = 6, ["end"] = 10}, {id = "M8", start = 8, ["end"] = 11},
    {id = "M9", start = 8, ["end"] = 12}, {id = "M10", start = 12, ["end"] = 14}
}

table.sort(meetings, function(a, b) return a["end"] < b["end"] end)

local count = 0
local lastEnd = 0

for _, m in ipairs(meetings) do
    if m.start >= lastEnd then
        count = count + 1
        lastEnd = m["end"]
        print("  ➜ " .. m.id .. ": " .. m.start .. "시 ~ " .. m["end"] .. "시")
    end
end

print("✨ 배정 가능한 최대 회의 수: " .. count .. "개")
`,
    },
  },
];
