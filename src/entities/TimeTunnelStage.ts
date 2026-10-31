import * as THREE from 'three';
import { GENLAYER_HISTORY_MILESTONES, GenLayerMilestone } from '../data/genlayerHistory';
import { MochiCharacter } from './MochiCharacter';

export interface TunnelCallbacks {
  onMilestoneReached: (milestone: GenLayerMilestone, index: number, total: number) => void;
  onTunnelCompleted: () => void;
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

  private tunnelRings: THREE.Mesh[] = [];
  private trailParticles: THREE.Points;
  private trailPositions: Float32Array;
  private triggeredMilestones = new Set<string>();
  private completed = false;

  constructor(mochi: MochiCharacter, callbacks: TunnelCallbacks) {
    this.group = new THREE.Group();
    this.mochi = mochi;
    this.callbacks = callbacks;

    this.buildTunnelEnvironment();
    this.buildMilestoneGates();

    const { points, positions } = this.createJetTrail();
    this.trailParticles = points;
    this.trailPositions = positions;
    this.group.add(this.trailParticles);
  }

  private buildTunnelEnvironment(): void {
    const ringGeo = new THREE.TorusGeometry(13.5, 0.08, 12, 48);
    for (let z = 0; z >= -this.totalLength - 120; z -= 18) {
      const hue = ((Math.abs(z) / this.totalLength) * 0.55 + 0.52) % 1.0;
      const color = new THREE.Color().setHSL(hue, 0.85, 0.6);
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.42
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(0, 0, z);
      this.group.add(ring);
      this.tunnelRings.push(ring);
    }

    const starCount = 1600;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 15 + Math.random() * 38;
      starPos[i * 3] = Math.cos(angle) * radius;
      starPos[i * 3 + 1] = Math.sin(angle) * radius;
      starPos[i * 3 + 2] = -Math.random() * (this.totalLength + 160);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xbae6fd,
      size: 0.35,
      transparent: true,
      opacity: 0.75
    });
    this.group.add(new THREE.Points(starGeo, starMat));
  }

  private buildMilestoneGates(): void {
    const count = GENLAYER_HISTORY_MILESTONES.length;
    const spacing = (this.totalLength - 140) / count;

    GENLAYER_HISTORY_MILESTONES.forEach((item, index) => {
      const zPos = -90 - index * spacing;
      const gateGroup = new THREE.Group();
      gateGroup.position.set(0, 0, zPos);

      const accent = new THREE.Color(item.accentColor);
      const archRing = new THREE.Mesh(
        new THREE.TorusGeometry(9.2, 0.22, 16, 64),
        new THREE.MeshBasicMaterial({ color: accent })
      );
      gateGroup.add(archRing);

      const boardTex = this.renderMilestoneBillboardTexture(item, index + 1, count);
      const boardMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(11.5, 4.8),
        new THREE.MeshBasicMaterial({
          map: boardTex,
          transparent: true,
          side: THREE.DoubleSide
        })
      );
      const sideOffset = index % 2 === 0 ? -3.2 : 3.2;
      boardMesh.position.set(sideOffset, 3.4, 0.5);
      gateGroup.add(boardMesh);

      this.group.add(gateGroup);
    });
  }

  private renderMilestoneBillboardTexture(
    item: GenLayerMilestone,
    step: number,
    total: number
  ): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 420;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = 'rgba(11, 18, 34, 0.88)';
    ctx.strokeStyle = item.accentColor;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.roundRect(16, 16, 992, 388, 28);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = item.accentColor;
    ctx.font = 'bold 34px system-ui, -apple-system, sans-serif';
    ctx.fillText('NODE ' + step + '/' + total + '  •  ' + item.date, 56, 84);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
    ctx.fillText(item.title, 56, 156);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '32px system-ui, -apple-system, sans-serif';
    this.wrapText(ctx, item.summary, 56, 226, 910, 48);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '24px system-ui, -apple-system, sans-serif';
    ctx.fillText('来源核验: ' + item.sourceLabel, 56, 365);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  private wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ): void {
    let line = '';
    let currentY = y;
    for (const char of text) {
      const testLine = line + char;
      if (ctx.measureText(testLine).width > maxWidth && line.length > 0) {
        ctx.fillText(line, x, currentY);
        line = char;
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    if (line) ctx.fillText(line, x, currentY);
  }

  private createJetTrail(): { points: THREE.Points; positions: Float32Array } {
    const count = 90;
    const positions = new Float32Array(count * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x19e6ff,
      size: 0.28,
      transparent: true,
      opacity: 0.8
    });
    return { points: new THREE.Points(geo, mat), positions };
  }

  public start(): void {
    this.currentZ = 0;
    this.currentX = 0;
    this.currentY = -1.2;
    this.targetX = 0;
    this.targetY = -1.2;
    this.completed = false;
    this.triggeredMilestones.clear();

    this.mochi.setAirplaneVisible(true);
    this.mochi.setState('fly');
    this.mochi.root.rotation.set(0, Math.PI, 0);
  }

  public setFlightInput(inputX: number, inputY: number): void {
    this.targetX = THREE.MathUtils.clamp(inputX * 6.2, -6.2, 6.2);
    this.targetY = THREE.MathUtils.clamp(inputY * 3.8 - 0.5, -4.2, 3.6);
  }

  public update(dt: number, camera: THREE.PerspectiveCamera): void {
    if (this.completed) return;

    this.currentZ -= this.forwardSpeed * dt;
    const prevX = this.currentX;
    const prevY = this.currentY;

    this.currentX = THREE.MathUtils.lerp(this.currentX, this.targetX, dt * 6.5);
    this.currentY = THREE.MathUtils.lerp(this.currentY, this.targetY, dt * 6.5);

    const velocityX = (this.currentX - prevX) / Math.max(dt, 0.001);
    const velocityY = (this.currentY - prevY) / Math.max(dt, 0.001);

    this.mochi.root.position.set(this.currentX, this.currentY, this.currentZ);
    this.mochi.root.rotation.z = THREE.MathUtils.clamp(velocityX * 0.065, -0.55, 0.55);
    this.mochi.root.rotation.x = THREE.MathUtils.clamp(-velocityY * 0.045, -0.35, 0.35);

    camera.position.set(
      this.currentX * 0.55,
      this.currentY * 0.55 + 2.3,
      this.currentZ + 7.2
    );
    camera.lookAt(
      this.currentX * 0.75,
      this.currentY * 0.75 + 1.1,
      this.currentZ - 15
    );

    for (let i = this.trailPositions.length - 3; i >= 3; i -= 3) {
      this.trailPositions[i] = this.trailPositions[i - 3];
      this.trailPositions[i + 1] = this.trailPositions[i - 2] - 0.02;
      this.trailPositions[i + 2] = this.trailPositions[i - 1] + 0.25;
    }
    this.trailPositions[0] = this.currentX;
    this.trailPositions[1] = this.currentY + 0.52;
    this.trailPositions[2] = this.currentZ + 1.4;
    (this.trailParticles.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;

    const count = GENLAYER_HISTORY_MILESTONES.length;
    const spacing = (this.totalLength - 140) / count;
    GENLAYER_HISTORY_MILESTONES.forEach((item, index) => {
      const gateZ = -90 - index * spacing;
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
