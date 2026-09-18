'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

import type { PushPushLevelData, ParsedLevel } from './push-push-types';
import type { StageRecord } from './push-push-engine';

// ----------------------------------------------------------------------
// 1. Stage Clear Modal
// ----------------------------------------------------------------------

interface StageClearModalProps {
  isOpen: boolean;
  level: ParsedLevel;
  levelIndex: number;
  totalLevels: number;
  moves: number;
  pushes: number;
  onNextLevel: () => void;
  onRetry: () => void;
  onOpenStageSelect: () => void;
}

export function StageClearModal({
  isOpen,
  level,
  levelIndex,
  totalLevels,
  moves,
  pushes,
  onNextLevel,
  onRetry,
  onOpenStageSelect,
}: StageClearModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  const isFinalLevel = levelIndex >= totalLevels - 1;

  let stars = 1;
  if (moves <= level.parMoves) {
    stars = 3;
  } else if (moves <= Math.floor(level.parMoves * 1.4)) {
    stars = 2;
  }

  const content = (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-[#FFFDF6] border-4 border-amber-500 w-full max-w-sm rounded-3xl p-6 shadow-2xl text-amber-950 flex flex-col items-center gap-4 animate-pop-in relative">
        {/* Confetti / Trophy header */}
        <div className="text-4xl animate-bounce">🏆</div>
        <h2 className="text-2xl font-black text-amber-950 tracking-tight text-center">
          STAGE {levelIndex + 1} CLEAR!
        </h2>
        <div className="text-xs font-bold text-amber-800/80 -mt-2">{level.name}</div>

        {/* Stars */}
        <div className="flex items-center gap-2 my-1">
          {[1, 2, 3].map((starIdx) => (
            <span
              key={starIdx}
              className={`text-3xl transition-transform ${
                starIdx <= stars
                  ? 'scale-110 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]'
                  : 'opacity-25 grayscale'
              }`}
            >
              ⭐
            </span>
          ))}
        </div>

        {/* Score Stats */}
        <div className="w-full bg-amber-50 rounded-2xl border border-amber-200 p-4 flex justify-around items-center">
          <div className="flex flex-col items-center">
            <span className="text-xs text-amber-800/80 font-bold">이동 수</span>
            <span className="text-xl font-black text-amber-950">{moves}</span>
            <span className="text-[10px] text-amber-700/70">(기준: {level.parMoves})</span>
          </div>

          <div className="w-px h-8 bg-amber-200" />

          <div className="flex flex-col items-center">
            <span className="text-xs text-amber-800/80 font-bold">푸시 횟수</span>
            <span className="text-xl font-black text-orange-600">{pushes}</span>
            <span className="text-[10px] text-amber-700/70">상자 밀기</span>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-2 pt-2">
          {!isFinalLevel ? (
            <button
              type="button"
              onClick={onNextLevel}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-98 text-white font-black text-base shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>다음 스테이지</span> ➔
            </button>
          ) : (
            <div className="text-center py-2 text-sm font-extrabold text-amber-600">
              🎉 모든 스테이지를 정복하셨습니다! 🎉
            </div>
          )}

          <div className="flex gap-2 w-full">
            <button
              type="button"
              onClick={onRetry}
              className="flex-1 py-2.5 rounded-xl border border-amber-300 bg-amber-100/60 hover:bg-amber-100 active:scale-95 text-amber-900 font-black text-xs transition-all"
            >
              다시 도전
            </button>
            <button
              type="button"
              onClick={onOpenStageSelect}
              className="flex-1 py-2.5 rounded-xl border border-amber-300 bg-amber-100/60 hover:bg-amber-100 active:scale-95 text-amber-900 font-black text-xs transition-all"
            >
              목록 보기
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

// ----------------------------------------------------------------------
// 2. Stage Select Modal
// ----------------------------------------------------------------------

interface StageSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  levels: PushPushLevelData[];
  currentLevelIndex: number;
  unlockedStage: number;
  bestRecords: Record<number, StageRecord>;
  onSelectLevel: (index: number) => void;
}

export function StageSelectModal({
  isOpen,
  onClose,
  levels,
  currentLevelIndex,
  unlockedStage,
  bestRecords,
  onSelectLevel,
}: StageSelectModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  const content = (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-[#FFFDF6] border-4 border-amber-500 w-full max-w-md max-h-[85vh] rounded-3xl p-6 shadow-2xl text-amber-950 flex flex-col gap-4 animate-pop-in relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-amber-200 pb-3">
          <h2 className="text-xl font-black text-amber-950 flex items-center gap-2">
            <span>📋</span> 스테이지 선택
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-amber-100 hover:bg-amber-200 active:scale-95 text-amber-900 font-black flex items-center justify-center transition-transform"
          >
            ✕
          </button>
        </div>

        {/* Stages Grid (Internal scrolling) */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-4 sm:grid-cols-5 gap-3 py-2">
          {levels.map((lvl, idx) => {
            const isUnlocked = idx + 1 <= unlockedStage;
            const isCurrent = idx === currentLevelIndex;
            const record = bestRecords[lvl.id];

            return (
              <button
                key={lvl.id}
                type="button"
                disabled={!isUnlocked}
                onClick={() => {
                  onSelectLevel(idx);
                  onClose();
                }}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative p-1 transition-all ${
                  !isUnlocked
                    ? 'bg-stone-200/70 border border-stone-300 text-stone-400 cursor-not-allowed'
                    : isCurrent
                      ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white font-black border-2 border-amber-300 shadow-md scale-105'
                      : 'bg-amber-50 hover:bg-amber-100 active:scale-95 text-amber-900 font-bold border border-amber-300/80 shadow-sm'
                }`}
              >
                {!isUnlocked ? (
                  <span className="text-sm">🔒</span>
                ) : (
                  <>
                    <span className="text-sm sm:text-base font-black">{idx + 1}</span>
                    {record && (
                      <div className="flex gap-0.5 text-[9px] mt-0.5">
                        {'★'.repeat(record.stars)}
                      </div>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-black text-sm shadow-md transition-all"
        >
          닫기
        </button>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

// ----------------------------------------------------------------------
// 3. Hint Modal
// ----------------------------------------------------------------------

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  hint?: string;
  stageName: string;
}

export function HintModal({ isOpen, onClose, hint, stageName }: HintModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  const content = (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-[#FFFDF6] border-2 border-amber-500 w-full max-w-sm rounded-3xl p-6 shadow-2xl text-amber-950 flex flex-col gap-4 animate-pop-in relative">
        <div className="flex items-center justify-between border-b-2 border-amber-200 pb-2">
          <h2 className="text-lg font-black text-amber-950 flex items-center gap-2">
            <span>💡</span> 스테이지 힌트
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-amber-100 hover:bg-amber-200 active:scale-95 text-amber-900 font-black flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="text-xs font-bold text-amber-800">{stageName}</div>

        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-sm font-semibold text-amber-950 leading-relaxed">
          {hint || '이 스테이지에는 특별한 힌트가 없습니다. 공간을 천천히 관찰해 보세요!'}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-black text-xs shadow-md transition-all"
        >
          확인
        </button>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

// ----------------------------------------------------------------------
// 4. How To Play Rules Modal
// ----------------------------------------------------------------------

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RulesModal({ isOpen, onClose }: RulesModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  const content = (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-[#FFFDF6] border-4 border-amber-500 w-full max-w-md max-h-[85vh] rounded-3xl p-6 shadow-2xl text-amber-950 flex flex-col gap-4 animate-pop-in relative">
        <div className="flex items-center justify-between border-b-2 border-amber-200 pb-3">
          <h2 className="text-xl font-black text-amber-950 flex items-center gap-2">
            <span>📖</span> 푸시푸시 게임 규칙
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-amber-100 hover:bg-amber-200 active:scale-95 text-amber-900 font-black flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 text-xs sm:text-sm text-amber-900">
          <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200">
            <h3 className="font-black text-amber-950 mb-1 flex items-center gap-1.5">
              <span>🎯</span> 게임 목표
            </h3>
            <p className="leading-relaxed">
              모든 상자(📦)를 밀어서 지정된 목표 지점(🎯)에 모두 올려놓으면 스테이지가 완료됩니다!
            </p>
          </div>

          <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200">
            <h3 className="font-black text-amber-950 mb-1 flex items-center gap-1.5">
              <span>🕹️</span> 이동 및 밀기 규칙
            </h3>
            <ul className="list-disc list-inside space-y-1 leading-relaxed">
              <li>플레이어는 상하좌우로 이동할 수 있습니다.</li>
              <li>
                상자는 앞으로 밀 수만 있으며, <strong>당길 수는 없습니다</strong>.
              </li>
              <li>
                한 번에 <strong>상자 1개만</strong> 밀 수 있습니다.
              </li>
              <li>상자 뒤에 벽이나 다른 상자가 있으면 밀 수 없습니다.</li>
            </ul>
          </div>

          <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200">
            <h3 className="font-black text-amber-950 mb-1 flex items-center gap-1.5">
              <span>💡</span> 유의점 및 팁
            </h3>
            <ul className="list-disc list-inside space-y-1 leading-relaxed">
              <li>상자가 모퉁이 구석에 들어가면 다시 뺄 수 없으니 주의하세요!</li>
              <li>
                실수했을 때는 언제든 <strong>되돌리기 (U/Z)</strong> 버튼을 누르세요.
              </li>
              <li>
                키보드: <strong>방향키 / WASD</strong>, <strong>U (되돌리기)</strong>,{' '}
                <strong>R (재시작)</strong>
              </li>
            </ul>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-98 text-white font-black text-sm shadow-md transition-all"
        >
          확인했습니다
        </button>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
