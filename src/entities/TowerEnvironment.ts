import * as THREE from 'three';
import {
  TOWER_ZONES,
  TowerMath,
  TowerZoneId,
  TowerZoneSpec
} from '../core/TowerMath';

interface AnimatedGear {
  mesh: THREE.Object3D;
  speed: number;
  axis: 'x' | 'y' | 'z';
}

interface FloatingProp {
  mesh: THREE.Object3D;
  baseY: number;
  phase: number;
  amplitude: number;
}

export class TowerEnvironment {
  public readonly group: THREE.Group;
  private readonly towerMath: TowerMath;

  private animatedGears: AnimatedGear[] = [];
  private floatingProps: FloatingProp[] = [];
  private auroraRibbons: THREE.Mesh[] = [];
  private astrolabeRings: THREE.Mesh[] = [];
  private cloudLayers: THREE.Mesh[] = [];
  private summitBeaconGroup = new THREE.Group();

  private animTime = 0;

  constructor(towerMath: TowerMath) {
    this.towerMath = towerMath;
    this.group = new THREE.Group();

    this.buildFiveZoneTowerCore();
    this.buildBasePlazaAndSeaOfClouds();
    this.buildZone1CloudRuins();
    this.buildZone2SkyGarden();
    this.buildZone3StormMech();
    this.buildZone4AuroraCrystal();
    this.buildZone5StarlightCrown();
  }

  private buildFiveZoneTowerCore(): void {
    const { towerRadius, totalHeight } = this.towerMath.config;
    const zoneHeight = totalHeight / TOWER_ZONES.length;

    TOWER_ZONES.forEach((zone, idx) => {
      const centerY = (idx + 0.5) * zoneHeight;

      // Zone core cylinder with subtle architectural taper
      const topR = towerRadius * (1 - idx * 0.004);
      const botR = towerRadius * (1.02 - idx * 0.004);
      const coreGeo = new THREE.CylinderGeometry(
        topR,
        botR,
        zoneHeight + 0.5,
        48,
        8
      );
      const coreMat = new THREE.MeshStandardMaterial({
        color: zone.primaryColor,
        roughness: 0.5,
        metalness: 0.35
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.position.y = centerY;
      this.group.add(coreMesh);

      // Vertical luminous runic ribs along each zone
      const ribMat = new THREE.MeshBasicMaterial({
        color: zone.emissiveTrimColor,
        transparent: true,
        opacity: 0.55
      });
      const ribGeo = new THREE.BoxGeometry(0.28, zoneHeight - 1.2, 0.28);
      for (let r = 0; r < 12; r++) {
        const angle = (r / 12) * Math.PI * 2 + idx * 0.12;
        const rib = new THREE.Mesh(ribGeo, ribMat);
        rib.position.set(
          Math.cos(angle) * (topR + 0.06),
          centerY,
          Math.sin(angle) * (topR + 0.06)
        );
        this.group.add(rib);
      }

      // Grand architectural cornice ring at each zone boundary
      const boundaryY = idx * zoneHeight;
      const corniceRing = new THREE.Mesh(
        new THREE.TorusGeometry(towerRadius + 0.45, 0.42, 16, 64),
        new THREE.MeshStandardMaterial({
          color: zone.accentColor,
          emissive: zone.accentColor,
          emissiveIntensity: 0.3,
          roughness: 0.3,
          metalness: 0.5
        })
      );
      corniceRing.rotation.x = Math.PI * 0.5;
      corniceRing.position.y = boundaryY;
      this.group.add(corniceRing);
    });
  }

  private buildBasePlazaAndSeaOfClouds(): void {
    const { towerRadius, totalHeight } = this.towerMath.config;

    // Grand $100M Sanctuary Base Plaza
    const plazaDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(
        towerRadius + 10.5,
        towerRadius + 13.5,
        2.4,
        48
      ),
      new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.45,
        metalness: 0.35
      })
    );
    plazaDisc.position.y = -1.4;
    this.group.add(plazaDisc);

    const plazaRuneRing = new THREE.Mesh(
      new THREE.TorusGeometry(towerRadius + 9.2, 0.18, 12, 64),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    plazaRuneRing.rotation.x = Math.PI * 0.5;
    plazaRuneRing.position.y = -0.15;
    this.group.add(plazaRuneRing);

    // Multi-layered atmospheric sea of clouds from base to crown
    const cloudConfigs = [
      { y: -4, radius: towerRadius + 24, tube: 6.5, color: 0x38bdf8, op: 0.2 },
      { y: 45, radius: towerRadius + 21, tube: 4.2, color: 0x7dd3fc, op: 0.15 },
      { y: 135, radius: towerRadius + 23, tube: 4.5, color: 0x34d399, op: 0.13 },
      { y: 235, radius: towerRadius + 25, tube: 4.8, color: 0xf59e0b, op: 0.12 },
      { y: 335, radius: towerRadius + 24, tube: 4.2, color: 0x22d3ee, op: 0.14 },
      {
        y: totalHeight - 15,
        radius: towerRadius + 26,
        tube: 4.6,
        color: 0xc084fc,
        op: 0.16
      }
    ];

    cloudConfigs.forEach((cfg) => {
      const cloudMesh = new THREE.Mesh(
        new THREE.TorusGeometry(cfg.radius, cfg.tube, 14, 48),
        new THREE.MeshStandardMaterial({
          color: cfg.color,
          transparent: true,
          opacity: cfg.op,
          roughness: 0.92
        })
      );
      cloudMesh.rotation.x = Math.PI * 0.5;
      cloudMesh.position.y = cfg.y;
      this.group.add(cloudMesh);
      this.cloudLayers.push(cloudMesh);
    });
  }

  // =========================================================
  // ZONE 1: CLOUD SEA RUINS (0% - 20%, Y: 0..96)
  // =========================================================
  private buildZone1CloudRuins(): void {
    const { towerRadius, totalHeight } = this.towerMath.config;
    const maxY = totalHeight * 0.2;
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.65,
      metalness: 0.15
    });
    const runeGlowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2 + 0.3;
      const dist = towerRadius + 11.5 + (i % 3) * 3.2;
      const y = 10 + (i / 10) * (maxY - 16);

      const monolithGroup = new THREE.Group();
      monolithGroup.position.set(
        Math.cos(angle) * dist,
        y,
        Math.sin(angle) * dist
      );
      monolithGroup.lookAt(0, y, 0);

      const pillar = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 7.5, 1.4),
        stoneMat
      );
      monolithGroup.add(pillar);

      const capStone = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 0.9, 1.8),
        stoneMat
      );
      capStone.position.y = 4.1;
      monolithGroup.add(capStone);

      const runeStrip = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 5.2, 1.48),
        runeGlowMat
      );
      monolithGroup.add(runeStrip);

      this.group.add(monolithGroup);
      this.floatingProps.push({
        mesh: monolithGroup,
        baseY: y,
        phase: i * 0.9,
        amplitude: 0.65
      });
    }
  }

  // =========================================================
  // ZONE 2: HANGING SKY GARDEN (20% - 40%, Y: 96..192)
  // =========================================================
  private buildZone2SkyGarden(): void {
    const { towerRadius, totalHeight } = this.towerMath.config;
    const startY = totalHeight * 0.2;
    const spanY = totalHeight * 0.2;

    const islandRockMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.7
    });
    const emeraldCanopyMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x065f46,
      emissiveIntensity: 0.35,
      roughness: 0.35
    });
    const blossomMat = new THREE.MeshBasicMaterial({ color: 0x6ee7b7 });

    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const dist = towerRadius + 12 + (i % 2) * 3.5;
      const y = startY + 8 + (i / 10) * (spanY - 14);

      const gardenIsle = new THREE.Group();
      gardenIsle.position.set(
        Math.cos(angle) * dist,
        y,
        Math.sin(angle) * dist
      );

      // Inverted floating island cone base
      const rockBase = new THREE.Mesh(
        new THREE.ConeGeometry(2.4, 3.6, 7),
        islandRockMat
      );
      rockBase.rotation.x = Math.PI;
      rockBase.position.y = -1.8;
      gardenIsle.add(rockBase);

      // Crystal sanctuary tree crown
      const canopy = new THREE.Mesh(
        new THREE.DodecahedronGeometry(2.1, 0),
        emeraldCanopyMat
      );
      canopy.position.y = 1.4;
      gardenIsle.add(canopy);

      const haloRing = new THREE.Mesh(
        new THREE.TorusGeometry(2.7, 0.06, 8, 24),
        blossomMat
      );
      haloRing.rotation.x = Math.PI * 0.5;
      haloRing.position.y = 0.2;
      gardenIsle.add(haloRing);

      this.group.add(gardenIsle);
      this.floatingProps.push({
        mesh: gardenIsle,
        baseY: y,
        phase: i * 1.1,
        amplitude: 0.85
      });
    }
  }

  // =========================================================
  // ZONE 3: STORMWORK CITADEL (40% - 60%, Y: 192..288)
  // =========================================================
  private buildZone3StormMech(): void {
    const { towerRadius, totalHeight } = this.towerMath.config;
    const startY = totalHeight * 0.4;
    const spanY = totalHeight * 0.2;

    const brassGearMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0x78350f,
      emissiveIntensity: 0.32,
      roughness: 0.28,
      metalness: 0.78
    });
    const darkIronMat = new THREE.MeshStandardMaterial({
      color: 0x312e81,
      roughness: 0.4,
      metalness: 0.65
    });

    // Giant rotating clockwork rings encircling the Stormwork Citadel
    for (let k = 0; k < 3; k++) {
      const ringY = startY + (k + 0.5) * (spanY / 3);
      const gearRingGroup = new THREE.Group();
      gearRingGroup.position.y = ringY;

      const mainTorus = new THREE.Mesh(
        new THREE.TorusGeometry(towerRadius + 11.2, 0.38, 12, 48),
        brassGearMat
      );
      mainTorus.rotation.x = Math.PI * 0.5;
      gearRingGroup.add(mainTorus);

      for (let t = 0; t < 16; t++) {
        const a = (t / 16) * Math.PI * 2;
        const tooth = new THREE.Mesh(
          new THREE.BoxGeometry(1.1, 0.9, 1.4),
          darkIronMat
        );
        tooth.position.set(
          Math.cos(a) * (towerRadius + 11.2),
          0,
          Math.sin(a) * (towerRadius + 11.2)
        );
        tooth.lookAt(0, 0, 0);
        gearRingGroup.add(tooth);
      }

      this.group.add(gearRingGroup);
      this.animatedGears.push({
        mesh: gearRingGroup,
        speed: (k % 2 === 0 ? 1 : -1) * 0.22,
        axis: 'y'
      });
    }

    // Floating vertical clockwork cogs outside the track
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + 0.4;
      const dist = towerRadius + 13.5;
      const y = startY + 10 + (i / 8) * (spanY - 20);

      const cog = new THREE.Mesh(
        new THREE.TorusGeometry(2.6, 0.45, 8, 12),
        brassGearMat
      );
      cog.position.set(Math.cos(angle) * dist, y, Math.sin(angle) * dist);
      cog.lookAt(0, y, 0);
      this.group.add(cog);
      this.animatedGears.push({
        mesh: cog,
        speed: (i % 2 === 0 ? 1 : -1) * 0.85,
        axis: 'z'
      });
    }
  }

  // =========================================================
  // ZONE 4: AURORA ICE SPIRE (60% - 80%, Y: 288..384)
  // =========================================================
  private buildZone4AuroraCrystal(): void {
    const { towerRadius, totalHeight } = this.towerMath.config;
    const startY = totalHeight * 0.6;
    const spanY = totalHeight * 0.2;

    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x67e8f9,
      emissive: 0x0891b2,
      emissiveIntensity: 0.45,
      transparent: true,
      opacity: 0.82,
      roughness: 0.12,
      metalness: 0.3
    });

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const dist = towerRadius + 11.8 + (i % 3) * 2.5;
      const y = startY + 6 + (i / 12) * (spanY - 12);

      const cluster = new THREE.Group();
      cluster.position.set(Math.cos(angle) * dist, y, Math.sin(angle) * dist);

      const mainSpire = new THREE.Mesh(
        new THREE.ConeGeometry(1.2, 6.8, 6),
        crystalMat
      );
      cluster.add(mainSpire);

      const lowerSpire = new THREE.Mesh(
        new THREE.ConeGeometry(1.1, 4.2, 6),
        crystalMat
      );
      lowerSpire.rotation.x = Math.PI;
      lowerSpire.position.y = -5.2;
      cluster.add(lowerSpire);

      this.group.add(cluster);
      this.floatingProps.push({
        mesh: cluster,
        baseY: y,
        phase: i * 0.7,
        amplitude: 0.75
      });
    }

    // Shimmering Aurora Borealis Ribbons
    const auroraColors = [0x22d3ee, 0x34d399, 0xa855f7];
    for (let a = 0; a < 3; a++) {
      const ribbonGeo = new THREE.CylinderGeometry(
        towerRadius + 18 + a * 2.5,
        towerRadius + 19.5 + a * 2.5,
        8.5,
        48,
        1,
        true
      );
      const ribbonMat = new THREE.MeshBasicMaterial({
        color: auroraColors[a],
        transparent: true,
        opacity: 0.16,
        side: THREE.DoubleSide
      });
      const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
      ribbon.position.y = startY + 22 + a * 26;
      this.group.add(ribbon);
      this.auroraRibbons.push(ribbon);
    }
  }

  // =========================================================
  // ZONE 5: STARLIGHT CROWN & BTC SUMMIT SANCTUARY (80% - 100%, Y: 384..480)
  // =========================================================
  private buildZone5StarlightCrown(): void {
    const { towerRadius, totalHeight } = this.towerMath.config;
    const startY = totalHeight * 0.8;
    const spanY = totalHeight * 0.2;

    const starGoldMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xb45309,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.85
    });
    const cosmicVioletMat = new THREE.MeshBasicMaterial({
      color: 0xe879f9,
      transparent: true,
      opacity: 0.65
    });

    // Celestial Astrolabe Rings orbiting the upper Starlight Crown
    for (let r = 0; r < 3; r++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(towerRadius + 13.5 + r * 2.2, 0.18, 12, 64),
        r % 2 === 0 ? starGoldMat : cosmicVioletMat
      );
      ring.position.y = startY + spanY * 0.55;
      ring.rotation.x = 0.35 + r * 0.42;
      ring.rotation.z = r * 0.5;
      this.group.add(ring);
      this.astrolabeRings.push(ring);
    }

    // Grand BTC Historical Daily Record Summit Crown Beacon at Y = totalHeight
    this.summitBeaconGroup.position.set(0, totalHeight + 5.5, 0);

    const crownPedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(towerRadius * 0.82, towerRadius * 0.98, 4.5, 36),
      new THREE.MeshStandardMaterial({
        color: 0x1e1b4b,
        roughness: 0.3,
        metalness: 0.6
      })
    );
    crownPedestal.position.y = -3.8;
    this.summitBeaconGroup.add(crownPedestal);

    const btcCrownCrystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(3.8, 0),
      new THREE.MeshStandardMaterial({
        color: 0xf7931a,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.65,
        roughness: 0.15,
        metalness: 0.75
      })
    );
    this.summitBeaconGroup.add(btcCrownCrystal);

    const summitHaloOuter = new THREE.Mesh(
      new THREE.TorusGeometry(6.8, 0.22, 16, 64),
      starGoldMat
    );
    this.summitBeaconGroup.add(summitHaloOuter);

    const skyPillarBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 2.2, 65, 24, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide
      })
    );
    skyPillarBeam.position.y = 32;
    this.summitBeaconGroup.add(skyPillarBeam);

    this.group.add(this.summitBeaconGroup);
  }

  public update(
    dt: number,
    playerHeightY: number,
    scene: THREE.Scene,
    reducedMotion: boolean = false
  ): TowerZoneSpec {
    this.animTime += dt;
    const activeZone = this.towerMath.getZoneByHeight(playerHeightY);

    // Smoothly blend background & fog color to match the current zone's atmosphere
    const targetFogColor = new THREE.Color(activeZone.fogColor);
    if (scene.background instanceof THREE.Color) {
      scene.background.lerp(targetFogColor, dt * 2.5);
    }
    if (scene.fog instanceof THREE.FogExp2) {
      scene.fog.color.lerp(targetFogColor, dt * 2.5);
    }

    if (!reducedMotion) {
      for (const gear of this.animatedGears) {
        gear.mesh.rotation[gear.axis] += gear.speed * dt;
      }

      for (const prop of this.floatingProps) {
        prop.mesh.position.y =
          prop.baseY +
          Math.sin(this.animTime * 1.8 + prop.phase) * prop.amplitude;
      }

      this.auroraRibbons.forEach((ribbon, idx) => {
        ribbon.rotation.y += dt * (0.12 + idx * 0.05);
        ribbon.scale.x = 1 + Math.sin(this.animTime * 1.5 + idx) * 0.04;
      });

      this.astrolabeRings.forEach((ring, idx) => {
        ring.rotation.y += dt * (0.28 + idx * 0.12);
        ring.rotation.x += dt * 0.08 * (idx % 2 === 0 ? 1 : -1);
      });

      this.cloudLayers.forEach((cloud, idx) => {
        cloud.rotation.z += dt * 0.03 * (idx % 2 === 0 ? 1 : -1);
      });

      this.summitBeaconGroup.rotation.y += dt * 0.65;
    }

    return activeZone;
  }

  public getZoneIdAtHeight(y: number): TowerZoneId {
    return this.towerMath.getZoneByHeight(y).id;
  }
}
