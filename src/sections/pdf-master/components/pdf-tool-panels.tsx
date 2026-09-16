'use client';

import type { DragEndEvent } from '@dnd-kit/core';
import type { PdfMetadata, PdfPageInfo, PdfDocumentInfo } from '../utils/pdf-advanced-utils';

import { toast } from 'sonner';
import { CSS } from '@dnd-kit/utilities';
import React, { useState, useEffect } from 'react';
import {
  useSensor,
  DndContext,
  useSensors,
  PointerSensor,
  closestCenter,
  KeyboardSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  useSortable,
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import NumbersRoundedIcon from '@mui/icons-material/NumbersRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CompressRoundedIcon from '@mui/icons-material/CompressRounded';
import MergeTypeRoundedIcon from '@mui/icons-material/MergeTypeRounded';
import CallSplitRoundedIcon from '@mui/icons-material/CallSplitRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import DataObjectRoundedIcon from '@mui/icons-material/DataObjectRounded';
import TextSnippetRoundedIcon from '@mui/icons-material/TextSnippetRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import RotateRightRoundedIcon from '@mui/icons-material/RotateRightRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import { ResizablePanel, ResizableHandle, ResizablePanelGroup } from 'src/components/resizable';

import {
  imagesToPdf,
  addPageNumbers,
  extractPdfText,
  getPdfPagesInfo,
  readPdfMetadata,
  extractPdfPages,
  exportModifiedPdf,
  mergePdfDocuments,
  updatePdfMetadata,
  parsePdfPageRange,
  createZipFromFiles,
  splitPdfPagesToZip,
  readPdfDocumentInfo,
  optimizePdfStructure,
  renderPdfPagesToImages,
} from '../utils/pdf-advanced-utils';

// ----------------------------------------------------------------------

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function baseName(filename: string) {
  return filename.replace(/\.pdf$/i, '');
}

type PanelProps = {
  pdfFile: File;
  pageCount: number;
};

type CombinePanelProps = PanelProps & {
  initialFiles: File[];
};

type MergeFileItem = {
  id: string;
  file: File;
};

let mergeFileSequence = 0;

function createMergeFileItem(file: File): MergeFileItem {
  mergeFileSequence += 1;
  return { id: `pdf-${file.lastModified}-${file.size}-${mergeFileSequence}`, file };
}

type SortablePdfRowProps = {
  item: MergeFileItem;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onPreview: () => void;
  onDelete: () => void;
};

function SortablePdfRow({
  item,
  index,
  selected,
  onSelect,
  onPreview,
  onDelete,
}: SortablePdfRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  return (
    <Card
      ref={setNodeRef}
      variant="outlined"
      onClick={onSelect}
      sx={{
        p: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        cursor: 'pointer',
        borderColor: selected ? 'primary.main' : 'divider',
        bgcolor: selected ? 'primary.lighter' : 'background.paper',
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.72 : 1,
        zIndex: isDragging ? 2 : 1,
        boxShadow: isDragging ? 8 : 0,
        '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
      }}
    >
      <IconButton
        size="small"
        aria-label={`${item.file.name} 순서 이동`}
        {...attributes}
        {...listeners}
        onClick={(event) => event.stopPropagation()}
        sx={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
      >
        <DragIndicatorRoundedIcon fontSize="small" />
      </IconButton>
      <Chip size="small" label={index + 1} color={selected ? 'primary' : 'default'} />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>
          {item.file.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {(item.file.size / 1024 / 1024).toFixed(2)} MB
        </Typography>
      </Box>
      <Button
        size="small"
        color="primary"
        aria-label={`${item.file.name} 미리보기 및 편집`}
        title="미리보기 및 페이지 편집"
        startIcon={<VisibilityRoundedIcon fontSize="small" />}
        onClick={(event) => {
          event.stopPropagation();
          onPreview();
        }}
      >
        미리보기
      </Button>
      <IconButton
        size="small"
        color="error"
        aria-label={`${item.file.name} 제거`}
        onClick={(event) => {
          event.stopPropagation();
          onDelete();
        }}
      >
        <DeleteOutlineRoundedIcon fontSize="small" />
      </IconButton>
    </Card>
  );
}

type PreviewPageItem = {
  id: string;
  page: PdfPageInfo;
};

let previewPageSequence = 0;

function createPreviewPageItem(page: PdfPageInfo): PreviewPageItem {
  previewPageSequence += 1;
  return { id: `preview-page-${previewPageSequence}`, page };
}

type SortablePreviewPageProps = {
  item: PreviewPageItem;
  index: number;
  onRotate: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

function SortablePreviewPage({
  item,
  index,
  onRotate,
  onDuplicate,
  onDelete,
}: SortablePreviewPageProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  const { page } = item;

  return (
    <Card
      ref={setNodeRef}
      variant="outlined"
      sx={{
        p: 1.25,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        minWidth: 0,
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.7 : 1,
        zIndex: isDragging ? 2 : 1,
        boxShadow: isDragging ? 10 : 0,
      }}
    >
      <Box
        sx={{
          height: 210,
          bgcolor: 'background.neutral',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {page.thumbnailUrl ? (
          <Box
            component="img"
            src={page.thumbnailUrl}
            alt={`${index + 1}페이지 미리보기`}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              bgcolor: '#fff',
              transform: `rotate(${page.rotation - page.originalRotation}deg)`,
              transition: 'transform 0.2s ease',
            }}
          />
        ) : (
          <PictureAsPdfRoundedIcon color="error" sx={{ fontSize: 42 }} />
        )}
        <IconButton
          size="small"
          aria-label={`${index + 1}페이지 순서 이동`}
          {...attributes}
          {...listeners}
          sx={{
            position: 'absolute',
            top: 6,
            left: 6,
            bgcolor: 'background.paper',
            boxShadow: 2,
            cursor: isDragging ? 'grabbing' : 'grab',
            touchAction: 'none',
            '&:hover': { bgcolor: 'background.paper' },
          }}
        >
          <DragIndicatorRoundedIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5 }}
      >
        <Chip size="small" label={`${index + 1} 페이지`} sx={{ fontWeight: 700 }} />
        <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700 }}>
          {page.rotation}°
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.25 }}>
        <IconButton size="small" color="primary" title="90° 회전" onClick={onRotate}>
          <RotateRightRoundedIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" color="secondary" title="페이지 복제" onClick={onDuplicate}>
          <ContentCopyRoundedIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" color="error" title="페이지 삭제" onClick={onDelete}>
          <DeleteOutlineRoundedIcon fontSize="small" />
        </IconButton>
      </Box>
    </Card>
  );
}

export function PdfCombinePanel({ pdfFile, pageCount, initialFiles }: CombinePanelProps) {
  const [mergeFiles, setMergeFiles] = useState<MergeFileItem[]>(() =>
    (initialFiles.length ? initialFiles : [pdfFile]).map(createMergeFileItem)
  );
  const [selectedFileId, setSelectedFileId] = useState<string | null>(mergeFiles[0]?.id || null);
  const [selectedFileInfo, setSelectedFileInfo] = useState<PdfDocumentInfo | null>(null);
  const [pageRange, setPageRange] = useState(`1-${pageCount}`);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [previewFileId, setPreviewFileId] = useState<string | null>(null);
  const [previewPages, setPreviewPages] = useState<PreviewPageItem[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewSaving, setPreviewSaving] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const items = (initialFiles.length ? initialFiles : [pdfFile]).map(createMergeFileItem);
    setMergeFiles(items);
    setSelectedFileId(items[0]?.id || null);
    setPageRange(`1-${pageCount}`);
    setPreviewFileId(null);
    setPreviewPages([]);
  }, [pdfFile, pageCount, initialFiles]);

  const selectedItem = mergeFiles.find((item) => item.id === selectedFileId) || null;
  const previewItem = mergeFiles.find((item) => item.id === previewFileId) || null;

  useEffect(() => {
    let active = true;
    setSelectedFileInfo(null);
    if (!selectedItem) return () => undefined;

    readPdfDocumentInfo(selectedItem.file)
      .then((info) => {
        if (active) {
          setSelectedFileInfo(info);
          setPageRange(`1-${info.pageCount}`);
        }
      })
      .catch(() => {
        if (active) toast.error('선택한 PDF 정보를 읽지 못했습니다.');
      });

    return () => {
      active = false;
    };
  }, [selectedItem]);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    setMergeFiles((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      return oldIndex >= 0 && newIndex >= 0 ? arrayMove(items, oldIndex, newIndex) : items;
    });
  };

  const handlePreviewPageDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    setPreviewPages((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      return oldIndex >= 0 && newIndex >= 0 ? arrayMove(items, oldIndex, newIndex) : items;
    });
  };

  const handleOpenPreview = async (item: MergeFileItem) => {
    setPreviewFileId(item.id);
    setSelectedFileId(item.id);
    setPreviewPages([]);
    setPreviewLoading(true);
    try {
      const { pages } = await getPdfPagesInfo(item.file);
      setPreviewPages(pages.map(createPreviewPageItem));
    } catch {
      setPreviewFileId(null);
      toast.error('PDF 미리보기를 불러오지 못했습니다.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleApplyPreviewEdits = async () => {
    if (!previewItem || previewPages.length === 0) return;
    setPreviewSaving(true);
    try {
      const blob = await exportModifiedPdf(
        previewItem.file,
        previewPages.map(({ page }) => ({
          originalIndex: page.pageIndex,
          rotation: page.rotation,
        }))
      );
      const editedFile = new File([blob], previewItem.file.name, {
        type: 'application/pdf',
        lastModified: Date.now(),
      });
      setMergeFiles((items) =>
        items.map((item) => (item.id === previewItem.id ? { ...item, file: editedFile } : item))
      );
      setPreviewFileId(null);
      setPreviewPages([]);
      toast.success('페이지 편집 내용을 병합 목록에 적용했습니다.');
    } catch {
      toast.error('페이지 편집 내용을 적용하지 못했습니다.');
    } finally {
      setPreviewSaving(false);
    }
  };

  const handleDeleteMergeFile = (id: string) => {
    if (previewFileId === id) {
      setPreviewFileId(null);
      setPreviewPages([]);
    }
    setMergeFiles((items) => {
      const next = items.filter((item) => item.id !== id);
      if (selectedFileId === id) setSelectedFileId(next[0]?.id || null);
      return next;
    });
  };

  const run = async (action: string, task: () => Promise<void>) => {
    setBusyAction(action);
    try {
      await task();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'PDF 작업에 실패했습니다.');
    } finally {
      setBusyAction(null);
    }
  };

  const progress = <CircularProgress size={18} color="inherit" />;

  return (
    <>
      <ResizablePanelGroup
        orientation="horizontal"
        autoSaveId="pdf-combine-width"
        sx={{ height: '100%', minHeight: 0 }}
      >
        <ResizablePanel id="pdf-merge-list" defaultSize={56} minSize={30}>
          <Card
            sx={{
              p: 2.25,
              height: '100%',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              minHeight: 0,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  PDF 병합 순서
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  왼쪽 핸들을 끌어 순서를 변경하고, 행을 클릭해 정보를 확인하세요.
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                component="label"
                startIcon={<CloudUploadRoundedIcon />}
                sx={{ flexShrink: 0 }}
              >
                PDF 추가
                <input
                  hidden
                  multiple
                  type="file"
                  accept="application/pdf"
                  onChange={(event) => {
                    const additions = Array.from(event.target.files || []).map(createMergeFileItem);
                    setMergeFiles((current) => [...current, ...additions]);
                    if (!selectedFileId && additions[0]) setSelectedFileId(additions[0].id);
                    event.target.value = '';
                  }}
                />
              </Button>
            </Box>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={mergeFiles.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.75,
                    flex: '1 1 auto',
                    minHeight: 0,
                    overflowY: 'auto',
                    pr: 0.5,
                  }}
                >
                  {mergeFiles.map((item, index) => (
                    <SortablePdfRow
                      key={item.id}
                      item={item}
                      index={index}
                      selected={selectedFileId === item.id}
                      onSelect={() => setSelectedFileId(item.id)}
                      onPreview={() => handleOpenPreview(item)}
                      onDelete={() => handleDeleteMergeFile(item.id)}
                    />
                  ))}
                </Box>
              </SortableContext>
            </DndContext>

            <Button
              variant="contained"
              disabled={mergeFiles.length < 2 || Boolean(busyAction)}
              startIcon={busyAction === 'merge' ? progress : <MergeTypeRoundedIcon />}
              onClick={() =>
                run('merge', async () => {
                  const blob = await mergePdfDocuments(mergeFiles.map((item) => item.file));
                  downloadBlob(blob, 'merged-document.pdf');
                  toast.success(`${mergeFiles.length}개 PDF를 병합했습니다.`);
                })
              }
              sx={{ flexShrink: 0 }}
            >
              현재 순서대로 {mergeFiles.length}개 PDF 병합
            </Button>
          </Card>
        </ResizablePanel>

        <ResizableHandle direction="horizontal" tooltipText="좌우 패널 너비 조절" />

        <ResizablePanel id="pdf-info-extract" defaultSize={44} minSize={28}>
          <ResizablePanelGroup
            orientation="vertical"
            autoSaveId="pdf-info-extract-height"
            sx={{ height: '100%', minHeight: 0 }}
          >
            <ResizablePanel id="pdf-selected-info" defaultSize={46} minSize={24}>
              <Card
                sx={{
                  p: 2.25,
                  height: '100%',
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  minHeight: 0,
                  overflowY: 'auto',
                }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    선택한 PDF 정보
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    왼쪽 병합 목록에서 PDF를 선택하면 해당 문서의 페이지를 추출할 수 있습니다.
                  </Typography>
                </Box>

                {selectedItem ? (
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: 'background.neutral',
                      borderRadius: 1.5,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PictureAsPdfRoundedIcon color="error" />
                      <Typography variant="subtitle2" noWrap sx={{ minWidth: 0, fontWeight: 800 }}>
                        {selectedItem.file.name}
                      </Typography>
                    </Box>
                    {selectedFileInfo ? (
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                          gap: 0.75,
                        }}
                      >
                        {[
                          ['파일 크기', `${(selectedItem.file.size / 1024 / 1024).toFixed(2)} MB`],
                          ['페이지', `${selectedFileInfo.pageCount}페이지`],
                          [
                            '첫 페이지',
                            `${Math.round(selectedFileInfo.width)} × ${Math.round(selectedFileInfo.height)} pt`,
                          ],
                          ['문서 제목', selectedFileInfo.title || '-'],
                          ['작성자', selectedFileInfo.author || '-'],
                          ['주제', selectedFileInfo.subject || '-'],
                        ].map(([label, value]) => (
                          <Box key={label} sx={{ minWidth: 0 }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {label}
                            </Typography>
                            <Typography
                              variant="caption"
                              noWrap
                              sx={{ display: 'block', fontWeight: 700 }}
                            >
                              {value}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Box sx={{ py: 1, display: 'flex', justifyContent: 'center' }}>
                        <CircularProgress size={22} />
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    추출할 PDF를 선택해 주세요.
                  </Typography>
                )}
              </Card>
            </ResizablePanel>

            <ResizableHandle direction="vertical" tooltipText="정보와 추출 영역 높이 조절" />

            <ResizablePanel id="pdf-page-extract" defaultSize={54} minSize={30}>
              <Card
                sx={{
                  p: 2.25,
                  height: '100%',
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                  minHeight: 0,
                  overflowY: 'auto',
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  페이지 추출
                </Typography>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {selectedFileInfo
                      ? `총 ${selectedFileInfo.pageCount}페이지 · 쉼표와 범위를 함께 사용할 수 있습니다.`
                      : 'PDF 정보를 불러오는 중입니다.'}
                  </Typography>
                </Box>
                <TextField
                  label="추출할 페이지"
                  value={pageRange}
                  onChange={(event) => setPageRange(event.target.value)}
                  placeholder="예: 1, 3, 5-8"
                  helperText="역순 범위(8-5)도 지원하며 중복 페이지는 한 번만 포함합니다."
                />
                <Button
                  variant="contained"
                  color="secondary"
                  disabled={!selectedItem || !selectedFileInfo || Boolean(busyAction)}
                  startIcon={busyAction === 'extract' ? progress : <CallSplitRoundedIcon />}
                  onClick={() =>
                    run('extract', async () => {
                      if (!selectedItem || !selectedFileInfo) return;
                      const indices = parsePdfPageRange(pageRange, selectedFileInfo.pageCount);
                      const blob = await extractPdfPages(selectedItem.file, indices);
                      downloadBlob(blob, `${baseName(selectedItem.file.name)}-pages.pdf`);
                      toast.success(`${indices.length}개 페이지를 추출했습니다.`);
                    })
                  }
                >
                  선택 페이지를 PDF로 추출
                </Button>
                <Button
                  variant="outlined"
                  disabled={!selectedItem || !selectedFileInfo || Boolean(busyAction)}
                  startIcon={busyAction === 'split-all' ? progress : <DownloadRoundedIcon />}
                  onClick={() =>
                    run('split-all', async () => {
                      if (!selectedItem || !selectedFileInfo) return;
                      const blob = await splitPdfPagesToZip(selectedItem.file);
                      downloadBlob(blob, `${baseName(selectedItem.file.name)}-split-pages.zip`);
                      toast.success(
                        `${selectedFileInfo.pageCount}개 단일 페이지 PDF를 ZIP으로 저장했습니다.`
                      );
                    })
                  }
                >
                  모든 페이지를 개별 PDF ZIP으로 분할
                </Button>
              </Card>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>

      <Dialog
        open={Boolean(previewFileId)}
        onClose={() => {
          if (!previewSaving) {
            setPreviewFileId(null);
            setPreviewPages([]);
          }
        }}
        fullWidth
        maxWidth="xl"
        slotProps={{ paper: { sx: { height: '88vh', maxHeight: 900 } } }}
      >
        <DialogTitle sx={{ pb: 1, fontWeight: 800 }}>
          PDF 미리보기 · 페이지 편집
          <Typography
            component="span"
            variant="body2"
            color="text.secondary"
            noWrap
            display="block"
          >
            {previewItem?.file.name || ''} · {previewPages.length}페이지
          </Typography>
        </DialogTitle>
        <DialogContent
          dividers
          sx={{ minHeight: 0, overflowY: 'auto', bgcolor: 'background.neutral' }}
        >
          {previewLoading ? (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handlePreviewPageDragEnd}
            >
              <SortableContext
                items={previewPages.map((item) => item.id)}
                strategy={rectSortingStrategy}
              >
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
                    gap: 1.5,
                  }}
                >
                  {previewPages.map((item, index) => (
                    <SortablePreviewPage
                      key={item.id}
                      item={item}
                      index={index}
                      onRotate={() =>
                        setPreviewPages((pages) =>
                          pages.map((pageItem) =>
                            pageItem.id === item.id
                              ? {
                                  ...pageItem,
                                  page: {
                                    ...pageItem.page,
                                    rotation: (pageItem.page.rotation + 90) % 360,
                                  },
                                }
                              : pageItem
                          )
                        )
                      }
                      onDuplicate={() =>
                        setPreviewPages((pages) => {
                          const pageIndex = pages.findIndex((pageItem) => pageItem.id === item.id);
                          if (pageIndex < 0) return pages;
                          const next = [...pages];
                          next.splice(pageIndex + 1, 0, createPreviewPageItem({ ...item.page }));
                          return next;
                        })
                      }
                      onDelete={() =>
                        setPreviewPages((pages) =>
                          pages.filter((pageItem) => pageItem.id !== item.id)
                        )
                      }
                    />
                  ))}
                </Box>
              </SortableContext>
            </DndContext>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 'auto' }}>
            페이지 핸들을 드래그해 순서를 변경할 수 있습니다.
          </Typography>
          <Button
            color="inherit"
            disabled={previewSaving}
            onClick={() => {
              setPreviewFileId(null);
              setPreviewPages([]);
            }}
          >
            취소
          </Button>
          <Button
            variant="contained"
            disabled={previewLoading || previewSaving || previewPages.length === 0}
            startIcon={previewSaving ? <CircularProgress size={18} color="inherit" /> : undefined}
            onClick={handleApplyPreviewEdits}
          >
            병합 목록에 편집 내용 적용
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export function PdfConvertPanel({ pdfFile, pageCount }: PanelProps) {
  const [imageFormat, setImageFormat] = useState<'png' | 'jpeg'>('png');
  const [renderScale, setRenderScale] = useState(2);
  const [sourceImages, setSourceImages] = useState<File[]>([]);
  const [extractedText, setExtractedText] = useState('');
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const run = async (action: string, task: () => Promise<void>) => {
    setBusyAction(action);
    try {
      await task();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '변환 작업에 실패했습니다.');
    } finally {
      setBusyAction(null);
    }
  };

  const progress = <CircularProgress size={18} color="inherit" />;

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr' }, gap: 2.5 }}>
      <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            PDF → 이미지
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {pageCount}개 페이지를 고화질 이미지로 렌더링해 ZIP으로 저장합니다.
          </Typography>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
          <TextField
            select
            label="이미지 형식"
            value={imageFormat}
            onChange={(event) => setImageFormat(event.target.value as 'png' | 'jpeg')}
            SelectProps={{ native: true }}
          >
            <option value="png">PNG (무손실)</option>
            <option value="jpeg">JPG (용량 절약)</option>
          </TextField>
          <TextField
            select
            label="해상도"
            value={renderScale}
            onChange={(event) => setRenderScale(Number(event.target.value))}
            SelectProps={{ native: true }}
          >
            <option value={1}>표준 1×</option>
            <option value={2}>고화질 2×</option>
            <option value={3}>초고화질 3×</option>
          </TextField>
        </Box>
        <Button
          variant="contained"
          disabled={Boolean(busyAction)}
          startIcon={busyAction === 'pdf-images' ? progress : <ImageRoundedIcon />}
          onClick={() =>
            run('pdf-images', async () => {
              const images = await renderPdfPagesToImages(pdfFile, imageFormat, renderScale);
              const zip = await createZipFromFiles(images);
              downloadBlob(zip, `${baseName(pdfFile.name)}-${imageFormat}-pages.zip`);
              toast.success(`${images.length}개 페이지 이미지를 저장했습니다.`);
            })
          }
        >
          전체 페이지 이미지 ZIP 다운로드
        </Button>

        <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
            이미지 → PDF
          </Typography>
          <Typography variant="body2" color="text.secondary">
            PNG, JPG, WebP 등의 이미지를 순서대로 A4 PDF로 만듭니다.
          </Typography>
        </Box>
        <Button variant="outlined" component="label" startIcon={<CloudUploadRoundedIcon />}>
          이미지 추가
          <input
            hidden
            multiple
            type="file"
            accept="image/*"
            onChange={(event) => {
              setSourceImages((images) => [...images, ...Array.from(event.target.files || [])]);
              event.target.value = '';
            }}
          />
        </Button>
        {sourceImages.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
            {sourceImages.map((file, index) => (
              <Chip
                key={`${file.name}-${file.lastModified}-${index}`}
                label={`${index + 1}. ${file.name}`}
                onDelete={() =>
                  setSourceImages((files) => files.filter((_, itemIndex) => itemIndex !== index))
                }
              />
            ))}
          </Box>
        )}
        <Button
          variant="contained"
          color="success"
          disabled={sourceImages.length === 0 || Boolean(busyAction)}
          startIcon={busyAction === 'images-pdf' ? progress : <PictureAsPdfRoundedIcon />}
          onClick={() =>
            run('images-pdf', async () => {
              const blob = await imagesToPdf(sourceImages);
              downloadBlob(blob, 'images-to-pdf.pdf');
              toast.success(`${sourceImages.length}개 이미지를 PDF로 만들었습니다.`);
            })
          }
        >
          이미지 PDF 다운로드
        </Button>
      </Card>

      <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            PDF 텍스트 추출
          </Typography>
          <Typography variant="body2" color="text.secondary">
            문서에 포함된 선택 가능한 텍스트를 페이지별로 추출합니다.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          disabled={Boolean(busyAction)}
          startIcon={busyAction === 'text' ? progress : <TextSnippetRoundedIcon />}
          onClick={() =>
            run('text', async () => {
              const text = await extractPdfText(pdfFile);
              setExtractedText(text);
              toast.success('텍스트 추출을 완료했습니다.');
            })
          }
        >
          텍스트 추출
        </Button>
        <TextField
          multiline
          minRows={14}
          maxRows={24}
          value={extractedText}
          onChange={(event) => setExtractedText(event.target.value)}
          placeholder="추출된 텍스트가 여기에 표시됩니다. 스캔 이미지 PDF는 OCR 도구를 이용해 주세요."
        />
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            disabled={!extractedText}
            startIcon={<DownloadRoundedIcon />}
            onClick={() =>
              downloadBlob(
                new Blob([extractedText], { type: 'text/plain;charset=utf-8' }),
                `${baseName(pdfFile.name)}.txt`
              )
            }
          >
            TXT 다운로드
          </Button>
          <Button
            variant="outlined"
            disabled={!extractedText}
            onClick={async () => {
              await navigator.clipboard.writeText(extractedText);
              toast.success('텍스트를 클립보드에 복사했습니다.');
            }}
          >
            전체 복사
          </Button>
        </Box>
      </Card>
    </Box>
  );
}

export function PdfDocumentPanel({ pdfFile, pageCount }: PanelProps) {
  const [metadata, setMetadata] = useState<PdfMetadata>({
    title: '',
    author: '',
    subject: '',
    keywords: '',
  });
  const [startNumber, setStartNumber] = useState(1);
  const [numberPosition, setNumberPosition] = useState<
    'bottom-center' | 'bottom-right' | 'top-right'
  >('bottom-center');
  const [busyAction, setBusyAction] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    readPdfMetadata(pdfFile)
      .then((value) => {
        if (active) setMetadata(value);
      })
      .catch(() => {
        if (active) toast.error('PDF 문서 정보를 읽지 못했습니다.');
      });
    return () => {
      active = false;
    };
  }, [pdfFile]);

  const run = async (action: string, task: () => Promise<void>) => {
    setBusyAction(action);
    try {
      await task();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '문서 작업에 실패했습니다.');
    } finally {
      setBusyAction(null);
    }
  };

  const progress = <CircularProgress size={18} color="inherit" />;

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr' }, gap: 2.5 }}>
      <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            문서 정보 · 메타데이터
          </Typography>
          <Typography variant="body2" color="text.secondary">
            제목, 작성자, 주제와 검색 키워드를 정리합니다.
          </Typography>
        </Box>
        <TextField
          label="문서 제목"
          value={metadata.title}
          onChange={(event) => setMetadata((value) => ({ ...value, title: event.target.value }))}
        />
        <TextField
          label="작성자"
          value={metadata.author}
          onChange={(event) => setMetadata((value) => ({ ...value, author: event.target.value }))}
        />
        <TextField
          label="주제"
          value={metadata.subject}
          onChange={(event) => setMetadata((value) => ({ ...value, subject: event.target.value }))}
        />
        <TextField
          label="키워드"
          value={metadata.keywords}
          onChange={(event) => setMetadata((value) => ({ ...value, keywords: event.target.value }))}
          helperText="쉼표로 구분해 입력하세요."
        />
        <Button
          variant="contained"
          disabled={Boolean(busyAction)}
          startIcon={busyAction === 'metadata' ? progress : <DataObjectRoundedIcon />}
          onClick={() =>
            run('metadata', async () => {
              const blob = await updatePdfMetadata(pdfFile, metadata);
              downloadBlob(blob, `${baseName(pdfFile.name)}-metadata.pdf`);
              toast.success('문서 정보를 저장했습니다.');
            })
          }
        >
          문서 정보 적용 PDF 다운로드
        </Button>
      </Card>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              페이지 번호
            </Typography>
            <Typography variant="body2" color="text.secondary">
              전체 {pageCount}페이지에 연속 번호를 삽입합니다.
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <TextField
              type="number"
              label="시작 번호"
              value={startNumber}
              onChange={(event) => setStartNumber(Number(event.target.value))}
              inputProps={{ min: 0 }}
            />
            <TextField
              select
              label="표시 위치"
              value={numberPosition}
              onChange={(event) => setNumberPosition(event.target.value as typeof numberPosition)}
              SelectProps={{ native: true }}
            >
              <option value="bottom-center">하단 중앙</option>
              <option value="bottom-right">하단 오른쪽</option>
              <option value="top-right">상단 오른쪽</option>
            </TextField>
          </Box>
          <Button
            variant="contained"
            color="secondary"
            disabled={Boolean(busyAction)}
            startIcon={busyAction === 'numbers' ? progress : <NumbersRoundedIcon />}
            onClick={() =>
              run('numbers', async () => {
                const blob = await addPageNumbers(pdfFile, {
                  startNumber: Math.max(0, startNumber),
                  position: numberPosition,
                });
                downloadBlob(blob, `${baseName(pdfFile.name)}-numbered.pdf`);
                toast.success('페이지 번호를 삽입했습니다.');
              })
            }
          >
            페이지 번호 적용 PDF 다운로드
          </Button>
        </Card>

        <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              PDF 구조 최적화
            </Typography>
            <Typography variant="body2" color="text.secondary">
              객체 스트림을 다시 구성해 문서 구조를 정리합니다. 이미지 화질은 변경하지 않습니다.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            disabled={Boolean(busyAction)}
            startIcon={busyAction === 'optimize' ? progress : <CompressRoundedIcon />}
            onClick={() =>
              run('optimize', async () => {
                const blob = await optimizePdfStructure(pdfFile);
                downloadBlob(blob, `${baseName(pdfFile.name)}-optimized.pdf`);
                const difference = pdfFile.size - blob.size;
                const summary =
                  difference > 0
                    ? `${(difference / 1024).toFixed(1)} KB 감소했습니다.`
                    : '구조 최적화를 완료했습니다.';
                toast.success(summary);
              })
            }
          >
            구조 최적화 PDF 다운로드
          </Button>
        </Card>
      </Box>
    </Box>
  );
}
