'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import LinearProgress from '@mui/material/LinearProgress';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CircularProgress from '@mui/material/CircularProgress';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import AudiotrackRoundedIcon from '@mui/icons-material/AudiotrackRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

import { packageFilesToZip } from '../utils/video-batch-processor';
import { createOceanWaveVideo, createNeonMotionVideo } from '../data/video-samples';
import {
  formatBytes,
  audioBufferToMp3Blob,
  extractAudioBufferFromFile,
} from '../utils/audio-processor';

// ----------------------------------------------------------------------

interface Mp3BatchItem {
  id: string;
  file: File;
  name: string;
  size: number;
  status: 'idle' | 'converting' | 'done' | 'error';
  progress: number;
  resultBlob?: Blob;
  resultUrl?: string;
  errorMessage?: string;
}

// Helper to trigger browser download
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ----------------------------------------------------------------------

export function VideoMasterMp4ToMp3View() {
  const [items, setItems] = useState<Mp3BatchItem[]>([]);
  const [bitrate, setBitrate] = useState<128 | 192 | 256 | 320>(192);
  const [isConvertingAll, setIsConvertingAll] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [isLoadingSamples, setIsLoadingSamples] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Cleanup object URLs on unmount
  useEffect(
    () => () => {
      items.forEach((item) => {
        if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
      });
    },
    [items]
  );

  // Handle adding new files to list
  const handleAddFiles = useCallback((files: File[]) => {
    const videoFiles = files.filter(
      (f) => f.type.startsWith('video/') || /\.(mp4|webm|mov|mkv|avi|m4v|flv|wmv|ts)$/i.test(f.name)
    );

    if (videoFiles.length === 0) {
      toast.error('동영상 파일 (MP4, WebM, MOV, MKV 등)을 업로드해 주세요.');
      return;
    }

    setItems((prev) => {
      const existingNames = new Set(prev.map((i) => `${i.name}_${i.size}`));
      const newItems: Mp3BatchItem[] = [];

      videoFiles.forEach((file) => {
        const key = `${file.name}_${file.size}`;
        if (!existingNames.has(key)) {
          existingNames.add(key);
          newItems.push({
            id: `mp3_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            file,
            name: file.name,
            size: file.size,
            status: 'idle',
            progress: 0,
          });
        }
      });

      if (newItems.length === 0) {
        toast.info('이미 목록에 추가된 동영상입니다.');
        return prev;
      }

      toast.success(`${newItems.length}개의 동영상이 추가되었습니다.`);
      return [...prev, ...newItems];
    });
  }, []);

  // Drag and drop handler
  const { isDragActive, getRootProps } = useImageDropPaste({
    onFiles: handleAddFiles,
    multiple: true,
    accept: ['video/*', '.mp4', '.webm', '.mov', '.mkv', '.avi', '.m4v', '.flv', '.wmv', '.ts'],
  });

  // Remove individual item
  const handleRemoveItem = useCallback((id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.resultUrl) URL.revokeObjectURL(target.resultUrl);
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  // Clear all items
  const handleClearAll = useCallback(() => {
    items.forEach((item) => {
      if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
    });
    setItems([]);
    toast.info('동영상 목록을 모두 비웠습니다.');
  }, [items]);

  // Load sample videos
  const handleLoadSamples = useCallback(async () => {
    setIsLoadingSamples(true);
    try {
      const [f1, f2] = await Promise.all([createNeonMotionVideo(5), createOceanWaveVideo(5)]);
      handleAddFiles([f1, f2]);
    } catch {
      toast.error('샘플 영상을 불러오지 못했습니다.');
    } finally {
      setIsLoadingSamples(false);
    }
  }, [handleAddFiles]);

  // Convert all pending videos to MP3
  const handleConvertAll = useCallback(async () => {
    const pendingItems = items.filter((it) => it.status !== 'done');
    if (pendingItems.length === 0) {
      toast.info('모든 동영상의 MP3 변환이 이미 완료되었습니다.');
      return;
    }

    setIsConvertingAll(true);
    let successCount = 0;

    for (const item of pendingItems) {
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: 'converting', progress: 10 } : it))
      );

      try {
        const fullBuffer = await extractAudioBufferFromFile(item.file);
        const mp3Blob = await audioBufferToMp3Blob(fullBuffer, {
          kbps: bitrate,
          channels: 2,
          volume: 1.0,
          onProgress: (p) => {
            setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, progress: p } : it)));
          },
        });

        const url = URL.createObjectURL(mp3Blob);
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? { ...it, status: 'done', progress: 100, resultBlob: mp3Blob, resultUrl: url }
              : it
          )
        );
        successCount += 1;
      } catch {
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? { ...it, status: 'error', errorMessage: '오디오 트랙 추출 실패' }
              : it
          )
        );
      }
    }

    setIsConvertingAll(false);
    if (successCount > 0) {
      toast.success(`${successCount}개 동영상의 MP3 변환이 완료되었습니다!`);
    } else {
      toast.error('동영상에서 오디오를 추출하지 못했습니다.');
    }
  }, [items, bitrate]);

  // Download single item as MP3
  const handleDownloadSingle = useCallback((item: Mp3BatchItem) => {
    if (!item.resultBlob) return;
    const mp3Name = `${item.name.replace(/\.[^/.]+$/, '')}.mp3`;
    triggerDownload(item.resultBlob, mp3Name);
    toast.success(`'${mp3Name}' 파일을 다운로드했습니다.`);
  }, []);

  // Download all converted items (ZIP if multiple, MP3 if single)
  const handleDownloadAll = useCallback(async () => {
    const doneItems = items.filter((it) => it.status === 'done' && it.resultBlob);
    if (doneItems.length === 0) {
      toast.error('변환 완료된 MP3 파일이 없습니다. 먼저 변환을 시작해 주세요.');
      return;
    }

    if (doneItems.length === 1) {
      handleDownloadSingle(doneItems[0]);
      return;
    }

    setIsZipping(true);
    try {
      const zipBlob = await packageFilesToZip(
        doneItems.map((it) => ({
          name: `${it.name.replace(/\.[^/.]+$/, '')}.mp3`,
          blob: it.resultBlob!,
        }))
      );
      triggerDownload(zipBlob, 'converted_mp3_files.zip');
      toast.success(`전체 ${doneItems.length}개 MP3 파일이 담긴 ZIP 압축 파일을 다운로드했습니다!`);
    } catch {
      toast.error('ZIP 파일 압축 중 오류가 발생했습니다.');
    } finally {
      setIsZipping(false);
    }
  }, [items, handleDownloadSingle]);

  // Counts
  const doneCount = items.filter((it) => it.status === 'done').length;
  const pendingCount = items.length - doneCount;

  return (
    <DashboardContent
      maxWidth={false}
      sx={{
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        pb: { xs: 1.5, sm: 2 },
      }}
    >
      {/* ─── 1. Header (Compact, No Overflow) ─── */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 1.5,
          mb: 1.5,
          flexShrink: 0,
          flexWrap: { xs: 'wrap', md: 'nowrap' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 1.5,
              bgcolor: 'primary.lighter',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AudiotrackRoundedIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                MP4 → MP3 오디오 변환기
              </Typography>
              <Chip
                label="다중 파일 고음질 MP3 추출"
                size="small"
                color="primary"
                variant="soft"
                sx={{ fontWeight: 700, fontSize: '0.72rem', height: 22 }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              여러 동영상을 업로드하면 제목 목록으로 나열되어 고음질 MP3로 일괄 변환 및 전체
              다운로드할 수 있습니다.
            </Typography>
          </Box>
        </Box>

        {/* Header Right Quick Actions */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
          {/* Bitrate Selector */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="mp3-bitrate-label">음질 (kbps)</InputLabel>
            <Select
              labelId="mp3-bitrate-label"
              value={bitrate}
              label="음질 (kbps)"
              onChange={(e) => setBitrate(Number(e.target.value) as 128 | 192 | 256 | 320)}
              disabled={isConvertingAll}
              sx={{ height: 36 }}
            >
              <MenuItem value={128}>128 kbps (기본)</MenuItem>
              <MenuItem value={192}>192 kbps (고음질)</MenuItem>
              <MenuItem value={256}>256 kbps (고품질)</MenuItem>
              <MenuItem value={320}>320 kbps (스튜디오)</MenuItem>
            </Select>
          </FormControl>

          {/* Add Videos Button */}
          <Button
            size="small"
            variant="contained"
            component="label"
            startIcon={<AddRoundedIcon />}
            sx={{ fontWeight: 700, height: 36 }}
          >
            영상 추가
            <input
              ref={fileInputRef}
              type="file"
              hidden
              multiple
              accept="video/*,.mp4,.webm,.mov,.mkv,.avi,.m4v,.flv,.wmv,.ts"
              onChange={(e) => {
                if (e.target.files) {
                  handleAddFiles(Array.from(e.target.files));
                  e.target.value = '';
                }
              }}
            />
          </Button>

          {items.length > 0 && (
            <Button
              size="small"
              variant="soft"
              color="error"
              startIcon={<DeleteSweepRoundedIcon />}
              onClick={handleClearAll}
              disabled={isConvertingAll}
              sx={{ height: 36 }}
            >
              비우기
            </Button>
          )}
        </Box>
      </Box>

      {/* ─── 2. Main Workspace (Full-Height Flex, Zero Global Scroll) ─── */}
      <Box
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          gap: 1.5,
        }}
      >
        {items.length === 0 ? (
          /* ── Empty State: Fills 100% of the Remaining Screen Height ── */
          <Box
            {...getRootProps()}
            sx={{
              flex: '1 1 auto',
              minHeight: 0,
              height: '100%',
              borderRadius: 3,
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'divider',
              bgcolor: isDragActive ? 'action.hover' : 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              p: 3,
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'primary.light',
                bgcolor: 'action.hover',
              },
            }}
          >
            <Box
              sx={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                bgcolor: 'primary.lighter',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <CloudUploadRoundedIcon sx={{ fontSize: 38 }} />
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.75 }}>
              동영상 파일들을 이곳에 끌어다 놓거나 클릭하여 업로드하세요
            </Typography>

            <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 520, mb: 3 }}>
              MP4, WebM, MOV, MKV 등 여러 개의 동영상을 동시에 업로드할 수 있습니다. 100% 브라우저
              메모리에서 안전하게 변환되며 외부 서버로 전송되지 않습니다.
            </Typography>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddRoundedIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                sx={{ fontWeight: 700, px: 3, py: 1 }}
              >
                동영상 파일 선택하기 (다중 선택 가능)
              </Button>

              <Button
                variant="outlined"
                color="inherit"
                startIcon={
                  isLoadingSamples ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <AutoAwesomeRoundedIcon />
                  )
                }
                onClick={(e) => {
                  e.stopPropagation();
                  handleLoadSamples();
                }}
                disabled={isLoadingSamples}
                sx={{ fontWeight: 700, px: 2.5 }}
              >
                샘플 영상 불러오기 (2개)
              </Button>
            </Box>
          </Box>
        ) : (
          /* ── Uploaded List State: Pinned Toolbar + Internal Scroll List + Pinned Bottom Bar ── */
          <>
            {/* 1) Pinned Top Summary Bar */}
            <Card
              sx={{
                p: 1.5,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1.25,
                bgcolor: 'background.neutral',
                border: '1px solid',
                borderColor: 'divider',
                flexShrink: 0,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={`총 ${items.length}개 동영상`}
                  size="small"
                  color="default"
                  variant="filled"
                  sx={{ fontWeight: 700 }}
                />
                <Chip
                  label={`변환 완료 ${doneCount}개`}
                  size="small"
                  color="success"
                  variant={doneCount > 0 ? 'filled' : 'outlined'}
                  sx={{ fontWeight: 700 }}
                />
                {pendingCount > 0 && (
                  <Chip
                    label={`대기 중 ${pendingCount}개`}
                    size="small"
                    color="primary"
                    variant="soft"
                    sx={{ fontWeight: 700 }}
                  />
                )}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  startIcon={
                    isConvertingAll ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : (
                      <GraphicEqRoundedIcon />
                    )
                  }
                  onClick={handleConvertAll}
                  disabled={isConvertingAll || pendingCount === 0}
                  sx={{ fontWeight: 700, height: 32 }}
                >
                  {isConvertingAll ? '변환 중...' : '전체 변환'}
                </Button>

                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  startIcon={
                    isZipping ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : (
                      <DownloadRoundedIcon />
                    )
                  }
                  onClick={handleDownloadAll}
                  disabled={doneCount === 0 || isZipping || isConvertingAll}
                  sx={{ fontWeight: 700, height: 32 }}
                >
                  {isZipping
                    ? '압축 중...'
                    : doneCount > 1
                      ? `전체 다운로드 (${doneCount}개 ZIP)`
                      : 'MP3 다운로드'}
                </Button>
              </Box>
            </Card>

            {/* 2) Middle Scrollable Item List (Only this section scrolls if items exceed screen) */}
            <Box
              sx={{
                flex: '1 1 auto',
                minHeight: 0,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.25,
                pr: 0.5,
              }}
            >
              {items.map((item, index) => (
                <Card
                  key={item.id}
                  sx={{
                    py: 1.25,
                    px: 2,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: { xs: 'wrap', sm: 'nowrap' },
                    gap: 1.5,
                    border: '1px solid',
                    borderColor:
                      item.status === 'done'
                        ? 'success.light'
                        : item.status === 'error'
                          ? 'error.light'
                          : 'divider',
                    bgcolor:
                      item.status === 'done'
                        ? 'success.lighter'
                        : item.status === 'error'
                          ? 'error.lighter'
                          : 'background.paper',
                    transition: 'all 0.15s ease-in-out',
                    flexShrink: 0,
                  }}
                >
                  {/* Left: Icon, Number & Video Title */}
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1 }}
                  >
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: 1.5,
                        bgcolor: item.status === 'done' ? 'success.main' : 'primary.lighter',
                        color: item.status === 'done' ? '#fff' : 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <AudiotrackRoundedIcon fontSize="small" />
                    </Box>

                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: 'text.primary',
                        }}
                        title={item.name}
                      >
                        {index + 1}. {item.name}
                      </Typography>

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          mt: 0.25,
                          flexWrap: 'wrap',
                        }}
                      >
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          원본: {formatBytes(item.size)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                          →
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: 'primary.main', fontWeight: 600 }}
                        >
                          {item.name.replace(/\.[^/.]+$/, '')}.mp3
                        </Typography>
                        {item.resultBlob && (
                          <Chip
                            size="small"
                            label={`MP3 ${formatBytes(item.resultBlob.size)}`}
                            color="success"
                            variant="soft"
                            sx={{ height: 18, fontSize: '0.68rem', fontWeight: 700 }}
                          />
                        )}
                      </Box>

                      {/* Progress Bar during conversion */}
                      {item.status === 'converting' && (
                        <Box sx={{ mt: 0.75, width: '100%', maxWidth: 320 }}>
                          <LinearProgress
                            variant="determinate"
                            value={item.progress}
                            sx={{ height: 4, borderRadius: 2 }}
                          />
                        </Box>
                      )}
                    </Box>
                  </Box>

                  {/* Right: Status Badge & Individual Download Button */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      flexShrink: 0,
                      width: { xs: '100%', sm: 'auto' },
                      justifyContent: { xs: 'flex-end', sm: 'flex-end' },
                    }}
                  >
                    {item.status === 'idle' && (
                      <Chip
                        label="대기 중"
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600, fontSize: '0.72rem', height: 24 }}
                      />
                    )}
                    {item.status === 'converting' && (
                      <Chip
                        label={`인코딩 ${item.progress}%`}
                        size="small"
                        color="primary"
                        icon={<CircularProgress size={12} color="inherit" />}
                        sx={{ fontWeight: 700, fontSize: '0.72rem', height: 24 }}
                      />
                    )}
                    {item.status === 'done' && (
                      <Chip
                        label="완료"
                        size="small"
                        color="success"
                        icon={<CheckCircleRoundedIcon fontSize="small" />}
                        sx={{ fontWeight: 700, fontSize: '0.72rem', height: 24 }}
                      />
                    )}
                    {item.status === 'error' && (
                      <Chip
                        label={item.errorMessage || '오류'}
                        size="small"
                        color="error"
                        sx={{ fontWeight: 700, fontSize: '0.72rem', height: 24 }}
                      />
                    )}

                    {/* Individual Download Button */}
                    {item.status === 'done' && (
                      <Button
                        size="small"
                        variant="soft"
                        color="primary"
                        startIcon={<DownloadRoundedIcon />}
                        onClick={() => handleDownloadSingle(item)}
                        sx={{ fontWeight: 700, height: 28, fontSize: '0.75rem' }}
                      >
                        MP3 받기
                      </Button>
                    )}

                    {/* Remove Item */}
                    <IconButton
                      size="small"
                      color="inherit"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={item.status === 'converting'}
                      title="목록에서 제거"
                      sx={{ width: 28, height: 28 }}
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Card>
              ))}
            </Box>

            {/* 3) Pinned Bottom Action Bar (Fixed at bottom of workspace, no scrolling needed) */}
            <Card
              sx={{
                p: 1.5,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1.5,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                flexShrink: 0,
              }}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                💡 총 <strong>{items.length}개</strong>의 영상 중 <strong>{doneCount}개</strong>{' '}
                변환 완료되었습니다. &apos;전체 MP3 다운로드&apos;로 모든 음원 파일을 한 번에 받으실
                수 있습니다.
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  startIcon={<AddRoundedIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ fontWeight: 700, height: 34 }}
                >
                  영상 더 추가
                </Button>

                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  startIcon={
                    isZipping ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : (
                      <DownloadRoundedIcon />
                    )
                  }
                  onClick={handleDownloadAll}
                  disabled={doneCount === 0 || isZipping || isConvertingAll}
                  sx={{ fontWeight: 800, px: 2, height: 34 }}
                >
                  {isZipping
                    ? 'ZIP 압축 중...'
                    : doneCount > 1
                      ? `전체 ${doneCount}개 MP3 일괄 다운로드 (ZIP)`
                      : 'MP3 다운로드'}
                </Button>
              </Box>
            </Card>
          </>
        )}
      </Box>
    </DashboardContent>
  );
}
