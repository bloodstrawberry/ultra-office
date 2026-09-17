"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { TouchColor, getShuffledTouchColors } from "../utils/colors";
import { playCuteTouchSound } from "../utils/sound";

export interface TouchPoint {
  id: number;
  x: number;
  y: number;
  colorIndex: number;
  color: TouchColor;
}

export function useMultiTouch(gameState: string) {
  const [touchPoints, setTouchPoints] = useState<TouchPoint[]>([]);
  const [mousePoint, setMousePoint] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [isMouseDown, setIsMouseDown] = useState(false);

  // Track previously active touch IDs to detect new finger touches
  const prevTouchIdsRef = useRef<Set<number>>(new Set());

  // Maintain randomized palette per game session
  const paletteRef = useRef<TouchColor[]>(getShuffledTouchColors());
  const touchColorMapRef = useRef<Map<number, TouchColor>>(new Map());

  // Re-shuffle color palette for a brand new session
  const shufflePalette = useCallback(() => {
    paletteRef.current = getShuffledTouchColors();
    touchColorMapRef.current.clear();
  }, []);

  // Lock body scrolling during touch games
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const getOrAssignColor = useCallback(
    (id: number): { colorIndex: number; color: TouchColor } => {
      let assigned = touchColorMapRef.current.get(id);
      if (!assigned) {
        const palette = paletteRef.current;
        const index = touchColorMapRef.current.size % palette.length;
        assigned = palette[index];
        touchColorMapRef.current.set(id, assigned);
      }
      const colorIndex = paletteRef.current.indexOf(assigned);
      return { colorIndex, color: assigned };
    },
    [],
  );

  const handleTouchChange = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const touches = Array.from(e.touches);
      const currentTouchIds = new Set<number>();

      // When all fingers are lifted in idle state, refresh palette shuffle
      if (touches.length === 0 && gameState === "idle") {
        shufflePalette();
      }

      touches.forEach((touch) => {
        currentTouchIds.add(touch.identifier);
        // Play cute sound for newly registered touch points
        if (!prevTouchIdsRef.current.has(touch.identifier)) {
          const { colorIndex } = getOrAssignColor(touch.identifier);
          playCuteTouchSound(colorIndex);
        }
      });

      prevTouchIdsRef.current = currentTouchIds;

      const points: TouchPoint[] = touches.map((touch) => {
        const { colorIndex, color } = getOrAssignColor(touch.identifier);
        return {
          id: touch.identifier,
          x: touch.clientX,
          y: touch.clientY,
          colorIndex,
          color,
        };
      });

      setTouchPoints(points);
    },
    [gameState, getOrAssignColor, shufflePalette],
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDown) {
      const { colorIndex } = getOrAssignColor(999);
      playCuteTouchSound(colorIndex);
    }
    setIsMouseDown(true);
    setMousePoint({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMouseDown) {
      setMousePoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
    setMousePoint(null);
  };

  const activePoints: TouchPoint[] =
    touchPoints.length > 0
      ? touchPoints
      : mousePoint
        ? [
            {
              id: 999,
              x: mousePoint.x,
              y: mousePoint.y,
              // eslint-disable-next-line react-hooks/refs
              ...getOrAssignColor(999),
            },
          ]
        : [];

  return {
    touchPoints,
    setTouchPoints,
    mousePoint,
    activePoints,
    handleTouchChange,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    shufflePalette,
  };
}
