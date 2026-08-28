import type { CodeTemplate } from '../../types';

// ----------------------------------------------------------------------

export const SQL_TEMPLATES: CodeTemplate[] = [
  // --- [Part 1: SQL 기본 문법 및 조인 10선] ---
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
    description: 'INSERT INTO 다중 행 일괄 삽입 및 데이터 확인',
    mainFile: 'queries.sql',
    tags: ['SQL', 'DML', 'INSERT'],
    files: {
      'queries.sql': `-- ==========================================
-- 🗄️ [02] SQL: 다중 데이터 삽입
-- ==========================================

CREATE TABLE products (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    price INT,
    stock INT
);

INSERT INTO products VALUES 
(1, '노트북 Pro 16', 2400000, 15),
(2, '무선 기계식 키보드', 159000, 42),
(3, '4K 모니터 32인치', 580000, 8),
(4, '인체공학 마우스', 89000, 30);

SELECT * FROM products;
`,
    },
  },
  {
    id: 'sql-03-where-filtering',
    title: '03. 조건절 필터링 (WHERE, LIKE, IN)',
    category: 'Database & SQL',
    language: 'sql',
    engine: 'sql',
    description: 'WHERE 조건 연산자, BETWEEN, IN, LIKE 와일드카드 패턴 검색',
    mainFile: 'queries.sql',
    tags: ['SQL', 'WHERE', 'LIKE', 'Filtering'],
    files: {
      'queries.sql': `-- ==========================================
-- 🗄️ [03] SQL: WHERE 조건 필터링
-- ==========================================

CREATE TABLE users (
    id INT PRIMARY KEY,
    email VARCHAR(100),
    city VARCHAR(50),
    age INT
);

INSERT INTO users VALUES
(1, 'alice@google.com', 'Seoul', 28),
(2, 'bob@kakao.com', 'Busan', 34),
(3, 'charlie@google.com', 'Seoul', 22),
(4, 'david@naver.com', 'Incheon', 41),
(5, 'eve@google.com', 'Seoul', 31);

-- 서울 거주 & google.com 이메일 사용자 조회
SELECT * FROM users
WHERE city = 'Seoul' AND email LIKE '%@google.com' AND age >= 25;
`,
    },
  },
  {
    id: 'sql-04-order-limit',
    title: '04. 정렬 및 페이징 (ORDER BY, LIMIT, OFFSET)',
    category: 'Database & SQL',
    language: 'sql',
    engine: 'sql',
    description: '다중 컬럼 정렬(ASC/DESC) 및 LIMIT/OFFSET 페이징',
    mainFile: 'queries.sql',
    tags: ['SQL', 'ORDER BY', 'LIMIT', 'Pagination'],
    files: {
      'queries.sql': `-- ==========================================
-- 🗄️ [04] SQL: 정렬과 페이징
-- ==========================================

CREATE TABLE scores (
    student VARCHAR(50),
    subject VARCHAR(50),
    score INT
);

INSERT INTO scores VALUES
('철수', '수학', 95), ('영희', '수학', 98), ('민수', '수학', 82),
('지훈', '수학', 91), ('수진', '수학', 88), ('유진', '수학', 100);

-- 수학 점수 상위 3명 조회 (내림차순)
SELECT * FROM scores
ORDER BY score DESC
LIMIT 3;
`,
    },
  },
  {
    id: 'sql-05-aggregate-functions',
    title: '05. 집계 함수 (COUNT, SUM, AVG, MIN, MAX)',
    category: 'Database & SQL',
    language: 'sql',
    engine: 'sql',
    description: '전체 데이터 통계 요약 및 집계 함수 산출',
    mainFile: 'queries.sql',
    tags: ['SQL', 'Aggregate', 'SUM', 'AVG', 'COUNT'],
    files: {
      'queries.sql': `-- ==========================================
-- 🗄️ [05] SQL: 집계 함수
-- ==========================================

CREATE TABLE sales (
    id INT PRIMARY KEY,
    item VARCHAR(50),
    amount INT,
    qty INT
);

INSERT INTO sales VALUES
(1, '아메리카노', 4500, 120),
(2, '카페라떼', 5000, 85),
(3, '바닐라라떼', 5500, 60),
(4, '크루아상', 3800, 45);

SELECT 
    COUNT(*) AS total_items,
    SUM(amount * qty) AS total_revenue,
    AVG(amount) AS avg_item_price,
    MAX(amount) AS max_price,
    MIN(amount) AS min_price
FROM sales;
`,
    },
  },
  {
    id: 'sql-06-group-by-having',
    title: '06. 그룹화 및 조건 (GROUP BY & HAVING)',
    category: 'Database & SQL',
    language: 'sql',
    engine: 'sql',
    description: 'GROUP BY 카테고리 집계 및 HAVING 조건절',
    mainFile: 'queries.sql',
    tags: ['SQL', 'GROUP BY', 'HAVING'],
    files: {
      'queries.sql': `-- ==========================================
-- 🗄️ [06] SQL: GROUP BY & HAVING
-- ==========================================

CREATE TABLE employees (
    id INT,
    department VARCHAR(50),
    salary INT
);

INSERT INTO employees VALUES
(1, '개발팀', 7000), (2, '개발팀', 6500), (3, '개발팀', 8000),
(4, '디자인팀', 5000), (5, '디자인팀', 5500),
(6, '마케팅팀', 4500), (7, '마케팅팀', 4800), (8, '마케팅팀', 5200);

-- 부서별 평균 연봉이 5500 이상인 부서만 조회
SELECT 
    department,
    COUNT(*) AS employee_count,
    AVG(salary) AS avg_salary,
    SUM(salary) AS total_salary
FROM employees
GROUP BY department
HAVING AVG(salary) >= 5500
ORDER BY avg_salary DESC;
`,
    },
  },
  {
    id: 'sql-07-inner-join',
    title: '07. 내부 조인 (INNER JOIN 1:N 관계)',
    category: 'Database & SQL',
    language: 'sql',
    engine: 'sql',
    description: '주문 테이블과 고객 테이블 INNER JOIN 관계형 조회',
    mainFile: 'queries.sql',
    tags: ['SQL', 'JOIN', 'INNER JOIN', 'Relational'],
    files: {
      'queries.sql': `-- ==========================================
-- 🗄️ [07] SQL: INNER JOIN
-- ==========================================

CREATE TABLE customers (
    cust_id INT PRIMARY KEY,
    cust_name VARCHAR(50),
    city VARCHAR(50)
);

CREATE TABLE orders (
    order_id INT PRIMARY KEY,
    cust_id INT,
    order_date DATE,
    total_amount INT
);

INSERT INTO customers VALUES (1, '홍길동', '서울'), (2, '이순신', '부산'), (3, '강감찬', '인천');
INSERT INTO orders VALUES (101, 1, '2026-08-01', 150000), (102, 1, '2026-08-05', 80000), (103, 2, '2026-08-10', 320000);

SELECT 
    o.order_id,
    c.cust_name,
    c.city,
    o.order_date,
    o.total_amount
FROM orders o
INNER JOIN customers c ON o.cust_id = c.cust_id;
`,
    },
  },
  {
    id: 'sql-08-left-join-null',
    title: '08. 외부 조인 (LEFT JOIN & IS NULL 탐색)',
    category: 'Database & SQL',
    language: 'sql',
    engine: 'sql',
    description: 'LEFT OUTER JOIN을 활용한 주문 없는 고객(미구매 고객) 추출',
    mainFile: 'queries.sql',
    tags: ['SQL', 'LEFT JOIN', 'IS NULL', 'Outer Join'],
    files: {
      'queries.sql': `-- ==========================================
-- 🗄️ [08] SQL: LEFT JOIN & IS NULL
-- ==========================================

CREATE TABLE members (
    id INT PRIMARY KEY,
    name VARCHAR(50)
);

CREATE TABLE event_logs (
    log_id INT PRIMARY KEY,
    member_id INT,
    action VARCHAR(50)
);

INSERT INTO members VALUES (1, '김회원'), (2, '이회원'), (3, '박회원'), (4, '최회원');
INSERT INTO event_logs VALUES (101, 1, 'LOGIN'), (102, 1, 'PURCHASE'), (103, 3, 'LOGIN');

-- 이벤트 참여 이력이 없는 미활동 회원 탐색
SELECT 
    m.id,
    m.name,
    e.action
FROM members m
LEFT JOIN event_logs e ON m.id = e.member_id
WHERE e.action IS NULL;
`,
    },
  },
  {
    id: 'sql-09-subquery-scalar',
    title: '09. 서브쿼리 (Subquery & IN/EXISTS)',
    category: 'Database & SQL',
    language: 'sql',
    engine: 'sql',
    description: '중첩 서브쿼리를 이용한 평균 초과 급여 수령자 추출',
    mainFile: 'queries.sql',
    tags: ['SQL', 'Subquery', 'Nested Query'],
    files: {
      'queries.sql': `-- ==========================================
-- 🗄️ [09] SQL: 서브쿼리 (Subquery)
-- ==========================================

CREATE TABLE developers (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    salary INT
);

INSERT INTO developers VALUES
(1, 'Dev_A', 6000), (2, 'Dev_B', 7200), (3, 'Dev_C', 5400),
(4, 'Dev_D', 8100), (5, 'Dev_E', 6300);

-- 전체 개발자 평균 급여보다 높은 개발자 목록
SELECT 
    name, 
    salary,
    (SELECT AVG(salary) FROM developers) AS company_avg
FROM developers
WHERE salary > (SELECT AVG(salary) FROM developers)
ORDER BY salary DESC;
`,
    },
  },
  {
    id: 'sql-10-case-when',
    title: '10. 조건부 분기 (CASE WHEN & 파생 컬럼)',
    category: 'Database & SQL',
    language: 'sql',
    engine: 'sql',
    description: 'CASE WHEN 구문을 이용한 고객 등급(VIP, GOLD, SILVER) 산정',
    mainFile: 'queries.sql',
    tags: ['SQL', 'CASE WHEN', 'Conditional'],
    files: {
      'queries.sql': `-- ==========================================
-- 🗄️ [10] SQL: CASE WHEN 조건문
-- ==========================================

CREATE TABLE customer_purchases (
    name VARCHAR(50),
    total_spent INT
);

INSERT INTO customer_purchases VALUES
('홍길동', 1500000),
('김영희', 450000),
('박철수', 850000),
('이민호', 2200000),
('최유진', 120000);

SELECT 
    name,
    total_spent,
    CASE 
        WHEN total_spent >= 2000000 THEN '👑 DIAMOND'
        WHEN total_spent >= 1000000 THEN '💎 VIP'
        WHEN total_spent >= 500000  THEN '🥇 GOLD'
        ELSE '🥈 SILVER'
    END AS member_grade
FROM customer_purchases
ORDER BY total_spent DESC;
`,
    },
  },

  // --- [Part 2: 고급 분석 및 알고리즘 쿼리 10선] ---
  {
    id: 'sql-11-cte-recursive',
    title: '11. [고급 SQL] CTE 재귀 쿼리 (Hierarchical CTE)',
    category: 'Database & SQL',
    language: 'sql',
    engine: 'sql',
    description: 'WITH RECURSIVE를 이용한 계층형 조직도 및 부모-자식 트리 순회',
    mainFile: 'queries.sql',
    tags: ['SQL', 'CTE', 'WITH RECURSIVE', 'Hierarchy'],
    files: {
      'queries.sql': `-- ==========================================
-- 🧠 [11] SQL: 계층형 재귀 CTE 조직도 탐색
-- ==========================================

CREATE TABLE org_chart (
    emp_id INT PRIMARY KEY,
    name VARCHAR(50),
    manager_id INT
);

INSERT INTO org_chart VALUES
(1, '대표이사', NULL),
(2, 'CTO', 1),
(3, 'CFO', 1),
(4, '백엔드팀장', 2),
(5, '프론트팀장', 2),
(6, '시니어개발자', 4),
(7, '주니어개발자', 4);

WITH RECURSIVE Hierarchy AS (
    SELECT emp_id, name, manager_id, 1 AS level, CAST(name AS VARCHAR(255)) AS path
    FROM org_chart
    WHERE manager_id IS NULL
    UNION ALL
    SELECT o.emp_id, o.name, o.manager_id, h.level + 1, CAST(h.path || ' ➔ ' || o.name AS VARCHAR(255))
    FROM org_chart o
    INNER JOIN Hierarchy h ON o.manager_id = h.emp_id
)
SELECT level, name, path FROM Hierarchy ORDER BY path;
`,
    },
  },
  {
    id: 'sql-12-window-rank',
    title: '12. [고급 SQL] ROW_NUMBER, RANK & DENSE_RANK',
    category: 'Database & SQL',
    language: 'sql',
    engine: 'sql',
    description: '부서별 급여 순위 산출 및 동석차 처리 윈도우 함수',
    mainFile: 'queries.sql',
    tags: ['SQL', 'Window Functions', 'RANK', 'ROW_NUMBER'],
    files: {
      'queries.sql': `-- ==========================================
-- 🧠 [12] SQL: 부서별 순위 분석 (윈도우 함수)
-- ==========================================

CREATE TABLE dept_salaries (
    dept VARCHAR(30),
    name VARCHAR(30),
    salary INT
);

INSERT INTO dept_salaries VALUES
('개발', 'A', 8000), ('개발', 'B', 7500), ('개발', 'C', 7500), ('개발', 'D', 6000),
('영업', 'E', 9000), ('영업', 'F', 7000), ('영업', 'G', 7000);

SELECT 
    dept,
    name,
    salary,
    ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) AS row_num,
    RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rank_num,
    DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS dense_rank_num
FROM dept_salaries;
`,
    },
  },
  {
    id: 'sql-13-running-total',
    title: '13. [고급 SQL] 누적 합계 (Running Total & SUM OVER)',
    category: 'Database & SQL',
    language: 'sql',
    engine: 'sql',
    description: 'SUM() OVER (ORDER BY date) 일자별 누적 매출액 산출',
    mainFile: 'queries.sql',
    tags: ['SQL', 'Running Total', 'SUM OVER', 'Analytics'],
    files: {
      'queries.sql': `-- ==========================================
-- 🧠 [13] SQL: 일자별 누적 매출액 분석
-- ==========================================

CREATE TABLE daily_revenue (
    sale_date DATE,
    daily_amount INT
);

INSERT INTO daily_revenue VALUES
('2026-08-01', 1200000),
('2026-08-02', 1850000),
('2026-08-03', 950000),
('2026-08-04', 2100000),
('2026-08-05', 1600000);

SELECT 
    sale_date,
    daily_amount,
    SUM(daily_amount) OVER (ORDER BY sale_date) AS running_total,
    AVG(daily_amount) OVER (ORDER BY sale_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS moving_avg_3days
FROM daily_revenue;
`,
    },
  },
  {
    id: 'sql-14-lag-lead-mom',
    title: '14. [고급 SQL] 시계열 증감률 (LAG & LEAD MoM)',
    category: 'Database & SQL',
    language: 'sql',
    engine: 'sql',
    description: '이전 달 매출(LAG) 대비 성장률(Growth Rate %) 산출',
    mainFile: 'queries.sql',
    tags: ['SQL', 'LAG', 'LEAD', 'Time Series'],
    files: {
      'queries.sql': `-- ==========================================
-- 🧠 [14] SQL: 전월 대비 성장률 (LAG 분석)
-- ==========================================

CREATE TABLE monthly_sales (
    month VARCHAR(10),
    sales INT
);

INSERT INTO monthly_sales VALUES
('2026-01', 5000), ('2026-02', 5800), ('2026-03', 5400),
('2026-04', 7000), ('2026-05', 8200), ('2026-06', 9500);

SELECT 
    month,
    sales,
    LAG(sales, 1) OVER (ORDER BY month) AS prev_month_sales,
    sales - LAG(sales, 1) OVER (ORDER BY month) AS diff,
    ROUND((CAST(sales - LAG(sales, 1) OVER (ORDER BY month) AS FLOAT) / LAG(sales, 1) OVER (ORDER BY month)) * 100, 2) AS growth_pct
FROM monthly_sales;
`,
    },
  },
  {
    id: 'sql-15-pivot-aggregation',
    title: '15. [고급 SQL] 피벗 테이블 (Conditional Pivot)',
    category: 'Database & SQL',
    language: 'sql',
    engine: 'sql',
    description: 'CASE WHEN 기반 행-열 전치 피벗 테이블 구현',
    mainFile: 'queries.sql',
    tags: ['SQL', 'Pivot', 'Cross Tabulation'],
    files: {
      'queries.sql': `-- ==========================================
-- 🧠 [15] SQL: 분기별 매출 피벗 테이블
-- ==========================================

CREATE TABLE product_sales_q (
    product VARCHAR(50),
    quarter VARCHAR(10),
    amount INT
);

INSERT INTO product_sales_q VALUES
('노트북', 'Q1', 1200), ('노트북', 'Q2', 1500), ('노트북', 'Q3', 1800), ('노트북', 'Q4', 2100),
('모니터', 'Q1', 600), ('모니터', 'Q2', 750), ('모니터', 'Q3', 800), ('모니터', 'Q4', 950);

SELECT 
    product,
    SUM(CASE WHEN quarter = 'Q1' THEN amount ELSE 0 END) AS Q1_Sales,
    SUM(CASE WHEN quarter = 'Q2' THEN amount ELSE 0 END) AS Q2_Sales,
    SUM(CASE WHEN quarter = 'Q3' THEN amount ELSE 0 END) AS Q3_Sales,
    SUM(CASE WHEN quarter = 'Q4' THEN amount ELSE 0 END) AS Q4_Sales,
    SUM(amount) AS Total_Year
FROM product_sales_q
GROUP BY product;
`,
    },
  },
  {
    id: 'sql-16-self-join-pairs',
    title: '16. [고급 SQL] 셀프 조인 (Self Join & 페어링)',
    category: 'Database & SQL',
    language: 'sql',
    engine: 'sql',
    description: '동일 테이블 내 중복 없는 2인 매칭 페어 생성',
    mainFile: 'queries.sql',
    tags: ['SQL', 'Self Join', 'Pairing'],
    files: {
      'queries.sql': `-- ==========================================
-- 🧠 [16] SQL: 셀프 조인을 활용한 1:1 페어링
-- ==========================================

CREATE TABLE players (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    rating INT
);

INSERT INTO players VALUES
(1, '알파', 1500), (2, '베타', 1520), (3, '감마', 1600), (4, '델타', 1480);

-- 레이팅 차이가 50 이하인 대전 매칭 쌍 생성 (중복 제거 a.id < b.id)
SELECT 
    a.name AS player_1,
    b.name AS player_2,
    ABS(a.rating - b.rating) AS rating_diff
FROM players a
INNER JOIN players b ON a.id < b.id
WHERE ABS(a.rating - b.rating) <= 50
ORDER BY rating_diff ASC;
`,
    },
  },
  {
    id: 'sql-17-ntile-segmentation',
    title: '17. [고급 SQL] 고객 4분위수 세분화 (NTILE 분석)',
    category: 'Database & SQL',
    language: 'sql',
    engine: 'sql',
    description: 'NTILE(4)를 이용한 구매액 상위 25% VIP 그룹화',
    mainFile: 'queries.sql',
    tags: ['SQL', 'NTILE', 'Segmentation', 'Quartile'],
    files: {
      'queries.sql': `-- ==========================================
-- 🧠 [17] SQL: NTILE(4) 분위수 고객 세분화
-- ==========================================

CREATE TABLE customer_metrics (
    customer_name VARCHAR(50),
    lifetime_spend INT
);

INSERT INTO customer_metrics VALUES
('A', 15000000), ('B', 12000000), ('C', 9500000), ('D', 8000000),
('E', 5500000), ('F', 4200000), ('G', 3100000), ('H', 1500000);

SELECT 
    customer_name,
    lifetime_spend,
    NTILE(4) OVER (ORDER BY lifetime_spend DESC) AS quartile_group,
    CASE NTILE(4) OVER (ORDER BY lifetime_spend DESC)
        WHEN 1 THEN '상위 25% (VVIP)'
        WHEN 2 THEN '상위 50% (VIP)'
        WHEN 3 THEN '일반 활성 고객'
        ELSE '잠재 성장 고객'
    END AS group_label
FROM customer_metrics;
`,
    },
  },
  {
    id: 'sql-18-anti-join-not-exists',
    title: '18. [고급 SQL] 안티 조인 (Anti-Join & NOT EXISTS)',
    category: 'Database & SQL',
    language: 'sql',
    engine: 'sql',
    description: 'NOT EXISTS 상관 서브쿼리를 이용한 비이탈 고객 필터링',
    mainFile: 'queries.sql',
    tags: ['SQL', 'Anti Join', 'NOT EXISTS'],
    files: {
      'queries.sql': `-- ==========================================
-- 🧠 [18] SQL: NOT EXISTS 안티 조인
-- ==========================================

CREATE TABLE all_users (
    user_id INT PRIMARY KEY,
    name VARCHAR(50)
);

CREATE TABLE churn_records (
    user_id INT,
    churn_date DATE
);

INSERT INTO all_users VALUES (1, 'Alice'), (2, 'Bob'), (3, 'Charlie'), (4, 'David');
INSERT INTO churn_records VALUES (2, '2026-08-01'), (4, '2026-08-15');

-- 이탈 이력이 없는 현재 활동 회원만 조회
SELECT u.user_id, u.name
FROM all_users u
WHERE NOT EXISTS (
    SELECT 1 FROM churn_records c WHERE c.user_id = u.user_id
);
`,
    },
  },
  {
    id: 'sql-19-funnel-conversion',
    title: '19. [고급 SQL] 퍼널 전환율 분석 (Funnel Analysis)',
    category: 'Database & SQL',
    language: 'sql',
    engine: 'sql',
    description: '방문 ➔ 장바구니 ➔ 결제 단계별 이탈률 & 전환율 산출',
    mainFile: 'queries.sql',
    tags: ['SQL', 'Funnel', 'Conversion Rate', 'Product Analytics'],
    files: {
      'queries.sql': `-- ==========================================
-- 🧠 [19] SQL: 이커머스 퍼널 전환율 분석
-- ==========================================

CREATE TABLE funnel_events (
    user_id INT,
    step VARCHAR(50)
);

INSERT INTO funnel_events VALUES
(1, '1_VIEW'), (1, '2_CART'), (1, '3_PURCHASE'),
(2, '1_VIEW'), (2, '2_CART'),
(3, '1_VIEW'), (3, '2_CART'), (3, '3_PURCHASE'),
(4, '1_VIEW'),
(5, '1_VIEW'), (5, '2_CART');

WITH FunnelSteps AS (
    SELECT 
        COUNT(DISTINCT CASE WHEN step = '1_VIEW' THEN user_id END) AS step1_views,
        COUNT(DISTINCT CASE WHEN step = '2_CART' THEN user_id END) AS step2_carts,
        COUNT(DISTINCT CASE WHEN step = '3_PURCHASE' THEN user_id END) AS step3_purchases
    FROM funnel_events
)
SELECT 
    step1_views,
    step2_carts,
    step3_purchases,
    ROUND((CAST(step2_carts AS FLOAT) / step1_views) * 100, 1) AS cart_conversion_pct,
    ROUND((CAST(step3_purchases AS FLOAT) / step2_carts) * 100, 1) AS purchase_conversion_pct,
    ROUND((CAST(step3_purchases AS FLOAT) / step1_views) * 100, 1) AS total_funnel_pct
FROM FunnelSteps;
`,
    },
  },
  {
    id: 'sql-20-gaps-and-islands',
    title: '20. [고급 SQL] 연속 접속일 분석 (Gaps and Islands)',
    category: 'Database & SQL',
    language: 'sql',
    engine: 'sql',
    description: '고전 Gaps & Islands 기법을 통한 최장 연속 출석일 산출',
    mainFile: 'queries.sql',
    tags: ['SQL', 'Gaps and Islands', 'Continuous Attendance'],
    files: {
      'queries.sql': `-- ==========================================
-- 🧠 [20] SQL: 연속 출석/접속일 분석 (Gaps & Islands)
-- ==========================================

CREATE TABLE login_history (
    user_name VARCHAR(50),
    login_day INT
);

INSERT INTO login_history VALUES
('철수', 1), ('철수', 2), ('철수', 3), ('철수', 5), ('철수', 6),
('영희', 1), ('영희', 3), ('영희', 4), ('영희', 5), ('영희', 6);

WITH GroupedLogins AS (
    SELECT 
        user_name,
        login_day,
        login_day - ROW_NUMBER() OVER (PARTITION BY user_name ORDER BY login_day) AS island_id
    FROM login_history
)
SELECT 
    user_name,
    MIN(login_day) AS streak_start,
    MAX(login_day) AS streak_end,
    COUNT(*) AS continuous_streak_days
FROM GroupedLogins
GROUP BY user_name, island_id
ORDER BY continuous_streak_days DESC;
`,
    },
  },
  {
    id: 'sql-21-json-querying',
    title: '21. [라이브러리] SQL JSON 데이터 추출 & 프로젝션',
    category: 'Database & SQL',
    language: 'sql',
    engine: 'sql',
    description: 'JSON 객체 필드 접근, 중첩 속성 파싱 및 동적 페이로드 집계',
    mainFile: 'queries.sql',
    tags: ['SQL', 'JSON', 'Payload', 'NoSQL in SQL'],
    files: {
      'queries.sql': `-- ==========================================
-- 🗄️ [21] SQL: JSON 데이터 쿼리 및 분석
-- ==========================================

CREATE TABLE api_event_payloads (
    event_id INT PRIMARY KEY,
    service_name VARCHAR(50),
    payload JSON
);

INSERT INTO api_event_payloads VALUES
(1, 'payment-gateway', {"user": "alice", "amount": 45000, "status": "APPROVED", "meta": {"ip": "1.1.1.1", "device": "mobile"}}),
(2, 'auth-service',    {"user": "bob", "status": "FAILED", "reason": "WRONG_PASSWORD"}),
(3, 'payment-gateway', {"user": "charlie", "amount": 128000, "status": "APPROVED", "meta": {"ip": "2.2.2.2", "device": "desktop"}}),
(4, 'payment-gateway', {"user": "david", "amount": 15000, "status": "REJECTED", "meta": {"ip": "3.3.3.3", "device": "mobile"}});

-- 결제 승인 건만 필터링하고 JSON 필드 추출
SELECT 
    event_id,
    service_name,
    payload->user AS customer_name,
    payload->amount AS pay_amount,
    payload->status AS pay_status,
    payload->meta->device AS client_device
FROM api_event_payloads
WHERE service_name = 'payment-gateway' AND payload->status = 'APPROVED'
ORDER BY pay_amount DESC;
`,
    },
  },
  {
    id: 'sql-22-regexp-functions',
    title: '22. [라이브러리] REGEXP 정규식 패턴 분석 (LIKE, SUBSTR, REPLACE)',
    category: 'Database & SQL',
    language: 'sql',
    engine: 'sql',
    description: 'REGEXP_LIKE, REGEXP_SUBSTR, REGEXP_REPLACE를 활용한 텍스트 데이터 정제',
    mainFile: 'queries.sql',
    tags: ['SQL', 'REGEXP_LIKE', 'REGEXP_SUBSTR', 'REGEXP_REPLACE', 'Regex'],
    files: {
      'queries.sql': `-- ==========================================
-- 🗄️ [22] SQL: 정규표현식 내장 함수
-- ==========================================

CREATE TABLE contact_directory (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    raw_contact VARCHAR(100)
);

INSERT INTO contact_directory VALUES
(1, '김철수', '010-1234-5678 (chulsoo@google.com)'),
(2, '이영희', 'Tel: 02-9876-5432, Email: younghee@daum.net'),
(3, '박민수', '연락처: 010-5555-8888 minsu@naver.com');

-- 1. REGEXP_SUBSTR로 이메일 추출
-- 2. REGEXP_REPLACE로 전화번호 마스킹
SELECT 
    name,
    REGEXP_SUBSTR(raw_contact, '[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+') AS extracted_email,
    REGEXP_SUBSTR(raw_contact, '(010|02)-\\d{3,4}-\\d{4}') AS phone_number,
    REGEXP_REPLACE(raw_contact, '(\\d{2,3})-(\\d{3,4})-(\\d{4})', '$1-****-$3') AS masked_raw_text
FROM contact_directory
WHERE REGEXP_LIKE(raw_contact, '@') = 1;
`,
    },
  },
  {
    id: 'sql-23-date-accounting-math',
    title: '23. [라이브러리] 고급 날짜/회계 연산 (ADD_MONTHS & LAST_DAY)',
    category: 'Database & SQL',
    language: 'sql',
    engine: 'sql',
    description: 'ADD_MONTHS, LAST_DAY, MONTHS_BETWEEN, TO_CHAR를 활용한 금융 만기일 계산',
    mainFile: 'queries.sql',
    tags: ['SQL', 'ADD_MONTHS', 'LAST_DAY', 'MONTHS_BETWEEN', 'Financial Date'],
    files: {
      'queries.sql': `-- ==========================================
-- 🗄️ [23] SQL: 고급 날짜 및 금융 회계 계산
-- ==========================================

CREATE TABLE loan_contracts (
    contract_id INT PRIMARY KEY,
    client_name VARCHAR(50),
    start_date DATE,
    duration_months INT,
    principal_amount INT
);

INSERT INTO loan_contracts VALUES
(101, '홍길동', '2026-01-15', 12, 50000000),
(102, '김영희', '2026-03-31', 6,  20000000),
(103, '박지훈', '2026-05-10', 24, 80000000);

SELECT 
    contract_id,
    client_name,
    start_date,
    duration_months,
    ADD_MONTHS(start_date, duration_months) AS maturity_date,
    LAST_DAY(ADD_MONTHS(start_date, duration_months)) AS month_end_settlement_date,
    TO_CHAR(principal_amount, 'L999,999,999') AS formatted_principal
FROM loan_contracts;
`,
    },
  },
  {
    id: 'sql-24-custom-js-udf-functions',
    title: '24. [라이브러리] SQL 내부 JavaScript 사용자 정의 함수 (Custom UDF)',
    category: 'Database & SQL',
    language: 'sql',
    engine: 'sql',
    description: 'CREATE FUNCTION 구문으로 SQL 내에서 임의의 JavaScript 로직 및 비즈니스 연산 실행',
    mainFile: 'queries.sql',
    tags: ['SQL', 'Custom UDF', 'JavaScript in SQL', 'Functions'],
    files: {
      'queries.sql': `-- ==========================================
-- 🗄️ [24] SQL: JavaScript 사용자 정의 함수 (UDF)
-- ==========================================

-- 1. 자바스크립트 커스텀 복리 이자 계산 함수 정의
CREATE FUNCTION compound_interest AS function(principal, rate, years) {
    return Math.round(principal * Math.pow(1 + rate / 100, years));
};

-- 2. 등급 판정 자바스크립트 함수 정의
CREATE FUNCTION score_grade AS function(score) {
    if (score >= 90) return 'A+ (최우수)';
    if (score >= 80) return 'B+ (우수)';
    if (score >= 70) return 'C+ (보통)';
    return 'D (재시험)';
};

CREATE TABLE students (
    id INT,
    name VARCHAR(50),
    exam_score INT,
    tuition_deposit INT
);

INSERT INTO students VALUES
(1, '김철수', 95, 1000000),
(2, '이영희', 84, 1500000),
(3, '박지훈', 68, 800000),
(4, '최유진', 91, 2000000);

-- SQL SELECT 절에서 커스텀 JS 함수 직접 호출
SELECT 
    name,
    exam_score,
    score_grade(exam_score) AS evaluation,
    tuition_deposit AS original_deposit,
    compound_interest(tuition_deposit, 5, 3) AS deposit_after_3yrs
FROM students;
`,
    },
  },
  {
    id: 'sql-25-window-time-series-lead-lag',
    title: '25. [라이브러리] 시계열 윈도우 함수 (LEAD & LAG 전후 비교)',
    category: 'Database & SQL',
    language: 'sql',
    engine: 'sql',
    description: 'LEAD, LAG, FIRST_VALUE 윈도우 함수를 활용한 일별 매출 증감률(MoM/DoD) 분석',
    mainFile: 'queries.sql',
    tags: ['SQL', 'LEAD', 'LAG', 'Window Functions', 'Time-Series'],
    files: {
      'queries.sql': `-- ==========================================
-- 🗄️ [25] SQL: LEAD & LAG 시계열 윈도우 분석
-- ==========================================

CREATE TABLE daily_metrics (
    metric_date DATE,
    dau_count INT
);

INSERT INTO daily_metrics VALUES
('2026-08-20', 12000),
('2026-08-21', 13500),
('2026-08-22', 15200),
('2026-08-23', 14800),
('2026-08-24', 18900),
('2026-08-25', 21000);

SELECT 
    metric_date,
    dau_count,
    LAG(dau_count, 1) OVER (ORDER BY metric_date) AS prev_day_dau,
    dau_count - LAG(dau_count, 1) OVER (ORDER BY metric_date) AS net_growth,
    ROUND(((dau_count - LAG(dau_count, 1) OVER (ORDER BY metric_date)) / LAG(dau_count, 1) OVER (ORDER BY metric_date)) * 100, 2) AS growth_rate_pct,
    FIRST_VALUE(dau_count) OVER (ORDER BY metric_date) AS initial_baseline_dau
FROM daily_metrics;
`,
    },
  },
  {
    id: 'sql-26-pivot-cross-matrix',
    title: '26. [라이브러리] PIVOT 2차원 교차 분석 행렬 (Cross Matrix)',
    category: 'Database & SQL',
    language: 'sql',
    engine: 'sql',
    description: '행 데이터를 열로 변환하는 PIVOT 교차 집계를 통한 분기별 매출 매트릭스',
    mainFile: 'queries.sql',
    tags: ['SQL', 'PIVOT', 'Matrix', 'Aggregation'],
    files: {
      'queries.sql': `-- ==========================================
-- 🗄️ [26] SQL: PIVOT 2차원 매트릭스 집계
-- ==========================================

CREATE TABLE quarterly_sales (
    region VARCHAR(50),
    quarter VARCHAR(10),
    revenue INT
);

INSERT INTO quarterly_sales VALUES
('서울', 'Q1', 4500), ('서울', 'Q2', 5200), ('서울', 'Q3', 6100), ('서울', 'Q4', 7800),
('부산', 'Q1', 2800), ('부산', 'Q2', 3100), ('부산', 'Q3', 3400), ('부산', 'Q4', 4200),
('대구', 'Q1', 1900), ('대구', 'Q2', 2200), ('대구', 'Q3', 2500), ('대구', 'Q4', 3100);

-- 조건부 집계를 통한 피벗 매트릭스 생성
SELECT 
    region,
    SUM(CASE WHEN quarter = 'Q1' THEN revenue ELSE 0 END) AS Q1_Rev,
    SUM(CASE WHEN quarter = 'Q2' THEN revenue ELSE 0 END) AS Q2_Rev,
    SUM(CASE WHEN quarter = 'Q3' THEN revenue ELSE 0 END) AS Q3_Rev,
    SUM(CASE WHEN quarter = 'Q4' THEN revenue ELSE 0 END) AS Q4_Rev,
    SUM(revenue) AS Total_Annual_Rev
FROM quarterly_sales
GROUP BY region
ORDER BY Total_Annual_Rev DESC;
`,
    },
  },
];
