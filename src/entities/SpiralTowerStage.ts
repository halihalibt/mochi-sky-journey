import * as THREE from 'three';
import {
  CRYPTO_MARKET_CAP_MILESTONES,
  CryptoMilestone,
  EARLY_SIMULATION_MILESTONES,
  SimulationProgressMilestone
} from '../data/cryptoMarketCaps';
import { TowerMath, TowerZoneId, TowerZoneSpec } from '../core/TowerMath';
import { ControlState } from '../core/InputController';
import { i18n } from '../i18n/I18nManager';
import { MochiCharacter, MochiCosmeticId } from './MochiCharacter';
import { TowerEnvironment } from './TowerEnvironment';

export type ObstacleKind =
  | 'GAP'
  | 'MOVING_BLOCK'
  | 'ROTATING_BAR'
  | 'PULSE_ZONE'
  | 'CRUMBLE_TRACK'
  | 'WIND_GUST'
  | 'UPDRAFT';

export interface TowerObstacle {
  id: string;
  kind: ObstacleKind;
  theta: number;
  angularSpan: number;
  baseRadialOffset: number;
  phase: number;
  speed: number;
  passedForCombo: boolean;
  crumbleState?: 'INTACT' | 'SHAKING' | 'BROKEN';
  crumbleTimer?: number;
  meshGroup: THREE.Group;
  hazardMaterial?: THREE.MeshBasicMaterial;
}

export interface ChallengeBranchSegment {
  thetaStart: number;
  thetaEnd: number;
  laneOffset: number;
  elevationY: number;
}

export interface HiddenFloatingPlatform {
  id: string;
  theta: number;
  angularSpan: number;
  laneOffset: number;
  elevationY: number;
  discovered: boolean;
  mesh: THREE.Mesh;
}

export interface StarlightOrb {
  id: string;
  theta: number;
  jumpY: number;
  laneOffset: number;
  collected: boolean;
  mesh: THREE.Mesh;
}

export interface MilestonePlatformNode {
  milestone: CryptoMilestone;
  heightY: number;
  theta: number;
  surpassed: boolean;
  badgeMesh: THREE.Mesh;
  ringMesh: THREE.Mesh;
}

export interface TowerSummitStats {
  totalTimeSeconds: number;
  surpassedCount: number;
  retriesUsed: number;
  collectedOrbs: number;
  maxCombo: number;
  isTimeTrial: boolean;
  isNewBestTime: boolean;
}

export interface TowerCallbacks {
  onJumpExecuted: () => void;
  onDashExecuted?: () => void;
  onGlideStarted?: () => void;
  onLandExecuted?: () => void;
  onOrbCollected?: (totalOrbs: number, combo: number) => void;
  onComboMilestone?: (combo: number) => void;
  onHiddenPlatformFound?: (totalOrbs: number) => void;
  onCosmeticUnlocked?: (cosmeticId: MochiCosmeticId) => void;
  onZoneChanged?: (zone: TowerZoneSpec) => void;
  onEarlySimMilestoneReached?: (sim: SimulationProgressMilestone) => void;
  onMarketCapUpdated: (
    currentCapUSD: number,
    peakCapUSD: number,
    nextMilestone: CryptoMilestone | null,
    progressRatio: number,
    zone: TowerZoneSpec,
    combo: number,
    orbs: number,
    elapsedSeconds: number
  ) => void;
  onMilestoneSurpassed: (
    milestone: CryptoMilestone,
    index: number,
    total: number,
    isMajor: boolean
  ) => void;
  onPlayerDamaged: (remainingHearts: number, checkpointName: string) => void;
  onPlayerFailedRun: (peakCapUSD: number, lastCheckpointName: string) => void;
  onTutorialStepChange: (hintText: string | null) => void;
  onTowerSummitReached: (finalStats: TowerSummitStats) => void;
}

const BEST_TIMETRIAL_STORAGE_KEY = 'mochi_best_timetrial_sec_v2';
const ADVENTURE_CLEARED_STORAGE_KEY = 'mochi_adventure_cleared_v2';

export class SpiralTowerStage {
  public readonly group: THREE.Group;
  public readonly worldOrigin = new THREE.Vector3(0, 0, -1140);
  public readonly towerEnv: TowerEnvironment;

  private readonly towerMath: TowerMath;
  private readonly mochi: MochiCharacter;
  private readonly callbacks: TowerCallbacks;

  private obstacles: TowerObstacle[] = [];
  private challengeBranches: ChallengeBranchSegment[] = [];
  private hiddenPlatforms: HiddenFloatingPlatform[] = [];
  private starlightOrbs: StarlightOrb[] = [];
  private milestoneNodes: MilestonePlatformNode[] = [];
  private earlySimNodes: {
    sim: SimulationProgressMilestone;
    heightY: number;
    theta: number;
    reached: boolean;
    ringMesh: THREE.Mesh;
  }[] = [];

  private landingIndicatorRing!: THREE.Mesh;
  private shockwaveRing!: THREE.Mesh;
  private shockwaveTimer = 0;

  // Player kinematic & action state
  private playerTheta = 0;
  private playerRadialLane = 0;
  private playerJumpY = 0;
  private playerGroundY = 0;
  private playerVerticalVel = 0;
  private isGrounded = true;
  private coyoteTimer = 0;

  private dashTimer = 0;
  private dashCooldownTimer = 0;
  private isGliding = false;

  // Progression, Combos & Mode state
  private isTimeTrial = false;
  private reducedMotion = false;
  private currentZoneId: TowerZoneId = 'CLOUD_RUINS';

  private maxReachedHeightY = 0;
  private checkpointTheta = 0;
  private checkpointCoinSymbol: string | null = null;
  private checkpointCapUSD = 100_000_000;
  private hearts = 3;
  private retriesUsed = 0;
  private runElapsedSeconds = 0;
  private slowMoTimer = 0;
  private summitTriggered = false;

  private comboCount = 0;
  private maxCombo = 0;
  private collectedOrbsCount = 0;

  private currentCameraTheta = 0;

  private readonly MAX_ANGULAR_SPEED = 0.38;
  private readonly DASH_SPEED_MULTIPLIER = 2.35;
  private readonly DASH_DURATION = 0.19;
  private readonly DASH_COOLDOWN = 0.65;
  private readonly RADIAL_MOVE_SPEED = 3.6;
  private readonly GRAVITY = -26.0;
  private readonly GLIDE_GRAVITY = -4.2;
  private readonly GLIDE_MAX_FALL_SPEED = -2.4;
  private readonly JUMP_VELOCITY = 11.8;

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

    // 5-Zone Fantasy Tower Environment
    this.towerEnv = new TowerEnvironment(this.towerMath);
    this.group.add(this.towerEnv.group);

    this.generateObstaclesAndMechanicsLayout();
    this.buildSegmentedSpiralTrack();
    this.buildBranchingRoutesAndHiddenPlatforms();
    this.buildStarlightOrbs();
    this.buildEarlySimulationMilestoneRings();
    this.buildCryptoMilestonePlatforms();
    this.buildLandingIndicatorAndShockwave();

    i18n.onChange(() => {
      this.refreshLocaleCoinBadges();
    });
  }

  private generateObstaclesAndMechanicsLayout(): void {
    const maxTheta = this.towerMath.baseHeightToTheta(
      this.towerMath.config.totalHeight
    );
    const milestoneThetas = CRYPTO_MARKET_CAP_MILESTONES.map((m) =>
      this.towerMath.baseHeightToTheta(
        this.towerMath.marketCapToHeight(m.recordMarketCapUSD)
      )
    );

    let cursorTheta = 1.45;
    let index = 0;

    while (cursorTheta < maxTheta - 1.2) {
      const nearMilestone = milestoneThetas.some(
        (mt) => Math.abs(cursorTheta - mt) < 0.34
      );
      if (nearMilestone) {
        cursorTheta += 0.48;
        continue;
      }

      const progress = cursorTheta / maxTheta;
      const heightY = this.towerMath.thetaToBaseHeight(cursorTheta);
      const zone = this.towerMath.getZoneByHeight(heightY);

      // Select zone-appropriate obstacle & environmental mechanic mix
      let pool: ObstacleKind[];
      if (progress < 0.08) {
        pool = ['GAP', 'MOVING_BLOCK', 'UPDRAFT'];
      } else if (zone.id === 'CLOUD_RUINS') {
        pool = ['GAP', 'MOVING_BLOCK', 'UPDRAFT', 'ROTATING_BAR'];
      } else if (zone.id === 'SKY_GARDEN') {
        pool = ['UPDRAFT', 'GAP', 'MOVING_BLOCK', 'PULSE_ZONE', 'WIND_GUST'];
      } else if (zone.id === 'STORM_MECH') {
        pool = ['WIND_GUST', 'ROTATING_BAR', 'MOVING_BLOCK', 'GAP', 'UPDRAFT'];
      } else if (zone.id === 'AURORA_CRYSTAL') {
        pool = ['CRUMBLE_TRACK', 'UPDRAFT', 'PULSE_ZONE', 'GAP', 'WIND_GUST'];
      } else {
        pool = [
          'CRUMBLE_TRACK',
          'WIND_GUST',
          'ROTATING_BAR',
          'UPDRAFT',
          'PULSE_ZONE',
          'MOVING_BLOCK'
        ];
      }

      const kind = pool[index % pool.length];
      const obsGroup = new THREE.Group();
      let angularSpan = 0.13;
      let hazardMat: THREE.MeshBasicMaterial | undefined;

      if (kind === 'GAP') {
        angularSpan = 0.125 + progress * 0.035;
        // Glowing warning strips at gap edges
        const warnMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
        const bar1 = new THREE.Mesh(
          new THREE.BoxGeometry(this.towerMath.config.trackWidth, 0.14, 0.18),
          warnMat
        );
        bar1.position.set(0, 0.02, -1.1);
        const bar2 = bar1.clone();
        bar2.position.set(0, 0.02, 1.1);
        obsGroup.add(bar1, bar2);
      } else if (kind === 'CRUMBLE_TRACK') {
        angularSpan = 0.14;
        const iceSlabMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x0284c7,
          emissiveIntensity: 0.38,
          transparent: true,
          opacity: 0.86,
          roughness: 0.2
        });
        const slab = new THREE.Mesh(
          new THREE.BoxGeometry(
            this.towerMath.config.trackWidth * 0.94,
            0.42,
            2.4
          ),
          iceSlabMat
        );
        slab.position.y = -0.2;
        obsGroup.add(slab);
      } else if (kind === 'MOVING_BLOCK') {
        const blockMesh = new THREE.Mesh(
          new THREE.BoxGeometry(1.18, 1.38, 1.18),
          new THREE.MeshStandardMaterial({
            color: 0xf43f5e,
            emissive: 0x881337,
            emissiveIntensity: 0.52,
            roughness: 0.28
          })
        );
        blockMesh.position.y = 0.7;
        obsGroup.add(blockMesh);
      } else if (kind === 'ROTATING_BAR') {
        const pivotPost = new THREE.Mesh(
          new THREE.CylinderGeometry(0.22, 0.28, 1.15, 16),
          new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.65 })
        );
        pivotPost.position.y = 0.58;
        obsGroup.add(pivotPost);

        const laserBar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.09, 0.09, 3.6, 12),
          new THREE.MeshBasicMaterial({ color: 0xff2a85 })
        );
        laserBar.rotation.z = Math.PI * 0.5;
        laserBar.position.y = 0.66;
        obsGroup.add(laserBar);
      } else if (kind === 'PULSE_ZONE') {
        hazardMat = new THREE.MeshBasicMaterial({
          color: 0xa855f7,
          transparent: true,
          opacity: 0.35
        });
        const padMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(1.62, 1.62, 0.12, 24),
          hazardMat
        );
        padMesh.position.y = 0.08;
        obsGroup.add(padMesh);
      } else if (kind === 'WIND_GUST') {
        angularSpan = 0.16;
        hazardMat = new THREE.MeshBasicMaterial({
          color: 0xf59e0b,
          transparent: true,
          opacity: 0.42,
          side: THREE.DoubleSide
        });
        for (let w = 0; w < 3; w++) {
          const streamer = new THREE.Mesh(
            new THREE.TorusGeometry(1.35 + w * 0.35, 0.045, 8, 24, Math.PI),
            hazardMat
          );
          streamer.position.y = 0.6 + w * 0.45;
          streamer.rotation.x = Math.PI * 0.5;
          obsGroup.add(streamer);
        }
      } else if (kind === 'UPDRAFT') {
        angularSpan = 0.15;
        const updraftMat = new THREE.MeshBasicMaterial({
          color: 0x19e6ff,
          transparent: true,
          opacity: 0.38,
          side: THREE.DoubleSide
        });
        const column = new THREE.Mesh(
          new THREE.CylinderGeometry(1.35, 1.55, 4.6, 20, 1, true),
          updraftMat
        );
        column.position.y = 2.3;
        obsGroup.add(column);

        const baseRing = new THREE.Mesh(
          new THREE.TorusGeometry(1.45, 0.08, 10, 28),
          new THREE.MeshBasicMaterial({ color: 0x67e8f9 })
        );
        baseRing.rotation.x = Math.PI * 0.5;
        baseRing.position.y = 0.1;
        obsGroup.add(baseRing);
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
        speed: 1.45 + progress * 1.05,
        passedForCombo: false,
        crumbleState: kind === 'CRUMBLE_TRACK' ? 'INTACT' : undefined,
        crumbleTimer: 0,
        meshGroup: obsGroup,
        hazardMaterial: hazardMat
      });

      const safeSpacing = THREE.MathUtils.lerp(1.02, 0.68, progress);
      cursorTheta += safeSpacing;
      index++;
    }
  }

  private buildSegmentedSpiralTrack(): void {
    const maxTheta = this.towerMath.baseHeightToTheta(
      this.towerMath.config.totalHeight
    );
    const stepTheta = 0.045;
    const trackWidth = this.towerMath.config.trackWidth;

    const stepGeo = new THREE.BoxGeometry(trackWidth, 0.44, 0.92);
    const edgeGeo = new THREE.BoxGeometry(0.15, 0.15, 0.78);

    // Pre-create per-zone track and trim materials
    const zoneMats = new Map<
      TowerZoneId,
      { track: THREE.MeshStandardMaterial; edge: THREE.MeshBasicMaterial }
    >();
    for (const ySample of [10, 110, 210, 310, 410]) {
      const z = this.towerMath.getZoneByHeight(ySample);
      zoneMats.set(z.id, {
        track: new THREE.MeshStandardMaterial({
          color: z.trackColor,
          roughness: 0.38,
          metalness: 0.32
        }),
        edge: new THREE.MeshBasicMaterial({ color: z.emissiveTrimColor })
      });
    }

    for (let theta = -0.35; theta <= maxTheta + 0.45; theta += stepTheta) {
      const inGapOrCrumble = this.obstacles.some(
        (obs) =>
          (obs.kind === 'GAP' || obs.kind === 'CRUMBLE_TRACK') &&
          Math.abs(theta - obs.theta) < obs.angularSpan * 0.5
      );
      if (inGapOrCrumble) continue;

      const heightY = this.towerMath.thetaToBaseHeight(Math.max(0, theta));
      const zone = this.towerMath.getZoneByHeight(heightY);
      const mats = zoneMats.get(zone.id)!;

      const pos = this.towerMath.cylindricalToWorld(theta, -0.22, 0);
      const tangent = this.towerMath.getTangentAtTheta(theta);

      const segment = new THREE.Mesh(stepGeo, mats.track);
      segment.position.copy(pos);
      segment.lookAt(pos.clone().add(tangent));
      this.group.add(segment);

      if (Math.round(theta / stepTheta) % 4 === 0) {
        [-1, 1].forEach((side) => {
          const edgePos = this.towerMath.cylindricalToWorld(
            theta,
            -0.02,
            side * trackWidth * 0.46
          );
          const edgeStrip = new THREE.Mesh(edgeGeo, mats.edge);
          edgeStrip.position.copy(edgePos);
          edgeStrip.lookAt(edgePos.clone().add(tangent));
          this.group.add(edgeStrip);
        });
      }
    }
  }

  /**
   * Builds elevated outer challenge split routes and secret floating platforms
   * that reward skilled jumpers & gliders with bonus Starlight Orbs.
   */
  private buildBranchingRoutesAndHiddenPlatforms(): void {
    const maxTheta = this.towerMath.baseHeightToTheta(
      this.towerMath.config.totalHeight
    );
    const branchStepGeo = new THREE.BoxGeometry(1.75, 0.32, 0.95);
    const branchMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.42,
      roughness: 0.25,
      metalness: 0.5
    });

    // 8 elevated challenge route branches along the outer lane
    for (let b = 0; b < 8; b++) {
      const thetaStart = 6.5 + b * ((maxTheta - 14) / 8);
      const thetaEnd = thetaStart + 1.05;
      const laneOffset = this.towerMath.config.trackWidth * 0.38;
      const elevationY = 1.65;

      this.challengeBranches.push({
        thetaStart,
        thetaEnd,
        laneOffset,
        elevationY
      });

      for (let t = thetaStart; t <= thetaEnd; t += 0.055) {
        const pos = this.towerMath.cylindricalToWorld(
          t,
          elevationY - 0.16,
          laneOffset
        );
        const tangent = this.towerMath.getTangentAtTheta(t);
        const stepMesh = new THREE.Mesh(branchStepGeo, branchMat);
        stepMesh.position.copy(pos);
        stepMesh.lookAt(pos.clone().add(tangent));
        this.group.add(stepMesh);
      }
    }

    // 6 secret floating platforms outside the main track
    const hiddenMat = new THREE.MeshStandardMaterial({
      color: 0xe879f9,
      emissive: 0x86198f,
      emissiveIntensity: 0.55,
      roughness: 0.2,
      metalness: 0.6
    });

    for (let h = 0; h < 6; h++) {
      const theta = 9.2 + h * ((maxTheta - 18) / 6);
      const laneOffset = this.towerMath.config.trackWidth * 0.72;
      const elevationY = 2.35;
      const pos = this.towerMath.cylindricalToWorld(
        theta,
        elevationY - 0.18,
        laneOffset,
        true
      );

      const disc = new THREE.Mesh(
        new THREE.CylinderGeometry(1.85, 1.45, 0.38, 24),
        hiddenMat
      );
      disc.position.copy(pos);
      this.group.add(disc);

      this.hiddenPlatforms.push({
        id: 'hidden-' + h,
        theta,
        angularSpan: 0.12,
        laneOffset,
        elevationY,
        discovered: false,
        mesh: disc
      });
    }
  }

  private buildStarlightOrbs(): void {
    const maxTheta = this.towerMath.baseHeightToTheta(
      this.towerMath.config.totalHeight
    );
    const orbGeo = new THREE.OctahedronGeometry(0.36, 0);
    const orbMat = new THREE.MeshBasicMaterial({ color: 0x67e8f9 });

    let orbIdx = 0;
    // Orbs along normal spiral & over gaps
    for (let theta = 1.1; theta < maxTheta - 1.5; theta += 1.25) {
      const lane = Math.sin(orbIdx * 1.4) * 1.3;
      const jumpY = orbIdx % 3 === 0 ? 1.55 : 0.65;
      const pos = this.towerMath.cylindricalToWorld(theta, jumpY, lane);

      const mesh = new THREE.Mesh(orbGeo, orbMat);
      mesh.position.copy(pos);
      this.group.add(mesh);

      this.starlightOrbs.push({
        id: 'orb-' + orbIdx,
        theta,
        jumpY,
        laneOffset: lane,
        collected: false,
        mesh
      });
      orbIdx++;
    }

    // Bonus orbs along the elevated challenge branches
    for (const branch of this.challengeBranches) {
      for (
        let t = branch.thetaStart + 0.15;
        t <= branch.thetaEnd - 0.15;
        t += 0.32
      ) {
        const jumpY = branch.elevationY + 0.72;
        const pos = this.towerMath.cylindricalToWorld(
          t,
          jumpY,
          branch.laneOffset
        );
        const mesh = new THREE.Mesh(orbGeo, orbMat);
        mesh.position.copy(pos);
        this.group.add(mesh);

        this.starlightOrbs.push({
          id: 'orb-' + orbIdx,
          theta: t,
          jumpY,
          laneOffset: branch.laneOffset,
          collected: false,
          mesh
        });
        orbIdx++;
      }
    }
  }

  private buildEarlySimulationMilestoneRings(): void {
    EARLY_SIMULATION_MILESTONES.forEach((sim) => {
      const heightY = this.towerMath.marketCapToHeight(sim.thresholdUSD);
      const theta = this.towerMath.baseHeightToTheta(heightY);
      const pos = this.towerMath.cylindricalToWorld(theta, 0.05, 0);
      const tangent = this.towerMath.getTangentAtTheta(theta);

      const ringMesh = new THREE.Mesh(
        new THREE.TorusGeometry(2.6, 0.12, 12, 36, Math.PI),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(sim.badgeColor) })
      );
      ringMesh.position.copy(pos);
      ringMesh.lookAt(pos.clone().add(tangent));
      this.group.add(ringMesh);

      this.earlySimNodes.push({
        sim,
        heightY,
        theta,
        reached: false,
        ringMesh
      });
    });
  }

  private buildCryptoMilestonePlatforms(): void {
    CRYPTO_MARKET_CAP_MILESTONES.forEach((coin, idx) => {
      const heightY = this.towerMath.marketCapToHeight(coin.recordMarketCapUSD);
      const theta = this.towerMath.baseHeightToTheta(heightY);
      const sideFactor = idx % 2 === 0 ? 0.56 : 0.64;
      const outerPos = this.towerMath.cylindricalToWorld(
        theta,
        0,
        this.towerMath.config.trackWidth * sideFactor,
        true
      );
      const tangent = this.towerMath.getTangentAtTheta(theta);

      const brandColor = new THREE.Color(coin.brandColor);
      const platformRadius = coin.isMajorCheckpoint ? 2.65 : 1.95;
      const ringMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(
          platformRadius,
          platformRadius * 0.84,
          0.36,
          32
        ),
        new THREE.MeshStandardMaterial({
          color: brandColor,
          emissive: brandColor,
          emissiveIntensity: coin.isMajorCheckpoint ? 0.42 : 0.25,
          roughness: 0.25
        })
      );
      ringMesh.position.copy(outerPos).add(new THREE.Vector3(0, -0.15, 0));
      this.group.add(ringMesh);

      const badgeTex = this.createCoinBadgeTexture(coin);
      const badgeScale = coin.isMajorCheckpoint ? 1.0 : 0.84;
      const badgeMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(5.4 * badgeScale, 2.6 * badgeScale),
        new THREE.MeshBasicMaterial({
          map: badgeTex,
          transparent: true,
          side: THREE.DoubleSide
        })
      );
      badgeMesh.position
        .copy(outerPos)
        .add(new THREE.Vector3(0, 2.35 * badgeScale + (idx % 2) * 0.55, 0));
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

  public refreshLocaleCoinBadges(): void {
    for (const node of this.milestoneNodes) {
      const mat = node.badgeMesh.material as THREE.MeshBasicMaterial;
      if (mat.map) {
        mat.map.dispose();
      }
      mat.map = this.createCoinBadgeTexture(node.milestone);
      mat.needsUpdate = true;
    }
  }

  private createCoinBadgeTexture(coin: CryptoMilestone): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 560;
    canvas.height = 268;
    const ctx = canvas.getContext('2d')!;
    const fontStack = i18n.getLocaleOption().fontFamily;
    const strings = i18n.getStrings();

    ctx.fillStyle = 'rgba(12, 19, 36, 0.93)';
    ctx.strokeStyle = coin.brandColor;
    ctx.lineWidth = coin.isMajorCheckpoint ? 9 : 6;
    ctx.beginPath();
    ctx.roundRect(12, 12, 536, 244, 26);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = coin.brandColor;
    ctx.beginPath();
    ctx.arc(88, 134, 52, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 30px ' + fontStack;
    ctx.textAlign = 'center';
    ctx.fillText(coin.symbol, 88, 145);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px ' + fontStack;
    ctx.fillText(coin.name + ' (' + coin.symbol + ')', 162, 78, 368);

    ctx.fillStyle = '#a5f3fc';
    ctx.font = 'bold 21px ' + fontStack;
    ctx.fillText(strings.historicalDailyRecordLabel, 162, 118, 368);

    ctx.fillStyle = '#19e6ff';
    ctx.font = 'bold 32px ' + fontStack;
    ctx.fillText(
      TowerMath.formatUSD(coin.recordMarketCapUSD),
      162,
      164,
      368
    );

    ctx.fillStyle = '#94a3b8';
    ctx.font = '20px ' + fontStack;
    ctx.fillText(
      strings.recordDatePrefix +
        coin.recordDateUTC +
        (coin.isMajorCheckpoint ? ' ★' : ''),
      162,
      212,
      368
    );

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  private buildLandingIndicatorAndShockwave(): void {
    // Glowing cyan ground reticle ring under Mochi during jumps/glides
    this.landingIndicatorRing = new THREE.Mesh(
      new THREE.RingGeometry(0.32, 0.56, 28),
      new THREE.MeshBasicMaterial({
        color: 0x19e6ff,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide
      })
    );
    this.landingIndicatorRing.rotation.x = -Math.PI * 0.5;
    this.landingIndicatorRing.visible = false;
    this.group.add(this.landingIndicatorRing);

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

  public setReducedMotion(reduced: boolean): void {
    this.reducedMotion = reduced;
  }

  public getCurrentCheckpointLabel(): string {
    const strings = i18n.getStrings();
    if (!this.checkpointCoinSymbol) {
      return strings.towerBaseCheckpointName;
    }
    return (
      this.checkpointCoinSymbol +
      ' ' +
      strings.checkpointPlatformSuffix +
      ' (' +
      TowerMath.formatUSD(this.checkpointCapUSD) +
      ')'
    );
  }

  public static isTimeTrialUnlocked(): boolean {
    return localStorage.getItem(ADVENTURE_CLEARED_STORAGE_KEY) === 'true';
  }

  public static getBestTimeTrialSeconds(): number | null {
    const raw = localStorage.getItem(BEST_TIMETRIAL_STORAGE_KEY);
    if (!raw) return null;
    const val = parseFloat(raw);
    return Number.isFinite(val) && val > 0 ? val : null;
  }

  public startClimb(
    fromCheckpoint: boolean = false,
    timeTrialMode: boolean = false
  ): void {
    this.isTimeTrial = timeTrialMode;

    if (fromCheckpoint && !timeTrialMode) {
      this.playerTheta = this.checkpointTheta;
      this.retriesUsed++;
    } else {
      this.playerTheta = 0;
      this.checkpointTheta = 0;
      this.checkpointCoinSymbol = null;
      this.checkpointCapUSD = 100_000_000;
      this.maxReachedHeightY = 0;
      this.retriesUsed = 0;
      this.runElapsedSeconds = 0;
      this.summitTriggered = false;
      this.collectedOrbsCount = 0;
      this.comboCount = 0;
      this.maxCombo = 0;

      this.milestoneNodes.forEach((n) => (n.surpassed = false));
      this.earlySimNodes.forEach((s) => (s.reached = false));
      this.starlightOrbs.forEach((o) => {
        o.collected = false;
        o.mesh.visible = true;
      });
      this.hiddenPlatforms.forEach((hp) => {
        hp.discovered = false;
      });
      this.obstacles.forEach((obs) => {
        obs.passedForCombo = false;
        if (obs.kind === 'CRUMBLE_TRACK') {
          obs.crumbleState = 'INTACT';
          obs.crumbleTimer = 0;
          obs.meshGroup.visible = true;
        }
      });
    }

    this.playerRadialLane = 0;
    this.playerJumpY = 0;
    this.playerGroundY = 0;
    this.playerVerticalVel = 0;
    this.isGrounded = true;
    this.dashTimer = 0;
    this.dashCooldownTimer = 0;
    this.isGliding = false;
    this.hearts = 3;
    this.slowMoTimer = 0;
    this.currentCameraTheta = this.playerTheta;
    this.currentZoneId = this.towerMath.getZoneByHeight(
      this.towerMath.thetaToBaseHeight(this.playerTheta)
    ).id;

    this.mochi.setAirplaneVisible(false);
    this.mochi.setState('idle');
    this.syncMochiTransform();
  }

  private getElevatedGroundHeightAt(theta: number, laneOffset: number): number {
    for (const branch of this.challengeBranches) {
      if (
        theta >= branch.thetaStart &&
        theta <= branch.thetaEnd &&
        Math.abs(laneOffset - branch.laneOffset) < 0.95
      ) {
        return branch.elevationY;
      }
    }
    for (const hp of this.hiddenPlatforms) {
      if (
        Math.abs(theta - hp.theta) < hp.angularSpan &&
        Math.abs(laneOffset - hp.laneOffset) < 1.35
      ) {
        if (!hp.discovered) {
          hp.discovered = true;
          this.collectedOrbsCount += 5;
          this.callbacks.onHiddenPlatformFound?.(this.collectedOrbsCount);
          this.checkCosmeticUnlocks();
        }
        return hp.elevationY;
      }
    }
    return 0;
  }

  private syncMochiTransform(): void {
    const allowOuter = this.playerJumpY > 0.2 || this.playerGroundY > 0.2;
    const localPos = this.towerMath.cylindricalToWorld(
      this.playerTheta,
      this.playerJumpY,
      this.playerRadialLane,
      allowOuter
    );
    const worldPos = localPos.clone().add(this.worldOrigin);
    const tangent = this.towerMath.getTangentAtTheta(this.playerTheta);

    this.mochi.root.position.copy(worldPos);
    this.mochi.root.lookAt(worldPos.clone().add(tangent));

    // Update landing indicator reticle directly below Mochi on the active surface
    if (!this.isGrounded && this.playerJumpY > this.playerGroundY + 0.12) {
      const groundLocal = this.towerMath.cylindricalToWorld(
        this.playerTheta,
        this.playerGroundY + 0.04,
        this.playerRadialLane,
        allowOuter
      );
      this.landingIndicatorRing.position.copy(groundLocal);
      const heightDiff = Math.max(0, this.playerJumpY - this.playerGroundY);
      const ringScale = THREE.MathUtils.clamp(1.25 - heightDiff * 0.1, 0.55, 1.25);
      this.landingIndicatorRing.scale.set(ringScale, ringScale, 1);
      this.landingIndicatorRing.visible = true;
    } else {
      this.landingIndicatorRing.visible = false;
    }
  }

  public update(
    rawDt: number,
    controls: ControlState,
    onConsumeJump: () => void,
    camera: THREE.PerspectiveCamera,
    scene?: THREE.Scene,
    onConsumeDash?: () => void
  ): void {
    if (this.summitTriggered) return;

    let effectiveDt = rawDt;
    if (this.slowMoTimer > 0) {
      this.slowMoTimer = Math.max(0, this.slowMoTimer - rawDt);
      effectiveDt = rawDt * 0.35;
    }

    this.runElapsedSeconds += rawDt;

    // Update 5-zone environment & dynamic atmosphere
    const currentBaseY = this.towerMath.thetaToBaseHeight(this.playerTheta);
    const activeZone = scene
      ? this.towerEnv.update(
          rawDt,
          currentBaseY,
          scene,
          this.reducedMotion
        )
      : this.towerMath.getZoneByHeight(currentBaseY);

    if (activeZone.id !== this.currentZoneId) {
      this.currentZoneId = activeZone.id;
      this.callbacks.onZoneChanged?.(activeZone);
      if (activeZone.id === 'AURORA_CRYSTAL') {
        if (this.mochi.unlockCosmetic('starlightCape')) {
          this.callbacks.onCosmeticUnlocked?.('starlightCape');
        }
      }
    }

    // Progressive localized 4-step interactive tutorials
    const strings = i18n.getStrings();
    if (this.playerTheta < 0.85) {
      this.callbacks.onTutorialStepChange(strings.tutorials.moveAndLane);
    } else if (this.playerTheta < 2.2) {
      this.callbacks.onTutorialStepChange(strings.tutorials.jumpObstacle);
    } else if (this.playerTheta < 3.6) {
      this.callbacks.onTutorialStepChange(strings.tutorials.shortDash);
    } else if (this.playerTheta < 5.2) {
      this.callbacks.onTutorialStepChange(strings.tutorials.airGlide);
    } else if (this.playerTheta > 6.2 && this.playerTheta < 7.5) {
      this.callbacks.onTutorialStepChange(strings.tutorials.branchRouteHint);
    } else {
      this.callbacks.onTutorialStepChange(null);
    }

    // Handle Dash cooldown & activation
    if (this.dashCooldownTimer > 0) {
      this.dashCooldownTimer = Math.max(0, this.dashCooldownTimer - effectiveDt);
    }
    if (controls.dashBuffered && this.dashCooldownTimer <= 0 && this.dashTimer <= 0) {
      onConsumeDash?.();
      this.dashTimer = this.DASH_DURATION;
      this.dashCooldownTimer = this.DASH_COOLDOWN;
      this.callbacks.onDashExecuted?.();
      this.mochi.setState('dash');
    }

    let speedMultiplier = 1.0 + Math.min(0.18, this.comboCount * 0.012);
    if (this.dashTimer > 0) {
      this.dashTimer = Math.max(0, this.dashTimer - effectiveDt);
      speedMultiplier *= this.DASH_SPEED_MULTIPLIER;
    }

    const forwardInput =
      this.dashTimer > 0 && Math.abs(controls.moveForward) < 0.2
        ? 1.0
        : controls.moveForward;

    const angularDelta =
      forwardInput * this.MAX_ANGULAR_SPEED * speedMultiplier * effectiveDt;
    this.playerTheta = Math.max(0, this.playerTheta + angularDelta);

    // Radial lane movement (extended outer range when airborne or on outer platforms)
    const maxInner = -this.towerMath.config.trackWidth * 0.43;
    const maxOuter =
      !this.isGrounded || this.playerGroundY > 0
        ? this.towerMath.config.trackWidth * 0.78
        : this.towerMath.config.trackWidth * 0.43;

    this.playerRadialLane = THREE.MathUtils.clamp(
      this.playerRadialLane +
        controls.moveRadial * this.RADIAL_MOVE_SPEED * effectiveDt,
      maxInner,
      maxOuter
    );

    // Determine active surface height (main road = 0, elevated challenge/hidden platform > 0)
    const elevatedSurfaceY = this.getElevatedGroundHeightAt(
      this.playerTheta,
      this.playerRadialLane
    );
    if (this.playerJumpY >= elevatedSurfaceY - 0.15) {
      this.playerGroundY = elevatedSurfaceY;
    } else {
      this.playerGroundY = 0;
    }

    if (this.isGrounded && this.playerJumpY > this.playerGroundY + 0.08) {
      this.isGrounded = false;
    }

    // Coyote time & Jump execution
    if (this.isGrounded) {
      this.coyoteTimer = 0.14;
      this.isGliding = false;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - effectiveDt);
    }

    if (controls.jumpBuffered && this.coyoteTimer > 0) {
      onConsumeJump();
      this.callbacks.onJumpExecuted();
      this.playerVerticalVel = this.JUMP_VELOCITY;
      this.isGrounded = false;
      this.coyoteTimer = 0;
      this.isGliding = false;
      this.mochi.setState('jump');
    }

    // Airborne physics & Air Glide
    if (!this.isGrounded) {
      const canGlide =
        controls.glideHeld &&
        this.dashTimer <= 0 &&
        this.playerJumpY > this.playerGroundY + 0.35 &&
        this.playerVerticalVel <= 1.2;

      if (canGlide && !this.isGliding) {
        this.isGliding = true;
        this.callbacks.onGlideStarted?.();
      } else if (!controls.glideHeld) {
        this.isGliding = false;
      }

      if (this.dashTimer > 0) {
        // Horizontal air dash suspends gravity briefly
        this.playerVerticalVel = Math.max(0, this.playerVerticalVel);
      } else if (this.isGliding) {
        this.playerVerticalVel = Math.max(
          this.GLIDE_MAX_FALL_SPEED,
          this.playerVerticalVel + this.GLIDE_GRAVITY * effectiveDt
        );
      } else {
        this.playerVerticalVel += this.GRAVITY * effectiveDt;
      }

      this.playerJumpY += this.playerVerticalVel * effectiveDt;

      if (this.playerJumpY <= this.playerGroundY) {
        const impactVel = this.playerVerticalVel;
        this.playerJumpY = this.playerGroundY;
        this.playerVerticalVel = 0;
        this.isGrounded = true;
        this.isGliding = false;
        if (impactVel < -6.5) {
          this.mochi.triggerLandingImpact();
          this.callbacks.onLandExecuted?.();
        }
      }
    }

    // Select Mochi animation state based on current action
    if (this.slowMoTimer > 0) {
      this.mochi.setState('celebrate');
    } else if (!this.mochi.isInvulnerable()) {
      if (this.dashTimer > 0) {
        this.mochi.setState('dash');
      } else if (!this.isGrounded) {
        this.mochi.setState(this.isGliding ? 'glide' : 'jump');
      } else if (Math.abs(forwardInput) > 0.05) {
        this.mochi.setState('run');
      } else if (this.mochi.getState() !== 'land') {
        this.mochi.setState('idle');
      }
    }

    // Update Mochi secondary motion physics (ears, tail, cape)
    this.mochi.update(rawDt, {
      verticalVelocity: this.playerVerticalVel,
      turnRate: controls.moveRadial,
      moveSpeedRatio: speedMultiplier
    });

    this.updateObstaclesAndCollectibles(effectiveDt);
    this.evaluateMarketCapAndMilestones(rawDt, activeZone);

    this.syncMochiTransform();
    this.currentCameraTheta = THREE.MathUtils.lerp(
      this.currentCameraTheta,
      this.playerTheta,
      rawDt * 6.5
    );
    const lookAheadBoost = this.dashTimer > 0 ? 0.045 : 0;
    const camPose = this.towerMath.computeOrbitalCameraPose(
      this.currentCameraTheta,
      this.playerJumpY,
      this.playerRadialLane,
      lookAheadBoost
    );
    camera.position.copy(camPose.position.add(this.worldOrigin));
    camera.lookAt(camPose.lookAt.add(this.worldOrigin));
  }

  private updateObstaclesAndCollectibles(dt: number): void {
    const canTakeDamage =
      !this.mochi.isInvulnerable() &&
      this.slowMoTimer <= 0 &&
      this.dashTimer <= 0;

    // 1. Check Starlight Orbs collection
    for (const orb of this.starlightOrbs) {
      if (!orb.collected) {
        orb.mesh.rotation.y += dt * 3.2;
        const dTheta = Math.abs(this.playerTheta - orb.theta);
        if (
          dTheta < 0.055 &&
          Math.abs(this.playerRadialLane - orb.laneOffset) < 0.95 &&
          Math.abs(this.playerJumpY - orb.jumpY) < 1.15
        ) {
          orb.collected = true;
          orb.mesh.visible = false;
          this.collectedOrbsCount++;
          this.incrementCombo();
          this.callbacks.onOrbCollected?.(
            this.collectedOrbsCount,
            this.comboCount
          );
          this.checkCosmeticUnlocks();
        }
      }
    }

    // 2. Update & check obstacles and environmental mechanics
    for (const obs of this.obstacles) {
      obs.phase += obs.speed * dt;
      const dTheta = Math.abs(this.playerTheta - obs.theta);

      // Award flawless combo when cleanly passing an obstacle
      if (
        !obs.passedForCombo &&
        obs.kind !== 'UPDRAFT' &&
        this.playerTheta > obs.theta + obs.angularSpan * 0.65
      ) {
        obs.passedForCombo = true;
        if (!this.mochi.isInvulnerable()) {
          this.incrementCombo();
        }
      }

      if (obs.kind === 'MOVING_BLOCK') {
        const radialOffset =
          Math.sin(obs.phase * 1.8) * (this.towerMath.config.trackWidth * 0.36);
        const pos = this.towerMath.cylindricalToWorld(obs.theta, 0, radialOffset);
        obs.meshGroup.position.copy(pos);

        if (
          canTakeDamage &&
          dTheta < 0.044 &&
          Math.abs(this.playerRadialLane - radialOffset) < 0.72 &&
          this.playerJumpY < 1.22
        ) {
          this.handleObstacleHit();
        }
      } else if (obs.kind === 'ROTATING_BAR') {
        obs.meshGroup.rotation.y = obs.phase * 1.65;
        if (canTakeDamage && dTheta < 0.044 && this.playerJumpY < 0.85) {
          this.handleObstacleHit();
        }
      } else if (obs.kind === 'PULSE_ZONE') {
        const pulseVal = Math.sin(obs.phase * 2.2);
        const isHot = pulseVal > 0.48;
        if (obs.hazardMaterial) {
          obs.hazardMaterial.color.setHex(isHot ? 0xff1e56 : 0x6366f1);
          obs.hazardMaterial.opacity = isHot ? 0.86 : 0.28;
        }
        if (canTakeDamage && isHot && dTheta < 0.052 && this.playerJumpY < 0.35) {
          this.handleObstacleHit();
        }
      } else if (obs.kind === 'GAP') {
        if (
          canTakeDamage &&
          dTheta < obs.angularSpan * 0.42 &&
          this.playerJumpY <= 0.05 &&
          this.playerGroundY <= 0.05
        ) {
          this.mochi.setState('fall');
          this.playerTheta = Math.max(0, obs.theta - obs.angularSpan * 0.75);
          this.handleObstacleHit();
        }
      } else if (obs.kind === 'CRUMBLE_TRACK') {
        if (obs.crumbleState === 'INTACT') {
          if (
            dTheta < obs.angularSpan * 0.48 &&
            this.playerJumpY <= 0.08 &&
            this.playerGroundY <= 0.05
          ) {
            obs.crumbleState = 'SHAKING';
            obs.crumbleTimer = 0.55;
          }
        } else if (obs.crumbleState === 'SHAKING') {
          obs.crumbleTimer = (obs.crumbleTimer || 0) - dt;
          obs.meshGroup.position.y =
            this.towerMath.thetaToBaseHeight(obs.theta) +
            Math.sin(obs.phase * 28) * 0.06;
          if ((obs.crumbleTimer || 0) <= 0) {
            obs.crumbleState = 'BROKEN';
            obs.crumbleTimer = 3.2;
            obs.meshGroup.visible = false;
          }
        } else if (obs.crumbleState === 'BROKEN') {
          obs.crumbleTimer = (obs.crumbleTimer || 0) - dt;
          if (
            canTakeDamage &&
            dTheta < obs.angularSpan * 0.42 &&
            this.playerJumpY <= 0.05 &&
            this.playerGroundY <= 0.05
          ) {
            this.mochi.setState('fall');
            this.playerTheta = Math.max(0, obs.theta - obs.angularSpan * 0.75);
            this.handleObstacleHit();
          }
          if ((obs.crumbleTimer || 0) <= 0) {
            obs.crumbleState = 'INTACT';
            obs.meshGroup.visible = true;
            obs.meshGroup.position.y = this.towerMath.thetaToBaseHeight(
              obs.theta
            );
          }
        }
      } else if (obs.kind === 'WIND_GUST') {
        const gustActive = Math.sin(obs.phase * 1.4) > -0.15;
        if (obs.hazardMaterial) {
          obs.hazardMaterial.opacity = gustActive ? 0.52 : 0.14;
        }
        if (gustActive && dTheta < obs.angularSpan * 0.55 && this.dashTimer <= 0) {
          const pushDir = Math.sin(obs.phase * 0.7) >= 0 ? 1 : -1;
          this.playerRadialLane = THREE.MathUtils.clamp(
            this.playerRadialLane + pushDir * 1.85 * dt,
            -this.towerMath.config.trackWidth * 0.43,
            this.towerMath.config.trackWidth * 0.43
          );
        }
      } else if (obs.kind === 'UPDRAFT') {
        obs.meshGroup.rotation.y += dt * 2.5;
        if (
          dTheta < obs.angularSpan * 0.55 &&
          Math.abs(this.playerRadialLane) < 1.65
        ) {
          const liftVel = this.isGliding ? 10.6 : 8.4;
          if (this.playerVerticalVel < liftVel) {
            this.playerVerticalVel = liftVel;
            this.isGrounded = false;
          }
        }
      }
    }
  }

  private incrementCombo(): void {
    this.comboCount++;
    if (this.comboCount > this.maxCombo) {
      this.maxCombo = this.comboCount;
    }
    if (this.comboCount > 0 && this.comboCount % 5 === 0) {
      if (this.hearts < 3) {
        this.hearts++;
      }
      this.callbacks.onComboMilestone?.(this.comboCount);
      this.checkCosmeticUnlocks();
    }
  }

  private checkCosmeticUnlocks(): void {
    if (this.comboCount >= 5 || this.collectedOrbsCount >= 15) {
      if (this.mochi.unlockCosmetic('auroraVisor')) {
        this.callbacks.onCosmeticUnlocked?.('auroraVisor');
      }
    }
    if (this.collectedOrbsCount >= 30) {
      if (this.mochi.unlockCosmetic('starlightCape')) {
        this.callbacks.onCosmeticUnlocked?.('starlightCape');
      }
    }
  }

  private handleObstacleHit(): void {
    this.hearts--;
    this.comboCount = 0;
    this.isGliding = false;
    this.mochi.triggerHitInvulnerability(1.8);
    this.playerTheta = Math.max(this.checkpointTheta, this.playerTheta - 0.12);
    this.playerVerticalVel = 5.5;
    this.isGrounded = false;

    const cpLabel = this.getCurrentCheckpointLabel();
    if (this.hearts <= 0) {
      const peakCap = this.towerMath.heightToMarketCap(this.maxReachedHeightY);
      this.callbacks.onPlayerFailedRun(peakCap, cpLabel);
    } else {
      this.callbacks.onPlayerDamaged(this.hearts, cpLabel);
    }
  }

  private evaluateMarketCapAndMilestones(
    rawDt: number,
    activeZone: TowerZoneSpec
  ): void {
    const currentBaseY = this.towerMath.thetaToBaseHeight(this.playerTheta);
    this.maxReachedHeightY = Math.max(this.maxReachedHeightY, currentBaseY);

    const currentCapUSD = this.towerMath.heightToMarketCap(currentBaseY);
    const peakCapUSD = this.towerMath.heightToMarketCap(this.maxReachedHeightY);
    const progressRatio = THREE.MathUtils.clamp(
      currentBaseY / this.towerMath.config.totalHeight,
      0,
      1
    );

    // 1. Check early simulation progress milestones ($250M, $500M, $1B)
    for (const simNode of this.earlySimNodes) {
      if (!simNode.reached && currentBaseY >= simNode.heightY) {
        simNode.reached = true;
        this.checkpointTheta = Math.max(this.checkpointTheta, simNode.theta);
        this.checkpointCapUSD = Math.max(
          this.checkpointCapUSD,
          simNode.sim.thresholdUSD
        );
        this.callbacks.onEarlySimMilestoneReached?.(simNode.sim);
      }
    }

    // 2. Check all 30 verified crypto historical daily market-cap records
    let nextMilestone: CryptoMilestone | null = null;
    for (let i = 0; i < this.milestoneNodes.length; i++) {
      const node = this.milestoneNodes[i];
      if (!node.surpassed) {
        if (currentBaseY >= node.heightY) {
          node.surpassed = true;
          this.checkpointTheta = node.theta;
          this.checkpointCoinSymbol = node.milestone.symbol;
          this.checkpointCapUSD = node.milestone.recordMarketCapUSD;

          const isMajor = node.milestone.isMajorCheckpoint;
          if (isMajor) {
            this.slowMoTimer = 1.65;
            this.shockwaveTimer = 1.35;
            this.shockwaveRing.position.y = node.heightY;
            (
              this.shockwaveRing.material as THREE.MeshBasicMaterial
            ).color.set(node.milestone.brandColor);
          }

          this.callbacks.onMilestoneSurpassed(
            node.milestone,
            i + 1,
            this.milestoneNodes.length,
            isMajor
          );

          if (i === this.milestoneNodes.length - 1) {
            this.summitTriggered = true;
            this.mochi.setState('celebrate');

            localStorage.setItem(ADVENTURE_CLEARED_STORAGE_KEY, 'true');
            if (this.mochi.unlockCosmetic('goldenCrown')) {
              this.callbacks.onCosmeticUnlocked?.('goldenCrown');
            }

            let isNewBestTime = false;
            const prevBest = SpiralTowerStage.getBestTimeTrialSeconds();
            if (
              prevBest === null ||
              this.runElapsedSeconds < prevBest
            ) {
              isNewBestTime = true;
              localStorage.setItem(
                BEST_TIMETRIAL_STORAGE_KEY,
                this.runElapsedSeconds.toFixed(2)
              );
            }

            this.callbacks.onTowerSummitReached({
              totalTimeSeconds: this.runElapsedSeconds,
              surpassedCount: this.milestoneNodes.length,
              retriesUsed: this.retriesUsed,
              collectedOrbs: this.collectedOrbsCount,
              maxCombo: this.maxCombo,
              isTimeTrial: this.isTimeTrial,
              isNewBestTime
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
      const t = 1 - this.shockwaveTimer / 1.35;
      const scale = 1 + t * 1.8;
      this.shockwaveRing.scale.set(scale, scale, 1);
      (this.shockwaveRing.material as THREE.MeshBasicMaterial).opacity =
        (1 - t) * 0.85;
    }

    this.callbacks.onMarketCapUpdated(
      currentCapUSD,
      peakCapUSD,
      nextMilestone,
      progressRatio,
      activeZone,
      this.comboCount,
      this.collectedOrbsCount,
      this.runElapsedSeconds
    );
  }
}
