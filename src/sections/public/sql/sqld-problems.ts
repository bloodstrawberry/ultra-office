import type { SqlProblem } from './types';

// ----------------------------------------------------------------------
// SQLD (SQL 개발자) 자격증 예시 문제 목록
// ----------------------------------------------------------------------

export const SQLD_PROBLEMS: SqlProblem[] = [
  // -------------------------------------------------------------------------
  // 카테고리: 산술연산자 > 하위 카테고리: 기본 사칙연산 (+, -, *, /, %)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-arithmetic-1',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 1,
    category: '산술연산자',
    subCategory: '기본 사칙연산 (+, -, *, /)',
    title: '[사칙연산 (+, -, *, /)] 5인 사원 데이터로 급여 가감승제 손계산 실습',
    description:
      '`emp_sample` 테이블의 5명 사원 데이터(급여: 1,000~5,000)를 바탕으로 기본 사칙연산자(`+`, `-`, `*`, `/`)를 실습합니다.\n\n각 사원의 사원번호(`empno`), 사원명(`ename`), 현재 급여(`sal`), 그리고 다음 연산 결과를 조회하세요.\n\n1. **급여 인상 (`+`)**: 현재 급여 + 500 (`sal + 500`의 별칭 `sal_plus_500`)\n2. **세금 공제 (`-`)**: 현재 급여 - 200 (`sal - 200`의 별칭 `sal_minus_200`)\n3. **연간 기본급 (`*`)**: 월급 * 12 (`sal * 12`의 별칭 `annual_sal`)\n4. **일급 (`/`)**: 월급 / 10 (`sal / 10`의 별칭 `daily_sal`)\n\n결과는 사원번호(`empno`) 기준 오름차순으로 정렬하세요.\n\n💡 **눈으로 바로 확인**: 김철수(1000)의 경우 인상액 1500, 공제액 800, 연봉 12000, 일급 100으로 바로 손계산됩니다.',
    initialQuery: `SELECT empno, ename, sal,\n       sal + 500 AS sal_plus_500,\n       sal - 200 AS sal_minus_200,\n       sal * 12 AS annual_sal,\n       sal / 10 AS daily_sal\nFROM emp_sample\nORDER BY empno ASC;`,
    solutionQuery: `SELECT empno, ename, sal, sal + 500 AS sal_plus_500, sal - 200 AS sal_minus_200, sal * 12 AS annual_sal, sal / 10 AS daily_sal FROM emp_sample ORDER BY empno ASC`,
    hint: '`+`, `-`, `*`, `/` 연산자를 각 컬럼 수식에 작성하고 `AS`로 별칭을 지정합니다.',
    explanation:
      'SQL 산술 연산자(+, -, *, /)는 숫자형 컬럼에 직접 사칙연산을 수행하여 새로운 파생 데이터를 계산할 수 있습니다. 5개의 행으로 누구나 눈으로 즉시 계산 결과를 검증할 수 있습니다.',
    quickExamples: [
      {
        label: '+ 1000원 특별 인상',
        query: `SELECT empno, ename, sal, sal + 1000 AS special_sal FROM emp_sample ORDER BY empno ASC;`,
        description: '급여에 1000원을 더한 인상액 확인 (2000, 3000, 4000, 5000, 6000)',
      },
      {
        label: '* 2 (급여 2배)',
        query: `SELECT empno, ename, sal, sal * 2 AS double_sal FROM emp_sample ORDER BY empno ASC;`,
        description: '월급을 2배로 곱한 금액 확인 (2000, 4000, 6000, 8000, 10000)',
      },
      {
        label: '/ 2 (급여 절반)',
        query: `SELECT empno, ename, sal, sal / 2 AS half_sal FROM emp_sample ORDER BY empno ASC;`,
        description: '급여를 반으로 나눈 금액 확인 (500, 1000, 1500, 2000, 2500)',
      },
    ],
    tryModifications: [
      {
        label: '인상액을 500에서 300으로 수정',
        query: `SELECT empno, ename, sal, sal + 300 AS sal_plus_300, sal * 12 AS annual_sal FROM emp_sample ORDER BY empno ASC;`,
        guide:
          'sal + 500을 sal + 300으로 바꾸어 1300, 2300, 3300... 으로 변하는 결과를 확인해 보세요!',
      },
      {
        label: '세금 공제액을 200에서 500으로 수정',
        query: `SELECT empno, ename, sal, sal - 500 AS net_sal, sal * 12 AS annual_sal FROM emp_sample ORDER BY empno ASC;`,
        guide: 'sal - 500으로 수정하여 실수령 기본급(500, 1500, 2500...)을 관찰해 보세요.',
      },
    ],
  },
  {
    id: 'sqld-arithmetic-2',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 1,
    category: '산술연산자',
    subCategory: '기본 사칙연산 (+, -, *, /)',
    title: '[연산자 우선순위와 나머지 연산 ((), %)] 괄호 연산과 나머지 구하기',
    description:
      '`emp_sample` 테이블의 5명 사원을 대상으로 나머지 연산자(`%`)와 괄호 연산자(`()`) 우선순위를 비교 실습합니다.\n\n각 사원의 사원번호(`empno`), 사원명(`ename`), 급여(`sal`), 그리고 다음 연산 결과를 비교하세요.\n\n1. **나머지 연산 (`%`)**: 급여를 3000으로 나눈 나머지 잔여 금액 (`sal % 3000`의 별칭 `rem_3000`)\n2. **괄호 연산자 (`()`)**: 보너스 100을 먼저 더한 후 2를 곱한 금액 (`(sal + 100) * 2`의 별칭 `sal_calc_bracket`)\n3. **기본 연산자 우선순위**: 급여에 2를 먼저 곱한 후 보너스 100을 더한 금액 (`sal * 2 + 100`의 별칭 `sal_calc_nobracket`)\n\n결과는 사원번호(`empno`) 오름차순으로 정렬하세요.\n\n💡 **눈으로 바로 확인**: \n- 김철수(1000): 1000 % 3000 = **1000**, 괄호 `(1000+100)*2 = 2200` vs 괄호없음 `1000*2+100 = 2100` (차이 100)\n- 박민수(3000): 3000 % 3000 = **0**',
    initialQuery: `SELECT empno, ename, sal,\n       sal % 3000 AS rem_3000,\n       (sal + 100) * 2 AS sal_calc_bracket,\n       sal * 2 + 100 AS sal_calc_nobracket\nFROM emp_sample\nORDER BY empno ASC;`,
    solutionQuery: `SELECT empno, ename, sal, sal % 3000 AS rem_3000, (sal + 100) * 2 AS sal_calc_bracket, sal * 2 + 100 AS sal_calc_nobracket FROM emp_sample ORDER BY empno ASC`,
    hint: '`sal % 3000`, `(sal + 100) * 2`, `sal * 2 + 100`을 SELECT 절에 작성하세요.',
    explanation:
      '1. %는 나눗셈의 나머지를 구하는 연산자입니다. (예: 1000 % 3000 = 1000, 3000 % 3000 = 0)\n2. 산술 연산자는 곱셈/나눗셈/나머지(*, /, %)가 덧셈/뺄셈(+, -)보다 우선순위가 높으므로, 괄호 ()를 사용하여 연산 순서를 지정합니다.',
    quickExamples: [
      {
        label: 'sal % 2000 (2000 단위 나머지)',
        query: `SELECT empno, ename, sal, sal % 2000 AS rem_2000 FROM emp_sample ORDER BY empno ASC;`,
        description: '2000으로 나눈 나머지 확인 (1000, 0, 1000, 0, 1000)',
      },
      {
        label: '(sal - 500) * 2 vs sal * 2 - 500',
        query: `SELECT ename, sal, (sal - 500) * 2 AS bracket_sub, sal * 2 - 500 AS nobracket_sub FROM emp_sample ORDER BY empno ASC;`,
        description: '뺄셈에 괄호를 적용했을 때와 적용하지 않았을 때의 연산 차이 확인',
      },
    ],
    tryModifications: [
      {
        label: '보너스를 100에서 500으로 변경',
        query: `SELECT empno, ename, sal, (sal + 500) * 2 AS sal_calc_bracket, sal * 2 + 500 AS sal_calc_nobracket FROM emp_sample ORDER BY empno ASC;`,
        guide:
          '100을 500으로 수정하면 괄호 유무에 따른 격차(500*2=1000 vs 500)가 500씩 벌어지는 것을 확인해 보세요!',
      },
      {
        label: '나머지 연산 단위를 3000에서 1500으로 변경',
        query: `SELECT empno, ename, sal, sal % 1500 AS rem_1500 FROM emp_sample ORDER BY empno ASC;`,
        guide:
          'sal % 1500으로 수정하여 1500으로 나눈 나머지(1000, 500, 0, 1000, 500)를 확인해 보세요.',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 산술연산자 > 하위 카테고리: NULL 가로 연산 (행 단위)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-arithmetic-3',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 1,
    category: '산술연산자',
    subCategory: 'NULL 가로 연산 (행 단위)',
    title: '[NULL 가로 연산] 행 단위 사칙연산과 NULL 전파 (숫자 + NULL = NULL)',
    description:
      '**【SQLD 핵심 빈출 원리: 가로(행) 연산】**\n`emp_sample` 5명 사원의 데이터(커미션: 100, NULL, 200, NULL, 0)를 바탕으로 가로 연산을 수행합니다.\n\n1. **가로 덧셈 (`+`)**: 급여 + 커미션 (`sal + comm`의 별칭 `total_income`)\n2. **가로 곱셈 (`*`)**: 커미션 * 12개월 (`comm * 12`의 별칭 `annual_comm`)\n3. **가로 뺄셈 (`-`)**: 급여 - 커미션 (`sal - comm`의 별칭 `diff_income`)\n\n결과는 사원번호(`empno`) 오름차순으로 정렬하세요.\n\n💡 **눈으로 1초 만에 확인**:\n- 김철수: 1000 + 100 = **1100**\n- 이영희: 2000 + NULL = **NULL**\n- 박민수: 3000 + 200 = **3200**\n- 최유나: 4000 + NULL = **NULL**\n- 정동원: 5000 + 0 = **5000**',
    initialQuery: `SELECT empno, ename, sal, comm,\n       sal + comm AS total_income,\n       comm * 12 AS annual_comm,\n       sal - comm AS diff_income\nFROM emp_sample\nORDER BY empno ASC;`,
    solutionQuery: `SELECT empno, ename, sal, comm, sal + comm AS total_income, comm * 12 AS annual_comm, sal - comm AS diff_income FROM emp_sample ORDER BY empno ASC`,
    hint: '`sal + comm AS total_income`, `comm * 12 AS annual_comm`, `sal - comm AS diff_income`을 SELECT 절에 작성하세요.',
    explanation:
      '【SQLD 필수 암기: 가로 연산의 NULL 전파】 동일한 행(Row) 내에서 컬럼끼리 수행하는 가로 산술 연산(+, -, *, /, %)은 연산 대상 중 하나라도 NULL이면 결과가 무조건 NULL이 됩니다. (예: 2000 + NULL = NULL, NULL * 12 = NULL)',
    quickExamples: [
      {
        label: 'comm + 100 가로 연산',
        query: `SELECT empno, ename, comm, comm + 100 AS comm_plus_100 FROM emp_sample ORDER BY empno ASC;`,
        description:
          '커미션에 100을 더해도 NULL인 행은 여전히 NULL임을 확인 (200, NULL, 300, NULL, 100)',
      },
      {
        label: 'sal - comm 가로 뺄셈',
        query: `SELECT empno, ename, sal, comm, sal - comm AS sal_minus_comm FROM emp_sample ORDER BY empno ASC;`,
        description:
          '가로 뺄셈 연산에서도 NULL이 포함되면 결과가 NULL로 전파됨을 확인 (900, NULL, 2800, NULL, 5000)',
      },
      {
        label: 'comm / 2 (커미션 절반) 가로 나눗셈',
        query: `SELECT empno, ename, comm, comm / 2 AS half_comm FROM emp_sample ORDER BY empno ASC;`,
        description: '나눗셈에서도 NULL 행은 NULL 결과 반환 (50, NULL, 100, NULL, 0)',
      },
    ],
    tryModifications: [
      {
        label: 'NVL(comm, 0)을 적용하여 가로 연산 정상화',
        query: `SELECT empno, ename, sal, comm, sal + NVL(comm, 0) AS safe_total FROM emp_sample ORDER BY empno ASC;`,
        guide:
          'NVL(comm, 0)을 적용하면 이영희(2000), 최유나(4000)도 정상 계산(1100, 2000, 3200, 4000, 5000)되는 것을 확인해 보세요!',
      },
      {
        label: 'COALESCE(comm, 500)으로 기본 커미션 부여',
        query: `SELECT empno, ename, sal, comm, sal + COALESCE(comm, 500) AS total_with_min_comm FROM emp_sample ORDER BY empno ASC;`,
        guide:
          'NULL 사원들에게 기본 500을 부여한 가로 합산(1100, 2500, 3200, 4500, 5000)을 체험해 보세요.',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 산술연산자 > 하위 카테고리: NULL 세로 연산 (열 단위 집계)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-arithmetic-4',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 1,
    category: '산술연산자',
    subCategory: 'NULL 세로 연산 (열 단위 집계)',
    title: '[NULL 세로 연산] 다중 행 집계 함수와 NULL 자동 제외 (SUM, AVG, COUNT)',
    description:
      '**【SQLD 핵심 빈출 원리: 세로(열) 집계 연산】**\n`emp_sample` 5명 사원의 커미션(`comm`: 100, NULL, 200, NULL, 0)에 대해 세로 집계 함수(`COUNT`, `SUM`, `AVG`)를 실행합니다.\n\n1. **전체 사원 수**: `COUNT(*)` (별칭 `cnt_all`)\n2. **커미션 있는 사원 수**: `COUNT(comm)` (별칭 `cnt_comm`)\n3. **커미션 총합계**: `SUM(comm)` (별칭 `sum_comm`)\n4. **커미션 평균**: `AVG(comm)` (별칭 `avg_comm_skip_null`)\n5. **전체 5명 기준 실제 커미션 평균**: `AVG(COALESCE(comm, 0))` (별칭 `avg_comm_all_5`)\n\n💡 **눈으로 즉시 암산 계산 검증**:\n- `COUNT(*)` = **5** (전체 사원)\n- `COUNT(comm)` = **3** (100, 200, 0 / NULL인 2명 제외)\n- `SUM(comm)` = 100 + 200 + 0 = **300**\n- `AVG(comm)` = 300 / 3 = **100** (NULL 2명이 제외되어 3으로 나눔!)\n- `AVG(COALESCE(comm, 0))` = 300 / 5 = **60** (전체 5명으로 나눈 진짜 평균!)',
    initialQuery: `SELECT COUNT(*) AS cnt_all,\n       COUNT(comm) AS cnt_comm,\n       SUM(comm) AS sum_comm,\n       AVG(comm) AS avg_comm_skip_null,\n       AVG(COALESCE(comm, 0)) AS avg_comm_all_5\nFROM emp_sample;`,
    solutionQuery: `SELECT COUNT(*) AS cnt_all, COUNT(comm) AS cnt_comm, SUM(comm) AS sum_comm, AVG(comm) AS avg_comm_skip_null, AVG(COALESCE(comm, 0)) AS avg_comm_all_5 FROM emp_sample`,
    hint: '`COUNT(*)`, `COUNT(comm)`, `SUM(comm)`, `AVG(comm)`, `AVG(COALESCE(comm, 0))`을 SELECT 절에 작성하세요.',
    explanation:
      '【SQLD 필수 암기: 세로 연산의 NULL 제외】 다중 행 집계 함수(SUM, AVG, COUNT(컬럼), MAX, MIN)는 NULL 값을 연산 대상에서 자동으로 제외(무시)합니다. 따라서 AVG(comm)은 전체 사원 수(5)가 아닌 커미션이 존재하는 사원 수(3)로 나누어 평균 100(300 / 3)을 구합니다.',
    quickExamples: [
      {
        label: 'MAX(comm) & MIN(comm) (NULL 제외)',
        query: `SELECT MAX(comm) AS max_comm, MIN(comm) AS min_comm FROM emp_sample;`,
        description: '최댓값(200)/최솟값(0) 집계 시에도 NULL은 자동 제외됨을 확인',
      },
      {
        label: 'SUM(sal) (급여 총합계)',
        query: `SELECT SUM(sal) AS total_sal FROM emp_sample;`,
        description: '전체 급여 합계: 1000+2000+3000+4000+5000 = 15000',
      },
    ],
    tryModifications: [
      {
        label: '급여(sal)와 커미션(comm)의 평균 비교',
        query: `SELECT AVG(sal) AS avg_sal, AVG(comm) AS avg_comm, AVG(COALESCE(comm, 0)) AS real_avg_comm FROM emp_sample;`,
        guide:
          '모든 사원이 급여를 받는 sal의 평균(3000)과, comm의 평균(100 vs 60) 계산 차이를 손계산으로 비교해 보세요!',
      },
      {
        label: 'NVL2를 활용한 커미션 수령 여부 카운트',
        query: `SELECT COUNT(NVL2(comm, 1, NULL)) AS has_comm_count, COUNT(CASE WHEN comm IS NULL THEN 1 END) AS no_comm_count FROM emp_sample;`,
        guide: '커미션이 있는 사원(3명)과 없는 사원(2명)의 집계를 분리해 보세요.',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 산술연산자 > 하위 카테고리: NULL 가로/세로 연산 비교
  // -------------------------------------------------------------------------
  {
    id: 'sqld-arithmetic-5',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 2,
    category: '산술연산자',
    subCategory: 'NULL 가로/세로 연산 비교',
    title: '[가로/세로 연산 비교] 가로 합산 vs 세로 합산의 결과 차이와 NVL 활용',
    description:
      '**【SQLD 최고 빈출 함정 손계산 비교】**\n5명 사원의 총 급여 지급액을 계산할 때, **가로 연산을 먼저 하는 것과 세로 연산을 먼저 하는 것의 치명적인 차이**를 손계산으로 검증합니다.\n\n1. **전체 기본급 합계**: `SUM(sal)` (별칭 `sum_sal`)\n2. **전체 커미션 합계**: `SUM(comm)` (별칭 `sum_comm`)\n3. **[오류] 가로 합산 후 세로 집계**: `SUM(sal + comm)` (별칭 `wrong_horizontal_sum`)\n4. **[정답 1] 세로 집계 후 더하기**: `SUM(sal) + SUM(comm)` (별칭 `right_vertical_sum`)\n5. **[정답 2] 가로 NVL 치환 후 세로 합산**: `SUM(sal + COALESCE(comm, 0))` (별칭 `right_nvl_sum`)\n\n💡 **눈으로 즉시 계산 검증**:\n- `SUM(sal)` = 1000 + 2000 + 3000 + 4000 + 5000 = **15000**\n- `SUM(comm)` = 100 + 200 + 0 = **300**\n- `SUM(sal + comm)` (오류): 이영희(2000)와 최유나(4000)가 NULL이 되어 **6000원이 누락**되므로, 1100 + 3200 + 5000 = **9300**만 나옵니다!\n- `SUM(sal) + SUM(comm)` (정답): 15000 + 300 = **15300**\n- `SUM(sal + COALESCE(comm, 0))` (정답): **15300**',
    initialQuery: `SELECT SUM(sal) AS sum_sal,\n       SUM(comm) AS sum_comm,\n       SUM(sal + comm) AS wrong_horizontal_sum,\n       SUM(sal) + SUM(comm) AS right_vertical_sum,\n       SUM(sal + COALESCE(comm, 0)) AS right_nvl_sum\nFROM emp_sample;`,
    solutionQuery: `SELECT SUM(sal) AS sum_sal, SUM(comm) AS sum_comm, SUM(sal + comm) AS wrong_horizontal_sum, SUM(sal) + SUM(comm) AS right_vertical_sum, SUM(sal + COALESCE(comm, 0)) AS right_nvl_sum FROM emp_sample`,
    hint: '`SUM(sal)`, `SUM(comm)`, `SUM(sal + comm)`, `SUM(sal) + SUM(comm)`, `SUM(sal + COALESCE(comm, 0))`을 비교하여 작성하세요.',
    explanation:
      '【SQLD 최고 빈출 개념: 가로 연산 vs 세로 연산】 SUM(sal + comm)은 행 단위(가로)로 sal+comm을 먼저 계산하므로 comm이 NULL인 이영희(2000), 최유나(4000)의 급여 6000원이 통째로 NULL이 되어 누락(결과: 9300)됩니다. 반면 SUM(sal) + SUM(comm) 또는 SUM(sal + NVL(comm,0))은 정확히 15300이 계산됩니다.',
    quickExamples: [
      {
        label: '1인당 평균 실지급액 비교',
        query: `SELECT AVG(sal + comm) AS wrong_avg, AVG(sal + NVL(comm, 0)) AS right_avg FROM emp_sample;`,
        description:
          '평균을 구할 때도 가로 연산 시 NULL 사원 2명이 제외되어 평균이 3100(9300/3)으로 왜곡되는 현상 확인 (정답: 15300/5 = 3060)',
      },
      {
        label: '연간 총인건비 (12개월) 계산 비교',
        query: `SELECT SUM((sal + comm) * 12) AS wrong_annual, SUM((sal + NVL(comm, 0)) * 12) AS right_annual FROM emp_sample;`,
        description: '12개월치를 곱해도 가로 연산 시 72000원(6000*12)이 누락되는 현상 확인',
      },
    ],
    tryModifications: [
      {
        label: '최유나에게 커미션 400을 부여했을 때 변화',
        query: `SELECT SUM(sal) AS sum_sal, SUM(sal + COALESCE(comm, 400)) AS with_custom_comm FROM emp_sample;`,
        guide:
          'COALESCE(comm, 400)을 적용하면 총 지급액이 15000 + 300 + 400*2 = 16100으로 변하는 것을 확인해 보세요!',
      },
    ],
  },

  // =========================================================================
  // 대분류: 문자 함수 (Character Functions) - DUAL 테이블 활용
  // =========================================================================

  // -------------------------------------------------------------------------
  // 카테고리: 문자 함수 > 하위 카테고리: 대소문자 & 아스키 변환 (LOWER, UPPER, CHR)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-char-1',
    datasetId: 'sqld_sqlp',
    targetTable: 'dual',
    level: 1,
    category: '문자 함수',
    subCategory: '대소문자 & 아스키 변환 (LOWER, UPPER, CHR)',
    title: '[대소문자 & 아스키 변환] LOWER, UPPER, CHR 함수 (DUAL 활용)',
    description:
      "오라클 가상 테이블 `DUAL`을 활용하여 문자열의 대소문자 변환 및 아스키(ASCII) 코드 변환 함수를 실습합니다.\n\n1. **소문자 변환 (`LOWER`)**: 문자열 `'SQLD Master Exam'`을 모두 소문자로 변환 (별칭 `lower_result`)\n2. **대문자 변환 (`UPPER`)**: 문자열 `'sqld master exam'`을 모두 대문자로 변환 (별칭 `upper_result`)\n3. **아스키 대문자 변환 (`CHR(65)`)**: 아스키코드 65번에 해당하는 문자 `'A'` 변환 (별칭 `chr_65_A`)\n4. **아스키 소문자 변환 (`CHR(97)`)**: 아스키코드 97번에 해당하는 문자 `'a'` 변환 (별칭 `chr_97_a`)\n5. **아스키 숫자문자 변환 (`CHR(49)`)**: 아스키코드 49번에 해당하는 숫자 문자 `'1'` 변환 (별칭 `chr_49_1`)\n\n💡 **핵심 관전 포인트**:\n- `LOWER`와 `UPPER`는 영문 알파벳의 대소문자를 일괄 변환하며, 한글/특수문자는 변경 없이 유지됩니다.\n- `CHR(n)`은 10진수 아스키코드 번호를 해당 문자로 반환합니다. (A=65, B=66, a=97, 0=48, 1=49)",
    initialQuery: `SELECT LOWER('SQLD Master Exam') AS lower_result,\n       UPPER('sqld master exam') AS upper_result,\n       CHR(65) AS chr_65_A,\n       CHR(97) AS chr_97_a,\n       CHR(49) AS chr_49_1\nFROM dual;`,
    solutionQuery: `SELECT LOWER('SQLD Master Exam') AS lower_result, UPPER('sqld master exam') AS upper_result, CHR(65) AS chr_65_A, CHR(97) AS chr_97_a, CHR(49) AS chr_49_1 FROM dual`,
    hint: "`LOWER('SQLD Master Exam')`, `UPPER('sqld master exam')`, `CHR(65)`, `CHR(97)`, `CHR(49)`를 SELECT 절에 작성하세요.",
    explanation:
      '1. LOWER(str): 모든 영문자를 소문자로 변환합니다.\n2. UPPER(str): 모든 영문자를 대문자로 변환합니다.\n3. CHR(n): 아스키 코드값 n에 해당하는 문자를 반환합니다. (CHR(65) = "A", CHR(97) = "a", CHR(10) = 줄바꿈)',
    quickExamples: [
      {
        label: 'CHR 결합으로 단어 만들기 (65, 66, 67 = ABC)',
        query: `SELECT CHR(65) || CHR(66) || CHR(67) AS word_abc FROM dual;`,
        description: '아스키 65(A), 66(B), 67(C)를 연결 연산자(||)로 결합하여 ABC 출력',
      },
      {
        label: '중첩 함수 호출: LOWER(UPPER(...))',
        query: `SELECT LOWER(UPPER('sqld 2026')) AS nested_result FROM dual;`,
        description: 'UPPER로 대문자 변환 후 다시 LOWER로 소문자 변환',
      },
      {
        label: 'CHR(48) ~ CHR(57) (숫자 0 ~ 9 아스키)',
        query: `SELECT CHR(48) AS num_0, CHR(57) AS num_9 FROM dual;`,
        description: '숫자 문자 0(48번)과 9(57번)의 아스키 문자 변환',
      },
    ],
    tryModifications: [
      {
        label: 'CHR(66)으로 변경하여 "B" 확인',
        query: `SELECT CHR(66) AS chr_66_B, CHR(98) AS chr_98_b FROM dual;`,
        guide: '65와 97을 66과 98로 수정하여 대문자 B, 소문자 b가 출력되는지 확인해 보세요!',
      },
      {
        label: '한글과 영문 혼합 문자열 대소문자 변환',
        query: `SELECT UPPER('sqld 국가공인 자격검정') AS mixed_upper FROM dual;`,
        guide: '한글은 그대로 유지되고 영문자만 대문자로 변환되는 것을 확인해 보세요.',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 문자 함수 > 하위 카테고리: 공백 및 특정 문자 제거 (LTRIM, RTRIM, TRIM)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-char-2',
    datasetId: 'sqld_sqlp',
    targetTable: 'dual',
    level: 1,
    category: '문자 함수',
    subCategory: '공백 및 특정 문자 제거 (LTRIM, RTRIM, TRIM)',
    title: '[공백 및 특정 문자 제거] LTRIM, RTRIM, TRIM (옵션 유무 비교)',
    description:
      "오라클 가상 테이블 `DUAL`을 활용하여 문자열의 왼쪽, 오른쪽, 양쪽 공백 또는 특정 문자를 제거하는 `LTRIM`, `RTRIM`, `TRIM` 함수를 실습합니다.\n\n각 함수의 **[옵션이 없는 기본 공백 제거]**와 **[제거할 문자를 옵션으로 지정한 경우]**를 비교하세요.\n\n1. **`LTRIM` [옵션 없음 - 기본 공백 제거]**: `'   SQLD'`의 왼쪽 공백 3칸 제거 (별칭 `ltrim_no_opt_space`)\n2. **`LTRIM` [옵션 있음 - 특정 문자 제거]**: `'000123'`의 왼쪽 연속된 `'0'` 제거 (별칭 `ltrim_with_opt_zero`)\n3. **`RTRIM` [옵션 없음 - 기본 공백 제거]**: `'SQLD   '`의 오른쪽 공백 3칸 제거 (별칭 `rtrim_no_opt_space`)\n4. **`RTRIM` [옵션 있음 - 특정 문자 제거]**: `'123000'`의 오른쪽 연속된 `'0'` 제거 (별칭 `rtrim_with_opt_zero`)\n5. **`TRIM` [기본 양쪽 공백 제거]**: `'   SQLD   '`의 양쪽 공백 모두 제거 (별칭 `trim_both_space`)\n\n💡 **핵심 관전 포인트**:\n- 2번째 인자(옵션)를 생략하면 **기본값으로 공백(Space)**을 제거합니다.\n- 2번째 인자에 제거할 문자를 전달하면 해당 문자가 연속으로 나타나는 부분을 왼쪽(LTRIM) 또는 오른쪽(RTRIM)에서 잘라냅니다.",
    initialQuery: `SELECT LTRIM('   SQLD') AS ltrim_no_opt_space,\n       LTRIM('000123', '0') AS ltrim_with_opt_zero,\n       RTRIM('SQLD   ') AS rtrim_no_opt_space,\n       RTRIM('123000', '0') AS rtrim_with_opt_zero,\n       TRIM('   SQLD   ') AS trim_both_space\nFROM dual;`,
    solutionQuery: `SELECT LTRIM('   SQLD') AS ltrim_no_opt_space, LTRIM('000123', '0') AS ltrim_with_opt_zero, RTRIM('SQLD   ') AS rtrim_no_opt_space, RTRIM('123000', '0') AS rtrim_with_opt_zero, TRIM('   SQLD   ') AS trim_both_space FROM dual`,
    hint: "`LTRIM('   SQLD')`, `LTRIM('000123', '0')`, `RTRIM('SQLD   ')`, `RTRIM('123000', '0')`, `TRIM('   SQLD   ')`를 작성하세요.",
    explanation:
      '1. LTRIM(str, [set]): str의 왼쪽부터 [set]에 포함된 문자를 제거합니다. [set] 생략 시 왼쪽 공백을 제거합니다.\n2. RTRIM(str, [set]): str의 오른쪽부터 [set]에 포함된 문자를 제거합니다. [set] 생략 시 오른쪽 공백을 제거합니다.\n3. TRIM(str): str의 양쪽 공백을 제거합니다.',
    quickExamples: [
      {
        label: 'LTRIM vs RTRIM 특정 문자(x) 제거 비교',
        query: `SELECT LTRIM('xxSQLDxx', 'x') AS left_trim, RTRIM('xxSQLDxx', 'x') AS right_trim FROM dual;`,
        description:
          'xxSQLDxx에서 LTRIM은 왼쪽 xx만 제거(SQLDxx), RTRIM은 오른쪽 xx만 제거(xxSQLD)',
      },
      {
        label: '계좌번호/학번 앞자리 9 제거',
        query: `SELECT LTRIM('99999105', '9') AS clean_id FROM dual;`,
        description: '왼쪽의 9들을 모두 제거하여 105 추출',
      },
    ],
    tryModifications: [
      {
        label: '제거 문자를 0에서 #으로 변경',
        query: `SELECT LTRIM('###SQLD', '#') AS ltrim_hash, RTRIM('SQLD###', '#') AS rtrim_hash FROM dual;`,
        guide: '옵션 문자를 #으로 수정하여 특수문자도 깔끔하게 제거되는지 확인해 보세요!',
      },
      {
        label: '중간에 있는 공백은 제거되지 않는 현상 확인',
        query: `SELECT TRIM('   SQL   D   ') AS trim_middle FROM dual;`,
        guide:
          'TRIM은 양쪽 끝 공백만 제거하며, 단어 사이의 중간 공백(SQL   D)은 유지됨을 관찰해 보세요.',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 문자 함수 > 하위 카테고리: 문자열 추출 및 길이 (SUBSTR, LENGTH)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-char-3',
    datasetId: 'sqld_sqlp',
    targetTable: 'dual',
    level: 1,
    category: '문자 함수',
    subCategory: '문자열 추출 및 길이 (SUBSTR, LENGTH)',
    title: '[문자열 추출 및 길이] SUBSTR, LENGTH (옵션 유무 & 음수 인덱스)',
    description:
      "오라클 가상 테이블 `DUAL`을 활용하여 문자열을 부분 추출하는 `SUBSTR`과 길이를 계산하는 `LENGTH` 함수를 실습합니다.\n\n`SUBSTR`의 **[길이 옵션을 생략한 경우]**, **[길이 옵션을 지정한 경우]**, 그리고 **[음수 시작 위치 옵션]**을 비교하세요.\n\n1. **`SUBSTR` [옵션 없음 - 길이 생략]**: `'SQLDeveloper'`의 4번째부터 끝까지 추출 (`SUBSTR('SQLDeveloper', 4)` ➔ `'Developer'`)\n2. **`SUBSTR` [옵션 있음 - 길이 지정]**: `'SQLDeveloper'`의 1번째부터 3글자 추출 (`SUBSTR('SQLDeveloper', 1, 3)` ➔ `'SQL'`)\n3. **`SUBSTR` [옵션 있음 - 음수 위치 & 길이]**: `'SQLDeveloper'`의 뒤에서 9번째부터 3글자 추출 (`SUBSTR('SQLDeveloper', -9, 3)` ➔ `'Dev'`)\n4. **`SUBSTR` [음수 위치만 지정]**: `'SQLDeveloper'`의 뒤에서 9번째부터 끝까지 추출 (`SUBSTR('SQLDeveloper', -9)` ➔ `'Developer'`)\n5. **`LENGTH` 영문 길이**: `'SQLD'`의 글자 수 (`LENGTH('SQLD')` ➔ `4`)\n6. **`LENGTH` 한글 길이**: `'데이터베이스'`의 글자 수 (`LENGTH('데이터베이스')` ➔ `6`)\n\n💡 **핵심 관전 포인트**:\n- `SUBSTR`의 3번째 인자(길이)를 생략하면 시작 위치부터 문자열 끝까지 모두 가져옵니다.\n- 시작 위치가 **음수(`-n`)**이면 문자열의 **맨 뒤에서부터 거꾸로 n번째 위치**를 기준으로 추출합니다.",
    initialQuery: `SELECT SUBSTR('SQLDeveloper', 4) AS substr_no_len_opt,\n       SUBSTR('SQLDeveloper', 1, 3) AS substr_with_len_opt,\n       SUBSTR('SQLDeveloper', -9, 3) AS substr_neg_pos_with_len,\n       SUBSTR('SQLDeveloper', -9) AS substr_neg_pos_no_len,\n       LENGTH('SQLD') AS length_eng,\n       LENGTH('데이터베이스') AS length_kor\nFROM dual;`,
    solutionQuery: `SELECT SUBSTR('SQLDeveloper', 4) AS substr_no_len_opt, SUBSTR('SQLDeveloper', 1, 3) AS substr_with_len_opt, SUBSTR('SQLDeveloper', -9, 3) AS substr_neg_pos_with_len, SUBSTR('SQLDeveloper', -9) AS substr_neg_pos_no_len, LENGTH('SQLD') AS length_eng, LENGTH('데이터베이스') AS length_kor FROM dual`,
    hint: "`SUBSTR('SQLDeveloper', 4)`, `SUBSTR('SQLDeveloper', 1, 3)`, `SUBSTR('SQLDeveloper', -9, 3)`, `SUBSTR('SQLDeveloper', -9)`, `LENGTH('SQLD')`, `LENGTH('데이터베이스')`를 작성하세요.",
    explanation:
      '1. SUBSTR(str, pos, [len]): str의 pos번째 위치부터 len개 문자를 추출합니다. len 생략 시 끝까지 추출하며, pos가 음수이면 뒤에서부터 셉니다.\n2. LENGTH(str): 문자열의 총 글자 수를 반환합니다.',
    quickExamples: [
      {
        label: '생년월일(YYYYMMDD) 년/월/일 분리',
        query: `SELECT SUBSTR('20260825', 1, 4) AS yr, SUBSTR('20260825', 5, 2) AS mo, SUBSTR('20260825', 7, 2) AS dy FROM dual;`,
        description: '20260825에서 년도(2026), 월(08), 일(25) 추출',
      },
      {
        label: '뒤에서 4자리 추출 (전화번호/카드 끝자리)',
        query: `SELECT SUBSTR('010-1234-5678', -4) AS last_4_digits FROM dual;`,
        description: '음수 인덱스 -4를 지정하여 뒤 4자리(5678) 추출',
      },
    ],
    tryModifications: [
      {
        label: 'SUBSTR 길이를 3에서 5로 변경',
        query: `SELECT SUBSTR('SQLDeveloper', 1, 5) AS first_5_chars FROM dual;`,
        guide: '길이를 5로 수정하여 "SQLDe"가 추출되는지 확인해 보세요!',
      },
      {
        label: 'LENGTH 함수에 공백 포함 문자열 전달',
        query: `SELECT LENGTH('SQL D') AS len_with_space, LENGTH('   ') AS len_spaces_only FROM dual;`,
        guide: '공백도 1글자로 계산되는 것을 직접 확인해 보세요.',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 문자 함수 > 하위 카테고리: 문자열 치환 및 패딩 (REPLACE, LPAD)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-char-4',
    datasetId: 'sqld_sqlp',
    targetTable: 'dual',
    level: 1,
    category: '문자 함수',
    subCategory: '문자열 치환 및 패딩 (REPLACE, LPAD)',
    title: '[문자열 치환 및 패딩] REPLACE, LPAD (옵션 유무 비교)',
    description:
      "오라클 가상 테이블 `DUAL`을 활용하여 문자열을 다른 문자로 치환하는 `REPLACE`와 지정한 길이만큼 왼쪽을 채우는 `LPAD` 함수를 실습합니다.\n\n각 함수의 **[옵션을 생략한 기본 동작]**과 **[옵션을 지정한 경우]**를 비교하세요.\n\n1. **`REPLACE` [옵션 없음 - 대체문자 생략]**: `'SQL-D Exam'`에서 `'-'`를 삭제 (`REPLACE('SQL-D Exam', '-')` ➔ `'SQLD Exam'`)\n2. **`REPLACE` [옵션 있음 - 공백으로 치환]**: `'SQL-D Exam'`에서 `'-'`를 공백(`' '`)으로 변경 (별칭 `replace_with_space`)\n3. **`REPLACE` [옵션 있음 - 단어 치환]**: `'SQLD 2024'`에서 `'2024'`를 `'2026'`으로 변경 (별칭 `replace_word`)\n4. **`LPAD` [옵션 없음 - 기본 공백 패딩]**: `'SQL'`을 총 6자리로 만들며 왼쪽에 기본 공백 3칸 채움 (별칭 `lpad_no_opt_space`)\n5. **`LPAD` [옵션 있음 - '0' 패딩]**: `'123'`을 총 6자리로 만들며 왼쪽에 `'0'` 3개 채움 (`LPAD('123', 6, '0')` ➔ `'000123'`)\n6. **`LPAD` [옵션 있음 - 특수기호 패딩]**: `'7'`을 총 4자리로 만들며 왼쪽에 `'#'` 3개 채움 (`LPAD('7', 4, '#')` ➔ `'###7'`)\n\n💡 **핵심 관전 포인트**:\n- `REPLACE`에서 3번째 인자(바꿀 문자)를 생략하면 검색된 문자가 완전히 **삭제(제거)**됩니다.\n- `LPAD`에서 3번째 인자(채울 문자)를 생략하면 **기본값으로 공백(Space)**이 채워집니다. `'0'`을 지정하면 6자리/8자리 일련번호를 만들 때 유용합니다.",
    initialQuery: `SELECT REPLACE('SQL-D Exam', '-') AS replace_no_opt_delete,\n       REPLACE('SQL-D Exam', '-', ' ') AS replace_with_space,\n       REPLACE('SQLD 2024', '2024', '2026') AS replace_word,\n       LPAD('SQL', 6) AS lpad_no_opt_space,\n       LPAD('123', 6, '0') AS lpad_with_zero,\n       LPAD('7', 4, '#') AS lpad_with_hash\nFROM dual;`,
    solutionQuery: `SELECT REPLACE('SQL-D Exam', '-') AS replace_no_opt_delete, REPLACE('SQL-D Exam', '-', ' ') AS replace_with_space, REPLACE('SQLD 2024', '2024', '2026') AS replace_word, LPAD('SQL', 6) AS lpad_no_opt_space, LPAD('123', 6, '0') AS lpad_with_zero, LPAD('7', 4, '#') AS lpad_with_hash FROM dual`,
    hint: "`REPLACE('SQL-D Exam', '-')`, `REPLACE('SQL-D Exam', '-', ' ')`, `REPLACE('SQLD 2024', '2024', '2026')`, `LPAD('SQL', 6)`, `LPAD('123', 6, '0')`, `LPAD('7', 4, '#')`를 작성하세요.",
    explanation:
      '1. REPLACE(str, search_str, [rep_str]): str에서 search_str을 찾아 rep_str로 바꿉니다. rep_str 생략 시 search_str을 삭제합니다.\n2. LPAD(str, len, [pad_char]): str의 총 길이를 len으로 맞추고 남는 왼쪽 자리에 pad_char를 채웁니다. pad_char 생략 시 공백을 채웁니다.',
    quickExamples: [
      {
        label: '전화번호의 모든 하이픈(-) 삭제',
        query: `SELECT REPLACE('010-1234-5678', '-') AS pure_number FROM dual;`,
        description: '하이픈을 완전히 삭제하여 01012345678로 변환',
      },
      {
        label: '5자리 일련번호/사번 포맷팅 (LPAD)',
        query: `SELECT LPAD('42', 5, '0') AS emp_code FROM dual;`,
        description: '42를 5자리 00042로 변환',
      },
    ],
    tryModifications: [
      {
        label: 'LPAD 총 자릿수를 6에서 10으로 변경',
        query: `SELECT LPAD('123', 10, '0') AS lpad_10_zero FROM dual;`,
        guide: '길이를 10으로 늘려 0000000123이 출력되는지 확인해 보세요!',
      },
      {
        label: '문자열의 모든 공백 제거 (REPLACE 활용)',
        query: `SELECT REPLACE('S Q L D   E X A M', ' ') AS no_spaces FROM dual;`,
        guide: 'REPLACE를 활용하면 문자열 내부의 모든 공백을 한 번에 제거할 수 있습니다.',
      },
    ],
  },

  // =========================================================================
  // 대분류: 숫자 함수 (Numeric Functions) - DUAL 테이블 활용
  // =========================================================================

  // -------------------------------------------------------------------------
  // 카테고리: 숫자 함수 > 하위 카테고리: 반올림과 버림 (ROUND, TRUNC)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-num-1',
    datasetId: 'sqld_sqlp',
    targetTable: 'dual',
    level: 1,
    category: '숫자 함수',
    subCategory: '반올림과 버림 (ROUND, TRUNC)',
    title: '[반올림과 버림] ROUND vs TRUNC (자릿수 옵션별 완전 비교)',
    description:
      '오라클 가상 테이블 `DUAL`을 활용하여 반올림 함수 `ROUND`와 버림(절삭) 함수 `TRUNC`의 자릿수 옵션에 따른 결과 차이를 실습합니다.\n\n숫자 `156.784`를 대상으로 다음 연산 결과를 비교하세요.\n\n1. **`ROUND` [옵션 없음 - 자릿수 0]**: 소수점 첫째 자리에서 반올림하여 정수 생성 (`ROUND(156.784)` ➔ `157`)\n2. **`ROUND` [소수점 1자리 지정]**: 소수점 둘째 자리에서 반올림하여 첫째 자리까지 표시 (`ROUND(156.784, 1)` ➔ `156.8`)\n3. **`ROUND` [정수부 -1자리 지정]**: 일의 자리(10^0)에서 반올림하여 십의 자리까지 표시 (`ROUND(156.784, -1)` ➔ `160`)\n4. **`ROUND` [정수부 -2자리 지정]**: 십의 자리(10^1)에서 반올림하여 백의 자리까지 표시 (`ROUND(156.784, -2)` ➔ `200`)\n5. **`TRUNC` [옵션 없음 - 자릿수 0]**: 소수점 아래를 모두 버리고 정수만 반환 (`TRUNC(156.784)` ➔ `156`)\n6. **`TRUNC` [소수점 1자리 지정]**: 소수점 둘째 자리 이하를 모두 버림 (`TRUNC(156.784, 1)` ➔ `156.7`)\n7. **`TRUNC` [정수부 -1자리 지정]**: 일의 자리를 버리고 0으로 채움 (`TRUNC(156.784, -1)` ➔ `150`)\n8. **`TRUNC` [정수부 -2자리 지정]**: 십의 자리 이하를 버리고 0으로 채움 (`TRUNC(156.784, -2)` ➔ `100`)\n\n💡 **핵심 관전 포인트**:\n- 2번째 인자가 **양수(`n`)**이면 소수점 이하 `n`번째 자리까지 남깁니다.\n- 2번째 인자를 **생략**하면 기본값 `0` (정수)으로 동작합니다.\n- 2번째 인자가 **음수(`-n`)**이면 정수부의 $10^{n-1}$ 자리에서 반올림/버림을 수행합니다.',
    initialQuery: `SELECT ROUND(156.784) AS round_default_0,\n       ROUND(156.784, 1) AS round_pos_1,\n       ROUND(156.784, -1) AS round_neg_1,\n       ROUND(156.784, -2) AS round_neg_2,\n       TRUNC(156.784) AS trunc_default_0,\n       TRUNC(156.784, 1) AS trunc_pos_1,\n       TRUNC(156.784, -1) AS trunc_neg_1,\n       TRUNC(156.784, -2) AS trunc_neg_2\nFROM dual;`,
    solutionQuery: `SELECT ROUND(156.784) AS round_default_0, ROUND(156.784, 1) AS round_pos_1, ROUND(156.784, -1) AS round_neg_1, ROUND(156.784, -2) AS round_neg_2, TRUNC(156.784) AS trunc_default_0, TRUNC(156.784, 1) AS trunc_pos_1, TRUNC(156.784, -1) AS trunc_neg_1, TRUNC(156.784, -2) AS trunc_neg_2 FROM dual`,
    hint: '`ROUND(156.784)`, `ROUND(156.784, 1)`, `ROUND(156.784, -1)`, `ROUND(156.784, -2)`, `TRUNC(156.784)`, `TRUNC(156.784, 1)`, `TRUNC(156.784, -1)`, `TRUNC(156.784, -2)`를 작성하세요.',
    explanation:
      '1. ROUND(n, [d]): n을 소수점 d번째 자리까지 반올림합니다. d 생략 시 0이며, d가 음수이면 정수부를 반올림합니다.\n2. TRUNC(n, [d]): n을 소수점 d번째 자리까지 버립니다. d 생략 시 0이며, d가 음수이면 정수부 이하를 0으로 버립니다.',
    quickExamples: [
      {
        label: '소수점 2자리 반올림 vs 버림 (ROUND 156.78 vs TRUNC 156.78)',
        query: `SELECT ROUND(156.784, 2) AS round_2, TRUNC(156.784, 2) AS trunc_2 FROM dual;`,
        description: '3번째 자리(4)가 5 미만이므로 156.78로 동일한 결과 확인',
      },
      {
        label: '소수점 2자리에서 올림 발생하는 경우 (156.789)',
        query: `SELECT ROUND(156.789, 2) AS round_up_2, TRUNC(156.789, 2) AS trunc_2 FROM dual;`,
        description: '156.789에서 ROUND는 156.79로 올림, TRUNC는 156.78로 절삭',
      },
    ],
    tryModifications: [
      {
        label: '자릿수를 -3으로 지정하여 1000 단위 연산',
        query: `SELECT ROUND(1567.89, -3) AS round_1000, TRUNC(1567.89, -3) AS trunc_1000 FROM dual;`,
        guide:
          '-3으로 지정하면 100의 자리(5)에서 반올림(2000) 및 버림(1000)되는 것을 확인해 보세요!',
      },
      {
        label: '음수 대상 ROUND와 TRUNC 비교',
        query: `SELECT ROUND(-156.784, 1) AS round_neg, TRUNC(-156.784, 1) AS trunc_neg FROM dual;`,
        guide:
          '음수에서도 동일하게 절댓값 기준으로 반올림(-156.8) 및 버림(-156.7)이 작동함을 확인해 보세요.',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 숫자 함수 > 하위 카테고리: 올림과 내림 (CEIL, FLOOR)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-num-2',
    datasetId: 'sqld_sqlp',
    targetTable: 'dual',
    level: 1,
    category: '숫자 함수',
    subCategory: '올림과 내림 (CEIL, FLOOR)',
    title: '[올림과 내림] CEIL vs FLOOR (양수/음수 정수 변환 비교)',
    description:
      '오라클 가상 테이블 `DUAL`을 활용하여 올림 함수 `CEIL`과 내림 함수 `FLOOR`를 실습합니다.\n\n양수와 음수에 대해 각각 올림과 내림이 어떻게 동작하는지 수직선 상의 위치를 기준으로 비교하세요.\n\n1. **`CEIL(12.3)` [양수 올림]**: 12.3보다 크거나 같은 최소 정수 (`CEIL(12.3)` ➔ `13`)\n2. **`CEIL(12.0)` [정수 올림]**: 12.0보다 크거나 같은 최소 정수 (`CEIL(12.0)` ➔ `12`)\n3. **`CEIL(-12.3)` [음수 올림]**: -12.3보다 크거나 같은 최소 정수 (`CEIL(-12.3)` ➔ `-12`)\n4. **`CEIL(-12.9)` [음수 올림]**: -12.9보다 크거나 같은 최소 정수 (`CEIL(-12.9)` ➔ `-12`)\n5. **`FLOOR(12.7)` [양수 내림]**: 12.7보다 작거나 같은 최대 정수 (`FLOOR(12.7)` ➔ `12`)\n6. **`FLOOR(12.0)` [정수 내림]**: 12.0보다 작거나 같은 최대 정수 (`FLOOR(12.0)` ➔ `12`)\n7. **`FLOOR(-12.3)` [음수 내림]**: -12.3보다 작거나 같은 최대 정수 (`FLOOR(-12.3)` ➔ `-13`)\n8. **`FLOOR(-12.9)` [음수 내림]**: -12.9보다 작거나 같은 최대 정수 (`FLOOR(-12.9)` ➔ `-13`)\n\n💡 **【SQLD 단골 함정: 음수의 올림과 내림】**:\n- 수직선 상에서 **오른쪽(더 큰 쪽)**으로 이동하는 것이 `CEIL`이고, **왼쪽(더 작은 쪽)**으로 이동하는 것이 `FLOOR`입니다.\n- 따라서 `-12.3`의 올림(`CEIL`)은 **`-12`**이고, 내림(`FLOOR`)은 **`-13`**이 됩니다!',
    initialQuery: `SELECT CEIL(12.3) AS ceil_pos,\n       CEIL(12.0) AS ceil_pos_exact,\n       CEIL(-12.3) AS ceil_neg,\n       CEIL(-12.9) AS ceil_neg_9,\n       FLOOR(12.7) AS floor_pos,\n       FLOOR(12.0) AS floor_pos_exact,\n       FLOOR(-12.3) AS floor_neg,\n       FLOOR(-12.9) AS floor_neg_9\nFROM dual;`,
    solutionQuery: `SELECT CEIL(12.3) AS ceil_pos, CEIL(12.0) AS ceil_pos_exact, CEIL(-12.3) AS ceil_neg, CEIL(-12.9) AS ceil_neg_9, FLOOR(12.7) AS floor_pos, FLOOR(12.0) AS floor_pos_exact, FLOOR(-12.3) AS floor_neg, FLOOR(-12.9) AS floor_neg_9 FROM dual`,
    hint: '`CEIL(12.3)`, `CEIL(-12.3)`, `CEIL(-12.9)`, `FLOOR(12.7)`, `FLOOR(-12.3)`, `FLOOR(-12.9)`를 작성하세요.',
    explanation:
      '1. CEIL(n): n보다 크거나 같은 가장 작은 정수를 반환합니다. (CEIL(12.3) = 13, CEIL(-12.3) = -12)\n2. FLOOR(n): n보다 작거나 같은 가장 큰 정수를 반환합니다. (FLOOR(12.7) = 12, FLOOR(-12.3) = -13)',
    quickExamples: [
      {
        label: '정수 그대로 전달 시 (CEIL(5) vs FLOOR(5))',
        query: `SELECT CEIL(5) AS ceil_exact, FLOOR(5) AS floor_exact FROM dual;`,
        description: '정수인 경우 올림/내림 모두 본래 정수 5를 그대로 반환',
      },
      {
        label: '소수점 0.1과 0.9의 올림/내림',
        query: `SELECT CEIL(0.1) AS c1, FLOOR(0.9) AS f1, CEIL(-0.9) AS c2, FLOOR(-0.1) AS f2 FROM dual;`,
        description: '0.1 올림=1, 0.9 내림=0, -0.9 올림=0, -0.1 내림=-1 확인',
      },
    ],
    tryModifications: [
      {
        label: '-10.01에 대한 CEIL과 FLOOR 비교',
        query: `SELECT CEIL(-10.01) AS ceil_res, FLOOR(-10.01) AS floor_res FROM dual;`,
        guide: 'CEIL(-10.01)은 -10, FLOOR(-10.01)은 -11이 되는 것을 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 숫자 함수 > 하위 카테고리: 나머지 연산 (MOD - 음수 집중 비교)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-num-3',
    datasetId: 'sqld_sqlp',
    targetTable: 'dual',
    level: 2,
    category: '숫자 함수',
    subCategory: '나머지 연산 (MOD - 음수 집중 비교)',
    title: '[나머지 연산] MOD 함수의 양수/음수 연산 원리 (SQLD 핵심 함정)',
    description:
      '**【SQLD 최고 빈출 핵심 문제: MOD의 부호 결정 규칙】**\n오라클 가상 테이블 `DUAL`을 활용하여 나머지 함수 `MOD(n, m)`의 양수/음수 조합 8가지를 실습합니다.\n\n1. **`MOD(10, 3)`**: +10을 +3으로 나눈 나머지 (`MOD(10, 3)` ➔ `1`)\n2. **`MOD(10, -3)`**: +10을 -3으로 나눈 나머지 (`MOD(10, -3)` ➔ `1` 👈 **첫 인자가 양수이므로 +1!**)\n3. **`MOD(-10, 3)`**: -10을 +3으로 나눈 나머지 (`MOD(-10, 3)` ➔ `-1` 👈 **첫 인자가 음수이므로 -1!**)\n4. **`MOD(-10, -3)`**: -10을 -3으로 나눈 나머지 (`MOD(-10, -3)` ➔ `-1` 👈 **첫 인자가 음수이므로 -1!**)\n5. **`MOD(14, 5)`**: +14를 +5로 나눈 나머지 (`MOD(14, 5)` ➔ `4`)\n6. **`MOD(14, -5)`**: +14를 -5로 나눈 나머지 (`MOD(14, -5)` ➔ `4` 👈 **첫 인자가 양수이므로 +4!**)\n7. **`MOD(-14, 5)`**: -14를 +5로 나눈 나머지 (`MOD(-14, 5)` ➔ `-4` 👈 **첫 인자가 음수이므로 -4!**)\n8. **`MOD(-14, -5)`**: -14를 -5로 나눈 나머지 (`MOD(-14, -5)` ➔ `-4` 👈 **첫 인자가 음수이므로 -4!**)\n\n💡 **【SQLD 필수 암기: MOD의 부호 공식】**:\n- 공식: `MOD(n, m) = n - m * TRUNC(n / m)`\n- `MOD(n, m)` 연산 결과의 부호는 **오직 첫 번째 인자(피제수, n)의 부호**에 의해서만 결정되며, 두 번째 인자(m)의 부호는 결과에 아무런 영향을 주지 않습니다!',
    initialQuery: `SELECT MOD(10, 3) AS mod_10_3,\n       MOD(10, -3) AS mod_10_minus3,\n       MOD(-10, 3) AS mod_minus10_3,\n       MOD(-10, -3) AS mod_minus10_minus3,\n       MOD(14, 5) AS mod_14_5,\n       MOD(14, -5) AS mod_14_minus5,\n       MOD(-14, 5) AS mod_minus14_5,\n       MOD(-14, -5) AS mod_minus14_minus5\nFROM dual;`,
    solutionQuery: `SELECT MOD(10, 3) AS mod_10_3, MOD(10, -3) AS mod_10_minus3, MOD(-10, 3) AS mod_minus10_3, MOD(-10, -3) AS mod_minus10_minus3, MOD(14, 5) AS mod_14_5, MOD(14, -5) AS mod_14_minus5, MOD(-14, 5) AS mod_minus14_5, MOD(-14, -5) AS mod_minus14_minus5 FROM dual`,
    hint: '`MOD(10, 3)`, `MOD(10, -3)`, `MOD(-10, 3)`, `MOD(-10, -3)`, `MOD(14, 5)`, `MOD(14, -5)`, `MOD(-14, 5)`, `MOD(-14, -5)`를 작성하세요.',
    explanation:
      '【SQLD 필수 암기: MOD 부호 규칙】 MOD(n, m)의 결과 부호는 항상 첫 번째 인자 n의 부호를 따릅니다. MOD(10, -3) = 1 (첫 인자 10이 양수), MOD(-10, 3) = -1 (첫 인자 -10이 음수), MOD(-10, -3) = -1 (첫 인자 -10이 음수)입니다.',
    quickExamples: [
      {
        label: '짝수/홀수 판별: MOD(사번, 2)',
        query: `SELECT 101 AS num, MOD(101, 2) AS is_odd, 102 AS num2, MOD(102, 2) AS is_even FROM dual;`,
        description: 'MOD(n, 2) 결과가 1이면 홀수, 0이면 짝수',
      },
      {
        label: 'MOD(25, 7) vs MOD(-25, 7) vs MOD(25, -7)',
        query: `SELECT MOD(25, 7) AS pos_pos, MOD(-25, 7) AS neg_pos, MOD(25, -7) AS pos_neg FROM dual;`,
        description: '25%7=4, -25%7=-4, 25%-7=4 확인',
      },
    ],
    tryModifications: [
      {
        label: 'MOD(30, -7)과 MOD(-30, -7) 비교',
        query: `SELECT MOD(30, -7) AS plus_res, MOD(-30, -7) AS minus_res FROM dual;`,
        guide: 'MOD(30, -7)은 +2, MOD(-30, -7)은 -2가 되는 것을 직접 확인해 보세요!',
      },
      {
        label: 'MOD(7, 10) (피제수가 더 작은 경우)',
        query: `SELECT MOD(7, 10) AS mod_small_pos, MOD(-7, 10) AS mod_small_neg FROM dual;`,
        guide: '피제수가 더 작으면 나눌 수 없어 7 및 -7이 그대로 반환됨을 관찰해 보세요.',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 숫자 함수 > 하위 카테고리: 기타 주요 숫자 함수 (ABS, SIGN, POWER, SQRT)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-num-4',
    datasetId: 'sqld_sqlp',
    targetTable: 'dual',
    level: 1,
    category: '숫자 함수',
    subCategory: '기타 주요 숫자 함수 (ABS, SIGN, POWER, SQRT)',
    title: '[절대값, 부호, 거듭제곱] ABS, SIGN, POWER, SQRT, LOG',
    description:
      '오라클 가상 테이블 `DUAL`을 활용하여 자주 사용하는 유용한 숫자 함수들(`ABS`, `SIGN`, `POWER`, `SQRT`, `LOG`)을 실습합니다.\n\n1. **절대값 (`ABS`)**: 음수 `-25`의 절대값 (`ABS(-25)` ➔ `25`)\n2. **부호 판별 (`SIGN`)**: \n   - 음수 `-50` 판별 (`SIGN(-50)` ➔ `-1`)\n   - 숫자 `0` 판별 (`SIGN(0)` ➔ `0`)\n   - 양수 `100` 판별 (`SIGN(100)` ➔ `1`)\n3. **거듭제곱 (`POWER`)**: \n   - $2^3$ 계산 (`POWER(2, 3)` ➔ `8`)\n   - $10^3$ 계산 (`POWER(10, 3)` ➔ `1000`)\n4. **제곱근/루트 (`SQRT`)**: \n   - $\\sqrt{25}$ 계산 (`SQRT(25)` ➔ `5`)\n   - $\\sqrt{144}$ 계산 (`SQRT(144)` ➔ `12`)\n5. **상용로그 (`LOG`)**: $\\log_{10}(100)$ 계산 (`LOG(10, 100)` ➔ `2`)\n\n💡 **핵심 관전 포인트**:\n- `SIGN(n)`은 숫자가 양수면 `1`, 0이면 `0`, 음수면 `-1`을 반환하여 `CASE WHEN`이나 조건문에서 부호 판별에 유용하게 쓰입니다.\n- `POWER(n, p)`에서 `p`가 음수이면 역수($2^{-1} = 0.5$)가 계산되고, `0.5`이면 제곱근($4^{0.5} = 2$)이 계산됩니다.',
    initialQuery: `SELECT ABS(-25) AS abs_val,\n       SIGN(-50) AS sign_neg,\n       SIGN(0) AS sign_zero,\n       SIGN(100) AS sign_pos,\n       POWER(2, 3) AS power_2_cube,\n       POWER(10, 3) AS power_10_cube,\n       SQRT(25) AS sqrt_25,\n       SQRT(144) AS sqrt_144,\n       LOG(10, 100) AS log_10_100\nFROM dual;`,
    solutionQuery: `SELECT ABS(-25) AS abs_val, SIGN(-50) AS sign_neg, SIGN(0) AS sign_zero, SIGN(100) AS sign_pos, POWER(2, 3) AS power_2_cube, POWER(10, 3) AS power_10_cube, SQRT(25) AS sqrt_25, SQRT(144) AS sqrt_144, LOG(10, 100) AS log_10_100 FROM dual`,
    hint: '`ABS(-25)`, `SIGN(-50)`, `SIGN(0)`, `SIGN(100)`, `POWER(2, 3)`, `POWER(10, 3)`, `SQRT(25)`, `SQRT(144)`, `LOG(10, 100)`을 작성하세요.',
    explanation:
      '1. ABS(n): n의 절대값을 반환합니다.\n2. SIGN(n): n의 부호를 반환합니다. (양수=1, 0=0, 음수=-1)\n3. POWER(m, n): m의 n승 거듭제곱을 반환합니다.\n4. SQRT(n): n의 제곱근(루트)을 반환합니다.\n5. LOG(base, n): 밑이 base인 n의 로그값을 반환합니다.',
    quickExamples: [
      {
        label: 'POWER(2, -1) (역수 0.5) & POWER(16, 0.5) (루트 4)',
        query: `SELECT POWER(2, -1) AS power_inv, POWER(16, 0.5) AS power_root FROM dual;`,
        description: '지수법칙을 활용한 분수/소수 거듭제곱 계산',
      },
      {
        label: 'EXP(1) (자연상수 e) & LN(EXP(1)) (자연로그)',
        query: `SELECT EXP(1) AS natural_e, LN(EXP(1)) AS ln_e FROM dual;`,
        description: '오라클 지수함수 EXP와 자연로그 함수 LN 실습',
      },
    ],
    tryModifications: [
      {
        label: 'SIGN 함수로 두 값의 대소 비교 (sal1 - sal2)',
        query: `SELECT SIGN(3000 - 2000) AS bigger, SIGN(2000 - 3000) AS smaller, SIGN(2000 - 2000) AS equal FROM dual;`,
        guide: 'A - B의 SIGN 결과가 1이면 A>B, -1이면 A<B, 0이면 A=B임을 확인해 보세요!',
      },
      {
        label: 'POWER(2, 10) (1024) 계산',
        query: `SELECT POWER(2, 10) AS power_2_10 FROM dual;`,
        guide: '2의 10승인 1024가 정확히 출력되는지 확인해 보세요.',
      },
    ],
  },

  // =========================================================================
  // 대분류: 날짜 함수 (Date Functions) - DUAL 테이블 활용
  // =========================================================================

  // -------------------------------------------------------------------------
  // 카테고리: 날짜 함수 > 하위 카테고리: 현재 날짜와 날짜 연산 (SYSDATE, +, -)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-date-1',
    datasetId: 'sqld_sqlp',
    targetTable: 'dual',
    level: 1,
    category: '날짜 함수',
    subCategory: '현재 날짜와 날짜 연산 (SYSDATE, +, -)',
    title: '[현재 날짜와 날짜 연산] SYSDATE, 일/시간 단위 가감산',
    description:
      "오라클 가상 테이블 `DUAL`을 활용하여 현재 일시를 반환하는 `SYSDATE`와 날짜 산술 연산자(`+`, `-`)를 실습합니다.\n\n오라클에서 날짜에 숫자를 더하거나 빼면 **기본 단위가 1일(Day)**로 계산됩니다.\n\n1. **현재 일시 (`SYSDATE`)**: 현재 시스템 날짜와 시간 반환 (별칭 `now_time`)\n2. **1일 뒤 (내일)**: `SYSDATE + 1` (별칭 `tomorrow`)\n3. **7일 전 (1주일 전)**: `SYSDATE - 7` (별칭 `last_week`)\n4. **1시간 뒤**: 1일을 24로 나눈 값 더하기 (`SYSDATE + 1/24`의 별칭 `after_1hour`)\n5. **100분 뒤**: 1일을 24시간*60분으로 나눈 값에 100 곱하기 (`SYSDATE + 100/(24*60)`의 별칭 `after_100mins`)\n6. **날짜 간의 차이 (일수 계산)**: `DATE '2026-08-25' - DATE '2026-08-15'` (별칭 `day_diff` ➔ `10`)\n\n💡 **핵심 관전 포인트**:\n- `날짜 + 숫자` = 날짜 (n일 후)\n- `날짜 - 숫자` = 날짜 (n일 전)\n- `날짜 - 날짜` = **일수(Day) 차이** (숫자 반환)\n- `날짜 + 1/24` = 1시간 후, `날짜 + 1/(24*60)` = 1분 후, `날짜 + 1/(24*60*60)` = 1초 후",
    initialQuery: `SELECT SYSDATE() AS now_time,\n       SYSDATE() + 1 AS tomorrow,\n       SYSDATE() - 7 AS last_week,\n       SYSDATE() + 1/24 AS after_1hour,\n       DATE '2026-08-25' - DATE '2026-08-15' AS day_diff\nFROM dual;`,
    solutionQuery: `SELECT SYSDATE() AS now_time, SYSDATE() + 1 AS tomorrow, SYSDATE() - 7 AS last_week, SYSDATE() + 1/24 AS after_1hour, DATE '2026-08-25' - DATE '2026-08-15' AS day_diff FROM dual`,
    hint: "`SYSDATE()`, `SYSDATE() + 1`, `SYSDATE() - 7`, `SYSDATE() + 1/24`, `DATE '2026-08-25' - DATE '2026-08-15'`를 작성하세요.",
    explanation:
      '1. SYSDATE: 현재 시스템의 날짜와 시간을 반환합니다.\n2. 날짜의 산술 연산 단위는 1일(Day)입니다. 1시간은 1/24일, 1분은 1/(24*60)일입니다.\n3. 날짜에서 날짜를 빼면 두 날짜 사이의 일수(숫자)가 반환됩니다.',
    quickExamples: [
      {
        label: '100일 뒤 기념일 계산 (SYSDATE + 100)',
        query: `SELECT SYSDATE() AS today, SYSDATE() + 100 AS day_100_after FROM dual;`,
        description: '현재 날짜에서 100일을 더한 미래 날짜 계산',
      },
      {
        label: '올해 1월 1일부터 오늘까지 경과 일수',
        query: `SELECT DATE '2026-08-25' - DATE '2026-01-01' AS days_passed_this_year FROM dual;`,
        description: '2026년 1월 1일부터 8월 25일까지의 총 일수(236일) 계산',
      },
    ],
    tryModifications: [
      {
        label: '30일 전 날짜 계산',
        query: `SELECT SYSDATE() - 30 AS days_30_ago FROM dual;`,
        guide: 'SYSDATE - 30으로 수정하여 한 달 전 날짜를 계산해 보세요!',
      },
      {
        label: '30분 뒤 시간 계산 (30 / (24*60))',
        query: `SELECT SYSDATE() + 30/(24*60) AS after_30min FROM dual;`,
        guide: '분 단위 시간 계산을 실습해 보세요.',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 날짜 함수 > 하위 카테고리: 날짜 요소 추출 (EXTRACT)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-date-2',
    datasetId: 'sqld_sqlp',
    targetTable: 'dual',
    level: 1,
    category: '날짜 함수',
    subCategory: '날짜 요소 추출 (EXTRACT)',
    title: '[날짜 요소 추출] EXTRACT 함수 (YEAR, MONTH, DAY)',
    description:
      "오라클 표준 `EXTRACT` 함수를 활용하여 날짜 또는 시간 데이터에서 특정 요소(년, 월, 일, 시, 분, 초)를 숫자형으로 추출합니다.\n\n1. **연도 추출 (`YEAR`)**: `'2026-08-25'`에서 연도 추출 (`EXTRACT('YEAR', '2026-08-25')` ➔ `2026`)\n2. **월 추출 (`MONTH`)**: `'2026-08-25'`에서 월 추출 (`EXTRACT('MONTH', '2026-08-25')` ➔ `8`)\n3. **일 추출 (`DAY`)**: `'2026-08-25'`에서 일 추출 (`EXTRACT('DAY', '2026-08-25')` ➔ `25`)\n4. **현재 연도 (`cur_yr`)**: `EXTRACT('YEAR', SYSDATE())`\n5. **현재 월 (`cur_mo`)**: `EXTRACT('MONTH', SYSDATE())`\n6. **현재 일 (`cur_dy`)**: `EXTRACT('DAY', SYSDATE())`\n\n💡 **핵심 관전 포인트**:\n- `EXTRACT` 함수는 `DATE` 또는 `TIMESTAMP` 타입에서 지정한 필드(YEAR, MONTH, DAY 등)를 **숫자(NUMBER) 타입**으로 반환합니다.\n- `TO_CHAR(date, 'YYYY')`는 문자열(`VARCHAR2`)을 반환하는 반면, `EXTRACT`는 숫자(`NUMBER`)를 반환하는 차이점이 있습니다.",
    initialQuery: `SELECT EXTRACT('YEAR', '2026-08-25') AS yr,\n       EXTRACT('MONTH', '2026-08-25') AS mo,\n       EXTRACT('DAY', '2026-08-25') AS dy,\n       EXTRACT('YEAR', SYSDATE()) AS cur_yr,\n       EXTRACT('MONTH', SYSDATE()) AS cur_mo,\n       EXTRACT('DAY', SYSDATE()) AS cur_dy\nFROM dual;`,
    solutionQuery: `SELECT EXTRACT('YEAR', '2026-08-25') AS yr, EXTRACT('MONTH', '2026-08-25') AS mo, EXTRACT('DAY', '2026-08-25') AS dy, EXTRACT('YEAR', SYSDATE()) AS cur_yr, EXTRACT('MONTH', SYSDATE()) AS cur_mo, EXTRACT('DAY', SYSDATE()) AS cur_dy FROM dual`,
    hint: "`EXTRACT('YEAR', '2026-08-25')`, `EXTRACT('MONTH', '2026-08-25')`, `EXTRACT('DAY', '2026-08-25')`를 작성하세요.",
    explanation:
      'EXTRACT(field FROM date_expr): 날짜/시간 값에서 특정 필드(YEAR, MONTH, DAY, HOUR, MINUTE, SECOND)를 추출하여 숫자 형태로 반환합니다.',
    quickExamples: [
      {
        label: '입사일자에서 연도/월만 분리 추출',
        query: `SELECT EXTRACT('YEAR', '1981-11-17') AS hire_year, EXTRACT('MONTH', '1981-11-17') AS hire_month FROM dual;`,
        description: '킹(KING)의 입사일 1981-11-17에서 연도(1981)와 월(11) 추출',
      },
      {
        label: '현재 시간/분 추출 (HOUR, MINUTE)',
        query: `SELECT EXTRACT('HOUR', SYSDATE()) AS cur_hour, EXTRACT('MINUTE', SYSDATE()) AS cur_min FROM dual;`,
        description: '현재 시스템 시간과 분 추출',
      },
    ],
    tryModifications: [
      {
        label: '생년월일(1995-05-05)의 어린이날 일(Day) 추출',
        query: `SELECT EXTRACT('DAY', '1995-05-05') AS birth_day FROM dual;`,
        guide: '날짜를 변경하여 원하는 일자가 숫자로 추출되는지 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 날짜 함수 > 하위 카테고리: 월 단위 연산과 월말/요일 (ADD_MONTHS, LAST_DAY, NEXT_DAY)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-date-3',
    datasetId: 'sqld_sqlp',
    targetTable: 'dual',
    level: 1,
    category: '날짜 함수',
    subCategory: '월 단위 연산과 월말/요일 (ADD_MONTHS, LAST_DAY, NEXT_DAY)',
    title: '[월 단위 연산과 월말/요일] ADD_MONTHS, MONTHS_BETWEEN, LAST_DAY, NEXT_DAY',
    description:
      "오라클 가상 테이블 `DUAL`을 활용하여 월 단위 가감산 및 월말/요일 관련 날짜 함수들을 실습합니다.\n\n1. **`ADD_MONTHS` [3개월 뒤]**: `'2026-08-25'`에서 3개월 더하기 (`ADD_MONTHS('2026-08-25', 3)` ➔ `'2026-11-25'`)\n2. **`ADD_MONTHS` [6개월 전]**: `'2026-08-25'`에서 6개월 빼기 (`ADD_MONTHS('2026-08-25', -6)` ➔ `'2026-02-25'`)\n3. **`ADD_MONTHS` [월말 자동 보정 규칙]**: `'2026-01-31'`에 1개월 더하면 2월 말일로 보정 (`ADD_MONTHS('2026-01-31', 1)` ➔ `'2026-02-28'`)\n4. **`MONTHS_BETWEEN` [개월 수 차이]**: 8월 25일과 5월 25일 사이의 개월 수 (`MONTHS_BETWEEN('2026-08-25', '2026-05-25')` ➔ `3`)\n5. **`LAST_DAY` [2월 말일]**: `'2026-02-10'`의 해당 월 마지막 날짜 (`LAST_DAY('2026-02-10')` ➔ `'2026-02-28'`)\n6. **`LAST_DAY` [8월 말일]**: `'2026-08-25'`의 해당 월 마지막 날짜 (`LAST_DAY('2026-08-25')` ➔ `'2026-08-31'`)\n7. **`NEXT_DAY` [다음 월요일]**: `'2026-08-25'` 이후의 첫 번째 월요일 날짜 (별칭 `next_monday`)\n\n💡 **핵심 관전 포인트**:\n- `ADD_MONTHS`는 윤달 및 월말 일수 차이(30일/31일/28일)를 자동으로 계산하여 날짜 오버플로우를 방지합니다.\n- `MONTHS_BETWEEN(d1, d2)`는 `d1 > d2`이면 양수, `d1 < d2`이면 음수를 반환합니다.",
    initialQuery: `SELECT ADD_MONTHS('2026-08-25', 3) AS add_3months,\n       ADD_MONTHS('2026-08-25', -6) AS sub_6months,\n       ADD_MONTHS('2026-01-31', 1) AS feb_last_adjust,\n       MONTHS_BETWEEN('2026-08-25', '2026-05-25') AS diff_months,\n       LAST_DAY('2026-02-10') AS feb_last_day,\n       LAST_DAY('2026-08-25') AS aug_last_day,\n       NEXT_DAY('2026-08-25', 'MON') AS next_monday\nFROM dual;`,
    solutionQuery: `SELECT ADD_MONTHS('2026-08-25', 3) AS add_3months, ADD_MONTHS('2026-08-25', -6) AS sub_6months, ADD_MONTHS('2026-01-31', 1) AS feb_last_adjust, MONTHS_BETWEEN('2026-08-25', '2026-05-25') AS diff_months, LAST_DAY('2026-02-10') AS feb_last_day, LAST_DAY('2026-08-25') AS aug_last_day, NEXT_DAY('2026-08-25', 'MON') AS next_monday FROM dual`,
    hint: "`ADD_MONTHS('2026-08-25', 3)`, `MONTHS_BETWEEN('2026-08-25', '2026-05-25')`, `LAST_DAY('2026-02-10')`, `NEXT_DAY('2026-08-25', 'MON')`를 작성하세요.",
    explanation:
      '1. ADD_MONTHS(d, n): 날짜 d에 n개월을 더하거나 뺍니다. 월말일 경우 대상 월의 마지막 날짜로 자동 보정됩니다.\n2. MONTHS_BETWEEN(d1, d2): 날짜 d1과 d2 사이의 개월 수 차이를 반환합니다.\n3. LAST_DAY(d): 날짜 d가 속한 월의 마지막 날짜를 반환합니다.\n4. NEXT_DAY(d, char): 날짜 d 이후의 첫 번째 지정 요일 날짜를 반환합니다.',
    quickExamples: [
      {
        label: '1년 뒤 (12개월 추가) 날짜 계산',
        query: `SELECT ADD_MONTHS('2026-08-25', 12) AS one_year_later FROM dual;`,
        description: 'ADD_MONTHS에 12를 전달하여 1년 후 날짜(2027-08-25) 계산',
      },
      {
        label: '윤년 2월 29일 말일 확인 (2024년 윤년)',
        query: `SELECT LAST_DAY('2024-02-01') AS leap_feb_last FROM dual;`,
        description: '2024년 2월의 마지막 날이 2024-02-29로 계산됨을 확인',
      },
    ],
    tryModifications: [
      {
        label: 'NEXT_DAY로 다음 주 금요일(FRI) 구하기',
        query: `SELECT NEXT_DAY('2026-08-25', 'FRI') AS next_friday FROM dual;`,
        guide: '요일을 FRI(금요일) 또는 SUN(일요일)으로 변경해 보세요!',
      },
      {
        label: '입사 후 근무 개월 수 계산',
        query: `SELECT MONTHS_BETWEEN('2026-08-25', '2024-08-25') AS work_months FROM dual;`,
        guide: '정확히 24개월(2년)이 계산되는지 확인해 보세요.',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 날짜 함수 > 하위 카테고리: 날짜 절삭과 반올림 (TRUNC, ROUND)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-date-4',
    datasetId: 'sqld_sqlp',
    targetTable: 'dual',
    level: 2,
    category: '날짜 함수',
    subCategory: '날짜 절삭과 반올림 (TRUNC, ROUND)',
    title: '[날짜 절삭과 반올림] TRUNC vs ROUND (년도/월 단위 포맷 비교)',
    description:
      "**【SQLD 핵심 빈출 원리: 날짜의 TRUNC와 ROUND】**\n오라클 가상 테이블 `DUAL`을 활용하여 날짜를 지정한 포맷 단위(년, 월, 일)로 절삭(`TRUNC`)하거나 반올림(`ROUND`)하는 원리를 비교합니다.\n\n1. **`TRUNC` [년도 절삭 ('YYYY')]**: `'2026-08-25'`를 해당 년도 1월 1일로 절삭 (`TRUNC('2026-08-25', 'YYYY')` ➔ `'2026-01-01'`)\n2. **`TRUNC` [월 절삭 ('MM')]**: `'2026-08-25'`를 해당 월 1일로 절삭 (`TRUNC('2026-08-25', 'MM')` ➔ `'2026-08-01'`)\n3. **`ROUND` [월 반올림 올림 ('MM')]**: `'2026-08-25'`는 16일 이상이므로 다음 달 1일로 올림 (`ROUND('2026-08-25', 'MM')` ➔ `'2026-09-01'`)\n4. **`ROUND` [월 반올림 버림 ('MM')]**: `'2026-08-10'`은 15일 이하이므로 당월 1일로 버림 (`ROUND('2026-08-10', 'MM')` ➔ `'2026-08-01'`)\n5. **`ROUND` [년도 반올림 올림 ('YYYY')]**: `'2026-08-25'`는 7월 이상이므로 다음 해 1월 1일로 올림 (`ROUND('2026-08-25', 'YYYY')` ➔ `'2027-01-01'`)\n6. **`ROUND` [년도 반올림 버림 ('YYYY')]**: `'2026-04-10'`은 6월 이하이므로 당해 년도 1월 1일로 버림 (`ROUND('2026-04-10', 'YYYY')` ➔ `'2026-01-01'`)\n\n💡 **【SQLD 필수 암기: 날짜 ROUND 기준선】**:\n- **월('MM') 기준 반올림**: 1~15일 ➔ 당월 1일 / **16일~말일 ➔ 다음 달 1일**\n- **년('YYYY') 기준 반올림**: 1~6월 ➔ 당해 년도 1월 1일 / **7~12월 ➔ 다음 해 1월 1일**",
    initialQuery: `SELECT TRUNC('2026-08-25', 'YYYY') AS trunc_year,\n       TRUNC('2026-08-25', 'MM') AS trunc_month,\n       ROUND('2026-08-25', 'MM') AS round_month_up,\n       ROUND('2026-08-10', 'MM') AS round_month_down,\n       ROUND('2026-08-25', 'YYYY') AS round_year_up,\n       ROUND('2026-04-10', 'YYYY') AS round_year_down\nFROM dual;`,
    solutionQuery: `SELECT TRUNC('2026-08-25', 'YYYY') AS trunc_year, TRUNC('2026-08-25', 'MM') AS trunc_month, ROUND('2026-08-25', 'MM') AS round_month_up, ROUND('2026-08-10', 'MM') AS round_month_down, ROUND('2026-08-25', 'YYYY') AS round_year_up, ROUND('2026-04-10', 'YYYY') AS round_year_down FROM dual`,
    hint: "`TRUNC('2026-08-25', 'YYYY')`, `TRUNC('2026-08-25', 'MM')`, `ROUND('2026-08-25', 'MM')`, `ROUND('2026-08-10', 'MM')`, `ROUND('2026-08-25', 'YYYY')`를 작성하세요.",
    explanation:
      '1. TRUNC(date, format): date를 format 단위로 잘라냅니다. (YYYY는 1월 1일, MM은 1일)\n2. ROUND(date, format): MM 포맷은 16일 이상이면 익월 1일로 올림, YYYY 포맷은 7월 1일 이상이면 익년 1월 1일로 올림합니다.',
    quickExamples: [
      {
        label: '16일 기준 월 반올림 경계 테스트 (15일 vs 16일)',
        query: `SELECT ROUND('2026-08-15', 'MM') AS mid_15th, ROUND('2026-08-16', 'MM') AS mid_16th FROM dual;`,
        description: '15일은 2026-08-01(버림), 16일은 2026-09-01(올림) 확인',
      },
      {
        label: '6월 30일 vs 7월 1일 연도 반올림 경계 테스트',
        query: `SELECT ROUND('2026-06-30', 'YYYY') AS mid_jun, ROUND('2026-07-01', 'YYYY') AS mid_jul FROM dual;`,
        description: '6월 30일은 2026-01-01, 7월 1일은 2027-01-01 확인',
      },
    ],
    tryModifications: [
      {
        label: '현재 날짜(SYSDATE)의 월초(1일) 구하기',
        query: `SELECT TRUNC(SYSDATE(), 'MM') AS this_month_first_day FROM dual;`,
        guide: 'TRUNC(SYSDATE, "MM")을 사용하면 이번 달 1일이 바로 추출되는 것을 확인해 보세요!',
      },
    ],
  },

  // =========================================================================
  // 대분류: 변환 함수 (Conversion Functions) - DUAL 테이블 활용
  // =========================================================================

  // -------------------------------------------------------------------------
  // 카테고리: 변환 함수 > 하위 카테고리: 명시적 형변환 (TO_CHAR)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-conv-1',
    datasetId: 'sqld_sqlp',
    targetTable: 'dual',
    level: 1,
    category: '변환 함수',
    subCategory: '명시적 형변환 (TO_CHAR)',
    title: '[명시적 형변환] TO_CHAR 함수 (숫자 및 날짜 포맷팅 완전 정복)',
    description:
      "오라클 가상 테이블 `DUAL`을 활용하여 숫자와 날짜 데이터를 원하는 문자열 형식으로 변환하는 `TO_CHAR` 함수를 실습합니다.\n\n1. **숫자 천 단위 콤마 (`num_comma`)**: `TO_CHAR(1234567, '999,999,999')` ➔ `'1,234,567'`\n2. **숫자 0 패딩 (`num_zero_pad`)**: `TO_CHAR(12345, '000000')` ➔ `'012345'` (빈자리를 0으로 채움)\n3. **원화 통화 기호 (`num_won_currency`)**: `TO_CHAR(1234567, 'L9,999,999')` ➔ `'₩1,234,567'` (`L`은 지역 통화 기호)\n4. **날짜 YYYY-MM-DD (`date_ymd`)**: `TO_CHAR(DATE '2026-08-25', 'YYYY-MM-DD')` ➔ `'2026-08-25'`\n5. **날짜와 요일 (`date_ymd_day`)**: `TO_CHAR(DATE '2026-08-25', 'YYYY/MM/DD DAY')` ➔ `'2026/08/25 화요일'`\n6. **날짜 분기 추출 (`date_quarter`)**: `TO_CHAR(DATE '2026-08-25', 'Q')` ➔ `'3'` (3분기)\n\n💡 **핵심 관전 포인트**:\n- 숫자 포맷에서 `9`는 유효 자릿수를 의미하며 남는 자리는 공백으로 처리되고, `0`은 빈자리를 0으로 강제 출력합니다.\n- 날짜 포맷에서 `YYYY`는 4자리 연도, `MM`은 2자리 월, `DD`는 일, `DAY`는 요일, `Q`는 분기(1~4)를 의미합니다.",
    initialQuery: `SELECT TO_CHAR(1234567, '999,999,999') AS num_comma,\n       TO_CHAR(12345, '000000') AS num_zero_pad,\n       TO_CHAR(1234567, 'L9,999,999') AS num_won_currency,\n       TO_CHAR(DATE '2026-08-25', 'YYYY-MM-DD') AS date_ymd,\n       TO_CHAR(DATE '2026-08-25', 'YYYY/MM/DD DAY') AS date_ymd_day,\n       TO_CHAR(DATE '2026-08-25', 'Q') AS date_quarter\nFROM dual;`,
    solutionQuery: `SELECT TO_CHAR(1234567, '999,999,999') AS num_comma, TO_CHAR(12345, '000000') AS num_zero_pad, TO_CHAR(1234567, 'L9,999,999') AS num_won_currency, TO_CHAR(DATE '2026-08-25', 'YYYY-MM-DD') AS date_ymd, TO_CHAR(DATE '2026-08-25', 'YYYY/MM/DD DAY') AS date_ymd_day, TO_CHAR(DATE '2026-08-25', 'Q') AS date_quarter FROM dual`,
    hint: "`TO_CHAR(1234567, '999,999,999')`, `TO_CHAR(12345, '000000')`, `TO_CHAR(DATE '2026-08-25', 'YYYY-MM-DD')`, `TO_CHAR(DATE '2026-08-25', 'Q')`를 작성하세요.",
    explanation:
      "1. TO_CHAR(n, 'fmt'): 숫자를 포맷에 맞는 문자열로 변환합니다. (9는 숫자, 0은 빈자리 0, L은 통화기호)\n2. TO_CHAR(d, 'fmt'): 날짜를 포맷에 맞는 문자열로 변환합니다. (YYYY, MM, DD, DAY, DY, HH24, MI, SS, Q)",
    quickExamples: [
      {
        label: '현재 시간 24시간 형식 출력 (HH24:MI:SS)',
        query: `SELECT TO_CHAR(SYSDATE(), 'YYYY-MM-DD HH24:MI:SS') AS full_datetime FROM dual;`,
        description: '현재 시스템의 연-월-일 시:분:초 포맷팅 출력',
      },
      {
        label: '달러($) 통화 기호 포맷팅',
        query: `SELECT TO_CHAR(50000, '$999,999') AS salary_dollar FROM dual;`,
        description: '$50,000으로 출력되는 달러 포맷팅',
      },
    ],
    tryModifications: [
      {
        label: '요일 약어(DY) 포맷으로 변경',
        query: `SELECT TO_CHAR(DATE '2026-08-25', 'YYYY-MM-DD (DY)') AS ymd_dy FROM dual;`,
        guide: 'DAY 대신 DY를 지정하여 "2026-08-25 (화)"로 출력되는지 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 변환 함수 > 하위 카테고리: 명시적 형변환 (TO_NUMBER, TO_DATE)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-conv-2',
    datasetId: 'sqld_sqlp',
    targetTable: 'dual',
    level: 1,
    category: '변환 함수',
    subCategory: '명시적 형변환 (TO_NUMBER, TO_DATE)',
    title: '[명시적 형변환] TO_NUMBER & TO_DATE 함수 (문자열의 숫자/날짜 변환)',
    description:
      "오라클 가상 테이블 `DUAL`을 활용하여 문자열을 정확한 숫자(`NUMBER`) 및 날짜(`DATE`) 타입으로 명시적 변환하는 `TO_NUMBER`와 `TO_DATE`를 실습합니다.\n\n1. **순수 숫자 문자열 변환 (`pure_num`)**: `TO_NUMBER('12345')` ➔ 숫자 `12345`\n2. **콤마 포함된 문자열 변환 (`comma_num`)**: `TO_NUMBER('1,234,567', '9,999,999')` ➔ 숫자 `1234567`\n3. **달러 기호 포함 문자열 변환 (`dollar_num`)**: `TO_NUMBER('$500', '$999')` ➔ 숫자 `500`\n4. **8자리 문자열 날짜 변환 (`date_from_ymd`)**: `TO_DATE('20260825', 'YYYYMMDD')` ➔ 날짜 `'2026-08-25'`\n5. **구분자 포함 문자열 날짜 변환 (`date_from_str`)**: `TO_DATE('2026-08-25', 'YYYY-MM-DD')` ➔ 날짜 `'2026-08-25'`\n\n💡 **핵심 관전 포인트**:\n- `TO_NUMBER`를 사용하면 콤마(`,`)나 통화 기호(`$`, `₩`)가 포함된 문자열 데이터를 깨끗한 숫자형으로 변환하여 사칙연산을 수행할 수 있습니다.\n- `TO_DATE`는 외부 시스템에서 넘어온 다양한 포맷의 문자열을 표준 날짜 타입으로 안전하게 변환합니다.",
    initialQuery: `SELECT TO_NUMBER('12345') AS pure_num,\n       TO_NUMBER('1,234,567', '9,999,999') AS comma_num,\n       TO_NUMBER('$500', '$999') AS dollar_num,\n       TO_DATE('20260825', 'YYYYMMDD') AS date_from_ymd,\n       TO_DATE('2026-08-25', 'YYYY-MM-DD') AS date_from_str\nFROM dual;`,
    solutionQuery: `SELECT TO_NUMBER('12345') AS pure_num, TO_NUMBER('1,234,567', '9,999,999') AS comma_num, TO_NUMBER('$500', '$999') AS dollar_num, TO_DATE('20260825', 'YYYYMMDD') AS date_from_ymd, TO_DATE('2026-08-25', 'YYYY-MM-DD') AS date_from_str FROM dual`,
    hint: "`TO_NUMBER('12345')`, `TO_NUMBER('1,234,567', '9,999,999')`, `TO_DATE('20260825', 'YYYYMMDD')`를 작성하세요.",
    explanation:
      '1. TO_NUMBER(str, [fmt]): 문자열 str을 포맷 형식에 맞춰 숫자(NUMBER)로 변환합니다.\n2. TO_DATE(str, [fmt]): 문자열 str을 포맷 형식에 맞춰 날짜(DATE)로 변환합니다.',
    quickExamples: [
      {
        label: '변환된 숫자로 덧셈 연산 수행',
        query: `SELECT TO_NUMBER('1,500', '9,999') + TO_NUMBER('2,500', '9,999') AS total_sum FROM dual;`,
        description: '문자열 1,500과 2,500을 숫자로 변환 후 합산(4000) 계산',
      },
      {
        label: 'TO_DATE로 변환 후 10일 더하기',
        query: `SELECT TO_DATE('20260825', 'YYYYMMDD') + 10 AS date_plus_10 FROM dual;`,
        description: '문자열을 날짜로 변환한 뒤 날짜 산술 연산(+10일) 적용',
      },
    ],
    tryModifications: [
      {
        label: '원화 기호(₩) 포함 문자열 변환',
        query: `SELECT TO_NUMBER('₩300,000') AS won_to_num FROM dual;`,
        guide: '원화 기호가 붙은 문자열도 숫자로 잘 파싱되는지 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 변환 함수 > 하위 카테고리: 암시적 형변환의 원리
  // -------------------------------------------------------------------------
  {
    id: 'sqld-conv-3',
    datasetId: 'sqld_sqlp',
    targetTable: 'dual',
    level: 2,
    category: '변환 함수',
    subCategory: '암시적 형변환의 원리',
    title: '[암시적 형변환] DBMS의 자동 형변환 원리와 연산자별 우선순위',
    description:
      "**【SQLD 최고 빈출 핵심 문제: 암시적(묵시적) 형변환의 동작 원리】**\nDBMS는 사용자가 명시적으로 변환 함수를 쓰지 않아도 연산자의 성격에 맞춰 데이터 타입을 자동으로 변환합니다.\n\n1. **산술 연산자 덧셈 (`+`)**: `'100' + 200`\n   - 문자열 `'100'`이 **숫자 `100`으로 자동 변환**되어 `300` 계산 (별칭 `implicit_math_add`)\n2. **산술 연산자 뺄셈 (`-`)**: `'500' - '200'`\n   - 두 문자열 모두 **숫자로 자동 변환**되어 `300` 계산 (별칭 `implicit_math_sub`)\n3. **산술 연산자 곱셈 (`*`)**: `'10' * 5`\n   - 문자열 `'10'`이 **숫자 `10`으로 자동 변환**되어 `50` 계산 (별칭 `implicit_math_mul`)\n4. **문자열 연결 연산자 (`||`)**: `'100' || 200`\n   - 숫자 `200`이 **문자열 `'200'`으로 자동 변환**되어 `'100200'` 연결 (별칭 `implicit_concat_str`)\n5. **숫자 간의 연결 연산자 (`||`)**: `100 || 200`\n   - 두 숫자 모두 **문자열로 자동 변환**되어 `'100200'` 연결 (별칭 `implicit_concat_both`)\n\n💡 **【SQLD 필수 암기: 암시적 형변환 우선순위 규칙】**:\n- **산술 연산자(`+`, `-`, `*`, `/`)**: 문자와 숫자가 만나면 **숫자(NUMBER)가 우선**합니다. (문자 ➔ 숫자로 변환)\n- **연결 연산자(`||`)**: 문자와 숫자가 만나면 **문자(VARCHAR2)가 우선**합니다. (숫자 ➔ 문자로 변환)",
    initialQuery: `SELECT '100' + 200 AS implicit_math_add,\n       '500' - '200' AS implicit_math_sub,\n       '10' * 5 AS implicit_math_mul,\n       '100' || 200 AS implicit_concat_str,\n       100 || 200 AS implicit_concat_both\nFROM dual;`,
    solutionQuery: `SELECT '100' + 200 AS implicit_math_add, '500' - '200' AS implicit_math_sub, '10' * 5 AS implicit_math_mul, '100' || 200 AS implicit_concat_str, 100 || 200 AS implicit_concat_both FROM dual`,
    hint: "`'100' + 200`, `'500' - '200'`, `'10' * 5`, `'100' || 200`, `100 || 200`을 작성하세요.",
    explanation:
      "1. 산술 연산자(+, -, *, /)는 피연산자들을 숫자로 자동 변환합니다. ('100' + 200 = 300)\n2. 문자열 연결 연산자(||)는 피연산자들을 문자로 자동 변환합니다. ('100' || 200 = '100200')",
    quickExamples: [
      {
        label: "문자열 '50'과 숫자 2의 나눗셈 ('50' / 2)",
        query: `SELECT '50' / 2 AS implicit_div FROM dual;`,
        description: "문자열 '50'이 숫자로 자동 변환되어 25로 계산됨 확인",
      },
    ],
    tryModifications: [
      {
        label: '숫자 10과 20의 덧셈 vs 연결 비교',
        query: `SELECT 10 + 20 AS math_sum, 10 || 20 AS str_concat FROM dual;`,
        guide: '+는 산술 연산(30), ||는 문자열 결합(1020)으로 변환되는 차이를 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 변환 함수 > 하위 카테고리: 명시적 vs 암시적 형변환 비교
  // -------------------------------------------------------------------------
  {
    id: 'sqld-conv-4',
    datasetId: 'sqld_sqlp',
    targetTable: 'dual',
    level: 2,
    category: '변환 함수',
    subCategory: '명시적 vs 암시적 형변환 비교',
    title: '[형변환 종합 비교] 명시적 형변환 vs 암시적 형변환 (성능 & 에러 위험성)',
    description:
      "**【SQLD 핵심 이론: 왜 실무와 시험에서 명시적 형변환을 권장하는가?】**\n암시적 형변환과 명시적 형변환의 차이와 위험성을 대비하여 실습합니다.\n\n1. **암시적 덧셈**: `'100' + 200` (별칭 `implicit_add` ➔ `300`)\n2. **명시적 덧셈**: `TO_NUMBER('100') + 200` (별칭 `explicit_add` ➔ `300`)\n3. **단순 문자열 날짜**: `'2026-08-25'` (별칭 `str_date`)\n4. **명시적 날짜 변환**: `TO_DATE('2026-08-25', 'YYYY-MM-DD')` (별칭 `explicit_date`)\n5. **명시적 통화 포맷 변환**: `TO_CHAR(1000, 'L9,999')` (별칭 `explicit_won_str`)\n\n💡 **【암시적 형변환의 3대 치명적 문제점】**:\n1. **성능 저하 및 인덱스 미사용 (Full Table Scan)**: 인덱스가 생성된 컬럼에 암시적 형변환이 발생하면(`WHERE empno = '1001'`), DBMS가 컬럼을 내부적으로 변형하여 **인덱스를 타지 못하고 전체 테이블을 검색**하게 됩니다.\n2. **런타임 에러 발생 위험**: 데이터에 숫자 외의 문자(예: `'100A' + 200`)가 섞여 있으면 `ORA-01722: invalid number` 에러로 전체 쿼리가 중단됩니다.\n3. **가독성 및 유지보수 저하**: 개발자의 변환 의도가 명확하지 않아 버그 발생 확률이 높아집니다.\n\n👉 **결론**: 실무 및 SQLD에서는 **반드시 명시적 형변환(`TO_NUMBER`, `TO_CHAR`, `TO_DATE`)을 사용하는 것이 표준 규칙**입니다!",
    initialQuery: `SELECT '100' + 200 AS implicit_add,\n       TO_NUMBER('100') + 200 AS explicit_add,\n       '2026-08-25' AS str_date,\n       TO_DATE('2026-08-25', 'YYYY-MM-DD') AS explicit_date,\n       TO_CHAR(1000, 'L9,999') AS explicit_won_str\nFROM dual;`,
    solutionQuery: `SELECT '100' + 200 AS implicit_add, TO_NUMBER('100') + 200 AS explicit_add, '2026-08-25' AS str_date, TO_DATE('2026-08-25', 'YYYY-MM-DD') AS explicit_date, TO_CHAR(1000, 'L9,999') AS explicit_won_str FROM dual`,
    hint: "`'100' + 200`, `TO_NUMBER('100') + 200`, `TO_DATE('2026-08-25', 'YYYY-MM-DD')`, `TO_CHAR(1000, 'L9,999')`를 작성하세요.",
    explanation:
      '암시적 형변환은 편리하지만 인덱스 무효화로 인한 성능 저하 및 ORA-01722 에러 위험이 있으므로, 항상 TO_NUMBER, TO_CHAR, TO_DATE 등의 명시적 형변환 함수를 사용하는 것을 권장합니다.',
    quickExamples: [
      {
        label: '명시적 형변환으로 안전한 날짜 가감산',
        query: `SELECT TO_DATE('2026-08-25', 'YYYY-MM-DD') + 7 AS safe_week_after FROM dual;`,
        description: '문자열을 명시적으로 DATE로 변환 후 안전하게 연산',
      },
    ],
    tryModifications: [
      {
        label: 'TO_CHAR로 금액 포맷팅 변경',
        query: `SELECT TO_CHAR(5000000, 'L9,999,999') AS formatted_salary FROM dual;`,
        guide: '5백만 원이 ₩5,000,000으로 명시적 변환되는지 확인해 보세요!',
      },
    ],
  },

  // =========================================================================
  // 대분류: NULL 관련 함수 (NULL Functions)
  // =========================================================================

  // -------------------------------------------------------------------------
  // 카테고리: NULL 관련 함수 > 하위 카테고리: NVL과 NVL2 (NULL 치환)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-null-1',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 1,
    category: 'NULL 관련 함수',
    subCategory: 'NVL과 NVL2 (NULL 치환)',
    title: '[NULL 치환] NVL vs NVL2 (기본값 치환과 3단 조건 분기)',
    description:
      "사원 샘플 테이블 `emp_sample`을 활용하여 커미션(`comm`)의 `NULL` 데이터를 안전하게 다루는 `NVL`과 `NVL2` 함수를 실습합니다.\n\n1. **`NVL(comm, 0)`**: `comm`이 `NULL`이면 `0`으로 치환 (별칭 `nvl_comm`)\n2. **`sal + NVL(comm, 0)`**: `NULL` 산술 연산의 전파를 막고 정확한 총급여 계산 (별칭 `total_sal`)\n3. **`NVL2(comm, '보너스 대상', '보너스 없음')`**: `comm`이 `NULL`이 아니면 `'보너스 대상'`, `NULL`이면 `'보너스 없음'` 반환 (별칭 `bonus_status`)\n4. **`NVL2(comm, sal + comm, sal)`**: `comm`이 있으면 `sal + comm`, 없으면 `sal`만 반환 (별칭 `nvl2_calc_sal`)\n\n💡 **핵심 관전 포인트**:\n- `NVL(expr1, expr2)`: `expr1`이 NULL일 때만 `expr2` 반환 (2개 인자의 데이터 타입이 일치해야 함)\n- `NVL2(expr1, expr2, expr3)`: `expr1`이 NULL이 아니면 `expr2`, NULL이면 `expr3` 반환 (3단 조건 분기)",
    initialQuery: `SELECT ename,\n       sal,\n       comm,\n       NVL(comm, 0) AS nvl_comm,\n       sal + NVL(comm, 0) AS total_sal,\n       NVL2(comm, '보너스 대상', '보너스 없음') AS bonus_status,\n       NVL2(comm, sal + comm, sal) AS nvl2_calc_sal\nFROM emp_sample;`,
    solutionQuery: `SELECT ename, sal, comm, NVL(comm, 0) AS nvl_comm, sal + NVL(comm, 0) AS total_sal, NVL2(comm, '보너스 대상', '보너스 없음') AS bonus_status, NVL2(comm, sal + comm, sal) AS nvl2_calc_sal FROM emp_sample`,
    hint: "`NVL(comm, 0)`, `sal + NVL(comm, 0)`, `NVL2(comm, '보너스 대상', '보너스 없음')`, `NVL2(comm, sal + comm, sal)`을 작성하세요.",
    explanation:
      '1. NVL(expr1, expr2): expr1이 NULL이면 expr2를 반환합니다.\n2. NVL2(expr1, expr2, expr3): expr1이 NULL이 아니면 expr2를 반환하고, NULL이면 expr3을 반환합니다.',
    quickExamples: [
      {
        label: 'NVL2로 커미션 존재 여부에 따른 메시지 분기',
        query: `SELECT ename, NVL2(comm, comm || '원 지급', '미지급') AS comm_msg FROM emp_sample;`,
        description: 'NULL이 아닌 경우 금액+원, NULL인 경우 미지급 표시',
      },
    ],
    tryModifications: [
      {
        label: 'NVL 기본값을 50으로 변경하여 계산',
        query: `SELECT ename, sal + NVL(comm, 50) AS min_guaranteed_sal FROM emp_sample;`,
        guide: '커미션이 없는 사원에게 최소 보장금 50을 지급하는 계산을 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: NULL 관련 함수 > 하위 카테고리: NULLIF와 COALESCE
  // -------------------------------------------------------------------------
  {
    id: 'sqld-null-2',
    datasetId: 'sqld_sqlp',
    targetTable: 'dual',
    level: 1,
    category: 'NULL 관련 함수',
    subCategory: 'NULLIF와 COALESCE',
    title: '[비교 및 다중 우선순위] NULLIF vs COALESCE',
    description:
      "오라클 가상 테이블 `DUAL`을 활용하여 두 값이 같을 때 `NULL`을 반환하는 `NULLIF`와 여러 인자 중 첫 번째 유효값을 반환하는 `COALESCE`를 실습합니다.\n\n1. **`NULLIF(100, 100)` [동일값]**: 두 값이 같으므로 `NULL` 반환 (별칭 `nullif_same`)\n2. **`NULLIF(100, 200)` [다른값]**: 두 값이 다르므로 첫 번째 값 `100` 반환 (별칭 `nullif_diff`)\n3. **`NULLIF('A', 'A')` [동일문자]**: 두 문자가 같으므로 `NULL` 반환 (별칭 `nullif_str_same`)\n4. **`NULLIF('A', 'B')` [다른문자]**: 두 문자가 다르므로 `'A'` 반환 (별칭 `nullif_str_diff`)\n5. **`COALESCE(NULL, NULL, 50, 100)`**: 첫 번째로 `NULL`이 아닌 값 `50` 반환 (별칭 `coalesce_first_valid`)\n6. **`COALESCE(NULL, '첫번째 유효값', '대체값')`**: 첫 번째 유효 문자열 반환 (별칭 `coalesce_str`)\n\n💡 **핵심 관전 포인트**:\n- `NULLIF(a, b)`: $a = b$이면 `NULL`, $a \neq b$이면 $a$ 반환 (0으로 나누기 에러를 방지할 때 `sal / NULLIF(comm, 0)` 형태로 유용)\n- `COALESCE(a, b, c, ...)`: 왼쪽부터 순서대로 검사하여 **첫 번째로 `NULL`이 아닌 값**을 반환 (모두 `NULL`이면 `NULL` 반환)",
    initialQuery: `SELECT NULLIF(100, 100) AS nullif_same,\n       NULLIF(100, 200) AS nullif_diff,\n       NULLIF('A', 'A') AS nullif_str_same,\n       NULLIF('A', 'B') AS nullif_str_diff,\n       COALESCE(NULL, NULL, 50, 100) AS coalesce_first_valid,\n       COALESCE(NULL, '첫번째 유효값', '대체값') AS coalesce_str\nFROM dual;`,
    solutionQuery: `SELECT NULLIF(100, 100) AS nullif_same, NULLIF(100, 200) AS nullif_diff, NULLIF('A', 'A') AS nullif_str_same, NULLIF('A', 'B') AS nullif_str_diff, COALESCE(NULL, NULL, 50, 100) AS coalesce_first_valid, COALESCE(NULL, '첫번째 유효값', '대체값') AS coalesce_str FROM dual`,
    hint: "`NULLIF(100, 100)`, `NULLIF(100, 200)`, `COALESCE(NULL, NULL, 50, 100)`, `COALESCE(NULL, '첫번째 유효값', '대체값')`를 작성하세요.",
    explanation:
      '1. NULLIF(expr1, expr2): expr1과 expr2가 같으면 NULL을, 다르면 expr1을 반환합니다.\n2. COALESCE(expr1, expr2, ...): 나열된 인자들 중 첫 번째로 NULL이 아닌 값을 반환합니다.',
    quickExamples: [
      {
        label: 'NULLIF로 0 나누기(Zero Division) 오류 방지',
        query: `SELECT 1000 / NULLIF(0, 0) AS safe_div_null FROM dual;`,
        description: '0으로 나눌 때 분모가 NULL이 되어 에러 대신 NULL이 반환됨 확인',
      },
      {
        label: '사원 테이블에서 COALESCE로 다중 대체값 적용',
        query: `SELECT ename, COALESCE(comm, 0) AS coalesce_comm FROM emp_sample;`,
        description: 'COALESCE(comm, 0)은 NVL(comm, 0)과 동일하게 동작',
      },
    ],
    tryModifications: [
      {
        label: 'COALESCE 인자 4개 테스트',
        query: `SELECT COALESCE(NULL, NULL, NULL, '최종 백업값') AS backup_res FROM dual;`,
        guide: '앞의 3개가 모두 NULL일 때 4번째 인자가 채택되는지 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: NULL 관련 함수 > 하위 카테고리: DECODE와 CASE 표현식
  // -------------------------------------------------------------------------
  {
    id: 'sqld-null-3',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 2,
    category: 'NULL 관련 함수',
    subCategory: 'DECODE와 CASE 표현식',
    title: '[조건 분기] DECODE vs CASE (동등 비교와 범위/NULL 조건 분기)',
    description:
      "사원 샘플 테이블 `emp_sample`을 활용하여 오라클 전용 조건 분기 함수 `DECODE`와 표준 SQL `CASE` 표현식을 실습합니다.\n\n1. **`DECODE`로 커미션 상태 분기 (`decode_status`)**:\n   - `DECODE(comm, NULL, '미지급', 0, '0원', '지급완료')`\n2. **`CASE`로 커미션 상태 분기 (`case_status`)**:\n   - `CASE WHEN comm IS NULL THEN '미지급' WHEN comm = 0 THEN '0원' ELSE '지급완료' END`\n3. **`CASE`로 급여 등급 분기 (`sal_grade`)**:\n   - `CASE WHEN sal >= 4000 THEN '고액연봉' WHEN sal >= 2000 THEN '중간급여' ELSE '기본급여' END`\n\n💡 **핵심 관전 포인트**:\n- **`DECODE`**: 오라클 전용 함수이며 `DECODE(target, search, result, ..., default)` 형태로 동등(`=`) 비교만 지원합니다. (단, `search` 위치의 `NULL`은 `target IS NULL`처럼 동등 비교로 인식됩니다!)\n- **`CASE`**: ANSI SQL 표준이며 `WHEN condition THEN result` 형태로 부등호(`>=`, `<`), 범위(`BETWEEN`), `IS NULL` 등 복잡한 조건식을 모두 지원합니다.",
    initialQuery: `SELECT ename,\n       sal,\n       comm,\n       DECODE(comm, NULL, '미지급', 0, '0원', '지급완료') AS decode_status,\n       CASE \n         WHEN comm IS NULL THEN '미지급' \n         WHEN comm = 0 THEN '0원' \n         ELSE '지급완료' \n       END AS case_status,\n       CASE \n         WHEN sal >= 4000 THEN '고액연봉'\n         WHEN sal >= 2000 THEN '중간급여'\n         ELSE '기본급여'\n       END AS sal_grade\nFROM emp_sample;`,
    solutionQuery: `SELECT ename, sal, comm, DECODE(comm, NULL, '미지급', 0, '0원', '지급완료') AS decode_status, CASE WHEN comm IS NULL THEN '미지급' WHEN comm = 0 THEN '0원' ELSE '지급완료' END AS case_status, CASE WHEN sal >= 4000 THEN '고액연봉' WHEN sal >= 2000 THEN '중간급여' ELSE '기본급여' END AS sal_grade FROM emp_sample`,
    hint: "`DECODE(comm, NULL, '미지급', 0, '0원', '지급완료')`, `CASE WHEN comm IS NULL THEN ... END`를 작성하세요.",
    explanation:
      '1. DECODE: 오라클 전용 조건문으로 target 값이 search 값과 같을 때 result를 반환합니다.\n2. CASE WHEN: ANSI 표준 조건문으로 복잡한 조건식(부등호, IS NULL 등)을 유연하게 처리할 수 있습니다.',
    quickExamples: [
      {
        label: 'DECODE로 NVL 기능 흉내내기 (DECODE(comm, NULL, 0, comm))',
        query: `SELECT ename, DECODE(comm, NULL, 0, comm) AS decode_nvl FROM emp_sample;`,
        description: 'DECODE를 활용하여 커미션이 NULL이면 0, 아니면 본래 값 반환',
      },
    ],
    tryModifications: [
      {
        label: 'CASE로 3000 이상 특별 보너스 계산',
        query: `SELECT ename, sal, CASE WHEN sal >= 3000 THEN sal * 0.1 ELSE 0 END AS bonus_10pct FROM emp_sample;`,
        guide: '급여 3000 이상인 사원에게만 10% 보너스가 계산되는지 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: NULL 관련 함수 > 하위 카테고리: IS NULL과 LNNVL (특수 조건)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-null-4',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 2,
    category: 'NULL 관련 함수',
    subCategory: 'IS NULL과 LNNVL (특수 조건)',
    title: '[특수 NULL 조건식] IS NULL, IS NOT NULL & LNNVL 함수 (SQLD 심화)',
    description:
      "사원 샘플 테이블 `emp_sample`을 활용하여 `NULL` 비교 전용 연산자 `IS NULL`과 오라클의 특수 NULL 처리 함수 `LNNVL`을 실습합니다.\n\n1. **`IS NULL` 판별 (`is_null_check`)**:\n   - `CASE WHEN comm IS NULL THEN 'NULL 사원' ELSE '값 있음' END`\n2. **`IS NOT NULL` 판별 (`is_not_null_check`)**:\n   - `CASE WHEN comm IS NOT NULL THEN '유효 데이터' ELSE '누락' END`\n3. **오라클 특수 함수 `LNNVL(comm >= 100)` (`lnnvl_result`)**:\n   - `LNNVL(comm >= 100)`의 결과 반환\n\n💡 **【SQLD 필수 암기: NULL 비교 및 LNNVL 원리】**:\n- `comm = NULL`은 항상 `UNKNOWN(FALSE)`로 평가되므로 **절대 원하는 결과를 얻을 수 없습니다**. 반드시 `IS NULL` 또는 `IS NOT NULL`을 사용해야 합니다!\n- **`LNNVL(condition)`**:\n  - 조건이 **`FALSE`**이거나 **`UNKNOWN(NULL)`**이면 **`TRUE (1)`** 반환!\n  - 조건이 **`TRUE`**이면 **`FALSE (0)`** 반환!\n  - 즉, `WHERE LNNVL(comm >= 100)`을 사용하면 커미션이 100 미만인 사원뿐만 아니라 **커미션이 `NULL`인 사원까지 함께 안전하게 조회**할 수 있습니다!",
    initialQuery: `SELECT ename,\n       sal,\n       comm,\n       CASE WHEN comm IS NULL THEN 'NULL 사원' ELSE '값 있음' END AS is_null_check,\n       CASE WHEN comm IS NOT NULL THEN '유효 데이터' ELSE '누락' END AS is_not_null_check,\n       LNNVL(comm >= 100) AS lnnvl_result\nFROM emp_sample;`,
    solutionQuery: `SELECT ename, sal, comm, CASE WHEN comm IS NULL THEN 'NULL 사원' ELSE '값 있음' END AS is_null_check, CASE WHEN comm IS NOT NULL THEN '유효 데이터' ELSE '누락' END AS is_not_null_check, LNNVL(comm >= 100) AS lnnvl_result FROM emp_sample`,
    hint: "`CASE WHEN comm IS NULL THEN 'NULL 사원' ELSE '값 있음' END`, `LNNVL(comm >= 100)`을 작성하세요.",
    explanation:
      '1. IS NULL / IS NOT NULL: NULL 값을 비교할 때 사용하는 전용 연산자입니다.\n2. LNNVL(condition): 조건식이 FALSE이거나 UNKNOWN(NULL)일 때 TRUE를 반환하고, TRUE일 때 FALSE를 반환합니다.',
    quickExamples: [
      {
        label: 'IS NULL로 커미션 미지급 사원만 필터링',
        query: `SELECT ename, sal, comm FROM emp_sample WHERE comm IS NULL;`,
        description: '이영희, 최유나 2명의 사원 조회 확인',
      },
      {
        label: 'LNNVL로 커미션이 100 미만이거나 NULL인 사원 필터링',
        query: `SELECT ename, sal, comm FROM emp_sample WHERE LNNVL(comm >= 100);`,
        description: 'comm이 NULL인 사원과 comm=0인 사원이 함께 조회됨 확인',
      },
    ],
    tryModifications: [
      {
        label: 'IS NOT NULL로 커미션 지급 사원만 필터링',
        query: `SELECT ename, sal, comm FROM emp_sample WHERE comm IS NOT NULL;`,
        guide: '김철수(100), 박민수(200), 정동원(0) 3명이 출력되는지 확인해 보세요!',
      },
    ],
  },

  // =========================================================================
  // 대분류: WHERE절과 연산자 (WHERE Clause & Operators)
  // =========================================================================

  // -------------------------------------------------------------------------
  // 카테고리: WHERE절과 연산자 > 하위 카테고리: 비교 및 부정 비교 연산자
  // -------------------------------------------------------------------------
  {
    id: 'sqld-where-1',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 1,
    category: 'WHERE절과 연산자',
    subCategory: '비교 및 부정 비교 연산자',
    title: '[비교 및 부정 비교] =, !=, <>, ^=, NOT 연산자',
    description:
      '사원 샘플 테이블 `emp_sample`을 활용하여 기본 비교 연산자(`=`, `>=`, `<`)와 부정 비교 연산자(`!=`, `<>`, `^=`, `NOT`)를 실습합니다.\n\n1. **급여가 3000 이상인 사원**: `WHERE sal >= 3000` (박민수, 최유나, 정동원)\n2. **급여가 3000이 아닌 사원 (부정 비교 표현 4가지)**:\n   - `sal != 3000`\n   - `sal <> 3000` (표준)\n   - `sal ^= 3000` (오라클 지원)\n   - `NOT (sal = 3000)`\n\n💡 **【SQLD 단골 함정: 부정 비교와 NULL】**:\n- `WHERE comm != 100`을 실행하면 커미션이 100이 아닌 사원(박민수 200, 정동원 0)만 조회되며, **커미션이 `NULL`인 사원(이영희, 최유나)은 자동으로 제외**됩니다!\n- `NULL`과의 모든 비교 연산(`=`, `!=`, `<`, `>`)은 `UNKNOWN`으로 평가되어 결과에 포함되지 않습니다.',
    initialQuery: `SELECT ename, sal, comm\nFROM emp_sample\nWHERE sal <> 3000;`,
    solutionQuery: `SELECT ename, sal, comm FROM emp_sample WHERE sal <> 3000`,
    hint: '`WHERE sal <> 3000` 또는 `WHERE sal != 3000`을 작성하세요.',
    explanation:
      '1. 비교 연산자: =, >, <, >=, <=\n2. 부정 비교 연산자: !=, <>, ^=, NOT (조건). 모두 "같지 않다"를 의미합니다.\n3. NULL 값은 부정 비교 연산자(!=, <>)를 사용해도 결과에 포함되지 않으므로 주의해야 합니다.',
    quickExamples: [
      {
        label: '급여 3000 이상 사원 조회 (sal >= 3000)',
        query: `SELECT ename, sal, comm FROM emp_sample WHERE sal >= 3000;`,
        description: '박민수(3000), 최유나(4000), 정동원(5000) 3명 조회',
      },
      {
        label: '부정 비교와 NULL 제외 현상 관찰',
        query: `SELECT ename, comm FROM emp_sample WHERE comm != 100;`,
        description: 'comm이 NULL인 2명은 조회되지 않고 200, 0만 조회됨 확인',
      },
    ],
    tryModifications: [
      {
        label: 'NOT 괄호 연산자로 변경 (NOT (sal = 3000))',
        query: `SELECT ename, sal, comm FROM emp_sample WHERE NOT (sal = 3000);`,
        guide: 'NOT (sal = 3000)이 sal != 3000과 동일한 결과를 반환하는지 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: WHERE절과 연산자 > 하위 카테고리: BETWEEN과 NOT BETWEEN
  // -------------------------------------------------------------------------
  {
    id: 'sqld-where-2',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 1,
    category: 'WHERE절과 연산자',
    subCategory: 'BETWEEN과 NOT BETWEEN',
    title: '[범위 검색] BETWEEN a AND b vs NOT BETWEEN (경계값 포함 원리)',
    description:
      '사원 샘플 테이블 `emp_sample`을 활용하여 범위 검색 연산자 `BETWEEN`과 부정 범위 `NOT BETWEEN`을 실습합니다.\n\n1. **`sal BETWEEN 2000 AND 4000`**:\n   - 급여가 2000 이상이고 4000 이하인 사원 (이영희, 박민수, 최유나)\n   - **동일한 조건식**: `sal >= 2000 AND sal <= 4000` (경계값 2000과 4000을 **모두 포함**!)\n2. **`sal NOT BETWEEN 2000 AND 4000`**:\n   - 급여가 2000 미만이거나 4000 초과인 사원 (김철수 1000, 정동원 5000)\n   - **동일한 조건식**: `sal < 2000 OR sal > 4000`\n\n💡 **【SQLD 필수 암기: BETWEEN의 순서 규칙】**:\n- `BETWEEN a AND b`에서 **반드시 $a \le b$ (작은 값을 앞에, 큰 값을 뒤에)** 작성해야 합니다.\n- 만약 `BETWEEN 4000 AND 2000`으로 작성하면 문법 에러는 나지 않지만 **항상 0행(공집합)이 반환**됩니다!',
    initialQuery: `SELECT ename, sal, comm\nFROM emp_sample\nWHERE sal BETWEEN 2000 AND 4000;`,
    solutionQuery: `SELECT ename, sal, comm FROM emp_sample WHERE sal BETWEEN 2000 AND 4000`,
    hint: '`WHERE sal BETWEEN 2000 AND 4000`을 작성하세요.',
    explanation:
      '1. col BETWEEN a AND b: a 이상 b 이하인 범위를 검색합니다. (a <= col <= b, 경계값 포함)\n2. col NOT BETWEEN a AND b: a 미만 또는 b 초과인 범위를 검색합니다. (col < a OR col > b)',
    quickExamples: [
      {
        label: 'NOT BETWEEN으로 2000 미만 및 4000 초과 사원 조회',
        query: `SELECT ename, sal, comm FROM emp_sample WHERE sal NOT BETWEEN 2000 AND 4000;`,
        description: '김철수(1000)와 정동원(5000) 2명 조회 확인',
      },
      {
        label: 'AND 연산자로 동일한 범위 표현 (sal >= 2000 AND sal <= 4000)',
        query: `SELECT ename, sal, comm FROM emp_sample WHERE sal >= 2000 AND sal <= 4000;`,
        description: 'BETWEEN과 완벽히 동일한 결과(3명) 반환 확인',
      },
    ],
    tryModifications: [
      {
        label: 'BETWEEN 순서를 반대로 (4000 AND 2000) 변경',
        query: `SELECT ename, sal, comm FROM emp_sample WHERE sal BETWEEN 4000 AND 2000;`,
        guide: '순서가 뒤바뀌면 어떤 데이터도 조회되지 않는(0행) SQLD 함정을 직접 관찰해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: WHERE절과 연산자 > 하위 카테고리: IN과 NOT IN (NULL 주의)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-where-3',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 2,
    category: 'WHERE절과 연산자',
    subCategory: 'IN과 NOT IN (NULL 주의)',
    title: '[목록 검색과 NULL 함정] IN vs NOT IN (NOT IN에 NULL 포함 시 0행 반환)',
    description:
      '**【SQLD 시험 최고 난이도 킬러 문항: NOT IN 목록에 NULL이 포함될 때의 원리】**\n사원 샘플 테이블 `emp_sample`을 활용하여 `IN`과 `NOT IN` 연산자의 내부 논리 전개 및 `NULL` 전파 함정을 실습합니다.\n\n1. **`sal IN (1000, 3000, 5000)`**:\n   - 급여가 1000, 3000, 5000 중 하나인 사원 (김철수, 박민수, 정동원)\n   - **내부 전개**: `sal = 1000 OR sal = 3000 OR sal = 5000`\n2. **`sal NOT IN (1000, 3000, 5000)`**:\n   - 급여가 1000도 아니고 3000도 아니고 5000도 아닌 사원 (이영희 2000, 최유나 4000)\n   - **내부 전개**: `sal != 1000 AND sal != 3000 AND sal != 5000`\n\n💡 **【SQLD 최고 빈출 핵심: NOT IN 리스트에 NULL이 들어가면?】**\n- `WHERE comm IN (100, NULL)` ➔ `comm = 100 OR comm = NULL`\n  👉 `comm = 100`인 김철수는 `TRUE OR UNKNOWN ➔ TRUE`이므로 **정상 조회**됩니다!\n- `WHERE comm NOT IN (100, NULL)` ➔ `comm != 100 AND comm != NULL`\n  👉 `comm != NULL`이 항상 `UNKNOWN`이므로, `TRUE AND UNKNOWN ➔ UNKNOWN`이 되어 **어떤 행도 조회되지 않고 0행(공집합)이 반환**됩니다!',
    initialQuery: `SELECT ename, sal, comm\nFROM emp_sample\nWHERE sal IN (1000, 3000, 5000);`,
    solutionQuery: `SELECT ename, sal, comm FROM emp_sample WHERE sal IN (1000, 3000, 5000)`,
    hint: '`WHERE sal IN (1000, 3000, 5000)`을 작성하세요.',
    explanation:
      '1. IN (v1, v2, ...): OR 조건으로 전개되어 나열된 값 중 하나라도 일치하면 TRUE입니다.\n2. NOT IN (v1, v2, ...): AND 조건으로 전개되어 나열된 모든 값과 일치하지 않아야 TRUE입니다.\n3. NOT IN 목록에 NULL이 포함되면 AND (col != NULL) 연산에 의해 전체 조건이 UNKNOWN이 되어 0행이 반환됩니다.',
    quickExamples: [
      {
        label: 'NOT IN으로 1000, 3000, 5000 제외 사원 조회',
        query: `SELECT ename, sal, comm FROM emp_sample WHERE sal NOT IN (1000, 3000, 5000);`,
        description: '이영희(2000)와 최유나(4000) 2명 조회 확인',
      },
      {
        label: 'IN 목록에 NULL이 있을 때 (IN (100, NULL))',
        query: `SELECT ename, sal, comm FROM emp_sample WHERE comm IN (100, NULL);`,
        description: 'comm=100인 김철수가 정상 조회됨 확인',
      },
    ],
    tryModifications: [
      {
        label: '★ SQLD 킬러 함정: NOT IN (100, NULL) 테스트',
        query: `SELECT ename, sal, comm FROM emp_sample WHERE comm NOT IN (100, NULL);`,
        guide:
          'NOT IN 목록에 NULL이 들어가면 어떤 행도 조회되지 않는(0행) 치명적 함정을 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: WHERE절과 연산자 > 하위 카테고리: LIKE와 NOT LIKE
  // -------------------------------------------------------------------------
  {
    id: 'sqld-where-4',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 1,
    category: 'WHERE절과 연산자',
    subCategory: 'LIKE와 NOT LIKE',
    title: '[패턴 검색] LIKE 연산자와 와일드카드 (%, _) 및 NOT LIKE',
    description:
      "사원 샘플 테이블 `emp_sample`을 활용하여 문자열 패턴 일치 연산자 `LIKE`와 와일드카드 기호(`%`, `_`), 그리고 `NOT LIKE`를 실습합니다.\n\n1. **와일드카드 기호 의미**:\n   - `%` (퍼센트): **0개 이상의 모든 문자**\n   - `_` (언더스코어): **정확히 1개의 문자**\n2. **패턴 검색 예시**:\n   - `ename LIKE '김%'`: '김'으로 시작하는 사원 (김철수)\n   - `ename LIKE '%수'`: '수'로 끝나는 사원 (김철수, 박민수)\n   - `ename LIKE '_민_'`: 3글자 중 가운데 글자가 '민'인 사원 (박민수)\n   - `ename NOT LIKE '%수'`: '수'로 끝나지 않는 사원 (이영희, 최유나, 정동원)",
    initialQuery: `SELECT ename, sal, comm\nFROM emp_sample\nWHERE ename LIKE '%수';`,
    solutionQuery: `SELECT ename, sal, comm FROM emp_sample WHERE ename LIKE '%수'`,
    hint: "`WHERE ename LIKE '%수'`를 작성하세요.",
    explanation:
      '1. LIKE: 문자열의 일부 패턴이 일치하는지 검사합니다.\n2. %: 0개 이상의 임의의 문자열과 일치합니다.\n3. _: 정확히 1개의 임의의 문자와 일치합니다.\n4. NOT LIKE: 패턴과 일치하지 않는 데이터를 조회합니다.',
    quickExamples: [
      {
        label: "'수'로 끝나지 않는 사원 조회 (NOT LIKE '%수')",
        query: `SELECT ename, sal, comm FROM emp_sample WHERE ename NOT LIKE '%수';`,
        description: '이영희, 최유나, 정동원 3명 조회 확인',
      },
      {
        label: "가운데 글자가 '민'인 3글자 이름 사원 (_민_)",
        query: `SELECT ename, sal, comm FROM emp_sample WHERE ename LIKE '_민_';`,
        description: '박민수 1명 조회 확인',
      },
    ],
    tryModifications: [
      {
        label: "'이' 또는 '최'로 시작하는 사원 검색",
        query: `SELECT ename, sal, comm FROM emp_sample WHERE ename LIKE '이%' OR ename LIKE '최%';`,
        guide: 'LIKE와 OR 조건을 결합하여 다중 성씨를 검색해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: WHERE절과 연산자 > 하위 카테고리: 논리 연산자 우선순위 (AND vs OR)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-where-5',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 2,
    category: 'WHERE절과 연산자',
    subCategory: '논리 연산자 우선순위 (AND vs OR)',
    title: '[논리 연산자 우선순위] NOT > AND > OR와 괄호 ()의 필수 활용',
    description:
      "**【SQLD 시험 핵심 암기: 연산자 우선순위와 괄호의 중요성】**\nSQL에서 논리 연산자는 **`NOT` > `AND` > `OR`** 순서로 우선 결합됩니다. 괄호가 없을 때 발생하는 의도치 않은 논리 오류를 실습합니다.\n\n1. **연산자 전체 우선순위**:\n   1. 괄호 `()`\n   2. 산술 연산자 (`*`, `/`, `+`, `-`)\n   3. 연결 연산자 (`||`)\n   4. 비교 및 SQL 연산자 (`=`, `<>`, `BETWEEN`, `IN`, `LIKE`, `IS NULL`)\n   5. `NOT` (논리 부정)\n   6. **`AND` (논리 곱 - OR보다 먼저 실행!)**\n   7. **`OR` (논리 합 - 가장 마지막에 실행)**\n\n💡 **【실습 비교: 괄호 유무에 따른 천양지차 결과】**:\n- **질의 A (괄호 없음)**: `WHERE ename = '김철수' OR ename = '이영희' AND sal >= 3000`\n  👉 `AND`가 먼저 묶여 `ename = '김철수' OR (ename = '이영희' AND sal >= 3000)`로 동작합니다.\n  👉 따라서 김철수는 급여가 1000임에도 불구하고 **무조건 조회**됩니다!\n- **질의 B (괄호 명시)**: `WHERE (ename = '김철수' OR ename = '이영희') AND sal >= 3000`\n  👉 김철수와 이영희 중 급여가 3000 이상인 사원을 찾으므로, 둘 다 조건에 맞지 않아 **0행(공집합)이 반환**됩니다!",
    initialQuery: `SELECT ename, sal, comm\nFROM emp_sample\nWHERE (ename = '김철수' OR ename = '이영희')\n  AND sal >= 3000;`,
    solutionQuery: `SELECT ename, sal, comm FROM emp_sample WHERE (ename = '김철수' OR ename = '이영희') AND sal >= 3000`,
    hint: "`WHERE (ename = '김철수' OR ename = '이영희') AND sal >= 3000`을 작성하세요.",
    explanation:
      '1. AND 연산자는 OR 연산자보다 우선순위가 높습니다.\n2. 따라서 A OR B AND C는 A OR (B AND C)로 평가됩니다.\n3. (A OR B)를 먼저 평가하려면 반드시 괄호 ()를 사용해야 합니다.',
    quickExamples: [
      {
        label: '괄호 없을 때 김철수가 출력되는 이유 관찰 (A OR B AND C)',
        query: `SELECT ename, sal, comm FROM emp_sample WHERE ename = '김철수' OR ename = '이영희' AND sal >= 3000;`,
        description: 'AND가 우선 결합되어 김철수(1000)가 출력되는 현상 확인',
      },
    ],
    tryModifications: [
      {
        label: '박민수(3000) 또는 최유나(4000)를 대상으로 괄호 조건 실습',
        query: `SELECT ename, sal, comm FROM emp_sample WHERE (ename = '박민수' OR ename = '최유나') AND sal >= 3500;`,
        guide: '두 사원 중 급여가 3500 이상인 최유나만 출력되는지 확인해 보세요!',
      },
    ],
  },

  // =========================================================================
  // 대분류: GROUP BY와 집계 함수 (Aggregate Functions & GROUP BY / HAVING)
  // =========================================================================

  // -------------------------------------------------------------------------
  // 카테고리: GROUP BY와 집계 함수 > 하위 카테고리: COUNT 함수의 3가지 형태
  // -------------------------------------------------------------------------
  {
    id: 'sqld-agg-1',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 1,
    category: 'GROUP BY와 집계 함수',
    subCategory: 'COUNT 함수의 3가지 형태',
    title: '[집계 함수와 행 개수] COUNT(*), COUNT(컬럼), COUNT(DISTINCT 컬럼)',
    description:
      '사원 샘플 테이블 `emp_sample`을 활용하여 `COUNT` 함수의 3가지 사용 형태와 `NULL` 데이터 포함 여부에 따른 차이를 실습합니다.\n\n1. **`COUNT(*)`**: `NULL`을 포함한 **테이블의 전체 행 개수** (별칭 `cnt_all_rows` ➔ `5`)\n2. **`COUNT(comm)`**: `comm` 컬럼에서 **`NULL`을 제외한 유효값 개수** (별칭 `cnt_comm_non_null` ➔ `3` : 100, 200, 0)\n3. **`COUNT(DISTINCT comm)`**: `comm`에서 `NULL`을 제외하고 **중복을 제거한 고유값 개수** (별칭 `cnt_dist_comm` ➔ `3`)\n4. **`COUNT(DISTINCT deptno)`**: 부서 번호(`10`, `20`)의 **고유값 개수** (별칭 `cnt_dist_dept` ➔ `2`)\n\n💡 **핵심 관전 포인트**:\n- `COUNT(*)`는 모든 행을 세므로 `NULL` 컬럼이 있어도 개수에 포함됩니다.\n- `COUNT(컬럼명)`은 해당 컬럼 값이 `NULL`인 행을 **자동으로 무시(제외)**하고 셉니다.\n- `COUNT(DISTINCT 컬럼명)`은 `NULL`을 제외하고 중복된 값을 하나로 합쳐서 셉니다.',
    initialQuery: `SELECT COUNT(*) AS cnt_all_rows,\n       COUNT(comm) AS cnt_comm_non_null,\n       COUNT(DISTINCT comm) AS cnt_dist_comm,\n       COUNT(DISTINCT deptno) AS cnt_dist_dept\nFROM emp_sample;`,
    solutionQuery: `SELECT COUNT(*) AS cnt_all_rows, COUNT(comm) AS cnt_comm_non_null, COUNT(DISTINCT comm) AS cnt_dist_comm, COUNT(DISTINCT deptno) AS cnt_dist_dept FROM emp_sample`,
    hint: '`COUNT(*)`, `COUNT(comm)`, `COUNT(DISTINCT comm)`, `COUNT(DISTINCT deptno)`를 작성하세요.',
    explanation:
      '1. COUNT(*): NULL을 포함한 전체 행 수를 반환합니다.\n2. COUNT(컬럼): 해당 컬럼에서 NULL이 아닌 값의 개수를 반환합니다.\n3. COUNT(DISTINCT 컬럼): NULL을 제외하고 중복을 제거한 고유값의 개수를 반환합니다.',
    quickExamples: [
      {
        label: '사원수 vs 커미션 수령 사원수 비교',
        query: `SELECT COUNT(*) AS total_emp, COUNT(comm) AS bonus_emp FROM emp_sample;`,
        description: '전체 5명 중 커미션이 있는 3명만 집계됨 확인',
      },
    ],
    tryModifications: [
      {
        label: '급여(sal) 컬럼의 개수와 고유값 개수 확인',
        query: `SELECT COUNT(sal) AS cnt_sal, COUNT(DISTINCT sal) AS dist_sal FROM emp_sample;`,
        guide: '5명의 급여가 모두 다르므로 둘 다 5가 출력되는지 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: GROUP BY와 집계 함수 > 하위 카테고리: SUM과 AVG (NULL 평균 함정)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-agg-2',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 1,
    category: 'GROUP BY와 집계 함수',
    subCategory: 'SUM과 AVG (NULL 평균 함정)',
    title: '[합계와 평균] SUM, AVG 및 AVG(comm) vs AVG(NVL(comm,0)) (SQLD 최고 빈출)',
    description:
      '**【SQLD 최고 빈출 핵심 킬러 문항: 집계 함수의 NULL 처리 방식】**\n사원 샘플 테이블 `emp_sample`을 활용하여 합계(`SUM`)와 평균(`AVG`), 그리고 `NULL` 포함 여부에 따른 평균값 왜곡 현상을 실습합니다.\n\n1. **`SUM(sal)`**: 전체 급여 합계 (`1000+2000+3000+4000+5000` ➔ `15000`)\n2. **`AVG(sal)`**: 전체 평균 급여 (`15000 / 5` ➔ `3000`)\n3. **`SUM(comm)`**: 커미션 합계 (`100 + 200 + 0` ➔ `300` : `NULL` 제외 합산)\n4. **`AVG(comm)` [NULL 제외 평균]**: `300 / 3` ➔ `100` (별칭 `avg_comm_ignore_null`)\n5. **`AVG(NVL(comm, 0))` [NULL 포함 전체 평균]**: `300 / 5` ➔ `60` (별칭 `avg_comm_include_null`)\n\n💡 **【SQLD 필수 암기: 집계 함수는 NULL을 무시한다!】**:\n- `AVG(comm)`은 `comm`이 `NULL`이 아닌 3명(김철수, 박민수, 정동원)의 평균을 구하므로 $300 \div 3 = 100$이 됩니다.\n- 반면 전체 사원(5명) 기준 1인당 평균 커미션을 구하려면 반드시 **`AVG(NVL(comm, 0))`** 또는 `SUM(comm) / COUNT(*)`를 사용하여 $300 \div 5 = 60$으로 계산해야 합니다!',
    initialQuery: `SELECT SUM(sal) AS total_sal,\n       AVG(sal) AS avg_sal,\n       SUM(comm) AS total_comm,\n       AVG(comm) AS avg_comm_ignore_null,\n       AVG(NVL(comm, 0)) AS avg_comm_include_null\nFROM emp_sample;`,
    solutionQuery: `SELECT SUM(sal) AS total_sal, AVG(sal) AS avg_sal, SUM(comm) AS total_comm, AVG(comm) AS avg_comm_ignore_null, AVG(NVL(comm, 0)) AS avg_comm_include_null FROM emp_sample`,
    hint: '`SUM(sal)`, `AVG(sal)`, `SUM(comm)`, `AVG(comm)`, `AVG(NVL(comm, 0))`을 작성하세요.',
    explanation:
      '1. 집계 함수(SUM, AVG, MIN, MAX 등)는 NULL 값을 연산 대상에서 자동으로 제외합니다.\n2. AVG(comm)은 NULL이 아닌 행의 개수로 나누므로 평균이 높아질 수 있습니다.\n3. 전체 행 기준 평균을 구할 때는 AVG(NVL(comm, 0))을 사용해야 합니다.',
    quickExamples: [
      {
        label: 'SUM(comm) / COUNT(*)로 전체 평균 직접 검증',
        query: `SELECT SUM(comm) / COUNT(*) AS manual_total_avg FROM emp_sample;`,
        description: '300 / 5 = 60으로 계산됨 확인',
      },
    ],
    tryModifications: [
      {
        label: '급여(sal) + 커미션(comm)의 1인당 평균 총보수 계산',
        query: `SELECT AVG(sal + NVL(comm, 0)) AS avg_total_compensation FROM emp_sample;`,
        guide: '(1100 + 2000 + 3200 + 4000 + 5000) / 5 = 3060이 출력되는지 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: GROUP BY와 집계 함수 > 하위 카테고리: MIN과 MAX
  // -------------------------------------------------------------------------
  {
    id: 'sqld-agg-3',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 1,
    category: 'GROUP BY와 집계 함수',
    subCategory: 'MIN과 MAX',
    title: '[최소값과 최대값] MIN vs MAX (숫자, 문자, 날짜 집계)',
    description:
      "사원 샘플 테이블 `emp_sample`을 활용하여 최소값 `MIN`과 최대값 `MAX` 함수를 실습합니다.\n\n1. **`MIN(sal)` / `MAX(sal)`**: 최저 급여(`1000`) 및 최고 급여(`5000`)\n2. **`MIN(comm)` / `MAX(comm)`**: `NULL`을 제외한 최저 커미션(`0`) 및 최고 커미션(`200`)\n3. **`MIN(ename)` / `MAX(ename)`**: 사전순 가장 앞선 이름(`'김철수'`) 및 가장 뒤의 이름(`'정동원'`)\n\n💡 **핵심 관전 포인트**:\n- `MIN`과 `MAX` 역시 `NULL`을 무시하고 유효한 데이터 중 최소/최대값을 찾습니다.\n- 숫자뿐만 아니라 **문자열(사전순)**과 **날짜(과거일=MIN, 미래일=MAX)** 데이터에도 동일하게 적용할 수 있습니다.",
    initialQuery: `SELECT MIN(sal) AS min_sal,\n       MAX(sal) AS max_sal,\n       MIN(comm) AS min_comm,\n       MAX(comm) AS max_comm,\n       MIN(ename) AS first_name_alphabetical,\n       MAX(ename) AS last_name_alphabetical\nFROM emp_sample;`,
    solutionQuery: `SELECT MIN(sal) AS min_sal, MAX(sal) AS max_sal, MIN(comm) AS min_comm, MAX(comm) AS max_comm, MIN(ename) AS first_name_alphabetical, MAX(ename) AS last_name_alphabetical FROM emp_sample`,
    hint: '`MIN(sal)`, `MAX(sal)`, `MIN(comm)`, `MAX(comm)`, `MIN(ename)`, `MAX(ename)`을 작성하세요.',
    explanation:
      '1. MIN: 컬럼의 최소값을 반환합니다. (NULL 제외, 문자열은 사전순 빠른 값, 날짜는 가장 빠른 날짜)\n2. MAX: 컬럼의 최대값을 반환합니다. (NULL 제외, 문자열은 사전순 늦은 값, 날짜는 가장 최근 날짜)',
    quickExamples: [
      {
        label: '최고 급여와 최저 급여의 격차 (MAX - MIN)',
        query: `SELECT MAX(sal) - MIN(sal) AS sal_gap FROM emp_sample;`,
        description: '5000 - 1000 = 4000원 격차 계산',
      },
    ],
    tryModifications: [
      {
        label: '사번(empno)의 최소/최대값 확인',
        query: `SELECT MIN(empno) AS first_empno, MAX(empno) AS last_empno FROM emp_sample;`,
        guide: '101과 105가 출력되는지 확인해 보세요.',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: GROUP BY와 집계 함수 > 하위 카테고리: GROUP BY 기본 문법
  // -------------------------------------------------------------------------
  {
    id: 'sqld-agg-4',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 1,
    category: 'GROUP BY와 집계 함수',
    subCategory: 'GROUP BY 기본 문법',
    title: '[부서별 그룹화] GROUP BY 절의 기본 원리와 그룹별 집계',
    description:
      '사원 샘플 테이블 `emp_sample`을 활용하여 부서 번호(`deptno`)별로 그룹화하고 각 그룹의 소계 통계를 산출하는 `GROUP BY` 절을 실습합니다.\n\n1. **10번 부서 (2명: 김철수 1000, 이영희 2000)**:\n   - 사원 수 `2`명, 커미션 수령 사원 `1`명, 급여 합계 `3000`, 평균 급여 `1500`\n2. **20번 부서 (3명: 박민수 3000, 최유나 4000, 정동원 5000)**:\n   - 사원 수 `3`명, 커미션 수령 사원 `2`명, 급여 합계 `12000`, 평균 급여 `4000`\n\n💡 **【SQLD 필수 문법 규칙: SELECT 절에 올 수 있는 컬럼】**:\n- `GROUP BY` 절을 사용하면 `SELECT` 절에는 **`GROUP BY`에 지정된 컬럼(`deptno`)**과 **`집계 함수`**만 기술할 수 있습니다.\n- `GROUP BY deptno`를 사용하면서 집계 함수 없이 `SELECT ename, deptno`를 쓰면 **`ORA-00979: not a GROUP BY expression` 에러**가 발생합니다!',
    initialQuery: `SELECT deptno,\n       COUNT(*) AS emp_count,\n       COUNT(comm) AS comm_emp_count,\n       SUM(sal) AS dept_total_sal,\n       AVG(sal) AS dept_avg_sal,\n       MIN(sal) AS dept_min_sal,\n       MAX(sal) AS dept_max_sal\nFROM emp_sample\nGROUP BY deptno\nORDER BY deptno;`,
    solutionQuery: `SELECT deptno, COUNT(*) AS emp_count, COUNT(comm) AS comm_emp_count, SUM(sal) AS dept_total_sal, AVG(sal) AS dept_avg_sal, MIN(sal) AS dept_min_sal, MAX(sal) AS dept_max_sal FROM emp_sample GROUP BY deptno ORDER BY deptno`,
    hint: '`SELECT deptno, COUNT(*), SUM(sal), AVG(sal) ... FROM emp_sample GROUP BY deptno ORDER BY deptno`를 작성하세요.',
    explanation:
      '1. GROUP BY: 특정 컬럼의 고유값을 기준으로 데이터를 소그룹화합니다.\n2. GROUP BY 사용 시 SELECT 절에는 그룹화 기준 컬럼 또는 집계 함수만 올 수 있습니다.\n3. ORDER BY는 항상 GROUP BY 뒤에 위치합니다.',
    quickExamples: [
      {
        label: '부서별 인원수와 총급여만 간단 조회',
        query: `SELECT deptno, COUNT(*) AS cnt, SUM(sal) AS sum_sal FROM emp_sample GROUP BY deptno;`,
        description: '10번(2명, 3000), 20번(3명, 12000) 출력 확인',
      },
    ],
    tryModifications: [
      {
        label: '커미션(comm) 유무별 그룹화 실습',
        query: `SELECT NVL2(comm, '보너스대상', '보너스없음') AS bonus_grp, COUNT(*) AS cnt, AVG(sal) AS avg_sal FROM emp_sample GROUP BY NVL2(comm, '보너스대상', '보너스없음');`,
        guide: '함수 표현식을 기준으로도 그룹화가 가능함을 관찰해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: GROUP BY와 집계 함수 > 하위 카테고리: HAVING절과 WHERE절 차이
  // -------------------------------------------------------------------------
  {
    id: 'sqld-agg-5',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 2,
    category: 'GROUP BY와 집계 함수',
    subCategory: 'HAVING절과 WHERE절 차이',
    title: '[그룹 조건 필터링] HAVING 절 vs WHERE 절 (실행 순서와 집계 조건)',
    description:
      '**【SQLD 핵심 출제: WHERE절과 HAVING절의 완벽한 역할 분담】**\n사원 샘플 테이블 `emp_sample`을 활용하여 그룹화 결과에 조건을 부여하는 `HAVING` 절을 실습합니다.\n\n1. **부서별 평균 급여가 3000 이상인 부서만 필터링**:\n   - 10번 부서 평균(`1500`) ➔ 조건 불만족으로 제외\n   - 20번 부서 평균(`4000`) ➔ 조건 만족하여 **20번 부서만 출력**\n\n💡 **【SQLD 필수 비교: WHERE vs HAVING 차이점】**:\n1. **`WHERE` 절**: 그룹화 **전**에 실행되며, 테이블의 개별 행을 필터링합니다. (집계 함수 사용 불가! `WHERE AVG(sal) >= 3000` ❌ 에러!)\n2. **`HAVING` 절**: `GROUP BY`로 그룹화 **후**에 실행되며, 그룹별 집계 결과에 조건을 겁니다. (`HAVING AVG(sal) >= 3000` ⭕)\n3. **SQL 실행 순서**: `FROM` ➔ `WHERE` ➔ `GROUP BY` ➔ `HAVING` ➔ `SELECT` ➔ `ORDER BY`',
    initialQuery: `SELECT deptno,\n       COUNT(*) AS emp_count,\n       AVG(sal) AS avg_sal,\n       SUM(sal) AS total_sal\nFROM emp_sample\nGROUP BY deptno\nHAVING AVG(sal) >= 3000;`,
    solutionQuery: `SELECT deptno, COUNT(*) AS emp_count, AVG(sal) AS avg_sal, SUM(sal) AS total_sal FROM emp_sample GROUP BY deptno HAVING AVG(sal) >= 3000`,
    hint: '`SELECT deptno, COUNT(*), AVG(sal), SUM(sal) FROM emp_sample GROUP BY deptno HAVING AVG(sal) >= 3000`을 작성하세요.',
    explanation:
      '1. WHERE 절: 그룹화 이전에 개별 행을 필터링합니다. 집계 함수를 사용할 수 없습니다.\n2. HAVING 절: 그룹화 이후에 집계된 그룹 결과를 필터링합니다. 집계 함수를 사용할 수 있습니다.\n3. 실행 순서: FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY.',
    quickExamples: [
      {
        label: '사원 수가 3명 이상인 부서만 조회 (HAVING COUNT(*) >= 3)',
        query: `SELECT deptno, COUNT(*) AS emp_cnt FROM emp_sample GROUP BY deptno HAVING COUNT(*) >= 3;`,
        description: '사원 수가 3명인 20번 부서만 조회됨 확인',
      },
      {
        label: 'WHERE와 HAVING을 동시에 사용한 복합 질의',
        query: `SELECT deptno, COUNT(*) AS cnt, AVG(sal) AS avg_sal FROM emp_sample WHERE sal >= 2000 GROUP BY deptno HAVING COUNT(*) >= 2;`,
        description: '급여 2000 이상인 사원들만 대상으로 그룹화 후 2명 이상인 부서 조회',
      },
    ],
    tryModifications: [
      {
        label: 'HAVING 조건을 총급여 5000 이상으로 변경',
        query: `SELECT deptno, SUM(sal) AS sum_sal FROM emp_sample GROUP BY deptno HAVING SUM(sal) >= 5000;`,
        guide: '총급여 12000인 20번 부서만 출력되는지 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: GROUP BY와 집계 함수 > 하위 카테고리: SELECT 문의 논리적 수행 순서 (6단계)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-agg-6',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 2,
    category: 'GROUP BY와 집계 함수',
    subCategory: 'SELECT 문의 논리적 수행 순서 (6단계)',
    title:
      '[SELECT문 논리적 수행 순서] FROM(1) > WHERE(2) > GROUP BY(3) > HAVING(4) > SELECT(5) > ORDER BY(6)',
    description:
      '**【SQLD 시험 1순위 핵심 이론: SELECT 문의 6단계 논리적 수행 순서】**\nSQL 문장의 작성 순서와 실제 DBMS 내부의 논리적 실행 순서는 다릅니다. 각 단계별 데이터 필터링 과정을 추적합니다.\n\n```\n[작성 순서]  SELECT(5) -> FROM(1) -> WHERE(2) -> GROUP BY(3) -> HAVING(4) -> ORDER BY(6)\n[실행 순서]  FROM(1)   -> WHERE(2)  -> GROUP BY(3) -> HAVING(4)   -> SELECT(5)   -> ORDER BY(6)\n```\n\n🔍 **`emp_sample` 테이블의 단계별 데이터 변화 추적**:\n1. **`FROM emp_sample` (1단계)**: 전체 5개 행 로드\n2. **`WHERE sal >= 1500` (2단계)**: 김철수(1000) 탈락 ➔ 4명 잔류 (이영희 2000, 박민수 3000, 최유나 4000, 정동원 5000)\n3. **`GROUP BY deptno` (3단계)**: 10번 부서(이영희 1명: 평균 2000) / 20번 부서(3명: 평균 4000) 그룹화\n4. **`HAVING AVG(sal) >= 3000` (4단계)**: 10번 부서(평균 2000) 탈락 ➔ **20번 부서(평균 4000)만 잔류**\n5. **`SELECT deptno, COUNT(*) AS emp_cnt, AVG(sal) AS avg_sal, SUM(sal) AS total_sal` (5단계)**: 출력 컬럼 연산 및 별칭(`avg_sal`) 부여\n6. **`ORDER BY avg_sal DESC` (6단계)**: 5단계에서 부여된 별칭 `avg_sal`을 사용하여 최종 내림차순 정렬\n\n💡 **【SQLD 단골 오답 3대 포인트 완벽 이해】**:\n- **`WHERE` 절에 집계 함수 사용 불가**: 2단계 `WHERE`는 3단계 `GROUP BY`보다 먼저 실행되므로 그룹 집계 결과(`AVG`, `SUM`)가 존재하지 않습니다!\n- **`WHERE` / `HAVING` 절에 `SELECT`의 별칭(Alias) 사용 불가**: 2단계와 4단계는 5단계 `SELECT`보다 먼저 실행되므로 별칭을 아직 알지 못합니다!\n- **`ORDER BY` 절에 `SELECT`의 별칭 사용 가능**: 6단계 `ORDER BY`는 5단계 `SELECT` 이후에 실행되므로 `avg_sal` 별칭이나 컬럼 순번을 자유롭게 사용할 수 있습니다!',
    initialQuery: `SELECT deptno,\n       COUNT(*) AS emp_cnt,\n       AVG(sal) AS avg_sal,\n       SUM(sal) AS total_sal\nFROM emp_sample\nWHERE sal >= 1500\nGROUP BY deptno\nHAVING AVG(sal) >= 3000\nORDER BY avg_sal DESC;`,
    solutionQuery: `SELECT deptno, COUNT(*) AS emp_cnt, AVG(sal) AS avg_sal, SUM(sal) AS total_sal FROM emp_sample WHERE sal >= 1500 GROUP BY deptno HAVING AVG(sal) >= 3000 ORDER BY avg_sal DESC`,
    hint: '`SELECT deptno, COUNT(*) AS emp_cnt, AVG(sal) AS avg_sal, SUM(sal) AS total_sal FROM emp_sample WHERE sal >= 1500 GROUP BY deptno HAVING AVG(sal) >= 3000 ORDER BY avg_sal DESC`를 작성하세요.',
    explanation:
      'SELECT 문의 논리적 실행 순서는 FROM(1) -> WHERE(2) -> GROUP BY(3) -> HAVING(4) -> SELECT(5) -> ORDER BY(6)입니다. ORDER BY에서는 SELECT에서 정의한 별칭(Alias)을 참조할 수 있지만, WHERE나 HAVING에서는 참조할 수 없습니다.',
    quickExamples: [
      {
        label: 'WHERE 단계에서 김철수(1000)가 걸러지는 현상 확인',
        query: `SELECT ename, sal, deptno FROM emp_sample WHERE sal >= 1500;`,
        description: '2단계 WHERE sal >= 1500 실행 결과: 4명 잔류',
      },
      {
        label: 'GROUP BY 단계의 부서별 평균 급여 확인',
        query: `SELECT deptno, AVG(sal) AS raw_avg FROM emp_sample WHERE sal >= 1500 GROUP BY deptno;`,
        description: '10번 부서 평균 2000, 20번 부서 평균 4000 확인',
      },
    ],
    tryModifications: [
      {
        label: 'ORDER BY에 컬럼 순번(3번 컬럼 avg_sal) 사용',
        query: `SELECT deptno, COUNT(*) AS emp_cnt, AVG(sal) AS avg_sal FROM emp_sample WHERE sal >= 1500 GROUP BY deptno HAVING AVG(sal) >= 3000 ORDER BY 3 DESC;`,
        guide:
          'SELECT 절의 3번째 컬럼인 avg_sal을 순번(3)으로 정렬해도 동일하게 작동함을 확인해 보세요!',
      },
    ],
  },

  // =========================================================================
  // 대분류: ORDER BY 정렬 (Sorting & ORDER BY)
  // =========================================================================

  // -------------------------------------------------------------------------
  // 카테고리: ORDER BY 정렬 > 하위 카테고리: 오름차순(ASC)과 내림차순(DESC)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-order-1',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 1,
    category: 'ORDER BY 정렬',
    subCategory: '오름차순(ASC)과 내림차순(DESC)',
    title: '[기본 정렬과 생략 규칙] ASC, DESC 및 생략 시 기본값(ASC)',
    description:
      '사원 샘플 테이블 `emp_sample`을 활용하여 급여(`sal`)를 기준으로 오름차순(`ASC`)과 내림차순(`DESC`) 정렬을 실습합니다.\n\n1. **`ORDER BY sal ASC` (오름차순)**: 작은 값부터 큰 값 순서로 정렬 (`1000 ➔ 2000 ➔ 3000 ➔ 4000 ➔ 5000`)\n2. **`ORDER BY sal` (키워드 생략)**: `ASC`나 `DESC`를 생략하면 **기본값으로 오름차순(`ASC`)이 자동 적용**됩니다!\n3. **`ORDER BY sal DESC` (내림차순)**: 큰 값부터 작은 값 순서로 정렬 (`5000 ➔ 4000 ➔ 3000 ➔ 2000 ➔ 1000`)\n\n💡 **핵심 관전 포인트**:\n- `ASC` (Ascending): 오름차순 (숫자: 작은수 ➔ 큰수 / 문자: A ➔ Z, 가 ➔ 하 / 날짜: 과거 ➔ 미래)\n- `DESC` (Descending): 내림차순 (숫자: 큰수 ➔ 작은수 / 문자: Z ➔ A, 하 ➔ 가 / 날짜: 미래 ➔ 과거)\n- `ORDER BY` 절에서 정렬 방식을 생략하면 무조건 **`ASC` (오름차순)**로 동작합니다.',
    initialQuery: `SELECT ename, sal, deptno\nFROM emp_sample\nORDER BY sal DESC;`,
    solutionQuery: `SELECT ename, sal, deptno FROM emp_sample ORDER BY sal DESC`,
    hint: '`SELECT ename, sal, deptno FROM emp_sample ORDER BY sal DESC`를 작성하세요.',
    explanation:
      '1. ORDER BY 컬럼 [ASC|DESC]: 결과 데이터를 특정 컬럼 기준으로 정렬합니다.\n2. ASC(오름차순)는 생략 가능하며 기본값입니다.\n3. DESC(내림차순)는 큰 값부터 역순으로 정렬합니다.',
    quickExamples: [
      {
        label: 'ASC 생략 시 기본 오름차순 정렬 확인 (ORDER BY sal)',
        query: `SELECT ename, sal FROM emp_sample ORDER BY sal;`,
        description: '1000부터 5000까지 오름차순으로 출력됨 확인',
      },
      {
        label: '이름(ename) 가나다 오름차순 정렬',
        query: `SELECT ename, sal FROM emp_sample ORDER BY ename ASC;`,
        description: '김철수 -> 박민수 -> 이영희 -> 정동원 -> 최유나 순서 확인',
      },
    ],
    tryModifications: [
      {
        label: '이름(ename) 내림차순(DESC) 정렬로 변경',
        query: `SELECT ename, sal FROM emp_sample ORDER BY ename DESC;`,
        guide: '최유나부터 김철수까지 역순으로 정렬되는지 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: ORDER BY 정렬 > 하위 카테고리: 다중 컬럼 정렬
  // -------------------------------------------------------------------------
  {
    id: 'sqld-order-2',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 1,
    category: 'ORDER BY 정렬',
    subCategory: '다중 컬럼 정렬',
    title: '[다중 컬럼 정렬] 여러 컬럼 기준의 복합 정렬 (1차 정렬 -> 2차 정렬)',
    description:
      '사원 샘플 테이블 `emp_sample`을 활용하여 2개 이상의 컬럼을 기준으로 정렬하는 복합 정렬을 실습합니다.\n\n1. **`ORDER BY deptno ASC, sal DESC`**:\n   - **1차 정렬 기준 (`deptno ASC`)**: 부서 번호 오름차순 (10번 부서 ➔ 20번 부서)\n   - **2차 정렬 기준 (`sal DESC`)**: 같은 부서 내에서는 급여가 높은 순서대로 내림차순\n     - 10번 부서 내: 이영희(2000) ➔ 김철수(1000)\n     - 20번 부서 내: 정동원(5000) ➔ 최유나(4000) ➔ 박민수(3000)\n\n💡 **핵심 관전 포인트**:\n- 콤마(`,`)로 여러 컬럼을 나열하면 **왼쪽 컬럼부터 순서대로 1차, 2차, 3차 정렬 기준**이 됩니다.\n- 1차 정렬 기준의 값이 서로 다를 때는 2차 기준이 적용되지 않고, **1차 기준의 값이 동일한 행들 사이에서만 2차 정렬 기준이 동작**합니다.',
    initialQuery: `SELECT deptno, ename, sal\nFROM emp_sample\nORDER BY deptno ASC, sal DESC;`,
    solutionQuery: `SELECT deptno, ename, sal FROM emp_sample ORDER BY deptno ASC, sal DESC`,
    hint: '`SELECT deptno, ename, sal FROM emp_sample ORDER BY deptno ASC, sal DESC`를 작성하세요.',
    explanation:
      '다중 컬럼 정렬은 ORDER BY col1 [ASC|DESC], col2 [ASC|DESC] 형식으로 작성하며, 앞선 컬럼의 값이 동일할 때 뒤에 지정된 컬럼으로 정렬합니다.',
    quickExamples: [
      {
        label: '부서 오름차순, 이름 가나다 오름차순 (deptno ASC, ename ASC)',
        query: `SELECT deptno, ename, sal FROM emp_sample ORDER BY deptno, ename;`,
        description: '10번(김철수->이영희), 20번(박민수->정동원->최유나) 확인',
      },
    ],
    tryModifications: [
      {
        label: '1차 급여 내림차순, 2차 부서 오름차순으로 순서 변경',
        query: `SELECT ename, sal, deptno FROM emp_sample ORDER BY sal DESC, deptno ASC;`,
        guide: '정렬 순서가 바뀌었을 때 결과가 어떻게 달라지는지 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: ORDER BY 정렬 > 하위 카테고리: ALIAS와 컬럼 순번 정렬
  // -------------------------------------------------------------------------
  {
    id: 'sqld-order-3',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 2,
    category: 'ORDER BY 정렬',
    subCategory: 'ALIAS와 컬럼 순번 정렬',
    title: '[별칭과 순번 정렬] SELECT 절의 ALIAS 및 컬럼 번호(순번) 정렬',
    description:
      '**【SQLD 시험 최고 빈출: ORDER BY 절에서 ALIAS 사용 가능 여부】**\nSQL 실행 순서 상 `ORDER BY`(6단계)는 `SELECT`(5단계) 이후에 실행되므로, `SELECT` 절에서 정의한 별칭(Alias)이나 컬럼 순번을 자유롭게 사용할 수 있습니다.\n\n1. **`SELECT` 절의 별칭으로 정렬 (`ORDER BY annual_sal DESC`)**: 연봉(`sal * 12`) 별칭을 직접 정렬 기준으로 사용 (⭕ 허용)\n2. **`SELECT` 절의 컬럼 순번으로 정렬 (`ORDER BY 3 DESC`)**: 3번째 컬럼 `annual_sal`을 번호로 지정하여 정렬 (⭕ 허용)\n3. **표현식 직접 기술 (`ORDER BY sal * 12 DESC`)**: 계산식을 그대로 정렬 기준으로 사용 (⭕ 허용)\n\n💡 **【SQLD 필수 비교: WHERE vs HAVING vs ORDER BY 별칭 사용 규칙】**:\n- **`WHERE` 절**: 2단계 실행 ➔ `SELECT` 별칭 사용 **불가 ❌** (`WHERE annual_sal >= 30000` 에러!)\n- **`HAVING` 절**: 4단계 실행 ➔ `SELECT` 별칭 사용 **불가 ❌**\n- **`ORDER BY` 절**: **6단계 실행 ➔ `SELECT` 별칭 및 컬럼 순번 사용 완벽 허용 ⭕**',
    initialQuery: `SELECT ename,\n       sal,\n       sal * 12 AS annual_sal,\n       sal + NVL(comm, 0) AS total_pay\nFROM emp_sample\nORDER BY annual_sal DESC;`,
    solutionQuery: `SELECT ename, sal, sal * 12 AS annual_sal, sal + NVL(comm, 0) AS total_pay FROM emp_sample ORDER BY annual_sal DESC`,
    hint: '`SELECT ename, sal, sal * 12 AS annual_sal, sal + NVL(comm, 0) AS total_pay FROM emp_sample ORDER BY annual_sal DESC`를 작성하세요.',
    explanation:
      'ORDER BY 절은 SELECT 절보다 나중에 실행되므로, SELECT 절에 명시된 컬럼 별칭(Alias)과 컬럼 순번(1, 2, 3...)을 정렬 기준으로 참조할 수 있습니다.',
    quickExamples: [
      {
        label: '컬럼 순번(4번째 컬럼 total_pay)으로 정렬 (ORDER BY 4 DESC)',
        query: `SELECT ename, sal, sal * 12 AS annual_sal, sal + NVL(comm, 0) AS total_pay FROM emp_sample ORDER BY 4 DESC;`,
        description: '총 지급액(total_pay) 기준 내림차순 정렬 확인',
      },
      {
        label: '표현식 직접 기술 정렬 (ORDER BY sal + NVL(comm, 0) DESC)',
        query: `SELECT ename, sal, comm FROM emp_sample ORDER BY sal + NVL(comm, 0) DESC;`,
        description: 'SELECT에 없는 계산식으로도 정렬 가능함 확인',
      },
    ],
    tryModifications: [
      {
        label: '2차 정렬에 이름(ename) 순번(1) 추가 (ORDER BY annual_sal DESC, 1 ASC)',
        query: `SELECT ename, sal, sal * 12 AS annual_sal FROM emp_sample ORDER BY annual_sal DESC, 1 ASC;`,
        guide: '별칭과 컬럼 순번을 혼합하여 정렬하는 실습을 해보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: ORDER BY 정렬 > 하위 카테고리: NULL 정렬 순서 (오라클 특성)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-order-4',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 2,
    category: 'ORDER BY 정렬',
    subCategory: 'NULL 정렬 순서 (오라클 특성)',
    title: '[NULL의 정렬 순서] 오라클 기본 규칙과 NULLS FIRST / NULLS LAST',
    description:
      '**【SQLD 단골 핵심: 오라클에서 NULL의 정렬 위치】**\n사원 샘플 테이블 `emp_sample`을 활용하여 커미션(`comm`)의 `NULL` 데이터가 오름차순/내림차순 시 어느 위치에 배치되는지 실습합니다.\n\n1. **오라클의 NULL 취급 원칙**:\n   - 오라클은 `NULL`을 **가장 큰 무한대 값**으로 취급합니다!\n2. **`ORDER BY comm DESC` (내림차순)**:\n   - `NULL`이 가장 큰 값이므로 **맨 처음(NULLS FIRST)에 위치**합니다!\n   - 순서: `NULL(이영희, 최유나) ➔ 200(박민수) ➔ 100(김철수) ➔ 0(정동원)`\n3. **`ORDER BY comm ASC` (오름차순)**:\n   - `NULL`이 가장 큰 값이므로 **맨 마지막(NULLS LAST)에 위치**합니다!\n   - 순서: `0(정동원) ➔ 100(김철수) ➔ 200(박민수) ➔ NULL(이영희, 최유나)`\n\n💡 **【명시적 제어 옵션: NULLS FIRST / NULLS LAST】**:\n- `ORDER BY comm DESC NULLS LAST`: 내림차순 정렬하되 NULL을 맨 뒤로 보냄\n- `ORDER BY comm ASC NULLS FIRST`: 오름차순 정렬하되 NULL을 맨 앞으로 보냄',
    initialQuery: `SELECT ename, sal, comm\nFROM emp_sample\nORDER BY comm DESC;`,
    solutionQuery: `SELECT ename, sal, comm FROM emp_sample ORDER BY comm DESC`,
    hint: '`SELECT ename, sal, comm FROM emp_sample ORDER BY comm DESC`를 작성하세요.',
    explanation:
      '1. 오라클에서 NULL은 가장 큰 값으로 간주됩니다.\n2. ASC(오름차순) 시 NULL은 맨 뒤(NULLS LAST)에 위치합니다.\n3. DESC(내림차순) 시 NULL은 맨 앞(NULLS FIRST)에 위치합니다.\n4. NULLS FIRST/NULLS LAST 옵션으로 정렬 위치를 변경할 수 있습니다.',
    quickExamples: [
      {
        label: '오름차순 시 NULL이 맨 마지막에 오는 현상 확인 (ORDER BY comm ASC)',
        query: `SELECT ename, comm FROM emp_sample ORDER BY comm ASC;`,
        description: '0 -> 100 -> 200 -> NULL 순서 확인',
      },
      {
        label: '내림차순이면서 NULL을 맨 뒤로 보내기 (NULLS LAST)',
        query: `SELECT ename, comm FROM emp_sample ORDER BY comm DESC NULLS LAST;`,
        description: '200 -> 100 -> 0 -> NULL 순서로 출력됨 확인',
      },
    ],
    tryModifications: [
      {
        label: '오름차순이면서 NULL을 맨 앞으로 가져오기 (NULLS FIRST)',
        query: `SELECT ename, comm FROM emp_sample ORDER BY comm ASC NULLS FIRST;`,
        guide: 'NULL 사원 2명이 최상단에 출력되는지 확인해 보세요!',
      },
    ],
  },

  // =========================================================================
  // 대분류: JOIN (조인)
  // =========================================================================

  // -------------------------------------------------------------------------
  // 카테고리: JOIN (조인) > 하위 카테고리: EQUI JOIN (오라클 전통)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-join-1',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 1,
    category: 'JOIN (조인)',
    subCategory: 'EQUI JOIN (오라클 전통)',
    title: '[등가 조인] EQUI JOIN (오라클 전통 문법)',
    description:
      '사원 샘플 테이블 `emp_sample`과 부서 테이블 `dept`를 활용하여 동등(`=`) 비교 연산자로 연결하는 오라클 전통 방식의 `EQUI JOIN (등가 조인)`을 실습합니다.\n\n1. **조인 원리**:\n   - `emp_sample`의 `deptno`와 `dept`의 `deptno`가 **동일한 행만 결합**하여 출력합니다.\n2. **결과 분석**:\n   - 10번 부서 사원 2명(김철수, 이영희) ➔ `ACCOUNTING` 부서 정보와 결합\n   - 20번 부서 사원 3명(박민수, 최유나, 정동원) ➔ `RESEARCH` 부서 정보와 결합\n   - 사원이 배속되지 않은 30, 40, 50번 부서는 결과에서 제외됨 (총 5행 출력)\n\n💡 **핵심 관전 포인트**:\n- `FROM` 절에 조인할 테이블들을 콤마(`,`)로 나열하고, `WHERE` 절에 `e.deptno = d.deptno` 조인 조건을 명시합니다.\n- 공통 컬럼(`deptno`)을 `SELECT` 절에 쓸 때는 어느 테이블의 컬럼인지 식별할 수 있도록 반드시 **테이블 별칭(`e.deptno` 또는 `d.deptno`)**을 명시해야 합니다.',
    initialQuery: `SELECT e.empno,\n       e.ename,\n       e.sal,\n       e.deptno,\n       d.dname,\n       d.loc\nFROM emp_sample e, dept d\nWHERE e.deptno = d.deptno\nORDER BY e.empno;`,
    solutionQuery: `SELECT e.empno, e.ename, e.sal, e.deptno, d.dname, d.loc FROM emp_sample e, dept d WHERE e.deptno = d.deptno ORDER BY e.empno`,
    hint: '`FROM emp_sample e, dept d WHERE e.deptno = d.deptno ORDER BY e.empno`를 작성하세요.',
    explanation:
      '1. EQUI JOIN: 두 테이블의 지정된 컬럼 값이 정확히 일치(=)하는 행을 결합하는 조인 방식입니다.\n2. WHERE 절에 조인 조건을 기술하며, 추가 검색 조건이 있을 경우 AND로 연결합니다.',
    quickExamples: [
      {
        label: '조인 조건과 추가 WHERE 조건 결합 (sal >= 3000)',
        query: `SELECT e.ename, e.sal, d.dname FROM emp_sample e, dept d WHERE e.deptno = d.deptno AND e.sal >= 3000;`,
        description: '급여 3000 이상 사원(3명)의 부서명 조회',
      },
    ],
    tryModifications: [
      {
        label: '부서 번호 10번 사원만 필터링',
        query: `SELECT e.ename, d.dname, d.loc FROM emp_sample e, dept d WHERE e.deptno = d.deptno AND e.deptno = 10;`,
        guide: '10번 부서 사원 2명만 출력되는지 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: JOIN (조인) > 하위 카테고리: Non EQUI JOIN (비등가 조인)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-join-2',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 1,
    category: 'JOIN (조인)',
    subCategory: 'Non EQUI JOIN (비등가 조인)',
    title: '[비등가 조인] Non EQUI JOIN (BETWEEN 급여 등급 매핑)',
    description:
      '사원 샘플 테이블 `emp_sample`과 급여 등급 테이블 `salgrade`를 활용하여 동등(`=`) 조건이 아닌 범위(`BETWEEN`) 연산자로 조인하는 `Non-EQUI JOIN (비등가 조인)`을 실습합니다.\n\n1. **급여 등급 기준표 (`salgrade`)**:\n   - 1등급: 700 ~ 1200\n   - 2등급: 1201 ~ 1400\n   - 3등급: 1401 ~ 2000\n   - 4등급: 2001 ~ 3000\n   - 5등급: 3001 ~ 9999\n2. **조인 조건**: `WHERE e.sal BETWEEN s.losal AND s.hisal`\n   - 김철수 (1000) ➔ **Grade 1**\n   - 이영희 (2000) ➔ **Grade 3**\n   - 박민수 (3000) ➔ **Grade 4**\n   - 최유나 (4000) ➔ **Grade 5**\n   - 정동원 (5000) ➔ **Grade 5**\n\n💡 **핵심 관전 포인트**:\n- 두 테이블 간에 정확히 일치하는 공통 키 컬럼이 없을 때, 범위(`BETWEEN`), 부등호(`>`, `<`, `>=`, `<=`) 등의 연산자를 사용하여 조인하는 방식을 Non-EQUI JOIN이라고 합니다.',
    initialQuery: `SELECT e.empno,\n       e.ename,\n       e.sal,\n       s.grade,\n       s.losal,\n       s.hisal\nFROM emp_sample e, salgrade s\nWHERE e.sal BETWEEN s.losal AND s.hisal\nORDER BY e.empno;`,
    solutionQuery: `SELECT e.empno, e.ename, e.sal, s.grade, s.losal, s.hisal FROM emp_sample e, salgrade s WHERE e.sal BETWEEN s.losal AND s.hisal ORDER BY e.empno`,
    hint: '`FROM emp_sample e, salgrade s WHERE e.sal BETWEEN s.losal AND s.hisal ORDER BY e.empno`를 작성하세요.',
    explanation:
      'Non-EQUI JOIN: 조인 조건에 = 연산자가 아닌 BETWEEN, >, <, >=, <= 등의 연산자를 사용하는 조인입니다.',
    quickExamples: [
      {
        label: '4등급 이상(고액 급여) 사원만 필터링',
        query: `SELECT e.ename, e.sal, s.grade FROM emp_sample e, salgrade s WHERE e.sal BETWEEN s.losal AND s.hisal AND s.grade >= 4;`,
        description: 'Grade 4, 5에 해당하는 사원 3명 조회',
      },
    ],
    tryModifications: [
      {
        label: '등급(grade)별 사원 수 집계 (GROUP BY와 결합)',
        query: `SELECT s.grade, COUNT(*) AS emp_cnt, AVG(e.sal) AS avg_sal FROM emp_sample e, salgrade s WHERE e.sal BETWEEN s.losal AND s.hisal GROUP BY s.grade ORDER BY s.grade;`,
        guide: '비등가 조인 후 등급별로 사원 수를 집계해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: JOIN (조인) > 하위 카테고리: 3개 이상 다중 테이블 조인
  // -------------------------------------------------------------------------
  {
    id: 'sqld-join-3',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 2,
    category: 'JOIN (조인)',
    subCategory: '3개 이상 다중 테이블 조인',
    title: '[3개 이상 다중 조인] 3개 TABLE JOIN (N개 테이블과 N-1개 조건)',
    description:
      '**【SQLD 핵심 규칙: $N$개 테이블 조인 시 최소 $N-1$개의 조인 조건 필요】**\n사원(`emp_sample`), 부서(`dept`), 급여등급(`salgrade`) 3개 테이블을 동시에 결합하여 사원 정보, 부서 정보, 급여 등급을 한 번에 조회합니다.\n\n1. **조인 조건 2개 ($3 - 1 = 2$)**:\n   - 조건 1 (EQUI): `e.deptno = d.deptno` (사원과 부서 매핑)\n   - 조건 2 (Non-EQUI): `e.sal BETWEEN s.losal AND s.hisal` (사원과 급여 등급 매핑)\n\n💡 **핵심 관전 포인트**:\n- 3개 이상의 테이블을 조인할 때는 테이블의 조인 순서에 관계없이 논리적으로 $N-1$개의 조인 조건이 반드시 필요합니다.\n- 조인 조건이 하나라도 누락되면 원치 않는 카테시안 곱(Cartesian Product)이 발생합니다.',
    initialQuery: `SELECT e.empno,\n       e.ename,\n       d.dname,\n       e.sal,\n       s.grade\nFROM emp_sample e, dept d, salgrade s\nWHERE e.deptno = d.deptno\n  AND e.sal BETWEEN s.losal AND s.hisal\nORDER BY e.empno;`,
    solutionQuery: `SELECT e.empno, e.ename, d.dname, e.sal, s.grade FROM emp_sample e, dept d, salgrade s WHERE e.deptno = d.deptno AND e.sal BETWEEN s.losal AND s.hisal ORDER BY e.empno`,
    hint: '`FROM emp_sample e, dept d, salgrade s WHERE e.deptno = d.deptno AND e.sal BETWEEN s.losal AND s.hisal ORDER BY e.empno`를 작성하세요.',
    explanation:
      'N개의 테이블을 조인하려면 최소 N-1개의 조인 조건이 필요합니다. 3개 테이블 조인 시 2개의 조인 조건을 AND로 연결합니다.',
    quickExamples: [
      {
        label: 'RESEARCH 부서 소속 사원의 등급만 조회',
        query: `SELECT e.ename, d.dname, s.grade FROM emp_sample e, dept d, salgrade s WHERE e.deptno = d.deptno AND e.sal BETWEEN s.losal AND s.hisal AND d.dname = 'RESEARCH';`,
        description: '20번 RESEARCH 부서 사원 3명의 등급 조회',
      },
    ],
    tryModifications: [
      {
        label: '부서명(dname)과 등급(grade)으로 정렬 변경',
        query: `SELECT d.dname, s.grade, e.ename, e.sal FROM emp_sample e, dept d, salgrade s WHERE e.deptno = d.deptno AND e.sal BETWEEN s.losal AND s.hisal ORDER BY d.dname, s.grade DESC;`,
        guide: '다중 테이블 조인 결과를 원하는 기준으로 정렬해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: JOIN (조인) > 하위 카테고리: Oracle OUTER JOIN ((+) 기호)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-join-4',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 2,
    category: 'JOIN (조인)',
    subCategory: 'Oracle OUTER JOIN ((+) 기호)',
    title: '[오라클 외부 조인] Oracle OUTER JOIN ((+) 기호의 원리와 위치)',
    description:
      '**【SQLD 시험 단골 핵심: 오라클 (+) 기호의 위치와 의미】**\n사원 샘플 테이블 `emp_sample`과 부서 테이블 `dept`를 활용하여 사원이 없는 부서까지 누락 없이 조회하는 오라클 전용 `OUTER JOIN`을 실습합니다.\n\n1. **조인 문법**: `WHERE e.deptno(+) = d.deptno`\n2. **`(+)` 기호의 규칙**:\n   - **데이터가 부족한(없는) 쪽에 `(+)`를 붙입니다.**\n   - 사원이 없는 부서(30 SALES, 40 OPERATIONS, 50 PLANNING)의 사원 정보 자리에 `NULL`을 채워서 **`dept` 테이블의 모든 부서를 보존(RIGHT OUTER JOIN 효과)**합니다.\n   - 결과: 총 8개 행 (사원 5명 + 사원 없는 부서 3개)\n\n💡 **【SQLD 필수 암기: (+) 기호 주의사항】**:\n- `(+)` 연산자는 오라클 전용 문법입니다.\n- 양쪽에 동시에 `(+)`를 붙여 FULL OUTER JOIN을 수행하는 것은 **불가능**합니다! (`WHERE e.deptno(+) = d.deptno(+)` ❌ 에러!)',
    initialQuery: `SELECT d.deptno,\n       d.dname,\n       e.ename,\n       e.sal\nFROM emp_sample e, dept d\nWHERE e.deptno(+) = d.deptno\nORDER BY d.deptno, e.empno;`,
    solutionQuery: `SELECT d.deptno, d.dname, e.ename, e.sal FROM emp_sample e, dept d WHERE e.deptno(+) = d.deptno ORDER BY d.deptno, e.empno`,
    hint: '`WHERE e.deptno(+) = d.deptno`를 작성하세요.',
    explanation:
      '1. 오라클 (+) 연산자는 조인할 데이터가 부족한(null로 채워질) 쪽에 붙입니다.\n2. e.deptno(+) = d.deptno는 dept 테이블의 모든 행을 보존하는 RIGHT OUTER JOIN과 같습니다.\n3. 양쪽에 (+)를 동시에 붙이는 FULL OUTER JOIN은 지원되지 않습니다.',
    quickExamples: [
      {
        label: '사원이 배속되지 않은 유령 부서만 찾기 (IS NULL)',
        query: `SELECT d.deptno, d.dname FROM emp_sample e, dept d WHERE e.deptno(+) = d.deptno AND e.empno IS NULL;`,
        description: '30 SALES, 40 OPERATIONS, 50 PLANNING 3개 부서 조회',
      },
    ],
    tryModifications: [
      {
        label: '부서별 사원 수 집계 (0명 부서 포함)',
        query: `SELECT d.deptno, d.dname, COUNT(e.empno) AS emp_count FROM emp_sample e, dept d WHERE e.deptno(+) = d.deptno GROUP BY d.deptno, d.dname ORDER BY d.deptno;`,
        guide: 'COUNT(e.empno)를 쓰면 0명 부서가 0으로 정확히 집계됨을 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: JOIN (조인) > 하위 카테고리: STANDARD INNER JOIN (ON / USING)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-join-5',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 1,
    category: 'JOIN (조인)',
    subCategory: 'STANDARD INNER JOIN (ON / USING)',
    title: '[표준 내부 조인] STANDARD INNER JOIN (ON절 vs USING절)',
    description:
      'ANSI/ISO SQL 표준 문법인 `INNER JOIN`을 `ON` 절과 `USING` 절의 두 가지 방식으로 실습합니다.\n\n1. **`ON` 절 방식**: `FROM emp_sample e [INNER] JOIN dept d ON e.deptno = d.deptno`\n   - 조인 조건 컬럼의 이름이 같거나 달라도 사용 가능하며, `SELECT` 절에서 `e.deptno` 또는 `d.deptno`로 테이블 별칭을 명시해야 합니다.\n2. **`USING` 절 방식**: `FROM emp_sample e [INNER] JOIN dept d USING (deptno)`\n   - 두 테이블의 조인 컬럼명이 정확히 일치할 때 사용합니다.\n   - **【SQLD 단골 오답】**: `USING` 절에 사용된 컬럼은 `SELECT` 절에서 **테이블 별칭/접두사(`e.deptno`, `d.deptno`)를 붙이면 문법 에러**가 발생하며, 순수하게 `deptno`로만 작성해야 합니다!\n\n💡 **핵심 관전 포인트**:\n- `INNER` 키워드는 생략 가능하여 `JOIN`만 기술해도 기본적으로 `INNER JOIN`으로 동작합니다.',
    initialQuery: `SELECT e.empno,\n       e.ename,\n       e.sal,\n       deptno,\n       d.dname\nFROM emp_sample e\nINNER JOIN dept d USING (deptno)\nORDER BY e.empno;`,
    solutionQuery: `SELECT e.empno, e.ename, e.sal, deptno, d.dname FROM emp_sample e INNER JOIN dept d USING (deptno) ORDER BY e.empno`,
    hint: '`SELECT e.empno, e.ename, e.sal, deptno, d.dname FROM emp_sample e INNER JOIN dept d USING (deptno) ORDER BY e.empno`를 작성하세요.',
    explanation:
      '1. ON 절: ON e.deptno = d.deptno 형식으로 작성하며 임의의 조건식을 지원합니다.\n2. USING 절: USING (deptno) 형식으로 작성하며, 조인 컬럼에는 테이블 별칭(e. 또는 d.)을 붙일 수 없습니다.',
    quickExamples: [
      {
        label: 'ON 절을 사용한 표준 INNER JOIN',
        query: `SELECT e.empno, e.ename, e.deptno, d.dname FROM emp_sample e INNER JOIN dept d ON e.deptno = d.deptno;`,
        description: 'ON 절에서는 e.deptno처럼 별칭 명시 필수',
      },
    ],
    tryModifications: [
      {
        label: 'INNER 키워드를 생략한 JOIN 문법 테스트',
        query: `SELECT e.ename, d.dname FROM emp_sample e JOIN dept d ON e.deptno = d.deptno;`,
        guide: 'INNER 키워드를 생략해도 동일한 내부 조인이 수행되는지 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: JOIN (조인) > 하위 카테고리: STANDARD OUTER JOIN (LEFT, RIGHT, FULL)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-join-6',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 2,
    category: 'JOIN (조인)',
    subCategory: 'STANDARD OUTER JOIN (LEFT, RIGHT, FULL)',
    title: '[표준 외부 조인] LEFT / RIGHT / FULL OUTER JOIN',
    description:
      'ANSI SQL 표준 외부 조인 3종(`LEFT OUTER JOIN`, `RIGHT OUTER JOIN`, `FULL OUTER JOIN`)을 실습합니다.\n\n1. **`LEFT [OUTER] JOIN`**:\n   - 왼쪽 테이블(`emp_sample`)의 모든 사원을 기준 삼아 보존 (5행)\n2. **`RIGHT [OUTER] JOIN`**:\n   - 오른쪽 테이블(`dept`)의 모든 부서를 기준 삼아 보존 (사원 없는 30, 40, 50번 부서 포함 8행)\n3. **`FULL [OUTER] JOIN`**:\n   - 양쪽 테이블(`emp_sample`과 `dept`)의 모든 행을 하나도 빠짐없이 보존 (오라클 (+) 문법으로는 불가능하며 표준 조인으로만 가능!)\n\n💡 **핵심 관전 포인트**:\n- `OUTER` 키워드는 생략 가능합니다 (`LEFT JOIN`, `RIGHT JOIN`, `FULL JOIN`).\n- 기준 테이블에 매칭되는 상대방 데이터가 없으면 모든 컬럼이 `NULL`로 채워집니다.',
    initialQuery: `SELECT d.deptno,\n       d.dname,\n       e.ename,\n       e.sal\nFROM emp_sample e\nRIGHT OUTER JOIN dept d ON e.deptno = d.deptno\nORDER BY d.deptno, e.empno;`,
    solutionQuery: `SELECT d.deptno, d.dname, e.ename, e.sal FROM emp_sample e RIGHT OUTER JOIN dept d ON e.deptno = d.deptno ORDER BY d.deptno, e.empno`,
    hint: '`FROM emp_sample e RIGHT OUTER JOIN dept d ON e.deptno = d.deptno ORDER BY d.deptno, e.empno`를 작성하세요.',
    explanation:
      '1. LEFT OUTER JOIN: 왼쪽 테이블의 모든 행을 보존합니다.\n2. RIGHT OUTER JOIN: 오른쪽 테이블의 모든 행을 보존합니다.\n3. FULL OUTER JOIN: 양쪽 테이블의 모든 행을 보존하는 합집합 개념의 외부 조인입니다.',
    quickExamples: [
      {
        label: 'LEFT OUTER JOIN 실습 (모든 사원 기준)',
        query: `SELECT e.ename, e.sal, d.dname FROM emp_sample e LEFT OUTER JOIN dept d ON e.deptno = d.deptno;`,
        description: '왼쪽 emp_sample 사원 5명 기준 조인 결과 (5행)',
      },
      {
        label: 'FULL OUTER JOIN 실습 (양쪽 모든 데이터 보존)',
        query: `SELECT d.deptno, d.dname, e.ename FROM emp_sample e FULL OUTER JOIN dept d ON e.deptno = d.deptno ORDER BY d.deptno;`,
        description: '양쪽 테이블의 모든 행 보존 (8행)',
      },
    ],
    tryModifications: [
      {
        label: 'OUTER 키워드 생략 실습 (RIGHT JOIN)',
        query: `SELECT d.deptno, d.dname, e.ename FROM emp_sample e RIGHT JOIN dept d ON e.deptno = d.deptno ORDER BY d.deptno;`,
        guide: 'RIGHT JOIN으로 작성해도 동일하게 작동함을 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: JOIN (조인) > 하위 카테고리: NATURAL JOIN과 CROSS JOIN
  // -------------------------------------------------------------------------
  {
    id: 'sqld-join-7',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 2,
    category: 'JOIN (조인)',
    subCategory: 'NATURAL JOIN과 CROSS JOIN',
    title: '[자연 조인과 교차 조인] NATURAL JOIN vs CROSS JOIN',
    description:
      '**【SQLD 시험 필수 암기: NATURAL JOIN의 별칭 금지 규칙 & CROSS JOIN의 카테시안 곱】**\n\n1. **`NATURAL JOIN (자연 조인)`**:\n   - 두 테이블에서 **이름과 데이터 타입이 같은 모든 컬럼(`deptno`)을 자동으로 찾아 조인**합니다.\n   - `ON` 절이나 `USING` 절을 쓰지 않습니다.\n   - **【SQLD 최고 빈출 에러 문법】**: `NATURAL JOIN`의 조인 기준 컬럼(`deptno`)에는 **테이블 별칭(`e.deptno`, `d.deptno`)을 절대 붙일 수 없습니다!**\n2. **`CROSS JOIN (교차 조인 / 카테시안 곱)`**:\n   - 조인 조건 없이 양쪽 테이블의 모든 행을 상호 곱($M \times N$)합니다.\n   - 사원 5행 $\times$ 부서 5행 = **총 25개 행 조합** 생성!\n\n💡 **핵심 비교**:\n- `NATURAL JOIN`: 공통 컬럼 자동 매칭 (5행)\n- `CROSS JOIN`: 모든 경우의 수 조합 (25행)',
    initialQuery: `SELECT deptno,\n       ename,\n       sal,\n       dname,\n       loc\nFROM emp_sample\nNATURAL JOIN dept\nORDER BY deptno, empno;`,
    solutionQuery: `SELECT deptno, ename, sal, dname, loc FROM emp_sample NATURAL JOIN dept ORDER BY deptno, empno`,
    hint: '`SELECT deptno, ename, sal, dname, loc FROM emp_sample NATURAL JOIN dept ORDER BY deptno, empno`를 작성하세요.',
    explanation:
      '1. NATURAL JOIN: 이름과 데이터 타입이 같은 모든 컬럼을 기준으로 자동 조인합니다. 조인 컬럼에는 테이블 별칭(e. 또는 d.)을 사용할 수 없습니다.\n2. CROSS JOIN: 조인 조건 없이 모든 행의 조합(카테시안 곱, M * N)을 생성합니다.',
    quickExamples: [
      {
        label: 'CROSS JOIN으로 5 * 5 = 25개 조합 생성',
        query: `SELECT e.ename, d.dname FROM emp_sample e CROSS JOIN dept d;`,
        description: '모든 사원과 모든 부서의 25개 조합 출력 확인',
      },
    ],
    tryModifications: [
      {
        label: '오라클 전통 방식의 CROSS JOIN (콤마 나열)',
        query: `SELECT e.ename, d.dname FROM emp_sample e, dept d;`,
        guide:
          'WHERE 절 없이 테이블을 콤마로 나열하면 동일하게 CROSS JOIN(25행)이 됨을 확인해 보세요!',
      },
    ],
  },

  // =========================================================================
  // 대분류: 서브쿼리 (Subquery)
  // =========================================================================

  // -------------------------------------------------------------------------
  // 카테고리: 서브쿼리 (Subquery) > 하위 카테고리: 스칼라 서브쿼리 (SELECT절)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-subq-1',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 1,
    category: '서브쿼리 (Subquery)',
    subCategory: '스칼라 서브쿼리 (SELECT절)',
    title: '[스칼라 서브쿼리] SELECT 절의 단일 행·단일 컬럼 서브쿼리',
    description:
      '**【SQLD 핵심 정의: 스칼라 서브쿼리는 반드시 1행 1열을 반환해야 함】**\n`SELECT` 절에서 하나의 값처럼 사용되는 `스칼라 서브쿼리 (Scalar Subquery)`를 실습합니다.\n\n1. **부서명 조회 스칼라 서브쿼리**:\n   - `(SELECT d.dname FROM dept d WHERE d.deptno = e.deptno) AS dept_name`\n   - 사원의 `deptno`와 일치하는 부서명을 1개 가져옵니다.\n2. **전체 평균 급여 스칼라 서브쿼리**:\n   - `(SELECT ROUND(AVG(sal), 0) FROM emp_sample) AS company_avg_sal`\n   - 회사 전체 평균 급여(`3000`)를 모든 행에 동일하게 출력합니다.\n\n💡 **【SQLD 단골 주의사항】**:\n- 스칼라 서브쿼리의 결과가 **2개 이상의 행**을 반환하면 `ORA-01427: single-row subquery returns more than one row` 런타임 에러가 발생합니다!\n- 일치하는 결과가 없으면 에러가 아닌 **`NULL`**을 반환합니다.',
    initialQuery: `SELECT e.empno,\n       e.ename,\n       e.sal,\n       e.deptno,\n       (SELECT d.dname FROM dept d WHERE d.deptno = e.deptno) AS dept_name,\n       (SELECT ROUND(AVG(sal), 0) FROM emp_sample) AS company_avg_sal\nFROM emp_sample e\nORDER BY e.empno;`,
    solutionQuery: `SELECT e.empno, e.ename, e.sal, e.deptno, (SELECT d.dname FROM dept d WHERE d.deptno = e.deptno) AS dept_name, (SELECT ROUND(AVG(sal), 0) FROM emp_sample) AS company_avg_sal FROM emp_sample e ORDER BY e.empno`,
    hint: '`SELECT e.empno, e.ename, e.sal, e.deptno, (SELECT d.dname FROM dept d WHERE d.deptno = e.deptno) AS dept_name, (SELECT ROUND(AVG(sal), 0) FROM emp_sample) AS company_avg_sal FROM emp_sample e ORDER BY e.empno`를 작성하세요.',
    explanation:
      '1. 스칼라 서브쿼리: SELECT 절에 위치하며 정확히 1개의 행과 1개의 열(단일 값)을 반환해야 합니다.\n2. 메인 쿼리의 각 행마다 실행되며, 결과가 없으면 NULL을 반환합니다.',
    quickExamples: [
      {
        label: '소속 부서의 최고 급여를 스칼라 서브쿼리로 조회',
        query: `SELECT e.ename, e.sal, (SELECT MAX(sal) FROM emp_sample sub WHERE sub.deptno = e.deptno) AS dept_max_sal FROM emp_sample e;`,
        description: '10번 부서는 2000, 20번 부서는 5000 반환 확인',
      },
    ],
    tryModifications: [
      {
        label: '부서 위치(loc)도 스칼라 서브쿼리로 추가 조회',
        query: `SELECT e.ename, (SELECT d.loc FROM dept d WHERE d.deptno = e.deptno) AS loc_name FROM emp_sample e;`,
        guide: 'NEW YORK, DALLAS 등의 부서 위치가 출력되는지 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 서브쿼리 (Subquery) > 하위 카테고리: 인라인 뷰 (FROM절)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-subq-2',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 2,
    category: '서브쿼리 (Subquery)',
    subCategory: '인라인 뷰 (FROM절)',
    title: '[인라인 뷰] FROM 절의 동적 가상 테이블과 집계 결합',
    description:
      '**【SQLD 핵심 정의: 인라인 뷰는 FROM 절에 작성되어 동적으로 생성되는 임시 뷰】**\n부서별 평균 급여를 미리 집계하는 인라인 뷰를 `FROM` 절에 정의하고, 사원 테이블과 조인하여 부서 평균 대비 급여 차이를 계산합니다.\n\n1. **인라인 뷰 정의**:\n   ```sql\n   (SELECT deptno, ROUND(AVG(sal), 0) AS avg_sal FROM emp_sample GROUP BY deptno) d_stat\n   ```\n2. **메인 쿼리와 결합**:\n   - `e.sal - d_stat.avg_sal AS diff_from_avg`\n   - 10번 부서(평균 1500): 김철수($-500$), 이영희($+500$)\n   - 20번 부서(평균 4000): 박민수($-1000$), 최유나($0$), 정동원($+1000$)\n\n💡 **핵심 관전 포인트**:\n- 인라인 뷰에서 정의한 별칭(`avg_sal`)은 메인 쿼리의 `SELECT`, `WHERE`, `ORDER BY` 등에서 일반 테이블 컬럼처럼 자유롭게 사용할 수 있습니다.',
    initialQuery: `SELECT e.ename,\n       e.sal,\n       e.deptno,\n       d_stat.avg_sal,\n       e.sal - d_stat.avg_sal AS diff_from_avg\nFROM emp_sample e\nINNER JOIN (\n  SELECT deptno, ROUND(AVG(sal), 0) AS avg_sal\n  FROM emp_sample\n  GROUP BY deptno\n) d_stat ON e.deptno = d_stat.deptno\nORDER BY e.deptno, e.sal DESC;`,
    solutionQuery: `SELECT e.ename, e.sal, e.deptno, d_stat.avg_sal, e.sal - d_stat.avg_sal AS diff_from_avg FROM emp_sample e INNER JOIN (SELECT deptno, ROUND(AVG(sal), 0) AS avg_sal FROM emp_sample GROUP BY deptno) d_stat ON e.deptno = d_stat.deptno ORDER BY e.deptno, e.sal DESC`,
    hint: '`FROM emp_sample e INNER JOIN (SELECT deptno, ROUND(AVG(sal), 0) AS avg_sal FROM emp_sample GROUP BY deptno) d_stat ON e.deptno = d_stat.deptno`를 작성하세요.',
    explanation:
      '1. 인라인 뷰: FROM 절 안에 작성된 서브쿼리로, 쿼리가 실행되는 동안만 존재하는 동적 가상 뷰입니다.\n2. 인라인 뷰 내부의 SELECT 컬럼 별칭은 메인 쿼리에서 컬럼명으로 직접 참조됩니다.',
    quickExamples: [
      {
        label: '급여 내림차순 상위 3명 인라인 뷰 (TOP-N 기초)',
        query: `SELECT ename, sal FROM (SELECT ename, sal FROM emp_sample ORDER BY sal DESC) top_emp;`,
        description: '정렬된 인라인 뷰를 활용한 서브쿼리',
      },
    ],
    tryModifications: [
      {
        label: '인라인 뷰에 부서별 인원수(emp_cnt)도 함께 포함',
        query: `SELECT e.ename, d_stat.emp_cnt FROM emp_sample e INNER JOIN (SELECT deptno, COUNT(*) AS emp_cnt FROM emp_sample GROUP BY deptno) d_stat ON e.deptno = d_stat.deptno;`,
        guide: '인라인 뷰에 다중 집계 컬럼을 추가해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 서브쿼리 (Subquery) > 하위 카테고리: 단일 행 서브쿼리
  // -------------------------------------------------------------------------
  {
    id: 'sqld-subq-3',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 1,
    category: '서브쿼리 (Subquery)',
    subCategory: '단일 행 서브쿼리',
    title: '[단일 행 서브쿼리] 단일 행 비교 연산자 (=, >, <, >=, <=, <>)',
    description:
      '**【SQLD 핵심 정의: 단일 행 서브쿼리는 반드시 1개의 결과 행만 반환】**\n서브쿼리의 결과가 1건인 경우, 단일 행 비교 연산자(`=`, `>`, `<`, `>=`, `<=`, `<>`)를 사용하여 `WHERE` 절에서 필터링합니다.\n\n1. **전체 평균 급여보다 많이 받는 사원**:\n   - `WHERE sal > (SELECT AVG(sal) FROM emp_sample)`\n   - 전체 평균(`3000`) 초과 ➔ 최유나(4000), 정동원(5000) 2명 조회\n2. **최저 급여를 받는 사원**:\n   - `WHERE sal = (SELECT MIN(sal) FROM emp_sample)` ➔ 김철수(1000)\n\n💡 **【SQLD 단골 오류】**:\n- 단일 행 연산자(`=`, `>`)를 썼는데 서브쿼리에서 2건 이상의 행이 반환되면 **`ORA-01427` 에러**가 발생합니다! 복수 행이 반환될 가능성이 있다면 반드시 다중 행 연산자(`IN`, `ANY`, `ALL`)를 써야 합니다.',
    initialQuery: `SELECT ename,\n       sal,\n       deptno\nFROM emp_sample\nWHERE sal > (SELECT AVG(sal) FROM emp_sample)\nORDER BY sal DESC;`,
    solutionQuery: `SELECT ename, sal, deptno FROM emp_sample WHERE sal > (SELECT AVG(sal) FROM emp_sample) ORDER BY sal DESC`,
    hint: '`WHERE sal > (SELECT AVG(sal) FROM emp_sample)`를 작성하세요.',
    explanation:
      '단일 행 서브쿼리는 실행 결과가 항상 1개의 행인 서브쿼리이며, =, >, <, >=, <=, <> 등의 단일 행 비교 연산자와 함께 사용합니다.',
    quickExamples: [
      {
        label: '최고 급여를 받는 사원 조회',
        query: `SELECT ename, sal FROM emp_sample WHERE sal = (SELECT MAX(sal) FROM emp_sample);`,
        description: '최고 급여 5000인 정동원 1명 조회',
      },
    ],
    tryModifications: [
      {
        label: '김철수(1000)의 급여보다 많은 사원들 조회',
        query: `SELECT ename, sal FROM emp_sample WHERE sal > (SELECT sal FROM emp_sample WHERE ename = '김철수');`,
        guide: '김철수를 제외한 나머지 4명이 출력되는지 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 서브쿼리 (Subquery) > 하위 카테고리: 다중 행 서브쿼리 (IN, ANY, ALL, EXISTS)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-subq-4',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 2,
    category: '서브쿼리 (Subquery)',
    subCategory: '다중 행 서브쿼리 (IN, ANY, ALL, EXISTS)',
    title: '[다중 행 서브쿼리] IN, ANY, ALL, EXISTS 연산자',
    description:
      '**【SQLD 최고 빈출 핵심: 다중 행 연산자의 의미와 동작 원리】**\n서브쿼리 결과가 2건 이상 반환될 때 사용하는 다중 행 연산자 4종을 실습합니다.\n\n1. **`IN`**: 목록 중 하나라도 일치하면 참\n   - `WHERE sal IN (SELECT MIN(sal) FROM emp_sample GROUP BY deptno)`\n   - 부서별 최저 급여(`1000`, `3000`)에 해당하는 사원(김철수, 박민수) 조회\n2. **`> ANY` (또는 `> SOME`)**: 서브쿼리 결과의 **최소값보다 큼** (`> MIN` 효과)\n   - `WHERE sal > ANY (SELECT sal FROM emp_sample WHERE deptno = 10)`\n   - 10번 부서 급여(1000, 2000) 중 1000보다 큰 사원들(2000, 3000, 4000, 5000)\n3. **`> ALL`**: 서브쿼리 결과의 **최대값보다 큼** (`> MAX` 효과)\n   - `WHERE sal > ALL (SELECT sal FROM emp_sample WHERE deptno = 10)`\n   - 10번 부서 급여(1000, 2000) 중 2000보다 큰 사원들(3000, 4000, 5000)\n4. **`EXISTS`**: 서브쿼리에 **결과가 1건이라도 존재하는지** 여부만 판별',
    initialQuery: `SELECT ename,\n       sal,\n       deptno\nFROM emp_sample\nWHERE sal IN (SELECT MIN(sal) FROM emp_sample GROUP BY deptno)\nORDER BY deptno;`,
    solutionQuery: `SELECT ename, sal, deptno FROM emp_sample WHERE sal IN (SELECT MIN(sal) FROM emp_sample GROUP BY deptno) ORDER BY deptno`,
    hint: '`WHERE sal IN (SELECT MIN(sal) FROM emp_sample GROUP BY deptno)`를 작성하세요.',
    explanation:
      '1. IN: 서브쿼리 결과 중 하나라도 일치하면 TRUE입니다.\n2. > ANY: 서브쿼리 결과의 최소값보다 크면 TRUE입니다.\n3. > ALL: 서브쿼리 결과의 최대값보다 크면 TRUE입니다.\n4. EXISTS: 서브쿼리 결과가 1건이라도 존재하면 TRUE입니다.',
    quickExamples: [
      {
        label: '> ALL로 10번 부서 전체보다 많이 받는 사원 조회',
        query: `SELECT ename, sal FROM emp_sample WHERE sal > ALL (SELECT sal FROM emp_sample WHERE deptno = 10);`,
        description: '2000 초과인 박민수, 최유나, 정동원 3명 조회',
      },
      {
        label: 'EXISTS 연산자로 커미션 수령 사원 존재 여부 검사',
        query: `SELECT ename, sal FROM emp_sample m WHERE EXISTS (SELECT 1 FROM emp_sample s WHERE s.empno = m.empno AND s.comm > 0);`,
        description: 'comm > 0인 김철수(100), 박민수(200) 조회',
      },
    ],
    tryModifications: [
      {
        label: '< ANY (최대값보다 작음) 연산자 테스트',
        query: `SELECT ename, sal FROM emp_sample WHERE sal < ANY (SELECT sal FROM emp_sample WHERE deptno = 20);`,
        guide: '20번 부서 최대값 5000보다 작은 사원 4명이 출력되는지 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 서브쿼리 (Subquery) > 하위 카테고리: 다중 컬럼 서브쿼리
  // -------------------------------------------------------------------------
  {
    id: 'sqld-subq-5',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 2,
    category: '서브쿼리 (Subquery)',
    subCategory: '다중 컬럼 서브쿼리',
    title: '[다중 컬럼 서브쿼리] (col1, col2) IN 다중 컬럼 동시 비교',
    description:
      '**【SQLD 핵심 문법: 서브쿼리에서 복수 컬럼을 동시에 쌍(Pair)으로 묶어 비교】**\n사원 샘플 테이블 `emp_sample`에서 각 부서별로 최고 급여를 받는 사원을 다중 컬럼 서브쿼리로 한 번에 조회합니다.\n\n1. **다중 컬럼 비교 문법**:\n   ```sql\n   WHERE (deptno, sal) IN (\n     SELECT deptno, MAX(sal)\n     FROM emp_sample\n     GROUP BY deptno\n   )\n   ```\n2. **결과 분석**:\n   - 10번 부서의 최고 급여 쌍 `(10, 2000)` ➔ **이영희**\n   - 20번 부서의 최고 급여 쌍 `(20, 5000)` ➔ **정동원**\n\n💡 **【SQLD 필수 암기 규칙】**:\n- 괄호 안의 컬럼 나열 순서(`deptno, sal`)와 서브쿼리 `SELECT` 절의 컬럼 순서(`deptno, MAX(sal)`) 및 데이터 타입이 완벽히 일치해야 합니다!',
    initialQuery: `SELECT empno,\n       ename,\n       sal,\n       deptno\nFROM emp_sample\nWHERE (deptno, sal) IN (\n  SELECT deptno, MAX(sal)\n  FROM emp_sample\n  GROUP BY deptno\n)\nORDER BY deptno;`,
    solutionQuery: `SELECT empno, ename, sal, deptno FROM emp_sample WHERE (deptno, sal) IN (SELECT deptno, MAX(sal) FROM emp_sample GROUP BY deptno) ORDER BY deptno`,
    hint: '`WHERE (deptno, sal) IN (SELECT deptno, MAX(sal) FROM emp_sample GROUP BY deptno)`를 작성하세요.',
    explanation:
      '다중 컬럼 서브쿼리는 서브쿼리가 여러 개의 컬럼을 반환하며, 메인 쿼리 조건절의 컬럼들과 1:1로 위치 및 데이터 타입이 쌍을 이루어 비교됩니다.',
    quickExamples: [
      {
        label: '부서별 최저 급여 사원을 다중 컬럼 서브쿼리로 조회',
        query: `SELECT ename, sal, deptno FROM emp_sample WHERE (deptno, sal) IN (SELECT deptno, MIN(sal) FROM emp_sample GROUP BY deptno);`,
        description: '10번 김철수(1000), 20번 박민수(3000) 2명 조회',
      },
    ],
    tryModifications: [
      {
        label: '부서 정보(dept) 테이블과 조인 결합',
        query: `SELECT e.ename, e.sal, d.dname FROM emp_sample e, dept d WHERE e.deptno = d.deptno AND (e.deptno, e.sal) IN (SELECT deptno, MAX(sal) FROM emp_sample GROUP BY deptno);`,
        guide: '다중 컬럼 서브쿼리에 조인을 결합하여 부서명까지 함께 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 서브쿼리 (Subquery) > 하위 카테고리: 연관 서브쿼리 vs 비연관 서브쿼리
  // -------------------------------------------------------------------------
  {
    id: 'sqld-subq-6',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 2,
    category: '서브쿼리 (Subquery)',
    subCategory: '연관 서브쿼리 vs 비연관 서브쿼리',
    title: '[연관 vs 비연관 서브쿼리] 메인 쿼리 컬럼 참조 여부에 따른 동작 원리',
    description:
      '**【SQLD 시험 핵심 개념: 비연관(독립 1회 실행) vs 연관(행마다 반복 실행)】**\n\n1. **비연관 서브쿼리 (Uncorrelated Subquery)**:\n   - 메인 쿼리의 컬럼을 전혀 참조하지 않는 독립적인 서브쿼리입니다.\n   - 서브쿼리가 먼저 단 1번 실행되어 상수처럼 결과를 메인 쿼리에 전달합니다.\n   - 예: `WHERE sal > (SELECT AVG(sal) FROM emp_sample)` (전체 평균 3000 초과 사원)\n2. **연관 서브쿼리 (Correlated Subquery / 상호연관 서브쿼리)**:\n   - 서브쿼리 내부에서 **메인 쿼리의 컬럼(`m.deptno`)을 참조**합니다.\n   - 메인 쿼리의 각 행(Row)을 읽을 때마다 서브쿼리가 매번 새로 실행됩니다.\n   - 예: `WHERE sal > (SELECT AVG(sal) FROM emp_sample s WHERE s.deptno = m.deptno)`\n   - **의미**: **자신이 소속된 부서의 평균 급여보다 많이 받는 사원** 조회!\n     - 10번 부서 평균(`1500`) 초과 ➔ **이영희 (2000)**\n     - 20번 부서 평균(`4000`) 초과 ➔ **정동원 (5000)**',
    initialQuery: `SELECT m.empno,\n       m.ename,\n       m.sal,\n       m.deptno\nFROM emp_sample m\nWHERE m.sal > (\n  SELECT AVG(s.sal)\n  FROM emp_sample s\n  WHERE s.deptno = m.deptno\n)\nORDER BY m.deptno, m.empno;`,
    solutionQuery: `SELECT m.empno, m.ename, m.sal, m.deptno FROM emp_sample m WHERE m.sal > (SELECT AVG(s.sal) FROM emp_sample s WHERE s.deptno = m.deptno) ORDER BY m.deptno, m.empno`,
    hint: '`WHERE m.sal > (SELECT AVG(s.sal) FROM emp_sample s WHERE s.deptno = m.deptno)`를 작성하세요.',
    explanation:
      '1. 비연관 서브쿼리: 메인 쿼리와 독립적으로 1회만 먼저 실행됩니다.\n2. 연관 서브쿼리: 메인 쿼리의 값을 서브쿼리에서 참조하여 메인 쿼리의 행마다 반복 실행됩니다.',
    quickExamples: [
      {
        label: '비연관 서브쿼리 (전체 평균 초과)와 결과 비교',
        query: `SELECT ename, sal, deptno FROM emp_sample WHERE sal > (SELECT AVG(sal) FROM emp_sample);`,
        description: '전체 평균(3000) 초과인 최유나, 정동원 2명 조회',
      },
    ],
    tryModifications: [
      {
        label: '자신이 속한 부서의 평균 급여 이하인 사원들 조회 (<=)',
        query: `SELECT m.ename, m.sal, m.deptno FROM emp_sample m WHERE m.sal <= (SELECT AVG(s.sal) FROM emp_sample s WHERE s.deptno = m.deptno);`,
        guide: '김철수(1000), 박민수(3000), 최유나(4000) 3명이 출력되는지 확인해 보세요!',
      },
    ],
  },

  // =========================================================================
  // 대분류: 뷰 (VIEW)
  // =========================================================================

  // -------------------------------------------------------------------------
  // 카테고리: 뷰 (VIEW) > 하위 카테고리: CREATE VIEW와 보안성
  // -------------------------------------------------------------------------
  {
    id: 'sqld-view-1',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 1,
    category: '뷰 (VIEW)',
    subCategory: 'CREATE VIEW와 보안성',
    title: '[기본 뷰 생성과 조회] CREATE VIEW로 보안성 확보 (민감 컬럼 숨기기)',
    description:
      '**【SQLD 시험 1순위 핵심 이론: 뷰(VIEW)의 개념과 보안성】**\n사원 샘플 테이블 `emp_sample`에서 급여(`sal`), 성과급(`comm`) 등 민감한 재무 정보를 제외하고, 사번(`empno`), 이름(`ename`), 부서번호(`deptno`)만 노출하는 공개용 가상 테이블(뷰)을 생성하고 조회합니다.\n\n1. **뷰(VIEW)의 4대 장점**:\n   - **보안성 (Security)**: 사용자에게 필요한 특정 컬럼/행만 선택적으로 공개하여 개인정보 및 기밀 데이터 보호\n   - **독립성 (Independence)**: 기본 테이블의 컬럼 구조가 변경되어도 뷰를 통해 응용 프로그램의 수정 최소화\n   - **편리성 (Simplicity)**: 복잡한 조인 및 집계 쿼리를 뷰로 캡슐화하여 단순 `SELECT * FROM view`로 재사용\n   - **무결성 보장**: `WITH CHECK OPTION`을 통한 조건 무결성 검증\n\n💡 **【SQLD 필수 암기: 뷰의 물리적 실체】**:\n- 뷰는 실제 데이터를 디스크에 저장하지 않는 **가상 테이블(Virtual Table)**입니다.\n- 데이터베이스 딕셔너리에는 오직 뷰를 정의한 **`SELECT` 문장(텍스트)만 저장**됩니다!',
    initialQuery: `CREATE OR REPLACE VIEW v_emp_public AS\nSELECT empno, ename, deptno\nFROM emp_sample;\n\nSELECT * FROM v_emp_public;`,
    solutionQuery: `CREATE OR REPLACE VIEW v_emp_public AS SELECT empno, ename, deptno FROM emp_sample; SELECT * FROM v_emp_public`,
    hint: '`CREATE OR REPLACE VIEW v_emp_public AS SELECT empno, ename, deptno FROM emp_sample;` 후 `SELECT * FROM v_emp_public;`를 작성하세요.',
    explanation:
      '1. CREATE VIEW 뷰이름 AS SELECT ... 문법으로 뷰를 생성합니다.\n2. 뷰는 물리적인 데이터를 갖지 않는 가상 테이블이며, 보안성 향상과 쿼리 단순화를 위해 사용됩니다.',
    quickExamples: [
      {
        label: '생성된 뷰에서 10번 부서 사원만 조회',
        query: `SELECT * FROM v_emp_public WHERE deptno = 10;`,
        description: '뷰를 일반 테이블처럼 WHERE 조건과 함께 조회',
      },
    ],
    tryModifications: [
      {
        label: '뷰에서 이름(ename) 가나다순 정렬',
        query: `SELECT empno, ename, deptno FROM v_emp_public ORDER BY ename;`,
        guide: '뷰에서도 일반 테이블과 동일하게 ORDER BY 정렬이 동작함을 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 뷰 (VIEW) > 하위 카테고리: 복합 조인 및 집계 뷰
  // -------------------------------------------------------------------------
  {
    id: 'sqld-view-2',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 2,
    category: '뷰 (VIEW)',
    subCategory: '복합 조인 및 집계 뷰',
    title: '[복합 조인 뷰] 복잡한 조인과 집계를 단순화하는 비즈니스 뷰',
    description:
      '사원 테이블 `emp_sample`과 부서 테이블 `dept`의 조인 쿼리를 통합 뷰 `v_emp_dept_info`로 생성하여 복잡한 조인 과정을 캡슐화합니다.\n\n1. **뷰 정의 쿼리**:\n   ```sql\n   CREATE OR REPLACE VIEW v_emp_dept_info AS\n   SELECT e.empno, e.ename, e.sal, d.deptno, d.dname, d.loc\n   FROM emp_sample e\n   INNER JOIN dept d ON e.deptno = d.deptno;\n   ```\n2. **뷰 조회 및 활용**:\n   - 매번 긴 조인 쿼리를 작성할 필요 없이, `SELECT * FROM v_emp_dept_info WHERE sal >= 3000`과 같이 직관적인 질의가 가능합니다.\n\n💡 **핵심 관전 포인트**:\n- 뷰를 사용하면 개발자는 복잡한 데이터 모델 구조나 조인 관계를 몰라도 필요한 비즈니스 데이터를 손쉽게 추출할 수 있습니다.',
    initialQuery: `CREATE OR REPLACE VIEW v_emp_dept_info AS\nSELECT e.empno, e.ename, e.sal, d.deptno, d.dname, d.loc\nFROM emp_sample e\nINNER JOIN dept d ON e.deptno = d.deptno;\n\nSELECT * FROM v_emp_dept_info WHERE sal >= 3000;`,
    solutionQuery: `CREATE OR REPLACE VIEW v_emp_dept_info AS SELECT e.empno, e.ename, e.sal, d.deptno, d.dname, d.loc FROM emp_sample e INNER JOIN dept d ON e.deptno = d.deptno; SELECT * FROM v_emp_dept_info WHERE sal >= 3000`,
    hint: '`CREATE OR REPLACE VIEW v_emp_dept_info AS SELECT ... FROM emp_sample e INNER JOIN dept d ON e.deptno = d.deptno;` 후 조회를 작성하세요.',
    explanation:
      '복잡한 다중 테이블 조인이나 집계 연산을 뷰로 미리 정의해 두면, 일반 사용자나 응용 프로그램이 단일 테이블처럼 간결하게 조회할 수 있습니다.',
    quickExamples: [
      {
        label: 'ACCOUNTING 부서 소속 사원만 뷰를 통해 조회',
        query: `SELECT ename, sal, loc FROM v_emp_dept_info WHERE dname = 'ACCOUNTING';`,
        description: '10번 부서 사원 2명의 정보 조회',
      },
    ],
    tryModifications: [
      {
        label: '부서별 평균 급여 집계 뷰 생성 (v_dept_summary)',
        query: `CREATE OR REPLACE VIEW v_dept_summary AS SELECT deptno, COUNT(*) AS emp_cnt, AVG(sal) AS avg_sal FROM emp_sample GROUP BY deptno; SELECT * FROM v_dept_summary;`,
        guide: '집계 함수와 GROUP BY가 포함된 통계 뷰를 생성해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 뷰 (VIEW) > 하위 카테고리: WITH CHECK OPTION과 READ ONLY
  // -------------------------------------------------------------------------
  {
    id: 'sqld-view-3',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 2,
    category: '뷰 (VIEW)',
    subCategory: 'WITH CHECK OPTION과 READ ONLY',
    title: '[뷰의 무결성 옵션] WITH CHECK OPTION과 WITH READ ONLY (SQLD 단골)',
    description:
      '**【SQLD 시험 최고 빈출: 뷰 생성 시 사용되는 제약 옵션】**\n\n1. **`WITH CHECK OPTION`**:\n   - 뷰 정의 시 명시한 `WHERE` 조건식을 만족하는 데이터만 `INSERT` 또는 `UPDATE`가 가능하도록 강제하는 제약 옵션입니다.\n   - 예: `WHERE deptno = 10 WITH CHECK OPTION`으로 생성된 뷰에서 특정 사원의 부서 번호를 `20`으로 변경하려 하면 **`ORA-01402: view WITH CHECK OPTION where-clause violation` 에러**가 발생하여 변경이 차단됩니다!\n2. **`WITH READ ONLY`**:\n   - 뷰를 통한 어떠한 `INSERT`, `UPDATE`, `DELETE` (DML) 작업도 허용하지 않고, **오직 읽기(조회) 전용으로만 제한**하는 옵션입니다.\n\n💡 **실습 목표**:\n- 10번 부서 사원 전용 뷰 `v_emp_dept10`을 `WITH CHECK OPTION`과 함께 생성하고 데이터를 검증합니다.',
    initialQuery: `CREATE OR REPLACE VIEW v_emp_dept10 AS\nSELECT empno, ename, sal, deptno\nFROM emp_sample\nWHERE deptno = 10\nWITH CHECK OPTION;\n\nSELECT * FROM v_emp_dept10;`,
    solutionQuery: `CREATE OR REPLACE VIEW v_emp_dept10 AS SELECT empno, ename, sal, deptno FROM emp_sample WHERE deptno = 10 WITH CHECK OPTION; SELECT * FROM v_emp_dept10`,
    hint: '`CREATE OR REPLACE VIEW v_emp_dept10 AS SELECT empno, ename, sal, deptno FROM emp_sample WHERE deptno = 10 WITH CHECK OPTION;`을 작성하세요.',
    explanation:
      '1. WITH CHECK OPTION: 뷰의 WHERE 조건을 위배하는 데이터의 삽입/수정을 방지하여 무결성을 유지합니다.\n2. WITH READ ONLY: 뷰를 통한 모든 DML 작업을 금지하고 조회만 가능하도록 제한합니다.',
    quickExamples: [
      {
        label: 'WITH READ ONLY 읽기 전용 뷰 생성 실습',
        query: `CREATE OR REPLACE VIEW v_emp_readonly AS SELECT empno, ename, sal FROM emp_sample WITH READ ONLY; SELECT * FROM v_emp_readonly;`,
        description: 'DML이 차단되는 읽기 전용 뷰 생성 및 조회',
      },
    ],
    tryModifications: [
      {
        label: '20번 부서 대상의 WITH CHECK OPTION 뷰 생성',
        query: `CREATE OR REPLACE VIEW v_emp_dept20 AS SELECT * FROM emp_sample WHERE deptno = 20 WITH CHECK OPTION; SELECT * FROM v_emp_dept20;`,
        guide: '20번 부서 사원 3명만 포함되는 뷰를 생성해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 뷰 (VIEW) > 하위 카테고리: DROP VIEW와 독립성
  // -------------------------------------------------------------------------
  {
    id: 'sqld-view-4',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 1,
    category: '뷰 (VIEW)',
    subCategory: 'DROP VIEW와 독립성',
    title: '[뷰의 삭제와 독립성] DROP VIEW 및 기본 테이블과의 독립성 원리',
    description:
      '**【SQLD 핵심 이론: 뷰 삭제 시 기본 테이블 데이터 보존 원리】**\n생성된 뷰 `v_emp_public`을 삭제(`DROP VIEW`)하고, 원본 테이블 `emp_sample`의 데이터가 안전하게 그대로 보존되는지 확인합니다.\n\n1. **뷰 삭제 문법**: `DROP VIEW v_emp_public;`\n2. **결과 및 원리**:\n   - 뷰는 단지 정의된 SQL 텍스트만 보관하는 가상 객체이므로, **뷰를 `DROP`해도 기본 테이블의 데이터와 구조에는 아무런 영향이 없습니다!**\n\n💡 **【SQLD 단골 비교: 테이블 삭제 vs 뷰 삭제】**:\n- **`DROP VIEW 뷰이름`**: 뷰 정의만 삭제되며, 원본 테이블은 완벽히 보존됨 (⭕ 안전)\n- **`DROP TABLE 테이블이름`**: 원본 데이터가 모두 삭제되며, 해당 테이블을 참조하던 모든 뷰는 무효화(`INVALID`) 상태로 전환됨!',
    initialQuery: `DROP VIEW IF EXISTS v_emp_public;\n\nSELECT * FROM emp_sample;`,
    solutionQuery: `DROP VIEW IF EXISTS v_emp_public; SELECT * FROM emp_sample`,
    hint: '`DROP VIEW IF EXISTS v_emp_public;` 후 `SELECT * FROM emp_sample;`를 작성하세요.',
    explanation:
      '1. DROP VIEW 문을 사용하여 뷰를 삭제합니다.\n2. 뷰를 삭제하더라도 기본 테이블의 데이터는 물리적으로 전혀 삭제되지 않고 안전하게 보존됩니다.',
    quickExamples: [
      {
        label: '조인 뷰 v_emp_dept_info 삭제 실습',
        query: `DROP VIEW IF EXISTS v_emp_dept_info; SELECT COUNT(*) AS emp_count FROM emp_sample;`,
        description: '뷰 삭제 후에도 원본 5행이 그대로 남아있음을 검증',
      },
    ],
    tryModifications: [
      {
        label: '삭제 후 남아있는 emp_sample 테이블 전체 조회',
        query: `SELECT empno, ename, sal, comm, deptno FROM emp_sample ORDER BY empno;`,
        guide: '기본 테이블 데이터가 온전히 유지되고 있는지 다시 한번 확인해 보세요!',
      },
    ],
  },

  // =========================================================================
  // 대분류: 집합 연산자 (Set Operators)
  // =========================================================================

  // -------------------------------------------------------------------------
  // 카테고리: 집합 연산자 (Set Operators) > 하위 카테고리: UNION ALL과 UNION
  // -------------------------------------------------------------------------
  {
    id: 'sqld-set-1',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 1,
    category: '집합 연산자 (Set Operators)',
    subCategory: 'UNION ALL과 UNION',
    title: '[합집합 비교] UNION ALL vs UNION (중복 허용 vs 중복 제거 & 정렬 비용)',
    description:
      '**【SQLD 시험 최고 빈출: UNION ALL과 UNION의 결정적 차이점】**\n사원 샘플 테이블 `emp_sample`에서 10번 부서 사원 집합(2명)과 급여 2000 이상 사원 집합(4명)의 합집합을 구합니다.\n\n- **집합 A (10번 부서)**: 김철수(1000), 이영희(2000)\n- **집합 B (급여 2000 이상)**: 이영희(2000), 박민수(3000), 최유나(4000), 정동원(5000)\n\n1. **`UNION ALL` (단순 결합 합집합)**:\n   - 중복 행을 제거하지 않고 그대로 위아래로 이어 붙입니다.\n   - **결과**: 총 **6행** (이영희가 2번 중복되어 나타남)\n   - **특징**: 내부 정렬(Sort) 작업을 하지 않아 **연산 속도가 가장 빠름**\n2. **`UNION` (중복 제거 합집합)**:\n   - 두 결과 집합을 합치면서 중복된 행을 1건만 남기고 제거합니다.\n   - **결과**: 총 **5행** (이영희 중복 제거)\n   - **특징**: 중복을 걸러내기 위해 **내부적으로 정렬(Sort)을 수행하므로 시스템 부하(비용)가 발생함**',
    initialQuery: `SELECT empno, ename, sal, deptno\nFROM emp_sample\nWHERE deptno = 10\nUNION ALL\nSELECT empno, ename, sal, deptno\nFROM emp_sample\nWHERE sal >= 2000;`,
    solutionQuery: `SELECT empno, ename, sal, deptno FROM emp_sample WHERE deptno = 10 UNION ALL SELECT empno, ename, sal, deptno FROM emp_sample WHERE sal >= 2000`,
    hint: '`SELECT ... WHERE deptno = 10 UNION ALL SELECT ... WHERE sal >= 2000`을 작성하세요.',
    explanation:
      '1. UNION ALL: 중복 제거 없이 두 쿼리의 결과를 단순히 결합하며 정렬을 수행하지 않습니다.\n2. UNION: 중복된 행을 제거하고 고유한 행만 반환하며, 내부적으로 정렬 작업을 수행합니다.',
    quickExamples: [
      {
        label: 'UNION으로 중복 제거 및 정렬된 결과 확인',
        query: `SELECT empno, ename, sal, deptno FROM emp_sample WHERE deptno = 10 UNION SELECT empno, ename, sal, deptno FROM emp_sample WHERE sal >= 2000;`,
        description: '이영희가 1번만 나타나며 5명으로 축약됨 확인',
      },
    ],
    tryModifications: [
      {
        label: '이름(ename) 컬럼 하나만 대상으로 UNION 비교',
        query: `SELECT ename FROM emp_sample WHERE deptno = 10 UNION ALL SELECT ename FROM emp_sample WHERE sal >= 2000;`,
        guide: '단일 컬럼일 때 이영희가 2번 출력되는 현상을 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 집합 연산자 (Set Operators) > 하위 카테고리: INTERSECT (교집합)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-set-2',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 1,
    category: '집합 연산자 (Set Operators)',
    subCategory: 'INTERSECT (교집합)',
    title: '[교집합] INTERSECT (두 쿼리의 공통 데이터 추출)',
    description:
      '사원 샘플 테이블 `emp_sample`에서 10번 부서 사원 집합과 급여 2000 이상 사원 집합의 교집합(`INTERSECT`)을 구합니다.\n\n- **집합 A (10번 부서)**: 김철수(1000), 이영희(2000)\n- **집합 B (급여 2000 이상)**: 이영희(2000), 박민수(3000), 최유나(4000), 정동원(5000)\n\n1. **`INTERSECT` 연산 결과**:\n   - 양쪽 쿼리에 모두 존재하는 공통 데이터인 **이영희 (2000, 10번 부서)** 1명만 추출됩니다!\n\n💡 **핵심 관전 포인트**:\n- `INTERSECT`는 `WHERE deptno = 10 AND sal >= 2000`과 논리적으로 동일한 결과를 반환하며, 중복 데이터를 제거하기 위해 내부 정렬을 수행합니다.',
    initialQuery: `SELECT empno, ename, sal, deptno\nFROM emp_sample\nWHERE deptno = 10\nINTERSECT\nSELECT empno, ename, sal, deptno\nFROM emp_sample\nWHERE sal >= 2000;`,
    solutionQuery: `SELECT empno, ename, sal, deptno FROM emp_sample WHERE deptno = 10 INTERSECT SELECT empno, ename, sal, deptno FROM emp_sample WHERE sal >= 2000`,
    hint: '`SELECT ... WHERE deptno = 10 INTERSECT SELECT ... WHERE sal >= 2000`을 작성하세요.',
    explanation:
      'INTERSECT는 두 SELECT 쿼리의 결과 집합에서 공통으로 존재하는 행만 중복 없이 반환하는 교집합 연산자입니다.',
    quickExamples: [
      {
        label: 'AND 조건문으로 동일한 결과 검증',
        query: `SELECT empno, ename, sal, deptno FROM emp_sample WHERE deptno = 10 AND sal >= 2000;`,
        description: '이영희 1명만 동일하게 출력됨 확인',
      },
    ],
    tryModifications: [
      {
        label: '20번 부서와 급여 3000 이상 교집합 실습',
        query: `SELECT empno, ename, sal FROM emp_sample WHERE deptno = 20 INTERSECT SELECT empno, ename, sal FROM emp_sample WHERE sal >= 3000;`,
        guide: '20번 부서 소속이면서 3000 이상인 사원 3명이 출력되는지 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 집합 연산자 (Set Operators) > 하위 카테고리: MINUS / EXCEPT (차집합)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-set-3',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 2,
    category: '집합 연산자 (Set Operators)',
    subCategory: 'MINUS / EXCEPT (차집합)',
    title: '[차집합] MINUS / EXCEPT (첫 번째 집합에서 두 번째 집합 차감)',
    description:
      '**【SQLD 시험 핵심: 차집합의 비가환성 ($A - B \neq B - A$)】**\n사원 샘플 테이블 `emp_sample`을 활용하여 첫 번째 쿼리 결과에서 두 번째 쿼리 결과를 제외하는 차집합 연산자(`MINUS` / 표준 `EXCEPT`)를 실습합니다.\n\n- **집합 A (10번 부서)**: 김철수(1000), 이영희(2000)\n- **집합 B (급여 2000 이상)**: 이영희(2000), 박민수(3000), 최유나(4000), 정동원(5000)\n\n1. **`A MINUS B` (집합 A에서 집합 B 차감)**:\n   - 10번 부서 사원(김철수, 이영희) 중 급여 2000 이상인 이영희가 제외되어 **김철수(1000) 1명만 출력**됩니다!\n2. **`B MINUS A` (집합 B에서 집합 A 차감)**:\n   - 급여 2000 이상 사원 중 10번 부서인 이영희가 제외되어 **박민수(3000), 최유나(4000), 정동원(5000) 3명이 출력**됩니다!\n\n💡 **핵심 비교**:\n- 오라클에서는 **`MINUS`**, ANSI SQL 표준 및 타 DBMS(PostgreSQL, SQL Server 등)에서는 **`EXCEPT`** 키워드를 사용합니다.',
    initialQuery: `SELECT empno, ename, sal, deptno\nFROM emp_sample\nWHERE deptno = 10\nMINUS\nSELECT empno, ename, sal, deptno\nFROM emp_sample\nWHERE sal >= 2000;`,
    solutionQuery: `SELECT empno, ename, sal, deptno FROM emp_sample WHERE deptno = 10 MINUS SELECT empno, ename, sal, deptno FROM emp_sample WHERE sal >= 2000`,
    hint: '`SELECT ... WHERE deptno = 10 MINUS SELECT ... WHERE sal >= 2000`을 작성하세요.',
    explanation:
      '1. MINUS(EXCEPT): 첫 번째 SELECT 문의 결과 집합에서 두 번째 SELECT 문의 결과 집합을 뺀 차집합을 반환합니다.\n2. 집합 연산 순서에 따라 결과가 달라지는 비가환적 특성을 갖습니다.',
    quickExamples: [
      {
        label: '순서를 바꾼 B MINUS A 실습',
        query: `SELECT empno, ename, sal, deptno FROM emp_sample WHERE sal >= 2000 MINUS SELECT empno, ename, sal, deptno FROM emp_sample WHERE deptno = 10;`,
        description: '박민수, 최유나, 정동원 3명 출력 확인',
      },
    ],
    tryModifications: [
      {
        label: 'EXCEPT 표준 키워드로 동일하게 실행',
        query: `SELECT empno, ename, sal FROM emp_sample WHERE deptno = 10 EXCEPT SELECT empno, ename, sal FROM emp_sample WHERE sal >= 2000;`,
        guide: 'EXCEPT 키워드로도 동일한 차집합이 산출되는지 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 집합 연산자 (Set Operators) > 하위 카테고리: 집합 연산자 문법 규칙
  // -------------------------------------------------------------------------
  {
    id: 'sqld-set-4',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 2,
    category: '집합 연산자 (Set Operators)',
    subCategory: '집합 연산자 문법 규칙',
    title: '[집합 연산자 문법 규칙] 컬럼 개수/타입 일치 및 ORDER BY 위치 규칙',
    description:
      '**【SQLD 시험 1순위 오답 함정: 집합 연산자의 3대 문법 규칙】**\n\n1. **규칙 1: 컬럼 개수와 데이터 타입의 일치**:\n   - 위 쿼리와 아래 쿼리의 **컬럼 개수가 동일**해야 하며, 상호 대응하는 컬럼의 **데이터 타입이 호환**되어야 합니다.\n2. **규칙 2: 최종 컬럼명 결정**:\n   - 최종 출력 결과의 컬럼명은 **첫 번째 `SELECT` 문의 컬럼명(또는 별칭)**을 따릅니다!\n   - 첫 번째 쿼리에서 `sal AS monthly_salary`로 주면 최종 결과 컬럼명은 `monthly_salary`가 됩니다.\n3. **규칙 3: `ORDER BY` 절의 위치**:\n   - **오직 문장의 맨 마지막 `SELECT` 문 끝에 딱 1번만 기술**할 수 있습니다!\n   - 첫 번째 쿼리에 `ORDER BY`를 넣으면 문법 에러가 발생합니다!',
    initialQuery: `SELECT empno AS id,\n       ename AS employee_name,\n       sal AS monthly_salary\nFROM emp_sample\nWHERE deptno = 10\nUNION ALL\nSELECT empno,\n       ename,\n       sal\nFROM emp_sample\nWHERE deptno = 20\nORDER BY monthly_salary DESC;`,
    solutionQuery: `SELECT empno AS id, ename AS employee_name, sal AS monthly_salary FROM emp_sample WHERE deptno = 10 UNION ALL SELECT empno, ename, sal FROM emp_sample WHERE deptno = 20 ORDER BY monthly_salary DESC`,
    hint: '`SELECT empno AS id, ename AS employee_name, sal AS monthly_salary ... ORDER BY monthly_salary DESC`를 작성하세요.',
    explanation:
      '1. 집합 연산에 참여하는 모든 SELECT 문은 컬럼 개수와 데이터 타입이 일치해야 합니다.\n2. 최종 결과 헤더 컬럼명은 첫 번째 SELECT 문의 별칭(Alias)을 따릅니다.\n3. ORDER BY 절은 전체 문장의 맨 끝에 1회만 기술할 수 있습니다.',
    quickExamples: [
      {
        label: '첫 번째 컬럼 순번으로 정렬 (ORDER BY 1)',
        query: `SELECT empno AS id, ename FROM emp_sample WHERE deptno = 10 UNION ALL SELECT empno, ename FROM emp_sample WHERE deptno = 20 ORDER BY 1;`,
        description: '사번 오름차순으로 전체 5명 정렬 확인',
      },
    ],
    tryModifications: [
      {
        label: '사원 테이블과 부서 테이블의 ID 및 이름 합집합',
        query: `SELECT empno AS code, ename AS title FROM emp_sample UNION ALL SELECT deptno, dname FROM dept;`,
        guide: '컬럼명이 다르더라도 타입(숫자, 문자)이 맞으면 정상 집합 연산됨을 확인해 보세요!',
      },
    ],
  },

  // =========================================================================
  // 대분류: 그룹 함수 및 소계 함수 (GROUP BY, ROLLUP, CUBE, GROUPING SETS)
  // =========================================================================

  // -------------------------------------------------------------------------
  // 카테고리: 그룹 함수 및 소계 함수 > 하위 카테고리: 집계 함수 종합 (COUNT, SUM, AVG, MIN, MAX)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-grp-1',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 1,
    category: '그룹 함수 및 소계 함수',
    subCategory: '집계 함수 종합 (COUNT, SUM, AVG, MIN, MAX)',
    title: '[집계 함수 종합] COUNT, SUM, AVG, MAX, MIN 한눈에 정리',
    description:
      '사원 샘플 테이블 `emp_sample`을 활용하여 SQL의 5대 기본 집계 함수를 부서 번호(`deptno`)별로 그룹화하여 산출합니다.\n\n1. **`COUNT(*)` / `COUNT(comm)`**: 전체 사원 수 및 커미션 수령 사원 수\n2. **`SUM(sal)`**: 부서별 급여 합계\n3. **`AVG(sal)`**: 부서별 평균 급여\n4. **`MIN(sal)` / `MAX(sal)`**: 부서 내 최저 급여 및 최고 급여\n\n💡 **핵심 관전 포인트**:\n- 모든 집계 함수는 `NULL` 값을 연산 대상에서 자동으로 제외합니다.\n- `COUNT(*)`만 유일하게 `NULL`을 포함한 전체 행을 집계합니다.',
    initialQuery: `SELECT deptno,\n       COUNT(*) AS total_count,\n       COUNT(comm) AS bonus_count,\n       SUM(sal) AS sum_sal,\n       AVG(sal) AS avg_sal,\n       MIN(sal) AS min_sal,\n       MAX(sal) AS max_sal\nFROM emp_sample\nGROUP BY deptno\nORDER BY deptno;`,
    solutionQuery: `SELECT deptno, COUNT(*) AS total_count, COUNT(comm) AS bonus_count, SUM(sal) AS sum_sal, AVG(sal) AS avg_sal, MIN(sal) AS min_sal, MAX(sal) AS max_sal FROM emp_sample GROUP BY deptno ORDER BY deptno`,
    hint: '`SELECT deptno, COUNT(*), COUNT(comm), SUM(sal), AVG(sal), MIN(sal), MAX(sal) FROM emp_sample GROUP BY deptno ORDER BY deptno`를 작성하세요.',
    explanation:
      '기본 집계 함수(COUNT, SUM, AVG, MIN, MAX)는 GROUP BY와 함께 사용하여 그룹별 통계치를 산출합니다.',
    quickExamples: [
      {
        label: '전체 테이블 대상 집계 (GROUP BY 없음)',
        query: `SELECT COUNT(*) AS total_emp, SUM(sal) AS total_sal, AVG(sal) AS total_avg FROM emp_sample;`,
        description: '전체 사원 5명에 대한 총 집계 산출',
      },
    ],
    tryModifications: [
      {
        label: '직책(job)이 있는 표준 emp 테이블로 집계 실습',
        query: `SELECT job, COUNT(*) AS emp_cnt, AVG(sal) AS avg_sal FROM emp GROUP BY job ORDER BY avg_sal DESC;`,
        guide: '14명의 사원 테이블에서 직책별 평균 급여를 집계해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 그룹 함수 및 소계 함수 > 하위 카테고리: ROLLUP 1단계 (ROLLUP(A))
  // -------------------------------------------------------------------------
  {
    id: 'sqld-grp-2',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 2,
    category: '그룹 함수 및 소계 함수',
    subCategory: 'ROLLUP 1단계 (ROLLUP(A))',
    title: '[ROLLUP 1단계] ROLLUP(A) - 1차원 계층 소계 및 총계 (N+1=2단계)',
    description:
      '**【SQLD 시험 핵심 공식: ROLLUP 인수가 $N$개일 때 $N+1$개의 소계 레벨 생성】**\n사원 샘플 테이블 `emp_sample`에서 부서(`deptno`)별 소계와 회사 전체 총계를 산출하는 `ROLLUP(deptno)`를 실습합니다.\n\n1. **인수 개수**: $N = 1$ (`deptno` 1개)\n2. **생성되는 집계 조합 ($1 + 1 = 2$단계)**:\n   - **1단계 `(deptno)`**: 10번 부서(3000), 20번 부서(12000) 소계\n   - **2단계 `()`**: 회사 전체 총계(15000)\n\n💡 **핵심 관전 포인트**:\n- `ROLLUP` 결과에서 컬럼 값이 `NULL`로 표시되는 행이 바로 상위 소계/총계 행입니다.',
    initialQuery: `SELECT deptno,\n       COUNT(*) AS emp_count,\n       SUM(sal) AS total_sal\nFROM emp_sample\nGROUP BY ROLLUP(deptno)\nORDER BY deptno;`,
    solutionQuery: `SELECT deptno, COUNT(*) AS emp_count, SUM(sal) AS total_sal FROM emp_sample GROUP BY ROLLUP(deptno) ORDER BY deptno`,
    hint: '`SELECT deptno, COUNT(*), SUM(sal) FROM emp_sample GROUP BY ROLLUP(deptno) ORDER BY deptno`를 작성하세요.',
    explanation:
      'ROLLUP(A)는 (A) 그룹별 집계와 () 전체 총계 집계를 생성하여 총 N+1=2개의 집계 레벨을 만듭니다.',
    quickExamples: [
      {
        label: '표준 emp 테이블(14행) 대상 ROLLUP(deptno)',
        query: `SELECT deptno, COUNT(*) AS cnt, SUM(sal) AS sum_sal FROM emp GROUP BY ROLLUP(deptno) ORDER BY deptno;`,
        description: '10, 20, 30번 부서 소계와 전체 총계(29025) 확인',
      },
    ],
    tryModifications: [
      {
        label: '평균 급여(AVG)도 함께 ROLLUP 산출',
        query: `SELECT deptno, COUNT(*) AS cnt, SUM(sal) AS sum_sal, AVG(sal) AS avg_sal FROM emp_sample GROUP BY ROLLUP(deptno) ORDER BY deptno;`,
        guide: '전체 총계 행의 평균 급여가 전체 평균(3000)으로 계산되는지 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 그룹 함수 및 소계 함수 > 하위 카테고리: ROLLUP 2단계 (ROLLUP(A, B))
  // -------------------------------------------------------------------------
  {
    id: 'sqld-grp-3',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp',
    level: 2,
    category: '그룹 함수 및 소계 함수',
    subCategory: 'ROLLUP 2단계 (ROLLUP(A, B))',
    title: '[ROLLUP 2단계] ROLLUP(A, B) - 2차원 계층 소계 및 총계 (N+1=3단계)',
    description:
      '**【SQLD 시험 단골 핵심: ROLLUP(A, B)의 3단계 계층 구조 및 순서 비가환성】**\n표준 사원 테이블 `emp`를 활용하여 부서(`deptno`)와 직책(`job`)에 대한 2차원 계층 소계를 실습합니다.\n\n1. **인수 개수**: $N = 2$ (`deptno`, `job` 2개)\n2. **생성되는 집계 조합 ($2 + 1 = 3$단계)**:\n   - **1단계 `(deptno, job)`**: 부서 내 직책별 상세 집계\n   - **2단계 `(deptno)`**: 부서별 소계 (`job` 자리가 `NULL`)\n   - **3단계 `()`**: 회사 전체 총계 (`deptno`, `job` 모두 `NULL`)\n\n💡 **【SQLD 최고 빈출 암기: ROLLUP 순서 변경 시 결과가 완전히 다름!】**:\n- `ROLLUP(deptno, job)`: `(deptno, job)` ➔ `(deptno)` 소계 ➔ `()` 총계\n- `ROLLUP(job, deptno)`: `(job, deptno)` ➔ `(job)` 소계 ➔ `()` 총계\n- **순서에 따라 소계 기준이 달라지므로 두 쿼리는 절대 같지 않습니다!**',
    initialQuery: `SELECT deptno,\n       job,\n       COUNT(*) AS emp_count,\n       SUM(sal) AS total_sal\nFROM emp\nGROUP BY ROLLUP(deptno, job)\nORDER BY deptno, job;`,
    solutionQuery: `SELECT deptno, job, COUNT(*) AS emp_count, SUM(sal) AS total_sal FROM emp GROUP BY ROLLUP(deptno, job) ORDER BY deptno, job`,
    hint: '`SELECT deptno, job, COUNT(*), SUM(sal) FROM emp GROUP BY ROLLUP(deptno, job) ORDER BY deptno, job`를 작성하세요.',
    explanation:
      'ROLLUP(A, B)는 (A, B) -> (A) -> () 순서로 총 N+1=3개의 계층적 소계를 생성합니다. 인수의 나열 순서가 바뀌면 소계 기준도 바뀝니다.',
    quickExamples: [
      {
        label: '순서를 뒤바꾼 ROLLUP(job, deptno) 비교',
        query: `SELECT job, deptno, COUNT(*) AS cnt, SUM(sal) AS sum_sal FROM emp GROUP BY ROLLUP(job, deptno) ORDER BY job, deptno;`,
        description: '직책별 소계가 먼저 나오고 전체 총계가 나오는 순서 확인',
      },
    ],
    tryModifications: [
      {
        label: '5행 샘플 테이블(emp_sample)에서 ROLLUP(deptno, ename) 테스트',
        query: `SELECT deptno, ename, SUM(sal) FROM emp_sample GROUP BY ROLLUP(deptno, ename) ORDER BY deptno, ename;`,
        guide: '사원별 상세 -> 부서별 소계 -> 전체 총계 3단계 흐름을 관찰해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 그룹 함수 및 소계 함수 > 하위 카테고리: ROLLUP 3단계 (ROLLUP(A, B, C)) & 부분 롤업
  // -------------------------------------------------------------------------
  {
    id: 'sqld-grp-4',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp',
    level: 2,
    category: '그룹 함수 및 소계 함수',
    subCategory: 'ROLLUP 3단계 (ROLLUP(A, B, C)) & 부분 롤업',
    title: '[ROLLUP 3단계] ROLLUP(A, B, C) 및 부분 롤업 (N+1=4단계)',
    description:
      '**【SQLD 심화: 3단계 다차원 롤업 & 부분 롤업(Partial ROLLUP)】**\n\n1. **`ROLLUP(deptno, job, mgr)` ($N=3 \rightarrow 4$단계)**:\n   - 1) `(deptno, job, mgr)` 상세\n   - 2) `(deptno, job)` 소계\n   - 3) `(deptno)` 소계\n   - 4) `()` 전체 총계\n2. **부분 롤업 (Partial ROLLUP: `GROUP BY deptno, ROLLUP(job)`)**:\n   - `deptno`는 고정하고 `job`에 대해서만 롤업 수행!\n   - 생성 조합: `(deptno, job)`, `(deptno)`\n   - **【SQLD 단골】**: 부분 롤업에서는 **전체 총계 `()`가 생성되지 않습니다!**',
    initialQuery: `SELECT deptno,\n       job,\n       mgr,\n       COUNT(*) AS cnt,\n       SUM(sal) AS sum_sal\nFROM emp\nGROUP BY ROLLUP(deptno, job, mgr)\nORDER BY deptno, job, mgr;`,
    solutionQuery: `SELECT deptno, job, mgr, COUNT(*) AS cnt, SUM(sal) AS sum_sal FROM emp GROUP BY ROLLUP(deptno, job, mgr) ORDER BY deptno, job, mgr`,
    hint: '`GROUP BY ROLLUP(deptno, job, mgr)`를 작성하세요.',
    explanation:
      '1. ROLLUP(A, B, C)는 (A, B, C) -> (A, B) -> (A) -> ()의 4단계 계층 소계를 생성합니다.\n2. GROUP BY A, ROLLUP(B)와 같은 부분 롤업은 전체 총계 없이 A별 하위 소계만 생성합니다.',
    quickExamples: [
      {
        label: '부분 롤업 실습 (GROUP BY deptno, ROLLUP(job))',
        query: `SELECT deptno, job, COUNT(*) AS cnt, SUM(sal) AS sum_sal FROM emp GROUP BY deptno, ROLLUP(job) ORDER BY deptno, job;`,
        description: '전체 총계 없이 부서별 상세와 부서 소계만 생성됨 확인',
      },
    ],
    tryModifications: [
      {
        label: '결합 롤업 (ROLLUP((A, B), C)) 테스트',
        query: `SELECT deptno, job, mgr, SUM(sal) FROM emp GROUP BY ROLLUP((deptno, job), mgr) ORDER BY deptno, job, mgr;`,
        guide: '(deptno, job)을 하나의 단위로 묶어 소계 레벨을 줄이는 결합 롤업을 실습해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 그룹 함수 및 소계 함수 > 하위 카테고리: CUBE (다차원 모든 조합 소계)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-grp-5',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp',
    level: 2,
    category: '그룹 함수 및 소계 함수',
    subCategory: 'CUBE (다차원 모든 조합 소계)',
    title: '[CUBE 다차원 총계] CUBE(A), CUBE(A, B), CUBE(A, B, C) (2^N개 조합)',
    description:
      '**【SQLD 시험 핵심 공식: CUBE 인수가 $N$개일 때 $2^N$개의 모든 다차원 조합 생성】**\n표준 사원 테이블 `emp`에서 `CUBE(deptno, job)`를 활용하여 가능한 모든 경우의 수로 소계와 총계를 산출합니다.\n\n1. **인수 개수**: $N = 2$ (`deptno`, `job` 2개)\n2. **생성되는 집계 조합 ($2^2 = 4$개)**:\n   - 1) `(deptno, job)`: 부서 및 직책별 상세\n   - 2) `(deptno)`: **부서별 소계** (`job`은 NULL)\n   - 3) `(job)`: **직책별 소계** (`deptno`는 NULL, ➔ ROLLUP에는 없는 CUBE만의 차원!)\n   - 4) `()`: **전체 총계** (`deptno`, `job` 모두 NULL)\n\n💡 **【SQLD 핵심 비교: ROLLUP vs CUBE 차이점】**:\n- `ROLLUP(A, B)`: 계층적 $N+1=3$개 (`(A,B)`, `(A)`, `()`)\n- `CUBE(A, B)`: 다차원 모든 조합 $2^N=4$개 (`(A,B)`, `(A)`, `(B)`, `()`)\n- **가환성**: `CUBE(A, B)`와 `CUBE(B, A)`는 **순서가 바뀌어도 동일한 4개의 집계 결과를 산출**합니다!',
    initialQuery: `SELECT deptno,\n       job,\n       COUNT(*) AS emp_count,\n       SUM(sal) AS total_sal\nFROM emp\nGROUP BY CUBE(deptno, job)\nORDER BY deptno, job;`,
    solutionQuery: `SELECT deptno, job, COUNT(*) AS emp_count, SUM(sal) AS total_sal FROM emp GROUP BY CUBE(deptno, job) ORDER BY deptno, job`,
    hint: '`SELECT deptno, job, COUNT(*), SUM(sal) FROM emp GROUP BY CUBE(deptno, job) ORDER BY deptno, job`를 작성하세요.',
    explanation:
      'CUBE는 결합 가능한 모든 컬럼의 조합(2^N개)에 대해 소계와 총계를 생성합니다. CUBE(A, B)는 (A, B), (A), (B), () 4개의 그룹을 만듭니다.',
    quickExamples: [
      {
        label: 'CUBE(deptno) 1차원 실습 (2^1 = 2개 조합)',
        query: `SELECT deptno, SUM(sal) AS total_sal FROM emp GROUP BY CUBE(deptno) ORDER BY deptno;`,
        description: '(deptno)와 () 2개 조합 생성 (ROLLUP(deptno)와 동일)',
      },
    ],
    tryModifications: [
      {
        label: 'CUBE 순서 변경 (CUBE(job, deptno)) 테스트',
        query: `SELECT deptno, job, SUM(sal) FROM emp GROUP BY CUBE(job, deptno) ORDER BY deptno, job;`,
        guide: '순서가 바뀌어도 동일하게 4가지 조합이 생성되는 CUBE의 가환성을 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 그룹 함수 및 소계 함수 > 하위 카테고리: GROUPING SETS (맞춤 소계)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-grp-6',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp',
    level: 2,
    category: '그룹 함수 및 소계 함수',
    subCategory: 'GROUPING SETS (맞춤 소계)',
    title: '[GROUPING SETS] 사용자 지정 맞춤형 소계 정의',
    description:
      '**【SQLD 시험 필수: GROUPING SETS를 사용한 개별 소계의 선택적 산출】**\n`GROUPING SETS`는 괄호 안에 나열한 컬럼 조합에 대해서만 개별 그룹을 형성하여 결과를 하나의 쿼리로 결합(UNION ALL 효과)합니다.\n\n1. **`GROUPING SETS (deptno, job)`**:\n   - **부서별 집계 `(deptno)`** + **직책별 집계 `(job)`**만 각각 따로 계산하여 나란히 결합!\n   - 불필요한 전체 총계나 세부 상세는 생성하지 않음\n2. **`ROLLUP` / `CUBE`를 `GROUPING SETS`로 동등 변환 (SQLD 최고 빈출)**:\n   - `ROLLUP(A, B)` $\Longleftrightarrow$ `GROUPING SETS ((A, B), A, ())`\n   - `CUBE(A, B)` $\Longleftrightarrow$ `GROUPING SETS ((A, B), A, B, ())`',
    initialQuery: `SELECT deptno,\n       job,\n       COUNT(*) AS emp_count,\n       SUM(sal) AS total_sal\nFROM emp\nGROUP BY GROUPING SETS (deptno, job)\nORDER BY deptno, job;`,
    solutionQuery: `SELECT deptno, job, COUNT(*) AS emp_count, SUM(sal) AS total_sal FROM emp GROUP BY GROUPING SETS (deptno, job) ORDER BY deptno, job`,
    hint: '`SELECT deptno, job, COUNT(*), SUM(sal) FROM emp GROUP BY GROUPING SETS (deptno, job) ORDER BY deptno, job`를 작성하세요.',
    explanation:
      'GROUPING SETS는 나열된 각 항목에 대해서만 개별적으로 그룹을 생성합니다. ROLLUP이나 CUBE의 결과를 GROUPING SETS로 완벽히 동일하게 표현할 수 있습니다.',
    quickExamples: [
      {
        label: 'ROLLUP(deptno, job)과 완벽히 동일한 GROUPING SETS 작성',
        query: `SELECT deptno, job, SUM(sal) FROM emp GROUP BY GROUPING SETS ((deptno, job), deptno, ()) ORDER BY deptno, job;`,
        description: '(deptno, job), (deptno), () 3단계 소계 산출 확인',
      },
    ],
    tryModifications: [
      {
        label: '전체 총계(())만 추가한 GROUPING SETS (deptno, job, ())',
        query: `SELECT deptno, job, COUNT(*) AS cnt FROM emp GROUP BY GROUPING SETS (deptno, job, ()) ORDER BY deptno, job;`,
        guide: '부서별 집계, 직책별 집계, 전체 총계 3가지만 맞춤 생성해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 그룹 함수 및 소계 함수 > 하위 카테고리: GROUPING 함수와 소계 라벨링
  // -------------------------------------------------------------------------
  {
    id: 'sqld-grp-7',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp',
    level: 2,
    category: '그룹 함수 및 소계 함수',
    subCategory: 'GROUPING 함수와 소계 라벨링',
    title: '[GROUPING 함수] GROUPING(col) & GROUPING_ID로 소계 라벨링',
    description:
      "**【SQLD 시험 단골: 소계/총계 행을 식별하는 GROUPING() & GROUPING_ID() 함수】**\n소계 계산 결과로 컬럼에 `NULL`이 표시될 때, 이것이 실제 데이터의 `NULL`인지 아니면 소계/총계에 의해 생성된 `NULL`인지 구분합니다.\n\n1. **`GROUPING(col)` 함수**:\n   - 해당 컬럼이 **소계/총계 집계에 사용되었으면 `1`** 반환\n   - 해당 컬럼이 **일반 데이터 그룹이면 `0`** 반환\n2. **소계 라벨링 응용 (`CASE WHEN`과 결합)**:\n   - `CASE WHEN GROUPING(deptno) = 1 THEN '전체부서' ELSE TO_CHAR(deptno) END AS dept_name`\n   - `CASE WHEN GROUPING(job) = 1 THEN '부서소계' ELSE job END AS job_title`\n3. **`GROUPING_ID(col1, col2)`**:\n   - `GROUPING(col1)`과 `GROUPING(col2)`의 비트마스크(이진수 ➔ 십진수) 정수 반환\n   - `(0, 0)` ➔ `0`, `(0, 1)` ➔ `1`, `(1, 1)` ➔ `3`",
    initialQuery: `SELECT CASE WHEN GROUPING(deptno) = 1 THEN '전체부서'\n            ELSE TO_CHAR(deptno) END AS dept_label,\n       CASE WHEN GROUPING(job) = 1 THEN '부서소계'\n            ELSE job END AS job_label,\n       GROUPING(deptno) AS grp_dept,\n       GROUPING(job) AS grp_job,\n       GROUPING_ID(deptno, job) AS grp_id,\n       SUM(sal) AS total_sal\nFROM emp\nGROUP BY ROLLUP(deptno, job)\nORDER BY deptno, job;`,
    solutionQuery: `SELECT CASE WHEN GROUPING(deptno) = 1 THEN '전체부서' ELSE TO_CHAR(deptno) END AS dept_label, CASE WHEN GROUPING(job) = 1 THEN '부서소계' ELSE job END AS job_label, GROUPING(deptno) AS grp_dept, GROUPING(job) AS grp_job, GROUPING_ID(deptno, job) AS grp_id, SUM(sal) AS total_sal FROM emp GROUP BY ROLLUP(deptno, job) ORDER BY deptno, job`,
    hint: '`CASE WHEN GROUPING(deptno) = 1 THEN ...`, `GROUPING_ID(deptno, job)`을 작성하세요.',
    explanation:
      '1. GROUPING(col): 소계/총계로 생성된 행이면 1, 일반 데이터 행이면 0을 반환합니다.\n2. GROUPING_ID(col1, col2): GROUPING 비트 결과를 2진 비트마스크 정수로 변환하여 반환합니다.',
    quickExamples: [
      {
        label: 'GROUPING 함수 기본 출력 관찰',
        query: `SELECT deptno, GROUPING(deptno) AS is_subtotal, SUM(sal) AS sum_sal FROM emp GROUP BY ROLLUP(deptno);`,
        description: '일반 부서는 0, 전체 총계 행은 1로 출력됨 확인',
      },
    ],
    tryModifications: [
      {
        label: 'CUBE에서 GROUPING 함수 라벨링 적용',
        query: `SELECT NVL2(deptno, TO_CHAR(deptno), '모든부서') AS d_label, NVL2(job, job, '모든직책') AS j_label, SUM(sal) FROM emp GROUP BY CUBE(deptno, job);`,
        guide: 'CUBE의 4가지 집계 레벨에 깔끔한 라벨을 부여해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 그룹 함수 및 소계 함수 > 하위 카테고리: ROLLUP + GROUPING 실전 보고서
  // -------------------------------------------------------------------------
  {
    id: 'sqld-grp-8',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp',
    level: 2,
    category: '그룹 함수 및 소계 함수',
    subCategory: 'ROLLUP + GROUPING 실전 보고서',
    title: '[ROLLUP + GROUPING] DECODE와 GROUPING으로 3단계 완벽 보고서 포맷팅',
    description:
      "**【SQLD/SQLP 실무 및 시험 단골: ROLLUP 소계 행을 DECODE/CASE로 라벨링】**\n표준 사원 테이블 `emp`에서 `ROLLUP(deptno, job)`을 수행할 때, 생성되는 `NULL` 자리를 `GROUPING()`과 `DECODE()`를 사용하여 비즈니스 보고서 형태로 변환합니다.\n\n1. **부서명 라벨링**: `DECODE(GROUPING(deptno), 1, '🏢 회사 총계', TO_CHAR(deptno)) AS dept_title`\n2. **직책명 라벨링**: `DECODE(GROUPING(job), 1, '📋 부서 소계', job) AS job_title`\n3. **결과 계층**:\n   - 1) `(10, CLERK)` ➔ 상세 사원 정보\n   - 2) `(10, 📋 부서 소계)` ➔ 10번 부서 소계 (총급여 8750)\n   - 3) `(🏢 회사 총계, 📋 부서 소계)` ➔ 회사 전체 총계 (총급여 29025)\n\n💡 **핵심 관전 포인트**:\n- `GROUPING()` 함수는 해당 컬럼이 소계 집계로 인해 묶였을 때만 정확히 `1`을 반환하므로, 깔끔한 조건 분기가 가능합니다.",
    initialQuery: `SELECT DECODE(GROUPING(deptno), 1, '🏢 회사 총계', TO_CHAR(deptno)) AS dept_title,\n       DECODE(GROUPING(job), 1, '📋 부서 소계', job) AS job_title,\n       COUNT(*) AS emp_cnt,\n       SUM(sal) AS total_sal,\n       ROUND(AVG(sal), 0) AS avg_sal\nFROM emp\nGROUP BY ROLLUP(deptno, job)\nORDER BY deptno, job;`,
    solutionQuery: `SELECT DECODE(GROUPING(deptno), 1, '🏢 회사 총계', TO_CHAR(deptno)) AS dept_title, DECODE(GROUPING(job), 1, '📋 부서 소계', job) AS job_title, COUNT(*) AS emp_cnt, SUM(sal) AS total_sal, ROUND(AVG(sal), 0) AS avg_sal FROM emp GROUP BY ROLLUP(deptno, job) ORDER BY deptno, job`,
    hint: '`SELECT DECODE(GROUPING(deptno), 1, ...), DECODE(GROUPING(job), 1, ...) ... FROM emp GROUP BY ROLLUP(deptno, job)`를 작성하세요.',
    explanation:
      'DECODE(GROUPING(col), 1, "소계명", col) 패턴을 사용하면 소계로 인해 생성된 NULL을 직관적인 텍스트 라벨로 치환할 수 있습니다.',
    quickExamples: [
      {
        label: 'CASE WHEN 문으로 동일한 보고서 작성',
        query: `SELECT CASE WHEN GROUPING(deptno) = 1 THEN '총계' ELSE TO_CHAR(deptno) END AS d_label, CASE WHEN GROUPING(job) = 1 THEN '소계' ELSE job END AS j_label, SUM(sal) FROM emp GROUP BY ROLLUP(deptno, job) ORDER BY deptno, job;`,
        description: 'CASE WHEN을 활용한 표준 라벨링 포맷',
      },
    ],
    tryModifications: [
      {
        label: '5행 샘플 테이블(emp_sample)에서 부서 소계 보고서 작성',
        query: `SELECT DECODE(GROUPING(deptno), 1, '총합계', TO_CHAR(deptno)) AS d_name, DECODE(GROUPING(ename), 1, '소계', ename) AS e_name, SUM(sal) AS sum_sal FROM emp_sample GROUP BY ROLLUP(deptno, ename) ORDER BY deptno, ename;`,
        guide: '직관적인 5행 테이블에서 DECODE + GROUPING의 동작을 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 그룹 함수 및 소계 함수 > 하위 카테고리: CUBE + GROUPING 다차원 분석
  // -------------------------------------------------------------------------
  {
    id: 'sqld-grp-9',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp',
    level: 2,
    category: '그룹 함수 및 소계 함수',
    subCategory: 'CUBE + GROUPING 다차원 분석',
    title: '[CUBE + GROUPING] 4차원 비트마스크 분석과 다면 보고서 생성',
    description:
      '**【SQLD 시험 핵심: CUBE의 4가지 집계 레벨을 GROUPING 조합으로 정밀 판별】**\n`CUBE(deptno, job)`에서 생성되는 $2^2 = 4$개의 집계 유형을 `GROUPING()` 함수의 조합으로 명확히 구분하여 출력합니다.\n\n| GROUPING(deptno) | GROUPING(job) | 집계 유형 | 비고 |\n| :---: | :---: | :--- | :--- |\n| **`0`** | **`0`** | **상세 데이터** (부서 & 직책 모두 지정) | 부서 내 직책별 상세 |\n| **`0`** | **`1`** | **부서별 소계** (직책 집계) | 직책 무관 부서 합계 |\n| **`1`** | **`0`** | **직책별 소계** (부서 집계) | 부서 무관 직책 합계 |\n| **`1`** | **`1`** | **전체 총계** (부서 & 직책 모두 집계) | 회사 전체 합계 |',
    initialQuery: `SELECT CASE\n         WHEN GROUPING(deptno) = 0 AND GROUPING(job) = 0 THEN '1. 상세 데이터'\n         WHEN GROUPING(deptno) = 0 AND GROUPING(job) = 1 THEN '2. 부서별 소계'\n         WHEN GROUPING(deptno) = 1 AND GROUPING(job) = 0 THEN '3. 직책별 소계'\n         WHEN GROUPING(deptno) = 1 AND GROUPING(job) = 1 THEN '4. 회사 전체총계'\n       END AS agg_type,\n       NVL(TO_CHAR(deptno), '전체부서') AS dept_name,\n       NVL(job, '전체직책') AS job_title,\n       COUNT(*) AS emp_cnt,\n       SUM(sal) AS total_sal\nFROM emp\nGROUP BY CUBE(deptno, job)\nORDER BY GROUPING(deptno), GROUPING(job), deptno, job;`,
    solutionQuery: `SELECT CASE WHEN GROUPING(deptno) = 0 AND GROUPING(job) = 0 THEN '1. 상세 데이터' WHEN GROUPING(deptno) = 0 AND GROUPING(job) = 1 THEN '2. 부서별 소계' WHEN GROUPING(deptno) = 1 AND GROUPING(job) = 0 THEN '3. 직책별 소계' WHEN GROUPING(deptno) = 1 AND GROUPING(job) = 1 THEN '4. 회사 전체총계' END AS agg_type, NVL(TO_CHAR(deptno), '전체부서') AS dept_name, NVL(job, '전체직책') AS job_title, COUNT(*) AS emp_cnt, SUM(sal) AS total_sal FROM emp GROUP BY CUBE(deptno, job) ORDER BY GROUPING(deptno), GROUPING(job), deptno, job`,
    hint: '`SELECT CASE WHEN GROUPING(deptno) = 0 AND GROUPING(job) = 0 THEN ... FROM emp GROUP BY CUBE(deptno, job)`를 작성하세요.',
    explanation:
      'CUBE(A, B)에서 GROUPING(A)와 GROUPING(B)의 (0,0), (0,1), (1,0), (1,1) 4가지 상태를 판별하여 상세/소계/총계를 구분할 수 있습니다.',
    quickExamples: [
      {
        label: '직책별 소계(1, 0)만 필터링하여 조회',
        query: `SELECT job, SUM(sal) AS job_total FROM emp GROUP BY CUBE(deptno, job) HAVING GROUPING(deptno) = 1 AND GROUPING(job) = 0;`,
        description: '부서와 무관한 직책별 합계 5개 행만 추출',
      },
    ],
    tryModifications: [
      {
        label: '부서별 소계(0, 1)만 HAVING으로 필터링',
        query: `SELECT deptno, SUM(sal) AS dept_total FROM emp GROUP BY CUBE(deptno, job) HAVING GROUPING(deptno) = 0 AND GROUPING(job) = 1;`,
        guide: '10, 20, 30번 3개 부서의 소계만 추출되는지 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 그룹 함수 및 소계 함수 > 하위 카테고리: GROUPING SETS + GROUPING_ID & 실제 NULL 구분
  // -------------------------------------------------------------------------
  {
    id: 'sqld-grp-10',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp',
    level: 2,
    category: '그룹 함수 및 소계 함수',
    subCategory: 'GROUPING SETS + GROUPING_ID & 실제 NULL 구분',
    title: '[GROUPING SETS + GROUPING_ID] 다중 집계 레벨 코드화 & 실제 NULL 구분 (SQLD 킬러)',
    description:
      "**【SQLD 시험 최고 난이도 킬러 문항: 실제 데이터의 NULL vs 소계 집계의 NULL 구분】**\n\n1. **`NVL()`의 치명적인 함정**:\n   - 만약 데이터 본래의 컬럼 값이 `NULL`인 경우, 단순 `NVL(col, '소계')`를 사용하면 **실제 NULL 데이터 행까지 '소계'로 잘못 둔갑하는 심각한 오류**가 발생합니다!\n2. **`GROUPING(col)`을 통한 완벽한 해결**:\n   - `GROUPING(col) = 1` ➔ **진짜 소계/총계 행!**\n   - `GROUPING(col) = 0` 이면서 `col IS NULL` ➔ **실제 데이터가 누락/NULL인 행!**\n3. **`GROUPING_ID(deptno, job)` 정수 코드화**:\n   - `0` (이진수 `00`): 부서+직책 상세\n   - `1` (이진수 `01`): 부서별 소계\n   - `2` (이진수 `10`): 직책별 소계\n   - `3` (이진수 `11`): 전체 총계\n   - `DECODE(GROUPING_ID(deptno, job), 0, '상세', 1, '부서소계', 2, '직책소계', 3, '총계') AS 집계구분`",
    initialQuery: `SELECT GROUPING_ID(deptno, job) AS gid,\n       DECODE(GROUPING_ID(deptno, job),\n              0, '상세',\n              1, '부서소계',\n              2, '직책소계',\n              3, '전체총계') AS 집계구분,\n       deptno,\n       job,\n       COUNT(*) AS emp_cnt,\n       SUM(sal) AS sum_sal\nFROM emp\nGROUP BY GROUPING SETS ((deptno, job), deptno, job, ())\nORDER BY gid, deptno, job;`,
    solutionQuery: `SELECT GROUPING_ID(deptno, job) AS gid, DECODE(GROUPING_ID(deptno, job), 0, '상세', 1, '부서소계', 2, '직책소계', 3, '전체총계') AS 집계구분, deptno, job, COUNT(*) AS emp_cnt, SUM(sal) AS sum_sal FROM emp GROUP BY GROUPING SETS ((deptno, job), deptno, job, ()) ORDER BY gid, deptno, job`,
    hint: "`SELECT GROUPING_ID(deptno, job) AS gid, DECODE(GROUPING_ID(deptno, job), 0, '상세', 1, '부서소계', 2, '직책소계', 3, '전체총계') AS 집계구분 ... FROM emp GROUP BY GROUPING SETS ((deptno, job), deptno, job, ())`를 작성하세요.",
    explanation:
      '1. GROUPING_ID는 여러 컬럼의 GROUPING 비트를 결합하여 0, 1, 2, 3의 정수로 반환합니다.\n2. GROUPING 함수는 실제 데이터의 NULL과 소계 계산으로 인해 발생한 NULL을 정확히 구별해 줍니다.',
    quickExamples: [
      {
        label: '소계/총계(gid > 0)만 추출하여 요약 대시보드 생성',
        query: `SELECT DECODE(GROUPING_ID(deptno, job), 1, '부서소계', 2, '직책소계', 3, '전체총계') AS 구분, deptno, job, SUM(sal) AS sum_sal FROM emp GROUP BY GROUPING SETS ((deptno, job), deptno, job, ()) HAVING GROUPING_ID(deptno, job) > 0 ORDER BY GROUPING_ID(deptno, job);`,
        description: '상세를 제외한 모든 소계 및 총계 요약 추출',
      },
    ],
    tryModifications: [
      {
        label: 'GROUPING SETS에서 직책소계 제외하고 ROLLUP과 동일하게 변경',
        query: `SELECT GROUPING_ID(deptno, job) AS gid, deptno, job, SUM(sal) FROM emp GROUP BY GROUPING SETS ((deptno, job), deptno, ()) ORDER BY gid;`,
        guide: '0(상세), 1(부서소계), 3(총계)만 출력되는지 확인해 보세요!',
      },
    ],
  },

  // =========================================================================
  // 대분류: 윈도우 함수 (Window Functions)
  // =========================================================================

  // -------------------------------------------------------------------------
  // 카테고리: 윈도우 함수 (Window Functions) > 하위 카테고리: 순위 함수 (RANK, DENSE_RANK, ROW_NUMBER)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-win-1',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp',
    level: 1,
    category: '윈도우 함수 (Window Functions)',
    subCategory: '순위 함수 (RANK, DENSE_RANK, ROW_NUMBER)',
    title: '[순위 함수 3종] RANK vs DENSE_RANK vs ROW_NUMBER (동순위 처리 비교)',
    description:
      '**【SQLD 시험 1순위 핵심 비교: 3대 순위 함수의 동순위(Tie) 처리 방식】**\n표준 사원 테이블 `emp`에서 급여(`sal`)가 동일한 사원들(SCOTT 3000, FORD 3000 / WARD 1250, MARTIN 1250)을 대상으로 순위 함수 3종의 차이를 실습합니다.\n\n1. **`RANK()` (동순위 건너뜀)**:\n   - 동일한 순위가 있으면 같은 등수를 부여하고, **다음 등수는 동순위 수만큼 건너뜁니다**.\n   - 예: `1등 ➔ 2등, 2등 (공동 2등) ➔ 4등 (3등 건너뜀!)`\n2. **`DENSE_RANK()` (동순위 연속 부여)**:\n   - 동일한 순위가 있어도 **다음 등수를 건너뛰지 않고 빽빽하게(Dense) 연속 번호를 부여**합니다.\n   - 예: `1등 ➔ 2등, 2등 (공동 2등) ➔ 3등`\n3. **`ROW_NUMBER()` (고유 일련번호 부여)**:\n   - 급여가 같아도 행의 고유 순서에 따라 **무조건 1부터 1씩 증가하는 고유 번호를 부여**합니다.\n   - 예: `1등 ➔ 2등 ➔ 3등 ➔ 4등`',
    initialQuery: `SELECT ename,\n       sal,\n       deptno,\n       RANK() OVER (ORDER BY sal DESC) AS rk,\n       DENSE_RANK() OVER (ORDER BY sal DESC) AS dense_rk,\n       ROW_NUMBER() OVER (ORDER BY sal DESC) AS row_num\nFROM emp\nORDER BY sal DESC, ename;`,
    solutionQuery: `SELECT ename, sal, deptno, RANK() OVER (ORDER BY sal DESC) AS rk, DENSE_RANK() OVER (ORDER BY sal DESC) AS dense_rk, ROW_NUMBER() OVER (ORDER BY sal DESC) AS row_num FROM emp ORDER BY sal DESC, ename`,
    hint: '`RANK() OVER (ORDER BY sal DESC)`, `DENSE_RANK() OVER (ORDER BY sal DESC)`, `ROW_NUMBER() OVER (ORDER BY sal DESC)`를 작성하세요.',
    explanation:
      '1. RANK: 동일 순위 발생 시 다음 순위를 건너뜁니다 (1, 2, 2, 4).\n2. DENSE_RANK: 동일 순위 발생 시에도 다음 순위를 건너뛰지 않습니다 (1, 2, 2, 3).\n3. ROW_NUMBER: 동일 순위와 관계없이 고유한 일련번호를 부여합니다 (1, 2, 3, 4).',
    quickExamples: [
      {
        label: '부서별(PARTITION BY deptno) 급여 순위 산출',
        query: `SELECT deptno, ename, sal, DENSE_RANK() OVER (PARTITION BY deptno ORDER BY sal DESC) AS dept_rank FROM emp ORDER BY deptno, dept_rank;`,
        description: '부서 번호별로 순위가 1등부터 다시 시작됨 확인',
      },
    ],
    tryModifications: [
      {
        label: '입사일자(hiredate) 기준 선착순 순위 부여',
        query: `SELECT ename, hiredate, ROW_NUMBER() OVER (ORDER BY hiredate ASC) AS join_order FROM emp ORDER BY join_order;`,
        guide: '가장 먼저 입사한 사원부터 순번이 1번으로 부여되는지 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 윈도우 함수 (Window Functions) > 하위 카테고리: 일반 집계 윈도우 & 누적 합계
  // -------------------------------------------------------------------------
  {
    id: 'sqld-win-2',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 1,
    category: '윈도우 함수 (Window Functions)',
    subCategory: '일반 집계 윈도우 & 누적 합계',
    title: '[일반 집계 윈도우] SUM, AVG, MIN, MAX, COUNT와 누적 합계 (ROWS BETWEEN)',
    description:
      '**【SQLD 시험 핵심: GROUP BY와 달리 원본 행(Row)을 유지하며 집계 통계를 병합】**\n사원 샘플 테이블 `emp_sample`에서 전체 집계와 부서별 집계, 그리고 윈도우 프레임을 활용한 **누적 합계(Cumulative Sum)**를 실습합니다.\n\n1. **`SUM(sal) OVER (PARTITION BY deptno)`**: 부서 전체 급여 합계 (10번: 3000, 20번: 12000)\n2. **`AVG(sal) OVER (PARTITION BY deptno)`**: 부서 평균 급여 (10번: 1500, 20번: 4000)\n3. **누적 합계 (`ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`)**:\n   - `SUM(sal) OVER (PARTITION BY deptno ORDER BY sal ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cum_sal`\n   - 10번 부서: 1000 ➔ **3000**\n   - 20번 부서: 3000 ➔ 7000 ➔ **12000**\n\n💡 **핵심 관전 포인트**:\n- 일반 `GROUP BY`는 행을 그룹 단위로 축약하지만, `집계 함수 OVER()`는 **개별 사원 행을 그대로 보존**하면서 통계 컬럼을 나란히 붙여줍니다.',
    initialQuery: `SELECT empno,\n       ename,\n       deptno,\n       sal,\n       SUM(sal) OVER (PARTITION BY deptno) AS dept_total,\n       ROUND(AVG(sal) OVER (PARTITION BY deptno), 0) AS dept_avg,\n       SUM(sal) OVER (PARTITION BY deptno ORDER BY sal ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cum_sal\nFROM emp_sample\nORDER BY deptno, sal;`,
    solutionQuery: `SELECT empno, ename, deptno, sal, SUM(sal) OVER (PARTITION BY deptno) AS dept_total, ROUND(AVG(sal) OVER (PARTITION BY deptno), 0) AS dept_avg, SUM(sal) OVER (PARTITION BY deptno ORDER BY sal ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cum_sal FROM emp_sample ORDER BY deptno, sal`,
    hint: '`SUM(sal) OVER (PARTITION BY deptno)`, `SUM(sal) OVER (PARTITION BY deptno ORDER BY sal ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)`를 작성하세요.',
    explanation:
      '1. 집계함수 OVER (PARTITION BY ...): 행을 축소하지 않고 파티션별 집계 결과를 각 행에 표시합니다.\n2. ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW: 파티션의 첫 행부터 현재 행까지의 범위를 지정하여 누적 합계를 계산합니다.',
    quickExamples: [
      {
        label: '부서별 최대 급여(MAX)와 최소 급여(MIN)를 함께 조회',
        query: `SELECT ename, deptno, sal, MAX(sal) OVER (PARTITION BY deptno) AS max_sal, MIN(sal) OVER (PARTITION BY deptno) AS min_sal FROM emp_sample;`,
        description: '개별 행을 유지하며 부서 최고/최저 급여 출력',
      },
    ],
    tryModifications: [
      {
        label: '전체 사원 수(COUNT(*) OVER ())를 모든 행에 표시',
        query: `SELECT ename, sal, COUNT(*) OVER () AS total_headcount FROM emp_sample;`,
        guide: '모든 행에 전체 인원수인 5가 출력되는지 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 윈도우 함수 (Window Functions) > 하위 카테고리: 행 순서 함수 (LAG, LEAD, FIRST_VALUE, LAST_VALUE)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-win-3',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 2,
    category: '윈도우 함수 (Window Functions)',
    subCategory: '행 순서 함수 (LAG, LEAD, FIRST_VALUE, LAST_VALUE)',
    title: '[행 순서 함수] LAG, LEAD, FIRST_VALUE, LAST_VALUE',
    description:
      '**【SQLD 시험 핵심: 이전 행/다음 행 참조 및 윈도우 프레임의 첫 값/마지막 값】**\n사원 샘플 테이블 `emp_sample`에서 정렬된 순서에 따라 이전 사원, 다음 사원의 급여 및 최고/최저 급여 사원을 조회합니다.\n\n1. **`LAG(sal, 1, 0) OVER (ORDER BY sal)`**:\n   - 현재 행 기준 **1번째 이전(앞선) 행의 급여**를 가져옵니다. (가장 첫 행은 기본값 `0` 반환)\n2. **`LEAD(sal, 1, 0) OVER (ORDER BY sal)`**:\n   - 현재 행 기준 **1번째 다음(뒤선) 행의 급여**를 가져옵니다. (가장 마지막 행은 기본값 `0` 반환)\n3. **`FIRST_VALUE(ename) OVER (PARTITION BY deptno ORDER BY sal DESC)`**:\n   - 부서 내에서 급여가 가장 높은 사원의 이름\n4. **`LAST_VALUE(ename) OVER (PARTITION BY deptno ORDER BY sal DESC ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING)`**:\n   - 부서 내에서 급여가 가장 낮은 사원의 이름\n\n💡 **핵심 관전 포인트**:\n- `LAG`와 `LEAD`는 전년 대비 증감률, 이전 레코드와의 시계열 차이 계산에 필수적인 함수입니다.',
    initialQuery: `SELECT ename,\n       deptno,\n       sal,\n       LAG(sal, 1, 0) OVER (ORDER BY sal) AS prev_sal,\n       LEAD(sal, 1, 0) OVER (ORDER BY sal) AS next_sal,\n       sal - LAG(sal, 1, 0) OVER (ORDER BY sal) AS diff_from_prev,\n       FIRST_VALUE(ename) OVER (PARTITION BY deptno ORDER BY sal DESC) AS dept_top_earner\nFROM emp_sample\nORDER BY deptno, sal;`,
    solutionQuery: `SELECT ename, deptno, sal, LAG(sal, 1, 0) OVER (ORDER BY sal) AS prev_sal, LEAD(sal, 1, 0) OVER (ORDER BY sal) AS next_sal, sal - LAG(sal, 1, 0) OVER (ORDER BY sal) AS diff_from_prev, FIRST_VALUE(ename) OVER (PARTITION BY deptno ORDER BY sal DESC) AS dept_top_earner FROM emp_sample ORDER BY deptno, sal`,
    hint: '`LAG(sal, 1, 0) OVER (ORDER BY sal)`, `LEAD(sal, 1, 0) OVER (ORDER BY sal)`, `FIRST_VALUE(ename) OVER (PARTITION BY deptno ORDER BY sal DESC)`를 작성하세요.',
    explanation:
      '1. LAG(col, offset, default): 현재 행 기준으로 이전 행의 데이터를 가져옵니다.\n2. LEAD(col, offset, default): 현재 행 기준으로 다음 행의 데이터를 가져옵니다.\n3. FIRST_VALUE: 윈도우 프레임의 첫 번째 값을 반환합니다.\n4. LAST_VALUE: 윈도우 프레임의 마지막 값을 반환합니다.',
    quickExamples: [
      {
        label: '부서 내에서 바로 앞 사원과의 급여 차이 산출',
        query: `SELECT deptno, ename, sal, sal - LAG(sal, 1, sal) OVER (PARTITION BY deptno ORDER BY sal) AS dept_prev_diff FROM emp_sample ORDER BY deptno, sal;`,
        description: '부서 파티션 내에서 LAG 차이 계산',
      },
    ],
    tryModifications: [
      {
        label: 'LEAD로 바로 다음 사원의 이름 가져오기',
        query: `SELECT ename, sal, LEAD(ename, 1, '마지막') OVER (ORDER BY sal) AS next_person FROM emp_sample ORDER BY sal;`,
        guide: '급여 순서대로 다음 사람의 이름이 표시되는지 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 윈도우 함수 (Window Functions) > 하위 카테고리: 비율 및 분포 함수 (CUME_DIST, PERCENT_RANK, NTILE, RATIO_TO_REPORT)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-win-4',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 2,
    category: '윈도우 함수 (Window Functions)',
    subCategory: '비율 및 분포 함수 (CUME_DIST, PERCENT_RANK, NTILE, RATIO_TO_REPORT)',
    title: '[비율 및 분포 함수] CUME_DIST, PERCENT_RANK, NTILE, RATIO_TO_REPORT',
    description:
      '**【SQLD 시험 단골 핵심: 4대 비율 및 통계 분포 윈도우 함수】**\n사원 샘플 테이블 `emp_sample`의 5명 사원을 대상으로 백분율, 누적 분포, 등급 분할을 실습합니다.\n\n1. **`CUME_DIST()` (누적 분포 비율, $0 < \text{값} \le 1$)**:\n   - 현재 행의 값 이하인 행의 수 $\div$ 전체 행의 수\n   - 5명 기준: `0.2 ➔ 0.4 ➔ 0.6 ➔ 0.8 ➔ 1.0`\n2. **`PERCENT_RANK()` (백분위 순위, $0 \le \text{값} \le 1$)**:\n   - $\frac{\text{RANK} - 1}{N - 1}$ 공식으로 계산\n   - 최솟값은 항상 `0`, 최댓값은 항상 `1` 반환! (`0.0 ➔ 0.25 ➔ 0.5 ➔ 0.75 ➔ 1.0`)\n3. **`NTILE(n)` (균등 $n$분위수 등급 분할)**:\n   - `NTILE(2)` ➔ 상위/하위 2개 그룹(1등급, 2등급)으로 분할\n4. **`RATIO_TO_REPORT(sal)` (합계 대비 비율)**:\n   - 파티션 내 전체 합계 대비 현재 행의 급여 비중 ($\frac{\text{sal}}{\sum \text{sal}}$)',
    initialQuery: `SELECT ename,\n       deptno,\n       sal,\n       CUME_DIST() OVER (ORDER BY sal) AS cum_dist,\n       PERCENT_RANK() OVER (ORDER BY sal) AS pct_rank,\n       NTILE(2) OVER (ORDER BY sal) AS tile_2,\n       ROUND(RATIO_TO_REPORT(sal) OVER (PARTITION BY deptno), 3) AS dept_sal_ratio\nFROM emp_sample\nORDER BY sal;`,
    solutionQuery: `SELECT ename, deptno, sal, CUME_DIST() OVER (ORDER BY sal) AS cum_dist, PERCENT_RANK() OVER (ORDER BY sal) AS pct_rank, NTILE(2) OVER (ORDER BY sal) AS tile_2, ROUND(RATIO_TO_REPORT(sal) OVER (PARTITION BY deptno), 3) AS dept_sal_ratio FROM emp_sample ORDER BY sal`,
    hint: '`CUME_DIST() OVER (ORDER BY sal)`, `PERCENT_RANK() OVER (ORDER BY sal)`, `NTILE(2) OVER (ORDER BY sal)`, `RATIO_TO_REPORT(sal) OVER (PARTITION BY deptno)`를 작성하세요.',
    explanation:
      '1. CUME_DIST: 누적 분포 비율을 계산합니다 (0 초과 1 이하).\n2. PERCENT_RANK: 백분위 순위를 0 이상 1 이하로 계산합니다.\n3. NTILE(n): 전체 행을 n개의 등급 그룹으로 균등 분할합니다.\n4. RATIO_TO_REPORT: 전체 또는 파티션 합계 대비 현재 행 값의 비율을 계산합니다.',
    quickExamples: [
      {
        label: '14명 표준 emp 테이블에서 NTILE(4) 4분위수 산출',
        query: `SELECT ename, sal, NTILE(4) OVER (ORDER BY sal DESC) AS quartile FROM emp ORDER BY quartile, sal DESC;`,
        description: '급여 상위 25%부터 100%까지 1~4등급 부여',
      },
    ],
    tryModifications: [
      {
        label: '전체 총급여 대비 각 사원의 급여 비중 산출',
        query: `SELECT ename, sal, ROUND(RATIO_TO_REPORT(sal) OVER (), 3) AS total_sal_ratio FROM emp_sample ORDER BY sal DESC;`,
        guide: '전체 15000원 대비 각 사원의 급여 비율(김철수 0.067, 정동원 0.333)을 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 윈도우 함수 (Window Functions) > 하위 카테고리: WINDOWING 절 (ROWS vs RANGE 동순위 비교)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-win-5',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp',
    level: 2,
    category: '윈도우 함수 (Window Functions)',
    subCategory: 'WINDOWING 절 (ROWS vs RANGE 동순위 비교)',
    title: '[WINDOWING 절 동순위 비교] ROWS vs RANGE 누적 합계 (물리적 행 vs 논리적 값)',
    description:
      '**【SQLD 시험 최고 빈출 킬러: ROWS vs RANGE의 결정적 차이와 기본값 규칙】**\n급여가 3,000으로 동일한 동순위 사원(SCOTT 3000, FORD 3000)이 포함된 `emp` 테이블에서 `ROWS`와 `RANGE`의 누적 합계를 비교합니다.\n\n1. **`ROWS` (물리적 행 단위, Physical Row)**:\n   - `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`\n   - 동순위 값이 있어도 **물리적인 행 순서대로 1행씩 차례대로 누적**합니다.\n   - SCOTT(3000) ➔ 17,825원, FORD(3000) ➔ **20,825원** (1행씩 각각 합산!)\n2. **`RANGE` (논리적 값 범위 단위, Logical Value)**:\n   - `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`\n   - 동일한 값(3,000)을 만나면 **동순위 행 전체를 같은 범위로 묶어서 한꺼번에 누적**합니다!\n   - SCOTT(3000) ➔ **20,825원**, FORD(3000) ➔ **20,825원** (동일한 누적합 부여!)\n\n💡 **【SQLD 필수 암기: WINDOWING 생략 시 기본값 규칙】**:\n- `ORDER BY` 절이 있을 때 WINDOWING 절을 생략하면 기본값으로 **`RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`**가 자동 적용됩니다!',
    initialQuery: `SELECT ename,\n       sal,\n       SUM(sal) OVER (ORDER BY sal ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cum_rows,\n       SUM(sal) OVER (ORDER BY sal RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cum_range,\n       SUM(sal) OVER (ORDER BY sal) AS default_cum\nFROM emp\nORDER BY sal, ename;`,
    solutionQuery: `SELECT ename, sal, SUM(sal) OVER (ORDER BY sal ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cum_rows, SUM(sal) OVER (ORDER BY sal RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cum_range, SUM(sal) OVER (ORDER BY sal) AS default_cum FROM emp ORDER BY sal, ename`,
    hint: '`SUM(sal) OVER (ORDER BY sal ROWS ...)`, `SUM(sal) OVER (ORDER BY sal RANGE ...)`, `SUM(sal) OVER (ORDER BY sal)`를 작성하세요.',
    explanation:
      '1. ROWS: 물리적 행의 위치를 기준으로 1행씩 누적 합산합니다.\n2. RANGE: 정렬 컬럼의 데이터 값을 기준으로 동일한 값을 가진 모든 행을 한꺼번에 누적 합산합니다.\n3. ORDER BY 지정 후 프레임 생략 시 기본값은 RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW입니다.',
    quickExamples: [
      {
        label: '동순위 커미션(comm)에 대한 ROWS vs RANGE 비교',
        query: `SELECT ename, comm, COUNT(*) OVER (ORDER BY comm ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cnt_rows, COUNT(*) OVER (ORDER BY comm RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cnt_range FROM emp WHERE comm IS NOT NULL ORDER BY comm;`,
        description: '동순위 커미션 사원들의 누적 카운트 차이 관찰',
      },
    ],
    tryModifications: [
      {
        label: '5행 샘플 테이블(emp_sample)에서 ROWS 누적합 검증',
        query: `SELECT ename, sal, SUM(sal) OVER (ORDER BY sal ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total FROM emp_sample;`,
        guide: '1000 -> 3000 -> 6000 -> 10000 -> 15000으로 깔끔하게 누적되는지 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 윈도우 함수 (Window Functions) > 하위 카테고리: 슬라이딩 윈도우 (이동 평균 및 구간 집계)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-win-6',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 2,
    category: '윈도우 함수 (Window Functions)',
    subCategory: '슬라이딩 윈도우 (이동 평균 및 구간 집계)',
    title: '[슬라이딩 윈도우] ROWS BETWEEN n PRECEDING AND n FOLLOWING (이동 평균)',
    description:
      '**【SQLD 시험 핵심: 앞뒤 n개 행을 지정하는 슬라이딩 윈도우 프레임】**\n사원 샘플 테이블 `emp_sample`(급여: 1000, 2000, 3000, 4000, 5000)에서 앞뒤 물리적 행을 지정하여 **3명 이동 평균(Moving Average)**과 **최근 3개 행 구간 합**을 실습합니다.\n\n1. **3명 이동 평균 (`ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING`)**:\n   - 이전 1명 + 본인 + 다음 1명 = 총 3명 평균\n   - 김철수(1000): $(1000 + 2000) / 2 = \\mathbf{1500}$\n   - 이영희(2000): $(1000 + 2000 + 3000) / 3 = \\mathbf{2000}$\n   - 박민수(3000): $(2000 + 3000 + 4000) / 3 = \\mathbf{3000}$\n   - 최유나(4000): $(3000 + 4000 + 5000) / 3 = \\mathbf{4000}$\n   - 정동원(5000): $(4000 + 5000) / 2 = \\mathbf{4500}$\n2. **최근 3개 행 합계 (`ROWS BETWEEN 2 PRECEDING AND CURRENT ROW`)**:\n   - 박민수(3000): $1000 + 2000 + 3000 = \\mathbf{6000}$\n   - 최유나(4000): $2000 + 3000 + 4000 = \\mathbf{9000}$\n   - 정동원(5000): $3000 + 4000 + 5000 = \\mathbf{12000}$',
    initialQuery: `SELECT empno,\n       ename,\n       sal,\n       AVG(sal) OVER (ORDER BY empno ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING) AS moving_avg_3,\n       SUM(sal) OVER (ORDER BY empno ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS sum_recent_3\nFROM emp_sample\nORDER BY empno;`,
    solutionQuery: `SELECT empno, ename, sal, AVG(sal) OVER (ORDER BY empno ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING) AS moving_avg_3, SUM(sal) OVER (ORDER BY empno ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS sum_recent_3 FROM emp_sample ORDER BY empno`,
    hint: '`AVG(sal) OVER (ORDER BY empno ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING)`, `SUM(sal) OVER (ORDER BY empno ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)`를 작성하세요.',
    explanation:
      'ROWS BETWEEN n PRECEDING AND m FOLLOWING은 현재 행을 기준으로 이전 n행부터 이후 m행까지의 물리적 행 범위를 지정하여 이동 평균이나 구간 합을 구합니다.',
    quickExamples: [
      {
        label: '다음 2개 행(본인 포함 3개) 구간 합계 산출',
        query: `SELECT ename, sal, SUM(sal) OVER (ORDER BY empno ROWS BETWEEN CURRENT ROW AND 2 FOLLOWING) AS forward_3_sum FROM emp_sample ORDER BY empno;`,
        description: '현재 행부터 뒤선 2개 행까지 합산',
      },
    ],
    tryModifications: [
      {
        label: '14명 표준 emp 테이블에서 급여 순 3명 이동 평균 실습',
        query: `SELECT ename, sal, ROUND(AVG(sal) OVER (ORDER BY sal ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING), 0) AS m_avg FROM emp ORDER BY sal;`,
        guide: '급여 순서대로 주변 3명의 평균 급여를 계산해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 윈도우 함수 (Window Functions) > 하위 카테고리: RANGE 값 범위 프레임
  // -------------------------------------------------------------------------
  {
    id: 'sqld-win-7',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 2,
    category: '윈도우 함수 (Window Functions)',
    subCategory: 'RANGE 값 범위 프레임',
    title: '[값 기준 범위 검색] RANGE BETWEEN n PRECEDING AND n FOLLOWING (급여 오차 범위 합산)',
    description:
      '**【SQLD 심화: 행 개수가 아닌 실제 데이터 값(Value)의 차이를 기준으로 범위 설정】**\n사원 샘플 테이블 `emp_sample`(급여: 1000, 2000, 3000, 4000, 5000)에서 내 급여를 기준으로 **±1,000원 오차 범위 내 사원 수** 및 **내 급여보다 최대 1,000원 적은 사원부터 내 급여까지의 합계**를 구합니다.\n\n1. **내 급여 ±1,000원 범위 사원 수 (`RANGE BETWEEN 1000 PRECEDING AND 1000 FOLLOWING`)**:\n   - 김철수(1000): 0~2000원 범위 (김철수, 이영희) ➔ **2명**\n   - 이영희(2000): 1000~3000원 범위 (김철수, 이영희, 박민수) ➔ **3명**\n   - 박민수(3000): 2000~4000원 범위 (이영희, 박민수, 최유나) ➔ **3명**\n   - 최유나(4000): 3000~5000원 범위 (박민수, 최유나, 정동원) ➔ **3명**\n   - 정동원(5000): 4000~6000원 범위 (최유나, 정동원) ➔ **2명**\n2. **내 급여 -1,000원부터 내 급여까지 합계 (`RANGE BETWEEN 1000 PRECEDING AND CURRENT ROW`)**:\n   - 박민수(3000): 2000~3000원 범위 (이영희 2000 + 박민수 3000) = **5,000원**',
    initialQuery: `SELECT ename,\n       sal,\n       COUNT(*) OVER (ORDER BY sal RANGE BETWEEN 1000 PRECEDING AND 1000 FOLLOWING) AS peer_cnt,\n       SUM(sal) OVER (ORDER BY sal RANGE BETWEEN 1000 PRECEDING AND CURRENT ROW) AS sum_range_1000\nFROM emp_sample\nORDER BY sal;`,
    solutionQuery: `SELECT ename, sal, COUNT(*) OVER (ORDER BY sal RANGE BETWEEN 1000 PRECEDING AND 1000 FOLLOWING) AS peer_cnt, SUM(sal) OVER (ORDER BY sal RANGE BETWEEN 1000 PRECEDING AND CURRENT ROW) AS sum_range_1000 FROM emp_sample ORDER BY sal`,
    hint: '`COUNT(*) OVER (ORDER BY sal RANGE BETWEEN 1000 PRECEDING AND 1000 FOLLOWING)`, `SUM(sal) OVER (ORDER BY sal RANGE BETWEEN 1000 PRECEDING AND CURRENT ROW)`를 작성하세요.',
    explanation:
      'RANGE BETWEEN n PRECEDING AND m FOLLOWING은 행 개수가 아니라 정렬된 컬럼 값의 범위(val - n ~ val + m)를 기준으로 윈도우 프레임을 형성합니다.',
    quickExamples: [
      {
        label: 'RANGE로 내 급여의 500원 이하 차이 사원 수 조회',
        query: `SELECT ename, sal, COUNT(*) OVER (ORDER BY sal RANGE BETWEEN 500 PRECEDING AND 500 FOLLOWING) AS close_peers FROM emp_sample;`,
        description: '급여 차이가 500원 이내인 사원 수 집계 (각자 1명씩)',
      },
    ],
    tryModifications: [
      {
        label: '14명 표준 emp 테이블에서 급여 오차 ±500원 범위 사원 수 실습',
        query: `SELECT ename, sal, COUNT(*) OVER (ORDER BY sal RANGE BETWEEN 500 PRECEDING AND 500 FOLLOWING) AS peer_cnt FROM emp ORDER BY sal;`,
        guide:
          '밀집된 급여 구간(1250원, 3000원 등)에서 주변 사원 수가 몇 명으로 계산되는지 확인해 보세요!',
      },
    ],
  },

  // =========================================================================
  // 대분류: Top-N 쿼리 (Top-N Queries)
  // =========================================================================

  // -------------------------------------------------------------------------
  // 카테고리: Top-N 쿼리 (Top-N Queries) > 하위 카테고리: ROWNUM과 인라인 뷰
  // -------------------------------------------------------------------------
  {
    id: 'sqld-top-1',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp',
    level: 1,
    category: 'Top-N 쿼리 (Top-N Queries)',
    subCategory: 'ROWNUM과 인라인 뷰',
    title: '[ROWNUM의 원리와 인라인 뷰] ORDER BY와 ROWNUM의 실행 순서 함정 (SQLD 1순위 단골)',
    description:
      '**【SQLD 시험 최고 빈출 오답 함정: ROWNUM의 추출 순서와 인라인 뷰 필수 원리】**\n사원 테이블 `emp`에서 급여가 가장 높은 상위 3명의 사원을 조회합니다.\n\n❌ **치명적인 오답 쿼리 (WHERE ROWNUM <= 3 ORDER BY sal DESC)**:\n- `WHERE` 절이 `ORDER BY`보다 먼저 실행되므로, 전체 14명 중 **무작위 3명을 먼저 뽑은 뒤 그 3명 안에서만 정렬**합니다! (진짜 상위 3명이 아님)\n\n⭕ **올바른 Top-N 쿼리 (인라인 뷰 필수)**:\n- **`SELECT * FROM (SELECT * FROM emp ORDER BY sal DESC) WHERE ROWNUM <= 3;`**\n- 인라인 뷰(`FROM (SELECT ... ORDER BY ...)`)에서 전체 14명을 급여 내림차순으로 **먼저 정렬**한 뒤, 그 정렬된 결과 집합에서 상위 3행을 추출합니다!\n- 결과: KING(5000), SCOTT(3000), FORD(3000)',
    initialQuery: `SELECT ename,\n       sal,\n       deptno\nFROM (\n  SELECT ename,\n         sal,\n         deptno\n  FROM emp\n  ORDER BY sal DESC\n)\nWHERE ROWNUM <= 3;`,
    solutionQuery: `SELECT ename, sal, deptno FROM (SELECT ename, sal, deptno FROM emp ORDER BY sal DESC) WHERE ROWNUM <= 3`,
    hint: '`SELECT ename, sal, deptno FROM (SELECT ename, sal, deptno FROM emp ORDER BY sal DESC) WHERE ROWNUM <= 3`을 작성하세요.',
    explanation:
      '1. ROWNUM은 WHERE 절에서 행이 선택될 때 1부터 순차적으로 부여되는 가상 컬럼입니다.\n2. ORDER BY보다 WHERE 절이 먼저 실행되므로, 먼저 정렬된 인라인 뷰를 구성한 뒤 바깥에서 ROWNUM 조건을 걸어야 정확한 Top-N이 산출됩니다.',
    quickExamples: [
      {
        label: '잘못된 쿼리와 올바른 쿼리 비교',
        query: `SELECT ename, sal FROM emp WHERE ROWNUM <= 3 ORDER BY sal DESC;`,
        description: '무작위 3명(SMITH, ALLEN, WARD) 중 정렬된 오답 결과 확인',
      },
    ],
    tryModifications: [
      {
        label: '5행 샘플 테이블(emp_sample)에서 급여 상위 2명 추출',
        query: `SELECT ename, sal FROM (SELECT ename, sal FROM emp_sample ORDER BY sal DESC) WHERE ROWNUM <= 2;`,
        guide: '급여 1위 정동원(5000)과 2위 최유나(4000)가 정상 추출되는지 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: Top-N 쿼리 (Top-N Queries) > 하위 카테고리: ROWNUM 조건식 함정과 페이징
  // -------------------------------------------------------------------------
  {
    id: 'sqld-top-2',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp',
    level: 2,
    category: 'Top-N 쿼리 (Top-N Queries)',
    subCategory: 'ROWNUM 조건식 함정과 페이징',
    title: '[ROWNUM 페이징과 조건식 함정] ROWNUM = 2가 안 되는 이유와 2단계 인라인 뷰 페이징',
    description:
      '**【SQLD 시험 단골 킬러: ROWNUM = 2 또는 ROWNUM > 1이 항상 0건을 반환하는 이유】**\n\n1. **`WHERE ROWNUM = 2`가 실패하는 메커니즘**:\n   - 첫 번째 행을 검사할 때 `ROWNUM = 1`인데 조건(`ROWNUM = 2`)이 거짓이므로 첫 행이 버려집니다.\n   - 다음 행을 검사할 때 다시 `ROWNUM = 1`부터 시작되지만 또 탈락... 결국 모든 행이 탈락하여 **결과가 0건이 됩니다!**\n   - 따라서 `ROWNUM`은 **반드시 `ROWNUM = 1` 또는 `ROWNUM <= N` 형태로만 직접 조회**할 수 있습니다.\n2. **페이징(4~6위 사원 조회) 구현 공식 (2단계 인라인 뷰)**:\n   - 1단계: 정렬 수행\n   - 2단계: `ROWNUM AS rnum`으로 고정 별칭 부여\n   - 3단계: 바깥에서 `WHERE rnum BETWEEN 4 AND 6`으로 필터링!',
    initialQuery: `SELECT ename,\n       sal,\n       rnum\nFROM (\n  SELECT ename,\n         sal,\n         ROWNUM AS rnum\n  FROM (\n    SELECT ename,\n           sal\n    FROM emp\n    ORDER BY sal DESC\n  )\n)\nWHERE rnum BETWEEN 4 AND 6;`,
    solutionQuery: `SELECT ename, sal, rnum FROM (SELECT ename, sal, ROWNUM AS rnum FROM (SELECT ename, sal FROM emp ORDER BY sal DESC)) WHERE rnum BETWEEN 4 AND 6`,
    hint: '`SELECT ename, sal, rnum FROM (SELECT ename, sal, ROWNUM AS rnum FROM (SELECT ename, sal FROM emp ORDER BY sal DESC)) WHERE rnum BETWEEN 4 AND 6`을 작성하세요.',
    explanation:
      '1. ROWNUM은 1부터 시작하지 않는 조건(예: ROWNUM = 2, ROWNUM > 1)을 단독으로 사용하면 항상 0행을 반환합니다.\n2. 특정 구간(페이징) 조회를 위해서는 인라인 뷰 내부에서 ROWNUM에 별칭을 부여한 후 외부에서 필터링해야 합니다.',
    quickExamples: [
      {
        label: 'ROWNUM = 2 직접 조회 시 0건 반환 관찰',
        query: `SELECT * FROM emp WHERE ROWNUM = 2;`,
        description: '조건 불만족으로 아무런 행도 반환되지 않음 확인',
      },
    ],
    tryModifications: [
      {
        label: '급여 1위 딱 1명만 조회 (WHERE ROWNUM = 1)',
        query: `SELECT ename, sal FROM (SELECT ename, sal FROM emp ORDER BY sal DESC) WHERE ROWNUM = 1;`,
        guide: '최고 급여자 KING(5000) 1명이 정상 조회되는지 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: Top-N 쿼리 (Top-N Queries) > 하위 카테고리: OFFSET-FETCH 절 (Oracle 12c+)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-top-3',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp',
    level: 1,
    category: 'Top-N 쿼리 (Top-N Queries)',
    subCategory: 'OFFSET-FETCH 절 (Oracle 12c+)',
    title: '[ANSI 표준 Top-N] OFFSET-FETCH 절 (Oracle 12c+ 및 표준 페이징)',
    description:
      '**【SQLD 시험 최신 출제 경향: 복잡한 인라인 뷰 없는 OFFSET-FETCH 문법】**\nOracle 12c 및 ANSI SQL:2008 표준부터 도입된 `OFFSET-FETCH` 절을 사용하면 인라인 뷰를 중첩할 필요 없이 직관적인 Top-N 및 페이징 쿼리를 작성할 수 있습니다.\n\n1. **상위 3명 추출 (`FETCH FIRST n ROWS ONLY`)**:\n   - `ORDER BY sal DESC FETCH FIRST 3 ROWS ONLY;`\n2. **페이징 (`OFFSET m ROWS FETCH NEXT n ROWS ONLY`)**:\n   - `OFFSET 3 ROWS FETCH NEXT 3 ROWS ONLY;` ➔ 상위 3명을 건너뛰고(Skip), 그다음 3명을 조회 (4~6위 조회!)\n3. **`WITH TIES` 옵션**:\n   - `FETCH FIRST 3 ROWS WITH TIES;` ➔ 마지막 3등과 동일한 급여(동순위)를 가진 사원이 있으면 3명을 초과하더라도 함께 포함!',
    initialQuery: `SELECT ename,\n       sal,\n       deptno\nFROM emp\nORDER BY sal DESC\nOFFSET 3 ROWS\nFETCH NEXT 3 ROWS ONLY;`,
    solutionQuery: `SELECT ename, sal, deptno FROM emp ORDER BY sal DESC OFFSET 3 ROWS FETCH NEXT 3 ROWS ONLY`,
    hint: '`SELECT ename, sal, deptno FROM emp ORDER BY sal DESC OFFSET 3 ROWS FETCH NEXT 3 ROWS ONLY`를 작성하세요.',
    explanation:
      '1. FETCH FIRST n ROWS ONLY: 상위 n개의 행을 반환합니다.\n2. OFFSET m ROWS FETCH NEXT n ROWS ONLY: m개의 행을 건너뛰고 다음 n개의 행을 반환하여 페이징을 구현합니다.\n3. WITH TIES: 마지막 순위와 동일한 값을 가진 동순위 행을 모두 포함합니다.',
    quickExamples: [
      {
        label: '상위 5명 직관적 조회 (FETCH FIRST 5 ROWS ONLY)',
        query: `SELECT ename, sal FROM emp ORDER BY sal DESC FETCH FIRST 5 ROWS ONLY;`,
        description: '급여 상위 5명 사원 깔끔하게 추출',
      },
    ],
    tryModifications: [
      {
        label: '동순위 포함 옵션 (FETCH FIRST 2 ROWS WITH TIES)',
        query: `SELECT ename, sal FROM emp ORDER BY sal DESC FETCH FIRST 2 ROWS WITH TIES;`,
        guide:
          '공동 2등인 SCOTT(3000)과 FORD(3000)가 모두 포함되어 3명이 반환되는지 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: Top-N 쿼리 (Top-N Queries) > 하위 카테고리: 윈도우 함수 Top-N & 부서별 Top-N
  // -------------------------------------------------------------------------
  {
    id: 'sqld-top-4',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp',
    level: 2,
    category: 'Top-N 쿼리 (Top-N Queries)',
    subCategory: '윈도우 함수 Top-N & 부서별 Top-N',
    title: '[윈도우 함수 기반 Top-N] ROW_NUMBER / DENSE_RANK 및 부서별 Top-N',
    description:
      '**【SQLD/SQLP 실무 최고 빈출: 각 부서별(그룹별) 1~2위 사원 추출】**\n`ROWNUM`으로는 각 그룹별 Top-N을 한 번에 뽑을 수 없지만, **윈도우 함수(`ROW_NUMBER() / DENSE_RANK() OVER (PARTITION BY ...)`)와 인라인 뷰를 결합**하면 부서별 상위 N명을 손쉽게 추출할 수 있습니다.\n\n1. **부서별 급여 순위 부여 (인라인 뷰)**:\n   - `DENSE_RANK() OVER (PARTITION BY deptno ORDER BY sal DESC) AS dept_rk`\n2. **외부 쿼리에서 상위 N건 필터링**:\n   - `WHERE dept_rk <= 2` ➔ 10번, 20번, 30번 각 부서별로 급여 1~2위 사원들만 모두 추출!',
    initialQuery: `SELECT deptno,\n       ename,\n       sal,\n       dept_rk\nFROM (\n  SELECT deptno,\n         ename,\n         sal,\n         DENSE_RANK() OVER (PARTITION BY deptno ORDER BY sal DESC) AS dept_rk\n  FROM emp\n)\nWHERE dept_rk <= 2\nORDER BY deptno, dept_rk;`,
    solutionQuery: `SELECT deptno, ename, sal, dept_rk FROM (SELECT deptno, ename, sal, DENSE_RANK() OVER (PARTITION BY deptno ORDER BY sal DESC) AS dept_rk FROM emp) WHERE dept_rk <= 2 ORDER BY deptno, dept_rk`,
    hint: '`SELECT deptno, ename, sal, dept_rk FROM (SELECT ... DENSE_RANK() OVER (PARTITION BY deptno ORDER BY sal DESC) AS dept_rk FROM emp) WHERE dept_rk <= 2 ORDER BY deptno, dept_rk`를 작성하세요.',
    explanation:
      '윈도우 함수(DENSE_RANK/ROW_NUMBER)에 PARTITION BY를 지정하여 그룹별 순위를 매긴 후, 인라인 뷰 바깥에서 순위 조건을 걸면 그룹별 Top-N을 추출할 수 있습니다.',
    quickExamples: [
      {
        label: '부서별 최고 급여자 딱 1명씩만 추출 (WHERE dept_rk = 1)',
        query: `SELECT deptno, ename, sal FROM (SELECT deptno, ename, sal, ROW_NUMBER() OVER (PARTITION BY deptno ORDER BY sal DESC) AS dept_rk FROM emp) WHERE dept_rk = 1 ORDER BY deptno;`,
        description: '10번(KING), 20번(SCOTT), 30번(BLAKE) 각 부서 1위 출력',
      },
    ],
    tryModifications: [
      {
        label: '직책(job)별 최고 급여자 추출',
        query: `SELECT job, ename, sal FROM (SELECT job, ename, sal, ROW_NUMBER() OVER (PARTITION BY job ORDER BY sal DESC) AS rk FROM emp) WHERE rk = 1 ORDER BY sal DESC;`,
        guide: '직책별로 가장 연봉이 높은 1위 사원들을 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: Top-N 쿼리 (Top-N Queries) > 하위 카테고리: ROWID vs ROWNUM 핵심 비교
  // -------------------------------------------------------------------------
  {
    id: 'sqld-top-5',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 1,
    category: 'Top-N 쿼리 (Top-N Queries)',
    subCategory: 'ROWID vs ROWNUM 핵심 비교',
    title: '[ROWID vs ROWNUM 비교] 물리적 주소(ROWID) vs 동적 순번(ROWNUM)',
    description:
      '**【SQLD 시험 단골 개념: 의사 컬럼(Pseudocolumn) ROWID와 ROWNUM의 차이】**\n\n1. **`ROWID` (물리적 주소)**:\n   - 테이블 내에서 특정 행(Row)이 저장된 **물리적인 고유 위치 주소** (데이터 오브젝트 번호, 데이터 파일 번호, 블록 번호, 슬롯 번호)\n   - 행을 `UPDATE`하거나 조회해도 **물리 주소는 변경되지 않음**\n   - 오라클에서 단일 행에 접근하는 **가장 빠른 검색 경로**\n2. **`ROWNUM` (동적 임시 일련번호)**:\n   - 쿼리가 실행되어 행이 반환될 때 **임시로 매겨지는 가상 번호**\n   - 물리적으로 저장되지 않으며, `ORDER BY`나 `WHERE` 조건에 따라 **조회할 때마다 번호가 동적으로 변함**',
    initialQuery: `SELECT ROWNUM AS dynamic_rownum,\n       empno,\n       ename,\n       sal\nFROM emp_sample\nORDER BY sal DESC;`,
    solutionQuery: `SELECT ROWNUM AS dynamic_rownum, empno, ename, sal FROM emp_sample ORDER BY sal DESC`,
    hint: '`SELECT ROWNUM AS dynamic_rownum, empno, ename, sal FROM emp_sample ORDER BY sal DESC`를 작성하세요.',
    explanation:
      '1. ROWID는 행의 물리적 저장 위치를 가리키는 고유 식별자입니다.\n2. ROWNUM은 쿼리 결과 집합에 임시로 부여되는 동적 순번 가상 컬럼입니다.',
    quickExamples: [
      {
        label: '사번 오름차순 시 ROWNUM 부여 관찰',
        query: `SELECT ROWNUM AS row_seq, empno, ename FROM emp_sample ORDER BY empno ASC;`,
        description: '정렬 기준에 따라 ROWNUM이 매겨지는 순서 확인',
      },
    ],
    tryModifications: [
      {
        label: '급여 상위 3명에 대해 ROWNUM 순번 재부여',
        query: `SELECT ROWNUM AS final_rank, ename, sal FROM (SELECT ename, sal FROM emp_sample ORDER BY sal DESC) WHERE ROWNUM <= 3;`,
        guide: '1, 2, 3번이 깔끔하게 매겨지는지 확인해 보세요!',
      },
    ],
  },

  // =========================================================================
  // 대분류: 셀프 조인 (SELF JOIN)
  // =========================================================================

  // -------------------------------------------------------------------------
  // 카테고리: 셀프 조인 (SELF JOIN) > 하위 카테고리: 사원과 직속 관리자 매칭
  // -------------------------------------------------------------------------
  {
    id: 'sqld-self-1',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp',
    level: 1,
    category: '셀프 조인 (SELF JOIN)',
    subCategory: '사원과 직속 관리자 매칭',
    title: '[셀프 조인 기초] 사원과 직속 관리자(MGR) 매칭 및 사장(KING) 누락 방지 LEFT JOIN',
    description:
      '**【SQLD 시험 필수: 동일 테이블을 2번 참조하는 셀프 조인과 OUTER JOIN의 필요성】**\n사원 테이블 `emp`에는 사원 정보와 해당 사원의 직속 관리자 사번(`mgr`)이 함께 저장되어 있습니다. 동일 테이블에 서로 다른 별칭(`e: 사원`, `m: 관리자`)을 부여하여 사원명과 관리자명을 매칭합니다.\n\n1. **셀프 조인 연결 조건**: `e.mgr = m.empno`\n2. **【SQLD 단골 함정: 사장(KING)의 누락 방지】**:\n   - 사장인 KING은 `mgr` 컬럼이 `NULL`입니다!\n   - 따라서 일반 `INNER JOIN`을 수행하면 KING이 **결과에서 누락(13행만 출력)**됩니다!\n   - 사장(KING)까지 온전히 14명 전체를 조회하려면 **`LEFT OUTER JOIN`을 반드시 사용**해야 합니다!',
    initialQuery: `SELECT e.empno AS emp_id,\n       e.ename AS employee_name,\n       e.job,\n       e.mgr AS manager_id,\n       NVL(m.ename, '최고 경영자(없음)') AS manager_name\nFROM emp e\nLEFT OUTER JOIN emp m\n  ON e.mgr = m.empno\nORDER BY e.empno;`,
    solutionQuery: `SELECT e.empno AS emp_id, e.ename AS employee_name, e.job, e.mgr AS manager_id, NVL(m.ename, '최고 경영자(없음)') AS manager_name FROM emp e LEFT OUTER JOIN emp m ON e.mgr = m.empno ORDER BY e.empno`,
    hint: '`FROM emp e LEFT OUTER JOIN emp m ON e.mgr = m.empno ORDER BY e.empno`를 작성하세요.',
    explanation:
      '1. 셀프 조인은 동일한 테이블을 참조하므로 반드시 서로 다른 테이블 별칭(e, m)을 부여해야 합니다.\n2. 관리자가 없는 최상위 사원(KING)을 포함하기 위해 LEFT OUTER JOIN을 사용합니다.',
    quickExamples: [
      {
        label: 'INNER JOIN으로 KING이 누락되는 13행 현상 관찰',
        query: `SELECT e.ename AS emp, m.ename AS mgr FROM emp e INNER JOIN emp m ON e.mgr = m.empno;`,
        description: 'KING이 제외되고 13행만 조회됨 확인',
      },
    ],
    tryModifications: [
      {
        label: '관리자보다 급여를 더 많이 받는 부하 직원 찾기 (SQLD 단골 퀴즈)',
        query: `SELECT e.ename AS emp, e.sal AS emp_sal, m.ename AS mgr, m.sal AS mgr_sal FROM emp e INNER JOIN emp m ON e.mgr = m.empno WHERE e.sal > m.sal;`,
        guide:
          '관리자(JONES 2975)보다 급여가 높은 부하 직원(SCOTT 3000, FORD 3000)을 조회해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 셀프 조인 (SELF JOIN) > 하위 카테고리: 다단계 계층 셀프 조인
  // -------------------------------------------------------------------------
  {
    id: 'sqld-self-2',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp',
    level: 2,
    category: '셀프 조인 (SELF JOIN)',
    subCategory: '다단계 계층 셀프 조인',
    title: '[다단계 셀프 조인] 3단계 계층 구조 (사원 ➔ 직속 관리자 ➔ 차상위 관리자)',
    description:
      '사원 테이블 `emp`를 3번 셀프 조인하여 **사원(`e`) ➔ 직속 매니저(`m`) ➔ 차상위 최고 총괄 매니저(`top_m`)**의 3단계 조직 보고 라인을 구성합니다.\n\n1. **1차 조인**: `e.mgr = m.empno` (직속 매니저 매칭)\n2. **2차 조인**: `m.mgr = top_m.empno` (매니저의 매니저 매칭)\n3. **결과 관찰**:\n   - SMITH의 직속 매니저는 FORD이며, 차상위 매니저는 JONES입니다!\n   - 계층 깊이가 고정된 경우 셀프 조인으로 다단계 조직도를 쉽게 구현할 수 있습니다.',
    initialQuery: `SELECT e.ename AS employee,\n       e.job AS emp_job,\n       NVL(m.ename, '-') AS direct_mgr,\n       NVL(top_m.ename, '-') AS senior_mgr\nFROM emp e\nLEFT JOIN emp m\n  ON e.mgr = m.empno\nLEFT JOIN emp top_m\n  ON m.mgr = top_m.empno\nORDER BY e.empno;`,
    solutionQuery: `SELECT e.ename AS employee, e.job AS emp_job, NVL(m.ename, '-') AS direct_mgr, NVL(top_m.ename, '-') AS senior_mgr FROM emp e LEFT JOIN emp m ON e.mgr = m.empno LEFT JOIN emp top_m ON m.mgr = top_m.empno ORDER BY e.empno`,
    hint: '`FROM emp e LEFT JOIN emp m ON e.mgr = m.empno LEFT JOIN emp top_m ON m.mgr = top_m.empno`를 작성하세요.',
    explanation:
      '동일 테이블을 여러 번 연속으로 조인(e -> m -> top_m)하여 다단계 조직 계층 보고 라인을 추적할 수 있습니다.',
    quickExamples: [
      {
        label: '차상위 매니저까지 급여 합계 비교',
        query: `SELECT e.ename, e.sal, m.ename AS mgr_name, top_m.ename AS top_mgr FROM emp e INNER JOIN emp m ON e.mgr = m.empno INNER JOIN emp top_m ON m.mgr = top_m.empno;`,
        description: '3단계 보고 라인이 모두 존재하는 실무 사원들만 추출',
      },
    ],
    tryModifications: [
      {
        label: '관리자별 직속 부하 직원 수 집계',
        query: `SELECT m.ename AS manager_name, COUNT(e.empno) AS subordinate_count FROM emp e INNER JOIN emp m ON e.mgr = m.empno GROUP BY m.ename ORDER BY subordinate_count DESC;`,
        guide: '가장 많은 직속 부하 직원을 둔 매니저(BLAKE 5명)를 확인해 보세요!',
      },
    ],
  },

  // =========================================================================
  // 대분류: 계층형 질의 (Hierarchical Query)
  // =========================================================================

  // -------------------------------------------------------------------------
  // 카테고리: 계층형 질의 (Hierarchical Query) > 하위 카테고리: 순방향 계층 전개 (Top-Down)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-hier-1',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp',
    level: 2,
    category: '계층형 질의 (Hierarchical Query)',
    subCategory: '순방향 계층 전개 (Top-Down)',
    title: '[계층형 질의 순방향] START WITH ~ CONNECT BY PRIOR (Top-Down 전개와 LEVEL, 가상 컬럼)',
    description:
      "**【SQLD 시험 최고 빈출 핵심: START WITH, CONNECT BY PRIOR 순방향 공식】**\n사원 테이블 `emp`에서 사장(KING)을 루트로 하여 하위 조직원들을 트리 구조로 순방향 전개(Top-Down)합니다.\n\n1. **`START WITH mgr IS NULL`**:\n   - 계층 전개의 시작 루트 노드를 지정 (관리자가 없는 사장 KING부터 시작)\n2. **`CONNECT BY PRIOR empno = mgr` (★ SQLD 암기 공식)**:\n   - `PRIOR`가 부모 컬럼(`empno`)에 붙으면 **순방향(Top-Down: 부모 ➔ 자식)** 전개!\n   - `PRIOR 자식 = 부모`이면 **역방향(Bottom-Up: 자식 ➔ 부모)** 전개!\n3. **계층형 질의 주요 키워드**:\n   - **`LEVEL`**: 계층 깊이 (루트 노드는 1, 2, 3...)\n   - **`LPAD(' ', 2*(LEVEL-1)) || ename`**: 계층적 들여쓰기 시각화\n   - **`SYS_CONNECT_BY_PATH(ename, '/')`**: 계층 경로 출력 (예: `/KING/JONES/SCOTT`)\n   - **`CONNECT_BY_ISLEAF`**: 최하위 말단(Leaf) 사원이면 `1`, 아니면 `0`",
    initialQuery: `SELECT e.empno,\n       e.ename,\n       e.mgr,\n       NVL(m.ename, 'ROOT') AS mgr_name,\n       CASE\n         WHEN e.mgr IS NULL THEN 'Level 1: 사장 (최상위)'\n         WHEN m.mgr IS NULL THEN 'Level 2: 관리자 (부서장)'\n         ELSE 'Level 3: 실무 사원'\n       END AS hierarchy_level\nFROM emp e\nLEFT JOIN emp m ON e.mgr = m.empno\nORDER BY e.mgr NULLS FIRST, e.empno;`,
    solutionQuery: `SELECT e.empno, e.ename, e.mgr, NVL(m.ename, 'ROOT') AS mgr_name, CASE WHEN e.mgr IS NULL THEN 'Level 1: 사장 (최상위)' WHEN m.mgr IS NULL THEN 'Level 2: 관리자 (부서장)' ELSE 'Level 3: 실무 사원' END AS hierarchy_level FROM emp e LEFT JOIN emp m ON e.mgr = m.empno ORDER BY e.mgr NULLS FIRST, e.empno`,
    hint: '사원-관리자 계층 관계와 레벨을 조회하는 쿼리를 작성하세요.',
    explanation:
      '1. START WITH 절은 계층 구조의 시작 노드를 지정합니다.\n2. CONNECT BY PRIOR 부모키 = 자식키는 상위에서 하위로 순방향 계층 전개를 수행합니다.\n3. LEVEL, SYS_CONNECT_BY_PATH, CONNECT_BY_ISLEAF 등의 의사 컬럼 및 함수를 제공합니다.',
    quickExamples: [
      {
        label: '부서별 관리자-사원 계층 목록 조회',
        query: `SELECT e.deptno, e.ename AS emp, e.job, m.ename AS mgr FROM emp e LEFT JOIN emp m ON e.mgr = m.empno ORDER BY e.deptno, e.mgr;`,
        description: '부서 번호 및 관리자별 사원 트리 구조 확인',
      },
    ],
    tryModifications: [
      {
        label: 'JONES(7566) 부서장 산하의 팀원들만 필터링',
        query: `SELECT e.ename, e.job, e.sal FROM emp e WHERE e.mgr = 7566;`,
        guide: 'JONES 직속 부하 직원인 SCOTT(3000)과 FORD(3000)를 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 계층형 질의 (Hierarchical Query) > 하위 카테고리: 역방향 전개 & ORDER SIBLINGS BY
  // -------------------------------------------------------------------------
  {
    id: 'sqld-hier-2',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp',
    level: 2,
    category: '계층형 질의 (Hierarchical Query)',
    subCategory: '역방향 전개 & ORDER SIBLINGS BY',
    title:
      '[계층형 질의 역방향 & ORDER SIBLINGS BY] 하위 사원에서 상위 관리자로 역방향 전개 (Bottom-Up)',
    description:
      "**【SQLD 시험 핵심: 역방향 전개 공식과 ORDER SIBLINGS BY 형제 노드 정렬】**\n\n1. **역방향 전개 (Bottom-Up: `CONNECT BY PRIOR mgr = empno`)**:\n   - 특정 말단 사원(SMITH)에서 출발하여 상위 직속 매니저(FORD), 차상위 매니저(JONES), 최고 사장(KING)까지 **보고 체계를 역추적**합니다!\n   - `START WITH ename = 'SMITH'` ➔ SMITH ➔ FORD ➔ JONES ➔ KING 순서로 전개\n2. **`ORDER SIBLINGS BY` (형제 노드 정렬)**:\n   - 일반 `ORDER BY`를 쓰면 계층 트리 구조가 완전히 깨집니다!\n   - `ORDER SIBLINGS BY sal DESC`를 사용하면 **동일한 부모를 둔 형제(Siblings) 노드들끼리만 계층을 유지하면서 급여순으로 정렬**합니다!",
    initialQuery: `SELECT e.ename AS current_emp,\n       e.job AS emp_job,\n       e.sal,\n       m.ename AS mgr_name,\n       top_m.ename AS top_mgr_name\nFROM emp e\nLEFT JOIN emp m ON e.mgr = m.empno\nLEFT JOIN emp top_m ON m.mgr = top_m.empno\nWHERE e.ename = 'SMITH';`,
    solutionQuery: `SELECT e.ename AS current_emp, e.job AS emp_job, e.sal, m.ename AS mgr_name, top_m.ename AS top_mgr_name FROM emp e LEFT JOIN emp m ON e.mgr = m.empno LEFT JOIN emp top_m ON m.mgr = top_m.empno WHERE e.ename = 'SMITH'`,
    hint: "`WHERE e.ename = 'SMITH'`로 역방향 보고 라인을 조회하세요.",
    explanation:
      '1. CONNECT BY PRIOR 자식키 = 부모키는 하위에서 상위로 역방향 전개합니다.\n2. ORDER SIBLINGS BY는 계층 구조 트리를 보존하면서 동일 부모의 형제 노드들만 정렬합니다.',
    quickExamples: [
      {
        label: 'ADAMS의 상위 보고 체계 조회',
        query: `SELECT e.ename AS emp, m.ename AS mgr, top_m.ename AS top_mgr FROM emp e LEFT JOIN emp m ON e.mgr = m.empno LEFT JOIN emp top_m ON m.mgr = top_m.empno WHERE e.ename = 'ADAMS';`,
        description: 'ADAMS -> SCOTT -> JONES 보고 체계 확인',
      },
    ],
    tryModifications: [
      {
        label: '영업팀(SALESMAN) 사원들의 공통 관리자 확인',
        query: `SELECT e.ename, e.job, m.ename AS mgr FROM emp e INNER JOIN emp m ON e.mgr = m.empno WHERE e.job = 'SALESMAN';`,
        guide: '모든 SALESMAN의 관리자가 BLAKE인지 확인해 보세요!',
      },
    ],
  },

  // =========================================================================
  // 대분류: PIVOT과 UNPIVOT (행-열 변환)
  // =========================================================================

  // -------------------------------------------------------------------------
  // 카테고리: PIVOT과 UNPIVOT (행-열 변환) > 하위 카테고리: PIVOT (행 ➔ 열 변환)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-pivot-1',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp',
    level: 2,
    category: 'PIVOT과 UNPIVOT (행-열 변환)',
    subCategory: 'PIVOT (행 ➔ 열 변환)',
    title: '[PIVOT 행을 열로 변환] CASE WHEN 크로스탭 집계 및 Oracle PIVOT 절',
    description:
      '**【SQLD 시험 필수: 세로 행 데이터를 가로 컬럼으로 회전하는 PIVOT 기법】**\n사원 테이블 `emp`에서 직책(`job`)별 각 부서(10번, 20번, 30번)의 급여 합계를 가로 컬럼(`dept10`, `dept20`, `dept30`)으로 회전(Pivot)시킵니다.\n\n1. **표준 `SUM(CASE WHEN ...)` 크로스탭 피벗 (모든 DBMS 호환)**:\n   - `SUM(CASE WHEN deptno = 10 THEN sal ELSE 0 END) AS dept10`\n   - `SUM(CASE WHEN deptno = 20 THEN sal ELSE 0 END) AS dept20`\n   - `SUM(CASE WHEN deptno = 30 THEN sal ELSE 0 END) AS dept30`\n2. **Oracle 11g+ `PIVOT` 절 문법 (SQLD 동등 변환 단골)**:\n   - `SELECT * FROM (SELECT job, deptno, sal FROM emp) PIVOT (SUM(sal) FOR deptno IN (10 AS dept10, 20 AS dept20, 30 AS dept30));`\n   - `CASE WHEN` 집계 쿼리와 완벽히 동일한 결과를 산출합니다!',
    initialQuery: `SELECT job,\n       SUM(CASE WHEN deptno = 10 THEN sal ELSE 0 END) AS dept10_sal,\n       SUM(CASE WHEN deptno = 20 THEN sal ELSE 0 END) AS dept20_sal,\n       SUM(CASE WHEN deptno = 30 THEN sal ELSE 0 END) AS dept30_sal,\n       SUM(sal) AS total_sal\nFROM emp\nGROUP BY job\nORDER BY job;`,
    solutionQuery: `SELECT job, SUM(CASE WHEN deptno = 10 THEN sal ELSE 0 END) AS dept10_sal, SUM(CASE WHEN deptno = 20 THEN sal ELSE 0 END) AS dept20_sal, SUM(CASE WHEN deptno = 30 THEN sal ELSE 0 END) AS dept30_sal, SUM(sal) AS total_sal FROM emp GROUP BY job ORDER BY job`,
    hint: '`SELECT job, SUM(CASE WHEN deptno = 10 THEN sal ELSE 0 END) AS dept10_sal ... FROM emp GROUP BY job ORDER BY job`를 작성하세요.',
    explanation:
      'PIVOT은 행의 특정 값들을 컬럼 헤더로 회전시키는 연산입니다. SUM(CASE WHEN ...)과 GROUP BY를 사용하면 모든 표준 SQL 환경에서 크로스탭 피벗을 구현할 수 있습니다.',
    quickExamples: [
      {
        label: '직책별 사원 수(COUNT) 피벗 집계',
        query: `SELECT job, SUM(CASE WHEN deptno = 10 THEN 1 ELSE 0 END) AS d10_cnt, SUM(CASE WHEN deptno = 20 THEN 1 ELSE 0 END) AS d20_cnt, SUM(CASE WHEN deptno = 30 THEN 1 ELSE 0 END) AS d30_cnt, COUNT(*) AS total_cnt FROM emp GROUP BY job ORDER BY job;`,
        description: '부서별 직책 인원수를 가로 열로 피벗',
      },
    ],
    tryModifications: [
      {
        label: '5행 샘플 테이블(emp_sample)에서 부서별 급여 피벗',
        query: `SELECT SUM(CASE WHEN deptno = 10 THEN sal ELSE 0 END) AS dept10_sum, SUM(CASE WHEN deptno = 20 THEN sal ELSE 0 END) AS dept20_sum FROM emp_sample;`,
        guide: '10번 부서 3000원, 20번 부서 12000원이 가로 컬럼으로 출력되는지 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: PIVOT과 UNPIVOT (행-열 변환) > 하위 카테고리: UNPIVOT (열 ➔ 행 변환)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-pivot-2',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 2,
    category: 'PIVOT과 UNPIVOT (행-열 변환)',
    subCategory: 'UNPIVOT (열 ➔ 행 변환)',
    title: '[UNPIVOT 열을 행으로 변환] 가로 컬럼을 세로 데이터로 정규화 (UNION ALL & UNPIVOT)',
    description:
      "**【SQLD 시험 핵심: 가로로 분리된 여러 컬럼을 세로 행 데이터로 정규화】**\n사원 샘플 테이블 `emp_sample`에서 사원의 기본급(`sal`)과 보너스(`comm`) 컬럼을 세로 2개의 행(`급여유형: '기본급'`, `'보너스'`)으로 회전(UNPIVOT)합니다.\n\n1. **표준 `UNION ALL`을 활용한 UNPIVOT 구현**:\n   - 1) `SELECT empno, ename, '기본급' AS pay_type, sal AS amount FROM emp_sample`\n   - `UNION ALL`\n   - 2) `SELECT empno, ename, '보너스' AS pay_type, comm AS amount FROM emp_sample WHERE comm IS NOT NULL`\n2. **Oracle 11g+ `UNPIVOT` 절 문법 (동등 원리)**:\n   - `UNPIVOT (amount FOR pay_type IN (sal AS '기본급', comm AS '보너스'))`\n   - 가로 컬럼을 세로 행으로 변환할 때 `NULL`인 데이터는 자동으로 제외(`EXCLUDE NULLS`)되는 특성을 갖습니다.",
    initialQuery: `SELECT empno,\n       ename,\n       '기본급' AS pay_type,\n       sal AS amount\nFROM emp_sample\nUNION ALL\nSELECT empno,\n       ename,\n       '보너스' AS pay_type,\n       comm AS amount\nFROM emp_sample\nWHERE comm IS NOT NULL\nORDER BY empno, pay_type DESC;`,
    solutionQuery: `SELECT empno, ename, '기본급' AS pay_type, sal AS amount FROM emp_sample UNION ALL SELECT empno, ename, '보너스' AS pay_type, comm AS amount FROM emp_sample WHERE comm IS NOT NULL ORDER BY empno, pay_type DESC`,
    hint: "`SELECT empno, ename, '기본급', sal FROM emp_sample UNION ALL SELECT empno, ename, '보너스', comm FROM emp_sample WHERE comm IS NOT NULL`을 작성하세요.",
    explanation:
      'UNPIVOT은 가로로 나열된 여러 컬럼을 세로 행 데이터로 변환하는 정규화 작업입니다. 표준 SQL에서는 UNION ALL을 결합하여 구현합니다.',
    quickExamples: [
      {
        label: '김철수(101) 사원의 기본급과 보너스 언피벗',
        query: `SELECT ename, '기본급' AS type, sal AS val FROM emp_sample WHERE empno = 101 UNION ALL SELECT ename, '보너스' AS type, comm AS val FROM emp_sample WHERE empno = 101;`,
        description: '1명 사원의 2개 컬럼이 2개의 행으로 분할됨 확인',
      },
    ],
    tryModifications: [
      {
        label: '박민수(103) 사원의 언피벗 데이터 확인',
        query: `SELECT ename, 'SAL' AS item, sal AS amt FROM emp_sample WHERE empno = 103 UNION ALL SELECT ename, 'COMM' AS item, comm AS amt FROM emp_sample WHERE empno = 103;`,
        guide: '기본급 3000원과 보너스 200원이 2행으로 변환되는지 확인해 보세요!',
      },
    ],
  },

  // =========================================================================
  // 대분류: 정규표현식 함수 (Regular Expressions)
  // =========================================================================

  // -------------------------------------------------------------------------
  // 카테고리: 정규표현식 함수 (Regular Expressions) > 하위 카테고리: REGEXP_LIKE (패턴 검색)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-regex-1',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp',
    level: 1,
    category: '정규표현식 함수 (Regular Expressions)',
    subCategory: 'REGEXP_LIKE (패턴 검색)',
    title: '[REGEXP_LIKE] 정규표현식 패턴 매칭 (알파벳 범위 및 연속 글자 검색)',
    description:
      "**【SQLD 시험 및 실무 필수: LIKE 연산자의 한계를 뛰어넘는 REGEXP_LIKE】**\n표준 사원 테이블 `emp`에서 정규표현식을 활용하여 특정 패턴에 부합하는 사원들을 조회합니다.\n\n1. **`REGEXP_LIKE(ename, '^[A-C]')`**:\n   - 이름이 `A`, `B`, `C` 중 하나로 시작하는 사원 검색 (`LIKE 'A%' OR LIKE 'B%' OR LIKE 'C%'`를 정규식 하나로 대체!)\n   - 결과: ALLEN, BLAKE, CLARK\n2. **`REGEXP_LIKE(ename, 'T{2}|L{2}')`**:\n   - 이름에 알파벳 `T`가 2번 연속(`TT`)되거나 `L`이 2번 연속(`LL`)되는 사원 검색\n   - 결과: ALLEN, SCOTT, MILLER",
    initialQuery: `SELECT empno,\n       ename,\n       job,\n       sal\nFROM emp\nWHERE REGEXP_LIKE(ename, '^[A-C]')\nORDER BY ename;`,
    solutionQuery: `SELECT empno, ename, job, sal FROM emp WHERE REGEXP_LIKE(ename, '^[A-C]') ORDER BY ename`,
    hint: "`SELECT empno, ename, job, sal FROM emp WHERE REGEXP_LIKE(ename, '^[A-C]') ORDER BY ename`를 작성하세요.",
    explanation:
      '1. REGEXP_LIKE(str, pattern, [match_param])은 정규표현식 패턴과 일치하는 행을 검색하는 조건 함수입니다.\n2. ^[A-C]는 문자열 시작이 A부터 C 범위의 문자인지 검사합니다.\n3. T{2}|L{2}는 TT 또는 LL이 포함되어 있는지 검사합니다.',
    quickExamples: [
      {
        label: '연속된 동일 알파벳(TT 또는 LL) 사원 검색',
        query: `SELECT ename, job FROM emp WHERE REGEXP_LIKE(ename, 'T{2}|L{2}') ORDER BY ename;`,
        description: 'ALLEN, MILLER, SCOTT 3명 검색 확인',
      },
    ],
    tryModifications: [
      {
        label: 'S로 끝나거나 R로 끝나는 사원 검색',
        query: `SELECT ename, job FROM emp WHERE REGEXP_LIKE(ename, '[SR]$') ORDER BY ename;`,
        guide: 'ADAMS, JONES, JAMES, MILLER, TURNER 등이 검색되는지 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 정규표현식 함수 (Regular Expressions) > 하위 카테고리: REGEXP_SUBSTR (패턴 추출)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-regex-2',
    datasetId: 'sqld_sqlp',
    targetTable: 'dual',
    level: 1,
    category: '정규표현식 함수 (Regular Expressions)',
    subCategory: 'REGEXP_SUBSTR (패턴 추출)',
    title: '[REGEXP_SUBSTR] 정규표현식 부분 문자열 추출 (아이디/도메인 분리 & 단어 추출)',
    description:
      "**【실무 및 시험 최고 빈출: 복잡한 문자열에서 원하는 부분만 쏙 추출】**\n가상 테이블 `dual`을 활용하여 이메일 주소, 코드 문자열, CSV 구분자 문자열에서 원하는 패턴의 텍스트를 추출합니다.\n\n1. **이메일에서 아이디 / 도메인 분리**:\n   - `REGEXP_SUBSTR('hong.gildong@oracle.co.kr', '[^@]+', 1, 1)` ➔ `hong.gildong` (아이디)\n   - `REGEXP_SUBSTR('hong.gildong@oracle.co.kr', '[^@]+', 1, 2)` ➔ `oracle.co.kr` (도메인)\n2. **문자열 내의 숫자만 추출**:\n   - `REGEXP_SUBSTR('ORDER-2024-AUG-98765', '[0-9]+', 1, 1)` ➔ `2024`\n   - `REGEXP_SUBSTR('ORDER-2024-AUG-98765', '[0-9]+', 1, 2)` ➔ `98765`\n3. **쉼표 구분 CSV에서 3번째 항목 추출**:\n   - `REGEXP_SUBSTR('Apple,Banana,Cherry,Date', '[^,]+', 1, 3)` ➔ `Cherry`",
    initialQuery: `SELECT REGEXP_SUBSTR('hong.gildong@oracle.co.kr', '[^@]+', 1, 1) AS user_id,\n       REGEXP_SUBSTR('hong.gildong@oracle.co.kr', '[^@]+', 1, 2) AS domain_name,\n       REGEXP_SUBSTR('ORDER-2024-AUG-98765', '[0-9]+', 1, 1) AS order_year,\n       REGEXP_SUBSTR('ORDER-2024-AUG-98765', '[0-9]+', 1, 2) AS order_seq,\n       REGEXP_SUBSTR('Apple,Banana,Cherry,Date', '[^,]+', 1, 3) AS third_fruit\nFROM dual;`,
    solutionQuery: `SELECT REGEXP_SUBSTR('hong.gildong@oracle.co.kr', '[^@]+', 1, 1) AS user_id, REGEXP_SUBSTR('hong.gildong@oracle.co.kr', '[^@]+', 1, 2) AS domain_name, REGEXP_SUBSTR('ORDER-2024-AUG-98765', '[0-9]+', 1, 1) AS order_year, REGEXP_SUBSTR('ORDER-2024-AUG-98765', '[0-9]+', 1, 2) AS order_seq, REGEXP_SUBSTR('Apple,Banana,Cherry,Date', '[^,]+', 1, 3) AS third_fruit FROM dual`,
    hint: "`SELECT REGEXP_SUBSTR('hong.gildong@oracle.co.kr', '[^@]+', 1, 1) AS user_id ... FROM dual`을 작성하세요.",
    explanation:
      'REGEXP_SUBSTR(str, pattern, position, occurrence)은 패턴과 일치하는 occurrence번째 부분 문자열을 추출합니다. [^@]+는 @를 제외한 1개 이상의 문자를 의미합니다.',
    quickExamples: [
      {
        label: '사원 이름에서 첫 음절 및 끝 음절 추출',
        query: `SELECT ename, REGEXP_SUBSTR(ename, '^.') AS first_char, REGEXP_SUBSTR(ename, '.$') AS last_char FROM emp_sample;`,
        description: '5명 사원 이름의 첫 글자와 마지막 글자 추출',
      },
    ],
    tryModifications: [
      {
        label: 'URL에서 프로토콜(http/https)과 도메인 분리',
        query: `SELECT REGEXP_SUBSTR('https://www.google.com/search', '[^:/]+', 1, 1) AS protocol, REGEXP_SUBSTR('https://www.google.com/search', '[^:/]+', 1, 2) AS host FROM dual;`,
        guide: 'https와 www.google.com이 각각 분리되는지 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 정규표현식 함수 (Regular Expressions) > 하위 카테고리: REGEXP_REPLACE (패턴 치환 & 마스킹)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-regex-3',
    datasetId: 'sqld_sqlp',
    targetTable: 'dual',
    level: 2,
    category: '정규표현식 함수 (Regular Expressions)',
    subCategory: 'REGEXP_REPLACE (패턴 치환 & 마스킹)',
    title: '[REGEXP_REPLACE] 정규표현식 문자열 치환 & 마스킹 (전화번호 포맷 & 숫자 제거)',
    description:
      "**【실무 데이터 정제 & 보안 마스킹 필수 기법: REGEXP_REPLACE】**\n\n1. **전화번호 하이픈 자동 포맷팅 (캡처 그룹 & 백레퍼런스 `\\1-\\2-\\3`)**:\n   - `REGEXP_REPLACE('01012345678', '([0-9]{3})([0-9]{4})([0-9]{4})', '\\1-\\2-\\3')`\n   - 결과: `010-1234-5678`\n2. **개인정보 가운데 자리 마스킹**:\n   - `REGEXP_REPLACE('010-1234-5678', '([0-9]{3})-([0-9]{4})-([0-9]{4})', '\\1-****-\\3')`\n   - 결과: `010-****-5678`\n3. **숫자를 제외한 모든 특수문자/문자 제거 (순수 숫자만 추출)**:\n   - `REGEXP_REPLACE('Price: $1,250.00 (tax: 10%)', '[^0-9]', '')` ➔ `12500010`\n4. **다중 연속 공백을 단일 공백으로 축소**:\n   - `REGEXP_REPLACE('SQL    Developer   2024', '\\s+', ' ')` ➔ `SQL Developer 2024`",
    initialQuery: `SELECT REGEXP_REPLACE('01012345678', '([0-9]{3})([0-9]{4})([0-9]{4})', '\\1-\\2-\\3') AS formatted_phone,\n       REGEXP_REPLACE('010-1234-5678', '([0-9]{3})-([0-9]{4})-([0-9]{4})', '\\1-****-\\3') AS masked_phone,\n       REGEXP_REPLACE('Price: $1,250 (code: #99)', '[^0-9]', '') AS clean_numbers,\n       REGEXP_REPLACE('SQL    Developer   2024', '\\s+', ' ') AS clean_spaces\nFROM dual;`,
    solutionQuery: `SELECT REGEXP_REPLACE('01012345678', '([0-9]{3})([0-9]{4})([0-9]{4})', '\\1-\\2-\\3') AS formatted_phone, REGEXP_REPLACE('010-1234-5678', '([0-9]{3})-([0-9]{4})-([0-9]{4})', '\\1-****-\\3') AS masked_phone, REGEXP_REPLACE('Price: $1,250 (code: #99)', '[^0-9]', '') AS clean_numbers, REGEXP_REPLACE('SQL    Developer   2024', '\\s+', ' ') AS clean_spaces FROM dual`,
    hint: "`SELECT REGEXP_REPLACE('01012345678', '([0-9]{3})([0-9]{4})([0-9]{4})', '\\1-\\2-\\3') ... FROM dual`을 작성하세요.",
    explanation:
      'REGEXP_REPLACE(str, pattern, replace_str)는 정규식 일치 부분을 치환합니다. 괄호 ()로 그룹화한 뒤 \\1, \\2 백레퍼런스로 재조합할 수 있습니다.',
    quickExamples: [
      {
        label: '주민등록번호 뒷자리 마스킹',
        query: `SELECT REGEXP_REPLACE('950101-1234567', '([0-9]{6})-([0-9]{7})', '\\1-*******') AS masked_ssn FROM dual;`,
        description: '950101-******* 마스킹 처리 확인',
      },
    ],
    tryModifications: [
      {
        label: '영문 대문자만 남기고 모두 제거',
        query: `SELECT REGEXP_REPLACE('Oracle SQL Database 19c (2024)', '[^A-Z]', '') AS only_capitals FROM dual;`,
        guide: 'OSD 세 글자만 추출되는지 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: 정규표현식 함수 (Regular Expressions) > 하위 카테고리: REGEXP_INSTR & REGEXP_COUNT (위치 & 빈도)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-regex-4',
    datasetId: 'sqld_sqlp',
    targetTable: 'dual',
    level: 1,
    category: '정규표현식 함수 (Regular Expressions)',
    subCategory: 'REGEXP_INSTR & REGEXP_COUNT (위치 & 빈도)',
    title: '[REGEXP_INSTR & REGEXP_COUNT] 패턴 위치 검색과 출현 횟수 카운트 (구분자 개수 세기)',
    description:
      "**【문자열 분석의 핵심 듀오: 위치를 찾는 INSTR & 개수를 세는 COUNT】**\n\n1. **`REGEXP_INSTR(str, pattern)` (시작 위치 인덱스, 1-based)**:\n   - `REGEXP_INSTR('Product_1234_Rev', '[0-9]+')` ➔ **`9`** (첫 번째 숫자가 시작되는 9번째 자리 반환)\n   - `REGEXP_INSTR('user@domain.co.kr', '\\.[a-zA-Z]+', 1, 2)` ➔ **`15`** (2번째 점(`.kr`)의 위치 반환)\n2. **`REGEXP_COUNT(str, pattern)` (패턴 출현 횟수)**:\n   - `REGEXP_COUNT('Apple,Banana,Cherry,Date,Elderberry', ',')` ➔ **`4`** (구분자 쉼표가 4개 ➔ 총 5개 과일 항목 존재!)\n   - `REGEXP_COUNT('SQL 2023 vs SQL 2024 (SQLD)', 'SQL')` ➔ **`3`**\n   - `REGEXP_COUNT('BANANA', 'A')` ➔ **`3`**",
    initialQuery: `SELECT REGEXP_INSTR('Product_1234_Rev', '[0-9]+') AS first_digit_pos,\n       REGEXP_INSTR('user@domain.co.kr', '\\.[a-zA-Z]+', 1, 2) AS second_dot_pos,\n       REGEXP_COUNT('Apple,Banana,Cherry,Date,Elderberry', ',') AS comma_count,\n       REGEXP_COUNT('SQL 2023 vs SQL 2024 (SQLD)', 'SQL') AS sql_word_count,\n       REGEXP_COUNT('BANANA', 'A') AS a_char_count\nFROM dual;`,
    solutionQuery: `SELECT REGEXP_INSTR('Product_1234_Rev', '[0-9]+') AS first_digit_pos, REGEXP_INSTR('user@domain.co.kr', '\\.[a-zA-Z]+', 1, 2) AS second_dot_pos, REGEXP_COUNT('Apple,Banana,Cherry,Date,Elderberry', ',') AS comma_count, REGEXP_COUNT('SQL 2023 vs SQL 2024 (SQLD)', 'SQL') AS sql_word_count, REGEXP_COUNT('BANANA', 'A') AS a_char_count FROM dual`,
    hint: "`SELECT REGEXP_INSTR('Product_1234_Rev', '[0-9]+') AS first_digit_pos, ... REGEXP_COUNT('BANANA', 'A') AS a_char_count FROM dual`을 작성하세요.",
    explanation:
      '1. REGEXP_INSTR(str, pattern): 패턴이 처음 일치하는 1-based 시작 위치를 반환합니다.\n2. REGEXP_COUNT(str, pattern): 문자열 내에서 패턴과 일치하는 총 출현 횟수를 정수로 반환합니다.',
    quickExamples: [
      {
        label: '사원 이름에서 자음/모음 카운트',
        query: `SELECT ename, REGEXP_COUNT(ename, '[AEIOU]') AS vowel_cnt, REGEXP_COUNT(ename, '[^AEIOU]') AS consonant_cnt FROM emp_sample;`,
        description: '5명 사원 이름의 모음과 자음 개수 분석',
      },
    ],
    tryModifications: [
      {
        label: '문장 내 연속된 공백의 개수 카운트',
        query: `SELECT REGEXP_COUNT('Data   Science   and   SQL   2024', '\\s+') AS space_groups FROM dual;`,
        guide: '공백 묶음이 4개로 계산되는지 확인해 보세요!',
      },
    ],
  },

  // =========================================================================
  // 대분류: DML (데이터 조작어: INSERT, UPDATE, DELETE, MERGE)
  // =========================================================================

  // -------------------------------------------------------------------------
  // 카테고리: DML > 하위 카테고리: INSERT (단일 행/다중 컬럼 삽입 & INSERT SELECT)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-dml-1',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 1,
    category: 'DML (데이터 조작어)',
    subCategory: 'INSERT (행 삽입 & 서브쿼리 삽입)',
    title: '[INSERT] 단일 행 삽입, 다중 컬럼 지정 및 INSERT INTO SELECT',
    description:
      "**【DML 핵심: 새로운 데이터 행을 테이블에 삽입하는 INSERT 문】**\n사원 샘플 테이블 `emp_sample`에 신입 사원 데이터를 삽입하고 결과를 확인합니다.\n\n1. **컬럼 리스트 명시 삽입**:\n   - `INSERT INTO emp_sample (empno, ename, sal, comm, deptno) VALUES (106, '송중기', 4500, 300, 30);`\n2. **컬럼 리스트 생략 시 주의점 (★ SQLD 함정)**:\n   - 컬럼명을 생략하면 테이블 정의 시 선언된 **모든 컬럼의 순서와 타입에 맞춰 빠짐없이 VALUES를 전달**해야 합니다!\n3. **`INSERT INTO ... SELECT` (대량 데이터 복사)**:\n   - `VALUES` 대신 `SELECT` 서브쿼리를 사용하여 다른 테이블의 데이터를 한 번에 대량 삽입",
    initialQuery: `INSERT INTO emp_sample (empno, ename, sal, comm, deptno)\nVALUES (106, '송중기', 4500, 300, 30);\n\nSELECT * FROM emp_sample ORDER BY empno;`,
    solutionQuery: `INSERT INTO emp_sample (empno, ename, sal, comm, deptno) VALUES (106, '송중기', 4500, 300, 30); SELECT * FROM emp_sample ORDER BY empno`,
    hint: "`INSERT INTO emp_sample (empno, ename, sal, comm, deptno) VALUES (106, '송중기', 4500, 300, 30); SELECT * FROM emp_sample;`를 작성하세요.",
    explanation:
      'INSERT INTO 테이블명 (컬럼1, 컬럼2...) VALUES (값1, 값2...) 문법으로 데이터를 삽입하며, 컬럼명을 지정하지 않을 경우 전체 컬럼 순서대로 값을 입력해야 합니다.',
    quickExamples: [
      {
        label: '일부 컬럼만 지정하여 삽입 (comm은 NULL 자동 적용)',
        query: `INSERT INTO emp_sample (empno, ename, sal, deptno) VALUES (107, '한지민', 3500, 10); SELECT * FROM emp_sample ORDER BY empno;`,
        description: '지정되지 않은 comm 컬럼에 NULL이 자동 할당됨 확인',
      },
    ],
    tryModifications: [
      {
        label: '서브쿼리를 이용한 신규 사원 복사 삽입',
        query: `INSERT INTO emp_sample (empno, ename, sal, deptno) SELECT empno, ename, sal, deptno FROM emp WHERE empno = 7839; SELECT * FROM emp_sample;`,
        guide: 'emp 테이블의 KING 사원이 emp_sample에 복사 삽입되는지 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: DML > 하위 카테고리: UPDATE (데이터 수정)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-dml-2',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 1,
    category: 'DML (데이터 조작어)',
    subCategory: 'UPDATE (데이터 수정)',
    title: '[UPDATE] 조건부 데이터 수정 및 연산식 반영',
    description:
      '**【DML 핵심: 기존 레코드의 값을 변경하는 UPDATE 문】**\n사원 샘플 테이블 `emp_sample`에서 10번 부서 사원들의 급여(`sal`)를 10% 인상(`sal * 1.1`)하고, 보너스(`comm`)를 500으로 일괄 수정합니다.\n\n1. **다중 컬럼 수정 문법**: `UPDATE 테이블명 SET 컬럼1 = 값1, 컬럼2 = 값2 WHERE 조건;`\n2. **【SQLD 치명적 주의점: WHERE 절 생략 시 대참사!】**:\n   - `WHERE` 절을 생략하면 테이블의 **모든 행(전체 사원)의 값이 일괄 변경**됩니다!',
    initialQuery: `UPDATE emp_sample\nSET sal = sal * 1.1,\n    comm = NVL(comm, 0) + 500\nWHERE deptno = 10;\n\nSELECT empno, ename, sal, comm, deptno\nFROM emp_sample\nORDER BY empno;`,
    solutionQuery: `UPDATE emp_sample SET sal = sal * 1.1, comm = NVL(comm, 0) + 500 WHERE deptno = 10; SELECT empno, ename, sal, comm, deptno FROM emp_sample ORDER BY empno`,
    hint: '`UPDATE emp_sample SET sal = sal * 1.1, comm = NVL(comm, 0) + 500 WHERE deptno = 10; SELECT * FROM emp_sample;`를 작성하세요.',
    explanation:
      'UPDATE 문은 SET 절에 콤마(,)로 여러 컬럼을 동시에 지정하여 수정할 수 있으며, WHERE 절 조건에 부합하는 행만 수정됩니다.',
    quickExamples: [
      {
        label: '특정 1명(김철수 101)의 부서 이동 UPDATE',
        query: `UPDATE emp_sample SET deptno = 30 WHERE empno = 101; SELECT * FROM emp_sample WHERE empno = 101;`,
        description: '101번 사원의 부서가 30번으로 변경됨 확인',
      },
    ],
    tryModifications: [
      {
        label: '성과급(comm)이 NULL인 사원들에게 기본 100 부여',
        query: `UPDATE emp_sample SET comm = 100 WHERE comm IS NULL; SELECT * FROM emp_sample;`,
        guide: '모든 사원이 보너스를 갖도록 수정해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: DML > 하위 카테고리: DELETE (데이터 삭제)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-dml-3',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 1,
    category: 'DML (데이터 조작어)',
    subCategory: 'DELETE (데이터 삭제)',
    title: '[DELETE] 조건부 데이터 삭제와 DML 특성 (트랜잭션 롤백 가능성)',
    description:
      '**【DML 핵심: 테이블에서 특정 행을 삭제하는 DELETE 문】**\n사원 샘플 테이블 `emp_sample`에서 커미션(`comm`)이 `NULL`인 사원들을 삭제합니다.\n\n1. **삭제 문법**: `DELETE FROM 테이블명 WHERE 조건;`\n2. **【DML DELETE의 3대 특성 (SQLD 필수 암기)】**:\n   - 1) **DML 명령어**이므로 삭제 시 행 단위 Undo/Redo 트랜잭션 로그를 기록함\n   - 2) 잘못 삭제하더라도 `ROLLBACK`으로 **원복(복구) 가능**함\n   - 3) 테이블의 저장 공간(HWM: High Water Mark)과 구조는 그대로 유지됨',
    initialQuery: `DELETE FROM emp_sample\nWHERE comm IS NULL;\n\nSELECT * FROM emp_sample ORDER BY empno;`,
    solutionQuery: `DELETE FROM emp_sample WHERE comm IS NULL; SELECT * FROM emp_sample ORDER BY empno`,
    hint: '`DELETE FROM emp_sample WHERE comm IS NULL; SELECT * FROM emp_sample ORDER BY empno`를 작성하세요.',
    explanation:
      'DELETE FROM 문은 WHERE 조건에 일치하는 레코드들을 삭제하며, DML 작업이므로 트랜잭션 제어(COMMIT/ROLLBACK)의 대상이 됩니다.',
    quickExamples: [
      {
        label: '급여 2000 이하 사원 삭제 실습',
        query: `DELETE FROM emp_sample WHERE sal <= 2000; SELECT * FROM emp_sample;`,
        description: '급여 1000, 2000 사원 2명이 삭제되고 3명만 남음 확인',
      },
    ],
    tryModifications: [
      {
        label: '20번 부서 사원 삭제',
        query: `DELETE FROM emp_sample WHERE deptno = 20; SELECT * FROM emp_sample;`,
        guide: '10번 부서 2명만 남는지 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: DML > 하위 카테고리: MERGE (조건부 INSERT/UPDATE)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-dml-4',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 2,
    category: 'DML (데이터 조작어)',
    subCategory: 'MERGE (조건부 병합 Upsert)',
    title: '[MERGE] 조건에 따른 UPDATE 또는 INSERT 동시 수행 (Upsert)',
    description:
      '**【SQLD 시험 핵심: 테이블을 병합하는 MERGE 문 (Upsert 원리)】**\n타겟 테이블(`emp_sample`)에 신규 데이터 집합을 병합합니다. 기존에 존재하는 사번이면 급여를 `UPDATE`하고, 존재하지 않는 신규 사번이면 `INSERT`합니다.\n\n1. **`MERGE INTO 타겟 USING 소스 ON (조인조건)`**\n2. **`WHEN MATCHED THEN UPDATE SET ...`**: 이미 데이터가 존재할 때 실행\n3. **`WHEN NOT MATCHED THEN INSERT ...`**: 데이터가 존재하지 않을 때 실행\n\n💡 **실무적 가치**: `IF-ELSE` 문 없이 단 하나의 SQL 쿼리로 완벽한 데이터 동기화(Upsert)를 구현합니다.',
    initialQuery: `MERGE INTO emp_sample t\nUSING (\n  SELECT 101 AS empno, '김철수' AS ename, 1800 AS sal, 10 AS deptno\n) s\nON (t.empno = s.empno)\nWHEN MATCHED THEN\n  UPDATE SET t.sal = s.sal\nWHEN NOT MATCHED THEN\n  INSERT (empno, ename, sal, deptno) VALUES (s.empno, s.ename, s.sal, s.deptno);\n\nSELECT * FROM emp_sample ORDER BY empno;`,
    solutionQuery: `MERGE INTO emp_sample t USING (SELECT 101 AS empno, '김철수' AS ename, 1800 AS sal, 10 AS deptno) s ON (t.empno = s.empno) WHEN MATCHED THEN UPDATE SET t.sal = s.sal WHEN NOT MATCHED THEN INSERT (empno, ename, sal, deptno) VALUES (s.empno, s.ename, s.sal, s.deptno); SELECT * FROM emp_sample ORDER BY empno`,
    hint: '`MERGE INTO emp_sample t USING (...) s ON (t.empno = s.empno) WHEN MATCHED THEN ...`를 작성하세요.',
    explanation:
      'MERGE 문은 소스 테이블과 타겟 테이블을 비교하여 조건에 일치하면 UPDATE/DELETE를, 일치하지 않으면 INSERT를 단일 작업으로 수행합니다.',
    quickExamples: [
      {
        label: '신규 사번 108번 MERGE (NOT MATCHED INSERT 실행)',
        query: `MERGE INTO emp_sample t USING (SELECT 108 AS empno, '이도현' AS ename, 4200 AS sal, 20 AS deptno) s ON (t.empno = s.empno) WHEN MATCHED THEN UPDATE SET t.sal = s.sal WHEN NOT MATCHED THEN INSERT (empno, ename, sal, deptno) VALUES (s.empno, s.ename, s.sal, s.deptno); SELECT * FROM emp_sample;`,
        description: '존재하지 않던 108번이 INSERT됨 확인',
      },
    ],
    tryModifications: [
      {
        label: '기존 105번 사원 급여 6000으로 MERGE UPDATE',
        query: `MERGE INTO emp_sample t USING (SELECT 105 AS empno, 6000 AS sal) s ON (t.empno = s.empno) WHEN MATCHED THEN UPDATE SET t.sal = s.sal; SELECT * FROM emp_sample WHERE empno = 105;`,
        guide: '105번 정동원의 급여가 6000으로 갱신되는지 확인해 보세요!',
      },
    ],
  },

  // =========================================================================
  // 대분류: TCL (트랜잭션 제어어: COMMIT, ROLLBACK, SAVEPOINT)
  // =========================================================================

  // -------------------------------------------------------------------------
  // 카테고리: TCL > 하위 카테고리: COMMIT과 ROLLBACK
  // -------------------------------------------------------------------------
  {
    id: 'sqld-tcl-1',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 1,
    category: 'TCL (트랜잭션 제어어)',
    subCategory: 'COMMIT과 ROLLBACK (원자성과 지속성)',
    title: '[COMMIT & ROLLBACK] 트랜잭션의 영구 반영과 원복 취소 (ACID 원칙)',
    description:
      '**【TCL 핵심: 트랜잭션(Transaction)의 논리적 작업 단위를 제어하는 COMMIT과 ROLLBACK】**\n\n1. **`COMMIT` (영구 반영)**:\n   - 트랜잭션 내에서 수행된 모든 `INSERT`, `UPDATE`, `DELETE` 변경사항을 데이터베이스에 **영구적으로 저장**합니다.\n   - `COMMIT` 이후에는 이전 상태로 `ROLLBACK`할 수 없습니다.\n2. **`ROLLBACK` (원복 취소)**:\n   - 트랜잭션 시작 이후 또는 직전 `COMMIT` 이후의 **모든 변경사항을 취소하고 원래 상태로 되돌립니다**.\n   - 락(Lock)이 해제되고 다른 사용자들이 변경 전 원래 데이터를 볼 수 있게 됩니다.\n3. **트랜잭션의 ACID 4대 특성 (SQLD 필수 암기)**:\n   - **Atomicity (원자성)**: All or Nothing (모두 반영되거나 모두 취소됨)\n   - **Consistency (일관성)**: 제약조건 및 규칙 준수\n   - **Isolation (격리성)**: 트랜잭션 간 상호 간섭 차단\n   - **Durability (지속성)**: COMMIT된 데이터는 영구 보존',
    initialQuery: `UPDATE emp_sample\nSET sal = 9999\nWHERE empno = 101;\n\nCOMMIT;\n\nSELECT empno, ename, sal FROM emp_sample WHERE empno = 101;`,
    solutionQuery: `UPDATE emp_sample SET sal = 9999 WHERE empno = 101; COMMIT; SELECT empno, ename, sal FROM emp_sample WHERE empno = 101`,
    hint: '`UPDATE emp_sample ...; COMMIT; SELECT ...`를 작성하세요.',
    explanation:
      '1. COMMIT은 변경된 데이터를 디스크에 영구 반영합니다.\n2. ROLLBACK은 트랜잭션 내의 변경 작업을 취소하고 롤백합니다.',
    quickExamples: [
      {
        label: 'ROLLBACK 명령어 실행 테스트',
        query: `UPDATE emp_sample SET sal = 0; ROLLBACK; SELECT * FROM emp_sample;`,
        description: 'ROLLBACK으로 인해 변경이 취소되는 과정 관찰',
      },
    ],
    tryModifications: [
      {
        label: '사원 추가 후 COMMIT 실습',
        query: `INSERT INTO emp_sample (empno, ename, sal, deptno) VALUES (109, '아이유', 5500, 10); COMMIT; SELECT * FROM emp_sample WHERE empno = 109;`,
        guide: '데이터가 영구 저장되는 흐름을 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: TCL > 하위 카테고리: SAVEPOINT (저장점)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-tcl-2',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 2,
    category: 'TCL (트랜잭션 제어어)',
    subCategory: 'SAVEPOINT (저장점과 부분 롤백)',
    title: '[SAVEPOINT] 중간 저장점 생성과 부분 롤백 (ROLLBACK TO SAVEPOINT)',
    description:
      '**【SQLD 시험 단골: 트랜잭션의 특정 지점으로 부분 취소하는 SAVEPOINT】**\n전체 트랜잭션을 취소하지 않고, 특정 저장점(`SAVEPOINT`)까지만 부분적으로 롤백하는 메커니즘을 실습합니다.\n\n1. **저장점 생성**: `SAVEPOINT sv1;`\n2. **부분 롤백**: `ROLLBACK TO sv1;` (또는 `ROLLBACK TO SAVEPOINT sv1;`)\n3. **실행 시나리오**:\n   - 1) 101번 급여 수정 ➔ `SAVEPOINT sv1;` 생성\n   - 2) 102번 급여 수정 ➔ `SAVEPOINT sv2;` 생성\n   - 3) 103번 급여 수정\n   - 4) **`ROLLBACK TO sv1;`** 실행 ➔ 102번, 103번의 수정은 취소되고, **sv1 이전의 101번 수정 내용만 안전하게 유지**됩니다!',
    initialQuery: `UPDATE emp_sample SET sal = 1500 WHERE empno = 101;\nSAVEPOINT sv1;\n\nUPDATE emp_sample SET sal = 2500 WHERE empno = 102;\nSAVEPOINT sv2;\n\nUPDATE emp_sample SET sal = 3500 WHERE empno = 103;\n\nROLLBACK TO sv1;\n\nCOMMIT;\n\nSELECT empno, ename, sal FROM emp_sample ORDER BY empno;`,
    solutionQuery: `UPDATE emp_sample SET sal = 1500 WHERE empno = 101; SAVEPOINT sv1; UPDATE emp_sample SET sal = 2500 WHERE empno = 102; SAVEPOINT sv2; UPDATE emp_sample SET sal = 3500 WHERE empno = 103; ROLLBACK TO sv1; COMMIT; SELECT empno, ename, sal FROM emp_sample ORDER BY empno`,
    hint: '`SAVEPOINT sv1; ... ROLLBACK TO sv1; COMMIT;`를 작성하세요.',
    explanation:
      'SAVEPOINT는 트랜잭션 내에 체크포인트를 지정하며, ROLLBACK TO SAVEPOINT_NAME을 통해 특정 시점 이후의 작업만 선택적으로 취소할 수 있습니다.',
    quickExamples: [
      {
        label: 'sv2 시점으로 롤백 실습',
        query: `UPDATE emp_sample SET sal = 2200 WHERE empno = 102; SAVEPOINT sv2; UPDATE emp_sample SET sal = 9999 WHERE empno = 103; ROLLBACK TO sv2; COMMIT; SELECT empno, sal FROM emp_sample WHERE empno IN (102, 103);`,
        description: '102번은 2200 유지, 103번은 원래대로 원복 확인',
      },
    ],
    tryModifications: [
      {
        label: 'SAVEPOINT sv1 생성 후 단일 행 롤백',
        query: `SAVEPOINT sv1; DELETE FROM emp_sample WHERE empno = 105; ROLLBACK TO sv1; SELECT * FROM emp_sample;`,
        guide: '105번 삭제가 성공적으로 취소되어 복원되는지 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: TCL > 하위 카테고리: DDL 자동 커밋 함정
  // -------------------------------------------------------------------------
  {
    id: 'sqld-tcl-3',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 2,
    category: 'TCL (트랜잭션 제어어)',
    subCategory: 'DDL 암묵적 자동 커밋 메커니즘',
    title:
      '[DDL 자동 커밋 함정] DDL 실행 시 이전 DML이 자동 COMMIT되는 오라클 메커니즘 (★ SQLD 1순위)',
    description:
      '**【SQLD 시험 최고 빈출 오답 함정: DDL 실행과 암묵적 자동 커밋(Auto-Commit)】**\n\n1. **오라클의 DDL 동작 메커니즘**:\n   - 오라클(Oracle)에서 `CREATE`, `ALTER`, `DROP`, `TRUNCATE` 등의 **DDL 문장이 실행되면 직전에 수행 중이던 모든 DML 트랜잭션이 자동으로 `COMMIT`**됩니다!\n2. **【SQLD 단골 시나리오 퀴즈】**:\n   - `UPDATE emp SET sal = 5000 WHERE empno = 101;` (DML 수행)\n   - `CREATE TABLE temp_log (id INT);` (DDL 수행 ➔ **직전 UPDATE가 자동 영구 커밋됨!**)\n   - `ROLLBACK;` (롤백 시도)\n   - **결과**: `ROLLBACK`을 실행하더라도 101번 사원의 급여 5000은 **취소되지 않고 영구 반영**된 상태로 남습니다!',
    initialQuery: `UPDATE emp_sample SET sal = 7777 WHERE empno = 101;\n\nCREATE TABLE temp_check_tbl (chk_id INT);\n\nROLLBACK;\n\nSELECT empno, ename, sal FROM emp_sample WHERE empno = 101;`,
    solutionQuery: `UPDATE emp_sample SET sal = 7777 WHERE empno = 101; CREATE TABLE temp_check_tbl (chk_id INT); ROLLBACK; SELECT empno, ename, sal FROM emp_sample WHERE empno = 101`,
    hint: 'DDL 실행 시 자동 커밋되는 현상을 확인하는 쿼리를 작성하세요.',
    explanation:
      'Oracle에서는 DDL 문장(CREATE, ALTER, DROP 등) 실행 전후로 암묵적인 COMMIT이 자동 발생하므로, 이전 DML 작업은 ROLLBACK으로 취소할 수 없습니다.',
    quickExamples: [
      {
        label: '임시 테이블 생성 후 롤백 불가 검증',
        query: `DROP TABLE IF EXISTS temp_check_tbl; SELECT 'DDL 실행 완료' AS status FROM dual;`,
        description: 'DDL 실행 확인',
      },
    ],
    tryModifications: [
      {
        label: '사원 급여 5000으로 수정 후 상태 확인',
        query: `SELECT empno, ename, sal FROM emp_sample WHERE empno = 101;`,
        guide: '101번 사원의 급여가 7777로 고정되어 있는지 확인해 보세요!',
      },
    ],
  },

  // =========================================================================
  // 대분류: DDL (데이터 정의어: CREATE, ALTER, DROP, RENAME, TRUNCATE)
  // =========================================================================

  // -------------------------------------------------------------------------
  // 카테고리: DDL > 하위 카테고리: CREATE TABLE과 5대 제약조건
  // -------------------------------------------------------------------------
  {
    id: 'sqld-ddl-1',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 1,
    category: 'DDL (데이터 정의어)',
    subCategory: 'CREATE TABLE과 5대 제약조건',
    title: '[CREATE TABLE] 테이블 생성과 5대 무결성 제약조건 (PK, FK, NOT NULL, UNIQUE, CHECK)',
    description:
      "**【DDL 핵심: 테이블 구조를 생성하고 데이터 무결성 제약조건을 부여하는 CREATE TABLE】**\n\n1. **5대 무결성 제약조건 (SQLD 필수 암기)**:\n   - **`PRIMARY KEY` (기본키)**: `UNIQUE` + `NOT NULL` 결합 (테이블당 1개만 생성 가능, 고유 식별자)\n   - **`FOREIGN KEY` (외래키)**: 참조 무결성 보장 (부모 테이블의 PK/UNIQUE 컬럼 참조)\n   - **`NOT NULL`**: 컬럼에 `NULL` 값 입력 차단\n   - **`UNIQUE`**: 중복 값 차단 (`NULL` 값은 여러 개 입력 가능!)\n   - **`CHECK`**: 값의 범위나 조건 제한 (예: `sal > 0`, `gender IN ('M', 'F')`)\n2. **테이블 생성 실습**: 사원 평가 관리 테이블 `emp_eval`을 생성합니다.",
    initialQuery: `CREATE TABLE emp_eval (\n  eval_id INT PRIMARY KEY,\n  empno INT NOT NULL,\n  eval_year VARCHAR(4) NOT NULL,\n  score INT CHECK (score BETWEEN 0 AND 100),\n  grade VARCHAR(2) DEFAULT 'C'\n);\n\nINSERT INTO emp_eval VALUES (1, 101, '2024', 95, 'A');\nSELECT * FROM emp_eval;`,
    solutionQuery: `CREATE TABLE emp_eval (eval_id INT PRIMARY KEY, empno INT NOT NULL, eval_year VARCHAR(4) NOT NULL, score INT CHECK (score BETWEEN 0 AND 100), grade VARCHAR(2) DEFAULT 'C'); INSERT INTO emp_eval VALUES (1, 101, '2024', 95, 'A'); SELECT * FROM emp_eval`,
    hint: '`CREATE TABLE emp_eval (...)` 문을 작성하세요.',
    explanation:
      'CREATE TABLE은 컬럼명, 데이터 타입, 제약조건(PK, FK, NOT NULL, UNIQUE, CHECK), 기본값(DEFAULT)을 정의하여 테이블을 생성합니다.',
    quickExamples: [
      {
        label: '생성된 테이블 스키마 확인',
        query: `SELECT * FROM emp_eval;`,
        description: '정상 삽입된 평가 데이터 1행 확인',
      },
    ],
    tryModifications: [
      {
        label: 'CHECK 제약조건 범위 내의 2번째 평가 데이터 삽입',
        query: `INSERT INTO emp_eval VALUES (2, 102, '2024', 88, 'B'); SELECT * FROM emp_eval;`,
        guide: '2번째 행이 성공적으로 추가되는지 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: DDL > 하위 카테고리: ALTER TABLE (컬럼 추가/수정/삭제)
  // -------------------------------------------------------------------------
  {
    id: 'sqld-ddl-2',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 2,
    category: 'DDL (데이터 정의어)',
    subCategory: 'ALTER TABLE (컬럼 추가/수정/삭제)',
    title: '[ALTER TABLE] 컬럼 추가(ADD), 컬럼 수정(MODIFY), 컬럼 삭제(DROP)',
    description:
      '**【DDL 핵심: 이미 존재하는 테이블의 구조를 변경하는 ALTER TABLE】**\n\n1. **컬럼 추가 (`ADD`)**:\n   - `ALTER TABLE 테이블명 ADD (컬럼명 타입 [DEFAULT 기본값] [제약조건]);`\n   - 새로 추가된 컬럼의 기존 데이터는 `NULL`(기본값 지정 시 기본값)로 채워짐\n2. **컬럼 수정 (`MODIFY`)**:\n   - `ALTER TABLE 테이블명 MODIFY (컬럼명 변경타입);`\n   - 데이터 크기 확대는 항상 가능하지만, 축소는 기존 데이터 길이에 따라 제한될 수 있음\n3. **컬럼 삭제 (`DROP COLUMN`)**:\n   - `ALTER TABLE 테이블명 DROP COLUMN 컬럼명;`\n   - 테이블에는 **최소 1개 이상의 컬럼이 반드시 존재**해야 하므로 모든 컬럼을 한꺼번에 삭제할 수는 없음!',
    initialQuery: `ALTER TABLE emp_sample ADD (email VARCHAR(50));\n\nUPDATE emp_sample SET email = ename || '@company.com';\n\nSELECT empno, ename, sal, email FROM emp_sample ORDER BY empno;`,
    solutionQuery: `ALTER TABLE emp_sample ADD (email VARCHAR(50)); UPDATE emp_sample SET email = ename || '@company.com'; SELECT empno, ename, sal, email FROM emp_sample ORDER BY empno`,
    hint: '`ALTER TABLE emp_sample ADD (email VARCHAR(50));`를 작성하세요.',
    explanation:
      'ALTER TABLE 문은 ADD(컬럼/제약조건 추가), MODIFY(컬럼 정의 수정), DROP COLUMN(컬럼 삭제), RENAME COLUMN(컬럼명 변경)을 지원합니다.',
    quickExamples: [
      {
        label: '추가된 email 컬럼 확인',
        query: `SELECT empno, ename, email FROM emp_sample;`,
        description: '이메일 주소가 각 사원에게 생성됨 확인',
      },
    ],
    tryModifications: [
      {
        label: '새로운 직급(position) 컬럼 추가 실습',
        query: `ALTER TABLE emp_sample ADD (position VARCHAR(20) DEFAULT '사원'); SELECT empno, ename, position FROM emp_sample;`,
        guide: '기본값 "사원"으로 모든 행에 채워지는지 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: DDL > 하위 카테고리: RENAME과 DROP TABLE
  // -------------------------------------------------------------------------
  {
    id: 'sqld-ddl-3',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 1,
    category: 'DDL (데이터 정의어)',
    subCategory: 'RENAME과 DROP TABLE',
    title: '[RENAME & DROP] 테이블명 변경과 객체 완전 삭제 (CASCADE CONSTRAINTS)',
    description:
      '**【DDL 핵심: 테이블 이름을 바꾸는 RENAME & 객체를 영구 제거하는 DROP】**\n\n1. **테이블명 변경 (`RENAME`)**:\n   - `RENAME old_name TO new_name;` (또는 `ALTER TABLE old_name RENAME TO new_name;`)\n2. **테이블 완전 삭제 (`DROP TABLE`)**:\n   - `DROP TABLE 테이블명;`\n   - 테이블의 **구조(Schema)와 모든 데이터가 데이터베이스에서 영구적으로 삭제**됩니다.\n   - `CASCADE CONSTRAINTS` 옵션: 해당 테이블을 참조하고 있던 다른 자식 테이블의 외래키 제약조건까지 함께 연쇄 삭제합니다.',
    initialQuery: `CREATE TABLE temp_archive_emp AS SELECT * FROM emp_sample;\n\nDROP TABLE IF EXISTS temp_archive_emp;\n\nSELECT '테이블 생성 및 삭제 완료' AS status FROM dual;`,
    solutionQuery: `CREATE TABLE temp_archive_emp AS SELECT * FROM emp_sample; DROP TABLE IF EXISTS temp_archive_emp; SELECT '테이블 생성 및 삭제 완료' AS status FROM dual`,
    hint: '`CREATE TABLE ... DROP TABLE ... SELECT ...`를 작성하세요.',
    explanation:
      '1. RENAME은 데이터베이스 객체의 이름을 변경합니다.\n2. DROP TABLE은 테이블의 구조와 데이터를 영구 삭제하며 DDL이므로 복구되지 않습니다.',
    quickExamples: [
      {
        label: '임시 테이블 생성 후 DROP 실습',
        query: `CREATE TABLE test_drop_tbl (id INT); DROP TABLE test_drop_tbl; SELECT 1 AS done FROM dual;`,
        description: 'DROP TABLE의 정상 실행 확인',
      },
    ],
    tryModifications: [
      {
        label: '듀얼 테이블 상태 조회',
        query: `SELECT '정상 작동' AS msg FROM dual;`,
        guide: '간단한 메시지 조회를 실행해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: DDL > 하위 카테고리: TRUNCATE vs DELETE
  // -------------------------------------------------------------------------
  {
    id: 'sqld-ddl-4',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 2,
    category: 'DDL (데이터 정의어)',
    subCategory: 'TRUNCATE vs DELETE (초기화 vs 삭제)',
    title:
      '[TRUNCATE vs DELETE] 데이터 초기화의 결정적 차이 (로그, 속도, 롤백, DDL vs DML ★ SQLD 최고 빈출)',
    description:
      '**【SQLD 시험 100% 출제 보장: TRUNCATE TABLE vs DELETE FROM 비교 총정리】**\n\n| 비교 항목 | **`DELETE FROM 테이블명`** | **`TRUNCATE TABLE 테이블명`** |\n| :--- | :--- | :--- |\n| **명령어 분류** | **DML** (데이터 조작어) | **DDL** (데이터 정의어) |\n| **삭제 방식** | 행(Row) 단위 삭제 | 테이블 전체 최초 생성 상태로 초기화 |\n| **Undo 로그** | 행마다 상세 로그 기록 (느림) | 최소한의 시스템 로그만 기록 (**초고속 ⚡**) |\n| **`ROLLBACK` 가능 여부** | **⭕ 롤백 가능 (복구 됨)** | **❌ 롤백 절대 불가 (복구 안 됨!)** |\n| **자동 커밋** | 없음 (명시적 COMMIT 필요) | **⭕ 실행 즉시 Auto-Commit 발생** |\n| **저장공간(HWM)** | 기존 할당 공간 유지 | **초기 할당 크기로 공간 반환(초기화)** |',
    initialQuery: `CREATE TABLE emp_temp_trunc AS SELECT * FROM emp_sample;\n\nTRUNCATE TABLE emp_temp_trunc;\n\nSELECT COUNT(*) AS remaining_rows FROM emp_temp_trunc;`,
    solutionQuery: `CREATE TABLE emp_temp_trunc AS SELECT * FROM emp_sample; TRUNCATE TABLE emp_temp_trunc; SELECT COUNT(*) AS remaining_rows FROM emp_temp_trunc`,
    hint: '`TRUNCATE TABLE emp_temp_trunc; SELECT COUNT(*) FROM emp_temp_trunc;`를 작성하세요.',
    explanation:
      'TRUNCATE는 DDL 명령어로 테이블 구조는 유지한 채 모든 데이터를 즉시 삭제하고 저장공간을 반환하며, Undo 로그를 남기지 않아 ROLLBACK이 불가능합니다.',
    quickExamples: [
      {
        label: '0건 초기화 상태 확인',
        query: `SELECT * FROM emp_temp_trunc;`,
        description: '테이블 구조는 남아있고 데이터만 0건인 상태 확인',
      },
    ],
    tryModifications: [
      {
        label: '테스트용 임시 테이블 정리 DROP',
        query: `DROP TABLE IF EXISTS emp_temp_trunc; SELECT '정리 완료' AS res FROM dual;`,
        guide: '테스트 테이블을 안전하게 삭제해 보세요!',
      },
    ],
  },

  // =========================================================================
  // 대분류: DCL (데이터 제어어: CREATE USER, DROP USER, GRANT, REVOKE)
  // =========================================================================

  // -------------------------------------------------------------------------
  // 카테고리: DCL > 하위 카테고리: CREATE USER와 DROP USER
  // -------------------------------------------------------------------------
  {
    id: 'sqld-dcl-1',
    datasetId: 'sqld_sqlp',
    targetTable: 'dual',
    level: 1,
    category: 'DCL (데이터 제어어)',
    subCategory: 'USER 관리 (CREATE USER / DROP USER)',
    title: '[CREATE USER / DROP USER] 사용자 계정 생성, 비밀번호 설정, 계정 삭제',
    description:
      '**【DCL 핵심: 데이터베이스 사용자 계정을 생성하고 관리하는 계정 관리 명령어】**\n\n1. **사용자 생성 (`CREATE USER`)**:\n   - `CREATE USER scott IDENTIFIED BY tiger;`\n   - `scott`이라는 사용자 계정을 생성하고 초기 비밀번호를 `tiger`로 설정합니다.\n   - 계정 생성 직후에는 아무런 권한이 없으므로 데이터베이스 접속조차 불가능합니다.\n2. **비밀번호 변경 (`ALTER USER`)**:\n   - `ALTER USER scott IDENTIFIED BY new_password;`\n3. **사용자 삭제 (`DROP USER`)**:\n   - `DROP USER scott;` (사용자 계정 삭제)\n   - `DROP USER scott CASCADE;`: 사용자가 생성한 모든 테이블, 뷰 등 스키마 객체들을 연쇄적으로 함께 삭제',
    initialQuery: `CREATE USER scott IDENTIFIED BY tiger;\n\nALTER USER scott IDENTIFIED BY lion;\n\nDROP USER scott CASCADE;`,
    solutionQuery: `CREATE USER scott IDENTIFIED BY tiger; ALTER USER scott IDENTIFIED BY lion; DROP USER scott CASCADE`,
    hint: '`CREATE USER scott IDENTIFIED BY tiger; ... DROP USER scott CASCADE;`를 작성하세요.',
    explanation:
      'CREATE USER는 신규 사용자를 생성하고, DROP USER CASCADE는 해당 사용자의 모든 스키마 객체까지 일괄 삭제합니다.',
    quickExamples: [
      {
        label: '신규 사용자 test_user 생성 및 삭제 실습',
        query: `CREATE USER test_user IDENTIFIED BY pass1234; DROP USER test_user;`,
        description: '계정 생성 및 삭제 DCL 명령어 실행',
      },
    ],
    tryModifications: [
      {
        label: 'DCL 사용자 상태 메시지 확인',
        query: `SELECT 'DCL 계정 관리 명령어 정상 반영' AS result FROM dual;`,
        guide: '실행 결과를 확인해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: DCL > 하위 카테고리: GRANT와 REVOKE
  // -------------------------------------------------------------------------
  {
    id: 'sqld-dcl-2',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 1,
    category: 'DCL (데이터 제어어)',
    subCategory: '권한 관리 (GRANT & REVOKE)',
    title: '[GRANT & REVOKE] 시스템 권한 및 객체 권한 부여와 회수',
    description:
      '**【DCL 핵심: 사용자에게 데이터베이스 접근 및 객체 조작 권한을 부여하고 회수】**\n\n1. **시스템 권한 (System Privileges)**: 데이터베이스 전체에 영향을 주는 권한\n   - `CREATE SESSION`: 데이터베이스 접속 권한 (가장 필수적인 기본 권한!)\n   - `CREATE TABLE`, `CREATE VIEW`, `CREATE SEQUENCE` 등\n   - 문법: `GRANT CREATE SESSION, CREATE TABLE TO scott;`\n2. **객체 권한 (Object Privileges)**: 특정 테이블, 뷰 등에 대한 접근 권한\n   - `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `ALTER`, `REFERENCES` 등\n   - 문법: `GRANT SELECT, INSERT ON emp_sample TO scott;`\n3. **권한 회수 (`REVOKE`)**:\n   - `REVOKE INSERT ON emp_sample FROM scott;`',
    initialQuery: `GRANT CREATE SESSION, CREATE TABLE TO scott;\n\nGRANT SELECT, INSERT ON emp_sample TO scott;\n\nREVOKE INSERT ON emp_sample FROM scott;`,
    solutionQuery: `GRANT CREATE SESSION, CREATE TABLE TO scott; GRANT SELECT, INSERT ON emp_sample TO scott; REVOKE INSERT ON emp_sample FROM scott`,
    hint: '`GRANT CREATE SESSION ... GRANT SELECT ... REVOKE INSERT ...`를 작성하세요.',
    explanation:
      '1. GRANT는 시스템 권한 또는 객체 권한을 사용자나 롤(Role)에게 부여합니다.\n2. REVOKE는 부여된 권한을 회수합니다.',
    quickExamples: [
      {
        label: '모든 객체 권한 일괄 부여 (ALL PRIVILEGES)',
        query: `GRANT ALL PRIVILEGES ON emp_sample TO scott; REVOKE ALL PRIVILEGES ON emp_sample FROM scott;`,
        description: '전체 권한 부여 및 일괄 회수 실습',
      },
    ],
    tryModifications: [
      {
        label: 'SELECT 권한만 부여',
        query: `GRANT SELECT ON emp_sample TO public_user;`,
        guide: '조회 전용 권한 부여 명령을 실행해 보세요!',
      },
    ],
  },

  // -------------------------------------------------------------------------
  // 카테고리: DCL > 하위 카테고리: WITH GRANT OPTION vs WITH ADMIN OPTION
  // -------------------------------------------------------------------------
  {
    id: 'sqld-dcl-3',
    datasetId: 'sqld_sqlp',
    targetTable: 'emp_sample',
    level: 2,
    category: 'DCL (데이터 제어어)',
    subCategory: '권한 전파 옵션 (WITH GRANT vs WITH ADMIN)',
    title: '[권한 전파 옵션] WITH GRANT OPTION vs WITH ADMIN OPTION (연쇄 회수 차이점 ★ SQLD 킬러)',
    description:
      '**【SQLD 시험 최고 난이도 킬러: 권한 전파 및 REVOKE 시 연쇄 회수(Cascade) 차이점】**\n\n1. **`WITH GRANT OPTION` (객체 권한 전파용)**:\n   - 권한을 부여받은 사용자가 **다른 제3의 사용자에게도 해당 객체 권한을 부여할 수 있도록 허용**함\n   - **【연쇄 회수 발생 ⭕】**: $A \\rightarrow B \\rightarrow C$ 순서로 권한이 전파되었을 때, $A$가 $B$의 권한을 `REVOKE`하면 **$C$의 권한까지 연쇄적으로 함께 박탈(Cascade Revoke)됨!**\n2. **`WITH ADMIN OPTION` (시스템 권한 및 롤 전파용)**:\n   - 시스템 권한이나 롤을 다른 사용자에게 부여할 수 있는 관리자 권한 부여\n   - **【연쇄 회수 발생 안 함 ❌】**: $A \\rightarrow B \\rightarrow C$ 순서로 권한이 부여되었을 때, $A$가 $B$의 시스템 권한을 `REVOKE`하더라도 **$C$가 부여받은 권한은 그대로 안전하게 유지됨!**',
    initialQuery: `GRANT SELECT ON emp_sample TO user_b WITH GRANT OPTION;\n\nGRANT CREATE TABLE TO user_b WITH ADMIN OPTION;\n\nREVOKE SELECT ON emp_sample FROM user_b;`,
    solutionQuery: `GRANT SELECT ON emp_sample TO user_b WITH GRANT OPTION; GRANT CREATE TABLE TO user_b WITH ADMIN OPTION; REVOKE SELECT ON emp_sample FROM user_b`,
    hint: '`GRANT SELECT ON emp_sample TO user_b WITH GRANT OPTION; ...`를 작성하세요.',
    explanation:
      '1. WITH GRANT OPTION(객체 권한)은 권한 회수 시 하위 사용자에게 부여된 권한도 연쇄적으로 회수됩니다.\n2. WITH ADMIN OPTION(시스템 권한)은 권한 회수 시 하위 사용자에게 전파된 권한은 유지됩니다.',
    quickExamples: [
      {
        label: 'WITH GRANT OPTION 부여 및 회수 실습',
        query: `GRANT SELECT, UPDATE ON emp_sample TO manager_role WITH GRANT OPTION; REVOKE SELECT, UPDATE ON emp_sample FROM manager_role;`,
        description: '객체 권한 전파 옵션 부여 및 회수',
      },
    ],
    tryModifications: [
      {
        label: '시스템 권한에 WITH ADMIN OPTION 적용',
        query: `GRANT CREATE SESSION, CREATE VIEW TO developer_role WITH ADMIN OPTION;`,
        guide: '시스템 권한 관리자 옵션 부여를 실행해 보세요!',
      },
    ],
  },
];
