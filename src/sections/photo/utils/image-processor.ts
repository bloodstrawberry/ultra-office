import { downloadBatchAsZip } from './zip-exporter';

export type SupportedFormat = 'png' | 'jpg' | 'webp' | 'avif' | 'ico' | 'bmp';

export interface ConvertOptions {
  format: SupportedFormat;
  quality?: number; // 0.1 to 1.0
  backgroundColor?: string; // For JPG / BMP (e.g. #FFFFFF)
  icoSize?: number; // 16, 32, 48, 64, 128, 256
}

export interface CompressOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  initialQuality?: number;
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
}

/**
 * Calculates byte size of base64 data URL
 */
export function calculateDataUrlByteSize(dataUrl: string): number {
  const base64Str = dataUrl.split(',')[1] || '';
  const padding = (base64Str.match(/=/g) || []).length;
  return Math.round((base64Str.length * 3) / 4 - padding);
}

/**
 * Formats bytes into human-readable string
 */
export function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Loads an HTMLImageElement from a URL/DataURL safely
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Crops and resizes logo with specific rect and target resolution
 */
export async function cropAndResizeLogo(
  imageSrc: string,
  cropArea: { x: number; y: number; width: number; height: number },
  targetWidth: number = 600,
  targetHeight: number = 600
): Promise<string> {
  const img = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2d context');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    img,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    targetWidth,
    targetHeight
  );

  return canvas.toDataURL('image/png');
}

/**
 * Crops and resizes thumbnail (sero/garo)
 */
export async function cropAndResizeThumbnail(
  imageSrc: string,
  targetWidth: number,
  cropSettings: { x: number; y: number; width: number; height: number }
): Promise<string> {
  const img = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = cropSettings.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2d context');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    img,
    cropSettings.x,
    cropSettings.y,
    cropSettings.width,
    cropSettings.height,
    0,
    0,
    targetWidth,
    cropSettings.height
  );

  return canvas.toDataURL('image/png');
}

/**
 * Toggles white pixels to transparent, or transparent pixels to white
 */
export async function toggleWhiteAndTransparent(imageSrc: string): Promise<string> {
  const img = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2d context');

  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  // Determine if image is mostly transparent or white
  let transparentCount = 0;
  let whiteCount = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a < 50) {
      transparentCount += 1;
    } else if (r > 240 && g > 240 && b > 240) {
      whiteCount += 1;
    }
  }

  const toTransparent = whiteCount >= transparentCount;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (toTransparent) {
      if (r > 240 && g > 240 && b > 240 && a > 50) {
        data[i + 3] = 0; // Transparent
      }
    } else if (a < 50) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255; // White
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/png');
}

/**
 * 캔버스 배경을 흰색 <-> 투명 전환
 */
export function toggleBackgroundWhiteTransparent(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  const width = canvas.width;
  const height = canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  let transparentPixelCount = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 200) {
      transparentPixelCount += 1;
    }
  }

  const isMostlyTransparent = transparentPixelCount > width * height * 0.05;

  if (isMostlyTransparent) {
    const newCanvas = document.createElement('canvas');
    newCanvas.width = width;
    newCanvas.height = height;
    const newCtx = newCanvas.getContext('2d');
    if (!newCtx) return false;

    newCtx.fillStyle = '#FFFFFF';
    newCtx.fillRect(0, 0, width, height);
    newCtx.drawImage(canvas, 0, 0);

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(newCanvas, 0, 0);
    return false;
  }

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r > 240 && g > 240 && b > 240) {
      data[i + 3] = 0;
    }
  }
  ctx.putImageData(imageData, 0, 0);
  return true;
}

/**
 * Flood-fill algorithm (Paint Bucket tool)
 */
export function floodFillCanvas(
  canvas: HTMLCanvasElement,
  startX: number,
  startY: number,
  fillColor: { r: number; g: number; b: number; a: number } | null,
  tolerance: number = 20
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = canvas.width;
  const height = canvas.height;
  if (startX < 0 || startX >= width || startY < 0 || startY >= height) return;

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const startIdx = (startY * width + startX) * 4;
  const startR = data[startIdx];
  const startG = data[startIdx + 1];
  const startB = data[startIdx + 2];
  const startA = data[startIdx + 3];

  const targetR = fillColor ? fillColor.r : 0;
  const targetG = fillColor ? fillColor.g : 0;
  const targetB = fillColor ? fillColor.b : 0;
  const targetA = fillColor ? fillColor.a : 0;

  if (
    Math.abs(startR - targetR) <= tolerance &&
    Math.abs(startG - targetG) <= tolerance &&
    Math.abs(startB - targetB) <= tolerance &&
    Math.abs(startA - targetA) <= tolerance
  ) {
    return;
  }

  const queue = new Int32Array(width * height * 2);
  let qHead = 0;
  let qTail = 0;

  queue[qTail] = startX;
  qTail += 1;
  queue[qTail] = startY;
  qTail += 1;

  const visited = new Uint8Array(width * height);
  visited[startY * width + startX] = 1;

  const tolSquared = tolerance * tolerance * 4;

  const colorMatch = (idx: number) => {
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];

    const dr = r - startR;
    const dg = g - startG;
    const db = b - startB;
    const da = a - startA;

    return dr * dr + dg * dg + db * db + da * da <= tolSquared;
  };

  while (qHead < qTail) {
    const x = queue[qHead];
    qHead += 1;
    const y = queue[qHead];
    qHead += 1;

    const idx = (y * width + x) * 4;

    data[idx] = targetR;
    data[idx + 1] = targetG;
    data[idx + 2] = targetB;
    data[idx + 3] = targetA;

    const neighbors = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ];

    for (let i = 0; i < 4; i += 1) {
      const nx = neighbors[i][0];
      const ny = neighbors[i][1];

      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const vIdx = ny * width + nx;
        if (!visited[vIdx]) {
          visited[vIdx] = 1;
          const nDataIdx = (ny * width + nx) * 4;
          if (colorMatch(nDataIdx)) {
            queue[qTail] = nx;
            qTail += 1;
            queue[qTail] = ny;
            qTail += 1;
          }
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Creates an ICO binary file blob from canvas
 */
export function createIcoFile(canvas: HTMLCanvasElement): Blob {
  const pngDataUrl = canvas.toDataURL('image/png');
  const base64Data = pngDataUrl.split(',')[1];
  const binaryString = atob(base64Data);
  const pngLength = binaryString.length;
  const pngBytes = new Uint8Array(pngLength);
  for (let i = 0; i < pngLength; i += 1) {
    pngBytes[i] = binaryString.charCodeAt(i);
  }

  // ICO header: 6 bytes + 1 directory entry (16 bytes) = 22 bytes header
  const icoHeaderSize = 6 + 16;
  const totalSize = icoHeaderSize + pngLength;
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  // ICONDIR
  view.setUint16(0, 0, true); // Reserved
  view.setUint16(2, 1, true); // Type: 1 = ICO
  view.setUint16(4, 1, true); // Count: 1 image

  // ICONDIRENTRY
  const w = canvas.width >= 256 ? 0 : canvas.width;
  const h = canvas.height >= 256 ? 0 : canvas.height;
  view.setUint8(6, w); // Width
  view.setUint8(7, h); // Height
  view.setUint8(8, 0); // Color count
  view.setUint8(9, 0); // Reserved
  view.setUint16(10, 1, true); // Color planes
  view.setUint16(12, 32, true); // Bits per pixel
  view.setUint32(14, pngLength, true); // Size of PNG data
  view.setUint32(18, icoHeaderSize, true); // Offset of PNG data

  const finalBytes = new Uint8Array(buffer);
  finalBytes.set(pngBytes, icoHeaderSize);

  return new Blob([buffer], { type: 'image/x-icon' });
}

/**
 * Converts image to target format
 */
export async function convertImageFormat(
  src: string,
  options: ConvertOptions
): Promise<{ dataUrl: string; width: number; height: number }> {
  const img = await loadImage(src);

  let targetW = img.width;
  let targetH = img.height;

  if (options.format === 'ico' && options.icoSize && options.icoSize > 0) {
    targetW = options.icoSize;
    targetH = options.icoSize;
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2d context');

  // Fill background for non-transparent formats
  if (
    options.format === 'jpg' ||
    options.format === 'bmp' ||
    (options.backgroundColor && options.backgroundColor !== 'transparent')
  ) {
    ctx.fillStyle = options.backgroundColor || '#FFFFFF';
    ctx.fillRect(0, 0, targetW, targetH);
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetW, targetH);

  let dataUrl = '';
  const quality = typeof options.quality === 'number' ? options.quality : 0.9;

  switch (options.format) {
    case 'png':
      dataUrl = canvas.toDataURL('image/png');
      break;
    case 'jpg':
      dataUrl = canvas.toDataURL('image/jpeg', quality);
      break;
    case 'webp':
      dataUrl = canvas.toDataURL('image/webp', quality);
      break;
    case 'avif':
      // Fallback to webp if browser doesn't support image/avif canvas export
      dataUrl = canvas.toDataURL('image/avif', quality);
      if (!dataUrl.startsWith('data:image/avif')) {
        dataUrl = canvas.toDataURL('image/webp', quality);
      }
      break;
    case 'ico': {
      const icoBlob = createIcoFile(canvas);
      dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(icoBlob);
      });
      break;
    }
    case 'bmp':
      dataUrl = canvas.toDataURL('image/bmp');
      if (!dataUrl.startsWith('data:image/bmp')) {
        dataUrl = canvas.toDataURL('image/png');
      }
      break;
    default:
      dataUrl = canvas.toDataURL('image/png');
  }

  return { dataUrl, width: targetW, height: targetH };
}

/**
 * Downloads a data URL directly to local file
 */
export async function downloadDataUrl(
  dataUrl: string,
  filename: string
): Promise<{ success: boolean; message: string }> {
  if (typeof window === 'undefined') return { success: false, message: 'Browser only' };
  try {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return { success: true, message: `${filename} 다운로드를 시작합니다.` };
  } catch (e) {
    console.error('Download error:', e);
    return { success: false, message: '다운로드 중 오류가 발생했습니다.' };
  }
}

/**
 * Sharing helper with Web Share API or download fallback
 */
export async function shareToKakaoTalk(
  dataUrl: string,
  title: string,
  filename: string
): Promise<{ success: boolean; message: string }> {
  if (typeof window === 'undefined') return { success: false, message: 'Browser only' };

  try {
    // Check Web Share API with files support
    if (navigator.share && navigator.canShare) {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], filename, { type: blob.type || 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title,
          files: [file],
        });
        return { success: true, message: '공유를 완료했습니다.' };
      }
    }
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      return { success: true, message: '공유가 취소되었습니다.' };
    }
  }

  // Fallback: Download file directly
  return downloadDataUrl(dataUrl, filename);
}

/**
 * Batch share / zip export helper
 */
export async function shareBatchToKakaoTalk(
  items: Array<{ name: string; dataUrl: string }>,
  title: string
): Promise<{ success: boolean; message: string }> {
  if (items.length === 0) return { success: false, message: '공유할 항목이 없습니다.' };

  if (items.length === 1) {
    return shareToKakaoTalk(items[0].dataUrl, title, items[0].name);
  }

  try {
    const zipItems = items.map((it, idx) => ({
      id: `item_${idx}`,
      name: it.name,
      dataUrl: it.dataUrl,
    }));
    await downloadBatchAsZip(zipItems, `${title.replace(/\s+/g, '_')}.zip`);
    return { success: true, message: `${items.length}개 파일이 압축(ZIP)되어 저장되었습니다.` };
  } catch (e) {
    console.error('Batch share error:', e);
    return { success: false, message: 'ZIP 파일 생성 중 오류가 발생했습니다.' };
  }
}

/**
 * Direct GIF Share
 */
export async function shareGifDirectly(
  dataUrl: string,
  title: string,
  filename: string
): Promise<{ handledByNativeShare: boolean; message: string }> {
  if (typeof window === 'undefined') {
    return { handledByNativeShare: false, message: 'Browser only' };
  }
  try {
    if (navigator.share && navigator.canShare) {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], filename, { type: 'image/gif' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title,
          files: [file],
        });
        return { handledByNativeShare: true, message: 'GIF 공유가 완료되었습니다.' };
      }
    }
  } catch (e) {
    if ((e as Error).name === 'AbortError') {
      return { handledByNativeShare: true, message: '공유가 취소되었습니다.' };
    }
  }
  return { handledByNativeShare: false, message: '네이티브 공유 미지원' };
}

/**
 * Direct PDF Share
 */
export async function sharePdfToKakaoTalk(
  pdfData: Blob | string,
  filename: string
): Promise<{ handledByNativeShare: boolean; message: string }> {
  if (typeof window === 'undefined') {
    return { handledByNativeShare: false, message: 'Browser only' };
  }

  try {
    let blob: Blob;
    if (typeof pdfData === 'string') {
      blob = await (await fetch(pdfData)).blob();
    } else {
      blob = pdfData;
    }

    if (navigator.share && navigator.canShare) {
      const file = new File([blob], filename, { type: 'application/pdf' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: filename,
          files: [file],
        });
        return { handledByNativeShare: true, message: 'PDF 공유가 완료되었습니다.' };
      }
    }

    // Fallback: download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    return { handledByNativeShare: false, message: `${filename} 파일이 저장되었습니다.` };
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      return { handledByNativeShare: true, message: '공유가 취소되었습니다.' };
    }
    return { handledByNativeShare: false, message: 'PDF 다운로드 실패' };
  }
}
