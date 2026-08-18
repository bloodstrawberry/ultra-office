'use client';

import JSZip from 'jszip';
import { toast } from 'sonner';
import { PDFDocument } from 'pdf-lib';
import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import TableViewRoundedIcon from '@mui/icons-material/TableViewRounded';
import CallSplitRoundedIcon from '@mui/icons-material/CallSplitRounded';
import MergeTypeRoundedIcon from '@mui/icons-material/MergeTypeRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import PhotoLibraryRoundedIcon from '@mui/icons-material/PhotoLibraryRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { splitPdfFile, mergePdfFiles } from '../../util/utils/pdf-tool-utils';
import {
  convertExcelToCsv,
  convertExcelToJson,
  convertDataToExcelBlob,
} from '../../util/utils/excel-converter-utils';

// ----------------------------------------------------------------------

export function FileConvertView() {
  const [currentTab, setCurrentTab] = useState<'pdf' | 'excel' | 'image'>('pdf');

  // --------------------------------------------------------------------
  // PDF Suite State
  // --------------------------------------------------------------------
  const [pdfSubTool, setPdfSubTool] = useState<'merge' | 'split' | 'img2pdf'>('merge');
  const [pdfMergeFiles, setPdfMergeFiles] = useState<File[]>([]);
  const [pdfSplitFile, setPdfSplitFile] = useState<File | null>(null);
  const [splitPageInput, setSplitPageInput] = useState<string>('1, 2, 3');
  const [img2PdfFiles, setImg2PdfFiles] = useState<File[]>([]);
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(false);

  // --------------------------------------------------------------------
  // Excel Suite State
  // --------------------------------------------------------------------
  const [excelSubTool, setExcelSubTool] = useState<'excel2csv' | 'excel2json' | 'toExcel'>(
    'excel2csv'
  );
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [rawTextData, setRawTextData] = useState<string>(
    '이름,부서,직급\n홍길동,개발팀,수석\n김영희,디자인실,책임'
  );
  const [isExcelLoading, setIsExcelLoading] = useState<boolean>(false);

  // --------------------------------------------------------------------
  // Image Suite State
  // --------------------------------------------------------------------
  const [imgFiles, setImgFiles] = useState<File[]>([]);
  const [targetImgExt, setTargetImgExt] = useState<string>('webp');
  const [isImgConverting, setIsImgConverting] = useState<boolean>(false);

  // --------------------------------------------------------------------
  // PDF Handlers
  // --------------------------------------------------------------------
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
      // Parse 1, 2-4 => 0-indexed
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
      toast.error('PDF로 만들 이미지들을 선택해 주세요.');
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

        const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size (points)
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

  // --------------------------------------------------------------------
  // Excel Handlers
  // --------------------------------------------------------------------
  const handleExcelToCsv = async () => {
    if (!excelFile) {
      toast.error('엑셀 파일을 선택해 주세요.');
      return;
    }
    setIsExcelLoading(true);
    try {
      const { csv, sheetName } = await convertExcelToCsv(excelFile);
      const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csv], {
        type: 'text/csv;charset=utf-8;',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${sheetName}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('엑셀 파일이 CSV로 성공적으로 변환되었습니다.');
    } catch {
      toast.error('엑셀 변환에 실패했습니다.');
    } finally {
      setIsExcelLoading(false);
    }
  };

  const handleExcelToJson = async () => {
    if (!excelFile) {
      toast.error('엑셀 파일을 선택해 주세요.');
      return;
    }
    setIsExcelLoading(true);
    try {
      const { json, sheetName } = await convertExcelToJson(excelFile);
      const blob = new Blob([JSON.stringify(json, null, 2)], {
        type: 'application/json;charset=utf-8;',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${sheetName}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('엑셀 파일이 JSON으로 성공적으로 변환되었습니다.');
    } catch {
      toast.error('JSON 변환에 실패했습니다.');
    } finally {
      setIsExcelLoading(false);
    }
  };

  const handleDataToExcel = () => {
    try {
      const blob = convertDataToExcelBlob(rawTextData, '데이터');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'converted_workbook.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('데이터가 엑셀(.xlsx) 파일로 생성되었습니다.');
    } catch {
      toast.error('엑셀 생성에 실패했습니다.');
    }
  };

  return (
    <DashboardContent>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          파일 일괄 변환기 (File Converter)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          PDF 분할·병합·변환, 엑셀 ⇄ CSV/JSON 상호 변환, 이미지 포맷 일괄 변환을 제공합니다.
        </Typography>
      </Box>

      <Tabs
        value={currentTab}
        onChange={(_, v) => setCurrentTab(v)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab
          label="1. PDF 변환 / 병합 / 분할"
          value="pdf"
          icon={<PictureAsPdfRoundedIcon />}
          iconPosition="start"
        />
        <Tab
          label="2. 엑셀 (Excel ⇄ CSV · JSON)"
          value="excel"
          icon={<TableViewRoundedIcon />}
          iconPosition="start"
        />
        <Tab
          label="3. 이미지 포맷 일괄 변환"
          value="image"
          icon={<PhotoLibraryRoundedIcon />}
          iconPosition="start"
        />
      </Tabs>

      {/* TAB 1: PDF SUITE */}
      {currentTab === 'pdf' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Sub-tools switch */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={pdfSubTool === 'merge' ? 'contained' : 'outlined'}
              startIcon={<MergeTypeRoundedIcon />}
              onClick={() => setPdfSubTool('merge')}
            >
              PDF 파일 병합 (Merge)
            </Button>
            <Button
              variant={pdfSubTool === 'split' ? 'contained' : 'outlined'}
              startIcon={<CallSplitRoundedIcon />}
              onClick={() => setPdfSubTool('split')}
            >
              페이지 추출 & 분할 (Split)
            </Button>
            <Button
              variant={pdfSubTool === 'img2pdf' ? 'contained' : 'outlined'}
              startIcon={<PictureAsPdfRoundedIcon />}
              onClick={() => setPdfSubTool('img2pdf')}
            >
              이미지 → PDF 문서 생성
            </Button>
          </Box>

          {/* Merge Card */}
          {pdfSubTool === 'merge' && (
            <Card
              sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                여러 PDF 파일을 순서대로 단일 파일로 결합
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
                      sx={{ p: 1.2, display: 'flex', justifyContent: 'space-between' }}
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
                {isPdfLoading
                  ? '병합 중...'
                  : `${pdfMergeFiles.length}개 PDF 파일 병합 및 다운로드`}
              </Button>
            </Card>
          )}

          {/* Split Card */}
          {pdfSubTool === 'split' && (
            <Card
              sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                PDF에서 특정 페이지만 선택하여 새 PDF로 추출
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

          {/* Images to PDF Card */}
          {pdfSubTool === 'img2pdf' && (
            <Card
              sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                다중 이미지(PNG, JPG)를 규격 A4 PDF 문서로 변환
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
                PDF로 묶을 이미지들 선택 (다중 선택)
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/png,image/jpeg"
                  onChange={(e) => {
                    if (e.target.files) setImg2PdfFiles(Array.from(e.target.files));
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
        </Box>
      )}

      {/* TAB 2: EXCEL SUITE */}
      {currentTab === 'excel' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={excelSubTool === 'excel2csv' ? 'contained' : 'outlined'}
              onClick={() => setExcelSubTool('excel2csv')}
            >
              Excel → CSV 변환
            </Button>
            <Button
              variant={excelSubTool === 'excel2json' ? 'contained' : 'outlined'}
              onClick={() => setExcelSubTool('excel2json')}
            >
              Excel → JSON 변환
            </Button>
            <Button
              variant={excelSubTool === 'toExcel' ? 'contained' : 'outlined'}
              onClick={() => setExcelSubTool('toExcel')}
            >
              CSV / JSON → Excel (.xlsx) 생성
            </Button>
          </Box>

          {(excelSubTool === 'excel2csv' || excelSubTool === 'excel2json') && (
            <Card
              sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                {excelSubTool === 'excel2csv'
                  ? 'Excel 파일 (.xlsx, .xls) → CSV 변환'
                  : 'Excel 파일 (.xlsx, .xls) → JSON 변환'}
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
                엑셀 파일 (.xlsx, .xls) 업로드
                <input
                  type="file"
                  hidden
                  accept=".xlsx,.xls"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setExcelFile(e.target.files[0]);
                  }}
                />
              </Button>

              {excelFile && (
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  선택된 파일: {excelFile.name} ({Math.round(excelFile.size / 1024)} KB)
                </Typography>
              )}

              <Button
                variant="contained"
                size="large"
                disabled={!excelFile || isExcelLoading}
                onClick={excelSubTool === 'excel2csv' ? handleExcelToCsv : handleExcelToJson}
                startIcon={
                  isExcelLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <DownloadRoundedIcon />
                  )
                }
                sx={{ py: 1.3, fontWeight: 800 }}
              >
                {isExcelLoading ? '변환 처리 중...' : '변환 및 다운로드'}
              </Button>
            </Card>
          )}

          {excelSubTool === 'toExcel' && (
            <Card
              sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                CSV 텍스트 또는 JSON 데이터 → 엑셀 파일 (.xlsx) 생성
              </Typography>

              <textarea
                value={rawTextData}
                onChange={(e) => setRawTextData(e.target.value)}
                placeholder="CSV 문자열 또는 JSON 배열을 붙여넣으세요..."
                style={{
                  width: '100%',
                  minHeight: 180,
                  padding: 12,
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                }}
              />

              <Button
                variant="contained"
                color="success"
                size="large"
                disabled={!rawTextData.trim()}
                onClick={handleDataToExcel}
                startIcon={<DownloadRoundedIcon />}
                sx={{ py: 1.3, fontWeight: 800 }}
              >
                Excel (.xlsx) 파일로 내보내기
              </Button>
            </Card>
          )}
        </Box>
      )}

      {/* TAB 3: IMAGE FORMAT BATCH CONVERT */}
      {currentTab === 'image' && (
        <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            이미지 다중 포맷 일괄 변환 & ZIP 다운로드
          </Typography>

          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUploadRoundedIcon />}
            sx={{ py: 3, borderStyle: 'dashed', borderWidth: 2, borderRadius: 2, fontWeight: 700 }}
          >
            이미지 파일들 선택 (다중 선택)
            <input
              type="file"
              hidden
              multiple
              accept="image/*"
              onChange={(e) => {
                if (e.target.files) setImgFiles(Array.from(e.target.files));
              }}
            />
          </Button>

          {imgFiles.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {imgFiles.map((f, i) => (
                <Chip key={i} label={`${f.name} (${Math.round(f.size / 1024)} KB)`} size="small" />
              ))}
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 1 }}>
            {['webp', 'png', 'jpeg'].map((fmt) => (
              <Button
                key={fmt}
                variant={targetImgExt === fmt ? 'contained' : 'outlined'}
                onClick={() => setTargetImgExt(fmt)}
              >
                {fmt.toUpperCase()} 포맷
              </Button>
            ))}
          </Box>

          <Button
            variant="contained"
            color="primary"
            size="large"
            disabled={imgFiles.length === 0 || isImgConverting}
            onClick={async () => {
              setIsImgConverting(true);
              try {
                const zip = new JSZip();
                for (let i = 0; i < imgFiles.length; i += 1) {
                  const file = imgFiles[i];
                  const bitmap = await createImageBitmap(file);
                  const canvas = document.createElement('canvas');
                  canvas.width = bitmap.width;
                  canvas.height = bitmap.height;
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    ctx.drawImage(bitmap, 0, 0);
                    const mime =
                      targetImgExt === 'png'
                        ? 'image/png'
                        : targetImgExt === 'webp'
                          ? 'image/webp'
                          : 'image/jpeg';
                    const blob = await new Promise<Blob | null>((res) =>
                      canvas.toBlob(res, mime, 0.9)
                    );
                    if (blob) {
                      const base = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                      zip.file(`${base}.${targetImgExt}`, blob);
                    }
                  }
                }
                const zipBlob = await zip.generateAsync({ type: 'blob' });
                const url = URL.createObjectURL(zipBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `converted_images_${targetImgExt}.zip`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                toast.success('ZIP 파일로 일괄 다운로드되었습니다.');
              } catch {
                toast.error('변환 실패');
              } finally {
                setIsImgConverting(false);
              }
            }}
            startIcon={
              isImgConverting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <DownloadRoundedIcon />
              )
            }
            sx={{ py: 1.3, fontWeight: 800 }}
          >
            {isImgConverting ? '일괄 변환 중...' : `${imgFiles.length}개 파일 변환 및 ZIP 다운로드`}
          </Button>
        </Card>
      )}
    </DashboardContent>
  );
}
