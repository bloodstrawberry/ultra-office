'use client';

import JSZip from 'jszip';
import gifshot from 'gifshot';
import { toast } from 'sonner';
import { createWorker } from 'tesseract.js';
import React, { useRef, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import LinearProgress from '@mui/material/LinearProgress';
import GifRoundedIcon from '@mui/icons-material/GifRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import TransformRoundedIcon from '@mui/icons-material/TransformRounded';
import TextFieldsRoundedIcon from '@mui/icons-material/TextFieldsRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

export function ImageToolView() {
  const [currentTab, setCurrentTab] = useState<'anonymize' | 'ocr' | 'convert' | 'gif' | 'hub'>(
    'anonymize'
  );

  // Tab 1: Anonymize & Mosaic State
  const [anonImageSrc, setAnonImageSrc] = useState<string | null>(null);
  const [blurIntensity, setBlurIntensity] = useState<number>(15);
  const [blurMode, setBlurMode] = useState<'pixelate' | 'blur'>('pixelate');
  const anonCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Tab 2: OCR State
  const [ocrImageSrc, setOcrImageSrc] = useState<string | null>(null);
  const [ocrLang, setOcrLang] = useState<string>('kor+eng');
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [ocrStatus, setOcrStatus] = useState<string>('');
  const [isOcrLoading, setIsOcrLoading] = useState<boolean>(false);
  const [ocrResultText, setOcrResultText] = useState<string>('');

  // Tab 3: Format Convert State
  const [convertFiles, setConvertFiles] = useState<File[]>([]);
  const [targetFormat, setTargetFormat] = useState<string>('webp');
  const [convertQuality, setConvertQuality] = useState<number>(90);
  const [isConverting, setIsConverting] = useState<boolean>(false);

  // Tab 4: GIF State
  const [gifFiles, setGifFiles] = useState<File[]>([]);
  const [gifInterval, setGifInterval] = useState<number>(0.3); // seconds per frame
  const [isGeneratingGif, setIsGeneratingGif] = useState<boolean>(false);
  const [generatedGifUrl, setGeneratedGifUrl] = useState<string | null>(null);

  // --------------------------------------------------------------------
  // Handlers for Tab 1 (Anonymize)
  // --------------------------------------------------------------------
  const processAnonFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        setAnonImageSrc(src);
        renderAnonCanvas(src, blurIntensity, blurMode);
      };
      reader.readAsDataURL(file);
    },
    [blurIntensity, blurMode]
  );

  const handleAnonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processAnonFile(file);
    if (e.target) e.target.value = '';
  };

  const renderAnonCanvas = (src: string, intensity: number, mode: 'pixelate' | 'blur') => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = anonCanvasRef.current;
      if (!canvas) return;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw original
      ctx.drawImage(img, 0, 0);

      // Simulate AI Auto Masking / Mosaic on center 35%
      const faceW = img.width * 0.35;
      const faceH = img.height * 0.35;
      const faceX = (img.width - faceW) / 2;
      const faceY = (img.height - faceH) / 2.5;

      if (mode === 'pixelate') {
        const pSize = Math.max(4, Math.round(intensity / 2));
        const imgData = ctx.getImageData(faceX, faceY, faceW, faceH);
        const { data } = imgData;

        for (let y = 0; y < faceH; y += pSize) {
          for (let x = 0; x < faceW; x += pSize) {
            const redIndex = (y * faceW + x) * 4;
            const r = data[redIndex];
            const g = data[redIndex + 1];
            const b = data[redIndex + 2];

            for (let n = 0; n < pSize && y + n < faceH; n += 1) {
              for (let m = 0; m < pSize && x + m < faceW; m += 1) {
                const targetIdx = ((y + n) * faceW + (x + m)) * 4;
                data[targetIdx] = r;
                data[targetIdx + 1] = g;
                data[targetIdx + 2] = b;
              }
            }
          }
        }
        ctx.putImageData(imgData, faceX, faceY);
      } else {
        ctx.save();
        ctx.filter = `blur(${intensity}px)`;
        ctx.drawImage(img, faceX, faceY, faceW, faceH, faceX, faceY, faceW, faceH);
        ctx.restore();
      }
    };
    img.src = src;
  };

  const handleDownloadAnon = () => {
    if (!anonCanvasRef.current) return;
    const url = anonCanvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = 'anonymized_photo.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('익명화 이미지가 다운로드되었습니다.');
  };

  // --------------------------------------------------------------------
  // Handlers for Tab 2 (OCR Text Extract)
  // --------------------------------------------------------------------
  const processOcrFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      setOcrImageSrc(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleOcrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processOcrFile(file);
    if (e.target) e.target.value = '';
  };

  // --------------------------------------------------------------------
  // Drop & Paste Hooks
  // --------------------------------------------------------------------
  const anonDrop = useImageDropPaste({
    onFiles: (files) => {
      if (files[0]) processAnonFile(files[0]);
    },
    multiple: false,
    disabled: currentTab !== 'anonymize',
  });

  const ocrDrop = useImageDropPaste({
    onFiles: (files) => {
      if (files[0]) processOcrFile(files[0]);
    },
    multiple: false,
    disabled: currentTab !== 'ocr',
  });

  const convertDrop = useImageDropPaste({
    onFiles: (files) => {
      setConvertFiles((prev) => [...prev, ...files]);
    },
    multiple: true,
    disabled: currentTab !== 'convert',
  });

  const gifDrop = useImageDropPaste({
    onFiles: (files) => {
      setGifFiles((prev) => [...prev, ...files]);
    },
    multiple: true,
    disabled: currentTab !== 'gif',
  });

  const runOcr = async () => {
    if (!ocrImageSrc) {
      toast.error('먼저 이미지를 업로드해 주세요.');
      return;
    }

    try {
      setIsOcrLoading(true);
      setOcrProgress(10);
      setOcrStatus('OCR 엔진 초기화 중...');

      const worker = await createWorker(ocrLang);
      setOcrProgress(50);
      setOcrStatus('텍스트 인식 분석 중...');

      const ret = await worker.recognize(ocrImageSrc);
      setOcrResultText(ret.data.text);
      await worker.terminate();

      setOcrProgress(100);
      setOcrStatus('인식 완료!');
      toast.success('텍스트 추출이 완료되었습니다.');
    } catch {
      toast.error('OCR 처리 중 오류가 발생했습니다.');
    } finally {
      setIsOcrLoading(false);
    }
  };

  // --------------------------------------------------------------------
  // Handlers for Tab 3 (Format Batch Convert)
  // --------------------------------------------------------------------
  const handleBatchConvert = async () => {
    if (convertFiles.length === 0) {
      toast.error('변환할 이미지를 선택해 주세요.');
      return;
    }

    setIsConverting(true);
    try {
      const zip = new JSZip();

      for (let i = 0; i < convertFiles.length; i += 1) {
        const file = convertFiles[i];
        const bitmap = await createImageBitmap(file);
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(bitmap, 0, 0);
          const mimeType =
            targetFormat === 'png'
              ? 'image/png'
              : targetFormat === 'webp'
                ? 'image/webp'
                : 'image/jpeg';
          const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, mimeType, convertQuality / 100)
          );
          if (blob) {
            const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            zip.file(`${baseName}.${targetFormat}`, blob);
          }
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `converted_images_${targetFormat}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`${convertFiles.length}개 파일이 변환되어 ZIP으로 다운로드되었습니다.`);
    } catch {
      toast.error('변환 처리 중 오류가 발생했습니다.');
    } finally {
      setIsConverting(false);
    }
  };

  // --------------------------------------------------------------------
  // Handlers for Tab 4 (GIF Studio)
  // --------------------------------------------------------------------
  const handleGenerateGif = () => {
    if (gifFiles.length < 2) {
      toast.error('GIF를 생성하려면 2장 이상의 이미지가 필요합니다.');
      return;
    }

    setIsGeneratingGif(true);
    const imageUrls: string[] = [];

    let loaded = 0;
    gifFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        imageUrls.push(e.target?.result as string);
        loaded += 1;
        if (loaded === gifFiles.length) {
          gifshot.createGIF(
            {
              images: imageUrls,
              interval: gifInterval,
              gifWidth: 400,
              gifHeight: 300,
              fontSize: '16px',
              fontColor: '#ffffff',
            },
            (obj: { error: boolean; image: string }) => {
              setIsGeneratingGif(false);
              if (!obj.error) {
                setGeneratedGifUrl(obj.image);
                toast.success('GIF 애니메이션이 생성되었습니다!');
              } else {
                toast.error('GIF 생성에 실패했습니다.');
              }
            }
          );
        }
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <DashboardContent>
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          이미지 도구 워크스테이션 (Image Tools)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          익명화 모자이크, 다국어 OCR 텍스트 추출, 일괄 포맷 변환, 움직이는 GIF 애니메이션
          스튜디오를 제공합니다.
        </Typography>
      </Box>

      <Box sx={{ flexShrink: 0, mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={(_, v) => setCurrentTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            label="1. 익명화 & 모자이크"
            value="anonymize"
            icon={<AutoFixHighRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            label="2. 텍스트 추출 (OCR)"
            value="ocr"
            icon={<TextFieldsRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            label="3. 포맷 일괄 변환"
            value="convert"
            icon={<TransformRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            label="4. GIF 애니메이션"
            value="gif"
            icon={<GifRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            label="5. 포토 스튜디오 전체도구"
            value="hub"
            icon={<GridViewRoundedIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: 2 }}>
        {/* TAB 1: ANONYMIZE */}
        {currentTab === 'anonymize' && (
          <Box
            sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '360px 1fr' }, gap: 3 }}
          >
            <Card
              sx={{ p: 2.5, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                익명화 & 모자이크 설정
              </Typography>

              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUploadRoundedIcon />}
                sx={{ py: 1.2, fontWeight: 700 }}
              >
                사진 업로드
                <input type="file" hidden accept="image/*" onChange={handleAnonUpload} />
              </Button>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, mb: 1, display: 'block' }}>
                  가공 방식 선택
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    fullWidth
                    variant={blurMode === 'pixelate' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => {
                      setBlurMode('pixelate');
                      if (anonImageSrc) renderAnonCanvas(anonImageSrc, blurIntensity, 'pixelate');
                    }}
                  >
                    모자이크 (픽셀)
                  </Button>
                  <Button
                    fullWidth
                    variant={blurMode === 'blur' ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => {
                      setBlurMode('blur');
                      if (anonImageSrc) renderAnonCanvas(anonImageSrc, blurIntensity, 'blur');
                    }}
                  >
                    가우시안 블러
                  </Button>
                </Box>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, mb: 0.5, display: 'block' }}>
                  강도 조절 ({blurIntensity}px)
                </Typography>
                <Slider
                  value={blurIntensity}
                  min={4}
                  max={40}
                  onChange={(_, val) => {
                    const num = val as number;
                    setBlurIntensity(num);
                    if (anonImageSrc) renderAnonCanvas(anonImageSrc, num, blurMode);
                  }}
                />
              </Box>

              <Button
                variant="contained"
                color="success"
                startIcon={<DownloadRoundedIcon />}
                disabled={!anonImageSrc}
                onClick={handleDownloadAnon}
                sx={{ py: 1.2, fontWeight: 700, mt: 'auto' }}
              >
                가공 이미지 다운로드
              </Button>
            </Card>

            <Card
              {...anonDrop.getRootProps()}
              sx={{
                p: 2,
                borderRadius: 2,
                minHeight: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: anonDrop.isDragActive ? 'action.hover' : 'background.neutral',
                border: anonDrop.isDragActive ? '2px dashed' : 'none',
                borderColor: 'primary.main',
                transition: (theme) =>
                  theme.transitions.create(['border-color', 'background-color']),
              }}
            >
              {anonImageSrc ? (
                <canvas
                  ref={anonCanvasRef}
                  style={{ maxWidth: '100%', maxHeight: '600px', borderRadius: 8 }}
                />
              ) : (
                <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                  <AutoFixHighRoundedIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                  <Typography variant="body2">
                    사진을 업로드(클릭/드래그/붙여넣기)하면 실시간 마스킹 미리보기가 표시됩니다.
                  </Typography>
                </Box>
              )}
            </Card>
          </Box>
        )}

        {/* TAB 2: OCR */}
        {currentTab === 'ocr' && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Card
              {...ocrDrop.getRootProps()}
              sx={{
                p: 2.5,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                bgcolor: ocrDrop.isDragActive ? 'action.hover' : 'background.paper',
                border: ocrDrop.isDragActive ? '2px dashed' : 'none',
                borderColor: 'primary.main',
                transition: (theme) =>
                  theme.transitions.create(['border-color', 'background-color']),
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                이미지 텍스트 인식 (OCR)
              </Typography>

              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<CloudUploadRoundedIcon />}
                  sx={{ flex: 1, py: 1.2, fontWeight: 700 }}
                >
                  이미지 선택 (드래그/붙여넣기 지원)
                  <input type="file" hidden accept="image/*" onChange={handleOcrUpload} />
                </Button>

                <FormControl size="small" sx={{ width: 150 }}>
                  <InputLabel>인식 언어</InputLabel>
                  <Select
                    value={ocrLang}
                    label="인식 언어"
                    onChange={(e) => setOcrLang(e.target.value)}
                  >
                    <MenuItem value="kor+eng">한국어 + 영어</MenuItem>
                    <MenuItem value="kor">한국어 전용</MenuItem>
                    <MenuItem value="eng">영어 전용</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {ocrImageSrc && (
                <Box
                  sx={{
                    flex: 1,
                    minHeight: 280,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.neutral',
                    borderRadius: 1.5,
                    p: 1,
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={ocrImageSrc}
                    alt="OCR Target"
                    style={{
                      maxWidth: '100%',
                      maxHeight: 320,
                      objectFit: 'contain',
                      borderRadius: 6,
                    }}
                  />
                </Box>
              )}

              {isOcrLoading && (
                <Box sx={{ width: '100%' }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                    {ocrStatus} ({ocrProgress}%)
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={ocrProgress}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              )}

              <Button
                variant="contained"
                color="primary"
                disabled={!ocrImageSrc || isOcrLoading}
                onClick={runOcr}
                sx={{ py: 1.3, fontWeight: 700 }}
              >
                {isOcrLoading ? '텍스트 분석 중...' : '텍스트 추출 시작'}
              </Button>
            </Card>

            <Card sx={{ p: 2.5, borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1.5,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  추출된 텍스트 결과
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="클립보드 복사">
                    <IconButton
                      size="small"
                      onClick={() => {
                        navigator.clipboard.writeText(ocrResultText);
                        toast.success('텍스트가 복사되었습니다.');
                      }}
                    >
                      <ContentCopyRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="텍스트 파일(.txt) 다운로드">
                    <IconButton
                      size="small"
                      onClick={() => {
                        const blob = new Blob([ocrResultText], {
                          type: 'text/plain;charset=utf-8',
                        });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = 'ocr_extracted_text.txt';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <DownloadRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              <textarea
                value={ocrResultText}
                onChange={(e) => setOcrResultText(e.target.value)}
                placeholder="추출된 텍스트가 여기에 나타납니다. 직접 수정도 가능합니다."
                style={{
                  flex: 1,
                  minHeight: 340,
                  width: '100%',
                  padding: 12,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  outline: 'none',
                  fontFamily: 'inherit',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  resize: 'none',
                }}
              />
            </Card>
          </Box>
        )}

        {/* TAB 3: FORMAT BATCH CONVERT */}
        {currentTab === 'convert' && (
          <Card
            {...convertDrop.getRootProps()}
            sx={{
              p: 3,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              bgcolor: convertDrop.isDragActive ? 'action.hover' : 'background.paper',
              border: convertDrop.isDragActive ? '2px dashed' : 'none',
              borderColor: 'primary.main',
              transition: (theme) => theme.transitions.create(['border-color', 'background-color']),
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              이미지 확장자 일괄 변환 (Batch Convert & ZIP)
            </Typography>

            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadRoundedIcon />}
              sx={{
                py: 3,
                borderStyle: 'dashed',
                borderWidth: 2,
                borderRadius: 2,
                fontWeight: 700,
              }}
            >
              변환할 다중 이미지 파일 선택 (드래그 & 드롭 / 붙여넣기 지원)
              <input
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files) {
                    setConvertFiles((prev) => [...prev, ...Array.from(e.target.files || [])]);
                  }
                }}
              />
            </Button>

            {convertFiles.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="caption" sx={{ width: '100%', fontWeight: 700 }}>
                  선택된 파일 ({convertFiles.length}개):
                </Typography>
                {convertFiles.map((f, i) => (
                  <Chip
                    key={i}
                    label={`${f.name} (${Math.round(f.size / 1024)} KB)`}
                    size="small"
                  />
                ))}
              </Box>
            )}

            <Box
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}
            >
              <FormControl fullWidth size="small">
                <InputLabel>목표 확장자 포맷</InputLabel>
                <Select
                  value={targetFormat}
                  label="목표 확장자 포맷"
                  onChange={(e) => setTargetFormat(e.target.value)}
                >
                  <MenuItem value="webp">WebP (초경량 웹 표준)</MenuItem>
                  <MenuItem value="png">PNG (무손실 투명도)</MenuItem>
                  <MenuItem value="jpeg">JPG / JPEG (표준 압축)</MenuItem>
                </Select>
              </FormControl>

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, mb: 0.5, display: 'block' }}>
                  품질 설정 ({convertQuality}%)
                </Typography>
                <Slider
                  value={convertQuality}
                  min={30}
                  max={100}
                  onChange={(_, v) => setConvertQuality(v as number)}
                />
              </Box>
            </Box>

            <Button
              variant="contained"
              color="primary"
              size="large"
              disabled={convertFiles.length === 0 || isConverting}
              onClick={handleBatchConvert}
              sx={{ py: 1.4, fontWeight: 800 }}
            >
              {isConverting
                ? '일괄 변환 처리 중...'
                : `${convertFiles.length}개 파일 일괄 변환 및 ZIP 다운로드`}
            </Button>
          </Card>
        )}

        {/* TAB 4: GIF STUDIO */}
        {currentTab === 'gif' && (
          <Box
            sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '380px 1fr' }, gap: 3 }}
          >
            <Card
              {...gifDrop.getRootProps()}
              sx={{
                p: 2.5,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2.5,
                bgcolor: gifDrop.isDragActive ? 'action.hover' : 'background.paper',
                border: gifDrop.isDragActive ? '2px dashed' : 'none',
                borderColor: 'primary.main',
                transition: (theme) =>
                  theme.transitions.create(['border-color', 'background-color']),
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                GIF 움짤 생성 설정
              </Typography>

              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUploadRoundedIcon />}
                sx={{ py: 1.2, fontWeight: 700 }}
              >
                프레임 이미지들 선택 (드래그/붙여넣기 지원)
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files)
                      setGifFiles((prev) => [...prev, ...Array.from(e.target.files || [])]);
                  }}
                />
              </Button>

              {gifFiles.length > 0 && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  총 {gifFiles.length}장의 프레임이 로드되었습니다.
                </Typography>
              )}

              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, mb: 0.5, display: 'block' }}>
                  프레임 간격 ({gifInterval}초 / FPS {Math.round(1 / gifInterval)})
                </Typography>
                <Slider
                  value={gifInterval}
                  min={0.1}
                  max={1.0}
                  step={0.05}
                  onChange={(_, v) => setGifInterval(v as number)}
                />
              </Box>

              <Button
                variant="contained"
                color="primary"
                disabled={gifFiles.length < 2 || isGeneratingGif}
                onClick={handleGenerateGif}
                sx={{ py: 1.3, fontWeight: 700 }}
              >
                {isGeneratingGif ? 'GIF 렌더링 중...' : 'GIF 애니메이션 생성'}
              </Button>
            </Card>

            <Card
              sx={{
                p: 2.5,
                borderRadius: 2,
                minHeight: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.neutral',
              }}
            >
              {generatedGifUrl ? (
                <Box sx={{ textAlign: 'center' }}>
                  <img
                    src={generatedGifUrl}
                    alt="Generated GIF"
                    style={{ maxWidth: '100%', borderRadius: 8, marginBottom: 16 }}
                  />
                  <br />
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<DownloadRoundedIcon />}
                    href={generatedGifUrl}
                    download="animated_clip.gif"
                  >
                    GIF 다운로드
                  </Button>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                  <GifRoundedIcon sx={{ fontSize: 64, mb: 1, opacity: 0.5 }} />
                  <Typography variant="body2">
                    2장 이상의 이미지를 선택하고 생성을 누르면 여기에 GIF가 재생됩니다.
                  </Typography>
                </Box>
              )}
            </Card>
          </Box>
        )}

        {/* TAB 5: PHOTO STUDIO HUB SHORTCUTS */}
        {currentTab === 'hub' && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
              gap: 2,
            }}
          >
            {[
              {
                title: '화풍 변환 스튜디오',
                desc: '유화, 수채화, 사이버펑크 AI 스타일 변환',
                path: paths.photo.artStyle,
              },
              {
                title: '아스키 아트 생성기',
                desc: '사진을 감성적인 텍스트 아스키 아트로 변환',
                path: paths.photo.ascii,
              },
              {
                title: '픽셀 아트 변환기',
                desc: '레트로 8비트/16비트 도트 그래픽 효과',
                path: paths.photo.pixel,
              },
              {
                title: '인생네컷 프레임',
                desc: '포토부스 4컷 레이아웃 및 스티커 합성',
                path: paths.photo.fourCut,
              },
              {
                title: '사진 용량 압축기',
                desc: '화질 손실 없는 고효율 용량 압축',
                path: paths.photo.compress,
              },
              {
                title: '스포이드 색상 추출',
                desc: '이미지 픽셀 색상 추출 및 HEX/RGB 팔레트',
                path: paths.photo.colorPicker,
              },
              {
                title: '워터마크 각인',
                desc: '저작권 보호 텍스트 및 로고 각인',
                path: paths.photo.watermark,
              },
              {
                title: '도형 자르기',
                desc: '원형, 하트, 별 모양 크롭 마스킹',
                path: paths.photo.shapeCrop,
              },
              {
                title: 'PDF 스튜디오',
                desc: '다중 사진을 고품질 A4 PDF로 변환',
                path: paths.photo.pdf,
              },
            ].map((item, idx) => (
              <Card
                key={idx}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {item.desc}
                  </Typography>
                </Box>
                <Button
                  component={RouterLink}
                  href={item.path}
                  variant="outlined"
                  size="small"
                  sx={{ mt: 2, alignSelf: 'flex-start' }}
                >
                  도구 열기 →
                </Button>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </DashboardContent>
  );
}
