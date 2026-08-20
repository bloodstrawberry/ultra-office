export type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'ALL';

export interface LogEntry {
  id: number;
  raw: string;
  level: LogLevel;
  timestamp?: string;
  message: string;
}

export interface GigaFileSummary {
  fileName: string;
  fileSize: string;
  totalLines: number;
  errorCount: number;
  warnCount: number;
  infoCount: number;
  debugCount: number;
}

export interface GigaFilterOptions {
  searchKeyword: string;
  isRegex: boolean;
  selectedLevel: LogLevel;
  caseSensitive: boolean;
}
