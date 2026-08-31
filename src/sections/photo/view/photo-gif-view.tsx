'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Menu from '@mui/material/Menu';
import Tabs from '@mui/material/Tabs';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import GifRoundedIcon from '@mui/icons-material/GifRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import CircularProgress from '@mui/material/CircularProgress';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CallSplitRoundedIcon from '@mui/icons-material/CallSplitRounded';
import ColorLensRoundedIcon from '@mui/icons-material/ColorLensRounded';
import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import ContentPasteRoundedIcon from '@mui/icons-material/ContentPasteRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

import { GifSampleSection } from 'src/sections/gif-studio/components/gif-sample-section';
import { GifBatchEffectModal } from 'src/sections/gif-studio/components/gif-batch-effect-modal';
import { type GifSampleItem, fetchSampleGifFile } from 'src/sections/gif-studio/data/gif-samples';

import { downloadDataUrl } from '../utils/image-processor';
import {
  extractGifFrames,
  exportFramesToZip,
  type GifFrameItem,
  createGifFromImages,
  modifyGifBackgroundColor,
} from '../utils/gif-processor';

interface UploadedImageItem {
  id: string;
  name: string;
  src: string;
  delay?: number;
}

export function GifView() {
  const [currentTab, setCurrentTab] = useState<'create' | 'split' | 'bg'>('create');

  // Tab 1: Create
  const [createImages, setCreateImages] = useState<UploadedImageItem[]>([]);
  const [fps, setFps] = useState<number>(10);
  const [fitMode, setFitMode] = useState<'contain' | 'cover' | 'stretch'>('contain');
  const bgColor = 'transparent';
  const [targetWidth, setTargetWidth] = useState<number>(400);
  const [targetHeight, setTargetHeight] = useState<number>(400);
  const [loopMode, setLoopMode] = useState<'normal' | 'reverse' | 'boomerang'>('normal');

  const [overlayText, setOverlayText] = useState<string>('');
  const [fontSize, setFontSize] = useState<number>(24);
  const [fontColor, setFontColor] = useState<string>('#ffffff');

  const [createResultUrl, setCreateResultUrl] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [createProgress, setCreateProgress] = useState<number>(0);

  const [previewFrameIndex, setPreviewFrameIndex] = useState<number>(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(true);

  // Tab 2: Split
  const [splitFile, setSplitFile] = useState<File | null>(null);
  const [splitFrames, setSplitFrames] = useState<GifFrameItem[]>([]);
  const [selectedFrameIds, setSelectedFrameIds] = useState<Set<string>>(new Set());
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [splitPlayerIndex, setSplitPlayerIndex] = useState<number>(0);
  const [isPlayingSplit, setIsPlayingSplit] = useState<boolean>(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false);
  const [splitIntervalStep, setSplitIntervalStep] = useState<number>(2);
  const [splitMenuAnchorEl, setSplitMenuAnchorEl] = useState<null | HTMLElement>(null);

  // Active selection for playback and export
  const selectedSplitFrames = splitFrames.filter((f) => selectedFrameIds.has(f.id));

  // Tab 3: BgColor
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [targetBgColor, setTargetBgColor] = useState<string>('#ffffff');
  const [bgTolerance, setBgTolerance] = useState<number>(30);
  const [bgResultUrl, setBgResultUrl] = useState<string>('');
  const [isModifyingBg, setIsModifyingBg] = useState<boolean>(false);
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(380);

  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(380);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const splitInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

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
    const newWidth = Math.max(280, Math.min(650, resizeStartWidthRef.current + deltaX));
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

  // Preview player for Tab 1
  useEffect(() => {
    if (!isPlayingPreview || createImages.length <= 1) return undefined;
    const interval = 1000 / fps;
    const timer = setInterval(() => {
      setPreviewFrameIndex((prev) => (prev + 1) % createImages.length);
    }, interval);
    return () => clearInterval(timer);
  }, [isPlayingPreview, createImages.length, fps]);

  // Preview player for Tab 2
  useEffect(() => {
    if (!isPlayingSplit || selectedSplitFrames.length === 0) return undefined;
    const safeIndex = splitPlayerIndex % selectedSplitFrames.length;
    const currentFrame = selectedSplitFrames[safeIndex];
    const delay = Math.max(20, currentFrame?.delay || 100);
    const timer = setTimeout(() => {
      setSplitPlayerIndex((prev) => (prev + 1) % selectedSplitFrames.length);
    }, delay);
    return () => clearTimeout(timer);
  }, [isPlayingSplit, selectedSplitFrames, splitPlayerIndex]);

  // Stop playback if no frames are selected/active
  useEffect(() => {
    if (selectedSplitFrames.length === 0 && isPlayingSplit) {
      setIsPlayingSplit(false);
    }
  }, [selectedSplitFrames.length, isPlayingSplit]);

  // Tab 1: Handle Images upload
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
            id: `${Date.now()}_${Math.random()}`,
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

  const handleCreateFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addCreateFiles(files);
    if (e.target) e.target.value = '';
  };

  const handlePasteFromClipboard = useCallback(async () => {
    try {
      if (!navigator.clipboard?.read) {
        toast.error(
          '현재 브라우저에서 클립보드 읽기 API를 지원하지 않습니다. Ctrl+V 단축키를 이용해 주세요.'
        );
        return;
      }

      const clipboardItems = await navigator.clipboard.read();
      const imageFiles: File[] = [];

      for (let i = 0; i < clipboardItems.length; i += 1) {
        const item = clipboardItems[i];
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            const ext = type.split('/')[1] || 'png';
            const fileName = `스크린샷_${Date.now()}_${i + 1}.${ext}`;
            imageFiles.push(new File([blob], fileName, { type }));
          }
        }
      }

      if (imageFiles.length > 0) {
        addCreateFiles(imageFiles);
        toast.success(
          `📋 클립보드에서 ${imageFiles.length}개 이미지(Print Screen 캡처 등)를 추가했습니다!`
        );
      } else {
        toast.info(
          '클립보드에 이미지 데이터가 없습니다. Print Screen(스크린샷) 또는 이미지를 복사한 후 시도해주세요.'
        );
      }
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
        toast.error(
          '클립보드 접근 권한이 허용되지 않았습니다. 화면을 클릭 후 Ctrl+V 단축키로 붙여넣어 보세요.'
        );
      } else {
        toast.error('클립보드에서 이미지를 불러오지 못했습니다. Ctrl+V 단축키를 이용해주세요.');
      }
    }
  }, [addCreateFiles]);

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
        bgColor,
        fps,
        sampleInterval: 10,
        loopMode,
        textOverlay: overlayText.trim()
          ? {
              text: overlayText,
              fontSize,
              fontColor,
            }
          : undefined,
        onProgress: (p: number) => setCreateProgress(Math.round(p * 100)),
      });

      setCreateResultUrl(gifUrl);
      toast.success('GIF 생성이 완료되었습니다!');
    } catch {
      toast.error('GIF 생성에 실패했습니다.');
    } finally {
      setIsCreating(false);
    }
  };

  // Tab 2: Split GIF
  const processSplitFile = useCallback(async (file: File) => {
    setSplitFile(file);
    setIsExtracting(true);
    toast.info('GIF 프레임을 분석하고 추출하는 중입니다...');

    try {
      const res = await extractGifFrames(file);
      setSplitFrames(res.frames);
      setSelectedFrameIds(new Set(res.frames.map((f) => f.id)));
      setSplitPlayerIndex(0);
      toast.success(`총 ${res.frames.length}개 프레임이 추출되었습니다.`);
    } catch {
      toast.error('GIF 프레임 분할에 실패했습니다.');
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const handleSplitFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processSplitFile(file);
    if (e.target) e.target.value = '';
  };

  const toggleSelectFrame = (id: string) => {
    setSelectedFrameIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectIntervalSplitFrames = (step: number, offset: number = 0) => {
    if (splitFrames.length === 0 || step < 1) return;
    const newIds = new Set<string>();
    for (let i = offset; i < splitFrames.length; i += step) {
      newIds.add(splitFrames[i].id);
    }
    setSelectedFrameIds(newIds);
    setSplitIntervalStep(step);
    setSplitMenuAnchorEl(null);
    toast.success(`${step}칸 간격으로 ${newIds.size}개 프레임이 선택되었습니다.`);
  };

  const handleSelectAllSplitFrames = () => {
    setSelectedFrameIds(new Set(splitFrames.map((f) => f.id)));
  };

  const handleDeselectAllSplitFrames = () => {
    setSelectedFrameIds(new Set());
    setIsPlayingSplit(false);
  };

  const handleTogglePlaySplit = () => {
    if (!isPlayingSplit) {
      if (selectedSplitFrames.length === 0) {
        toast.warning('재생할 선택 프레임이 없습니다. 프레임을 선택해주세요.');
        return;
      }
      setIsPlayingSplit(true);
    } else {
      setIsPlayingSplit(false);
    }
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

  // Tab 3: Background color
  const processBgFile = useCallback((file: File) => {
    setBgFile(file);
  }, []);

  const handleBgFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processBgFile(file);
    if (e.target) e.target.value = '';
  };

  const handleApplyBgColor = async () => {
    if (!bgFile) return;
    setIsModifyingBg(true);
    toast.info('GIF 배경 색상을 변경 중입니다...');

    try {
      const resultUrl = await modifyGifBackgroundColor(
        bgFile,
        targetBgColor,
        undefined,
        bgTolerance
      );
      setBgResultUrl(resultUrl);
      toast.success('배경 색상 변경이 완료되었습니다!');
    } catch {
      toast.error('배경 수정 중 오류가 발생했습니다.');
    } finally {
      setIsModifyingBg(false);
    }
  };

  // Drop & Paste Hooks
  const createDrop = useImageDropPaste({
    onFiles: addCreateFiles,
    multiple: true,
    disabled: currentTab !== 'create',
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

  // Sample GIF handlers
  const [loadingSampleId, setLoadingSampleId] = useState<string | null>(null);

  const handleSelectCreateSample = async (sample: GifSampleItem) => {
    setLoadingSampleId(sample.id);
    toast.info(`'${sample.label}' 예시 파일의 프레임을 추출하고 있습니다...`);
    try {
      const file = await fetchSampleGifFile(sample);
      const res = await extractGifFrames(file);
      const newItems: UploadedImageItem[] = res.frames.map((frame, idx) => ({
        id: `sample_${sample.id}_${Date.now()}_${idx}`,
        name: `${sample.filename.replace(/\.[^/.]+$/, '')}_frame_${idx + 1}.png`,
        src: frame.dataUrl,
        delay: frame.delay,
      }));
      setCreateImages(newItems);
      setCreateResultUrl('');
      toast.success(`'${sample.label}'에서 ${newItems.length}개 프레임을 불러왔습니다!`);
    } catch {
      toast.error('예시 GIF 프레임 추출에 실패했습니다.');
    } finally {
      setLoadingSampleId(null);
    }
  };

  const handleSelectSplitSample = async (sample: GifSampleItem) => {
    setLoadingSampleId(sample.id);
    try {
      const file = await fetchSampleGifFile(sample);
      await processSplitFile(file);
    } catch {
      toast.error('예시 GIF 파일을 불러오지 못했습니다.');
    } finally {
      setLoadingSampleId(null);
    }
  };

  const handleSelectBgSample = async (sample: GifSampleItem) => {
    setLoadingSampleId(sample.id);
    try {
      const file = await fetchSampleGifFile(sample);
      processBgFile(file);
      toast.success(`'${sample.label}' 예시 파일을 불러왔습니다.`);
    } catch {
      toast.error('예시 GIF 파일을 불러오지 못했습니다.');
    } finally {
      setLoadingSampleId(null);
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
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          GIF 스튜디오 (GIF Maker & Studio)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          사진을 모아 움짤 GIF 생성, GIF 프레임별 분할 저장, GIF 배경색 변환을 제공합니다.
        </Typography>
      </Box>

      {/* Tabs */}
      <Tabs
        value={currentTab}
        onChange={(_, v) => setCurrentTab(v)}
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}
      >
        <Tab
          label="GIF 만들기 (움짤 제작)"
          value="create"
          icon={<GifRoundedIcon />}
          iconPosition="start"
        />
        <Tab
          label="GIF 프레임 분할 추출"
          value="split"
          icon={<CallSplitRoundedIcon />}
          iconPosition="start"
        />
        <Tab
          label="GIF 배경색 변경"
          value="bg"
          icon={<ColorLensRoundedIcon />}
          iconPosition="start"
        />
      </Tabs>

      {/* TAB 1: CREATE GIF */}
      {currentTab === 'create' && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleCreateFilesUpload}
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
                  <GifRoundedIcon sx={{ fontSize: 40 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  GIF로 만들 여러 장의 사진 업로드
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  2장 이상의 사진을 순서대로 업로드하여 애니메이션으로 합성합니다
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<CloudUploadRoundedIcon />}
                  >
                    사진 선택하기
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<ContentPasteRoundedIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePasteFromClipboard();
                    }}
                    sx={{ bgcolor: 'background.paper' }}
                  >
                    클립보드 붙여넣기 (Ctrl+V)
                  </Button>
                </Box>
                <Typography variant="caption" sx={{ color: 'text.disabled', mt: 1.5 }}>
                  💡 Print Screen(스크린샷 캡처) 후 어디서든 <strong>Ctrl+V</strong>를 누르면 바로
                  추가됩니다.
                </Typography>
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
              {/* Left: Preview & Strip */}
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
                                bottom: 16,
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

                {/* Frames List */}
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

              {/* Draggable Divider (Desktop) */}
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
                  position: 'relative',
                  '&:hover .divider-bar, &:active .divider-bar': {
                    bgcolor: 'primary.main',
                    width: '3px',
                  },
                  '&:hover .divider-handle, &:active .divider-handle': {
                    bgcolor: 'primary.main',
                    borderColor: 'primary.main',
                    '& > div > div': {
                      bgcolor: '#ffffff',
                    },
                  },
                }}
              >
                {/* Divider Line */}
                <Box
                  className="divider-bar"
                  sx={{
                    width: '2px',
                    height: '100%',
                    bgcolor: 'divider',
                    borderRadius: '1px',
                    transition: 'all 0.15s ease',
                  }}
                />
                {/* Grab Handle */}
                <Box
                  className="divider-handle"
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 14,
                    height: 36,
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                    pointerEvents: 'none',
                  }}
                >
                  <Box
                    sx={{
                      width: 4,
                      height: 14,
                      display: 'flex',
                      justifyContent: 'space-between',
                      '& > div': {
                        width: 1.5,
                        height: '100%',
                        bgcolor: 'text.disabled',
                        borderRadius: 1,
                        transition: 'all 0.15s ease',
                      },
                    }}
                  >
                    <div />
                    <div />
                  </Box>
                </Box>
              </Box>

              {/* Right: GIF Controls */}
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
                  overflow: 'auto',
                  pl: { lg: 1 },
                  pr: 0.5,
                }}
              >
                <Card sx={{ p: 2.5, borderRadius: 3 }}>
                  {/* FPS Slider */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        초당 프레임 수 (FPS / 재생 속도)
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

                  {/* Loop mode */}
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                    반복 모드
                  </Typography>
                  <ToggleButtonGroup
                    value={loopMode}
                    exclusive
                    onChange={(_, v) => v && setLoopMode(v)}
                    fullWidth
                    size="small"
                    sx={{ mb: 2 }}
                  >
                    <ToggleButton value="normal">정방향</ToggleButton>
                    <ToggleButton value="reverse">역방향</ToggleButton>
                    <ToggleButton value="boomerang">부메랑</ToggleButton>
                  </ToggleButtonGroup>

                  {/* Fit mode */}
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                    화면 맞춤 방식
                  </Typography>
                  <ToggleButtonGroup
                    value={fitMode}
                    exclusive
                    onChange={(_, v) => v && setFitMode(v)}
                    fullWidth
                    size="small"
                    sx={{ mb: 2 }}
                  >
                    <ToggleButton value="contain">여백 포함</ToggleButton>
                    <ToggleButton value="cover">꽉 채움</ToggleButton>
                    <ToggleButton value="stretch">비율 왜곡</ToggleButton>
                  </ToggleButtonGroup>

                  {/* Resolution */}
                  <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
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

                  {/* Text Overlay */}
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}
                    >
                      자막 텍스트 오버레이
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        자막 크기: {fontSize}px
                      </Typography>
                    </Box>
                    <Slider
                      size="small"
                      min={12}
                      max={64}
                      value={fontSize}
                      onChange={(_, v) => setFontSize(v as number)}
                    />
                  </Box>
                </Card>

                {/* Actions Column */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.25,
                    mt: 'auto',
                    pt: 0.5,
                  }}
                >
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
                    sx={{ py: 1.4, borderRadius: 2, fontWeight: 700, fontSize: '0.95rem' }}
                  >
                    {isCreating ? `생성 중 (${createProgress}%)` : 'GIF 생성하기'}
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
                      GIF 저장하기
                    </Button>
                  )}
                  <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    onClick={() => fileInputRef.current?.click()}
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

      {/* TAB 2: SPLIT GIF */}
      {currentTab === 'split' && (
        <>
          <input
            ref={splitInputRef}
            type="file"
            accept="image/gif"
            onChange={handleSplitFileUpload}
            style={{ display: 'none' }}
          />

          {!splitFile ? (
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
                onSelectSample={handleSelectSplitSample}
                loadingSampleId={loadingSampleId}
                isLoading={isExtracting || !!loadingSampleId}
                title="⚡ 즉석 테스트 예시 GIF 파일"
                subtitle="클릭 한 번으로 3종의 고화질 예시 움짤을 불러와 프레임 분할 및 추출을 테스트해 보세요."
                actionLabel="프레임 분할 ➜"
              />

              <Card
                {...splitDrop.getRootProps({
                  onClick: () => splitInputRef.current?.click(),
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
                  <CallSplitRoundedIcon sx={{ fontSize: 36 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  분할할 GIF 파일 업로드
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  GIF 애니메이션을 개별 프레임 PNG 이미지들로 분할합니다
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
                  GIF 파일 선택
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
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1.5,
                      gap: 1,
                      flexShrink: 0,
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {splitFile.name} (총 {splitFrames.length}개 프레임)
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', fontWeight: 600 }}
                      >
                        선택됨: {selectedSplitFrames.length} / {splitFrames.length}개
                      </Typography>
                    </Box>

                    {/* Toolbar Controls */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="secondary"
                        startIcon={<AutoAwesomeRoundedIcon />}
                        onClick={() => setIsBatchModalOpen(true)}
                        disabled={selectedSplitFrames.length === 0}
                        sx={{ fontWeight: 800 }}
                      >
                        🎨 효과 일괄 적용
                      </Button>
                      <Button
                        size="small"
                        variant={isPlayingSplit ? 'contained' : 'outlined'}
                        color={isPlayingSplit ? 'primary' : 'inherit'}
                        startIcon={isPlayingSplit ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
                        onClick={handleTogglePlaySplit}
                        disabled={selectedSplitFrames.length === 0}
                        sx={{ fontWeight: 700 }}
                      >
                        {isPlayingSplit ? '정지' : '재생'}
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={handleSelectAllSplitFrames}
                        sx={{ fontWeight: 600 }}
                      >
                        전체 선택
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="inherit"
                        onClick={handleDeselectAllSplitFrames}
                        sx={{ fontWeight: 600 }}
                      >
                        전체 해제
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="inherit"
                        startIcon={<FilterAltRoundedIcon />}
                        endIcon={<KeyboardArrowDownRoundedIcon />}
                        onClick={(e) => setSplitMenuAnchorEl(e.currentTarget)}
                        sx={{ fontWeight: 600 }}
                      >
                        간격 선택
                      </Button>
                      <Menu
                        anchorEl={splitMenuAnchorEl}
                        open={Boolean(splitMenuAnchorEl)}
                        onClose={() => setSplitMenuAnchorEl(null)}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                      >
                        <MenuItem onClick={() => handleSelectIntervalSplitFrames(2, 0)}>
                          2칸 간격 (1/2 분할 선택)
                        </MenuItem>
                        <MenuItem onClick={() => handleSelectIntervalSplitFrames(3, 0)}>
                          3칸 간격 (1/3 분할 선택)
                        </MenuItem>
                        <MenuItem onClick={() => handleSelectIntervalSplitFrames(4, 0)}>
                          4칸 간격 (1/4 분할 선택)
                        </MenuItem>
                        <MenuItem onClick={() => handleSelectIntervalSplitFrames(5, 0)}>
                          5칸 간격 (1/5 분할 선택)
                        </MenuItem>
                      </Menu>
                    </Box>
                  </Box>

                  {/* Grid of frames */}
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                      gap: 1.5,
                      flex: '1 1 auto',
                      minHeight: 0,
                      overflowY: 'auto',
                      p: 0.5,
                    }}
                  >
                    {splitFrames.map((frame, idx) => {
                      const isSelected = selectedFrameIds.has(frame.id);
                      const isCurrentPlaying =
                        isPlayingSplit &&
                        selectedSplitFrames.length > 0 &&
                        selectedSplitFrames[splitPlayerIndex % selectedSplitFrames.length]?.id ===
                          frame.id;

                      return (
                        <Card
                          key={frame.id}
                          onClick={() => toggleSelectFrame(frame.id)}
                          sx={{
                            p: 1,
                            borderRadius: 2,
                            cursor: 'pointer',
                            position: 'relative',
                            border: '2px solid',
                            borderColor: isCurrentPlaying
                              ? 'primary.main'
                              : isSelected
                                ? 'primary.light'
                                : 'divider',
                            bgcolor: isSelected ? 'action.selected' : 'background.paper',
                            boxShadow: isCurrentPlaying
                              ? '0 0 12px rgba(32, 101, 209, 0.6)'
                              : 'none',
                            transition: 'all 0.15s ease',
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
                              position: 'relative',
                            }}
                          >
                            <img
                              src={frame.dataUrl}
                              alt={`frame ${idx + 1}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                opacity: isSelected ? 1 : 0.45,
                                transition: 'opacity 0.2s ease',
                              }}
                            />
                          </Box>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 800,
                                color: isSelected ? 'text.primary' : 'text.disabled',
                              }}
                            >
                              #{idx + 1}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {frame.delay}ms
                            </Typography>
                          </Box>
                        </Card>
                      );
                    })}
                  </Box>
                </Card>
              </Box>

              {/* Draggable Divider (Desktop) */}
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
                  position: 'relative',
                  '&:hover .divider-bar, &:active .divider-bar': {
                    bgcolor: 'primary.main',
                    width: '3px',
                  },
                  '&:hover .divider-handle, &:active .divider-handle': {
                    bgcolor: 'primary.main',
                    borderColor: 'primary.main',
                    '& > div > div': {
                      bgcolor: '#ffffff',
                    },
                  },
                }}
              >
                {/* Divider Line */}
                <Box
                  className="divider-bar"
                  sx={{
                    width: '2px',
                    height: '100%',
                    bgcolor: 'divider',
                    borderRadius: '1px',
                    transition: 'all 0.15s ease',
                  }}
                />
                {/* Grab Handle */}
                <Box
                  className="divider-handle"
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 14,
                    height: 36,
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                    pointerEvents: 'none',
                  }}
                >
                  <Box
                    sx={{
                      width: 4,
                      height: 14,
                      display: 'flex',
                      justifyContent: 'space-between',
                      '& > div': {
                        width: 1.5,
                        height: '100%',
                        bgcolor: 'text.disabled',
                        borderRadius: 1,
                        transition: 'all 0.15s ease',
                      },
                    }}
                  >
                    <div />
                    <div />
                  </Box>
                </Box>
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
                  overflow: 'auto',
                  pl: { lg: 1 },
                  pr: 0.5,
                }}
              >
                {/* Live Preview Player */}
                <Card
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      실시간 미리보기 ({selectedSplitFrames.length}프레임)
                    </Typography>
                    <Button
                      size="small"
                      variant={isPlayingSplit ? 'contained' : 'outlined'}
                      color={isPlayingSplit ? 'primary' : 'inherit'}
                      startIcon={isPlayingSplit ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
                      onClick={handleTogglePlaySplit}
                      disabled={selectedSplitFrames.length === 0}
                      sx={{ py: 0.25, px: 1, fontSize: '0.75rem', fontWeight: 700 }}
                    >
                      {isPlayingSplit ? '정지' : '재생'}
                    </Button>
                  </Box>

                  <Box
                    sx={{
                      width: '100%',
                      aspectRatio: '1',
                      bgcolor: '#0f172a',
                      borderRadius: 2,
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    {selectedSplitFrames.length > 0 ? (
                      <img
                        src={
                          selectedSplitFrames[splitPlayerIndex % selectedSplitFrames.length]
                            ?.dataUrl
                        }
                        alt="split preview"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        선택 및 활성화된 프레임이 없습니다
                      </Typography>
                    )}
                  </Box>

                  {/* Frame Scrubber */}
                  {selectedSplitFrames.length > 1 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 0.5 }}>
                      <Slider
                        size="small"
                        value={splitPlayerIndex % selectedSplitFrames.length}
                        min={0}
                        max={selectedSplitFrames.length - 1}
                        step={1}
                        onChange={(_, val) => {
                          setIsPlayingSplit(false);
                          setSplitPlayerIndex(Number(val));
                        }}
                        sx={{ flex: '1 1 auto' }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          minWidth: 45,
                          textAlign: 'right',
                          color: 'text.secondary',
                        }}
                      >
                        {(splitPlayerIndex % selectedSplitFrames.length) + 1} /{' '}
                        {selectedSplitFrames.length}
                      </Typography>
                    </Box>
                  )}
                </Card>

                {/* Frame Interval Selection Card */}
                <Card
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TuneRoundedIcon fontSize="small" color="primary" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        간격 선택 (프레임 수 줄이기)
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      {splitFrames.length > 0
                        ? `${selectedFrameIds.size}/${splitFrames.length}개 (${Math.round(
                            (selectedFrameIds.size / splitFrames.length) * 100
                          )}%)`
                        : ''}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.4 }}>
                    일정한 간격으로 프레임을 띄워서 선택하여 GIF 용량을 줄이고 프레임 속도를
                    최적화합니다.
                  </Typography>

                  {/* Preset Buttons */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleSelectIntervalSplitFrames(2, 0)}
                      disabled={splitFrames.length === 0}
                      sx={{ py: 0.75, fontSize: '0.75rem', fontWeight: 600 }}
                    >
                      2칸 간격 (1/2)
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleSelectIntervalSplitFrames(3, 0)}
                      disabled={splitFrames.length === 0}
                      sx={{ py: 0.75, fontSize: '0.75rem', fontWeight: 600 }}
                    >
                      3칸 간격 (1/3)
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleSelectIntervalSplitFrames(4, 0)}
                      disabled={splitFrames.length === 0}
                      sx={{ py: 0.75, fontSize: '0.75rem', fontWeight: 600 }}
                    >
                      4칸 간격 (1/4)
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleSelectIntervalSplitFrames(5, 0)}
                      disabled={splitFrames.length === 0}
                      sx={{ py: 0.75, fontSize: '0.75rem', fontWeight: 600 }}
                    >
                      5칸 간격 (1/5)
                    </Button>
                  </Box>

                  {/* Custom Interval Slider */}
                  {splitFrames.length > 2 && (
                    <Box
                      sx={{
                        p: 1.25,
                        bgcolor: 'background.neutral',
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          간격 직접 조절
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 800, color: 'primary.main' }}
                        >
                          매 {splitIntervalStep}칸 띄워서 선택
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 0.5 }}>
                        <Slider
                          size="small"
                          value={splitIntervalStep}
                          min={1}
                          max={Math.min(20, Math.max(2, Math.floor(splitFrames.length / 2)))}
                          step={1}
                          onChange={(_, val) => {
                            const s = Number(val);
                            setSplitIntervalStep(s);
                            handleSelectIntervalSplitFrames(s, 0);
                          }}
                          sx={{ flex: '1 1 auto' }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            minWidth: 35,
                            textAlign: 'right',
                          }}
                        >
                          {splitIntervalStep}칸
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Card>

                <Card sx={{ p: 2.5, borderRadius: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                    프레임 추출 정보
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    파일명: {splitFile.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    총 프레임: {splitFrames.length}개
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    선택된 프레임: {selectedSplitFrames.length} / {splitFrames.length}개
                  </Typography>
                </Card>

                {/* Actions Column */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.25,
                    mt: 'auto',
                    pt: 0.5,
                  }}
                >
                  <Button
                    fullWidth
                    variant="contained"
                    color="secondary"
                    onClick={() => setIsBatchModalOpen(true)}
                    disabled={selectedSplitFrames.length === 0}
                    startIcon={<AutoAwesomeRoundedIcon />}
                    sx={{ py: 1.4, borderRadius: 2, fontWeight: 800, fontSize: '0.95rem' }}
                  >
                    🎨 스튜디오 효과 일괄 적용 ({selectedSplitFrames.length}개)
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    startIcon={<ArchiveRoundedIcon />}
                    onClick={handleExportFramesZip}
                    disabled={selectedSplitFrames.length === 0}
                    sx={{ py: 1.2, borderRadius: 2, fontWeight: 700, fontSize: '0.9rem' }}
                  >
                    선택 프레임 ZIP 다운로드 ({selectedSplitFrames.length}개)
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    onClick={() => splitInputRef.current?.click()}
                    startIcon={<CloudUploadRoundedIcon />}
                    sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
                  >
                    다른 GIF 파일 선택
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    onClick={() => {
                      setSplitFile(null);
                      setSplitFrames([]);
                      setSelectedFrameIds(new Set());
                      setIsPlayingSplit(false);
                    }}
                    sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
                  >
                    초기화
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </>
      )}

      {/* TAB 3: BG COLOR */}
      {currentTab === 'bg' && (
        <>
          <input
            ref={bgInputRef}
            type="file"
            accept="image/gif"
            onChange={handleBgFileUpload}
            style={{ display: 'none' }}
          />

          {!bgFile ? (
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
                onSelectSample={handleSelectBgSample}
                loadingSampleId={loadingSampleId}
                isLoading={isModifyingBg || !!loadingSampleId}
                title="⚡ 즉석 테스트 예시 GIF 파일"
                subtitle="클릭 한 번으로 3종의 고화질 예시 움짤을 불러와 배경색 변경 및 투명화를 테스트해 보세요."
                actionLabel="배경 편집 ➜"
              />

              <Card
                {...bgDrop.getRootProps({
                  onClick: () => bgInputRef.current?.click(),
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
                  <ColorLensRoundedIcon sx={{ fontSize: 38 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  배경색을 수정할 GIF 파일 업로드
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  투명 배경을 흰색/단색으로 채우거나 특정 배경색을 변경합니다
                </Typography>
                <Button variant="contained" color="primary" startIcon={<CloudUploadRoundedIcon />}>
                  GIF 파일 선택
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
              {/* Left: Preview */}
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
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: '1 1 auto',
                    minHeight: 0,
                    height: '100%',
                    bgcolor: '#0f172a',
                  }}
                >
                  {bgResultUrl ? (
                    <img
                      src={bgResultUrl}
                      alt="Modified GIF"
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                      수정 버튼을 누르면 새 GIF가 렌더링됩니다
                    </Typography>
                  )}
                </Card>
              </Box>

              {/* Draggable Divider (Desktop) */}
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
                  position: 'relative',
                  '&:hover .divider-bar, &:active .divider-bar': {
                    bgcolor: 'primary.main',
                    width: '3px',
                  },
                  '&:hover .divider-handle, &:active .divider-handle': {
                    bgcolor: 'primary.main',
                    borderColor: 'primary.main',
                    '& > div > div': {
                      bgcolor: '#ffffff',
                    },
                  },
                }}
              >
                {/* Divider Line */}
                <Box
                  className="divider-bar"
                  sx={{
                    width: '2px',
                    height: '100%',
                    bgcolor: 'divider',
                    borderRadius: '1px',
                    transition: 'all 0.15s ease',
                  }}
                />
                {/* Grab Handle */}
                <Box
                  className="divider-handle"
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 14,
                    height: 36,
                    borderRadius: 1,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                    pointerEvents: 'none',
                  }}
                >
                  <Box
                    sx={{
                      width: 4,
                      height: 14,
                      display: 'flex',
                      justifyContent: 'space-between',
                      '& > div': {
                        width: 1.5,
                        height: '100%',
                        bgcolor: 'text.disabled',
                        borderRadius: 1,
                        transition: 'all 0.15s ease',
                      },
                    }}
                  >
                    <div />
                    <div />
                  </Box>
                </Box>
              </Box>

              {/* Right: Controls & Actions */}
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
                  overflow: 'auto',
                  pl: { lg: 1 },
                  pr: 0.5,
                }}
              >
                <Card
                  sx={{ p: 2.5, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 2 }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    배경 색상 설정
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      변경할 새 배경색:
                    </Typography>
                    <input
                      type="color"
                      value={targetBgColor}
                      onChange={(e) => setTargetBgColor(e.target.value)}
                      style={{
                        width: 44,
                        height: 40,
                        borderRadius: 6,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {targetBgColor}
                    </Typography>
                  </Box>

                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        색상 허용 오차: {bgTolerance}
                      </Typography>
                    </Box>
                    <Slider
                      size="small"
                      min={5}
                      max={80}
                      value={bgTolerance}
                      onChange={(_, v) => setBgTolerance(v as number)}
                    />
                  </Box>
                </Card>

                {/* Actions Column */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.25,
                    mt: 'auto',
                    pt: 0.5,
                  }}
                >
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
                    sx={{ py: 1.4, borderRadius: 2, fontWeight: 700, fontSize: '0.95rem' }}
                  >
                    배경색 변경 적용하기
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
                      새 GIF 저장하기
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
                    다른 GIF 파일 선택
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    onClick={() => {
                      setBgFile(null);
                      setBgResultUrl('');
                    }}
                    sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
                  >
                    초기화
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </>
      )}

      {/* GIF Batch Studio Effect Modal */}
      <GifBatchEffectModal
        open={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        frames={selectedSplitFrames}
      />
    </DashboardContent>
  );
}
