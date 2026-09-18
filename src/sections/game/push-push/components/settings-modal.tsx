'use client';

import { createPortal } from 'react-dom';
import React, { useState, useEffect } from 'react';

import {
  isBgmMuted,
  isSfxMuted,
  getBgmVolume,
  setBgmVolume,
  toggleBgmMuted,
  toggleSfxMuted,
  BGM_CHANGE_EVENT,
  SFX_CHANGE_EVENT,
  BGM_VOLUME_CHANGE_EVENT,
} from '../utils/sound';
import { removeLocalSync } from '../utils/local-storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [mounted, setMounted] = useState<boolean>(false);
  const [bgmMuted, setBgmMutedState] = useState<boolean>(false);
  const [bgmVolume, setBgmVolumeState] = useState<number>(0.5);
  const [sfxMuted, setSfxMutedState] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    setBgmMutedState(isBgmMuted());
    setBgmVolumeState(getBgmVolume());
    setSfxMutedState(isSfxMuted());

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
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const handleToggleBgm = () => {
    const next = toggleBgmMuted();
    setBgmMutedState(next);
  };

  const handleToggleSfx = () => {
    const next = toggleSfxMuted();
    setSfxMutedState(next);
  };

  const handleVolumeSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setBgmVolume(vol);
    setBgmVolumeState(vol);
  };

  const handleResetRecords = () => {
    if (window.confirm('모든 클리어 기록과 커스텀 맵을 초기화하시겠습니까?')) {
      removeLocalSync('unlocked_stage');
      removeLocalSync('stage_records');
      removeLocalSync('custom_levels');
      window.location.reload();
    }
  };

  const content = (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="bg-[#FFFDF6] border-2 border-amber-500 w-full max-w-sm rounded-3xl p-6 shadow-2xl text-amber-950 flex flex-col gap-4 animate-pop-in relative">
        <div className="flex items-center justify-between border-b-2 border-amber-200 pb-3">
          <h2 className="text-xl font-black text-amber-950 flex items-center gap-2">
            <span>⚙️</span> 게임 설정
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-amber-100 hover:bg-amber-200 active:scale-95 text-amber-900 font-black flex items-center justify-center transition-transform"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4 py-2">
          {/* BGM Toggle */}
          <div className="flex items-center justify-between bg-amber-50/80 p-3 rounded-2xl border border-amber-200">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎵</span>
              <span className="font-bold text-sm">배경음악 (BGM)</span>
            </div>
            <button
              type="button"
              onClick={handleToggleBgm}
              className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-colors ${
                !bgmMuted ? 'bg-emerald-500 text-white shadow-sm' : 'bg-stone-300 text-stone-600'
              }`}
            >
              {!bgmMuted ? '켜짐' : '꺼짐'}
            </button>
          </div>

          {/* BGM Volume Slider */}
          {!bgmMuted && (
            <div className="flex flex-col gap-1 px-2">
              <div className="flex justify-between text-xs text-amber-800 font-semibold">
                <span>BGM 음량</span>
                <span>{Math.round(bgmVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={bgmVolume}
                onChange={handleVolumeSlider}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          )}

          {/* SFX Toggle */}
          <div className="flex items-center justify-between bg-amber-50/80 p-3 rounded-2xl border border-amber-200">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔔</span>
              <span className="font-bold text-sm">효과음 (SFX)</span>
            </div>
            <button
              type="button"
              onClick={handleToggleSfx}
              className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-colors ${
                !sfxMuted ? 'bg-emerald-500 text-white shadow-sm' : 'bg-stone-300 text-stone-600'
              }`}
            >
              {!sfxMuted ? '켜짐' : '꺼짐'}
            </button>
          </div>

          {/* Reset Data */}
          <div className="pt-2 border-t border-amber-200/60">
            <button
              type="button"
              onClick={handleResetRecords}
              className="w-full py-2.5 px-4 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 active:scale-98 font-bold text-xs transition-all text-center"
            >
              모든 기록 및 저장 데이터 초기화
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-98 text-white font-black text-sm shadow-md transition-all"
        >
          확인
        </button>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
