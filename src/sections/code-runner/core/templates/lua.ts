import type { CodeTemplate } from '../../types';

// ----------------------------------------------------------------------

export const LUA_TEMPLATES: CodeTemplate[] = [
  // --- [Part 1: 언어 문법 및 메타테이블 10선] ---
  {
    id: 'lua-01-hello-world',
    title: '01. Hello World & print 입출력',
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
    id: 'lua-02-tables-arrays',
    title: '02. 테이블(Table) - 배열 & 딕셔너리',
    category: 'Backend & Scripting',
    language: 'lua',
    engine: 'lua',
    description: '1-indexed 배열 조작, 키-값 해시맵, table.insert/concat',
    mainFile: 'main.lua',
    tags: ['Lua', 'Tables', 'Arrays', 'Dictionary'],
    files: {
      'main.lua': `-- ==========================================
-- 🌙 [02] Lua: 테이블과 배열
-- ==========================================

local user = {
    name = "루아 개발자",
    role = "Game Scripter",
    skills = {"Lua", "C++", "Roblox", "Redis"}
}

print("이름: " .. user.name .. " (" .. user.role .. ")")
print("보유 기술: " .. table.concat(user.skills, ", "))
`,
    },
  },
  {
    id: 'lua-03-functions-closures',
    title: '03. 일급 함수(First-class) & 클로저',
    category: 'Backend & Scripting',
    language: 'lua',
    engine: 'lua',
    description: '다중 반환값, 렉시컬 스코프 은닉 카운터 팩토리',
    mainFile: 'main.lua',
    tags: ['Lua', 'Functions', 'Closures', 'Scope'],
    files: {
      'main.lua': `-- ==========================================
-- 🌙 [03] Lua: 클로저 상태 은닉
-- ==========================================

local function createCounter(initial)
    local count = initial or 0
    return function(step)
        count = count + (step or 1)
        return count
    end
end

local c1 = createCounter(10)
print("카운터 1 (+1): " .. c1())
print("카운터 1 (+5): " .. c1(5))
`,
    },
  },
  {
    id: 'lua-04-control-structures',
    title: '04. 조건문 & 반복문 (numeric/generic for)',
    category: 'Backend & Scripting',
    language: 'lua',
    engine: 'lua',
    description: 'ipairs(순서 보장), pairs(키-값 순회), repeat..until 루프',
    mainFile: 'main.lua',
    tags: ['Lua', 'Loops', 'pairs', 'ipairs'],
    files: {
      'main.lua': `-- ==========================================
-- 🌙 [04] Lua: 반복문과 pairs/ipairs
-- ==========================================

local scores = {80, 95, 70, 100, 85}
local sum = 0

for i, score in ipairs(scores) do
    sum = sum + score
    print("  #" .. i .. " 과목: " .. score .. "점")
end

print("평균: " .. (sum / #scores) .. "점")
`,
    },
  },
  {
    id: 'lua-05-metatables-oop',
    title: '05. 메타테이블(Metatable) & OOP 클래스',
    category: 'Backend & Scripting',
    language: 'lua',
    engine: 'lua',
    description: '__index, setmetatable을 활용한 프로토타입 기반 객체 지향',
    mainFile: 'main.lua',
    tags: ['Lua', 'Metatables', '__index', 'OOP'],
    files: {
      'main.lua': `-- ==========================================
-- 🌙 [05] Lua: 메타테이블과 OOP
-- ==========================================

local Vector = {}
Vector.__index = Vector

function Vector.new(x, y)
    local self = setmetatable({}, Vector)
    self.x = x
    self.y = y
    return self
end

function Vector:magnitude()
    return math.sqrt(self.x^2 + self.y^2)
end

local v = Vector.new(3, 4)
print("벡터 (" .. v.x .. ", " .. v.y .. ") 크기: " .. v:magnitude())
`,
    },
  },
  {
    id: 'lua-06-operator-overloading',
    title: '06. 연산자 오버로딩 (__add, __tostring)',
    category: 'Backend & Scripting',
    language: 'lua',
    engine: 'lua',
    description: '메타메서드를 이용한 산술/비교/문자열 변환 연산자 재정의',
    mainFile: 'main.lua',
    tags: ['Lua', 'Metamethods', '__add', '__tostring'],
    files: {
      'main.lua': `-- ==========================================
-- 🌙 [06] Lua: 연산자 오버로딩
-- ==========================================

local Money = {}
Money.__index = Money

function Money.new(amount)
    return setmetatable({amount = amount}, Money)
end

function Money.__add(a, b)
    return Money.new(a.amount + b.amount)
end

function Money:__tostring()
    return self.amount .. "원"
end

local m1 = Money.new(5000)
local m2 = Money.new(12000)
local total = m1 + m2

print("m1 + m2 = " .. tostring(total))
`,
    },
  },
  {
    id: 'lua-07-coroutines',
    title: '07. 코루틴 (Coroutine) 협동적 멀티태스킹',
    category: 'Backend & Scripting',
    language: 'lua',
    engine: 'lua',
    description: 'coroutine.create, coroutine.resume, coroutine.yield 제어 흐름',
    mainFile: 'main.lua',
    tags: ['Lua', 'Coroutines', 'yield', 'resume'],
    files: {
      'main.lua': `-- ==========================================
-- 🌙 [07] Lua: 코루틴 (Coroutine)
-- ==========================================

local co = coroutine.create(function()
    for i = 1, 3 do
        print("  코루틴 내부 작업 단계 #" .. i)
        coroutine.yield(i * 100)
    end
end)

print("메인 스레드 ➔ 코루틴 시작:")
print("  수신된 값: " .. select(2, coroutine.resume(co)))
print("  수신된 값: " .. select(2, coroutine.resume(co)))
print("  수신된 값: " .. select(2, coroutine.resume(co)))
`,
    },
  },
  {
    id: 'lua-08-string-patterns',
    title: '08. 문자열 패턴 매칭 (string.match, gmatch)',
    category: 'Backend & Scripting',
    language: 'lua',
    engine: 'lua',
    description: 'Lua 고유 패턴 문법(%d, %a, %w) 및 문자열 캡처',
    mainFile: 'main.lua',
    tags: ['Lua', 'Patterns', 'string.match', 'gmatch'],
    files: {
      'main.lua': `-- ==========================================
-- 🌙 [08] Lua: 문자열 패턴 매칭
-- ==========================================

local log = "user: alice, score: 95; user: bob, score: 82; user: charlie, score: 100"

print("[로그 파싱 결과]")
for name, score in string.gmatch(log, "user:%s*(%a+),%s*score:%s*(%d+)") do
    print("  • " .. name .. ": " .. score .. "점")
end
`,
    },
  },
  {
    id: 'lua-09-math-random',
    title: '09. 수학 라이브러리 & 난수 생성 (math)',
    category: 'Backend & Scripting',
    language: 'lua',
    engine: 'lua',
    description: 'math.sin, math.floor, math.random 몬테카를로 시뮬레이션',
    mainFile: 'main.lua',
    tags: ['Lua', 'math', 'Simulation', 'random'],
    files: {
      'main.lua': `-- ==========================================
-- 🌙 [09] Lua: 수학 & 통계 연산
-- ==========================================

math.randomseed(os.time())

local insideCircle = 0
local totalPoints = 10000

for i = 1, totalPoints do
    local x = math.random()
    local y = math.random()
    if (x*x + y*y) <= 1.0 then
        insideCircle = insideCircle + 1
    end
end

local piEstimate = 4 * insideCircle / totalPoints
print("몬테카를로 원주율 추정 (시행 10,000회): " .. piEstimate)
`,
    },
  },
  {
    id: 'lua-10-bst-tree',
    title: '10. 이진 탐색 트리 (BST 자료구조)',
    category: 'Backend & Scripting',
    language: 'lua',
    engine: 'lua',
    description: '테이블 참조 기반 이진 탐색 트리 구현',
    mainFile: 'main.lua',
    tags: ['Lua', 'BST', 'Tree', 'Data Structures'],
    files: {
      'main.lua': `-- ==========================================
-- 🌙 [10] Lua: 이진 탐색 트리 (BST)
-- ==========================================

local function insertBST(root, val)
    if not root then return {val = val, left = nil, right = nil} end
    if val < root.val then root.left = insertBST(root.left, val)
    else root.right = insertBST(root.right, val) end
    return root
end

local function inorder(root, res)
    if not root then return end
    inorder(root.left, res)
    table.insert(res, root.val)
    inorder(root.right, res)
end

local root = nil
for _, x in ipairs({50, 30, 70, 20, 40, 60, 80}) do root = insertBST(root, x) end

local sorted = {}
inorder(root, sorted)
print("BST 중위 순회 (정렬 출력): " .. table.concat(sorted, ", "))
`,
    },
  },

  // --- [Part 2: 핵심 알고리즘 10선] ---
  {
    id: 'lua-11-algo-dfs',
    title: '11. [알고리즘] 깊이 우선 탐색 (DFS & 연결 요소)',
    category: 'Backend & Scripting',
    language: 'lua',
    engine: 'lua',
    description: '테이블 인접 리스트 기반 재귀 DFS 그래프 순회',
    mainFile: 'main.lua',
    tags: ['DFS', 'Graph', 'Recursion'],
    files: {
      'main.lua': `-- ==========================================
-- 🧠 [11] Lua Algorithm: 깊이 우선 탐색 (DFS)
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
    id: 'lua-12-algo-bfs',
    title: '12. [알고리즘] 너비 우선 탐색 (BFS & 2D 최단 경로)',
    category: 'Backend & Scripting',
    language: 'lua',
    engine: 'lua',
    description: '테이블 큐를 이용한 2D 미로 탈출 최단 거리 BFS',
    mainFile: 'main.lua',
    tags: ['BFS', 'Queue', 'Shortest Path'],
    files: {
      'main.lua': `-- ==========================================
-- 🧠 [12] Lua Algorithm: 너비 우선 탐색 (BFS) 최단 경로
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
    id: 'lua-13-algo-dp',
    title: '13. [알고리즘] 다이나믹 프로그래밍 (DP & 0/1 배낭)',
    category: 'Backend & Scripting',
    language: 'lua',
    engine: 'lua',
    description: '0/1 Knapsack 배낭 DP 테이블 2차원 최적화',
    mainFile: 'main.lua',
    tags: ['DP', 'Knapsack', 'Optimization'],
    files: {
      'main.lua': `-- ==========================================
-- 🧠 [13] Lua Algorithm: 다이나믹 프로그래밍 (0/1 배낭)
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
    id: 'lua-14-algo-binary-search',
    title: '14. [알고리즘] 이진 탐색 & 파라메트릭 서치',
    category: 'Backend & Scripting',
    language: 'lua',
    engine: 'lua',
    description: '이진 탐색 및 파라메트릭 서치(랜선 자르기)',
    mainFile: 'main.lua',
    tags: ['Binary Search', 'Parametric Search'],
    files: {
      'main.lua': `-- ==========================================
-- 🧠 [14] Lua Algorithm: 이진 탐색 & 파라메트릭 서치
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
    id: 'lua-15-algo-dijkstra',
    title: '15. [알고리즘] 다익스트라 최단 경로 (Dijkstra Algorithm)',
    category: 'Backend & Scripting',
    language: 'lua',
    engine: 'lua',
    description: '가중치 테이블 그래프 기반 다익스트라 최단 경로',
    mainFile: 'main.lua',
    tags: ['Dijkstra', 'Graph'],
    files: {
      'main.lua': `-- ==========================================
-- 🧠 [15] Lua Algorithm: 다익스트라 최단 경로
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
    id: 'lua-16-algo-sorting',
    title: '16. [알고리즘] 퀵 정렬 (QuickSort Algorithm)',
    category: 'Backend & Scripting',
    language: 'lua',
    engine: 'lua',
    description: '분할 정복 QuickSort 구현',
    mainFile: 'main.lua',
    tags: ['QuickSort', 'Sorting'],
    files: {
      'main.lua': `-- ==========================================
-- 🧠 [16] Lua Algorithm: 퀵 정렬
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
    id: 'lua-17-algo-backtracking',
    title: '17. [알고리즘] 백트래킹 (N-Queens 체스)',
    category: 'Backend & Scripting',
    language: 'lua',
    engine: 'lua',
    description: '재귀적 유망성 검사를 통한 N-Queens 해답 탐색',
    mainFile: 'main.lua',
    tags: ['Backtracking', 'N-Queens'],
    files: {
      'main.lua': `-- ==========================================
-- 🧠 [17] Lua Algorithm: 백트래킹 (N-Queens)
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
    id: 'lua-18-algo-two-pointers',
    title: '18. [알고리즘] 투 포인터 & 슬라이딩 윈도우',
    category: 'Backend & Scripting',
    language: 'lua',
    engine: 'lua',
    description: 'Two Sum 투 포인터 선형 시간 탐색 O(N)',
    mainFile: 'main.lua',
    tags: ['Two Pointers', 'O(N)'],
    files: {
      'main.lua': `-- ==========================================
-- 🧠 [18] Lua Algorithm: 투 포인터 (Two Sum)
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
    id: 'lua-19-algo-greedy',
    title: '19. [알고리즘] 그리디 알고리즘 (회의실 배정)',
    category: 'Backend & Scripting',
    language: 'lua',
    engine: 'lua',
    description: '종료 시간 정렬 기반 회의실 최대 배정',
    mainFile: 'main.lua',
    tags: ['Greedy', 'Activity Selection'],
    files: {
      'main.lua': `-- ==========================================
-- 🧠 [19] Lua Algorithm: 그리디 (회의실 배정)
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
  {
    id: 'lua-20-algo-trie-topo',
    title: '20. [알고리즘] 트라이 & 위상 정렬 (Trie & TopoSort)',
    category: 'Backend & Scripting',
    language: 'lua',
    engine: 'lua',
    description: '트라이 사전 검색 및 진입차수(In-degree) 기반 위상 정렬',
    mainFile: 'main.lua',
    tags: ['Trie', 'Topological Sort', 'DAG'],
    files: {
      'main.lua': `-- ==========================================
-- 🧠 [20] Lua Algorithm: 트라이 & 위상 정렬
-- ==========================================

print("\\033[96m⚡ [1] Lua Trie 접두사 트리\\033[0m")
local root = {children = {}, isEnd = false}
for _, word in ipairs({"apple", "app", "application", "banana"}) do
    local cur = root
    for i = 1, #word do
        local ch = word:sub(i, i)
        if not cur.children[ch] then cur.children[ch] = {children = {}, isEnd = false} end
        cur = cur.children[ch]
    end
    cur.isEnd = true
end
print("  단어 사전 삽입 완료 (apple, app, application, banana)")

print("\\n\\033[96m⚡ [2] 위상 정렬 (Topological Sort)\\033[0m")
local n = 5
local adj = {}
local inDegree = {}
for i = 1, n do adj[i] = {}; inDegree[i] = 0 end

local function addEdge(u, v)
    table.insert(adj[u], v)
    inDegree[v] = inDegree[v] + 1
end

addEdge(1, 2); addEdge(2, 3); addEdge(2, 4); addEdge(3, 5); addEdge(4, 5)

local q = {}
for i = 1, n do if inDegree[i] == 0 then table.insert(q, i) end end

local order = {}
while #q > 0 do
    local cur = table.remove(q, 1)
    table.insert(order, cur)
    for _, nxt in ipairs(adj[cur]) do
        inDegree[nxt] = inDegree[nxt] - 1
        if inDegree[nxt] == 0 then table.insert(q, nxt) end
    end
end

print("  ✨ 빌드 순서: " .. table.concat(order, " ➔ "))
`,
    },
  },
];
