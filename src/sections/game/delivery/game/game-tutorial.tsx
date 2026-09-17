"use client";

import React, { useState, useEffect } from "react";
import { Position } from "./types";

export type TutorialStep = 1 | 2 | 3 | 4;

export interface GameTutorialProps {
  levelIndex: number;
  isEditor: boolean;
  playTestMode: boolean;
  grabbed: boolean;
  cursor?: Position;
  isMenuOpen: boolean;
  showTouchGuideModal?: boolean;
  onCloseMenu?: () => void;
  onOpenTouchGuide?: () => void;
  onCloseTouchGuide?: () => void;
  onStepChange?: (step: TutorialStep) => void;
}

export default function GameTutorial({
  levelIndex,
  isEditor,
  playTestMode,
}: GameTutorialProps) {
  const [showGuide, setShowGuide] = useState<boolean>(false);

  useEffect(() => {
    if (levelIndex === 0 && !isEditor && !playTestMode) {
      setShowGuide(true);
    } else {
      setShowGuide(false);
    }
  }, [levelIndex, isEditor, playTestMode]);

  if (!showGuide) return null;

  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-40 bg-amber-950/90 text-amber-100 px-3.5 py-1.5 rounded-2xl text-xs font-bold shadow-lg border border-amber-400/60 backdrop-blur-md flex items-center gap-2 max-w-[90vw] animate-fade-in pointer-events-auto">
      <span>🚀 상/하/좌/우로 밀어 벽에 부딪히며 포털(소용돌이)로 이동하세요!</span>
      <button
        type="button"
        onClick={() => setShowGuide(false)}
        className="text-amber-300 hover:text-white font-black px-1.5 py-0.5 rounded-lg bg-amber-800/80 cursor-pointer"
      >
        ✕
      </button>
    </div>
  );
}
