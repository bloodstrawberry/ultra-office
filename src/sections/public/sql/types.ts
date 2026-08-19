export type ProblemLevel = 1 | 2 | 3 | 4;

export interface SqlColumnDef {
  name: string;
  type: string;
  description?: string;
  isPrimary?: boolean;
}

export interface SqlTableInfo {
  name: string;
  description: string;
  columns: SqlColumnDef[];
  ddl: string;
  initialData: Record<string, unknown>[];
}

export interface SqlDataset {
  id: string;
  name: string;
  description: string;
  tables: SqlTableInfo[];
}

export interface SqlProblem {
  id: string;
  datasetId: string;
  level: ProblemLevel;
  title: string;
  category: string;
  description: string;
  expectedColumns?: string[];
  initialQuery?: string;
  solutionQuery: string;
  hint: string;
  explanation?: string;
}

export interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  executionTimeMs: number;
  rowCount: number;
  error?: string;
  executionMessage?: string;
  rawResult?: unknown;
}

export interface VerificationResult {
  isCorrect: boolean;
  message: string;
  userResult?: QueryResult;
  expectedResult?: QueryResult;
  diffSummary?: string;
}

export interface QueryHistoryItem {
  id: string;
  query: string;
  datasetId: string;
  timestamp: number;
  success: boolean;
  rowCount?: number;
  executionTimeMs?: number;
}
