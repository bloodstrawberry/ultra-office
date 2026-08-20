'use client';

import React, { useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';

import type { RedactBox } from '../types';

// ----------------------------------------------------------------------

export function ImageRedactPanel() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('id_card');
  const [redactBoxes, setRedactBoxes] = useState<RedactBox[]>([]);
  const [addWatermark, setAddWatermark] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [currentBox, setCurrentBox] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name.replace(/\.[^/.]+$/, ''));
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
      setRedactBoxes([]);
      toast.success('신분증/영수증 이미지가 로드되었습니다. 마우스로 가릴 영역을 드래그하세요.');
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current || !imageSrc) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentBox({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const curX = e.clientX - rect.left;
    const curY = e.clientY - rect.top;

    const x = Math.min(startPos.x, curX);
    const y = Math.min(startPos.y, curY);
    const width = Math.abs(curX - startPos.x);
    const height = Math.abs(curY - startPos.y);

    setCurrentBox({ x, y, width, height });
  };

  const handleMouseUp = () => {
    if (isDrawing && currentBox && currentBox.width > 5 && currentBox.height > 5) {
      setRedactBoxes((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          x: currentBox.x,
          y: currentBox.y,
          width: currentBox.width,
          height: currentBox.height,
          mode: 'blackout',
        },
      ]);
    }
    setIsDrawing(false);
    setCurrentBox(null);
  };

  const handleExport = () => {
    if (!imageSrc || !containerRef.current) return;

    const baseImg = new Image();
    baseImg.crossOrigin = 'anonymous';
    baseImg.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = baseImg.naturalWidth;
      canvas.height = baseImg.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx || !containerRef.current) return;

      // Draw base
      ctx.drawImage(baseImg, 0, 0);

      const displayWidth = containerRef.current.clientWidth;
      const scale = baseImg.naturalWidth / displayWidth;

      // Draw blackouts
      ctx.fillStyle = '#000000';
      redactBoxes.forEach((b) => {
        ctx.fillRect(b.x * scale, b.y * scale, b.width * scale, b.height * scale);
      });

      // Optional Watermark
      if (addWatermark) {
        ctx.save();
        ctx.font = `bold ${canvas.width * 0.05}px sans-serif`;
        ctx.fillStyle = 'rgba(220, 38, 38, 0.45)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-Math.PI / 6);
        ctx.fillText('확인 제출용 사본 (수정 불가)', 0, 0);
        ctx.restore();
      }

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.download = `redacted_${fileName}.jpg`;
      link.click();
      toast.success('개인정보가 마스킹된 이미지가 다운로드되었습니다.');
    };
    baseImg.src = imageSrc;
  };

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '280px 1fr' }, gap: 3 }}>
      {/* 1. Left Controls */}
      <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
          신분증 / 영수증 마스킹
        </Typography>

        <Button
          variant="contained"
          component="label"
          startIcon={<UploadFileRoundedIcon />}
          fullWidth
          sx={{ fontWeight: 700 }}
        >
          신분증 / 서류 이미지 업로드
          <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
        </Button>

        <FormControlLabel
          control={
            <Switch checked={addWatermark} onChange={(e) => setAddWatermark(e.target.checked)} />
          }
          label={
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              제출용 사본 워터마크 추가
            </Typography>
          }
        />

        <Button
          variant="outlined"
          color="inherit"
          startIcon={<DeleteSweepRoundedIcon />}
          onClick={() => setRedactBoxes([])}
          disabled={redactBoxes.length === 0}
        >
          모든 마스킹 상자 지우기 ({redactBoxes.length}개)
        </Button>

        <Button
          variant="contained"
          color="success"
          startIcon={<DownloadRoundedIcon />}
          onClick={handleExport}
          disabled={!imageSrc}
          sx={{ mt: 2, fontWeight: 800 }}
        >
          마스킹 완성 이미지 저장
        </Button>
      </Card>

      {/* 2. Drawing Canvas */}
      <Card
        sx={{
          p: 2,
          borderRadius: 2,
          minHeight: 520,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'background.neutral',
          position: 'relative',
        }}
      >
        {imageSrc ? (
          <Box
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: 680,
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
              userSelect: 'none',
              cursor: 'crosshair',
            }}
          >
            <img
              src={imageSrc}
              alt="ID Card"
              style={{ width: '100%', display: 'block', pointerEvents: 'none' }}
            />

            {/* Rendered Blackout Boxes */}
            {redactBoxes.map((b) => (
              <Box
                key={b.id}
                sx={{
                  position: 'absolute',
                  left: b.x,
                  top: b.y,
                  width: b.width,
                  height: b.height,
                  bgcolor: '#000000',
                  border: '1px solid #334155',
                }}
              />
            ))}

            {/* Currently Drawing Box */}
            {currentBox && (
              <Box
                sx={{
                  position: 'absolute',
                  left: currentBox.x,
                  top: currentBox.y,
                  width: currentBox.width,
                  height: currentBox.height,
                  bgcolor: 'rgba(0,0,0,0.7)',
                  border: '1.5px dashed #ef4444',
                }}
              />
            )}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <Typography
              variant="subtitle1"
              sx={{ color: 'text.secondary', fontWeight: 700, mb: 1 }}
            >
              신분증이나 계약서 이미지를 업로드해 주세요.
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              주민번호 뒷자리나 민감한 서명 영역을 마우스로 드래그하여 블랙아웃 처리할 수 있습니다.
            </Typography>
          </Box>
        )}
      </Card>
    </Box>
  );
}
