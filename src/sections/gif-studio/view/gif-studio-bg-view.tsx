'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Menu from '@mui/material/Menu';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ColorLensRoundedIcon from '@mui/icons-material/ColorLensRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

import { GifSampleSection } from '../components/gif-sample-section';
import { GifStudioNavHeader } from '../components/gif-studio-nav-header';
import { GIF_SAMPLE_LIST, type GifSampleItem, fetchSampleGifFile } from '../data/gif-samples';
import {
  formatBytes,
  downloadDataUrl,
  getDataUrlByteSize,
  modifyGifBackgroundColor,
} from '../utils/gif-processor';

// ----------------------------------------------------------------------

export function GifStudioBgView() {
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [bgFilePreview, setBgFilePreview] = useState<string>('');
  const [bgMode, setBgMode] = useState<'solid' | 'transparent'>('solid');
  const [targetBgColor, setTargetBgColor] = useState<string>('#ffffff');
  const [chromaKeyColor, setChromaKeyColor] = useState<string>('#ffffff');
  const [bgTolerance, setBgTolerance] = useState<number>(30);
  const [bgResultUrl, setBgResultUrl] = useState<string>('');
  const [isModifyingBg, setIsModifyingBg] = useState<boolean>(false);
  const [bgProgress, setBgProgress] = useState<number>(0);
  const [loadingSampleId, setLoadingSampleId] = useState<string | null>(null);
  const [sampleMenuAnchorEl, setSampleMenuAnchorEl] = useState<null | HTMLElement>(null);

  // Resizable Right Panel
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(380);
  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(380);

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
    const newWidth = Math.max(280, Math.min(680, resizeStartWidthRef.current + deltaX));
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

  const processBgFile = useCallback((file: File) => {
    setBgFile(file);
    setBgResultUrl('');
    const url = URL.createObjectURL(file);
    setBgFilePreview(url);
  }, []);

  const bgDrop = useImageDropPaste({
    onFiles: (files) => {
      const gif = files.find((f) => f.type === 'image/gif' || f.name.endsWith('.gif'));
      if (gif) processBgFile(gif);
      else toast.error('GIF 파일만 업로드할 수 있습니다.');
    },
    disabled: false,
  });

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

  const handleApplyBgColor = async () => {
    if (!bgFile) {
      toast.error('수정할 GIF 파일을 먼저 업로드해주세요.');
      return;
    }
    setIsModifyingBg(true);
    setBgProgress(0);
    toast.info('GIF 배경 색상을 처리하고 있습니다...');

    try {
      const resultUrl = await modifyGifBackgroundColor(
        bgFile,
        bgMode === 'transparent' ? 'transparent' : targetBgColor,
        bgMode === 'transparent' ? chromaKeyColor : undefined,
        bgTolerance,
        (p) => setBgProgress(p)
      );
      setBgResultUrl(resultUrl);
      toast.success('배경 색상 변환이 완료되었습니다!');
    } catch {
      toast.error('배경 수정 중 오류가 발생했습니다.');
    } finally {
      setIsModifyingBg(false);
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
      <GifStudioNavHeader currentTab="bg" />

      <input
        ref={bgInputRef}
        type="file"
        accept="image/gif"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processBgFile(file);
          if (e.target) e.target.value = '';
        }}
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
              배경 수정할 GIF 파일 업로드
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              GIF의 배경색을 새로운 단색으로 교체하거나 특정 색상을 투명하게 처리합니다
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
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                {bgResultUrl ? '배경 변경 결과' : '원본 GIF'}
              </Typography>

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
                <img
                  src={bgResultUrl || bgFilePreview}
                  alt="GIF Background"
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              </Box>
            </Card>
          </Box>

          {/* Desktop Resizing Divider */}
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
            }}
          >
            <Box sx={{ width: '2px', height: '100%', bgcolor: 'divider' }} />
          </Box>

          {/* Right: BG Controls */}
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
              overflowY: 'auto',
              pl: { lg: 1 },
            }}
          >
            <Card
              sx={{ p: 2.5, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                배경 처리 모드
              </Typography>
              <ToggleButtonGroup
                value={bgMode}
                exclusive
                onChange={(_, v) => v && setBgMode(v)}
                fullWidth
                size="small"
              >
                <ToggleButton value="solid">새 단색 배경</ToggleButton>
                <ToggleButton value="transparent">투명화 (크로마키)</ToggleButton>
              </ToggleButtonGroup>

              {bgMode === 'solid' ? (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                    적용할 새 배경색
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <input
                      type="color"
                      value={targetBgColor}
                      onChange={(e) => setTargetBgColor(e.target.value)}
                      style={{
                        width: 50,
                        height: 40,
                        borderRadius: 6,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    />
                    <TextField
                      size="small"
                      fullWidth
                      value={targetBgColor}
                      onChange={(e) => setTargetBgColor(e.target.value)}
                    />
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                    투명하게 제거할 색상
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <input
                      type="color"
                      value={chromaKeyColor}
                      onChange={(e) => setChromaKeyColor(e.target.value)}
                      style={{
                        width: 50,
                        height: 40,
                        borderRadius: 6,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    />
                    <TextField
                      size="small"
                      fullWidth
                      value={chromaKeyColor}
                      onChange={(e) => setChromaKeyColor(e.target.value)}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      색상 허용 오차 (Tolerance)
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {bgTolerance}
                    </Typography>
                  </Box>
                  <Slider
                    size="small"
                    min={0}
                    max={100}
                    value={bgTolerance}
                    onChange={(_, v) => setBgTolerance(v as number)}
                  />
                </Box>
              )}
            </Card>

            {/* Actions */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
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
                sx={{ py: 1.4, borderRadius: 2, fontWeight: 700 }}
              >
                {isModifyingBg ? `처리 중 (${bgProgress}%)` : '배경색 변경 적용하기'}
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
                  GIF 다운로드 ({formatBytes(getDataUrlByteSize(bgResultUrl))})
                </Button>
              )}
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                onClick={(e) => setSampleMenuAnchorEl(e.currentTarget)}
                startIcon={<AutoAwesomeRoundedIcon />}
                sx={{ py: 1.2, borderRadius: 2, fontWeight: 700 }}
              >
                ⚡ 예시 GIF 불러오기
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                onClick={() => bgInputRef.current?.click()}
                startIcon={<CloudUploadRoundedIcon />}
                sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
              >
                새 GIF 파일 불러오기
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* Sample Menu */}
      <Menu
        anchorEl={sampleMenuAnchorEl}
        open={Boolean(sampleMenuAnchorEl)}
        onClose={() => setSampleMenuAnchorEl(null)}
        sx={{
          '& .MuiPaper-root': {
            width: 280,
            maxHeight: 380,
            borderRadius: 2,
            p: 0.5,
          },
        }}
      >
        <Box sx={{ px: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>
            ⚡ 예시 GIF 선택
          </Typography>
        </Box>

        {GIF_SAMPLE_LIST.map((sample) => (
          <MenuItem
            key={sample.id}
            onClick={() => {
              setSampleMenuAnchorEl(null);
              handleSelectBgSample(sample);
            }}
            sx={{ gap: 1.5, py: 1, my: 0.25, borderRadius: 1 }}
          >
            <Box
              component="img"
              src={sample.url}
              alt={sample.label}
              sx={{ width: 38, height: 38, borderRadius: 1, objectFit: 'cover', flexShrink: 0 }}
            />
            <Box sx={{ minWidth: 0, flex: '1 1 auto' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.82rem' }} noWrap>
                {sample.label}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', display: 'block', fontSize: '0.7rem' }}
                noWrap
              >
                {sample.subLabel}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </DashboardContent>
  );
}
