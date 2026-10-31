import * as THREE from 'three';
import {
  CRYPTO_MARKET_CAP_MILESTONES,
  CryptoMilestone
} from '../data/cryptoMarketCaps';
import { TowerMath } from '../core/TowerMath';
import { ControlState } from '../core/InputController';
import { MochiCharacter } from './MochiCharacter';

export type ObstacleKind = 'GAP' | 'MOVING_BLOCK' | 'ROTATING_BAR' | 'PULSE_ZONE';

export interface TowerObstacle {
  id: string;
  kind: ObstacleKind;
  theta: number;
  angularSpan: number;
  baseRadialOffset: number;
  phase: number;
  speed: number;
  meshGroup: THREE.Group;
  hazardMaterial?: THREE.MeshBasicMaterial;
}

export interface MilestonePlatformNode {
  milestone: CryptoMilestone;
  heightY: number;
  theta: number;
  surpassed: boolean;
  badgeMesh: THREE.Mesh;
  ringMesh: THREE.Mesh;
}

export interface TowerCallbacks {
  onJumpExecuted: () => void;
  onMarketCapUpdated: (
    currentCapUSD: number,
    peakCapUSD: number,
    nextMilestone: CryptoMilestone | null,
    progressRatio: number
  ) => void;
  onMilestoneSurpassed: (milestone: CryptoMilestone, index: number, total: number) => void;
  onPlayerDamaged: (remainingHearts: number, checkpointName: string) => void;
  onPlayerFailedRun: (peakCapUSD: number, lastCheckpointName: string) => void;
  onTutorialStepChange: (hintText: string | null) => void;
  onTowerSummitReached: (finalStats: {
    totalTimeSeconds: number;
    surpassedCount: number;
    retriesUsed: number;
  }) => void;
}

export class SpiralTowerStage {
  public readonly group: THREE.Group;
  public readonly worldOrigin = new THREE.Vector3(0, 0, -1140);

  private readonly towerMath: TowerMath;
  private readonly mochi: MochiCharacter;
  private readonly callbacks: TowerCallbacks;

  private obstacles: TowerObstacle[] = [];
  private milestoneNodes: MilestonePlatformNode[] = [];
  private shockwaveRing!: THREE.Mesh;
  private shockwaveTimer = 0;

  private playerTheta = 0;
  private playerRadialLane = 0;
  private playerJumpY = 0;
  private playerVerticalVel = 0;
  private isGrounded = true;
  private coyoteTimer = 0;

  private maxReachedHeightY = 0;
  private checkpointTheta = 0;
  private checkpointName = '塔底起点 ($100M)';
  private hearts = 3;
  private retriesUsed = 0;
  private runElapsedSeconds = 0;
  private slowMoTimer = 0;
  private summitTriggered = false;

  private currentCameraTheta = 0;

  private readonly MAX_ANGULAR_SPEED = 0.36;
  private readonly RADIAL_MOVE_SPEED = 3.2;
  private readonly GRAVITY = -26.0;
  private readonly JUMP_VELOCITY = 11.4;

  constructor(
    towerMath: TowerMath,
    mochi: MochiCharacter,
    callbacks: TowerCallbacks
  ) {
    this.towerMath = towerMath;
    this.mochi = mochi;
    this.callbacks = callbacks;

    this.group = new THREE.Group();
    this.group.position.copy(this.worldOrigin);

    this.generateObstaclesLayout();
    this.buildTowerCoreAndClouds();
    this.buildSegmentedSpiralTrack();
    this.buildCryptoMilestonePlatforms();
    this.buildCelebrationShockwave();
  }

  private generateObstaclesLayout(): void {
    const maxTheta = this.towerMath.baseHeightToTheta(this.towerMath.config.totalHeight);
    const milestoneThetas = CRYPTO_MARKET_CAP_MILESTONES.map((m) =>
      this.towerMath.baseHeightToTheta(
        this.towerMath.marketCapToHeight(m.athCirculatingMarketCapUSD)
      )
    );

    let cursorTheta = 1.6;
    let index = 0;

    while (cursorTheta < maxTheta - 1.2) {
      const nearMilestone = milestoneThetas.some(
        (mt) => Math.abs(cursorTheta - mt) < 0.42
      );
      if (nearMilestone) {
        cursorTheta += 0.55;
        continue;
      }

      const progress = cursorTheta / maxTheta;
      const kinds: ObstacleKind[] = ['GAP', 'MOVING_BLOCK', 'ROTATING_BAR', 'PULSE_ZONE'];
      const availableCount = progress < 0.15 ? 2 : 4;
      const kind = kinds[index % availableCount];

      const obsGroup = new THREE.Group();
      let angularSpan = 0.14;
      let hazardMat: THREE.MeshBasicMaterial | undefined;

      if (kind === 'GAP') {
        angularSpan = 0.13 + progress * 0.04;
      } else if (kind === 'MOVING_BLOCK') {
        const blockMesh = new THREE.Mesh(
          new THREE.BoxGeometry(1.15, 1.35, 1.15),
          new THREE.MeshStandardMaterial({
            color: 0xf43f5e,
            emissive: 0x881337,
            emissiveIntensity: 0.5,
            roughness: 0.3
          })
        );
        blockMesh.position.y = 0.7;
        obsGroup.add(blockMesh);
      } else if (kind === 'ROTATING_BAR') {
        const pivotPost = new THREE.Mesh(
          new THREE.CylinderGeometry(0.22, 0.28, 1.1, 16),
          new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6 })
        );
        pivotPost.position.y = 0.55;
        obsGroup.add(pivotPost);

        const laserBar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.09, 0.09, 3.6, 12),
          new THREE.MeshBasicMaterial({ color: 0xff2a85 })
        );
        laserBar.rotation.z = Math.PI * 0.5;
        laserBar.position.y = 0.65;
        obsGroup.add(laserBar);
      } else if (kind === 'PULSE_ZONE') {
        hazardMat = new THREE.MeshBasicMaterial({
          color: 0xa855f7,
          transparent: true,
          opacity: 0.35
        });
        const padMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(1.65, 1.65, 0.12, 24),
          hazardMat
        );
        padMesh.position.y = 0.08;
        obsGroup.add(padMesh);
      }

      const worldPos = this.towerMath.cylindricalToWorld(cursorTheta, 0, 0);
      const tangent = this.towerMath.getTangentAtTheta(cursorTheta);
      obsGroup.position.copy(worldPos);
      obsGroup.lookAt(worldPos.clone().add(tangent));
      this.group.add(obsGroup);

      this.obstacles.push({
        id: 'obs-' + index,
        kind,
        theta: cursorTheta,
        angularSpan,
        baseRadialOffset: 0,
        phase: index * 1.3,
        speed: 1.4 + progress * 1.1,
        meshGroup: obsGroup,
        hazardMaterial: hazardMat
      });

      const safeSpacing = THREE.MathUtils.lerp(1.05, 0.68, progress);
      cursorTheta += safeSpacing;
      index++;
    }
  }

  private buildTowerCoreAndClouds(): void {
    const { towerRadius, totalHeight } = this.towerMath.config;

    const coreGeo = new THREE.CylinderGeometry(
      towerRadius,
      towerRadius * 1.04,
      totalHeight + 40,
      48,
      24
    );
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.55,
      metalness: 0.4
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.y = totalHeight * 0.5;
    this.group.add(coreMesh);

    const ribGeo = new THREE.BoxGeometry(0.35, totalHeight + 36, 0.35);
    const ribMat = new THREE.MeshBasicMaterial({
      color: 0x1e3a8a,
      transparent: true,
      opacity: 0.65
    });
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const rib = new THREE.Mesh(ribGeo, ribMat);
      rib.position.set(
        Math.cos(angle) * (towerRadius + 0.05),
        totalHeight * 0.5,
        Math.sin(angle) * (towerRadius + 0.05)
      );
      this.group.add(rib);
    }

    const cloudHeights = [25, 95, 185, 275, 345];
    cloudHeights.forEach((h, idx) => {
      const cloudRing = new THREE.Mesh(
        new THREE.TorusGeometry(towerRadius + 16 + idx * 4, 3.8, 12, 48),
        new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.16,
          roughness: 0.9
        })
      );
      cloudRing.rotation.x = Math.PI * 0.5;
      cloudRing.position.y = h;
      this.group.add(cloudRing);
    });
  }

  private buildSegmentedSpiralTrack(): void {
    const maxTheta = this.towerMath.baseHeightToTheta(this.towerMath.config.totalHeight);
    const stepTheta = 0.045;
    const trackWidth = this.towerMath.config.trackWidth;

    const stepGeo = new THREE.BoxGeometry(trackWidth, 0.45, 0.92);
    const normalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.3
    });
    const edgeMat = new THREE.MeshBasicMaterial({ color: 0x19e6ff });

    for (let theta = -0.3; theta <= maxTheta + 0.4; theta += stepTheta) {
      const inGap = this.obstacles.some(
        (obs) =>
          obs.kind === 'GAP' && Math.abs(theta - obs.theta) < obs.angularSpan * 0.5
      );
      if (inGap) continue;

      const pos = this.towerMath.cylindricalToWorld(theta, -0.22, 0);
      const tangent = this.towerMath.getTangentAtTheta(theta);

      const segment = new THREE.Mesh(stepGeo, normalMat);
      segment.position.copy(pos);
      segment.lookAt(pos.clone().add(tangent));
      this.group.add(segment);

      if (Math.round(theta / stepTheta) % 4 === 0) {
        const edgePos = this.towerMath.cylindricalToWorld(
          theta,
          -0.02,
          trackWidth * 0.46
        );
        const edgeStrip = new THREE.Mesh(
          new THREE.BoxGeometry(0.14, 0.14, 0.75),
          edgeMat
        );
        edgeStrip.position.copy(edgePos);
        edgeStrip.lookAt(edgePos.clone().add(tangent));
        this.group.add(edgeStrip);
      }
    }
  }

  private buildCryptoMilestonePlatforms(): void {
    CRYPTO_MARKET_CAP_MILESTONES.forEach((coin) => {
      const heightY = this.towerMath.marketCapToHeight(
        coin.athCirculatingMarketCapUSD
      );
      const theta = this.towerMath.baseHeightToTheta(heightY);
      const outerPos = this.towerMath.cylindricalToWorld(
        theta,
        0,
        this.towerMath.config.trackWidth * 0.55
      );
      const tangent = this.towerMath.getTangentAtTheta(theta);

      const brandColor = new THREE.Color(coin.brandColor);
      const ringMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(2.6, 2.2, 0.35, 32),
        new THREE.MeshStandardMaterial({
          color: brandColor,
          emissive: brandColor,
          emissiveIntensity: 0.35,
          roughness: 0.25
        })
      );
      ringMesh.position.copy(outerPos).add(new THREE.Vector3(0, -0.15, 0));
      this.group.add(ringMesh);

      const badgeTex = this.createCoinBadgeTexture(coin);
      const badgeMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(5.2, 2.5),
        new THREE.MeshBasicMaterial({
          map: badgeTex,
          transparent: true,
          side: THREE.DoubleSide
        })
      );
      badgeMesh.position.copy(outerPos).add(new THREE.Vector3(0, 2.6, 0));
      badgeMesh.lookAt(badgeMesh.position.clone().add(tangent));
      this.group.add(badgeMesh);

      this.milestoneNodes.push({
        milestone: coin,
        heightY,
        theta,
        surpassed: false,
        badgeMesh,
        ringMesh
      });
    });
  }

  private createCoinBadgeTexture(coin: CryptoMilestone): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = coin.brandColor;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.roundRect(12, 12, 488, 232, 26);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = coin.brandColor;
    ctx.beginPath();
    ctx.arc(88, 128, 52, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 34px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(coin.symbol, 88, 140);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px system-ui, sans-serif';
    ctx.fillText(coin.name + ' (' + coin.symbol + ')', 164, 96);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 34px system-ui, sans-serif';
    ctx.fillText(
      'ATH 流通市值: ' + TowerMath.formatUSD(coin.athCirculatingMarketCapUSD),
      164,
      152
    );

    ctx.fillStyle = '#94a3b8';
    ctx.font = '22px system-ui, sans-serif';
    ctx.fillText('峰值日: ' + coin.peakDate + ' | 检查点', 164, 202);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  private buildCelebrationShockwave(): void {
    const radius =
      this.towerMath.config.towerRadius + this.towerMath.config.trackOffset;
    this.shockwaveRing = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.45, 16, 64),
      new THREE.MeshBasicMaterial({
        color: 0x19e6ff,
        transparent: true,
        opacity: 0
      })
    );
    this.shockwaveRing.rotation.x = Math.PI * 0.5;
    this.group.add(this.shockwaveRing);
  }

  public startClimb(fromCheckpoint: boolean = false): void {
    if (fromCheckpoint) {
      this.playerTheta = this.checkpointTheta;
      this.retriesUsed++;
    } else {
      this.playerTheta = 0;
      this.checkpointTheta = 0;
      this.checkpointName = '塔底起点 ($100M)';
      this.maxReachedHeightY = 0;
      this.retriesUsed = 0;
      this.runElapsedSeconds = 0;
      this.summitTriggered = false;
      this.milestoneNodes.forEach((n) => (n.surpassed = false));
    }

    this.playerRadialLane = 0;
    this.playerJumpY = 0;
    this.playerVerticalVel = 0;
    this.isGrounded = true;
    this.hearts = 3;
    this.slowMoTimer = 0;
    this.currentCameraTheta = this.playerTheta;

    this.mochi.setAirplaneVisible(false);
    this.mochi.setState('idle');
    this.syncMochiTransform();
  }

  private syncMochiTransform(): void {
    const localPos = this.towerMath.cylindricalToWorld(
      this.playerTheta,
      this.playerJumpY,
      this.playerRadialLane
    );
    const worldPos = localPos.clone().add(this.worldOrigin);
    const tangent = this.towerMath.getTangentAtTheta(this.playerTheta);

    this.mochi.root.position.copy(worldPos);
    this.mochi.root.lookAt(worldPos.clone().add(tangent));
  }

  public update(
    rawDt: number,
    controls: ControlState,
    onConsumeJump: () => void,
    camera: THREE.PerspectiveCamera
  ): void {
    if (this.summitTriggered) return;

    let effectiveDt = rawDt;
    if (this.slowMoTimer > 0) {
      this.slowMoTimer = Math.max(0, this.slowMoTimer - rawDt);
      effectiveDt = rawDt * 0.28;
    }

    this.runElapsedSeconds += rawDt;

    if (this.playerTheta < 0.7) {
      this.callbacks.onTutorialStepChange(
        '【操作教学】按 D / → 或推动摇杆沿螺旋高塔向上攀登，W / S 切换内外圈道'
      );
    } else if (this.playerTheta < 1.8) {
      this.callbacks.onTutorialStepChange(
        '【跳跃教学】前方出现螺旋断崖与障碍！按 空格键 / JUMP 跃过障碍'
      );
    } else {
      this.callbacks.onTutorialStepChange(null);
    }

    const angularDelta = controls.moveForward * this.MAX_ANGULAR_SPEED * effectiveDt;
    this.playerTheta = Math.max(0, this.playerTheta + angularDelta);

    const maxLane = this.towerMath.config.trackWidth * 0.42;
    this.playerRadialLane = THREE.MathUtils.clamp(
      this.playerRadialLane + controls.moveRadial * this.RADIAL_MOVE_SPEED * effectiveDt,
      -maxLane,
      maxLane
    );

    if (this.isGrounded) {
      this.coyoteTimer = 0.12;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - effectiveDt);
    }

    if (controls.jumpBuffered && this.coyoteTimer > 0) {
      onConsumeJump();
      this.callbacks.onJumpExecuted();
      this.playerVerticalVel = this.JUMP_VELOCITY;
      this.isGrounded = false;
      this.coyoteTimer = 0;
      this.mochi.setState('jump');
    }

    if (!this.isGrounded) {
      this.playerJumpY += this.playerVerticalVel * effectiveDt;
      this.playerVerticalVel += this.GRAVITY * effectiveDt;

      if (this.playerJumpY <= 0) {
        this.playerJumpY = 0;
        this.playerVerticalVel = 0;
        this.isGrounded = true;
      }
    }

    if (this.slowMoTimer > 0) {
      this.mochi.setState('celebrate');
    } else if (!this.mochi.isInvulnerable()) {
      if (!this.isGrounded) {
        this.mochi.setState('jump');
      } else if (Math.abs(controls.moveForward) > 0.05) {
        this.mochi.setState('run');
      } else {
        this.mochi.setState('idle');
      }
    }

    this.updateAndCheckObstacles(effectiveDt);
    this.evaluateMarketCapAndMilestones(rawDt);

    this.syncMochiTransform();
    this.currentCameraTheta = THREE.MathUtils.lerp(
      this.currentCameraTheta,
      this.playerTheta,
      rawDt * 6.0
    );
    const camPose = this.towerMath.computeOrbitalCameraPose(
      this.currentCameraTheta,
      this.playerJumpY
    );
    camera.position.copy(camPose.position.add(this.worldOrigin));
    camera.lookAt(camPose.lookAt.add(this.worldOrigin));
  }

  private updateAndCheckObstacles(dt: number): void {
    const canTakeDamage = !this.mochi.isInvulnerable() && this.slowMoTimer <= 0;

    for (const obs of this.obstacles) {
      obs.phase += obs.speed * dt;
      const dTheta = Math.abs(this.playerTheta - obs.theta);

      if (obs.kind === 'MOVING_BLOCK') {
        const radialOffset =
          Math.sin(obs.phase * 1.8) * (this.towerMath.config.trackWidth * 0.36);
        const pos = this.towerMath.cylindricalToWorld(obs.theta, 0, radialOffset);
        obs.meshGroup.position.copy(pos);

        if (
          canTakeDamage &&
          dTheta < 0.045 &&
          Math.abs(this.playerRadialLane - radialOffset) < 0.75 &&
          this.playerJumpY < 1.25
        ) {
          this.handleObstacleHit();
        }
      } else if (obs.kind === 'ROTATING_BAR') {
        obs.meshGroup.rotation.y = obs.phase * 1.6;
        if (canTakeDamage && dTheta < 0.045 && this.playerJumpY < 0.85) {
          this.handleObstacleHit();
        }
      } else if (obs.kind === 'PULSE_ZONE') {
        const pulseVal = Math.sin(obs.phase * 2.2);
        const isHot = pulseVal > 0.45;
        if (obs.hazardMaterial) {
          obs.hazardMaterial.color.setHex(isHot ? 0xff1e56 : 0x6366f1);
          obs.hazardMaterial.opacity = isHot ? 0.88 : 0.28;
        }
        if (canTakeDamage && isHot && dTheta < 0.055 && this.playerJumpY < 0.35) {
          this.handleObstacleHit();
        }
      } else if (obs.kind === 'GAP') {
        if (
          canTakeDamage &&
          dTheta < obs.angularSpan * 0.42 &&
          this.playerJumpY <= 0.05
        ) {
          this.mochi.setState('fall');
          this.playerTheta = Math.max(0, obs.theta - obs.angularSpan * 0.75);
          this.handleObstacleHit();
        }
      }
    }
  }

  private handleObstacleHit(): void {
    this.hearts--;
    this.mochi.triggerHitInvulnerability(1.8);
    this.playerTheta = Math.max(this.checkpointTheta, this.playerTheta - 0.12);
    this.playerVerticalVel = 5.5;
    this.isGrounded = false;

    if (this.hearts <= 0) {
      const peakCap = this.towerMath.heightToMarketCap(this.maxReachedHeightY);
      this.callbacks.onPlayerFailedRun(peakCap, this.checkpointName);
    } else {
      this.callbacks.onPlayerDamaged(this.hearts, this.checkpointName);
    }
  }

  private evaluateMarketCapAndMilestones(rawDt: number): void {
    const currentBaseY = this.towerMath.thetaToBaseHeight(this.playerTheta);
    this.maxReachedHeightY = Math.max(this.maxReachedHeightY, currentBaseY);

    const currentCapUSD = this.towerMath.heightToMarketCap(currentBaseY);
    const peakCapUSD = this.towerMath.heightToMarketCap(this.maxReachedHeightY);
    const progressRatio = THREE.MathUtils.clamp(
      currentBaseY / this.towerMath.config.totalHeight,
      0,
      1
    );

    let nextMilestone: CryptoMilestone | null = null;
    for (let i = 0; i < this.milestoneNodes.length; i++) {
      const node = this.milestoneNodes[i];
      if (!node.surpassed) {
        if (currentBaseY >= node.heightY) {
          node.surpassed = true;
          this.checkpointTheta = node.theta;
          this.checkpointName =
            node.milestone.symbol +
            ' 纪念台 (' +
            TowerMath.formatUSD(node.milestone.athCirculatingMarketCapUSD) +
            ')';

          this.slowMoTimer = 2.2;
          this.shockwaveTimer = 1.4;
          this.shockwaveRing.position.y = node.heightY;
          (this.shockwaveRing.material as THREE.MeshBasicMaterial).color.set(
            node.milestone.brandColor
          );

          this.callbacks.onMilestoneSurpassed(
            node.milestone,
            i + 1,
            this.milestoneNodes.length
          );

          if (i === this.milestoneNodes.length - 1) {
            this.summitTriggered = true;
            this.mochi.setState('celebrate');
            this.callbacks.onTowerSummitReached({
              totalTimeSeconds: this.runElapsedSeconds,
              surpassedCount: this.milestoneNodes.length,
              retriesUsed: this.retriesUsed
            });
          }
        } else {
          nextMilestone = node.milestone;
          break;
        }
      }
    }

    if (this.shockwaveTimer > 0) {
      this.shockwaveTimer = Math.max(0, this.shockwaveTimer - rawDt);
      const t = 1 - this.shockwaveTimer / 1.4;
      const scale = 1 + t * 1.8;
      this.shockwaveRing.scale.set(scale, scale, 1);
      (this.shockwaveRing.material as THREE.MeshBasicMaterial).opacity =
        (1 - t) * 0.85;
    }

    this.callbacks.onMarketCapUpdated(
      currentCapUSD,
      peakCapUSD,
      nextMilestone,
      progressRatio
    );
  }
}
