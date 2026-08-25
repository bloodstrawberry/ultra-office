import type { CodeTemplate } from '../../types';

// ----------------------------------------------------------------------

export const RUST_TEMPLATES: CodeTemplate[] = [
  {
    id: 'rust-01-hello-io',
    title: '01. Hello World & 표준 입출력 (I/O)',
    category: 'Systems & Native',
    language: 'rust',
    engine: 'wasm',
    description: 'Rust println! 매크로 및 메모리 안전한 포맷팅 출력',
    mainFile: 'main.rs',
    tags: ['Rust', 'Hello World', 'println!'],
    files: {
      'main.rs': `// ==========================================
// 🦀 [01] Rust: Hello World & 기본 입출력
// ==========================================

fn main() {
    println!("\\x1b[36m✨ Hello from Rust (Wasm32-Wasi Toolchain)!\\x1b[0m");
    println!("------------------------------------------");

    let compiler = "rustc 1.80.0";
    let target = "wasm32-wasi";
    println!("컴파일러 버전: {}", compiler);
    println!("타겟 아키텍처: {}", target);
    println!("Rust 메모리 안전성 & 알고리즘 실행기 준비 완료!");
}
`,
    },
  },
  {
    id: 'rust-02-dfs',
    title: '02. 깊이 우선 탐색 (DFS & 연결 요소)',
    category: 'Systems & Native',
    language: 'rust',
    engine: 'wasm',
    description: 'Vec 인접 리스트 기반 재귀 DFS 그래프 순회',
    mainFile: 'main.rs',
    tags: ['DFS', 'Graph', 'Recursion', 'Vec'],
    files: {
      'main.rs': `// ==========================================
// 🦀 [02] Rust: 깊이 우선 탐색 (DFS)
// ==========================================

fn dfs(node: usize, graph: &Vec<Vec<usize>>, visited: &mut Vec<bool>) {
    visited[node] = true;
    print!("{} ", node);

    for &next in &graph[node] {
        if !visited[next] {
            dfs(next, graph, visited);
        }
    }
}

fn main() {
    println!("\\x1b[36m⚡ [DFS] Rust 벡터 기반 그래프 순회\\x1b[0m");
    println!("------------------------------------------");

    let n = 8;
    let mut graph = vec![vec![]; n + 1];
    graph[1] = vec![2, 3];
    graph[2] = vec![1, 4, 5];
    graph[3] = vec![1, 6];
    graph[4] = vec![2];
    graph[5] = vec![2];
    graph[6] = vec![3];
    graph[7] = vec![8];
    graph[8] = vec![7];

    let mut visited = vec![false; n + 1];
    print!("노드 1 기준 DFS 순회: ");
    dfs(1, &graph, &mut visited);
    println!();
}
`,
    },
  },
  {
    id: 'rust-03-bfs',
    title: '03. 너비 우선 탐색 (BFS & VecDeque)',
    category: 'Systems & Native',
    language: 'rust',
    engine: 'wasm',
    description: 'std::collections::VecDeque를 이용한 2D 미로 탈출 최단 거리 BFS',
    mainFile: 'main.rs',
    tags: ['BFS', 'VecDeque', 'Shortest Path'],
    files: {
      'main.rs': `// ==========================================
// 🦀 [03] Rust: 너비 우선 탐색 (BFS) 최단 경로
// ==========================================
use std::collections::VecDeque;

fn main() {
    println!("\\x1b[36m⚡ [BFS] VecDeque 2D 미로 최단 거리\\x1b[0m");
    println!("------------------------------------------");

    let maze = vec![
        vec![0, 0, 1, 0, 0, 0],
        vec![1, 0, 1, 0, 1, 0],
        vec![0, 0, 0, 0, 1, 0],
        vec![0, 1, 1, 0, 0, 0],
        vec![0, 0, 0, 1, 1, 0],
    ];

    let h = maze.len();
    let w = maze[0].len();
    let mut visited = vec![vec![false; w]; h];
    let mut queue = VecDeque::new();

    queue.push_back((0, 0, 1));
    visited[0][0] = true;

    let dx = [0, 0, 1, -1];
    let dy = [1, -1, 0, 0];
    let mut ans = -1;

    while let Some((x, y, dist)) = queue.pop_front() {
        if x == w - 1 && y == h - 1 {
            ans = dist;
            break;
        }

        for i in 0..4 {
            let nx = x as i32 + dx[i];
            let ny = y as i32 + dy[i];

            if nx >= 0 && nx < w as i32 && ny >= 0 && ny < h as i32 {
                let ux = nx as usize;
                let uy = ny as usize;
                if !visited[uy][ux] && maze[uy][ux] == 0 {
                    visited[uy][ux] = true;
                    queue.push_back((ux, uy, dist + 1));
                }
            }
        }
    }

    println!("✨ 미로 탈출 최단 거리: {}칸", ans);
}
`,
    },
  },
  {
    id: 'rust-04-dp',
    title: '04. 다이나믹 프로그래밍 (DP & 0/1 배낭)',
    category: 'Systems & Native',
    language: 'rust',
    engine: 'wasm',
    description: '0/1 Knapsack 배낭 DP 테이블 2차원 최적화',
    mainFile: 'main.rs',
    tags: ['DP', 'Knapsack', 'Optimization'],
    files: {
      'main.rs': `// ==========================================
// 🦀 [04] Rust: 다이나믹 프로그래밍 (0/1 배낭)
// ==========================================
use std::cmp::max;

struct Item {
    name: &'static str,
    weight: usize,
    value: usize,
}

fn main() {
    println!("\\x1b[36m⚡ [DP] 0/1 Knapsack 배낭 최적화\\x1b[0m");
    println!("------------------------------------------");

    let items = vec![
        Item { name: "노트북", weight: 3, value: 50 },
        Item { name: "카메라", weight: 1, value: 40 },
        Item { name: "스마트폰", weight: 1, value: 30 },
        Item { name: "보조배터리", weight: 2, value: 20 },
        Item { name: "헤드폰", weight: 2, value: 35 },
    ];

    let capacity = 5;
    let n = items.len();
    let mut dp = vec![vec![0; capacity + 1]; n + 1];

    for i in 1..=n {
        let w = items[i - 1].weight;
        let v = items[i - 1].value;
        for cap in 0..=capacity {
            if w <= cap {
                dp[i][cap] = max(dp[i - 1][cap], dp[i - 1][cap - w] + v);
            } else {
                dp[i][cap] = dp[i - 1][cap];
            }
        }
    }

    println!("✨ 배낭에 담을 수 있는 최대 가치: {}만원", dp[n][capacity]);
}
`,
    },
  },
  {
    id: 'rust-05-binary-search',
    title: '05. 이진 탐색 & 파라메트릭 서치',
    category: 'Systems & Native',
    language: 'rust',
    engine: 'wasm',
    description: 'binary_search 메서드 및 파라메트릭 서치(랜선 자르기)',
    mainFile: 'main.rs',
    tags: ['Binary Search', 'Parametric Search'],
    files: {
      'main.rs': `// ==========================================
// 🦀 [05] Rust: 이진 탐색 & 파라메트릭 서치
// ==========================================

fn main() {
    println!("\\x1b[36m⚡ [Binary Search] 이진 탐색 & 파라메트릭 서치\\x1b[0m");
    println!("------------------------------------------");

    let arr = vec![3, 7, 12, 19, 24, 38, 45, 56, 72, 88, 91];
    let target = 56;

    if let Ok(idx) = arr.binary_search(&target) {
        println!("타겟 {} 인덱스: {}", target, idx);
    }

    // 파라메트릭 서치
    let cables = vec![802, 743, 457, 539];
    let needed = 11;
    let mut left = 1;
    let mut right = 802;
    let mut best = 0;

    while left <= right {
        let mid = (left + right) / 2;
        let count: i64 = cables.iter().map(|&c| c / mid).sum();

        if count >= needed {
            best = mid;
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    println!("✨ 만들 수 있는 최대 랜선 길이: {}cm", best);
}
`,
    },
  },
  {
    id: 'rust-06-dijkstra',
    title: '06. 다익스트라 최단 경로 (BinaryHeap)',
    category: 'Systems & Native',
    language: 'rust',
    engine: 'wasm',
    description: 'std::collections::BinaryHeap을 이용한 가중치 그래프 다익스트라 최단 경로',
    mainFile: 'main.rs',
    tags: ['Dijkstra', 'BinaryHeap', 'Graph'],
    files: {
      'main.rs': `// ==========================================
// 🦀 [06] Rust: 다익스트라 최단 경로 (BinaryHeap)
// ==========================================
use std::cmp::Ordering;
use std::collections::BinaryHeap;

#[derive(Copy, Clone, Eq, PartialEq)]
struct State {
    cost: usize,
    position: usize,
}

impl Ord for State {
    fn cmp(&self, other: &Self) -> Ordering {
        other.cost.cmp(&self.cost)
    }
}

impl PartialOrd for State {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

struct Edge {
    node: usize,
    cost: usize,
}

fn main() {
    println!("\\x1b[36m⚡ [Dijkstra] BinaryHeap 가중치 최단 경로\\x1b[0m");
    println!("------------------------------------------");

    let n = 5;
    let mut adj = vec![vec![]; n + 1];
    adj[1].push(Edge { node: 2, cost: 4 });
    adj[1].push(Edge { node: 3, cost: 2 });
    adj[2].push(Edge { node: 3, cost: 1 });
    adj[2].push(Edge { node: 4, cost: 5 });
    adj[3].push(Edge { node: 4, cost: 8 });
    adj[4].push(Edge { node: 5, cost: 2 });

    let mut dist = vec![usize::MAX; n + 1];
    let mut heap = BinaryHeap::new();

    dist[1] = 0;
    heap.push(State { cost: 0, position: 1 });

    while let Some(State { cost, position }) = heap.pop() {
        if cost > dist[position] {
            continue;
        }

        for edge in &adj[position] {
            let next = State {
                cost: cost + edge.cost,
                position: edge.node,
            };

            if next.cost < dist[next.position] {
                dist[next.position] = next.cost;
                heap.push(next);
            }
        }
    }

    println!("노드 1에서 노드 5까지의 최단 비용: {}", dist[5]);
}
`,
    },
  },
  {
    id: 'rust-07-sorting',
    title: '07. 퀵 정렬 (QuickSort Algorithm)',
    category: 'Systems & Native',
    language: 'rust',
    engine: 'wasm',
    description: '분할 정복 QuickSort 슬라이스 정렬',
    mainFile: 'main.rs',
    tags: ['QuickSort', 'Sorting'],
    files: {
      'main.rs': `// ==========================================
// 🦀 [07] Rust: 퀵 정렬
// ==========================================

fn quick_sort(arr: &mut [i32]) {
    if arr.len() <= 1 {
        return;
    }
    let pivot_idx = partition(arr);
    quick_sort(&mut arr[0..pivot_idx]);
    quick_sort(&mut arr[pivot_idx + 1..]);
}

fn partition(arr: &mut [i32]) -> usize {
    let len = arr.len();
    let pivot = arr[len - 1];
    let mut i = 0;

    for j in 0..len - 1 {
        if arr[j] < pivot {
            arr.swap(i, j);
            i += 1;
        }
    }
    arr.swap(i, len - 1);
    i
}

fn main() {
    println!("\\x1b[36m⚡ [Sorting] 분할 정복 퀵 정렬\\x1b[0m");
    println!("------------------------------------------");

    let mut numbers = vec![64, 34, 25, 12, 22, 11, 90, 88, 45, 50, 7];
    println!("정렬 전: {:?}", numbers);
    quick_sort(&mut numbers);
    println!("정렬 후: {:?}", numbers);
}
`,
    },
  },
  {
    id: 'rust-08-backtracking',
    title: '08. 백트래킹 (N-Queens 체스)',
    category: 'Systems & Native',
    language: 'rust',
    engine: 'wasm',
    description: '재귀적 유망성 검사를 통한 N-Queens 해답 탐색',
    mainFile: 'main.rs',
    tags: ['Backtracking', 'N-Queens'],
    files: {
      'main.rs': `// ==========================================
// 🦀 [08] Rust: 백트래킹 (N-Queens)
// ==========================================

fn is_safe(row: usize, col: i32, board: &[i32]) -> bool {
    for r in 0..row {
        let c = board[r];
        if c == col || (row as i32 - r as i32).abs() == (col - c).abs() {
            return false;
        }
    }
    true
}

fn backtrack(row: usize, n: usize, board: &mut Vec<i32>, count: &mut usize) {
    if row == n {
        *count += 1;
        return;
    }
    for col in 0..n as i32 {
        if is_safe(row, col, board) {
            board[row] = col;
            backtrack(row + 1, n, board, count);
            board[row] = -1;
        }
    }
}

fn main() {
    println!("\\x1b[36m⚡ [Backtracking] N-Queens 체스판 배치\\x1b[0m");
    println!("------------------------------------------");

    let n = 8;
    let mut board = vec![-1; n];
    let mut solutions = 0;
    backtrack(0, n, &mut board, &mut solutions);

    println!("{}x{} 체스판 유효한 퀸 배치 해답: {}가지", n, n, solutions);
}
`,
    },
  },
  {
    id: 'rust-09-two-pointers',
    title: '09. 투 포인터 & 슬라이딩 윈도우',
    category: 'Systems & Native',
    language: 'rust',
    engine: 'wasm',
    description: 'Two Sum 투 포인터 선형 시간 탐색 O(N)',
    mainFile: 'main.rs',
    tags: ['Two Pointers', 'O(N)'],
    files: {
      'main.rs': `// ==========================================
// 🦀 [09] Rust: 투 포인터 (Two Sum)
// ==========================================

fn main() {
    println!("\\x1b[36m⚡ [Two Pointers] O(N) 선형 탐색\\x1b[0m");
    println!("------------------------------------------");

    let arr = vec![1, 2, 3, 4, 6, 8, 9, 11, 15];
    let target = 12;

    let mut left = 0;
    let mut right = arr.len() - 1;

    println!("합이 {}인 쌍:", target);
    while left < right {
        let sum = arr[left] + arr[right];
        if sum == target {
            println!("  ➜ ({} + {} = 12)", arr[left], arr[right]);
            left += 1;
            right -= 1;
        } else if sum < target {
            left += 1;
        } else {
            right -= 1;
        }
    }
}
`,
    },
  },
  {
    id: 'rust-10-greedy',
    title: '10. 그리디 알고리즘 (Greedy - 회의실 배정)',
    category: 'Systems & Native',
    language: 'rust',
    engine: 'wasm',
    description: '종료 시간 정렬 기반 회의실 최대 배정',
    mainFile: 'main.rs',
    tags: ['Greedy', 'Activity Selection'],
    files: {
      'main.rs': `// ==========================================
// 🦀 [10] Rust: 그리디 (회의실 배정)
// ==========================================

struct Meeting {
    id: &'static str,
    start: usize,
    end: usize,
}

fn main() {
    println!("\\x1b[36m⚡ [Greedy] 회의실 배정 (Activity Selection)\\x1b[0m");
    println!("------------------------------------------");

    let mut meetings = vec![
        Meeting { id: "M1", start: 1, end: 4 },
        Meeting { id: "M2", start: 3, end: 5 },
        Meeting { id: "M3", start: 0, end: 6 },
        Meeting { id: "M4", start: 5, end: 7 },
        Meeting { id: "M5", start: 3, end: 8 },
        Meeting { id: "M6", start: 5, end: 9 },
        Meeting { id: "M7", start: 6, end: 10 },
        Meeting { id: "M8", start: 8, end: 11 },
        Meeting { id: "M9", start: 8, end: 12 },
        Meeting { id: "M10", start: 12, end: 14 },
    ];

    meetings.sort_by_key(|m| m.end);

    let mut count = 0;
    let mut last_end = 0;

    for m in &meetings {
        if m.start >= last_end {
            count += 1;
            last_end = m.end;
            println!("  ➜ {}: {}시 ~ {}시", m.id, m.start, m.end);
        }
    }

    println!("✨ 배정 가능한 최대 회의 수: {}개", count);
}
`,
    },
  },
];
