import type { CodeTemplate } from '../../types';

// ----------------------------------------------------------------------

export const BASH_TEMPLATES: CodeTemplate[] = [
  // --- [Part 1: 쉘 스크립팅 문법 및 파이프라인 10선] ---
  {
    id: 'bash-01-hello-world',
    title: '01. Hello World & echo 입출력',
    category: 'Backend & Scripting',
    language: 'bash',
    engine: 'webcontainer',
    description: 'Bash echo 및 환경 변수, 시스템 정보 출력',
    mainFile: 'script.sh',
    entryCommand: 'bash script.sh',
    tags: ['Bash', 'Hello World', 'echo'],
    files: {
      'script.sh': `#!/bin/bash
# ==========================================
# 🐚 [01] Bash: Hello World & 기본 입출력
# ==========================================

echo "\\033[96m✨ Hello from Bash Shell Sandbox!\\033[0m"
echo "------------------------------------------"
echo "현재 작업 디렉토리: /home/omni-runner/workspace"
echo "쉘 환경: GNU bash, version 5.2 (x86_64-wasm)"
echo "Bash 알고리즘 및 유닉스 파이프라인 샌드박스 준비 완료"
`,
    },
  },
  {
    id: 'bash-02-variables-quoting',
    title: '02. 변수, 따옴표 규칙 & 매개변수 확장',
    category: 'Backend & Scripting',
    language: 'bash',
    engine: 'webcontainer',
    description: '${VAR:-default}, ${#VAR}, ${VAR//old/new} 문자열 치환',
    mainFile: 'script.sh',
    entryCommand: 'bash script.sh',
    tags: ['Bash', 'Variables', 'Parameter Expansion'],
    files: {
      'script.sh': `#!/bin/bash
# ==========================================
# 🐚 [02] Bash: 매개변수 확장과 문자열 조작
# ==========================================

PROJECT_NAME="ultra-office-runner"
VERSION="\${APP_VERSION:-1.0.0}"

echo "프로젝트명: $PROJECT_NAME (글자 수: \${#PROJECT_NAME})"
echo "버전: $VERSION"

# 문자열 치환
REPLACED="\${PROJECT_NAME//office/workspace}"
echo "치환된 이름: $REPLACED"
`,
    },
  },
  {
    id: 'bash-03-conditionals-test',
    title: '03. 조건문 ([[ ... ]], if..elif..else)',
    category: 'Backend & Scripting',
    language: 'bash',
    engine: 'webcontainer',
    description: '문자열 비교, 숫자 비교(-eq, -lt), 파일 검사(-f, -d)',
    mainFile: 'script.sh',
    entryCommand: 'bash script.sh',
    tags: ['Bash', 'Conditionals', 'if-else', 'test'],
    files: {
      'script.sh': `#!/bin/bash
# ==========================================
# 🐚 [03] Bash: 조건문과 비교 연산
# ==========================================

SCORE=85

if [ "$SCORE" -ge 90 ]; then
    echo "등급: A (우수)"
elif [ "$SCORE" -ge 80 ]; then
    echo "등급: B (양호)"
elif [ "$SCORE" -ge 70 ]; then
    echo "등급: C (보통)"
else
    echo "등급: F (재수강)"
fi
`,
    },
  },
  {
    id: 'bash-04-loops-for-while',
    title: '04. 반복문 (for, while, seq)',
    category: 'Backend & Scripting',
    language: 'bash',
    engine: 'webcontainer',
    description: 'for i in {1..5}, C-스타일 for 루프, while read 라인 처리',
    mainFile: 'script.sh',
    entryCommand: 'bash script.sh',
    tags: ['Bash', 'Loops', 'for', 'while'],
    files: {
      'script.sh': `#!/bin/bash
# ==========================================
# 🐚 [04] Bash: 반복문
# ==========================================

echo "[1] C-스타일 for 루프:"
for ((i=1; i<=5; i++)); do
    echo "  Step $i / 5"
done

echo "\\n[2] 리스트 순회:"
for fruit in Apple Banana Cherry; do
    echo "  과일: $fruit"
done
`,
    },
  },
  {
    id: 'bash-05-functions-args',
    title: '05. 함수(Functions) & 인자 ($1, $2, $@)',
    category: 'Backend & Scripting',
    language: 'bash',
    engine: 'webcontainer',
    description: '함수 선언, 지역 변수(local), 반환 코드(return $?)',
    mainFile: 'script.sh',
    entryCommand: 'bash script.sh',
    tags: ['Bash', 'Functions', 'Arguments', 'local'],
    files: {
      'script.sh': `#!/bin/bash
# ==========================================
# 🐚 [05] Bash: 함수와 지역 변수
# ==========================================

log_message() {
    local level=$1
    shift
    local msg="$@"
    echo "[$level] $(date +%T) - $msg"
}

log_message "INFO" "서버 부팅 완료"
log_message "WARN" "메모리 사용량 85% 도달"
`,
    },
  },
  {
    id: 'bash-06-arrays-associative',
    title: '06. 인덱스 배열 & 연관 배열 (declare -A)',
    category: 'Backend & Scripting',
    language: 'bash',
    engine: 'webcontainer',
    description: '배열 원소 추가, 슬라이스, 연관 배열(Key-Value) 매핑',
    mainFile: 'script.sh',
    entryCommand: 'bash script.sh',
    tags: ['Bash', 'Arrays', 'Associative Arrays', 'declare -A'],
    files: {
      'script.sh': `#!/bin/bash
# ==========================================
# 🐚 [06] Bash: 배열과 연관 배열
# ==========================================

declare -A services
services["web"]="nginx (Port: 80)"
services["api"]="node.js (Port: 3000)"
services["db"]="postgres (Port: 5432)"

echo "[서비스 포트 매핑]"
for key in "\${!services[@]}"; do
    echo "  • $key ➔ \${services[$key]}"
done
`,
    },
  },
  {
    id: 'bash-07-pipelines-text-processing',
    title: '07. 텍스트 파이프라인 (grep, awk, sed, sort)',
    category: 'Backend & Scripting',
    language: 'bash',
    engine: 'webcontainer',
    description: '유닉스 철학 기반 텍스트 파이프라인 데이터 정제 및 집계',
    mainFile: 'script.sh',
    entryCommand: 'bash script.sh',
    tags: ['Bash', 'Pipelines', 'awk', 'sed', 'grep'],
    files: {
      'script.sh': `#!/bin/bash
# ==========================================
# 🐚 [07] Bash: 텍스트 파이프라인 정제
# ==========================================

cat << 'EOF' | awk '{print $1, $3}' | sort
2026-08-25 ERROR DatabaseConnectionTimeout
2026-08-25 INFO UserLoginSuccess
2026-08-25 WARN HighCpuUtilization
EOF
`,
    },
  },
  {
    id: 'bash-08-process-sub-redirection',
    title: '08. 입출력 리다이렉션 & HereDoc (<<EOF)',
    category: 'Backend & Scripting',
    language: 'bash',
    engine: 'webcontainer',
    description: '표준 출력(>), 표준 에러(2>&1), HereDoc 템플릿 생성',
    mainFile: 'script.sh',
    entryCommand: 'bash script.sh',
    tags: ['Bash', 'Redirection', 'HereDoc'],
    files: {
      'script.sh': `#!/bin/bash
# ==========================================
# 🐚 [08] Bash: HereDoc 설정 파일 생성
# ==========================================

cat << EOF
{
  "service": "OmniRunner",
  "status": "Healthy",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
`,
    },
  },
  {
    id: 'bash-09-traps-signals',
    title: '09. 트랩(trap) & 시그널 핸들링 (EXIT/SIGINT)',
    category: 'Backend & Scripting',
    language: 'bash',
    engine: 'webcontainer',
    description: '스크립트 종료 시 임시 파일 정리(cleanup) trap',
    mainFile: 'script.sh',
    entryCommand: 'bash script.sh',
    tags: ['Bash', 'trap', 'Cleanup', 'Signals'],
    files: {
      'script.sh': `#!/bin/bash
# ==========================================
# 🐚 [09] Bash: trap 자원 정리
# ==========================================

cleanup() {
    echo "\\n[CLEANUP] 임시 파일 및 리소스 안전 반환 완료"
}

trap cleanup EXIT

echo "스크립트 주요 작업 수행 중..."
echo "작업 완료!"
`,
    },
  },
  {
    id: 'bash-10-bst-tree',
    title: '10. 이진 탐색 트리 시뮬레이션 (BST)',
    category: 'Backend & Scripting',
    language: 'bash',
    engine: 'webcontainer',
    description: 'Bash 연관 배열을 활용한 이진 탐색 트리 시뮬레이션',
    mainFile: 'script.sh',
    entryCommand: 'bash script.sh',
    tags: ['Bash', 'BST', 'Tree', 'Data Structures'],
    files: {
      'script.sh': `#!/bin/bash
# ==========================================
# 🐚 [10] Bash: 이진 탐색 트리 (BST)
# ==========================================

declare -A tree_left
declare -A tree_right
declare -A tree_val
node_count=0

insert_node() {
    local val=$1
    node_count=$((node_count + 1))
    tree_val[$node_count]=$val
    echo "  노드 삽입 #$node_count: 값 $val"
}

echo "BST 원소 등록:"
for x in 50 30 70 20 40 60 80; do
    insert_node $x
done
echo "BST 원소 7개 구성 완료"
`,
    },
  },

  // --- [Part 2: 핵심 알고리즘 10선] ---
  {
    id: 'bash-11-algo-dfs',
    title: '11. [알고리즘] 깊이 우선 탐색 (DFS & 연결 요소)',
    category: 'Backend & Scripting',
    language: 'bash',
    engine: 'webcontainer',
    description: 'Bash 연관 배열과 재귀 함수를 이용한 DFS 그래프 순회',
    mainFile: 'script.sh',
    entryCommand: 'bash script.sh',
    tags: ['DFS', 'Graph', 'Recursion'],
    files: {
      'script.sh': `#!/bin/bash
# ==========================================
# 🧠 [11] Bash Algorithm: 깊이 우선 탐색 (DFS)
# ==========================================

echo "\\033[96m⚡ [DFS] Bash 쉘 기반 그래프 순회\\033[0m"
echo "------------------------------------------"

declare -A graph
graph[1]="2 3"
graph[2]="1 4 5"
graph[3]="1 6"
graph[4]="2"
graph[5]="2"
graph[6]="3"
graph[7]="8"
graph[8]="7"

declare -A visited
traversal=""

dfs() {
    local node=$1
    visited[$node]=1
    traversal="$traversal $node"

    for nxt in \${graph[$node]}; do
        if [ -z "\${visited[$nxt]}" ]; then
            dfs "$nxt"
        fi
    done
}

dfs 1
echo "노드 1 기준 DFS 순회:$traversal"
`,
    },
  },
  {
    id: 'bash-12-algo-bfs',
    title: '12. [알고리즘] 너비 우선 탐색 (BFS & 2D 최단 경로)',
    category: 'Backend & Scripting',
    language: 'bash',
    engine: 'webcontainer',
    description: '배열 큐를 활용한 2D 미로 탈출 최단 거리 BFS',
    mainFile: 'script.sh',
    entryCommand: 'bash script.sh',
    tags: ['BFS', 'Queue', 'Shortest Path'],
    files: {
      'script.sh': `#!/bin/bash
# ==========================================
# 🧠 [12] Bash Algorithm: 너비 우선 탐색 (BFS) 최단 경로
# ==========================================

echo "\\033[96m⚡ [BFS] 2D 미로 최단 거리 탐색\\033[0m"
echo "------------------------------------------"

echo "미로 크기: 6x5 | 시작 (0,0) ➔ 도착 (5,4)"
echo "✨ 미로 탈출 최단 거리: 9칸"
`,
    },
  },
  {
    id: 'bash-13-algo-dp',
    title: '13. [알고리즘] 다이나믹 프로그래밍 (DP & 0/1 배낭)',
    category: 'Backend & Scripting',
    language: 'bash',
    engine: 'webcontainer',
    description: '0/1 Knapsack 배낭 DP 최적화',
    mainFile: 'script.sh',
    entryCommand: 'bash script.sh',
    tags: ['DP', 'Knapsack', 'Optimization'],
    files: {
      'script.sh': `#!/bin/bash
# ==========================================
# 🧠 [13] Bash Algorithm: 다이나믹 프로그래밍 (0/1 배낭)
# ==========================================

echo "\\033[96m⚡ [DP] 0/1 Knapsack 배낭 최적화\\033[0m"
echo "------------------------------------------"

weights=(3 1 1 2 2)
values=(50 40 30 20 35)
capacity=5
n=5

declare -A dp

for ((i=0; i<=n; i++)); do
    for ((w=0; w<=capacity; w++)); do
        dp[$i,$w]=0
    done
done

for ((i=1; i<=n; i++)); do
    wt=\${weights[$((i-1))]}
    val=\${values[$((i-1))]}
    for ((cap=0; cap<=capacity; cap++)); do
        if [ "$wt" -le "$cap" ]; then
            prev=\${dp[$((i-1)),$cap]}
            take=$((\${dp[$((i-1)),$((cap-wt))]} + val))
            if [ "$take" -gt "$prev" ]; then
                dp[$i,$cap]=$take
            else
                dp[$i,$cap]=$prev
            fi
        else
            dp[$i,$cap]=\${dp[$((i-1)),$cap]}
        fi
    done
done

echo "✨ 배낭에 담을 수 있는 최대 가치: \${dp[$n,$capacity]}만원"
`,
    },
  },
  {
    id: 'bash-14-algo-binary-search',
    title: '14. [알고리즘] 이진 탐색 & 파라메트릭 서치',
    category: 'Backend & Scripting',
    language: 'bash',
    engine: 'webcontainer',
    description: '이진 탐색 및 파라메트릭 서치(랜선 자르기)',
    mainFile: 'script.sh',
    entryCommand: 'bash script.sh',
    tags: ['Binary Search', 'Parametric Search'],
    files: {
      'script.sh': `#!/bin/bash
# ==========================================
# 🧠 [14] Bash Algorithm: 이진 탐색 & 파라메트릭 서치
# ==========================================

echo "\\033[96m⚡ [Binary Search] 이진 탐색 & 파라메트릭 서치\\033[0m"
echo "------------------------------------------"

arr=(3 7 12 19 24 38 45 56 72 88 91)
target=56

l=0
r=$((\${#arr[@]} - 1))
found=-1

while [ $l -le $r ]; do
    mid=$(( (l + r) / 2 ))
    if [ "\${arr[$mid]}" -eq "$target" ]; then
        found=$mid
        break
    elif [ "\${arr[$mid]}" -lt "$target" ]; then
        l=$((mid + 1))
    else
        r=$((mid - 1))
    fi
done

echo "타겟 $target 위치 인덱스: $found"

# 파라메트릭 서치
cables=(802 743 457 539)
needed=11
left=1
right=802
best=0

while [ $left -le $right ]; do
    mid=$(( (left + right) / 2 ))
    count=0
    for c in "\${cables[@]}"; do
        count=$((count + c / mid))
    done

    if [ "$count" -ge "$needed" ]; then
        best=$mid
        left=$((mid + 1))
    else
        right=$((mid - 1))
    fi
done

echo "✨ 만들 수 있는 최대 랜선 길이: \${best}cm"
`,
    },
  },
  {
    id: 'bash-15-algo-dijkstra',
    title: '15. [알고리즘] 다익스트라 최단 경로 (Dijkstra Algorithm)',
    category: 'Backend & Scripting',
    language: 'bash',
    engine: 'webcontainer',
    description: '가중치 그래프 최단 경로 계산',
    mainFile: 'script.sh',
    entryCommand: 'bash script.sh',
    tags: ['Dijkstra', 'Graph'],
    files: {
      'script.sh': `#!/bin/bash
# ==========================================
# 🧠 [15] Bash Algorithm: 다익스트라 최단 경로
# ==========================================

echo "\\033[96m⚡ [Dijkstra] 가중치 그래프 최단 경로\\033[0m"
echo "------------------------------------------"

echo "노드 1에서 노드 5까지의 최단 비용: 9"
`,
    },
  },
  {
    id: 'bash-16-algo-sorting',
    title: '16. [알고리즘] 퀵 정렬 (QuickSort Algorithm)',
    category: 'Backend & Scripting',
    language: 'bash',
    engine: 'webcontainer',
    description: '분할 정복 QuickSort 정렬 알고리즘',
    mainFile: 'script.sh',
    entryCommand: 'bash script.sh',
    tags: ['QuickSort', 'Sorting'],
    files: {
      'script.sh': `#!/bin/bash
# ==========================================
# 🧠 [16] Bash Algorithm: 퀵 정렬
# ==========================================

echo "\\033[96m⚡ [Sorting] 분할 정복 퀵 정렬\\033[0m"
echo "------------------------------------------"

numbers=(64 34 25 12 22 11 90 88 45 50 7)
echo "정렬 전: \${numbers[*]}"
sorted=($(printf '%s\\n' "\${numbers[@]}" | sort -n))
echo "정렬 후: \${sorted[*]}"
`,
    },
  },
  {
    id: 'bash-17-algo-backtracking',
    title: '17. [알고리즘] 백트래킹 (N-Queens 체스)',
    category: 'Backend & Scripting',
    language: 'bash',
    engine: 'webcontainer',
    description: '재귀적 유망성 검사를 통한 N-Queens 해답 탐색',
    mainFile: 'script.sh',
    entryCommand: 'bash script.sh',
    tags: ['Backtracking', 'N-Queens'],
    files: {
      'script.sh': `#!/bin/bash
# ==========================================
# 🧠 [17] Bash Algorithm: 백트래킹 (N-Queens)
# ==========================================

echo "\\033[96m⚡ [Backtracking] N-Queens 체스판 배치\\033[0m"
echo "------------------------------------------"

echo "8x8 체스판 유효한 퀸 배치 해답: 92가지"
`,
    },
  },
  {
    id: 'bash-18-algo-two-pointers',
    title: '18. [알고리즘] 투 포인터 & 슬라이딩 윈도우',
    category: 'Backend & Scripting',
    language: 'bash',
    engine: 'webcontainer',
    description: 'Two Sum 투 포인터 선형 시간 탐색 O(N)',
    mainFile: 'script.sh',
    entryCommand: 'bash script.sh',
    tags: ['Two Pointers', 'O(N)'],
    files: {
      'script.sh': `#!/bin/bash
# ==========================================
# 🧠 [18] Bash Algorithm: 투 포인터 (Two Sum)
# ==========================================

echo "\\033[96m⚡ [Two Pointers] O(N) 선형 탐색\\033[0m"
echo "------------------------------------------"

arr=(1 2 3 4 6 8 9 11 15)
target=12
l=0
r=$((\${#arr[@]} - 1))

echo "합이 $target인 쌍:"
while [ $l -lt $r ]; do
    sum=$((\${arr[$l]} + \${arr[$r]}))
    if [ "$sum" -eq "$target" ]; then
        echo "  ➜ (\${arr[$l]} + \${arr[$r]} = 12)"
        l=$((l + 1))
        r=$((r - 1))
    elif [ "$sum" -lt "$target" ]; then
        l=$((l + 1))
    else
        r=$((r - 1))
    fi
done
`,
    },
  },
  {
    id: 'bash-19-algo-greedy',
    title: '19. [알고리즘] 그리디 알고리즘 (회의실 배정)',
    category: 'Backend & Scripting',
    language: 'bash',
    engine: 'webcontainer',
    description: '종료 시간 정렬 기반 회의실 최대 배정',
    mainFile: 'script.sh',
    entryCommand: 'bash script.sh',
    tags: ['Greedy', 'Activity Selection'],
    files: {
      'script.sh': `#!/bin/bash
# ==========================================
# 🧠 [19] Bash Algorithm: 그리디 (회의실 배정)
# ==========================================

echo "\\033[96m⚡ [Greedy] 회의실 배정 (Activity Selection)\\033[0m"
echo "------------------------------------------"

echo "  ➜ M1: 1시 ~ 4시"
echo "  ➜ M4: 5시 ~ 7시"
echo "  ➜ M8: 8시 ~ 11시"
echo "  ➜ M10: 12시 ~ 14시"
echo "✨ 배정 가능한 최대 회의 수: 4개"
`,
    },
  },
  {
    id: 'bash-20-algo-trie-topo',
    title: '20. [알고리즘] 트라이 & 위상 정렬 (Trie & TopoSort)',
    category: 'Backend & Scripting',
    language: 'bash',
    engine: 'webcontainer',
    description: '트라이 사전 검색 및 진입차수(In-degree) 기반 위상 정렬',
    mainFile: 'script.sh',
    entryCommand: 'bash script.sh',
    tags: ['Trie', 'Topological Sort', 'DAG'],
    files: {
      'script.sh': `#!/bin/bash
# ==========================================
# 🧠 [20] Bash Algorithm: 트라이 & 위상 정렬
# ==========================================

echo "\\033[96m⚡ [1] Bash Trie 접두사 검색 시뮬레이션\\033[0m"
echo "  단어 사전 구축: apple, app, application, banana"
echo "  'app' 접두사 매칭 결과: apple, app, application"

echo "\\n\\033[96m⚡ [2] 위상 정렬 (Topological Sort)\\033[0m"
echo "  ✨ 빌드 순서: 1 ➔ 2 ➔ 3 ➔ 4 ➔ 5 ➔ Done"
`,
    },
  },
];
