import type { NewsCaptionConfig } from 'src/sections/photo/utils/news-caption-presets';

import {
  getElementBounds,
  renderNewsCaptionOverlay,
} from 'src/sections/photo/utils/news-caption-renderer';

import { IMAGE_BUBBLE_ASSETS } from './bubble-assets';
import { NEWS_BUBBLE_STYLES, createNewsBubbleConfig } from './news-caption-bubbles';

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
  { id: 'captionHuman', label: '다큐 자막' },
  { id: 'captionKbs', label: 'KBS 9시 뉴스' },
  { id: 'captionMbc', label: 'MBC 뉴스데스크' },
  { id: 'captionSbs', label: 'SBS 8 뉴스' },
  { id: 'captionJtbc', label: 'JTBC 뉴스룸' },
  { id: 'captionYtn', label: 'YTN 24시 속보' },
  { id: 'captionCnn', label: 'CNN 글로벌 속보' },
  { id: 'captionInvestigative', label: '시사 탐사 다큐' },
  { id: 'captionVarietyNews', label: '예능 인터뷰 밈' },
  { id: 'captionNews', label: '뉴스 하단 자막' },
  { id: 'captionBreaking', label: '속보 배너' },
  { id: 'captionVariety', label: '예능 강조 자막' },
  { id: 'captionYouTube', label: '유튜브형 자막' },
  ...IMAGE_BUBBLE_ASSETS,
] as const;

export type BubbleShape = (typeof BUBBLE_SHAPES)[number]['id'];
export type ImageBubbleAsset = (typeof IMAGE_BUBBLE_ASSETS)[number];
export type TailDirection = 'bottom' | 'top' | 'left' | 'right' | 'none';
export type BorderStyle = 'solid' | 'dashed' | 'dotted';
export const CAPTION_SHAPES = [
  'captionHuman',
  ...NEWS_BUBBLE_STYLES.slice(1).map(({ shape }) => shape),
  'captionNews',
  'captionBreaking',
  'captionVariety',
  'captionYouTube',
] as const;
export const TEXT_ONLY_SHAPES: BubbleShape[] = [
  'titleText',
  'emphasisText',
  'outlinedText',
  'captionHuman',
];

export function isCaptionShape(shape: BubbleShape) {
  return CAPTION_SHAPES.some((captionShape) => captionShape === shape);
}

export function isTextOnlyShape(shape: BubbleShape) {
  return TEXT_ONLY_SHAPES.includes(shape);
}

export function getImageBubbleAsset(shape: BubbleShape): ImageBubbleAsset | undefined {
  return IMAGE_BUBBLE_ASSETS.find((asset) => asset.id === shape);
}

const imageBubbleCache = new Map<string, HTMLImageElement>();
const imageBubbleLoads = new Map<string, Promise<void>>();

export async function preloadImageBubbleAssets(shapes: readonly BubbleShape[]): Promise<void> {
  await Promise.all(
    IMAGE_BUBBLE_ASSETS.filter((asset) => shapes.includes(asset.id)).map((asset) => {
      const pending = imageBubbleLoads.get(asset.id);
      if (pending) return pending;
      const loading = new Promise<void>((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          imageBubbleCache.set(asset.id, image);
          resolve();
        };
        image.onerror = () => {
          imageBubbleLoads.delete(asset.id);
          reject(new Error(`${asset.file} 파일을 불러오지 못했습니다.`));
        };
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
  backgroundOpacity: number;
  cornerRadius: number;
  accentColor: string;
  badgeVisible: boolean;
  badgeText: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  italic: boolean;
  textColor: string;
  textStrokeColor: string;
  textStrokeWidth: number;
  textShadowBlur: number;
  textShadowColor: string;
  textAlign: CanvasTextAlign;
  lineHeight: number;
  letterSpacing: number;
  newsConfig?: NewsCaptionConfig;
}

export function createBubble(shape: BubbleShape, count: number): Bubble {
  const asset = getImageBubbleAsset(shape);
  const caption = isCaptionShape(shape);
  const base: Bubble = {
    id: crypto.randomUUID(),
    shape,
    text:
      shape === 'captionNews'
        ? '오늘의 주요 소식'
        : shape === 'captionBreaking'
          ? '긴급 속보를 입력하세요'
          : shape === 'captionYouTube'
            ? '자막을 입력하세요'
            : shape === 'captionHuman'
              ? '그날의 이야기가 시작됐다'
              : shape === 'captionVariety'
                ? '지금 이 순간!'
                : shape === 'thought'
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
    x: caption ? 0.5 : Math.min(0.5 + (count % 4) * 0.055, 0.75),
    y: caption
      ? Math.min(0.78 + (count % 4) * 0.025, 0.88)
      : Math.min((shape === 'titleText' ? 0.16 : 0.3) + (count % 4) * 0.055, 0.75),
    width:
      (caption ? (shape === 'captionYouTube' ? 0.66 : 0.82) : asset?.width) ??
      (shape === 'titleText'
        ? 0.9
        : shape === 'outlinedText'
          ? 0.6
          : shape === 'circleSpeech'
            ? 0.33
            : 0.42),
    height: caption
      ? shape === 'captionHuman'
        ? 0.17
        : 0.14
      : asset
        ? asset.width / asset.aspect
        : shape === 'titleText'
          ? 0.3
          : shape === 'circleSpeech'
            ? 0.33
            : 0.25,
    rotation: 0,
    tail: caption
      ? 'none'
      : asset
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
      shape === 'captionNews'
        ? '#102849'
        : shape === 'captionBreaking'
          ? '#111827'
          : shape === 'captionVariety'
            ? '#ffe14a'
            : shape === 'captionYouTube'
              ? '#000000'
              : shape === 'circleSpeech'
                ? '#fff2b5'
                : shape === 'chat'
                  ? '#bfe6ff'
                  : shape === 'telepathy'
                    ? '#f3eaff'
                    : shape === 'radio'
                      ? '#e9f5ff'
                      : '#ffffff',
    stroke: shape === 'radio' ? '#16406c' : '#171717',
    strokeWidth: isTextOnlyShape(shape) || caption || shape === 'chat' || asset ? 0 : 3,
    borderStyle: shape === 'whisper' ? 'dashed' : 'solid',
    shadowBlur: 0,
    shadowColor: '#555555',
    opacity: 100,
    backgroundOpacity:
      shape === 'captionYouTube' ? 78 : shape === 'captionHuman' ? 0 : caption ? 96 : 100,
    cornerRadius: shape === 'captionYouTube' ? 14 : shape === 'captionVariety' ? 18 : 0,
    accentColor: shape === 'captionBreaking' ? '#ef4444' : '#e53935',
    badgeVisible: shape === 'captionNews' || shape === 'captionBreaking',
    badgeText: shape === 'captionBreaking' ? '속보' : 'NEWS',
    fontFamily:
      shape === 'captionHuman'
        ? '"Nanum Myeongjo", "Batang", serif'
        : caption
          ? '"Malgun Gothic", "Noto Sans KR", sans-serif'
          : shape === 'circleSpeech'
            ? '"Malgun Gothic", sans-serif'
            : '"JalnanGothic", sans-serif',
    fontSize: caption
      ? shape === 'captionHuman'
        ? 43
        : 39
      : shape === 'titleText'
        ? 95
        : shape === 'outlinedText'
          ? 50
          : shape === 'circleSpeech' || shape === 'emphasisText'
            ? 42
            : asset
              ? 30
              : 34,
    fontWeight:
      shape === 'captionYouTube' || shape === 'captionHuman'
        ? 700
        : caption || shape === 'titleText'
          ? 900
          : shape === 'circleSpeech'
            ? 500
            : 700,
    italic: shape === 'radio' || shape === 'telepathy',
    textColor:
      shape === 'outlinedText' || shape === 'assetPink' || (caption && shape !== 'captionVariety')
        ? '#ffffff'
        : '#171717',
    textStrokeColor: shape === 'outlinedText' ? '#555555' : '#000000',
    textStrokeWidth: shape === 'outlinedText' ? 7 : shape === 'captionHuman' ? 5 : 0,
    textShadowBlur: shape === 'captionHuman' ? 5 : 0,
    textShadowColor: '#000000',
    textAlign: 'center',
    lineHeight: shape === 'titleText' ? 1.1 : 1.25,
    letterSpacing: 0,
  };
  const newsConfig = createNewsBubbleConfig(shape);
  if (!newsConfig) return base;
  return {
    ...base,
    text: newsConfig.headline || base.text,
    x: 0.5,
    y: 0.5,
    width: 1,
    height: 1,
    newsConfig,
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

function drawCaptionBackground(
  ctx: CanvasRenderingContext2D,
  bubble: Bubble,
  w: number,
  h: number,
  scale: number
) {
  if (bubble.shape === 'captionHuman') return;

  const radius = Math.min(Math.max(0, bubble.cornerRadius) * scale, h / 2);
  ctx.save();
  ctx.globalAlpha *= Math.max(0, Math.min(100, bubble.backgroundOpacity)) / 100;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, radius);
  ctx.fill();
  if (bubble.strokeWidth > 0) ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = bubble.accentColor;
  if (bubble.shape === 'captionNews') {
    ctx.fillRect(-w / 2, -h / 2, w, Math.max(3 * scale, h * 0.055));
  } else if (bubble.shape === 'captionBreaking') {
    ctx.fillRect(-w / 2, -h / 2, w, Math.max(5 * scale, h * 0.1));
  } else if (bubble.shape === 'captionVariety') {
    ctx.fillRect(-w / 2, -h / 2, Math.max(5 * scale, w * 0.015), h);
  }

  if (
    (bubble.shape === 'captionNews' || bubble.shape === 'captionBreaking') &&
    bubble.badgeVisible &&
    bubble.badgeText.trim()
  ) {
    const badgeW = w * 0.19;
    const badgeH = h * 0.58;
    const badgeX = -w / 2 + w * 0.025;
    ctx.beginPath();
    ctx.roundRect(badgeX, -badgeH / 2, badgeW, badgeH, Math.min(7 * scale, badgeH / 4));
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 ${Math.max(11, Math.min(badgeH * 0.46, 22 * scale))}px "Malgun Gothic", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(bubble.badgeText, badgeX + badgeW / 2, 0, badgeW * 0.86);
  }
  ctx.restore();
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
    if (bubble.newsConfig) {
      ctx.translate(-w / 2, -h / 2);
      renderNewsCaptionOverlay(ctx, w, h, bubble.newsConfig);
      if (selectedId === bubble.id && bubble.newsConfig.selectedElementId) {
        const bounds = getElementBounds(w, h, bubble.newsConfig)[
          bubble.newsConfig.selectedElementId
        ];
        if (bounds) {
          const handleSize = Math.max(10, width * 0.018);
          ctx.strokeStyle = '#2f80ed';
          ctx.lineWidth = Math.max(2, width / 450);
          ctx.setLineDash([6, 4]);
          ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
          ctx.setLineDash([]);
          RESIZE_HANDLES.forEach(({ x, y }) => {
            const handleX = bounds.x + ((x + 1) * bounds.width) / 2;
            const handleY = bounds.y + ((y + 1) * bounds.height) / 2;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(
              handleX - handleSize / 2,
              handleY - handleSize / 2,
              handleSize,
              handleSize
            );
            ctx.strokeRect(
              handleX - handleSize / 2,
              handleY - handleSize / 2,
              handleSize,
              handleSize
            );
          });
        }
      }
      ctx.restore();
      return;
    }
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
    } else if (isCaptionShape(bubble.shape)) {
      drawCaptionBackground(ctx, bubble, w, h, width / 900);
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
    const caption = isCaptionShape(bubble.shape);
    const hasBadge =
      caption &&
      (bubble.shape === 'captionNews' || bubble.shape === 'captionBreaking') &&
      bubble.badgeVisible &&
      bubble.badgeText.trim();
    const padding = isTextOnlyShape(bubble.shape)
      ? 0.04
      : ['burst', 'spiky', 'star', 'diamond', 'heart'].includes(bubble.shape)
        ? 0.25
        : 0.14;
    const textLeft = hasBadge ? -w * 0.265 : -w * (caption ? 0.43 : 0.5 - padding);
    const textRight = w * (caption ? 0.43 : 0.5 - padding);
    const textBoxX = caption ? (textLeft + textRight) / 2 : 0;
    const maxWidth = caption ? textRight - textLeft : w * (asset?.textWidth ?? 1 - padding * 2);
    const textHeight = h * (caption ? 0.8 : (asset?.textHeight ?? 0.86));
    const textCenterY = h * (asset?.textY ?? 0);
    const lines = wrapText(ctx, bubble.text, maxWidth);
    const lineHeight = fontSize * bubble.lineHeight;
    const visibleLines = lines.slice(0, Math.max(1, Math.floor(textHeight / lineHeight)));
    const startY = textCenterY - ((visibleLines.length - 1) * lineHeight) / 2;
    const textX =
      textBoxX +
      (bubble.textAlign === 'left'
        ? -maxWidth / 2
        : bubble.textAlign === 'right'
          ? maxWidth / 2
          : 0);
    ctx.save();
    ctx.beginPath();
    ctx.rect(textBoxX - maxWidth / 2, textCenterY - textHeight / 2, maxWidth, textHeight);
    ctx.clip();
    if (bubble.textShadowBlur > 0) {
      ctx.shadowColor = bubble.textShadowColor;
      ctx.shadowBlur = (bubble.textShadowBlur * width) / 900;
      ctx.shadowOffsetY = (2 * width) / 900;
    }
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
  if (selected.newsConfig) return;

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
