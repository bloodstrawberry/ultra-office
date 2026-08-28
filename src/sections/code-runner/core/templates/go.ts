import type { CodeTemplate } from '../../types';

// ----------------------------------------------------------------------

export const GO_TEMPLATES: CodeTemplate[] = [
  // --- [Part 1: 언어 문법 및 동시성 10선] ---
  {
    id: 'go-01-hello-world',
    title: '01. Hello World & fmt 표준 입출력',
    category: 'Systems & Native',
    language: 'go',
    engine: 'wasm',
    description: 'Go 1.23 main 패키지 및 fmt.Println 서식화 출력',
    mainFile: 'main.go',
    tags: ['Go', 'Hello World', 'fmt', 'main'],
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
	fmt.Println("\\033[96m✨ Hello from Go 1.23 (Wasm Compiler)!\\033[0m")
	fmt.Println("------------------------------------------")
	fmt.Printf("Go 버전: %s\\n", runtime.Version())
	fmt.Printf("OS/아키텍처: %s/%s\\n", runtime.GOOS, runtime.GOARCH)
	fmt.Println("동시성 및 알고리즘 샌드박스 준비 완료!")
}
`,
    },
  },
  {
    id: 'go-02-variables-types',
    title: '02. 변수, 다중 반환값 & 타입 추론',
    category: 'Systems & Native',
    language: 'go',
    engine: 'wasm',
    description: ':= 짧은 선언, 다중 리턴(Multiple Returns), 에러 튜플 패턴',
    mainFile: 'main.go',
    tags: ['Go', 'Variables', 'Multiple Returns', 'Type Inference'],
    files: {
      'main.go': `// ==========================================
// 🐹 [02] Go: 다중 반환 함수와 변수 선언
// ==========================================
package main

import (
	"errors"
	"fmt"
)

func divide(a, b float64) (float64, error) {
	if b == 0 {
		return 0, errors.New("0으로 나눌 수 없습니다")
	}
	return a / b, nil
}

func main() {
	quotient, err := divide(100, 4)
	if err != nil {
		fmt.Printf("에러: %v\\n", err)
	} else {
		fmt.Printf("100 / 4 = %.2f\\n", quotient)
	}

	_, errFail := divide(50, 0)
	if errFail != nil {
		fmt.Printf("\\033[91m예상된 에러 처리: %v\\033[0m\\n", errFail)
	}
}
`,
    },
  },
  {
    id: 'go-03-slices-maps',
    title: '03. 슬라이스(Slice) & 맵(Map) 조작',
    category: 'Systems & Native',
    language: 'go',
    engine: 'wasm',
    description: 'make(), append(), 슬라이싱([1:4]), 맵 키-값 조회 및 삭제',
    mainFile: 'main.go',
    tags: ['Go', 'Slice', 'Map', 'make', 'append'],
    files: {
      'main.go': `// ==========================================
// 🐹 [03] Go: 슬라이스와 맵
// ==========================================
package main

import "fmt"

func main() {
	// 슬라이스 조작
	languages := []string{"Go", "Rust", "TypeScript"}
	languages = append(languages, "Python", "C++")
	fmt.Println("슬라이스 목록:", languages)

	// 맵 조작
	stars := map[string]int{
		"Go":         120000,
		"TypeScript": 98000,
		"Rust":       95000,
	}

	for lang, count := range stars {
		fmt.Printf("  • %-12s: %d Stars\\n", lang, count)
	}
}
`,
    },
  },
  {
    id: 'go-04-structs-methods',
    title: '04. 구조체(Struct) & 리시버 메서드',
    category: 'Systems & Native',
    language: 'go',
    engine: 'wasm',
    description: '구조체 필드, 값 리시버 vs 포인터 리시버 (*T)',
    mainFile: 'main.go',
    tags: ['Go', 'Struct', 'Methods', 'Pointers'],
    files: {
      'main.go': `// ==========================================
// 🐹 [04] Go: 구조체와 포인터 리시버
// ==========================================
package main

import "fmt"

type ServerConfig struct {
	Host string
	Port int
	SSL  bool
}

func (s *ServerConfig) EnableSSL() {
	s.SSL = true
	s.Port = 443
}

func (s ServerConfig) GetURL() string {
	protocol := "http"
	if s.SSL {
		protocol = "https"
	}
	return fmt.Sprintf("%s://%s:%d", protocol, s.Host, s.Port)
}

func main() {
	srv := ServerConfig{Host: "api.ultra-office.com", Port: 80, SSL: false}
	fmt.Println("초기 URL:", srv.GetURL())

	srv.EnableSSL()
	fmt.Println("SSL 활성화 후 URL:", srv.GetURL())
}
`,
    },
  },
  {
    id: 'go-05-interfaces-polymorphism',
    title: '05. 인터페이스(Interface) 덕 타이핑',
    category: 'Systems & Native',
    language: 'go',
    engine: 'wasm',
    description: '암시적 인터페이스 구현(Duck Typing)과 다형성',
    mainFile: 'main.go',
    tags: ['Go', 'Interface', 'Duck Typing', 'Polymorphism'],
    files: {
      'main.go': `// ==========================================
// 🐹 [05] Go: 인터페이스와 다형성
// ==========================================
package main

import "fmt"

type Notifier interface {
	Send(msg string) string
}

type EmailNotifier struct{ Email string }
func (e EmailNotifier) Send(msg string) string {
	return fmt.Sprintf("[이메일 ➔ %s] %s", e.Email, msg)
}

type SlackNotifier struct{ Channel string }
func (s SlackNotifier) Send(msg string) string {
	return fmt.Sprintf("[슬랙 ➔ #%s] %s", s.Channel, msg)
}

func Broadcast(n Notifier, message string) {
	fmt.Println(n.Send(message))
}

func main() {
	Broadcast(EmailNotifier{Email: "admin@system.io"}, "서버 점검 예정")
	Broadcast(SlackNotifier{Channel: "dev-ops"}, "빌드 성공!")
}
`,
    },
  },
  {
    id: 'go-06-goroutines-channels',
    title: '06. 고루틴(Goroutine) & 채널(Channel)',
    category: 'Systems & Native',
    language: 'go',
    engine: 'wasm',
    description: '경량 스레드 고루틴(go worker)과 동기화 채널(chan int)',
    mainFile: 'main.go',
    tags: ['Go', 'Goroutine', 'Channel', 'Concurrency'],
    files: {
      'main.go': `// ==========================================
// 🐹 [06] Go: 동시성 (Goroutine & Channel)
// ==========================================
package main

import "fmt"

func calculateSquare(n int, ch chan int) {
	ch <- n * n
}

func main() {
	ch := make(chan int, 3)

	go calculateSquare(10, ch)
	go calculateSquare(20, ch)
	go calculateSquare(30, ch)

	sum := 0
	for i := 0; i < 3; i++ {
		val := <-ch
		fmt.Printf("수신된 제곱수: %d\\n", val)
		sum += val
	}
	fmt.Printf("총합: %d\\n", sum)
}
`,
    },
  },
  {
    id: 'go-07-defer-panic-recover',
    title: '07. defer, panic & recover 에러 복구',
    category: 'Systems & Native',
    language: 'go',
    engine: 'wasm',
    description: '지연 실행 defer 및 런타임 패닉 안전 복구(recover)',
    mainFile: 'main.go',
    tags: ['Go', 'defer', 'panic', 'recover'],
    files: {
      'main.go': `// ==========================================
// 🐹 [07] Go: defer & recover 복구
// ==========================================
package main

import "fmt"

func safeExecution() {
	defer func() {
		if r := recover(); r != nil {
			fmt.Printf("\\033[91m런타임 패닉 안전 복구됨: %v\\033[0m\\n", r)
		}
	}()

	fmt.Println("작업 실행 중...")
	panic("치명적인 메모리 접근 오류 시뮬레이션")
}

func main() {
	safeExecution()
	fmt.Println("프로그램이 정상 종료되었습니다.")
}
`,
    },
  },
  {
    id: 'go-08-generics-go118',
    title: '08. 제네릭 (Generics type parameters)',
    category: 'Systems & Native',
    language: 'go',
    engine: 'wasm',
    description: 'Go 1.18+ [T any | comparable] 제네릭 함수 및 슬라이스 매핑',
    mainFile: 'main.go',
    tags: ['Go', 'Generics', 'type parameters', 'any'],
    files: {
      'main.go': `// ==========================================
// 🐹 [08] Go: 제네릭 (Generics)
// ==========================================
package main

import "fmt"

func MapSlice[T any, R any](items []T, transform func(T) R) []R {
	result := make([]R, len(items))
	for i, v := range items {
		result[i] = transform(v)
	}
	return result
}

func main() {
	ints := []int{1, 2, 3, 4, 5}
	doubled := MapSlice(ints, func(x int) int { return x * 2 })
	fmt.Println("2배 증가:", doubled)

	words := []string{"hello", "golang", "wasm"}
	lengths := MapSlice(words, func(s string) int { return len(s) })
	fmt.Println("단어 길이:", lengths)
}
`,
    },
  },
  {
    id: 'go-09-json-serialization',
    title: '09. JSON 직렬화 & 구조체 태그',
    category: 'Systems & Native',
    language: 'go',
    engine: 'wasm',
    description: 'encoding/json, `json:"name,omitempty"` 구조체 태그 매핑',
    mainFile: 'main.go',
    tags: ['Go', 'JSON', 'encoding/json', 'Struct Tags'],
    files: {
      'main.go': `// ==========================================
// 🐹 [09] Go: JSON 직렬화
// ==========================================
package main

import (
	"encoding/json"
	"fmt"
)

type UserProfile struct {
	ID       string   \`json:"id"\`
	Username string   \`json:"username"\`
	Roles    []string \`json:"roles"\`
	Active   bool     \`json:"active"\`
}

func main() {
	user := UserProfile{
		ID:       "U_99",
		Username: "gopher",
		Roles:    []string{"admin", "developer"},
		Active:   true,
	}

	bytes, _ := json.MarshalIndent(user, "", "  ")
	fmt.Println(string(bytes))
}
`,
    },
  },
  {
    id: 'go-10-bst-tree',
    title: '10. 이진 탐색 트리 (BST 자료구조)',
    category: 'Systems & Native',
    language: 'go',
    engine: 'wasm',
    description: '포인터 기반 이진 탐색 트리(Binary Search Tree) 구현',
    mainFile: 'main.go',
    tags: ['Go', 'BST', 'Tree', 'Data Structures'],
    files: {
      'main.go': `// ==========================================
// 🐹 [10] Go: 이진 탐색 트리 (BST)
// ==========================================
package main

import "fmt"

type TreeNode struct {
	Val   int
	Left  *TreeNode
	Right *TreeNode
}

func Insert(root *TreeNode, val int) *TreeNode {
	if root == nil {
		return &TreeNode{Val: val}
	}
	if val < root.Val {
		root.Left = Insert(root.Left, val)
	} else {
		root.Right = Insert(root.Right, val)
	}
	return root
}

func Inorder(root *TreeNode) {
	if root == nil {
		return
	}
	Inorder(root.Left)
	fmt.Printf("%d ", root.Val)
	Inorder(root.Right)
}

func main() {
	var root *TreeNode
	for _, x := range []int{50, 30, 70, 20, 40, 60, 80} {
		root = Insert(root, x)
	}

	fmt.Print("BST 중위 순회 (정렬 출력): ")
	Inorder(root)
	fmt.Println()
}
`,
    },
  },

  // --- [Part 2: 핵심 알고리즘 10선] ---
  {
    id: 'go-11-algo-dfs',
    title: '11. [알고리즘] 깊이 우선 탐색 (DFS & 연결 요소)',
    category: 'Systems & Native',
    language: 'go',
    engine: 'wasm',
    description: '슬라이스 맵 기반 재귀 DFS 그래프 순회',
    mainFile: 'main.go',
    tags: ['DFS', 'Graph', 'Recursion'],
    files: {
      'main.go': `// ==========================================
// 🧠 [11] Go Algorithm: 깊이 우선 탐색 (DFS)
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
	fmt.Println("\\033[96m⚡ [DFS] Go 그래프 순회\\033[0m")
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
    id: 'go-12-algo-bfs',
    title: '12. [알고리즘] 너비 우선 탐색 (BFS & 2D 미로)',
    category: 'Systems & Native',
    language: 'go',
    engine: 'wasm',
    description: '구조체 슬라이스 큐를 이용한 2D 미로 최단 거리 BFS',
    mainFile: 'main.go',
    tags: ['BFS', 'Queue', 'Shortest Path'],
    files: {
      'main.go': `// ==========================================
// 🧠 [12] Go Algorithm: 너비 우선 탐색 (BFS) 최단 경로
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

	H := len(maze)
	W := len(maze[0])

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

	fmt.Printf("✨ 미로 탈출 최단 거리: %d칸\\n", ans)
}
`,
    },
  },
  {
    id: 'go-13-algo-dp',
    title: '13. [알고리즘] 다이나믹 프로그래밍 (0/1 배낭)',
    category: 'Systems & Native',
    language: 'go',
    engine: 'wasm',
    description: '0/1 Knapsack 배낭 DP 테이블 2차원 최적화',
    mainFile: 'main.go',
    tags: ['DP', 'Knapsack', 'Optimization'],
    files: {
      'main.go': `// ==========================================
// 🧠 [13] Go Algorithm: 다이나믹 프로그래밍 (0/1 배낭)
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
    id: 'go-14-algo-binary-search',
    title: '14. [알고리즘] 이진 탐색 & 파라메트릭 서치',
    category: 'Systems & Native',
    language: 'go',
    engine: 'wasm',
    description: 'sort.Search 및 파라메트릭 서치(랜선 자르기)',
    mainFile: 'main.go',
    tags: ['Binary Search', 'Parametric Search'],
    files: {
      'main.go': `// ==========================================
// 🧠 [14] Go Algorithm: 이진 탐색 & 파라메트릭 서치
// ==========================================
package main

import (
	"fmt"
	"sort"
)

func main() {
	fmt.Println("\\033[96m⚡ [Binary Search] 이진 탐색 & 파라메트릭 서치\\033[0m")
	fmt.Println("------------------------------------------")

	arr := []int{3, 7, 12, 19, 24, 38, 45, 56, 72, 88, 91}
	target := 56
	idx := sort.SearchInts(arr, target)
	fmt.Printf("타겟 %d 인덱스: %d\\n", target, idx)

	cables := []int64{802, 743, 457, 539}
	var needed int64 = 11
	var left, right int64 = 1, 802
	var best int64 = 0

	for left <= right {
		mid := (left + right) / 2
		var count int64 = 0
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
    id: 'go-15-algo-dijkstra',
    title: '15. [알고리즘] 다익스트라 최단 경로 (container/heap)',
    category: 'Systems & Native',
    language: 'go',
    engine: 'wasm',
    description: 'container/heap을 이용한 가중치 그래프 최단 경로',
    mainFile: 'main.go',
    tags: ['Dijkstra', 'heap', 'Graph'],
    files: {
      'main.go': `// ==========================================
// 🧠 [15] Go Algorithm: 다익스트라 최단 경로
// ==========================================
package main

import (
	"container/heap"
	"fmt"
)

type Edge struct {
	to, cost int
}

type Item struct {
	node, dist int
}

type PriorityQueue []Item
func (pq PriorityQueue) Len() int           { return len(pq) }
func (pq PriorityQueue) Less(i, j int) bool { return pq[i].dist < pq[j].dist }
func (pq PriorityQueue) Swap(i, j int)      { pq[i], pq[j] = pq[j], pq[i] }
func (pq *PriorityQueue) Push(x any)        { *pq = append(*pq, x.(Item)) }
func (pq *PriorityQueue) Pop() any {
	old := *pq
	n := len(old)
	item := old[n-1]
	*pq = old[0 : n-1]
	return item
}

func main() {
	fmt.Println("\\033[96m⚡ [Dijkstra] heap 기반 최단 경로\\033[0m")
	fmt.Println("------------------------------------------")

	n := 5
	adj := make([][]Edge, n+1)
	adj[1] = append(adj[1], Edge{2, 4}, Edge{3, 2})
	adj[2] = append(adj[2], Edge{3, 1}, Edge{4, 5})
	adj[3] = append(adj[3], Edge{4, 8})
	adj[4] = append(adj[4], Edge{5, 2})

	dist := make([]int, n+1)
	for i := range dist { dist[i] = 1e9 }
	dist[1] = 0

	pq := &PriorityQueue{}
	heap.Init(pq)
	heap.Push(pq, Item{1, 0})

	for pq.Len() > 0 {
		cur := heap.Pop(pq).(Item)
		if cur.dist > dist[cur.node] { continue }

		for _, e := range adj[cur.node] {
			if dist[cur.node]+e.cost < dist[e.to] {
				dist[e.to] = dist[cur.node] + e.cost
				heap.Push(pq, Item{e.to, dist[e.to]})
			}
		}
	}

	fmt.Printf("노드 1에서 노드 5까지의 최단 비용: %d\\n", dist[5])
}
`,
    },
  },
  {
    id: 'go-16-algo-sorting',
    title: '16. [알고리즘] 퀵 정렬 (QuickSort Algorithm)',
    category: 'Systems & Native',
    language: 'go',
    engine: 'wasm',
    description: '분할 정복 QuickSort 구현',
    mainFile: 'main.go',
    tags: ['QuickSort', 'Sorting'],
    files: {
      'main.go': `// ==========================================
// 🧠 [16] Go Algorithm: 퀵 정렬
// ==========================================
package main

import "fmt"

func quickSort(arr []int, low, high int) {
	if low >= high {
		return
	}
	pivot := arr[high]
	i := low - 1

	for j := low; j < high; j++ {
		if arr[j] < pivot {
			i++
			arr[i], arr[j] = arr[j], arr[i]
		}
	}
	arr[i+1], arr[high] = arr[high], arr[i+1]
	p := i + 1

	quickSort(arr, low, p-1)
	quickSort(arr, p+1, high)
}

func main() {
	fmt.Println("\\033[96m⚡ [Sorting] 분할 정복 퀵 정렬\\033[0m")
	fmt.Println("------------------------------------------")

	numbers := []int{64, 34, 25, 12, 22, 11, 90, 88, 45, 50, 7}
	quickSort(numbers, 0, len(numbers)-1)
	fmt.Println("정렬 결과:", numbers)
}
`,
    },
  },
  {
    id: 'go-17-algo-backtracking',
    title: '17. [알고리즘] 백트래킹 (N-Queens 체스)',
    category: 'Systems & Native',
    language: 'go',
    engine: 'wasm',
    description: '재귀적 유망성 검사를 통한 N-Queens 해답 탐색',
    mainFile: 'main.go',
    tags: ['Backtracking', 'N-Queens'],
    files: {
      'main.go': `// ==========================================
// 🧠 [17] Go Algorithm: 백트래킹 (N-Queens)
// ==========================================
package main

import "fmt"

func abs(x int) int {
	if x < 0 {
		return -x
	}
	return x
}

var solutions = 0

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

	fmt.Printf("%dx%d 체스판 해답 수: %d가지\\n", N, N, solutions)
}
`,
    },
  },
  {
    id: 'go-18-algo-two-pointers',
    title: '18. [알고리즘] 투 포인터 & 슬라이딩 윈도우',
    category: 'Systems & Native',
    language: 'go',
    engine: 'wasm',
    description: 'Two Sum 투 포인터 선형 시간 탐색 O(N)',
    mainFile: 'main.go',
    tags: ['Two Pointers', 'O(N)'],
    files: {
      'main.go': `// ==========================================
// 🧠 [18] Go Algorithm: 투 포인터 (Two Sum)
// ==========================================
package main

import "fmt"

func main() {
	fmt.Println("\\033[96m⚡ [Two Pointers] O(N) 선형 탐색\\033[0m")
	fmt.Println("------------------------------------------")

	arr := []int{1, 2, 3, 4, 6, 8, 9, 11, 15}
	target := 12

	left, right := 0, len(arr)-1
	fmt.Printf("합이 %d인 쌍:\\n", target)
	for left < right {
		sum := arr[left] + arr[right]
		if sum == target {
			fmt.Printf("  ➜ (%d + %d = 12)\\n", arr[left], arr[right])
			left++
			right--
		} else if sum < target {
			left++
		} else {
			right--
		}
	}
}
`,
    },
  },
  {
    id: 'go-19-algo-greedy',
    title: '19. [알고리즘] 그리디 알고리즘 (회의실 배정)',
    category: 'Systems & Native',
    language: 'go',
    engine: 'wasm',
    description: '종료 시간 정렬 기반 회의실 최대 배정',
    mainFile: 'main.go',
    tags: ['Greedy', 'Activity Selection'],
    files: {
      'main.go': `// ==========================================
// 🧠 [19] Go Algorithm: 그리디 (회의실 배정)
// ==========================================
package main

import (
	"fmt"
	"sort"
)

type Meeting struct {
	id    string
	start int
	end   int
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
  {
    id: 'go-20-algo-trie-topo',
    title: '20. [알고리즘] 트라이 & 위상 정렬 (Trie & TopoSort)',
    category: 'Systems & Native',
    language: 'go',
    engine: 'wasm',
    description: '트라이 사전 검색 및 진입차수(In-degree) 기반 위상 정렬',
    mainFile: 'main.go',
    tags: ['Trie', 'Topological Sort', 'DAG'],
    files: {
      'main.go': `// ==========================================
// 🧠 [20] Go Algorithm: 트라이 & 위상 정렬
// ==========================================
package main

import "fmt"

type TrieNode struct {
	children map[rune]*TrieNode
	isEnd    bool
}

func main() {
	fmt.Println("\\033[96m⚡ [1] Go Trie 접두사 트리\\033[0m")
	root := &TrieNode{children: make(map[rune]*TrieNode)}
	for _, word := range []string{"apple", "app", "application", "banana"} {
		cur := root
		for _, ch := range word {
			if _, exists := cur.children[ch]; !exists {
				cur.children[ch] = &TrieNode{children: make(map[rune]*TrieNode)}
			}
			cur = cur.children[ch]
		}
		cur.isEnd = true
	}
	fmt.Println("  단어 사전 삽입 완료 (apple, app, application, banana)")

	fmt.Println("\\n\\033[96m⚡ [2] 위상 정렬 (Topological Sort)\\033[0m")
	n := 5
	adj := make([][]int, n+1)
	inDegree := make([]int, n+1)

	addEdge := func(u, v int) {
		adj[u] = append(adj[u], v)
		inDegree[v]++;
	}

	addEdge(1, 2); addEdge(2, 3); addEdge(2, 4); addEdge(3, 5); addEdge(4, 5)

	q := []int{}
	for i := 1; i <= n; i++ {
		if inDegree[i] == 0 { q = append(q, i) }
	}

	fmt.Print("  ✨ 빌드 순서: ")
	for len(q) > 0 {
		cur := q[0]
		q = q[1:]
		fmt.Printf("%d ➔ ", cur)
		for _, nxt := range adj[cur] {
			inDegree[nxt]--
			if inDegree[nxt] == 0 { q = append(q, nxt) }
		}
	}
	fmt.Println("Done")
}
`,
    },
  },
  {
    id: 'go-21-concurrency-worker-pool',
    title: '21. [라이브러리] Go Concurrency (Goroutines, Channels & Worker Pool)',
    category: 'Systems & Native',
    language: 'go',
    engine: 'wasm',
    description:
      'sync.WaitGroup과 버퍼드 채널을 활용한 고성능 비동기 워커 풀(Worker Pool) 작업 분배',
    mainFile: 'main.go',
    tags: ['Go', 'Goroutines', 'Channels', 'Concurrency', 'Worker Pool'],
    files: {
      'main.go': `// ==========================================
// 🐹 [21] Go: 고루틴 & 워커 풀 동시성 처리
// ==========================================
package main

import (
	"fmt"
	"sync"
)

type Job struct {
	ID    int
	Input int
}

type Result struct {
	Job    Job
	Output int
}

func worker(id int, jobs <-chan Job, results chan<- Result, wg *sync.WaitGroup) {
	defer wg.Done()
	for j := range jobs {
		// 작업 시뮬레이션: 제곱수 계산
		output := j.Input * j.Input
		results <- Result{Job: j, Output: output}
	}
}

func main() {
	fmt.Println("\\033[96m✨ [Go Concurrency] 3개 워커 풀 병렬 처리\\033[0m")
	fmt.Println("------------------------------------------")

	numJobs := 6
	numWorkers := 3

	jobs := make(chan Job, numJobs)
	results := make(chan Result, numJobs)

	var wg sync.WaitGroup

	// 워커 풀 구동
	for w := 1; w <= numWorkers; w++ {
		wg.Add(1)
		go worker(w, jobs, results, &wg)
	}

	// 작업 발행
	for j := 1; j <= numJobs; j++ {
		jobs <- Job{ID: j, Input: j * 10}
	}
	close(jobs)

	// 결과 대기 및 채널 종료
	go func() {
		wg.Wait()
		close(results)
	}()

	// 결과 수신
	for r := range results {
		fmt.Printf("  • \\033[92m[작업 #%d 완료]\\033[0m 입력값: %3d ➔ 연산 결과: %5d\\n",
			r.Job.ID, r.Job.Input, r.Output)
	}

	fmt.Println("\\n✨ 모든 비동기 고루틴 워커 작업이 성공적으로 종료되었습니다.")
}
`,
    },
  },
];
