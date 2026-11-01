export interface MarketCapDatasetMeta {
  version: string;
  retrievedOn: string;
  dataThroughUTC: string;
  currency: string;
  frequency: string;
  metric: 'CapMrktEstUSD';
  methodology: string;
  scopeWarning: string;
  dateRule: string;
  methodologyUrl: string;
  attribution: string;
  licenseUrl: string;
  uiLabelZh: string;
  uiLabelEn: string;
  popupZh: string;
  popupEn: string;
  uiFootnoteZh: string;
  simulationDisclaimer: string;
  primarySources: string[];
  granularity: string;
  verifiedSnapshotDate: string;
}

export interface CryptoMilestone {
  symbol: string;
  name: string;
  recordMarketCapUSD: number;
  recordMarketCapUSDExact: string;
  peakObservationTimeUTC: string;
  recordDateUTC: string;
  coverageStartUTC: string;
  coverageEndUTC: string;
  dailyObservationCount: number;
  missingDaysWithinCoverage: number;
  scope: 'maximum_of_available_daily_circulating_market_cap_series';
  sourceMetric: 'CapMrktEstUSD';
  sourceLabel: string;
  sourceUrl: string;
  rawResponseSHA256: string;
  checkedOn: string;
  brandColor: string;
  isMajorCheckpoint: boolean;
  // Backward-compatible aliases
  athCirculatingMarketCapUSD: number;
  peakDate: string;
  circulatingSupplyNote: string;
  source: string;
}

export interface SimulationProgressMilestone {
  id: string;
  thresholdUSD: number;
  isSimulationMilestone: true;
  badgeColor: string;
  i18n: Record<
    'zh-CN' | 'en' | 'ja' | 'ko' | 'es',
    { title: string; disclaimer: string }
  >;
}

export interface CryptoMarketCapDataset {
  meta: MarketCapDatasetMeta;
  milestones: CryptoMilestone[];
}

export const MARKET_CAP_DATA: CryptoMarketCapDataset = {
  "meta": {
    "version": "2026-10-31-daily-records-v1",
    "retrievedOn": "2026-10-31",
    "dataThroughUTC": "2026-10-30",
    "currency": "USD",
    "frequency": "1d",
    "metric": "CapMrktEstUSD",
    "methodology": "对每个币种来源覆盖期内的全部非空正值日级流通市值取最大值；使用历史当期供应量与历史价格，不使用今天供应量，不用FDV。",
    "scopeWarning": "这是来源覆盖期内最高日级流通市值，不是已验证的自上市以来全市场盘中绝对最高值。覆盖范围之外不作断言。不同供应量口径与日内价格会产生差异。",
    "dateRule": "日期严格保留API的UTC观测时间，不擅自加减一天，不将其称为最高币价日。",
    "methodologyUrl": "https://gitbook-docs.coinmetrics.io/network-data/network-data-overview/market/market-capitalization",
    "attribution": "Data: Coin Metrics Community Data, CC BY-NC 4.0. https://github.com/coinmetrics/data",
    "licenseUrl": "https://github.com/coinmetrics/data/blob/master/LICENSE",
    "uiLabelZh": "历史日级市值纪录",
    "uiLabelEn": "Historical daily market-cap record",
    "popupZh": "已超越 {symbol} 的历史日级市值纪录",
    "popupEn": "Surpassed {symbol}’s historical daily market-cap record",
    "uiFootnoteZh": "固定数据版本；来源覆盖期内日级峰值，非实时行情或盘中绝对最高值。",
    "simulationDisclaimer": "1亿美元是游戏模拟起点，不代表GenLayer真实市值或价格预测。",
    "primarySources": [
      "Coin Metrics Community API (CapMrktEstUSD, 1d)",
      "https://github.com/coinmetrics/data (CC BY-NC 4.0)"
    ],
    "granularity": "日级历史流通市值观测序列 (68,046 条日级观测，截至 2026-10-30 UTC)",
    "verifiedSnapshotDate": "2026-10-31"
  },
  "milestones": [
    {
      "symbol": "1INCH",
      "name": "1inch",
      "recordMarketCapUSD": 1203428089.13,
      "recordMarketCapUSDExact": "1203428089.12970842038955879699546054980492",
      "peakObservationTimeUTC": "2021-05-08T00:00:00.000000000Z",
      "recordDateUTC": "2021-05-08",
      "coverageStartUTC": "2020-12-26",
      "coverageEndUTC": "2026-10-30",
      "dailyObservationCount": 2135,
      "missingDaysWithinCoverage": 0,
      "scope": "maximum_of_available_daily_circulating_market_cap_series",
      "sourceMetric": "CapMrktEstUSD",
      "sourceLabel": "Coin Metrics Community API",
      "sourceUrl": "https://community-api.coinmetrics.io/v4/timeseries/asset-metrics?assets=1inch&metrics=CapMrktEstUSD&frequency=1d&start_time=2009-01-01&end_time=2026-10-30T23%3A59%3A59Z&page_size=10000",
      "rawResponseSHA256": "c19e43136a360c0ec69a092e3fe14789476717f5456dff64cbe064f348af8f79",
      "checkedOn": "2026-10-31",
      "brandColor": "#3b82f6",
      "isMajorCheckpoint": true,
      "athCirculatingMarketCapUSD": 1203428089.13,
      "peakDate": "2021-05-08",
      "circulatingSupplyNote": "Coin Metrics CapMrktEstUSD 覆盖期 (2020-12-26 至 2026-10-30) 内共 2135 条日级观测之最高流通市值",
      "source": "Coin Metrics Community API (CapMrktEstUSD, SHA256: c19e43136a36...)"
    },
    {
      "symbol": "BAT",
      "name": "Basic Attention Token",
      "recordMarketCapUSD": 2603321456.6,
      "recordMarketCapUSDExact": "2603321456.5993655192560158780144652157505",
      "peakObservationTimeUTC": "2021-11-27T00:00:00.000000000Z",
      "recordDateUTC": "2021-11-27",
      "coverageStartUTC": "2019-06-22",
      "coverageEndUTC": "2026-10-30",
      "dailyObservationCount": 2688,
      "missingDaysWithinCoverage": 0,
      "scope": "maximum_of_available_daily_circulating_market_cap_series",
      "sourceMetric": "CapMrktEstUSD",
      "sourceLabel": "Coin Metrics Community API",
      "sourceUrl": "https://community-api.coinmetrics.io/v4/timeseries/asset-metrics?assets=bat&metrics=CapMrktEstUSD&frequency=1d&start_time=2009-01-01&end_time=2026-10-30T23%3A59%3A59Z&page_size=10000",
      "rawResponseSHA256": "75b1ec5dce5b31ffb44c981eff207c04b3e8c2b6298d2c646b5df869589a8cad",
      "checkedOn": "2026-10-31",
      "brandColor": "#ff5000",
      "isMajorCheckpoint": false,
      "athCirculatingMarketCapUSD": 2603321456.6,
      "peakDate": "2021-11-27",
      "circulatingSupplyNote": "Coin Metrics CapMrktEstUSD 覆盖期 (2019-06-22 至 2026-10-30) 内共 2688 条日级观测之最高流通市值",
      "source": "Coin Metrics Community API (CapMrktEstUSD, SHA256: 75b1ec5dce5b...)"
    },
    {
      "symbol": "INJ",
      "name": "Injective",
      "recordMarketCapUSD": 4543140374.24,
      "recordMarketCapUSDExact": "4543140374.236108427091036",
      "peakObservationTimeUTC": "2024-03-12T00:00:00.000000000Z",
      "recordDateUTC": "2024-03-12",
      "coverageStartUTC": "2020-10-22",
      "coverageEndUTC": "2026-10-30",
      "dailyObservationCount": 2200,
      "missingDaysWithinCoverage": 0,
      "scope": "maximum_of_available_daily_circulating_market_cap_series",
      "sourceMetric": "CapMrktEstUSD",
      "sourceLabel": "Coin Metrics Community API",
      "sourceUrl": "https://community-api.coinmetrics.io/v4/timeseries/asset-metrics?assets=inj&metrics=CapMrktEstUSD&frequency=1d&start_time=2009-01-01&end_time=2026-10-30T23%3A59%3A59Z&page_size=10000",
      "rawResponseSHA256": "4a7b61c44f39b07773fc242e549668fd3a11c4e8eeb296140d565a6729f4339b",
      "checkedOn": "2026-10-31",
      "brandColor": "#00f2fe",
      "isMajorCheckpoint": false,
      "athCirculatingMarketCapUSD": 4543140374.24,
      "peakDate": "2024-03-12",
      "circulatingSupplyNote": "Coin Metrics CapMrktEstUSD 覆盖期 (2020-10-22 至 2026-10-30) 内共 2200 条日级观测之最高流通市值",
      "source": "Coin Metrics Community API (CapMrktEstUSD, SHA256: 4a7b61c44f39...)"
    },
    {
      "symbol": "OP",
      "name": "Optimism",
      "recordMarketCapUSD": 4714474328.23,
      "recordMarketCapUSDExact": "4714474328.232706261696",
      "peakObservationTimeUTC": "2024-03-09T00:00:00.000000000Z",
      "recordDateUTC": "2024-03-09",
      "coverageStartUTC": "2022-06-22",
      "coverageEndUTC": "2026-10-30",
      "dailyObservationCount": 1592,
      "missingDaysWithinCoverage": 0,
      "scope": "maximum_of_available_daily_circulating_market_cap_series",
      "sourceMetric": "CapMrktEstUSD",
      "sourceLabel": "Coin Metrics Community API",
      "sourceUrl": "https://community-api.coinmetrics.io/v4/timeseries/asset-metrics?assets=op&metrics=CapMrktEstUSD&frequency=1d&start_time=2009-01-01&end_time=2026-10-30T23%3A59%3A59Z&page_size=10000",
      "rawResponseSHA256": "daa323546fdb63ca12a5aec8a92fa51dc43bf177e162a74cbff89df5db211b32",
      "checkedOn": "2026-10-31",
      "brandColor": "#ff0420",
      "isMajorCheckpoint": false,
      "athCirculatingMarketCapUSD": 4714474328.23,
      "peakDate": "2024-03-09",
      "circulatingSupplyNote": "Coin Metrics CapMrktEstUSD 覆盖期 (2022-06-22 至 2026-10-30) 内共 1592 条日级观测之最高流通市值",
      "source": "Coin Metrics Community API (CapMrktEstUSD, SHA256: daa323546fdb...)"
    },
    {
      "symbol": "ARB",
      "name": "Arbitrum",
      "recordMarketCapUSD": 4822939039.7,
      "recordMarketCapUSDExact": "4822939039.70419914570913",
      "peakObservationTimeUTC": "2024-12-06T00:00:00.000000000Z",
      "recordDateUTC": "2024-12-06",
      "coverageStartUTC": "2023-03-23",
      "coverageEndUTC": "2026-10-30",
      "dailyObservationCount": 1318,
      "missingDaysWithinCoverage": 0,
      "scope": "maximum_of_available_daily_circulating_market_cap_series",
      "sourceMetric": "CapMrktEstUSD",
      "sourceLabel": "Coin Metrics Community API",
      "sourceUrl": "https://community-api.coinmetrics.io/v4/timeseries/asset-metrics?assets=arb&metrics=CapMrktEstUSD&frequency=1d&start_time=2009-01-01&end_time=2026-10-30T23%3A59%3A59Z&page_size=10000",
      "rawResponseSHA256": "8b16a3f3325a046a689fef9be94c36139274fa04339d03f03aacb12d6c84604e",
      "checkedOn": "2026-10-31",
      "brandColor": "#28a0f0",
      "isMajorCheckpoint": true,
      "athCirculatingMarketCapUSD": 4822939039.7,
      "peakDate": "2024-12-06",
      "circulatingSupplyNote": "Coin Metrics CapMrktEstUSD 覆盖期 (2023-03-23 至 2026-10-30) 内共 1318 条日级观测之最高流通市值",
      "source": "Coin Metrics Community API (CapMrktEstUSD, SHA256: 8b16a3f3325a...)"
    },
    {
      "symbol": "CAKE",
      "name": "PancakeSwap",
      "recordMarketCapUSD": 6727312095.05,
      "recordMarketCapUSDExact": "6727312095.0468042770366998172",
      "peakObservationTimeUTC": "2021-04-29T00:00:00.000000000Z",
      "recordDateUTC": "2021-04-29",
      "coverageStartUTC": "2021-02-19",
      "coverageEndUTC": "2026-10-30",
      "dailyObservationCount": 2080,
      "missingDaysWithinCoverage": 0,
      "scope": "maximum_of_available_daily_circulating_market_cap_series",
      "sourceMetric": "CapMrktEstUSD",
      "sourceLabel": "Coin Metrics Community API",
      "sourceUrl": "https://community-api.coinmetrics.io/v4/timeseries/asset-metrics?assets=cake&metrics=CapMrktEstUSD&frequency=1d&start_time=2009-01-01&end_time=2026-10-30T23%3A59%3A59Z&page_size=10000",
      "rawResponseSHA256": "d964ff4cda171cff684675db5af615a823f3916adcd6923cf84d413ddd2c0452",
      "checkedOn": "2026-10-31",
      "brandColor": "#d1884f",
      "isMajorCheckpoint": false,
      "athCirculatingMarketCapUSD": 6727312095.05,
      "peakDate": "2021-04-29",
      "circulatingSupplyNote": "Coin Metrics CapMrktEstUSD 覆盖期 (2021-02-19 至 2026-10-30) 内共 2080 条日级观测之最高流通市值",
      "source": "Coin Metrics Community API (CapMrktEstUSD, SHA256: d964ff4cda17...)"
    },
    {
      "symbol": "SAND",
      "name": "The Sandbox",
      "recordMarketCapUSD": 6821929348.41,
      "recordMarketCapUSDExact": "6821929348.40759168253829019818305699540629",
      "peakObservationTimeUTC": "2021-11-28T00:00:00.000000000Z",
      "recordDateUTC": "2021-11-28",
      "coverageStartUTC": "2020-08-17",
      "coverageEndUTC": "2026-10-30",
      "dailyObservationCount": 2266,
      "missingDaysWithinCoverage": 0,
      "scope": "maximum_of_available_daily_circulating_market_cap_series",
      "sourceMetric": "CapMrktEstUSD",
      "sourceLabel": "Coin Metrics Community API",
      "sourceUrl": "https://community-api.coinmetrics.io/v4/timeseries/asset-metrics?assets=sand&metrics=CapMrktEstUSD&frequency=1d&start_time=2009-01-01&end_time=2026-10-30T23%3A59%3A59Z&page_size=10000",
      "rawResponseSHA256": "7ac0d42a14bd545f470030f6652ffa1d27b110fe87c62dd808f40e6a421cb1aa",
      "checkedOn": "2026-10-31",
      "brandColor": "#00adef",
      "isMajorCheckpoint": false,
      "athCirculatingMarketCapUSD": 6821929348.41,
      "peakDate": "2021-11-28",
      "circulatingSupplyNote": "Coin Metrics CapMrktEstUSD 覆盖期 (2020-08-17 至 2026-10-30) 内共 2266 条日级观测之最高流通市值",
      "source": "Coin Metrics Community API (CapMrktEstUSD, SHA256: 7ac0d42a14bd...)"
    },
    {
      "symbol": "MANA",
      "name": "Decentraland",
      "recordMarketCapUSD": 6882712141.5,
      "recordMarketCapUSDExact": "6882712141.49532119263015092511876478477751",
      "peakObservationTimeUTC": "2021-11-25T00:00:00.000000000Z",
      "recordDateUTC": "2021-11-25",
      "coverageStartUTC": "2019-06-22",
      "coverageEndUTC": "2026-10-30",
      "dailyObservationCount": 2688,
      "missingDaysWithinCoverage": 0,
      "scope": "maximum_of_available_daily_circulating_market_cap_series",
      "sourceMetric": "CapMrktEstUSD",
      "sourceLabel": "Coin Metrics Community API",
      "sourceUrl": "https://community-api.coinmetrics.io/v4/timeseries/asset-metrics?assets=mana&metrics=CapMrktEstUSD&frequency=1d&start_time=2009-01-01&end_time=2026-10-30T23%3A59%3A59Z&page_size=10000",
      "rawResponseSHA256": "2df39cbcf28866fbb81318edd21abca6364483731a0f7eb5c7826ee392e89455",
      "checkedOn": "2026-10-31",
      "brandColor": "#ff2d55",
      "isMajorCheckpoint": false,
      "athCirculatingMarketCapUSD": 6882712141.5,
      "peakDate": "2021-11-25",
      "circulatingSupplyNote": "Coin Metrics CapMrktEstUSD 覆盖期 (2019-06-22 至 2026-10-30) 内共 2688 条日级观测之最高流通市值",
      "source": "Coin Metrics Community API (CapMrktEstUSD, SHA256: 2df39cbcf288...)"
    },
    {
      "symbol": "APT",
      "name": "Aptos",
      "recordMarketCapUSD": 7869721610.64,
      "recordMarketCapUSDExact": "7869721610.64161623190014294604",
      "peakObservationTimeUTC": "2024-12-06T00:00:00.000000000Z",
      "recordDateUTC": "2024-12-06",
      "coverageStartUTC": "2022-10-20",
      "coverageEndUTC": "2026-10-30",
      "dailyObservationCount": 1472,
      "missingDaysWithinCoverage": 0,
      "scope": "maximum_of_available_daily_circulating_market_cap_series",
      "sourceMetric": "CapMrktEstUSD",
      "sourceLabel": "Coin Metrics Community API",
      "sourceUrl": "https://community-api.coinmetrics.io/v4/timeseries/asset-metrics?assets=apt&metrics=CapMrktEstUSD&frequency=1d&start_time=2009-01-01&end_time=2026-10-30T23%3A59%3A59Z&page_size=10000",
      "rawResponseSHA256": "c87432b6b119f28bc848b8acd51ad0ff808a45a9eeec0d9e85034fd1283594ad",
      "checkedOn": "2026-10-31",
      "brandColor": "#2dd4bf",
      "isMajorCheckpoint": false,
      "athCirculatingMarketCapUSD": 7869721610.64,
      "peakDate": "2024-12-06",
      "circulatingSupplyNote": "Coin Metrics CapMrktEstUSD 覆盖期 (2022-10-20 至 2026-10-30) 内共 1472 条日级观测之最高流通市值",
      "source": "Coin Metrics Community API (CapMrktEstUSD, SHA256: c87432b6b119...)"
    },
    {
      "symbol": "AAVE",
      "name": "Aave",
      "recordMarketCapUSD": 7997930761.11,
      "recordMarketCapUSDExact": "7997930761.113305214247099170399487762146",
      "peakObservationTimeUTC": "2021-05-18T00:00:00.000000000Z",
      "recordDateUTC": "2021-05-18",
      "coverageStartUTC": "2020-10-10",
      "coverageEndUTC": "2026-10-30",
      "dailyObservationCount": 2212,
      "missingDaysWithinCoverage": 0,
      "scope": "maximum_of_available_daily_circulating_market_cap_series",
      "sourceMetric": "CapMrktEstUSD",
      "sourceLabel": "Coin Metrics Community API",
      "sourceUrl": "https://community-api.coinmetrics.io/v4/timeseries/asset-metrics?assets=aave&metrics=CapMrktEstUSD&frequency=1d&start_time=2009-01-01&end_time=2026-10-30T23%3A59%3A59Z&page_size=10000",
      "rawResponseSHA256": "874ea1afc97ac98e2ff245b0d57382cd618cbb283d14a634a3986f0c700497b1",
      "checkedOn": "2026-10-31",
      "brandColor": "#b6509e",
      "isMajorCheckpoint": true,
      "athCirculatingMarketCapUSD": 7997930761.11,
      "peakDate": "2021-05-18",
      "circulatingSupplyNote": "Coin Metrics CapMrktEstUSD 覆盖期 (2020-10-10 至 2026-10-30) 内共 2212 条日级观测之最高流通市值",
      "source": "Coin Metrics Community API (CapMrktEstUSD, SHA256: 874ea1afc97a...)"
    },
    {
      "symbol": "PEPE",
      "name": "Pepe",
      "recordMarketCapUSD": 11096790016.94,
      "recordMarketCapUSDExact": "11096790016.937550708",
      "peakObservationTimeUTC": "2024-12-08T00:00:00.000000000Z",
      "recordDateUTC": "2024-12-08",
      "coverageStartUTC": "2023-08-17",
      "coverageEndUTC": "2026-10-30",
      "dailyObservationCount": 1171,
      "missingDaysWithinCoverage": 0,
      "scope": "maximum_of_available_daily_circulating_market_cap_series",
      "sourceMetric": "CapMrktEstUSD",
      "sourceLabel": "Coin Metrics Community API",
      "sourceUrl": "https://community-api.coinmetrics.io/v4/timeseries/asset-metrics?assets=pepe&metrics=CapMrktEstUSD&frequency=1d&start_time=2009-01-01&end_time=2026-10-30T23%3A59%3A59Z&page_size=10000",
      "rawResponseSHA256": "5df5aa974430d011ea5d23b41d5884ecc74a9e79e107928342553f67f675d902",
      "checkedOn": "2026-10-31",
      "brandColor": "#4ade80",
      "isMajorCheckpoint": false,
      "athCirculatingMarketCapUSD": 11096790016.94,
      "peakDate": "2024-12-08",
      "circulatingSupplyNote": "Coin Metrics CapMrktEstUSD 覆盖期 (2023-08-17 至 2026-10-30) 内共 1171 条日级观测之最高流通市值",
      "source": "Coin Metrics Community API (CapMrktEstUSD, SHA256: 5df5aa974430...)"
    },
    {
      "symbol": "FIL",
      "name": "Filecoin",
      "recordMarketCapUSD": 12249305791.49,
      "recordMarketCapUSDExact": "12249305791.492809715785",
      "peakObservationTimeUTC": "2021-04-16T00:00:00.000000000Z",
      "recordDateUTC": "2021-04-16",
      "coverageStartUTC": "2020-10-16",
      "coverageEndUTC": "2026-10-30",
      "dailyObservationCount": 2206,
      "missingDaysWithinCoverage": 0,
      "scope": "maximum_of_available_daily_circulating_market_cap_series",
      "sourceMetric": "CapMrktEstUSD",
      "sourceLabel": "Coin Metrics Community API",
      "sourceUrl": "https://community-api.coinmetrics.io/v4/timeseries/asset-metrics?assets=fil&metrics=CapMrktEstUSD&frequency=1d&start_time=2009-01-01&end_time=2026-10-30T23%3A59%3A59Z&page_size=10000",
      "rawResponseSHA256": "00d7c06da176d311d5fe804d1d01aadd9d922b235d8f9a18461a8b108dadf6e1",
      "checkedOn": "2026-10-31",
      "brandColor": "#0090ff",
      "isMajorCheckpoint": false,
      "athCirculatingMarketCapUSD": 12249305791.49,
      "peakDate": "2021-04-16",
      "circulatingSupplyNote": "Coin Metrics CapMrktEstUSD 覆盖期 (2020-10-16 至 2026-10-30) 内共 2206 条日级观测之最高流通市值",
      "source": "Coin Metrics Community API (CapMrktEstUSD, SHA256: 00d7c06da176...)"
    },
    {
      "symbol": "NEAR",
      "name": "NEAR Protocol",
      "recordMarketCapUSD": 12326664064.79,
      "recordMarketCapUSDExact": "12326664064.7850252768618372816",
      "peakObservationTimeUTC": "2022-01-16T00:00:00.000000000Z",
      "recordDateUTC": "2022-01-16",
      "coverageStartUTC": "2020-11-23",
      "coverageEndUTC": "2026-10-30",
      "dailyObservationCount": 2168,
      "missingDaysWithinCoverage": 0,
      "scope": "maximum_of_available_daily_circulating_market_cap_series",
      "sourceMetric": "CapMrktEstUSD",
      "sourceLabel": "Coin Metrics Community API",
      "sourceUrl": "https://community-api.coinmetrics.io/v4/timeseries/asset-metrics?assets=near&metrics=CapMrktEstUSD&frequency=1d&start_time=2009-01-01&end_time=2026-10-30T23%3A59%3A59Z&page_size=10000",
      "rawResponseSHA256": "33a39fb5a12d064e3ea9f12598e05bd9d7cfa9c20eeff554748312573bc72f4b",
      "checkedOn": "2026-10-31",
      "brandColor": "#00ec97",
      "isMajorCheckpoint": true,
      "athCirculatingMarketCapUSD": 12326664064.79,
      "peakDate": "2022-01-16",
      "circulatingSupplyNote": "Coin Metrics CapMrktEstUSD 覆盖期 (2020-11-23 至 2026-10-30) 内共 2168 条日级观测之最高流通市值",
      "source": "Coin Metrics Community API (CapMrktEstUSD, SHA256: 33a39fb5a12d...)"
    },
    {
      "symbol": "ATOM",
      "name": "Cosmos Hub",
      "recordMarketCapUSD": 12413209699.98,
      "recordMarketCapUSDExact": "12413209699.9789514400848885556",
      "peakObservationTimeUTC": "2022-01-16T00:00:00.000000000Z",
      "recordDateUTC": "2022-01-16",
      "coverageStartUTC": "2019-06-22",
      "coverageEndUTC": "2026-10-30",
      "dailyObservationCount": 2688,
      "missingDaysWithinCoverage": 0,
      "scope": "maximum_of_available_daily_circulating_market_cap_series",
      "sourceMetric": "CapMrktEstUSD",
      "sourceLabel": "Coin Metrics Community API",
      "sourceUrl": "https://community-api.coinmetrics.io/v4/timeseries/asset-metrics?assets=atom&metrics=CapMrktEstUSD&frequency=1d&start_time=2009-01-01&end_time=2026-10-30T23%3A59%3A59Z&page_size=10000",
      "rawResponseSHA256": "0b193267bc08c7c257ab4def5ab01605955df788142fc6358558d23f6a7a987b",
      "checkedOn": "2026-10-31",
      "brandColor": "#6f7390",
      "isMajorCheckpoint": false,
      "athCirculatingMarketCapUSD": 12413209699.98,
      "peakDate": "2022-01-16",
      "circulatingSupplyNote": "Coin Metrics CapMrktEstUSD 覆盖期 (2019-06-22 至 2026-10-30) 内共 2688 条日级观测之最高流通市值",
      "source": "Coin Metrics Community API (CapMrktEstUSD, SHA256: 0b193267bc08...)"
    },
    {
      "symbol": "ALGO",
      "name": "Algorand",
      "recordMarketCapUSD": 13386081005.34,
      "recordMarketCapUSDExact": "13386081005.3426552345855335406",
      "peakObservationTimeUTC": "2021-11-12T00:00:00.000000000Z",
      "recordDateUTC": "2021-11-12",
      "coverageStartUTC": "2019-06-22",
      "coverageEndUTC": "2026-10-30",
      "dailyObservationCount": 2688,
      "missingDaysWithinCoverage": 0,
      "scope": "maximum_of_available_daily_circulating_market_cap_series",
      "sourceMetric": "CapMrktEstUSD",
      "sourceLabel": "Coin Metrics Community API",
      "sourceUrl": "https://community-api.coinmetrics.io/v4/timeseries/asset-metrics?assets=algo&metrics=CapMrktEstUSD&frequency=1d&start_time=2009-01-01&end_time=2026-10-30T23%3A59%3A59Z&page_size=10000",
      "rawResponseSHA256": "1129a9755362aab48ccaedd3821a8f62d30c3ce1d2f21d2eaeb8bff0ed71948b",
      "checkedOn": "2026-10-31",
      "brandColor": "#38bdf8",
      "isMajorCheckpoint": false,
      "athCirculatingMarketCapUSD": 13386081005.34,
      "peakDate": "2021-11-12",
      "circulatingSupplyNote": "Coin Metrics CapMrktEstUSD 覆盖期 (2019-06-22 至 2026-10-30) 内共 2688 条日级观测之最高流通市值",
      "source": "Coin Metrics Community API (CapMrktEstUSD, SHA256: 1129a9755362...)"
    },
    {
      "symbol": "SUI",
      "name": "Sui",
      "recordMarketCapUSD": 15940018812.83,
      "recordMarketCapUSDExact": "15940018812.82529843069659319424",
      "peakObservationTimeUTC": "2025-01-04T00:00:00.000000000Z",
      "recordDateUTC": "2025-01-04",
      "coverageStartUTC": "2023-08-17",
      "coverageEndUTC": "2026-10-30",
      "dailyObservationCount": 1171,
      "missingDaysWithinCoverage": 0,
      "scope": "maximum_of_available_daily_circulating_market_cap_series",
      "sourceMetric": "CapMrktEstUSD",
      "sourceLabel": "Coin Metrics Community API",
      "sourceUrl": "https://community-api.coinmetrics.io/v4/timeseries/asset-metrics?assets=sui&metrics=CapMrktEstUSD&frequency=1d&start_time=2009-01-01&end_time=2026-10-30T23%3A59%3A59Z&page_size=10000",
      "rawResponseSHA256": "66a2f1c2c71385c05b703b7e43c9bde3263465c7522d192f3189b4a5b4bc8e39",
      "checkedOn": "2026-10-31",
      "brandColor": "#4da2ff",
      "isMajorCheckpoint": true,
      "athCirculatingMarketCapUSD": 15940018812.83,
      "peakDate": "2025-01-04",
      "circulatingSupplyNote": "Coin Metrics CapMrktEstUSD 覆盖期 (2023-08-17 至 2026-10-30) 内共 1171 条日级观测之最高流通市值",
      "source": "Coin Metrics Community API (CapMrktEstUSD, SHA256: 66a2f1c2c713...)"
    },
    {
      "symbol": "ETC",
      "name": "Ethereum Classic",
      "recordMarketCapUSD": 16995264095.26,
      "recordMarketCapUSDExact": "16995264095.257981733922",
      "peakObservationTimeUTC": "2021-05-06T00:00:00.000000000Z",
      "recordDateUTC": "2021-05-06",
      "coverageStartUTC": "2019-06-22",
      "coverageEndUTC": "2026-10-30",
      "dailyObservationCount": 2688,
      "missingDaysWithinCoverage": 0,
      "scope": "maximum_of_available_daily_circulating_market_cap_series",
      "sourceMetric": "CapMrktEstUSD",
      "sourceLabel": "Coin Metrics Community API",
      "sourceUrl": "https://community-api.coinmetrics.io/v4/timeseries/asset-metrics?assets=etc&metrics=CapMrktEstUSD&frequency=1d&start_time=2009-01-01&end_time=2026-10-30T23%3A59%3A59Z&page_size=10000",
      "rawResponseSHA256": "f0e3116b5c6bb7202e7e2ff5c1b6bbf1d54dfb5c22b191b4665d4538b4401a30",
      "checkedOn": "2026-10-31",
      "brandColor": "#328332",
      "isMajorCheckpoint": false,
      "athCirculatingMarketCapUSD": 16995264095.26,
      "peakDate": "2021-05-06",
      "circulatingSupplyNote": "Coin Metrics CapMrktEstUSD 覆盖期 (2019-06-22 至 2026-10-30) 内共 2688 条日级观测之最高流通市值",
      "source": "Coin Metrics Community API (CapMrktEstUSD, SHA256: f0e3116b5c6b...)"
    },
    {
      "symbol": "LINK",
      "name": "Chainlink",
      "recordMarketCapUSD": 21992840935.98,
      "recordMarketCapUSDExact": "21992840935.9757127259122553009127656604541",
      "peakObservationTimeUTC": "2021-05-09T00:00:00.000000000Z",
      "recordDateUTC": "2021-05-09",
      "coverageStartUTC": "2019-06-22",
      "coverageEndUTC": "2026-10-30",
      "dailyObservationCount": 2688,
      "missingDaysWithinCoverage": 0,
      "scope": "maximum_of_available_daily_circulating_market_cap_series",
      "sourceMetric": "CapMrktEstUSD",
      "sourceLabel": "Coin Metrics Community API",
      "sourceUrl": "https://community-api.coinmetrics.io/v4/timeseries/asset-metrics?assets=link&metrics=CapMrktEstUSD&frequency=1d&start_time=2009-01-01&end_time=2026-10-30T23%3A59%3A59Z&page_size=10000",
      "rawResponseSHA256": "a5eb2b8de5c9b3f32b90c24c32316327b8e75bc0590921c1380fb81dee540eb2",
      "checkedOn": "2026-10-31",
      "brandColor": "#375bd2",
      "isMajorCheckpoint": true,
      "athCirculatingMarketCapUSD": 21992840935.98,
      "peakDate": "2021-05-09",
      "circulatingSupplyNote": "Coin Metrics CapMrktEstUSD 覆盖期 (2019-06-22 至 2026-10-30) 内共 2688 条日级观测之最高流通市值",
      "source": "Coin Metrics Community API (CapMrktEstUSD, SHA256: a5eb2b8de5c9...)"
    },
    {
      "symbol": "UNI",
      "name": "Uniswap",
      "recordMarketCapUSD": 22636211052.75,
      "recordMarketCapUSDExact": "22636211052.7484940581270393580984278841843",
      "peakObservationTimeUTC": "2021-05-04T00:00:00.000000000Z",
      "recordDateUTC": "2021-05-04",
      "coverageStartUTC": "2020-09-18",
      "coverageEndUTC": "2026-10-30",
      "dailyObservationCount": 2234,
      "missingDaysWithinCoverage": 0,
      "scope": "maximum_of_available_daily_circulating_market_cap_series",
      "sourceMetric": "CapMrktEstUSD",
      "sourceLabel": "Coin Metrics Community API",
      "sourceUrl": "https://community-api.coinmetrics.io/v4/timeseries/asset-metrics?assets=uni&metrics=CapMrktEstUSD&frequency=1d&start_time=2009-01-01&end_time=2026-10-30T23%3A59%3A59Z&page_size=10000",
      "rawResponseSHA256": "f261fef0f3d427fcd5cb62fe50edeca6a6c770de415d4eb7ecbd1ae858ae7bf1",
      "checkedOn": "2026-10-31",
      "brandColor": "#ff007a",
      "isMajorCheckpoint": false,
      "athCirculatingMarketCapUSD": 22636211052.75,
      "peakDate": "2021-05-04",
      "circulatingSupplyNote": "Coin Metrics CapMrktEstUSD 覆盖期 (2020-09-18 至 2026-10-30) 内共 2234 条日级观测之最高流通市值",
      "source": "Coin Metrics Community API (CapMrktEstUSD, SHA256: f261fef0f3d4...)"
    },
    {
      "symbol": "LTC",
      "name": "Litecoin",
      "recordMarketCapUSD": 26062552888.21,
      "recordMarketCapUSDExact": "26062552888.20569778220384",
      "peakObservationTimeUTC": "2021-05-09T00:00:00.000000000Z",
      "recordDateUTC": "2021-05-09",
      "coverageStartUTC": "2019-06-22",
      "coverageEndUTC": "2026-10-30",
      "dailyObservationCount": 2688,
      "missingDaysWithinCoverage": 0,
      "scope": "maximum_of_available_daily_circulating_market_cap_series",
      "sourceMetric": "CapMrktEstUSD",
      "sourceLabel": "Coin Metrics Community API",
      "sourceUrl": "https://community-api.coinmetrics.io/v4/timeseries/asset-metrics?assets=ltc&metrics=CapMrktEstUSD&frequency=1d&start_time=2009-01-01&end_time=2026-10-30T23%3A59%3A59Z&page_size=10000",
      "rawResponseSHA256": "cf8ce2ff26e3af31b22073bcd29461617d1e0ba0fc65f0a2e2cf56beb27ee181",
      "checkedOn": "2026-10-31",
      "brandColor": "#345d9d",
      "isMajorCheckpoint": false,
      "athCirculatingMarketCapUSD": 26062552888.21,
      "peakDate": "2021-05-09",
      "circulatingSupplyNote": "Coin Metrics CapMrktEstUSD 覆盖期 (2019-06-22 至 2026-10-30) 内共 2688 条日级观测之最高流通市值",
      "source": "Coin Metrics Community API (CapMrktEstUSD, SHA256: cf8ce2ff26e3...)"
    },
    {
      "symbol": "AVAX",
      "name": "Avalanche",
      "recordMarketCapUSD": 29998910255.17,
      "recordMarketCapUSDExact": "29998910255.17041110822429133",
      "peakObservationTimeUTC": "2021-12-21T00:00:00.000000000Z",
      "recordDateUTC": "2021-12-21",
      "coverageStartUTC": "2020-09-23",
      "coverageEndUTC": "2026-10-30",
      "dailyObservationCount": 2229,
      "missingDaysWithinCoverage": 0,
      "scope": "maximum_of_available_daily_circulating_market_cap_series",
      "sourceMetric": "CapMrktEstUSD",
      "sourceLabel": "Coin Metrics Community API",
      "sourceUrl": "https://community-api.coinmetrics.io/v4/timeseries/asset-metrics?assets=avax&metrics=CapMrktEstUSD&frequency=1d&start_time=2009-01-01&end_time=2026-10-30T23%3A59%3A59Z&page_size=10000",
      "rawResponseSHA256": "f3fd29c112b933a35bc2197350752f35a53f2343d2e891ede116e3488f48a45a",
      "checkedOn": "2026-10-31",
      "brandColor": "#e84142",
      "isMajorCheckpoint": true,
      "athCirculatingMarketCapUSD": 29998910255.17,
      "peakDate": "2021-12-21",
      "circulatingSupplyNote": "Coin Metrics CapMrktEstUSD 覆盖期 (2020-09-23 至 2026-10-30) 内共 2229 条日级观测之最高流通市值",
      "source": "Coin Metrics Community API (CapMrktEstUSD, SHA256: f3fd29c112b9...)"
    },
    {
      "symbol": "SHIB",
      "name": "Shiba Inu",
      "recordMarketCapUSD": 41151165680.05,
      "recordMarketCapUSDExact": "41151165680.0546804367032213909552735811805277828",
      "peakObservationTimeUTC": "2021-10-29T00:00:00.000000000Z",
      "recordDateUTC": "2021-10-29",
      "coverageStartUTC": "2021-05-16",
      "coverageEndUTC": "2026-10-30",
      "dailyObservationCount": 1994,
      "missingDaysWithinCoverage": 0,
      "scope": "maximum_of_available_daily_circulating_market_cap_series",
      "sourceMetric": "CapMrktEstUSD",
      "sourceLabel": "Coin Metrics Community API",
      "sourceUrl": "https://community-api.coinmetrics.io/v4/timeseries/asset-metrics?assets=shib&metrics=CapMrktEstUSD&frequency=1d&start_time=2009-01-01&end_time=2026-10-30T23%3A59%3A59Z&page_size=10000",
      "rawResponseSHA256": "f1f467b4692eedadb3da2f07f799e8e1c17a28b97568f2cea01bfee09013a8df",
      "checkedOn": "2026-10-31",
      "brandColor": "#ffa409",
      "isMajorCheckpoint": false,
      "athCirculatingMarketCapUSD": 41151165680.05,
      "peakDate": "2021-10-29",
      "circulatingSupplyNote": "Coin Metrics CapMrktEstUSD 覆盖期 (2021-05-16 至 2026-10-30) 内共 1994 条日级观测之最高流通市值",
      "source": "Coin Metrics Community API (CapMrktEstUSD, SHA256: f1f467b4692e...)"
    },
    {
      "symbol": "DOT",
      "name": "Polkadot",
      "recordMarketCapUSD": 56549765089.17,
      "recordMarketCapUSDExact": "56549765089.171281850055675948",
      "peakObservationTimeUTC": "2021-11-04T00:00:00.000000000Z",
      "recordDateUTC": "2021-11-04",
      "coverageStartUTC": "2020-08-23",
      "coverageEndUTC": "2026-10-30",
      "dailyObservationCount": 2260,
      "missingDaysWithinCoverage": 0,
      "scope": "maximum_of_available_daily_circulating_market_cap_series",
      "sourceMetric": "CapMrktEstUSD",
      "sourceLabel": "Coin Metrics Community API",
      "sourceUrl": "https://community-api.coinmetrics.io/v4/timeseries/asset-metrics?assets=dot&metrics=CapMrktEstUSD&frequency=1d&start_time=2009-01-01&end_time=2026-10-30T23%3A59%3A59Z&page_size=10000",
      "rawResponseSHA256": "7d4e350280fa94254b23e024f8da1a5d2fed4fdc51776e4374e81187738cdc70",
      "checkedOn": "2026-10-31",
      "brandColor": "#e6007a",
      "isMajorCheckpoint": true,
      "athCirculatingMarketCapUSD": 56549765089.17,
      "peakDate": "2021-11-04",
      "circulatingSupplyNote": "Coin Metrics CapMrktEstUSD 覆盖期 (2020-08-23 至 2026-10-30) 内共 2260 条日级观测之最高流通市值",
      "source": "Coin Metrics Community API (CapMrktEstUSD, SHA256: 7d4e350280fa...)"
    },
    {
      "symbol": "DOGE",
      "name": "Dogecoin",
      "recordMarketCapUSD": 88743386202.67,
      "recordMarketCapUSDExact": "88743386202.671226770373530952",
      "peakObservationTimeUTC": "2021-05-07T00:00:00.000000000Z",
      "recordDateUTC": "2021-05-07",
      "coverageStartUTC": "2019-06-22",
      "coverageEndUTC": "2026-10-30",
      "dailyObservationCount": 2688,
      "missingDaysWithinCoverage": 0,
      "scope": "maximum_of_available_daily_circulating_market_cap_series",
      "sourceMetric": "CapMrktEstUSD",
      "sourceLabel": "Coin Metrics Community API",
      "sourceUrl": "https://community-api.coinmetrics.io/v4/timeseries/asset-metrics?assets=doge&metrics=CapMrktEstUSD&frequency=1d&start_time=2009-01-01&end_time=2026-10-30T23%3A59%3A59Z&page_size=10000",
      "rawResponseSHA256": "f5e0ecb7fe9650cd8e0375f372b8faa24ae272a5949c6366e6962930cf9d9433",
      "checkedOn": "2026-10-31",
      "brandColor": "#c2a633",
      "isMajorCheckpoint": false,
      "athCirculatingMarketCapUSD": 88743386202.67,
      "peakDate": "2021-05-07",
      "circulatingSupplyNote": "Coin Metrics CapMrktEstUSD 覆盖期 (2019-06-22 至 2026-10-30) 内共 2688 条日级观测之最高流通市值",
      "source": "Coin Metrics Community API (CapMrktEstUSD, SHA256: f5e0ecb7fe96...)"
    },
    {
      "symbol": "ADA",
      "name": "Cardano",
      "recordMarketCapUSD": 95092221857.92,
      "recordMarketCapUSDExact": "95092221857.924667724293716505",
      "peakObservationTimeUTC": "2021-09-02T00:00:00.000000000Z",
      "recordDateUTC": "2021-09-02",
      "coverageStartUTC": "2019-06-22",
      "coverageEndUTC": "2026-10-30",
      "dailyObservationCount": 2688,
      "missingDaysWithinCoverage": 0,
      "scope": "maximum_of_available_daily_circulating_market_cap_series",
      "sourceMetric": "CapMrktEstUSD",
      "sourceLabel": "Coin Metrics Community API",
      "sourceUrl": "https://community-api.coinmetrics.io/v4/timeseries/asset-metrics?assets=ada&metrics=CapMrktEstUSD&frequency=1d&start_time=2009-01-01&end_time=2026-10-30T23%3A59%3A59Z&page_size=10000",
      "rawResponseSHA256": "06608fdc40fbee0ff7d77816afe9fd341b07732354596c653a28320e97c9a270",
      "checkedOn": "2026-10-31",
      "brandColor": "#0033ad",
      "isMajorCheckpoint": true,
      "athCirculatingMarketCapUSD": 95092221857.92,
      "peakDate": "2021-09-02",
      "circulatingSupplyNote": "Coin Metrics CapMrktEstUSD 覆盖期 (2019-06-22 至 2026-10-30) 内共 2688 条日级观测之最高流通市值",
      "source": "Coin Metrics Community API (CapMrktEstUSD, SHA256: 06608fdc40fb...)"
    },
    {
      "symbol": "SOL",
      "name": "Solana",
      "recordMarketCapUSD": 134211680386.31,
      "recordMarketCapUSDExact": "134211680386.3079912675279661246",
      "peakObservationTimeUTC": "2025-09-18T00:00:00.000000000Z",
      "recordDateUTC": "2025-09-18",
      "coverageStartUTC": "2020-04-11",
      "coverageEndUTC": "2026-10-30",
      "dailyObservationCount": 2394,
      "missingDaysWithinCoverage": 0,
      "scope": "maximum_of_available_daily_circulating_market_cap_series",
      "sourceMetric": "CapMrktEstUSD",
      "sourceLabel": "Coin Metrics Community API",
      "sourceUrl": "https://community-api.coinmetrics.io/v4/timeseries/asset-metrics?assets=sol&metrics=CapMrktEstUSD&frequency=1d&start_time=2009-01-01&end_time=2026-10-30T23%3A59%3A59Z&page_size=10000",
      "rawResponseSHA256": "f54c6597ec37366e9137c1650728cae4d5200a8f767287ff04d6b139a377dde0",
      "checkedOn": "2026-10-31",
      "brandColor": "#14f195",
      "isMajorCheckpoint": true,
      "athCirculatingMarketCapUSD": 134211680386.31,
      "peakDate": "2025-09-18",
      "circulatingSupplyNote": "Coin Metrics CapMrktEstUSD 覆盖期 (2020-04-11 至 2026-10-30) 内共 2394 条日级观测之最高流通市值",
      "source": "Coin Metrics Community API (CapMrktEstUSD, SHA256: f54c6597ec37...)"
    },
    {
      "symbol": "BNB",
      "name": "BNB",
      "recordMarketCapUSD": 182364223012.43,
      "recordMarketCapUSDExact": "182364223012.4290985313354",
      "peakObservationTimeUTC": "2025-10-07T00:00:00.000000000Z",
      "recordDateUTC": "2025-10-07",
      "coverageStartUTC": "2019-06-22",
      "coverageEndUTC": "2026-10-30",
      "dailyObservationCount": 2688,
      "missingDaysWithinCoverage": 0,
      "scope": "maximum_of_available_daily_circulating_market_cap_series",
      "sourceMetric": "CapMrktEstUSD",
      "sourceLabel": "Coin Metrics Community API",
      "sourceUrl": "https://community-api.coinmetrics.io/v4/timeseries/asset-metrics?assets=bnb&metrics=CapMrktEstUSD&frequency=1d&start_time=2009-01-01&end_time=2026-10-30T23%3A59%3A59Z&page_size=10000",
      "rawResponseSHA256": "54005fe1f3c67671afc415e914b4e8c498e82d34ffa97f6f95657131d21adc4f",
      "checkedOn": "2026-10-31",
      "brandColor": "#f3ba2f",
      "isMajorCheckpoint": true,
      "athCirculatingMarketCapUSD": 182364223012.43,
      "peakDate": "2025-10-07",
      "circulatingSupplyNote": "Coin Metrics CapMrktEstUSD 覆盖期 (2019-06-22 至 2026-10-30) 内共 2688 条日级观测之最高流通市值",
      "source": "Coin Metrics Community API (CapMrktEstUSD, SHA256: 54005fe1f3c6...)"
    },
    {
      "symbol": "XRP",
      "name": "XRP",
      "recordMarketCapUSD": 210359108118.27,
      "recordMarketCapUSDExact": "210359108118.27410136184803",
      "peakObservationTimeUTC": "2025-07-21T00:00:00.000000000Z",
      "recordDateUTC": "2025-07-21",
      "coverageStartUTC": "2019-06-22",
      "coverageEndUTC": "2026-10-30",
      "dailyObservationCount": 2688,
      "missingDaysWithinCoverage": 0,
      "scope": "maximum_of_available_daily_circulating_market_cap_series",
      "sourceMetric": "CapMrktEstUSD",
      "sourceLabel": "Coin Metrics Community API",
      "sourceUrl": "https://community-api.coinmetrics.io/v4/timeseries/asset-metrics?assets=xrp&metrics=CapMrktEstUSD&frequency=1d&start_time=2009-01-01&end_time=2026-10-30T23%3A59%3A59Z&page_size=10000",
      "rawResponseSHA256": "d7bcb1aaedbc82f6b7c8f587808fcf620a2527700f73aeecf59a8f47ba02101d",
      "checkedOn": "2026-10-31",
      "brandColor": "#38bdf8",
      "isMajorCheckpoint": true,
      "athCirculatingMarketCapUSD": 210359108118.27,
      "peakDate": "2025-07-21",
      "circulatingSupplyNote": "Coin Metrics CapMrktEstUSD 覆盖期 (2019-06-22 至 2026-10-30) 内共 2688 条日级观测之最高流通市值",
      "source": "Coin Metrics Community API (CapMrktEstUSD, SHA256: d7bcb1aaedbc...)"
    },
    {
      "symbol": "ETH",
      "name": "Ethereum",
      "recordMarketCapUSD": 583151048579.42,
      "recordMarketCapUSDExact": "583151048579.422713390253739694",
      "peakObservationTimeUTC": "2025-08-22T00:00:00.000000000Z",
      "recordDateUTC": "2025-08-22",
      "coverageStartUTC": "2019-06-22",
      "coverageEndUTC": "2026-10-30",
      "dailyObservationCount": 2688,
      "missingDaysWithinCoverage": 0,
      "scope": "maximum_of_available_daily_circulating_market_cap_series",
      "sourceMetric": "CapMrktEstUSD",
      "sourceLabel": "Coin Metrics Community API",
      "sourceUrl": "https://community-api.coinmetrics.io/v4/timeseries/asset-metrics?assets=eth&metrics=CapMrktEstUSD&frequency=1d&start_time=2009-01-01&end_time=2026-10-30T23%3A59%3A59Z&page_size=10000",
      "rawResponseSHA256": "18a67c921e61922b22cd793fd542fac01caf20fc79338094e2f00adb4c392193",
      "checkedOn": "2026-10-31",
      "brandColor": "#627eea",
      "isMajorCheckpoint": true,
      "athCirculatingMarketCapUSD": 583151048579.42,
      "peakDate": "2025-08-22",
      "circulatingSupplyNote": "Coin Metrics CapMrktEstUSD 覆盖期 (2019-06-22 至 2026-10-30) 内共 2688 条日级观测之最高流通市值",
      "source": "Coin Metrics Community API (CapMrktEstUSD, SHA256: 18a67c921e61...)"
    },
    {
      "symbol": "BTC",
      "name": "Bitcoin",
      "recordMarketCapUSD": 2487527052037.3,
      "recordMarketCapUSDExact": "2487527052037.300380783",
      "peakObservationTimeUTC": "2025-10-06T00:00:00.000000000Z",
      "recordDateUTC": "2025-10-06",
      "coverageStartUTC": "2019-06-22",
      "coverageEndUTC": "2026-10-30",
      "dailyObservationCount": 2688,
      "missingDaysWithinCoverage": 0,
      "scope": "maximum_of_available_daily_circulating_market_cap_series",
      "sourceMetric": "CapMrktEstUSD",
      "sourceLabel": "Coin Metrics Community API",
      "sourceUrl": "https://community-api.coinmetrics.io/v4/timeseries/asset-metrics?assets=btc&metrics=CapMrktEstUSD&frequency=1d&start_time=2009-01-01&end_time=2026-10-30T23%3A59%3A59Z&page_size=10000",
      "rawResponseSHA256": "a3fa6b9e10a12430ae99209f670cf93b1527f48df525226be99e7a1156b1b661",
      "checkedOn": "2026-10-31",
      "brandColor": "#f7931a",
      "isMajorCheckpoint": true,
      "athCirculatingMarketCapUSD": 2487527052037.3,
      "peakDate": "2025-10-06",
      "circulatingSupplyNote": "Coin Metrics CapMrktEstUSD 覆盖期 (2019-06-22 至 2026-10-30) 内共 2688 条日级观测之最高流通市值",
      "source": "Coin Metrics Community API (CapMrktEstUSD, SHA256: a3fa6b9e10a1...)"
    }
  ]
};

export const MARKET_CAP_DATASET_META: MarketCapDatasetMeta = MARKET_CAP_DATA.meta;

export const CRYPTO_MARKET_CAP_MILESTONES: CryptoMilestone[] =
  MARKET_CAP_DATA.milestones;

export const EARLY_SIMULATION_MILESTONES: SimulationProgressMilestone[] = [
  {
    "id": "sim-250m",
    "thresholdUSD": 250000000,
    "isSimulationMilestone": true,
    "badgeColor": "#38bdf8",
    "i18n": {
      "zh-CN": {
        "title": "2.5 亿美元模拟进度奖励",
        "disclaimer": "模拟攀爬进度奖励（非加密货币历史市值纪录）"
      },
      "en": {
        "title": "$250M Simulation Progress Bonus",
        "disclaimer": "Simulated climb progress reward (not a historical crypto market-cap record)"
      },
      "ja": {
        "title": "2.5億ドル シミュレーション進捗ボーナス",
        "disclaimer": "シミュレーション登頂進捗報酬（暗号資産の歴史的時価総額記録ではありません）"
      },
      "ko": {
        "title": "2.5억 달러 시뮬레이션 진행 보상",
        "disclaimer": "시뮬레이션 등반 진행 보상 (암호화폐 역사적 시가총액 기록이 아님)"
      },
      "es": {
        "title": "Bonificación de progreso simulado de $250M",
        "disclaimer": "Recompensa de progreso simulado (no es un récord histórico de capitalización)"
      }
    }
  },
  {
    "id": "sim-500m",
    "thresholdUSD": 500000000,
    "isSimulationMilestone": true,
    "badgeColor": "#a78bfa",
    "i18n": {
      "zh-CN": {
        "title": "5 亿美元模拟进度奖励",
        "disclaimer": "模拟攀爬进度奖励（非加密货币历史市值纪录）"
      },
      "en": {
        "title": "$500M Simulation Progress Bonus",
        "disclaimer": "Simulated climb progress reward (not a historical crypto market-cap record)"
      },
      "ja": {
        "title": "5億ドル シミュレーション進捗ボーナス",
        "disclaimer": "シミュレーション登頂進捗報酬（暗号資産の歴史的時価総額記録ではありません）"
      },
      "ko": {
        "title": "5억 달러 시뮬레이션 진행 보상",
        "disclaimer": "시뮬레이션 등반 진행 보상 (암호화폐 역사적 시가총액 기록이 아님)"
      },
      "es": {
        "title": "Bonificación de progreso simulado de $500M",
        "disclaimer": "Recompensa de progreso simulado (no es un récord histórico de capitalización)"
      }
    }
  },
  {
    "id": "sim-1b",
    "thresholdUSD": 1000000000,
    "isSimulationMilestone": true,
    "badgeColor": "#f472b6",
    "i18n": {
      "zh-CN": {
        "title": "10 亿美元模拟进度奖励",
        "disclaimer": "模拟攀爬进度奖励（非加密货币历史市值纪录）"
      },
      "en": {
        "title": "$1B Simulation Progress Bonus",
        "disclaimer": "Simulated climb progress reward (not a historical crypto market-cap record)"
      },
      "ja": {
        "title": "10億ドル シミュレーション進捗ボーナス",
        "disclaimer": "シミュレーション登頂進捗報酬（暗号資産の歴史的時価総額記録ではありません）"
      },
      "ko": {
        "title": "10억 달러 시뮬레이션 진행 보상",
        "disclaimer": "시뮬레이션 등반 진행 보상 (암호화폐 역사적 시가총액 기록이 아님)"
      },
      "es": {
        "title": "Bonificación de progreso simulado de $1B",
        "disclaimer": "Recompensa de progreso simulado (no es un récord histórico de capitalización)"
      }
    }
  }
];
