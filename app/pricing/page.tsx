const Nav = () => (
  <nav className="border-b border-[#30363D] px-4 py-3 flex items-center gap-4">
    <a href="/dashboard" className="text-[#E3B341] font-bold">🪙 GOLD AI</a>
    <div className="flex-1" />
    <a href="/dashboard" className="text-sm text-[#8B949E] hover:text-[#E6EDF3]">ダッシュボード</a>
    <a href="/history" className="text-sm text-[#8B949E] hover:text-[#E6EDF3]">予測履歴</a>
    <a href="/pricing" className="text-sm text-[#8B949E] hover:text-[#E6EDF3]">料金</a>
  </nav>
);

const freeFeatures = [
  '1日3回まで分析実行',
  '日足・4H足のみ',
  '基本テクニカル（SMA/RSI/MACD）',
  '通知なし',
];

const premiumFeatures = [
  '無制限分析実行',
  '全6時間足（5分〜日足）',
  '全14+種テクニカル指標',
  '大口動向（ICT OB/FVG/流動性）',
  'COTレポート + 季節性',
  'ブラウザプッシュ通知',
  '予測精度追跡',
];

const faqs = [
  {
    q: 'GOLD AIは投資アドバイスを提供しますか？',
    a: 'いいえ。本サービスはAIテクニカル分析情報提供ツールです。投資助言・売買推奨ではありません。掲載される全ての情報は情報提供のみを目的としており、最終的な投資判断はご自身の責任において行ってください。',
  },
  {
    q: 'Premiumプランはいつでもキャンセルできますか？',
    a: 'はい。Premiumプランは月払いで、翌月以降の請求が発生する前であればいつでもキャンセル可能です。キャンセル後も当月末まではPremium機能をご利用いただけます。',
  },
  {
    q: '予測の精度はどの程度ですか？',
    a: '直近30日のTP1達成率は約71%、平均RR達成は1.28です。ただし過去の成績は将来の結果を保証するものではありません。市場環境により成績は変動します。詳細は予測履歴ページをご確認ください。',
  },
  {
    q: 'データはどこから取得していますか？',
    a: 'XAU/USD価格データは公開APIから取得しています。COTデータはCFTC（米商品先物取引委員会）の公開データを使用しています。経済指標は公開カレンダーを参照しています。',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3]">
      <Nav />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-2">料金プラン</h1>
        <p className="text-center text-[#8B949E] mb-12">シンプルな料金体系。いつでもアップグレード・ダウングレード可能。</p>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {/* Free */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 flex flex-col">
            <div className="mb-4">
              <h2 className="text-xl font-bold mb-1">Free</h2>
              <div className="text-3xl font-bold">
                無料
              </div>
              <p className="text-sm text-[#8B949E] mt-1">クレジットカード不要</p>
            </div>

            <ul className="space-y-3 flex-1 mb-6">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <span className="text-[#3FB950] mt-0.5">✓</span>
                  <span className="text-[#8B949E]">{f}</span>
                </li>
              ))}
            </ul>

            <a
              href="/signup"
              className="block text-center py-2.5 border border-[#30363D] rounded-lg text-sm font-semibold hover:border-[#58A6FF] hover:text-[#58A6FF] transition"
            >
              無料で始める
            </a>
          </div>

          {/* Premium */}
          <div className="bg-[#161B22] border-2 border-[#E3B341] rounded-2xl p-6 flex flex-col relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-[#E3B341] text-[#0D1117] text-xs font-bold px-3 py-1 rounded-full">
                おすすめ
              </span>
            </div>

            <div className="mb-4">
              <h2 className="text-xl font-bold mb-1 text-[#E3B341]">Premium</h2>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">¥2,980</span>
                <span className="text-[#8B949E]">/ 月</span>
              </div>
              <p className="text-sm text-[#8B949E] mt-1">税込・月払い</p>
            </div>

            <ul className="space-y-3 flex-1 mb-6">
              {premiumFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <span className="text-[#E3B341] mt-0.5">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <a
              href="/signup"
              className="block text-center py-2.5 bg-[#E3B341] text-[#0D1117] rounded-lg text-sm font-bold hover:opacity-90 transition"
            >
              今すぐ始める - Stripe
            </a>
          </div>
        </div>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold text-center mb-8">よくある質問</h2>
          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <div key={q} className="bg-[#161B22] border border-[#30363D] rounded-xl p-5">
                <h3 className="font-semibold mb-2">{q}</h3>
                <p className="text-sm text-[#8B949E] leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <p className="text-xs text-[#8B949E] text-center mt-12 leading-relaxed">
          本サービスはAIテクニカル分析情報提供ツールです。投資助言ではありません。
          過去の実績は将来の成果を保証するものではありません。
          <a href="/disclaimer" className="text-[#58A6FF] hover:underline ml-1">詳細はこちら</a>
        </p>
      </main>
    </div>
  );
}
