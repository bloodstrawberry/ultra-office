'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import BrushRoundedIcon from '@mui/icons-material/BrushRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { PhotoUploadWorkspace } from 'src/sections/photo/components';

import { repairMaskedPixels, detectBottomRightLogo } from './logo-repair';
import { loadWebtoonSample, WEBTOON_SAMPLE_IMAGES } from './webtoon-samples';

type ImageInfo = { name: string; width: number; height: number };
type Point = { x: number; y: number };
type PanelTab = 'auto' | 'brush';

const PANEL_TABS: { id: PanelTab; label: string }[] = [
  { id: 'auto', label: '자동 제거' },
  { id: 'brush', label: '스팟 복구' },
];
const MAX_UNDO_STEPS = 20;
const MAX_UNDO_BYTES = 96 * 1024 * 1024;

function pointOnCanvas(
  event: React.PointerEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement
): Point {
  const bounds = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - bounds.left) / bounds.width) * canvas.width,
    y: ((event.clientY - bounds.top) / bounds.height) * canvas.height,
  };
}

export function WebtoonLogoRemoveView() {
  const previewRef = useRef<HTMLCanvasElement>(null);
  const maskRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const originalRef = useRef<HTMLCanvasElement | null>(null);
  const workingRef = useRef<HTMLCanvasElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<Point | null>(null);
  const undoStackRef = useRef<ImageData[]>([]);
  const dividerRef = useRef<{ startX: number; width: number } | null>(null);
  const [info, setInfo] = useState<ImageInfo | null>(null);
  const [activeTab, setActiveTab] = useState<PanelTab>('auto');
  const [rightPanelWidth, setRightPanelWidth] = useState(380);
  const [brushSize, setBrushSize] = useState(32);
  const [sensitivity, setSensitivity] = useState(13);
  const [showOriginal, setShowOriginal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [hasUndo, setHasUndo] = useState(false);

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    []
  );

  useEffect(() => {
    const preview = previewRef.current;
    const mask = maskRef.current;
    const source = showOriginal ? originalRef.current : workingRef.current;
    if (!info || !preview || !mask || !source) return;
    preview.width = info.width;
    preview.height = info.height;
    mask.width = info.width;
    mask.height = info.height;
    preview.getContext('2d')?.drawImage(source, 0, 0);
  }, [info, showOriginal]);

  const paintPreview = () => {
    const preview = previewRef.current;
    const source = showOriginal ? originalRef.current : workingRef.current;
    if (preview && source) preview.getContext('2d')?.drawImage(source, 0, 0);
  };

  const loadFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일을 선택해 주세요.');
      return;
    }
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = url;
      const original = document.createElement('canvas');
      original.width = image.naturalWidth;
      original.height = image.naturalHeight;
      original.getContext('2d')?.drawImage(image, 0, 0);
      const working = document.createElement('canvas');
      working.width = original.width;
      working.height = original.height;
      working.getContext('2d')?.drawImage(original, 0, 0);
      originalRef.current = original;
      workingRef.current = working;
      undoStackRef.current = [];
      setHasUndo(false);
      setShowOriginal(false);
      setActiveTab('auto');
      setInfo({ name: file.name, width: original.width, height: original.height });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      toast.error('이미지를 열지 못했습니다.');
    };
    image.src = url;
  };

  const applyMask = (mask: Uint8Array, label: string) => {
    const working = workingRef.current;
    const context = working?.getContext('2d', { willReadFrequently: true });
    if (!working || !context) return;
    try {
      const before = context.getImageData(0, 0, working.width, working.height);
      const result = repairMaskedPixels(before, mask);
      context.putImageData(result, 0, 0);
      undoStackRef.current.push(before);
      let bytes = undoStackRef.current.reduce((sum, item) => sum + item.data.byteLength, 0);
      while (
        undoStackRef.current.length > 1 &&
        (undoStackRef.current.length > MAX_UNDO_STEPS || bytes > MAX_UNDO_BYTES)
      ) {
        bytes -= undoStackRef.current.shift()!.data.byteLength;
      }
      setHasUndo(true);
      paintPreview();
      toast.success(label);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '이미지를 복구하지 못했습니다.');
    }
  };

  const removeAuto = () => {
    const working = workingRef.current;
    const context = working?.getContext('2d', { willReadFrequently: true });
    if (!working || !context || busy) return;
    setShowOriginal(false);
    setBusy(true);
    window.setTimeout(() => {
      try {
        const pixels = context.getImageData(0, 0, working.width, working.height);
        const detected = detectBottomRightLogo(pixels, sensitivity);
        if (!detected) {
          toast.info(
            '오른쪽 아래에서 밝은 로고를 찾지 못했습니다. 스팟 복구 브러시로 직접 칠해 주세요.'
          );
          return;
        }
        applyMask(detected.mask, '오른쪽 아래 로고 영역을 복구했습니다.');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : '자동 복구에 실패했습니다.');
      } finally {
        setBusy(false);
      }
    }, 30);
  };

  const stamp = (point: Point) => {
    const mask = maskRef.current;
    const context = mask?.getContext('2d');
    if (!context) return;
    context.fillStyle = 'rgba(239, 68, 68, 0.65)';
    context.beginPath();
    context.arc(point.x, point.y, brushSize / 2, 0, Math.PI * 2);
    context.fill();
  };

  const finishStroke = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    lastPointRef.current = null;
    const maskCanvas = maskRef.current;
    const context = maskCanvas?.getContext('2d', { willReadFrequently: true });
    if (!maskCanvas || !context) return;
    const pixels = context.getImageData(0, 0, maskCanvas.width, maskCanvas.height).data;
    const mask = new Uint8Array(maskCanvas.width * maskCanvas.height);
    for (let index = 0; index < mask.length; index++)
      mask[index] = pixels[index * 4 + 3] > 20 ? 1 : 0;
    context.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    setBusy(true);
    window.setTimeout(() => {
      applyMask(mask, '칠한 부분을 주변 배경으로 복구했습니다.');
      setBusy(false);
    }, 30);
  };

  const reset = () => {
    const original = originalRef.current;
    const working = workingRef.current;
    if (!original || !working || busy) return;
    working.getContext('2d')?.drawImage(original, 0, 0);
    maskRef.current?.getContext('2d')?.clearRect(0, 0, working.width, working.height);
    undoStackRef.current = [];
    setHasUndo(false);
    setShowOriginal(false);
    paintPreview();
  };

  const undo = useCallback(() => {
    const working = workingRef.current;
    if (!working || busy) return;
    const previous = undoStackRef.current.pop();
    if (!previous) return;
    working.getContext('2d')?.putImageData(previous, 0, 0);
    setHasUndo(undoStackRef.current.length > 0);
    setShowOriginal(false);
    previewRef.current?.getContext('2d')?.drawImage(working, 0, 0);
  }, [busy]);

  useEffect(() => {
    if (!info) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing || event.key.toLowerCase() !== 'z') return;
      if ((!event.ctrlKey && !event.metaKey) || event.shiftKey || event.altKey) return;
      const target = event.target;
      const editableInput =
        target instanceof HTMLInputElement &&
        !['range', 'checkbox', 'radio', 'button', 'file'].includes(target.type);
      if (
        editableInput ||
        (target instanceof HTMLElement &&
          (target.isContentEditable ||
            target.closest('textarea, select, [contenteditable], [role="textbox"]')))
      )
        return;
      if (busy || undoStackRef.current.length === 0) return;
      event.preventDefault();
      undo();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [info, busy, undo]);

  const download = () => {
    const working = workingRef.current;
    if (!working || busy) return;
    working.toBlob((blob) => {
      if (!blob) {
        toast.error('PNG 파일을 만들지 못했습니다.');
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${info?.name.replace(/\.[^.]+$/, '') || 'webtoon'}_logo_removed.png`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    }, 'image/png');
  };

  return (
    <DashboardContent
      maxWidth={false}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: {
          xs: 'calc(100dvh - var(--layout-header-mobile-height))',
          md: 'calc(100dvh - var(--layout-header-desktop-height))',
        },
        minHeight: 0,
        overflow: 'hidden',
        pb: { xs: 2, sm: 3 },
      }}
    >
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          웹툰 로고 지우기 스튜디오
        </Typography>
        <Typography variant="body2" color="text.secondary">
          오른쪽 아래의 제미나이 로고를 자동으로 찾거나, 스팟 복구 브러시로 직접 쓸어 지우세요.
        </Typography>
      </Box>

      {!info ? (
        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <PhotoUploadWorkspace
            sampleImages={WEBTOON_SAMPLE_IMAGES}
            onSelectSample={(url) => {
              void loadWebtoonSample(url)
                .then(loadFile)
                .catch(() => toast.error('예시 이미지를 불러오지 못했습니다.'));
            }}
            onFileSelect={loadFile}
            title="웹툰 이미지 업로드"
            subtitle="오른쪽 아래에 로고가 있는 이미지를 올려주세요."
            icon={<AutoFixHighRoundedIcon sx={{ fontSize: 36 }} />}
          />
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            flex: 1,
            minHeight: 0,
            gap: { xs: 2, md: 0 },
            height: '100%',
            position: 'relative',
            overflowY: { xs: 'auto', md: 'hidden' },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: '1 1 0px',
              minWidth: 0,
              minHeight: 0,
              height: '100%',
              pr: { md: 1 },
            }}
          >
            <Card
              sx={{
                flex: '1 1 auto',
                minWidth: 0,
                height: '100%',
                minHeight: { xs: 420, md: 0 },
                p: { xs: 1.5, sm: 2 },
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100'),
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                  mb: 1.5,
                  flexShrink: 0,
                  flexWrap: 'wrap',
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    size="small"
                    label={`원본 ${info.width} × ${info.height}px`}
                    variant="outlined"
                    sx={{ fontWeight: 600, fontSize: '0.72rem' }}
                  />
                  {showOriginal && (
                    <Chip size="small" label="원본 보기" color="info" variant="soft" />
                  )}
                </Stack>
                <Stack direction="row" spacing={0.5}>
                  <Button
                    size="small"
                    variant="text"
                    startIcon={<UndoRoundedIcon />}
                    onClick={undo}
                    disabled={!hasUndo || busy}
                    aria-label="한 단계 취소 Ctrl+Z"
                  >
                    취소
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => setShowOriginal((current) => !current)}
                    disabled={busy}
                  >
                    {showOriginal ? '결과 보기' : '원본 비교'}
                  </Button>
                </Stack>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  overflow: 'auto',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  p: 1,
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: info.width,
                    maxWidth: '100%',
                    lineHeight: 0,
                    boxShadow: '0 4px 20px rgba(0,0,0,.2)',
                  }}
                >
                  <canvas
                    ref={previewRef}
                    aria-label="로고 복구 이미지"
                    style={{ display: 'block', width: '100%', height: 'auto' }}
                  />
                  <canvas
                    ref={maskRef}
                    aria-label="스팟 복구 브러시 영역"
                    onPointerDown={(event) => {
                      if (busy || showOriginal) return;
                      event.currentTarget.setPointerCapture(event.pointerId);
                      drawingRef.current = true;
                      const point = pointOnCanvas(event, event.currentTarget);
                      lastPointRef.current = point;
                      stamp(point);
                    }}
                    onPointerMove={(event) => {
                      if (!drawingRef.current) return;
                      const point = pointOnCanvas(event, event.currentTarget);
                      const previous = lastPointRef.current;
                      const context = event.currentTarget.getContext('2d');
                      if (previous && context) {
                        context.strokeStyle = 'rgba(239, 68, 68, 0.65)';
                        context.lineWidth = brushSize;
                        context.lineCap = 'round';
                        context.lineJoin = 'round';
                        context.beginPath();
                        context.moveTo(previous.x, previous.y);
                        context.lineTo(point.x, point.y);
                        context.stroke();
                      }
                      stamp(point);
                      lastPointRef.current = point;
                    }}
                    onPointerUp={finishStroke}
                    onPointerCancel={finishStroke}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      touchAction: 'none',
                      cursor: showOriginal || busy ? 'default' : 'crosshair',
                    }}
                  />
                </Box>
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                textAlign="center"
                sx={{ mt: 1, flexShrink: 0, fontSize: '0.72rem' }}
              >
                로고 위를 칠하고 손을 떼면 복구됩니다. Ctrl+Z로 이전 작업을 취소할 수 있습니다.
              </Typography>
            </Card>
          </Box>

          <Box
            onPointerDown={(event) => {
              event.preventDefault();
              event.currentTarget.setPointerCapture(event.pointerId);
              dividerRef.current = { startX: event.clientX, width: rightPanelWidth };
            }}
            onPointerMove={(event) => {
              const drag = dividerRef.current;
              if (drag)
                setRightPanelWidth(
                  Math.max(300, Math.min(650, drag.width + drag.startX - event.clientX))
                );
            }}
            onPointerUp={() => {
              dividerRef.current = null;
            }}
            onPointerCancel={() => {
              dividerRef.current = null;
            }}
            sx={{
              display: { xs: 'none', md: 'flex' },
              width: 16,
              flexShrink: 0,
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'col-resize',
              userSelect: 'none',
              touchAction: 'none',
              '&:hover .divider-bar': { bgcolor: 'primary.main', width: '3px' },
            }}
          >
            <Box
              className="divider-bar"
              sx={{ width: '2px', height: '100%', bgcolor: 'divider', borderRadius: '1px' }}
            />
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: { xs: '100%', md: `${rightPanelWidth}px` },
              minWidth: { md: `${rightPanelWidth}px` },
              maxWidth: { md: `${rightPanelWidth}px` },
              flexShrink: 0,
              gap: 1.25,
              minHeight: 0,
              height: '100%',
              overflow: { xs: 'auto', md: 'hidden' },
              pl: { md: 1 },
              pr: 0.5,
            }}
          >
            <Card
              sx={{
                p: { xs: 1.75, sm: 2 },
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                flex: '1 1 auto',
                minHeight: 0,
                height: '100%',
              }}
            >
              <input
                ref={fileRef}
                hidden
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) loadFile(file);
                  event.target.value = '';
                }}
              />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75, flexShrink: 0 }}>
                로고 지우기 컨트롤
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.25, flexShrink: 0 }}>
                {PANEL_TABS.map((tab) => (
                  <Chip
                    key={tab.id}
                    label={tab.label}
                    size="small"
                    clickable
                    color={activeTab === tab.id ? 'primary' : 'default'}
                    variant={activeTab === tab.id ? 'filled' : 'outlined'}
                    onClick={() => setActiveTab(tab.id)}
                    sx={{ fontWeight: 600, fontSize: '0.72rem', height: 26 }}
                  />
                ))}
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: '1 1 0px',
                  minHeight: 0,
                  overflowY: 'auto',
                  pr: 0.5,
                  mb: 1.25,
                  '&::-webkit-scrollbar': { width: '5px' },
                  '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: '3px' },
                }}
              >
                {activeTab === 'auto' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                    <Typography variant="body2" color="text.secondary">
                      오른쪽 아래의 밝은 제미나이 로고를 찾아 주변 배경으로 자연스럽게 복구합니다.
                    </Typography>
                    <Button
                      fullWidth
                      variant="contained"
                      disabled={busy}
                      startIcon={
                        busy ? (
                          <CircularProgress size={18} color="inherit" />
                        ) : (
                          <AutoFixHighRoundedIcon />
                        )
                      }
                      onClick={removeAuto}
                    >
                      오른쪽 아래 로고 자동 지우기
                    </Button>
                    <Box>
                      <Typography variant="body2">자동 감지 민감도 {sensitivity}</Typography>
                      <Slider
                        size="small"
                        min={8}
                        max={30}
                        value={sensitivity}
                        onChange={(_, value) => setSensitivity(value as number)}
                        aria-label="자동 감지 민감도"
                        valueLabelDisplay="auto"
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      로고가 감지되지 않으면 민감도를 낮추거나 스팟 복구 탭에서 직접 칠해 주세요.
                    </Typography>
                  </Box>
                )}
                {activeTab === 'brush' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <BrushRoundedIcon fontSize="small" />
                      <Typography variant="subtitle2" fontWeight={700}>
                        스팟 복구 브러시
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      왼쪽 캔버스에서 로고 위를 쓱 칠하세요. 손을 떼면 칠한 부분이 복구됩니다.
                    </Typography>
                    <Box>
                      <Typography variant="body2">브러시 크기 {brushSize}px</Typography>
                      <Slider
                        size="small"
                        min={8}
                        max={180}
                        value={brushSize}
                        onChange={(_, value) => setBrushSize(value as number)}
                        aria-label="스팟 복구 브러시 크기"
                        valueLabelDisplay="auto"
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      한 번에 작은 영역을 칠하면 더 자연스럽게 복구됩니다.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Card>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.85, flexShrink: 0 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.85 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  size="small"
                  onClick={() => fileRef.current?.click()}
                  disabled={busy}
                  startIcon={<AddPhotoAlternateRoundedIcon sx={{ fontSize: 18 }} />}
                  sx={{ py: 0.75, borderRadius: 1.5, fontWeight: 600, fontSize: '0.8rem' }}
                >
                  다른 사진
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  size="small"
                  onClick={reset}
                  disabled={busy}
                  startIcon={<RefreshRoundedIcon sx={{ fontSize: 18 }} />}
                  sx={{ py: 0.75, borderRadius: 1.5, fontWeight: 600, fontSize: '0.8rem' }}
                >
                  원본 복원
                </Button>
              </Box>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={download}
                disabled={busy}
                startIcon={<DownloadRoundedIcon />}
                sx={{ py: 1, borderRadius: 2, fontWeight: 700, fontSize: '0.88rem' }}
              >
                결과물 저장 (PNG)
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </DashboardContent>
  );
}
