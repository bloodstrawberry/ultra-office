import type { StampConfig } from '../types';

// ----------------------------------------------------------------------

/**
 * Get font family by font type
 */
function getFontFamily(font: StampConfig['font']): string {
  switch (font) {
    case 'classic_seal':
      return "'Nanum Myeongjo', 'Gungsuh', 'Batang', serif";
    case 'serif':
      return "'Noto Serif KR', 'Nanum Myeongjo', serif";
    case 'cursive':
      return "'Gungsuh', 'Nanum Brush Script', cursive";
    case 'gothic':
    default:
      return "'Pretendard', 'Noto Sans KR', sans-serif";
  }
}

/**
 * Render Stamp to Canvas and return DataURL
 */
export function renderStampCanvas(canvas: HTMLCanvasElement, config: StampConfig): string {
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const width = canvas.width;
  const height = canvas.height;
  const center = width / 2;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  ctx.save();
  ctx.strokeStyle = config.color;
  ctx.fillStyle = config.color;
  ctx.lineWidth = config.borderThickness * (width / 200);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const fontFamily = getFontFamily(config.font);

  if (config.type === 'circle_personal') {
    // 1. 개인 원형 인감
    const radius = center - ctx.lineWidth;
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Text formatting (2x2 or 3-char vertical)
    let chars = config.mainText.trim();
    if (chars.length === 2) chars += '인';
    if (chars.length === 3) chars += '인'; // 4글자로 맞춤

    ctx.font = `bold ${width * 0.32}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (chars.length === 4) {
      // 2x2 grid (전통 도장 배열: 우상->우하->좌상->좌하 또는 좌상->우상->좌하->우하)
      ctx.fillText(chars[0], center - width * 0.2, center - height * 0.2);
      ctx.fillText(chars[1], center + width * 0.2, center - height * 0.2);
      ctx.fillText(chars[2], center - width * 0.2, center + height * 0.22);
      ctx.fillText(chars[3], center + width * 0.2, center + height * 0.22);
    } else {
      ctx.font = `bold ${width * 0.26}px ${fontFamily}`;
      ctx.fillText(chars, center, center);
    }
  } else if (config.type === 'oval_personal') {
    // 2. 개인 타원형 막도장
    const rx = width * 0.36;
    const ry = height * 0.46;
    ctx.beginPath();
    ctx.ellipse(center, center, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();

    const chars = config.mainText.trim();
    ctx.font = `bold ${width * (chars.length <= 2 ? 0.36 : 0.28)}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (chars.length === 2) {
      ctx.fillText(chars[0], center, center - height * 0.2);
      ctx.fillText(chars[1], center, center + height * 0.22);
    } else if (chars.length === 3) {
      ctx.fillText(chars[0], center, center - height * 0.28);
      ctx.fillText(chars[1], center, center);
      ctx.fillText(chars[2], center, center + height * 0.28);
    } else {
      ctx.font = `bold ${width * 0.24}px ${fontFamily}`;
      ctx.fillText(chars, center, center);
    }
  } else if (config.type === 'square_seal') {
    // 3. 사각 직인
    const pad = ctx.lineWidth * 1.5;
    const size = width - pad * 2;
    ctx.beginPath();
    ctx.rect(pad, pad, size, size);
    ctx.stroke();

    let chars = config.mainText.trim();
    if (chars.length === 2) chars += '의인';
    if (chars.length === 3) chars += '인';

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (chars.length === 4) {
      ctx.font = `bold ${width * 0.34}px ${fontFamily}`;
      ctx.fillText(chars[0], center - width * 0.22, center - height * 0.22);
      ctx.fillText(chars[1], center + width * 0.22, center - height * 0.22);
      ctx.fillText(chars[2], center - width * 0.22, center + height * 0.22);
      ctx.fillText(chars[3], center + width * 0.22, center + height * 0.22);
    } else {
      ctx.font = `bold ${width * 0.26}px ${fontFamily}`;
      ctx.fillText(chars, center, center);
    }
  } else if (config.type === 'circle_corporate') {
    // 4. 법인 / 회사 원형 직인 (2중 원 + 원호 텍스트)
    const outerRadius = center - ctx.lineWidth;
    const innerRadius = center * 0.58;

    // Outer Circle
    ctx.beginPath();
    ctx.arc(center, center, outerRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Inner Circle (thin)
    ctx.lineWidth = ctx.lineWidth * 0.6;
    ctx.beginPath();
    ctx.arc(center, center, innerRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Center Text (e.g. 대표이사의인 / 직인)
    const subText = config.subText.trim() || '대표이사의인';
    ctx.font = `bold ${width * 0.15}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (subText.length === 6) {
      ctx.fillText(subText.slice(0, 3), center, center - height * 0.09);
      ctx.fillText(subText.slice(3), center, center + height * 0.09);
    } else if (subText.length === 4) {
      ctx.fillText(subText.slice(0, 2), center, center - height * 0.09);
      ctx.fillText(subText.slice(2), center, center + height * 0.09);
    } else {
      ctx.fillText(subText, center, center);
    }

    // Outer Arc Text (Company Name e.g. 주식회사 울트라오피스 ★)
    const compName = config.mainText.trim() || '주식회사 울트라오피스';
    const textRadius = (outerRadius + innerRadius) / 2;
    ctx.font = `bold ${width * 0.09}px ${fontFamily}`;

    const numLetters = compName.length;
    const startAngle = Math.PI * 1.05;
    const arcLength = Math.PI * 1.5;
    const step = arcLength / Math.max(numLetters - 1, 1);

    for (let i = 0; i < numLetters; i++) {
      const angle = startAngle + i * step;
      const x = center + textRadius * Math.cos(angle);
      const y = center + textRadius * Math.sin(angle);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle + Math.PI / 2);
      ctx.fillText(compName[i], 0, 0);
      ctx.restore();
    }

    // Bottom decorative star
    ctx.font = `bold ${width * 0.08}px sans-serif`;
    ctx.fillText('★', center, center + textRadius * 0.95);
  } else if (config.type === 'approval_sign') {
    // 5. 결재 도장 (3단 슬롯)
    const pad = ctx.lineWidth;
    const w = width - pad * 2;
    const h = height * 0.7;
    const topY = (height - h) / 2;

    ctx.beginPath();
    ctx.rect(pad, topY, w, h);
    ctx.stroke();

    const colW = w / 3;
    const headerH = h * 0.35;

    // Header divider
    ctx.beginPath();
    ctx.moveTo(pad, topY + headerH);
    ctx.lineTo(pad + w, topY + headerH);
    ctx.stroke();

    // Column dividers
    ctx.beginPath();
    ctx.moveTo(pad + colW, topY);
    ctx.lineTo(pad + colW, topY + h);
    ctx.moveTo(pad + colW * 2, topY);
    ctx.lineTo(pad + colW * 2, topY + h);
    ctx.stroke();

    // Titles
    ctx.font = `bold ${width * 0.08}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('담 당', pad + colW * 0.5, topY + headerH * 0.5);
    ctx.fillText('검 토', pad + colW * 1.5, topY + headerH * 0.5);
    ctx.fillText('승 인', pad + colW * 2.5, topY + headerH * 0.5);

    // Sign/Name in right slot
    ctx.font = `bold ${width * 0.12}px ${fontFamily}`;
    ctx.fillText(config.mainText || '인', pad + colW * 2.5, topY + headerH + (h - headerH) * 0.5);
  }

  // 6. Roughness / Ink distress effect
  if (config.roughness > 0) {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const threshold = config.roughness / 100;

    for (let i = 0; i < data.length; i += 4) {
      // If pixel is colored (alpha > 0)
      if (data[i + 3] > 50) {
        // Randomly reduce alpha or add micro holes for ink texture
        if (Math.random() < threshold * 0.35) {
          data[i + 3] = Math.max(0, data[i + 3] - Math.floor(Math.random() * 200));
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  ctx.restore();

  return canvas.toDataURL('image/png');
}
