/**
 * Web Speech API 음성 재생 (TTS) 및 음성 인식 (STT) 래퍼 서비스
 */

export function speakText(
  text: string,
  langCode: string,
  rate: number = 1.0,
  pitch: number = 1.0
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis is not supported in this browser.');
    return;
  }

  // 기존 음성 정지
  window.speechSynthesis.cancel();

  if (!text.trim()) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = langCode;
  utterance.rate = Math.max(0.5, Math.min(2.0, rate));
  utterance.pitch = Math.max(0.5, Math.min(1.5, pitch));

  // 사용 가능한 목소리 중 일치하는 언어 탐색
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith(langCode.toLowerCase()));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
}

export interface SpeechRecognitionResultHandler {
  onResult: (transcript: string) => void;
  onError?: (error: unknown) => void;
  onEnd?: () => void;
}

export function startSpeechRecognition(
  langCode: string,
  handlers: SpeechRecognitionResultHandler
): { stop: () => void } | null {
  if (typeof window === 'undefined') return null;

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    handlers.onError?.(new Error('Speech recognition not supported in this browser.'));
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = langCode;
  recognition.interimResults = true;
  recognition.continuous = false;

  recognition.onresult = (event: any) => {
    let finalTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const transcript = event.results[i][0].transcript;
      finalTranscript += transcript;
    }
    if (finalTranscript) {
      handlers.onResult(finalTranscript);
    }
  };

  recognition.onerror = (err: unknown) => {
    handlers.onError?.(err);
  };

  recognition.onend = () => {
    handlers.onEnd?.();
  };

  try {
    recognition.start();
    return {
      stop: () => {
        try {
          recognition.stop();
        } catch {
          // ignore
        }
      },
    };
  } catch (e) {
    handlers.onError?.(e);
    return null;
  }
}
