// ----------------------------------------------------------------------
// MATLAB Syntax Preprocessor & Lexer Helper
// ----------------------------------------------------------------------

export interface PreprocessedStatement {
  original: string;
  processed: string;
  hasSemicolon: boolean;
  assignedVarName?: string;
  isCommentOnly?: boolean;
}

/**
 * Strips block comments and normalizes line breaks
 */
export function normalizeScript(script: string): string[] {
  const lines = script.split(/\r?\n/);
  return lines;
}

/**
 * Preprocesses a single MATLAB line/statement into mathjs/JS evaluatable syntax
 */
export function preprocessMatlabLine(line: string): string {
  let cleaned = line.trim();

  // 1. Remove comments (% or //)
  const commentIdx = cleaned.indexOf('%');
  if (commentIdx !== -1) {
    // Check if % is inside string quotes
    const beforeComment = cleaned.substring(0, commentIdx);
    const singleQuotes = (beforeComment.match(/'/g) || []).length;
    const doubleQuotes = (beforeComment.match(/"/g) || []).length;
    if (singleQuotes % 2 === 0 && doubleQuotes % 2 === 0) {
      cleaned = cleaned.substring(0, commentIdx).trim();
    }
  }

  if (!cleaned) return '';

  // 2. Convert MATLAB imaginary literals: 1i, 2j, 1i * ...
  cleaned = cleaned.replace(/(\d+)\s*i\b/g, '$1i');
  cleaned = cleaned.replace(/(\d+)\s*j\b/g, '$1i');
  cleaned = cleaned.replace(/\b1i\b/g, 'i');
  cleaned = cleaned.replace(/\b1j\b/g, 'i');

  // 3. Convert MATLAB matrix syntax: [1 2 3; 4 5 6] or [1, 2, 3; 4, 5, 6]
  // Detect brackets [...]
  cleaned = transformMatrixSyntax(cleaned);

  // 4. Convert elementwise operators for mathjs:
  // mathjs supports dotMultiply, dotDivide, dotPow via .* ./ .^ or functions
  // Note: mathjs v11+ supports .*, ./, .^ natively in expressions!

  // 5. Convert pi, eps, inf, nan
  cleaned = cleaned.replace(/\bpi\b/g, 'PI');
  cleaned = cleaned.replace(/\beps\b/g, '2.220446049250313e-16');
  cleaned = cleaned.replace(/\bInf\b/g, 'Infinity');
  cleaned = cleaned.replace(/\bNaN\b/g, 'NaN');

  return cleaned;
}

/**
 * Transforms MATLAB matrix literals `[1 2 3; 4 5 6]` into JSON/mathjs array format `[[1, 2, 3], [4, 5, 6]]`
 */
export function transformMatrixSyntax(code: string): string {
  // Regex to match bracketed expressions: [ ... ]
  return code.replace(/\[([^\][]+)\]/g, (match, inside: string) => {
    // If it contains semicolons, it's a 2D matrix
    if (inside.includes(';')) {
      const rows = inside.split(';').map((row) => {
        const trimmedRow = row.trim();
        // Replace spaces between numbers/variables with commas, keeping commas
        const elements = normalizeRowElements(trimmedRow);
        return `[${elements}]`;
      });
      return `[${rows.join(', ')}]`;
    }

    // 1D row vector with space delimiters: [1 2 3 4]
    const elements = normalizeRowElements(inside.trim());
    return `[${elements}]`;
  });
}

/**
 * Splits space-separated elements inside a row into comma-separated elements
 * e.g. "1 2.5 3 sin(x)" -> "1, 2.5, 3, sin(x)"
 */
function normalizeRowElements(rowStr: string): string {
  if (!rowStr) return '';
  // If already comma separated, just return
  if (rowStr.includes(',')) {
    return rowStr;
  }

  // Tokenize carefully by space, avoiding splitting within parentheses
  const tokens: string[] = [];
  let current = '';
  let parenDepth = 0;

  for (let i = 0; i < rowStr.length; i++) {
    const char = rowStr[i];
    if (char === '(' || char === '[' || char === '{') parenDepth++;
    else if (char === ')' || char === ']' || char === '}') parenDepth--;

    if (/\s/.test(char) && parenDepth === 0) {
      if (current.trim()) {
        tokens.push(current.trim());
        current = '';
      }
    } else {
      current += char;
    }
  }
  if (current.trim()) {
    tokens.push(current.trim());
  }

  return tokens.join(', ');
}

/**
 * Parses MATLAB range expression `start:step:stop` or `start:stop`
 */
export function parseMatlabRange(expr: string): number[] | null {
  const parts = expr.split(':');
  if (parts.length === 2) {
    const start = Number(parts[0]);
    const stop = Number(parts[1]);
    if (!isNaN(start) && !isNaN(stop)) {
      const res: number[] = [];
      const step = start <= stop ? 1 : -1;
      for (let v = start; start <= stop ? v <= stop : v >= stop; v += step) {
        res.push(Number(v.toFixed(6)));
      }
      return res;
    }
  } else if (parts.length === 3) {
    const start = Number(parts[0]);
    const step = Number(parts[1]);
    const stop = Number(parts[2]);
    if (!isNaN(start) && !isNaN(step) && !isNaN(stop) && step !== 0) {
      const res: number[] = [];
      const count = Math.floor(Math.abs((stop - start) / step)) + 1;
      for (let i = 0; i < Math.min(count, 50000); i++) {
        const v = start + i * step;
        if (step > 0 && v > stop + 1e-9) break;
        if (step < 0 && v < stop - 1e-9) break;
        res.push(Number(v.toFixed(6)));
      }
      return res;
    }
  }
  return null;
}
