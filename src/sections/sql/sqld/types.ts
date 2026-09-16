// ----------------------------------------------------------------------
// SQLD Problem Practice Types
// ----------------------------------------------------------------------

export type SqldViewMode = 'practice' | 'editor';

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
