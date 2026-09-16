'use client';

import type {
  Problem,
  SqldViewMode,
  SqldProblemData,
  RoundStatistics,
  UserProblemRecord,
} from './types';

import { toast } from 'sonner';
import { useMemo, useState, useEffect, useCallback } from 'react';

import { createEmptyProblem } from './types';

// ----------------------------------------------------------------------

const STORAGE_KEY_RECORDS = 'sqld_practice_records_v1';
const STORAGE_KEY_ROUND = 'sqld_selected_round_v1';
const STORAGE_KEY_STUDY_MODE = 'sqld_study_mode_v1';
const STORAGE_KEY_CUSTOM_DATA = 'sqld_custom_problem_data_v1';

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

  // Stored user answers: roundId -> problemIndex -> record
  const [userRecords, setUserRecords] = useState<Record<string, Record<number, UserProblemRecord>>>(
    {}
  );
  const [hasLoadedStorage, setHasLoadedStorage] = useState<boolean>(false);

  // 1. Load problem.json (prioritize custom edited data from localStorage if available)
  useEffect(() => {
    let isCancelled = false;

    const loadProblemData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if user has saved custom edited data in localStorage
        const customDataStr = localStorage.getItem(STORAGE_KEY_CUSTOM_DATA);
        if (customDataStr) {
          try {
            const parsedCustom = JSON.parse(customDataStr);
            if (parsedCustom && parsedCustom.tree && parsedCustom.scripts) {
              if (!isCancelled) {
                setData(parsedCustom);
                if (parsedCustom.tree.length > 0) {
                  setSelectedRoundId((prev) => prev || parsedCustom.tree[0].id);
                }
                setLoading(false);
                return;
              }
            }
          } catch {
            // Ignore parse error and fallback to network fetch
          }
        }

        const response = await fetch('/sqld/problem.json');
        if (!response.ok) {
          throw new Error(`문제 데이터를 불러오는 데 실패했습니다 (HTTP ${response.status})`);
        }

        const json: SqldProblemData = await response.json();
        if (!isCancelled) {
          setData(json);
          // Set initial round if not set
          if (json.tree && json.tree.length > 0) {
            setSelectedRoundId((prev) => prev || json.tree[0].id);
          }
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          const errMsg = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
          setError(errMsg);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadProblemData();

    return () => {
      isCancelled = true;
    };
  }, []);

  // 2. Hydration-safe load from localStorage
  useEffect(() => {
    try {
      const savedRound = localStorage.getItem(STORAGE_KEY_ROUND);
      if (savedRound) {
        setSelectedRoundId(savedRound);
      }

      const savedStudyMode = localStorage.getItem(STORAGE_KEY_STUDY_MODE);
      if (savedStudyMode !== null) {
        setShowAllAnswers(savedStudyMode === 'true');
      }

      const savedRecords = localStorage.getItem(STORAGE_KEY_RECORDS);
      if (savedRecords) {
        const parsed = JSON.parse(savedRecords);
        if (parsed && typeof parsed === 'object') {
          setUserRecords(parsed);
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

  // Keep pageInput synced with currentIndex
  useEffect(() => {
    setPageInput(String(currentIndex + 1));
  }, [currentIndex]);

  // 4. Round switch handler
  const handleSelectRound = useCallback((roundId: string) => {
    setSelectedRoundId(roundId);
    setCurrentIndex(0);
    setPageInput('1');
  }, []);

  // 5. Navigation handlers
  const handlePrevProblem = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNextProblem = useCallback(() => {
    if (!currentProblems.length) return;
    setCurrentIndex((prev) => Math.min(currentProblems.length - 1, prev + 1));
  }, [currentProblems.length]);

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
    const num = parseInt(pageInput, 10);
    if (!isNaN(num) && num >= 1 && num <= currentProblems.length) {
      setCurrentIndex(num - 1);
    } else {
      setPageInput(String(currentIndex + 1));
    }
  }, [pageInput, currentProblems.length, currentIndex]);

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
      if (!selectedRoundId) return;

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

        return {
          ...prev,
          [selectedRoundId]: {
            ...roundMap,
            [currentIndex]: {
              ...oldRecord,
              selectedAnswers: updatedSelections,
            },
          },
        };
      });
    },
    [selectedRoundId, currentIndex]
  );

  // 7. Submit Answer (Grading)
  const handleSubmitAnswer = useCallback(() => {
    if (!selectedRoundId || !currentProblem) return;

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
      };

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

  // 9. Reset single problem
  const handleResetProblem = useCallback(() => {
    if (!selectedRoundId) return;

    setUserRecords((prev) => {
      const roundMap = { ...(prev[selectedRoundId] || {}) };
      delete roundMap[currentIndex];
      return {
        ...prev,
        [selectedRoundId]: roundMap,
      };
    });
    toast.info('문제 답안이 초기화되었습니다.');
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
      const response = await fetch('/sqld/problem.json');
      if (!response.ok) throw new Error('원본 데이터 로드 실패');
      const json: SqldProblemData = await response.json();
      setData(json);
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
    selectedRoundId,
    currentProblems,
    currentProblem,
    currentIndex,
    pageInput,
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
  };
}
