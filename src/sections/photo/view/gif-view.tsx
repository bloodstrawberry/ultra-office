'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import GifRoundedIcon from '@mui/icons-material/GifRounded';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import CallSplitRoundedIcon from '@mui/icons-material/CallSplitRounded';
import ColorLensRoundedIcon from '@mui/icons-material/ColorLensRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

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

  // Tab 3: BgColor
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [targetBgColor, setTargetBgColor] = useState<string>('#ffffff');
  const [bgTolerance, setBgTolerance] = useState<number>(30);
  const [bgResultUrl, setBgResultUrl] = useState<string>('');
  const [isModifyingBg, setIsModifyingBg] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const splitInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

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
    if (!isPlayingSplit || splitFrames.length === 0) return undefined;
    const currentFrame = splitFrames[splitPlayerIndex];
    const delay = currentFrame?.delay || 100;
    const timer = setTimeout(() => {
      setSplitPlayerIndex((prev) => (prev + 1) % splitFrames.length);
    }, delay);
    return () => clearTimeout(timer);
  }, [isPlayingSplit, splitFrames, splitPlayerIndex]);

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

  const handleExportFramesZip = async () => {
    const framesToExport = splitFrames.filter((f) => selectedFrameIds.has(f.id));
    if (framesToExport.length === 0) return;

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

  return (
    <DashboardContent>
      <Box sx={{ mb: 3 }}>
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
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
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
            <Card
              {...createDrop.getRootProps({
                onClick: () => fileInputRef.current?.click(),
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
                minHeight: 320,
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
                <GifRoundedIcon sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                GIF로 만들 여러 장의 사진 업로드
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                2장 이상의 사진을 순서대로 업로드하여 애니메이션으로 합성합니다
              </Typography>
              <Button variant="contained" color="primary" startIcon={<CloudUploadRoundedIcon />}>
                사진 선택하기
              </Button>
            </Card>
          ) : (
            <Box
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '6fr 6fr' }, gap: 3 }}
            >
              {/* Left: Preview */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Card sx={{ p: 2, borderRadius: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1.5,
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
                      height: { xs: 280, sm: 380 },
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
                            style={{ maxWidth: '100%', maxHeight: 380, objectFit: 'contain' }}
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
                <Card sx={{ p: 2, borderRadius: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    프레임 순서 ({createImages.length}개)
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', py: 1 }}>
                    {createImages.map((img, idx) => (
                      <Box
                        key={img.id}
                        onClick={() => {
                          setIsPlayingPreview(false);
                          setPreviewFrameIndex(idx);
                        }}
                        sx={{
                          position: 'relative',
                          width: 64,
                          height: 64,
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
                          <DeleteRoundedIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Card>
              </Box>

              {/* Right: GIF Controls */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
                    <ToggleButton value="normal">정방향 루프</ToggleButton>
                    <ToggleButton value="reverse">역방향 루프</ToggleButton>
                    <ToggleButton value="boomerang">부메랑 (왕복)</ToggleButton>
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
                    <ToggleButton value="contain">여백 포함 (Contain)</ToggleButton>
                    <ToggleButton value="cover">꽉 채움 (Cover)</ToggleButton>
                    <ToggleButton value="stretch">비율 왜곡 (Stretch)</ToggleButton>
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
                  <Box sx={{ mb: 2 }}>
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
                        자막 폰트 크기: {fontSize}px
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

                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    onClick={() => fileInputRef.current?.click()}
                    startIcon={<CloudUploadRoundedIcon />}
                    sx={{ py: 1, borderRadius: 2 }}
                  >
                    + 사진 추가하기
                  </Button>
                </Card>

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleGenerateGif}
                    disabled={isCreating || createImages.length < 2}
                    startIcon={
                      isCreating ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <GifRoundedIcon />
                      )
                    }
                    sx={{ flex: 1.5, py: 1.5, borderRadius: 2, fontWeight: 800 }}
                  >
                    {isCreating ? `생성 중 (${createProgress}%)` : 'GIF 생성하기'}
                  </Button>
                  {createResultUrl && (
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => downloadDataUrl(createResultUrl, `animated_${Date.now()}.gif`)}
                      startIcon={<DownloadRoundedIcon />}
                      sx={{ flex: 1, py: 1.5, borderRadius: 2 }}
                    >
                      저장
                    </Button>
                  )}
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
                borderColor: splitDrop.isDragActive ? 'primary.main' : 'divider',
                bgcolor: splitDrop.isDragActive ? 'action.hover' : 'transparent',
                borderRadius: 3,
                minHeight: 320,
                transition: (theme) =>
                  theme.transitions.create(['border-color', 'background-color']),
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
                <CallSplitRoundedIcon sx={{ fontSize: 32 }} />
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
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Card
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {splitFile.name} (총 {splitFrames.length} 프레임)
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
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<ArchiveRoundedIcon />}
                    onClick={handleExportFramesZip}
                    disabled={selectedFrameIds.size === 0}
                  >
                    선택 프레임 ZIP 다운로드
                  </Button>
                </Box>
              </Card>

              {/* Grid of frames */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: 1.5,
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
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {frame.delay}ms
                        </Typography>
                      </Box>
                    </Card>
                  );
                })}
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
                borderColor: bgDrop.isDragActive ? 'primary.main' : 'divider',
                bgcolor: bgDrop.isDragActive ? 'action.hover' : 'transparent',
                borderRadius: 3,
                minHeight: 320,
                transition: (theme) =>
                  theme.transitions.create(['border-color', 'background-color']),
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
                <ColorLensRoundedIcon sx={{ fontSize: 32 }} />
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
          ) : (
            <Box
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' }, gap: 3 }}
            >
              <Card
                sx={{
                  p: 2,
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 340,
                  bgcolor: '#0f172a',
                }}
              >
                {bgResultUrl ? (
                  <img
                    src={bgResultUrl}
                    alt="Modified GIF"
                    style={{ maxWidth: '100%', maxHeight: 340, objectFit: 'contain' }}
                  />
                ) : (
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    수정 버튼을 누르면 새 GIF가 렌더링됩니다
                  </Typography>
                )}
              </Card>

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

                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleApplyBgColor}
                  disabled={isModifyingBg}
                  startIcon={
                    isModifyingBg ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <ColorLensRoundedIcon />
                    )
                  }
                  sx={{ py: 1.2, borderRadius: 2 }}
                >
                  배경색 변경 적용하기
                </Button>

                {bgResultUrl && (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => downloadDataUrl(bgResultUrl, `bg_modified_${Date.now()}.gif`)}
                    startIcon={<DownloadRoundedIcon />}
                    sx={{ py: 1.2, borderRadius: 2 }}
                  >
                    새 GIF 저장하기
                  </Button>
                )}
              </Card>
            </Box>
          )}
        </>
      )}
    </DashboardContent>
  );
}
