'use client';

import { createPortal } from 'react-dom';
import React, { useState, useEffect } from 'react';

import { isTouchMoveEnabled, toggleTouchMoveEnabled } from '../utils/touch-move';
import BlockRenderer, {
  BLOCK_WALL,
  SoilTileDark,
  SoilTileLight,
  BLOCK_STRAWBERRY,
} from '../objects';

export interface TouchMoveGuideModalProps {
  onClose: () => void;
  playSound?: (
    type: 'coin' | 'select' | 'start' | 'error' | 'match' | 'fall' | 'shoot' | 'break',
    muted: boolean
  ) => void;
  muted?: boolean;
}

export default function TouchMoveGuideModal({
  onClose,
  playSound,
  muted = false,
}: TouchMoveGuideModalProps) {
  const [mounted, setMounted] = useState<boolean>(false);
  const [isEnabled, setIsEnabled] = useState<boolean>(() => isTouchMoveEnabled());
  const [blockX, setBlockX] = useState<number>(2);
  const [lastDirection, setLastDirection] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cols = 6;
  const rows = 4;

  const handleToggle = () => {
    const next = toggleTouchMoveEnabled();
    setIsEnabled(next);
    if (playSound) playSound('select', muted);
  };

  const handleDemoClick = (dir: 'left' | 'right') => {
    setLastDirection(dir);
    if (playSound) playSound('select', muted);
    if (dir === 'left') {
      setBlockX((prev) => Math.max(1, prev - 1));
    } else {
      setBlockX((prev) => Math.min(4, prev + 1));
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100005] flex items-center justify-center p-3 sm:p-4 bg-amber-950/60 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm sm:max-w-md bg-[#FFFDF6] border-2 border-amber-400/90 rounded-3xl p-4 sm:p-5 shadow-2xl text-amber-950 flex flex-col gap-3.5 animate-pop-in relative overflow-hidden max-h-[92dvh] overflow-y-auto"
      >
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-200/30 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-2 border-amber-200/80 pb-2 relative z-10">
          <h3 className="text-base sm:text-lg font-black text-amber-900 flex items-center gap-1.5">
            <span className="text-xl">👆</span> 화면 터치 이동 이란?
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-amber-800/70 hover:text-amber-950 font-black text-sm p-1 cursor-pointer transition-transform active:scale-90 leading-none"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* User Requested Explanation */}
        <div className="bg-amber-100/80 border border-amber-300/90 rounded-2xl p-3 shadow-xs relative z-10 flex flex-col gap-1">
          <p className="font-black text-xs sm:text-sm text-amber-950 leading-relaxed break-keep">
            선택한 블럭을 기준으로 왼쪽 빈 공간을 터치하면 왼쪽으로,
            <br />
            오른쪽 빈 공간을 터치하면 오른쪽으로 블럭이 이동해요!
          </p>
        </div>

        {/* Interactive MAP DATA Preview Area */}
        <div className="flex flex-col gap-1.5 relative z-10">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black text-amber-900 flex items-center gap-1">
              <span>🎮</span> 직접 터치해 보세요
            </span>
            {lastDirection && (
              <span className="text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full animate-bounce">
                {lastDirection === 'left' ? '⬅️ 왼쪽 이동!' : '➡️ 오른쪽 이동!'}
              </span>
            )}
          </div>

          {/* Mini Demo Map Container */}
          <div className="relative w-full aspect-[6/4] rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-md bg-amber-900/10 p-1">
            {/* Grid display */}
            <div
              className="grid w-full h-full relative"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
                gap: '2px',
              }}
            >
              {Array.from({ length: rows }).map((_row, y) =>
                Array.from({ length: cols }).map((_col, x) => {
                  const isWall = y === 0 || y === rows - 1 || x === 0 || x === cols - 1;
                  const isStrawberry = y === 2 && x === blockX;
                  const isLeftZone = !isWall && !isStrawberry && x < blockX;
                  const isRightZone = !isWall && !isStrawberry && x > blockX;
                  const TileComponent = (x + y) % 2 === 0 ? SoilTileDark : SoilTileLight;

                  return (
                    <div
                      key={`demo-${y}-${x}`}
                      onClick={() => {
                        if (isLeftZone) handleDemoClick('left');
                        if (isRightZone) handleDemoClick('right');
                      }}
                      className={`w-full h-full aspect-square relative flex items-center justify-center overflow-hidden transition-all ${
                        isLeftZone || isRightZone ? 'cursor-pointer group' : ''
                      } ${isLeftZone ? 'hover:bg-emerald-500/25 active:bg-emerald-500/40' : ''} ${
                        isRightZone ? 'hover:bg-sky-500/25 active:bg-sky-500/40' : ''
                      }`}
                    >
                      {/* Soil / Wall background */}
                      <div className="absolute inset-0 z-0 pointer-events-none">
                        {isWall ? (
                          <div className="w-full h-full">
                            <BlockRenderer id={BLOCK_WALL} />
                          </div>
                        ) : (
                          <TileComponent
                            borderTop={y === 1}
                            borderBottom={y === rows - 2}
                            borderLeft={x === 1}
                            borderRight={x === cols - 2}
                          />
                        )}
                      </div>

                      {/* Directional hint overlay on empty clickable cells */}
                      {isLeftZone && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs font-black text-emerald-800">👈</span>
                        </div>
                      )}
                      {isRightZone && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs font-black text-sky-800">👉</span>
                        </div>
                      )}

                      {/* Strawberry Block with selection cursor */}
                      {isStrawberry && (
                        <>
                          <div className="w-full h-full relative z-10 flex items-center justify-center p-0.5 pointer-events-none">
                            <BlockRenderer id={BLOCK_STRAWBERRY} />
                          </div>
                          {/* Pulsing Grabbed Selector Ring */}
                          <div className="absolute inset-0 border-2 border-amber-500 rounded-[22%] pointer-events-none z-20 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.9)]">
                            <span className="absolute top-0 left-0 w-1.5 h-1.5 rounded-sm bg-amber-500" />
                            <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-sm bg-amber-500" />
                            <span className="absolute bottom-0 left-0 w-1.5 h-1.5 rounded-sm bg-amber-500" />
                            <span className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-sm bg-amber-500" />
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Setting ON/OFF toggle bar inside modal */}
        <div className="flex items-center justify-between p-3 bg-amber-100/90 rounded-2xl border border-amber-300/80 shadow-xs relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-lg">👆</span>
            <span className="font-extrabold text-xs text-amber-950">화면 터치 이동 사용 여부</span>
          </div>

          <button
            type="button"
            onClick={handleToggle}
            className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer shadow-xs active:scale-95 flex items-center gap-1 ${
              isEnabled
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-amber-200 hover:bg-amber-300 text-amber-800 border border-amber-300'
            }`}
          >
            <span>{isEnabled ? 'ON (사용 함)' : 'OFF (사용 안 함)'}</span>
          </button>
        </div>

        {/* Close Button */}
        <button
          type="button"
          data-tutorial="touch-guide-close-btn"
          onClick={onClose}
          className="w-full py-2.5 bg-amber-800 hover:bg-amber-900 active:scale-[0.98] text-white font-black text-xs sm:text-sm rounded-2xl border border-amber-950 shadow-md transition-all cursor-pointer text-center relative z-10"
        >
          확인
        </button>
      </div>
    </div>,
    document.body
  );
}
