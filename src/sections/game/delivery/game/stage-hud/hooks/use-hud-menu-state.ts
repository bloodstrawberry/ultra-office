"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  isBgmMuted,
  setBgmMuted,
  toggleBgmMuted,
  getBgmVolume,
  setBgmVolume,
  isSfxMuted,
  toggleSfxMuted,
  BGM_CHANGE_EVENT,
  BGM_VOLUME_CHANGE_EVENT,
  SFX_CHANGE_EVENT,
} from "../../../utils/sound";
import {
  isTouchMoveEnabled,
  toggleTouchMoveEnabled,
  TOUCH_MOVE_CHANGE_EVENT,
} from "../../../utils/touch-move";

interface UseHudMenuStateOptions {
  externalMenuOpen?: boolean;
  externalShowTouchGuideModal?: boolean;
  onMenuToggle?: (isOpen: boolean) => void;
  editorActiveIndex?: number;
  setMuted?: (muted: boolean) => void;
  playSound: (
    type:
      | "coin"
      | "select"
      | "start"
      | "error"
      | "match"
      | "fall"
      | "shoot"
      | "break",
    muted: boolean,
  ) => void;
  muted: boolean;
}

export function useHudMenuState({
  externalMenuOpen,
  externalShowTouchGuideModal,
  onMenuToggle,
  editorActiveIndex,
  setMuted: _setMuted,
  playSound,
  muted,
}: UseHudMenuStateOptions) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpenState] = useState<boolean>(false);
  const [showTouchGuideModal, setShowTouchGuideModal] =
    useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (externalMenuOpen !== undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsMenuOpenState(externalMenuOpen);
    }
  }, [externalMenuOpen]);

  useEffect(() => {
    if (externalShowTouchGuideModal !== undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowTouchGuideModal(externalShowTouchGuideModal);
    }
  }, [externalShowTouchGuideModal]);

  const setIsMenuOpen = (open: boolean) => {
    setIsMenuOpenState(open);
    onMenuToggle?.(open);
  };

  const [bgmMuted, setBgmMutedState] = useState<boolean>(false);
  const [bgmVolume, setBgmVolumeState] = useState<number>(0.18);
  const [sfxMuted, setSfxMutedState] = useState<boolean>(false);
  const [touchMoveEnabled, setTouchMoveEnabledState] = useState<boolean>(false);

  const [stageInputValue, setStageInputValue] = useState<string>(
    ((editorActiveIndex ?? 0) + 1).toString(),
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStageInputValue(((editorActiveIndex ?? 0) + 1).toString());
  }, [editorActiveIndex]);

  const isLocal = process.env.NEXT_PUBLIC_APP_ENV?.toUpperCase() === "LOCAL";

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBgmMutedState(isBgmMuted());
    setBgmVolumeState(getBgmVolume());
    setSfxMutedState(isSfxMuted());
    setTouchMoveEnabledState(isTouchMoveEnabled());

    const handleBgmChange = (e: Event) => {
      const customEvt = e as CustomEvent<{ muted: boolean }>;
      setBgmMutedState(customEvt.detail?.muted ?? isBgmMuted());
    };

    const handleVolumeChange = (e: Event) => {
      const customEvt = e as CustomEvent<{ volume: number }>;
      setBgmVolumeState(customEvt.detail?.volume ?? getBgmVolume());
    };

    const handleSfxChange = (e: Event) => {
      const customEvt = e as CustomEvent<{ muted: boolean }>;
      setSfxMutedState(customEvt.detail?.muted ?? isSfxMuted());
    };

    const handleTouchMoveChange = (e: Event) => {
      const customEvt = e as CustomEvent<{ enabled: boolean }>;
      setTouchMoveEnabledState(
        customEvt.detail?.enabled ?? isTouchMoveEnabled(),
      );
    };

    window.addEventListener(BGM_CHANGE_EVENT, handleBgmChange);
    window.addEventListener(BGM_VOLUME_CHANGE_EVENT, handleVolumeChange);
    window.addEventListener(SFX_CHANGE_EVENT, handleSfxChange);
    window.addEventListener(TOUCH_MOVE_CHANGE_EVENT, handleTouchMoveChange);

    return () => {
      window.removeEventListener(BGM_CHANGE_EVENT, handleBgmChange);
      window.removeEventListener(BGM_VOLUME_CHANGE_EVENT, handleVolumeChange);
      window.removeEventListener(SFX_CHANGE_EVENT, handleSfxChange);
      window.removeEventListener(
        TOUCH_MOVE_CHANGE_EVENT,
        handleTouchMoveChange,
      );
    };
  }, [isMenuOpen]);

  const handleToggleBgm = () => {
    const nextMuted = toggleBgmMuted();
    setBgmMutedState(nextMuted);
    if (!nextMuted && bgmVolume === 0) {
      setBgmVolumeState(0.2);
      setBgmVolume(0.2);
    }
  };

  const handleSliderVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valPercent = parseInt(e.target.value, 10);
    const newVol = valPercent / 100;
    setBgmVolumeState(newVol);
    setBgmVolume(newVol);

    if (newVol > 0 && bgmMuted) {
      setBgmMuted(false);
      setBgmMutedState(false);
    } else if (newVol === 0 && !bgmMuted) {
      setBgmMuted(true);
      setBgmMutedState(true);
    }
  };

  const handleToggleSfx = () => {
    const next = toggleSfxMuted();
    setSfxMutedState(next);
    _setMuted?.(next);
  };

  const handleToggleTouchMove = () => {
    const next = toggleTouchMoveEnabled();
    setTouchMoveEnabledState(next);
    playSound("select", muted);
  };

  const handleGoHome = () => {
    playSound("select", muted);
    setIsMenuOpen(false);
    try {
      router.push("/game/delivery");
    } catch {
      window.location.href = "/game/delivery";
    }
  };

  useEffect(() => {
    if (isMenuOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isMenuOpen]);

  return {
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
  };
}
