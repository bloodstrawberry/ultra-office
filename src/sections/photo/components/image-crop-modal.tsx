'use client';

import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import ToggleButton from '@mui/material/ToggleButton';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CropRoundedIcon from '@mui/icons-material/CropRounded';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { type CropRect, InteractiveCropBox } from './interactive-crop-box';

interface ImageCropModalProps {
  open: boolean;
  onClose: () => void;
  imageSrc: string;
  onApplyCrop: (croppedDataUrl: string) => void;
  initialAspectRatio?: number;
}

export function ImageCropModal({
  open,
  onClose,
  imageSrc,
  onApplyCrop,
  initialAspectRatio,
}: ImageCropModalProps) {
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(initialAspectRatio);
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, width: 300, height: 300 });
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({
    width: 300,
    height: 300,
  });

  useEffect(() => {
    if (!imageSrc || !open) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const w = img.naturalWidth || 800;
      const h = img.naturalHeight || 600;
      setNaturalSize({ width: w, height: h });

      let initW = w * 0.8;
      let initH = h * 0.8;

      if (aspectRatio) {
        if (initW / initH > aspectRatio) {
          initW = initH * aspectRatio;
        } else {
          initH = initW / aspectRatio;
        }
      }

      setCrop({
        x: Math.round((w - initW) / 2),
        y: Math.round((h - initH) / 2),
        width: Math.round(initW),
        height: Math.round(initH),
      });
    };
    img.src = imageSrc;
  }, [imageSrc, open, aspectRatio]);

  const handleRatioChange = (_: React.MouseEvent<HTMLElement>, newRatio: number | null) => {
    const ratio = newRatio === null ? undefined : newRatio;
    setAspectRatio(ratio);

    if (ratio && naturalSize.width > 0 && naturalSize.height > 0) {
      let w = crop.width;
      let h = w / ratio;
      if (crop.y + h > naturalSize.height) {
        h = naturalSize.height - crop.y;
        w = h * ratio;
      }
      setCrop((prev) => ({
        ...prev,
        width: Math.round(w),
        height: Math.round(h),
      }));
    }
  };

  const handleSave = () => {
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);

      const croppedUrl = canvas.toDataURL('image/png');
      onApplyCrop(croppedUrl);
      onClose();
    };
    img.src = imageSrc;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2 }}>
        <CropRoundedIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          이미지 자르기 (Crop)
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Ratio Selector */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            비율 선택:
          </Typography>
          <ToggleButtonGroup
            size="small"
            value={aspectRatio ?? 0}
            exclusive
            onChange={handleRatioChange}
          >
            <ToggleButton value={0}>자유</ToggleButton>
            <ToggleButton value={1}>1:1 정방형</ToggleButton>
            <ToggleButton value={4 / 3}>4:3</ToggleButton>
            <ToggleButton value={16 / 9}>16:9 와이드</ToggleButton>
            <ToggleButton value={210 / 297}>A4 세로</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Interactive Cropper Box */}
        <Box
          sx={{
            width: '100%',
            height: 440,
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: '#0f172a',
          }}
        >
          {open && imageSrc && (
            <InteractiveCropBox
              imageSrc={imageSrc}
              aspectRatio={aspectRatio}
              crop={crop}
              onChange={setCrop}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            선택 영역: {crop.width} × {crop.height} px
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            위치: ({crop.x}, {crop.y})
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          취소
        </Button>
        <Button variant="contained" color="primary" onClick={handleSave}>
          자르기 적용
        </Button>
      </DialogActions>
    </Dialog>
  );
}
