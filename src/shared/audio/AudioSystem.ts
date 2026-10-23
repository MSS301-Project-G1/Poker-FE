export type SoundName = 'chip' | 'card' | 'shuffle' | 'check' | 'fold' | 'win' | 'turn' | 'urgent' | 'click' | 'match';

type Voice = { type: OscillatorType; from: number; to: number; duration: number; gain: number; delay?: number; noise?: boolean };

/** Procedural one-shot sounds (no audio assets). Unlocks on the first gesture. */
const VOICES: Record<SoundName, Voice[]> = {
  chip: [
    { type: 'triangle', from: 2400, to: 1800, duration: 0.05, gain: 0.05, noise: true },
    { type: 'triangle', from: 2900, to: 2100, duration: 0.04, gain: 0.035, delay: 0.045, noise: true },
  ],
  card: [{ type: 'sawtooth', from: 900, to: 300, duration: 0.07, gain: 0.03, noise: true }],
  shuffle: [
    { type: 'sawtooth', from: 700, to: 300, duration: 0.06, gain: 0.025, noise: true },
    { type: 'sawtooth', from: 700, to: 300, duration: 0.06, gain: 0.025, delay: 0.07, noise: true },
    { type: 'sawtooth', from: 700, to: 300, duration: 0.06, gain: 0.025, delay: 0.14, noise: true },
  ],
  check: [
    { type: 'sine', from: 180, to: 120, duration: 0.06, gain: 0.12 },
    { type: 'sine', from: 180, to: 120, duration: 0.06, gain: 0.1, delay: 0.11 },
  ],
  fold: [{ type: 'sine', from: 420, to: 180, duration: 0.18, gain: 0.05 }],
  win: [
    { type: 'triangle', from: 523, to: 523, duration: 0.14, gain: 0.07 },
    { type: 'triangle', from: 659, to: 659, duration: 0.14, gain: 0.07, delay: 0.11 },
    { type: 'triangle', from: 784, to: 784, duration: 0.14, gain: 0.07, delay: 0.22 },
    { type: 'triangle', from: 1046, to: 1046, duration: 0.3, gain: 0.06, delay: 0.33 },
  ],
  // Rising three-note chime, easy to notice while looking elsewhere.
  turn: [
    { type: 'sine', from: 660, to: 660, duration: 0.12, gain: 0.08 },
    { type: 'sine', from: 880, to: 880, duration: 0.12, gain: 0.08, delay: 0.11 },
    { type: 'sine', from: 1320, to: 1320, duration: 0.22, gain: 0.07, delay: 0.22 },
  ],
  urgent: [
    { type: 'square', from: 990, to: 990, duration: 0.07, gain: 0.04 },
    { type: 'square', from: 990, to: 990, duration: 0.07, gain: 0.04, delay: 0.14 },
    { type: 'square', from: 990, to: 990, duration: 0.07, gain: 0.04, delay: 0.28 },
  ],
  click: [{ type: 'square', from: 1200, to: 900, duration: 0.03, gain: 0.02 }],
  match: [
    { type: 'triangle', from: 392, to: 392, duration: 0.12, gain: 0.07 },
    { type: 'triangle', from: 587, to: 587, duration: 0.2, gain: 0.07, delay: 0.12 },
  ],
};

export class AudioSystem {
  private context: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private unlocked = false;
  enabled = true;
  private readonly unlockOnGesture = () => { void this.unlock().catch(() => {}); };

  constructor() {
    window.addEventListener('pointerdown', this.unlockOnGesture, { once: true });
    window.addEventListener('keydown', this.unlockOnGesture, { once: true });
  }

  async unlock(): Promise<void> {
    if (this.unlocked || this.context) return;
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    this.context = new AudioContextClass();
    await this.context.resume();
    this.unlocked = true;
    const length = Math.floor(this.context.sampleRate * 0.2);
    this.noiseBuffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    // Fixed LCG so the click texture is identical every run.
    let seed = 1234567;
    for (let i = 0; i < length; i += 1) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      data[i] = (seed / 0x7fffffff) * 2 - 1;
    }
  }

  play(name: SoundName): void {
    const ctx = this.context;
    if (!this.enabled || !ctx || ctx.state !== 'running') return;
    for (const voice of VOICES[name]) {
      const start = ctx.currentTime + (voice.delay ?? 0);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(voice.gain, start + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + voice.duration);
      gain.connect(ctx.destination);
      if (voice.noise && this.noiseBuffer) {
        const source = ctx.createBufferSource();
        source.buffer = this.noiseBuffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(voice.from, start);
        filter.Q.value = 1.4;
        source.connect(filter).connect(gain);
        source.start(start);
        source.stop(start + voice.duration + 0.02);
        continue;
      }
      const osc = ctx.createOscillator();
      osc.type = voice.type;
      osc.frequency.setValueAtTime(voice.from, start);
      if (voice.to !== voice.from) osc.frequency.exponentialRampToValueAtTime(voice.to, start + voice.duration);
      osc.connect(gain);
      osc.start(start);
      osc.stop(start + voice.duration + 0.02);
    }
  }

  dispose(): void {
    window.removeEventListener('pointerdown', this.unlockOnGesture);
    window.removeEventListener('keydown', this.unlockOnGesture);
    void this.context?.close().catch(() => {});
    this.context = null;
  }
}
