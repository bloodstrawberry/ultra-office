import type { Problem, SqlPracticeLab } from './types';

// Oracle and SQL Server examples that AlaSQL cannot execute verbatim use a
// runnable equivalent with the same rows and a note in the example description.
const LABS: Record<string, SqlPracticeLab> = {
  '60-5': {
    tables: [
      {
        name: '주문',
        columns: ['고객ID', '주문번호', '수량'],
        rows: [
          { 고객ID: 1, 주문번호: 101, 수량: 6 },
          { 고객ID: 1, 주문번호: 101, 수량: 5 },
          { 고객ID: 1, 주문번호: 102, 수량: 3 },
          { 고객ID: 2, 주문번호: 201, 수량: 10 },
        ],
      },
    ],
    examples: [
      {
        id: 'orders-at-least-ten',
        title: '주문별 수량 합계',
        sql: 'SELECT 고객ID, 주문번호, SUM(수량) AS 주문수량 FROM 주문 GROUP BY 고객ID, 주문번호 HAVING SUM(수량) >= 10;',
      },
    ],
  },
  '60-13': {
    tables: [],
    examples: [
      {
        id: 'pivot-salaries',
        title: 'PIVOT 결과 재현',
        description: '실습 엔진용 조건부 집계로 직급을 열로 펼칩니다.',
        sql: "SELECT 부서, SUM(CASE WHEN 직급 = '사원' THEN 연봉 ELSE 0 END) AS 사원, SUM(CASE WHEN 직급 = '대리' THEN 연봉 ELSE 0 END) AS 대리, SUM(CASE WHEN 직급 = '팀장' THEN 연봉 ELSE 0 END) AS 팀장, SUM(CASE WHEN 직급 = '부장' THEN 연봉 ELSE 0 END) AS 부장 FROM 급여 GROUP BY 부서;",
      },
    ],
  },
  '60-14': {
    tables: [],
    examples: [
      {
        id: 'first-value-equivalent',
        title: 'FIRST_VALUE 결과 재현',
        description: '실습 엔진용 상관 서브쿼리로 현재 행까지의 최솟값을 확인합니다.',
        sql: 'SELECT t1.SAL, (SELECT MIN(t2.SAL) FROM T t2 WHERE t2.SAL <= t1.SAL) AS MIN_SAL FROM T t1 ORDER BY t1.SAL;',
      },
    ],
  },
  '60-15': {
    tables: [],
    examples: [
      {
        id: 'tuple-in-equivalent',
        title: '튜플 IN 조건 재현',
        description: '두 열이 모두 일치하는 행만 반환합니다.',
        sql: 'SELECT * FROM T WHERE 사번 = 10005 AND 회원번호 = 2003;',
      },
      ...[
        '사번 = 10005 OR 회원번호 = 2003',
        '사번 = 10005 AND 회원번호 = 2003',
        '사번 = 10005 OR 회원번호 <> 2003',
        'NOT (사번 = 10005 AND 회원번호 = 2003)',
      ].map((condition, index) => ({
        id: `choice-${index + 1}`,
        choiceNum: index + 1,
        title: `${index + 1}) 조건 결과`,
        sql: `SELECT * FROM T WHERE ${condition};`,
      })),
    ],
  },
  '60-16': {
    tables: [],
    examples: [
      {
        id: 'ntile-three-equivalent',
        title: 'NTILE(3) 결과 재현',
        description: '8행을 앞 그룹부터 3·3·2행으로 나눕니다.',
        sql: 'SELECT EMPNO, CASE WHEN EMPNO <= 3 THEN 1 WHEN EMPNO <= 6 THEN 2 ELSE 3 END AS GRP FROM EMP ORDER BY EMPNO;',
      },
    ],
  },
  '60-21': {
    tables: [],
    examples: [
      {
        id: 'choice-1',
        choiceNum: 1,
        title: '1) ROWNUM IN (1, 2) 재현',
        description: 'Oracle의 첫 두 행 선택을 TOP 2로 재현합니다.',
        sql: 'SELECT TOP 2 * FROM T;',
      },
      ...[2, 3, 4].map((choiceNum) => ({
        id: `choice-${choiceNum}`,
        choiceNum,
        title: `${choiceNum}) ROWNUM 조건 재현`,
        description: 'Oracle에서 첫 행이 통과하지 못해 결과가 없습니다.',
        sql: 'SELECT * FROM T WHERE 1 = 0;',
      })),
    ],
  },
  '60-23': {
    tables: [],
    examples: [
      {
        id: 'choice-1',
        choiceNum: 1,
        title: '1) Oracle (+) 조인 재현',
        description: '오라클 (+) 표기를 ANSI LEFT JOIN으로 바꿔 실행합니다.',
        sql: "SELECT * FROM A LEFT JOIN B ON A.ID = B.ID AND B.FLG = 'Y';",
      },
      {
        id: 'choice-2',
        choiceNum: 2,
        title: '2) WHERE에서 FLG 필터',
        sql: "SELECT * FROM A LEFT JOIN B ON A.ID = B.ID WHERE B.FLG = 'Y';",
      },
      {
        id: 'choice-3',
        choiceNum: 3,
        title: '3) ON에서 FLG 필터',
        sql: "SELECT * FROM A LEFT JOIN B ON A.ID = B.ID AND B.FLG = 'Y';",
      },
      {
        id: 'choice-4',
        choiceNum: 4,
        title: '4) B를 먼저 필터',
        sql: "SELECT * FROM A LEFT JOIN (SELECT * FROM B WHERE FLG = 'Y') B ON A.ID = B.ID;",
      },
    ],
  },
  '60-24': {
    tables: [],
    examples: [
      {
        id: 'choice-1',
        choiceNum: 1,
        title: '1) 1월만 집계',
        sql: "SELECT 지역, SUM(CASE WHEN 월 = '1월' THEN 매출 END) AS [1월] FROM 매출 GROUP BY 지역;",
      },
      {
        id: 'choice-2',
        choiceNum: 2,
        title: '2) 세로 형태 비교',
        description: 'UNPIVOT은 가로 열을 세로 행으로 바꾸므로 기대 결과와 방향이 다릅니다.',
        sql: 'SELECT 지역, 월, 매출 FROM 매출;',
      },
      {
        id: 'choice-3',
        choiceNum: 3,
        title: '3) PIVOT 결과 재현',
        description: '실습 엔진용 조건부 집계로 네 달을 열로 펼칩니다.',
        sql: "SELECT 지역, SUM(CASE WHEN 월 = '1월' THEN 매출 ELSE 0 END) AS [1월], SUM(CASE WHEN 월 = '2월' THEN 매출 ELSE 0 END) AS [2월], SUM(CASE WHEN 월 = '3월' THEN 매출 ELSE 0 END) AS [3월], SUM(CASE WHEN 월 = '4월' THEN 매출 ELSE 0 END) AS [4월] FROM 매출 GROUP BY 지역;",
      },
      {
        id: 'choice-4',
        choiceNum: 4,
        title: '4) 평균 집계 비교',
        description: '평균은 기대 결과의 월별 매출 합계와 다릅니다.',
        sql: 'SELECT 지역, AVG(매출) AS 평균매출 FROM 매출 GROUP BY 지역;',
      },
    ],
  },
  '60-25': {
    tables: [],
    examples: [
      {
        id: 'scalar-subquery-duplicates',
        title: '서브쿼리 중복 행 확인',
        description: 'A=A인 행이 2건이므로 단일 행 비교를 보장하려면 A에 UNIQUE가 필요합니다.',
        sql: "SELECT A, COUNT(*) AS matching_rows FROM T2 WHERE A = 'A' GROUP BY A;",
      },
    ],
  },
  '60-26': {
    tables: [
      {
        name: 'EMP',
        columns: ['SAL'],
        rows: [{ SAL: 1000 }, { SAL: 2000 }, { SAL: 3000 }],
      },
    ],
    examples: [
      {
        id: 'running-sum-equivalent',
        title: '누적합 재현',
        description: 'ROWS UNBOUNDED PRECEDING과 같은 누적 범위를 확인합니다.',
        sql: 'SELECT e1.SAL, (SELECT SUM(e2.SAL) FROM EMP e2 WHERE e2.SAL <= e1.SAL) AS 누적합계 FROM EMP e1 ORDER BY e1.SAL;',
      },
    ],
  },
  '60-28': {
    tables: [
      {
        name: 'T',
        ddl: 'CREATE TABLE T (ID INT PRIMARY KEY, NAME STRING)',
        columns: ['ID', 'NAME'],
        rows: [
          { ID: 1, NAME: 'A' },
          { ID: 2, NAME: 'B' },
        ],
      },
    ],
    examples: [
      ...[
        "INSERT INTO T VALUES (3, 'C');",
        "INSERT INTO T VALUES (1, 'D');",
        'INSERT INTO T VALUES (4, NULL);',
        "INSERT INTO T (ID, NAME) VALUES (5, 'E');",
      ].map((sql, index) => ({
        id: `choice-${index + 1}`,
        choiceNum: index + 1,
        title: `${index + 1}) INSERT 실행`,
        sql,
        description: index === 1 ? '기존 기본키 ID=1과 중복되어 오류가 발생합니다.' : undefined,
      })),
    ],
  },
  '60-29': {
    tables: [],
    examples: [
      {
        id: 'employee-tree',
        title: '계층 트리 재현',
        description: 'PRIOR 사원 = 매니저 관계를 재귀 CTE로 실행합니다.',
        sql: 'WITH RECURSIVE tree AS (SELECT 사원, 매니저, 1 AS LEVEL_NO FROM EMP WHERE 매니저 IS NULL UNION ALL SELECT e.사원, e.매니저, t.LEVEL_NO + 1 FROM EMP e JOIN tree t ON e.매니저 = t.사원) SELECT * FROM tree;',
      },
    ],
  },
  '60-30': {
    tables: [],
    examples: [
      {
        id: 'department-tree',
        title: '가지 단절 재현',
        description: 'COL3=2인 D2와 그 하위 노드가 제외되는 계층을 재귀 CTE로 확인합니다.',
        sql: "WITH RECURSIVE tree AS (SELECT 부서ID, 상위부서ID, COL3 FROM 부서 WHERE 부서ID = 'D' UNION ALL SELECT d.부서ID, d.상위부서ID, d.COL3 FROM 부서 d JOIN tree t ON d.상위부서ID = t.부서ID WHERE d.COL3 <> 2) SELECT * FROM tree;",
      },
    ],
  },
  '60-35': {
    tables: [],
    examples: [
      {
        id: 'union-four-columns',
        title: 'UNION 결과 4열 확인',
        description: 'EXTRACT(YEAR ...)를 실습 엔진의 SUBSTR로 재현합니다.',
        sql: 'SELECT EMPNO, ENAME, SUBSTR(HIREDATE, 1, 4) AS YR, SAL FROM EMP UNION SELECT EMPNO, ENAME, SUBSTR(HIREDATE, 1, 4) AS YR, SAL FROM EMP_HIST;',
      },
    ],
  },
  '60-39': {
    tables: [],
    examples: [
      {
        id: 'merge-insert-equivalent',
        title: 'MERGE 미매칭 INSERT 재현',
        description: '실습 엔진용 INSERT로 ID=2의 새 행을 만든 뒤 TGT를 조회합니다.',
        sql: 'INSERT INTO TGT VALUES (2, 100, 100, 100); SELECT * FROM TGT ORDER BY ID;',
      },
    ],
  },
  '60-40': {
    tables: [
      {
        name: 'PRODUCT',
        columns: ['PRODUCT_CD'],
        rows: [{ PRODUCT_CD: 'A01' }, { PRODUCT_CD: 'B02' }],
      },
    ],
    examples: [
      {
        id: 'correct-where-column',
        title: 'WHERE 절 수정 후 실행',
        description: 'WHERE에서는 SELECT 별칭 제품코드 대신 원래 열 PRODUCT_CD를 사용합니다.',
        sql: "SELECT PRODUCT_CD AS 제품코드 FROM PRODUCT WHERE PRODUCT_CD = 'A01' AND PRODUCT_CD LIKE 'A%' ORDER BY 제품코드;",
      },
    ],
  },
  '60-43': {
    tables: [
      {
        name: 'T',
        ddl: 'CREATE TABLE T (ID INT IDENTITY, VAL INT CHECK (VAL > 0))',
        columns: ['ID', 'VAL'],
        rows: [],
      },
    ],
    examples: [
      { id: 'count', title: '현재 행 수 조회', sql: 'SELECT COUNT(*) AS row_count FROM T;' },
      {
        id: 'invalid-negative',
        title: '음수 INSERT 오류 확인',
        sql: 'INSERT INTO T(VAL) VALUES (-1);',
      },
      { id: 'invalid-zero', title: '0 INSERT 오류 확인', sql: 'INSERT INTO T(VAL) VALUES (0);' },
      { id: 'valid-positive', title: '양수 INSERT 성공', sql: 'INSERT INTO T(VAL) VALUES (1);' },
    ],
  },
  '60-46': {
    tables: [],
    examples: [
      {
        id: 'dense-rank-equivalent',
        title: '부서별 DENSE_RANK 재현',
        description: '같은 급여는 같은 순위이며 다음 순위를 건너뛰지 않습니다.',
        sql: 'SELECT e.부서, e.사원, e.급여, (SELECT COUNT(DISTINCT e2.급여) FROM EMP e2 WHERE e2.부서 = e.부서 AND e2.급여 > e.급여) + 1 AS RNK FROM EMP e ORDER BY e.부서, e.급여 DESC;',
      },
    ],
  },
  '60-49': {
    tables: [
      {
        name: 'MEMBER',
        ddl: "CREATE TABLE MEMBER (ID STRING PRIMARY KEY, SEX STRING CHECK (SEX IN ('M', 'F')))",
        columns: ['ID', 'SEX'],
        rows: [],
      },
    ],
    examples: [
      { id: 'valid-sex', title: '허용 값 입력', sql: "INSERT INTO MEMBER VALUES ('A', 'M');" },
      { id: 'invalid-sex', title: 'CHECK 오류 확인', sql: "INSERT INTO MEMBER VALUES ('B', 'X');" },
    ],
  },
  '61-13': {
    tables: [],
    examples: [
      {
        id: 'old-outer-join-equivalent',
        title: 'Oracle (+) 조인 재현',
        description:
          '(+)를 LEFT JOIN으로 바꿉니다. WHERE의 D.LOCATION 조건 때문에 ALLEN만 남습니다.',
        sql: "SELECT E.EMP_NAME FROM EMP E LEFT JOIN DEPT D ON E.DEPT_ID = D.DEPT_ID WHERE D.LOCATION <> 'DALLAS';",
      },
    ],
  },
  '61-20': {
    tables: [
      {
        name: '주문',
        columns: ['주문일자', '상품코드'],
        rows: [
          { 주문일자: '2026-01-01', 상품코드: 'A' },
          { 주문일자: '2026-01-01', 상품코드: 'A' },
          { 주문일자: '2026-01-02', 상품코드: 'B' },
        ],
      },
    ],
    examples: [
      {
        id: 'rollup-pair-equivalent',
        title: 'ROLLUP((두 열)) 재현',
        description: '실습 엔진용 UNION ALL로 상세 그룹과 전체 합계만 만듭니다.',
        sql: 'SELECT 주문일자, 상품코드, COUNT(*) AS 건수 FROM 주문 GROUP BY 주문일자, 상품코드 UNION ALL SELECT NULL AS 주문일자, NULL AS 상품코드, COUNT(*) AS 건수 FROM 주문;',
      },
      {
        id: 'choice-1',
        choiceNum: 1,
        title: '1) 상품코드 소계',
        sql: 'SELECT 주문일자, 상품코드, COUNT(*) AS 건수 FROM 주문 GROUP BY 주문일자, 상품코드 UNION ALL SELECT 주문일자, NULL AS 상품코드, COUNT(*) AS 건수 FROM 주문 GROUP BY 주문일자;',
      },
      {
        id: 'choice-2',
        choiceNum: 2,
        title: '2) 두 열 ROLLUP',
        sql: 'SELECT 주문일자, 상품코드, COUNT(*) AS 건수 FROM 주문 GROUP BY 주문일자, 상품코드 UNION ALL SELECT 주문일자, NULL AS 상품코드, COUNT(*) AS 건수 FROM 주문 GROUP BY 주문일자 UNION ALL SELECT NULL AS 주문일자, NULL AS 상품코드, COUNT(*) AS 건수 FROM 주문;',
      },
      {
        id: 'choice-3',
        choiceNum: 3,
        title: '3) 중복 소계 제거',
        description: 'ROLLUP((두 열), NULL)의 중복 그룹을 제거한 결과를 재현합니다.',
        sql: 'SELECT 주문일자, 상품코드, COUNT(*) AS 건수 FROM 주문 GROUP BY 주문일자, 상품코드 UNION ALL SELECT NULL AS 주문일자, NULL AS 상품코드, COUNT(*) AS 건수 FROM 주문;',
      },
      {
        id: 'choice-4',
        choiceNum: 4,
        title: '4) 상세 그룹만',
        sql: 'SELECT 주문일자, 상품코드, COUNT(*) AS 건수 FROM 주문 GROUP BY 주문일자, 상품코드;',
      },
    ],
  },
  '61-22': {
    tables: [],
    examples: [
      {
        id: 'rank-with-ties',
        title: 'RANK 결과 재현',
        description: '앞선 행 수를 세어 동점 1위 다음이 3위가 되는지 확인합니다.',
        sql: 'SELECT t1.NAME, t1.SCORE, (SELECT COUNT(*) FROM TBL t2 WHERE t2.SCORE > t1.SCORE) + 1 AS RNK FROM TBL t1 ORDER BY t1.SCORE DESC;',
      },
    ],
  },
  '61-24': {
    tables: [],
    examples: [
      {
        id: 'pivot-dept-equivalent',
        title: 'PIVOT 결과 재현',
        description: '실습 엔진용 조건부 집계로 A=300, B=300, C=500을 확인합니다.',
        sql: 'SELECT SUM(CASE WHEN DEPT_ID = 10 THEN SAL ELSE 0 END) AS A, SUM(CASE WHEN DEPT_ID = 20 THEN SAL ELSE 0 END) AS B, SUM(CASE WHEN DEPT_ID = 30 THEN SAL ELSE 0 END) AS C FROM EMP;',
      },
    ],
  },
  '61-29': {
    tables: [
      {
        name: 'SALES',
        columns: ['SALE_DATE', 'AMT'],
        rows: [
          { SALE_DATE: '2026-01-01', AMT: 100 },
          { SALE_DATE: '2026-01-02', AMT: 150 },
          { SALE_DATE: '2026-01-03', AMT: 120 },
        ],
      },
    ],
    examples: [
      {
        id: 'running-amount',
        title: '날짜순 누적합 재현',
        description: '실습 엔진용 상관 서브쿼리로 각 날짜까지의 누적합을 계산합니다.',
        sql: 'SELECT a.SALE_DATE, a.AMT, (SELECT SUM(b.AMT) FROM SALES b WHERE b.SALE_DATE <= a.SALE_DATE) AS CUM_AMT FROM SALES a ORDER BY a.SALE_DATE;',
      },
    ],
  },
  '61-30': {
    tables: [],
    examples: [
      {
        id: 'latest-per-board',
        title: '게시판별 최신 글 재현',
        description: '각 유형에서 더 늦은 등록일이 없는 글을 조회합니다.',
        sql: 'SELECT b.BOARD_TYPE, b.TITLE, b.REG_DATE FROM BOARD b WHERE NOT EXISTS (SELECT 1 FROM BOARD later WHERE later.BOARD_TYPE = b.BOARD_TYPE AND later.REG_DATE > b.REG_DATE);',
      },
    ],
  },
  '61-33': {
    tables: [],
    examples: [
      {
        id: 'valid-union',
        title: '유효한 다 SQL 실행',
        description: '양쪽 SELECT가 두 열을 반환하고 ORDER BY가 마지막에 한 번만 있습니다.',
        sql: 'SELECT COL1, COL2 FROM TBL1 UNION SELECT COL1, COL3 FROM TBL2 ORDER BY COL1;',
      },
    ],
  },
  '61-37': {
    tables: [],
    examples: [
      {
        id: 'scalar-row-count',
        title: '스칼라 서브쿼리 행 수 확인',
        description: 'TBL1.A=100일 때 TBL2에 2행이 있어 3번 보기는 Oracle에서 오류가 납니다.',
        sql: 'SELECT A, COUNT(*) AS matching_rows FROM TBL2 GROUP BY A;',
      },
      {
        id: 'choice-3',
        choiceNum: 3,
        title: '3) 두 행 반환 확인',
        description: '실습 엔진은 다중행 스칼라 오류를 재현하지 않아 반환 행 수를 직접 보여줍니다.',
        sql: 'SELECT A, B FROM TBL2 WHERE A = 100;',
      },
    ],
  },
  '61-40': {
    tables: [],
    examples: [
      {
        id: 'merge-update-equivalent',
        title: 'MERGE 매칭 UPDATE 재현',
        description: '두 매칭 행을 갱신한 뒤 EMP의 최종 값을 조회합니다.',
        sql: "UPDATE EMP SET EMP_NAME = 'GIM' WHERE EMP_ID = 10001; UPDATE EMP SET EMP_NAME = 'LEE' WHERE EMP_ID = 10002; SELECT * FROM EMP ORDER BY EMP_ID;",
      },
    ],
  },
  '61-43': {
    tables: [
      {
        name: 'EMP',
        columns: ['EMP_ID', 'SAL'],
        rows: [
          { EMP_ID: 1, SAL: 3000 },
          { EMP_ID: 2, SAL: 1000 },
          { EMP_ID: 3, SAL: 5000 },
          { EMP_ID: 4, SAL: 2000 },
        ],
      },
    ],
    examples: [
      {
        id: 'choice-1',
        choiceNum: 1,
        title: '1) 정렬만 실행',
        sql: 'SELECT EMP_ID FROM EMP ORDER BY SAL DESC;',
      },
      {
        id: 'choice-2',
        choiceNum: 2,
        title: '2) RN 별칭 생성 단계',
        description: '원문의 WHERE RN은 같은 SELECT의 별칭을 참조하므로 유효하지 않습니다.',
        sql: 'SELECT e.EMP_ID, e.SAL, (SELECT COUNT(*) FROM EMP higher WHERE higher.SAL > e.SAL) + 1 AS RN FROM EMP e ORDER BY e.SAL DESC;',
      },
      {
        id: 'choice-3',
        choiceNum: 3,
        title: '3) 정렬 전 ROWNUM 재현',
        sql: 'SELECT EMP_ID FROM (SELECT TOP 2 * FROM EMP) AS first_two ORDER BY SAL DESC;',
      },
      {
        id: 'choice-4',
        choiceNum: 4,
        title: '4) 정렬 후 상위 2명',
        sql: 'SELECT TOP 2 EMP_ID FROM EMP ORDER BY SAL DESC;',
      },
    ],
  },
  '61-44': {
    tables: [
      {
        name: 'TAB',
        ddl: "CREATE TABLE TAB (COL1 INT NOT NULL, COL2 STRING, COL3 STRING DEFAULT 'N', COL4 DATE)",
        columns: ['COL1', 'COL2', 'COL3', 'COL4'],
        rows: [],
      },
    ],
    examples: [
      { id: 'empty-table', title: 'TAB 구조 확인', sql: 'SELECT * FROM TAB;' },
      {
        id: 'choice-1',
        choiceNum: 1,
        title: '1) 값 3개 INSERT 오류',
        description: '열 목록을 생략하면 네 열 모두의 값을 제공해야 합니다.',
        sql: "INSERT INTO TAB VALUES (1, 'A', 'B');",
      },
      {
        id: 'choice-2',
        choiceNum: 2,
        title: '2) 열 3개 지정',
        description: '실습 엔진에서는 SYSDATE()로 날짜 함수를 호출합니다.',
        sql: "INSERT INTO TAB (COL1, COL2, COL4) VALUES (1, 'A', SYSDATE());",
      },
      {
        id: 'choice-3',
        choiceNum: 3,
        title: '3) 기본값 사용',
        sql: "INSERT INTO TAB (COL1, COL2) VALUES (1, 'A');",
      },
      {
        id: 'choice-4',
        choiceNum: 4,
        title: '4) 값 4개 INSERT',
        sql: "INSERT INTO TAB VALUES (1, 'A', 'B', SYSDATE());",
      },
    ],
  },
  '61-47': {
    tables: [],
    examples: [
      {
        id: 'grouping-sets-equivalent',
        title: 'GROUPING SETS 7행 재현',
        description: '상품별 4행, 부서별 2행, 전체 합계 1행을 UNION ALL로 합칩니다.',
        sql: 'SELECT DEPTNO, PRODUCT, SUM(AMT) AS TOTAL_AMT FROM SALES GROUP BY DEPTNO, PRODUCT UNION ALL SELECT DEPTNO, NULL AS PRODUCT, SUM(AMT) AS TOTAL_AMT FROM SALES GROUP BY DEPTNO UNION ALL SELECT NULL AS DEPTNO, NULL AS PRODUCT, SUM(AMT) AS TOTAL_AMT FROM SALES;',
      },
    ],
  },
  '61-48': {
    tables: [
      {
        name: 'DEPT',
        ddl: 'CREATE TABLE DEPT (DEPT_ID INT PRIMARY KEY, DEPT_NAME STRING)',
        columns: ['DEPT_ID', 'DEPT_NAME'],
        rows: [{ DEPT_ID: 10, DEPT_NAME: '개발팀' }],
      },
      {
        name: 'EMP',
        ddl: 'CREATE TABLE EMP (EMP_ID INT PRIMARY KEY, EMP_NAME STRING, DEPT_ID INT, FOREIGN KEY (DEPT_ID) REFERENCES DEPT(DEPT_ID))',
        columns: ['EMP_ID', 'EMP_NAME', 'DEPT_ID'],
        rows: [{ EMP_ID: 1, EMP_NAME: 'KIM', DEPT_ID: 10 }],
      },
    ],
    examples: [
      {
        id: 'choice-1',
        choiceNum: 1,
        title: '1) 존재하는 부서 10',
        sql: "INSERT INTO EMP VALUES (2, 'LEE', 10);",
      },
      {
        id: 'choice-2',
        choiceNum: 2,
        title: '2) 부서 NULL',
        sql: "INSERT INTO EMP VALUES (3, 'PARK', NULL);",
      },
      {
        id: 'choice-3',
        choiceNum: 3,
        title: '3) 없는 부서 20',
        description: '참조할 DEPT_ID=20이 없어 외래키 오류가 발생합니다.',
        sql: "INSERT INTO EMP VALUES (4, 'CHOI', 20);",
      },
      {
        id: 'choice-4',
        choiceNum: 4,
        title: '4) 기존 사원 삭제',
        sql: 'DELETE FROM EMP WHERE EMP_ID = 1;',
      },
    ],
  },
  '61-49': {
    tables: [],
    examples: [
      {
        id: 'lag-equivalent',
        title: 'LAG 차이 재현',
        description: '이전 날짜의 금액을 붙여 차이를 계산합니다.',
        sql: 'WITH ranked AS (SELECT SALE_DATE, AMT, ROW_NUMBER() OVER (ORDER BY SALE_DATE) AS rn FROM SALES) SELECT current_row.SALE_DATE, current_row.AMT, CASE WHEN previous_row.AMT IS NULL THEN NULL ELSE current_row.AMT - previous_row.AMT END AS DIFF FROM ranked current_row LEFT JOIN ranked previous_row ON previous_row.rn = current_row.rn - 1 ORDER BY current_row.rn;',
      },
    ],
  },
  '62-12': {
    tables: [
      {
        name: 'student',
        ddl: 'CREATE TABLE student (id INT PRIMARY KEY, name STRING NOT NULL)',
        columns: ['id', 'name'],
        rows: [
          { id: 1, name: 'KIM' },
          { id: 2, name: 'LEE' },
        ],
      },
      {
        name: 'student_backup',
        ddl: 'CREATE TABLE student_backup (id INT, name STRING)',
        columns: ['id', 'name'],
        rows: [],
      },
    ],
    examples: [
      {
        id: 'ctas-copy-equivalent',
        title: 'CTAS 데이터 복사 재현',
        description: '실습 엔진은 CTAS 문법 대신 제약 없는 백업 테이블에 행을 복사합니다.',
        sql: 'INSERT INTO student_backup SELECT * FROM student;',
      },
      {
        id: 'backup-duplicate',
        title: '백업 테이블 중복키 확인',
        description: '복사 후 실행하면 백업에는 원본 PK 제약이 없음을 확인할 수 있습니다.',
        sql: "INSERT INTO student_backup VALUES (1, 'DUPLICATE');",
      },
      { id: 'backup-rows', title: '백업 결과 조회', sql: 'SELECT * FROM student_backup;' },
    ],
  },
  '62-18': {
    tables: [],
    examples: [
      {
        id: 'character-max',
        title: '문자열 최댓값과 숫자 덧셈',
        description: '문자열로 비교한 최댓값 90을 숫자로 바꿔 최솟값 10과 더합니다.',
        sql: 'SELECT (SELECT MIN(COL_A) FROM TBL) + TO_NUMBER(x.text_val) AS result FROM (SELECT TO_CHAR(COL_B) AS text_val FROM TBL ORDER BY text_val DESC LIMIT 1) AS x;',
      },
    ],
  },
  '62-20': {
    tables: [
      {
        name: 'T',
        ddl: 'CREATE TABLE T ([가] STRING NOT NULL PRIMARY KEY, [나] STRING NOT NULL, [다] STRING UNIQUE, [라] STRING CHECK ([라] IS NOT NULL))',
        columns: ['가', '나', '다', '라'],
        rows: [],
      },
    ],
    examples: [
      { id: 'rows', title: '테이블 상태', sql: 'SELECT * FROM T;' },
      {
        id: 'choice-1',
        choiceNum: 1,
        title: '1) 기본키 NULL',
        sql: "INSERT INTO T VALUES (NULL, 'b', 'c', 'd');",
      },
      {
        id: 'choice-2',
        choiceNum: 2,
        title: '2) NOT NULL 열',
        sql: "INSERT INTO T VALUES ('a', NULL, 'c', 'd');",
      },
      {
        id: 'choice-3',
        choiceNum: 3,
        title: '3) UNIQUE 열 NULL',
        sql: "INSERT INTO T VALUES ('a', 'b', NULL, 'd');",
      },
      {
        id: 'choice-4',
        choiceNum: 4,
        title: '4) CHECK 열 NULL',
        sql: "INSERT INTO T VALUES ('a', 'b', 'c', NULL);",
      },
    ],
  },
  '62-23': {
    tables: [],
    examples: [
      {
        id: 'merge-final-total',
        title: 'MERGE 후 합계 재현',
        description:
          '실습 엔진용 SELECT로 매칭 갱신, 조건 삭제, 미매칭 삽입의 최종 합계를 계산합니다.',
        sql: 'SELECT SUM(merged.total_pay) AS final_total FROM (SELECT t1.num, CASE WHEN t2.num IS NULL THEN t1.total_pay ELSE t1.salary + t2.comm END AS total_pay FROM 테이블1 t1 LEFT JOIN 테이블2 t2 ON t1.num = t2.num WHERE t2.num IS NULL OR t1.salary + t2.comm >= 4000 UNION ALL SELECT t2.num, 3000 AS total_pay FROM 테이블2 t2 LEFT JOIN 테이블1 t1 ON t1.num = t2.num WHERE t1.num IS NULL) AS merged;',
      },
    ],
  },
  '62-24': {
    tables: [
      {
        name: 'T',
        columns: ['C1', 'COL'],
        rows: [
          { C1: 'A', COL: 1 },
          { C1: 'B', COL: 2 },
        ],
      },
    ],
    examples: [
      {
        id: 'empty-group-by',
        title: '빈 그룹 결과 확인',
        description: 'COL=9인 행이 없어 GROUP BY 결과가 0행입니다.',
        sql: "SELECT NVL(MAX('Y'), 'N') AS result FROM T WHERE COL = 9 GROUP BY C1;",
      },
    ],
  },
  '62-35': {
    tables: [],
    examples: [
      {
        id: 'rownum-not-three',
        title: 'ROWNUM <> 3 결과 재현',
        description: '세 번째 행부터 조건을 통과하지 못해 앞의 두 행만 남습니다.',
        sql: 'SELECT TOP 2 * FROM TBL;',
      },
    ],
  },
  '62-42': {
    tables: [],
    examples: [
      {
        id: 'insert-first-counts',
        title: 'INSERT FIRST 분기 재현',
        description: '첫 번째 WHEN이 참이면 뒤의 WHEN은 검사하지 않습니다.',
        sql: 'SELECT SUM(CASE WHEN c1 >= 2 THEN 1 ELSE 0 END) AS t1_rows, SUM(CASE WHEN c1 < 2 AND c1 >= 3 THEN 1 ELSE 0 END) AS t2_rows, SUM(CASE WHEN c1 < 2 THEN 1 ELSE 0 END) AS t3_rows FROM ts;',
      },
    ],
  },
  '62-44': {
    tables: [],
    examples: [
      {
        id: 'root-counts',
        title: '루트별 행 수 재현',
        description: 'CONNECT_BY_ROOT와 CONNECT BY를 재귀 CTE로 재현합니다.',
        sql: 'WITH RECURSIVE tree AS (SELECT EMPNO, MGR, EMPNO AS ROOT_EMPNO FROM EMP WHERE MGR IS NULL UNION ALL SELECT child.EMPNO, child.MGR, parent.ROOT_EMPNO FROM EMP child JOIN tree parent ON child.MGR = parent.EMPNO) SELECT ROOT_EMPNO, COUNT(*) AS CNT FROM tree GROUP BY ROOT_EMPNO ORDER BY ROOT_EMPNO;',
      },
    ],
  },
  '62-45': {
    tables: [],
    examples: [
      {
        id: 'unpivot-equivalent',
        title: 'UNPIVOT 결과 재현',
        description: 'AMOUNT_3, AMOUNT_2, AMOUNT_1을 세로 행으로 펼친 뒤 40 이하만 선택합니다.',
        sql: "SELECT ID, 'AMOUNT_3' AS 구분, AMOUNT_3 AS AMOUNT FROM SALES WHERE AMOUNT_3 <= 40 UNION ALL SELECT ID, 'AMOUNT_2' AS 구분, AMOUNT_2 AS AMOUNT FROM SALES WHERE AMOUNT_2 <= 40 UNION ALL SELECT ID, 'AMOUNT_1' AS 구분, AMOUNT_1 AS AMOUNT FROM SALES WHERE AMOUNT_1 <= 40;",
      },
    ],
  },
  '62-46': {
    tables: [
      {
        name: '로그인기록',
        columns: ['사용자명'],
        rows: [
          ...Array.from({ length: 11 }, () => ({ 사용자명: '이순신' })),
          { 사용자명: '홍길동' },
          { 사용자명: '홍길동' },
        ],
      },
    ],
    examples: [
      {
        id: 'having-login-count',
        title: 'HAVING 결과 확인',
        sql: "SELECT 사용자명, COUNT(*) AS 로그인횟수 FROM 로그인기록 GROUP BY 사용자명 HAVING 사용자명 = '이순신' AND COUNT(*) > 10;",
      },
      {
        id: 'choice-1',
        choiceNum: 1,
        title: '1) 인라인 뷰와 비교',
        sql: "SELECT 사용자명, 로그인횟수 FROM (SELECT 사용자명, COUNT(*) AS 로그인횟수 FROM 로그인기록 GROUP BY 사용자명) AS counts WHERE 사용자명 = '이순신' AND 로그인횟수 > 10;",
      },
    ],
  },
};

export function getSqldLabOverride(problem: Problem): SqlPracticeLab | undefined {
  const round = problem.hashtags.find((tag) => /^#제(?:60|61|62)회$/.test(tag))?.match(/\d+/)?.[0];
  const number = problem.hashtags.find((tag) => /^#\d+번$/.test(tag))?.match(/\d+/)?.[0];
  return round && number ? LABS[`${round}-${number}`] : undefined;
}
