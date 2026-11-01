import * as THREE from 'three';
import { AudioEngine } from './core/AudioEngine';
import { InputController } from './core/InputController';
import { DEFAULT_HELIX_CONFIG, TowerMath } from './core/TowerMath';
import { TransitionDirector } from './core/TransitionDirector';
import { MochiCharacter } from './entities/MochiCharacter';
import { SpiralTowerStage } from './entities/SpiralTowerStage';
import { TimeTunnelStage } from './entities/TimeTunnelStage';
import { i18n } from './i18n/I18nManager';
import { AdventureHUD } from './ui/AdventureHUD';

type GamePhase = 'TITLE' | 'PROLOGUE_TUNNEL' | 'TRANSITION' | 'TOWER_CLIMB';

class MochiSkyJourneyGame {
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private clock!: THREE.Clock;

  private towerMath!: TowerMath;
  private audio!: AudioEngine;
  private input!: InputController;
  private hud!: AdventureHUD;

  private mochi!: MochiCharacter;
  private tunnelStage!: TimeTunnelStage;
  private transitionDirector!: TransitionDirector;
  private towerStage!: SpiralTowerStage;

  private phase: GamePhase = 'TITLE';
  private isPaused = false;
  private reducedMotion = false;
  private graphicsQuality: 'HIGH' | 'LOW' = 'HIGH';

  constructor() {
    if (!this.checkWebGLAvailable()) {
      this.renderWebGLFallback();
      return;
    }

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    document.body.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050814);
    this.scene.fog = new THREE.FogExp2(0x050814, 0.0042);

    this.camera = new THREE.PerspectiveCamera(
      52,
      window.innerWidth / window.innerHeight,
      0.1,
      950
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
      onFlightRingCollected: () => {
        this.audio.playOrbCollect(1);
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
      onDashExecuted: () => {
        this.audio.playDash();
      },
      onGlideStarted: () => {
        this.audio.playGlideStart();
      },
      onLandExecuted: () => {
        this.audio.playLand();
      },
      onOrbCollected: (_totalOrbs, combo) => {
        this.audio.playOrbCollect(combo);
      },
      onComboMilestone: (combo) => {
        this.audio.playComboMilestone();
        const s = i18n.getStrings();
        this.hud.showQuickEventToast(
          i18n.format(s.comboRewardToast, { combo }),
          '#fbbf24'
        );
      },
      onHiddenPlatformFound: () => {
        this.audio.playHiddenPlatformFound();
        const s = i18n.getStrings();
        this.hud.showQuickEventToast(s.hiddenPlatformFoundToast, '#e879f9');
      },
      onCosmeticUnlocked: (cosmeticId) => {
        this.audio.playComboMilestone();
        const s = i18n.getStrings();
        const cName = s.cosmetics[cosmeticId].name;
        this.hud.showQuickEventToast(
          i18n.format(s.cosmeticUnlockedToast, { name: cName }),
          '#38bdf8'
        );
      },
      onZoneChanged: (zone) => {
        this.audio.setTowerZone(zone.id);
        this.audio.playZoneEnter();
        this.hud.showZoneEnteredBanner(zone);
      },
      onEarlySimMilestoneReached: (sim) => {
        this.audio.playEarlySimMilestone();
        this.hud.showEarlySimMilestoneToast(sim);
      },
      onMarketCapUpdated: (
        currentCap,
        peakCap,
        nextMilestone,
        ratio,
        zone,
        combo,
        orbs,
        elapsedSeconds
      ) => {
        this.hud.updateClimbStatus(
          currentCap,
          peakCap,
          nextMilestone,
          ratio,
          zone,
          combo,
          orbs,
          elapsedSeconds
        );
      },
      onMilestoneSurpassed: (coin, index, total, isMajor) => {
        if (isMajor) {
          this.audio.playMilestoneSurpass();
        } else {
          this.audio.playMinorMilestoneSurpass();
        }
        this.hud.showSurpassCelebrationBanner(coin, index, total, isMajor);
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
      onStartAdventure: (skipPrologue, timeTrialMode = false) => {
        this.audio.unlockAndStart(skipPrologue ? 'TOWER' : 'TUNNEL');
        if (skipPrologue) {
          this.enterTowerClimbDirectly(false, timeTrialMode);
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
      onGetMuted: () => this.audio.getMuted(),
      onGetVolume: () => this.audio.getVolume(),
      onSetVolume: (vol) => this.audio.setVolume(vol),
      onToggleReducedMotion: () => {
        this.reducedMotion = !this.reducedMotion;
        this.tunnelStage.setReducedMotion(this.reducedMotion);
        this.towerStage.setReducedMotion(this.reducedMotion);
        this.syncPixelRatio();
        return this.reducedMotion;
      },
      onGetReducedMotion: () => this.reducedMotion,
      onToggleGraphicsQuality: () => {
        this.graphicsQuality =
          this.graphicsQuality === 'HIGH' ? 'LOW' : 'HIGH';
        this.syncPixelRatio();
        return this.graphicsQuality;
      },
      onGetGraphicsQuality: () => this.graphicsQuality,
      onGetUnlockedCosmetics: () => this.mochi.getUnlockedCosmetics(),
      onGetEquippedCosmetic: () => this.mochi.getEquippedCosmetic(),
      onEquipCosmetic: (id) => this.mochi.setCosmetic(id),
      onRetryFromCheckpoint: () => {
        this.isPaused = false;
        this.hud.updateHearts(3);
        this.towerStage.startClimb(true, false);
      },
      onRestartClimbFull: (timeTrialMode = false) => {
        this.isPaused = false;
        this.enterTowerClimbDirectly(false, timeTrialMode);
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

  private checkWebGLAvailable(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl2') ||
          canvas.getContext('webgl') ||
          canvas.getContext('experimental-webgl'))
      );
    } catch {
      return false;
    }
  }

  private renderWebGLFallback(): void {
    const fallbackEl = document.getElementById('webgl-fallback');
    if (!fallbackEl) return;
    const s = i18n.getStrings();
    fallbackEl.style.display = 'flex';
    fallbackEl.innerHTML =
      '<div style="max-width:480px; background:rgba(15,23,42,0.92); border:1.5px solid #38bdf8; border-radius:18px; padding:28px;">' +
      '<h2 style="color:#19e6ff; margin:0 0 12px 0;">' +
      s.webglFallbackTitle +
      '</h2>' +
      '<p style="color:#cbd5e1; line-height:1.6; margin:0;">' +
      s.webglFallbackDesc +
      '</p></div>';
  }

  private syncPixelRatio(): void {
    if (this.graphicsQuality === 'LOW' || this.reducedMotion) {
      this.renderer.setPixelRatio(1);
    } else {
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
  }

  private setupLights(): void {
    const ambient = new THREE.AmbientLight(0xdbeafe, 1.38);
    this.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.65);
    dirLight.position.set(18, 42, 24);
    this.scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0xa624f2, 1.15);
    rimLight.position.set(-20, 16, -18);
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
    this.scene.background = new THREE.Color(0x050814);
    if (this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.color.setHex(0x050814);
    }
    this.hud.setSkipPrologueVisible(true);
    this.hud.showTutorialHint(i18n.getStrings().tutorials.flightControl);
    this.audio.switchBgm('TUNNEL');
    this.tunnelStage.start();
  }

  private beginTowerTransition(): void {
    this.phase = 'TRANSITION';
    this.hud.setSkipPrologueVisible(false);
    this.hud.showTutorialHint(i18n.getStrings().tutorials.transitionToTower);
    this.transitionDirector.startTransition(this.towerStage.worldOrigin, () => {
      this.enterTowerClimbDirectly(false, false);
    });
  }

  private enterTowerClimbDirectly(
    fromCheckpoint: boolean,
    timeTrialMode: boolean = false
  ): void {
    this.phase = 'TOWER_CLIMB';
    this.isPaused = false;
    this.hud.setSkipPrologueVisible(false);
    this.hud.updateHearts(3);
    this.audio.setTowerZone('CLOUD_RUINS');
    this.audio.switchBgm('TOWER');
    this.towerStage.startClimb(fromCheckpoint, timeTrialMode);
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
    if (!this.renderer || !this.camera) return;
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
      this.tunnelStage.setFlightInput(
        controls.moveForward,
        controls.flightPitch
      );
      this.tunnelStage.update(rawDt, this.camera);
    } else if (this.phase === 'TRANSITION') {
      this.transitionDirector.update(
        rawDt,
        this.camera,
        this.towerStage.worldOrigin
      );
    } else if (this.phase === 'TOWER_CLIMB') {
      this.towerStage.update(
        rawDt,
        controls,
        () => this.input.consumeJumpBuffer(),
        this.camera,
        this.scene,
        () => this.input.consumeDashBuffer()
      );
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new MochiSkyJourneyGame();
});
