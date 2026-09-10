'use client';

import type { NonogramPreset } from '../utils/nonogram-solver';
import type { NonogramImageProcessingOptions } from '../utils/nonogram-image-utils';

import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import LinearProgress from '@mui/material/LinearProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ContentPasteRoundedIcon from '@mui/icons-material/ContentPasteRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CheckBoxOutlineBlankRoundedIcon from '@mui/icons-material/CheckBoxOutlineBlankRounded';

import { toast } from 'src/components/snackbar';

import { generateClues, createCustomNonogramPreset } from '../utils/nonogram-solver';
import {
  parseNonogramMatrixFromText,
  processImageToNonogramMatrix,
  DEFAULT_NONOGRAM_IMAGE_OPTIONS,
} from '../utils/nonogram-image-utils';

const SAMPLE_TEXT_10X10 = `0,0,1,1,1,0,0,0,0,0
0,1,1,0,1,1,0,0,0,0
1,1,1,1,1,1,0,0,0,0
0,1,1,1,1,0,0,0,0,0
0,0,1,1,1,1,1,1,1,0
0,1,1,1,1,1,1,1,1,1
1,1,1,1,1,1,1,1,1,0
0,1,1,1,1,1,1,1,0,0
0,0,0,1,1,1,1,0,0,0
0,0,1,1,0,0,1,1,0,0`;

const SAMPLE_ASCII_ART = `..#.#..
.#####.
.#####.
..###..
...#...`;

interface NonogramImageUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onApplyPreset: (preset: NonogramPreset) => void;
}

export function NonogramImageUploadDialog({
  open,
  onClose,
  onApplyPreset,
}: NonogramImageUploadDialogProps) {
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [presetName, setPresetName] = useState<string>('커스텀 도안');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [rawText, setRawText] = useState<string>('');

  // Image Processing Options
  const [imageOptions, setImageOptions] = useState<NonogramImageProcessingOptions>(
    DEFAULT_NONOGRAM_IMAGE_OPTIONS
  );

  // Active matrix state (0 or 1)
  const [matrix, setMatrix] = useState<number[][]>(() =>
    Array.from({ length: 10 }, () => Array(10).fill(0))
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Calculate clues for the current matrix
  const { rowClues, colClues } = useMemo(() => {
    if (matrix.length === 0 || matrix[0].length === 0) {
      return { rowClues: [], colClues: [] };
    }
    return generateClues(matrix);
  }, [matrix]);

  const filledCount = useMemo(() => matrix.flat().filter((v) => v === 1).length, [matrix]);

  const totalCells = matrix.length * (matrix[0]?.length || 0);

  // Dynamic cell sizing so grids (5x5 ~ 20x20) fit nicely in preview panel
  const cellSize = useMemo(() => {
    const maxDim = Math.max(matrix.length, matrix[0]?.length || 10);
    if (maxDim >= 20) return 16;
    if (maxDim >= 15) return 20;
    if (maxDim >= 10) return 24;
    return 28;
  }, [matrix]);

  const clueBoxWidth = useMemo(() => {
    const maxRowCluesLen = rowClues.length > 0 ? Math.max(...rowClues.map((c) => c.length)) : 1;
    return Math.max(38, maxRowCluesLen * 14 + 10);
  }, [rowClues]);

  const maxColCluesLen = useMemo(
    () => (colClues.length > 0 ? Math.max(...colClues.map((c) => c.length)) : 1),
    [colClues]
  );
  const clueBoxHeight = useMemo(() => Math.max(38, maxColCluesLen * 16 + 6), [maxColCluesLen]);

  const resetState = useCallback(() => {
    setSelectedFile(null);
    setImagePreviewUrl(null);
    setIsProcessing(false);
    setIsDragging(false);
    setRawText('');
    setImageOptions(DEFAULT_NONOGRAM_IMAGE_OPTIONS);
    setMatrix(Array.from({ length: 10 }, () => Array(10).fill(0)));
    setPresetName('커스텀 도안');
  }, []);

  const handleClose = useCallback(() => {
    if (isProcessing) return;
    resetState();
    onClose();
  }, [isProcessing, onClose, resetState]);

  // Run image conversion
  const runConversion = useCallback(
    async (source: File | string, customOptions?: NonogramImageProcessingOptions) => {
      setIsProcessing(true);
      try {
        const opts = customOptions || imageOptions;
        const { matrix: resMatrix } = await processImageToNonogramMatrix(source, opts);
        setMatrix(resMatrix);
        toast.success(
          `이미지 픽셀화 완료! (${opts.width}x${opts.height} 도안, ${resMatrix.flat().filter((v) => v === 1).length}칸 채움)`,
          { id: 'nonogram-convert' }
        );
      } catch (err) {
        console.error(err);
        toast.error('이미지 변환 중 오류가 발생했습니다.', { id: 'nonogram-convert' });
      } finally {
        setIsProcessing(false);
      }
    },
    [imageOptions]
  );

  const handleFileSelect = useCallback(
    (file: File) => {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
      const cleanName = file.name.replace(/\.[^/.]+$/, '').slice(0, 15);
      setPresetName(cleanName || '사진 도안');
      runConversion(file);
    },
    [runConversion]
  );

  // Remove uploaded image
  const handleRemoveImage = useCallback(() => {
    setSelectedFile(null);
    setImagePreviewUrl(null);
    setMatrix(Array.from({ length: imageOptions.height }, () => Array(imageOptions.width).fill(0)));
    setPresetName('커스텀 도안');
    toast.info('업로드된 사진을 제거했습니다.', { id: 'nonogram-remove-image' });
  }, [imageOptions.height, imageOptions.width]);

  // Generate a built-in canvas sample image
  const handleLoadSampleCanvas = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw a star/heart sample pattern
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 120, 120);

    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(42, 45, 26, 0, Math.PI * 2);
    ctx.arc(78, 45, 26, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(20, 56);
    ctx.lineTo(60, 105);
    ctx.lineTo(100, 56);
    ctx.closePath();
    ctx.fill();

    const dataUrl = canvas.toDataURL();
    setImagePreviewUrl(dataUrl);
    setSelectedFile(null);
    setPresetName('샘플 하트');
    runConversion(dataUrl);
  }, [runConversion]);

  // Handle option updates and re-convert if an image is loaded
  const handleOptionChange = useCallback(
    (partial: Partial<NonogramImageProcessingOptions>) => {
      const nextOpts = { ...imageOptions, ...partial };
      setImageOptions(nextOpts);
      if (selectedFile) {
        runConversion(selectedFile, nextOpts);
      } else if (imagePreviewUrl) {
        runConversion(imagePreviewUrl, nextOpts);
      } else {
        // Just resize current empty matrix
        setMatrix(Array.from({ length: nextOpts.height }, () => Array(nextOpts.width).fill(0)));
      }
    },
    [imageOptions, imagePreviewUrl, runConversion, selectedFile]
  );

  // Text input parsing
  const handleRawTextChange = useCallback((val: string) => {
    setRawText(val);
    if (!val.trim()) return;
    const parsed = parseNonogramMatrixFromText(val);
    if (parsed) {
      setMatrix(parsed);
      setImageOptions((prev) => ({
        ...prev,
        width: parsed[0].length,
        height: parsed.length,
      }));
    }
  }, []);

  // Cell click toggle on the preview matrix
  const handleToggleCell = useCallback((r: number, c: number) => {
    setMatrix((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = next[r][c] === 1 ? 0 : 1;
      return next;
    });
  }, []);

  // Clear or invert entire matrix
  const handleClearMatrix = useCallback(() => {
    setMatrix((prev) => Array.from({ length: prev.length }, () => Array(prev[0].length).fill(0)));
    toast.info('도안을 모두 비웠습니다.', { id: 'nonogram-edit' });
  }, []);

  const handleInvertMatrix = useCallback(() => {
    setMatrix((prev) => prev.map((row) => row.map((v) => (v === 1 ? 0 : 1))));
    toast.info('도안의 흑백을 반전했습니다.', { id: 'nonogram-edit' });
  }, []);

  // Apply to main Nonogram
  const handleApply = useCallback(() => {
    if (filledCount === 0) {
      toast.warning('칠해진 칸이 없습니다. 이미지나 텍스트를 입력하거나 셀을 칠해주세요.', {
        id: 'nonogram-apply',
      });
      return;
    }

    const customPreset = createCustomNonogramPreset(presetName.trim() || '커스텀 도안', matrix);
    onApplyPreset(customPreset);
    handleClose();
    toast.success(`[${customPreset.name}] 도안이 성공적으로 적용되었습니다!`, {
      id: 'nonogram-apply',
    });
  }, [filledCount, handleClose, matrix, onApplyPreset, presetName]);

  // Global clipboard paste listener (Ctrl + V)
  useEffect(() => {
    if (!open) return undefined;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            setTabIndex(0);
            handleFileSelect(file);
            toast.info('📋 클립보드 이미지를 감지하여 픽셀 변환을 시작합니다.', {
              id: 'nonogram-paste',
            });
            return;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleFileSelect, open]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2,
          height: { xs: 'auto', md: 850 },
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <DialogTitle
        sx={{
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
          fontWeight: 800,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeRoundedIcon color="primary" />
          <Typography component="span" sx={{ fontSize: '1.2rem', fontWeight: 800 }}>
            네모네모 로직 도안 불러오기 (이미지 픽셀 변환 / 텍스트 입력)
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          💡 Drag & Drop · Ctrl+V 붙여넣기 · 실시간 힌트 자동 계산 & 픽셀 에디터
        </Typography>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3,
          p: 2.5,
          overflow: 'hidden',
        }}
      >
        {/* Left Column: Image or Text Input */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            minWidth: 0,
            height: '100%',
            overflowY: 'auto',
            pr: { md: 0.5 },
          }}
        >
          <Tabs
            value={tabIndex}
            onChange={(_, val) => setTabIndex(val)}
            sx={{ borderBottom: 1, borderColor: 'divider', minHeight: 44, flexShrink: 0 }}
          >
            <Tab
              icon={<CloudUploadRoundedIcon />}
              iconPosition="start"
              label="📷 이미지 픽셀화 변환 (드래그 & 드롭 / Ctrl+V)"
              sx={{ minHeight: 44, fontSize: '0.875rem' }}
            />
            <Tab
              icon={<ContentPasteRoundedIcon />}
              iconPosition="start"
              label="📝 2D 배열 · 아스키 텍스트 입력"
              sx={{ minHeight: 44, fontSize: '0.875rem' }}
            />
          </Tabs>

          {/* Tab 0: Image Upload & Parameters */}
          {tabIndex === 0 && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                flex: 1,
                minHeight: 0,
              }}
            >
              {/* Drop Zone (Fills height, NO outer onClick to prevent accidental file dialog) */}
              <Box
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(true);
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file && file.type.startsWith('image/')) {
                    handleFileSelect(file);
                  } else {
                    toast.error('이미지 파일(PNG, JPG, WebP 등)을 올려주세요.');
                  }
                }}
                sx={{
                  flex: 1,
                  minHeight: { xs: 280, md: 460 },
                  border: '2px dashed',
                  borderColor: isDragging ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  p: imagePreviewUrl ? 1.5 : 2.5,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  bgcolor: isDragging ? 'action.hover' : 'background.neutral',
                  transition: 'all 0.2s ease-in-out',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    borderColor: 'primary.main',
                  },
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                    e.target.value = '';
                  }}
                  disabled={isProcessing}
                  tabIndex={-1}
                  style={{ display: 'none' }}
                />

                {imagePreviewUrl ? (
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: 2,
                      alignItems: 'stretch',
                      minHeight: 0,
                    }}
                  >
                    {/* Left: Uploaded Image Preview */}
                    <Box
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        minHeight: { xs: 200, sm: 320 },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        bgcolor: (theme) =>
                          theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.25)' : 'grey.200',
                        borderRadius: 1.5,
                        overflow: 'hidden',
                        p: 1,
                      }}
                    >
                      <Box
                        component="img"
                        src={imagePreviewUrl}
                        alt="Source Image"
                        sx={{
                          maxHeight: '100%',
                          maxWidth: '100%',
                          objectFit: 'contain',
                          borderRadius: 1,
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 8,
                          bgcolor: 'rgba(0, 0, 0, 0.72)',
                          color: 'common.white',
                          px: 1.2,
                          py: 0.4,
                          borderRadius: 1,
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          backdropFilter: 'blur(4px)',
                          pointerEvents: 'none',
                        }}
                      >
                        📷 이미지 변경: 드래그 또는 Ctrl+V
                      </Box>
                    </Box>

                    {/* Right: Parameter Controls */}
                    <Box
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: 1.5,
                        p: 2,
                        borderRadius: 1.5,
                        bgcolor: (theme) =>
                          theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.03)'
                            : 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        overflowY: 'auto',
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        ⚙️ 도안 변환 옵션 조절
                      </Typography>

                      {/* Grid Size Selection */}
                      <FormControl size="small" fullWidth>
                        <TextField
                          select
                          label="격자 크기 (해상도)"
                          value={`${imageOptions.width}x${imageOptions.height}`}
                          onChange={(e) => {
                            const [w, h] = e.target.value.split('x').map(Number);
                            handleOptionChange({ width: w, height: h });
                          }}
                          size="small"
                        >
                          <MenuItem value="5x5">5 x 5 (입문용 초간단)</MenuItem>
                          <MenuItem value="10x10">10 x 10 (표준 기본형)</MenuItem>
                          <MenuItem value="15x15">15 x 15 (정밀 픽셀 아트)</MenuItem>
                          <MenuItem value="20x20">20 x 20 (대형 고화질)</MenuItem>
                        </TextField>
                      </FormControl>

                      {/* Threshold Slider */}
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            명암 임계값 (Threshold)
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 700, color: 'primary.main' }}
                          >
                            {imageOptions.threshold}
                          </Typography>
                        </Box>
                        <Slider
                          size="small"
                          value={imageOptions.threshold}
                          min={30}
                          max={225}
                          onChange={(_, val) => handleOptionChange({ threshold: val as number })}
                        />
                      </Box>

                      {/* Contrast Slider */}
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            대비 강화 (Contrast)
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 700, color: 'primary.main' }}
                          >
                            {imageOptions.contrast > 0
                              ? `+${imageOptions.contrast}`
                              : imageOptions.contrast}
                          </Typography>
                        </Box>
                        <Slider
                          size="small"
                          value={imageOptions.contrast}
                          min={-50}
                          max={80}
                          onChange={(_, val) => handleOptionChange({ contrast: val as number })}
                        />
                      </Box>

                      {/* Invert Switch */}
                      <FormControlLabel
                        control={
                          <Switch
                            checked={imageOptions.invert}
                            onChange={(e) => handleOptionChange({ invert: e.target.checked })}
                            size="small"
                          />
                        }
                        label={
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            흑백 반전 (밝은 영역 칠하기)
                          </Typography>
                        }
                      />

                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<DeleteOutlineRoundedIcon />}
                        onClick={handleRemoveImage}
                        sx={{ alignSelf: 'flex-start', mt: 0.5 }}
                      >
                        사진 제거
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <>
                    <CloudUploadRoundedIcon
                      sx={{
                        fontSize: 64,
                        color: isDragging ? 'primary.main' : 'text.secondary',
                        transition: 'transform 0.2s',
                        transform: isDragging ? 'scale(1.1)' : 'scale(1)',
                      }}
                    />
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                        네모네모 로직 도안 이미지를 여기에 드래그하거나 붙여넣으세요
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        PNG, JPG, WEBP 지원 · 단축키: 어디서든 <b>Ctrl + V</b> 로 캡처 이미지 즉시
                        붙여넣기
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<CloudUploadRoundedIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      disabled={isProcessing}
                    >
                      PC에서 파일 선택
                    </Button>
                  </>
                )}
              </Box>

              {/* Action Buttons Bar */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CloudUploadRoundedIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                >
                  이미지 파일 선택
                </Button>

                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  onClick={handleLoadSampleCanvas}
                  disabled={isProcessing}
                  startIcon={<AutoAwesomeRoundedIcon />}
                >
                  💡 샘플 도안 이미지로 바로 테스트
                </Button>

                {(selectedFile || imagePreviewUrl) && !isProcessing && (
                  <>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<RefreshRoundedIcon />}
                      onClick={() => runConversion(selectedFile || imagePreviewUrl!)}
                    >
                      픽셀 변환 다시 실행
                    </Button>

                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<DeleteOutlineRoundedIcon />}
                      onClick={handleRemoveImage}
                    >
                      사진 제거
                    </Button>
                  </>
                )}
              </Box>

              {isProcessing && (
                <Box sx={{ width: '100%' }}>
                  <LinearProgress sx={{ height: 4, borderRadius: 1 }} />
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      mt: 0.5,
                      display: 'block',
                      textAlign: 'center',
                    }}
                  >
                    이미지를 픽셀 단위로 분석하여 도안을 생성하는 중...
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Tab 1: Text / Matrix Input */}
          {tabIndex === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1, minHeight: 0 }}>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', lineHeight: 1.6, flexShrink: 0 }}
              >
                💡 <b>0과 1의 CSV</b>, <code>#</code>과 <code>.</code>의 <b>아스키 아트</b>, 또는{' '}
                <code>[[0,1],[1,0]]</code> <b>2D JSON 배열</b>을 입력하면 우측 미리보기 판에 실시간
                반영됩니다!
              </Typography>

              {/* Quick sample helper buttons */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', flexShrink: 0 }}>
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  onClick={() => handleRawTextChange(SAMPLE_TEXT_10X10)}
                >
                  예시: 10x10 오리
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="secondary"
                  onClick={() => handleRawTextChange(SAMPLE_ASCII_ART)}
                >
                  예시: 7x5 하트
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  startIcon={<DeleteOutlineRoundedIcon />}
                  onClick={() => handleRawTextChange('')}
                >
                  텍스트 지우기
                </Button>
              </Box>

              <TextField
                multiline
                placeholder={`[입력 예시 1: 0과 1 CSV]\n0, 0, 1, 1, 1, 0, 0, 0, 0, 0\n0, 1, 1, 0, 1, 1, 0, 0, 0, 0\n...\n\n[입력 예시 2: #과 . 아스키 아트]\n..#.#..\n.#####.\n.#####.\n..###..\n...#...\n\n[입력 예시 3: 2D 배열]\n[[0,1,0],[1,1,1]]`}
                value={rawText}
                onChange={(e) => handleRawTextChange(e.target.value)}
                fullWidth
                size="small"
                sx={{
                  flex: 1,
                  minHeight: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  '& .MuiInputBase-root': {
                    flex: 1,
                    height: '100%',
                    alignItems: 'flex-start',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                  },
                  '& .MuiInputBase-input': {
                    height: '100% !important',
                    overflowY: 'auto !important',
                  },
                }}
              />
            </Box>
          )}
        </Box>

        {/* Vertical Divider */}
        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

        {/* Right Column: Live Interactive Nonogram Board Preview & Clues */}
        <Box
          sx={{
            width: { xs: '100%', md: 400, lg: 430 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1.5,
            flexShrink: 0,
            p: 2,
            bgcolor: 'background.neutral',
            borderRadius: 2,
            overflowY: 'auto',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              px: 0.5,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              실시간 도안 미리보기
            </Typography>
            <Chip
              size="small"
              variant="outlined"
              color={filledCount > 0 ? 'primary' : 'default'}
              label={`칠한 칸 ${filledCount}/${totalCells} (${
                totalCells > 0 ? Math.round((filledCount / totalCells) * 100) : 0
              }%)`}
            />
          </Box>

          {/* Preset Name Input */}
          <TextField
            size="small"
            fullWidth
            label="도안 제목 (이름)"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 1,
            }}
          />

          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', textAlign: 'center', px: 1 }}
          >
            🖱️ 셀 클릭: <b>칸 칠하기/지우기</b> · 상단/좌측에 실시간 힌트가 자동 계산됩니다
          </Typography>

          {/* Interactive Nonogram Grid with Live Calculated Clues */}
          <Box
            sx={{
              width: '100%',
              flex: 1,
              minHeight: 280,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 1.5,
              borderRadius: 1.5,
              border: '2px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              overflow: 'auto',
              userSelect: 'none',
              boxShadow: (theme) => theme.shadows[2],
            }}
          >
            <Box sx={{ display: 'inline-block' }}>
              {/* Top Row: Corner + Column Clues */}
              <Box sx={{ display: 'flex' }}>
                <Box
                  sx={{
                    width: clueBoxWidth,
                    height: clueBoxHeight,
                    bgcolor: 'action.hover',
                    borderRight: '2px solid',
                    borderBottom: '2px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ fontSize: '0.62rem', fontWeight: 700, color: 'text.disabled' }}
                  >
                    HINTS
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex' }}>
                  {colClues.map((clues, c) => (
                    <Box
                      key={c}
                      sx={{
                        width: cellSize,
                        height: clueBoxHeight,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        gap: 0.15,
                        pb: 0.25,
                        borderRight: (c + 1) % 5 === 0 ? '2px solid' : '1px solid',
                        borderBottom: '2px solid',
                        borderColor: 'divider',
                        bgcolor: 'action.hover',
                      }}
                    >
                      {clues.map((n, idx) => (
                        <Typography
                          key={idx}
                          sx={{
                            fontSize: cellSize <= 18 ? '0.6rem' : '0.68rem',
                            fontWeight: 700,
                            lineHeight: 1,
                            color: n === 0 ? 'text.disabled' : 'text.primary',
                          }}
                        >
                          {n}
                        </Typography>
                      ))}
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Rows: Row Clues + Cells */}
              {matrix.map((row, r) => (
                <Box key={r} sx={{ display: 'flex' }}>
                  {/* Row Clues */}
                  <Box
                    sx={{
                      width: clueBoxWidth,
                      height: cellSize,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      pr: 0.75,
                      gap: 0.4,
                      borderRight: '2px solid',
                      borderBottom: (r + 1) % 5 === 0 ? '2px solid' : '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'action.hover',
                    }}
                  >
                    {(rowClues[r] || [0]).map((n, idx) => (
                      <Typography
                        key={idx}
                        sx={{
                          fontSize: cellSize <= 18 ? '0.6rem' : '0.68rem',
                          fontWeight: 700,
                          color: n === 0 ? 'text.disabled' : 'text.primary',
                        }}
                      >
                        {n}
                      </Typography>
                    ))}
                  </Box>

                  {/* Grid Cells */}
                  {row.map((val, c) => {
                    const isFilled = val === 1;
                    const borderRight = (c + 1) % 5 === 0 ? '2px solid' : '1px solid';
                    const borderBottom = (r + 1) % 5 === 0 ? '2px solid' : '1px solid';

                    return (
                      <Box
                        key={c}
                        onClick={() => handleToggleCell(r, c)}
                        sx={{
                          width: cellSize,
                          height: cellSize,
                          cursor: 'pointer',
                          bgcolor: isFilled ? 'primary.main' : 'background.paper',
                          borderRight,
                          borderBottom,
                          borderColor: 'divider',
                          transition: 'background-color 0.1s',
                          '&:hover': {
                            bgcolor: isFilled ? 'primary.dark' : 'action.selected',
                          },
                        }}
                      />
                    );
                  })}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Tools Bar */}
          <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'center' }}>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<RestartAltRoundedIcon />}
              onClick={handleInvertMatrix}
              sx={{ fontSize: '0.75rem', height: 30 }}
            >
              흑백 반전
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<CheckBoxOutlineBlankRoundedIcon />}
              onClick={handleClearMatrix}
              sx={{ fontSize: '0.75rem', height: 30 }}
            >
              모두 비우기
            </Button>
          </Box>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', textAlign: 'center', fontSize: '0.75rem' }}
          >
            💡 위 미리보기 판에서 각 칸을 <b>클릭</b>하여 직접 픽셀을 추가하거나 지울 수 있습니다.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 2.5, py: 1.5, borderTop: 1, borderColor: 'divider' }}>
        <Button variant="outlined" color="inherit" onClick={handleClose}>
          취소
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleApply}
          startIcon={<AutoAwesomeRoundedIcon />}
          sx={{ fontWeight: 800, px: 3 }}
        >
          이 도안으로 문제 시작하기
        </Button>
      </DialogActions>
    </Dialog>
  );
}
