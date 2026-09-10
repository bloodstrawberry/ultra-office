'use client';

import type { SlidingSize } from '../utils/sliding-solver';

import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
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
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ContentPasteRoundedIcon from '@mui/icons-material/ContentPasteRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import { toast } from 'src/components/snackbar';

import { recognizeSlidingPuzzleFromImage } from '../utils/sliding-ocr';
import { isSolved, isSolvable, shuffleBoard, getGoalBoard } from '../utils/sliding-solver';
import {
  makeBoardSolvable,
  getTileBackgroundStyle,
  parseSlidingBoardFromText,
} from '../utils/sliding-image-utils';

interface SlidingImageUploadDialogProps {
  open: boolean;
  onClose: () => void;
  currentSize: SlidingSize;
  onApplyPuzzle: (config: {
    size: SlidingSize;
    board: number[];
    imageUrl?: string;
    showNumbers: boolean;
  }) => void;
}

export function SlidingImageUploadDialog({
  open,
  onClose,
  currentSize,
  onApplyPuzzle,
}: SlidingImageUploadDialogProps) {
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [size, setSize] = useState<SlidingSize>(currentSize);
  const [, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showNumbers, setShowNumbers] = useState<boolean>(true);
  const [autoShuffle, setAutoShuffle] = useState<boolean>(true);
  const [rawText, setRawText] = useState<string>('');

  const [isOcrProcessing, setIsOcrProcessing] = useState<boolean>(false);
  const [ocrProgress, setOcrProgress] = useState<number>(0);

  // Selected tile index for interactive swapping in preview
  const [selectedSwapIdx, setSelectedSwapIdx] = useState<number | null>(null);

  // Preview board state
  const [previewBoard, setPreviewBoard] = useState<number[]>(() => getGoalBoard(currentSize));

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const ocrInputRef = useRef<HTMLInputElement | null>(null);

  // Sync size with prop when opened
  useEffect(() => {
    if (open) {
      setSize(currentSize);
      setPreviewBoard(getGoalBoard(currentSize));
      setSelectedSwapIdx(null);
    }
  }, [currentSize, open]);

  const solvable = useMemo(() => isSolvable(previewBoard, size), [previewBoard, size]);
  const isGoal = useMemo(() => isSolved(previewBoard, size), [previewBoard, size]);

  const resetState = useCallback(() => {
    setSelectedFile(null);
    setImagePreviewUrl(null);
    setIsDragging(false);
    setRawText('');
    setSelectedSwapIdx(null);
    setPreviewBoard(getGoalBoard(size));
  }, [size]);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  // Size change handler
  const handleSizeChange = useCallback(
    (newSize: SlidingSize) => {
      setSize(newSize);
      setSelectedSwapIdx(null);
      const newBoard = autoShuffle ? shuffleBoard(newSize, 30) : getGoalBoard(newSize);
      setPreviewBoard(newBoard);
    },
    [autoShuffle]
  );

  // Sample image generator
  const handleLoadSampleImage = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw scenic gradient & shapes
    const grad = ctx.createLinearGradient(0, 0, 300, 300);
    grad.addColorStop(0, '#00A76F');
    grad.addColorStop(0.5, '#00B8D9');
    grad.addColorStop(1, '#7928CA');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 300, 300);

    // Circles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.beginPath();
    ctx.arc(150, 150, 90, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PUZZLE', 150, 150);

    const url = canvas.toDataURL();
    setImagePreviewUrl(url);
    setSelectedFile(null);
    if (autoShuffle) {
      setPreviewBoard(shuffleBoard(size, 35));
    }
    toast.info('💡 아름다운 샘플 그래픽 이미지를 불러왔습니다.', { id: 'sliding-sample' });
  }, [autoShuffle, size]);

  // File selection
  const handleFileSelect = useCallback(
    (file: File) => {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
      if (autoShuffle) {
        setPreviewBoard(shuffleBoard(size, 35));
      }
      toast.success('사진이 업로드되었습니다! 우측에서 퍼즐 상태를 확인하세요.', {
        id: 'sliding-upload',
      });
    },
    [autoShuffle, size]
  );

  // Shuffle preview board
  const handleShufflePreview = useCallback(() => {
    setSelectedSwapIdx(null);
    const shuffled = shuffleBoard(size, 35);
    setPreviewBoard(shuffled);
    toast.info('미리보기 보드가 셔플되었습니다.', { id: 'sliding-preview' });
  }, [size]);

  // Reset preview to solved goal
  const handleResetPreview = useCallback(() => {
    setSelectedSwapIdx(null);
    const goal = getGoalBoard(size);
    setPreviewBoard(goal);
    toast.info('정답 상태로 정렬되었습니다.', { id: 'sliding-preview' });
  }, [size]);

  // Auto-fix unsolvable board by swapping two tiles
  const handleFixSolvability = useCallback(() => {
    const fixed = makeBoardSolvable(previewBoard, size);
    setPreviewBoard(fixed);
    setSelectedSwapIdx(null);
    toast.success('⚡ 타일 순열을 보정하여 해결 가능한(Solvable) 문제로 수정했습니다!', {
      id: 'sliding-fix',
    });
  }, [previewBoard, size]);

  // Interactive Swap: Click tile 1, then click tile 2 to swap them
  const handleTileClickForSwap = useCallback(
    (idx: number) => {
      if (selectedSwapIdx === null) {
        setSelectedSwapIdx(idx);
        toast.info(
          `[${
            previewBoard[idx] === 0 ? '빈칸' : previewBoard[idx]
          }] 선택됨. 교환할 다른 타일을 클릭하세요.`,
          { id: 'sliding-swap' }
        );
      } else if (selectedSwapIdx === idx) {
        setSelectedSwapIdx(null);
      } else {
        // Perform swap
        setPreviewBoard((prev) => {
          const next = [...prev];
          const temp = next[selectedSwapIdx];
          next[selectedSwapIdx] = next[idx];
          next[idx] = temp;
          return next;
        });
        setSelectedSwapIdx(null);
        toast.success('타일 위치가 교환되었습니다.', { id: 'sliding-swap' });
      }
    },
    [previewBoard, selectedSwapIdx]
  );

  // OCR capture image recognition
  const handleOcrFileSelect = useCallback(
    async (file: File) => {
      setIsOcrProcessing(true);
      setOcrProgress(0);
      try {
        const { board: detectedBoard } = await recognizeSlidingPuzzleFromImage(file, size, (p) =>
          setOcrProgress(p)
        );
        setPreviewBoard(detectedBoard);
        setSelectedSwapIdx(null);
        toast.success(`OCR 인식 완료! ${size}x${size} 타일 배치를 감지했습니다.`, {
          id: 'sliding-ocr',
        });
      } catch (err) {
        console.error(err);
        toast.error('캡처 사진 인식 중 오류가 발생했습니다.', { id: 'sliding-ocr' });
      } finally {
        setIsOcrProcessing(false);
      }
    },
    [size]
  );

  // Text input parsing
  const handleRawTextChange = useCallback(
    (text: string) => {
      setRawText(text);
      if (!text.trim()) return;
      const { board: parsed, error } = parseSlidingBoardFromText(text, size);
      if (parsed) {
        setPreviewBoard(parsed);
        setSelectedSwapIdx(null);
      } else if (error) {
        // silent while user types
      }
    },
    [size]
  );

  // Apply to main puzzle view
  const handleApply = useCallback(() => {
    if (!solvable) {
      toast.error(
        '현재 배치는 수학적으로 해결이 불가능합니다. [해결 가능하게 자동 수정]을 클릭하세요!',
        { id: 'sliding-apply' }
      );
      return;
    }

    onApplyPuzzle({
      size,
      board: previewBoard,
      imageUrl: imagePreviewUrl || undefined,
      showNumbers,
    });
    handleClose();
    toast.success('슬라이딩 퍼즐에 새로운 문제가 성공적으로 적용되었습니다!', {
      id: 'sliding-apply',
    });
  }, [handleClose, imagePreviewUrl, onApplyPuzzle, previewBoard, showNumbers, size, solvable]);

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
            if (tabIndex === 1) {
              handleOcrFileSelect(file);
              toast.info('📋 클립보드 이미지를 감지하여 OCR 인식을 시작합니다.', {
                id: 'sliding-paste',
              });
            } else {
              setTabIndex(0);
              handleFileSelect(file);
              toast.info('📋 클립보드 이미지를 감지하여 사진 퍼즐로 생성합니다.', {
                id: 'sliding-paste',
              });
            }
            return;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleFileSelect, handleOcrFileSelect, open, tabIndex]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2,
          height: { xs: 'auto', md: 800 },
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
            슬라이딩 퍼즐 이미지 업로드 & 문제 만들기
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          💡 사진 슬라이딩 퍼즐 · 타일 직접 스왑 배치 · 수학적 해결 가능성 자동 검증
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
        {/* Left Column: Image Upload & Text Config */}
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
              label="🖼️ 사진 퍼즐 (조각 분할)"
              sx={{ minHeight: 44, fontSize: '0.85rem' }}
            />
            <Tab
              icon={<CameraAltRoundedIcon />}
              iconPosition="start"
              label="📷 퍼즐 캡처 OCR (자동 인식)"
              sx={{ minHeight: 44, fontSize: '0.85rem' }}
            />
            <Tab
              icon={<ContentPasteRoundedIcon />}
              iconPosition="start"
              label="📝 배열 텍스트 직접 입력"
              sx={{ minHeight: 44, fontSize: '0.85rem' }}
            />
          </Tabs>

          {/* Size & Display Settings */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'action.hover',
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ width: 150 }}>
                <TextField
                  select
                  size="small"
                  label="퍼즐 크기"
                  value={size}
                  onChange={(e) => handleSizeChange(Number(e.target.value) as SlidingSize)}
                >
                  <MenuItem value={3}>3 x 3 (8-Puzzle)</MenuItem>
                  <MenuItem value={4}>4 x 4 (15-Puzzle)</MenuItem>
                </TextField>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={showNumbers}
                    onChange={(e) => setShowNumbers(e.target.checked)}
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    타일 번호 오버레이
                  </Typography>
                }
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={autoShuffle}
                    onChange={(e) => setAutoShuffle(e.target.checked)}
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    적용 시 자동 셔플
                  </Typography>
                }
              />
            </Box>
          </Box>

          {/* Tab 0: Image Upload */}
          {tabIndex === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minHeight: 0 }}>
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
                  minHeight: { xs: 260, md: 380 },
                  border: '2px dashed',
                  borderColor: isDragging ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  p: imagePreviewUrl ? 1.5 : 2.5,
                  bgcolor: isDragging ? 'action.hover' : 'background.neutral',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  transition: 'all 0.2s ease',
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
                  tabIndex={-1}
                  style={{ display: 'none' }}
                />

                {imagePreviewUrl ? (
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
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
                      alt="Sliding Photo"
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
                      📷 사진 변경: 드래그 또는 Ctrl+V
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
                        슬라이딩 퍼즐 사진을 여기에 드래그하거나 붙여넣으세요
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        PNG, JPG, WEBP 지원 · 단축키: 어디서든 <b>Ctrl + V</b> 로 사진 즉시 붙여넣기
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
                    >
                      PC에서 파일 선택
                    </Button>
                  </>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', flexShrink: 0 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CloudUploadRoundedIcon />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  사진 파일 선택
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  color="inherit"
                  onClick={handleLoadSampleImage}
                  startIcon={<AutoAwesomeRoundedIcon />}
                >
                  💡 샘플 그래픽 사진 불러오기
                </Button>
                {imagePreviewUrl && (
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={() => {
                      setImagePreviewUrl(null);
                      setSelectedFile(null);
                    }}
                    startIcon={<DeleteOutlineRoundedIcon />}
                  >
                    사진 제거
                  </Button>
                )}
              </Box>

              <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                💡 사진을 업로드하면 {size}x{size} 조각으로 자동 분할되어 움직이는{' '}
                <b>그림 슬라이딩 퍼즐</b>을 즐길 수 있습니다.
              </Typography>
            </Box>
          )}

          {/* Tab 1: OCR Capture Recognition */}
          {tabIndex === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minHeight: 0 }}>
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
                    handleOcrFileSelect(file);
                  } else {
                    toast.error('이미지 파일을 올려주세요.');
                  }
                }}
                sx={{
                  flex: 1,
                  minHeight: { xs: 260, md: 380 },
                  border: '2px dashed',
                  borderColor: isDragging ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  p: 2.5,
                  bgcolor: isDragging ? 'action.hover' : 'background.neutral',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    borderColor: 'primary.main',
                  },
                }}
              >
                <input
                  ref={ocrInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleOcrFileSelect(file);
                    e.target.value = '';
                  }}
                  tabIndex={-1}
                  disabled={isOcrProcessing}
                  style={{ display: 'none' }}
                />

                <CameraAltRoundedIcon
                  sx={{
                    fontSize: 64,
                    color: isDragging ? 'primary.main' : 'text.secondary',
                    transition: 'transform 0.2s',
                    transform: isDragging ? 'scale(1.1)' : 'scale(1)',
                  }}
                />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                    퍼즐 캡처 사진을 여기에 드래그하거나 붙여넣으세요
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    단축키: 어디서든 <b>Ctrl + V</b> 로 화면 캡처 즉시 붙여넣기
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CameraAltRoundedIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    ocrInputRef.current?.click();
                  }}
                  disabled={isOcrProcessing}
                >
                  PC에서 파일 선택
                </Button>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', flexShrink: 0 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CameraAltRoundedIcon />}
                  onClick={() => ocrInputRef.current?.click()}
                  disabled={isOcrProcessing}
                >
                  캡처 사진 파일 선택
                </Button>
              </Box>

              {isOcrProcessing && (
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      Tesseract OCR 엔진으로 타일 숫자 스캔 중...
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {ocrProgress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={ocrProgress}
                    sx={{ height: 6, borderRadius: 1 }}
                  />
                </Box>
              )}

              <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                💡 스도쿠처럼 슬라이딩 퍼즐 화면 캡처 사진을 올리면 각 칸의 숫자를 자동으로 감지하여
                우측 보드에 배치합니다.
              </Typography>
            </Box>
          )}

          {/* Tab 2: Text Input */}
          {tabIndex === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
              <TextField
                multiline
                rows={7}
                fullWidth
                placeholder={`타일 번호(0~${size * size - 1})를 공백이나 쉼표로 구분하여 입력하세요.\n\n예시 (3x3):\n1, 2, 3\n4, 5, 6\n7, 8, 0`}
                value={rawText}
                onChange={(e) => handleRawTextChange(e.target.value)}
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  '& textarea': { fontFamily: 'monospace' },
                }}
              />

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() =>
                    handleRawTextChange(
                      size === 3
                        ? '1, 8, 2, 0, 4, 3, 7, 6, 5'
                        : '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 0, 15'
                    )
                  }
                >
                  예시 배치 채우기
                </Button>
                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  startIcon={<DeleteOutlineRoundedIcon />}
                  onClick={() => handleRawTextChange('')}
                >
                  지우기
                </Button>
              </Box>

              <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                💡 <b>0</b>은 빈칸을 의미하며, 0부터 {size * size - 1}까지 모든 숫자가 중복 없이
                1회씩 포함되어야 합니다.
              </Typography>
            </Box>
          )}
        </Box>

        {/* Vertical Divider */}
        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />

        {/* Right Column: Live Board Preview & Problem Creation */}
        <Box
          sx={{
            width: { xs: '100%', md: 380, lg: 400 },
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            p: 2,
            bgcolor: 'background.neutral',
            borderRadius: 2,
            height: '100%',
            minHeight: 0,
            overflowY: 'auto',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              타일 배치 미리보기 & 직접 만들기
            </Typography>
            <Chip
              label={solvable ? '해결 가능 (Solvable)' : '해결 불가 (Unsolvable)'}
              size="small"
              color={solvable ? 'success' : 'error'}
              variant="soft"
            />
          </Box>

          {/* Quick Board Tools */}
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant="outlined"
              color="secondary"
              startIcon={<ShuffleRoundedIcon />}
              onClick={handleShufflePreview}
              sx={{ fontSize: '0.75rem', height: 30 }}
            >
              셔플
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              onClick={handleResetPreview}
              sx={{ fontSize: '0.75rem', height: 30 }}
            >
              정답 상태로 정렬
            </Button>
          </Box>

          {/* Unsolvable Alert */}
          {!solvable && (
            <Box
              sx={{
                p: 1.25,
                borderRadius: 1.5,
                bgcolor: 'error.lighter',
                border: '1px solid',
                borderColor: 'error.main',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.75,
              }}
            >
              <Typography variant="caption" sx={{ color: 'error.dark', fontWeight: 700 }}>
                🚨 현재 배치는 수학적 순열 패리티로 인해 풀 수 없는 상태입니다!
              </Typography>
              <Button
                size="small"
                variant="contained"
                color="error"
                startIcon={<SwapHorizRoundedIcon />}
                onClick={handleFixSolvability}
                sx={{ height: 28, fontSize: '0.75rem', fontWeight: 800 }}
              >
                ⚡ 해결 가능한 배치로 자동 보정
              </Button>
            </Box>
          )}

          {/* Interactive Sliding Grid Preview */}
          <Box
            sx={{
              flex: 1,
              minHeight: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 2,
              borderRadius: 2,
              border: '2px solid',
              borderColor: 'divider',
              bgcolor: 'action.hover',
            }}
          >
            <Box
              sx={{
                width: '100%',
                maxWidth: 320,
                aspectRatio: '1 / 1',
                display: 'grid',
                gridTemplateColumns: `repeat(${size}, 1fr)`,
                gridTemplateRows: `repeat(${size}, 1fr)`,
                gap: 1,
                bgcolor: 'background.paper',
                p: 1.5,
                borderRadius: 2,
                boxShadow: 2,
              }}
            >
              {previewBoard.map((val, idx) => {
                const isEmpty = val === 0;
                const isSelected = selectedSwapIdx === idx;
                const bgStyle =
                  imagePreviewUrl && !isEmpty
                    ? getTileBackgroundStyle(val, size, imagePreviewUrl)
                    : {};

                if (isEmpty) {
                  return (
                    <Box
                      key={`empty-${idx}`}
                      onClick={() => handleTileClickForSwap(idx)}
                      sx={{
                        borderRadius: 1,
                        bgcolor: 'action.selected',
                        border: isSelected ? '2.5px solid #FFAB00' : '2px dashed',
                        borderColor: isSelected ? 'warning.main' : 'divider',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.disabled', fontSize: '0.65rem' }}
                      >
                        빈칸
                      </Typography>
                    </Box>
                  );
                }

                return (
                  <Box
                    key={`tile-${val}`}
                    onClick={() => handleTileClickForSwap(idx)}
                    sx={{
                      borderRadius: 1,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      userSelect: 'none',
                      position: 'relative',
                      bgcolor: 'primary.main',
                      color: '#FFF',
                      boxShadow: isSelected ? 4 : 1,
                      transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                      border: isSelected ? '2.5px solid #FFAB00' : 'none',
                      ...bgStyle,
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        filter: 'brightness(1.08)',
                      },
                    }}
                  >
                    {(!imagePreviewUrl || showNumbers) && (
                      <Typography
                        sx={{
                          fontSize: size === 3 ? '1.3rem' : '1.1rem',
                          fontWeight: 800,
                          textShadow: imagePreviewUrl ? '0 1px 3px rgba(0,0,0,0.8)' : 'none',
                          color: '#FFFFFF',
                        }}
                      >
                        {val}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>

          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', textAlign: 'center', fontSize: '0.75rem' }}
          >
            💡 두 타일을 차례로 <b>클릭</b>하면 서로 위치를 맞바꿔 원하는 문제를 직접 만들 수
            있습니다.
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
          {isGoal ? '퍼즐 문제로 적용하기' : '이 배치로 문제 시작하기'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
