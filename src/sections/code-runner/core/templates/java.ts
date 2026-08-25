import type { CodeTemplate } from '../../types';

// ----------------------------------------------------------------------

export const JAVA_TEMPLATES: CodeTemplate[] = [
  {
    id: 'java-01-hello-io',
    title: '01. Hello World & 표준 입출력 (I/O)',
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
    id: 'java-02-dfs',
    title: '02. 깊이 우선 탐색 (DFS & 연결 요소)',
    category: 'Backend & Scripting',
    language: 'java',
    engine: 'wasm',
    description: 'ArrayList 인접 리스트 기반 재귀적 DFS 그래프 순회',
    mainFile: 'Main.java',
    tags: ['DFS', 'Graph', 'Recursion', 'List'],
    files: {
      'Main.java': `// ==========================================
// ☕ [02] Java: 깊이 우선 탐색 (DFS)
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
    id: 'java-03-bfs',
    title: '03. 너비 우선 탐색 (BFS & ArrayDeque)',
    category: 'Backend & Scripting',
    language: 'java',
    engine: 'wasm',
    description: 'Queue 인터페이스 기반 2D 미로 최단 거리 BFS',
    mainFile: 'Main.java',
    tags: ['BFS', 'Queue', 'ArrayDeque', 'Maze'],
    files: {
      'Main.java': `// ==========================================
// ☕ [03] Java: 너비 우선 탐색 (BFS) 최단 경로
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
    id: 'java-04-dp',
    title: '04. 다이나믹 프로그래밍 (DP & 0/1 Knapsack)',
    category: 'Backend & Scripting',
    language: 'java',
    engine: 'wasm',
    description: '0/1 Knapsack 배낭 DP 테이블 2차원 최적화',
    mainFile: 'Main.java',
    tags: ['DP', 'Knapsack', 'Optimization'],
    files: {
      'Main.java': `// ==========================================
// ☕ [04] Java: 다이나믹 프로그래밍 (0/1 배낭)
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
    id: 'java-05-binary-search',
    title: '05. 이진 탐색 & Arrays.binarySearch',
    category: 'Backend & Scripting',
    language: 'java',
    engine: 'wasm',
    description: 'Arrays.binarySearch 및 파라메트릭 서치(랜선 자르기)',
    mainFile: 'Main.java',
    tags: ['Binary Search', 'Parametric Search'],
    files: {
      'Main.java': `// ==========================================
// ☕ [05] Java: 이진 탐색 & 파라메트릭 서치
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

        // 파라메트릭 서치
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
    id: 'java-06-dijkstra',
    title: '06. 다익스트라 최단 경로 (PriorityQueue)',
    category: 'Backend & Scripting',
    language: 'java',
    engine: 'wasm',
    description: 'PriorityQueue를 이용한 다익스트라 최단 경로 알고리즘',
    mainFile: 'Main.java',
    tags: ['Dijkstra', 'PriorityQueue', 'Graph'],
    files: {
      'Main.java': `// ==========================================
// ☕ [06] Java: 다익스트라 최단 경로
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
    id: 'java-07-sorting',
    title: '07. 퀵 정렬 & Dual-Pivot (Sorting)',
    category: 'Backend & Scripting',
    language: 'java',
    engine: 'wasm',
    description: '분할 정복 QuickSort 구현 및 Arrays.sort',
    mainFile: 'Main.java',
    tags: ['QuickSort', 'Sorting'],
    files: {
      'Main.java': `// ==========================================
// ☕ [07] Java: 퀵 정렬
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
    id: 'java-08-backtracking',
    title: '08. 백트래킹 (N-Queens 체스)',
    category: 'Backend & Scripting',
    language: 'java',
    engine: 'wasm',
    description: '재귀적 유망성 검사를 이용한 N-Queens 체스판 배치',
    mainFile: 'Main.java',
    tags: ['Backtracking', 'N-Queens'],
    files: {
      'Main.java': `// ==========================================
// ☕ [08] Java: 백트래킹 (N-Queens)
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
    id: 'java-09-two-pointers',
    title: '09. 투 포인터 & 슬라이딩 윈도우',
    category: 'Backend & Scripting',
    language: 'java',
    engine: 'wasm',
    description: 'Two Sum 투 포인터 선형 시간 탐색 O(N)',
    mainFile: 'Main.java',
    tags: ['Two Pointers', 'O(N)'],
    files: {
      'Main.java': `// ==========================================
// ☕ [09] Java: 투 포인터 (Two Sum)
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
    id: 'java-10-greedy',
    title: '10. 그리디 알고리즘 (Greedy - 회의실 배정)',
    category: 'Backend & Scripting',
    language: 'java',
    engine: 'wasm',
    description: '종료 시간 오름차순 정렬 기반 회의실 최대 배정',
    mainFile: 'Main.java',
    tags: ['Greedy', 'Activity Selection', 'Sorting'],
    files: {
      'Main.java': `// ==========================================
// ☕ [10] Java: 그리디 (회의실 배정)
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
];
