'use client';

import type { SudokuBoard } from '../utils/sudoku-solver';
import type { SudokuOcrParameters } from '../utils/sudoku-ocr';

import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Slider from '@mui/material/Slider';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Collapse from '@mui/material/Collapse';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import LinearProgress from '@mui/material/LinearProgress';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ContentPasteRoundedIcon from '@mui/icons-material/ContentPasteRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';

import { toast } from 'src/components/snackbar';

import { getConflicts } from '../utils/sudoku-solver';
import { SudokuOcrComparisonCard } from './sudoku-ocr-comparison-card';
import { runMultiEngineSudokuOcr, type SudokuMultiOcrResult } from '../utils/sudoku-multi-ocr';
import {
  parseSudokuFromText,
  DEFAULT_OCR_PARAMETERS,
  recognizeSudokuFromImage,
} from '../utils/sudoku-ocr';

const SAMPLE_IMAGE_URL = '/assets/images/sudoku-sample.png';

const SAMPLE_CSV_TEXT = `8,4,0,3,0,0,0,0,9
0,0,9,7,5,0,8,0,0
0,3,0,0,8,0,6,0,0
0,0,6,2,3,0,0,0,7
2,1,8,5,4,7,0,0,0
7,0,0,0,9,0,0,8,0
0,0,4,1,0,5,0,0,8
0,6,0,0,7,0,4,1,0
0,0,5,9,0,4,7,6,3`;

const SAMPLE_ARRAY_TEXT = `{8,4,0,3,0,0,0,0,9},
{0,0,9,7,5,0,8,0,0},
{0,3,0,0,8,0,6,0,0},
{0,0,6,2,3,0,0,0,7},
{2,1,8,5,4,7,0,0,0},
{7,0,0,0,9,0,0,8,0},
{0,0,4,1,0,5,0,0,8},
{0,6,0,0,7,0,4,1,0},
{0,0,5,9,0,4,7,6,3}`;

function createEmptyBoard(): SudokuBoard {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

interface SudokuImageUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onApplyBoard: (board: SudokuBoard) => void;
}

export function SudokuImageUploadDialog({
  open,
  onClose,
  onApplyBoard,
}: SudokuImageUploadDialogProps) {
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [rawText, setRawText] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [ocrParams, setOcrParams] = useState<Required<SudokuOcrParameters>>(DEFAULT_OCR_PARAMETERS);
  const [showOcrParams, setShowOcrParams] = useState<boolean>(false);

  // Multi-engine comparison state
  const [comparisonResults, setComparisonResults] = useState<SudokuMultiOcrResult[]>([]);
  const [selectedEngineId, setSelectedEngineId] = useState<string | null>(null);
  const [currentEngineStep, setCurrentEngineStep] = useState<string>('');

  // 9x9 preview board (defaults to empty 9x9 so right pane is always structured)
  const [previewBoard, setPreviewBoard] = useState<SudokuBoard>(() => createEmptyBoard());

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Conflicts check for preview board
  const previewConflicts = useMemo(() => getConflicts(previewBoard), [previewBoard]);

  const filledCount = useMemo(
    () => previewBoard.flat().filter((n) => n !== 0).length,
    [previewBoard]
  );

  const getBoardDiffCount = useCallback((a: SudokuBoard, b: SudokuBoard): number => {
    let diffs = 0;
    for (let r = 0; r < 9; r += 1) {
      for (let c = 0; c < 9; c += 1) {
        if (a[r][c] !== b[r][c]) diffs += 1;
      }
    }
    return diffs;
  }, []);

  const resetState = useCallback(() => {
    setSelectedFile(null);
    setImagePreviewUrl(null);
    setIsProcessing(false);
    setProgress(0);
    setRawText('');
    setPreviewBoard(createEmptyBoard());
    setIsDragging(false);
    setShowOcrParams(false);
    setComparisonResults([]);
    setSelectedEngineId(null);
    setCurrentEngineStep('');
  }, []);

  const handleResetOcrParams = useCallback(() => {
    setOcrParams(DEFAULT_OCR_PARAMETERS);
    toast.info('OCR 파라미터를 기본값으로 복원했습니다.', { id: 'ocr-params' });
  }, []);

  const handleClose = useCallback(() => {
    if (isProcessing) return;
    resetState();
    onClose();
  }, [isProcessing, onClose, resetState]);

  // Run Multi-Engine Comparison across all OCR models
  const runMultiComparison = useCallback(async (source: File | string) => {
    setIsProcessing(true);
    setProgress(0);
    setCurrentEngineStep('스도쿠 전문 엔진 초기화 중...');
    try {
      const results = await runMultiEngineSudokuOcr(source, (engineName, pct) => {
        setCurrentEngineStep(engineName);
        setProgress(pct);
      });

      setComparisonResults(results);

      if (results.length > 0) {
        const best = results[0];
        setSelectedEngineId(best.id);
        setPreviewBoard(best.board);
        setRawText(best.rawText);
        toast.success(
          `다중 엔진 분석 완료! 3개 엔진 결과 중 최적의 결과(${best.name})가 자동 적용되었습니다.`,
          { id: 'multi-ocr-status' }
        );
      }
    } catch (err) {
      console.error('Multi-engine OCR failed:', err);
      toast.error('다중 엔진 분석 중 오류가 발생했습니다.', { id: 'multi-ocr-status' });
    } finally {
      setIsProcessing(false);
      setCurrentEngineStep('');
    }
  }, []);

  const handleSelectComparisonResult = useCallback((result: SudokuMultiOcrResult) => {
    setSelectedEngineId(result.id);
    setPreviewBoard(result.board);
    setRawText(result.rawText);
    toast.info(`[${result.name}] 결과가 적용되었습니다.`, { id: 'multi-ocr-apply' });
  }, []);

  // Run OCR on an image file or URL (Single custom runner)
  const runOcr = useCallback(
    async (source: File | string, customParams?: SudokuOcrParameters) => {
      setIsProcessing(true);
      setProgress(0);
      setCurrentEngineStep('단일 Tesseract 엔진 정밀 분석 중...');
      try {
        const activeParams = customParams || ocrParams;
        const { board, rawText: text } = await recognizeSudokuFromImage(
          source,
          (p) => {
            setProgress(p);
          },
          activeParams
        );

        setRawText(text);

        if (board) {
          setPreviewBoard(board);
          const count = board.flat().filter((n) => n !== 0).length;
          toast.success(`OCR 분석 완료! 총 ${count}개의 숫자를 인식했습니다.`, {
            id: 'ocr-status',
          });
        } else {
          const partial = parseSudokuFromText(text, { allowPartial: true });
          if (partial) {
            setPreviewBoard(partial);
            toast.warning('일부 숫자만 인식되었습니다. 우측 미리보기에서 검토 후 수정하세요.', {
              id: 'ocr-status',
            });
          } else {
            toast.error('이미지에서 숫자를 인식하지 못했습니다. OCR 파라미터를 조절해보세요.', {
              id: 'ocr-status',
            });
          }
        }
      } catch (err) {
        console.error(err);
        toast.error('이미지 분석 중 오류가 발생했습니다.', { id: 'ocr-status' });
      } finally {
        setIsProcessing(false);
        setCurrentEngineStep('');
      }
    },
    [ocrParams]
  );

  // Handle incoming image file (from input, drop, or clipboard paste)
  const handleImageFile = useCallback(
    (file: File) => {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
      runMultiComparison(file);
    },
    [runMultiComparison]
  );

  // File input change
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleImageFile(file);
      }
    },
    [handleImageFile]
  );

  // Sample image test
  const handleSampleTest = useCallback(async () => {
    setImagePreviewUrl(SAMPLE_IMAGE_URL);
    setSelectedFile(null);
    await runMultiComparison(SAMPLE_IMAGE_URL);
  }, [runMultiComparison]);

  // Real-time text change & reactive parsing
  const handleRawTextChange = useCallback((text: string) => {
    setRawText(text);
    if (!text.trim()) {
      setPreviewBoard(createEmptyBoard());
      return;
    }
    const parsed = parseSudokuFromText(text, { allowPartial: true });
    if (parsed) {
      setPreviewBoard(parsed);
    }
  }, []);

  // Quick text insert helpers
  const handleInsertSampleCsv = useCallback(() => {
    handleRawTextChange(SAMPLE_CSV_TEXT);
    toast.info('예시 CSV 텍스트를 입력했습니다.', { id: 'text-helper' });
  }, [handleRawTextChange]);

  const handleInsertSampleArray = useCallback(() => {
    handleRawTextChange(SAMPLE_ARRAY_TEXT);
    toast.info('예시 2D 배열 코드를 입력했습니다.', { id: 'text-helper' });
  }, [handleRawTextChange]);

  const handleClearText = useCallback(() => {
    handleRawTextChange('');
  }, [handleRawTextChange]);

  // Preview board cell modification (click to increment, double click to clear)
  const handlePreviewCellClick = useCallback((r: number, c: number) => {
    setPreviewBoard((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = (next[r][c] + 1) % 10;
      return next;
    });
  }, []);

  const handlePreviewCellDoubleClick = useCallback((r: number, c: number) => {
    setPreviewBoard((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = 0;
      return next;
    });
  }, []);

  // Apply to main sudoku board
  const handleApply = useCallback(() => {
    if (filledCount === 0) {
      toast.warning('입력된 숫자가 없습니다. 이미지나 텍스트를 먼저 입력해주세요.', {
        id: 'sudoku-status',
      });
      return;
    }
    if (previewConflicts.size > 0) {
      toast.error('중복(충돌)된 숫자가 있습니다. 행/열/박스 중복을 확인하세요!', {
        id: 'sudoku-status',
      });
      return;
    }

    onApplyBoard(previewBoard);
    handleClose();
    toast.success('스도쿠 문제에 숫자가 성공적으로 적용되었습니다!', {
      id: 'sudoku-status',
    });
  }, [filledCount, handleClose, onApplyBoard, previewBoard, previewConflicts.size]);

  // Global clipboard paste listener (Ctrl + V) when dialog is open
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
            handleImageFile(file);
            toast.info('📋 클립보드 이미지를 감지하여 OCR 분석을 시작합니다.', {
              id: 'ocr-status',
            });
            return;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handleImageFile, open]);

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
            스도쿠 문제 불러오기 (이미지 OCR / 배열·CSV 입력)
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          💡 Drag & Drop · Ctrl+V 붙여넣기 · 실시간 9x9 미리보기 지원
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
        {/* Left Column: Input Options (Image vs Text) */}
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
              label="📷 이미지 OCR (드래그 & 드롭 / Ctrl+V)"
              sx={{ minHeight: 44, fontSize: '0.875rem' }}
            />
            <Tab
              icon={<ContentPasteRoundedIcon />}
              iconPosition="start"
              label="📝 배열 · CSV · 공백 텍스트 입력"
              sx={{ minHeight: 44, fontSize: '0.875rem' }}
            />
          </Tabs>

          {/* Tab 0: Image Upload & OCR */}
          {tabIndex === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minHeight: 0 }}>
              {/* Drag & Drop Zone (Fills entire remaining height) */}
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
                    handleImageFile(file);
                  } else {
                    toast.error('이미지 파일(PNG, JPG, WEBP 등)을 올려주세요.');
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
                  onChange={handleFileChange}
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
                      gap: 1.5,
                      alignItems: 'stretch',
                      minHeight: 0,
                    }}
                  >
                    {/* Left: Uploaded Image Preview */}
                    <Box
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        minHeight: { xs: 220, sm: 360 },
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
                        alt="Sudoku Source"
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

                    {/* Right: Editable Textarea next to Image */}
                    <Box
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        minHeight: { xs: 220, sm: 360 },
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.8,
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            color: 'text.primary',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          📝 인식된 숫자 직접 수정 (실시간 반영)
                        </Typography>

                        {rawText && (
                          <Button
                            size="small"
                            variant="text"
                            color="inherit"
                            onClick={handleClearText}
                            sx={{ fontSize: '0.7rem', py: 0, px: 0.8, minWidth: 0 }}
                          >
                            지우기
                          </Button>
                        )}
                      </Box>

                      <TextField
                        multiline
                        fullWidth
                        size="small"
                        minRows={9}
                        value={rawText}
                        onChange={(e) => handleRawTextChange(e.target.value)}
                        placeholder="OCR로 추출된 숫자가 여기에 표시됩니다. 왼쪽 이미지를 보며 오인식된 숫자를 직접 수정할 수 있습니다."
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
                            fontSize: '0.86rem',
                            lineHeight: 1.6,
                            p: 1.25,
                            bgcolor: (theme) =>
                              theme.palette.mode === 'dark'
                                ? 'rgba(255,255,255,0.03)'
                                : 'background.paper',
                          },
                          '& .MuiInputBase-input': {
                            height: '100% !important',
                            overflowY: 'auto !important',
                            lineHeight: 1.6,
                            whiteSpace: 'pre',
                          },
                        }}
                      />

                      <Typography
                        variant="caption"
                        sx={{ color: 'text.disabled', fontSize: '0.68rem', flexShrink: 0 }}
                      >
                        💡 텍스트를 수정하면 우측 9x9 미리보기 판에 실시간으로 즉시 반영됩니다.
                      </Typography>
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
                        스도쿠 이미지를 여기에 드래그하거나 붙여넣으세요
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

              {/* Action Buttons */}
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
                  onClick={handleSampleTest}
                  disabled={isProcessing}
                >
                  📸 예시 샘플 이미지로 바로 테스트
                </Button>

                {(selectedFile || imagePreviewUrl) && !isProcessing && (
                  <>
                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      startIcon={<CompareArrowsRoundedIcon />}
                      onClick={() => runMultiComparison(selectedFile || imagePreviewUrl!)}
                    >
                      ⚡ 3개 엔진 동시 비교 분석
                    </Button>

                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<RefreshRoundedIcon />}
                      onClick={() => runOcr(selectedFile || imagePreviewUrl!)}
                    >
                      단일 분석 다시 실행
                    </Button>

                    <Button
                      variant={showOcrParams ? 'contained' : 'outlined'}
                      color={showOcrParams ? 'info' : 'inherit'}
                      size="small"
                      startIcon={<TuneRoundedIcon />}
                      onClick={() => setShowOcrParams((prev) => !prev)}
                    >
                      OCR 파라미터 조절 {showOcrParams ? '▲' : '▼'}
                    </Button>
                  </>
                )}
              </Box>

              {/* Multi-Engine Comparison Results Panel */}
              {comparisonResults.length > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.2,
                    p: 1.5,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'grey.100',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    flexShrink: 0,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <AutoAwesomeRoundedIcon fontSize="small" color="primary" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        ⚡ 다중 엔진 인식 결과 비교 ({comparisonResults.length}개 엔진)
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      💡 원하시는 카드의 [이 결과 적용하기]를 클릭하면 메인 판과 수정창에 즉시
                      반영됩니다.
                    </Typography>
                  </Box>

                  {/* Horizontal scrollable row of comparison cards */}
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1.5,
                      overflowX: 'auto',
                      pb: 0.5,
                    }}
                  >
                    {comparisonResults.map((res) => (
                      <SudokuOcrComparisonCard
                        key={res.id}
                        result={res}
                        isSelected={selectedEngineId === res.id}
                        onSelect={handleSelectComparisonResult}
                        diffCount={getBoardDiffCount(res.board, previewBoard)}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Collapsible OCR Parameter Panel */}
              <Collapse in={showOcrParams && !!(selectedFile || imagePreviewUrl)}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.100',
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    flexShrink: 0,
                  }}
                >
                  {/* Panel Header */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <TuneRoundedIcon fontSize="small" color="primary" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        OCR 엔진 파라미터 세부 조절
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Button
                        size="small"
                        color="inherit"
                        variant="text"
                        startIcon={<RestartAltRoundedIcon />}
                        onClick={handleResetOcrParams}
                        disabled={isProcessing}
                        sx={{ fontSize: '0.75rem' }}
                      >
                        기본값 복원
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        startIcon={<RefreshRoundedIcon />}
                        onClick={() => runOcr(selectedFile || imagePreviewUrl!)}
                        disabled={isProcessing}
                      >
                        적용 후 다시 분석
                      </Button>
                    </Box>
                  </Box>

                  {/* Parameter Controls Grid */}
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                      gap: 2,
                    }}
                  >
                    {/* Control 1: Recognition Mode */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 600, color: 'text.secondary' }}
                      >
                        분석 모드 (Mode)
                      </Typography>
                      <FormControl size="small" fullWidth>
                        <Select
                          value={ocrParams.ocrMode}
                          onChange={(e) =>
                            setOcrParams((prev) => ({
                              ...prev,
                              ocrMode: e.target.value as 'auto' | 'grid' | 'direct',
                            }))
                          }
                          sx={{ fontSize: '0.82rem', height: 36 }}
                        >
                          <MenuItem value="auto">자동 (격자 보드 감지 우선 + 폴백)</MenuItem>
                          <MenuItem value="grid">격자판 전용 (9x9 셀 분할 & 정제)</MenuItem>
                          <MenuItem value="direct">일반 텍스트 (배열 코드/CSV 이미지)</MenuItem>
                        </Select>
                      </FormControl>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.disabled', fontSize: '0.7rem' }}
                      >
                        일반 스도쿠 판은 &apos;자동&apos; 또는 &apos;격자판 전용&apos;을 권장합니다.
                      </Typography>
                    </Box>

                    {/* Control 2: Darkness Threshold */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 600, color: 'text.secondary' }}
                        >
                          잉크 농도 임계값 (Dark Threshold)
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 700, color: 'primary.main' }}
                        >
                          {ocrParams.darkThreshold}
                        </Typography>
                      </Box>
                      <Slider
                        size="small"
                        min={50}
                        max={180}
                        step={5}
                        value={ocrParams.darkThreshold}
                        onChange={(_, val) =>
                          setOcrParams((prev) => ({ ...prev, darkThreshold: val as number }))
                        }
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.disabled', fontSize: '0.7rem' }}
                      >
                        글씨가 연하면 올리고, 테두리나 얼룩 번짐이 심하면 낮추세요.
                      </Typography>
                    </Box>

                    {/* Control 3: Cell Margin */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 600, color: 'text.secondary' }}
                        >
                          셀 외곽선 제외 여백 (Margin %)
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 700, color: 'primary.main' }}
                        >
                          {ocrParams.cellMarginPercent}%
                        </Typography>
                      </Box>
                      <Slider
                        size="small"
                        min={10}
                        max={26}
                        step={1}
                        value={ocrParams.cellMarginPercent}
                        onChange={(_, val) =>
                          setOcrParams((prev) => ({
                            ...prev,
                            cellMarginPercent: val as number,
                          }))
                        }
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.disabled', fontSize: '0.7rem' }}
                      >
                        격자선이나 테두리가 숫자에 닿아 오류가 날 때 여백을 늘리세요.
                      </Typography>
                    </Box>

                    {/* Control 4: Min Dark Pixels */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 600, color: 'text.secondary' }}
                        >
                          빈 칸 판별 최소 픽셀 (Min Ink Pixels)
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 700, color: 'primary.main' }}
                        >
                          {ocrParams.minDarkPixels} px
                        </Typography>
                      </Box>
                      <Slider
                        size="small"
                        min={5}
                        max={50}
                        step={5}
                        value={ocrParams.minDarkPixels}
                        onChange={(_, val) =>
                          setOcrParams((prev) => ({ ...prev, minDarkPixels: val as number }))
                        }
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.disabled', fontSize: '0.7rem' }}
                      >
                        작은 점/먼지가 숫자로 인식되면 올리고, 얇은 획이 누락되면 낮추세요.
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Collapse>

              {/* Processing Progress Bar */}
              {isProcessing && (
                <Box sx={{ mt: 0.5, flexShrink: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      {currentEngineStep || '이미지 내 숫자 분석 중 (OCR 엔진)...'}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {progress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{ height: 6, borderRadius: 1 }}
                  />
                </Box>
              )}
            </Box>
          )}

          {/* Tab 1: Array / CSV / Whitespace Text Input */}
          {tabIndex === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1, minHeight: 0 }}>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', lineHeight: 1.6, flexShrink: 0 }}
              >
                💡 <b>줄바꿈(행 구분) 및 빈 줄(해당 행 전체 빈 칸)</b>을 완벽하게 지원합니다.
                <br />
                CSV(쉼표), 공백, 2D 배열, 마침표(.) 등 어떤 형식이든 입력 즉시{' '}
                <b>우측 미리보기 판에 실시간 반영</b>됩니다!
              </Typography>

              {/* Quick sample helper buttons */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', flexShrink: 0 }}>
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  onClick={handleInsertSampleCsv}
                >
                  예시 CSV 삽입
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="secondary"
                  onClick={handleInsertSampleArray}
                >
                  예시 2D 배열 삽입
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  startIcon={<DeleteOutlineRoundedIcon />}
                  onClick={handleClearText}
                >
                  텍스트 지우기
                </Button>
              </Box>

              <TextField
                multiline
                placeholder={`[입력 예시 1: 줄바꿈 및 빈 줄]\n1, 2, 3\n\n4, 5, 6\n(※ 2번째 줄이 비어있으면 2행은 모두 빈 칸(0)으로 자동 처리)\n\n[입력 예시 2: CSV]\n8,4,0,3,0,0,0,0,9\n0,0,9,7,5,0,8,0,0\n...\n\n[입력 예시 3: 2D 배열]\n{8,4,0,3,0,0,0,0,9},\n{0,0,9,7,5,0,8,0,0},\n...`}
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

        {/* Right Column: 9x9 Live Preview Grid & Cell Editor */}
        <Box
          sx={{
            width: { xs: '100%', md: 360 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
            flexShrink: 0,
            p: 1,
            bgcolor: 'background.neutral',
            borderRadius: 2,
          }}
        >
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
              9x9 실시간 미리보기
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                size="small"
                variant="outlined"
                color={filledCount > 0 ? 'primary' : 'default'}
                label={`숫자 ${filledCount}개`}
              />
              {previewConflicts.size > 0 && (
                <Chip
                  size="small"
                  color="error"
                  icon={<WarningAmberRoundedIcon />}
                  label={`중복 ${previewConflicts.size}개`}
                />
              )}
            </Box>
          </Box>

          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', textAlign: 'center', px: 1 }}
          >
            🖱️ 셀 클릭: <b>숫자 변경(1~9)</b> · 더블클릭: <b>지우기(0)</b>
          </Typography>

          {/* 9x9 Grid Board */}
          <Box
            sx={{
              width: '100%',
              maxWidth: 320,
              aspectRatio: '1 / 1',
              display: 'grid',
              gridTemplateColumns: 'repeat(9, 1fr)',
              gridTemplateRows: 'repeat(9, 1fr)',
              border: '2px solid',
              borderColor: 'divider',
              borderRadius: 1.5,
              overflow: 'hidden',
              bgcolor: 'background.paper',
              boxShadow: (theme) => theme.shadows[2],
            }}
          >
            {previewBoard.map((row, r) =>
              row.map((val, c) => {
                const borderRight = (c + 1) % 3 === 0 && c !== 8 ? '2px solid' : '1px solid';
                const borderBottom = (r + 1) % 3 === 0 && r !== 8 ? '2px solid' : '1px solid';
                const isConflicted = previewConflicts.has(`${r}-${c}`);

                return (
                  <Box
                    key={`${r}-${c}`}
                    onClick={() => handlePreviewCellClick(r, c)}
                    onDoubleClick={() => handlePreviewCellDoubleClick(r, c)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRight,
                      borderBottom,
                      borderColor: isConflicted ? 'error.main' : 'divider',
                      cursor: 'pointer',
                      userSelect: 'none',
                      bgcolor: isConflicted
                        ? 'rgba(255, 86, 48, 0.2)'
                        : val !== 0
                          ? 'action.selected'
                          : 'transparent',
                      transition: 'background-color 0.15s',
                      '&:hover': {
                        bgcolor: isConflicted ? 'rgba(255, 86, 48, 0.35)' : 'primary.lighter',
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '0.95rem',
                        fontWeight: val !== 0 ? 800 : 400,
                        color: isConflicted
                          ? 'error.main'
                          : val !== 0
                            ? 'text.primary'
                            : 'transparent',
                      }}
                    >
                      {val || 0}
                    </Typography>
                  </Box>
                );
              })
            )}
          </Box>

          <Button
            size="small"
            color="inherit"
            startIcon={<RestartAltRoundedIcon />}
            onClick={() => setPreviewBoard(createEmptyBoard())}
            sx={{ fontSize: '0.75rem', color: 'text.secondary' }}
          >
            미리보기 초기화
          </Button>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.5, justifyContent: 'space-between' }}>
        <Button
          onClick={resetState}
          color="inherit"
          startIcon={<RestartAltRoundedIcon />}
          disabled={isProcessing}
        >
          전체 초기화
        </Button>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button onClick={handleClose} color="inherit" disabled={isProcessing}>
            닫기
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CheckCircleRoundedIcon />}
            onClick={handleApply}
            disabled={filledCount === 0 || isProcessing || previewConflicts.size > 0}
          >
            스도쿠 판에 적용하기 ({filledCount}칸)
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
