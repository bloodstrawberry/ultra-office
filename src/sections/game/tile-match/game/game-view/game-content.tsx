'use client';

import type { GameContentProps } from './types';
import type { CellType, Position } from '../game-engine';

import { useRouter } from 'next/navigation';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import { useToast } from './hooks/use-toast';
import GameStageView from '../game-stage-view';
import GameBoardView from '../game-board-view';
import PuzzleControls from '../puzzle-controls';
import { copyGrid, findInitialCursor } from '../types';
import { playEngineSound as playSound } from '../sound';
import TossRewardAdModal from '../../toss/toss-reward-ad';
import { EditorPalette } from './components/editor-palette';
import { formatLevelsJSON } from './utils/format-levels-json';
import { ALL_PAINT_TOOLS, useEditorHotkeys } from '../hot-key';
import { HintViewModal } from './components/modals/hint-view-modal';
import { ToastNotification } from './components/toast-notification';
import { UndoGuideModal } from './components/modals/undo-guide-modal';
import { useGameEngine, BUILTIN_LEVELS } from '../game-engine';
import { RecordViewModal } from './components/modals/record-view-modal';
import { CheaterDetectModal } from './components/modals/cheater-detect-modal';
import { JsonExportImportModal } from './components/modals/json-export-import-modal';
import { isTouchMoveEnabled, TOUCH_MOVE_CHANGE_EVENT } from '../../utils/touch-move';
import { BLOCK_WALL, BLOCK_EMPTY, PUZZLE_BLOCK_TYPES, getBlockProperties } from '../../object';
import {
  getItem,
  setItem,
  setWatchedHintStage,
  getWatchedHintStages,
} from '../../utils/local-storage';

const getInitialStageIndex = (): number => 0;

export function GameContent({
  isEditor = false,
  onFullReset,
  onStageClearAd,
  onStageSelect,
}: GameContentProps) {
  const router = useRouter();
  const [playTestMode, setPlayTestMode] = useState<boolean>(false);
  const activeEditor = isEditor && !playTestMode;

  const [viewMode, setViewMode] = useState<'stage_select' | 'game_scene'>(() =>
    isEditor ? 'game_scene' : 'stage_select'
  );

  const [initialStageIdx] = useState(getInitialStageIndex);
  const toast = useToast();

  const {
    grid,
    setGrid,
    statusMap,
    setStatusMap,
    chickenDirections,
    cursor,
    setCursor,
    turnsLeft,
    isGameOver,
    isLevelCleared,
    setIsLevelCleared,
    isProcessing,
    levelIndex,
    loadLevel: engineLoadLevel,
    resetLevel: engineResetLevel,
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
    shisenShoPath,
    tryMatchShisenSho,
    editorLevels,
    editorActiveIndex,
    selectEditorLevel,
    editorAddLevel,
    editorDeleteLevel,
    editorUpdateTurnLimit,
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

  const [selectedPaint, setSelectedPaint] = useState<CellType | 'eraser' | 'ice' | string>(
    BLOCK_WALL
  );
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
  const [watchedHintStages, setWatchedHintStages] = useState<Record<number, boolean>>({});
  const selectedTileRef = useRef<Position | null>(null);

  const updateSelectedTile = useCallback(
    (tile: Position | null) => {
      selectedTileRef.current = tile;
      setGrabbed(tile !== null);
    },
    [setGrabbed]
  );

  useEffect(() => {
    getWatchedHintStages().then((stages: Record<number, boolean>) => {
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

  const areGridsEqual = useCallback((a: CellType[][], b: CellType[][]): boolean => {
    if (a.length !== b.length) return false;
    for (let y = 0; y < a.length; y++) {
      if (a[y].length !== b[y].length) return false;
      for (let x = 0; x < a[y].length; x++) {
        if (a[y][x] !== b[y][x]) return false;
      }
    }
    return true;
  }, []);

  useEffect(() => {
    if (!playTestMode || isProcessing || !grid || grid.length === 0) return;

    const steps = recordedStepsRef.current;
    const lastStep = steps.length > 0 ? steps[steps.length - 1] : null;

    if (!lastStep || !areGridsEqual(grid, lastStep)) {
      const newSnapshot = copyGrid(grid);
      const updated = [...steps, newSnapshot];
      recordedStepsRef.current = updated;
      setRecordedSteps(updated);
    }
  }, [grid, isProcessing, playTestMode, areGridsEqual]);

  const handleChanceClick = () => {
    if (remainingUndos > 0) {
      if (canUndoPlay) {
        undoPlay();
      } else {
        playSound('error', muted);
      }
    } else {
      playSound('select', muted);
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
      updateSelectedTile(null);
      engineLoadLevel(index);
    },
    [engineLoadLevel, updateSelectedTile]
  );

  const resetLevel = useCallback(() => {
    updateSelectedTile(null);
    engineResetLevel();
  }, [engineResetLevel, updateSelectedTile]);

  const handleFullReset = useCallback(
    (stage?: number) => {
      updateSelectedTile(null);
      onFullReset?.(stage !== undefined ? stage : levelIndex + 1);
    },
    [onFullReset, levelIndex, updateSelectedTile]
  );

  const [touchMoveEnabled, setTouchMoveEnabled] = useState<boolean>(false);

  useEffect(() => {
    setTouchMoveEnabled(isTouchMoveEnabled());

    const handleTouchMoveChange = (e: Event) => {
      const customEvt = e as CustomEvent<{ enabled: boolean }>;
      setTouchMoveEnabled(customEvt.detail?.enabled ?? isTouchMoveEnabled());
    };

    window.addEventListener(TOUCH_MOVE_CHANGE_EVENT, handleTouchMoveChange);
    return () => {
      window.removeEventListener(TOUCH_MOVE_CHANGE_EVENT, handleTouchMoveChange);
    };
  }, []);

  const [exportModalContent, setExportModalContent] = useState<string | null>(null);
  const [importText, setImportText] = useState<string>('');
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
    tryMatchShisenSho,
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
      tryMatchShisenSho,
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
    tryMatchShisenSho,
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

    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const stageParam = searchParams.get('stage');
      if (stageParam && !isEditor) {
        const stageIdx = parseInt(stageParam, 10) - 1;
        if (stageIdx >= 0 && stageIdx < BUILTIN_LEVELS.length) {
          const isLocalEnv =
            process.env.NEXT_PUBLIC_APP_ENV?.toUpperCase() === 'LOCAL' ||
            process.env.NODE_ENV === 'development';
          if (isLocalEnv) {
            onStageSelect?.(stageIdx + 1);
            loadLevel(stageIdx);
            setViewMode('game_scene');
            hasLoadedUrlStageRef.current = true;
            return;
          }

          getItem('puzznic_max_unlocked').then((stored) => {
            const maxUnlocked = parseInt(stored || '1', 10);
            if (isEditor || stageIdx + 1 <= maxUnlocked) {
              onStageSelect?.(stageIdx + 1);
              loadLevel(stageIdx);
              setViewMode('game_scene');
            } else {
              setItem('puzznic_max_unlocked', '1');
              loadLevel(0);
              setViewMode('game_scene');
              setTimeout(() => {
                setCheaterPopupOpen(true);
              }, 0);
              playSound('error', muted);
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
    if (typeof window !== 'undefined' && !isEditor && viewMode === 'game_scene') {
      const searchParams = new URLSearchParams(window.location.search);
      const currentStageNum = levelIndex + 1;
      if (searchParams.get('stage') !== currentStageNum.toString()) {
        searchParams.set('stage', currentStageNum.toString());
        const newRelativePathQuery = window.location.pathname + '?' + searchParams.toString();
        window.history.replaceState(null, '', newRelativePathQuery);
      }
    }
  }, [levelIndex, isEditor, viewMode]);

  // Unlock next stage when a stage is cleared
  useEffect(() => {
    if (isLevelCleared && !isEditor) {
      const nextLevel = levelIndex + 2;
      if (nextLevel <= BUILTIN_LEVELS.length + 1) {
        getItem('puzznic_max_unlocked').then((stored) => {
          const maxUnlocked = parseInt(stored || '1', 10);
          if (nextLevel > maxUnlocked) {
            setItem('puzznic_max_unlocked', nextLevel.toString());
          }
        });
      }
    }
  }, [isLevelCleared, levelIndex, isEditor]);

  // Keyboard navigation inside grid for Puzznic game
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const {
        grid: curGrid,
        cursor: curCursor,
        grabbed: initialGrabbed,
        isProcessing: curProcessing,
        isGameOver: curGameOver,
        isLevelCleared: curLevelCleared,
        activeEditor: curActiveEditor,
        muted: curMuted,
        tryMatchShisenSho: curTryMatchShisenSho,
        resetLevel: curResetLevel,
        setCursor: curSetCursor,
        setGrabbed: curSetGrabbed,
        setIsCursorVisible: curSetIsCursorVisible,
        levelIndex: curLevelIndex,
        loadLevel: curLoadLevel,
        isEditor: curIsEditor,
        onFullReset: curOnFullReset,
      } = gameViewRef.current;

      if (curLevelCleared) {
        if (e.key === 'Enter') {
          e.preventDefault();
          curSetGrabbed(false);
          if (!curIsEditor) {
            onStageClearAd?.(curLevelIndex + 1);
            const nextIdx = (curLevelIndex + 1) % BUILTIN_LEVELS.length;
            curLoadLevel(nextIdx);
          } else {
            curResetLevel();
          }
          playSound('start', curMuted);
        }
        return;
      }

      if (curActiveEditor || curGameOver || curProcessing) return;

      // 1. Shisen-Sho Selection & Matching with Space or Enter
      if (e.code === 'Space' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        curSetIsCursorVisible(true);
        const cell = curGrid[curCursor.y]?.[curCursor.x];
        const isPuzzleBlock = cell !== undefined && getBlockProperties(cell, curGrid)?.canSelect;

        const curSelected = selectedTileRef.current;

        if (curSelected) {
          if (curSelected.x === curCursor.x && curSelected.y === curCursor.y) {
            // Deselect currently selected tile
            updateSelectedTile(null);
            playSound('select', curMuted);
          } else if (isPuzzleBlock) {
            // Try matching with second tile
            curTryMatchShisenSho(curSelected, {
              x: curCursor.x,
              y: curCursor.y,
            }).then((matched: boolean) => {
              if (matched) {
                updateSelectedTile(null);
              } else {
                updateSelectedTile({ x: curCursor.x, y: curCursor.y });
                playSound('select', curMuted);
              }
            });
          } else {
            updateSelectedTile(null);
            playSound('select', curMuted);
          }
        } else {
          if (isPuzzleBlock) {
            updateSelectedTile({ x: curCursor.x, y: curCursor.y });
            playSound('select', curMuted);
          } else {
            playSound('error', curMuted);
          }
        }
        return;
      }

      // 2. Navigation with Arrow keys
      let dx = 0;
      let dy = 0;

      if (e.key === 'ArrowLeft') {
        dx = -1;
      } else if (e.key === 'ArrowRight') {
        dx = 1;
      } else if (e.key === 'ArrowUp') {
        dy = -1;
      } else if (e.key === 'ArrowDown') {
        dy = 1;
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        updateSelectedTile(null);
        if (!curIsEditor && curOnFullReset) {
          curOnFullReset(curLevelIndex + 1);
        } else {
          curResetLevel();
        }
        return;
      }

      if (dx !== 0 || dy !== 0) {
        e.preventDefault();
        curSetIsCursorVisible(true);
        curSetCursor((prev) => {
          const cols = curGrid[0]?.length || 8;
          const rows = curGrid.length || 8;
          const nx = Math.max(0, Math.min(cols - 1, prev.x + dx));
          const ny = Math.max(0, Math.min(rows - 1, prev.y + dy));
          playSound('select', curMuted);
          return { x: nx, y: ny };
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isDrawingRef = useRef<boolean>(false);
  const drawingToolRef = useRef<CellType | 'eraser' | 'ice'>(BLOCK_EMPTY);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDrawingRef.current = false;
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('blur', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('blur', handleGlobalMouseUp);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent, x: number, y: number) => {
    if (!activeEditor) return;
    if (e.button !== 0 && e.button !== 2) return;

    e.preventDefault();

    isDrawingRef.current = true;
    editorPushHistory();
    const isErase = e.button === 2 || selectedPaint === 'eraser';
    const tool = isErase ? 'eraser' : selectedPaint === 'ice' ? 'ice' : (selectedPaint as CellType);
    drawingToolRef.current = tool;

    editorPlaceBlock(x, y, tool);
  };

  const handleMouseEnter = (x: number, y: number) => {
    if (!activeEditor || !isDrawingRef.current) return;
    editorPlaceBlock(x, y, drawingToolRef.current);
  };

  const handleCellClick = async (x: number, y: number) => {
    if (activeEditor) return;
    setIsCursorVisible(true);
    const cell = grid[y]?.[x];
    const isPuzzleBlock =
      cell !== undefined &&
      getBlockProperties(cell, grid)?.canSelect &&
      !flashingBlocks[`${y},${x}`];

    if (isProcessing || Object.keys(flashingBlocks).length > 0) {
      return;
    }

    const curSelected = selectedTileRef.current;

    if (curSelected) {
      if (curSelected.x === x && curSelected.y === y) {
        // Deselect currently selected tile
        updateSelectedTile(null);
        playSound('select', muted);
      } else if (isPuzzleBlock) {
        // Try Shisen-Sho 2-turn match
        const matched = await tryMatchShisenSho(curSelected, { x, y });
        if (matched) {
          updateSelectedTile(null);
        } else {
          // Switch selection to clicked tile
          setCursor({ x, y });
          updateSelectedTile({ x, y });
          playSound('select', muted);
        }
      } else {
        // Clicked empty cell: deselect
        updateSelectedTile(null);
        playSound('select', muted);
      }
    } else {
      setCursor({ x, y });
      if (isPuzzleBlock) {
        updateSelectedTile({ x, y });
        playSound('select', muted);
      } else {
        updateSelectedTile(null);
        playSound('select', muted);
      }
    }
  };

  const togglePlayTest = () => {
    if (playTestMode) {
      setGrabbed(false);
      setIsCursorVisible(false);
      setPlayTestMode(false);
      editorRestoreLevel();
    } else {
      setPlayTestMode(true);
      const initCursor = findInitialCursor(grid);
      setCursor(initCursor);
      setGrabbed(false);
      setIsCursorVisible(false);
      const initialSnapshot = copyGrid(grid);
      recordedStepsRef.current = [initialSnapshot];
      setRecordedSteps([initialSnapshot]);
    }
    playSound('start', muted);
  };

  const handleExport = () => {
    setExportModalContent(formatLevelsJSON(editorLevels));
    playSound('start', muted);
  };

  const handleDownload = () => {
    if (!exportModalContent) return;
    const blob = new Blob([exportModalContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = editorMapType === 'test' ? 'test-map.json' : 'real-map.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    playSound('start', muted);
  };

  const handleImport = (jsonStr: string) => {
    const success = editorImportJSON(jsonStr);
    if (success) {
      setExportModalContent(null);
      playSound('start', muted);
    } else {
      alert('Invalid format or JSON');
      playSound('error', muted);
    }
  };

  useEditorHotkeys({
    active: isEditor,
    playTestMode,
    handlers: {
      onTogglePlayTest: togglePlayTest,
      onAddHint: () => {
        if (grid && editorAddHint) {
          editorAddHint(grid);
          toast.openToast('힌트가 추가되었습니다!');
        }
      },
      onPrevStage: () => {
        if (editorActiveIndex > 0) {
          playSound('select', muted);
          selectEditorLevel(editorActiveIndex - 1);
        }
      },
      onNextStage: () => {
        if (editorActiveIndex < editorLevels.length - 1) {
          playSound('select', muted);
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
            toast.openToast('클립보드에 복사되었습니다!');
            playSound('start', muted);
          })
          .catch((err) => {
            console.error('Clipboard copy failed:', err);
            playSound('error', muted);
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
        playSound('select', muted);
      },
      onSelectNextBlock: () => {
        const idx = ALL_PAINT_TOOLS.indexOf(selectedPaint);
        const nextIdx = (idx + 1) % ALL_PAINT_TOOLS.length;
        setSelectedPaint(ALL_PAINT_TOOLS[nextIdx]);
        playSound('select', muted);
      },
      onSelectPrevBlock: () => {
        const idx = ALL_PAINT_TOOLS.indexOf(selectedPaint);
        const prevIdx = (idx - 1 + ALL_PAINT_TOOLS.length) % ALL_PAINT_TOOLS.length;
        setSelectedPaint(ALL_PAINT_TOOLS[prevIdx]);
        playSound('select', muted);
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
        })
      )
    );
    setIsLevelCleared(true);
    playSound('start', muted);
  };

  if (viewMode === 'stage_select' && !isEditor) {
    return (
      <GameStageView
        onSelectStage={(idx) => {
          onStageSelect?.(idx + 1);
          loadLevel(idx);
          setViewMode('game_scene');
        }}
        onBackToHome={() => {
          try {
            router.push('/');
          } catch {
            window.location.href = '/';
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
          <div className="w-full flex-1 flex flex-col items-center justify-between p-0 text-stone-800 relative min-h-0">
            <GameBoardView
              grid={grid}
              statusMap={statusMap}
              chickenDirections={chickenDirections}
              cursor={cursor}
              activeEditor={activeEditor}
              playTestMode={playTestMode}
              grabbed={grabbed}
              isCursorVisible={isCursorVisible}
              isProcessing={isProcessing}
              flashingBlocks={flashingBlocks}
              bullets={bullets}
              shisenShoPath={shisenShoPath}
              firedOnce={firedOnce}
              isLevelCleared={isLevelCleared}
              isGameOver={isGameOver}
              levelIndex={levelIndex}
              isEditor={isEditor}
              muted={muted}
              turnsLeft={turnsLeft}
              setGrabbed={setGrabbed}
              loadLevel={loadLevel}
              resetLevel={resetLevel}
              setCursor={setCursor}
              playSound={playSound}
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
              editorUpdateTurnLimit={editorUpdateTurnLimit}
              selectEditorLevel={selectEditorLevel}
              editorAddLevel={editorAddLevel}
              editorDeleteLevel={editorDeleteLevel}
              togglePlayTest={togglePlayTest}
              editorMapType={editorMapType}
              setEditorMapType={setEditorMapType}
              changeMapType={changeMapType}
              onBackToStageSelect={() => {
                if (typeof window !== 'undefined') {
                  window.history.replaceState(null, '', window.location.pathname);
                }
                setViewMode('stage_select');
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
                playSound('select', muted);
              }}
              onOpenHintModal={() => {
                if (!isEditor && !playTestMode && levelIndex >= 30 && !hasWatchedHintAd) {
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
              openImportModal={() => setExportModalContent('')}
              hasActiveHints={hasActiveHints}
              isHintAttention={isHintAttention}
              activeHintsLength={activeHints?.length ?? 0}
              onOpenHintModal={() => {
                setCurrentHintIndex(0);
                setIsHintModalOpen(true);
                playSound('select', muted);
              }}
              recordedStepsLength={recordedSteps.length}
              onOpenRecordModal={() => {
                setCurrentRecordIndex(0);
                setIsRecordModalOpen(true);
                playSound('select', muted);
              }}
              playSound={playSound}
              muted={muted}
            />
          ) : (
            <div className="flex flex-col gap-1 w-full">
              <div className="hidden md:flex items-center justify-center sm:justify-start">
                <div className="text-xs text-stone-600 leading-relaxed max-w-[500px] text-center sm:text-left font-semibold">
                  {playTestMode ? (
                    <span className="text-emerald-700 font-bold">
                      [테스트 모드] 이동: [방향키] | 타일 선택/매칭: [Space/Enter] | 힌트 추가: [F9]
                    </span>
                  ) : (
                    <span>
                      이동: [방향키] | 타일 선택 및 짝맞추기: [Space / Enter] | 단계 재시작: [R]
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-center w-full relative">
                <PuzzleControls
                  onChanceClick={handleChanceClick}
                  remainingUndos={remainingUndos}
                  historySize={historySize}
                  showChanceButton
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
          playSound('start', muted);
        }}
      />

      {/* JSON Export/Import Modal */}
      <JsonExportImportModal
        exportModalContent={exportModalContent}
        importText={importText}
        setImportText={setImportText}
        onClose={() => {
          setExportModalContent(null);
          setImportText('');
        }}
        handleDownload={handleDownload}
        handleImport={handleImport}
        onCopyText={() => {
          if (exportModalContent) {
            navigator.clipboard.writeText(exportModalContent);
            toast.openToast('클립보드에 복사되었습니다!');
            playSound('select', muted);
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

      {/* Toast Notification */}
      <ToastNotification toastText={toast.toastText} />
    </div>
  );
}
