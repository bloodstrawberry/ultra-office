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
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded';
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
  formatBytes,
  downloadDataUrl,
  createStudioGif,
  extractGifFrames,
  convertGifToVideo,
  getDataUrlByteSize,
  type StudioClipItem,
  type StudioTextItem,
} from '../utils/gif-processor';

// ----------------------------------------------------------------------

export function GifStudioCreateView() {
  const [clips, setClips] = useState<StudioClipItem[]>([]);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);

  // ─── Multi-Track Text Clips (T1 Track) ───
  const [textClips, setTextClips] = useState<StudioTextItem[]>([
    {
      id: 'text-1',
      text: 'YOUR TEXT HERE / TITLE / KEYWORDS',
      startTime: 0,
      duration: 3.0,
      fontSize: 28,
      fontColor: '#ffffff',
      fontBgColor: 'rgba(0,0,0,0.6)',
      position: 'bottom',
    },
  ]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>('text-1');
  const [textTrimmingState, setTextTrimmingState] = useState<{
    textId: string;
    mode: 'move' | 'trim-start' | 'trim-end';
    startX: number;
    initialStartTime: number;
    initialDuration: number;
  } | null>(null);

  const [inspectorTab, setInspectorTab] = useState<'clip' | 'text' | 'fx' | 'export'>('clip');
  const [aspectRatioPreset, setAspectRatioPreset] = useState<
    '1:1' | '16:9' | '9:16' | '4:3' | 'custom'
  >('1:1');
  const [fps, setFps] = useState<number>(10);
  const [fitMode, setFitMode] = useState<'contain' | 'cover' | 'stretch' | 'fill'>('contain');
  const [bgColor, setBgColor] = useState<string>('transparent');
  const [targetWidth, setTargetWidth] = useState<number>(480);
  const [targetHeight, setTargetHeight] = useState<number>(480);
  const [globalLoopMode, setGlobalLoopMode] = useState<'normal' | 'reverse' | 'boomerang'>(
    'normal'
  );
  const [sampleInterval, setSampleInterval] = useState<number>(10);

  const [overlayText, setOverlayText] = useState<string>('');
  const [fontSize, setFontSize] = useState<number>(28);
  const [fontColor, setFontColor] = useState<string>('#ffffff');
  const [fontBgColor, setFontBgColor] = useState<string>('rgba(0,0,0,0.5)');
  const [textPosition, setTextPosition] = useState<
    'top' | 'center' | 'bottom' | 'top-left' | 'bottom-right'
  >('bottom');
  const [textApplyScope, setTextApplyScope] = useState<'all' | 'selected'>('all');

  const [currentPlayheadFrameIdx, setCurrentPlayheadFrameIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [timelineZoom, setTimelineZoom] = useState<number>(1.0);

  const [isEncoding, setIsEncoding] = useState<boolean>(false);
  const [encodeProgress, setEncodeProgress] = useState<number>(0);
  const [resultGifUrl, setResultGifUrl] = useState<string>('');
  const [isConvertingMp4, setIsConvertingMp4] = useState<boolean>(false);
  const [mp4Url, setMp4Url] = useState<string>('');
  const [mp4Size, setMp4Size] = useState<number>(0);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);

  const [loadingSampleId, setLoadingSampleId] = useState<string | null>(null);
  const [sampleMenuAnchorEl, setSampleMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [draggedClipIndex, setDraggedClipIndex] = useState<number | null>(null);
  const [dragOverClipIndex, setDragOverClipIndex] = useState<number | null>(null);
  const [dropPosition, setDropPosition] = useState<'left' | 'right' | null>(null);
  const [isExternalDragOverTrack, setIsExternalDragOverTrack] = useState<boolean>(false);
  const [copiedClip, setCopiedClip] = useState<StudioClipItem | null>(null);

  const [trimmingState, setTrimmingState] = useState<{
    clipId: string;
    handle: 'start' | 'end';
    startX: number;
    initialTrimStart: number;
    initialTrimEnd: number;
    initialDuration: number;
    clipType: 'image' | 'gif';
    totalFrames: number;
    pxPerUnit: number;
  } | null>(null);

  const [rightPanelWidth, setRightPanelWidth] = useState<number>(380);
  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(380);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const timelineScrollRef = useRef<HTMLDivElement>(null);
  const timelineTrackRef = useRef<HTMLDivElement>(null);
  const previewFrameRef = useRef<HTMLDivElement>(null);
  const [canvasDraggingTextId, setCanvasDraggingTextId] = useState<string | null>(null);
  const isScrubbingRef = useRef<boolean>(false);

  const handleCanvasTextPointerDown = (e: React.PointerEvent, textId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    setSelectedTextId(textId);
    setCanvasDraggingTextId(textId);
    setInspectorTab('text');
  };

  const handleCanvasTextPointerMove = (e: React.PointerEvent) => {
    if (!canvasDraggingTextId || !previewFrameRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = previewFrameRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPct = Math.max(5, Math.min(95, parseFloat(((x / rect.width) * 100).toFixed(1))));
    const yPct = Math.max(5, Math.min(95, parseFloat(((y / rect.height) * 100).toFixed(1))));

    setTextClips((prev) =>
      prev.map((t) =>
        t.id === canvasDraggingTextId ? { ...t, xPercent: xPct, yPercent: yPct } : t
      )
    );
  };

  const handleCanvasTextPointerUp = (e: React.PointerEvent) => {
    if (!canvasDraggingTextId) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    setCanvasDraggingTextId(null);
    setResultGifUrl('');
    setMp4Url('');
    setMp4Size(0);
  };

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

  const selectedClip = clips.find((c) => c.id === selectedClipId) || clips[0] || null;

  const flattenedTimelineFrames = React.useMemo(() => {
    if (!clips || clips.length === 0) return [];
    const framesList: {
      clipId: string;
      clipIndex: number;
      clipName: string;
      frameIndexInClip: number;
      dataUrl: string;
      delay: number;
      speedMultiplier: number;
      rotation: number;
      flipH: boolean;
      flipV: boolean;
      filter: string;
    }[] = [];

    const defaultImageTickMs = Math.max(50, Math.round(1000 / Math.max(1, fps)));

    clips.forEach((clip, cIdx) => {
      if (clip.type === 'image' || !clip.frames || clip.frames.length === 0) {
        const durationSec = Math.max(0.05, clip.duration || 1.0);
        const totalDurationMs = durationSec * 1000;
        const speed = Math.max(0.1, clip.speedMultiplier || 1.0);
        const effectiveDurationMs = totalDurationMs / speed;
        const frameCount = Math.max(1, Math.round(effectiveDurationMs / defaultImageTickMs));
        const frameDelay = Math.max(30, Math.round(effectiveDurationMs / frameCount));
        const repeats = Math.max(1, clip.repeatCount || 1);

        for (let r = 0; r < repeats; r += 1) {
          for (let k = 0; k < frameCount; k += 1) {
            framesList.push({
              clipId: clip.id,
              clipIndex: cIdx,
              clipName: clip.name,
              frameIndexInClip: k,
              dataUrl: clip.src,
              delay: frameDelay,
              speedMultiplier: clip.speedMultiplier || 1.0,
              rotation: clip.rotation || 0,
              flipH: !!clip.flipH,
              flipV: !!clip.flipV,
              filter: clip.filter || 'none',
            });
          }
        }
      } else {
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
              10,
              Math.round(rawDelay / Math.max(0.1, clip.speedMultiplier || 1.0))
            );
            framesList.push({
              clipId: clip.id,
              clipIndex: cIdx,
              clipName: clip.name,
              frameIndexInClip: fIdx,
              dataUrl: f.dataUrl,
              delay: effectiveDelay,
              speedMultiplier: clip.speedMultiplier || 1.0,
              rotation: clip.rotation || 0,
              flipH: !!clip.flipH,
              flipV: !!clip.flipV,
              filter: clip.filter || 'none',
            });
          });
        }
      }
    });

    return framesList;
  }, [clips, fps]);

  const totalTimelineDurationSec = React.useMemo(() => {
    if (!clips || clips.length === 0) return 0;
    return clips.reduce((sum, c) => {
      const speed = Math.max(0.1, c.speedMultiplier || 1.0);
      const repeats = Math.max(1, c.repeatCount || 1);
      let dur = c.duration || 1.0;
      if (c.type === 'gif' && c.frames && c.frames.length > 0) {
        const start = Math.max(0, Math.min(c.trimStart ?? 0, c.frames.length - 1));
        const end = Math.max(
          start,
          Math.min(c.trimEnd ?? c.frames.length - 1, c.frames.length - 1)
        );
        const sliced = c.frames.slice(start, end + 1);
        const rawMs = sliced.reduce((s, f) => s + (f.delay || 100), 0);
        dur = rawMs / 1000;
      }
      return sum + (dur / speed) * repeats;
    }, 0);
  }, [clips]);

  useEffect(() => {
    if (
      flattenedTimelineFrames.length > 0 &&
      currentPlayheadFrameIdx >= flattenedTimelineFrames.length
    ) {
      setCurrentPlayheadFrameIdx(0);
    }
  }, [flattenedTimelineFrames.length, currentPlayheadFrameIdx]);

  useEffect(() => {
    if (!isPlaying || flattenedTimelineFrames.length <= 1) return undefined;
    const current = flattenedTimelineFrames[currentPlayheadFrameIdx] || flattenedTimelineFrames[0];
    const timerDelay = Math.max(10, current?.delay || 100);

    const timer = setTimeout(() => {
      setCurrentPlayheadFrameIdx((prev) => (prev + 1) % flattenedTimelineFrames.length);
    }, timerDelay);

    return () => clearTimeout(timer);
  }, [isPlaying, flattenedTimelineFrames, currentPlayheadFrameIdx]);

  const processAndAddFiles = useCallback(
    async (files: File[], insertAtIndex?: number) => {
      if (!files || files.length === 0) return;
      setIsExtracting(true);
      toast.info(`${files.length}개 미디어 파일을 타임라인에 분석/추가하고 있습니다...`);

      try {
        const newClips: StudioClipItem[] = [];

        for (const file of files) {
          const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');

          if (isGif) {
            try {
              const res = await extractGifFrames(file);
              if (res.frames.length > 0) {
                const totalDurSec = res.totalDuration / 1000;
                newClips.push({
                  id: `clip_gif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                  type: 'gif',
                  name: file.name,
                  src: res.frames[0].dataUrl,
                  originalWidth: res.width,
                  originalHeight: res.height,
                  duration: totalDurSec,
                  frames: res.frames,
                  trimStart: 0,
                  trimEnd: res.frames.length - 1,
                  speedMultiplier: 1.0,
                  loopMode: 'normal',
                  repeatCount: 1,
                  skipFrames: false,
                  rotation: 0,
                  flipH: false,
                  flipV: false,
                  filter: 'none',
                });
              }
            } catch {
              toast.error(`'${file.name}' GIF 프레임 디코딩에 실패했습니다.`);
            }
          } else {
            const src = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target?.result as string);
              reader.readAsDataURL(file);
            });

            const img = new Image();
            img.src = src;
            await new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
            });

            newClips.push({
              id: `clip_img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
              type: 'image',
              name: file.name,
              src,
              originalWidth: img.naturalWidth || 480,
              originalHeight: img.naturalHeight || 480,
              duration: 1.0,
              trimStart: 0,
              trimEnd: 0,
              speedMultiplier: 1.0,
              loopMode: 'normal',
              repeatCount: 1,
              skipFrames: false,
              rotation: 0,
              flipH: false,
              flipV: false,
              filter: 'none',
            });
          }
        }

        setClips((prev) => {
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

        setResultGifUrl('');
        setMp4Url('');
        setMp4Size(0);
        toast.success(`${newClips.length}개 클립이 타임라인에 추가되었습니다!`);
      } catch {
        toast.error('파일 처리 중 오류가 발생했습니다.');
      } finally {
        setIsExtracting(false);
      }
    },
    [selectedClipId]
  );

  const createDrop = useImageDropPaste({
    onFiles: (files) => processAndAddFiles(files),
    multiple: true,
    disabled: false,
  });

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items || items.length === 0) return;

      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            imageFiles.push(file);
          }
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault();
        processAndAddFiles(imageFiles);
        toast.success(
          `📋 클립보드에서 ${imageFiles.length}개 이미지를 불러와 타임라인에 추가했습니다!`
        );
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [processAndAddFiles]);

  const handleDuplicateClip = (clipId: string) => {
    setClips((prev) => {
      const idx = prev.findIndex((c) => c.id === clipId);
      if (idx === -1) return prev;
      const target = prev[idx];
      const cloned: StudioClipItem = {
        ...target,
        id: `clip_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name: `${target.name} (복제본)`,
      };
      const updated = [...prev];
      updated.splice(idx + 1, 0, cloned);
      setSelectedClipId(cloned.id);
      return updated;
    });
    setResultGifUrl('');
    setMp4Url('');
    setMp4Size(0);
    toast.success('클립이 복제되었습니다.');
  };

  const handleDeleteClip = useCallback(
    (clipId: string) => {
      setClips((prev) => {
        const filtered = prev.filter((c) => c.id !== clipId);
        if (selectedClipId === clipId) {
          setSelectedClipId(filtered[0]?.id || null);
        }
        return filtered;
      });
      setResultGifUrl('');
      setMp4Url('');
      setMp4Size(0);
      toast.info('클립이 삭제되었습니다.');
    },
    [selectedClipId]
  );

  const handleDeleteTextClip = useCallback((textId: string) => {
    setTextClips((prev) => prev.filter((t) => t.id !== textId));
    setSelectedTextId((prev) => (prev === textId ? null : prev));
    setResultGifUrl('');
    setMp4Url('');
    toast.info('자막이 삭제되었습니다.');
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        if (selectedClip) {
          e.preventDefault();
          setCopiedClip({ ...selectedClip });
          toast.success(`📋 '${selectedClip.name}' 클립이 복사되었습니다 (Ctrl+V로 붙여넣기)`);
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        if (copiedClip) {
          e.preventDefault();
          const newId = `${copiedClip.id}_copy_${Date.now()}`;
          const newClip: StudioClipItem = {
            ...copiedClip,
            id: newId,
            name: `${copiedClip.name} (복사본)`,
          };
          setClips((prev) => {
            const selIdx = prev.findIndex((c) => c.id === selectedClipId);
            const copy = [...prev];
            if (selIdx !== -1) {
              copy.splice(selIdx + 1, 0, newClip);
            } else {
              copy.push(newClip);
            }
            return copy;
          });
          setSelectedClipId(newId);
          setResultGifUrl('');
          setMp4Url('');
          setMp4Size(0);
          toast.success(`📋 복사된 클립이 타임라인에 붙여넣기되었습니다.`);
        }
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedTextId) {
          e.preventDefault();
          handleDeleteTextClip(selectedTextId);
        } else if (selectedClip && clips.length > 1) {
          e.preventDefault();
          handleDeleteClip(selectedClip.id);
        }
        return;
      }

      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedClip,
    copiedClip,
    selectedClipId,
    clips.length,
    selectedTextId,
    handleDeleteClip,
    handleDeleteTextClip,
  ]);

  const handleSelectSample = async (sample: GifSampleItem) => {
    setLoadingSampleId(sample.id);
    toast.info(`'${sample.label}' 예시 파일을 타임라인에 추가하고 있습니다...`);
    try {
      const file = await fetchSampleGifFile(sample);
      await processAndAddFiles([file]);
    } catch {
      toast.error('예시 GIF 파일을 로드하지 못했습니다.');
    } finally {
      setLoadingSampleId(null);
    }
  };

  const handleSelectAllSamples = async () => {
    setIsExtracting(true);
    toast.info('3종 예시 GIF를 모두 타임라인에 추가하는 중입니다...');
    try {
      const files = await Promise.all(GIF_SAMPLE_LIST.map((s) => fetchSampleGifFile(s)));
      await processAndAddFiles(files);
    } catch {
      toast.error('예시 GIF 일괄 불러오기에 실패했습니다.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleUpdateClip = (clipId: string, partial: Partial<StudioClipItem>) => {
    setClips((prev) => prev.map((c) => (c.id === clipId ? { ...c, ...partial } : c)));
    setResultGifUrl('');
    setMp4Url('');
    setMp4Size(0);
  };

  const handleMoveClip = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= clips.length) return;
    setClips((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(index, 1);
      copy.splice(targetIdx, 0, removed);
      return copy;
    });
    setResultGifUrl('');
    setMp4Url('');
    setMp4Size(0);
  };

  const handleSplitClipAtPlayhead = () => {
    if (clips.length === 0) return;

    const currentFrame = flattenedTimelineFrames[currentPlayheadFrameIdx];
    let targetClip = currentFrame ? clips.find((c) => c.id === currentFrame.clipId) : selectedClip;
    if (!targetClip) targetClip = selectedClip || clips[0];
    if (!targetClip) return;

    if (targetClip.type === 'gif' && targetClip.frames && targetClip.frames.length > 0) {
      const clipStart = targetClip.trimStart;
      const clipEnd = targetClip.trimEnd;
      const length = clipEnd - clipStart + 1;

      if (length <= 2) {
        toast.error('클립이 너무 짧아 분할할 수 없습니다 (최소 3프레임 필요).');
        return;
      }

      let splitPoint =
        currentFrame && currentFrame.clipId === targetClip.id
          ? clipStart + currentFrame.frameIndexInClip
          : Math.floor((clipStart + clipEnd) / 2);

      if (splitPoint <= clipStart) splitPoint = clipStart + 1;
      if (splitPoint >= clipEnd) splitPoint = clipEnd - 1;

      const part1Id = `${targetClip.id}_p1_${Date.now()}`;
      const part2Id = `${targetClip.id}_p2_${Date.now()}`;

      const part1: StudioClipItem = {
        ...targetClip,
        id: part1Id,
        name: `${targetClip.name} (파트 1)`,
        trimStart: clipStart,
        trimEnd: splitPoint,
      };

      const part2: StudioClipItem = {
        ...targetClip,
        id: part2Id,
        name: `${targetClip.name} (파트 2)`,
        trimStart: splitPoint + 1,
        trimEnd: clipEnd,
      };

      setClips((prev) => {
        const targetIdx = prev.findIndex((c) => c.id === targetClip.id);
        if (targetIdx === -1) return prev;
        const copy = [...prev];
        copy.splice(targetIdx, 1, part1, part2);
        return copy;
      });

      setSelectedClipId(part2Id);
      setResultGifUrl('');
      setMp4Url('');
      setMp4Size(0);
      toast.success(`✂️ 클립이 #${splitPoint + 1}F 위치에서 2개로 분할되었습니다!`);
    } else {
      const currentDur = targetClip.duration || 1.0;
      if (currentDur <= 0.2) {
        toast.error('이미지 지속시간이 너무 짧아 분할할 수 없습니다.');
        return;
      }
      const halfDur = parseFloat((currentDur / 2).toFixed(2));
      const part1Id = `${targetClip.id}_p1_${Date.now()}`;
      const part2Id = `${targetClip.id}_p2_${Date.now()}`;

      const part1: StudioClipItem = {
        ...targetClip,
        id: part1Id,
        name: `${targetClip.name} (1/2)`,
        duration: halfDur,
      };
      const part2: StudioClipItem = {
        ...targetClip,
        id: part2Id,
        name: `${targetClip.name} (2/2)`,
        duration: halfDur,
      };

      setClips((prev) => {
        const targetIdx = prev.findIndex((c) => c.id === targetClip.id);
        if (targetIdx === -1) return prev;
        const copy = [...prev];
        copy.splice(targetIdx, 1, part1, part2);
        return copy;
      });

      setSelectedClipId(part2Id);
      setResultGifUrl('');
      setMp4Url('');
      setMp4Size(0);
      toast.success(`✂️ 이미지 클립이 각 ${halfDur}초로 2개 분할되었습니다!`);
    }
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
      setDropPosition('left');
    } else if (draggedClipIndex !== null) {
      e.dataTransfer.dropEffect = 'move';
      setDragOverClipIndex(index);
      const rect = e.currentTarget.getBoundingClientRect();
      const midX = rect.left + rect.width / 2;
      setDropPosition(e.clientX < midX ? 'left' : 'right');
    }
  };

  const handleClipDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setIsExternalDragOverTrack(false);
    const pos = dropPosition;
    setDragOverClipIndex(null);
    setDropPosition(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const insertIdx = pos === 'right' ? targetIndex + 1 : targetIndex;
      processAndAddFiles(Array.from(e.dataTransfer.files), insertIdx);
      return;
    }

    if (draggedClipIndex !== null && targetIndex !== null) {
      setClips((prev) => {
        const copy = [...prev];
        const [dragged] = copy.splice(draggedClipIndex, 1);
        let insertIdx = targetIndex;
        if (pos === 'right') {
          insertIdx = draggedClipIndex < targetIndex ? targetIndex : targetIndex + 1;
        } else {
          insertIdx = draggedClipIndex < targetIndex ? targetIndex - 1 : targetIndex;
        }
        insertIdx = Math.max(0, Math.min(copy.length, insertIdx));
        copy.splice(insertIdx, 0, dragged);
        return copy;
      });
      setResultGifUrl('');
      setMp4Url('');
      setMp4Size(0);
      toast.success('타임라인 클립 순서가 변경되었습니다.');
    }
    setDraggedClipIndex(null);
  };

  const handleClipDragEnd = () => {
    setDraggedClipIndex(null);
    setDragOverClipIndex(null);
    setDropPosition(null);
    setIsExternalDragOverTrack(false);
  };

  // Timeline Layouts & Scissor Playhead Tracking
  const getClipPixelWidth = useCallback(
    (clip: StudioClipItem) => {
      let durSec = 1.0;
      if (clip.type === 'gif' && clip.frames && clip.frames.length > 0) {
        const start = Math.max(0, clip.trimStart ?? 0);
        const end = Math.max(
          start,
          Math.min(clip.trimEnd ?? clip.frames.length - 1, clip.frames.length - 1)
        );
        const rawMs = clip.frames.slice(start, end + 1).reduce((s, f) => s + (f.delay || 100), 0);
        durSec = rawMs / 1000 / Math.max(0.1, clip.speedMultiplier || 1.0);
      } else {
        durSec = Math.max(
          0.05,
          (clip.duration || 1.0) / Math.max(0.1, clip.speedMultiplier || 1.0)
        );
      }
      return Math.max(24, Math.round(durSec * 100 * timelineZoom));
    },
    [timelineZoom]
  );

  const clipLayouts = React.useMemo(() => {
    let currentX = 0;
    return clips.map((c) => {
      const width = getClipPixelWidth(c);
      const startX = currentX;
      currentX += width + 8;
      return { clipId: c.id, startX, width, endX: startX + width };
    });
  }, [clips, getClipPixelWidth]);

  const playheadPixelLeft = React.useMemo(() => {
    if (flattenedTimelineFrames.length === 0) return 0;
    const curFrame = flattenedTimelineFrames[currentPlayheadFrameIdx] || flattenedTimelineFrames[0];
    if (!curFrame) return 0;
    const layout = clipLayouts.find((l) => l.clipId === curFrame.clipId);
    if (!layout) return 0;
    const clip = clips.find((c) => c.id === curFrame.clipId);
    if (!clip) return layout.startX;

    const clipFrames = flattenedTimelineFrames.filter((f) => f.clipId === clip.id);
    const totalFramesInClip = Math.max(1, clipFrames.length);
    const ratio = Math.max(0, Math.min(1, curFrame.frameIndexInClip / totalFramesInClip));
    return layout.startX + ratio * layout.width;
  }, [flattenedTimelineFrames, currentPlayheadFrameIdx, clipLayouts, clips]);

  const handleTimelineScrub = useCallback(
    (e: React.PointerEvent) => {
      if (flattenedTimelineFrames.length === 0 || !timelineTrackRef.current) return;
      const rect = timelineTrackRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left - 44;
      if (clickX < 0) {
        setCurrentPlayheadFrameIdx(0);
        return;
      }

      let targetFrameIdx = 0;
      let minDistance = Infinity;

      for (let i = 0; i < flattenedTimelineFrames.length; i += 1) {
        const frame = flattenedTimelineFrames[i];
        const layout = clipLayouts.find((l) => l.clipId === frame.clipId);
        if (layout) {
          const clipFrames = flattenedTimelineFrames.filter((f) => f.clipId === frame.clipId);
          const ratio = frame.frameIndexInClip / Math.max(1, clipFrames.length);
          const frameX = layout.startX + ratio * layout.width;
          const dist = Math.abs(frameX - clickX);
          if (dist < minDistance) {
            minDistance = dist;
            targetFrameIdx = i;
          }
        }
      }

      setIsPlaying(false);
      setCurrentPlayheadFrameIdx(targetFrameIdx);
      const targetFrame = flattenedTimelineFrames[targetFrameIdx];
      if (targetFrame && targetFrame.clipId !== selectedClipId) {
        setSelectedClipId(targetFrame.clipId);
      }
    },
    [flattenedTimelineFrames, clipLayouts, selectedClipId]
  );

  const handleTrimPointerDown = (
    e: React.PointerEvent,
    clip: StudioClipItem,
    handle: 'start' | 'end'
  ) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    setSelectedClipId(clip.id);
    const clipWidth = getClipPixelWidth(clip);
    const totalFrames = clip.frames?.length || 1;
    const pxPerFrame = Math.max(
      0.5,
      clipWidth / Math.max(1, (clip.trimEnd || totalFrames - 1) - (clip.trimStart || 0) + 1)
    );

    setTrimmingState({
      clipId: clip.id,
      handle,
      startX: e.clientX,
      initialTrimStart: clip.trimStart || 0,
      initialTrimEnd: clip.trimEnd || (clip.frames?.length ? clip.frames.length - 1 : 0),
      initialDuration: clip.duration || 1.0,
      clipType: clip.type,
      totalFrames,
      pxPerUnit: clip.type === 'gif' ? pxPerFrame : 100 * timelineZoom,
    });
  };

  const handleTrimPointerMove = (e: React.PointerEvent) => {
    if (!trimmingState) return;
    e.preventDefault();
    e.stopPropagation();

    const deltaX = e.clientX - trimmingState.startX;

    if (trimmingState.clipType === 'gif') {
      const deltaFrames = Math.round(deltaX / trimmingState.pxPerUnit);
      if (trimmingState.handle === 'start') {
        const newStart = Math.max(
          0,
          Math.min(trimmingState.initialTrimEnd - 1, trimmingState.initialTrimStart + deltaFrames)
        );
        setClips((prev) =>
          prev.map((c) => (c.id === trimmingState.clipId ? { ...c, trimStart: newStart } : c))
        );
      } else {
        const newEnd = Math.max(
          trimmingState.initialTrimStart + 1,
          Math.min(trimmingState.totalFrames - 1, trimmingState.initialTrimEnd + deltaFrames)
        );
        setClips((prev) =>
          prev.map((c) => (c.id === trimmingState.clipId ? { ...c, trimEnd: newEnd } : c))
        );
      }
    } else {
      const deltaSec = deltaX / trimmingState.pxPerUnit;
      const newDuration = Math.max(
        0.05,
        parseFloat(
          (
            trimmingState.initialDuration + (trimmingState.handle === 'end' ? deltaSec : -deltaSec)
          ).toFixed(2)
        )
      );
      setClips((prev) =>
        prev.map((c) => (c.id === trimmingState.clipId ? { ...c, duration: newDuration } : c))
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
    setResultGifUrl('');
    setMp4Url('');
    setMp4Size(0);
  };

  // ─── Subtitle Track (T1 Track) Handlers ───
  const handleAddTextClip = () => {
    const curTime =
      flattenedTimelineFrames.slice(0, currentPlayheadFrameIdx).reduce((s, f) => s + f.delay, 0) /
      1000;
    const newId = `text-${Date.now()}`;
    const newText: StudioTextItem = {
      id: newId,
      text: 'YOUR TEXT HERE',
      startTime: Math.max(0, parseFloat(curTime.toFixed(1))),
      duration: 2.0,
      fontSize: 28,
      fontColor: '#ffffff',
      fontBgColor: 'rgba(0,0,0,0.6)',
      position: 'bottom',
    };
    setTextClips((prev) => [...prev, newText]);
    setSelectedTextId(newId);
    setInspectorTab('text');
    setResultGifUrl('');
    setMp4Url('');
    toast.success('새 자막 클립이 T1 트랙에 추가되었습니다.');
  };

  const handleTextPointerDown = (
    e: React.PointerEvent,
    textId: string,
    mode: 'move' | 'trim-start' | 'trim-end'
  ) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    const textItem = textClips.find((t) => t.id === textId);
    if (!textItem) return;
    setSelectedTextId(textId);
    setInspectorTab('text');
    setTextTrimmingState({
      textId,
      mode,
      startX: e.clientX,
      initialStartTime: textItem.startTime,
      initialDuration: textItem.duration,
    });
  };

  const handleTextPointerMove = (e: React.PointerEvent) => {
    if (!textTrimmingState) return;
    e.preventDefault();
    e.stopPropagation();
    const deltaX = e.clientX - textTrimmingState.startX;
    const deltaSec = deltaX / (100 * timelineZoom);

    if (textTrimmingState.mode === 'move') {
      const newStart = Math.max(
        0,
        parseFloat((textTrimmingState.initialStartTime + deltaSec).toFixed(2))
      );
      setTextClips((prev) =>
        prev.map((t) => (t.id === textTrimmingState.textId ? { ...t, startTime: newStart } : t))
      );
    } else if (textTrimmingState.mode === 'trim-start') {
      const newStart = Math.max(
        0,
        parseFloat((textTrimmingState.initialStartTime + deltaSec).toFixed(2))
      );
      const newDuration = Math.max(
        0.2,
        parseFloat((textTrimmingState.initialDuration - deltaSec).toFixed(2))
      );
      setTextClips((prev) =>
        prev.map((t) =>
          t.id === textTrimmingState.textId
            ? { ...t, startTime: newStart, duration: newDuration }
            : t
        )
      );
    } else if (textTrimmingState.mode === 'trim-end') {
      const newDuration = Math.max(
        0.2,
        parseFloat((textTrimmingState.initialDuration + deltaSec).toFixed(2))
      );
      setTextClips((prev) =>
        prev.map((t) => (t.id === textTrimmingState.textId ? { ...t, duration: newDuration } : t))
      );
    }
  };

  const handleTextPointerUp = (e: React.PointerEvent) => {
    if (!textTrimmingState) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    setTextTrimmingState(null);
    setResultGifUrl('');
    setMp4Url('');
    setMp4Size(0);
  };

  const handleChangeAspectRatio = (preset: '1:1' | '16:9' | '9:16' | '4:3') => {
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
      setTargetWidth(600);
      setTargetHeight(450);
    }
    setResultGifUrl('');
    setMp4Url('');
  };

  const handleBatchSpeedMultiplier = (mult: number) => {
    setClips((prev) =>
      prev.map((c) => ({
        ...c,
        speedMultiplier: Math.max(
          0.25,
          Math.min(10, parseFloat(((c.speedMultiplier || 1.0) * mult).toFixed(2)))
        ),
      }))
    );
    setResultGifUrl('');
    setMp4Url('');
    toast.success(`모든 클립에 ${mult}x 배속이 적용되었습니다.`);
  };

  const handleApplyDurationToAllImages = (durSec: number) => {
    setClips((prev) => prev.map((c) => (c.type === 'image' ? { ...c, duration: durSec } : c)));
    setResultGifUrl('');
    setMp4Url('');
    toast.success(`모든 사진 클립의 재생시간이 ${durSec}초로 일괄 적용되었습니다.`);
  };

  const handleApplyFilterToAll = (filterName: string) => {
    setClips((prev) => prev.map((c) => ({ ...c, filter: filterName })));
    setResultGifUrl('');
    setMp4Url('');
    toast.success(`'${filterName}' 필터가 모든 클립에 일괄 적용되었습니다.`);
  };

  const handleGenerateGif = async () => {
    if (clips.length === 0) {
      toast.error('타임라인에 최소 1개 이상의 미디어 클립을 추가해주세요.');
      return;
    }
    setIsEncoding(true);
    setEncodeProgress(0);
    setMp4Url('');
    setMp4Size(0);
    toast.info('필모라 타임라인 클립들을 렌더링 및 고화질 GIF로 인코딩하고 있습니다...');

    try {
      const res = await createStudioGif({
        clips,
        textClips,
        width: targetWidth,
        height: targetHeight,
        fitMode,
        bgColor,
        fps,
        sampleInterval,
        globalLoopMode,
        textOverlay: overlayText.trim()
          ? {
              text: overlayText,
              fontSize,
              fontColor,
              fontBgColor,
              position: textPosition,
              applyScope: textApplyScope,
              selectedClipId,
            }
          : undefined,
        progressCallback: (p) => setEncodeProgress(p),
      });

      setResultGifUrl(res);
      toast.success('🎉 고화질 GIF 제작이 완료되었습니다!');
    } catch {
      toast.error('GIF 생성 중 오류가 발생했습니다.');
    } finally {
      setIsEncoding(false);
    }
  };

  const handleConvertToMp4 = async () => {
    if (!resultGifUrl) {
      toast.error('먼저 GIF 만들기를 완료해주세요.');
      return;
    }
    if (mp4Url) {
      downloadDataUrl(mp4Url, `studio_video_${Date.now()}.mp4`);
      toast.success('MP4 동영상이 다운로드되었습니다.');
      return;
    }

    setIsConvertingMp4(true);
    toast.info('GIF를 MP4 동영상으로 변환하고 있습니다...');

    try {
      const resBlob = await fetch(resultGifUrl).then((r) => r.blob());
      const videoRes = await convertGifToVideo(resBlob, {
        targetFormat: 'mp4',
        fps: 30,
        scale: 1.0,
        speedMultiplier: 1.0,
      });
      setMp4Url(videoRes.videoUrl);
      setMp4Size(videoRes.size);

      downloadDataUrl(videoRes.videoUrl, `studio_video_${Date.now()}.mp4`);
      toast.success('MP4 동영상 다운로드가 완료되었습니다!');
    } catch {
      toast.error('MP4 동영상 변환 중 오류가 발생했습니다.');
    } finally {
      setIsConvertingMp4(false);
    }
  };

  const FILTER_LIST = [
    { value: 'none', label: '원본', icon: '🎨' },
    { value: 'grayscale', label: '흑백 (B&W)', icon: '🎞️' },
    { value: 'sepia', label: '세피아', icon: '📜' },
    { value: 'vintage', label: '빈티지', icon: '📽️' },
    { value: 'cyberpunk', label: '사이버펑크', icon: '🌃' },
    { value: 'invert', label: '반전', icon: '🔄' },
    { value: 'warm', label: '따뜻한 톤', icon: '🌅' },
    { value: 'cool', label: '차가운 톤', icon: '❄️' },
  ];

  const currentActiveFrame =
    flattenedTimelineFrames[currentPlayheadFrameIdx] || flattenedTimelineFrames[0];

  return (
    <DashboardContent
      onDragOver={(e) => {
        if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
        }
      }}
      onDrop={(e) => {
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          e.preventDefault();
          processAndAddFiles(Array.from(e.dataTransfer.files));
        }
      }}
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
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            processAndAddFiles(Array.from(e.target.files));
            e.target.value = '';
          }
        }}
      />

      {clips.length === 0 ? (
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
          {/* 1. Top: Example Samples Section */}
          <GifSampleSection
            onSelectSample={handleSelectSample}
            onSelectAllSamples={handleSelectAllSamples}
            loadingSampleId={loadingSampleId}
            isLoading={isExtracting || !!loadingSampleId}
            title="⚡ 즉석 테스트 예시 GIF 파일"
            subtitle="클릭 한 번으로 3종의 고화질 예시 움짤을 불러와 멀티트랙 타임라인 편집을 즉시 체험해 보세요."
            actionLabel="타임라인에 추가 ➜"
            allActionLabel="✨ 3개 예시 모두 타임라인에 추가"
          />

          {/* 2. Bottom: Upload Dropzone Card */}
          <Card
            {...createDrop.getRootProps({
              onClick: () => fileInputRef.current?.click(),
            })}
            sx={{
              p: { xs: 3, sm: 5 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: '2px dashed',
              borderColor: createDrop.isDragActive ? 'primary.main' : 'divider',
              bgcolor: createDrop.isDragActive ? 'action.hover' : 'background.paper',
              borderRadius: 3,
              flex: '1 1 auto',
              minHeight: 200,
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
              <MovieCreationRoundedIcon sx={{ fontSize: 36 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              움짤(GIF)로 제작할 사진 또는 GIF 파일 업로드
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mb: 2, textAlign: 'center', maxWidth: 520 }}
            >
              여러 장의 사진(JPG, PNG, WebP)이나 <strong>여러 개의 GIF 파일</strong>을 드래그하거나
              선택하여 필모라 스타일 타임라인에서 늘리고, 줄이고, 자르고, 이어붙이세요.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={
                isExtracting ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <CloudUploadRoundedIcon />
                )
              }
              disabled={isExtracting}
            >
              {isExtracting ? '미디어 분석 중...' : '사진 & GIF 파일 선택하여 스튜디오 열기'}
            </Button>
          </Card>
        </Box>
      ) : (
        <Box
          sx={{
            flex: '1 1 auto',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              flex: '1 1 0',
              minHeight: 0,
              display: 'flex',
              flexDirection: { xs: 'column', lg: 'row' },
              gap: 1.5,
              position: 'relative',
            }}
          >
            <Card
              sx={{
                flex: '1 1 auto',
                minWidth: 0,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                bgcolor: '#0a0f1d',
                borderColor: 'rgba(255,255,255,0.08)',
                p: 1.5,
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  pb: 1.2,
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  flexShrink: 0,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: '#cbd5e1', fontWeight: 800, fontSize: '0.78rem' }}
                  >
                    비율:
                  </Typography>
                  <ToggleButtonGroup
                    size="small"
                    value={aspectRatioPreset}
                    exclusive
                    onChange={(_, v) => v && handleChangeAspectRatio(v)}
                    sx={{
                      height: 30,
                      bgcolor: 'rgba(255,255,255,0.06)',
                      borderRadius: 1.5,
                      p: '2px',
                      border: '1px solid rgba(255,255,255,0.12)',
                      '& .MuiToggleButton-root': {
                        py: 0,
                        px: 1.2,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#94a3b8',
                        border: 'none',
                        borderRadius: 1,
                        '&.Mui-selected': {
                          bgcolor: 'primary.main',
                          color: '#ffffff',
                          boxShadow: '0 2px 8px rgba(0, 167, 111, 0.4)',
                        },
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.12)',
                        },
                      },
                    }}
                  >
                    <ToggleButton value="1:1">1:1</ToggleButton>
                    <ToggleButton value="16:9">16:9</ToggleButton>
                    <ToggleButton value="9:16">9:16</ToggleButton>
                    <ToggleButton value="4:3">4:3</ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={`프레임 ${currentPlayheadFrameIdx + 1} / ${flattenedTimelineFrames.length}`}
                    size="small"
                    sx={{
                      height: 24,
                      bgcolor: 'rgba(56, 189, 248, 0.15)',
                      color: '#38bdf8',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                    }}
                  />
                  <Chip
                    label={`${(
                      flattenedTimelineFrames
                        .slice(0, currentPlayheadFrameIdx + 1)
                        .reduce((s, f) => s + f.delay, 0) / 1000
                    ).toFixed(2)}s / ${totalTimelineDurationSec.toFixed(2)}s`}
                    size="small"
                    sx={{
                      height: 24,
                      bgcolor: 'rgba(255,255,255,0.08)',
                      color: '#f8fafc',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                    }}
                  />
                </Box>
              </Box>

              <Box
                sx={{
                  flex: '1 1 auto',
                  minHeight: 0,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: bgColor === 'transparent' ? '#050811' : bgColor,
                  borderRadius: 2,
                  my: 1,
                  overflow: 'hidden',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)',
                  p: 1,
                }}
              >
                {resultGifUrl ? (
                  <Box
                    component="img"
                    src={resultGifUrl}
                    alt="GIF Output"
                    sx={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain',
                      borderRadius: 1,
                    }}
                  />
                ) : currentActiveFrame ? (
                  <Box
                    ref={previewFrameRef}
                    sx={{
                      position: 'relative',
                      maxWidth: '100%',
                      maxHeight: '100%',
                      width:
                        aspectRatioPreset === '1:1'
                          ? '100%'
                          : aspectRatioPreset === '16:9'
                            ? '100%'
                            : aspectRatioPreset === '9:16'
                              ? '100%'
                              : aspectRatioPreset === '4:3'
                                ? '100%'
                                : 'auto',
                      height:
                        aspectRatioPreset === '1:1'
                          ? '100%'
                          : aspectRatioPreset === '16:9'
                            ? '100%'
                            : aspectRatioPreset === '9:16'
                              ? '100%'
                              : aspectRatioPreset === '4:3'
                                ? '100%'
                                : 'auto',
                      aspectRatio:
                        aspectRatioPreset === '1:1'
                          ? '1 / 1'
                          : aspectRatioPreset === '16:9'
                            ? '16 / 9'
                            : aspectRatioPreset === '9:16'
                              ? '9 / 16'
                              : aspectRatioPreset === '4:3'
                                ? '4 / 3'
                                : undefined,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      userSelect: 'none',
                    }}
                  >
                    <Box
                      component="img"
                      src={currentActiveFrame.dataUrl}
                      alt="preview frame"
                      sx={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        width: fitMode === 'stretch' || fitMode === 'fill' ? '100%' : 'auto',
                        height: fitMode === 'stretch' || fitMode === 'fill' ? '100%' : 'auto',
                        objectFit:
                          fitMode === 'cover'
                            ? 'cover'
                            : fitMode === 'stretch' || fitMode === 'fill'
                              ? 'fill'
                              : 'contain',
                        transform: `rotate(${currentActiveFrame.rotation || 0}deg) scale(${
                          currentActiveFrame.flipH ? -1 : 1
                        }, ${currentActiveFrame.flipV ? -1 : 1})`,
                        filter:
                          currentActiveFrame.filter === 'grayscale'
                            ? 'grayscale(100%)'
                            : currentActiveFrame.filter === 'sepia'
                              ? 'sepia(80%)'
                              : currentActiveFrame.filter === 'vintage'
                                ? 'sepia(50%) contrast(120%)'
                                : currentActiveFrame.filter === 'cyberpunk'
                                  ? 'hue-rotate(180deg) saturate(180%)'
                                  : currentActiveFrame.filter === 'invert'
                                    ? 'invert(100%)'
                                    : currentActiveFrame.filter === 'warm'
                                      ? 'sepia(30%) saturate(140%)'
                                      : currentActiveFrame.filter === 'cool'
                                        ? 'hue-rotate(190deg) saturate(120%)'
                                        : 'none',
                        transition: 'transform 0.15s ease, filter 0.15s ease',
                        pointerEvents: 'none',
                      }}
                    />

                    {/* Active T1 Text Track Subtitle Clips with Interactive Canvas Dragging */}
                    {textClips
                      .filter((t) => {
                        if (!t.text || !t.text.trim()) return false;
                        const curTimeSec =
                          flattenedTimelineFrames
                            .slice(0, currentPlayheadFrameIdx)
                            .reduce((s, f) => s + f.delay, 0) / 1000;
                        return curTimeSec >= t.startTime && curTimeSec < t.startTime + t.duration;
                      })
                      .map((t) => {
                        const isSelected = selectedTextId === t.id;
                        let leftStyle = `${t.xPercent ?? 50}%`;
                        let topStyle = `${t.yPercent ?? 85}%`;
                        let transformStyle = 'translate(-50%, -50%)';

                        if (typeof t.xPercent !== 'number' || typeof t.yPercent !== 'number') {
                          const pos = t.position || 'bottom';
                          if (pos === 'top') {
                            topStyle = '16px';
                            leftStyle = '50%';
                            transformStyle = 'translateX(-50%)';
                          } else if (pos === 'center') {
                            topStyle = '50%';
                            leftStyle = '50%';
                            transformStyle = 'translate(-50%, -50%)';
                          } else if (pos === 'top-left') {
                            topStyle = '16px';
                            leftStyle = '20px';
                            transformStyle = 'none';
                          } else if (pos === 'bottom-right') {
                            topStyle = 'auto';
                            leftStyle = 'auto';
                            transformStyle = 'none';
                          } else {
                            topStyle = 'auto';
                            leftStyle = '50%';
                            transformStyle = 'translateX(-50%)';
                          }
                        }

                        return (
                          <Box
                            key={t.id}
                            onPointerDown={(e) => handleCanvasTextPointerDown(e, t.id)}
                            onPointerMove={handleCanvasTextPointerMove}
                            onPointerUp={handleCanvasTextPointerUp}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTextId(t.id);
                              setInspectorTab('text');
                            }}
                            sx={{
                              position: 'absolute',
                              top: topStyle,
                              left: leftStyle,
                              bottom:
                                typeof t.yPercent !== 'number' &&
                                (t.position === 'bottom' || !t.position)
                                  ? 16
                                  : typeof t.yPercent !== 'number' && t.position === 'bottom-right'
                                    ? 16
                                    : 'auto',
                              right:
                                typeof t.xPercent !== 'number' && t.position === 'bottom-right'
                                  ? 20
                                  : 'auto',
                              transform: transformStyle,
                              cursor: 'move',
                              userSelect: 'none',
                              zIndex: isSelected ? 25 : 15,
                              touchAction: 'none',
                            }}
                          >
                            <Typography
                              sx={{
                                color: t.fontColor || '#ffffff',
                                bgcolor: t.fontBgColor || 'rgba(0,0,0,0.6)',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 1,
                                fontSize: `${t.fontSize || 28}px`,
                                fontWeight: 800,
                                textShadow: '0 2px 6px rgba(0,0,0,0.85)',
                                textAlign: 'center',
                                maxWidth: '90vw',
                                wordBreak: 'break-word',
                                border: isSelected
                                  ? '2px dashed #38bdf8'
                                  : '2px dashed transparent',
                                boxShadow: isSelected ? '0 0 12px rgba(56, 189, 248, 0.8)' : 'none',
                                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                                '&:hover': {
                                  borderColor: isSelected ? '#38bdf8' : 'rgba(255,255,255,0.4)',
                                },
                              }}
                            >
                              {t.text}
                            </Typography>
                          </Box>
                        );
                      })}

                    {overlayText.trim() &&
                      (textApplyScope === 'all' ||
                        currentActiveFrame.clipId === selectedClipId) && (
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
                            zIndex: 11,
                          }}
                        >
                          {overlayText}
                        </Typography>
                      )}
                  </Box>
                ) : null}
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  pt: 1.2,
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  flexShrink: 0,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Tooltip title="첫 프레임으로 이동">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentPlayheadFrameIdx(0);
                      }}
                      sx={{ color: '#cbd5e1', p: 0.8 }}
                    >
                      <SkipPreviousRoundedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="이전 프레임 (-1)">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentPlayheadFrameIdx((prev) =>
                          prev > 0 ? prev - 1 : flattenedTimelineFrames.length - 1
                        );
                      }}
                      sx={{ color: '#cbd5e1', p: 0.8 }}
                    >
                      <ArrowUpwardRoundedIcon sx={{ fontSize: 16, transform: 'rotate(-90deg)' }} />
                    </IconButton>
                  </Tooltip>
                  <Button
                    size="small"
                    variant="contained"
                    color={isPlaying ? 'warning' : 'primary'}
                    onClick={() => setIsPlaying(!isPlaying)}
                    startIcon={isPlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
                    sx={{ fontWeight: 800, px: 2, height: 34, borderRadius: 2 }}
                  >
                    {isPlaying ? '일시정지' : '실시간 재생'}
                  </Button>
                  <Tooltip title="다음 프레임 (+1)">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentPlayheadFrameIdx(
                          (prev) => (prev + 1) % flattenedTimelineFrames.length
                        );
                      }}
                      sx={{ color: '#cbd5e1', p: 0.8 }}
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
                        setIsPlaying(false);
                        setCurrentPlayheadFrameIdx(flattenedTimelineFrames.length - 1);
                      }}
                      sx={{ color: '#cbd5e1', p: 0.8 }}
                    >
                      <SkipNextRoundedIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ToggleButtonGroup
                    size="small"
                    value={globalLoopMode}
                    exclusive
                    onChange={(_, v) => v && setGlobalLoopMode(v)}
                    sx={{
                      height: 32,
                      bgcolor: 'rgba(255,255,255,0.06)',
                      borderRadius: 1.5,
                      p: '2px',
                      border: '1px solid rgba(255,255,255,0.12)',
                      '& .MuiToggleButton-root': {
                        px: 1.2,
                        py: 0,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#94a3b8',
                        border: 'none',
                        borderRadius: 1,
                        '&.Mui-selected': {
                          bgcolor: 'primary.main',
                          color: '#ffffff',
                          boxShadow: '0 2px 8px rgba(0, 167, 111, 0.4)',
                        },
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.12)',
                        },
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

            <Card
              sx={{
                width: { xs: '100%', lg: `${rightPanelWidth}px` },
                minWidth: { lg: `${rightPanelWidth}px` },
                maxWidth: { lg: `${rightPanelWidth}px` },
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.neutral' }}>
                <Tabs
                  value={inspectorTab}
                  onChange={(_, v) => setInspectorTab(v)}
                  variant="fullWidth"
                  sx={{ minHeight: 40 }}
                >
                  <Tab
                    label="클립 편집"
                    value="clip"
                    sx={{ fontWeight: 700, fontSize: '0.75rem', minHeight: 40, py: 0 }}
                  />
                  <Tab
                    label="자막/텍스트"
                    value="text"
                    sx={{ fontWeight: 700, fontSize: '0.75rem', minHeight: 40, py: 0 }}
                  />
                  <Tab
                    label="필터/효과"
                    value="fx"
                    sx={{ fontWeight: 700, fontSize: '0.75rem', minHeight: 40, py: 0 }}
                  />
                  <Tab
                    label="내보내기"
                    value="export"
                    sx={{ fontWeight: 700, fontSize: '0.75rem', minHeight: 40, py: 0 }}
                  />
                </Tabs>
              </Box>

              <Box
                sx={{
                  p: 2,
                  flex: '1 1 auto',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                {inspectorTab === 'clip' && (
                  <>
                    {selectedClip ? (
                      <>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }} noWrap>
                              {selectedClip.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {selectedClip.type === 'gif'
                                ? `GIF 애니메이션 (${selectedClip.frames?.length || 0}F)`
                                : '정지 사진 이미지'}
                            </Typography>
                          </Box>
                          <Chip
                            label={selectedClip.type === 'gif' ? 'GIF' : 'IMAGE'}
                            size="small"
                            color={selectedClip.type === 'gif' ? 'secondary' : 'primary'}
                            sx={{ fontWeight: 800, fontSize: '0.65rem', height: 20 }}
                          />
                        </Box>

                        {selectedClip.type === 'image' ? (
                          <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                사진 지속시간 (초)
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 800, color: 'primary.main' }}
                              >
                                {(selectedClip.duration || 1.0).toFixed(2)}초
                              </Typography>
                            </Box>
                            <Slider
                              size="small"
                              min={0.1}
                              max={10.0}
                              step={0.1}
                              value={selectedClip.duration || 1.0}
                              onChange={(_, v) =>
                                handleUpdateClip(selectedClip.id, { duration: v as number })
                              }
                            />
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() =>
                                handleApplyDurationToAllImages(selectedClip.duration || 1.0)
                              }
                              sx={{ mt: 0.5, fontSize: '0.7rem', width: '100%' }}
                            >
                              이 지속시간을 모든 사진에 일괄 적용
                            </Button>
                          </Box>
                        ) : (
                          selectedClip.frames &&
                          selectedClip.frames.length > 0 && (
                            <Box>
                              <Box
                                sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}
                              >
                                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                  구간 트리밍 (시작 ~ 끝 프레임)
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ fontWeight: 800, color: 'primary.main' }}
                                >
                                  #{(selectedClip.trimStart || 0) + 1} ~ #
                                  {(selectedClip.trimEnd ?? selectedClip.frames.length - 1) + 1}F
                                </Typography>
                              </Box>
                              <Slider
                                size="small"
                                min={0}
                                max={selectedClip.frames.length - 1}
                                value={[
                                  selectedClip.trimStart || 0,
                                  selectedClip.trimEnd ?? selectedClip.frames.length - 1,
                                ]}
                                onChange={(_, v) => {
                                  const [s, e] = v as number[];
                                  handleUpdateClip(selectedClip.id, { trimStart: s, trimEnd: e });
                                }}
                              />
                            </Box>
                          )
                        )}

                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>
                              재생 배속
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 800, color: 'primary.main' }}
                            >
                              {(selectedClip.speedMultiplier || 1.0).toFixed(2)}x
                            </Typography>
                          </Box>
                          <Slider
                            size="small"
                            min={0.25}
                            max={5.0}
                            step={0.25}
                            value={selectedClip.speedMultiplier || 1.0}
                            onChange={(_, v) =>
                              handleUpdateClip(selectedClip.id, { speedMultiplier: v as number })
                            }
                          />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                          <TextField
                            size="small"
                            type="number"
                            label="반복 횟수"
                            value={selectedClip.repeatCount || 1}
                            onChange={(e) =>
                              handleUpdateClip(selectedClip.id, {
                                repeatCount: Math.max(1, Math.min(10, Number(e.target.value) || 1)),
                              })
                            }
                            sx={{ flex: 1 }}
                            inputProps={{ min: 1, max: 10 }}
                          />
                          {selectedClip.type === 'gif' && (
                            <FormControlLabel
                              control={
                                <Switch
                                  size="small"
                                  checked={!!selectedClip.skipFrames}
                                  onChange={(e) =>
                                    handleUpdateClip(selectedClip.id, {
                                      skipFrames: e.target.checked,
                                    })
                                  }
                                />
                              }
                              label={
                                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                  50% 프레임 압축
                                </Typography>
                              }
                            />
                          )}
                        </Box>

                        <Box>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}
                          >
                            변형 (회전 & 반전)
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() =>
                                handleUpdateClip(selectedClip.id, {
                                  rotation: ((selectedClip.rotation || 0) + 90) % 360,
                                })
                              }
                              sx={{ flex: 1, fontSize: '0.72rem' }}
                            >
                              ↻ 90° 회전
                            </Button>
                            <Button
                              size="small"
                              variant={selectedClip.flipH ? 'contained' : 'outlined'}
                              onClick={() =>
                                handleUpdateClip(selectedClip.id, { flipH: !selectedClip.flipH })
                              }
                              sx={{ flex: 1, fontSize: '0.72rem' }}
                            >
                              ⇆ 좌우반전
                            </Button>
                            <Button
                              size="small"
                              variant={selectedClip.flipV ? 'contained' : 'outlined'}
                              onClick={() =>
                                handleUpdateClip(selectedClip.id, { flipV: !selectedClip.flipV })
                              }
                              sx={{ flex: 1, fontSize: '0.72rem' }}
                            >
                              ⇅ 상하반전
                            </Button>
                          </Box>
                        </Box>
                      </>
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}
                      >
                        타임라인에서 편집할 클립을 선택해주세요.
                      </Typography>
                    )}
                  </>
                )}

                {inspectorTab === 'text' && (
                  <>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#a5b4fc' }}>
                        🔤 자막 트랙 (T1) 편집
                      </Typography>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        startIcon={<AddRoundedIcon />}
                        onClick={handleAddTextClip}
                        sx={{ fontSize: '0.7rem', height: 26, borderRadius: 1.5 }}
                      >
                        + 자막 추가
                      </Button>
                    </Box>

                    {/* Subtitle List Chips */}
                    {textClips.length > 0 && (
                      <Box sx={{ display: 'flex', gap: 0.8, overflowX: 'auto', py: 0.5 }}>
                        {textClips.map((t, i) => (
                          <Chip
                            key={t.id}
                            label={`#${i + 1} ${t.text ? (t.text.length > 8 ? `${t.text.slice(0, 8)}...` : t.text) : '자막'}`}
                            size="small"
                            onClick={() => setSelectedTextId(t.id)}
                            onDelete={() => handleDeleteTextClip(t.id)}
                            sx={{
                              bgcolor:
                                selectedTextId === t.id ? '#4f46e5' : 'rgba(255,255,255,0.06)',
                              color: '#ffffff',
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              border:
                                selectedTextId === t.id
                                  ? '1.5px solid #818cf8'
                                  : '1px solid rgba(255,255,255,0.1)',
                            }}
                          />
                        ))}
                      </Box>
                    )}

                    {(() => {
                      const curText =
                        textClips.find((t) => t.id === selectedTextId) || textClips[0];
                      if (!curText) {
                        return (
                          <Box sx={{ py: 3, textAlign: 'center' }}>
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary', display: 'block', mb: 1 }}
                            >
                              등록된 자막이 없습니다.
                            </Typography>
                            <Button size="small" variant="contained" onClick={handleAddTextClip}>
                              + 새 자막 추가하기
                            </Button>
                          </Box>
                        );
                      }

                      return (
                        <>
                          <TextField
                            size="small"
                            fullWidth
                            label="선택된 자막 문구"
                            placeholder="움짤에 들어갈 텍스트..."
                            value={curText.text}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTextClips((prev) =>
                                prev.map((t) => (t.id === curText.id ? { ...t, text: val } : t))
                              );
                              setResultGifUrl('');
                              setMp4Url('');
                            }}
                          />

                          <Box sx={{ display: 'flex', gap: 1.5 }}>
                            <TextField
                              size="small"
                              type="number"
                              label="시작 시간 (초)"
                              value={curText.startTime}
                              onChange={(e) => {
                                const val = Math.max(0, Number(e.target.value) || 0);
                                setTextClips((prev) =>
                                  prev.map((t) =>
                                    t.id === curText.id ? { ...t, startTime: val } : t
                                  )
                                );
                                setResultGifUrl('');
                                setMp4Url('');
                              }}
                              sx={{ flex: 1 }}
                              inputProps={{ step: 0.1, min: 0 }}
                            />
                            <TextField
                              size="small"
                              type="number"
                              label="지속 시간 (초)"
                              value={curText.duration}
                              onChange={(e) => {
                                const val = Math.max(0.1, Number(e.target.value) || 0.1);
                                setTextClips((prev) =>
                                  prev.map((t) =>
                                    t.id === curText.id ? { ...t, duration: val } : t
                                  )
                                );
                                setResultGifUrl('');
                                setMp4Url('');
                              }}
                              sx={{ flex: 1 }}
                              inputProps={{ step: 0.1, min: 0.1 }}
                            />
                          </Box>

                          <Box sx={{ display: 'flex', gap: 1.5 }}>
                            <TextField
                              size="small"
                              type="number"
                              label="글자 크기 (px)"
                              value={curText.fontSize || 28}
                              onChange={(e) => {
                                const val = Number(e.target.value) || 28;
                                setTextClips((prev) =>
                                  prev.map((t) =>
                                    t.id === curText.id ? { ...t, fontSize: val } : t
                                  )
                                );
                                setResultGifUrl('');
                                setMp4Url('');
                              }}
                              sx={{ flex: 1 }}
                            />
                            <TextField
                              size="small"
                              label="글자 색상"
                              type="color"
                              value={curText.fontColor || '#ffffff'}
                              onChange={(e) => {
                                const val = e.target.value;
                                setTextClips((prev) =>
                                  prev.map((t) =>
                                    t.id === curText.id ? { ...t, fontColor: val } : t
                                  )
                                );
                                setResultGifUrl('');
                                setMp4Url('');
                              }}
                              sx={{ flex: 1 }}
                            />
                          </Box>

                          {/* Subtitle Position Presets & Fine-tuning */}
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 1.25,
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 800, color: '#38bdf8' }}
                              >
                                🎯 자막 위치 미세 조정
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: 'text.secondary', fontSize: '0.65rem' }}
                              >
                                화면에서 직접 드래그 가능
                              </Typography>
                            </Box>

                            {/* Position Quick Presets */}
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {[
                                { label: '상단', x: 50, y: 15, pos: 'top' },
                                { label: '중앙', x: 50, y: 50, pos: 'center' },
                                { label: '하단', x: 50, y: 85, pos: 'bottom' },
                                { label: '좌측상단', x: 18, y: 15, pos: 'top-left' },
                                { label: '우측하단', x: 82, y: 85, pos: 'bottom-right' },
                              ].map((preset) => (
                                <Button
                                  key={preset.label}
                                  size="small"
                                  variant="outlined"
                                  onClick={() => {
                                    setTextClips((prev) =>
                                      prev.map((t) =>
                                        t.id === curText.id
                                          ? {
                                              ...t,
                                              xPercent: preset.x,
                                              yPercent: preset.y,
                                              position: preset.pos as any,
                                            }
                                          : t
                                      )
                                    );
                                    setResultGifUrl('');
                                    setMp4Url('');
                                  }}
                                  sx={{
                                    fontSize: '0.68rem',
                                    py: 0.2,
                                    px: 0.8,
                                    minWidth: 'auto',
                                    height: 24,
                                  }}
                                >
                                  {preset.label}
                                </Button>
                              ))}
                            </Box>

                            {/* X Position Slider */}
                            <Box>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  mb: 0.25,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                                >
                                  가로 (X) 위치
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight: 800,
                                    color: 'primary.main',
                                    fontSize: '0.7rem',
                                  }}
                                >
                                  {(curText.xPercent ?? 50).toFixed(1)}%
                                </Typography>
                              </Box>
                              <Slider
                                size="small"
                                min={0}
                                max={100}
                                step={0.5}
                                value={curText.xPercent ?? 50}
                                onChange={(_, v) => {
                                  const val = v as number;
                                  setTextClips((prev) =>
                                    prev.map((t) =>
                                      t.id === curText.id ? { ...t, xPercent: val } : t
                                    )
                                  );
                                  setResultGifUrl('');
                                  setMp4Url('');
                                }}
                              />
                            </Box>

                            {/* Y Position Slider */}
                            <Box>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  mb: 0.25,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                                >
                                  세로 (Y) 위치
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontWeight: 800,
                                    color: 'primary.main',
                                    fontSize: '0.7rem',
                                  }}
                                >
                                  {(curText.yPercent ?? 85).toFixed(1)}%
                                </Typography>
                              </Box>
                              <Slider
                                size="small"
                                min={0}
                                max={100}
                                step={0.5}
                                value={curText.yPercent ?? 85}
                                onChange={(_, v) => {
                                  const val = v as number;
                                  setTextClips((prev) =>
                                    prev.map((t) =>
                                      t.id === curText.id ? { ...t, yPercent: val } : t
                                    )
                                  );
                                  setResultGifUrl('');
                                  setMp4Url('');
                                }}
                              />
                            </Box>

                            {/* Directional D-Pad Fine Nudge Buttons */}
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ fontSize: '0.68rem', color: 'text.secondary', mr: 1 }}
                              >
                                1% 단위 미세이동:
                              </Typography>
                              <Box
                                sx={{
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(3, 28px)',
                                  gap: 0.5,
                                }}
                              >
                                <Box />
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setTextClips((prev) =>
                                      prev.map((t) =>
                                        t.id === curText.id
                                          ? {
                                              ...t,
                                              yPercent: Math.max(
                                                0,
                                                parseFloat(((t.yPercent ?? 85) - 1).toFixed(1))
                                              ),
                                            }
                                          : t
                                      )
                                    );
                                    setResultGifUrl('');
                                    setMp4Url('');
                                  }}
                                  sx={{
                                    width: 28,
                                    height: 28,
                                    bgcolor: 'rgba(255,255,255,0.06)',
                                    borderRadius: 1,
                                    p: 0,
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
                                  }}
                                >
                                  ▲
                                </IconButton>
                                <Box />

                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setTextClips((prev) =>
                                      prev.map((t) =>
                                        t.id === curText.id
                                          ? {
                                              ...t,
                                              xPercent: Math.max(
                                                0,
                                                parseFloat(((t.xPercent ?? 50) - 1).toFixed(1))
                                              ),
                                            }
                                          : t
                                      )
                                    );
                                    setResultGifUrl('');
                                    setMp4Url('');
                                  }}
                                  sx={{
                                    width: 28,
                                    height: 28,
                                    bgcolor: 'rgba(255,255,255,0.06)',
                                    borderRadius: 1,
                                    p: 0,
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
                                  }}
                                >
                                  ◀
                                </IconButton>

                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setTextClips((prev) =>
                                      prev.map((t) =>
                                        t.id === curText.id
                                          ? {
                                              ...t,
                                              xPercent: 50,
                                            }
                                          : t
                                      )
                                    );
                                    setResultGifUrl('');
                                    setMp4Url('');
                                  }}
                                  sx={{
                                    width: 28,
                                    height: 28,
                                    bgcolor: 'rgba(56, 189, 248, 0.15)',
                                    color: '#38bdf8',
                                    borderRadius: 1,
                                    p: 0,
                                    fontSize: '0.6rem',
                                    fontWeight: 900,
                                    '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.3)' },
                                  }}
                                >
                                  ●
                                </IconButton>

                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setTextClips((prev) =>
                                      prev.map((t) =>
                                        t.id === curText.id
                                          ? {
                                              ...t,
                                              xPercent: Math.min(
                                                100,
                                                parseFloat(((t.xPercent ?? 50) + 1).toFixed(1))
                                              ),
                                            }
                                          : t
                                      )
                                    );
                                    setResultGifUrl('');
                                    setMp4Url('');
                                  }}
                                  sx={{
                                    width: 28,
                                    height: 28,
                                    bgcolor: 'rgba(255,255,255,0.06)',
                                    borderRadius: 1,
                                    p: 0,
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
                                  }}
                                >
                                  ▶
                                </IconButton>

                                <Box />
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setTextClips((prev) =>
                                      prev.map((t) =>
                                        t.id === curText.id
                                          ? {
                                              ...t,
                                              yPercent: Math.min(
                                                100,
                                                parseFloat(((t.yPercent ?? 85) + 1).toFixed(1))
                                              ),
                                            }
                                          : t
                                      )
                                    );
                                    setResultGifUrl('');
                                    setMp4Url('');
                                  }}
                                  sx={{
                                    width: 28,
                                    height: 28,
                                    bgcolor: 'rgba(255,255,255,0.06)',
                                    borderRadius: 1,
                                    p: 0,
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
                                  }}
                                >
                                  ▼
                                </IconButton>
                                <Box />
                              </Box>
                            </Box>
                          </Box>

                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteRoundedIcon />}
                            onClick={() => handleDeleteTextClip(curText.id)}
                            sx={{ fontSize: '0.75rem', mt: 0.5 }}
                          >
                            자막 삭제 (Delete키로도 가능)
                          </Button>
                        </>
                      );
                    })()}
                  </>
                )}

                {inspectorTab === 'fx' && (
                  <>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      시각 효과 & 컬러 필터
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                      {FILTER_LIST.map((f) => (
                        <Button
                          key={f.value}
                          size="small"
                          variant={selectedClip?.filter === f.value ? 'contained' : 'outlined'}
                          color="inherit"
                          onClick={() =>
                            selectedClip && handleUpdateClip(selectedClip.id, { filter: f.value })
                          }
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
                      onClick={() => handleApplyFilterToAll(selectedClip?.filter || 'none')}
                      sx={{ mt: 1, fontWeight: 700 }}
                    >
                      ⚡ 이 필터를 모든 클립에 일괄 적용
                    </Button>
                  </>
                )}

                {inspectorTab === 'export' && (
                  <>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <TextField
                        size="small"
                        type="number"
                        label="너비"
                        value={targetWidth}
                        onChange={(e) => setTargetWidth(Number(e.target.value))}
                        sx={{ flex: 1 }}
                      />
                      <TextField
                        size="small"
                        type="number"
                        label="높이"
                        value={targetHeight}
                        onChange={(e) => setTargetHeight(Number(e.target.value))}
                        sx={{ flex: 1 }}
                      />
                    </Box>

                    <FormControl size="small" fullWidth>
                      <InputLabel>화면 맞춤 (Fit Mode)</InputLabel>
                      <Select
                        value={fitMode}
                        label="화면 맞춤 (Fit Mode)"
                        onChange={(e) =>
                          setFitMode(e.target.value as 'contain' | 'cover' | 'stretch' | 'fill')
                        }
                      >
                        <MenuItem value="contain">여백 포함 맞춤 (Contain)</MenuItem>
                        <MenuItem value="cover">화면 꽉 채움 자르기 (Cover)</MenuItem>
                        <MenuItem value="fill">비율 왜곡 맞춤 (Fill)</MenuItem>
                      </Select>
                    </FormControl>

                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          기본 프레임 레이트 (FPS)
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

          <Card
            sx={{
              flex: '0 0 auto',
              height: { xs: '240px', sm: '260px' },
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              bgcolor: '#0a0f1d',
              borderColor: 'rgba(255,255,255,0.08)',
              overflow: 'hidden',
              p: 1.25,
            }}
          >
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  startIcon={<AddRoundedIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ fontWeight: 800, fontSize: '0.75rem', height: 28, borderRadius: 1.5 }}
                >
                  미디어 추가 (사진/GIF)
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  startIcon={<ContentCutRoundedIcon />}
                  onClick={handleSplitClipAtPlayhead}
                  disabled={!selectedClip}
                  sx={{
                    fontSize: '0.72rem',
                    height: 28,
                    color: '#cbd5e1',
                    borderColor: 'rgba(255,255,255,0.15)',
                  }}
                >
                  자르기 (Split)
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  startIcon={<ContentCopyRoundedIcon />}
                  onClick={() => selectedClip && handleDuplicateClip(selectedClip.id)}
                  disabled={!selectedClip}
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
                  onClick={() => selectedClip && handleDeleteClip(selectedClip.id)}
                  disabled={clips.length <= 1}
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
                  ⚡ 2x
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
                  🐢 0.5x
                </Button>

                <Box
                  sx={{
                    display: { xs: 'none', md: 'flex' },
                    alignItems: 'center',
                    gap: 0.5,
                    ml: 1,
                  }}
                >
                  <ZoomOutRoundedIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                  <Slider
                    size="small"
                    min={0.5}
                    max={3.0}
                    step={0.1}
                    value={timelineZoom}
                    onChange={(_, v) => setTimelineZoom(v as number)}
                    sx={{ width: 80, height: 4 }}
                  />
                  <ZoomInRoundedIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                </Box>
              </Box>

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
                  총 {totalTimelineDurationSec.toFixed(2)}초 ({clips.length}클립)
                </Typography>

                {resultGifUrl ? (
                  <Box sx={{ display: 'flex', gap: 0.75 }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<DownloadRoundedIcon />}
                      onClick={() => downloadDataUrl(resultGifUrl, `studio_gif_${Date.now()}.gif`)}
                      sx={{ fontWeight: 800, fontSize: '0.75rem', height: 30 }}
                    >
                      GIF 다운로드 ({formatBytes(getDataUrlByteSize(resultGifUrl))})
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="secondary"
                      startIcon={<MovieCreationRoundedIcon />}
                      onClick={
                        mp4Url
                          ? () => downloadDataUrl(mp4Url, `studio_video_${Date.now()}.mp4`)
                          : handleConvertToMp4
                      }
                      disabled={isConvertingMp4}
                      sx={{ fontWeight: 800, fontSize: '0.75rem', height: 30 }}
                    >
                      {isConvertingMp4
                        ? 'MP4 변환 중...'
                        : mp4Url
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
                      isEncoding ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <AutoAwesomeRoundedIcon />
                      )
                    }
                    onClick={handleGenerateGif}
                    disabled={isEncoding || clips.length === 0}
                    sx={{ fontWeight: 800, fontSize: '0.75rem', height: 30, px: 2 }}
                  >
                    {isEncoding ? `인코딩 (${encodeProgress}%)` : '✨ 고화질 GIF 만들기'}
                  </Button>
                )}
              </Box>
            </Box>

            <Box
              ref={timelineScrollRef}
              sx={{
                flex: '1 1 auto',
                minHeight: 0,
                overflowX: 'auto',
                overflowY: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                bgcolor: '#050811',
                borderRadius: 2,
                p: 1,
                my: 0.5,
                position: 'relative',
              }}
            >
              {/* 1. Timecode Ruler with Click/Drag Scrubbing */}
              <Box
                onPointerDown={(e) => {
                  isScrubbingRef.current = true;
                  handleTimelineScrub(e);
                }}
                onPointerMove={(e) => {
                  if (isScrubbingRef.current) handleTimelineScrub(e);
                }}
                onPointerUp={() => {
                  isScrubbingRef.current = false;
                }}
                sx={{
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  minWidth: 'max-content',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                  pl: 5,
                  cursor: 'pointer',
                  userSelect: 'none',
                  bgcolor: 'rgba(255,255,255,0.01)',
                }}
              >
                {Array.from({ length: Math.ceil(totalTimelineDurationSec) + 2 }).map((_, sec) => (
                  <Box
                    key={sec}
                    sx={{
                      width: `${100 * timelineZoom}px`,
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '0.62rem',
                      fontFamily: 'monospace',
                      color: '#64748b',
                      borderLeft: '1px solid rgba(255,255,255,0.15)',
                      pl: 0.5,
                      flexShrink: 0,
                    }}
                  >
                    {sec}s
                  </Box>
                ))}
              </Box>

              {/* 2. Track Lanes Container */}
              <Box
                ref={timelineTrackRef}
                onDragOver={(e) => {
                  if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'copy';
                    setIsExternalDragOverTrack(true);
                  }
                }}
                onDragLeave={() => setIsExternalDragOverTrack(false)}
                onDrop={(e) => {
                  setIsExternalDragOverTrack(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    e.preventDefault();
                    processAndAddFiles(Array.from(e.dataTransfer.files));
                  }
                }}
                onPointerDown={(e) => {
                  if (
                    (e.target as HTMLElement).closest('.trim-handle') ||
                    (e.target as HTMLElement).closest('.clip-card-box')
                  ) {
                    return;
                  }
                  isScrubbingRef.current = true;
                  handleTimelineScrub(e);
                }}
                onPointerMove={(e) => {
                  if (isScrubbingRef.current) handleTimelineScrub(e);
                }}
                onPointerUp={() => {
                  isScrubbingRef.current = false;
                }}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  minWidth: 'max-content',
                  position: 'relative',
                  py: 0.5,
                  bgcolor: isExternalDragOverTrack ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                  borderRadius: 1.5,
                  transition: 'background-color 0.2s ease',
                }}
              >
                {/* ─── FILMORA SCISSOR PLAYHEAD LINE & BUTTON (자르기 선 & 가위) ─── */}
                {flattenedTimelineFrames.length > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: `${playheadPixelLeft + 44}px`,
                      top: 0,
                      bottom: 0,
                      width: 0,
                      zIndex: 35,
                      pointerEvents: 'none',
                      transition: isPlaying ? 'none' : 'left 0.05s ease-out',
                    }}
                  >
                    {/* Top Arrow Head */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: '-6px',
                        width: 12,
                        height: 10,
                        bgcolor: '#ff4d4f',
                        clipPath: 'polygon(0% 0%, 100% 0%, 100% 60%, 50% 100%, 0% 60%)',
                      }}
                    />

                    {/* Vertical Red Cut Line */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: '-1px',
                        width: 2,
                        bgcolor: '#ff4d4f',
                        boxShadow: '0 0 8px rgba(255, 77, 79, 0.9)',
                      }}
                    />

                    {/* Filmora Center Scissor Button (✂️ 가위 분할 버튼) */}
                    <Tooltip title="✂️ 이 위치에서 클립 자르기 (Split)" arrow placement="top">
                      <Box
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSplitClipAtPlayhead();
                        }}
                        sx={{
                          pointerEvents: 'auto',
                          position: 'absolute',
                          top: '52px',
                          left: '-14px',
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          bgcolor: '#ff4d4f',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: '0 2px 10px rgba(255, 77, 79, 0.75)',
                          border: '2px solid #ffffff',
                          transition: 'transform 0.15s ease, background-color 0.15s ease',
                          '&:hover': {
                            transform: 'scale(1.22)',
                            bgcolor: '#f5222d',
                          },
                          '&:active': {
                            transform: 'scale(0.95)',
                          },
                        }}
                      >
                        <ContentCutRoundedIcon sx={{ fontSize: 15 }} />
                      </Box>
                    </Tooltip>
                  </Box>
                )}

                {/* ─── 1. T1 SUBTITLE / TEXT TRACK LANE (자막 트랙) ─── */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    height: 38,
                    position: 'relative',
                  }}
                >
                  {/* T1 Track Label Box */}
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#a5b4fc',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      bgcolor: 'rgba(99, 102, 241, 0.12)',
                      border: '1px solid rgba(99, 102, 241, 0.25)',
                      borderRadius: 1.5,
                      flexShrink: 0,
                    }}
                  >
                    🔤 T1
                  </Box>

                  {/* T1 Track Subtitle Clip Bars */}
                  <Box
                    sx={{
                      flex: '1 1 auto',
                      height: 36,
                      position: 'relative',
                      bgcolor: 'rgba(255,255,255,0.02)',
                      borderRadius: 1.5,
                      border: '1px dashed rgba(255,255,255,0.08)',
                      overflow: 'visible',
                      minWidth: `${totalTimelineDurationSec * 100 * timelineZoom + 120}px`,
                    }}
                  >
                    {textClips.map((t) => {
                      const isSelected = selectedTextId === t.id;
                      const leftPx = t.startTime * 100 * timelineZoom;
                      const widthPx = Math.max(36, t.duration * 100 * timelineZoom);

                      return (
                        <Box
                          key={t.id}
                          className="text-card-box"
                          onPointerDown={(e) => handleTextPointerDown(e, t.id, 'move')}
                          onPointerMove={handleTextPointerMove}
                          onPointerUp={handleTextPointerUp}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTextId(t.id);
                            setInspectorTab('text');
                          }}
                          sx={{
                            position: 'absolute',
                            left: `${leftPx}px`,
                            top: 2,
                            width: `${widthPx}px`,
                            height: 32,
                            borderRadius: 1.5,
                            bgcolor: isSelected ? '#4338ca' : '#4f46e5',
                            border: '1.5px solid',
                            borderColor: isSelected ? '#a5b4fc' : '#6366f1',
                            boxShadow: isSelected
                              ? '0 0 12px rgba(99, 102, 241, 0.6)'
                              : '0 2px 6px rgba(0,0,0,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            px: 1,
                            cursor: 'grab',
                            userSelect: 'none',
                            transition: 'background-color 0.15s, border-color 0.15s',
                            zIndex: 10,
                            '&:active': { cursor: 'grabbing' },
                          }}
                        >
                          {/* Left Trim Handle */}
                          <Box
                            className="trim-handle"
                            onPointerDown={(e) => handleTextPointerDown(e, t.id, 'trim-start')}
                            onPointerMove={handleTextPointerMove}
                            onPointerUp={handleTextPointerUp}
                            sx={{
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              bottom: 0,
                              width: 8,
                              cursor: 'ew-resize',
                              bgcolor: 'rgba(255,255,255,0.2)',
                              borderTopLeftRadius: 5,
                              borderBottomLeftRadius: 5,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              '&:hover': { bgcolor: '#ffffff' },
                            }}
                          >
                            <Box
                              sx={{ width: 1.5, height: 12, bgcolor: '#ffffff', borderRadius: 1 }}
                            />
                          </Box>

                          {/* Text Title & Label */}
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.6,
                              overflow: 'hidden',
                              px: 0.8,
                              flex: '1 1 auto',
                            }}
                          >
                            <Box
                              sx={{
                                width: 16,
                                height: 16,
                                borderRadius: 0.8,
                                bgcolor: 'rgba(255,255,255,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.62rem',
                                fontWeight: 900,
                                color: '#ffffff',
                                flexShrink: 0,
                              }}
                            >
                              T
                            </Box>
                            <Typography
                              sx={{
                                color: '#ffffff',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {t.text || 'YOUR TEXT HERE'}
                            </Typography>
                          </Box>

                          {/* Right Trim Handle */}
                          <Box
                            className="trim-handle"
                            onPointerDown={(e) => handleTextPointerDown(e, t.id, 'trim-end')}
                            onPointerMove={handleTextPointerMove}
                            onPointerUp={handleTextPointerUp}
                            sx={{
                              position: 'absolute',
                              right: 0,
                              top: 0,
                              bottom: 0,
                              width: 8,
                              cursor: 'ew-resize',
                              bgcolor: 'rgba(255,255,255,0.2)',
                              borderTopRightRadius: 5,
                              borderBottomRightRadius: 5,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              '&:hover': { bgcolor: '#ffffff' },
                            }}
                          >
                            <Box
                              sx={{ width: 1.5, height: 12, bgcolor: '#ffffff', borderRadius: 1 }}
                            />
                          </Box>
                        </Box>
                      );
                    })}

                    {/* Add Subtitle Button at End of Text Track */}
                    <Box
                      onClick={handleAddTextClip}
                      sx={{
                        position: 'absolute',
                        left:
                          textClips.length === 0
                            ? '4px'
                            : `${
                                (textClips.reduce(
                                  (max, t) => Math.max(max, t.startTime + t.duration),
                                  0
                                ) +
                                  0.1) *
                                100 *
                                timelineZoom
                              }px`,
                        top: 4,
                        height: 28,
                        px: 1.2,
                        borderRadius: 1.5,
                        bgcolor: 'rgba(99, 102, 241, 0.15)',
                        border: '1px dashed #6366f1',
                        color: '#a5b4fc',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        cursor: 'pointer',
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          bgcolor: 'rgba(99, 102, 241, 0.3)',
                          transform: 'scale(1.04)',
                        },
                      }}
                    >
                      <AddRoundedIcon sx={{ fontSize: 14 }} /> 자막 추가
                    </Box>
                  </Box>
                </Box>

                {/* ─── 2. V1 VIDEO / MEDIA TRACK LANE (비디오 트랙) ─── */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    minHeight: 80,
                    position: 'relative',
                  }}
                >
                  {/* V1 Track Label Box */}
                  <Box
                    sx={{
                      width: 36,
                      height: 80,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748b',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      bgcolor: 'rgba(255,255,255,0.02)',
                      borderRadius: 1.5,
                      flexShrink: 0,
                    }}
                  >
                    🎬 V1
                  </Box>

                  {/* Clip Cards List with Drag & Drop Reordering */}
                  {clips.map((clip, idx) => {
                    const isSelected = selectedClipId === clip.id;
                    const isCurrentPlaying =
                      currentActiveFrame && currentActiveFrame.clipId === clip.id;

                    const baseWidth = getClipPixelWidth(clip);

                    const isBeingDragged = draggedClipIndex === idx;
                    const isDropTarget = dragOverClipIndex === idx;

                    return (
                      <Box
                        key={clip.id}
                        className="clip-card-box"
                        draggable
                        onDragStart={(e) => handleClipDragStart(e, idx)}
                        onDragOver={(e) => handleClipDragOver(e, idx)}
                        onDrop={(e) => handleClipDrop(e, idx)}
                        onDragEnd={handleClipDragEnd}
                        onClick={() => {
                          setSelectedClipId(clip.id);
                          const frameIdx = flattenedTimelineFrames.findIndex(
                            (f) => f.clipId === clip.id
                          );
                          if (frameIdx !== -1) setCurrentPlayheadFrameIdx(frameIdx);
                        }}
                        sx={{
                          width: `${baseWidth}px`,
                          minWidth: 24,
                          height: 80,
                          borderRadius: 2,
                          overflow: 'hidden',
                          position: 'relative',
                          cursor: 'grab',
                          bgcolor: '#1e293b',
                          opacity: isBeingDragged ? 0.35 : 1,
                          transform: isBeingDragged ? 'scale(0.96)' : 'none',
                          border: '2px solid',
                          borderColor: isCurrentPlaying
                            ? 'primary.main'
                            : isSelected
                              ? '#38bdf8'
                              : 'rgba(255,255,255,0.12)',
                          borderLeft:
                            isDropTarget && dropPosition === 'left'
                              ? '4px solid #38bdf8'
                              : undefined,
                          borderRight:
                            isDropTarget && dropPosition === 'right'
                              ? '4px solid #38bdf8'
                              : undefined,
                          boxShadow: isCurrentPlaying ? '0 0 10px rgba(56, 189, 248, 0.5)' : 'none',
                          transition:
                            'border-color 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          flexShrink: 0,
                          userSelect: 'none',
                        }}
                      >
                        {/* Left Trim Handle */}
                        <Box
                          className="trim-handle"
                          onPointerDown={(e) => handleTrimPointerDown(e, clip, 'start')}
                          onPointerMove={handleTrimPointerMove}
                          onPointerUp={handleTrimPointerUp}
                          sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: 8,
                            cursor: 'ew-resize',
                            bgcolor: isSelected ? 'primary.main' : 'rgba(255,255,255,0.2)',
                            zIndex: 5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            '&:hover': { bgcolor: 'primary.light' },
                          }}
                        >
                          <Box
                            sx={{ width: 1.5, height: 16, bgcolor: '#ffffff', borderRadius: 1 }}
                          />
                        </Box>

                        {/* Right Trim Handle */}
                        <Box
                          className="trim-handle"
                          onPointerDown={(e) => handleTrimPointerDown(e, clip, 'end')}
                          onPointerMove={handleTrimPointerMove}
                          onPointerUp={handleTrimPointerUp}
                          sx={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            bottom: 0,
                            width: 8,
                            cursor: 'ew-resize',
                            bgcolor: isSelected ? 'primary.main' : 'rgba(255,255,255,0.2)',
                            zIndex: 5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            '&:hover': { bgcolor: 'primary.light' },
                          }}
                        >
                          <Box
                            sx={{ width: 1.5, height: 16, bgcolor: '#ffffff', borderRadius: 1 }}
                          />
                        </Box>

                        {/* Filmstrip / Thumbnail Image */}
                        <Box
                          sx={{
                            flex: 1,
                            position: 'relative',
                            overflow: 'hidden',
                            display: 'flex',
                          }}
                        >
                          <Box
                            component="img"
                            src={clip.src}
                            alt="thumb"
                            sx={{
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
                          {baseWidth >= 48 && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 2,
                                left: 10,
                                bgcolor: 'rgba(0,0,0,0.7)',
                                color: '#ffffff',
                                px: 0.5,
                                py: 0.1,
                                borderRadius: 0.8,
                                fontSize: '0.6rem',
                                fontWeight: 800,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              #{idx + 1} {clip.type === 'gif' ? 'GIF' : 'IMG'}
                            </Box>
                          )}
                        </Box>

                        {/* Clip Bottom Info Bar with Reorder Arrows */}
                        <Box
                          sx={{
                            height: 20,
                            bgcolor: isSelected ? 'primary.darker' : 'rgba(0,0,0,0.85)',
                            px: baseWidth >= 60 ? 1.0 : 0.4,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            overflow: 'hidden',
                          }}
                        >
                          <Typography
                            sx={{
                              color: '#38bdf8',
                              fontSize: '0.58rem',
                              fontWeight: 800,
                              fontFamily: 'monospace',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {clip.type === 'gif' && clip.frames
                              ? `${(
                                  clip.frames
                                    .slice(clip.trimStart, clip.trimEnd + 1)
                                    .reduce((s, f) => s + (f.delay || 100), 0) / 1000
                                ).toFixed(1)}s`
                              : `${(clip.duration || 1.0).toFixed(1)}s`}
                          </Typography>

                          {baseWidth >= 75 && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <IconButton
                                size="small"
                                disabled={idx === 0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveClip(idx, -1);
                                }}
                                sx={{ p: 0.1, color: '#94a3b8' }}
                              >
                                <ArrowUpwardRoundedIcon
                                  sx={{ fontSize: 10, transform: 'rotate(-90deg)' }}
                                />
                              </IconButton>
                              <IconButton
                                size="small"
                                disabled={idx === clips.length - 1}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveClip(idx, 1);
                                }}
                                sx={{ p: 0.1, color: '#94a3b8' }}
                              >
                                <ArrowDownwardRoundedIcon
                                  sx={{ fontSize: 10, transform: 'rotate(-90deg)' }}
                                />
                              </IconButton>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    );
                  })}

                  {/* + Add Media Box */}
                  <Box
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      width: 80,
                      minWidth: 80,
                      height: 80,
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
            </Box>
          </Card>
        </Box>
      )}

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
              handleSelectSample(sample);
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
