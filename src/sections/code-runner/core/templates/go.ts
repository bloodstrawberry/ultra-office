import type { CodeTemplate } from '../../types';

// ----------------------------------------------------------------------

export const GO_TEMPLATES: CodeTemplate[] = [
  {
    id: 'go-01-hello-io',
    title: '01. Hello World & 표준 입출력 (I/O)',
    category: 'Backend & Scripting',
    language: 'go',
    engine: 'wasm',
    description: 'Go 1.23 fmt 패키지를 활용한 표준 입출력',
    mainFile: 'main.go',
    tags: ['Go', 'Hello World', 'fmt'],
    files: {
      'main.go': `// ==========================================
// 🐹 [01] Go: Hello World & 기본 입출력
// ==========================================
package main

import (
	"fmt"
	"runtime"
)

func main() {
	fmt.Println("\\033[96m✨ Hello from Go 1.23 (Wasm Toolchain)!\\033[0m")
	fmt.Println("------------------------------------------")
	fmt.Printf("Go 런타임 버전: %s\\n", runtime.Version())
	fmt.Printf("OS / 아키텍처: %s / %s\\n", runtime.GOOS, runtime.GOARCH)
	fmt.Println("고루틴 & 채널 기반 동시성 최적화 환경 준비 완료")
}
`,
    },
  },
  {
    id: 'go-02-dfs',
    title: '02. 깊이 우선 탐색 (DFS & 연결 요소)',
    category: 'Backend & Scripting',
    language: 'go',
    engine: 'wasm',
    description: 'map[int][]int 인접 리스트 기반 재귀 DFS 그래프 순회',
    mainFile: 'main.go',
    tags: ['DFS', 'Graph', 'Recursion'],
    files: {
      'main.go': `// ==========================================
// 🐹 [02] Go: 깊이 우선 탐색 (DFS)
// ==========================================
package main

import "fmt"

func dfs(node int, graph map[int][]int, visited map[int]bool) {
	visited[node] = true
	fmt.Printf("%d ", node)

	for _, next := range graph[node] {
		if !visited[next] {
			dfs(next, graph, visited)
		}
	}
}

func main() {
	fmt.Println("\\033[96m⚡ [DFS] Go 맵 기반 그래프 순회\\033[0m")
	fmt.Println("------------------------------------------")

	graph := map[int][]int{
		1: {2, 3},
		2: {1, 4, 5},
		3: {1, 6},
		4: {2},
		5: {2},
		6: {3},
		7: {8},
		8: {7},
	}

	visited := make(map[int]bool)
	fmt.Print("노드 1 기준 DFS 순회: ")
	dfs(1, graph, visited)
	fmt.Println()
}
`,
    },
  },
  {
    id: 'go-03-bfs',
    title: '03. 너비 우선 탐색 (BFS & 2D 최단 경로)',
    category: 'Backend & Scripting',
    language: 'go',
    engine: 'wasm',
    description: '슬라이스 큐를 이용한 2D 미로 탈출 최단 거리 BFS',
    mainFile: 'main.go',
    tags: ['BFS', 'Queue', 'Shortest Path'],
    files: {
      'main.go': `// ==========================================
// 🐹 [03] Go: 너비 우선 탐색 (BFS) 최단 경로
// ==========================================
package main

import "fmt"

type Point struct {
	x, y, dist int
}

func main() {
	fmt.Println("\\033[96m⚡ [BFS] 2D 미로 최단 거리 탐색\\033[0m")
	fmt.Println("------------------------------------------")

	maze := [][]int{
		{0, 0, 1, 0, 0, 0},
		{1, 0, 1, 0, 1, 0},
		{0, 0, 0, 0, 1, 0},
		{0, 1, 1, 0, 0, 0},
		{0, 0, 0, 1, 1, 0},
	}

	H, W := len(maze), len(maze[0])
	visited := make([][]bool, H)
	for i := range visited {
		visited[i] = make([]bool, W)
	}

	queue := []Point{{0, 0, 1}}
	visited[0][0] = true

	dx := []int{0, 0, 1, -1}
	dy := []int{1, -1, 0, 0}
	ans := -1

	for len(queue) > 0 {
		cur := queue[0]
		queue = queue[1:]

		if cur.x == W-1 && cur.y == H-1 {
			ans = cur.dist
			break
		}

		for i := 0; i < 4; i++ {
			nx := cur.x + dx[i]
			ny := cur.y + dy[i]

			if nx >= 0 && nx < W && ny >= 0 && ny < H {
				if !visited[ny][nx] && maze[ny][nx] == 0 {
					visited[ny][nx] = true
					queue = append(queue, Point{nx, ny, cur.dist + 1})
				}
			}
		}
	}

	fmt.Printf("✨ 최단 이동 거리: %d칸\\n", ans)
}
`,
    },
  },
  {
    id: 'go-04-dp',
    title: '04. 다이나믹 프로그래밍 (DP & 0/1 Knapsack)',
    category: 'Backend & Scripting',
    language: 'go',
    engine: 'wasm',
    description: '0/1 Knapsack 배낭 DP 테이블 2차원 최적화',
    mainFile: 'main.go',
    tags: ['DP', 'Knapsack', 'Optimization'],
    files: {
      'main.go': `// ==========================================
// 🐹 [04] Go: 다이나믹 프로그래밍 (0/1 배낭)
// ==========================================
package main

import "fmt"

type Item struct {
	name   string
	weight int
	value  int
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func main() {
	fmt.Println("\\033[96m⚡ [DP] 0/1 Knapsack 배낭 최적화\\033[0m")
	fmt.Println("------------------------------------------")

	items := []Item{
		{"노트북", 3, 50},
		{"카메라", 1, 40},
		{"스마트폰", 1, 30},
		{"보조배터리", 2, 20},
		{"헤드폰", 2, 35},
	}

	capacity := 5
	n := len(items)
	dp := make([][]int, n+1)
	for i := range dp {
		dp[i] = make([]int, capacity+1)
	}

	for i := 1; i <= n; i++ {
		w := items[i-1].weight
		v := items[i-1].value
		for cap := 0; cap <= capacity; cap++ {
			if w <= cap {
				dp[i][cap] = max(dp[i-1][cap], dp[i-1][cap-w]+v)
			} else {
				dp[i][cap] = dp[i-1][cap]
			}
		}
	}

	fmt.Printf("✨ 배낭에 담을 수 있는 최대 가치: %d만원\\n", dp[n][capacity])
}
`,
    },
  },
  {
    id: 'go-05-binary-search',
    title: '05. 이진 탐색 & 파라메트릭 서치',
    category: 'Backend & Scripting',
    language: 'go',
    engine: 'wasm',
    description: '이진 탐색 및 파라메트릭 서치(랜선 자르기 결정 문제)',
    mainFile: 'main.go',
    tags: ['Binary Search', 'Parametric Search'],
    files: {
      'main.go': `// ==========================================
// 🐹 [05] Go: 이진 탐색 & 파라메트릭 서치
// ==========================================
package main

import "fmt"

func binarySearch(arr []int, target int) int {
	l, r := 0, len(arr)-1
	for l <= r {
		mid := (l + r) / 2
		if arr[mid] == target {
			return mid
		} else if arr[mid] < target {
			l = mid + 1
		} else {
			r = mid - 1
		}
	}
	return -1
}

func main() {
	fmt.Println("\\033[96m⚡ [Binary Search] 이진 탐색 & 파라메트릭 서치\\033[0m")
	fmt.Println("------------------------------------------")

	arr := []int{3, 7, 12, 19, 24, 38, 45, 56, 72, 88, 91}
	target := 56
	fmt.Printf("타겟 %d 인덱스: %d\\n", target, binarySearch(arr, target))

	// 파라메트릭 서치
	cables := []int{802, 743, 457, 539}
	needed := 11
	left, right, best := 1, 802, 0

	for left <= right {
		mid := (left + right) / 2
		count := 0
		for _, c := range cables {
			count += c / mid
		}
		if count >= needed {
			best = mid
			left = mid + 1
		} else {
			right = mid - 1
		}
	}

	fmt.Printf("✨ 만들 수 있는 최대 랜선 길이: %dcm\\n", best)
}
`,
    },
  },
  {
    id: 'go-06-dijkstra',
    title: '06. 다익스트라 최단 경로 (Dijkstra Algorithm)',
    category: 'Backend & Scripting',
    language: 'go',
    engine: 'wasm',
    description: '가중치 인접 리스트 기반 최단 경로 산출',
    mainFile: 'main.go',
    tags: ['Dijkstra', 'Graph'],
    files: {
      'main.go': `// ==========================================
// 🐹 [06] Go: 다익스트라 최단 경로
// ==========================================
package main

import "fmt"

type Edge struct {
	to, cost int
}

const INF = 1e9

func main() {
	fmt.Println("\\033[96m⚡ [Dijkstra] 가중치 최단 경로\\033[0m")
	fmt.Println("------------------------------------------")

	n := 5
	adj := make([][]Edge, n+1)
	adj[1] = []Edge{{2, 4}, {3, 2}}
	adj[2] = []Edge{{3, 1}, {4, 5}}
	adj[3] = []Edge{{4, 8}}
	adj[4] = []Edge{{5, 2}}

	dist := make([]int, n+1)
	visited := make([]bool, n+1)
	for i := range dist {
		dist[i] = INF
	}
	dist[1] = 0

	for i := 1; i <= n; i++ {
		cur := -1
		minD := INF

		for j := 1; j <= n; j++ {
			if !visited[j] && dist[j] < minD {
				minD = dist[j]
				cur = j
			}
		}

		if cur == -1 || minD == INF {
			break
		}
		visited[cur] = true

		for _, e := range adj[cur] {
			if dist[cur]+e.cost < dist[e.to] {
				dist[e.to] = dist[cur] + e.cost
			}
		}
	}

	fmt.Printf("노드 1에서 노드 5까지의 최단 비용: %d\\n", dist[5])
}
`,
    },
  },
  {
    id: 'go-07-sorting',
    title: '07. 퀵 정렬 (QuickSort Algorithm)',
    category: 'Backend & Scripting',
    language: 'go',
    engine: 'wasm',
    description: '분할 정복 QuickSort 슬라이스 정렬',
    mainFile: 'main.go',
    tags: ['QuickSort', 'Sorting'],
    files: {
      'main.go': `// ==========================================
// 🐹 [07] Go: 퀵 정렬
// ==========================================
package main

import "fmt"

func quickSort(arr []int) []int {
	if len(arr) <= 1 {
		return arr
	}
	pivot := arr[len(arr)/2]
	var left, mid, right []int

	for _, x := range arr {
		if x < pivot {
			left = append(left, x)
		} else if x == pivot {
			mid = append(mid, x)
		} else {
			right = append(right, x)
		}
	}

	return append(append(quickSort(left), mid...), quickSort(right)...)
}

func main() {
	fmt.Println("\\033[96m⚡ [Sorting] 분할 정복 퀵 정렬\\033[0m")
	fmt.Println("------------------------------------------")

	numbers := []int{64, 34, 25, 12, 22, 11, 90, 88, 45, 50, 7}
	fmt.Println("정렬 전:", numbers)
	fmt.Println("정렬 후:", quickSort(numbers))
}
`,
    },
  },
  {
    id: 'go-08-backtracking',
    title: '08. 백트래킹 (N-Queens 체스)',
    category: 'Backend & Scripting',
    language: 'go',
    engine: 'wasm',
    description: '재귀적 유망성 검사를 통한 N-Queens 해답 탐색',
    mainFile: 'main.go',
    tags: ['Backtracking', 'N-Queens'],
    files: {
      'main.go': `// ==========================================
// 🐹 [08] Go: 백트래킹 (N-Queens)
// ==========================================
package main

import "fmt"

var solutions = 0

func abs(x int) int {
	if x < 0 {
		return -x
	}
	return x
}

func isSafe(row, col int, board []int) bool {
	for r := 0; r < row; r++ {
		c := board[r]
		if c == col || abs(row-r) == abs(col-c) {
			return false
		}
	}
	return true
}

func backtrack(row, N int, board []int) {
	if row == N {
		solutions++
		return
	}
	for col := 0; col < N; col++ {
		if isSafe(row, col, board) {
			board[row] = col
			backtrack(row+1, N, board)
			board[row] = -1
		}
	}
}

func main() {
	fmt.Println("\\033[96m⚡ [Backtracking] N-Queens 체스판 배치\\033[0m")
	fmt.Println("------------------------------------------")

	N := 8
	board := make([]int, N)
	for i := range board {
		board[i] = -1
	}
	backtrack(0, N, board)

	fmt.Printf("%dx%d 체스판 유효한 퀸 배치 해답: %d가지\\n", N, N, solutions)
}
`,
    },
  },
  {
    id: 'go-09-two-pointers',
    title: '09. 투 포인터 & 슬라이딩 윈도우',
    category: 'Backend & Scripting',
    language: 'go',
    engine: 'wasm',
    description: 'Two Sum 투 포인터 탐색 O(N)',
    mainFile: 'main.go',
    tags: ['Two Pointers', 'O(N)'],
    files: {
      'main.go': `// ==========================================
// 🐹 [09] Go: 투 포인터 (Two Sum)
// ==========================================
package main

import "fmt"

func main() {
	fmt.Println("\\033[96m⚡ [Two Pointers] O(N) 선형 탐색\\033[0m")
	fmt.Println("------------------------------------------")

	arr := []int{1, 2, 3, 4, 6, 8, 9, 11, 15}
	target := 12

	l, r := 0, len(arr)-1
	fmt.Printf("합이 %d인 쌍:\\n", target)
	for l < r {
		sum := arr[l] + arr[r]
		if sum == target {
			fmt.Printf("  ➜ (%d + %d = 12)\\n", arr[l], arr[r])
			l++
			r--
		} else if sum < target {
			l++
		} else {
			r--
		}
	}
}
`,
    },
  },
  {
    id: 'go-10-greedy',
    title: '10. 그리디 알고리즘 (Greedy - 회의실 배정)',
    category: 'Backend & Scripting',
    language: 'go',
    engine: 'wasm',
    description: '종료 시간 정렬 기반 회의실 최대 배정',
    mainFile: 'main.go',
    tags: ['Greedy', 'Activity Selection'],
    files: {
      'main.go': `// ==========================================
// 🐹 [10] Go: 그리디 (회의실 배정)
// ==========================================
package main

import (
	"fmt"
	"sort"
)

type Meeting struct {
	id         string
	start, end int
}

func main() {
	fmt.Println("\\033[96m⚡ [Greedy] 회의실 배정 (Activity Selection)\\033[0m")
	fmt.Println("------------------------------------------")

	meetings := []Meeting{
		{"M1", 1, 4}, {"M2", 3, 5}, {"M3", 0, 6}, {"M4", 5, 7},
		{"M5", 3, 8}, {"M6", 5, 9}, {"M7", 6, 10}, {"M8", 8, 11},
		{"M9", 8, 12}, {"M10", 12, 14},
	}

	sort.Slice(meetings, func(i, j int) bool {
		return meetings[i].end < meetings[j].end
	})

	count := 0
	lastEnd := 0

	for _, m := range meetings {
		if m.start >= lastEnd {
			count++
			lastEnd = m.end
			fmt.Printf("  ➜ %s: %d시 ~ %d시\\n", m.id, m.start, m.end)
		}
	}

	fmt.Printf("✨ 배정 가능한 최대 회의 수: %d개\\n", count)
}
`,
    },
  },
];
