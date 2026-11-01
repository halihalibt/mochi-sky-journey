export type SupportedLocale = 'zh-CN' | 'en' | 'ja' | 'ko' | 'es';

export interface LocaleOption {
  code: SupportedLocale;
  nativeName: string;
  englishName: string;
  badge: string;
  fontFamily: string;
  isCJK: boolean;
}

export const LOCALE_OPTIONS: LocaleOption[] = [
  {
    code: 'zh-CN',
    nativeName: '简体中文',
    englishName: 'Simplified Chinese',
    badge: 'CN',
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
    isCJK: true
  },
  {
    code: 'en',
    nativeName: 'English',
    englishName: 'English',
    badge: 'EN',
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    isCJK: false
  },
  {
    code: 'ja',
    nativeName: '日本語',
    englishName: 'Japanese',
    badge: 'JP',
    fontFamily:
      "'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', system-ui, sans-serif",
    isCJK: true
  },
  {
    code: 'ko',
    nativeName: '한국어',
    englishName: 'Korean',
    badge: 'KR',
    fontFamily:
      "'Apple SD Gothic Neo', 'Malgun Gothic', 'Nanum Gothic', system-ui, sans-serif",
    isCJK: true
  },
  {
    code: 'es',
    nativeName: 'Español',
    englishName: 'Spanish',
    badge: 'ES',
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    isCJK: false
  }
];

export interface ZoneLocaleText {
  name: string;
  subtitle: string;
}

export interface CosmeticLocaleText {
  name: string;
  desc: string;
}

export interface LocaleStrings {
  // First-time language selector
  langSelectTitle: string;
  langSelectSubtitle: string;
  langSelectConfirm: string;
  changeLanguageBtn: string;

  // Title & Mode selection
  communityBadge: string;
  gameTitle: string;
  gameSubtitle: string;
  heroDescription: string;
  bestSimulatedCapLabel: string;
  bestTimeTrialLabel: string;
  noTimeTrialRecord: string;
  startFullAdventure: string;
  startTowerClimb: string;
  startTimeTrial: string;
  timeTrialLockedHint: string;
  unlockedTag: string;
  openCodexBtn: string;
  openSettingsBtn: string;
  openCosmeticsBtn: string;
  characterCreditPrefix: string;
  dataCreditPrefix: string;

  // Top HUD Bar
  hudSimulatedCapNote: string;
  hudNextTargetPrefix: string;
  hudSummitReached: string;
  hudTowerProgress: string;
  hudZonePrefix: string;
  hudComboPrefix: string;
  hudOrbsPrefix: string;
  hudTimerPrefix: string;
  hudShieldsLabel: string;
  btnSkipPrologue: string;
  btnCodex: string;
  btnSettings: string;
  btnPause: string;
  btnAudioOn: string;
  btnAudioMuted: string;
  btnMotionStandard: string;
  btnMotionReduced: string;
  btnQualityHigh: string;
  btnQualityLow: string;

  // 5 Tower Zones
  zones: {
    CLOUD_RUINS: ZoneLocaleText;
    SKY_GARDEN: ZoneLocaleText;
    STORM_MECH: ZoneLocaleText;
    AURORA_CRYSTAL: ZoneLocaleText;
    STARLIGHT_CROWN: ZoneLocaleText;
  };

  // Interactive Tutorials
  tutorials: {
    flightControl: string;
    transitionToTower: string;
    moveAndLane: string;
    jumpObstacle: string;
    shortDash: string;
    airGlide: string;
    windAndUpdraft: string;
    branchRouteHint: string;
  };

  // History & Market Cap Milestones
  historyGatePrefix: string;
  verifiedSourcePrefix: string;
  dateKindLabels: {
    publication: string;
    release: string;
    announcement: string;
    'recap-publication': string;
    event: string;
    'roadmap-publication': string;
  };
  historicalDailyRecordLabel: string;
  surpassMajorBannerTitle: string;
  surpassMinorToast: string;
  checkpointActivatedTag: string;
  recordCapPrefix: string;
  recordDatePrefix: string;
  towerBaseCheckpointName: string;
  checkpointPlatformSuffix: string;
  earlySimRewardTag: string;
  earlySimDisclaimer: string;
  comboRewardToast: string;
  hiddenPlatformFoundToast: string;
  cosmeticUnlockedToast: string;
  zoneEnteredBanner: string;

  // Codex Modal
  codexTitle: string;
  codexClose: string;
  codexTabHistory: string;
  codexTabMarketCap: string;
  codexMethodologyTitle: string;
  codexMethodologyBody: string;
  codexScopeWarningTitle: string;
  codexScopeWarningBody: string;
  codexDateRuleTitle: string;
  codexDateRuleBody: string;
  codexMetaSummary: string;
  codexSimulationDisclaimer: string;
  codexAttributionLine: string;
  codexMethodologyLink: string;
  codexLicenseLink: string;
  codexCoverageLabel: string;
  codexObservationsLabel: string;
  codexHashLabel: string;
  codexPublishedDateLabel: string;
  codexSourceLinkLabel: string;

  // Settings & Cosmetics Modal
  settingsTitle: string;
  settingsLanguageLabel: string;
  settingsAudioLabel: string;
  settingsVolumeLabel: string;
  settingsGraphicsLabel: string;
  settingsReducedMotionLabel: string;
  settingsCosmeticsTitle: string;
  settingsCosmeticsHint: string;
  settingsCloseBtn: string;
  cosmetics: {
    default: CosmeticLocaleText;
    auroraVisor: CosmeticLocaleText;
    starlightCape: CosmeticLocaleText;
    goldenCrown: CosmeticLocaleText;
  };

  // Pause, Fail & Victory Modals
  pauseTitle: string;
  pauseResumeBtn: string;
  pauseRetryCheckpointBtn: string;
  pauseRestartTowerBtn: string;
  pauseReplayPrologueBtn: string;
  pauseSettingsBtn: string;
  failTitle: string;
  failPeakCapLabel: string;
  failCheckpointLabel: string;
  failRetryCheckpointBtn: string;
  failRestartTowerBtn: string;
  victoryBadge: string;
  victoryTitle: string;
  victoryTimeTrialBadge: string;
  victoryNewBestTime: string;
  victoryDownloadPosterBtn: string;
  victoryPlayAgainBtn: string;
  victoryStartTimeTrialBtn: string;

  // Share Poster Canvas Text
  posterHeaderTag: string;
  posterMainTitle: string;
  posterPeakCapLine: string;
  posterTimeLine: string;
  posterSurpassedLine: string;
  posterCollectiblesLine: string;
  posterRetriesLine: string;
  posterFootnoteLine: string;

  // Touch & System Fallback
  touchJump: string;
  touchDash: string;
  touchGlide: string;
  webglFallbackTitle: string;
  webglFallbackDesc: string;
}

export const LOCALES: Record<SupportedLocale, LocaleStrings> = {
  'zh-CN': {
    langSelectTitle: '选择语言 / Select Language',
    langSelectSubtitle: '请选择您的偏好语言以开启《Mochi：通天之旅》（可随时在设置中修改）',
    langSelectConfirm: '确认并进入冒险',
    changeLanguageBtn: '🌐 语言',

    communityBadge: 'GENLAYER 幻想冒险之旅',
    gameTitle: 'Mochi：通天之旅',
    gameSubtitle: '穿越 GenLayer 历史长河，攀登通天螺旋高塔',
    heroDescription:
      '操控官方吉祥物 GenLayer Mochi 驾驶座舱飞船穿越 90 秒时间隧道，回顾 12 个经核验的发展节点；随后飞出云海降落五区通天高塔，从 1 亿美元模拟起点向上攀登，运用跳跃、冲刺与滑翔逐一超越 30 个主流加密资产的历史日级市值纪录！',
    bestSimulatedCapLabel: '本机最高模拟市值进度',
    bestTimeTrialLabel: '计时挑战最快登顶纪录',
    noTimeTrialRecord: '通关冒险模式后解锁',
    startFullAdventure: '🚀 开始完整冒险（含 90 秒历史飞行）',
    startTowerClimb: '🗼 直接攀登螺旋高塔',
    startTimeTrial: '⏱️ 计时挑战模式（全速冲顶）',
    timeTrialLockedHint: '🔒 通关一次完整高塔攀爬后开放计时挑战模式',
    unlockedTag: '已解锁',
    openCodexBtn: '📖 来源图鉴与数据口径',
    openSettingsBtn: '⚙️ 设置与语言',
    openCosmeticsBtn: '✨ Mochi 装扮',
    characterCreditPrefix: '官方形象设计：',
    dataCreditPrefix: '历史日级市值数据：',

    hudSimulatedCapNote: '模拟市值进度（起点 $100M，固定数据版，非实时行情或盘中最高值）',
    hudNextTargetPrefix: '下一阈值：',
    hudSummitReached: '已抵达 BTC 历史日级市值纪录塔顶！',
    hudTowerProgress: '通天高塔进度',
    hudZonePrefix: '当前区域：',
    hudComboPrefix: '无伤连击',
    hudOrbsPrefix: '星光收集',
    hudTimerPrefix: '用时',
    hudShieldsLabel: '护盾',
    btnSkipPrologue: '跳过序章 ⏭',
    btnCodex: '📖 图鉴',
    btnSettings: '⚙️ 设置',
    btnPause: '⏸ 暂停',
    btnAudioOn: '🔊 音乐',
    btnAudioMuted: '🔇 静音',
    btnMotionStandard: '✨ 标准动态',
    btnMotionReduced: '🌿 减少动态',
    btnQualityHigh: '💎 高画质',
    btnQualityLow: '⚡ 流畅画质',

    zones: {
      CLOUD_RUINS: {
        name: '第一区 · 云海遗迹',
        subtitle: '古老浮空石柱与晨曦云海交织的启程之地'
      },
      SKY_GARDEN: {
        name: '第二区 · 空中花园',
        subtitle: '上升气流环绕的翡翠藤蔓与浮空花台'
      },
      STORM_MECH: {
        name: '第三区 · 风暴机械',
        subtitle: '周期阵风与精密齿轮交错的雷云工坊'
      },
      AURORA_CRYSTAL: {
        name: '第四区 · 极光冰晶',
        subtitle: '折射绚丽极光的冰晶回廊与崩塌浮冰'
      },
      STARLIGHT_CROWN: {
        name: '第五区 · 星空塔冠',
        subtitle: '直抵苍穹之巅的星辉圣殿与双生分岔道'
      }
    },

    tutorials: {
      flightControl:
        '【历史飞行】按 W/A/S/D、方向键或拖动摇杆驾驶飞船，穿过 12 座 GenLayer 历史光门（可随时跳过）',
      transitionToTower:
        '✨ 飞出时间隧道！前方高塔揭示——准备环塔飞行并降落至 $100M 塔底起点...',
      moveAndLane:
        '【操作教学 1/4】按 D / → 或向右推摇杆沿螺旋上升；按 W / S 切换内外圈道',
      jumpObstacle:
        '【跳跃教学 2/4】前方出现断崖缺口！按 空格键 / K 或点击 JUMP 跃过障碍（支持起跳容错与落点光圈判断）',
      shortDash:
        '【冲刺教学 3/4】按 Shift / J 或点击 DASH 发动短冲刺，快速穿越移动机关与周期阵风！',
      airGlide:
        '【滑翔教学 4/4】在空中按住 空格键 / E 或 GLIDE 展开能量翼滑翔，乘上升气流飞跃大跨度断崖！',
      windAndUpdraft:
        '【环境机关】注意观察青色上升气流与琥珀色周期阵风，合理利用滑翔与冲刺保持无伤连击！',
      branchRouteHint:
        '【安全/挑战分岔】内圈为稳健安全路线，外圈高台为挑战捷径并藏有额外星光收集与隐藏平台！'
    },

    historyGatePrefix: 'GENLAYER 历史节点',
    verifiedSourcePrefix: '核验来源：',
    dateKindLabels: {
      publication: '文章发布日',
      release: '版本发布日',
      announcement: '官方公告日',
      'recap-publication': '回顾文章发布日',
      event: '实际事件日',
      'roadmap-publication': '路线图发布日'
    },
    historicalDailyRecordLabel: '历史日级市值纪录',
    surpassMajorBannerTitle: '已超越 {symbol} 的历史日级市值纪录',
    surpassMinorToast: '⚡ 已超越 {symbol} 历史日级市值纪录 ({cap})',
    checkpointActivatedTag: '🎉 重要节点庆祝 • 已激活安全保护与检查点',
    recordCapPrefix: '历史日级市值纪录：',
    recordDatePrefix: 'UTC 观测日：',
    towerBaseCheckpointName: '塔底起点 ($100M)',
    checkpointPlatformSuffix: '纪念台',
    earlySimRewardTag: '🌱 模拟攀爬进度奖励（非币种历史市值纪录）',
    earlySimDisclaimer: '此节点为早期攀爬模拟激励，不代表任何加密货币历史市值纪录。',
    comboRewardToast: '🔥 连续无伤 ×{combo}！获得速度与护盾能量加成',
    hiddenPlatformFoundToast: '🌟 发现隐藏浮空平台！获得稀有星光宝珠 +5',
    cosmeticUnlockedToast: '🎁 解锁新装扮：【{name}】可在设置中穿戴！',
    zoneEnteredBanner: '✦ 进入新区域：{zoneName} ✦',

    codexTitle: '📖 来源图鉴与历史日级市值口径说明',
    codexClose: '关闭 ✕',
    codexTabHistory: '一、GenLayer 12 个核验历史节点',
    codexTabMarketCap: '二、30 币种历史日级市值纪录 (Coin Metrics)',
    codexMethodologyTitle: '统计方法论 (CapMrktEstUSD)：',
    codexMethodologyBody:
      '对每个币种来源覆盖期内的全部非空正值日级流通市值取最大值；使用历史当期供应量与历史价格，不使用今天供应量，不用 FDV。',
    codexScopeWarningTitle: '覆盖范围与口径声明：',
    codexScopeWarningBody:
      '这是来源覆盖期内最高日级流通市值，不是已验证的自上市以来全市场盘中绝对最高值。覆盖范围之外不作断言。不同供应量口径与日内价格会产生差异。',
    codexDateRuleTitle: '日期标注规则：',
    codexDateRuleBody:
      '日期严格保留 API 的 UTC 观测时间，不擅自加减一天，不将其称为最高币价日。历史节点已区分文章发布日、公告日、回顾日与事件日，不将文章发布日扩写成未经证实的上线日。',
    codexMetaSummary:
      '固定数据版本：2026-10-31-daily-records-v1 | 主数据 30 币，共 68,046 条日级观测，全部截至 2026-10-30 UTC。',
    codexSimulationDisclaimer:
      '1 亿美元是游戏模拟起点，不代表 GenLayer 真实市值或价格预测。早期 2.5 亿、5 亿、10 亿美元节点仅为模拟进度奖励，非币种历史纪录。',
    codexAttributionLine:
      '数据署名：Data: Coin Metrics Community Data, CC BY-NC 4.0 (https://github.com/coinmetrics/data)',
    codexMethodologyLink: '🔗 查看 Coin Metrics 市值指标定义文档',
    codexLicenseLink: '🔗 查看 CC BY-NC 4.0 数据许可协议',
    codexCoverageLabel: '来源覆盖期',
    codexObservationsLabel: '日级观测数',
    codexHashLabel: '响应 SHA-256',
    codexPublishedDateLabel: '页面发表日',
    codexSourceLinkLabel: '🔗 查看官方原文来源',

    settingsTitle: '⚙️ 游戏设置、多语言与装扮',
    settingsLanguageLabel: '界面与图鉴语言 (Language)',
    settingsAudioLabel: '音乐与动作音效',
    settingsVolumeLabel: '主音量调节',
    settingsGraphicsLabel: '画面品质模式',
    settingsReducedMotionLabel: '减少动态效果（减弱粒子与镜头晃动）',
    settingsCosmeticsTitle: '🎀 Mochi 可解锁装饰外观',
    settingsCosmeticsHint: '通过收集星光宝珠、保持连续无伤或登顶高塔解锁专属装饰：',
    settingsCloseBtn: '保存并返回',
    cosmetics: {
      default: {
        name: '经典探险家 Mochi',
        desc: '官方标准配色与青色发光猫爪（默认解锁）'
      },
      auroraVisor: {
        name: '极光星芒面罩',
        desc: '达到 5 次连续无伤或收集 15 颗星光宝珠解锁'
      },
      starlightCape: {
        name: '流光能量披风',
        desc: '抵达第四区「极光冰晶」或收集 30 颗星光宝珠解锁'
      },
      goldenCrown: {
        name: '通天塔冠金饰',
        desc: '成功登顶超越 BTC 历史日级市值纪录解锁'
      }
    },

    pauseTitle: '⏸ 冒险已暂停',
    pauseResumeBtn: '▶ 继续冒险',
    pauseRetryCheckpointBtn: '🚩 从最近检查点重试',
    pauseRestartTowerBtn: '🔄 从塔底 ($100M) 重新攀爬',
    pauseReplayPrologueBtn: '✈️ 重新体验 90 秒历史飞行序章',
    pauseSettingsBtn: '⚙️ 语言、音量与画质设置',
    failTitle: '🐾 Mochi 护盾能量耗尽！',
    failPeakCapLabel: '本局最高抵达模拟市值：',
    failCheckpointLabel: '当前安全检查点：',
    failRetryCheckpointBtn: '⚡ 从【{checkpoint}】继续攀爬',
    failRestartTowerBtn: '🔄 从塔底 ($100M) 重新挑战高塔（免看序章）',
    victoryBadge: '🏆 恭喜登顶五区通天螺旋高塔！',
    victoryTitle: '已超越 BTC 的历史日级市值纪录 ($2.49T)',
    victoryTimeTrialBadge: '⚡ 计时挑战模式完成！',
    victoryNewBestTime: '🎉 刷新本机最快登顶纪录！',
    victoryDownloadPosterBtn: '📸 保存多语言分享纪念海报 (PNG)',
    victoryPlayAgainBtn: '🔄 再次从塔底攀登',
    victoryStartTimeTrialBtn: '⏱️ 开启计时挑战模式',

    posterHeaderTag: 'MOCHI: JOURNEY TO THE SKY • 登顶纪念证书',
    posterMainTitle: '通天螺旋高塔登顶成功！',
    posterPeakCapLine: '超越 BTC 历史日级市值纪录：$2,487.53B ($2.49T)',
    posterTimeLine: '⏱ 攀爬总用时：{time}',
    posterSurpassedLine: '🏅 超越历史日级市值纪录：{count} / 30 个币种',
    posterCollectiblesLine: '🌟 星光收集：{orbs} 颗  |  最高无伤连击：×{combo}',
    posterRetriesLine: '🐾 检查点接力：{retries} 次  |  模式：{mode}',
    posterFootnoteLine:
      '固定数据版本 (Coin Metrics CC BY-NC 4.0)；来源覆盖期内日级流通市值峰值，非实时行情或盘中绝对最高值。1亿美元为游戏模拟起点。',

    touchJump: '跳跃',
    touchDash: '冲刺',
    touchGlide: '滑翔',
    webglFallbackTitle: '当前浏览器环境无法启用 WebGL 3D 渲染',
    webglFallbackDesc:
      '《Mochi：通天之旅》需要 WebGL 支持以呈现 3D 螺旋高塔与 Mochi 角色。请在浏览器设置中开启硬件加速，或更换最新版 Chrome、Edge、Safari、Firefox 浏览器后重试。'
  },

  en: {
    langSelectTitle: 'Select Language / 选择语言',
    langSelectSubtitle:
      'Choose your preferred language to start Mochi: Journey to the Sky (can be changed anytime in Settings)',
    langSelectConfirm: 'Confirm & Start Adventure',
    changeLanguageBtn: '🌐 Language',

    communityBadge: 'GENLAYER FANTASY ADVENTURE',
    gameTitle: 'Mochi: Journey to the Sky',
    gameSubtitle: 'Fly through GenLayer history & ascend the Spiral Sky Tower',
    heroDescription:
      'Pilot the official mascot GenLayer Mochi through a 90-second interactive history flight across 12 verified milestones; then land at the $100M simulated base of the five-zone Sky Tower and master jumping, dashing, and gliding to surpass the historical daily market-cap records of 30 major crypto assets!',
    bestSimulatedCapLabel: 'Best Simulated Market-Cap Progress',
    bestTimeTrialLabel: 'Best Time-Trial Summit Record',
    noTimeTrialRecord: 'Complete Adventure Mode to unlock',
    startFullAdventure: '🚀 Start Full Adventure (with 90s History Flight)',
    startTowerClimb: '🗼 Climb Spiral Tower Directly',
    startTimeTrial: '⏱️ Time Trial Mode (Speedrun)',
    timeTrialLockedHint: '🔒 Reach the summit once in Adventure Mode to unlock Time Trial',
    unlockedTag: 'Unlocked',
    openCodexBtn: '📖 Source Codex & Methodology',
    openSettingsBtn: '⚙️ Settings & Language',
    openCosmeticsBtn: '✨ Mochi Cosmetics',
    characterCreditPrefix: 'Official Character Design: ',
    dataCreditPrefix: 'Historical Daily Market-Cap Data: ',

    hudSimulatedCapNote:
      'Simulated progress (starts at $100M; fixed daily dataset, not live prices or intraday ATH)',
    hudNextTargetPrefix: 'Next Threshold: ',
    hudSummitReached: 'Surpassed BTC’s historical daily market-cap record!',
    hudTowerProgress: 'Tower Ascent Progress',
    hudZonePrefix: 'Zone: ',
    hudComboPrefix: 'No-Hit Combo',
    hudOrbsPrefix: 'Starlight Orbs',
    hudTimerPrefix: 'Time',
    hudShieldsLabel: 'Shields',
    btnSkipPrologue: 'Skip Prologue ⏭',
    btnCodex: '📖 Codex',
    btnSettings: '⚙️ Settings',
    btnPause: '⏸ Pause',
    btnAudioOn: '🔊 Audio',
    btnAudioMuted: '🔇 Muted',
    btnMotionStandard: '✨ Standard Motion',
    btnMotionReduced: '🌿 Reduced Motion',
    btnQualityHigh: '💎 High Quality',
    btnQualityLow: '⚡ Low Quality',

    zones: {
      CLOUD_RUINS: {
        name: 'Zone 1 · Cloud Sea Ruins',
        subtitle: 'Ancient floating monoliths bathed in dawn cloudlight'
      },
      SKY_GARDEN: {
        name: 'Zone 2 · Hanging Sky Garden',
        subtitle: 'Emerald terraces and floating sanctuaries carried by updrafts'
      },
      STORM_MECH: {
        name: 'Zone 3 · Stormwork Citadel',
        subtitle: 'Precision clockwork gears and periodic gale-force winds'
      },
      AURORA_CRYSTAL: {
        name: 'Zone 4 · Aurora Ice Spire',
        subtitle: 'Shimmering crystalline arches and fragile glacial platforms'
      },
      STARLIGHT_CROWN: {
        name: 'Zone 5 · Starlight Crown',
        subtitle: 'Celestial observatory at the apex of the spiral sky'
      }
    },

    tutorials: {
      flightControl:
        '[History Flight] Use W/A/S/D, Arrow Keys, or Virtual Joystick to pilot Mochi through 12 verified GenLayer gates (skippable anytime)',
      transitionToTower:
        '✨ Exiting the Time Tunnel! Behold the Sky Tower—circling down to the $100M base...',
      moveAndLane:
        '[Tutorial 1/4] Hold D / → or push joystick right to climb the spiral; use W / S to switch inner/outer lanes',
      jumpObstacle:
        '[Tutorial 2/4] Gap ahead! Press Space / K or tap JUMP to leap across (watch the cyan landing indicator ring)',
      shortDash:
        '[Tutorial 3/4] Press Shift / J or tap DASH for a quick burst through moving hazards and periodic gusts!',
      airGlide:
        '[Tutorial 4/4] Hold Space / E or GLIDE while mid-air to deploy energy wings and ride upward air currents!',
      windAndUpdraft:
        '[Mechanics] Ride cyan updrafts to soar higher and time your dashes through amber wind gusts to keep your combo!',
      branchRouteHint:
        '[Safe / Challenge Split] Inner lane offers a safer path; outer high road rewards skilled climbers with bonus orbs & hidden platforms!'
    },

    historyGatePrefix: 'GENLAYER MILESTONE',
    verifiedSourcePrefix: 'Verified Source: ',
    dateKindLabels: {
      publication: 'Article Publication Date',
      release: 'Release Date',
      announcement: 'Announcement Date',
      'recap-publication': 'Recap Publication Date',
      event: 'Event Date',
      'roadmap-publication': 'Roadmap Publication Date'
    },
    historicalDailyRecordLabel: 'Historical daily market-cap record',
    surpassMajorBannerTitle: 'Surpassed {symbol}’s historical daily market-cap record',
    surpassMinorToast: '⚡ Surpassed {symbol}’s historical daily market-cap record ({cap})',
    checkpointActivatedTag: '🎉 Major Milestone • Safe Protection & Checkpoint Activated',
    recordCapPrefix: 'Historical daily market-cap record: ',
    recordDatePrefix: 'UTC Observation Date: ',
    towerBaseCheckpointName: 'Tower Base ($100M)',
    checkpointPlatformSuffix: 'Sanctuary',
    earlySimRewardTag: '🌱 Simulated Progress Bonus (Not a coin historical record)',
    earlySimDisclaimer:
      'This threshold is an early simulated progress reward, not a historical cryptocurrency market-cap record.',
    comboRewardToast: '🔥 Flawless Combo ×{combo}! Speed & shield energy boost active',
    hiddenPlatformFoundToast: '🌟 Hidden Platform Discovered! +5 Starlight Orbs',
    cosmeticUnlockedToast: '🎁 New Cosmetic Unlocked: [{name}] available in Settings!',
    zoneEnteredBanner: '✦ Entering {zoneName} ✦',

    codexTitle: '📖 Source Codex & Daily Market-Cap Methodology',
    codexClose: 'Close ✕',
    codexTabHistory: '1. GenLayer 12 Verified Milestones',
    codexTabMarketCap: '2. 30 Coins Historical Daily Market-Cap Records',
    codexMethodologyTitle: 'Methodology (CapMrktEstUSD):',
    codexMethodologyBody:
      'Maximum positive daily circulating market cap within each asset’s available coverage period from Coin Metrics Community API; uses historical contemporary supply and historical price, never today’s supply or FDV.',
    codexScopeWarningTitle: 'Scope & Coverage Notice:',
    codexScopeWarningBody:
      'This represents the highest daily circulating market cap within the source coverage period, NOT a certified all-time intraday high across all markets since listing. No claims are made outside the coverage window.',
    codexDateRuleTitle: 'Date Rule:',
    codexDateRuleBody:
      'Dates strictly preserve the UTC observation timestamp from the API without adding or subtracting days. History milestones distinguish publication, announcement, recap, and event dates.',
    codexMetaSummary:
      'Fixed Dataset: 2026-10-31-daily-records-v1 | 30 assets, 68,046 daily observations through 2026-10-30 UTC.',
    codexSimulationDisclaimer:
      '$100M is a simulated game starting point and does not represent GenLayer’s actual market cap or price prediction. Early $250M, $500M, and $1B nodes are simulated progress rewards.',
    codexAttributionLine:
      'Attribution: Data: Coin Metrics Community Data, CC BY-NC 4.0 (https://github.com/coinmetrics/data)',
    codexMethodologyLink: '🔗 Coin Metrics Market Capitalization Documentation',
    codexLicenseLink: '🔗 CC BY-NC 4.0 License Terms',
    codexCoverageLabel: 'Coverage Period',
    codexObservationsLabel: 'Daily Observations',
    codexHashLabel: 'Response SHA-256',
    codexPublishedDateLabel: 'Page Published',
    codexSourceLinkLabel: '🔗 Official Source Article',

    settingsTitle: '⚙️ Settings, Language & Cosmetics',
    settingsLanguageLabel: 'Language / 语言',
    settingsAudioLabel: 'Music & Sound Effects',
    settingsVolumeLabel: 'Master Volume',
    settingsGraphicsLabel: 'Graphics Quality',
    settingsReducedMotionLabel: 'Reduced Motion (less camera shake & particles)',
    settingsCosmeticsTitle: '🎀 Unlockable Mochi Cosmetics',
    settingsCosmeticsHint:
      'Collect Starlight Orbs, build flawless combos, or reach the summit to unlock:',
    settingsCloseBtn: 'Save & Close',
    cosmetics: {
      default: {
        name: 'Classic Explorer Mochi',
        desc: 'Official mascot suit with cyan energy paw (Default)'
      },
      auroraVisor: {
        name: 'Aurora Starlight Visor',
        desc: 'Reach a ×5 flawless combo or collect 15 Starlight Orbs'
      },
      starlightCape: {
        name: 'Celestial Glider Cape',
        desc: 'Reach Zone 4 (Aurora Ice Spire) or collect 30 Starlight Orbs'
      },
      goldenCrown: {
        name: 'Summit Sovereign Crown',
        desc: 'Surpass BTC’s historical daily market-cap record at the summit'
      }
    },

    pauseTitle: '⏸ Adventure Paused',
    pauseResumeBtn: '▶ Resume Adventure',
    pauseRetryCheckpointBtn: '🚩 Retry from Last Checkpoint',
    pauseRestartTowerBtn: '🔄 Restart Tower from Base ($100M)',
    pauseReplayPrologueBtn: '✈️ Replay 90s History Flight Prologue',
    pauseSettingsBtn: '⚙️ Language, Audio & Graphics Settings',
    failTitle: '🐾 Mochi’s Shield Depleted!',
    failPeakCapLabel: 'Peak Simulated Market Cap Reached:',
    failCheckpointLabel: 'Active Checkpoint:',
    failRetryCheckpointBtn: '⚡ Continue from [{checkpoint}]',
    failRestartTowerBtn: '🔄 Restart Tower from Base ($100M)',
    victoryBadge: '🏆 SUMMIT CONQUERED!',
    victoryTitle: 'Surpassed BTC’s Historical Daily Market-Cap Record ($2.49T)',
    victoryTimeTrialBadge: '⚡ Time Trial Complete!',
    victoryNewBestTime: '🎉 New Personal Best Time Record!',
    victoryDownloadPosterBtn: '📸 Download Shareable Victory Poster (PNG)',
    victoryPlayAgainBtn: '🔄 Climb Again from Base',
    victoryStartTimeTrialBtn: '⏱️ Start Time Trial Mode',

    posterHeaderTag: 'MOCHI: JOURNEY TO THE SKY • SUMMIT CERTIFICATE',
    posterMainTitle: 'SPIRAL SKY TOWER SUMMIT REACHED!',
    posterPeakCapLine: 'Surpassed BTC Historical Daily Market-Cap Record: $2,487.53B',
    posterTimeLine: '⏱ Ascent Time: {time}',
    posterSurpassedLine: '🏅 Historical Daily Records Surpassed: {count} / 30 Assets',
    posterCollectiblesLine: '🌟 Starlight Orbs: {orbs}  |  Max Flawless Combo: ×{combo}',
    posterRetriesLine: '🐾 Checkpoint Retries: {retries}  |  Mode: {mode}',
    posterFootnoteLine:
      'Fixed dataset (Coin Metrics CC BY-NC 4.0); peak daily circulating market cap within source coverage, not live prices or intraday ATH. $100M is a simulated start.',

    touchJump: 'JUMP',
    touchDash: 'DASH',
    touchGlide: 'GLIDE',
    webglFallbackTitle: 'WebGL 3D Rendering Unavailable',
    webglFallbackDesc:
      'Mochi: Journey to the Sky requires WebGL to render the 3D Spiral Tower and Mochi. Please enable hardware acceleration in your browser settings or try a modern browser.'
  },

  ja: {
    langSelectTitle: '言語選択 / Select Language',
    langSelectSubtitle:
      '『Mochi：天空への旅』を開始する言語を選択してください（設定からいつでも変更可能）',
    langSelectConfirm: '決定して冒険を始める',
    changeLanguageBtn: '🌐 言語',

    communityBadge: 'GENLAYER ファンタジー冒険譚',
    gameTitle: 'Mochi：天空への旅',
    gameSubtitle: 'GenLayer の歴史を翔け抜け、螺旋の天空塔へ',
    heroDescription:
      '公式マスコット GenLayer Mochi と共に約90秒の歴史フライトで12の検証済みマイルストーンを巡り、1億ドルのシミュレーション起点から5つの幻想エリアを持つ螺旋塔へ！ジャンプ・ダッシュ・滑空を駆使して30銘柄の歴史的日次時価総額記録を超えよう！',
    bestSimulatedCapLabel: '最高シミュレーション時価総額到達点',
    bestTimeTrialLabel: 'タイムアタック最速登頂記録',
    noTimeTrialRecord: 'アドベンチャーモード制覇で解放',
    startFullAdventure: '🚀 フル冒険を開始（90秒の歴史フライト含む）',
    startTowerClimb: '🗼 螺旋の塔から直接挑戦',
    startTimeTrial: '⏱️ タイムアタックモード（最速登頂）',
    timeTrialLockedHint: '🔒 アドベンチャーモードで一度登頂すると解放されます',
    unlockedTag: '解放済',
    openCodexBtn: '📖 出典図鑑・データ基準',
    openSettingsBtn: '⚙️ 設定・言語',
    openCosmeticsBtn: '✨ Mochi コスチューム',
    characterCreditPrefix: '公式キャラクターデザイン：',
    dataCreditPrefix: '日次時価総額データ：',

    hudSimulatedCapNote:
      'シミュレーション進捗（起点 $100M・固定データ版、リアルタイム価格や場中最高値ではありません）',
    hudNextTargetPrefix: '次の閾値：',
    hudSummitReached: 'BTC の歴史的日次時価総額記録の頂点に到達！',
    hudTowerProgress: '天空塔の登頂進捗',
    hudZonePrefix: 'エリア：',
    hudComboPrefix: 'ノーダメージ連撃',
    hudOrbsPrefix: '星光オーブ',
    hudTimerPrefix: 'タイム',
    hudShieldsLabel: 'シールド',
    btnSkipPrologue: '序章スキップ ⏭',
    btnCodex: '📖 図鑑',
    btnSettings: '⚙️ 設定',
    btnPause: '⏸ 一時停止',
    btnAudioOn: '🔊 音量',
    btnAudioMuted: '🔇 ミュート',
    btnMotionStandard: '✨ 標準演出',
    btnMotionReduced: '🌿 演出軽減',
    btnQualityHigh: '💎 高画質',
    btnQualityLow: '⚡ 軽量画質',

    zones: {
      CLOUD_RUINS: {
        name: '第1エリア・雲海の遺跡',
        subtitle: '朝焼けの雲海に浮かぶ古代の石柱群'
      },
      SKY_GARDEN: {
        name: '第2エリア・空中庭園',
        subtitle: '上昇気流が舞う翠玉の蔓と浮遊庭園'
      },
      STORM_MECH: {
        name: '第3エリア・嵐の機械城',
        subtitle: '周期的な突風と巨大な歯車が交差する工房'
      },
      AURORA_CRYSTAL: {
        name: '第4エリア・極光氷晶',
        subtitle: 'オーロラを映す氷の回廊と崩れゆく氷床'
      },
      STARLIGHT_CROWN: {
        name: '第5エリア・星天の塔冠',
        subtitle: '星空の頂へと続く聖域と二手の分岐路'
      }
    },

    tutorials: {
      flightControl:
        '【歴史フライト】W/A/S/D・矢印キーまたはジョイスティックで飛行し、12の歴史ゲートを通過しよう（スキップ可能）',
      transitionToTower:
        '✨ タイムトンネルを突破！眼前にそびえる天空塔へ旋回着陸します...',
      moveAndLane:
        '【操作 1/4】D / → またはスティック右で螺旋を登り、W / S で内外レーンを切り替えよう',
      jumpObstacle:
        '【ジャンプ 2/4】前方に亀裂！Space / K または JUMP で跳び越えよう（着地リングで落下地点を確認）',
      shortDash:
        '【ダッシュ 3/4】Shift / J または DASH で短距離ダッシュ！動く障害物や突風を一気に抜けよう',
      airGlide:
        '【滑空 4/4】空中で Space / E または GLIDE 長押しで滑空翼を展開！上昇気流に乗って大跳躍しよう',
      windAndUpdraft:
        '【ギミック】水色の上昇気流に乗れば高く舞い上がり、琥珀色の周期突風はダッシュで突破できます',
      branchRouteHint:
        '【安全／挑戦ルート分岐】内側は安全ルート、外側の高台は星光オーブや隠し足場がある挑戦ルートです！'
    },

    historyGatePrefix: 'GENLAYER 歴史ノード',
    verifiedSourcePrefix: '検証出典：',
    dateKindLabels: {
      publication: '記事公開日',
      release: 'リリース日',
      announcement: '公式発表日',
      'recap-publication': '振り返り記事公開日',
      event: 'イベント発生日',
      'roadmap-publication': 'ロードマップ公開日'
    },
    historicalDailyRecordLabel: '歴史的日次時価総額記録',
    surpassMajorBannerTitle: '{symbol} の歴史的日次時価総額記録を突破！',
    surpassMinorToast: '⚡ {symbol} の歴史的日次時価総額記録を突破 ({cap})',
    checkpointActivatedTag: '🎉 重要マイルストーン達成 • 安全保護＆チェックポイント有効化',
    recordCapPrefix: '歴史的日次時価総額記録：',
    recordDatePrefix: 'UTC 観測日：',
    towerBaseCheckpointName: '塔の麓 ($100M)',
    checkpointPlatformSuffix: '記念台',
    earlySimRewardTag: '🌱 シミュレーション進捗ボーナス（銘柄の歴史記録ではありません）',
    earlySimDisclaimer:
      'この節目は序盤のシミュレーション進捗報酬であり、暗号資産の歴史的時価総額記録ではありません。',
    comboRewardToast: '🔥 ノーダメージ連撃 ×{combo}！スピード＆シールドボーナス',
    hiddenPlatformFoundToast: '🌟 隠し浮遊足場を発見！星光オーブ +5',
    cosmeticUnlockedToast: '🎁 新コスチューム解放：【{name}】設定から装着可能！',
    zoneEnteredBanner: '✦ 新エリア到達：{zoneName} ✦',

    codexTitle: '📖 出典図鑑＆日次時価総額データの計測基準',
    codexClose: '閉じる ✕',
    codexTabHistory: '1. GenLayer 検証済み歴史ノード (12件)',
    codexTabMarketCap: '2. 30銘柄の歴史的日次時価総額記録',
    codexMethodologyTitle: '計測手法 (CapMrktEstUSD)：',
    codexMethodologyBody:
      'Coin Metrics Community API における各銘柄のカバー期間内の正の日次流通時価総額の最大値。当時の歴史的供給量と価格を使用し、現在の供給量や FDV は使用しません。',
    codexScopeWarningTitle: 'カバー範囲と注意事項：',
    codexScopeWarningBody:
      'これは出典カバー期間内の最高日次流通時価総額であり、上場以来の全市場における場中最高値 (ATH) を保証するものではありません。',
    codexDateRuleTitle: '日付ルール：',
    codexDateRuleBody:
      '日付は API の UTC 観測時刻を厳密に保持しています。歴史ノードは記事公開日・発表日・イベント日を明確に区別しています。',
    codexMetaSummary:
      '固定データ版：2026-10-31-daily-records-v1 | 30銘柄・計 68,046 件の日次観測（2026-10-30 UTC まで）。',
    codexSimulationDisclaimer:
      '1億ドルはゲームのシミュレーション起点であり、GenLayer の実際の時価総額や価格予測ではありません。',
    codexAttributionLine:
      'データクレジット：Data: Coin Metrics Community Data, CC BY-NC 4.0 (https://github.com/coinmetrics/data)',
    codexMethodologyLink: '🔗 Coin Metrics 時価総額指標ドキュメント',
    codexLicenseLink: '🔗 CC BY-NC 4.0 ライセンス規約',
    codexCoverageLabel: 'カバー期間',
    codexObservationsLabel: '日次観測数',
    codexHashLabel: 'レスポンス SHA-256',
    codexPublishedDateLabel: 'ページ公開日',
    codexSourceLinkLabel: '🔗 公式ブログ原文を確認',

    settingsTitle: '⚙️ ゲーム設定・言語・コスチューム',
    settingsLanguageLabel: '表示言語 (Language)',
    settingsAudioLabel: 'BGM・効果音',
    settingsVolumeLabel: 'マスター音量',
    settingsGraphicsLabel: 'グラフィック品質',
    settingsReducedMotionLabel: '視覚効果の軽減（揺れとパーティクルを抑える）',
    settingsCosmeticsTitle: '🎀 Mochi コスチューム変更',
    settingsCosmeticsHint: '星光オーブの収集やノーダメージ連撃、登頂達成で解放されます：',
    settingsCloseBtn: '保存して戻る',
    cosmetics: {
      default: {
        name: 'クラシック探検家 Mochi',
        desc: '公式標準スーツとシアン発光グローブ（初期装備）'
      },
      auroraVisor: {
        name: 'オーロラバイザー',
        desc: '5連撃達成または星光オーブ15個収集で解放'
      },
      starlightCape: {
        name: 'スターライトマント',
        desc: '第4エリア到達または星光オーブ30個収集で解放'
      },
      goldenCrown: {
        name: '天空覇者の黄金冠',
        desc: 'BTC の歴史的日次時価総額記録を超えて登頂すると解放'
      }
    },

    pauseTitle: '⏸ 一時停止中',
    pauseResumeBtn: '▶ 冒険を再開',
    pauseRetryCheckpointBtn: '🚩 直近のチェックポイントから再開',
    pauseRestartTowerBtn: '🔄 塔の麓 ($100M) からやり直す',
    pauseReplayPrologueBtn: '✈️ 90秒の歴史フライト序章をもう一度見る',
    pauseSettingsBtn: '⚙️ 言語・音量・画質設定',
    failTitle: '🐾 シールドエネルギーが尽きました！',
    failPeakCapLabel: '今回の最高到達シミュレーション時価総額：',
    failCheckpointLabel: '解放済みチェックポイント：',
    failRetryCheckpointBtn: '⚡ 【{checkpoint}】からすぐ再開',
    failRestartTowerBtn: '🔄 塔の麓 ($100M) から再挑戦（序章スキップ）',
    victoryBadge: '🏆 天空の螺旋塔・完全制覇！',
    victoryTitle: 'BTC の歴史的日次時価総額記録 ($2.49T) を突破！',
    victoryTimeTrialBadge: '⚡ タイムアタック完走！',
    victoryNewBestTime: '🎉 自己ベストタイム更新！',
    victoryDownloadPosterBtn: '📸 記念シェアポスターを保存 (PNG)',
    victoryPlayAgainBtn: '🔄 もう一度麓から登る',
    victoryStartTimeTrialBtn: '⏱️ タイムアタックに挑戦',

    posterHeaderTag: 'MOCHI: JOURNEY TO THE SKY • 登頂記念証明書',
    posterMainTitle: '天空の螺旋塔 登頂達成！',
    posterPeakCapLine: 'BTC 歴史的日次時価総額記録を突破：$2,487.53B',
    posterTimeLine: '⏱ 登頂タイム：{time}',
    posterSurpassedLine: '🏅 突破した歴史的日次記録：{count} / 30 銘柄',
    posterCollectiblesLine: '🌟 星光オーブ：{orbs} 個  |  最大連撃：×{combo}',
    posterRetriesLine: '🐾 チェックポイント再開：{retries} 回  |  モード：{mode}',
    posterFootnoteLine:
      '固定データ版 (Coin Metrics CC BY-NC 4.0)。出典カバー期間内の日次流通時価総額ピークであり、場中最高値ではありません。1億ドルはシミュレーション起点です。',

    touchJump: 'ジャンプ',
    touchDash: 'ダッシュ',
    touchGlide: '滑空',
    webglFallbackTitle: 'WebGL 3D レンダリングを利用できません',
    webglFallbackDesc:
      '『Mochi：天空への旅』の実行には WebGL が必要です。ブラウザのハードウェアアクセラレーションを有効にするか、最新のブラウザでお試しください。'
  },

  ko: {
    langSelectTitle: '언어 선택 / Select Language',
    langSelectSubtitle:
      '《Mochi: 하늘로의 여정》을 시작할 언어를 선택해 주세요 (설정에서 언제든 변경 가능)',
    langSelectConfirm: '확인 및 모험 시작',
    changeLanguageBtn: '🌐 언어',

    communityBadge: 'GENLAYER 판타지 어드벤처',
    gameTitle: 'Mochi: 하늘로의 여정',
    gameSubtitle: 'GenLayer의 역사를 비행하고 나선형 천공탑을 등반하세요',
    heroDescription:
      '공식 마스코트 GenLayer Mochi와 함께 90초 동안 12개의 검증된 역사적 이정표를 비행한 뒤, 1억 달러 시뮬레이션 기점에서 시작되는 5개 구역의 천공탑에 착륙하세요! 점프, 대시, 활공을 활용해 30개 주요 암호화폐의 역사적 일별 시가총액 기록을 뛰어넘으세요!',
    bestSimulatedCapLabel: '최고 시뮬레이션 시가총액 도달 기록',
    bestTimeTrialLabel: '타임 어택 최단 등정 기록',
    noTimeTrialRecord: '어드벤처 모드 클리어 시 해금',
    startFullAdventure: '🚀 전체 모험 시작 (90초 역사 비행 포함)',
    startTowerClimb: '🗼 나선형 탑 바로 등반하기',
    startTimeTrial: '⏱️ 타임 어택 모드 (스피드런)',
    timeTrialLockedHint: '🔒 어드벤처 모드에서 한 번 정상에 도달하면 타임 어택이 열립니다',
    unlockedTag: '해금됨',
    openCodexBtn: '📖 출처 도감 및 데이터 기준',
    openSettingsBtn: '⚙️ 설정 및 언어',
    openCosmeticsBtn: '✨ Mochi 코스튬',
    characterCreditPrefix: '공식 캐릭터 디자인: ',
    dataCreditPrefix: '역사적 일별 시가총액 데이터: ',

    hudSimulatedCapNote:
      '시뮬레이션 진행도 ($100M 기점, 고정 데이터 버전이며 실시간 시세나 장중 최고가가 아님)',
    hudNextTargetPrefix: '다음 목표: ',
    hudSummitReached: 'BTC의 역사적 일별 시가총액 기록 정상 도달!',
    hudTowerProgress: '천공탑 등반 진행도',
    hudZonePrefix: '현재 구역: ',
    hudComboPrefix: '무피해 콤보',
    hudOrbsPrefix: '별빛 오브',
    hudTimerPrefix: '시간',
    hudShieldsLabel: '보호막',
    btnSkipPrologue: '프롤로그 건너뛰기 ⏭',
    btnCodex: '📖 도감',
    btnSettings: '⚙️ 설정',
    btnPause: '⏸ 일시정지',
    btnAudioOn: '🔊 사운드',
    btnAudioMuted: '🔇 음소거',
    btnMotionStandard: '✨ 표준 효과',
    btnMotionReduced: '🌿 모션 감소',
    btnQualityHigh: '💎 고화질',
    btnQualityLow: '⚡ 저사양 모드',

    zones: {
      CLOUD_RUINS: {
        name: '제1구역 · 운해 유적',
        subtitle: '새벽 구름 바다 위로 솟아오른 고대 부유 유적'
      },
      SKY_GARDEN: {
        name: '제2구역 · 공중 정원',
        subtitle: '상승 기류가 감싸는 에메랄드 덩굴과 부유 화원'
      },
      STORM_MECH: {
        name: '제3구역 · 폭풍 기계성',
        subtitle: '주기적인 돌풍과 정밀한 톱니바퀴가 맞물리는 공방'
      },
      AURORA_CRYSTAL: {
        name: '제4구역 · 오로라 빙정',
        subtitle: '찬란한 오로라를 반사하는 얼음 회랑과 붕괴 구간'
      },
      STARLIGHT_CROWN: {
        name: '제5구역 · 별빛 탑관',
        subtitle: '창공의 정상으로 향하는 성소와 안전/도전 분기점'
      }
    },

    tutorials: {
      flightControl:
        '[역사 비행] W/A/S/D, 방향키 또는 조이스틱으로 비행선을 조종해 12개의 GenLayer 역사 게이트를 통과하세요 (언제든 건너뛰기 가능)',
      transitionToTower:
        '✨ 타임 터널 통과! 눈앞에 펼쳐진 천공탑을 선회하며 $100M 기점으로 착륙합니다...',
      moveAndLane:
        '[조작 1/4] D / → 또는 조이스틱을 오른쪽으로 밀어 나선형 길을 오르고, W / S로 안쪽/바깥쪽 차선을 변경하세요',
      jumpObstacle:
        '[점프 2/4] 전방에 틈새가 있습니다! Space / K 또는 JUMP를 눌러 뛰어넘으세요 (청록색 착지 링으로 낙하 지점 확인)',
      shortDash:
        '[대시 3/4] Shift / J 또는 DASH를 눌러 짧은 대시를 사용해 움직이는 장애물과 돌풍을 돌파하세요!',
      airGlide:
        '[활공 4/4] 공중에서 Space / E 또는 GLIDE를 길게 눌러 에너지 날개로 활공하고 상승 기류를 타세요!',
      windAndUpdraft:
        '[기믹] 청록색 상승 기류를 타면 높이 솟구치며, 호박색 주기적 돌풍은 대시로 통과할 수 있습니다',
      branchRouteHint:
        '[안전/도전 분기] 안쪽 길은 안전하며, 바깥쪽 고공 루트에는 추가 별빛 오브와 숨겨진 발판이 있습니다!'
    },

    historyGatePrefix: 'GENLAYER 역사 노드',
    verifiedSourcePrefix: '검증 출처: ',
    dateKindLabels: {
      publication: '게시글 발행일',
      release: '출시일',
      announcement: '공식 발표일',
      'recap-publication': '회고 글 발행일',
      event: '실제 이벤트일',
      'roadmap-publication': '로드맵 발행일'
    },
    historicalDailyRecordLabel: '역사적 일별 시가총액 기록',
    surpassMajorBannerTitle: '{symbol}의 역사적 일별 시가총액 기록 돌파!',
    surpassMinorToast: '⚡ {symbol} 역사적 일별 시가총액 기록 돌파 ({cap})',
    checkpointActivatedTag: '🎉 주요 이정표 달성 • 안전 보호 및 체크포인트 활성화',
    recordCapPrefix: '역사적 일별 시가총액 기록: ',
    recordDatePrefix: 'UTC 관측일: ',
    towerBaseCheckpointName: '탑 기점 ($100M)',
    checkpointPlatformSuffix: '기념대',
    earlySimRewardTag: '🌱 시뮬레이션 진행 보상 (암호화폐 역사적 기록 아님)',
    earlySimDisclaimer:
      '이 구간은 초반 등반 시뮬레이션 보상이며, 실제 코인의 역사적 시가총액 기록이 아닙니다.',
    comboRewardToast: '🔥 무피해 콤보 ×{combo}! 속도 및 보호막 보너스',
    hiddenPlatformFoundToast: '🌟 숨겨진 부유 발판 발견! 별빛 오브 +5',
    cosmeticUnlockedToast: '🎁 신규 코스튬 해금: [{name}] 설정에서 장착 가능!',
    zoneEnteredBanner: '✦ 새로운 구역 진입: {zoneName} ✦',

    codexTitle: '📖 출처 도감 및 일별 시가총액 산정 기준',
    codexClose: '닫기 ✕',
    codexTabHistory: '1. GenLayer 12개 검증된 역사 노드',
    codexTabMarketCap: '2. 30개 코인 역사적 일별 시가총액 기록',
    codexMethodologyTitle: '산정 방법론 (CapMrktEstUSD):',
    codexMethodologyBody:
      '각 코인의 출처 커버리지 기간 내 유효한 양수 일별 유통 시가총액 중 최댓값을 취합니다. 당시의 역사적 공급량과 가격을 사용하며 현재 공급량이나 FDV를 사용하지 않습니다.',
    codexScopeWarningTitle: '커버리지 범위 및 주의사항:',
    codexScopeWarningBody:
      '이는 출처 커버리지 기간 내 최고 일별 유통 시가총액이며, 상장 이후 전 시장 장중 절대 최고가(ATH)가 아닙니다.',
    codexDateRuleTitle: '날짜 표기 규칙:',
    codexDateRuleBody:
      '날짜는 API의 UTC 관측 시각을 그대로 유지합니다. 역사 노드는 게시글 발행일, 발표일, 실제 이벤트일을 명확히 구분합니다.',
    codexMetaSummary:
      '고정 데이터 버전: 2026-10-31-daily-records-v1 | 30개 코인, 총 68,046건의 일별 관측 (2026-10-30 UTC 기준).',
    codexSimulationDisclaimer:
      '1억 달러는 게임 시뮬레이션 시작점이며 GenLayer의 실제 시가총액이나 가격 예측을 의미하지 않습니다.',
    codexAttributionLine:
      '데이터 출처: Data: Coin Metrics Community Data, CC BY-NC 4.0 (https://github.com/coinmetrics/data)',
    codexMethodologyLink: '🔗 Coin Metrics 시가총액 지표 정의 문서',
    codexLicenseLink: '🔗 CC BY-NC 4.0 데이터 라이선스',
    codexCoverageLabel: '커버리지 기간',
    codexObservationsLabel: '일별 관측 수',
    codexHashLabel: '응답 SHA-256',
    codexPublishedDateLabel: '페이지 게시일',
    codexSourceLinkLabel: '🔗 공식 원문 출처 보기',

    settingsTitle: '⚙️ 게임 설정, 언어 및 코스튬',
    settingsLanguageLabel: '언어 선택 (Language)',
    settingsAudioLabel: '배경음악 및 효과음',
    settingsVolumeLabel: '마스터 볼륨',
    settingsGraphicsLabel: '그래픽 품질',
    settingsReducedMotionLabel: '모션 효과 감소 (카메라 흔들림 및 파티클 축소)',
    settingsCosmeticsTitle: '🎀 Mochi 해금 코스튬',
    settingsCosmeticsHint: '별빛 오브 수집, 무피해 콤보 달성 또는 정상 등정으로 해금하세요:',
    settingsCloseBtn: '저장 및 닫기',
    cosmetics: {
      default: {
        name: '클래식 탐험가 Mochi',
        desc: '공식 기본 슈트와 청록색 에너지 고양이 앞발 (기본)'
      },
      auroraVisor: {
        name: '오로라 스타 바이저',
        desc: '무피해 콤보 ×5 달성 또는 별빛 오브 15개 수집 시 해금'
      },
      starlightCape: {
        name: '별빛 에너지 망토',
        desc: '제4구역 도달 또는 별빛 오브 30개 수집 시 해금'
      },
      goldenCrown: {
        name: '천공탑 정상 황금 왕관',
        desc: 'BTC의 역사적 일별 시가총액 기록을 넘어 등정 성공 시 해금'
      }
    },

    pauseTitle: '⏸ 모험 일시정지',
    pauseResumeBtn: '▶ 모험 계속하기',
    pauseRetryCheckpointBtn: '🚩 최근 체크포인트에서 재시도',
    pauseRestartTowerBtn: '🔄 탑 기점 ($100M)에서 다시 등반',
    pauseReplayPrologueBtn: '✈️ 90초 역사 비행 프롤로그 다시 보기',
    pauseSettingsBtn: '⚙️ 언어, 볼륨 및 그래픽 설정',
    failTitle: '🐾 Mochi의 보호막이 소진되었습니다!',
    failPeakCapLabel: '이번 도전 최고 시뮬레이션 시가총액:',
    failCheckpointLabel: '활성화된 체크포인트:',
    failRetryCheckpointBtn: '⚡ [{checkpoint}]에서 즉시 이어하기',
    failRestartTowerBtn: '🔄 탑 기점 ($100M)에서 처음부터 재도전',
    victoryBadge: '🏆 천공의 나선탑 정상 등정 성공!',
    victoryTitle: 'BTC의 역사적 일별 시가총액 기록 ($2.49T) 돌파',
    victoryTimeTrialBadge: '⚡ 타임 어택 완주 성공!',
    victoryNewBestTime: '🎉 최단 등정 신기록 달성!',
    victoryDownloadPosterBtn: '📸 기념 공유 포스터 저장 (PNG)',
    victoryPlayAgainBtn: '🔄 다시 등반하기',
    victoryStartTimeTrialBtn: '⏱️ 타임 어택 모드 시작',

    posterHeaderTag: 'MOCHI: JOURNEY TO THE SKY • 등정 기념 인증서',
    posterMainTitle: '천공의 나선탑 정상 등정 완료!',
    posterPeakCapLine: 'BTC 역사적 일별 시가총액 기록 돌파: $2,487.53B',
    posterTimeLine: '⏱ 등반 소요 시간: {time}',
    posterSurpassedLine: '🏅 돌파한 역사적 일별 기록: {count} / 30 개 코인',
    posterCollectiblesLine: '🌟 별빛 오브: {orbs} 개  |  최대 무피해 콤보: ×{combo}',
    posterRetriesLine: '🐾 체크포인트 이어하기: {retries} 회  |  모드: {mode}',
    posterFootnoteLine:
      '고정 데이터 버전 (Coin Metrics CC BY-NC 4.0); 출처 커버리지 기간 내 일별 유통 시가총액 최고치이며 실시간 시세나 장중 최고가가 아닙니다. 1억 달러는 시뮬레이션 기점입니다.',

    touchJump: '점프',
    touchDash: '대시',
    touchGlide: '활공',
    webglFallbackTitle: 'WebGL 3D 렌더링을 사용할 수 없습니다',
    webglFallbackDesc:
      '《Mochi: 하늘로의 여정》은 3D 그래픽을 위해 WebGL을 필요로 합니다. 브라우저 설정에서 하드웨어 가속을 켜거나 최신 브라우저를 사용해 주세요.'
  },

  es: {
    langSelectTitle: 'Seleccionar idioma / Select Language',
    langSelectSubtitle:
      'Elige tu idioma preferido para comenzar Mochi: Viaje al Cielo (puedes cambiarlo en Ajustes en cualquier momento)',
    langSelectConfirm: 'Confirmar y comenzar aventura',
    changeLanguageBtn: '🌐 Idioma',

    communityBadge: 'AVENTURA FANTÁSTICA DE GENLAYER',
    gameTitle: 'Mochi: Viaje al Cielo',
    gameSubtitle: 'Vuela por la historia de GenLayer y asciende la Torre Espiral',
    heroDescription:
      'Pilota a la mascota oficial GenLayer Mochi en un vuelo histórico interactivo de 90 segundos a través de 12 hitos verificados; luego aterriza en la base simulada de $100M de la Torre del Cielo de cinco zonas y domina el salto, el impulso y el planeo para superar el récord histórico de capitalización diaria de 30 criptoactivos.',
    bestSimulatedCapLabel: 'Mejor progreso de capitalización simulada',
    bestTimeTrialLabel: 'Mejor récord en Contrarreloj',
    noTimeTrialRecord: 'Completa el Modo Aventura para desbloquear',
    startFullAdventure: '🚀 Aventura completa (con vuelo histórico de 90s)',
    startTowerClimb: '🗼 Escalar la Torre Espiral directamente',
    startTimeTrial: '⏱️ Modo Contrarreloj (Velocidad)',
    timeTrialLockedHint:
      '🔒 Alcanza la cima una vez en el Modo Aventura para desbloquear Contrarreloj',
    unlockedTag: 'Desbloqueado',
    openCodexBtn: '📖 Códice de fuentes y metodología',
    openSettingsBtn: '⚙️ Ajustes e idioma',
    openCosmeticsBtn: '✨ Aspectos de Mochi',
    characterCreditPrefix: 'Diseño oficial del personaje: ',
    dataCreditPrefix: 'Datos de capitalización diaria histórica: ',

    hudSimulatedCapNote:
      'Progreso simulado (inicio en $100M; datos fijos diarios, no precios en vivo ni máximo intradía)',
    hudNextTargetPrefix: 'Siguiente umbral: ',
    hudSummitReached: '¡Superado el récord histórico de capitalización diaria de BTC!',
    hudTowerProgress: 'Progreso de ascenso',
    hudZonePrefix: 'Zona: ',
    hudComboPrefix: 'Combo sin daño',
    hudOrbsPrefix: 'Orbes estelares',
    hudTimerPrefix: 'Tiempo',
    hudShieldsLabel: 'Escudos',
    btnSkipPrologue: 'Saltar prólogo ⏭',
    btnCodex: '📖 Códice',
    btnSettings: '⚙️ Ajustes',
    btnPause: '⏸ Pausa',
    btnAudioOn: '🔊 Audio',
    btnAudioMuted: '🔇 Silencio',
    btnMotionStandard: '✨ Efectos estándar',
    btnMotionReduced: '🌿 Menos movimiento',
    btnQualityHigh: '💎 Calidad alta',
    btnQualityLow: '⚡ Calidad fluida',

    zones: {
      CLOUD_RUINS: {
        name: 'Zona 1 · Ruinas del Mar de Nubes',
        subtitle: 'Monolitos flotantes antiguos bañados por la luz del alba'
      },
      SKY_GARDEN: {
        name: 'Zona 2 · Jardín Colgante del Cielo',
        subtitle: 'Terrazas esmeralda y corrientes ascendentes suaves'
      },
      STORM_MECH: {
        name: 'Zona 3 · Ciudadela Mecánica de Tormenta',
        subtitle: 'Engranajes de precisión y ráfagas periódicas de viento'
      },
      AURORA_CRYSTAL: {
        name: 'Zona 4 · Aguja de Cristal de Aurora',
        subtitle: 'Arcos de hielo cristalino bajo auroras boreales'
      },
      STARLIGHT_CROWN: {
        name: 'Zona 5 · Corona de Luz Estelar',
        subtitle: 'Santuario celeste en la cúspide de la espiral'
      }
    },

    tutorials: {
      flightControl:
        '[Vuelo histórico] Usa W/A/S/D, flechas o el joystick virtual para pilotar a Mochi por 12 portales históricos (puedes saltar en cualquier momento)',
      transitionToTower:
        '✨ ¡Saliendo del túnel del tiempo! Contempla la Torre del Cielo mientras descendemos a la base de $100M...',
      moveAndLane:
        '[Tutorial 1/4] Mantén D / → o mueve el joystick a la derecha para subir; usa W / S para cambiar entre carril interior y exterior',
      jumpObstacle:
        '[Tutorial 2/4] ¡Brecha adelante! Pulsa Espacio / K o SALTAR para cruzar (guíate por el anillo cian de aterrizaje)',
      shortDash:
        '[Tutorial 3/4] ¡Pulsa Shift / J o IMPULSO para cruzar rápidamente obstáculos móviles y ráfagas de viento!',
      airGlide:
        '[Tutorial 4/4] ¡Mantén Espacio / E o PLANEAR en el aire para desplegar alas de energía y aprovechar las corrientes ascendentes!',
      windAndUpdraft:
        '[Mecánicas] Usa las corrientes ascendentes cian para elevarte y atraviesa las ráfagas ámbar con impulso sin perder tu combo',
      branchRouteHint:
        '[Ruta Segura / Desafío] El carril interior es más seguro; la ruta exterior elevada ofrece orbes extra y plataformas ocultas'
    },

    historyGatePrefix: 'HITO DE GENLAYER',
    verifiedSourcePrefix: 'Fuente verificada: ',
    dateKindLabels: {
      publication: 'Fecha de publicación del artículo',
      release: 'Fecha de lanzamiento',
      announcement: 'Fecha de anuncio oficial',
      'recap-publication': 'Fecha de artículo de resumen',
      event: 'Fecha del evento',
      'roadmap-publication': 'Fecha de publicación de hoja de ruta'
    },
    historicalDailyRecordLabel: 'Récord histórico de capitalización diaria',
    surpassMajorBannerTitle:
      'Superado el récord histórico de capitalización diaria de {symbol}',
    surpassMinorToast:
      '⚡ Superado el récord histórico de capitalización diaria de {symbol} ({cap})',
    checkpointActivatedTag:
      '🎉 Hito importante • Protección y punto de control activados',
    recordCapPrefix: 'Récord histórico de capitalización diaria: ',
    recordDatePrefix: 'Fecha de observación UTC: ',
    towerBaseCheckpointName: 'Base de la Torre ($100M)',
    checkpointPlatformSuffix: 'Santuario',
    earlySimRewardTag: '🌱 Bonificación de progreso simulado (No es récord de moneda)',
    earlySimDisclaimer:
      'Este umbral es una recompensa de progreso simulado, no un récord histórico de capitalización de criptomonedas.',
    comboRewardToast: '🔥 ¡Combo sin daño ×{combo}! Impulso de velocidad y escudo',
    hiddenPlatformFoundToast: '🌟 ¡Plataforma oculta descubierta! +5 Orbes estelares',
    cosmeticUnlockedToast:
      '🎁 Nuevo aspecto desbloqueado: [{name}] disponible en Ajustes',
    zoneEnteredBanner: '✦ Entrando en {zoneName} ✦',

    codexTitle: '📖 Códice de fuentes y metodología de capitalización diaria',
    codexClose: 'Cerrar ✕',
    codexTabHistory: '1. 12 hitos verificados de GenLayer',
    codexTabMarketCap: '2. Récords históricos de capitalización diaria (30 monedas)',
    codexMethodologyTitle: 'Metodología (CapMrktEstUSD):',
    codexMethodologyBody:
      'Valor máximo positivo de capitalización circulante diaria dentro del período de cobertura de cada activo en Coin Metrics Community API; emplea suministro histórico contemporáneo y precio histórico, nunca suministro actual ni FDV.',
    codexScopeWarningTitle: 'Aviso de alcance y cobertura:',
    codexScopeWarningBody:
      'Representa el pico diario de capitalización circulante dentro del período de cobertura de la fuente, NO un máximo histórico intradía absoluto desde su lanzamiento.',
    codexDateRuleTitle: 'Regla de fechas:',
    codexDateRuleBody:
      'Las fechas conservan estrictamente la marca de tiempo UTC de la API. Los hitos históricos distinguen entre fechas de publicación, anuncio, resumen y evento.',
    codexMetaSummary:
      'Versión fija: 2026-10-31-daily-records-v1 | 30 activos, 68,046 observaciones diarias hasta el 2026-10-30 UTC.',
    codexSimulationDisclaimer:
      '$100M es un punto de partida simulado del juego y no representa la capitalización real ni predicción de precios de GenLayer.',
    codexAttributionLine:
      'Atribución: Data: Coin Metrics Community Data, CC BY-NC 4.0 (https://github.com/coinmetrics/data)',
    codexMethodologyLink: '🔗 Documentación de capitalización de Coin Metrics',
    codexLicenseLink: '🔗 Términos de licencia CC BY-NC 4.0',
    codexCoverageLabel: 'Período de cobertura',
    codexObservationsLabel: 'Observaciones diarias',
    codexHashLabel: 'SHA-256 de respuesta',
    codexPublishedDateLabel: 'Publicado en web',
    codexSourceLinkLabel: '🔗 Ver artículo oficial original',

    settingsTitle: '⚙️ Ajustes, idioma y aspectos',
    settingsLanguageLabel: 'Idioma (Language)',
    settingsAudioLabel: 'Música y efectos de sonido',
    settingsVolumeLabel: 'Volumen principal',
    settingsGraphicsLabel: 'Calidad gráfica',
    settingsReducedMotionLabel: 'Reducir movimiento (menos partículas y vibración)',
    settingsCosmeticsTitle: '🎀 Aspectos desbloqueables de Mochi',
    settingsCosmeticsHint:
      'Reúne Orbes estelares, logra combos sin daño o llega a la cima para desbloquear:',
    settingsCloseBtn: 'Guardar y cerrar',
    cosmetics: {
      default: {
        name: 'Mochi Explorador Clásico',
        desc: 'Traje oficial estándar con garra de energía cian (Por defecto)'
      },
      auroraVisor: {
        name: 'Visor Estelar de Aurora',
        desc: 'Logra un combo ×5 sin daño o reúne 15 Orbes estelares'
      },
      starlightCape: {
        name: 'Capa Planeadora Celeste',
        desc: 'Llega a la Zona 4 (Aguja de Aurora) o reúne 30 Orbes estelares'
      },
      goldenCrown: {
        name: 'Corona Dorada de la Cima',
        desc: 'Supera el récord histórico diario de BTC en la cúspide'
      }
    },

    pauseTitle: '⏸ Aventura en pausa',
    pauseResumeBtn: '▶ Reanudar aventura',
    pauseRetryCheckpointBtn: '🚩 Reintentar desde el último punto de control',
    pauseRestartTowerBtn: '🔄 Reiniciar torre desde la base ($100M)',
    pauseReplayPrologueBtn: '✈️ Repetir vuelo histórico de 90s',
    pauseSettingsBtn: '⚙️ Ajustes de idioma, audio y gráficos',
    failTitle: '🐾 ¡Escudo de Mochi agotado!',
    failPeakCapLabel: 'Capitalización simulada máxima alcanzada:',
    failCheckpointLabel: 'Punto de control activo:',
    failRetryCheckpointBtn: '⚡ Continuar desde [{checkpoint}]',
    failRestartTowerBtn: '🔄 Reiniciar torre desde la base ($100M)',
    victoryBadge: '🏆 ¡CIMA CONQUISTADA!',
    victoryTitle:
      'Superado el récord histórico de capitalización diaria de BTC ($2.49T)',
    victoryTimeTrialBadge: '⚡ ¡Contrarreloj completada!',
    victoryNewBestTime: '🎉 ¡Nuevo récord personal de velocidad!',
    victoryDownloadPosterBtn: '📸 Descargar póster conmemorativo (PNG)',
    victoryPlayAgainBtn: '🔄 Escalar de nuevo desde la base',
    victoryStartTimeTrialBtn: '⏱️ Iniciar Modo Contrarreloj',

    posterHeaderTag: 'MOCHI: JOURNEY TO THE SKY • CERTIFICADO DE CIMA',
    posterMainTitle: '¡CIMA DE LA TORRE ESPIRAL ALCANZADA!',
    posterPeakCapLine:
      'Superado el récord histórico de capitalización diaria de BTC: $2,487.53B',
    posterTimeLine: '⏱ Tiempo de ascenso: {time}',
    posterSurpassedLine: '🏅 Récords históricos diarios superados: {count} / 30 activos',
    posterCollectiblesLine:
      '🌟 Orbes estelares: {orbs}  |  Combo máx. sin daño: ×{combo}',
    posterRetriesLine:
      '🐾 Reintentos en control: {retries}  |  Modo: {mode}',
    posterFootnoteLine:
      'Datos fijos (Coin Metrics CC BY-NC 4.0); pico diario de capitalización circulante dentro de la cobertura, no precio en vivo ni ATH intradía. $100M es un inicio simulado.',

    touchJump: 'SALTAR',
    touchDash: 'IMPULSO',
    touchGlide: 'PLANEAR',
    webglFallbackTitle: 'Renderizado 3D WebGL no disponible',
    webglFallbackDesc:
      'Mochi: Viaje al Cielo requiere WebGL para mostrar la Torre Espiral 3D y a Mochi. Activa la aceleración por hardware en tu navegador o prueba con un navegador actualizado.'
  }
};
