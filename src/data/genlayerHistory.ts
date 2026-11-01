export type HistoryDateKind =
  | 'publication'
  | 'release'
  | 'announcement'
  | 'recap-publication'
  | 'event'
  | 'roadmap-publication';

export interface HistoryLocalizedText {
  title: string;
  summary: string;
  note?: string;
}

export interface GenLayerMilestone {
  id: string;
  date: string;
  dateKind: HistoryDateKind;
  title: string;
  summary: string;
  i18n: {
    'zh-CN': HistoryLocalizedText;
    en: HistoryLocalizedText;
    ja?: HistoryLocalizedText;
    ko?: HistoryLocalizedText;
    es?: HistoryLocalizedText;
  };
  sourceLabel: string;
  sourceUrl: string;
  checkedOn: string;
  note: string;
  publishedDate?: string;
  accentColor: string;
}

export interface GenLayerHistoryDataset {
  verifiedOn: string;
  milestones: GenLayerMilestone[];
}

export const GENLAYER_HISTORY_DATA: GenLayerHistoryDataset = {
  "verifiedOn": "2026-10-31",
  "milestones": [
    {
      "id": "gl-01",
      "date": "2024-03-19",
      "dateKind": "publication",
      "title": "愿景公开",
      "summary": "官方发布基础介绍，解释让合约理解自然语言并连接互联网的方向。",
      "i18n": {
        "zh-CN": {
          "title": "愿景公开",
          "summary": "官方发布基础介绍，解释让合约理解自然语言并连接互联网的方向。",
          "note": "文章或公告日期不代表该技术首次被发明的日期。"
        },
        "en": {
          "title": "The vision takes shape",
          "summary": "The team publishes an introduction to contracts that understand natural language and access the web.",
          "note": "The article or announcement date does not represent the date the technology was first invented."
        },
        "ja": {
          "title": "ビジョンの公開",
          "summary": "自然言語を理解しインターネットに接続するコントラクトの方向性を解説する基礎紹介を公開。",
          "note": "記事や発表の日付は、その技術が最初に発明された日付を表すものではありません。"
        },
        "ko": {
          "title": "비전 공개",
          "summary": "자연어를 이해하고 인터넷에 연결되는 컨트랙트의 방향성을 설명하는 기초 소개글을 발표했습니다.",
          "note": "게시글이나 발표 날짜가 해당 기술이 최초로 발명된 날짜를 의미하지는 않습니다."
        },
        "es": {
          "title": "La visión toma forma",
          "summary": "El equipo publica una introducción a los contratos que comprenden lenguaje natural y acceden a la web.",
          "note": "La fecha del artículo o anuncio no representa la fecha en que se inventó por primera vez dicha tecnología."
        }
      },
      "sourceLabel": "GenLayer official blog",
      "sourceUrl": "https://genlayer.com/blog/what-is-genlayer-the-fundamentals-part-i",
      "checkedOn": "2026-10-31",
      "note": "文章或公告日期不代表该技术首次被发明的日期。",
      "accentColor": "#38bdf8"
    },
    {
      "id": "gl-02",
      "date": "2024-06-04",
      "dateKind": "release",
      "title": "Simulator 首版发布",
      "summary": "开发者获得可用于原型设计与测试 Intelligent Contracts 的本地沙盒。",
      "i18n": {
        "zh-CN": {
          "title": "Simulator 首版发布",
          "summary": "开发者获得可用于原型设计与测试 Intelligent Contracts 的本地沙盒。",
          "note": "文章或公告日期不代表该技术首次被发明的日期。"
        },
        "en": {
          "title": "The first Simulator",
          "summary": "Developers receive a local sandbox for prototyping and testing Intelligent Contracts.",
          "note": "The article or announcement date does not represent the date the technology was first invented."
        },
        "ja": {
          "title": "初代 Simulator リリース",
          "summary": "開発者が Intelligent Contracts のプロトタイプ作成とテストを行えるローカルサンドボックスを提供。",
          "note": "記事や発表の日付は、その技術が最初に発明された日付を表すものではありません。"
        },
        "ko": {
          "title": "Simulator 첫 버전 출시",
          "summary": "개발자가 Intelligent Contracts를 프로토타이핑하고 테스트할 수 있는 로컬 샌드박스를 확보했습니다.",
          "note": "게시글이나 발표 날짜가 해당 기술이 최초로 발명된 날짜를 의미하지는 않습니다."
        },
        "es": {
          "title": "El primer Simulator",
          "summary": "Los desarrolladores reciben un entorno local para crear prototipos y probar Intelligent Contracts.",
          "note": "La fecha del artículo o anuncio no representa la fecha en que se inventó por primera vez dicha tecnología."
        }
      },
      "sourceLabel": "GenLayer official blog",
      "sourceUrl": "https://genlayer.com/blog/introducing-the-genlayer-simulator-a-testbed-for-developers",
      "checkedOn": "2026-10-31",
      "note": "文章或公告日期不代表该技术首次被发明的日期。",
      "accentColor": "#60a5fa"
    },
    {
      "id": "gl-03",
      "date": "2024-08-20",
      "dateKind": "announcement",
      "title": "750 万美元种子轮公告",
      "summary": "官方宣布由 North Island Ventures 领投的种子轮融资。",
      "i18n": {
        "zh-CN": {
          "title": "750 万美元种子轮公告",
          "summary": "官方宣布由 North Island Ventures 领投的种子轮融资。",
          "note": "文章或公告日期不代表该技术首次被发明的日期。"
        },
        "en": {
          "title": "A $7.5 million seed round",
          "summary": "GenLayer announces a seed round led by North Island Ventures.",
          "note": "The article or announcement date does not represent the date the technology was first invented."
        },
        "ja": {
          "title": "750万ドルのシードラウンド発表",
          "summary": "North Island Ventures が主導するシードラウンドの資金調達を公式発表。",
          "note": "記事や発表の日付は、その技術が最初に発明された日付を表すものではありません。"
        },
        "ko": {
          "title": "750만 달러 시드 라운드 발표",
          "summary": "North Island Ventures가 주도한 시드 라운드 투자 유치를 공식 발표했습니다.",
          "note": "게시글이나 발표 날짜가 해당 기술이 최초로 발명된 날짜를 의미하지는 않습니다."
        },
        "es": {
          "title": "Ronda semilla de $7.5 millones",
          "summary": "GenLayer anuncia una ronda semilla liderada por North Island Ventures.",
          "note": "La fecha del artículo o anuncio no representa la fecha en que se inventó por primera vez dicha tecnología."
        }
      },
      "sourceLabel": "GenLayer official blog",
      "sourceUrl": "https://genlayer.com/blog/genlayer-raises-7-5m-to-build-the-first-intelligent-blockchain",
      "checkedOn": "2026-10-31",
      "note": "文章或公告日期不代表该技术首次被发明的日期。",
      "accentColor": "#818cf8"
    },
    {
      "id": "gl-04",
      "date": "2024-08-27",
      "dateKind": "recap-publication",
      "title": "首届 Intergalactic 黑客松回顾",
      "summary": "官方回顾七支团队的智能合约原型，展示航班保险等应用。",
      "i18n": {
        "zh-CN": {
          "title": "首届 Intergalactic 黑客松回顾",
          "summary": "官方回顾七支团队的智能合约原型，展示航班保险等应用。",
          "note": "2024-08-27 是黑客松回顾文章发布日期，不冒充实际比赛开始或结束日期。"
        },
        "en": {
          "title": "Builders put ideas to work",
          "summary": "The team recaps Intelligent Contract prototypes from seven hackathon teams.",
          "note": "2024-08-27 is the publication date of the hackathon recap article, not the actual start or end date of the competition."
        },
        "ja": {
          "title": "第1回 Intergalactic ハッカソン振り返り",
          "summary": "7つのハッカソンチームによるインテリジェントコントラクト試作を振り返り、フライト保険などの応用を紹介。",
          "note": "2024-08-27 はハッカソン振り返り記事の公開日であり、実際の競技開始日や終了日ではありません。"
        },
        "ko": {
          "title": "제1회 Intergalactic 해커톤 회고",
          "summary": "항공편 보험 등 응용 사례를 선보인 7개 해커톤 팀의 지능형 컨트랙트 프로토타입을 회고했습니다.",
          "note": "2024-08-27은 해커톤 회고 글 게시일이며, 실제 대회 시작일이나 종료일을 대신하지 않습니다."
        },
        "es": {
          "title": "Los constructores ponen ideas en marcha",
          "summary": "El equipo repasa los prototipos de Intelligent Contracts de siete equipos del hackathon.",
          "note": "2024-08-27 es la fecha de publicación del artículo de resumen del hackathon, no la fecha real de inicio o fin del evento."
        }
      },
      "sourceLabel": "GenLayer official blog",
      "sourceUrl": "https://genlayer.com/blog/the-first-intergalactic-hackathon-powering-intelligent-contracts",
      "checkedOn": "2026-10-31",
      "note": "2024-08-27 是黑客松回顾文章发布日期，不冒充实际比赛开始或结束日期。",
      "accentColor": "#a78bfa"
    },
    {
      "id": "gl-05",
      "date": "2024-11-25",
      "dateKind": "announcement",
      "title": "Studio 开发工具公告",
      "summary": "官方介绍浏览器端 Studio，便于编写、测试与调试智能合约。",
      "i18n": {
        "zh-CN": {
          "title": "Studio 开发工具公告",
          "summary": "官方介绍浏览器端 Studio，便于编写、测试与调试智能合约。",
          "note": "文章或公告日期不代表该技术首次被发明的日期。"
        },
        "en": {
          "title": "Studio opens a new doorway",
          "summary": "The official Studio announcement presents browser-based tools for building and testing contracts.",
          "note": "The article or announcement date does not represent the date the technology was first invented."
        },
        "ja": {
          "title": "Studio 開発ツールの発表",
          "summary": "ブラウザベースの Studio を紹介し、コントラクトの作成・テスト・デバッグを容易に。",
          "note": "記事や発表の日付は、その技術が最初に発明された日付を表すものではありません。"
        },
        "ko": {
          "title": "Studio 개발 도구 발표",
          "summary": "스마트 컨트랙트 작성, 테스트 및 디버깅을 돕는 브라우저 기반 Studio를 소개했습니다.",
          "note": "게시글이나 발표 날짜가 해당 기술이 최초로 발명된 날짜를 의미하지는 않습니다."
        },
        "es": {
          "title": "Studio abre una nueva puerta",
          "summary": "El anuncio oficial de Studio presenta herramientas en el navegador para crear y probar contratos.",
          "note": "La fecha del artículo o anuncio no representa la fecha en que se inventó por primera vez dicha tecnología."
        }
      },
      "sourceLabel": "GenLayer official blog",
      "sourceUrl": "https://genlayer.com/blog/code-with-the-genlayer-studio",
      "checkedOn": "2026-10-31",
      "note": "文章或公告日期不代表该技术首次被发明的日期。",
      "accentColor": "#c084fc"
    },
    {
      "id": "gl-06",
      "date": "2025-01-29",
      "dateKind": "announcement",
      "title": "ZKsync 合作公告",
      "summary": "官方公布 GenLayer Chain 与 ZKsync Elastic Network 的基础设施合作。",
      "i18n": {
        "zh-CN": {
          "title": "ZKsync 合作公告",
          "summary": "官方公布 GenLayer Chain 与 ZKsync Elastic Network 的基础设施合作。",
          "note": "文章或公告日期不代表该技术首次被发明的日期。"
        },
        "en": {
          "title": "Connecting with ZKsync",
          "summary": "GenLayer announces infrastructure integration with the ZKsync Elastic Network.",
          "note": "The article or announcement date does not represent the date the technology was first invented."
        },
        "ja": {
          "title": "ZKsync 提携の発表",
          "summary": "GenLayer Chain と ZKsync Elastic Network のインフラ提携を公表。",
          "note": "記事や発表の日付は、その技術が最初に発明された日付を表すものではありません。"
        },
        "ko": {
          "title": "ZKsync 파트너십 발표",
          "summary": "GenLayer Chain과 ZKsync Elastic Network 간의 인프라 협력을 발표했습니다.",
          "note": "게시글이나 발표 날짜가 해당 기술이 최초로 발명된 날짜를 의미하지는 않습니다."
        },
        "es": {
          "title": "Conectando con ZKsync",
          "summary": "GenLayer anuncia la integración de infraestructura con ZKsync Elastic Network.",
          "note": "La fecha del artículo o anuncio no representa la fecha en que se inventó por primera vez dicha tecnología."
        }
      },
      "sourceLabel": "GenLayer official blog",
      "sourceUrl": "https://genlayer.com/blog/genlayer-partners-with-zksync-to-launch-genlayer-chain-on-elastic-network",
      "checkedOn": "2026-10-31",
      "note": "文章或公告日期不代表该技术首次被发明的日期。",
      "accentColor": "#e879f9"
    },
    {
      "id": "gl-07",
      "date": "2025-06-11",
      "dateKind": "announcement",
      "title": "面向 AI 时代的新品牌",
      "summary": "官方发布品牌更新，强调面向 AI 时代的信任基础设施。",
      "i18n": {
        "zh-CN": {
          "title": "面向 AI 时代的新品牌",
          "summary": "官方发布品牌更新，强调面向 AI 时代的信任基础设施。",
          "note": "文章或公告日期不代表该技术首次被发明的日期。"
        },
        "en": {
          "title": "Trust infrastructure for the AI age",
          "summary": "A brand update introduces the focus on trust infrastructure for the AI age.",
          "note": "The article or announcement date does not represent the date the technology was first invented."
        },
        "ja": {
          "title": "AI時代に向けた新ブランド",
          "summary": "ブランド刷新を発表し、AI時代のための信頼インフラストラクチャを強調。",
          "note": "記事や発表の日付は、その技術が最初に発明された日付を表すものではありません。"
        },
        "ko": {
          "title": "AI 시대를 향한 새로운 브랜드",
          "summary": "브랜드 업데이트를 발표하며 AI 시대를 위한 신뢰 인프라를 강조했습니다.",
          "note": "게시글이나 발표 날짜가 해당 기술이 최초로 발명된 날짜를 의미하지는 않습니다."
        },
        "es": {
          "title": "Infraestructura de confianza para la era de la IA",
          "summary": "Una actualización de marca presenta el enfoque en infraestructura de confianza para la era de la IA.",
          "note": "La fecha del artículo o anuncio no representa la fecha en que se inventó por primera vez dicha tecnología."
        }
      },
      "sourceLabel": "GenLayer official blog",
      "sourceUrl": "https://genlayer.com/blog/announcing-genlayers-new-brand-trust-infrastructure-for-the-ai-age",
      "checkedOn": "2026-10-31",
      "note": "文章或公告日期不代表该技术首次被发明的日期。",
      "accentColor": "#f472b6"
    },
    {
      "id": "gl-08",
      "date": "2025-06-17",
      "dateKind": "event",
      "title": "Asimov 启动",
      "summary": "激励验证者测试网 Asimov 启动，测试基础设施与共识流程。",
      "i18n": {
        "zh-CN": {
          "title": "Asimov 启动",
          "summary": "激励验证者测试网 Asimov 启动，测试基础设施与共识流程。",
          "note": "正文明确启动日为 2025-06-17；页面发表日期为 2025-06-18，游戏显示事件日。"
        },
        "en": {
          "title": "Asimov begins",
          "summary": "The incentivized Asimov testnet launches to test infrastructure and consensus workflows.",
          "note": "The article text explicitly states the launch date as 2025-06-17; the page publication date is 2025-06-18, and the game displays the event date."
        },
        "ja": {
          "title": "Asimov 始動",
          "summary": "インセンティブ付きバリデータテストネット Asimov が始動し、インフラと合意フローを検証。",
          "note": "本文で始動日は 2025-06-17 と明記。ページ公開日は 2025-06-18 であり、ゲーム内ではイベント日を表示します。"
        },
        "ko": {
          "title": "Asimov 가동 시작",
          "summary": "인센티브 검증자 테스트넷 Asimov가 시작되어 인프라와 합의 워크플로우를 테스트합니다.",
          "note": "본문에 명시된 가동일은 2025-06-17이며 페이지 게시일은 2025-06-18입니다. 게임은 실제 이벤트 날짜를 표시합니다."
        },
        "es": {
          "title": "Comienza Asimov",
          "summary": "La testnet incentivada Asimov se lanza para probar la infraestructura y los flujos de consenso.",
          "note": "El texto especifica el 2025-06-17 como fecha de inicio; la página se publicó el 2025-06-18. El juego muestra la fecha del evento."
        }
      },
      "sourceLabel": "GenLayer official blog",
      "sourceUrl": "https://genlayer.com/blog/genlayer-launches-incentivized-testnet-asimov-the-court-of-the-internet-activates",
      "checkedOn": "2026-10-31",
      "note": "正文明确启动日为 2025-06-17；页面发表日期为 2025-06-18，游戏显示事件日。",
      "publishedDate": "2025-06-18",
      "accentColor": "#fb7185"
    },
    {
      "id": "gl-09",
      "date": "2025-07-10",
      "dateKind": "announcement",
      "title": "io.net 合作文章发布",
      "summary": "双方公布合作，为 AI 驱动的验证与应用提供去中心化算力支持。",
      "i18n": {
        "zh-CN": {
          "title": "io.net 合作文章发布",
          "summary": "双方公布合作，为 AI 驱动的验证与应用提供去中心化算力支持。",
          "note": "页面发布日期为 2025-07-10；正文新闻稿署日为 2025-07-01，游戏以文章发布日展示，不混淆二者。"
        },
        "en": {
          "title": "A wider inference network",
          "summary": "The partnership connects decentralized compute with AI-powered validation and applications.",
          "note": "The page publication date is 2025-07-10 while the press release dateline inside the text is 2025-07-01; the game displays the article publication date without conflating the two."
        },
        "ja": {
          "title": "io.net 提携記事の公開",
          "summary": "AI駆動の検証とアプリケーションに分散型計算力を提供する提携を発表。",
          "note": "ページ公開日は 2025-07-10、本文プレスリリースの日付は 2025-07-01。両者を混同せず記事公開日として表示します。"
        },
        "ko": {
          "title": "io.net 파트너십 게시글 공개",
          "summary": "AI 기반 검증 및 애플리케이션에 탈중앙화 연산력을 지원하는 파트너십을 발표했습니다.",
          "note": "페이지 게시일은 2025-07-10이고 본문 보도자료 표기일은 2025-07-01입니다. 두 날짜를 혼동하지 않고 게시글 발행일로 표시합니다."
        },
        "es": {
          "title": "Una red de inferencia más amplia",
          "summary": "La alianza conecta el cómputo descentralizado con la validación y aplicaciones impulsadas por IA.",
          "note": "La fecha de publicación de la página es 2025-07-10; el comunicado en el texto tiene fecha 2025-07-01. El juego muestra la fecha de publicación del artículo sin confundirlas."
        }
      },
      "sourceLabel": "GenLayer official blog",
      "sourceUrl": "https://genlayer.com/blog/genlayer-partners-with-io-net-to-unlock-decentralized-gpu-infrastructure-for-ai-powered-dapps-agents",
      "checkedOn": "2026-10-31",
      "note": "页面发布日期为 2025-07-10；正文新闻稿署日为 2025-07-01，游戏以文章发布日展示，不混淆二者。",
      "accentColor": "#34d399"
    },
    {
      "id": "gl-10",
      "date": "2025-12-18",
      "dateKind": "roadmap-publication",
      "title": "公开主网路线图",
      "summary": "官方解释 Asimov、Bradbury、Clarke 的阶段目标与主网前准备。",
      "i18n": {
        "zh-CN": {
          "title": "公开主网路线图",
          "summary": "官方解释 Asimov、Bradbury、Clarke 的阶段目标与主网前准备。",
          "note": "文章或公告日期不代表该技术首次被发明的日期。"
        },
        "en": {
          "title": "The road toward mainnet",
          "summary": "The roadmap explains the Asimov, Bradbury and Clarke stages on the path toward mainnet.",
          "note": "The article or announcement date does not represent the date the technology was first invented."
        },
        "ja": {
          "title": "メインネットロードマップ公開",
          "summary": "Asimov、Bradbury、Clarke の各段階の目標とメインネットに向けた準備を解説。",
          "note": "記事や発表の日付は、その技術が最初に発明された日付を表すものではありません。"
        },
        "ko": {
          "title": "메인넷 로드맵 공개",
          "summary": "메인넷을 향한 Asimov, Bradbury, Clarke 단계별 목표와 준비 과정을 설명했습니다.",
          "note": "게시글이나 발표 날짜가 해당 기술이 최초로 발명된 날짜를 의미하지는 않습니다."
        },
        "es": {
          "title": "El camino hacia mainnet",
          "summary": "La hoja de ruta explica las etapas Asimov, Bradbury y Clarke en el camino hacia mainnet.",
          "note": "La fecha del artículo o anuncio no representa la fecha en que se inventó por primera vez dicha tecnología."
        }
      },
      "sourceLabel": "GenLayer official blog",
      "sourceUrl": "https://genlayer.com/blog/genlayer-roadmap-to-mainnet",
      "checkedOn": "2026-10-31",
      "note": "文章或公告日期不代表该技术首次被发明的日期。",
      "accentColor": "#2dd4bf"
    },
    {
      "id": "gl-11",
      "date": "2026-01-08",
      "dateKind": "announcement",
      "title": "Bradbury 阶段介绍",
      "summary": "官方详解 Bradbury 的模型选择、推理与验证实验方向。",
      "i18n": {
        "zh-CN": {
          "title": "Bradbury 阶段介绍",
          "summary": "官方详解 Bradbury 的模型选择、推理与验证实验方向。",
          "note": "2026-01-08 是阶段介绍公告日，不单独据此声称网络在该日首次上线。"
        },
        "en": {
          "title": "Inside Bradbury",
          "summary": "The team outlines Bradbury experiments in model selection, inference and validation.",
          "note": "2026-01-08 is the stage introduction announcement date; it does not by itself claim the network first went live on that date."
        },
        "ja": {
          "title": "Bradbury フェーズ紹介",
          "summary": "Bradbury におけるモデル選択、推論、検証実験の方向性を詳しく解説。",
          "note": "2026-01-08 はフェーズ紹介の発表日であり、この日にネットワークが初めて稼働したと主張するものではありません。"
        },
        "ko": {
          "title": "Bradbury 단계 소개",
          "summary": "Bradbury의 모델 선택, 추론 및 검증 실험 방향을 상세히 설명했습니다.",
          "note": "2026-01-08은 단계 소개 발표일이며, 이를 근거로 네트워크가 해당 날짜에 처음 가동되었다고 주장하지 않습니다."
        },
        "es": {
          "title": "Dentro de Bradbury",
          "summary": "El equipo detalla los experimentos de Bradbury en selección de modelos, inferencia y validación.",
          "note": "2026-01-08 es la fecha del anuncio de presentación de la etapa; no se afirma únicamente por ello que la red se haya lanzado por primera vez ese día."
        }
      },
      "sourceLabel": "GenLayer official blog",
      "sourceUrl": "https://genlayer.com/blog/announcing-testnet-bradbury",
      "checkedOn": "2026-10-31",
      "note": "2026-01-08 是阶段介绍公告日，不单独据此声称网络在该日首次上线。",
      "accentColor": "#fbbf24"
    },
    {
      "id": "gl-12",
      "date": "2026-08-14",
      "dateKind": "publication",
      "title": "安全架构专题发布",
      "summary": "官方介绍共识合约、验证节点与 GenVM 的多层防护设计。",
      "i18n": {
        "zh-CN": {
          "title": "安全架构专题发布",
          "summary": "官方介绍共识合约、验证节点与 GenVM 的多层防护设计。",
          "note": "文章或公告日期不代表该技术首次被发明的日期。"
        },
        "en": {
          "title": "Building layers of security",
          "summary": "An architecture article explains defense in depth across consensus contracts, validators and GenVM.",
          "note": "The article or announcement date does not represent the date the technology was first invented."
        },
        "ja": {
          "title": "セキュリティアーキテクチャ特集の公開",
          "summary": "コンセンサスコントラクト、バリデータ、GenVM にわたる多層防御設計を紹介。",
          "note": "記事や発表の日付は、その技術が最初に発明された日付を表すものではありません。"
        },
        "ko": {
          "title": "보안 아키텍처 특집 공개",
          "summary": "합의 컨트랙트, 검증 노드 및 GenVM 전반의 다층 방어 설계를 소개했습니다.",
          "note": "게시글이나 발표 날짜가 해당 기술이 최초로 발명된 날짜를 의미하지는 않습니다."
        },
        "es": {
          "title": "Construyendo capas de seguridad",
          "summary": "Un artículo de arquitectura explica la defensa en profundidad entre contratos de consenso, validadores y GenVM.",
          "note": "La fecha del artículo o anuncio no representa la fecha en que se inventó por primera vez dicha tecnología."
        }
      },
      "sourceLabel": "GenLayer official blog",
      "sourceUrl": "https://genlayer.com/blog/making-genlayer-100-percent-secure-part-1-the-architecture",
      "checkedOn": "2026-10-31",
      "note": "文章或公告日期不代表该技术首次被发明的日期。",
      "accentColor": "#19e6ff"
    }
  ]
};

export const GENLAYER_HISTORY_MILESTONES: GenLayerMilestone[] =
  GENLAYER_HISTORY_DATA.milestones;
