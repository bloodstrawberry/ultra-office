import { createEmptyCanvas } from './canvas-layer';

export function pickColorAt(
  canvas: HTMLCanvasElement,
  x: number,
  y: number
): { hex: string; rgb: { r: number; g: number; b: number; a: number } } {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return { hex: '#000000', rgb: { r: 0, g: 0, b: 0, a: 1 } };

  const ix = Math.max(0, Math.min(canvas.width - 1, Math.floor(x)));
  const iy = Math.max(0, Math.min(canvas.height - 1, Math.floor(y)));
  const pixel = ctx.getImageData(ix, iy, 1, 1).data;

  const r = pixel[0];
  const g = pixel[1];
  const b = pixel[2];
  const a = pixel[3] / 255;

  const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  return { hex, rgb: { r, g, b, a } };
}

export function drawBrushStroke(
  ctx: CanvasRenderingContext2D,
  p0: { x: number; y: number } | null,
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  size: number,
  color: string,
  opacity: number,
  hardness: number,
  maskCanvas: HTMLCanvasElement | null
): void {
  ctx.save();
  if (maskCanvas) {
    // If mask exists, clip using mask
    // We can use destination-in or clip path
  }

  ctx.globalAlpha = Math.min(1, Math.max(0.01, opacity));
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = size;

  if (hardness < 0.9) {
    ctx.shadowBlur = (1 - hardness) * (size / 2);
    ctx.shadowColor = color;
  }

  ctx.beginPath();
  if (p0) {
    const mid1 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
    const mid2 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    ctx.moveTo(mid1.x, mid1.y);
    ctx.quadraticCurveTo(p1.x, p1.y, mid2.x, mid2.y);
  } else {
    ctx.moveTo(p1.x, p1.y);
    const mid2 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    ctx.lineTo(mid2.x, mid2.y);
  }
  ctx.stroke();

  ctx.restore();
}

export function drawPencilPixel(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string
): void {
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.lineCap = 'square';
  ctx.lineJoin = 'miter';

  ctx.beginPath();
  ctx.moveTo(Math.floor(fromX), Math.floor(fromY));
  ctx.lineTo(Math.floor(toX), Math.floor(toY));
  ctx.stroke();

  ctx.restore();
}

export function drawEraserStroke(
  ctx: CanvasRenderingContext2D,
  p0: { x: number; y: number } | null,
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  size: number,
  opacity: number,
  hardness: number
): void {
  ctx.save();
  ctx.globalAlpha = Math.min(1, Math.max(0.01, opacity));
  ctx.globalCompositeOperation = 'destination-out';
  ctx.strokeStyle = 'rgba(0,0,0,1)';
  ctx.fillStyle = 'rgba(0,0,0,1)';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = size;

  if (hardness < 0.9) {
    ctx.shadowBlur = (1 - hardness) * (size / 2);
    ctx.shadowColor = 'rgba(0,0,0,1)';
  }

  ctx.beginPath();
  if (p0) {
    const mid1 = { x: (p0.x + p1.x) / 2, y: (p0.y + p1.y) / 2 };
    const mid2 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    ctx.moveTo(mid1.x, mid1.y);
    ctx.quadraticCurveTo(p1.x, p1.y, mid2.x, mid2.y);
  } else {
    ctx.moveTo(p1.x, p1.y);
    const mid2 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    ctx.lineTo(mid2.x, mid2.y);
  }
  ctx.stroke();

  ctx.restore();
}

export function floodFill(
  targetCanvas: HTMLCanvasElement,
  startX: number,
  startY: number,
  fillColorHex: string,
  tolerance = 32,
  maskCanvas: HTMLCanvasElement | null = null
): void {
  const ctx = targetCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  const width = targetCanvas.width;
  const height = targetCanvas.height;
  const sx = Math.floor(startX);
  const sy = Math.floor(startY);
  if (sx < 0 || sx >= width || sy < 0 || sy >= height) return;

  const imgData = ctx.getImageData(0, 0, width, height);
  const pixels = imgData.data;

  // Mask data check
  let maskPixels: Uint8ClampedArray | null = null;
  if (maskCanvas) {
    const mCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
    if (mCtx) {
      maskPixels = mCtx.getImageData(0, 0, width, height).data;
    }
  }

  const startIdx = (sy * width + sx) * 4;
  const tr = pixels[startIdx];
  const tg = pixels[startIdx + 1];
  const tb = pixels[startIdx + 2];
  const ta = pixels[startIdx + 3];

  // Parse fill color
  const tempC = document.createElement('canvas');
  tempC.width = 1;
  tempC.height = 1;
  const tempCtx = tempC.getContext('2d');
  if (!tempCtx) return;
  tempCtx.fillStyle = fillColorHex;
  tempCtx.fillRect(0, 0, 1, 1);
  const fillRgb = tempCtx.getImageData(0, 0, 1, 1).data;
  const fr = fillRgb[0];
  const fg = fillRgb[1];
  const fb = fillRgb[2];
  const fa = 255;

  if (
    Math.abs(tr - fr) <= 2 &&
    Math.abs(tg - fg) <= 2 &&
    Math.abs(tb - fb) <= 2 &&
    Math.abs(ta - fa) <= 2
  ) {
    return;
  }

  const visited = new Uint8Array(width * height);

  const colorMatch = (idx: number) => {
    const dr = pixels[idx] - tr;
    const dg = pixels[idx + 1] - tg;
    const db = pixels[idx + 2] - tb;
    const da = pixels[idx + 3] - ta;
    return Math.sqrt(dr * dr + dg * dg + db * db + da * da) <= tolerance;
  };

  const stack = [sx, sy];
  let spanAbove = false;
  let spanBelow = false;

  while (stack.length > 0) {
    const cy = stack.pop()!;
    let cx = stack.pop()!;

    let lx = cx;
    while (lx >= 0 && !visited[cy * width + lx] && colorMatch((cy * width + lx) * 4)) {
      if (maskPixels && maskPixels[(cy * width + lx) * 4 + 3] === 0) break;
      lx--;
    }
    lx++;

    spanAbove = false;
    spanBelow = false;

    for (let x = lx; x < width; x++) {
      const idx = cy * width + x;
      const pIdx = idx * 4;

      if (visited[idx] || !colorMatch(pIdx) || (maskPixels && maskPixels[pIdx + 3] === 0)) {
        break;
      }

      visited[idx] = 1;
      pixels[pIdx] = fr;
      pixels[pIdx + 1] = fg;
      pixels[pIdx + 2] = fb;
      pixels[pIdx + 3] = fa;

      if (cy > 0) {
        const topIdx = (cy - 1) * width + x;
        const topPIdx = topIdx * 4;
        const topValid =
          !visited[topIdx] && colorMatch(topPIdx) && (!maskPixels || maskPixels[topPIdx + 3] !== 0);

        if (!spanAbove && topValid) {
          stack.push(x, cy - 1);
          spanAbove = true;
        } else if (spanAbove && !topValid) {
          spanAbove = false;
        }
      }

      if (cy < height - 1) {
        const botIdx = (cy + 1) * width + x;
        const botPIdx = botIdx * 4;
        const botValid =
          !visited[botIdx] && colorMatch(botPIdx) && (!maskPixels || maskPixels[botPIdx + 3] !== 0);

        if (!spanBelow && botValid) {
          stack.push(x, cy + 1);
          spanBelow = true;
        } else if (spanBelow && !botValid) {
          spanBelow = false;
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

export function drawGradient(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  color1: string,
  color2: string,
  type: 'linear' | 'radial'
): void {
  ctx.save();
  let grad: CanvasGradient;

  if (type === 'linear') {
    grad = ctx.createLinearGradient(startX, startY, endX, endY);
  } else {
    const radius = Math.hypot(endX - startX, endY - startY);
    grad = ctx.createRadialGradient(startX, startY, 0, startX, startY, Math.max(1, radius));
  }

  grad.addColorStop(0, color1);
  grad.addColorStop(1, color2);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();
}

export function drawDodgeBurn(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  isDodge: boolean
): void {
  ctx.save();
  const radius = size / 2;
  const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);

  if (isDodge) {
    ctx.globalCompositeOperation = 'color-dodge';
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  } else {
    ctx.globalCompositeOperation = 'color-burn';
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.25)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  }

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();
}

export function drawShape(
  ctx: CanvasRenderingContext2D,
  type: 'rect' | 'ellipse' | 'line' | 'arrow',
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  fillColor: string,
  strokeColor: string,
  lineWidth: number,
  fill: boolean,
  stroke: boolean
): void {
  ctx.save();
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const left = Math.min(x1, x2);
  const top = Math.min(y1, y2);
  const w = Math.abs(x2 - x1);
  const h = Math.abs(y2 - y1);

  ctx.beginPath();
  if (type === 'rect') {
    ctx.rect(left, top, w, h);
  } else if (type === 'ellipse') {
    ctx.ellipse(left + w / 2, top + h / 2, w / 2, h / 2, 0, 0, 2 * Math.PI);
  } else if (type === 'line') {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
  } else if (type === 'arrow') {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    // Draw arrow tip
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const arrowHeadLen = Math.max(12, lineWidth * 3);
    ctx.lineTo(
      x2 - arrowHeadLen * Math.cos(angle - Math.PI / 6),
      y2 - arrowHeadLen * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - arrowHeadLen * Math.cos(angle + Math.PI / 6),
      y2 - arrowHeadLen * Math.sin(angle + Math.PI / 6)
    );
  }

  if (fill && (type === 'rect' || type === 'ellipse')) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }

  ctx.restore();
}

export function drawWebtoonBubbleShape(
  ctx: CanvasRenderingContext2D,
  shape: 'oval' | 'shout' | 'thought' | 'cloud' | 'box',
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  tailX: number,
  tailY: number,
  fillColor = '#ffffff',
  strokeColor = '#000000',
  strokeWidth = 3
): void {
  ctx.save();
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const left = Math.min(x1, x2);
  const top = Math.min(y1, y2);
  const w = Math.max(20, Math.abs(x2 - x1));
  const h = Math.max(20, Math.abs(y2 - y1));
  const cx = left + w / 2;
  const cy = top + h / 2;

  ctx.beginPath();

  if (shape === 'box') {
    ctx.rect(left, top, w, h);
  } else if (shape === 'shout') {
    // Spiky bubble
    const spikes = 16;
    const rx = w / 2;
    const ry = h / 2;
    for (let i = 0; i < spikes * 2; i += 1) {
      const angle = (i * Math.PI) / spikes;
      const rFactor = i % 2 === 0 ? 1 : 0.75;
      const px = cx + rx * rFactor * Math.cos(angle);
      const py = cy + ry * rFactor * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  } else {
    // Oval with smooth curve
    ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, 2 * Math.PI);
  }

  ctx.fill();
  ctx.stroke();

  // Draw tail if outside
  const tailDist = Math.hypot(tailX - cx, tailY - cy);
  if (tailDist > Math.min(w, h) / 3 && shape !== 'thought') {
    ctx.beginPath();
    const baseAngle = Math.atan2(tailY - cy, tailX - cx);
    const p1x = cx + (w / 2) * Math.cos(baseAngle - 0.2);
    const p1y = cy + (h / 2) * Math.sin(baseAngle - 0.2);
    const p2x = cx + (w / 2) * Math.cos(baseAngle + 0.2);
    const p2y = cy + (h / 2) * Math.sin(baseAngle + 0.2);

    ctx.moveTo(p1x, p1y);
    ctx.lineTo(tailX, tailY);
    ctx.lineTo(p2x, p2y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}
