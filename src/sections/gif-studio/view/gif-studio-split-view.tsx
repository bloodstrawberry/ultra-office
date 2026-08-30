'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Menu from '@mui/material/Menu';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded';
import CallSplitRoundedIcon from '@mui/icons-material/CallSplitRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

import { GifSampleSection } from '../components/gif-sample-section';
import { GifStudioNavHeader } from '../components/gif-studio-nav-header';
import { GifBatchEffectModal } from '../components/gif-batch-effect-modal';
import { GIF_SAMPLE_LIST, type GifSampleItem, fetchSampleGifFile } from '../data/gif-samples';
import {
  downloadDataUrl,
  extractGifFrames,
  type GifFrameItem,
  exportFramesToZip,
} from '../utils/gif-processor';

// ----------------------------------------------------------------------

export function GifStudioSplitView() {
  const [splitFile, setSplitFile] = useState<File | null>(null);
  const [splitFrames, setSplitFrames] = useState<GifFrameItem[]>([]);
  const [selectedFrameIds, setSelectedFrameIds] = useState<Set<string>>(new Set());
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [splitPlayerIndex, setSplitPlayerIndex] = useState<number>(0);
  const [isPlayingSplit, setIsPlayingSplit] = useState<boolean>(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false);
  const [loadingSampleId, setLoadingSampleId] = useState<string | null>(null);
  const [sampleMenuAnchorEl, setSampleMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [splitIntervalStep, setSplitIntervalStep] = useState<number>(2);
  const [splitMenuAnchorEl, setSplitMenuAnchorEl] = useState<null | HTMLElement>(null);

  // Resizable Right Panel
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(380);
  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(380);

  const splitInputRef = useRef<HTMLInputElement>(null);

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

  // Active selection for playback and export
  const selectedSplitFrames = splitFrames.filter((f) => selectedFrameIds.has(f.id));

  useEffect(() => {
    if (!isPlayingSplit || selectedSplitFrames.length === 0) return undefined;
    const safeIndex = splitPlayerIndex % selectedSplitFrames.length;
    const currentFrame = selectedSplitFrames[safeIndex];
    const delay = Math.max(20, currentFrame?.delay || 100);
    const timer = setTimeout(() => {
      setSplitPlayerIndex((prev) => (prev + 1) % selectedSplitFrames.length);
    }, delay);
    return () => clearTimeout(timer);
  }, [isPlayingSplit, selectedSplitFrames, splitPlayerIndex]);

  // Stop playback if no frames are selected/active
  useEffect(() => {
    if (selectedSplitFrames.length === 0 && isPlayingSplit) {
      setIsPlayingSplit(false);
    }
  }, [selectedSplitFrames.length, isPlayingSplit]);

  const processSplitFile = useCallback(async (file: File) => {
    setSplitFile(file);
    setIsExtracting(true);
    toast.info('GIF 프레임을 분석하고 분할 추출하는 중입니다...');

    try {
      const res = await extractGifFrames(file);
      setSplitFrames(res.frames);
      setSelectedFrameIds(new Set(res.frames.map((f) => f.id)));
      setSplitPlayerIndex(0);
      toast.success(`총 ${res.frames.length}개 프레임이 추출되었습니다.`);
    } catch {
      toast.error('GIF 프레임 분할에 실패했습니다.');
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const splitDrop = useImageDropPaste({
    onFiles: (files) => {
      const gif = files.find((f) => f.type === 'image/gif' || f.name.endsWith('.gif'));
      if (gif) processSplitFile(gif);
      else toast.error('GIF 파일만 업로드할 수 있습니다.');
    },
    disabled: false,
  });

  const handleSelectSplitSample = async (sample: GifSampleItem) => {
    setLoadingSampleId(sample.id);
    try {
      const file = await fetchSampleGifFile(sample);
      await processSplitFile(file);
      toast.success(`'${sample.label}' 예시 파일을 불러왔습니다.`);
    } catch {
      toast.error('예시 GIF 파일을 불러오지 못했습니다.');
    } finally {
      setLoadingSampleId(null);
    }
  };

  const toggleSelectFrame = (id: string) => {
    setSelectedFrameIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectIntervalSplitFrames = (step: number, offset: number = 0) => {
    if (splitFrames.length === 0 || step < 1) return;
    const newIds = new Set<string>();
    for (let i = offset; i < splitFrames.length; i += step) {
      newIds.add(splitFrames[i].id);
    }
    setSelectedFrameIds(newIds);
    setSplitIntervalStep(step);
    setSplitMenuAnchorEl(null);
    toast.success(`${step}칸 간격으로 ${newIds.size}개 프레임이 선택되었습니다.`);
  };

  const handleSelectAllSplitFrames = () => {
    setSelectedFrameIds(new Set(splitFrames.map((f) => f.id)));
  };

  const handleDeselectAllSplitFrames = () => {
    setSelectedFrameIds(new Set());
    setIsPlayingSplit(false);
  };

  const handleTogglePlaySplit = () => {
    if (!isPlayingSplit) {
      if (selectedSplitFrames.length === 0) {
        toast.warning('재생할 선택 프레임이 없습니다. 프레임을 선택해주세요.');
        return;
      }
      setIsPlayingSplit(true);
    } else {
      setIsPlayingSplit(false);
    }
  };

  const handleExportFramesZip = async () => {
    const framesToExport = splitFrames.filter((f) => selectedFrameIds.has(f.id));
    if (framesToExport.length === 0) {
      toast.error('내보낼 프레임을 1개 이상 선택해주세요.');
      return;
    }

    try {
      await exportFramesToZip(framesToExport, `gif_frames_${Date.now()}.zip`);
      toast.success(`${framesToExport.length}개 프레임 ZIP 다운로드 완료!`);
    } catch {
      toast.error('ZIP 내보내기 중 오류가 발생했습니다.');
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
      <GifStudioNavHeader currentTab="split" />

      <input
        ref={splitInputRef}
        type="file"
        accept="image/gif"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processSplitFile(file);
          if (e.target) e.target.value = '';
        }}
        style={{ display: 'none' }}
      />

      {!splitFile ? (
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
            onSelectSample={handleSelectSplitSample}
            loadingSampleId={loadingSampleId}
            isLoading={isExtracting || !!loadingSampleId}
            title="⚡ 즉석 테스트 예시 GIF 파일"
            subtitle="클릭 한 번으로 3종의 고화질 예시 움짤을 불러와 프레임 분할 및 추출을 테스트해 보세요."
            actionLabel="프레임 분할 ➜"
          />

          <Card
            {...splitDrop.getRootProps({
              onClick: () => splitInputRef.current?.click(),
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
              <CallSplitRoundedIcon sx={{ fontSize: 36 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              분할할 GIF 파일 업로드
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              GIF 애니메이션을 개별 프레임 PNG 이미지로 분해하고 ZIP으로 다운로드합니다
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
              {isExtracting ? '프레임 분석 중...' : 'GIF 파일 선택'}
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
          {/* Left: Frames Grid */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: '1 1 0px',
              minWidth: 0,
              minHeight: 0,
              height: '100%',
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
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1.5,
                  gap: 1,
                  flexShrink: 0,
                }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {splitFile.name} (총 {splitFrames.length}개 프레임)
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    선택됨: {selectedSplitFrames.length} / {splitFrames.length}개
                  </Typography>
                </Box>

                {/* Toolbar Controls */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                  <Button
                    size="small"
                    variant="contained"
                    color="secondary"
                    startIcon={<AutoAwesomeRoundedIcon />}
                    onClick={() => setIsBatchModalOpen(true)}
                    disabled={selectedSplitFrames.length === 0}
                    sx={{ fontWeight: 800 }}
                  >
                    🎨 효과 일괄 적용
                  </Button>
                  <Button
                    size="small"
                    variant={isPlayingSplit ? 'contained' : 'outlined'}
                    color={isPlayingSplit ? 'primary' : 'inherit'}
                    startIcon={isPlayingSplit ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
                    onClick={handleTogglePlaySplit}
                    disabled={selectedSplitFrames.length === 0}
                    sx={{ fontWeight: 700 }}
                  >
                    {isPlayingSplit ? '정지' : '재생'}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleSelectAllSplitFrames}
                    sx={{ fontWeight: 600 }}
                  >
                    전체 선택
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    onClick={handleDeselectAllSplitFrames}
                    sx={{ fontWeight: 600 }}
                  >
                    전체 해제
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    startIcon={<FilterAltRoundedIcon />}
                    endIcon={<KeyboardArrowDownRoundedIcon />}
                    onClick={(e) => setSplitMenuAnchorEl(e.currentTarget)}
                    sx={{ fontWeight: 600 }}
                  >
                    간격 선택
                  </Button>
                  <Menu
                    anchorEl={splitMenuAnchorEl}
                    open={Boolean(splitMenuAnchorEl)}
                    onClose={() => setSplitMenuAnchorEl(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  >
                    <MenuItem onClick={() => handleSelectIntervalSplitFrames(2, 0)}>
                      2칸 간격 (1/2 분할 선택)
                    </MenuItem>
                    <MenuItem onClick={() => handleSelectIntervalSplitFrames(3, 0)}>
                      3칸 간격 (1/3 분할 선택)
                    </MenuItem>
                    <MenuItem onClick={() => handleSelectIntervalSplitFrames(4, 0)}>
                      4칸 간격 (1/4 분할 선택)
                    </MenuItem>
                    <MenuItem onClick={() => handleSelectIntervalSplitFrames(5, 0)}>
                      5칸 간격 (1/5 분할 선택)
                    </MenuItem>
                  </Menu>
                </Box>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: 1.5,
                  flex: '1 1 auto',
                  minHeight: 0,
                  overflowY: 'auto',
                  p: 0.5,
                }}
              >
                {splitFrames.map((frame, idx) => {
                  const isSelected = selectedFrameIds.has(frame.id);
                  const isCurrentPlaying =
                    isPlayingSplit &&
                    selectedSplitFrames.length > 0 &&
                    selectedSplitFrames[splitPlayerIndex % selectedSplitFrames.length]?.id ===
                      frame.id;

                  return (
                    <Card
                      key={frame.id}
                      onClick={() => toggleSelectFrame(frame.id)}
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        cursor: 'pointer',
                        position: 'relative',
                        border: '2px solid',
                        borderColor: isCurrentPlaying
                          ? 'primary.main'
                          : isSelected
                            ? 'primary.light'
                            : 'divider',
                        bgcolor: isSelected ? 'action.selected' : 'background.paper',
                        boxShadow: isCurrentPlaying ? '0 0 12px rgba(32, 101, 209, 0.6)' : 'none',
                        transition: 'all 0.15s ease',
                        flexShrink: 0,
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
                          position: 'relative',
                        }}
                      >
                        <img
                          src={frame.dataUrl}
                          alt={`frame ${idx + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            opacity: isSelected ? 1 : 0.45,
                            transition: 'opacity 0.2s ease',
                          }}
                        />
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 800,
                            color: isSelected ? 'text.primary' : 'text.disabled',
                          }}
                        >
                          #{idx + 1}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadDataUrl(frame.dataUrl, `frame_${idx + 1}.png`);
                          }}
                        >
                          <DownloadRoundedIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Box>
                    </Card>
                  );
                })}
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

          {/* Right: Actions */}
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
            {/* Live Preview Player */}
            <Card
              sx={{
                p: 2,
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  실시간 미리보기 ({selectedSplitFrames.length}프레임)
                </Typography>
                <Button
                  size="small"
                  variant={isPlayingSplit ? 'contained' : 'outlined'}
                  color={isPlayingSplit ? 'primary' : 'inherit'}
                  startIcon={isPlayingSplit ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
                  onClick={handleTogglePlaySplit}
                  disabled={selectedSplitFrames.length === 0}
                  sx={{ py: 0.25, px: 1, fontSize: '0.75rem', fontWeight: 700 }}
                >
                  {isPlayingSplit ? '정지' : '재생'}
                </Button>
              </Box>

              <Box
                sx={{
                  width: '100%',
                  aspectRatio: '1',
                  bgcolor: '#0f172a',
                  borderRadius: 2,
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                {selectedSplitFrames.length > 0 ? (
                  <img
                    src={
                      selectedSplitFrames[splitPlayerIndex % selectedSplitFrames.length]?.dataUrl
                    }
                    alt="split preview"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    선택 및 활성화된 프레임이 없습니다
                  </Typography>
                )}
              </Box>

              {/* Frame Scrubber */}
              {selectedSplitFrames.length > 1 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 0.5 }}>
                  <Slider
                    size="small"
                    value={splitPlayerIndex % selectedSplitFrames.length}
                    min={0}
                    max={selectedSplitFrames.length - 1}
                    step={1}
                    onChange={(_, val) => {
                      setIsPlayingSplit(false);
                      setSplitPlayerIndex(Number(val));
                    }}
                    sx={{ flex: '1 1 auto' }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      minWidth: 45,
                      textAlign: 'right',
                      color: 'text.secondary',
                    }}
                  >
                    {(splitPlayerIndex % selectedSplitFrames.length) + 1} /{' '}
                    {selectedSplitFrames.length}
                  </Typography>
                </Box>
              )}
            </Card>

            {/* Frame Interval Selection Card */}
            <Card
              sx={{
                p: 2.5,
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TuneRoundedIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    간격 선택 (프레임 수 줄이기)
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  {splitFrames.length > 0
                    ? `${selectedFrameIds.size}/${splitFrames.length}개 (${Math.round(
                        (selectedFrameIds.size / splitFrames.length) * 100
                      )}%)`
                    : ''}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.4 }}>
                일정한 간격으로 프레임을 띄워서 선택하여 GIF 용량을 줄이고 프레임 속도를
                최적화합니다.
              </Typography>

              {/* Preset Buttons */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleSelectIntervalSplitFrames(2, 0)}
                  disabled={splitFrames.length === 0}
                  sx={{ py: 0.75, fontSize: '0.75rem', fontWeight: 600 }}
                >
                  2칸 간격 (1/2)
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleSelectIntervalSplitFrames(3, 0)}
                  disabled={splitFrames.length === 0}
                  sx={{ py: 0.75, fontSize: '0.75rem', fontWeight: 600 }}
                >
                  3칸 간격 (1/3)
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleSelectIntervalSplitFrames(4, 0)}
                  disabled={splitFrames.length === 0}
                  sx={{ py: 0.75, fontSize: '0.75rem', fontWeight: 600 }}
                >
                  4칸 간격 (1/4)
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleSelectIntervalSplitFrames(5, 0)}
                  disabled={splitFrames.length === 0}
                  sx={{ py: 0.75, fontSize: '0.75rem', fontWeight: 600 }}
                >
                  5칸 간격 (1/5)
                </Button>
              </Box>

              {/* Custom Interval Slider */}
              {splitFrames.length > 2 && (
                <Box
                  sx={{
                    p: 1.25,
                    bgcolor: 'background.neutral',
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      간격 직접 조절
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      매 {splitIntervalStep}칸 띄워서 선택
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 0.5 }}>
                    <Slider
                      size="small"
                      value={splitIntervalStep}
                      min={1}
                      max={Math.min(20, Math.max(2, Math.floor(splitFrames.length / 2)))}
                      step={1}
                      onChange={(_, val) => {
                        const s = Number(val);
                        setSplitIntervalStep(s);
                        handleSelectIntervalSplitFrames(s, 0);
                      }}
                      sx={{ flex: '1 1 auto' }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        minWidth: 35,
                        textAlign: 'right',
                      }}
                    >
                      {splitIntervalStep}칸
                    </Typography>
                  </Box>
                </Box>
              )}
            </Card>

            {/* Extraction Summary */}
            <Card
              sx={{ p: 2.5, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                프레임 추출 요약
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                선택 및 활성화된 {selectedSplitFrames.length}개의 개별 고해상도 PNG 프레임을 하나의
                압축(ZIP) 파일로 일괄 저장합니다.
              </Typography>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                onClick={() => setIsBatchModalOpen(true)}
                disabled={selectedSplitFrames.length === 0}
                startIcon={<AutoAwesomeRoundedIcon />}
                sx={{ py: 1.4, borderRadius: 2, fontWeight: 800 }}
              >
                🎨 스튜디오 효과 일괄 적용 ({selectedSplitFrames.length}개)
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleExportFramesZip}
                disabled={selectedSplitFrames.length === 0}
                startIcon={<DownloadRoundedIcon />}
                sx={{ py: 1.2, borderRadius: 2, fontWeight: 700 }}
              >
                선택 프레임 ZIP 다운로드 ({selectedSplitFrames.length}개)
              </Button>
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
                onClick={() => splitInputRef.current?.click()}
                startIcon={<CloudUploadRoundedIcon />}
                sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
              >
                새 GIF 파일 불러오기
              </Button>
            </Card>
          </Box>
        </Box>
      )}

      {/* GIF Batch Studio Effect Modal */}
      <GifBatchEffectModal
        open={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        frames={selectedSplitFrames}
      />

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
              handleSelectSplitSample(sample);
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
