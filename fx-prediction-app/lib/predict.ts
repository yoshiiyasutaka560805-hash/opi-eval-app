import Anthropic from '@anthropic-ai/sdk';
import {
  GoldPriceResponse,
  EconomicData,
  COTData,
  UpcomingEvent,
  SessionInfo,
  Seasonality,
  Prediction,
  TimeframeAnalysis,
  MarketStructure,
  DivergenceResult,
  OrderBlock,
  FairValueGap,
  LiquidityZone,
  FibonacciData,
  Timeframe,
  TradeSetup,
  TradeSignal,
  Direction,
  MarketRegime,
} from '@/types';
import { analyzeMultiTimeframe } from '@/lib/multiTimeframe';
import { detectRegime, describeRegime, getRegimeWeights } from '@/lib/regime';
import { analyzeMarketStructure } from '@/lib/marketStructure';
import { detectDivergence } from '@/lib/divergence';
import { detectPatterns } from '@/lib/patterns';
import { calculateFibonacci, findFibConfluence } from '@/lib/fibonacci';
import { detectOrderBlocks } from '@/lib/orderBlocks';
import { detectFVGs } from '@/lib/fairValueGap';
import { detectLiquidityZones } from '@/lib/liquidity';
import { getCurrentSession } from '@/lib/session';
import { getCurrentSeasonality } from '@/lib/seasonality';
import { isInsideNewsBlackout } from '@/lib/eventCalendar';
import { calculateAllIndicators } from '@/lib/technical';
import { v4 as uuidv4 } from 'uuid';
import { fetchNewsSentiment } from '@/lib/economic';

// ── Helpers ──────────────────────────────────────────────────────────────────

function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

function fmt(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function macdArrow(histogram: number): string {
  return histogram > 0 ? '↑' : '↓';
}

function smaPosition(sma5: number, sma21: number): string {
  return sma5 > sma21 ? '上' : '下';
}

function dirArrow(dir: string): string {
  if (dir === 'up') return '↑';
  if (dir === 'down') return '↓';
  return '→';
}

// ── Prompt builder ────────────────────────────────────────────────────────────

function buildPrompt(
  priceData: GoldPriceResponse,
  econData: EconomicData,
  cotData: COTData,
  upcomingEvents: UpcomingEvent[],
  sessionInfo: SessionInfo,
  seasonality: Seasonality,
  blackoutInfo: { isBlackout: boolean; event?: UpcomingEvent; message: string },
  mtfResult: { analyses: TimeframeAnalysis[]; totalScore: number; direction: Direction },
  structure: MarketStructure,
  divergences: DivergenceResult[],
  patterns: string[],
  fibs: Record<Timeframe, FibonacciData>,
  confluenceZones: ReturnType<typeof findFibConfluence>,
  orderBlocks: OrderBlock[],
  fvgs: FairValueGap[],
  liquidityZones: LiquidityZone[],
  regime: MarketRegime,
  news: { avgScore: number; bullishCount: number; bearishCount: number; topHeadlines: string[] },
): string {
  const currentPrice = priceData.currentPrice;

  // Get daily indicators for the detailed oscillator / MA section
  const dailyCandles = priceData.timeframes['daily'];
  const dailyIndicators = calculateAllIndicators(dailyCandles);

  const adx = dailyIndicators.adx14;
  const regimeDesc = describeRegime(regime, adx);
  const weights = getRegimeWeights(regime);

  // Divergence section
  const divLines = divergences.length > 0
    ? divergences.map(d => d.description).join('\n')
    : 'なし';

  // Pattern section
  const patternLines = patterns.length > 0 ? patterns.join(', ') : '特定パターンなし';

  // MTF section
  const mtfLines = mtfResult.analyses.map(a =>
    `${a.timeframe} | RSI14=${r2(a.indicators.rsi14)} | MACD=${macdArrow(a.indicators.macd.histogram)} | SMA=${smaPosition(a.indicators.sma.ma5, a.indicators.sma.ma21)} | 方向=${dirArrow(a.direction)} | 重み=×${r2(a.weight)}`
  ).join('\n');

  // Daily SMA section
  const sma = dailyIndicators.sma;
  const crossParts: string[] = [];
  if (dailyIndicators.goldenCross.sma5x21) crossParts.push('SMA5×21 GC');
  if (dailyIndicators.goldenCross.sma21x70) crossParts.push('SMA21×70 GC');
  if (dailyIndicators.goldenCross.sma70x200) crossParts.push('SMA70×200 GC');
  if (dailyIndicators.deadCross.sma5x21) crossParts.push('SMA5×21 DC');
  if (dailyIndicators.deadCross.sma21x70) crossParts.push('SMA21×70 DC');
  if (dailyIndicators.deadCross.sma70x200) crossParts.push('SMA70×200 DC');
  const gcLine = crossParts.length > 0 ? crossParts.join(', ') : 'なし';

  // Daily oscillators
  const stoch = dailyIndicators.stochastic;
  const bb = dailyIndicators.bollingerBands;

  // Daily fib + pivot
  const dailyFib = fibs['daily'];
  const fib50 = dailyFib.levels.find(l => l.ratio === 0.5)?.price ?? r2(currentPrice);
  const fib236 = dailyFib.levels.find(l => l.ratio === 0.236)?.price ?? r2(currentPrice);
  const fib382 = dailyFib.levels.find(l => l.ratio === 0.382)?.price ?? r2(currentPrice);
  const fib618 = dailyFib.levels.find(l => l.ratio === 0.618)?.price ?? r2(currentPrice);
  const fib786 = dailyFib.levels.find(l => l.ratio === 0.786)?.price ?? r2(currentPrice);
  const pp = dailyFib.pivotPoints;

  const confluenceStr = confluenceZones.length > 0
    ? confluenceZones.slice(0, 3).map(z =>
        `$${fmt(z.priceZone.lower)}–$${fmt(z.priceZone.upper)} [${z.timeframes.join('/')}] ${z.type}`
      ).join(', ')
    : 'なし';

  // Order blocks
  const bullishOBs = orderBlocks.filter(o => o.type === 'bullish').slice(0, 3);
  const bearishOBs = orderBlocks.filter(o => o.type === 'bearish').slice(0, 3);
  const obStr = [
    bullishOBs.length > 0
      ? '強気OB: ' + bullishOBs.map(o => `$${fmt(o.low)}–$${fmt(o.high)}`).join(', ')
      : '強気OB: なし',
    bearishOBs.length > 0
      ? '弱気OB: ' + bearishOBs.map(o => `$${fmt(o.low)}–$${fmt(o.high)}`).join(', ')
      : '弱気OB: なし',
  ].join(' | ');

  // FVG
  const fvgStr = fvgs.length > 0
    ? fvgs.slice(0, 5).map(f =>
        `[${f.type === 'bullish' ? '強気' : '弱気'}] $${fmt(f.lower)}–$${fmt(f.upper)} (${f.timeframe})`
      ).join(', ')
    : 'なし';

  // Liquidity zones
  const eqHighs = liquidityZones.filter(z => z.type === 'equal_highs').slice(0, 3);
  const eqLows  = liquidityZones.filter(z => z.type === 'equal_lows').slice(0, 3);
  const liqStr = [
    eqHighs.length > 0
      ? 'イコールハイ: ' + eqHighs.map(z => `$${fmt(z.price)} (${z.touchCount}回)${z.swept ? ' [スイープ済]' : ''}`).join(', ')
      : '',
    eqLows.length > 0
      ? 'イコールロー: ' + eqLows.map(z => `$${fmt(z.price)} (${z.touchCount}回)${z.swept ? ' [スイープ済]' : ''}`).join(', ')
      : '',
  ].filter(Boolean).join(' | ') || 'なし';

  // Upcoming events
  const eventLines = upcomingEvents.length > 0
    ? upcomingEvents.slice(0, 3).map(e =>
        `${e.name}: ${e.daysUntil}日後${e.hoursUntil < 24 ? ` (${e.hoursUntil}時間後)` : ''} [${e.impact}]${e.isBlackout ? ' ⚠ ブラックアウト中' : ''}`
      ).join('\n')
    : 'なし';

  // News headlines
  const headlines = news.topHeadlines.slice(0, 3).join(' / ');

  return `あなたはGOLD（XAU/USD）のプロアナリストです。以下の全データを分析し予測してください。

■ 基本情報
現在価格: $${fmt(currentPrice)} | ATR14: $${fmt(dailyIndicators.atr14)}
セッション: ${sessionInfo.name} | 信頼度補正: ×${sessionInfo.weight} | 週末リスク: ${sessionInfo.isWeekendRisk ? 'あり' : 'なし'}
ニュースブラックアウト: ${blackoutInfo.isBlackout ? 'あり' : 'なし'}

■ マーケット構造
${structure.description}

■ レジーム（市場状態）
${regimeDesc}
指標優先度: MACD×${weights.macd} RSI×${weights.rsi} BB×${weights.bb}

■ ダイバージェンス
${divLines}

■ チャートパターン
${patternLines}

■ 6時間足MTF分析（加重スコア: ${r2(mtfResult.totalScore)}/10）
${mtfLines}

■ 移動平均（日足）
SMA5=$${fmt(sma.ma5)} SMA21=$${fmt(sma.ma21)} SMA70=$${fmt(sma.ma70)} SMA200=$${fmt(sma.ma200)}
GC: ${gcLine}

■ オシレータ（日足）
RSI7=${r2(dailyIndicators.rsi7)} RSI14=${r2(dailyIndicators.rsi14)} Stoch=${r2(stoch.k)}/${r2(stoch.d)} Williams=${r2(dailyIndicators.williamsR)} CCI=${r2(dailyIndicators.cci20)} ROC=${r2(dailyIndicators.roc10)}%

■ ボラティリティ
ATR14=$${fmt(dailyIndicators.atr14)} BB上/中/下=$${fmt(bb.upper)}/$${fmt(bb.middle)}/$${fmt(bb.lower)} バンド位置=${r2(bb.position * 100)}%

■ フィボナッチ + ピボット
Fib23.6=$${fmt(fib236)} 38.2=$${fmt(fib382)} 50=$${fmt(fib50)} 61.8=$${fmt(fib618)} 78.6=$${fmt(fib786)}
PP=$${fmt(pp.pp)} R1=$${fmt(pp.r1)} R2=$${fmt(pp.r2)} S1=$${fmt(pp.s1)} S2=$${fmt(pp.s2)}
コンフルエンス: ${confluenceStr}

■ 大口・機関投資家動向
オーダーブロック: ${obStr}
FVG: ${fvgStr}
流動性: ${liqStr}

■ 相関分析
USD相関: ${econData.goldUsdCorrelation} | 実質金利: ${econData.realInterestRate}% | 実質金利相関: ${econData.goldRealRateCorrelation}

■ 経済指標
10年債=${econData.treasuryYield10y}% FFレート=${econData.federalFundsRate}% CPI=${econData.cpi}% 実質金利=${econData.realInterestRate}%

■ COTレポート
商業筋ネット=${cotData.commercial.net} | 非商業筋ネット=${cotData.nonCommercial.net}
商業筋パーセンタイル=${cotData.commercialPercentile}% | 非商業筋パーセンタイル=${cotData.netPositionPercentile}%
商業筋極端値: isExtremeShort=${cotData.commercialExtreme.isExtremeShort} / isExtremeLong=${cotData.commercialExtreme.isExtremeLong}
相反シグナル: ${cotData.conflictSignal ? 'あり' : 'なし'}

■ ニュースセンチメント
強気${news.bullishCount} 弱気${news.bearishCount} 平均=${r2(news.avgScore)}
ヘッドライン: ${headlines}

■ 季節性
${seasonality.month}月: 歴史的平均${seasonality.avgReturn}% (${seasonality.reliability}) | ${seasonality.note}

■ 次の重要イベント
${eventLines}

あなたは逆張りの視点も持つプロアナリストです。上昇シグナルが多い場合でも、なぜ下落するリスクがあるかを必ず考慮してください。「みんながLONGと思っているとき、大口はSHORTを仕込む」という視点を忘れないでください。

以下のJSONで出力（全数値は小数点第2位まで）:
{
  "tradeSignal": "LONG|SHORT|WAIT",
  "entryTiming": "immediate|pullback|wait",
  "entryCondition": "...",
  "invalidationLevel": ${r2(currentPrice)},
  "currentPrice": ${r2(currentPrice)},
  "spread": 0.30,
  "slippage": 0.50,
  "entryPrice": ${r2(currentPrice)},
  "stopLoss": ${r2(currentPrice)},
  "takeProfit1": ${r2(currentPrice)},
  "takeProfit2": ${r2(currentPrice)},
  "riskPips": 0.00,
  "rewardPips1": 0.00,
  "rewardPips2": 0.00,
  "riskRewardRatio1": 0.00,
  "riskRewardRatio2": 0.00,
  "adjustedRR1": 0.00,
  "adjustedRR_realistic": 0.00,
  "trailingStopStrategy": {
    "step1": "TP1到達後: SLをエントリー価格へ移動してゼロリスク化",
    "step2": "SMA5を割れたら手動決済を検討",
    "step3": "TP2目標: $X,XXX.XX"
  },
  "entryRationale": "...",
  "stopLossRationale": "...",
  "takeProfitRationale": "...",
  "direction": "up|down|flat",
  "confidence": 0,
  "shortTermOutlook": "24h見通し（200字以内）",
  "mediumTermOutlook": "1週間見通し（200字以内）",
  "keyBullishFactors": ["...","...","..."],
  "keyBearishFactors": ["...","...","..."],
  "technicalSummary": "100字以内",
  "fundamentalSummary": "100字以内",
  "sentimentSummary": "100字以内",
  "cotSummary": "100字以内",
  "calendarWarning": "..."
}
※ 投資判断は自己責任で行ってください。`;
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function generatePrediction(
  priceData: GoldPriceResponse,
  econData: EconomicData,
  cotData: COTData,
  upcomingEvents: UpcomingEvent[],
): Promise<Prediction> {
  const currentPrice = priceData.currentPrice;

  // 1. Calculate indicators for each timeframe
  const indicatorsPerTF = Object.fromEntries(
    (Object.keys(priceData.timeframes) as Timeframe[]).map(tf => [
      tf,
      calculateAllIndicators(priceData.timeframes[tf]),
    ])
  ) as Record<Timeframe, ReturnType<typeof calculateAllIndicators>>;

  // 2. Session info + MTF analysis
  const sessionInfo = getCurrentSession();
  const mtfResult   = analyzeMultiTimeframe(priceData.timeframes, sessionInfo);

  // 3. Detect regime from daily indicators
  const dailyIndicators = indicatorsPerTF['daily'];
  const regime = detectRegime(dailyIndicators);

  // 4. Market structure + divergences + patterns (using daily candles)
  const dailyCandles = priceData.timeframes['daily'];
  const structure    = analyzeMarketStructure(dailyCandles);

  const divergences: DivergenceResult[] = [];
  for (const tf of ['daily', '4h', '1h'] as Timeframe[]) {
    const tfDiv = detectDivergence(
      priceData.timeframes[tf],
      indicatorsPerTF[tf],
      tf,
    );
    divergences.push(...tfDiv);
  }

  const patterns = detectPatterns(dailyCandles);

  // 5. Fibonacci for daily, 4H, 1H
  const fibTFs: Timeframe[] = ['daily', '4h', '1h'];
  const fibs: Record<Timeframe, FibonacciData> = {} as Record<Timeframe, FibonacciData>;
  for (const tf of fibTFs) {
    fibs[tf] = calculateFibonacci(priceData.timeframes[tf], currentPrice, tf);
  }
  const confluenceZones = findFibConfluence(fibs);

  // 6. Order blocks, FVGs, liquidity zones from daily + 4H
  const orderBlocks: OrderBlock[] = [
    ...detectOrderBlocks(dailyCandles, dailyIndicators.atr14, 'daily'),
    ...detectOrderBlocks(priceData.timeframes['4h'], indicatorsPerTF['4h'].atr14, '4h'),
  ];

  const fvgs: FairValueGap[] = [
    ...detectFVGs(dailyCandles, 'daily'),
    ...detectFVGs(priceData.timeframes['4h'], '4h'),
  ];

  const liquidityZones: LiquidityZone[] = detectLiquidityZones(dailyCandles);

  // 7. Seasonality
  const seasonality: Seasonality = getCurrentSeasonality();

  // 8. News blackout check
  const blackoutInfo = isInsideNewsBlackout();

  // 9. Fetch news sentiment
  const newsData = await fetchNewsSentiment();

  // 10. Build Claude prompt
  const prompt = buildPrompt(
    priceData,
    econData,
    cotData,
    upcomingEvents,
    sessionInfo,
    seasonality,
    blackoutInfo,
    mtfResult,
    structure,
    divergences,
    patterns,
    fibs,
    confluenceZones,
    orderBlocks,
    fvgs,
    liquidityZones,
    regime,
    newsData,
  );

  // 11. Call Claude claude-sonnet-4-6
  const client = new Anthropic();
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  // 12. Parse Claude's JSON response
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawText = (message.content as any[])
    .filter((block: { type: string }) => block.type === 'text')
    .map((block: { type: string; text: string }) => block.text)
    .join('');

  // Strip markdown code fences if present
  const jsonStr = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    // If parsing fails, create a minimal WAIT response
    parsed = {
      tradeSignal: 'WAIT',
      entryTiming: 'wait',
      entryCondition: 'JSONパースエラー。市場分析を再実行してください。',
      invalidationLevel: r2(currentPrice),
      currentPrice: r2(currentPrice),
      spread: 0.30,
      slippage: 0.50,
      entryPrice: r2(currentPrice),
      stopLoss: r2(currentPrice * 0.99),
      takeProfit1: r2(currentPrice * 1.01),
      takeProfit2: r2(currentPrice * 1.02),
      riskPips: 0,
      rewardPips1: 0,
      rewardPips2: 0,
      riskRewardRatio1: 0,
      riskRewardRatio2: 0,
      adjustedRR1: 0,
      adjustedRR_realistic: 0,
      trailingStopStrategy: {
        step1: 'TP1到達後: SLをエントリー価格へ移動してゼロリスク化',
        step2: 'SMA5を割れたら手動決済を検討',
        step3: `TP2目標: $${fmt(currentPrice)}`,
      },
      entryRationale: 'データ取得エラー',
      stopLossRationale: 'データ取得エラー',
      takeProfitRationale: 'データ取得エラー',
      direction: 'flat',
      confidence: 0,
      shortTermOutlook: 'データ取得エラー',
      mediumTermOutlook: 'データ取得エラー',
      keyBullishFactors: [],
      keyBearishFactors: [],
      technicalSummary: '',
      fundamentalSummary: '',
      sentimentSummary: '',
      cotSummary: '',
      calendarWarning: '',
    };
  }

  // Helper to safely coerce numbers
  const num = (v: unknown, fallback = 0): number => {
    const n = parseFloat(String(v ?? fallback));
    return isNaN(n) ? fallback : Math.round(n * 100) / 100;
  };
  const str = (v: unknown, fallback = ''): string => String(v ?? fallback);
  const arr = (v: unknown): string[] => {
    if (Array.isArray(v)) return v.map(String);
    return [];
  };

  // 13. Build TradeSetup
  let signal = str(parsed.tradeSignal, 'WAIT') as TradeSignal;
  if (!['LONG', 'SHORT', 'WAIT'].includes(signal)) signal = 'WAIT';

  // Force WAIT if inside news blackout
  if (blackoutInfo.isBlackout) {
    signal = 'WAIT';
  }

  const trailStrategy = (parsed.trailingStopStrategy ?? {}) as Record<string, string>;

  const tradeSetup: TradeSetup = {
    signal,
    entryTiming:        str(parsed.entryTiming, 'wait') as TradeSetup['entryTiming'],
    entryCondition:     str(parsed.entryCondition),
    invalidationLevel:  num(parsed.invalidationLevel, currentPrice),
    currentPrice:       num(parsed.currentPrice, currentPrice),
    spread:             num(parsed.spread, 0.30),
    slippage:           num(parsed.slippage, 0.50),
    entryPrice:         num(parsed.entryPrice, currentPrice),
    stopLoss:           num(parsed.stopLoss, currentPrice),
    takeProfit1:        num(parsed.takeProfit1, currentPrice),
    takeProfit2:        num(parsed.takeProfit2, currentPrice),
    riskPips:           num(parsed.riskPips),
    rewardPips1:        num(parsed.rewardPips1),
    rewardPips2:        num(parsed.rewardPips2),
    riskRewardRatio1:   num(parsed.riskRewardRatio1),
    riskRewardRatio2:   num(parsed.riskRewardRatio2),
    adjustedRR1:        num(parsed.adjustedRR1),
    adjustedRR_realistic: num(parsed.adjustedRR_realistic),
    trailingStopStrategy: {
      step1: str(trailStrategy.step1, 'TP1到達後: SLをエントリー価格へ移動してゼロリスク化'),
      step2: str(trailStrategy.step2, 'SMA5を割れたら手動決済を検討'),
      step3: str(trailStrategy.step3, `TP2目標: $${fmt(currentPrice)}`),
    },
    entryRationale:     str(parsed.entryRationale),
    stopLossRationale:  str(parsed.stopLossRationale),
    takeProfitRationale: str(parsed.takeProfitRationale),
  };

  // 14. Map direction
  const rawDirection = str(parsed.direction, 'flat');
  let direction: Direction = 'flat';
  if (rawDirection === 'up') direction = 'up';
  else if (rawDirection === 'down') direction = 'down';

  // 15. Find next upcoming event (first non-blackout or first)
  const nextEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : undefined;

  // 16. Build Prediction
  const prediction: Prediction = {
    id:              uuidv4(),
    tradeSetup,
    direction,
    confidence:      Math.min(100, Math.max(0, num(parsed.confidence, 0))),
    regime,
    sessionInfo,
    isNewsBlackout:  blackoutInfo.isBlackout,
    nextEvent,
    weekendRisk:     sessionInfo.isWeekendRisk,
    mtfScore:        r2(mtfResult.totalScore),
    mtfDirection:    mtfResult.direction,
    shortTermOutlook:  str(parsed.shortTermOutlook),
    mediumTermOutlook: str(parsed.mediumTermOutlook),
    keyBullishFactors: arr(parsed.keyBullishFactors),
    keyBearishFactors: arr(parsed.keyBearishFactors),
    technicalSummary:  str(parsed.technicalSummary),
    fundamentalSummary: str(parsed.fundamentalSummary),
    sentimentSummary:  str(parsed.sentimentSummary),
    cotSummary:        str(parsed.cotSummary),
    calendarWarning:   str(parsed.calendarWarning),
    riskNote:         '本ツールの予測は参考情報です。実際の投資判断は自己責任で行ってください。過去の成績は将来の結果を保証しません。',
    priceAtPrediction: r2(currentPrice),
    createdAt:         new Date().toISOString(),
  };

  return prediction;
}
