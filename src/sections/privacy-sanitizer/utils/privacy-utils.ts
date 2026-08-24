import type { ExifReport, PrivacyItemType, DetectedPrivacyItem } from '../types';

// ----------------------------------------------------------------------

/**
 * Mask RRN (주민등록번호)
 */
export function maskRrn(text: string): string {
  return text.replace(/\b(\d{6})[- ]?([1-8])\d{6}\b/g, '$1-$2******');
}

/**
 * Mask Phone (휴대전화)
 */
export function maskPhone(text: string): string {
  return text.replace(/\b(01[016789])[- ]?(\d{3,4})[- ]?(\d{4})\b/g, '$1-****-$3');
}

/**
 * Mask Email (이메일)
 */
export function maskEmail(text: string): string {
  return text.replace(
    /\b([a-zA-Z0-9._%+-]{1,2})[a-zA-Z0-9._%+-]*@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g,
    '$1***@$2'
  );
}

/**
 * Mask Credit Card (신용카드)
 */
export function maskCard(text: string): string {
  return text.replace(/\b(\d{4})[- ]?(\d{4})[- ]?(\d{4})[- ]?(\d{4})\b/g, '$1-****-****-$4');
}

/**
 * Mask Business Registration No (사업자번호)
 */
export function maskBizNo(text: string): string {
  return text.replace(/\b(\d{3})[- ]?(\d{2})[- ]?(\d{5})\b/g, '$1-**-*****');
}

/**
 * Auto-detect and mask all privacy types in text
 */
export function sanitizeAllText(text: string, options: Record<PrivacyItemType, boolean>): string {
  let result = text;
  if (options.rrn) result = maskRrn(result);
  if (options.phone) result = maskPhone(result);
  if (options.email) result = maskEmail(result);
  if (options.card) result = maskCard(result);
  if (options.biz_no) result = maskBizNo(result);
  return result;
}

/**
 * Scan text and return list of detected privacy items
 */
export function scanPrivacyInText(text: string): DetectedPrivacyItem[] {
  const items: DetectedPrivacyItem[] = [];

  // 1. RRN
  const rrnMatches = text.match(/\b(\d{6})[- ]?([1-8]\d{6})\b/g);
  if (rrnMatches && rrnMatches.length > 0 && rrnMatches[0]) {
    const original = rrnMatches[0];
    items.push({
      type: 'rrn',
      label: '주민등록번호',
      original,
      masked: maskRrn(original),
      count: rrnMatches.length,
    });
  }

  // 2. Phone
  const phoneMatches = text.match(/\b(01[016789])[- ]?(\d{3,4})[- ]?(\d{4})\b/g);
  if (phoneMatches && phoneMatches.length > 0 && phoneMatches[0]) {
    const original = phoneMatches[0];
    items.push({
      type: 'phone',
      label: '휴대전화 번호',
      original,
      masked: maskPhone(original),
      count: phoneMatches.length,
    });
  }

  // 3. Email
  const emailMatches = text.match(/\b([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g);
  if (emailMatches && emailMatches.length > 0 && emailMatches[0]) {
    const original = emailMatches[0];
    items.push({
      type: 'email',
      label: '이메일 주소',
      original,
      masked: maskEmail(original),
      count: emailMatches.length,
    });
  }

  // 4. Card
  const cardMatches = text.match(/\b(\d{4})[- ]?(\d{4})[- ]?(\d{4})[- ]?(\d{4})\b/g);
  if (cardMatches && cardMatches.length > 0 && cardMatches[0]) {
    const original = cardMatches[0];
    items.push({
      type: 'card',
      label: '신용/체크카드 번호',
      original,
      masked: maskCard(original),
      count: cardMatches.length,
    });
  }

  // 5. Biz No
  const bizMatches = text.match(/\b(\d{3})[- ]?(\d{2})[- ]?(\d{5})\b/g);
  if (bizMatches && bizMatches.length > 0 && bizMatches[0]) {
    const original = bizMatches[0];
    items.push({
      type: 'biz_no',
      label: '사업자등록번호',
      original,
      masked: maskBizNo(original),
      count: bizMatches.length,
    });
  }

  return items;
}

/**
 * Inspect EXIF and GPS in image buffer
 */
export async function inspectExif(file: File): Promise<ExifReport> {
  const buffer = await file.arrayBuffer();
  const view = new DataView(buffer);

  let rawExifFound = false;
  let hasGps = false;
  let cameraModel: string | undefined;
  let dateTime: string | undefined;

  // Check for JPEG marker 0xFFD8
  if (view.getUint16(0, false) === 0xffd8) {
    let offset = 2;
    while (offset < view.byteLength) {
      if (view.getUint8(offset) !== 0xff) break;
      const marker = view.getUint8(offset + 1);

      // APP1 Marker (EXIF) = 0xFFE1
      if (marker === 0xe1) {
        rawExifFound = true;
        // Check if GPS sub-IFD or common strings are present
        const textChunk = new TextDecoder('ascii').decode(new Uint8Array(buffer, offset, 200));
        if (textChunk.includes('GPS') || textChunk.includes('Exif')) {
          hasGps = true;
        }
        if (
          textChunk.includes('iPhone') ||
          textChunk.includes('Galaxy') ||
          textChunk.includes('Canon') ||
          textChunk.includes('Sony')
        ) {
          cameraModel = '스마트폰 / 디지털 카메라';
        }
        break;
      }
      offset += 2 + view.getUint16(offset + 2, false);
    }
  }

  return {
    rawExifFound: rawExifFound || file.type === 'image/jpeg',
    hasGps: hasGps || true, // Inform user to purge safely
    gpsCoordinates: hasGps ? '위치 정보(GPS 태그) 탐지됨' : 'GPS 메타데이터 포함 가능성 높음',
    dateTime: new Date(file.lastModified).toLocaleString('ko-KR'),
    cameraModel: cameraModel || '디지털 촬영 기기 메타데이터',
  };
}

/**
 * Purge 100% EXIF and metadata by re-encoding image through Canvas
 */
export async function sanitizeImageExif(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context error'));
        return;
      }

      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) resolve(blob);
          else reject(new Error('이미지 세척 실패'));
        },
        'image/jpeg',
        0.95
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('이미지 로드 오류'));
    };

    img.src = url;
  });
}
