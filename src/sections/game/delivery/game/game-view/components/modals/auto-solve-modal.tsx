"use client";

import React, { useState } from "react";
import { DFSSolveResult } from "../../../solver";

export interface AutoSolveModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: DFSSolveResult | null;
  onPlaySolution?: (directions: string[]) => void;
  onToast?: (msg: string) => void;
}

export function AutoSolveModal({
  isOpen,
  onClose,
  result,
  onPlaySolution,
  onToast,
}: AutoSolveModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !result) return null;

  const handleCopy = () => {
    if (!result.solvable) return;
    const text = result.solutionKorean
      .map((dir, idx) => `[${idx + 1}] ${dir}`)
      .join(" → ");
    navigator.clipboard?.writeText(text);
    setCopied(true);
    onToast?.("클리어 경로가 클립보드에 복사되었습니다!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#FFFDF6] border-2 border-amber-400 rounded-3xl shadow-2xl p-5 flex flex-col gap-4 text-stone-900 select-none transform transition-all animate-modal-pop relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title & Status */}
        <div className="flex items-center justify-between border-b border-amber-200 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-amber-950">
                BFS 최단 경로 자동 풀이 분석 결과
              </h3>
              <p className="text-[11px] text-stone-500 font-semibold">
                4방향 너비 우선 탐색(BFS) 최단 경로 알고리즘
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold flex items-center justify-center cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Solvable Status Banner */}
        <div
          className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
            result.solvable
              ? "bg-emerald-50 border-emerald-300 text-emerald-950"
              : "bg-rose-50 border-rose-300 text-rose-950"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
              result.solvable
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                : "bg-rose-500 text-white shadow-md shadow-rose-500/30"
            }`}
          >
            {result.solvable ? "✓" : "✕"}
          </div>
          <div className="flex-1">
            <div className="font-black text-sm">
              {result.solvable ? "클리어 가능한 맵입니다!" : "클리어 불가능"}
            </div>
            <div className="text-xs font-semibold opacity-90 mt-0.5">
              {result.message}
            </div>
          </div>
        </div>

        {/* Solution Directions Sequence */}
        {result.solvable && (
          <div className="flex flex-col gap-2 bg-amber-50/60 p-3 rounded-2xl border border-amber-200/80">
            <div className="flex items-center justify-between text-xs font-black text-amber-900">
              <span>🧭 클리어 이동 순서 ({result.totalSteps}단계):</span>
              <span className="text-[11px] text-stone-500 font-normal">
                탐색한 상태: {result.totalExploredStates}개
              </span>
            </div>

            {/* Step list sequence */}
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1">
              {result.solutionKorean.map((dir, idx) => (
                <div
                  key={`step-${idx}`}
                  className="flex items-center gap-1 bg-white border border-amber-300 text-amber-950 px-2.5 py-1 rounded-xl text-xs font-bold shadow-2xs"
                >
                  <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span>{dir}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1">
          {result.solvable ? (
            <>
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 py-2.5 px-3 rounded-2xl bg-amber-100 hover:bg-amber-200 active:scale-[0.98] text-amber-950 font-black text-xs sm:text-sm border border-amber-300 transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>{copied ? "✓ 복사됨!" : "📋 경로 복사"}</span>
              </button>
              {onPlaySolution && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onPlaySolution(result.solutionDirections);
                  }}
                  className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 active:scale-[0.98] text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>▶ 자동 시연</span>
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-3 rounded-2xl bg-stone-200 hover:bg-stone-300 active:scale-[0.98] text-stone-800 font-black text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
            >
              닫기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
