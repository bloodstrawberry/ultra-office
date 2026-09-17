"use client";

import React from "react";
import { CheaterDetectModalProps } from "../../types";

export function CheaterDetectModal({
  cheaterPopupOpen,
  onConfirm,
}: CheaterDetectModalProps) {
  if (!cheaterPopupOpen) return null;

  return (
    <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[4px] z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-stone-200 rounded-[28px] max-w-md w-full p-6 shadow-2xl relative text-stone-800 flex flex-col gap-5 text-center animate-slide-up">
        <div className="border-b border-stone-200 pb-3">
          <h2 className="text-sm font-bold text-rose-600 tracking-wide animate-pulse">
            ⚠️ 비정상적인 접근 감지 ⚠️
          </h2>
        </div>

        <div className="text-4xl animate-bounce">😜</div>

        <p className="text-sm font-bold text-amber-700 uppercase tracking-wide">
          주소창 입력을 통한 문제 건너뛰기가 감지되었습니다.
        </p>

        <p className="text-xs text-stone-600 leading-relaxed">
          잠겨있는 문제에는 바로 입장하실 수 없습니다.
          <br />
          <br />
          <span className="text-rose-600 font-bold">
            진행 상황 패널티:
          </span>{" "}
          처음 레벨로{" "}
          <span className="text-stone-900 font-bold underline">초기화</span>
          됩니다!
        </p>

        <div className="flex justify-center mt-2">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl text-xs cursor-pointer border border-rose-700 shadow-md transition-all hover:scale-102 active:scale-98 tracking-wider"
          >
            죄송합니다 🥺 (다시 시작)
          </button>
        </div>
      </div>
    </div>
  );
}
