'use client';

import type { PdfPageInfo } from '../utils/pdf-advanced-utils';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Chip from '@mui/material/Chip';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import HubRoundedIcon from '@mui/icons-material/HubRounded';
import CircularProgress from '@mui/material/CircularProgress';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import GestureRoundedIcon from '@mui/icons-material/GestureRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import TransformRoundedIcon from '@mui/icons-material/TransformRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import RotateRightRoundedIcon from '@mui/icons-material/RotateRightRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import LayersClearRoundedIcon from '@mui/icons-material/LayersClearRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import BrandingWatermarkRoundedIcon from '@mui/icons-material/BrandingWatermarkRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { PdfCombinePanel, PdfConvertPanel, PdfDocumentPanel } from '../components/pdf-tool-panels';
import {
  stampPdf,
  getPdfPagesInfo,
  exportModifiedPdf,
  addWatermarkToPdf,
} from '../utils/pdf-advanced-utils';

export function PdfMasterView() {
  const [currentTab, setCurrentTab] = useState<
    'editor' | 'combine' | 'convert' | 'stamp' | 'watermark' | 'document'
  >('editor');

  // Common File State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PdfPageInfo[]>([]);
  const [sourcePageCount, setSourcePageCount] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    setHasLoaded(true);
  }, []);

  // Tab 1: Page Editor State
  const handlePdfUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const { pages: pagesInfo } = await getPdfPagesInfo(file);
      setPdfFile(file);
      setPages(pagesInfo);
      setSourcePageCount(pagesInfo.length);
      setSelectedPageIndex(0);
      toast.success(`${pagesInfo.length}개 페이지가 성공적으로 로드되었습니다.`);
    } catch {
      toast.error('PDF 파일을 분석하는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRotatePage = (index: number) => {
    setPages((prev) =>
      prev.map((p, i) => (i === index ? { ...p, rotation: (p.rotation + 90) % 360 } : p))
    );
  };

  const handleDeletePage = (index: number) => {
    setPages((prev) => prev.filter((_, i) => i !== index));
    toast.info('페이지가 목록에서 제거되었습니다.');
  };

  const handleDuplicatePage = (index: number) => {
    setPages((prev) => {
      const next = [...prev];
      next.splice(index + 1, 0, { ...prev[index] });
      return next;
    });
    toast.success('페이지를 복제했습니다.');
  };

  const handleMovePage = (index: number, direction: 'left' | 'right') => {
    if (
      (direction === 'left' && index === 0) ||
      (direction === 'right' && index === pages.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    setPages((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleExportEditedPdf = async () => {
    if (!pdfFile || pages.length === 0) {
      toast.error('내보낼 페이지가 없습니다.');
      return;
    }
    setIsLoading(true);
    try {
      const ordered = pages.map((p) => ({ originalIndex: p.pageIndex, rotation: p.rotation }));
      const blob = await exportModifiedPdf(pdfFile, ordered);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `edited_${pdfFile.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('수정된 PDF가 다운로드되었습니다.');
    } catch {
      toast.error('PDF 내보내기에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // Tab 2: Stamp & Signature State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [stampImage, setStampImage] = useState<string | null>(null);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);
  const [stampX, setStampX] = useState<number>(80);
  const [stampY, setStampY] = useState<number>(15);
  const [stampSize, setStampSize] = useState<number>(100);

  // Initialize canvas
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#d32f2f'; // Red color stamp
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  useEffect(() => {
    if (currentTab === 'stamp') {
      initCanvas();
    }
  }, [currentTab]);

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setStampImage(canvas.toDataURL('image/png'));
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStampImage(null);
  };

  const handleApplyStamp = async () => {
    if (!pdfFile) {
      toast.error('PDF 파일을 먼저 업로드해 주세요.');
      return;
    }
    if (!stampImage) {
      toast.error('서명을 그리거나 도장 이미지를 업로드해 주세요.');
      return;
    }
    setIsLoading(true);
    try {
      const blob = await stampPdf(pdfFile, stampImage, {
        targetPageIndex: selectedPageIndex,
        xPercent: stampX,
        yPercent: stampY,
        stampWidth: stampSize,
        stampHeight: (stampSize * 3) / 4,
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `stamped_${pdfFile.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('서명/도장이 날인된 PDF가 다운로드되었습니다.');
    } catch {
      toast.error('PDF 날인 처리에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // Tab 3: Watermark State
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL / 대외비');
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.25);

  const handleApplyWatermark = async () => {
    if (!pdfFile) {
      toast.error('PDF 파일을 먼저 업로드해 주세요.');
      return;
    }
    setIsLoading(true);
    try {
      const blob = await addWatermarkToPdf(pdfFile, watermarkText, watermarkOpacity);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `watermarked_${pdfFile.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('워터마크가 추가된 PDF가 다운로드되었습니다.');
    } catch {
      toast.error('워터마크 적용에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasLoaded) {
    return (
      <DashboardContent>
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}
        >
          <CircularProgress size={36} />
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent
      sx={{
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        height: '100%',
      }}
    >
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <PictureAsPdfRoundedIcon sx={{ fontSize: 32, color: 'error.main' }} />
          PDF 편집기
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          페이지 편집부터 병합·분할·변환·텍스트 추출·전자 서명·워터마크·문서 정보까지 브라우저
          안에서 안전하게 처리합니다.
        </Typography>
      </Box>

      {/* Upload Banner */}
      {!pdfFile && (
        <Card
          sx={{
            p: { xs: 3, md: 5 },
            flex: '1 1 auto',
            minHeight: { xs: 320, lg: 0 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            border: '2px dashed',
            borderColor: 'primary.main',
            borderRadius: 2,
          }}
        >
          <PictureAsPdfRoundedIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            작업할 PDF 문서를 업로드해 주세요
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            문서는 서버로 전송되지 않고 100% 브라우저 메모리 내에서 안전하게 처리됩니다.
          </Typography>
          <Button
            variant="contained"
            size="large"
            component="label"
            startIcon={<CloudUploadRoundedIcon />}
            sx={{ px: 4, py: 1.5, fontWeight: 700 }}
          >
            PDF 파일 열기
            <input
              type="file"
              hidden
              accept="application/pdf"
              onChange={(e) => {
                if (e.target.files?.[0]) handlePdfUpload(e.target.files[0]);
              }}
            />
          </Button>
        </Card>
      )}

      {pdfFile && (
        <Box sx={{ flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {/* File Status Bar */}
          <Card
            sx={{
              p: 1.5,
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <PictureAsPdfRoundedIcon color="error" />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {pdfFile.name}
              </Typography>
              <Chip
                label={`${pages.length} 페이지`}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Chip label={`${Math.round(pdfFile.size / 1024)} KB`} size="small" />
            </Box>

            <Button
              variant="outlined"
              size="small"
              component="label"
              startIcon={<CloudUploadRoundedIcon />}
            >
              다른 PDF 열기
              <input
                type="file"
                hidden
                accept="application/pdf"
                onChange={(e) => {
                  if (e.target.files?.[0]) handlePdfUpload(e.target.files[0]);
                }}
              />
            </Button>
          </Card>

          {/* Navigation Tabs */}
          <Box sx={{ flexShrink: 0, mb: 2 }}>
            <Tabs
              value={currentTab}
              onChange={(_, val) => setCurrentTab(val)}
              sx={{ borderBottom: 1, borderColor: 'divider' }}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab
                label="1. 페이지 편집 & 순서 변경"
                value="editor"
                icon={<EditRoundedIcon />}
                iconPosition="start"
              />
              <Tab
                label="2. 병합 & 분할"
                value="combine"
                icon={<HubRoundedIcon />}
                iconPosition="start"
              />
              <Tab
                label="3. 변환 & 텍스트"
                value="convert"
                icon={<TransformRoundedIcon />}
                iconPosition="start"
              />
              <Tab
                label="4. 전자 서명 & 도장"
                value="stamp"
                icon={<GestureRoundedIcon />}
                iconPosition="start"
              />
              <Tab
                label="5. 워터마크"
                value="watermark"
                icon={<BrandingWatermarkRoundedIcon />}
                iconPosition="start"
              />
              <Tab
                label="6. 문서 정보 & 최적화"
                value="document"
                icon={<DescriptionRoundedIcon />}
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {/* Tab Contents */}
          <Box
            sx={{
              flex: '1 1 auto',
              minHeight: 0,
              overflowY: currentTab === 'combine' ? 'hidden' : 'auto',
              pb: currentTab === 'combine' ? 0 : 4,
            }}
          >
            {/* TAB 1: Page Editor */}
            {currentTab === 'editor' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    페이지를 회전하거나 순서를 이동하고, 필요 없는 페이지를 삭제할 수 있습니다.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={isLoading || pages.length === 0}
                    onClick={handleExportEditedPdf}
                    startIcon={
                      isLoading ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <DownloadRoundedIcon />
                      )
                    }
                    sx={{ fontWeight: 800 }}
                  >
                    수정된 PDF 저장하기
                  </Button>
                </Box>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: 2,
                    mt: 1,
                  }}
                >
                  {pages.map((p, idx) => (
                    <Card
                      key={`${p.pageIndex}-${idx}`}
                      sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1.5,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        position: 'relative',
                      }}
                    >
                      <Box
                        sx={{
                          width: '100%',
                          height: 220,
                          bgcolor: 'background.neutral',
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        {p.thumbnailUrl ? (
                          <Box
                            component="img"
                            src={p.thumbnailUrl}
                            alt={`원문 ${p.pageIndex + 1}페이지 미리보기`}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              bgcolor: '#fff',
                              transform: `rotate(${p.rotation - p.originalRotation}deg)`,
                              transition: 'transform 0.2s ease',
                            }}
                          />
                        ) : (
                          <Box sx={{ textAlign: 'center' }}>
                            <PictureAsPdfRoundedIcon
                              sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.7 }}
                            />
                            <Typography
                              variant="caption"
                              display="block"
                              sx={{ mt: 0.5, fontWeight: 700 }}
                            >
                              {Math.round(p.width)} × {Math.round(p.height)} pt
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      <Box
                        sx={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Chip
                          label={`${idx + 1} 페이지 (원문 ${p.pageIndex + 1}p)`}
                          size="small"
                          sx={{ fontWeight: 700 }}
                        />
                        <Typography
                          variant="caption"
                          sx={{ color: 'primary.main', fontWeight: 700 }}
                        >
                          {p.rotation}°
                        </Typography>
                      </Box>

                      {/* Action buttons */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 0.5,
                          width: '100%',
                        }}
                      >
                        <IconButton
                          size="small"
                          disabled={idx === 0}
                          onClick={() => handleMovePage(idx, 'left')}
                          title="앞으로 이동"
                        >
                          <ArrowBackRoundedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleRotatePage(idx)}
                          title="90° 시계방향 회전"
                        >
                          <RotateRightRoundedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => handleDuplicatePage(idx)}
                          title="페이지 복제"
                        >
                          <ContentCopyRoundedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeletePage(idx)}
                          title="페이지 삭제"
                        >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          disabled={idx === pages.length - 1}
                          onClick={() => handleMovePage(idx, 'right')}
                          title="뒤로 이동"
                        >
                          <ArrowForwardRoundedIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Card>
                  ))}
                </Box>
              </Box>
            )}

            {currentTab === 'combine' && (
              <PdfCombinePanel pdfFile={pdfFile} pageCount={sourcePageCount} />
            )}

            {currentTab === 'convert' && (
              <PdfConvertPanel pdfFile={pdfFile} pageCount={sourcePageCount} />
            )}

            {/* TAB 2: Stamp & Signature */}
            {currentTab === 'stamp' && (
              <Box
                sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}
              >
                {/* Left: Signature Canvas */}
                <Card
                  sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, borderRadius: 2 }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    1. 서명 그리기 또는 인감도장 이미지 업로드
                  </Typography>

                  <Box
                    sx={{
                      border: '2px dashed',
                      borderColor: 'divider',
                      borderRadius: 2,
                      bgcolor: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    <canvas
                      ref={canvasRef}
                      width={360}
                      height={180}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      style={{ cursor: 'crosshair', touchAction: 'none' }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      startIcon={<LayersClearRoundedIcon />}
                      onClick={clearSignature}
                    >
                      서명 지우기
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      component="label"
                      startIcon={<CloudUploadRoundedIcon />}
                    >
                      도장 이미지 파일 올리기 (PNG)
                      <input
                        type="file"
                        hidden
                        accept="image/png,image/jpeg"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              setStampImage(reader.result as string);
                              toast.success('도장 이미지가 등록되었습니다.');
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </Button>
                  </Box>
                </Card>

                {/* Right: Stamp Placement Control */}
                <Card
                  sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5, borderRadius: 2 }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    2. 날인 위치 및 크기 설정
                  </Typography>

                  <TextField
                    select
                    label="날인할 대상 페이지"
                    value={selectedPageIndex}
                    onChange={(e) => setSelectedPageIndex(Number(e.target.value))}
                    SelectProps={{ native: true }}
                  >
                    {pages.map((_, i) => (
                      <option key={i} value={i}>
                        {i + 1} 페이지
                      </option>
                    ))}
                  </TextField>

                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      가로 위치 (좌 ➔ 우): {stampX}%
                    </Typography>
                    <Slider
                      value={stampX}
                      onChange={(_, v) => setStampX(v as number)}
                      min={10}
                      max={90}
                    />
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      세로 위치 (하단 ➔ 상단): {stampY}%
                    </Typography>
                    <Slider
                      value={stampY}
                      onChange={(_, v) => setStampY(v as number)}
                      min={5}
                      max={95}
                    />
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      도장/서명 크기: {stampSize} px
                    </Typography>
                    <Slider
                      value={stampSize}
                      onChange={(_, v) => setStampSize(v as number)}
                      min={40}
                      max={200}
                    />
                  </Box>

                  <Button
                    variant="contained"
                    color="error"
                    size="large"
                    disabled={isLoading || !stampImage}
                    onClick={handleApplyStamp}
                    startIcon={
                      isLoading ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <DownloadRoundedIcon />
                      )
                    }
                    sx={{ py: 1.5, fontWeight: 800 }}
                  >
                    서명 날인된 PDF 다운로드
                  </Button>
                </Card>
              </Box>
            )}

            {/* TAB 3: Watermark */}
            {currentTab === 'watermark' && (
              <Card
                sx={{
                  p: 3,
                  maxWidth: 600,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                  borderRadius: 2,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  문서 전체에 보안 대각선 워터마크 삽입
                </Typography>

                <TextField
                  label="워터마크 문구"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="예: CONFIDENTIAL / 사내 보안 문서 / 홍길동"
                />

                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    워터마크 투명도: {Math.round(watermarkOpacity * 100)}%
                  </Typography>
                  <Slider
                    value={watermarkOpacity}
                    onChange={(_, v) => setWatermarkOpacity(v as number)}
                    min={0.05}
                    max={0.8}
                    step={0.05}
                  />
                </Box>

                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={isLoading || !watermarkText.trim()}
                  onClick={handleApplyWatermark}
                  startIcon={
                    isLoading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <DownloadRoundedIcon />
                    )
                  }
                  sx={{ py: 1.5, fontWeight: 800 }}
                >
                  워터마크 적용 및 다운로드
                </Button>
              </Card>
            )}

            {currentTab === 'document' && (
              <PdfDocumentPanel pdfFile={pdfFile} pageCount={sourcePageCount} />
            )}
          </Box>
        </Box>
      )}
    </DashboardContent>
  );
}
