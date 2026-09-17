"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useGameEngine, CellType, BUILTIN_LEVELS } from "../game-engine";
import { findInitialCursor } from "../types";
import GameStageView from "../game-stage-view";
import GameBoardView from "../game-board-view";
import PuzzleControls from "../puzzle-controls";
import { useEditorHotkeys, ALL_PAINT_TOOLS } from "../hot-key";
import {
  getItem,
  setItem,
  getWatchedHintStages,
  setWatchedHintStage,
} from "../../utils/local-storage";
import TossRewardAdModal from "../../toss/toss-reward-ad";
import {
  isTouchMoveEnabled,
  TOUCH_MOVE_CHANGE_EVENT,
} from "../../utils/touch-move";
import {
  BLOCK_EMPTY,
  BLOCK_WALL,
  BLOCK_STRAWBERRY,
  PUZZLE_BLOCK_TYPES,
  BLOCK_WALL_V,
  BLOCK_AUTO_WALL_V,
  getBlockProperties,
  getStrawberryBlockId,
  getStrawberryDirection,
} from "../../object";
import { findPlayerSpawn } from "../physics";
import { playEngineSound as playSound } from "../sound";
import { useToast } from "./hooks/use-toast";
import { formatLevelsJSON } from "./utils/format-levels-json";
import { UndoGuideModal } from "./components/modals/undo-guide-modal";
import { CheaterDetectModal } from "./components/modals/cheater-detect-modal";
import { JsonExportImportModal } from "./components/modals/json-export-import-modal";
import { HintViewModal } from "./components/modals/hint-view-modal";
import { RecordViewModal } from "./components/modals/record-view-modal";
import { AutoSolveModal } from "./components/modals/auto-solve-modal";
import { solveOrboxBFS, type DFSSolveResult } from "../solver";
import { copyGrid } from "../types";
import { EditorPalette } from "./components/editor-palette";
import { ToastNotification } from "./components/toast-notification";
import { GameContentProps } from "./types";

const getInitialStageIndex = (): number => {
  return 0;
};

export function GameContent({
  isEditor = false,
  onFullReset,
  onStageClearAd,
  onStageSelect,
}: GameContentProps) {
  const router = useRouter();
  const [playTestMode, setPlayTestMode] = useState<boolean>(false);
  const activeEditor = isEditor && !playTestMode;

  const [viewMode, setViewMode] = useState<"stage_select" | "game_scene">(() =>
    isEditor ? "game_scene" : "stage_select",
  );

  const [initialStageIdx] = useState(getInitialStageIndex);
  const toast = useToast();

  const {
    grid,
    setGrid,
    cursor,
    setCursor,
    lastMoveInfo,
    isSliding,
    isGameOver,
    isLevelCleared,
    setIsLevelCleared,
    isProcessing,
    levelIndex,
    loadLevel: engineLoadLevel,
    resetLevel: engineResetLevel,
    moveOrbox,
    moveBlock,
    undoPlay,
    canUndoPlay,
    historySize,
    remainingUndos,
    startUndoChance,
    editorPlaceBlock,
    editorClearGrid,
    editorResizeGrid,
    editorFillBorder,
    editorDeleteRow,
    editorDeleteCol,
    editorInsertRowAbove,
    editorInsertRowBelow,
    editorInsertColLeft,
    editorInsertColRight,
    copiedCol,
    copiedRow,
    editorCopyCol,
    editorPasteCol,
    editorCopyRow,
    editorPasteRow,
    editorFlipHorizontal,
    muted,
    setMuted,
    grabbed,
    setGrabbed,
    isCursorVisible,
    setIsCursorVisible,
    flashingBlocks,
    bullets,
    firedOnce,
    editorLevels,
    editorActiveIndex,
    selectEditorLevel,
    editorAddLevel,
    editorDeleteLevel,
    editorImportJSON,
    editorRestoreLevel,
    editorUndo,
    editorPushHistory,
    editorMapType,
    setEditorMapType,
    changeMapType,
    editorAddHint,
    editorDeleteHint,
  } = useGameEngine(initialStageIdx, activeEditor, isEditor);

  const [selectedPaint, setSelectedPaint] = useState<
    CellType | "eraser" | "ice"
  >(BLOCK_WALL);
  const [isRewardAdOpen, setIsRewardAdOpen] = useState<boolean>(false);
  const [isHintAdOpen, setIsHintAdOpen] = useState<boolean>(false);
  const [showUndoGuideModal, setShowUndoGuideModal] = useState<boolean>(false);
  const [isHintModalOpen, setIsHintModalOpen] = useState<boolean>(false);
  const [currentHintIndex, setCurrentHintIndex] = useState<number>(0);
  const [recordedSteps, setRecordedSteps] = useState<CellType[][][]>([]);
  const recordedStepsRef = useRef<CellType[][][]>([]);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
  const [currentRecordIndex, setCurrentRecordIndex] = useState<number>(0);
  const [isHintAttention, setIsHintAttention] = useState<boolean>(false);
  const [autoSolveResult, setAutoSolveResult] =
    useState<DFSSolveResult | null>(null);
  const [isAutoSolveModalOpen, setIsAutoSolveModalOpen] =
    useState<boolean>(false);

  const [solveProgressPath, setSolveProgressPath] = useState<string[]>([]);
  const [solveProgressStatus, setSolveProgressStatus] = useState<
    "idle" | "searching" | "deadend" | "success"
  >("idle");

  const handleAutoSolve = useCallback(async () => {
    setSolveProgressStatus("searching");
    setSolveProgressPath([]);
    
    // Add artificial delay for UI to paint
    await new Promise((r) => setTimeout(r, 10));

    let lastPaint = Date.now();

    const result = await solveOrboxBFS(
      grid,
      undefined,
      35,
      60000,
      async (path, status) => {
        const now = Date.now();
        // Only update state and yield to browser paint every ~25ms or on final success
        if (now - lastPaint > 25 || status === "success") {
          lastPaint = now;
          setSolveProgressPath(path);
          setSolveProgressStatus(status);
          await new Promise((res) => setTimeout(res, 0));
        }
      },
    );

    setSolveProgressStatus("idle");
    setAutoSolveResult(result);
    setIsAutoSolveModalOpen(true);
    playSound(result.solvable ? "match" : "error", muted);
  }, [grid, muted]);

  const moveOrboxRef = useRef(moveOrbox);
  useEffect(() => {
    moveOrboxRef.current = moveOrbox;
  }, [moveOrbox]);

  const handlePlaySolution = useCallback(
    async (directions: string[]) => {
      if (!playTestMode && isEditor) {
        setPlayTestMode(true);
      }
      for (let i = 0; i < directions.length; i++) {
        await new Promise((res) => setTimeout(res, 400));
        moveOrboxRef.current(directions[i] as any);
      }
    },
    [playTestMode, isEditor],
  );

  const [watchedHintStages, setWatchedHintStages] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    getWatchedHintStages().then((stages) => {
      if (stages) {
        setWatchedHintStages(stages);
      }
    });
  }, []);

  const hasWatchedHintAd = !!watchedHintStages[levelIndex];

  const activeHints = isEditor
    ? editorLevels[editorActiveIndex]?.hint
    : BUILTIN_LEVELS[levelIndex]?.hint;
  const hasActiveHints = !!(activeHints && activeHints.length > 0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsHintAttention(true);
      const timer = setTimeout(() => {
        setIsHintAttention(false);
      }, 1200);
      return () => clearTimeout(timer);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const areGridsEqual = useCallback(
    (a: CellType[][], b: CellType[][]): boolean => {
      if (a.length !== b.length) return false;
      for (let y = 0; y < a.length; y++) {
        if (a[y].length !== b[y].length) return false;
        for (let x = 0; x < a[y].length; x++) {
          if (a[y][x] !== b[y][x]) return false;
        }
      }
      return true;
    },
    [],
  );

  const createSnapshotWithPlayer = useCallback(
    (
      currentGrid: CellType[][],
      playerPos: { x: number; y: number },
      direction?: "up" | "down" | "left" | "right",
    ): CellType[][] => {
      const snapshot = copyGrid(currentGrid);
      if (
        playerPos.y >= 0 &&
        playerPos.y < snapshot.length &&
        playerPos.x >= 0 &&
        playerPos.x < (snapshot[playerPos.y]?.length || 0)
      ) {
        snapshot[playerPos.y][playerPos.x] = getStrawberryBlockId(direction);
      }
      return snapshot;
    },
    [],
  );

  // 에디터 레벨 변경 시 녹화 기록 초기화
  useEffect(() => {
    setRecordedSteps([]);
    recordedStepsRef.current = [];
  }, [editorActiveIndex]);

  // 플레이 테스트 중 이동 완료(도착 지점)마다 플레이어 위치와 방향을 포함한 스냅샷을 녹화로 저장
  useEffect(() => {
    if (!playTestMode || isProcessing || !grid || grid.length === 0) return;

    // 보드 범위를 벗어난 위치(낙사)는 스냅샷에 추가하지 않음
    if (
      cursor.y < 0 ||
      cursor.y >= grid.length ||
      cursor.x < 0 ||
      cursor.x >= (grid[cursor.y]?.length || 0)
    ) {
      return;
    }

    const currentSnapshot = createSnapshotWithPlayer(
      grid,
      cursor,
      lastMoveInfo?.direction || "left",
    );
    const steps = recordedStepsRef.current;
    const lastStep = steps.length > 0 ? steps[steps.length - 1] : null;

    if (!lastStep || !areGridsEqual(currentSnapshot, lastStep)) {
      const updated = [...steps, currentSnapshot];
      recordedStepsRef.current = updated;
      setRecordedSteps(updated);
    }
  }, [
    grid,
    cursor,
    isProcessing,
    playTestMode,
    lastMoveInfo,
    areGridsEqual,
    createSnapshotWithPlayer,
  ]);

  const handleChanceClick = () => {
    if (remainingUndos > 0) {
      if (canUndoPlay) {
        undoPlay();
      } else {
        playSound("error", muted);
      }
    } else {
      playSound("select", muted);
      setIsRewardAdOpen(true);
    }
  };

  const handleRewardEarned = () => {
    startUndoChance();
    setIsRewardAdOpen(false);
    setShowUndoGuideModal(true);
  };

  const handleHintRewardEarned = () => {
    setIsHintAdOpen(false);
    setWatchedHintStage(levelIndex);
    setWatchedHintStages((prev) => ({ ...prev, [levelIndex]: true }));
    setCurrentHintIndex(0);
    setIsHintModalOpen(true);
  };

  const loadLevel = useCallback(
    (index: number) => {
      engineLoadLevel(index);
    },
    [engineLoadLevel],
  );

  const resetLevel = useCallback(() => {
    engineResetLevel();
  }, [engineResetLevel]);

  const handleFullReset = useCallback(
    (stage?: number) => {
      onFullReset?.(stage !== undefined ? stage : levelIndex + 1);
    },
    [onFullReset, levelIndex],
  );

  const [touchMoveEnabled, setTouchMoveEnabled] = useState<boolean>(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTouchMoveEnabled(isTouchMoveEnabled());

    const handleTouchMoveChange = (e: Event) => {
      const customEvt = e as CustomEvent<{ enabled: boolean }>;
      setTouchMoveEnabled(customEvt.detail?.enabled ?? isTouchMoveEnabled());
    };

    window.addEventListener(TOUCH_MOVE_CHANGE_EVENT, handleTouchMoveChange);
    return () => {
      window.removeEventListener(
        TOUCH_MOVE_CHANGE_EVENT,
        handleTouchMoveChange,
      );
    };
  }, []);

  const [exportModalContent, setExportModalContent] = useState<string | null>(
    null,
  );
  const [importText, setImportText] = useState<string>("");
  const [cheaterPopupOpen, setCheaterPopupOpen] = useState<boolean>(false);

  const gameViewRef = useRef({
    grid,
    cursor,
    grabbed,
    isCursorVisible,
    isProcessing,
    isGameOver,
    isLevelCleared,
    activeEditor,
    muted,
    moveOrbox,
    moveBlock,
    undoPlay,
    resetLevel,
    setCursor,
    setGrabbed,
    setIsCursorVisible,
    levelIndex,
    loadLevel,
    isEditor,
    onFullReset: handleFullReset,
  });

  useEffect(() => {
    gameViewRef.current = {
      grid,
      cursor,
      grabbed,
      isCursorVisible,
      isProcessing,
      isGameOver,
      isLevelCleared,
      activeEditor,
      muted,
      moveOrbox,
      moveBlock,
      undoPlay,
      resetLevel,
      setCursor,
      setGrabbed,
      setIsCursorVisible,
      levelIndex,
      loadLevel,
      isEditor,
      onFullReset: handleFullReset,
    };
  }, [
    grid,
    cursor,
    grabbed,
    isCursorVisible,
    isProcessing,
    isGameOver,
    isLevelCleared,
    activeEditor,
    muted,
    moveOrbox,
    moveBlock,
    undoPlay,
    resetLevel,
    setCursor,
    setGrabbed,
    setIsCursorVisible,
    levelIndex,
    loadLevel,
    isEditor,
    handleFullReset,
  ]);

  const hasLoadedUrlStageRef = useRef<boolean>(false);

  // Read stage query param on mount/load and load it exactly once
  useEffect(() => {
    if (hasLoadedUrlStageRef.current) return;

    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const stageParam = searchParams.get("stage");
      if (stageParam && !isEditor) {
        const stageIdx = parseInt(stageParam, 10) - 1;
        if (stageIdx >= 0 && stageIdx < BUILTIN_LEVELS.length) {
          const isLocalEnv =
            process.env.NEXT_PUBLIC_APP_ENV?.toUpperCase() === "LOCAL" ||
            process.env.NODE_ENV === "development";
          if (isLocalEnv) {
            onStageSelect?.(stageIdx + 1);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            loadLevel(stageIdx);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setViewMode("game_scene");
            hasLoadedUrlStageRef.current = true;
            return;
          }

          getItem("puzznic_max_unlocked").then((stored) => {
            const maxUnlocked = parseInt(stored || "1", 10);
            if (isEditor || isLocalEnv || stageIdx + 1 <= maxUnlocked) {
              onStageSelect?.(stageIdx + 1);
              // eslint-disable-next-line react-hooks/set-state-in-effect
              loadLevel(stageIdx);
              setViewMode("game_scene");
            } else {
              setItem("puzznic_max_unlocked", "1");
              // eslint-disable-next-line react-hooks/set-state-in-effect
              loadLevel(0);
              setViewMode("game_scene");
              setTimeout(() => {
                setCheaterPopupOpen(true);
              }, 0);
              playSound("error", muted);
            }
            hasLoadedUrlStageRef.current = true;
          });
        }
      }
    }
  }, [loadLevel, isEditor, muted]);

  // Fallback to mark as loaded after 1 second if no stage param is found
  useEffect(() => {
    const t = setTimeout(() => {
      hasLoadedUrlStageRef.current = true;
    }, 1000);
    return () => clearTimeout(t);
  }, []);

  // Sync levelIndex to URL query parameter when playing
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      !isEditor &&
      viewMode === "game_scene"
    ) {
      const searchParams = new URLSearchParams(window.location.search);
      const currentStageNum = levelIndex + 1;
      if (searchParams.get("stage") !== currentStageNum.toString()) {
        searchParams.set("stage", currentStageNum.toString());
        const newRelativePathQuery =
          window.location.pathname + "?" + searchParams.toString();
        window.history.replaceState(null, "", newRelativePathQuery);
      }
    }
  }, [levelIndex, isEditor, viewMode]);

  // Unlock next stage when a stage is cleared
  useEffect(() => {
    if (isLevelCleared && !isEditor) {
      const nextLevel = levelIndex + 2;
      if (nextLevel <= BUILTIN_LEVELS.length + 1) {
        getItem("puzznic_max_unlocked").then((stored) => {
          const maxUnlocked = parseInt(stored || "1", 10);
          if (nextLevel > maxUnlocked) {
            setItem("puzznic_max_unlocked", nextLevel.toString());
          }
        });
      }
    }
  }, [isLevelCleared, levelIndex, isEditor]);

  // Keyboard navigation inside grid for Orbox game
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent triggers when typing in inputs
      const activeEl = document.activeElement as HTMLElement | null;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.isContentEditable)
      ) {
        return;
      }

      const {
        grid: curGrid,
        cursor: curCursor,
        isProcessing: curProcessing,
        isGameOver: curGameOver,
        isLevelCleared: curLevelCleared,
        activeEditor: curActiveEditor,
        muted: curMuted,
        moveOrbox: curMoveOrbox,
        undoPlay: curUndoPlay,
        resetLevel: curResetLevel,
        setCursor: curSetCursor,
        levelIndex: curLevelIndex,
        loadLevel: curLoadLevel,
        isEditor: curIsEditor,
      } = gameViewRef.current;

      if (curActiveEditor) {
        // In editor mode, arrow keys move cursor around the grid
        let dx = 0;
        let dy = 0;
        if (e.key === "ArrowLeft") dx = -1;
        else if (e.key === "ArrowRight") dx = 1;
        else if (e.key === "ArrowUp") dy = -1;
        else if (e.key === "ArrowDown") dy = 1;

        if (dx !== 0 || dy !== 0) {
          e.preventDefault();
          curSetCursor((prev) => {
            const cols = curGrid[0]?.length || 8;
            const rows = curGrid.length || 8;
            const nx = Math.max(0, Math.min(cols - 1, prev.x + dx));
            const ny = Math.max(0, Math.min(rows - 1, prev.y + dy));
            return { x: nx, y: ny };
          });
        }
        return;
      }

      if (curLevelCleared) {
        if (e.key === "Enter" || e.code === "Space") {
          e.preventDefault();
          if (!curIsEditor) {
            onStageClearAd?.(curLevelIndex + 1);
            const nextIdx = (curLevelIndex + 1) % BUILTIN_LEVELS.length;
            curLoadLevel(nextIdx);
          } else {
            curResetLevel();
          }
          playSound("start", curMuted);
        }
        return;
      }

      if (curGameOver) {
        if (
          e.key === "Enter" ||
          e.code === "Space" ||
          e.key === "r" ||
          e.key === "R"
        ) {
          e.preventDefault();
          curResetLevel();
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
          e.preventDefault();
          curUndoPlay();
        }
        return;
      }

      if (curProcessing) return;

      // 1. Orbox 4-direction sliding keys (Arrow keys / WASD)
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        curMoveOrbox("up");
        return;
      }
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        e.preventDefault();
        curMoveOrbox("down");
        return;
      }
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        curMoveOrbox("left");
        return;
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        curMoveOrbox("right");
        return;
      }

      // 2. Restart key
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        curResetLevel();
        return;
      }

      // 3. Undo key
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        curUndoPlay();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isDrawingRef = useRef<boolean>(false);
  const drawingToolRef = useRef<CellType | "eraser" | "ice">(BLOCK_EMPTY);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDrawingRef.current = false;
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("blur", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("blur", handleGlobalMouseUp);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent, x: number, y: number) => {
    if (!activeEditor) return;
    if (e.button !== 0 && e.button !== 2) return;

    e.preventDefault();

    isDrawingRef.current = true;
    editorPushHistory();
    const isErase = e.button === 2 || selectedPaint === "eraser";
    const tool = isErase
      ? "eraser"
      : selectedPaint === "ice"
        ? "ice"
        : (selectedPaint as CellType);
    drawingToolRef.current = tool;

    editorPlaceBlock(x, y, tool);
  };

  const handleMouseEnter = (x: number, y: number) => {
    if (!activeEditor || !isDrawingRef.current) return;
    editorPlaceBlock(x, y, drawingToolRef.current);
  };

  const handleCellClick = (x: number, y: number) => {
    if (activeEditor) return;
    if (isProcessing || isGameOver || isLevelCleared) return;

    const dx = x - cursor.x;
    const dy = y - cursor.y;
    if (dx === 0 && dy === 0) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      moveOrbox(dx > 0 ? "right" : "left");
    } else {
      moveOrbox(dy > 0 ? "down" : "up");
    }
  };

  const handleBackgroundClick = (clientX: number) => {
    if (activeEditor || isProcessing || isGameOver || isLevelCleared) return;
    const isRight = clientX > window.innerWidth / 2;
    moveOrbox(isRight ? "right" : "left");
  };

  const togglePlayTest = () => {
    if (playTestMode) {
      setGrabbed(false);
      setIsCursorVisible(false);
      setPlayTestMode(false);
      editorRestoreLevel();
    } else {
      setPlayTestMode(true);
      const spawnPos = findPlayerSpawn(grid);
      setCursor(spawnPos);
      setGrabbed(false);
      setIsCursorVisible(false);
      const initialDir = getStrawberryDirection(
        grid[spawnPos.y]?.[spawnPos.x] ?? BLOCK_STRAWBERRY,
      );
      const initialSnapshot = createSnapshotWithPlayer(
        grid,
        spawnPos,
        initialDir,
      );
      recordedStepsRef.current = [initialSnapshot];
      setRecordedSteps([initialSnapshot]);
    }
    playSound("start", muted);
  };

  const handleExport = () => {
    setExportModalContent(formatLevelsJSON(editorLevels));
    playSound("start", muted);
  };

  const handleDownload = () => {
    if (!exportModalContent) return;
    const blob = new Blob([exportModalContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download =
      editorMapType === "test" ? "test-map.json" : "real-map.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    playSound("start", muted);
  };

  const handleImport = (jsonStr: string) => {
    const success = editorImportJSON(jsonStr);
    if (success) {
      setExportModalContent(null);
      playSound("start", muted);
    } else {
      alert("Invalid format or JSON");
      playSound("error", muted);
    }
  };

  useEditorHotkeys({
    active: isEditor,
    playTestMode: playTestMode,
    handlers: {
      onTogglePlayTest: togglePlayTest,
      onAddHint: () => {
        if (grid && editorAddHint) {
          editorAddHint(grid);
          toast.openToast("힌트가 추가되었습니다!");
        }
      },
      onPrevStage: () => {
        if (editorActiveIndex > 0) {
          playSound("select", muted);
          selectEditorLevel(editorActiveIndex - 1);
        }
      },
      onNextStage: () => {
        if (editorActiveIndex < editorLevels.length - 1) {
          playSound("select", muted);
          selectEditorLevel(editorActiveIndex + 1);
        }
      },
      onUndo: () => {
        editorUndo();
      },
      onBorderWall: () => {
        editorFillBorder();
      },
      onClearGrid: () => {
        editorClearGrid();
      },
      onExportJson: () => {
        const jsonStr = formatLevelsJSON(editorLevels);
        navigator.clipboard
          .writeText(jsonStr)
          .then(() => {
            toast.openToast("클립보드에 복사되었습니다!");
            playSound("start", muted);
          })
          .catch((err) => {
            console.error("Clipboard copy failed:", err);
            playSound("error", muted);
          });
      },
      onSelectBlock: (num: number) => {
        if (num === 1) {
          setSelectedPaint(BLOCK_WALL);
        } else if (num >= 2 && num <= 9) {
          const blockType = PUZZLE_BLOCK_TYPES[num - 2];
          if (blockType !== undefined) {
            setSelectedPaint(blockType);
          }
        }
        playSound("select", muted);
      },
      onSelectNextBlock: () => {
        const idx = ALL_PAINT_TOOLS.indexOf(selectedPaint);
        const nextIdx = (idx + 1) % ALL_PAINT_TOOLS.length;
        setSelectedPaint(ALL_PAINT_TOOLS[nextIdx]);
        playSound("select", muted);
      },
      onSelectPrevBlock: () => {
        const idx = ALL_PAINT_TOOLS.indexOf(selectedPaint);
        const prevIdx =
          (idx - 1 + ALL_PAINT_TOOLS.length) % ALL_PAINT_TOOLS.length;
        setSelectedPaint(ALL_PAINT_TOOLS[prevIdx]);
        playSound("select", muted);
      },
      onAddStage: () => {
        editorAddLevel();
      },
    },
  });

  const handleClearAllBlocks = () => {
    setGrid((prevGrid) =>
      prevGrid.map((row) =>
        row.map((cell) => {
          const props = getBlockProperties(cell, prevGrid);
          if (props?.canBeDestroyedByShooter) {
            return BLOCK_EMPTY;
          }
          return cell;
        }),
      ),
    );
    setIsLevelCleared(true);
    playSound("start", muted);
  };

  if (viewMode === "stage_select" && !isEditor) {
    return (
      <GameStageView
        onSelectStage={(idx) => {
          onStageSelect?.(idx + 1);
          loadLevel(idx);
          setViewMode("game_scene");
        }}
        onBackToHome={() => {
          try {
            router.push("/game/delivery");
          } catch {
            window.location.href = "/game/delivery";
          }
        }}
        muted={muted}
        setMuted={setMuted}
        playSound={playSound}
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 items-center justify-center p-0 md:pt-0 md:pb-1 md:px-4 text-stone-800 overflow-hidden relative font-sans select-none w-full">
      {/* Main Container */}
      <div className="relative z-10 w-full max-w-7xl flex flex-col items-center pt-0 pb-0 px-1 flex-1 h-full min-h-0 justify-between">
        {/* Game Stage Area */}
        <div className="w-full relative flex-1 flex flex-col items-center justify-between min-h-0 overflow-hidden pt-0">
          {/* Farm Board Area */}
          <div
            onClick={(e) => {
              if (activeEditor) return;
              handleBackgroundClick(e.clientX);
            }}
            className="w-full flex-1 flex flex-col items-center justify-between p-0 text-stone-800 relative min-h-0"
          >
            {/* BFS Progress Visualization Overlay */}
            {solveProgressStatus !== "idle" && (
              <div className="absolute top-2 sm:top-4 left-0 right-0 z-50 flex flex-col items-center pointer-events-none animate-fade-in">
                <div className="bg-stone-900/90 backdrop-blur-md text-white px-4 py-3 rounded-3xl text-xs sm:text-sm shadow-2xl font-bold max-w-[95%] text-center border-2 border-amber-500/50 flex flex-col gap-2">
                  <div className="text-amber-400 text-sm flex items-center justify-center gap-2">
                    <span className="animate-spin text-lg">🌀</span>
                    <span>BFS 최단 경로 탐색 중...</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-1.5 text-stone-200 mt-1">
                    {solveProgressPath.length > 0 ? (
                      solveProgressPath.map((p, i) => (
                        <React.Fragment key={i}>
                          <span className="bg-stone-800 border border-stone-600 px-2 py-0.5 rounded-lg text-amber-300">
                            {p}
                          </span>
                          {i < solveProgressPath.length - 1 && (
                            <span className="text-stone-500 font-black">→</span>
                          )}
                        </React.Fragment>
                      ))
                    ) : (
                      <span className="text-stone-400 animate-pulse">
                        출발 준비...
                      </span>
                    )}
                  </div>
                  {solveProgressStatus === "deadend" && (
                    <div className="text-rose-400 mt-1 animate-pulse bg-rose-950/50 py-1 px-3 rounded-xl inline-block self-center border border-rose-800/50">
                      🚫 가다가 막힘 (Dead End)
                    </div>
                  )}
                  {solveProgressStatus === "success" && (
                    <div className="text-emerald-400 mt-1 animate-bounce bg-emerald-950/50 py-1 px-3 rounded-xl inline-block self-center border border-emerald-800/50 text-base">
                      🎉 클리어 경로 발견!
                    </div>
                  )}
                </div>
              </div>
            )}

            <GameBoardView
              grid={grid}
              cursor={cursor}
              lastMoveInfo={lastMoveInfo}
              isSliding={isSliding}
              activeEditor={activeEditor}
              playTestMode={playTestMode}
              grabbed={grabbed}
              isCursorVisible={isCursorVisible}
              isProcessing={isProcessing}
              flashingBlocks={flashingBlocks}
              bullets={bullets}
              firedOnce={firedOnce}
              isLevelCleared={isLevelCleared}
              isGameOver={isGameOver}
              levelIndex={levelIndex}
              isEditor={isEditor}
              muted={muted}
              setGrabbed={setGrabbed}
              loadLevel={loadLevel}
              resetLevel={resetLevel}
              setCursor={setCursor}
              playSound={playSound}
              onSwipeMove={(dir) => moveOrbox(dir)}
              handleMouseDown={handleMouseDown}
              handleMouseEnter={handleMouseEnter}
              handleCellClick={handleCellClick}
              editorDeleteRow={editorDeleteRow}
              editorDeleteCol={editorDeleteCol}
              editorInsertRowAbove={editorInsertRowAbove}
              editorInsertRowBelow={editorInsertRowBelow}
              editorInsertColLeft={editorInsertColLeft}
              editorInsertColRight={editorInsertColRight}
              copiedCol={copiedCol}
              copiedRow={copiedRow}
              editorCopyCol={editorCopyCol}
              editorPasteCol={editorPasteCol}
              editorCopyRow={editorCopyRow}
              editorPasteRow={editorPasteRow}
              setMuted={setMuted}
              onFullReset={handleFullReset}
              onStageClearAd={onStageClearAd}
              editorActiveIndex={editorActiveIndex}
              editorLevels={editorLevels}
              selectEditorLevel={selectEditorLevel}
              editorAddLevel={editorAddLevel}
              editorDeleteLevel={editorDeleteLevel}
              togglePlayTest={togglePlayTest}
              editorMapType={editorMapType}
              setEditorMapType={setEditorMapType}
              changeMapType={changeMapType}
              onBackToStageSelect={() => {
                if (typeof window !== "undefined") {
                  window.history.replaceState(
                    null,
                    "",
                    window.location.pathname,
                  );
                }
                setViewMode("stage_select");
              }}
              onClearAllBlocks={handleClearAllBlocks}
              editorAddHint={editorAddHint}
              onToast={(msg) => toast.openToast(msg)}
              hasActiveHints={hasActiveHints}
              activeHintsLength={activeHints?.length ?? 0}
              isHintAttention={isHintAttention}
              hasWatchedHintAd={hasWatchedHintAd}
              recordedStepsLength={recordedSteps.length}
              onOpenRecordModal={() => {
                setCurrentRecordIndex(0);
                setIsRecordModalOpen(true);
                playSound("select", muted);
              }}
              onOpenHintModal={() => {
                if (
                  !isEditor &&
                  !playTestMode &&
                  levelIndex >= 30 &&
                  !hasWatchedHintAd
                ) {
                  setIsHintAdOpen(true);
                } else {
                  setCurrentHintIndex(0);
                  setIsHintModalOpen(true);
                }
              }}
            />
          </div>
        </div>

        {/* BOTTOM SECTION: EDITOR PALETTE & LEVEL SELECTORS */}
        <div className="w-full md:bg-[#fbf9f1] md:border md:border-t-0 md:border-stone-200 md:rounded-b-[24px] py-0.5 px-1 md:px-2.5 flex flex-col gap-0.5 md:shadow-sm shrink-0">
          {activeEditor ? (
            <EditorPalette
              activeEditor={activeEditor}
              selectedPaint={selectedPaint}
              setSelectedPaint={setSelectedPaint}
              grid={grid}
              editorResizeGrid={editorResizeGrid}
              editorFillBorder={editorFillBorder}
              editorFlipHorizontal={editorFlipHorizontal}
              editorClearGrid={editorClearGrid}
              handleExport={handleExport}
              openImportModal={() => setExportModalContent("")}
              hasActiveHints={hasActiveHints}
              isHintAttention={isHintAttention}
              activeHintsLength={activeHints?.length ?? 0}
              onOpenHintModal={() => {
                setCurrentHintIndex(0);
                setIsHintModalOpen(true);
                playSound("select", muted);
              }}
              recordedStepsLength={recordedSteps.length}
              onOpenRecordModal={() => {
                setCurrentRecordIndex(0);
                setIsRecordModalOpen(true);
                playSound("select", muted);
              }}
              onAutoSolve={handleAutoSolve}
              playSound={playSound}
              muted={muted}
            />
          ) : (
            <div className="flex flex-col gap-1 w-full">
              <div className="hidden md:flex items-center justify-center sm:justify-start">
                <div className="text-xs text-stone-600 leading-relaxed max-w-[500px] text-center sm:text-left font-semibold">
                  {playTestMode ? (
                    <span className="text-emerald-700 font-bold">
                      [테스트 모드] 슬라이딩 이동: [방향키/WASD] | 단계 재시작: [R] | 힌트 추가: [F9]
                    </span>
                  ) : (
                    <span>
                      슬라이딩 이동: [방향키] 또는 [WASD] | 단계 재시작: [R] | 되돌리기: [Ctrl+Z]
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-center w-full relative">
                <PuzzleControls
                  onUpClick={() => moveOrbox("up")}
                  onDownClick={() => moveOrbox("down")}
                  onLeftClick={() => moveOrbox("left")}
                  onRightClick={() => moveOrbox("right")}
                  onChanceClick={
                    remainingUndos > 0 ? undoPlay : handleChanceClick
                  }
                  remainingUndos={remainingUndos}
                  historySize={historySize}
                  showChanceButton={true}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toss Reward Ad Modal */}
      <TossRewardAdModal
        isOpen={isRewardAdOpen}
        onClose={() => setIsRewardAdOpen(false)}
        onRewardEarned={handleRewardEarned}
        title="앗 실수 하셨나요?"
        description="광고보면 뒤로 되돌리기 찬스를 드릴게요!"
      />

      {/* Hint Reward Ad Modal */}
      <TossRewardAdModal
        isOpen={isHintAdOpen}
        onClose={() => setIsHintAdOpen(false)}
        onRewardEarned={handleHintRewardEarned}
        adGroupId={process.env.NEXT_PUBLIC_TOSS_HINT_REWARD_AD_GROUP_ID}
        title="힌트를 확인해볼까요?"
        description="짧은 광고를 시청하시면 힌트를 보실 수 있어요! 💡"
        rewardSuccessTitle="힌트 획득!"
      />

      {/* Undo Guide Modal */}
      <UndoGuideModal
        showUndoGuideModal={showUndoGuideModal}
        remainingUndos={remainingUndos}
        onClose={() => setShowUndoGuideModal(false)}
      />

      {/* Cheater Detect Modal */}
      <CheaterDetectModal
        cheaterPopupOpen={cheaterPopupOpen}
        onConfirm={() => {
          setCheaterPopupOpen(false);
          playSound("start", muted);
        }}
      />

      {/* JSON Export/Import Modal */}
      <JsonExportImportModal
        exportModalContent={exportModalContent}
        importText={importText}
        setImportText={setImportText}
        onClose={() => {
          setExportModalContent(null);
          setImportText("");
        }}
        handleDownload={handleDownload}
        handleImport={handleImport}
        onCopyText={() => {
          if (exportModalContent) {
            navigator.clipboard.writeText(exportModalContent);
            toast.openToast("클립보드에 복사되었습니다!");
            playSound("select", muted);
          }
        }}
        playSound={playSound}
        muted={muted}
      />

      {/* Hint View Modal */}
      <HintViewModal
        isHintModalOpen={isHintModalOpen}
        onClose={() => setIsHintModalOpen(false)}
        isEditor={isEditor}
        editorActiveIndex={editorActiveIndex}
        editorLevels={editorLevels}
        levelIndex={levelIndex}
        builtinLevelName={BUILTIN_LEVELS[levelIndex]?.name}
        activeHints={activeHints}
        currentHintIndex={currentHintIndex}
        setCurrentHintIndex={setCurrentHintIndex}
        editorDeleteHint={editorDeleteHint}
        playSound={playSound}
        muted={muted}
        onToast={(msg) => toast.openToast(msg)}
      />

      {/* Record View Modal */}
      <RecordViewModal
        isRecordModalOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        isEditor={isEditor}
        editorActiveIndex={editorActiveIndex}
        editorLevels={editorLevels}
        levelIndex={levelIndex}
        builtinLevelName={BUILTIN_LEVELS[levelIndex]?.name}
        recordedSteps={recordedSteps}
        currentRecordIndex={currentRecordIndex}
        setCurrentRecordIndex={setCurrentRecordIndex}
        playSound={playSound}
        muted={muted}
        onToast={(msg) => toast.openToast(msg)}
        onClearRecord={() => {
          setRecordedSteps([]);
          recordedStepsRef.current = [];
        }}
        onDeleteSingleRecord={(idxToDelete) => {
          setRecordedSteps((prev) => {
            const updated = prev.filter((_, idx) => idx !== idxToDelete);
            recordedStepsRef.current = updated;
            return updated;
          });
        }}
        onAddHint={(gridToAdd) => {
          if (editorAddHint) {
            editorAddHint(gridToAdd);
          }
        }}
      />

      {/* Auto Solve Modal */}
      <AutoSolveModal
        isOpen={isAutoSolveModalOpen}
        onClose={() => setIsAutoSolveModalOpen(false)}
        result={autoSolveResult}
        onPlaySolution={handlePlaySolution}
        onToast={(msg) => toast.openToast(msg)}
      />

      {/* Toast Notification */}
      <ToastNotification toastText={toast.toastText} />
    </div>
  );
}
