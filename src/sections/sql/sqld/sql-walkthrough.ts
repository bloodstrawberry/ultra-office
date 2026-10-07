export interface SqlWalkthroughStep {
  title: string;
  summary: string;
  details: string[];
  start: number;
  end: number;
  level: number;
}

interface WordToken {
  word: string;
  start: number;
  end: number;
  depth: number;
}

interface ParenthesisPair {
  start: number;
  end: number;
  depth: number;
}

interface SqlScan {
  words: WordToken[];
  pairs: ParenthesisPair[];
  commas: number[];
  semicolons: number[];
}

interface Clause {
  kind: string;
  start: number;
  end: number;
}

const JOIN_MODIFIERS = new Set(['INNER', 'LEFT', 'RIGHT', 'FULL', 'CROSS', 'NATURAL']);

function scanSql(sql: string): SqlScan {
  const words: WordToken[] = [];
  const pairs: ParenthesisPair[] = [];
  const commas: number[] = [];
  const semicolons: number[] = [];
  const openings: { start: number; depth: number }[] = [];
  let depth = 0;

  for (let index = 0; index < sql.length; ) {
    const char = sql[index];
    const next = sql[index + 1];

    if (char === '-' && next === '-') {
      index = sql.indexOf('\n', index + 2);
      if (index < 0) break;
      continue;
    }
    if (char === '/' && next === '*') {
      const close = sql.indexOf('*/', index + 2);
      if (close < 0) break;
      index = close + 2;
      continue;
    }
    if (char === "'" || char === '"' || char === '`' || char === '[') {
      const closing = char === '[' ? ']' : char;
      index += 1;
      while (index < sql.length) {
        if (sql[index] === '\\' && index + 1 < sql.length) {
          index += 2;
        } else if (sql[index] === closing) {
          if (sql[index + 1] === closing) {
            index += 2;
          } else {
            index += 1;
            break;
          }
        } else {
          index += 1;
        }
      }
      continue;
    }
    if (char === '(') {
      openings.push({ start: index, depth });
      depth += 1;
      index += 1;
      continue;
    }
    if (char === ')') {
      depth = Math.max(0, depth - 1);
      const opening = openings.pop();
      if (opening) pairs.push({ start: opening.start, end: index + 1, depth: opening.depth });
      index += 1;
      continue;
    }
    if (char === ',' && depth === 0) commas.push(index);
    if (char === ';' && depth === 0) semicolons.push(index);

    if (/[\p{L}_]/u.test(char)) {
      const start = index;
      index += 1;
      while (index < sql.length && /[\p{L}\p{N}_$]/u.test(sql[index])) index += 1;
      words.push({ word: sql.slice(start, index).toUpperCase(), start, end: index, depth });
      continue;
    }
    index += 1;
  }

  return { words, pairs, commas, semicolons };
}

function makeStep(
  sql: string,
  offset: number,
  start: number,
  end: number,
  level: number,
  title: string,
  summary: string,
  details: string[]
): SqlWalkthroughStep {
  while (start < end && /\s/.test(sql[start])) start += 1;
  while (end > start && /\s/.test(sql[end - 1])) end -= 1;
  return { title, summary, details, start: offset + start, end: offset + end, level };
}

function splitExpressions(sql: string): string[] {
  const { commas } = scanSql(sql);
  const boundaries = [0, ...commas.map((index) => index + 1), sql.length + 1];
  return boundaries
    .slice(0, -1)
    .map((start, index) => sql.slice(start, commas[index] ?? sql.length).trim())
    .filter(Boolean);
}

function describeExpression(expression: string): string {
  if (/\bOVER\s*\(/i.test(expression)) return '행을 합치지 않고 구간·순위 등을 계산합니다.';
  if (/\bCASE\b/i.test(expression)) return '조건에 따라 반환할 값을 고릅니다.';
  if (/\b(COUNT|SUM|AVG|MIN|MAX)\s*\(/i.test(expression)) return '여러 행의 값을 집계합니다.';
  if (/\bAS\s+[\p{L}_][\p{L}\p{N}_$]*\s*$/iu.test(expression)) {
    return '계산한 값에 결과 열 이름을 붙입니다.';
  }
  return '이 값을 결과의 한 열로 출력합니다.';
}

function joinStart(words: WordToken[], index: number): number {
  let cursor = index - 1;
  if (words[cursor]?.word === 'OUTER') cursor -= 1;
  if (JOIN_MODIFIERS.has(words[cursor]?.word ?? '')) cursor -= 1;
  if (words[cursor]?.word === 'NATURAL') cursor -= 1;
  return words[cursor + 1]?.start ?? words[index].start;
}

function collectSelectClauses(sql: string, words: WordToken[], selectStart: number): Clause[] {
  const top = words.filter((token) => token.depth === 0 && token.start >= selectStart);
  const boundaries: { kind: string; start: number }[] = [];

  top.forEach((token, index) => {
    const next = top[index + 1];
    if (token.start === selectStart && token.word === 'SELECT') {
      boundaries.push({ kind: 'SELECT', start: token.start });
    } else if (token.word === 'JOIN') {
      boundaries.push({ kind: 'JOIN', start: joinStart(top, index) });
    } else if (token.word === 'GROUP' && next?.word === 'BY') {
      boundaries.push({ kind: 'GROUP BY', start: token.start });
    } else if (token.word === 'ORDER' && next?.word === 'BY') {
      boundaries.push({ kind: 'ORDER BY', start: token.start });
    } else if (
      ['FROM', 'WHERE', 'HAVING', 'WINDOW', 'QUALIFY', 'LIMIT', 'OFFSET', 'FETCH'].includes(
        token.word
      )
    ) {
      boundaries.push({ kind: token.word, start: token.start });
    }
  });

  boundaries.sort((left, right) => left.start - right.start);
  return boundaries.map((boundary, index) => ({
    ...boundary,
    end: boundaries[index + 1]?.start ?? sql.length,
  }));
}

function selectSteps(sql: string, offset: number, level: number): SqlWalkthroughStep[] {
  const scan = scanSql(sql);
  const top = scan.words.filter((token) => token.depth === 0);
  const mainSelect = top.find((token) => token.word === 'SELECT');
  if (!mainSelect) return [];

  const steps: SqlWalkthroughStep[] = [];
  const clauses = collectSelectClauses(sql, scan.words, mainSelect.start);
  const addSubqueries = (start: number, end: number, context: string) => {
    scan.pairs
      .filter((pair) => pair.depth === 0 && pair.start >= start && pair.end <= end)
      .sort((left, right) => left.start - right.start)
      .forEach((pair) => {
        const inner = sql.slice(pair.start + 1, pair.end - 1);
        if (!/^\s*(SELECT|WITH)\b/i.test(inner)) return;
        steps.push(
          makeStep(
            sql,
            offset,
            pair.start,
            pair.end,
            level + 1,
            '내부 SELECT',
            `${context} 안에 있는 별도 조회를 살펴봅니다.`,
            [
              '서브쿼리는 바깥 쿼리에 값이나 행 집합을 제공합니다.',
              '바깥 행을 참조하는 상관 서브쿼리라면 행마다 평가될 수 있습니다.',
            ]
          )
        );
        if (level < 2) steps.push(...statementSteps(inner, offset + pair.start + 1, level + 1));
      });
  };

  const withToken = top.find((token) => token.word === 'WITH' && token.start < mainSelect.start);
  if (withToken) {
    steps.push(
      makeStep(
        sql,
        offset,
        withToken.start,
        mainSelect.start,
        level,
        'WITH · 이름 붙인 중간 결과',
        '공통 테이블 식(CTE)을 정의하고 아래 쿼리에서 이름으로 참조합니다.',
        [
          '복잡한 조회를 작은 쿼리로 나누어 읽기 쉽게 만듭니다.',
          'CTE가 실제로 저장되는지는 데이터베이스의 최적화 방식에 따라 달라집니다.',
        ]
      )
    );
    addSubqueries(withToken.start, mainSelect.start, 'WITH 절');
  }

  const addClause = (clause: Clause) => {
    const segment = sql.slice(clause.start, clause.end).trim();
    const body = segment
      .replace(new RegExp(`^${clause.kind.replace(' ', '\\s+')}\\b`, 'i'), '')
      .trim();
    let title = clause.kind;
    let summary = '';
    let details: string[] = [];

    switch (clause.kind) {
      case 'FROM':
        title = 'FROM · 데이터 원본';
        summary = '조회할 테이블, 뷰 또는 중간 결과를 정합니다.';
        details = [`원본: ${body}`, '이 단계에서 가져온 행이 이후 필터와 계산의 출발점입니다.'];
        break;
      case 'JOIN': {
        const type =
          /^(LEFT|RIGHT|FULL|INNER|CROSS|NATURAL)/i.exec(segment)?.[1]?.toUpperCase() || 'INNER';
        title = `${type} JOIN · 행 연결`;
        summary = '두 데이터 원본의 행을 조인 조건에 따라 연결합니다.';
        details = [
          type === 'LEFT'
            ? '왼쪽 원본의 행은 일치하는 오른쪽 행이 없어도 남고, 오른쪽 값은 NULL이 됩니다.'
            : type === 'RIGHT'
              ? '오른쪽 원본의 행은 일치하는 왼쪽 행이 없어도 남습니다.'
              : type === 'FULL'
                ? '양쪽 원본의 일치하지 않는 행도 모두 남습니다.'
                : type === 'CROSS'
                  ? '두 원본의 가능한 행 조합을 모두 만듭니다.'
                  : '조인 조건에 맞는 행을 연결합니다.',
          /\bON\b|\bUSING\b/i.test(segment)
            ? 'ON 또는 USING 뒤의 조건이 어떤 행끼리 결합되는지 결정합니다.'
            : '명시적인 ON 조건이 없는 조인은 결과 행 수가 크게 늘 수 있습니다.',
        ];
        break;
      }
      case 'WHERE':
        title = 'WHERE · 개별 행 걸러내기';
        summary = '그룹을 만들기 전에 각 행이 조건을 만족하는지 검사합니다.';
        details = [
          `조건: ${body}`,
          '참(TRUE)인 행만 다음 단계로 전달됩니다. 거짓(FALSE)이나 알 수 없음(UNKNOWN)은 제외됩니다.',
          /\bAND\b|\bOR\b/i.test(body)
            ? 'AND가 OR보다 먼저 평가됩니다. 괄호가 있으면 괄호 안의 조건을 먼저 계산합니다.'
            : '이 조건은 집계 결과가 아니라 원본의 개별 행에 적용됩니다.',
        ];
        break;
      case 'GROUP BY':
        title = 'GROUP BY · 같은 값 묶기';
        summary = '지정한 기준 값이 같은 행을 한 그룹으로 모읍니다.';
        details = [
          `묶는 기준: ${body}`,
          'COUNT, SUM, AVG 같은 집계 함수는 그룹마다 값을 계산합니다.',
        ];
        break;
      case 'HAVING':
        title = 'HAVING · 그룹 걸러내기';
        summary = '그룹과 집계 결과를 기준으로 남길 그룹을 고릅니다.';
        details = [
          `조건: ${body}`,
          'WHERE는 그룹 전의 행을, HAVING은 그룹 후의 결과를 걸러냅니다.',
        ];
        break;
      case 'SELECT': {
        title = 'SELECT · 결과 열 계산';
        summary = '남은 행 또는 그룹에서 출력할 식을 계산하고 열 이름을 정합니다.';
        const expressions = splitExpressions(body.replace(/^(DISTINCT|ALL)\b/i, '').trim());
        details = expressions.map(
          (expression, index) =>
            `출력식 ${index + 1}: ${expression} — ${describeExpression(expression)}`
        );
        if (details.length === 0) details = ['SELECT 뒤에 출력할 열이나 계산식을 적습니다.'];
        break;
      }
      case 'WINDOW':
        title = 'WINDOW · 분석 범위 정의';
        summary = '여러 윈도우 함수가 공유할 행 분할·정렬 규칙에 이름을 붙입니다.';
        details = ['PARTITION BY는 계산 그룹을 나누고 ORDER BY는 그룹 안의 순서를 정합니다.'];
        break;
      case 'QUALIFY':
        title = 'QUALIFY · 윈도우 결과 걸러내기';
        summary = '윈도우 함수의 계산 결과를 기준으로 행을 걸러냅니다.';
        details = [`조건: ${body}`, '지원 여부와 세부 동작은 데이터베이스 제품에 따라 다릅니다.'];
        break;
      case 'ORDER BY':
        title = 'ORDER BY · 결과 정렬';
        summary = '출력할 행을 지정한 열이나 식의 순서로 정렬합니다.';
        details = [
          `정렬 기준: ${body}`,
          'ASC는 오름차순, DESC는 내림차순입니다. 명시하지 않으면 보통 ASC입니다.',
        ];
        break;
      case 'LIMIT':
      case 'OFFSET':
      case 'FETCH':
        title = `${clause.kind} · 결과 범위`;
        summary = '정렬된 결과에서 건너뛰거나 반환할 행 수를 제한합니다.';
        details = [
          `범위 지정: ${segment}`,
          '일관된 페이지 결과가 필요하면 먼저 ORDER BY로 정렬 기준을 명시하세요.',
        ];
        break;
      default:
        return;
    }

    steps.push(makeStep(sql, offset, clause.start, clause.end, level, title, summary, details));
    addSubqueries(clause.start, clause.end, clause.kind);

    if (clause.kind === 'SELECT') {
      const distinct = scan.words.find(
        (token) =>
          token.word === 'DISTINCT' &&
          token.depth === 0 &&
          token.start > clause.start &&
          token.end < clause.end
      );
      if (distinct) {
        steps.push(
          makeStep(
            sql,
            offset,
            distinct.start,
            distinct.end,
            level,
            'DISTINCT · 중복 제거',
            'SELECT로 만든 결과에서 같은 행의 중복을 제거합니다.',
            ['선택한 모든 출력 열의 값이 같을 때 같은 행으로 취급합니다.']
          )
        );
      }
      scan.words
        .filter(
          (token) => token.word === 'OVER' && token.start > clause.start && token.start < clause.end
        )
        .forEach((token) => {
          const pair = scan.pairs.find(
            (item) => item.start > token.end && /^\s*$/.test(sql.slice(token.end, item.start))
          );
          if (!pair) return;
          steps.push(
            makeStep(
              sql,
              offset,
              token.start,
              pair.end,
              level,
              'OVER · 행별 분석',
              '윈도우 함수가 각 행에 대해 어느 범위의 행을 볼지 정합니다.',
              [
                'PARTITION BY는 행을 계산 그룹으로 나누고 ORDER BY는 그룹 안의 순서를 정합니다.',
                'GROUP BY와 달리 원래 행을 하나로 합치지 않고 결과를 각 행에 붙입니다.',
              ]
            )
          );
        });
    }
  };

  const order = [
    'FROM',
    'JOIN',
    'WHERE',
    'GROUP BY',
    'HAVING',
    'SELECT',
    'WINDOW',
    'QUALIFY',
    'ORDER BY',
    'LIMIT',
    'OFFSET',
    'FETCH',
  ];
  order.forEach((kind) => clauses.filter((clause) => clause.kind === kind).forEach(addClause));
  return steps;
}

function statementSteps(sql: string, offset: number, level: number): SqlWalkthroughStep[] {
  const scan = scanSql(sql);
  const top = scan.words.filter((token) => token.depth === 0);
  const first = top[0];
  if (!first) return [];

  if (first.word === 'SELECT' || first.word === 'WITH') {
    const setOperators = top.filter((token) =>
      ['UNION', 'INTERSECT', 'EXCEPT', 'MINUS'].includes(token.word)
    );
    if (setOperators.length > 0) {
      const steps: SqlWalkthroughStep[] = [];
      steps.push(...selectSteps(sql.slice(0, setOperators[0].start), offset, level));
      setOperators.forEach((operator, index) => {
        const allToken = top.find(
          (token) =>
            token.word === 'ALL' &&
            token.start >= operator.end &&
            /^\s*$/.test(sql.slice(operator.end, token.start))
        );
        const branchStart = allToken?.end ?? operator.end;
        const next = setOperators[index + 1]?.start ?? sql.length;
        steps.push(...selectSteps(sql.slice(branchStart, next), offset + branchStart, level));
        steps.push(
          makeStep(
            sql,
            offset,
            operator.start,
            branchStart,
            level,
            `${operator.word} · 결과 합치기`,
            '앞뒤 SELECT의 결과 집합을 결합합니다.',
            [
              operator.word === 'UNION'
                ? allToken
                  ? 'UNION ALL은 중복 행을 그대로 남깁니다.'
                  : 'UNION은 중복 행을 제거합니다.'
                : operator.word === 'INTERSECT'
                  ? '양쪽 결과에 모두 있는 행을 남깁니다.'
                  : '앞 결과에서 뒤 결과와 겹치는 행을 제외합니다.',
              '양쪽 SELECT의 출력 열 수와 대응되는 데이터 타입이 맞아야 합니다.',
            ]
          )
        );
      });
      return steps;
    }
    return selectSteps(sql, offset, level);
  }

  const steps: SqlWalkthroughStep[] = [];
  const add = (start: number, end: number, title: string, summary: string, details: string[]) => {
    steps.push(makeStep(sql, offset, start, end, level, title, summary, details));
  };
  const find = (word: string) => top.find((token) => token.word === word)?.start;
  const where = find('WHERE');

  if (first.word === 'UPDATE') {
    const set = find('SET');
    add(0, set ?? sql.length, 'UPDATE · 대상 테이블', '값을 바꿀 테이블을 정합니다.', [
      '기존 행을 수정하는 DML 문장입니다.',
    ]);
    if (where !== undefined) {
      add(where, sql.length, 'WHERE · 수정할 행 선택', '조건에 맞는 행만 수정 대상으로 고릅니다.', [
        'WHERE를 생략하면 모든 행이 수정 대상이 됩니다.',
      ]);
    }
    if (set !== undefined) {
      add(set, where ?? sql.length, 'SET · 새 값 계산', '대상 행의 각 열에 넣을 값을 계산합니다.', [
        'SET 오른쪽 식은 원래 행의 열 값을 참조할 수 있습니다.',
      ]);
    }
    return steps;
  }

  if (first.word === 'DELETE') {
    add(
      0,
      where ?? sql.length,
      'DELETE · 대상 테이블',
      '삭제할 행이 들어 있는 테이블을 정합니다.',
      ['DELETE는 행을 삭제하는 DML 문장입니다.']
    );
    if (where !== undefined) {
      add(where, sql.length, 'WHERE · 삭제할 행 선택', '조건에 맞는 행만 삭제합니다.', [
        'WHERE를 생략하면 테이블의 모든 행이 삭제 대상이 됩니다.',
      ]);
    }
    return steps;
  }

  if (first.word === 'INSERT') {
    const source = top.find((token) => token.word === 'VALUES' || token.word === 'SELECT');
    add(
      0,
      source?.start ?? sql.length,
      'INSERT · 대상과 열',
      '새 행을 추가할 테이블과 열을 정합니다.',
      ['열 목록을 적었다면 값도 같은 순서와 개수로 대응해야 합니다.']
    );
    if (source) {
      add(
        source.start,
        sql.length,
        source.word === 'VALUES' ? 'VALUES · 추가할 값' : 'SELECT · 추가할 행',
        source.word === 'VALUES'
          ? '각 열에 넣을 값을 지정합니다.'
          : '조회 결과의 행을 대상 테이블에 추가합니다.',
        [
          source.word === 'VALUES'
            ? '괄호로 묶인 값들이 한 행을 구성합니다.'
            : 'SELECT 결과의 열 순서와 타입이 INSERT 대상 열과 맞아야 합니다.',
        ]
      );
      if (source.word === 'SELECT') {
        steps.push(...selectSteps(sql.slice(source.start), offset + source.start, level + 1));
      }
    }
    return steps;
  }

  if (first.word === 'MERGE') {
    const using = find('USING');
    const on = find('ON');
    const when = top.filter((token) => token.word === 'WHEN');
    add(0, using ?? sql.length, 'MERGE · 대상', '변경할 대상 테이블을 지정합니다.', [
      'MERGE는 일치 여부에 따라 수정과 추가를 나누는 문장입니다.',
    ]);
    if (using !== undefined) {
      add(
        using,
        on ?? sql.length,
        'USING · 비교할 원본',
        '대상과 비교할 원본 데이터를 준비합니다.',
        ['원본은 테이블이나 SELECT 결과일 수 있습니다.']
      );
    }
    if (on !== undefined) {
      add(
        on,
        when[0]?.start ?? sql.length,
        'ON · 일치 여부',
        '대상과 원본의 행이 같은지 판정합니다.',
        ['이 판정에 따라 MATCHED 또는 NOT MATCHED 분기로 이동합니다.']
      );
    }
    when.forEach((token, index) => {
      const end = when[index + 1]?.start ?? sql.length;
      const notMatched = /^WHEN\s+NOT\s+MATCHED/i.test(sql.slice(token.start, end));
      add(
        token.start,
        end,
        notMatched ? 'WHEN NOT MATCHED · 새 행' : 'WHEN MATCHED · 기존 행',
        notMatched
          ? '일치하는 대상 행이 없을 때의 작업입니다.'
          : '일치하는 대상 행이 있을 때의 작업입니다.',
        [notMatched ? '보통 INSERT로 새 행을 추가합니다.' : '보통 UPDATE로 기존 행을 수정합니다.']
      );
    });
    return steps;
  }

  add(
    first.start,
    sql.length,
    `${first.word} · 문장 살펴보기`,
    '이 명령은 현재 단계 분석에서 세부 구문 분해를 지원하지 않습니다.',
    [
      'SQL 자체와 실습 결과를 함께 확인하세요. 문장 실행 순서는 사용하는 DBMS에 따라 달라질 수 있습니다.',
    ]
  );
  return steps;
}

export function explainSql(sql: string): SqlWalkthroughStep[] {
  const scan = scanSql(sql);
  const steps: SqlWalkthroughStep[] = [];
  let start = 0;
  scan.semicolons.forEach((semicolon) => {
    const statement = sql.slice(start, semicolon);
    if (statement.trim()) steps.push(...statementSteps(statement, start, 0));
    start = semicolon + 1;
  });
  const last = sql.slice(start);
  if (last.trim()) steps.push(...statementSteps(last, start, 0));
  return steps;
}
