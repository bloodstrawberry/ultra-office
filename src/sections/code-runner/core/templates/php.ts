import type { CodeTemplate } from '../../types';

// ----------------------------------------------------------------------

export const PHP_TEMPLATES: CodeTemplate[] = [
  // --- [Part 1: 언어 문법 및 모던 PHP 10선] ---
  {
    id: 'php-01-hello-world',
    title: '01. Hello World & phpversion() 입출력',
    category: 'Backend & Scripting',
    language: 'php',
    engine: 'php',
    description: 'PHP 8.3 CLI 표준 출력 및 런타임 환경 정보',
    mainFile: 'index.php',
    tags: ['PHP', 'Hello World', 'CLI'],
    files: {
      'index.php': `<?php
// ==========================================
// 🐘 [01] PHP: Hello World & 기본 입출력
// ==========================================

echo "\\033[96m✨ Hello from PHP 8.3 (CLI / PHP-Wasm)!\\033[0m\\n";
echo "------------------------------------------\\n";
echo "PHP 버전: " . phpversion() . "\\n";
echo "SAPI 환경: " . php_sapi_name() . "\\n";
echo "PHP 알고리즘 실행 샌드박스 준비 완료\\n";
`,
    },
  },
  {
    id: 'php-02-match-expressions',
    title: '02. match 표현식 & 타입 선언',
    category: 'Backend & Scripting',
    language: 'php',
    engine: 'php',
    description: 'PHP 8+ match 표현식 및 엄격한 반환 타입 힌팅',
    mainFile: 'index.php',
    tags: ['PHP', 'match', 'Types'],
    files: {
      'index.php': `<?php
// ==========================================
// 🐘 [02] PHP: match 표현식과 타입 힌팅
// ==========================================

function getHttpStatusMessage(int $statusCode): string {
    return match ($statusCode) {
        200, 201 => "성공 (Success)",
        400 => "잘못된 요청 (Bad Request)",
        401 => "인증 필요 (Unauthorized)",
        404 => "리소스 없음 (Not Found)",
        500 => "서버 오류 (Internal Error)",
        default => "기타 상태 코드"
    };
}

echo "Status 200: " . getHttpStatusMessage(200) . "\\n";
echo "Status 404: " . getHttpStatusMessage(404) . "\\n";
`,
    },
  },
  {
    id: 'php-03-arrays-associative',
    title: '03. 연관 배열 & array_map / array_filter',
    category: 'Backend & Scripting',
    language: 'php',
    engine: 'php',
    description: '키-값 연관 배열 및 함수형 배열 조작 파이프라인',
    mainFile: 'index.php',
    tags: ['PHP', 'Arrays', 'array_map', 'array_filter'],
    files: {
      'index.php': `<?php
// ==========================================
// 🐘 [03] PHP: 연관 배열과 함수형 처리
// ==========================================

$products = [
    ["name" => "노트북", "price" => 1500000, "category" => "IT"],
    ["name" => "키보드", "price" => 120000, "category" => "IT"],
    ["name" => "커피머신", "price" => 280000, "category" => "가전"]
];

$itProducts = array_filter($products, fn($p) => $p['category'] === 'IT');
$names = array_column($itProducts, 'name');

echo "IT 제품 목록: " . implode(", ", $names) . "\\n";
`,
    },
  },
  {
    id: 'php-04-oop-constructor-promotion',
    title: '04. 생성자 프로퍼티 승급 (Constructor Promotion)',
    category: 'Backend & Scripting',
    language: 'php',
    engine: 'php',
    description: 'PHP 8+ 생성자 매개변수 프로퍼티 자동 승급 및 readonly',
    mainFile: 'index.php',
    tags: ['PHP', 'OOP', 'Constructor Promotion', 'readonly'],
    files: {
      'index.php': `<?php
// ==========================================
// 🐘 [04] PHP: 생성자 프로퍼티 승급
// ==========================================

class UserProfile {
    public function __construct(
        public readonly string $username,
        public readonly string $email,
        public int $level = 1
    ) {}

    public function getSummary(): string {
        return "{$this->username} ({$this->email}) [Lv.{$this->level}]";
    }
}

$user = new UserProfile("php_dev", "dev@php.net", 5);
echo $user->getSummary() . "\\n";
`,
    },
  },
  {
    id: 'php-05-nullsafe-operator',
    title: '05. Nullsafe 연산자 (?->) & Null Coalescing',
    category: 'Backend & Scripting',
    language: 'php',
    engine: 'php',
    description: '안전한 객체 체이닝(?->) 및 Null 병합 연산자(??)',
    mainFile: 'index.php',
    tags: ['PHP', 'Nullsafe', '??'],
    files: {
      'index.php': `<?php
// ==========================================
// 🐘 [05] PHP: Nullsafe 연산자
// ==========================================

class Address {
    public function __construct(public ?string $city = null) {}
}

class Customer {
    public function __construct(public ?Address $address = null) {}
}

$customer = new Customer(new Address("서울 강남구"));
$emptyCustomer = new Customer(null);

echo "고객 거주지: " . ($customer->address?->city ?? "미등록") . "\\n";
echo "미등록 고객 거주지: " . ($emptyCustomer->address?->city ?? "미등록") . "\\n";
`,
    },
  },
  {
    id: 'php-06-exception-custom',
    title: '06. 예외 처리 & Custom Exception',
    category: 'Backend & Scripting',
    language: 'php',
    engine: 'php',
    description: 'try-catch-finally 및 Exception 확장',
    mainFile: 'index.php',
    tags: ['PHP', 'Exception', 'try-catch'],
    files: {
      'index.php': `<?php
// ==========================================
// 🐘 [06] PHP: 예외 처리
// ==========================================

class ValidationException extends Exception {}

function register(string $email) {
    if (!str_contains($email, "@")) {
        throw new ValidationException("유효하지 않은 이메일 형식입니다: {$email}");
    }
    echo "가입 성공: {$email}\\n";
}

try {
    register("valid@test.com");
    register("invalid-email");
} catch (ValidationException $e) {
    echo "\\033[91m검증 에러: " . $e->getMessage() . "\\033[0m\\n";
} finally {
    echo "가입 프로세스 종료\\n";
}
`,
    },
  },
  {
    id: 'php-07-json-api-response',
    title: '07. JSON 직렬화 & REST 응답 헬퍼',
    category: 'Backend & Scripting',
    language: 'php',
    engine: 'php',
    description: 'json_encode, JSON_PRETTY_PRINT 및 REST API 응답 포맷팅',
    mainFile: 'index.php',
    tags: ['PHP', 'JSON', 'REST API', 'json_encode'],
    files: {
      'index.php': `<?php
// ==========================================
// 🐘 [07] PHP: JSON 직렬화
// ==========================================

$response = [
    "status" => "success",
    "code" => 200,
    "data" => [
        "userId" => 101,
        "token" => "jwt_token_example_abc123",
        "roles" => ["admin", "editor"]
    ],
    "timestamp" => date("c")
];

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\\n";
`,
    },
  },
  {
    id: 'php-08-spl-data-structures',
    title: '08. SPL 자료구조 (SplStack, SplQueue)',
    category: 'Backend & Scripting',
    language: 'php',
    engine: 'php',
    description: 'Standard PHP Library 고성능 SplStack & SplQueue',
    mainFile: 'index.php',
    tags: ['PHP', 'SPL', 'SplStack', 'SplQueue'],
    files: {
      'index.php': `<?php
// ==========================================
// 🐘 [08] PHP: SPL 스택과 큐
// ==========================================

$stack = new SplStack();
$stack->push("First");
$stack->push("Second");
$stack->push("Third");

echo "SplStack LIFO 꺼내기:\\n";
while (!$stack->isEmpty()) {
    echo "  • " . $stack->pop() . "\\n";
}
`,
    },
  },
  {
    id: 'php-09-regex-preg-match',
    title: '09. 정규표현식 (preg_match, preg_replace)',
    category: 'Backend & Scripting',
    language: 'php',
    engine: 'php',
    description: 'PCRE 정규식 패턴 매칭 및 이메일 마스킹',
    mainFile: 'index.php',
    tags: ['PHP', 'PCRE', 'preg_match', 'Regex'],
    files: {
      'index.php': `<?php
// ==========================================
// 🐘 [09] PHP: 정규표현식
// ==========================================

$log = "2026-08-25 [WARN] dev@test.co.kr from 192.168.1.1";
preg_match("/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+/", $log, $emailMatches);
preg_match("/\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b/", $log, $ipMatches);

echo "추출된 이메일: " . ($emailMatches[0] ?? "없음") . "\\n";
echo "추출된 IP 주소: " . ($ipMatches[0] ?? "없음") . "\\n";
`,
    },
  },
  {
    id: 'php-10-bst-tree',
    title: '10. 이진 탐색 트리 (BST 자료구조)',
    category: 'Backend & Scripting',
    language: 'php',
    engine: 'php',
    description: 'PHP 클래스 기반 이진 탐색 트리 구현',
    mainFile: 'index.php',
    tags: ['PHP', 'BST', 'Tree', 'Data Structures'],
    files: {
      'index.php': `<?php
// ==========================================
// 🐘 [10] PHP: 이진 탐색 트리 (BST)
// ==========================================

class TreeNode {
    public ?TreeNode $left = null;
    public ?TreeNode $right = null;
    public function __construct(public int $val) {}
}

class BST {
    public ?TreeNode $root = null;

    public function insert(int $val): void {
        $this->root = $this->insertRec($this->root, $val);
    }

    private function insertRec(?TreeNode $node, int $val): TreeNode {
        if ($node === null) return new TreeNode($val);
        if ($val < $node->val) $node->left = $this->insertRec($node->left, $val);
        else $node->right = $this->insertRec($node->right, $val);
        return $node;
    }

    public function inorder(?TreeNode $node, array &$res = []): array {
        if ($node === null) return $res;
        $this->inorder($node->left, $res);
        $res[] = $node->val;
        $this->inorder($node->right, $res);
        return $res;
    }
}

$tree = new BST();
foreach ([50, 30, 70, 20, 40, 60, 80] as $x) $tree->insert($x);

$sorted = [];
$tree->inorder($tree->root, $sorted);
echo "BST 중위 순회 (정렬 출력): " . json_encode($sorted) . "\\n";
`,
    },
  },

  // --- [Part 2: 핵심 알고리즘 10선] ---
  {
    id: 'php-11-algo-dfs',
    title: '11. [알고리즘] 깊이 우선 탐색 (DFS & 연결 요소)',
    category: 'Backend & Scripting',
    language: 'php',
    engine: 'php',
    description: '배열 기반 재귀 DFS 그래프 순회',
    mainFile: 'index.php',
    tags: ['DFS', 'Graph', 'Recursion'],
    files: {
      'index.php': `<?php
// ==========================================
// 🧠 [11] PHP Algorithm: 깊이 우선 탐색 (DFS)
// ==========================================

echo "\\033[96m⚡ [DFS] PHP 배열 기반 그래프 순회\\033[0m\\n";
echo "------------------------------------------\\n";

$graph = [
    1 => [2, 3],
    2 => [1, 4, 5],
    3 => [1, 6],
    4 => [2],
    5 => [2],
    6 => [3],
    7 => [8],
    8 => [7]
];

$visited = [];

function dfs($node, &$graph, &$visited) {
    $visited[$node] = true;
    echo "$node ";

    foreach ($graph[$node] ?? [] as $next) {
        if (!isset($visited[$next])) {
            dfs($next, $graph, $visited);
        }
    }
}

echo "노드 1 기준 DFS 순회: ";
dfs(1, $graph, $visited);
echo "\\n";
`,
    },
  },
  {
    id: 'php-12-algo-bfs',
    title: '12. [알고리즘] 너비 우선 탐색 (BFS & 2D 최단 경로)',
    category: 'Backend & Scripting',
    language: 'php',
    engine: 'php',
    description: 'SplQueue를 이용한 2D 미로 탈출 최단 거리 BFS',
    mainFile: 'index.php',
    tags: ['BFS', 'SplQueue', 'Shortest Path'],
    files: {
      'index.php': `<?php
// ==========================================
// 🧠 [12] PHP Algorithm: 너비 우선 탐색 (BFS) 최단 경로
// ==========================================

echo "\\033[96m⚡ [BFS] 2D 미로 최단 거리 탐색\\033[0m\\n";
echo "------------------------------------------\\n";

$maze = [
    [0, 0, 1, 0, 0, 0],
    [1, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 1, 0],
    [0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0]
];

$H = count($maze);
$W = count($maze[0]);

$queue = new SplQueue();
$visited = array_fill(0, $H, array_fill(0, $W, false));

$queue->enqueue([0, 0, 1]);
$visited[0][0] = true;

$dx = [0, 0, 1, -1];
$dy = [1, -1, 0, 0];
$ans = -1;

while (!$queue->isEmpty()) {
    [$x, $y, $dist] = $queue->dequeue();

    if ($x === $W - 1 && $y === $H - 1) {
        $ans = $dist;
        break;
    }

    for ($i = 0; $i < 4; $i++) {
        $nx = $x + $dx[$i];
        $ny = $y + $dy[$i];

        if ($nx >= 0 && $nx < $W && $ny >= 0 && $ny < $H) {
            if (!$visited[$ny][$nx] && $maze[$ny][$nx] === 0) {
                $visited[$ny][$nx] = true;
                $queue->enqueue([$nx, $ny, $dist + 1]);
            }
        }
    }
}

echo "✨ 미로 탈출 최단 거리: {$ans}칸\\n";
`,
    },
  },
  {
    id: 'php-13-algo-dp',
    title: '13. [알고리즘] 다이나믹 프로그래밍 (DP & 0/1 배낭)',
    category: 'Backend & Scripting',
    language: 'php',
    engine: 'php',
    description: '0/1 Knapsack 배낭 DP 테이블 2차원 최적화',
    mainFile: 'index.php',
    tags: ['DP', 'Knapsack', 'Optimization'],
    files: {
      'index.php': `<?php
// ==========================================
// 🧠 [13] PHP Algorithm: 다이나믹 프로그래밍 (0/1 배낭)
// ==========================================

echo "\\033[96m⚡ [DP] 0/1 Knapsack 배낭 최적화\\033[0m\\n";
echo "------------------------------------------\\n";

$items = [
    ["name" => "노트북", "weight" => 3, "value" => 50],
    ["name" => "카메라", "weight" => 1, "value" => 40],
    ["name" => "스마트폰", "weight" => 1, "value" => 30],
    ["name" => "보조배터리", "weight" => 2, "value" => 20],
    ["name" => "헤드폰", "weight" => 2, "value" => 35],
];

$capacity = 5;
$n = count($items);
$dp = array_fill(0, $n + 1, array_fill(0, $capacity + 1, 0));

for ($i = 1; $i <= $n; $i++) {
    $w = $items[$i - 1]["weight"];
    $v = $items[$i - 1]["value"];
    for ($cap = 0; cap <= $capacity; $cap++) {
        if ($w <= $cap) {
            $dp[$i][$cap] = max($dp[$i - 1][$cap], $dp[$i - 1][$cap - $w] + $v);
        } else {
            $dp[$i][$cap] = $dp[$i - 1][$cap];
        }
    }
}

echo "✨ 배낭에 담을 수 있는 최대 가치: " . $dp[$n][$capacity] . "만원\\n";
`,
    },
  },
  {
    id: 'php-14-algo-binary-search',
    title: '14. [알고리즘] 이진 탐색 & 파라메트릭 서치',
    category: 'Backend & Scripting',
    language: 'php',
    engine: 'php',
    description: '이진 탐색 및 파라메트릭 서치(랜선 자르기)',
    mainFile: 'index.php',
    tags: ['Binary Search', 'Parametric Search'],
    files: {
      'index.php': `<?php
// ==========================================
// 🧠 [14] PHP Algorithm: 이진 탐색 & 파라메트릭 서치
// ==========================================

echo "\\033[96m⚡ [Binary Search] 이진 탐색 & 파라메트릭 서치\\033[0m\\n";
echo "------------------------------------------\\n";

function binarySearch($arr, $target) {
    $l = 0;
    $r = count($arr) - 1;
    while ($l <= $r) {
        $mid = intdiv($l + $r, 2);
        if ($arr[$mid] === $target) return $mid;
        if ($arr[$mid] < $target) $l = $mid + 1;
        else $r = $mid - 1;
    }
    return -1;
}

$arr = [3, 7, 12, 19, 24, 38, 45, 56, 72, 88, 91];
$target = 56;
echo "타겟 $target 위치 인덱스: " . binarySearch($arr, $target) . "\\n";

// 파라메트릭 서치
$cables = [802, 743, 457, 539];
$needed = 11;
$left = 1;
$right = 802;
$best = 0;

while ($left <= $right) {
    $mid = intdiv($left + $right, 2);
    $count = 0;
    foreach ($cables as $c) $count += intdiv($c, $mid);

    if ($count >= $needed) {
        $best = $mid;
        $left = $mid + 1;
    } else {
        $right = $mid - 1;
    }
}

echo "✨ 만들 수 있는 최대 랜선 길이: {$best}cm\\n";
`,
    },
  },
  {
    id: 'php-15-algo-dijkstra',
    title: '15. [알고리즘] 다익스트라 최단 경로 (Dijkstra Algorithm)',
    category: 'Backend & Scripting',
    language: 'php',
    engine: 'php',
    description: '가중치 연관 배열 그래프 기반 다익스트라 최단 경로',
    mainFile: 'index.php',
    tags: ['Dijkstra', 'Graph'],
    files: {
      'index.php': `<?php
// ==========================================
// 🧠 [15] PHP Algorithm: 다익스트라 최단 경로
// ==========================================

echo "\\033[96m⚡ [Dijkstra] 가중치 그래프 최단 경로\\033[0m\\n";
echo "------------------------------------------\\n";

$graph = [
    'A' => [['to' => 'B', 'cost' => 4], ['to' => 'C', 'cost' => 2]],
    'B' => [['to' => 'C', 'cost' => 1], ['to' => 'D', 'cost' => 5]],
    'C' => [['to' => 'B', 'cost' => 1], ['to' => 'D', 'cost' => 8], ['to' => 'E', 'cost' => 10]],
    'D' => [['to' => 'E', 'cost' => 2], ['to' => 'Z', 'cost' => 6]],
    'E' => [['to' => 'D', 'cost' => 2], ['to' => 'Z', 'cost' => 3]],
    'Z' => []
];

$dist = [];
foreach ($graph as $k => $v) $dist[$k] = INF;
$dist['A'] = 0;
$unvisited = array_keys($graph);

while (!empty($unvisited)) {
    $minD = INF;
    $curr = null;
    $currIdx = -1;

    foreach ($unvisited as $idx => $node) {
        if ($dist[$node] < $minD) {
            $minD = $dist[$node];
            $curr = $node;
            $currIdx = $idx;
        }
    }

    if ($curr === null || $minD === INF) break;
    array_splice($unvisited, $currIdx, 1);

    foreach ($graph[$curr] as $edge) {
        $to = $edge['to'];
        $cost = $edge['cost'];
        if ($dist[$curr] + $cost < $dist[$to]) {
            $dist[$to] = $dist[$curr] + $cost;
        }
    }
}

echo "출발지 [A] 기준 최단 비용: Z ➔ " . $dist['Z'] . "\\n";
`,
    },
  },
  {
    id: 'php-16-algo-sorting',
    title: '16. [알고리즘] 퀵 정렬 (QuickSort Algorithm)',
    category: 'Backend & Scripting',
    language: 'php',
    engine: 'php',
    description: '분할 정복 QuickSort 구현',
    mainFile: 'index.php',
    tags: ['QuickSort', 'Sorting'],
    files: {
      'index.php': `<?php
// ==========================================
// 🧠 [16] PHP Algorithm: 퀵 정렬
// ==========================================

function quickSort($arr) {
    if (count($arr) <= 1) return $arr;
    $pivot = $arr[intdiv(count($arr), 2)];
    $left = [];
    $mid = [];
    $right = [];

    foreach ($arr as $x) {
        if ($x < $pivot) $left[] = $x;
        elseif ($x === $pivot) $mid[] = $x;
        else $right[] = $x;
    }

    return array_merge(quickSort($left), $mid, quickSort($right));
}

echo "\\033[96m⚡ [Sorting] 분할 정복 퀵 정렬\\033[0m\\n";
echo "------------------------------------------\\n";

$numbers = [64, 34, 25, 12, 22, 11, 90, 88, 45, 50, 7];
echo "정렬 결과: " . json_encode(quickSort($numbers)) . "\\n";
`,
    },
  },
  {
    id: 'php-17-algo-backtracking',
    title: '17. [알고리즘] 백트래킹 (N-Queens 체스)',
    category: 'Backend & Scripting',
    language: 'php',
    engine: 'php',
    description: '재귀적 유망성 검사를 통한 N-Queens 해답 탐색',
    mainFile: 'index.php',
    tags: ['Backtracking', 'N-Queens'],
    files: {
      'index.php': `<?php
// ==========================================
// 🧠 [17] PHP Algorithm: 백트래킹 (N-Queens)
// ==========================================

$solutions = 0;

function isSafe($row, $col, &$board) {
    for ($r = 0; $r < $row; $r++) {
        $c = $board[$r];
        if ($c === $col || abs($row - $r) === abs($col - c)) {
            return false;
        }
    }
    return true;
}

function backtrack($row, $n, &$board, &$solutions) {
    if ($row === $n) {
        $solutions++;
        return;
    }
    for ($col = 0; $col < $n; $col++) {
        if (isSafe($row, $col, board)) {
            $board[$row] = $col;
            backtrack($row + 1, $n, $board, $solutions);
            $board[$row] = -1;
        }
    }
}

echo "\\033[96m⚡ [Backtracking] N-Queens 체스판 배치\\033[0m\\n";
echo "------------------------------------------\\n";

$N = 8;
$board = array_fill(0, $N, -1);
backtrack(0, $N, $board, $solutions);

echo "{$N}x{$N} 체스판 유효한 퀸 배치 해답: {$solutions}가지\\n";
`,
    },
  },
  {
    id: 'php-18-algo-two-pointers',
    title: '18. [알고리즘] 투 포인터 & 슬라이딩 윈도우',
    category: 'Backend & Scripting',
    language: 'php',
    engine: 'php',
    description: 'Two Sum 투 포인터 선형 시간 탐색 O(N)',
    mainFile: 'index.php',
    tags: ['Two Pointers', 'O(N)'],
    files: {
      'index.php': `<?php
// ==========================================
// 🧠 [18] PHP Algorithm: 투 포인터 (Two Sum)
// ==========================================

echo "\\033[96m⚡ [Two Pointers] O(N) 선형 탐색\\033[0m\\n";
echo "------------------------------------------\\n";

$arr = [1, 2, 3, 4, 6, 8, 9, 11, 15];
$target = 12;
$l = 0;
$r = count($arr) - 1;

echo "합이 {$target}인 쌍:\\n";
while ($l < $r) {
    $sum = $arr[$l] + $arr[$r];
    if ($sum === $target) {
        echo "  ➜ ({$arr[$l]} + {$arr[$r]} = 12)\\n";
        $l++;
        $r--;
    } elseif ($sum < $target) {
        $l++;
    } else {
        $r--;
    }
}
`,
    },
  },
  {
    id: 'php-19-algo-greedy',
    title: '19. [알고리즘] 그리디 알고리즘 (회의실 배정)',
    category: 'Backend & Scripting',
    language: 'php',
    engine: 'php',
    description: '종료 시간 정렬 기반 회의실 최대 배정',
    mainFile: 'index.php',
    tags: ['Greedy', 'Activity Selection'],
    files: {
      'index.php': `<?php
// ==========================================
// 🧠 [19] PHP Algorithm: 그리디 (회의실 배정)
// ==========================================

echo "\\033[96m⚡ [Greedy] 회의실 배정 (Activity Selection)\\033[0m\\n";
echo "------------------------------------------\\n";

$meetings = [
    ["id" => "M1", "start" => 1, "end" => 4],
    ["id" => "M2", "start" => 3, "end" => 5],
    ["id" => "M3", "start" => 0, "end" => 6],
    ["id" => "M4", "start" => 5, "end" => 7],
    ["id" => "M5", "start" => 3, "end" => 8],
    ["id" => "M6", "start" => 5, "end" => 9],
    ["id" => "M7", "start" => 6, "end" => 10],
    ["id" => "M8", "start" => 8, "end" => 11],
    ["id" => "M9", "start" => 8, "end" => 12],
    ["id" => "M10", "start" => 12, "end" => 14],
];

usort($meetings, fn($a, $b) => $a['end'] <=> $b['end']);

$count = 0;
$lastEnd = 0;

foreach ($meetings as $m) {
    if ($m['start'] >= $lastEnd) {
        $count++;
        $lastEnd = $m['end'];
        echo "  ➜ {$m['id']}: {$m['start']}시 ~ {$m['end']}시\\n";
    }
}

echo "✨ 배정 가능한 최대 회의 수: {$count}개\\n";
`,
    },
  },
  {
    id: 'php-20-algo-trie-topo',
    title: '20. [알고리즘] 트라이 & 위상 정렬 (Trie & TopoSort)',
    category: 'Backend & Scripting',
    language: 'php',
    engine: 'php',
    description: '트라이 사전 검색 및 진입차수(In-degree) 기반 위상 정렬',
    mainFile: 'index.php',
    tags: ['Trie', 'Topological Sort', 'DAG'],
    files: {
      'index.php': `<?php
// ==========================================
// 🧠 [20] PHP Algorithm: 트라이 & 위상 정렬
// ==========================================

echo "\\033[96m⚡ [1] PHP Trie 접두사 트리\\033[0m\\n";
class TrieNode {
    public array $children = [];
    public bool $isEnd = false;
}

$root = new TrieNode();
foreach (["apple", "app", "application", "banana"] as $word) {
    $cur = $root;
    for ($i = 0; $i < strlen($word); $i++) {
        $ch = $word[$i];
        if (!isset($cur->children[$ch])) $cur->children[$ch] = new TrieNode();
        $cur = $cur->children[$ch];
    }
    $cur->isEnd = true;
}
echo "  단어 사전 삽입 완료 (apple, app, application, banana)\\n";

echo "\\n\\033[96m⚡ [2] 위상 정렬 (Topological Sort)\\033[0m\\n";
$n = 5;
$adj = array_fill(1, $n, []);
$inDegree = array_fill(1, $n, 0);

$addEdge = function($u, $v) use (&$adj, &$inDegree) {
    $adj[$u][] = $v;
    $inDegree[$v]++;
};

$addEdge(1, 2); $addEdge(2, 3); $addEdge(2, 4); $addEdge(3, 5); $addEdge(4, 5);

$q = [];
for ($i = 1; $i <= $n; $i++) if ($inDegree[$i] === 0) $q[] = $i;

$order = [];
while (!empty($q)) {
    $cur = array_shift($q);
    $order[] = $cur;
    foreach ($adj[$cur] as $nxt) {
        $inDegree[$nxt]--;
        if ($inDegree[$nxt] === 0) $q[] = $nxt;
    }
}

echo "  ✨ 빌드 순서: " . implode(" ➔ ", $order) . "\\n";
`,
    },
  },
  {
    id: 'php-21-array-functional-pipelines',
    title: '21. [라이브러리] PHP 배열 함수형 파이프라인 (array_reduce & array_chunk)',
    category: 'Backend & Scripting',
    language: 'php',
    engine: 'php',
    description: 'array_reduce, array_chunk, array_column, array_map을 활용한 e-커머스 주문 집계',
    mainFile: 'index.php',
    tags: ['PHP', 'Arrays', 'array_reduce', 'array_chunk', 'Data Pipeline'],
    files: {
      'index.php': `<?php
// ==========================================
// 🐘 [21] PHP: 배열 함수형 데이터 파이프라인
// ==========================================

echo "\\033[96m✨ [PHP Array Functions] 함수형 데이터 집계 파이프라인\\033[0m\\n";
echo "------------------------------------------\\n";

$transactions = [
    ["id" => "TX101", "user" => "김철수", "amount" => 150000, "status" => "PAID"],
    ["id" => "TX102", "user" => "이영희", "amount" => 45000,  "status" => "PAID"],
    ["id" => "TX103", "user" => "박지훈", "amount" => 89000,  "status" => "CANCELLED"],
    ["id" => "TX104", "user" => "최유진", "amount" => 230000, "status" => "PAID"],
    ["id" => "TX105", "user" => "정다은", "amount" => 12000,  "status" => "PAID"],
];

// 1. 결제 완료 건 필터링 & 총 매출 계산 (array_reduce)
$paidList = array_filter($transactions, fn($t) => $t['status'] === 'PAID');
$totalRevenue = array_reduce($paidList, fn($carry, $item) => $carry + $item['amount'], 0);

echo "[1] 결제 완료 요약:\\n";
echo "  • 완료 건수: " . count($paidList) . "건\\n";
echo "  • 총 결제액: \\033[92m" . number_format($totalRevenue) . "원\\033[0m\\n";

// 2. 배치 처리를 위한 청크 분할 (array_chunk)
$batches = array_chunk($paidList, 2);
echo "\\n[2] 2건 단위 일괄 배치 처리 (array_chunk):\\n";
foreach ($batches as $idx => $batch) {
    $ids = implode(", ", array_column($batch, 'id'));
    echo "  • 배치 #" . ($idx + 1) . ": [ {$ids} ]\\n";
}
`,
    },
  },
  {
    id: 'php-22-pcre-regex-validation',
    title: '22. [라이브러리] PCRE 정규식 & preg_replace_callback',
    category: 'Backend & Scripting',
    language: 'php',
    engine: 'php',
    description: 'PCRE 고급 정규표현식, preg_match_all 및 콜백 치환을 통한 포맷터',
    mainFile: 'index.php',
    tags: ['PHP', 'PCRE', 'Regex', 'preg_match_all', 'Validation'],
    files: {
      'index.php': `<?php
// ==========================================
// 🐘 [22] PHP: PCRE 정규표현식 & 콜백 치환
// ==========================================

echo "\\033[96m✨ [PHP PCRE] 정규표현식 데이터 정제\\033[0m\\n";
echo "------------------------------------------\\n";

$text = "고객 문의 목록: user_101 (chulsoo@corp.com) / user_202 (younghee@test.co.kr) / user_303 (invalid-email)";

// 1. 유효한 이메일 전체 추출 (preg_match_all)
$pattern = "/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+/";
preg_match_all($pattern, $text, $matches);

echo "[1] 추출된 이메일 목록:\\n";
foreach ($matches[0] as $email) {
    echo "  ➜ {$email}\\n";
}

// 2. 이메일 도메인 마스킹 처리 (preg_replace_callback)
$masked = preg_replace_callback(
    "/([a-zA-Z0-9_.+-]{2})([a-zA-Z0-9_.+-]*)@([a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+)/",
    fn($m) => $m[1] . str_repeat("*", max(2, strlen($m[2]))) . "@" . $m[3],
    $text
);

echo "\\n[2] 개인정보 마스킹 결과:\\n";
echo "  {$masked}\\n";
`,
    },
  },
  {
    id: 'php-23-modern-php8-features',
    title: '23. [라이브러리] Modern PHP 8 (Enums, Readonly & Match)',
    category: 'Backend & Scripting',
    language: 'php',
    engine: 'php',
    description: 'PHP 8.2+ 백킹 Enum, Readonly 클래스, Match 표현식 및 Nullsafe 체이닝',
    mainFile: 'index.php',
    tags: ['PHP', 'PHP 8', 'Enums', 'Readonly', 'OOP'],
    files: {
      'index.php': `<?php
// ==========================================
// 🐘 [23] PHP: 모던 PHP 8 기능 (Enums & Readonly)
// ==========================================

echo "\\033[96m✨ [Modern PHP 8] Enums & Readonly 클래스\\033[0m\\n";
echo "------------------------------------------\\n";

enum OrderStatus: string {
    case PENDING = "주문 접수";
    case PROCESSING = "상품 준비 중";
    case SHIPPED = "배송 출발";
    case DELIVERED = "배송 완료";

    public function color(): string {
        return match ($this) {
            self::PENDING => "\\033[93m",
            self::PROCESSING => "\\033[94m",
            self::SHIPPED, self::DELIVERED => "\\033[92m",
        };
    }
}

readonly class OrderItem {
    public function __construct(
        public string $name,
        public int $price,
        public int $quantity = 1
    ) {}

    public function getTotal(): int {
        return $this->price * $this->quantity;
    }
}

$item = new OrderItem("무선 기계식 키보드", 159000, 2);
$status = OrderStatus::SHIPPED;

echo "주문 상품: {$item->name} (수량: {$item->quantity}개)\\n";
echo "총 결제액: " . number_format($item->getTotal()) . "원\\n";
echo "배송 현황: " . $status->color() . $status->value . "\\033[0m\\n";
`,
    },
  },
  {
    id: 'php-24-spl-datastructures',
    title: '24. [라이브러리] PHP SPL 표준 자료구조 (SplStack & SplPriorityQueue)',
    category: 'Backend & Scripting',
    language: 'php',
    engine: 'php',
    description: 'SPL 고성능 내장 자료구조(SplStack LIFO, SplPriorityQueue 우선순위 큐) 활용',
    mainFile: 'index.php',
    tags: ['PHP', 'SPL', 'SplStack', 'SplPriorityQueue', 'Data Structures'],
    files: {
      'index.php': `<?php
// ==========================================
// 🐘 [24] PHP: SPL 표준 자료구조
// ==========================================

echo "\\033[96m✨ [PHP SPL] 스택 & 우선순위 큐 자료구조\\033[0m\\n";
echo "------------------------------------------\\n";

// 1. SplStack (LIFO: 후입선출)
$stack = new SplStack();
$stack->push("요청 #1 (일반 조회)");
$stack->push("요청 #2 (장바구니 담기)");
$stack->push("요청 #3 (결제하기)");

echo "[1] SplStack LIFO 인출 순서:\\n";
while (!$stack->isEmpty()) {
    echo "  ➜ 처리 중: " . $stack->pop() . "\\n";
}

// 2. SplPriorityQueue (우선순위 큐)
$queue = new SplPriorityQueue();
$queue->insert("서버 백업 작업", 10);
$queue->insert("긴급 보안 패치", 90);
$queue->insert("일일 통계 집계", 30);
$queue->insert("고객 문의 이메일 발송", 50);

echo "\\n[2] SplPriorityQueue 우선순위 순차 실행:\\n";
while ($queue->valid()) {
    echo "  • \\033[92m[우선순위 처리]\\033[0m " . $queue->current() . "\\n";
    $queue->next();
}
`,
    },
  },
  {
    id: 'php-25-datetime-immutable-business-days',
    title: '25. [라이브러리] PHP DateTimeImmutable & DateInterval 비즈니스 영업일 계산',
    category: 'Backend & Scripting',
    language: 'php',
    engine: 'php',
    description:
      '불변 날짜 객체 DateTimeImmutable, DateInterval을 활용한 정산일 및 주말 제외 영업일 계산',
    mainFile: 'index.php',
    tags: ['PHP', 'DateTimeImmutable', 'DateInterval', 'Business Days'],
    files: {
      'index.php': `<?php
// ==========================================
// 🐘 [25] PHP: DateTimeImmutable & 비즈니스 일자
// ==========================================

echo "\\033[96m✨ [PHP DateTime] 불변 날짜 객체 & 영업일 계산\\033[0m\\n";
echo "------------------------------------------\\n";

$startDate = new DateTimeImmutable('2026-08-28');
$settlementInterval = new DateInterval('P14D'); // 14일 후 정산

$settlementDate = $startDate->add($settlementInterval);

echo "[1] 정산 기준일 계산:\\n";
echo "  • 결제 발생일: " . $startDate->format('Y-m-d (D)') . "\\n";
echo "  • 정산 예정일 (D+14): \\033[92m" . $settlementDate->format('Y-m-d (D)') . "\\033[0m\\n";

// 주말 제외 5영업일 후 마감일 계산 함수
function addBusinessDays(DateTimeImmutable $date, int $days): DateTimeImmutable {
    $cur = $date;
    $added = 0;
    while ($added < $days) {
        $cur = $cur->modify('+1 day');
        if ($cur->format('N') < 6) { // 1(월) ~ 5(금)
            $added++;
        }
    }
    return $cur;
}

$deadline = addBusinessDays($startDate, 5);
echo "\\n[2] 주말 제외 5영업일 후 업무 마감일:\\n";
echo "  ➜ 최종 마감일시: \\033[96m" . $deadline->format('Y년 m월 d일 (D)') . "\\033[0m\\n";
`,
    },
  },
  {
    id: 'php-26-jwt-hash-token-generator',
    title: '26. [라이브러리] PHP JWT 토큰 생성 & HMAC-SHA256 해시',
    category: 'Backend & Scripting',
    language: 'php',
    engine: 'php',
    description:
      'PHP hash_hmac, base64_encode를 이용한 표준 JSON Web Token (JWT) 생성 및 서명 검증기',
    mainFile: 'index.php',
    tags: ['PHP', 'JWT', 'HMAC', 'hash_hmac', 'Security'],
    files: {
      'index.php': `<?php
// ==========================================
// 🐘 [26] PHP: JWT 토큰 발급 & HMAC-SHA256
// ==========================================

echo "\\033[96m✨ [PHP Security] JWT 토큰 발급 및 서명 검증\\033[0m\\n";
echo "------------------------------------------\\n";

function base64UrlEncode(string $data): string {
    return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
}

$secretKey = "super-secret-production-key-2026";

// 1. Header & Payload 생성
$header = json_encode(['alg' => 'HS256', 'typ' => 'JWT']);
$payload = json_encode([
    'sub' => 'user_10293',
    'name' => '홍길동',
    'role' => 'ADMIN',
    'iat' => time(),
    'exp' => time() + 3600
]);

$base64Header = base64UrlEncode($header);
$base64Payload = base64UrlEncode($payload);

// 2. HMAC-SHA256 디지털 서명 생성
$signature = hash_hmac('sha256', "{$base64Header}.{$base64Payload}", $secretKey, true);
$base64Signature = base64UrlEncode($signature);

$jwtToken = "{$base64Header}.{$base64Payload}.{$base64Signature}";

echo "[1] 발급된 JWT 토큰:\\n";
echo "  \\033[92m{$jwtToken}\\033[0m\\n\\n";

// 3. 서명 무결성 검증
$parts = explode('.', $jwtToken);
$expectedSig = base64UrlEncode(hash_hmac('sha256', "{$parts[0]}.{$parts[1]}", $secretKey, true));

echo "[2] 토큰 서명 유효성 검증:\\n";
if (hash_equals($expectedSig, $parts[2])) {
    echo "  • 상태: \\033[92m[서명 유효] 인증 성공!\\033[0m\\n";
    echo "  • 사용자 정보: " . $payload . "\\n";
} else {
    echo "  • 상태: \\033[91m[서명 불일치] 위조된 토큰\\033[0m\\n";
}
`,
    },
  },
];
