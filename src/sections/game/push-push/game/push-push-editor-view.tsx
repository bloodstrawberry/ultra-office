'use client';

import React, { useState, useEffect } from 'react';

import type { PushPushLevelData, Direction } from './push-push-types';
import { usePushPushEngine } from './push-push-engine';
import { PushPushBoardView } from './push-push-board-view';
import { PushPushControls } from './push-push-controls';
import { getLocalSync, setLocalSync } from '../utils/local-storage';

export type EditorPaletteItem =
  | 'wall'
  | 'floor'
  | 'target'
  | 'box'
  | 'box_on_target'
  | 'player'
  | 'eraser';

const TOOL_CHAR_MAP: Record<EditorPaletteItem, string> = {
  wall: '#',
  floor: ' ',
  target: '.',
  box: '$',
  box_on_target: '*',
  player: '@',
  eraser: '-',
};

interface PushPushEditorViewProps {
  onNavigateHome?: () => void;
}

export default function PushPushEditorView({ onNavigateHome }: PushPushEditorViewProps = {}) {
  const [width, setWidth] = useState<number>(8);
  const [height, setHeight] = useState<number>(8);
  const [selectedTool, setSelectedTool] = useState<EditorPaletteItem>('wall');
  const [levelGrid, setLevelGrid] = useState<string[][]>(() =>
    Array.from({ length: 8 }, () => Array(8).fill('-'))
  );

  const [isTestPlay, setIsTestPlay] = useState<boolean>(false);
  const [showJsonModal, setShowJsonModal] = useState<boolean>(false);
  const [jsonInput, setJsonInput] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Engine for test play
  const { gameState, move, undo, resetLevel, canUndo, setLevelFromEditor } = usePushPushEngine(
    0,
    true
  );

  // Load custom level from localStorage
  useEffect(() => {
    const saved = getLocalSync('custom_editor_level');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as string[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const h = parsed.length;
          const w = parsed[0].length;
          setHeight(h);
          setWidth(w);
          setLevelGrid(parsed.map((row) => row.split('')));
        }
      } catch {
        // ignore
      }
    } else {
      // Default template
      const template = [
        '--------',
        '-######-',
        '-#@   #-',
        '-# $ .#-',
        '-#    #-',
        '-######-',
        '--------',
        '--------',
      ];
      setHeight(template.length);
      setWidth(template[0].length);
      setLevelGrid(template.map((r) => r.split('')));
    }
  }, []);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => {
      setStatusMessage((curr) => (curr === msg ? null : curr));
    }, 2500);
  };

  const handleCellClick = (x: number, y: number) => {
    if (isTestPlay) return;
    const charToPlace = TOOL_CHAR_MAP[selectedTool];

    const nextGrid = levelGrid.map((row) => [...row]);

    // If placing player, remove existing player
    if (charToPlace === '@' || charToPlace === '+') {
      for (let r = 0; r < nextGrid.length; r += 1) {
        for (let c = 0; c < nextGrid[r].length; c += 1) {
          if (nextGrid[r][c] === '@') nextGrid[r][c] = ' ';
          if (nextGrid[r][c] === '+') nextGrid[r][c] = '.';
        }
      }
    }

    nextGrid[y][x] = charToPlace;
    setLevelGrid(nextGrid);
    setLocalSync('custom_editor_level', JSON.stringify(nextGrid.map((r) => r.join(''))));
  };

  const handleStartTestPlay = () => {
    // Validate player and target
    const asciiMap = levelGrid.map((r) => r.join(''));
    const fullText = asciiMap.join('');

    const hasPlayer = fullText.includes('@') || fullText.includes('+');
    const hasTarget = fullText.includes('.') || fullText.includes('*') || fullText.includes('+');
    const hasBox = fullText.includes('$') || fullText.includes('*');

    if (!hasPlayer) {
      showStatus('⚠️ 플레이어(@)를 1명 배치해야 합니다!');
      return;
    }
    if (!hasTarget) {
      showStatus('⚠️ 목표 지점(.)을 1개 이상 배치해야 합니다!');
      return;
    }
    if (!hasBox) {
      showStatus('⚠️ 상자($)를 1개 이상 배치해야 합니다!');
      return;
    }

    const testLevel: PushPushLevelData = {
      id: 999,
      name: '커스텀 스테이지 (테스트)',
      parMoves: 30,
      asciiMap,
    };

    setLevelFromEditor(testLevel);
    setIsTestPlay(true);
  };

  const handleResizeGrid = (newW: number, newH: number) => {
    const clampedW = Math.max(5, Math.min(15, newW));
    const clampedH = Math.max(5, Math.min(15, newH));

    const nextGrid: string[][] = Array.from({ length: clampedH }, (_, y) =>
      Array.from({ length: clampedW }, (_, x) => {
        if (y < levelGrid.length && x < levelGrid[y].length) {
          return levelGrid[y][x];
        }
        return '-';
      })
    );

    setWidth(clampedW);
    setHeight(clampedH);
    setLevelGrid(nextGrid);
    setLocalSync('custom_editor_level', JSON.stringify(nextGrid.map((r) => r.join(''))));
  };

  const handleExportJson = () => {
    const asciiMap = levelGrid.map((r) => r.join(''));
    const data: PushPushLevelData = {
      id: 100,
      name: '나만의 푸시푸시 스테이지',
      parMoves: 25,
      asciiMap,
    };
    setJsonInput(JSON.stringify(data, null, 2));
    setShowJsonModal(true);
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(jsonInput) as PushPushLevelData;
      if (parsed && Array.isArray(parsed.asciiMap) && parsed.asciiMap.length > 0) {
        const h = parsed.asciiMap.length;
        const w = parsed.asciiMap[0].length;
        setHeight(h);
        setWidth(w);
        setLevelGrid(parsed.asciiMap.map((r) => r.split('')));
        setShowJsonModal(false);
        showStatus('✅ 맵을 성공적으로 불러왔습니다!');
      } else {
        showStatus('⚠️ 유효한 푸시푸시 레벨 형식이 아닙니다.');
      }
    } catch {
      showStatus('⚠️ JSON 파싱 오류가 발생했습니다.');
    }
  };

  const paletteButtons: Array<{ id: EditorPaletteItem; label: string; icon: string }> = [
    { id: 'wall', label: '벽', icon: '🧱' },
    { id: 'floor', label: '바닥', icon: '🟫' },
    { id: 'target', label: '목표', icon: '🎯' },
    { id: 'box', label: '상자', icon: '📦' },
    { id: 'box_on_target', label: '목표+상자', icon: '⭐' },
    { id: 'player', label: '플레이어', icon: '🍓' },
    { id: 'eraser', label: '지우개', icon: '🧹' },
  ];

  return (
    <main className="w-full h-full min-h-0 flex-1 flex flex-col justify-between items-center relative overflow-hidden p-2 select-none bg-gradient-to-b from-[#2b1810] via-[#1f120b] to-[#120a06]">
      {/* Top Header */}
      <header className="w-full max-w-2xl px-3 py-2 flex items-center justify-between gap-2 z-30">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (onNavigateHome) onNavigateHome();
              else if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('push-push-go-home'));
              }
            }}
            className="p-2 rounded-xl bg-black/30 hover:bg-black/45 active:scale-95 text-white transition-all text-sm font-bold flex items-center justify-center backdrop-blur-sm shadow-sm border border-white/10"
            title="홈으로 이동"
          >
            🏠
          </button>
          <div className="text-white font-black text-sm tracking-wide flex items-center gap-1.5">
            <span>🛠️</span>
            <span>스테이지 에디터</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isTestPlay ? (
            <button
              type="button"
              onClick={() => setIsTestPlay(false)}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-xs shadow-md transition-all flex items-center gap-1"
            >
              <span>✏️</span> 편집 모드로 복귀
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleExportJson}
                className="px-2.5 py-1.5 rounded-xl bg-black/30 hover:bg-black/45 active:scale-95 text-amber-200 font-bold text-xs border border-white/10 shadow-sm"
              >
                JSON
              </button>
              <button
                type="button"
                onClick={handleStartTestPlay}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-xs shadow-md transition-all flex items-center gap-1"
              >
                <span>▶️</span> 테스트 플레이
              </button>
            </>
          )}
        </div>
      </header>

      {/* Status toast message */}
      {statusMessage && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-40 bg-amber-500 text-amber-950 font-black px-4 py-1.5 rounded-full text-xs shadow-lg animate-bounce">
          {statusMessage}
        </div>
      )}

      {/* Center Canvas / Board */}
      <div className="flex-1 w-full min-h-0 flex items-center justify-center relative my-1">
        {isTestPlay ? (
          <PushPushBoardView gameState={gameState} onMove={move} />
        ) : (
          <div className="relative rounded-2xl border-4 border-amber-900/80 bg-amber-950/60 p-2 backdrop-blur-md max-h-full max-w-full overflow-auto">
            <div
              className="grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${width}, 36px)`,
                gridTemplateRows: `repeat(${height}, 36px)`,
              }}
            >
              {levelGrid.map((row, y) =>
                row.map((char, x) => (
                  <button
                    key={`editor-cell-${x}-${y}`}
                    type="button"
                    onClick={() => handleCellClick(x, y)}
                    className="w-9 h-9 rounded-lg border border-amber-800/40 flex items-center justify-center text-sm font-bold transition-transform active:scale-90 hover:brightness-125 bg-amber-900/40"
                  >
                    {char === '#' && '🧱'}
                    {char === ' ' && '🟫'}
                    {char === '.' && '🎯'}
                    {char === '$' && '📦'}
                    {char === '*' && '⭐'}
                    {char === '@' && '🍓'}
                    {char === '-' && ''}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls / Palette */}
      {isTestPlay ? (
        <PushPushControls onMove={move} onUndo={undo} onReset={resetLevel} canUndo={canUndo} />
      ) : (
        <div className="w-full max-w-xl flex flex-col gap-2 p-2 select-none z-30">
          {/* Palette Tools */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            {paletteButtons.map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setSelectedTool(btn.id)}
                className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1 transition-all ${
                  selectedTool === btn.id
                    ? 'bg-amber-400 text-amber-950 shadow-md scale-105 border-2 border-amber-200'
                    : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700 active:scale-95 border border-stone-600/40'
                }`}
              >
                <span>{btn.icon}</span>
                <span>{btn.label}</span>
              </button>
            ))}
          </div>

          {/* Grid Size Adjustment */}
          <div className="flex items-center justify-center gap-4 text-xs font-bold text-amber-200/90">
            <div className="flex items-center gap-1">
              <span>가로 ({width}):</span>
              <button
                type="button"
                onClick={() => handleResizeGrid(width - 1, height)}
                className="w-6 h-6 rounded bg-stone-800 hover:bg-stone-700 text-white font-bold"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => handleResizeGrid(width + 1, height)}
                className="w-6 h-6 rounded bg-stone-800 hover:bg-stone-700 text-white font-bold"
              >
                +
              </button>
            </div>

            <div className="flex items-center gap-1">
              <span>세로 ({height}):</span>
              <button
                type="button"
                onClick={() => handleResizeGrid(width, height - 1)}
                className="w-6 h-6 rounded bg-stone-800 hover:bg-stone-700 text-white font-bold"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => handleResizeGrid(width, height + 1)}
                className="w-6 h-6 rounded bg-stone-800 hover:bg-stone-700 text-white font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}

      {/* JSON Import/Export Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in select-none">
          <div className="bg-[#FFFDF6] border-4 border-amber-500 w-full max-w-md rounded-3xl p-6 shadow-2xl text-amber-950 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b-2 border-amber-200 pb-2">
              <h2 className="text-lg font-black text-amber-950">JSON 가져오기 / 내보내기</h2>
              <button
                type="button"
                onClick={() => setShowJsonModal(false)}
                className="w-7 h-7 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full h-48 p-2 font-mono text-xs border border-amber-300 rounded-xl bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="여기에 레벨 JSON을 붙여넣으세요..."
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleImportJson}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white font-black text-xs shadow-md transition-all"
              >
                불러오기 (적용)
              </button>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(jsonInput);
                  showStatus('📋 클립보드에 복사되었습니다!');
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-black text-xs shadow-md transition-all"
              >
                복사하기
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
