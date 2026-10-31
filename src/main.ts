import * as THREE from 'three';
import { AudioEngine } from './core/AudioEngine';
import { InputController } from './core/InputController';
import { DEFAULT_HELIX_CONFIG, TowerMath } from './core/TowerMath';
import { TransitionDirector } from './core/TransitionDirector';
import { MochiCharacter } from './entities/MochiCharacter';
import { SpiralTowerStage } from './entities/SpiralTowerStage';
import { TimeTunnelStage } from './entities/TimeTunnelStage';
import { AdventureHUD } from './ui/AdventureHUD';

type GamePhase = 'TITLE' | 'PROLOGUE_TUNNEL' | 'TRANSITION' | 'TOWER_CLIMB';

class MochiSkyJourneyGame {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private clock: THREE.Clock;

  private towerMath: TowerMath;
  private audio: AudioEngine;
  private input: InputController;
  private hud: AdventureHUD;

  private mochi: MochiCharacter;
  private tunnelStage: TimeTunnelStage;
  private transitionDirector: TransitionDirector;
  private towerStage: SpiralTowerStage;

  private phase: GamePhase = 'TITLE';
  private isPaused = false;
  private reducedMotion = false;

  constructor() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    document.body.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050814);
    this.scene.fog = new THREE.FogExp2(0x050814, 0.0045);

    this.camera = new THREE.PerspectiveCamera(
      52,
      window.innerWidth / window.innerHeight,
      0.1,
      900
    );
    this.clock = new THREE.Clock();

    this.setupLights();

    this.towerMath = new TowerMath(DEFAULT_HELIX_CONFIG);
    this.audio = new AudioEngine();
    this.mochi = new MochiCharacter();
    this.scene.add(this.mochi.root);

    this.transitionDirector = new TransitionDirector(this.mochi, this.towerMath);

    this.tunnelStage = new TimeTunnelStage(this.mochi, {
      onMilestoneReached: (milestone, index, total) => {
        this.audio.playHistoryGatePass();
        this.hud.showHistoryMilestoneToast(milestone, index, total);
      },
      onTunnelCompleted: () => {
        localStorage.setItem('mochi_prologue_watched', 'true');
        this.beginTowerTransition();
      }
    });
    this.scene.add(this.tunnelStage.group);

    this.towerStage = new SpiralTowerStage(this.towerMath, this.mochi, {
      onJumpExecuted: () => {
        this.audio.playJump();
      },
      onMarketCapUpdated: (currentCap, peakCap, nextMilestone, ratio) => {
        this.hud.updateClimbStatus(currentCap, peakCap, nextMilestone, ratio);
      },
      onMilestoneSurpassed: (coin, index, total) => {
        this.audio.playMilestoneSurpass();
        this.hud.showSurpassCelebrationBanner(coin, index, total);
      },
      onPlayerDamaged: (hearts) => {
        this.audio.playHit();
        this.hud.updateHearts(hearts);
      },
      onPlayerFailedRun: (peakCap, checkpointName) => {
        this.audio.playHit();
        this.hud.updateHearts(0);
        this.isPaused = true;
        this.hud.showFailRetryModal(peakCap, checkpointName);
      },
      onTutorialStepChange: (hint) => {
        this.hud.showTutorialHint(hint);
      },
      onTowerSummitReached: (stats) => {
        this.audio.playSummitVictory();
        this.hud.showSummitVictoryModal(stats);
      }
    });
    this.scene.add(this.towerStage.group);

    this.input = new InputController(() => this.togglePause());
    this.hud = new AdventureHUD({
      onStartAdventure: (skipPrologue) => {
        this.audio.unlockAndStart(skipPrologue ? 'TOWER' : 'TUNNEL');
        if (skipPrologue) {
          this.enterTowerClimbDirectly(false);
        } else {
          this.startPrologueTunnel();
        }
      },
      onSkipPrologue: () => {
        if (this.phase === 'PROLOGUE_TUNNEL') {
          this.beginTowerTransition();
        }
      },
      onTogglePause: () => this.togglePause(),
      onToggleMute: () => this.audio.toggleMute(),
      onToggleReducedMotion: () => {
        this.reducedMotion = !this.reducedMotion;
        this.renderer.setPixelRatio(
          this.reducedMotion ? 1 : Math.min(window.devicePixelRatio, 2)
        );
        return this.reducedMotion;
      },
      onRetryFromCheckpoint: () => {
        this.isPaused = false;
        this.hud.updateHearts(3);
        this.towerStage.startClimb(true);
      },
      onRestartClimbFull: () => {
        this.isPaused = false;
        this.enterTowerClimbDirectly(false);
      },
      onReplayPrologue: () => {
        this.isPaused = false;
        this.startPrologueTunnel();
      }
    });

    this.setupTitleIdlePreview();

    window.addEventListener('resize', () => this.onWindowResize());
    this.animate();
  }

  private setupLights(): void {
    const ambient = new THREE.AmbientLight(0xdbeafe, 1.35);
    this.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.6);
    dirLight.position.set(18, 40, 24);
    this.scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0xa624f2, 1.1);
    rimLight.position.set(-20, 15, -18);
    this.scene.add(rimLight);
  }

  private setupTitleIdlePreview(): void {
    this.mochi.setAirplaneVisible(false);
    this.mochi.setState('idle');
    this.mochi.root.position.set(0, -0.8, 0);
    this.mochi.root.rotation.set(0, 0.35, 0);
    this.camera.position.set(0, 1.2, 5.2);
    this.camera.lookAt(0, 1.0, 0);
  }

  private startPrologueTunnel(): void {
    this.phase = 'PROLOGUE_TUNNEL';
    this.isPaused = false;
    this.hud.setSkipPrologueVisible(true);
    this.audio.switchBgm('TUNNEL');
    this.tunnelStage.start();
  }

  private beginTowerTransition(): void {
    this.phase = 'TRANSITION';
    this.hud.setSkipPrologueVisible(false);
    this.hud.showTutorialHint('✨ 正在飞出时间隧道，前往加密市值螺旋高塔...');
    this.transitionDirector.startTransition(this.towerStage.worldOrigin, () => {
      this.enterTowerClimbDirectly(false);
    });
  }

  private enterTowerClimbDirectly(fromCheckpoint: boolean): void {
    this.phase = 'TOWER_CLIMB';
    this.isPaused = false;
    this.hud.setSkipPrologueVisible(false);
    this.hud.updateHearts(3);
    this.audio.switchBgm('TOWER');
    this.towerStage.startClimb(fromCheckpoint);
  }

  private togglePause(): void {
    if (this.phase === 'TITLE' || this.phase === 'TRANSITION') return;
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.hud.showPauseModal(() => {
        this.isPaused = false;
      });
    }
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    const rawDt = Math.min(this.clock.getDelta(), 0.05);
    if (this.isPaused) {
      this.renderer.render(this.scene, this.camera);
      return;
    }

    const controls = this.input.update(rawDt);

    if (this.phase === 'TITLE') {
      this.mochi.root.rotation.y += rawDt * 0.45;
      this.mochi.update(rawDt);
    } else if (this.phase === 'PROLOGUE_TUNNEL') {
      this.tunnelStage.setFlightInput(controls.moveForward, controls.flightPitch);
      this.tunnelStage.update(rawDt, this.camera);
      this.mochi.update(rawDt);
    } else if (this.phase === 'TRANSITION') {
      this.transitionDirector.update(
        rawDt,
        this.camera,
        this.towerStage.worldOrigin
      );
      this.mochi.update(rawDt);
    } else if (this.phase === 'TOWER_CLIMB') {
      this.towerStage.update(
        rawDt,
        controls,
        () => this.input.consumeJumpBuffer(),
        this.camera
      );
      this.mochi.update(rawDt);
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new MochiSkyJourneyGame();
});
