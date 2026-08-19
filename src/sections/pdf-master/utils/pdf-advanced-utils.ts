import { degrees, PDFDocument, rgb } from 'pdf-lib';

export interface PdfPageInfo {
  pageIndex: number;
  rotation: number;
  width: number;
  height: number;
  thumbnailUrl?: string;
  isDeleted?: boolean;
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

  const pages: PdfPageInfo[] = [];
  for (let i = 0; i < pageCount; i += 1) {
    const page = doc.getPage(i);
    const { width, height } = page.getSize();
    pages.push({
      pageIndex: i,
      rotation: page.getRotation().angle,
      width,
      height,
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
