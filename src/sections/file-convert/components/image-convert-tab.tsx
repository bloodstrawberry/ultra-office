'use client';

import JSZip from 'jszip';
import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import PhotoLibraryRoundedIcon from '@mui/icons-material/PhotoLibraryRounded';
import TextFieldsRoundedIcon from '@mui/icons-material/TextFieldsRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import {
  formatBytes,
  downloadDataUrl,
  convertImageFormat,
  type SupportedFormat,
  calculateDataUrlByteSize,
} from '../../photo/utils/image-processor';

// ----------------------------------------------------------------------

interface ImageBatchItem {
  id: string;
  file: File;
  origUrl: string;
  origSize: number;
  resultUrl?: string;
  resultSize?: number;
  status: 'pending' | 'processing' | 'done' | 'error';
}

const IMAGE_FORMAT_OPTIONS: { id: SupportedFormat; label: string; desc: string }[] = [
  { id: 'png', label: 'PNG', desc: '무손실 투명도' },
  { id: 'jpg', label: 'JPG', desc: '고압축 사진 표준' },
  { id: 'webp', label: 'WebP', desc: '차세대 웹 포맷' },
  { id: 'avif', label: 'AVIF', desc: '초고효율 압축' },
  { id: 'ico', label: 'ICO', desc: '파비콘/아이콘' },
  { id: 'bmp', label: 'BMP', desc: '비압축 비트맵' },
];

export function ImageConvertTab() {
  const [imageSubTool, setImageSubTool] = useState<'convert' | 'ascii'>('convert');
  const [imgBatchItems, setImgBatchItems] = useState<ImageBatchItem[]>([]);
  const [targetImgFormat, setTargetImgFormat] = useState<SupportedFormat>('webp');
  const [imgQuality, setImgQuality] = useState<number>(90);
  const [icoSize, setIcoSize] = useState<number>(64);
  const [isImgProcessing, setIsImgProcessing] = useState<boolean>(false);

  // ASCII Art
  const [asciiSourceImg, setAsciiSourceImg] = useState<string>('');
  const [asciiResultText, setAsciiResultText] = useState<string>('');
  const [asciiColumns, setAsciiColumns] = useState<number>(80);

  const copyToClipboard = (text: string, label = '복사되었습니다.') => {
    navigator.clipboard.writeText(text);
    toast.success(label);
  };

  const imgBatchDrop = useImageDropPaste({
    onFiles: (files) => {
      const newItems: ImageBatchItem[] = files.map((f) => ({
        id: `${Date.now()}_${Math.random()}`,
        file: f,
        origUrl: URL.createObjectURL(f),
        origSize: f.size,
        status: 'pending',
      }));
      setImgBatchItems((prev) => [...prev, ...newItems]);
    },
    multiple: true,
    disabled: imageSubTool !== 'convert',
  });

  const asciiDrop = useImageDropPaste({
    onFiles: (files) => {
      if (files[0]) {
        const url = URL.createObjectURL(files[0]);
        setAsciiSourceImg(url);
      }
    },
    multiple: false,
    disabled: imageSubTool !== 'ascii',
  });

  const processImageBatch = async () => {
    const pending = imgBatchItems.filter((it) => it.status === 'pending');
    if (pending.length === 0) return;

    setIsImgProcessing(true);
    const updated = [...imgBatchItems];

    for (let i = 0; i < updated.length; i += 1) {
      const item = updated[i];
      if (item.status === 'pending') {
        item.status = 'processing';
        try {
          const res = await convertImageFormat(item.origUrl, {
            format: targetImgFormat,
            quality: imgQuality / 100,
            icoSize,
          });
          item.resultUrl = res.dataUrl;
          item.resultSize = calculateDataUrlByteSize(res.dataUrl);
          item.status = 'done';
        } catch {
          item.status = 'error';
        }
      }
    }

    setImgBatchItems([...updated]);
    setIsImgProcessing(false);
  };

  const reprocessAllImages = (fmt: SupportedFormat) => {
    setTargetImgFormat(fmt);
    setImgBatchItems((prev) => prev.map((it) => ({ ...it, status: 'pending' })));
  };

  useEffect(() => {
    if (imgBatchItems.some((it) => it.status === 'pending')) {
      processImageBatch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imgBatchItems, targetImgFormat, imgQuality, icoSize]);

  const handleDownloadAllImagesZip = async () => {
    const ready = imgBatchItems.filter((it) => it.status === 'done' && it.resultUrl);
    if (ready.length === 0) return;

    setIsImgProcessing(true);
    try {
      const zip = new JSZip();
      for (let i = 0; i < ready.length; i += 1) {
        const item = ready[i];
        const baseName = item.file.name.replace(/\.[^/.]+$/, '');
        const res = await fetch(item.resultUrl!);
        const blob = await res.blob();
        zip.file(`${baseName}.${targetImgFormat}`, blob);
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `converted_images_${targetImgFormat}_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`${ready.length}개 이미지가 ZIP 파일로 압축 다운로드되었습니다.`);
    } catch {
      toast.error('ZIP 생성 실패');
    } finally {
      setIsImgProcessing(false);
    }
  };

  const convertImageToAscii = async () => {
    if (!asciiSourceImg) {
      toast.error('아스키 아트로 변환할 이미지를 업로드해 주세요.');
      return;
    }
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = asciiSourceImg;
      await new Promise((res) => {
        img.onload = res;
      });

      const canvas = document.createElement('canvas');
      const aspect = img.height / img.width;
      const w = asciiColumns;
      const h = Math.round(w * aspect * 0.5);
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, w, h);

      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      const chars = ' .:-=+*#%@';

      let text = '';
      for (let y = 0; y < h; y += 1) {
        for (let x = 0; x < w; x += 1) {
          const idx = (y * w + x) * 4;
          const brightness =
            (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114) / 255;
          const charIdx = Math.floor((1 - brightness) * (chars.length - 1));
          text += chars[charIdx] || ' ';
        }
        text += '\n';
      }
      setAsciiResultText(text);
      toast.success('아스키 아트로 변환되었습니다.');
    } catch {
      toast.error('아스키 아트 변환 실패');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant={imageSubTool === 'convert' ? 'contained' : 'outlined'}
          startIcon={<PhotoLibraryRoundedIcon />}
          onClick={() => setImageSubTool('convert')}
        >
          6종 포맷 일괄 변환 (PNG·JPG·WebP·AVIF·ICO·BMP)
        </Button>
        <Button
          variant={imageSubTool === 'ascii' ? 'contained' : 'outlined'}
          startIcon={<TextFieldsRoundedIcon />}
          onClick={() => setImageSubTool('ascii')}
        >
          이미지 ➔ ASCII Art 텍스트 변환
        </Button>
      </Box>

      {/* Subtool 1: 6-Way Image Batch */}
      {imageSubTool === 'convert' && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' }, gap: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Card
              {...imgBatchDrop.getRootProps()}
              sx={{
                p: 3,
                borderRadius: 2,
                border: imgBatchDrop.isDragActive ? '2px dashed' : '1px solid',
                borderColor: imgBatchDrop.isDragActive ? 'primary.main' : 'divider',
                bgcolor: imgBatchDrop.isDragActive ? 'action.hover' : 'background.paper',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  변환 대상 이미지 목록 ({imgBatchItems.length}개)
                </Typography>
                {imgBatchItems.length > 0 && (
                  <Button size="small" color="error" onClick={() => setImgBatchItems([])}>
                    전체 삭제
                  </Button>
                )}
              </Box>

              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadRoundedIcon />}
                fullWidth
                sx={{
                  py: 2.5,
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  borderRadius: 2,
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                이미지 추가 (드래그 & 드롭 / 붙여넣기 지원)
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) {
                      const newItems: ImageBatchItem[] = Array.from(e.target.files).map((f) => ({
                        id: `${Date.now()}_${Math.random()}`,
                        file: f,
                        origUrl: URL.createObjectURL(f),
                        origSize: f.size,
                        status: 'pending',
                      }));
                      setImgBatchItems((prev) => [...prev, ...newItems]);
                    }
                  }}
                />
              </Button>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  maxHeight: 400,
                  overflowY: 'auto',
                }}
              >
                {imgBatchItems.map((item, idx) => (
                  <Box
                    key={item.id}
                    sx={{
                      p: 1.2,
                      borderRadius: 1.5,
                      bgcolor: 'action.hover',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1.5,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, width: 20 }}>
                        #{idx + 1}
                      </Typography>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 1,
                          overflow: 'hidden',
                          bgcolor: '#0f172a',
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={item.resultUrl || item.origUrl}
                          alt="thumb"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                          {item.file.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {formatBytes(item.origSize)} ➔{' '}
                          <span style={{ color: '#3b82f6', fontWeight: 800 }}>
                            {targetImgFormat.toUpperCase()} ({formatBytes(item.resultSize)})
                          </span>
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {item.status === 'processing' && <CircularProgress size={18} />}
                      {item.status === 'done' && (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={async () => {
                            if (!item.resultUrl) return;
                            const baseName = item.file.name.replace(/\.[^/.]+$/, '');
                            await downloadDataUrl(item.resultUrl, `${baseName}.${targetImgFormat}`);
                            toast.success('다운로드 완료');
                          }}
                        >
                          <DownloadRoundedIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() =>
                          setImgBatchItems((prev) => prev.filter((it) => it.id !== item.id))
                        }
                      >
                        <DeleteRoundedIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Card>
          </Box>

          {/* Right: Controls */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Card
              sx={{
                p: 2.5,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                목표 포맷 및 품질 설정
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                {IMAGE_FORMAT_OPTIONS.map((opt) => (
                  <Button
                    key={opt.id}
                    size="small"
                    variant={targetImgFormat === opt.id ? 'contained' : 'outlined'}
                    onClick={() => reprocessAllImages(opt.id)}
                    sx={{ display: 'flex', flexDirection: 'column', py: 1 }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      {opt.label}
                    </Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.8 }} noWrap>
                      {opt.desc}
                    </Typography>
                  </Button>
                ))}
              </Box>

              {(targetImgFormat === 'jpg' ||
                targetImgFormat === 'webp' ||
                targetImgFormat === 'avif') && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      변환 품질 (Quality)
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {imgQuality}%
                    </Typography>
                  </Box>
                  <Slider
                    size="small"
                    min={10}
                    max={100}
                    value={imgQuality}
                    onChange={(_, v) => setImgQuality(v as number)}
                    onChangeCommitted={() => reprocessAllImages(targetImgFormat)}
                  />
                </Box>
              )}

              {targetImgFormat === 'ico' && (
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                    아이콘 규격 (px)
                  </Typography>
                  <ToggleButtonGroup
                    value={icoSize}
                    exclusive
                    onChange={(_, v) => {
                      if (v) {
                        setIcoSize(v);
                        reprocessAllImages('ico');
                      }
                    }}
                    fullWidth
                    size="small"
                  >
                    <ToggleButton value={16}>16×16</ToggleButton>
                    <ToggleButton value={32}>32×32</ToggleButton>
                    <ToggleButton value={64}>64×64</ToggleButton>
                    <ToggleButton value={128}>128×128</ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              )}
            </Card>

            <Button
              variant="contained"
              color="primary"
              size="large"
              disabled={
                isImgProcessing || imgBatchItems.filter((it) => it.status === 'done').length === 0
              }
              onClick={handleDownloadAllImagesZip}
              startIcon={
                isImgProcessing ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <ArchiveRoundedIcon />
                )
              }
              sx={{ py: 1.5, borderRadius: 2, fontWeight: 800 }}
            >
              전체 일괄 변환(ZIP) 압축 다운로드
            </Button>
          </Box>
        </Box>
      )}

      {/* Subtool 2: ASCII */}
      {imageSubTool === 'ascii' && (
        <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            이미지를 문자 텍스트(ASCII Art)로 변환
          </Typography>
          <Box
            {...asciiDrop.getRootProps()}
            sx={{
              p: 3,
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            <Button variant="outlined" component="label" startIcon={<CloudUploadRoundedIcon />}>
              이미지 업로드 (또는 드래그 & 드롭)
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setAsciiSourceImg(URL.createObjectURL(e.target.files[0]));
                  }
                }}
              />
            </Button>
          </Box>
          {asciiSourceImg && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Box sx={{ width: 80, height: 80, borderRadius: 1, overflow: 'hidden' }}>
                <img
                  src={asciiSourceImg}
                  alt="src"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  가로 열 해상도: {asciiColumns} chars
                </Typography>
                <Slider
                  value={asciiColumns}
                  min={40}
                  max={160}
                  step={10}
                  onChange={(_, v) => setAsciiColumns(v as number)}
                />
              </Box>
              <Button variant="contained" onClick={convertImageToAscii}>
                ASCII 아트로 변환
              </Button>
            </Box>
          )}
          {asciiResultText && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  변환 결과:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<ContentCopyRoundedIcon />}
                    onClick={() => copyToClipboard(asciiResultText, '아스키 아트를 복사했습니다.')}
                  >
                    텍스트 복사
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<DownloadRoundedIcon />}
                    onClick={() => {
                      const blob = new Blob([asciiResultText], {
                        type: 'text/plain;charset=utf-8',
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'ascii_art.txt';
                      a.click();
                      URL.revokeObjectURL(url);
                      toast.success('텍스트 파일이 저장되었습니다.');
                    }}
                  >
                    TXT 다운로드
                  </Button>
                </Box>
              </Box>
              <textarea
                readOnly
                value={asciiResultText}
                rows={14}
                style={{
                  width: '100%',
                  padding: 10,
                  borderRadius: 6,
                  backgroundColor: '#090d16',
                  color: '#38bdf8',
                  fontFamily: 'monospace',
                  fontSize: '0.65rem',
                  lineHeight: 1,
                  whiteSpace: 'pre',
                }}
              />
            </Box>
          )}
        </Card>
      )}
    </Box>
  );
}
