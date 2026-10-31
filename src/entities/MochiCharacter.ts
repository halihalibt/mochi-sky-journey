import * as THREE from 'three';

export type MochiActionState =
  | 'fly'
  | 'idle'
  | 'run'
  | 'jump'
  | 'hit'
  | 'fall'
  | 'celebrate';

export class MochiCharacter {
  public readonly root: THREE.Group;
  public readonly characterGroup: THREE.Group;
  public readonly airplaneGroup: THREE.Group;

  private headGroup: THREE.Group;
  private torsoGroup: THREE.Group;
  private leftArmGroup: THREE.Group;
  private rightArmPawGroup: THREE.Group;
  private leftLegGroup: THREE.Group;
  private rightLegGroup: THREE.Group;
  private tailCurveMesh: THREE.Mesh;
  private propellerMesh!: THREE.Mesh;

  private visorCanvas: HTMLCanvasElement;
  private visorCtx: CanvasRenderingContext2D;
  private visorTexture: THREE.CanvasTexture;

  private currentState: MochiActionState = 'idle';
  private animTime: number = 0;
  private invulnerableTimer: number = 0;

  constructor() {
    this.root = new THREE.Group();
    this.characterGroup = new THREE.Group();
    this.airplaneGroup = new THREE.Group();

    this.headGroup = new THREE.Group();
    this.torsoGroup = new THREE.Group();
    this.leftArmGroup = new THREE.Group();
    this.rightArmPawGroup = new THREE.Group();
    this.leftLegGroup = new THREE.Group();
    this.rightLegGroup = new THREE.Group();

    this.visorCanvas = document.createElement('canvas');
    this.visorCanvas.width = 512;
    this.visorCanvas.height = 512;
    this.visorCtx = this.visorCanvas.getContext('2d')!;
    this.visorTexture = new THREE.CanvasTexture(this.visorCanvas);
    this.visorTexture.colorSpace = THREE.SRGBColorSpace;

    this.tailCurveMesh = this.buildMochiBody();
    this.buildAirplaneCockpit();

    this.root.add(this.characterGroup);
    this.root.add(this.airplaneGroup);

    this.drawVisorExpression('idle');
    this.setAirplaneVisible(false);
  }

  private buildMochiBody(): THREE.Mesh {
    const whiteMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.35,
      metalness: 0.05
    });
    const greyArmorMat = new THREE.MeshStandardMaterial({
      color: 0x8c8d94,
      roughness: 0.4,
      metalness: 0.3
    });
    const darkGloveMat = new THREE.MeshStandardMaterial({
      color: 0x363b52,
      roughness: 0.45,
      metalness: 0.25
    });
    const purpleEarMat = new THREE.MeshStandardMaterial({
      color: 0xb829f7,
      emissive: 0x4a0e78,
      emissiveIntensity: 0.35,
      roughness: 0.3
    });
    const cyanGlowMat = new THREE.MeshBasicMaterial({
      color: 0x19e6ff
    });
    const darkOutlineMat = new THREE.MeshBasicMaterial({
      color: 0x1a1c24
    });

    this.headGroup.position.set(0, 1.55, 0);

    const helmetShell = new THREE.Mesh(
      new THREE.SphereGeometry(0.78, 32, 32),
      whiteMat
    );
    helmetShell.scale.set(1.06, 0.98, 0.96);
    this.headGroup.add(helmetShell);

    const visorRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.64, 0.09, 16, 40),
      greyArmorMat
    );
    visorRim.position.set(0, -0.02, 0.36);
    visorRim.scale.set(1.08, 0.92, 0.6);
    this.headGroup.add(visorRim);

    const visorGeo = new THREE.SphereGeometry(
      0.75,
      32,
      32,
      -Math.PI * 0.35,
      Math.PI * 0.7,
      Math.PI * 0.22,
      Math.PI * 0.56
    );
    const visorMat = new THREE.MeshBasicMaterial({
      map: this.visorTexture
    });
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.rotation.y = -Math.PI * 0.5;
    visorMesh.position.set(0, 0, 0.05);
    this.headGroup.add(visorMesh);

    const earGeo = new THREE.ConeGeometry(0.28, 0.58, 4);
    const innerEarGeo = new THREE.ConeGeometry(0.16, 0.42, 3);
    [-1, 1].forEach((side) => {
      const earPivot = new THREE.Group();
      earPivot.position.set(side * 0.52, 0.62, 0.02);
      earPivot.rotation.z = -side * 0.32;
      earPivot.rotation.y = side * 0.2;

      const outerEar = new THREE.Mesh(earGeo, purpleEarMat);
      earPivot.add(outerEar);

      const innerEar = new THREE.Mesh(innerEarGeo, greyArmorMat);
      innerEar.position.set(0, -0.03, 0.08);
      earPivot.add(innerEar);

      const headphoneRim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.26, 0.26, 0.14, 24),
        greyArmorMat
      );
      headphoneRim.rotation.z = Math.PI * 0.5;
      headphoneRim.position.set(side * 0.78, 0.02, 0.02);
      this.headGroup.add(headphoneRim);

      const headphoneCore = new THREE.Mesh(
        new THREE.CylinderGeometry(0.17, 0.17, 0.16, 24),
        purpleEarMat
      );
      headphoneCore.rotation.z = Math.PI * 0.5;
      headphoneCore.position.set(side * 0.78, 0.02, 0.02);
      this.headGroup.add(headphoneCore);

      this.headGroup.add(earPivot);
    });

    this.characterGroup.add(this.headGroup);

    this.torsoGroup.position.set(0, 0.68, 0);
    const bodyMesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.36, 0.32, 16, 24),
      whiteMat
    );
    this.torsoGroup.add(bodyMesh);

    const chestLogoTex = this.createChestLogoTexture();
    const chestPatch = new THREE.Mesh(
      new THREE.PlaneGeometry(0.38, 0.38),
      new THREE.MeshBasicMaterial({ map: chestLogoTex, transparent: true })
    );
    chestPatch.position.set(0, 0.04, 0.365);
    this.torsoGroup.add(chestPatch);

    const backArmor = new THREE.Mesh(
      new THREE.SphereGeometry(
        0.375,
        24,
        16,
        0,
        Math.PI * 2,
        0,
        Math.PI * 0.55
      ),
      greyArmorMat
    );
    backArmor.position.set(0, 0.12, -0.02);
    this.torsoGroup.add(backArmor);

    const backNodeRing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.11, 0.05, 20),
      darkOutlineMat
    );
    backNodeRing.rotation.x = Math.PI * 0.5;
    backNodeRing.position.set(0, 0.12, -0.36);
    this.torsoGroup.add(backNodeRing);

    const backNodeCore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.06, 20),
      cyanGlowMat
    );
    backNodeCore.rotation.x = Math.PI * 0.5;
    backNodeCore.position.set(0, 0.12, -0.365);
    this.torsoGroup.add(backNodeCore);

    this.characterGroup.add(this.torsoGroup);

    this.leftArmGroup.position.set(-0.42, 0.85, 0);
    const leftUpperArm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.11, 0.22, 8, 16),
      greyArmorMat
    );
    leftUpperArm.position.set(-0.06, -0.14, 0);
    this.leftArmGroup.add(leftUpperArm);

    const leftForearm = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 16, 16),
      darkGloveMat
    );
    leftForearm.position.set(-0.08, -0.32, 0.02);
    this.leftArmGroup.add(leftForearm);

    const leftWristLight = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 12, 12),
      cyanGlowMat
    );
    leftWristLight.position.set(-0.14, -0.3, 0.11);
    this.leftArmGroup.add(leftWristLight);
    this.characterGroup.add(this.leftArmGroup);

    this.rightArmPawGroup.position.set(0.44, 0.85, 0);
    const rightUpperArm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.12, 0.2, 8, 16),
      greyArmorMat
    );
    rightUpperArm.position.set(0.08, -0.1, 0);
    this.rightArmPawGroup.add(rightUpperArm);

    const megaPawDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.28, 0.22, 24),
      darkGloveMat
    );
    megaPawDisc.rotation.x = Math.PI * 0.5;
    megaPawDisc.rotation.z = -0.25;
    megaPawDisc.position.set(0.24, -0.22, 0.14);
    this.rightArmPawGroup.add(megaPawDisc);

    const mainPad = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.085, 0.04, 16),
      cyanGlowMat
    );
    mainPad.rotation.x = Math.PI * 0.5;
    mainPad.position.set(0.18, -0.24, 0.25);
    this.rightArmPawGroup.add(mainPad);

    const toeOffsets = [
      [0.34, -0.09],
      [0.37, -0.22],
      [0.31, -0.34],
      [0.19, -0.09]
    ];
    toeOffsets.forEach(([ox, oy]) => {
      const toePad = new THREE.Mesh(
        new THREE.CylinderGeometry(0.048, 0.048, 0.04, 14),
        cyanGlowMat
      );
      toePad.rotation.x = Math.PI * 0.5;
      toePad.position.set(ox, oy, 0.25);
      this.rightArmPawGroup.add(toePad);
    });
    this.characterGroup.add(this.rightArmPawGroup);

    this.leftLegGroup.position.set(-0.19, 0.35, 0);
    const leftLegMesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.13, 0.2, 8, 16),
      whiteMat
    );
    leftLegMesh.position.set(0, -0.15, 0);
    this.leftLegGroup.add(leftLegMesh);
    this.characterGroup.add(this.leftLegGroup);

    this.rightLegGroup.position.set(0.19, 0.35, 0);
    const rightLegMesh = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.13, 0.2, 8, 16),
      whiteMat
    );
    rightLegMesh.position.set(0, -0.15, 0);
    this.rightLegGroup.add(rightLegMesh);
    this.characterGroup.add(this.rightLegGroup);

    const tailCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.42, -0.32),
      new THREE.Vector3(-0.18, 0.32, -0.58),
      new THREE.Vector3(-0.38, 0.48, -0.72),
      new THREE.Vector3(-0.32, 0.72, -0.68)
    ]);
    const tailGeo = new THREE.TubeGeometry(tailCurve, 20, 0.048, 10, false);
    const tailMat = new THREE.MeshStandardMaterial({
      color: 0x1e1a1a,
      roughness: 0.7
    });
    const tailMesh = new THREE.Mesh(tailGeo, tailMat);
    this.characterGroup.add(tailMesh);

    return tailMesh;
  }

  private createChestLogoTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, 256, 256);

    ctx.fillStyle = '#a624f2';
    ctx.beginPath();
    ctx.moveTo(128, 28);
    ctx.lineTo(216, 212);
    ctx.lineTo(168, 224);
    ctx.lineTo(128, 138);
    ctx.lineTo(88, 224);
    ctx.lineTo(40, 212);
    ctx.closePath();
    ctx.fill();

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.moveTo(128, 92);
    ctx.lineTo(156, 156);
    ctx.lineTo(100, 156);
    ctx.closePath();
    ctx.fill();

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#a624f2';
    ctx.beginPath();
    ctx.moveTo(128, 165);
    ctx.lineTo(150, 192);
    ctx.lineTo(128, 212);
    ctx.lineTo(106, 192);
    ctx.closePath();
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  private drawVisorExpression(state: MochiActionState): void {
    const ctx = this.visorCtx;
    const w = this.visorCanvas.width;
    const h = this.visorCanvas.height;

    ctx.fillStyle = '#152534';
    ctx.fillRect(0, 0, w, h);

    const drawPixelDot = (px: number, py: number, size = 7) => {
      ctx.fillStyle = '#19e6ff';
      ctx.beginPath();
      ctx.arc(px, py, size * 0.45, 0, Math.PI * 2);
      ctx.fill();
    };

    for (let row = 0; row < 14; row++) {
      const halfSpan = Math.floor(row * 0.65);
      for (let col = -halfSpan; col <= halfSpan; col++) {
        const isInnerHollow = row >= 6 && row <= 10 && Math.abs(col) <= row - 5;
        if (!isInnerHollow) {
          drawPixelDot(w * 0.5 + col * 9, 96 + row * 8, 6.5);
        }
      }
    }

    ctx.strokeStyle = '#19e6ff';
    ctx.fillStyle = '#19e6ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 12;

    if (state === 'hit') {
      ctx.lineWidth = 16;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(135, 250);
      ctx.lineTo(195, 285);
      ctx.lineTo(135, 320);
      ctx.moveTo(377, 250);
      ctx.lineTo(317, 285);
      ctx.lineTo(377, 320);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(256, 365, 22, 0, Math.PI * 2);
      ctx.stroke();
    } else if (state === 'celebrate') {
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.arc(165, 295, 38, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(347, 295, 38, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      this.drawPixelCatMouth(ctx, 256, 355, 1.2);
    } else {
      const eyeYOffset = state === 'jump' ? -8 : 0;
      this.drawPixelAngledEye(ctx, 165, 285 + eyeYOffset, false);
      this.drawPixelAngledEye(ctx, 347, 285 + eyeYOffset, true);
      this.drawPixelCatMouth(ctx, 256, 352, 1.0);
    }

    ctx.shadowBlur = 0;
    this.visorTexture.needsUpdate = true;
  }

  private drawPixelAngledEye(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    isRight: boolean
  ): void {
    const dir = isRight ? -1 : 1;
    for (let dy = -32; dy <= 32; dy += 8) {
      for (let dx = -44; dx <= 44; dx += 8) {
        const dist = (dx * dx) / (44 * 44) + (dy * dy) / (32 * 32);
        const topCut = dy > dx * dir * 0.42 - 6;
        if (dist <= 1.0 && topCut) {
          ctx.beginPath();
          ctx.arc(cx + dx, cy + dy, 3.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  private drawPixelCatMouth(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    scale: number
  ): void {
    ctx.lineWidth = 14 * scale;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.arc(cx - 26 * scale, cy, 24 * scale, 0.15 * Math.PI, 0.92 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 26 * scale, cy, 24 * scale, 0.08 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }

  private buildAirplaneCockpit(): void {
    const hullMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.6
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: 0xa624f2,
      emissive: 0x6b11b0,
      emissiveIntensity: 0.4
    });
    const cyanNeonMat = new THREE.MeshBasicMaterial({ color: 0x19e6ff });

    const fuselage = new THREE.Mesh(
      new THREE.ConeGeometry(0.95, 3.4, 24),
      hullMat
    );
    fuselage.rotation.x = Math.PI * 0.5;
    fuselage.scale.set(1.1, 1.0, 0.65);
    fuselage.position.set(0, 0.55, 0.2);
    this.airplaneGroup.add(fuselage);

    const mainWing = new THREE.Mesh(
      new THREE.BoxGeometry(4.4, 0.1, 1.05),
      hullMat
    );
    mainWing.position.set(0, 0.5, 0.35);
    this.airplaneGroup.add(mainWing);

    const wingStripe = new THREE.Mesh(
      new THREE.BoxGeometry(4.46, 0.12, 0.16),
      cyanNeonMat
    );
    wingStripe.position.set(0, 0.5, 0.72);
    this.airplaneGroup.add(wingStripe);

    const tailFin = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.85, 0.75),
      accentMat
    );
    tailFin.position.set(0, 1.0, -1.25);
    this.airplaneGroup.add(tailFin);

    this.propellerMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.16, 0.06),
      cyanNeonMat
    );
    this.propellerMesh.position.set(0, 0.55, 1.95);
    this.airplaneGroup.add(this.propellerMesh);
  }

  public setAirplaneVisible(visible: boolean): void {
    this.airplaneGroup.visible = visible;
    this.leftLegGroup.visible = !visible;
    this.rightLegGroup.visible = !visible;
  }

  public setState(newState: MochiActionState): void {
    if (this.currentState === newState) return;
    this.currentState = newState;
    this.drawVisorExpression(newState);
  }

  public triggerHitInvulnerability(durationSeconds: number = 1.6): void {
    this.invulnerableTimer = durationSeconds;
    this.setState('hit');
  }

  public isInvulnerable(): boolean {
    return this.invulnerableTimer > 0;
  }

  public update(dt: number): void {
    this.animTime += dt;

    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer = Math.max(0, this.invulnerableTimer - dt);
      this.characterGroup.visible = Math.floor(this.invulnerableTimer * 18) % 2 === 0;
      if (this.invulnerableTimer === 0 && this.currentState === 'hit') {
        this.characterGroup.visible = true;
        this.setState('run');
      }
    } else {
      this.characterGroup.visible = true;
    }

    if (this.airplaneGroup.visible) {
      this.propellerMesh.rotation.z += dt * 28;
    }

    this.tailCurveMesh.rotation.y = Math.sin(this.animTime * 5.5) * 0.16;

    switch (this.currentState) {
      case 'fly':
        this.headGroup.position.y = 1.55 + Math.sin(this.animTime * 4) * 0.03;
        this.headGroup.rotation.z = Math.sin(this.animTime * 2.5) * 0.06;
        this.rightArmPawGroup.rotation.x = -0.45;
        this.leftArmGroup.rotation.x = -0.45;
        break;

      case 'idle':
        this.headGroup.position.y = 1.55 + Math.sin(this.animTime * 3.2) * 0.04;
        this.leftArmGroup.rotation.x = Math.sin(this.animTime * 3.2) * 0.1;
        this.rightArmPawGroup.rotation.x = -0.2 + Math.cos(this.animTime * 3.2) * 0.08;
        this.leftLegGroup.rotation.x = 0;
        this.rightLegGroup.rotation.x = 0;
        break;

      case 'run': {
        const stride = this.animTime * 13;
        this.characterGroup.position.y = Math.abs(Math.sin(stride)) * 0.12;
        this.leftLegGroup.rotation.x = Math.sin(stride) * 0.65;
        this.rightLegGroup.rotation.x = -Math.sin(stride) * 0.65;
        this.leftArmGroup.rotation.x = -Math.sin(stride) * 0.55;
        this.rightArmPawGroup.rotation.x = Math.sin(stride) * 0.45 - 0.25;
        this.headGroup.rotation.z = Math.cos(stride) * 0.05;
        break;
      }

      case 'jump':
        this.characterGroup.position.y = 0;
        this.leftLegGroup.rotation.x = 0.45;
        this.rightLegGroup.rotation.x = -0.35;
        this.rightArmPawGroup.rotation.x = -0.95;
        this.leftArmGroup.rotation.x = -0.75;
        break;

      case 'hit':
        this.headGroup.rotation.z = Math.sin(this.animTime * 35) * 0.18;
        this.rightArmPawGroup.rotation.x = 0.4;
        break;

      case 'fall':
        this.rightArmPawGroup.rotation.x = -1.3 + Math.sin(this.animTime * 20) * 0.3;
        this.leftArmGroup.rotation.x = -1.3 - Math.sin(this.animTime * 20) * 0.3;
        break;

      case 'celebrate':
        this.characterGroup.position.y = Math.abs(Math.sin(this.animTime * 10)) * 0.25;
        this.rightArmPawGroup.rotation.x = -1.25 + Math.sin(this.animTime * 12) * 0.25;
        this.leftArmGroup.rotation.x = -1.15 - Math.sin(this.animTime * 12) * 0.25;
        this.headGroup.rotation.y = Math.sin(this.animTime * 6) * 0.22;
        break;
    }
  }
}
