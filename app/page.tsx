import Link from 'next/link';

const Nav = () => (
  <nav className="border-b border-[#30363D] px-4 py-3 flex items-center gap-4">
    <a href="/dashboard" className="text-[#E3B341] font-bold">🪙 GOLD AI</a>
    <div className="flex-1" />
    <a href="/dashboard" className="text-sm text-[#8B949E] hover:text-[#E6EDF3]">ダッシュボード</a>
    <a href="/history" className="text-sm text-[#8B949E] hover:text-[#E6EDF3]">予測履歴</a>
    <a href="/pricing" className="text-sm text-[#8B949E] hover:text-[#E6EDF3]">料金</a>
  </nav>
);

const features = [
  { icon: '📊', title: '14種テクニカル指標', desc: 'SMA/EMA/MACD/RSI/一目均衡表など網羅' },
  { icon: '🏛️', title: '大口・機関投資家動向（ICT）', desc: 'オーダーブロック・FVG・流動性分析' },
  { icon: '📰', title: 'COT + 経済カレンダー', desc: 'CFTC建玉明細と重要指標スケジュール' },
  { icon: '⏱️', title: '6時間足マルチタイムフレーム', desc: '5分〜日足まで多角的に相場を分析' },
  { icon: '🎯', title: 'LONG/SHORT/WAITシグナル', desc: 'エントリー・SL・TP付きトレード設定' },
  { icon: '🔔', title: 'ブラウザ通知', desc: '閾値超えシグナルをリアルタイム通知' },
];

const plans = [
  {
    name: 'Free',
    price: '無料',
    features: ['1日3回まで分析実行', '日足・4H足のみ', '基本テクニカル（SMA/RSI/MACD）', '通知なし'],
    cta: '無料で始める',
    href: '/signup',
    highlight: false,
  },
  {
    name: 'Premium',
    price: '¥2,980 / 月',
    features: [
      '無制限分析実行',
      '全6時間足（5分〜日足）',
      '全14+種テクニカル指標',
      '大口動向（ICT OB/FVG/流動性）',
      'COTレポート + 季節性',
      'ブラウザプッシュ通知',
      '予測精度追跡',
    ],
    cta: '今すぐ始める',
    href: '/signup',
    highlight: true,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3]">
      <Nav />

      {/* Hero */}
      <section className="text-center py-20 px-4">
        <div className="inline-block text-5xl mb-4">🪙</div>
        <h1 className="text-4xl md:text-6xl font-bold text-[#E3B341] mb-4">GOLD AI予測</h1>
        <p className="text-lg md:text-xl text-[#8B949E] mb-8 max-w-xl mx-auto">
          AIがリアルタイムでGOLD相場を分析
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="px-8 py-3 bg-[#E3B341] text-[#0D1117] font-bold rounded-lg hover:opacity-90 transition"
          >
            無料で始める
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-3 border border-[#30363D] text-[#E6EDF3] font-bold rounded-lg hover:border-[#58A6FF] transition"
          >
            ダッシュボードへ
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold text-center mb-10">主な機能</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="bg-[#161B22] border border-[#30363D] rounded-xl p-5">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-[#E3B341] mb-1">{f.title}</h3>
              <p className="text-sm text-[#8B949E]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Plan comparison */}
      <section className="max-w-3xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold text-center mb-10">プラン比較</h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-[#30363D] rounded-xl overflow-hidden text-sm">
            <thead>
              <tr className="bg-[#161B22]">
                <th className="text-left px-4 py-3 border-b border-[#30363D]">機能</th>
                <th className="px-4 py-3 border-b border-[#30363D] text-[#8B949E]">Free</th>
                <th className="px-4 py-3 border-b border-[#30363D] text-[#E3B341]">Premium ¥2,980/月</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['分析実行回数', '1日3回', '無制限'],
                ['時間足', '日足・4H足のみ', '全6時間足'],
                ['テクニカル指標', 'SMA/RSI/MACD', '全14+種'],
                ['ICT大口動向', '✗', '✓'],
                ['COT + 季節性', '✗', '✓'],
                ['ブラウザ通知', '✗', '✓'],
                ['予測精度追跡', '✗', '✓'],
              ].map(([feat, free, premium]) => (
                <tr key={feat} className="border-b border-[#30363D] last:border-none">
                  <td className="px-4 py-3 text-[#8B949E]">{feat}</td>
                  <td className="px-4 py-3 text-center">{free}</td>
                  <td className="px-4 py-3 text-center text-[#3FB950]">{premium}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Trust section */}
      <section className="max-w-2xl mx-auto px-4 pb-20 text-center">
        <h2 className="text-2xl font-bold mb-4">予測精度の透明な公開</h2>
        <p className="text-[#8B949E] leading-relaxed">
          過去の予測結果（シグナル・Entry・SL・TP達成状況）を誰でも閲覧できる
          <a href="/history" className="text-[#58A6FF] hover:underline ml-1">予測履歴ページ</a>
          で公開しています。TP1達成率・SL率・平均RRを透明に開示し、サービスの信頼性を担保します。
        </p>
      </section>

      {/* Disclaimer */}
      <footer className="border-t border-[#30363D] px-4 py-8 text-center text-xs text-[#8B949E]">
        <p className="max-w-2xl mx-auto mb-4">
          本サービスはAIテクニカル分析情報提供ツールです。投資助言ではありません。
          掲載内容は情報提供のみを目的としており、売買の推奨ではありません。
          投資に関する最終判断はご自身の責任において行ってください。
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href="/terms" className="hover:text-[#E6EDF3]">利用規約</a>
          <a href="/privacy" className="hover:text-[#E6EDF3]">プライバシーポリシー</a>
          <a href="/disclaimer" className="hover:text-[#E6EDF3]">免責事項</a>
          <a href="/pricing" className="hover:text-[#E6EDF3]">料金</a>
        </div>
      </footer>
    </div>
  );
}
