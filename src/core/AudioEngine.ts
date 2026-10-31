export type BgmTrack = 'NONE' | 'TUNNEL' | 'TOWER';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private currentTrack: BgmTrack = 'NONE';
  private bgmIntervalId: number | null = null;
  private stepIndex = 0;

  private readonly STORAGE_KEY = 'mochi_sky_audio_muted';

  constructor() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    this.isMuted = saved === 'true';
  }

  public unlockAndStart(track: BgmTrack = 'TUNNEL'): void {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.switchBgm(track);
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem(this.STORAGE_KEY, String(this.isMuted));
    if (this.isMuted) {
      this.stopBgmLoop();
    } else if (this.currentTrack !== 'NONE') {
      this.startBgmLoop();
    }
    return this.isMuted;
  }

  public switchBgm(track: BgmTrack): void {
    this.currentTrack = track;
    this.stopBgmLoop();
    if (!this.isMuted && track !== 'NONE') {
      this.startBgmLoop();
    }
  }

  private startBgmLoop(): void {
    this.stopBgmLoop();
    const intervalMs = this.currentTrack === 'TUNNEL' ? 240 : 190;
    const tunnelScale = [261.63, 329.63, 392.0, 493.88, 523.25, 659.25, 587.33, 392.0];
    const towerScale = [293.66, 369.99, 440.0, 587.33, 659.25, 587.33, 440.0, 369.99];

    this.bgmIntervalId = window.setInterval(() => {
      if (this.isMuted || !this.ctx || this.ctx.state !== 'running') return;
      const scale = this.currentTrack === 'TUNNEL' ? tunnelScale : towerScale;
      const freq = scale[this.stepIndex % scale.length];
      this.stepIndex++;

      this.playTone(
        freq,
        this.currentTrack === 'TUNNEL' ? 'sine' : 'triangle',
        0.22,
        0.045
      );
    }, intervalMs);
  }

  private stopBgmLoop(): void {
    if (this.bgmIntervalId !== null) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
  }

  public playJump(): void {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.14);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playHistoryGatePass(): void {
    this.playTone(587.33, 'sine', 0.18, 0.1);
    setTimeout(() => this.playTone(880.0, 'sine', 0.25, 0.12), 90);
  }

  public playMilestoneSurpass(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.32, 0.18);
      }, idx * 85);
    });
  }

  public playHit(): void {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(65, now + 0.22);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.24);
  }

  public playSummitVictory(): void {
    const chord = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];
    chord.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.55, 0.2);
      }, idx * 110);
    });
  }

  private playTone(
    freq: number,
    type: OscillatorType,
    duration: number,
    volume: number
  ): void {
    if (this.isMuted || !this.ctx || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }
}
