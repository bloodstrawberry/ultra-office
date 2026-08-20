'use client';

import JSZip from 'jszip';
import { toast } from 'sonner';
import { PDFDocument } from 'pdf-lib';
import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Chip from '@mui/material/Chip';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import ToggleButton from '@mui/material/ToggleButton';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import SchemaRoundedIcon from '@mui/icons-material/SchemaRounded';
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import TableViewRoundedIcon from '@mui/icons-material/TableViewRounded';
import CallSplitRoundedIcon from '@mui/icons-material/CallSplitRounded';
import MergeTypeRoundedIcon from '@mui/icons-material/MergeTypeRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import PhotoLibraryRoundedIcon from '@mui/icons-material/PhotoLibraryRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import TextFieldsRoundedIcon from '@mui/icons-material/TextFieldsRounded';
import SlideshowRoundedIcon from '@mui/icons-material/SlideshowRounded';
import DataObjectRoundedIcon from '@mui/icons-material/DataObjectRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

import { parseHwpxFile } from '../../hwp-master/utils/hwpx-parser';
import { addWatermarkToPdf } from '../../pdf-master/utils/pdf-advanced-utils';
import { splitPdfFile, mergePdfFiles } from '../../util/utils/pdf-tool-utils';
import { generatePptxFile } from '../../doc-master/utils/pptx-generator';
import {
  exportToHtmlFile,
  exportMarkdownToDocx,
  exportToMarkdownFile,
} from '../../doc-master/utils/markdown-export-utils';
import {
  convertExcelToCsv,
  convertExcelToJson,
  convertDataToExcelBlob,
} from '../../util/utils/excel-converter-utils';
import {
  formatBytes,
  downloadDataUrl,
  convertImageFormat,
  type SupportedFormat,
  calculateDataUrlByteSize,
} from '../../photo/utils/image-processor';
import {
  convertDataFormat,
  generateSqlFromData,
  decodeBase64ToString,
  encodeStringToBase64,
  generateTypeScriptInterface,
  type DataFormat,
} from '../utils/data-format-utils';

// ----------------------------------------------------------------------

type TabCategory = 'pdf' | 'office' | 'image' | 'data';

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

export function FileConvertView() {
  const [currentTab, setCurrentTab] = useState<TabCategory>('pdf');
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    setHasLoaded(true);
  }, []);

  const copyToClipboard = (text: string, label = '복사되었습니다.') => {
    navigator.clipboard.writeText(text);
    toast.success(label);
  };

  // --------------------------------------------------------------------
  // 1. PDF Suite State
  // --------------------------------------------------------------------
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

  // --------------------------------------------------------------------
  // 2. Office & Document Suite State
  // --------------------------------------------------------------------
  const [officeSubTool, setOfficeSubTool] = useState<'excel' | 'markdown' | 'hwpx' | 'pptx'>(
    'excel'
  );

  // Excel
  const [excelSubMode, setExcelSubMode] = useState<'excel2csv' | 'excel2json' | 'toExcel'>(
    'excel2csv'
  );
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [rawTableData, setRawTableData] = useState<string>(
    '이름,부서,직급,이메일\n홍길동,플랫폼개발팀,수석,hong@ultraoffice.com\n김영희,디자인실,책임,kim@ultraoffice.com\n이철수,경영지원팀,선임,lee@ultraoffice.com'
  );
  const [isOfficeLoading, setIsOfficeLoading] = useState<boolean>(false);

  // Markdown to Word / HTML
  const [markdownInput, setMarkdownInput] = useState<string>(
    `# 울트라 오피스 프로젝트 보고서\n\n## 1. 개요\n본 문서는 차세대 오피스 통합 플랫폼의 **변환 기능**을 설명합니다.\n\n- PDF 병합 및 분할\n- 엑셀 / CSV / JSON 상호 변환\n- 마크다운 DOCX / HTML 내보내기\n- 이미지 포맷 6종 일괄 변환\n\n### 2. 성능 지표\n| 항목 | 기존 | 울트라오피스 |\n| :--- | :--- | :--- |\n| 변환 속도 | 3.5s | **0.2s** |\n| 보안 | 서버 전송 | **100% 로컬 처리** |`
  );
  const [docTitle, setDocTitle] = useState<string>('울트라_오피스_보고서');

  // HWPX Extractor
  const [hwpxFile, setHwpxFile] = useState<File | null>(null);
  const [hwpxExtractedMd, setHwpxExtractedMd] = useState<string>('');
  const [hwpxExtractedTxt, setHwpxExtractedTxt] = useState<string>('');
  const [hwpxTablesCsv, setHwpxTablesCsv] = useState<string[]>([]);

  // PPTX Generator
  const [pptxTitle, setPptxTitle] = useState<string>('신규 서비스 런칭 전략');
  const [pptxOutline, setPptxOutline] = useState<string>(
    `# 1. 시장 환경 분석\n- 디지털 전환 가속화 및 오피스 도구 통합 수요 증가\n- 강력한 웹 기반 클라이언트 사이드 변환 엔진\n\n# 2. 핵심 기능 및 가치\n- 100% 클라이언트 로컬 처리로 데이터 유출 원천 차단\n- PDF, Office, 이미지, 개발자 데이터의 전방위적 포맷 변환 지원\n\n# 3. 향후 로드맵\n- AI 기반 자동 문서 요약 및 서식 스타일링 기능 고도화`
  );

  // --------------------------------------------------------------------
  // 3. Image Suite State
  // --------------------------------------------------------------------
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

  // --------------------------------------------------------------------
  // 4. Developer & Data Hub State
  // --------------------------------------------------------------------
  const [dataSubTool, setDataSubTool] = useState<'4way' | 'ts' | 'sql' | 'base64'>('4way');
  const [dataFromFormat, setDataFromFormat] = useState<DataFormat>('json');
  const [dataToFormat, setDataToFormat] = useState<DataFormat>('yaml');
  const [dataInputText, setDataInputText] = useState<string>(
    JSON.stringify(
      [
        {
          id: 1,
          name: '홍길동',
          email: 'hong@ultraoffice.com',
          role: 'Admin',
          isActive: true,
          dept: { name: '플랫폼개발팀', floor: 7 },
        },
        {
          id: 2,
          name: '김영희',
          email: 'kim@ultraoffice.com',
          role: 'Designer',
          isActive: true,
          dept: { name: 'UX디자인실', floor: 6 },
        },
      ],
      null,
      2
    )
  );
  const [dataOutputText, setDataOutputText] = useState<string>('');

  // TS & SQL
  const [tsResult, setTsResult] = useState<string>('');
  const [sqlResult, setSqlResult] = useState<{ createTable: string; insertQueries: string }>({
    createTable: '',
    insertQueries: '',
  });

  // Base64
  const [base64Mode, setBase64Mode] = useState<'encode' | 'decode'>('encode');
  const [base64Input, setBase64Input] = useState<string>('Ultra Office All-in-one Data Converter');
  const [base64Output, setBase64Output] = useState<string>('');

  // Drop & Paste Hooks
  const img2PdfDrop = useImageDropPaste({
    onFiles: (files) => setImg2PdfFiles((prev) => [...prev, ...files]),
    multiple: true,
    disabled: currentTab !== 'pdf' || pdfSubTool !== 'img2pdf',
  });

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
    disabled: currentTab !== 'image' || imageSubTool !== 'convert',
  });

  const asciiDrop = useImageDropPaste({
    onFiles: (files) => {
      if (files[0]) {
        const url = URL.createObjectURL(files[0]);
        setAsciiSourceImg(url);
      }
    },
    multiple: false,
    disabled: currentTab !== 'image' || imageSubTool !== 'ascii',
  });

  // --------------------------------------------------------------------
  // Handlers: PDF
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

  // --------------------------------------------------------------------
  // Handlers: Office & Documents
  // --------------------------------------------------------------------
  const handleExcelToCsv = async () => {
    if (!excelFile) {
      toast.error('엑셀 파일을 선택해 주세요.');
      return;
    }
    setIsOfficeLoading(true);
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
      setIsOfficeLoading(false);
    }
  };

  const handleExcelToJson = async () => {
    if (!excelFile) {
      toast.error('엑셀 파일을 선택해 주세요.');
      return;
    }
    setIsOfficeLoading(true);
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
      setIsOfficeLoading(false);
    }
  };

  const handleDataToExcel = () => {
    try {
      const blob = convertDataToExcelBlob(rawTableData, '데이터');
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

  const handleMarkdownToDocx = async () => {
    if (!markdownInput.trim()) {
      toast.error('마크다운 내용을 입력해 주세요.');
      return;
    }
    setIsOfficeLoading(true);
    try {
      await exportMarkdownToDocx(markdownInput, docTitle, `${docTitle}.docx`);
      toast.success('MS Word(.docx) 문서가 성공적으로 생성되었습니다.');
    } catch {
      toast.error('Word 문서 변환에 실패했습니다.');
    } finally {
      setIsOfficeLoading(false);
    }
  };

  const handleMarkdownToHtml = () => {
    if (!markdownInput.trim()) {
      toast.error('마크다운 내용을 입력해 주세요.');
      return;
    }
    try {
      const simpleHtml = markdownInput
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/\n/gim, '<br />');
      exportToHtmlFile(simpleHtml, docTitle, `${docTitle}.html`);
      toast.success('HTML 웹 문서가 다운로드되었습니다.');
    } catch {
      toast.error('HTML 변환 실패');
    }
  };

  const handleHwpxUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHwpxFile(file);
    setIsOfficeLoading(true);
    try {
      const parsed = await parseHwpxFile(file);
      setHwpxExtractedTxt(parsed.fullText);

      // Markdown format
      let md = `# ${parsed.title}\n\n`;
      parsed.sections.forEach((sec) => {
        sec.paragraphs.forEach((p) => {
          if (p.headingLevel === 1) md += `# ${p.text}\n\n`;
          else if (p.headingLevel === 2) md += `## ${p.text}\n\n`;
          else if (p.isBold) md += `**${p.text}**\n\n`;
          else md += `${p.text}\n\n`;
        });
        sec.tables.forEach((tbl) => {
          if (tbl.caption) md += `**[${tbl.caption}]**\n\n`;
          if (tbl.rows.length > 0) {
            const header = tbl.rows[0].map((c) => c.text || ' ').join(' | ');
            const sep = tbl.rows[0].map(() => '---').join(' | ');
            md += `| ${header} |\n| ${sep} |\n`;
            tbl.rows.slice(1).forEach((r) => {
              md += `| ${r.map((c) => c.text || ' ').join(' | ')} |\n`;
            });
            md += '\n';
          }
        });
      });
      setHwpxExtractedMd(md);

      // Tables to CSVs
      const csvs: string[] = [];
      parsed.sections.forEach((sec) => {
        sec.tables.forEach((tbl) => {
          const rows = tbl.rows.map((r) =>
            r.map((c) => `"${c.text.replace(/"/g, '""')}"`).join(',')
          );
          csvs.push(rows.join('\n'));
        });
      });
      setHwpxTablesCsv(csvs);

      toast.success(`한글 문서(${file.name}) 파싱이 완료되었습니다.`);
    } catch {
      toast.error('HWPX 파일 분석 중 오류가 발생했습니다.');
    } finally {
      setIsOfficeLoading(false);
    }
  };

  const handleGeneratePptx = async () => {
    if (!pptxOutline.trim()) {
      toast.error('슬라이드 개요 내용을 입력해 주세요.');
      return;
    }
    setIsOfficeLoading(true);
    try {
      const slidesData = pptxOutline
        .split(/(?=# \d+\.)|(?=# )/g)
        .filter((s) => s.trim().length > 0)
        .map((sec, idx) => {
          const lines = sec.trim().split('\n');
          const title = lines[0].replace(/^# \d+\.\s*|^#\s*/, '').trim() || `Slide ${idx + 1}`;
          const bullets = lines
            .slice(1)
            .map((l) => l.replace(/^[-*•]\s*/, '').trim())
            .filter((l) => l.length > 0);
          return {
            id: `slide_${idx + 1}`,
            title,
            layout: 'agenda' as const,
            bullets: bullets.length > 0 ? bullets : ['내용을 입력하세요.'],
          };
        });

      await generatePptxFile(
        {
          title: pptxTitle,
          author: 'Ultra Office User',
          company: 'Ultra Office AI',
          themeId: 'navy-tech',
          slides: slidesData,
        },
        `${pptxTitle}.pptx`
      );
      toast.success('PowerPoint(.pptx) 프레젠테이션이 생성되었습니다.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`PPTX 생성 실패: ${msg}`);
    } finally {
      setIsOfficeLoading(false);
    }
  };

  // --------------------------------------------------------------------
  // Handlers: Image Batch Convert
  // --------------------------------------------------------------------
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

  // ASCII Convert
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

  // --------------------------------------------------------------------
  // Handlers: Data Hub
  // --------------------------------------------------------------------
  const handleConvert4Way = () => {
    try {
      const out = convertDataFormat(dataInputText, dataFromFormat, dataToFormat);
      setDataOutputText(out);
      toast.success(`${dataFromFormat.toUpperCase()} ➔ ${dataToFormat.toUpperCase()} 변환 완료`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`변환 오류: ${msg}`);
    }
  };

  const handleGenerateTsAndSql = () => {
    try {
      const tsCode = generateTypeScriptInterface(dataInputText, 'UserProfile');
      setTsResult(tsCode);
      const sqlCode = generateSqlFromData(dataInputText, 'users');
      setSqlResult(sqlCode);
      toast.success('TypeScript 인터페이스 및 SQL 쿼리가 생성되었습니다.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`생성 실패: ${msg}`);
    }
  };

  const handleBase64Process = () => {
    try {
      if (base64Mode === 'encode') {
        const encoded = encodeStringToBase64(base64Input);
        setBase64Output(encoded);
      } else {
        const decoded = decodeBase64ToString(base64Input);
        setBase64Output(decoded);
      }
      toast.success('Base64 변환 완료');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Base64 처리 오류: ${msg}`);
    }
  };

  if (!hasLoaded) {
    return (
      <DashboardContent>
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}
        >
          <CircularProgress size={36} />
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      {/* Header */}
      <Box sx={{ mb: 2.5, flexShrink: 0 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <AutoAwesomeRoundedIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          통합 파일 변환기 (All-in-One File Conversion Hub)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          PDF, 오피스(Excel·Word·HWPX·PPTX), 이미지 6종 상호 변환, 데이터
          포맷(JSON·YAML·XML·CSV·TS·SQL)을 100% 로컬에서 신속하게 변환합니다.
        </Typography>
      </Box>

      {/* Main Tabs */}
      <Box sx={{ flexShrink: 0, mb: 2.5 }}>
        <Tabs
          value={currentTab}
          onChange={(_, v) => setCurrentTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            label="1. PDF 랩 (병합·분할·워터마크)"
            value="pdf"
            icon={<PictureAsPdfRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            label="2. 오피스 & 문서 랩 (Excel·Word·HWP·PPTX)"
            value="office"
            icon={<TableViewRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            label="3. 이미지 포맷 랩 (6종 변환·ASCII)"
            value="image"
            icon={<PhotoLibraryRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            label="4. 데이터 & 개발자 랩 (JSON·YAML·XML·SQL)"
            value="data"
            icon={<DataObjectRoundedIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Internal Scrollable Content */}
      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: 3 }}>
        {/* ================================================================ */}
        {/* TAB 1: PDF SUITE */}
        {/* ================================================================ */}
        {currentTab === 'pdf' && (
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
              <Card
                sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}
              >
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
              <Card
                sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}
              >
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
              <Card
                sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}
              >
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
                    선택된 파일: {pdfWatermarkFile.name} ({Math.round(pdfWatermarkFile.size / 1024)}{' '}
                    KB)
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
        )}

        {/* ================================================================ */}
        {/* TAB 2: OFFICE & DOCUMENT SUITE */}
        {/* ================================================================ */}
        {currentTab === 'office' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant={officeSubTool === 'excel' ? 'contained' : 'outlined'}
                startIcon={<TableViewRoundedIcon />}
                onClick={() => setOfficeSubTool('excel')}
              >
                Excel ⇄ CSV · JSON
              </Button>
              <Button
                variant={officeSubTool === 'markdown' ? 'contained' : 'outlined'}
                startIcon={<DescriptionRoundedIcon />}
                onClick={() => setOfficeSubTool('markdown')}
              >
                Markdown ➔ Word(.docx) / HTML
              </Button>
              <Button
                variant={officeSubTool === 'hwpx' ? 'contained' : 'outlined'}
                startIcon={<DescriptionRoundedIcon />}
                onClick={() => setOfficeSubTool('hwpx')}
              >
                한글 문서(HWPX) ➔ MD / CSV / TXT
              </Button>
              <Button
                variant={officeSubTool === 'pptx' ? 'contained' : 'outlined'}
                startIcon={<SlideshowRoundedIcon />}
                onClick={() => setOfficeSubTool('pptx')}
              >
                텍스트 개요 ➔ PPTX 슬라이드
              </Button>
            </Box>

            {/* Office Subtool 1: Excel */}
            {officeSubTool === 'excel' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant={excelSubMode === 'excel2csv' ? 'contained' : 'outlined'}
                    onClick={() => setExcelSubMode('excel2csv')}
                  >
                    Excel (.xlsx, .xls) ➔ CSV
                  </Button>
                  <Button
                    size="small"
                    variant={excelSubMode === 'excel2json' ? 'contained' : 'outlined'}
                    onClick={() => setExcelSubMode('excel2json')}
                  >
                    Excel (.xlsx, .xls) ➔ JSON
                  </Button>
                  <Button
                    size="small"
                    variant={excelSubMode === 'toExcel' ? 'contained' : 'outlined'}
                    onClick={() => setExcelSubMode('toExcel')}
                  >
                    CSV / JSON ➔ Excel (.xlsx) 생성
                  </Button>
                </Box>

                {(excelSubMode === 'excel2csv' || excelSubMode === 'excel2json') && (
                  <Card
                    sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2 }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      {excelSubMode === 'excel2csv'
                        ? 'Excel 파일 ➔ CSV 파일 변환'
                        : 'Excel 파일 ➔ JSON 구조화 변환'}
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
                      disabled={!excelFile || isOfficeLoading}
                      onClick={excelSubMode === 'excel2csv' ? handleExcelToCsv : handleExcelToJson}
                      startIcon={
                        isOfficeLoading ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <DownloadRoundedIcon />
                        )
                      }
                      sx={{ py: 1.3, fontWeight: 800 }}
                    >
                      {isOfficeLoading ? '변환 중...' : '변환 및 다운로드'}
                    </Button>
                  </Card>
                )}

                {excelSubMode === 'toExcel' && (
                  <Card
                    sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2 }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      CSV 문자열 또는 JSON 데이터 ➔ Excel (.xlsx) 파일 생성
                    </Typography>
                    <textarea
                      value={rawTableData}
                      onChange={(e) => setRawTableData(e.target.value)}
                      placeholder="CSV 텍스트 또는 JSON 배열을 입력하세요..."
                      style={{
                        width: '100%',
                        minHeight: 180,
                        padding: 12,
                        borderRadius: 8,
                        border: '1px solid var(--palette-divider, #e2e8f0)',
                        backgroundColor: 'transparent',
                        color: 'inherit',
                        fontFamily: 'monospace',
                        fontSize: '0.9rem',
                      }}
                    />
                    <Button
                      variant="contained"
                      color="success"
                      size="large"
                      disabled={!rawTableData.trim()}
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

            {/* Office Subtool 2: Markdown */}
            {officeSubTool === 'markdown' && (
              <Card
                sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  마크다운(Markdown) 문서 ➔ MS Word (.docx) & HTML 웹 문서 변환
                </Typography>
                <TextField
                  label="문서 제목 (Title)"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  size="small"
                />
                <textarea
                  value={markdownInput}
                  onChange={(e) => setMarkdownInput(e.target.value)}
                  placeholder="마크다운 문법을 입력하세요 (# 제목, ## 소제목, - 불릿, | 표 등)..."
                  style={{
                    width: '100%',
                    minHeight: 220,
                    padding: 12,
                    borderRadius: 8,
                    border: '1px solid var(--palette-divider, #e2e8f0)',
                    backgroundColor: 'transparent',
                    color: 'inherit',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                  }}
                />
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={!markdownInput.trim() || isOfficeLoading}
                    onClick={handleMarkdownToDocx}
                    startIcon={
                      isOfficeLoading ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <DownloadRoundedIcon />
                      )
                    }
                    sx={{ fontWeight: 800 }}
                  >
                    MS Word (.docx) 다운로드
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="large"
                    disabled={!markdownInput.trim()}
                    onClick={handleMarkdownToHtml}
                    startIcon={<DownloadRoundedIcon />}
                    sx={{ fontWeight: 800 }}
                  >
                    HTML 웹 문서 (.html) 다운로드
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => exportToMarkdownFile(markdownInput, `${docTitle}.md`)}
                  >
                    .md 파일 저장
                  </Button>
                </Box>
              </Card>
            )}

            {/* Office Subtool 3: HWPX Extractor */}
            {officeSubTool === 'hwpx' && (
              <Card
                sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  한글 문서 (.hwpx) ➔ Markdown / 표 데이터(CSV) / 본문 텍스트(TXT) 추출
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
                  한글 (.hwpx) 파일 업로드
                  <input type="file" hidden accept=".hwpx" onChange={handleHwpxUpload} />
                </Button>
                {hwpxFile && (
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    로드된 파일: {hwpxFile.name} ({Math.round(hwpxFile.size / 1024)} KB)
                  </Typography>
                )}
                {hwpxExtractedTxt && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => {
                          const blob = new Blob([hwpxExtractedMd], {
                            type: 'text/markdown;charset=utf-8',
                          });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${hwpxFile?.name.replace(/\.[^/.]+$/, '') || 'hwp'}.md`;
                          a.click();
                          URL.revokeObjectURL(a.href);
                          toast.success('Markdown(.md) 파일이 다운로드되었습니다.');
                        }}
                      >
                        Markdown(.md) 저장
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() =>
                          copyToClipboard(hwpxExtractedTxt, '본문 텍스트가 복사되었습니다.')
                        }
                      >
                        본문 텍스트 복사
                      </Button>
                      {hwpxTablesCsv.length > 0 && (
                        <Button
                          size="small"
                          color="success"
                          variant="contained"
                          onClick={() => {
                            hwpxTablesCsv.forEach((csv, idx) => {
                              const blob = new Blob(['\uFEFF' + csv], {
                                type: 'text/csv;charset=utf-8',
                              });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `table_${idx + 1}.csv`;
                              a.click();
                              URL.revokeObjectURL(url);
                            });
                            toast.success(
                              `${hwpxTablesCsv.length}개 표가 CSV로 다운로드되었습니다.`
                            );
                          }}
                        >
                          표 데이터 ({hwpxTablesCsv.length}개) CSV 다운로드
                        </Button>
                      )}
                    </Box>
                    <textarea
                      readOnly
                      value={hwpxExtractedTxt}
                      rows={8}
                      style={{
                        width: '100%',
                        padding: 10,
                        borderRadius: 6,
                        border: '1px solid var(--palette-divider, #e2e8f0)',
                        backgroundColor: 'transparent',
                        color: 'inherit',
                      }}
                    />
                  </Box>
                )}
              </Card>
            )}

            {/* Office Subtool 4: PPTX Generator */}
            {officeSubTool === 'pptx' && (
              <Card
                sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  개요 텍스트 ➔ PowerPoint 프레젠테이션 (.pptx) 슬라이드 자동 생성
                </Typography>
                <TextField
                  label="프레젠테이션 제목 (Title)"
                  value={pptxTitle}
                  onChange={(e) => setPptxTitle(e.target.value)}
                  size="small"
                />
                <textarea
                  value={pptxOutline}
                  onChange={(e) => setPptxOutline(e.target.value)}
                  placeholder="# 1. 슬라이드 제목&#10;- 불릿 항목 1&#10;- 불릿 항목 2"
                  style={{
                    width: '100%',
                    minHeight: 200,
                    padding: 12,
                    borderRadius: 8,
                    border: '1px solid var(--palette-divider, #e2e8f0)',
                    backgroundColor: 'transparent',
                    color: 'inherit',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={!pptxOutline.trim() || isOfficeLoading}
                  onClick={handleGeneratePptx}
                  startIcon={
                    isOfficeLoading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <SlideshowRoundedIcon />
                    )
                  }
                  sx={{ py: 1.3, fontWeight: 800 }}
                >
                  {isOfficeLoading
                    ? 'PPTX 생성 중...'
                    : 'PowerPoint (.pptx) 프레젠테이션 생성 및 다운로드'}
                </Button>
              </Card>
            )}
          </Box>
        )}

        {/* ================================================================ */}
        {/* TAB 3: IMAGE SUITE */}
        {/* ================================================================ */}
        {currentTab === 'image' && (
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
              <Box
                sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '7fr 5fr' }, gap: 3 }}
              >
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
                            const newItems: ImageBatchItem[] = Array.from(e.target.files).map(
                              (f) => ({
                                id: `${Date.now()}_${Math.random()}`,
                                file: f,
                                origUrl: URL.createObjectURL(f),
                                origSize: f.size,
                                status: 'pending',
                              })
                            );
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
                          <Box
                            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}
                          >
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
                                  await downloadDataUrl(
                                    item.resultUrl,
                                    `${baseName}.${targetImgFormat}`
                                  );
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
                          <Typography
                            variant="caption"
                            sx={{ fontSize: '0.65rem', opacity: 0.8 }}
                            noWrap
                          >
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
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 700, color: 'primary.main' }}
                          >
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
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}
                        >
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
                      isImgProcessing ||
                      imgBatchItems.filter((it) => it.status === 'done').length === 0
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
              <Card
                sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}
              >
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
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUploadRoundedIcon />}
                  >
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
                          onClick={() =>
                            copyToClipboard(asciiResultText, '아스키 아트를 복사했습니다.')
                          }
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
        )}

        {/* ================================================================ */}
        {/* TAB 4: DEVELOPER & DATA HUB */}
        {/* ================================================================ */}
        {currentTab === 'data' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant={dataSubTool === '4way' ? 'contained' : 'outlined'}
                startIcon={<SchemaRoundedIcon />}
                onClick={() => setDataSubTool('4way')}
              >
                JSON ⇄ YAML ⇄ XML ⇄ CSV 상호 변환
              </Button>
              <Button
                variant={dataSubTool === 'ts' ? 'contained' : 'outlined'}
                startIcon={<DataObjectRoundedIcon />}
                onClick={() => {
                  setDataSubTool('ts');
                  handleGenerateTsAndSql();
                }}
              >
                JSON ➔ TypeScript (.ts) Interface
              </Button>
              <Button
                variant={dataSubTool === 'sql' ? 'contained' : 'outlined'}
                startIcon={<TableViewRoundedIcon />}
                onClick={() => {
                  setDataSubTool('sql');
                  handleGenerateTsAndSql();
                }}
              >
                JSON ➔ SQL (DDL / DML)
              </Button>
              <Button
                variant={dataSubTool === 'base64' ? 'contained' : 'outlined'}
                startIcon={<TextFieldsRoundedIcon />}
                onClick={() => setDataSubTool('base64')}
              >
                Base64 인코딩 / 디코딩
              </Button>
            </Box>

            {/* 4-Way Converter */}
            {dataSubTool === '4way' && (
              <Card
                sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  JSON, YAML, XML, CSV 간 자유로운 4-Way 데이터 변환
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>입력 포맷 (From)</InputLabel>
                    <Select
                      value={dataFromFormat}
                      label="입력 포맷 (From)"
                      onChange={(e) => setDataFromFormat(e.target.value as DataFormat)}
                    >
                      <MenuItem value="json">JSON</MenuItem>
                      <MenuItem value="yaml">YAML</MenuItem>
                      <MenuItem value="xml">XML</MenuItem>
                      <MenuItem value="csv">CSV</MenuItem>
                    </Select>
                  </FormControl>
                  <Typography variant="body1" sx={{ fontWeight: 800 }}>
                    ➔
                  </Typography>
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>출력 포맷 (To)</InputLabel>
                    <Select
                      value={dataToFormat}
                      label="출력 포맷 (To)"
                      onChange={(e) => setDataToFormat(e.target.value as DataFormat)}
                    >
                      <MenuItem value="json">JSON</MenuItem>
                      <MenuItem value="yaml">YAML</MenuItem>
                      <MenuItem value="xml">XML</MenuItem>
                      <MenuItem value="csv">CSV</MenuItem>
                    </Select>
                  </FormControl>
                  <Button variant="contained" onClick={handleConvert4Way}>
                    포맷 변환 실행
                  </Button>
                </Box>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      입력 ({dataFromFormat.toUpperCase()})
                    </Typography>
                    <textarea
                      value={dataInputText}
                      onChange={(e) => setDataInputText(e.target.value)}
                      rows={14}
                      style={{
                        width: '100%',
                        padding: 10,
                        borderRadius: 6,
                        border: '1px solid var(--palette-divider, #e2e8f0)',
                        backgroundColor: 'transparent',
                        color: 'inherit',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        변환 결과 ({dataToFormat.toUpperCase()})
                      </Typography>
                      {dataOutputText && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            onClick={() =>
                              copyToClipboard(dataOutputText, '변환 결과가 복사되었습니다.')
                            }
                          >
                            복사
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              const mime =
                                dataToFormat === 'json'
                                  ? 'application/json'
                                  : dataToFormat === 'xml'
                                    ? 'application/xml'
                                    : 'text/plain';
                              const blob = new Blob([dataOutputText], {
                                type: `${mime};charset=utf-8`,
                              });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `converted_data.${dataToFormat}`;
                              a.click();
                              URL.revokeObjectURL(url);
                              toast.success('파일이 다운로드되었습니다.');
                            }}
                          >
                            다운로드
                          </Button>
                        </Box>
                      )}
                    </Box>
                    <textarea
                      readOnly
                      value={dataOutputText}
                      rows={14}
                      style={{
                        width: '100%',
                        padding: 10,
                        borderRadius: 6,
                        border: '1px solid var(--palette-divider, #e2e8f0)',
                        backgroundColor: 'action.hover',
                        color: 'inherit',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                      }}
                    />
                  </Box>
                </Box>
              </Card>
            )}

            {/* TypeScript Generator */}
            {dataSubTool === 'ts' && (
              <Card
                sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  JSON 데이터 ➔ TypeScript Interface / Type 선언 코드 자동 생성
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleGenerateTsAndSql}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  타입스크립트 인터페이스 재추출
                </Button>
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    생성된 TypeScript 코드 (.ts)
                  </Typography>
                  {tsResult && (
                    <Button
                      size="small"
                      onClick={() => copyToClipboard(tsResult, 'TS 코드가 복사되었습니다.')}
                    >
                      코드 복사
                    </Button>
                  )}
                </Box>
                <textarea
                  readOnly
                  value={tsResult}
                  rows={14}
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 6,
                    backgroundColor: '#090d16',
                    color: '#67e8f9',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                  }}
                />
              </Card>
            )}

            {/* SQL Generator */}
            {dataSubTool === 'sql' && (
              <Card
                sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  JSON 데이터 ➔ SQL DDL (CREATE TABLE) 및 DML (INSERT INTO) 생성
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleGenerateTsAndSql}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  SQL 쿼리 재추출
                </Button>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      1. CREATE TABLE (테이블 정의 DDL)
                    </Typography>
                    {sqlResult.createTable && (
                      <Button
                        size="small"
                        onClick={() =>
                          copyToClipboard(sqlResult.createTable, 'DDL이 복사되었습니다.')
                        }
                      >
                        복사
                      </Button>
                    )}
                  </Box>
                  <textarea
                    readOnly
                    value={sqlResult.createTable}
                    rows={6}
                    style={{
                      width: '100%',
                      padding: 10,
                      borderRadius: 6,
                      backgroundColor: '#090d16',
                      color: '#a5b4fc',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                    }}
                  />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      2. INSERT INTO (데이터 삽입 DML)
                    </Typography>
                    {sqlResult.insertQueries && (
                      <Button
                        size="small"
                        onClick={() =>
                          copyToClipboard(sqlResult.insertQueries, 'DML이 복사되었습니다.')
                        }
                      >
                        복사
                      </Button>
                    )}
                  </Box>
                  <textarea
                    readOnly
                    value={sqlResult.insertQueries}
                    rows={8}
                    style={{
                      width: '100%',
                      padding: 10,
                      borderRadius: 6,
                      backgroundColor: '#090d16',
                      color: '#86efac',
                      fontFamily: 'monospace',
                      fontSize: '0.85rem',
                    }}
                  />
                </Box>
              </Card>
            )}

            {/* Base64 Converter */}
            {dataSubTool === 'base64' && (
              <Card
                sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Base64 텍스트 / 데이터 인코딩 & 디코딩
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <ToggleButtonGroup
                    value={base64Mode}
                    exclusive
                    onChange={(_, v) => {
                      if (v) setBase64Mode(v);
                    }}
                    size="small"
                  >
                    <ToggleButton value="encode">인코딩 (Text ➔ Base64)</ToggleButton>
                    <ToggleButton value="decode">디코딩 (Base64 ➔ Text)</ToggleButton>
                  </ToggleButtonGroup>
                  <Button variant="contained" onClick={handleBase64Process}>
                    실행
                  </Button>
                </Box>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      입력 ({base64Mode === 'encode' ? '일반 텍스트' : 'Base64 문자열'})
                    </Typography>
                    <textarea
                      value={base64Input}
                      onChange={(e) => setBase64Input(e.target.value)}
                      rows={8}
                      style={{
                        width: '100%',
                        padding: 10,
                        borderRadius: 6,
                        border: '1px solid var(--palette-divider, #e2e8f0)',
                        backgroundColor: 'transparent',
                        color: 'inherit',
                        fontFamily: 'monospace',
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        출력 ({base64Mode === 'encode' ? 'Base64 결과' : '디코딩된 텍스트'})
                      </Typography>
                      {base64Output && (
                        <Button
                          size="small"
                          onClick={() => copyToClipboard(base64Output, '결과가 복사되었습니다.')}
                        >
                          복사
                        </Button>
                      )}
                    </Box>
                    <textarea
                      readOnly
                      value={base64Output}
                      rows={8}
                      style={{
                        width: '100%',
                        padding: 10,
                        borderRadius: 6,
                        border: '1px solid var(--palette-divider, #e2e8f0)',
                        backgroundColor: 'action.hover',
                        color: 'inherit',
                        fontFamily: 'monospace',
                      }}
                    />
                  </Box>
                </Box>
              </Card>
            )}
          </Box>
        )}
      </Box>
    </DashboardContent>
  );
}
