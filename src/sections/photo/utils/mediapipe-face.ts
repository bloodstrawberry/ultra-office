'use client';

// ----------------------------------------------------------------------
// Interfaces & Types
// ----------------------------------------------------------------------

export interface FaceLandmarkPoint {
  x: number; // pixel coords on canvas
  y: number;
}

export interface MediaPipeFaceDetection {
  id: string;
  box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  leftEye?: FaceLandmarkPoint;
  rightEye?: FaceLandmarkPoint;
  noseTip?: FaceLandmarkPoint;
  mouthCenter?: FaceLandmarkPoint;
  leftEar?: FaceLandmarkPoint;
  rightEar?: FaceLandmarkPoint;
  confidence: number;
  isMosaiced: boolean;
}

export interface EyeBarRegion {
  cx: number;
  cy: number;
  width: number;
  height: number;
  angle: number; // radians
}

export type AutoMaskType = 'face-pixelate' | 'face-blur' | 'face-blackout' | 'eye-bar' | 'emoji';

export const EMOJI_STICKER_OPTIONS = [
  { id: 'sunglasses', label: '😎 선글라스', emoji: '😎' },
  { id: 'cat', label: '🐱 고양이', emoji: '🐱' },
  { id: 'dog', label: '🐶 강아지', emoji: '🐶' },
  { id: 'bear', label: '🐻 곰돌이', emoji: '🐻' },
  { id: 'robot', label: '🤖 로봇', emoji: '🤖' },
  { id: 'flower', label: '🌸 벚꽃', emoji: '🌸' },
  { id: 'mask', label: '😷 마스크', emoji: '😷' },
  { id: 'clown', label: '🤡 삐에로', emoji: '🤡' },
  { id: 'sparkles', label: '✨ 반짝이', emoji: '✨' },
];

// ----------------------------------------------------------------------
// Singleton Detector Cache
// ----------------------------------------------------------------------

let faceDetectorInstance: any = null;
let isInitializing = false;
let initPromise: Promise<any> | null = null;

/**
 * Initialize MediaPipe FaceDetector Singleton
 */
export async function getMediaPipeFaceDetector(): Promise<any> {
  if (faceDetectorInstance) return faceDetectorInstance;
  if (isInitializing && initPromise) return initPromise;

  isInitializing = true;
  initPromise = (async () => {
    try {
      // Dynamic import to prevent SSR loading issues
      // eslint-disable-next-line import/no-unresolved
      const vision = (await import('@mediapipe/tasks-vision')) as any;
      const { FilesetResolver, FaceDetector } = vision;

      const wasmFileset = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      const detector = await FaceDetector.createFromOptions(wasmFileset, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
          delegate: 'GPU',
        },
        runningMode: 'IMAGE',
        minDetectionConfidence: 0.35,
      });

      faceDetectorInstance = detector;
      isInitializing = false;
      return detector;
    } catch (err) {
      isInitializing = false;
      console.warn('MediaPipe GPU FaceDetector initialization failed, retrying with CPU...', err);
      try {
        // eslint-disable-next-line import/no-unresolved
        const vision = (await import('@mediapipe/tasks-vision')) as any;
        const { FilesetResolver, FaceDetector } = vision;
        const wasmFileset = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        const detector = await FaceDetector.createFromOptions(wasmFileset, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
            delegate: 'CPU',
          },
          runningMode: 'IMAGE',
          minDetectionConfidence: 0.35,
        });
        faceDetectorInstance = detector;
        return detector;
      } catch (cpuErr) {
        console.error('MediaPipe CPU FaceDetector initialization failed:', cpuErr);
        throw cpuErr;
      }
    }
  })();

  return initPromise;
}

/**
 * Detect faces in canvas or image using MediaPipe BlazeFace
 */
export async function detectFacesWithMediaPipe(
  imageOrCanvas: HTMLImageElement | HTMLCanvasElement
): Promise<MediaPipeFaceDetection[]> {
  const detector = await getMediaPipeFaceDetector();
  const result = detector.detect(imageOrCanvas);

  const imgW =
    'naturalWidth' in imageOrCanvas
      ? imageOrCanvas.naturalWidth || imageOrCanvas.width
      : imageOrCanvas.width;
  const imgH =
    'naturalHeight' in imageOrCanvas
      ? imageOrCanvas.naturalHeight || imageOrCanvas.height
      : imageOrCanvas.height;

  const detectedFaces: MediaPipeFaceDetection[] = [];

  if (result?.detections && result.detections.length > 0) {
    result.detections.forEach((det: any, idx: number) => {
      const bbox = det.boundingBox;
      if (!bbox) return;

      // Expand box slightly (15%) for full hair/chin coverage
      const paddingX = bbox.width * 0.12;
      const paddingY = bbox.height * 0.15;

      const x = Math.max(0, Math.round(bbox.originX - paddingX));
      const y = Math.max(0, Math.round(bbox.originY - paddingY));
      const width = Math.min(imgW - x, Math.round(bbox.width + paddingX * 2));
      const height = Math.min(imgH - y, Math.round(bbox.height + paddingY * 2));

      // Keypoints: 0 = right eye, 1 = left eye, 2 = nose tip, 3 = mouth center, 4 = right ear, 5 = left ear
      const keypoints = det.keypoints || [];
      const getPt = (kIdx: number): FaceLandmarkPoint | undefined => {
        const kp = keypoints[kIdx];
        if (!kp) return undefined;
        return {
          x: Math.round(kp.x * imgW),
          y: Math.round(kp.y * imgH),
        };
      };

      detectedFaces.push({
        id: `mediapipe-face-${idx}-${Date.now()}`,
        box: { x, y, width, height },
        rightEye: getPt(0),
        leftEye: getPt(1),
        noseTip: getPt(2),
        mouthCenter: getPt(3),
        rightEar: getPt(4),
        leftEar: getPt(5),
        confidence: det.categories?.[0]?.score || 0.9,
        isMosaiced: true,
      });
    });
  }

  return detectedFaces;
}

/**
 * Calculate Eye Bar (Censor Bar) geometry from face keypoints
 */
export function calculateEyeBar(face: MediaPipeFaceDetection): EyeBarRegion {
  const { box, leftEye, rightEye } = face;

  if (leftEye && rightEye) {
    const cx = (leftEye.x + rightEye.x) / 2;
    const cy = (leftEye.y + rightEye.y) / 2;
    const dx = leftEye.x - rightEye.x;
    const dy = leftEye.y - rightEye.y;
    const eyeDist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    const width = Math.max(eyeDist * 2.3, box.width * 0.75);
    const height = Math.max(box.height * 0.22, 22);

    return { cx, cy, width, height, angle };
  }

  // Fallback estimation from bounding box
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height * 0.38;
  const width = box.width * 0.85;
  const height = Math.max(box.height * 0.22, 22);

  return { cx, cy, width, height, angle: 0 };
}

/**
 * Apply Eye Censor Bar to canvas
 */
export function drawEyeBarCensor(
  ctx: CanvasRenderingContext2D,
  face: MediaPipeFaceDetection,
  style: 'black' | 'blur' | 'pixelate' = 'black'
): void {
  const bar = calculateEyeBar(face);

  ctx.save();
  ctx.translate(bar.cx, bar.cy);
  if (bar.angle) ctx.rotate(bar.angle);

  const left = -bar.width / 2;
  const top = -bar.height / 2;

  if (style === 'black') {
    ctx.fillStyle = '#000000';
    // Rounded rect for clean broadcast censor look
    ctx.beginPath();
    ctx.roundRect(left, top, bar.width, bar.height, Math.min(6, bar.height / 4));
    ctx.fill();
  } else {
    // Blur or Pixelate Eye bar
    ctx.restore();
    ctx.save();
    // Path clipping
    ctx.translate(bar.cx, bar.cy);
    if (bar.angle) ctx.rotate(bar.angle);
    ctx.beginPath();
    ctx.roundRect(left, top, bar.width, bar.height, 4);
    ctx.clip();

    ctx.restore();
    ctx.save();
    if (style === 'blur') {
      ctx.filter = 'blur(16px)';
      ctx.drawImage(ctx.canvas, 0, 0);
    } else {
      // Pixelate region
      const offscreen = document.createElement('canvas');
      const bs = 12;
      const sw = Math.max(1, Math.round(bar.width / bs));
      const sh = Math.max(1, Math.round(bar.height / bs));
      offscreen.width = sw;
      offscreen.height = sh;
      const offCtx = offscreen.getContext('2d');
      if (offCtx) {
        offCtx.drawImage(
          ctx.canvas,
          bar.cx - bar.width / 2,
          bar.cy - bar.height / 2,
          bar.width,
          bar.height,
          0,
          0,
          sw,
          sh
        );
        ctx.drawImage(
          offscreen,
          0,
          0,
          sw,
          sh,
          bar.cx - bar.width / 2,
          bar.cy - bar.height / 2,
          bar.width,
          bar.height
        );
      }
    }
  }

  ctx.restore();
}

/**
 * Apply Emoji Sticker centered over detected face
 */
export function drawEmojiSticker(
  ctx: CanvasRenderingContext2D,
  face: MediaPipeFaceDetection,
  emoji: string
): void {
  const { box } = face;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const size = Math.round(Math.max(box.width, box.height) * 1.15);

  ctx.save();
  ctx.font = `${size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, cx, cy);
  ctx.restore();
}
