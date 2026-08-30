import type { Step, AlgorithmId, AlgorithmDefinition } from '../lib/algorithms/types';

import { create } from 'zustand';

import { getVisualizerPrefsSync, setVisualizerPrefsSync } from '../lib/storage';
import { ALGORITHMS, DEFAULT_BST_VALUES, DEFAULT_SORT_ARRAY } from '../lib/algorithms/registry';
import {
  type GridConfig,
  generateRandomWalls,
  generateMazeRecursive,
} from '../lib/algorithms/graph/gridUtils';
import {
  playSwapSound,
  playFoundSound,
  playPivotSound,
  playVisitSound,
  playCompareSound,
  playSuccessFanfare,
  playButtonClickSound,
} from '../lib/sound';

export interface VisualizerState {
  currentAlgoId: AlgorithmId;
  currentAlgo: AlgorithmDefinition;
  steps: Step[];
  currentStepIndex: number;
  isPlaying: boolean;
  speed: number;
  soundEnabled: boolean;
  themeId: string;

  // Custom inputs for various categories
  customArray: number[];
  searchTarget: number;
  twoPointerTarget: number;
  customTreeValues: number[];

  // Grid Config
  gridRows: number;
  gridCols: number;
  gridStart: [number, number];
  gridTarget: [number, number];
  gridWalls: Set<string>;
  gridDrawMode: 'wall' | 'erase' | 'start' | 'target';

  // Actions
  setAlgorithm: (id: AlgorithmId) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  goToStep: (index: number) => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
  toggleSound: () => void;
  setThemeId: (themeId: string) => void;

  // Input actions
  setCustomArray: (arr: number[]) => void;
  setSearchTarget: (target: number) => void;
  setTwoPointerTarget: (target: number) => void;
  setCustomTreeValues: (values: number[]) => void;
  generateRandomArray: (size?: number) => void;
  generateReversedArray: (size?: number) => void;
  generateNearlySortedArray: (size?: number) => void;

  // Grid actions
  toggleGridWall: (row: number, col: number) => void;
  setGridStart: (row: number, col: number) => void;
  setGridTarget: (row: number, col: number) => void;
  clearGridWalls: () => void;
  generateRandomGridWalls: (density?: number) => void;
  generateRecursiveMaze: () => void;
  setGridDrawMode: (mode: 'wall' | 'erase' | 'start' | 'target') => void;

  // Initializer
  initFromStorage: () => void;
}

export const useVisualizerStore = create<VisualizerState>((set, get) => {
  const initialAlgoId: AlgorithmId = 'quickSort';
  const initialAlgo = ALGORITHMS[initialAlgoId] || ALGORITHMS.bubbleSort;
  const initialSteps = initialAlgo.generateSteps(DEFAULT_SORT_ARRAY);

  function triggerStepSound(step?: Step) {
    if (!step || !get().soundEnabled) return;
    switch (step.soundType) {
      case 'compare':
        playCompareSound(step.soundValue ?? 50, 100);
        break;
      case 'swap':
        playSwapSound();
        break;
      case 'pivot':
        playPivotSound();
        break;
      case 'found':
        playFoundSound();
        break;
      case 'visit':
        playVisitSound(step.soundValue ?? 0);
        break;
      case 'complete':
        playSuccessFanfare();
        break;
      case 'step':
      default:
        break;
    }
  }

  return {
    currentAlgoId: initialAlgoId,
    currentAlgo: initialAlgo,
    steps: initialSteps,
    currentStepIndex: 0,
    isPlaying: false,
    speed: 1,
    soundEnabled: true,
    themeId: 'light',

    customArray: [...DEFAULT_SORT_ARRAY],
    searchTarget: 56,
    twoPointerTarget: 101,
    customTreeValues: [...DEFAULT_BST_VALUES],

    gridRows: 15,
    gridCols: 25,
    gridStart: [7, 3],
    gridTarget: [7, 21],
    gridWalls: new Set<string>(),
    gridDrawMode: 'wall',

    initFromStorage: () => {
      const prefs = getVisualizerPrefsSync();
      set({
        speed: prefs.speed || 1,
        soundEnabled: prefs.soundEnabled ?? true,
        themeId: prefs.themeId || 'light',
      });
    },

    setThemeId: (themeId: string) => {
      set({ themeId });
      setVisualizerPrefsSync({ themeId });
    },

    setAlgorithm: (id: AlgorithmId) => {
      const algo = ALGORITHMS[id];
      if (!algo) return;

      const state = get();
      let steps: Step[] = [];

      if (algo.category === 'sorting') {
        steps = algo.generateSteps(state.customArray);
      } else if (algo.id === 'linearSearch' || algo.id === 'binarySearch') {
        steps = algo.generateSteps({
          array: state.customArray,
          target: state.searchTarget,
        });
      } else if (algo.id === 'twoPointer') {
        steps = algo.generateSteps({
          array: state.customArray,
          targetSum: state.twoPointerTarget,
        });
      } else if (algo.id === 'slidingWindow') {
        steps = algo.generateSteps({
          array: state.customArray,
          k: 3,
        });
      } else if (algo.category === 'tree') {
        steps = algo.generateSteps(state.customTreeValues);
      } else if (algo.category === 'graph') {
        const gridConfig: GridConfig = {
          rows: state.gridRows,
          cols: state.gridCols,
          start: state.gridStart,
          target: state.gridTarget,
          walls: state.gridWalls,
        };
        steps = algo.generateSteps(gridConfig);
      } else if (algo.defaultInput !== undefined) {
        steps = algo.generateSteps(algo.defaultInput);
      } else {
        steps = algo.generateSteps();
      }

      set({
        currentAlgoId: id,
        currentAlgo: algo,
        steps,
        currentStepIndex: 0,
        isPlaying: false,
      });

      // Update recent algorithms in storage
      const prefs = getVisualizerPrefsSync();
      const updatedRecent = [id, ...prefs.recentAlgorithms.filter((a) => a !== id)].slice(0, 8);
      setVisualizerPrefsSync({ recentAlgorithms: updatedRecent });
    },

    play: () => {
      set({ isPlaying: true });
    },

    pause: () => {
      set({ isPlaying: false });
    },

    togglePlay: () => {
      const { isPlaying, currentStepIndex, steps } = get();
      if (!isPlaying && currentStepIndex >= steps.length - 1) {
        // If at the end, restart from beginning
        set({ currentStepIndex: 0, isPlaying: true });
      } else {
        set({ isPlaying: !isPlaying });
      }
    },

    stepForward: () => {
      const { currentStepIndex, steps } = get();
      if (currentStepIndex < steps.length - 1) {
        const nextIdx = currentStepIndex + 1;
        set({ currentStepIndex: nextIdx });
        triggerStepSound(steps[nextIdx]);
      } else {
        set({ isPlaying: false });
      }
    },

    stepBackward: () => {
      const { currentStepIndex, steps } = get();
      if (currentStepIndex > 0) {
        const prevIdx = currentStepIndex - 1;
        set({ currentStepIndex: prevIdx, isPlaying: false });
        triggerStepSound(steps[prevIdx]);
      }
    },

    goToStep: (index: number) => {
      const { steps } = get();
      const clamped = Math.max(0, Math.min(steps.length - 1, index));
      set({ currentStepIndex: clamped });
      triggerStepSound(steps[clamped]);
    },

    reset: () => {
      set({ currentStepIndex: 0, isPlaying: false });
      playButtonClickSound();
    },

    setSpeed: (speed: number) => {
      set({ speed });
      setVisualizerPrefsSync({ speed });
    },

    toggleSound: () => {
      const next = !get().soundEnabled;
      set({ soundEnabled: next });
      setVisualizerPrefsSync({ soundEnabled: next });
      if (next) playButtonClickSound();
    },

    setCustomArray: (arr: number[]) => {
      set({ customArray: [...arr] });
      const { currentAlgoId, setAlgorithm } = get();
      setAlgorithm(currentAlgoId);
    },

    setSearchTarget: (target: number) => {
      set({ searchTarget: target });
      const { currentAlgoId, setAlgorithm } = get();
      setAlgorithm(currentAlgoId);
    },

    setTwoPointerTarget: (target: number) => {
      set({ twoPointerTarget: target });
      const { currentAlgoId, setAlgorithm } = get();
      setAlgorithm(currentAlgoId);
    },

    setCustomTreeValues: (values: number[]) => {
      set({ customTreeValues: [...values] });
      const { currentAlgoId, setAlgorithm } = get();
      setAlgorithm(currentAlgoId);
    },

    generateRandomArray: (size = 12) => {
      const arr = Array.from({ length: size }, () => Math.floor(Math.random() * 85) + 10);
      set({ customArray: arr });
      const { currentAlgoId, setAlgorithm } = get();
      setAlgorithm(currentAlgoId);
    },

    generateReversedArray: (size = 12) => {
      const step = Math.floor(90 / size);
      const arr = Array.from({ length: size }, (_, i) => 95 - i * step);
      set({ customArray: arr });
      const { currentAlgoId, setAlgorithm } = get();
      setAlgorithm(currentAlgoId);
    },

    generateNearlySortedArray: (size = 12) => {
      const step = Math.floor(80 / size);
      const arr = Array.from({ length: size }, (_, i) => 15 + i * step);
      if (arr.length > 4) {
        const temp = arr[2];
        arr[2] = arr[3];
        arr[3] = temp;
      }
      set({ customArray: arr });
      const { currentAlgoId, setAlgorithm } = get();
      setAlgorithm(currentAlgoId);
    },

    // Grid Actions
    toggleGridWall: (row: number, col: number) => {
      const { gridWalls, gridStart, gridTarget, gridDrawMode, currentAlgoId, setAlgorithm } = get();
      const coordKey = `${row},${col}`;

      if (gridDrawMode === 'start') {
        if (row === gridTarget[0] && col === gridTarget[1]) return;
        set({ gridStart: [row, col] });
      } else if (gridDrawMode === 'target') {
        if (row === gridStart[0] && col === gridStart[1]) return;
        set({ gridTarget: [row, col] });
      } else if (gridDrawMode === 'erase') {
        const nextWalls = new Set(gridWalls);
        nextWalls.delete(coordKey);
        set({ gridWalls: nextWalls });
      } else {
        // wall
        if (
          (row === gridStart[0] && col === gridStart[1]) ||
          (row === gridTarget[0] && col === gridTarget[1])
        ) {
          return;
        }
        const nextWalls = new Set(gridWalls);
        if (nextWalls.has(coordKey)) {
          nextWalls.delete(coordKey);
        } else {
          nextWalls.add(coordKey);
        }
        set({ gridWalls: nextWalls });
      }

      setAlgorithm(currentAlgoId);
    },

    setGridStart: (row: number, col: number) => {
      set({ gridStart: [row, col] });
      const { currentAlgoId, setAlgorithm } = get();
      setAlgorithm(currentAlgoId);
    },

    setGridTarget: (row: number, col: number) => {
      set({ gridTarget: [row, col] });
      const { currentAlgoId, setAlgorithm } = get();
      setAlgorithm(currentAlgoId);
    },

    clearGridWalls: () => {
      set({ gridWalls: new Set<string>() });
      const { currentAlgoId, setAlgorithm } = get();
      setAlgorithm(currentAlgoId);
    },

    generateRandomGridWalls: (density = 0.25) => {
      const { gridRows, gridCols, gridStart, gridTarget, currentAlgoId, setAlgorithm } = get();
      const walls = generateRandomWalls(gridRows, gridCols, gridStart, gridTarget, density);
      set({ gridWalls: walls });
      setAlgorithm(currentAlgoId);
    },

    generateRecursiveMaze: () => {
      const { gridRows, gridCols, gridStart, gridTarget, currentAlgoId, setAlgorithm } = get();
      const walls = generateMazeRecursive(gridRows, gridCols, gridStart, gridTarget);
      set({ gridWalls: walls });
      setAlgorithm(currentAlgoId);
    },

    setGridDrawMode: (mode: 'wall' | 'erase' | 'start' | 'target') => {
      set({ gridDrawMode: mode });
    },
  };
});
