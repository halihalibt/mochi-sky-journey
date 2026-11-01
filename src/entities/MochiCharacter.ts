import * as THREE from 'three';

export type MochiActionState =
  | 'fly'
  | 'idle'
  | 'run'
  | 'jump'
  | 'dash'
  | 'glide'
  | 'land'
  | 'hit'
  | 'fall'
  | 'celebrate';

export type MochiCosmeticId =
  | 'default'
  | 'auroraVisor'
  | 'starlightCape'
  | 'goldenCrown';

export interface MochiMotionContext {
  verticalVelocity?: number;
  turnRate?: number;
  moveSpeedRatio?: number;
}

const COSMETIC_STORAGE_KEY = 'mochi_equipped_cosmetic_v2';
const UNLOCKED_COSMETICS_KEY = 'mochi_unlocked_cosmetics_v2';

export class MochiCharacter {
  public readonly root: THREE.Group;
  public readonly characterGroup: THREE.Group;
  public readonly airplaneGroup: THREE.Group;

  // Core anatomical groups
  private bodyPivotGroup: THREE.Group;
  private headGroup: THREE.Group;
  private torsoGroup: THREE.Group;
  private leftEarPivot: THREE.Group;
  private rightEarPivot: THREE.Group;
  private leftArmGroup: THREE.Group;
  private rightArmPawGroup: THREE.Group;
  private leftLegGroup: THREE.Group;
  private rightLegGroup: THREE.Group;

  // Multi-segment articulated tail
  private tailBasePivot: THREE.Group;
  private tailMidPivot: THREE.Group;
  private tailTipPivot: THREE.Group;
  private tailCurveMesh: THREE.Mesh;

  // Special FX & Wing attachments
  private glideWingsGroup: THREE.Group;
  private leftWingMesh!: THREE.Mesh;
  private rightWingMesh!: THREE.Mesh;
  private dashAuraMesh!: THREE.Mesh;
  private backNodeCoreMat!: THREE.MeshBasicMaterial;
  private pawPadGlowMat!: THREE.MeshBasicMaterial;
  private visorRimMat!: THREE.MeshStandardMaterial;

  // Unlockable cosmetic groups
  private auroraCrestGroup: THREE.Group;
  private starlightCapeGroup: THREE.Group;
  private capeWaveMeshes: THREE.Mesh[] = [];
  private goldenCrownGroup: THREE.Group;

  // Aircraft components
  private propellerMesh!: THREE.Mesh;
  private thrusterRings: THREE.Mesh[] = [];
  private controlYokeGroup!: THREE.Group;

  // Dynamic curved screen visor canvas
  private visorCanvas: HTMLCanvasElement;
  private visorCtx: CanvasRenderingContext2D;
  private visorTexture: THREE.CanvasTexture;

  // Animation & state machine
  private currentState: MochiActionState = 'idle';
  private animTime = 0;
  private stateTimer = 0;
  private landRecoveryTimer = 0;
  private invulnerableTimer = 0;
  private blinkTimer = 2.4;
  private isBlinking = false;
  private glideWingSpread = 0;
  private dashAuraAlpha = 0;

  // Secondary physics follow-through state
  private smoothVerticalVel = 0;
  private smoothTurnLean = 0;

  // Cosmetics state
  private equippedCosmetic: MochiCosmeticId = 'default';
  private unlockedCosmetics = new Set<MochiCosmeticId>(['default']);

  constructor() {
    this.root = new THREE.Group();
    this.characterGroup = new THREE.Group();
    this.airplaneGroup = new THREE.Group();

    this.bodyPivotGroup = new THREE.Group();
    this.headGroup = new THREE.Group();
    this.torsoGroup = new THREE.Group();
    this.leftEarPivot = new THREE.Group();
    this.rightEarPivot = new THREE.Group();
    this.leftArmGroup = new THREE.Group();
    this.rightArmPawGroup = new THREE.Group();
    this.leftLegGroup = new THREE.Group();
    this.rightLegGroup = new THREE.Group();

    this.tailBasePivot = new THREE.Group();
    this.tailMidPivot = new THREE.Group();
    this.tailTipPivot = new THREE.Group();

    this.glideWingsGroup = new THREE.Group();
    this.auroraCrestGroup = new THREE.Group();
    this.starlightCapeGroup = new THREE.Group();
    this.goldenCrownGroup = new THREE.Group();

    this.visorCanvas = document.createElement('canvas');
    this.visorCanvas.width = 512;
    this.visorCanvas.height = 512;
    this.visorCtx = this.visorCanvas.getContext('2d')!;
    this.visorTexture = new THREE.CanvasTexture(this.visorCanvas);
    this.visorTexture.colorSpace = THREE.SRGBColorSpace;
    this.visorTexture.anisotropy = 4;

    this.tailCurveMesh = this.buildOfficialMochiBody();
    this.buildGlideWingsAndDashAura();
    this.buildCosmeticAttachments();
    this.buildOpenCanopyAirplane();

    this.characterGroup.add(this.bodyPivotGroup);
    this.root.add(this.characterGroup);
    this.root.add(this.airplaneGroup);

    this.loadSavedCosmetics();
    this.drawVisorExpression('idle', false);
    this.setAirplaneVisible(false);
  }

  private buildOfficialMochiBody(): THREE.Mesh {
    const pearlWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.26,
      metalness: 0.06
    });
    const chamferGreyMat = new THREE.MeshStandardMaterial({
      color: 0x8e929f,
      roughness: 0.35,
      metalness: 0.38
    });
    this.visorRimMat = new THREE.MeshStandardMaterial({
      color: 0x8c8f9c,
      roughness: 0.3,
      metalness: 0.45
    });
    const darkSlateGloveMat = new THREE.MeshStandardMaterial({
      color: 0x32374d,
      roughness: 0.4,
      metalness: 0.28
    });
    const genlayerPurpleMat = new THREE.MeshStandardMaterial({
      color: 0xb429f9,
      emissive: 0x4c0e78,
      emissiveIntensity: 0.42,
      roughness: 0.28,
      metalness: 0.15
    });
    const innerEarLavenderMat = new THREE.MeshStandardMaterial({
      color: 0x7c7396,
      roughness: 0.45,
      metalness: 0.2
    });
    this.pawPadGlowMat = new THREE.MeshBasicMaterial({
      color: 0x19e6ff
    });
    this.backNodeCoreMat = new THREE.MeshBasicMaterial({
      color: 0x19e6ff
    });
    const darkCarbonMat = new THREE.MeshStandardMaterial({
      color: 0x1a1d26,
      roughness: 0.5,
      metalness: 0.3
    });

    // =========================================================
    // 1. HEAD, CURVED SCREEN VISOR, EARS & SIDE HEADPHONES
    // =========================================================
    this.headGroup.position.set(0, 1.56, 0);

    // Main sculpted helmet shell (rounded astronaut-cat proportions)
    const helmetShell = new THREE.Mesh(
      new THREE.SphereGeometry(0.79, 36, 36),
      pearlWhiteMat
    );
    helmetShell.scale.set(1.08, 0.97, 0.97);
    this.headGroup.add(helmetShell);

    // Lower helmet cheek contour collar
    const helmetChinRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.52, 0.065, 14, 36),
      chamferGreyMat
    );
    helmetChinRing.rotation.x = Math.PI * 0.5;
    helmetChinRing.position.set(0, -0.62, 0.02);
    this.headGroup.add(helmetChinRing);

    // Recessed metallic grey visor bezel frame
    const visorRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.645, 0.085, 18, 48),
      this.visorRimMat
    );
    visorRim.position.set(0, -0.02, 0.37);
    visorRim.scale.set(1.09, 0.91, 0.62);
    this.headGroup.add(visorRim);

    // Curved digital screen visor face
    const visorGeo = new THREE.SphereGeometry(
      0.755,
      36,
      36,
      -Math.PI * 0.36,
      Math.PI * 0.72,
      Math.PI * 0.21,
      Math.PI * 0.58
    );
    const visorMat = new THREE.MeshBasicMaterial({
      map: this.visorTexture
    });
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.rotation.y = -Math.PI * 0.5;
    visorMesh.position.set(0, -0.01, 0.055);
    this.headGroup.add(visorMesh);

    // Glossy protective glass sheen over visor
    const visorGlassGeo = new THREE.SphereGeometry(
      0.764,
      28,
      28,
      -Math.PI * 0.34,
      Math.PI * 0.68,
      Math.PI * 0.23,
      Math.PI * 0.54
    );
    const visorGlassMat = new THREE.MeshStandardMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.09,
      roughness: 0.08,
      metalness: 0.2
    });
    const visorGlass = new THREE.Mesh(visorGlassGeo, visorGlassMat);
    visorGlass.rotation.y = -Math.PI * 0.5;
    visorGlass.position.set(0, -0.01, 0.058);
    this.headGroup.add(visorGlass);

    // Sculpted Cat Ears on dynamic pivots + Side Headphones
    const outerEarGeo = new THREE.ConeGeometry(0.29, 0.6, 16);
    outerEarGeo.scale(1.05, 1.0, 0.72);
    const innerEarGeo = new THREE.ConeGeometry(0.17, 0.42, 12);
    innerEarGeo.scale(1.0, 1.0, 0.55);

    [-1, 1].forEach((side) => {
      const earPivot = side < 0 ? this.leftEarPivot : this.rightEarPivot;
      earPivot.position.set(side * 0.5, 0.6, 0.03);
      earPivot.rotation.z = -side * 0.31;
      earPivot.rotation.y = side * 0.18;

      const outerEar = new THREE.Mesh(outerEarGeo, genlayerPurpleMat);
      outerEar.position.set(0, 0.18, 0);
      earPivot.add(outerEar);

      const earTipCap = new THREE.Mesh(
        new THREE.SphereGeometry(0.065, 12, 12),
        genlayerPurpleMat
      );
      earTipCap.position.set(0, 0.45, 0);
      earPivot.add(earTipCap);

      const innerEar = new THREE.Mesh(innerEarGeo, innerEarLavenderMat);
      innerEar.position.set(0, 0.15, 0.075);
      earPivot.add(innerEar);

      const earGlowStrip = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.28, 0.02),
        this.pawPadGlowMat
      );
      earGlowStrip.position.set(-side * 0.05, 0.16, 0.11);
      earPivot.add(earGlowStrip);

      this.headGroup.add(earPivot);

      // Multi-layered side headphone pods
      const hpGroup = new THREE.Group();
      hpGroup.position.set(side * 0.8, 0.01, 0.02);

      const hpCushion = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.28, 0.1, 24),
        darkSlateGloveMat
      );
      hpCushion.rotation.z = Math.PI * 0.5;
      hpGroup.add(hpCushion);

      const hpOuterHousing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.23, 0.15, 24),
        chamferGreyMat
      );
      hpOuterHousing.rotation.z = Math.PI * 0.5;
      hpOuterHousing.position.x = side * 0.03;
      hpGroup.add(hpOuterHousing);

      const hpPurpleCore = new THREE.Mesh(
        new THREE.CylinderGeometry(0.165, 0.165, 0.17, 24),
        genlayerPurpleMat
      );
      hpPurpleCore.rotation.z = Math.PI * 0.5;
      hpPurpleCore.position.x = side * 0.035;
      hpGroup.add(hpPurpleCore);

      const hpNeonRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.18, 0.018, 10, 28),
        this.pawPadGlowMat
      );
      hpNeonRing.rotation.y = Math.PI * 0.5;
      hpNeonRing.position.x = side * 0.115;
      hpGroup.add(hpNeonRing);

      this.headGroup.add(hpGroup);
    });

    this.bodyPivotGroup.add(this.headGroup);

    // =========================================================
    // 2. TORSO, CHEST GENLAYER EMBLEM & BACK REACTOR ARMOR
    // =========================================================
    this.torsoGroup.position.set(0, 0.68, 0);

    const upperTorso = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.365, 0.33, 18, 28),
      pearlWhiteMat
    );
    upperTorso.scale.set(1.04, 1.0, 0.94);
    this.torsoGroup.add(upperTorso);

    // Subtle lower hip suit belt
    const beltRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.35, 0.035, 12, 32),
      chamferGreyMat
    );
    beltRing.rotation.x = Math.PI * 0.5;
    beltRing.position.set(0, -0.16, 0);
    beltRing.scale.set(1.04, 0.94, 1.0);
    this.torsoGroup.add(beltRing);

    // Front GenLayer purple chest emblem
    const chestLogoTex = this.createChestLogoTexture();
    const chestPatch = new THREE.Mesh(
      new THREE.PlaneGeometry(0.4, 0.4),
      new THREE.MeshBasicMaterial({ map: chestLogoTex, transparent: true })
    );
    chestPatch.position.set(0, 0.05, 0.358);
    this.torsoGroup.add(chestPatch);

    // Rear contoured grey backpack armor
    const backArmor = new THREE.Mesh(
      new THREE.SphereGeometry(
        0.385,
        24,
        18,
        0,
        Math.PI * 2,
        0,
        Math.PI * 0.56
      ),
      chamferGreyMat
    );
    backArmor.position.set(0, 0.11, -0.03);
    this.torsoGroup.add(backArmor);

    const backNodeHousing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.14, 0.06, 24),
      darkCarbonMat
    );
    backNodeHousing.rotation.x = Math.PI * 0.5;
    backNodeHousing.position.set(0, 0.12, -0.36);
    this.torsoGroup.add(backNodeHousing);

    const backNodeCore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.07, 24),
      this.backNodeCoreMat
    );
    backNodeCore.rotation.x = Math.PI * 0.5;
    backNodeCore.position.set(0, 0.12, -0.366);
    this.torsoGroup.add(backNodeCore);

    const backNodeHalo = new THREE.Mesh(
      new THREE.TorusGeometry(0.11, 0.015, 10, 24),
      this.pawPadGlowMat
    );
    backNodeHalo.position.set(0, 0.12, -0.395);
    this.torsoGroup.add(backNodeHalo);

    this.bodyPivotGroup.add(this.torsoGroup);

    // =========================================================
    // 3. LEFT ARM & SIGNATURE ASYMMETRIC RIGHT MEGA-PAW
    // =========================================================
    this.leftArmGroup.position.set(-0.43, 0.86, 0);

    const leftShoulderRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.11, 0.025, 10, 20),
      chamferGreyMat
    );
    leftShoulderRing.rotation.y = Math.PI * 0.5;
    this.leftArmGroup.add(leftShoulderRing);

    const leftUpperArm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.11, 0.22, 10, 18),
      chamferGreyMat
    );
    leftUpperArm.position.set(-0.06, -0.14, 0);
    leftUpperArm.rotation.z = 0.18;
    this.leftArmGroup.add(leftUpperArm);

    const leftGlovePaw = new THREE.Mesh(
      new THREE.SphereGeometry(0.155, 18, 18),
      darkSlateGloveMat
    );
    leftGlovePaw.scale.set(0.95, 1.08, 0.95);
    leftGlovePaw.position.set(-0.1, -0.32, 0.03);
    this.leftArmGroup.add(leftGlovePaw);

    const leftWristLight = new THREE.Mesh(
      new THREE.CylinderGeometry(0.052, 0.052, 0.03, 16),
      this.pawPadGlowMat
    );
    leftWristLight.rotation.z = Math.PI * 0.5;
    leftWristLight.position.set(-0.23, -0.28, 0.05);
    this.leftArmGroup.add(leftWristLight);

    this.bodyPivotGroup.add(this.leftArmGroup);

    // Right Asymmetric Mega-Paw Gauntlet
    this.rightArmPawGroup.position.set(0.44, 0.86, 0);

    const rightShoulderRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.12, 0.028, 10, 20),
      chamferGreyMat
    );
    rightShoulderRing.rotation.y = Math.PI * 0.5;
    this.rightArmPawGroup.add(rightShoulderRing);

    const rightUpperArm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.125, 0.2, 10, 18),
      chamferGreyMat
    );
    rightUpperArm.position.set(0.08, -0.11, 0);
    rightUpperArm.rotation.z = -0.22;
    this.rightArmPawGroup.add(rightUpperArm);

    // Sculpted oversized cat-paw gauntlet housing
    const megaPawHousing = new THREE.Group();
    megaPawHousing.position.set(0.23, -0.23, 0.14);
    megaPawHousing.rotation.z = -0.22;

    const megaPawDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.33, 0.29, 0.23, 28),
      darkSlateGloveMat
    );
    megaPawDisc.rotation.x = Math.PI * 0.5;
    megaPawDisc.scale.set(1.06, 1.0, 0.96);
    megaPawHousing.add(megaPawDisc);

    const megaPawCuff = new THREE.Mesh(
      new THREE.TorusGeometry(0.26, 0.04, 12, 24),
      chamferGreyMat
    );
    megaPawCuff.position.set(-0.04, 0.08, -0.08);
    megaPawHousing.add(megaPawCuff);

    // 4 sculpted rounded finger knuckles on top edge of mega-paw
    const knuckleAngles = [-0.55, -0.18, 0.18, 0.55];
    knuckleAngles.forEach((ang) => {
      const knuckle = new THREE.Mesh(
        new THREE.SphereGeometry(0.095, 14, 14),
        darkSlateGloveMat
      );
      knuckle.scale.set(1.0, 0.85, 1.15);
      knuckle.position.set(
        Math.sin(ang) * 0.25 + 0.04,
        Math.cos(ang) * 0.24 - 0.02,
        0.02
      );
      megaPawHousing.add(knuckle);
    });

    // Glowing cyan central palm pad + 4 toe bean pads
    const mainPalmPad = new THREE.Mesh(
      new THREE.CylinderGeometry(0.095, 0.095, 0.04, 20),
      this.pawPadGlowMat
    );
    mainPalmPad.rotation.x = Math.PI * 0.5;
    mainPalmPad.scale.set(1.18, 1.0, 0.92);
    mainPalmPad.position.set(-0.02, -0.05, 0.11);
    megaPawHousing.add(mainPalmPad);

    const toeBeanCoords = [
      [-0.14, 0.11],
      [-0.04, 0.16],
      [0.07, 0.14],
      [0.15, 0.05]
    ];
    toeBeanCoords.forEach(([bx, by]) => {
      const bean = new THREE.Mesh(
        new THREE.CylinderGeometry(0.048, 0.048, 0.04, 16),
        this.pawPadGlowMat
      );
      bean.rotation.x = Math.PI * 0.5;
      bean.scale.set(0.9, 1.0, 1.18);
      bean.position.set(bx, by, 0.112);
      megaPawHousing.add(bean);
    });

    this.rightArmPawGroup.add(megaPawHousing);
    this.bodyPivotGroup.add(this.rightArmPawGroup);

    // =========================================================
    // 4. ARTICULATED LEGS & PAW BOOTS
    // =========================================================
    const buildLeg = (side: number): THREE.Group => {
      const legGroup = new THREE.Group();
      legGroup.position.set(side * 0.19, 0.36, 0);

      const thighMesh = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.13, 0.19, 10, 18),
        pearlWhiteMat
      );
      thighMesh.position.set(0, -0.14, 0);
      legGroup.add(thighMesh);

      const ankleCuff = new THREE.Mesh(
        new THREE.TorusGeometry(0.125, 0.024, 10, 20),
        chamferGreyMat
      );
      ankleCuff.rotation.x = Math.PI * 0.5;
      ankleCuff.position.set(0, -0.25, 0);
      legGroup.add(ankleCuff);

      const bootFoot = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 16, 14),
        pearlWhiteMat
      );
      bootFoot.scale.set(0.96, 0.65, 1.25);
      bootFoot.position.set(0, -0.31, 0.04);
      legGroup.add(bootFoot);

      const bootSoleGlow = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.02, 14),
        this.pawPadGlowMat
      );
      bootSoleGlow.position.set(0, -0.35, 0.04);
      legGroup.add(bootSoleGlow);

      return legGroup;
    };

    this.leftLegGroup = buildLeg(-1);
    this.rightLegGroup = buildLeg(1);
    this.bodyPivotGroup.add(this.leftLegGroup);
    this.bodyPivotGroup.add(this.rightLegGroup);

    // =========================================================
    // 5. MULTI-SEGMENT ARTICULATED CAT TAIL
    // =========================================================
    this.tailBasePivot.position.set(0, 0.44, -0.32);

    const tailCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-0.14, -0.06, -0.24),
      new THREE.Vector3(-0.28, 0.08, -0.42),
      new THREE.Vector3(-0.24, 0.3, -0.46)
    ]);
    const tailGeo = new THREE.TubeGeometry(tailCurve, 24, 0.05, 12, false);
    const tailMat = new THREE.MeshStandardMaterial({
      color: 0x1c1924,
      roughness: 0.6
    });
    const tailMesh = new THREE.Mesh(tailGeo, tailMat);
    this.tailBasePivot.add(tailMesh);

    // Articulated secondary tail tip with glowing cyan/purple ring
    this.tailMidPivot.position.set(-0.28, 0.08, -0.42);
    this.tailBasePivot.add(this.tailMidPivot);

    this.tailTipPivot.position.set(0.04, 0.22, -0.04);
    const tailTipBulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.062, 14, 14),
      genlayerPurpleMat
    );
    this.tailTipPivot.add(tailTipBulb);
    this.tailMidPivot.add(this.tailTipPivot);

    this.bodyPivotGroup.add(this.tailBasePivot);

    return tailMesh;
  }

  private buildGlideWingsAndDashAura(): void {
    this.glideWingsGroup.position.set(0, 0.78, -0.38);

    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.quadraticCurveTo(0.65, 0.45, 1.45, 0.28);
    wingShape.quadraticCurveTo(1.15, -0.1, 0.85, -0.24);
    wingShape.quadraticCurveTo(0.45, -0.18, 0, -0.08);
    wingShape.closePath();

    const wingGeo = new THREE.ShapeGeometry(wingShape);
    const wingMat = new THREE.MeshBasicMaterial({
      color: 0x19e6ff,
      transparent: true,
      opacity: 0.72,
      side: THREE.DoubleSide
    });

    this.rightWingMesh = new THREE.Mesh(wingGeo, wingMat);
    this.rightWingMesh.position.set(0.1, 0, 0);

    this.leftWingMesh = new THREE.Mesh(wingGeo, wingMat);
    this.leftWingMesh.scale.x = -1;
    this.leftWingMesh.position.set(-0.1, 0, 0);

    this.glideWingsGroup.add(this.leftWingMesh, this.rightWingMesh);
    this.glideWingsGroup.visible = false;
    this.bodyPivotGroup.add(this.glideWingsGroup);

    // Dash speed cone aura
    const auraGeo = new THREE.ConeGeometry(0.95, 2.2, 24, 1, true);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0x19e6ff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      wireframe: false
    });
    this.dashAuraMesh = new THREE.Mesh(auraGeo, auraMat);
    this.dashAuraMesh.rotation.x = Math.PI * 0.5;
    this.dashAuraMesh.position.set(0, 0.95, 0.15);
    this.dashAuraMesh.visible = false;
    this.bodyPivotGroup.add(this.dashAuraMesh);
  }

  private buildCosmeticAttachments(): void {
    // 1. Aurora Starlight Visor Crest
    this.auroraCrestGroup.position.set(0, 0.54, 0.62);
    const crestMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const crestCenter = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.14, 0),
      crestMat
    );
    crestCenter.scale.set(1.3, 0.8, 0.45);
    this.auroraCrestGroup.add(crestCenter);

    [-1, 1].forEach((side) => {
      const winglet = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.045, 0.04),
        new THREE.MeshBasicMaterial({ color: 0xe879f9 })
      );
      winglet.position.set(side * 0.2, -0.04, -0.04);
      winglet.rotation.z = side * 0.35;
      this.auroraCrestGroup.add(winglet);
    });
    this.auroraCrestGroup.visible = false;
    this.headGroup.add(this.auroraCrestGroup);

    // 2. Celestial Starlight Glider Cape
    this.starlightCapeGroup.position.set(0, 0.24, -0.36);
    const capeColors = [0x9333ea, 0x3b82f6, 0x19e6ff];
    for (let i = 0; i < 3; i++) {
      const strip = new THREE.Mesh(
        new THREE.PlaneGeometry(0.68 - i * 0.1, 0.85),
        new THREE.MeshBasicMaterial({
          color: capeColors[i],
          transparent: true,
          opacity: 0.58 - i * 0.1,
          side: THREE.DoubleSide
        })
      );
      strip.position.set(0, -0.38, -0.02 * i);
      strip.rotation.x = 0.22;
      this.starlightCapeGroup.add(strip);
      this.capeWaveMeshes.push(strip);
    }
    this.starlightCapeGroup.visible = false;
    this.torsoGroup.add(this.starlightCapeGroup);

    // 3. Golden Summit Sovereign Crown
    this.goldenCrownGroup.position.set(0, 0.92, 0.04);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xb45309,
      emissiveIntensity: 0.45,
      roughness: 0.2,
      metalness: 0.8
    });
    const crownBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.22, 0.14, 16, 1, true),
      goldMat
    );
    this.goldenCrownGroup.add(crownBase);

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const spike = new THREE.Mesh(
        new THREE.ConeGeometry(0.055, 0.16, 6),
        goldMat
      );
      spike.position.set(
        Math.cos(angle) * 0.25,
        0.13,
        Math.sin(angle) * 0.25
      );
      this.goldenCrownGroup.add(spike);
    }

    const crownGem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.09, 0),
      new THREE.MeshBasicMaterial({ color: 0x19e6ff })
    );
    crownGem.position.set(0, 0.2, 0);
    this.goldenCrownGroup.add(crownGem);
    this.goldenCrownGroup.visible = false;
    this.headGroup.add(this.goldenCrownGroup);
  }

  /**
   * Builds a sleek open-cockpit sky-cruiser where Mochi sits elevated with a
   * low-profile contoured fuselage and crystal-clear front windshield so Mochi
   * is 100% clearly visible from all angles during the 90s flight & transition.
   */
  private buildOpenCanopyAirplane(): void {
    const hullMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.28,
      metalness: 0.65
    });
    const whiteTrimMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.3,
      metalness: 0.2
    });
    const purpleAccentMat = new THREE.MeshStandardMaterial({
      color: 0xa624f2,
      emissive: 0x581c87,
      emissiveIntensity: 0.45,
      roughness: 0.3
    });
    const cyanNeonMat = new THREE.MeshBasicMaterial({ color: 0x19e6ff });
    const canopyGlassMat = new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.18,
      roughness: 0.08,
      metalness: 0.1
    });

    // Low-slung main fuselage tub (sits below Mochi's waist so Mochi is never obscured)
    const lowerHull = new THREE.Mesh(
      new THREE.BoxGeometry(1.35, 0.42, 2.7),
      hullMat
    );
    lowerHull.position.set(0, 0.24, 0.1);
    this.airplaneGroup.add(lowerHull);

    // Sleek tapered front nose cone ahead of cockpit
    const noseCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.68, 1.35, 24),
      whiteTrimMat
    );
    noseCone.rotation.x = Math.PI * 0.5;
    noseCone.scale.set(1.0, 1.0, 0.62);
    noseCone.position.set(0, 0.26, 2.05);
    this.airplaneGroup.add(noseCone);

    // Open cockpit coaming rim around Mochi's seat
    const cockpitRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.72, 0.06, 12, 32),
      purpleAccentMat
    );
    cockpitRim.rotation.x = Math.PI * 0.5;
    cockpitRim.scale.set(0.95, 1.25, 1.0);
    cockpitRim.position.set(0, 0.48, 0.12);
    this.airplaneGroup.add(cockpitRim);

    // Elevated pilot seat backrest behind Mochi
    const seatBack = new THREE.Mesh(
      new THREE.BoxGeometry(0.76, 0.68, 0.12),
      hullMat
    );
    seatBack.position.set(0, 0.72, -0.58);
    seatBack.rotation.x = -0.15;
    this.airplaneGroup.add(seatBack);

    // Crystal-clear angled front windshield (low enough that Mochi's face & ears shine through)
    const windshieldGeo = new THREE.CylinderGeometry(
      0.58,
      0.68,
      0.62,
      24,
      1,
      true,
      -Math.PI * 0.42,
      Math.PI * 0.84
    );
    const windshield = new THREE.Mesh(windshieldGeo, canopyGlassMat);
    windshield.rotation.x = -0.38;
    windshield.position.set(0, 0.72, 0.48);
    this.airplaneGroup.add(windshield);

    // Illuminated holographic dashboard & control yoke in front of Mochi's hands
    this.controlYokeGroup = new THREE.Group();
    this.controlYokeGroup.position.set(0, 0.68, 0.56);

    const holoHudScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.62, 0.24),
      new THREE.MeshBasicMaterial({
        color: 0x19e6ff,
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide
      })
    );
    holoHudScreen.rotation.x = -0.35;
    this.controlYokeGroup.add(holoHudScreen);

    const yokeBar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.52, 12),
      cyanNeonMat
    );
    yokeBar.rotation.z = Math.PI * 0.5;
    yokeBar.position.set(0, -0.05, -0.12);
    this.controlYokeGroup.add(yokeBar);
    this.airplaneGroup.add(this.controlYokeGroup);

    // Swept forward-edge fantasy wings with neon strips & wingtip pods
    const mainWing = new THREE.Mesh(
      new THREE.BoxGeometry(4.6, 0.09, 1.08),
      whiteTrimMat
    );
    mainWing.position.set(0, 0.3, 0.25);
    this.airplaneGroup.add(mainWing);

    const wingNeonLeading = new THREE.Mesh(
      new THREE.BoxGeometry(4.64, 0.11, 0.14),
      cyanNeonMat
    );
    wingNeonLeading.position.set(0, 0.3, 0.76);
    this.airplaneGroup.add(wingNeonLeading);

    [-1, 1].forEach((side) => {
      const wingtipPod = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.11, 0.9, 8, 16),
        purpleAccentMat
      );
      wingtipPod.rotation.x = Math.PI * 0.5;
      wingtipPod.position.set(side * 2.32, 0.32, 0.25);
      this.airplaneGroup.add(wingtipPod);

      // Twin rear engine nacelles (placed wide so rear camera has a clear view of Mochi)
      const engineNacelle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.26, 0.95, 18),
        hullMat
      );
      engineNacelle.rotation.x = Math.PI * 0.5;
      engineNacelle.position.set(side * 0.58, 0.3, -1.15);
      this.airplaneGroup.add(engineNacelle);

      const thrusterRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.2, 0.035, 10, 24),
        cyanNeonMat
      );
      thrusterRing.position.set(side * 0.58, 0.3, -1.64);
      this.airplaneGroup.add(thrusterRing);
      this.thrusterRings.push(thrusterRing);

      // Twin angled V-tail fins (angled outward so center camera view is clear)
      const vTailFin = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.72, 0.68),
        purpleAccentMat
      );
      vTailFin.position.set(side * 0.52, 0.68, -1.22);
      vTailFin.rotation.z = -side * 0.38;
      this.airplaneGroup.add(vTailFin);
    });

    // High-speed nose energy propeller
    this.propellerMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.55, 0.15, 0.05),
      cyanNeonMat
    );
    this.propellerMesh.position.set(0, 0.26, 2.75);
    this.airplaneGroup.add(this.propellerMesh);
  }

  private createChestLogoTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, 256, 256);

    ctx.fillStyle = '#a824f5';
    ctx.beginPath();
    ctx.moveTo(128, 24);
    ctx.lineTo(218, 212);
    ctx.lineTo(168, 224);
    ctx.lineTo(128, 136);
    ctx.lineTo(88, 224);
    ctx.lineTo(38, 212);
    ctx.closePath();
    ctx.fill();

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.moveTo(128, 88);
    ctx.lineTo(157, 155);
    ctx.lineTo(99, 155);
    ctx.closePath();
    ctx.fill();

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#a824f5';
    ctx.beginPath();
    ctx.moveTo(128, 164);
    ctx.lineTo(151, 192);
    ctx.lineTo(128, 214);
    ctx.lineTo(105, 192);
    ctx.closePath();
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  private drawVisorExpression(
    state: MochiActionState,
    blinking: boolean = false
  ): void {
    const ctx = this.visorCtx;
    const w = this.visorCanvas.width;
    const h = this.visorCanvas.height;

    // Deep digital screen background
    const bgGrad = ctx.createRadialGradient(
      w * 0.5,
      h * 0.5,
      40,
      w * 0.5,
      h * 0.5,
      280
    );
    bgGrad.addColorStop(0, '#172a3a');
    bgGrad.addColorStop(1, '#0e1b26');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle LED scanline grid
    ctx.fillStyle = 'rgba(25, 230, 255, 0.03)';
    for (let y = 0; y < h; y += 6) {
      ctx.fillRect(0, y, w, 2);
    }

    const drawPixelDot = (
      px: number,
      py: number,
      size = 7,
      color = '#19e6ff'
    ) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(px, py, size * 0.45, 0, Math.PI * 2);
      ctx.fill();
    };

    // Forehead GenLayer pixel-matrix crest
    const foreheadColor =
      this.equippedCosmetic === 'auroraVisor' ? '#67e8f9' : '#19e6ff';
    for (let row = 0; row < 14; row++) {
      const halfSpan = Math.floor(row * 0.65);
      for (let col = -halfSpan; col <= halfSpan; col++) {
        const isInnerHollow =
          row >= 6 && row <= 10 && Math.abs(col) <= row - 5;
        if (!isInnerHollow) {
          drawPixelDot(w * 0.5 + col * 9, 92 + row * 8, 6.5, foreheadColor);
        }
      }
    }

    ctx.strokeStyle = '#19e6ff';
    ctx.fillStyle = '#19e6ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 12;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (state === 'hit') {
      // Dizzy > < eyes + shocked mouth
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.moveTo(132, 248);
      ctx.lineTo(196, 285);
      ctx.lineTo(132, 322);
      ctx.moveTo(380, 248);
      ctx.lineTo(316, 285);
      ctx.lineTo(380, 322);
      ctx.stroke();

      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.arc(256, 366, 22, 0, Math.PI * 2);
      ctx.stroke();
    } else if (state === 'fall') {
      // Wide startled ring eyes + wavy panic mouth
      ctx.lineWidth = 13;
      ctx.beginPath();
      ctx.arc(165, 285, 32, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(347, 285, 32, 0, Math.PI * 2);
      ctx.stroke();

      // Sweat pixel drops
      drawPixelDot(410, 235, 11, '#38bdf8');
      drawPixelDot(410, 252, 14, '#38bdf8');

      ctx.beginPath();
      ctx.ellipse(256, 366, 28, 18, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (state === 'celebrate') {
      // Joyful happy-arc eyes (^ ^) + blush pixels + big cat smile
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.arc(165, 296, 38, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(347, 296, 38, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();

      // Rosy pixel blush cheeks
      const blushCoords = [
        [112, 332],
        [124, 336],
        [388, 336],
        [400, 332]
      ];
      blushCoords.forEach(([bx, by]) => drawPixelDot(bx, by, 9, '#f472b6'));

      this.drawPixelCatMouth(ctx, 256, 352, 1.22);
    } else if (state === 'dash') {
      // Intense speed-focused chevron eyes + energetic mouth
      this.drawPixelAngledEye(ctx, 165, 282, false, 1.25);
      this.drawPixelAngledEye(ctx, 347, 282, true, 1.25);
      this.drawPixelCatMouth(ctx, 256, 352, 1.08);
    } else if (state === 'glide') {
      // Calm wind-soaring eyes + gentle breeze lines + happy mouth
      this.drawPixelAngledEye(ctx, 165, 280, false, 0.75);
      this.drawPixelAngledEye(ctx, 347, 280, true, 0.75);
      this.drawPixelCatMouth(ctx, 256, 350, 1.1);
    } else if (state === 'land') {
      // Brief cushioned impact squint
      ctx.lineWidth = 15;
      ctx.beginPath();
      ctx.moveTo(130, 292);
      ctx.lineTo(200, 292);
      ctx.moveTo(312, 292);
      ctx.lineTo(382, 292);
      ctx.stroke();
      this.drawPixelCatMouth(ctx, 256, 356, 0.95);
    } else if (blinking) {
      // Natural blink line
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(128, 288);
      ctx.lineTo(202, 288);
      ctx.moveTo(310, 288);
      ctx.lineTo(384, 288);
      ctx.stroke();
      this.drawPixelCatMouth(ctx, 256, 352, 1.0);
    } else {
      const eyeYOffset = state === 'jump' ? -10 : state === 'fly' ? -4 : 0;
      const slantBoost = state === 'run' || state === 'fly' ? 1.08 : 0.92;
      this.drawPixelAngledEye(ctx, 165, 285 + eyeYOffset, false, slantBoost);
      this.drawPixelAngledEye(ctx, 347, 285 + eyeYOffset, true, slantBoost);
      this.drawPixelCatMouth(ctx, 256, 352, state === 'jump' ? 1.12 : 1.0);
    }

    ctx.shadowBlur = 0;
    this.visorTexture.needsUpdate = true;
  }

  private drawPixelAngledEye(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    isRight: boolean,
    slantMultiplier: number = 1.0
  ): void {
    const dir = isRight ? -1 : 1;
    for (let dy = -32; dy <= 32; dy += 8) {
      for (let dx = -44; dx <= 44; dx += 8) {
        const dist = (dx * dx) / (44 * 44) + (dy * dy) / (32 * 32);
        const topCut = dy > dx * dir * 0.42 * slantMultiplier - 8;
        if (dist <= 1.0 && topCut) {
          ctx.beginPath();
          ctx.arc(cx + dx, cy + dy, 3.4, 0, Math.PI * 2);
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
    ctx.arc(
      cx - 26 * scale,
      cy,
      24 * scale,
      0.15 * Math.PI,
      0.92 * Math.PI
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(
      cx + 26 * scale,
      cy,
      24 * scale,
      0.08 * Math.PI,
      0.85 * Math.PI
    );
    ctx.stroke();
  }

  // =========================================================
  // COSMETICS API
  // =========================================================
  private loadSavedCosmetics(): void {
    try {
      const rawUnlocked = localStorage.getItem(UNLOCKED_COSMETICS_KEY);
      if (rawUnlocked) {
        const arr = JSON.parse(rawUnlocked) as MochiCosmeticId[];
        arr.forEach((id) => this.unlockedCosmetics.add(id));
      }
      const savedEquip = localStorage.getItem(
        COSMETIC_STORAGE_KEY
      ) as MochiCosmeticId | null;
      if (savedEquip && this.unlockedCosmetics.has(savedEquip)) {
        this.setCosmetic(savedEquip);
      }
    } catch {
      // Ignore storage errors
    }
  }

  public unlockCosmetic(id: MochiCosmeticId): boolean {
    if (this.unlockedCosmetics.has(id)) return false;
    this.unlockedCosmetics.add(id);
    try {
      localStorage.setItem(
        UNLOCKED_COSMETICS_KEY,
        JSON.stringify(Array.from(this.unlockedCosmetics))
      );
    } catch {
      // Ignore storage errors
    }
    return true;
  }

  public isCosmeticUnlocked(id: MochiCosmeticId): boolean {
    return this.unlockedCosmetics.has(id);
  }

  public getUnlockedCosmetics(): MochiCosmeticId[] {
    return Array.from(this.unlockedCosmetics);
  }

  public getEquippedCosmetic(): MochiCosmeticId {
    return this.equippedCosmetic;
  }

  public setCosmetic(id: MochiCosmeticId): void {
    this.equippedCosmetic = id;
    try {
      localStorage.setItem(COSMETIC_STORAGE_KEY, id);
    } catch {
      // Ignore
    }

    this.auroraCrestGroup.visible = id === 'auroraVisor';
    this.starlightCapeGroup.visible = id === 'starlightCape';
    this.goldenCrownGroup.visible = id === 'goldenCrown';

    if (id === 'auroraVisor') {
      this.visorRimMat.color.setHex(0x38bdf8);
      this.visorRimMat.emissive.setHex(0x0284c7);
      this.visorRimMat.emissiveIntensity = 0.4;
    } else {
      this.visorRimMat.color.setHex(0x8c8f9c);
      this.visorRimMat.emissive.setHex(0x000000);
      this.visorRimMat.emissiveIntensity = 0;
    }

    this.drawVisorExpression(this.currentState, this.isBlinking);
  }

  // =========================================================
  // STATE & ANIMATION CONTROL
  // =========================================================
  public setAirplaneVisible(visible: boolean): void {
    this.airplaneGroup.visible = visible;
    this.leftLegGroup.visible = !visible;
    this.rightLegGroup.visible = !visible;
    // Elevate Mochi inside the open cockpit so Mochi's head, torso & hands are clearly visible
    this.bodyPivotGroup.position.y = visible ? 0.14 : 0;
  }

  public getState(): MochiActionState {
    return this.currentState;
  }

  public setState(newState: MochiActionState): void {
    if (this.currentState === newState) return;
    if (newState === 'land') {
      this.landRecoveryTimer = 0.18;
    }
    this.currentState = newState;
    this.stateTimer = 0;
    this.isBlinking = false;
    this.drawVisorExpression(newState, false);
  }

  public triggerLandingImpact(): void {
    this.landRecoveryTimer = 0.18;
    this.setState('land');
  }

  public triggerHitInvulnerability(durationSeconds: number = 1.6): void {
    this.invulnerableTimer = durationSeconds;
    this.setState('hit');
  }

  public isInvulnerable(): boolean {
    return this.invulnerableTimer > 0;
  }

  public update(dt: number, motion?: MochiMotionContext): void {
    this.animTime += dt;
    this.stateTimer += dt;

    // Smooth secondary physics variables
    const targetVertVel = motion?.verticalVelocity ?? 0;
    const targetTurn = motion?.turnRate ?? 0;
    this.smoothVerticalVel = THREE.MathUtils.lerp(
      this.smoothVerticalVel,
      targetVertVel,
      dt * 10
    );
    this.smoothTurnLean = THREE.MathUtils.lerp(
      this.smoothTurnLean,
      THREE.MathUtils.clamp(targetTurn, -1, 1),
      dt * 8
    );

    // Handle landing squash recovery transition
    if (this.landRecoveryTimer > 0) {
      this.landRecoveryTimer = Math.max(0, this.landRecoveryTimer - dt);
      if (this.landRecoveryTimer === 0 && this.currentState === 'land') {
        this.setState('idle');
      }
    }

    // Handle hit invulnerability flashing
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer = Math.max(0, this.invulnerableTimer - dt);
      this.characterGroup.visible =
        Math.floor(this.invulnerableTimer * 18) % 2 === 0;
      if (this.invulnerableTimer === 0 && this.currentState === 'hit') {
        this.characterGroup.visible = true;
        this.setState('run');
      }
    } else {
      this.characterGroup.visible = true;
    }

    // Periodic natural eye blinking
    if (
      this.currentState === 'idle' ||
      this.currentState === 'run' ||
      this.currentState === 'fly'
    ) {
      this.blinkTimer -= dt;
      if (this.blinkTimer <= 0) {
        if (!this.isBlinking) {
          this.isBlinking = true;
          this.blinkTimer = 0.13;
          this.drawVisorExpression(this.currentState, true);
        } else {
          this.isBlinking = false;
          this.blinkTimer = 2.4 + Math.random() * 2.2;
          this.drawVisorExpression(this.currentState, false);
        }
      }
    }

    // Aircraft propeller & thruster animation
    if (this.airplaneGroup.visible) {
      this.propellerMesh.rotation.z += dt * 32;
      const pulse = 0.92 + Math.sin(this.animTime * 24) * 0.14;
      this.thrusterRings.forEach((ring) => {
        ring.scale.set(pulse, pulse, 1);
      });
      this.controlYokeGroup.rotation.z = -this.smoothTurnLean * 0.25;
    }

    // Glide energy wings unfurl
    const wantWings =
      this.currentState === 'glide' || this.currentState === 'dash';
    this.glideWingSpread = THREE.MathUtils.lerp(
      this.glideWingSpread,
      wantWings ? 1.0 : 0.0,
      dt * 12
    );
    if (this.glideWingSpread > 0.02) {
      this.glideWingsGroup.visible = true;
      const flap =
        this.currentState === 'glide'
          ? Math.sin(this.animTime * 16) * 0.12
          : -0.25;
      this.leftWingMesh.scale.set(-this.glideWingSpread, this.glideWingSpread, 1);
      this.rightWingMesh.scale.set(this.glideWingSpread, this.glideWingSpread, 1);
      this.leftWingMesh.rotation.y = -flap;
      this.rightWingMesh.rotation.y = flap;
    } else {
      this.glideWingsGroup.visible = false;
    }

    // Dash speed aura
    this.dashAuraAlpha = THREE.MathUtils.lerp(
      this.dashAuraAlpha,
      this.currentState === 'dash' ? 0.48 : 0.0,
      dt * 14
    );
    if (this.dashAuraAlpha > 0.02) {
      this.dashAuraMesh.visible = true;
      (this.dashAuraMesh.material as THREE.MeshBasicMaterial).opacity =
        this.dashAuraAlpha;
      this.dashAuraMesh.rotation.y += dt * 15;
    } else {
      this.dashAuraMesh.visible = false;
    }

    // Glow intensity on back node & paw pads
    const glowActive =
      this.currentState === 'dash' ||
      this.currentState === 'glide' ||
      this.currentState === 'celebrate';
    this.pawPadGlowMat.color.setHex(glowActive ? 0x67e8f9 : 0x19e6ff);
    this.backNodeCoreMat.color.setHex(glowActive ? 0xa5f3fc : 0x19e6ff);

    // Target pose variables for smooth blending across 10 states
    let targetBodyY = 0;
    let targetPitchX = 0;
    let targetRollZ = -this.smoothTurnLean * 0.18;
    let targetScaleX = 1;
    let targetScaleY = 1;
    let targetScaleZ = 1;

    let headY = 1.56;
    let headPitchX = 0;
    let headYawY = 0;
    let headRollZ = 0;

    let leftArmX = 0;
    let leftArmZ = 0;
    let rightArmX = -0.2;
    let rightArmZ = 0;

    let leftLegX = 0;
    let rightLegX = 0;

    let earPitchBack = THREE.MathUtils.clamp(
      -this.smoothVerticalVel * 0.025,
      -0.28,
      0.28
    );
    let earFlareOut = 0;
    let tailWagFreq = 5.5;
    let tailWagAmp = 0.16;

    switch (this.currentState) {
      case 'fly': {
        // Seated in open cockpit, holding yoke, looking alertly ahead
        headY = 1.56 + Math.sin(this.animTime * 4.2) * 0.025;
        headRollZ = Math.sin(this.animTime * 2.6) * 0.05 - this.smoothTurnLean * 0.12;
        headYawY = -this.smoothTurnLean * 0.18;
        leftArmX = -0.58;
        rightArmX = -0.58;
        earPitchBack = -0.18;
        tailWagFreq = 4.0;
        tailWagAmp = 0.1;
        break;
      }

      case 'idle': {
        const breath = Math.sin(this.animTime * 3.2);
        targetBodyY = Math.abs(breath) * 0.03;
        headY = 1.56 + breath * 0.035;
        headRollZ = Math.sin(this.animTime * 1.6) * 0.035;
        leftArmX = breath * 0.09;
        rightArmX = -0.22 + Math.cos(this.animTime * 3.2) * 0.08;
        earFlareOut = Math.sin(this.animTime * 2.4) * 0.04;
        break;
      }

      case 'run': {
        const stride = this.animTime * 13.5;
        targetBodyY = Math.abs(Math.sin(stride)) * 0.13;
        targetPitchX = 0.14; // Forward center-of-gravity lean
        targetRollZ += Math.cos(stride) * 0.045;
        headY = 1.56 + Math.abs(Math.cos(stride)) * 0.03;
        headPitchX = -0.06;
        headRollZ = Math.cos(stride) * 0.05;
        leftLegX = Math.sin(stride) * 0.68;
        rightLegX = -Math.sin(stride) * 0.68;
        leftArmX = -Math.sin(stride) * 0.58;
        rightArmX = Math.sin(stride) * 0.48 - 0.25;
        earPitchBack = -0.2;
        tailWagFreq = 9.0;
        tailWagAmp = 0.22;
        break;
      }

      case 'jump': {
        const liftRatio = THREE.MathUtils.clamp(
          this.smoothVerticalVel / 12.0,
          -1,
          1
        );
        targetPitchX = -0.08 * liftRatio;
        targetScaleX = 0.95;
        targetScaleY = 1.07;
        targetScaleZ = 0.95;
        leftLegX = 0.42;
        rightLegX = -0.36;
        leftArmX = -0.82;
        leftArmZ = 0.22;
        rightArmX = -1.02;
        rightArmZ = -0.22;
        earPitchBack = liftRatio > 0 ? -0.25 : 0.22;
        earFlareOut = 0.12;
        tailWagFreq = 8.0;
        break;
      }

      case 'dash': {
        // High-speed aerodynamic forward lunge with Mega-Paw leading
        targetBodyY = 0.12;
        targetPitchX = 0.36;
        targetScaleX = 0.92;
        targetScaleY = 0.94;
        targetScaleZ = 1.12;
        headPitchX = -0.22;
        leftArmX = 0.55;
        rightArmX = -1.35; // Mega-paw thrust forward
        leftLegX = 0.62;
        rightLegX = 0.48;
        earPitchBack = -0.42;
        tailWagFreq = 16.0;
        tailWagAmp = 0.28;
        break;
      }

      case 'glide': {
        // Graceful aerial hover with arms spread & gentle bobbing
        const hoverWave = Math.sin(this.animTime * 6.5);
        targetBodyY = 0.08 + hoverWave * 0.04;
        targetPitchX = 0.22;
        headPitchX = -0.14;
        leftArmX = -0.45;
        leftArmZ = 0.68 + hoverWave * 0.08;
        rightArmX = -0.45;
        rightArmZ = -0.68 - hoverWave * 0.08;
        leftLegX = 0.32 + hoverWave * 0.06;
        rightLegX = 0.24 - hoverWave * 0.06;
        earPitchBack = -0.15;
        earFlareOut = 0.24;
        tailWagFreq = 7.5;
        tailWagAmp = 0.24;
        break;
      }

      case 'land': {
        // Cushioned squash-and-stretch landing absorption
        targetBodyY = -0.12;
        targetPitchX = 0.12;
        targetScaleX = 1.14;
        targetScaleY = 0.84;
        targetScaleZ = 1.12;
        headY = 1.48;
        leftArmX = -0.35;
        leftArmZ = 0.35;
        rightArmX = -0.35;
        rightArmZ = -0.35;
        earPitchBack = 0.26;
        earFlareOut = 0.18;
        break;
      }

      case 'hit': {
        targetBodyY = 0.05;
        targetPitchX = -0.22;
        headRollZ = Math.sin(this.animTime * 34) * 0.2;
        leftArmX = -0.65;
        rightArmX = 0.42;
        leftLegX = -0.25;
        rightLegX = 0.25;
        earPitchBack = 0.28;
        earFlareOut = 0.28;
        break;
      }

      case 'fall': {
        const flail = Math.sin(this.animTime * 20);
        targetPitchX = -0.12;
        leftArmX = -1.35 + flail * 0.32;
        rightArmX = -1.35 - flail * 0.32;
        leftLegX = flail * 0.45;
        rightLegX = -flail * 0.45;
        earPitchBack = 0.35;
        earFlareOut = 0.22;
        tailWagFreq = 14.0;
        break;
      }

      case 'celebrate': {
        const bounce = Math.abs(Math.sin(this.animTime * 10.5));
        targetBodyY = bounce * 0.26;
        targetRollZ = Math.sin(this.animTime * 5.25) * 0.1;
        headY = 1.56 + bounce * 0.05;
        headYawY = Math.sin(this.animTime * 6.0) * 0.22;
        leftArmX = -1.25 - Math.sin(this.animTime * 12) * 0.25;
        leftArmZ = 0.25;
        rightArmX = -1.35 + Math.sin(this.animTime * 12) * 0.25;
        rightArmZ = -0.25;
        leftLegX = bounce * 0.3;
        rightLegX = -bounce * 0.25;
        earFlareOut = 0.15 + bounce * 0.1;
        tailWagFreq = 12.0;
        tailWagAmp = 0.3;
        break;
      }
    }

    // Smoothly interpolate all joints for continuous natural transitions
    const blend = Math.min(1, dt * 14);

    this.characterGroup.position.y = THREE.MathUtils.lerp(
      this.characterGroup.position.y,
      targetBodyY,
      blend
    );
    this.characterGroup.rotation.x = THREE.MathUtils.lerp(
      this.characterGroup.rotation.x,
      targetPitchX,
      blend
    );
    this.characterGroup.rotation.z = THREE.MathUtils.lerp(
      this.characterGroup.rotation.z,
      targetRollZ,
      blend
    );
    this.characterGroup.scale.set(
      THREE.MathUtils.lerp(this.characterGroup.scale.x, targetScaleX, blend),
      THREE.MathUtils.lerp(this.characterGroup.scale.y, targetScaleY, blend),
      THREE.MathUtils.lerp(this.characterGroup.scale.z, targetScaleZ, blend)
    );

    this.headGroup.position.y = THREE.MathUtils.lerp(
      this.headGroup.position.y,
      headY,
      blend
    );
    this.headGroup.rotation.x = THREE.MathUtils.lerp(
      this.headGroup.rotation.x,
      headPitchX,
      blend
    );
    this.headGroup.rotation.y = THREE.MathUtils.lerp(
      this.headGroup.rotation.y,
      headYawY,
      blend
    );
    this.headGroup.rotation.z = THREE.MathUtils.lerp(
      this.headGroup.rotation.z,
      headRollZ,
      blend
    );

    this.leftArmGroup.rotation.x = THREE.MathUtils.lerp(
      this.leftArmGroup.rotation.x,
      leftArmX,
      blend
    );
    this.leftArmGroup.rotation.z = THREE.MathUtils.lerp(
      this.leftArmGroup.rotation.z,
      leftArmZ,
      blend
    );

    this.rightArmPawGroup.rotation.x = THREE.MathUtils.lerp(
      this.rightArmPawGroup.rotation.x,
      rightArmX,
      blend
    );
    this.rightArmPawGroup.rotation.z = THREE.MathUtils.lerp(
      this.rightArmPawGroup.rotation.z,
      rightArmZ,
      blend
    );

    this.leftLegGroup.rotation.x = THREE.MathUtils.lerp(
      this.leftLegGroup.rotation.x,
      leftLegX,
      blend
    );
    this.rightLegGroup.rotation.x = THREE.MathUtils.lerp(
      this.rightLegGroup.rotation.x,
      rightLegX,
      blend
    );

    // Secondary motion on ears
    this.leftEarPivot.rotation.x = THREE.MathUtils.lerp(
      this.leftEarPivot.rotation.x,
      earPitchBack,
      dt * 10
    );
    this.rightEarPivot.rotation.x = THREE.MathUtils.lerp(
      this.rightEarPivot.rotation.x,
      earPitchBack,
      dt * 10
    );
    this.leftEarPivot.rotation.z = THREE.MathUtils.lerp(
      this.leftEarPivot.rotation.z,
      0.31 + earFlareOut,
      dt * 10
    );
    this.rightEarPivot.rotation.z = THREE.MathUtils.lerp(
      this.rightEarPivot.rotation.z,
      -0.31 - earFlareOut,
      dt * 10
    );

    // Secondary wave motion on multi-segment tail
    const tailWave = Math.sin(this.animTime * tailWagFreq) * tailWagAmp;
    const tailLagPitch = THREE.MathUtils.clamp(
      -this.smoothVerticalVel * 0.03,
      -0.35,
      0.35
    );
    this.tailBasePivot.rotation.y = tailWave - this.smoothTurnLean * 0.25;
    this.tailBasePivot.rotation.x = tailLagPitch;
    this.tailMidPivot.rotation.z =
      Math.cos(this.animTime * tailWagFreq - 0.8) * (tailWagAmp * 0.85);
    this.tailTipPivot.rotation.y =
      Math.sin(this.animTime * tailWagFreq - 1.5) * (tailWagAmp * 1.1);

    // Starlight cape wave animation & Golden Crown spin
    if (this.starlightCapeGroup.visible) {
      this.capeWaveMeshes.forEach((mesh, idx) => {
        mesh.rotation.x =
          0.26 +
          (this.currentState === 'run' || this.currentState === 'dash' ? 0.35 : 0) +
          Math.sin(this.animTime * 8 - idx * 0.7) * 0.12;
      });
    }
    if (this.goldenCrownGroup.visible) {
      this.goldenCrownGroup.rotation.y += dt * 1.8;
      this.goldenCrownGroup.position.y =
        0.92 + Math.sin(this.animTime * 4) * 0.03;
    }
  }
}
