'use client';

import React, { useEffect } from 'react';
import { useVisualizerStore } from '../../store/visualizerStore';

export const PlayerControls: React.FC = () => {
  const {
    isPlaying,
    currentStepIndex,
    steps,
    speed,
    soundEnabled,
    togglePlay,
    stepForward,
    stepBackward,
    goToStep,
    reset,
    setSpeed,
    toggleSound,
  } = useVisualizerStore();

  const totalSteps = steps.length;
  const progressPercent = totalSteps > 1 ? (currentStepIndex / (totalSteps - 1)) * 100 : 0;

  // Auto-play interval effect based on speed
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = Math.max(80, Math.floor(600 / speed));
    const interval = setInterval(() => {
      stepForward();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isPlaying, speed, stepForward]);

  const speedOptions = [
    { label: '0.5x', value: 0.5 },
    { label: '1x', value: 1 },
    { label: '2x', value: 2 },
    { label: '4x', value: 4 },
  ];

  return (
    <div className="w-full bg-slate-900/95 border border-slate-800 rounded-3xl p-3.5 sm:p-4 shadow-2xl backdrop-blur-md flex flex-col gap-3">
      {/* 1. 타임라인 진행률 슬라이더 바 (모바일 터치 타겟 넉넉하게 확장) */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-mono">
          <span className="text-slate-300 font-bold">
            진행 상태: <strong className="text-blue-400 font-black">{currentStepIndex + 1}</strong>{' '}
            / {totalSteps} 단계
          </span>
          <span className="text-blue-400 font-bold">{Math.round(progressPercent)}%</span>
        </div>

        <div className="relative flex items-center w-full py-1">
          <input
            type="range"
            min={0}
            max={Math.max(0, totalSteps - 1)}
            value={currentStepIndex}
            onChange={(e) => goToStep(Number(e.target.value))}
            className="w-full h-3 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all touch-manipulation"
          />
        </div>
      </div>

      {/* 2. 메인 컨트롤 버튼 바 (한 손 조작 최적화) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
        {/* 재생 / 스텝 이동 컨트롤 (터치 영역 44px 보장) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* 처음으로 리셋 */}
          <button
            onClick={reset}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 flex items-center justify-center transition-all active:scale-90 shadow-sm text-sm"
            title="처음으로 리셋"
          >
            🔄
          </button>

          {/* 이전 스텝 */}
          <button
            onClick={stepBackward}
            disabled={currentStepIndex <= 0}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700 text-slate-200 flex items-center justify-center transition-all active:scale-90 shadow-sm font-bold text-sm"
            title="이전 단계로 가기"
          >
            ⏮
          </button>

          {/* 재생 / 일시정지 메인 버튼 */}
          <button
            onClick={togglePlay}
            className={`px-4 sm:px-6 h-10 sm:h-11 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
            }`}
          >
            <span>{isPlaying ? '⏸ 일시정지' : '▶ 실행하기'}</span>
          </button>

          {/* 다음 스텝 */}
          <button
            onClick={stepForward}
            disabled={currentStepIndex >= totalSteps - 1}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed border border-slate-700 text-slate-200 flex items-center justify-center transition-all active:scale-90 shadow-sm font-bold text-sm"
            title="다음 단계로 가기"
          >
            ⏭
          </button>
        </div>

        {/* 속도 및 음향 제어 */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* 재생 속도 선택 칩 */}
          <div className="flex items-center bg-slate-950/80 p-0.5 sm:p-1 rounded-2xl border border-slate-800">
            {speedOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSpeed(opt.value)}
                className={`px-1.5 sm:px-2 py-1 rounded-xl text-[10px] sm:text-[11px] font-mono font-bold transition-all active:scale-95 ${
                  speed === opt.value
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* 효과음 토글 */}
          <button
            onClick={toggleSound}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border flex items-center justify-center text-sm transition-all active:scale-90 ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-emerald-400 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-600'
            }`}
            title={soundEnabled ? '효과음 끄기' : '효과음 켜기'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>
      </div>
    </div>
  );
};
