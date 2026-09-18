'use client';

import Image from 'next/image';
import React, { useState } from 'react';

import ShareButton from './share-button';
import HomeButtons from './home-buttons';
import { isSfxMuted } from './utils/sound';
import { getAssetPath } from './utils/asset';
import { playEngineSound } from './game/sound';
import { setLocalSync } from './utils/local-storage';
import SettingsModal from './components/settings-modal';
import { useAssetLoader } from './components/asset-loader-context';

export interface HomeViewProps {
  onNavigate?: (mode: 'game' | 'editor') => void;
}

export default function HomeView({ onNavigate }: HomeViewProps = {}) {
  const { isLoaderFinished } = useAssetLoader();
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isTitleDropFinished, setIsTitleDropFinished] = useState<boolean>(false);

  const handleNavigate = (path: string) => {
    const muted = isSfxMuted();
    playEngineSound(path === '/game' ? 'start' : 'select', muted);

    if (onNavigate) {
      if (path === '/editor') {
        onNavigate('editor');
      } else {
        onNavigate('game');
      }
    }
  };

  const _handleResetData = () => {
    if (confirm('모든 저장 데이터 및 커스텀 에디터 문제를 초기화하시겠습니까?')) {
      setLocalSync('ultra-office:snake-puzzle:custom_levels', '');
      showToast('데이터가 초기화되었습니다.');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 2500);
  };

  const getTitleAnimClass = () => {
    if (!isLoaderFinished) return 'opacity-0 scale-95 pointer-events-none';
    if (isTitleDropFinished) return 'animate-title-sway';
    return 'animate-title-drop';
  };

  return (
    <main className="h-full min-h-0 flex-1 text-white flex flex-col items-center justify-between p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Ambient Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Area: Title & Direct Buttons */}
      <div className="flex-1 flex flex-col items-center justify-between w-full max-w-sm z-10 py-2 sm:py-6 my-auto">
        {/* Title Image with Drop & Sway Animation */}
        <div
          onAnimationEnd={(e) => {
            if (e.animationName.includes('title-drop')) {
              setIsTitleDropFinished(true);
            }
          }}
          className={`relative flex items-center justify-center w-full max-w-[280px] sm:max-w-[340px] pt-4 sm:pt-8 filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)] ${getTitleAnimClass()}`}
        >
          <Image
            src={getAssetPath('/images/title.png')}
            alt="스네이크 퍼즐"
            width={400}
            height={200}
            priority
            className="w-full h-auto object-contain pointer-events-none"
          />
        </div>

        {/* Action Buttons List */}
        <HomeButtons
          onNavigate={handleNavigate}
          onOpenRules={() => setShowRulesModal(true)}
          onOpenSettings={() => setShowSettingsModal(true)}
        />
      </div>

      {/* Eye-catching Share Icon Button (Bottom Left, raised higher) */}
      <div className="absolute bottom-14 left-4 sm:bottom-16 sm:left-6 z-20">
        <ShareButton />
      </div>

      {/* Footer Info */}
      <footer className="z-10 text-center text-xs text-white/80 font-bold drop-shadow-md py-2">
        © MADE BY BLOODSTRAWBERRY
      </footer>

      {/* Rules Modal (Bright Farm Theme) */}
      {showRulesModal && (
        <div className="fixed inset-0 pt-[80px] z-50 flex items-center justify-center p-4 bg-amber-950/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FFFDF6] border-2 border-amber-400/80 w-full max-w-sm rounded-3xl p-6 shadow-2xl text-amber-950 flex flex-col gap-4 animate-pop-in relative overflow-hidden">
            <div className="flex items-center justify-between border-b-2 border-amber-200 pb-0">
              <h3 className="text-xl font-black text-amber-900 flex items-center gap-2">
                <span>📜</span> Rules
              </h3>
              <button
                type="button"
                onClick={() => setShowRulesModal(false)}
                className="text-amber-800/70 hover:text-amber-950 font-black text-sm p-1 cursor-pointer transition-transform active:scale-90 leading-none"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs sm:text-sm text-amber-950 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <div className="bg-amber-50 p-3.5 rounded-2xl border-2 border-amber-200 shadow-xs">
                <p className="font-extrabold text-amber-900 mb-1 flex items-center gap-1.5 text-sm">
                  <span>🧩</span> 퍼즐 목표
                </p>
                <p className="text-amber-950/90 font-medium">
                  스네이크버드를 움직여 모든 과일을 먹고, 활성화된 무지개 포털로 모든 새를
                  탈출시키면 클리어!
                </p>
              </div>

              <div className="bg-amber-50 p-3.5 rounded-2xl border-2 border-amber-200 shadow-xs">
                <p className="font-extrabold text-emerald-800 mb-1 flex items-center gap-1.5 text-sm">
                  <span>🌍</span> 중력과 몸길이
                </p>
                <p className="text-amber-950/90 font-medium">
                  과일을 먹으면 몸길이가 1칸 늘어납니다! 지지할 바닥이 없으면 떨어지므로 지형에 몸을
                  걸치며 올라가세요.
                </p>
              </div>

              <div className="bg-amber-50 p-3.5 rounded-2xl border-2 border-amber-200 shadow-xs">
                <p className="font-extrabold text-indigo-800 mb-1 flex items-center gap-1.5 text-sm">
                  <span>🕹️</span> 기본 조작법
                </p>
                <p className="text-amber-950/90 font-medium">
                  • <b>이동</b>: 화면 D-Pad, 스와이프, 방향키 / WASD
                  <br />• <b>새 전환</b>: 새 클릭 또는 Tab / Space
                  <br />• <b>되돌리기 (Undo)</b>: ↩️ 버튼 또는 Z / U 키
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowRulesModal(false)}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-base rounded-2xl shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all cursor-pointer mt-1"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal (Bright Farm Theme & Toss Big Banner Ad & Sound Toggles) */}
      <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-amber-950/90 text-amber-100 text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl border border-amber-500/40 backdrop-blur-md animate-fade-in pointer-events-none">
          {toastMessage}
        </div>
      )}
    </main>
  );
}
