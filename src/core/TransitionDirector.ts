import * as THREE from 'three';
import { MochiCharacter } from '../entities/MochiCharacter';
import { TowerMath } from './TowerMath';

export class TransitionDirector {
  private readonly mochi: MochiCharacter;
  private readonly towerMath: TowerMath;
  private readonly duration = 7.2;
  private elapsed = 0;
  private active = false;

  private flightCurve!: THREE.CatmullRomCurve3;
  private cameraCurve!: THREE.CatmullRomCurve3;
  private onComplete?: () => void;

  constructor(mochi: MochiCharacter, towerMath: TowerMath) {
    this.mochi = mochi;
    this.towerMath = towerMath;
  }

  public startTransition(
    towerWorldOrigin: THREE.Vector3,
    onComplete: () => void
  ): void {
    this.elapsed = 0;
    this.active = true;
    this.onComplete = onComplete;

    const landingPos = this.towerMath
      .cylindricalToWorld(0, 0, 0)
      .add(towerWorldOrigin);
    const r =
      this.towerMath.config.towerRadius +
      this.towerMath.config.trackOffset +
      9.5;

    // Sweeping panoramic spiral flight around the revealed 5-zone Sky Tower before landing at $100M base
    this.flightCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(
        towerWorldOrigin.x - 32,
        towerWorldOrigin.y + 58,
        towerWorldOrigin.z + 56
      ),
      new THREE.Vector3(
        towerWorldOrigin.x,
        towerWorldOrigin.y + 38,
        towerWorldOrigin.z + r + 14
      ),
      new THREE.Vector3(
        towerWorldOrigin.x + r + 4,
        towerWorldOrigin.y + 22,
        towerWorldOrigin.z
      ),
      new THREE.Vector3(
        towerWorldOrigin.x,
        towerWorldOrigin.y + 9,
        towerWorldOrigin.z - r - 2
      ),
      new THREE.Vector3(
        landingPos.x - 3.5,
        landingPos.y + 2.2,
        landingPos.z + 4.5
      ),
      landingPos
    ]);

    const finalCamPose = this.towerMath.computeOrbitalCameraPose(0, 0);
    const finalCamWorld = finalCamPose.position.clone().add(towerWorldOrigin);

    this.cameraCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(
        towerWorldOrigin.x - 48,
        towerWorldOrigin.y + 66,
        towerWorldOrigin.z + 78
      ),
      new THREE.Vector3(
        towerWorldOrigin.x - 14,
        towerWorldOrigin.y + 44,
        towerWorldOrigin.z + 62
      ),
      new THREE.Vector3(
        towerWorldOrigin.x + 38,
        towerWorldOrigin.y + 24,
        towerWorldOrigin.z + 28
      ),
      new THREE.Vector3(
        towerWorldOrigin.x + 22,
        towerWorldOrigin.y + 12,
        towerWorldOrigin.z - 22
      ),
      finalCamWorld
    ]);

    this.mochi.setAirplaneVisible(true);
    this.mochi.setState('fly');
  }

  public update(
    dt: number,
    camera: THREE.PerspectiveCamera,
    towerWorldOrigin: THREE.Vector3
  ): void {
    if (!this.active) return;

    this.elapsed += dt;
    const rawT = THREE.MathUtils.clamp(this.elapsed / this.duration, 0, 1);
    const t = rawT * rawT * (3 - 2 * rawT);

    const pos = this.flightCurve.getPointAt(t);
    const tangent = this.flightCurve.getTangentAt(t);
    this.mochi.root.position.copy(pos);
    this.mochi.root.lookAt(pos.clone().add(tangent));

    // Gentle banking roll during the orbital sweep around the tower
    if (rawT < 0.84) {
      const bankRoll = Math.sin(rawT * Math.PI * 2) * 0.28;
      this.mochi.root.rotation.z += bankRoll;
    }

    // At 84% progress, Mochi dismounts the aircraft in a celebratory landing
    if (rawT > 0.84 && this.mochi.airplaneGroup.visible) {
      this.mochi.setAirplaneVisible(false);
      this.mochi.setState('celebrate');
    }

    const camPos = this.cameraCurve.getPointAt(t);
    camera.position.copy(camPos);

    // First half of transition focuses high on the grand 5-zone tower reveal, then smoothly locks onto Mochi at the base
    const finalLookAt = this.towerMath
      .computeOrbitalCameraPose(0, 0)
      .lookAt.clone()
      .add(towerWorldOrigin);
    const revealHeight = THREE.MathUtils.lerp(95, 18, Math.min(1, rawT * 1.4));
    const towerPanoramicFocus = new THREE.Vector3(
      towerWorldOrigin.x,
      towerWorldOrigin.y + revealHeight * (1 - t),
      towerWorldOrigin.z
    );
    const currentLookAt = towerPanoramicFocus.lerp(finalLookAt, t);
    camera.lookAt(currentLookAt);

    this.mochi.update(dt, {
      verticalVelocity: tangent.y * 8,
      turnRate: Math.sin(rawT * Math.PI * 2) * 0.5
    });

    if (rawT >= 1) {
      this.active = false;
      this.mochi.setState('idle');
      this.onComplete?.();
    }
  }
}
