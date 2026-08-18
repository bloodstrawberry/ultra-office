import { rgb, PDFDocument, StandardFonts } from 'pdf-lib';

import { loadImage } from './image-processor';

export type PdfPageSize = 'a4' | 'letter' | 'auto';
export type PdfOrientation = 'portrait' | 'landscape' | 'auto';
export type PdfMargin = 'none' | 'small' | 'medium'; // 0pt, 14pt (~5mm), 28pt (~10mm)
export type PdfFitMode = 'contain' | 'cover';

export interface PdfImageItem {
  id: string;
  src: string;
  name: string;
  rotation?: number; // 0, 90, 180, 270 degrees
}

export interface PdfOptions {
  pageSize: PdfPageSize;
  orientation: PdfOrientation;
  margin: PdfMargin;
  fitMode: PdfFitMode;
  showPageNumbers: boolean;
}

/**
 * Convert Image DataURL/src to rotated PNG uint8 bytes for embedding into pdf-lib
 */
export async function convertImageToPngBytes(
  imageSrc: string,
  rotation: number = 0
): Promise<Uint8Array> {
  const img = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');

  const normalizedRotation = ((rotation % 360) + 360) % 360;
  const isRotated90or270 = normalizedRotation === 90 || normalizedRotation === 270;

  const originalW = img.naturalWidth || img.width;
  const originalH = img.naturalHeight || img.height;

  canvas.width = isRotated90or270 ? originalH : originalW;
  canvas.height = isRotated90or270 ? originalW : originalH;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (normalizedRotation !== 0) {
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((normalizedRotation * Math.PI) / 180);
    ctx.drawImage(img, -originalW / 2, -originalH / 2);
  } else {
    ctx.drawImage(img, 0, 0);
  }

  const pngDataUrl = canvas.toDataURL('image/png');
  const base64Str = pngDataUrl.split(',')[1];
  const binaryStr = atob(base64Str);
  const len = binaryStr.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes;
}

export interface GeneratePdfResult {
  dataUrl: string;
  blob: Blob;
}

/**
 * Generate PDF Document Data URL and Blob from an array of image items
 */
export async function generatePdfFromImages(
  items: PdfImageItem[],
  options: PdfOptions
): Promise<GeneratePdfResult> {
  if (items.length === 0) {
    throw new Error('PDF로 변환할 이미지가 없습니다.');
  }

  const pdfDoc = await PDFDocument.create();
  const font = options.showPageNumbers
    ? await pdfDoc.embedStandardFont(StandardFonts.Helvetica)
    : null;

  // Margin in points (72 points = 1 inch, 1 mm ≈ 2.83465 pt)
  let marginPt = 0;
  if (options.margin === 'small') {
    marginPt = 14.17; // ~5mm
  } else if (options.margin === 'medium') {
    marginPt = 28.35; // ~10mm
  }

  // Standard Dimensions in points (width x height in portrait)
  // A4: 595.28 x 841.89 pt
  // Letter: 612 x 792 pt
  const standardDimensions: Record<Exclude<PdfPageSize, 'auto'>, { w: number; h: number }> = {
    a4: { w: 595.28, h: 841.89 },
    letter: { w: 612, h: 792 },
  };

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    const pngBytes = await convertImageToPngBytes(item.src, item.rotation || 0);
    const embeddedImage = await pdfDoc.embedPng(pngBytes);

    const imgW = embeddedImage.width;
    const imgH = embeddedImage.height;

    // Determine target page width & height based on orientation & page size
    let pageWidth: number;
    let pageHeight: number;

    if (options.pageSize === 'auto') {
      pageWidth = imgW + marginPt * 2;
      pageHeight = imgH + marginPt * 2;
    } else {
      const std = standardDimensions[options.pageSize];
      let isLandscape = false;
      if (options.orientation === 'landscape') {
        isLandscape = true;
      } else if (options.orientation === 'auto') {
        isLandscape = imgW > imgH;
      }

      pageWidth = isLandscape ? std.h : std.w;
      pageHeight = isLandscape ? std.w : std.h;
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Available drawing area
    const availW = pageWidth - marginPt * 2;
    const availH = pageHeight - marginPt * 2;

    let drawW: number;
    let drawH: number;
    let drawX: number;
    let drawY: number;

    if (options.pageSize === 'auto') {
      drawW = imgW;
      drawH = imgH;
      drawX = marginPt;
      drawY = marginPt;
    } else {
      const scaleX = availW / imgW;
      const scaleY = availH / imgH;

      let scale = 1;
      if (options.fitMode === 'cover') {
        scale = Math.max(scaleX, scaleY);
      } else {
        scale = Math.min(scaleX, scaleY);
      }

      drawW = imgW * scale;
      drawH = imgH * scale;

      drawX = marginPt + (availW - drawW) / 2;
      drawY = marginPt + (availH - drawH) / 2;
    }

    page.drawImage(embeddedImage, {
      x: drawX,
      y: drawY,
      width: drawW,
      height: drawH,
    });

    // Draw page number footer if requested
    if (font && options.showPageNumbers) {
      const text = `${i + 1} / ${items.length}`;
      const fontSize = 10;
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      const textX = (pageWidth - textWidth) / 2;
      const textY = Math.max(4, marginPt / 2);

      page.drawText(text, {
        x: textX,
        y: textY,
        size: fontSize,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });
    }
  }

  const pdfBytes = await pdfDoc.save();
  const pdfBlob = new Blob([pdfBytes as unknown as BlobPart], {
    type: 'application/pdf',
  });

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(pdfBlob);
  });

  return { dataUrl, blob: pdfBlob };
}

/**
 * Dynamically load PDF.js from CDN for rendering PDF pages to high-resolution PNG images
 */
export async function loadPdfJs(): Promise<any> {
  if (typeof window === 'undefined') return null;

  if ((window as any).pdfjsLib) return (window as any).pdfjsLib;

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      if (pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }
      resolve(pdfjsLib);
    };
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
}

/**
 * Extract pages from an uploaded PDF file into individual PdfImageItem items (with real PNG images)
 */
export async function extractPagesFromPdfFile(file: File): Promise<PdfImageItem[]> {
  const arrayBuffer = await file.arrayBuffer();
  const baseName = file.name.includes('.')
    ? file.name.substring(0, file.name.lastIndexOf('.'))
    : file.name;

  // 1. Try rendering actual PDF pages to high-res PNG using PDF.js
  try {
    const pdfjsLib = await loadPdfJs();
    if (pdfjsLib) {
      const pdfjsBuffer = arrayBuffer.slice(0);
      const loadingTask = pdfjsLib.getDocument({ data: pdfjsBuffer });
      const pdfjsDoc = await loadingTask.promise;
      const pageCount = pdfjsDoc.numPages;

      const items: PdfImageItem[] = [];

      for (let i = 1; i <= pageCount; i += 1) {
        const page = await pdfjsDoc.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 }); // 1.5x scale for clarity

        const canvas = document.createElement('canvas');
        canvas.width = Math.round(viewport.width);
        canvas.height = Math.round(viewport.height);
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          await page.render({
            canvasContext: ctx,
            viewport,
          }).promise;

          const pngDataUrl = canvas.toDataURL('image/png');

          items.push({
            id: `pdfpage-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
            name: `${baseName} (p.${i})`,
            src: pngDataUrl,
            rotation: 0,
          });
        }
      }

      if (items.length > 0) {
        return items;
      }
    }
  } catch (err) {
    console.warn('PDF.js real page rendering fallback to pdf-lib:', err);
  }

  // 2. Fallback using pdf-lib if PDF.js fails
  const srcDoc = await PDFDocument.load(arrayBuffer);
  const pageCount = srcDoc.getPageCount();
  const items: PdfImageItem[] = [];

  for (let i = 0; i < pageCount; i += 1) {
    const page = srcDoc.getPage(i);
    const { width, height } = page.getSize();

    const newDoc = await PDFDocument.create();
    const [copiedPage] = await newDoc.copyPages(srcDoc, [i]);
    newDoc.addPage(copiedPage);

    const pdfBytes = await newDoc.save();
    let binary = '';
    const len = pdfBytes.byteLength;
    for (let j = 0; j < len; j += 1) {
      binary += String.fromCharCode(pdfBytes[j]);
    }
    const base64 = btoa(binary);
    const pdfPageDataUrl = `data:application/pdf;base64,${base64}`;

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width) || 600;
    canvas.height = Math.round(height) || 842;
    const ctx = canvas.getContext('2d');

    let imageDataUrl = pdfPageDataUrl;

    if (ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#FDA4AF';
      ctx.lineWidth = 6;
      ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);

      ctx.fillStyle = '#FFF1F2';
      ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40);

      ctx.fillStyle = '#E11D48';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PDF PAGE', canvas.width / 2, canvas.height / 2 - 15);

      ctx.fillStyle = '#475569';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(`페이지 ${i + 1} / ${pageCount}`, canvas.width / 2, canvas.height / 2 + 25);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '16px sans-serif';
      ctx.fillText(
        `${Math.round(width)} x ${Math.round(height)} pt`,
        canvas.width / 2,
        canvas.height / 2 + 55
      );

      imageDataUrl = canvas.toDataURL('image/png');
    }

    items.push({
      id: `pdfpage-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`,
      name: `${baseName} (p.${i + 1})`,
      src: imageDataUrl,
      rotation: page.getRotation().angle || 0,
    });
  }

  return items;
}
