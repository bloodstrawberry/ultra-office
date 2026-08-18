import type { SqlProblem } from './types';

export const SAMPLE_PROBLEMS: SqlProblem[] = [
  // -------------------------------------------------------------------------
  // Level 1: 기초 (SELECT, WHERE, ORDER BY, LIMIT)
  // -------------------------------------------------------------------------
  {
    id: 'prob-1-1',
    datasetId: 'ecommerce',
    level: 1,
    category: '기초 조회',
    title: '모든 VIP 고객 조회하기',
    description:
      '`customers` 테이블에서 등급(`grade`)이 **VIP**인 모든 고객의 `customer_id`, `name`, `email`, `city`를 조회하세요. 결과는 `customer_id` 기준 오름차순으로 정렬하세요.',
    initialQuery: `SELECT customer_id, name, email, city\nFROM customers\n-- 여기에 조건을 작성하세요 (예: WHERE grade = 'VIP')\nORDER BY customer_id ASC;`,
    solutionQuery: `SELECT customer_id, name, email, city FROM customers WHERE grade = 'VIP' ORDER BY customer_id ASC`,
    hint: "WHERE 절에서 `grade = 'VIP'` 조건을 부여하고, ORDER BY 절로 `customer_id`를 정렬하세요.",
    explanation:
      '특정 조건을 만족하는 행을 필터링하기 위해 WHERE 절을 사용하며, 정렬을 위해 ORDER BY를 사용합니다.',
  },
  {
    id: 'prob-1-2',
    datasetId: 'ecommerce',
    level: 1,
    category: '기초 연산자',
    title: '가격이 5만원 이상 15만원 이하인 상품 조회',
    description:
      '`products` 테이블에서 가격(`price`)이 50,000원 이상 150,000원 이하인 상품의 `product_name`, `price`, `stock_quantity`를 조회하세요. 결과는 가격(`price`)이 높은 순(내림차순)으로 정렬하세요.',
    initialQuery: `SELECT product_name, price, stock_quantity\nFROM products\n-- 여기에 가격 범위 조건을 작성하세요 (예: WHERE price BETWEEN 50000 AND 150000)\nORDER BY price DESC;`,
    solutionQuery: `SELECT product_name, price, stock_quantity FROM products WHERE price BETWEEN 50000 AND 150000 ORDER BY price DESC`,
    hint: '`BETWEEN A AND B` 연산자 또는 `>= 50000 AND <= 150000` 조건을 활용하세요.',
    explanation: 'BETWEEN 연산자는 시작값과 끝값을 모두 포함하여 범위를 검색할 때 유용합니다.',
  },
  {
    id: 'prob-1-3',
    datasetId: 'hr',
    level: 1,
    category: '정렬과 제한',
    title: '급여가 가장 높은 상위 3명의 사원',
    description:
      '`employees` 테이블에서 급여(`salary`)가 가장 높은 상위 3명의 `name`, `job_title`, `salary`를 조회하세요.',
    initialQuery: `SELECT name, job_title, salary\nFROM employees\n-- 여기에 정렬 및 상위 개수 제한을 작성하세요 (예: ORDER BY salary DESC LIMIT 3);\n`,
    solutionQuery: `SELECT name, job_title, salary FROM employees ORDER BY salary DESC LIMIT 3`,
    hint: '급여(`salary`)를 내림차순(`DESC`)으로 정렬한 뒤 `LIMIT 3`을 지정하세요.',
    explanation: 'ORDER BY DESC와 LIMIT를 함께 사용하여 최상위 N개 데이터를 추출할 수 있습니다.',
  },
  {
    id: 'prob-1-4',
    datasetId: 'university',
    level: 1,
    category: '패턴 검색',
    title: '컴퓨터공학과 학생 목록 조회',
    description:
      '`students` 테이블에서 전공(`major`)이 **컴퓨터공학과**인 학생의 `student_id`, `name`, `year`, `gpa`를 평점(`gpa`) 높은 순으로 조회하세요.',
    initialQuery: `SELECT student_id, name, year, gpa\nFROM students\n-- 여기에 전공 조건 및 정렬을 작성하세요 (예: WHERE major = '컴퓨터공학과' ORDER BY gpa DESC);\n`,
    solutionQuery: `SELECT student_id, name, year, gpa FROM students WHERE major = '컴퓨터공학과' ORDER BY gpa DESC`,
    hint: "WHERE `major = '컴퓨터공학과'` 조건과 ORDER BY `gpa DESC`를 사용하세요.",
    explanation: '특정 전공 학생을 필터링하고 학점(GPA) 순으로 정렬합니다.',
  },

  // -------------------------------------------------------------------------
  // Level 2: 중급 (GROUP BY, HAVING, 집계 함수, DISTINCT)
  // -------------------------------------------------------------------------
  {
    id: 'prob-2-1',
    datasetId: 'ecommerce',
    level: 2,
    category: '집계 함수',
    title: '도시별 고객 수와 VIP 수 집계',
    description:
      '`customers` 테이블에서 거주 도시(`city`)별로 총 고객 수(`total_customers`)를 구하세요. 고객 수가 많은 도시부터 내림차순 정렬하고, 고객 수가 같으면 도시명 가나다순(오름차순)으로 정렬하세요.',
    initialQuery: `SELECT city, COUNT(*) AS total_customers\nFROM customers\n-- 여기에 GROUP BY 및 ORDER BY 절을 작성하세요\n`,
    solutionQuery: `SELECT city, COUNT(*) AS total_customers FROM customers GROUP BY city ORDER BY total_customers DESC, city ASC`,
    hint: '`GROUP BY city`로 그룹화하고 `COUNT(*)`로 총 고객 수를 구한 뒤 별칭 `total_customers`를 부여하세요.',
    explanation: 'GROUP BY 절과 COUNT 집계 함수를 통해 그룹별 빈도를 계산합니다.',
  },
  {
    id: 'prob-2-2',
    datasetId: 'hr',
    level: 2,
    category: 'GROUP BY & HAVING',
    title: '평균 급여가 500만원 이상인 부서 조회',
    description:
      '`employees` 테이블에서 부서 번호(`dept_id`)별 평균 급여(`avg_salary`)와 사원 수(`emp_count`)를 구하세요. 단, 평균 급여가 500만원 이상인 부서만 출력하고, 평균 급여 내림차순으로 정렬하세요. (평균 급여는 반올림 없이 계산)',
    initialQuery: `SELECT dept_id, AVG(salary) AS avg_salary, COUNT(*) AS emp_count\nFROM employees\nGROUP BY dept_id\n-- 여기에 HAVING 조건과 정렬을 작성하세요\n`,
    solutionQuery: `SELECT dept_id, AVG(salary) AS avg_salary, COUNT(*) AS emp_count FROM employees GROUP BY dept_id HAVING AVG(salary) >= 500 ORDER BY avg_salary DESC`,
    hint: '그룹화 후 집계 결과에 조건을 줄 때는 `HAVING AVG(salary) >= 500` 절을 사용합니다.',
    explanation: 'HAVING 절은 GROUP BY로 그룹화된 결과 집합에 대한 필터링 조건을 적용합니다.',
  },
  {
    id: 'prob-2-3',
    datasetId: 'ecommerce',
    level: 2,
    category: '카테고리별 재고 분석',
    title: '카테고리별 상품 수와 총 재고량',
    description:
      '`products` 테이블에서 `category_id`별로 등록된 상품 수(`product_count`), 총 재고 수량 합계(`total_stock`), 최고 가격(`max_price`)을 조회하세요. `category_id` 오름차순으로 정렬하세요.',
    initialQuery: `SELECT category_id, COUNT(*) AS product_count, SUM(stock_quantity) AS total_stock, MAX(price) AS max_price\nFROM products\nGROUP BY category_id\nORDER BY category_id ASC;`,
    solutionQuery: `SELECT category_id, COUNT(*) AS product_count, SUM(stock_quantity) AS total_stock, MAX(price) AS max_price FROM products GROUP BY category_id ORDER BY category_id ASC`,
    hint: '`COUNT(*)`, `SUM(stock_quantity)`, `MAX(price)` 집계 함수를 사용하고 `GROUP BY category_id`를 작성하세요.',
    explanation:
      '여러 집계 함수(COUNT, SUM, MAX)를 동시에 활용하여 다각도로 그룹 통계를 추출합니다.',
  },
  {
    id: 'prob-2-4',
    datasetId: 'university',
    level: 2,
    category: '과목별 성적 통계',
    title: '과목별 수강생 수와 평균 점수',
    description:
      '`enrollments` 테이블에서 과목 코드(`course_id`)별 수강생 수(`student_count`)와 평균 취득 점수(`avg_score`)를 구하세요. 단, 수강생이 2명 이상인 과목만 조회하고 평균 점수가 높은 순으로 정렬하세요.',
    initialQuery: `SELECT course_id, COUNT(*) AS student_count, AVG(score) AS avg_score\nFROM enrollments\n-- 여기에 GROUP BY, HAVING, ORDER BY를 작성하세요\n`,
    solutionQuery: `SELECT course_id, COUNT(*) AS student_count, AVG(score) AS avg_score FROM enrollments GROUP BY course_id HAVING COUNT(*) >= 2 ORDER BY avg_score DESC`,
    hint: '`HAVING COUNT(*) >= 2`를 사용하여 수강생 조건을 만족하는 과목만 선별하세요.',
    explanation: 'HAVING 조건으로 수강 인원 기준 필터링을 수행합니다.',
  },

  // -------------------------------------------------------------------------
  // Level 3: 고급 (INNER/LEFT JOIN, 서브쿼리)
  // -------------------------------------------------------------------------
  {
    id: 'prob-3-1',
    datasetId: 'ecommerce',
    level: 3,
    category: 'INNER JOIN',
    title: '주문한 고객명과 주문 정보 결합 조회',
    description:
      '`orders` 테이블과 `customers` 테이블을 조인하여 주문 ID(`order_id`), 고객 이름(`customer_name`), 고객 이메일(`email`), 주문 금액(`total_amount`), 주문 상태(`status`)를 조회하세요. 결과는 `order_id` 오름차순으로 정렬하세요.',
    initialQuery: `SELECT o.order_id, c.name AS customer_name, c.email, o.total_amount, o.status\nFROM orders o\n-- 여기에 JOIN customers ON 조인 조건을 작성하세요\nORDER BY o.order_id ASC;`,
    solutionQuery: `SELECT o.order_id, c.name AS customer_name, c.email, o.total_amount, o.status FROM orders o JOIN customers c ON o.customer_id = c.customer_id ORDER BY o.order_id ASC`,
    hint: '`orders o JOIN customers c ON o.customer_id = c.customer_id` 조인 조건을 작성하세요.',
    explanation: '두 테이블 간의 외래키-기본키 관계를 바탕으로 INNER JOIN을 수행합니다.',
  },
  {
    id: 'prob-3-2',
    datasetId: 'ecommerce',
    level: 3,
    category: '다중 테이블 JOIN & 집계',
    title: '상품 카테고리별 총 판매 금액 집계',
    description:
      '`categories`, `products`, `order_items` 세 테이블을 조인하여 각 카테고리명(`category_name`)별 총 판매 금액 합계(`total_sales`)를 구하세요. 판매 금액(`quantity * unit_price`)의 합계를 계산하고, 총 판매 금액이 높은 순으로 정렬하세요.',
    initialQuery: `SELECT c.category_name, SUM(oi.quantity * oi.unit_price) AS total_sales\nFROM categories c\n-- 여기에 products 및 order_items 테이블 조인 및 GROUP BY를 작성하세요\n`,
    solutionQuery: `SELECT c.category_name, SUM(oi.quantity * oi.unit_price) AS total_sales FROM categories c JOIN products p ON c.category_id = p.category_id JOIN order_items oi ON p.product_id = oi.product_id GROUP BY c.category_name ORDER BY total_sales DESC`,
    hint: '카테고리 -> 상품 -> 주문상품 순으로 조인한 후 `SUM(oi.quantity * oi.unit_price)`로 합산합니다.',
    explanation: '다중 테이블 조인과 수량 x 단가 계산식을 집계 함수 SUM에 적용하는 방법입니다.',
  },
  {
    id: 'prob-3-3',
    datasetId: 'hr',
    level: 3,
    category: 'LEFT JOIN & NULL 처리',
    title: '부서별 사원 현황 (사원이 없는 부서 포함)',
    description:
      '`departments` 테이블을 기준으로 `employees` 테이블을 `LEFT JOIN`하여, 모든 부서의 `dept_id`, 부서명(`dept_name`), 소속 사원 수(`emp_count`)를 조회하세요. 사원이 없는 부서의 경우 사원 수가 0으로 나와야 합니다. 부서 번호(`dept_id`) 오름차순으로 정렬하세요.',
    initialQuery: `SELECT d.dept_id, d.dept_name, COUNT(e.emp_id) AS emp_count\nFROM departments d\n-- 여기에 LEFT JOIN 및 GROUP BY 조건을 작성하세요\nORDER BY d.dept_id ASC;`,
    solutionQuery: `SELECT d.dept_id, d.dept_name, COUNT(e.emp_id) AS emp_count FROM departments d LEFT JOIN employees e ON d.dept_id = e.dept_id GROUP BY d.dept_id, d.dept_name ORDER BY d.dept_id ASC`,
    hint: '사원이 없는 부서도 누락되지 않도록 `LEFT JOIN`을 사용하고, `COUNT(*)` 대신 `COUNT(e.emp_id)`를 사용해야 0으로 집계됩니다.',
    explanation:
      'LEFT JOIN 시 우측 테이블의 특정 컬럼을 COUNT하면 NULL을 제외하므로 0이 정확히 계산됩니다.',
  },
  {
    id: 'prob-3-4',
    datasetId: 'university',
    level: 3,
    category: '서브쿼리 (WHERE절)',
    title: '전체 학생 평균 평점보다 높은 학생 조회',
    description:
      '`students` 테이블에서 전체 학생의 평균 `gpa`보다 높은 평점을 가진 학생들의 `student_id`, `name`, `major`, `gpa`를 조회하세요. 결과는 `gpa` 내림차순, 학번 오름차순으로 정렬하세요.',
    initialQuery: `SELECT student_id, name, major, gpa\nFROM students\n-- 여기에 서브쿼리 조건을 작성하세요 (예: WHERE gpa > (SELECT AVG(gpa) FROM students))\nORDER BY gpa DESC, student_id ASC;`,
    solutionQuery: `SELECT student_id, name, major, gpa FROM students WHERE gpa > (SELECT AVG(gpa) FROM students) ORDER BY gpa DESC, student_id ASC`,
    hint: 'WHERE 절에서 단일 행 서브쿼리 `(SELECT AVG(gpa) FROM students)`를 조건으로 사용하세요.',
    explanation: '스칼라 서브쿼리를 WHERE 절의 비교 조건으로 활용하여 동적 기준치를 판별합니다.',
  },

  // -------------------------------------------------------------------------
  // Level 4: 심화 & 실전 분석 (CASE WHEN, 복합 JOIN, 윈도우/랭킹)
  // -------------------------------------------------------------------------
  {
    id: 'prob-4-1',
    datasetId: 'hr',
    level: 4,
    category: 'CASE WHEN 조건문',
    title: '급여 구간별 사원 등급 분류',
    description:
      "`employees` 테이블에서 사원의 `emp_id`, `name`, `salary`와 함께 급여에 따른 `salary_level`을 분류하여 출력하세요.\n- 600만원 이상: 'HIGH'\n- 400만원 이상 600만원 미만: 'MID'\n- 400만원 미만: 'LOW'\n결과는 급여(`salary`) 내림차순으로 정렬하세요.",
    initialQuery: `SELECT emp_id, name, salary,\n  CASE\n    -- 여기에 급여 구간별 WHEN THEN 조건을 작성하세요\n    ELSE 'LOW'\n  END AS salary_level\nFROM employees\nORDER BY salary DESC;`,
    solutionQuery: `SELECT emp_id, name, salary, CASE WHEN salary >= 600 THEN 'HIGH' WHEN salary >= 400 THEN 'MID' ELSE 'LOW' END AS salary_level FROM employees ORDER BY salary DESC`,
    hint: '`CASE WHEN ... THEN ... ELSE ... END AS salary_level` 구문을 작성하세요.',
    explanation:
      'CASE WHEN 표현식을 사용하면 조건에 따라 동적으로 새로운 파생 컬럼 값을 생성할 수 있습니다.',
  },
  {
    id: 'prob-4-2',
    datasetId: 'hr',
    level: 4,
    category: '셀프 조인 (Self Join)',
    title: '사원명과 직속 상사(매니저) 이름 조회',
    description:
      '`employees` 테이블을 셀프 조인하여 매니저가 존재하는 사원의 `emp_id`, 사원 이름(`employee_name`), 직속 상사의 이름(`manager_name`), 사원의 급여(`salary`)를 조회하세요. 결과는 사원 번호(`emp_id`) 오름차순으로 정렬하세요.',
    initialQuery: `SELECT e.emp_id, e.name AS employee_name, m.name AS manager_name, e.salary\nFROM employees e\n-- 여기에 셀프 조인 조건을 작성하세요 (예: JOIN employees m ON e.manager_id = m.emp_id)\nORDER BY e.emp_id ASC;`,
    solutionQuery: `SELECT e.emp_id, e.name AS employee_name, m.name AS manager_name, e.salary FROM employees e JOIN employees m ON e.manager_id = m.emp_id ORDER BY e.emp_id ASC`,
    hint: '사원 테이블 `e`와 매니저 테이블 `m`으로 동일 테이블을 별칭을 다르게 하여 `e.manager_id = m.emp_id`로 조인합니다.',
    explanation:
      '조직도나 상하관계 구조를 조회할 때 동일한 테이블을 셀프 조인(Self Join)하여 해결합니다.',
  },
  {
    id: 'prob-4-3',
    datasetId: 'ecommerce',
    level: 4,
    category: '복합 비즈니스 분석',
    title: '구매 이력이 있는 VIP 고객의 총 구매액 순위',
    description:
      '`customers`와 `orders` 테이블을 결합하여 등급이 **VIP**이고 주문 상태가 **배송완료**인 고객별 총 구매 금액(`total_spent`)과 주문 건수(`order_count`)를 구하세요. 고객의 `customer_id`, `name`, `total_spent`, `order_count`를 조회하고, 총 구매 금액이 높은 순으로 정렬하세요.',
    initialQuery: `SELECT c.customer_id, c.name, SUM(o.total_amount) AS total_spent, COUNT(o.order_id) AS order_count\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\n-- 여기에 WHERE 조건 및 GROUP BY를 작성하세요\nORDER BY total_spent DESC;`,
    solutionQuery: `SELECT c.customer_id, c.name, SUM(o.total_amount) AS total_spent, COUNT(o.order_id) AS order_count FROM customers c JOIN orders o ON c.customer_id = o.customer_id WHERE c.grade = 'VIP' AND o.status = '배송완료' GROUP BY c.customer_id, c.name ORDER BY total_spent DESC`,
    hint: "WHERE 절에서 `c.grade = 'VIP' AND o.status = '배송완료'` 조건을 부여하고 `GROUP BY c.customer_id, c.name`으로 묶어줍니다.",
    explanation: '특정 고객 세그먼트의 완료된 거래 실적을 집계하는 전형적인 실무 분석 쿼리입니다.',
  },
  {
    id: 'prob-4-4',
    datasetId: 'university',
    level: 4,
    category: '종합 연계 쿼리',
    title: '교수별 담당 강좌 수와 수강생 총원',
    description:
      '`professors`, `courses`, `enrollments` 세 테이블을 조인하여 교수 번호(`prof_id`), 교수 이름(`prof_name`), 담당 과목 수(`course_count`), 총 수강생 수(`total_students`)를 구하세요. 총 수강생 수가 많은 순으로 정렬하세요. (모든 강좌에 최소 1명 이상의 수강생이 있음)',
    initialQuery: `SELECT p.prof_id, p.prof_name, COUNT(DISTINCT c.course_id) AS course_count, COUNT(e.enroll_id) AS total_students\nFROM professors p\n-- 여기에 courses, enrollments 조인 및 GROUP BY를 작성하세요\nORDER BY total_students DESC;`,
    solutionQuery: `SELECT p.prof_id, p.prof_name, COUNT(DISTINCT c.course_id) AS course_count, COUNT(e.enroll_id) AS total_students FROM professors p JOIN courses c ON p.prof_id = c.prof_id JOIN enrollments e ON c.course_id = e.course_id GROUP BY p.prof_id, p.prof_name ORDER BY total_students DESC`,
    hint: '담당 과목 수는 `COUNT(DISTINCT c.course_id)`로 중복을 방지하고, 수강생 총원은 `COUNT(e.enroll_id)`로 계산합니다.',
    explanation:
      '다중 테이블 조인 시 1:N:M 관계로 인한 행 증폭을 해결하기 위해 DISTINCT 카운트를 적절히 조합합니다.',
  },
];
