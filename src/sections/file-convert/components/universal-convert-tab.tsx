'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CircularProgress from '@mui/material/CircularProgress';
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import TableViewRoundedIcon from '@mui/icons-material/TableViewRounded';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import CloudQueueRoundedIcon from '@mui/icons-material/CloudQueueRounded';
import AddToDriveRoundedIcon from '@mui/icons-material/AddToDriveRounded';
import AudiotrackRoundedIcon from '@mui/icons-material/AudiotrackRounded';
import DataObjectRoundedIcon from '@mui/icons-material/DataObjectRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import PhotoLibraryRoundedIcon from '@mui/icons-material/PhotoLibraryRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import MovieCreationRoundedIcon from '@mui/icons-material/MovieCreationRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

import { FormatPickerPopover } from './format-picker-popover';
import {
  formatBytes,
  downloadBlob,
  type BatchItem,
  FORMAT_REGISTRY,
  TARGET_META_MAP,
  detectFileFormat,
  convertSingleFile,
  packageBatchToZip,
  getCompatibleTargets,
} from '../utils/universal-converter';

// ----------------------------------------------------------------------

const POPULAR_PRESETS: { from: string; to: string; label: string }[] = [
  { from: 'mp4', to: 'mp3', label: 'MP4 에 MP3' },
  { from: 'png', to: 'webp', label: 'PNG 에 WebP' },
  { from: 'jpg', to: 'png', label: 'JPG 에 PNG' },
  { from: 'xlsx', to: 'csv', label: 'XLSX 에 CSV' },
  { from: 'csv', to: 'xlsx', label: 'CSV 에 XLSX' },
  { from: 'md', to: 'docx', label: 'MD 에 DOCX' },
  { from: 'json', to: 'yaml', label: 'JSON 에 YAML' },
  { from: 'png', to: 'pdf', label: '이미지 에 PDF' },
];

export function UniversalConvertTab() {
  // Convertio Bar State
  const [sourceFormat, setSourceFormat] = useState<string>('mp4');
  const [targetFormat, setTargetFormat] = useState<string>('mp3');

  // Popover State
  const [fromAnchorEl, setFromAnchorEl] = useState<HTMLElement | null>(null);
  const [toAnchorEl, setToAnchorEl] = useState<HTMLElement | null>(null);

  // Batch Queue State
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isConvertingAll, setIsConvertingAll] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Cleanup Object URLs on unmount
  useEffect(
    () => () => {
      items.forEach((item) => {
        if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
      });
    },
    [items]
  );

  // When sourceFormat changes, update targetFormat to compatible target if current is incompatible
  const handleSelectSourceFormat = (newFrom: string) => {
    setSourceFormat(newFrom);
    const compatible = getCompatibleTargets(newFrom);
    if (!compatible.includes(targetFormat.toLowerCase())) {
      setTargetFormat(compatible[0] || 'txt');
    }
  };

  // Add files to batch queue
  const addFilesToQueue = useCallback(
    (files: File[]) => {
      if (files.length === 0) return;

      setItems((prev) => {
        const existingKeys = new Set(prev.map((i) => `${i.name}_${i.size}`));
        const newBatch: BatchItem[] = [];

        files.forEach((file) => {
          const key = `${file.name}_${file.size}`;
          if (!existingKeys.has(key)) {
            existingKeys.add(key);
            const detected = detectFileFormat(file);
            const compatible = getCompatibleTargets(detected);

            // If user's selected target format from the hero bar is compatible, use it!
            const defaultTarget = compatible.includes(targetFormat.toLowerCase())
              ? targetFormat.toLowerCase()
              : compatible[0] || 'txt';

            newBatch.push({
              id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
              file,
              name: file.name,
              size: file.size,
              detectedFormat: detected,
              targetFormat: defaultTarget,
              status: 'pending',
              progress: 0,
            });
          }
        });

        if (newBatch.length === 0) {
          toast.info('이미 목록에 추가된 파일입니다.');
          return prev;
        }

        toast.success(`${newBatch.length}개의 파일이 변환 큐에 추가되었습니다.`);
        return [...prev, ...newBatch];
      });
    },
    [targetFormat]
  );

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      addFilesToQueue(droppedFiles);
    }
  };

  // Trigger native file input
  const handleOpenFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      addFilesToQueue(selected);
      e.target.value = '';
    }
  };

  // Quick sample loader
  const handleLoadSampleFiles = () => {
    // Generate sample text/json/csv/html files in memory
    const sampleCsv = new File(
      [
        'id,name,role,department,score\n1,홍길동,Senior Engineer,Platform,98\n2,김철수,Lead Designer,Design,95\n3,이영희,Product Manager,Product,99',
      ],
      'sample_employees.csv',
      { type: 'text/csv' }
    );

    const sampleJson = new File(
      [
        JSON.stringify(
          {
            project: 'Ultra Office Universal Converter',
            version: '2.0.0',
            features: ['Client-Side Conversion', 'Batch Processing', 'Multi-Format Engine'],
            status: 'Active',
          },
          null,
          2
        ),
      ],
      'sample_config.json',
      { type: 'application/json' }
    );

    const sampleMd = new File(
      [
        '# 만능 파일 변환기\n\n울트라 오피스의 **클라이언트 사이드 파일 일괄 변환기**입니다.\n\n- 비디오 $\\rightarrow$ MP3 / WAV\n- 이미지 포맷 6종 상호 변환\n- 엑셀 / CSV / JSON 데이터 변환\n- 마크다운 DOCX / HTML 내보내기\n',
      ],
      'sample_document.md',
      { type: 'text/markdown' }
    );

    addFilesToQueue([sampleCsv, sampleJson, sampleMd]);
    toast.success('테스트용 샘플 파일 3개가 추가되었습니다.');
  };

  // Convert individual item
  const handleConvertItem = async (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, status: 'converting', progress: 15 } : i))
    );

    try {
      const res = await convertSingleFile(item.file, item.targetFormat, (pct) => {
        setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, progress: pct } : i)));
      });

      const resultUrl = URL.createObjectURL(res.blob);
      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? {
                ...i,
                status: 'done',
                progress: 100,
                resultBlob: res.blob,
                resultFilename: res.filename,
                resultSize: res.blob.size,
                resultUrl,
              }
            : i
        )
      );
      toast.success(`${item.name} 변환이 완료되었습니다.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '변환 중 오류 발생';
      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, status: 'error', errorMessage: message } : i))
      );
      toast.error(`${item.name} 변환 실패: ${message}`);
    }
  };

  // Convert All items
  const handleConvertAll = async () => {
    const pendingItems = items.filter((i) => i.status === 'pending' || i.status === 'error');
    if (pendingItems.length === 0) {
      toast.info('변환 대기 중인 파일이 없습니다.');
      return;
    }

    setIsConvertingAll(true);
    toast.info(`${pendingItems.length}개 파일의 일괄 변환을 시작합니다.`);

    for (const item of pendingItems) {
      // Execute sequentially to prevent freezing on large video/image computations
      await handleConvertItem(item.id);
    }

    setIsConvertingAll(false);
    toast.success('모든 파일의 일괄 변환 작업이 완료되었습니다.');
  };

  // Download all as ZIP
  const handleDownloadAllZip = async () => {
    const doneItems = items.filter((i) => i.status === 'done' && i.resultBlob && i.resultFilename);
    if (doneItems.length === 0) {
      toast.error('완료된 변환 파일이 없습니다. 먼저 변환을 실행해 주세요.');
      return;
    }

    setIsZipping(true);
    try {
      const zipPackage = doneItems.map((it) => ({
        name: it.resultFilename!,
        blob: it.resultBlob!,
      }));

      const zipBlob = await packageBatchToZip(zipPackage);
      downloadBlob(zipBlob, `ultra_converted_${Date.now()}.zip`);
      toast.success(`${doneItems.length}개 파일이 포함된 ZIP 아카이브가 다운로드되었습니다.`);
    } catch {
      toast.error('ZIP 파일 생성 중 오류가 발생했습니다.');
    } finally {
      setIsZipping(false);
    }
  };

  // Remove individual item
  const handleRemoveItem = (itemId: string) => {
    setItems((prev) => {
      const target = prev.find((i) => i.id === itemId);
      if (target?.resultUrl) URL.revokeObjectURL(target.resultUrl);
      return prev.filter((i) => i.id !== itemId);
    });
  };

  // Clear All
  const handleClearAll = () => {
    items.forEach((item) => {
      if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
    });
    setItems([]);
    toast.info('파일 목록을 모두 비웠습니다.');
  };

  // Change individual row target format
  const handleChangeRowTarget = (itemId: string, newTarget: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? {
              ...i,
              targetFormat: newTarget,
              status: 'pending',
              progress: 0,
              resultBlob: undefined,
              resultUrl: undefined,
            }
          : i
      )
    );
  };

  // Helper to render category icon
  const renderCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'video':
        return <MovieCreationRoundedIcon sx={{ fontSize: 24, color: '#EF4444' }} />;
      case 'audio':
        return <AudiotrackRoundedIcon sx={{ fontSize: 24, color: '#F59E0B' }} />;
      case 'image':
        return <PhotoLibraryRoundedIcon sx={{ fontSize: 24, color: '#10B981' }} />;
      case 'sheet':
        return <TableViewRoundedIcon sx={{ fontSize: 24, color: '#16A34A' }} />;
      case 'doc':
        return <DescriptionRoundedIcon sx={{ fontSize: 24, color: '#2563EB' }} />;
      case 'data':
      default:
        return <DataObjectRoundedIcon sx={{ fontSize: 24, color: '#8B5CF6' }} />;
    }
  };

  // Stats
  const totalBytes = items.reduce((acc, it) => acc + it.size, 0);
  const doneCount = items.filter((it) => it.status === 'done').length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />

      {/* ---------------------------------------------------------------------- */}
      {/* 1. Convertio Hero Conversion Bar (1:1 with user's uploaded image) */}
      {/* ---------------------------------------------------------------------- */}
      <Card
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 3,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(30, 32, 38, 0.95) 0%, rgba(20, 22, 28, 0.95) 100%)'
              : 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
          border: (theme) => `1px solid ${theme.palette.divider}`,
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 10px 30px rgba(0,0,0,0.5)'
              : '0 10px 30px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2.5,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            textAlign: 'center',
            letterSpacing: '-0.02em',
          }}
        >
          원하는 포맷을 선택하고 파일을 한 번에 변환하세요
        </Typography>

        {/* The Exact UI Bar From User Screenshot */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: { xs: 1.5, sm: 2.5 },
            py: 1,
          }}
        >
          {/* Red Primary Button: [ 파일 선택  📁 ☁️ 🗄️ ] */}
          <Box
            onClick={handleOpenFileDialog}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              bgcolor: '#EE3840',
              color: '#FFFFFF',
              borderRadius: 2,
              px: { xs: 2.5, sm: 3.5 },
              py: { xs: 1.5, sm: 1.8 },
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(238, 56, 64, 0.35)',
              transition: 'all 0.2s ease',
              userSelect: 'none',
              '&:hover': {
                bgcolor: '#D82B33',
                transform: 'translateY(-1px)',
                boxShadow: '0 8px 24px rgba(238, 56, 64, 0.45)',
              },
              '&:active': {
                transform: 'translateY(1px)',
              },
            }}
          >
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.05rem', sm: '1.25rem' },
                letterSpacing: '-0.01em',
                mr: { xs: 2, sm: 3 },
              }}
            >
              파일 선택
            </Typography>

            {/* Icons Inside Button */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, opacity: 0.9 }}>
              <Tooltip title="내 컴퓨터에서 찾기">
                <FolderOpenRoundedIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </Tooltip>
              <Tooltip title="클라우드 / 샘플 불러오기">
                <CloudQueueRoundedIcon
                  sx={{ fontSize: { xs: 20, sm: 24 } }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLoadSampleFiles();
                  }}
                />
              </Tooltip>
              <Tooltip title="드라이브 / 다중 추가">
                <AddToDriveRoundedIcon
                  sx={{ fontSize: { xs: 19, sm: 23 } }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenFileDialog();
                  }}
                />
              </Tooltip>
            </Box>
          </Box>

          {/* Dark Selector Box: [ MP4 ˅ ] */}
          <Box
            onClick={(e) => setFromAnchorEl(e.currentTarget)}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#18191C' : '#1A1C20'),
              color: '#FFFFFF',
              borderRadius: 2,
              px: { xs: 2.5, sm: 3 },
              py: { xs: 1.2, sm: 1.5 },
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
              transition: 'all 0.2s ease',
              userSelect: 'none',
              minWidth: { xs: 100, sm: 120 },
              '&:hover': {
                bgcolor: '#272A30',
                transform: 'translateY(-1px)',
              },
            }}
          >
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: { xs: '1.3rem', sm: '1.6rem' },
                letterSpacing: '0.04em',
                mr: 1,
              }}
            >
              {sourceFormat.toUpperCase()}
            </Typography>
            <KeyboardArrowDownRoundedIcon sx={{ fontSize: 24, color: 'rgba(255,255,255,0.7)' }} />
          </Box>

          {/* Korean "에" Connector (Meaning "to") */}
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.4rem', sm: '1.7rem' },
              color: (theme) => (theme.palette.mode === 'dark' ? '#FFFFFF' : '#1E293B'),
              userSelect: 'none',
              px: 0.5,
            }}
          >
            에
          </Typography>

          {/* Dark Selector Box: [ MP3 ˅ ] */}
          <Box
            onClick={(e) => setToAnchorEl(e.currentTarget)}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#18191C' : '#1A1C20'),
              color: '#FFFFFF',
              borderRadius: 2,
              px: { xs: 2.5, sm: 3 },
              py: { xs: 1.2, sm: 1.5 },
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
              transition: 'all 0.2s ease',
              userSelect: 'none',
              minWidth: { xs: 100, sm: 120 },
              '&:hover': {
                bgcolor: '#272A30',
                transform: 'translateY(-1px)',
              },
            }}
          >
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: { xs: '1.3rem', sm: '1.6rem' },
                letterSpacing: '0.04em',
                mr: 1,
              }}
            >
              {targetFormat.toUpperCase()}
            </Typography>
            <KeyboardArrowDownRoundedIcon sx={{ fontSize: 24, color: 'rgba(255,255,255,0.7)' }} />
          </Box>
        </Box>

        {/* Quick Conversion Preset Chips */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, mr: 0.5 }}>
            인기 변환:
          </Typography>
          {POPULAR_PRESETS.map((p) => (
            <Chip
              key={p.label}
              label={p.label}
              size="small"
              onClick={() => {
                setSourceFormat(p.from);
                setTargetFormat(p.to);
                toast.info(`${p.label} 변환 모드가 설정되었습니다.`);
              }}
              sx={{
                fontWeight: 600,
                cursor: 'pointer',
                bgcolor:
                  sourceFormat === p.from && targetFormat === p.to
                    ? 'primary.main'
                    : 'action.hover',
                color:
                  sourceFormat === p.from && targetFormat === p.to
                    ? 'primary.contrastText'
                    : 'text.primary',
                '&:hover': {
                  bgcolor:
                    sourceFormat === p.from && targetFormat === p.to
                      ? 'primary.dark'
                      : 'action.selected',
                },
              }}
            />
          ))}
          <Button
            size="small"
            variant="text"
            onClick={handleLoadSampleFiles}
            startIcon={<AutoAwesomeRoundedIcon fontSize="small" />}
            sx={{ fontWeight: 700, ml: 1 }}
          >
            샘플 파일 불러오기
          </Button>
        </Box>
      </Card>

      {/* ---------------------------------------------------------------------- */}
      {/* 2. Drag & Drop Zone */}
      {/* ---------------------------------------------------------------------- */}
      <Box
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleOpenFileDialog}
        sx={{
          border: '2px dashed',
          borderColor: isDragging ? 'primary.main' : 'divider',
          bgcolor: isDragging
            ? (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(59, 130, 246, 0.12)'
                  : 'rgba(59, 130, 246, 0.06)'
            : 'background.paper',
          borderRadius: 2.5,
          p: { xs: 3, md: 4.5 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          textAlign: 'center',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
          },
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: isDragging ? 'primary.main' : 'action.hover',
            color: isDragging ? 'primary.contrastText' : 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            transition: 'all 0.2s ease',
          }}
        >
          <CloudUploadRoundedIcon sx={{ fontSize: 36 }} />
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
          여기에 파일을 드래그하여 놓거나 클릭하여 업로드하세요
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          동영상(MP4·WebM·MOV), 오디오(MP3·WAV), 이미지(PNG·JPG·WebP·GIF·ICO·SVG),
          문서(MD·HTML·HWPX), 엑셀(XLSX·CSV), 데이터(JSON·YAML·XML) 일괄 지원
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Chip label="100% 로컬 변환" size="small" color="success" variant="outlined" />
          <Chip label="서버 전송 없음 (보안 철저)" size="small" color="info" variant="outlined" />
          <Chip label="무제한 다중 파일" size="small" color="primary" variant="outlined" />
        </Box>
      </Box>

      {/* ---------------------------------------------------------------------- */}
      {/* 3. Batch Queue List & Actions */}
      {/* ---------------------------------------------------------------------- */}
      {items.length > 0 && (
        <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: 2.5 }}>
          {/* Action Header */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: 2,
              pb: 2,
              borderBottom: 1,
              borderColor: 'divider',
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                변환 대기열 ({items.length}개)
              </Typography>
              <Chip
                label={`${formatBytes(totalBytes)}`}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
              {doneCount > 0 && (
                <Chip
                  label={`${doneCount}개 완료`}
                  size="small"
                  color="success"
                  sx={{ fontWeight: 700 }}
                />
              )}
            </Box>

            {/* Batch Action Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={
                  isConvertingAll ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <PlayArrowRoundedIcon />
                  )
                }
                onClick={handleConvertAll}
                disabled={isConvertingAll || items.every((i) => i.status === 'done')}
                sx={{ fontWeight: 800, px: 2.5 }}
              >
                {isConvertingAll ? '일괄 변환 중...' : '모든 파일 일괄 변환'}
              </Button>

              {doneCount > 0 && (
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={
                    isZipping ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <ArchiveRoundedIcon />
                    )
                  }
                  onClick={handleDownloadAllZip}
                  disabled={isZipping}
                  sx={{ fontWeight: 800 }}
                >
                  {isZipping ? '압축 중...' : '전체 다운로드 (.ZIP)'}
                </Button>
              )}

              <Button
                variant="outlined"
                startIcon={<AddRoundedIcon />}
                onClick={handleOpenFileDialog}
                disabled={isConvertingAll}
                sx={{ fontWeight: 700 }}
              >
                파일 추가
              </Button>

              <Tooltip title="목록 모두 비우기">
                <IconButton
                  color="error"
                  onClick={handleClearAll}
                  disabled={isConvertingAll}
                  sx={{ border: 1, borderColor: 'divider' }}
                >
                  <DeleteSweepRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Items List */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {items.map((item) => {
              const compatibleTargets = getCompatibleTargets(item.detectedFormat);
              const meta = FORMAT_REGISTRY[item.detectedFormat];
              const category = meta?.category || 'data';

              return (
                <Box
                  key={item.id}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.03)'
                        : 'rgba(0, 0, 0, 0.02)',
                    border: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { xs: 'flex-start', md: 'center' },
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  {/* File Info */}
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 1.5,
                        bgcolor: 'background.paper',
                        border: 1,
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {renderCategoryIcon(category)}
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary', fontWeight: 600 }}
                        >
                          {formatBytes(item.size)}
                        </Typography>
                        <Box
                          sx={{
                            width: 4,
                            height: 4,
                            borderRadius: '50%',
                            bgcolor: 'text.disabled',
                          }}
                        />
                        <Chip
                          label={item.detectedFormat.toUpperCase()}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            bgcolor: meta?.badgeColor || '#64748B',
                            color: '#FFFFFF',
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>

                  {/* Format Selector: [Detected] -> [Target Dropdown] */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                      →
                    </Typography>

                    <Select
                      size="small"
                      value={item.targetFormat}
                      onChange={(e) => handleChangeRowTarget(item.id, e.target.value)}
                      disabled={item.status === 'converting'}
                      sx={{
                        minWidth: 110,
                        height: 38,
                        fontWeight: 800,
                        fontSize: '0.85rem',
                      }}
                    >
                      {compatibleTargets.map((t) => {
                        const targetLabel = TARGET_META_MAP[t]?.label || t.toUpperCase();
                        return (
                          <MenuItem key={t} value={t} sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                            {targetLabel}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </Box>

                  {/* Status Indicator & Progress */}
                  <Box
                    sx={{
                      minWidth: 140,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.5,
                      flexShrink: 0,
                    }}
                  >
                    {item.status === 'pending' && (
                      <Chip
                        label="대기 중"
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 700, color: 'text.secondary' }}
                      />
                    )}
                    {item.status === 'converting' && (
                      <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 700, color: 'primary.main' }}
                          >
                            변환 중...
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>
                            {item.progress}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={item.progress}
                          sx={{ height: 6, borderRadius: 1 }}
                        />
                      </Box>
                    )}
                    {item.status === 'done' && (
                      <Chip
                        icon={<CheckCircleRoundedIcon sx={{ fontSize: 16 }} />}
                        label={`완료 (${formatBytes(item.resultSize)})`}
                        size="small"
                        color="success"
                        sx={{ fontWeight: 700 }}
                      />
                    )}
                    {item.status === 'error' && (
                      <Tooltip title={item.errorMessage || '오류가 발생했습니다.'}>
                        <Chip
                          icon={<ErrorOutlineRoundedIcon sx={{ fontSize: 16 }} />}
                          label="오류 발생"
                          size="small"
                          color="error"
                          sx={{ fontWeight: 700 }}
                        />
                      </Tooltip>
                    )}
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                    {item.status !== 'done' && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleConvertItem(item.id)}
                        disabled={item.status === 'converting'}
                        sx={{ fontWeight: 700, minWidth: 64 }}
                      >
                        변환
                      </Button>
                    )}

                    {item.status === 'done' && item.resultBlob && item.resultFilename && (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<DownloadRoundedIcon />}
                        onClick={() => downloadBlob(item.resultBlob!, item.resultFilename!)}
                        sx={{ fontWeight: 700 }}
                      >
                        다운로드
                      </Button>
                    )}

                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={item.status === 'converting'}
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Card>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* 4. Supported Formats Matrix Info Card */}
      {/* ---------------------------------------------------------------------- */}
      <Card sx={{ p: 3, borderRadius: 2.5, bgcolor: 'background.paper' }}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 800, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <AutoAwesomeRoundedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          지원 가능한 전방위 확장자 변환 매트릭스 (100% Local Engine)
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'action.hover',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#EF4444', mb: 0.5 }}>
              🎬 비디오 & 동영상
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
              <strong>입력:</strong> MP4, WebM, MOV, MKV, AVI, FLV, WMV, TS
              <br />
              <strong>출력:</strong> MP3, WAV, GIF, PNG(첫 프레임), JPG
            </Typography>
          </Box>

          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'action.hover',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#F59E0B', mb: 0.5 }}>
              🎵 오디오 & 사운드
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
              <strong>입력:</strong> MP3, WAV, OGG, WebM, AAC, M4A, FLAC
              <br />
              <strong>출력:</strong> MP3 (192kbps LAME), 16-bit WAV
            </Typography>
          </Box>

          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'action.hover',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#10B981', mb: 0.5 }}>
              🖼️ 이미지 & 그래픽
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
              <strong>입력:</strong> PNG, JPG, WebP, GIF, BMP, SVG, ICO, AVIF
              <br />
              <strong>출력:</strong> PNG, JPG, WebP, BMP, ICO, PDF, ASCII(TXT)
            </Typography>
          </Box>

          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'action.hover',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#16A34A', mb: 0.5 }}>
              📊 스프레드시트 & 테이블
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
              <strong>입력:</strong> XLSX, XLS, CSV, TSV
              <br />
              <strong>출력:</strong> CSV(BOM), XLSX, TSV, JSON, HTML 표
            </Typography>
          </Box>

          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'action.hover',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#2563EB', mb: 0.5 }}>
              📝 문서 & 마크다운
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
              <strong>입력:</strong> Markdown (MD), HTML, HWPX, TXT
              <br />
              <strong>출력:</strong> Word (DOCX 바이너리), HTML, PDF, MD, TXT
            </Typography>
          </Box>

          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'action.hover',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#8B5CF6', mb: 0.5 }}>
              💻 데이터 & 개발자 코드
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
              <strong>입력:</strong> JSON, YAML, XML, SQL
              <br />
              <strong>출력:</strong> JSON, YAML, XML, CSV, TSV, SQL(DDL), TS
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* ---------------------------------------------------------------------- */}
      {/* 5. Popovers for Format Selection */}
      {/* ---------------------------------------------------------------------- */}
      <FormatPickerPopover
        open={Boolean(fromAnchorEl)}
        anchorEl={fromAnchorEl}
        onClose={() => setFromAnchorEl(null)}
        selectedFormat={sourceFormat}
        onSelect={handleSelectSourceFormat}
        mode="from"
        title="원본 포맷 (FROM) 선택"
      />

      <FormatPickerPopover
        open={Boolean(toAnchorEl)}
        anchorEl={toAnchorEl}
        onClose={() => setToAnchorEl(null)}
        selectedFormat={targetFormat}
        onSelect={(t) => setTargetFormat(t)}
        mode="to"
        allowedTargets={getCompatibleTargets(sourceFormat)}
        title={`${sourceFormat.toUpperCase()} 에서 변환 가능한 대상 포맷 (TO)`}
      />
    </Box>
  );
}
