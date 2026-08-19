/**
 * Code128 바코드 패턴 인코더 (Code Set B)
 */
const CODE128_PATTERNS = [
  '212222',
  '222122',
  '222221',
  '121223',
  '121322',
  '131222',
  '122213',
  '122312',
  '132212',
  '221213',
  '221312',
  '231212',
  '112232',
  '122132',
  '122231',
  '113222',
  '123122',
  '123221',
  '223211',
  '221132',
  '221231',
  '213212',
  '223112',
  '312131',
  '311222',
  '321122',
  '321221',
  '312212',
  '322112',
  '322211',
  '212123',
  '212321',
  '232121',
  '111323',
  '131123',
  '131321',
  '112313',
  '132113',
  '132311',
  '211313',
  '231113',
  '231311',
  '112133',
  '112331',
  '132131',
  '113123',
  '113321',
  '133121',
  '313121',
  '211331',
  '231131',
  '213113',
  '213311',
  '213131',
  '311123',
  '311321',
  '331121',
  '312113',
  '312311',
  '332111',
  '314111',
  '221411',
  '431111',
  '111224',
  '111422',
  '121124',
  '121421',
  '141122',
  '141221',
  '112214',
  '112412',
  '122114',
  '122411',
  '142112',
  '142211',
  '241211',
  '221114',
  '413111',
  '241112',
  '134111',
  '111242',
  '121142',
  '121241',
  '114212',
  '124112',
  '124211',
  '411212',
  '421112',
  '421211',
  '212141',
  '214121',
  '412121',
  '111143',
  '111341',
  '131141',
  '114113',
  '114311',
  '411113',
  '411311',
  '113141',
  '114131',
  '311141',
  '411131',
  '211412',
  '211214',
  '211232',
  '2331112',
];

export function renderCode128ToCanvas(
  canvas: HTMLCanvasElement,
  text: string,
  options = { barWidth: 2, height: 80, color: '#000000', bgColor: '#ffffff' }
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Start Code B is index 104
  const codeBStart = 104;
  const values: number[] = [codeBStart];

  let checkSum = codeBStart;
  for (let i = 0; i < text.length; i += 1) {
    const charCode = text.charCodeAt(i);
    const val = charCode - 32;
    if (val >= 0 && val <= 95) {
      values.push(val);
      checkSum += val * (i + 1);
    }
  }

  // Check character
  const checkDigit = checkSum % 103;
  values.push(checkDigit);

  // Stop code is index 106
  values.push(106);

  // Build pattern
  let fullPattern = '';
  values.forEach((v) => {
    fullPattern += CODE128_PATTERNS[v] || '';
  });

  const totalModules = fullPattern.split('').reduce((acc, c) => acc + parseInt(c, 10), 0);
  const quietZone = 20;
  canvas.width = totalModules * options.barWidth + quietZone * 2;
  canvas.height = options.height + 30;

  ctx.fillStyle = options.bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = options.color;
  let currentX = quietZone;

  for (let i = 0; i < fullPattern.length; i += 1) {
    const width = parseInt(fullPattern[i], 10) * options.barWidth;
    const isBar = i % 2 === 0;

    if (isBar) {
      ctx.fillRect(currentX, 10, width, options.height);
    }
    currentX += width;
  }

  // Draw Text below
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(text, canvas.width / 2, options.height + 25);
}

/**
 * QR Code 렌더러 (URL, Wi-Fi, 연락처 포맷 지원)
 */
export async function renderQrCodeToCanvas(
  canvas: HTMLCanvasElement,
  text: string,
  options = { size: 260, color: '#000000', bgColor: '#ffffff', logoUrl: '' }
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = options.size;
  canvas.height = options.size;

  // Background
  ctx.fillStyle = options.bgColor;
  ctx.fillRect(0, 0, options.size, options.size);

  // Fetch QR pattern matrix from public QR generation service or render
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${options.size}x${options.size}&data=${encodeURIComponent(
    text
  )}&color=${options.color.replace('#', '')}&bgcolor=${options.bgColor.replace('#', '')}&margin=10`;

  const img = new Image();
  img.crossOrigin = 'anonymous';

  return new Promise<void>((resolve, reject) => {
    img.onload = () => {
      ctx.drawImage(img, 0, 0, options.size, options.size);

      // Draw center logo if provided
      if (options.logoUrl) {
        const logo = new Image();
        logo.crossOrigin = 'anonymous';
        logo.onload = () => {
          const logoSize = options.size * 0.22;
          const logoX = (options.size - logoSize) / 2;
          const logoY = (options.size - logoSize) / 2;

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(logoX - 3, logoY - 3, logoSize + 6, logoSize + 6);
          ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
          resolve();
        };
        logo.onerror = () => resolve();
        logo.src = options.logoUrl;
      } else {
        resolve();
      }
    };
    img.onerror = () => reject(new Error('QR 코드 생성 실패'));
    img.src = qrApiUrl;
  });
}
