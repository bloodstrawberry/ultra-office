import type {
  HttpMethod,
  ProxyMode,
  KeyValueParam,
  ApiResponseData,
  ApiRequestConfig,
} from '../types';

/**
 * URL에 활성화된 쿼리 파라미터를 결합하여 완성된 요청 URL을 생성합니다.
 */
export function buildRequestUrl(url: string, params: KeyValueParam[]): string {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return '';

  const activeParams = params.filter((p) => p.enabled && p.key.trim().length > 0);
  if (activeParams.length === 0) return trimmedUrl;

  try {
    const urlObj = new URL(trimmedUrl);
    activeParams.forEach((p) => {
      urlObj.searchParams.append(p.key.trim(), p.value);
    });
    return urlObj.toString();
  } catch {
    // If URL is relative or invalid protocol, manually append
    const searchParams = new URLSearchParams();
    activeParams.forEach((p) => {
      searchParams.append(p.key.trim(), p.value);
    });
    const separator = trimmedUrl.includes('?') ? '&' : '?';
    return `${trimmedUrl}${separator}${searchParams.toString()}`;
  }
}

/**
 * 프록시 모드에 따라 실제 브라우저가 호출할 엔드포인트 URL을 반환합니다.
 */
export function getEffectiveUrl(
  targetUrl: string,
  proxyMode: ProxyMode,
  customProxyUrl: string
): string {
  if (proxyMode === 'direct') {
    return targetUrl;
  }
  if (proxyMode === 'corsproxy') {
    return `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`;
  }
  if (proxyMode === 'allorigins') {
    return `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
  }
  if (proxyMode === 'custom' && customProxyUrl.trim()) {
    const custom = customProxyUrl.trim();
    if (custom.includes('{{url}}')) {
      return custom.replace('{{url}}', encodeURIComponent(targetUrl));
    }
    const sep = custom.includes('?') ? '&' : '?';
    return `${custom}${sep}url=${encodeURIComponent(targetUrl)}`;
  }
  return targetUrl;
}

/**
 * 실제 API 요청을 수행하고 응답 결과(상태, 헤더, 데이터, 지연시간 등)를 측정하여 반환합니다.
 */
export async function executeApiRequest(
  config: ApiRequestConfig,
  signal?: AbortSignal
): Promise<ApiResponseData> {
  const fullUrl = buildRequestUrl(config.url, config.params);
  if (!fullUrl) {
    throw new Error('요청할 API URL을 입력해 주세요.');
  }

  const effectiveUrl = getEffectiveUrl(fullUrl, config.proxyMode, config.customProxyUrl);

  const headerObj: Record<string, string> = {};
  config.headers
    .filter((h) => h.enabled && h.key.trim().length > 0)
    .forEach((h) => {
      headerObj[h.key.trim()] = h.value;
    });

  const requestInit: RequestInit = {
    method: config.method,
    headers: headerObj,
    signal,
  };

  if (!['GET', 'HEAD'].includes(config.method) && config.body.trim()) {
    requestInit.body = config.body;
  }

  const startTime = performance.now();

  try {
    const response = await fetch(effectiveUrl, requestInit);
    const endTime = performance.now();
    const timeMs = Math.round(endTime - startTime);

    const respHeaders: Record<string, string> = {};
    response.headers.forEach((val, key) => {
      respHeaders[key] = val;
    });

    const contentType = response.headers.get('content-type') || '';
    const isImage = contentType.startsWith('image/');

    if (isImage) {
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      return {
        status: response.status,
        statusText: response.statusText || 'OK',
        timeMs,
        sizeBytes: blob.size,
        headers: respHeaders,
        data: { imageBlobUrl: imageUrl, size: blob.size, type: blob.type },
        rawText: `[Image binary data: ${blob.type}, ${blob.size} bytes]`,
        isImage: true,
        imageUrl,
        contentType,
      };
    }

    const rawText = await response.text();
    const sizeBytes = new Blob([rawText]).size;

    let parsedData: unknown = null;
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      parsedData = rawText;
    }

    return {
      status: response.status,
      statusText: response.statusText || (response.ok ? 'OK' : 'Error'),
      timeMs,
      sizeBytes,
      headers: respHeaders,
      data: parsedData,
      rawText,
      isImage: false,
      contentType,
    };
  } catch (err: unknown) {
    const endTime = performance.now();
    const timeMs = Math.round(endTime - startTime);
    const errorMessage = err instanceof Error ? err.message : String(err);

    // Provide friendly CORS guidance if failed to fetch
    const isFetchError = errorMessage.toLowerCase().includes('fetch');
    const corsHint = isFetchError
      ? ' (💡 브라우저 CORS 정책으로 차단되었을 수 있습니다. 상단의 "CORS 프록시" 옵션을 활성화하여 다시 시도해 보세요.)'
      : '';

    return {
      status: 0,
      statusText: 'Network / CORS Error',
      timeMs,
      sizeBytes: 0,
      headers: {},
      data: null,
      rawText: `${errorMessage}${corsHint}`,
      isImage: false,
      contentType: 'text/plain',
      error: `${errorMessage}${corsHint}`,
    };
  }
}

/**
 * cURL 명령어 문자열을 생성합니다.
 */
export function generateCurl(config: ApiRequestConfig): string {
  const fullUrl = buildRequestUrl(config.url, config.params);
  let cmd = `curl -X ${config.method} "${fullUrl}"`;

  const activeHeaders = config.headers.filter((h) => h.enabled && h.key.trim().length > 0);
  activeHeaders.forEach((h) => {
    cmd += ` \\\n  -H "${h.key.trim()}: ${h.value}"`;
  });

  if (!['GET', 'HEAD'].includes(config.method) && config.body.trim()) {
    const escapedBody = config.body.replace(/"/g, '\\"');
    cmd += ` \\\n  -d "${escapedBody}"`;
  }

  return cmd;
}

/**
 * Fetch API (JavaScript / TypeScript) 코드 스니펫을 생성합니다.
 */
export function generateFetch(config: ApiRequestConfig): string {
  const fullUrl = buildRequestUrl(config.url, config.params);
  const activeHeaders = config.headers.filter((h) => h.enabled && h.key.trim().length > 0);

  const headersObj: Record<string, string> = {};
  activeHeaders.forEach((h) => {
    headersObj[h.key.trim()] = h.value;
  });

  const hasHeaders = Object.keys(headersObj).length > 0;
  const hasBody = !['GET', 'HEAD'].includes(config.method) && config.body.trim().length > 0;

  let code = `const response = await fetch('${fullUrl}', {\n  method: '${config.method}',`;

  if (hasHeaders) {
    code += `\n  headers: ${JSON.stringify(headersObj, null, 4).replace(/\n/g, '\n  ')},`;
  }

  if (hasBody) {
    try {
      JSON.parse(config.body);
      code += `\n  body: JSON.stringify(${config.body.replace(/\n/g, '\n  ')}),`;
    } catch {
      code += `\n  body: \`${config.body.replace(/`/g, '\\`')}\`,`;
    }
  }

  code += `\n});\n\nconst data = await response.json();\nconsole.log(data);`;
  return code;
}

/**
 * Axios 코드 스니펫을 생성합니다.
 */
export function generateAxios(config: ApiRequestConfig): string {
  const fullUrl = buildRequestUrl(config.url, config.params);
  const activeHeaders = config.headers.filter((h) => h.enabled && h.key.trim().length > 0);

  const headersObj: Record<string, string> = {};
  activeHeaders.forEach((h) => {
    headersObj[h.key.trim()] = h.value;
  });

  const hasHeaders = Object.keys(headersObj).length > 0;
  const hasBody = !['GET', 'HEAD'].includes(config.method) && config.body.trim().length > 0;

  let code = `import axios from 'axios';\n\n`;
  code += `const config = {\n  method: '${config.method.toLowerCase()}',\n  url: '${fullUrl}',`;

  if (hasHeaders) {
    code += `\n  headers: ${JSON.stringify(headersObj, null, 4).replace(/\n/g, '\n  ')},`;
  }

  if (hasBody) {
    try {
      JSON.parse(config.body);
      code += `\n  data: ${config.body.replace(/\n/g, '\n  ')},`;
    } catch {
      code += `\n  data: \`${config.body.replace(/`/g, '\\`')}\`,`;
    }
  }

  code += `\n};\n\nconst response = await axios(config);\nconsole.log(response.data);`;
  return code;
}

/**
 * Python requests 코드 스니펫을 생성합니다.
 */
export function generatePython(config: ApiRequestConfig): string {
  const fullUrl = buildRequestUrl(config.url, config.params);
  const activeHeaders = config.headers.filter((h) => h.enabled && h.key.trim().length > 0);

  let code = `import requests\n\n`;
  code += `url = "${fullUrl}"\n`;

  if (activeHeaders.length > 0) {
    code += `headers = {\n`;
    activeHeaders.forEach((h) => {
      code += `    "${h.key.trim()}": "${h.value.replace(/"/g, '\\"')}",\n`;
    });
    code += `}\n`;
  } else {
    code += `headers = {}\n`;
  }

  const hasBody = !['GET', 'HEAD'].includes(config.method) && config.body.trim().length > 0;

  if (hasBody) {
    try {
      const parsed = JSON.parse(config.body);
      code += `payload = ${JSON.stringify(parsed, null, 4).replace(/true/g, 'True').replace(/false/g, 'False').replace(/null/g, 'None')}\n\n`;
      code += `response = requests.${config.method.toLowerCase()}(url, headers=headers, json=payload)\n`;
    } catch {
      code += `payload = """${config.body}"""\n\n`;
      code += `response = requests.${config.method.toLowerCase()}(url, headers=headers, data=payload)\n`;
    }
  } else {
    code += `\nresponse = requests.${config.method.toLowerCase()}(url, headers=headers)\n`;
  }

  code += `print(response.status_code)\nprint(response.json())`;
  return code;
}

/**
 * JSON 응답 객체로부터 깔끔한 TypeScript Interface 선언 코드를 추론하여 생성합니다.
 */
export function jsonToTypeScriptInterface(
  jsonData: unknown,
  rootName: string = 'ApiResponse'
): string {
  if (jsonData === null || jsonData === undefined) {
    return `export interface ${rootName} {\n  data: null;\n}`;
  }

  const interfaces: string[] = [];

  function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function sanitizeKey(key: string): string {
    return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `'${key}'`;
  }

  function inferType(val: unknown, keyHint: string): string {
    if (val === null) return 'null | unknown';
    if (val === undefined) return 'undefined';

    const t = typeof val;
    if (t === 'string') return 'string';
    if (t === 'number') return 'number';
    if (t === 'boolean') return 'boolean';

    if (Array.isArray(val)) {
      if (val.length === 0) return 'unknown[]';
      const elemType = inferType(val[0], `${keyHint}Item`);
      return `${elemType}[]`;
    }

    if (t === 'object') {
      const subInterfaceName = capitalize(keyHint);
      buildInterface(val as Record<string, unknown>, subInterfaceName);
      return subInterfaceName;
    }

    return 'unknown';
  }

  function buildInterface(obj: Record<string, unknown>, name: string) {
    const keys = Object.keys(obj);
    if (keys.length === 0) {
      interfaces.push(`export interface ${name} {\n  [key: string]: unknown;\n}`);
      return;
    }

    const lines: string[] = [];
    keys.forEach((k) => {
      const fieldType = inferType(obj[k], k);
      lines.push(`  ${sanitizeKey(k)}: ${fieldType};`);
    });

    interfaces.push(`export interface ${name} {\n${lines.join('\n')}\n}`);
  }

  if (Array.isArray(jsonData)) {
    if (jsonData.length > 0 && typeof jsonData[0] === 'object' && jsonData[0] !== null) {
      buildInterface(jsonData[0] as Record<string, unknown>, `${rootName}Item`);
      interfaces.push(`export type ${rootName} = ${rootName}Item[];`);
    } else {
      interfaces.push(`export type ${rootName} = unknown[];`);
    }
  } else if (typeof jsonData === 'object') {
    buildInterface(jsonData as Record<string, unknown>, rootName);
  } else {
    interfaces.push(`export type ${rootName} = ${typeof jsonData};`);
  }

  return interfaces.reverse().join('\n\n');
}
