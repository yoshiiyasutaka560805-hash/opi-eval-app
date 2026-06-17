import type { PredictionRecord } from '@/types';

const Nav = () => (
  <nav className="border-b border-[#30363D] px-4 py-3 flex items-center gap-4">
    <a href="/dashboard" className="text-[#E3B341] font-bold">🪙 GOLD AI</a>
    <div className="flex-1" />
    <a href="/dashboard" className="text-sm text-[#8B949E] hover:text-[#E6EDF3]">ダッシュボード</a>
    <a href="/history" className="text-sm text-[#8B949E] hover:text-[#E6EDF3]">予測履歴</a>
    <a href="/pricing" className="text-sm text-[#8B949E] hover:text-[#E6EDF3]">料金</a>
  </nav>
);

type DemoRow = PredictionRecord & { timeframe: string };

const demoRows: DemoRow[] = [
  {
    id: '1',
    signal: 'LONG',
    confidence: 82,
    priceAtPrediction: 3318.40,
    entryPrice: 3315.00,
    stopLoss: 3298.00,
    takeProfit1: 3340.00,
    takeProfit2: 3362.00,
    outcome: 'TP1_HIT',
    exitPrice: 3340.00,
    createdAt: '2026-06-10T04:00:00Z',
    resolvedAt: '2026-06-10T09:30:00Z',
    timeframe: '4H',
  },
  {
    id: '2',
    signal: 'SHORT',
    confidence: 74,
    priceAtPrediction: 3356.20,
    entryPrice: 3358.00,
    stopLoss: 3372.00,
    takeProfit1: 3335.00,
    takeProfit2: 3312.00,
    outcome: 'TP2_HIT',
    exitPrice: 3312.00,
    createdAt: '2026-06-09T12:00:00Z',
    resolvedAt: '2026-06-10T01:15:00Z',
    timeframe: '日足',
  },
  {
    id: '3',
    signal: 'LONG',
    confidence: 68,
    priceAtPrediction: 3290.10,
    entryPrice: 3288.50,
    stopLoss: 3272.00,
    takeProfit1: 3312.00,
    takeProfit2: 3335.00,
    outcome: 'SL_HIT',
    exitPrice: 3272.00,
    createdAt: '2026-06-08T08:00:00Z',
    resolvedAt: '2026-06-08T16:45:00Z',
    timeframe: '4H',
  },
  {
    id: '4',
    signal: 'WAIT',
    confidence: 55,
    priceAtPrediction: 3305.60,
    entryPrice: 3305.60,
    stopLoss: 3290.00,
    takeProfit1: 3325.00,
    takeProfit2: 3345.00,
    outcome: 'EXPIRED',
    createdAt: '2026-06-07T20:00:00Z',
    resolvedAt: '2026-06-08T08:00:00Z',
    timeframe: '1H',
  },
  {
    id: '5',
    signal: 'LONG',
    confidence: 79,
    priceAtPrediction: 3275.80,
    entryPrice: 3273.00,
    stopLoss: 3258.00,
    takeProfit1: 3295.00,
    takeProfit2: 3315.00,
    outcome: 'TP1_HIT',
    exitPrice: 3295.00,
    createdAt: '2026-06-06T04:00:00Z',
    resolvedAt: '2026-06-06T14:20:00Z',
    timeframe: '4H',
  },
  {
    id: '6',
    signal: 'SHORT',
    confidence: 71,
    priceAtPrediction: 3310.00,
    entryPrice: 3312.00,
    stopLoss: 3328.00,
    takeProfit1: 3290.00,
    takeProfit2: 3268.00,
    outcome: 'TP1_HIT',
    exitPrice: 3290.00,
    createdAt: '2026-06-05T12:00:00Z',
    resolvedAt: '2026-06-06T02:30:00Z',
    timeframe: '日足',
  },
  {
    id: '7',
    signal: 'LONG',
    confidence: 85,
    priceAtPrediction: 3248.90,
    entryPrice: 3246.00,
    stopLoss: 3230.00,
    takeProfit1: 3268.00,
    takeProfit2: 3290.00,
    outcome: 'TP2_HIT',
    exitPrice: 3290.00,
    createdAt: '2026-06-04T04:00:00Z',
    resolvedAt: '2026-06-05T10:00:00Z',
    timeframe: '日足',
  },
  {
    id: '8',
    signal: 'SHORT',
    confidence: 62,
    priceAtPrediction: 3342.50,
    entryPrice: 3344.00,
    stopLoss: 3360.00,
    takeProfit1: 3322.00,
    takeProfit2: 3300.00,
    outcome: 'SL_HIT',
    exitPrice: 3360.00,
    createdAt: '2026-06-03T16:00:00Z',
    resolvedAt: '2026-06-04T03:10:00Z',
    timeframe: '4H',
  },
];

const outcomeLabel: Record<string, { label: string; color: string }> = {
  TP1_HIT: { label: 'TP1達成', color: '#3FB950' },
  TP2_HIT: { label: 'TP2達成', color: '#3FB950' },
  SL_HIT: { label: 'SL', color: '#F85149' },
  EXPIRED: { label: '期限切れ', color: '#8B949E' },
  PENDING: { label: '進行中', color: '#58A6FF' },
};

const signalColor = { LONG: '#3FB950', SHORT: '#F85149', WAIT: '#E3B341' };

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ja-JP', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3]">
      <Nav />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">予測履歴（公開）</h1>
        <p className="text-sm text-[#8B949E] mb-6">
          AIシグナルの実績を透明に公開しています。
        </p>

        {/* Stats banner */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl px-6 py-4 mb-6 flex flex-wrap gap-6">
          <div>
            <span className="text-xs text-[#8B949E] block mb-0.5">直近30日</span>
            <span className="text-sm font-medium">TP1達成率</span>
            <span className="text-[#3FB950] font-bold ml-2">71%</span>
          </div>
          <div className="border-l border-[#30363D] pl-6">
            <span className="text-sm font-medium">SL率</span>
            <span className="text-[#F85149] font-bold ml-2">29%</span>
          </div>
          <div className="border-l border-[#30363D] pl-6">
            <span className="text-sm font-medium">平均RR達成</span>
            <span className="text-[#E3B341] font-bold ml-2">1.28</span>
          </div>
          <div className="border-l border-[#30363D] pl-6">
            <span className="text-sm font-medium">合計シグナル</span>
            <span className="text-[#E6EDF3] font-bold ml-2">8</span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#30363D] text-[#8B949E]">
                  <th className="text-left px-4 py-3">日時</th>
                  <th className="px-4 py-3">足種</th>
                  <th className="px-4 py-3">シグナル</th>
                  <th className="px-4 py-3 text-right">Entry</th>
                  <th className="px-4 py-3 text-right">SL</th>
                  <th className="px-4 py-3 text-right">TP1</th>
                  <th className="px-4 py-3 text-right">TP2</th>
                  <th className="px-4 py-3 text-right">信頼度</th>
                  <th className="px-4 py-3 text-center">結果</th>
                </tr>
              </thead>
              <tbody>
                {demoRows.map((row) => {
                  const oc = outcomeLabel[row.outcome ?? 'PENDING'];
                  const sc = signalColor[row.signal];
                  return (
                    <tr key={row.id} className="border-b border-[#30363D] last:border-none hover:bg-[#0D1117]/50 transition">
                      <td className="px-4 py-3 text-[#8B949E] whitespace-nowrap">{formatDate(row.createdAt)}</td>
                      <td className="px-4 py-3 text-center text-[#8B949E]">{row.timeframe}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold" style={{ color: sc }}>{row.signal}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{row.entryPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-mono text-[#F85149]">{row.stopLoss.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-mono text-[#3FB950]">{row.takeProfit1.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-mono text-[#3FB950]">{row.takeProfit2.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-[#E3B341]">{row.confidence}%</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            color: oc.color,
                            backgroundColor: `${oc.color}20`,
                          }}
                        >
                          {oc.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-xs text-[#8B949E] mt-4 text-center">
          ※ 実際の履歴はアカウント登録後に記録されます。上記は表示サンプルです。
        </p>
      </main>
    </div>
  );
}
