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
];
