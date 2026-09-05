// ----------------------------------------------------------------------
// Subtitle Studio Processor (Parser, Generator, Canvas Styler, Video Burn-in)
// ----------------------------------------------------------------------

import type { SubtitleItem, SubtitlePreset, SubtitleStyleSettings } from '../types';

// ----------------------------------------------------------------------
// Default Styles & Presets
// ----------------------------------------------------------------------

export const DEFAULT_SUBTITLE_STYLE: SubtitleStyleSettings = {
  fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: 32,
  fontWeight: 700,
  fontColor: '#ffffff',
  strokeColor: '#000000',
  strokeWidth: 2,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  backgroundEnabled: true,
  backgroundPadding: 10,
  backgroundRadius: 6,
  shadowEnabled: true,
  shadowColor: 'rgba(0, 0, 0, 0.5)',
  shadowBlur: 6,
  position: 'bottom',
  yPercent: 88,
  xPercent: 50,
  textAlign: 'center',
};

export const SUBTITLE_PRESETS: SubtitlePreset[] = [
  {
    id: 'youtube-vlog',
    name: '유튜브 브이로그',
    description: '선명한 화이트 텍스트와 반투명 블랙 라운드 박스',
    badge: '인기',
    style: {
      fontFamily: 'Pretendard, -apple-system, sans-serif',
      fontSize: 32,
      fontWeight: 700,
      fontColor: '#ffffff',
      strokeWidth: 0,
      backgroundEnabled: true,
      backgroundColor: 'rgba(0, 0, 0, 0.72)',
      backgroundPadding: 10,
      backgroundRadius: 8,
      shadowEnabled: false,
      position: 'bottom',
      yPercent: 88,
      textAlign: 'center',
    },
  },
  {
    id: 'netflix',
    name: '넷플릭스 시네마',
    description: '배경 없이 두꺼운 블랙 외곽선으로 시인성 극대화',
    badge: '추천',
    style: {
      fontFamily: 'Pretendard, -apple-system, sans-serif',
      fontSize: 34,
      fontWeight: 700,
      fontColor: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 5,
      backgroundEnabled: false,
      shadowEnabled: true,
      shadowColor: 'rgba(0, 0, 0, 0.8)',
      shadowBlur: 8,
      position: 'bottom',
      yPercent: 88,
      textAlign: 'center',
    },
  },
  {
    id: 'classic-movie-yellow',
    name: '클래식 영화 옐로우',
    description: '외화 및 고전 영화 감성의 선명한 옐로우 자막',
    style: {
      fontFamily: 'Pretendard, -apple-system, sans-serif',
      fontSize: 34,
      fontWeight: 700,
      fontColor: '#ffe600',
      strokeColor: '#111111',
      strokeWidth: 4,
      backgroundEnabled: false,
      shadowEnabled: true,
      shadowColor: 'rgba(0, 0, 0, 0.7)',
      shadowBlur: 6,
      position: 'bottom',
      yPercent: 88,
      textAlign: 'center',
    },
  },
  {
    id: 'shorts-reels-neon',
    name: '숏폼 · 릴스 팝',
    description: '틱톡/릴스/쇼츠에 적합한 굵은 폰트와 형광 옐로우 강조',
    badge: '숏폼',
    style: {
      fontFamily: 'Pretendard, -apple-system, sans-serif',
      fontSize: 38,
      fontWeight: 800,
      fontColor: '#ffff00',
      strokeColor: '#000000',
      strokeWidth: 6,
      backgroundEnabled: true,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backgroundPadding: 12,
      backgroundRadius: 10,
      shadowEnabled: true,
      shadowColor: 'rgba(0, 0, 0, 0.9)',
      shadowBlur: 10,
      position: 'bottom',
      yPercent: 82,
      textAlign: 'center',
    },
  },
  {
    id: 'modern-dark',
    name: '모던 라이트 박스',
    description: '화이트 배경 박스에 깔끔한 다크 텍스트',
    style: {
      fontFamily: 'Pretendard, -apple-system, sans-serif',
      fontSize: 30,
      fontWeight: 700,
      fontColor: '#111827',
      strokeWidth: 0,
      backgroundEnabled: true,
      backgroundColor: 'rgba(255, 255, 255, 0.92)',
      backgroundPadding: 10,
      backgroundRadius: 6,
      shadowEnabled: true,
      shadowColor: 'rgba(0, 0, 0, 0.3)',
      shadowBlur: 8,
      position: 'bottom',
      yPercent: 88,
      textAlign: 'center',
    },
  },
  {
    id: 'minimal-clean',
    name: '미니멀 심플',
    description: '얇은 외곽선의 심플하고 군더더기 없는 화이트 자막',
    style: {
      fontFamily: 'Pretendard, -apple-system, sans-serif',
      fontSize: 30,
      fontWeight: 600,
      fontColor: '#ffffff',
      strokeColor: '#1f2937',
      strokeWidth: 2,
      backgroundEnabled: false,
      shadowEnabled: false,
      position: 'bottom',
      yPercent: 90,
      textAlign: 'center',
    },
  },
];

export const FONT_FAMILY_OPTIONS = [
  { label: 'Pretendard (기본 권장)', value: 'Pretendard, -apple-system, sans-serif' },
  { label: 'Noto Sans KR', value: '"Noto Sans KR", sans-serif' },
  { label: 'Nanum Gothic (나눔고딕)', value: '"Nanum Gothic", sans-serif' },
  { label: 'Arial (영문 깔끔)', value: 'Arial, sans-serif' },
  { label: 'Impact (강렬한 볼드)', value: 'Impact, "Arial Black", sans-serif' },
  { label: 'Courier New (타이프라이터)', value: '"Courier New", monospace' },
];

// ----------------------------------------------------------------------
// Time Parsing & Formatting Helpers
// ----------------------------------------------------------------------

/**
 * Parse string timestamp (00:01:23,456 or 00:01:23.456 or 01:23.456) to seconds
 */
export function parseTimestampToSeconds(timeStr: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim().replace(',', '.');
  const parts = clean.split(':');

  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  if (parts.length === 3) {
    hours = parseFloat(parts[0]) || 0;
    minutes = parseFloat(parts[1]) || 0;
    seconds = parseFloat(parts[2]) || 0;
  } else if (parts.length === 2) {
    minutes = parseFloat(parts[0]) || 0;
    seconds = parseFloat(parts[1]) || 0;
  } else if (parts.length === 1) {
    seconds = parseFloat(parts[0]) || 0;
  }

  return Math.max(0, hours * 3600 + minutes * 60 + seconds);
}

/**
 * Format seconds to SRT timestamp: 00:01:23,456
 */
export function formatTimestampForSrt(seconds: number): string {
  const safeSec = Math.max(0, isNaN(seconds) ? 0 : seconds);
  const hours = Math.floor(safeSec / 3600);
  const minutes = Math.floor((safeSec % 3600) / 60);
  const secs = Math.floor(safeSec % 60);
  const millis = Math.floor((safeSec % 1) * 1000);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
}

/**
 * Format seconds to WebVTT timestamp: 00:01:23.456
 */
export function formatTimestampForVtt(seconds: number): string {
  const safeSec = Math.max(0, isNaN(seconds) ? 0 : seconds);
  const hours = Math.floor(safeSec / 3600);
  const minutes = Math.floor((safeSec % 3600) / 60);
  const secs = Math.floor(safeSec % 60);
  const millis = Math.floor((safeSec % 1) * 1000);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
}

/**
 * Format seconds to UI display: MM:SS.ms (e.g. 01:23.4)
 */
export function formatTimestampForDisplay(seconds: number): string {
  const safeSec = Math.max(0, isNaN(seconds) ? 0 : seconds);
  const hours = Math.floor(safeSec / 3600);
  const minutes = Math.floor((safeSec % 3600) / 60);
  const secs = Math.floor(safeSec % 60);
  const dec = Math.floor((safeSec % 1) * 10);

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${dec}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${dec}`;
}

// ----------------------------------------------------------------------
// Subtitle Parsers (SRT, VTT, JSON, Plain Text)
// ----------------------------------------------------------------------

/**
 * Parse SubRip (.srt) subtitle string
 */
export function parseSrt(content: string): SubtitleItem[] {
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  const blocks = normalized.split(/\n\s*\n/);
  const items: SubtitleItem[] = [];

  let autoId = 1;

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 2) continue;

    // Check if line 0 is numeric index or timestamp
    let timeLineIdx = 1;
    if (lines[0].includes('-->')) {
      timeLineIdx = 0;
    }

    const timeLine = lines[timeLineIdx];
    if (!timeLine || !timeLine.includes('-->')) continue;

    const [startStr, endStr] = timeLine.split('-->');
    if (!startStr || !endStr) continue;

    const startTime = parseTimestampToSeconds(startStr);
    const endTime = parseTimestampToSeconds(endStr);

    const textLines = lines.slice(timeLineIdx + 1);
    const text = textLines.join('\n').trim();

    if (text) {
      items.push({
        id: `sub-${autoId++}-${Date.now()}`,
        startTime,
        endTime: Math.max(endTime, startTime + 0.3),
        text,
      });
    }
  }

  return items;
}

/**
 * Parse WebVTT (.vtt) subtitle string
 */
export function parseVtt(content: string): SubtitleItem[] {
  let normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

  // Strip WEBVTT header and comments
  if (normalized.startsWith('WEBVTT')) {
    normalized = normalized.replace(/^WEBVTT[^\n]*\n+/i, '');
  }

  const blocks = normalized.split(/\n\s*\n/);
  const items: SubtitleItem[] = [];
  let autoId = 1;

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length === 0) continue;

    let timeLineIdx = 0;
    if (lines[0].includes('-->')) {
      timeLineIdx = 0;
    } else if (lines.length > 1 && lines[1].includes('-->')) {
      timeLineIdx = 1;
    } else {
      continue;
    }

    const timeLine = lines[timeLineIdx];
    const timeMatch = timeLine.match(
      /((?:\d+:)?\d+:\d+(?:[.,]\d+)?)\s*-->\s*((?:\d+:)?\d+:\d+(?:[.,]\d+)?)/
    );
    if (!timeMatch) continue;

    const startTime = parseTimestampToSeconds(timeMatch[1]);
    const endTime = parseTimestampToSeconds(timeMatch[2]);

    const textLines = lines.slice(timeLineIdx + 1);
    // Strip cue tags like <c>, <b>, etc.
    const text = textLines
      .join('\n')
      .replace(/<[^>]+>/g, '')
      .trim();

    if (text) {
      items.push({
        id: `sub-${autoId++}-${Date.now()}`,
        startTime,
        endTime: Math.max(endTime, startTime + 0.3),
        text,
      });
    }
  }

  return items;
}

// ----------------------------------------------------------------------
// SAMI (.smi) Parser & Exporter
// ----------------------------------------------------------------------

/**
 * Parse SAMI (.smi) subtitle string
 */
export function parseSmi(content: string): SubtitleItem[] {
  const syncRegex = /<SYNC\s+Start=(\d+)[^>]*>(?:<P[^>]*>)?([\s\S]*?)(?=(?:<SYNC|$))/gi;
  const items: SubtitleItem[] = [];

  let match: RegExpExecArray | null;
  let autoId = 1;
  let prevItem: SubtitleItem | null = null;

  while ((match = syncRegex.exec(content)) !== null) {
    const timeMs = parseInt(match[1], 10) || 0;
    const timeSec = timeMs / 1000;
    let rawText = match[2] || '';

    // Strip HTML tags & non-breaking spaces
    rawText = rawText
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .trim();

    // If text is empty or blank, it often marks the end of previous subtitle in SMI
    if (!rawText || rawText === '&nbsp;') {
      if (prevItem && prevItem.endTime === prevItem.startTime + 3.0) {
        prevItem.endTime = Math.max(prevItem.startTime + 0.3, timeSec);
      }
      continue;
    }

    if (prevItem && prevItem.endTime > timeSec) {
      prevItem.endTime = Math.max(prevItem.startTime + 0.3, timeSec);
    }

    const newItem: SubtitleItem = {
      id: `smi-${autoId++}-${Date.now()}`,
      startTime: timeSec,
      endTime: timeSec + 3.0, // default placeholder until next sync or blank
      text: rawText,
    };

    items.push(newItem);
    prevItem = newItem;
  }

  return items;
}

/**
 * Convert subtitle items to SAMI (.smi) format
 */
export function subtitlesToSmi(items: SubtitleItem[], title = 'Subtitles'): string {
  const sorted = [...items].sort((a, b) => a.startTime - b.startTime);

  let body = '';
  for (const item of sorted) {
    const startMs = Math.round(item.startTime * 1000);
    const endMs = Math.round(Math.max(item.endTime, item.startTime + 0.3) * 1000);
    const escapedText = item.text.replace(/\n/g, '<br>');

    body += `<SYNC Start=${startMs}><P Class=KRCC>\n${escapedText}\n`;
    body += `<SYNC Start=${endMs}><P Class=KRCC>&nbsp;\n`;
  }

  return `<SAMI>
<HEAD>
<TITLE>${title}</TITLE>
<STYLE TYPE="text/css">
<!--
P { font-family: Pretendard, sans-serif; font-size: 20pt; text-align: center; color: white; background-color: black; }
.KRCC { Name: Korean; lang: ko-KR; SAMIType: CC; }
-->
</STYLE>
</HEAD>
<BODY>
${body}
</BODY>
</SAMI>`;
}

/**
 * Auto-detect and parse subtitle file (SRT, VTT, SMI, JSON, or Plain text lines)
 */
export function parseSubtitleContent(rawContent: string): SubtitleItem[] {
  const trimmed = rawContent.trim();

  // 1. Check if JSON
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      const list = Array.isArray(parsed) ? parsed : parsed.segments || parsed.subtitles || [];
      if (Array.isArray(list) && list.length > 0) {
        return list.map(
          (
            item: {
              startTime?: number;
              start?: number;
              endTime?: number;
              end?: number;
              text?: string;
            },
            idx: number
          ) => ({
            id: `sub-${idx + 1}-${Date.now()}`,
            startTime: Number(item.startTime ?? item.start ?? 0),
            endTime: Number(item.endTime ?? item.end ?? Number(item.startTime ?? 0) + 3),
            text: String(item.text ?? '').trim(),
          })
        );
      }
    } catch {
      // not json, continue
    }
  }

  // 2. Check if SAMI (.smi)
  if (trimmed.toUpperCase().includes('<SAMI') || trimmed.toUpperCase().includes('<SYNC START=')) {
    const smiItems = parseSmi(trimmed);
    if (smiItems.length > 0) return smiItems;
  }

  // 3. Check if WebVTT
  if (trimmed.startsWith('WEBVTT')) {
    return parseVtt(trimmed);
  }

  // 4. Try SRT
  if (trimmed.includes('-->')) {
    const srtItems = parseSrt(trimmed);
    if (srtItems.length > 0) return srtItems;
  }

  // 5. Fallback: Parse line by line as 3-second segments
  const lines = trimmed
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  return lines.map((line, idx) => ({
    id: `sub-${idx + 1}-${Date.now()}`,
    startTime: idx * 3.0,
    endTime: (idx + 1) * 3.0,
    text: line,
  }));
}

// ----------------------------------------------------------------------
// Subtitle Exporters (SRT, VTT, TXT, JSON, SMI)
// ----------------------------------------------------------------------

export function subtitlesToSrt(items: SubtitleItem[]): string {
  const sorted = [...items].sort((a, b) => a.startTime - b.startTime);
  return sorted
    .filter((item) => item.text.trim().length > 0)
    .map((item, index) => {
      const srtIndex = index + 1;
      const start = formatTimestampForSrt(item.startTime);
      const end = formatTimestampForSrt(Math.max(item.endTime, item.startTime + 0.3));
      return `${srtIndex}\n${start} --> ${end}\n${item.text.trim()}\n`;
    })
    .join('\n');
}

export function subtitlesToVtt(items: SubtitleItem[]): string {
  const sorted = [...items].sort((a, b) => a.startTime - b.startTime);
  const header = 'WEBVTT\n\n';
  const body = sorted
    .filter((item) => item.text.trim().length > 0)
    .map((item, index) => {
      const vttIndex = index + 1;
      const start = formatTimestampForVtt(item.startTime);
      const end = formatTimestampForVtt(Math.max(item.endTime, item.startTime + 0.3));
      return `${vttIndex}\n${start} --> ${end}\n${item.text.trim()}\n`;
    })
    .join('\n');

  return header + body;
}

export function subtitlesToTxt(items: SubtitleItem[], includeTimestamps = false): string {
  const sorted = [...items].sort((a, b) => a.startTime - b.startTime);
  return sorted
    .filter((item) => item.text.trim().length > 0)
    .map((item) => {
      if (includeTimestamps) {
        return `[${formatTimestampForDisplay(item.startTime)} ~ ${formatTimestampForDisplay(item.endTime)}] ${item.text.trim()}`;
      }
      return item.text.trim();
    })
    .join('\n');
}

export function subtitlesToJson(items: SubtitleItem[], videoName = 'video'): string {
  const sorted = [...items].sort((a, b) => a.startTime - b.startTime);
  const data = {
    source: videoName,
    exportedAt: new Date().toISOString(),
    totalSubtitles: sorted.length,
    subtitles: sorted.map((item, idx) => ({
      index: idx + 1,
      startTime: item.startTime,
      endTime: item.endTime,
      startFormatted: formatTimestampForDisplay(item.startTime),
      endFormatted: formatTimestampForDisplay(item.endTime),
      text: item.text.trim(),
    })),
  };
  return JSON.stringify(data, null, 2);
}

export function downloadSubtitleFile(content: string, filename: string, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ----------------------------------------------------------------------
// Subtitle Validation, Fixes & Utilities
// ----------------------------------------------------------------------

/**
 * Validate and automatically fix common subtitle errors (overlaps, reversed timestamps, empty items)
 */
export function validateAndFixSubtitles(items: SubtitleItem[]): {
  fixed: SubtitleItem[];
  issuesFixedCount: number;
} {
  let issuesFixedCount = 0;

  // 1. Filter out completely empty items
  const nonEmpty = items.filter((item) => {
    if (!item.text.trim()) {
      issuesFixedCount += 1;
      return false;
    }
    return true;
  });

  // 2. Sort by start time
  const sorted = [...nonEmpty].sort((a, b) => a.startTime - b.startTime);

  // 3. Fix reversed times & overlaps
  const fixed: SubtitleItem[] = [];

  for (let i = 0; i < sorted.length; i += 1) {
    const current = { ...sorted[i] };

    // Fix negative times
    if (current.startTime < 0) {
      current.startTime = 0;
      issuesFixedCount += 1;
    }

    // Fix reversed or equal timestamps
    if (current.endTime <= current.startTime) {
      current.endTime = Math.round((current.startTime + 1.5) * 100) / 100;
      issuesFixedCount += 1;
    }

    // Fix overlap with previous item
    if (fixed.length > 0) {
      const prev = fixed[fixed.length - 1];
      if (prev.endTime > current.startTime) {
        prev.endTime = Math.max(
          prev.startTime + 0.2,
          Math.round((current.startTime - 0.05) * 100) / 100
        );
        issuesFixedCount += 1;
      }
    }

    fixed.push(current);
  }

  return { fixed, issuesFixedCount };
}

/**
 * Convert subtitle timestamps according to frame rate conversion (e.g. 23.976 -> 25 FPS)
 */
export function convertSubtitleFramerate(
  items: SubtitleItem[],
  fromFps: number,
  toFps: number
): SubtitleItem[] {
  if (fromFps <= 0 || toFps <= 0 || fromFps === toFps) return items;
  const ratio = fromFps / toFps;

  return items.map((item) => ({
    ...item,
    startTime: Math.round(item.startTime * ratio * 100) / 100,
    endTime: Math.round(item.endTime * ratio * 100) / 100,
  }));
}

/**
 * Clean subtitle texts (strip HTML tags, normalize whitespace)
 */
export function cleanSubtitleTexts(
  items: SubtitleItem[],
  options: { removeHtml?: boolean; trimWhitespace?: boolean } = {
    removeHtml: true,
    trimWhitespace: true,
  }
): SubtitleItem[] {
  return items.map((item) => {
    let text = item.text;
    if (options.removeHtml) {
      text = text.replace(/<[^>]+>/g, '');
    }
    if (options.trimWhitespace) {
      text = text
        .split('\n')
        .map((line) => line.trim())
        .join('\n')
        .trim();
    }
    return { ...item, text };
  });
}

/**
 * Split a single subtitle into two parts at a given split time
 */
export function splitSubtitleItem(
  item: SubtitleItem,
  splitTimeSec: number,
  firstPartText?: string,
  secondPartText?: string
): [SubtitleItem, SubtitleItem] {
  const safeSplitTime = Math.min(Math.max(item.startTime + 0.2, splitTimeSec), item.endTime - 0.2);

  const words = item.text.split(' ');
  const mid = Math.ceil(words.length / 2);
  const part1 = firstPartText ?? words.slice(0, mid).join(' ');
  const part2 = secondPartText ?? words.slice(mid).join(' ');

  const sub1: SubtitleItem = {
    id: item.id,
    startTime: item.startTime,
    endTime: Math.round(safeSplitTime * 10) / 10,
    text: part1.trim() || item.text,
  };

  const sub2: SubtitleItem = {
    id: `sub-${Date.now()}`,
    startTime: Math.round((safeSplitTime + 0.05) * 10) / 10,
    endTime: item.endTime,
    text: part2.trim() || '...',
  };

  return [sub1, sub2];
}

/**
 * Merge two subtitle items into one
 */
export function mergeSubtitleItems(first: SubtitleItem, second: SubtitleItem): SubtitleItem {
  return {
    id: first.id,
    startTime: Math.min(first.startTime, second.startTime),
    endTime: Math.max(first.endTime, second.endTime),
    text: `${first.text.trim()}\n${second.text.trim()}`,
  };
}

// ----------------------------------------------------------------------
// Canvas Subtitle Drawing Function
// ----------------------------------------------------------------------

/**
 * Draw subtitle text overlays onto Canvas 2D according to style and current playback time
 */
export function drawSubtitleToCanvas(
  ctx: CanvasRenderingContext2D,
  subtitles: SubtitleItem[],
  currentTime: number,
  canvasWidth: number,
  canvasHeight: number,
  style: SubtitleStyleSettings
): void {
  // Find active subtitle(s) at current time
  const activeSubs = subtitles.filter(
    (s) => currentTime >= s.startTime && currentTime <= s.endTime && s.text.trim().length > 0
  );

  if (activeSubs.length === 0) return;

  ctx.save();

  for (const sub of activeSubs) {
    const text = sub.text.trim();
    if (!text) continue;

    // Scale font size relative to canvas height (standardized to 720p base)
    const scale = canvasHeight / 720;
    const computedFontSize = Math.max(14, Math.round(style.fontSize * scale));
    const lineHeight = computedFontSize * 1.35;

    ctx.font = `${style.fontWeight} ${computedFontSize}px ${style.fontFamily}`;
    ctx.textBaseline = 'middle';

    const lines = text.split('\n');

    // Calculate maximum line width
    let maxLineWidth = 0;
    const lineWidths: number[] = [];
    for (const line of lines) {
      const w = ctx.measureText(line).width;
      lineWidths.push(w);
      if (w > maxLineWidth) maxLineWidth = w;
    }

    const totalTextHeight = lines.length * lineHeight;

    // Determine Y coordinate based on position setting
    let targetY: number;
    if (style.position === 'top') {
      targetY = canvasHeight * 0.12;
    } else if (style.position === 'center') {
      targetY = canvasHeight * 0.5;
    } else if (style.position === 'bottom') {
      targetY = canvasHeight * (style.yPercent / 100);
    } else {
      // custom
      targetY = canvasHeight * (style.yPercent / 100);
    }

    // Determine X coordinate
    const targetX = canvasWidth * (style.xPercent / 100);

    // Background box
    if (style.backgroundEnabled && style.backgroundColor) {
      const paddingX = Math.round((style.backgroundPadding + 6) * scale);
      const paddingY = Math.round(style.backgroundPadding * scale);
      const boxWidth = maxLineWidth + paddingX * 2;
      const boxHeight = totalTextHeight + paddingY * 2;
      const boxRadius = Math.round(style.backgroundRadius * scale);

      let boxLeft: number;
      if (style.textAlign === 'center') {
        boxLeft = targetX - boxWidth / 2;
      } else if (style.textAlign === 'left') {
        boxLeft = targetX - paddingX;
      } else {
        boxLeft = targetX - boxWidth + paddingX;
      }

      const boxTop = targetY - boxHeight / 2;

      ctx.fillStyle = style.backgroundColor;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function' && boxRadius > 0) {
        ctx.roundRect(boxLeft, boxTop, boxWidth, boxHeight, boxRadius);
      } else {
        ctx.rect(boxLeft, boxTop, boxWidth, boxHeight);
      }
      ctx.fill();
    }

    // Shadow setup
    if (style.shadowEnabled) {
      ctx.shadowColor = style.shadowColor || 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = style.shadowBlur * scale;
      ctx.shadowOffsetX = 2 * scale;
      ctx.shadowOffsetY = 2 * scale;
    } else {
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    // Draw each line of text
    const startY = targetY - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, index) => {
      const currentY = startY + index * lineHeight;

      ctx.textAlign = style.textAlign;

      // Stroke / Outline
      if (style.strokeWidth > 0 && style.strokeColor) {
        ctx.strokeStyle = style.strokeColor;
        ctx.lineWidth = style.strokeWidth * scale * 2;
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        ctx.strokeText(line, targetX, currentY);
      }

      // Main Text fill
      ctx.fillStyle = style.fontColor;
      ctx.fillText(line, targetX, currentY);
    });
  }

  ctx.restore();
}

// ----------------------------------------------------------------------
// Subtitle Burn-in Video Export Engine
// ----------------------------------------------------------------------

export interface SubtitleExportVideoOptions {
  videoSourceUrl: string;
  subtitles: SubtitleItem[];
  style: SubtitleStyleSettings;
  outputResolution?: 'original' | '1080p' | '720p' | '480p';
  fps?: number;
  quality?: 'high' | 'medium' | 'standard';
  muteAudio?: boolean;
}

/**
 * Burn-in subtitles directly into the video frames and export as WebM / MP4 video Blob
 */
export function exportVideoWithSubtitles(
  options: SubtitleExportVideoOptions,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = options.videoSourceUrl;
    video.crossOrigin = 'anonymous';
    video.muted = options.muteAudio ?? false;
    video.playsInline = true;

    if (signal?.aborted) {
      reject(new Error('변환이 취소되었습니다.'));
      return;
    }

    signal?.addEventListener('abort', () => {
      video.pause();
      reject(new Error('변환이 취소되었습니다.'));
    });

    video.onloadedmetadata = async () => {
      const rawW = video.videoWidth || 1280;
      const rawH = video.videoHeight || 720;

      let targetW = rawW;
      let targetH = rawH;

      if (options.outputResolution === '1080p') {
        targetW = 1920;
        targetH = 1080;
      } else if (options.outputResolution === '720p') {
        targetW = 1280;
        targetH = 720;
      } else if (options.outputResolution === '480p') {
        targetW = 854;
        targetH = 480;
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('캔버스 초기화 실패'));
        return;
      }

      const fps = options.fps || 30;
      const canvasStream = canvas.captureStream(fps);
      const combinedStream = canvasStream;

      // Audio setup via Web Audio API
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContextClass();

      if (!options.muteAudio) {
        try {
          const sourceNode = audioCtx.createMediaElementSource(video);
          const dest = audioCtx.createMediaStreamDestination();
          sourceNode.connect(dest);
          sourceNode.connect(audioCtx.destination);
          const audioTrack = dest.stream.getAudioTracks()[0];
          if (audioTrack) {
            combinedStream.addTrack(audioTrack);
          }
        } catch {
          // audio routing restricted or no audio track
        }
      }

      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/mp4';
      }

      const bitrateMap = {
        high: 6000000,
        medium: 3500000,
        standard: 2000000,
      };
      const videoBitsPerSecond = bitrateMap[options.quality || 'high'];

      const recordedChunks: Blob[] = [];
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
        videoBitsPerSecond,
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        try {
          audioCtx.close();
        } catch {
          // ignore
        }
        const outputBlob = new Blob(recordedChunks, { type: mimeType });
        resolve(outputBlob);
      };

      video.currentTime = 0;

      video.onseeked = () => {
        mediaRecorder.start(100);
        video.play();

        const duration = Math.max(0.1, video.duration);

        const drawLoop = () => {
          if (signal?.aborted) {
            if (mediaRecorder.state === 'recording') mediaRecorder.stop();
            video.pause();
            return;
          }

          if (video.currentTime >= duration || video.ended || video.paused) {
            if (mediaRecorder.state === 'recording') {
              mediaRecorder.stop();
              video.pause();
            }
            return;
          }

          // 1. Draw video frame scaled to canvas
          ctx.drawImage(video, 0, 0, targetW, targetH);

          // 2. Draw subtitles over video frame
          drawSubtitleToCanvas(
            ctx,
            options.subtitles,
            video.currentTime,
            targetW,
            targetH,
            options.style
          );

          // 3. Progress report
          const progress = Math.min(100, Math.round((video.currentTime / duration) * 100));
          if (onProgress) onProgress(progress);

          requestAnimationFrame(drawLoop);
        };

        requestAnimationFrame(drawLoop);
      };
    };

    video.onerror = () => {
      reject(new Error('동영상 로드에 실패했습니다. 코덱 또는 CORS 설정을 확인해주세요.'));
    };
  });
}
