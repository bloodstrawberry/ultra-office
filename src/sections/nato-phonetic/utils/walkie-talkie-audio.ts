/**
 * Walkie-Talkie Audio Synthesizer & Speech Player
 * Plays Roger Beep sound effects and speaks phonetic words using Web Speech API.
 */

class WalkieTalkieAudio {
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  /**
   * Plays realistic radio transmission start / stop 'Roger Beep' & mic click sound.
   */
  public playRogerBeep(type: 'open' | 'close' = 'close') {
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const freq = type === 'open' ? 1200 : 1000;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // Audio context might fail on non-gesture
    }
  }

  /**
   * Speaks a sequence of phonetic words with SpeechSynthesis.
   */
  public speakWords(words: string[], lang = 'en-US', onProgress?: (idx: number) => void, onComplete?: () => void) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onComplete?.();
      return;
    }

    window.speechSynthesis.cancel();
    this.playRogerBeep('open');

    const cleanWords = words.filter((w) => w && w !== '[공백]');
    if (cleanWords.length === 0) {
      onComplete?.();
      return;
    }

    let currentIndex = 0;

    const speakNext = () => {
      if (currentIndex >= cleanWords.length) {
        this.playRogerBeep('close');
        onComplete?.();
        return;
      }

      const word = cleanWords[currentIndex];
      onProgress?.(currentIndex);

      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = lang;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        currentIndex += 1;
        setTimeout(speakNext, 120);
      };

      utterance.onerror = () => {
        currentIndex += 1;
        setTimeout(speakNext, 120);
      };

      window.speechSynthesis.speak(utterance);
    };

    setTimeout(speakNext, 200);
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const walkieTalkie = new WalkieTalkieAudio();
