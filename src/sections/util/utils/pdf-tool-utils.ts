import { PDFDocument } from 'pdf-lib';

/**
 * Merge multiple PDF files into a single PDF
 */
export async function mergePdfFiles(files: File[]): Promise<Blob> {
  if (files.length === 0) {
    throw new Error('병합할 PDF 파일이 없습니다.');
  }

  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    const arrayBuffer = await file.arrayBuffer();
    const doc = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedBytes = await mergedPdf.save();
  return new Blob([mergedBytes as unknown as BlobPart], { type: 'application/pdf' });
}

/**
 * Split/Extract specified pages from a PDF file into a new PDF
 */
export async function splitPdfFile(file: File, pageIndices: number[]): Promise<Blob> {
  if (pageIndices.length === 0) {
    throw new Error('추출할 페이지를 선택해 주세요.');
  }

  const arrayBuffer = await file.arrayBuffer();
  const sourceDoc = await PDFDocument.load(arrayBuffer);
  const targetDoc = await PDFDocument.create();

  const validIndices = pageIndices.filter((idx) => idx >= 0 && idx < sourceDoc.getPageCount());
  if (validIndices.length === 0) {
    throw new Error('유효한 페이지 번호가 없습니다.');
  }

  const copiedPages = await targetDoc.copyPages(sourceDoc, validIndices);
  copiedPages.forEach((page) => targetDoc.addPage(page));

  const resultBytes = await targetDoc.save();
  return new Blob([resultBytes as unknown as BlobPart], { type: 'application/pdf' });
}
