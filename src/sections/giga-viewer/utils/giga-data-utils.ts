import { loadAlaSql } from 'src/utils/alasql-loader';

import type { LogEntry, LogLevel, GigaFileSummary, GigaFilterOptions } from '../types';

// ----------------------------------------------------------------------

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Detect log level from line string
 */
export function detectLogLevel(line: string): LogLevel {
  const upper = line.toUpperCase();
  if (
    upper.includes('ERROR') ||
    upper.includes('FATAL') ||
    upper.includes('EXCEPTION') ||
    upper.includes('FAIL') ||
    upper.includes('CRITICAL')
  ) {
    return 'ERROR';
  }
  if (upper.includes('WARN') || upper.includes('WARNING')) {
    return 'WARN';
  }
  if (upper.includes('DEBUG') || upper.includes('TRACE')) {
    return 'DEBUG';
  }
  return 'INFO';
}

/**
 * Extract ISO timestamp from string
 */
export function extractTimestamp(line: string): string | undefined {
  const match =
    line.match(/\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(\.\d{1,3})?/) ||
    line.match(/\[\d{2}:\d{2}:\d{2}\]/);
  return match ? match[0] : undefined;
}

/**
 * Parse raw text into structured LogEntry array
 */
export function parseLogText(
  rawText: string,
  fileName: string = 'server.log'
): { entries: LogEntry[]; summary: GigaFileSummary } {
  const lines = rawText.split(/\r?\n/);
  const entries: LogEntry[] = [];
  let errorCount = 0;
  let warnCount = 0;
  let infoCount = 0;
  let debugCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw.trim()) continue;

    const level = detectLogLevel(raw);
    const timestamp = extractTimestamp(raw);

    if (level === 'ERROR') errorCount++;
    else if (level === 'WARN') warnCount++;
    else if (level === 'DEBUG') debugCount++;
    else infoCount++;

    entries.push({
      id: i + 1,
      raw,
      level,
      timestamp,
      message: raw,
    });
  }

  const summary: GigaFileSummary = {
    fileName,
    fileSize: formatBytes(new Blob([rawText]).size),
    totalLines: entries.length,
    errorCount,
    warnCount,
    infoCount,
    debugCount,
  };

  return { entries, summary };
}

/**
 * Filter log entries
 */
export function filterLogEntries(entries: LogEntry[], filters: GigaFilterOptions): LogEntry[] {
  let result = entries;

  // Level filter
  if (filters.selectedLevel !== 'ALL') {
    result = result.filter((e) => e.level === filters.selectedLevel);
  }

  // Keyword / Regex filter
  if (filters.searchKeyword.trim()) {
    const kw = filters.searchKeyword.trim();
    if (filters.isRegex) {
      try {
        const regex = new RegExp(kw, filters.caseSensitive ? 'g' : 'gi');
        result = result.filter((e) => regex.test(e.raw));
      } catch {
        // Fallback to plain search on invalid regex
        result = result.filter((e) =>
          filters.caseSensitive
            ? e.raw.includes(kw)
            : e.raw.toLowerCase().includes(kw.toLowerCase())
        );
      }
    } else {
      result = result.filter((e) =>
        filters.caseSensitive ? e.raw.includes(kw) : e.raw.toLowerCase().includes(kw.toLowerCase())
      );
    }
  }

  return result;
}

/**
 * Execute AlaSQL query on log entries
 */
export async function executeLogSql(entries: LogEntry[], sqlQuery: string): Promise<LogEntry[]> {
  try {
    const alasqlInstance = await loadAlaSql();
    if (!alasqlInstance) {
      throw new Error('AlaSQL 엔진을 로드할 수 없습니다.');
    }
    const res = alasqlInstance(sqlQuery, [entries]);
    if (Array.isArray(res)) return res as LogEntry[];
    return [];
  } catch (err) {
    throw err;
  }
}

/**
 * Generate built-in realistic mock logs (2,000 lines) for instant demo
 */
export function generateSampleLogs(): string {
  const services = [
    'auth-service',
    'payment-gateway',
    'order-processor',
    'inventory-db',
    'notification-worker',
  ];
  const logLines: string[] = [];
  const now = Date.now();

  for (let i = 0; i < 2500; i++) {
    const time = new Date(now - (2500 - i) * 800).toISOString();
    const s = services[i % services.length];
    const rand = Math.random();

    if (rand < 0.08) {
      logLines.push(
        `[${time}] [ERROR] [${s}] ConnectionTimeoutException: Failed to connect to Redis cluster after 3000ms at node-02.internal`
      );
    } else if (rand < 0.18) {
      logLines.push(
        `[${time}] [WARN] [${s}] MemoryUsageWarning: Heap memory exceeded 85% threshold (allocated: 1.8GB / 2.0GB)`
      );
    } else if (rand < 0.25) {
      logLines.push(
        `[${time}] [DEBUG] [${s}] Executed DB query in 12ms: SELECT * FROM users WHERE user_id = ${1000 + i}`
      );
    } else {
      logLines.push(
        `[${time}] [INFO] [${s}] HTTP 200 OK POST /api/v2/orders/checkout txn_id=TXN-${20260000 + i} status=SUCCESS (duration: 45ms)`
      );
    }
  }

  return logLines.join('\n');
}
