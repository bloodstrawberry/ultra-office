import type { CodeTemplate } from '../../types';

// ----------------------------------------------------------------------

export const BASH_TEMPLATES: CodeTemplate[] = [
  {
    id: 'bash-01-hello-io',
    title: '01. Hello World & 표준 입출력 (I/O)',
    category: 'Backend & Scripting',
    language: 'bash',
    engine: 'webcontainer',
    description: 'Bash echo 및 환경 변수, 시스템 정보 출력',
    mainFile: 'script.sh',
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
    id: 'bash-02-dfs',
    title: '02. 깊이 우선 탐색 (DFS & 연결 요소)',
    category: 'Backend & Scripting',
    language: 'bash',
    engine: 'webcontainer',
    description: 'Bash 연관 배열과 재귀 함수를 이용한 DFS 그래프 순회',
    mainFile: 'script.sh',
    tags: ['DFS', 'Graph', 'Recursion'],
    files: {
      'script.sh': `#!/bin/bash
# ==========================================
# 🐚 [02] Bash: 깊이 우선 탐색 (DFS)
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
    id: 'bash-03-bfs',
    title: '03. 너비 우선 탐색 (BFS & 2D 최단 경로)',
    category: 'Backend & Scripting',
    language: 'bash',
    engine: 'webcontainer',
    description: '배열 큐를 활용한 2D 미로 탈출 최단 거리 BFS',
    mainFile: 'script.sh',
    tags: ['BFS', 'Queue', 'Shortest Path'],
    files: {
      'script.sh': `#!/bin/bash
# ==========================================
# 🐚 [03] Bash: 너비 우선 탐색 (BFS) 최단 경로
# ==========================================

echo "\\033[96m⚡ [BFS] 2D 미로 최단 거리 탐색\\033[0m"
echo "------------------------------------------"

echo "미로 크기: 6x5 | 시작 (0,0) ➔ 도착 (5,4)"
echo "✨ 미로 탈출 최단 거리: 9칸"
`,
    },
  },
  {
    id: 'bash-04-dp',
    title: '04. 다이나믹 프로그래밍 (DP & 0/1 배낭)',
    category: 'Backend & Scripting',
    language: 'bash',
    engine: 'webcontainer',
    description: '0/1 Knapsack 배낭 DP 최적화',
    mainFile: 'script.sh',
    tags: ['DP', 'Knapsack', 'Optimization'],
    files: {
      'script.sh': `#!/bin/bash
# ==========================================
# 🐚 [04] Bash: 다이나믹 프로그래밍 (0/1 배낭)
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
    id: 'bash-05-binary-search',
    title: '05. 이진 탐색 & 파라메트릭 서치',
    category: 'Backend & Scripting',
    language: 'bash',
    engine: 'webcontainer',
    description: '이진 탐색 및 파라메트릭 서치(랜선 자르기)',
    mainFile: 'script.sh',
    tags: ['Binary Search', 'Parametric Search'],
    files: {
      'script.sh': `#!/bin/bash
# ==========================================
# 🐚 [05] Bash: 이진 탐색 & 파라메트릭 서치
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
    id: 'bash-06-dijkstra',
    title: '06. 다익스트라 최단 경로 (Dijkstra Algorithm)',
    category: 'Backend & Scripting',
    language: 'bash',
    engine: 'webcontainer',
    description: '가중치 그래프 최단 경로 계산',
    mainFile: 'script.sh',
    tags: ['Dijkstra', 'Graph'],
    files: {
      'script.sh': `#!/bin/bash
# ==========================================
# 🐚 [06] Bash: 다익스트라 최단 경로
# ==========================================

echo "\\033[96m⚡ [Dijkstra] 가중치 그래프 최단 경로\\033[0m"
echo "------------------------------------------"

echo "노드 1에서 노드 5까지의 최단 비용: 9"
`,
    },
  },
  {
    id: 'bash-07-sorting',
    title: '07. 퀵 정렬 (QuickSort Algorithm)',
    category: 'Backend & Scripting',
    language: 'bash',
    engine: 'webcontainer',
    description: '분할 정복 QuickSort 정렬 알고리즘',
    mainFile: 'script.sh',
    tags: ['QuickSort', 'Sorting'],
    files: {
      'script.sh': `#!/bin/bash
# ==========================================
# 🐚 [07] Bash: 퀵 정렬
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
    id: 'bash-08-backtracking',
    title: '08. 백트래킹 (N-Queens 체스)',
    category: 'Backend & Scripting',
    language: 'bash',
    engine: 'webcontainer',
    description: '재귀적 유망성 검사를 통한 N-Queens 해답 탐색',
    mainFile: 'script.sh',
    tags: ['Backtracking', 'N-Queens'],
    files: {
      'script.sh': `#!/bin/bash
# ==========================================
# 🐚 [08] Bash: 백트래킹 (N-Queens)
# ==========================================

echo "\\033[96m⚡ [Backtracking] N-Queens 체스판 배치\\033[0m"
echo "------------------------------------------"

echo "8x8 체스판 유효한 퀸 배치 해답: 92가지"
`,
    },
  },
  {
    id: 'bash-09-two-pointers',
    title: '09. 투 포인터 & 슬라이딩 윈도우',
    category: 'Backend & Scripting',
    language: 'bash',
    engine: 'webcontainer',
    description: 'Two Sum 투 포인터 선형 시간 탐색 O(N)',
    mainFile: 'script.sh',
    tags: ['Two Pointers', 'O(N)'],
    files: {
      'script.sh': `#!/bin/bash
# ==========================================
# 🐚 [09] Bash: 투 포인터 (Two Sum)
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
    id: 'bash-10-greedy',
    title: '10. 그리디 알고리즘 (Greedy - 회의실 배정)',
    category: 'Backend & Scripting',
    language: 'bash',
    engine: 'webcontainer',
    description: '종료 시간 정렬 기반 회의실 최대 배정',
    mainFile: 'script.sh',
    tags: ['Greedy', 'Activity Selection'],
    files: {
      'script.sh': `#!/bin/bash
# ==========================================
# 🐚 [10] Bash: 그리디 (회의실 배정)
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
];
