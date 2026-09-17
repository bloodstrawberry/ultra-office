"use client";

import React from "react";
import TouchMoveGuideModal from "../touch-move-guide-modal";
import { GameStageHudProps } from "./types";
import { WoodSignBoard } from "./components/wood-sign-board";
import { EditorStageControls } from "./components/editor-stage-controls";
import { GameMenuModal } from "./components/game-menu-modal";
import { StageSelectConfirmModal } from "./components/stage-select-confirm-modal";
import { RestartConfirmModal } from "./components/restart-confirm-modal";
import { useHudMenuState } from "./hooks/use-hud-menu-state";

export default function GameStageHud({
  levelIndex,
  totalRemainingBlocks,
  isEditor,
  activeEditor,
  editorActiveIndex,
  editorLevels,
  muted,
  playTestMode,
  editorMapType,
  selectEditorLevel,
  editorAddLevel,
  editorDeleteLevel,
  setMuted: _setMuted,
  onFullReset,
  resetLevel,
  setGrabbed,
  playSound,
  togglePlayTest,
  setEditorMapType,
  changeMapType,
  onBackToStageSelect,
  onClearAllBlocks,
  onMenuToggle,
  externalMenuOpen,
  externalShowTouchGuideModal,
  onCloseTouchGuide,
  grid,
  editorAddHint,
  onToast,
  hasActiveHints = false,
  activeHintsLength = 0,
  onOpenHintModal,
  recordedStepsLength = 0,
  onOpenRecordModal,
  isHintAttention = false,
  hasWatchedHintAd = false,
}: GameStageHudProps) {
  const {
    isMenuOpen,
    setIsMenuOpen,
    showTouchGuideModal,
    setShowTouchGuideModal,
    mounted,
    menuRef,
    bgmMuted,
    bgmVolume,
    sfxMuted,
    touchMoveEnabled,
    stageInputValue,
    setStageInputValue,
    isLocal,
    handleToggleBgm,
    handleSliderVolumeChange,
    handleToggleSfx,
    handleToggleTouchMove,
    handleGoHome,
  } = useHudMenuState({
    externalMenuOpen,
    externalShowTouchGuideModal,
    onMenuToggle,
    editorActiveIndex,
    setMuted: _setMuted,
    playSound,
    muted,
  });

  const [showStageSelectConfirmModal, setShowStageSelectConfirmModal] =
    React.useState<boolean>(false);
  const [showRestartConfirmModal, setShowRestartConfirmModal] =
    React.useState<boolean>(false);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      className={`w-full flex flex-col items-center select-none relative z-30 ${
        activeEditor ? "pt-1 sm:pt-2 pb-0.5" : "pt-3 sm:pt-6 pb-1.5"
      }`}
    >
      {/* Top Wooden HUD Header Bar */}
      <div className="w-full max-w-lg sm:max-w-xl md:max-w-2xl px-3 flex items-center justify-between gap-2 sm:gap-4 relative z-30">
        {/* Left: 문제 Wooden Signboard */}
        <WoodSignBoard
          label="문제"
          value={
            isEditor && activeEditor ? (
              <EditorStageControls
                editorActiveIndex={editorActiveIndex}
                editorLevels={editorLevels}
                stageInputValue={stageInputValue}
                setStageInputValue={setStageInputValue}
                selectEditorLevel={selectEditorLevel}
                editorAddLevel={editorAddLevel}
                editorDeleteLevel={editorDeleteLevel}
                playSound={playSound}
                muted={muted}
              />
            ) : (
              <span>{levelIndex + 1}</span>
            )
          }
          onClick={
            isEditor && activeEditor
              ? undefined
              : () => {
                  playSound("select", muted);
                  setShowStageSelectConfirmModal(true);
                }
          }
        />

        {/* Center: 남은 블록 Wooden Signboard */}
        <WoodSignBoard
          label="남은 블록"
          value={
            <div className="flex items-center gap-1.5">
              <span>{totalRemainingBlocks}</span>
            </div>
          }
          onClick={() => {
            playSound("select", muted);
            setShowRestartConfirmModal(true);
          }}
        />

        {/* Right: MENU Wooden Signboard & Editor Test / Hint Buttons */}
        <div
          data-tutorial="menu-btn"
          className="relative flex-1 min-w-0 flex items-center gap-1 sm:gap-1.5"
          ref={menuRef}
        >
          <div className="relative flex-1 min-w-0">
            <WoodSignBoard
              label="MENU"
              value={
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xs sm:text-sm">☰</span>
                  <span>목록</span>
                </div>
              }
              onClick={() => {
                setIsMenuOpen(true);
                playSound("select", muted);
              }}
            />

            {/* Hint button appears right under 목록 (Menu) button */}
            {!isEditor && hasActiveHints && (
              <div className="absolute top-[102%] right-0 z-30 pt-0.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenHintModal?.();
                    playSound("select", muted);
                  }}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-stone-900 border-2 border-amber-200 shadow-md cursor-pointer flex items-center justify-center text-xs sm:text-sm font-black transition-all duration-300 relative ${
                    isHintAttention
                      ? "scale-125 translate-y-0.5 shadow-[0_0_16px_rgba(245,158,11,0.95)] ring-4 ring-amber-300/90 animate-bounce"
                      : "hover:scale-110 active:scale-95"
                  }`}
                  title={`힌트 보기 (${activeHintsLength}개)`}
                >
                  <span>💡</span>
                  {levelIndex >= 30 && !hasWatchedHintAd && (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-md border border-white leading-none scale-90 shadow-sm">
                      AD
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          {isEditor && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                togglePlayTest?.();
              }}
              className={`h-[40px] sm:h-[48px] px-2 sm:px-3 border-[3px] sm:border-[4px] rounded-xl sm:rounded-2xl font-black text-sm sm:text-base text-white transition-all shadow-md cursor-pointer shrink-0 flex items-center justify-center gap-1 ${
                playTestMode
                  ? "bg-rose-600 hover:bg-rose-500 border-rose-800 active:scale-95"
                  : "bg-emerald-600 hover:bg-emerald-500 border-emerald-800 active:scale-95"
              }`}
              title={playTestMode ? "테스트 중단" : "테스트 시작 (>)"}
            >
              <span>{playTestMode ? "⏹" : ">"}</span>
            </button>
          )}

          {isEditor && playTestMode && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (grid && editorAddHint) {
                  editorAddHint(grid);
                  onToast?.("힌트가 추가되었습니다!");
                }
              }}
              className="h-[40px] sm:h-[48px] px-2 sm:px-2.5 bg-amber-600 hover:bg-amber-500 border-[3px] sm:border-[4px] border-amber-800 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm text-white transition-all shadow-md cursor-pointer shrink-0 flex items-center justify-center gap-1 active:scale-95"
              title="현재 상태 힌트 추가 (F9)"
            >
              <span>💡 힌트 추가</span>
            </button>
          )}

          {isEditor && !playTestMode && recordedStepsLength > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenRecordModal?.();
                playSound("select", muted);
              }}
              className="h-[40px] sm:h-[48px] px-2 sm:px-2.5 bg-sky-600 hover:bg-sky-500 border-[3px] sm:border-[4px] border-sky-800 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm text-white transition-all shadow-md cursor-pointer shrink-0 flex items-center justify-center gap-1 active:scale-95"
              title={`녹화 기록 보기 (${recordedStepsLength}단계)`}
            >
              <span>📷 녹화 보기</span>
            </button>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      <GameMenuModal
        isMenuOpen={isMenuOpen}
        mounted={mounted}
        setIsMenuOpen={setIsMenuOpen}
        bgmMuted={bgmMuted}
        bgmVolume={bgmVolume}
        sfxMuted={sfxMuted}
        touchMoveEnabled={touchMoveEnabled}
        handleToggleBgm={handleToggleBgm}
        handleSliderVolumeChange={handleSliderVolumeChange}
        handleToggleSfx={handleToggleSfx}
        handleToggleTouchMove={handleToggleTouchMove}
        onOpenTouchGuide={() => {
          playSound("select", muted);
          setShowTouchGuideModal(true);
        }}
        isEditor={isEditor}
        isLocal={isLocal}
        muted={muted}
        setGrabbed={setGrabbed}
        onFullReset={onFullReset}
        resetLevel={resetLevel}
        playSound={playSound}
        onBackToStageSelect={onBackToStageSelect}
        handleGoHome={handleGoHome}
        onClearAllBlocks={onClearAllBlocks}
        editorMapType={editorMapType}
        setEditorMapType={setEditorMapType}
        changeMapType={changeMapType}
        togglePlayTest={togglePlayTest}
        playTestMode={playTestMode}
      />

      {/* Touch Move Guide Modal */}
      {showTouchGuideModal && (
        <TouchMoveGuideModal
          onClose={() => {
            setShowTouchGuideModal(false);
            onCloseTouchGuide?.();
          }}
          playSound={playSound}
          muted={muted}
        />
      )}

      {/* Stage Select Confirmation Modal */}
      <StageSelectConfirmModal
        isOpen={showStageSelectConfirmModal}
        onClose={() => setShowStageSelectConfirmModal(false)}
        onConfirm={() => {
          setShowStageSelectConfirmModal(false);
          if (onBackToStageSelect) {
            onBackToStageSelect();
          } else {
            handleGoHome();
          }
        }}
        playSound={playSound}
        muted={muted}
      />

      {/* Restart Confirmation Modal */}
      <RestartConfirmModal
        isOpen={showRestartConfirmModal}
        onClose={() => setShowRestartConfirmModal(false)}
        onConfirm={() => {
          setShowRestartConfirmModal(false);
          setGrabbed(false);
          if (!isEditor && onFullReset) {
            onFullReset();
          } else {
            resetLevel();
          }
        }}
        playSound={playSound}
        muted={muted}
      />
    </div>
  );
}

export * from "./types";
