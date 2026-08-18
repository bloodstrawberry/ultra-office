import JSZip from 'jszip';

export interface BatchItem {
  id: string;
  name: string;
  dataUrl: string;
}

export interface ZipFileEntry {
  filename: string;
  data: string; // base64 or DataURL
}

/**
 * Blob download helper for browser environments
 */
export function saveBlob(blob: Blob, filename: string): void {
  if (typeof window === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Compresses multiple items with Data URLs into a single downloadable ZIP archive
 */
export async function downloadBatchAsZip(
  items: BatchItem[],
  zipFilename: string = 'converted_images.zip'
): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder('images') || zip;

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    const base64Data = item.dataUrl.replace(/^data:image\/[a-zA-Z0-9+-]+;base64,/, '');
    const ext = item.name.includes('.') ? '' : '.png';
    const filename = `${item.name}${ext}`;
    folder.file(filename, base64Data, { base64: true });
  }

  const content = await zip.generateAsync({ type: 'blob' });
  saveBlob(content, zipFilename);
}

/**
 * Direct entries download to ZIP archive
 */
export async function downloadZipFile(zipFilename: string, entries: ZipFileEntry[]): Promise<void> {
  const zip = new JSZip();

  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i];
    const base64Data = entry.data.replace(/^data:image\/[a-zA-Z0-9+-]+;base64,/, '');
    zip.file(entry.filename, base64Data, { base64: true });
  }

  const content = await zip.generateAsync({ type: 'blob' });
  saveBlob(content, zipFilename);
}
