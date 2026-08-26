'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import ToggleButton from '@mui/material/ToggleButton';
import GifRoundedIcon from '@mui/icons-material/GifRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import CallSplitRoundedIcon from '@mui/icons-material/CallSplitRounded';
import ColorLensRoundedIcon from '@mui/icons-material/ColorLensRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import AspectRatioRoundedIcon from '@mui/icons-material/AspectRatioRounded';
import SkipPreviousRoundedIcon from '@mui/icons-material/SkipPreviousRounded';
import VideoLibraryRoundedIcon from '@mui/icons-material/VideoLibraryRounded';
import MovieCreationRoundedIcon from '@mui/icons-material/MovieCreationRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

import {
  mergeGifs,
  formatBytes,
  downloadDataUrl,
  extractGifFrames,
  exportFramesToZip,
  type GifFrameItem,
  convertGifToVideo,
  getDataUrlByteSize,
  createGifFromImages,
  type GifMergeClipItem,
  convertVideoSegmentToGif,
  modifyGifBackgroundColor,
  adjustGifSpeedAndReverse,
} from '../utils/gif-processor';

// ----------------------------------------------------------------------

interface UploadedImageItem {
  id: string;
  name: string;
  src: string;
  delay?: number;
}

export type GifStudioTabType = 'create' | 'video' | 'split' | 'bg' | 'speed' | 'merge';

interface GifStudioViewProps {
  initialTab?: GifStudioTabType;
}

// ----------------------------------------------------------------------

export function GifStudioView({ initialTab = 'create' }: GifStudioViewProps) {
  const [currentTab, setCurrentTab] = useState<GifStudioTabType>(initialTab);

  // Sync if initialTab prop changes
  useEffect(() => {
    if (initialTab) {
      setCurrentTab(initialTab);
    }
  }, [initialTab]);

  // Resizable Right Panel
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(380);
  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(380);

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

  // ==========================================
  // TAB 1: CREATE GIF (움짤 만들기)
  // ==========================================
  const [createImages, setCreateImages] = useState<UploadedImageItem[]>([]);
  const [fps, setFps] = useState<number>(10);
  const [fitMode, setFitMode] = useState<'contain' | 'cover' | 'stretch'>('contain');
  const [createBgColor, setCreateBgColor] = useState<string>('transparent');
  const [targetWidth, setTargetWidth] = useState<number>(400);
  const [targetHeight, setTargetHeight] = useState<number>(400);
  const [loopMode, setLoopMode] = useState<'normal' | 'reverse' | 'boomerang'>('normal');
  const [overlayText, setOverlayText] = useState<string>('');
  const [fontSize, setFontSize] = useState<number>(24);
  const [fontColor, setFontColor] = useState<string>('#ffffff');
  const [textPosition, setTextPosition] = useState<
    'top' | 'center' | 'bottom' | 'top-left' | 'bottom-right'
  >('bottom');
  const [sampleInterval, setSampleInterval] = useState<number>(10);

  const [createResultUrl, setCreateResultUrl] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [createProgress, setCreateProgress] = useState<number>(0);

  const [previewFrameIndex, setPreviewFrameIndex] = useState<number>(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(true);
  const createFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isPlayingPreview || createImages.length <= 1) return undefined;
    const interval = 1000 / Math.max(1, fps);
    const timer = setInterval(() => {
      setPreviewFrameIndex((prev) => (prev + 1) % createImages.length);
    }, interval);
    return () => clearInterval(timer);
  }, [isPlayingPreview, createImages.length, fps]);

  const addCreateFiles = useCallback((files: File[]) => {
    if (files.length === 0) return;
    const newItems: UploadedImageItem[] = [];
    let count = 0;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const src = evt.target?.result as string;
        if (src) {
          newItems.push({
            id: `img_${Date.now()}_${Math.random()}`,
            name: file.name,
            src,
          });
        }
        count += 1;
        if (count === files.length) {
          setCreateImages((prev) => [...prev, ...newItems]);
        }
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleGenerateGif = async () => {
    if (createImages.length < 2) {
      toast.error('GIF 생성을 위해 최소 2장 이상의 사진이 필요합니다.');
      return;
    }

    setIsCreating(true);
    setCreateProgress(0);
    toast.info('GIF를 렌더링하고 있습니다. 잠시만 기다려주세요...');

    try {
      const gifUrl = await createGifFromImages({
        images: createImages,
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

  // ==========================================
  // TAB 2: VIDEO TO GIF (동영상 변환)
  // ==========================================
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoRange, setVideoRange] = useState<[number, number]>([0, 5]);
  const [videoFps, setVideoFps] = useState<number>(10);
  const [videoWidth, setVideoWidth] = useState<number>(480);
  const [videoQuality, setVideoQuality] = useState<number>(8);
  const [videoCaption, setVideoCaption] = useState<string>('');
  const [videoResultUrl, setVideoResultUrl] = useState<string>('');
  const [isVideoConverting, setIsVideoConverting] = useState<boolean>(false);
  const [videoProgress, setVideoProgress] = useState<number>(0);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);

  const handleVideoUpload = useCallback((file: File) => {
    if (!file.type.startsWith('video/')) {
      toast.error('비디오 파일(MP4, WebM 등)을 업로드해주세요.');
      return;
    }
    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoUrl(url);
    setVideoResultUrl('');
    setVideoProgress(0);
  }, []);

  const handleLoadedVideoMetadata = () => {
    if (videoPlayerRef.current) {
      const dur = videoPlayerRef.current.duration || 5;
      setVideoDuration(dur);
      setVideoRange([0, Math.min(5, dur)]);
    }
  };

  const handleConvertVideoToGif = async () => {
    if (!videoUrl) {
      toast.error('변환할 동영상 파일을 먼저 업로드해주세요.');
      return;
    }
    setIsVideoConverting(true);
    setVideoProgress(0);
    setVideoResultUrl('');
    toast.info('동영상을 GIF로 변환하고 있습니다...');

    try {
      const height = Math.round((videoWidth / 16) * 9);
      const res = await convertVideoSegmentToGif(
        videoUrl,
        {
          startTime: videoRange[0],
          endTime: videoRange[1],
          width: videoWidth,
          height,
          fps: videoFps,
          quality: videoQuality,
          textOverlay: videoCaption.trim()
            ? {
                text: videoCaption,
                fontSize: 22,
                fontColor: '#ffffff',
                position: 'bottom',
              }
            : undefined,
        },
        (p) => setVideoProgress(p)
      );

      setVideoResultUrl(res);
      toast.success('동영상 → GIF 변환이 완료되었습니다!');
    } catch {
      toast.error('GIF 변환 중 오류가 발생했습니다.');
    } finally {
      setIsVideoConverting(false);
    }
  };

  // ==========================================
  // TAB 3: SPLIT GIF (프레임 분할 추출)
  // ==========================================
  const [splitFile, setSplitFile] = useState<File | null>(null);
  const [splitFrames, setSplitFrames] = useState<GifFrameItem[]>([]);
  const [selectedFrameIds, setSelectedFrameIds] = useState<Set<string>>(new Set());
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [splitPlayerIndex, setSplitPlayerIndex] = useState<number>(0);
  const [isPlayingSplit, setIsPlayingSplit] = useState<boolean>(false);
  const splitInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isPlayingSplit || splitFrames.length === 0) return undefined;
    const currentFrame = splitFrames[splitPlayerIndex];
    const delay = currentFrame?.delay || 100;
    const timer = setTimeout(() => {
      setSplitPlayerIndex((prev) => (prev + 1) % splitFrames.length);
    }, delay);
    return () => clearTimeout(timer);
  }, [isPlayingSplit, splitFrames, splitPlayerIndex]);

  const processSplitFile = useCallback(async (file: File) => {
    setSplitFile(file);
    setIsExtracting(true);
    toast.info('GIF 프레임을 분석하고 분할 추출하는 중입니다...');

    try {
      const res = await extractGifFrames(file);
      setSplitFrames(res.frames);
      setSelectedFrameIds(new Set(res.frames.map((f) => f.id)));
      toast.success(`총 ${res.frames.length}개 프레임이 추출되었습니다.`);
    } catch {
      toast.error('GIF 프레임 분할에 실패했습니다.');
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const toggleSelectFrame = (id: string) => {
    setSelectedFrameIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExportFramesZip = async () => {
    const framesToExport = splitFrames.filter((f) => selectedFrameIds.has(f.id));
    if (framesToExport.length === 0) {
      toast.error('내보낼 프레임을 1개 이상 선택해주세요.');
      return;
    }

    try {
      await exportFramesToZip(framesToExport, `gif_frames_${Date.now()}.zip`);
      toast.success(`${framesToExport.length}개 프레임 ZIP 다운로드 완료!`);
    } catch {
      toast.error('ZIP 내보내기 중 오류가 발생했습니다.');
    }
  };

  // ==========================================
  // TAB 4: BACKGROUND & CHROMA KEY (배경색/투명화)
  // ==========================================
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [bgFilePreview, setBgFilePreview] = useState<string>('');
  const [bgMode, setBgMode] = useState<'solid' | 'transparent'>('solid');
  const [targetBgColor, setTargetBgColor] = useState<string>('#ffffff');
  const [chromaKeyColor, setChromaKeyColor] = useState<string>('#ffffff');
  const [bgTolerance, setBgTolerance] = useState<number>(30);
  const [bgResultUrl, setBgResultUrl] = useState<string>('');
  const [isModifyingBg, setIsModifyingBg] = useState<boolean>(false);
  const [bgProgress, setBgProgress] = useState<number>(0);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const processBgFile = useCallback((file: File) => {
    setBgFile(file);
    setBgResultUrl('');
    const url = URL.createObjectURL(file);
    setBgFilePreview(url);
  }, []);

  const handleApplyBgColor = async () => {
    if (!bgFile) {
      toast.error('수정할 GIF 파일을 먼저 업로드해주세요.');
      return;
    }
    setIsModifyingBg(true);
    setBgProgress(0);
    toast.info('GIF 배경 색상을 처리하고 있습니다...');

    try {
      const resultUrl = await modifyGifBackgroundColor(
        bgFile,
        bgMode === 'transparent' ? 'transparent' : targetBgColor,
        bgMode === 'transparent' ? chromaKeyColor : undefined,
        bgTolerance,
        (p) => setBgProgress(p)
      );
      setBgResultUrl(resultUrl);
      toast.success('배경 색상 변환이 완료되었습니다!');
    } catch {
      toast.error('배경 수정 중 오류가 발생했습니다.');
    } finally {
      setIsModifyingBg(false);
    }
  };

  // ==========================================
  // TAB 5: SPEED, REVERSE & OPTIMIZE (속도/역재생)
  // ==========================================
  const [speedFile, setSpeedFile] = useState<File | null>(null);
  const [speedFilePreview, setSpeedFilePreview] = useState<string>('');
  const [speedFrames, setSpeedFrames] = useState<GifFrameItem[]>([]);
  const [speedDimensions, setSpeedDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const [isSpeedExtracting, setIsSpeedExtracting] = useState<boolean>(false);
  const [speedPlayerIndex, setSpeedPlayerIndex] = useState<number>(0);
  const [isPlayingSpeed, setIsPlayingSpeed] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [speedLoopMode, setSpeedLoopMode] = useState<'normal' | 'reverse' | 'boomerang'>('normal');
  const [skipFrames, setSkipFrames] = useState<boolean>(false);
  const [resizeScale, setResizeScale] = useState<number>(1.0);
  const [speedResultUrl, setSpeedResultUrl] = useState<string>('');
  const [activeSpeedPreviewTab, setActiveSpeedPreviewTab] = useState<'live' | 'encoded'>('live');
  const [isSpeedProcessing, setIsSpeedProcessing] = useState<boolean>(false);
  const [speedProgress, setSpeedProgress] = useState<number>(0);
  const [speedMp4Url, setSpeedMp4Url] = useState<string>('');
  const [speedMp4Size, setSpeedMp4Size] = useState<number>(0);
  const [isSpeedMp4Converting, setIsSpeedMp4Converting] = useState<boolean>(false);
  const [speedMp4Progress, setSpeedMp4Progress] = useState<number>(0);
  const speedInputRef = useRef<HTMLInputElement>(null);
  const boomerangForwardRef = useRef<boolean>(true);

  const processSpeedFile = useCallback(async (file: File) => {
    setSpeedFile(file);
    setSpeedResultUrl('');
    setSpeedMp4Url('');
    setSpeedMp4Size(0);
    setActiveSpeedPreviewTab('live');
    const url = URL.createObjectURL(file);
    setSpeedFilePreview(url);
    setIsSpeedExtracting(true);
    setSpeedPlayerIndex(0);
    setIsPlayingSpeed(true);
    boomerangForwardRef.current = true;
    toast.info('GIF 프레임을 분석하여 실시간 미리보기를 준비하는 중...');

    try {
      const res = await extractGifFrames(file);
      setSpeedFrames(res.frames);
      setSpeedDimensions({ width: res.width, height: res.height });
      toast.success(`총 ${res.frames.length}개 프레임 로드 완료! 속도와 방향을 즉시 조절해보세요.`);
    } catch {
      toast.error('GIF 프레임 분석에 실패했습니다.');
      setSpeedFrames([]);
    } finally {
      setIsSpeedExtracting(false);
    }
  }, []);

  // Filtered active frames based on skipFrames
  const activeSpeedFrames = React.useMemo(() => {
    if (!speedFrames || speedFrames.length === 0) return [];
    if (skipFrames && speedFrames.length > 4) {
      return speedFrames.filter((_, idx) => idx % 2 === 0);
    }
    return speedFrames;
  }, [speedFrames, skipFrames]);

  useEffect(() => {
    if (activeSpeedFrames.length > 0 && speedPlayerIndex >= activeSpeedFrames.length) {
      setSpeedPlayerIndex(0);
    }
  }, [activeSpeedFrames.length, speedPlayerIndex]);

  useEffect(() => {
    if (speedLoopMode === 'reverse') {
      boomerangForwardRef.current = false;
    } else {
      boomerangForwardRef.current = true;
    }
  }, [speedLoopMode]);

  // Live Playback Engine
  useEffect(() => {
    if (!isPlayingSpeed || activeSpeedFrames.length <= 1) return undefined;

    const currentFrame = activeSpeedFrames[speedPlayerIndex] || activeSpeedFrames[0];
    const baseDelay = currentFrame?.delay || 100;
    const effectiveDelay = skipFrames ? baseDelay * 2 : baseDelay;
    const targetDelay = Math.max(5, Math.round(effectiveDelay / Math.max(0.1, speedMultiplier)));

    const timer = setTimeout(() => {
      setSpeedPlayerIndex((prev) => {
        const total = activeSpeedFrames.length;
        if (total <= 1) return 0;

        if (speedLoopMode === 'normal') {
          return (prev + 1) % total;
        }

        if (speedLoopMode === 'reverse') {
          return prev <= 0 ? total - 1 : prev - 1;
        }

        if (speedLoopMode === 'boomerang') {
          if (boomerangForwardRef.current) {
            if (prev >= total - 1) {
              boomerangForwardRef.current = false;
              return Math.max(0, total - 2);
            }
            return prev + 1;
          }
          if (prev <= 0) {
            boomerangForwardRef.current = true;
            return Math.min(total - 1, 1);
          }
          return prev - 1;
        }

        return (prev + 1) % total;
      });
    }, targetDelay);

    return () => clearTimeout(timer);
  }, [
    isPlayingSpeed,
    activeSpeedFrames,
    speedPlayerIndex,
    speedMultiplier,
    speedLoopMode,
    skipFrames,
  ]);

  const handleSpeedMultiplierChange = (newSpeed: number) => {
    setSpeedMultiplier(newSpeed);
    setSpeedMp4Url('');
    setSpeedMp4Size(0);
    if (speedResultUrl) setActiveSpeedPreviewTab('live');
  };

  const handleSpeedLoopModeChange = (newMode: 'normal' | 'reverse' | 'boomerang') => {
    setSpeedLoopMode(newMode);
    setSpeedMp4Url('');
    setSpeedMp4Size(0);
    if (speedResultUrl) setActiveSpeedPreviewTab('live');
  };

  const handleSpeedSkipFramesChange = (checked: boolean) => {
    setSkipFrames(checked);
    setSpeedMp4Url('');
    setSpeedMp4Size(0);
    if (speedResultUrl) setActiveSpeedPreviewTab('live');
  };

  const handleApplySpeedAndReverse = async () => {
    if (!speedFile) {
      toast.error('처리할 GIF 파일을 먼저 업로드해주세요.');
      return;
    }
    setIsSpeedProcessing(true);
    setSpeedProgress(0);
    setSpeedMp4Url('');
    setSpeedMp4Size(0);
    toast.info('GIF 속도 및 재생 옵션을 새 GIF 파일로 재인코딩 중입니다...');

    try {
      const res = await adjustGifSpeedAndReverse(speedFile, {
        speedMultiplier,
        loopMode: speedLoopMode,
        skipFrames,
        resizeScale,
        progressCallback: (p) => setSpeedProgress(p),
      });
      setSpeedResultUrl(res);
      setActiveSpeedPreviewTab('encoded');
      toast.success('GIF 속도/역재생 인코딩이 완료되었습니다!');
    } catch {
      toast.error('GIF 속도 조절 중 오류가 발생했습니다.');
    } finally {
      setIsSpeedProcessing(false);
    }
  };

  const handleDownloadSpeedMp4 = async () => {
    if (!speedResultUrl) {
      toast.error('먼저 속도/역재생 적용 인코딩을 완료해주세요.');
      return;
    }

    if (speedMp4Url) {
      const link = document.createElement('a');
      link.href = speedMp4Url;
      link.download = `speed_${speedMultiplier}x_${speedLoopMode}_${Date.now()}.mp4`;
      link.click();
      toast.success('MP4 동영상이 다운로드되었습니다.');
      return;
    }

    setIsSpeedMp4Converting(true);
    setSpeedMp4Progress(0);
    toast.info('속도/역재생이 적용된 MP4 동영상으로 변환하고 있습니다...');

    try {
      const resBlob = await fetch(speedResultUrl).then((r) => r.blob());
      const videoRes = await convertGifToVideo(resBlob, {
        targetFormat: 'mp4',
        fps: 30,
        scale: 1.0,
        speedMultiplier: 1.0,
        progressCallback: (p) => setSpeedMp4Progress(p),
      });

      setSpeedMp4Url(videoRes.videoUrl);
      setSpeedMp4Size(videoRes.size);

      const link = document.createElement('a');
      link.href = videoRes.videoUrl;
      link.download = `speed_${speedMultiplier}x_${speedLoopMode}_${Date.now()}.mp4`;
      link.click();

      toast.success('MP4 동영상 다운로드가 완료되었습니다!');
    } catch {
      toast.error('MP4 동영상 변환 중 오류가 발생했습니다.');
    } finally {
      setIsSpeedMp4Converting(false);
    }
  };

  // ==========================================
  // TAB 6: MERGE GIFS (GIF 합치기 · 이어붙이기)
  // ==========================================
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
  const [trimmingState, setTrimmingState] = useState<{
    clipId: string;
    handle: 'start' | 'end';
    startX: number;
    initialTrimStart: number;
    initialTrimEnd: number;
    totalFrames: number;
    pxPerFrame: number;
  } | null>(null);
  const mergeInputRef = useRef<HTMLInputElement>(null);

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

  const [isExternalDragOverTrack, setIsExternalDragOverTrack] = useState<boolean>(false);

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

  // ==========================================
  // DROP & PASTE HOOKS
  // ==========================================
  const createDrop = useImageDropPaste({
    onFiles: addCreateFiles,
    multiple: true,
    disabled: currentTab !== 'create',
  });

  const videoDrop = useImageDropPaste({
    onFiles: (files) => {
      if (files[0]) handleVideoUpload(files[0]);
    },
    accept: ['video/*'],
    multiple: false,
    disabled: currentTab !== 'video',
  });

  const splitDrop = useImageDropPaste({
    onFiles: (files) => {
      if (files[0]) processSplitFile(files[0]);
    },
    accept: ['image/gif'],
    multiple: false,
    disabled: currentTab !== 'split',
  });

  const bgDrop = useImageDropPaste({
    onFiles: (files) => {
      if (files[0]) processBgFile(files[0]);
    },
    accept: ['image/gif'],
    multiple: false,
    disabled: currentTab !== 'bg',
  });

  const speedDrop = useImageDropPaste({
    onFiles: (files) => {
      if (files[0]) processSpeedFile(files[0]);
    },
    accept: ['image/gif'],
    multiple: false,
    disabled: currentTab !== 'speed',
  });

  const mergeDrop = useImageDropPaste({
    onFiles: (files) => {
      processMergeFiles(files);
    },
    accept: ['image/gif'],
    multiple: true,
    disabled: currentTab !== 'merge',
  });

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
      {/* Header */}
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              bgcolor: 'primary.lighter',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {currentTab === 'create' && <GifRoundedIcon sx={{ fontSize: 30 }} />}
            {currentTab === 'video' && <VideoLibraryRoundedIcon sx={{ fontSize: 28 }} />}
            {currentTab === 'split' && <CallSplitRoundedIcon sx={{ fontSize: 28 }} />}
            {currentTab === 'bg' && <ColorLensRoundedIcon sx={{ fontSize: 28 }} />}
            {currentTab === 'speed' && <SpeedRoundedIcon sx={{ fontSize: 28 }} />}
            {currentTab === 'merge' && <LayersRoundedIcon sx={{ fontSize: 28 }} />}
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {currentTab === 'create' && '움짤 (GIF) 만들기'}
              {currentTab === 'video' && '동영상 → GIF 변환'}
              {currentTab === 'split' && 'GIF 프레임 분할 · 추출'}
              {currentTab === 'bg' && 'GIF 배경색 변경 · 투명화'}
              {currentTab === 'speed' && 'GIF 속도 조절 & 역재생'}
              {currentTab === 'merge' && 'GIF 합치기 · 이어붙이기'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {currentTab === 'create' &&
                '여러 장의 이미지로 고화질 애니메이션 움짤(GIF)을 제작합니다.'}
              {currentTab === 'video' &&
                'MP4, WebM, MOV 동영상의 원하는 구간을 정밀하게 추출하여 GIF로 변환합니다.'}
              {currentTab === 'split' &&
                'GIF 애니메이션의 모든 프레임을 개별 PNG 이미지로 추출하고 일괄 다운로드(ZIP)합니다.'}
              {currentTab === 'bg' &&
                'GIF의 특정 배경색을 다른 색으로 변경하거나 투명화(크로마키 제거) 처리합니다.'}
              {currentTab === 'speed' &&
                'GIF 재생 속도를 빠르게/느리게 조절하거나 거꾸로 재생(역재생/부메랑)하도록 편집합니다.'}
              {currentTab === 'merge' &&
                '여러 개의 GIF를 원하는 순서로 배치하고, 구간 자르기, 배속, 역재생, 반복 횟수를 조절하여 하나로 병합합니다.'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ============================================================== */}
      {/* TAB 1: CREATE GIF (사진으로 움짤 만들기)                         */}
      {/* ============================================================== */}
      {currentTab === 'create' && (
        <>
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
            <Card
              {...createDrop.getRootProps({
                onClick: () => createFileInputRef.current?.click(),
              })}
              sx={{
                p: 6,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 3,
                flex: '1 1 auto',
                minHeight: 0,
                height: '100%',
                '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: 'primary.lighter',
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <GifRoundedIcon sx={{ fontSize: 42 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                움짤(GIF)로 제작할 여러 장의 사진 업로드
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                사진을 드래그하거나 클릭하여 2장 이상 추가하세요 (순서 변경 / 자막 / 루프 지원)
              </Typography>
              <Button variant="contained" color="primary" startIcon={<CloudUploadRoundedIcon />}>
                사진 선택하기
              </Button>
            </Card>
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
              {/* Left: Preview */}
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
                <Card
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    flex: '1 1 auto',
                    minHeight: 0,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1.5,
                      flexShrink: 0,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      미리보기 ({createImages.length}장)
                    </Typography>
                    <IconButton size="small" onClick={() => setIsPlayingPreview(!isPlayingPreview)}>
                      {isPlayingPreview ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
                    </IconButton>
                  </Box>

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
                    {createResultUrl ? (
                      <img
                        src={createResultUrl}
                        alt="GIF Output"
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      createImages[previewFrameIndex] && (
                        <Box sx={{ position: 'relative', maxWidth: '100%', maxHeight: '100%' }}>
                          <img
                            src={createImages[previewFrameIndex].src}
                            alt="preview frame"
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                          />
                          {overlayText.trim() && (
                            <Typography
                              variant="h6"
                              sx={{
                                position: 'absolute',
                                bottom: textPosition.includes('bottom') ? 16 : 'auto',
                                top: textPosition.includes('top') ? 16 : 'auto',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                color: fontColor,
                                fontSize: `${fontSize}px`,
                                fontWeight: 800,
                                textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                                width: '90%',
                                textAlign: 'center',
                              }}
                            >
                              {overlayText}
                            </Typography>
                          )}
                        </Box>
                      )
                    )}
                  </Box>
                </Card>

                {/* Frame list strip */}
                <Card sx={{ p: 1.5, borderRadius: 3, flexShrink: 0, maxHeight: 110 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, mb: 0.5, display: 'block' }}>
                    프레임 순서 ({createImages.length}개)
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', py: 0.5 }}>
                    {createImages.map((img, idx) => (
                      <Box
                        key={img.id}
                        onClick={() => {
                          setIsPlayingPreview(false);
                          setPreviewFrameIndex(idx);
                        }}
                        sx={{
                          position: 'relative',
                          width: 52,
                          height: 52,
                          borderRadius: 1.5,
                          overflow: 'hidden',
                          bgcolor: '#0f172a',
                          flexShrink: 0,
                          cursor: 'pointer',
                          border: '2px solid',
                          borderColor: previewFrameIndex === idx ? 'primary.main' : 'transparent',
                        }}
                      >
                        <img
                          src={img.src}
                          alt="thumb"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCreateImages((prev) => prev.filter((it) => it.id !== img.id));
                          }}
                          sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            bgcolor: 'rgba(0,0,0,0.6)',
                            color: '#fff',
                            p: 0.2,
                          }}
                        >
                          <DeleteRoundedIcon sx={{ fontSize: 12 }} />
                        </IconButton>
                      </Box>
                    ))}
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

              {/* Right: Controls */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: { xs: '100%', lg: `${rightPanelWidth}px` },
                  minWidth: { lg: `${rightPanelWidth}px` },
                  maxWidth: { lg: `${rightPanelWidth}px` },
                  flexShrink: 0,
                  gap: 2,
                  minHeight: 0,
                  overflowY: 'auto',
                  pl: { lg: 1 },
                }}
              >
                <Card
                  sx={{ p: 2.5, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 2 }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        초당 프레임 수 (FPS / 속도)
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {fps} FPS ({Math.round(1000 / fps)}ms)
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
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}
                    >
                      반복 모드
                    </Typography>
                    <ToggleButtonGroup
                      value={loopMode}
                      exclusive
                      onChange={(_, v) => v && setLoopMode(v)}
                      fullWidth
                      size="small"
                    >
                      <ToggleButton value="normal">정방향</ToggleButton>
                      <ToggleButton value="reverse">역방향</ToggleButton>
                      <ToggleButton value="boomerang">부메랑</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>

                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}
                    >
                      화면 맞춤 방식
                    </Typography>
                    <ToggleButtonGroup
                      value={fitMode}
                      exclusive
                      onChange={(_, v) => v && setFitMode(v)}
                      fullWidth
                      size="small"
                    >
                      <ToggleButton value="contain">여백 포함</ToggleButton>
                      <ToggleButton value="cover">꽉 채움</ToggleButton>
                      <ToggleButton value="stretch">비율 왜곡</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <TextField
                      size="small"
                      type="number"
                      label="가로 (px)"
                      value={targetWidth}
                      onChange={(e) => setTargetWidth(Number(e.target.value))}
                    />
                    <TextField
                      size="small"
                      type="number"
                      label="세로 (px)"
                      value={targetHeight}
                      onChange={(e) => setTargetHeight(Number(e.target.value))}
                    />
                  </Box>

                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}
                    >
                      배경 채우기 색상
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <input
                        type="color"
                        value={createBgColor === 'transparent' ? '#ffffff' : createBgColor}
                        onChange={(e) => setCreateBgColor(e.target.value)}
                        style={{
                          width: 44,
                          height: 36,
                          borderRadius: 6,
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      />
                      <Button
                        size="small"
                        variant={createBgColor === 'transparent' ? 'contained' : 'outlined'}
                        onClick={() => setCreateBgColor('transparent')}
                      >
                        투명 배경
                      </Button>
                    </Box>
                  </Box>

                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}
                    >
                      자막 텍스트 오버레이
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                      <TextField
                        size="small"
                        fullWidth
                        placeholder="자막 입력"
                        value={overlayText}
                        onChange={(e) => setOverlayText(e.target.value)}
                      />
                      <input
                        type="color"
                        value={fontColor}
                        onChange={(e) => setFontColor(e.target.value)}
                        style={{
                          width: 44,
                          height: 40,
                          borderRadius: 6,
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
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
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        자막 크기 ({fontSize}px)
                      </Typography>
                    </Box>
                    <Slider
                      size="small"
                      min={12}
                      max={72}
                      value={fontSize}
                      onChange={(_, v) => setFontSize(v as number)}
                    />
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        품질 샘플링 속도 ({sampleInterval <= 5 ? '고품질' : '고속'})
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
                </Card>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleGenerateGif}
                    disabled={isCreating || createImages.length < 2}
                    startIcon={
                      isCreating ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <GifRoundedIcon />
                      )
                    }
                    sx={{ py: 1.4, borderRadius: 2, fontWeight: 700 }}
                  >
                    {isCreating ? `생성 중 (${createProgress}%)` : '고화질 움짤(GIF) 생성'}
                  </Button>
                  {createResultUrl && (
                    <Button
                      fullWidth
                      variant="contained"
                      color="secondary"
                      onClick={() => downloadDataUrl(createResultUrl, `animated_${Date.now()}.gif`)}
                      startIcon={<DownloadRoundedIcon />}
                      sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
                    >
                      GIF 다운로드 ({formatBytes(getDataUrlByteSize(createResultUrl))})
                    </Button>
                  )}
                  <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    onClick={() => createFileInputRef.current?.click()}
                    startIcon={<CloudUploadRoundedIcon />}
                    sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
                  >
                    + 사진 추가하기
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    onClick={() => {
                      setCreateImages([]);
                      setCreateResultUrl('');
                    }}
                    sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
                  >
                    전체 초기화
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </>
      )}

      {/* ============================================================== */}
      {/* TAB 2: VIDEO TO GIF (동영상 → GIF 변환)                         */}
      {/* ============================================================== */}
      {currentTab === 'video' && (
        <>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleVideoUpload(file);
              if (e.target) e.target.value = '';
            }}
            style={{ display: 'none' }}
          />

          {!videoUrl ? (
            <Card
              {...videoDrop.getRootProps({
                onClick: () => videoInputRef.current?.click(),
              })}
              sx={{
                p: 6,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 3,
                flex: '1 1 auto',
                minHeight: 0,
                height: '100%',
                '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: 'primary.lighter',
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <VideoLibraryRoundedIcon sx={{ fontSize: 38 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                동영상 파일 업로드 (MP4, WebM, MOV 등)
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                원하는 구간을 자유롭게 잘라 고화질 움짤 GIF로 변환합니다
              </Typography>
              <Button variant="contained" color="primary" startIcon={<CloudUploadRoundedIcon />}>
                동영상 파일 선택
              </Button>
            </Card>
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
              {/* Left: Video Player / Preview */}
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
                <Card
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    flex: '1 1 auto',
                    minHeight: 0,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                    {videoFile?.name || '동영상 미리보기'} ({videoDuration.toFixed(1)}초)
                  </Typography>

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
                    {videoResultUrl ? (
                      <img
                        src={videoResultUrl}
                        alt="Video to GIF"
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <video
                        ref={videoPlayerRef}
                        src={videoUrl}
                        controls
                        onLoadedMetadata={handleLoadedVideoMetadata}
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                      />
                    )}
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

              {/* Right: Video Controls */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: { xs: '100%', lg: `${rightPanelWidth}px` },
                  minWidth: { lg: `${rightPanelWidth}px` },
                  maxWidth: { lg: `${rightPanelWidth}px` },
                  flexShrink: 0,
                  gap: 2,
                  minHeight: 0,
                  overflowY: 'auto',
                  pl: { lg: 1 },
                }}
              >
                <Card
                  sx={{ p: 2.5, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 2 }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        구간 선택 (시작 ~ 종료)
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {videoRange[0].toFixed(1)}s ~ {videoRange[1].toFixed(1)}s (총{' '}
                        {(videoRange[1] - videoRange[0]).toFixed(1)}초)
                      </Typography>
                    </Box>
                    <Slider
                      value={videoRange}
                      min={0}
                      max={videoDuration || 10}
                      step={0.1}
                      onChange={(_, v) => setVideoRange(v as [number, number])}
                      valueLabelDisplay="auto"
                    />
                  </Box>

                  <FormControl size="small" fullWidth>
                    <InputLabel>FPS (초당 프레임)</InputLabel>
                    <Select
                      value={videoFps}
                      label="FPS (초당 프레임)"
                      onChange={(e) => setVideoFps(Number(e.target.value))}
                    >
                      <MenuItem value={5}>5 FPS (경량)</MenuItem>
                      <MenuItem value={10}>10 FPS (표준)</MenuItem>
                      <MenuItem value={15}>15 FPS (부드러움)</MenuItem>
                      <MenuItem value={20}>20 FPS (고품질)</MenuItem>
                      <MenuItem value={24}>24 FPS (시네마틱)</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" fullWidth>
                    <InputLabel>해상도 (너비)</InputLabel>
                    <Select
                      value={videoWidth}
                      label="해상도 (너비)"
                      onChange={(e) => setVideoWidth(Number(e.target.value))}
                    >
                      <MenuItem value={320}>320 px (작은 크기)</MenuItem>
                      <MenuItem value={480}>480 px (표준)</MenuItem>
                      <MenuItem value={640}>640 px (고화질)</MenuItem>
                      <MenuItem value={800}>800 px (초고화질)</MenuItem>
                    </Select>
                  </FormControl>

                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}
                    >
                      품질 레벨 ({videoQuality}/10)
                    </Typography>
                    <Slider
                      size="small"
                      min={1}
                      max={10}
                      value={videoQuality}
                      onChange={(_, v) => setVideoQuality(v as number)}
                    />
                  </Box>

                  <TextField
                    size="small"
                    fullWidth
                    label="자막 오버레이 (선택사항)"
                    placeholder="하단에 표시할 문구"
                    value={videoCaption}
                    onChange={(e) => setVideoCaption(e.target.value)}
                  />
                </Card>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleConvertVideoToGif}
                    disabled={isVideoConverting}
                    startIcon={
                      isVideoConverting ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <AutoAwesomeRoundedIcon />
                      )
                    }
                    sx={{ py: 1.4, borderRadius: 2, fontWeight: 700 }}
                  >
                    {isVideoConverting ? `변환 중 (${videoProgress}%)` : '동영상 → GIF 변환하기'}
                  </Button>
                  {videoResultUrl && (
                    <Button
                      fullWidth
                      variant="contained"
                      color="secondary"
                      onClick={() =>
                        downloadDataUrl(videoResultUrl, `video_to_gif_${Date.now()}.gif`)
                      }
                      startIcon={<DownloadRoundedIcon />}
                      sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
                    >
                      GIF 다운로드 ({formatBytes(getDataUrlByteSize(videoResultUrl))})
                    </Button>
                  )}
                  <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    onClick={() => videoInputRef.current?.click()}
                    startIcon={<CloudUploadRoundedIcon />}
                    sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
                  >
                    새 동영상 불러오기
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </>
      )}

      {/* ============================================================== */}
      {/* TAB 3: SPLIT GIF (프레임 분할 추출)                              */}
      {/* ============================================================== */}
      {currentTab === 'split' && (
        <>
          <input
            ref={splitInputRef}
            type="file"
            accept="image/gif"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) processSplitFile(file);
              if (e.target) e.target.value = '';
            }}
            style={{ display: 'none' }}
          />

          {!splitFile ? (
            <Card
              {...splitDrop.getRootProps({
                onClick: () => splitInputRef.current?.click(),
              })}
              sx={{
                p: 6,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 3,
                flex: '1 1 auto',
                minHeight: 0,
                height: '100%',
                '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: 'primary.lighter',
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <CallSplitRoundedIcon sx={{ fontSize: 36 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                분할할 GIF 파일 업로드
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                GIF 애니메이션을 개별 프레임 PNG 이미지로 분해하고 ZIP으로 다운로드합니다
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
                {isExtracting ? '프레임 분석 중...' : 'GIF 파일 선택'}
              </Button>
            </Card>
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
              {/* Left: Frames Grid */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: '1 1 0px',
                  minWidth: 0,
                  minHeight: 0,
                  height: '100%',
                  pr: { lg: 1 },
                }}
              >
                <Card
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    flex: '1 1 auto',
                    minHeight: 0,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1.5,
                      flexShrink: 0,
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {splitFile.name} (총 {splitFrames.length}개 프레임)
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        선택된 프레임: {selectedFrameIds.size}개
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={isPlayingSplit ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
                        onClick={() => setIsPlayingSplit(!isPlayingSplit)}
                      >
                        {isPlayingSplit ? '정지' : '재생'}
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setSelectedFrameIds(new Set(splitFrames.map((f) => f.id)))}
                      >
                        전체 선택
                      </Button>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                      gap: 1.5,
                      flex: '1 1 auto',
                      minHeight: 0,
                      overflowY: 'auto',
                    }}
                  >
                    {splitFrames.map((frame, idx) => {
                      const isSelected = selectedFrameIds.has(frame.id);
                      return (
                        <Card
                          key={frame.id}
                          onClick={() => toggleSelectFrame(frame.id)}
                          sx={{
                            p: 1,
                            borderRadius: 2,
                            cursor: 'pointer',
                            border: '2px solid',
                            borderColor: isSelected ? 'primary.main' : 'transparent',
                            bgcolor: isSelected ? 'action.selected' : 'action.hover',
                            flexShrink: 0,
                          }}
                        >
                          <Box
                            sx={{
                              width: '100%',
                              aspectRatio: '1',
                              borderRadius: 1,
                              overflow: 'hidden',
                              bgcolor: '#0f172a',
                              mb: 0.5,
                            }}
                          >
                            <img
                              src={frame.dataUrl}
                              alt={`frame ${idx + 1}`}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          </Box>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <Typography variant="caption" sx={{ fontWeight: 800 }}>
                              #{idx + 1}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadDataUrl(frame.dataUrl, `frame_${idx + 1}.png`);
                              }}
                            >
                              <DownloadRoundedIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                          </Box>
                        </Card>
                      );
                    })}
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

              {/* Right: Actions */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: { xs: '100%', lg: `${rightPanelWidth}px` },
                  minWidth: { lg: `${rightPanelWidth}px` },
                  maxWidth: { lg: `${rightPanelWidth}px` },
                  flexShrink: 0,
                  gap: 2,
                  minHeight: 0,
                  overflowY: 'auto',
                  pl: { lg: 1 },
                }}
              >
                <Card
                  sx={{ p: 2.5, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 2 }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    프레임 추출 요약
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    선택된 {selectedFrameIds.size}개의 개별 고해상도 PNG 프레임을 하나의 압축(ZIP)
                    파일로 일괄 저장합니다.
                  </Typography>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleExportFramesZip}
                    disabled={selectedFrameIds.size === 0}
                    startIcon={<DownloadRoundedIcon />}
                    sx={{ py: 1.4, borderRadius: 2, fontWeight: 700 }}
                  >
                    선택 프레임 ZIP 다운로드 ({selectedFrameIds.size}개)
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    onClick={() => splitInputRef.current?.click()}
                    startIcon={<CloudUploadRoundedIcon />}
                    sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
                  >
                    새 GIF 파일 불러오기
                  </Button>
                </Card>
              </Box>
            </Box>
          )}
        </>
      )}

      {/* ============================================================== */}
      {/* TAB 4: BACKGROUND & CHROMA KEY (배경색/투명화)                   */}
      {/* ============================================================== */}
      {currentTab === 'bg' && (
        <>
          <input
            ref={bgInputRef}
            type="file"
            accept="image/gif"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) processBgFile(file);
              if (e.target) e.target.value = '';
            }}
            style={{ display: 'none' }}
          />

          {!bgFile ? (
            <Card
              {...bgDrop.getRootProps({
                onClick: () => bgInputRef.current?.click(),
              })}
              sx={{
                p: 6,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 3,
                flex: '1 1 auto',
                minHeight: 0,
                height: '100%',
                '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: 'primary.lighter',
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <ColorLensRoundedIcon sx={{ fontSize: 38 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                배경 수정할 GIF 파일 업로드
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                GIF의 배경색을 새로운 단색으로 교체하거나 특정 색상을 투명하게 처리합니다
              </Typography>
              <Button variant="contained" color="primary" startIcon={<CloudUploadRoundedIcon />}>
                GIF 파일 선택
              </Button>
            </Card>
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
              {/* Left: Preview */}
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
                <Card
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    flex: '1 1 auto',
                    minHeight: 0,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                    {bgResultUrl ? '배경 변경 결과' : '원본 GIF'}
                  </Typography>

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
                    <img
                      src={bgResultUrl || bgFilePreview}
                      alt="GIF Background"
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
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

              {/* Right: BG Controls */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: { xs: '100%', lg: `${rightPanelWidth}px` },
                  minWidth: { lg: `${rightPanelWidth}px` },
                  maxWidth: { lg: `${rightPanelWidth}px` },
                  flexShrink: 0,
                  gap: 2,
                  minHeight: 0,
                  overflowY: 'auto',
                  pl: { lg: 1 },
                }}
              >
                <Card
                  sx={{ p: 2.5, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 2 }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                    배경 처리 모드
                  </Typography>
                  <ToggleButtonGroup
                    value={bgMode}
                    exclusive
                    onChange={(_, v) => v && setBgMode(v)}
                    fullWidth
                    size="small"
                  >
                    <ToggleButton value="solid">새 단색 배경</ToggleButton>
                    <ToggleButton value="transparent">투명화 (크로마키)</ToggleButton>
                  </ToggleButtonGroup>

                  {bgMode === 'solid' ? (
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 600, mb: 1, display: 'block' }}
                      >
                        적용할 새 배경색
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <input
                          type="color"
                          value={targetBgColor}
                          onChange={(e) => setTargetBgColor(e.target.value)}
                          style={{
                            width: 50,
                            height: 40,
                            borderRadius: 6,
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        />
                        <TextField
                          size="small"
                          fullWidth
                          value={targetBgColor}
                          onChange={(e) => setTargetBgColor(e.target.value)}
                        />
                      </Box>
                    </Box>
                  ) : (
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 600, mb: 1, display: 'block' }}
                      >
                        투명하게 제거할 색상
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <input
                          type="color"
                          value={chromaKeyColor}
                          onChange={(e) => setChromaKeyColor(e.target.value)}
                          style={{
                            width: 50,
                            height: 40,
                            borderRadius: 6,
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        />
                        <TextField
                          size="small"
                          fullWidth
                          value={chromaKeyColor}
                          onChange={(e) => setChromaKeyColor(e.target.value)}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          색상 허용 오차 (Tolerance)
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 700, color: 'primary.main' }}
                        >
                          {bgTolerance}
                        </Typography>
                      </Box>
                      <Slider
                        size="small"
                        min={0}
                        max={100}
                        value={bgTolerance}
                        onChange={(_, v) => setBgTolerance(v as number)}
                      />
                    </Box>
                  )}
                </Card>

                {/* Actions */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleApplyBgColor}
                    disabled={isModifyingBg}
                    startIcon={
                      isModifyingBg ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <ColorLensRoundedIcon />
                      )
                    }
                    sx={{ py: 1.4, borderRadius: 2, fontWeight: 700 }}
                  >
                    {isModifyingBg ? `처리 중 (${bgProgress}%)` : '배경색 변경 적용하기'}
                  </Button>
                  {bgResultUrl && (
                    <Button
                      fullWidth
                      variant="contained"
                      color="secondary"
                      onClick={() => downloadDataUrl(bgResultUrl, `bg_modified_${Date.now()}.gif`)}
                      startIcon={<DownloadRoundedIcon />}
                      sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
                    >
                      GIF 다운로드 ({formatBytes(getDataUrlByteSize(bgResultUrl))})
                    </Button>
                  )}
                  <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    onClick={() => bgInputRef.current?.click()}
                    startIcon={<CloudUploadRoundedIcon />}
                    sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
                  >
                    새 GIF 파일 불러오기
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </>
      )}

      {/* ============================================================== */}
      {/* TAB 5: SPEED & REVERSE (속도 조절 & 역재생 & 최적화)             */}
      {/* ============================================================== */}
      {currentTab === 'speed' && (
        <>
          <input
            ref={speedInputRef}
            type="file"
            accept="image/gif"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) processSpeedFile(file);
              if (e.target) e.target.value = '';
            }}
            style={{ display: 'none' }}
          />

          {!speedFile ? (
            <Card
              {...speedDrop.getRootProps({
                onClick: () => speedInputRef.current?.click(),
              })}
              sx={{
                p: 6,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 3,
                flex: '1 1 auto',
                minHeight: 0,
                height: '100%',
                '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: 'primary.lighter',
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                <SpeedRoundedIcon sx={{ fontSize: 38 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                속도/역재생을 편집할 GIF 파일 업로드
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                재생 배속 변경(0.25x~20x), 거꾸로 역재생, 부메랑 루프를 실시간으로 즉시 확인하고
                인코딩합니다
              </Typography>
              <Button variant="contained" color="primary" startIcon={<CloudUploadRoundedIcon />}>
                GIF 파일 선택
              </Button>
            </Card>
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
              {/* Left: Preview */}
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
                <Card
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    flex: '1 1 auto',
                    minHeight: 0,
                  }}
                >
                  {/* Header with Mode Toggle / Badges */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 1,
                      mb: 1.5,
                    }}
                  >
                    {speedResultUrl ? (
                      <ToggleButtonGroup
                        value={activeSpeedPreviewTab}
                        exclusive
                        onChange={(_, v) => v && setActiveSpeedPreviewTab(v)}
                        size="small"
                      >
                        <ToggleButton
                          value="live"
                          sx={{ px: 1.5, py: 0.5, fontWeight: 600, fontSize: '0.8rem' }}
                        >
                          ⚡ 실시간 조절 미리보기
                        </ToggleButton>
                        <ToggleButton
                          value="encoded"
                          sx={{ px: 1.5, py: 0.5, fontWeight: 600, fontSize: '0.8rem' }}
                        >
                          💾 인코딩 결과 GIF
                        </ToggleButton>
                      </ToggleButtonGroup>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SpeedRoundedIcon color="primary" fontSize="small" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          실시간 속도 & 역재생 미리보기
                        </Typography>
                      </Box>
                    )}

                    <Box
                      sx={{ display: 'flex', gap: 0.75, alignItems: 'center', flexWrap: 'wrap' }}
                    >
                      {activeSpeedPreviewTab === 'live' ? (
                        <>
                          <Chip
                            size="small"
                            color="primary"
                            label={`${speedMultiplier}x 속도`}
                            sx={{ fontWeight: 700 }}
                          />
                          <Chip
                            size="small"
                            variant="outlined"
                            label={
                              speedLoopMode === 'reverse'
                                ? '역방향 (거꾸로)'
                                : speedLoopMode === 'boomerang'
                                  ? '부메랑 루프'
                                  : '정방향'
                            }
                            sx={{ fontWeight: 600 }}
                          />
                          {skipFrames && (
                            <Chip
                              size="small"
                              color="warning"
                              variant="outlined"
                              label="50% 프레임 감량"
                              sx={{ fontWeight: 600 }}
                            />
                          )}
                        </>
                      ) : (
                        <Chip
                          size="small"
                          color="success"
                          icon={<CheckCircleRoundedIcon />}
                          label={`인코딩 완료 (${formatBytes(getDataUrlByteSize(speedResultUrl))})`}
                          sx={{ fontWeight: 700 }}
                        />
                      )}
                    </Box>
                  </Box>

                  {/* Main Preview Box */}
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
                    {isSpeedExtracting ? (
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
                    ) : activeSpeedPreviewTab === 'encoded' && speedResultUrl ? (
                      <img
                        src={speedResultUrl}
                        alt="GIF Speed Encoded Result"
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <>
                        <img
                          src={
                            activeSpeedFrames[speedPlayerIndex]?.dataUrl || speedFilePreview || ''
                          }
                          alt="GIF Speed Live Preview"
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                        />

                        {/* Top-Left Mode & Speed Badge */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 12,
                            left: 12,
                            bgcolor: 'rgba(15, 23, 42, 0.8)',
                            backdropFilter: 'blur(6px)',
                            color: '#fff',
                            px: 1.25,
                            py: 0.5,
                            borderRadius: 1.5,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.75,
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                          }}
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: isPlayingSpeed ? '#22c55e' : '#eab308',
                            }}
                          />
                          {speedMultiplier}x |{' '}
                          {speedLoopMode === 'reverse'
                            ? '역재생'
                            : speedLoopMode === 'boomerang'
                              ? '부메랑'
                              : '정방향'}
                        </Box>

                        {/* Top-Right Frame Badge */}
                        {activeSpeedFrames.length > 0 && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 12,
                              right: 12,
                              bgcolor: 'rgba(15, 23, 42, 0.8)',
                              backdropFilter: 'blur(6px)',
                              color: '#fff',
                              px: 1.25,
                              py: 0.5,
                              borderRadius: 1.5,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                            }}
                          >
                            프레임 {speedPlayerIndex + 1} / {activeSpeedFrames.length}
                          </Box>
                        )}
                      </>
                    )}
                  </Box>

                  {/* Playback Control Bar (Live Preview Mode) */}
                  {activeSpeedPreviewTab === 'live' && activeSpeedFrames.length > 0 && (
                    <Box
                      sx={{
                        mt: 1.5,
                        p: 1.25,
                        bgcolor: 'background.neutral',
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.75,
                      }}
                    >
                      {/* Scrubber Slider */}
                      <Box sx={{ px: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Slider
                          size="small"
                          value={speedPlayerIndex}
                          min={0}
                          max={Math.max(0, activeSpeedFrames.length - 1)}
                          onChange={(_, val) => {
                            setSpeedPlayerIndex(Number(val));
                            setIsPlayingSpeed(false);
                          }}
                          sx={{ flex: '1 1 auto' }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            minWidth: 50,
                            textAlign: 'right',
                            color: 'text.secondary',
                          }}
                        >
                          {speedPlayerIndex + 1} / {activeSpeedFrames.length}
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
                          <Tooltip title={isPlayingSpeed ? '일시정지' : '실시간 재생'}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => setIsPlayingSpeed(!isPlayingSpeed)}
                              sx={{
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                                '&:hover': { bgcolor: 'primary.dark' },
                              }}
                            >
                              {isPlayingSpeed ? (
                                <PauseRoundedIcon fontSize="small" />
                              ) : (
                                <PlayArrowRoundedIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="처음부터 재생">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSpeedPlayerIndex(0);
                                boomerangForwardRef.current = true;
                              }}
                            >
                              <ReplayRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="이전 프레임">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setIsPlayingSpeed(false);
                                setSpeedPlayerIndex((prev) =>
                                  prev <= 0 ? activeSpeedFrames.length - 1 : prev - 1
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
                                setIsPlayingSpeed(false);
                                setSpeedPlayerIndex(
                                  (prev) => (prev + 1) % activeSpeedFrames.length
                                );
                              }}
                            >
                              <SkipNextRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary', fontWeight: 500 }}
                          >
                            해상도: {speedDimensions.width} × {speedDimensions.height}px
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
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

              {/* Right: Speed Controls */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: { xs: '100%', lg: `${rightPanelWidth}px` },
                  minWidth: { lg: `${rightPanelWidth}px` },
                  maxWidth: { lg: `${rightPanelWidth}px` },
                  flexShrink: 0,
                  gap: 2,
                  minHeight: 0,
                  overflowY: 'auto',
                  pl: { lg: 1 },
                }}
              >
                {/* Speed Multiplier Card */}
                <Card
                  sx={{ p: 2.5, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 2 }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SpeedRoundedIcon color="primary" fontSize="small" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        재생 배속 설정
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        type="number"
                        size="small"
                        value={speedMultiplier}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val)) {
                            handleSpeedMultiplierChange(
                              Math.max(0.1, Math.min(20, Math.round(val * 100) / 100))
                            );
                          }
                        }}
                        inputProps={{
                          min: 0.1,
                          max: 20,
                          step: 0.25,
                          style: {
                            padding: '4px 8px',
                            width: 58,
                            textAlign: 'center',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                          },
                        }}
                      />
                      <Chip
                        size="small"
                        color="primary"
                        label={`${speedMultiplier}x`}
                        sx={{ fontWeight: 700, fontSize: '0.85rem' }}
                      />
                    </Box>
                  </Box>

                  {/* Speed Slider */}
                  <Box sx={{ px: 1 }}>
                    <Slider
                      value={speedMultiplier}
                      min={0.25}
                      max={20.0}
                      step={0.25}
                      onChange={(_, v) => handleSpeedMultiplierChange(Number(v))}
                      marks={[
                        { value: 0.25, label: '0.25x' },
                        { value: 1.0, label: '1x' },
                        { value: 5.0, label: '5x' },
                        { value: 10.0, label: '10x' },
                        { value: 15.0, label: '15x' },
                        { value: 20.0, label: '20x' },
                      ]}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(v) => `${v}x`}
                    />
                  </Box>

                  {/* Preset Quick Chips */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {[0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0, 5.0, 8.0, 10.0, 15.0, 20.0].map(
                      (preset) => (
                        <Chip
                          key={preset}
                          label={`${preset}x`}
                          size="small"
                          clickable
                          onClick={() => handleSpeedMultiplierChange(preset)}
                          color={speedMultiplier === preset ? 'primary' : 'default'}
                          variant={speedMultiplier === preset ? 'filled' : 'outlined'}
                          sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                        />
                      )
                    )}
                  </Box>
                </Card>

                {/* Loop Mode Card */}
                <Card
                  sx={{ p: 2.5, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 2 }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    재생 방향 (루프 모드)
                  </Typography>
                  <ToggleButtonGroup
                    value={speedLoopMode}
                    exclusive
                    onChange={(_, v) => v && handleSpeedLoopModeChange(v)}
                    fullWidth
                    size="small"
                  >
                    <ToggleButton value="normal" sx={{ fontWeight: 600, py: 1 }}>
                      정방향
                    </ToggleButton>
                    <ToggleButton value="reverse" sx={{ fontWeight: 600, py: 1 }}>
                      역방향 (거꾸로)
                    </ToggleButton>
                    <ToggleButton value="boomerang" sx={{ fontWeight: 600, py: 1 }}>
                      부메랑 (왕복)
                    </ToggleButton>
                  </ToggleButtonGroup>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {speedLoopMode === 'normal' &&
                      '처음부터 끝까지 정상 방향으로 무한 반복 재생합니다.'}
                    {speedLoopMode === 'reverse' && '마지막 프레임부터 거꾸로 역재생합니다.'}
                    {speedLoopMode === 'boomerang' &&
                      '정방향으로 재생 후 다시 거꾸로 재생되어 자연스러운 왕복 루프를 만듭니다.'}
                  </Typography>
                </Card>

                {/* Resize & Skip Frames Card */}
                <Card
                  sx={{ p: 2.5, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 2 }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    해상도 및 용량 최적화
                  </Typography>

                  <FormControl size="small" fullWidth>
                    <InputLabel>해상도 리사이즈</InputLabel>
                    <Select
                      value={resizeScale}
                      label="해상도 리사이즈"
                      onChange={(e) => setResizeScale(Number(e.target.value))}
                    >
                      <MenuItem value={1.0}>100% (원본 해상도 유지)</MenuItem>
                      <MenuItem value={0.75}>75% 축소 (용량 절감)</MenuItem>
                      <MenuItem value={0.5}>50% 축소 (초경량)</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={skipFrames}
                        onChange={(e) => handleSpeedSkipFramesChange(e.target.checked)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          프레임 50% 감량
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          홀수 프레임을 건너뛰어 GIF 용량을 대폭 압축합니다
                        </Typography>
                      </Box>
                    }
                  />
                </Card>

                {/* Actions */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleApplySpeedAndReverse}
                    disabled={isSpeedProcessing}
                    startIcon={
                      isSpeedProcessing ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <SpeedRoundedIcon />
                      )
                    }
                    sx={{ py: 1.4, borderRadius: 2, fontWeight: 700 }}
                  >
                    {isSpeedProcessing
                      ? `새 GIF 인코딩 중 (${speedProgress}%)`
                      : '속도/역재생 적용하기 (새 GIF 인코딩)'}
                  </Button>

                  {speedResultUrl && (
                    <>
                      <Button
                        fullWidth
                        variant="contained"
                        color="secondary"
                        onClick={() =>
                          downloadDataUrl(
                            speedResultUrl,
                            `speed_${speedMultiplier}x_${speedLoopMode}_${Date.now()}.gif`
                          )
                        }
                        startIcon={<DownloadRoundedIcon />}
                        sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
                      >
                        GIF 다운로드 ({formatBytes(getDataUrlByteSize(speedResultUrl))})
                      </Button>

                      <Button
                        fullWidth
                        variant="contained"
                        color="info"
                        onClick={handleDownloadSpeedMp4}
                        disabled={isSpeedMp4Converting}
                        startIcon={
                          isSpeedMp4Converting ? (
                            <CircularProgress size={18} color="inherit" />
                          ) : (
                            <MovieCreationRoundedIcon />
                          )
                        }
                        sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
                      >
                        {isSpeedMp4Converting
                          ? `MP4 동영상 변환 중 (${speedMp4Progress}%)`
                          : speedMp4Size > 0
                            ? `MP4 다운로드 (${formatBytes(speedMp4Size)})`
                            : 'MP4 동영상 다운로드'}
                      </Button>
                    </>
                  )}

                  <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    onClick={() => speedInputRef.current?.click()}
                    startIcon={<CloudUploadRoundedIcon />}
                    sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
                  >
                    새 GIF 파일 불러오기
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </>
      )}

      {/* ============================================================== */}
      {/* TAB 6: MERGE GIFS (GIF 합치기 · 이어붙이기)                     */}
      {/* ============================================================== */}
      {currentTab === 'merge' && (
        <>
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
            <Card
              {...mergeDrop.getRootProps({
                onClick: () => mergeInputRef.current?.click(),
              })}
              sx={{
                p: 6,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 3,
                flex: '1 1 auto',
                minHeight: 0,
                height: '100%',
                '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
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

                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}
                    >
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
                                    : flattenedMergeFrames[mergePlayerIndex].loopMode ===
                                        'boomerang'
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
                                setMergePlayerIndex(
                                  (prev) => (prev + 1) % flattenedMergeFrames.length
                                );
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
                    if (
                      e.dataTransfer.types &&
                      Array.from(e.dataTransfer.types).includes('Files')
                    ) {
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
                      const sampleThumbCount = Math.max(
                        3,
                        Math.min(10, Math.floor(blockWidth / 48))
                      );
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
                            borderColor: isSelected
                              ? '#38bdf8'
                              : isDragOver
                                ? '#a855f7'
                                : '#334155',
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
                            onPointerDown={(e) =>
                              handleTrimPointerDown(e, clip, 'start', pxPerFrame)
                            }
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
                            <Box
                              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}
                            >
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
                              ✂️ {clip.trimStart + 1}F ~ {clip.trimEnd + 1}F ({clipFramesCount}
                              프레임)
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

                    {/* Active Clip Selector Banner (shown on clip-specific tabs) */}
                    {(mergeSettingsTab === 'trim' || mergeSettingsTab === 'speed') &&
                      activeClip && (
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
                          <Box
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}
                          >
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

                    {/* -------------------------------------------------------- */}
                    {/* TAB 1: TRIM & SLICE (구간 자르기 및 클립 편집)              */}
                    {/* -------------------------------------------------------- */}
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
                            이 클립 복제 (같은 GIF 추가)
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

                    {/* -------------------------------------------------------- */}
                    {/* TAB 2: SPEED & LOOP (재생 배속 및 루프 모드)                */}
                    {/* -------------------------------------------------------- */}
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
                            {[0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0, 5.0, 10.0, 20.0].map(
                              (preset) => (
                                <Chip
                                  key={preset}
                                  label={`${preset}x`}
                                  size="small"
                                  clickable
                                  onClick={() => updateActiveClip({ speedMultiplier: preset })}
                                  color={
                                    activeClip.speedMultiplier === preset ? 'primary' : 'default'
                                  }
                                  variant={
                                    activeClip.speedMultiplier === preset ? 'filled' : 'outlined'
                                  }
                                  sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                                />
                              )
                            )}
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

                    {/* -------------------------------------------------------- */}
                    {/* TAB 3: GLOBAL OUTPUT (전체 출력 해상도 및 맞춤)              */}
                    {/* -------------------------------------------------------- */}
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
                      color="inherit"
                      onClick={() => mergeInputRef.current?.click()}
                      startIcon={<AddRoundedIcon />}
                      sx={{ py: 0.8, borderRadius: 2, fontWeight: 600, fontSize: '0.78rem' }}
                    >
                      + 추가 GIF 불러오기
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
                        minWidth: 120,
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
        </>
      )}
    </DashboardContent>
  );
}
