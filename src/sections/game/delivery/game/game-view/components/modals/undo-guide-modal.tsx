"use client";

import React from "react";
import { UndoGuideModalProps } from "../../types";

export function UndoGuideModal({
  showUndoGuideModal,
  remainingUndos,
  onClose,
}: UndoGuideModalProps) {
  if (!showUndoGuideModal) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-amber-950/50 backdrop-blur-md animate-fade-in">
      <div className="bg-[#FFFDF6] border-2 border-amber-400 rounded-[32px] p-6 sm:p-8 w-full max-w-sm sm:max-w-md shadow-2xl flex flex-col items-center text-center animate-pop-in relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-28 h-28 bg-amber-200/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-28 h-28 bg-emerald-200/30 rounded-full blur-2xl pointer-events-none" />

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-100/90 text-amber-900 flex items-center justify-center mb-4 text-3xl shadow-xs border border-amber-300/80 relative z-10">
          🎁
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-black text-amber-950 tracking-tight leading-snug mb-3 relative z-10">
          {remainingUndos === 1
            ? "한 번 되돌릴 수 있어요!"
            : remainingUndos === 2
              ? "두 번 되돌릴 수 있어요!"
              : "최대 세 번 되돌릴 수 있어요!"}
        </h3>

        {/* Description Box */}
        <div className="w-full bg-red-50 border border-red-400 rounded-2xl py-3.5 px-4 mb-6 relative z-10 shadow-xs">
          <p className="text-sm sm:text-base font-extrabold text-red-600 leading-relaxed">
            ⚠️ 블럭을 이동하면 되돌리기가 종료돼요.
          </p>
        </div>

        {/* Confirm Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 text-base sm:text-lg font-black text-white bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:brightness-110 active:scale-[0.98] rounded-2xl shadow-lg shadow-amber-900/20 transition-all cursor-pointer relative z-10"
        >
          확인
        </button>
      </div>
    </div>
  );
}
