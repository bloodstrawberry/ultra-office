// ----------------------------------------------------------------------
// STT Processor - Speech-to-Text & Subtitle Format Generator (SRT, VTT, TXT)
// ----------------------------------------------------------------------

import type { STTLanguage, STTTranscriptItem } from '../types';

export const SUPPORTED_STT_LANGUAGES: STTLanguage[] = [
  { code: 'ko-KR', label: '한국어 (Korean)', native: '한국어' },
  { code: 'en-US', label: '영어 - 미국 (English US)', native: 'English (US)' },
  { code: 'en-GB', label: '영어 - 영국 (English UK)', native: 'English (UK)' },
  { code: 'ja-JP', label: '일본어 (Japanese)', native: '日本語' },
  { code: 'zh-CN', label: '중국어 간체 (Chinese Simplified)', native: '简体中文' },
  { code: 'zh-TW', label: '중국어 번체 (Chinese Traditional)', native: '繁體中文' },
  { code: 'es-ES', label: '스페인어 (Spanish)', native: 'Español' },
  { code: 'fr-FR', label: '프랑스어 (French)', native: 'Français' },
  { code: 'de-DE', label: '독일어 (German)', native: 'Deutsch' },
  { code: 'ru-RU', label: '러시아어 (Russian)', native: 'Русский' },
  { code: 'vi-VN', label: '베트남어 (Vietnamese)', native: 'Tiếng Việt' },
];

/**
 * Check if Web Speech Recognition API is supported in browser
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
  );
}

/**
 * Format seconds to SRT timestamp: 00:01:23,456
 */
export function formatSrtTimestamp(seconds: number): string {
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
export function formatVttTimestamp(seconds: number): string {
  const safeSec = Math.max(0, isNaN(seconds) ? 0 : seconds);
  const hours = Math.floor(safeSec / 3600);
  const minutes = Math.floor((safeSec % 3600) / 60);
  const secs = Math.floor(safeSec % 60);
  const millis = Math.floor((safeSec % 1) * 1000);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
}

/**
 * Format seconds to MM:SS or HH:MM:SS for UI display
 */
export function formatTimestampDisplay(seconds: number): string {
  const safeSec = Math.max(0, isNaN(seconds) ? 0 : seconds);
  const hours = Math.floor(safeSec / 3600);
  const minutes = Math.floor((safeSec % 3600) / 60);
  const secs = Math.floor(safeSec % 60);

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Convert transcript items to SubRip (.srt) subtitle format
 */
export function transcriptsToSrt(items: STTTranscriptItem[]): string {
  return items
    .filter((item) => item.text.trim().length > 0)
    .map((item, index) => {
      const srtIndex = index + 1;
      const start = formatSrtTimestamp(item.startTime);
      const end = formatSrtTimestamp(Math.max(item.endTime, item.startTime + 0.5));
      return `${srtIndex}\n${start} --> ${end}\n${item.text.trim()}\n`;
    })
    .join('\n');
}

/**
 * Convert transcript items to WebVTT (.vtt) format
 */
export function transcriptsToVtt(items: STTTranscriptItem[]): string {
  const header = 'WEBVTT\n\n';
  const body = items
    .filter((item) => item.text.trim().length > 0)
    .map((item, index) => {
      const vttIndex = index + 1;
      const start = formatVttTimestamp(item.startTime);
      const end = formatVttTimestamp(Math.max(item.endTime, item.startTime + 0.5));
      return `${vttIndex}\n${start} --> ${end}\n${item.text.trim()}\n`;
    })
    .join('\n');

  return header + body;
}

/**
 * Convert transcript items to plain text (.txt)
 */
export function transcriptsToTxt(items: STTTranscriptItem[], includeTimestamp = false): string {
  return items
    .filter((item) => item.text.trim().length > 0)
    .map((item) => {
      if (includeTimestamp) {
        return `[${formatTimestampDisplay(item.startTime)} ~ ${formatTimestampDisplay(item.endTime)}] ${item.text.trim()}`;
      }
      return item.text.trim();
    })
    .join('\n');
}

/**
 * Convert transcript items to JSON string
 */
export function transcriptsToJson(items: STTTranscriptItem[], videoName = 'video'): string {
  const data = {
    source: videoName,
    exportedAt: new Date().toISOString(),
    totalSegments: items.length,
    segments: items.map((item, idx) => ({
      index: idx + 1,
      startTime: item.startTime,
      endTime: item.endTime,
      startFormatted: formatTimestampDisplay(item.startTime),
      endFormatted: formatTimestampDisplay(item.endTime),
      text: item.text.trim(),
    })),
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Helper to download text content as file
 */
export function downloadTextFile(content: string, filename: string, mimeType = 'text/plain') {
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
