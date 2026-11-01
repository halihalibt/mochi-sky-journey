import { MOCHI_CREDITS } from '../config/credits';
import { TowerMath, TowerZoneSpec } from '../core/TowerMath';
import {
  CRYPTO_MARKET_CAP_MILESTONES,
  CryptoMilestone,
  MARKET_CAP_DATASET_META,
  SimulationProgressMilestone
} from '../data/cryptoMarketCaps';
import {
  GENLAYER_HISTORY_MILESTONES,
  GenLayerMilestone
} from '../data/genlayerHistory';
import { MochiCosmeticId } from '../entities/MochiCharacter';
import { SpiralTowerStage, TowerSummitStats } from '../entities/SpiralTowerStage';
import { i18n } from '../i18n/I18nManager';
import { LOCALE_OPTIONS, SupportedLocale } from '../i18n/locales';

export interface HUDActions {
  onStartAdventure: (skipPrologue: boolean, timeTrialMode?: boolean) => void;
  onSkipPrologue: () => void;
  onTogglePause: () => void;
  onToggleMute: () => boolean;
  onGetMuted: () => boolean;
  onGetVolume: () => number;
  onSetVolume: (vol: number) => void;
  onToggleReducedMotion: () => boolean;
  onGetReducedMotion: () => boolean;
  onToggleGraphicsQuality: () => 'HIGH' | 'LOW';
  onGetGraphicsQuality: () => 'HIGH' | 'LOW';
  onGetUnlockedCosmetics: () => MochiCosmeticId[];
  onGetEquippedCosmetic: () => MochiCosmeticId;
  onEquipCosmetic: (id: MochiCosmeticId) => void;
  onRetryFromCheckpoint: () => void;
  onRestartClimbFull: (timeTrialMode?: boolean) => void;
  onReplayPrologue: () => void;
}

export class AdventureHUD {
  private readonly root: HTMLElement;
  private readonly actions: HUDActions;

  private titleOverlay!: HTMLElement;
  private topBar!: HTMLElement;
  private simCapNoteEl!: HTMLElement;
  private capValueEl!: HTMLElement;
  private nextTargetEl!: HTMLElement;
  private zoneBadgeEl!: HTMLElement;
  private comboBadgeEl!: HTMLElement;
  private orbsBadgeEl!: HTMLElement;
  private timerBadgeEl!: HTMLElement;
  private progressLabelEl!: HTMLElement;
  private progressFillEl!: HTMLElement;
  private heartsEl!: HTMLElement;

  private skipPrologueBtn!: HTMLButtonElement;
  private codexBtn!: HTMLButtonElement;
  private langBtn!: HTMLButtonElement;
  private settingsBtn!: HTMLButtonElement;
  private muteBtn!: HTMLButtonElement;
  private pauseBtn!: HTMLButtonElement;

  private bannerEl!: HTMLElement;
  private minorToastEl!: HTMLElement;
  private tutorialEl!: HTMLElement;
  private modalContainer!: HTMLElement;
  private langFirstTimeOverlay!: HTMLElement;

  private lastCurrentCapUSD = 100_000_000;
  private lastPeakCapUSD = 100_000_000;
  private lastNextMilestone: CryptoMilestone | null =
    CRYPTO_MARKET_CAP_MILESTONES[0];
  private lastProgressRatio = 0;
  private lastZone: TowerZoneSpec | null = null;
  private lastCombo = 0;
  private lastOrbs = 0;
  private lastElapsedSeconds = 0;
  private lastHearts = 3;

  constructor(actions: HUDActions) {
    this.actions = actions;
    this.root = document.createElement('div');
    this.root.id = 'mochi-adventure-hud';
    document.body.appendChild(this.root);

    this.injectStyles();
    this.buildTopAdventureBar();
    this.buildFloatingBanners();
    this.buildTitleScreen();
    this.buildModalContainer();
    this.buildFirstTimeLanguageModal();

    i18n.onChange(() => {
      this.refreshAllLocalizedUI();
    });

    if (!i18n.hasSelectedLanguageFirstTime()) {
      this.showFirstTimeLanguageSelector();
    }
  }

  private injectStyles(): void {
    const style = document.createElement('style');
    style.textContent = [
      '#mochi-adventure-hud { position: fixed; inset: 0; pointer-events: none; color: #f8fafc; z-index: 20; }',
      '.hud-glass { background: linear-gradient(135deg, rgba(11, 18, 34, 0.88), rgba(26, 22, 62, 0.84)); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1.5px solid rgba(25, 230, 255, 0.36); box-shadow: 0 10px 36px rgba(0, 0, 0, 0.5); border-radius: 18px; }',
      '.hud-btn { pointer-events: auto; cursor: pointer; border: 1.5px solid rgba(25, 230, 255, 0.55); background: rgba(15, 23, 42, 0.88); color: #e2e8f0; padding: 8px 15px; border-radius: 999px; font-weight: 700; font-size: 13px; transition: all 0.18s ease; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-family: inherit; }',
      '.hud-btn:hover:not(:disabled) { background: linear-gradient(90deg, #a624f2, #0ea5e9); color: #ffffff; border-color: #ffffff; transform: translateY(-1px); }',
      '.hud-btn:disabled { opacity: 0.48; cursor: not-allowed; }',
      '.hud-btn-primary { background: linear-gradient(135deg, #a624f2 0%, #06b6d4 100%); color: #ffffff; font-size: 15px; padding: 13px 24px; border: 2px solid #a5f3fc; box-shadow: 0 0 24px rgba(25, 230, 255, 0.38); }',
      '.hud-pill { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 800; background: rgba(15, 23, 42, 0.78); border: 1px solid rgba(148, 163, 184, 0.35); }',
      '@keyframes popBanner { 0% { transform: translate(-50%, -22px) scale(0.84); opacity: 0; } 14% { transform: translate(-50%, 0) scale(1.03); opacity: 1; } 86% { transform: translate(-50%, 0) scale(1); opacity: 1; } 100% { transform: translate(-50%, -14px) scale(0.95); opacity: 0; } }',
      '.surpass-banner-anim { animation: popBanner 2.9s cubic-bezier(0.16, 1, 0.3, 1) forwards; }',
      '@keyframes popMinorToast { 0% { transform: translate(-50%, -12px); opacity: 0; } 15% { transform: translate(-50%, 0); opacity: 1; } 85% { transform: translate(-50%, 0); opacity: 1; } 100% { transform: translate(-50%, -10px); opacity: 0; } }',
      '.minor-toast-anim { animation: popMinorToast 2.2s ease forwards; }',
      '@media (max-width: 760px) { .codex-grid { grid-template-columns: 1fr !important; } .hud-top-bar { padding: 8px 12px !important; gap: 8px !important; } }'
    ].join('\n');
    document.head.appendChild(style);
  }

  private buildTopAdventureBar(): void {
    const s = i18n.getStrings();

    this.topBar = document.createElement('div');
    this.topBar.className = 'hud-glass hud-top-bar';
    this.topBar.style.cssText =
      'position: absolute; top: calc(12px + var(--safe-top, 0px)); left: calc(12px + var(--safe-left, 0px)); right: calc(12px + var(--safe-right, 0px)); padding: 11px 18px; display: none; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap;';

    const capBox = document.createElement('div');
    capBox.style.cssText = 'min-width: 240px;';
    capBox.innerHTML =
      '<div id="hud-sim-note" style="font-size:11px; color:#94a3b8;"></div>' +
      '<div style="display:flex; align-items:baseline; gap:10px; flex-wrap:wrap; margin-top:2px;">' +
      '<span id="hud-cap-val" style="font-size:22px; font-weight:900; color:#19e6ff;">$100.0M</span>' +
      '<span id="hud-next-target" style="font-size:12px; color:#cbd5e1;"></span>' +
      '</div>' +
      '<div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:5px;">' +
      '<span id="hud-zone-badge" class="hud-pill" style="color:#38bdf8; border-color:rgba(56,189,248,0.45);"></span>' +
      '<span id="hud-combo-badge" class="hud-pill" style="color:#fbbf24; border-color:rgba(251,191,36,0.45);"></span>' +
      '<span id="hud-orbs-badge" class="hud-pill" style="color:#67e8f9; border-color:rgba(103,232,249,0.45);"></span>' +
      '<span id="hud-timer-badge" class="hud-pill" style="color:#e2e8f0;"></span>' +
      '</div>';

    const centerBox = document.createElement('div');
    centerBox.style.cssText = 'flex: 1; min-width: 190px; max-width: 340px;';
    centerBox.innerHTML =
      '<div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">' +
      '<span id="hud-hearts" style="color:#f43f5e; font-weight:800;">🐾 🐾 🐾</span>' +
      '<span id="hud-progress-label" style="color:#a5f3fc; font-weight:700;"></span>' +
      '</div>' +
      '<div style="height:10px; background:rgba(15,23,42,0.92); border-radius:999px; overflow:hidden; border:1px solid rgba(255,255,255,0.16);">' +
      '<div id="hud-progress-fill" style="width:0%; height:100%; background:linear-gradient(90deg, #a624f2, #19e6ff); transition:width 0.14s linear;"></div>' +
      '</div>';

    const btnGroup = document.createElement('div');
    btnGroup.style.cssText =
      'display:flex; gap:7px; align-items:center; flex-wrap:wrap;';

    this.skipPrologueBtn = document.createElement('button');
    this.skipPrologueBtn.className = 'hud-btn';
    this.skipPrologueBtn.textContent = s.btnSkipPrologue;
    this.skipPrologueBtn.onclick = () => this.actions.onSkipPrologue();

    this.codexBtn = document.createElement('button');
    this.codexBtn.className = 'hud-btn';
    this.codexBtn.textContent = s.btnCodex;
    this.codexBtn.onclick = () => this.openCodexModal();

    this.langBtn = document.createElement('button');
    this.langBtn.className = 'hud-btn';
    this.langBtn.textContent =
      s.changeLanguageBtn + ' (' + i18n.getLocaleOption().badge + ')';
    this.langBtn.onclick = () => this.openSettingsModal();

    this.settingsBtn = document.createElement('button');
    this.settingsBtn.className = 'hud-btn';
    this.settingsBtn.textContent = s.btnSettings;
    this.settingsBtn.onclick = () => this.openSettingsModal();

    this.muteBtn = document.createElement('button');
    this.muteBtn.className = 'hud-btn';
    this.muteBtn.textContent = this.actions.onGetMuted()
      ? s.btnAudioMuted
      : s.btnAudioOn;
    this.muteBtn.onclick = () => {
      const muted = this.actions.onToggleMute();
      const curr = i18n.getStrings();
      this.muteBtn.textContent = muted ? curr.btnAudioMuted : curr.btnAudioOn;
    };

    this.pauseBtn = document.createElement('button');
    this.pauseBtn.className = 'hud-btn';
    this.pauseBtn.textContent = s.btnPause;
    this.pauseBtn.onclick = () => this.actions.onTogglePause();

    btnGroup.append(
      this.skipPrologueBtn,
      this.codexBtn,
      this.langBtn,
      this.settingsBtn,
      this.muteBtn,
      this.pauseBtn
    );

    this.topBar.append(capBox, centerBox, btnGroup);
    this.root.appendChild(this.topBar);

    this.simCapNoteEl = capBox.querySelector('#hud-sim-note')!;
    this.capValueEl = capBox.querySelector('#hud-cap-val')!;
    this.nextTargetEl = capBox.querySelector('#hud-next-target')!;
    this.zoneBadgeEl = capBox.querySelector('#hud-zone-badge')!;
    this.comboBadgeEl = capBox.querySelector('#hud-combo-badge')!;
    this.orbsBadgeEl = capBox.querySelector('#hud-orbs-badge')!;
    this.timerBadgeEl = capBox.querySelector('#hud-timer-badge')!;
    this.progressLabelEl = centerBox.querySelector('#hud-progress-label')!;
    this.progressFillEl = centerBox.querySelector('#hud-progress-fill')!;
    this.heartsEl = centerBox.querySelector('#hud-hearts')!;

    this.simCapNoteEl.textContent = s.hudSimulatedCapNote;
    this.progressLabelEl.textContent = s.hudTowerProgress;
  }

  private buildFloatingBanners(): void {
    this.bannerEl = document.createElement('div');
    this.bannerEl.className = 'hud-glass';
    this.bannerEl.style.cssText =
      'position: absolute; top: 122px; left: 50%; transform: translateX(-50%); padding: 15px 28px; text-align: center; display: none; z-index: 30; min-width: 300px; max-width: 92vw;';
    this.root.appendChild(this.bannerEl);

    this.minorToastEl = document.createElement('div');
    this.minorToastEl.className = 'hud-glass';
    this.minorToastEl.style.cssText =
      'position: absolute; top: 196px; left: 50%; transform: translateX(-50%); padding: 8px 20px; text-align: center; display: none; z-index: 29; font-size: 14px; font-weight: 700; color: #e0f2fe; border-radius: 999px;';
    this.root.appendChild(this.minorToastEl);

    this.tutorialEl = document.createElement('div');
    this.tutorialEl.className = 'hud-glass';
    this.tutorialEl.style.cssText =
      'position: absolute; bottom: calc(148px + var(--safe-bottom, 0px)); left: 50%; transform: translateX(-50%); padding: 10px 22px; font-size: 14px; font-weight: 700; color: #a5f3fc; display: none; text-align: center; max-width: 90vw; z-index: 25;';
    this.root.appendChild(this.tutorialEl);
  }

  private buildTitleScreen(): void {
    this.titleOverlay = document.createElement('div');
    this.titleOverlay.style.cssText =
      'position: absolute; inset: 0; background: radial-gradient(circle at center, rgba(15, 23, 42, 0.5) 0%, rgba(2, 6, 23, 0.92) 100%); display: flex; align-items: center; justify-content: center; padding: 18px; pointer-events: auto; overflow-y: auto;';
    this.root.appendChild(this.titleOverlay);
    this.renderTitleScreenContent();
  }

  public renderTitleScreenContent(): void {
    const s = i18n.getStrings();
    const watchedPrologue =
      localStorage.getItem('mochi_prologue_watched') === 'true';
    const bestCap = Number(
      localStorage.getItem('mochi_best_cap_usd') || 100_000_000
    );
    const timeTrialUnlocked = SpiralTowerStage.isTimeTrialUnlocked();
    const bestTimeSec = SpiralTowerStage.getBestTimeTrialSeconds();
    const bestTimeDisplay =
      bestTimeSec !== null
        ? i18n.formatDuration(bestTimeSec)
        : s.noTimeTrialRecord;

    const card = document.createElement('div');
    card.className = 'hud-glass';
    card.style.cssText =
      'max-width: 660px; width: 100%; padding: 30px 28px; text-align: center;';

    card.innerHTML =
      '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">' +
      '<span style="padding:4px 14px; border-radius:999px; background:rgba(166,36,242,0.25); border:1px solid #c084fc; color:#e9d5ff; font-size:11px; font-weight:800;">' +
      s.communityBadge +
      '</span>' +
      '<div style="display:flex; gap:8px;">' +
      '<button id="title-lang-btn" class="hud-btn">' +
      s.changeLanguageBtn +
      ' · ' +
      i18n.getLocaleOption().nativeName +
      '</button>' +
      '<button id="title-settings-btn" class="hud-btn">' +
      s.openCosmeticsBtn +
      '</button>' +
      '</div></div>' +
      '<h1 style="font-size:36px; font-weight:900; margin:4px 0 6px 0; color:#19e6ff;">' +
      s.gameTitle +
      '</h1>' +
      '<div style="font-size:14px; color:#a5f3fc; font-weight:700; margin-bottom:12px;">' +
      s.gameSubtitle +
      '</div>' +
      '<p style="color:#cbd5e1; font-size:14px; line-height:1.62; margin:0 0 18px 0;">' +
      s.heroDescription +
      '</p>' +
      '<div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:10px; margin-bottom:20px;">' +
      '<div style="background:rgba(2,6,23,0.68); border-radius:12px; padding:10px 14px; font-size:12px; color:#94a3b8;">' +
      '🏆 ' +
      s.bestSimulatedCapLabel +
      '<div style="color:#19e6ff; font-size:16px; font-weight:900; margin-top:3px;">' +
      TowerMath.formatUSD(bestCap) +
      '</div></div>' +
      '<div style="background:rgba(2,6,23,0.68); border-radius:12px; padding:10px 14px; font-size:12px; color:#94a3b8;">' +
      '⏱️ ' +
      s.bestTimeTrialLabel +
      '<div style="color:#fbbf24; font-size:15px; font-weight:800; margin-top:3px;">' +
      bestTimeDisplay +
      '</div></div></div>' +
      '<div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap; margin-bottom:16px;">' +
      '<button id="btn-start-full" class="hud-btn hud-btn-primary">' +
      s.startFullAdventure +
      '</button>' +
      '<button id="btn-start-climb" class="hud-btn" style="padding:13px 20px; font-size:14px;">' +
      s.startTowerClimb +
      (watchedPrologue ? ' (' + s.unlockedTag + ')' : '') +
      '</button>' +
      '<button id="btn-start-timetrial" class="hud-btn" style="padding:13px 20px; font-size:14px; border-color:#fbbf24; color:#fde68a;" ' +
      (timeTrialUnlocked ? '' : 'disabled') +
      '>' +
      s.startTimeTrial +
      '</button>' +
      '<button id="btn-open-codex" class="hud-btn" style="padding:12px 18px; font-size:13px;">' +
      s.openCodexBtn +
      '</button>' +
      '</div>' +
      (!timeTrialUnlocked
        ? '<div style="font-size:12px; color:#fbbf24; margin-bottom:14px;">' +
          s.timeTrialLockedHint +
          '</div>'
        : '') +
      '<div style="border-top:1px solid rgba(255,255,255,0.12); padding-top:12px; font-size:11.5px; color:#94a3b8; line-height:1.55;">' +
      '<div><strong>' +
      s.characterCreditPrefix +
      '</strong>' +
      MOCHI_CREDITS.characterIP +
      ' (' +
      MOCHI_CREDITS.organization +
      ' & ' +
      MOCHI_CREDITS.characterDesigner +
      ')</div>' +
      '<div style="margin-top:3px;"><strong>' +
      s.dataCreditPrefix +
      '</strong>' +
      MOCHI_CREDITS.dataAttribution +
      '</div>' +
      '<div style="margin-top:3px; color:#64748b;">' +
      s.codexSimulationDisclaimer +
      '</div></div>';

    this.titleOverlay.innerHTML = '';
    this.titleOverlay.appendChild(card);

    card.querySelector('#btn-start-full')!.addEventListener('click', () => {
      this.titleOverlay.style.display = 'none';
      this.topBar.style.display = 'flex';
      this.skipPrologueBtn.style.display = 'inline-flex';
      this.actions.onStartAdventure(false, false);
    });

    card.querySelector('#btn-start-climb')!.addEventListener('click', () => {
      this.titleOverlay.style.display = 'none';
      this.topBar.style.display = 'flex';
      this.skipPrologueBtn.style.display = 'none';
      this.actions.onStartAdventure(true, false);
    });

    const ttBtn = card.querySelector(
      '#btn-start-timetrial'
    ) as HTMLButtonElement;
    if (ttBtn && timeTrialUnlocked) {
      ttBtn.addEventListener('click', () => {
        this.titleOverlay.style.display = 'none';
        this.topBar.style.display = 'flex';
        this.skipPrologueBtn.style.display = 'none';
        this.actions.onStartAdventure(true, true);
      });
    }

    card.querySelector('#btn-open-codex')!.addEventListener('click', () => {
      this.openCodexModal();
    });

    card.querySelector('#title-lang-btn')!.addEventListener('click', () => {
      this.showFirstTimeLanguageSelector();
    });

    card.querySelector('#title-settings-btn')!.addEventListener('click', () => {
      this.openSettingsModal();
    });
  }

  private buildModalContainer(): void {
    this.modalContainer = document.createElement('div');
    this.modalContainer.style.cssText =
      'position: absolute; inset: 0; background: rgba(2, 6, 23, 0.82); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); display: none; align-items: center; justify-content: center; padding: 18px; pointer-events: auto; z-index: 50; overflow-y: auto;';
    this.root.appendChild(this.modalContainer);
  }

  private buildFirstTimeLanguageModal(): void {
    this.langFirstTimeOverlay = document.createElement('div');
    this.langFirstTimeOverlay.style.cssText =
      'position: absolute; inset: 0; background: rgba(2, 6, 23, 0.9); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); display: none; align-items: center; justify-content: center; padding: 20px; pointer-events: auto; z-index: 60;';
    this.root.appendChild(this.langFirstTimeOverlay);
  }

  public showFirstTimeLanguageSelector(): void {
    const s = i18n.getStrings();
    const currentCode = i18n.getLocale();

    const langButtonsHtml = LOCALE_OPTIONS.map((opt) => {
      const active = opt.code === currentCode;
      return (
        '<button data-lang="' +
        opt.code +
        '" class="hud-btn" style="padding:14px 18px; font-size:15px; justify-content:space-between; width:100%; border-width:2px; border-color:' +
        (active ? '#19e6ff' : 'rgba(148,163,184,0.35)') +
        '; background:' +
        (active
          ? 'linear-gradient(90deg, rgba(166,36,242,0.45), rgba(14,165,233,0.45))'
          : 'rgba(15,23,42,0.85)') +
        ';">' +
        '<span><strong>' +
        opt.nativeName +
        '</strong> <span style="color:#94a3b8; font-size:12px; margin-left:6px;">(' +
        opt.englishName +
        ')</span></span>' +
        '<span class="hud-pill" style="color:#19e6ff;">' +
        opt.badge +
        (active ? ' ✓' : '') +
        '</span></button>'
      );
    }).join('');

    this.langFirstTimeOverlay.innerHTML =
      '<div class="hud-glass" style="max-width:460px; width:100%; padding:28px; text-align:center;">' +
      '<div style="font-size:28px; margin-bottom:6px;">🌐</div>' +
      '<h2 style="margin:0 0 8px 0; font-size:22px; color:#19e6ff;">' +
      s.langSelectTitle +
      '</h2>' +
      '<p style="font-size:13px; color:#cbd5e1; margin:0 0 18px 0; line-height:1.5;">' +
      s.langSelectSubtitle +
      '</p>' +
      '<div style="display:flex; flex-direction:column; gap:10px; margin-bottom:20px;">' +
      langButtonsHtml +
      '</div>' +
      '<button id="lang-confirm-btn" class="hud-btn hud-btn-primary" style="width:100%;">' +
      s.langSelectConfirm +
      '</button></div>';

    this.langFirstTimeOverlay.style.display = 'flex';

    this.langFirstTimeOverlay
      .querySelectorAll('button[data-lang]')
      .forEach((btn) => {
        btn.addEventListener('click', () => {
          const code = btn.getAttribute('data-lang') as SupportedLocale;
          i18n.setLocale(code, true);
          this.showFirstTimeLanguageSelector();
        });
      });

    this.langFirstTimeOverlay
      .querySelector('#lang-confirm-btn')!
      .addEventListener('click', () => {
        i18n.setLocale(i18n.getLocale(), true);
        this.langFirstTimeOverlay.style.display = 'none';
      });
  }

  private refreshAllLocalizedUI(): void {
    const s = i18n.getStrings();
    this.simCapNoteEl.textContent = s.hudSimulatedCapNote;
    this.progressLabelEl.textContent = s.hudTowerProgress;
    this.skipPrologueBtn.textContent = s.btnSkipPrologue;
    this.codexBtn.textContent = s.btnCodex;
    this.langBtn.textContent =
      s.changeLanguageBtn + ' (' + i18n.getLocaleOption().badge + ')';
    this.settingsBtn.textContent = s.btnSettings;
    this.muteBtn.textContent = this.actions.onGetMuted()
      ? s.btnAudioMuted
      : s.btnAudioOn;
    this.pauseBtn.textContent = s.btnPause;

    this.updateClimbStatus(
      this.lastCurrentCapUSD,
      this.lastPeakCapUSD,
      this.lastNextMilestone,
      this.lastProgressRatio,
      this.lastZone || undefined,
      this.lastCombo,
      this.lastOrbs,
      this.lastElapsedSeconds
    );
    this.updateHearts(this.lastHearts);

    if (this.titleOverlay.style.display !== 'none') {
      this.renderTitleScreenContent();
    }
  }

  public setSkipPrologueVisible(visible: boolean): void {
    this.skipPrologueBtn.style.display = visible ? 'inline-flex' : 'none';
  }

  public updateClimbStatus(
    currentCapUSD: number,
    peakCapUSD: number,
    nextMilestone: CryptoMilestone | null,
    progressRatio: number,
    zone?: TowerZoneSpec,
    combo: number = 0,
    orbs: number = 0,
    elapsedSeconds: number = 0
  ): void {
    this.lastCurrentCapUSD = currentCapUSD;
    this.lastPeakCapUSD = peakCapUSD;
    this.lastNextMilestone = nextMilestone;
    this.lastProgressRatio = progressRatio;
    if (zone) this.lastZone = zone;
    this.lastCombo = combo;
    this.lastOrbs = orbs;
    this.lastElapsedSeconds = elapsedSeconds;

    const s = i18n.getStrings();
    this.capValueEl.textContent = TowerMath.formatUSD(currentCapUSD);
    if (nextMilestone) {
      this.nextTargetEl.textContent =
        s.hudNextTargetPrefix +
        nextMilestone.symbol +
        ' (' +
        TowerMath.formatUSD(nextMilestone.recordMarketCapUSD) +
        ')';
    } else {
      this.nextTargetEl.textContent = s.hudSummitReached;
    }

    const activeZoneId = zone ? zone.id : 'CLOUD_RUINS';
    const zoneText = s.zones[activeZoneId];
    this.zoneBadgeEl.textContent = '🏔️ ' + zoneText.name;
    this.comboBadgeEl.textContent = '🔥 ' + s.hudComboPrefix + ' ×' + combo;
    this.orbsBadgeEl.textContent = '🌟 ' + s.hudOrbsPrefix + ': ' + orbs;
    this.timerBadgeEl.textContent =
      '⏱ ' + s.hudTimerPrefix + ': ' + i18n.formatDuration(elapsedSeconds);

    this.progressFillEl.style.width = (progressRatio * 100).toFixed(1) + '%';

    const savedBest = Number(localStorage.getItem('mochi_best_cap_usd') || 0);
    if (peakCapUSD > savedBest) {
      localStorage.setItem('mochi_best_cap_usd', String(Math.floor(peakCapUSD)));
    }
  }

  public updateHearts(hearts: number): void {
    this.lastHearts = hearts;
    const s = i18n.getStrings();
    this.heartsEl.textContent =
      s.hudShieldsLabel +
      ': ' +
      '🐾 '.repeat(Math.max(0, hearts)) +
      '🖤 '.repeat(Math.max(0, 3 - hearts));
  }

  public showTutorialHint(text: string | null): void {
    if (!text) {
      this.tutorialEl.style.display = 'none';
    } else {
      this.tutorialEl.textContent = text;
      this.tutorialEl.style.display = 'block';
    }
  }

  public showHistoryMilestoneToast(
    item: GenLayerMilestone,
    index: number,
    total: number
  ): void {
    const s = i18n.getStrings();
    const loc = i18n.getMilestoneText(item);

    this.bannerEl.style.borderColor = item.accentColor;
    this.bannerEl.innerHTML =
      '<div style="font-size:12px; color:' +
      item.accentColor +
      '; font-weight:800;">' +
      s.historyGatePrefix +
      ' (' +
      index +
      '/' +
      total +
      ') • ' +
      item.date +
      ' [' +
      loc.dateKindLabel +
      ']</div>' +
      '<div style="font-size:20px; font-weight:900; margin:4px 0;">' +
      loc.title +
      '</div>' +
      '<div style="font-size:13.5px; color:#cbd5e1; max-width:560px; margin:0 auto;">' +
      loc.summary +
      '</div>' +
      '<div style="font-size:11px; color:#94a3b8; margin-top:5px;">' +
      loc.note +
      '</div>';
    this.triggerBannerAnimation();
  }

  public showEarlySimMilestoneToast(sim: SimulationProgressMilestone): void {
    const s = i18n.getStrings();
    const loc = i18n.getEarlySimMilestoneText(sim);

    this.bannerEl.style.borderColor = sim.badgeColor;
    this.bannerEl.innerHTML =
      '<div style="font-size:12px; color:' +
      sim.badgeColor +
      '; font-weight:800;">' +
      s.earlySimRewardTag +
      '</div>' +
      '<div style="font-size:20px; font-weight:900; color:#ffffff; margin:4px 0;">' +
      loc.title +
      ' (' +
      TowerMath.formatUSD(sim.thresholdUSD) +
      ')</div>' +
      '<div style="font-size:12px; color:#fbbf24;">' +
      loc.disclaimer +
      '</div>';
    this.triggerBannerAnimation();
  }

  public showSurpassCelebrationBanner(
    coin: CryptoMilestone,
    index: number,
    total: number,
    isMajor: boolean = true
  ): void {
    const s = i18n.getStrings();
    if (!isMajor) {
      // Lightweight non-intrusive toast for minor milestones
      this.minorToastEl.style.borderColor = coin.brandColor;
      this.minorToastEl.textContent =
        '[' +
        index +
        '/' +
        total +
        '] ' +
        i18n.format(s.surpassMinorToast, {
          symbol: coin.symbol,
          cap: TowerMath.formatUSD(coin.recordMarketCapUSD)
        });
      this.triggerMinorToastAnimation();
      return;
    }

    const titleText = i18n.format(s.surpassMajorBannerTitle, {
      symbol: coin.symbol
    });

    this.bannerEl.style.borderColor = coin.brandColor;
    this.bannerEl.innerHTML =
      '<div style="font-size:12px; color:#a5f3fc; font-weight:800;">' +
      s.checkpointActivatedTag +
      ' (' +
      index +
      '/' +
      total +
      ')</div>' +
      '<div style="font-size:22px; font-weight:900; color:' +
      coin.brandColor +
      '; margin:5px 0;">' +
      titleText +
      '</div>' +
      '<div style="font-size:13.5px; color:#f8fafc;">' +
      s.recordCapPrefix +
      '<strong>' +
      TowerMath.formatUSD(coin.recordMarketCapUSD) +
      '</strong> • ' +
      s.recordDatePrefix +
      coin.recordDateUTC +
      '</div>';
    this.triggerBannerAnimation();
  }

  public showZoneEnteredBanner(zone: TowerZoneSpec): void {
    const s = i18n.getStrings();
    const zText = s.zones[zone.id];
    this.minorToastEl.style.borderColor =
      '#' + zone.accentColor.toString(16).padStart(6, '0');
    this.minorToastEl.textContent =
      i18n.format(s.zoneEnteredBanner, { zoneName: zText.name }) +
      ' — ' +
      zText.subtitle;
    this.triggerMinorToastAnimation();
  }

  public showQuickEventToast(message: string, borderColor = '#19e6ff'): void {
    this.minorToastEl.style.borderColor = borderColor;
    this.minorToastEl.textContent = message;
    this.triggerMinorToastAnimation();
  }

  private triggerBannerAnimation(): void {
    this.bannerEl.style.display = 'block';
    this.bannerEl.classList.remove('surpass-banner-anim');
    void this.bannerEl.offsetWidth;
    this.bannerEl.classList.add('surpass-banner-anim');
  }

  private triggerMinorToastAnimation(): void {
    this.minorToastEl.style.display = 'block';
    this.minorToastEl.classList.remove('minor-toast-anim');
    void this.minorToastEl.offsetWidth;
    this.minorToastEl.classList.add('minor-toast-anim');
  }

  public openCodexModal(): void {
    const s = i18n.getStrings();

    const historyRows = GENLAYER_HISTORY_MILESTONES.map((h, idx) => {
      const loc = i18n.getMilestoneText(h);
      const pubExtra = h.publishedDate
        ? ' | ' + s.codexPublishedDateLabel + ': ' + h.publishedDate
        : '';
      return (
        '<div style="padding:11px; border-bottom:1px solid rgba(255,255,255,0.08);">' +
        '<div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">' +
        '<span style="font-weight:800; color:' +
        h.accentColor +
        ';">' +
        (idx + 1) +
        '. ' +
        h.date +
        ' — ' +
        loc.title +
        '</span>' +
        '<span class="hud-pill" style="font-size:11px; color:#cbd5e1;">' +
        loc.dateKindLabel +
        pubExtra +
        '</span></div>' +
        '<div style="font-size:13px; color:#e2e8f0; margin:5px 0;">' +
        loc.summary +
        '</div>' +
        '<div style="font-size:11.5px; color:#94a3b8; margin-bottom:4px;">💡 ' +
        loc.note +
        '</div>' +
        '<a href="' +
        h.sourceUrl +
        '" target="_blank" rel="noopener noreferrer" style="font-size:12px; color:#38bdf8; text-decoration:none;">' +
        s.codexSourceLinkLabel +
        ' (' +
        h.sourceLabel +
        ')</a></div>'
      );
    }).join('');

    const coinRows = CRYPTO_MARKET_CAP_MILESTONES.map((c, idx) => {
      return (
        '<div style="padding:11px; border-bottom:1px solid rgba(255,255,255,0.08);">' +
        '<div style="display:flex; justify-content:space-between; font-weight:800; gap:8px; flex-wrap:wrap;">' +
        '<span style="color:' +
        c.brandColor +
        ';">' +
        (idx + 1) +
        '. ' +
        c.name +
        ' (' +
        c.symbol +
        ')' +
        (c.isMajorCheckpoint ? ' ★' : '') +
        '</span>' +
        '<span style="color:#19e6ff;">' +
        TowerMath.formatUSD(c.recordMarketCapUSD) +
        '</span></div>' +
        '<div style="font-size:11.5px; color:#cbd5e1; margin-top:3px;">' +
        s.recordDatePrefix +
        '<strong>' +
        c.recordDateUTC +
        '</strong> | ' +
        s.codexCoverageLabel +
        ': ' +
        c.coverageStartUTC +
        ' → ' +
        c.coverageEndUTC +
        ' (' +
        s.codexObservationsLabel +
        ': ' +
        c.dailyObservationCount +
        ')</div>' +
        '<div style="font-size:11px; color:#64748b; margin-top:2px; word-break:break-all;">' +
        s.codexHashLabel +
        ': ' +
        c.rawResponseSHA256.slice(0, 24) +
        '… • <a href="' +
        c.sourceUrl +
        '" target="_blank" rel="noopener noreferrer" style="color:#38bdf8;">Coin Metrics API (CapMrktEstUSD)</a></div></div>'
      );
    }).join('');

    this.modalContainer.innerHTML =
      '<div class="hud-glass" style="max-width:920px; width:100%; max-height:86vh; display:flex; flex-direction:column; padding:22px;">' +
      '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; gap:12px;">' +
      '<h2 style="margin:0; font-size:19px; color:#19e6ff;">' +
      s.codexTitle +
      '</h2>' +
      '<button id="codex-close" class="hud-btn">' +
      s.codexClose +
      '</button></div>' +
      '<div style="font-size:12px; color:#cbd5e1; background:rgba(2,6,23,0.75); padding:11px 15px; border-radius:12px; margin-bottom:12px; line-height:1.55;">' +
      '<div><strong>' +
      s.codexMethodologyTitle +
      '</strong>' +
      s.codexMethodologyBody +
      '</div>' +
      '<div style="margin-top:4px;"><strong>' +
      s.codexScopeWarningTitle +
      '</strong>' +
      s.codexScopeWarningBody +
      '</div>' +
      '<div style="margin-top:4px;"><strong>' +
      s.codexDateRuleTitle +
      '</strong>' +
      s.codexDateRuleBody +
      '</div>' +
      '<div style="margin-top:4px; color:#a5f3fc;">' +
      s.codexMetaSummary +
      '</div>' +
      '<div style="margin-top:4px; color:#fbbf24;"><strong>⚠️ </strong>' +
      s.codexSimulationDisclaimer +
      '</div>' +
      '<div style="margin-top:6px; display:flex; gap:16px; flex-wrap:wrap; align-items:center;">' +
      '<span style="color:#94a3b8;">' +
      s.codexAttributionLine +
      '</span>' +
      '<a href="' +
      MARKET_CAP_DATASET_META.methodologyUrl +
      '" target="_blank" rel="noopener noreferrer" style="color:#38bdf8;">' +
      s.codexMethodologyLink +
      '</a>' +
      '<a href="' +
      MARKET_CAP_DATASET_META.licenseUrl +
      '" target="_blank" rel="noopener noreferrer" style="color:#38bdf8;">' +
      s.codexLicenseLink +
      '</a></div></div>' +
      '<div class="codex-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:16px; overflow-y:auto; padding-right:6px;">' +
      '<div><h3 style="font-size:15px; color:#a5f3fc; margin-top:0; position:sticky; top:0; background:#0b1325; padding:6px 0;">' +
      s.codexTabHistory +
      '</h3>' +
      historyRows +
      '</div>' +
      '<div><h3 style="font-size:15px; color:#c084fc; margin-top:0; position:sticky; top:0; background:#0b1325; padding:6px 0;">' +
      s.codexTabMarketCap +
      '</h3>' +
      coinRows +
      '</div></div></div>';

    this.modalContainer.style.display = 'flex';
    this.modalContainer
      .querySelector('#codex-close')!
      .addEventListener('click', () => {
        this.modalContainer.style.display = 'none';
      });
  }

  public openSettingsModal(onBackToPause?: () => void): void {
    const s = i18n.getStrings();
    const currentLang = i18n.getLocale();
    const isMuted = this.actions.onGetMuted();
    const currentVol = Math.round(this.actions.onGetVolume() * 100);
    const isReducedMotion = this.actions.onGetReducedMotion();
    const quality = this.actions.onGetGraphicsQuality();
    const unlockedCosmetics = new Set(this.actions.onGetUnlockedCosmetics());
    const equippedCosmetic = this.actions.onGetEquippedCosmetic();

    const langBtns = LOCALE_OPTIONS.map((opt) => {
      const active = opt.code === currentLang;
      return (
        '<button data-set-lang="' +
        opt.code +
        '" class="hud-btn" style="border-color:' +
        (active ? '#19e6ff' : 'rgba(148,163,184,0.35)') +
        '; background:' +
        (active ? 'rgba(14,165,233,0.32)' : 'rgba(15,23,42,0.85)') +
        ';">' +
        opt.nativeName +
        ' (' +
        opt.badge +
        ')</button>'
      );
    }).join('');

    const cosmeticIds: MochiCosmeticId[] = [
      'default',
      'auroraVisor',
      'starlightCape',
      'goldenCrown'
    ];
    const cosmeticCards = cosmeticIds
      .map((cid) => {
        const unlocked = unlockedCosmetics.has(cid);
        const equipped = equippedCosmetic === cid;
        const cText = s.cosmetics[cid];
        return (
          '<div style="background:rgba(2,6,23,0.68); border:1.5px solid ' +
          (equipped
            ? '#19e6ff'
            : unlocked
            ? 'rgba(192,132,252,0.45)'
            : 'rgba(148,163,184,0.2)') +
          '; border-radius:12px; padding:10px 12px; display:flex; justify-content:space-between; align-items:center; gap:10px;">' +
          '<div style="text-align:left;">' +
          '<div style="font-size:13.5px; font-weight:800; color:' +
          (unlocked ? '#f8fafc' : '#64748b') +
          ';">' +
          cText.name +
          '</div>' +
          '<div style="font-size:11.5px; color:#94a3b8; margin-top:2px;">' +
          cText.desc +
          '</div></div>' +
          '<button data-cosmetic="' +
          cid +
          '" class="hud-btn" ' +
          (unlocked ? '' : 'disabled') +
          ' style="min-width:78px;">' +
          (equipped ? '✓' : unlocked ? s.unlockedTag : '🔒') +
          '</button></div>'
        );
      })
      .join('');

    this.modalContainer.innerHTML =
      '<div class="hud-glass" style="max-width:580px; width:100%; max-height:86vh; overflow-y:auto; padding:24px;">' +
      '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">' +
      '<h2 style="margin:0; font-size:20px; color:#19e6ff;">' +
      s.settingsTitle +
      '</h2>' +
      '<button id="settings-close" class="hud-btn">' +
      s.settingsCloseBtn +
      '</button></div>' +
      '<div style="margin-bottom:16px;">' +
      '<div style="font-size:13px; font-weight:800; color:#a5f3fc; margin-bottom:8px;">' +
      s.settingsLanguageLabel +
      '</div>' +
      '<div style="display:flex; gap:8px; flex-wrap:wrap;">' +
      langBtns +
      '</div></div>' +
      '<div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px;">' +
      '<div style="background:rgba(2,6,23,0.6); padding:12px; border-radius:12px;">' +
      '<div style="font-size:12.5px; color:#cbd5e1; margin-bottom:8px;">' +
      s.settingsAudioLabel +
      '</div>' +
      '<button id="set-toggle-mute" class="hud-btn" style="width:100%;">' +
      (isMuted ? s.btnAudioMuted : s.btnAudioOn) +
      '</button>' +
      '<div style="font-size:12px; color:#94a3b8; margin:10px 0 4px 0;">' +
      s.settingsVolumeLabel +
      ': <span id="vol-pct">' +
      currentVol +
      '%</span></div>' +
      '<input id="set-vol-slider" type="range" min="0" max="100" value="' +
      currentVol +
      '" style="width:100%; pointer-events:auto; cursor:pointer;" /></div>' +
      '<div style="background:rgba(2,6,23,0.6); padding:12px; border-radius:12px; display:flex; flex-direction:column; justify-content:space-between; gap:8px;">' +
      '<div><div style="font-size:12.5px; color:#cbd5e1; margin-bottom:6px;">' +
      s.settingsGraphicsLabel +
      '</div>' +
      '<button id="set-toggle-quality" class="hud-btn" style="width:100%;">' +
      (quality === 'HIGH' ? s.btnQualityHigh : s.btnQualityLow) +
      '</button></div>' +
      '<div><div style="font-size:12px; color:#94a3b8; margin-bottom:6px;">' +
      s.settingsReducedMotionLabel +
      '</div>' +
      '<button id="set-toggle-motion" class="hud-btn" style="width:100%;">' +
      (isReducedMotion ? s.btnMotionReduced : s.btnMotionStandard) +
      '</button></div></div></div>' +
      '<div>' +
      '<div style="font-size:14px; font-weight:800; color:#e9d5ff; margin-bottom:4px;">' +
      s.settingsCosmeticsTitle +
      '</div>' +
      '<div style="font-size:12px; color:#94a3b8; margin-bottom:10px;">' +
      s.settingsCosmeticsHint +
      '</div>' +
      '<div style="display:flex; flex-direction:column; gap:8px;">' +
      cosmeticCards +
      '</div></div></div>';

    this.modalContainer.style.display = 'flex';

    this.modalContainer
      .querySelectorAll('button[data-set-lang]')
      .forEach((btn) => {
        btn.addEventListener('click', () => {
          const code = btn.getAttribute('data-set-lang') as SupportedLocale;
          i18n.setLocale(code, true);
          this.openSettingsModal(onBackToPause);
        });
      });

    this.modalContainer
      .querySelector('#set-toggle-mute')!
      .addEventListener('click', () => {
        this.actions.onToggleMute();
        this.openSettingsModal(onBackToPause);
      });

    const volSlider = this.modalContainer.querySelector(
      '#set-vol-slider'
    ) as HTMLInputElement;
    const volPct = this.modalContainer.querySelector('#vol-pct')!;
    volSlider.addEventListener('input', () => {
      const val = Number(volSlider.value);
      volPct.textContent = val + '%';
      this.actions.onSetVolume(val / 100);
    });

    this.modalContainer
      .querySelector('#set-toggle-quality')!
      .addEventListener('click', () => {
        this.actions.onToggleGraphicsQuality();
        this.openSettingsModal(onBackToPause);
      });

    this.modalContainer
      .querySelector('#set-toggle-motion')!
      .addEventListener('click', () => {
        this.actions.onToggleReducedMotion();
        this.openSettingsModal(onBackToPause);
      });

    this.modalContainer
      .querySelectorAll('button[data-cosmetic]')
      .forEach((btn) => {
        btn.addEventListener('click', () => {
          const cid = btn.getAttribute('data-cosmetic') as MochiCosmeticId;
          if (unlockedCosmetics.has(cid)) {
            this.actions.onEquipCosmetic(cid);
            this.openSettingsModal(onBackToPause);
          }
        });
      });

    this.modalContainer
      .querySelector('#settings-close')!
      .addEventListener('click', () => {
        if (onBackToPause) {
          onBackToPause();
        } else {
          this.modalContainer.style.display = 'none';
        }
      });
  }

  public showPauseModal(onResume: () => void): void {
    const s = i18n.getStrings();

    this.modalContainer.innerHTML =
      '<div class="hud-glass" style="max-width:430px; width:100%; padding:28px; text-align:center;">' +
      '<h2 style="margin:0 0 16px 0; color:#19e6ff;">' +
      s.pauseTitle +
      '</h2>' +
      '<div style="display:flex; flex-direction:column; gap:11px;">' +
      '<button id="pause-resume" class="hud-btn hud-btn-primary">' +
      s.pauseResumeBtn +
      '</button>' +
      '<button id="pause-checkpoint" class="hud-btn">' +
      s.pauseRetryCheckpointBtn +
      '</button>' +
      '<button id="pause-restart-tower" class="hud-btn">' +
      s.pauseRestartTowerBtn +
      '</button>' +
      '<button id="pause-replay-prologue" class="hud-btn">' +
      s.pauseReplayPrologueBtn +
      '</button>' +
      '<button id="pause-settings" class="hud-btn">' +
      s.pauseSettingsBtn +
      '</button></div>' +
      '<div style="margin-top:16px; font-size:11px; color:#94a3b8;">' +
      MOCHI_CREDITS.characterIP +
      ' by ' +
      MOCHI_CREDITS.organization +
      ' & ' +
      MOCHI_CREDITS.characterDesigner +
      '</div></div>';

    this.modalContainer.style.display = 'flex';

    this.modalContainer
      .querySelector('#pause-resume')!
      .addEventListener('click', () => {
        this.modalContainer.style.display = 'none';
        onResume();
      });
    this.modalContainer
      .querySelector('#pause-checkpoint')!
      .addEventListener('click', () => {
        this.modalContainer.style.display = 'none';
        this.actions.onRetryFromCheckpoint();
      });
    this.modalContainer
      .querySelector('#pause-restart-tower')!
      .addEventListener('click', () => {
        this.modalContainer.style.display = 'none';
        this.actions.onRestartClimbFull(false);
      });
    this.modalContainer
      .querySelector('#pause-replay-prologue')!
      .addEventListener('click', () => {
        this.modalContainer.style.display = 'none';
        this.actions.onReplayPrologue();
      });
    this.modalContainer
      .querySelector('#pause-settings')!
      .addEventListener('click', () => {
        this.openSettingsModal(() => this.showPauseModal(onResume));
      });
  }

  public showFailRetryModal(peakCapUSD: number, checkpointName: string): void {
    const s = i18n.getStrings();
    const retryBtnText = i18n.format(s.failRetryCheckpointBtn, {
      checkpoint: checkpointName
    });

    this.modalContainer.innerHTML =
      '<div class="hud-glass" style="max-width:450px; width:100%; padding:28px; text-align:center;">' +
      '<h2 style="margin:0 0 10px 0; color:#fb7185;">' +
      s.failTitle +
      '</h2>' +
      '<p style="font-size:14px; color:#cbd5e1; margin-bottom:18px; line-height:1.6;">' +
      s.failPeakCapLabel +
      '<strong style="color:#19e6ff;">' +
      TowerMath.formatUSD(peakCapUSD) +
      '</strong><br/>' +
      s.failCheckpointLabel +
      '<strong style="color:#c084fc;">' +
      checkpointName +
      '</strong></p>' +
      '<div style="display:flex; flex-direction:column; gap:12px;">' +
      '<button id="fail-retry-cp" class="hud-btn hud-btn-primary">' +
      retryBtnText +
      '</button>' +
      '<button id="fail-restart-tower" class="hud-btn">' +
      s.failRestartTowerBtn +
      '</button>' +
      '</div></div>';

    this.modalContainer.style.display = 'flex';

    this.modalContainer
      .querySelector('#fail-retry-cp')!
      .addEventListener('click', () => {
        this.modalContainer.style.display = 'none';
        this.actions.onRetryFromCheckpoint();
      });
    this.modalContainer
      .querySelector('#fail-restart-tower')!
      .addEventListener('click', () => {
        this.modalContainer.style.display = 'none';
        this.actions.onRestartClimbFull(false);
      });
  }

  public showSummitVictoryModal(stats: TowerSummitStats): void {
    const s = i18n.getStrings();
    const posterCanvas = this.generateSharePosterCanvas(stats);
    const dataUrl = posterCanvas.toDataURL('image/png');

    this.modalContainer.innerHTML =
      '<div class="hud-glass" style="max-width:600px; width:100%; padding:26px; text-align:center;">' +
      '<div style="font-size:13px; color:#fbbf24; font-weight:800;">' +
      (stats.isTimeTrial ? s.victoryTimeTrialBadge : s.victoryBadge) +
      '</div>' +
      '<h2 style="margin:6px 0 8px 0; font-size:24px; color:#19e6ff;">' +
      s.victoryTitle +
      '</h2>' +
      (stats.isNewBestTime
        ? '<div style="font-size:13px; color:#34d399; font-weight:800; margin-bottom:8px;">' +
          s.victoryNewBestTime +
          ' (' +
          i18n.formatDuration(stats.totalTimeSeconds) +
          ')</div>'
        : '') +
      '<img src="' +
      dataUrl +
      '" alt="Mochi Summit Share Poster" style="width:100%; max-width:480px; border-radius:14px; border:2px solid #19e6ff; margin-bottom:16px;" />' +
      '<div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">' +
      '<a id="download-poster" href="' +
      dataUrl +
      '" download="Mochi-Sky-Journey-Victory-' +
      i18n.getLocale() +
      '.png" class="hud-btn hud-btn-primary" style="text-decoration:none;">' +
      s.victoryDownloadPosterBtn +
      '</a>' +
      '<button id="summit-play-again" class="hud-btn">' +
      s.victoryPlayAgainBtn +
      '</button>' +
      '<button id="summit-start-timetrial" class="hud-btn" style="border-color:#fbbf24; color:#fde68a;">' +
      s.victoryStartTimeTrialBtn +
      '</button>' +
      '</div></div>';

    this.modalContainer.style.display = 'flex';

    this.modalContainer
      .querySelector('#summit-play-again')!
      .addEventListener('click', () => {
        this.modalContainer.style.display = 'none';
        this.actions.onRestartClimbFull(false);
      });

    this.modalContainer
      .querySelector('#summit-start-timetrial')!
      .addEventListener('click', () => {
        this.modalContainer.style.display = 'none';
        this.actions.onRestartClimbFull(true);
      });
  }

  private generateSharePosterCanvas(stats: TowerSummitStats): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 540;
    const ctx = canvas.getContext('2d')!;
    const s = i18n.getStrings();
    const fontStack = i18n.getLocaleOption().fontFamily;

    const grad = ctx.createLinearGradient(0, 0, 900, 540);
    grad.addColorStop(0, '#070b14');
    grad.addColorStop(0.55, '#1e1b4b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 900, 540);

    ctx.strokeStyle = '#19e6ff';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 860, 500);

    // Draw Mochi celebratory mascot portrait on the right
    const cx = 718;
    const cy = 248;

    // Purple Cat Ears
    ctx.fillStyle = '#b429f9';
    ctx.beginPath();
    ctx.moveTo(cx - 82, cy - 52);
    ctx.lineTo(cx - 112, cy - 148);
    ctx.lineTo(cx - 28, cy - 92);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx + 82, cy - 52);
    ctx.lineTo(cx + 112, cy - 148);
    ctx.lineTo(cx + 28, cy - 92);
    ctx.closePath();
    ctx.fill();

    // Golden Crown on top of Mochi's helmet
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(cx - 38, cy - 102);
    ctx.lineTo(cx - 28, cy - 136);
    ctx.lineTo(cx - 12, cy - 114);
    ctx.lineTo(cx, cy - 144);
    ctx.lineTo(cx + 12, cy - 114);
    ctx.lineTo(cx + 28, cy - 136);
    ctx.lineTo(cx + 38, cy - 102);
    ctx.closePath();
    ctx.fill();

    // Helmet shell
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 108, 0, Math.PI * 2);
    ctx.fill();

    // Visor bezel & curved screen
    ctx.strokeStyle = '#8c8f9c';
    ctx.lineWidth = 11;
    ctx.beginPath();
    ctx.arc(cx, cy + 5, 90, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#132332';
    ctx.beginPath();
    ctx.arc(cx, cy + 5, 84, 0, Math.PI * 2);
    ctx.fill();

    // Forehead GenLayer crest
    ctx.fillStyle = '#19e6ff';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 56);
    ctx.lineTo(cx + 21, cy - 18);
    ctx.lineTo(cx - 21, cy - 18);
    ctx.closePath();
    ctx.fill();

    // Joyful happy-arc eyes (^ ^) & cat smile
    ctx.strokeStyle = '#19e6ff';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx - 36, cy + 6, 17, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 36, cy + 6, 17, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx - 14, cy + 35, 14, 0.15 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 14, cy + 35, 14, 0.1 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    // Poster Text Content (Left side, localized with wrap guard)
    ctx.fillStyle = '#19e6ff';
    ctx.font = 'bold 19px ' + fontStack;
    ctx.fillText(s.posterHeaderTag, 52, 72, 510);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px ' + fontStack;
    ctx.fillText(s.posterMainTitle, 52, 128, 510);

    ctx.fillStyle = '#f7931a';
    ctx.font = 'bold 23px ' + fontStack;
    ctx.fillText(s.posterPeakCapLine, 52, 176, 510);

    const timeText = i18n.format(s.posterTimeLine, {
      time: i18n.formatDuration(stats.totalTimeSeconds)
    });
    const surpassedText = i18n.format(s.posterSurpassedLine, {
      count: stats.surpassedCount
    });
    const collectiblesText = i18n.format(s.posterCollectiblesLine, {
      orbs: stats.collectedOrbs,
      combo: stats.maxCombo
    });
    const retriesText = i18n.format(s.posterRetriesLine, {
      retries: stats.retriesUsed,
      mode: stats.isTimeTrial ? 'Time Trial' : 'Adventure'
    });

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '21px ' + fontStack;
    ctx.fillText(timeText, 52, 236, 510);
    ctx.fillText(surpassedText, 52, 278, 510);
    ctx.fillText(collectiblesText, 52, 320, 510);
    ctx.fillText(retriesText, 52, 362, 510);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13.5px ' + fontStack;
    ctx.fillText(
      MOCHI_CREDITS.characterIP +
        ' by ' +
        MOCHI_CREDITS.organization +
        ' & ' +
        MOCHI_CREDITS.characterDesigner +
        '  |  ' +
        MOCHI_CREDITS.dataAttribution,
      52,
      432,
      796
    );

    ctx.fillStyle = '#64748b';
    ctx.font = '12.5px ' + fontStack;
    i18n.wrapCanvasText(ctx, s.posterFootnoteLine, 52, 462, 796, 20, 2);

    return canvas;
  }
}
