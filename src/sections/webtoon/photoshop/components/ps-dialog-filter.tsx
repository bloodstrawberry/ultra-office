'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

export type FilterDialogType =
  | 'brightness'
  | 'hue'
  | 'blur'
  | 'sharpen'
  | 'screentone'
  | 'lineArt'
  | 'mosaic'
  | 'threshold'
  | null;

interface PsDialogFilterProps {
  filterType: FilterDialogType;
  open: boolean;
  onClose: () => void;
  onApply: (params: Record<string, number>) => void;
}

export function PsDialogFilter({ filterType, open, onClose, onApply }: PsDialogFilterProps) {
  // Slider states
  const [val1, setVal1] = useState(0);
  const [val2, setVal2] = useState(0);

  // Reset values when opened
  React.useEffect(() => {
    if (filterType === 'brightness') {
      setVal1(0); // Brightness: -100 to 100
      setVal2(0); // Contrast: -100 to 100
    } else if (filterType === 'hue') {
      setVal1(0); // Hue: -180 to 180
      setVal2(0); // Saturation: -100 to 100
    } else if (filterType === 'blur') {
      setVal1(4); // Radius: 1 to 20
    } else if (filterType === 'sharpen') {
      setVal1(1); // Strength: 0.5 to 3
    } else if (filterType === 'screentone') {
      setVal1(6); // Dot size: 3 to 16
    } else if (filterType === 'lineArt') {
      setVal1(50); // Sensitivity: 10 to 90
    } else if (filterType === 'mosaic') {
      setVal1(8); // Block size: 4 to 32
    } else if (filterType === 'threshold') {
      setVal1(128); // 0 to 255
    }
  }, [filterType, open]);

  if (!filterType) return null;

  const getTitle = () => {
    switch (filterType) {
      case 'brightness':
        return '밝기 및 대비 (Brightness / Contrast)';
      case 'hue':
        return '색조 및 채도 (Hue / Saturation)';
      case 'blur':
        return '가우시안 흐림 효과 (Gaussian Blur)';
      case 'sharpen':
        return '선명 효과 (Sharpen)';
      case 'screentone':
        return '웹툰 망점 스크린톤 (Halftone Screentone)';
      case 'lineArt':
        return '웹툰 선화 추출 (Line Art Extraction)';
      case 'mosaic':
        return '모자이크 (Mosaic / Pixelate)';
      case 'threshold':
        return '임계값 흑백화 (Threshold)';
      default:
        return '필터 설정';
    }
  };

  const handleConfirm = () => {
    onApply({ val1, val2 });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2,
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: '1rem', pb: 1 }}>{getTitle()}</DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {filterType === 'brightness' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  밝기 (Brightness)
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {val1}
                </Typography>
              </Box>
              <Slider
                size="small"
                value={val1}
                min={-100}
                max={100}
                onChange={(_, v) => setVal1(Number(v))}
              />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  대비 (Contrast)
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {val2}
                </Typography>
              </Box>
              <Slider
                size="small"
                value={val2}
                min={-100}
                max={100}
                onChange={(_, v) => setVal2(Number(v))}
              />
            </Box>
          </Box>
        )}

        {filterType === 'hue' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  색조 (Hue)
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {val1}°
                </Typography>
              </Box>
              <Slider
                size="small"
                value={val1}
                min={-180}
                max={180}
                onChange={(_, v) => setVal1(Number(v))}
              />
            </Box>

            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  채도 (Saturation)
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {val2}
                </Typography>
              </Box>
              <Slider
                size="small"
                value={val2}
                min={-100}
                max={100}
                onChange={(_, v) => setVal2(Number(v))}
              />
            </Box>
          </Box>
        )}

        {filterType === 'blur' && (
          <Box sx={{ pt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                흐림 반경 (Radius)
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {val1}px
              </Typography>
            </Box>
            <Slider
              size="small"
              value={val1}
              min={1}
              max={15}
              onChange={(_, v) => setVal1(Number(v))}
            />
          </Box>
        )}

        {filterType === 'sharpen' && (
          <Box sx={{ pt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                선명도 강도 (Strength)
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {val1}x
              </Typography>
            </Box>
            <Slider
              size="small"
              value={val1}
              min={0.5}
              max={3}
              step={0.1}
              onChange={(_, v) => setVal1(Number(v))}
            />
          </Box>
        )}

        {filterType === 'screentone' && (
          <Box sx={{ pt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                망점 크기 (Dot Size)
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {val1}px
              </Typography>
            </Box>
            <Slider
              size="small"
              value={val1}
              min={3}
              max={16}
              onChange={(_, v) => setVal1(Number(v))}
            />
          </Box>
        )}

        {filterType === 'lineArt' && (
          <Box sx={{ pt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                선화 민감도 (Sensitivity)
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {val1}%
              </Typography>
            </Box>
            <Slider
              size="small"
              value={val1}
              min={10}
              max={90}
              onChange={(_, v) => setVal1(Number(v))}
            />
          </Box>
        )}

        {filterType === 'mosaic' && (
          <Box sx={{ pt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                블록 크기 (Block Size)
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {val1}px
              </Typography>
            </Box>
            <Slider
              size="small"
              value={val1}
              min={4}
              max={32}
              onChange={(_, v) => setVal1(Number(v))}
            />
          </Box>
        )}

        {filterType === 'threshold' && (
          <Box sx={{ pt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                임계값 (Threshold)
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {val1}
              </Typography>
            </Box>
            <Slider
              size="small"
              value={val1}
              min={1}
              max={254}
              onChange={(_, v) => setVal1(Number(v))}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 1 }}>
        <Button onClick={onClose} color="inherit" size="small">
          취소
        </Button>
        <Button onClick={handleConfirm} variant="contained" color="primary" size="small">
          적용
        </Button>
      </DialogActions>
    </Dialog>
  );
}
