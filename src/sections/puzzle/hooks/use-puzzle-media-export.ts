'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

import { toast } from 'src/components/snackbar';

interface UsePuzzleMediaExportOptions {
  boardRef: React.RefObject<HTMLElement | null>;
  gameTitle: string;
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  speed: number;
  onStartPlay?: () => void;
}

export interface UsePuzzleMediaExportReturn {
  // 스크린샷 관련
  isCapturingScreenshot: boolean;
  copyScreenshotToClipboard: () => Promise<void>;
  downloadScreenshot: () => Promise<void>;

  // GIF 관련
  gifMode: boolean;
  toggleGifMode: () => void;
  isRecording: boolean;
  isEncoding: boolean;
  encodingProgress: number;
  capturedFramesCount: number;
  gifResultUrl: string | null;
  downloadGif: () => void;
  clearGif: () => void;
  startAutoRecord: () => void;
}

const getEffectiveBgColor = (element: HTMLElement): string => {
  let current: HTMLElement | null = element;
  while (current && current !== document.body) {
    const bg = window.getComputedStyle(current).backgroundColor;
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
      return bg;
    }
    current = current.parentElement;
  }
  return '#FFFFFF';
};

const triggerDownload = (url: string, filename: string) => {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export function usePuzzleMediaExport({
  boardRef,
  gameTitle,
  isPlaying,
  currentStep,
  totalSteps,
  speed,
  onStartPlay,
}: UsePuzzleMediaExportOptions): UsePuzzleMediaExportReturn {
  // Screenshot state
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState<boolean>(false);

  // GIF state
  const [gifMode, setGifMode] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isEncoding, setIsEncoding] = useState<boolean>(false);
  const [encodingProgress, setEncodingProgress] = useState<number>(0);
  const [capturedFramesCount, setCapturedFramesCount] = useState<number>(0);
  const [gifResultUrl, setGifResultUrl] = useState<string | null>(null);

  const capturedFramesRef = useRef<string[]>([]);
  const isCapturingFrameRef = useRef<boolean>(false);
  const wasPlayingRef = useRef<boolean>(false);

  // 1. 스크린샷: 클립보드로 복사
  const copyScreenshotToClipboard = useCallback(async () => {
    if (!boardRef.current) {
      toast.error('캡처할 게임 보드 요소를 찾을 수 없습니다.');
      return;
    }

    setIsCapturingScreenshot(true);
    try {
      const { toBlob } = await import('html-to-image');
      const blob = await toBlob(boardRef.current, {
        pixelRatio: 2,
        backgroundColor: getEffectiveBgColor(boardRef.current),
        cacheBust: true,
      });

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
      const dataUrl = await toPng(boardRef.current, {
        pixelRatio: 2,
        backgroundColor: getEffectiveBgColor(boardRef.current),
        cacheBust: true,
      });

      triggerDownload(dataUrl, `${gameTitle}_screenshot_${Date.now()}.png`);
      toast.success('💾 게임 화면 이미지가 다운로드되었습니다!');
    } catch (err) {
      console.error('Screenshot download failed:', err);
      toast.error('스크린샷 이미지 저장 중 오류가 발생했습니다.');
    } finally {
      setIsCapturingScreenshot(false);
    }
  }, [boardRef, gameTitle]);

  // 3. GIF 모드 토글
  const toggleGifMode = useCallback(() => {
    setGifMode((prev) => {
      const next = !prev;
      if (next) {
        toast.info(
          '🎬 GIF 녹화 모드가 켜졌습니다. 재생(▶) 버튼을 누르면 풀이 완료 시 GIF 다운로드 버튼이 생성됩니다.',
          { id: 'gif-mode-status' }
        );
      } else {
        setIsRecording(false);
        toast.info('GIF 녹화 모드가 꺼졌습니다.', { id: 'gif-mode-status' });
      }
      return next;
    });
  }, []);

  // 4. 단일 프레임 캡처 함수
  const captureCurrentFrame = useCallback(async () => {
    if (!boardRef.current || isCapturingFrameRef.current) return;
    isCapturingFrameRef.current = true;

    try {
      const { toPng } = await import('html-to-image');
      const frameUrl = await toPng(boardRef.current, {
        pixelRatio: 1.2,
        backgroundColor: getEffectiveBgColor(boardRef.current),
        cacheBust: true,
      });

      if (frameUrl) {
        // 메모리 폭주 방지 (최대 120 프레임)
        if (capturedFramesRef.current.length < 120) {
          capturedFramesRef.current.push(frameUrl);
          setCapturedFramesCount(capturedFramesRef.current.length);
        }
      }
    } catch (err) {
      console.warn('Frame capture skipped:', err);
    } finally {
      isCapturingFrameRef.current = false;
    }
  }, [boardRef]);

  // 5. 인코딩 실행 함수
  const encodeCapturedFramesToGif = useCallback(
    async (frames: string[]) => {
      if (frames.length === 0) return;

      setIsEncoding(true);
      setEncodingProgress(0);
      toast.info(`🎬 총 ${frames.length}개 프레임으로 GIF를 생성하고 있습니다...`, {
        id: 'gif-encoding',
      });

      try {
        const gifshot = (await import('gifshot')).default;
        const intervalSec = Math.max(0.08, Math.min(0.6, 0.35 / speed));

        gifshot.createGIF(
          {
            images: frames,
            gifWidth: 420,
            gifHeight: 420,
            interval: intervalSec,
            numWorkers: 2,
            progressCallback: (captureProgress: number) => {
              setEncodingProgress(Math.round(captureProgress * 100));
            },
          },
          (obj: { error: boolean; image: string }) => {
            setIsEncoding(false);
            if (!obj.error && obj.image) {
              setGifResultUrl(obj.image);
              toast.success(
                '🎉 풀이 과정 GIF 생성이 완료되었습니다! [GIF 다운로드] 버튼을 눌러 저장하세요.',
                { id: 'gif-encoding', duration: 5000 }
              );
            } else {
              console.error('gifshot error:', obj);
              toast.error('GIF 생성에 실패했습니다.', { id: 'gif-encoding' });
            }
          }
        );
      } catch (err) {
        console.error('Failed to encode GIF:', err);
        setIsEncoding(false);
        toast.error('GIF 인코더 로드 중 오류가 발생했습니다.', { id: 'gif-encoding' });
      }
    },
    [speed]
  );

  // 6. 재생 시작 시 녹화 준비
  useEffect(() => {
    if (gifMode && isPlaying && !wasPlayingRef.current) {
      // 재생 시작 시점
      capturedFramesRef.current = [];
      setCapturedFramesCount(0);
      setGifResultUrl(null);
      setIsRecording(true);

      // 첫 시작 프레임 캡처
      const timer = setTimeout(() => {
        captureCurrentFrame();
      }, 60);
      return () => clearTimeout(timer);
    }
    return () => {};
  }, [gifMode, isPlaying, captureCurrentFrame]);

  // 7. 재생 중 단계 변화 시 프레임 캡처
  useEffect(() => {
    if (gifMode && isPlaying && isRecording) {
      const timer = setTimeout(() => {
        captureCurrentFrame();
      }, 80);
      return () => clearTimeout(timer);
    }
    return () => {};
  }, [gifMode, isPlaying, isRecording, currentStep, captureCurrentFrame]);

  // 8. 재생 종료(일시정지 또는 완료) 시 GIF 인코딩 트리거
  useEffect(() => {
    if (wasPlayingRef.current && !isPlaying) {
      // 방금 재생이 끝났음
      if (gifMode && isRecording) {
        setIsRecording(false);
        const frames = [...capturedFramesRef.current];
        if (frames.length > 1) {
          encodeCapturedFramesToGif(frames);
        } else if (frames.length === 1) {
          toast.warning('캡처된 프레임이 부족하여 GIF를 생성할 수 없습니다.');
        }
      }
    }
    wasPlayingRef.current = isPlaying;
  }, [isPlaying, gifMode, isRecording, encodeCapturedFramesToGif]);

  // 9. 생성된 GIF 다운로드
  const downloadGif = useCallback(() => {
    if (!gifResultUrl) {
      toast.error('다운로드할 GIF 파일이 없습니다.');
      return;
    }
    triggerDownload(gifResultUrl, `${gameTitle}_solution_${Date.now()}.gif`);
    toast.success('💾 GIF 애니메이션이 다운로드되었습니다!');
  }, [gifResultUrl, gameTitle]);

  // 10. GIF 상태 초기화
  const clearGif = useCallback(() => {
    setGifResultUrl(null);
    setCapturedFramesCount(0);
    capturedFramesRef.current = [];
    setIsRecording(false);
    setIsEncoding(false);
  }, []);

  // 11. 원클릭 자동 녹화 & 재생 시작
  const startAutoRecord = useCallback(() => {
    setGifMode(true);
    setGifResultUrl(null);
    capturedFramesRef.current = [];
    setCapturedFramesCount(0);
    setIsRecording(true);
    toast.info('🎬 녹화 모드가 켜지고 풀이 재생이 시작됩니다!', { id: 'gif-mode-status' });
    if (onStartPlay) {
      onStartPlay();
    }
  }, [onStartPlay]);

  return {
    isCapturingScreenshot,
    copyScreenshotToClipboard,
    downloadScreenshot,
    gifMode,
    toggleGifMode,
    isRecording,
    isEncoding,
    encodingProgress,
    capturedFramesCount,
    gifResultUrl,
    downloadGif,
    clearGif,
    startAutoRecord,
  };
}
