const Nav = () => (
  <nav className="border-b border-[#30363D] px-4 py-3 flex items-center gap-4">
    <a href="/dashboard" className="text-[#E3B341] font-bold">🪙 GOLD AI</a>
    <div className="flex-1" />
    <a href="/dashboard" className="text-sm text-[#8B949E] hover:text-[#E6EDF3]">ダッシュボード</a>
    <a href="/history" className="text-sm text-[#8B949E] hover:text-[#E6EDF3]">予測履歴</a>
    <a href="/pricing" className="text-sm text-[#8B949E] hover:text-[#E6EDF3]">料金</a>
  </nav>
);

const items = [
  {
    icon: '⚠️',
    title: '本サービスは投資助言サービスではありません',
    highlight: true,
    content: `GOLD AIは、AIによるテクニカル分析情報を提供する情報ツールです。金融商品取引法第2条第8項に定める投資助言業（投資判断の助言）には該当せず、当社は投資助言業の登録を行っておりません。本サービスが提供するシグナル・分析結果は、特定の金融商品の売買を推奨・勧誘するものではありません。`,
  },
  {
    icon: '📊',
    title: 'AIテクニカル分析情報提供ツールとしての位置づけ',
    highlight: false,
    content: `本サービスは、テクニカル指標・市場構造・COTデータ・経済指標等を自動的に分析し、その結果を情報として提供します。これらの情報はトレーダーが相場を理解する一助となることを目的としており、最終的な取引判断はすべて利用者ご自身が行うものです。AIの分析はあくまでも過去データに基づくパターン認識であり、将来の相場を確定的に予測するものではありません。`,
  },
  {
    icon: '📉',
    title: '過去の成績は将来の結果を保証しません',
    highlight: false,
    content: `本サービスの予測履歴ページで公開している実績（TP達成率・SL率・平均RR等）は、過去の特定期間における分析結果であり、将来の成果を保証・示唆するものではありません。金融市場は常に変化しており、AIモデルが高い精度を示した期間であっても、市場環境の変化により同等の精度が継続するとは限りません。`,
  },
  {
    icon: '💸',
    title: '損失の可能性と自己責任の原則',
    highlight: false,
    content: `GOLD（XAU/USD）をはじめとする金融商品の取引には、元本を上回る損失が生じる可能性があります。本サービスの情報を参考にした取引により生じた損失・損害について、当社は一切の責任を負いません。投資は必ずご自身の財務状況・リスク許容度・投資目的を十分に理解した上で、自己の判断と責任において行ってください。余剰資金の範囲内でのご利用を強くお勧めします。`,
  },
  {
    icon: '⚖️',
    title: '金融商品取引法上の位置づけ',
    highlight: false,
    content: `本サービスは、金融商品取引法第2条第8項各号に定める金融商品取引業（投資助言・代理業、投資運用業、第一種・第二種金融商品取引業）のいずれにも該当しないと解釈しています。本サービスはあくまでも情報提供サービスであり、個別の投資判断に関する助言は提供しておりません。海外の規制については各国の法令をご確認ください。`,
  },
  {
    icon: '🌐',
    title: '市場リスクに関する注意',
    highlight: false,
    content: `・為替リスク: XAU/USDはドル建てであり、円換算での損益はドル円相場にも影響されます
・流動性リスク: 相場の急変時や市場閉鎖時（週末等）には取引が成立しない場合があります
・スプレッドリスク: ブローカーのスプレッドや手数料が実際の収益に影響します
・レバレッジリスク: 証拠金取引ではレバレッジにより損失が拡大する可能性があります`,
  },
];

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3]">
      <Nav />

      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-2">免責事項</h1>
        <p className="text-sm text-[#8B949E] mb-8">最終更新: 2026年6月1日</p>

        <div className="space-y-5">
          {items.map(({ icon, title, highlight, content }) => (
            <section
              key={title}
              className={`rounded-xl p-5 border ${
                highlight
                  ? 'bg-[#F85149]/10 border-[#F85149]/40'
                  : 'bg-[#161B22] border-[#30363D]'
              }`}
            >
              <h2 className={`text-base font-bold mb-3 flex items-start gap-2 ${highlight ? 'text-[#F85149]' : 'text-[#E3B341]'}`}>
                <span>{icon}</span>
                <span>{title}</span>
              </h2>
              <p className="text-sm text-[#8B949E] leading-relaxed whitespace-pre-line">{content}</p>
            </section>
          ))}
        </div>

        <div className="mt-10 bg-[#161B22] border border-[#30363D] rounded-xl p-5 text-center">
          <p className="text-sm text-[#8B949E] leading-relaxed">
            本サービスをご利用になる前に、上記の免責事項を十分にご理解ください。ご不明な点は
            <a href="mailto:support@gold-ai.example.com" className="text-[#58A6FF] hover:underline mx-1">
              サポート窓口
            </a>
            までお問い合わせください。
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-4 text-xs text-[#8B949E]">
          <a href="/terms" className="text-[#58A6FF] hover:underline">利用規約</a>
          <a href="/privacy" className="text-[#58A6FF] hover:underline">プライバシーポリシー</a>
        </div>
      </main>
    </div>
  );
}
