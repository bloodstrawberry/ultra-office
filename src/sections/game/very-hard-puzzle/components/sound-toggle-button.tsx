'use client';

import React, { useState, useEffect } from 'react';

import { isSfxMuted, toggleSfxMuted, SFX_CHANGE_EVENT } from '../utils/sound';

interface SoundToggleButtonProps {
  className?: string;
}

export default function SoundToggleButton({ className = '' }: SoundToggleButtonProps) {
  const [muted, setMuted] = useState<boolean>(false);

  useEffect(() => {
    setMuted(isSfxMuted());

    const handleSfxChange = (e: Event) => {
      const customEvt = e as CustomEvent<{ muted: boolean }>;
      setMuted(customEvt.detail?.muted ?? isSfxMuted());
    };

    window.addEventListener(SFX_CHANGE_EVENT, handleSfxChange);
    return () => {
      window.removeEventListener(SFX_CHANGE_EVENT, handleSfxChange);
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newMuted = toggleSfxMuted();
    setMuted(newMuted);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`h-9 w-9 flex items-center justify-center bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-slate-200 rounded-xl transition-all shadow-md cursor-pointer ${
        muted ? 'opacity-50 grayscale' : ''
      } ${className}`}
      title={muted ? '음소거 해제 (효과음 켜기)' : '음소거 (효과음 끄기)'}
      aria-label={muted ? '효과음 켜기' : '효과음 끄기'}
    >
      <span className="text-base select-none">{muted ? '🔇' : '🔊'}</span>
    </button>
  );
}
