import type { CodeTemplate } from '../../types';

// ----------------------------------------------------------------------

export const SQL_TEMPLATES: CodeTemplate[] = [
  {
    id: 'sql-01-create-table',
    title: '01. DDL 테이블 생성 & 제약조건',
    category: 'Database & SQL',
    language: 'sql',
    engine: 'sql',
    description: 'CREATE TABLE, PRIMARY KEY, NOT NULL 제약조건 정의',
    mainFile: 'queries.sql',
    tags: ['SQL', 'DDL', 'CREATE TABLE', 'Database'],
    files: {
      'queries.sql': `-- ==========================================
-- 🗄️ [01] SQL: DDL 테이블 생성
-- ==========================================

CREATE TABLE employees (
    id INT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    department VARCHAR(50),
    salary INT,
    hire_date DATE
);

INSERT INTO employees VALUES (1, '김민수', '개발팀', 6500, '2022-03-01');
INSERT INTO employees VALUES (2, '이지은', '디자인팀', 5500, '2023-05-15');

SELECT * FROM employees;
`,
    },
  },
  {
    id: 'sql-02-insert-data',
    title: '02. DML 데이터 다중 삽입 (INSERT)',
    category: 'Database & SQL',
    language: 'sql',
    engine: 'sql',
    description: '여러 행(Row)을 한 번에 삽입하고 전체 목록 확인',
    mainFile: 'queries.sql',
    tags: ['SQL', 'DML', 'INSERT INTO', 'Rows'],
    files: {
      'queries.sql': `-- ==========================================
-- 🗄️ [02] SQL: 다중 행 INSERT
-- ==========================================

CREATE TABLE products (
    code VARCHAR(10) PRIMARY KEY,
    title VARCHAR(100),
    price INT,
    stock INT
);

INSERT INTO products VALUES
('KB-01', '기계식 키보드', 150000, 25),
('MS-02', '무선 마우스', 65000, 50),
('MN-03', '4K 모니터', 550000, 10),
('HP-04', '노이즈캔슬링 헤드폰', 320000, 15);

SELECT * FROM products;
`,
    },
  },
  {
    id: 'sql-03-where-like',
    title: '03. 조건 조회 (WHERE, LIKE, IN)',
    category: 'Database & SQL',
    language: 'sql',
    engine: 'sql',
    description: '문자열 패턴 검색(LIKE) 및 다중 값 매칭(IN) 필터링',
    mainFile: 'queries.sql',
    tags: ['SQL', 'WHERE', 'LIKE', 'IN', 'Filter'],
    files: {
      'queries.sql': `-- ==========================================
-- 🗄️ [03] SQL: WHERE & LIKE 검색
-- ==========================================

CREATE TABLE users (
    id INT,
    name VARCHAR(50),
    email VARCHAR(100),
    city VARCHAR(50)
);

INSERT INTO users VALUES
(1, '홍길동', 'gildong@gmail.com', 'Seoul'),
(2, '김철수', 'chulsoo@naver.com', 'Busan'),
(3, '이영희', 'younghee@gmail.com', 'Seoul'),
(4, '박지훈', 'jihoon@daum.net', 'Incheon');

-- 1. 서울 거주자 조회
SELECT * FROM users WHERE city = 'Seoul';

-- 2. gmail 사용자 검색 (LIKE)
SELECT name, email FROM users WHERE email LIKE '%@gmail.com';
`,
    },
  },
  {
    id: 'sql-04-order-limit',
    title: '04. 정렬 & 페이징 (ORDER BY, LIMIT)',
    category: 'Database & SQL',
    language: 'sql',
    engine: 'sql',
    description: '내림차순(DESC) 정렬 및 상위 N개 레코드 페이징',
    mainFile: 'queries.sql',
    tags: ['SQL', 'ORDER BY', 'LIMIT', 'OFFSET', 'Pagination'],
    files: {
      'queries.sql': `-- ==========================================
-- 🗄️ [04] SQL: ORDER BY & LIMIT
-- ==========================================

CREATE TABLE scores (
    player VARCHAR(50),
    score INT
);

INSERT INTO scores VALUES
('Alpha', 950), ('Bravo', 1200), ('Charlie', 880), ('Delta', 1450), ('Echo', 1100);

-- 상위 3명 랭킹 조회
SELECT player, score FROM scores ORDER BY score DESC LIMIT 3;
`,
    },
  },
  {
    id: 'sql-05-aggregate',
    title: '05. 집계 함수 (COUNT, SUM, AVG, MAX)',
    category: 'Database & SQL',
    language: 'sql',
    engine: 'sql',
    description: '수치 데이터의 총합, 평균, 최댓값, 최솟값 집계',
    mainFile: 'queries.sql',
    tags: ['SQL', 'COUNT', 'SUM', 'AVG', 'MAX', 'Aggregate'],
    files: {
      'queries.sql': `-- ==========================================
-- 🗄️ [05] SQL: 집계 함수
-- ==========================================

CREATE TABLE sales (
    sale_id INT,
    amount INT
);

INSERT INTO sales VALUES (1, 120000), (2, 450000), (3, 300000), (4, 850000), (5, 210000);

SELECT 
    COUNT(*) AS 총판매건수,
    SUM(amount) AS 총매출액,
    AVG(amount) AS 평균매출액,
    MAX(amount) AS 최고매출,
    MIN(amount) AS 최저매출
FROM sales;
`,
    },
  },
  {
    id: 'sql-06-groupby-having',
    title: '06. 그룹화 & 필터링 (GROUP BY & HAVING)',
    category: 'Database & SQL',
    language: 'sql',
    engine: 'sql',
    description: '부서별 인원 및 평균 급여 계산, HAVING 조건부 필터',
    mainFile: 'queries.sql',
    tags: ['SQL', 'GROUP BY', 'HAVING', 'Analytics'],
    files: {
      'queries.sql': `-- ==========================================
-- 🗄️ [06] SQL: GROUP BY & HAVING
-- ==========================================

CREATE TABLE team (
    name VARCHAR(50),
    dept VARCHAR(50),
    salary INT
);

INSERT INTO team VALUES
('Alice', 'Dev', 6000), ('Bob', 'Dev', 8000), ('Charlie', 'Dev', 7000),
('Diana', 'Design', 5000), ('Ethan', 'Design', 5500),
('Fiona', 'Marketing', 4500);

SELECT 
    dept AS 부서명,
    COUNT(*) AS 인원수,
    AVG(salary) AS 평균급여
FROM team
GROUP BY dept
HAVING AVG(salary) >= 5000;
`,
    },
  },
  {
    id: 'sql-07-inner-join',
    title: '07. 내부 조인 (INNER JOIN) 관계 결합',
    category: 'Database & SQL',
    language: 'sql',
    engine: 'sql',
    description: '고객(Customers) 테이블과 주문(Orders) 테이블의 키 조인',
    mainFile: 'queries.sql',
    tags: ['SQL', 'INNER JOIN', 'Relational', 'Foreign Key'],
    files: {
      'queries.sql': `-- ==========================================
-- 🗄️ [07] SQL: INNER JOIN
-- ==========================================

CREATE TABLE customers (
    id INT PRIMARY KEY,
    name VARCHAR(50)
);

CREATE TABLE orders (
    order_id INT,
    customer_id INT,
    item VARCHAR(100),
    price INT
);

INSERT INTO customers VALUES (1, '김철수'), (2, '이영희'), (3, '박민수');
INSERT INTO orders VALUES (101, 1, 'MacBook', 2500000), (102, 1, 'Mouse', 65000), (103, 2, 'Monitor', 450000);

SELECT 
    o.order_id,
    c.name AS 고객명,
    o.item AS 주문상품,
    o.price AS 결제금액
FROM orders o
INNER JOIN customers c ON o.customer_id = c.id;
`,
    },
  },
  {
    id: 'sql-08-left-join',
    title: '08. 외부 조인 (LEFT JOIN) 누락 분석',
    category: 'Database & SQL',
    language: 'sql',
    engine: 'sql',
    description: '주문 이력이 없는 고객을 포함한 전체 고객 현황 분석',
    mainFile: 'queries.sql',
    tags: ['SQL', 'LEFT JOIN', 'Outer Join', 'Null Analysis'],
    files: {
      'queries.sql': `-- ==========================================
-- 🗄️ [08] SQL: LEFT JOIN
-- ==========================================

CREATE TABLE members (
    id INT,
    name VARCHAR(50)
);

CREATE TABLE purchases (
    id INT,
    member_id INT,
    amount INT
);

INSERT INTO members VALUES (1, '회원A'), (2, '회원B'), (3, '회원C');
INSERT INTO purchases VALUES (101, 1, 50000), (102, 1, 30000);

SELECT 
    m.name AS 회원명,
    COUNT(p.id) AS 구매건수,
    SUM(p.amount) AS 총구매액
FROM members m
LEFT JOIN purchases p ON m.id = p.member_id
GROUP BY m.id, m.name;
`,
    },
  },
  {
    id: 'sql-09-subquery',
    title: '09. 서브쿼리 (Subquery & IN)',
    category: 'Database & SQL',
    language: 'sql',
    engine: 'sql',
    description: '평균 급여보다 높은 급여를 받는 직원 추출 서브쿼리',
    mainFile: 'queries.sql',
    tags: ['SQL', 'Subquery', 'Nested Query', 'IN'],
    files: {
      'queries.sql': `-- ==========================================
-- 🗄️ [09] SQL: 서브쿼리 (Subquery)
-- ==========================================

CREATE TABLE staff (
    id INT,
    name VARCHAR(50),
    salary INT
);

INSERT INTO staff VALUES
(1, '김민수', 4000), (2, '이지은', 7500), (3, '박지훈', 5000), (4, '최유진', 9000), (5, '정태양', 6000);

-- 전체 평균 급여보다 많이 받는 우수 직원 조회
SELECT name, salary
FROM staff
WHERE salary > (SELECT AVG(salary) FROM staff);
`,
    },
  },
  {
    id: 'sql-10-case-analytics',
    title: '10. CASE 조건문 & 실무 매출 통계',
    category: 'Database & SQL',
    language: 'sql',
    engine: 'sql',
    description: 'CASE WHEN을 이용한 고객 등급 자동 분류 및 매출 통계',
    mainFile: 'queries.sql',
    tags: ['SQL', 'CASE WHEN', 'Analytics', 'Business Intelligence'],
    files: {
      'queries.sql': `-- ==========================================
-- 🗄️ [10] SQL: CASE WHEN 실무 분석 쿼리
-- ==========================================

CREATE TABLE clients (
    name VARCHAR(50),
    total_spent INT
);

INSERT INTO clients VALUES
('고객1', 2500000), ('고객2', 800000), ('고객3', 150000), ('고객4', 4500000), ('고객5', 45000);

SELECT 
    name,
    total_spent AS 누적구매액,
    CASE 
        WHEN total_spent >= 2000000 THEN 'VIP'
        WHEN total_spent >= 500000  THEN 'GOLD'
        ELSE 'SILVER'
    END AS 고객등급
FROM clients
ORDER BY total_spent DESC;
`,
    },
  },
];
