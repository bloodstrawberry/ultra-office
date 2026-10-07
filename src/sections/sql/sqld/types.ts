// ----------------------------------------------------------------------
// SQLD Problem Practice Types
// ----------------------------------------------------------------------

export type SqldViewMode = 'practice' | 'editor';
export type SqldNavigationFilter = 'all' | 'everWrong' | 'wrongOrUnanswered';

export interface ConceptLink {
  id: string;
  title: string;
  fileId?: string;
  fileName?: string;
}

export interface Problem {
  hashtags: string[];
  question: string;
  description: string;
  conceptLinks?: ConceptLink[];
  formulas?: string[];
  formula?: string;
  explanationFormulas?: string[];
  explanationFormula?: string;
  erds?: string[];
  erd?: string;
  explanationErds?: string[];
  explanationErd?: string;
  charts?: string[];
  chart?: string;
  explanationCharts?: string[];
  explanationChart?: string;
  choices: string[];
  choiceDescriptions?: string[];
  choiceFormulas?: string[][];
  choiceErds?: string[][];
  choiceCharts?: string[][];
  answer: number;
  answers?: number[];
  isMultipleAnswer?: boolean;
  showMultipleCount?: boolean;
  disableChoiceShuffle?: boolean;
  isHold?: boolean;
  explanation: string;
  choiceExplanations: string[];
  choiceExplanationDescriptions?: string[];
  choiceExplanationFormulas?: string[][];
  choiceExplanationErds?: string[][];
  choiceExplanationCharts?: string[][];
  isLlmMatch?: boolean;
  isLlmMath?: boolean;
  isLlmProcessed?: boolean;
  llmPredictedAnswer?: number;
  llmKeyConcept?: string;
  /** Hide SQL practice when the browser engine cannot represent the tested database behavior. */
  sqlPracticeDisabled?: boolean;
  practiceLab?: SqlPracticeLab;
  /** Legacy per-choice fixtures; existing exported problem data still supports this shape. */
  choiceLabs?: ChoiceLabItem[];
}

export interface ChoiceLabTable {
  name: string;
  description?: string;
  /** Optional AlaSQL-compatible CREATE TABLE statement for constraint exercises. */
  ddl?: string;
  columns: string[];
  rows: Record<string, string | number | null>[];
}

export interface ChoiceLabItem {
  choiceNum: number;
  title?: string;
  sql: string;
  table?: ChoiceLabTable;
  tables?: ChoiceLabTable[];
}

/** Tables are shared by the examples in one problem. */
export interface SqlPracticeLab {
  tables: ChoiceLabTable[];
  examples: SqlPracticeExample[];
}

export interface SqlPracticeExample {
  id: string;
  title: string;
  sql: string;
  description?: string;
  /** One-based choice number; omit for an example that applies to the whole question. */
  choiceNum?: number;
  /** Selects a subset of practiceLab.tables. Omit to use every table. */
  tableNames?: string[];
}

export interface SqldRound {
  id: string;
  label: string;
  type: string;
  createdAt: string;
  modifiedAt: string;
  isFavorited?: boolean;
}

export interface SqldProblemData {
  tree: SqldRound[];
  scripts: Record<string, { problems: Problem[] }>;
}

export interface UserProblemRecord {
  selectedAnswers: number[];
  isSubmitted: boolean;
  isCorrect: boolean;
  isRevealed: boolean;
  correctCount?: number;
  wrongCount?: number;
}

export interface ProblemAttemptCounts {
  correctCount: number;
  wrongCount: number;
  totalAttempts: number;
}

export function getProblemAttemptCounts(record?: UserProblemRecord): ProblemAttemptCounts {
  if (!record) {
    return { correctCount: 0, wrongCount: 0, totalAttempts: 0 };
  }

  const correctCount =
    typeof record.correctCount === 'number'
      ? record.correctCount
      : record.isSubmitted && record.isCorrect
        ? 1
        : 0;

  const wrongCount =
    typeof record.wrongCount === 'number'
      ? record.wrongCount
      : record.isSubmitted && !record.isCorrect
        ? 1
        : 0;

  return {
    correctCount,
    wrongCount,
    totalAttempts: correctCount + wrongCount,
  };
}

export interface SubjectStats {
  subjectNumber: 1 | 2;
  title: string;
  total: number;
  solved: number;
  correct: number;
  scorePercentage: number;
  isPassed: boolean; // 40% 이상 (과락 면제 기준)
}

export interface RoundStatistics {
  total: number;
  solved: number;
  correct: number;
  subject1: SubjectStats;
  subject2: SubjectStats;
  totalScore: number; // 각 문제 2점, 총 100점 만점
  isOverallPassed: boolean; // 총점 60점 이상 및 각 과목 과락 없을 때
}

export function createEmptyProblem(choicesCount: number = 4): Problem {
  const count = Math.max(2, choicesCount);
  return {
    hashtags: ['#SQLD', '#신규문제'],
    question: '',
    description: '',
    conceptLinks: [],
    formulas: [],
    explanationFormulas: [],
    erds: [],
    explanationErds: [],
    charts: [],
    explanationCharts: [],
    choices: Array(count).fill(''),
    choiceDescriptions: Array(count).fill(''),
    choiceFormulas: Array.from({ length: count }, () => []),
    choiceErds: Array.from({ length: count }, () => []),
    choiceCharts: Array.from({ length: count }, () => []),
    answer: 1,
    answers: [1],
    isMultipleAnswer: false,
    showMultipleCount: true,
    disableChoiceShuffle: false,
    isHold: false,
    explanation: '',
    choiceExplanations: Array(count).fill(''),
    choiceExplanationDescriptions: Array(count).fill(''),
    choiceExplanationFormulas: Array.from({ length: count }, () => []),
    choiceExplanationErds: Array.from({ length: count }, () => []),
    choiceExplanationCharts: Array.from({ length: count }, () => []),
  };
}
