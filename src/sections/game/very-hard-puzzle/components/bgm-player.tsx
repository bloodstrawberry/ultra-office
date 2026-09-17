'use client';

import { useRef, useEffect } from 'react';

import { getAssetPath } from '../utils/asset';
import {
  isBgmMuted,
  getBgmVolume,
  BGM_CHANGE_EVENT,
  suspendAudioContext,
  BGM_VOLUME_CHANGE_EVENT,
} from '../utils/sound';

export default function BgmPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    // BGM 절대 볼륨 1/10 스케일 적용 (최대 출력 축소)
    const BGM_VOLUME_SCALE = 0.1;

    // 초기 볼륨 설정
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
          playPromise.catch((err) => {
            console.log('BGM playback deferred until user interaction:', err);
          });
        }
      }
    };

    updateAudioState();

    // BGM Mute 변경 수신
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

    // BGM 볼륨 변경 수신
    const handleVolumeChange = (e: Event) => {
      const customEvt = e as CustomEvent<{ volume: number }>;
      const newVol = customEvt.detail?.volume ?? getBgmVolume();
      audio.volume = Math.max(0, Math.min(1, newVol * BGM_VOLUME_SCALE));
    };

    // 최초 유저 터치/클릭 시 자동재생 차단 해제
    const handleUserGesture = () => {
      if (!isBgmMuted() && isAppVisible() && audio.paused) {
        audio.play().catch(() => {});
      }
    };

    // 앱 백그라운드 / 앱 전환 / 탭 비활성화 시 음원 일시정지 및 복구
    const handlePauseBgm = () => {
      audio.pause();
      suspendAudioContext();
    };

    const handleResumeBgm = () => {
      if (!isBgmMuted() && isAppVisible() && audio.paused) {
        audio.play().catch(() => {});
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        handlePauseBgm();
      } else {
        handleResumeBgm();
      }
    };

    window.addEventListener(BGM_CHANGE_EVENT, handleBgmChange);
    window.addEventListener(BGM_VOLUME_CHANGE_EVENT, handleVolumeChange);
    window.addEventListener('pointerdown', handleUserGesture, {
      capture: true,
    });
    window.addEventListener('keydown', handleUserGesture, { capture: true });

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handlePauseBgm);
    window.addEventListener('pagehide', handlePauseBgm);
    window.addEventListener('focus', handleResumeBgm);
    window.addEventListener('pageshow', handleResumeBgm);

    return () => {
      window.removeEventListener(BGM_CHANGE_EVENT, handleBgmChange);
      window.removeEventListener(BGM_VOLUME_CHANGE_EVENT, handleVolumeChange);
      window.removeEventListener('pointerdown', handleUserGesture, {
        capture: true,
      });
      window.removeEventListener('keydown', handleUserGesture, {
        capture: true,
      });

      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handlePauseBgm);
      window.removeEventListener('pagehide', handlePauseBgm);
      window.removeEventListener('focus', handleResumeBgm);
      window.removeEventListener('pageshow', handleResumeBgm);
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
