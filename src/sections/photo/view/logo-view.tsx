'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded';
import CropSquareRoundedIcon from '@mui/icons-material/CropSquareRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import AspectRatioRoundedIcon from '@mui/icons-material/AspectRatioRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

import { type CropRect, InteractiveCropBox } from '../components/interactive-crop-box';
import { downloadDataUrl, shareToKakaoTalk, cropAndResizeLogo } from '../utils/image-processor';

// ----------------------------------------------------------------------

const MIN_SIZE = 1;
const MAX_SIZE = 16384;

interface RatioPreset {
  label: string;
  width: number;
  height: number;
}

const RATIO_PRESETS: RatioPreset[] = [
  { label: '16×16 파비콘', width: 16, height: 16 },
  { label: '32×32 아이콘', width: 32, height: 32 },
  { label: '1:1 정사각형', width: 600, height: 600 },
  { label: '1:1 고화질', width: 1024, height: 1024 },
  { label: '4:3 표준', width: 800, height: 600 },
  { label: '16:9 가로', width: 1280, height: 720 },
  { label: '9:16 숏폼', width: 720, height: 1280 },
  { label: '3:2 사진', width: 900, height: 600 },
  { label: '2:3 세로', width: 600, height: 900 },
];

function adjustCropToAspect(
  currentCrop: CropRect,
  targetAspect: number,
  natW: number,
  natH: number
): CropRect {
  const safeNatW = Math.max(1, natW > 0 ? natW : currentCrop.width || 800);
  const safeNatH = Math.max(1, natH > 0 ? natH : currentCrop.height || 800);

  const safeAspect = Math.max(0.0001, targetAspect || 1);

  let maxCropW = safeNatW;
  let maxCropH = maxCropW / safeAspect;

  if (maxCropH > safeNatH) {
    maxCropH = safeNatH;
    maxCropW = maxCropH * safeAspect;
  }

  const currentSpanW = currentCrop.width > 10 ? currentCrop.width : maxCropW * 0.8;
  let newW = Math.min(maxCropW, currentSpanW);
  let newH = newW / safeAspect;

  if (newH > safeNatH) {
    newH = safeNatH;
    newW = newH * safeAspect;
  }
  if (newW > safeNatW) {
    newW = safeNatW;
    newH = newW / safeAspect;
  }

  newW = Math.max(1, Math.round(newW));
  newH = Math.max(1, Math.round(newW / safeAspect));

  const centerX = currentCrop.x + currentCrop.width / 2;
  const centerY = currentCrop.y + currentCrop.height / 2;

  let newX = Math.round(centerX - newW / 2);
  let newY = Math.round(centerY - newH / 2);

  if (newX < 0) newX = 0;
  if (newY < 0) newY = 0;
  if (newX + newW > safeNatW) newX = safeNatW - newW;
  if (newY + newH > safeNatH) newY = safeNatH - newH;

  return {
    x: Math.max(0, newX),
    y: Math.max(0, newY),
    width: Math.max(1, Math.min(safeNatW, newW)),
    height: Math.max(1, Math.min(safeNatH, newH)),
  };
}

export function LogoView() {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, width: 300, height: 300 });
  const [outputWidth, setOutputWidth] = useState<number>(600);
  const [outputHeight, setOutputHeight] = useState<number>(600);
  const [widthInput, setWidthInput] = useState<string>('600');
  const [heightInput, setHeightInput] = useState<string>('600');
  const [isAspectLocked, setIsAspectLocked] = useState<boolean>(true);
  const [resultDataUrl, setResultDataUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(380);

  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(380);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const naturalDimensionsRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });

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

  const generateLogo = useCallback(
    async (
      src: string,
      cropArea: CropRect,
      targetWidth: number = outputWidth,
      targetHeight: number = outputHeight
    ) => {
      try {
        const outUrl = await cropAndResizeLogo(src, cropArea, targetWidth, targetHeight);
        setResultDataUrl(outUrl);
      } catch {
        // ignore
      }
    },
    [outputWidth, outputHeight]
  );

  const processFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        setImageSrc(src);

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          naturalDimensionsRef.current = { width: img.width, height: img.height };
          setImageDimensions({ width: img.width, height: img.height });

          const targetAspect = outputWidth / (outputHeight || 1);
          const imgAspect = img.width / img.height;
          let cropW = 0;
          let cropH = 0;

          if (imgAspect > targetAspect) {
            cropH = img.height * 0.8;
            cropW = cropH * targetAspect;
          } else {
            cropW = img.width * 0.8;
            cropH = cropW / targetAspect;
          }

          const initialCrop: CropRect = {
            x: Math.round((img.width - cropW) / 2),
            y: Math.round((img.height - cropH) / 2),
            width: Math.max(1, Math.round(cropW)),
            height: Math.max(1, Math.round(cropH)),
          };
          setCrop(initialCrop);
          generateLogo(src, initialCrop, outputWidth, outputHeight);
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    },
    [generateLogo, outputWidth, outputHeight]
  );

  const { isDragActive, getRootProps } = useImageDropPaste({
    onFiles: (files) => {
      if (files[0]) processFile(files[0]);
    },
    multiple: false,
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
    if (e.target) e.target.value = '';
  };

  const handleCropChange = (newCrop: CropRect) => {
    setCrop(newCrop);
    if (imageSrc) {
      generateLogo(imageSrc, newCrop, outputWidth, outputHeight);
    }
  };

  const handleCommitWidth = () => {
    let num = parseInt(widthInput, 10);
    if (isNaN(num) || num < MIN_SIZE) {
      num = MIN_SIZE;
    } else if (num > MAX_SIZE) {
      num = MAX_SIZE;
    }
    setWidthInput(String(num));

    let nextH = outputHeight;
    if (isAspectLocked) {
      const currentRatio = outputWidth / (outputHeight || 1);
      nextH = Math.max(MIN_SIZE, Math.min(MAX_SIZE, Math.round(num / currentRatio)));
      setHeightInput(String(nextH));
    }

    setOutputWidth(num);
    setOutputHeight(nextH);

    const targetAspect = num / nextH;
    const adjustedCrop = adjustCropToAspect(
      crop,
      targetAspect,
      naturalDimensionsRef.current.width,
      naturalDimensionsRef.current.height
    );
    setCrop(adjustedCrop);

    if (imageSrc) {
      generateLogo(imageSrc, adjustedCrop, num, nextH);
    }
  };

  const handleCommitHeight = () => {
    let num = parseInt(heightInput, 10);
    if (isNaN(num) || num < MIN_SIZE) {
      num = MIN_SIZE;
    } else if (num > MAX_SIZE) {
      num = MAX_SIZE;
    }
    setHeightInput(String(num));

    let nextW = outputWidth;
    if (isAspectLocked) {
      const currentRatio = outputWidth / (outputHeight || 1);
      nextW = Math.max(MIN_SIZE, Math.min(MAX_SIZE, Math.round(num * currentRatio)));
      setWidthInput(String(nextW));
    }

    setOutputWidth(nextW);
    setOutputHeight(num);

    const targetAspect = nextW / num;
    const adjustedCrop = adjustCropToAspect(
      crop,
      targetAspect,
      naturalDimensionsRef.current.width,
      naturalDimensionsRef.current.height
    );
    setCrop(adjustedCrop);

    if (imageSrc) {
      generateLogo(imageSrc, adjustedCrop, nextW, num);
    }
  };

  const handleSelectPreset = (preset: RatioPreset) => {
    setOutputWidth(preset.width);
    setOutputHeight(preset.height);
    setWidthInput(String(preset.width));
    setHeightInput(String(preset.height));

    const targetAspect = preset.width / preset.height;
    const adjustedCrop = adjustCropToAspect(
      crop,
      targetAspect,
      naturalDimensionsRef.current.width,
      naturalDimensionsRef.current.height
    );
    setCrop(adjustedCrop);

    if (imageSrc) {
      generateLogo(imageSrc, adjustedCrop, preset.width, preset.height);
    }
  };

  const handleSave = async () => {
    if (!resultDataUrl) return;
    setIsProcessing(true);
    try {
      const res = await downloadDataUrl(
        resultDataUrl,
        `logo_crop_${outputWidth}x${outputHeight}_${Date.now()}.png`
      );
      toast.success(res.message);
    } catch {
      toast.error('저장 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    if (!resultDataUrl) return;
    setIsProcessing(true);
    try {
      const res = await shareToKakaoTalk(
        resultDataUrl,
        '로고/썸네일 이미지',
        `logo_${outputWidth}x${outputHeight}_${Date.now()}.png`
      );
      toast.success(res.message);
    } catch {
      toast.error('공유 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
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
      <Box sx={{ mb: { xs: 1.5, sm: 2 }, flexShrink: 0 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          로고 / 썸네일 맞춤 생성기
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          자유로운 영역 드래그 크롭 후 가로/세로 해상도를 직접 지정하여 고화질 앱 아이콘 및 썸네일을
          생성합니다.
        </Typography>
      </Box>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      {!imageSrc ? (
        <Card
          {...getRootProps({
            onClick: () => fileInputRef.current?.click(),
          })}
          sx={{
            p: 4,
            flex: '1 1 auto',
            minHeight: 0,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'divider',
            bgcolor: isDragActive ? 'action.hover' : 'transparent',
            borderRadius: 3,
            transition: (theme) => theme.transitions.create(['border-color', 'background-color']),
            '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
          }}
        >
          <Box
            sx={{
              width: { xs: 64, sm: 80 },
              height: { xs: 64, sm: 80 },
              borderRadius: '50%',
              bgcolor: 'primary.lighter',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2.5,
            }}
          >
            <CropSquareRoundedIcon sx={{ fontSize: { xs: 36, sm: 44 } }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>
            이미지 업로드
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', mb: 3, textAlign: 'center', maxWidth: 480 }}
          >
            프로필 사진, 앱 아이콘, 썸네일에 최적화되어 있습니다.
            <br />
            이미지를 드래그하거나 클립보드(Ctrl+V)에서 붙여넣으세요.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<CloudUploadRoundedIcon />}
          >
            사진 선택하기
          </Button>
        </Card>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 2, md: 0 },
            flex: '1 1 auto',
            minHeight: 0,
            height: '100%',
            position: 'relative',
          }}
        >
          {/* Left: Interactive Cropper (Fills remaining width and height) */}
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
                p: 2,
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                flex: '1 1 auto',
                minHeight: 0,
                height: '100%',
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
                  크롭 영역 드래그 & 조절
                </Typography>
                <Chip
                  size="small"
                  variant="outlined"
                  label={`선택 영역: ${crop.width} × ${crop.height} px`}
                  sx={{ fontWeight: 600 }}
                />
              </Box>

              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  flex: '1 1 auto',
                  minHeight: 0,
                  height: '100%',
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: '#0f172a',
                }}
              >
                <InteractiveCropBox
                  imageSrc={imageSrc}
                  naturalWidth={imageDimensions.width}
                  naturalHeight={imageDimensions.height}
                  aspectRatio={outputWidth / (outputHeight || 1)}
                  crop={crop}
                  onChange={handleCropChange}
                />
              </Box>
            </Card>
          </Box>

          {/* Draggable Divider (Desktop) */}
          <Box
            onPointerDown={handleDividerPointerDown}
            onPointerMove={handleDividerPointerMove}
            onPointerUp={handleDividerPointerUp}
            sx={{
              display: { xs: 'none', md: 'flex' },
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

          {/* Right: Output Size Setting, Preview & Download */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: { xs: '100%', md: `${rightPanelWidth}px` },
              minWidth: { md: `${rightPanelWidth}px` },
              maxWidth: { md: `${rightPanelWidth}px` },
              flexShrink: 0,
              gap: 2,
              minHeight: 0,
              overflow: 'auto',
              pl: { md: 1 },
              pr: 0.5,
            }}
          >
            {/* Resolution Setting Card */}
            <Card sx={{ p: 2.5, borderRadius: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AspectRatioRoundedIcon color="primary" fontSize="small" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    출력 해상도 설정
                  </Typography>
                </Box>
                <Tooltip title={isAspectLocked ? '비율 고정 해제' : '비율 고정 활성화'}>
                  <IconButton
                    size="small"
                    color={isAspectLocked ? 'primary' : 'default'}
                    onClick={() => setIsAspectLocked((prev) => !prev)}
                    sx={{
                      bgcolor: isAspectLocked ? 'primary.lighter' : 'action.hover',
                    }}
                  >
                    {isAspectLocked ? (
                      <LockRoundedIcon fontSize="small" />
                    ) : (
                      <LockOpenRoundedIcon fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Width & Height Inputs */}
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  type="text"
                  label="가로 (Width)"
                  value={widthInput}
                  onChange={(e) => setWidthInput(e.target.value)}
                  onBlur={handleCommitWidth}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  slotProps={{
                    input: {
                      endAdornment: <InputAdornment position="end">px</InputAdornment>,
                    },
                  }}
                />
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  ×
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="text"
                  label="세로 (Height)"
                  value={heightInput}
                  onChange={(e) => setHeightInput(e.target.value)}
                  onBlur={handleCommitHeight}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  slotProps={{
                    input: {
                      endAdornment: <InputAdornment position="end">px</InputAdornment>,
                    },
                  }}
                />
              </Box>

              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', fontWeight: 600, mb: 1, display: 'block' }}
              >
                규격 프리셋 선택
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {RATIO_PRESETS.map((preset) => {
                  const isCurrent = outputWidth === preset.width && outputHeight === preset.height;
                  return (
                    <Chip
                      key={preset.label}
                      label={`${preset.label} (${preset.width}×${preset.height})`}
                      size="small"
                      clickable
                      color={isCurrent ? 'primary' : 'default'}
                      variant={isCurrent ? 'filled' : 'outlined'}
                      onClick={() => handleSelectPreset(preset)}
                      sx={{ fontWeight: isCurrent ? 700 : 500 }}
                    />
                  );
                })}
              </Box>
            </Card>

            {/* Preview Card */}
            <Card
              sx={{
                p: 2.5,
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  mb: 1.5,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  출력 미리보기
                </Typography>
                <Chip
                  size="small"
                  color="primary"
                  label={`${outputWidth} × ${outputHeight} px`}
                  sx={{ fontWeight: 700 }}
                />
              </Box>

              <Box
                sx={{
                  width: '100%',
                  height: 180,
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: '#0f172a',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                  border: '2px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1.5,
                  p: 1,
                }}
              >
                {resultDataUrl ? (
                  <img
                    src={resultDataUrl}
                    alt={`${outputWidth}x${outputHeight} Output`}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      borderRadius: 4,
                    }}
                  />
                ) : (
                  <CircularProgress size={32} />
                )}
              </Box>

              <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                포맷: PNG 무손실 고해상도 출력
              </Typography>
            </Card>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mt: 'auto', pt: 0.5 }}>
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                onClick={() => setImageSrc('')}
                startIcon={<RefreshRoundedIcon />}
                sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
              >
                다른 사진
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={isProcessing || !resultDataUrl}
                startIcon={
                  isProcessing ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <DownloadRoundedIcon />
                  )
                }
                sx={{ py: 1.4, borderRadius: 2, fontWeight: 700, fontSize: '0.95rem' }}
              >
                {outputWidth} × {outputHeight} 저장
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                onClick={handleShare}
                disabled={isProcessing || !resultDataUrl}
                startIcon={<ShareRoundedIcon />}
                sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
              >
                공유
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </DashboardContent>
  );
}
