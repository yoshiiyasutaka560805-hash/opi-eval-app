export type Direction = 'up' | 'down' | 'flat';
export type Timeframe = '5min' | '15min' | '30min' | '1h' | '4h' | 'daily';
export type TradeSignal = 'LONG' | 'SHORT' | 'WAIT';
export type SessionName = 'tokyo' | 'london' | 'ny' | 'overlap' | 'closed';
export type SessionReliability = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
export type MarketRegime = 'trending_bull' | 'trending_bear' | 'ranging' | 'volatile';

export interface OHLCV {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface MA {
  ma5: number;
  ma21: number;
  ma70: number;
  ma200: number;
}

export interface TechnicalIndicators {
  sma: MA;
  ema: MA;
  goldenCross: { sma5x21: boolean; sma21x70: boolean; sma70x200: boolean };
  deadCross: { sma5x21: boolean; sma21x70: boolean; sma70x200: boolean };
  macd: { line: number; signal: number; histogram: number };
  parabolicSar: { value: number; isUptrend: boolean };
  ichimoku: {
    tenkanSen: number;
    kijunSen: number;
    senkouSpanA: number;
    senkouSpanB: number;
    aboveCloud: boolean;
    chikouSpan: number;
  };
  rsi7: number;
  rsi14: number;
  stochastic: { k: number; d: number };
  williamsR: number;
  cci20: number;
  roc10: number;
  bollingerBands: { upper: number; middle: number; lower: number; bandwidth: number; position: number };
  atr14: number;
  adx14: number;
  bullishSignals: number;
  bearishSignals: number;
}

export interface MarketStructure {
  trend: 'uptrend' | 'downtrend' | 'ranging';
  lastSwingHigh: number;
  lastSwingLow: number;
  choch: boolean;
  bos: boolean;
  description: string;
}

export interface DivergenceResult {
  type: 'regular_bearish' | 'regular_bullish' | 'hidden_bullish' | 'hidden_bearish' | 'none';
  indicator: 'RSI' | 'MACD' | 'Stochastic';
  timeframe: Timeframe;
  description: string;
}

export interface FibLevel {
  ratio: number;
  price: number;
  isNear: boolean;
}

export interface FibConfluence {
  priceZone: { lower: number; upper: number };
  timeframes: Timeframe[];
  strength: number;
  type: 'support' | 'resistance';
}

export interface FibonacciData {
  swingHigh: number;
  swingLow: number;
  isUpswing: boolean;
  levels: FibLevel[];
  pivotPoints: { pp: number; r1: number; r2: number; r3: number; s1: number; s2: number; s3: number };
  nearestSupport: number;
  nearestResistance: number;
  confluenceZones: FibConfluence[];
}

export interface OrderBlock {
  type: 'bullish' | 'bearish';
  high: number;
  low: number;
  timeframe: Timeframe;
  untested: boolean;
  date: string;
}

export interface FairValueGap {
  type: 'bullish' | 'bearish';
  upper: number;
  lower: number;
  midpoint: number;
  timeframe: Timeframe;
  filled: boolean;
  date: string;
}

export interface LiquidityZone {
  type: 'equal_highs' | 'equal_lows';
  price: number;
  touchCount: number;
  swept: boolean;
  sweepDate?: string;
}

export interface COTData {
  reportDate: string;
  commercial: { long: number; short: number; net: number };
  nonCommercial: { long: number; short: number; net: number };
  netPositionChange: number;
  netPositionPercentile: number;
  commercialPercentile: number;
  commercialExtreme: { isExtremeShort: boolean; isExtremeLong: boolean };
  conflictSignal: boolean;
  sentiment: string;
  commercialSentiment: string;
  nonCommercialSentiment: string;
}

export interface SessionInfo {
  current: SessionName;
  name: string;
  reliability: SessionReliability;
  weight: number;
  isWeekendRisk: boolean;
  weekendRiskMessage: string;
  color: string;
}

export interface UpcomingEvent {
  name: string;
  date: string;
  daysUntil: number;
  hoursUntil: number;
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  isBlackout: boolean;
}

export interface EconomicData {
  treasuryYield10y: number;
  cpi: number;
  federalFundsRate: number;
  realInterestRate: number;
  usdIndex: number;
  goldUsdCorrelation: number;
  goldRealRateCorrelation: number;
}

export interface NewsSentiment {
  avgScore: number;
  bullishCount: number;
  bearishCount: number;
  neutralCount: number;
  topHeadlines: string[];
  latestDate: string;
}

export interface TimeframeAnalysis {
  timeframe: Timeframe;
  candles: OHLCV[];
  indicators: TechnicalIndicators;
  direction: Direction;
  weight: number;
  score: number;
  regime: MarketRegime;
}

export interface Seasonality {
  month: number;
  avgReturn: number;
  reliability: 'LOW' | 'MEDIUM' | 'HIGH';
  note: string;
  adjustmentFactor: number;
}

export interface TradeSetup {
  signal: TradeSignal;
  entryTiming: 'immediate' | 'pullback' | 'wait';
  entryCondition: string;
  invalidationLevel: number;
  currentPrice: number;
  spread: number;
  slippage: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  riskPips: number;
  rewardPips1: number;
  rewardPips2: number;
  riskRewardRatio1: number;
  riskRewardRatio2: number;
  adjustedRR1: number;
  adjustedRR_realistic: number;
  trailingStopStrategy: {
    step1: string;
    step2: string;
    step3: string;
  };
  entryRationale: string;
  stopLossRationale: string;
  takeProfitRationale: string;
}

export interface Prediction {
  id: string;
  tradeSetup: TradeSetup;
  direction: Direction;
  confidence: number;
  regime: MarketRegime;
  sessionInfo: SessionInfo;
  isNewsBlackout: boolean;
  nextEvent?: UpcomingEvent;
  weekendRisk: boolean;
  mtfScore: number;
  mtfDirection: Direction;
  shortTermOutlook: string;
  mediumTermOutlook: string;
  keyBullishFactors: string[];
  keyBearishFactors: string[];
  technicalSummary: string;
  fundamentalSummary: string;
  sentimentSummary: string;
  cotSummary: string;
  calendarWarning: string;
  riskNote: string;
  priceAtPrediction: number;
  createdAt: string;
}

export interface PredictionRecord {
  id: string;
  signal: TradeSignal;
  confidence: number;
  priceAtPrediction: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  outcome?: 'TP1_HIT' | 'TP2_HIT' | 'SL_HIT' | 'PENDING' | 'EXPIRED';
  exitPrice?: number;
  createdAt: string;
  resolvedAt?: string;
}

export interface PredictionAccuracy {
  total: number;
  tp1HitRate: number;
  tp2HitRate: number;
  slHitRate: number;
  pendingCount: number;
  averageRRachieved: number;
}

export interface ApiQuota {
  used: number;
  limit: number;
  resetAt: string;
}

export interface GoldPriceResponse {
  currentPrice: number;
  previousClose: number;
  change: number;
  changePct: number;
  timeframes: Record<Timeframe, OHLCV[]>;
  lastUpdated: string;
  isDemo: boolean;
}
