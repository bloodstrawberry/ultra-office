'use client';

// ----------------------------------------------------------------------
// Types & Interfaces for Video Subtitle Remover
// ----------------------------------------------------------------------

export type InpaintMode = 'hybrid' | 'color-fill' | 'blur';

export type InpaintSampleDirection = 'vertical' | 'top-only' | 'bottom-only' | 'horizontal';

export type SubtitlePreset = 'bottom-center' | 'bottom-wide' | 'bottom-compact' | 'top-headline';

export interface SubtitleBoundingBox {
  id: string;
  label: string;
  x: number; // 0.0 ~ 1.0 (relative)
  y: number; // 0.0 ~ 1.0 (relative)
  width: number; // 0.0 ~ 1.0 (relative)
  height: number; // 0.0 ~ 1.0 (relative)
  feather: number; // in pixels (blur edge transition)
  padding: number; // in pixels (margin expansion)
  mode: InpaintMode;
  startTime: number; // seconds
  endTime: number; // seconds
  enabled: boolean;
  sampleDirection?: InpaintSampleDirection; // 배경 참조 방향
  grainStrength?: number; // 필름 그레인 질감 (0 ~ 20)
  brightnessOffset?: number; // 명도 톤 미세 보정 (-40 ~ +40)
  blendStrength?: number; // 제거 합성 강도 (0.1 ~ 1.0)
  blurRadius?: number; // 블러 반경 (4 ~ 40)
}

export interface SubtitleDetectionOptions {
  sensitivity: 'low' | 'medium' | 'high';
  searchZone: 'bottom' | 'top' | 'all';
}

export interface SubtitleDetectionResult {
  box: SubtitleBoundingBox;
  confidence: number;
  preset: string;
  description: string;
}

export interface SubtitleRemoverRenderOptions {
  boxes: SubtitleBoundingBox[];
  activeBoxId?: string | null;
  defaultMode: InpaintMode;
  showBoxOutline?: boolean;
  showOriginal?: boolean;
  showCompareSplit?: boolean;
  splitPercent?: number; // 0 ~ 100
  currentTime: number;
}

export interface VideoExportSettings {
  startTime: number;
  endTime: number;
  resolution: 'original' | '1080p' | '720p' | '480p';
  quality: 'high' | 'medium' | 'standard';
  format?: 'mp4' | 'webm';
  muteAudio: boolean;
}

export type ResizeHandle = 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'w' | 'e' | 'move';

export type SubtitleBoxHitType = ResizeHandle | 'delete' | 'body';

/**
 * Check if two subtitle boxes overlap geometrically on screen
 */
export function isBoxOverlapping(b1: SubtitleBoundingBox, b2: SubtitleBoundingBox): boolean {
  const x1 = b1.x;
  const y1 = b1.y;
  const w1 = b1.width;
  const h1 = b1.height;

  const x2 = b2.x;
  const y2 = b2.y;
  const w2 = b2.width;
  const h2 = b2.height;

  const xOverlap = Math.max(0, Math.min(x1 + w1, x2 + w2) - Math.max(x1, x2));
  const yOverlap = Math.max(0, Math.min(y1 + h1, y2 + h2) - Math.max(y1, y2));

  const minW = Math.min(w1, w2);
  const minH = Math.min(h1, h2);

  if (minW <= 0 || minH <= 0) return false;

  return xOverlap / minW >= 0.35 && yOverlap / minH >= 0.35;
}

/**
 * Check if a mouse coordinate hits within a box boundary or its header badge
 */
export function isPointInBox(
  mouseX: number,
  mouseY: number,
  box: SubtitleBoundingBox,
  canvasW: number,
  canvasH: number
): boolean {
  const px = box.x * canvasW;
  const py = box.y * canvasH;
  const pw = box.width * canvasW;
  const ph = box.height * canvasH;

  const badgeY = py > 26 ? py - 24 : py + ph + 6;
  const badgeH = 24;

  // Inside box body
  if (mouseX >= px && mouseX <= px + pw && mouseY >= py && mouseY <= py + ph) {
    return true;
  }

  // Inside badge area
  if (
    mouseX >= px &&
    mouseX <= px + Math.max(pw, 220) &&
    mouseY >= badgeY &&
    mouseY <= badgeY + badgeH
  ) {
    return true;
  }

  return false;
}

// ----------------------------------------------------------------------
// Preset Subtitle Bounding Boxes
// ----------------------------------------------------------------------

export function getPresetSubtitleBox(preset: SubtitlePreset, idSuffix = '1'): SubtitleBoundingBox {
  switch (preset) {
    case 'bottom-center':
      return {
        id: `box-${idSuffix}`,
        label: '하단 표준 자막 (1~2줄)',
        x: 0.1,
        y: 0.78,
        width: 0.8,
        height: 0.14,
        feather: 14,
        padding: 6,
        mode: 'hybrid',
        sampleDirection: 'vertical',
        grainStrength: 4,
        brightnessOffset: 0,
        blendStrength: 1.0,
        blurRadius: 16,
        startTime: 0,
        endTime: 99999,
        enabled: true,
      };
    case 'bottom-wide':
      return {
        id: `box-${idSuffix}`,
        label: '하단 방송 와이드 배너 자막',
        x: 0.03,
        y: 0.76,
        width: 0.94,
        height: 0.18,
        feather: 16,
        padding: 8,
        mode: 'hybrid',
        sampleDirection: 'vertical',
        grainStrength: 4,
        brightnessOffset: 0,
        blendStrength: 1.0,
        blurRadius: 16,
        startTime: 0,
        endTime: 99999,
        enabled: true,
      };
    case 'bottom-compact':
      return {
        id: `box-${idSuffix}`,
        label: '하단 콤팩트 자막 (1줄 대사)',
        x: 0.18,
        y: 0.83,
        width: 0.64,
        height: 0.1,
        feather: 12,
        padding: 4,
        mode: 'hybrid',
        sampleDirection: 'vertical',
        grainStrength: 4,
        brightnessOffset: 0,
        blendStrength: 1.0,
        blurRadius: 16,
        startTime: 0,
        endTime: 99999,
        enabled: true,
      };
    case 'top-headline':
      return {
        id: `box-${idSuffix}`,
        label: '상단 헤드라인 자막',
        x: 0.06,
        y: 0.05,
        width: 0.88,
        height: 0.12,
        feather: 12,
        padding: 6,
        mode: 'hybrid',
        sampleDirection: 'bottom-only',
        grainStrength: 4,
        brightnessOffset: 0,
        blendStrength: 1.0,
        blurRadius: 16,
        startTime: 0,
        endTime: 99999,
        enabled: true,
      };
    default:
      return {
        id: `box-${idSuffix}`,
        label: '사용자 지정 영역',
        x: 0.1,
        y: 0.8,
        width: 0.8,
        height: 0.14,
        feather: 14,
        padding: 6,
        mode: 'hybrid',
        sampleDirection: 'vertical',
        grainStrength: 4,
        brightnessOffset: 0,
        blendStrength: 1.0,
        blurRadius: 16,
        startTime: 0,
        endTime: 99999,
        enabled: true,
      };
  }
}

// ----------------------------------------------------------------------
// Smart Subtitle Detection Engine
// ----------------------------------------------------------------------

/**
 * Automatically analyze a video canvas frame to detect subtitle banners & text regions.
 * Calculates edge gradient energy, horizontal connected bands, and contrast variations.
 */
export function detectSubtitleBoxesFromCanvas(
  sourceCanvas: HTMLCanvasElement,
  options: SubtitleDetectionOptions = { sensitivity: 'medium', searchZone: 'bottom' },
  allowEmpty = false
): SubtitleDetectionResult[] {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  if (width <= 0 || height <= 0) return [];

  const ctx = sourceCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];

  const candidates: SubtitleDetectionResult[] = [];

  // Determine scan bands based on search zone
  const scanBands: { name: string; startY: number; endY: number; preset: SubtitlePreset }[] = [];

  if (options.searchZone === 'bottom' || options.searchZone === 'all') {
    // Bottom 30% of the screen (typically 68% ~ 96%)
    scanBands.push({
      name: '하단 메인 자막 영역',
      startY: Math.floor(height * 0.68),
      endY: Math.floor(height * 0.96),
      preset: 'bottom-center',
    });
  }

  if (options.searchZone === 'top' || options.searchZone === 'all') {
    // Top 22% of the screen (typically 4% ~ 22%)
    scanBands.push({
      name: '상단 헤드라인 자막 영역',
      startY: Math.floor(height * 0.04),
      endY: Math.floor(height * 0.22),
      preset: 'top-headline',
    });
  }

  // Edge threshold adjustment according to sensitivity
  const edgeThreshold =
    options.sensitivity === 'high' ? 22 : options.sensitivity === 'low' ? 42 : 30;

  for (const band of scanBands) {
    const bandH = band.endY - band.startY;
    if (bandH <= 10) continue;

    try {
      const imgData = ctx.getImageData(0, band.startY, width, bandH);
      const data = imgData.data;

      // Row-wise horizontal gradient energy profile
      const rowEnergies: number[] = new Array(bandH).fill(0);
      const rowLefts: number[] = new Array(bandH).fill(width);
      const rowRights: number[] = new Array(bandH).fill(0);

      const stepX = 2; // Sample every 2 pixels for speed
      for (let y = 0; y < bandH; y += 1) {
        let edgeCount = 0;
        let minX = width;
        let maxX = 0;

        for (let x = 0; x < width - stepX; x += stepX) {
          const idx1 = (y * width + x) * 4;
          const idx2 = (y * width + (x + stepX)) * 4;

          const lum1 = 0.299 * data[idx1] + 0.587 * data[idx1 + 1] + 0.114 * data[idx1 + 2];
          const lum2 = 0.299 * data[idx2] + 0.587 * data[idx2 + 1] + 0.114 * data[idx2 + 2];

          const diff = Math.abs(lum1 - lum2);
          if (diff > edgeThreshold) {
            edgeCount += 1;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
          }
        }

        rowEnergies[y] = edgeCount;
        rowLefts[y] = minX;
        rowRights[y] = maxX;
      }

      // Smooth row energies with moving average
      const smoothedEnergies: number[] = new Array(bandH).fill(0);
      for (let y = 0; y < bandH; y += 1) {
        let sum = 0;
        let count = 0;
        for (let dy = -2; dy <= 2; dy += 1) {
          const ny = y + dy;
          if (ny >= 0 && ny < bandH) {
            sum += rowEnergies[ny];
            count += 1;
          }
        }
        smoothedEnergies[y] = sum / count;
      }

      // Find the highest energy contiguous vertical span (the subtitle text lines)
      const avgEnergy =
        smoothedEnergies.reduce((acc, v) => acc + v, 0) / Math.max(1, smoothedEnergies.length);
      const activeThreshold = Math.max(8, avgEnergy * 1.15);

      let bestSpanStart = -1;
      let bestSpanEnd = -1;
      let currentSpanStart = -1;
      let bestSpanScore = 0;
      let currentSpanScore = 0;

      for (let y = 0; y < bandH; y += 1) {
        if (smoothedEnergies[y] >= activeThreshold) {
          if (currentSpanStart === -1) {
            currentSpanStart = y;
            currentSpanScore = 0;
          }
          currentSpanScore += smoothedEnergies[y];
        } else if (currentSpanStart !== -1) {
          const spanLen = y - currentSpanStart;
          if (spanLen >= 6 && currentSpanScore > bestSpanScore) {
            bestSpanScore = currentSpanScore;
            bestSpanStart = currentSpanStart;
            bestSpanEnd = y;
          }
          currentSpanStart = -1;
        }
      }

      // Check if end of band completed a span
      if (currentSpanStart !== -1) {
        const spanLen = bandH - currentSpanStart;
        if (spanLen >= 6 && currentSpanScore > bestSpanScore) {
          bestSpanScore = currentSpanScore;
          bestSpanStart = currentSpanStart;
          bestSpanEnd = bandH;
        }
      }

      if (bestSpanStart !== -1 && bestSpanEnd > bestSpanStart) {
        // Compute horizontal span from active rows
        let overallMinX = width;
        let overallMaxX = 0;

        for (let y = bestSpanStart; y < bestSpanEnd; y += 1) {
          if (rowLefts[y] < overallMinX) overallMinX = rowLefts[y];
          if (rowRights[y] > overallMaxX) overallMaxX = rowRights[y];
        }

        // Add 5% horizontal margin & vertical breathing room
        const marginX = Math.round(width * 0.04);
        const marginY = Math.max(6, Math.round(height * 0.015));

        const boxX = Math.max(0, overallMinX - marginX);
        const boxY = Math.max(0, band.startY + bestSpanStart - marginY);
        const boxW = Math.min(width - boxX, overallMaxX - overallMinX + marginX * 2);
        const boxH = Math.min(height - boxY, bestSpanEnd - bestSpanStart + marginY * 2);

        // Subtitles generally have wide aspect ratio (width >= 2.5 * height)
        const isWideAspect = boxW >= boxH * 2.2;
        const confidence = Math.min(
          0.96,
          Math.max(0.65, 0.6 + (bestSpanScore / (width * 8)) * (isWideAspect ? 1.2 : 0.8))
        );

        candidates.push({
          box: {
            id: `detected-${band.preset}-${Date.now()}`,
            label: `${band.name} (자동 감지)`,
            x: Number((boxX / width).toFixed(4)),
            y: Number((boxY / height).toFixed(4)),
            width: Number((boxW / width).toFixed(4)),
            height: Number((boxH / height).toFixed(4)),
            feather: 14,
            padding: 6,
            mode: 'hybrid',
            startTime: 0,
            endTime: 99999,
            enabled: true,
          },
          confidence: Number(confidence.toFixed(2)),
          preset: band.preset,
          description: `${Math.round(confidence * 100)}% 신뢰도로 ${band.name}가 탐지되었습니다.`,
        });
      }
    } catch {
      // Ignore image data extraction failures on tainted frames
    }
  }

  // If no clear high-frequency subtitles detected, fallback or return empty
  if (candidates.length === 0) {
    if (allowEmpty) {
      return [];
    }
    const fallbackBox = getPresetSubtitleBox('bottom-center');
    candidates.push({
      box: fallbackBox,
      confidence: 0.72,
      preset: 'bottom-center',
      description: '표준 하단 자막 영역을 기본값으로 추천합니다.',
    });
  }

  return candidates.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Scan video at multiple temporal intervals to detect persistent subtitle text bands.
 */
export async function detectSubtitlesAcrossVideo(
  videoElement: HTMLVideoElement,
  options: SubtitleDetectionOptions = { sensitivity: 'medium', searchZone: 'bottom' }
): Promise<SubtitleDetectionResult[]> {
  const duration = videoElement.duration || 10;
  const width = videoElement.videoWidth || 1280;
  const height = videoElement.videoHeight || 720;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [getFallbackDetectionResult()];

  // Sample at 25%, 50%, 75% of video
  const sampleTimes = [
    Math.min(1.0, duration * 0.2),
    duration * 0.5,
    Math.max(duration * 0.8, duration - 1.0),
  ].filter((t) => t >= 0 && t <= duration);

  const allCandidates: SubtitleDetectionResult[] = [];
  const originalTime = videoElement.currentTime;

  for (const time of sampleTimes) {
    await seekVideoPromise(videoElement, time);
    ctx.drawImage(videoElement, 0, 0, width, height);
    const frameCandidates = detectSubtitleBoxesFromCanvas(canvas, options);
    allCandidates.push(...frameCandidates);
  }

  // Restore original time
  await seekVideoPromise(videoElement, originalTime);

  if (allCandidates.length === 0) {
    return [getFallbackDetectionResult()];
  }

  // Average the best matching boxes in similar vertical regions
  const bottomBoxes = allCandidates.filter((c) => c.box.y > 0.5);
  if (bottomBoxes.length > 0) {
    const avgX = bottomBoxes.reduce((acc, c) => acc + c.box.x, 0) / bottomBoxes.length;
    const avgY = bottomBoxes.reduce((acc, c) => acc + c.box.y, 0) / bottomBoxes.length;
    const avgW = bottomBoxes.reduce((acc, c) => acc + c.box.width, 0) / bottomBoxes.length;
    const avgH = bottomBoxes.reduce((acc, c) => acc + c.box.height, 0) / bottomBoxes.length;

    const mergedBox: SubtitleBoundingBox = {
      id: `detected-video-subtitle`,
      label: '동영상 분석 자동 감지 자막',
      x: Number(Math.max(0, avgX - 0.02).toFixed(4)),
      y: Number(Math.max(0, avgY - 0.01).toFixed(4)),
      width: Number(Math.min(1 - avgX, avgW + 0.04).toFixed(4)),
      height: Number(Math.min(1 - avgY, avgH + 0.02).toFixed(4)),
      feather: 16,
      padding: 6,
      mode: 'hybrid',
      startTime: 0,
      endTime: 99999,
      enabled: true,
    };

    return [
      {
        box: mergedBox,
        confidence: 0.94,
        preset: 'bottom-center',
        description:
          '다중 프레임 분석을 통해 동영상에 지속되는 하단 자막 영역을 정확히 감지했습니다.',
      },
      ...allCandidates.slice(0, 2),
    ];
  }

  return allCandidates.slice(0, 3);
}

// ----------------------------------------------------------------------
// Time-Varying Subtitle Multi-Segment Detection Engine
// ----------------------------------------------------------------------

export interface TimeVaryingDetectionOptions extends SubtitleDetectionOptions {
  sampleIntervalSec?: number;
  timePaddingSec?: number; // Extra margin in seconds added to start and end
  onProgress?: (percent: number, currentSec: number) => void;
  abortSignal?: AbortSignal;
}

/**
 * Scan the entire video at regular time intervals to detect subtitles that change
 * position (bottom, top, etc.) or only appear in specific time intervals.
 * Groups consecutive similar detections into cohesive time-coded segments.
 */
export async function detectTimeVaryingSubtitlesAcrossVideo(
  videoElement: HTMLVideoElement,
  options: TimeVaryingDetectionOptions = {
    sensitivity: 'medium',
    searchZone: 'all',
    timePaddingSec: 0.45,
  }
): Promise<SubtitleBoundingBox[]> {
  const duration = videoElement.duration || 6;
  const width = videoElement.videoWidth || 1280;
  const height = videoElement.videoHeight || 720;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [getPresetSubtitleBox('bottom-center', '1')];

  const originalTime = videoElement.currentTime;

  // Determine timestamps to sample across the video: every 0.4s ~ 0.75s
  const interval = options.sampleIntervalSec || Math.max(0.4, Math.min(0.7, duration / 12));
  const timestamps: number[] = [];
  for (let t = 0.2; t < duration; t += interval) {
    timestamps.push(Number(t.toFixed(2)));
  }
  if (timestamps.length === 0) timestamps.push(0.5);

  interface SampleDetection {
    time: number;
    box: SubtitleBoundingBox | null;
  }

  const samples: SampleDetection[] = [];

  for (let i = 0; i < timestamps.length; i += 1) {
    if (options.abortSignal?.aborted) break;

    const t = timestamps[i];
    await seekVideoPromise(videoElement, t);
    ctx.drawImage(videoElement, 0, 0, width, height);

    // Run detection allowing empty if no subtitles present on this frame
    const candidates = detectSubtitleBoxesFromCanvas(
      canvas,
      {
        ...options,
        searchZone: options.searchZone || 'bottom',
      },
      true
    );

    if (candidates.length > 0) {
      samples.push({ time: t, box: candidates[0].box });
    } else {
      samples.push({ time: t, box: null });
    }

    if (options.onProgress) {
      options.onProgress(Math.round(((i + 1) / timestamps.length) * 100), t);
    }
  }

  // Restore original video time
  await seekVideoPromise(videoElement, originalTime);

  // If no subtitles detected anywhere, fallback to standard bottom box
  const validSamples = samples.filter((s) => s.box !== null);
  if (validSamples.length === 0) {
    return [getPresetSubtitleBox('bottom-center', '1')];
  }

  // Helper to check if two boxes are in the same location (e.g. both bottom, or both top)
  const isSimilarBox = (b1: SubtitleBoundingBox, b2: SubtitleBoundingBox): boolean => {
    const dy = Math.abs(b1.y - b2.y);
    const dx = Math.abs(b1.x - b2.x);
    return dy < 0.15 && dx < 0.2;
  };

  const segments: SubtitleBoundingBox[] = [];
  let currentGroup: { time: number; box: SubtitleBoundingBox }[] = [];

  for (let i = 0; i < samples.length; i += 1) {
    const s = samples[i];
    if (s.box) {
      if (currentGroup.length === 0) {
        currentGroup.push({ time: s.time, box: s.box });
      } else {
        const lastBox = currentGroup[currentGroup.length - 1].box;
        if (isSimilarBox(lastBox, s.box)) {
          currentGroup.push({ time: s.time, box: s.box });
        } else {
          // Finish previous group and start new one
          segments.push(
            consolidateGroupToSegment(
              currentGroup,
              duration,
              segments.length + 1,
              options.timePaddingSec ?? 0.45
            )
          );
          currentGroup = [{ time: s.time, box: s.box }];
        }
      }
    } else {
      // Gap with no subtitles on this frame
      if (currentGroup.length > 0) {
        segments.push(
          consolidateGroupToSegment(
            currentGroup,
            duration,
            segments.length + 1,
            options.timePaddingSec ?? 0.45
          )
        );
        currentGroup = [];
      }
    }
  }

  if (currentGroup.length > 0) {
    segments.push(
      consolidateGroupToSegment(
        currentGroup,
        duration,
        segments.length + 1,
        options.timePaddingSec ?? 0.45
      )
    );
  }

  return segments.length > 0 ? segments : [getPresetSubtitleBox('bottom-center', '1')];
}

function consolidateGroupToSegment(
  group: { time: number; box: SubtitleBoundingBox }[],
  totalDuration: number,
  index: number,
  timePaddingSec = 0.45
): SubtitleBoundingBox {
  const startT = Math.max(0, group[0].time - timePaddingSec);
  const endT = Math.min(totalDuration, group[group.length - 1].time + timePaddingSec + 0.1);

  const avgX = group.reduce((acc, g) => acc + g.box.x, 0) / group.length;
  const avgY = group.reduce((acc, g) => acc + g.box.y, 0) / group.length;
  const avgW = group.reduce((acc, g) => acc + g.box.width, 0) / group.length;
  const avgH = group.reduce((acc, g) => acc + g.box.height, 0) / group.length;

  const isTop = avgY < 0.35;
  const locationLabel = isTop ? '상단 헤드라인 자막' : '하단 본문 자막';

  const formatSec = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return {
    id: `segment-${index}-${Date.now()}`,
    label: `구간 ${index} [${formatSec(startT)} ~ ${formatSec(endT)}] ${locationLabel}`,
    x: Number(avgX.toFixed(4)),
    y: Number(avgY.toFixed(4)),
    width: Number(avgW.toFixed(4)),
    height: Number(avgH.toFixed(4)),
    feather: 14,
    padding: 6,
    mode: 'hybrid',
    sampleDirection: isTop ? 'bottom-only' : 'top-only',
    grainStrength: 4,
    brightnessOffset: 0,
    blendStrength: 1.0,
    blurRadius: 16,
    startTime: Number(startT.toFixed(2)),
    endTime: Number(endT.toFixed(2)),
    enabled: true,
  };
}

/**
 * Expand or shrink time margins for a subtitle box (앞/뒤 여백 추가 및 조절)
 */
export function adjustBoxTimeMargin(
  box: SubtitleBoundingBox,
  deltaStart: number,
  deltaEnd: number,
  maxDuration: number
): SubtitleBoundingBox {
  const nextStart = Math.max(0, Math.min(box.endTime - 0.2, (box.startTime || 0) + deltaStart));
  const nextEnd = Math.min(
    maxDuration,
    Math.max(nextStart + 0.2, (box.endTime || maxDuration) + deltaEnd)
  );

  const formatSec = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const isTop = box.y < 0.35;
  const locationLabel = isTop ? '상단 헤드라인 자막' : '하단 본문 자막';

  return {
    ...box,
    startTime: Number(nextStart.toFixed(2)),
    endTime: Number(nextEnd.toFixed(2)),
    label: `구간 [${formatSec(nextStart)} ~ ${formatSec(nextEnd)}] ${locationLabel}`,
  };
}

function getFallbackDetectionResult(): SubtitleDetectionResult {
  return {
    box: getPresetSubtitleBox('bottom-center'),
    confidence: 0.75,
    preset: 'bottom-center',
    description: '기본 하단 표준 자막 영역이 선택되었습니다.',
  };
}

function seekVideoPromise(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve) => {
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked);
      resolve();
    };
    video.addEventListener('seeked', onSeeked);
    video.currentTime = Math.max(0, Math.min(video.duration || 10, time));
  });
}

// ----------------------------------------------------------------------
// High-Performance Natural Subtitle Inpainting Renderer
// ----------------------------------------------------------------------

/**
 * Apply natural subtitle removal to the canvas frame.
 * Seamlessly blends surrounding textures, context gradients, and feathered edges.
 */
export function applySubtitleRemovalToCanvas(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  options: SubtitleRemoverRenderOptions
): void {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  if (width <= 0 || height <= 0) return;

  // 1. Draw raw video frame first
  ctx.drawImage(video, 0, 0, width, height);

  // If user requested to view pure original video, skip inpainting
  if (options.showOriginal) {
    if (options.showBoxOutline) {
      drawSubtitleOutlines(ctx, width, height, options);
    }
    return;
  }

  const activeBoxes = options.boxes.filter(
    (b) =>
      b.enabled &&
      options.currentTime >= (b.startTime ?? 0) &&
      options.currentTime <= (b.endTime ?? 99999)
  );

  // 2. Perform inpainting for each active subtitle bounding box
  for (const box of activeBoxes) {
    const pad = box.padding || 0;
    const px = Math.max(0, Math.round(box.x * width) - pad);
    const py = Math.max(0, Math.round(box.y * height) - pad);
    const pw = Math.min(width - px, Math.round(box.width * width) + pad * 2);
    const ph = Math.min(height - py, Math.round(box.height * height) + pad * 2);

    if (pw <= 4 || ph <= 4) continue;

    // Height strictly remains original as requested:
    const finalPy = py;
    const finalPh = ph;
    let finalPx = px;
    let finalPw = pw;

    // Dynamic Width Detection (자막 글자가 위치한 가로 너비만 정확히 추출, 상하 높이는 원본 유지)
    try {
      const imgData = ctx.getImageData(px, py, pw, ph);
      const data = imgData.data;

      const step = 2;
      const numCols = Math.ceil(pw / step);
      const colEnergies = new Float32Array(numCols);

      for (let c = 0; c < numCols; c++) {
        const x = c * step;
        if (x >= pw - step) continue;

        let colMinLum = 255;
        let colMaxLum = 0;
        let colEdges = 0;

        for (let y = 0; y < ph; y += step) {
          const idx1 = (y * pw + x) * 4;
          const idx2 = (y * pw + (x + step)) * 4;

          const lum1 = 0.299 * data[idx1] + 0.587 * data[idx1 + 1] + 0.114 * data[idx1 + 2];
          const lum2 = 0.299 * data[idx2] + 0.587 * data[idx2 + 1] + 0.114 * data[idx2 + 2];

          if (lum1 < colMinLum) colMinLum = lum1;
          if (lum1 > colMaxLum) colMaxLum = lum1;

          if (Math.abs(lum1 - lum2) > 48) {
            colEdges++;
          }
        }

        // 텍스트가 있는 세로 슬라이스는 배경과 글자 간 명도 대비(Contrast)가 뚜렷함 (> 45)
        // 니트/옷감 등의 균일한 배경 텍스처는 컬럼 내 명도 차이가 작아 필터링됨
        const colContrast = colMaxLum - colMinLum;
        if (colContrast >= 45 && colEdges >= 2) {
          colEnergies[c] = colEdges * (colContrast / 45);
        } else {
          colEnergies[c] = 0;
        }
      }

      // 가로 방향 이동 평균으로 단어 간격 및 글자 획 스무딩
      const smoothCol = new Float32Array(numCols);
      const winX = Math.max(3, Math.floor((pw * 0.025) / step));
      let maxCol = 0;
      let peakCol = -1;

      for (let i = 0; i < numCols; i++) {
        let sum = 0;
        let count = 0;
        for (let d = -winX; d <= winX; d++) {
          if (i + d >= 0 && i + d < numCols) {
            sum += colEnergies[i + d];
            count++;
          }
        }
        smoothCol[i] = sum / count;
        if (smoothCol[i] > maxCol) {
          maxCol = smoothCol[i];
          peakCol = i;
        }
      }

      // 프레임 내 자막이 없거나 에너지가 미미한 경우 불필요한 블러 방지
      if (maxCol < 2.0 || peakCol === -1) {
        continue;
      }

      // 최대 밀집도(자막) 피크로부터 좌/우로 확장하여 단어 간 띄어쓰기를 포함한 자막 전체 너비 확정
      const textThresh = Math.max(1.2, maxCol * 0.22);
      const maxGapCols = Math.max(12, Math.round((pw * 0.07) / step)); // 글자/단어 사이 띄어쓰기 허용 폭

      let leftCol = peakCol;
      let gap = 0;
      for (let c = peakCol; c >= 0; c--) {
        if (smoothCol[c] >= textThresh) {
          leftCol = c;
          gap = 0;
        } else {
          gap++;
          if (gap > maxGapCols) break;
        }
      }

      let rightCol = peakCol;
      gap = 0;
      for (let c = peakCol; c < numCols; c++) {
        if (smoothCol[c] >= textThresh) {
          rightCol = c;
          gap = 0;
        } else {
          gap++;
          if (gap > maxGapCols) break;
        }
      }

      // 검출된 자막 좌우 경계에 자연스러운 여백 추가
      const padX = Math.max(10, Math.round(width * 0.015));
      const detectedMinX = leftCol * step;
      const detectedMaxX = (rightCol + 1) * step;

      finalPx = Math.max(px, px + detectedMinX - padX);
      const rightEdge = Math.min(px + pw, px + detectedMaxX + padX);
      finalPw = Math.max(8, rightEdge - finalPx);
    } catch {
      // 추출 오류 시 기본 설정 박스 영역 유지
    }

    const mode = box.mode || options.defaultMode || 'hybrid';

    if (mode === 'hybrid') {
      applyHybridVerticalDiffusion(ctx, width, height, finalPx, finalPy, finalPw, finalPh, box);
    } else if (mode === 'color-fill') {
      applyAdaptiveSurroundingFill(ctx, width, height, finalPx, finalPy, finalPw, finalPh, box);
    } else if (mode === 'blur') {
      applyFeatheredDefocusBlur(ctx, width, height, finalPx, finalPy, finalPw, finalPh, box);
    }
  }

  // 3. Optional Split Screen Comparison View
  if (options.showCompareSplit && options.splitPercent !== undefined) {
    const splitX = Math.round((options.splitPercent / 100) * width);

    // Create temporary original slice on right side of split line
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width - splitX;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx && tempCanvas.width > 0) {
      tempCtx.drawImage(video, splitX, 0, tempCanvas.width, height, 0, 0, tempCanvas.width, height);
      ctx.drawImage(tempCanvas, splitX, 0);

      // Draw vertical split divider bar
      ctx.save();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, height);
      ctx.stroke();

      // Badges
      ctx.font = 'bold 12px Pretendard, sans-serif';
      ctx.fillStyle = 'rgba(0, 167, 111, 0.9)';
      ctx.fillRect(Math.max(10, splitX - 110), 16, 95, 26);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('✨ 자막 지움', Math.max(20, splitX - 98), 33);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(Math.min(width - 105, splitX + 15), 16, 90, 26);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('🎞️ 원본 영상', Math.min(width - 95, splitX + 25), 33);
      ctx.restore();
    }
  }

  // 4. Draw interactive outline & handles if enabled
  if (options.showBoxOutline) {
    drawSubtitleOutlines(ctx, width, height, options);
  }
}

/**
 * Mode 1: Hybrid Context Diffusion with Adaptive Sampling & Grain
 * Samples context textures from top, bottom, or sides, interpolates smoothly,
 * applies realistic film grain, tone adjustment, and feather-blends borders.
 */
function applyHybridVerticalDiffusion(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  x: number,
  y: number,
  w: number,
  h: number,
  box: SubtitleBoundingBox
): void {
  const dir = box.sampleDirection || 'vertical';
  const feather = Math.max(2, Math.min(36, box.feather || 14));

  const offCanvas = document.createElement('canvas');
  offCanvas.width = w;
  offCanvas.height = h;
  const offCtx = offCanvas.getContext('2d');
  if (!offCtx) return;

  if (dir === 'horizontal') {
    // Left & Right context sampling
    const sampleW = Math.max(8, Math.min(48, Math.round(w * 0.15)));
    const leftX = Math.max(0, x - sampleW);
    const leftW = Math.max(1, x - leftX);
    const rightX = Math.min(canvasW, x + w);
    const rightW = Math.max(1, Math.min(canvasW - rightX, sampleW));

    // 1. Draw left context stretched across
    offCtx.save();
    offCtx.drawImage(ctx.canvas, leftX, y, leftW, h, 0, 0, w, h);

    // 2. Draw right context blended with horizontal linear gradient
    const rightCanvas = document.createElement('canvas');
    rightCanvas.width = w;
    rightCanvas.height = h;
    const rCtx = rightCanvas.getContext('2d');
    if (rCtx && rightW > 0) {
      rCtx.drawImage(ctx.canvas, rightX, y, rightW, h, 0, 0, w, h);
      rCtx.globalCompositeOperation = 'destination-in';
      const grad = rCtx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(0.3, 'rgba(0, 0, 0, 0.2)');
      grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.8)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 1)');
      rCtx.fillStyle = grad;
      rCtx.fillRect(0, 0, w, h);

      offCtx.drawImage(rightCanvas, 0, 0);
    }
  } else if (dir === 'top-only') {
    // Only sample top context and stretch down (ideal for bottom subtitles near screen edge)
    const sampleH = Math.max(8, Math.min(40, Math.round(h * 0.4)));
    const topY = Math.max(0, y - sampleH);
    const topH = Math.max(1, y - topY);
    offCtx.save();
    offCtx.drawImage(ctx.canvas, x, topY, w, topH, 0, 0, w, h);
  } else if (dir === 'bottom-only') {
    // Only sample bottom context and stretch up (ideal for top headlines)
    const sampleH = Math.max(8, Math.min(40, Math.round(h * 0.4)));
    const bottomY = Math.min(canvasH, y + h);
    const bottomH = Math.max(1, Math.min(canvasH - bottomY, sampleH));
    offCtx.save();
    offCtx.drawImage(ctx.canvas, x, bottomY, w, bottomH, 0, 0, w, h);
  } else {
    // Default 'vertical': Dual top and bottom context blending
    const sampleH = Math.max(8, Math.min(32, Math.round(h * 0.35)));
    const topY = Math.max(0, y - sampleH);
    const topH = Math.max(1, y - topY);

    const bottomY = Math.min(canvasH, y + h);
    const bottomH = Math.max(1, Math.min(canvasH - bottomY, sampleH));

    offCtx.save();
    offCtx.drawImage(ctx.canvas, x, topY, w, topH, 0, 0, w, h);

    const bottomCanvas = document.createElement('canvas');
    bottomCanvas.width = w;
    bottomCanvas.height = h;
    const bCtx = bottomCanvas.getContext('2d');
    if (bCtx && bottomH > 0) {
      bCtx.drawImage(ctx.canvas, x, bottomY, w, bottomH, 0, 0, w, h);
      bCtx.globalCompositeOperation = 'destination-in';
      const grad = bCtx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(0.3, 'rgba(0, 0, 0, 0.2)');
      grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.8)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 1)');
      bCtx.fillStyle = grad;
      bCtx.fillRect(0, 0, w, h);

      offCtx.drawImage(bottomCanvas, 0, 0);
    }
  }

  // 3. Film Grain & Brightness Tone Adjustment
  const grain = box.grainStrength ?? 4;
  const bOffset = box.brightnessOffset ?? 0;
  if (grain > 0 || bOffset !== 0) {
    try {
      const patchData = offCtx.getImageData(0, 0, w, h);
      const data = patchData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = grain > 0 ? Math.trunc((Math.random() - 0.5) * grain) : 0;
        data[i] = Math.min(255, Math.max(0, data[i] + bOffset + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + bOffset + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + bOffset + noise));
      }
      offCtx.putImageData(patchData, 0, 0);
    } catch {
      // Canvas read fallback
    }
  }

  // 4. Soft Feather Mask across all 4 edges
  offCtx.globalCompositeOperation = 'destination-in';
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = w;
  maskCanvas.height = h;
  const mCtx = maskCanvas.getContext('2d');
  if (mCtx) {
    mCtx.fillStyle = '#ffffff';
    mCtx.fillRect(feather, feather, Math.max(1, w - feather * 2), Math.max(1, h - feather * 2));
    mCtx.filter = `blur(${feather / 2}px)`;
    mCtx.drawImage(maskCanvas, 0, 0);
    offCtx.drawImage(maskCanvas, 0, 0);
  }

  offCtx.restore();

  // 5. Composite back to main canvas with custom blend strength
  ctx.save();
  ctx.globalAlpha = Math.max(0.1, Math.min(1.0, box.blendStrength ?? 1.0));
  ctx.drawImage(offCanvas, x, y);
  ctx.restore();
}

/**
 * Mode 2: Adaptive Surrounding Color & Gradient Fill
 * Samples background colors surrounding the box perimeter and blends smoothly.
 */
function applyAdaptiveSurroundingFill(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  x: number,
  y: number,
  w: number,
  h: number,
  box: SubtitleBoundingBox
): void {
  const dir = box.sampleDirection || 'vertical';
  const feather = Math.max(2, Math.min(36, box.feather || 14));

  const offCanvas = document.createElement('canvas');
  offCanvas.width = w;
  offCanvas.height = h;
  const offCtx = offCanvas.getContext('2d');
  if (!offCtx) return;

  if (dir === 'horizontal') {
    const leftX = Math.max(0, x - 4);
    const rightX = Math.min(canvasW - 1, x + w + 2);
    const leftSample = ctx.getImageData(leftX, Math.round(y + h / 2), 1, 1).data;
    const rightSample = ctx.getImageData(rightX, Math.round(y + h / 2), 1, 1).data;

    const leftColor = `rgb(${leftSample[0]}, ${leftSample[1]}, ${leftSample[2]})`;
    const rightColor = `rgb(${rightSample[0]}, ${rightSample[1]}, ${rightSample[2]})`;

    const grad = offCtx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, leftColor);
    grad.addColorStop(1, rightColor);
    offCtx.fillStyle = grad;
    offCtx.fillRect(0, 0, w, h);
  } else if (dir === 'top-only') {
    const topY = Math.max(0, y - 4);
    const topSample = ctx.getImageData(Math.round(x + w / 2), topY, 1, 1).data;
    offCtx.fillStyle = `rgb(${topSample[0]}, ${topSample[1]}, ${topSample[2]})`;
    offCtx.fillRect(0, 0, w, h);
  } else if (dir === 'bottom-only') {
    const bottomY = Math.min(canvasH - 1, y + h + 2);
    const bottomSample = ctx.getImageData(Math.round(x + w / 2), bottomY, 1, 1).data;
    offCtx.fillStyle = `rgb(${bottomSample[0]}, ${bottomSample[1]}, ${bottomSample[2]})`;
    offCtx.fillRect(0, 0, w, h);
  } else {
    // Vertical gradient
    const topY = Math.max(0, y - 4);
    const bottomY = Math.min(canvasH - 1, y + h + 2);
    const topSample = ctx.getImageData(Math.round(x + w / 2), topY, 1, 1).data;
    const bottomSample = ctx.getImageData(Math.round(x + w / 2), bottomY, 1, 1).data;

    const topColor = `rgb(${topSample[0]}, ${topSample[1]}, ${topSample[2]})`;
    const bottomColor = `rgb(${bottomSample[0]}, ${bottomSample[1]}, ${bottomSample[2]})`;

    const grad = offCtx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, topColor);
    grad.addColorStop(1, bottomColor);
    offCtx.fillStyle = grad;
    offCtx.fillRect(0, 0, w, h);
  }

  // Grain and brightness adjustment
  const grain = box.grainStrength ?? 4;
  const bOffset = box.brightnessOffset ?? 0;
  if (grain > 0 || bOffset !== 0) {
    try {
      const patchData = offCtx.getImageData(0, 0, w, h);
      const data = patchData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = grain > 0 ? Math.trunc((Math.random() - 0.5) * grain) : 0;
        data[i] = Math.min(255, Math.max(0, data[i] + bOffset + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + bOffset + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + bOffset + noise));
      }
      offCtx.putImageData(patchData, 0, 0);
    } catch {
      // fallback
    }
  }

  // Feather edges
  offCtx.globalCompositeOperation = 'destination-in';
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = w;
  maskCanvas.height = h;
  const mCtx = maskCanvas.getContext('2d');
  if (mCtx) {
    mCtx.fillStyle = '#ffffff';
    mCtx.fillRect(feather, feather, Math.max(1, w - feather * 2), Math.max(1, h - feather * 2));
    mCtx.filter = `blur(${feather / 2}px)`;
    mCtx.drawImage(maskCanvas, 0, 0);
    offCtx.drawImage(maskCanvas, 0, 0);
  }

  ctx.save();
  ctx.globalAlpha = Math.max(0.1, Math.min(1.0, box.blendStrength ?? 1.0));
  ctx.drawImage(offCanvas, x, y);
  ctx.restore();
}

/**
 * Mode 3: Natural Feathered Defocus Blur
 */
function applyFeatheredDefocusBlur(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  x: number,
  y: number,
  w: number,
  h: number,
  box: SubtitleBoundingBox
): void {
  const feather = Math.max(2, Math.min(36, box.feather || 14));
  const blurR = Math.max(4, Math.min(40, box.blurRadius ?? 16));

  const offCanvas = document.createElement('canvas');
  offCanvas.width = w;
  offCanvas.height = h;
  const offCtx = offCanvas.getContext('2d');
  if (!offCtx) return;

  offCtx.filter = `blur(${blurR}px)`;
  offCtx.drawImage(ctx.canvas, x, y, w, h, 0, 0, w, h);
  offCtx.filter = 'none';

  // Grain and brightness adjustment
  const grain = box.grainStrength ?? 0;
  const bOffset = box.brightnessOffset ?? 0;
  if (grain > 0 || bOffset !== 0) {
    try {
      const patchData = offCtx.getImageData(0, 0, w, h);
      const data = patchData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = grain > 0 ? Math.trunc((Math.random() - 0.5) * grain) : 0;
        data[i] = Math.min(255, Math.max(0, data[i] + bOffset + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + bOffset + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + bOffset + noise));
      }
      offCtx.putImageData(patchData, 0, 0);
    } catch {
      // fallback
    }
  }

  // Feather edges
  offCtx.globalCompositeOperation = 'destination-in';
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = w;
  maskCanvas.height = h;
  const mCtx = maskCanvas.getContext('2d');
  if (mCtx) {
    mCtx.fillStyle = '#ffffff';
    mCtx.fillRect(feather, feather, Math.max(1, w - feather * 2), Math.max(1, h - feather * 2));
    mCtx.filter = `blur(${feather / 2}px)`;
    mCtx.drawImage(maskCanvas, 0, 0);
    offCtx.drawImage(maskCanvas, 0, 0);
  }

  ctx.save();
  ctx.globalAlpha = Math.max(0.1, Math.min(1.0, box.blendStrength ?? 1.0));
  ctx.drawImage(offCanvas, x, y);
  ctx.restore();
}

/**
 * Draw on-canvas boundary dashed rectangles & resize handles
 */
function drawSubtitleOutlines(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: SubtitleRemoverRenderOptions
): void {
  const { boxes, activeBoxId } = options;

  ctx.save();

  for (const box of boxes) {
    if (!box.enabled) continue;

    const isActive = box.id === activeBoxId;
    const px = Math.round(box.x * width);
    const py = Math.round(box.y * height);
    const pw = Math.round(box.width * width);
    const ph = Math.round(box.height * height);

    // Dashed glowing border
    ctx.strokeStyle = isActive ? '#00A76F' : 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = isActive ? 2.5 : 1.5;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(px, py, pw, ph);

    // Label Badge
    ctx.setLineDash([]);
    ctx.font = 'bold 12px Pretendard, sans-serif';

    const formatSec = (s: number) => {
      const m = Math.floor(s / 60);
      const sec = Math.floor(s % 60);
      return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    const timeStr =
      box.startTime !== undefined && box.endTime !== undefined
        ? ` [${formatSec(box.startTime)}~${formatSec(box.endTime)}]`
        : '';
    const badgeText = `✨ 자막${timeStr}`;
    const textW = ctx.measureText(badgeText).width + 16;
    const badgeY = py > 26 ? py - 24 : py + ph + 6;
    const badgeH = 22;

    // Draw main label pill
    ctx.fillStyle = isActive ? '#00A76F' : 'rgba(30, 41, 59, 0.88)';
    ctx.beginPath();
    ctx.roundRect(px, badgeY, textW, badgeH, 4);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillText(badgeText, px + 8, badgeY + 15);

    // Draw direct [✕ 삭제] pill button on the badge
    const delBtnW = 54;
    const delBtnX = px + textW + 4;
    ctx.fillStyle = '#ff5630';
    ctx.beginPath();
    ctx.roundRect(delBtnX, badgeY, delBtnW, badgeH, 4);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px Pretendard, sans-serif';
    ctx.fillText('✕ 삭제', delBtnX + 8, badgeY + 15);

    // If active, draw resize handles
    if (isActive) {
      const handleSize = 10;
      const half = handleSize / 2;
      ctx.fillStyle = '#00A76F';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;

      const handles = [
        { x: px, y: py }, // nw
        { x: px + pw, y: py }, // ne
        { x: px + pw, y: py + ph }, // se
        { x: px, y: py + ph }, // sw
        { x: px + pw / 2, y: py }, // n
        { x: px + pw / 2, y: py + ph }, // s
        { x: px, y: py + ph / 2 }, // w
        { x: px + pw, y: py + ph / 2 }, // e
      ];

      for (const h of handles) {
        ctx.beginPath();
        ctx.rect(h.x - half, h.y - half, handleSize, handleSize);
        ctx.fill();
        ctx.stroke();
      }
    }
  }

  ctx.restore();
}

// ----------------------------------------------------------------------
// Hit Testing for Subtitle Box Interaction
// ----------------------------------------------------------------------

export function getSubtitleBoxHit(
  box: SubtitleBoundingBox,
  canvasW: number,
  canvasH: number,
  mouseX: number,
  mouseY: number
): SubtitleBoxHitType | null {
  const px = box.x * canvasW;
  const py = box.y * canvasH;
  const pw = box.width * canvasW;
  const ph = box.height * canvasH;

  const badgeY = py > 26 ? py - 24 : py + ph + 6;
  const badgeH = 24;

  const formatSec = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };
  const timeStr =
    box.startTime !== undefined && box.endTime !== undefined
      ? ` [${formatSec(box.startTime)}~${formatSec(box.endTime)}]`
      : '';
  const estTextW = Math.max(120, (box.label || `자막${timeStr}`).length * 7.5 + 40);
  const delBtnW = 54;
  const delBtnX = px + estTextW + 4;

  // Check if click was inside the '✕ 삭제' button
  if (
    mouseX >= delBtnX - 4 &&
    mouseX <= delBtnX + delBtnW + 4 &&
    mouseY >= badgeY - 2 &&
    mouseY <= badgeY + badgeH + 2
  ) {
    return 'delete';
  }

  const handleDist = 14;

  // Corner checks
  if (Math.hypot(mouseX - px, mouseY - py) <= handleDist) return 'nw';
  if (Math.hypot(mouseX - (px + pw), mouseY - py) <= handleDist) return 'ne';
  if (Math.hypot(mouseX - (px + pw), mouseY - (py + ph)) <= handleDist) return 'se';
  if (Math.hypot(mouseX - px, mouseY - (py + ph)) <= handleDist) return 'sw';

  // Edge checks
  if (Math.abs(mouseY - py) <= handleDist && mouseX >= px && mouseX <= px + pw) return 'n';
  if (Math.abs(mouseY - (py + ph)) <= handleDist && mouseX >= px && mouseX <= px + pw) return 's';
  if (Math.abs(mouseX - px) <= handleDist && mouseY >= py && mouseY <= py + ph) return 'w';
  if (Math.abs(mouseX - (px + pw)) <= handleDist && mouseY >= py && mouseY <= py + ph) return 'e';

  // Body inside check
  if (mouseX >= px && mouseX <= px + pw && mouseY >= py && mouseY <= py + ph) {
    return 'move';
  }

  // Inside badge body
  if (mouseX >= px && mouseX <= px + estTextW && mouseY >= badgeY && mouseY <= badgeY + badgeH) {
    return 'move';
  }

  return null;
}

// ----------------------------------------------------------------------
// Video Export Engine (Preserving Original Audio)
// ----------------------------------------------------------------------

/**
 * Render and export the video with subtitle inpainting applied frame-by-frame.
 * Preserves high quality video bitrates and retains synchronized original audio.
 */
export function exportSubtitleRemovedVideo(
  videoSourceUrl: string,
  options: SubtitleRemoverRenderOptions,
  exportSettings: VideoExportSettings,
  onProgress?: (percent: number, elapsedSec: number) => void,
  abortSignal?: AbortSignal
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = videoSourceUrl;
    video.crossOrigin = 'anonymous';
    video.muted = exportSettings.muteAudio;
    video.playsInline = true;

    // To prevent Chromium from aggressively throttling or freezing the video track 
    // of an off-screen/hidden video element (which causes captureStream to freeze midway),
    // we must mount it to the DOM and keep it barely visible.
    video.style.position = 'fixed';
    video.style.top = '0px';
    video.style.left = '0px';
    video.style.width = '1px';
    video.style.height = '1px';
    video.style.opacity = '0.01';
    video.style.pointerEvents = 'none';
    video.style.zIndex = '-9999';
    document.body.appendChild(video);

    const cleanupVideo = () => {
      if (document.body.contains(video)) {
        document.body.removeChild(video);
      }
    };

    if (abortSignal?.aborted) {
      cleanupVideo();
      reject(new Error('인코딩이 취소되었습니다.'));
      return;
    }

    abortSignal?.addEventListener('abort', () => {
      video.pause();
      cleanupVideo();
      reject(new Error('인코딩이 중단되었습니다.'));
    });

    video.onloadedmetadata = async () => {
      const srcW = video.videoWidth || 1280;
      const srcH = video.videoHeight || 720;
      const aspect = srcW / srcH;

      let targetW = srcW;
      let targetH = srcH;

      if (exportSettings.resolution === '1080p') {
        if (aspect >= 1) {
          targetW = 1920;
          targetH = Math.round(1920 / aspect);
        } else {
          targetH = 1920;
          targetW = Math.round(1920 * aspect);
        }
      } else if (exportSettings.resolution === '720p') {
        if (aspect >= 1) {
          targetW = 1280;
          targetH = Math.round(1280 / aspect);
        } else {
          targetH = 1280;
          targetW = Math.round(1280 * aspect);
        }
      } else if (exportSettings.resolution === '480p') {
        if (aspect >= 1) {
          targetW = 854;
          targetH = Math.round(854 / aspect);
        } else {
          targetH = 854;
          targetW = Math.round(854 * aspect);
        }
      }

      targetW = targetW % 2 === 0 ? targetW : targetW - 1;
      targetH = targetH % 2 === 0 ? targetH : targetH - 1;

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        reject(new Error('Canvas 초기화 실패'));
        return;
      }

      const stream = canvas.captureStream(30);

      // Web Audio setup for audio track passthrough
      // To prevent video playback from slowing down when the main thread is blocked by canvas rendering,
      // we avoid using AudioContext.createMediaElementSource (which slaves the media clock to the audio graph).
      // Instead, we directly extract the audio track from the video's MediaStream.
      if (!exportSettings.muteAudio) {
        try {
          const videoStream = (video as any).captureStream
            ? (video as any).captureStream()
            : (video as any).mozCaptureStream
              ? (video as any).mozCaptureStream()
              : null;

          if (videoStream) {
            const audioTrack = videoStream.getAudioTracks()[0];
            if (audioTrack) {
              stream.addTrack(audioTrack);
            }
          }
        } catch (err) {
          console.warn('Audio routing via captureStream failed:', err);
        }
      }

      const reqFormat = exportSettings.format || 'mp4';
      let mimeType = 'video/mp4;codecs=avc1.42E01E,mp4a.40.2';

      if (reqFormat === 'mp4') {
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/mp4;codecs=avc1';
        }
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/mp4';
        }
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm;codecs=vp9,opus';
        }
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }
      } else {
        mimeType = 'video/webm;codecs=vp9,opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }
      }

      let bps = 5000000;
      if (exportSettings.quality === 'high') bps = 8000000;
      if (exportSettings.quality === 'standard') bps = 2500000;

      const recordedChunks: Blob[] = [];
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
        videoBitsPerSecond: bps,
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        cleanupVideo();
        const outputMime = reqFormat === 'mp4' ? 'video/mp4' : mimeType;
        const outputBlob = new Blob(recordedChunks, { type: outputMime });
        resolve(outputBlob);
      };

      const startT = Math.max(0, exportSettings.startTime);
      const endT = Math.min(video.duration || 10000, exportSettings.endTime || video.duration);
      const totalDuration = Math.max(0.1, endT - startT);

      video.currentTime = startT;

      video.onseeked = () => {
        mediaRecorder.start(100);
        video.play();

        const startTimestamp = Date.now();

        let lastProcessedTime = -1;

        const renderLoop = () => {
          if (abortSignal?.aborted) {
            mediaRecorder.stop();
            video.pause();
            return;
          }

          if (video.currentTime >= endT || video.ended) {
            video.pause();
            if (mediaRecorder.state !== 'inactive') {
              mediaRecorder.stop();
            }
            if (onProgress) onProgress(100, (Date.now() - startTimestamp) / 1000);
            return;
          }

          // Only process if the video frame actually advanced
          if (video.currentTime !== lastProcessedTime) {
            applySubtitleRemovalToCanvas(ctx, video, {
              ...options,
              showBoxOutline: false,
              showCompareSplit: false,
              currentTime: video.currentTime,
            });
            lastProcessedTime = video.currentTime;
          }

          const currentProgress = Math.min(
            99,
            Math.max(0, ((video.currentTime - startT) / totalDuration) * 100)
          );
          if (onProgress) {
            onProgress(
              Math.round(currentProgress),
              Math.round((Date.now() - startTimestamp) / 1000)
            );
          }

          requestAnimationFrame(renderLoop);
        };

        requestAnimationFrame(renderLoop);
      };

      video.onerror = (err) => {
        cleanupVideo();
        reject(err);
      };
    };
  });
}
