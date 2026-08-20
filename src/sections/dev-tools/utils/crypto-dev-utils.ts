import CryptoJS from 'crypto-js';

// ----------------------------------------------------------------------
// 1. JWT Decoder & Analyzer
// ----------------------------------------------------------------------
export interface JwtDecoded {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  isExpired: boolean;
  issuedAt?: string;
  expiresAt?: string;
}

export function decodeJwt(token: string): JwtDecoded | null {
  try {
    const parts = token.trim().split('.');
    if (parts.length !== 3) return null;

    const decodeBase64Url = (str: string) => {
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }
      return decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
          .join('')
      );
    };

    const header = JSON.parse(decodeBase64Url(parts[0]));
    const payload = JSON.parse(decodeBase64Url(parts[1]));
    const signature = parts[2];

    let isExpired = false;
    let expiresAt: string | undefined;
    let issuedAt: string | undefined;

    if (payload.exp && typeof payload.exp === 'number') {
      const expDate = new Date(payload.exp * 1000);
      expiresAt = expDate.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
      isExpired = expDate.getTime() < Date.now();
    }

    if (payload.iat && typeof payload.iat === 'number') {
      issuedAt = new Date(payload.iat * 1000).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    }

    return {
      header,
      payload,
      signature,
      isExpired,
      issuedAt,
      expiresAt,
    };
  } catch {
    return null;
  }
}

// ----------------------------------------------------------------------
// 2. Crypto & Hash Lab
// ----------------------------------------------------------------------
export function calculateHash(
  text: string,
  algorithm: 'md5' | 'sha1' | 'sha256' | 'sha512'
): string {
  switch (algorithm) {
    case 'md5':
      return CryptoJS.MD5(text).toString();
    case 'sha1':
      return CryptoJS.SHA1(text).toString();
    case 'sha256':
      return CryptoJS.SHA256(text).toString();
    case 'sha512':
      return CryptoJS.SHA512(text).toString();
    default:
      return '';
  }
}

export function encryptAes(text: string, secretKey: string): string {
  return CryptoJS.AES.encrypt(text, secretKey).toString();
}

export function decryptAes(ciphertext: string, secretKey: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    const enc = (CryptoJS as unknown as { enc: { Utf8: { stringify: (w: unknown) => string } } })
      .enc;
    return enc.Utf8.stringify(bytes);
  } catch {
    return '복호화 실패: 유효하지 않은 암호문 또는 비밀키입니다.';
  }
}

// ----------------------------------------------------------------------
// 3. Schema Converter (JSON -> TypeScript / SQL)
// ----------------------------------------------------------------------
export function jsonToTypeScript(jsonStr: string, rootName: string = 'RootObject'): string {
  try {
    const parsed = JSON.parse(jsonStr);

    const getType = (val: unknown): string => {
      if (val === null) return 'null';
      if (Array.isArray(val)) {
        if (val.length === 0) return 'any[]';
        return `${getType(val[0])}[]`;
      }
      if (typeof val === 'object') {
        return 'Record<string, any>';
      }
      return typeof val;
    };

    const generateInterface = (obj: Record<string, unknown>, name: string): string => {
      const fields = Object.entries(obj).map(([key, val]) => {
        const fieldType = getType(val);
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
          const nestedName = `${key.charAt(0).toUpperCase() + key.slice(1)}Type`;
          return `  ${key}: ${nestedName};`;
        }
        return `  ${key}: ${fieldType};`;
      });

      return `export interface ${name} {\n${fields.join('\n')}\n}`;
    };

    if (Array.isArray(parsed)) {
      return generateInterface(parsed[0] || {}, rootName);
    }
    return generateInterface(parsed, rootName);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return `// JSON 파싱 오류: ${msg}`;
  }
}

export function jsonToSql(jsonStr: string, tableName: string = 'my_table'): string {
  try {
    const parsed = JSON.parse(jsonStr);
    const rows = Array.isArray(parsed) ? parsed : [parsed];
    if (rows.length === 0) return '-- 빈 데이터입니다.';

    const sample = rows[0];
    const columns = Object.keys(sample);

    const getSqlType = (val: unknown) => {
      if (typeof val === 'number') return Number.isInteger(val) ? 'INTEGER' : 'DECIMAL(10,2)';
      if (typeof val === 'boolean') return 'BOOLEAN';
      return 'VARCHAR(255)';
    };

    const ddlColumns = columns.map((col) => `  \`${col}\` ${getSqlType(sample[col])}`);
    const ddl = `CREATE TABLE \`${tableName}\` (\n  \`id\` INT PRIMARY KEY AUTO_INCREMENT,\n${ddlColumns.join(',\n')}\n);`;

    const insertStatements = rows.map((row) => {
      const vals = columns.map((col) => {
        const val = row[col];
        if (val === null || val === undefined) return 'NULL';
        if (typeof val === 'number' || typeof val === 'boolean') return `${val}`;
        return `'${String(val).replace(/'/g, "''")}'`;
      });
      return `INSERT INTO \`${tableName}\` (\`${columns.join('`, `')}\`) VALUES (${vals.join(', ')});`;
    });

    return `${ddl}\n\n-- 데이터 삽입\n${insertStatements.join('\n')}`;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return `-- SQL 생성 실패: ${msg}`;
  }
}

// ----------------------------------------------------------------------
// 4. Korean Regular Expression Presets
// ----------------------------------------------------------------------
export const REGEX_PRESETS = [
  {
    name: '주민등록번호 (한국)',
    pattern: '\\d{6}-[1-4]\\d{6}',
    example: '900101-1234567',
  },
  {
    name: '사업자등록번호 (한국)',
    pattern: '\\d{3}-\\d{2}-\\d{5}',
    example: '123-45-67890',
  },
  {
    name: '휴대폰 번호 (010)',
    pattern: '010-\\d{3,4}-\\d{4}',
    example: '010-1234-5678',
  },
  {
    name: '이메일 주소 (Email)',
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    example: 'support@ultraoffice.com',
  },
  {
    name: 'IPv4 주소',
    pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b',
    example: '192.168.0.1',
  },
];

// ----------------------------------------------------------------------
// 5. Random Generators
// ----------------------------------------------------------------------
export function generateRandomPassword(
  length: number = 16,
  options = { upper: true, lower: true, digits: true, symbols: true }
): string {
  let chars = '';
  if (options.lower) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (options.upper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (options.digits) chars += '0123456789';
  if (options.symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz0123456789';

  let pwd = '';
  const cryptoObj = window.crypto;
  const values = new Uint32Array(length);
  cryptoObj.getRandomValues(values);

  for (let i = 0; i < length; i += 1) {
    pwd += chars[values[i] % chars.length];
  }
  return pwd;
}

export function generateUuidV4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
