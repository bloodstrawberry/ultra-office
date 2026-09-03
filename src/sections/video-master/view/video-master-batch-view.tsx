'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import RadioGroup from '@mui/material/RadioGroup';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import LinearProgress from '@mui/material/LinearProgress';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import FolderZipRoundedIcon from '@mui/icons-material/FolderZipRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import MovieCreationRoundedIcon from '@mui/icons-material/MovieCreationRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

import { DEFAULT_VIDEO_SAMPLES } from '../data/video-samples';
import { formatTime, formatBytes } from '../utils/audio-processor';
import { exportMergedVideoSequentially } from '../utils/video-merge-processor';
import {
  type BatchItem,
  getVideoMetadata,
  packageFilesToZip,
  transcodeSingleVideoToMp4,
  transcodeSingleVideoToMp3,
} from '../utils/video-batch-processor';

// ----------------------------------------------------------------------

type BatchConvertMode = 'batch-mp4' | 'batch-mp3' | 'merge-mp4';

export function VideoMasterBatchView() {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [mode, setMode] = useState<BatchConvertMode>('batch-mp4');
  const [resolution, setResolution] = useState<'original' | '1080p' | '720p'>('1080p');
  const [bitrateKbps, setBitrateKbps] = useState<128 | 192 | 256 | 320>(192);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentProcessingIdx, setCurrentProcessingIdx] = useState<number>(-1);
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const [overallPhase, setOverallPhase] = useState<string>('');

  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [mergedResultUrl, setMergedResultUrl] = useState<string | null>(null);
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Clean up object URLs on unmount
  useEffect(
    () => () => {
      items.forEach((it) => {
        if (it.previewUrl) URL.revokeObjectURL(it.previewUrl);
        if (it.resultUrl) URL.revokeObjectURL(it.resultUrl);
      });
      if (mergedResultUrl) URL.revokeObjectURL(mergedResultUrl);
    },
    [items, mergedResultUrl]
  );

  // Append new files to batch list
  const handleAddFiles = useCallback(async (files: File[]) => {
    const videoFiles = files.filter(
      (f) => f.type.startsWith('video/') || /\.(mp4|webm|mov|mkv|avi|m4v|flv)$/i.test(f.name)
    );

    if (videoFiles.length === 0) {
      toast.error('지원되는 동영상 파일(MP4, WebM, MOV, MKV 등)을 선택해 주세요.');
      return;
    }

    toast.info(`${videoFiles.length}개의 동영상 분석을 시작합니다...`);

    const newItems: BatchItem[] = [];
    for (const f of videoFiles) {
      const pUrl = URL.createObjectURL(f);
      const meta = await getVideoMetadata(f);

      newItems.push({
        id: `${f.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        file: f,
        name: f.name,
        size: f.size,
        duration: meta.duration,
        width: meta.width,
        height: meta.height,
        previewUrl: pUrl,
        status: 'idle',
        progress: 0,
      });
    }

    setItems((prev) => [...prev, ...newItems]);
    toast.success(`${newItems.length}개의 동영상이 대기열에 추가되었습니다.`);
  }, []);

  // Add Preset Samples for Quick Testing
  const handleAddSamples = async () => {
    try {
      toast.info('샘플 비디오 3종을 생성 중입니다...');
      const sampleFiles: File[] = [];
      for (const s of DEFAULT_VIDEO_SAMPLES.slice(0, 3)) {
        const file = await s.generate();
        sampleFiles.push(file);
      }
      await handleAddFiles(sampleFiles);
    } catch {
      toast.error('샘플 비디오 생성에 실패했습니다.');
    }
  };

  // Drag & Drop hook
  const { isDragActive, getRootProps } = useImageDropPaste({
    onFiles: handleAddFiles,
    multiple: true,
    accept: ['video/*', '.mp4', '.webm', '.mov', '.mkv', '.avi', '.m4v', '.flv'],
  });

  const handleDeleteItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((it) => it.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      if (target?.resultUrl) URL.revokeObjectURL(target.resultUrl);
      return prev.filter((it) => it.id !== id);
    });
  };

  const handleClearAll = () => {
    items.forEach((it) => {
      if (it.previewUrl) URL.revokeObjectURL(it.previewUrl);
      if (it.resultUrl) URL.revokeObjectURL(it.resultUrl);
    });
    if (mergedResultUrl) URL.revokeObjectURL(mergedResultUrl);
    setItems([]);
    setMergedResultUrl(null);
    setMergedBlob(null);
    setIsProcessing(false);
    setCurrentProcessingIdx(-1);
    setOverallProgress(0);
  };

  // Start Batch Conversion
  const handleStartBatch = async () => {
    if (items.length === 0) {
      toast.error('변환할 동영상을 먼저 업로드해 주세요.');
      return;
    }

    setIsProcessing(true);
    setOverallProgress(0);
    setMergedResultUrl(null);
    setMergedBlob(null);

    const abortCtrl = new AbortController();
    abortControllerRef.current = abortCtrl;

    try {
      if (mode === 'merge-mp4') {
        // Mode 3: Merge all into one MP4
        setOverallPhase(`전체 ${items.length}개 영상 하나로 병합 인코딩 중...`);
        const mergeClips = items.map((it) => ({
          id: it.id,
          file: it.file,
          name: it.name,
          size: it.size,
          duration: it.duration,
          previewUrl: it.previewUrl,
          width: it.width,
          height: it.height,
        }));

        const resultBlob = await exportMergedVideoSequentially(
          mergeClips,
          {
            resolutionMode:
              resolution === '1080p' ? '1080p' : resolution === '720p' ? '720p' : 'first-clip',
            fitMode: 'contain',
            backgroundColor: '#000000',
            quality: 'high',
          },
          (pct) => {
            setOverallProgress(pct);
          },
          abortCtrl.signal
        );

        const url = URL.createObjectURL(resultBlob);
        setMergedBlob(resultBlob);
        setMergedResultUrl(url);
        setOverallProgress(100);
        setOverallPhase('병합 완료!');
        toast.success('모든 영상이 하나의 MP4로 성공적으로 병합되었습니다!');
      } else {
        // Mode 1 & 2: Batch convert each file
        const total = items.length;

        for (let i = 0; i < total; i += 1) {
          if (abortCtrl.signal.aborted) break;

          const currentItem = items[i];
          setCurrentProcessingIdx(i);
          setOverallPhase(`[${i + 1}/${total}] '${currentItem.name}' 변환 중...`);

          // Update item state to processing
          setItems((prev) =>
            prev.map((it, idx) => (idx === i ? { ...it, status: 'processing', progress: 5 } : it))
          );

          try {
            let res: { blob: Blob; url: string; ext: string };

            if (mode === 'batch-mp4') {
              res = await transcodeSingleVideoToMp4(
                currentItem.file,
                { resolution, quality: 'high' },
                (p) => {
                  setItems((prev) =>
                    prev.map((it, idx) => (idx === i ? { ...it, progress: p } : it))
                  );
                },
                abortCtrl.signal
              );
            } else {
              res = await transcodeSingleVideoToMp3(currentItem.file, bitrateKbps, (p) => {
                setItems((prev) =>
                  prev.map((it, idx) => (idx === i ? { ...it, progress: p } : it))
                );
              });
            }

            const baseName = currentItem.name.replace(/\.[^/.]+$/, '');
            const outName = `${baseName}.${res.ext}`;

            setItems((prev) =>
              prev.map((it, idx) =>
                idx === i
                  ? {
                      ...it,
                      status: 'done',
                      progress: 100,
                      resultBlob: res.blob,
                      resultUrl: res.url,
                      resultName: outName,
                    }
                  : it
              )
            );

            const overallPct = Math.round(((i + 1) / total) * 100);
            setOverallProgress(overallPct);
          } catch (err: unknown) {
            setItems((prev) =>
              prev.map((it, idx) =>
                idx === i
                  ? {
                      ...it,
                      status: 'error',
                      errorMessage: (err as Error)?.message || '변환 실패',
                    }
                  : it
              )
            );
          }
        }

        setOverallPhase('전체 일괄 변환 완료!');
        toast.success(`총 ${total}개의 동영상 일괄 변환이 완료되었습니다!`);
      }
    } catch (err: unknown) {
      if ((err as Error)?.message?.includes('취소')) {
        toast.info('일괄 변환 작업이 취소되었습니다.');
      } else {
        toast.error('일괄 변환 중 오류가 발생했습니다.');
      }
    } finally {
      setIsProcessing(false);
      setCurrentProcessingIdx(-1);
      abortControllerRef.current = null;
    }
  };

  const handleCancelBatch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsProcessing(false);
  };

  // Download single item result
  const handleDownloadItem = (item: BatchItem) => {
    if (!item.resultUrl || !item.resultName) return;
    const link = document.createElement('a');
    link.href = item.resultUrl;
    link.download = item.resultName;
    link.click();
    toast.success(`'${item.resultName}' 다운로드를 시작합니다.`);
  };

  // Bulk ZIP Download
  const handleDownloadAllZip = async () => {
    const doneItems = items.filter((it) => it.status === 'done' && it.resultBlob && it.resultName);
    if (doneItems.length === 0) {
      toast.error('다운로드할 변환 완료 파일이 없습니다.');
      return;
    }

    setIsZipping(true);
    try {
      toast.info('전체 변환 파일을 ZIP으로 압축 중입니다...');
      const zipBlob = await packageFilesToZip(
        doneItems.map((it) => ({ name: it.resultName!, blob: it.resultBlob! }))
      );

      const zipUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = `video_batch_${mode}_${Date.now()}.zip`;
      link.click();
      toast.success('ZIP 압축 파일 다운로드가 완료되었습니다!');
      setTimeout(() => URL.revokeObjectURL(zipUrl), 10000);
    } catch {
      toast.error('ZIP 파일 압축 중 오류가 발생했습니다.');
    } finally {
      setIsZipping(false);
    }
  };

  const doneCount = items.filter((it) => it.status === 'done').length;

  return (
    <DashboardContent
      maxWidth={false}
      {...getRootProps()}
      sx={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minHeight: 0,
        position: 'relative',
        pb: { xs: 2, sm: 2.5 },
      }}
    >
      {/* ─── Drag & Drop Fullscreen Overlay ─── */}
      {isDragActive && (
        <Box
          sx={{
            position: 'absolute',
            inset: 8,
            zIndex: 9999,
            bgcolor: 'rgba(0, 167, 111, 0.15)',
            backdropFilter: 'blur(8px)',
            border: '3px dashed',
            borderColor: 'primary.main',
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            pointerEvents: 'none',
            animation: 'pulse 1.5s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 0.95 },
              '50%': { opacity: 0.7 },
            },
          }}
        >
          <Box
            sx={{
              width: 84,
              height: 84,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: (theme) => theme.customShadows?.z24 || 24,
            }}
          >
            <CloudUploadRoundedIcon sx={{ fontSize: 48 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.darker' }}>
            여러 동영상 파일을 여기에 한 번에 놓아주세요
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            MP4, WebM, MOV, MKV 등 다중 파일을 한꺼번에 드롭하여 일괄 변환할 수 있습니다.
          </Typography>
        </Box>
      )}

      <input
        ref={fileInputRef}
        type="file"
        hidden
        multiple
        accept="video/*,.mp4,.webm,.mov,.mkv,.avi,.m4v"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length > 0) handleAddFiles(files);
          e.target.value = '';
        }}
      />

      {/* ─── 1. Header Navigation Bar ─── */}
      <Box
        sx={{
          mb: 1.5,
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          gap: 1.5,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 1.5,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MovieCreationRoundedIcon />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              동영상 일괄 변환기 (Batch Video Converter)
            </Typography>
            <Chip
              label="다중 파일 동시 업로드 & 일괄 변환"
              size="small"
              color="primary"
              variant="soft"
              sx={{ fontWeight: 700, fontSize: '0.75rem' }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            여러 동영상을 한 번에 올려 각각 표준 MP4 비디오나 MP3 오디오로 일괄 변환하고 ZIP
            압축으로 즉시 다운로드합니다.
          </Typography>
        </Box>
      </Box>

      {/* ─── 2. Main Workspace ─── */}
      <Box
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 340px' },
          gap: 2,
          overflowY: 'auto',
        }}
      >
        {/* ── Left: Video Queue List & Uploader ── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minHeight: 0 }}>
          {/* Top Quick Actions Card */}
          <Card
            sx={{
              p: 2,
              borderRadius: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1.5,
              bgcolor: 'background.neutral',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                변환 대기열 ({items.length}개 파일)
              </Typography>
              {doneCount > 0 && (
                <Chip
                  label={`${doneCount}개 변환 완료`}
                  color="success"
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <Button
                size="small"
                variant="outlined"
                color="primary"
                startIcon={<AutoAwesomeRoundedIcon />}
                onClick={handleAddSamples}
              >
                테스트 샘플 3종 추가
              </Button>

              <Button
                size="small"
                variant="contained"
                color="primary"
                startIcon={<CloudUploadRoundedIcon />}
                onClick={() => fileInputRef.current?.click()}
                sx={{ fontWeight: 700 }}
              >
                동영상 파일 추가하기
              </Button>

              {items.length > 0 && (
                <Button
                  size="small"
                  variant="soft"
                  color="error"
                  startIcon={<DeleteSweepRoundedIcon />}
                  onClick={handleClearAll}
                  disabled={isProcessing}
                >
                  전체 비우기
                </Button>
              )}
            </Box>
          </Card>

          {/* Queue List Table / Empty Dropzone */}
          {items.length === 0 ? (
            <Card
              sx={{
                flex: '1 1 auto',
                minHeight: 320,
                borderRadius: 2,
                border: '2px dashed',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 4,
                cursor: 'pointer',
                transition: 'border-color 0.2s, background-color 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'primary.lighter',
                },
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Box
                sx={{
                  width: 72,
                  height: 72,
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
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                여러 동영상 파일을 드래그하여 놓거나 클릭하여 선택하세요
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', textAlign: 'center', maxWidth: 480 }}
              >
                MP4, WebM, MOV, MKV, AVI 등 형식에 구애받지 않고 여러 개의 동영상을 동시에 대기열에
                추가할 수 있습니다.
              </Typography>
            </Card>
          ) : (
            <Card sx={{ flex: '1 1 auto', minHeight: 0, borderRadius: 2, overflow: 'hidden' }}>
              <TableContainer sx={{ maxHeight: '100%', overflowY: 'auto' }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800 }}>동영상 정보</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>해상도</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>재생 시간</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>파일 용량</TableCell>
                      <TableCell sx={{ fontWeight: 800, minWidth: 160 }}>변환 진행 상태</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800 }}>
                        동작
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((it, idx) => (
                      <TableRow
                        key={it.id}
                        hover
                        sx={{
                          bgcolor:
                            idx === currentProcessingIdx
                              ? 'primary.lighter'
                              : it.status === 'done'
                                ? 'success.lighter'
                                : 'inherit',
                        }}
                      >
                        {/* Video Name & Preview */}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box
                              component="video"
                              src={it.previewUrl}
                              muted
                              sx={{
                                width: 56,
                                height: 36,
                                objectFit: 'cover',
                                borderRadius: 1,
                                bgcolor: '#000',
                                flexShrink: 0,
                              }}
                            />
                            <Box sx={{ minWidth: 0 }}>
                              <Typography
                                variant="subtitle2"
                                noWrap
                                sx={{ fontWeight: 700, maxWidth: 240 }}
                              >
                                {it.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                #{idx + 1}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        {/* Dimensions */}
                        <TableCell>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {it.width}x{it.height}
                          </Typography>
                        </TableCell>

                        {/* Duration */}
                        <TableCell>
                          <Typography
                            variant="caption"
                            sx={{ fontFamily: 'monospace', fontWeight: 700 }}
                          >
                            {formatTime(it.duration)}
                          </Typography>
                        </TableCell>

                        {/* File Size */}
                        <TableCell>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {formatBytes(it.size)}
                          </Typography>
                        </TableCell>

                        {/* Status & Progress */}
                        <TableCell>
                          {it.status === 'idle' && (
                            <Chip
                              label="대기중"
                              size="small"
                              variant="soft"
                              sx={{ fontWeight: 600 }}
                            />
                          )}
                          {it.status === 'processing' && (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography
                                  variant="caption"
                                  sx={{ fontWeight: 700, color: 'primary.main' }}
                                >
                                  변환 중
                                </Typography>
                                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                  {it.progress}%
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={it.progress}
                                sx={{ height: 6, borderRadius: 1 }}
                              />
                            </Box>
                          )}
                          {it.status === 'done' && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                              <CheckCircleRoundedIcon color="success" fontSize="small" />
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 800, color: 'success.main' }}
                              >
                                완료 ({it.resultBlob ? formatBytes(it.resultBlob.size) : ''})
                              </Typography>
                            </Box>
                          )}
                          {it.status === 'error' && (
                            <Typography variant="caption" color="error" sx={{ fontWeight: 700 }}>
                              {it.errorMessage || '오류 발생'}
                            </Typography>
                          )}
                        </TableCell>

                        {/* Action Buttons */}
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                            {it.status === 'done' && it.resultUrl && (
                              <Tooltip title="변환된 파일 다운로드">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleDownloadItem(it)}
                                >
                                  <DownloadRoundedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}

                            <Tooltip title="대기열에서 삭제">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteItem(it.id)}
                                disabled={isProcessing}
                              >
                                <DeleteRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          )}
        </Box>

        {/* ── Right: Batch Control Settings Card ── */}
        <Card
          sx={{
            p: 2.5,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
            height: 'fit-content',
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
              일괄 변환 설정 (Batch Options)
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              선택한 모든 영상을 한 번에 원하는 포맷으로 일괄 변환합니다.
            </Typography>
          </Box>

          {/* Mode Selection */}
          <Box>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: 'text.secondary', mb: 1, display: 'block' }}
            >
              변환 목표 모드
            </Typography>
            <RadioGroup value={mode} onChange={(e) => setMode(e.target.value as BatchConvertMode)}>
              <FormControlLabel
                value="batch-mp4"
                control={<Radio size="small" />}
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      🎬 각각 MP4 비디오로 변환
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      각 영상을 표준 MP4 비디오 파일들로 개별 변환
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="batch-mp3"
                control={<Radio size="small" />}
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      🎵 각각 MP3 오디오로 추출
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      각 영상에서 고음질 MP3 음원을 일괄 추출
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="merge-mp4"
                control={<Radio size="small" />}
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      🎞️ 하나의 MP4로 일괄 합치기
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      모든 영상을 순서대로 이어붙여 1개로 출력
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </Box>

          {/* Settings depending on mode */}
          {mode === 'batch-mp3' ? (
            <FormControl size="small" fullWidth>
              <InputLabel>MP3 비트레이트</InputLabel>
              <Select
                value={bitrateKbps}
                label="MP3 비트레이트"
                onChange={(e) => setBitrateKbps(Number(e.target.value) as 128 | 192 | 256 | 320)}
              >
                <MenuItem value={128}>128 kbps (표준품질)</MenuItem>
                <MenuItem value={192}>192 kbps (고품질 - 추천)</MenuItem>
                <MenuItem value={256}>256 kbps (초고음질)</MenuItem>
                <MenuItem value={320}>320 kbps (스튜디오 최고음질)</MenuItem>
              </Select>
            </FormControl>
          ) : (
            <FormControl size="small" fullWidth>
              <InputLabel>출력 해상도</InputLabel>
              <Select
                value={resolution}
                label="출력 해상도"
                onChange={(e) => setResolution(e.target.value as 'original' | '1080p' | '720p')}
              >
                <MenuItem value="original">원본 해상도 유지</MenuItem>
                <MenuItem value="1080p">FHD 1080p (고화질)</MenuItem>
                <MenuItem value="720p">HD 720p (빠른 인코딩)</MenuItem>
              </Select>
            </FormControl>
          )}

          {/* Action Button & Overall Progress */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {!isProcessing ? (
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<MovieCreationRoundedIcon />}
                onClick={handleStartBatch}
                disabled={items.length === 0}
                sx={{ fontWeight: 800, py: 1.3 }}
              >
                🚀 전체 일괄 변환 시작 ({items.length}개)
              </Button>
            ) : (
              <Button
                variant="outlined"
                color="error"
                size="large"
                onClick={handleCancelBatch}
                sx={{ fontWeight: 800, py: 1.3 }}
              >
                변환 작업 취소
              </Button>
            )}

            {isProcessing && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, mt: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    {overallPhase}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                    {overallProgress}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={overallProgress}
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>
            )}
          </Box>

          {/* Bulk ZIP Download Button */}
          {doneCount > 0 && mode !== 'merge-mp4' && (
            <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
              <Button
                variant="contained"
                color="success"
                fullWidth
                size="large"
                startIcon={
                  isZipping ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <FolderZipRoundedIcon />
                  )
                }
                onClick={handleDownloadAllZip}
                disabled={isZipping}
                sx={{ fontWeight: 800, py: 1.3 }}
              >
                {isZipping
                  ? 'ZIP 파일 압축 중...'
                  : `📦 변환 완료 전체 ZIP 일괄 다운로드 (${doneCount}개)`}
              </Button>
            </Box>
          )}

          {/* Merged Single File Download Button */}
          {mergedResultUrl && mode === 'merge-mp4' && (
            <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
              <Button
                variant="contained"
                color="success"
                fullWidth
                size="large"
                startIcon={<DownloadRoundedIcon />}
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = mergedResultUrl;
                  link.download = `merged_video_${Date.now()}.mp4`;
                  link.click();
                  toast.success('병합된 MP4 파일 다운로드를 시작합니다.');
                }}
                sx={{ fontWeight: 800, py: 1.3 }}
              >
                🎉 병합된 MP4 파일 다운로드 ({mergedBlob ? formatBytes(mergedBlob.size) : ''})
              </Button>
            </Box>
          )}
        </Card>
      </Box>
    </DashboardContent>
  );
}
