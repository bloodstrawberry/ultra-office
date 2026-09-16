import JSZip from 'jszip';
import { rgb, degrees, PDFDocument, StandardFonts } from 'pdf-lib';

export interface PdfPageInfo {
  pageIndex: number;
  rotation: number;
  originalRotation: number;
  width: number;
  height: number;
  thumbnailUrl?: string;
  isDeleted?: boolean;
}

const PDF_THUMBNAIL_WIDTH = 320;

type PdfJsModule = {
  GlobalWorkerOptions: { workerSrc: string };
};

export interface PdfMetadata {
  title: string;
  author: string;
  subject: string;
  keywords: string;
}

export interface PdfDocumentInfo extends PdfMetadata {
  pageCount: number;
  width: number;
  height: number;
  createdAt?: Date;
  modifiedAt?: Date;
}

export interface PdfImageExport {
  name: string;
  blob: Blob;
}

function configurePdfJsWorker(pdfjs: PdfJsModule) {
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  }
}

async function renderPdfPageThumbnails(pdfData: ArrayBuffer): Promise<string[]> {
  if (typeof window === 'undefined') return [];

  const pdfjs = await import('pdfjs-dist');
  configurePdfJsWorker(pdfjs);

  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(pdfData) });
  const pdf = await loadingTask.promise;
  const thumbnails: string[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: 1 });
      const scale = PDF_THUMBNAIL_WIDTH / baseViewport.width;
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        thumbnails.push('');
        continue;
      }

      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);

      await page.render({ canvasContext: context, viewport }).promise;
      thumbnails.push(canvas.toDataURL('image/webp', 0.82));
      page.cleanup();
    }
  } finally {
    await pdf.destroy();
  }

  return thumbnails;
}

/**
 * PDF 파일을 로드하고 페이지 정보 목록을 반환
 */
export async function getPdfPagesInfo(
  file: File
): Promise<{ doc: PDFDocument; pages: PdfPageInfo[] }> {
  const arrayBuffer = await file.arrayBuffer();
  const doc = await PDFDocument.load(arrayBuffer);
  const pageCount = doc.getPageCount();
  const thumbnails = await renderPdfPageThumbnails(arrayBuffer.slice(0)).catch(() => []);

  const pages: PdfPageInfo[] = [];
  for (let i = 0; i < pageCount; i += 1) {
    const page = doc.getPage(i);
    const { width, height } = page.getSize();
    const rotation = page.getRotation().angle;
    pages.push({
      pageIndex: i,
      rotation,
      originalRotation: rotation,
      width,
      height,
      thumbnailUrl: thumbnails[i] || undefined,
    });
  }

  return { doc, pages };
}

/**
 * 페이지 회전, 순서 변경, 삭제가 적용된 새 PDF Blob 생성
 */
export async function exportModifiedPdf(
  originalFile: File,
  orderedPages: { originalIndex: number; rotation: number }[]
): Promise<Blob> {
  const arrayBuffer = await originalFile.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer);
  const newDoc = await PDFDocument.create();

  for (let i = 0; i < orderedPages.length; i += 1) {
    const item = orderedPages[i];
    const [copiedPage] = await newDoc.copyPages(srcDoc, [item.originalIndex]);
    copiedPage.setRotation(degrees(item.rotation));
    newDoc.addPage(copiedPage);
  }

  const pdfBytes = await newDoc.save();
  return new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
}

/**
 * PDF에 전자 서명 또는 도장 이미지 날인
 */
export async function stampPdf(
  originalFile: File,
  stampImageBase64: string,
  options: {
    targetPageIndex: number; // 0-indexed
    xPercent: number; // 0 ~ 100
    yPercent: number; // 0 ~ 100 (from bottom)
    stampWidth: number;
    stampHeight: number;
  }
): Promise<Blob> {
  const arrayBuffer = await originalFile.arrayBuffer();
  const doc = await PDFDocument.load(arrayBuffer);

  let embeddedImage;
  if (stampImageBase64.includes('image/png') || stampImageBase64.startsWith('data:image/png')) {
    embeddedImage = await doc.embedPng(stampImageBase64);
  } else {
    embeddedImage = await doc.embedJpg(stampImageBase64);
  }

  const page = doc.getPage(options.targetPageIndex);
  const { width, height } = page.getSize();

  const x = (width * options.xPercent) / 100 - options.stampWidth / 2;
  const y = (height * options.yPercent) / 100 - options.stampHeight / 2;

  page.drawImage(embeddedImage, {
    x: Math.max(0, x),
    y: Math.max(0, y),
    width: options.stampWidth,
    height: options.stampHeight,
  });

  const pdfBytes = await doc.save();
  return new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
}

/**
 * PDF 전 페이지에 텍스트 워터마크 삽입
 */
export async function addWatermarkToPdf(
  originalFile: File,
  watermarkText: string,
  opacity: number = 0.3
): Promise<Blob> {
  const arrayBuffer = await originalFile.arrayBuffer();
  const doc = await PDFDocument.load(arrayBuffer);
  const pages = doc.getPages();

  pages.forEach((page) => {
    const { width, height } = page.getSize();
    page.drawText(watermarkText, {
      x: width / 4,
      y: height / 2,
      size: 40,
      color: rgb(0.7, 0.7, 0.7),
      opacity,
      rotate: degrees(45),
    });
  });

  const pdfBytes = await doc.save();
  return new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
}

export function parsePdfPageRange(input: string, pageCount: number): number[] {
  const indices = new Set<number>();

  input.split(',').forEach((part) => {
    const value = part.trim();
    if (!value) return;

    const rangeMatch = value.match(/^(\d+)\s*-\s*(\d+)$/);
    if (rangeMatch) {
      const start = Number(rangeMatch[1]);
      const end = Number(rangeMatch[2]);
      const from = Math.min(start, end);
      const to = Math.max(start, end);
      for (let page = from; page <= to; page += 1) {
        if (page >= 1 && page <= pageCount) indices.add(page - 1);
      }
      return;
    }

    const page = Number(value);
    if (Number.isInteger(page) && page >= 1 && page <= pageCount) indices.add(page - 1);
  });

  return Array.from(indices);
}

export async function mergePdfDocuments(files: File[]): Promise<Blob> {
  if (files.length < 2) throw new Error('두 개 이상의 PDF가 필요합니다.');

  const merged = await PDFDocument.create();
  for (const file of files) {
    const source = await PDFDocument.load(await file.arrayBuffer());
    const copiedPages = await merged.copyPages(source, source.getPageIndices());
    copiedPages.forEach((page) => merged.addPage(page));
  }

  const bytes = await merged.save({ useObjectStreams: true });
  return new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
}

export async function extractPdfPages(file: File, pageIndices: number[]): Promise<Blob> {
  if (pageIndices.length === 0) throw new Error('추출할 페이지를 지정해 주세요.');

  const source = await PDFDocument.load(await file.arrayBuffer());
  const validIndices = pageIndices.filter((index) => index >= 0 && index < source.getPageCount());
  if (validIndices.length === 0) throw new Error('유효한 페이지가 없습니다.');

  const target = await PDFDocument.create();
  const copiedPages = await target.copyPages(source, validIndices);
  copiedPages.forEach((page) => target.addPage(page));
  const bytes = await target.save({ useObjectStreams: true });
  return new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
}

export async function splitPdfPagesToZip(file: File): Promise<Blob> {
  const source = await PDFDocument.load(await file.arrayBuffer());
  const zip = new JSZip();

  for (let index = 0; index < source.getPageCount(); index += 1) {
    const pageDocument = await PDFDocument.create();
    const [page] = await pageDocument.copyPages(source, [index]);
    pageDocument.addPage(page);
    const bytes = await pageDocument.save({ useObjectStreams: true });
    zip.file(`page-${String(index + 1).padStart(3, '0')}.pdf`, bytes);
  }

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

export async function renderPdfPagesToImages(
  file: File,
  format: 'png' | 'jpeg',
  scale = 2
): Promise<PdfImageExport[]> {
  const pdfjs = await import('pdfjs-dist');
  configurePdfJsWorker(pdfjs);
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const images: PdfImageExport[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) throw new Error('이미지 렌더링 캔버스를 생성할 수 없습니다.');

      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      await page.render({ canvasContext: context, viewport }).promise;

      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (result) => (result ? resolve(result) : reject(new Error('이미지 변환에 실패했습니다.'))),
          mimeType,
          format === 'jpeg' ? 0.9 : undefined
        );
      });
      images.push({
        name: `page-${String(pageNumber).padStart(3, '0')}.${format === 'png' ? 'png' : 'jpg'}`,
        blob,
      });
      page.cleanup();
    }
  } finally {
    await pdf.destroy();
  }

  return images;
}

export async function createZipFromFiles(files: PdfImageExport[]): Promise<Blob> {
  const zip = new JSZip();
  files.forEach(({ name, blob }) => zip.file(name, blob));
  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

async function normalizeImageForPdf(
  file: File
): Promise<{ bytes: ArrayBuffer; type: 'png' | 'jpg' }> {
  if (file.type === 'image/png') return { bytes: await file.arrayBuffer(), type: 'png' };
  if (file.type === 'image/jpeg') return { bytes: await file.arrayBuffer(), type: 'jpg' };

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('이미지 변환 캔버스를 생성할 수 없습니다.');
  context.drawImage(bitmap, 0, 0);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error('이미지 변환에 실패했습니다.'))),
      'image/png'
    );
  });
  return { bytes: await blob.arrayBuffer(), type: 'png' };
}

export async function imagesToPdf(files: File[]): Promise<Blob> {
  if (files.length === 0) throw new Error('이미지를 선택해 주세요.');

  const document = await PDFDocument.create();
  for (const file of files) {
    const normalized = await normalizeImageForPdf(file);
    const image =
      normalized.type === 'png'
        ? await document.embedPng(normalized.bytes)
        : await document.embedJpg(normalized.bytes);
    const page = document.addPage([595.28, 841.89]);
    const size = image.scaleToFit(555.28, 801.89);
    page.drawImage(image, {
      x: (page.getWidth() - size.width) / 2,
      y: (page.getHeight() - size.height) / 2,
      width: size.width,
      height: size.height,
    });
  }

  const bytes = await document.save({ useObjectStreams: true });
  return new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
}

export async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import('pdfjs-dist');
  configurePdfJsWorker(pdfjs);
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const pages: string[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const text = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .filter(Boolean)
        .join(' ');
      pages.push(`[${pageNumber} 페이지]\n${text}`);
      page.cleanup();
    }
  } finally {
    await pdf.destroy();
  }

  return pages.join('\n\n');
}

export async function readPdfMetadata(file: File): Promise<PdfMetadata> {
  const document = await PDFDocument.load(await file.arrayBuffer());
  return {
    title: document.getTitle() || '',
    author: document.getAuthor() || '',
    subject: document.getSubject() || '',
    keywords: document.getKeywords() || '',
  };
}

export async function readPdfDocumentInfo(file: File): Promise<PdfDocumentInfo> {
  const document = await PDFDocument.load(await file.arrayBuffer());
  const firstPage = document.getPageCount() > 0 ? document.getPage(0) : null;
  const size = firstPage?.getSize();

  return {
    pageCount: document.getPageCount(),
    width: size?.width || 0,
    height: size?.height || 0,
    title: document.getTitle() || '',
    author: document.getAuthor() || '',
    subject: document.getSubject() || '',
    keywords: document.getKeywords() || '',
    createdAt: document.getCreationDate(),
    modifiedAt: document.getModificationDate(),
  };
}

export async function updatePdfMetadata(file: File, metadata: PdfMetadata): Promise<Blob> {
  const document = await PDFDocument.load(await file.arrayBuffer());
  document.setTitle(metadata.title);
  document.setAuthor(metadata.author);
  document.setSubject(metadata.subject);
  document.setKeywords(
    metadata.keywords
      .split(',')
      .map((keyword) => keyword.trim())
      .filter(Boolean)
  );
  document.setModificationDate(new Date());
  const bytes = await document.save({ useObjectStreams: true });
  return new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
}

export async function addPageNumbers(
  file: File,
  options: { startNumber: number; position: 'bottom-center' | 'bottom-right' | 'top-right' }
): Promise<Blob> {
  const document = await PDFDocument.load(await file.arrayBuffer());
  const font = await document.embedFont(StandardFonts.Helvetica);
  const fontSize = 10;

  document.getPages().forEach((page, index) => {
    const label = String(options.startNumber + index);
    const textWidth = font.widthOfTextAtSize(label, fontSize);
    const margin = 24;
    let x = (page.getWidth() - textWidth) / 2;
    let y = margin;
    if (options.position.endsWith('right')) x = page.getWidth() - textWidth - margin;
    if (options.position.startsWith('top')) y = page.getHeight() - fontSize - margin;
    page.drawText(label, { x, y, size: fontSize, font, color: rgb(0.25, 0.25, 0.25) });
  });

  const bytes = await document.save({ useObjectStreams: true });
  return new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
}

export async function optimizePdfStructure(file: File): Promise<Blob> {
  const document = await PDFDocument.load(await file.arrayBuffer());
  const bytes = await document.save({ useObjectStreams: true, addDefaultPage: false });
  return new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
}
