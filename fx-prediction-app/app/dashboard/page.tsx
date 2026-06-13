'use client';

import { useState, useEffect, type ReactNode } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type {
  Prediction,
  GoldPriceResponse,
  PredictionRecord,
  PredictionAccuracy,
  Timeframe,
  OHLCV,
} from '../../types/index';

// ─── helpers ────────────────────────────────────────────────────────────────

function fmt(n: number | undefined | null, decimals = 2) {
  if (n == null) return '—';
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function signalColor(signal: string) {
  if (signal === 'LONG') return 'text-[#3FB950]';
  if (signal === 'SHORT') return 'text-[#F85149]';
  return 'text-[#8B949E]';
}

function signalEmoji(signal: string) {
  if (signal === 'LONG') return '🟢';
  if (signal === 'SHORT') return '🔴';
  return '⚪';
}

function directionEmoji(dir: string) {
  if (dir === 'up') return '🟢';
  if (dir === 'down') return '🔴';
  return '⚪';
}

function minutesUntilNextUpdate(lastUpdated: Date | null) {
  if (!lastUpdated) return null;
  const next = new Date(lastUpdated.getTime() + 60_000);
  const diff = Math.max(0, Math.round((next.getTime() - Date.now()) / 1000));
  return diff;
}

// ─── sub-components ─────────────────────────────────────────────────────────

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-[#161B22] border border-[#30363D] rounded-xl p-4 ${className}`}>
      {children}
    </div>
  );
}

function SectionHeader({
  title,
  name,
  expanded,
  onToggle,
}: {
  title: string;
  name: string;
  expanded: boolean;
  onToggle: (n: string) => void;
}) {
  return (
    <button
      className="w-full flex items-center justify-between text-left p-4 bg-[#161B22] border border-[#30363D] rounded-xl hover:bg-[#1C2128] transition-colors"
      onClick={() => onToggle(name)}
    >
      <span className="text-[#E6EDF3] font-semibold text-sm">{title}</span>
      <span className="text-[#8B949E] text-lg">{expanded ? '▲' : '▼'}</span>
    </button>
  );
}

function AccordionSection({
  title,
  name,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  name: string;
  expanded: boolean;
  onToggle: (n: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="space-y-0">
      <SectionHeader title={title} name={name} expanded={expanded} onToggle={onToggle} />
      {expanded && (
        <Card className="rounded-t-none border-t-0 -mt-1">
          {children}
        </Card>
      )}
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [priceData, setPriceData] = useState<GoldPriceResponse | null>(null);
  const [econData, setEconData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Timeframe>('1h');
  const [showDetail, setShowDetail] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showMT5Modal, setShowMT5Modal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoCheckInterval, setAutoCheckInterval] = useState<30 | 60 | 0>(30);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [notificationThreshold, setNotificationThreshold] = useState(75);
  const [cooldownWarning, setCooldownWarning] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<PredictionRecord[]>([]);
  const [accuracy, setAccuracy] = useState<PredictionAccuracy | null>(null);
  const [mt5CopyText, setMt5CopyText] = useState('');
  const [secondsToUpdate, setSecondsToUpdate] = useState<number | null>(null);

  // ── auto price refresh ───────────────────────────────────────────────────
  useEffect(() => {
    loadPriceData();
    const interval = setInterval(loadPriceData, 60_000);
    return () => clearInterval(interval);
  }, []);

  // ── countdown ticker ─────────────────────────────────────────────────────
  useEffect(() => {
    const tick = setInterval(() => {
      setSecondsToUpdate(minutesUntilNextUpdate(lastUpdated));
    }, 1000);
    return () => clearInterval(tick);
  }, [lastUpdated]);

  // ── load predictions from localStorage ──────────────────────────────────
  useEffect(() => {
    try {
      const stored = localStorage.getItem('goldai_predictions');
      if (stored) {
        const parsed: PredictionRecord[] = JSON.parse(stored);
        setPredictions(parsed);
        computeAccuracy(parsed);
      }
    } catch (_) {}
  }, []);

  // ── functions ─────────────────────────────────────────────────────────────

  async function loadPriceData() {
    try {
      const res = await fetch('/api/gold-price');
      if (res.ok) {
        const data: GoldPriceResponse = await res.json();
        setPriceData(data);
        setLastUpdated(new Date());
      }
    } catch (_) {
    } finally {
      setPriceLoading(false);
    }
  }

  async function runPrediction() {
    // cooldown: 20 seconds between predictions
    const lastRun = localStorage.getItem('goldai_lastRun');
    if (lastRun) {
      const elapsed = Date.now() - Number(lastRun);
      if (elapsed < 20_000) {
        setCooldownWarning(`前回の予測から${Math.ceil((20_000 - elapsed) / 1000)}秒後に再実行できます`);
        setTimeout(() => setCooldownWarning(null), 4000);
        return;
      }
    }

    setLoading(true);
    setCooldownWarning(null);
    try {
      const res = await fetch('/api/predict', { method: 'POST' });
      if (res.ok) {
        const data: Prediction = await res.json();
        setPrediction(data);
        localStorage.setItem('goldai_lastRun', String(Date.now()));

        // save record
        const record: PredictionRecord = {
          id: data.id,
          signal: data.tradeSetup.signal,
          confidence: data.confidence,
          priceAtPrediction: data.priceAtPrediction,
          entryPrice: data.tradeSetup.entryPrice,
          stopLoss: data.tradeSetup.stopLoss,
          takeProfit1: data.tradeSetup.takeProfit1,
          takeProfit2: data.tradeSetup.takeProfit2,
          outcome: 'PENDING',
          createdAt: data.createdAt,
        };
        const updated = [record, ...predictions].slice(0, 50);
        setPredictions(updated);
        localStorage.setItem('goldai_predictions', JSON.stringify(updated));
        computeAccuracy(updated);

        // browser notification
        if (notificationEnabled && data.confidence >= notificationThreshold) {
          new Notification(`GOLD AI: ${data.tradeSetup.signal} ${data.confidence}%`, {
            body: `Entry $${fmt(data.tradeSetup.entryPrice)} | TP1 $${fmt(data.tradeSetup.takeProfit1)}`,
          });
        }
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  }

  function toggleSection(name: string) {
    setExpandedSections((prev: Set<string>) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function copyMT5Text() {
    if (!prediction) return;
    const { signal, entryPrice, stopLoss, takeProfit1, takeProfit2 } = prediction.tradeSetup;
    const dir = signal === 'LONG' ? 'LONG' : signal === 'SHORT' ? 'SHORT' : 'WAIT';
    const text = `${dir} Entry $${fmt(entryPrice)} SL $${fmt(stopLoss)} TP1 $${fmt(takeProfit1)} TP2 $${fmt(takeProfit2)}`;
    navigator.clipboard.writeText(text).catch(() => {});
    setMt5CopyText(text);
    setShowMT5Modal(true);
  }

  async function enableNotifications() {
    if (!('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    setNotificationEnabled(perm === 'granted');
  }

  function computeAccuracy(recs: PredictionRecord[]) {
    const resolved = recs.filter((r) => r.outcome && r.outcome !== 'PENDING' && r.outcome !== 'EXPIRED');
    if (resolved.length === 0) { setAccuracy(null); return; }
    const tp1 = resolved.filter((r) => r.outcome === 'TP1_HIT' || r.outcome === 'TP2_HIT').length;
    const tp2 = resolved.filter((r) => r.outcome === 'TP2_HIT').length;
    const sl = resolved.filter((r) => r.outcome === 'SL_HIT').length;
    setAccuracy({
      total: resolved.length,
      tp1HitRate: tp1 / resolved.length,
      tp2HitRate: tp2 / resolved.length,
      slHitRate: sl / resolved.length,
      pendingCount: recs.filter((r) => r.outcome === 'PENDING').length,
      averageRRachieved: 0,
    });
  }

  // ── chart data ────────────────────────────────────────────────────────────
  const chartCandles: OHLCV[] = priceData?.timeframes?.[activeTab] ?? [];
  const chartData = chartCandles.slice(-60).map((c, i) => ({
    index: i,
    date: c.date,
    close: c.close,
  }));

  const tabLabels: { key: Timeframe; label: string; warn?: boolean }[] = [
    { key: '5min', label: '5m', warn: true },
    { key: '15min', label: '15m', warn: true },
    { key: '30min', label: '30m' },
    { key: '1h', label: '1H' },
    { key: '4h', label: '4H' },
    { key: 'daily', label: '日足' },
  ];

  const ts = prediction?.tradeSetup;
  const changePositive = (priceData?.change ?? 0) >= 0;

  // ── MTF score display ────────────────────────────────────────────────────
  const mtfScore = prediction?.mtfScore ?? null;
  const mtfDir = prediction?.mtfDirection ?? null;

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen bg-[#0D1117] text-[#E6EDF3]">

      {/* ── Warning Banners (fixed top) ───────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">
        {prediction?.isNewsBlackout && (
          <div className="bg-red-900/80 border-b border-red-500 px-4 py-2 text-center text-sm">
            🚫 {prediction.nextEvent?.name}発表前 - エントリー禁止期間
          </div>
        )}
        {prediction?.weekendRisk && (
          <div className="bg-yellow-900/80 border-b border-yellow-500 px-4 py-2 text-center text-sm">
            ⚠️ 週末ギャップリスク - 新規エントリー非推奨
          </div>
        )}
        {cooldownWarning && (
          <div className="bg-orange-900/80 border-b border-orange-500 px-4 py-2 text-center text-sm">
            ⚠️ {cooldownWarning}
          </div>
        )}
      </div>

      {/* ── Main scroll area ──────────────────────────────────────────────── */}
      <div
        className="mx-auto max-w-lg px-4 pb-28"
        style={{
          paddingTop:
            (prediction?.isNewsBlackout ? 40 : 0) +
            (prediction?.weekendRisk ? 40 : 0) +
            (cooldownWarning ? 40 : 0) +
            64 +
            'px',
        }}
      >

        {/* ── LAYER 1 ──────────────────────────────────────────────────────── */}

        {/* Navbar */}
        <div className="fixed left-0 right-0 z-40 bg-[#0D1117]/95 backdrop-blur border-b border-[#30363D]"
          style={{
            top:
              (prediction?.isNewsBlackout ? 40 : 0) +
              (prediction?.weekendRisk ? 40 : 0) +
              (cooldownWarning ? 40 : 0) +
              'px',
          }}
        >
          <div className="mx-auto max-w-lg px-4 h-14 flex items-center justify-between">
            <span className="text-[#E3B341] font-bold text-lg tracking-wide">🪙 GOLD AI</span>
            <div className="flex items-center gap-3">
              <button
                onClick={enableNotifications}
                className={`text-xl ${notificationEnabled ? 'text-[#E3B341]' : 'text-[#8B949E]'}`}
                title="通知設定"
              >
                🔔
              </button>
              {lastUpdated && (
                <span className="text-[#8B949E] text-xs">
                  {lastUpdated.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })} 更新
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Price Hero */}
        <Card className="mb-4">
          <p className="text-[#8B949E] text-xs uppercase tracking-widest mb-1">GOLD XAU/USD</p>
          {priceLoading ? (
            <div className="h-10 flex items-center">
              <span className="text-[#8B949E] text-sm animate-pulse">価格を取得中...</span>
            </div>
          ) : (
            <div className="flex items-end gap-3 mb-2">
              <span className="text-3xl font-bold text-[#E3B341]">
                ${fmt(priceData?.currentPrice)}
              </span>
              <span className={`text-sm font-medium pb-0.5 ${changePositive ? 'text-[#3FB950]' : 'text-[#F85149]'}`}>
                {changePositive ? '↑' : '↓'} {changePositive ? '+' : ''}${fmt(priceData?.change)} ({changePositive ? '+' : ''}{fmt(priceData?.changePct)}%)
              </span>
            </div>
          )}
          <div className="flex items-center gap-3">
            {prediction?.sessionInfo && (
              <span className="bg-[#0D1117] border border-[#30363D] rounded-full px-3 py-0.5 text-xs text-[#8B949E]">
                🌐 {prediction.sessionInfo.name}
              </span>
            )}
            {secondsToUpdate != null && (
              <span className="text-[#8B949E] text-xs">
                次回更新: {secondsToUpdate}秒後
              </span>
            )}
            {priceData?.isDemo && (
              <span className="text-[#D29922] text-xs border border-[#D29922]/40 rounded px-2 py-0.5">DEMO</span>
            )}
          </div>
        </Card>

        {/* Signal Card */}
        {prediction && ts ? (
          <Card className="mb-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{signalEmoji(ts.signal)}</span>
                <span className={`text-xl font-bold ${signalColor(ts.signal)}`}>{ts.signal}</span>
              </div>
              <div className="text-right">
                <span className="text-[#E3B341] font-bold text-lg">{prediction.confidence}%</span>
                <p className="text-[#8B949E] text-xs">信頼度</p>
              </div>
            </div>

            {/* Levels */}
            <div className="space-y-1.5 text-sm">
              {/* TP2 */}
              <div className="flex items-center justify-between py-1.5 px-3 bg-[#58A6FF]/10 rounded-lg border border-[#58A6FF]/20">
                <div className="flex items-center gap-2">
                  <span className="text-[#8B949E] text-xs w-8">TP2</span>
                  <span className="text-[#58A6FF] font-medium">${fmt(ts.takeProfit2)}</span>
                </div>
                <div className="text-right text-xs text-[#8B949E]">
                  <span>+{fmt(ts.rewardPips2, 0)}pips</span>
                  <span className="ml-2">RR {fmt(ts.riskRewardRatio2, 1)}</span>
                </div>
              </div>

              {/* TP1 — primary target */}
              <div className="flex items-center justify-between py-1.5 px-3 bg-[#3FB950]/10 rounded-lg border border-[#3FB950]/30">
                <div className="flex items-center gap-2">
                  <span className="text-[#8B949E] text-xs w-8">TP1</span>
                  <span className="text-[#3FB950] font-semibold">${fmt(ts.takeProfit1)}</span>
                  <span className="text-[#3FB950] text-xs bg-[#3FB950]/20 px-1.5 py-0.5 rounded">主目標</span>
                </div>
                <div className="text-right text-xs text-[#8B949E]">
                  <span>+{fmt(ts.rewardPips1, 0)}pips</span>
                  <span className="ml-2">RR {fmt(ts.riskRewardRatio1, 1)}</span>
                </div>
              </div>

              {/* Entry */}
              <div className="flex items-center justify-between py-2 px-3 bg-[#E3B341]/10 rounded-lg border border-[#E3B341]/40">
                <div className="flex items-center gap-2">
                  <span className="text-[#8B949E] text-xs w-8">ENT</span>
                  <span className="text-[#E3B341] font-bold text-base">${fmt(ts.entryPrice)}</span>
                </div>
                <span className="text-[#8B949E] text-xs">{ts.entryTiming === 'immediate' ? '即時エントリー' : ts.entryTiming === 'pullback' ? '押し目待ち' : '待機'}</span>
              </div>

              {/* SL */}
              <div className="flex items-center justify-between py-1.5 px-3 bg-[#F85149]/10 rounded-lg border border-[#F85149]/20">
                <div className="flex items-center gap-2">
                  <span className="text-[#8B949E] text-xs w-8">SL</span>
                  <span className="text-[#F85149] font-medium">${fmt(ts.stopLoss)}</span>
                </div>
                <span className="text-[#8B949E] text-xs">-{fmt(ts.riskPips, 0)}pips</span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[#30363D] my-3" />

            {/* Extra info */}
            <div className="space-y-1.5 text-xs text-[#8B949E]">
              <p>無効化: <span className="text-[#F85149]">${fmt(ts.invalidationLevel)}</span>割れで失効</p>
              <p>📌 TP1後: SLを<span className="text-[#E3B341]">${fmt(ts.entryPrice)}</span>へ移動（損益分岐点）</p>
            </div>

            {/* MT5 copy button */}
            <button
              onClick={copyMT5Text}
              className="mt-3 w-full py-2 bg-[#21262D] border border-[#30363D] rounded-lg text-sm text-[#E6EDF3] hover:bg-[#30363D] transition-colors flex items-center justify-center gap-2"
            >
              📋 MT5用にコピー
            </button>
          </Card>
        ) : (
          /* CTA — no prediction yet */
          <div className="mb-4">
            <button
              onClick={runPrediction}
              disabled={loading}
              className="w-full py-5 bg-gradient-to-r from-[#E3B341] to-[#D29922] text-[#0D1117] font-bold text-lg rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  AI分析中...（約20秒）
                </>
              ) : (
                <>▶ AI予測を実行する（約20秒）</>
              )}
            </button>
          </div>
        )}

        {/* ── LAYER 2 ──────────────────────────────────────────────────────── */}
        {showDetail && (
          <div className="space-y-4 mb-4">

            {/* Chart with timeframe tabs */}
            <Card>
              <div className="flex gap-1 mb-3 overflow-x-auto">
                {tabLabels.map(({ key, label, warn }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      activeTab === key
                        ? 'bg-[#E3B341] text-[#0D1117]'
                        : 'bg-[#21262D] text-[#8B949E] hover:bg-[#30363D]'
                    }`}
                  >
                    {label}{warn ? <span className="text-[#D29922] ml-0.5">⚠️</span> : ''}
                  </button>
                ))}
              </div>

              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#8B949E', fontSize: 10 }}
                      tickFormatter={(v: string) => v?.slice(11, 16) ?? v?.slice(5, 10) ?? ''}
                    />
                    <YAxis
                      tick={{ fill: '#8B949E', fontSize: 10 }}
                      tickFormatter={(v: number) => `$${v.toFixed(0)}`}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip
                      contentStyle={{ background: '#161B22', border: '1px solid #30363D', borderRadius: 8 }}
                      labelStyle={{ color: '#8B949E', fontSize: 11 }}
                      itemStyle={{ color: '#E3B341' }}
                      formatter={(v) => [`$${fmt(Number(v))}`, 'Close']}
                    />
                    <Line
                      type="monotone"
                      dataKey="close"
                      stroke="#E3B341"
                      dot={false}
                      strokeWidth={1.5}
                    />
                    {/* Reference lines for trade levels */}
                    {prediction && ts && (
                      <>
                        <ReferenceLine y={ts.entryPrice} stroke="#3FB950" strokeDasharray="4 4" label={{ value: 'Entry', fill: '#3FB950', fontSize: 10 }} />
                        <ReferenceLine y={ts.stopLoss} stroke="#F85149" strokeDasharray="4 4" label={{ value: 'SL', fill: '#F85149', fontSize: 10 }} />
                        <ReferenceLine y={ts.takeProfit1} stroke="#58A6FF" strokeDasharray="4 4" label={{ value: 'TP1', fill: '#58A6FF', fontSize: 10 }} />
                        <ReferenceLine y={ts.takeProfit2} stroke="#79C0FF" strokeDasharray="4 4" label={{ value: 'TP2', fill: '#79C0FF', fontSize: 10 }} />
                      </>
                    )}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-[#8B949E] text-sm">
                  チャートデータなし
                </div>
              )}
            </Card>

            {/* MTF Summary */}
            {prediction && (
              <Card>
                <p className="text-[#8B949E] text-xs mb-2 uppercase tracking-wide">マルチタイムフレーム シグナル</p>
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span>週足{directionEmoji('up')}</span>
                  <span>日足{directionEmoji(prediction.direction)}</span>
                  <span>4H{directionEmoji(prediction.mtfDirection)}</span>
                  <span>1H{directionEmoji(prediction.mtfDirection)}</span>
                  <span>30m⚪</span>
                  <span>5m{directionEmoji(prediction.direction)}</span>
                  <span className="ml-auto text-[#E3B341] font-semibold">
                    スコア: {mtfScore != null ? `+${mtfScore}/10` : '—'}
                  </span>
                </div>
              </Card>
            )}

            {/* Seasonality */}
            {prediction && (
              <Card>
                <p className="text-[#8B949E] text-xs mb-1 uppercase tracking-wide">季節性</p>
                <p className="text-sm text-[#E6EDF3]">
                  📅 6月: 歴史的に弱い月 (-0.3%) 注意が必要
                </p>
              </Card>
            )}

            {/* Institutional summary */}
            {prediction && (
              <Card>
                <p className="text-[#8B949E] text-xs mb-2 uppercase tracking-wide">機関投資家動向</p>
                <div className="space-y-1.5 text-sm">
                  <p>🏦 {prediction.cotSummary || 'COT: データ取得中'}</p>
                  <p>📦 OB: 買いゾーン検出中</p>
                  <p>🎯 流動性: 等安値付近 (ストップ狩り注意)</p>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ── LAYER 3 Accordion ─────────────────────────────────────────────── */}
        {showDetail && prediction && (
          <div className="space-y-2 mb-4">

            {/* 1. テクニカル指標 */}
            <AccordionSection
              title="📊 テクニカル指標"
              name="technical"
              expanded={expandedSections.has('technical')}
              onToggle={toggleSection}
            >
              <div className="text-xs text-[#8B949E]">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <span>RSI7: <span className="text-[#E6EDF3]">—</span></span>
                  <span>RSI14: <span className="text-[#E6EDF3]">—</span></span>
                  <span>Stoch K: <span className="text-[#E6EDF3]">—</span></span>
                  <span>Stoch D: <span className="text-[#E6EDF3]">—</span></span>
                  <span>Williams %R: <span className="text-[#E6EDF3]">—</span></span>
                  <span>CCI20: <span className="text-[#E6EDF3]">—</span></span>
                  <span>ROC10: <span className="text-[#E6EDF3]">—</span></span>
                  <span>ATR14: <span className="text-[#E6EDF3]">—</span></span>
                  <span>ADX14: <span className="text-[#E6EDF3]">—</span></span>
                  <span>MACD Line: <span className="text-[#E6EDF3]">—</span></span>
                  <span>MACD Sig: <span className="text-[#E6EDF3]">—</span></span>
                  <span>MACD Hist: <span className="text-[#E6EDF3]">—</span></span>
                </div>
                <div className="border-t border-[#30363D] mt-2 pt-2 space-y-1">
                  <p>Parabolic SAR: <span className="text-[#E6EDF3]">—</span></p>
                  <p>一目均衡表: 転換線 — | 基準線 — | 雲 {prediction.technicalSummary.includes('above') ? '上' : '—'}</p>
                  <p>BB: 上 — | 中 — | 下 —</p>
                  <p className="text-[#3FB950]">強気シグナル: — / 弱気シグナル: —</p>
                </div>
              </div>
            </AccordionSection>

            {/* 2. マーケット構造 */}
            <AccordionSection
              title="🏗 マーケット構造"
              name="structure"
              expanded={expandedSections.has('structure')}
              onToggle={toggleSection}
            >
              <div className="text-sm space-y-1.5">
                <p className="text-[#8B949E]">トレンド: <span className="text-[#E6EDF3]">{prediction.direction === 'up' ? '上昇トレンド (HH/HL)' : prediction.direction === 'down' ? '下降トレンド (LH/LL)' : 'レンジ'}</span></p>
                <p className="text-[#8B949E]">CHoCH: <span className={prediction.tradeSetup.signal !== 'WAIT' ? 'text-[#3FB950]' : 'text-[#8B949E]'}>—</span></p>
                <p className="text-[#8B949E]">BOS: <span className="text-[#E6EDF3]">—</span></p>
                <p className="text-[#8B949E] text-xs mt-2">{prediction.technicalSummary}</p>
              </div>
            </AccordionSection>

            {/* 3. フィボナッチ + ピボット */}
            <AccordionSection
              title="📐 フィボナッチ + ピボット"
              name="fib"
              expanded={expandedSections.has('fib')}
              onToggle={toggleSection}
            >
              <div className="text-xs space-y-1 text-[#8B949E]">
                <div className="grid grid-cols-3 gap-1 font-medium text-[#E6EDF3] mb-1">
                  <span>レベル</span><span>価格</span><span>付近?</span>
                </div>
                {[0.236, 0.382, 0.5, 0.618, 0.786].map((r) => (
                  <div key={r} className="grid grid-cols-3 gap-1">
                    <span>{(r * 100).toFixed(1)}%</span>
                    <span>—</span>
                    <span>—</span>
                  </div>
                ))}
                <div className="border-t border-[#30363D] mt-2 pt-2">
                  <p className="text-[#E6EDF3] font-medium mb-1">ピボットポイント</p>
                  <div className="grid grid-cols-2 gap-1">
                    <span>PP: —</span><span>R1: —</span>
                    <span>S1: —</span><span>R2: —</span>
                    <span>S2: —</span><span>R3: —</span>
                  </div>
                </div>
              </div>
            </AccordionSection>

            {/* 4. 大口動向（ICT） */}
            <AccordionSection
              title="🏦 大口動向（ICT）"
              name="ict"
              expanded={expandedSections.has('ict')}
              onToggle={toggleSection}
            >
              <div className="text-sm space-y-2">
                <div>
                  <p className="text-[#8B949E] text-xs mb-1">オーダーブロック</p>
                  <p className="text-[#E6EDF3] text-xs">— データ取得中 —</p>
                </div>
                <div>
                  <p className="text-[#8B949E] text-xs mb-1">フェアバリューギャップ (FVG)</p>
                  <p className="text-[#E6EDF3] text-xs">— データ取得中 —</p>
                </div>
                <div>
                  <p className="text-[#8B949E] text-xs mb-1">流動性ゾーン</p>
                  <p className="text-[#E6EDF3] text-xs">{prediction.fundamentalSummary}</p>
                </div>
              </div>
            </AccordionSection>

            {/* 5. 経済指標 */}
            <AccordionSection
              title="🌐 経済指標"
              name="economic"
              expanded={expandedSections.has('economic')}
              onToggle={toggleSection}
            >
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#0D1117] rounded p-2">
                  <p className="text-[#8B949E]">米10年債利回り</p>
                  <p className="text-[#E6EDF3] font-medium">{econData?.treasuryYield10y ? `${fmt(econData.treasuryYield10y)}%` : '—'}</p>
                </div>
                <div className="bg-[#0D1117] rounded p-2">
                  <p className="text-[#8B949E]">CPI (前年比)</p>
                  <p className="text-[#E6EDF3] font-medium">{econData?.cpi ? `${fmt(econData.cpi)}%` : '—'}</p>
                </div>
                <div className="bg-[#0D1117] rounded p-2">
                  <p className="text-[#8B949E]">FF金利</p>
                  <p className="text-[#E6EDF3] font-medium">{econData?.federalFundsRate ? `${fmt(econData.federalFundsRate)}%` : '—'}</p>
                </div>
                <div className="bg-[#0D1117] rounded p-2">
                  <p className="text-[#8B949E]">実質金利</p>
                  <p className="text-[#E6EDF3] font-medium">{econData?.realInterestRate ? `${fmt(econData.realInterestRate)}%` : '—'}</p>
                </div>
                <div className="bg-[#0D1117] rounded p-2">
                  <p className="text-[#8B949E]">DXY (USDインデックス)</p>
                  <p className="text-[#E6EDF3] font-medium">{econData?.usdIndex ? fmt(econData.usdIndex) : '—'}</p>
                </div>
                <div className="bg-[#0D1117] rounded p-2">
                  <p className="text-[#8B949E]">GOLD/USD相関</p>
                  <p className="text-[#E6EDF3] font-medium">{econData?.goldUsdCorrelation ? fmt(econData.goldUsdCorrelation, 3) : '—'}</p>
                </div>
              </div>
            </AccordionSection>

            {/* 6. COT詳細 */}
            <AccordionSection
              title="📋 COT詳細"
              name="cot"
              expanded={expandedSections.has('cot')}
              onToggle={toggleSection}
            >
              <div className="text-xs space-y-2">
                <div className="grid grid-cols-4 gap-1 text-[#8B949E] font-medium">
                  <span></span><span>ロング</span><span>ショート</span><span>ネット</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  <span className="text-[#8B949E]">商業</span>
                  <span className="text-[#E6EDF3]">—</span>
                  <span className="text-[#E6EDF3]">—</span>
                  <span className="text-[#E6EDF3]">—</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  <span className="text-[#8B949E]">非商業</span>
                  <span className="text-[#E6EDF3]">—</span>
                  <span className="text-[#E6EDF3]">—</span>
                  <span className="text-[#E6EDF3]">—</span>
                </div>
                <div className="border-t border-[#30363D] pt-2 space-y-1 text-[#8B949E]">
                  <p>ネットポジション変化: <span className="text-[#E6EDF3]">—</span></p>
                  <p>パーセンタイル: <span className="text-[#E6EDF3]">—</span></p>
                  <p className="text-[#D29922]">{prediction.cotSummary}</p>
                </div>
              </div>
            </AccordionSection>

            {/* 7. ニュース */}
            <AccordionSection
              title="📰 ニュース"
              name="news"
              expanded={expandedSections.has('news')}
              onToggle={toggleSection}
            >
              <div className="space-y-2 text-sm">
                <p className="text-[#8B949E] text-xs">{prediction.sentimentSummary}</p>
                <p className="text-[#8B949E] text-xs">トップヘッドライン</p>
                <p className="text-[#E6EDF3] text-xs border border-[#30363D] rounded p-2">— ニュースデータ取得中 —</p>
              </div>
            </AccordionSection>

            {/* 8. イベントカレンダー */}
            <AccordionSection
              title="📅 イベントカレンダー"
              name="calendar"
              expanded={expandedSections.has('calendar')}
              onToggle={toggleSection}
            >
              <div className="space-y-2 text-sm">
                {prediction.nextEvent ? (
                  <div className={`p-2 rounded border text-xs ${prediction.nextEvent.isBlackout ? 'border-red-500/40 bg-red-900/20' : 'border-[#30363D]'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[#E6EDF3] font-medium">{prediction.nextEvent.name}</span>
                      {prediction.nextEvent.isBlackout && <span className="text-red-400 text-xs">🚫 禁止</span>}
                    </div>
                    <p className="text-[#8B949E]">{prediction.nextEvent.hoursUntil}時間後 | 影響: {prediction.nextEvent.impact}</p>
                  </div>
                ) : (
                  <p className="text-[#8B949E] text-xs">— イベントなし —</p>
                )}
                <p className="text-[#8B949E] text-xs">{prediction.calendarWarning}</p>
              </div>
            </AccordionSection>

            {/* 9. AI分析 */}
            <AccordionSection
              title="🤖 AI分析"
              name="ai"
              expanded={expandedSections.has('ai')}
              onToggle={toggleSection}
            >
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-[#8B949E] text-xs mb-1">短期見通し</p>
                  <p className="text-[#E6EDF3] text-xs leading-relaxed">{prediction.shortTermOutlook}</p>
                </div>
                <div>
                  <p className="text-[#8B949E] text-xs mb-1">中期見通し</p>
                  <p className="text-[#E6EDF3] text-xs leading-relaxed">{prediction.mediumTermOutlook}</p>
                </div>
                <div>
                  <p className="text-[#3FB950] text-xs mb-1">強気要因</p>
                  <ul className="space-y-0.5">
                    {prediction.keyBullishFactors.map((f, i) => (
                      <li key={i} className="text-[#E6EDF3] text-xs">• {f}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[#F85149] text-xs mb-1">弱気要因</p>
                  <ul className="space-y-0.5">
                    {prediction.keyBearishFactors.map((f, i) => (
                      <li key={i} className="text-[#E6EDF3] text-xs">• {f}</li>
                    ))}
                  </ul>
                </div>
                <div className="border-t border-[#30363D] pt-2">
                  <p className="text-[#8B949E] text-xs mb-1">トレーリングSL戦略</p>
                  {ts && (
                    <div className="space-y-0.5 text-xs text-[#E6EDF3]">
                      <p>① {ts.trailingStopStrategy.step1}</p>
                      <p>② {ts.trailingStopStrategy.step2}</p>
                      <p>③ {ts.trailingStopStrategy.step3}</p>
                    </div>
                  )}
                </div>
                <p className="text-[#D29922] text-xs border border-[#D29922]/30 rounded p-2">{prediction.riskNote}</p>
              </div>
            </AccordionSection>

            {/* 10. 予測精度 */}
            <AccordionSection
              title="📈 予測精度"
              name="accuracy"
              expanded={expandedSections.has('accuracy')}
              onToggle={toggleSection}
            >
              <div className="text-sm space-y-2">
                {accuracy ? (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-[#0D1117] rounded p-2">
                      <p className="text-[#8B949E]">総予測数</p>
                      <p className="text-[#E6EDF3] font-bold text-base">{accuracy.total}</p>
                    </div>
                    <div className="bg-[#0D1117] rounded p-2">
                      <p className="text-[#8B949E]">TP1到達率</p>
                      <p className="text-[#3FB950] font-bold text-base">{(accuracy.tp1HitRate * 100).toFixed(0)}%</p>
                    </div>
                    <div className="bg-[#0D1117] rounded p-2">
                      <p className="text-[#8B949E]">TP2到達率</p>
                      <p className="text-[#58A6FF] font-bold text-base">{(accuracy.tp2HitRate * 100).toFixed(0)}%</p>
                    </div>
                    <div className="bg-[#0D1117] rounded p-2">
                      <p className="text-[#8B949E]">SL到達率</p>
                      <p className="text-[#F85149] font-bold text-base">{(accuracy.slHitRate * 100).toFixed(0)}%</p>
                    </div>
                    <div className="bg-[#0D1117] rounded p-2 col-span-2">
                      <p className="text-[#8B949E]">ペンディング</p>
                      <p className="text-[#D29922] font-bold text-base">{accuracy.pendingCount}件</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[#8B949E] text-xs">予測履歴がまだありません。最初の予測を実行してください。</p>
                )}
                {predictions.length > 0 && (
                  <div className="border-t border-[#30363D] pt-2">
                    <p className="text-[#8B949E] text-xs mb-1">最近の予測履歴</p>
                    <div className="space-y-1">
                      {predictions.slice(0, 5).map((p) => (
                        <div key={p.id} className="flex items-center justify-between text-xs bg-[#0D1117] rounded px-2 py-1">
                          <span className={signalColor(p.signal)}>{signalEmoji(p.signal)} {p.signal}</span>
                          <span className="text-[#8B949E]">${fmt(p.entryPrice)}</span>
                          <span className={
                            p.outcome === 'TP1_HIT' || p.outcome === 'TP2_HIT' ? 'text-[#3FB950]' :
                            p.outcome === 'SL_HIT' ? 'text-[#F85149]' :
                            'text-[#8B949E]'
                          }>
                            {p.outcome === 'TP1_HIT' ? 'TP1✓' :
                             p.outcome === 'TP2_HIT' ? 'TP2✓' :
                             p.outcome === 'SL_HIT' ? 'SL✗' :
                             'PENDING'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AccordionSection>

          </div>
        )}

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <div className="mt-6 space-y-4">
          <p className="text-center text-[#8B949E] text-xs leading-relaxed">
            ⚠️ 本アプリは情報提供のみです。投資判断は自己責任で行ってください。
          </p>

          {/* Notification settings */}
          <Card>
            <p className="text-[#8B949E] text-xs mb-3 uppercase tracking-wide">通知設定</p>
            <div className="flex items-center gap-4 flex-wrap text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationEnabled}
                  onChange={() => notificationEnabled ? setNotificationEnabled(false) : enableNotifications()}
                  className="rounded"
                />
                <span className="text-[#E6EDF3]">ブラウザ通知 ON</span>
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-[#8B949E]">しきい値:</span>
                <input
                  type="number"
                  value={notificationThreshold}
                  onChange={(e) => setNotificationThreshold(Number(e.target.value))}
                  className="w-12 bg-[#0D1117] border border-[#30363D] rounded px-1 py-0.5 text-[#E6EDF3] text-center text-xs"
                  min={50}
                  max={100}
                />
                <span className="text-[#8B949E]">%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#8B949E]">間隔:</span>
                <select
                  value={autoCheckInterval}
                  onChange={(e) => setAutoCheckInterval(Number(e.target.value) as 30 | 60 | 0)}
                  className="bg-[#0D1117] border border-[#30363D] rounded px-1 py-0.5 text-[#E6EDF3] text-xs"
                >
                  <option value={30}>30分</option>
                  <option value={60}>60分</option>
                  <option value={0}>OFF</option>
                </select>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ── Bottom Action Bar (sticky) ─────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0D1117]/95 backdrop-blur border-t border-[#30363D]">
        <div className="mx-auto max-w-lg px-4 py-3 flex gap-3">
          <button
            onClick={runPrediction}
            disabled={loading}
            className="flex-1 py-3 bg-[#E3B341] text-[#0D1117] font-bold rounded-xl hover:bg-[#D29922] transition-colors disabled:opacity-60 text-sm flex items-center justify-center gap-2"
          >
            {loading ? <><span className="animate-spin">⏳</span> 分析中...</> : '🔄 今すぐ確認'}
          </button>
          <button
            onClick={() => setShowDetail((v) => !v)}
            className={`flex-1 py-3 font-bold rounded-xl transition-colors text-sm border ${
              showDetail
                ? 'bg-[#21262D] border-[#58A6FF] text-[#58A6FF]'
                : 'bg-[#21262D] border-[#30363D] text-[#E6EDF3]'
            }`}
          >
            📊 詳細 {showDetail ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* ── MT5 Modal ─────────────────────────────────────────────────────── */}
      {showMT5Modal && prediction && ts && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70"
          onClick={() => setShowMT5Modal(false)}
        >
          <div
            className="bg-[#161B22] border border-[#30363D] rounded-t-2xl p-6 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[#E6EDF3] font-bold text-base mb-4">MT5手動入力ガイド</h3>
            <div className="space-y-2 text-sm mb-4">
              <p className="text-[#E6EDF3]">① MT5でGOLD（XAU/USD）を開く</p>
              <p className="text-[#E6EDF3]">② 新規注文 → <span className={signalColor(ts.signal)}>{ts.signal === 'LONG' ? 'BUY（買い）' : ts.signal === 'SHORT' ? 'SELL（売り）' : '待機'}</span>を選択</p>
              <p className="text-[#E6EDF3]">③ SL: <span className="text-[#F85149] font-bold">{fmt(ts.stopLoss)}</span> を入力</p>
              <p className="text-[#E6EDF3]">④ TP: <span className="text-[#3FB950] font-bold">{fmt(ts.takeProfit1)}</span> を入力</p>
              <p className="text-[#E6EDF3]">⑤ 発注する</p>
            </div>

            {mt5CopyText && (
              <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-3 mb-4 text-xs font-mono text-[#E3B341] break-all">
                {mt5CopyText}
              </div>
            )}

            <button
              onClick={() => setShowMT5Modal(false)}
              className="w-full py-3 bg-[#21262D] border border-[#30363D] rounded-xl text-[#E6EDF3] font-medium hover:bg-[#30363D] transition-colors"
            >
              ✕ 閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
