'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FunctionsRoundedIcon from '@mui/icons-material/FunctionsRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

import { MATH_EXAMPLES, MATH_SYMBOLS_PALETTE } from '../data/example-templates';

// ----------------------------------------------------------------------

declare global {
  interface Window {
    katex?: {
      renderToString: (
        tex: string,
        options?: { displayMode?: boolean; throwOnError?: boolean }
      ) => string;
    };
  }
}

export function MathStudio() {
  const [selectedExampleId, setSelectedExampleId] = useState<string>(MATH_EXAMPLES[0].id);
  const [latexInput, setLatexInput] = useState<string>(MATH_EXAMPLES[0].latex);
  const [displayMode, setDisplayMode] = useState<boolean>(true);
  const [renderedHtml, setRenderedHtml] = useState<string>('');
  const [katexLoaded, setKatexLoaded] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  // Load KaTeX dynamically on client mount
  useEffect(() => {
    let isMounted = true;

    // Load KaTeX CSS
    const linkId = 'katex-cdn-css';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }

    // Load KaTeX JS
    const scriptId = 'katex-cdn-js';
    if (!window.katex && !document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js';
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        if (isMounted) setKatexLoaded(true);
      };
      document.head.appendChild(script);
    } else if (window.katex) {
      setKatexLoaded(true);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Re-render LaTeX whenever latexInput, displayMode, or katexLoaded changes
  useEffect(() => {
    if (!latexInput.trim()) {
      setRenderedHtml('');
      setErrorMessage(null);
      return;
    }

    if (katexLoaded && window.katex) {
      try {
        const html = window.katex.renderToString(latexInput, {
          displayMode,
          throwOnError: true,
        });
        setRenderedHtml(html);
        setErrorMessage(null);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : '수식 문법 오류가 발생했습니다.';
        setErrorMessage(msg);
        try {
          // Fallback rendering with error highlighted
          const fallback = window.katex.renderToString(latexInput, {
            displayMode,
            throwOnError: false,
          });
          setRenderedHtml(fallback);
        } catch {
          setRenderedHtml('');
        }
      }
    }
  }, [latexInput, displayMode, katexLoaded]);

  const handleSelectExample = (id: string) => {
    setSelectedExampleId(id);
    const ex = MATH_EXAMPLES.find((e) => e.id === id);
    if (ex) {
      setLatexInput(ex.latex);
      toast.success(`'${ex.title}' 수식 예시를 불러왔습니다.`);
    }
  };

  const handleInsertSymbol = (code: string) => {
    setLatexInput((prev) => `${prev} ${code}`);
    toast.info(`기호 '${code}' 삽입됨`);
  };

  const handleCopyLatex = () => {
    navigator.clipboard.writeText(latexInput);
    toast.success('LaTeX 수식 코드가 클립보드에 복사되었습니다.');
  };

  const currentExample = MATH_EXAMPLES.find((e) => e.id === selectedExampleId);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        gap: 2,
      }}
    >
      {/* 1. Header Toolbar & Quick Examples */}
      <Card
        sx={{
          p: 2,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          boxShadow: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FunctionsRoundedIcon sx={{ color: 'primary.main', fontSize: 28 }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                수식 & LaTeX 스튜디오 (Math & LaTeX Studio)
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                수학, 과학, AI 머신러닝 공식을 LaTeX 문법으로 작성하고 실시간 렌더링합니다.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant={displayMode ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setDisplayMode(!displayMode)}
            >
              {displayMode ? '블록(Display) 모드' : '인라인(Inline) 모드'}
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RestartAltRoundedIcon />}
              onClick={() => setLatexInput('')}
            >
              초기화
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<ContentCopyRoundedIcon />}
              onClick={handleCopyLatex}
            >
              LaTeX 복사
            </Button>
          </Box>
        </Box>

        {/* Example Presets Chips */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeRoundedIcon sx={{ fontSize: 16, color: 'warning.main' }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              실전 수식 예시 템플릿 (10종):
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              gap: 0.8,
              overflowX: 'auto',
              pb: 0.5,
              '&::-webkit-scrollbar': { height: 4 },
              '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2 },
            }}
          >
            {MATH_EXAMPLES.map((ex) => {
              const isSelected = ex.id === selectedExampleId;
              return (
                <Chip
                  key={ex.id}
                  label={ex.title}
                  clickable
                  color={isSelected ? 'primary' : 'default'}
                  variant={isSelected ? 'filled' : 'outlined'}
                  size="small"
                  onClick={() => handleSelectExample(ex.id)}
                  sx={{
                    fontWeight: isSelected ? 800 : 500,
                    fontSize: '0.75rem',
                    flexShrink: 0,
                  }}
                />
              );
            })}
          </Box>
        </Box>
      </Card>

      {/* 2. Main Studio Grid (Editor & Live Preview) */}
      <Box
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
        }}
      >
        {/* Left Column: LaTeX Editor & Quick Symbol Palette */}
        <Card
          sx={{
            display: 'flex',
            flexDirection: 'column',
            p: 2,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1.5,
              flexShrink: 0,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <CalculateRoundedIcon sx={{ fontSize: 18, color: 'info.main' }} />
              LaTeX 수식 코드 입력
            </Typography>
            {currentExample && (
              <Chip
                label={currentExample.categoryLabel}
                size="small"
                variant="outlined"
                color="info"
                sx={{ fontSize: '0.7rem', height: 20 }}
              />
            )}
          </Box>

          <TextField
            inputRef={inputRef}
            multiline
            rows={7}
            fullWidth
            value={latexInput}
            onChange={(e) => setLatexInput(e.target.value)}
            placeholder="LaTeX 수식을 입력하세요... 예: x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}"
            sx={{
              flexShrink: 0,
              mb: 1.5,
              '& .MuiInputBase-root': {
                fontFamily: 'Consolas, Monaco, monospace',
                fontSize: '0.9rem',
                bgcolor: 'background.neutral',
              },
            }}
          />

          {errorMessage && (
            <Box
              sx={{
                mb: 1.5,
                p: 1,
                borderRadius: 1,
                bgcolor: 'error.lighter',
                color: 'error.main',
                fontSize: '0.75rem',
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              ⚠️ {errorMessage}
            </Box>
          )}

          {/* Symbol Palette */}
          <Box
            sx={{
              flex: '1 1 auto',
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.8, flexShrink: 0 }}
            >
              💡 자주 쓰는 수식 기호 팔레트 (클릭 시 자동 삽입)
            </Typography>
            <Box
              sx={{
                flex: '1 1 auto',
                overflowY: 'auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: 0.8,
                p: 0.5,
                bgcolor: 'background.neutral',
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              {MATH_SYMBOLS_PALETTE.map((sym, idx) => (
                <Button
                  key={idx}
                  variant="outlined"
                  size="small"
                  onClick={() => handleInsertSymbol(sym.code)}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    fontSize: '0.72rem',
                    py: 0.4,
                    px: 0.8,
                    bgcolor: 'background.paper',
                    borderColor: 'divider',
                    color: 'text.primary',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  {sym.label}
                </Button>
              ))}
            </Box>
          </Box>
        </Card>

        {/* Right Column: Live Math Rendering Preview & Formula Info */}
        <Card
          sx={{
            display: 'flex',
            flexDirection: 'column',
            p: 2,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1.5,
              flexShrink: 0,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              <CheckCircleRoundedIcon sx={{ fontSize: 18, color: 'success.main' }} />
              실시간 수식 렌더링 미리보기
            </Typography>
            <Chip
              label={katexLoaded ? 'KaTeX 엔진 연결됨' : 'KaTeX 로딩 중...'}
              size="small"
              color={katexLoaded ? 'success' : 'warning'}
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
          </Box>

          {/* Visual Formula Display Box */}
          <Box
            sx={{
              flex: '1 1 auto',
              minHeight: 180,
              overflow: 'auto',
              p: 3,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              bgcolor: 'background.neutral',
              borderRadius: 2,
              border: '2px dashed',
              borderColor: 'divider',
              textAlign: 'center',
            }}
          >
            {renderedHtml ? (
              <Box
                sx={{
                  fontSize: { xs: '1.2rem', sm: '1.5rem', md: '1.8rem' },
                  color: 'text.primary',
                  overflowX: 'auto',
                  maxWidth: '100%',
                  py: 2,
                }}
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            ) : (
              <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                수식 코드를 입력하면 이곳에 고해상도 수식이 실시간 렌더링됩니다.
              </Typography>
            )}
          </Box>

          {/* Current Formula Description Card */}
          {currentExample && (
            <Box
              sx={{
                mt: 1.5,
                p: 1.5,
                bgcolor: 'background.paper',
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                flexShrink: 0,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 800, color: 'primary.main', mb: 0.3 }}
              >
                {currentExample.title}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.5 }}
              >
                {currentExample.description}
              </Typography>
            </Box>
          )}
        </Card>
      </Box>
    </Box>
  );
}
