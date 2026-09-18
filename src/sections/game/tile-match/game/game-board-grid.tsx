'use client';

import type { IceBreakEffectItem } from './ice-break-burst';
import type { DisappearingEffectItem } from './disappear-burst';
import type { CellType, Position, Bullet as BulletType } from './types';

import React from 'react';

import Bullet from './game-bullet';
import IceBreakBurst from './ice-break-burst';
import DisappearBurst from './disappear-burst';
import { ShisenShoLine } from './shisen-sho-line';
import BlockRenderer, {
  PathTile,
  BLOCK_NONE,
  BLOCK_EMPTY,
  SoilTileDark,
  SoilTileLight,
  isPortalBlock,
  isWormholeBlock,
  STAGE_GRID_GAP_REM,
  getBlockProperties,
  STAGE_BLOCK_SIZE_PERCENT,
} from '../object';

export interface GameBoardGridProps {
  grid: CellType[][];
  statusMap?: number[][];
  chickenDirections?: Record<string, 'up' | 'down' | 'left' | 'right'>;
  cols: number;
  rows: number;
  stageMaxWidth: string;
  activeEditor: boolean;
  playTestMode: boolean;
  cursor: Position;
  grabbed: boolean;
  isCursorVisible?: boolean;
  isProcessing?: boolean;
  flashingBlocks: Record<string, CellType | boolean>;
  firedOnce?: Record<string, boolean>;
  bullets: BulletType[];
  shisenShoPath?: Position[] | null;
  disappearingEffects: DisappearingEffectItem[];
  iceBreakEffects: IceBreakEffectItem[];
  hoveredRow: number | null;
  hoveredCol: number | null;
  handleMouseDown: (e: React.MouseEvent, x: number, y: number) => void;
  handleMouseEnter: (x: number, y: number) => void;
  handleCellClick: (x: number, y: number) => void;
}

export function GameBoardGrid({
  grid,
  statusMap,
  chickenDirections,
  cols,
  rows: _rows,
  stageMaxWidth,
  activeEditor,
  playTestMode,
  cursor,
  grabbed,
  isCursorVisible = false,
  isProcessing = false,
  flashingBlocks,
  firedOnce,
  bullets,
  shisenShoPath,
  disappearingEffects,
  iceBreakEffects,
  hoveredRow,
  hoveredCol,
  handleMouseDown,
  handleMouseEnter,
  handleCellClick,
}: GameBoardGridProps) {
  return (
    <div className="relative flex-1 flex justify-center w-full min-h-0">
      {/* SVG filter for organic bumpy farm edges */}
      <svg className="absolute" width="0" height="0" aria-hidden="true">
        <defs>
          <filter id="farmEdge" x="-4%" y="-4%" width="108%" height="108%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.04"
              numOctaves="4"
              seed="7"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="8"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Soil tile background layer WITH bumpy edge filter */}
      <div className="relative w-full flex justify-center" style={{ filter: 'url(#farmEdge)' }}>
        <div
          className="grid w-full pointer-events-none"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            width: '100%',
            maxWidth: stageMaxWidth,
            gap: `${STAGE_GRID_GAP_REM}rem`,
            margin: '0 auto',
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
                y === 0 || grid[y - 1]?.[x] === BLOCK_NONE || grid[y - 1]?.[x] === undefined;
              const borderBottom =
                y === grid.length - 1 ||
                grid[y + 1]?.[x] === BLOCK_NONE ||
                grid[y + 1]?.[x] === undefined;
              const borderLeft =
                x === 0 || grid[y]?.[x - 1] === BLOCK_NONE || grid[y]?.[x - 1] === undefined;
              const borderRight =
                x === row.length - 1 ||
                grid[y]?.[x + 1] === BLOCK_NONE ||
                grid[y]?.[x + 1] === undefined;

              const TileComponent = (x + y) % 2 === 0 ? SoilTileDark : SoilTileLight;

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
            })
          )}
        </div>
      </div>

      {/* Path tiles layer (statusMap) ABOVE soil tiles, BELOW blocks */}
      {statusMap && (
        <div
          className="grid absolute inset-0 z-5 w-full justify-center pointer-events-none overflow-hidden"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            width: '100%',
            maxWidth: stageMaxWidth,
            gap: `${STAGE_GRID_GAP_REM}rem`,
            margin: '0 auto',
          }}
        >
          {statusMap.map((row, y) =>
            row.map((pathType, x) => (
              <div
                key={`path-${y}-${x}`}
                className="w-full aspect-square relative flex items-center justify-center pointer-events-none"
              >
                {pathType > 0 && <PathTile type={pathType} />}
              </div>
            ))
          )}
        </div>
      )}

      {/* Interactive game objects layer WITHOUT filter (overlaid on top) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="grid absolute inset-0 z-10 w-full justify-center animate-fade-in overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          width: '100%',
          maxWidth: stageMaxWidth,
          gap: `${STAGE_GRID_GAP_REM}rem`,
          margin: '0 auto',
        }}
      >
        {grid.map((row, y) =>
          row.map((cell, x) => {
            const isCursor =
              (isCursorVisible || grabbed) && cursor.x === x && cursor.y === y && !activeEditor;
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
                  activeEditor ? 'hover:opacity-90 hover:shadow-[0_0_8px_rgba(34,197,94,0.4)]' : ''
                } ${isHighlighted ? 'ring-2 ring-rose-500/80 z-20' : ''}`}
              >
                {/* Render overlay closing portal if it was just consumed */}
                {typeof flashingBlocks[`${y},${x}`] === 'number' && (
                  <div className="absolute inset-0 z-20 pointer-events-none animate-portal-close flex items-center justify-center">
                    <div
                      style={{
                        width: `${STAGE_BLOCK_SIZE_PERCENT}%`,
                        height: `${STAGE_BLOCK_SIZE_PERCENT}%`,
                      }}
                    >
                      <BlockRenderer id={flashingBlocks[`${y},${x}`] as number} />
                    </div>
                  </div>
                )}

                {/* Render grid cell elements (blocks inside the slot) */}
                {cell !== BLOCK_EMPTY && (
                  <div
                    className={`transform active:scale-95 transition-transform relative z-10 ${
                      flashingBlocks[`${y},${x}`] === true
                        ? isPortalBlock(cell) || isWormholeBlock(cell)
                          ? 'animate-portal-close pointer-events-none'
                          : 'animate-match-flash pointer-events-none'
                        : ''
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
                        statusMap={statusMap}
                        firedOnce={firedOnce}
                        chickenDir={chickenDirections?.[`${y},${x}`]}
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

                {/* Render Cursor Selector outline */}
                {isCursor &&
                  (() => {
                    const cellAtCursor = grid[cursor.y]?.[cursor.x];
                    const isUnsupported =
                      cellAtCursor !== undefined &&
                      getBlockProperties(cellAtCursor, grid)?.canFall &&
                      cursor.y < grid.length - 1 &&
                      grid[cursor.y + 1]?.[cursor.x] === BLOCK_EMPTY;
                    const isUnmovable = isProcessing || isUnsupported;

                    const colorClasses = isUnmovable
                      ? 'border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.9)]'
                      : grabbed
                        ? 'border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.9)] animate-bounce'
                        : 'border-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.7)]';

                    const anchorColor = isUnmovable
                      ? 'bg-rose-500'
                      : grabbed
                        ? 'bg-amber-500'
                        : 'bg-emerald-600';

                    return (
                      <div
                        className={`absolute inset-0 border-2 rounded-[22%] pointer-events-none z-20 animate-pulse ${colorClasses}`}
                      >
                        <span
                          className={`absolute top-0 left-0 w-1.5 h-1.5 rounded-sm ${anchorColor}`}
                        />
                        <span
                          className={`absolute top-0 right-0 w-1.5 h-1.5 rounded-sm ${anchorColor}`}
                        />
                        <span
                          className={`absolute bottom-0 left-0 w-1.5 h-1.5 rounded-sm ${anchorColor}`}
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-1.5 h-1.5 rounded-sm ${anchorColor}`}
                        />
                      </div>
                    );
                  })()}
              </div>
            );
          })
        )}

        {/* Render Shisen-Sho 2-turn connecting line */}
        <ShisenShoLine path={shisenShoPath ?? null} cols={cols} rows={_rows} />

        {/* Render flying bullets */}
        {bullets.map((bullet) => (
          <Bullet key={bullet.id} bullet={bullet} W={grid[0]?.length || 8} H={grid.length || 8} />
        ))}
      </div>
    </div>
  );
}

export default GameBoardGrid;
