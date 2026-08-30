'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
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
import FormControlLabel from '@mui/material/FormControlLabel';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import AspectRatioRoundedIcon from '@mui/icons-material/AspectRatioRounded';
import SkipPreviousRoundedIcon from '@mui/icons-material/SkipPreviousRounded';
import MovieCreationRoundedIcon from '@mui/icons-material/MovieCreationRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

import { GifSampleSection } from '../components/gif-sample-section';
import { GifStudioNavHeader } from '../components/gif-studio-nav-header';
import { GIF_SAMPLE_LIST, type GifSampleItem, fetchSampleGifFile } from '../data/gif-samples';
import {
  mergeGifs,
  formatBytes,
  downloadDataUrl,
  extractGifFrames,
  convertGifToVideo,
  getDataUrlByteSize,
  type GifMergeClipItem,
} from '../utils/gif-processor';

// ----------------------------------------------------------------------

export function GifStudioMergeView() {
  const [mergeClips, setMergeClips] = useState<GifMergeClipItem[]>([]);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [isMergeExtracting, setIsMergeExtracting] = useState<boolean>(false);
  const [isMergeProcessing, setIsMergeProcessing] = useState<boolean>(false);
  const [mergeProgress, setMergeProgress] = useState<number>(0);
  const [mergeResultUrl, setMergeResultUrl] = useState<string>('');
  const [activeMergePreviewTab, setActiveMergePreviewTab] = useState<'live' | 'encoded'>('live');
  const [mergeResolutionMode, setMergeResolutionMode] = useState<'first' | 'max' | 'min'>('first');
  const [mergeFitMode, setMergeFitMode] = useState<'contain' | 'cover' | 'fill'>('contain');
  const [mergeBgColor, setMergeBgColor] = useState<string>('#ffffff');
  const [isMergeMp4Converting, setIsMergeMp4Converting] = useState<boolean>(false);
  const [mergeMp4Progress, setMergeMp4Progress] = useState<number>(0);
  const [mergeMp4Url, setMergeMp4Url] = useState<string>('');
  const [mergeMp4Size, setMergeMp4Size] = useState<number>(0);
  const [draggedClipIndex, setDraggedClipIndex] = useState<number | null>(null);
  const [dragOverClipIndex, setDragOverClipIndex] = useState<number | null>(null);
  const [mergeSettingsTab, setMergeSettingsTab] = useState<'trim' | 'speed' | 'global'>('trim');
  const [timelineZoom, setTimelineZoom] = useState<number>(1.0);
  const [loadingSampleId, setLoadingSampleId] = useState<string | null>(null);
  const [sampleMenuAnchorEl, setSampleMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [isExternalDragOverTrack, setIsExternalDragOverTrack] = useState<boolean>(false);

  const [trimmingState, setTrimmingState] = useState<{
    clipId: string;
    handle: 'start' | 'end';
    startX: number;
    initialTrimStart: number;
    initialTrimEnd: number;
    totalFrames: number;
    pxPerFrame: number;
  } | null>(null);

  // Resizable Right Panel
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(380);
  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(380);

  const mergeInputRef = useRef<HTMLInputElement>(null);

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

  // Active Selected Clip
  const activeClip = React.useMemo(
    () => mergeClips.find((c) => c.id === selectedClipId) || mergeClips[0] || null,
    [mergeClips, selectedClipId]
  );

  // Flattened frames across all clips for live unified playback
  const flattenedMergeFrames = React.useMemo(() => {
    if (!mergeClips || mergeClips.length === 0) return [];
    const framesList: {
      clipId: string;
      clipIndex: number;
      clipFilename: string;
      frameIndexInClip: number;
      dataUrl: string;
      delay: number;
      speedMultiplier: number;
      loopMode: string;
      repeatIndex: number;
      totalRepeats: number;
    }[] = [];

    mergeClips.forEach((clip, cIdx) => {
      if (!clip.frames || clip.frames.length === 0) return;

      const start = Math.max(0, Math.min(clip.trimStart ?? 0, clip.frames.length - 1));
      const end = Math.max(
        start,
        Math.min(clip.trimEnd ?? clip.frames.length - 1, clip.frames.length - 1)
      );
      let sliced = clip.frames.slice(start, end + 1);
      if (sliced.length === 0) sliced = [clip.frames[0]];

      if (clip.skipFrames && sliced.length > 4) {
        sliced = sliced.filter((_, idx) => idx % 2 === 0);
      }

      let seq = [...sliced];
      if (clip.loopMode === 'reverse') {
        seq.reverse();
      } else if (clip.loopMode === 'boomerang') {
        const rev = [...seq].reverse().slice(1, -1);
        seq = [...seq, ...rev];
      }

      const repeats = Math.max(1, Math.min(10, clip.repeatCount || 1));
      for (let r = 0; r < repeats; r += 1) {
        seq.forEach((f, fIdx) => {
          const rawDelay = f.delay || 100;
          const effectiveDelay = Math.max(
            5,
            Math.round(rawDelay / Math.max(0.1, clip.speedMultiplier || 1.0))
          );
          framesList.push({
            clipId: clip.id,
            clipIndex: cIdx,
            clipFilename: clip.filename,
            frameIndexInClip: fIdx,
            dataUrl: f.dataUrl,
            delay: effectiveDelay,
            speedMultiplier: clip.speedMultiplier || 1.0,
            loopMode: clip.loopMode,
            repeatIndex: r + 1,
            totalRepeats: repeats,
          });
        });
      }
    });

    return framesList;
  }, [mergeClips]);

  const [mergePlayerIndex, setMergePlayerIndex] = useState<number>(0);
  const [isPlayingMerge, setIsPlayingMerge] = useState<boolean>(true);

  useEffect(() => {
    if (flattenedMergeFrames.length > 0 && mergePlayerIndex >= flattenedMergeFrames.length) {
      setMergePlayerIndex(0);
    }
  }, [flattenedMergeFrames.length, mergePlayerIndex]);

  // Live Multi-clip Player Engine
  useEffect(() => {
    if (!isPlayingMerge || flattenedMergeFrames.length <= 1) return undefined;
    const current = flattenedMergeFrames[mergePlayerIndex] || flattenedMergeFrames[0];
    const timerDelay = Math.max(8, current?.delay || 100);

    const timer = setTimeout(() => {
      setMergePlayerIndex((prev) => (prev + 1) % flattenedMergeFrames.length);
    }, timerDelay);

    return () => clearTimeout(timer);
  }, [isPlayingMerge, flattenedMergeFrames, mergePlayerIndex]);

  const processMergeFiles = useCallback(
    async (files: File[], insertAtIndex?: number) => {
      if (!files || files.length === 0) return;
      setIsMergeExtracting(true);
      toast.info(`${files.length}개 GIF 파일의 프레임을 추출하고 있습니다...`);

      try {
        const newClips: GifMergeClipItem[] = [];
        for (const file of files) {
          const res = await extractGifFrames(file);
          if (res.frames.length > 0) {
            newClips.push({
              id: `clip_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
              filename: file.name,
              originalWidth: res.width,
              originalHeight: res.height,
              frames: res.frames,
              trimStart: 0,
              trimEnd: res.frames.length - 1,
              speedMultiplier: 1.0,
              loopMode: 'normal',
              repeatCount: 1,
              skipFrames: false,
            });
          }
        }

        setMergeClips((prev) => {
          const updated = [...prev];
          if (
            insertAtIndex !== undefined &&
            insertAtIndex >= 0 &&
            insertAtIndex <= updated.length
          ) {
            updated.splice(insertAtIndex, 0, ...newClips);
          } else {
            updated.push(...newClips);
          }
          if (!selectedClipId && updated.length > 0) {
            setSelectedClipId(updated[0].id);
          }
          return updated;
        });
        setMergeResultUrl('');
        setMergeMp4Url('');
        setMergeMp4Size(0);
        setActiveMergePreviewTab('live');
        toast.success(`${newClips.length}개 GIF 클립 추가 완료!`);
      } catch {
        toast.error('GIF 파일 분석 중 오류가 발생했습니다.');
      } finally {
        setIsMergeExtracting(false);
      }
    },
    [selectedClipId]
  );

  const mergeDrop = useImageDropPaste({
    onFiles: (files) => {
      const gifs = files.filter((f) => f.type === 'image/gif' || f.name.endsWith('.gif'));
      if (gifs.length > 0) processMergeFiles(gifs);
      else toast.error('GIF 파일만 업로드할 수 있습니다.');
    },
    disabled: false,
  });

  const handleSelectMergeSample = async (sample: GifSampleItem) => {
    setLoadingSampleId(sample.id);
    try {
      const file = await fetchSampleGifFile(sample);
      await processMergeFiles([file]);
    } catch {
      toast.error('예시 GIF 파일을 불러오지 못했습니다.');
    } finally {
      setLoadingSampleId(null);
    }
  };

  const handleSelectAllMergeSamples = async () => {
    setIsMergeExtracting(true);
    toast.info('3종 예시 GIF를 모두 타임라인에 추가하는 중입니다...');
    try {
      const files = await Promise.all(GIF_SAMPLE_LIST.map((s) => fetchSampleGifFile(s)));
      await processMergeFiles(files);
    } catch {
      toast.error('예시 GIF 파일들을 불러오지 못했습니다.');
    } finally {
      setIsMergeExtracting(false);
    }
  };

  const handleDuplicateClip = (clipId: string) => {
    setMergeClips((prev) => {
      const idx = prev.findIndex((c) => c.id === clipId);
      if (idx === -1) return prev;
      const target = prev[idx];
      const cloned: GifMergeClipItem = {
        ...target,
        id: `clip_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        filename: `${target.filename} (복제본)`,
      };
      const updated = [...prev];
      updated.splice(idx + 1, 0, cloned);
      setSelectedClipId(cloned.id);
      return updated;
    });
    setMergeResultUrl('');
    setMergeMp4Url('');
    setMergeMp4Size(0);
    toast.success('클립이 복제되었습니다.');
  };

  const handleDeleteClip = (clipId: string) => {
    setMergeClips((prev) => {
      const filtered = prev.filter((c) => c.id !== clipId);
      if (selectedClipId === clipId) {
        setSelectedClipId(filtered[0]?.id || null);
      }
      return filtered;
    });
    setMergeResultUrl('');
    setMergeMp4Url('');
    setMergeMp4Size(0);
    toast.info('클립이 삭제되었습니다.');
  };

  const handleMoveClip = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= mergeClips.length) return;
    setMergeClips((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(index, 1);
      copy.splice(targetIdx, 0, removed);
      return copy;
    });
    setMergeResultUrl('');
    setMergeMp4Url('');
    setMergeMp4Size(0);
  };

  const handleClipDragStart = (e: React.DragEvent, index: number) => {
    setDraggedClipIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleClipDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
      e.dataTransfer.dropEffect = 'copy';
      setDragOverClipIndex(index);
      setIsExternalDragOverTrack(true);
    } else if (draggedClipIndex !== null && draggedClipIndex !== index) {
      e.dataTransfer.dropEffect = 'move';
      setDragOverClipIndex(index);
    }
  };

  const handleClipDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setIsExternalDragOverTrack(false);
    setDragOverClipIndex(null);

    // External file drop
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter(
        (f) => f.type === 'image/gif' || f.name.toLowerCase().endsWith('.gif')
      );
      if (files.length > 0) {
        processMergeFiles(files, targetIndex);
      } else {
        toast.error('GIF 파일(.gif)만 추가할 수 있습니다.');
      }
      return;
    }

    // Internal clip reordering
    if (draggedClipIndex !== null && draggedClipIndex !== targetIndex) {
      setMergeClips((prev) => {
        const copy = [...prev];
        const [dragged] = copy.splice(draggedClipIndex, 1);
        copy.splice(targetIndex, 0, dragged);
        return copy;
      });
      setMergeResultUrl('');
      setMergeMp4Url('');
      setMergeMp4Size(0);
    }
    setDraggedClipIndex(null);
  };

  const handleClipDragEnd = () => {
    setDraggedClipIndex(null);
    setDragOverClipIndex(null);
    setIsExternalDragOverTrack(false);
  };

  const handleTrimPointerDown = (
    e: React.PointerEvent,
    clip: GifMergeClipItem,
    handle: 'start' | 'end',
    pxPerFrame: number
  ) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if not supported
    }
    setSelectedClipId(clip.id);
    setTrimmingState({
      clipId: clip.id,
      handle,
      startX: e.clientX,
      initialTrimStart: clip.trimStart,
      initialTrimEnd: clip.trimEnd,
      totalFrames: clip.frames.length,
      pxPerFrame: Math.max(0.5, pxPerFrame),
    });
  };

  const handleTrimPointerMove = (e: React.PointerEvent) => {
    if (!trimmingState) return;
    e.preventDefault();
    e.stopPropagation();

    const deltaX = e.clientX - trimmingState.startX;
    const deltaFrames = Math.round(deltaX / trimmingState.pxPerFrame);

    if (trimmingState.handle === 'start') {
      const newStart = Math.max(
        0,
        Math.min(trimmingState.initialTrimEnd - 1, trimmingState.initialTrimStart + deltaFrames)
      );
      setMergeClips((prev) =>
        prev.map((c) => (c.id === trimmingState.clipId ? { ...c, trimStart: newStart } : c))
      );
    } else {
      const newEnd = Math.max(
        trimmingState.initialTrimStart + 1,
        Math.min(trimmingState.totalFrames - 1, trimmingState.initialTrimEnd + deltaFrames)
      );
      setMergeClips((prev) =>
        prev.map((c) => (c.id === trimmingState.clipId ? { ...c, trimEnd: newEnd } : c))
      );
    }
  };

  const handleTrimPointerUp = (e: React.PointerEvent) => {
    if (!trimmingState) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
    setTrimmingState(null);
    setMergeResultUrl('');
    setMergeMp4Url('');
    setMergeMp4Size(0);
  };

  const handleSplitClipAtPlayhead = () => {
    if (mergeClips.length === 0) return;

    const currentFrameInfo = flattenedMergeFrames[mergePlayerIndex];
    let targetClip = currentFrameInfo
      ? mergeClips.find((c) => c.id === currentFrameInfo.clipId)
      : activeClip;

    if (!targetClip) targetClip = activeClip || mergeClips[0];
    if (!targetClip) return;

    const clipStart = targetClip.trimStart;
    const clipEnd = targetClip.trimEnd;
    const clipLength = clipEnd - clipStart + 1;

    if (clipLength <= 2) {
      toast.error('클립의 길이가 너무 짧아 분할할 수 없습니다 (최소 3프레임 이상 필요).');
      return;
    }

    let splitFrame =
      currentFrameInfo && currentFrameInfo.clipId === targetClip.id
        ? clipStart + currentFrameInfo.frameIndexInClip
        : Math.floor((clipStart + clipEnd) / 2);

    if (splitFrame <= clipStart) splitFrame = clipStart + 1;
    if (splitFrame >= clipEnd) splitFrame = clipEnd - 1;

    const part1Id = `${targetClip.id}_p1_${Date.now()}`;
    const part2Id = `${targetClip.id}_p2_${Date.now()}`;

    const part1: GifMergeClipItem = {
      ...targetClip,
      id: part1Id,
      filename: `${targetClip.filename} (파트 1)`,
      trimStart: clipStart,
      trimEnd: splitFrame,
    };

    const part2: GifMergeClipItem = {
      ...targetClip,
      id: part2Id,
      filename: `${targetClip.filename} (파트 2)`,
      trimStart: splitFrame + 1,
      trimEnd: clipEnd,
    };

    setMergeClips((prev) => {
      const targetIdx = prev.findIndex((c) => c.id === targetClip.id);
      if (targetIdx === -1) return prev;
      const copy = [...prev];
      copy.splice(targetIdx, 1, part1, part2);
      return copy;
    });

    setSelectedClipId(part2Id);
    setMergeResultUrl('');
    setMergeMp4Url('');
    setMergeMp4Size(0);
    toast.success(`✂️ 클립이 #${splitFrame + 1}F 위치에서 2개로 분할되었습니다!`);
  };

  const updateActiveClip = (updates: Partial<GifMergeClipItem>) => {
    if (!selectedClipId) return;
    setMergeClips((prev) => prev.map((c) => (c.id === selectedClipId ? { ...c, ...updates } : c)));
    setMergeResultUrl('');
    setMergeMp4Url('');
    setMergeMp4Size(0);
    if (mergeResultUrl) setActiveMergePreviewTab('live');
  };

  const handleApplyMerge = async () => {
    if (mergeClips.length === 0) {
      toast.error('합칠 GIF 클립을 먼저 추가해주세요.');
      return;
    }
    setIsMergeProcessing(true);
    setMergeProgress(0);
    setMergeMp4Url('');
    setMergeMp4Size(0);
    toast.info('설정된 클립들을 하나로 병합하여 새 GIF로 인코딩 중입니다...');

    try {
      const res = await mergeGifs({
        clips: mergeClips,
        resolutionMode: mergeResolutionMode,
        fitMode: mergeFitMode,
        bgColor: mergeBgColor,
        progressCallback: (p) => setMergeProgress(p),
      });
      setMergeResultUrl(res);
      setActiveMergePreviewTab('encoded');
      toast.success('GIF 합치기 인코딩이 완료되었습니다!');
    } catch {
      toast.error('GIF 합치기 중 오류가 발생했습니다.');
    } finally {
      setIsMergeProcessing(false);
    }
  };

  const handleDownloadMergeMp4 = async () => {
    if (!mergeResultUrl) {
      toast.error('먼저 GIF 합치기 인코딩을 완료해주세요.');
      return;
    }
    if (mergeMp4Url) {
      const link = document.createElement('a');
      link.href = mergeMp4Url;
      link.download = `merged_${mergeClips.length}_clips_${Date.now()}.mp4`;
      link.click();
      toast.success('MP4 동영상이 다운로드되었습니다.');
      return;
    }

    setIsMergeMp4Converting(true);
    setMergeMp4Progress(0);
    toast.info('합쳐진 GIF를 MP4 동영상으로 변환하고 있습니다...');

    try {
      const resBlob = await fetch(mergeResultUrl).then((r) => r.blob());
      const videoRes = await convertGifToVideo(resBlob, {
        targetFormat: 'mp4',
        fps: 30,
        scale: 1.0,
        speedMultiplier: 1.0,
        progressCallback: (p) => setMergeMp4Progress(p),
      });
      setMergeMp4Url(videoRes.videoUrl);
      setMergeMp4Size(videoRes.size);

      const link = document.createElement('a');
      link.href = videoRes.videoUrl;
      link.download = `merged_${mergeClips.length}_clips_${Date.now()}.mp4`;
      link.click();

      toast.success('MP4 동영상 다운로드가 완료되었습니다!');
    } catch {
      toast.error('MP4 동영상 변환 중 오류가 발생했습니다.');
    } finally {
      setIsMergeMp4Converting(false);
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
      <GifStudioNavHeader currentTab="merge" />

      <input
        ref={mergeInputRef}
        type="file"
        accept="image/gif"
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length > 0) processMergeFiles(files);
          if (e.target) e.target.value = '';
        }}
        style={{ display: 'none' }}
      />

      {mergeClips.length === 0 ? (
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
            onSelectSample={handleSelectMergeSample}
            onSelectAllSamples={handleSelectAllMergeSamples}
            loadingSampleId={loadingSampleId}
            isLoading={isMergeExtracting || !!loadingSampleId}
            title="⚡ 즉석 테스트 예시 GIF 파일"
            subtitle="개별 예시 움짤을 추가하거나, 3종 예시를 모두 타임라인에 한 번에 불러와 병합을 테스트하세요."
            actionLabel="클립 추가 ➜"
            allActionLabel="✨ 3개 예시 모두 타임라인에 추가"
          />

          <Card
            {...mergeDrop.getRootProps({
              onClick: () => mergeInputRef.current?.click(),
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
              <LayersRoundedIcon sx={{ fontSize: 38 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              합칠 여러 개의 GIF 파일 업로드
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mb: 2, textAlign: 'center', maxWidth: 500 }}
            >
              2개 이상의 GIF 파일을 선택하거나 이곳으로 드래그 앤 드롭하세요.
              <br />
              순서 배치(Drag & Drop), 구간 자르기, 배속(0.25x~20x), 역재생, 복제를 자유롭게 설정할
              수 있습니다.
            </Typography>
            <Button variant="contained" color="primary" startIcon={<CloudUploadRoundedIcon />}>
              GIF 파일 선택 (다중 선택 가능)
            </Button>
          </Card>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            gap: { xs: 2, lg: 0 },
            flex: '1 1 auto',
            minHeight: 0,
            height: '100%',
            position: 'relative',
          }}
        >
          {/* Left Column: Visual Player & Timeline Strip */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: '1 1 0px',
              minWidth: 0,
              minHeight: 0,
              height: '100%',
              gap: 1.5,
              pr: { lg: 1 },
            }}
          >
            {/* Main Player Card */}
            <Card
              sx={{
                p: 2,
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                flex: '1 1 auto',
                minHeight: 0,
                gap: 1.5,
              }}
            >
              {/* Top Bar: Live vs Encoded toggle & Info Badges */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <ToggleButtonGroup
                  value={activeMergePreviewTab}
                  exclusive
                  onChange={(_, v) => v && setActiveMergePreviewTab(v)}
                  size="small"
                >
                  <ToggleButton value="live" sx={{ fontWeight: 700, px: 1.5, py: 0.5 }}>
                    ⚡ 실시간 시퀀스 미리보기
                  </ToggleButton>
                  <ToggleButton
                    value="encoded"
                    disabled={!mergeResultUrl}
                    sx={{ fontWeight: 700, px: 1.5, py: 0.5 }}
                  >
                    💾 합치기 결과 GIF
                  </ToggleButton>
                </ToggleButtonGroup>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                  {activeMergePreviewTab === 'live' ? (
                    <>
                      {flattenedMergeFrames[mergePlayerIndex] && (
                        <>
                          <Chip
                            size="small"
                            color="primary"
                            label={`클립 #${flattenedMergeFrames[mergePlayerIndex].clipIndex + 1}: ${flattenedMergeFrames[mergePlayerIndex].clipFilename}`}
                            sx={{ fontWeight: 700, maxWidth: 220 }}
                          />
                          <Chip
                            size="small"
                            variant="outlined"
                            color="info"
                            label={`${flattenedMergeFrames[mergePlayerIndex].speedMultiplier}x 배속`}
                            sx={{ fontWeight: 600 }}
                          />
                          <Chip
                            size="small"
                            variant="outlined"
                            color="secondary"
                            label={
                              flattenedMergeFrames[mergePlayerIndex].loopMode === 'reverse'
                                ? '역재생'
                                : flattenedMergeFrames[mergePlayerIndex].loopMode === 'boomerang'
                                  ? '부메랑'
                                  : '정방향'
                            }
                            sx={{ fontWeight: 600 }}
                          />
                          {flattenedMergeFrames[mergePlayerIndex].totalRepeats > 1 && (
                            <Chip
                              size="small"
                              variant="outlined"
                              color="warning"
                              label={`반복 ${flattenedMergeFrames[mergePlayerIndex].repeatIndex}/${flattenedMergeFrames[mergePlayerIndex].totalRepeats}`}
                              sx={{ fontWeight: 600 }}
                            />
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <Chip
                      size="small"
                      color="success"
                      icon={<CheckCircleRoundedIcon />}
                      label={`인코딩 완료 (${formatBytes(getDataUrlByteSize(mergeResultUrl))})`}
                      sx={{ fontWeight: 700 }}
                    />
                  )}
                </Box>
              </Box>

              {/* Visual Screen */}
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  flex: '1 1 auto',
                  minHeight: 0,
                  height: '100%',
                  bgcolor: '#0f172a',
                  borderRadius: 2,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isMergeExtracting ? (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 1.5,
                      color: '#94a3b8',
                    }}
                  >
                    <CircularProgress size={36} color="inherit" />
                    <Typography variant="body2">GIF 프레임을 분석하는 중입니다...</Typography>
                  </Box>
                ) : activeMergePreviewTab === 'encoded' && mergeResultUrl ? (
                  <img
                    src={mergeResultUrl}
                    alt="Merged GIF Output"
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                ) : flattenedMergeFrames[mergePlayerIndex] ? (
                  <img
                    src={flattenedMergeFrames[mergePlayerIndex].dataUrl}
                    alt="Live Merged Frame"
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    합칠 프레임이 없습니다.
                  </Typography>
                )}
              </Box>

              {/* Player Toolbar */}
              {activeMergePreviewTab === 'live' && flattenedMergeFrames.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {/* Scrubber Slider */}
                  <Box sx={{ px: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Slider
                      size="small"
                      value={mergePlayerIndex}
                      min={0}
                      max={Math.max(0, flattenedMergeFrames.length - 1)}
                      onChange={(_, val) => {
                        setMergePlayerIndex(Number(val));
                        setIsPlayingMerge(false);
                      }}
                      sx={{ flex: '1 1 auto' }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        minWidth: 55,
                        textAlign: 'right',
                        color: 'text.secondary',
                      }}
                    >
                      {mergePlayerIndex + 1} / {flattenedMergeFrames.length}
                    </Typography>
                  </Box>

                  {/* Control Buttons */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Tooltip title={isPlayingMerge ? '일시정지' : '실시간 재생'}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => setIsPlayingMerge(!isPlayingMerge)}
                          sx={{
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            '&:hover': { bgcolor: 'primary.dark' },
                          }}
                        >
                          {isPlayingMerge ? (
                            <PauseRoundedIcon fontSize="small" />
                          ) : (
                            <PlayArrowRoundedIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="처음부터 재생">
                        <IconButton size="small" onClick={() => setMergePlayerIndex(0)}>
                          <ReplayRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="이전 프레임">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setIsPlayingMerge(false);
                            setMergePlayerIndex((prev) =>
                              prev <= 0 ? flattenedMergeFrames.length - 1 : prev - 1
                            );
                          }}
                        >
                          <SkipPreviousRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="다음 프레임">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setIsPlayingMerge(false);
                            setMergePlayerIndex((prev) => (prev + 1) % flattenedMergeFrames.length);
                          }}
                        >
                          <SkipNextRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', fontWeight: 600 }}
                      >
                        총 {mergeClips.length}개 클립 · {flattenedMergeFrames.length}개 프레임
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </Card>

            {/* Bottom: Visual Filmora-style Clip Timeline Track Strip */}
            <Card
              onDragOver={(e) => {
                e.preventDefault();
                if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
                  e.dataTransfer.dropEffect = 'copy';
                  setIsExternalDragOverTrack(true);
                }
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setIsExternalDragOverTrack(false);
                }
              }}
              onDrop={(e) => handleClipDrop(e, mergeClips.length)}
              sx={{
                p: 1.5,
                borderRadius: 3,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.25,
                transition: 'all 0.2s ease',
                border: isExternalDragOverTrack ? '2px dashed' : '1px solid',
                borderColor: isExternalDragOverTrack ? 'primary.main' : 'divider',
                bgcolor: isExternalDragOverTrack ? 'primary.lighter' : 'background.paper',
              }}
            >
              {/* Timeline Toolbar Header */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LayersRoundedIcon color="primary" fontSize="small" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.85rem' }}>
                    클립 타임라인 트랙 ({mergeClips.length}개)
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', display: { xs: 'none', md: 'inline' } }}
                  >
                    💡 양쪽 끝 [◀]/[▶] 핸들을 드래그하여 구간을 바로 자르고 조절하세요
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  {/* Split at Playhead button */}
                  <Tooltip title="현재 재생 위치에서 클립을 2개로 분할합니다 (필모라/프리미어 자르기 도구)">
                    <span>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        startIcon={<ContentCutRoundedIcon sx={{ fontSize: 16 }} />}
                        onClick={handleSplitClipAtPlayhead}
                        disabled={mergeClips.length === 0}
                        sx={{ py: 0.35, px: 1.2, fontSize: '0.75rem', fontWeight: 700 }}
                      >
                        현재 위치 분할 (자르기)
                      </Button>
                    </span>
                  </Tooltip>

                  {/* Timeline Zoom Controls */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      bgcolor: 'action.hover',
                      borderRadius: 1.5,
                      p: 0.25,
                      gap: 0.25,
                    }}
                  >
                    <Tooltip title="타임라인 축소">
                      <span>
                        <IconButton
                          size="small"
                          disabled={timelineZoom <= 0.5}
                          onClick={() =>
                            setTimelineZoom((prev) =>
                              Math.max(0.5, Math.round((prev - 0.2) * 10) / 10)
                            )
                          }
                          sx={{ p: 0.3 }}
                        >
                          <ZoomOutRoundedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Typography
                      variant="caption"
                      sx={{
                        px: 0.5,
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        minWidth: 36,
                        textAlign: 'center',
                      }}
                    >
                      {Math.round(timelineZoom * 100)}%
                    </Typography>
                    <Tooltip title="타임라인 확대">
                      <span>
                        <IconButton
                          size="small"
                          disabled={timelineZoom >= 2.5}
                          onClick={() =>
                            setTimelineZoom((prev) =>
                              Math.min(2.5, Math.round((prev + 0.2) * 10) / 10)
                            )
                          }
                          sx={{ p: 0.3 }}
                        >
                          <ZoomInRoundedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>

                  {/* Add GIF button */}
                  <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    startIcon={<AutoAwesomeRoundedIcon />}
                    onClick={(e) => setSampleMenuAnchorEl(e.currentTarget)}
                    sx={{ py: 0.35, px: 1.2, fontSize: '0.75rem', fontWeight: 700 }}
                  >
                    ⚡ 예시 추가
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    startIcon={<AddRoundedIcon />}
                    onClick={() => mergeInputRef.current?.click()}
                    sx={{ py: 0.35, px: 1.2, fontSize: '0.75rem', fontWeight: 700 }}
                  >
                    GIF 추가
                  </Button>
                </Box>
              </Box>

              {/* Horizontal Interactive Timeline Strip */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 1.25,
                  overflowX: 'auto',
                  p: 1,
                  alignItems: 'stretch',
                  minHeight: 118,
                  bgcolor: '#090d16',
                  borderRadius: 2,
                  border: '1px solid #1e293b',
                  userSelect: trimmingState ? 'none' : 'auto',
                }}
              >
                {mergeClips.map((clip, idx) => {
                  const isSelected = clip.id === (activeClip?.id || selectedClipId);
                  const isDragOver = dragOverClipIndex === idx;
                  const isTrimmingThis = trimmingState?.clipId === clip.id;

                  const clipFramesCount = Math.max(1, clip.trimEnd - clip.trimStart + 1);
                  const pxPerFrame = 4.5 * timelineZoom;
                  const blockWidth = Math.max(
                    170,
                    Math.min(650, Math.round(clipFramesCount * pxPerFrame) + 40)
                  );

                  // Sample frames for filmstrip
                  const sampleThumbCount = Math.max(3, Math.min(10, Math.floor(blockWidth / 48)));
                  const sampleIndices: number[] = [];
                  for (let s = 0; s < sampleThumbCount; s += 1) {
                    const ratio = sampleThumbCount <= 1 ? 0 : s / (sampleThumbCount - 1);
                    const fIdx = Math.min(
                      clip.trimEnd,
                      Math.max(
                        clip.trimStart,
                        Math.round(clip.trimStart + ratio * (clip.trimEnd - clip.trimStart))
                      )
                    );
                    sampleIndices.push(fIdx);
                  }

                  return (
                    <Box
                      key={clip.id}
                      draggable={!trimmingState}
                      onDragStart={(e) => handleClipDragStart(e, idx)}
                      onDragOver={(e) => handleClipDragOver(e, idx)}
                      onDrop={(e) => handleClipDrop(e, idx)}
                      onDragEnd={handleClipDragEnd}
                      onClick={() => setSelectedClipId(clip.id)}
                      sx={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        width: blockWidth,
                        minWidth: blockWidth,
                        height: 104,
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: '2px solid',
                        borderColor: isSelected ? '#38bdf8' : isDragOver ? '#a855f7' : '#334155',
                        boxShadow: isSelected ? '0 0 12px rgba(56, 189, 248, 0.45)' : 'none',
                        cursor: 'pointer',
                        userSelect: 'none',
                        transition: trimmingState
                          ? 'none'
                          : 'border-color 0.15s ease, box-shadow 0.15s ease',
                        bgcolor: '#0f172a',
                      }}
                    >
                      {/* Background Filmstrip Frame Images */}
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          opacity: 0.45,
                          pointerEvents: 'none',
                          zIndex: 0,
                        }}
                      >
                        {sampleIndices.map((fIdx, sIdx) => {
                          const frameObj = clip.frames[fIdx] || clip.frames[0];
                          return (
                            <Box
                              key={sIdx}
                              sx={{
                                flex: '1 1 0px',
                                height: '100%',
                                borderRight: '1px solid rgba(255,255,255,0.1)',
                                overflow: 'hidden',
                              }}
                            >
                              {frameObj?.dataUrl && (
                                <img
                                  src={frameObj.dataUrl}
                                  alt={`frame-${fIdx}`}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              )}
                            </Box>
                          );
                        })}
                      </Box>

                      {/* Dark Overlay Gradient for text readability */}
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          background:
                            'linear-gradient(to bottom, rgba(15, 23, 42, 0.88) 0%, rgba(15, 23, 42, 0.4) 45%, rgba(15, 23, 42, 0.92) 100%)',
                          pointerEvents: 'none',
                          zIndex: 1,
                        }}
                      />

                      {/* LEFT TRIM HANDLE (Filmora Style Edge Trimmer) */}
                      <Box
                        onPointerDown={(e) => handleTrimPointerDown(e, clip, 'start', pxPerFrame)}
                        onPointerMove={handleTrimPointerMove}
                        onPointerUp={handleTrimPointerUp}
                        sx={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: 14,
                          zIndex: 10,
                          cursor: 'ew-resize',
                          bgcolor: isSelected ? '#38bdf8' : '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background-color 0.15s ease',
                          touchAction: 'none',
                          '&:hover': {
                            bgcolor: '#0284c7',
                            width: 16,
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: '2px',
                            height: 20,
                            bgcolor: '#ffffff',
                            borderRadius: 1,
                          }}
                        />
                      </Box>

                      {/* RIGHT TRIM HANDLE (Filmora Style Edge Trimmer) */}
                      <Box
                        onPointerDown={(e) => handleTrimPointerDown(e, clip, 'end', pxPerFrame)}
                        onPointerMove={handleTrimPointerMove}
                        onPointerUp={handleTrimPointerUp}
                        sx={{
                          position: 'absolute',
                          right: 0,
                          top: 0,
                          bottom: 0,
                          width: 14,
                          zIndex: 10,
                          cursor: 'ew-resize',
                          bgcolor: isSelected ? '#38bdf8' : '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background-color 0.15s ease',
                          touchAction: 'none',
                          '&:hover': {
                            bgcolor: '#0284c7',
                            width: 16,
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: '2px',
                            height: 20,
                            bgcolor: '#ffffff',
                            borderRadius: 1,
                          }}
                        />
                      </Box>

                      {/* Top Row: Index Badge & Filename & Speed */}
                      <Box
                        sx={{
                          position: 'relative',
                          zIndex: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          px: 2,
                          pt: 0.75,
                          gap: 0.5,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
                          <Chip
                            size="small"
                            label={`#${idx + 1}`}
                            sx={{
                              height: 18,
                              fontSize: '0.68rem',
                              fontWeight: 900,
                              px: 0.2,
                              bgcolor: isSelected ? '#38bdf8' : '#334155',
                              color: '#ffffff',
                            }}
                          />
                          <Typography
                            variant="caption"
                            noWrap
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.72rem',
                              color: '#f8fafc',
                              maxWidth: 160,
                            }}
                          >
                            {clip.filename}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                          <Chip
                            size="small"
                            label={`${clip.speedMultiplier}x`}
                            sx={{
                              height: 16,
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              bgcolor: 'rgba(56, 189, 248, 0.2)',
                              color: '#38bdf8',
                              border: '1px solid rgba(56, 189, 248, 0.4)',
                            }}
                          />
                          {clip.loopMode === 'reverse' && (
                            <Chip
                              size="small"
                              label="역재생"
                              sx={{
                                height: 16,
                                fontSize: '0.62rem',
                                fontWeight: 700,
                                bgcolor: 'rgba(239, 68, 68, 0.2)',
                                color: '#f87171',
                              }}
                            />
                          )}
                          {clip.loopMode === 'boomerang' && (
                            <Chip
                              size="small"
                              label="부메랑"
                              sx={{
                                height: 16,
                                fontSize: '0.62rem',
                                fontWeight: 700,
                                bgcolor: 'rgba(168, 85, 247, 0.2)',
                                color: '#c084fc',
                              }}
                            />
                          )}
                        </Box>
                      </Box>

                      {/* Middle: Drag Reorder Grip / Live Trim Feedback Indicator */}
                      <Box
                        sx={{
                          position: 'relative',
                          zIndex: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          px: 2,
                        }}
                      >
                        {isTrimmingThis ? (
                          <Chip
                            size="small"
                            color="info"
                            label={
                              trimmingState?.handle === 'start'
                                ? `◀ 시작점: ${clip.trimStart + 1}F (총 ${clipFramesCount}F)`
                                : `종료점: ${clip.trimEnd + 1}F (총 ${clipFramesCount}F) ▶`
                            }
                            sx={{ fontWeight: 800, fontSize: '0.7rem', height: 20 }}
                          />
                        ) : (
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#94a3b8',
                              fontWeight: 600,
                              fontSize: '0.68rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                            }}
                          >
                            <DragIndicatorRoundedIcon sx={{ fontSize: 14 }} />
                            드래그하여 순서 이동 · 좌우 끝으로 자르기
                          </Typography>
                        )}
                      </Box>

                      {/* Bottom Row: Frame range & Quick actions */}
                      <Box
                        sx={{
                          position: 'relative',
                          zIndex: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          px: 2,
                          pb: 0.6,
                          pt: 0.4,
                          borderTop: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.68rem',
                            color: '#38bdf8',
                          }}
                        >
                          ✂️ {clip.trimStart + 1}F ~ {clip.trimEnd + 1}F ({clipFramesCount}프레임)
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                          <Tooltip title="왼쪽으로 이동">
                            <span>
                              <IconButton
                                size="small"
                                disabled={idx === 0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveClip(idx, -1);
                                }}
                                sx={{ p: 0.2, color: '#cbd5e1' }}
                              >
                                <ArrowUpwardRoundedIcon
                                  sx={{ fontSize: 13, transform: 'rotate(-90deg)' }}
                                />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="오른쪽으로 이동">
                            <span>
                              <IconButton
                                size="small"
                                disabled={idx === mergeClips.length - 1}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveClip(idx, 1);
                                }}
                                sx={{ p: 0.2, color: '#cbd5e1' }}
                              >
                                <ArrowDownwardRoundedIcon
                                  sx={{ fontSize: 13, transform: 'rotate(-90deg)' }}
                                />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="클립 복제">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDuplicateClip(clip.id);
                              }}
                              sx={{ p: 0.2, color: '#cbd5e1' }}
                            >
                              <ContentCopyRoundedIcon sx={{ fontSize: 13 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="클립 삭제">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClip(clip.id);
                              }}
                              sx={{ p: 0.2, color: '#f87171' }}
                            >
                              <DeleteRoundedIcon sx={{ fontSize: 13 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}

                {/* Drop Zone Box at the end of track */}
                <Box
                  onClick={() => mergeInputRef.current?.click()}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 125,
                    minWidth: 125,
                    height: 104,
                    borderRadius: 2,
                    border: '2px dashed',
                    borderColor: isExternalDragOverTrack ? '#38bdf8' : '#334155',
                    bgcolor: isExternalDragOverTrack
                      ? 'rgba(56, 189, 248, 0.15)'
                      : 'rgba(15, 23, 42, 0.6)',
                    cursor: 'pointer',
                    gap: 0.5,
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      borderColor: '#38bdf8',
                      bgcolor: 'rgba(56, 189, 248, 0.1)',
                    },
                  }}
                >
                  <AddRoundedIcon sx={{ color: '#94a3b8', fontSize: 24 }} />
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#cbd5e1',
                      fontWeight: 700,
                      textAlign: 'center',
                      fontSize: '0.7rem',
                    }}
                  >
                    GIF 드롭 / 추가
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Box>

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

          {/* Right Column: Tabbed Settings (Scrollable) & Fixed Bottom Actions */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: { xs: '100%', lg: `${rightPanelWidth}px` },
              minWidth: { lg: `${rightPanelWidth}px` },
              maxWidth: { lg: `${rightPanelWidth}px` },
              flexShrink: 0,
              height: '100%',
              minHeight: 0,
              overflow: 'hidden',
              pl: { lg: 1 },
            }}
          >
            {/* Scrollable Upper Area: Tabbed Settings Card */}
            <Box
              sx={{
                flex: '1 1 auto',
                minHeight: 0,
                overflowY: 'auto',
                pr: 0.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              <Card
                sx={{
                  p: 2,
                  borderRadius: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}
              >
                {/* Top Segmented Tab Switcher */}
                <ToggleButtonGroup
                  value={mergeSettingsTab}
                  exclusive
                  onChange={(_, v) => v && setMergeSettingsTab(v)}
                  fullWidth
                  size="small"
                >
                  <ToggleButton
                    value="trim"
                    sx={{
                      fontWeight: 700,
                      py: 0.8,
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    <ContentCutRoundedIcon sx={{ fontSize: 16 }} />
                    자르기
                  </ToggleButton>
                  <ToggleButton
                    value="speed"
                    sx={{
                      fontWeight: 700,
                      py: 0.8,
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    <SpeedRoundedIcon sx={{ fontSize: 16 }} />
                    배속 · 루프
                  </ToggleButton>
                  <ToggleButton
                    value="global"
                    sx={{
                      fontWeight: 700,
                      py: 0.8,
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    <AspectRatioRoundedIcon sx={{ fontSize: 16 }} />
                    전체 출력
                  </ToggleButton>
                </ToggleButtonGroup>

                {/* Active Clip Selector Banner */}
                {(mergeSettingsTab === 'trim' || mergeSettingsTab === 'speed') && activeClip && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1,
                      bgcolor: 'primary.lighter',
                      borderRadius: 1.5,
                      gap: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                      <Chip
                        size="small"
                        color="primary"
                        label={`클립 #${mergeClips.findIndex((c) => c.id === activeClip.id) + 1}`}
                        sx={{ fontWeight: 800, fontSize: '0.72rem', height: 20 }}
                      />
                      <Typography
                        variant="caption"
                        noWrap
                        sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.primary' }}
                      >
                        {activeClip.filename}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      variant="outlined"
                      color="primary"
                      label={`${activeClip.originalWidth}x${activeClip.originalHeight}`}
                      sx={{ fontWeight: 700, fontSize: '0.68rem', height: 20 }}
                    />
                  </Box>
                )}

                {/* TAB 1: TRIM & SLICE */}
                {mergeSettingsTab === 'trim' && activeClip && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {/* Trim Frame Range */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          ✂️ 자를 구간 (프레임)
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 800, color: 'primary.main' }}
                        >
                          {activeClip.trimStart + 1}F ~ {activeClip.trimEnd + 1}F (선택:{' '}
                          {activeClip.trimEnd - activeClip.trimStart + 1} /{' '}
                          {activeClip.frames.length}F)
                        </Typography>
                      </Box>

                      <Box sx={{ px: 1 }}>
                        <Slider
                          size="small"
                          value={[activeClip.trimStart, activeClip.trimEnd]}
                          min={0}
                          max={Math.max(0, activeClip.frames.length - 1)}
                          step={1}
                          onChange={(_, val) => {
                            if (Array.isArray(val)) {
                              updateActiveClip({
                                trimStart: Math.min(val[0], val[1]),
                                trimEnd: Math.max(val[0], val[1]),
                              });
                            }
                          }}
                          valueLabelDisplay="auto"
                          valueLabelFormat={(v) => `${v + 1}F`}
                        />
                      </Box>

                      <Button
                        size="small"
                        variant="outlined"
                        color="inherit"
                        onClick={() =>
                          updateActiveClip({
                            trimStart: 0,
                            trimEnd: activeClip.frames.length - 1,
                          })
                        }
                        sx={{ fontSize: '0.72rem', py: 0.3 }}
                      >
                        전체 프레임 구간으로 초기화
                      </Button>
                    </Box>

                    {/* Frame Skip Switch */}
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={activeClip.skipFrames}
                          onChange={(e) => updateActiveClip({ skipFrames: e.target.checked })}
                        />
                      }
                      label={
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          프레임 50% 감량 (용량 최적화)
                        </Typography>
                      }
                    />

                    {/* Clip Actions */}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                        pt: 1,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Button
                        fullWidth
                        size="small"
                        variant="outlined"
                        color="primary"
                        startIcon={<ContentCopyRoundedIcon />}
                        onClick={() => handleDuplicateClip(activeClip.id)}
                        sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                      >
                        이 클립 복제
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteRoundedIcon />}
                        onClick={() => handleDeleteClip(activeClip.id)}
                        sx={{ fontWeight: 700, fontSize: '0.75rem', minWidth: 70 }}
                      >
                        삭제
                      </Button>
                    </Box>
                  </Box>
                )}

                {/* TAB 2: SPEED & LOOP */}
                {mergeSettingsTab === 'speed' && activeClip && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {/* Speed Control */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          ⚡ 재생 배속
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <TextField
                            type="number"
                            size="small"
                            value={activeClip.speedMultiplier}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!isNaN(val)) {
                                updateActiveClip({
                                  speedMultiplier: Math.max(
                                    0.1,
                                    Math.min(20, Math.round(val * 100) / 100)
                                  ),
                                });
                              }
                            }}
                            inputProps={{
                              min: 0.1,
                              max: 20,
                              step: 0.25,
                              style: {
                                padding: '3px 6px',
                                width: 48,
                                textAlign: 'center',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                              },
                            }}
                          />
                          <Chip
                            size="small"
                            color="primary"
                            label={`${activeClip.speedMultiplier}x`}
                            sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                          />
                        </Box>
                      </Box>

                      <Box sx={{ px: 1 }}>
                        <Slider
                          size="small"
                          value={activeClip.speedMultiplier}
                          min={0.25}
                          max={20.0}
                          step={0.25}
                          onChange={(_, v) => updateActiveClip({ speedMultiplier: Number(v) })}
                          marks={[
                            { value: 0.25, label: '0.25x' },
                            { value: 1.0, label: '1x' },
                            { value: 5.0, label: '5x' },
                            { value: 10.0, label: '10x' },
                            { value: 20.0, label: '20x' },
                          ]}
                          valueLabelDisplay="auto"
                          valueLabelFormat={(v) => `${v}x`}
                        />
                      </Box>

                      {/* Preset Chips */}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {[0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0, 5.0, 10.0, 20.0].map((preset) => (
                          <Chip
                            key={preset}
                            label={`${preset}x`}
                            size="small"
                            clickable
                            onClick={() => updateActiveClip({ speedMultiplier: preset })}
                            color={activeClip.speedMultiplier === preset ? 'primary' : 'default'}
                            variant={activeClip.speedMultiplier === preset ? 'filled' : 'outlined'}
                            sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                          />
                        ))}
                      </Box>
                    </Box>

                    {/* Loop Direction */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        🔄 재생 방향 (루프)
                      </Typography>
                      <ToggleButtonGroup
                        value={activeClip.loopMode}
                        exclusive
                        onChange={(_, v) => v && updateActiveClip({ loopMode: v })}
                        fullWidth
                        size="small"
                      >
                        <ToggleButton
                          value="normal"
                          sx={{ fontWeight: 600, py: 0.5, fontSize: '0.75rem' }}
                        >
                          정방향
                        </ToggleButton>
                        <ToggleButton
                          value="reverse"
                          sx={{ fontWeight: 600, py: 0.5, fontSize: '0.75rem' }}
                        >
                          역재생 (거꾸로)
                        </ToggleButton>
                        <ToggleButton
                          value="boomerang"
                          sx={{ fontWeight: 600, py: 0.5, fontSize: '0.75rem' }}
                        >
                          부메랑 루프
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </Box>

                    {/* Repeat Count */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        🔁 이 클립 반복 횟수
                      </Typography>
                      <ToggleButtonGroup
                        value={activeClip.repeatCount}
                        exclusive
                        onChange={(_, v) => v && updateActiveClip({ repeatCount: v })}
                        fullWidth
                        size="small"
                      >
                        {[1, 2, 3, 5].map((rep) => (
                          <ToggleButton
                            key={rep}
                            value={rep}
                            sx={{ fontWeight: 600, py: 0.5, fontSize: '0.75rem' }}
                          >
                            {rep === 1 ? '1회 (기본)' : `${rep}회 반복`}
                          </ToggleButton>
                        ))}
                      </ToggleButtonGroup>
                    </Box>
                  </Box>
                )}

                {/* TAB 3: GLOBAL OUTPUT */}
                {mergeSettingsTab === 'global' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {/* Resolution Mode */}
                    <FormControl size="small" fullWidth>
                      <InputLabel>출력 해상도 기준</InputLabel>
                      <Select
                        value={mergeResolutionMode}
                        label="출력 해상도 기준"
                        onChange={(e) =>
                          setMergeResolutionMode(e.target.value as 'first' | 'max' | 'min')
                        }
                      >
                        <MenuItem value="first">
                          첫 번째 GIF 기준 ({mergeClips[0]?.originalWidth}x
                          {mergeClips[0]?.originalHeight})
                        </MenuItem>
                        <MenuItem value="max">가장 큰 해상도 기준 (최대 화질)</MenuItem>
                        <MenuItem value="min">가장 작은 해상도 기준 (용량 최적화)</MenuItem>
                      </Select>
                    </FormControl>

                    {/* Fit Mode */}
                    <FormControl size="small" fullWidth>
                      <InputLabel>화면 비율 맞춤 방식</InputLabel>
                      <Select
                        value={mergeFitMode}
                        label="화면 비율 맞춤 방식"
                        onChange={(e) =>
                          setMergeFitMode(e.target.value as 'contain' | 'cover' | 'fill')
                        }
                      >
                        <MenuItem value="contain">비율 유지 맞춤 (여백 채우기 - 권장)</MenuItem>
                        <MenuItem value="cover">화면 꽉 채우기 (중앙 크롭)</MenuItem>
                        <MenuItem value="fill">화면에 꽉 맞게 늘리기 (Stretch)</MenuItem>
                      </Select>
                    </FormControl>

                    {/* Background Color */}
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}
                      >
                        여백 배경 색상
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <input
                          type="color"
                          value={mergeBgColor === 'transparent' ? '#ffffff' : mergeBgColor}
                          onChange={(e) => setMergeBgColor(e.target.value)}
                          style={{
                            width: 44,
                            height: 34,
                            borderRadius: 6,
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        />
                        <Button
                          size="small"
                          variant={mergeBgColor === '#ffffff' ? 'contained' : 'outlined'}
                          onClick={() => setMergeBgColor('#ffffff')}
                          sx={{ fontSize: '0.75rem', py: 0.3 }}
                        >
                          흰색
                        </Button>
                        <Button
                          size="small"
                          variant={mergeBgColor === '#000000' ? 'contained' : 'outlined'}
                          onClick={() => setMergeBgColor('#000000')}
                          sx={{ fontSize: '0.75rem', py: 0.3 }}
                        >
                          검은색
                        </Button>
                        <Button
                          size="small"
                          variant={mergeBgColor === 'transparent' ? 'contained' : 'outlined'}
                          onClick={() => setMergeBgColor('transparent')}
                          sx={{ fontSize: '0.75rem', py: 0.3 }}
                        >
                          투명
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Card>
            </Box>

            {/* Fixed Bottom Actions Dock */}
            <Box
              sx={{
                flexShrink: 0,
                pt: 1.5,
                borderTop: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleApplyMerge}
                disabled={isMergeProcessing || mergeClips.length === 0}
                startIcon={
                  isMergeProcessing ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <LayersRoundedIcon />
                  )
                }
                sx={{ py: 1.2, borderRadius: 2, fontWeight: 700 }}
              >
                {isMergeProcessing
                  ? `GIF 합치는 중 (${mergeProgress}%)`
                  : `GIF ${mergeClips.length}개 합치기 적용 (새 GIF 인코딩)`}
              </Button>

              {mergeResultUrl && (
                <>
                  <Button
                    fullWidth
                    variant="contained"
                    color="secondary"
                    onClick={() =>
                      downloadDataUrl(
                        mergeResultUrl,
                        `merged_${mergeClips.length}_clips_${Date.now()}.gif`
                      )
                    }
                    startIcon={<DownloadRoundedIcon />}
                    sx={{ py: 1.1, borderRadius: 2, fontWeight: 600 }}
                  >
                    GIF 다운로드 ({formatBytes(getDataUrlByteSize(mergeResultUrl))})
                  </Button>

                  <Button
                    fullWidth
                    variant="contained"
                    color="info"
                    onClick={handleDownloadMergeMp4}
                    disabled={isMergeMp4Converting}
                    startIcon={
                      isMergeMp4Converting ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <MovieCreationRoundedIcon />
                      )
                    }
                    sx={{ py: 1.1, borderRadius: 2, fontWeight: 600 }}
                  >
                    {isMergeMp4Converting
                      ? `MP4 동영상 변환 중 (${mergeMp4Progress}%)`
                      : mergeMp4Size > 0
                        ? `MP4 다운로드 (${formatBytes(mergeMp4Size)})`
                        : 'MP4 동영상 다운로드'}
                  </Button>
                </>
              )}

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  onClick={(e) => setSampleMenuAnchorEl(e.currentTarget)}
                  startIcon={<AutoAwesomeRoundedIcon />}
                  sx={{ py: 0.8, borderRadius: 2, fontWeight: 700, fontSize: '0.78rem' }}
                >
                  ⚡ 예시 클립 추가
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  onClick={() => mergeInputRef.current?.click()}
                  startIcon={<AddRoundedIcon />}
                  sx={{ py: 0.8, borderRadius: 2, fontWeight: 600, fontSize: '0.78rem' }}
                >
                  + GIF 추가
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    setMergeClips([]);
                    setSelectedClipId(null);
                    setMergeResultUrl('');
                    setMergeMp4Url('');
                    setMergeMp4Size(0);
                    toast.info('전체 클립이 초기화되었습니다.');
                  }}
                  startIcon={<DeleteRoundedIcon />}
                  sx={{
                    py: 0.8,
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    minWidth: 100,
                    whiteSpace: 'nowrap',
                  }}
                >
                  전체 비우기
                </Button>
              </Box>
            </Box>
          </Box>
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
              handleSelectMergeSample(sample);
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

        <MenuItem
          onClick={() => {
            setSampleMenuAnchorEl(null);
            handleSelectAllMergeSamples();
          }}
          sx={{
            mt: 0.5,
            borderTop: '1px dashed',
            borderColor: 'divider',
            color: 'primary.main',
            fontWeight: 700,
            py: 1,
            borderRadius: 1,
          }}
        >
          ✨ 3개 예시 GIF 모두 추가하기
        </MenuItem>
      </Menu>
    </DashboardContent>
  );
}
