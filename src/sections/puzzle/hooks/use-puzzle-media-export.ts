'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

import { toast } from 'src/components/snackbar';

import { encodeFramesToMp4, getPuzzleCaptureOptions } from '../utils/puzzle-capture';

interface UsePuzzleMediaExportOptions {
  boardRef: React.RefObject<HTMLElement | null>;
  gameTitle: string;
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  speed: number;
  captureAnimationFrames?: boolean;
  onStartPlay?: () => void;
}

export interface UsePuzzleMediaExportReturn {
  // 스크린샷 관련
  isCapturingScreenshot: boolean;
  copyScreenshotToClipboard: () => Promise<void>;
  downloadScreenshot: () => Promise<void>;

  // 녹화 및 미디어 내보내기 (GIF & MP4)
  recordMode: boolean;
  gifMode: boolean; // alias of recordMode
  toggleRecordMode: () => void;
  toggleGifMode: () => void; // alias of toggleRecordMode
  isRecording: boolean;
  isEncoding: boolean;
  isEncodingGif: boolean;
  isEncodingMp4: boolean;
  encodingProgress: number;
  mp4EncodingProgress: number;
  capturedFramesCount: number;
  gifResultUrl: string | null;
  mp4ResultUrl: string | null;
  hasRecordedMedia: boolean;
  downloadGif: () => void;
  downloadMp4: () => Promise<void>;
  clearMedia: () => void;
  clearGif: () => void; // alias of clearMedia
  startAutoRecord: () => void;
}

const triggerDownload = (url: string, filename: string) => {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const GIF_SIZE = 420;

const loadFrameImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

/**
 * gifshot keeps its drawing canvas between frames. Flattening every capture onto an
 * opaque canvas prevents transparent pixels from leaving trails of the previous frame.
 */
const createOpaqueGifFrames = async (frames: string[], backgroundColor: string) => {
  const canvas = document.createElement('canvas');
  canvas.width = GIF_SIZE;
  canvas.height = GIF_SIZE;
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) throw new Error('GIF 프레임 캔버스를 생성할 수 없습니다.');

  const opaqueFrames: string[] = [];
  for (const frame of frames) {
    const image = await loadFrameImage(frame);
    context.save();
    context.globalCompositeOperation = 'copy';
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, GIF_SIZE, GIF_SIZE);
    context.globalCompositeOperation = 'source-over';
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, GIF_SIZE, GIF_SIZE);
    context.drawImage(image, 0, 0, GIF_SIZE, GIF_SIZE);
    context.restore();
    opaqueFrames.push(canvas.toDataURL('image/png'));
  }

  return opaqueFrames;
};

export function usePuzzleMediaExport({
  boardRef,
  gameTitle,
  isPlaying,
  currentStep,
  speed,
  captureAnimationFrames = false,
  onStartPlay,
}: UsePuzzleMediaExportOptions): UsePuzzleMediaExportReturn {
  // Screenshot state
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState<boolean>(false);

  // Record / GIF / MP4 state
  const [recordMode, setRecordMode] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isEncodingGif, setIsEncodingGif] = useState<boolean>(false);
  const [isEncodingMp4, setIsEncodingMp4] = useState<boolean>(false);
  const [encodingProgress, setEncodingProgress] = useState<number>(0);
  const [mp4EncodingProgress, setMp4EncodingProgress] = useState<number>(0);
  const [capturedFramesCount, setCapturedFramesCount] = useState<number>(0);
  const [gifResultUrl, setGifResultUrl] = useState<string | null>(null);
  const [mp4ResultUrl, setMp4ResultUrl] = useState<string | null>(null);
  const [mp4Ext, setMp4Ext] = useState<string>('mp4');

  const capturedFramesRef = useRef<string[]>([]);
  const pendingCaptureRef = useRef<Promise<void> | null>(null);
  const wasPlayingRef = useRef<boolean>(false);
  const animationCaptureIntervalMs = Math.max(80, Math.round(120 / speed));

  // 1. 스크린샷: 클립보드로 복사
  const copyScreenshotToClipboard = useCallback(async () => {
    if (!boardRef.current) {
      toast.error('캡처할 게임 보드 요소를 찾을 수 없습니다.');
      return;
    }

    setIsCapturingScreenshot(true);
    try {
      const { toBlob } = await import('html-to-image');
      const blob = await toBlob(boardRef.current, getPuzzleCaptureOptions(boardRef.current, 2));

      if (!blob) {
        throw new Error('이미지 Blob 생성 실패');
      }

      if (
        typeof navigator !== 'undefined' &&
        navigator.clipboard &&
        typeof ClipboardItem !== 'undefined'
      ) {
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          toast.success('📋 게임 화면이 클립보드에 복사되었습니다!');
          return;
        } catch (clipErr) {
          console.warn('Clipboard write permission denied or failed:', clipErr);
        }
      }

      // Fallback: 이미지 자동 다운로드
      const blobUrl = URL.createObjectURL(blob);
      triggerDownload(blobUrl, `${gameTitle}_screenshot_${Date.now()}.png`);
      URL.revokeObjectURL(blobUrl);
      toast.info('클립보드 접근이 제한되어 이미지 파일로 다운로드되었습니다.');
    } catch (err) {
      console.error('Screenshot copy failed:', err);
      toast.error('스크린샷 캡처 중 오류가 발생했습니다.');
    } finally {
      setIsCapturingScreenshot(false);
    }
  }, [boardRef, gameTitle]);

  // 2. 스크린샷: 이미지 파일(PNG) 다운로드
  const downloadScreenshot = useCallback(async () => {
    if (!boardRef.current) {
      toast.error('캡처할 게임 보드 요소를 찾을 수 없습니다.');
      return;
    }

    setIsCapturingScreenshot(true);
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(boardRef.current, getPuzzleCaptureOptions(boardRef.current, 2));

      triggerDownload(dataUrl, `${gameTitle}_screenshot_${Date.now()}.png`);
      toast.success('💾 게임 화면 이미지가 다운로드되었습니다!');
    } catch (err) {
      console.error('Screenshot download failed:', err);
      toast.error('스크린샷 이미지 저장 중 오류가 발생했습니다.');
    } finally {
      setIsCapturingScreenshot(false);
    }
  }, [boardRef, gameTitle]);

  // 3. 녹화 상태 초기화
  const clearMedia = useCallback(() => {
    if (gifResultUrl) {
      try {
        URL.revokeObjectURL(gifResultUrl);
      } catch {
        // ignore
      }
    }
    if (mp4ResultUrl) {
      try {
        URL.revokeObjectURL(mp4ResultUrl);
      } catch {
        // ignore
      }
    }
    setGifResultUrl(null);
    setMp4ResultUrl(null);
    setCapturedFramesCount(0);
    capturedFramesRef.current = [];
    setIsRecording(false);
    setIsEncodingGif(false);
    setIsEncodingMp4(false);
  }, [gifResultUrl, mp4ResultUrl]);

  // 4. 녹화 모드 토글
  const toggleRecordMode = useCallback(() => {
    setRecordMode((prev) => {
      const next = !prev;
      if (next) {
        toast.info(
          '🎬 녹화 모드가 켜졌습니다. 재생(▶) 버튼을 누르면 풀이 완료 시 다운로드 메뉴가 생성됩니다.',
          { id: 'record-mode-status' }
        );
      } else {
        clearMedia();
        toast.info('녹화 모드가 꺼졌습니다.', { id: 'record-mode-status' });
      }
      return next;
    });
  }, [clearMedia]);

  // 5. 단일 프레임 캡처 함수
  const captureCurrentFrame = useCallback(
    (isFinalFrame = false) => {
      if (pendingCaptureRef.current) return pendingCaptureRef.current;
      const element = boardRef.current;
      const frames = capturedFramesRef.current;
      // Reserve one of the 120 frames for the final board.
      if (!element || frames.length >= (isFinalFrame ? 120 : 119)) {
        return Promise.resolve();
      }
      const capture = async () => {
        try {
          const { toPng } = await import('html-to-image');
          const frameUrl = await toPng(element, getPuzzleCaptureOptions(element, 1.2));

          if (frameUrl && capturedFramesRef.current === frames) {
            frames.push(frameUrl);
            setCapturedFramesCount(frames.length);
          }
        } catch (err) {
          console.warn('Frame capture skipped:', err);
        } finally {
          pendingCaptureRef.current = null;
        }
      };
      pendingCaptureRef.current = capture();
      return pendingCaptureRef.current;
    },
    [boardRef]
  );

  // 6. GIF 인코딩 실행 함수
  const encodeCapturedFramesToGif = useCallback(
    async (frames: string[]) => {
      if (frames.length === 0) return;

      setIsEncodingGif(true);
      setEncodingProgress(0);

      try {
        const gifshot = (await import('gifshot')).default;
        if (capturedFramesRef.current !== frames) return;
        const captureElement = boardRef.current;
        const backgroundColor = captureElement
          ? getPuzzleCaptureOptions(captureElement, 1).backgroundColor
          : '#FFFFFF';
        const opaqueFrames = await createOpaqueGifFrames(frames, backgroundColor);
        if (capturedFramesRef.current !== frames) return;
        const intervalSec = captureAnimationFrames
          ? animationCaptureIntervalMs / 1000
          : Math.max(0.08, Math.min(0.6, 0.35 / speed));

        gifshot.createGIF(
          {
            images: opaqueFrames,
            gifWidth: GIF_SIZE,
            gifHeight: GIF_SIZE,
            interval: intervalSec,
            numWorkers: 2,
            progressCallback: (captureProgress: number) => {
              if (capturedFramesRef.current !== frames) return;
              setEncodingProgress(Math.round(captureProgress * 100));
            },
          },
          (obj: { error: boolean; image: string }) => {
            if (capturedFramesRef.current !== frames) return;
            setIsEncodingGif(false);
            if (!obj.error && obj.image) {
              setGifResultUrl(obj.image);
              toast.success(
                '🎉 풀이 과정 녹화가 완료되었습니다! [다운로드] 버튼을 눌러 GIF 또는 MP4로 저장하세요.',
                { id: 'media-encoding', duration: 4000 }
              );
            } else {
              console.error('gifshot error:', obj);
              toast.error('GIF 생성에 실패했습니다.', { id: 'media-encoding' });
            }
          }
        );
      } catch (err) {
        if (capturedFramesRef.current !== frames) return;
        console.error('Failed to encode GIF:', err);
        setIsEncodingGif(false);
        toast.error('GIF 인코더 로드 중 오류가 발생했습니다.', { id: 'media-encoding' });
      }
    },
    [animationCaptureIntervalMs, boardRef, captureAnimationFrames, speed]
  );

  // 7. MP4 인코딩 실행 함수
  const encodeCapturedFramesToMp4 = useCallback(
    async (frames: string[]): Promise<{ blob: Blob; url: string; ext: string } | null> => {
      if (frames.length === 0) return null;

      setIsEncodingMp4(true);
      setMp4EncodingProgress(0);

      try {
        const res = await encodeFramesToMp4(
          frames,
          speed,
          (progress) => {
            if (capturedFramesRef.current !== frames) return;
            setMp4EncodingProgress(progress);
          },
          captureAnimationFrames ? animationCaptureIntervalMs : undefined
        );

        if (capturedFramesRef.current !== frames) return null;
        setMp4ResultUrl(res.url);
        setMp4Ext(res.ext);
        return res;
      } catch (err) {
        if (capturedFramesRef.current !== frames) return null;
        console.error('Failed to encode MP4:', err);
        return null;
      } finally {
        if (capturedFramesRef.current === frames) {
          setIsEncodingMp4(false);
        }
      }
    },
    [animationCaptureIntervalMs, captureAnimationFrames, speed]
  );

  // 8. 재생 시작 시 녹화 준비
  useEffect(() => {
    if (recordMode && isPlaying && !wasPlayingRef.current) {
      capturedFramesRef.current = [];
      setCapturedFramesCount(0);
      setGifResultUrl(null);
      setMp4ResultUrl(null);
      setIsEncodingGif(false);
      setIsEncodingMp4(false);
      setIsRecording(true);

      void captureCurrentFrame();
    }
  }, [recordMode, isPlaying, captureCurrentFrame]);

  // 9. 재생 중 단계 변화 시 프레임 캡처
  useEffect(() => {
    if (recordMode && isPlaying && isRecording && !captureAnimationFrames) {
      void captureCurrentFrame();
    }
  }, [
    captureAnimationFrames,
    recordMode,
    isPlaying,
    isRecording,
    currentStep,
    captureCurrentFrame,
  ]);

  // CSS 이동/회전처럼 단계 사이에서 일어나는 장면도 연속 프레임으로 기록한다.
  useEffect(() => {
    if (!captureAnimationFrames || !recordMode || !isPlaying || !isRecording) return () => {};

    void captureCurrentFrame();
    const captureTimer = setInterval(() => {
      void captureCurrentFrame();
    }, animationCaptureIntervalMs);

    return () => clearInterval(captureTimer);
  }, [
    animationCaptureIntervalMs,
    captureAnimationFrames,
    captureCurrentFrame,
    isPlaying,
    isRecording,
    recordMode,
  ]);

  // 10. 재생 종료(일시정지 또는 완료) 시 미디어 인코딩 트리거
  useEffect(() => {
    if (wasPlayingRef.current && !isPlaying) {
      if (recordMode && isRecording) {
        setIsRecording(false);
        const frames = capturedFramesRef.current;
        const finishRecording = async () => {
          await pendingCaptureRef.current;
          if (capturedFramesRef.current !== frames) return;
          await captureCurrentFrame(true);
          if (capturedFramesRef.current !== frames) return;
          if (frames.length > 0) {
            toast.info(`🎬 총 ${frames.length}개 프레임으로 미디어를 준비하고 있습니다...`, {
              id: 'media-encoding',
            });
            void encodeCapturedFramesToGif(frames);
            void encodeCapturedFramesToMp4(frames);
          } else {
            setIsEncodingGif(false);
            setIsEncodingMp4(false);
            toast.error('게임 화면을 캡처하지 못했습니다. 다시 녹화해주세요.');
          }
        };
        void finishRecording();
      }
    }
    wasPlayingRef.current = isPlaying;
  }, [
    isPlaying,
    recordMode,
    isRecording,
    captureCurrentFrame,
    encodeCapturedFramesToGif,
    encodeCapturedFramesToMp4,
  ]);

  useEffect(
    () => () => {
      capturedFramesRef.current = [];
    },
    []
  );

  // 11. GIF 다운로드
  const downloadGif = useCallback(() => {
    if (!gifResultUrl) {
      if (isEncodingGif) {
        toast.info('🎬 GIF 파일을 생성하고 있습니다. 잠시만 기다려주세요...', {
          id: 'gif-download',
        });
      } else {
        toast.error('다운로드할 GIF 파일이 없습니다.');
      }
      return;
    }
    triggerDownload(gifResultUrl, `${gameTitle}_solution_${Date.now()}.gif`);
    toast.success('💾 GIF 애니메이션이 다운로드되었습니다!');
  }, [gifResultUrl, isEncodingGif, gameTitle]);

  // 12. MP4 다운로드
  const downloadMp4 = useCallback(async () => {
    if (mp4ResultUrl) {
      triggerDownload(mp4ResultUrl, `${gameTitle}_solution_${Date.now()}.${mp4Ext}`);
      toast.success('💾 MP4 동영상이 다운로드되었습니다!');
      return;
    }

    const frames = capturedFramesRef.current;
    if (frames.length === 0) {
      toast.error('다운로드할 녹화 프레임이 없습니다.');
      return;
    }

    if (isEncodingMp4) {
      toast.info('🎬 MP4 동영상을 생성하고 있습니다. 잠시만 기다려주세요...', {
        id: 'mp4-download',
      });
      return;
    }

    toast.info(`🎬 총 ${frames.length}개 프레임으로 MP4 동영상을 생성하고 있습니다...`, {
      id: 'mp4-download',
    });

    const res = await encodeCapturedFramesToMp4(frames);
    if (res) {
      triggerDownload(res.url, `${gameTitle}_solution_${Date.now()}.${res.ext}`);
      toast.success('💾 MP4 동영상이 다운로드되었습니다!', { id: 'mp4-download' });
    } else {
      toast.error('MP4 동영상 생성에 실패했습니다.', { id: 'mp4-download' });
    }
  }, [mp4ResultUrl, gameTitle, mp4Ext, isEncodingMp4, encodeCapturedFramesToMp4]);

  // 13. 원클릭 자동 녹화 & 재생 시작
  const startAutoRecord = useCallback(() => {
    setRecordMode(true);
    clearMedia();
    toast.info('🎬 녹화 모드가 켜지고 풀이 재생이 시작됩니다!', { id: 'record-mode-status' });
    if (onStartPlay && !isPlaying) {
      onStartPlay();
    }
  }, [clearMedia, isPlaying, onStartPlay]);

  const hasRecordedMedia = Boolean(
    gifResultUrl || mp4ResultUrl || (capturedFramesCount > 0 && !isRecording)
  );
  const isEncoding = isEncodingGif || isEncodingMp4;

  return {
    isCapturingScreenshot,
    copyScreenshotToClipboard,
    downloadScreenshot,
    recordMode,
    gifMode: recordMode,
    toggleRecordMode,
    toggleGifMode: toggleRecordMode,
    isRecording,
    isEncoding,
    isEncodingGif,
    isEncodingMp4,
    encodingProgress,
    mp4EncodingProgress,
    capturedFramesCount,
    gifResultUrl,
    mp4ResultUrl,
    hasRecordedMedia,
    downloadGif,
    downloadMp4,
    clearMedia,
    clearGif: clearMedia,
    startAutoRecord,
  };
}
