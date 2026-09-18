'use client';

import type { CellType, Position } from './types';

import { useRef, useState, useEffect, useCallback } from 'react';

import { copyGrid } from './types';

export interface UndoSnapshot {
  grid: CellType[][];
  cursor: Position;
  grabbed?: boolean;
  autoWallDirections?: Record<string, number>;
  firedOnce?: Record<string, boolean>;
  turnsLeft?: number;
}

export class UndoHistoryManager {
  private snapshots: UndoSnapshot[] = [];
  private maxCapacity: number;

  constructor(maxCapacity = 50) {
    this.maxCapacity = maxCapacity;
  }

  public push(snapshot: UndoSnapshot): void {
    const cloned: UndoSnapshot = {
      grid: copyGrid(snapshot.grid),
      cursor: { ...snapshot.cursor },
      grabbed: snapshot.grabbed ?? false,
      autoWallDirections: snapshot.autoWallDirections
        ? { ...snapshot.autoWallDirections }
        : undefined,
      firedOnce: snapshot.firedOnce ? { ...snapshot.firedOnce } : undefined,
      turnsLeft: snapshot.turnsLeft,
    };
    this.snapshots.push(cloned);
    if (this.snapshots.length > this.maxCapacity) {
      this.snapshots.shift();
    }
  }

  public pop(): UndoSnapshot | undefined {
    return this.snapshots.pop();
  }

  public clear(): void {
    this.snapshots = [];
  }

  public get size(): number {
    return this.snapshots.length;
  }

  public get canUndo(): boolean {
    return this.snapshots.length > 0;
  }
}

export function useGameUndo(maxCapacity = 50) {
  const managerRef = useRef(new UndoHistoryManager(maxCapacity));
  const [canUndo, setCanUndo] = useState(false);
  const [historySize, setHistorySize] = useState(0);

  const pushSnapshot = useCallback((snapshot: UndoSnapshot) => {
    managerRef.current.push(snapshot);
    setCanUndo(managerRef.current.canUndo);
    setHistorySize(managerRef.current.size);
  }, []);

  const popSnapshot = useCallback((): UndoSnapshot | undefined => {
    const popped = managerRef.current.pop();
    setCanUndo(managerRef.current.canUndo);
    setHistorySize(managerRef.current.size);
    return popped;
  }, []);

  const clearUndoHistory = useCallback(() => {
    managerRef.current.clear();
    setCanUndo(false);
    setHistorySize(0);
  }, []);

  return {
    pushSnapshot,
    popSnapshot,
    clearUndoHistory,
    canUndo,
    historySize,
  };
}

export interface UseUndoHotkeyOptions {
  enabled: boolean;
  onUndo: () => void;
}

export function useUndoHotkey({ enabled, onUndo }: UseUndoHotkeyOptions) {
  const onUndoRef = useRef(onUndo);
  useEffect(() => {
    onUndoRef.current = onUndo;
  }, [onUndo]);

  useEffect(() => {
    if (!enabled) return undefined;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.isContentEditable)
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        onUndoRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);
}
