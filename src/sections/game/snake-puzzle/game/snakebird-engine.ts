'use client';

import type {
  Direction,
  SnakeBird,
  SnakebirdGameState,
  SnakebirdLevelData,
} from './snakebird-types';

import { useRef, useState, useEffect, useCallback } from 'react';

import { playEngineSound } from './sound';
import { isSfxMuted } from '../utils/sound';
import { getLocalSync } from '../utils/local-storage';
import { SNAKEBIRD_LEVELS } from '../level/snakebird-levels';
import {
  moveBird,
  applyGravity,
  cloneGameState,
  getNextActiveBirdId,
  checkPortalAndClear,
} from './snakebird-physics';

export function createInitialState(level: SnakebirdLevelData): SnakebirdGameState {
  const initialBirds: SnakeBird[] = level.birds.map((b) => ({
    id: b.id,
    color: b.color,
    segments: b.segments.map((s) => ({ ...s })),
    facingDir: b.facingDir || 'right',
    isExited: false,
    isDead: false,
  }));

  const state: SnakebirdGameState = {
    width: level.width || 10,
    height: level.height || 8,
    walls: level.walls.map((w) => ({ ...w })),
    fruits: level.fruits.map((f) => ({ ...f })),
    spikes: level.spikes.map((s) => ({ ...s })),
    portal: { ...level.portal },
    birds: initialBirds,
    activeBirdId: initialBirds[0]?.id || '',
    moveCount: 0,
    isClear: false,
    isGameOver: false,
    fallingBirdIds: [],
  };

  // Initial gravity resolution in case level starts in mid-air
  const gravityRes = applyGravity(state);
  checkPortalAndClear(gravityRes.state);

  return gravityRes.state;
}

export function useSnakebirdEngine(initialLevelIndex = 0, _isEditorMode = false) {
  const [levelIndex, setLevelIndex] = useState<number>(initialLevelIndex);
  const [allLevels, setAllLevels] = useState<SnakebirdLevelData[]>(() => SNAKEBIRD_LEVELS);

  const [currentLevel, setCurrentLevel] = useState<SnakebirdLevelData>(
    () => SNAKEBIRD_LEVELS[initialLevelIndex] || SNAKEBIRD_LEVELS[0]
  );

  const [gameState, setGameState] = useState<SnakebirdGameState>(() =>
    createInitialState(currentLevel)
  );

  const [history, setHistory] = useState<SnakebirdGameState[]>([]);
  const [muted, setMuted] = useState<boolean>(false);
  const [isPlaytestMode, setIsPlaytestMode] = useState<boolean>(false);
  const [editorLevels, setEditorLevels] = useState<SnakebirdLevelData[]>(() => SNAKEBIRD_LEVELS);

  const currentLevelRef = useRef(currentLevel);

  useEffect(() => {
    currentLevelRef.current = currentLevel;
  }, [currentLevel]);

  // Load sound setting & custom levels on mount
  useEffect(() => {
    setMuted(isSfxMuted());
    const savedCustom = getLocalSync('snakebird_custom_levels');
    if (savedCustom) {
      try {
        const parsed = JSON.parse(savedCustom) as SnakebirdLevelData[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEditorLevels(parsed);
        }
      } catch {
        // ignore invalid json
      }
    }
  }, []);

  // Load specific level
  const loadLevel = useCallback(
    (idx: number, customList?: SnakebirdLevelData[]) => {
      const list = customList || allLevels;
      const targetIdx = Math.max(0, Math.min(idx, list.length - 1));
      const targetLvl = list[targetIdx] || list[0];

      setLevelIndex(targetIdx);
      setCurrentLevel(targetLvl);
      const initState = createInitialState(targetLvl);
      setGameState(initState);
      setHistory([]);
      playEngineSound('start', isSfxMuted());
    },
    [allLevels]
  );

  // Reset current level
  const resetLevel = useCallback(() => {
    const initState = createInitialState(currentLevelRef.current);
    setGameState(initState);
    setHistory([]);
    playEngineSound('select', isSfxMuted());
  }, []);

  // Player Move
  const move = useCallback(
    (dir: Direction) => {
      if (gameState.isClear || gameState.isGameOver) return;
      if (!gameState.activeBirdId) return;

      const previousStateSnapshot = cloneGameState(gameState);
      const res = moveBird(gameState, gameState.activeBirdId, dir);

      if (!res.success) {
        // Invalid move or blocked
        return;
      }

      // Push previous state to undo stack
      setHistory((prev) => [...prev.slice(-99), previousStateSnapshot]);
      setGameState(res.state);

      const isMute = isSfxMuted();
      if (res.died) {
        playEngineSound('break', isMute);
      } else if (res.state.isClear) {
        playEngineSound('coin', isMute);
      } else if (res.fruitEaten) {
        playEngineSound('match', isMute);
      } else {
        playEngineSound('fall', isMute);
      }
    },
    [gameState]
  );

  // Switch Active Bird
  const switchActiveBird = useCallback((targetId?: string) => {
    setGameState((prev) => {
      const nextId = targetId || getNextActiveBirdId(prev);
      if (nextId === prev.activeBirdId) return prev;
      playEngineSound('select', isSfxMuted());
      return { ...prev, activeBirdId: nextId };
    });
  }, []);

  // Undo Move
  const undo = useCallback(() => {
    if (history.length === 0) return;
    const previousState = history[history.length - 1];
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setGameState(previousState);
    playEngineSound('select', isSfxMuted());
  }, [history]);

  // Set Custom Level (from Editor)
  const setLevelFromEditor = useCallback((levelData: SnakebirdLevelData) => {
    setCurrentLevel(levelData);
    setGameState(createInitialState(levelData));
    setHistory([]);
  }, []);

  return {
    levelIndex,
    setLevelIndex,
    allLevels,
    setAllLevels,
    editorLevels,
    setEditorLevels,
    currentLevel,
    setCurrentLevel,
    gameState,
    setGameState,
    history,
    canUndo: history.length > 0,
    muted,
    setMuted,
    isPlaytestMode,
    setIsPlaytestMode,
    loadLevel,
    resetLevel,
    move,
    switchActiveBird,
    undo,
    setLevelFromEditor,
  };
}
