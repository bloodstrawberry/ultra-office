'use client';

import type {
  Position,
  BirdColor,
  FruitType,
  SpikeDirection,
  SnakebirdLevelData,
} from './snakebird-types';

import React, { useState, useEffect } from 'react';

import { SnakebirdControls } from './snakebird-controls';
import { SnakebirdBoardView } from './snakebird-board-view';
import { SNAKEBIRD_LEVELS } from '../level/snakebird-levels';
import { getLocalSync, setLocalSync } from '../utils/local-storage';
import { useSnakebirdEngine, createInitialState } from './snakebird-engine';

export type EditorTool =
  | 'wall'
  | 'fruit_strawberry'
  | 'fruit_apple'
  | 'fruit_pineapple'
  | 'fruit_watermelon'
  | 'spike_up'
  | 'spike_down'
  | 'spike_left'
  | 'spike_right'
  | 'portal'
  | 'bird_red'
  | 'bird_green'
  | 'bird_blue'
  | 'bird_segment'
  | 'eraser';

export interface SnakebirdEditorViewProps {
  onNavigateHome?: () => void;
}

export default function SnakebirdEditorView({ onNavigateHome }: SnakebirdEditorViewProps = {}) {
  const handleGoHome = () => {
    if (onNavigateHome) {
      onNavigateHome();
      return;
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('snake-puzzle-go-home'));
    }
  };

  // Levels list in editor
  const [editorLevels, setEditorLevels] = useState<SnakebirdLevelData[]>(() => SNAKEBIRD_LEVELS);
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);

  // Active level being edited
  const [levelData, setLevelData] = useState<SnakebirdLevelData>(() => SNAKEBIRD_LEVELS[0]);

  // Editor tools
  const [selectedTool, setSelectedTool] = useState<EditorTool>('wall');
  const [selectedBirdId, setSelectedBirdId] = useState<string>('bird-1');
  const [isPlaytest, setIsPlaytest] = useState<boolean>(false);
  const [jsonModalOpen, setJsonModalOpen] = useState<boolean>(false);
  const [jsonText, setJsonText] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Playtest game engine
  const {
    gameState,
    setGameState,
    move,
    switchActiveBird,
    undo,
    resetLevel,
    canUndo,
    setLevelFromEditor,
  } = useSnakebirdEngine(0, true);

  // Load custom levels from localStorage on mount
  useEffect(() => {
    const saved = getLocalSync('snakebird_custom_levels');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as SnakebirdLevelData[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEditorLevels(parsed);
          setLevelData(parsed[0]);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg((curr) => (curr === msg ? null : curr)), 2500);
  };

  // Sync to Game Engine when entering Playtest mode
  const handleTogglePlaytest = () => {
    if (!isPlaytest) {
      // Validate before playtesting
      if (levelData.birds.length === 0) {
        showToast('최소 1마리 이상의 스네이크버드를 배치해야 합니다!');
        return;
      }
      setLevelFromEditor(levelData);
      setIsPlaytest(true);
      showToast('플레이테스트 시작!');
    } else {
      setIsPlaytest(false);
      showToast('에디터 모드로 복귀');
    }
  };

  // Cell Click / Edit Handler
  const handleCellClick = (x: number, y: number) => {
    if (isPlaytest) return;

    const pos: Position = { x, y };

    setLevelData((prev) => {
      const walls = prev.walls.filter((w) => !(w.x === x && w.y === y));
      const fruits = prev.fruits.filter((f) => !(f.x === x && f.y === y));
      const spikes = prev.spikes.filter((s) => !(s.x === x && s.y === y));
      let portal = { ...prev.portal };
      const birds = prev.birds
        .map((b) => ({
          ...b,
          segments: b.segments.filter((s) => !(s.x === x && s.y === y)),
        }))
        .filter((b) => b.segments.length > 0);

      if (selectedTool === 'eraser') {
        return { ...prev, walls, fruits, spikes, portal, birds };
      }

      if (selectedTool === 'wall') {
        walls.push(pos);
      } else if (selectedTool.startsWith('fruit_')) {
        const type = selectedTool.replace('fruit_', '') as FruitType;
        fruits.push({ id: `f-${Date.now()}-${x}-${y}`, x, y, type });
      } else if (selectedTool.startsWith('spike_')) {
        const dir = selectedTool.replace('spike_', '') as SpikeDirection;
        spikes.push({ id: `s-${Date.now()}-${x}-${y}`, x, y, direction: dir });
      } else if (selectedTool === 'portal') {
        portal = { x, y };
      } else if (selectedTool.startsWith('bird_')) {
        const color = selectedTool.replace('bird_', '') as BirdColor;
        // Check if we are creating a new bird or adding to an existing bird
        const targetBird = birds.find((b) => b.id === selectedBirdId);
        if (targetBird) {
          // Add segment to selected bird
          targetBird.segments.push(pos);
        } else {
          // Create a new bird
          const newBirdId = `bird-${Date.now()}`;
          birds.push({
            id: newBirdId,
            color,
            segments: [pos],
            facingDir: 'right',
          });
          setSelectedBirdId(newBirdId);
        }
      }

      return { ...prev, walls, fruits, spikes, portal, birds };
    });
  };

  // Resize Grid
  const handleResize = (newW: number, newH: number) => {
    const clampedW = Math.max(5, Math.min(16, newW));
    const clampedH = Math.max(5, Math.min(12, newH));
    setLevelData((prev) => ({
      ...prev,
      width: clampedW,
      height: clampedH,
      walls: prev.walls.filter((w) => w.x < clampedW && w.y < clampedH),
      fruits: prev.fruits.filter((f) => f.x < clampedW && f.y < clampedH),
      spikes: prev.spikes.filter((s) => s.x < clampedW && s.y < clampedH),
      portal: {
        x: Math.min(prev.portal.x, clampedW - 1),
        y: Math.min(prev.portal.y, clampedH - 1),
      },
      birds: prev.birds
        .map((b) => ({
          ...b,
          segments: b.segments.filter((s) => s.x < clampedW && s.y < clampedH),
        }))
        .filter((b) => b.segments.length > 0),
    }));
  };

  // Export JSON
  const handleExportJSON = () => {
    setJsonText(JSON.stringify(levelData, null, 2));
    setJsonModalOpen(true);
  };

  // Import JSON
  const handleImportJSON = () => {
    try {
      const parsed = JSON.parse(jsonText) as SnakebirdLevelData;
      if (parsed.width && parsed.height && Array.isArray(parsed.birds)) {
        setLevelData(parsed);
        setJsonModalOpen(false);
        showToast('레벨을 성공적으로 불러왔습니다!');
      } else {
        alert('올바르지 않은 스네이크버드 레벨 포맷입니다.');
      }
    } catch {
      alert('JSON 파싱 에러: 올바른 JSON 형식을 입력하세요.');
    }
  };

  // Save current level to localStorage
  const handleSaveToStorage = () => {
    const updatedList = [...editorLevels];
    updatedList[currentLevelIndex] = levelData;
    setEditorLevels(updatedList);
    setLocalSync('snakebird_custom_levels', JSON.stringify(updatedList));
    showToast('브라우저에 저장되었습니다!');
  };

  const handleAddNewLevel = () => {
    const newLvl: SnakebirdLevelData = {
      name: `Custom Level ${editorLevels.length + 1}`,
      width: 10,
      height: 8,
      walls: [
        { x: 1, y: 7 },
        { x: 2, y: 7 },
        { x: 3, y: 7 },
      ],
      fruits: [{ id: 'f1', x: 5, y: 5, type: 'strawberry' }],
      spikes: [],
      portal: { x: 7, y: 6 },
      birds: [
        {
          id: `bird-${Date.now()}`,
          color: 'red',
          segments: [
            { x: 2, y: 6 },
            { x: 1, y: 6 },
          ],
          facingDir: 'right',
        },
      ],
    };
    const nextList = [...editorLevels, newLvl];
    setEditorLevels(nextList);
    setCurrentLevelIndex(nextList.length - 1);
    setLevelData(newLvl);
    setLocalSync('snakebird_custom_levels', JSON.stringify(nextList));
    showToast('새 레벨이 생성되었습니다!');
  };

  const livingBirds = gameState.birds.filter((b) => !b.isExited && !b.isDead);

  return (
    <main className="w-full h-full min-h-0 flex-1 flex flex-col justify-between items-center relative overflow-hidden bg-stone-900 text-stone-100 p-2 sm:p-4 select-none">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-400 text-stone-950 font-black px-4 py-2 rounded-2xl shadow-xl border-2 border-stone-900 animate-bounce">
          {toastMsg}
        </div>
      )}

      {/* Editor Top Bar */}
      <header className="w-full max-w-2xl mx-auto flex items-center justify-between gap-2 p-1 z-30">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleGoHome}
            className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs border border-stone-700 shadow-md flex items-center gap-1 cursor-pointer"
          >
            🏠 홈
          </button>
          <span className="text-xs font-black text-amber-400">
            {isPlaytest ? '🎮 플레이테스트 중' : '🛠️ 레벨 에디터'}
          </span>
        </div>

        {/* Playtest Toggle & Level Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleTogglePlaytest}
            className={`px-3.5 py-1.5 rounded-xl font-black text-xs border shadow-lg transition-transform active:scale-95 cursor-pointer ${
              isPlaytest
                ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-700 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-700'
            }`}
          >
            {isPlaytest ? '⏹️ 테스트 중지' : '▶️ 테스트 플레이'}
          </button>

          {!isPlaytest && (
            <>
              <button
                type="button"
                onClick={handleSaveToStorage}
                className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs border border-sky-700 shadow-md cursor-pointer"
              >
                💾 저장
              </button>
              <button
                type="button"
                onClick={handleExportJSON}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs border border-purple-700 shadow-md cursor-pointer"
              >
                📋 JSON
              </button>
            </>
          )}
        </div>
      </header>

      {/* Editor Tool Palette (Visible in Edit mode) */}
      {!isPlaytest && (
        <div className="w-full max-w-2xl bg-stone-800/90 backdrop-blur-sm p-2 rounded-2xl border border-stone-700 shadow-lg flex flex-wrap items-center justify-between gap-1.5 text-xs z-30">
          {/* Object Palette */}
          <div className="flex flex-wrap items-center gap-1">
            {/* Wall */}
            <button
              type="button"
              onClick={() => setSelectedTool('wall')}
              className={`px-2.5 py-1 rounded-xl font-bold border transition-all cursor-pointer ${
                selectedTool === 'wall'
                  ? 'bg-amber-600 text-white border-amber-400 shadow-md scale-105'
                  : 'bg-stone-700 text-stone-300 border-stone-600 hover:bg-stone-600'
              }`}
            >
              🟫 땅/벽
            </button>

            {/* Fruits */}
            <button
              type="button"
              onClick={() => setSelectedTool('fruit_strawberry')}
              className={`px-2 py-1 rounded-xl font-bold border transition-all cursor-pointer ${
                selectedTool === 'fruit_strawberry'
                  ? 'bg-rose-600 text-white border-rose-400 shadow-md scale-105'
                  : 'bg-stone-700 text-stone-300 border-stone-600 hover:bg-stone-600'
              }`}
            >
              🍓 딸기
            </button>
            <button
              type="button"
              onClick={() => setSelectedTool('fruit_apple')}
              className={`px-2 py-1 rounded-xl font-bold border transition-all cursor-pointer ${
                selectedTool === 'fruit_apple'
                  ? 'bg-rose-600 text-white border-rose-400 shadow-md scale-105'
                  : 'bg-stone-700 text-stone-300 border-stone-600 hover:bg-stone-600'
              }`}
            >
              🍎 사과
            </button>

            {/* Spikes */}
            <button
              type="button"
              onClick={() => setSelectedTool('spike_up')}
              className={`px-2 py-1 rounded-xl font-bold border transition-all cursor-pointer ${
                selectedTool === 'spike_up'
                  ? 'bg-stone-500 text-white border-stone-300 shadow-md scale-105'
                  : 'bg-stone-700 text-stone-300 border-stone-600 hover:bg-stone-600'
              }`}
            >
              🔺 가시
            </button>

            {/* Portal */}
            <button
              type="button"
              onClick={() => setSelectedTool('portal')}
              className={`px-2.5 py-1 rounded-xl font-bold border transition-all cursor-pointer ${
                selectedTool === 'portal'
                  ? 'bg-pink-600 text-white border-pink-400 shadow-md scale-105'
                  : 'bg-stone-700 text-stone-300 border-stone-600 hover:bg-stone-600'
              }`}
            >
              🌀 포털
            </button>

            {/* Birds Placer */}
            <button
              type="button"
              onClick={() => setSelectedTool('bird_red')}
              className={`px-2 py-1 rounded-xl font-bold border transition-all cursor-pointer ${
                selectedTool === 'bird_red'
                  ? 'bg-rose-500 text-white border-rose-300 shadow-md scale-105'
                  : 'bg-stone-700 text-stone-300 border-stone-600 hover:bg-stone-600'
              }`}
            >
              🐦 빨간새
            </button>
            <button
              type="button"
              onClick={() => setSelectedTool('bird_green')}
              className={`px-2 py-1 rounded-xl font-bold border transition-all cursor-pointer ${
                selectedTool === 'bird_green'
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-md scale-105'
                  : 'bg-stone-700 text-stone-300 border-stone-600 hover:bg-stone-600'
              }`}
            >
              🐦 초록새
            </button>
            <button
              type="button"
              onClick={() => setSelectedTool('bird_blue')}
              className={`px-2 py-1 rounded-xl font-bold border transition-all cursor-pointer ${
                selectedTool === 'bird_blue'
                  ? 'bg-sky-600 text-white border-sky-400 shadow-md scale-105'
                  : 'bg-stone-700 text-stone-300 border-stone-600 hover:bg-stone-600'
              }`}
            >
              🐦 파란새
            </button>

            {/* Eraser */}
            <button
              type="button"
              onClick={() => setSelectedTool('eraser')}
              className={`px-2.5 py-1 rounded-xl font-bold border transition-all cursor-pointer ${
                selectedTool === 'eraser'
                  ? 'bg-rose-700 text-white border-rose-400 shadow-md scale-105'
                  : 'bg-stone-700 text-stone-300 border-stone-600 hover:bg-stone-600'
              }`}
            >
              🧹 지우개
            </button>
          </div>

          {/* Grid Size Control */}
          <div className="flex items-center gap-1 text-[11px] font-bold text-stone-300">
            <span>크기:</span>
            <button
              type="button"
              onClick={() => handleResize(levelData.width - 1, levelData.height)}
              className="w-5 h-5 rounded-md bg-stone-700 hover:bg-stone-600 flex items-center justify-center cursor-pointer"
            >
              -
            </button>
            <span>{levelData.width}</span>
            <button
              type="button"
              onClick={() => handleResize(levelData.width + 1, levelData.height)}
              className="w-5 h-5 rounded-md bg-stone-700 hover:bg-stone-600 flex items-center justify-center cursor-pointer"
            >
              +
            </button>
            <span className="mx-0.5">x</span>
            <button
              type="button"
              onClick={() => handleResize(levelData.width, levelData.height - 1)}
              className="w-5 h-5 rounded-md bg-stone-700 hover:bg-stone-600 flex items-center justify-center cursor-pointer"
            >
              -
            </button>
            <span>{levelData.height}</span>
            <button
              type="button"
              onClick={() => handleResize(levelData.width, levelData.height + 1)}
              className="w-5 h-5 rounded-md bg-stone-700 hover:bg-stone-600 flex items-center justify-center cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Main Board Area */}
      <div className="flex-1 w-full min-h-0 flex items-center justify-center relative my-1">
        <SnakebirdBoardView
          gameState={isPlaytest ? gameState : createInitialState(levelData)}
          onMove={move}
          onSelectBird={switchActiveBird}
          isEditor={!isPlaytest}
          onCellClick={handleCellClick}
        />
      </div>

      {/* Bottom Controls (Active during playtest) */}
      {isPlaytest && (
        <SnakebirdControls
          onMove={move}
          onSwitchBird={switchActiveBird}
          onUndo={undo}
          onReset={resetLevel}
          canUndo={canUndo}
          hasMultipleBirds={livingBirds.length > 1}
        />
      )}

      {/* JSON Import/Export Modal */}
      {jsonModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-800 rounded-3xl p-5 w-full max-w-md shadow-2xl border-2 border-stone-700 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-700">
              <h3 className="font-black text-sm text-amber-400">
                JSON 레벨 데이터 내보내기 / 불러오기
              </h3>
              <button
                type="button"
                onClick={() => setJsonModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-700 text-stone-300 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full h-56 bg-stone-900 text-emerald-400 font-mono text-xs p-3 rounded-2xl border border-stone-700 focus:outline-none focus:border-amber-400"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(jsonText);
                  showToast('클립보드에 복사되었습니다!');
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs shadow-md cursor-pointer"
              >
                📋 복사하기
              </button>
              <button
                type="button"
                onClick={handleImportJSON}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md cursor-pointer"
              >
                📥 불러오기 (적용)
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
