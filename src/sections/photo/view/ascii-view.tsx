'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import TextFieldsRoundedIcon from '@mui/icons-material/TextFieldsRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

import { downloadDataUrl, shareToKakaoTalk } from '../utils/image-processor';

type CharsetType = 'standard' | 'dense' | 'korean' | 'binary' | 'custom';
type ThemeType = 'dark' | 'matrix' | 'color' | 'cyber' | 'paper';

interface CharsetOption {
  id: CharsetType;
  name: string;
  chars: string;
}

const CHARSETS: CharsetOption[] = [
  { id: 'standard', name: '표준 문자', chars: ' .:-=+*#%@' },
  {
    id: 'dense',
    name: '고밀도 영문',
    chars: ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
  },
  { id: 'korean', name: '한글 자모', chars: ' .·:ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ' },
  { id: 'binary', name: '2진수 0/1', chars: ' 01' },
];

export function AsciiView() {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [charset, setCharset] = useState<CharsetType>('standard');
  const [customChars, setCustomChars] = useState<string>(' .:;+=xX$&');
  const [columns, setColumns] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [inverted, setInverted] = useState<boolean>(false);
  const [theme, setTheme] = useState<ThemeType>('dark');
  const [fontSize, setFontSize] = useState<number>(10);

  const [asciiText, setAsciiText] = useState<string>('');
  const [asciiColoredData, setAsciiColoredData] = useState<
    Array<{ char: string; color: string }[]>
  >([]);
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(360);

  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(360);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const newWidth = Math.max(280, Math.min(650, resizeStartWidthRef.current + deltaX));
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

  const processFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const { isDragActive, getRootProps } = useImageDropPaste({
    onFiles: (files) => {
      if (files[0]) processFile(files[0]);
    },
    multiple: false,
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
    if (e.target) e.target.value = '';
  };

  const generateAscii = useCallback(async () => {
    if (!imageSrc) {
      setAsciiText('');
      setAsciiColoredData([]);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = imageSrc;
    });

    const w = columns;
    const fontAspect = 0.55;
    const h = Math.round((img.height / img.width) * w * fontAspect);

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, 0, 0, w, h);
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    let chars = CHARSETS.find((c) => c.id === charset)?.chars || CHARSETS[0].chars;
    if (charset === 'custom' && customChars.length > 0) {
      chars = customChars;
    }

    const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    let textResult = '';
    const coloredResult: Array<{ char: string; color: string }[]> = [];

    for (let y = 0; y < h; y += 1) {
      let lineText = '';
      const lineColored: { char: string; color: string }[] = [];

      for (let x = 0; x < w; x += 1) {
        const idx = (y * w + x) * 4;
        let r = data[idx];
        let g = data[idx + 1];
        let b = data[idx + 2];

        if (contrast !== 100) {
          r = Math.min(255, Math.max(0, contrastFactor * (r - 128) + 128));
          g = Math.min(255, Math.max(0, contrastFactor * (g - 128) + 128));
          b = Math.min(255, Math.max(0, contrastFactor * (b - 128) + 128));
        }

        let brightness = 0.299 * r + 0.587 * g + 0.114 * b;
        if (inverted) {
          brightness = 255 - brightness;
        }

        const charIdx = Math.floor((brightness / 256) * chars.length);
        const char = chars[Math.min(chars.length - 1, Math.max(0, charIdx))];

        lineText += char;
        lineColored.push({
          char,
          color: `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`,
        });
      }

      textResult += `${lineText}\n`;
      coloredResult.push(lineColored);
    }

    setAsciiText(textResult);
    setAsciiColoredData(coloredResult);
  }, [imageSrc, charset, customChars, columns, contrast, inverted]);

  useEffect(() => {
    if (imageSrc) {
      const timer = setTimeout(() => {
        generateAscii();
      }, 150);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [imageSrc, charset, customChars, columns, contrast, inverted, generateAscii]);

  const handleCopyText = () => {
    if (!asciiText) return;
    navigator.clipboard.writeText(asciiText);
    toast.success('아스키 아트 텍스트가 클립보드에 복사되었습니다.');
  };

  const handleDownloadTxt = () => {
    if (!asciiText) return;
    const blob = new Blob([asciiText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ascii_art_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('TXT 파일로 다운로드되었습니다.');
  };

  const handleDownloadPng = async () => {
    if (!asciiText) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const lines = asciiText.split('\n').filter((l) => l.length > 0);
    const lineCount = lines.length;
    const maxLineLength = lines[0]?.length || 80;

    const charW = fontSize * 0.6;
    const charH = fontSize * 1.1;

    const canvasW = Math.round(maxLineLength * charW + 40);
    const canvasH = Math.round(lineCount * charH + 40);

    canvas.width = canvasW;
    canvas.height = canvasH;

    let bg = '#0f172a';
    let defaultColor = '#f8fafc';

    if (theme === 'matrix') {
      bg = '#000000';
      defaultColor = '#22c55e';
    } else if (theme === 'cyber') {
      bg = '#050515';
      defaultColor = '#06b6d4';
    } else if (theme === 'paper') {
      bg = '#fdfbf7';
      defaultColor = '#1e293b';
    }

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvasW, canvasH);

    ctx.font = `${fontSize}px "Courier New", monospace`;
    ctx.textBaseline = 'top';

    for (let y = 0; y < asciiColoredData.length; y += 1) {
      const line = asciiColoredData[y];
      for (let x = 0; x < line.length; x += 1) {
        const item = line[x];
        ctx.fillStyle = theme === 'color' ? item.color : defaultColor;
        ctx.fillText(item.char, 20 + x * charW, 20 + y * charH);
      }
    }

    const dataUrl = canvas.toDataURL('image/png');
    const res = await downloadDataUrl(dataUrl, `ascii_art_${theme}_${Date.now()}.png`);
    toast.success(res.message);
  };

  const handleShare = async () => {
    if (!asciiText) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const res = await shareToKakaoTalk(dataUrl, '아스키 아트', `ascii_${Date.now()}.png`);
    toast.success(res.message);
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
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          ASCII 아스키 아트 생성기 (ASCII Art Studio)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          사진을 정밀 텍스트 문자로 변환하여 클립보드 복사 및 고해상도 PNG/TXT 파일로 내보냅니다.
        </Typography>
      </Box>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {!imageSrc ? (
        <Card
          {...getRootProps({
            onClick: () => fileInputRef.current?.click(),
          })}
          sx={{
            p: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'divider',
            bgcolor: isDragActive ? 'action.hover' : 'transparent',
            borderRadius: 3,
            flex: '1 1 auto',
            minHeight: 0,
            height: '100%',
            transition: (t) => t.transitions.create(['border-color', 'background-color']),
            '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: 'primary.lighter',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <TextFieldsRoundedIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            아스키 아트로 변환할 사진 업로드
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            사진을 끌어다 놓거나 클릭하여 선택하세요
          </Typography>
          <Button variant="contained" color="primary" startIcon={<CloudUploadRoundedIcon />}>
            사진 선택하기
          </Button>
        </Card>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 2, md: 0 },
            flex: '1 1 auto',
            minHeight: 0,
            height: '100%',
            position: 'relative',
          }}
        >
          {/* Left: Ascii Screen */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: '1 1 0px',
              minWidth: 0,
              minHeight: 0,
              height: '100%',
              pr: { md: 1 },
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
                height: '100%',
              }}
            >
              {/* Theme selector tabs */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1.5,
                  flexShrink: 0,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  출력 테마
                </Typography>
                <ToggleButtonGroup
                  size="small"
                  value={theme}
                  exclusive
                  onChange={(_, v) => v && setTheme(v)}
                >
                  <ToggleButton value="dark">다크</ToggleButton>
                  <ToggleButton value="matrix">매트릭스</ToggleButton>
                  <ToggleButton value="color">풀컬러</ToggleButton>
                  <ToggleButton value="cyber">사이버</ToggleButton>
                  <ToggleButton value="paper">종이</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  flex: '1 1 auto',
                  minHeight: 0,
                  height: '100%',
                  bgcolor:
                    theme === 'matrix'
                      ? '#000000'
                      : theme === 'cyber'
                        ? '#050515'
                        : theme === 'paper'
                          ? '#fdfbf7'
                          : '#0f172a',
                  color:
                    theme === 'matrix'
                      ? '#22c55e'
                      : theme === 'cyber'
                        ? '#06b6d4'
                        : theme === 'paper'
                          ? '#1e293b'
                          : '#f8fafc',
                  borderRadius: 2,
                  p: 2,
                  overflow: 'auto',
                  fontFamily: '"Courier New", monospace',
                  fontSize: `${fontSize}px`,
                  lineHeight: '1.05',
                  letterSpacing: '0.05em',
                  whiteSpace: 'pre',
                  userSelect: 'text',
                }}
              >
                {theme === 'color' ? (
                  asciiColoredData.map((line, lIdx) => (
                    <div key={lIdx}>
                      {line.map((item, cIdx) => (
                        <span key={cIdx} style={{ color: item.color }}>
                          {item.char}
                        </span>
                      ))}
                    </div>
                  ))
                ) : (
                  <pre style={{ margin: 0, fontFamily: 'inherit' }}>{asciiText}</pre>
                )}
              </Box>
            </Card>
          </Box>

          {/* Draggable Divider (Desktop) */}
          <Box
            onPointerDown={handleDividerPointerDown}
            onPointerMove={handleDividerPointerMove}
            onPointerUp={handleDividerPointerUp}
            sx={{
              display: { xs: 'none', md: 'flex' },
              width: 16,
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'col-resize',
              userSelect: 'none',
              touchAction: 'none',
              zIndex: 10,
              flexShrink: 0,
              position: 'relative',
              '&:hover .divider-bar, &:active .divider-bar': {
                bgcolor: 'primary.main',
                width: '3px',
              },
              '&:hover .divider-handle, &:active .divider-handle': {
                bgcolor: 'primary.main',
                borderColor: 'primary.main',
                '& > div > div': {
                  bgcolor: '#ffffff',
                },
              },
            }}
          >
            {/* Divider Line */}
            <Box
              className="divider-bar"
              sx={{
                width: '2px',
                height: '100%',
                bgcolor: 'divider',
                borderRadius: '1px',
                transition: 'all 0.15s ease',
              }}
            />
            {/* Grab Handle */}
            <Box
              className="divider-handle"
              sx={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                width: 14,
                height: 36,
                borderRadius: 1,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
                pointerEvents: 'none',
              }}
            >
              <Box
                sx={{
                  width: 4,
                  height: 14,
                  display: 'flex',
                  justifyContent: 'space-between',
                  '& > div': {
                    width: 1.5,
                    height: '100%',
                    bgcolor: 'text.disabled',
                    borderRadius: 1,
                    transition: 'all 0.15s ease',
                  },
                }}
              >
                <div />
                <div />
              </Box>
            </Box>
          </Box>

          {/* Right: Controls & Actions */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: { xs: '100%', md: `${rightPanelWidth}px` },
              minWidth: { md: `${rightPanelWidth}px` },
              maxWidth: { md: `${rightPanelWidth}px` },
              flexShrink: 0,
              gap: 2,
              minHeight: 0,
              overflow: 'auto',
              pl: { md: 1 },
              pr: 0.5,
            }}
          >
            <Card sx={{ p: 2.5, borderRadius: 3 }}>
              {/* Charset Selector */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                1. 문자 세트
              </Typography>
              <ToggleButtonGroup
                value={charset}
                exclusive
                onChange={(_, v) => v && setCharset(v)}
                fullWidth
                size="small"
                sx={{ mb: 2 }}
              >
                {CHARSETS.map((c) => (
                  <ToggleButton key={c.id} value={c.id}>
                    {c.name}
                  </ToggleButton>
                ))}
                <ToggleButton value="custom">직접 입력</ToggleButton>
              </ToggleButtonGroup>

              {charset === 'custom' && (
                <TextField
                  fullWidth
                  size="small"
                  label="사용할 문자열 (어두운 순서대로)"
                  value={customChars}
                  onChange={(e) => setCustomChars(e.target.value)}
                  sx={{ mb: 2 }}
                />
              )}

              {/* Sliders */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    가로 글자 수 (해상도)
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {columns} 글자
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  min={40}
                  max={200}
                  value={columns}
                  onChange={(_, v) => setColumns(v as number)}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    대비 조절
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {contrast}%
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  min={50}
                  max={200}
                  value={contrast}
                  onChange={(_, v) => setContrast(v as number)}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    화면 폰트 크기
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {fontSize}px
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  min={6}
                  max={18}
                  value={fontSize}
                  onChange={(_, v) => setFontSize(v as number)}
                />
              </Box>

              <FormControlLabel
                control={
                  <Switch checked={inverted} onChange={(e) => setInverted(e.target.checked)} />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    명암 반전 (Invert)
                  </Typography>
                }
              />
            </Card>

            {/* Action Buttons */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1.25,
                mt: 'auto',
                pt: 0.5,
              }}
            >
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                onClick={() => {
                  setImageSrc('');
                  setAsciiText('');
                }}
                startIcon={<RefreshRoundedIcon />}
                sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
              >
                다른 사진 선택
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleDownloadPng}
                startIcon={<DownloadRoundedIcon />}
                sx={{ py: 1.4, borderRadius: 2, fontWeight: 700, fontSize: '0.95rem' }}
              >
                PNG 이미지 저장
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                onClick={handleCopyText}
                startIcon={<ContentCopyRoundedIcon />}
                sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
              >
                텍스트 복사
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                onClick={handleDownloadTxt}
                startIcon={<DownloadRoundedIcon />}
                sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
              >
                TXT 파일 저장
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                onClick={handleShare}
                startIcon={<ShareRoundedIcon />}
                sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
              >
                공유
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </DashboardContent>
  );
}
