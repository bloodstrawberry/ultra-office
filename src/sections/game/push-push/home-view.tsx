'use client';

import React, { useState } from 'react';

import HomeButtons from './home-buttons';
import { playSound } from './game/push-push-sound';
import { RulesModal } from './game/push-push-modals';
import SettingsModal from './components/settings-modal';
import { useAssetLoader } from './components/asset-loader-context';

interface HomeViewProps {
  onNavigate: (mode: 'home' | 'game' | 'editor') => void;
}

export default function HomeView({ onNavigate }: HomeViewProps) {
  const { isLoaderFinished } = useAssetLoader();
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [isTitleDropFinished, setIsTitleDropFinished] = useState<boolean>(false);

  const handleNavigate = (modeStr: string) => {
    playSound(modeStr === 'game' ? 'select' : 'select');
    if (modeStr === 'game' || modeStr === 'editor') {
      onNavigate(modeStr);
    }
  };

  const getTitleAnimClass = () => {
    if (!isLoaderFinished) return 'opacity-0 scale-95 pointer-events-none';
    if (isTitleDropFinished) return 'animate-title-sway';
    return 'animate-title-drop';
  };

  return (
    <main className="h-full min-h-0 flex-1 text-white flex flex-col items-center justify-between p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Ambient Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Area: Title & Action Buttons */}
      <div className="flex-1 flex flex-col items-center justify-between w-full max-w-sm z-10 py-2 sm:py-6 my-auto">
        {/* Title Badge with Drop & Sway Animation */}
        <div
          onAnimationEnd={(e) => {
            if (e.animationName.includes('title-drop')) {
              setIsTitleDropFinished(true);
            }
          }}
          className={`relative flex items-center justify-center w-full max-w-[280px] sm:max-w-[340px] pt-4 sm:pt-8 filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)] ${getTitleAnimClass()}`}
        >
          <div className="rounded-3xl border-4 border-amber-300 bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 px-6 py-4 text-center shadow-2xl flex flex-col items-center">
            <span className="text-4xl sm:text-5xl mb-1 filter drop-shadow">📦</span>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-wider drop-shadow-md">
              푸시푸시
            </h1>
            <span className="text-xs sm:text-sm font-extrabold text-amber-200 tracking-widest uppercase mt-0.5">
              Push Push Puzzle
            </span>
          </div>
        </div>

        {/* Action Buttons List */}
        <HomeButtons
          onNavigate={handleNavigate}
          onOpenRules={() => setShowRulesModal(true)}
          onOpenSettings={() => setShowSettingsModal(true)}
        />
      </div>

      {/* Footer */}
      <footer className="z-10 text-center text-xs text-white/70 font-bold drop-shadow-md py-2">
        PUSH PUSH PUZZLE • CLASSIC SOKOBAN
      </footer>

      {/* Rules Modal */}
      <RulesModal isOpen={showRulesModal} onClose={() => setShowRulesModal(false)} />

      {/* Settings Modal */}
      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
    </main>
  );
}
