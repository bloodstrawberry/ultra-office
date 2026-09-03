import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import * as yaml from 'js-yaml';
import * as xmlJs from 'xml-js';
import { PDFDocument } from 'pdf-lib';
import TurndownService from 'turndown';

import { parseHwpxFile } from '../../hwp-master/utils/hwpx-parser';
import { generateDocxBlob } from '../../doc-master/utils/docx-generator';
import { generateSqlFromData, generateTypeScriptInterface } from './data-format-utils';
import { parseTemplateContentToSections } from '../../doc-master/utils/docx-template-engine';
import {
  loadImage,
  formatBytes,
  convertImageFormat,
  type SupportedFormat,
} from '../../photo/utils/image-processor';
import {
  audioBufferToMp3Blob,
  audioBufferToWavBlob,
  extractAudioBufferFromFile,
} from '../../video-master/utils/audio-processor';

// ----------------------------------------------------------------------
// Types & Categories
// ----------------------------------------------------------------------

export type FormatCategory = 'video' | 'audio' | 'image' | 'sheet' | 'doc' | 'data';

export interface FormatMeta {
  id: string;
  label: string;
  category: FormatCategory;
  extensions: string[];
  description: string;
  badgeColor: string;
  compatibleTargets: string[];
}

export interface ConvertResult {
  blob: Blob;
  filename: string;
  mimeType: string;
}

export interface BatchItem {
  id: string;
  file: File;
  name: string;
  size: number;
  detectedFormat: string;
  targetFormat: string;
  status: 'pending' | 'converting' | 'done' | 'error';
  progress: number;
  resultBlob?: Blob;
  resultFilename?: string;
  resultSize?: number;
  resultUrl?: string;
  errorMessage?: string;
}

// ----------------------------------------------------------------------
// Format Registry
// ----------------------------------------------------------------------

export const FORMAT_REGISTRY: Record<string, FormatMeta> = {
  // Video
  mp4: {
    id: 'mp4',
    label: 'MP4',
    category: 'video',
    extensions: ['mp4', 'm4v'],
    description: 'MPEG-4 고품질 비디오',
    badgeColor: '#EF4444',
    compatibleTargets: ['mp3', 'wav', 'gif', 'png', 'jpg'],
  },
  webm: {
    id: 'webm',
    label: 'WebM',
    category: 'video',
    extensions: ['webm'],
    description: '구글 오픈 웹 미디어 포맷',
    badgeColor: '#F97316',
    compatibleTargets: ['mp3', 'wav', 'gif', 'png', 'jpg'],
  },
  mov: {
    id: 'mov',
    label: 'MOV',
    category: 'video',
    extensions: ['mov'],
    description: '애플 퀵타임 비디오 포맷',
    badgeColor: '#EC4899',
    compatibleTargets: ['mp3', 'wav', 'gif', 'png', 'jpg'],
  },
  mkv: {
    id: 'mkv',
    label: 'MKV',
    category: 'video',
    extensions: ['mkv'],
    description: '마트로스카 멀티미디어 컨테이너',
    badgeColor: '#8B5CF6',
    compatibleTargets: ['mp3', 'wav', 'png', 'jpg'],
  },
  avi: {
    id: 'avi',
    label: 'AVI',
    category: 'video',
    extensions: ['avi'],
    description: '오디오 비디오 인터리브 표준',
    badgeColor: '#6366F1',
    compatibleTargets: ['mp3', 'wav', 'png', 'jpg'],
  },
  flv: {
    id: 'flv',
    label: 'FLV',
    category: 'video',
    extensions: ['flv'],
    description: '플래시 비디오 포맷',
    badgeColor: '#E11D48',
    compatibleTargets: ['mp3', 'wav', 'png', 'jpg'],
  },
  wmv: {
    id: 'wmv',
    label: 'WMV',
    category: 'video',
    extensions: ['wmv'],
    description: '윈도우 미디어 비디오',
    badgeColor: '#3B82F6',
    compatibleTargets: ['mp3', 'wav', 'png', 'jpg'],
  },
  ts_video: {
    id: 'ts_video',
    label: 'TS',
    category: 'video',
    extensions: ['ts'],
    description: 'MPEG 전송 스트림 비디오',
    badgeColor: '#0EA5E9',
    compatibleTargets: ['mp3', 'wav', 'png', 'jpg'],
  },

  // Audio
  mp3: {
    id: 'mp3',
    label: 'MP3',
    category: 'audio',
    extensions: ['mp3'],
    description: 'MPEG-1 오디오 레이어 3',
    badgeColor: '#F59E0B',
    compatibleTargets: ['wav'],
  },
  wav: {
    id: 'wav',
    label: 'WAV',
    category: 'audio',
    extensions: ['wav'],
    description: '비압축 16-bit PCM 오디오',
    badgeColor: '#10B981',
    compatibleTargets: ['mp3'],
  },
  ogg: {
    id: 'ogg',
    label: 'OGG',
    category: 'audio',
    extensions: ['ogg', 'oga'],
    description: 'Ogg 보비스 사운드',
    badgeColor: '#14B8A6',
    compatibleTargets: ['mp3', 'wav'],
  },
  aac: {
    id: 'aac',
    label: 'AAC',
    category: 'audio',
    extensions: ['aac'],
    description: '고급 오디오 코딩',
    badgeColor: '#06B6D4',
    compatibleTargets: ['mp3', 'wav'],
  },
  m4a: {
    id: 'm4a',
    label: 'M4A',
    category: 'audio',
    extensions: ['m4a'],
    description: 'MPEG-4 오디오 전용 컨테이너',
    badgeColor: '#3B82F6',
    compatibleTargets: ['mp3', 'wav'],
  },
  flac: {
    id: 'flac',
    label: 'FLAC',
    category: 'audio',
    extensions: ['flac'],
    description: '무손실 고음질 오디오',
    badgeColor: '#8B5CF6',
    compatibleTargets: ['mp3', 'wav'],
  },

  // Image
  png: {
    id: 'png',
    label: 'PNG',
    category: 'image',
    extensions: ['png'],
    description: '무손실 투명 채널 그래픽',
    badgeColor: '#10B981',
    compatibleTargets: ['jpg', 'webp', 'bmp', 'ico', 'pdf', 'txt', 'base64'],
  },
  jpg: {
    id: 'jpg',
    label: 'JPG',
    category: 'image',
    extensions: ['jpg', 'jpeg'],
    description: '고압축 사진 표준 포맷',
    badgeColor: '#059669',
    compatibleTargets: ['png', 'webp', 'bmp', 'ico', 'pdf', 'txt', 'base64'],
  },
  webp: {
    id: 'webp',
    label: 'WebP',
    category: 'image',
    extensions: ['webp'],
    description: '구글 차세대 고효율 웹 이미지',
    badgeColor: '#0D9488',
    compatibleTargets: ['png', 'jpg', 'bmp', 'ico', 'pdf', 'txt', 'base64'],
  },
  gif: {
    id: 'gif',
    label: 'GIF',
    category: 'image',
    extensions: ['gif'],
    description: '애니메이션 그래픽스 포맷',
    badgeColor: '#D97706',
    compatibleTargets: ['png', 'jpg', 'webp', 'mp4'],
  },
  bmp: {
    id: 'bmp',
    label: 'BMP',
    category: 'image',
    extensions: ['bmp'],
    description: '비압축 윈도우 비트맵 이미지',
    badgeColor: '#6B7280',
    compatibleTargets: ['png', 'jpg', 'webp', 'ico', 'pdf'],
  },
  svg: {
    id: 'svg',
    label: 'SVG',
    category: 'image',
    extensions: ['svg'],
    description: '확장 가능한 벡터 그래픽',
    badgeColor: '#EA580C',
    compatibleTargets: ['png', 'jpg', 'webp', 'pdf'],
  },
  ico: {
    id: 'ico',
    label: 'ICO',
    category: 'image',
    extensions: ['ico'],
    description: '윈도우 아이콘 및 웹 파비콘',
    badgeColor: '#4B5563',
    compatibleTargets: ['png', 'jpg', 'webp'],
  },
  avif: {
    id: 'avif',
    label: 'AVIF',
    category: 'image',
    extensions: ['avif'],
    description: '차세대 AV1 비디오 코덱 기반 이미지',
    badgeColor: '#7C3AED',
    compatibleTargets: ['png', 'jpg', 'webp'],
  },

  // Spreadsheet
  xlsx: {
    id: 'xlsx',
    label: 'XLSX',
    category: 'sheet',
    extensions: ['xlsx', 'xls'],
    description: '마이크로소프트 엑셀 통합 문서',
    badgeColor: '#16A34A',
    compatibleTargets: ['csv', 'tsv', 'json', 'html', 'txt'],
  },
  csv: {
    id: 'csv',
    label: 'CSV',
    category: 'sheet',
    extensions: ['csv'],
    description: '쉼표로 구분된 표 형식 텍스트',
    badgeColor: '#15803D',
    compatibleTargets: ['xlsx', 'tsv', 'json', 'yaml', 'xml', 'sql', 'html'],
  },
  tsv: {
    id: 'tsv',
    label: 'TSV',
    category: 'sheet',
    extensions: ['tsv'],
    description: '탭으로 구분된 표 형식 텍스트',
    badgeColor: '#047857',
    compatibleTargets: ['xlsx', 'csv', 'json', 'html'],
  },

  // Document
  md: {
    id: 'md',
    label: 'MD',
    category: 'doc',
    extensions: ['md', 'markdown'],
    description: '마크다운 구조화 문서',
    badgeColor: '#2563EB',
    compatibleTargets: ['html', 'docx', 'txt', 'pdf'],
  },
  html: {
    id: 'html',
    label: 'HTML',
    category: 'doc',
    extensions: ['html', 'htm'],
    description: '웹 표준 하이퍼텍스트 마크업',
    badgeColor: '#EA580C',
    compatibleTargets: ['md', 'txt', 'pdf'],
  },
  hwpx: {
    id: 'hwpx',
    label: 'HWPX',
    category: 'doc',
    extensions: ['hwpx'],
    description: '한글과컴퓨터 차세대 개방형 워드',
    badgeColor: '#0284C7',
    compatibleTargets: ['md', 'txt', 'csv'],
  },
  docx: {
    id: 'docx',
    label: 'DOCX',
    category: 'doc',
    extensions: ['docx'],
    description: '워드프로세서 문서',
    badgeColor: '#1D4ED8',
    compatibleTargets: ['txt', 'html'],
  },
  txt: {
    id: 'txt',
    label: 'TXT',
    category: 'doc',
    extensions: ['txt', 'log'],
    description: '순수 일반 텍스트 문서',
    badgeColor: '#64748B',
    compatibleTargets: ['md', 'html', 'pdf'],
  },
  pdf: {
    id: 'pdf',
    label: 'PDF',
    category: 'doc',
    extensions: ['pdf'],
    description: '어도비 표준 휴대용 문서 포맷',
    badgeColor: '#DC2626',
    compatibleTargets: ['txt', 'png'],
  },

  // Data
  json: {
    id: 'json',
    label: 'JSON',
    category: 'data',
    extensions: ['json'],
    description: '자바스크립트 객체 표기법 데이터',
    badgeColor: '#F59E0B',
    compatibleTargets: ['yaml', 'xml', 'csv', 'tsv', 'sql', 'ts'],
  },
  yaml: {
    id: 'yaml',
    label: 'YAML',
    category: 'data',
    extensions: ['yaml', 'yml'],
    description: '사람이 읽기 쉬운 데이터 직렬화',
    badgeColor: '#EC4899',
    compatibleTargets: ['json', 'xml', 'csv', 'sql'],
  },
  xml: {
    id: 'xml',
    label: 'XML',
    category: 'data',
    extensions: ['xml'],
    description: '확장성 있는 계층 마크업 언어',
    badgeColor: '#D97706',
    compatibleTargets: ['json', 'yaml', 'csv'],
  },
  sql: {
    id: 'sql',
    label: 'SQL',
    category: 'data',
    extensions: ['sql'],
    description: '관계형 데이터베이스 쿼리 스크립트',
    badgeColor: '#0284C7',
    compatibleTargets: ['json', 'csv'],
  },
  ts: {
    id: 'ts',
    label: 'TS',
    category: 'data',
    extensions: ['ts'],
    description: '타입스크립트 인터페이스 정의',
    badgeColor: '#3178C6',
    compatibleTargets: ['json'],
  },
};

// Target-only metadata (formats that can be generated but not registered as distinct source keys)
export const TARGET_META_MAP: Record<string, { label: string; ext: string; mime: string }> = {
  mp3: { label: 'MP3', ext: 'mp3', mime: 'audio/mp3' },
  wav: { label: 'WAV', ext: 'wav', mime: 'audio/wav' },
  gif: { label: 'GIF', ext: 'gif', mime: 'image/gif' },
  png: { label: 'PNG', ext: 'png', mime: 'image/png' },
  jpg: { label: 'JPG', ext: 'jpg', mime: 'image/jpeg' },
  webp: { label: 'WebP', ext: 'webp', mime: 'image/webp' },
  bmp: { label: 'BMP', ext: 'bmp', mime: 'image/bmp' },
  ico: { label: 'ICO', ext: 'ico', mime: 'image/x-icon' },
  pdf: { label: 'PDF', ext: 'pdf', mime: 'application/pdf' },
  txt: { label: 'TXT', ext: 'txt', mime: 'text/plain' },
  base64: { label: 'Base64 (TXT)', ext: 'txt', mime: 'text/plain' },
  csv: { label: 'CSV', ext: 'csv', mime: 'text/csv' },
  tsv: { label: 'TSV', ext: 'tsv', mime: 'text/tab-separated-values' },
  xlsx: {
    label: 'XLSX',
    ext: 'xlsx',
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
  json: { label: 'JSON', ext: 'json', mime: 'application/json' },
  yaml: { label: 'YAML', ext: 'yaml', mime: 'text/yaml' },
  xml: { label: 'XML', ext: 'xml', mime: 'application/xml' },
  sql: { label: 'SQL', ext: 'sql', mime: 'text/sql' },
  ts: { label: 'TypeScript', ext: 'ts', mime: 'text/typescript' },
  html: { label: 'HTML', ext: 'html', mime: 'text/html' },
  docx: {
    label: 'DOCX',
    ext: 'docx',
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  md: { label: 'Markdown', ext: 'md', mime: 'text/markdown' },
};

// ----------------------------------------------------------------------
// Detection & Helper Functions
// ----------------------------------------------------------------------

export function detectFileFormat(file: File): string {
  const parts = file.name.split('.');
  const ext = (parts.length > 1 ? parts.pop() || '' : '').toLowerCase();

  for (const [key, meta] of Object.entries(FORMAT_REGISTRY)) {
    if (meta.extensions.includes(ext)) {
      return key;
    }
  }

  // Fallback by MIME type
  if (file.type.startsWith('video/')) return 'mp4';
  if (file.type.startsWith('audio/')) return 'mp3';
  if (file.type.startsWith('image/')) {
    if (file.type.includes('png')) return 'png';
    if (file.type.includes('jpeg') || file.type.includes('jpg')) return 'jpg';
    if (file.type.includes('webp')) return 'webp';
    if (file.type.includes('gif')) return 'gif';
    return 'png';
  }
  if (file.type === 'application/pdf') return 'pdf';
  if (file.type.includes('spreadsheet') || file.type.includes('excel')) return 'xlsx';
  if (file.type === 'text/csv') return 'csv';
  if (file.type === 'application/json') return 'json';

  return ext || 'txt';
}

export function getCompatibleTargets(formatKey: string): string[] {
  const meta = FORMAT_REGISTRY[formatKey];
  if (meta && meta.compatibleTargets.length > 0) {
    return meta.compatibleTargets;
  }
  // Generic fallback targets
  return ['txt', 'pdf', 'json'];
}

function replaceExt(filename: string, newExt: string): string {
  const idx = filename.lastIndexOf('.');
  const base = idx !== -1 ? filename.slice(0, idx) : filename;
  return `${base}.${newExt}`;
}

export { formatBytes };

// ----------------------------------------------------------------------
// Universal Conversion Pipeline (100% Client-Side)
// ----------------------------------------------------------------------

export async function convertSingleFile(
  file: File,
  targetFormat: string,
  onProgress?: (pct: number) => void
): Promise<ConvertResult> {
  const detected = detectFileFormat(file);
  const target = targetFormat.toLowerCase();

  onProgress?.(10);

  // 1. Audio / Video to Audio (MP3 or WAV)
  if (target === 'mp3' || target === 'wav') {
    onProgress?.(20);
    const audioBuffer = await extractAudioBufferFromFile(file);
    onProgress?.(50);

    if (target === 'mp3') {
      const blob = await audioBufferToMp3Blob(audioBuffer, {
        kbps: 192,
        onProgress: (p) => onProgress?.(50 + Math.round(p * 0.45)),
      });
      return {
        blob,
        filename: replaceExt(file.name, 'mp3'),
        mimeType: 'audio/mp3',
      };
    }

    const blob = audioBufferToWavBlob(audioBuffer);
    onProgress?.(100);
    return {
      blob,
      filename: replaceExt(file.name, 'wav'),
      mimeType: 'audio/wav',
    };
  }

  // 2. Video to Image / Frame Snapshot (PNG, JPG)
  if (
    (FORMAT_REGISTRY[detected]?.category === 'video' || file.type.startsWith('video/')) &&
    (target === 'png' || target === 'jpg')
  ) {
    onProgress?.(30);
    const blob = await captureVideoFrame(file, target === 'png' ? 'image/png' : 'image/jpeg');
    onProgress?.(100);
    return {
      blob,
      filename: replaceExt(file.name, target),
      mimeType: target === 'png' ? 'image/png' : 'image/jpeg',
    };
  }

  // 3. Image conversions
  const isInputImage =
    FORMAT_REGISTRY[detected]?.category === 'image' || file.type.startsWith('image/');
  if (isInputImage) {
    onProgress?.(30);

    // Image to PDF
    if (target === 'pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.create();

      let pdfImage;
      if (file.type.includes('png') || detected === 'png') {
        pdfImage = await pdfDoc.embedPng(arrayBuffer);
      } else {
        // Convert to JPG canvas then embed
        const dataUrl = await readFileAsDataUrl(file);
        const { dataUrl: jpgDataUrl } = await convertImageFormat(dataUrl, {
          format: 'jpg',
          quality: 0.95,
        });
        const jpgBytes = await (await fetch(jpgDataUrl)).arrayBuffer();
        pdfImage = await pdfDoc.embedJpg(jpgBytes);
      }

      const imgDims = pdfImage.scale(1.0);
      const page = pdfDoc.addPage([imgDims.width, imgDims.height]);
      page.drawImage(pdfImage, {
        x: 0,
        y: 0,
        width: imgDims.width,
        height: imgDims.height,
      });

      const pdfBytes = await pdfDoc.save();
      onProgress?.(100);
      return {
        blob: new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' }),
        filename: replaceExt(file.name, 'pdf'),
        mimeType: 'application/pdf',
      };
    }

    // Image to ASCII Art (.txt)
    if (target === 'txt') {
      const dataUrl = await readFileAsDataUrl(file);
      const asciiText = await generateAsciiFromImage(dataUrl, 90);
      onProgress?.(100);
      return {
        blob: new Blob([asciiText], { type: 'text/plain;charset=utf-8;' }),
        filename: replaceExt(file.name, 'txt'),
        mimeType: 'text/plain',
      };
    }

    // Image to Base64 (.txt)
    if (target === 'base64') {
      const dataUrl = await readFileAsDataUrl(file);
      onProgress?.(100);
      return {
        blob: new Blob([dataUrl], { type: 'text/plain;charset=utf-8;' }),
        filename: `${replaceExt(file.name, 'txt')}`,
        mimeType: 'text/plain',
      };
    }

    // Standard Image to Image format (PNG, JPG, WebP, BMP, ICO)
    const validFormats: SupportedFormat[] = ['png', 'jpg', 'webp', 'bmp', 'ico', 'avif'];
    const targetImgFormat: SupportedFormat = validFormats.includes(target as SupportedFormat)
      ? (target as SupportedFormat)
      : 'png';

    const dataUrl = await readFileAsDataUrl(file);
    onProgress?.(60);

    const converted = await convertImageFormat(dataUrl, {
      format: targetImgFormat,
      quality: 0.92,
      icoSize: 64,
    });

    const response = await fetch(converted.dataUrl);
    const blob = await response.blob();
    onProgress?.(100);

    return {
      blob,
      filename: replaceExt(file.name, targetImgFormat),
      mimeType: blob.type,
    };
  }

  // 4. Spreadsheet conversions (XLSX, XLS, CSV, TSV)
  const isInputSheet =
    FORMAT_REGISTRY[detected]?.category === 'sheet' ||
    detected === 'xlsx' ||
    detected === 'xls' ||
    detected === 'csv' ||
    detected === 'tsv';

  if (isInputSheet) {
    onProgress?.(30);

    if (detected === 'xlsx' || detected === 'xls') {
      const arrayBuffer = await file.arrayBuffer();
      const wb = XLSX.read(arrayBuffer, { type: 'array' });
      const firstSheetName = wb.SheetNames[0];
      const sheet = wb.Sheets[firstSheetName];

      onProgress?.(60);

      if (target === 'csv') {
        const csv = XLSX.utils.sheet_to_csv(sheet);
        const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csv], {
          type: 'text/csv;charset=utf-8;',
        });
        onProgress?.(100);
        return { blob, filename: replaceExt(file.name, 'csv'), mimeType: 'text/csv' };
      }

      if (target === 'tsv') {
        const tsv = XLSX.utils.sheet_to_csv(sheet, { FS: '\t' });
        const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), tsv], {
          type: 'text/tab-separated-values;charset=utf-8;',
        });
        onProgress?.(100);
        return {
          blob,
          filename: replaceExt(file.name, 'tsv'),
          mimeType: 'text/tab-separated-values',
        };
      }

      if (target === 'json') {
        const json = XLSX.utils.sheet_to_json(sheet);
        const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
        onProgress?.(100);
        return { blob, filename: replaceExt(file.name, 'json'), mimeType: 'application/json' };
      }

      if (target === 'html') {
        const html = XLSX.utils.sheet_to_html(sheet);
        const fullHtml = wrapHtmlDocument(html, file.name);
        const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8;' });
        onProgress?.(100);
        return { blob, filename: replaceExt(file.name, 'html'), mimeType: 'text/html' };
      }

      if (target === 'txt') {
        const txt = XLSX.utils.sheet_to_csv(sheet);
        const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
        onProgress?.(100);
        return { blob, filename: replaceExt(file.name, 'txt'), mimeType: 'text/plain' };
      }
    }

    if (detected === 'csv' || detected === 'tsv') {
      const text = await file.text();
      onProgress?.(50);

      if (target === 'xlsx') {
        const wb = XLSX.read(text, { type: 'string' });
        const xlsxData = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([xlsxData], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        onProgress?.(100);
        return {
          blob,
          filename: replaceExt(file.name, 'xlsx'),
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        };
      }

      const parsed = Papa.parse(text, { header: true, dynamicTyping: true });
      const data = parsed.data;

      if (target === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        onProgress?.(100);
        return { blob, filename: replaceExt(file.name, 'json'), mimeType: 'application/json' };
      }

      if (target === 'yaml') {
        const yml = yaml.dump(data, { indent: 2 });
        const blob = new Blob([yml], { type: 'text/yaml;charset=utf-8;' });
        onProgress?.(100);
        return { blob, filename: replaceExt(file.name, 'yaml'), mimeType: 'text/yaml' };
      }

      if (target === 'xml') {
        const xml = xmlJs.js2xml({ root: { row: data } }, { compact: true, spaces: 2 });
        const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
        onProgress?.(100);
        return { blob, filename: replaceExt(file.name, 'xml'), mimeType: 'application/xml' };
      }

      if (target === 'sql') {
        const { createTable, insertQueries } = generateSqlFromData(
          JSON.stringify(data),
          file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_]/g, '_')
        );
        const sql = `-- Generated by Ultra Office\n${createTable}\n\n${insertQueries}\n`;
        const blob = new Blob([sql], { type: 'text/sql;charset=utf-8;' });
        onProgress?.(100);
        return { blob, filename: replaceExt(file.name, 'sql'), mimeType: 'text/sql' };
      }
    }
  }

  // 5. Document conversions (MD, HTML, HWPX, DOCX, TXT)
  const isInputDoc =
    FORMAT_REGISTRY[detected]?.category === 'doc' ||
    detected === 'md' ||
    detected === 'html' ||
    detected === 'hwpx' ||
    detected === 'docx' ||
    detected === 'txt';

  if (isInputDoc) {
    onProgress?.(30);

    // Markdown conversions
    if (detected === 'md') {
      const mdText = await file.text();
      onProgress?.(60);

      if (target === 'html') {
        const bodyHtml = markdownToHtmlBasic(mdText);
        const fullHtml = wrapHtmlDocument(bodyHtml, file.name);
        const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8;' });
        onProgress?.(100);
        return { blob, filename: replaceExt(file.name, 'html'), mimeType: 'text/html' };
      }

      if (target === 'docx') {
        const sections = parseTemplateContentToSections(mdText);
        const blob = await generateDocxBlob(
          {
            title: file.name.replace(/\.[^/.]+$/, ''),
            subtitle: 'Ultra Office Export',
            author: 'Ultra Office User',
            company: 'Ultra Office',
            date: new Date().toLocaleDateString('ko-KR'),
            version: '1.0',
            headerText: file.name,
            footerText: 'Converted with Ultra Office Universal Converter',
            themeColor: '#1E40AF',
            accentColor: '#3B82F6',
          },
          sections
        );
        onProgress?.(100);
        return {
          blob,
          filename: replaceExt(file.name, 'docx'),
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        };
      }

      if (target === 'txt') {
        const plain = mdText.replace(/#+\s+/g, '').replace(/[*_~`]/g, '');
        const blob = new Blob([plain], { type: 'text/plain;charset=utf-8;' });
        onProgress?.(100);
        return { blob, filename: replaceExt(file.name, 'txt'), mimeType: 'text/plain' };
      }

      if (target === 'pdf') {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595.28, 841.89]); // A4
        const lines = mdText.split('\n').slice(0, 45);
        let y = 800;
        lines.forEach((line) => {
          if (y > 40) {
            page.drawText(line.slice(0, 80), { x: 50, y, size: 10 });
            y -= 16;
          }
        });
        const pdfBytes = await pdfDoc.save();
        onProgress?.(100);
        return {
          blob: new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' }),
          filename: replaceExt(file.name, 'pdf'),
          mimeType: 'application/pdf',
        };
      }
    }

    // HTML conversions
    if (detected === 'html') {
      const htmlText = await file.text();
      onProgress?.(60);

      if (target === 'md') {
        const turndownService = new TurndownService({
          headingStyle: 'atx',
          codeBlockStyle: 'fenced',
        });
        const md = turndownService.turndown(htmlText);
        const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
        onProgress?.(100);
        return { blob, filename: replaceExt(file.name, 'md'), mimeType: 'text/markdown' };
      }

      if (target === 'txt') {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');
        const txt = doc.body.textContent || '';
        const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
        onProgress?.(100);
        return { blob, filename: replaceExt(file.name, 'txt'), mimeType: 'text/plain' };
      }
    }

    // HWPX conversions
    if (detected === 'hwpx') {
      onProgress?.(40);
      const parsedHwpx = await parseHwpxFile(file);
      onProgress?.(70);

      const hwpxText = parsedHwpx.fullText || '';
      let hwpxMd = `# ${parsedHwpx.title || file.name}\n\n`;
      parsedHwpx.sections?.forEach((sec) => {
        sec.paragraphs?.forEach((p) => {
          if (p.headingLevel === 1) hwpxMd += `# ${p.text}\n\n`;
          else if (p.headingLevel === 2) hwpxMd += `## ${p.text}\n\n`;
          else if (p.isBold) hwpxMd += `**${p.text}**\n\n`;
          else hwpxMd += `${p.text}\n\n`;
        });
      });
      if (!parsedHwpx.sections || parsedHwpx.sections.length === 0) {
        hwpxMd += hwpxText;
      }

      if (target === 'md') {
        const blob = new Blob([hwpxMd], { type: 'text/markdown;charset=utf-8;' });
        onProgress?.(100);
        return { blob, filename: replaceExt(file.name, 'md'), mimeType: 'text/markdown' };
      }

      if (target === 'txt') {
        const blob = new Blob([hwpxText], { type: 'text/plain;charset=utf-8;' });
        onProgress?.(100);
        return { blob, filename: replaceExt(file.name, 'txt'), mimeType: 'text/plain' };
      }

      if (target === 'csv') {
        const tableLines: string[] = [];
        parsedHwpx.sections?.forEach((sec) => {
          sec.tables?.forEach((tbl) => {
            tbl.rows?.forEach((row) => {
              const rowCsv = row.map((c) => `"${(c.text || '').replace(/"/g, '""')}"`).join(',');
              tableLines.push(rowCsv);
            });
            tableLines.push('');
          });
        });
        const csvContent = tableLines.length > 0 ? tableLines.join('\n') : hwpxText;
        const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
          type: 'text/csv;charset=utf-8;',
        });
        onProgress?.(100);
        return { blob, filename: replaceExt(file.name, 'csv'), mimeType: 'text/csv' };
      }
    }
  }

  // 6. Data & Code conversions (JSON, YAML, XML, SQL)
  const isInputData =
    FORMAT_REGISTRY[detected]?.category === 'data' ||
    detected === 'json' ||
    detected === 'yaml' ||
    detected === 'xml' ||
    detected === 'sql';

  if (isInputData) {
    const rawText = await file.text();
    onProgress?.(40);

    let jsObject: unknown = null;
    try {
      if (detected === 'json') jsObject = JSON.parse(rawText);
      else if (detected === 'yaml') jsObject = yaml.load(rawText);
      else if (detected === 'xml') jsObject = xmlJs.xml2js(rawText, { compact: true });
    } catch {
      // Fallback
    }

    onProgress?.(70);

    if (target === 'json' && jsObject !== null) {
      const json = JSON.stringify(jsObject, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      onProgress?.(100);
      return { blob, filename: replaceExt(file.name, 'json'), mimeType: 'application/json' };
    }

    if (target === 'yaml' && jsObject !== null) {
      const yml = yaml.dump(jsObject, { indent: 2 });
      const blob = new Blob([yml], { type: 'text/yaml;charset=utf-8;' });
      onProgress?.(100);
      return { blob, filename: replaceExt(file.name, 'yaml'), mimeType: 'text/yaml' };
    }

    if (target === 'xml' && jsObject !== null) {
      const xml = xmlJs.js2xml(
        typeof jsObject === 'object' ? jsObject : { root: { item: jsObject } },
        { compact: true, spaces: 2 }
      );
      const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
      onProgress?.(100);
      return { blob, filename: replaceExt(file.name, 'xml'), mimeType: 'application/xml' };
    }

    if (target === 'csv' && jsObject !== null) {
      const csv = Papa.unparse(Array.isArray(jsObject) ? jsObject : [jsObject]);
      const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csv], {
        type: 'text/csv;charset=utf-8;',
      });
      onProgress?.(100);
      return { blob, filename: replaceExt(file.name, 'csv'), mimeType: 'text/csv' };
    }

    if (target === 'ts' && detected === 'json') {
      const tsInterface = generateTypeScriptInterface(rawText);
      const blob = new Blob([tsInterface], { type: 'text/typescript;charset=utf-8;' });
      onProgress?.(100);
      return { blob, filename: replaceExt(file.name, 'ts'), mimeType: 'text/typescript' };
    }

    if (target === 'sql' && detected === 'json') {
      const { createTable, insertQueries } = generateSqlFromData(rawText);
      const blob = new Blob([`${createTable}\n\n${insertQueries}\n`], {
        type: 'text/sql;charset=utf-8;',
      });
      onProgress?.(100);
      return { blob, filename: replaceExt(file.name, 'sql'), mimeType: 'text/sql' };
    }
  }

  // Fallback: Read file as text and output target
  const textContent = await file.text();
  onProgress?.(100);
  return {
    blob: new Blob([textContent], { type: 'text/plain;charset=utf-8;' }),
    filename: replaceExt(file.name, target),
    mimeType: 'text/plain',
  };
}

// ----------------------------------------------------------------------
// Internal Helper Utilities
// ----------------------------------------------------------------------

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function captureVideoFrame(file: File, mimeType: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    video.src = url;
    video.muted = true;
    video.playsInline = true;

    video.onloadeddata = () => {
      video.currentTime = Math.min(1.0, video.duration / 2 || 0.1);
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context not available');

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (blob) resolve(blob);
            else reject(new Error('Failed to create image blob from video'));
          },
          mimeType,
          0.92
        );
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Video loading failed'));
    };
  });
}

async function generateAsciiFromImage(src: string, cols: number = 80): Promise<string> {
  const img = await loadImage(src);
  const ratio = img.height / img.width;
  const rows = Math.floor(cols * ratio * 0.5);

  const canvas = document.createElement('canvas');
  canvas.width = cols;
  canvas.height = rows;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.drawImage(img, 0, 0, cols, rows);
  const imgData = ctx.getImageData(0, 0, cols, rows);
  const chars = '@%#*+=-:. ';
  let result = '';

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const idx = (y * cols + x) * 4;
      const r = imgData.data[idx];
      const g = imgData.data[idx + 1];
      const b = imgData.data[idx + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const charIdx = Math.floor((lum / 255) * (chars.length - 1));
      result += chars[charIdx];
    }
    result += '\n';
  }

  return result;
}

function markdownToHtmlBasic(md: string): string {
  return md
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    .replace(/\n$/gim, '<br />');
}

function wrapHtmlDocument(bodyContent: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 900px; margin: 40px auto; padding: 0 20px; color: #1e293b; }
    table { border-collapse: collapse; width: 100%; margin: 24px 0; }
    th, td { border: 1px solid #cbd5e1; padding: 10px 14px; text-align: left; }
    th { background: #f8fafc; font-weight: 600; }
    tr:nth-child(even) { background: #f8fafc; }
    code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
  </style>
</head>
<body>
  ${bodyContent}
</body>
</html>`;
}

// ----------------------------------------------------------------------
// Batch Packaging & Download Utilities
// ----------------------------------------------------------------------

export async function packageBatchToZip(
  items: { name: string; blob: Blob }[],
  onProgress?: (pct: number) => void
): Promise<Blob> {
  const zip = new JSZip();

  items.forEach((item) => {
    zip.file(item.name, item.blob);
  });

  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      if (onProgress) {
        onProgress(Math.round(metadata.percent));
      }
    }
  );

  return zipBlob;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
