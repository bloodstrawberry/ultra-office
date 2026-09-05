'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';

import { PhotoUploadWorkspace } from '../components';
import { removeBackground } from '../utils/ai-bg-remove';
import { EditorCanvas } from '../components/editor/editor-canvas';
import { EditorToolbar } from '../components/editor/editor-toolbar';
import { EditorSidebar } from '../components/editor/editor-sidebar';
import { EDITOR_SAMPLE_IMAGES } from '../components/editor/editor-presets';
import { EditorExportModal } from '../components/editor/editor-export-modal';
import { applyAiInpaint, applySmartRemaster } from '../components/editor/editor-processor';
import {
  type DeviceMode,
  type TabCategory,
  DEFAULT_EDITOR_STATE,
  type PhotoEditorState,
} from '../components/editor/editor-types';

// ----------------------------------------------------------------------

export function PhotoEditorView() {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [originalSrcBackup, setOriginalSrcBackup] = useState<string>('');

  // Master State & Current Tab
  const [editorState, setEditorState] = useState<PhotoEditorState>(DEFAULT_EDITOR_STATE);
  const [currentTab, setCurrentTab] = useState<TabCategory>('basic');
  const [zoom, setZoom] = useState<number>(0.85);
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);

  // Undo / Redo History
  const [history, setHistory] = useState<PhotoEditorState[]>([DEFAULT_EDITOR_STATE]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Mask canvas ref for brush, eraser, selective selections
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // 1. Image loading when imageSrc changes
  useEffect(() => {
    if (!imageSrc) {
      setOriginalImage(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setOriginalImage(img);
      // Reset state and history for new image
      setEditorState(DEFAULT_EDITOR_STATE);
      setHistory([DEFAULT_EDITOR_STATE]);
      setHistoryIndex(0);
      setZoom(0.85);
    };
    img.onerror = () => {
      toast.error('이미지 로드에 실패했습니다. 올바른 이미지 파일인지 확인하세요.');
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // 2. State update with History recording
  const handleStateChange = useCallback(
    (newState: PhotoEditorState) => {
      setEditorState(newState);

      setHistory((prev) => {
        const sliced = prev.slice(0, historyIndex + 1);
        return [...sliced, newState];
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex]
  );

  // 3. Undo / Redo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const nextIdx = historyIndex - 1;
      setHistoryIndex(nextIdx);
      setEditorState(history[nextIdx]);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setEditorState(history[nextIdx]);
    }
  }, [history, historyIndex]);

  // 4. Keyboard shortcuts (Ctrl+Z, Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // 5. Smart Remaster (Photo Remaster / Auto Enhance)
  const handleSmartRemaster = () => {
    const remastered = applySmartRemaster(editorState, editorState.deviceMode);
    handleStateChange(remastered);
    toast.success(
      editorState.deviceMode === 'galaxy'
        ? '✨ 갤럭시 사진 리마스터가 적용되었습니다!'
        : '🪄 아이폰 자동 보정이 적용되었습니다!'
    );
  };

  // 6. AI Inpainting / Eraser
  const handleTriggerEraser = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas || !maskCanvasRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsAiProcessing(true);
    toast.info('AI 인페인팅 지우개 연산 중...');

    setTimeout(() => {
      try {
        applyAiInpaint(ctx, canvas.width, canvas.height, maskCanvasRef.current!);
        // Clear mask
        const mCtx = maskCanvasRef.current?.getContext('2d');
        if (mCtx) mCtx.clearRect(0, 0, canvas.width, canvas.height);

        // Turn off eraser mode
        handleStateChange({
          ...editorState,
          ai: { ...editorState.ai, eraserActive: false },
        });
        toast.success('선택한 영역이 깨끗하게 제거되었습니다!');
      } catch (err) {
        console.error(err);
        toast.error('AI 지우개 처리 중 오류가 발생했습니다.');
      } finally {
        setIsAiProcessing(false);
      }
    }, 100);
  };

  // 7. AI Background Removal
  const handleTriggerBgRemove = async () => {
    if (!imageSrc) return;

    if (editorState.ai.bgRemoved) {
      // Revert to original
      setImageSrc(originalSrcBackup);
      handleStateChange({
        ...editorState,
        ai: { ...editorState.ai, bgRemoved: false },
      });
      toast.success('원본 배경으로 복원되었습니다.');
      return;
    }

    setIsAiProcessing(true);
    toast.info('AI 배경 분리 모델 실행 중...');

    try {
      if (!originalSrcBackup) {
        setOriginalSrcBackup(imageSrc);
      }
      const res = await removeBackground(imageSrc, 'Xenova/modnet');
      setImageSrc(res.resultDataUrl);
      handleStateChange({
        ...editorState,
        ai: { ...editorState.ai, bgRemoved: true, bgMode: 'transparent' },
      });
      toast.success('AI 배경 누끼 따기가 완료되었습니다!');
    } catch (err) {
      console.error(err);
      toast.error('배경 분리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsAiProcessing(false);
    }
  };

  // 8. AI Upscale (2x, 4x)
  const handleTriggerUpscale = (factor: 1 | 2 | 4) => {
    if (!originalImage) return;

    setIsAiProcessing(true);
    toast.info(`${factor}x AI 초고해상도 업스케일링 적용 중...`);

    setTimeout(() => {
      const canvas = document.createElement('canvas');
      canvas.width = (originalImage.naturalWidth || originalImage.width) * factor;
      canvas.height = (originalImage.naturalHeight || originalImage.height) * factor;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
        setImageSrc(canvas.toDataURL('image/png'));
        handleStateChange({
          ...editorState,
          ai: { ...editorState.ai, upscaleFactor: factor },
        });
        toast.success(`${factor}x 해상도 향상이 완료되었습니다!`);
      }
      setIsAiProcessing(false);
    }, 300);
  };

  // 9. Reset All
  const handleResetAll = () => {
    handleStateChange(DEFAULT_EDITOR_STATE);
    toast.info('모든 보정 설정이 기본값으로 초기화되었습니다.');
  };

  // 10. File upload handler
  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      setOriginalSrcBackup(src);
      setImageSrc(src);
    };
    reader.readAsDataURL(file);
  };

  // 11. Sample selection
  const handleSelectSample = (url: string) => {
    setOriginalSrcBackup(url);
    setImageSrc(url);
  };

  // Hidden mask canvas used across editor components
  return (
    <DashboardContent
      disablePadding
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Offscreen Mask Canvas */}
      <canvas ref={maskCanvasRef} style={{ display: 'none' }} />

      {!imageSrc ? (
        /* 업로드 대기 화면 */
        <Box sx={{ p: { xs: 2, sm: 3 }, height: '100%', overflowY: 'auto' }}>
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
              갤럭시 & 아이폰 사진 편집 스튜디오
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              삼성 갤럭시 One UI & 애플 아이폰 iOS 감성 보정, 8채널 HSL, AI 지우개, 인물 리터칭을 한
              번에 경험하세요.
            </Typography>
          </Box>

          <PhotoUploadWorkspace
            sampleImages={EDITOR_SAMPLE_IMAGES}
            onSelectSample={handleSelectSample}
            onFileSelect={handleFileSelect}
            title="편집할 사진을 업로드하세요"
            subtitle="JPG, PNG, WebP 이미지를 드래그하거나 샘플을 클릭하여 즉시 테스트해 보세요."
            sampleTitle="⚡ 갤럭시 & 아이폰 감성 샷 샘플 테스트"
            sampleSubtitle="원하는 카메라 모드의 사진을 골라 1초 만에 스튜디오를 실행하세요."
          />
        </Box>
      ) : (
        /* 전체화면 전문 에디터 워크스페이스 */
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          {/* 상단 툴바 */}
          <EditorToolbar
            deviceMode={editorState.deviceMode}
            onDeviceModeChange={(mode: DeviceMode) =>
              handleStateChange({ ...editorState, deviceMode: mode })
            }
            onSmartRemaster={handleSmartRemaster}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            onUndo={handleUndo}
            onRedo={handleRedo}
            zoom={zoom}
            onZoomIn={() => setZoom((prev) => Math.min(3.0, prev + 0.15))}
            onZoomOut={() => setZoom((prev) => Math.max(0.2, prev - 0.15))}
            onFitScreen={() => setZoom(0.85)}
            isComparing={isComparing}
            onCompareToggle={() => setIsComparing((prev) => !prev)}
            onResetAll={handleResetAll}
            onOpenExport={() => setIsExportModalOpen(true)}
            onBackToUpload={() => setImageSrc('')}
          />

          {/* 중앙 작업 공간: 좌측 캔버스 + 우측 탭 사이드바 */}
          <Box sx={{ display: 'flex', flex: '1 1 auto', overflow: 'hidden', position: 'relative' }}>
            {/* AI 처리 중 인디케이터 오버레이 */}
            {isAiProcessing && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  bgcolor: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 99,
                  gap: 2,
                }}
              >
                <CircularProgress color="primary" size={48} />
                <Typography variant="subtitle1" sx={{ color: '#FFFFFF', fontWeight: 800 }}>
                  AI 신경망 분석 및 렌더링 중...
                </Typography>
              </Box>
            )}

            {/* 캔버스 뷰포트 */}
            <EditorCanvas
              originalImage={originalImage}
              state={editorState}
              currentTab={currentTab}
              zoom={zoom}
              setZoom={setZoom}
              isComparing={isComparing}
              onUpdateState={handleStateChange}
              maskCanvasRef={maskCanvasRef}
            />

            {/* 우측 10대 카테고리 패널 사이드바 */}
            <EditorSidebar
              currentTab={currentTab}
              onTabChange={setCurrentTab}
              state={editorState}
              onStateChange={handleStateChange}
              onTriggerEraser={handleTriggerEraser}
              onTriggerBgRemove={handleTriggerBgRemove}
              onTriggerUpscale={handleTriggerUpscale}
            />
          </Box>

          {/* 내보내기 다이얼로그 */}
          <EditorExportModal
            open={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            maskCanvasRef={maskCanvasRef}
            originalImage={originalImage}
          />
        </Box>
      )}
    </DashboardContent>
  );
}
