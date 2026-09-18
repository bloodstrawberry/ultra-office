'use client';

import React, { useState, useEffect } from 'react';

import {
  isSfxMuted,
  isBgmMuted,
  toggleSfxMuted,
  toggleBgmMuted,
  BGM_CHANGE_EVENT,
  SFX_CHANGE_EVENT,
} from '../utils/sound';

export default function SoundToggleButton() {
  const [muted, setMuted] = useState<boolean>(false);

  useEffect(() => {
    setMuted(isSfxMuted() && isBgmMuted());

    const handleChange = () => {
      setMuted(isSfxMuted() && isBgmMuted());
    };

    window.addEventListener(BGM_CHANGE_EVENT, handleChange);
    window.addEventListener(SFX_CHANGE_EVENT, handleChange);

    return () => {
      window.removeEventListener(BGM_CHANGE_EVENT, handleChange);
      window.removeEventListener(SFX_CHANGE_EVENT, handleChange);
    };
  }, []);

  const handleToggle = () => {
    const nextState = !muted;
    if (nextState) {
      if (!isSfxMuted()) toggleSfxMuted();
      if (!isBgmMuted()) toggleBgmMuted();
    } else {
      if (isSfxMuted()) toggleSfxMuted();
      if (isBgmMuted()) toggleBgmMuted();
    }
    setMuted(nextState);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="p-2 rounded-xl bg-white/20 hover:bg-white/30 active:scale-95 text-white transition-all text-sm font-bold flex items-center justify-center backdrop-blur-sm shadow-sm"
      title={muted ? '음소거 해제' : '음소거'}
      aria-label={muted ? '음소거 해제' : '음소거'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
}
