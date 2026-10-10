import { loadImage, cropAndResizeLogo } from './image-processor';

export type LogoShape =
  | 'circle'
  | 'polygon'
  | 'star'
  | 'heart'
  | 'diamond'
  | 'capsule'
  | 'shield'
  | 'speechBubble'
  | 'droplet'
  | 'none';

export interface LogoShapeSettings {
  shape: LogoShape;
  rotation: number;
  polygonSides: number;
  roundness: number;
  starPoints: number;
}

type Point = { x: number; y: number };

function fitPoints(points: Point[], width: number, height: number): Point[] {
  const minX = Math.min(...points.map((point) => point.x));
  const maxX = Math.max(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxY = Math.max(...points.map((point) => point.y));
  return points.map((point) => ({
    x: ((point.x - minX) / (maxX - minX)) * width,
    y: ((point.y - minY) / (maxY - minY)) * height,
  }));
}

function polygonPath(points: Point[], roundness: number = 0): string {
  if (roundness <= 0) {
    return `M ${points[0].x} ${points[0].y} ${points
      .slice(1)
      .map((point) => `L ${point.x} ${point.y}`)
      .join(' ')} Z`;
  }

  const factor = Math.min(100, Math.max(0, roundness)) / 200;
  const corners = points.map((point, index) => {
    const previous = points[(index + points.length - 1) % points.length];
    const next = points[(index + 1) % points.length];
    const previousLength = Math.hypot(previous.x - point.x, previous.y - point.y);
    const nextLength = Math.hypot(next.x - point.x, next.y - point.y);
    const cut = Math.min(previousLength, nextLength) * factor;
    return {
      point,
      entry: {
        x: point.x + ((previous.x - point.x) / previousLength) * cut,
        y: point.y + ((previous.y - point.y) / previousLength) * cut,
      },
      exit: {
        x: point.x + ((next.x - point.x) / nextLength) * cut,
        y: point.y + ((next.y - point.y) / nextLength) * cut,
      },
    };
  });
  return `M ${corners[0].exit.x} ${corners[0].exit.y} ${corners
    .slice(1)
    .map(
      ({ point, entry, exit }) =>
        `L ${entry.x} ${entry.y} Q ${point.x} ${point.y} ${exit.x} ${exit.y}`
    )
    .join(
      ' '
    )} L ${corners[0].entry.x} ${corners[0].entry.y} Q ${corners[0].point.x} ${corners[0].point.y} ${corners[0].exit.x} ${corners[0].exit.y} Z`;
}

export function getLogoShapePath(
  settings: LogoShapeSettings,
  width: number,
  height: number
): string {
  const { shape } = settings;
  const w = width;
  const h = height;
  const cx = w / 2;
  const cy = h / 2;

  if (shape === 'circle') {
    return `M ${w} ${cy} A ${cx} ${cy} 0 1 0 0 ${cy} A ${cx} ${cy} 0 1 0 ${w} ${cy} Z`;
  }
  if (shape === 'polygon') {
    const sides = Math.max(3, Math.min(360, Math.floor(settings.polygonSides)));
    const angleOffset = sides % 2 === 0 ? Math.PI / sides : 0;
    const vertices = Array.from({ length: sides }, (_, index) => {
      const angle = (Math.PI * 2 * index) / sides - Math.PI / 2 - angleOffset;
      return { x: Math.cos(angle), y: Math.sin(angle) };
    });
    return polygonPath(fitPoints(vertices, w, h), settings.roundness);
  }
  if (shape === 'star') {
    const tips = Math.max(4, Math.min(24, Math.floor(settings.starPoints)));
    const vertices = Array.from({ length: tips * 2 }, (_, index) => {
      const angle = (Math.PI * index) / tips - Math.PI / 2;
      const radius = index % 2 === 0 ? 1 : 0.48;
      return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
    });
    return polygonPath(fitPoints(vertices, w, h));
  }
  if (shape === 'heart') {
    return `M ${cx} ${h * 0.9} C ${w * 0.12} ${h * 0.64}, 0 ${h * 0.42}, ${w * 0.13} ${h * 0.22}
      C ${w * 0.27} 0, ${w * 0.45} ${h * 0.09}, ${cx} ${h * 0.26}
      C ${w * 0.55} ${h * 0.09}, ${w * 0.73} 0, ${w * 0.87} ${h * 0.22}
      C ${w} ${h * 0.42}, ${w * 0.88} ${h * 0.64}, ${cx} ${h * 0.9} Z`;
  }
  if (shape === 'diamond') {
    return `M ${cx} 0 L ${w} ${cy} L ${cx} ${h} L 0 ${cy} Z`;
  }
  if (shape === 'capsule') {
    const radius = Math.min(w, h) / 2;
    return `M ${radius} 0 H ${w - radius} A ${radius} ${radius} 0 0 1 ${w} ${radius}
      V ${h - radius} A ${radius} ${radius} 0 0 1 ${w - radius} ${h}
      H ${radius} A ${radius} ${radius} 0 0 1 0 ${h - radius}
      V ${radius} A ${radius} ${radius} 0 0 1 ${radius} 0 Z`;
  }
  if (shape === 'shield') {
    return `M ${cx} 0 L ${w} ${h * 0.14} L ${w * 0.92} ${h * 0.62}
      Q ${w * 0.8} ${h * 0.88} ${cx} ${h}
      Q ${w * 0.2} ${h * 0.88} ${w * 0.08} ${h * 0.62} L 0 ${h * 0.14} Z`;
  }
  if (shape === 'speechBubble') {
    return `M ${w * 0.12} ${h * 0.04} L ${w * 0.88} ${h * 0.04}
      Q ${w} ${h * 0.04} ${w} ${h * 0.2} L ${w} ${h * 0.7}
      Q ${w} ${h * 0.86} ${w * 0.85} ${h * 0.86} L ${w * 0.42} ${h * 0.86}
      L ${w * 0.2} ${h} L ${w * 0.23} ${h * 0.86} L ${w * 0.12} ${h * 0.86}
      Q 0 ${h * 0.86} 0 ${h * 0.7} L 0 ${h * 0.2}
      Q 0 ${h * 0.04} ${w * 0.12} ${h * 0.04} Z`;
  }
  if (shape === 'droplet') {
    return `M ${cx} 0 C ${w * 0.65} ${h * 0.28}, ${w} ${h * 0.47}, ${w} ${h * 0.68}
      C ${w} ${h * 0.88}, ${w * 0.78} ${h}, ${cx} ${h}
      C ${w * 0.22} ${h}, 0 ${h * 0.88}, 0 ${h * 0.68}
      C 0 ${h * 0.47}, ${w * 0.35} ${h * 0.28}, ${cx} 0 Z`;
  }
  return `M 0 0 H ${w} V ${h} H 0 Z`;
}

export function getShapeFitScale(
  shape: LogoShape,
  width: number,
  height: number,
  rotation: number
): number {
  const radians = (rotation * Math.PI) / 180;
  const cos = Math.abs(Math.cos(radians));
  const sin = Math.abs(Math.sin(radians));

  if (shape === 'circle') {
    const rotatedWidth = Math.hypot(width * cos, height * sin);
    const rotatedHeight = Math.hypot(width * sin, height * cos);
    return Math.min(1, width / rotatedWidth, height / rotatedHeight);
  }

  const rotatedWidth = width * cos + height * sin;
  const rotatedHeight = width * sin + height * cos;
  return Math.min(1, width / rotatedWidth, height / rotatedHeight);
}

export async function renderShapedLogo(
  imageSrc: string,
  cropArea: { x: number; y: number; width: number; height: number },
  targetWidth: number,
  targetHeight: number,
  settings: LogoShapeSettings
): Promise<string> {
  if (settings.shape === 'none') {
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

  const fitScale = getShapeFitScale(settings.shape, targetWidth, targetHeight, settings.rotation);
  ctx.save();
  ctx.translate(targetWidth / 2, targetHeight / 2);
  ctx.rotate((settings.rotation * Math.PI) / 180);
  ctx.scale(fitScale, fitScale);
  ctx.translate(-targetWidth / 2, -targetHeight / 2);
  const path = new Path2D(getLogoShapePath(settings, targetWidth, targetHeight));
  ctx.clip(path);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
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
  ctx.restore();
  return canvas.toDataURL('image/png');
}
