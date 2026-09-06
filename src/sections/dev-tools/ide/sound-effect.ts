// ----------------------------------------------------------------------
// Web Audio API Procedural Mechanical Keyboard Sound Synthesizer
// 6 Distinct Keyboard Sound Profiles with zero external file dependencies
// ----------------------------------------------------------------------

export type KeyboardSoundType = 'blue' | 'brown' | 'creamy' | 'red' | 'typewriter' | 'cyber';

export interface KeyboardSoundInfo {
  id: KeyboardSoundType;
  name: string;
  tag: string;
  desc: string;
  color: string;
}

export const KEYBOARD_SOUND_PROFILES: KeyboardSoundInfo[] = [
  {
    id: 'blue',
    name: '청축 (Cherry MX Blue)',
    tag: '찰칵 클릭키',
    desc: '명쾌하고 시원한 클릭 스위치 스냅 사운드',
    color: '#1e88e5',
  },
  {
    id: 'brown',
    name: '갈축 / 팬더 (Tactile Thock)',
    tag: '도각도각 넌클릭',
    desc: '깊고 묵직한 중저음 도각거림과 바닥 치는 울림',
    color: '#8d6e63',
  },
  {
    id: 'creamy',
    name: '크리미 폼떡 (Creamy Marble)',
    tag: '조약돌 보글보글',
    desc: '풀윤활 폼떡 가스켓 커스텀의 자글자글 빗소리 타건음',
    color: '#ab47bc',
  },
  {
    id: 'red',
    name: '저소음 적축 (Silent Linear)',
    tag: '몽글몽글 저소음',
    desc: '사무실용 조용하고 부드러운 댐퍼 쿠션 타건음',
    color: '#e53935',
  },
  {
    id: 'typewriter',
    name: '빈티지 타자기 (Typewriter)',
    tag: '아날로그 메탈',
    desc: '타자기 쇠망치 타격음 및 줄바꿈 시 경쾌한 종소리(Ding!)',
    color: '#fb8c00',
  },
  {
    id: 'cyber',
    name: '사이버 터미널 (8-Bit Sci-Fi)',
    tag: 'SF 해커 비프',
    desc: '영화 속 천재 해커 터미널의 레트로 아케이드 칩사운드',
    color: '#00e676',
  },
];

class KeyboardAudioPlayer {
  private audioCtx: AudioContext | null = null;

  private gainNode: GainNode | null = null;

  private isMuted: boolean = false;

  private volume: number = 0.28;

  private currentType: KeyboardSoundType = 'blue';

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
        this.gainNode = this.audioCtx.createGain();
        this.gainNode.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
        this.gainNode.connect(this.audioCtx.destination);
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public setSoundType(type: KeyboardSoundType) {
    this.currentType = type;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
    }
  }

  public playKey(char: string = 'a', overrideType?: KeyboardSoundType) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx || !this.gainNode) return;

    const type = overrideType || this.currentType;
    const now = ctx.currentTime;
    const isEnter = char === '\n';
    const isSpace = char === ' ';

    try {
      switch (type) {
        // ----------------------------------------------------
        // 1. 청축 (Cherry MX Blue / Clicky)
        // ----------------------------------------------------
        case 'blue': {
          const osc1 = ctx.createOscillator();
          const gain1 = ctx.createGain();
          const snapFreq = isEnter ? 900 : isSpace ? 1100 : 1600 + (Math.random() * 300 - 150);
          osc1.type = 'triangle';
          osc1.frequency.setValueAtTime(snapFreq, now);
          osc1.frequency.exponentialRampToValueAtTime(140, now + 0.022);

          gain1.gain.setValueAtTime(isEnter ? 0.35 : 0.22, now);
          gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.022);
          osc1.connect(gain1);
          gain1.connect(this.gainNode);
          osc1.start(now);
          osc1.stop(now + 0.025);

          // Housing snap
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(isEnter ? 140 : 210 + (Math.random() * 40 - 20), now);
          osc2.frequency.exponentialRampToValueAtTime(70, now + 0.04);
          gain2.gain.setValueAtTime(0.18, now);
          gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
          osc2.connect(gain2);
          gain2.connect(this.gainNode);
          osc2.start(now);
          osc2.stop(now + 0.045);
          break;
        }

        // ----------------------------------------------------
        // 2. 갈축 / 홀리팬더 (Tactile Deep Thock)
        // ----------------------------------------------------
        case 'brown': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const thockFreq = isEnter ? 110 : isSpace ? 140 : 180 + (Math.random() * 30 - 15);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(thockFreq, now);
          osc.frequency.exponentialRampToValueAtTime(55, now + 0.05);

          gain.gain.setValueAtTime(isEnter ? 0.45 : 0.28, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
          osc.connect(gain);
          gain.connect(this.gainNode);
          osc.start(now);
          osc.stop(now + 0.055);

          // Subtle tactile bump
          const bump = ctx.createOscillator();
          const bumpGain = ctx.createGain();
          bump.type = 'triangle';
          bump.frequency.setValueAtTime(420 + (Math.random() * 60 - 30), now);
          bump.frequency.exponentialRampToValueAtTime(100, now + 0.018);
          bumpGain.gain.setValueAtTime(0.12, now);
          bumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);
          bump.connect(bumpGain);
          bumpGain.connect(this.gainNode);
          bump.start(now);
          bump.stop(now + 0.02);
          break;
        }

        // ----------------------------------------------------
        // 3. 크리미 폼떡 (Creamy Marble Pop)
        // ----------------------------------------------------
        case 'creamy': {
          const pop = ctx.createOscillator();
          const popGain = ctx.createGain();
          const popFreq = isEnter ? 260 : isSpace ? 340 : 480 + (Math.random() * 80 - 40);
          pop.type = 'sine';
          pop.frequency.setValueAtTime(popFreq, now);
          pop.frequency.exponentialRampToValueAtTime(120, now + 0.035);

          popGain.gain.setValueAtTime(isEnter ? 0.4 : 0.28, now);
          popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
          pop.connect(popGain);
          popGain.connect(this.gainNode);
          pop.start(now);
          pop.stop(now + 0.04);

          // Deep raindrop marble body
          const body = ctx.createOscillator();
          const bodyGain = ctx.createGain();
          body.type = 'triangle';
          body.frequency.setValueAtTime(160 + (Math.random() * 20 - 10), now);
          body.frequency.exponentialRampToValueAtTime(75, now + 0.04);
          bodyGain.gain.setValueAtTime(0.16, now);
          bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
          body.connect(bodyGain);
          bodyGain.connect(this.gainNode);
          body.start(now);
          body.stop(now + 0.045);
          break;
        }

        // ----------------------------------------------------
        // 4. 저소음 적축 (Silent Linear / Muffled)
        // ----------------------------------------------------
        case 'red': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const freq = isEnter ? 95 : isSpace ? 115 : 140 + (Math.random() * 20 - 10);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          osc.frequency.exponentialRampToValueAtTime(45, now + 0.03);

          gain.gain.setValueAtTime(isEnter ? 0.25 : 0.16, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
          osc.connect(gain);
          gain.connect(this.gainNode);
          osc.start(now);
          osc.stop(now + 0.035);
          break;
        }

        // ----------------------------------------------------
        // 5. 빈티지 타자기 (Typewriter with Carriage Bell)
        // ----------------------------------------------------
        case 'typewriter': {
          // Metal strike hammer
          const osc1 = ctx.createOscillator();
          const gain1 = ctx.createGain();
          osc1.type = 'sawtooth';
          const strikeFreq = isEnter ? 450 : isSpace ? 650 : 850 + (Math.random() * 150 - 75);
          osc1.frequency.setValueAtTime(strikeFreq, now);
          osc1.frequency.exponentialRampToValueAtTime(90, now + 0.045);

          gain1.gain.setValueAtTime(0.24, now);
          gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
          osc1.connect(gain1);
          gain1.connect(this.gainNode);
          osc1.start(now);
          osc1.stop(now + 0.05);

          // Heavy chassis clunk
          const clunk = ctx.createOscillator();
          const clunkGain = ctx.createGain();
          clunk.type = 'square';
          clunk.frequency.setValueAtTime(140 + (Math.random() * 30 - 15), now);
          clunk.frequency.exponentialRampToValueAtTime(40, now + 0.06);
          clunkGain.gain.setValueAtTime(0.2, now);
          clunkGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
          clunk.connect(clunkGain);
          clunkGain.connect(this.gainNode);
          clunk.start(now);
          clunk.stop(now + 0.065);

          // Carriage return bell on Enter! (Ding!)
          if (isEnter) {
            const bell = ctx.createOscillator();
            const bellGain = ctx.createGain();
            bell.type = 'sine';
            bell.frequency.setValueAtTime(2480, now + 0.02);
            bellGain.gain.setValueAtTime(0.3, now + 0.02);
            bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
            bell.connect(bellGain);
            bellGain.connect(this.gainNode);
            bell.start(now + 0.02);
            bell.stop(now + 0.5);
          }
          break;
        }

        // ----------------------------------------------------
        // 6. 사이버펑크 터미널 (8-Bit Sci-Fi Blip)
        // ----------------------------------------------------
        case 'cyber': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          const startF = isEnter ? 440 : isSpace ? 660 : 880 + (Math.random() * 200 - 100);
          osc.frequency.setValueAtTime(startF, now);
          osc.frequency.exponentialRampToValueAtTime(startF * 0.4, now + 0.02);

          gain.gain.setValueAtTime(isEnter ? 0.22 : 0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
          osc.connect(gain);
          gain.connect(this.gainNode);
          osc.start(now);
          osc.stop(now + 0.025);
          break;
        }

        default:
          break;
      }
    } catch {
      // ignore audio synthesize errors
    }
  }
}

export const keyboardAudio = new KeyboardAudioPlayer();
