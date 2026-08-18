import * as yaml from 'js-yaml';
import xml2js from 'xml-js';
import Papa from 'papaparse';
import CryptoJS from 'crypto-js';

export type SupportedDataFormat = 'json' | 'csv' | 'xml' | 'yaml';

export interface FormatConvertOptions {
  jsonIndent?: number;
  csvDelimiter?: ',' | '\t' | ';' | '|';
  csvHeader?: boolean;
  xmlRootName?: string;
  yamlIndent?: number;
}

/**
 * Automatically detect if text is JSON, CSV, XML, or YAML
 */
export function detectFormat(text: string): SupportedDataFormat {
  const trimmed = text.trim();
  if (!trimmed) return 'json';

  // 1. JSON check
  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  ) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {
      // continue
    }
  }

  // 2. XML check
  if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
    try {
      const parsed = xml2js.xml2js(trimmed, { compact: true });
      if (parsed && typeof parsed === 'object') return 'xml';
    } catch {
      // continue
    }
  }

  // 3. YAML check
  if (trimmed.includes(':') && (trimmed.includes('\n') || trimmed.startsWith('- '))) {
    try {
      const parsed = yaml.load(trimmed);
      if (parsed && typeof parsed === 'object') return 'yaml';
    } catch {
      // continue
    }
  }

  // 4. CSV check
  if (trimmed.includes(',') || trimmed.includes('\t') || trimmed.includes(';')) {
    const lines = trimmed.split('\n');
    if (lines.length >= 2) {
      return 'csv';
    }
  }

  return 'json';
}

/**
 * Universal Data Format Converter (JSON, CSV, XML, YAML)
 */
export function convertDataFormat(
  rawText: string,
  sourceFormat: SupportedDataFormat | 'auto',
  targetFormat: SupportedDataFormat,
  options: FormatConvertOptions = {}
): string {
  const trimmed = rawText.trim();
  if (!trimmed) return '';

  const actualSource: SupportedDataFormat =
    sourceFormat === 'auto' ? detectFormat(trimmed) : sourceFormat;

  if (actualSource === targetFormat) {
    return trimmed;
  }

  try {
    let jsObject: unknown;

    // Step 1: Parse Source to JS Object
    if (actualSource === 'json') {
      jsObject = JSON.parse(trimmed);
    } else if (actualSource === 'yaml') {
      jsObject = yaml.load(trimmed);
    } else if (actualSource === 'csv') {
      const parseRes = Papa.parse(trimmed, {
        header: options.csvHeader !== false,
        skipEmptyLines: true,
        dynamicTyping: true,
      });
      jsObject = parseRes.data;
    } else if (actualSource === 'xml') {
      const jsonStr = xml2js.xml2json(trimmed, { compact: true, spaces: 2 });
      jsObject = JSON.parse(jsonStr);
    }

    if (jsObject === undefined) {
      throw new Error('데이터 파싱에 실패했습니다.');
    }

    // Step 2: Format JS Object to Target
    if (targetFormat === 'json') {
      return JSON.stringify(jsObject, null, options.jsonIndent || 2);
    }

    if (targetFormat === 'yaml') {
      return yaml.dump(jsObject, { indent: options.yamlIndent || 2 });
    }

    if (targetFormat === 'csv') {
      let arrayData: unknown[] = [];
      if (Array.isArray(jsObject)) {
        arrayData = jsObject;
      } else if (typeof jsObject === 'object' && jsObject !== null) {
        arrayData = [jsObject];
      }
      return Papa.unparse(arrayData, {
        delimiter: options.csvDelimiter || ',',
        header: options.csvHeader !== false,
      });
    }

    if (targetFormat === 'xml') {
      const rootName = options.xmlRootName || 'root';
      const wrapped =
        typeof jsObject === 'object' && jsObject !== null && !(rootName in jsObject)
          ? { [rootName]: jsObject }
          : jsObject;
      return xml2js.js2xml(wrapped as Record<string, unknown>, { compact: true, spaces: 2 });
    }

    return '';
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return `변환 실패: ${msg}`;
  }
}

// ----------------------------------------------------------------------
// Case Transformations
// ----------------------------------------------------------------------

export function toCamelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/[\s_-]+/g, '');
}

export function toPascalCase(str: string): string {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase()).replace(/[\s_-]+/g, '');
}

export function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

export function toConstantCase(str: string): string {
  return toSnakeCase(str).toUpperCase();
}

export function toTitleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
}

export function toSentenceCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ----------------------------------------------------------------------
// Line & Text Manipulation
// ----------------------------------------------------------------------

export function sortLines(text: string, order: 'asc' | 'desc' = 'asc', numeric = false): string {
  const lines = text.split('\n');
  lines.sort((a, b) => {
    if (numeric) {
      const numA = parseFloat(a) || 0;
      const numB = parseFloat(b) || 0;
      return order === 'asc' ? numA - numB : numB - numA;
    }
    return order === 'asc' ? a.localeCompare(b, 'ko') : b.localeCompare(a, 'ko');
  });
  return lines.join('\n');
}

export function deduplicateLines(text: string): string {
  const lines = text.split('\n');
  const seen = new Set<string>();
  const result: string[] = [];
  lines.forEach((l) => {
    if (!seen.has(l)) {
      seen.add(l);
      result.push(l);
    }
  });
  return result.join('\n');
}

export function addPrefixSuffix(text: string, prefix = '', suffix = ''): string {
  return text
    .split('\n')
    .map((line) => (line.length > 0 ? `${prefix}${line}${suffix}` : line))
    .join('\n');
}

export function trimLines(text: string): string {
  return text
    .split('\n')
    .map((l) => l.trim())
    .join('\n');
}

export function removeEmptyLines(text: string): string {
  return text
    .split('\n')
    .filter((l) => l.trim().length > 0)
    .join('\n');
}

export function joinLines(text: string, delimiter = ', '): string {
  return text
    .split('\n')
    .filter((l) => l.length > 0)
    .join(delimiter);
}

export function splitByDelimiter(text: string, delimiter = ','): string {
  return text
    .split(delimiter)
    .map((s) => s.trim())
    .join('\n');
}

// ----------------------------------------------------------------------
// Encoders / Decoders / Hashes
// ----------------------------------------------------------------------

export function encodeBase64(str: string): string {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    return 'Base64 인코딩 실패';
  }
}

export function decodeBase64(str: string): string {
  try {
    return decodeURIComponent(escape(atob(str)));
  } catch {
    return 'Base64 디코딩 실패 (올바른 Base64 문자열이 아닙니다)';
  }
}

export function encodeUrl(str: string): string {
  return encodeURIComponent(str);
}

export function decodeUrl(str: string): string {
  try {
    return decodeURIComponent(str);
  } catch {
    return 'URL 디코딩 실패';
  }
}

export function encodeHtmlEntities(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function decodeHtmlEntities(str: string): string {
  const doc = new DOMParser().parseFromString(str, 'text/html');
  return doc.documentElement.textContent || '';
}

export function calculateHash(
  str: string,
  algo: 'md5' | 'sha1' | 'sha256' | 'sha512' = 'sha256'
): string {
  if (algo === 'md5') return CryptoJS.MD5(str).toString();
  if (algo === 'sha1') return CryptoJS.SHA1(str).toString();
  if (algo === 'sha256') return CryptoJS.SHA256(str).toString();
  if (algo === 'sha512') return CryptoJS.SHA512(str).toString();
  return '';
}

export function parseJwtToken(
  token: string
): { header: Record<string, unknown>; payload: Record<string, unknown>; signature: string } | null {
  try {
    const parts = token.trim().split('.');
    if (parts.length !== 3) return null;

    const header = JSON.parse(decodeBase64(parts[0]));
    const payload = JSON.parse(decodeBase64(parts[1]));
    const signature = parts[2];

    return { header, payload, signature };
  } catch {
    return null;
  }
}

// ----------------------------------------------------------------------
// JSON Utilities
// ----------------------------------------------------------------------

export function anonymizeJson(
  jsonStr: string,
  sensitiveFields = ['password', 'token', 'ssn', 'resident', 'phone', 'email', 'card', 'secret']
): string {
  try {
    const obj = JSON.parse(jsonStr);

    const maskValue = (val: unknown, keyName: string): unknown => {
      if (typeof val === 'string') {
        const isTargetKey = sensitiveFields.some((f) => keyName.toLowerCase().includes(f));
        if (isTargetKey) {
          if (val.length <= 4) return '****';
          return `${val.slice(0, 2)}****${val.slice(-2)}`;
        }
        return val;
      }
      if (Array.isArray(val)) {
        return val.map((item) => maskValue(item, keyName));
      }
      if (typeof val === 'object' && val !== null) {
        const res: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(val)) {
          res[k] = maskValue(v, k);
        }
        return res;
      }
      return val;
    };

    const masked = maskValue(obj, '');
    return JSON.stringify(masked, null, 2);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return `마스킹 실패: ${msg}`;
  }
}

export function minifyJson(jsonStr: string): string {
  try {
    return JSON.stringify(JSON.parse(jsonStr));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return `압축 실패: ${msg}`;
  }
}

export function formatJson(jsonStr: string, indent = 2): string {
  try {
    return JSON.stringify(JSON.parse(jsonStr), null, indent);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return `포맷팅 실패: ${msg}`;
  }
}

// ----------------------------------------------------------------------
// Rich Presets
// ----------------------------------------------------------------------

export const SAMPLE_JSON_ECOMMERCE = JSON.stringify(
  {
    orderId: 'ORD-2026-8849',
    customer: {
      id: 'USR-772',
      name: '홍길동',
      email: 'gildong.hong@ultraoffice.io',
      phone: '010-9876-5432',
      grade: 'VIP',
    },
    items: [
      { sku: 'ITM-MACBOOK-M3', name: 'MacBook Pro 16형 M3 Max', qty: 1, price: 4890000 },
      { sku: 'ITM-STUDIO-DISP', name: 'Apple Studio Display 27형', qty: 2, price: 2090000 },
      { sku: 'ITM-MX-MASTER-3S', name: 'Logitech MX Master 3S 마우스', qty: 2, price: 139000 },
    ],
    payment: {
      method: 'CARD',
      cardCompany: 'Hyundai Card M',
      cardNumber: '5424-****-****-9102',
      totalAmount: 9348000,
      vat: 849818,
      status: 'PAID',
      paidAt: '2026-08-18T14:30:00Z',
    },
    shipping: {
      address: '서울특별시 강남구 테헤란로 152 강남파이낸스센터 24층',
      postalCode: '06236',
      carrier: 'CJ대한통운',
      trackingNumber: '689201948271',
    },
  },
  null,
  2
);

export const SAMPLE_CSV_EMPLOYEES = `사원번호,성명,부서,직급,이메일,입사일,평가등급
EMP001,김민수,플랫폼개발팀,수석연구원,minsu.kim@company.com,2021-03-02,S
EMP002,이지은,글로벌마케팅팀,책임연구원,jieun.lee@company.com,2022-07-15,A
EMP003,박서준,디자인전략실,선임연구원,seojun.park@company.com,2023-01-09,A
EMP004,정유나,인사기획팀,책임연구원,yuna.jung@company.com,2020-11-01,S
EMP005,최동욱,재무회계팀,수석연구원,dongwook.choi@company.com,2019-05-20,B`;

export const SAMPLE_YAML_KUBERNETES = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ultra-office-backend
  namespace: production
  labels:
    app: ultra-office
    tier: api
spec:
  replicas: 5
  selector:
    matchLabels:
      app: ultra-office
  template:
    metadata:
      labels:
        app: ultra-office
    spec:
      containers:
        - name: api-server
          image: registry.ultraoffice.io/office-api:v2.4.0
          ports:
            - containerPort: 8080
          resources:
            limits:
              cpu: "2"
              memory: "4Gi"
            requests:
              cpu: "500m"
              memory: "1Gi"
          env:
            - name: NODE_ENV
              value: "production"
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: db-secret
                  key: connection-string`;

export const SAMPLE_XML_INVOICE = `<?xml version="1.0" encoding="UTF-8"?>
<invoice id="INV-20260818-01">
  <supplier>
    <companyName>(주)울트라 오피스 솔루션</companyName>
    <bizNumber>120-88-99482</bizNumber>
    <ceo>김대표</ceo>
    <address>서울특별시 영등포구 여의대로 108</address>
  </supplier>
  <buyer>
    <companyName>(주)글로벌 파트너스</companyName>
    <bizNumber>214-85-12345</bizNumber>
    <ceo>이성진</ceo>
  </buyer>
  <items>
    <item>
      <name>클라우드 엔터프라이즈 라이선스 (1년)</name>
      <qty>100</qty>
      <unitPrice>360000</unitPrice>
      <amount>36000000</amount>
    </item>
    <item>
      <name>온보딩 기술 컨설팅 지원</name>
      <qty>1</qty>
      <unitPrice>5000000</unitPrice>
      <amount>5000000</amount>
    </item>
  </items>
  <summary>
    <supplyValue>41000000</supplyValue>
    <vat>4100000</vat>
    <totalAmount>45100000</totalAmount>
  </summary>
</invoice>`;
