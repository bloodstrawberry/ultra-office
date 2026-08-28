import type { CodeTemplate } from '../../types';

// ----------------------------------------------------------------------

export const RUST_TEMPLATES: CodeTemplate[] = [
  // --- [Part 1: 언어 문법 및 소유권 10선] ---
  {
    id: 'rs-01-hello-world',
    title: '01. Hello World & println! 매크로',
    category: 'Systems & Native',
    language: 'rust',
    engine: 'wasm',
    description: 'Rust 표준 매크로 println! 및 포맷팅 출력',
    mainFile: 'main.rs',
    tags: ['Rust', 'Hello World', 'println!', 'Wasm'],
    files: {
      'main.rs': `// ==========================================
// 🦀 [01] Rust: Hello World & 기본 입출력
// ==========================================

fn main() {
    println!("\\033[96m✨ Hello from Rust (Wasm32-wasi)!\\033[0m");
    println!("------------------------------------------");
    println!("메모리 안전성 & 무비용 추상화 시스템 언어");
    println!("Rust 알고리즘 및 시스템 프로그래밍 샌드박스 준비 완료!");
}
`,
    },
  },
  {
    id: 'rs-02-ownership-borrowing',
    title: '02. 소유권(Ownership) & 빌림(Borrowing)',
    category: 'Systems & Native',
    language: 'rust',
    engine: 'wasm',
    description: 'Move 시맨틱, 불변 참조(&T), 가변 참조(&mut T) 규칙',
    mainFile: 'main.rs',
    tags: ['Rust', 'Ownership', 'Borrowing', 'References'],
    files: {
      'main.rs': `// ==========================================
// 🦀 [02] Rust: 소유권과 빌림 (Borrowing)
// ==========================================

fn calculate_length(s: &String) -> usize {
    s.len()
}

fn append_suffix(s: &mut String) {
    s.push_str(" ➔ Modified!");
}

fn main() {
    let mut s1 = String::from("Rust Ownership");

    // 불변 대여
    let len = calculate_length(&s1);
    println!("원본 문자열: '{}' (길이: {})", s1, len);

    // 가변 대여
    append_suffix(&mut s1);
    println!("가변 대여 수정 후: '{}'", s1);
}
`,
    },
  },
  {
    id: 'rs-03-pattern-matching',
    title: '03. Enum & 패턴 매칭 (match, if let)',
    category: 'Systems & Native',
    language: 'rust',
    engine: 'wasm',
    description: 'Option<T>, Result<T, E> 및 강력한 match 표현식',
    mainFile: 'main.rs',
    tags: ['Rust', 'Enum', 'match', 'Option', 'Result'],
    files: {
      'main.rs': `// ==========================================
// 🦀 [03] Rust: Enum과 match 패턴 매칭
// ==========================================

enum WebEvent {
    PageLoad,
    KeyPress(char),
    Click { x: i64, y: i64 },
}

fn inspect_event(event: WebEvent) {
    match event {
        WebEvent::PageLoad => println!("페이지 로드 이벤트 발생"),
        WebEvent::KeyPress(c) => println!("키보드 입력: '{}'", c),
        WebEvent::Click { x, y } => println!("마우스 클릭 좌표: ({}, {})", x, y),
    }
}

fn main() {
    inspect_event(WebEvent::PageLoad);
    inspect_event(WebEvent::KeyPress('Q'));
    inspect_event(WebEvent::Click { x: 1920, y: 1080 });
}
`,
    },
  },
  {
    id: 'rs-04-structs-traits',
    title: '04. 구조체(Struct) & 트레이트(Trait)',
    category: 'Systems & Native',
    language: 'rust',
    engine: 'wasm',
    description: 'struct 정의, impl 블록, 공통 동작을 정의하는 Trait 구현',
    mainFile: 'main.rs',
    tags: ['Rust', 'Struct', 'Trait', 'impl'],
    files: {
      'main.rs': `// ==========================================
// 🦀 [04] Rust: 구조체와 Trait 구현
// ==========================================

trait Summary {
    fn summarize(&self) -> String;
}

struct Article {
    title: String,
    author: String,
}

impl Summary for Article {
    fn summarize(&self) -> String {
        format!("'{}' by {}", self.title, self.author)
    }
}

fn print_summary<T: Summary>(item: &T) {
    println!("요약: {}", item.summarize());
}

fn main() {
    let article = Article {
        title: String::from("Rust 2026 로드맵"),
        author: String::from("Ferris"),
    };
    print_summary(&article);
}
`,
    },
  },
  {
    id: 'rs-05-vectors-iterators',
    title: '05. 벡터(Vec) & 이터레이터 파이프라인',
    category: 'Systems & Native',
    language: 'rust',
    engine: 'wasm',
    description: 'vec! 매크로, .iter(), .map(), .filter(), .collect() 고성능 파이프라인',
    mainFile: 'main.rs',
    tags: ['Rust', 'Vec', 'Iterator', 'Functional'],
    files: {
      'main.rs': `// ==========================================
// 🦀 [05] Rust: 이터레이터 파이프라인
// ==========================================

fn main() {
    let numbers = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // 짝수를 골라 10배 곱한 후 벡터 수집
    let transformed: Vec<i32> = numbers
        .iter()
        .filter(|&&x| x % 2 == 0)
        .map(|&x| x * 10)
        .collect();

    println!("원본 벡터: {:?}", numbers);
    println!("변환 결과: {:?}", transformed);

    let sum: i32 = transformed.iter().sum();
    println!("합계: {}", sum);
}
`,
    },
  },
  {
    id: 'rs-06-error-handling-result',
    title: '06. 에러 처리 (? 연산자 & Result)',
    category: 'Systems & Native',
    language: 'rust',
    engine: 'wasm',
    description: 'Result<T, E>와 물음표(?) 연산자를 통한 간결한 에러 전파',
    mainFile: 'main.rs',
    tags: ['Rust', 'Result', 'Error Handling', '? operator'],
    files: {
      'main.rs': `// ==========================================
// 🦀 [06] Rust: ? 연산자와 Result 에러 핸들링
// ==========================================

fn parse_and_multiply(s: &str, factor: i32) -> Result<i32, std::num::ParseIntError> {
    let num = s.trim().parse::<i32>()?;
    Ok(num * factor)
}

fn main() {
    match parse_and_multiply("  42  ", 2) {
        Ok(val) => println!("계산 성공: {}", val),
        Err(e) => println!("파싱 에러: {}", e),
    }

    match parse_and_multiply("invalid_num", 2) {
        Ok(val) => println!("계산 성공: {}", val),
        Err(e) => println!("\\033[91m에러 감지: {}\\033[0m", e),
    }
}
`,
    },
  },
  {
    id: 'rs-07-generics-lifetimes',
    title: "07. 제네릭(Generics) & 라이프타임('a)",
    category: 'Systems & Native',
    language: 'rust',
    engine: 'wasm',
    description: "타입 매개변수 <T> 및 참조자 수명을 명시하는 라이프타임('a)",
    mainFile: 'main.rs',
    tags: ['Rust', 'Generics', 'Lifetimes', 'References'],
    files: {
      'main.rs': `// ==========================================
// 🦀 [07] Rust: 라이프타임과 제네릭
// ==========================================

fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}

fn main() {
    let string1 = String::from("Rustaceans");
    let string2 = "Golang";

    let result = longest(string1.as_str(), string2);
    println!("더 긴 문자열: {}", result);
}
`,
    },
  },
  {
    id: 'rs-08-smart-pointers',
    title: '08. 스마트 포인터 (Box, Rc, RefCell)',
    category: 'Systems & Native',
    language: 'rust',
    engine: 'wasm',
    description: '힙 할당 Box<T>, 참조 카운팅 Rc<T>, 내부 가변성 RefCell<T>',
    mainFile: 'main.rs',
    tags: ['Rust', 'Box', 'Rc', 'RefCell', 'Smart Pointers'],
    files: {
      'main.rs': `// ==========================================
// 🦀 [08] Rust: 스마트 포인터 (Box<T>)
// ==========================================

enum List {
    Cons(i32, Box<List>),
    Nil,
}

use List::{Cons, Nil};

fn main() {
    let list = Cons(1, Box::new(Cons(2, Box::new(Cons(3, Box::new(Nil))))));
    println!("재귀적 Box 링크드 리스트 생성 완료!");
}
`,
    },
  },
  {
    id: 'rs-09-hashmap-frequency',
    title: '09. 해시 맵(HashMap) & Entry API',
    category: 'Systems & Native',
    language: 'rust',
    engine: 'wasm',
    description: 'std::collections::HashMap의 entry() or_insert() 카운팅',
    mainFile: 'main.rs',
    tags: ['Rust', 'HashMap', 'Entry API', 'Collections'],
    files: {
      'main.rs': `// ==========================================
// 🦀 [09] Rust: HashMap Entry API 단어 카운터
// ==========================================
use std::collections::HashMap;

fn main() {
    let text = "hello world wonderful world hello rust";
    let mut map = HashMap::new();

    for word in text.split_whitespace() {
        let count = map.entry(word).or_insert(0);
        *count += 1;
    }

    println!("[단어 빈도 통계]");
    for (w, c) in &map {
        println!("  • {}: {}회", w, c);
    }
}
`,
    },
  },
  {
    id: 'rs-10-bst-tree',
    title: '10. 이진 탐색 트리 (BST 자료구조)',
    category: 'Systems & Native',
    language: 'rust',
    engine: 'wasm',
    description: 'Option<Box<TreeNode>>을 활용한 이진 탐색 트리 구현',
    mainFile: 'main.rs',
    tags: ['Rust', 'BST', 'Tree', 'Box'],
    files: {
      'main.rs': `// ==========================================
// 🦀 [10] Rust: 이진 탐색 트리 (BST)
// ==========================================

struct TreeNode {
    val: i32,
    left: Option<Box<TreeNode>>,
    right: Option<Box<TreeNode>>,
}

impl TreeNode {
    fn new(val: i32) -> Self {
        TreeNode { val, left: None, right: None }
    }

    fn insert(&mut self, val: i32) {
        if val < self.val {
            match self.left {
                Some(ref mut node) => node.insert(val),
                None => self.left = Some(Box::new(TreeNode::new(val))),
            }
        } else {
            match self.right {
                Some(ref mut node) => node.insert(val),
                None => self.right = Some(Box::new(TreeNode::new(val))),
            }
        }
    }

    fn inorder(&self, res: &mut Vec<i32>) {
        if let Some(ref l) = self.left { l.inorder(res); }
        res.push(self.val);
        if let Some(ref r) = self.right { r.inorder(res); }
    }
}

fn main() {
    let mut root = TreeNode::new(50);
    for x in [30, 70, 20, 40, 60, 80] { root.insert(x); }

    let mut sorted = Vec::new();
    root.inorder(&mut sorted);
    println!("BST 중위 순회 (정렬 출력): {:?}", sorted);
}
`,
    },
  },

  // --- [Part 2: 핵심 알고리즘 10선] ---
  {
    id: 'rs-11-algo-dfs',
    title: '11. [알고리즘] 깊이 우선 탐색 (DFS & 연결 요소)',
    category: 'Systems & Native',
    language: 'rust',
    engine: 'wasm',
    description: 'Vec 인접 리스트 기반 재귀 DFS 그래프 순회',
    mainFile: 'main.rs',
    tags: ['DFS', 'Graph', 'Recursion'],
    files: {
      'main.rs': `// ==========================================
// 🧠 [11] Rust Algorithm: 깊이 우선 탐색 (DFS)
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
    println!("\\033[96m⚡ [DFS] Rust 그래프 순회\\033[0m");
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
    id: 'rs-12-algo-bfs',
    title: '12. [알고리즘] 너비 우선 탐색 (BFS & VecDeque)',
    category: 'Systems & Native',
    language: 'rust',
    engine: 'wasm',
    description: 'VecDeque를 이용한 2D 미로 최단 거리 BFS',
    mainFile: 'main.rs',
    tags: ['BFS', 'VecDeque', 'Shortest Path'],
    files: {
      'main.rs': `// ==========================================
// 🧠 [12] Rust Algorithm: 너비 우선 탐색 (BFS) 최단 경로
// ==========================================
use std::collections::VecDeque;

fn main() {
    println!("\\033[96m⚡ [BFS] 2D 미로 최단 거리 탐색\\033[0m");
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
                let (nx, ny) = (nx as usize, ny as usize);
                if !visited[ny][nx] && maze[ny][nx] == 0 {
                    visited[ny][nx] = true;
                    queue.push_back((nx, ny, dist + 1));
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
    id: 'rs-13-algo-dp',
    title: '13. [알고리즘] 다이나믹 프로그래밍 (0/1 배낭)',
    category: 'Systems & Native',
    language: 'rust',
    engine: 'wasm',
    description: '0/1 Knapsack 배낭 DP 테이블 2차원 최적화',
    mainFile: 'main.rs',
    tags: ['DP', 'Knapsack', 'Optimization'],
    files: {
      'main.rs': `// ==========================================
// 🧠 [13] Rust Algorithm: 다이나믹 프로그래밍 (0/1 배낭)
// ==========================================
use std::cmp::max;

struct Item {
    name: &'static str,
    weight: usize,
    value: usize,
}

fn main() {
    println!("\\033[96m⚡ [DP] 0/1 Knapsack 배낭 최적화\\033[0m");
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
    id: 'rs-14-algo-binary-search',
    title: '14. [알고리즘] 이진 탐색 & binary_search',
    category: 'Systems & Native',
    language: 'rust',
    engine: 'wasm',
    description: 'slice::binary_search 및 파라메트릭 서치(랜선 자르기)',
    mainFile: 'main.rs',
    tags: ['Binary Search', 'Parametric Search'],
    files: {
      'main.rs': `// ==========================================
// 🧠 [14] Rust Algorithm: 이진 탐색 & 파라메트릭 서치
// ==========================================

fn main() {
    println!("\\033[96m⚡ [Binary Search] 이진 탐색 & 파라메트릭 서치\\033[0m");
    println!("------------------------------------------");

    let arr = [3, 7, 12, 19, 24, 38, 45, 56, 72, 88, 91];
    let target = 56;
    if let Ok(idx) = arr.binary_search(&target) {
        println!("타겟 {} 인덱스: {}", target, idx);
    }

    let cables = [802, 743, 457, 539];
    let needed = 11;
    let (mut left, mut right) = (1, 802);
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
    id: 'rs-15-algo-dijkstra',
    title: '15. [알고리즘] 다익스트라 최단 경로 (BinaryHeap)',
    category: 'Systems & Native',
    language: 'rust',
    engine: 'wasm',
    description: 'BinaryHeap을 이용한 가중치 그래프 다익스트라 최단 경로',
    mainFile: 'main.rs',
    tags: ['Dijkstra', 'BinaryHeap', 'Graph'],
    files: {
      'main.rs': `// ==========================================
// 🧠 [15] Rust Algorithm: 다익스트라 최단 경로
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

fn main() {
    println!("\\033[96m⚡ [Dijkstra] BinaryHeap 가중치 최단 경로\\033[0m");
    println!("------------------------------------------");

    let n = 5;
    let mut adj = vec![vec![]; n + 1];
    adj[1].push((2, 4)); adj[1].push((3, 2));
    adj[2].push((3, 1)); adj[2].push((4, 5));
    adj[3].push((4, 8));
    adj[4].push((5, 2));

    let mut dist = vec![usize::MAX; n + 1];
    let mut heap = BinaryHeap::new();

    dist[1] = 0;
    heap.push(State { cost: 0, position: 1 });

    while let Some(State { cost, position }) = heap.pop() {
        if cost > dist[position] { continue; }

        for &(next, edge_cost) in &adj[position] {
            let next_cost = cost + edge_cost;
            if next_cost < dist[next] {
                dist[next] = next_cost;
                heap.push(State { cost: next_cost, position: next });
            }
        }
    }

    println!("노드 1에서 노드 5까지의 최단 비용: {}", dist[5]);
}
`,
    },
  },
  {
    id: 'rs-16-algo-sorting',
    title: '16. [알고리즘] 퀵 정렬 (QuickSort Algorithm)',
    category: 'Systems & Native',
    language: 'rust',
    engine: 'wasm',
    description: '분할 정복 QuickSort 구현',
    mainFile: 'main.rs',
    tags: ['QuickSort', 'Sorting'],
    files: {
      'main.rs': `// ==========================================
// 🧠 [16] Rust Algorithm: 퀵 정렬
// ==========================================

fn quick_sort(arr: &mut [i32]) {
    if arr.len() <= 1 { return; }
    let pivot = arr[arr.len() - 1];
    let mut i = 0;

    for j in 0..arr.len() - 1 {
        if arr[j] < pivot {
            arr.swap(i, j);
            i += 1;
        }
    }
    arr.swap(i, arr.len() - 1);

    let (left, right) = arr.split_at_mut(i);
    quick_sort(left);
    quick_sort(&mut right[1..]);
}

fn main() {
    println!("\\033[96m⚡ [Sorting] 분할 정복 퀵 정렬\\033[0m");
    println!("------------------------------------------");

    let mut numbers = [64, 34, 25, 12, 22, 11, 90, 88, 45, 50, 7];
    quick_sort(&mut numbers);
    println!("정렬 결과: {:?}", numbers);
}
`,
    },
  },
  {
    id: 'rs-17-algo-backtracking',
    title: '17. [알고리즘] 백트래킹 (N-Queens 체스)',
    category: 'Systems & Native',
    language: 'rust',
    engine: 'wasm',
    description: '재귀적 유망성 검사를 통한 N-Queens 해답 탐색',
    mainFile: 'main.rs',
    tags: ['Backtracking', 'N-Queens'],
    files: {
      'main.rs': `// ==========================================
// 🧠 [17] Rust Algorithm: 백트래킹 (N-Queens)
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

fn backtrack(row: usize, n: usize, board: &mut [i32], solutions: &mut i32) {
    if row == n {
        *solutions += 1;
        return;
    }
    for col in 0..n as i32 {
        if is_safe(row, col, board) {
            board[row] = col;
            backtrack(row + 1, n, board, solutions);
            board[row] = -1;
        }
    }
}

fn main() {
    println!("\\033[96m⚡ [Backtracking] N-Queens 체스판 배치\\033[0m");
    println!("------------------------------------------");

    let n = 8;
    let mut board = vec![-1; n];
    let mut solutions = 0;
    backtrack(0, n, &mut board, &mut solutions);

    println!("{}x{} 체스판 해답 수: {}가지", n, n, solutions);
}
`,
    },
  },
  {
    id: 'rs-18-algo-two-pointers',
    title: '18. [알고리즘] 투 포인터 & 슬라이딩 윈도우',
    category: 'Systems & Native',
    language: 'rust',
    engine: 'wasm',
    description: 'Two Sum 투 포인터 선형 시간 탐색 O(N)',
    mainFile: 'main.rs',
    tags: ['Two Pointers', 'O(N)'],
    files: {
      'main.rs': `// ==========================================
// 🧠 [18] Rust Algorithm: 투 포인터 (Two Sum)
// ==========================================

fn main() {
    println!("\\033[96m⚡ [Two Pointers] O(N) 선형 탐색\\033[0m");
    println!("------------------------------------------");

    let arr = [1, 2, 3, 4, 6, 8, 9, 11, 15];
    let target = 12;

    let (mut left, mut right) = (0, arr.len() - 1);
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
    id: 'rs-19-algo-greedy',
    title: '19. [알고리즘] 그리디 알고리즘 (회의실 배정)',
    category: 'Systems & Native',
    language: 'rust',
    engine: 'wasm',
    description: '종료 시간 정렬 기반 회의실 최대 배정',
    mainFile: 'main.rs',
    tags: ['Greedy', 'Activity Selection'],
    files: {
      'main.rs': `// ==========================================
// 🧠 [19] Rust Algorithm: 그리디 (회의실 배정)
// ==========================================

struct Meeting {
    id: &'static str,
    start: usize,
    end: usize,
}

fn main() {
    println!("\\033[96m⚡ [Greedy] 회의실 배정 (Activity Selection)\\033[0m");
    println!("------------------------------------------");

    let mut meetings = vec![
        Meeting { id: "M1", start: 1, end: 4 }, Meeting { id: "M2", start: 3, end: 5 },
        Meeting { id: "M3", start: 0, end: 6 }, Meeting { id: "M4", start: 5, end: 7 },
        Meeting { id: "M5", start: 3, end: 8 }, Meeting { id: "M6", start: 5, end: 9 },
        Meeting { id: "M7", start: 6, end: 10 }, Meeting { id: "M8", start: 8, end: 11 },
        Meeting { id: "M9", start: 8, end: 12 }, Meeting { id: "M10", start: 12, end: 14 },
    ];

    meetings.sort_by_key(|m| m.end);

    let mut count = 0;
    let mut last_end = 0;

    for m in meetings {
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
  {
    id: 'rs-20-algo-trie-topo',
    title: '20. [알고리즘] 트라이 & 위상 정렬 (Trie & TopoSort)',
    category: 'Systems & Native',
    language: 'rust',
    engine: 'wasm',
    description: '트라이 사전 검색 및 진입차수(In-degree) 기반 위상 정렬',
    mainFile: 'main.rs',
    tags: ['Trie', 'Topological Sort', 'DAG'],
    files: {
      'main.rs': `// ==========================================
// 🧠 [20] Rust Algorithm: 트라이 & 위상 정렬
// ==========================================
use std::collections::{HashMap, VecDeque};

#[derive(Default)]
struct TrieNode {
    children: HashMap<char, TrieNode>,
    is_end: bool,
}

fn main() {
    println!("\\033[96m⚡ [1] Rust Trie 접두사 트리\\033[0m");
    let mut root = TrieNode::default();
    for word in ["apple", "app", "application", "banana"] {
        let mut cur = &mut root;
        for ch in word.chars() {
            cur = cur.children.entry(ch).or_default();
        }
        cur.is_end = true;
    }
    println!("  Trie 단어 사전 구축 완료 (apple, app, application, banana)");

    println!("\\n\\033[96m⚡ [2] 위상 정렬 (Topological Sort)\\033[0m");
    let n = 5;
    let mut adj = vec![vec![]; n + 1];
    let mut in_degree = vec![0; n + 1];

    let mut add_edge = |u: usize, v: usize| {
        adj[u].push(v);
        in_degree[v] += 1;
    };

    add_edge(1, 2); add_edge(2, 3); add_edge(2, 4); add_edge(3, 5); add_edge(4, 5);

    let mut q = VecDeque::new();
    for i in 1..=n { if in_degree[i] == 0 { q.push_back(i); } }

    print!("  ✨ 빌드 순서: ");
    while let Some(cur) = q.pop_front() {
        print!("{} ➔ ", cur);
        for &nxt in &adj[cur] {
            in_degree[nxt] -= 1;
            if in_degree[nxt] == 0 { q.push_back(nxt); }
        }
    }
    println!("Done");
}
`,
    },
  },
  {
    id: 'rust-21-btreemap-pattern-matching',
    title: '21. [라이브러리] Rust BTreeMap & Pattern Matching (Option / Result 함수형 파이프라인)',
    category: 'Systems & Native',
    language: 'rust',
    engine: 'wasm',
    description:
      'BTreeMap 정렬 키-값 맵, match 표현식, and_then, map_or_else를 활용한 무결점 에러 핸들링',
    mainFile: 'main.rs',
    tags: ['Rust', 'BTreeMap', 'Pattern Matching', 'Option', 'Result'],
    files: {
      'main.rs': `// ==========================================
// 🦀 [21] Rust: BTreeMap & Pattern Matching
// ==========================================
use std::collections::BTreeMap;

#[derive(Debug, PartialEq)]
enum OrderStatus {
    Pending,
    Processing(u32), // 진행률 %
    Completed,
    Failed(String),
}

fn describe_status(status: &OrderStatus) -> String {
    match status {
        OrderStatus::Pending => String::from("\\033[93m[대기 중] 접수 대기\\033[0m"),
        OrderStatus::Processing(pct) => format!("\\033[94m[처리 중] 진행률 {}%\\033[0m", pct),
        OrderStatus::Completed => String::from("\\033[92m[완료] 정상 배송 완료\\033[0m"),
        OrderStatus::Failed(err) => format!("\\033[91m[실패] 에러: {}\\033[0m", err),
    }
}

fn main() {
    println!("\\033[96m✨ [Rust BTreeMap & Enum] 정렬 맵과 패턴 매칭\\033[0m");
    println!("------------------------------------------");

    // 1. 키 기준 자동 정렬 BTreeMap
    let mut order_map = BTreeMap::new();
    order_map.insert(103, ("박지훈", OrderStatus::Completed));
    order_map.insert(101, ("김철수", OrderStatus::Processing(75)));
    order_map.insert(104, ("최유진", OrderStatus::Failed(String::from("주소 불명"))));
    order_map.insert(102, ("이영희", OrderStatus::Pending));

    println!("[BTreeMap 정렬된 주문 현황 조회]");
    for (order_id, (customer, status)) in &order_map {
        println!("  • 주문 #{:03}: {:6} ➔ {}", order_id, customer, describe_status(status));
    }

    // 2. Option / Result 함수형 체이닝
    let query_id = 101;
    let customer_name = order_map.get(&query_id)
        .map(|(name, _)| *name)
        .unwrap_or("알 수 없는 고객");

    println!("\\n[Option 파이프라인 조회]");
    println!("  ➜ 주문 #{} 고객명: \\033[92m{}\\033[0m", query_id, customer_name);
}
`,
    },
  },
];
