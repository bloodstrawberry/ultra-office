import { DataStructureDefinition, DataStructureId } from './types';

export const DATA_STRUCTURES: Record<DataStructureId, DataStructureDefinition> = {
  array: {
    id: 'array',
    name: '배열 & 동적 배열',
    englishName: 'Array & Dynamic Array (ArrayList)',
    icon: '📦',
    tag: '선형 연속 메모리',
    tagColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    summary:
      '메모리 상에 연속적으로 배치되어 인덱스를 통한 즉각적인 접근(O(1))이 가능한 가장 기본적인 자료구조입니다.',
    description:
      '일반 배열은 고정 크기를 가지며, 동적 배열(Dynamic Array)은 공간이 꽉 차면 2배 크기의 새로운 배열을 할당하여 원소를 복사하는 Doubling 기법으로 분할 상환 O(1)의 추가 비용을 가집니다.',
    advantages: [
      '인덱스를 이용한 임의 접근(Random Access)이 O(1)로 매우 빠름',
      '메모리 연속성으로 인한 높은 CPU 캐시 지역성(Cache Locality)',
      '포인터 오버헤드가 없어 메모리 공간 효율적',
    ],
    disadvantages: [
      '중간 삽입 및 삭제 시 뒤쪽 원소들을 전부 한 칸씩 밀어야 하므로 O(N) 소요',
      '고정 배열의 경우 크기 변경 불가, 동적 배열은 확장 시 일시적 O(N) 복사 발생',
    ],
    realWorldUses: [
      '인덱스 기반 고속 조회가 필요한 모든 테이블/룩업 데이터',
      '행렬(Matrix) 연산 및 이미지 픽셀 버퍼',
      '다른 고급 자료구조(힙, 해시 테이블, 원형 큐)의 기본 물리적 저장소',
    ],
    operations: [
      {
        name: '인덱스 접근 (Access)',
        timeComplexity: 'O(1)',
        description: '메모리 주소 직접 계산 (Base + Index * Size)',
      },
      {
        name: '맨 뒤 추가 (Append)',
        timeComplexity: 'O(1) (Amortized)',
        description: '동적 배열 여유 공간에 즉시 삽입',
      },
      {
        name: '중간 삽입 (Insert at i)',
        timeComplexity: 'O(N)',
        description: 'i번째 이후 원소들을 오른쪽으로 시프트',
      },
      {
        name: '중간 삭제 (Delete at i)',
        timeComplexity: 'O(N)',
        description: 'i번째 이후 원소들을 왼쪽으로 시프트',
      },
      {
        name: '값 탐색 (Search)',
        timeComplexity: 'O(N)',
        description: '선형 순회 (정렬된 경우 이진 탐색 O(log N))',
      },
    ],
    spaceComplexity: 'O(N)',
    quiz: [
      {
        id: 'arr-q1',
        question: '배열에서 인덱스를 통한 임의 접근(Random Access)의 시간 복잡도는 무엇인가요?',
        options: ['O(1)', 'O(log N)', 'O(N)', 'O(N²)'],
        correctIndex: 0,
        explanation:
          "배열은 메모리에 연속적으로 저장되므로 '시작 주소 + (인덱스 × 원소 크기)' 공식을 통해 즉시 O(1)에 주소를 계산합니다.",
      },
      {
        id: 'arr-q2',
        question:
          '동적 배열의 용량(Capacity)이 가득 찼을 때 새 원소를 추가하면 어떤 일이 발생하나요?',
        options: [
          '에러가 발생하고 프로그램이 종료된다.',
          '보통 2배 크기의 새 메모리를 할당하고 기존 원소를 복사한다.',
          '가장 오래된 원소를 자동으로 삭제하고 추가한다.',
          'O(1) 속도로 메모리 주소만 확장된다.',
        ],
        correctIndex: 1,
        explanation:
          '동적 배열은 기존 크기의 2배(또는 1.5배) 크기의 새로운 연속 메모리를 할당한 뒤 기존 데이터를 복사하는 Doubling 방식을 사용합니다.',
      },
    ],
  },

  linkedList: {
    id: 'linkedList',
    name: '연결 리스트',
    englishName: 'Singly & Doubly Linked List',
    icon: '🔗',
    tag: '선형 포인터 연결',
    tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    summary:
      '각 노드가 데이터와 다음(또는 이전) 노드를 가리키는 포인터(참조)를 포함하여 동적으로 연결되는 자료구조입니다.',
    description:
      '메모리 상에 흩어져 있는 노드들을 포인터로 엮어 관리하므로, 원소의 삽입과 삭제 시 다른 원소들을 밀어낼 필요 없이 포인터 연결만 O(1)에 수정할 수 있습니다.',
    advantages: [
      '크기가 동적으로 조절되며 사전 크기 지정 불필요',
      '위치를 알고 있는 경우 노드의 삽입 및 삭제가 O(1)로 매우 빠름',
      '메모리 단편화(Fragmentation)에 강함',
    ],
    disadvantages: [
      '인덱스 기반 임의 접근 불가 — 특정 노드까지 O(N)으로 순회(Traversal) 필요',
      '포인터(참조)를 저장하기 위한 추가 메모리 오버헤드 존재',
      '비연속 메모리 배치로 인해 CPU 캐시 효율이 낮음',
    ],
    realWorldUses: [
      '삽입/삭제가 빈번한 텍스트 에디터의 실행 취소(Undo) 버퍼',
      '해시 테이블의 Chaining 충돌 해결 체인',
      '운영체제의 가용 메모리 블록 관리 (Free List)',
    ],
    operations: [
      { name: '맨 앞 삽입 (Push Front)', timeComplexity: 'O(1)', description: 'Head 포인터 갱신' },
      {
        name: '맨 뒤 삽입 (Push Back)',
        timeComplexity: 'O(1)',
        description: 'Tail 포인터 보유 시 즉시 연결',
      },
      {
        name: '노드 삭제 (Delete)',
        timeComplexity: 'O(1)',
        description: '이전 노드의 next를 건너뛰어 연결',
      },
      {
        name: '원소 탐색 (Search)',
        timeComplexity: 'O(N)',
        description: 'Head부터 차례대로 next를 따라 순회',
      },
      {
        name: '인덱스 접근 (Access)',
        timeComplexity: 'O(N)',
        description: 'k번째 노드까지 순차 이동 필요',
      },
    ],
    spaceComplexity: 'O(N) (포인터 오버헤드 포함)',
    quiz: [
      {
        id: 'll-q1',
        question: '연결 리스트의 Head 노드 바로 앞에 새 노드를 삽입할 때의 시간 복잡도는?',
        options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
        correctIndex: 0,
        explanation:
          '새 노드의 next를 기존 Head로 지정하고 Head 포인터만 교체하면 되므로 다른 원소의 이동 없이 O(1)에 완료됩니다.',
      },
      {
        id: 'll-q2',
        question:
          '단일 연결 리스트와 비교할 때 이중 연결 리스트(Doubly Linked List)의 가장 큰 장점은?',
        options: [
          '메모리를 덜 차지한다.',
          '양방향(이전/다음) 이동이 가능하며 삭제 연산이 용이하다.',
          '임의 접근(Random Access)이 O(1)이 된다.',
          '항상 정렬된 상태를 유지한다.',
        ],
        correctIndex: 1,
        explanation:
          '이중 연결 리스트는 prev 포인터가 있어 역방향 순회가 가능하며, 특정 노드가 주어졌을 때 이전 노드를 O(1)에 찾아 즉시 삭제할 수 있습니다.',
      },
    ],
  },

  stack: {
    id: 'stack',
    name: '스택',
    englishName: 'Stack (LIFO)',
    icon: '🥞',
    tag: '후입선출',
    tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    summary:
      '가장 마지막에 들어간 원소가 가장 먼저 나오는 후입선출(Last-In, First-Out: LIFO) 원리의 자료구조입니다.',
    description:
      '모든 데이터의 삽입(Push)과 삭제(Pop)가 오직 최상단(Top)에서만 이루어지며, 작업의 역순 복원이나 함수 호출 관리에 핵심적으로 사용됩니다.',
    advantages: [
      '삽입(Push), 삭제(Pop), 조회(Peek) 연산이 모두 O(1)로 극도로 빠름',
      '구현이 매우 직관적이고 단순함',
      '되돌리기(Undo), 재귀 호출 상태 저장에 완벽히 부합',
    ],
    disadvantages: [
      'Top 이외의 중간 원소나 바닥의 원소에 직접 접근 불가',
      '배열 기반 스택의 경우 용량 초과(Stack Overflow) 위험',
    ],
    realWorldUses: [
      '함수 호출 스택 (Call Stack) 및 재귀 함수 실행 흐름 관리',
      '웹 브라우저의 뒤로가기/앞으로가기 히스토리',
      '괄호 짝 검사((), {}, []) 및 후위 표기법(Postfix) 계산기',
    ],
    operations: [
      { name: '삽입 (Push)', timeComplexity: 'O(1)', description: 'Top 위치에 새 원소 적재' },
      { name: '삭제 (Pop)', timeComplexity: 'O(1)', description: 'Top 위치의 원소를 꺼내고 반환' },
      {
        name: '최상단 조회 (Peek)',
        timeComplexity: 'O(1)',
        description: '원소를 꺼내지 않고 Top 값만 확인',
      },
      {
        name: '비어있는지 확인 (IsEmpty)',
        timeComplexity: 'O(1)',
        description: 'Top 포인터가 null인지 검사',
      },
    ],
    spaceComplexity: 'O(N)',
    quiz: [
      {
        id: 'stack-q1',
        question: '스택(Stack)의 동작 원리로 올바른 것은 무엇인가요?',
        options: ['FIFO (선입선출)', 'LIFO (후입선출)', 'LILO (후입후출)', 'Random Access'],
        correctIndex: 1,
        explanation:
          '스택은 가장 나중에 들어간 데이터가 가장 먼저 나오는 LIFO (Last-In First-Out) 구조입니다.',
      },
    ],
  },

  queue: {
    id: 'queue',
    name: '큐 & 덱',
    englishName: 'Queue (FIFO) & Deque',
    icon: '🚶‍♂️',
    tag: '선입선출 & 양방향',
    tagColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    summary:
      '먼저 들어간 원소가 먼저 나오는 선입선출(First-In, First-Out: FIFO) 원리의 큐와 양쪽 끝에서 입출력이 가능한 덱(Deque)입니다.',
    description:
      '큐는 Rear에서 삽입(Enqueue)되고 Front에서 삭제(Dequeue)됩니다. 덱(Double-Ended Queue)은 Front와 Rear 양쪽 모두에서 자유롭게 삽입과 삭제를 지원합니다.',
    advantages: [
      '순서 보장이 필요한 대기열 처리에 최적화',
      '삽입(Enqueue) 및 삭제(Dequeue) 연산이 모두 O(1)',
      '버퍼(Buffer) 및 너비 우선 탐색(BFS)의 기본 구조',
    ],
    disadvantages: [
      '선형 배열 기반 큐는 앞쪽 공간이 낭비될 수 있어 원형 큐(Circular Queue) 필요',
      '중간 원소에 대한 임의 접근 불가',
    ],
    realWorldUses: [
      '프린터 인쇄 대기열 및 OS 프로세스 CPU 스케줄링',
      '그래프 너비 우선 탐색(BFS) 알고리즘',
      '네트워크 패킷 버퍼 및 메시지 브로커(RabbitMQ, Kafka)',
    ],
    operations: [
      { name: '큐 삽입 (Enqueue)', timeComplexity: 'O(1)', description: 'Rear 끝에 새 원소 추가' },
      {
        name: '큐 삭제 (Dequeue)',
        timeComplexity: 'O(1)',
        description: 'Front 맨 앞 원소 추출 및 반환',
      },
      { name: '맨 앞 조회 (Front/Peek)', timeComplexity: 'O(1)', description: 'Front 원소 확인' },
      {
        name: '덱 양방향 삽입/삭제',
        timeComplexity: 'O(1)',
        description: 'PushFront, PushBack, PopFront, PopBack 모두 지원',
      },
    ],
    spaceComplexity: 'O(N)',
    quiz: [
      {
        id: 'q-q1',
        question: '너비 우선 탐색(BFS) 알고리즘에서 방문할 노드를 관리할 때 사용하는 자료구조는?',
        options: ['스택 (Stack)', '큐 (Queue)', '해시 테이블 (Hash Table)', '힙 (Heap)'],
        correctIndex: 1,
        explanation:
          'BFS는 시작점에서 가까운 레벨 순서대로 탐색하기 위해 선입선출(FIFO) 특성을 가진 큐(Queue)를 사용합니다.',
      },
    ],
  },

  hashTable: {
    id: 'hashTable',
    name: '해시 테이블',
    englishName: 'Hash Table / HashMap',
    icon: '🔑',
    tag: 'Key-Value 매핑',
    tagColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    summary:
      '해시 함수(Hash Function)를 사용하여 Key를 배열 인덱스로 변환해 평균 O(1)에 검색/삽입/삭제를 수행합니다.',
    description:
      '임의의 크기를 가진 키(문자열, 숫자 등)를 고정된 범위의 정수 해시 코드로 변환합니다. 서로 다른 키가 같은 인덱스로 매핑되는 해시 충돌(Hash Collision)은 Chaining(연결 리스트)이나 Open Addressing(개방 주소법)으로 해결합니다.',
    advantages: [
      '평균적으로 검색(Lookup), 삽입(Insert), 삭제(Delete)가 모두 O(1)로 극도로 빠름',
      '유연한 Key-Value 쌍 구조 지원 (사전, Map, Set)',
    ],
    disadvantages: [
      '해시 충돌이 심하게 발생하면 최악의 경우 O(N)으로 성능 저하',
      '데이터가 정렬된 순서를 유지하지 않음',
      '해시 버킷 배열 할당으로 인한 메모리 공간 오버헤드',
    ],
    realWorldUses: [
      '데이터베이스 인덱싱 및 캐시 시스템 (Redis, Memcached)',
      '프로그래밍 언어의 딕셔너리(Python dict, JS Map/Object)',
      '중복 검사 및 라우팅 테이블',
    ],
    operations: [
      {
        name: '조회 (Lookup / Get)',
        timeComplexity: 'O(1) avg / O(N) worst',
        description: 'Key의 해시값 계산 후 버킷 조회',
      },
      {
        name: '삽입 (Insert / Put)',
        timeComplexity: 'O(1) avg / O(N) worst',
        description: '버킷에 Key-Value 저장 (충돌 시 체인 추가)',
      },
      {
        name: '삭제 (Delete / Remove)',
        timeComplexity: 'O(1) avg / O(N) worst',
        description: '버킷에서 해당 Key 항목 제거',
      },
    ],
    spaceComplexity: 'O(N)',
    quiz: [
      {
        id: 'hash-q1',
        question:
          '해시 테이블에서 서로 다른 두 Key가 동일한 버킷 인덱스로 계산되는 현상을 무엇이라고 하나요?',
        options: ['해시 오버플로우', '해시 충돌 (Hash Collision)', '체이닝 오류', '더블 해싱'],
        correctIndex: 1,
        explanation:
          "비둘기집 원리에 의해 서로 다른 키가 동일한 해시 버킷 인덱스를 갖는 현상을 '해시 충돌(Hash Collision)'이라고 부릅니다.",
      },
    ],
  },

  bst: {
    id: 'bst',
    name: '이진 탐색 트리',
    englishName: 'Binary Search Tree (BST)',
    icon: '🌲',
    tag: '계층형 트리',
    tagColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    summary:
      "모든 노드에 대해 '왼쪽 서브트리 값 < 부모 값 < 오른쪽 서브트리 값' 불변식을 유지하는 계층적 트리 구조입니다.",
    description:
      '트리의 균형이 잘 유지되는 경우 탐색, 삽입, 삭제가 트리의 높이인 O(log N)에 수행됩니다. 중위 순회(Inorder Traversal)를 실행하면 모든 원소가 오름차순으로 정렬되어 출력됩니다.',
    advantages: [
      '정렬된 상태를 유지하면서 동적 삽입/삭제/탐색 O(log N)',
      '최솟값(가장 왼쪽 끝), 최댓값(가장 오른쪽 끝) 조회가 O(log N)으로 빠름',
      '중위 순회 시 O(N)으로 전체 정렬 데이터 획득',
    ],
    disadvantages: [
      '정렬된 데이터가 순서대로 삽입되면 편향 트리(Skewed Tree)가 되어 O(N)으로 퇴화',
      '자가 균형 트리(AVL, Red-Black Tree)에 비해 균형 유지가 어려움',
    ],
    realWorldUses: [
      '정렬된 순서와 빠른 범위 검색이 필요한 데이터베이스 인덱스 (B-Tree/B+Tree의 기초)',
      'C++ std::set, std::map, Java TreeSet/TreeMap (Red-Black 기반)',
      '파일 시스템 디렉터리 계층 구조',
    ],
    operations: [
      {
        name: '탐색 (Search)',
        timeComplexity: 'O(log N) avg / O(N) worst',
        description: '대소 비교를 통해 좌/우 서브트리 분기',
      },
      {
        name: '삽입 (Insert)',
        timeComplexity: 'O(log N) avg / O(N) worst',
        description: '탐색 위치 리프 노드에 새 노드 연결',
      },
      {
        name: '삭제 (Delete)',
        timeComplexity: 'O(log N) avg / O(N) worst',
        description: '자식 0개, 1개, 2개인 경우(후계자 노드 대체) 처리',
      },
      {
        name: '중위 순회 (Inorder)',
        timeComplexity: 'O(N)',
        description: 'Left -> Root -> Right 순회로 오름차순 출력',
      },
    ],
    spaceComplexity: 'O(N)',
    quiz: [
      {
        id: 'bst-q1',
        question:
          '이진 탐색 트리(BST)에서 중위 순회(Inorder Traversal: Left -> Root -> Right)를 수행하면 어떤 결과가 나오나요?',
        options: [
          '원소들이 내림차순으로 출력된다.',
          '원소들이 오름차순으로 정렬되어 출력된다.',
          '루트 노드가 가장 먼저 출력된다.',
          '임의의 순서로 출력된다.',
        ],
        correctIndex: 1,
        explanation:
          "BST의 'Left < Root < Right' 특성 때문에 중위 순회를 거치면 자연스럽게 오름차순 정렬된 결과를 얻게 됩니다.",
      },
    ],
  },

  heap: {
    id: 'heap',
    name: '힙 & 우선순위 큐',
    englishName: 'Binary Heap / Priority Queue',
    icon: '🏔️',
    tag: '완전 이진 트리',
    tagColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    summary:
      '최댓값 또는 최솟값을 O(1)에 빠르게 찾을 수 있도록 고안된 완전 이진 트리(Complete Binary Tree) 기반 자료구조입니다.',
    description:
      '최대 힙(Max Heap)은 부모 노드의 값이 항상 자식 노드보다 크거나 같고, 최소 힙(Min Heap)은 작거나 같습니다. 포인터 없이 1차원 배열로 완벽히 표현되며 (왼쪽 자식 = 2i+1, 오른쪽 자식 = 2i+2, 부모 = (i-1)/2), 우선순위 큐의 핵심 엔진입니다.',
    advantages: [
      '최댓값/최솟값 조회(Peek)가 O(1)로 즉각적임',
      '삽입 및 최댓값 추출이 항상 O(log N)으로 안정적',
      '포인터가 필요 없는 컴팩트한 1차원 배열 표현으로 메모리 낭비 없음',
    ],
    disadvantages: [
      '루트 이외의 특정 임의 원소 탐색은 O(N) 소요',
      '전체 원소가 완전 정렬된 상태는 아님 (반정렬 상태)',
    ],
    realWorldUses: [
      '우선순위 큐 (Priority Queue)',
      '다익스트라(Dijkstra) 및 프림(Prim) 최단 경로/MST 알고리즘',
      '힙 정렬 (Heap Sort)',
      '실시간 상위 K개 항목(Top-K) 추출',
    ],
    operations: [
      {
        name: '루트 조회 (Peek Min/Max)',
        timeComplexity: 'O(1)',
        description: '인덱스 0번 원소 즉시 확인',
      },
      {
        name: '삽입 (Push / Insert)',
        timeComplexity: 'O(log N)',
        description: '맨 끝에 추가 후 부모와 비교하며 Heapify-Up',
      },
      {
        name: '루트 추출 (Extract Min/Max)',
        timeComplexity: 'O(log N)',
        description: '루트 제거 후 마지막 원소를 루트로 올리고 Heapify-Down',
      },
      {
        name: '배열 힙 생성 (Heapify)',
        timeComplexity: 'O(N)',
        description: '무작위 배열을 바텀업으로 힙 구조로 변환',
      },
    ],
    spaceComplexity: 'O(N)',
    quiz: [
      {
        id: 'heap-q1',
        question: '1차원 배열로 힙을 표현할 때 인덱스 i 노드의 왼쪽 자식 노드 인덱스는?',
        options: ['2 * i', '2 * i + 1', '2 * i + 2', 'i / 2'],
        correctIndex: 1,
        explanation:
          '0-indexed 배열 기반 완전 이진 트리에서 인덱스 i의 왼쪽 자식은 2*i + 1, 오른쪽 자식은 2*i + 2입니다.',
      },
    ],
  },

  graph: {
    id: 'graph',
    name: '그래프',
    englishName: 'Graph (Vertices & Edges)',
    icon: '🕸️',
    tag: '네트워크 & 관계',
    tagColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    summary:
      '정점(Vertex/Node)들과 이들을 잇는 간선(Edge)들의 집합으로 복잡한 개체 간의 관계와 네트워크를 표현합니다.',
    description:
      '방향성(Directed/Undirected), 가중치(Weighted/Unweighted), 순환(Cyclic/Acyclic) 등 다양한 형태가 있습니다. 표현 방식으로는 2차원 불리언/가중치 테이블인 인접 행렬(Adjacency Matrix: O(V²))과 연결 리스트 목록인 인접 리스트(Adjacency List: O(V+E))가 있습니다.',
    advantages: [
      '지도, 소셜 네트워크, 웹 링크 등 현실 세계의 모든 연결 관계를 모델링 가능',
      '다양한 그래프 알고리즘(BFS, DFS, Dijkstra, 위상 정렬 등) 적용',
    ],
    disadvantages: [
      '알고리즘의 복잡도가 높고 사이클(무한 루프) 방지 처리 필수',
      '인접 행렬의 경우 희소 그래프(Sparse Graph)에서 메모리 낭비 발생',
    ],
    realWorldUses: [
      'SNS 친구 추천 및 팔로우 네트워크',
      '내비게이션 GPS 도로망 및 최단 경로 길찾기',
      '웹 검색 엔진의 페이지랭크(PageRank) 링크 분석',
    ],
    operations: [
      {
        name: '간선 존재 확인 (인접 행렬)',
        timeComplexity: 'O(1)',
        description: 'matrix[u][v] 즉시 조회',
      },
      {
        name: '간선 존재 확인 (인접 리스트)',
        timeComplexity: 'O(deg(u))',
        description: '정점 u의 연결 리스트 순회',
      },
      {
        name: '정점의 모든 이웃 순회',
        timeComplexity: '인접 리스트 O(deg(u)) / 인접 행렬 O(V)',
        description: '인접 노드 탐색',
      },
      {
        name: '그래프 탐색 (BFS/DFS)',
        timeComplexity: 'O(V + E)',
        description: '모든 도달 가능한 정점과 간선 순회',
      },
    ],
    spaceComplexity: '인접 행렬 O(V²) / 인접 리스트 O(V + E)',
    quiz: [
      {
        id: 'graph-q1',
        question:
          '간선의 수가 정점 수에 비해 적은 희소 그래프(Sparse Graph)를 메모리 효율적으로 표현하기에 가장 적합한 방식은?',
        options: [
          '인접 행렬 (Adjacency Matrix)',
          '인접 리스트 (Adjacency List)',
          '완전 이진 트리',
          '스택',
        ],
        correctIndex: 1,
        explanation:
          '간선이 적은 희소 그래프에서는 V×V 크기를 전부 할당하는 인접 행렬보다 실제 존재하는 간선만 저장하는 인접 리스트(O(V+E))가 메모리 효율적입니다.',
      },
    ],
  },

  deque: {
    id: 'deque',
    name: '덱 (양방향 큐)',
    englishName: 'Deque (Double-Ended Queue)',
    icon: '↔️',
    tag: '선형 양방향 입출력',
    tagColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    summary:
      '앞(Front)과 뒤(Rear) 양쪽 끝에서 모두 O(1) 시간에 삽입과 삭제가 가능한 다목적 선형 자료구조입니다.',
    description:
      '스택(LIFO)과 큐(FIFO)의 기능을 모두 포괄하며, 양방향 연결 리스트나 원형 버퍼(Circular Buffer)를 기반으로 구현됩니다. 슬라이딩 윈도우 최댓값 찾기나 앞뒤 양방향 탐색에 매우 유용합니다.',
    advantages: [
      '양쪽 끝에서의 삽입(PushFront, PushBack) 및 삭제(PopFront, PopBack)가 모두 O(1)',
      '스택과 큐로 모두 자유롭게 변환 및 사용 가능',
      '슬라이딩 윈도우 및 회문(Palindrome) 검사에 최적',
    ],
    disadvantages: [
      '배열 기반일 경우 용량 조절 및 원형 인덱스 연산 필요',
      '중간 원소의 임의 접근이나 삽입/삭제는 O(N) 소요',
    ],
    realWorldUses: [
      '웹 브라우저의 앞/뒤 방문 기록 관리',
      '작업 훔치기(Work-stealing) 멀티스레드 스케줄러',
      '슬라이딩 윈도우 최댓값/최솟값 유지 덱 알고리즘',
    ],
    operations: [
      {
        name: '맨 앞 삽입 (Push Front)',
        timeComplexity: 'O(1)',
        description: 'Front 포인터 앞쪽에 원소 추가',
      },
      {
        name: '맨 뒤 삽입 (Push Back)',
        timeComplexity: 'O(1)',
        description: 'Rear 포인터 뒤쪽에 원소 추가',
      },
      {
        name: '맨 앞 삭제 (Pop Front)',
        timeComplexity: 'O(1)',
        description: 'Front 원소 추출 후 포인터 이동',
      },
      {
        name: '맨 뒤 삭제 (Pop Back)',
        timeComplexity: 'O(1)',
        description: 'Rear 원소 추출 후 포인터 이동',
      },
    ],
    spaceComplexity: 'O(N)',
    quiz: [
      {
        id: 'deque-q1',
        question: '덱(Deque)의 가장 큰 구조적 특징은 무엇인가요?',
        options: [
          '앞뒤 양쪽 끝 모두에서 O(1) 삽입과 삭제가 가능하다.',
          '정렬된 순서로만 원소가 삽입된다.',
          '오직 한쪽 끝에서만 입출력이 일어난다.',
          '트리 형태로 원소를 저장한다.',
        ],
        correctIndex: 0,
        explanation:
          '덱은 Double-Ended Queue의 약자로 양쪽 끝(Front, Rear) 모두에서 자유롭게 Push와 Pop이 가능합니다.',
      },
    ],
  },

  priorityQueue: {
    id: 'priorityQueue',
    name: '우선순위 큐',
    englishName: 'Priority Queue',
    icon: '🚨',
    tag: '우선순위 기반 큐',
    tagColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    summary:
      "들어간 순서와 상관없이 각 원소의 '우선순위'가 높은 데이터가 먼저 출력되는 추상 자료형입니다.",
    description:
      '일반 큐(FIFO)와 달리 원소마다 우선순위(Priority)를 부여하며, 내부적으로 주로 이진 힙(Binary Heap)을 사용하여 삽입과 최우선 원소 추출을 O(log N) 시간에 효율적으로 처리합니다.',
    advantages: [
      '항상 가장 높은(또는 낮은) 우선순위의 원소를 O(1)에 조회하고 O(log N)에 추출',
      '동적으로 새로운 우선순위의 작업이 계속 유입되는 환경에 최적',
    ],
    disadvantages: [
      '단순 배열/연결리스트 큐(O(1))보다 삽입/삭제 오버헤드(O(log N))가 존재',
      '임의 원소 탐색은 O(N) 소요',
    ],
    realWorldUses: [
      '응급실 응급 환자 우선 치료 순서 스케줄링',
      '운영체제 CPU 프로세스 우선순위 스케줄러',
      '다익스트라(Dijkstra) 및 A* 최단 경로 길찾기',
      '허프만 코딩(Huffman Coding) 데이터 압축',
    ],
    operations: [
      {
        name: '원소 삽입 (Enqueue)',
        timeComplexity: 'O(log N)',
        description: '우선순위와 함께 삽입 후 Heapify-Up',
      },
      {
        name: '최고 우선순위 추출 (Dequeue)',
        timeComplexity: 'O(log N)',
        description: '루트 원소 추출 후 Heapify-Down',
      },
      {
        name: '최고 우선순위 조회 (Peek)',
        timeComplexity: 'O(1)',
        description: '루트 노드 즉시 확인',
      },
    ],
    spaceComplexity: 'O(N)',
    quiz: [
      {
        id: 'pq-q1',
        question:
          '이진 힙(Binary Heap)으로 구현된 우선순위 큐에서 새 원소를 Enqueue할 때의 시간 복잡도는?',
        options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
        correctIndex: 1,
        explanation:
          '힙 트리의 맨 끝에 삽입한 후 루트 방향으로 올라가며 우선순위를 맞추는 Heapify-Up 과정이 트리 높이(log N)만큼 수행됩니다.',
      },
    ],
  },

  set: {
    id: 'set',
    name: '셋 (고유 집합)',
    englishName: 'Set / HashSet',
    icon: '💎',
    tag: '중복 불허 고유 집합',
    tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    summary:
      '중복을 허용하지 않고 오직 고유한(Unique) 원소들만 저장하는 수학적 집합 자료구조입니다.',
    description:
      '해시 기반의 HashSet은 평균 O(1)에 원소의 존재 여부(Has/Contains)와 삽입/삭제를 처리하며, 트리 기반의 TreeSet(Red-Black Tree)은 정렬된 상태를 유지하며 O(log N)에 동작합니다.',
    advantages: [
      '데이터의 중복을 원천 차단하여 유일성 보장',
      '평균 O(1) 시간의 초고속 소속 검사 (Membership Test: `set.has(x)`)',
      '합집합, 교집합, 차집합 등의 집합 연산 지원',
    ],
    disadvantages: [
      '인덱스를 통한 순서 기반 접근 불가',
      '해시 충돌 발생 시 최악 O(N) 성능 저하 가능',
    ],
    realWorldUses: [
      '중복 방문 방지 (방문한 URL / 방문한 노드 집합)',
      '사용자 고유 태그 및 권한 목록 관리',
      '장바구니 중복 상품 필터링',
    ],
    operations: [
      {
        name: '원소 추가 (Add)',
        timeComplexity: 'O(1) (평균)',
        description: '해시 계산 후 중복이 없으면 삽입',
      },
      {
        name: '원소 삭제 (Delete)',
        timeComplexity: 'O(1) (평균)',
        description: '해시 키 조회 후 제거',
      },
      {
        name: '존재 여부 확인 (Has)',
        timeComplexity: 'O(1) (평균)',
        description: '해시 테이블에서 키 존재 여부 검사',
      },
    ],
    spaceComplexity: 'O(N)',
    quiz: [
      {
        id: 'set-q1',
        question: 'Set 자료구조에 이미 존재하는 원소를 다시 추가(Add)하면 어떻게 되나요?',
        options: [
          '에러가 발생하고 프로그램이 중단된다.',
          '기존 원소를 덮어쓰고 개수가 2개로 증가한다.',
          '중복이 무시되어 집합의 크기가 변하지 않는다.',
          '가장 오래된 원소가 삭제된다.',
        ],
        correctIndex: 2,
        explanation:
          'Set은 중복을 허용하지 않으므로 이미 존재하는 값을 추가해도 아무런 변화 없이 고유성을 유지합니다.',
      },
    ],
  },

  map: {
    id: 'map',
    name: '맵 (키-값 사전)',
    englishName: 'Map / Dictionary (Key-Value)',
    icon: '🗺️',
    tag: '연관 Key-Value 매핑',
    tagColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    summary:
      '고유한 키(Key)와 이에 대응하는 값(Value)을 쌍으로 묶어 저장하는 연관 배열 자료구조입니다.',
    description:
      '키를 통해 연관된 값을 상수 시간(O(1))에 조회할 수 있으며, 자바스크립트의 `Map`, Python의 `dict`, Java의 `HashMap`이 대표적입니다.',
    advantages: [
      '키를 통한 O(1) 평균 시간의 고속 데이터 검색 및 수정',
      '문자열, 객체, 숫자 등 다양한 타입을 키로 활용 가능',
      '데이터 간의 1:1 대응 관계를 직관적으로 표현',
    ],
    disadvantages: [
      '키의 순서 보장이 필요한 경우 추가 오버헤드 발생',
      '해시 버킷 메모리 공간 오버헤드 존재',
    ],
    realWorldUses: [
      '사용자 ID ➔ 회원 정보 객체 조회 캐시',
      '단어 빈도수 카운팅 (Word Frequency)',
      'HTTP 요청 라우팅 테이블 및 설정 사전',
    ],
    operations: [
      {
        name: '값 설정 (Set / Put)',
        timeComplexity: 'O(1) (평균)',
        description: 'Key 해시 버킷에 Value 저장',
      },
      {
        name: '값 조회 (Get)',
        timeComplexity: 'O(1) (평균)',
        description: 'Key에 매핑된 Value 반환',
      },
      {
        name: '키 삭제 (Delete)',
        timeComplexity: 'O(1) (평균)',
        description: '해당 Key-Value 쌍 제거',
      },
      {
        name: '키 존재 확인 (Has)',
        timeComplexity: 'O(1) (평균)',
        description: '해당 Key 존재 여부 반환',
      },
    ],
    spaceComplexity: 'O(N)',
    quiz: [
      {
        id: 'map-q1',
        question: 'Map 자료구조에서 동일한 키(Key)로 새로운 값을 Set하면 어떻게 되나요?',
        options: [
          '새로운 키-값 쌍이 추가되어 키가 2개가 된다.',
          '기존 키의 값이 새로운 값으로 갱신(덮어쓰기)된다.',
          '런타임 오류가 발생한다.',
          '기존 값이 유지되고 새 값은 무시된다.',
        ],
        correctIndex: 1,
        explanation:
          'Map의 Key는 고유해야 하므로, 이미 존재하는 Key에 새 값을 넣으면 기존 Value가 새 Value로 갱신됩니다.',
      },
    ],
  },

  tree: {
    id: 'tree',
    name: '트리 (계층형 N진 트리)',
    englishName: 'N-ary Tree / Hierarchical Tree',
    icon: '🌲',
    tag: '비순환 계층 구조',
    tagColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    summary:
      '하나의 루트 노드에서 시작하여 부모-자식 관계로 뻗어나가는 계층적 비순환 자료구조입니다.',
    description:
      '사이클이 없는 연결 그래프의 일종으로, 각 노드는 0개 이상의 자식 노드를 가질 수 있습니다. 파일 시스템의 디렉토리 구조, 웹 브라우저의 DOM 트리, JSON 계층 구조의 근간입니다.',
    advantages: [
      '계층적이고 포함 관계를 갖는 데이터를 자연스럽게 모델링',
      '재귀적 탐색 및 분할 정복(Divide & Conquer) 적용에 최적',
    ],
    disadvantages: [
      '트리의 균형이 무너져 일렬로 길어지면 최악 O(N) 탐색 시간 발생',
      '자식 노드 참조 포인터들로 인한 메모리 오버헤드',
    ],
    realWorldUses: [
      '컴퓨터 파일 시스템 디렉토리 구조 (Folder / File)',
      'HTML / XML DOM(Document Object Model) 트리',
      '기업 조직도 및 계층적 카테고리 분류 체계',
    ],
    operations: [
      {
        name: '전위 순회 (Pre-order)',
        timeComplexity: 'O(N)',
        description: '루트 ➔ 자식 노드 순차 방문',
      },
      {
        name: '후위 순회 (Post-order)',
        timeComplexity: 'O(N)',
        description: '자식 노드 전부 방문 ➔ 루트 방문',
      },
      {
        name: '레벨 순회 (BFS)',
        timeComplexity: 'O(N)',
        description: '깊이(Depth) 레벨 단위로 큐를 이용해 방문',
      },
    ],
    spaceComplexity: 'O(N)',
    quiz: [
      {
        id: 'tree-q1',
        question: 'N개의 노드를 가진 트리의 총 간선(Edge) 개수는 항상 몇 개인가요?',
        options: ['N - 1개', 'N개', 'N + 1개', '2N개'],
        correctIndex: 0,
        explanation:
          '루트 노드를 제외한 모든 노드는 정확히 하나의 부모 노드와 연결되므로, N개 노드의 트리는 항상 N - 1개의 간선을 가집니다.',
      },
    ],
  },

  trie: {
    id: 'trie',
    name: '트라이 (문자열 접두사 트리)',
    englishName: 'Trie (Prefix Tree)',
    icon: '🔤',
    tag: '문자열 고속 검색',
    tagColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    summary:
      '문자열의 각 글자를 노드로 구성하여 접두사(Prefix) 기반의 초고속 검색과 자동완성을 제공하는 트리입니다.',
    description:
      '문자열의 길이가 L일 때, 사전 내 단어 개수(N)와 무관하게 오직 문자열 길이 O(L)만에 삽입과 검색이 완료됩니다. 검색 엔진의 자동완성, 맞춤법 검사기, IP 라우팅 테이블(Longest Prefix Match)에 핵심적으로 사용됩니다.',
    advantages: [
      '단어 검색 및 삽입 속도가 단어 개수에 무관하게 단어 길이 O(L)로 매우 빠름',
      '공통 접두사를 공유하므로 접두사 검색(Prefix Matching) 및 자동완성에 최적',
    ],
    disadvantages: [
      '각 노드마다 자식 포인터 배열/맵을 유지해야 하므로 메모리 사용량이 큼 (Memory Overhead)',
    ],
    realWorldUses: [
      '포털 검색창의 검색어 실시간 자동완성 (Autocomplete)',
      '사전 앱의 단어 찾기 및 철자 검사기 (Spell Checker)',
      '네트워크 IP 라우팅 테이블의 최장 접두사 일치 (LPM)',
    ],
    operations: [
      {
        name: '단어 삽입 (Insert)',
        timeComplexity: 'O(L)',
        description: '글자 단위로 노드를 순차 생성하며 이동',
      },
      {
        name: '단어 검색 (Search)',
        timeComplexity: 'O(L)',
        description: '글자 경로를 따라가며 isEndOfWord 확인',
      },
      {
        name: '접두사 확인 (StartsWith)',
        timeComplexity: 'O(L)',
        description: '해당 접두사 노드가 존재하는지 확인',
      },
    ],
    spaceComplexity: 'O(ALPHABET_SIZE × L × N)',
    quiz: [
      {
        id: 'trie-q1',
        question:
          '길이 L인 단어를 100만 개의 단어가 저장된 트라이(Trie)에서 검색할 때의 시간 복잡도는?',
        options: ['O(L)', 'O(log 1,000,000)', 'O(1,000,000 × L)', 'O(L²)'],
        correctIndex: 0,
        explanation:
          '트라이는 사전 내 단어 개수와 무관하게 오직 찾으려는 단어의 글자 수(L)만큼만 노드를 순회하므로 O(L)입니다.',
      },
    ],
  },

  disjointSet: {
    id: 'disjointSet',
    name: '유니온-파인드 (상호 배타 집합)',
    englishName: 'Disjoint Set (Union-Find)',
    icon: '🤝',
    tag: '상호 배타 집합 관리',
    tagColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    summary:
      '서로 겹치지 않는 집합들을 관리하며, 두 원소가 같은 집합인지 확인하고 합치는 연산을 거의 O(1)에 수행합니다.',
    description:
      '각 집합을 트리 구조로 표현하고, 부모 포인터 배열 `parent[i]`를 통해 대표 노드(Root)를 관리합니다. 경로 압축(Path Compression)과 랭크 기반 합치기(Union by Rank) 최적화를 적용하면 아커만 역함수 α(N) ≈ O(1)의 경이로운 시간 복잡도를 달성합니다.',
    advantages: [
      '두 개체의 연결 여부 확인(Find)과 병합(Union)이 분할 상환 O(α(N)) ≈ O(1)로 극도로 빠름',
      '그래프의 사이클(Cycle) 형성 여부를 즉각적으로 판별 가능',
    ],
    disadvantages: [
      '원소 간의 병합만 가능하며, 이미 합쳐진 집합을 다시 쪼개는 분할 연산은 지원하지 않음',
    ],
    realWorldUses: [
      '크루스칼(Kruskal) 최소 신장 트리(MST) 알고리즘',
      '무방향 그래프의 사이클 검출 (Cycle Detection)',
      '이미지 프로세싱의 연결 요소 레이블링 (Connected Component)',
    ],
    operations: [
      {
        name: '루트 찾기 (Find)',
        timeComplexity: 'O(α(N)) ≈ O(1)',
        description: '경로 압축을 적용하여 대표 루트 반환',
      },
      {
        name: '집합 합치기 (Union)',
        timeComplexity: 'O(α(N)) ≈ O(1)',
        description: '두 집합의 루트를 찾아 한쪽 트리에 연결',
      },
      {
        name: '연결 확인 (Connected)',
        timeComplexity: 'O(α(N)) ≈ O(1)',
        description: 'Find(A) === Find(B) 여부 검사',
      },
    ],
    spaceComplexity: 'O(N)',
    quiz: [
      {
        id: 'ds-q1',
        question:
          '유니온-파인드에서 Find 연산 시 거쳐간 모든 노드를 루트 노드에 직접 연결해 트리의 높이를 1로 평탄화하는 최적화 기법은?',
        options: ['경로 압축 (Path Compression)', '힙 정렬', '이진 분할', '깊이 우선 탐색'],
        correctIndex: 0,
        explanation:
          '경로 압축(Path Compression)은 Find를 수행하며 만난 모든 부모 포인터를 루트로 직접 갱신하여 이후의 Find를 O(1)로 단축합니다.',
      },
    ],
  },
};

export function getAllDataStructures(): DataStructureDefinition[] {
  return Object.values(DATA_STRUCTURES);
}

export function getDataStructureById(id: string): DataStructureDefinition | undefined {
  return DATA_STRUCTURES[id as DataStructureId];
}
