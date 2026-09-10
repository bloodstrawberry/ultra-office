'use client';

import type { NonogramPreset } from '../utils/nonogram-solver';
import type { NonogramLayout, NonogramOcrResult } from '../utils/nonogram-ocr';

import { useRef, useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LinearProgress from '@mui/material/LinearProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';

import { parseClueText, validateClues, solveNonogramClues } from '../utils/nonogram-clues';
import { splitNonogramClueLines, NonogramOcrEditableTable } from './nonogram-ocr-editable-table';
import {
  nonogramCanvas,
  recognizeNonogram,
  NONOGRAM_OCR_MODELS,
  detectNonogramLayout,
} from '../utils/nonogram-ocr';

const DEFAULT_LAYOUT: NonogramLayout = {
  left: 30,
  top: 30,
  right: 95,
  bottom: 95,
  rows: 10,
  cols: 10,
};

export function NonogramProblemUploadDialog({
  open,
  onClose,
  onApplyPreset,
}: {
  open: boolean;
  onClose: () => void;
  onApplyPreset: (preset: NonogramPreset) => void;
}) {
  const [preview, setPreview] = useState('');
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);
  const [models, setModels] = useState<string[]>(NONOGRAM_OCR_MODELS.map((model) => model.id));
  const [results, setResults] = useState<NonogramOcrResult[]>([]);
  const [selected, setSelected] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [name, setName] = useState('업로드한 문제');
  const [dragging, setDragging] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const controller = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const input = useRef<HTMLInputElement | null>(null);

  const selectedResult = results.find((result) => result.id === selected);
  const rows = parseClueText(selectedResult?.rows || '');
  const cols = parseClueText(selectedResult?.cols || '');
  const issues = selectedResult ? validateClues(rows, cols) : [];
  if (selectedResult && (rows.length !== layout.rows || cols.length !== layout.cols))
    issues.push('입력 줄 수가 행·열 수와 다릅니다.');
  const reference = useMemo(
    () =>
      results.find((result) => !result.errors.length && result.rows && result.cols) || results[0],
    [results]
  );

  useEffect(
    () => () => {
      generation.current += 1;
      controller.current?.abort();
    },
    []
  );

  const clearResults = () => {
    setResults([]);
    setSelected('');
    setError('');
  };

  const load = async (file: File) => {
    if (busy) return;
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일을 선택하세요.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('20MB 이하 이미지를 선택하세요.');
      return;
    }
    const id = ++generation.current;
    clearResults();
    setBusy(true);
    setMessage('이미지 및 격자 확인');
    setProgress(0);
    setPreview('');
    canvasRef.current = null;
    try {
      const canvas = await nonogramCanvas(file);
      if (id !== generation.current) return;
      canvasRef.current = canvas;
      setPreview(canvas.toDataURL());
      const detected = detectNonogramLayout(canvas);
      setLayout(detected || DEFAULT_LAYOUT);
      setName(file.name.replace(/\.[^.]+$/, '').slice(0, 40) || '업로드한 문제');
      if (!detected)
        setError('격자를 자동 감지하지 못했습니다. 초록색 영역을 답안 격자에 맞춰주세요.');
    } catch (loadError) {
      if (id === generation.current)
        setError(loadError instanceof Error ? loadError.message : '이미지 로딩 실패');
    } finally {
      if (id === generation.current) setBusy(false);
    }
  };

  useEffect(() => {
    if (!open) return undefined;
    const paste = (event: ClipboardEvent) => {
      const file = Array.from(event.clipboardData?.items || [])
        .find((item) => item.type.startsWith('image/'))
        ?.getAsFile();
      if (file && !busy) {
        event.preventDefault();
        void load(file);
      }
    };
    window.addEventListener('paste', paste);
    return () => window.removeEventListener('paste', paste);
  });

  const close = () => {
    generation.current += 1;
    controller.current?.abort();
    setBusy(false);
    setPreview('');
    setLayout(DEFAULT_LAYOUT);
    setResults([]);
    setSelected('');
    setProgress(0);
    setMessage('');
    setError('');
    setName('업로드한 문제');
    setDragging(false);
    canvasRef.current = null;
    onClose();
  };

  const run = async () => {
    if (!canvasRef.current || busy) return;
    const abort = new AbortController();
    const recognized: NonogramOcrResult[] = [];
    controller.current = abort;
    clearResults();
    setBusy(true);
    setProgress(0);
    try {
      await recognizeNonogram(
        canvasRef.current,
        layout,
        models,
        (text, percentage) => {
          if (!abort.signal.aborted) {
            setMessage(text);
            setProgress(percentage);
          }
        },
        (result) => {
          if (!abort.signal.aborted) {
            recognized.push(result);
            setResults([...recognized]);
          }
        },
        abort.signal
      );
      if (!abort.signal.aborted && recognized.length) {
        const best =
          recognized.find((result) => !result.errors.length && result.rows) || recognized[0];
        setSelected(best.rows ? best.id : '');
      }
    } catch (recognitionError) {
      if (!abort.signal.aborted)
        setError(recognitionError instanceof Error ? recognitionError.message : '인식 실패');
    } finally {
      if (!abort.signal.aborted) setBusy(false);
    }
  };

  const editResult = (id: string, axis: 'rows' | 'cols', index: number, value: string) => {
    setResults((current) =>
      current.map((result) => {
        if (result.id !== id) return result;
        const lines = splitNonogramClueLines(
          result[axis],
          axis === 'rows' ? layout.rows : layout.cols
        );
        lines[index] = value;
        const next = { ...result, [axis]: lines.join('\n') };
        return {
          ...next,
          errors: validateClues(parseClueText(next.rows), parseClueText(next.cols)),
        };
      })
    );
    setSelected(id);
    setError('');
  };

  const apply = () => {
    if (!selectedResult) return;
    try {
      const solution = solveNonogramClues(rows, cols);
      onApplyPreset({
        id: `ocr-${Date.now()}`,
        name: name.trim() || '업로드한 문제',
        width: cols.length,
        height: rows.length,
        rowClues: rows,
        colClues: cols,
        solution,
      });
      close();
    } catch (applyError) {
      setError(applyError instanceof Error ? applyError.message : '문제 적용 실패');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      fullWidth
      maxWidth="xl"
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2,
          height: { xs: '96vh', md: 850 },
          maxHeight: '96vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <DialogTitle
        sx={{
          pb: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
          fontWeight: 800,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeRoundedIcon color="primary" />
          문제 이미지에서 숫자 읽기 · 모델별 표 비교
        </Box>
        <Typography variant="caption" color="text.secondary">
          Drag & Drop · Ctrl+V · 각 모델 표에서 즉시 수정
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ flex: 1, p: 2.5, overflow: { xs: 'auto', md: 'hidden' } }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            height: { xs: 'auto', md: '100%' },
            gap: 2.5,
            minHeight: 0,
          }}
        >
          <Box
            sx={{
              width: { xs: '100%', md: 390 },
              minWidth: { md: 390 },
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              overflowY: { xs: 'visible', md: 'auto' },
              pr: { md: 0.5 },
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              1. 문제 이미지 업로드
            </Typography>
            <Box
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                if (event.dataTransfer.files[0]) void load(event.dataTransfer.files[0]);
              }}
              sx={{
                minHeight: preview ? 350 : 460,
                flex: preview ? '0 0 auto' : 1,
                border: '2px dashed',
                borderColor: dragging ? 'primary.main' : 'divider',
                borderRadius: 2,
                bgcolor: dragging ? 'action.hover' : 'background.neutral',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1.5,
                p: 1.5,
                overflow: 'hidden',
              }}
            >
              <input
                ref={input}
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = '';
                  if (file) void load(file);
                }}
              />
              {preview ? (
                <Box sx={{ position: 'relative', maxWidth: '100%', maxHeight: 300 }}>
                  <Box
                    component="img"
                    src={preview}
                    alt="업로드한 문제와 인식할 격자 영역"
                    sx={{
                      display: 'block',
                      maxWidth: '100%',
                      maxHeight: 300,
                      objectFit: 'contain',
                    }}
                  />
                  <Box
                    sx={{
                      pointerEvents: 'none',
                      position: 'absolute',
                      border: '2px solid',
                      borderColor: 'success.main',
                      bgcolor: 'rgba(0,180,100,0.08)',
                      left: `${layout.left}%`,
                      top: `${layout.top}%`,
                      width: `${layout.right - layout.left}%`,
                      height: `${layout.bottom - layout.top}%`,
                    }}
                  />
                </Box>
              ) : (
                <>
                  <CloudUploadRoundedIcon color="primary" sx={{ fontSize: 64 }} />
                  <Typography sx={{ fontWeight: 800 }}>문제 이미지를 여기에 놓으세요</Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    숫자 단서가 격자 왼쪽과 위쪽에 있는 이미지
                    <br />
                    PNG · JPG · WebP · 최대 20MB
                  </Typography>
                </>
              )}
              <Button
                variant={preview ? 'outlined' : 'contained'}
                startIcon={<CloudUploadRoundedIcon />}
                disabled={busy}
                onClick={() => input.current?.click()}
              >
                {preview ? '다른 이미지 선택' : '문제 이미지 선택'}
              </Button>
            </Box>

            {preview && (
              <>
                <Typography variant="caption" color="text.secondary">
                  초록색 테두리가 답안 격자입니다. 자동 감지가 어긋나면 아래 값을 조정하세요.
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.8 }}>
                  {(
                    [
                      ['rows', '행 수'],
                      ['cols', '열 수'],
                      ['left', '왼쪽 %'],
                      ['top', '위 %'],
                      ['right', '오른쪽 %'],
                      ['bottom', '아래 %'],
                    ] as const
                  ).map(([key, label]) => (
                    <TextField
                      key={key}
                      label={label}
                      type="number"
                      size="small"
                      value={Number(layout[key].toFixed(2))}
                      disabled={busy}
                      onChange={(event) => {
                        setLayout((current) => ({ ...current, [key]: Number(event.target.value) }));
                        clearResults();
                      }}
                    />
                  ))}
                </Box>
                <Box>
                  {NONOGRAM_OCR_MODELS.map((model) => (
                    <FormControlLabel
                      key={model.id}
                      sx={{ display: 'flex', my: -0.5 }}
                      label={<Typography variant="body2">{model.name}</Typography>}
                      control={
                        <Checkbox
                          size="small"
                          checked={models.includes(model.id)}
                          disabled={busy}
                          onChange={(_, checked) =>
                            setModels((current) =>
                              checked
                                ? [...current, model.id]
                                : current.filter((id) => id !== model.id)
                            )
                          }
                        />
                      }
                    />
                  ))}
                </Box>
                <Button
                  variant="contained"
                  startIcon={<CompareArrowsRoundedIcon />}
                  disabled={busy || !models.length}
                  onClick={run}
                >
                  선택한 모델로 인식·비교
                </Button>
              </>
            )}
            {busy && (
              <Box>
                <Typography variant="caption">{message}</Typography>
                <LinearProgress variant="determinate" value={progress} sx={{ my: 0.5 }} />
                <Button
                  size="small"
                  onClick={() => {
                    controller.current?.abort();
                    generation.current += 1;
                    setBusy(false);
                  }}
                >
                  인식 취소
                </Button>
              </Box>
            )}
            {error && <Alert severity="warning">{error}</Alert>}
          </Box>

          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              minHeight: { xs: 500, md: 0 },
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}
            >
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  2. 모델별 인식표 비교 · 직접 수정
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  각 표의 행·열 숫자를 직접 수정할 수 있습니다. 수정 내용은 다른 모델 표에 영향을
                  주지 않습니다.
                </Typography>
              </Box>
              {!!results.length && (
                <TextField
                  label="문제 이름"
                  size="small"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              )}
            </Box>

            {results.length ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                  overflow: 'auto',
                  pb: 1,
                  flex: 1,
                }}
              >
                {results.map((result) => (
                  <NonogramOcrEditableTable
                    key={result.id}
                    result={result}
                    layout={layout}
                    reference={reference}
                    selected={selected === result.id}
                    disabled={busy}
                    onEdit={(axis, index, value) => editResult(result.id, axis, index, value)}
                    onSelect={() => {
                      setSelected(result.id);
                      setError('');
                    }}
                  />
                ))}
              </Box>
            ) : (
              <Box
                sx={{
                  flex: 1,
                  minHeight: 400,
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: 'background.neutral',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  textAlign: 'center',
                  p: 3,
                }}
              >
                <CompareArrowsRoundedIcon sx={{ fontSize: 58, color: 'text.disabled' }} />
                <Typography sx={{ fontWeight: 800 }}>모델별 인식표가 여기에 표시됩니다</Typography>
                <Typography variant="body2" color="text.secondary">
                  이미지를 선택한 뒤 인식·비교 버튼을 누르세요.
                  <br />각 표를 독립적으로 수정하고 선택할 수 있습니다.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 2.5 }}>
        {selectedResult && (
          <Typography
            variant="caption"
            color={issues.length ? 'warning.main' : 'success.main'}
            sx={{ mr: 'auto' }}
          >
            {issues.length
              ? `선택한 표 확인 필요: ${issues.slice(0, 2).join(' / ')}`
              : `선택한 표: ${selectedResult.name} · ${layout.rows}×${layout.cols} · 적용 가능`}
          </Typography>
        )}
        <Button onClick={close}>닫기</Button>
        <Button
          variant="contained"
          disabled={busy || !selectedResult || issues.length > 0}
          onClick={apply}
        >
          선택한 표로 문제 적용
        </Button>
      </DialogActions>
    </Dialog>
  );
}
