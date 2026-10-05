import { loadImage, cropAndResizeLogo } from './image-processor';

export type LogoShape = 'circle' | 'rounded' | 'square' | 'hexagon' | 'heart' | 'none';

function traceShape(ctx: CanvasRenderingContext2D, shape: LogoShape, width: number, height: number) {
  const size = Math.min(width, height);
  const x = (width - size) / 2;
  const y = (height - size) / 2;
  const centerX = width / 2;
  const centerY = height / 2;
  ctx.beginPath();

  if (shape === 'circle') {
    ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
  } else if (shape === 'rounded') {
    ctx.roundRect(x, y, size, size, size * 0.2);
  } else if (shape === 'hexagon') {
    for (let i = 0; i < 6; i += 1) {
      const angle = (Math.PI * i) / 3 - Math.PI / 2;
      const px = centerX + Math.cos(angle) * size / 2;
      const py = centerY + Math.sin(angle) * size / 2;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  } else if (shape === 'heart') {
    ctx.moveTo(centerX, y + size * 0.9);
    ctx.bezierCurveTo(x + size * 0.12, y + size * 0.64, x, y + size * 0.42, x + size * 0.13, y + size * 0.22);
    ctx.bezierCurveTo(x + size * 0.27, y, x + size * 0.45, y + size * 0.09, centerX, y + size * 0.26);
    ctx.bezierCurveTo(x + size * 0.55, y + size * 0.09, x + size * 0.73, y, x + size * 0.87, y + size * 0.22);
    ctx.bezierCurveTo(x + size, y + size * 0.42, x + size * 0.88, y + size * 0.64, centerX, y + size * 0.9);
    ctx.closePath();
  } else {
    ctx.rect(x, y, size, size);
  }
}

export async function renderShapedLogo(
  imageSrc: string,
  cropArea: { x: number; y: number; width: number; height: number },
  targetWidth: number,
  targetHeight: number,
  shape: LogoShape
): Promise<string> {
  if (shape === 'none') {
    return cropAndResizeLogo(imageSrc, cropArea, targetWidth, targetHeight);
  }

  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2d context');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  traceShape(ctx, shape, targetWidth, targetHeight);
  ctx.clip();
  ctx.drawImage(
    image,
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
