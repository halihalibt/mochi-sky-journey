import { TowerZoneId } from './TowerMath';

export type BgmTrack = 'NONE' | 'TUNNEL' | 'TOWER';

interface ZoneMusicProfile {
  intervalMs: number;
  melody: number[];
  bass: number[];
  leadWave: OscillatorType;
}

const ZONE_MUSIC_PROFILES: Record<TowerZoneId, ZoneMusicProfile> = {
  CLOUD_RUINS: {
    intervalMs: 215,
    melody: [293.66, 369.99, 440.0, 587.33, 659.25, 587.33, 440.0, 369.99],
    bass: [146.83, 146.83, 185.0, 220.0],
    leadWave: 'triangle'
  },
  SKY_GARDEN: {
    intervalMs: 200,
    melody: [329.63, 392.0, 493.88, 587.33, 659.25, 783.99, 659.25, 493.88],
    bass: [164.81, 196.0, 246.94, 196.0],
    leadWave: 'sine'
  },
  STORM_MECH: {
    intervalMs: 175,
    melody: [329.63, 440.0, 493.88, 523.25, 659.25, 523.25, 493.88, 392.0],
    bass: [164.81, 164.81, 220.0, 196.0],
    leadWave: 'sawtooth'
  },
  AURORA_CRYSTAL: {
    intervalMs: 195,
    melody: [392.0, 493.88, 587.33, 783.99, 880.0, 783.99, 587.33, 493.88],
    bass: [196.0, 246.94, 293.66, 246.94],
    leadWave: 'sine'
  },
  STARLIGHT_CROWN: {
    intervalMs: 168,
    melody: [440.0, 554.37, 659.25, 880.0, 987.77, 1108.73, 880.0, 659.25],
    bass: [220.0, 277.18, 329.63, 440.0],
    leadWave: 'triangle'
  }
};

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterVolume: number = 0.8;
  private currentTrack: BgmTrack = 'NONE';
  private currentZone: TowerZoneId = 'CLOUD_RUINS';
  private bgmIntervalId: number | null = null;
  private stepIndex = 0;

  private readonly MUTE_STORAGE_KEY = 'mochi_sky_audio_muted';
  private readonly VOL_STORAGE_KEY = 'mochi_sky_audio_volume';

  constructor() {
    const savedMuted = localStorage.getItem(this.MUTE_STORAGE_KEY);
    this.isMuted = savedMuted === 'true';

    const savedVol = localStorage.getItem(this.VOL_STORAGE_KEY);
    if (savedVol !== null) {
      const parsed = parseFloat(savedVol);
      if (!Number.isNaN(parsed)) {
        this.masterVolume = Math.max(0, Math.min(1, parsed));
      }
    }
  }

  public unlockAndStart(track: BgmTrack = 'TUNNEL'): void {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
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
    localStorage.setItem(this.MUTE_STORAGE_KEY, String(this.isMuted));
    if (this.isMuted) {
      this.stopBgmLoop();
    } else if (this.currentTrack !== 'NONE') {
      this.startBgmLoop();
    }
    return this.isMuted;
  }

  public getVolume(): number {
    return this.masterVolume;
  }

  public setVolume(vol: number): void {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    localStorage.setItem(this.VOL_STORAGE_KEY, String(this.masterVolume));
  }

  public switchBgm(track: BgmTrack): void {
    this.currentTrack = track;
    this.stopBgmLoop();
    if (!this.isMuted && track !== 'NONE') {
      this.startBgmLoop();
    }
  }

  public setTowerZone(zoneId: TowerZoneId): void {
    if (this.currentZone === zoneId) return;
    this.currentZone = zoneId;
    if (this.currentTrack === 'TOWER' && !this.isMuted) {
      this.startBgmLoop();
    }
  }

  private startBgmLoop(): void {
    this.stopBgmLoop();
    const tunnelScale = [
      261.63, 329.63, 392.0, 493.88, 523.25, 659.25, 587.33, 392.0
    ];
    const zoneProfile = ZONE_MUSIC_PROFILES[this.currentZone];
    const intervalMs =
      this.currentTrack === 'TUNNEL' ? 230 : zoneProfile.intervalMs;

    this.bgmIntervalId = window.setInterval(() => {
      if (this.isMuted || !this.ctx || this.ctx.state !== 'running') return;

      if (this.currentTrack === 'TUNNEL') {
        const freq = tunnelScale[this.stepIndex % tunnelScale.length];
        this.playTone(freq, 'sine', 0.22, 0.042);
      } else {
        const prof = ZONE_MUSIC_PROFILES[this.currentZone];
        const freq = prof.melody[this.stepIndex % prof.melody.length];
        const waveVol = prof.leadWave === 'sawtooth' ? 0.024 : 0.044;
        this.playTone(freq, prof.leadWave, 0.21, waveVol);

        if (this.stepIndex % 2 === 0) {
          const bassFreq =
            prof.bass[Math.floor(this.stepIndex / 2) % prof.bass.length];
          this.playTone(bassFreq, 'sine', 0.34, 0.032);
        }
      }
      this.stepIndex++;
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
    osc.frequency.exponentialRampToValueAtTime(690, now + 0.14);

    gain.gain.setValueAtTime(0.14 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playDash(): void {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(580, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.16);

    gain.gain.setValueAtTime(0.16 * this.masterVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.17);
  }

  public playGlideStart(): void {
    this.playTone(523.25, 'sine', 0.18, 0.08);
    setTimeout(() => this.playTone(659.25, 'sine', 0.24, 0.08), 60);
  }

  public playLand(): void {
    this.playTone(145, 'sine', 0.09, 0.09);
  }

  public playOrbCollect(combo: number = 1): void {
    const pitchBoost = Math.min(1.5, 1 + combo * 0.04);
    this.playTone(783.99 * pitchBoost, 'sine', 0.14, 0.11);
    setTimeout(
      () => this.playTone(1046.5 * pitchBoost, 'triangle', 0.18, 0.11),
      55
    );
  }

  public playComboMilestone(): void {
    const notes = [587.33, 739.99, 880.0, 1174.66];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.22, 0.14), idx * 65);
    });
  }

  public playHiddenPlatformFound(): void {
    const notes = [659.25, 830.61, 987.77, 1318.5];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.28, 0.15), idx * 75);
    });
  }

  public playHistoryGatePass(): void {
    this.playTone(587.33, 'sine', 0.18, 0.1);
    setTimeout(() => this.playTone(880.0, 'sine', 0.25, 0.12), 90);
  }

  public playEarlySimMilestone(): void {
    const notes = [440.0, 554.37, 659.25];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.22, 0.13), idx * 70);
    });
  }

  public playMinorMilestoneSurpass(): void {
    this.playTone(659.25, 'triangle', 0.16, 0.12);
    setTimeout(() => this.playTone(880.0, 'triangle', 0.22, 0.14), 70);
  }

  public playMilestoneSurpass(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.32, 0.18);
      }, idx * 85);
    });
  }

  public playZoneEnter(): void {
    const notes = [392.0, 493.88, 587.33, 783.99];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.36, 0.13), idx * 95);
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

    gain.gain.setValueAtTime(0.18 * this.masterVolume, now);
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
    const effectiveVol = Math.max(0.0001, volume * this.masterVolume);
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(effectiveVol, now);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }
}
