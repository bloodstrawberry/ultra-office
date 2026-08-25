// Safe dynamic loader for AlaSQL in browser environment
// Uses alasql.min.js standalone build to prevent Turbopack/Next.js SSR from importing alasql.fs.js (which requires react-native-fs)

export async function loadAlaSql(): Promise<any> {
  if (typeof window === 'undefined') {
    return null;
  }
  if ((window as any).alasql) {
    return (window as any).alasql;
  }
  try {
    const mod = await import('alasql');
    const instance = (window as any).alasql || mod.default || mod;
    if (instance && instance.fn) {
      // NVL: If val is null, return defaultVal
      instance.fn.NVL = (val: any, defaultVal: any) =>
        val === null || val === undefined ? defaultVal : val;
      instance.fn.nvl = instance.fn.NVL;

      // NVL2: If val is not null, return expr1, else expr2
      instance.fn.NVL2 = (val: any, expr1: any, expr2: any) =>
        val !== null && val !== undefined ? expr1 : expr2;
      instance.fn.nvl2 = instance.fn.NVL2;

      // NULLIF: If expr1 equals expr2, return null, else expr1
      instance.fn.NULLIF = (expr1: any, expr2: any) => (expr1 === expr2 ? null : expr1);
      instance.fn.nullif = instance.fn.NULLIF;

      // COALESCE: Return first non-null argument
      instance.fn.COALESCE = (...args: any[]) => {
        for (const arg of args) {
          if (arg !== null && arg !== undefined) return arg;
        }
        return null;
      };
      instance.fn.coalesce = instance.fn.COALESCE;

      // DECODE: Oracle conditional branch function
      instance.fn.DECODE = (...args: any[]) => {
        if (args.length < 2) return null;
        const target = args[0];
        for (let i = 1; i < args.length - 1; i += 2) {
          const search = args[i];
          const result = args[i + 1];
          if (target === search || (target === null && search === null)) {
            return result;
          }
        }
        // If odd number of args after target, last one is default value
        if ((args.length - 1) % 2 === 1) {
          return args[args.length - 1];
        }
        return null;
      };
      instance.fn.decode = instance.fn.DECODE;

      // LNNVL: Returns true (1) if condition is FALSE or UNKNOWN/NULL, returns false (0) if TRUE
      instance.fn.LNNVL = (cond: any) => (cond ? 0 : 1);
      instance.fn.lnnvl = instance.fn.LNNVL;

      // CHR: ASCII code to character
      instance.fn.CHR = (n: any) =>
        n !== null && n !== undefined ? String.fromCharCode(Number(n)) : null;
      instance.fn.chr = instance.fn.CHR;

      // LPAD: Left pad string with characters
      instance.fn.LPAD = (str: any, len: any, pad = ' ') => {
        if (str === null || str === undefined || len === null || len === undefined) return null;
        const s = String(str);
        const l = Math.max(0, Number(len));
        const p = pad !== undefined && pad !== null && String(pad) !== '' ? String(pad) : ' ';
        return s.padStart(l, p);
      };
      instance.fn.lpad = instance.fn.LPAD;

      // RPAD: Right pad string with characters
      instance.fn.RPAD = (str: any, len: any, pad = ' ') => {
        if (str === null || str === undefined || len === null || len === undefined) return null;
        const s = String(str);
        const l = Math.max(0, Number(len));
        const p = pad !== undefined && pad !== null && String(pad) !== '' ? String(pad) : ' ';
        return s.padEnd(l, p);
      };
      instance.fn.rpad = instance.fn.RPAD;

      // LTRIM: Left trim whitespace or specific characters
      instance.fn.LTRIM = (str: any, chars?: any) => {
        if (str === null || str === undefined) return null;
        const s = String(str);
        if (chars === undefined || chars === null || String(chars) === '') {
          return s.replace(/^\s+/, '');
        }
        const escaped = String(chars).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        return s.replace(new RegExp(`^[${escaped}]+`), '');
      };
      instance.fn.ltrim = instance.fn.LTRIM;

      // RTRIM: Right trim whitespace or specific characters
      instance.fn.RTRIM = (str: any, chars?: any) => {
        if (str === null || str === undefined) return null;
        const s = String(str);
        if (chars === undefined || chars === null || String(chars) === '') {
          return s.replace(/\s+$/, '');
        }
        const escaped = String(chars).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        return s.replace(new RegExp(`[${escaped}]+$`), '');
      };
      instance.fn.rtrim = instance.fn.RTRIM;

      // TRIM: Trim both sides whitespace
      instance.fn.TRIM = (str: any) =>
        str !== null && str !== undefined ? String(str).trim() : null;
      instance.fn.trim = instance.fn.TRIM;

      // SUBSTR: Substring (1-indexed, supports negative position, optional length)
      instance.fn.SUBSTR = (str: any, pos: any, len?: any) => {
        if (str === null || str === undefined || pos === null || pos === undefined) return null;
        const s = String(str);
        let start = Number(pos);
        if (start === 0) start = 1;
        const jsStart = start > 0 ? start - 1 : Math.max(0, s.length + start);
        if (len === undefined || len === null) {
          return s.slice(jsStart);
        }
        const l = Math.max(0, Number(len));
        return s.slice(jsStart, jsStart + l);
      };
      instance.fn.substr = instance.fn.SUBSTR;

      // LENGTH: String character length
      instance.fn.LENGTH = (str: any) =>
        str !== null && str !== undefined ? String(str).length : null;
      instance.fn.length = instance.fn.LENGTH;

      // REPLACE: String replace (with optional replacement string defaulting to '')
      instance.fn.REPLACE = (str: any, search: any, rep?: any) => {
        if (str === null || str === undefined || search === null || search === undefined)
          return null;
        const s = String(str);
        const searchStr = String(search);
        const repStr = rep !== undefined && rep !== null ? String(rep) : '';
        return s.split(searchStr).join(repStr);
      };
      instance.fn.replace = instance.fn.REPLACE;

      // LOWER & UPPER
      instance.fn.LOWER = (str: any) =>
        str !== null && str !== undefined ? String(str).toLowerCase() : null;
      instance.fn.lower = instance.fn.LOWER;
      instance.fn.UPPER = (str: any) =>
        str !== null && str !== undefined ? String(str).toUpperCase() : null;
      instance.fn.upper = instance.fn.UPPER;

      // =========================================================================
      // NUMERIC FUNCTIONS (Oracle Compatible)
      // =========================================================================

      // ABS: Absolute value
      instance.fn.ABS = (n: any) => (n !== null && n !== undefined ? Math.abs(Number(n)) : null);
      instance.fn.abs = instance.fn.ABS;

      // SIGN: Sign function (1 for positive, -1 for negative, 0 for zero)
      instance.fn.SIGN = (n: any) => (n !== null && n !== undefined ? Math.sign(Number(n)) : null);
      instance.fn.sign = instance.fn.SIGN;

      // ROUND: Round number to specific decimal places (supports positive/negative digits)
      instance.fn.ROUND = (n: any, digits?: any) => {
        if (n === null || n === undefined) return null;
        const num = Number(n);
        const d = digits !== undefined && digits !== null ? Number(digits) : 0;
        if (d >= 0) {
          const factor = Math.pow(10, d);
          return Math.round(num * factor) / factor;
        }
        const factor = Math.pow(10, -d);
        return Math.round(num / factor) * factor;
      };
      instance.fn.round = instance.fn.ROUND;

      // TRUNC: Truncate number (supports positive/negative digits)
      instance.fn.TRUNC = (n: any, digits?: any) => {
        if (n === null || n === undefined) return null;
        const num = Number(n);
        const d = digits !== undefined && digits !== null ? Number(digits) : 0;
        if (d >= 0) {
          const factor = Math.pow(10, d);
          return Math.trunc(num * factor) / factor;
        }
        const factor = Math.pow(10, -d);
        return Math.trunc(num / factor) * factor;
      };
      instance.fn.trunc = instance.fn.TRUNC;

      // CEIL / CEILING: Smallest integer greater than or equal to n
      instance.fn.CEIL = (n: any) => (n !== null && n !== undefined ? Math.ceil(Number(n)) : null);
      instance.fn.ceil = instance.fn.CEIL;
      instance.fn.CEILING = instance.fn.CEIL;
      instance.fn.ceiling = instance.fn.CEIL;

      // FLOOR: Largest integer less than or equal to n
      instance.fn.FLOOR = (n: any) =>
        n !== null && n !== undefined ? Math.floor(Number(n)) : null;
      instance.fn.floor = instance.fn.FLOOR;

      // MOD: Remainder (Oracle formula: n - m * TRUNC(n / m))
      // Preserves sign of first operand (m): MOD(10, -3) = 1, MOD(-10, 3) = -1, MOD(-10, -3) = -1
      instance.fn.MOD = (n: any, m: any) => {
        if (n === null || n === undefined || m === null || m === undefined) return null;
        const numN = Number(n);
        const numM = Number(m);
        if (numM === 0) return numN;
        return numN - numM * Math.trunc(numN / numM);
      };
      instance.fn.mod = instance.fn.MOD;

      // POWER: Exponentiation
      instance.fn.POWER = (n: any, p: any) =>
        n !== null && n !== undefined && p !== null && p !== undefined
          ? Math.pow(Number(n), Number(p))
          : null;
      instance.fn.power = instance.fn.POWER;

      // SQRT: Square root
      instance.fn.SQRT = (n: any) => (n !== null && n !== undefined ? Math.sqrt(Number(n)) : null);
      instance.fn.sqrt = instance.fn.SQRT;

      // EXP, LN, LOG
      instance.fn.EXP = (n: any) => (n !== null && n !== undefined ? Math.exp(Number(n)) : null);
      instance.fn.exp = instance.fn.EXP;
      instance.fn.LN = (n: any) => (n !== null && n !== undefined ? Math.log(Number(n)) : null);
      instance.fn.ln = instance.fn.LN;
      instance.fn.LOG = (base: any, n: any) => {
        if (base === null || base === undefined || n === null || n === undefined) return null;
        return Math.log(Number(n)) / Math.log(Number(base));
      };
      instance.fn.log = instance.fn.LOG;

      // =========================================================================
      // DATE FUNCTIONS (Oracle Compatible)
      // =========================================================================

      const pad2 = (num: number) => String(num).padStart(2, '0');
      const toDateObj = (val: any): Date | null => {
        if (!val) return null;
        if (val instanceof Date) return val;
        const d = new Date(val);
        return isNaN(d.getTime()) ? null : d;
      };
      const formatDate = (d: Date) =>
        `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
      const formatDateTime = (d: Date) =>
        `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;

      // SYSDATE: Current date and time
      instance.fn.SYSDATE = () => formatDateTime(new Date());
      instance.fn.sysdate = instance.fn.SYSDATE;

      // ADD_MONTHS: Add months to date with month-end adjustment
      instance.fn.ADD_MONTHS = (dt: any, n: any) => {
        const d = toDateObj(dt);
        if (!d || n === null || n === undefined) return null;
        const months = Number(n);
        const originalDay = d.getDate();
        const res = new Date(d.getFullYear(), d.getMonth() + months, 1);
        const lastDayOfTargetMonth = new Date(res.getFullYear(), res.getMonth() + 1, 0).getDate();
        res.setDate(Math.min(originalDay, lastDayOfTargetMonth));
        return formatDate(res);
      };
      instance.fn.add_months = instance.fn.ADD_MONTHS;

      // MONTHS_BETWEEN: Number of months between two dates
      instance.fn.MONTHS_BETWEEN = (d1: any, d2: any) => {
        const dt1 = toDateObj(d1);
        const dt2 = toDateObj(d2);
        if (!dt1 || !dt2) return null;
        const yearDiff = dt1.getFullYear() - dt2.getFullYear();
        const monthDiff = dt1.getMonth() - dt2.getMonth();
        const dayDiff = (dt1.getDate() - dt2.getDate()) / 31;
        return Math.round((yearDiff * 12 + monthDiff + dayDiff) * 100) / 100;
      };
      instance.fn.months_between = instance.fn.MONTHS_BETWEEN;

      // LAST_DAY: Last day of the month
      instance.fn.LAST_DAY = (dt: any) => {
        const d = toDateObj(dt);
        if (!d) return null;
        const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        return formatDate(last);
      };
      instance.fn.last_day = instance.fn.LAST_DAY;

      // NEXT_DAY: Next specified day of the week
      instance.fn.NEXT_DAY = (dt: any, day: any) => {
        const d = toDateObj(dt);
        if (!d || day === null || day === undefined) return null;
        const dayMap: Record<string, number> = {
          sun: 0,
          sunday: 0,
          '1': 0,
          일: 0,
          일요일: 0,
          mon: 1,
          monday: 1,
          '2': 1,
          월: 1,
          월요일: 1,
          tue: 2,
          tuesday: 2,
          '3': 2,
          화: 2,
          화요일: 2,
          wed: 3,
          wednesday: 3,
          '4': 3,
          수: 3,
          수요일: 3,
          thu: 4,
          thursday: 4,
          '5': 4,
          목: 4,
          목요일: 4,
          fri: 5,
          friday: 5,
          '6': 5,
          금: 5,
          금요일: 5,
          sat: 6,
          saturday: 6,
          '7': 6,
          토: 6,
          토요일: 6,
        };
        const targetDay = dayMap[String(day).toLowerCase()] ?? 1;
        const currentDay = d.getDay();
        let diff = targetDay - currentDay;
        if (diff <= 0) diff += 7;
        const next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff);
        return formatDate(next);
      };
      instance.fn.next_day = instance.fn.NEXT_DAY;

      // EXTRACT: Extract year, month, day, hour, minute, second
      instance.fn.EXTRACT = (part: any, dt: any) => {
        const d = toDateObj(dt);
        if (!d || !part) return null;
        const p = String(part).toUpperCase();
        switch (p) {
          case 'YEAR':
          case 'YYYY':
            return d.getFullYear();
          case 'MONTH':
          case 'MM':
            return d.getMonth() + 1;
          case 'DAY':
          case 'DD':
            return d.getDate();
          case 'HOUR':
          case 'HH':
            return d.getHours();
          case 'MINUTE':
          case 'MI':
            return d.getMinutes();
          case 'SECOND':
          case 'SS':
            return d.getSeconds();
          default:
            return null;
        }
      };
      instance.fn.extract = instance.fn.EXTRACT;

      // Enhance ROUND and TRUNC to support date format units (YYYY, MM, DD)
      const origRound = instance.fn.ROUND;
      instance.fn.ROUND = (val: any, param?: any) => {
        if (typeof param === 'string') {
          const d = toDateObj(val);
          if (d) {
            const fmt = param.toUpperCase();
            if (fmt === 'YYYY' || fmt === 'YEAR') {
              const yr = d.getMonth() >= 6 ? d.getFullYear() + 1 : d.getFullYear();
              return `${yr}-01-01`;
            }
            if (fmt === 'MM' || fmt === 'MONTH') {
              const res = new Date(
                d.getFullYear(),
                d.getDate() >= 16 ? d.getMonth() + 1 : d.getMonth(),
                1
              );
              return formatDate(res);
            }
            if (fmt === 'DD') {
              return formatDate(d);
            }
          }
        }
        return origRound(val, param);
      };
      instance.fn.round = instance.fn.ROUND;

      const origTrunc = instance.fn.TRUNC;
      instance.fn.TRUNC = (val: any, param?: any) => {
        if (typeof param === 'string') {
          const d = toDateObj(val);
          if (d) {
            const fmt = param.toUpperCase();
            if (fmt === 'YYYY' || fmt === 'YEAR') {
              return `${d.getFullYear()}-01-01`;
            }
            if (fmt === 'MM' || fmt === 'MONTH') {
              return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-01`;
            }
            if (fmt === 'DD') {
              return formatDate(d);
            }
          }
        }
        return origTrunc(val, param);
      };
      instance.fn.trunc = instance.fn.TRUNC;

      // =========================================================================
      // CONVERSION FUNCTIONS (TO_CHAR, TO_NUMBER, TO_DATE)
      // =========================================================================

      // TO_CHAR: Convert number or date to formatted string
      instance.fn.TO_CHAR = (val: any, format?: any) => {
        if (val === null || val === undefined) return null;

        // If date object or date string
        const d = toDateObj(val);
        const isLikelyDate =
          d &&
          (val instanceof Date ||
            (typeof val === 'string' &&
              (val.includes('-') || val.includes('/') || val.includes(':'))));

        if (isLikelyDate && d) {
          if (!format) return formatDate(d);
          let fmt = String(format);
          const year = d.getFullYear();
          const month = d.getMonth() + 1;
          const day = d.getDate();
          const hours = d.getHours();
          const mins = d.getMinutes();
          const secs = d.getSeconds();
          const dayOfWeek = d.getDay();
          const quarter = Math.floor((d.getMonth() + 3) / 3);

          const daysLong = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
          const daysShort = ['일', '월', '화', '수', '목', '금', '토'];

          fmt = fmt.replace(/YYYY/gi, String(year));
          fmt = fmt.replace(/YY/gi, String(year).slice(-2));
          fmt = fmt.replace(/MM/gi, pad2(month));
          fmt = fmt.replace(/DD/gi, pad2(day));
          fmt = fmt.replace(/DAY/gi, daysLong[dayOfWeek]);
          fmt = fmt.replace(/DY/gi, daysShort[dayOfWeek]);
          fmt = fmt.replace(/HH24/gi, pad2(hours));
          fmt = fmt.replace(/HH12|HH/gi, pad2(hours % 12 || 12));
          fmt = fmt.replace(/MI/gi, pad2(mins));
          fmt = fmt.replace(/SS/gi, pad2(secs));
          fmt = fmt.replace(/Q/gi, String(quarter));
          return fmt;
        }

        // Numeric conversion
        const num = Number(val);
        if (!isNaN(num)) {
          if (!format) return String(num);
          const fmtStr = String(format).trim().toUpperCase();

          // Check if zero padding format like '000000'
          if (/^0+$/.test(fmtStr)) {
            return String(num).padStart(fmtStr.length, '0');
          }

          // Check currency / comma formats like '999,999,999' or 'L999,999'
          const hasComma = fmtStr.includes(',');
          const hasCurrency = fmtStr.includes('L') || fmtStr.includes('$') || fmtStr.includes('₩');

          let formatted = num.toLocaleString('ko-KR', {
            maximumFractionDigits: 4,
          });

          if (hasCurrency) {
            if (fmtStr.includes('$')) formatted = `$${formatted}`;
            else formatted = `₩${formatted}`;
          }
          return formatted;
        }

        return String(val);
      };
      instance.fn.to_char = instance.fn.TO_CHAR;

      // TO_NUMBER: Convert string to number (strips commas, currency symbols, whitespace)
      instance.fn.TO_NUMBER = (str: any, _fmt?: any) => {
        if (str === null || str === undefined) return null;
        if (typeof str === 'number') return str;
        const cleaned = String(str).replace(/[^\d.-]/g, '');
        const num = Number(cleaned);
        return isNaN(num) ? null : num;
      };
      instance.fn.to_number = instance.fn.TO_NUMBER;

      // TO_DATE: Convert string to standard date/time string
      instance.fn.TO_DATE = (str: any, fmt?: any) => {
        if (!str) return null;
        const s = String(str).trim();

        // If format is like 'YYYYMMDD' (8 digits without separator)
        if (
          fmt &&
          String(fmt)
            .toUpperCase()
            .replace(/[^A-Z]/g, '') === 'YYYYMMDD' &&
          /^\d{8}$/.test(s)
        ) {
          const yr = s.slice(0, 4);
          const mo = s.slice(4, 6);
          const dy = s.slice(6, 8);
          return `${yr}-${mo}-${dy}`;
        }

        // If format has time like 'YYYYMMDDHH24MISS'
        if (fmt && String(fmt).toUpperCase().includes('HH') && /^\d{14}$/.test(s)) {
          const yr = s.slice(0, 4);
          const mo = s.slice(4, 6);
          const dy = s.slice(6, 8);
          const hh = s.slice(8, 10);
          const mi = s.slice(10, 12);
          const ss = s.slice(12, 14);
          return `${yr}-${mo}-${dy} ${hh}:${mi}:${ss}`;
        }

        const d = new Date(s);
        if (!isNaN(d.getTime())) {
          return formatDate(d);
        }
        return s;
      };
      instance.fn.to_date = instance.fn.TO_DATE;
    }
    return instance;
  } catch (err) {
    console.error('Failed to load AlaSQL:', err);
    return null;
  }
}
