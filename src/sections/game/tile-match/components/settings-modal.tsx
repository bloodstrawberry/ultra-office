'use client';

import { createPortal } from 'react-dom';
import React, { useState, useEffect } from 'react';

import TossBigBannerAd from '../toss/toss-big-banner-ad';
import { clear, getItem, setItem, setLocalSync } from '../utils/local-storage';
import {
  isBgmMuted,
  isSfxMuted,
  setBgmMuted,
  getBgmVolume,
  setBgmVolume,
  toggleBgmMuted,
  toggleSfxMuted,
  BGM_CHANGE_EVENT,
  SFX_CHANGE_EVENT,
  BGM_VOLUME_CHANGE_EVENT,
} from '../utils/sound';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [mounted, setMounted] = useState<boolean>(false);
  const [bgmMuted, setBgmMutedState] = useState<boolean>(false);
  const [bgmVolume, setBgmVolumeState] = useState<number>(0.003);
  const [sfxMuted, setSfxMutedState] = useState<boolean>(false);
  const [stageInput, setStageInput] = useState<string>('');

  const isLocal = process.env.NEXT_PUBLIC_APP_ENV?.toUpperCase() === 'LOCAL';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    setBgmMutedState(isBgmMuted());
    setBgmVolumeState(getBgmVolume());
    setSfxMutedState(isSfxMuted());

    if (isLocal) {
      getItem('puzznic_max_unlocked').then((stored) => {
        setStageInput(stored || '1');
      });
    }

    const handleBgmChange = (e: Event) => {
      const customEvt = e as CustomEvent<{ muted: boolean }>;
      setBgmMutedState(customEvt.detail?.muted ?? isBgmMuted());
    };

    const handleVolumeChange = (e: Event) => {
      const customEvt = e as CustomEvent<{ volume: number }>;
      setBgmVolumeState(customEvt.detail?.volume ?? getBgmVolume());
    };

    const handleSfxChange = (e: Event) => {
      const customEvt = e as CustomEvent<{ muted: boolean }>;
      setSfxMutedState(customEvt.detail?.muted ?? isSfxMuted());
    };

    window.addEventListener(BGM_CHANGE_EVENT, handleBgmChange);
    window.addEventListener(BGM_VOLUME_CHANGE_EVENT, handleVolumeChange);
    window.addEventListener(SFX_CHANGE_EVENT, handleSfxChange);

    return () => {
      window.removeEventListener(BGM_CHANGE_EVENT, handleBgmChange);
      window.removeEventListener(BGM_VOLUME_CHANGE_EVENT, handleVolumeChange);
      window.removeEventListener(SFX_CHANGE_EVENT, handleSfxChange);
    };
  }, [isOpen, isLocal]);

  if (!isOpen || !mounted) return null;

  const handleToggleBgm = () => {
    const nextMuted = toggleBgmMuted();
    setBgmMutedState(nextMuted);
    if (!nextMuted && bgmVolume === 0) {
      setBgmVolumeState(0.2);
      setBgmVolume(0.2);
    }
  };

  const handleSliderVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valPercent = parseInt(e.target.value, 10);
    const newVol = valPercent / 100;
    setBgmVolumeState(newVol);
    setBgmVolume(newVol);

    if (newVol > 0 && bgmMuted) {
      setBgmMuted(false);
      setBgmMutedState(false);
    } else if (newVol === 0 && !bgmMuted) {
      setBgmMuted(true);
      setBgmMutedState(true);
    }
  };

  const handleToggleSfx = () => {
    const next = toggleSfxMuted();
    setSfxMutedState(next);
  };

  const handleSetStage = async () => {
    const parsed = parseInt(stageInput, 10);
    if (isNaN(parsed) || parsed < 1) {
      alert('올바른 문제 번호를 입력해주세요.');
      return;
    }
    setLocalSync('puzznic_max_unlocked', String(parsed));
    await setItem('puzznic_max_unlocked', String(parsed));
    alert(`최대 해금 문제가 ${parsed}단계로 설정되었습니다.`);
    window.location.reload();
  };

  const handleResetAll = async () => {
    if (confirm('정말 모든 데이터를 초기화하시겠습니까?\n모든 문제가 삭제됩니다.')) {
      await clear();
      alert('모든 데이터가 초기화되었습니다.');
      window.location.reload();
    }
  };

  const currentVolPercent = bgmMuted ? 0 : Math.round(bgmVolume * 100);

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-amber-950/50 backdrop-blur-md animate-fade-in"
    >
      {/* 농장 테마 설정 모달 */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm sm:max-w-md bg-[#FFFDF6] border-2 border-amber-400/80 rounded-3xl px-4 pt-3 pb-4 sm:px-5 sm:pt-3.5 sm:pb-5 shadow-2xl text-amber-950 flex flex-col gap-2.5 animate-pop-in relative overflow-hidden max-h-[92dvh] overflow-y-auto"
      >
        {/* 장식용 은은한 빛 효과 */}
        <div className="absolute top-0 right-0 w-28 h-28 bg-amber-200/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-28 h-28 bg-emerald-200/30 rounded-full blur-2xl pointer-events-none" />

        {/* 헤더 */}
        <div className="flex items-center justify-between border-b-2 border-amber-200/80 pb-0 relative z-10">
          <h3 className="text-base sm:text-lg font-black text-amber-900 flex items-center gap-1.5">
            <span className="text-lg sm:text-xl">🌻</span> 설정
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

        {/* 사운드 설정 영역 */}
        <div className="flex flex-col gap-2.5 pt-1 relative z-10">
          {/* 배경음 (BGM) 볼륨 슬라이더 컨트롤 카드 */}
          <div className="flex flex-col gap-2 p-3 bg-amber-100/70 rounded-2xl border border-amber-300/80 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{bgmMuted || bgmVolume === 0 ? '🔇' : '🎵'}</span>
                <div className="flex flex-col">
                  <span className="font-extrabold text-xs text-amber-950">배경음 (BGM)</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-900/80 w-8 text-right">
                  {currentVolPercent}%
                </span>
                <button
                  type="button"
                  onClick={handleToggleBgm}
                  className={`px-2.5 py-1 rounded-xl font-black text-[11px] transition-all cursor-pointer shadow-xs active:scale-95 ${
                    bgmMuted
                      ? 'bg-amber-200 text-amber-800 border border-amber-300 hover:bg-amber-300'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                  }`}
                >
                  {bgmMuted ? 'OFF' : 'ON'}
                </button>
              </div>
            </div>

            {/* 볼륨 슬라이더 UI */}
            <div className="flex items-center gap-2 pt-0.5 px-0.5">
              <span className="text-xs">🔈</span>
              <input
                type="range"
                min="0"
                max="100"
                value={currentVolPercent}
                onChange={handleSliderVolumeChange}
                className="w-full h-2 bg-amber-200/90 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                aria-label="배경음 음량 조절"
              />
              <span className="text-xs">🔊</span>
            </div>
          </div>

          {/* 효과음 (SFX) 컨트롤 */}
          <div className="flex items-center justify-between p-2.5 bg-amber-100/70 rounded-2xl border border-amber-300/80 shadow-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl">{sfxMuted ? '🔇' : '🔔'}</span>
              <span className="font-extrabold text-xs text-amber-950 truncate">효과음 (SFX)</span>
            </div>
            <button
              type="button"
              onClick={handleToggleSfx}
              className={`px-2.5 py-1 rounded-xl font-black text-[11px] transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 ${
                sfxMuted
                  ? 'bg-amber-200 text-amber-800 border border-amber-300 hover:bg-amber-300'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
              }`}
            >
              {sfxMuted ? 'OFF' : 'ON'}
            </button>
          </div>
        </div>

        {/* LOCAL 환경 전용 개발자 도구 (문제 강제 설정 & Storage 초기화) */}
        {isLocal && (
          <div className="flex flex-col gap-2 p-2.5 bg-amber-100/80 rounded-2xl border border-amber-300 shadow-xs relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-base">🛠️</span>
                <span className="font-extrabold text-xs text-amber-950 truncate">
                  최대 문제 번호 (LOCAL)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={stageInput}
                  onChange={(e) => setStageInput(e.target.value)}
                  className="w-14 px-2 py-0.5 bg-white border border-amber-300 rounded-lg text-xs font-bold text-amber-950 text-center"
                />
                <button
                  type="button"
                  onClick={handleSetStage}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-[11px] rounded-xl shadow-xs cursor-pointer transition-all shrink-0"
                >
                  설정
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-amber-200/80">
              <span className="font-bold text-[11px] text-amber-900/80">레벨 에디터</span>
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/editor';
                }}
                className="px-2.5 py-0.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-black text-[10px] rounded-lg shadow-xs cursor-pointer transition-all shrink-0"
              >
                에디터 열기
              </button>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-amber-200/80">
              <span className="font-bold text-[11px] text-amber-900/80">Storage 전체 초기화</span>
              <button
                type="button"
                onClick={handleResetAll}
                className="px-2.5 py-0.5 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-black text-[10px] rounded-lg shadow-xs cursor-pointer transition-all shrink-0"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Toss Big Banner Ad 영역 */}
        <div className="w-full overflow-hidden rounded-2xl border border-amber-300/60 bg-white relative z-10 shadow-xs">
          <TossBigBannerAd />
        </div>

        {/* 전체 초기화 버튼 */}
        <div className="pt-0.5 relative z-10">
          <button
            type="button"
            onClick={handleResetAll}
            className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
          >
            <span>🗑️</span>
            <span>전체 초기화</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
