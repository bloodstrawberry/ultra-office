// ----------------------------------------------------------------------
// Types for Math, Chart, Markdown, ERD and Org Chart Studio
// ----------------------------------------------------------------------

export type StudioTab = 'erd' | 'math' | 'chart' | 'orgChart';

// ----------------------------------------------------------------------
// 1. Math / LaTeX Types
// ----------------------------------------------------------------------
export interface MathExample {
  id: string;
  title: string;
  category: 'algebra' | 'calculus' | 'physics' | 'statistics' | 'ai';
  categoryLabel: string;
  latex: string;
  description: string;
}

// ----------------------------------------------------------------------
// 2. Chart / Graph Types
// ----------------------------------------------------------------------
export type ChartType = 'line' | 'area' | 'bar' | 'donut' | 'radar' | 'scatter';

export interface ChartExample {
  id: string;
  title: string;
  category: string;
  description: string;
  type: ChartType;
  series: unknown[];
  categories?: string[];
  options?: Record<string, unknown>;
}

// ----------------------------------------------------------------------
// 3. Markdown Types
// ----------------------------------------------------------------------
export interface MarkdownTemplate {
  id: string;
  title: string;
  category: 'prd' | 'api' | 'meeting' | 'readme' | 'incident';
  categoryLabel: string;
  description: string;
  content: string;
}

// ----------------------------------------------------------------------
// 4. ERD Types
// ----------------------------------------------------------------------
export interface ErdColumn {
  name: string;
  type: string;
  isPk?: boolean;
  isFk?: boolean;
  isUnique?: boolean;
  nullable?: boolean;
  fkTarget?: string; // e.g. "users.id"
  comment?: string;
}

export interface ErdTable {
  id: string;
  name: string;
  comment?: string;
  color?: string;
  x?: number;
  y?: number;
  columns: ErdColumn[];
}

export interface ErdRelation {
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  type: '1:1' | '1:N' | 'N:M';
}

export interface ErdSchema {
  id: string;
  title: string;
  description: string;
  tables: ErdTable[];
  relations: ErdRelation[];
}

// ----------------------------------------------------------------------
// 5. Org Chart Types
// ----------------------------------------------------------------------
export interface OrgNode {
  id: string;
  name: string;
  role: string;
  department: string;
  color?: string;
  children?: OrgNode[];
}
