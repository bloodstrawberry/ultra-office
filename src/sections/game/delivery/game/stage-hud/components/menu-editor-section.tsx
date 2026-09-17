"use client";

import React from "react";
import { MenuEditorSectionProps } from "../types";

export function MenuEditorSection({
  editorMapType,
  setEditorMapType,
  changeMapType,
  playSound,
  muted,
  togglePlayTest,
  playTestMode,
  setIsMenuOpen,
}: MenuEditorSectionProps) {
  return (
    <div className="flex flex-col gap-2 p-2.5 bg-amber-100/80 rounded-2xl border border-amber-300 shadow-xs relative z-10 mt-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-amber-950 font-extrabold">
          에디터 맵 타입
        </span>
        <div className="flex items-center bg-white border border-amber-300 rounded-xl p-0.5">
          <button
            type="button"
            onClick={() => {
              if (editorMapType !== "real") {
                setEditorMapType?.("real");
                changeMapType?.("real");
                playSound("select", muted);
              }
            }}
            className={`px-2 py-0.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              editorMapType === "real"
                ? "bg-amber-800 text-white"
                : "text-amber-800/70 hover:text-amber-950"
            }`}
          >
            REAL
          </button>
          <button
            type="button"
            onClick={() => {
              if (editorMapType !== "test") {
                setEditorMapType?.("test");
                changeMapType?.("test");
                playSound("select", muted);
              }
            }}
            className={`px-2.5 py-0.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              editorMapType === "test"
                ? "bg-amber-800 text-white"
                : "text-amber-800/70 hover:text-amber-950"
            }`}
          >
            TEST
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          togglePlayTest?.();
          setIsMenuOpen(false);
        }}
        className="w-full py-2 bg-amber-200/80 hover:bg-amber-300/80 text-amber-950 font-black text-xs rounded-xl border border-amber-300/80 cursor-pointer transition-all flex items-center justify-center gap-1.5"
      >
        {playTestMode ? "⏹ 테스트 중단" : "▶ 레벨 테스트"}
      </button>
    </div>
  );
}
