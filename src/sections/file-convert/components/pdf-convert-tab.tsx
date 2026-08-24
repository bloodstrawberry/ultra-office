'use client';

import { toast } from 'sonner';
import { PDFDocument } from 'pdf-lib';
import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CallSplitRoundedIcon from '@mui/icons-material/CallSplitRounded';
import MergeTypeRoundedIcon from '@mui/icons-material/MergeTypeRounded';
import TextFieldsRoundedIcon from '@mui/icons-material/TextFieldsRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { addWatermarkToPdf } from '../../pdf-master/utils/pdf-advanced-utils';
import { splitPdfFile, mergePdfFiles } from '../../util/utils/pdf-tool-utils';

// ----------------------------------------------------------------------

export function PdfConvertTab() {
  const [pdfSubTool, setPdfSubTool] = useState<'merge' | 'split' | 'img2pdf' | 'watermark'>(
    'merge'
  );
  const [pdfMergeFiles, setPdfMergeFiles] = useState<File[]>([]);
  const [pdfSplitFile, setPdfSplitFile] = useState<File | null>(null);
  const [splitPageInput, setSplitPageInput] = useState<string>('1, 2-3');
  const [img2PdfFiles, setImg2PdfFiles] = useState<File[]>([]);
  const [pdfWatermarkFile, setPdfWatermarkFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState<string>('CONFIDENTIAL');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.3);
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(false);

  const img2PdfDrop = useImageDropPaste({
    onFiles: (files) => setImg2PdfFiles((prev) => [...prev, ...files]),
    multiple: true,
    disabled: pdfSubTool !== 'img2pdf',
  });

  const handleMergePdf = async () => {
    if (pdfMergeFiles.length < 2) {
      toast.error('병합할 PDF 파일을 2개 이상 선택해 주세요.');
      return;
    }
    setIsPdfLoading(true);
    try {
      const blob = await mergePdfFiles(pdfMergeFiles);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged_document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('PDF 병합이 완료되어 다운로드되었습니다.');
    } catch {
      toast.error('PDF 병합 중 오류가 발생했습니다.');
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleSplitPdf = async () => {
    if (!pdfSplitFile) {
      toast.error('분할할 PDF 파일을 선택해 주세요.');
      return;
    }
    setIsPdfLoading(true);
    try {
      const indices: number[] = [];
      const parts = splitPageInput.split(',');
      parts.forEach((p) => {
        const trimmed = p.trim();
        if (trimmed.includes('-')) {
          const [start, end] = trimmed.split('-').map((n) => parseInt(n.trim(), 10));
          if (!isNaN(start) && !isNaN(end)) {
            for (let i = start; i <= end; i += 1) {
              indices.push(i - 1);
            }
          }
        } else {
          const num = parseInt(trimmed, 10);
          if (!isNaN(num)) indices.push(num - 1);
        }
      });

      const blob = await splitPdfFile(pdfSplitFile, indices);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `extracted_pages_${pdfSplitFile.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('지정한 페이지가 성공적으로 추출되었습니다.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`추출 실패: ${msg}`);
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleImagesToPdf = async () => {
    if (img2PdfFiles.length === 0) {
      toast.error('PDF로 변환할 이미지들을 선택해 주세요.');
      return;
    }
    setIsPdfLoading(true);
    try {
      const pdfDoc = await PDFDocument.create();
      for (let i = 0; i < img2PdfFiles.length; i += 1) {
        const file = img2PdfFiles[i];
        const arrayBuf = await file.arrayBuffer();
        let embeddedImg;
        if (file.type.includes('png')) {
          embeddedImg = await pdfDoc.embedPng(arrayBuf);
        } else {
          embeddedImg = await pdfDoc.embedJpg(arrayBuf);
        }

        const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size
        const { width, height } = embeddedImg.scaleToFit(555, 800);
        page.drawImage(embeddedImg, {
          x: (595.28 - width) / 2,
          y: (841.89 - height) / 2,
          width,
          height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'images_converted.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('이미지들이 A4 규격 PDF로 변환되었습니다.');
    } catch {
      toast.error('이미지 PDF 변환에 실패했습니다. PNG 또는 JPG 파일을 사용해 주세요.');
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleAddWatermark = async () => {
    if (!pdfWatermarkFile) {
      toast.error('워터마크를 삽입할 PDF 파일을 선택해 주세요.');
      return;
    }
    setIsPdfLoading(true);
    try {
      const blob = await addWatermarkToPdf(pdfWatermarkFile, watermarkText, watermarkOpacity);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `watermarked_${pdfWatermarkFile.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('워터마크가 삽입된 PDF가 다운로드되었습니다.');
    } catch {
      toast.error('PDF 워터마크 삽입 중 오류가 발생했습니다.');
    } finally {
      setIsPdfLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button
          variant={pdfSubTool === 'merge' ? 'contained' : 'outlined'}
          startIcon={<MergeTypeRoundedIcon />}
          onClick={() => setPdfSubTool('merge')}
        >
          PDF 병합 (Merge)
        </Button>
        <Button
          variant={pdfSubTool === 'split' ? 'contained' : 'outlined'}
          startIcon={<CallSplitRoundedIcon />}
          onClick={() => setPdfSubTool('split')}
        >
          페이지 분할 / 추출 (Split)
        </Button>
        <Button
          variant={pdfSubTool === 'img2pdf' ? 'contained' : 'outlined'}
          startIcon={<PictureAsPdfRoundedIcon />}
          onClick={() => setPdfSubTool('img2pdf')}
        >
          이미지 ➔ PDF 문서 생성
        </Button>
        <Button
          variant={pdfSubTool === 'watermark' ? 'contained' : 'outlined'}
          startIcon={<TextFieldsRoundedIcon />}
          onClick={() => setPdfSubTool('watermark')}
        >
          PDF 텍스트 워터마크 삽입
        </Button>
      </Box>

      {/* Subtool 1: Merge */}
      {pdfSubTool === 'merge' && (
        <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            다중 PDF 파일들을 원하는 순서대로 단일 문서로 결합
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
            병합할 PDF 파일들 선택 (다중 선택)
            <input
              type="file"
              hidden
              multiple
              accept="application/pdf"
              onChange={(e) => {
                if (e.target.files) setPdfMergeFiles(Array.from(e.target.files));
              }}
            />
          </Button>
          {pdfMergeFiles.length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                병합 순서 목록 ({pdfMergeFiles.length}개):
              </Typography>
              {pdfMergeFiles.map((f, i) => (
                <Card
                  key={i}
                  variant="outlined"
                  sx={{
                    p: 1.2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {i + 1}. {f.name}
                  </Typography>
                  <Chip label={`${Math.round(f.size / 1024)} KB`} size="small" />
                </Card>
              ))}
            </Box>
          )}
          <Button
            variant="contained"
            size="large"
            disabled={pdfMergeFiles.length < 2 || isPdfLoading}
            onClick={handleMergePdf}
            startIcon={
              isPdfLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <DownloadRoundedIcon />
              )
            }
            sx={{ py: 1.3, fontWeight: 800 }}
          >
            {isPdfLoading ? '병합 중...' : `${pdfMergeFiles.length}개 PDF 병합 및 다운로드`}
          </Button>
        </Card>
      )}

      {/* Subtool 2: Split */}
      {pdfSubTool === 'split' && (
        <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            PDF에서 원하는 페이지 범위를 지정하여 새 PDF로 추출
          </Typography>
          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUploadRoundedIcon />}
            sx={{
              py: 2.5,
              borderStyle: 'dashed',
              borderWidth: 2,
              borderRadius: 2,
              fontWeight: 700,
            }}
          >
            분할할 PDF 파일 선택
            <input
              type="file"
              hidden
              accept="application/pdf"
              onChange={(e) => {
                if (e.target.files?.[0]) setPdfSplitFile(e.target.files[0]);
              }}
            />
          </Button>
          {pdfSplitFile && (
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
              선택된 파일: {pdfSplitFile.name} ({Math.round(pdfSplitFile.size / 1024)} KB)
            </Typography>
          )}
          <TextField
            label="추출할 페이지 번호 (콤마 또는 범위 지정)"
            placeholder="예: 1, 3, 5-8"
            value={splitPageInput}
            onChange={(e) => setSplitPageInput(e.target.value)}
            helperText="1부터 시작하는 페이지 번호입니다."
          />
          <Button
            variant="contained"
            color="secondary"
            size="large"
            disabled={!pdfSplitFile || isPdfLoading}
            onClick={handleSplitPdf}
            startIcon={
              isPdfLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <CallSplitRoundedIcon />
              )
            }
            sx={{ py: 1.3, fontWeight: 800 }}
          >
            {isPdfLoading ? '페이지 추출 중...' : '지정 페이지 추출 및 다운로드'}
          </Button>
        </Card>
      )}

      {/* Subtool 3: Images to PDF */}
      {pdfSubTool === 'img2pdf' && (
        <Card
          {...img2PdfDrop.getRootProps()}
          sx={{
            p: 3,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
            bgcolor: img2PdfDrop.isDragActive ? 'action.hover' : 'background.paper',
            border: img2PdfDrop.isDragActive ? '2px dashed' : 'none',
            borderColor: 'primary.main',
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            다중 이미지(PNG, JPG, WebP)를 규격 A4 PDF 문서로 변환
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
            이미지 파일들 선택 (드래그 & 드롭 / 클립보드 붙여넣기 지원)
            <input
              type="file"
              hidden
              multiple
              accept="image/*"
              onChange={(e) => {
                if (e.target.files)
                  setImg2PdfFiles((prev) => [...prev, ...Array.from(e.target.files || [])]);
              }}
            />
          </Button>
          {img2PdfFiles.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {img2PdfFiles.map((f, i) => (
                <Chip key={i} label={`${i + 1}p: ${f.name}`} size="small" />
              ))}
            </Box>
          )}
          <Button
            variant="contained"
            color="success"
            size="large"
            disabled={img2PdfFiles.length === 0 || isPdfLoading}
            onClick={handleImagesToPdf}
            startIcon={
              isPdfLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <DownloadRoundedIcon />
              )
            }
            sx={{ py: 1.3, fontWeight: 800 }}
          >
            {isPdfLoading
              ? 'PDF 생성 중...'
              : `${img2PdfFiles.length}장 이미지 PDF 변환 및 다운로드`}
          </Button>
        </Card>
      )}

      {/* Subtool 4: Watermark PDF */}
      {pdfSubTool === 'watermark' && (
        <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            PDF 모든 페이지에 대각선 텍스트 워터마크 삽입
          </Typography>
          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUploadRoundedIcon />}
            sx={{
              py: 2.5,
              borderStyle: 'dashed',
              borderWidth: 2,
              borderRadius: 2,
              fontWeight: 700,
            }}
          >
            워터마크 삽입할 PDF 파일 선택
            <input
              type="file"
              hidden
              accept="application/pdf"
              onChange={(e) => {
                if (e.target.files?.[0]) setPdfWatermarkFile(e.target.files[0]);
              }}
            />
          </Button>
          {pdfWatermarkFile && (
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
              선택된 파일: {pdfWatermarkFile.name} ({Math.round(pdfWatermarkFile.size / 1024)} KB)
            </Typography>
          )}
          <TextField
            label="워터마크 텍스트 문구"
            value={watermarkText}
            onChange={(e) => setWatermarkText(e.target.value)}
          />
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              워터마크 투명도: {Math.round(watermarkOpacity * 100)}%
            </Typography>
            <Slider
              value={watermarkOpacity}
              min={0.1}
              max={0.8}
              step={0.05}
              onChange={(_, v) => setWatermarkOpacity(v as number)}
            />
          </Box>
          <Button
            variant="contained"
            color="warning"
            size="large"
            disabled={!pdfWatermarkFile || isPdfLoading}
            onClick={handleAddWatermark}
            startIcon={
              isPdfLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <DownloadRoundedIcon />
              )
            }
            sx={{ py: 1.3, fontWeight: 800 }}
          >
            {isPdfLoading ? '워터마크 처리 중...' : '워터마크 삽입 및 다운로드'}
          </Button>
        </Card>
      )}
    </Box>
  );
}
