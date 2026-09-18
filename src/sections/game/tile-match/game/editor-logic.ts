'use client';

import type { CellType, LevelData } from './types';

import { useState, useCallback } from 'react';

import { playEngineSound } from './sound';
import { extractOrMigrateStatusMap } from './game-engine';
import { realMap, testMap, copyGrid, copyStatusMap } from './types';
import {
  BLOCK_WALL,
  BLOCK_EMPTY,
  canBeFrozen,
  isFrozenBlock,
  getBaseBlockId,
  getFrozenBlockId,
} from '../object/constants';

export interface HistorySnapshot {
  grid: CellType[][];
  statusMap?: number[][];
}

/** Custom hook for all level-editor state and actions. */
export const useEditorEngine = (
  isEditorMode: boolean,
  isEditorPage: boolean = false,
  grid: CellType[][],
  setGrid: React.Dispatch<React.SetStateAction<CellType[][]>>,
  setCursor: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>,
  setTurnsLeft: React.Dispatch<React.SetStateAction<number>>,
  muted: boolean,
  updateBlockCounts: (board: CellType[][]) => Record<string, number>,
  setBlockCounts: React.Dispatch<React.SetStateAction<Record<string, number>>>,
  setGrabbed: React.Dispatch<React.SetStateAction<boolean>>,
  setIsGameOver: React.Dispatch<React.SetStateAction<boolean>>,
  setIsLevelCleared: React.Dispatch<React.SetStateAction<boolean>>,
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>,
  setBullets: React.Dispatch<
    React.SetStateAction<
      {
        id: string;
        startX: number;
        startY: number;
        targetX: number;
        targetY: number;
        dir: number;
      }[]
    >
  >,
  setFlashingBlocks: React.Dispatch<React.SetStateAction<Record<string, CellType | boolean>>>,
  stateRef: React.MutableRefObject<
    { flashingBlocks: Record<string, CellType | boolean> } | undefined
  >,
  setHasMovedFirstBlock: React.Dispatch<React.SetStateAction<boolean>>,
  updateGrabbed: (updater: boolean | ((prev: boolean) => boolean)) => void,
  setFiredOnce: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
  firedOnceRef: React.MutableRefObject<Record<string, boolean>>,
  statusMap?: number[][],
  setStatusMap?: React.Dispatch<React.SetStateAction<number[][]>>
) => {
  // Editor level states
  const [editorLevels, setEditorLevels] = useState<LevelData[]>(() => {
    if (realMap.length === 0) {
      return [
        {
          name: 'LEVEL 1-1',
          grid: Array.from({ length: 8 }, () => Array(8).fill(BLOCK_EMPTY)),
          turnLimit: 50,
        },
      ];
    }
    return realMap.map((lvl) => ({
      name: lvl.name,
      grid: copyGrid(lvl.grid as CellType[][]),
      turnLimit: lvl.turnLimit ?? 50,
      statusMap: lvl.statusMap ? copyStatusMap(lvl.statusMap) : undefined,
      hint: lvl.hint ? (lvl.hint as CellType[][][]).map((g) => copyGrid(g)) : undefined,
    }));
  });
  const [editorActiveIndex, setEditorActiveIndex] = useState<number>(0);
  const [, setEditorHistory] = useState<HistorySnapshot[]>([]);
  const [copiedCol, setCopiedCol] = useState<CellType[] | null>(null);
  const [copiedRow, setCopiedRow] = useState<CellType[] | null>(null);

  const changeMapType = useCallback(
    (mapType: 'real' | 'test') => {
      if (!isEditorMode) return;
      const selectedMap = mapType === 'test' ? testMap : realMap;
      const newLevels: LevelData[] =
        selectedMap.length === 0
          ? [
              {
                name: 'LEVEL 1-1',
                grid: Array.from({ length: 8 }, () => Array(8).fill(BLOCK_EMPTY)),
                turnLimit: 50,
              },
            ]
          : selectedMap.map((lvl) => ({
              name: lvl.name,
              grid: copyGrid(lvl.grid as CellType[][]),
              turnLimit: lvl.turnLimit ?? 50,
              statusMap: lvl.statusMap ? copyStatusMap(lvl.statusMap) : undefined,
              hint: lvl.hint ? (lvl.hint as CellType[][][]).map((g) => copyGrid(g)) : undefined,
            }));

      setEditorLevels(newLevels);
      setEditorActiveIndex(0);

      const lvl = newLevels[0];
      const { grid: migratedGrid, statusMap: migratedStatusMap } = extractOrMigrateStatusMap(
        copyGrid(lvl.grid),
        lvl.statusMap
      );
      setGrid(migratedGrid);
      if (setStatusMap) {
        setStatusMap(migratedStatusMap);
      }
      setTurnsLeft(lvl.turnLimit ?? 50);
      setCursor({
        x: Math.floor(migratedGrid[0].length / 2),
        y: migratedGrid.length - 1,
      });
      updateBlockCounts(migratedGrid);
      setEditorHistory([]);
    },
    [isEditorMode, setGrid, setStatusMap, setTurnsLeft, setCursor, updateBlockCounts]
  );

  const editorPushHistory = useCallback(
    (customGrid?: CellType[][], customStatusMap?: number[][]) => {
      const gridToSave = customGrid || grid;
      const statusMapToSave = customStatusMap || statusMap;
      setEditorHistory((prev) => {
        const snapshot: HistorySnapshot = {
          grid: copyGrid(gridToSave),
          statusMap: statusMapToSave ? copyStatusMap(statusMapToSave) : undefined,
        };
        const next = [...prev, snapshot];
        if (next.length > 50) {
          next.shift();
        }
        return next;
      });
    },
    [grid, statusMap]
  );

  const updateEditorLevelGrid = useCallback(
    (newGrid: CellType[][]) => {
      setEditorLevels((prev) => {
        const next = [...prev];
        if (next[editorActiveIndex]) {
          next[editorActiveIndex] = {
            ...next[editorActiveIndex],
            grid: copyGrid(newGrid),
          };
        }
        return next;
      });
    },
    [editorActiveIndex]
  );

  const updateEditorLevelStatusMap = useCallback(
    (newStatusMap: number[][]) => {
      setEditorLevels((prev) => {
        const next = [...prev];
        if (next[editorActiveIndex]) {
          next[editorActiveIndex] = {
            ...next[editorActiveIndex],
            statusMap: copyStatusMap(newStatusMap),
          };
        }
        return next;
      });
    },
    [editorActiveIndex]
  );

  const selectEditorLevel = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= editorLevels.length) return;
      setEditorActiveIndex(idx);
      const lvl = editorLevels[idx];
      const { grid: migratedGrid, statusMap: migratedStatusMap } = extractOrMigrateStatusMap(
        copyGrid(lvl.grid),
        lvl.statusMap
      );
      setGrid(migratedGrid);
      if (setStatusMap) {
        setStatusMap(migratedStatusMap);
      }
      setTurnsLeft(lvl.turnLimit ?? 50);
      setCursor({
        x: Math.floor(migratedGrid[0].length / 2),
        y: migratedGrid.length - 1,
      });
      updateBlockCounts(migratedGrid);
      setEditorHistory([]);
    },
    [editorLevels, updateBlockCounts, setGrid, setStatusMap, setTurnsLeft, setCursor]
  );

  const editorAddLevel = useCallback(() => {
    if (!isEditorMode) return;
    const insertIdx = editorActiveIndex + 1;
    const currentRows = grid.length;
    const currentCols = grid[0]?.length || 8;
    setEditorLevels((prev) => {
      const next = [...prev];
      const newLvl: LevelData = {
        name: '',
        grid: Array.from({ length: currentRows }, () => Array(currentCols).fill(BLOCK_EMPTY)),
        turnLimit: 50,
      };
      next.splice(insertIdx, 0, newLvl);
      const reindexed = next.map((lvl, i) => ({
        ...lvl,
        name: `LEVEL 1-${i + 1}`,
      }));
      setTimeout(() => {
        setEditorActiveIndex(insertIdx);
        const lvl = reindexed[insertIdx];
        setGrid(copyGrid(lvl.grid));
        setTurnsLeft(lvl.turnLimit ?? 50);
        setCursor({
          x: Math.floor(lvl.grid[0].length / 2),
          y: lvl.grid.length - 1,
        });
        updateBlockCounts(lvl.grid);
      }, 0);
      return reindexed;
    });
    playEngineSound('start', muted);
  }, [
    isEditorMode,
    muted,
    editorActiveIndex,
    updateBlockCounts,
    grid,
    setGrid,
    setTurnsLeft,
    setCursor,
  ]);

  const editorDeleteLevel = useCallback(() => {
    if (!isEditorMode || editorLevels.length <= 1) return;
    setEditorLevels((prev) => {
      const next = prev.filter((_, i) => i !== editorActiveIndex);
      const reindexed = next.map((lvl, i) => ({
        ...lvl,
        name: `LEVEL 1-${i + 1}`,
      }));
      const nextIdx = Math.max(0, Math.min(reindexed.length - 1, editorActiveIndex));
      setTimeout(() => {
        setEditorActiveIndex(nextIdx);
        const lvl = reindexed[nextIdx];
        setGrid(copyGrid(lvl.grid));
        setTurnsLeft(lvl.turnLimit ?? 50);
        setCursor({
          x: Math.floor(lvl.grid[0].length / 2),
          y: lvl.grid.length - 1,
        });
        updateBlockCounts(lvl.grid);
      }, 0);
      return reindexed;
    });
    playEngineSound('error', muted);
  }, [
    isEditorMode,
    editorLevels.length,
    editorActiveIndex,
    muted,
    updateBlockCounts,
    setGrid,
    setTurnsLeft,
    setCursor,
  ]);

  const editorUpdateTurnLimit = useCallback(
    (limit: number) => {
      if (!isEditorMode) return;
      const cleanLimit = Math.max(1, limit);
      setTurnsLeft(cleanLimit);
      setEditorLevels((prev) => {
        const next = [...prev];
        if (next[editorActiveIndex]) {
          next[editorActiveIndex] = {
            ...next[editorActiveIndex],
            turnLimit: cleanLimit,
          };
        }
        return next;
      });
    },
    [isEditorMode, editorActiveIndex, setTurnsLeft]
  );

  const editorUndo = useCallback(() => {
    if (!isEditorMode) return;
    let reverted = false;
    setEditorHistory((prev) => {
      if (prev.length === 0) {
        return prev;
      }
      const next = [...prev];
      const snapshot = next.pop()!;

      setGrid(copyGrid(snapshot.grid));
      updateBlockCounts(snapshot.grid);
      updateEditorLevelGrid(snapshot.grid);

      if (setStatusMap) {
        const restoredStatusMap = snapshot.statusMap
          ? copyStatusMap(snapshot.statusMap)!
          : Array.from({ length: snapshot.grid.length }, () =>
              Array(snapshot.grid[0]?.length || 8).fill(0)
            );
        setStatusMap(restoredStatusMap);
        updateEditorLevelStatusMap(restoredStatusMap);
      }

      reverted = true;
      return next;
    });
    if (reverted) {
      playEngineSound('select', muted);
    } else {
      playEngineSound('error', muted);
    }
  }, [
    isEditorMode,
    muted,
    updateBlockCounts,
    updateEditorLevelGrid,
    updateEditorLevelStatusMap,
    setGrid,
    setStatusMap,
  ]);

  const editorImportJSON = useCallback(
    (jsonStr: string) => {
      try {
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed)) {
          const valid = parsed.every((lvl) => lvl && Array.isArray(lvl.grid));
          if (valid) {
            const cleaned = parsed.map((lvl, i) => ({
              name: lvl.name || `LEVEL 1-${i + 1}`,
              grid: copyGrid(lvl.grid as CellType[][]),
              turnLimit: lvl.turnLimit ?? 50,
              statusMap: Array.isArray(lvl.statusMap)
                ? copyStatusMap(lvl.statusMap as number[][])
                : undefined,
              hint: Array.isArray(lvl.hint)
                ? (lvl.hint as CellType[][][]).map((g) => copyGrid(g))
                : undefined,
            }));
            setEditorLevels(cleaned);
            setEditorActiveIndex(0);
            setGrid(copyGrid(cleaned[0].grid));
            if (cleaned[0].statusMap && setStatusMap) {
              setStatusMap(copyStatusMap(cleaned[0].statusMap)!);
            }
            setTurnsLeft(cleaned[0].turnLimit ?? 50);
            setCursor({
              x: Math.floor(cleaned[0].grid[0].length / 2),
              y: cleaned[0].grid.length - 1,
            });
            updateBlockCounts(cleaned[0].grid);
            setEditorHistory([]);
            return true;
          }
        } else if (parsed && Array.isArray(parsed.grid)) {
          const cleaned: LevelData = {
            name: parsed.name || 'CUSTOM LEVEL',
            grid: copyGrid(parsed.grid as CellType[][]),
            turnLimit: parsed.turnLimit ?? 50,
            hint: Array.isArray(parsed.hint)
              ? (parsed.hint as CellType[][][]).map((g) => copyGrid(g))
              : undefined,
          };
          setEditorLevels([cleaned]);
          setEditorActiveIndex(0);
          setGrid(copyGrid(cleaned.grid));
          setTurnsLeft(cleaned.turnLimit ?? 50);
          setCursor({
            x: Math.floor(cleaned.grid.length > 0 ? cleaned.grid[0].length / 2 : 4),
            y: cleaned.grid.length > 0 ? cleaned.grid.length - 1 : 7,
          });
          updateBlockCounts(cleaned.grid);
          setEditorHistory([]);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [updateBlockCounts, setGrid, setTurnsLeft, setCursor]
  );

  const editorRestoreLevel = useCallback(() => {
    const activeLvl = editorLevels[editorActiveIndex];
    if (activeLvl) {
      const { grid: migratedGrid, statusMap: migratedStatusMap } = extractOrMigrateStatusMap(
        copyGrid(activeLvl.grid),
        activeLvl.statusMap
      );
      setGrid(migratedGrid);
      if (setStatusMap) {
        setStatusMap(migratedStatusMap);
      }
      updateBlockCounts(migratedGrid);
      setTurnsLeft(activeLvl.turnLimit ?? 50);
    }
    setIsGameOver(false);
    setIsLevelCleared(false);
    setIsProcessing(false);
    setBullets([]);
    setFlashingBlocks({});
    if (stateRef.current) stateRef.current.flashingBlocks = {};
    setHasMovedFirstBlock(false);
    updateGrabbed(false);
    setFiredOnce({});
    firedOnceRef.current = {};
  }, [
    editorActiveIndex,
    editorLevels,
    updateBlockCounts,
    updateGrabbed,
    setGrid,
    setTurnsLeft,
    setIsGameOver,
    setIsLevelCleared,
    setIsProcessing,
    setBullets,
    setFlashingBlocks,
    stateRef,
    setHasMovedFirstBlock,
    setFiredOnce,
    firedOnceRef,
  ]);

  const editorPlaceBlock = useCallback(
    (x: number, y: number, blockType: CellType | 'eraser' | 'ice' | string) => {
      if (!isEditorMode) return;

      if (typeof blockType === 'string' && blockType.startsWith('path_')) {
        const pathVal = parseInt(blockType.replace('path_', ''), 10);
        if (statusMap && setStatusMap) {
          const currentPath = statusMap[y]?.[x];
          if (currentPath === pathVal) return;
          const nextStatusMap = statusMap.map((row) => [...row]);
          if (!nextStatusMap[y]) return;
          nextStatusMap[y][x] = pathVal;
          setStatusMap(nextStatusMap);
          updateEditorLevelStatusMap(nextStatusMap);
          playEngineSound('select', muted);
        }
        return;
      }

      const currentCell = grid[y]?.[x];
      let targetBlock: CellType;

      if (blockType === 'ice') {
        if (currentCell === undefined || currentCell === BLOCK_EMPTY) return;
        if (!canBeFrozen(currentCell)) return;
        targetBlock = isFrozenBlock(currentCell)
          ? getBaseBlockId(currentCell)
          : getFrozenBlockId(currentCell);
      } else if (blockType === 'eraser') {
        targetBlock = BLOCK_EMPTY;
      } else {
        targetBlock = blockType as CellType;
      }

      if (currentCell === targetBlock) return;
      const nextGrid = grid.map((row) => [...row]);
      nextGrid[y][x] = targetBlock;
      setGrid(nextGrid);
      updateBlockCounts(nextGrid);
      updateEditorLevelGrid(nextGrid);
      playEngineSound('select', muted);
    },
    [
      grid,
      statusMap,
      setStatusMap,
      isEditorMode,
      updateBlockCounts,
      updateEditorLevelGrid,
      updateEditorLevelStatusMap,
      muted,
      setGrid,
    ]
  );

  const editorClearGrid = useCallback(() => {
    if (!isEditorMode) return;
    setGrabbed(false);
    editorPushHistory(grid);
    const currentRows = grid.length;
    const currentCols = grid[0]?.length || 8;
    const newGrid = Array.from({ length: currentRows }, () => Array(currentCols).fill(BLOCK_EMPTY));
    setGrid(newGrid);
    setBlockCounts({});
    updateEditorLevelGrid(newGrid);

    if (setStatusMap) {
      const newStatusMap = Array.from({ length: currentRows }, () => Array(currentCols).fill(0));
      setStatusMap(newStatusMap);
      updateEditorLevelStatusMap(newStatusMap);
    }
    playEngineSound('error', muted);
  }, [
    isEditorMode,
    muted,
    setBlockCounts,
    setGrabbed,
    updateEditorLevelGrid,
    updateEditorLevelStatusMap,
    setStatusMap,
    grid,
    editorPushHistory,
    setGrid,
  ]);

  const editorFillBorder = useCallback(() => {
    if (!isEditorMode) return;
    setGrabbed(false);
    editorPushHistory(grid);
    setGrid((prevGrid) => {
      const rows = prevGrid.length;
      const cols = prevGrid[0]?.length || 0;
      if (rows === 0 || cols === 0) return prevGrid;

      const nextGrid = prevGrid.map((row, y) =>
        row.map((cell, x) => {
          if (y === 0 || y === rows - 1 || x === 0 || x === cols - 1) {
            return BLOCK_WALL;
          }
          return cell;
        })
      );

      updateBlockCounts(nextGrid);
      updateEditorLevelGrid(nextGrid);
      return nextGrid;
    });
    playEngineSound('select', muted);
  }, [
    isEditorMode,
    muted,
    updateBlockCounts,
    updateEditorLevelGrid,
    setGrabbed,
    grid,
    editorPushHistory,
    setGrid,
  ]);

  const editorResizeGrid = useCallback(
    (newRows: number, newCols: number) => {
      if (!isEditorMode) return;
      editorPushHistory(grid);
      const rows = Math.max(4, Math.min(12, newRows));
      const cols = Math.max(4, Math.min(16, newCols));

      setGrid((prevGrid) => {
        const currentRows = prevGrid.length;
        const currentCols = prevGrid[0]?.length || 0;

        let nextGrid = prevGrid.map((row) => [...row]);

        // Resize rows
        if (rows > currentRows) {
          for (let i = currentRows; i < rows; i++) {
            nextGrid.push(Array(currentCols).fill(BLOCK_EMPTY));
          }
        } else if (rows < currentRows) {
          nextGrid = nextGrid.slice(0, rows);
        }

        // Resize columns
        nextGrid = nextGrid.map((row) => {
          if (cols > currentCols) {
            return [...row, ...Array(cols - currentCols).fill(BLOCK_EMPTY)];
          } else {
            return row.slice(0, cols);
          }
        });

        // Clamp cursor position
        setCursor((prev) => ({
          x: Math.max(0, Math.min(cols - 1, prev.x)),
          y: Math.max(0, Math.min(rows - 1, prev.y)),
        }));

        updateBlockCounts(nextGrid);
        updateEditorLevelGrid(nextGrid);
        return nextGrid;
      });

      if (statusMap && setStatusMap) {
        const currentRows = statusMap.length;
        const currentCols = statusMap[0]?.length || 0;
        let nextStatusMap = statusMap.map((row) => [...row]);

        if (rows > currentRows) {
          for (let i = currentRows; i < rows; i++) {
            nextStatusMap.push(Array(currentCols).fill(0));
          }
        } else if (rows < currentRows) {
          nextStatusMap = nextStatusMap.slice(0, rows);
        }

        nextStatusMap = nextStatusMap.map((row) => {
          if (cols > currentCols) {
            return [...row, ...Array(cols - currentCols).fill(0)];
          } else {
            return row.slice(0, cols);
          }
        });

        setStatusMap(nextStatusMap);
        updateEditorLevelStatusMap(nextStatusMap);
      }
    },
    [
      isEditorMode,
      updateBlockCounts,
      updateEditorLevelGrid,
      updateEditorLevelStatusMap,
      statusMap,
      setStatusMap,
      grid,
      editorPushHistory,
      setGrid,
      setCursor,
    ]
  );

  const editorDeleteRow = useCallback(
    (y: number) => {
      if (!isEditorMode) return;

      const targetRow = grid[y];
      if (!targetRow) return;

      const isRowEmpty = targetRow.every((cell) => cell === BLOCK_EMPTY);

      editorPushHistory(grid);

      if (!isRowEmpty) {
        // Not empty: make the whole row empty
        const nextGrid = grid.map((row, idx) =>
          idx === y ? row.map(() => BLOCK_EMPTY) : [...row]
        );
        setGrid(nextGrid);
        updateBlockCounts(nextGrid);
        updateEditorLevelGrid(nextGrid);

        if (statusMap && setStatusMap) {
          const nextStatusMap = statusMap.map((row, idx) =>
            idx === y ? row.map(() => 0) : [...row]
          );
          setStatusMap(nextStatusMap);
          updateEditorLevelStatusMap(nextStatusMap);
        }
        playEngineSound('select', muted);
      } else {
        // Already empty: remove the row itself
        if (grid.length <= 4) {
          playEngineSound('error', muted);
          return;
        }
        const nextGrid = grid.filter((_, idx) => idx !== y);
        setGrid(nextGrid);

        // Adjust cursor
        setCursor((prev) => ({
          x: prev.x,
          y: Math.max(0, Math.min(nextGrid.length - 1, prev.y)),
        }));

        updateBlockCounts(nextGrid);
        updateEditorLevelGrid(nextGrid);

        if (statusMap && setStatusMap) {
          const nextStatusMap = statusMap.filter((_, idx) => idx !== y);
          setStatusMap(nextStatusMap);
          updateEditorLevelStatusMap(nextStatusMap);
        }
        playEngineSound('break', muted);
      }
    },
    [
      isEditorMode,
      grid,
      statusMap,
      setStatusMap,
      muted,
      setGrid,
      setCursor,
      updateBlockCounts,
      updateEditorLevelGrid,
      updateEditorLevelStatusMap,
      editorPushHistory,
    ]
  );

  const editorDeleteCol = useCallback(
    (x: number) => {
      if (!isEditorMode) return;

      const isColEmpty = grid.every((row) => row[x] === BLOCK_EMPTY);

      editorPushHistory(grid);

      if (!isColEmpty) {
        // Not empty: make the whole column empty
        const nextGrid = grid.map((row) =>
          row.map((cell, idx) => (idx === x ? BLOCK_EMPTY : cell))
        );
        setGrid(nextGrid);
        updateBlockCounts(nextGrid);
        updateEditorLevelGrid(nextGrid);

        if (statusMap && setStatusMap) {
          const nextStatusMap = statusMap.map((row) =>
            row.map((val, idx) => (idx === x ? 0 : val))
          );
          setStatusMap(nextStatusMap);
          updateEditorLevelStatusMap(nextStatusMap);
        }
        playEngineSound('select', muted);
      } else {
        // Already empty: remove the column itself
        const currentCols = grid[0]?.length || 0;
        if (currentCols <= 4) {
          playEngineSound('error', muted);
          return;
        }
        const nextGrid = grid.map((row) => row.filter((_, idx) => idx !== x));
        setGrid(nextGrid);

        // Adjust cursor
        setCursor((prev) => ({
          x: Math.max(0, Math.min(nextGrid[0].length - 1, prev.x)),
          y: prev.y,
        }));

        updateBlockCounts(nextGrid);
        updateEditorLevelGrid(nextGrid);

        if (statusMap && setStatusMap) {
          const nextStatusMap = statusMap.map((row) => row.filter((_, idx) => idx !== x));
          setStatusMap(nextStatusMap);
          updateEditorLevelStatusMap(nextStatusMap);
        }
        playEngineSound('break', muted);
      }
    },
    [
      isEditorMode,
      grid,
      statusMap,
      setStatusMap,
      muted,
      setGrid,
      setCursor,
      updateBlockCounts,
      updateEditorLevelGrid,
      updateEditorLevelStatusMap,
      editorPushHistory,
    ]
  );

  const editorInsertColLeft = useCallback(
    (x: number) => {
      if (!isEditorMode) return;
      const currentCols = grid[0]?.length || 0;
      if (currentCols >= 16) {
        playEngineSound('error', muted);
        return;
      }

      editorPushHistory(grid);
      const nextGrid = grid.map((row) => [...row.slice(0, x), BLOCK_EMPTY, ...row.slice(x)]);
      setGrid(nextGrid);

      setCursor((prev) => ({
        x: prev.x >= x ? prev.x + 1 : prev.x,
        y: prev.y,
      }));

      updateBlockCounts(nextGrid);
      updateEditorLevelGrid(nextGrid);

      if (statusMap && setStatusMap) {
        const nextStatusMap = statusMap.map((row) => [...row.slice(0, x), 0, ...row.slice(x)]);
        setStatusMap(nextStatusMap);
        updateEditorLevelStatusMap(nextStatusMap);
      }
      playEngineSound('select', muted);
    },
    [
      isEditorMode,
      grid,
      statusMap,
      setStatusMap,
      muted,
      setGrid,
      setCursor,
      updateBlockCounts,
      updateEditorLevelGrid,
      updateEditorLevelStatusMap,
      editorPushHistory,
    ]
  );

  const editorInsertColRight = useCallback(
    (x: number) => {
      if (!isEditorMode) return;
      const currentCols = grid[0]?.length || 0;
      if (currentCols >= 16) {
        playEngineSound('error', muted);
        return;
      }

      editorPushHistory(grid);
      const nextGrid = grid.map((row) => [
        ...row.slice(0, x + 1),
        BLOCK_EMPTY,
        ...row.slice(x + 1),
      ]);
      setGrid(nextGrid);

      setCursor((prev) => ({
        x: prev.x > x ? prev.x + 1 : prev.x,
        y: prev.y,
      }));

      updateBlockCounts(nextGrid);
      updateEditorLevelGrid(nextGrid);

      if (statusMap && setStatusMap) {
        const nextStatusMap = statusMap.map((row) => [
          ...row.slice(0, x + 1),
          0,
          ...row.slice(x + 1),
        ]);
        setStatusMap(nextStatusMap);
        updateEditorLevelStatusMap(nextStatusMap);
      }
      playEngineSound('select', muted);
    },
    [
      isEditorMode,
      grid,
      statusMap,
      setStatusMap,
      muted,
      setGrid,
      setCursor,
      updateBlockCounts,
      updateEditorLevelGrid,
      updateEditorLevelStatusMap,
      editorPushHistory,
    ]
  );

  const editorInsertRowAbove = useCallback(
    (y: number) => {
      if (!isEditorMode) return;
      const currentRows = grid.length;
      if (currentRows >= 12) {
        playEngineSound('error', muted);
        return;
      }

      editorPushHistory(grid);
      const cols = grid[0]?.length || 8;
      const newRow = Array(cols).fill(BLOCK_EMPTY);
      const nextGrid = [...grid.slice(0, y), newRow, ...grid.slice(y)];
      setGrid(nextGrid);

      setCursor((prev) => ({
        x: prev.x,
        y: prev.y >= y ? prev.y + 1 : prev.y,
      }));

      updateBlockCounts(nextGrid);
      updateEditorLevelGrid(nextGrid);

      if (statusMap && setStatusMap) {
        const statusCols = statusMap[0]?.length || cols;
        const newStatusRow = Array(statusCols).fill(0);
        const nextStatusMap = [...statusMap.slice(0, y), newStatusRow, ...statusMap.slice(y)];
        setStatusMap(nextStatusMap);
        updateEditorLevelStatusMap(nextStatusMap);
      }
      playEngineSound('select', muted);
    },
    [
      isEditorMode,
      grid,
      statusMap,
      setStatusMap,
      muted,
      setGrid,
      setCursor,
      updateBlockCounts,
      updateEditorLevelGrid,
      updateEditorLevelStatusMap,
      editorPushHistory,
    ]
  );

  const editorInsertRowBelow = useCallback(
    (y: number) => {
      if (!isEditorMode) return;
      const currentRows = grid.length;
      if (currentRows >= 12) {
        playEngineSound('error', muted);
        return;
      }

      editorPushHistory(grid);
      const cols = grid[0]?.length || 8;
      const newRow = Array(cols).fill(BLOCK_EMPTY);
      const nextGrid = [...grid.slice(0, y + 1), newRow, ...grid.slice(y + 1)];
      setGrid(nextGrid);

      setCursor((prev) => ({
        x: prev.x,
        y: prev.y > y ? prev.y + 1 : prev.y,
      }));

      updateBlockCounts(nextGrid);
      updateEditorLevelGrid(nextGrid);

      if (statusMap && setStatusMap) {
        const statusCols = statusMap[0]?.length || cols;
        const newStatusRow = Array(statusCols).fill(0);
        const nextStatusMap = [
          ...statusMap.slice(0, y + 1),
          newStatusRow,
          ...statusMap.slice(y + 1),
        ];
        setStatusMap(nextStatusMap);
        updateEditorLevelStatusMap(nextStatusMap);
      }
      playEngineSound('select', muted);
    },
    [
      isEditorMode,
      grid,
      statusMap,
      setStatusMap,
      muted,
      setGrid,
      setCursor,
      updateBlockCounts,
      updateEditorLevelGrid,
      updateEditorLevelStatusMap,
      editorPushHistory,
    ]
  );

  const editorFlipHorizontal = useCallback(() => {
    if (!isEditorMode) return;
    setGrabbed(false);
    editorPushHistory(grid);
    const nextGrid = grid.map((row) => [...row].reverse());

    // Flip cursor position horizontally
    setCursor((prev) => ({
      x: (grid[0]?.length || 8) - 1 - prev.x,
      y: prev.y,
    }));

    setGrid(nextGrid);
    updateBlockCounts(nextGrid);
    updateEditorLevelGrid(nextGrid);
    playEngineSound('select', muted);
  }, [
    isEditorMode,
    muted,
    updateBlockCounts,
    updateEditorLevelGrid,
    setGrabbed,
    grid,
    editorPushHistory,
    setGrid,
    setCursor,
  ]);

  const editorAddHint = useCallback(
    (currentGrid: CellType[][]) => {
      if (!isEditorPage && !isEditorMode) return;
      setEditorLevels((prev) => {
        const next = [...prev];
        const activeLvl = next[editorActiveIndex];
        if (activeLvl) {
          const currentHints = activeLvl.hint ? [...activeLvl.hint] : [];
          currentHints.push(copyGrid(currentGrid));
          next[editorActiveIndex] = {
            ...activeLvl,
            hint: currentHints,
          };
        }
        return next;
      });
      playEngineSound('coin', muted);
    },
    [isEditorPage, isEditorMode, editorActiveIndex, muted]
  );

  const editorDeleteHint = useCallback(
    (hintIdx: number) => {
      if (!isEditorPage && !isEditorMode) return;
      setEditorLevels((prev) => {
        const next = [...prev];
        const activeLvl = next[editorActiveIndex];
        if (activeLvl && activeLvl.hint) {
          const currentHints = activeLvl.hint.filter((_, i) => i !== hintIdx);
          next[editorActiveIndex] = {
            ...activeLvl,
            hint: currentHints.length > 0 ? currentHints : undefined,
          };
        }
        return next;
      });
      playEngineSound('break', muted);
    },
    [isEditorPage, isEditorMode, editorActiveIndex, muted]
  );

  const editorCopyCol = useCallback(
    (x: number) => {
      if (!isEditorMode) return;
      const colData = grid.map((row) => row[x] ?? BLOCK_EMPTY);
      setCopiedCol(colData);
      playEngineSound('select', muted);
    },
    [isEditorMode, grid, muted]
  );

  const editorPasteCol = useCallback(
    (x: number) => {
      if (!isEditorMode || !copiedCol) return;
      editorPushHistory(grid);
      const nextGrid = grid.map((row, y) =>
        row.map((cell, idx) => (idx === x ? (copiedCol[y] ?? BLOCK_EMPTY) : cell))
      );
      setGrid(nextGrid);
      updateBlockCounts(nextGrid);
      updateEditorLevelGrid(nextGrid);
      playEngineSound('select', muted);
    },
    [
      isEditorMode,
      grid,
      copiedCol,
      muted,
      setGrid,
      updateBlockCounts,
      updateEditorLevelGrid,
      editorPushHistory,
    ]
  );

  const editorCopyRow = useCallback(
    (y: number) => {
      if (!isEditorMode) return;
      const rowData = grid[y] ? [...grid[y]] : [];
      setCopiedRow(rowData);
      playEngineSound('select', muted);
    },
    [isEditorMode, grid, muted]
  );

  const editorPasteRow = useCallback(
    (y: number) => {
      if (!isEditorMode || !copiedRow) return;
      const cols = grid[0]?.length || 8;
      editorPushHistory(grid);
      const nextGrid = grid.map((row, idx) => {
        if (idx !== y) return [...row];
        return Array.from({ length: cols }, (_, x) => copiedRow[x] ?? BLOCK_EMPTY);
      });
      setGrid(nextGrid);
      updateBlockCounts(nextGrid);
      updateEditorLevelGrid(nextGrid);
      playEngineSound('select', muted);
    },
    [
      isEditorMode,
      grid,
      copiedRow,
      muted,
      setGrid,
      updateBlockCounts,
      updateEditorLevelGrid,
      editorPushHistory,
    ]
  );

  return {
    editorLevels,
    setEditorLevels,
    editorActiveIndex,
    setEditorActiveIndex,
    selectEditorLevel,
    editorAddLevel,
    editorDeleteLevel,
    editorUpdateTurnLimit,
    editorUndo,
    editorImportJSON,
    editorRestoreLevel,
    editorPlaceBlock,
    editorClearGrid,
    editorFillBorder,
    editorResizeGrid,
    editorPushHistory,
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
    changeMapType,
    editorAddHint,
    editorDeleteHint,
  };
};
