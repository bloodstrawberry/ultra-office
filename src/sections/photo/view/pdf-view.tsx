'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import RotateRightRoundedIcon from '@mui/icons-material/RotateRightRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

import { saveBlob, downloadZipFile, type ZipFileEntry } from '../utils/zip-exporter';
import {
  type PdfMargin,
  type PdfOptions,
  type PdfPageSize,
  type PdfImageItem,
  type PdfOrientation,
  generatePdfFromImages,
  extractPagesFromPdfFile,
} from '../utils/pdf-generator';

export function PdfView() {
  const [currentTab, setCurrentTab] = useState<'create' | 'extract'>('create');

  // Tab 1: Create PDF
  const [pages, setPages] = useState<PdfImageItem[]>([]);
  const [pageSize, setPageSize] = useState<PdfPageSize>('a4');
  const [orientation, setOrientation] = useState<PdfOrientation>('portrait');
  const [margin, setMargin] = useState<PdfMargin>('medium');
  const [showPageNumbers, setShowPageNumbers] = useState<boolean>(true);
  const [isCreatingPdf, setIsCreatingPdf] = useState<boolean>(false);

  // Tab 2: Extract PDF
  const [extractPdfFile, setExtractPdfFile] = useState<File | null>(null);
  const [extractedPages, setExtractedPages] = useState<PdfImageItem[]>([]);
  const [selectedExtractPages, setSelectedExtractPages] = useState<Set<string>>(new Set());
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(380);

  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(380);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

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

  // Tab 1: Upload Images
  const addImages = useCallback((files: File[]) => {
    if (files.length === 0) return;

    const newPages: PdfImageItem[] = [];
    let count = 0;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const src = evt.target?.result as string;
        if (src) {
          newPages.push({
            id: `${Date.now()}_${Math.random()}`,
            src,
            name: file.name,
            rotation: 0,
          });
        }
        count += 1;
        if (count === files.length) {
          setPages((prev) => [...prev, ...newPages]);
        }
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addImages(files);
    if (e.target) e.target.value = '';
  };

  const movePage = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === pages.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newPages = [...pages];
    const temp = newPages[index];
    newPages[index] = newPages[targetIndex];
    newPages[targetIndex] = temp;
    setPages(newPages);
  };

  const rotatePage = (index: number) => {
    setPages((prev) =>
      prev.map((p, i) => (i === index ? { ...p, rotation: ((p.rotation || 0) + 90) % 360 } : p))
    );
  };

  const removePage = (id: string) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
  };

  const handleGeneratePdf = async () => {
    if (pages.length === 0) return;
    setIsCreatingPdf(true);
    toast.info('PDF 문서를 생성하고 있습니다...');

    try {
      const options: PdfOptions = {
        pageSize,
        orientation,
        margin,
        fitMode: 'contain',
        showPageNumbers,
      };

      const result = await generatePdfFromImages(pages, options);
      saveBlob(result.blob, `document_${Date.now()}.pdf`);
      toast.success('PDF 파일이 성공적으로 생성 및 다운로드되었습니다!');
    } catch {
      toast.error('PDF 생성 중 오류가 발생했습니다.');
    } finally {
      setIsCreatingPdf(false);
    }
  };

  // Tab 2: Extract PDF pages
  const processPdfFile = useCallback(async (file: File) => {
    setExtractPdfFile(file);
    setIsExtracting(true);
    toast.info('PDF 페이지를 이미지로 변환하고 있습니다...');

    try {
      const extracted = await extractPagesFromPdfFile(file);
      setExtractedPages(extracted);
      setSelectedExtractPages(new Set(extracted.map((p) => p.id)));
      toast.success(`총 ${extracted.length}개 페이지가 이미지로 추출되었습니다.`);
    } catch {
      toast.error('PDF 페이지 추출에 실패했습니다.');
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processPdfFile(file);
    if (e.target) e.target.value = '';
  };

  const createDrop = useImageDropPaste({
    onFiles: addImages,
    multiple: true,
    disabled: currentTab !== 'create',
  });

  const extractDrop = useImageDropPaste({
    onFiles: (files) => {
      if (files[0]) processPdfFile(files[0]);
    },
    accept: ['application/pdf', '.pdf'],
    multiple: false,
    disabled: currentTab !== 'extract',
  });

  const toggleSelectExtractPage = (id: string) => {
    setSelectedExtractPages((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDownloadExtractedZip = async () => {
    const pagesToExport = extractedPages.filter((p) => selectedExtractPages.has(p.id));
    if (pagesToExport.length === 0) return;

    try {
      const entries: ZipFileEntry[] = pagesToExport.map((p, idx) => ({
        filename: `page_${String(idx + 1).padStart(2, '0')}.png`,
        data: p.src,
      }));

      await downloadZipFile(`extracted_pdf_pages_${Date.now()}.zip`, entries);
      toast.success(`${pagesToExport.length}개 페이지 ZIP 다운로드 완료!`);
    } catch {
      toast.error('ZIP 내보내기 중 오류가 발생했습니다.');
    }
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
          PDF 변환 & 분할 (Image & PDF Studio)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          여러 장의 이미지를 순서대로 묶어 PDF 문서 생성(A4/Letter 규격) 및 PDF 페이지 이미지 추출을
          지원합니다.
        </Typography>
      </Box>

      <Tabs
        value={currentTab}
        onChange={(_, v) => setCurrentTab(v)}
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}
      >
        <Tab
          label="이미지를 PDF로 만들기"
          value="create"
          icon={<PictureAsPdfRoundedIcon />}
          iconPosition="start"
        />
        <Tab
          label="PDF 페이지 이미지로 추출 (Extract)"
          value="extract"
          icon={<DownloadRoundedIcon />}
          iconPosition="start"
        />
      </Tabs>

      {/* TAB 1: CREATE PDF */}
      {currentTab === 'create' && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagesUpload}
            style={{ display: 'none' }}
          />

          {pages.length === 0 ? (
            <Card
              {...createDrop.getRootProps({
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
                borderColor: createDrop.isDragActive ? 'primary.main' : 'divider',
                bgcolor: createDrop.isDragActive ? 'action.hover' : 'transparent',
                borderRadius: 3,
                flex: '1 1 auto',
                minHeight: 0,
                height: '100%',
                transition: (theme) =>
                  theme.transitions.create(['border-color', 'background-color']),
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
                <PictureAsPdfRoundedIcon sx={{ fontSize: 36 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                PDF로 만들 이미지들 업로드
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                문서 스캔, 보고서 사진, 영수증 등을 모아 하나의 PDF로 묶습니다
              </Typography>
              <Button variant="contained" color="primary" startIcon={<CloudUploadRoundedIcon />}>
                사진 선택하기
              </Button>
            </Card>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', lg: 'row' },
                gap: { xs: 2, lg: 0 },
                flex: '1 1 auto',
                minHeight: 0,
                height: '100%',
                position: 'relative',
              }}
            >
              {/* Left: Pages Grid */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: '1 1 0px',
                  minWidth: 0,
                  minHeight: 0,
                  height: '100%',
                  pr: { lg: 1 },
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
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      PDF 페이지 목록 ({pages.length}페이지)
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                      gap: 1.5,
                      flex: '1 1 auto',
                      minHeight: 0,
                      overflowY: 'auto',
                    }}
                  >
                    {pages.map((page, idx) => (
                      <Card
                        key={page.id}
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          bgcolor: 'action.hover',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          position: 'relative',
                          flexShrink: 0,
                        }}
                      >
                        <Box
                          sx={{
                            width: '100%',
                            aspectRatio: orientation === 'portrait' ? '210/297' : '297/210',
                            bgcolor: '#0f172a',
                            borderRadius: 1.5,
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 1,
                          }}
                        >
                          <img
                            src={page.src}
                            alt={`page ${idx + 1}`}
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'contain',
                              transform: `rotate(${page.rotation || 0}deg)`,
                              transition: 'transform 0.2s',
                            }}
                          />
                        </Box>

                        <Typography variant="caption" sx={{ fontWeight: 800, mb: 0.5 }}>
                          Page {idx + 1}
                        </Typography>

                        {/* Page controls */}
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => movePage(idx, 'up')}
                            disabled={idx === 0}
                            sx={{ p: 0.4 }}
                          >
                            <ArrowUpwardRoundedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => movePage(idx, 'down')}
                            disabled={idx === pages.length - 1}
                            sx={{ p: 0.4 }}
                          >
                            <ArrowDownwardRoundedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          <IconButton size="small" onClick={() => rotatePage(idx)} sx={{ p: 0.4 }}>
                            <RotateRightRoundedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removePage(page.id)}
                            sx={{ p: 0.4 }}
                          >
                            <DeleteRoundedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                      </Card>
                    ))}
                  </Box>
                </Card>
              </Box>

              {/* Draggable Divider (Desktop) */}
              <Box
                onPointerDown={handleDividerPointerDown}
                onPointerMove={handleDividerPointerMove}
                onPointerUp={handleDividerPointerUp}
                sx={{
                  display: { xs: 'none', lg: 'flex' },
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

              {/* Right: PDF Settings & Actions */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: { xs: '100%', lg: `${rightPanelWidth}px` },
                  minWidth: { lg: `${rightPanelWidth}px` },
                  maxWidth: { lg: `${rightPanelWidth}px` },
                  flexShrink: 0,
                  gap: 2,
                  minHeight: 0,
                  overflow: 'auto',
                  pl: { lg: 1 },
                  pr: 0.5,
                }}
              >
                <Card sx={{ p: 2.5, borderRadius: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    1. 용지 규격
                  </Typography>
                  <ToggleButtonGroup
                    value={pageSize}
                    exclusive
                    onChange={(_, v) => v && setPageSize(v)}
                    fullWidth
                    size="small"
                    sx={{ mb: 2 }}
                  >
                    <ToggleButton value="a4">A4 규격</ToggleButton>
                    <ToggleButton value="letter">US Letter</ToggleButton>
                    <ToggleButton value="auto">이미지 맞춤</ToggleButton>
                  </ToggleButtonGroup>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    2. 용지 방향
                  </Typography>
                  <ToggleButtonGroup
                    value={orientation}
                    exclusive
                    onChange={(_, v) => v && setOrientation(v)}
                    fullWidth
                    size="small"
                    sx={{ mb: 2 }}
                  >
                    <ToggleButton value="portrait">세로 (Portrait)</ToggleButton>
                    <ToggleButton value="landscape">가로 (Landscape)</ToggleButton>
                  </ToggleButtonGroup>

                  {/* Margins */}
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    3. 여백 (Margin)
                  </Typography>
                  <ToggleButtonGroup
                    value={margin}
                    exclusive
                    onChange={(_, v) => v && setMargin(v)}
                    fullWidth
                    size="small"
                    sx={{ mb: 2 }}
                  >
                    <ToggleButton value="none">없음</ToggleButton>
                    <ToggleButton value="small">5mm</ToggleButton>
                    <ToggleButton value="medium">10mm</ToggleButton>
                  </ToggleButtonGroup>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={showPageNumbers}
                        onChange={(e) => setShowPageNumbers(e.target.checked)}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        하단 페이지 번호 자동 삽입
                      </Typography>
                    }
                  />
                </Card>

                {/* Actions Column */}
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
                    variant="contained"
                    color="primary"
                    onClick={handleGeneratePdf}
                    disabled={isCreatingPdf || pages.length === 0}
                    startIcon={
                      isCreatingPdf ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <PictureAsPdfRoundedIcon />
                      )
                    }
                    sx={{ py: 1.4, borderRadius: 2, fontWeight: 700, fontSize: '0.95rem' }}
                  >
                    PDF 문서 생성 및 다운로드
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    onClick={() => fileInputRef.current?.click()}
                    startIcon={<CloudUploadRoundedIcon />}
                    sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
                  >
                    + 이미지 추가하기
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    onClick={() => setPages([])}
                    sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
                  >
                    전체 삭제
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </>
      )}

      {/* TAB 2: EXTRACT PDF */}
      {currentTab === 'extract' && (
        <>
          <input
            ref={pdfInputRef}
            type="file"
            accept="application/pdf"
            onChange={handlePdfUpload}
            style={{ display: 'none' }}
          />

          {!extractPdfFile ? (
            <Card
              {...extractDrop.getRootProps({
                onClick: () => pdfInputRef.current?.click(),
              })}
              sx={{
                p: 6,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                border: '2px dashed',
                borderColor: extractDrop.isDragActive ? 'primary.main' : 'divider',
                bgcolor: extractDrop.isDragActive ? 'action.hover' : 'transparent',
                borderRadius: 3,
                flex: '1 1 auto',
                minHeight: 0,
                height: '100%',
                transition: (theme) =>
                  theme.transitions.create(['border-color', 'background-color']),
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
                <DownloadRoundedIcon sx={{ fontSize: 36 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                페이지를 추출할 PDF 파일 업로드
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                PDF 문서의 모든 페이지를 고화질 PNG 이미지로 변환 및 분할합니다
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={
                  isExtracting ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <CloudUploadRoundedIcon />
                  )
                }
                disabled={isExtracting}
              >
                PDF 파일 선택
              </Button>
            </Card>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', lg: 'row' },
                gap: { xs: 2, lg: 0 },
                flex: '1 1 auto',
                minHeight: 0,
                height: '100%',
                position: 'relative',
              }}
            >
              {/* Left: Pages Grid */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: '1 1 0px',
                  minWidth: 0,
                  minHeight: 0,
                  height: '100%',
                  pr: { lg: 1 },
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
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {extractPdfFile.name} (총 {extractedPages.length} 페이지)
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        선택된 페이지: {selectedExtractPages.size}개
                      </Typography>
                    </Box>

                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        setSelectedExtractPages(new Set(extractedPages.map((p) => p.id)))
                      }
                    >
                      전체 선택
                    </Button>
                  </Box>

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                      gap: 1.5,
                      flex: '1 1 auto',
                      minHeight: 0,
                      overflowY: 'auto',
                    }}
                  >
                    {extractedPages.map((page, idx) => {
                      const isSelected = selectedExtractPages.has(page.id);
                      return (
                        <Card
                          key={page.id}
                          onClick={() => toggleSelectExtractPage(page.id)}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            cursor: 'pointer',
                            border: '2px solid',
                            borderColor: isSelected ? 'primary.main' : 'transparent',
                            bgcolor: isSelected ? 'action.selected' : 'action.hover',
                            flexShrink: 0,
                          }}
                        >
                          <Box
                            sx={{
                              width: '100%',
                              aspectRatio: '210/297',
                              borderRadius: 1,
                              overflow: 'hidden',
                              bgcolor: '#ffffff',
                              boxShadow: 1,
                              mb: 1,
                            }}
                          >
                            <img
                              src={page.src}
                              alt={page.name}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          </Box>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 800, textAlign: 'center', display: 'block' }}
                          >
                            Page {idx + 1}
                          </Typography>
                        </Card>
                      );
                    })}
                  </Box>
                </Card>
              </Box>

              {/* Draggable Divider (Desktop) */}
              <Box
                onPointerDown={handleDividerPointerDown}
                onPointerMove={handleDividerPointerMove}
                onPointerUp={handleDividerPointerUp}
                sx={{
                  display: { xs: 'none', lg: 'flex' },
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

              {/* Right: Actions */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: { xs: '100%', lg: `${rightPanelWidth}px` },
                  minWidth: { lg: `${rightPanelWidth}px` },
                  maxWidth: { lg: `${rightPanelWidth}px` },
                  flexShrink: 0,
                  gap: 2,
                  minHeight: 0,
                  overflow: 'auto',
                  pl: { lg: 1 },
                  pr: 0.5,
                }}
              >
                <Card sx={{ p: 2.5, borderRadius: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                    추출 정보
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    파일명: {extractPdfFile.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                    총 페이지: {extractedPages.length}장
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    선택된 페이지: {selectedExtractPages.size}장
                  </Typography>
                </Card>

                {/* Actions Column */}
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
                    variant="contained"
                    color="primary"
                    startIcon={<ArchiveRoundedIcon />}
                    onClick={handleDownloadExtractedZip}
                    disabled={selectedExtractPages.size === 0}
                    sx={{ py: 1.4, borderRadius: 2, fontWeight: 700, fontSize: '0.95rem' }}
                  >
                    선택 페이지 ZIP 다운로드
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    onClick={() => pdfInputRef.current?.click()}
                    startIcon={<CloudUploadRoundedIcon />}
                    sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
                  >
                    다른 PDF 파일 선택
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    onClick={() => {
                      setExtractPdfFile(null);
                      setExtractedPages([]);
                      setSelectedExtractPages(new Set());
                    }}
                    sx={{ py: 1.2, borderRadius: 2, fontWeight: 600 }}
                  >
                    초기화
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </>
      )}
    </DashboardContent>
  );
}
