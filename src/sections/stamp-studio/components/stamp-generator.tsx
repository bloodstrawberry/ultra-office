'use client';

import type { StampType, StampFont, StampConfig } from '../types';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Radio from '@mui/material/Radio';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';

import { renderStampCanvas } from '../utils/stamp-renderer';

// ----------------------------------------------------------------------

interface StampGeneratorProps {
  onStampGenerated?: (dataUrl: string) => void;
}

const DEFAULT_CONFIG: StampConfig = {
  type: 'circle_personal',
  mainText: '홍길동',
  subText: '대표이사의인',
  font: 'classic_seal',
  color: '#d32f2f',
  borderThickness: 5,
  roughness: 25,
  size: 300,
};

const COLOR_PRESETS = [
  { label: '선명한 인주적색', value: '#d32f2f' },
  { label: '클래식 버건디', value: '#b71c1c' },
  { label: '주홍색 (전통)', value: '#e65100' },
  { label: '블랙 (흑백 결재)', value: '#1e293b' },
  { label: '블루 (공식 확인)', value: '#1d4ed8' },
];

export function StampGenerator({ onStampGenerated }: StampGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [config, setConfig] = useState<StampConfig>(DEFAULT_CONFIG);
  const [stampDataUrl, setStampDataUrl] = useState<string>('');

  const onStampGeneratedRef = useRef(onStampGenerated);
  useEffect(() => {
    onStampGeneratedRef.current = onStampGenerated;
  }, [onStampGenerated]);

  const updateCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    const url = renderStampCanvas(canvasRef.current, config);
    setStampDataUrl(url);
    if (onStampGeneratedRef.current) {
      onStampGeneratedRef.current(url);
    }
  }, [config]);

  useEffect(() => {
    updateCanvas();
  }, [updateCanvas]);

  const handleDownloadPng = () => {
    if (!stampDataUrl) return;
    const link = document.createElement('a');
    link.href = stampDataUrl;
    link.download = `stamp_${config.mainText || 'seal'}_transparent.png`;
    link.click();
    toast.success('투명 배경 도장 PNG 파일이 다운로드되었습니다.');
  };

  const handleCopyPng = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        toast.success('도장 이미지가 클립보드에 복사되었습니다. (Ctrl+V로 붙여넣기 가능)');
      });
    } catch {
      toast.error('클립보드 복사를 지원하지 않는 브라우저입니다.');
    }
  };

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' }, gap: 3 }}>
      {/* 1. Left: Configuration Controls */}
      <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
          도장 & 직인 디자인 옵션 설정
        </Typography>

        {/* Stamp Type Selection */}
        <FormControl component="fieldset">
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>
            도장 종류 선택
          </Typography>
          <RadioGroup
            row
            value={config.type}
            onChange={(e) => setConfig((prev) => ({ ...prev, type: e.target.value as StampType }))}
          >
            <FormControlLabel
              value="circle_personal"
              control={<Radio size="small" />}
              label="개인 원형 인감"
            />
            <FormControlLabel
              value="oval_personal"
              control={<Radio size="small" />}
              label="타원형 막도장"
            />
            <FormControlLabel
              value="circle_corporate"
              control={<Radio size="small" />}
              label="법인/회사 직인"
            />
            <FormControlLabel
              value="square_seal"
              control={<Radio size="small" />}
              label="사각 결재인"
            />
            <FormControlLabel
              value="approval_sign"
              control={<Radio size="small" />}
              label="3단 결재란"
            />
          </RadioGroup>
        </FormControl>

        {/* Text Input Fields */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: config.type === 'circle_corporate' ? '1fr 1fr' : '1fr',
            gap: 2,
          }}
        >
          <TextField
            label={
              config.type === 'circle_corporate'
                ? '회사/법인 상호명'
                : config.type === 'approval_sign'
                  ? '결재자 이름/직급'
                  : '도장 표기 이름'
            }
            value={config.mainText}
            onChange={(e) => setConfig((prev) => ({ ...prev, mainText: e.target.value }))}
            fullWidth
            helperText="2~4글자 입력 시 전통 도장 규격에 맞춰 자동 정렬됩니다."
          />

          {config.type === 'circle_corporate' && (
            <TextField
              label="중앙 표기 직함 (기본: 대표이사의인)"
              value={config.subText}
              onChange={(e) => setConfig((prev) => ({ ...prev, subText: e.target.value }))}
              fullWidth
            />
          )}
        </Box>

        {/* Font & Color */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>서체 스타일</InputLabel>
            <Select
              value={config.font}
              label="서체 스타일"
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, font: e.target.value as StampFont }))
              }
            >
              <MenuItem value="classic_seal">고인체 / 훈민정음 (추천)</MenuItem>
              <MenuItem value="serif">명조 / 바탕체</MenuItem>
              <MenuItem value="gothic">고딕 / 깔끔한 현대식</MenuItem>
              <MenuItem value="cursive">궁서체 / 붓글씨</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>인주 색상</InputLabel>
            <Select
              value={config.color}
              label="인주 색상"
              onChange={(e) => setConfig((prev) => ({ ...prev, color: e.target.value }))}
            >
              {COLOR_PRESETS.map((c) => (
                <MenuItem key={c.value} value={c.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: c.value }} />
                    {c.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Sliders: Thickness & Roughness */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              테두리 두께: {config.borderThickness}px
            </Typography>
            <Slider
              size="small"
              value={config.borderThickness}
              min={2}
              max={12}
              onChange={(_, v) => setConfig((prev) => ({ ...prev, borderThickness: v as number }))}
            />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              인주 번짐/빈티지 질감: {config.roughness}%
            </Typography>
            <Slider
              size="small"
              value={config.roughness}
              min={0}
              max={60}
              onChange={(_, v) => setConfig((prev) => ({ ...prev, roughness: v as number }))}
            />
          </Box>
        </Box>
      </Card>

      {/* 2. Right: High-Res Realtime Preview & Actions */}
      <Card
        sx={{
          p: 3,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2.5,
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
          실시간 고해상도 투명 도장 미리보기
        </Typography>

        {/* Checkered Transparent Background Preview Box */}
        <Box
          sx={{
            p: 4,
            borderRadius: 2,
            border: '2px dashed',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            maxWidth: 320,
            height: 280,
            background: 'repeating-conic-gradient(#e2e8f0 0% 25%, #ffffff 0% 50%) 50% / 20px 20px',
          }}
        >
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            style={{ width: 180, height: 180, objectFit: 'contain' }}
          />
        </Box>

        <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center' }}>
          배경이 완벽히 투명한(Alpha Channel) 고해상도 PNG 파일로 저장됩니다.
        </Typography>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1.5, width: '100%', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="error"
            fullWidth
            startIcon={<DownloadRoundedIcon />}
            onClick={handleDownloadPng}
            sx={{ fontWeight: 800 }}
          >
            투명 도장 PNG 다운로드
          </Button>

          <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<ContentCopyRoundedIcon />}
              onClick={handleCopyPng}
            >
              클립보드 복사
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<RefreshRoundedIcon />}
              onClick={updateCanvas}
            >
              인주 질감 재생성
            </Button>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
