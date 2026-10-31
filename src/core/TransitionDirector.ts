import * as THREE from 'three';
import { MochiCharacter } from '../entities/MochiCharacter';
import { TowerMath } from './TowerMath';

export class TransitionDirector {
  private readonly mochi: MochiCharacter;
  private readonly towerMath: TowerMath;
  private readonly duration = 6.5;
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
    const r = this.towerMath.config.towerRadius + this.towerMath.config.trackOffset + 8;

    this.flightCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(towerWorldOrigin.x - 28, towerWorldOrigin.y + 42, towerWorldOrigin.z + 48),
      new THREE.Vector3(towerWorldOrigin.x, towerWorldOrigin.y + 28, towerWorldOrigin.z + r + 12),
      new THREE.Vector3(towerWorldOrigin.x + r, towerWorldOrigin.y + 14, towerWorldOrigin.z),
      new THREE.Vector3(towerWorldOrigin.x, towerWorldOrigin.y + 5, towerWorldOrigin.z - r),
      landingPos
    ]);

    const finalCamPose = this.towerMath.computeOrbitalCameraPose(0, 0);
    const finalCamWorld = finalCamPose.position.clone().add(towerWorldOrigin);

    this.cameraCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(towerWorldOrigin.x - 42, towerWorldOrigin.y + 48, towerWorldOrigin.z + 68),
      new THREE.Vector3(towerWorldOrigin.x - 10, towerWorldOrigin.y + 32, towerWorldOrigin.z + 55),
      new THREE.Vector3(towerWorldOrigin.x + 35, towerWorldOrigin.y + 18, towerWorldOrigin.z + 25),
      finalCamWorld
    ]);
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

    if (rawT > 0.85 && this.mochi.airplaneGroup.visible) {
      this.mochi.setAirplaneVisible(false);
      this.mochi.setState('celebrate');
    }

    const camPos = this.cameraCurve.getPointAt(t);
    camera.position.copy(camPos);

    const finalLookAt = this.towerMath
      .computeOrbitalCameraPose(0, 0)
      .lookAt.clone()
      .add(towerWorldOrigin);
    const towerPanoramicFocus = new THREE.Vector3(
      towerWorldOrigin.x,
      towerWorldOrigin.y + 26 * (1 - t),
      towerWorldOrigin.z
    );
    const currentLookAt = towerPanoramicFocus.lerp(finalLookAt, t);
    camera.lookAt(currentLookAt);

    if (rawT >= 1) {
      this.active = false;
      this.mochi.setState('idle');
      this.onComplete?.();
    }
  }
}
