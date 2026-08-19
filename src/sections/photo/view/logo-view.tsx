'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CropSquareRoundedIcon from '@mui/icons-material/CropSquareRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

import { type CropRect, InteractiveCropBox } from '../components/interactive-crop-box';
import { downloadDataUrl, shareToKakaoTalk, cropAndResizeLogo } from '../utils/image-processor';

export function LogoView() {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, width: 300, height: 300 });
  const [resultDataUrl, setResultDataUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setImageSrc(src);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const dim = Math.min(img.width, img.height) * 0.8;
        const initialCrop: CropRect = {
          x: Math.round((img.width - dim) / 2),
          y: Math.round((img.height - dim) / 2),
          width: Math.round(dim),
          height: Math.round(dim),
        };
        setCrop(initialCrop);
        generateLogo(src, initialCrop);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, []);

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

  const generateLogo = async (src: string, cropArea: CropRect) => {
    try {
      const outUrl = await cropAndResizeLogo(src, cropArea, 600, 600);
      setResultDataUrl(outUrl);
    } catch {
      // ignore
    }
  };

  const handleCropChange = (newCrop: CropRect) => {
    setCrop(newCrop);
    if (imageSrc) {
      generateLogo(imageSrc, newCrop);
    }
  };

  const handleSave = async () => {
    if (!resultDataUrl) return;
    setIsProcessing(true);
    try {
      const res = await downloadDataUrl(resultDataUrl, `logo_square_600x600_${Date.now()}.png`);
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
        '정사각형 로고 썸네일',
        `logo_${Date.now()}.png`
      );
      toast.success(res.message);
    } catch {
      toast.error('공유 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DashboardContent>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          로고 / 정사각형 1:1 썸네일 (Square 600×600)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          정사각형 1:1 비율 인터랙티브 크롭 후 600×600 규격 고해상도 앱 아이콘 및 프로필 썸네일을
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
            p: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'divider',
            bgcolor: isDragActive ? 'action.hover' : 'transparent',
            borderRadius: 3,
            minHeight: 320,
            transition: (theme) => theme.transitions.create(['border-color', 'background-color']),
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
            <CropSquareRoundedIcon sx={{ fontSize: 36 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            정사각형으로 자를 로고/사진 업로드
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            프로필 사진, 앱 아이콘, 인스타그램 피드 1:1 썸네일에 최적화되어 있습니다
          </Typography>
          <Button variant="contained" color="primary" startIcon={<CloudUploadRoundedIcon />}>
            사진 선택하기
          </Button>
        </Card>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' }, gap: 3 }}>
          {/* Left: Interactive Cropper */}
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
                  정사각형 영역 드래그 & 조절
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  선택 크기: {crop.width} × {crop.height} px
                </Typography>
              </Box>

              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: { xs: 320, sm: 460 },
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: '#0f172a',
                }}
              >
                <InteractiveCropBox
                  imageSrc={imageSrc}
                  aspectRatio={1}
                  crop={crop}
                  onChange={handleCropChange}
                />
              </Box>
            </Card>
          </Box>

          {/* Right: 600x600 Preview & Download */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Card
              sx={{
                p: 2.5,
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, mb: 2, alignSelf: 'flex-start' }}
              >
                최종 600×600 px 정사각형 출력 결과
              </Typography>

              <Box
                sx={{
                  width: 220,
                  height: 220,
                  borderRadius: 3,
                  overflow: 'hidden',
                  bgcolor: '#0f172a',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                  border: '2px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}
              >
                {resultDataUrl ? (
                  <img
                    src={resultDataUrl}
                    alt="600x600 Output"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <CircularProgress />
                )}
              </Box>

              <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                해상도: 600 × 600 px (PNG 무손실)
              </Typography>
            </Card>

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => setImageSrc('')}
                startIcon={<RefreshRoundedIcon />}
                sx={{ flex: 1, py: 1.2, borderRadius: 2 }}
              >
                다른 사진
              </Button>
              <Button
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
                sx={{ flex: 1.5, py: 1.2, borderRadius: 2 }}
              >
                600×600 저장
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleShare}
                disabled={isProcessing || !resultDataUrl}
                startIcon={<ShareRoundedIcon />}
                sx={{ flex: 1, py: 1.2, borderRadius: 2 }}
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
