'use client';

import type { GameMenuModalProps } from '../types';

import React from 'react';
import { createPortal } from 'react-dom';

import { MenuSoundSection } from './menu-sound-section';
import { MenuEditorSection } from './menu-editor-section';
import { MenuActionsSection } from './menu-actions-section';

export function GameMenuModal({
  isMenuOpen,
  mounted,
  setIsMenuOpen,
  bgmMuted,
  bgmVolume,
  sfxMuted,
  touchMoveEnabled,
  handleToggleBgm,
  handleSliderVolumeChange,
  handleToggleSfx,
  handleToggleTouchMove,
  onOpenTouchGuide,
  isEditor,
  isLocal,
  muted,
  setGrabbed,
  onFullReset,
  resetLevel,
  playSound,
  onBackToStageSelect,
  handleGoHome,
  onClearAllBlocks,
  editorActiveIndex,
  editorLevels,
  editorUpdateTurnLimit,
  editorMapType,
  setEditorMapType,
  changeMapType,
  togglePlayTest,
  playTestMode,
}: GameMenuModalProps) {
  if (!isMenuOpen || !mounted) return null;

  return createPortal(
    <div
      onClick={() => setIsMenuOpen(false)}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-amber-950/50 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm sm:max-w-md bg-[#FFFDF6] border-2 border-amber-400/80 rounded-3xl px-4 pt-3 pb-3.5 sm:px-5 sm:pt-3.5 sm:pb-4 shadow-2xl text-amber-950 flex flex-col gap-2 sm:gap-2.5 animate-pop-in relative overflow-hidden max-h-[92dvh] overflow-y-auto"
      >
        {/* Ambient background glow elements */}
        <div className="absolute top-0 right-0 w-28 h-28 bg-amber-200/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-28 h-28 bg-emerald-200/30 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-amber-200/80 pb-1 relative z-10">
          <h3 className="text-base sm:text-lg font-black text-amber-900 flex items-center gap-1.5">
            <span className="text-lg sm:text-xl">📜</span> 설정 및 메뉴
          </h3>
          <button
            type="button"
            onClick={() => setIsMenuOpen(false)}
            className="text-amber-800/70 hover:text-amber-950 font-black text-sm p-1 cursor-pointer transition-transform active:scale-90 leading-none"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* Sound settings section */}
        <MenuSoundSection
          bgmMuted={bgmMuted}
          bgmVolume={bgmVolume}
          sfxMuted={sfxMuted}
          touchMoveEnabled={touchMoveEnabled}
          handleToggleBgm={handleToggleBgm}
          handleSliderVolumeChange={handleSliderVolumeChange}
          handleToggleSfx={handleToggleSfx}
          handleToggleTouchMove={handleToggleTouchMove}
          onOpenTouchGuide={onOpenTouchGuide}
        />

        {/* Game Actions Section */}
        <MenuActionsSection
          isEditor={isEditor}
          isLocal={isLocal}
          muted={muted}
          setGrabbed={setGrabbed}
          onFullReset={onFullReset}
          resetLevel={resetLevel}
          playSound={playSound}
          setIsMenuOpen={setIsMenuOpen}
          onBackToStageSelect={onBackToStageSelect}
          handleGoHome={handleGoHome}
          onClearAllBlocks={onClearAllBlocks}
        />

        {/* Editor tools if isEditor */}
        {isEditor && (
          <MenuEditorSection
            editorActiveIndex={editorActiveIndex}
            editorLevels={editorLevels}
            editorUpdateTurnLimit={editorUpdateTurnLimit}
            editorMapType={editorMapType}
            setEditorMapType={setEditorMapType}
            changeMapType={changeMapType}
            playSound={playSound}
            muted={muted}
            togglePlayTest={togglePlayTest}
            playTestMode={playTestMode}
            setIsMenuOpen={setIsMenuOpen}
          />
        )}
      </div>
    </div>,
    document.body
  );
}
