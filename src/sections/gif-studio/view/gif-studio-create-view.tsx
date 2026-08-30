'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Menu from '@mui/material/Menu';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import ToggleButton from '@mui/material/ToggleButton';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CircularProgress from '@mui/material/CircularProgress';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import SkipPreviousRoundedIcon from '@mui/icons-material/SkipPreviousRounded';
import MovieCreationRoundedIcon from '@mui/icons-material/MovieCreationRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

import { GifSampleSection } from '../components/gif-sample-section';
import { GifStudioNavHeader } from '../components/gif-studio-nav-header';
import { GIF_SAMPLE_LIST, type GifSampleItem, fetchSampleGifFile } from '../data/gif-samples';
import {
  loadImage,
  formatBytes,
  downloadDataUrl,
  extractGifFrames,
  convertGifToVideo,
  getDataUrlByteSize,
  createGifFromImages,
} from '../utils/gif-processor';

// ----------------------------------------------------------------------

export interface CreateClipItem {
  id: string;
  name: string;
  src: string;
  duration: number; // duration in seconds
  rotation: number; // 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
  filter: string; // 'none' | 'grayscale' | 'sepia' | 'vintage' | 'cyberpunk' | 'pixel' | 'glitch' | 'invert' | 'warm' | 'cool'
}

// ----------------------------------------------------------------------

export function GifStudioCreateView() {
  const [createImages, setCreateImages] = useState<CreateClipItem[]>([]);
  const [selectedCreateClipId, setSelectedCreateClipId] = useState<string | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'clip' | 'text' | 'fx' | 'export'>('clip');
  const [aspectRatioPreset, setAspectRatioPreset] = useState<
    '1:1' | '16:9' | '9:16' | '4:3' | 'custom'
  >('1:1');
  const [fps, setFps] = useState<number>(10);
  const [fitMode, setFitMode] = useState<'contain' | 'cover' | 'stretch'>('contain');
  const [createBgColor, setCreateBgColor] = useState<string>('transparent');
  const [targetWidth, setTargetWidth] = useState<number>(480);
  const [targetHeight, setTargetHeight] = useState<number>(480);
  const [loopMode, setLoopMode] = useState<'normal' | 'reverse' | 'boomerang'>('normal');
  const [overlayText, setOverlayText] = useState<string>('');
  const [fontSize, setFontSize] = useState<number>(28);
  const [fontColor, setFontColor] = useState<string>('#ffffff');
  const [fontBgColor, setFontBgColor] = useState<string>('rgba(0,0,0,0.5)');
  const [textPosition, setTextPosition] = useState<
    'top' | 'center' | 'bottom' | 'top-left' | 'bottom-right'
  >('bottom');
  const [textApplyScope, setTextApplyScope] = useState<'all' | 'selected'>('all');
  const [sampleInterval, setSampleInterval] = useState<number>(10);

  const [createResultUrl, setCreateResultUrl] = useState<string>('');
  const [createMp4Url, setCreateMp4Url] = useState<string>('');
  const [createMp4Size, setCreateMp4Size] = useState<number>(0);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isConvertingMp4, setIsConvertingMp4] = useState<boolean>(false);
  const [createProgress, setCreateProgress] = useState<number>(0);

  const [previewFrameIndex, setPreviewFrameIndex] = useState<number>(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(true);
  const [loadingSampleId, setLoadingSampleId] = useState<string | null>(null);
  const [sampleMenuAnchorEl, setSampleMenuAnchorEl] = useState<null | HTMLElement>(null);

  // Resizable Right Panel
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(380);
  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(380);

  const createFileInputRef = useRef<HTMLInputElement>(null);
  const timelineScrollRef = useRef<HTMLDivElement>(null);

  const handleDividerPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isResizingRef.current = true;
    resizeStartXRef.current = e.clientX;
    resizeStartWidthRef.current = rightPanelWidth;
  };

  const handleDividerPointerMove = (e: React.PointerEvent) => {
    if (!isResizingRef.current) return;
    const deltaX = resizeStartXRef.current - e.clientX;
    const newWidth = Math.max(280, Math.min(680, resizeStartWidthRef.current + deltaX));
    setRightPanelWidth(newWidth);
  };

  const handleDividerPointerUp = (e: React.PointerEvent) => {
    if (isResizingRef.current) {
      isResizingRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  // Selected Clip Helper
  const selectedCreateClip =
    createImages.find((c) => c.id === selectedCreateClipId) ||
    createImages[previewFrameIndex] ||
    createImages[0];

  // Dynamic Timeline Playback based on frame durations
  useEffect(() => {
    if (!isPlayingPreview || createImages.length <= 1) return undefined;
    const currentClip = createImages[previewFrameIndex];
    const durationMs = currentClip
      ? Math.max(20, Math.round(currentClip.duration * 1000))
      : Math.round(1000 / Math.max(1, fps));
    const timer = setTimeout(() => {
      setPreviewFrameIndex((prev) => (prev + 1) % createImages.length);
    }, durationMs);
    return () => clearTimeout(timer);
  }, [isPlayingPreview, createImages, previewFrameIndex, fps]);

  // Total Duration Calculation
  const totalCreateDurationSec = createImages.reduce((sum, c) => sum + (c.duration || 0.1), 0);

  // Add files to create timeline
  const addCreateFiles = useCallback(
    (files: File[]) => {
      if (files.length === 0) return;
      const defaultDurationSec = 1 / Math.max(1, fps);
      const newItems: CreateClipItem[] = [];
      let count = 0;

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const src = evt.target?.result as string;
          if (src) {
            newItems.push({
              id: `clip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              name: file.name,
              src,
              duration: defaultDurationSec,
              rotation: 0,
              flipH: false,
              flipV: false,
              filter: 'none',
            });
          }
          count += 1;
          if (count === files.length) {
            setCreateImages((prev) => {
              const updated = [...prev, ...newItems];
              if (!selectedCreateClipId && updated.length > 0) {
                setSelectedCreateClipId(updated[0].id);
              }
              return updated;
            });
            toast.success(`${newItems.length}장의 사진이 타임라인에 추가되었습니다.`);
          }
        };
        reader.readAsDataURL(file);
      });
    },
    [fps, selectedCreateClipId]
  );

  const createDrop = useImageDropPaste({
    onFiles: addCreateFiles,
    multiple: true,
    disabled: false,
  });

  const handleSelectCreateSample = async (sample: GifSampleItem) => {
    setLoadingSampleId(sample.id);
    toast.info(`'${sample.label}' 예시 파일의 프레임을 추출하고 있습니다...`);
    try {
      const file = await fetchSampleGifFile(sample);
      const res = await extractGifFrames(file);
      const newItems: CreateClipItem[] = res.frames.map((frame, idx) => ({
        id: `sample_${sample.id}_${Date.now()}_${idx}`,
        name: `${sample.filename.replace(/\.[^/.]+$/, '')}_#${idx + 1}`,
        src: frame.dataUrl,
        duration: (frame.delay || 100) / 1000,
        rotation: 0,
        flipH: false,
        flipV: false,
        filter: 'none',
      }));
      setCreateImages(newItems);
      if (newItems.length > 0) {
        setSelectedCreateClipId(newItems[0].id);
      }
      setCreateResultUrl('');
      toast.success(`'${sample.label}'에서 ${newItems.length}개 프레임을 불러왔습니다!`);
    } catch {
      toast.error('예시 GIF 프레임 추출에 실패했습니다.');
    } finally {
      setLoadingSampleId(null);
    }
  };

  // Clip manipulation handlers
  const handleUpdateCreateClip = (id: string, partial: Partial<CreateClipItem>) => {
    setCreateImages((prev) => prev.map((c) => (c.id === id ? { ...c, ...partial } : c)));
  };

  const handleApplyDurationToAll = (durationSec: number) => {
    setCreateImages((prev) => prev.map((c) => ({ ...c, duration: durationSec })));
    toast.success(`모든 클립의 재생 시간이 ${durationSec}초로 일괄 적용되었습니다.`);
  };

  const handleApplyFilterToAll = (filterName: string) => {
    setCreateImages((prev) => prev.map((c) => ({ ...c, filter: filterName })));
    toast.success(`모든 클립에 '${filterName}' 필터가 일괄 적용되었습니다.`);
  };

  const handleMoveCreateClip = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= createImages.length) return;
    setCreateImages((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIdx];
      next[targetIdx] = temp;
      return next;
    });
    setPreviewFrameIndex(targetIdx);
  };

  const handleDuplicateCreateClip = (id: string) => {
    const idx = createImages.findIndex((c) => c.id === id);
    if (idx === -1) return;
    const orig = createImages[idx];
    const dupe: CreateClipItem = {
      ...orig,
      id: `clip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: `${orig.name} (복제)`,
    };
    setCreateImages((prev) => {
      const next = [...prev];
      next.splice(idx + 1, 0, dupe);
      return next;
    });
    setSelectedCreateClipId(dupe.id);
    setPreviewFrameIndex(idx + 1);
    toast.success('클립이 복제되었습니다.');
  };

  const handleDeleteCreateClip = (id: string) => {
    setCreateImages((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (selectedCreateClipId === id && next.length > 0) {
        setSelectedCreateClipId(next[0].id);
      }
      return next;
    });
    setPreviewFrameIndex((prev) => Math.max(0, Math.min(prev, createImages.length - 2)));
    toast.info('클립이 삭제되었습니다.');
  };

  const handleSplitCreateClip = (id: string) => {
    const idx = createImages.findIndex((c) => c.id === id);
    if (idx === -1) return;
    const orig = createImages[idx];
    const halfDuration = Math.max(0.04, Number((orig.duration / 2).toFixed(2)));
    const part1: CreateClipItem = { ...orig, duration: halfDuration };
    const part2: CreateClipItem = {
      ...orig,
      id: `clip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      duration: halfDuration,
      name: `${orig.name} (Part 2)`,
    };
    setCreateImages((prev) => {
      const next = [...prev];
      next.splice(idx, 1, part1, part2);
      return next;
    });
    toast.success('클립 지속시간이 2개로 분할되었습니다.');
  };

  const handleBatchSpeedMultiplier = (multiplier: number) => {
    setCreateImages((prev) =>
      prev.map((c) => ({
        ...c,
        duration: Math.max(0.02, Number((c.duration / multiplier).toFixed(2))),
      }))
    );
    toast.success(`전체 재생 속도가 ${multiplier}배속으로 변경되었습니다.`);
  };

  // Preset Ratio Changer
  const handleChangeAspectRatio = (preset: '1:1' | '16:9' | '9:16' | '4:3' | 'custom') => {
    setAspectRatioPreset(preset);
    if (preset === '1:1') {
      setTargetWidth(480);
      setTargetHeight(480);
    } else if (preset === '16:9') {
      setTargetWidth(640);
      setTargetHeight(360);
    } else if (preset === '9:16') {
      setTargetWidth(360);
      setTargetHeight(640);
    } else if (preset === '4:3') {
      setTargetWidth(480);
      setTargetHeight(360);
    }
  };

  // High Quality GIF Generation
  const handleGenerateGif = async () => {
    if (createImages.length < 2) {
      toast.error('GIF 생성을 위해 최소 2개 이상의 클립/사진이 필요합니다.');
      return;
    }

    setIsCreating(true);
    setCreateProgress(0);
    toast.info('스튜디오 타임라인 렌더링 중입니다. 잠시만 기다려주세요...');

    try {
      const processedImages: Array<{ src: string; duration: number }> = [];

      for (let i = 0; i < createImages.length; i += 1) {
        const item = createImages[i];
        const img = await loadImage(item.src);
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          let filterStr = '';
          if (item.filter === 'grayscale') filterStr = 'grayscale(100%)';
          else if (item.filter === 'sepia') filterStr = 'sepia(80%)';
          else if (item.filter === 'vintage')
            filterStr = 'sepia(50%) contrast(120%) brightness(90%)';
          else if (item.filter === 'cyberpunk')
            filterStr = 'hue-rotate(180deg) saturate(180%) contrast(130%)';
          else if (item.filter === 'invert') filterStr = 'invert(100%)';
          else if (item.filter === 'warm') filterStr = 'sepia(30%) saturate(140%)';
          else if (item.filter === 'cool') filterStr = 'hue-rotate(190deg) saturate(120%)';

          ctx.filter = filterStr || 'none';

          ctx.translate(canvas.width / 2, canvas.height / 2);
          if (item.rotation) ctx.rotate((item.rotation * Math.PI) / 180);
          ctx.scale(item.flipH ? -1 : 1, item.flipV ? -1 : 1);
          ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2);
          ctx.filter = 'none';

          processedImages.push({
            src: canvas.toDataURL('image/png'),
            duration: item.duration || 0.1,
          });
        } else {
          processedImages.push({
            src: item.src,
            duration: item.duration || 0.1,
          });
        }
      }

      const gifUrl = await createGifFromImages({
        images: processedImages,
        width: targetWidth,
        height: targetHeight,
        fitMode,
        bgColor: createBgColor,
        fps,
        sampleInterval,
        loopMode,
        textOverlay: overlayText.trim()
          ? {
              text: overlayText,
              fontSize,
              fontColor,
              position: textPosition,
            }
          : undefined,
        progressCallback: (p: number) => setCreateProgress(p),
      });

      setCreateResultUrl(gifUrl);
      toast.success('고화질 움짤(GIF) 생성이 완료되었습니다!');
    } catch {
      toast.error('GIF 생성에 실패했습니다.');
    } finally {
      setIsCreating(false);
    }
  };

  // Convert rendered GIF to MP4 Video
  const handleConvertToMp4 = async () => {
    if (!createResultUrl) return;
    setIsConvertingMp4(true);
    toast.info('MP4 비디오로 인코딩 중입니다...');
    try {
      const blob = await fetch(createResultUrl).then((r) => r.blob());
      const res = await convertGifToVideo(blob, {
        targetFormat: 'mp4',
        fps: 30,
        bitrate: 2500000,
      });
      setCreateMp4Url(res.videoUrl);
      setCreateMp4Size(res.size);
      toast.success('MP4 비디오 변환이 완료되었습니다!');
    } catch {
      toast.error('MP4 변환 중 오류가 발생했습니다.');
    } finally {
      setIsConvertingMp4(false);
    }
  };

  return (
    <DashboardContent
      sx={{
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        height: '100%',
        pb: { xs: 2, sm: 3 },
      }}
    >
      <GifStudioNavHeader currentTab="create" />

      <input
        ref={createFileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          addCreateFiles(files);
          if (e.target) e.target.value = '';
        }}
        style={{ display: 'none' }}
      />

      {createImages.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 2, sm: 2.5 },
            flex: '1 1 auto',
            minHeight: 0,
            height: '100%',
            overflowY: 'auto',
          }}
        >
          <GifSampleSection
            onSelectSample={handleSelectCreateSample}
            loadingSampleId={loadingSampleId}
            isLoading={isCreating || !!loadingSampleId}
            title="⚡ 즉석 테스트 예시 GIF 파일"
            subtitle="클릭 한 번으로 3종의 고화질 예시 움짤을 분해하여 프레임 편집을 즉시 시작하세요."
            actionLabel="프레임 불러오기 ➜"
          />

          <Card
            {...createDrop.getRootProps({
              onClick: () => createFileInputRef.current?.click(),
            })}
            sx={{
              p: { xs: 3, sm: 5 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 3,
              flex: '1 1 auto',
              minHeight: 180,
              transition: 'all 0.2s',
              '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                bgcolor: 'primary.lighter',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <MovieCreationRoundedIcon sx={{ fontSize: 40 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              움짤(GIF)로 제작할 여러 장의 사진 업로드
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              사진을 드래그하거나 클릭하여 타임라인 스튜디오에 추가하세요 (멀티트랙 · 프레임별 시간
              조절 · 자막 · 필터)
            </Typography>
            <Button variant="contained" color="primary" startIcon={<CloudUploadRoundedIcon />}>
              사진 선택하여 스튜디오 열기
            </Button>
          </Card>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: '1 1 auto',
            minHeight: 0,
            height: '100%',
            overflow: 'hidden',
            gap: 1.5,
          }}
        >
          {/* UPPER SECTION: Video Monitor (Left) & Inspector (Right) */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', lg: 'row' },
              flex: '1 1 0px',
              minHeight: 0,
              gap: 1.5,
              overflow: 'hidden',
            }}
          >
            {/* 1. Left: Filmora Video Monitor */}
            <Card
              sx={{
                flex: '1 1 0px',
                minWidth: 0,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                bgcolor: '#0a0f1d',
                borderColor: 'rgba(255,255,255,0.08)',
                overflow: 'hidden',
                p: 1.5,
              }}
            >
              {/* Monitor Top Toolbar */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  pb: 1,
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  flexShrink: 0,
                }}
              >
                {/* Ratio Presets */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: '#94a3b8', fontWeight: 700, fontSize: '0.72rem' }}
                  >
                    화면 비율:
                  </Typography>
                  <ToggleButtonGroup
                    size="small"
                    value={aspectRatioPreset}
                    exclusive
                    onChange={(_, v) => v && handleChangeAspectRatio(v)}
                    sx={{
                      height: 26,
                      '& .MuiToggleButton-root': {
                        px: 1,
                        py: 0,
                        fontSize: '0.7rem',
                        color: '#94a3b8',
                        borderColor: 'rgba(255,255,255,0.15)',
                        '&.Mui-selected': { bgcolor: 'primary.main', color: '#ffffff' },
                      },
                    }}
                  >
                    <ToggleButton value="1:1">1:1</ToggleButton>
                    <ToggleButton value="16:9">16:9</ToggleButton>
                    <ToggleButton value="9:16">9:16</ToggleButton>
                    <ToggleButton value="4:3">4:3</ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                {/* Timecode & Frame Counter Badge */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={`프레임 ${previewFrameIndex + 1} / ${createImages.length}`}
                    size="small"
                    sx={{
                      height: 22,
                      bgcolor: 'rgba(56, 189, 248, 0.15)',
                      color: '#38bdf8',
                      fontWeight: 700,
                      fontSize: '0.7rem',
                    }}
                  />
                  <Chip
                    label={`${createImages
                      .slice(0, previewFrameIndex + 1)
                      .reduce((s, c) => s + (c.duration || 0.1), 0)
                      .toFixed(2)}s / ${totalCreateDurationSec.toFixed(2)}s`}
                    size="small"
                    sx={{
                      height: 22,
                      bgcolor: 'rgba(255,255,255,0.08)',
                      color: '#f8fafc',
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      fontFamily: 'monospace',
                    }}
                  />
                </Box>
              </Box>

              {/* Monitor Viewport Screen */}
              <Box
                sx={{
                  flex: '1 1 auto',
                  minHeight: 0,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#050811',
                  borderRadius: 2,
                  my: 1,
                  overflow: 'hidden',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)',
                }}
              >
                {createResultUrl ? (
                  <img
                    src={createResultUrl}
                    alt="GIF Output"
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  createImages[previewFrameIndex] && (
                    <Box
                      sx={{
                        position: 'relative',
                        maxWidth: '100%',
                        maxHeight: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <img
                        src={createImages[previewFrameIndex].src}
                        alt="preview frame"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                          transform: `rotate(${createImages[previewFrameIndex].rotation || 0}deg) scale(${
                            createImages[previewFrameIndex].flipH ? -1 : 1
                          }, ${createImages[previewFrameIndex].flipV ? -1 : 1})`,
                          filter:
                            createImages[previewFrameIndex].filter === 'grayscale'
                              ? 'grayscale(100%)'
                              : createImages[previewFrameIndex].filter === 'sepia'
                                ? 'sepia(80%)'
                                : createImages[previewFrameIndex].filter === 'vintage'
                                  ? 'sepia(50%) contrast(120%)'
                                  : createImages[previewFrameIndex].filter === 'cyberpunk'
                                    ? 'hue-rotate(180deg) saturate(180%)'
                                    : createImages[previewFrameIndex].filter === 'invert'
                                      ? 'invert(100%)'
                                      : createImages[previewFrameIndex].filter === 'warm'
                                        ? 'sepia(30%) saturate(140%)'
                                        : createImages[previewFrameIndex].filter === 'cool'
                                          ? 'hue-rotate(190deg) saturate(120%)'
                                          : 'none',
                          transition: 'transform 0.15s ease, filter 0.15s ease',
                        }}
                      />

                      {/* Subtitle / Overlay Text */}
                      {overlayText.trim() &&
                        (textApplyScope === 'all' ||
                          createImages[previewFrameIndex].id === selectedCreateClipId) && (
                          <Typography
                            sx={{
                              position: 'absolute',
                              bottom: textPosition.includes('bottom') ? 16 : 'auto',
                              top: textPosition.includes('top') ? 16 : 'auto',
                              left: textPosition.includes('left')
                                ? 20
                                : textPosition.includes('right')
                                  ? 'auto'
                                  : '50%',
                              right: textPosition.includes('right') ? 20 : 'auto',
                              transform:
                                textPosition === 'center'
                                  ? 'translate(-50%, -50%)'
                                  : textPosition === 'top' || textPosition === 'bottom'
                                    ? 'translateX(-50%)'
                                    : 'none',
                              color: fontColor,
                              bgcolor: fontBgColor,
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: `${fontSize}px`,
                              fontWeight: 800,
                              textShadow: '0 2px 6px rgba(0,0,0,0.85)',
                              textAlign: 'center',
                              maxWidth: '90%',
                              wordBreak: 'break-word',
                              pointerEvents: 'none',
                            }}
                          >
                            {overlayText}
                          </Typography>
                        )}
                    </Box>
                  )
                )}
              </Box>

              {/* Monitor Bottom Player Controls Bar */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  pt: 0.8,
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  flexShrink: 0,
                }}
              >
                {/* Step & Playback Controls */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Tooltip title="첫 프레임으로 이동">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setIsPlayingPreview(false);
                        setPreviewFrameIndex(0);
                      }}
                      sx={{ color: '#cbd5e1' }}
                    >
                      <SkipPreviousRoundedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="이전 프레임 (-1)">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setIsPlayingPreview(false);
                        setPreviewFrameIndex((prev) =>
                          prev > 0 ? prev - 1 : createImages.length - 1
                        );
                      }}
                      sx={{ color: '#cbd5e1' }}
                    >
                      <ArrowUpwardRoundedIcon sx={{ fontSize: 16, transform: 'rotate(-90deg)' }} />
                    </IconButton>
                  </Tooltip>
                  <Button
                    size="small"
                    variant="contained"
                    color={isPlayingPreview ? 'warning' : 'primary'}
                    onClick={() => setIsPlayingPreview(!isPlayingPreview)}
                    startIcon={isPlayingPreview ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
                    sx={{ fontWeight: 800, px: 2, height: 32, borderRadius: 2 }}
                  >
                    {isPlayingPreview ? '일시정지' : '실시간 재생'}
                  </Button>
                  <Tooltip title="다음 프레임 (+1)">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setIsPlayingPreview(false);
                        setPreviewFrameIndex((prev) => (prev + 1) % createImages.length);
                      }}
                      sx={{ color: '#cbd5e1' }}
                    >
                      <ArrowDownwardRoundedIcon
                        sx={{ fontSize: 16, transform: 'rotate(-90deg)' }}
                      />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="마지막 프레임으로 이동">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setIsPlayingPreview(false);
                        setPreviewFrameIndex(createImages.length - 1);
                      }}
                      sx={{ color: '#cbd5e1' }}
                    >
                      <SkipNextRoundedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Loop Mode */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ToggleButtonGroup
                    size="small"
                    value={loopMode}
                    exclusive
                    onChange={(_, v) => v && setLoopMode(v)}
                    sx={{
                      height: 26,
                      '& .MuiToggleButton-root': {
                        px: 1,
                        py: 0,
                        fontSize: '0.68rem',
                        color: '#94a3b8',
                        borderColor: 'rgba(255,255,255,0.15)',
                        '&.Mui-selected': { bgcolor: '#334155', color: '#38bdf8' },
                      },
                    }}
                  >
                    <ToggleButton value="normal">정방향 🔁</ToggleButton>
                    <ToggleButton value="reverse">역재생 ◀️</ToggleButton>
                    <ToggleButton value="boomerang">부메랑 🔀</ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </Box>
            </Card>

            {/* Desktop Resizing Divider */}
            <Box
              onPointerDown={handleDividerPointerDown}
              onPointerMove={handleDividerPointerMove}
              onPointerUp={handleDividerPointerUp}
              sx={{
                display: { xs: 'none', lg: 'flex' },
                width: 16,
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'col-resize',
                userSelect: 'none',
                touchAction: 'none',
                zIndex: 10,
                flexShrink: 0,
              }}
            >
              <Box sx={{ width: '2px', height: '100%', bgcolor: 'divider' }} />
            </Box>

            {/* 2. Right: Filmora Property Inspector Panel */}
            <Card
              sx={{
                width: { xs: '100%', lg: `${rightPanelWidth}px` },
                minWidth: { lg: `${rightPanelWidth}px` },
                maxWidth: { lg: `${rightPanelWidth}px` },
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                minHeight: 0,
                overflow: 'hidden',
              }}
            >
              {/* Inspector Tabs Header */}
              <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 1, pt: 0.5 }}>
                <Tabs
                  value={inspectorTab}
                  onChange={(_, v) => setInspectorTab(v)}
                  variant="fullWidth"
                  sx={{ minHeight: 38 }}
                >
                  <Tab
                    label="클립 편집"
                    value="clip"
                    sx={{ minHeight: 38, py: 0.5, fontSize: '0.78rem', fontWeight: 700 }}
                  />
                  <Tab
                    label="자막/텍스트"
                    value="text"
                    sx={{ minHeight: 38, py: 0.5, fontSize: '0.78rem', fontWeight: 700 }}
                  />
                  <Tab
                    label="필터 FX"
                    value="fx"
                    sx={{ minHeight: 38, py: 0.5, fontSize: '0.78rem', fontWeight: 700 }}
                  />
                  <Tab
                    label="출력 설정"
                    value="export"
                    sx={{ minHeight: 38, py: 0.5, fontSize: '0.78rem', fontWeight: 700 }}
                  />
                </Tabs>
              </Box>

              {/* Inspector Body */}
              <Box
                sx={{
                  flex: '1 1 auto',
                  minHeight: 0,
                  overflowY: 'auto',
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                {/* TAB 1: Selected Clip Properties */}
                {inspectorTab === 'clip' && selectedCreateClip && (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 1.5,
                          overflow: 'hidden',
                          bgcolor: '#0f172a',
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={selectedCreateClip.src}
                          alt="thumb"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }} noWrap>
                          {selectedCreateClip.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          재생 시간: {(selectedCreateClip.duration || 0.1).toFixed(2)}초 (
                          {Math.round((selectedCreateClip.duration || 0.1) * 1000)}ms)
                        </Typography>
                      </Box>
                    </Box>

                    {/* Clip Duration Slider */}
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          이 클립 지속시간 (Duration)
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 800, color: 'primary.main' }}
                        >
                          {(selectedCreateClip.duration || 0.1).toFixed(2)}초
                        </Typography>
                      </Box>
                      <Slider
                        size="small"
                        min={0.02}
                        max={2.0}
                        step={0.02}
                        value={selectedCreateClip.duration || 0.1}
                        onChange={(_, v) =>
                          handleUpdateCreateClip(selectedCreateClip.id, {
                            duration: v as number,
                          })
                        }
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        fullWidth
                        onClick={() => handleApplyDurationToAll(selectedCreateClip.duration || 0.1)}
                        sx={{ mt: 0.5, fontSize: '0.72rem', fontWeight: 700 }}
                      >
                        ⚡ 모든 클립에 이 시간 일괄 적용
                      </Button>
                    </Box>

                    {/* Flip & Rotate */}
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, mb: 1, display: 'block' }}
                      >
                        방향 반전 & 회전
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant={selectedCreateClip.flipH ? 'contained' : 'outlined'}
                          onClick={() =>
                            handleUpdateCreateClip(selectedCreateClip.id, {
                              flipH: !selectedCreateClip.flipH,
                            })
                          }
                          sx={{ flex: 1, fontSize: '0.75rem' }}
                        >
                          ↔️ 좌우 반전
                        </Button>
                        <Button
                          size="small"
                          variant={selectedCreateClip.flipV ? 'contained' : 'outlined'}
                          onClick={() =>
                            handleUpdateCreateClip(selectedCreateClip.id, {
                              flipV: !selectedCreateClip.flipV,
                            })
                          }
                          sx={{ flex: 1, fontSize: '0.75rem' }}
                        >
                          ↕️ 상하 반전
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() =>
                            handleUpdateCreateClip(selectedCreateClip.id, {
                              rotation: ((selectedCreateClip.rotation || 0) + 90) % 360,
                            })
                          }
                          sx={{ flex: 1, fontSize: '0.75rem' }}
                        >
                          🔄 90° 회전
                        </Button>
                      </Box>
                    </Box>

                    {/* Quick Actions */}
                    <Box sx={{ display: 'flex', gap: 1, pt: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        fullWidth
                        startIcon={<ContentCopyRoundedIcon />}
                        onClick={() => handleDuplicateCreateClip(selectedCreateClip.id)}
                        sx={{ fontWeight: 700 }}
                      >
                        클립 복제
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        fullWidth
                        startIcon={<ContentCutRoundedIcon />}
                        onClick={() => handleSplitCreateClip(selectedCreateClip.id)}
                        sx={{ fontWeight: 700 }}
                      >
                        시간 분할
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteRoundedIcon />}
                        onClick={() => handleDeleteCreateClip(selectedCreateClip.id)}
                        disabled={createImages.length <= 1}
                        sx={{ fontWeight: 700 }}
                      >
                        삭제
                      </Button>
                    </Box>
                  </>
                )}

                {/* TAB 2: Subtitle & Text Overlay */}
                {inspectorTab === 'text' && (
                  <>
                    <TextField
                      size="small"
                      fullWidth
                      label="자막 문구"
                      placeholder="영상에 들어갈 자막 입력"
                      value={overlayText}
                      onChange={(e) => setOverlayText(e.target.value)}
                    />

                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 700, mb: 0.5, display: 'block' }}
                        >
                          글자 색상
                        </Typography>
                        <input
                          type="color"
                          value={fontColor}
                          onChange={(e) => setFontColor(e.target.value)}
                          style={{
                            width: '100%',
                            height: 36,
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                          }}
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 700, mb: 0.5, display: 'block' }}
                        >
                          배경 박스
                        </Typography>
                        <input
                          type="color"
                          value={fontBgColor.startsWith('#') ? fontBgColor : '#000000'}
                          onChange={(e) => setFontBgColor(e.target.value)}
                          style={{
                            width: '100%',
                            height: 36,
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                          }}
                        />
                      </Box>
                    </Box>

                    <FormControl size="small" fullWidth>
                      <InputLabel>자막 위치</InputLabel>
                      <Select
                        value={textPosition}
                        label="자막 위치"
                        onChange={(e) =>
                          setTextPosition(
                            e.target.value as
                              | 'top'
                              | 'center'
                              | 'bottom'
                              | 'top-left'
                              | 'bottom-right'
                          )
                        }
                      >
                        <MenuItem value="top">상단 중앙</MenuItem>
                        <MenuItem value="center">화면 정중앙</MenuItem>
                        <MenuItem value="bottom">하단 중앙 (표준)</MenuItem>
                        <MenuItem value="top-left">좌측 상단</MenuItem>
                        <MenuItem value="bottom-right">우측 하단</MenuItem>
                      </Select>
                    </FormControl>

                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          글자 크기
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 800, color: 'primary.main' }}
                        >
                          {fontSize}px
                        </Typography>
                      </Box>
                      <Slider
                        size="small"
                        min={14}
                        max={64}
                        value={fontSize}
                        onChange={(_, v) => setFontSize(v as number)}
                      />
                    </Box>

                    <FormControl size="small" fullWidth>
                      <InputLabel>자막 적용 범위</InputLabel>
                      <Select
                        value={textApplyScope}
                        label="자막 적용 범위"
                        onChange={(e) => setTextApplyScope(e.target.value as 'all' | 'selected')}
                      >
                        <MenuItem value="all">전체 프레임에 계속 표시</MenuItem>
                        <MenuItem value="selected">현재 선택된 클립에만 표시</MenuItem>
                      </Select>
                    </FormControl>
                  </>
                )}

                {/* TAB 3: Video Filters & FX */}
                {inspectorTab === 'fx' && (
                  <>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                      클립에 즉시 적용할 필터를 선택하세요:
                    </Typography>

                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: 1,
                      }}
                    >
                      {[
                        { id: 'none', label: '원본 (Normal)', icon: '✨' },
                        { id: 'grayscale', label: '모노 흑백', icon: '🌑' },
                        { id: 'sepia', label: '클래식 세피아', icon: '📜' },
                        { id: 'vintage', label: '빈티지 필름', icon: '🎞️' },
                        { id: 'cyberpunk', label: '사이버펑크', icon: '⚡' },
                        { id: 'warm', label: '따뜻한 감성', icon: '🌅' },
                        { id: 'cool', label: '시원한 블루', icon: '❄️' },
                        { id: 'invert', label: '네거티브 반전', icon: '🔄' },
                      ].map((f) => (
                        <Button
                          key={f.id}
                          size="small"
                          variant={selectedCreateClip?.filter === f.id ? 'contained' : 'outlined'}
                          onClick={() => {
                            if (selectedCreateClip) {
                              handleUpdateCreateClip(selectedCreateClip.id, { filter: f.id });
                            }
                          }}
                          sx={{
                            justifyContent: 'flex-start',
                            py: 1,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          {f.icon} {f.label}
                        </Button>
                      ))}
                    </Box>

                    <Button
                      variant="outlined"
                      color="primary"
                      fullWidth
                      onClick={() => handleApplyFilterToAll(selectedCreateClip?.filter || 'none')}
                      sx={{ mt: 1, fontWeight: 700 }}
                    >
                      ⚡ 이 필터를 모든 클립에 일괄 적용
                    </Button>
                  </>
                )}

                {/* TAB 4: Export & Canvas Settings */}
                {inspectorTab === 'export' && (
                  <>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <TextField
                        size="small"
                        type="number"
                        label="너비 (Width)"
                        value={targetWidth}
                        onChange={(e) => setTargetWidth(Number(e.target.value) || 480)}
                      />
                      <TextField
                        size="small"
                        type="number"
                        label="높이 (Height)"
                        value={targetHeight}
                        onChange={(e) => setTargetHeight(Number(e.target.value) || 480)}
                      />
                    </Box>

                    <FormControl size="small" fullWidth>
                      <InputLabel>화면 맞춤 (Fit Mode)</InputLabel>
                      <Select
                        value={fitMode}
                        label="화면 맞춤 (Fit Mode)"
                        onChange={(e) =>
                          setFitMode(e.target.value as 'contain' | 'cover' | 'stretch')
                        }
                      >
                        <MenuItem value="contain">여백 포함 (Contain)</MenuItem>
                        <MenuItem value="cover">화면 꽉 채움 (Cover)</MenuItem>
                        <MenuItem value="stretch">비율 왜곡 맞춤 (Stretch)</MenuItem>
                      </Select>
                    </FormControl>

                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          기본 재생 속도 (FPS)
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 800, color: 'primary.main' }}
                        >
                          {fps} FPS
                        </Typography>
                      </Box>
                      <Slider
                        size="small"
                        min={1}
                        max={30}
                        value={fps}
                        onChange={(_, v) => setFps(v as number)}
                      />
                    </Box>

                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          인코딩 품질
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 800, color: 'primary.main' }}
                        >
                          {sampleInterval <= 5 ? '최고화질' : '표준 고속'}
                        </Typography>
                      </Box>
                      <Slider
                        size="small"
                        min={1}
                        max={20}
                        value={sampleInterval}
                        onChange={(_, v) => setSampleInterval(v as number)}
                      />
                    </Box>
                  </>
                )}
              </Box>
            </Card>
          </Box>

          {/* LOWER SECTION: Filmora Multi-Track Timeline Studio */}
          <Card
            sx={{
              flex: '0 0 auto',
              height: { xs: '230px', sm: '250px' },
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              bgcolor: '#0a0f1d',
              borderColor: 'rgba(255,255,255,0.08)',
              overflow: 'hidden',
              p: 1.25,
            }}
          >
            {/* Timeline Header Toolbar */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1,
                pb: 1,
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                flexShrink: 0,
              }}
            >
              {/* Left Action Buttons */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  startIcon={<AddRoundedIcon />}
                  onClick={() => createFileInputRef.current?.click()}
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    height: 28,
                    borderRadius: 1.5,
                  }}
                >
                  사진 추가
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  startIcon={<ContentCutRoundedIcon />}
                  onClick={() => selectedCreateClip && handleSplitCreateClip(selectedCreateClip.id)}
                  disabled={!selectedCreateClip}
                  sx={{
                    fontSize: '0.72rem',
                    height: 28,
                    color: '#cbd5e1',
                    borderColor: 'rgba(255,255,255,0.15)',
                  }}
                >
                  분할
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  startIcon={<ContentCopyRoundedIcon />}
                  onClick={() =>
                    selectedCreateClip && handleDuplicateCreateClip(selectedCreateClip.id)
                  }
                  disabled={!selectedCreateClip}
                  sx={{
                    fontSize: '0.72rem',
                    height: 28,
                    color: '#cbd5e1',
                    borderColor: 'rgba(255,255,255,0.15)',
                  }}
                >
                  복제
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteRoundedIcon />}
                  onClick={() =>
                    selectedCreateClip && handleDeleteCreateClip(selectedCreateClip.id)
                  }
                  disabled={createImages.length <= 1}
                  sx={{ fontSize: '0.72rem', height: 28 }}
                >
                  삭제
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  onClick={() => handleBatchSpeedMultiplier(2)}
                  sx={{
                    fontSize: '0.72rem',
                    height: 28,
                    color: '#cbd5e1',
                    borderColor: 'rgba(255,255,255,0.15)',
                  }}
                >
                  ⚡ 2x 배속
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  onClick={() => handleBatchSpeedMultiplier(0.5)}
                  sx={{
                    fontSize: '0.72rem',
                    height: 28,
                    color: '#cbd5e1',
                    borderColor: 'rgba(255,255,255,0.15)',
                  }}
                >
                  🐢 0.5x 슬로우
                </Button>
              </Box>

              {/* Right: Summary & Export Buttons */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#94a3b8',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    fontFamily: 'monospace',
                  }}
                >
                  총 {totalCreateDurationSec.toFixed(2)}초 ({createImages.length}클립)
                </Typography>

                {createResultUrl ? (
                  <Box sx={{ display: 'flex', gap: 0.75 }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<DownloadRoundedIcon />}
                      onClick={() =>
                        downloadDataUrl(createResultUrl, `studio_gif_${Date.now()}.gif`)
                      }
                      sx={{ fontWeight: 800, fontSize: '0.75rem', height: 30 }}
                    >
                      GIF 다운로드 ({formatBytes(getDataUrlByteSize(createResultUrl))})
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="secondary"
                      startIcon={<MovieCreationRoundedIcon />}
                      onClick={
                        createMp4Url
                          ? () => downloadDataUrl(createMp4Url, `studio_video_${Date.now()}.mp4`)
                          : handleConvertToMp4
                      }
                      disabled={isConvertingMp4}
                      sx={{ fontWeight: 800, fontSize: '0.75rem', height: 30 }}
                    >
                      {isConvertingMp4
                        ? 'MP4 변환 중...'
                        : createMp4Url
                          ? 'MP4 다운로드'
                          : 'MP4 동영상 저장'}
                    </Button>
                  </Box>
                ) : (
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    startIcon={
                      isCreating ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <AutoAwesomeRoundedIcon />
                      )
                    }
                    onClick={handleGenerateGif}
                    disabled={isCreating || createImages.length < 2}
                    sx={{ fontWeight: 800, fontSize: '0.75rem', height: 30, px: 2 }}
                  >
                    {isCreating ? `인코딩 (${createProgress}%)` : '✨ 고화질 GIF 만들기'}
                  </Button>
                )}
              </Box>
            </Box>

            {/* Timeline Tracks Viewport */}
            <Box
              ref={timelineScrollRef}
              sx={{
                flex: '1 1 auto',
                minHeight: 0,
                overflowX: 'auto',
                overflowY: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                py: 1,
                bgcolor: '#050811',
                borderRadius: 2,
                p: 1,
                my: 0.5,
              }}
            >
              {/* Track 1: Visual Clips Track */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 'max-content' }}>
                <Box
                  sx={{
                    width: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  🎬 V1
                </Box>

                {createImages.map((clip, idx) => {
                  const isSelected = selectedCreateClipId === clip.id;
                  const isCurrentPlaying = previewFrameIndex === idx;

                  return (
                    <Box
                      key={clip.id}
                      onClick={() => {
                        setSelectedCreateClipId(clip.id);
                        setPreviewFrameIndex(idx);
                      }}
                      sx={{
                        width: 100,
                        minWidth: 100,
                        height: 72,
                        borderRadius: 2,
                        overflow: 'hidden',
                        position: 'relative',
                        cursor: 'pointer',
                        bgcolor: '#1e293b',
                        border: '2px solid',
                        borderColor: isCurrentPlaying
                          ? 'primary.main'
                          : isSelected
                            ? '#38bdf8'
                            : 'rgba(255,255,255,0.1)',
                        boxShadow: isCurrentPlaying ? '0 0 10px rgba(56, 189, 248, 0.5)' : 'none',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        flexShrink: 0,
                      }}
                    >
                      {/* Clip Thumbnail Background */}
                      <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                        <img
                          src={clip.src}
                          alt="thumb"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            filter:
                              clip.filter === 'grayscale'
                                ? 'grayscale(100%)'
                                : clip.filter === 'sepia'
                                  ? 'sepia(80%)'
                                  : 'none',
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 2,
                            left: 4,
                            bgcolor: 'rgba(0,0,0,0.65)',
                            color: '#ffffff',
                            px: 0.6,
                            py: 0.1,
                            borderRadius: 1,
                            fontSize: '0.62rem',
                            fontWeight: 800,
                          }}
                        >
                          #{idx + 1}
                        </Box>
                      </Box>

                      {/* Clip Bottom Duration Tag & Reorder Arrows */}
                      <Box
                        sx={{
                          height: 20,
                          bgcolor: isSelected ? 'primary.darker' : 'rgba(0,0,0,0.85)',
                          px: 0.8,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography
                          sx={{
                            color: '#38bdf8',
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            fontFamily: 'monospace',
                          }}
                        >
                          {(clip.duration || 0.1).toFixed(2)}s
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconButton
                            size="small"
                            disabled={idx === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveCreateClip(idx, -1);
                            }}
                            sx={{ p: 0.1, color: '#94a3b8' }}
                          >
                            <ArrowUpwardRoundedIcon
                              sx={{ fontSize: 10, transform: 'rotate(-90deg)' }}
                            />
                          </IconButton>
                          <IconButton
                            size="small"
                            disabled={idx === createImages.length - 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveCreateClip(idx, 1);
                            }}
                            sx={{ p: 0.1, color: '#94a3b8' }}
                          >
                            <ArrowDownwardRoundedIcon
                              sx={{ fontSize: 10, transform: 'rotate(-90deg)' }}
                            />
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}

                {/* Timeline Add More Drop Block */}
                <Box
                  onClick={() => createFileInputRef.current?.click()}
                  sx={{
                    width: 80,
                    minWidth: 80,
                    height: 72,
                    borderRadius: 2,
                    border: '2px dashed rgba(255,255,255,0.2)',
                    bgcolor: 'rgba(255,255,255,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    gap: 0.5,
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'rgba(56, 189, 248, 0.08)',
                    },
                  }}
                >
                  <AddRoundedIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.65rem', fontWeight: 700 }}>
                    + 추가
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Card>
        </Box>
      )}

      {/* Sample Menu */}
      <Menu
        anchorEl={sampleMenuAnchorEl}
        open={Boolean(sampleMenuAnchorEl)}
        onClose={() => setSampleMenuAnchorEl(null)}
        sx={{
          '& .MuiPaper-root': {
            width: 280,
            maxHeight: 380,
            borderRadius: 2,
            p: 0.5,
          },
        }}
      >
        <Box sx={{ px: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>
            ⚡ 예시 GIF 선택
          </Typography>
        </Box>

        {GIF_SAMPLE_LIST.map((sample) => (
          <MenuItem
            key={sample.id}
            onClick={() => {
              setSampleMenuAnchorEl(null);
              handleSelectCreateSample(sample);
            }}
            sx={{ gap: 1.5, py: 1, my: 0.25, borderRadius: 1 }}
          >
            <Box
              component="img"
              src={sample.url}
              alt={sample.label}
              sx={{ width: 38, height: 38, borderRadius: 1, objectFit: 'cover', flexShrink: 0 }}
            />
            <Box sx={{ minWidth: 0, flex: '1 1 auto' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.82rem' }} noWrap>
                {sample.label}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', display: 'block', fontSize: '0.7rem' }}
                noWrap
              >
                {sample.subLabel}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </DashboardContent>
  );
}
