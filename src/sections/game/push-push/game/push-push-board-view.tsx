'use client';

import React, { useRef, useState, useEffect } from 'react';

import {
  CELL_VOID,
  CELL_WALL,
  CELL_FLOOR,
  CELL_TARGET,
  CELL_BOX,
  CELL_BOX_ON_TARGET,
  CELL_PLAYER,
  CELL_PLAYER_ON_TARGET,
  type GameState,
  type Direction,
} from './push-push-types';

interface PushPushBoardViewProps {
  gameState: GameState;
  onMove?: (dir: Direction) => void;
}

export function PushPushBoardView({ gameState, onMove }: PushPushBoardViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tileSize, setTileSize] = useState<number>(44);

  const { grid, playerPos, playerFacing } = gameState;
  const height = grid.length;
  const width = grid[0]?.length || 0;

  // Responsive tile size calculation based on viewport container
  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current || width === 0 || height === 0) return;
      const { clientWidth, clientHeight } = containerRef.current;
      const availableW = clientWidth - 24;
      const availableH = clientHeight - 24;

      const sizeByW = Math.floor(availableW / width);
      const sizeByH = Math.floor(availableH / height);
      const calculated = Math.max(28, Math.min(sizeByW, sizeByH, 68));

      setTileSize(calculated);
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [width, height]);

  // Swipe / touch gesture support on the board
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !onMove) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const MIN_SWIPE = 20;

    if (Math.max(absX, absY) < MIN_SWIPE) return;

    if (absX > absY) {
      onMove(dx > 0 ? 'right' : 'left');
    } else {
      onMove(dy > 0 ? 'down' : 'up');
    }
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="w-full h-full min-h-0 flex items-center justify-center p-2 relative overflow-hidden select-none"
    >
      <div
        className="relative rounded-2xl shadow-2xl border-4 border-amber-900/80 bg-amber-950/60 p-2 backdrop-blur-md transition-all duration-150"
        style={{
          width: `${width * tileSize + 16}px`,
          height: `${height * tileSize + 16}px`,
        }}
      >
        {/* Grid Container */}
        <div
          className="grid relative"
          style={{
            gridTemplateColumns: `repeat(${width}, ${tileSize}px)`,
            gridTemplateRows: `repeat(${height}, ${tileSize}px)`,
            width: `${width * tileSize}px`,
            height: `${height * tileSize}px`,
          }}
        >
          {grid.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`cell-${x}-${y}`}
                className="relative flex items-center justify-center"
                style={{
                  width: `${tileSize}px`,
                  height: `${tileSize}px`,
                }}
              >
                {renderCell(cell, tileSize, x, y, playerFacing)}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function renderCell(cell: number, size: number, x: number, y: number, playerFacing: Direction) {
  if (cell === CELL_VOID) {
    return <div className="w-full h-full opacity-0" />;
  }

  // Base floor for playable cells
  const isFloorCell =
    cell === CELL_FLOOR ||
    cell === CELL_TARGET ||
    cell === CELL_BOX ||
    cell === CELL_BOX_ON_TARGET ||
    cell === CELL_PLAYER ||
    cell === CELL_PLAYER_ON_TARGET;

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      {/* Floor Tile */}
      {isFloorCell && (
        <div
          className={`absolute inset-0.5 rounded-lg border border-amber-800/30 ${
            (x + y) % 2 === 0 ? 'bg-[#473022]' : 'bg-[#3b271b]'
          }`}
        />
      )}

      {/* Wall Tile */}
      {cell === CELL_WALL && (
        <div className="absolute inset-0.5 rounded-lg bg-gradient-to-br from-amber-700 via-amber-800 to-amber-950 border-2 border-amber-500/60 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),0_4px_8px_rgba(0,0,0,0.6)] flex items-center justify-center">
          {/* Brick Texture Lines */}
          <div className="w-full h-full p-1 flex flex-col justify-between opacity-30">
            <div className="w-full h-0.5 bg-black/50" />
            <div className="w-1/2 h-0.5 bg-black/50 ml-auto" />
            <div className="w-full h-0.5 bg-black/50" />
          </div>
        </div>
      )}

      {/* Target Marker (Under floor when target) */}
      {(cell === CELL_TARGET || cell === CELL_BOX_ON_TARGET || cell === CELL_PLAYER_ON_TARGET) && (
        <div className="absolute inset-1.5 rounded-full border-2 border-dashed border-amber-300/80 bg-amber-400/20 flex items-center justify-center animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.3)]">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-300 shadow-[0_0_8px_#fde047]" />
        </div>
      )}

      {/* Box */}
      {cell === CELL_BOX && <BoxSprite isSatisfied={false} size={size} />}

      {/* Box on Target (Satisfied with Gold Glow) */}
      {cell === CELL_BOX_ON_TARGET && <BoxSprite isSatisfied size={size} />}

      {/* Player Character */}
      {(cell === CELL_PLAYER || cell === CELL_PLAYER_ON_TARGET) && (
        <PlayerSprite facing={playerFacing} size={size} />
      )}
    </div>
  );
}

function BoxSprite({ isSatisfied, size }: { isSatisfied: boolean; size: number }) {
  const iconSize = Math.max(16, Math.floor(size * 0.72));

  return (
    <div
      className={`relative rounded-xl flex items-center justify-center transition-all duration-200 z-10 ${
        isSatisfied
          ? 'bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 border-2 border-yellow-100 shadow-[0_0_16px_rgba(250,204,21,0.9)] scale-95 animate-bounce-short'
          : 'bg-gradient-to-br from-amber-600 via-orange-700 to-amber-900 border-2 border-amber-400/80 shadow-[0_4px_10px_rgba(0,0,0,0.5)]'
      }`}
      style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
    >
      {/* Box details */}
      <div className="relative flex items-center justify-center w-full h-full p-1">
        {isSatisfied ? (
          <span className="text-amber-950 font-black text-xs sm:text-sm drop-shadow-sm select-none">
            ⭐
          </span>
        ) : (
          <div className="w-full h-full border border-amber-300/40 rounded flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-amber-400/60" />
          </div>
        )}
      </div>
    </div>
  );
}

function PlayerSprite({ facing, size }: { facing: Direction; size: number }) {
  const charSize = Math.max(20, Math.floor(size * 0.84));

  // Eye position based on direction
  const eyeOffset = {
    up: '-translate-y-1',
    down: 'translate-y-1',
    left: '-translate-x-1.5',
    right: 'translate-x-1.5',
  }[facing];

  return (
    <div
      className="relative flex items-center justify-center z-20 transition-transform duration-100 animate-wiggle-subtle"
      style={{ width: `${charSize}px`, height: `${charSize}px` }}
    >
      {/* Mascot Body (Cute Warehouse Keeper / Strawberry Hero) */}
      <div className="w-full h-full rounded-2xl bg-gradient-to-br from-rose-500 via-red-500 to-rose-700 border-2 border-white shadow-[0_4px_12px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Hard Hat / Head Accent */}
        <div className="absolute top-0 inset-x-0 h-2 bg-amber-300 border-b border-amber-400" />

        {/* Eyes with directional look */}
        <div className={`flex items-center gap-1.5 transition-transform ${eyeOffset}`}>
          <div className="w-2 h-2.5 bg-white rounded-full flex items-center justify-center relative shadow-sm">
            <div
              className={`w-1 h-1.5 bg-slate-950 rounded-full transition-transform ${
                facing === 'left'
                  ? '-translate-x-0.5'
                  : facing === 'right'
                    ? 'translate-x-0.5'
                    : facing === 'up'
                      ? '-translate-y-0.5'
                      : 'translate-y-0.5'
              }`}
            />
          </div>
          <div className="w-2 h-2.5 bg-white rounded-full flex items-center justify-center relative shadow-sm">
            <div
              className={`w-1 h-1.5 bg-slate-950 rounded-full transition-transform ${
                facing === 'left'
                  ? '-translate-x-0.5'
                  : facing === 'right'
                    ? 'translate-x-0.5'
                    : facing === 'up'
                      ? '-translate-y-0.5'
                      : 'translate-y-0.5'
              }`}
            />
          </div>
        </div>

        {/* Cute blush cheeks */}
        <div className="flex justify-between w-4/5 px-0.5 mt-0.5">
          <div className="w-1.5 h-1 bg-pink-300/80 rounded-full" />
          <div className="w-1.5 h-1 bg-pink-300/80 rounded-full" />
        </div>
      </div>
    </div>
  );
}
