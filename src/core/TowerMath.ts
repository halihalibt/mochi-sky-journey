import * as THREE from 'three';

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
  towerRadius: 14,
  trackOffset: 2.6,
  trackWidth: 4.2,
  pitchPerRevolution: 18,
  totalHeight: 360,
  minMarketCapUSD: 100_000_000,
  maxMarketCapUSD: 1_960_000_000_000
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

  public cylindricalToWorld(
    theta: number,
    jumpY: number = 0,
    laneOffset: number = 0
  ): THREE.Vector3 {
    const clampedLane = THREE.MathUtils.clamp(
      laneOffset,
      -this.config.trackWidth * 0.45,
      this.config.trackWidth * 0.45
    );
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

  public computeOrbitalCameraPose(
    playerTheta: number,
    playerJumpY: number
  ): { position: THREE.Vector3; lookAt: THREE.Vector3 } {
    const baseRadius = this.config.towerRadius + this.config.trackOffset;
    const cameraDistance = 15.5;
    const cameraElevation = 6.8;
    const lookAheadThetaOffset = 0.14;

    const camAngle = playerTheta - 0.18;
    const playerBaseY = this.thetaToBaseHeight(playerTheta);

    const position = new THREE.Vector3(
      (baseRadius + cameraDistance) * Math.cos(camAngle),
      playerBaseY + playerJumpY * 0.45 + cameraElevation,
      (baseRadius + cameraDistance) * Math.sin(camAngle)
    );

    const lookAtTheta = playerTheta + lookAheadThetaOffset;
    const lookAt = new THREE.Vector3(
      baseRadius * Math.cos(lookAtTheta),
      this.thetaToBaseHeight(lookAtTheta) + playerJumpY * 0.3 + 1.2,
      baseRadius * Math.sin(lookAtTheta)
    );

    return { position, lookAt };
  }

  public static formatUSD(amount: number): string {
    if (amount >= 1e12) {
      return '$' + (amount / 1e12).toFixed(2) + 'T (' + (amount / 1e8).toFixed(0) + '亿)';
    }
    if (amount >= 1e9) {
      return '$' + (amount / 1e9).toFixed(2) + 'B (' + (amount / 1e8).toFixed(1) + '亿)';
    }
    return '$' + (amount / 1e6).toFixed(1) + 'M (' + (amount / 1e8).toFixed(2) + '亿)';
  }
}
