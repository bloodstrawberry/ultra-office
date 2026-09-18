'use client';

import type { Position, Direction, SnakebirdGameState } from './snakebird-types';

import React, { useRef, useState, useEffect } from 'react';

import { SnakebirdWall } from '../object/snakebird-wall';
import { SnakebirdFruit } from '../object/snakebird-fruit';
import { SnakebirdSpike } from '../object/snakebird-spike';
import { SnakebirdPortal } from '../object/snakebird-portal';
import { SnakebirdRenderer } from '../object/snakebird-renderer';
import { isWall, getSpikeAt, getFruitAt } from './snakebird-physics';

export interface SnakebirdBoardViewProps {
  gameState: SnakebirdGameState;
  onMove: (dir: Direction) => void;
  onSelectBird: (birdId: string) => void;
  isEditor?: boolean;
  onCellClick?: (x: number, y: number) => void;
  onCellMouseDown?: (x: number, y: number, e: React.MouseEvent) => void;
  onCellMouseEnter?: (x: number, y: number) => void;
  brushPreviewCell?: Position | null;
}

export const SnakebirdBoardView: React.FC<SnakebirdBoardViewProps> = ({
  gameState,
  onMove,
  onSelectBird,
  isEditor = false,
  onCellClick,
  onCellMouseDown,
  onCellMouseEnter,
  brushPreviewCell,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState<{
    width: number;
    height: number;
    cellSize: number;
  }>({
    width: 360,
    height: 360,
    cellSize: 45,
  });

  const { width: gridW, height: gridH } = gameState;

  // Responsive board calculation
  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const availW = Math.max(280, rect.width - 24);
      const availH = Math.max(280, rect.height - 24);

      const cellW = availW / gridW;
      const cellH = availH / gridH;
      const maxCellSize = isEditor ? 48 : 56;
      const cellSize = Math.min(maxCellSize, Math.floor(Math.min(cellW, cellH)));

      setBoardSize({
        width: cellSize * gridW,
        height: cellSize * gridH,
        cellSize,
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [gridW, gridH, isEditor]);

  // Touch Swipe Handler for mobile
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isEditor) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isEditor || !touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const minSwipeDist = 20;

    if (Math.max(absDx, absDy) < minSwipeDist) return;

    if (absDx > absDy) {
      onMove(dx > 0 ? 'right' : 'left');
    } else {
      onMove(dy > 0 ? 'down' : 'up');
    }
  };

  const portalIsOpen = gameState.fruits.length === 0;

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center relative select-none p-2"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Game Board Container — authentic bright sky blue */}
      <div
        className="relative rounded-2xl overflow-visible"
        style={{
          width: `${boardSize.width}px`,
          height: `${boardSize.height}px`,
          backgroundColor: '#52AEF8',
          boxShadow: '0 6px 24px rgba(0,0,0,0.18)',
        }}
      >
        {/* Sky Background Atmosphere: Mountains + Big Puffy Clouds */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ borderRadius: '16px' }}
        >
          {/* Distant Mountains at Bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-[45%] pointer-events-none opacity-80">
            {/* Far Mountain Dome 1 */}
            <div
              className="absolute rounded-full"
              style={{
                width: '65%',
                height: '140%',
                bottom: '-40%',
                left: '-15%',
                backgroundColor: '#7BB8F8',
              }}
            />
            {/* Far Mountain Dome 2 */}
            <div
              className="absolute rounded-full"
              style={{
                width: '80%',
                height: '160%',
                bottom: '-50%',
                right: '-20%',
                backgroundColor: '#68A8F2',
              }}
            />
            {/* Near Mountain Dome 3 */}
            <div
              className="absolute rounded-full"
              style={{
                width: '55%',
                height: '120%',
                bottom: '-40%',
                left: '25%',
                backgroundColor: '#5298EA',
              }}
            />
          </div>

          {/* Big Cartoon Cloud 1 (Top-Left) */}
          <div className="absolute" style={{ top: '4%', left: '2%' }}>
            <div
              className="absolute rounded-full"
              style={{ width: 68, height: 32, top: 12, left: 0, backgroundColor: '#FFFFFF' }}
            />
            <div
              className="absolute rounded-full"
              style={{ width: 54, height: 44, top: 0, left: 14, backgroundColor: '#FFFFFF' }}
            />
            <div
              className="absolute rounded-full"
              style={{ width: 44, height: 32, top: 12, left: 44, backgroundColor: '#FFFFFF' }}
            />
          </div>

          {/* Big Cartoon Cloud 2 (Top-Right) */}
          <div className="absolute" style={{ top: '6%', right: '2%' }}>
            <div
              className="absolute rounded-full"
              style={{ width: 76, height: 34, top: 10, left: 0, backgroundColor: '#FFFFFF' }}
            />
            <div
              className="absolute rounded-full"
              style={{ width: 60, height: 48, top: -2, left: 18, backgroundColor: '#FFFFFF' }}
            />
            <div
              className="absolute rounded-full"
              style={{ width: 50, height: 32, top: 10, left: 52, backgroundColor: '#FFFFFF' }}
            />
          </div>
        </div>

        {/* 1. Grid Cells (Static Objects & Click Targets) */}
        {Array.from({ length: gridH }).map((_row, y) => (
          <div
            key={`row-${y}`}
            className="flex absolute left-0"
            style={{ top: `${y * boardSize.cellSize}px` }}
          >
            {Array.from({ length: gridW }).map((_col, x) => {
              const pos: Position = { x, y };
              const hasWall = isWall(gameState.walls, pos);
              const spike = getSpikeAt(gameState.spikes, pos);
              const fruit = getFruitAt(gameState.fruits, pos);
              const isPortal = gameState.portal.x === x && gameState.portal.y === y;
              const hasWallAbove = isWall(gameState.walls, { x, y: y - 1 });
              const isPreview =
                brushPreviewCell && brushPreviewCell.x === x && brushPreviewCell.y === y;

              return (
                <div
                  key={`cell-${x}-${y}`}
                  onClick={() => {
                    if (isEditor && onCellClick) {
                      onCellClick(x, y);
                    } else {
                      // Click on a bird to select it
                      const birdFound = gameState.birds.find(
                        (b) =>
                          !b.isExited && !b.isDead && b.segments.some((s) => s.x === x && s.y === y)
                      );
                      if (birdFound) {
                        onSelectBird(birdFound.id);
                      }
                    }
                  }}
                  onMouseDown={(e) => isEditor && onCellMouseDown && onCellMouseDown(x, y, e)}
                  onMouseEnter={() => isEditor && onCellMouseEnter && onCellMouseEnter(x, y)}
                  className={`relative flex items-center justify-center cursor-pointer transition-colors ${
                    isEditor
                      ? 'border border-stone-800/10 hover:border-amber-400/60 hover:bg-amber-400/10'
                      : ''
                  } ${isPreview ? 'bg-amber-400/30' : ''}`}
                  style={{
                    width: `${boardSize.cellSize}px`,
                    height: `${boardSize.cellSize}px`,
                  }}
                >
                  {/* Exit Portal */}
                  {isPortal && (
                    <SnakebirdPortal isOpen={portalIsOpen} cellSize={boardSize.cellSize} />
                  )}

                  {/* Wall Terrain */}
                  {hasWall && (
                    <SnakebirdWall cellSize={boardSize.cellSize} hasWallAbove={hasWallAbove} />
                  )}

                  {/* Fruit */}
                  {fruit && <SnakebirdFruit type={fruit.type} cellSize={boardSize.cellSize} />}

                  {/* Spike */}
                  {spike && (
                    <SnakebirdSpike direction={spike.direction} cellSize={boardSize.cellSize} />
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* 2. Dynamic Snakebirds Layer */}
        {gameState.birds.map((bird) => (
          <SnakebirdRenderer
            key={bird.id}
            bird={bird}
            isActive={bird.id === gameState.activeBirdId}
            isFalling={gameState.fallingBirdIds.includes(bird.id)}
            isClear={gameState.isClear}
            cellSize={boardSize.cellSize}
            fruitsRemaining={gameState.fruits.length}
          />
        ))}

        {/* 3. Water / Void Bottom Layer */}
        <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-blue-600/80 to-transparent pointer-events-none" />

        {/* 4. Game Over Overlay */}
        {gameState.isGameOver && (
          <div className="absolute inset-0 bg-stone-900/70 backdrop-blur-xs flex flex-col items-center justify-center text-white z-40 animate-fade-in p-4 text-center">
            <div className="text-4xl mb-2">💥</div>
            <h2 className="text-xl font-black text-rose-400 mb-1 drop-shadow-md">
              {gameState.gameOverReason === 'spike'
                ? '가시에 찔렸습니다!'
                : '낭떠러지로 떨어졌습니다!'}
            </h2>
            <p className="text-xs text-stone-200 mb-4 font-semibold">
              되돌리기(Undo) 버튼을 눌러 이전 수로 돌아가세요.
            </p>
          </div>
        )}

        {/* 5. Clear Stage Overlay */}
        {gameState.isClear && (
          <div className="absolute inset-0 bg-emerald-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white z-40 animate-fade-in p-4 text-center">
            <div className="text-5xl mb-2 animate-bounce">🎉</div>
            <h2 className="text-2xl font-black text-amber-300 mb-1 drop-shadow-lg">STAGE CLEAR!</h2>
            <p className="text-xs text-emerald-200 font-bold mb-4">
              총 {gameState.moveCount}번의 이동으로 통과했습니다!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
