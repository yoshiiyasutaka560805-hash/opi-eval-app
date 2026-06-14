import { NextResponse } from 'next/server';
import { fetchAllTimeframes } from '@/lib/goldPrice';
import { calculateAllIndicators } from '@/lib/technical';
import { calculateFibonacci } from '@/lib/fibonacci';
import { detectOrderBlocks } from '@/lib/orderBlocks';
import { detectFVGs } from '@/lib/fairValueGap';
import { detectLiquidityZones } from '@/lib/liquidity';
import { analyzeMarketStructure } from '@/lib/marketStructure';
import { detectDivergence } from '@/lib/divergence';
import { detectPatterns } from '@/lib/patterns';
import { analyzeMultiTimeframe } from '@/lib/multiTimeframe';
import { getCurrentSession } from '@/lib/session';
import { Timeframe } from '@/types';

export async function GET() {
  try {
    // Fetch all timeframe price data
    const priceData = await fetchAllTimeframes();
    const sessionInfo = getCurrentSession();
    const currentPrice = priceData.currentPrice;

    // Calculate indicators for each timeframe
    const indicatorsPerTF = Object.fromEntries(
      (Object.keys(priceData.timeframes) as Timeframe[]).map(tf => [
        tf,
        calculateAllIndicators(priceData.timeframes[tf]),
      ])
    ) as Record<Timeframe, ReturnType<typeof calculateAllIndicators>>;

    // Run MTF analysis
    const mtfResult = analyzeMultiTimeframe(priceData.timeframes, sessionInfo);

    // Daily candle analysis
    const dailyCandles = priceData.timeframes['daily'];
    const dailyIndicators = indicatorsPerTF['daily'];

    // Market structure from daily candles
    const structure = analyzeMarketStructure(dailyCandles);

    // Divergences from daily + 4H + 1H
    const divergences = [
      ...detectDivergence(priceData.timeframes['daily'], indicatorsPerTF['daily'], 'daily'),
      ...detectDivergence(priceData.timeframes['4h'], indicatorsPerTF['4h'], '4h'),
      ...detectDivergence(priceData.timeframes['1h'], indicatorsPerTF['1h'], '1h'),
    ];

    // Chart patterns from daily candles
    const patterns = detectPatterns(dailyCandles);

    // Fibonacci for major timeframes
    const fibDaily = calculateFibonacci(dailyCandles, currentPrice, 'daily');
    const fib4h    = calculateFibonacci(priceData.timeframes['4h'], currentPrice, '4h');
    const fib1h    = calculateFibonacci(priceData.timeframes['1h'], currentPrice, '1h');

    // Order blocks from daily + 4H
    const orderBlocks = [
      ...detectOrderBlocks(dailyCandles, dailyIndicators.atr14, 'daily'),
      ...detectOrderBlocks(priceData.timeframes['4h'], indicatorsPerTF['4h'].atr14, '4h'),
    ];

    // Fair value gaps from daily + 4H
    const fvgs = [
      ...detectFVGs(dailyCandles, 'daily'),
      ...detectFVGs(priceData.timeframes['4h'], '4h'),
    ];

    // Liquidity zones from daily candles
    const liquidityZones = detectLiquidityZones(dailyCandles);

    return NextResponse.json({
      priceData,
      sessionInfo,
      indicators: indicatorsPerTF,
      mtf: {
        analyses:   mtfResult.analyses,
        totalScore: mtfResult.totalScore,
        direction:  mtfResult.direction,
      },
      structure,
      divergences,
      patterns,
      fibonacci: {
        daily: fibDaily,
        '4h':  fib4h,
        '1h':  fib1h,
      },
      orderBlocks,
      fvgs,
      liquidityZones,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch gold price data', details: message },
      { status: 500 }
    );
  }
}
