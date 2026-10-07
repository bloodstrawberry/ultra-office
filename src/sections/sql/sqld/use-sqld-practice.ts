'use client';

import type {
  Problem,
  SqldViewMode,
  SqldProblemData,
  RoundStatistics,
  UserProblemRecord,
  SqldNavigationFilter,
} from './types';

import { toast } from 'sonner';
import { useMemo, useState, useEffect, useCallback } from 'react';

import { CONFIG } from 'src/global-config';

import { createEmptyProblem, getProblemAttemptCounts } from './types';

// ----------------------------------------------------------------------

/**
 * Loads problem.json robustly across all deployment environments (Local, GitHub Pages with basePath, etc.)
 */
async function fetchSqldProblemData(): Promise<SqldProblemData> {
  const candidateUrls: string[] = [];

  // 1. Configured base path / assetsDir from global config or process.env
  const configBase = (CONFIG.assetsDir || process.env.NEXT_PUBLIC_BASE_PATH || '')
    .trim()
    .replace(/\/$/, '');
  if (configBase) {
    candidateUrls.push(`${configBase}/sqld/problem.json`);
  }

  // 2. Browser runtime location detection for GitHub Pages subpath hosting
  if (typeof window !== 'undefined') {
    const { pathname, origin } = window.location;

    // A. Detect prefix preceding '/sql' (e.g. '/ultra-office/sql/sqld/' -> '/ultra-office')
    const sqlIdx = pathname.indexOf('/sql');
    if (sqlIdx > 0) {
      const detectedPrefix = pathname.substring(0, sqlIdx).replace(/\/$/, '');
      if (detectedPrefix) {
        candidateUrls.push(`${detectedPrefix}/sqld/problem.json`);
        candidateUrls.push(`${origin}${detectedPrefix}/sqld/problem.json`);
      }
    }

    // B. Detect first pathname segment if it looks like a repository name (e.g. /ultra-office/...)
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0 && segments[0] !== 'sql' && segments[0] !== 'public') {
      candidateUrls.push(`/${segments[0]}/sqld/problem.json`);
      candidateUrls.push(`${origin}/${segments[0]}/sqld/problem.json`);
    }

    if (configBase) {
      candidateUrls.push(`${origin}${configBase}/sqld/problem.json`);
    }
  }

  // 3. Fallback standard and relative paths
  candidateUrls.push('/sqld/problem.json');
  candidateUrls.push('./sqld/problem.json');
  candidateUrls.push('sqld/problem.json');
  candidateUrls.push('../../sqld/problem.json');

  const uniqueUrls = Array.from(new Set(candidateUrls.filter(Boolean)));

  let lastError: Error | null = null;
  for (const url of uniqueUrls) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) {
        continue;
      }
      const text = await response.text();
      const trimmed = text.trim();
      // Ensure the response is valid JSON and not an HTML 404/fallback page
      if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
        continue;
      }
      const json: SqldProblemData = JSON.parse(trimmed);
      if (json && Array.isArray(json.tree) && json.tree.length > 0 && json.scripts) {
        return json;
      }
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError || new Error('SQLD 기출문제 데이터(problem.json)를 불러오는 데 실패했습니다.');
}

// ----------------------------------------------------------------------

const STORAGE_KEY_RECORDS = 'sqld_practice_records_v1';
const STORAGE_KEY_ROUND = 'sqld_selected_round_v1';
const STORAGE_KEY_STUDY_MODE = 'sqld_study_mode_v1';
const STORAGE_KEY_CUSTOM_DATA = 'sqld_custom_problem_data_v1';

function getNavigationIndices(
  problems: Problem[],
  records: Record<number, UserProblemRecord>,
  filter: SqldNavigationFilter
): number[] {
  return problems.flatMap((_, index) => {
    const counts = getProblemAttemptCounts(records[index]);
    if (filter === 'everWrong' && counts.wrongCount === 0) return [];
    if (filter === 'wrongOrUnanswered' && counts.wrongCount === 0 && counts.totalAttempts > 0) {
      return [];
    }
    return [index];
  });
}

function isCurrentCustomData(custom: SqldProblemData, original: SqldProblemData): boolean {
  return (
    Array.isArray(custom.tree) &&
    custom.tree.length === original.tree.length &&
    custom.tree.every(
      (round, index) =>
        round.id === original.tree[index].id &&
        round.modifiedAt === original.tree[index].modifiedAt &&
        Array.isArray(custom.scripts?.[round.id]?.problems)
    )
  );
}

export function useSqldPractice() {
  const [data, setData] = useState<SqldProblemData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<SqldViewMode>('practice');
  const [selectedRoundId, setSelectedRoundId] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [pageInput, setPageInput] = useState<string>('1');
  const [showAllAnswers, setShowAllAnswers] = useState<boolean>(false);
  const [showMap, setShowMap] = useState<boolean>(false);
  const [navigationFilter, setNavigationFilter] = useState<SqldNavigationFilter>('all');

  // Stored user answers: roundId -> problemIndex -> record
  const [userRecords, setUserRecords] = useState<Record<string, Record<number, UserProblemRecord>>>(
    {}
  );
  const [hasLoadedStorage, setHasLoadedStorage] = useState<boolean>(false);

  // 1. Load problem.json and use local edits only when they match its version.
  const loadProblemData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const original = await fetchSqldProblemData();
      let nextData = original;

      // Older full snapshots can hide newly added rounds and corrected questions.
      const customDataStr = localStorage.getItem(STORAGE_KEY_CUSTOM_DATA);
      if (customDataStr) {
        try {
          const parsedCustom: SqldProblemData = JSON.parse(customDataStr);
          if (parsedCustom && isCurrentCustomData(parsedCustom, original)) {
            nextData = parsedCustom;
          }
        } catch {
          // Ignore malformed local edits and use the current source data.
        }
      }

      setData(nextData);
      // Set initial round if not set or invalid
      if (nextData.tree && nextData.tree.length > 0) {
        setSelectedRoundId((prev) => {
          if (prev && nextData.scripts?.[prev]) return prev;
          return nextData.tree[0].id;
        });
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProblemData();
  }, [loadProblemData]);

  // 2. Hydration-safe load from localStorage
  useEffect(() => {
    try {
      const savedRound = localStorage.getItem(STORAGE_KEY_ROUND);
      if (savedRound) {
        setSelectedRoundId(savedRound);
      }

      // 새로고침 후에는 학습 모드(정답 전체 보기)를 항상 정답 OFF(false)로 시작
      setShowAllAnswers(false);
      try {
        localStorage.removeItem(STORAGE_KEY_STUDY_MODE);
      } catch {
        // Ignore
      }

      const savedRecords = localStorage.getItem(STORAGE_KEY_RECORDS);
      if (savedRecords) {
        const parsed = JSON.parse(savedRecords);
        if (parsed && typeof parsed === 'object') {
          // 새로고침 시 풀었던 문제들도 다시 정답 OFF(선택 및 해설 닫힘) 상태로 리셋하되,
          // 문제 번호 옆에 표기될 정답/오답 누적 횟수(correctCount, wrongCount)는 그대로 보존
          const sanitizedRecords: Record<string, Record<number, UserProblemRecord>> = {};
          for (const [roundId, roundProblems] of Object.entries(parsed)) {
            if (roundProblems && typeof roundProblems === 'object') {
              sanitizedRecords[roundId] = {};
              for (const [idxStr, rec] of Object.entries(
                roundProblems as Record<string, UserProblemRecord>
              )) {
                const idx = Number(idxStr);
                const counts = getProblemAttemptCounts(rec);
                sanitizedRecords[roundId][idx] = {
                  selectedAnswers: [],
                  isSubmitted: false,
                  isCorrect: false,
                  isRevealed: false,
                  correctCount: counts.correctCount,
                  wrongCount: counts.wrongCount,
                };
              }
            }
          }
          setUserRecords(sanitizedRecords);
        }
      }
    } catch {
      // Ignore storage read error
    } finally {
      setHasLoadedStorage(true);
    }
  }, []);

  // 3. Save progress records to localStorage
  useEffect(() => {
    if (!hasLoadedStorage) return;
    try {
      if (selectedRoundId) {
        localStorage.setItem(STORAGE_KEY_ROUND, selectedRoundId);
      }
      localStorage.setItem(STORAGE_KEY_STUDY_MODE, String(showAllAnswers));
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(userRecords));
    } catch {
      // Ignore storage write error
    }
  }, [hasLoadedStorage, selectedRoundId, showAllAnswers, userRecords]);

  // Ensure selectedRoundId is valid in data.scripts
  useEffect(() => {
    if (data && data.tree && data.tree.length > 0 && data.scripts) {
      if (!selectedRoundId || !data.scripts[selectedRoundId]) {
        setSelectedRoundId(data.tree[0].id);
      }
    }
  }, [data, selectedRoundId]);

  // Current round problems
  const currentProblems: Problem[] = useMemo(() => {
    if (!data || !selectedRoundId) return [];
    return data.scripts[selectedRoundId]?.problems || [];
  }, [data, selectedRoundId]);

  const currentProblem: Problem | undefined = currentProblems[currentIndex];
  const currentRoundRecords = useMemo(
    () => (selectedRoundId ? userRecords[selectedRoundId] || {} : {}),
    [userRecords, selectedRoundId]
  );
  const currentRecord: UserProblemRecord | undefined = currentRoundRecords[currentIndex];
  const navigationIndices = useMemo(
    () => getNavigationIndices(currentProblems, currentRoundRecords, navigationFilter),
    [currentProblems, currentRoundRecords, navigationFilter]
  );
  const canGoPrev = navigationIndices.some((index) => index < currentIndex);
  const canGoNext = navigationIndices.some((index) => index > currentIndex);

  // Keep pageInput synced with currentIndex
  useEffect(() => {
    setPageInput(String(currentIndex + 1));
  }, [currentIndex]);

  // 4. Round switch handler
  const handleSelectRound = useCallback(
    (roundId: string) => {
      setSelectedRoundId(roundId);
      const indices = getNavigationIndices(
        data?.scripts[roundId]?.problems || [],
        userRecords[roundId] || {},
        navigationFilter
      );
      const firstIndex = indices[0] ?? 0;
      setCurrentIndex(firstIndex);
      setPageInput(String(firstIndex + 1));
    },
    [data, userRecords, navigationFilter]
  );

  const handleSelectNavigationFilter = useCallback(
    (filter: SqldNavigationFilter) => {
      setNavigationFilter(filter);
      const indices = getNavigationIndices(currentProblems, currentRoundRecords, filter);
      if (indices.length > 0) {
        setCurrentIndex((index) => (indices.includes(index) ? index : indices[0]));
      }
    },
    [currentProblems, currentRoundRecords]
  );

  // 5. Navigation handlers
  const handlePrevProblem = useCallback(() => {
    setCurrentIndex((prev) => {
      const previous = navigationIndices.filter((index) => index < prev);
      return previous[previous.length - 1] ?? prev;
    });
  }, [navigationIndices]);

  const handleNextProblem = useCallback(() => {
    setCurrentIndex((prev) => navigationIndices.find((index) => index > prev) ?? prev);
  }, [navigationIndices]);

  const handleJumpTo = useCallback(
    (index: number) => {
      if (index >= 0 && index < currentProblems.length) {
        setCurrentIndex(index);
      }
    },
    [currentProblems.length]
  );

  const handlePageInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  }, []);

  const handlePageInputBlur = useCallback(() => {
    const num = Number(pageInput);
    if (
      Number.isInteger(num) &&
      num >= 1 &&
      num <= currentProblems.length &&
      navigationIndices.includes(num - 1)
    ) {
      setCurrentIndex(num - 1);
    } else {
      setPageInput(String(currentIndex + 1));
    }
  }, [pageInput, currentProblems.length, currentIndex, navigationIndices]);

  const handlePageInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handlePageInputBlur();
      }
    },
    [handlePageInputBlur]
  );

  // 6. Choice Selection Handler
  const handleSelectChoice = useCallback(
    (choiceNum: number, isMultiple: boolean) => {
      if (!selectedRoundId || !currentProblem) return;

      setUserRecords((prev) => {
        const roundMap = prev[selectedRoundId] || {};
        const oldRecord = roundMap[currentIndex] || {
          selectedAnswers: [],
          isSubmitted: false,
          isCorrect: false,
          isRevealed: false,
        };

        if (oldRecord.isSubmitted) return prev; // Do not modify if already submitted

        let updatedSelections: number[];
        if (isMultiple) {
          if (oldRecord.selectedAnswers.includes(choiceNum)) {
            updatedSelections = oldRecord.selectedAnswers.filter((n) => n !== choiceNum);
          } else {
            updatedSelections = [...oldRecord.selectedAnswers, choiceNum].sort((a, b) => a - b);
          }
        } else {
          updatedSelections = [choiceNum];
        }

        // A single-answer choice is a complete answer, so grade and reveal it immediately.
        const isCorrect = !isMultiple && choiceNum === currentProblem.answer;
        const counts = getProblemAttemptCounts(oldRecord);

        return {
          ...prev,
          [selectedRoundId]: {
            ...roundMap,
            [currentIndex]: {
              ...oldRecord,
              selectedAnswers: updatedSelections,
              isSubmitted: isMultiple ? oldRecord.isSubmitted : true,
              isCorrect: isMultiple ? oldRecord.isCorrect : isCorrect,
              isRevealed: isMultiple ? oldRecord.isRevealed : true,
              correctCount: isMultiple
                ? counts.correctCount
                : counts.correctCount + (isCorrect ? 1 : 0),
              wrongCount: isMultiple ? counts.wrongCount : counts.wrongCount + (isCorrect ? 0 : 1),
            },
          },
        };
      });
    },
    [selectedRoundId, currentIndex, currentProblem]
  );

  // 7. Submit Answer (Grading)
  const handleSubmitAnswer = useCallback(() => {
    if (!selectedRoundId || !currentProblem) return;
    if (currentRecord?.isSubmitted) return;

    const selections = currentRecord?.selectedAnswers || [];
    if (selections.length === 0) {
      toast.warning('정답을 먼저 선택해 주세요.');
      return;
    }

    const isMultiple = Boolean(currentProblem.isMultipleAnswer);
    let isCorrect = false;

    if (isMultiple) {
      const correctList = (currentProblem.answers || []).slice().sort((a, b) => a - b);
      const userList = selections.slice().sort((a, b) => a - b);
      isCorrect =
        correctList.length === userList.length &&
        correctList.every((val, idx) => val === userList[idx]);
    } else {
      isCorrect = selections[0] === currentProblem.answer;
    }

    setUserRecords((prev) => {
      const roundMap = prev[selectedRoundId] || {};
      const oldRecord = roundMap[currentIndex] || {
        selectedAnswers: [],
        isSubmitted: false,
        isCorrect: false,
        isRevealed: false,
        correctCount: 0,
        wrongCount: 0,
      };

      const counts = getProblemAttemptCounts(oldRecord);
      const nextCorrectCount = isCorrect ? counts.correctCount + 1 : counts.correctCount;
      const nextWrongCount = !isCorrect ? counts.wrongCount + 1 : counts.wrongCount;

      return {
        ...prev,
        [selectedRoundId]: {
          ...roundMap,
          [currentIndex]: {
            ...oldRecord,
            selectedAnswers: selections,
            isSubmitted: true,
            isCorrect,
            isRevealed: true,
            correctCount: nextCorrectCount,
            wrongCount: nextWrongCount,
          },
        },
      };
    });

    if (isCorrect) {
      toast.success('정답입니다!');
    } else {
      toast.error('오답입니다. 해설을 확인해 보세요.');
    }
  }, [selectedRoundId, currentProblem, currentRecord, currentIndex]);

  // 8. Reveal Answer without Grading
  const handleRevealAnswer = useCallback(() => {
    if (!selectedRoundId) return;

    setUserRecords((prev) => {
      const roundMap = prev[selectedRoundId] || {};
      const oldRecord = roundMap[currentIndex] || {
        selectedAnswers: [],
        isSubmitted: false,
        isCorrect: false,
        isRevealed: false,
      };

      return {
        ...prev,
        [selectedRoundId]: {
          ...roundMap,
          [currentIndex]: {
            ...oldRecord,
            isRevealed: true,
          },
        },
      };
    });
  }, [selectedRoundId, currentIndex]);

  // 9. Reset single problem (다시 풀기: 답안 초기화하되 누적 풀이 횟수는 보존)
  const handleResetProblem = useCallback(() => {
    if (!selectedRoundId) return;

    setUserRecords((prev) => {
      const roundMap = { ...(prev[selectedRoundId] || {}) };
      const oldRecord = roundMap[currentIndex];
      if (!oldRecord) return prev;

      const counts = getProblemAttemptCounts(oldRecord);

      return {
        ...prev,
        [selectedRoundId]: {
          ...roundMap,
          [currentIndex]: {
            selectedAnswers: [],
            isSubmitted: false,
            isCorrect: false,
            isRevealed: false,
            correctCount: counts.correctCount,
            wrongCount: counts.wrongCount,
          },
        },
      };
    });
    toast.info('문제 답안이 초기화되었습니다. 다시 풀어보세요.');
  }, [selectedRoundId, currentIndex]);

  // 10. Reset whole round
  const handleResetRound = useCallback(() => {
    if (!selectedRoundId) return;

    setUserRecords((prev) => {
      const copy = { ...prev };
      delete copy[selectedRoundId];
      return copy;
    });
    toast.success('현재 회차의 모든 풀이 기록이 초기화되었습니다.');
  }, [selectedRoundId]);

  // 11. Toggle Study Mode (Show all answers)
  const handleToggleShowAllAnswers = useCallback(() => {
    setShowAllAnswers((prev) => {
      const next = !prev;
      toast.info(next ? '학습 모드 (정답 ON) 활성화' : '시험 모드 (정답 OFF) 활성화');
      return next;
    });
  }, []);

  // 12. Copy Problem text
  const handleCopyProblem = useCallback(() => {
    if (!currentProblem) return;

    const { question, description, choices } = currentProblem;
    const clean = (txt: string) => txt.replace(/\\/g, '');
    const choicesText = choices.map((c, i) => `${i + 1}) ${clean(c)}`).join('\n');
    const textToCopy = `[SQLD ${currentIndex + 1}번]\n${clean(question)}${description ? `\n\n${clean(description)}` : ''}\n\n${choicesText}`;

    navigator.clipboard.writeText(textToCopy);
    toast.success('문제가 클립보드에 복사되었습니다.');
  }, [currentProblem, currentIndex]);

  // ----------------------------------------------------------------------
  // EDITING METHODS (문제 편집 기능)
  // ----------------------------------------------------------------------

  // 13. Update problem in state
  const updateProblem = useCallback(
    (updates: Partial<Problem>) => {
      if (!selectedRoundId) return;

      setData((prev) => {
        if (!prev) return prev;
        const currentRoundProblems = [...(prev.scripts[selectedRoundId]?.problems || [])];
        if (!currentRoundProblems[currentIndex]) return prev;

        currentRoundProblems[currentIndex] = {
          ...currentRoundProblems[currentIndex],
          ...updates,
        };

        const nextData: SqldProblemData = {
          ...prev,
          scripts: {
            ...prev.scripts,
            [selectedRoundId]: {
              problems: currentRoundProblems,
            },
          },
        };

        // Save automatically to localStorage custom data
        try {
          localStorage.setItem(STORAGE_KEY_CUSTOM_DATA, JSON.stringify(nextData));
        } catch {
          // Ignore
        }

        return nextData;
      });
    },
    [selectedRoundId, currentIndex]
  );

  // 14. Add empty problem to round
  const handleAddProblem = useCallback(() => {
    if (!selectedRoundId) return;

    setData((prev) => {
      if (!prev) return prev;
      const currentRoundProblems = [...(prev.scripts[selectedRoundId]?.problems || [])];
      const newProblem = createEmptyProblem(4);
      currentRoundProblems.push(newProblem);

      const nextData: SqldProblemData = {
        ...prev,
        scripts: {
          ...prev.scripts,
          [selectedRoundId]: {
            problems: currentRoundProblems,
          },
        },
      };

      try {
        localStorage.setItem(STORAGE_KEY_CUSTOM_DATA, JSON.stringify(nextData));
      } catch {
        // Ignore
      }

      return nextData;
    });

    setCurrentIndex(currentProblems.length);
    toast.success(`${currentProblems.length + 1}번 새 문제가 추가되었습니다.`);
  }, [selectedRoundId, currentProblems.length]);

  // 15. Duplicate current problem
  const handleDuplicateProblem = useCallback(() => {
    if (!selectedRoundId || !currentProblem) return;

    setData((prev) => {
      if (!prev) return prev;
      const currentRoundProblems = [...(prev.scripts[selectedRoundId]?.problems || [])];
      const cloned = JSON.parse(JSON.stringify(currentProblem));
      currentRoundProblems.splice(currentIndex + 1, 0, cloned);

      const nextData: SqldProblemData = {
        ...prev,
        scripts: {
          ...prev.scripts,
          [selectedRoundId]: {
            problems: currentRoundProblems,
          },
        },
      };

      try {
        localStorage.setItem(STORAGE_KEY_CUSTOM_DATA, JSON.stringify(nextData));
      } catch {
        // Ignore
      }

      return nextData;
    });

    setCurrentIndex((prev) => prev + 1);
    toast.success('문제가 복제되었습니다.');
  }, [selectedRoundId, currentProblem, currentIndex]);

  // 16. Remove problem
  const handleRemoveProblem = useCallback(() => {
    if (!selectedRoundId || currentProblems.length <= 1) {
      toast.error('최소 1개 이상의 문제가 존재해야 합니다.');
      return;
    }

    setData((prev) => {
      if (!prev) return prev;
      const currentRoundProblems = [...(prev.scripts[selectedRoundId]?.problems || [])];
      currentRoundProblems.splice(currentIndex, 1);

      const nextData: SqldProblemData = {
        ...prev,
        scripts: {
          ...prev.scripts,
          [selectedRoundId]: {
            problems: currentRoundProblems,
          },
        },
      };

      try {
        localStorage.setItem(STORAGE_KEY_CUSTOM_DATA, JSON.stringify(nextData));
      } catch {
        // Ignore
      }

      return nextData;
    });

    setCurrentIndex((prev) => Math.max(0, prev - 1));
    toast.info('문제가 삭제되었습니다.');
  }, [selectedRoundId, currentProblems.length, currentIndex]);

  // 17. Manual Save button handler
  const handleSaveData = useCallback(() => {
    if (!data) return;
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_DATA, JSON.stringify(data));
      toast.success('수정된 문제 데이터가 로컬 저장소에 저장되었습니다.');
    } catch {
      toast.error('저장 중 오류가 발생했습니다.');
    }
  }, [data]);

  // 18. Export / Download JSON file
  const handleExportJson = useCallback(() => {
    if (!data) return;

    try {
      const dataStr =
        'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', 'problem.json');
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('problem.json 파일이 다운로드되었습니다.');
    } catch {
      toast.error('JSON 내보내기 중 오류가 발생했습니다.');
    }
  }, [data]);

  // 19. Reset all edits to original public/sqld/problem.json
  const handleResetToDefault = useCallback(async () => {
    try {
      localStorage.removeItem(STORAGE_KEY_CUSTOM_DATA);
      const json = await fetchSqldProblemData();
      setData(json);
      if (json.tree && json.tree.length > 0) {
        setSelectedRoundId((prev) => {
          if (prev && json.scripts?.[prev]) return prev;
          return json.tree[0].id;
        });
      }
      toast.success('원본 problem.json 데이터로 복원되었습니다.');
    } catch {
      toast.error('원본 데이터를 불러오지 못했습니다.');
    }
  }, []);

  // 20. Keyboard Shortcuts (practice mode only)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (viewMode !== 'practice') return;

      if (e.shiftKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevProblem();
      } else if (e.shiftKey && e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextProblem();
      } else if (['1', '2', '3', '4'].includes(e.key)) {
        const choiceNum = parseInt(e.key, 10);
        if (currentProblem && !currentRecord?.isSubmitted) {
          handleSelectChoice(choiceNum, Boolean(currentProblem.isMultipleAnswer));
        }
      } else if (e.key === 'Enter') {
        if (!currentRecord?.isSubmitted && currentRecord?.selectedAnswers?.length) {
          e.preventDefault();
          handleSubmitAnswer();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    viewMode,
    handlePrevProblem,
    handleNextProblem,
    currentProblem,
    currentRecord,
    handleSelectChoice,
    handleSubmitAnswer,
  ]);

  // 21. Compute Statistics for Active Round
  const roundStatistics: RoundStatistics = useMemo(() => {
    const total = currentProblems.length || 50;
    let solved = 0;
    let correct = 0;
    let s1Solved = 0;
    let s1Correct = 0;
    let s2Solved = 0;
    let s2Correct = 0;

    for (let i = 0; i < total; i++) {
      const rec = currentRoundRecords[i];
      if (rec?.isSubmitted) {
        solved++;
        if (rec.isCorrect) {
          correct++;
        }
        if (i < 10) {
          s1Solved++;
          if (rec.isCorrect) s1Correct++;
        } else {
          s2Solved++;
          if (rec.isCorrect) s2Correct++;
        }
      }
    }

    const s1Total = Math.min(10, total);
    const s2Total = Math.max(0, total - 10);
    const s1Percent = s1Total > 0 ? (s1Correct / s1Total) * 100 : 0;
    const s2Percent = s2Total > 0 ? (s2Correct / s2Total) * 100 : 0;
    const s1Passed = s1Percent >= 40;
    const s2Passed = s2Percent >= 40;
    const totalScore = correct * 2;
    const isOverallPassed = totalScore >= 60 && s1Passed && s2Passed;

    return {
      total,
      solved,
      correct,
      subject1: {
        subjectNumber: 1,
        title: '데이터 모델링의 이해',
        total: s1Total,
        solved: s1Solved,
        correct: s1Correct,
        scorePercentage: s1Percent,
        isPassed: s1Passed,
      },
      subject2: {
        subjectNumber: 2,
        title: 'SQL 기본 및 활용',
        total: s2Total,
        solved: s2Solved,
        correct: s2Correct,
        scorePercentage: s2Percent,
        isPassed: s2Passed,
      },
      totalScore,
      isOverallPassed,
    };
  }, [currentProblems.length, currentRoundRecords]);

  return {
    rounds: data?.tree || [],
    totalQuestionCount:
      data?.tree.reduce(
        (total, round) => total + (data.scripts[round.id]?.problems.length || 0),
        0
      ) || 0,
    selectedRoundId,
    currentProblems,
    currentProblem,
    currentIndex,
    pageInput,
    navigationFilter,
    navigationCount: navigationIndices.length,
    canGoPrev,
    canGoNext,
    showAllAnswers,
    showMap,
    loading,
    error,
    currentRoundRecords,
    currentRecord,
    roundStatistics,
    viewMode,
    setViewMode,
    handleSelectRound,
    handleSelectNavigationFilter,
    handlePrevProblem,
    handleNextProblem,
    handleJumpTo,
    handlePageInputChange,
    handlePageInputBlur,
    handlePageInputKeyDown,
    handleSelectChoice,
    handleSubmitAnswer,
    handleRevealAnswer,
    handleResetProblem,
    handleResetRound,
    handleToggleShowAllAnswers,
    handleToggleMap: () => setShowMap((prev) => !prev),
    handleCopyProblem,
    updateProblem,
    handleAddProblem,
    handleDuplicateProblem,
    handleRemoveProblem,
    handleSaveData,
    handleExportJson,
    handleResetToDefault,
    handleRetry: loadProblemData,
  };
}
