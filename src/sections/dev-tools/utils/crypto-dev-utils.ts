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
  timeRemaining?: string;
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
    let timeRemaining: string | undefined;

    if (payload.exp && typeof payload.exp === 'number') {
      const expDate = new Date(payload.exp * 1000);
      expiresAt = expDate.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
      const now = Date.now();
      const diffMs = expDate.getTime() - now;
      isExpired = diffMs <= 0;

      if (isExpired) {
        timeRemaining = '만료됨';
      } else {
        const diffSec = Math.floor(diffMs / 1000);
        const hours = Math.floor(diffSec / 3600);
        const mins = Math.floor((diffSec % 3600) / 60);
        const secs = diffSec % 60;
        timeRemaining = `${hours > 0 ? `${hours}시간 ` : ''}${mins}분 ${secs}초 남음`;
      }
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
      timeRemaining,
    };
  } catch {
    return null;
  }
}

export const SAMPLE_JWT_TOKENS = [
  {
    name: '표준 사용자 토큰 (Active)',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzk5ODgyMSIsIm5hbWUiOiLtmY3quLjrj5kiLCJlbWFpbCI6ImhvbmdfZ2lsZG9uZ0B1bHRyYW9mZmljZS5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTczNTY4OTYwMCwiZXhwIjoyMDgwODk2MDAwfQ.7fL3-X8e_sample_signature_ultra_token_active',
  },
  {
    name: '관리자 토큰 (Admin Role & 권한)',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbl8wMDAxIiwibmFtZSI6Iuq0gOumrOyerCIsImVtYWlsIjoiYWRtaW5AdWx0cmFvZmZpY2UuY29tIiwicm9sZSI6InN1cGVyX2FkbWluIiwicGVybWlzc2lvbnMiOlsicmVhZCIsIndyaXRlIiwiZGVsZXRlIiwiZXhlY3V0ZSJdLCJpYXQiOjE3MzU2ODk2MDAsImV4cCI6MjA4MDg5NjAwMH0.sample_admin_signature_key_2026',
  },
  {
    name: '만료된 토큰 (Expired Token)',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJleHBpcmVkX3VzZXIiLCJuYW1lIjoi66eM66OM65CY7Yag7YGwIiwiZW1haWwiOiJleHBpcmVkQHRlc3QuY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTUxNjI0MjYyMn0.sample_expired_signature_demo',
  },
];

// ----------------------------------------------------------------------
// 2. Crypto & Hash Lab
// ----------------------------------------------------------------------
export type HashAlgorithm = 'md5' | 'sha1' | 'sha256' | 'sha512';

export function calculateHash(text: string, algorithm: HashAlgorithm): string {
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

export function calculateHmac(
  text: string,
  secretKey: string,
  _algorithm: 'sha256' | 'sha512' | 'md5' = 'sha256'
): string {
  if (!secretKey) return '';
  return CryptoJS.SHA256(`${secretKey}:${text}:${secretKey}`).toString();
}

export function encryptAes(text: string, secretKey: string): string {
  if (!text || !secretKey) return '';
  return CryptoJS.AES.encrypt(text, secretKey).toString();
}

export function decryptAes(ciphertext: string, secretKey: string): string {
  if (!ciphertext || !secretKey) return '';
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    const enc = (CryptoJS as unknown as { enc: { Utf8: { stringify: (w: unknown) => string } } })
      .enc;
    const decrypted = enc.Utf8.stringify(bytes);
    if (!decrypted) return '복호화 실패: 암호키가 일치하지 않거나 손상된 암호문입니다.';
    return decrypted;
  } catch {
    return '복호화 실패: 유효하지 않은 암호문 또는 비밀키입니다.';
  }
}

// ----------------------------------------------------------------------
// 3. Base64 & URL Encoder / Decoder
// ----------------------------------------------------------------------
export function encodeBase64(text: string): string {
  try {
    const bytes = new TextEncoder().encode(text);
    const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
    return btoa(binString);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return `Base64 인코딩 실패: ${msg}`;
  }
}

export function decodeBase64(base64: string): string {
  try {
    const cleaned = base64.trim().replace(/\s+/g, '');
    const binString = atob(cleaned);
    const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return `Base64 디코딩 실패: ${msg}`;
  }
}

export function encodeUrlComponent(text: string): string {
  try {
    return encodeURIComponent(text);
  } catch {
    return text;
  }
}

export function decodeUrlComponent(text: string): string {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

// ----------------------------------------------------------------------
// 4. Schema Converter (JSON -> TypeScript / SQL / Zod / YAML / CSV)
// ----------------------------------------------------------------------
export function formatJson(jsonStr: string, indent: number = 2): string {
  try {
    const parsed = JSON.parse(jsonStr);
    return JSON.stringify(parsed, null, indent);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return `// JSON 문법 오류: ${msg}`;
  }
}

export function minifyJson(jsonStr: string): string {
  try {
    const parsed = JSON.parse(jsonStr);
    return JSON.stringify(parsed);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return `// JSON 문법 오류: ${msg}`;
  }
}

export function jsonToTypeScript(
  jsonStr: string,
  rootName: string = 'RootObject',
  mode: 'interface' | 'type' = 'interface'
): string {
  try {
    const parsed = JSON.parse(jsonStr);

    const getType = (val: unknown): string => {
      if (val === null) return 'null';
      if (Array.isArray(val)) {
        if (val.length === 0) return 'unknown[]';
        return `${getType(val[0])}[]`;
      }
      if (typeof val === 'object') {
        return 'Record<string, unknown>';
      }
      return typeof val;
    };

    const generateInterface = (obj: Record<string, unknown>, name: string): string => {
      const nestedDefs: string[] = [];
      const fields = Object.entries(obj).map(([key, val]) => {
        const cleanKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `'${key}'`;
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
          const nestedName = `${key.charAt(0).toUpperCase() + key.slice(1)}Item`;
          nestedDefs.push(generateInterface(val as Record<string, unknown>, nestedName));
          return `  ${cleanKey}: ${nestedName};`;
        }
        if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object' && val[0] !== null) {
          const nestedName = `${key.charAt(0).toUpperCase() + key.slice(1)}Item`;
          nestedDefs.push(generateInterface(val[0] as Record<string, unknown>, nestedName));
          return `  ${cleanKey}: ${nestedName}[];`;
        }
        const fieldType = getType(val);
        return `  ${cleanKey}: ${fieldType};`;
      });

      const body = fields.join('\n');
      const mainDef =
        mode === 'interface'
          ? `export interface ${name} {\n${body}\n}`
          : `export type ${name} = {\n${body}\n};`;

      return nestedDefs.length > 0 ? `${nestedDefs.join('\n\n')}\n\n${mainDef}` : mainDef;
    };

    if (Array.isArray(parsed)) {
      return generateInterface(parsed[0] || {}, rootName);
    }
    return generateInterface(parsed, rootName);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return `// TypeScript 변환 실패 (JSON 문법 확인 필요):\n// ${msg}`;
  }
}

export function jsonToSql(
  jsonStr: string,
  tableName: string = 'my_table',
  dialect: 'mysql' | 'postgres' = 'mysql'
): string {
  try {
    const parsed = JSON.parse(jsonStr);
    const rows: Record<string, unknown>[] = Array.isArray(parsed) ? parsed : [parsed];
    if (rows.length === 0) return '-- 빈 데이터입니다.';

    const sample = rows[0];
    const columns = Object.keys(sample);

    const getSqlType = (val: unknown) => {
      if (typeof val === 'number') {
        return Number.isInteger(val) ? 'INTEGER' : 'DECIMAL(12, 4)';
      }
      if (typeof val === 'boolean') return 'BOOLEAN';
      if (typeof val === 'object' && val !== null) {
        return dialect === 'postgres' ? 'JSONB' : 'JSON';
      }
      if (typeof val === 'string' && val.length > 255) return 'TEXT';
      return 'VARCHAR(255)';
    };

    const quote = dialect === 'postgres' ? '"' : '`';
    const autoInc =
      dialect === 'postgres' ? '"id" SERIAL PRIMARY KEY' : '`id` INT PRIMARY KEY AUTO_INCREMENT';

    const ddlColumns = columns.map((col) => `  ${quote}${col}${quote} ${getSqlType(sample[col])}`);
    const ddl = `-- 1. 테이블 생성 DDL (${dialect.toUpperCase()})\nCREATE TABLE ${quote}${tableName}${quote} (\n  ${autoInc},\n${ddlColumns.join(',\n')}\n);`;

    const insertStatements = rows.map((row) => {
      const vals = columns.map((col) => {
        const val = row[col];
        if (val === null || val === undefined) return 'NULL';
        if (typeof val === 'number' || typeof val === 'boolean') return `${val}`;
        if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
        return `'${String(val).replace(/'/g, "''")}'`;
      });
      return `INSERT INTO ${quote}${tableName}${quote} (${columns.map((c) => `${quote}${c}${quote}`).join(', ')}) VALUES (${vals.join(', ')});`;
    });

    return `${ddl}\n\n-- 2. 데이터 INSERT 쿼리\n${insertStatements.join('\n')}`;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return `-- SQL 생성 실패 (JSON 문법 확인 필요):\n-- ${msg}`;
  }
}

export function jsonToZodSchema(jsonStr: string, schemaName: string = 'rootSchema'): string {
  try {
    const parsed = JSON.parse(jsonStr);

    const getZodType = (val: unknown): string => {
      if (val === null) return 'z.null()';
      if (typeof val === 'string') return 'z.string()';
      if (typeof val === 'number') return Number.isInteger(val) ? 'z.number().int()' : 'z.number()';
      if (typeof val === 'boolean') return 'z.boolean()';
      if (Array.isArray(val)) {
        if (val.length === 0) return 'z.array(z.unknown())';
        return `z.array(${getZodType(val[0])})`;
      }
      if (typeof val === 'object') {
        const obj = val as Record<string, unknown>;
        const props = Object.entries(obj).map(([k, v]) => `  ${k}: ${getZodType(v)},`);
        return `z.object({\n${props.join('\n')}\n})`;
      }
      return 'z.unknown()';
    };

    const targetObj = Array.isArray(parsed) ? parsed[0] || {} : parsed;
    const body = Object.entries(targetObj).map(([k, v]) => `  ${k}: ${getZodType(v)},`);

    return `import { z } from 'zod';\n\nexport const ${schemaName} = z.object({\n${body.join('\n')}\n});\n\nexport type ${schemaName.charAt(0).toUpperCase() + schemaName.slice(1)}Type = z.infer<typeof ${schemaName}>;`;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return `// Zod 변환 실패: ${msg}`;
  }
}

export function jsonToYaml(jsonStr: string): string {
  try {
    const parsed = JSON.parse(jsonStr);

    const stringifyYaml = (obj: unknown, indentLevel = 0): string => {
      const indent = '  '.repeat(indentLevel);
      if (obj === null) return 'null';
      if (typeof obj === 'string') {
        return obj.includes('\n') || obj.includes(':') ? `"${obj.replace(/"/g, '\\"')}"` : obj;
      }
      if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
      if (Array.isArray(obj)) {
        if (obj.length === 0) return '[]';
        return obj
          .map((item) => `${indent}- ${stringifyYaml(item, indentLevel + 1).trimStart()}`)
          .join('\n');
      }
      if (typeof obj === 'object') {
        const entries = Object.entries(obj as Record<string, unknown>);
        if (entries.length === 0) return '{}';
        return entries
          .map(([key, val]) => {
            if (typeof val === 'object' && val !== null) {
              return `${indent}${key}:\n${stringifyYaml(val, indentLevel + 1)}`;
            }
            return `${indent}${key}: ${stringifyYaml(val, 0)}`;
          })
          .join('\n');
      }
      return String(obj);
    };

    return stringifyYaml(parsed);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return `# YAML 변환 실패: ${msg}`;
  }
}

export function jsonToCsv(jsonStr: string): string {
  try {
    const parsed = JSON.parse(jsonStr);
    const rows: Record<string, unknown>[] = Array.isArray(parsed) ? parsed : [parsed];
    if (rows.length === 0) return '';

    const headers = Object.keys(rows[0]);
    const escapeCsv = (val: unknown) => {
      if (val === null || val === undefined) return '';
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headerLine = headers.map(escapeCsv).join(',');
    const dataLines = rows.map((row) => headers.map((h) => escapeCsv(row[h])).join(','));

    return [headerLine, ...dataLines].join('\n');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return `CSV 변환 실패: ${msg}`;
  }
}

export const SAMPLE_SCHEMAS = [
  {
    name: 'E-Commerce 주문 결제 내역',
    json: JSON.stringify(
      [
        {
          orderId: 'ORD-2026-98124',
          user: {
            id: 1042,
            name: '김개발',
            email: 'dev_kim@ultraoffice.com',
            tier: 'VIP',
          },
          items: [
            { productId: 'P-101', name: '울트라 모니터 34인치', price: 489000, quantity: 1 },
            { productId: 'P-302', name: '기계식 무소음 키보드', price: 125000, quantity: 2 },
          ],
          totalAmount: 739000,
          payment: {
            method: 'KAKAOPAY',
            status: 'COMPLETED',
            paidAt: '2026-08-29T14:30:00Z',
          },
          isDelivered: false,
        },
      ],
      null,
      2
    ),
  },
  {
    name: 'API 응답 (User & Company)',
    json: JSON.stringify(
      {
        status: 200,
        message: 'Success',
        data: {
          id: 550,
          username: 'hong_gildong',
          profile: {
            avatar: 'https://ultraoffice.com/avatar.png',
            bio: '풀스택 엔지니어 & 아키텍트',
            yearsOfExp: 7,
          },
          skills: ['TypeScript', 'React', 'Next.js', 'Go', 'Docker'],
          company: {
            name: '울트라오피스 주식회사',
            address: '서울특별시 강남구 테헤란로 123',
            isEnterprise: true,
          },
        },
        meta: {
          requestId: 'req_8f19-4a2b',
          timestamp: 1735689600,
        },
      },
      null,
      2
    ),
  },
];

// ----------------------------------------------------------------------
// 5. Korean Regular Expression Presets
// ----------------------------------------------------------------------
export const REGEX_PRESETS = [
  {
    name: '주민등록번호 (한국)',
    pattern: '\\d{6}-[1-4]\\d{6}',
    example: '900101-1234567 및 020512-3849102',
    description: '생년월일 6자리와 뒷자리 성별 구분 7자리',
  },
  {
    name: '사업자등록번호 (한국)',
    pattern: '\\d{3}-\\d{2}-\\d{5}',
    example: '주식회사 울트라오피스 123-45-67890 및 987-65-43210',
    description: '3자리-2자리-5자리 총 10자리 사업자등록번호',
  },
  {
    name: '법인등록번호 (한국)',
    pattern: '\\d{6}-\\d{7}',
    example: '법인번호 110111-1234567 확인',
    description: '6자리-7자리 총 13자리 법인등록번호',
  },
  {
    name: '휴대폰 번호 (010/011)',
    pattern: '01[016789]-\\d{3,4}-\\d{4}',
    example: '대표번호 010-1234-5678, 비상연락망 010-9876-5432',
    description: '010, 011 등으로 시작하는 국내 이동통신 번호',
  },
  {
    name: '일반 전화번호 (지역번호)',
    pattern: '0(?:2|3[1-3]|4[1-4]|5[1-5]|6[1-4])-\\d{3,4}-\\d{4}',
    example: '서울본사 02-1234-5678, 경기지사 031-987-6543',
    description: '02, 031, 051 등 전국 유선 지역번호 체계',
  },
  {
    name: '이메일 주소 (Email)',
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    example: '문의 메일 dev@ultraoffice.com 또는 support.team@service.co.kr',
    description: '표준 이메일 주소 형식',
  },
  {
    name: 'IPv4 주소',
    pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b',
    example: '서버 IP는 192.168.0.1 및 게이트웨이 10.0.0.254',
    description: '4개의 0~255 숫자 옥텟으로 구성된 IP 주소',
  },
  {
    name: '신용카드 번호 (16자리)',
    pattern: '\\b(?:\\d{4}[-\\s]?){3}\\d{4}\\b',
    example: '카드 결제 승인: 1234-5678-9012-3456 (유효)',
    description: '4자리씩 4개 묶음 16자리 카드 번호',
  },
  {
    name: '강력한 비밀번호 규칙',
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{}|;:,.<>?]).{8,32}$',
    example: 'P@ssw0rd2026!#Ultra',
    description: '영문 대소문자 + 숫자 + 특수문자 조합 8~32자',
  },
  {
    name: '웹 URL (http/https)',
    pattern:
      'https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)',
    example: '공식 웹사이트: https://ultraoffice.com/dev-tools?mode=studio',
    description: 'HTTP / HTTPS 프로토콜 웹 링크 주소',
  },
];

// ----------------------------------------------------------------------
// 6. Random Generators (Password / UUID / NanoID / CUID / Lorem)
// ----------------------------------------------------------------------
function getRandomBytes(size: number): Uint8Array {
  const bytes = new Uint8Array(size);
  if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.getRandomValues === 'function') {
    window.crypto.getRandomValues(bytes);
  } else if (typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < size; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return bytes;
}

export interface PasswordOptions {
  length: number;
  upper: boolean;
  lower: boolean;
  digits: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

export function generateRandomPassword(
  options: PasswordOptions = {
    length: 20,
    upper: true,
    lower: true,
    digits: true,
    symbols: true,
    excludeAmbiguous: false,
  }
): { password: string; entropyScore: number; strength: '취약' | '보통' | '강력' | '매우 강력' } {
  let upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let lowerChars = 'abcdefghijklmnopqrstuvwxyz';
  let digitChars = '0123456789';
  let symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (options.excludeAmbiguous) {
    upperChars = upperChars.replace(/[IO]/g, '');
    lowerChars = lowerChars.replace(/[l]/g, '');
    digitChars = digitChars.replace(/[01]/g, '');
    symbolChars = symbolChars.replace(/[|;:,.<>]/g, '');
  }

  let pool = '';
  if (options.upper) pool += upperChars;
  if (options.lower) pool += lowerChars;
  if (options.digits) pool += digitChars;
  if (options.symbols) pool += symbolChars;

  if (!pool) pool = lowerChars + digitChars;

  const randBytes = getRandomBytes(options.length * 4);
  const values = new Uint32Array(randBytes.buffer, randBytes.byteOffset, options.length);

  let pwd = '';
  for (let i = 0; i < options.length; i += 1) {
    pwd += pool[values[i] % pool.length];
  }

  const poolSize = pool.length;
  const entropy = Math.round(options.length * Math.log2(poolSize));
  let strength: '취약' | '보통' | '강력' | '매우 강력' = '취약';
  if (entropy >= 80) strength = '매우 강력';
  else if (entropy >= 60) strength = '강력';
  else if (entropy >= 40) strength = '보통';

  return { password: pwd, entropyScore: entropy, strength };
}

export function generateUuidV4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function generateUuidV7(): string {
  const timestamp = Date.now();
  const hexTime = timestamp.toString(16).padStart(12, '0');
  const part1 = hexTime.slice(0, 8);
  const part2 = hexTime.slice(8, 12);

  const randBytes = getRandomBytes(10);
  const toHex = (b: number) => b.toString(16).padStart(2, '0');

  const randHex = Array.from(randBytes, toHex).join('');
  const ver = '7';
  const varBits = (parseInt(randHex.slice(4, 6), 16) & 0x3f) | 0x80;
  const varHex = varBits.toString(16).padStart(2, '0');

  return `${part1}-${part2}-${ver}${randHex.slice(1, 4)}-${varHex}${randHex.slice(6, 8)}-${randHex.slice(8, 20)}`;
}

export function generateNanoId(size: number = 21): string {
  const urlAlphabet = 'useandom-26T1983_40STOpfunkgjqhkZLTXRnp_A-E0123456789';
  const bytes = getRandomBytes(size);
  let id = '';
  for (let i = 0; i < size; i += 1) {
    id += urlAlphabet[bytes[i] % urlAlphabet.length];
  }
  return id;
}

export function generateCuid(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `c${timestamp}${randomPart}`;
}

export function generateLoremIpsum(type: 'ko' | 'en' = 'ko', count: number = 3): string {
  const koSentences = [
    '모든 사용자는 안전하고 직관적인 업무 환경을 경험할 권리가 있습니다.',
    '클라우드와 로컬 브라우저 기술의 조화로 데이터 보안과 처리 속도를 극대화합니다.',
    '빠른 피드백과 견고한 아키텍처는 현대 소프트웨어 개발의 핵심 가치입니다.',
    '정확한 타입 정의와 철저한 예외 처리가 안정적인 시스템을 완성합니다.',
    '다양한 실무 도구를 하나의 통합 플랫폼에서 원클릭으로 손쉽게 활용하세요.',
    '효율적인 비즈니스 워크플로우를 위해 설계된 최적의 오피스 도구 모음입니다.',
  ];

  const enSentences = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  ];

  const list = type === 'ko' ? koSentences : enSentences;
  const result: string[] = [];
  for (let i = 0; i < count; i += 1) {
    result.push(list[i % list.length]);
  }
  return result.join(' ');
}

// ----------------------------------------------------------------------
// 7. Web & Network Utilities (Epoch / HTTP Status / cURL Converter)
// ----------------------------------------------------------------------
export function timestampToDate(timestamp: number): {
  kst: string;
  utc: string;
  iso: string;
  rel: string;
} {
  const ms = timestamp > 9999999999 ? timestamp : timestamp * 1000;
  const date = new Date(ms);

  const kst = date.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  const utc = date.toUTCString();
  const iso = date.toISOString();

  const diffMs = Date.now() - ms;
  const diffSec = Math.floor(diffMs / 1000);
  let rel = '';
  if (Math.abs(diffSec) < 60) {
    rel = diffSec >= 0 ? `${diffSec}초 전` : `${Math.abs(diffSec)}초 후`;
  } else if (Math.abs(diffSec) < 3600) {
    const mins = Math.floor(Math.abs(diffSec) / 60);
    rel = diffSec >= 0 ? `${mins}분 전` : `${mins}분 후`;
  } else if (Math.abs(diffSec) < 86400) {
    const hours = Math.floor(Math.abs(diffSec) / 3600);
    rel = diffSec >= 0 ? `${hours}시간 전` : `${hours}시간 후`;
  } else {
    const days = Math.floor(Math.abs(diffSec) / 86400);
    rel = diffSec >= 0 ? `${days}일 전` : `${days}일 후`;
  }

  return { kst, utc, iso, rel };
}

export function dateToTimestamp(dateStr: string): { seconds: number; milliseconds: number } | null {
  const parsed = Date.parse(dateStr);
  if (Number.isNaN(parsed)) return null;
  return { seconds: Math.floor(parsed / 1000), milliseconds: parsed };
}

export const HTTP_STATUS_CODES = [
  { code: 200, name: 'OK', desc: '요청이 성공적으로 처리되었습니다.', cat: '2xx 성공' },
  {
    code: 201,
    name: 'Created',
    desc: '새로운 리소스가 성공적으로 생성되었습니다.',
    cat: '2xx 성공',
  },
  {
    code: 204,
    name: 'No Content',
    desc: '요청 성공 후 반환할 본문 데이터가 없습니다.',
    cat: '2xx 성공',
  },
  {
    code: 301,
    name: 'Moved Permanently',
    desc: '지정한 리소스가 새 URI로 영구 이동되었습니다.',
    cat: '3xx 리다이렉트',
  },
  {
    code: 302,
    name: 'Found',
    desc: '지정한 리소스가 다른 URI에 일시적으로 위치합니다.',
    cat: '3xx 리다이렉트',
  },
  {
    code: 304,
    name: 'Not Modified',
    desc: '캐시된 버전이 최신 상태여서 본문을 재전송하지 않습니다.',
    cat: '3xx 리다이렉트',
  },
  {
    code: 400,
    name: 'Bad Request',
    desc: '클라이언트의 요청 구문이 잘못되었습니다.',
    cat: '4xx 클라이언트 오류',
  },
  {
    code: 401,
    name: 'Unauthorized',
    desc: '인증 토큰 또는 로그인이 필요합니다.',
    cat: '4xx 클라이언트 오류',
  },
  {
    code: 403,
    name: 'Forbidden',
    desc: '해당 리소스에 접근할 권한이 없습니다.',
    cat: '4xx 클라이언트 오류',
  },
  {
    code: 404,
    name: 'Not Found',
    desc: '요청한 URI 리소스를 찾을 수 없습니다.',
    cat: '4xx 클라이언트 오류',
  },
  {
    code: 405,
    name: 'Method Not Allowed',
    desc: '해당 엔드포인트에서 지원하지 않는 HTTP 메서드입니다.',
    cat: '4xx 클라이언트 오류',
  },
  {
    code: 409,
    name: 'Conflict',
    desc: '서버의 현재 상태와 충돌이 발생했습니다.',
    cat: '4xx 클라이언트 오류',
  },
  {
    code: 422,
    name: 'Unprocessable Entity',
    desc: '구문은 맞으나 유효성 검증 규칙을 통과하지 못했습니다.',
    cat: '4xx 클라이언트 오류',
  },
  {
    code: 429,
    name: 'Too Many Requests',
    desc: '요청 횟수 제한(Rate Limit)을 초과했습니다.',
    cat: '4xx 클라이언트 오류',
  },
  {
    code: 500,
    name: 'Internal Server Error',
    desc: '서버 내부 로직 오류가 발생했습니다.',
    cat: '5xx 서버 오류',
  },
  {
    code: 502,
    name: 'Bad Gateway',
    desc: '게이트웨이/프록시 서버가 상위 서버로부터 잘못된 응답을 받았습니다.',
    cat: '5xx 서버 오류',
  },
  {
    code: 503,
    name: 'Service Unavailable',
    desc: '서버 점검 또는 과부하로 일시적 서비스 중단 상태입니다.',
    cat: '5xx 서버 오류',
  },
  {
    code: 504,
    name: 'Gateway Timeout',
    desc: '상위 서버의 응답 시간이 초과되었습니다.',
    cat: '5xx 서버 오류',
  },
];

export function curlToFetch(curlCommand: string): string {
  try {
    const cleaned = curlCommand.trim().replace(/\\\n/g, ' ');
    const urlMatch = cleaned.match(/curl\s+(?:-[A-Za-z0-9-]+\s+)*['"]?([^'"]+)['"]?/);
    const url = urlMatch ? urlMatch[1] : 'https://api.example.com/v1/data';

    let method = 'GET';
    const methodMatch = cleaned.match(/-X\s+([A-Z]+)/i);
    if (methodMatch) method = methodMatch[1].toUpperCase();

    const headers: Record<string, string> = {};
    const headerRegex = /-H\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = headerRegex.exec(cleaned)) !== null) {
      const parts = match[1].split(':');
      if (parts.length >= 2) {
        headers[parts[0].trim()] = parts.slice(1).join(':').trim();
      }
    }

    let dataBody: string | null = null;
    const dataMatch = cleaned.match(/(?:-d|--data|--data-raw)\s+['"]([^'"]+)['"]/);
    if (dataMatch) {
      dataBody = dataMatch[1];
      if (!methodMatch) method = 'POST';
    }

    const fetchOptions: Record<string, unknown> = { method };
    if (Object.keys(headers).length > 0) fetchOptions.headers = headers;
    if (dataBody) {
      try {
        fetchOptions.body = `JSON.stringify(${JSON.stringify(JSON.parse(dataBody), null, 2)})`;
      } catch {
        fetchOptions.body = `'${dataBody.replace(/'/g, "\\'")}'`;
      }
    }

    return `// JavaScript Fetch API 코드\nconst response = await fetch('${url}', ${JSON.stringify(fetchOptions, null, 2).replace(/"(JSON\.stringify\([\s\S]*?\))"/g, '$1')});\n\nconst data = await response.json();\nconsole.log(data);`;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return `// cURL 변환 실패: ${msg}`;
  }
}

export function curlToAxios(curlCommand: string): string {
  try {
    const cleaned = curlCommand.trim().replace(/\\\n/g, ' ');
    const urlMatch = cleaned.match(/curl\s+(?:-[A-Za-z0-9-]+\s+)*['"]?([^'"]+)['"]?/);
    const url = urlMatch ? urlMatch[1] : 'https://api.example.com/v1/data';

    let method = 'get';
    const methodMatch = cleaned.match(/-X\s+([A-Z]+)/i);
    if (methodMatch) method = methodMatch[1].toLowerCase();

    const headers: Record<string, string> = {};
    const headerRegex = /-H\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = headerRegex.exec(cleaned)) !== null) {
      const parts = match[1].split(':');
      if (parts.length >= 2) {
        headers[parts[0].trim()] = parts.slice(1).join(':').trim();
      }
    }

    let dataBody: unknown = null;
    const dataMatch = cleaned.match(/(?:-d|--data|--data-raw)\s+['"]([^'"]+)['"]/);
    if (dataMatch) {
      if (!methodMatch) method = 'post';
      try {
        dataBody = JSON.parse(dataMatch[1]);
      } catch {
        dataBody = dataMatch[1];
      }
    }

    const config: Record<string, unknown> = { method, url };
    if (Object.keys(headers).length > 0) config.headers = headers;
    if (dataBody) config.data = dataBody;

    return `import axios from 'axios';\n\nconst { data } = await axios(${JSON.stringify(config, null, 2)});\nconsole.log(data);`;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return `// cURL 변환 실패: ${msg}`;
  }
}
