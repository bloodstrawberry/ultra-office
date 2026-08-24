'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';

// ----------------------------------------------------------------------

interface DocumentStamperProps {
  currentStampUrl?: string;
}

export function DocumentStamper({ currentStampUrl }: DocumentStamperProps) {
  const [docImageSrc, setDocImageSrc] = useState<string | null>(null);
  const [docFileName, setDocFileName] = useState<string>('document');
  const [stampPos, setStampPos] = useState<{ x: number; y: number }>({ x: 200, y: 200 });
  const [stampSize, setStampSize] = useState<number>(90);
  const [stampRotation, setStampRotation] = useState<number>(0);
  const [stampOpacity, setStampOpacity] = useState<number>(90);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocFileName(file.name.replace(/\.[^/.]+$/, ''));
    const reader = new FileReader();
    reader.onload = (event) => {
      setDocImageSrc(event.target?.result as string);
      toast.success('문서 이미지가 로드되었습니다. 도장을 원하는 위치로 드래그하세요.');
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - stampPos.x,
      y: e.clientY - stampPos.y,
    });
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newX = e.clientX - rect.left - stampSize / 2;
      const newY = e.clientY - rect.top - stampSize / 2;
      setStampPos({ x: Math.max(0, newX), y: Math.max(0, newY) });
    },
    [isDragging, stampSize]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleExportStampedDoc = () => {
    if (!docImageSrc || !currentStampUrl) {
      toast.error('문서와 도장이 모두 준비되어야 합니다.');
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const baseImg = new Image();
    baseImg.crossOrigin = 'anonymous';
    baseImg.onload = () => {
      canvas.width = baseImg.naturalWidth;
      canvas.height = baseImg.naturalHeight;

      // Draw base document
      ctx.drawImage(baseImg, 0, 0);

      // Draw stamp overlay
      const stampImg = new Image();
      stampImg.crossOrigin = 'anonymous';
      stampImg.onload = () => {
        if (!containerRef.current) return;
        const displayWidth = containerRef.current.clientWidth;
        const scale = baseImg.naturalWidth / displayWidth;

        const targetX = stampPos.x * scale;
        const targetY = stampPos.y * scale;
        const targetSize = stampSize * scale;

        ctx.save();
        ctx.globalAlpha = stampOpacity / 100;
        ctx.translate(targetX + targetSize / 2, targetY + targetSize / 2);
        ctx.rotate((stampRotation * Math.PI) / 180);
        ctx.drawImage(stampImg, -targetSize / 2, -targetSize / 2, targetSize, targetSize);
        ctx.restore();

        // Download
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `stamped_${docFileName}.png`;
        link.click();
        toast.success('도장이 날인된 완성 문서가 다운로드되었습니다.');
      };
      stampImg.src = currentStampUrl;
    };
    baseImg.src = docImageSrc;
  };

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '300px 1fr' }, gap: 3 }}>
      {/* 1. Left Controls */}
      <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
          날인 도구 설정
        </Typography>

        <Button
          variant="contained"
          component="label"
          startIcon={<UploadFileRoundedIcon />}
          fullWidth
        >
          문서 / 영수증 이미지 업로드
          <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
        </Button>

        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            도장 크기: {stampSize}px
          </Typography>
          <Slider
            size="small"
            value={stampSize}
            min={40}
            max={200}
            onChange={(_, v) => setStampSize(v as number)}
          />
        </Box>

        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            날인 각도 (자연스러운 기울기): {stampRotation}°
          </Typography>
          <Slider
            size="small"
            value={stampRotation}
            min={-45}
            max={45}
            onChange={(_, v) => setStampRotation(v as number)}
          />
        </Box>

        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            인주 투명도 / 밀착도: {stampOpacity}%
          </Typography>
          <Slider
            size="small"
            value={stampOpacity}
            min={50}
            max={100}
            onChange={(_, v) => setStampOpacity(v as number)}
          />
        </Box>

        <Button
          variant="contained"
          color="success"
          startIcon={<DownloadRoundedIcon />}
          onClick={handleExportStampedDoc}
          disabled={!docImageSrc}
          sx={{ mt: 2, fontWeight: 800 }}
        >
          날인 문서 고화질 저장
        </Button>
      </Card>

      {/* 2. Right Canvas Area */}
      <Card
        sx={{
          p: 2,
          borderRadius: 2,
          minHeight: 540,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'background.neutral',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {docImageSrc ? (
          <Box
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: 700,
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
              userSelect: 'none',
            }}
          >
            {/* Base Document Image */}
            <img
              src={docImageSrc}
              alt="Document"
              style={{ width: '100%', display: 'block', pointerEvents: 'none' }}
            />

            {/* Draggable Stamp Overlay */}
            {currentStampUrl && (
              <Box
                onMouseDown={handleMouseDown}
                sx={{
                  position: 'absolute',
                  left: stampPos.x,
                  top: stampPos.y,
                  width: stampSize,
                  height: stampSize,
                  cursor: isDragging ? 'grabbing' : 'grab',
                  transform: `rotate(${stampRotation}deg)`,
                  opacity: stampOpacity / 100,
                  transition: isDragging ? 'none' : 'transform 0.1s ease',
                  border: isDragging ? '1.5px dashed #d32f2f' : '1.5px dashed transparent',
                  '&:hover': { border: '1.5px dashed #d32f2f' },
                }}
              >
                <img
                  src={currentStampUrl}
                  alt="Stamp"
                  style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
                />
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <Typography
              variant="subtitle1"
              sx={{ color: 'text.secondary', mb: 1, fontWeight: 700 }}
            >
              문서나 계약서 이미지를 업로드해 주세요.
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              업로드 후 마우스 드래그로 원하는 위치에 도장을 찍을 수 있습니다.
            </Typography>
          </Box>
        )}
      </Card>
    </Box>
  );
}
