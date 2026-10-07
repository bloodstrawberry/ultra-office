export const IMAGE_BUBBLE_ASSETS = [
  {
    id: 'assetRetro',
    label: '손그림 둥근',
    file: 'retro.png',
    aspect: 1.43,
    width: 0.46,
    textWidth: 0.68,
    textHeight: 0.5,
    textY: -0.12,
  },
  {
    id: 'assetComicCloud',
    label: '손그림 각진',
    file: 'comic-cloud.png',
    aspect: 1.09,
    width: 0.42,
    textWidth: 0.68,
    textHeight: 0.47,
    textY: -0.12,
  },
  {
    id: 'assetThought',
    label: '동글 생각',
    file: 'thought.png',
    aspect: 1.05,
    width: 0.42,
    textWidth: 0.62,
    textHeight: 0.48,
    textY: -0.18,
  },
  {
    id: 'assetPuffy',
    label: '푹신 구름',
    file: 'blank-cloud.png',
    aspect: 1.34,
    width: 0.46,
    textWidth: 0.65,
    textHeight: 0.54,
    textY: 0,
  },
  {
    id: 'assetBurst',
    label: '번쩍 외침',
    file: 'burst.png',
    aspect: 1.01,
    width: 0.42,
    textWidth: 0.52,
    textHeight: 0.46,
    textY: -0.07,
  },
  {
    id: 'assetInk',
    label: '잉크 번짐',
    file: 'round.png',
    aspect: 1,
    width: 0.42,
    textWidth: 0.58,
    textHeight: 0.45,
    textY: -0.1,
  },
  {
    id: 'assetBoldCloud',
    label: '진한 구름',
    file: 'round-alt.png',
    aspect: 1,
    width: 0.42,
    textWidth: 0.56,
    textHeight: 0.45,
    textY: -0.12,
  },
  {
    id: 'assetDashed',
    label: '점선 그림자',
    file: 'oval.png',
    aspect: 1.15,
    width: 0.44,
    textWidth: 0.6,
    textHeight: 0.48,
    textY: -0.1,
  },
  {
    id: 'assetCallout',
    label: '손그림 네모',
    file: 'callout.png',
    aspect: 1.14,
    width: 0.43,
    textWidth: 0.62,
    textHeight: 0.48,
    textY: -0.11,
  },
  {
    id: 'assetPink',
    label: '핑크 광택',
    file: 'pink-gloss.png',
    aspect: 1.42,
    width: 0.46,
    textWidth: 0.7,
    textHeight: 0.5,
    textY: -0.12,
  },
] as const;

export const BUBBLE_SHAPES = [
  { id: 'titleText', label: '큰 제목 글자' },
  { id: 'emphasisText', label: '효과선 대사' },
  { id: 'outlinedText', label: '윤곽선 글자' },
  { id: 'circleSpeech', label: '원형 꼬리 말풍선' },
  { id: 'oval', label: '기본 타원' },
  { id: 'rounded', label: '둥근 사각형' },
  { id: 'box', label: '각진 말풍선' },
  { id: 'cloud', label: '구름 말풍선' },
  { id: 'thought', label: '생각 풍선' },
  { id: 'shout', label: '외침' },
  { id: 'burst', label: '폭발' },
  { id: 'spiky', label: '충격' },
  { id: 'star', label: '별 모양' },
  { id: 'whisper', label: '속삭임' },
  { id: 'narration', label: '내레이션' },
  { id: 'caption', label: '사선 캡션' },
  { id: 'heart', label: '하트' },
  { id: 'diamond', label: '마름모' },
  { id: 'hexagon', label: '육각형' },
  { id: 'wave', label: '물결 말풍선' },
  { id: 'radio', label: '라디오 전자음' },
  { id: 'rough', label: '거친 목소리' },
  { id: 'wobbly', label: '떨리는 말' },
  { id: 'pixel', label: '픽셀 대사' },
  { id: 'chat', label: '메신저 대화' },
  { id: 'telepathy', label: '텔레파시' },
  { id: 'speed', label: '속도선 대사' },
  ...IMAGE_BUBBLE_ASSETS,
] as const;

export type BubbleShape = (typeof BUBBLE_SHAPES)[number]['id'];
export type ImageBubbleAsset = (typeof IMAGE_BUBBLE_ASSETS)[number];
export type TailDirection = 'bottom' | 'top' | 'left' | 'right' | 'none';
export type BorderStyle = 'solid' | 'dashed' | 'dotted';
export const TEXT_ONLY_SHAPES: BubbleShape[] = ['titleText', 'emphasisText', 'outlinedText'];

export function isTextOnlyShape(shape: BubbleShape) {
  return TEXT_ONLY_SHAPES.includes(shape);
}

export function getImageBubbleAsset(shape: BubbleShape): ImageBubbleAsset | undefined {
  return IMAGE_BUBBLE_ASSETS.find((asset) => asset.id === shape);
}

const imageBubbleCache = new Map<string, HTMLImageElement>();
const imageBubbleLoads = new Map<string, Promise<void>>();

export async function preloadImageBubbleAssets(): Promise<void> {
  await Promise.all(
    IMAGE_BUBBLE_ASSETS.map((asset) => {
      const pending = imageBubbleLoads.get(asset.id);
      if (pending) return pending;
      const loading = new Promise<void>((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          imageBubbleCache.set(asset.id, image);
          resolve();
        };
        image.onerror = () => reject(new Error(`${asset.file} 파일을 불러오지 못했습니다.`));
        image.src = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/webtoon/bubbles/${asset.file}`;
      });
      imageBubbleLoads.set(asset.id, loading);
      return loading;
    })
  );
}

export const RESIZE_HANDLES = [
  { id: 'nw', x: -1, y: -1 },
  { id: 'n', x: 0, y: -1 },
  { id: 'ne', x: 1, y: -1 },
  { id: 'e', x: 1, y: 0 },
  { id: 'se', x: 1, y: 1 },
  { id: 's', x: 0, y: 1 },
  { id: 'sw', x: -1, y: 1 },
  { id: 'w', x: -1, y: 0 },
] as const;

export type ResizeHandle = (typeof RESIZE_HANDLES)[number];
export const RESIZE_HANDLE_OFFSET = 5;

export interface Bubble {
  id: string;
  shape: BubbleShape;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  tail: TailDirection;
  tailLength: number;
  tailWidth: number;
  tailPosition: number;
  flipX: boolean;
  flipY: boolean;
  fill: string;
  stroke: string;
  strokeWidth: number;
  borderStyle: BorderStyle;
  shadowBlur: number;
  shadowColor: string;
  opacity: number;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  italic: boolean;
  textColor: string;
  textStrokeColor: string;
  textStrokeWidth: number;
  textAlign: CanvasTextAlign;
  lineHeight: number;
  letterSpacing: number;
}

export function createBubble(shape: BubbleShape, count: number): Bubble {
  const asset = getImageBubbleAsset(shape);
  return {
    id: crypto.randomUUID(),
    shape,
    text:
      shape === 'thought'
        ? '무슨 생각을 하지?'
        : shape === 'titleText'
          ? '제목을\n입력하세요'
          : shape === 'emphasisText'
            ? '강조 대사'
            : shape === 'outlinedText'
              ? '윤곽선 대사'
              : shape === 'circleSpeech'
                ? '대사를\n입력하세요'
                : '대사를 입력하세요',
    x: Math.min(0.5 + (count % 4) * 0.055, 0.75),
    y: Math.min((shape === 'titleText' ? 0.16 : 0.3) + (count % 4) * 0.055, 0.75),
    width:
      asset?.width ??
      (shape === 'titleText'
        ? 0.9
        : shape === 'outlinedText'
          ? 0.6
          : shape === 'circleSpeech'
            ? 0.33
            : 0.42),
    height: asset
      ? asset.width / asset.aspect
      : shape === 'titleText'
        ? 0.3
        : shape === 'circleSpeech'
          ? 0.33
          : 0.25,
    rotation: 0,
    tail: asset
      ? 'none'
      : shape === 'circleSpeech'
        ? 'right'
        : isTextOnlyShape(shape) ||
            ['narration', 'caption', 'heart', 'diamond', 'hexagon', 'telepathy'].includes(shape)
          ? 'none'
          : 'bottom',
    tailLength: shape === 'chat' ? 0.11 : 0.2,
    tailWidth: shape === 'chat' ? 0.12 : 0.24,
    tailPosition: shape === 'chat' ? 0.55 : 0,
    flipX: false,
    flipY: false,
    fill:
      shape === 'circleSpeech'
        ? '#fff2b5'
        : shape === 'chat'
          ? '#bfe6ff'
          : shape === 'telepathy'
            ? '#f3eaff'
            : shape === 'radio'
              ? '#e9f5ff'
              : '#ffffff',
    stroke: shape === 'radio' ? '#16406c' : '#171717',
    strokeWidth: isTextOnlyShape(shape) || shape === 'chat' || asset ? 0 : 3,
    borderStyle: shape === 'whisper' ? 'dashed' : 'solid',
    shadowBlur: 0,
    shadowColor: '#555555',
    opacity: 100,
    fontFamily:
      shape === 'circleSpeech' ? '"Malgun Gothic", sans-serif' : '"JalnanGothic", sans-serif',
    fontSize:
      shape === 'titleText'
        ? 95
        : shape === 'outlinedText'
          ? 50
          : shape === 'circleSpeech' || shape === 'emphasisText'
            ? 42
            : asset
              ? 30
              : 34,
    fontWeight: shape === 'titleText' ? 900 : shape === 'circleSpeech' ? 500 : 700,
    italic: shape === 'radio' || shape === 'telepathy',
    textColor: shape === 'outlinedText' || shape === 'assetPink' ? '#ffffff' : '#171717',
    textStrokeColor: shape === 'outlinedText' ? '#555555' : '#171717',
    textStrokeWidth: shape === 'outlinedText' ? 7 : 0,
    textAlign: 'center',
    lineHeight: shape === 'titleText' ? 1.1 : 1.25,
    letterSpacing: 0,
  };
}

function polygon(ctx: CanvasRenderingContext2D, points: [number, number][]) {
  ctx.moveTo(points[0][0], points[0][1]);
  points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
  ctx.closePath();
}

function radialShape(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  points: number,
  inner: number,
  variation = 0
) {
  const vertices: [number, number][] = [];
  for (let i = 0; i < points * 2; i += 1) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 ? inner : 1 - (i % 4 === 0 ? variation : 0);
    vertices.push([Math.cos(angle) * w * 0.5 * radius, Math.sin(angle) * h * 0.5 * radius]);
  }
  polygon(ctx, vertices);
}

function bubblePath(ctx: CanvasRenderingContext2D, shape: BubbleShape, w: number, h: number) {
  ctx.beginPath();
  switch (shape) {
    case 'rounded':
      ctx.roundRect(-w / 2, -h / 2, w, h, Math.min(w, h) * 0.22);
      break;
    case 'box':
    case 'narration':
      ctx.rect(-w / 2, -h / 2, w, h);
      break;
    case 'caption':
      polygon(ctx, [
        [-w * 0.46, -h / 2],
        [w / 2, -h / 2],
        [w * 0.46, h / 2],
        [-w / 2, h / 2],
      ]);
      break;
    case 'cloud': {
      const steps = 12;
      for (let i = 0; i <= steps; i += 1) {
        const a = (i * Math.PI * 2) / steps;
        const x = Math.cos(a) * w * 0.43;
        const y = Math.sin(a) * h * 0.43;
        if (i === 0) ctx.moveTo(x, y);
        else
          ctx.quadraticCurveTo(
            Math.cos(a - Math.PI / steps) * w * 0.59,
            Math.sin(a - Math.PI / steps) * h * 0.59,
            x,
            y
          );
      }
      ctx.closePath();
      break;
    }
    case 'shout':
      radialShape(ctx, w, h, 14, 0.79);
      break;
    case 'radio':
      radialShape(ctx, w, h, 24, 0.88);
      break;
    case 'burst':
      radialShape(ctx, w, h, 18, 0.64);
      break;
    case 'spiky':
      radialShape(ctx, w, h, 12, 0.5, 0.12);
      break;
    case 'rough': {
      const vertices: [number, number][] = [];
      for (let index = 0; index < 56; index += 1) {
        const angle = (index * Math.PI * 2) / 56;
        const jitter = Math.sin(index * 8.7) * 0.035 + Math.sin(index * 3.1) * 0.025;
        vertices.push([
          Math.cos(angle) * w * 0.48 * (1 + jitter),
          Math.sin(angle) * h * 0.48 * (1 + jitter),
        ]);
      }
      polygon(ctx, vertices);
      break;
    }
    case 'star':
      radialShape(ctx, w, h, 8, 0.64);
      break;
    case 'pixel':
      polygon(ctx, [
        [-w * 0.37, -h * 0.5],
        [w * 0.37, -h * 0.5],
        [w * 0.37, -h * 0.38],
        [w * 0.47, -h * 0.38],
        [w * 0.47, -h * 0.22],
        [w * 0.5, -h * 0.22],
        [w * 0.5, h * 0.22],
        [w * 0.47, h * 0.22],
        [w * 0.47, h * 0.38],
        [w * 0.37, h * 0.38],
        [w * 0.37, h * 0.5],
        [-w * 0.37, h * 0.5],
        [-w * 0.37, h * 0.38],
        [-w * 0.47, h * 0.38],
        [-w * 0.47, h * 0.22],
        [-w * 0.5, h * 0.22],
        [-w * 0.5, -h * 0.22],
        [-w * 0.47, -h * 0.22],
        [-w * 0.47, -h * 0.38],
        [-w * 0.37, -h * 0.38],
      ]);
      break;
    case 'heart':
      ctx.moveTo(0, h * 0.45);
      ctx.bezierCurveTo(-w * 0.17, h * 0.25, -w * 0.55, -h * 0.02, -w * 0.43, -h * 0.32);
      ctx.bezierCurveTo(-w * 0.32, -h * 0.62, -w * 0.08, -h * 0.46, 0, -h * 0.27);
      ctx.bezierCurveTo(w * 0.08, -h * 0.46, w * 0.32, -h * 0.62, w * 0.43, -h * 0.32);
      ctx.bezierCurveTo(w * 0.55, -h * 0.02, w * 0.17, h * 0.25, 0, h * 0.45);
      ctx.closePath();
      break;
    case 'diamond':
      polygon(ctx, [
        [0, -h / 2],
        [w / 2, 0],
        [0, h / 2],
        [-w / 2, 0],
      ]);
      break;
    case 'hexagon':
      polygon(ctx, [
        [-w * 0.35, -h / 2],
        [w * 0.35, -h / 2],
        [w / 2, 0],
        [w * 0.35, h / 2],
        [-w * 0.35, h / 2],
        [-w / 2, 0],
      ]);
      break;
    case 'wave': {
      const steps = 32;
      for (let i = 0; i <= steps; i += 1) {
        const a = (i * Math.PI * 2) / steps;
        const wave = 1 + Math.sin(a * 8) * 0.055;
        const x = Math.cos(a) * w * 0.5 * wave;
        const y = Math.sin(a) * h * 0.5 * wave;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      break;
    }
    case 'wobbly': {
      const steps = 36;
      const pointAt = (index: number) => {
        const angle = (index * Math.PI * 2) / steps;
        const wobble = 1 + Math.sin(angle * 5 + 0.4) * 0.06 + Math.sin(angle * 9) * 0.04;
        return { x: Math.cos(angle) * w * 0.48 * wobble, y: Math.sin(angle) * h * 0.48 * wobble };
      };
      const start = pointAt(0);
      ctx.moveTo(start.x, start.y);
      for (let index = 0; index < steps; index += 1) {
        const point = pointAt(index);
        const next = pointAt(index + 1);
        ctx.quadraticCurveTo(point.x, point.y, (point.x + next.x) / 2, (point.y + next.y) / 2);
      }
      ctx.closePath();
      break;
    }
    case 'chat':
      ctx.roundRect(-w / 2, -h / 2, w, h, Math.min(w, h) * 0.28);
      break;
    case 'circleSpeech':
    case 'telepathy':
    case 'speed':
      ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
      break;
    default:
      ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
  }
}

function drawEmphasisRays(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  stroke: string,
  lineWidth: number
) {
  ctx.save();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = Math.max(1.5, lineWidth);
  ctx.lineCap = 'round';
  for (let index = 0; index < 12; index += 1) {
    const angle = (index * Math.PI * 2) / 12;
    const innerX = Math.cos(angle) * w * 0.38;
    const innerY = Math.sin(angle) * h * 0.37;
    const outerX = Math.cos(angle) * w * 0.46;
    const outerY = Math.sin(angle) * h * 0.48;
    ctx.beginPath();
    ctx.moveTo(innerX, innerY);
    ctx.lineTo(outerX, outerY);
    ctx.stroke();
  }
  ctx.restore();
}

function getTailPoints(bubble: Bubble, w: number, h: number, ellipse: boolean) {
  const horizontal = bubble.tail === 'left' || bubble.tail === 'right';
  const sign = bubble.tail === 'top' || bubble.tail === 'left' ? -1 : 1;
  const position = Math.max(-0.6, Math.min(0.6, bubble.tailPosition ?? 0));
  const halfWidth = ((horizontal ? h : w) * (bubble.tailWidth ?? 0.24)) / 2;
  const size = Math.min(w, h) * bubble.tailLength;

  if (horizontal) {
    const center = (position * h) / 2;
    const top = Math.max(-h * 0.46, center - halfWidth);
    const bottom = Math.min(h * 0.46, center + halfWidth);
    const edgeAt = (y: number) =>
      ellipse ? ((sign * w) / 2) * Math.sqrt(1 - (y / (h / 2)) ** 2) : sign * (w / 2 - 4);
    return {
      first: { x: edgeAt(top), y: top },
      second: { x: edgeAt(bottom), y: bottom },
      tip: { x: sign * (w / 2 + size * 1.7), y: center + size * 0.55 },
    };
  }

  const center = (position * w) / 2;
  const left = Math.max(-w * 0.46, center - halfWidth);
  const right = Math.min(w * 0.46, center + halfWidth);
  const edgeAt = (x: number) =>
    ellipse ? ((sign * h) / 2) * Math.sqrt(1 - (x / (w / 2)) ** 2) : sign * (h / 2 - 4);
  return {
    first: { x: left, y: edgeAt(left) },
    second: { x: right, y: edgeAt(right) },
    tip: { x: center + size * 0.75, y: sign * (h / 2 + size * 1.7) },
  };
}

function ellipseWithTailPath(ctx: CanvasRenderingContext2D, bubble: Bubble, w: number, h: number) {
  const { first, second, tip } = getTailPoints(bubble, w, h, true);
  const firstAngle = Math.atan2(first.y / (h / 2), first.x / (w / 2));
  const secondAngle = Math.atan2(second.y / (h / 2), second.x / (w / 2));
  const clockwiseSweep = (secondAngle - firstAngle + Math.PI * 2) % (Math.PI * 2);
  ctx.beginPath();
  ctx.moveTo(first.x, first.y);
  ctx.ellipse(0, 0, w / 2, h / 2, 0, firstAngle, secondAngle, clockwiseSweep < Math.PI);
  ctx.lineTo(tip.x, tip.y);
  ctx.closePath();
}

function drawThoughtDots(ctx: CanvasRenderingContext2D, bubble: Bubble, w: number, h: number) {
  const horizontal = bubble.tail === 'left' || bubble.tail === 'right';
  const sign = bubble.tail === 'top' || bubble.tail === 'left' ? -1 : 1;
  const size = Math.min(w, h) * bubble.tailLength;
  for (let i = 0; i < 3; i += 1) {
    const distance = (horizontal ? w : h) / 2 + size * (i + 0.45);
    ctx.beginPath();
    ctx.arc(
      horizontal ? distance * sign : w * 0.17,
      horizontal ? h * 0.17 : distance * sign,
      size * (0.32 - i * 0.08),
      0,
      Math.PI * 2
    );
    ctx.fill();
    if (bubble.strokeWidth > 0) ctx.stroke();
  }
}

function drawSpeedLines(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  ctx.shadowBlur = 0;
  ctx.setLineDash([]);
  ctx.lineWidth = Math.max(1.5, ctx.lineWidth * 0.65);
  ctx.lineCap = 'round';
  for (let index = 0; index < 18; index += 1) {
    const angle = (index * Math.PI * 2) / 18;
    const inner = 0.54 + (index % 3) * 0.025;
    const outer = 0.66 + (index % 4) * 0.025;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * w * inner, Math.sin(angle) * h * inner);
    ctx.lineTo(Math.cos(angle) * w * outer, Math.sin(angle) * h * outer);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTelepathyRing(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  ctx.shadowBlur = 0;
  ctx.setLineDash([ctx.lineWidth * 2, ctx.lineWidth * 2]);
  ctx.lineWidth = Math.max(1, ctx.lineWidth * 0.6);
  ctx.beginPath();
  ctx.ellipse(0, 0, Math.max(1, w / 2 - 11), Math.max(1, h / 2 - 11), 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawBodyAndTail(ctx: CanvasRenderingContext2D, bubble: Bubble, w: number, h: number) {
  const hasTail = bubble.tail !== 'none' && bubble.shape !== 'thought';
  if (bubble.shape === 'speed') drawSpeedLines(ctx, w, h);
  if (hasTail && ['oval', 'circleSpeech', 'whisper', 'speed'].includes(bubble.shape)) {
    ellipseWithTailPath(ctx, bubble, w, h);
    ctx.fill();
    if (bubble.strokeWidth > 0) ctx.stroke();
    return;
  }

  bubblePath(ctx, bubble.shape, w, h);
  ctx.fill();
  if (!hasTail) {
    if (bubble.strokeWidth > 0) ctx.stroke();
    if (bubble.shape === 'thought' && bubble.tail !== 'none') drawThoughtDots(ctx, bubble, w, h);
    if (bubble.shape === 'telepathy' && bubble.strokeWidth > 0) drawTelepathyRing(ctx, w, h);
    return;
  }

  const { first, second, tip } = getTailPoints(bubble, w, h, false);
  if (bubble.strokeWidth > 0) {
    const pad = Math.max(ctx.lineWidth * 2, 4);
    ctx.save();
    ctx.beginPath();
    ctx.rect(-w, -h, w * 2, h * 2);
    if (bubble.tail === 'top' || bubble.tail === 'bottom') {
      const y = bubble.tail === 'bottom' ? h * 0.28 : -h * 0.62;
      ctx.rect(first.x - pad, y, second.x - first.x + pad * 2, h * 0.34);
    } else {
      const x = bubble.tail === 'right' ? w * 0.28 : -w * 0.62;
      ctx.rect(x, first.y - pad, w * 0.34, second.y - first.y + pad * 2);
    }
    ctx.clip('evenodd');
    bubblePath(ctx, bubble.shape, w, h);
    ctx.stroke();
    ctx.restore();
  }
  ctx.beginPath();
  ctx.moveTo(first.x, first.y);
  if (bubble.shape === 'radio') {
    ctx.lineTo(
      first.x + (tip.x - first.x) * 0.42 + (second.x - first.x) * 0.22,
      first.y + (tip.y - first.y) * 0.42 + (second.y - first.y) * 0.22
    );
    ctx.lineTo(
      first.x + (tip.x - first.x) * 0.68 - (second.x - first.x) * 0.12,
      first.y + (tip.y - first.y) * 0.68 - (second.y - first.y) * 0.12
    );
  }
  ctx.lineTo(tip.x, tip.y);
  ctx.lineTo(second.x, second.y);
  ctx.closePath();
  ctx.fill();
  if (bubble.strokeWidth > 0) {
    ctx.beginPath();
    ctx.moveTo(first.x, first.y);
    if (bubble.shape === 'radio') {
      ctx.lineTo(
        first.x + (tip.x - first.x) * 0.42 + (second.x - first.x) * 0.22,
        first.y + (tip.y - first.y) * 0.42 + (second.y - first.y) * 0.22
      );
      ctx.lineTo(
        first.x + (tip.x - first.x) * 0.68 - (second.x - first.x) * 0.12,
        first.y + (tip.y - first.y) * 0.68 - (second.y - first.y) * 0.12
      );
    }
    ctx.lineTo(tip.x, tip.y);
    ctx.lineTo(second.x, second.y);
    ctx.stroke();
  }
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  text.split('\n').forEach((paragraph) => {
    if (!paragraph) {
      lines.push('');
      return;
    }
    let line = '';
    Array.from(paragraph).forEach((char) => {
      if (line && ctx.measureText(line + char).width > maxWidth) {
        lines.push(line);
        line = char;
      } else line += char;
    });
    lines.push(line);
  });
  return lines;
}

export function drawWebtoonCanvas(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement | null,
  background: string,
  bubbles: Bubble[],
  selectedId?: string
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const { width, height } = canvas;
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);
  if (image) ctx.drawImage(image, 0, 0, width, height);

  bubbles.forEach((bubble) => {
    const w = bubble.width * width;
    const h = bubble.height * width;
    const asset = getImageBubbleAsset(bubble.shape);
    ctx.save();
    ctx.translate(bubble.x * width, bubble.y * height);
    ctx.rotate((bubble.rotation * Math.PI) / 180);
    ctx.globalAlpha = bubble.opacity / 100;
    ctx.save();
    ctx.scale(bubble.flipX ? -1 : 1, bubble.flipY ? -1 : 1);
    ctx.fillStyle = bubble.fill;
    ctx.strokeStyle = bubble.stroke;
    ctx.lineWidth = Math.max(1, (bubble.strokeWidth * width) / 900);
    ctx.lineJoin = 'round';
    if (bubble.shadowBlur > 0) {
      ctx.shadowColor = bubble.shadowColor ?? '#555555';
      ctx.shadowBlur = (bubble.shadowBlur * width) / 900;
      ctx.shadowOffsetY = (2 * width) / 900;
    }
    if (asset) {
      const assetImage = imageBubbleCache.get(asset.id);
      if (assetImage?.complete && assetImage.naturalWidth > 0)
        ctx.drawImage(assetImage, -w / 2, -h / 2, w, h);
    } else if (isTextOnlyShape(bubble.shape)) {
      if (bubble.shape === 'emphasisText')
        drawEmphasisRays(ctx, w, h, bubble.textColor, (2 * width) / 900);
    } else {
      const borderStyle = bubble.borderStyle ?? (bubble.shape === 'whisper' ? 'dashed' : 'solid');
      if (borderStyle === 'dashed') ctx.setLineDash([ctx.lineWidth * 4, ctx.lineWidth * 3]);
      if (borderStyle === 'dotted') ctx.setLineDash([ctx.lineWidth, ctx.lineWidth * 2]);
      drawBodyAndTail(ctx, bubble, w, h);
    }
    ctx.restore();

    const fontSize = Math.max(8, (bubble.fontSize * width) / 900);
    ctx.font = `${bubble.italic ? 'italic ' : ''}${bubble.fontWeight} ${fontSize}px ${bubble.fontFamily}`;
    ctx.fillStyle = bubble.textColor;
    ctx.textAlign = bubble.textAlign;
    ctx.textBaseline = 'middle';
    const padding = isTextOnlyShape(bubble.shape)
      ? 0.04
      : ['burst', 'spiky', 'star', 'diamond', 'heart'].includes(bubble.shape)
        ? 0.25
        : 0.14;
    const maxWidth = w * (asset?.textWidth ?? 1 - padding * 2);
    const textHeight = h * (asset?.textHeight ?? 0.86);
    const textCenterY = h * (asset?.textY ?? 0);
    const lines = wrapText(ctx, bubble.text, maxWidth);
    const lineHeight = fontSize * bubble.lineHeight;
    const visibleLines = lines.slice(0, Math.max(1, Math.floor(textHeight / lineHeight)));
    const startY = textCenterY - ((visibleLines.length - 1) * lineHeight) / 2;
    const textX =
      bubble.textAlign === 'left' ? -maxWidth / 2 : bubble.textAlign === 'right' ? maxWidth / 2 : 0;
    ctx.save();
    ctx.beginPath();
    ctx.rect(-maxWidth / 2, textCenterY - textHeight / 2, maxWidth, textHeight);
    ctx.clip();
    visibleLines.forEach((line, index) => {
      if (bubble.letterSpacing && 'letterSpacing' in ctx)
        ctx.letterSpacing = `${(bubble.letterSpacing * width) / 900}px`;
      if (bubble.textStrokeWidth > 0) {
        ctx.strokeStyle = bubble.textStrokeColor;
        ctx.lineWidth = (bubble.textStrokeWidth * width) / 900;
        ctx.lineJoin = 'round';
        ctx.strokeText(line, textX, startY + index * lineHeight);
      }
      ctx.fillText(line, textX, startY + index * lineHeight);
    });
    ctx.restore();

    ctx.restore();
  });

  const selected = bubbles.find((bubble) => bubble.id === selectedId);
  if (!selected) return;

  const w = selected.width * width;
  const h = selected.height * width;
  const handleSize = Math.max(10, width * 0.018);
  ctx.save();
  ctx.translate(selected.x * width, selected.y * height);
  ctx.rotate((selected.rotation * Math.PI) / 180);
  ctx.strokeStyle = '#2f80ed';
  ctx.lineWidth = Math.max(2, width / 450);
  ctx.setLineDash([width / 120, width / 180]);
  ctx.strokeRect(
    -w / 2 - RESIZE_HANDLE_OFFSET,
    -h / 2 - RESIZE_HANDLE_OFFSET,
    w + RESIZE_HANDLE_OFFSET * 2,
    h + RESIZE_HANDLE_OFFSET * 2
  );
  ctx.setLineDash([]);
  RESIZE_HANDLES.forEach(({ x, y }) => {
    const handleX = x * (w / 2 + RESIZE_HANDLE_OFFSET);
    const handleY = y * (h / 2 + RESIZE_HANDLE_OFFSET);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(handleX - handleSize / 2, handleY - handleSize / 2, handleSize, handleSize);
    ctx.strokeStyle = '#2f80ed';
    ctx.strokeRect(handleX - handleSize / 2, handleY - handleSize / 2, handleSize, handleSize);
  });
  ctx.restore();
}
