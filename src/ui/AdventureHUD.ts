import { MOCHI_CREDITS } from '../config/credits';
import { TowerMath } from '../core/TowerMath';
import {
  CRYPTO_MARKET_CAP_MILESTONES,
  CryptoMilestone,
  MARKET_CAP_DATASET_META
} from '../data/cryptoMarketCaps';
import {
  GENLAYER_HISTORY_MILESTONES,
  GenLayerMilestone
} from '../data/genlayerHistory';

export interface HUDActions {
  onStartAdventure: (skipPrologue: boolean) => void;
  onSkipPrologue: () => void;
  onTogglePause: () => void;
  onToggleMute: () => boolean;
  onToggleReducedMotion: () => boolean;
  onRetryFromCheckpoint: () => void;
  onRestartClimbFull: () => void;
  onReplayPrologue: () => void;
}

export class AdventureHUD {
  private readonly root: HTMLElement;
  private readonly actions: HUDActions;

  private titleOverlay!: HTMLElement;
  private topBar!: HTMLElement;
  private capValueEl!: HTMLElement;
  private nextTargetEl!: HTMLElement;
  private progressFillEl!: HTMLElement;
  private heartsEl!: HTMLElement;
  private skipPrologueBtn!: HTMLButtonElement;
  private muteBtn!: HTMLButtonElement;
  private motionBtn!: HTMLButtonElement;

  private bannerEl!: HTMLElement;
  private tutorialEl!: HTMLElement;
  private modalContainer!: HTMLElement;

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
  }

  private injectStyles(): void {
    const style = document.createElement('style');
    style.textContent = [
      '#mochi-adventure-hud { position: fixed; inset: 0; pointer-events: none; font-family: system-ui, -apple-system, sans-serif; color: #f8fafc; z-index: 20; }',
      '.hud-glass { background: linear-gradient(135deg, rgba(15, 23, 42, 0.84), rgba(30, 27, 75, 0.8)); backdrop-filter: blur(10px); border: 1.5px solid rgba(25, 230, 255, 0.35); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45); border-radius: 18px; }',
      '.hud-btn { pointer-events: auto; cursor: pointer; border: 1.5px solid rgba(25, 230, 255, 0.55); background: rgba(15, 23, 42, 0.85); color: #e2e8f0; padding: 8px 16px; border-radius: 999px; font-weight: 700; font-size: 13px; transition: all 0.2s ease; }',
      '.hud-btn:hover { background: linear-gradient(90deg, #a624f2, #0ea5e9); color: #ffffff; border-color: #ffffff; transform: translateY(-1px); }',
      '.hud-btn-primary { background: linear-gradient(135deg, #a624f2 0%, #06b6d4 100%); color: #ffffff; font-size: 16px; padding: 14px 28px; border: 2px solid #a5f3fc; box-shadow: 0 0 24px rgba(25, 230, 255, 0.4); }',
      '@keyframes popBanner { 0% { transform: translate(-50%, -20px) scale(0.8); opacity: 0; } 15% { transform: translate(-50%, 0) scale(1.04); opacity: 1; } 85% { transform: translate(-50%, 0) scale(1); opacity: 1; } 100% { transform: translate(-50%, -15px) scale(0.95); opacity: 0; } }',
      '.surpass-banner-anim { animation: popBanner 2.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }'
    ].join('\n');
    document.head.appendChild(style);
  }

  private buildTopAdventureBar(): void {
    this.topBar = document.createElement('div');
    this.topBar.className = 'hud-glass';
    this.topBar.style.cssText =
      'position: absolute; top: 16px; left: 16px; right: 16px; padding: 12px 20px; display: none; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;';

    const capBox = document.createElement('div');
    capBox.innerHTML =
      '<div style="font-size:11px; color:#94a3b8;">游戏模拟市值进度 (起点 $100M，非真实市值/预测)</div>' +
      '<div style="display:flex; align-items:baseline; gap:12px; margin-top:2px;">' +
      '<span id="hud-cap-val" style="font-size:24px; font-weight:900; color:#19e6ff;">$100.0M (1.00亿)</span>' +
      '<span id="hud-next-target" style="font-size:13px; color:#cbd5e1;">下一目标: NEAR ($12.80B)</span>' +
      '</div>';

    const centerBox = document.createElement('div');
    centerBox.style.cssText = 'flex: 1; min-width: 200px; max-width: 360px;';
    centerBox.innerHTML =
      '<div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">' +
      '<span id="hud-hearts" style="color:#f43f5e; font-weight:800;">🐾 🐾 🐾</span>' +
      '<span style="color:#a5f3fc;">通天进度 (目标: BTC 顶点)</span>' +
      '</div>' +
      '<div style="height:10px; background:rgba(15,23,42,0.9); border-radius:999px; overflow:hidden; border:1px solid rgba(255,255,255,0.15);">' +
      '<div id="hud-progress-fill" style="width:0%; height:100%; background:linear-gradient(90deg, #a624f2, #19e6ff); transition:width 0.15s linear;"></div>' +
      '</div>';

    const btnGroup = document.createElement('div');
    btnGroup.style.cssText = 'display:flex; gap:8px; align-items:center; flex-wrap:wrap;';

    this.skipPrologueBtn = document.createElement('button');
    this.skipPrologueBtn.className = 'hud-btn';
    this.skipPrologueBtn.textContent = '跳过序章 ⏭';
    this.skipPrologueBtn.onclick = () => this.actions.onSkipPrologue();

    const codexBtn = document.createElement('button');
    codexBtn.className = 'hud-btn';
    codexBtn.textContent = '📖 历史与数据图鉴';
    codexBtn.onclick = () => this.openCodexModal();

    this.muteBtn = document.createElement('button');
    this.muteBtn.className = 'hud-btn';
    this.muteBtn.textContent = '🔊 音乐';
    this.muteBtn.onclick = () => {
      const muted = this.actions.onToggleMute();
      this.muteBtn.textContent = muted ? '🔇 静音' : '🔊 音乐';
    };

    this.motionBtn = document.createElement('button');
    this.motionBtn.className = 'hud-btn';
    this.motionBtn.textContent = '✨ 标准特效';
    this.motionBtn.onclick = () => {
      const reduced = this.actions.onToggleReducedMotion();
      this.motionBtn.textContent = reduced ? '🌿 减弱动态' : '✨ 标准特效';
    };

    const pauseBtn = document.createElement('button');
    pauseBtn.className = 'hud-btn';
    pauseBtn.textContent = '⏸ 暂停';
    pauseBtn.onclick = () => this.actions.onTogglePause();

    btnGroup.append(
      this.skipPrologueBtn,
      codexBtn,
      this.muteBtn,
      this.motionBtn,
      pauseBtn
    );

    this.topBar.append(capBox, centerBox, btnGroup);
    this.root.appendChild(this.topBar);

    this.capValueEl = capBox.querySelector('#hud-cap-val')!;
    this.nextTargetEl = capBox.querySelector('#hud-next-target')!;
    this.progressFillEl = centerBox.querySelector('#hud-progress-fill')!;
    this.heartsEl = centerBox.querySelector('#hud-hearts')!;
  }

  private buildFloatingBanners(): void {
    this.bannerEl = document.createElement('div');
    this.bannerEl.className = 'hud-glass';
    this.bannerEl.style.cssText =
      'position: absolute; top: 108px; left: 50%; transform: translateX(-50%); padding: 16px 32px; text-align: center; display: none; z-index: 30; min-width: 320px;';
    this.root.appendChild(this.bannerEl);

    this.tutorialEl = document.createElement('div');
    this.tutorialEl.className = 'hud-glass';
    this.tutorialEl.style.cssText =
      'position: absolute; bottom: 36px; left: 50%; transform: translateX(-50%); padding: 10px 24px; font-size: 15px; font-weight: 600; color: #a5f3fc; display: none; text-align: center;';
    this.root.appendChild(this.tutorialEl);
  }

  private buildTitleScreen(): void {
    const watchedPrologue =
      localStorage.getItem('mochi_prologue_watched') === 'true';
    const bestCap = Number(localStorage.getItem('mochi_best_cap_usd') || 100_000_000);

    this.titleOverlay = document.createElement('div');
    this.titleOverlay.style.cssText =
      'position: absolute; inset: 0; background: radial-gradient(circle at center, rgba(15, 23, 42, 0.55) 0%, rgba(2, 6, 23, 0.92) 100%); display: flex; align-items: center; justify-content: center; padding: 20px; pointer-events: auto;';

    const card = document.createElement('div');
    card.className = 'hud-glass';
    card.style.cssText = 'max-width: 620px; width: 100%; padding: 36px 32px; text-align: center;';

    card.innerHTML =
      '<div style="display:inline-block; padding:4px 14px; border-radius:999px; background:rgba(166,36,242,0.25); border:1px solid #c084fc; color:#e9d5ff; font-size:12px; font-weight:700; margin-bottom:12px;">GENLAYER COMMUNITY ADVENTURE</div>' +
      '<h1 style="font-size:38px; font-weight:900; margin:0 0 10px 0; color:#19e6ff;">Mochi：通天之旅</h1>' +
      '<p style="color:#cbd5e1; font-size:15px; line-height:1.6; margin:0 0 20px 0;">操控官方吉祥物 <strong>GenLayer Mochi</strong> 驾驶飞船穿越 90 秒时间隧道，见证智能合约的 AI 觉醒之路；随后降落通天螺旋高塔，从 1 亿美元模拟起点向上攀登，逐一超越主流加密资产的历史最高流通市值！</p>' +
      '<div style="background:rgba(2,6,23,0.65); border-radius:12px; padding:10px 16px; margin-bottom:24px; font-size:13px; color:#94a3b8;">🏆 本机最高攀爬模拟市值记录：<strong style="color:#19e6ff;">' +
      TowerMath.formatUSD(bestCap) +
      '</strong></div>' +
      '<div style="display:flex; gap:14px; justify-content:center; flex-wrap:wrap; margin-bottom:22px;">' +
      '<button id="btn-start-full" class="hud-btn hud-btn-primary">🚀 开始完整冒险 (含时间隧道序章)</button>' +
      '<button id="btn-start-climb" class="hud-btn" style="padding:14px 22px; font-size:15px;">🗼 直接挑战螺旋高塔 ' +
      (watchedPrologue ? '(已解锁)' : '') +
      '</button>' +
      '<button id="btn-open-codex" class="hud-btn" style="padding:14px 20px; font-size:14px;">📊 历史与市值数据来源</button>' +
      '</div>' +
      '<div style="border-top:1px solid rgba(255,255,255,0.12); padding-top:14px; font-size:12px; color:#94a3b8; line-height:1.5;">' +
      '<div><strong>角色与美术署名：</strong>Character "' +
      MOCHI_CREDITS.characterIP +
      '" by <strong>' +
      MOCHI_CREDITS.organization +
      '</strong> & Designer <strong>' +
      MOCHI_CREDITS.characterDesigner +
      '</strong></div>' +
      '<div style="margin-top:4px; color:#64748b;">' +
      MARKET_CAP_DATASET_META.simulationDisclaimer +
      '</div></div>';

    card.querySelector('#btn-start-full')!.addEventListener('click', () => {
      this.titleOverlay.style.display = 'none';
      this.topBar.style.display = 'flex';
      this.skipPrologueBtn.style.display = 'inline-block';
      this.actions.onStartAdventure(false);
    });

    card.querySelector('#btn-start-climb')!.addEventListener('click', () => {
      this.titleOverlay.style.display = 'none';
      this.topBar.style.display = 'flex';
      this.skipPrologueBtn.style.display = 'none';
      this.actions.onStartAdventure(true);
    });

    card.querySelector('#btn-open-codex')!.addEventListener('click', () => {
      this.openCodexModal();
    });

    this.titleOverlay.appendChild(card);
    this.root.appendChild(this.titleOverlay);
  }

  private buildModalContainer(): void {
    this.modalContainer = document.createElement('div');
    this.modalContainer.style.cssText =
      'position: absolute; inset: 0; background: rgba(2, 6, 23, 0.8); backdrop-filter: blur(6px); display: none; align-items: center; justify-content: center; padding: 20px; pointer-events: auto; z-index: 50;';
    this.root.appendChild(this.modalContainer);
  }

  public setSkipPrologueVisible(visible: boolean): void {
    this.skipPrologueBtn.style.display = visible ? 'inline-block' : 'none';
  }

  public updateClimbStatus(
    currentCapUSD: number,
    peakCapUSD: number,
    nextMilestone: CryptoMilestone | null,
    progressRatio: number
  ): void {
    this.capValueEl.textContent = TowerMath.formatUSD(currentCapUSD);
    if (nextMilestone) {
      this.nextTargetEl.textContent =
        '下一目标: ' +
        nextMilestone.symbol +
        ' (' +
        TowerMath.formatUSD(nextMilestone.athCirculatingMarketCapUSD) +
        ')';
    } else {
      this.nextTargetEl.textContent = '已登顶 BTC 历史最高市值！';
    }
    this.progressFillEl.style.width = (progressRatio * 100).toFixed(1) + '%';

    const savedBest = Number(localStorage.getItem('mochi_best_cap_usd') || 0);
    if (peakCapUSD > savedBest) {
      localStorage.setItem('mochi_best_cap_usd', String(Math.floor(peakCapUSD)));
    }
  }

  public updateHearts(hearts: number): void {
    this.heartsEl.textContent =
      '🐾 '.repeat(Math.max(0, hearts)) + '🖤 '.repeat(Math.max(0, 3 - hearts));
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
    this.bannerEl.style.borderColor = item.accentColor;
    this.bannerEl.innerHTML =
      '<div style="font-size:12px; color:' +
      item.accentColor +
      '; font-weight:800;">GENLAYER 历史印记 (' +
      index +
      '/' +
      total +
      ') • ' +
      item.date +
      '</div>' +
      '<div style="font-size:20px; font-weight:900; margin:4px 0;">' +
      item.title +
      '</div>' +
      '<div style="font-size:14px; color:#cbd5e1; max-width:520px;">' +
      item.summary +
      '</div>';
    this.triggerBannerAnimation();
  }

  public showSurpassCelebrationBanner(
    coin: CryptoMilestone,
    index: number,
    total: number
  ): void {
    this.bannerEl.style.borderColor = coin.brandColor;
    this.bannerEl.innerHTML =
      '<div style="font-size:12px; color:#a5f3fc; font-weight:800;">🎉 里程碑突破 (' +
      index +
      '/' +
      total +
      ') • 已激活安全检查点</div>' +
      '<div style="font-size:24px; font-weight:900; color:' +
      coin.brandColor +
      '; margin:6px 0;">已超越 ' +
      coin.symbol +
      ' 历史最高市值！</div>' +
      '<div style="font-size:14px; color:#f8fafc;">历史流通市值峰值：<strong>' +
      TowerMath.formatUSD(coin.athCirculatingMarketCapUSD) +
      '</strong> (' +
      coin.peakDate +
      ')</div>';
    this.triggerBannerAnimation();
  }

  private triggerBannerAnimation(): void {
    this.bannerEl.style.display = 'block';
    this.bannerEl.classList.remove('surpass-banner-anim');
    void this.bannerEl.offsetWidth;
    this.bannerEl.classList.add('surpass-banner-anim');
  }

  public openCodexModal(): void {
    const historyRows = GENLAYER_HISTORY_MILESTONES.map(
      (h) =>
        '<div style="padding:10px; border-bottom:1px solid rgba(255,255,255,0.08);">' +
        '<div style="font-weight:800; color:' +
        h.accentColor +
        ';">' +
        h.date +
        ' — ' +
        h.title +
        '</div>' +
        '<div style="font-size:13px; color:#cbd5e1; margin:4px 0;">' +
        h.summary +
        '</div>' +
        '<a href="' +
        h.sourceUrl +
        '" target="_blank" rel="noopener" style="font-size:12px; color:#38bdf8;">🔗 核验来源: ' +
        h.sourceLabel +
        '</a></div>'
    ).join('');

    const coinRows = CRYPTO_MARKET_CAP_MILESTONES.map(
      (c) =>
        '<div style="padding:10px; border-bottom:1px solid rgba(255,255,255,0.08);">' +
        '<div style="display:flex; justify-content:space-between; font-weight:800;">' +
        '<span style="color:' +
        c.brandColor +
        ';">' +
        c.name +
        ' (' +
        c.symbol +
        ')</span>' +
        '<span style="color:#19e6ff;">' +
        TowerMath.formatUSD(c.athCirculatingMarketCapUSD) +
        '</span></div>' +
        '<div style="font-size:12px; color:#94a3b8; margin-top:3px;">峰值日期: ' +
        c.peakDate +
        ' | 统计口径说明: ' +
        c.circulatingSupplyNote +
        '</div>' +
        '<div style="font-size:11px; color:#64748b;">数据来源: ' +
        c.source +
        '</div></div>'
    ).join('');

    this.modalContainer.innerHTML =
      '<div class="hud-glass" style="max-width:780px; width:100%; max-height:84vh; display:flex; flex-direction:column; padding:24px;">' +
      '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">' +
      '<h2 style="margin:0; font-size:20px;">📖 GenLayer 历史图鉴 & 市值统计口径说明</h2>' +
      '<button id="codex-close" class="hud-btn">关闭 ✕</button></div>' +
      '<div style="font-size:12px; color:#cbd5e1; background:rgba(2,6,23,0.7); padding:10px 14px; border-radius:10px; margin-bottom:12px; line-height:1.5;">' +
      '<div><strong>统计口径：</strong>' +
      MARKET_CAP_DATASET_META.methodology +
      '</div>' +
      '<div><strong>核验快照日：</strong>' +
      MARKET_CAP_DATASET_META.verifiedSnapshotDate +
      ' | <strong>精度：</strong>' +
      MARKET_CAP_DATASET_META.granularity +
      '</div>' +
      '<div style="color:#fbbf24;"><strong>重要说明：</strong>' +
      MARKET_CAP_DATASET_META.simulationDisclaimer +
      '</div></div>' +
      '<div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; overflow-y:auto; padding-right:6px;">' +
      '<div><h3 style="font-size:15px; color:#a5f3fc; margin-top:0;">一、GenLayer 发展里程碑</h3>' +
      historyRows +
      '</div>' +
      '<div><h3 style="font-size:15px; color:#c084fc; margin-top:0;">二、主流币历史最高流通市值</h3>' +
      coinRows +
      '</div></div></div>';

    this.modalContainer.style.display = 'flex';
    this.modalContainer.querySelector('#codex-close')!.addEventListener('click', () => {
      this.modalContainer.style.display = 'none';
    });
  }

  public showPauseModal(onResume: () => void): void {
    this.modalContainer.innerHTML =
      '<div class="hud-glass" style="max-width:420px; width:100%; padding:28px; text-align:center;">' +
      '<h2 style="margin:0 0 16px 0;">⏸ 冒险已暂停</h2>' +
      '<div style="display:flex; flex-direction:column; gap:12px;">' +
      '<button id="pause-resume" class="hud-btn hud-btn-primary">▶ 继续游戏</button>' +
      '<button id="pause-checkpoint" class="hud-btn">🚩 从最近市值检查点重试</button>' +
      '<button id="pause-replay-prologue" class="hud-btn">✈️ 重新观看时间隧道序章</button></div>' +
      '<div style="margin-top:18px; font-size:11px; color:#94a3b8;">Character Design: ' +
      MOCHI_CREDITS.organization +
      ' & ' +
      MOCHI_CREDITS.characterDesigner +
      '</div></div>';

    this.modalContainer.style.display = 'flex';

    this.modalContainer.querySelector('#pause-resume')!.addEventListener('click', () => {
      this.modalContainer.style.display = 'none';
      onResume();
    });
    this.modalContainer.querySelector('#pause-checkpoint')!.addEventListener('click', () => {
      this.modalContainer.style.display = 'none';
      this.actions.onRetryFromCheckpoint();
    });
    this.modalContainer.querySelector('#pause-replay-prologue')!.addEventListener('click', () => {
      this.modalContainer.style.display = 'none';
      this.actions.onReplayPrologue();
    });
  }

  public showFailRetryModal(peakCapUSD: number, checkpointName: string): void {
    this.modalContainer.innerHTML =
      '<div class="hud-glass" style="max-width:440px; width:100%; padding:28px; text-align:center;">' +
      '<h2 style="margin:0 0 8px 0; color:#fb7185;">🐾 Mochi 护盾耗尽！</h2>' +
      '<p style="font-size:14px; color:#cbd5e1; margin-bottom:18px;">本局最高抵达模拟市值：<strong style="color:#19e6ff;">' +
      TowerMath.formatUSD(peakCapUSD) +
      '</strong><br/>已解锁检查点：<strong style="color:#c084fc;">' +
      checkpointName +
      '</strong></p>' +
      '<div style="display:flex; flex-direction:column; gap:12px;">' +
      '<button id="fail-retry-cp" class="hud-btn hud-btn-primary">⚡ 从【' +
      checkpointName +
      '】立即继续攀爬</button>' +
      '<button id="fail-restart-tower" class="hud-btn">🔄 从塔底 ($100M) 重新挑战高塔 (免看序章)</button>' +
      '</div></div>';

    this.modalContainer.style.display = 'flex';

    this.modalContainer.querySelector('#fail-retry-cp')!.addEventListener('click', () => {
      this.modalContainer.style.display = 'none';
      this.actions.onRetryFromCheckpoint();
    });
    this.modalContainer.querySelector('#fail-restart-tower')!.addEventListener('click', () => {
      this.modalContainer.style.display = 'none';
      this.actions.onRestartClimbFull();
    });
  }

  public showSummitVictoryModal(stats: {
    totalTimeSeconds: number;
    surpassedCount: number;
    retriesUsed: number;
  }): void {
    const posterCanvas = this.generateSharePosterCanvas(stats);
    const dataUrl = posterCanvas.toDataURL('image/png');

    this.modalContainer.innerHTML =
      '<div class="hud-glass" style="max-width:560px; width:100%; padding:28px; text-align:center;">' +
      '<div style="font-size:13px; color:#fbbf24; font-weight:800;">🏆 恭喜登顶加密市值通天高塔！</div>' +
      '<h2 style="margin:6px 0 12px 0; font-size:26px;">已超越 BTC 历史最高流通市值 ($1.96T)</h2>' +
      '<img src="' +
      dataUrl +
      '" alt="Mochi Summit Share Poster" style="width:100%; max-width:460px; border-radius:14px; border:2px solid #19e6ff; margin-bottom:16px;" />' +
      '<div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">' +
      '<a id="download-poster" href="' +
      dataUrl +
      '" download="Mochi-Sky-Journey-Victory.png" class="hud-btn hud-btn-primary" style="text-decoration:none;">📸 保存分享纪念海报 (PNG)</a>' +
      '<button id="summit-play-again" class="hud-btn">🔄 再次攀登挑战最快纪录</button>' +
      '</div></div>';

    this.modalContainer.style.display = 'flex';

    this.modalContainer.querySelector('#summit-play-again')!.addEventListener('click', () => {
      this.modalContainer.style.display = 'none';
      this.actions.onRestartClimbFull();
    });
  }

  private generateSharePosterCanvas(stats: {
    totalTimeSeconds: number;
    surpassedCount: number;
    retriesUsed: number;
  }): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 540;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createLinearGradient(0, 0, 900, 540);
    grad.addColorStop(0, '#090d16');
    grad.addColorStop(0.5, '#1e1b4b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 900, 540);

    ctx.strokeStyle = '#19e6ff';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 860, 500);

    const cx = 710;
    const cy = 240;

    ctx.fillStyle = '#b829f7';
    ctx.beginPath();
    ctx.moveTo(cx - 85, cy - 55);
    ctx.lineTo(cx - 115, cy - 150);
    ctx.lineTo(cx - 30, cy - 95);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx + 85, cy - 55);
    ctx.lineTo(cx + 115, cy - 150);
    ctx.lineTo(cx + 30, cy - 95);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 110, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#8c8d94';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(cx, cy + 5, 92, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#152534';
    ctx.beginPath();
    ctx.arc(cx, cy + 5, 86, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#19e6ff';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 58);
    ctx.lineTo(cx + 22, cy - 18);
    ctx.lineTo(cx - 22, cy - 18);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#19e6ff';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx - 38, cy + 6, 18, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 38, cy + 6, 18, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx - 14, cy + 36, 14, 0.15 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 14, cy + 36, 14, 0.1 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    ctx.fillStyle = '#19e6ff';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText('MOCHI: JOURNEY TO THE SKY • 登顶纪念证书', 56, 78);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px system-ui, sans-serif';
    ctx.fillText('通天高塔登顶成功！', 56, 140);

    ctx.fillStyle = '#f7931a';
    ctx.font = 'bold 28px system-ui, sans-serif';
    ctx.fillText('最高抵达模拟市值: $1.96T (超越 BTC 历史峰值)', 56, 195);

    const mins = Math.floor(stats.totalTimeSeconds / 60);
    const secs = Math.floor(stats.totalTimeSeconds % 60);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '24px system-ui, sans-serif';
    ctx.fillText('⏱ 攀爬耗时：' + mins + ' 分 ' + secs + ' 秒', 56, 265);
    ctx.fillText(
      '🏅 超越主流币种：' + stats.surpassedCount + ' / ' + stats.surpassedCount + ' 个',
      56,
      310
    );
    ctx.fillText('🐾 检查点接力次数：' + stats.retriesUsed + ' 次', 56, 355);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '15px system-ui, sans-serif';
    ctx.fillText(
      'Character Mochi by GenLayer & ' + MOCHI_CREDITS.characterDesigner,
      56,
      455
    );
    ctx.fillText(MARKET_CAP_DATASET_META.simulationDisclaimer, 56, 485);

    return canvas;
  }
}
