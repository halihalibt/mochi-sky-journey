export interface GenLayerMilestone {
  id: string;
  date: string;
  title: string;
  summary: string;
  accentColor: string;
  sourceLabel: string;
  sourceUrl: string;
}

export const GENLAYER_HISTORY_MILESTONES: GenLayerMilestone[] = [
  {
    id: 'gl-01-vision',
    date: '2024-03',
    title: '智能合约的 AI 觉醒',
    summary: '提出“智能合约（Intelligent Contracts）”愿景，让区块链合约第一次能够直接调用大模型并理解自然语言。',
    accentColor: '#38bdf8',
    sourceLabel: 'GenLayer Official Documentation - Introduction',
    sourceUrl: 'https://docs.genlayer.com/'
  },
  {
    id: 'gl-02-whitepaper',
    date: '2024-04',
    title: '发布 GenLayer 技术白皮书',
    summary: '正式阐述 Optimistic Democracy（乐观民主）共识机制，解决多个 AI 节点输出不一致时的去中心化裁决难题。',
    accentColor: '#60a5fa',
    sourceLabel: 'GenLayer Whitepaper & Core Concepts',
    sourceUrl: 'https://docs.genlayer.com/'
  },
  {
    id: 'gl-03-equivalence',
    date: '2024-05',
    title: '确立“等价性原则”核心机制',
    summary: '引入 Equivalence Principle，允许验证节点在不要求逐字相同的情况下，对 AI 生成的结果达成语义共识。',
    accentColor: '#818cf8',
    sourceLabel: 'GenLayer Equivalence Principle Specification',
    sourceUrl: 'https://docs.genlayer.com/'
  },
  {
    id: 'gl-04-web-access',
    date: '2024-05',
    title: '原生联网能力（Native Web Access）',
    summary: '打破传统预言机限制，让链上合约能够直接读取互联网网页与实时资讯，并由多节点交叉验证真伪。',
    accentColor: '#a78bfa',
    sourceLabel: 'GenLayer Features - Web Data Integration',
    sourceUrl: 'https://www.genlayer.com/'
  },
  {
    id: 'gl-05-seed-round',
    date: '2024-06',
    title: '完成 750 万美元种子轮融资',
    summary: '由 North Island Ventures 领投，多家知名加密机构参投，加速推进 AI 原生区块链底层研发。',
    accentColor: '#c084fc',
    sourceLabel: 'GenLayer Official Announcement (Seed Funding)',
    sourceUrl: 'https://www.genlayer.com/'
  },
  {
    id: 'gl-06-simulator',
    date: '2024-07',
    title: '开源 GenLayer 模拟器与 Python SDK',
    summary: '开发者无需学习晦涩的新语言，直接用熟悉的 Python 即可编写和本地调试具备 AI 推理能力的链上合约。',
    accentColor: '#e879f9',
    sourceLabel: 'GenLayer GitHub & Studio Documentation',
    sourceUrl: 'https://github.com/yeagerai/genlayer-simulator'
  },
  {
    id: 'gl-07-studio',
    date: '2024-09',
    title: 'GenLayer Studio 在线沙盒上线',
    summary: '推出零配置浏览器端开发环境，让全球开发者一键部署、测试并可视化观察多 AI 验证节点的共识投票过程。',
    accentColor: '#f472b6',
    sourceLabel: 'GenLayer Studio Release',
    sourceUrl: 'https://studio.genlayer.com/'
  },
  {
    id: 'gl-08-studionet',
    date: '2024-11',
    title: 'Studionet 公共开发网络开放',
    summary: '从本地单机模拟迈向共享测试网络（Chain ID: 61999），支持前端应用通过标准 RPC 与智能合约实时交互。',
    accentColor: '#fb7185',
    sourceLabel: 'GenLayer Studionet RPC & Network Docs',
    sourceUrl: 'https://studio.genlayer.com/'
  },
  {
    id: 'gl-09-testnet-asimov',
    date: '2025-01',
    title: '启动激励测试网阶段演进',
    summary: '以科幻大师命名的测试网阶段逐步开启，验证大规模分布式验证节点与多模型异构共识的稳定性。',
    accentColor: '#34d399',
    sourceLabel: 'GenLayer Testnet Roadmap',
    sourceUrl: 'https://www.genlayer.com/'
  },
  {
    id: 'gl-10-mochi-community',
    date: '2025-06',
    title: '吉祥物 Mochi 与开发者生态壮大',
    summary: '官方吉祥物 Mochi 成为社区与黑客松的文化符号，陪伴开发者共同探索主观共识与链上 AI 应用的新大陆。',
    accentColor: '#fbbf24',
    sourceLabel: 'GenLayer Community & Brand Assets',
    sourceUrl: 'https://www.genlayer.com/'
  }
];
