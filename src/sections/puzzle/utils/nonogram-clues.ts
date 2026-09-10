export function parseClueText(text: string): number[][] {
  return text.split('\n').map((line) => {
    if (!/^\s*\d+(?:[ ,]+\d+)*\s*$/.test(line)) return [];
    return line.trim().split(/[ ,]+/).map(Number);
  });
}

export function validateClues(rows: number[][], cols: number[][]): string[] {
  const errors: string[] = [];
  if (rows.length < 1 || cols.length < 1 || rows.length > 30 || cols.length > 30) {
    errors.push('격자 크기는 1~30칸이어야 합니다.');
  }
  const check = (lines: number[][], size: number, label: string) => {
    lines.forEach((line, i) => {
      if (
        !line.length ||
        line.some((n) => !Number.isInteger(n) || n < 0 || n > size) ||
        (line.includes(0) && line.length !== 1)
      ) {
        errors.push(`${label} ${i + 1}: 숫자를 확인하세요. 빈 줄은 0으로 입력하세요.`);
      } else if (line.reduce((a, b) => a + b, 0) + line.length - 1 > size) {
        errors.push(`${label} ${i + 1}: 단서가 격자 길이를 초과합니다.`);
      }
    });
  };
  check(rows, cols.length, '행');
  check(cols, rows.length, '열');
  if (rows.flat().reduce((a, b) => a + b, 0) !== cols.flat().reduce((a, b) => a + b, 0)) {
    errors.push('행·열의 채워지는 칸 수 합계가 다릅니다.');
  }
  return errors;
}

/** Bounded constraint propagation + search. Never fabricates an answer for invalid OCR. */
export function solveNonogramClues(rows: number[][], cols: number[][]): number[][] {
  const errors = validateClues(rows, cols);
  if (errors.length) throw new Error(errors.join('\n'));
  const deadline = Date.now() + 2000;
  let operations = 0;
  const guard = () => {
    operations += 1;
    if (operations > 200000 || Date.now() > deadline)
      throw new Error('풀이 제한을 초과했습니다. 단서 또는 격자 크기를 확인하세요.');
  };
  const patterns = (clues: number[], size: number): number[][] => {
    if (clues[0] === 0) return [Array(size).fill(0)];
    const result: number[][] = [];
    const visit = (index: number, start: number, line: number[]) => {
      guard();
      if (index === clues.length) {
        result.push(line);
        return;
      }
      const remaining = clues.slice(index).reduce((a, b) => a + b, 0) + clues.length - index - 1;
      for (let p = start; p <= size - remaining; p += 1) {
        const next = [...line];
        next.fill(1, p, p + clues[index]);
        visit(index + 1, p + clues[index] + 1, next);
      }
    };
    visit(0, 0, Array(size).fill(0));
    return result;
  };
  const search = (rr: number[][][], cc: number[][][]): number[][] | null => {
    guard();
    let changed = true;
    while (changed) {
      guard();
      changed = false;
      for (let r = 0; r < rows.length; r += 1) {
        for (let c = 0; c < cols.length; c += 1) {
          guard();
          const colValues = new Set(cc[c].map((q) => q[r]));
          const a = rr[r].filter((p) => colValues.has(p[c]));
          const rowValues = new Set(a.map((p) => p[c]));
          const b = cc[c].filter((q) => rowValues.has(q[r]));
          if (!a.length || !b.length) return null;
          if (a.length !== rr[r].length || b.length !== cc[c].length) changed = true;
          rr[r] = a;
          cc[c] = b;
        }
      }
    }
    let pick = -1;
    rr.forEach((line, i) => {
      if (line.length > 1 && (pick < 0 || line.length < rr[pick].length)) pick = i;
    });
    if (pick < 0) return rr.map((line) => line[0]);
    for (const candidate of rr[pick]) {
      const next = rr.map((line, i) => (i === pick ? [candidate] : [...line]));
      const answer = search(
        next,
        cc.map((line) => [...line])
      );
      if (answer) return answer;
    }
    return null;
  };
  const answer = search(
    rows.map((c) => patterns(c, cols.length)),
    cols.map((c) => patterns(c, rows.length))
  );
  if (!answer) throw new Error('단서를 만족하는 해답이 없습니다. 인식된 숫자를 수정하세요.');
  return answer;
}
