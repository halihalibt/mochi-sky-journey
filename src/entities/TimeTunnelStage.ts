import * as THREE from 'three';
import {
  GENLAYER_HISTORY_MILESTONES,
  GenLayerMilestone
} from '../data/genlayerHistory';
import { i18n } from '../i18n/I18nManager';
import { MochiCharacter } from './MochiCharacter';

export interface TunnelCallbacks {
  onMilestoneReached: (
    milestone: GenLayerMilestone,
    index: number,
    total: number
  ) => void;
  onTunnelCompleted: () => void;
  onFlightRingCollected?: (totalCollected: number) => void;
}

interface FlightBoostRing {
  z: number;
  x: number;
  y: number;
  collected: boolean;
  mesh: THREE.Mesh;
}

interface GateBillboardEntry {
  milestone: GenLayerMilestone;
  step: number;
  total: number;
  mesh: THREE.Mesh;
}

export class TimeTunnelStage {
  public readonly group: THREE.Group;
  private readonly mochi: MochiCharacter;
  private readonly callbacks: TunnelCallbacks;

  public readonly totalDurationSeconds = 90;
  public readonly forwardSpeed = 12;
  public readonly totalLength = 1080;

  private currentZ = 0;
  private targetX = 0;
  private targetY = 0;
  private currentX = 0;
  private currentY = 0;
  private animTime = 0;

  private tunnelRings: THREE.Mesh[] = [];
  private floatingCrystals: THREE.Mesh[] = [];
  private flightBoostRings: FlightBoostRing[] = [];
  private gateBillboards: GateBillboardEntry[] = [];

  private trailParticles: THREE.Points;
  private trailPositions: Float32Array;

  private triggeredMilestones = new Set<string>();
  private collectedRingsCount = 0;
  private completed = false;
  private reducedMotion = false;

  constructor(mochi: MochiCharacter, callbacks: TunnelCallbacks) {
    this.group = new THREE.Group();
    this.mochi = mochi;
    this.callbacks = callbacks;

    this.buildTunnelEnvironment();
    this.buildMilestoneGates();
    this.buildInteractiveFlightRings();

    const { points, positions } = this.createTwinJetTrail();
    this.trailParticles = points;
    this.trailPositions = positions;
    this.group.add(this.trailParticles);

    i18n.onChange(() => {
      this.refreshLocaleBillboards();
    });
  }

  private buildTunnelEnvironment(): void {
    const ringGeo = new THREE.TorusGeometry(14.2, 0.09, 14, 56);
    for (let z = 0; z >= -this.totalLength - 120; z -= 18) {
      const progress = Math.abs(z) / this.totalLength;
      const hue = (progress * 0.48 + 0.52) % 1.0;
      const color = new THREE.Color().setHSL(hue, 0.82, 0.62);
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.38
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(0, 0, z);
      this.group.add(ring);
      this.tunnelRings.push(ring);
    }

    // Floating fantasy chrono-crystals & cloud wisps along tunnel periphery
    const crystalGeo = new THREE.OctahedronGeometry(0.85, 0);
    const cloudGeo = new THREE.TorusGeometry(17.5, 2.6, 10, 32);

    for (let z = -30; z >= -this.totalLength - 80; z -= 36) {
      const angle = (z * 0.07) % (Math.PI * 2);
      const radius = 11.5 + (Math.abs(z) % 3);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x1e3a8a,
        emissiveIntensity: 0.45,
        roughness: 0.2,
        metalness: 0.5
      });
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * (radius * 0.65),
        z
      );
      crystal.scale.set(0.8, 1.8, 0.8);
      this.group.add(crystal);
      this.floatingCrystals.push(crystal);

      if (Math.abs(z) % 108 === 0) {
        const cloudMat = new THREE.MeshStandardMaterial({
          color: 0x7dd3fc,
          transparent: true,
          opacity: 0.11,
          roughness: 0.9
        });
        const cloudRing = new THREE.Mesh(cloudGeo, cloudMat);
        cloudRing.position.set(0, 0, z);
        this.group.add(cloudRing);
      }
    }

    // Grand tunnel exit cloud portal ring
    const exitPortal = new THREE.Mesh(
      new THREE.TorusGeometry(16, 1.8, 16, 64),
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.45
      })
    );
    exitPortal.position.set(0, 0, -this.totalLength);
    this.group.add(exitPortal);

    // Starfield particles
    const starCount = 1800;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 15 + Math.random() * 40;
      starPos[i * 3] = Math.cos(angle) * radius;
      starPos[i * 3 + 1] = Math.sin(angle) * radius;
      starPos[i * 3 + 2] = -Math.random() * (this.totalLength + 180);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xe0f2fe,
      size: 0.34,
      transparent: true,
      opacity: 0.78
    });
    this.group.add(new THREE.Points(starGeo, starMat));
  }

  private buildMilestoneGates(): void {
    const count = GENLAYER_HISTORY_MILESTONES.length;
    const spacing = (this.totalLength - 135) / count;

    const pillarGeo = new THREE.CylinderGeometry(0.28, 0.36, 9.5, 16);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.35,
      metalness: 0.6
    });

    GENLAYER_HISTORY_MILESTONES.forEach((item, index) => {
      const zPos = -85 - index * spacing;
      const gateGroup = new THREE.Group();
      gateGroup.position.set(0, 0, zPos);

      const accent = new THREE.Color(item.accentColor);
      const archRing = new THREE.Mesh(
        new THREE.TorusGeometry(9.4, 0.24, 16, 64),
        new THREE.MeshBasicMaterial({ color: accent })
      );
      gateGroup.add(archRing);

      const innerHalo = new THREE.Mesh(
        new THREE.TorusGeometry(8.9, 0.06, 12, 64),
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.65
        })
      );
      gateGroup.add(innerHalo);

      // Ornate fantasy side pillars framing the gate
      [-1, 1].forEach((side) => {
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(side * 9.4, -1.2, 0);
        gateGroup.add(pillar);

        const crystalCap = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.55, 0),
          new THREE.MeshBasicMaterial({ color: accent })
        );
        crystalCap.position.set(side * 9.4, 3.9, 0);
        gateGroup.add(crystalCap);
      });

      const boardTex = this.renderMilestoneBillboardTexture(
        item,
        index + 1,
        count
      );
      const boardMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(11.8, 5.1),
        new THREE.MeshBasicMaterial({
          map: boardTex,
          transparent: true,
          side: THREE.DoubleSide
        })
      );
      const sideOffset = index % 2 === 0 ? -3.1 : 3.1;
      boardMesh.position.set(sideOffset, 3.35, 0.5);
      gateGroup.add(boardMesh);

      this.gateBillboards.push({
        milestone: item,
        step: index + 1,
        total: count,
        mesh: boardMesh
      });

      this.group.add(gateGroup);
    });
  }

  private buildInteractiveFlightRings(): void {
    const ringGeo = new THREE.TorusGeometry(1.65, 0.11, 14, 36);
    for (let i = 0; i < 22; i++) {
      const z = -48 - i * 44;
      const x = Math.sin(i * 1.15) * 3.8;
      const y = Math.cos(i * 0.9) * 1.9 - 0.4;

      const mat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.85
      });
      const mesh = new THREE.Mesh(ringGeo, mat);
      mesh.position.set(x, y, z);
      this.group.add(mesh);

      this.flightBoostRings.push({
        z,
        x,
        y,
        collected: false,
        mesh
      });
    }
  }

  public refreshLocaleBillboards(): void {
    for (const entry of this.gateBillboards) {
      const mat = entry.mesh.material as THREE.MeshBasicMaterial;
      if (mat.map) {
        mat.map.dispose();
      }
      mat.map = this.renderMilestoneBillboardTexture(
        entry.milestone,
        entry.step,
        entry.total
      );
      mat.needsUpdate = true;
    }
  }

  private renderMilestoneBillboardTexture(
    item: GenLayerMilestone,
    step: number,
    total: number
  ): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 440;
    const ctx = canvas.getContext('2d')!;

    const fontStack = i18n.getLocaleOption().fontFamily;
    const strings = i18n.getStrings();
    const localized = i18n.getMilestoneText(item);

    // Translucent dark-glass card with glowing border
    ctx.fillStyle = 'rgba(10, 16, 32, 0.9)';
    ctx.strokeStyle = item.accentColor;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.roundRect(16, 16, 992, 408, 28);
    ctx.fill();
    ctx.stroke();

    // Header badge: NODE X/12 • YYYY-MM-DD • [dateKind]
    ctx.fillStyle = item.accentColor;
    ctx.font = 'bold 30px ' + fontStack;
    ctx.fillText(
      strings.historyGatePrefix +
        ' ' +
        step +
        '/' +
        total +
        '  •  ' +
        item.date +
        '  [' +
        localized.dateKindLabel +
        ']',
      52,
      78
    );

    // Localized Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px ' + fontStack;
    ctx.fillText(localized.title, 52, 144);

    // Localized concise summary (wrapped cleanly for CJK or Latin)
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '30px ' + fontStack;
    i18n.wrapCanvasText(ctx, localized.summary, 52, 206, 916, 44, 3);

    // Footer: Verified Source & Factual Date Note
    ctx.fillStyle = '#94a3b8';
    ctx.font = '22px ' + fontStack;
    ctx.fillText(
      strings.verifiedSourcePrefix + item.sourceLabel + '  |  ' + localized.note,
      52,
      388,
      916
    );

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  private createTwinJetTrail(): {
    points: THREE.Points;
    positions: Float32Array;
  } {
    const count = 120;
    const positions = new Float32Array(count * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x19e6ff,
      size: 0.26,
      transparent: true,
      opacity: 0.78
    });
    return { points: new THREE.Points(geo, mat), positions };
  }

  public setReducedMotion(reduced: boolean): void {
    this.reducedMotion = reduced;
  }

  public start(): void {
    this.currentZ = 0;
    this.currentX = 0;
    this.currentY = -1.0;
    this.targetX = 0;
    this.targetY = -1.0;
    this.completed = false;
    this.collectedRingsCount = 0;
    this.triggeredMilestones.clear();

    this.flightBoostRings.forEach((r) => {
      r.collected = false;
      r.mesh.visible = true;
      r.mesh.scale.set(1, 1, 1);
    });

    this.mochi.setAirplaneVisible(true);
    this.mochi.setState('fly');
    this.mochi.root.rotation.set(0, Math.PI, 0);
  }

  public setFlightInput(inputX: number, inputY: number): void {
    this.targetX = THREE.MathUtils.clamp(inputX * 6.4, -6.4, 6.4);
    this.targetY = THREE.MathUtils.clamp(inputY * 3.8 - 0.4, -4.2, 3.6);
  }

  public update(dt: number, camera: THREE.PerspectiveCamera): void {
    if (this.completed) return;

    this.animTime += dt;
    this.currentZ -= this.forwardSpeed * dt;
    const prevX = this.currentX;
    const prevY = this.currentY;

    this.currentX = THREE.MathUtils.lerp(this.currentX, this.targetX, dt * 6.5);
    this.currentY = THREE.MathUtils.lerp(this.currentY, this.targetY, dt * 6.5);

    const velocityX = (this.currentX - prevX) / Math.max(dt, 0.001);
    const velocityY = (this.currentY - prevY) / Math.max(dt, 0.001);

    this.mochi.root.position.set(this.currentX, this.currentY, this.currentZ);
    this.mochi.root.rotation.z = THREE.MathUtils.clamp(
      velocityX * 0.065,
      -0.55,
      0.55
    );
    this.mochi.root.rotation.x = THREE.MathUtils.clamp(
      -velocityY * 0.045,
      -0.35,
      0.35
    );

    // Update Mochi's secondary cockpit motion
    this.mochi.update(dt, {
      verticalVelocity: velocityY,
      turnRate: -velocityX * 0.08
    });

    // Camera follows behind & slightly above the open cockpit so Mochi is clearly visible
    const shakeScale = this.reducedMotion ? 0 : 0.04;
    const camBobY = Math.sin(this.animTime * 3.5) * shakeScale;
    camera.position.set(
      this.currentX * 0.56,
      this.currentY * 0.58 + 2.45 + camBobY,
      this.currentZ + 6.9
    );
    camera.lookAt(
      this.currentX * 0.78,
      this.currentY * 0.78 + 1.25,
      this.currentZ - 14
    );

    // Rotate floating crystals gently
    if (!this.reducedMotion) {
      for (const crystal of this.floatingCrystals) {
        crystal.rotation.y += dt * 0.8;
      }
    }

    // Check interactive flight boost rings
    for (const ring of this.flightBoostRings) {
      if (!ring.collected) {
        ring.mesh.rotation.z += dt * 2.2;
        if (Math.abs(this.currentZ - ring.z) < 1.8) {
          const dist = Math.hypot(this.currentX - ring.x, this.currentY - ring.y);
          if (dist < 2.3) {
            ring.collected = true;
            ring.mesh.visible = false;
            this.collectedRingsCount++;
            this.callbacks.onFlightRingCollected?.(this.collectedRingsCount);
          }
        }
      }
    }

    // Update twin engine particle trails
    for (let i = this.trailPositions.length - 6; i >= 6; i -= 6) {
      for (let j = 0; j < 6; j++) {
        this.trailPositions[i + j] = this.trailPositions[i + j - 6];
      }
      this.trailPositions[i + 2] += 0.22;
      this.trailPositions[i + 5] += 0.22;
    }
    // Left nacelle particle
    this.trailPositions[0] = this.currentX - 0.58;
    this.trailPositions[1] = this.currentY + 0.3;
    this.trailPositions[2] = this.currentZ + 1.6;
    // Right nacelle particle
    this.trailPositions[3] = this.currentX + 0.58;
    this.trailPositions[4] = this.currentY + 0.3;
    this.trailPositions[5] = this.currentZ + 1.6;
    (
      this.trailParticles.geometry.attributes.position as THREE.BufferAttribute
    ).needsUpdate = true;

    // Trigger 12 verified history milestones sorted by date
    const count = GENLAYER_HISTORY_MILESTONES.length;
    const spacing = (this.totalLength - 135) / count;
    GENLAYER_HISTORY_MILESTONES.forEach((item, index) => {
      const gateZ = -85 - index * spacing;
      if (
        !this.triggeredMilestones.has(item.id) &&
        this.currentZ <= gateZ + 16
      ) {
        this.triggeredMilestones.add(item.id);
        this.callbacks.onMilestoneReached(item, index + 1, count);
      }
    });

    if (Math.abs(this.currentZ) >= this.totalLength) {
      this.completed = true;
      this.callbacks.onTunnelCompleted();
    }
  }
}
