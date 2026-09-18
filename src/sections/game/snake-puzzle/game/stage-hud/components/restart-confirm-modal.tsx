'use client';

import { createPortal } from 'react-dom';
import React, { useState, useEffect } from 'react';

export interface RestartConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  playSound?: (
    type: 'coin' | 'select' | 'start' | 'error' | 'match' | 'fall' | 'shoot' | 'break',
    muted: boolean
  ) => void;
  muted?: boolean;
}

export function RestartConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  playSound,
  muted = false,
}: RestartConfirmModalProps) {
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100005] flex items-center justify-center p-4 bg-amber-950/60 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#FFFDF6] border-2 border-amber-400/90 rounded-3xl p-5 sm:p-6 shadow-2xl text-amber-950 flex flex-col items-center text-center gap-4 animate-pop-in relative overflow-hidden"
      >
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-200/30 rounded-full blur-2xl pointer-events-none" />

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-100/90 text-amber-900 flex items-center justify-center text-3xl shadow-xs border border-amber-300/80 relative z-10">
          🔄
        </div>

        {/* Message */}
        <div className="relative z-10 flex flex-col gap-1">
          <h3 className="text-lg sm:text-xl font-black text-amber-950 tracking-tight leading-snug">
            다시 도전할까요?
          </h3>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 w-full relative z-10 pt-1">
          <button
            type="button"
            onClick={() => {
              playSound?.('select', muted);
              onClose();
            }}
            className="w-full py-3 px-4 bg-amber-100 hover:bg-amber-200 active:scale-[0.98] text-amber-950 font-black text-sm rounded-2xl border border-amber-300 transition-all cursor-pointer shadow-xs"
          >
            취소
          </button>

          <button
            type="button"
            onClick={() => {
              playSound?.('select', muted);
              onConfirm();
            }}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:brightness-110 active:scale-[0.98] text-white font-black text-sm rounded-2xl border border-amber-900 transition-all cursor-pointer shadow-md shadow-amber-900/20"
          >
            다시 도전
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
