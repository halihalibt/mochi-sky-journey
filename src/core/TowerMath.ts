import * as THREE from 'three';
import { i18n } from '../i18n/I18nManager';

export type TowerZoneId =
  | 'CLOUD_RUINS'
  | 'SKY_GARDEN'
  | 'STORM_MECH'
  | 'AURORA_CRYSTAL'
  | 'STARLIGHT_CROWN';

export interface TowerZoneSpec {
  id: TowerZoneId;
  index: number;
  startRatio: number;
  endRatio: number;
  primaryColor: number;
  accentColor: number;
  fogColor: number;
  trackColor: number;
  emissiveTrimColor: number;
}

export const TOWER_ZONES: TowerZoneSpec[] = [
  {
    id: 'CLOUD_RUINS',
    index: 0,
    startRatio: 0.0,
    endRatio: 0.2,
    primaryColor: 0x1e293b,
    accentColor: 0x38bdf8,
    fogColor: 0x0b1528,
    trackColor: 0x263449,
    emissiveTrimColor: 0x38bdf8
  },
  {
    id: 'SKY_GARDEN',
    index: 1,
    startRatio: 0.2,
    endRatio: 0.4,
    primaryColor: 0x0f2922,
    accentColor: 0x34d399,
    fogColor: 0x071a18,
    trackColor: 0x16382f,
    emissiveTrimColor: 0x2dd4bf
  },
  {
    id: 'STORM_MECH',
    index: 2,
    startRatio: 0.4,
    endRatio: 0.6,
    primaryColor: 0x271c3a,
    accentColor: 0xf59e0b,
    fogColor: 0x120d24,
    trackColor: 0x2e2344,
    emissiveTrimColor: 0xfbbf24
  },
  {
    id: 'AURORA_CRYSTAL',
    index: 3,
    startRatio: 0.6,
    endRatio: 0.8,
    primaryColor: 0x0f2537,
    accentColor: 0x22d3ee,
    fogColor: 0x061626,
    trackColor: 0x16334a,
    emissiveTrimColor: 0x67e8f9
  },
  {
    id: 'STARLIGHT_CROWN',
    index: 4,
    startRatio: 0.8,
    endRatio: 1.0,
    primaryColor: 0x1e1b4b,
    accentColor: 0xc084fc,
    fogColor: 0x050814,
    trackColor: 0x282461,
    emissiveTrimColor: 0xe879f9
  }
];

export interface HelixConfig {
  towerRadius: number;
  trackOffset: number;
  trackWidth: number;
  pitchPerRevolution: number;
  totalHeight: number;
  minMarketCapUSD: number;
  maxMarketCapUSD: number;
}

export const DEFAULT_HELIX_CONFIG: HelixConfig = {
  towerRadius: 14.5,
  trackOffset: 2.8,
  trackWidth: 4.8,
  pitchPerRevolution: 20,
  totalHeight: 480,
  minMarketCapUSD: 100_000_000,
  maxMarketCapUSD: 2_487_527_052_037.3
};

export class TowerMath {
  public readonly config: HelixConfig;
  private readonly logRatio: number;

  constructor(config: HelixConfig = DEFAULT_HELIX_CONFIG) {
    this.config = config;
    this.logRatio = Math.log(config.maxMarketCapUSD / config.minMarketCapUSD);
  }

  public heightToMarketCap(y: number): number {
    const clampedY = THREE.MathUtils.clamp(y, 0, this.config.totalHeight);
    const normalizedY = clampedY / this.config.totalHeight;
    return (
      this.config.minMarketCapUSD *
      Math.pow(this.config.maxMarketCapUSD / this.config.minMarketCapUSD, normalizedY)
    );
  }

  public marketCapToHeight(marketCapUSD: number): number {
    if (marketCapUSD <= this.config.minMarketCapUSD) return 0;
    if (marketCapUSD >= this.config.maxMarketCapUSD) return this.config.totalHeight;
    const progress = Math.log(marketCapUSD / this.config.minMarketCapUSD) / this.logRatio;
    return progress * this.config.totalHeight;
  }

  public thetaToBaseHeight(theta: number): number {
    return (Math.max(0, theta) / (Math.PI * 2)) * this.config.pitchPerRevolution;
  }

  public baseHeightToTheta(y: number): number {
    return (Math.max(0, y) / this.config.pitchPerRevolution) * (Math.PI * 2);
  }

  public getZoneByHeight(y: number): TowerZoneSpec {
    const ratio = THREE.MathUtils.clamp(y / this.config.totalHeight, 0, 0.9999);
    for (const z of TOWER_ZONES) {
      if (ratio >= z.startRatio && ratio < z.endRatio) {
        return z;
      }
    }
    return TOWER_ZONES[TOWER_ZONES.length - 1];
  }

  public cylindricalToWorld(
    theta: number,
    jumpY: number = 0,
    laneOffset: number = 0,
    allowExtendedOuter: boolean = false
  ): THREE.Vector3 {
    const maxInner = -this.config.trackWidth * 0.46;
    const maxOuter = allowExtendedOuter
      ? this.config.trackWidth * 0.95
      : this.config.trackWidth * 0.46;
    const clampedLane = THREE.MathUtils.clamp(laneOffset, maxInner, maxOuter);
    const radius = this.config.towerRadius + this.config.trackOffset + clampedLane;
    const baseY = this.thetaToBaseHeight(theta);

    const x = radius * Math.cos(theta);
    const z = radius * Math.sin(theta);
    const y = baseY + jumpY;

    return new THREE.Vector3(x, y, z);
  }

  public getTangentAtTheta(theta: number): THREE.Vector3 {
    const radius = this.config.towerRadius + this.config.trackOffset;
    const dyPerRad = this.config.pitchPerRevolution / (Math.PI * 2);
    const tangent = new THREE.Vector3(
      -radius * Math.sin(theta),
      dyPerRad,
      radius * Math.cos(theta)
    );
    return tangent.normalize();
  }

  public getOutwardNormalAtTheta(theta: number): THREE.Vector3 {
    return new THREE.Vector3(Math.cos(theta), 0, Math.sin(theta)).normalize();
  }

  /**
   * Computes an anti-occlusion orbital camera pose that keeps the spiral road,
   * upcoming obstacles, and Mochi's landing indicator clearly visible.
   */
  public computeOrbitalCameraPose(
    playerTheta: number,
    playerJumpY: number,
    playerRadialLane: number = 0,
    lookAheadBoost: number = 0
  ): { position: THREE.Vector3; lookAt: THREE.Vector3 } {
    const baseRadius =
      this.config.towerRadius +
      this.config.trackOffset +
      playerRadialLane * 0.45;
    const cameraDistance = 15.2 + Math.min(2.5, Math.max(0, playerJumpY * 0.25));
    const cameraElevation = 6.9 + Math.max(0, playerJumpY * 0.48);
    const lookAheadThetaOffset = 0.155 + lookAheadBoost;

    const camAngle = playerTheta - 0.19;
    const playerBaseY = this.thetaToBaseHeight(playerTheta);

    const position = new THREE.Vector3(
      (baseRadius + cameraDistance) * Math.cos(camAngle),
      playerBaseY + cameraElevation,
      (baseRadius + cameraDistance) * Math.sin(camAngle)
    );

    const lookAtTheta = playerTheta + lookAheadThetaOffset;
    const lookAt = new THREE.Vector3(
      baseRadius * Math.cos(lookAtTheta),
      this.thetaToBaseHeight(lookAtTheta) + playerJumpY * 0.32 + 1.15,
      baseRadius * Math.sin(lookAtTheta)
    );

    return { position, lookAt };
  }

  public static formatUSD(amount: number): string {
    return i18n.formatUSD(amount);
  }
}
