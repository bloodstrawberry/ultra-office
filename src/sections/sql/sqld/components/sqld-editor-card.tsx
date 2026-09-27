'use client';

import type { Problem } from '../types';

import { toast } from 'sonner';
import { arrayMove } from '@dnd-kit/sortable';
import { memo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import SchemaIcon from '@mui/icons-material/Schema';
import ArticleIcon from '@mui/icons-material/Article';
import BarChartIcon from '@mui/icons-material/BarChart';
import FunctionsIcon from '@mui/icons-material/Functions';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import LightbulbIcon from '@mui/icons-material/LightbulbOutlined';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';

import { MarkdownEditor } from 'src/components/markdown-editor';

import { FastTextField } from './fast-text-field';
import { ProblemEditorErds } from './problem-editor-erds';
import { ProblemEditorCharts } from './problem-editor-charts';
import { ProblemEditorChoices } from './problem-editor-choices';
import { ProblemEditorHashtags } from './problem-editor-hashtags';
import { ProblemEditorFormulas } from './problem-editor-formulas';
import { ProblemEditorBulkDialog } from './problem-editor-bulk-dialog';
import { ProblemEditorAnswerSelect } from './problem-editor-answer-select';
import { RichInsertToolbar } from './rich-insert-toolbar';
import { isRichTextEmpty, RichContentRenderer } from './rich-content-renderer';
import { ProblemEditorCorrectionDialog } from './problem-editor-correction-dialog';
import { ProblemEditorCollapsibleSection } from './problem-editor-collapsible-section';

// ----------------------------------------------------------------------

type SectionKey =
  | 'description'
  | 'formulas'
  | 'erds'
  | 'charts'
  | 'explanationFormulas'
  | 'explanationErds'
  | 'explanationCharts';

const LOCAL_STORAGE_KEY = 'sqld_problem_editor_expanded_sections';

interface SqldEditorCardProps {
  problem: Problem;
  problemIndex: number;
  totalProblems?: number;
  onUpdateProblem: (updates: Partial<Problem>) => void;
  onDuplicateProblem?: (index: number) => void;
  onRemoveProblem?: (index: number) => void;
}

export const SqldEditorCard = memo(function SqldEditorCard({
  problem,
  problemIndex,
  totalProblems = 1,
  onUpdateProblem,
  onDuplicateProblem,
  onRemoveProblem,
}: SqldEditorCardProps) {
  const [hashtagInput, setHashtagInput] = useState('');
  const [userExpandedState, setUserExpandedState] = useState<Record<SectionKey, boolean | undefined>>({
    description: undefined,
    formulas: undefined,
    erds: undefined,
    charts: undefined,
    explanationFormulas: undefined,
    explanationErds: undefined,
    explanationCharts: undefined,
  });
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);
  const [showExpPreview, setShowExpPreview] = useState(false);
  const [correctionDialogIndex, setCorrectionDialogIndex] = useState<number | null>(null);

  // Bulk Choices Dialog State
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');

  // Bulk Question + Choices Dialog State
  const [problemBulkDialogOpen, setProblemBulkDialogOpen] = useState(false);
  const [problemBulkText, setProblemBulkText] = useState('');

  // Choice Explanation Sub-Sections open/closed states
  const [openExpDescState, setOpenExpDescState] = useState<Record<number, boolean>>({});
  const [openExpFormulaState, setOpenExpFormulaState] = useState<Record<number, boolean>>({});
  const [openExpErdState, setOpenExpErdState] = useState<Record<number, boolean>>({});
  const [openExpChartState, setOpenExpChartState] = useState<Record<number, boolean>>({});

  const toggleExpDesc = useCallback((cIndex: number) => {
    setOpenExpDescState((prev) => ({ ...prev, [cIndex]: !prev[cIndex] }));
  }, []);

  const toggleExpFormula = useCallback((cIndex: number) => {
    setOpenExpFormulaState((prev) => ({ ...prev, [cIndex]: !prev[cIndex] }));
  }, []);

  const toggleExpErd = useCallback((cIndex: number) => {
    setOpenExpErdState((prev) => ({ ...prev, [cIndex]: !prev[cIndex] }));
  }, []);

  const toggleExpChart = useCallback((cIndex: number) => {
    setOpenExpChartState((prev) => ({ ...prev, [cIndex]: !prev[cIndex] }));
  }, []);

  const handleClearChoiceExplanations = useCallback(() => {
    const count = problem.choices?.length || 4;
    onUpdateProblem({
      choiceExplanations: Array(count).fill(''),
      choiceExplanationDescriptions: Array(count).fill(''),
      choiceExplanationFormulas: Array.from({ length: count }, () => []),
      choiceExplanationErds: Array.from({ length: count }, () => []),
      choiceExplanationCharts: Array.from({ length: count }, () => []),
    });
    setOpenExpDescState({});
    setOpenExpFormulaState({});
    setOpenExpErdState({});
    setOpenExpChartState({});
  }, [onUpdateProblem, problem.choices?.length]);

  // Load expanded sections preferences from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setUserExpandedState(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load expanded sections state:', e);
    }
    setHasLoadedStorage(true);
  }, []);

  // Save expanded sections preferences
  useEffect(() => {
    if (hasLoadedStorage) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userExpandedState));
      } catch (e) {
        console.error('Failed to save expanded sections state:', e);
      }
    }
  }, [userExpandedState, hasLoadedStorage]);

  const isSectionExpanded = useCallback(
    (key: SectionKey, hasContent: boolean): boolean => {
      const manualState = userExpandedState[key];
      if (typeof manualState === 'boolean') {
        return manualState;
      }
      return hasContent;
    },
    [userExpandedState]
  );

  const handleToggleSection = useCallback(
    (key: SectionKey, hasContent: boolean) => {
      const currentExpanded = isSectionExpanded(key, hasContent);
      setUserExpandedState((prev) => ({
        ...prev,
        [key]: !currentExpanded,
      }));
    },
    [isSectionExpanded]
  );

  const handleExpandAndAdd = useCallback((key: SectionKey, addFn: () => void) => {
    setUserExpandedState((prev) => ({
      ...prev,
      [key]: true,
    }));
    addFn();
  }, []);

  // 1. Hashtags Handlers
  const handleAddHashtag = useCallback(
    (tag: string) => {
      const cleaned = tag.trim();
      if (!cleaned) return;
      const formatted = cleaned.startsWith('#') ? cleaned : `#${cleaned}`;
      if (!problem.hashtags.includes(formatted)) {
        onUpdateProblem({ hashtags: [...problem.hashtags, formatted] });
      }
      setHashtagInput('');
    },
    [onUpdateProblem, problem.hashtags]
  );

  const handleRemoveHashtag = useCallback(
    (tagIndex: number) => {
      onUpdateProblem({
        hashtags: problem.hashtags.filter((_, i) => i !== tagIndex),
      });
    },
    [onUpdateProblem, problem.hashtags]
  );

  // 2. Formulas Handlers
  const handleAddFormula = useCallback(() => {
    onUpdateProblem({
      formulas: [...(problem.formulas || []), ''],
    });
  }, [onUpdateProblem, problem.formulas]);

  const handleChangeFormula = useCallback(
    (formulaIndex: number, value: string) => {
      const current = [...(problem.formulas || [])];
      current[formulaIndex] = value;
      onUpdateProblem({ formulas: current });
    },
    [onUpdateProblem, problem.formulas]
  );

  const handleRemoveFormula = useCallback(
    (formulaIndex: number) => {
      onUpdateProblem({
        formulas: (problem.formulas || []).filter((_, i) => i !== formulaIndex),
      });
    },
    [onUpdateProblem, problem.formulas]
  );

  const handleInsertSymbol = useCallback(
    (formulaIndex: number, symbol: string) => {
      const current = [...(problem.formulas || [])];
      const prevVal = current[formulaIndex] || '';
      current[formulaIndex] = prevVal + symbol;
      onUpdateProblem({ formulas: current });
    },
    [onUpdateProblem, problem.formulas]
  );

  // 3. Explanation Formulas Handlers
  const handleAddExplanationFormula = useCallback(() => {
    onUpdateProblem({
      explanationFormulas: [...(problem.explanationFormulas || []), ''],
    });
  }, [onUpdateProblem, problem.explanationFormulas]);

  const handleChangeExplanationFormula = useCallback(
    (formulaIndex: number, value: string) => {
      const current = [...(problem.explanationFormulas || [])];
      current[formulaIndex] = value;
      onUpdateProblem({ explanationFormulas: current });
    },
    [onUpdateProblem, problem.explanationFormulas]
  );

  const handleRemoveExplanationFormula = useCallback(
    (formulaIndex: number) => {
      onUpdateProblem({
        explanationFormulas: (problem.explanationFormulas || []).filter((_, i) => i !== formulaIndex),
      });
    },
    [onUpdateProblem, problem.explanationFormulas]
  );

  const handleInsertExplanationSymbol = useCallback(
    (formulaIndex: number, symbol: string) => {
      const current = [...(problem.explanationFormulas || [])];
      const prevVal = current[formulaIndex] || '';
      current[formulaIndex] = prevVal + symbol;
      onUpdateProblem({ explanationFormulas: current });
    },
    [onUpdateProblem, problem.explanationFormulas]
  );

  // 4. ERDs Handlers
  const handleAddErd = useCallback(() => {
    onUpdateProblem({
      erds: [...(problem.erds || []), 'erDiagram\n  CUSTOMER ||--o{ ORDER : places\n  ORDER ||--|{ LINE-ITEM : contains'],
    });
  }, [onUpdateProblem, problem.erds]);

  const handleChangeErd = useCallback(
    (erdIndex: number, value: string) => {
      const current = [...(problem.erds || [])];
      current[erdIndex] = value;
      onUpdateProblem({ erds: current, erd: current[0] });
    },
    [onUpdateProblem, problem.erds]
  );

  const handleRemoveErd = useCallback(
    (erdIndex: number) => {
      const nextErds = (problem.erds || []).filter((_, i) => i !== erdIndex);
      onUpdateProblem({ erds: nextErds, erd: nextErds[0] });
    },
    [onUpdateProblem, problem.erds]
  );

  const handleInsertErdTemplate = useCallback(
    (erdIndex: number, template: string) => {
      const current = [...(problem.erds || [])];
      current[erdIndex] = template;
      onUpdateProblem({ erds: current, erd: current[0] });
    },
    [onUpdateProblem, problem.erds]
  );

  // 5. Explanation ERDs Handlers
  const handleAddExplanationErd = useCallback(() => {
    onUpdateProblem({
      explanationErds: [
        ...(problem.explanationErds || []),
        'erDiagram\n  CUSTOMER ||--o{ ORDER : places\n  ORDER ||--|{ LINE-ITEM : contains',
      ],
    });
  }, [onUpdateProblem, problem.explanationErds]);

  const handleChangeExplanationErd = useCallback(
    (erdIndex: number, value: string) => {
      const current = [...(problem.explanationErds || [])];
      current[erdIndex] = value;
      onUpdateProblem({ explanationErds: current });
    },
    [onUpdateProblem, problem.explanationErds]
  );

  const handleRemoveExplanationErd = useCallback(
    (erdIndex: number) => {
      onUpdateProblem({
        explanationErds: (problem.explanationErds || []).filter((_, i) => i !== erdIndex),
      });
    },
    [onUpdateProblem, problem.explanationErds]
  );

  const handleInsertExplanationErdTemplate = useCallback(
    (erdIndex: number, template: string) => {
      const current = [...(problem.explanationErds || [])];
      current[erdIndex] = template;
      onUpdateProblem({ explanationErds: current });
    },
    [onUpdateProblem, problem.explanationErds]
  );

  // 6. Charts Handlers
  const handleAddChart = useCallback(() => {
    onUpdateProblem({
      charts: [...(problem.charts || []), '```mermaid\npie title SQLD 점수 분포\n  "1과목" : 20\n  "2과목" : 80\n```'],
    });
  }, [onUpdateProblem, problem.charts]);

  const handleChangeChart = useCallback(
    (chartIndex: number, value: string) => {
      const current = [...(problem.charts || [])];
      current[chartIndex] = value;
      onUpdateProblem({ charts: current });
    },
    [onUpdateProblem, problem.charts]
  );

  const handleRemoveChart = useCallback(
    (chartIndex: number) => {
      onUpdateProblem({
        charts: (problem.charts || []).filter((_, i) => i !== chartIndex),
      });
    },
    [onUpdateProblem, problem.charts]
  );

  const handleInsertChartTemplate = useCallback(
    (chartIndex: number, template: string) => {
      const current = [...(problem.charts || [])];
      current[chartIndex] = template;
      onUpdateProblem({ charts: current });
    },
    [onUpdateProblem, problem.charts]
  );

  // 7. Explanation Charts Handlers
  const handleAddExplanationChart = useCallback(() => {
    onUpdateProblem({
      explanationCharts: [
        ...(problem.explanationCharts || []),
        '```mermaid\npie title 정답 분포\n  "정답" : 70\n  "오답" : 30\n```',
      ],
    });
  }, [onUpdateProblem, problem.explanationCharts]);

  const handleChangeExplanationChart = useCallback(
    (chartIndex: number, value: string) => {
      const current = [...(problem.explanationCharts || [])];
      current[chartIndex] = value;
      onUpdateProblem({ explanationCharts: current });
    },
    [onUpdateProblem, problem.explanationCharts]
  );

  const handleRemoveExplanationChart = useCallback(
    (chartIndex: number) => {
      onUpdateProblem({
        explanationCharts: (problem.explanationCharts || []).filter((_, i) => i !== chartIndex),
      });
    },
    [onUpdateProblem, problem.explanationCharts]
  );

  const handleInsertExplanationChartTemplate = useCallback(
    (chartIndex: number, template: string) => {
      const current = [...(problem.explanationCharts || [])];
      current[chartIndex] = template;
      onUpdateProblem({ explanationCharts: current });
    },
    [onUpdateProblem, problem.explanationCharts]
  );

  // 8. Choices Handlers
  const handleAddChoice = useCallback(() => {
    const nextChoices = [...problem.choices, ''];
    const nextDescs = [...(problem.choiceDescriptions || []), ''];
    const nextExps = [...(problem.choiceExplanations || []), ''];
    onUpdateProblem({
      choices: nextChoices,
      choiceDescriptions: nextDescs,
      choiceExplanations: nextExps,
    });
  }, [onUpdateProblem, problem.choices, problem.choiceDescriptions, problem.choiceExplanations]);

  const handleRemoveChoice = useCallback(
    (choiceIndex: number) => {
      if (problem.choices.length <= 2) return;
      const nextChoices = problem.choices.filter((_, i) => i !== choiceIndex);
      const nextDescs = (problem.choiceDescriptions || []).filter((_, i) => i !== choiceIndex);
      const nextFormulas = (problem.choiceFormulas || []).filter((_, i) => i !== choiceIndex);
      const nextErds = (problem.choiceErds || []).filter((_, i) => i !== choiceIndex);
      const nextCharts = (problem.choiceCharts || []).filter((_, i) => i !== choiceIndex);
      const nextExps = (problem.choiceExplanations || []).filter((_, i) => i !== choiceIndex);
      const nextExpDescs = (problem.choiceExplanationDescriptions || []).filter(
        (_, i) => i !== choiceIndex
      );
      const nextExpFormulas = (problem.choiceExplanationFormulas || []).filter(
        (_, i) => i !== choiceIndex
      );
      const nextExpErds = (problem.choiceExplanationErds || []).filter((_, i) => i !== choiceIndex);
      const nextExpCharts = (problem.choiceExplanationCharts || []).filter(
        (_, i) => i !== choiceIndex
      );

      // Adjust answer numbers
      const removedNum = choiceIndex + 1;
      let nextAnswer = problem.answer;
      if (nextAnswer === removedNum) {
        nextAnswer = 1;
      } else if (nextAnswer > removedNum) {
        nextAnswer -= 1;
      }

      const nextAnswers = (problem.answers || [])
        .filter((n) => n !== removedNum)
        .map((n) => (n > removedNum ? n - 1 : n));

      onUpdateProblem({
        choices: nextChoices,
        choiceDescriptions: nextDescs,
        choiceFormulas: nextFormulas,
        choiceErds: nextErds,
        choiceCharts: nextCharts,
        choiceExplanations: nextExps,
        choiceExplanationDescriptions: nextExpDescs,
        choiceExplanationFormulas: nextExpFormulas,
        choiceExplanationErds: nextExpErds,
        choiceExplanationCharts: nextExpCharts,
        answer: nextAnswer,
        answers: nextAnswers.length > 0 ? nextAnswers : [nextAnswer],
      });
    },
    [onUpdateProblem, problem]
  );

  const handleReorderChoice = useCallback(
    (oldIndex: number, newIndex: number) => {
      if (oldIndex === newIndex) return;

      const nextChoices = arrayMove([...problem.choices], oldIndex, newIndex);
      const nextDescs = arrayMove(
        [...(problem.choiceDescriptions || Array(problem.choices.length).fill(''))],
        oldIndex,
        newIndex
      );
      const nextFormulas = arrayMove(
        [...(problem.choiceFormulas || Array.from({ length: problem.choices.length }, () => []))],
        oldIndex,
        newIndex
      );
      const nextErds = arrayMove(
        [...(problem.choiceErds || Array.from({ length: problem.choices.length }, () => []))],
        oldIndex,
        newIndex
      );
      const nextCharts = arrayMove(
        [...(problem.choiceCharts || Array.from({ length: problem.choices.length }, () => []))],
        oldIndex,
        newIndex
      );
      const nextExps = arrayMove(
        [...(problem.choiceExplanations || Array(problem.choices.length).fill(''))],
        oldIndex,
        newIndex
      );
      const nextExpDescs = arrayMove(
        [
          ...(problem.choiceExplanationDescriptions ||
            Array(problem.choices.length).fill('')),
        ],
        oldIndex,
        newIndex
      );
      const nextExpFormulas = arrayMove(
        [
          ...(problem.choiceExplanationFormulas ||
            Array.from({ length: problem.choices.length }, () => [])),
        ],
        oldIndex,
        newIndex
      );
      const nextExpErds = arrayMove(
        [
          ...(problem.choiceExplanationErds ||
            Array.from({ length: problem.choices.length }, () => [])),
        ],
        oldIndex,
        newIndex
      );
      const nextExpCharts = arrayMove(
        [
          ...(problem.choiceExplanationCharts ||
            Array.from({ length: problem.choices.length }, () => [])),
        ],
        oldIndex,
        newIndex
      );

      // Re-map answers
      const oldChoiceNum = oldIndex + 1;
      const newChoiceNum = newIndex + 1;
      const mapNum = (n: number) => {
        if (n === oldChoiceNum) return newChoiceNum;
        if (oldChoiceNum < newChoiceNum && n > oldChoiceNum && n <= newChoiceNum) {
          return n - 1;
        }
        if (oldChoiceNum > newChoiceNum && n >= newChoiceNum && n < oldChoiceNum) {
          return n + 1;
        }
        return n;
      };

      const nextAnswer = mapNum(problem.answer || 1);
      const nextAnswers = (problem.answers || [problem.answer || 1]).map(mapNum).sort((a, b) => a - b);

      onUpdateProblem({
        choices: nextChoices,
        choiceDescriptions: nextDescs,
        choiceFormulas: nextFormulas,
        choiceErds: nextErds,
        choiceCharts: nextCharts,
        choiceExplanations: nextExps,
        choiceExplanationDescriptions: nextExpDescs,
        choiceExplanationFormulas: nextExpFormulas,
        choiceExplanationErds: nextExpErds,
        choiceExplanationCharts: nextExpCharts,
        answer: nextAnswer,
        answers: nextAnswers,
      });
    },
    [onUpdateProblem, problem]
  );

  const handleChangeChoice = useCallback(
    (choiceIndex: number, value: string) => {
      const nextChoices = [...problem.choices];
      nextChoices[choiceIndex] = value;
      onUpdateProblem({ choices: nextChoices });
    },
    [onUpdateProblem, problem.choices]
  );

  const handleChangeChoiceDescription = useCallback(
    (choiceIndex: number, value: string) => {
      const current = [
        ...(problem.choiceDescriptions || Array(problem.choices.length).fill('')),
      ];
      current[choiceIndex] = value;
      onUpdateProblem({ choiceDescriptions: current });
    },
    [onUpdateProblem, problem.choiceDescriptions, problem.choices.length]
  );

  const handleAddChoiceFormula = useCallback(
    (choiceIndex: number) => {
      const current = [
        ...(problem.choiceFormulas || Array.from({ length: problem.choices.length }, () => [])),
      ];
      current[choiceIndex] = [...(current[choiceIndex] || []), ''];
      onUpdateProblem({ choiceFormulas: current });
    },
    [onUpdateProblem, problem.choiceFormulas, problem.choices.length]
  );

  const handleChangeChoiceFormula = useCallback(
    (choiceIndex: number, formulaIndex: number, value: string) => {
      const current = [
        ...(problem.choiceFormulas || Array.from({ length: problem.choices.length }, () => [])),
      ];
      const sub = [...(current[choiceIndex] || [])];
      sub[formulaIndex] = value;
      current[choiceIndex] = sub;
      onUpdateProblem({ choiceFormulas: current });
    },
    [onUpdateProblem, problem.choiceFormulas, problem.choices.length]
  );

  const handleRemoveChoiceFormula = useCallback(
    (choiceIndex: number, formulaIndex: number) => {
      const current = [
        ...(problem.choiceFormulas || Array.from({ length: problem.choices.length }, () => [])),
      ];
      current[choiceIndex] = (current[choiceIndex] || []).filter((_, i) => i !== formulaIndex);
      onUpdateProblem({ choiceFormulas: current });
    },
    [onUpdateProblem, problem.choiceFormulas, problem.choices.length]
  );

  const handleInsertChoiceSymbol = useCallback(
    (choiceIndex: number, formulaIndex: number, symbol: string) => {
      const current = [
        ...(problem.choiceFormulas || Array.from({ length: problem.choices.length }, () => [])),
      ];
      const sub = [...(current[choiceIndex] || [])];
      sub[formulaIndex] = (sub[formulaIndex] || '') + symbol;
      current[choiceIndex] = sub;
      onUpdateProblem({ choiceFormulas: current });
    },
    [onUpdateProblem, problem.choiceFormulas, problem.choices.length]
  );

  const handleAddChoiceErd = useCallback(
    (choiceIndex: number) => {
      const current = [
        ...(problem.choiceErds || Array.from({ length: problem.choices.length }, () => [])),
      ];
      current[choiceIndex] = [
        ...(current[choiceIndex] || []),
        'erDiagram\n  CUSTOMER ||--o{ ORDER : places',
      ];
      onUpdateProblem({ choiceErds: current });
    },
    [onUpdateProblem, problem.choiceErds, problem.choices.length]
  );

  const handleChangeChoiceErd = useCallback(
    (choiceIndex: number, erdIndex: number, value: string) => {
      const current = [
        ...(problem.choiceErds || Array.from({ length: problem.choices.length }, () => [])),
      ];
      const sub = [...(current[choiceIndex] || [])];
      sub[erdIndex] = value;
      current[choiceIndex] = sub;
      onUpdateProblem({ choiceErds: current });
    },
    [onUpdateProblem, problem.choiceErds, problem.choices.length]
  );

  const handleRemoveChoiceErd = useCallback(
    (choiceIndex: number, erdIndex: number) => {
      const current = [
        ...(problem.choiceErds || Array.from({ length: problem.choices.length }, () => [])),
      ];
      current[choiceIndex] = (current[choiceIndex] || []).filter((_, i) => i !== erdIndex);
      onUpdateProblem({ choiceErds: current });
    },
    [onUpdateProblem, problem.choiceErds, problem.choices.length]
  );

  const handleInsertChoiceErdTemplate = useCallback(
    (choiceIndex: number, erdIndex: number, template: string) => {
      const current = [
        ...(problem.choiceErds || Array.from({ length: problem.choices.length }, () => [])),
      ];
      const sub = [...(current[choiceIndex] || [])];
      sub[erdIndex] = template;
      current[choiceIndex] = sub;
      onUpdateProblem({ choiceErds: current });
    },
    [onUpdateProblem, problem.choiceErds, problem.choices.length]
  );

  const handleAddChoiceChart = useCallback(
    (choiceIndex: number) => {
      const current = [
        ...(problem.choiceCharts || Array.from({ length: problem.choices.length }, () => [])),
      ];
      current[choiceIndex] = [
        ...(current[choiceIndex] || []),
        '```mermaid\npie title 선택지 비율\n  "A" : 50\n  "B" : 50\n```',
      ];
      onUpdateProblem({ choiceCharts: current });
    },
    [onUpdateProblem, problem.choiceCharts, problem.choices.length]
  );

  const handleChangeChoiceChart = useCallback(
    (choiceIndex: number, chartIndex: number, value: string) => {
      const current = [
        ...(problem.choiceCharts || Array.from({ length: problem.choices.length }, () => [])),
      ];
      const sub = [...(current[choiceIndex] || [])];
      sub[chartIndex] = value;
      current[choiceIndex] = sub;
      onUpdateProblem({ choiceCharts: current });
    },
    [onUpdateProblem, problem.choiceCharts, problem.choices.length]
  );

  const handleRemoveChoiceChart = useCallback(
    (choiceIndex: number, chartIndex: number) => {
      const current = [
        ...(problem.choiceCharts || Array.from({ length: problem.choices.length }, () => [])),
      ];
      current[choiceIndex] = (current[choiceIndex] || []).filter((_, i) => i !== chartIndex);
      onUpdateProblem({ choiceCharts: current });
    },
    [onUpdateProblem, problem.choiceCharts, problem.choices.length]
  );

  const handleInsertChoiceChartTemplate = useCallback(
    (choiceIndex: number, chartIndex: number, template: string) => {
      const current = [
        ...(problem.choiceCharts || Array.from({ length: problem.choices.length }, () => [])),
      ];
      const sub = [...(current[choiceIndex] || [])];
      sub[chartIndex] = template;
      current[choiceIndex] = sub;
      onUpdateProblem({ choiceCharts: current });
    },
    [onUpdateProblem, problem.choiceCharts, problem.choices.length]
  );

  // 9. Choice Explanations Handlers
  const handleChangeChoiceExplanation = useCallback(
    (choiceIndex: number, value: string) => {
      const current = [
        ...(problem.choiceExplanations || Array(problem.choices.length).fill('')),
      ];
      current[choiceIndex] = value;
      onUpdateProblem({ choiceExplanations: current });
    },
    [onUpdateProblem, problem.choiceExplanations, problem.choices.length]
  );

  const handleChangeChoiceExplanationDescription = useCallback(
    (choiceIndex: number, value: string) => {
      const current = [
        ...(problem.choiceExplanationDescriptions ||
          Array(problem.choices.length).fill('')),
      ];
      current[choiceIndex] = value;
      onUpdateProblem({ choiceExplanationDescriptions: current });
    },
    [onUpdateProblem, problem.choiceExplanationDescriptions, problem.choices.length]
  );

  const handleAddChoiceExplanationFormula = useCallback(
    (choiceIndex: number) => {
      const current = [
        ...(problem.choiceExplanationFormulas ||
          Array.from({ length: problem.choices.length }, () => [])),
      ];
      current[choiceIndex] = [...(current[choiceIndex] || []), ''];
      onUpdateProblem({ choiceExplanationFormulas: current });
    },
    [onUpdateProblem, problem.choiceExplanationFormulas, problem.choices.length]
  );

  const handleChangeChoiceExplanationFormula = useCallback(
    (choiceIndex: number, formulaIndex: number, value: string) => {
      const current = [
        ...(problem.choiceExplanationFormulas ||
          Array.from({ length: problem.choices.length }, () => [])),
      ];
      const sub = [...(current[choiceIndex] || [])];
      sub[formulaIndex] = value;
      current[choiceIndex] = sub;
      onUpdateProblem({ choiceExplanationFormulas: current });
    },
    [onUpdateProblem, problem.choiceExplanationFormulas, problem.choices.length]
  );

  const handleRemoveChoiceExplanationFormula = useCallback(
    (choiceIndex: number, formulaIndex: number) => {
      const current = [
        ...(problem.choiceExplanationFormulas ||
          Array.from({ length: problem.choices.length }, () => [])),
      ];
      current[choiceIndex] = (current[choiceIndex] || []).filter((_, i) => i !== formulaIndex);
      onUpdateProblem({ choiceExplanationFormulas: current });
    },
    [onUpdateProblem, problem.choiceExplanationFormulas, problem.choices.length]
  );

  const handleInsertChoiceExplanationSymbol = useCallback(
    (choiceIndex: number, formulaIndex: number, symbol: string) => {
      const current = [
        ...(problem.choiceExplanationFormulas ||
          Array.from({ length: problem.choices.length }, () => [])),
      ];
      const sub = [...(current[choiceIndex] || [])];
      sub[formulaIndex] = (sub[formulaIndex] || '') + symbol;
      current[choiceIndex] = sub;
      onUpdateProblem({ choiceExplanationFormulas: current });
    },
    [onUpdateProblem, problem.choiceExplanationFormulas, problem.choices.length]
  );

  const handleAddChoiceExplanationErd = useCallback(
    (choiceIndex: number) => {
      const current = [
        ...(problem.choiceExplanationErds ||
          Array.from({ length: problem.choices.length }, () => [])),
      ];
      current[choiceIndex] = [
        ...(current[choiceIndex] || []),
        'erDiagram\n  CUSTOMER ||--o{ ORDER : places',
      ];
      onUpdateProblem({ choiceExplanationErds: current });
    },
    [onUpdateProblem, problem.choiceExplanationErds, problem.choices.length]
  );

  const handleChangeChoiceExplanationErd = useCallback(
    (choiceIndex: number, erdIndex: number, value: string) => {
      const current = [
        ...(problem.choiceExplanationErds ||
          Array.from({ length: problem.choices.length }, () => [])),
      ];
      const sub = [...(current[choiceIndex] || [])];
      sub[erdIndex] = value;
      current[choiceIndex] = sub;
      onUpdateProblem({ choiceExplanationErds: current });
    },
    [onUpdateProblem, problem.choiceExplanationErds, problem.choices.length]
  );

  const handleRemoveChoiceExplanationErd = useCallback(
    (choiceIndex: number, erdIndex: number) => {
      const current = [
        ...(problem.choiceExplanationErds ||
          Array.from({ length: problem.choices.length }, () => [])),
      ];
      current[choiceIndex] = (current[choiceIndex] || []).filter((_, i) => i !== erdIndex);
      onUpdateProblem({ choiceExplanationErds: current });
    },
    [onUpdateProblem, problem.choiceExplanationErds, problem.choices.length]
  );

  const handleInsertChoiceExplanationErdTemplate = useCallback(
    (choiceIndex: number, erdIndex: number, template: string) => {
      const current = [
        ...(problem.choiceExplanationErds ||
          Array.from({ length: problem.choices.length }, () => [])),
      ];
      const sub = [...(current[choiceIndex] || [])];
      sub[erdIndex] = template;
      current[choiceIndex] = sub;
      onUpdateProblem({ choiceExplanationErds: current });
    },
    [onUpdateProblem, problem.choiceExplanationErds, problem.choices.length]
  );

  const handleAddChoiceExplanationChart = useCallback(
    (choiceIndex: number) => {
      const current = [
        ...(problem.choiceExplanationCharts ||
          Array.from({ length: problem.choices.length }, () => [])),
      ];
      current[choiceIndex] = [
        ...(current[choiceIndex] || []),
        '```mermaid\npie title 해설 차트\n  "정답" : 80\n  "오답" : 20\n```',
      ];
      onUpdateProblem({ choiceExplanationCharts: current });
    },
    [onUpdateProblem, problem.choiceExplanationCharts, problem.choices.length]
  );

  const handleChangeChoiceExplanationChart = useCallback(
    (choiceIndex: number, chartIndex: number, value: string) => {
      const current = [
        ...(problem.choiceExplanationCharts ||
          Array.from({ length: problem.choices.length }, () => [])),
      ];
      const sub = [...(current[choiceIndex] || [])];
      sub[chartIndex] = value;
      current[choiceIndex] = sub;
      onUpdateProblem({ choiceExplanationCharts: current });
    },
    [onUpdateProblem, problem.choiceExplanationCharts, problem.choices.length]
  );

  const handleRemoveChoiceExplanationChart = useCallback(
    (choiceIndex: number, chartIndex: number) => {
      const current = [
        ...(problem.choiceExplanationCharts ||
          Array.from({ length: problem.choices.length }, () => [])),
      ];
      current[choiceIndex] = (current[choiceIndex] || []).filter((_, i) => i !== chartIndex);
      onUpdateProblem({ choiceExplanationCharts: current });
    },
    [onUpdateProblem, problem.choiceExplanationCharts, problem.choices.length]
  );

  const handleInsertChoiceExplanationChartTemplate = useCallback(
    (choiceIndex: number, chartIndex: number, template: string) => {
      const current = [
        ...(problem.choiceExplanationCharts ||
          Array.from({ length: problem.choices.length }, () => [])),
      ];
      const sub = [...(current[choiceIndex] || [])];
      sub[chartIndex] = template;
      current[choiceIndex] = sub;
      onUpdateProblem({ choiceExplanationCharts: current });
    },
    [onUpdateProblem, problem.choiceExplanationCharts, problem.choices.length]
  );

  // 10. Bulk Dialog Handlers
  const handleOpenBulkDialog = useCallback(() => {
    setBulkText((problem.choices || []).join('\n'));
    setBulkDialogOpen(true);
  }, [problem.choices]);

  const handleApplyBulk = useCallback(
    (appliedText?: string) => {
      const raw = typeof appliedText === 'string' ? appliedText : bulkText;
      const lines = raw
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => line.replace(/^\s*(?:\d+[.)]|\(\d+\)|[①-⑮])\s*/, ''));

      if (lines.length > 0) {
        onUpdateProblem({ choices: lines });
        toast.success(`${lines.length}개 선택지가 일괄 적용되었습니다.`);
      }
      setBulkDialogOpen(false);
    },
    [bulkText, onUpdateProblem]
  );

  const handleOpenProblemBulkDialog = useCallback(() => {
    const lines = [problem.question || '', ...(problem.choices || [])].filter(Boolean);
    setProblemBulkText(lines.join('\n'));
    setProblemBulkDialogOpen(true);
  }, [problem.question, problem.choices]);

  const handleApplyProblemBulk = useCallback(
    (appliedText?: string) => {
      const raw = typeof appliedText === 'string' ? appliedText : problemBulkText;
      const lines = raw
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => line.replace(/^\s*(?:\d+[.)]|\(\d+\)|[①-⑮])\s*/, ''));

      if (lines.length > 0) {
        const newQuestion = lines[0] || '';
        const choiceLines = lines.slice(1);
        onUpdateProblem({
          question: newQuestion,
          ...(choiceLines.length > 0 && { choices: choiceLines }),
        });
        toast.success('문제와 선택지가 일괄 적용되었습니다.');
      }
      setProblemBulkDialogOpen(false);
    },
    [problemBulkText, onUpdateProblem]
  );

  const isLlmMatch = problem.isLlmMatch ?? problem.isLlmMath;
  const isLlmProcessed = problem.isLlmProcessed;
  const isLlmMismatch = isLlmMatch === false;

  return (
    <Card
      key={problemIndex}
      sx={{
        p: { xs: 2, md: 3 },
        border: (t) =>
          isLlmMismatch
            ? `solid 2px ${t.vars?.palette?.error?.main || t.palette.error.main}`
            : `solid 1px ${t.vars.palette.divider}`,
        ...(isLlmMismatch && {
          borderColor: 'error.main',
          boxShadow: (t) =>
            `0 0 0 1px ${t.vars?.palette?.error?.main || t.palette.error.main}, 0 4px 16px 0 ${alpha(t.palette.error.main, 0.16)}`,
        }),
        position: 'relative',
      }}
    >
      {/* Problem Card Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            문제 {problemIndex + 1}
            <Typography component="span" variant="body2" sx={{ ml: 1, color: 'text.disabled' }}>
              / {totalProblems}
            </Typography>
          </Typography>

          {problem.isHold && (
            <Chip
              label="보류 중"
              size="small"
              color="warning"
              variant="soft"
              sx={{ fontWeight: 700, fontSize: 12, height: 22 }}
            />
          )}

          {isLlmProcessed && (
            <Chip
              label="LLM 처리완료"
              size="small"
              color="info"
              variant="soft"
              sx={{ fontWeight: 700, fontSize: 12, height: 22 }}
            />
          )}

          {isLlmMatch !== undefined && (
            <Chip
              label={isLlmMatch ? 'LLM 일치' : 'LLM 불일치'}
              size="small"
              color={isLlmMatch ? 'success' : 'error'}
              variant="soft"
              sx={{ fontWeight: 700, fontSize: 12, height: 22 }}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title={problem.isHold ? '문제 보류 해제' : '문제 보류'}>
            <Button
              size="small"
              tabIndex={-1}
              variant={problem.isHold ? 'contained' : 'outlined'}
              color="warning"
              onClick={() => onUpdateProblem({ isHold: !problem.isHold })}
              startIcon={
                problem.isHold ? (
                  <PauseCircleIcon fontSize="small" />
                ) : (
                  <PauseCircleOutlineIcon fontSize="small" />
                )
              }
              sx={{ fontWeight: 700, height: 30, px: 1, mr: 0.5 }}
            >
              {problem.isHold ? '보류 중' : '보류'}
            </Button>
          </Tooltip>

          {onDuplicateProblem && (
            <Tooltip title="문제 복제">
              <IconButton size="small" tabIndex={-1} onClick={() => onDuplicateProblem(problemIndex)}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {onRemoveProblem && (
            <Tooltip title="문제 삭제">
              <IconButton
                size="small"
                tabIndex={-1}
                color="error"
                disabled={totalProblems <= 1}
                onClick={() => onRemoveProblem(problemIndex)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Main Form Fields Container */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Hashtags */}
        <ProblemEditorHashtags
          hashtags={problem.hashtags}
          hashtagInput={hashtagInput}
          onHashtagInputChange={setHashtagInput}
          onAddHashtag={handleAddHashtag}
          onRemoveHashtag={handleRemoveHashtag}
        />

        <Divider sx={{ borderStyle: 'dashed' }} />

        {/* Question */}
        <Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              문제
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <RichInsertToolbar
                size="small"
                onInsert={(textToInsert) => {
                  onUpdateProblem({
                    question: (problem.question || '') + textToInsert,
                  });
                }}
              />

              <Button
                size="small"
                tabIndex={-1}
                variant="outlined"
                color="info"
                startIcon={<FormatListNumberedIcon />}
                onClick={handleOpenProblemBulkDialog}
                sx={{ borderRadius: 1.5, fontWeight: 700 }}
              >
                Bulk
              </Button>
            </Box>
          </Box>

          <FastTextField
            id="problem-editor-question-input"
            fullWidth
            multiline
            minRows={2}
            value={problem.question}
            onChange={(val) => onUpdateProblem({ question: val })}
            placeholder="문제를 입력하세요... (LaTeX: $수식$, ERD, 볼드체 **단어** 지원)"
          />

          {(problem.question?.includes('<u>') ||
            problem.question?.includes('$') ||
            problem.question?.includes('**') ||
            problem.question?.includes('~~') ||
            problem.question?.includes('<ruby>')) && (
            <Box
              sx={{
                mt: 1,
                p: 1.5,
                borderRadius: 1,
                bgcolor: (t) => alpha(t.palette.grey[500], 0.04),
                border: (t) => `1px dashed ${alpha(t.palette.grey[500], 0.2)}`,
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: 'text.disabled', fontWeight: 700, mb: 0.5, display: 'block' }}
              >
                문제 서식 미리보기:
              </Typography>
              <RichContentRenderer
                content={problem.question}
                idPrefix={`question_edit_preview_${problemIndex}`}
                sx={{
                  '& p': {
                    fontSize: 15,
                    fontWeight: 700,
                    lineHeight: 1.7,
                    color: 'text.primary',
                  },
                }}
              />
            </Box>
          )}
        </Box>

        {/* Description (Collapsible) */}
        <ProblemEditorCollapsibleSection
          title="문제 추가 설명"
          icon={<ArticleIcon sx={{ fontSize: 20, color: 'text.secondary' }} />}
          hasContent={!isRichTextEmpty(problem.description)}
          color="primary"
          expanded={isSectionExpanded('description', !isRichTextEmpty(problem.description))}
          onToggle={() => handleToggleSection('description', !isRichTextEmpty(problem.description))}
          action={
            <Tooltip title="설명 초기화/삭제">
              <IconButton
                size="small"
                tabIndex={-1}
                color="error"
                onClick={() => {
                  onUpdateProblem({ description: '' });
                  setUserExpandedState((prev) => ({ ...prev, description: false }));
                }}
                sx={{ p: 0.5 }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          }
        >
          <MarkdownEditor
            hideHeader
            label="문제 추가 설명"
            value={problem.description}
            onChange={(val) => onUpdateProblem({ description: val })}
            placeholder="문제에 대한 보충 설명(SQL 코드 블록, 테이블, 지문 등)을 입력하세요... (마크다운 완벽 지원)"
            minRows={3}
          />
        </ProblemEditorCollapsibleSection>

        {/* Formula Section (Collapsible) */}
        <ProblemEditorCollapsibleSection
          title="수식 (KaTeX)"
          icon={<FunctionsIcon color="primary" sx={{ fontSize: 20 }} />}
          count={problem.formulas?.length || 0}
          hasContent={(problem.formulas?.length || 0) > 0}
          color="primary"
          expanded={isSectionExpanded('formulas', (problem.formulas?.length || 0) > 0)}
          onToggle={() => handleToggleSection('formulas', (problem.formulas?.length || 0) > 0)}
          action={
            <Button
              size="small"
              tabIndex={-1}
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleExpandAndAdd('formulas', handleAddFormula)}
              sx={{ borderRadius: 1.5, fontWeight: 700 }}
            >
              수식 추가
            </Button>
          }
        >
          <ProblemEditorFormulas
            hideHeader
            title="수식 (KaTeX)"
            formulas={problem.formulas || []}
            onAddFormula={() => handleExpandAndAdd('formulas', handleAddFormula)}
            onChangeFormula={handleChangeFormula}
            onRemoveFormula={handleRemoveFormula}
            onInsertSymbol={handleInsertSymbol}
            emptyPlaceholderText="등록된 수식이 없습니다."
            labelPrefix="LaTeX 수식"
          />
        </ProblemEditorCollapsibleSection>

        {/* ERD Section (Collapsible) */}
        <ProblemEditorCollapsibleSection
          title="ERD (Entity Relationship Diagram)"
          icon={<SchemaIcon color="info" sx={{ fontSize: 20 }} />}
          count={problem.erds?.length || 0}
          hasContent={(problem.erds?.length || 0) > 0}
          color="info"
          expanded={isSectionExpanded('erds', (problem.erds?.length || 0) > 0)}
          onToggle={() => handleToggleSection('erds', (problem.erds?.length || 0) > 0)}
          action={
            <Button
              size="small"
              tabIndex={-1}
              variant="outlined"
              color="info"
              startIcon={<AddIcon />}
              onClick={() => handleExpandAndAdd('erds', handleAddErd)}
              sx={{ borderRadius: 1.5, fontWeight: 700 }}
            >
              ERD 추가
            </Button>
          }
        >
          <ProblemEditorErds
            hideHeader
            title="ERD (Entity Relationship Diagram)"
            erds={problem.erds || []}
            onAddErd={() => handleExpandAndAdd('erds', handleAddErd)}
            onChangeErd={handleChangeErd}
            onRemoveErd={handleRemoveErd}
            onInsertTemplate={handleInsertErdTemplate}
            emptyPlaceholderText="등록된 ERD가 없습니다."
            labelPrefix="ERD 다이어그램"
          />
        </ProblemEditorCollapsibleSection>

        {/* Problem Charts Section (Collapsible) */}
        <ProblemEditorCollapsibleSection
          title="문제 차트 (Plotly / Mermaid)"
          icon={<BarChartIcon color="success" sx={{ fontSize: 20 }} />}
          count={problem.charts?.length || 0}
          hasContent={(problem.charts?.length || 0) > 0}
          color="success"
          expanded={isSectionExpanded('charts', (problem.charts?.length || 0) > 0)}
          onToggle={() => handleToggleSection('charts', (problem.charts?.length || 0) > 0)}
          action={
            <Button
              size="small"
              tabIndex={-1}
              variant="outlined"
              color="success"
              startIcon={<AddIcon />}
              onClick={() => handleExpandAndAdd('charts', handleAddChart)}
              sx={{ borderRadius: 1.5, fontWeight: 700 }}
            >
              차트 추가
            </Button>
          }
        >
          <ProblemEditorCharts
            hideHeader
            title="문제 차트 (Plotly / Mermaid)"
            charts={problem.charts || []}
            onAddChart={() => handleExpandAndAdd('charts', handleAddChart)}
            onChangeChart={handleChangeChart}
            onRemoveChart={handleRemoveChart}
            onInsertTemplate={handleInsertChartTemplate}
            emptyPlaceholderText="등록된 차트가 없습니다."
            labelPrefix="차트"
          />
        </ProblemEditorCollapsibleSection>

        <Divider sx={{ borderStyle: 'dashed' }} />

        {/* Choices */}
        <ProblemEditorChoices
          choices={problem.choices}
          choiceDescriptions={problem.choiceDescriptions}
          choiceFormulas={problem.choiceFormulas}
          choiceErds={problem.choiceErds}
          choiceCharts={problem.choiceCharts}
          answers={problem.answers}
          answer={problem.answer}
          isMultipleAnswer={problem.isMultipleAnswer}
          disableChoiceShuffle={problem.disableChoiceShuffle}
          onUpdateProblem={onUpdateProblem}
          onAddChoice={handleAddChoice}
          onRemoveChoice={handleRemoveChoice}
          onReorderChoice={handleReorderChoice}
          onChangeChoice={handleChangeChoice}
          onChangeChoiceDescription={handleChangeChoiceDescription}
          onAddChoiceFormula={handleAddChoiceFormula}
          onChangeChoiceFormula={handleChangeChoiceFormula}
          onRemoveChoiceFormula={handleRemoveChoiceFormula}
          onInsertChoiceSymbol={handleInsertChoiceSymbol}
          onAddChoiceErd={handleAddChoiceErd}
          onChangeChoiceErd={handleChangeChoiceErd}
          onRemoveChoiceErd={handleRemoveChoiceErd}
          onInsertChoiceErdTemplate={handleInsertChoiceErdTemplate}
          onAddChoiceChart={handleAddChoiceChart}
          onChangeChoiceChart={handleChangeChoiceChart}
          onRemoveChoiceChart={handleRemoveChoiceChart}
          onInsertChoiceChartTemplate={handleInsertChoiceChartTemplate}
          onOpenBulkDialog={handleOpenBulkDialog}
        />

        {/* Answer Selection */}
        <ProblemEditorAnswerSelect problem={problem} onUpdateProblem={onUpdateProblem} />

        <Divider sx={{ borderStyle: 'dashed' }} />

        {/* LLM Key Concept Section */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <LightbulbIcon sx={{ color: 'warning.main', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              핵심 개념 키워드
            </Typography>
          </Box>
          <FastTextField
            fullWidth
            size="small"
            value={problem.llmKeyConcept || ''}
            onChange={(val) => onUpdateProblem({ llmKeyConcept: val })}
            placeholder="예: 반정규화 기법, GROUP BY 절 집계함수, 계층형 질의 LEVEL (선택 사항)"
          />
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        {/* Explanation */}
        <MarkdownEditor
          label="전체 해설"
          value={problem.explanation}
          onChange={(val) => onUpdateProblem({ explanation: val })}
          placeholder="정답에 대한 전체 상세 해설을 입력하세요... (마크다운 완벽 지원)"
          minRows={3}
        />

        {/* Explanation Formulas (Collapsible) */}
        <ProblemEditorCollapsibleSection
          title="해설 수식 (KaTeX)"
          icon={<FunctionsIcon color="primary" sx={{ fontSize: 20 }} />}
          count={problem.explanationFormulas?.length || 0}
          hasContent={(problem.explanationFormulas?.length || 0) > 0}
          color="primary"
          expanded={isSectionExpanded(
            'explanationFormulas',
            (problem.explanationFormulas?.length || 0) > 0
          )}
          onToggle={() =>
            handleToggleSection(
              'explanationFormulas',
              (problem.explanationFormulas?.length || 0) > 0
            )
          }
          action={
            <Button
              size="small"
              tabIndex={-1}
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleExpandAndAdd('explanationFormulas', handleAddExplanationFormula)}
              sx={{ borderRadius: 1.5, fontWeight: 700 }}
            >
              해설 수식 추가
            </Button>
          }
        >
          <ProblemEditorFormulas
            hideHeader
            title="해설 수식 (KaTeX)"
            formulas={problem.explanationFormulas || []}
            onAddFormula={() => handleExpandAndAdd('explanationFormulas', handleAddExplanationFormula)}
            onChangeFormula={handleChangeExplanationFormula}
            onRemoveFormula={handleRemoveExplanationFormula}
            onInsertSymbol={handleInsertExplanationSymbol}
            emptyPlaceholderText="등록된 해설 수식이 없습니다."
            labelPrefix="LaTeX 해설 수식"
          />
        </ProblemEditorCollapsibleSection>

        {/* Explanation ERD Section (Collapsible) */}
        <ProblemEditorCollapsibleSection
          title="해설 ERD (Entity Relationship Diagram)"
          icon={<SchemaIcon color="info" sx={{ fontSize: 20 }} />}
          count={problem.explanationErds?.length || 0}
          hasContent={(problem.explanationErds?.length || 0) > 0}
          color="info"
          expanded={isSectionExpanded(
            'explanationErds',
            (problem.explanationErds?.length || 0) > 0
          )}
          onToggle={() =>
            handleToggleSection('explanationErds', (problem.explanationErds?.length || 0) > 0)
          }
          action={
            <Button
              size="small"
              tabIndex={-1}
              variant="outlined"
              color="info"
              startIcon={<AddIcon />}
              onClick={() => handleExpandAndAdd('explanationErds', handleAddExplanationErd)}
              sx={{ borderRadius: 1.5, fontWeight: 700 }}
            >
              해설 ERD 추가
            </Button>
          }
        >
          <ProblemEditorErds
            hideHeader
            title="해설 ERD (Entity Relationship Diagram)"
            erds={problem.explanationErds || []}
            onAddErd={() => handleExpandAndAdd('explanationErds', handleAddExplanationErd)}
            onChangeErd={handleChangeExplanationErd}
            onRemoveErd={handleRemoveExplanationErd}
            onInsertTemplate={handleInsertExplanationErdTemplate}
            emptyPlaceholderText="등록된 해설 ERD가 없습니다."
            labelPrefix="해설 ERD"
          />
        </ProblemEditorCollapsibleSection>

        {/* Explanation Charts Section (Collapsible) */}
        <ProblemEditorCollapsibleSection
          title="해설 차트 (Plotly / Mermaid)"
          icon={<BarChartIcon color="success" sx={{ fontSize: 20 }} />}
          count={problem.explanationCharts?.length || 0}
          hasContent={(problem.explanationCharts?.length || 0) > 0}
          color="success"
          expanded={isSectionExpanded(
            'explanationCharts',
            (problem.explanationCharts?.length || 0) > 0
          )}
          onToggle={() =>
            handleToggleSection(
              'explanationCharts',
              (problem.explanationCharts?.length || 0) > 0
            )
          }
          action={
            <Button
              size="small"
              tabIndex={-1}
              variant="outlined"
              color="success"
              startIcon={<AddIcon />}
              onClick={() => handleExpandAndAdd('explanationCharts', handleAddExplanationChart)}
              sx={{ borderRadius: 1.5, fontWeight: 700 }}
            >
              해설 차트 추가
            </Button>
          }
        >
          <ProblemEditorCharts
            hideHeader
            title="해설 차트 (Plotly / Mermaid)"
            charts={problem.explanationCharts || []}
            onAddChart={() => handleExpandAndAdd('explanationCharts', handleAddExplanationChart)}
            onChangeChart={handleChangeExplanationChart}
            onRemoveChart={handleRemoveExplanationChart}
            onInsertTemplate={handleInsertExplanationChartTemplate}
            emptyPlaceholderText="등록된 해설 차트가 없습니다."
            labelPrefix="해설 차트"
          />
        </ProblemEditorCollapsibleSection>

        {/* Choice Explanations (선택지별 상세 설명) */}
        <Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              선택지별 설명
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                size="small"
                tabIndex={-1}
                variant="outlined"
                color="inherit"
                startIcon={<RotateLeftIcon />}
                onClick={handleClearChoiceExplanations}
                sx={{ borderRadius: 1.5, fontWeight: 700 }}
              >
                Clear
              </Button>

              <Button
                size="small"
                tabIndex={-1}
                variant="outlined"
                color={showExpPreview ? 'primary' : 'inherit'}
                startIcon={showExpPreview ? <VisibilityIcon /> : <VisibilityOffIcon />}
                onClick={() => setShowExpPreview((prev) => !prev)}
                sx={{ borderRadius: 1.5, fontWeight: 700 }}
              >
                미리보기 {showExpPreview ? 'ON' : 'OFF'}
              </Button>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {(problem.choiceExplanations || []).map((exp, cIndex) => {
              const choiceText = problem.choices?.[cIndex] || '';
              const expDesc = problem.choiceExplanationDescriptions?.[cIndex] || '';
              const expFormulasList = problem.choiceExplanationFormulas?.[cIndex] || [];
              const expErdsList = problem.choiceExplanationErds?.[cIndex] || [];
              const expChartsList = problem.choiceExplanationCharts?.[cIndex] || [];

              const hasExpDesc = Boolean(expDesc && expDesc.trim().length > 0);
              const hasExpFormulas = expFormulasList.length > 0;
              const hasExpErds = expErdsList.length > 0;
              const hasExpCharts = expChartsList.length > 0;

              const isExpDescOpen = openExpDescState[cIndex] ?? hasExpDesc;
              const isExpFormulaOpen = openExpFormulaState[cIndex] ?? hasExpFormulas;
              const isExpErdOpen = openExpErdState[cIndex] ?? hasExpErds;
              const isExpChartOpen = openExpChartState[cIndex] ?? hasExpCharts;

              return (
                <Box
                  key={cIndex}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: 1.5,
                    border: (t) => `1px solid ${alpha(t.palette.grey[500], 0.16)}`,
                    bgcolor: (t) => alpha(t.palette.grey[500], 0.02),
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 0.5,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        color: 'text.secondary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {cIndex + 1}번: {choiceText || '(내용 없음)'}
                    </Typography>

                    {/* Section Toggle Buttons for Choice Explanation */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Tooltip title="선택지 내용을 설명으로 복사">
                        <span>
                          <IconButton
                            size="small"
                            tabIndex={-1}
                            onClick={() => handleChangeChoiceExplanation(cIndex, choiceText)}
                            disabled={!choiceText}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip title={`${cIndex + 1}번 오답 교정 (취소선 + 올바른 말) 작성`}>
                        <IconButton
                          size="small"
                          tabIndex={-1}
                          color="warning"
                          onClick={() => setCorrectionDialogIndex(cIndex)}
                          sx={{
                            bgcolor: (t) => alpha(t.palette.warning.main, 0.08),
                            '&:hover': {
                              bgcolor: (t) => alpha(t.palette.warning.main, 0.16),
                            },
                          }}
                        >
                          <AutoFixHighIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={`${cIndex + 1}번 설명 추가 설명`}>
                        <IconButton
                          size="small"
                          tabIndex={-1}
                          color={isExpDescOpen || hasExpDesc ? 'primary' : 'default'}
                          onClick={() => toggleExpDesc(cIndex)}
                          sx={{
                            bgcolor:
                              isExpDescOpen || hasExpDesc
                                ? (t) => alpha(t.palette.primary.main, 0.08)
                                : 'transparent',
                          }}
                        >
                          <ArticleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={`${cIndex + 1}번 설명 추가 수식`}>
                        <IconButton
                          size="small"
                          tabIndex={-1}
                          color={isExpFormulaOpen || hasExpFormulas ? 'primary' : 'default'}
                          onClick={() => toggleExpFormula(cIndex)}
                          sx={{
                            bgcolor:
                              isExpFormulaOpen || hasExpFormulas
                                ? (t) => alpha(t.palette.primary.main, 0.08)
                                : 'transparent',
                          }}
                        >
                          <FunctionsIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={`${cIndex + 1}번 설명 추가 ERD`}>
                        <IconButton
                          size="small"
                          tabIndex={-1}
                          color={isExpErdOpen || hasExpErds ? 'info' : 'default'}
                          onClick={() => toggleExpErd(cIndex)}
                          sx={{
                            bgcolor:
                              isExpErdOpen || hasExpErds
                                ? (t) => alpha(t.palette.info.main, 0.08)
                                : 'transparent',
                          }}
                        >
                          <SchemaIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={`${cIndex + 1}번 설명 추가 차트`}>
                        <IconButton
                          size="small"
                          tabIndex={-1}
                          color={isExpChartOpen || hasExpCharts ? 'success' : 'default'}
                          onClick={() => toggleExpChart(cIndex)}
                          sx={{
                            bgcolor:
                              isExpChartOpen || hasExpCharts
                                ? (t) => alpha(t.palette.success.main, 0.08)
                                : 'transparent',
                          }}
                        >
                          <BarChartIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <FastTextField
                    fullWidth
                    size="small"
                    label={`${cIndex + 1}번 설명`}
                    value={exp}
                    onChange={(val) => handleChangeChoiceExplanation(cIndex, val)}
                    placeholder={`${cIndex + 1}번 선택지에 대한 설명`}
                  />

                  {/* Dedicated Sub-Section: N번 설명 추가 설명 */}
                  {(isExpDescOpen || hasExpDesc) && (
                    <ProblemEditorCollapsibleSection
                      title={`${cIndex + 1}번 설명 추가 설명`}
                      icon={<ArticleIcon sx={{ fontSize: 18, color: 'text.secondary' }} />}
                      hasContent={hasExpDesc}
                      color="primary"
                      expanded={isExpDescOpen}
                      onToggle={() => toggleExpDesc(cIndex)}
                      action={
                        <Button
                          size="small"
                          tabIndex={-1}
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => {
                            handleChangeChoiceExplanationDescription(cIndex, '');
                          }}
                          sx={{ borderRadius: 1.5, fontWeight: 700 }}
                        >
                          설명 삭제
                        </Button>
                      }
                    >
                      <MarkdownEditor
                        hideHeader
                        label={`${cIndex + 1}번 설명 추가 설명`}
                        value={expDesc}
                        onChange={(val) => handleChangeChoiceExplanationDescription(cIndex, val)}
                        placeholder={`${cIndex + 1}번 선택지 설명에 대한 보충 설명을 입력하세요... (마크다운 지원)`}
                        minRows={2}
                      />
                    </ProblemEditorCollapsibleSection>
                  )}

                  {/* Dedicated Sub-Section: N번 설명 추가 수식 */}
                  {(isExpFormulaOpen || hasExpFormulas) && (
                    <ProblemEditorCollapsibleSection
                      title={`${cIndex + 1}번 설명 추가 수식`}
                      icon={<FunctionsIcon color="primary" sx={{ fontSize: 18 }} />}
                      count={expFormulasList.length}
                      hasContent={hasExpFormulas}
                      color="primary"
                      expanded={isExpFormulaOpen}
                      onToggle={() => toggleExpFormula(cIndex)}
                      action={
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          startIcon={<AddIcon />}
                          onClick={() => handleAddChoiceExplanationFormula(cIndex)}
                          sx={{ borderRadius: 1.5, fontWeight: 700 }}
                        >
                          해설 수식 추가
                        </Button>
                      }
                    >
                      <ProblemEditorFormulas
                        hideHeader
                        title={`${cIndex + 1}번 설명 추가 수식`}
                        formulas={expFormulasList}
                        onAddFormula={() => handleAddChoiceExplanationFormula(cIndex)}
                        onChangeFormula={(fIdx, val) =>
                          handleChangeChoiceExplanationFormula(cIndex, fIdx, val)
                        }
                        onRemoveFormula={(fIdx) =>
                          handleRemoveChoiceExplanationFormula(cIndex, fIdx)
                        }
                        onInsertSymbol={(fIdx, sym) =>
                          handleInsertChoiceExplanationSymbol(cIndex, fIdx, sym)
                        }
                        emptyPlaceholderText={`${cIndex + 1}번 설명에 등록된 수식이 없습니다.`}
                        labelPrefix={`${cIndex + 1}번 설명 수식`}
                      />
                    </ProblemEditorCollapsibleSection>
                  )}

                  {/* Dedicated Sub-Section: N번 설명 추가 ERD */}
                  {(isExpErdOpen || hasExpErds) && (
                    <ProblemEditorCollapsibleSection
                      title={`${cIndex + 1}번 설명 추가 ERD`}
                      icon={<SchemaIcon color="info" sx={{ fontSize: 18 }} />}
                      count={expErdsList.length}
                      hasContent={hasExpErds}
                      color="info"
                      expanded={isExpErdOpen}
                      onToggle={() => toggleExpErd(cIndex)}
                      action={
                        <Button
                          size="small"
                          variant="outlined"
                          color="info"
                          startIcon={<AddIcon />}
                          onClick={() => handleAddChoiceExplanationErd(cIndex)}
                          sx={{ borderRadius: 1.5, fontWeight: 700 }}
                        >
                          해설 ERD 추가
                        </Button>
                      }
                    >
                      <ProblemEditorErds
                        hideHeader
                        title={`${cIndex + 1}번 설명 추가 ERD`}
                        erds={expErdsList}
                        onAddErd={() => handleAddChoiceExplanationErd(cIndex)}
                        onChangeErd={(erdIdx, val) =>
                          handleChangeChoiceExplanationErd(cIndex, erdIdx, val)
                        }
                        onRemoveErd={(erdIdx) =>
                          handleRemoveChoiceExplanationErd(cIndex, erdIdx)
                        }
                        onInsertTemplate={(erdIdx, tmpl) =>
                          handleInsertChoiceExplanationErdTemplate(cIndex, erdIdx, tmpl)
                        }
                        emptyPlaceholderText={`${cIndex + 1}번 설명에 등록된 ERD가 없습니다.`}
                        labelPrefix={`${cIndex + 1}번 설명 ERD`}
                      />
                    </ProblemEditorCollapsibleSection>
                  )}

                  {/* Dedicated Sub-Section: N번 설명 추가 차트 */}
                  {(isExpChartOpen || hasExpCharts) && (
                    <ProblemEditorCollapsibleSection
                      title={`${cIndex + 1}번 설명 추가 차트`}
                      icon={<BarChartIcon color="success" sx={{ fontSize: 18 }} />}
                      count={expChartsList.length}
                      hasContent={hasExpCharts}
                      color="success"
                      expanded={isExpChartOpen}
                      onToggle={() => toggleExpChart(cIndex)}
                      action={
                        <Button
                          size="small"
                          tabIndex={-1}
                          variant="outlined"
                          color="success"
                          startIcon={<AddIcon />}
                          onClick={() => handleAddChoiceExplanationChart(cIndex)}
                          sx={{ borderRadius: 1.5, fontWeight: 700 }}
                        >
                          해설 차트 추가
                        </Button>
                      }
                    >
                      <ProblemEditorCharts
                        hideHeader
                        title={`${cIndex + 1}번 설명 추가 차트`}
                        charts={expChartsList}
                        onAddChart={() => handleAddChoiceExplanationChart(cIndex)}
                        onChangeChart={(chartIdx, val) =>
                          handleChangeChoiceExplanationChart(cIndex, chartIdx, val)
                        }
                        onRemoveChart={(chartIdx) =>
                          handleRemoveChoiceExplanationChart(cIndex, chartIdx)
                        }
                        onInsertTemplate={(chartIdx, tmpl) =>
                          handleInsertChoiceExplanationChartTemplate(cIndex, chartIdx, tmpl)
                        }
                        emptyPlaceholderText={`${cIndex + 1}번 설명에 등록된 차트가 없습니다.`}
                        labelPrefix={`${cIndex + 1}번 설명 차트`}
                      />
                    </ProblemEditorCollapsibleSection>
                  )}

                  {/* Live Preview Box for Choice Explanation (Toggled via showExpPreview, default OFF) */}
                  {showExpPreview && exp && exp.trim().length > 0 && (
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 1,
                        bgcolor: (t) => alpha(t.palette.grey[500], 0.04),
                        border: (t) => `1px dashed ${alpha(t.palette.grey[500], 0.2)}`,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.disabled', fontWeight: 700, mb: 0.5, display: 'block' }}
                      >
                        {cIndex + 1}번 설명 미리보기:
                      </Typography>
                      <RichContentRenderer content={exp} idPrefix={`exp_edit_${cIndex}`} />
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* Choice Explanation Correction Dialog */}
      <ProblemEditorCorrectionDialog
        open={correctionDialogIndex !== null}
        onClose={() => setCorrectionDialogIndex(null)}
        initialSentence={
          correctionDialogIndex !== null
            ? problem.choiceExplanations?.[correctionDialogIndex] ||
              problem.choices?.[correctionDialogIndex] ||
              ''
            : ''
        }
        title={`${(correctionDialogIndex ?? 0) + 1}번 오답 교정 (취소선 + 올바른 말)`}
        onApply={(resultText) => {
          if (correctionDialogIndex !== null) {
            handleChangeChoiceExplanation(correctionDialogIndex, resultText);
          }
        }}
      />

      {/* Bulk Choices Input Dialog */}
      <ProblemEditorBulkDialog
        open={bulkDialogOpen}
        onClose={() => setBulkDialogOpen(false)}
        choicesCount={problem.choices?.length}
        bulkText={bulkText}
        onBulkTextChange={setBulkText}
        onApplyBulk={handleApplyBulk}
      />

      {/* Bulk Problem + Choices Dialog */}
      <ProblemEditorBulkDialog
        open={problemBulkDialogOpen}
        onClose={() => setProblemBulkDialogOpen(false)}
        title="문제 및 선택지 일괄 입력 (Bulk Edit)"
        placeholder={`첫 줄은 문제 내용입니다.\n1번 선택지\n2번 선택지\n3번 선택지\n4번 선택지`}
        bulkText={problemBulkText}
        onBulkTextChange={setProblemBulkText}
        onApplyBulk={handleApplyProblemBulk}
      />
    </Card>
  );
});
