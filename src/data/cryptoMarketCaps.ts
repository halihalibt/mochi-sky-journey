export interface CryptoMilestone {
  symbol: string;
  name: string;
  athCirculatingMarketCapUSD: number;
  peakDate: string;
  circulatingSupplyNote: string;
  brandColor: string;
  source: string;
}

export interface MarketCapDatasetMeta {
  methodology: string;
  primarySources: string[];
  granularity: string;
  verifiedSnapshotDate: string;
  simulationDisclaimer: string;
}

export const MARKET_CAP_DATASET_META: MarketCapDatasetMeta = {
  methodology:
    '严格采用各币种在历史交易日实际达到的【最高流通市值（Peak Historical Circulating Market Cap = 当日价格 × 当日实际流通供应量）】。严禁将历史最高单价乘以当前通胀后的供应量，且不包含未解锁代币的完全稀释估值（FDV）。',
  primarySources: [
    'CoinGecko Historical Daily Market Cap Archives',
    'CoinMarketCap Historical Snapshots'
  ],
  granularity: '日级历史归档峰值数据（精确至 0.1B USD）',
  verifiedSnapshotDate: '2025-01-15',
  simulationDisclaimer:
    '本游戏中的 1 亿美元起点及攀爬市值纯属游戏进度模拟，不代表 GenLayer 真实市值、代币发行计划或任何官方价格预测。'
};

export const CRYPTO_MARKET_CAP_MILESTONES: CryptoMilestone[] = [
  {
    symbol: 'NEAR',
    name: 'NEAR Protocol',
    athCirculatingMarketCapUSD: 12_800_000_000,
    peakDate: '2022-01-16',
    circulatingSupplyNote: '峰值时流通量约 6.15 亿枚（单价约 $20.4），后续年份虽流通量增至 11 亿+，但总流通市值未超此峰值',
    brandColor: '#00ec97',
    source: 'CoinGecko Historical Daily Snapshot (2022-01-16)'
  },
  {
    symbol: 'LINK',
    name: 'Chainlink',
    athCirculatingMarketCapUSD: 22_100_000_000,
    peakDate: '2021-05-10',
    circulatingSupplyNote: '峰值当日流通量约 4.26 亿枚（单价约 $52.7），不含团队及生态未释放份额',
    brandColor: '#375bd2',
    source: 'CoinMarketCap Historical Archive (2021-05-10)'
  },
  {
    symbol: 'LTC',
    name: 'Litecoin',
    athCirculatingMarketCapUSD: 25_600_000_000,
    peakDate: '2021-05-10',
    circulatingSupplyNote: '峰值当日流通量约 6,675 万枚（单价约 $386）',
    brandColor: '#345d9d',
    source: 'CoinMarketCap Historical Archive (2021-05-10)'
  },
  {
    symbol: 'AVAX',
    name: 'Avalanche',
    athCirculatingMarketCapUSD: 30_400_000_000,
    peakDate: '2021-11-21',
    circulatingSupplyNote: '2021年11月价格达 $144.96 时流通量约 2.2 亿枚（约 $30.4B），严格排除未解锁 FDV',
    brandColor: '#e84142',
    source: 'CoinGecko Historical Daily Snapshot (2021-11-21)'
  },
  {
    symbol: 'SHIB',
    name: 'Shiba Inu',
    athCirculatingMarketCapUSD: 41_100_000_000,
    peakDate: '2021-10-28',
    circulatingSupplyNote: '基于已扣除销毁地址后的约 549 万亿枚实际流通供应量核算',
    brandColor: '#ffa409',
    source: 'CoinGecko Historical Daily Snapshot (2021-10-28)'
  },
  {
    symbol: 'DOT',
    name: 'Polkadot',
    athCirculatingMarketCapUSD: 53_900_000_000,
    peakDate: '2021-11-04',
    circulatingSupplyNote: '平行链插槽拍卖前夕达 $54.98，对应当时约 9.87 亿枚流通供应量',
    brandColor: '#e6007a',
    source: 'CoinMarketCap Historical Archive (2021-11-04)'
  },
  {
    symbol: 'DOGE',
    name: 'Dogecoin',
    athCirculatingMarketCapUSD: 88_800_000_000,
    peakDate: '2021-05-08',
    circulatingSupplyNote: '峰值当日流通量约 1,295 亿枚（单价约 $0.68~0.73 日内峰值折算）',
    brandColor: '#c2a633',
    source: 'CoinGecko Historical Daily Snapshot (2021-05-08)'
  },
  {
    symbol: 'ADA',
    name: 'Cardano',
    athCirculatingMarketCapUSD: 94_800_000_000,
    peakDate: '2021-09-02',
    circulatingSupplyNote: 'Alonzo 硬分叉前夕单价达 $3.09，对应当时约 320 亿枚流通供应量',
    brandColor: '#0033ad',
    source: 'CoinMarketCap Historical Archive (2021-09-02)'
  },
  {
    symbol: 'BNB',
    name: 'BNB',
    athCirculatingMarketCapUSD: 112_500_000_000,
    peakDate: '2024-12-04',
    circulatingSupplyNote: '经季度销毁后流通量降至约 1.44 亿枚，单价突破 $780 时创下实际流通市值峰值',
    brandColor: '#f3ba2f',
    source: 'CoinGecko Historical Daily Snapshot (2024-12-04)'
  },
  {
    symbol: 'SOL',
    name: 'Solana',
    athCirculatingMarketCapUSD: 127_400_000_000,
    peakDate: '2024-11-22',
    circulatingSupplyNote: '2021年11月SOL单价$259时流通市值约$78B；2024年11月随流通量增至4.74亿枚且价格突破$263，创下真实流通市值新高',
    brandColor: '#14f195',
    source: 'CoinGecko Historical Daily Snapshot (2024-11-22)'
  },
  {
    symbol: 'XRP',
    name: 'XRP',
    athCirculatingMarketCapUSD: 162_000_000_000,
    peakDate: '2025-01-15',
    circulatingSupplyNote: '基于约 574 亿枚实际流通供应量核算（严格剔除 Ripple 托管账户锁仓的 ~425 亿枚）',
    brandColor: '#38bdf8',
    source: 'CoinMarketCap Circulating Supply Standard (2025-01 Snapshot)'
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    athCirculatingMarketCapUSD: 571_600_000_000,
    peakDate: '2021-11-10',
    circulatingSupplyNote: '峰值当日流通量约 1.183 亿枚（单价 $4,878）',
    brandColor: '#627eea',
    source: 'CoinMarketCap Historical Archive (2021-11-10)'
  },
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    athCirculatingMarketCapUSD: 1_960_000_000_000,
    peakDate: '2024-12-17',
    circulatingSupplyNote: '对应已挖出流通供应量约 1,979 万枚 BTC，作为高塔顶点登顶里程碑',
    brandColor: '#f7931a',
    source: 'CoinGecko Historical Daily Snapshot (2024-12-17)'
  }
];
