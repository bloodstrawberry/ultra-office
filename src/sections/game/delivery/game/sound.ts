// Sound player proxy matching the main application sound synthesis

export type SoundType =
  | "coin"
  | "select"
  | "start"
  | "error"
  | "match"
  | "fall"
  | "shoot"
  | "break"
  | "ice-break";

let sharedAudioContext: AudioContext | null = null;
const getAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  if (!sharedAudioContext) {
    const AudioContextClass =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (AudioContextClass) {
      sharedAudioContext = new AudioContextClass();
    }
  }
  return sharedAudioContext;
};

export const playEngineSound = (type: SoundType, muted: boolean) => {
  if (muted || typeof window === "undefined") return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const now = ctx.currentTime;

    if (type === "match") {
      // Sparkling cute fruit match arpeggio ("팡!✨")
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C5, E5, G5, C6, E6
      notes.forEach((freq, idx) => {
        const startTime = now + idx * 0.035;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = idx % 2 === 0 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(freq * 0.9, startTime);
        osc.frequency.exponentialRampToValueAtTime(
          freq * 1.25,
          startTime + 0.025,
        );
        osc.frequency.exponentialRampToValueAtTime(freq, startTime + 0.08);

        gain.gain.setValueAtTime(0.1, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.12);
      });
    } else if (type === "fall") {
      // Soft organic wood block / fruit drop ("톡")
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.045);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.045);
    } else if (type === "select") {
      // Cute Marimba / Bubble Pop for selection ("뾱!" / "퐁!")
      const osc = ctx.createOscillator();
      const oscHarmonic = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      oscHarmonic.type = "triangle";

      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.03);
      osc.frequency.exponentialRampToValueAtTime(580, now + 0.07);

      oscHarmonic.frequency.setValueAtTime(840, now);
      oscHarmonic.frequency.exponentialRampToValueAtTime(1560, now + 0.03);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      oscHarmonic.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      oscHarmonic.start(now);
      osc.stop(now + 0.07);
      oscHarmonic.stop(now + 0.07);
    } else if (type === "start") {
      // Bouncy cheerful farm pentatonic fanfare ("따다단~! 🌻")
      const notes = [
        { freq: 523.25, duration: 0.07, delay: 0 },
        { freq: 659.25, duration: 0.07, delay: 0.07 },
        { freq: 783.99, duration: 0.07, delay: 0.14 },
        { freq: 1046.5, duration: 0.22, delay: 0.21 },
      ];

      notes.forEach((note) => {
        const startTime = now + note.delay;
        const osc = ctx.createOscillator();
        const oscHarmonic = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        oscHarmonic.type = "triangle";

        osc.frequency.setValueAtTime(note.freq, startTime);
        oscHarmonic.frequency.setValueAtTime(note.freq * 2, startTime);

        gain.gain.setValueAtTime(0.1, startTime);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          startTime + note.duration,
        );

        osc.connect(gain);
        oscHarmonic.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        oscHarmonic.start(startTime);
        osc.stop(startTime + note.duration);
        oscHarmonic.stop(startTime + note.duration);
      });
    } else if (type === "error") {
      // Cute wobbly rubbery boing sound ("뽀용~" / "뾩~") instead of digital buzzer!
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.18);

      const wobbleLfo = ctx.createOscillator();
      const wobbleGain = ctx.createGain();
      wobbleLfo.frequency.setValueAtTime(25, now);
      wobbleGain.gain.setValueAtTime(35, now);
      wobbleLfo.connect(osc.frequency);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      wobbleLfo.start(now);
      osc.start(now);
      wobbleLfo.stop(now + 0.18);
      osc.stop(now + 0.18);
    } else if (type === "shoot") {
      // Soft spring pop launch ("뽀웅-!" / "쓩~!") instead of harsh 8-bit laser
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.06);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === "break") {
      // Cute wooden block snap sound ("토톡!")
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "triangle";
      osc1.frequency.setValueAtTime(220, now);
      osc1.frequency.exponentialRampToValueAtTime(80, now + 0.08);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.08);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(650, now + 0.01);
      osc2.frequency.exponentialRampToValueAtTime(250, now + 0.06);
      gain2.gain.setValueAtTime(0.1, now + 0.01);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.01);
      osc2.stop(now + 0.06);
    } else if (type === "coin") {
      // Cute Marimba / Bell harvest chime ("띠롱~! 🌟")
      const notes = [1046.5, 1318.51, 1567.98];
      notes.forEach((freq, i) => {
        const startTime = now + i * 0.06;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.18);
      });
    } else if (type === "ice-break") {
      // Crisp crystalline glass/ice shatter sound ("챙그랑-! ❄️✨")
      const frequencies = [2400, 3200, 4800, 1800, 6000];
      frequencies.forEach((freq, i) => {
        const startTime = now + i * 0.02;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = i % 2 === 0 ? "triangle" : "sine";
        osc.frequency.setValueAtTime(freq, startTime);
        osc.frequency.exponentialRampToValueAtTime(
          freq * 0.4,
          startTime + 0.12,
        );

        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.14);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.14);
      });
    }
  } catch (e) {
    console.warn("Audio Context blocked:", e);
  }
};
