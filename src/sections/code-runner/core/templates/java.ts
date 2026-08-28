import type { CodeTemplate } from '../../types';

// ----------------------------------------------------------------------

export const JAVA_TEMPLATES: CodeTemplate[] = [
  // --- [Part 1: 언어 문법 및 프레임워크 10선] ---
  {
    id: 'java-01-hello-world',
    title: '01. Hello World & 표준 입출력',
    category: 'Backend & Scripting',
    language: 'java',
    engine: 'wasm',
    description: 'OpenJDK Java 21 메인 클래스 및 System.out 표준 출력',
    mainFile: 'Main.java',
    tags: ['Java', 'Hello World', 'System.out'],
    files: {
      'Main.java': `// ==========================================
// ☕ [01] Java: Hello World & 표준 입출력
// ==========================================

public class Main {
    public static void main(String[] args) {
        System.out.println("\\033[96m✨ Hello from Java 21 (OpenJDK / Wasm JVM)!\\033[0m");
        System.out.println("------------------------------------------");

        String javaVersion = System.getProperty("java.version", "21-ea");
        System.out.println("자바 런타임 버전: " + javaVersion);
        System.out.println("가상 머신: OpenJDK 64-Bit Server VM (Wasm)");
        System.out.println("자바 21 알고리즘 템플릿 로드 완료!");
    }
}
`,
    },
  },
  {
    id: 'java-02-variables-types',
    title: '02. 원시 타입, 참조 타입 & 오토박싱',
    category: 'Backend & Scripting',
    language: 'java',
    engine: 'wasm',
    description: 'int vs Integer 오토박싱/언박싱, var 로컬 변수 타입 추론',
    mainFile: 'Main.java',
    tags: ['Java', 'Primitives', 'Autoboxing', 'var'],
    files: {
      'Main.java': `// ==========================================
// ☕ [02] Java: 변수와 오토박싱 (var 키워드)
// ==========================================

public class Main {
    public static void main(String[] args) {
        var name = "김자바";
        var age = 28;
        var scores = new int[]{90, 85, 95};

        System.out.println("개발자: " + name + " (" + age + "세)");

        int sum = 0;
        for (int s : scores) sum += s;
        double avg = (double) sum / scores.length;

        System.out.printf("총점: %d점, 평균: %.2f점%n", sum, avg);
    }
}
`,
    },
  },
  {
    id: 'java-03-switch-expressions',
    title: '03. 패턴 매칭 & Switch 표현식',
    category: 'Backend & Scripting',
    language: 'java',
    engine: 'wasm',
    description: 'Java 21 향상된 switch-case 표현식과 화살표 구문',
    mainFile: 'Main.java',
    tags: ['Java', 'Switch Expressions', 'Pattern Matching'],
    files: {
      'Main.java': `// ==========================================
// ☕ [03] Java: Modern Switch 표현식
// ==========================================

public class Main {
    public static void main(String[] args) {
        String day = "MONDAY";
        String activity = switch (day) {
            case "MONDAY", "TUESDAY" -> "코드 리뷰 & 스프린트 플래닝";
            case "WEDNESDAY", "THURSDAY" -> "코어 기능 개발 및 알고리즘 최적화";
            case "FRIDAY" -> "릴리즈 배포 및 QA 테스트";
            case "SATURDAY", "SUNDAY" -> "재충전 및 오픈소스 탐색";
            default -> "알 수 없는 요일";
        };

        System.out.println("요일: " + day);
        System.out.println("업무: " + activity);
    }
}
`,
    },
  },
  {
    id: 'java-04-recursion-methods',
    title: '04. 메서드 & 재귀 팩토리얼 / 피보나치',
    category: 'Backend & Scripting',
    language: 'java',
    engine: 'wasm',
    description: '메서드 오버로딩 및 재귀적 팩토리얼, 피보나치 수열',
    mainFile: 'Main.java',
    tags: ['Java', 'Methods', 'Recursion'],
    files: {
      'Main.java': `// ==========================================
// ☕ [04] Java: 재귀 함수와 메모이제이션
// ==========================================

public class Main {
    static long factorial(int n) {
        if (n <= 1) return 1;
        return n * factorial(n - 1);
    }

    static long fibonacci(int n, long[] memo) {
        if (n <= 1) return n;
        if (memo[n] != 0) return memo[n];
        return memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);
    }

    public static void main(String[] args) {
        System.out.println("10! (팩토리얼): " + factorial(10));

        long[] memo = new long[31];
        System.out.println("피보나치 30번째 수: " + fibonacci(30, memo));
    }
}
`,
    },
  },
  {
    id: 'java-05-collections-framework',
    title: '05. 컬렉션 프레임워크 (List.of, Map.of)',
    category: 'Backend & Scripting',
    language: 'java',
    engine: 'wasm',
    description: '불변 컬렉션 팩토리 메서드 및 HashMap/ArrayList 조작',
    mainFile: 'Main.java',
    tags: ['Java', 'Collections', 'List.of', 'Map.of'],
    files: {
      'Main.java': `// ==========================================
// ☕ [05] Java: 불변 컬렉션 & Map
// ==========================================
import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<String> frameworkList = List.of("Spring Boot", "Quarkus", "Micronaut");
        Map<String, Integer> portMap = Map.of(
            "Frontend", 3000,
            "Backend", 8080,
            "Database", 5432
        );

        System.out.println("추천 자바 프레임워크: " + frameworkList);
        System.out.println("서비스 포트 매핑:");
        portMap.forEach((svc, port) -> System.out.println("  • " + svc + " ➜ " + port));
    }
}
`,
    },
  },
  {
    id: 'java-06-records-oop',
    title: '06. Record 불변 객체 & OOP 클래스',
    category: 'Backend & Scripting',
    language: 'java',
    engine: 'wasm',
    description: 'Java 16+ Record 불변 데이터 캐리어 및 상속',
    mainFile: 'Main.java',
    tags: ['Java', 'Records', 'OOP', 'Data Class'],
    files: {
      'Main.java': `// ==========================================
// ☕ [06] Java: Record 불변 데이터 모델
// ==========================================

public class Main {
    public record UserDto(String id, String username, String email, int level) {
        public UserDto {
            if (level < 1) throw new IllegalArgumentException("레벨은 1 이상이어야 합니다.");
        }
    }

    public static void main(String[] args) {
        UserDto user = new UserDto("USR_01", "alice", "alice@java.org", 5);
        System.out.println("생성된 유저 레코드:");
        System.out.println("  ID: " + user.id());
        System.out.println("  Username: " + user.username());
        System.out.println("  Email: " + user.email());
        System.out.println("  Level: Lv." + user.level());
    }
}
`,
    },
  },
  {
    id: 'java-07-exception-handling',
    title: '07. Checked Exception & Custom Exception',
    category: 'Backend & Scripting',
    language: 'java',
    engine: 'wasm',
    description: 'try-with-resources, 멀티 catch 블록 및 사용자 정의 예외',
    mainFile: 'Main.java',
    tags: ['Java', 'Exception', 'try-with-resources'],
    files: {
      'Main.java': `// ==========================================
// ☕ [07] Java: 예외 처리와 커스텀 Exception
// ==========================================

class InvalidTransactionException extends Exception {
    public InvalidTransactionException(String msg) { super(msg); }
}

public class Main {
    static void processPayment(int amount) throws InvalidTransactionException {
        if (amount <= 0) throw new InvalidTransactionException("결제액은 0원보다 커야 합니다.");
        System.out.println("결제 성공: " + amount + "원");
    }

    public static void main(String[] args) {
        try {
            processPayment(50000);
            processPayment(-1000);
        } catch (InvalidTransactionException e) {
            System.out.println("\\033[91m예외 발생: " + e.getMessage() + "\\033[0m");
        }
    }
}
`,
    },
  },
  {
    id: 'java-08-streams-lambda',
    title: '08. 스트림 API & 람다 표현식',
    category: 'Backend & Scripting',
    language: 'java',
    engine: 'wasm',
    description: 'Stream filter, map, collect(toList), groupingBy 집계',
    mainFile: 'Main.java',
    tags: ['Java', 'Stream API', 'Lambda', 'Functional'],
    files: {
      'Main.java': `// ==========================================
// ☕ [08] Java: Stream API & 함수형 처리
// ==========================================
import java.util.*;
import java.util.stream.Collectors;

public class Main {
    public record Product(String name, String category, int price) {}

    public static void main(String[] args) {
        List<Product> list = List.of(
            new Product("노트북", "IT", 1500000),
            new Product("키보드", "IT", 120000),
            new Product("커피머신", "가전", 280000),
            new Product("마우스", "IT", 65000)
        );

        List<String> itProducts = list.stream()
            .filter(p -> p.category().equals("IT"))
            .map(Product::name)
            .collect(Collectors.toList());

        System.out.println("IT 카테고리 상품: " + itProducts);

        int total = list.stream().mapToInt(Product::price).sum();
        System.out.println("전체 상품 총액: " + total + "원");
    }
}
`,
    },
  },
  {
    id: 'java-09-stringbuilder-regex',
    title: '09. StringBuilder & Pattern 정규식',
    category: 'Backend & Scripting',
    language: 'java',
    engine: 'wasm',
    description: '고속 문자열 조작 StringBuilder와 java.util.regex 매처',
    mainFile: 'Main.java',
    tags: ['Java', 'StringBuilder', 'Regex', 'Pattern'],
    files: {
      'Main.java': `// ==========================================
// ☕ [09] Java: StringBuilder & 정규표현식
// ==========================================
import java.util.regex.*;

public class Main {
    public static void main(String[] args) {
        String log = "2026-08-25 [WARN] user: dev_hong (email: hong@test.co.kr, ip: 192.168.0.1)";
        Pattern emailPattern = Pattern.compile("[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\\\.[a-zA-Z0-9-.]+");
        Matcher matcher = emailPattern.matcher(log);

        if (matcher.find()) {
            System.out.println("추출된 이메일: " + matcher.group());
        }

        StringBuilder sb = new StringBuilder();
        sb.append("OmniRunner").append(" - ").append("Java 21");
        System.out.println("빌드된 문자열: " + sb.toString());
    }
}
`,
    },
  },
  {
    id: 'java-10-bst-tree',
    title: '10. 이진 탐색 트리 (BST 자료구조)',
    category: 'Backend & Scripting',
    language: 'java',
    engine: 'wasm',
    description: '객체 참조 기반 이진 탐색 트리(Binary Search Tree) 구현',
    mainFile: 'Main.java',
    tags: ['Java', 'BST', 'Data Structures', 'Tree'],
    files: {
      'Main.java': `// ==========================================
// ☕ [10] Java: 이진 탐색 트리 (BST)
// ==========================================

public class Main {
    static class Node {
        int val;
        Node left, right;
        Node(int v) { this.val = v; }
    }

    static Node insert(Node root, int val) {
        if (root == null) return new Node(val);
        if (val < root.val) root.left = insert(root.left, val);
        else root.right = insert(root.right, val);
        return root;
    }

    static void inorder(Node root) {
        if (root == null) return;
        inorder(root.left);
        System.out.print(root.val + " ");
        inorder(root.right);
    }

    public static void main(String[] args) {
        Node root = null;
        int[] data = {50, 30, 70, 20, 40, 60, 80};
        for (int x : data) root = insert(root, x);

        System.out.print("BST 중위 순회 (정렬 출력): ");
        inorder(root);
        System.out.println();
    }
}
`,
    },
  },

  // --- [Part 2: 핵심 알고리즘 10선] ---
  {
    id: 'java-11-algo-dfs',
    title: '11. [알고리즘] 깊이 우선 탐색 (DFS & 연결 요소)',
    category: 'Backend & Scripting',
    language: 'java',
    engine: 'wasm',
    description: 'ArrayList 인접 리스트 기반 재귀적 DFS 그래프 순회',
    mainFile: 'Main.java',
    tags: ['DFS', 'Graph', 'Recursion', 'List'],
    files: {
      'Main.java': `// ==========================================
// 🧠 [11] Java Algorithm: 깊이 우선 탐색 (DFS)
// ==========================================
import java.util.*;

public class Main {
    static List<List<Integer>> graph = new ArrayList<>();
    static boolean[] visited;

    static void dfs(int node) {
        visited[node] = true;
        System.out.print(node + " ");

        for (int next : graph.get(node)) {
            if (!visited[next]) {
                dfs(next);
            }
        }
    }

    public static void main(String[] args) {
        System.out.println("\\033[96m⚡ [DFS] Java 그래프 순회\\033[0m");
        System.out.println("------------------------------------------");

        int n = 8;
        for (int i = 0; i <= n; i++) graph.add(new ArrayList<>());
        graph.get(1).addAll(List.of(2, 3));
        graph.get(2).addAll(List.of(1, 4, 5));
        graph.get(3).addAll(List.of(1, 6));
        graph.get(4).add(2);
        graph.get(5).add(2);
        graph.get(6).add(3);
        graph.get(7).add(8);
        graph.get(8).add(7);

        visited = new boolean[n + 1];
        System.out.print("노드 1 기준 DFS 순회: ");
        dfs(1);
        System.out.println();
    }
}
`,
    },
  },
  {
    id: 'java-12-algo-bfs',
    title: '12. [알고리즘] 너비 우선 탐색 (BFS & ArrayDeque)',
    category: 'Backend & Scripting',
    language: 'java',
    engine: 'wasm',
    description: 'Queue 인터페이스 기반 2D 미로 최단 거리 BFS',
    mainFile: 'Main.java',
    tags: ['BFS', 'Queue', 'ArrayDeque', 'Maze'],
    files: {
      'Main.java': `// ==========================================
// 🧠 [12] Java Algorithm: 너비 우선 탐색 (BFS) 최단 경로
// ==========================================
import java.util.*;

public class Main {
    static class Point {
        int x, y, dist;
        Point(int x, int y, int dist) {
            this.x = x; this.y = y; this.dist = dist;
        }
    }

    public static void main(String[] args) {
        System.out.println("\\033[96m⚡ [BFS] 2D 미로 최단 거리 탐색\\033[0m");
        System.out.println("------------------------------------------");

        int[][] maze = {
            {0, 0, 1, 0, 0, 0},
            {1, 0, 1, 0, 1, 0},
            {0, 0, 0, 0, 1, 0},
            {0, 1, 1, 0, 0, 0},
            {0, 0, 0, 1, 1, 0}
        };

        int H = maze.length, W = maze[0].length;
        Queue<Point> queue = new ArrayDeque<>();
        boolean[][] visited = new boolean[H][W];

        queue.add(new Point(0, 0, 1));
        visited[0][0] = true;

        int[] dx = {0, 0, 1, -1};
        int[] dy = {1, -1, 0, 0};
        int ans = -1;

        while (!queue.isEmpty()) {
            Point cur = queue.poll();
            if (cur.x == W - 1 && cur.y == H - 1) {
                ans = cur.dist;
                break;
            }

            for (int i = 0; i < 4; i++) {
                int nx = cur.x + dx[i];
                int ny = cur.y + dy[i];

                if (nx >= 0 && nx < W && ny >= 0 && ny < H) {
                    if (!visited[ny][nx] && maze[ny][nx] == 0) {
                        visited[ny][nx] = true;
                        queue.add(new Point(nx, ny, cur.dist + 1));
                    }
                }
            }
        }

        System.out.println("✨ 최단 이동 거리: " + ans + "칸");
    }
}
`,
    },
  },
  {
    id: 'java-13-algo-dp',
    title: '13. [알고리즘] 다이나믹 프로그래밍 (DP & 0/1 Knapsack)',
    category: 'Backend & Scripting',
    language: 'java',
    engine: 'wasm',
    description: '0/1 Knapsack 배낭 DP 테이블 2차원 최적화',
    mainFile: 'Main.java',
    tags: ['DP', 'Knapsack', 'Optimization'],
    files: {
      'Main.java': `// ==========================================
// 🧠 [13] Java Algorithm: 다이나믹 프로그래밍 (0/1 배낭)
// ==========================================

public class Main {
    static class Item {
        String name;
        int weight, value;
        Item(String name, int weight, int value) {
            this.name = name; this.weight = weight; this.value = value;
        }
    }

    public static void main(String[] args) {
        System.out.println("\\033[96m⚡ [DP] 0/1 Knapsack 배낭 문제 최적화\\033[0m");
        System.out.println("------------------------------------------");

        Item[] items = {
            new Item("노트북", 3, 50),
            new Item("카메라", 1, 40),
            new Item("스마트폰", 1, 30),
            new Item("보조배터리", 2, 20),
            new Item("헤드폰", 2, 35)
        };

        int capacity = 5;
        int n = items.length;
        int[][] dp = new int[n + 1][capacity + 1];

        for (int i = 1; i <= n; i++) {
            int w = items[i - 1].weight;
            int v = items[i - 1].value;
            for (int cap = 0; cap <= capacity; cap++) {
                if (w <= cap) {
                    dp[i][cap] = Math.max(dp[i - 1][cap], dp[i - 1][cap - w] + v);
                } else {
                    dp[i][cap] = dp[i - 1][cap];
                }
            }
        }

        System.out.println("✨ 배낭에 담을 수 있는 최대 가치: " + dp[n][capacity] + "만원");
    }
}
`,
    },
  },
  {
    id: 'java-14-algo-binary-search',
    title: '14. [알고리즘] 이진 탐색 & Arrays.binarySearch',
    category: 'Backend & Scripting',
    language: 'java',
    engine: 'wasm',
    description: 'Arrays.binarySearch 및 파라메트릭 서치(랜선 자르기)',
    mainFile: 'Main.java',
    tags: ['Binary Search', 'Parametric Search'],
    files: {
      'Main.java': `// ==========================================
// 🧠 [14] Java Algorithm: 이진 탐색 & 파라메트릭 서치
// ==========================================
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        System.out.println("\\033[96m⚡ [Binary Search] 이진 탐색 & 파라메트릭 서치\\033[0m");
        System.out.println("------------------------------------------");

        int[] arr = {3, 7, 12, 19, 24, 38, 45, 56, 72, 88, 91};
        int target = 56;
        int idx = Arrays.binarySearch(arr, target);
        System.out.println("타겟 " + target + " 위치 인덱스: " + idx);

        long[] cables = {802, 743, 457, 539};
        long needed = 11;
        long left = 1, right = 802, best = 0;

        while (left <= right) {
            long mid = (left + right) / 2;
            long count = 0;
            for (long c : cables) count += c / mid;

            if (count >= needed) {
                best = mid;
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }

        System.out.println("✨ 만들 수 있는 최대 랜선 길이: " + best + "cm");
    }
}
`,
    },
  },
  {
    id: 'java-15-algo-dijkstra',
    title: '15. [알고리즘] 다익스트라 최단 경로 (PriorityQueue)',
    category: 'Backend & Scripting',
    language: 'java',
    engine: 'wasm',
    description: 'PriorityQueue를 이용한 다익스트라 최단 경로 알고리즘',
    mainFile: 'Main.java',
    tags: ['Dijkstra', 'PriorityQueue', 'Graph'],
    files: {
      'Main.java': `// ==========================================
// 🧠 [15] Java Algorithm: 다익스트라 최단 경로
// ==========================================
import java.util.*;

public class Main {
    static class Node implements Comparable<Node> {
        int id, cost;
        Node(int id, int cost) { this.id = id; this.cost = cost; }
        public int compareTo(Node o) { return Integer.compare(this.cost, o.cost); }
    }

    public static void main(String[] args) {
        System.out.println("\\033[96m⚡ [Dijkstra] PriorityQueue 가중치 최단 경로\\033[0m");
        System.out.println("------------------------------------------");

        int n = 5;
        List<List<Node>> adj = new ArrayList<>();
        for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());

        adj.get(1).add(new Node(2, 4));
        adj.get(1).add(new Node(3, 2));
        adj.get(2).add(new Node(3, 1));
        adj.get(2).add(new Node(4, 5));
        adj.get(3).add(new Node(4, 8));
        adj.get(4).add(new Node(5, 2));

        int[] dist = new int[n + 1];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[1] = 0;

        PriorityQueue<Node> pq = new PriorityQueue<>();
        pq.add(new Node(1, 0));

        while (!pq.isEmpty()) {
            Node cur = pq.poll();
            if (cur.cost > dist[cur.id]) continue;

            for (Node next : adj.get(cur.id)) {
                if (dist[cur.id] + next.cost < dist[next.id]) {
                    dist[next.id] = dist[cur.id] + next.cost;
                    pq.add(new Node(next.id, dist[next.id]));
                }
            }
        }

        System.out.println("노드 1에서 노드 5까지의 최단 비용: " + dist[5]);
    }
}
`,
    },
  },
  {
    id: 'java-16-algo-sorting',
    title: '16. [알고리즘] 퀵 정렬 & Dual-Pivot (Sorting)',
    category: 'Backend & Scripting',
    language: 'java',
    engine: 'wasm',
    description: '분할 정복 QuickSort 구현 및 Arrays.sort',
    mainFile: 'Main.java',
    tags: ['QuickSort', 'Sorting'],
    files: {
      'Main.java': `// ==========================================
// 🧠 [16] Java Algorithm: 퀵 정렬
// ==========================================
import java.util.Arrays;

public class Main {
    static void quickSort(int[] arr, int low, int high) {
        if (low >= high) return;
        int pivot = arr[high];
        int i = low - 1;

        for (int j = low; j < high; j++) {
            if (arr[j] < pivot) {
                int temp = arr[++i];
                arr[i] = arr[j];
                arr[j] = temp;
            }
        }
        int temp = arr[i + 1];
        arr[i + 1] = arr[high];
        arr[high] = temp;
        int p = i + 1;

        quickSort(arr, low, p - 1);
        quickSort(arr, p + 1, high);
    }

    public static void main(String[] args) {
        System.out.println("\\033[96m⚡ [Sorting] 분할 정복 퀵 정렬\\033[0m");
        System.out.println("------------------------------------------");

        int[] numbers = {64, 34, 25, 12, 22, 11, 90, 88, 45, 50, 7};
        quickSort(numbers, 0, numbers.length - 1);
        System.out.println("정렬 결과: " + Arrays.toString(numbers));
    }
}
`,
    },
  },
  {
    id: 'java-17-algo-backtracking',
    title: '17. [알고리즘] 백트래킹 (N-Queens 체스)',
    category: 'Backend & Scripting',
    language: 'java',
    engine: 'wasm',
    description: '재귀적 유망성 검사를 이용한 N-Queens 체스판 배치',
    mainFile: 'Main.java',
    tags: ['Backtracking', 'N-Queens'],
    files: {
      'Main.java': `// ==========================================
// 🧠 [17] Java Algorithm: 백트래킹 (N-Queens)
// ==========================================
import java.util.Arrays;

public class Main {
    static int solutionCount = 0;

    static boolean isSafe(int row, int col, int[] board) {
        for (int r = 0; r < row; r++) {
            int c = board[r];
            if (c == col || Math.abs(row - r) == Math.abs(col - c)) {
                return false;
            }
        }
        return true;
    }

    static void backtrack(int row, int N, int[] board) {
        if (row == N) {
            solutionCount++;
            return;
        }
        for (int col = 0; col < N; col++) {
            if (isSafe(row, col, board)) {
                board[row] = col;
                backtrack(row + 1, N, board);
                board[row] = -1;
            }
        }
    }

    public static void main(String[] args) {
        System.out.println("\\033[96m⚡ [Backtracking] N-Queens 체스판 배치\\033[0m");
        System.out.println("------------------------------------------");

        int N = 8;
        int[] board = new int[N];
        Arrays.fill(board, -1);
        backtrack(0, N, board);

        System.out.println(N + "x" + N + " 체스판 해답 수: " + solutionCount + "가지");
    }
}
`,
    },
  },
  {
    id: 'java-18-algo-two-pointers',
    title: '18. [알고리즘] 투 포인터 & 슬라이딩 윈도우',
    category: 'Backend & Scripting',
    language: 'java',
    engine: 'wasm',
    description: 'Two Sum 투 포인터 선형 시간 탐색 O(N)',
    mainFile: 'Main.java',
    tags: ['Two Pointers', 'O(N)'],
    files: {
      'Main.java': `// ==========================================
// 🧠 [18] Java Algorithm: 투 포인터 (Two Sum)
// ==========================================

public class Main {
    public static void main(String[] args) {
        System.out.println("\\033[96m⚡ [Two Pointers] O(N) 선형 탐색\\033[0m");
        System.out.println("------------------------------------------");

        int[] arr = {1, 2, 3, 4, 6, 8, 9, 11, 15};
        int target = 12;

        int left = 0, right = arr.length - 1;
        System.out.println("합이 " + target + "인 쌍:");
        while (left < right) {
            int sum = arr[left] + arr[right];
            if (sum == target) {
                System.out.println("  ➜ (" + arr[left] + " + " + arr[right] + " = 12)");
                left++;
                right--;
            } else if (sum < target) {
                left++;
            } else {
                right--;
            }
        }
    }
}
`,
    },
  },
  {
    id: 'java-19-algo-greedy',
    title: '19. [알고리즘] 그리디 알고리즘 (회의실 배정)',
    category: 'Backend & Scripting',
    language: 'java',
    engine: 'wasm',
    description: '종료 시간 오름차순 정렬 기반 회의실 최대 배정',
    mainFile: 'Main.java',
    tags: ['Greedy', 'Activity Selection', 'Sorting'],
    files: {
      'Main.java': `// ==========================================
// 🧠 [19] Java Algorithm: 그리디 (회의실 배정)
// ==========================================
import java.util.*;

public class Main {
    static class Meeting {
        String id;
        int start, end;
        Meeting(String id, int start, int end) {
            this.id = id; this.start = start; this.end = end;
        }
    }

    public static void main(String[] args) {
        System.out.println("\\033[96m⚡ [Greedy] 회의실 배정 (Activity Selection)\\033[0m");
        System.out.println("------------------------------------------");

        List<Meeting> meetings = Arrays.asList(
            new Meeting("M1", 1, 4), new Meeting("M2", 3, 5),
            new Meeting("M3", 0, 6), new Meeting("M4", 5, 7),
            new Meeting("M5", 3, 8), new Meeting("M6", 5, 9),
            new Meeting("M7", 6, 10), new Meeting("M8", 8, 11),
            new Meeting("M9", 8, 12), new Meeting("M10", 12, 14)
        );

        meetings.sort(Comparator.comparingInt(m -> m.end));

        int count = 0;
        int lastEnd = 0;

        for (Meeting m : meetings) {
            if (m.start >= lastEnd) {
                count++;
                lastEnd = m.end;
                System.out.println("  ➜ " + m.id + ": " + m.start + "시 ~ " + m.end + "시");
            }
        }

        System.out.println("✨ 배정 가능한 최대 회의 수: " + count + "개");
    }
}
`,
    },
  },
  {
    id: 'java-20-algo-trie-topo',
    title: '20. [알고리즘] 트라이 & 위상 정렬 (Trie & TopoSort)',
    category: 'Backend & Scripting',
    language: 'java',
    engine: 'wasm',
    description: '트라이 사전 검색 및 진입차수(In-degree) 기반 위상 정렬',
    mainFile: 'Main.java',
    tags: ['Trie', 'Topological Sort', 'DAG'],
    files: {
      'Main.java': `// ==========================================
// 🧠 [20] Java Algorithm: 트라이 & 위상 정렬
// ==========================================
import java.util.*;

public class Main {
    static class TrieNode {
        Map<Character, TrieNode> children = new HashMap<>();
        boolean isEnd;
    }

    public static void main(String[] args) {
        System.out.println("\\033[96m⚡ [1] Java Trie 접두사 트리\\033[0m");
        TrieNode root = new TrieNode();
        for (String w : List.of("apple", "app", "application", "banana")) {
            TrieNode cur = root;
            for (char c : w.toCharArray()) {
                cur = cur.children.computeIfAbsent(c, k -> new TrieNode());
            }
            cur.isEnd = true;
        }
        System.out.println("  단어 사전 삽입 완료 (apple, app, application, banana)");

        System.out.println("\\n\\033[96m⚡ [2] 위상 정렬 (Topological Sort)\\033[0m");
        int n = 5;
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i <= n; i++) adj.add(new ArrayList<>());
        int[] inDegree = new int[n + 1];

        adj.get(1).add(2); inDegree[2]++;
        adj.get(2).add(3); inDegree[3]++;
        adj.get(2).add(4); inDegree[4]++;
        adj.get(3).add(5); inDegree[5]++;
        adj.get(4).add(5); inDegree[5]++;

        Queue<Integer> q = new ArrayDeque<>();
        for (int i = 1; i <= n; i++) if (inDegree[i] == 0) q.add(i);

        System.out.print("  ✨ 빌드 순서: ");
        while (!q.isEmpty()) {
            int cur = q.poll();
            System.out.print(cur + " ➔ ");
            for (int nxt : adj.get(cur)) {
                if (--inDegree[nxt] == 0) q.add(nxt);
            }
        }
        System.out.println("Done");
    }
}
`,
    },
  },
  {
    id: 'java-21-streams-records-completable-future',
    title: '21. [라이브러리] Java Modern Streams & Records (함수형 집계 & 불변 레코드)',
    category: 'Backend & Scripting',
    language: 'java',
    engine: 'wasm',
    description:
      'Java 17/21 Record 불변 DTO, Stream API(filter, map, groupingBy, summarizingInt)를 활용한 데이터 분석',
    mainFile: 'Main.java',
    tags: ['Java', 'Java 21', 'Records', 'Streams', 'Collectors'],
    files: {
      'Main.java': `// ==========================================
// ☕ [21] Java: Records & Stream API 분석
// ==========================================
import java.util.*;
import java.util.stream.Collectors;

public class Main {
    // Java 불변 Record DTO 정의
    record Employee(String name, String department, int salary) {}

    public static void main(String[] args) {
        System.out.println("\\033[96m✨ [Modern Java] Records & Stream API 데이터 분석\\033[0m");
        System.out.println("------------------------------------------");

        List<Employee> employees = List.of(
            new Employee("김철수", "Engineering", 8200),
            new Employee("이영희", "Design", 6900),
            new Employee("박지훈", "Engineering", 9500),
            new Employee("최유진", "Product", 7800),
            new Employee("정다은", "Design", 6300),
            new Employee("강민혁", "Engineering", 9100)
        );

        // 1. 부서별 groupingBy 및 평균 급여 집계
        Map<String, Double> avgSalaryByDept = employees.stream()
            .collect(Collectors.groupingBy(
                Employee::department,
                Collectors.averagingInt(Employee::salary)
            ));

        System.out.println("[1] 부서별 평균 급여 집계:");
        avgSalaryByDept.forEach((dept, avg) -> {
            System.out.printf("  • %-12s: %,.0f만원\\n", dept, avg);
        });

        // 2. 전체 급여 통계 요약 (IntSummaryStatistics)
        IntSummaryStatistics stats = employees.stream()
            .mapToInt(Employee::salary)
            .summaryStatistics();

        System.out.println("\\n[2] 전체 급여 종합 통계:");
        System.out.printf("  ➜ 총 인원: %d명 | 총 급여합: %,d만원\\n", stats.getCount(), stats.getSum());
        System.out.printf("  ➜ 최고 급여: \\033[92m%,d만원\\033[0m | 최저 급여: %,d만원\\n", stats.getMax(), stats.getMin());
    }
}
`,
    },
  },
];
