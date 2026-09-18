'use client';

import { useRef, useEffect } from 'react';

import { getAssetPath } from '../utils/asset';
import {
  isBgmMuted,
  getBgmVolume,
  BGM_CHANGE_EVENT,
  BGM_VOLUME_CHANGE_EVENT,
} from '../utils/sound';

export default function BgmPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    const BGM_VOLUME_SCALE = 0.1;
    audio.volume = Math.max(0, Math.min(1, getBgmVolume() * BGM_VOLUME_SCALE));

    const isAppVisible = () => {
      if (typeof document === 'undefined') return true;
      return !document.hidden && document.visibilityState === 'visible';
    };

    const updateAudioState = () => {
      const muted = isBgmMuted();
      if (muted || !isAppVisible()) {
        audio.pause();
      } else {
        audio.volume = Math.max(0, Math.min(1, getBgmVolume() * BGM_VOLUME_SCALE));
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // User gesture required
          });
        }
      }
    };

    updateAudioState();

    const handleBgmChange = (e: Event) => {
      const customEvt = e as CustomEvent<{ muted: boolean }>;
      const muted = customEvt.detail?.muted ?? isBgmMuted();
      if (muted || !isAppVisible()) {
        audio.pause();
      } else {
        audio.volume = Math.max(0, Math.min(1, getBgmVolume() * BGM_VOLUME_SCALE));
        audio.play().catch(() => {});
      }
    };

    const handleVolumeChange = (e: Event) => {
      const customEvt = e as CustomEvent<{ volume: number }>;
      const vol = customEvt.detail?.volume ?? getBgmVolume();
      audio.volume = Math.max(0, Math.min(1, vol * BGM_VOLUME_SCALE));
    };

    window.addEventListener(BGM_CHANGE_EVENT, handleBgmChange);
    window.addEventListener(BGM_VOLUME_CHANGE_EVENT, handleVolumeChange);

    const handleUserInteraction = () => {
      if (!isBgmMuted() && audio.paused && isAppVisible()) {
        audio.play().catch(() => {});
      }
    };

    window.addEventListener('click', handleUserInteraction, { once: true });
    window.addEventListener('keydown', handleUserInteraction, { once: true });
    window.addEventListener('touchstart', handleUserInteraction, { once: true });

    return () => {
      window.removeEventListener(BGM_CHANGE_EVENT, handleBgmChange);
      window.removeEventListener(BGM_VOLUME_CHANGE_EVENT, handleVolumeChange);
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
      audio.pause();
    };
  }, []);

  return (
    <audio
      ref={audioRef}
      src={getAssetPath('/sounds/bgm.mp3')}
      loop
      preload="auto"
      className="hidden"
    />
  );
}
