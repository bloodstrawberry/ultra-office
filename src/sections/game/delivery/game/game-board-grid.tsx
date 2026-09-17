"use client";

import React, { useRef, useMemo } from "react";
import BlockRenderer, {
  BLOCK_NONE,
  BLOCK_EMPTY,
  BLOCK_STRAWBERRY,
  STAGE_BLOCK_SIZE_PERCENT,
  STAGE_GRID_GAP_REM,
  SoilTileDark,
  SoilTileLight,
  isPortalBlock,
  isWormholeBlock,
} from "../object";
import { CellType, Position, Bullet as BulletType } from "./types";
import { MoveInfo } from "./game-engine";
import Bullet from "./game-bullet";
import DisappearBurst, { DisappearingEffectItem } from "./disappear-burst";
import IceBreakBurst, { IceBreakEffectItem } from "./ice-break-burst";
import Strawberry from "../object/strawberry";

export interface GameBoardGridProps {
  grid: CellType[][];
  cols: number;
  rows: number;
  stageMaxWidth: string;
  activeEditor: boolean;
  playTestMode: boolean;
  cursor: Position;
  lastMoveInfo?: MoveInfo | null;
  isSliding?: boolean;
  grabbed: boolean;
  isCursorVisible?: boolean;
  isProcessing?: boolean;
  flashingBlocks: Record<string, CellType | boolean>;
  firedOnce?: Record<string, boolean>;
  bullets: BulletType[];
  disappearingEffects: DisappearingEffectItem[];
  iceBreakEffects: IceBreakEffectItem[];
  hoveredRow: number | null;
  hoveredCol: number | null;
  handleMouseDown: (e: React.MouseEvent, x: number, y: number) => void;
  handleMouseEnter: (x: number, y: number) => void;
  handleCellClick: (x: number, y: number) => void;
  onSwipeMove?: (direction: "up" | "down" | "left" | "right") => void;
}

export function GameBoardGrid({
  grid,
  cols,
  rows: _rows,
  stageMaxWidth,
  activeEditor,
  playTestMode,
  cursor,
  lastMoveInfo,
  isSliding = false,
  grabbed: _grabbed,
  isCursorVisible: _isCursorVisible = false,
  isProcessing: _isProcessing = false,
  flashingBlocks,
  firedOnce,
  bullets,
  disappearingEffects,
  iceBreakEffects,
  hoveredRow,
  hoveredCol,
  handleMouseDown,
  handleMouseEnter,
  handleCellClick,
  onSwipeMove,
}: GameBoardGridProps) {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (activeEditor) return;
    const touch = e.touches[0];
    if (touch) {
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (activeEditor || !touchStartRef.current) return;
    const touch = e.changedTouches[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    const minDistance = 20;
    if (Math.hypot(deltaX, deltaY) < minDistance) return;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      onSwipeMove?.(deltaX > 0 ? "right" : "left");
    } else {
      onSwipeMove?.(deltaY > 0 ? "down" : "up");
    }
  };

  const isPlayMode = !activeEditor || playTestMode;
  const rowsCount = grid.length || 8;

  const isHorizontalMove =
    lastMoveInfo?.direction === "left" || lastMoveInfo?.direction === "right";

  const speedTrail = useMemo(() => {
    if (!isSliding || !lastMoveInfo || lastMoveInfo.path.length <= 1) return [];
    return lastMoveInfo.path.slice(0, -1);
  }, [isSliding, lastMoveInfo]);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative flex-1 flex justify-center w-full min-h-0 select-none touch-none"
    >
      {/* Road Grid background layer */}
      <div className="relative w-full flex justify-center">
        <div
          className="grid w-full pointer-events-none drop-shadow-md rounded-2xl overflow-hidden"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            width: "100%",
            maxWidth: stageMaxWidth,
            gap: `${STAGE_GRID_GAP_REM}rem`,
            margin: "0 auto",
          }}
        >
          {grid.map((row, y) =>
            row.map((cell, x) => {
              const isNone = cell === BLOCK_NONE;
              if (isNone) {
                return (
                  <div
                    key={`bg-${y}-${x}`}
                    className="w-full aspect-square overflow-visible relative flex items-center justify-center opacity-0 pointer-events-none"
                  />
                );
              }

              const borderTop =
                y === 0 ||
                grid[y - 1]?.[x] === BLOCK_NONE ||
                grid[y - 1]?.[x] === undefined;
              const borderBottom =
                y === grid.length - 1 ||
                grid[y + 1]?.[x] === BLOCK_NONE ||
                grid[y + 1]?.[x] === undefined;
              const borderLeft =
                x === 0 ||
                grid[y]?.[x - 1] === BLOCK_NONE ||
                grid[y]?.[x - 1] === undefined;
              const borderRight =
                x === row.length - 1 ||
                grid[y]?.[x + 1] === BLOCK_NONE ||
                grid[y]?.[x + 1] === undefined;

              const TileComponent =
                (x + y) % 2 === 0 ? SoilTileDark : SoilTileLight;

              return (
                <div
                  key={`bg-${y}-${x}`}
                  className="w-full aspect-square overflow-visible relative flex items-center justify-center"
                >
                  <TileComponent
                    borderTop={borderTop}
                    borderBottom={borderBottom}
                    borderLeft={borderLeft}
                    borderRight={borderRight}
                  />
                </div>
              );
            }),
          )}
        </div>
      </div>

      {/* Interactive game objects layer */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="grid absolute inset-0 z-10 w-full justify-center animate-fade-in overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          width: "100%",
          maxWidth: stageMaxWidth,
          gap: `${STAGE_GRID_GAP_REM}rem`,
          margin: "0 auto",
        }}
      >
        {grid.map((row, y) =>
          row.map((cell, x) => {
            const isHighlighted = hoveredRow === y || hoveredCol === x;

            return (
              <div
                key={`${y}-${x}`}
                data-tutorial-cell={`${y}-${x}`}
                onMouseDown={(e) => handleMouseDown(e, x, y)}
                onMouseEnter={() => handleMouseEnter(x, y)}
                onClick={() => handleCellClick(x, y)}
                onContextMenu={(e) => {
                  if (activeEditor && !playTestMode) {
                    e.preventDefault();
                  }
                }}
                className={`w-full aspect-square relative flex items-center justify-center transition-all cursor-pointer overflow-visible select-none ${
                  activeEditor
                    ? "hover:opacity-90 hover:shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                    : ""
                } ${isHighlighted ? "ring-2 ring-rose-500/80 z-20" : ""}`}
              >
                {/* Render overlay closing portal if it was just consumed */}
                {typeof flashingBlocks[`${y},${x}`] === "number" && (
                  <div className="absolute inset-0 z-20 pointer-events-none animate-portal-close flex items-center justify-center">
                    <div
                      style={{
                        width: `${STAGE_BLOCK_SIZE_PERCENT}%`,
                        height: `${STAGE_BLOCK_SIZE_PERCENT}%`,
                      }}
                    >
                      <BlockRenderer
                        id={flashingBlocks[`${y},${x}`] as number}
                      />
                    </div>
                  </div>
                )}

                {/* Render grid cell elements (blocks inside the slot) */}
                {cell !== BLOCK_EMPTY && (
                  <div
                    className={`transform transition-transform relative z-10 ${
                      flashingBlocks[`${y},${x}`] === true
                        ? isPortalBlock(cell) || isWormholeBlock(cell)
                          ? "animate-portal-close pointer-events-none"
                          : "animate-match-flash pointer-events-none"
                        : ""
                    }`}
                    style={{
                      width: `${STAGE_BLOCK_SIZE_PERCENT}%`,
                      height: `${STAGE_BLOCK_SIZE_PERCENT}%`,
                    }}
                  >
                    {cell === BLOCK_NONE ? (
                      activeEditor && !playTestMode ? (
                        <BlockRenderer id={cell} />
                      ) : null
                    ) : (
                      <BlockRenderer
                        id={cell}
                        x={x}
                        y={y}
                        grid={grid}
                        firedOnce={firedOnce}
                      />
                    )}
                  </div>
                )}

                {/* Render disappearing effect burst if cell is disappearing */}
                {disappearingEffects.some((e) => e.x === x && e.y === y) && (
                  <DisappearBurst key={`burst-${y}-${x}`} />
                )}

                {/* Render ice-breaking shatter effect */}
                {iceBreakEffects
                  .filter((e) => e.x === x && e.y === y)
                  .map((e) => (
                    <IceBreakBurst key={e.id} />
                  ))}
              </div>
            );
          }),
        )}

        {/* Speed Trail Afterimages (택배차 질주 잔상) */}
        {isPlayMode &&
          isSliding &&
          speedTrail.map((pt, idx) => (
            <div
              key={`trail-${pt.x}-${pt.y}-${idx}`}
              className="absolute pointer-events-none transition-opacity duration-200 ease-out z-20 flex items-center justify-center"
              style={{
                width: `${100 / cols}%`,
                height: `${100 / rowsCount}%`,
                left: `${(pt.x / cols) * 100}%`,
                top: `${(pt.y / rowsCount) * 100}%`,
                opacity: 0.3 + 0.4 * ((idx + 1) / speedTrail.length),
              }}
            >
              <div
                className="relative flex items-center justify-center scale-90 blur-[0.5px]"
                style={{
                  width: `${STAGE_BLOCK_SIZE_PERCENT}%`,
                  height: `${STAGE_BLOCK_SIZE_PERCENT}%`,
                }}
              >
                {/* 바퀴 연기 & 스피드 부스터 라이트 */}
                <div className="absolute inset-0 bg-sky-400/40 rounded-2xl blur-sm" />
                <Strawberry
                  isFrozen={false}
                  direction={lastMoveInfo?.direction || "left"}
                />
              </div>
            </div>
          ))}

        {/* Persistent Delivery Truck Character Overlay */}
        {isPlayMode && (
          <div
            className={`absolute pointer-events-none z-30 flex items-center justify-center ${
              isSliding
                ? "transition-all duration-150 ease-[cubic-bezier(0.15,0.85,0.35,1)]"
                : "transition-none"
            }`}
            style={{
              width: `${100 / cols}%`,
              height: `${100 / rowsCount}%`,
              left: `${(cursor.x / cols) * 100}%`,
              top: `${(cursor.y / rowsCount) * 100}%`,
            }}
          >
            <div
              className={`relative flex items-center justify-center transition-transform duration-100 ease-out ${
                isSliding
                  ? isHorizontalMove
                    ? "scale-x-115 scale-y-90"
                    : "scale-y-115 scale-x-90"
                  : "scale-100"
              }`}
              style={{
                width: `${STAGE_BLOCK_SIZE_PERCENT}%`,
                height: `${STAGE_BLOCK_SIZE_PERCENT}%`,
              }}
            >
              {/* 택배차 부스터 엔진 글로우 */}
              <div
                className={`absolute -inset-1 rounded-2xl blur-md transition-all duration-150 ${
                  isSliding
                    ? "bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-400 opacity-100 scale-110"
                    : "bg-sky-400/30 opacity-60"
                }`}
              />

              {/* 스피드 이동 시 반짝이는 바람 효과 */}
              {isSliding && (
                <div className="absolute -inset-2 border-2 border-sky-300/80 rounded-2xl animate-ping pointer-events-none" />
              )}

              <Strawberry
                isFrozen={false}
                direction={lastMoveInfo?.direction || "left"}
              />
            </div>
          </div>
        )}

        {/* Render flying bullets */}
        {bullets.map((bullet) => (
          <Bullet
            key={bullet.id}
            bullet={bullet}
            W={grid[0]?.length || 8}
            H={grid.length || 8}
          />
        ))}
      </div>
    </div>
  );
}

export default GameBoardGrid;
