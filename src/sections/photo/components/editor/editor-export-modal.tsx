'use client';

import { toast } from 'sonner';
import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';

// ----------------------------------------------------------------------

interface EditorExportModalProps {
  open: boolean;
  onClose: () => void;
  maskCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  originalImage: HTMLImageElement | null;
}

export function EditorExportModal({ open, onClose, originalImage }: EditorExportModalProps) {
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [quality, setQuality] = useState<number>(92);
  const [scale, setScale] = useState<number>(1);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const origWidth = originalImage ? originalImage.naturalWidth || originalImage.width : 1920;
  const origHeight = originalImage ? originalImage.naturalHeight || originalImage.height : 1080;
  const targetW = Math.round(origWidth * scale);
  const targetH = Math.round(origHeight * scale);

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const mainCanvas = document.querySelector('canvas');
      if (!mainCanvas) {
        toast.error('캔버스를 찾을 수 없습니다.');
        return;
      }

      // Create target export canvas
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = targetW;
      exportCanvas.height = targetH;
      const ctx = exportCanvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context error');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(mainCanvas, 0, 0, targetW, targetH);

      const mimeType =
        format === 'png' ? 'image/png' : format === 'jpeg' ? 'image/jpeg' : 'image/webp';
      const dataUrl = exportCanvas.toDataURL(mimeType, quality / 100);

      const link = document.createElement('a');
      link.download = `photo-edit-${Date.now()}.${format === 'jpeg' ? 'jpg' : format}`;
      link.href = dataUrl;
      link.click();

      toast.success('고화질 사진 저장이 완료되었습니다!');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('내보내기 중 오류가 발생했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      const mainCanvas = document.querySelector('canvas');
      if (!mainCanvas) return;

      mainCanvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        toast.success('클립보드에 복사되었습니다! 원하는 곳에 Ctrl+V 하세요.');
        onClose();
      }, 'image/png');
    } catch {
      toast.error('클립보드 복사를 지원하지 않는 브라우저입니다.');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          p: 2.5,
          bgcolor: 'background.paper',
        },
      }}
    >
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          사진 내보내기 (Export)
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* 포맷 선택 */}
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, mb: 1, display: 'block' }}>
            파일 형식 (Format)
          </Typography>
          <ToggleButtonGroup
            size="small"
            value={format}
            exclusive
            onChange={(_, f) => f && setFormat(f)}
            fullWidth
          >
            <ToggleButton value="png">PNG (무손실/투명)</ToggleButton>
            <ToggleButton value="jpeg">JPG (표준 고화질)</ToggleButton>
            <ToggleButton value="webp">WebP (초경량 압축)</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* 해상도 스케일 */}
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, mb: 1, display: 'block' }}>
            해상도 스케일 ({targetW} × {targetH} px)
          </Typography>
          <ToggleButtonGroup
            size="small"
            value={scale}
            exclusive
            onChange={(_, s) => s && setScale(s)}
            fullWidth
          >
            <ToggleButton value={0.5}>0.5x (가벼운 용량)</ToggleButton>
            <ToggleButton value={1}>1.0x (원본 크기)</ToggleButton>
            <ToggleButton value={2}>2.0x (고해상도)</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* 품질 슬라이더 (JPG / WebP) */}
        {format !== 'png' && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                압축 품질 (Quality)
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                {quality}%
              </Typography>
            </Box>
            <Slider
              size="small"
              value={quality}
              min={30}
              max={100}
              onChange={(_, q) => setQuality(q as number)}
            />
          </Box>
        )}

        {/* 버튼 액션 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<DownloadRoundedIcon />}
            onClick={handleDownload}
            disabled={isExporting}
            sx={{ fontWeight: 800, py: 1.2, borderRadius: 2 }}
          >
            {isExporting ? '인코딩 중...' : '이미지 파일로 다운로드'}
          </Button>

          <Button
            variant="outlined"
            size="medium"
            startIcon={<ContentCopyRoundedIcon />}
            onClick={handleCopyToClipboard}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            클립보드에 복사 (Ctrl+V용)
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
