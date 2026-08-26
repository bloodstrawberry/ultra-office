'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import ToggleButton from '@mui/material/ToggleButton';
import GifRoundedIcon from '@mui/icons-material/GifRounded';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CallSplitRoundedIcon from '@mui/icons-material/CallSplitRounded';
import ColorLensRoundedIcon from '@mui/icons-material/ColorLensRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import VideoLibraryRoundedIcon from '@mui/icons-material/VideoLibraryRounded';
import MovieCreationRoundedIcon from '@mui/icons-material/MovieCreationRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

import {
  formatBytes,
  downloadDataUrl,
  extractGifFrames,
  exportFramesToZip,
  type GifFrameItem,
  convertGifToVideo,
  getDataUrlByteSize,
  createGifFromImages,
  type GifToVideoResult,
  convertVideoSegmentToGif,
  modifyGifBackgroundColor,
  adjustGifSpeedAndReverse,
  type SupportedVideoFormat,
} from '../utils/gif-processor';

// ----------------------------------------------------------------------

interface UploadedImageItem {
  id: string;
  name: string;
  src: string;
  delay?: number;
}

export type GifStudioTabType = 'create' | 'video' | 'to-video' | 'split' | 'bg' | 'speed';

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
  // TAB: GIF TO VIDEO (GIF → 동영상 변환)
  // ==========================================
  const [toVideoFile, setToVideoFile] = useState<File | null>(null);
  const [toVideoFilePreview, setToVideoFilePreview] = useState<string>('');
  const [toVideoFormat, setToVideoFormat] = useState<SupportedVideoFormat>('mp4');
  const [toVideoLoopCount, setToVideoLoopCount] = useState<number>(1);
  const [toVideoFps, setToVideoFps] = useState<number>(30);
  const [toVideoScale, setToVideoScale] = useState<number>(1.0);
  const [toVideoBgColor, setToVideoBgColor] = useState<string>('#ffffff');
  const [toVideoSpeedMultiplier, setToVideoSpeedMultiplier] = useState<number>(1.0);
  const [toVideoResult, setToVideoResult] = useState<GifToVideoResult | null>(null);
  const [isToVideoConverting, setIsToVideoConverting] = useState<boolean>(false);
  const [toVideoProgress, setToVideoProgress] = useState<number>(0);
  const toVideoInputRef = useRef<HTMLInputElement>(null);
  const toVideoPlayerRef = useRef<HTMLVideoElement>(null);

  const processToVideoFile = useCallback((file: File) => {
    setToVideoFile(file);
    setToVideoResult(null);
    setToVideoSpeedMultiplier(1.0);
    const url = URL.createObjectURL(file);
    setToVideoFilePreview(url);
  }, []);

  const handleConvertGifToVideo = async (overrideSpeed?: number) => {
    if (!toVideoFile) {
      toast.error('변환할 GIF 파일을 먼저 업로드해주세요.');
      return;
    }
    const speed = overrideSpeed ?? toVideoSpeedMultiplier;
    setIsToVideoConverting(true);
    setToVideoProgress(0);
    toast.info(
      `GIF를 ${speed}x 배속 ${toVideoFormat.toUpperCase()} 동영상으로 변환하고 있습니다...`
    );

    try {
      const res = await convertGifToVideo(toVideoFile, {
        targetFormat: toVideoFormat,
        loopCount: toVideoLoopCount,
        fps: toVideoFps,
        scale: toVideoScale,
        bgColor: toVideoBgColor,
        speedMultiplier: speed,
        progressCallback: (p) => setToVideoProgress(p),
      });

      setToVideoResult(res);
      toast.success(`GIF → ${res.format.toUpperCase()} 동영상 (${speed}x 배속) 변환 완료!`);
    } catch {
      toast.error('동영상 변환 중 오류가 발생했습니다.');
    } finally {
      setIsToVideoConverting(false);
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
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [speedLoopMode, setSpeedLoopMode] = useState<'normal' | 'reverse' | 'boomerang'>('normal');
  const [skipFrames, setSkipFrames] = useState<boolean>(false);
  const [resizeScale, setResizeScale] = useState<number>(1.0);
  const [speedResultUrl, setSpeedResultUrl] = useState<string>('');
  const [isSpeedProcessing, setIsSpeedProcessing] = useState<boolean>(false);
  const [speedProgress, setSpeedProgress] = useState<number>(0);
  const speedInputRef = useRef<HTMLInputElement>(null);

  const processSpeedFile = useCallback((file: File) => {
    setSpeedFile(file);
    setSpeedResultUrl('');
    const url = URL.createObjectURL(file);
    setSpeedFilePreview(url);
  }, []);

  const handleApplySpeedAndReverse = async () => {
    if (!speedFile) {
      toast.error('처리할 GIF 파일을 먼저 업로드해주세요.');
      return;
    }
    setIsSpeedProcessing(true);
    setSpeedProgress(0);
    toast.info('GIF 속도 및 재생 옵션을 재인코딩 중입니다...');

    try {
      const res = await adjustGifSpeedAndReverse(speedFile, {
        speedMultiplier,
        loopMode: speedLoopMode,
        skipFrames,
        resizeScale,
        progressCallback: (p) => setSpeedProgress(p),
      });
      setSpeedResultUrl(res);
      toast.success('GIF 속도/역재생 편집이 완료되었습니다!');
    } catch {
      toast.error('GIF 속도 조절 중 오류가 발생했습니다.');
    } finally {
      setIsSpeedProcessing(false);
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

  const toVideoDrop = useImageDropPaste({
    onFiles: (files) => {
      if (files[0]) processToVideoFile(files[0]);
    },
    accept: ['image/gif'],
    multiple: false,
    disabled: currentTab !== 'to-video',
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
            <GifRoundedIcon sx={{ fontSize: 30 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              GIF 편집 스튜디오 (GIF Studio)
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              움짤 제작, 동영상 ↔ GIF 상호 변환, 프레임 분할/추출, 배경색/크로마키 변경,
              속도/역재생 올인원 도구 모음
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs
        value={currentTab}
        onChange={(_, v: GifStudioTabType) => setCurrentTab(v)}
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}
      >
        <Tab
          label="움짤 (GIF) 만들기"
          value="create"
          icon={<GifRoundedIcon />}
          iconPosition="start"
        />
        <Tab
          label="동영상 → GIF 변환"
          value="video"
          icon={<VideoLibraryRoundedIcon />}
          iconPosition="start"
        />
        <Tab
          label="GIF → 동영상 (MP4/AVI) 변환"
          value="to-video"
          icon={<MovieCreationRoundedIcon />}
          iconPosition="start"
        />
        <Tab
          label="GIF 프레임 분할 · 추출"
          value="split"
          icon={<CallSplitRoundedIcon />}
          iconPosition="start"
        />
        <Tab
          label="GIF 배경색 변경 · 투명화"
          value="bg"
          icon={<ColorLensRoundedIcon />}
          iconPosition="start"
        />
        <Tab
          label="GIF 속도 조절 & 역재생"
          value="speed"
          icon={<SpeedRoundedIcon />}
          iconPosition="start"
        />
      </Tabs>

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
      {/* TAB: GIF TO VIDEO (GIF → 동영상 변환)                         */}
      {/* ============================================================== */}
      {currentTab === 'to-video' && (
        <>
          <input
            ref={toVideoInputRef}
            type="file"
            accept="image/gif"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) processToVideoFile(file);
              if (e.target) e.target.value = '';
            }}
            style={{ display: 'none' }}
          />

          {!toVideoFile ? (
            <Card
              {...toVideoDrop.getRootProps({
                onClick: () => toVideoInputRef.current?.click(),
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
                <MovieCreationRoundedIcon sx={{ fontSize: 38 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                동영상(MP4/WebM)으로 변환할 GIF 파일 업로드
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                GIF 애니메이션을 인스타그램/유튜브 쇼츠/카카오톡에 적합한 고화질 MP4/WebM 비디오로
                변환합니다
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
              {/* Left: Video or GIF Preview */}
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
                    {toVideoResult
                      ? `변환된 동영상 (${toVideoResult.format.toUpperCase()} · ${toVideoResult.duration.toFixed(1)}초 · ${toVideoResult.width}x${toVideoResult.height})`
                      : `원본 GIF (${toVideoFile.name})`}
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
                    {toVideoResult ? (
                      <video
                        ref={toVideoPlayerRef}
                        key={toVideoResult.videoUrl}
                        src={toVideoResult.videoUrl}
                        controls
                        autoPlay
                        loop
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                      />
                    ) : (
                      <img
                        src={toVideoFilePreview}
                        alt="GIF to Convert"
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    )}
                  </Box>
                </Card>

                {toVideoResult && (
                  <Card sx={{ p: 2, borderRadius: 3, flexShrink: 0 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SpeedRoundedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          동영상 재생 속도 조절 & 실시간 배속 적용
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                        현재: {toVideoSpeedMultiplier}x 배속 (
                        {toVideoResult.duration
                          ? (toVideoResult.duration / toVideoSpeedMultiplier).toFixed(1)
                          : 0}
                        초)
                      </Typography>
                    </Box>

                    {/* Speed presets */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
                      {[0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0, 4.0].map((sp) => (
                        <Button
                          key={sp}
                          size="small"
                          variant={toVideoSpeedMultiplier === sp ? 'contained' : 'outlined'}
                          onClick={() => {
                            setToVideoSpeedMultiplier(sp);
                            if (toVideoPlayerRef.current) {
                              toVideoPlayerRef.current.playbackRate = sp;
                            }
                          }}
                          sx={{
                            minWidth: 50,
                            py: 0.3,
                            px: 1,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          {sp}x
                        </Button>
                      ))}
                    </Box>

                    <Slider
                      size="small"
                      min={0.25}
                      max={4.0}
                      step={0.05}
                      value={toVideoSpeedMultiplier}
                      onChange={(_, v) => {
                        const val = v as number;
                        setToVideoSpeedMultiplier(val);
                        if (toVideoPlayerRef.current) {
                          toVideoPlayerRef.current.playbackRate = val;
                        }
                      }}
                      sx={{ mb: 1.5 }}
                    />

                    {/* Re-encode with new speed button */}
                    <Button
                      fullWidth
                      variant="contained"
                      color="secondary"
                      onClick={() => handleConvertGifToVideo(toVideoSpeedMultiplier)}
                      disabled={isToVideoConverting}
                      startIcon={
                        isToVideoConverting ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <AutoAwesomeRoundedIcon />
                        )
                      }
                      sx={{ py: 1, borderRadius: 2, fontWeight: 700 }}
                    >
                      {isToVideoConverting
                        ? `인코딩 중 (${toVideoProgress}%)`
                        : `⚡ ${toVideoSpeedMultiplier}x 배속으로 동영상 파일 다시 인코딩 (적용)`}
                    </Button>
                  </Card>
                )}
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
                  <FormControl size="small" fullWidth>
                    <InputLabel>출력 동영상 포맷</InputLabel>
                    <Select
                      value={toVideoFormat}
                      label="출력 동영상 포맷"
                      onChange={(e) => setToVideoFormat(e.target.value as SupportedVideoFormat)}
                    >
                      <MenuItem value="mp4">MP4 (H.264 · 모든 기기/SNS 호환 표준 권장)</MenuItem>
                      <MenuItem value="avi">
                        AVI (RIFF / Motion-JPEG · Windows 고화질 무손실)
                      </MenuItem>
                      <MenuItem value="webm">WebM (VP9/VP8 · 고효율 압축 비디오)</MenuItem>
                      <MenuItem value="mov">MOV (Apple QuickTime 비디오 포맷)</MenuItem>
                      <MenuItem value="mkv">MKV (Matroska 고성능 멀티미디어 컨테이너)</MenuItem>
                    </Select>
                  </FormControl>

                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}
                    >
                      반복 재생 횟수 (루프)
                    </Typography>
                    <ToggleButtonGroup
                      value={toVideoLoopCount}
                      exclusive
                      onChange={(_, v) => v && setToVideoLoopCount(v)}
                      fullWidth
                      size="small"
                    >
                      <ToggleButton value={1}>1회</ToggleButton>
                      <ToggleButton value={2}>2회</ToggleButton>
                      <ToggleButton value={3}>3회</ToggleButton>
                      <ToggleButton value={5}>5회</ToggleButton>
                      <ToggleButton value={10}>10회 (쇼츠용)</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        동영상 재생 속도 (배속)
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {toVideoSpeedMultiplier}x 배속
                      </Typography>
                    </Box>
                    <Slider
                      size="small"
                      min={0.25}
                      max={4.0}
                      step={0.05}
                      value={toVideoSpeedMultiplier}
                      onChange={(_, v) => {
                        const val = v as number;
                        setToVideoSpeedMultiplier(val);
                        if (toVideoPlayerRef.current) {
                          toVideoPlayerRef.current.playbackRate = val;
                        }
                      }}
                    />
                  </Box>

                  <FormControl size="small" fullWidth>
                    <InputLabel>프레임 레이트 (FPS)</InputLabel>
                    <Select
                      value={toVideoFps}
                      label="프레임 레이트 (FPS)"
                      onChange={(e) => setToVideoFps(Number(e.target.value))}
                    >
                      <MenuItem value={24}>24 FPS (시네마틱)</MenuItem>
                      <MenuItem value={30}>30 FPS (표준 권장)</MenuItem>
                      <MenuItem value={60}>60 FPS (초고부드러움)</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" fullWidth>
                    <InputLabel>해상도 업스케일</InputLabel>
                    <Select
                      value={toVideoScale}
                      label="해상도 업스케일"
                      onChange={(e) => setToVideoScale(Number(e.target.value))}
                    >
                      <MenuItem value={1.0}>100% (원본 해상도)</MenuItem>
                      <MenuItem value={1.5}>150% (고해상도 확장)</MenuItem>
                      <MenuItem value={2.0}>200% (2배 초고화질 2K/4K)</MenuItem>
                    </Select>
                  </FormControl>

                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}
                    >
                      배경 채우기 색상 (투명 GIF 보정)
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <input
                        type="color"
                        value={toVideoBgColor}
                        onChange={(e) => setToVideoBgColor(e.target.value)}
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
                        variant={toVideoBgColor === '#ffffff' ? 'contained' : 'outlined'}
                        onClick={() => setToVideoBgColor('#ffffff')}
                      >
                        흰색
                      </Button>
                      <Button
                        size="small"
                        variant={toVideoBgColor === '#000000' ? 'contained' : 'outlined'}
                        onClick={() => setToVideoBgColor('#000000')}
                      >
                        검은색
                      </Button>
                    </Box>
                  </Box>
                </Card>

                {/* Actions */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={() => handleConvertGifToVideo()}
                    disabled={isToVideoConverting}
                    startIcon={
                      isToVideoConverting ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <MovieCreationRoundedIcon />
                      )
                    }
                    sx={{ py: 1.4, borderRadius: 2, fontWeight: 700 }}
                  >
                    {isToVideoConverting
                      ? `인코딩 중 (${toVideoProgress}%)`
                      : `GIF → ${toVideoFormat.toUpperCase()} 동영상 변환`}
                  </Button>
                  {toVideoResult && (
                    <Button
                      fullWidth
                      variant="contained"
                      color="secondary"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = toVideoResult.videoUrl;
                        link.download = toVideoResult.filename;
                        link.click();
                        toast.success(
                          `${toVideoResult.format.toUpperCase()} 동영상이 다운로드되었습니다.`
                        );
                      }}
                      startIcon={<DownloadRoundedIcon />}
                      sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
                    >
                      동영상 다운로드 ({toVideoResult.format.toUpperCase()} ·{' '}
                      {formatBytes(toVideoResult.size)})
                    </Button>
                  )}
                  <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    onClick={() => toVideoInputRef.current?.click()}
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
      {/* TAB 4: SPLIT GIF (프레임 분할 추출)                              */}
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
                재생 배속 변경(0.25x~4x), 거꾸로 역재생, 부메랑 루프 및 용량 최적화를 적용합니다
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
                    {speedResultUrl ? '속도/역재생 적용 결과' : '원본 GIF'}
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
                      src={speedResultUrl || speedFilePreview}
                      alt="GIF Speed Preview"
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
                <Card
                  sx={{ p: 2.5, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 2 }}
                >
                  <FormControl size="small" fullWidth>
                    <InputLabel>재생 배속 설정</InputLabel>
                    <Select
                      value={speedMultiplier}
                      label="재생 배속 설정"
                      onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
                    >
                      <MenuItem value={0.25}>0.25x (초슬로우 모션)</MenuItem>
                      <MenuItem value={0.5}>0.5x (느리게)</MenuItem>
                      <MenuItem value={0.75}>0.75x (약간 느리게)</MenuItem>
                      <MenuItem value={1.0}>1.0x (원본 속도)</MenuItem>
                      <MenuItem value={1.25}>1.25x (약간 빠르게)</MenuItem>
                      <MenuItem value={1.5}>1.5x (빠르게)</MenuItem>
                      <MenuItem value={2.0}>2.0x (2배속)</MenuItem>
                      <MenuItem value={3.0}>3.0x (3배속)</MenuItem>
                      <MenuItem value={4.0}>4.0x (4배속 초고속)</MenuItem>
                    </Select>
                  </FormControl>

                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}
                    >
                      재생 방향 (루프 모드)
                    </Typography>
                    <ToggleButtonGroup
                      value={speedLoopMode}
                      exclusive
                      onChange={(_, v) => v && setSpeedLoopMode(v)}
                      fullWidth
                      size="small"
                    >
                      <ToggleButton value="normal">정방향</ToggleButton>
                      <ToggleButton value="reverse">역방향 (거꾸로)</ToggleButton>
                      <ToggleButton value="boomerang">부메랑</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>

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
                        onChange={(e) => setSkipFrames(e.target.checked)}
                      />
                    }
                    label="프레임 50% 감량 (용량 대폭 압축)"
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
                    {isSpeedProcessing ? `인코딩 중 (${speedProgress}%)` : '속도/역재생 적용하기'}
                  </Button>
                  {speedResultUrl && (
                    <Button
                      fullWidth
                      variant="contained"
                      color="secondary"
                      onClick={() =>
                        downloadDataUrl(speedResultUrl, `speed_modified_${Date.now()}.gif`)
                      }
                      startIcon={<DownloadRoundedIcon />}
                      sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
                    >
                      GIF 다운로드 ({formatBytes(getDataUrlByteSize(speedResultUrl))})
                    </Button>
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
    </DashboardContent>
  );
}
