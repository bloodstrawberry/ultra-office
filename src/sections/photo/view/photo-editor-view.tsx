'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { removeBackground } from '../utils/ai-bg-remove';
import { EditorCanvas } from '../components/editor/editor-canvas';
import { EditorToolbar } from '../components/editor/editor-toolbar';
import { EditorSidebar } from '../components/editor/editor-sidebar';
import { EDITOR_SAMPLE_IMAGES } from '../components/editor/editor-presets';
import { EditorExportModal } from '../components/editor/editor-export-modal';
import { applyAiInpaint, applySmartRemaster } from '../components/editor/editor-processor';
import {
  downloadDataUrl,
  shareToKakaoTalk,
  renderGenericSplitComparisonImage,
} from '../utils/image-processor';
import {
  type DeviceMode,
  type TabCategory,
  DEFAULT_EDITOR_STATE,
  type PhotoEditorState,
} from '../components/editor/editor-types';
import {
  type SplitMode,
  PhotoUploadWorkspace,
  PhotoCompareViewport,
  type SplitOrientation,
  type ComparePreviewMode,
} from '../components';

// ----------------------------------------------------------------------

export function PhotoEditorView() {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [originalSrcBackup, setOriginalSrcBackup] = useState<string>('');

  // Master State & Current Tab
  const [editorState, setEditorState] = useState<PhotoEditorState>(DEFAULT_EDITOR_STATE);
  const [currentTab, setCurrentTab] = useState<TabCategory>('basic');
  const [zoom, setZoom] = useState<number>(0.85);
  const [previewMode, setPreviewMode] = useState<ComparePreviewMode>('split');
  const [splitOrientation, setSplitOrientation] = useState<SplitOrientation>('horizontal');
  const [splitMode, setSplitMode] = useState<SplitMode>('inside');
  const [splitStart, setSplitStart] = useState(25);
  const [splitEnd, setSplitEnd] = useState(75);
  const [resultDataUrl, setResultDataUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [rightPanelWidth, setRightPanelWidth] = useState(380);
  const resizeStartRef = useRef({ x: 0, width: 380 });
  const isResizingRef = useRef(false);
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
      setResultDataUrl('');
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
    const canvas = document.getElementById(
      'photo-editor-result-canvas'
    ) as HTMLCanvasElement | null;
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

  const handleRendered = useCallback((dataUrl: string) => setResultDataUrl(dataUrl), []);

  const handleSaveResult = async () => {
    if (!resultDataUrl) return;
    setIsSaving(true);
    try {
      const result = await downloadDataUrl(resultDataUrl, `photo_editor_${Date.now()}.png`);
      toast.success(result.message);
    } catch {
      toast.error('결과물 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSplit = async () => {
    if (!imageSrc || !resultDataUrl) return;
    setIsSaving(true);
    try {
      const comparison = await renderGenericSplitComparisonImage({
        originalSrc: imageSrc,
        resultSrc: resultDataUrl,
        splitStart,
        splitEnd,
        splitOrientation,
        splitMode,
      });
      await downloadDataUrl(comparison, `photo_editor_comparison_${Date.now()}.png`);
      toast.success('슬라이더 비교 상태 그대로 저장되었습니다.');
    } catch {
      toast.error('비교 상태 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (!resultDataUrl) return;
    setIsSaving(true);
    try {
      const result = await shareToKakaoTalk(
        resultDataUrl,
        '[Ultra Office] 갤럭시 & 아이폰 사진 편집',
        `photo_editor_${Date.now()}.png`
      );
      toast.success(result.message);
    } catch {
      toast.error('공유 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
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
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: { xs: 'auto', md: 'hidden' },
          }}
        >
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
            onResetAll={handleResetAll}
            onBackToUpload={() => setImageSrc('')}
          />

          {/* 중앙 작업 공간: 좌측 캔버스 + 우측 탭 사이드바 */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              flex: '1 1 auto',
              minHeight: 0,
              gap: { xs: 2, md: 0 },
              position: 'relative',
              overflow: { md: 'hidden' },
            }}
          >
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

            <Box
              sx={{
                flex: '1 1 0px',
                minWidth: 0,
                minHeight: { xs: 360, md: 0 },
                height: { xs: 420, md: '100%' },
                pr: { md: 1 },
                position: 'relative',
              }}
            >
              <Box sx={{ display: previewMode === 'single' ? 'flex' : 'none', height: '100%' }}>
                <EditorCanvas
                  originalImage={originalImage}
                  state={editorState}
                  currentTab={currentTab}
                  zoom={zoom}
                  setZoom={setZoom}
                  isComparing={false}
                  onUpdateState={handleStateChange}
                  maskCanvasRef={maskCanvasRef}
                  onRendered={handleRendered}
                />
              </Box>
              <Box sx={{ display: previewMode === 'split' ? 'flex' : 'none', height: '100%' }}>
                <PhotoCompareViewport
                  originalSrc={imageSrc}
                  resultSrc={resultDataUrl}
                  previewMode={previewMode}
                  onPreviewModeChange={setPreviewMode}
                  splitOrientation={splitOrientation}
                  onSplitOrientationChange={setSplitOrientation}
                  splitMode={splitMode}
                  onSplitModeChange={setSplitMode}
                  splitStart={splitStart}
                  onSplitStartChange={setSplitStart}
                  splitEnd={splitEnd}
                  onSplitEndChange={setSplitEnd}
                  bgStyle="neutral"
                />
              </Box>
              {previewMode === 'single' && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setPreviewMode('split')}
                  sx={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    zIndex: 2,
                    bgcolor: 'background.paper',
                  }}
                >
                  비교 슬라이더
                </Button>
              )}
            </Box>

            <Box
              onPointerDown={(e) => {
                e.preventDefault();
                e.currentTarget.setPointerCapture(e.pointerId);
                isResizingRef.current = true;
                resizeStartRef.current = { x: e.clientX, width: rightPanelWidth };
              }}
              onPointerMove={(e) => {
                if (isResizingRef.current) {
                  setRightPanelWidth(
                    Math.max(
                      280,
                      Math.min(
                        650,
                        resizeStartRef.current.width + resizeStartRef.current.x - e.clientX
                      )
                    )
                  );
                }
              }}
              onPointerUp={(e) => {
                isResizingRef.current = false;
                e.currentTarget.releasePointerCapture(e.pointerId);
              }}
              sx={{
                display: { xs: 'none', md: 'flex' },
                width: 16,
                flexShrink: 0,
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'col-resize',
                touchAction: 'none',
                '&:hover .divider-bar': { bgcolor: 'primary.main' },
              }}
            >
              <Box
                className="divider-bar"
                sx={{ width: 2, height: '100%', bgcolor: 'divider', borderRadius: 1 }}
              />
            </Box>

            <Box
              sx={{
                width: { xs: '100%', md: rightPanelWidth },
                flexShrink: 0,
                minHeight: 0,
                height: { xs: 'auto', md: '100%' },
                display: 'flex',
                flexDirection: 'column',
                gap: 1.25,
                pl: { md: 1 },
                pr: 0.5,
              }}
            >
              <Box sx={{ flex: '1 1 auto', minHeight: { xs: 480, md: 0 } }}>
                <EditorSidebar
                  width="100%"
                  currentTab={currentTab}
                  onTabChange={setCurrentTab}
                  state={editorState}
                  onStateChange={handleStateChange}
                  onTriggerEraser={handleTriggerEraser}
                  onTriggerBgRemove={handleTriggerBgRemove}
                  onTriggerUpscale={handleTriggerUpscale}
                />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.85, flexShrink: 0 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.85 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    size="small"
                    onClick={() => setImageSrc('')}
                    startIcon={<RefreshRoundedIcon sx={{ fontSize: 18 }} />}
                    sx={{ py: 0.75, borderRadius: 1.5, fontWeight: 600, fontSize: '0.8rem' }}
                  >
                    다른 사진
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    color="secondary"
                    size="small"
                    onClick={handleShare}
                    disabled={isSaving || !resultDataUrl}
                    startIcon={<ShareRoundedIcon sx={{ fontSize: 18 }} />}
                    sx={{ py: 0.75, borderRadius: 1.5, fontWeight: 600, fontSize: '0.8rem' }}
                  >
                    공유
                  </Button>
                </Box>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleSaveResult}
                  disabled={isSaving || !resultDataUrl}
                  startIcon={
                    isSaving ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <DownloadRoundedIcon />
                    )
                  }
                  sx={{ py: 1, borderRadius: 2, fontWeight: 700, fontSize: '0.88rem' }}
                >
                  결과물 저장
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={handleSaveSplit}
                  disabled={isSaving || !resultDataUrl}
                  startIcon={<CompareArrowsRoundedIcon sx={{ fontSize: 18 }} />}
                  sx={{ py: 0.65, borderRadius: 1.5, fontWeight: 600, fontSize: '0.78rem' }}
                >
                  비교 상태 저장 (Split View)
                </Button>
                <Button
                  fullWidth
                  variant="text"
                  size="small"
                  onClick={() => setIsExportModalOpen(true)}
                  disabled={!resultDataUrl}
                >
                  고급 내보내기
                </Button>
              </Box>
            </Box>
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
