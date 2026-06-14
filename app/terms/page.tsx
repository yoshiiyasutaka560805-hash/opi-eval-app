const Nav = () => (
  <nav className="border-b border-[#30363D] px-4 py-3 flex items-center gap-4">
    <a href="/dashboard" className="text-[#E3B341] font-bold">🪙 GOLD AI</a>
    <div className="flex-1" />
    <a href="/dashboard" className="text-sm text-[#8B949E] hover:text-[#E6EDF3]">ダッシュボード</a>
    <a href="/history" className="text-sm text-[#8B949E] hover:text-[#E6EDF3]">予測履歴</a>
    <a href="/pricing" className="text-sm text-[#8B949E] hover:text-[#E6EDF3]">料金</a>
  </nav>
);

const articles = [
  {
    title: '第1条（利用目的）',
    content: `本サービス「GOLD AI」（以下「本サービス」）は、AIを用いたGOLD（XAU/USD）のテクニカル分析情報を提供することを目的とします。本サービスは金融商品取引法に基づく投資助言業者ではなく、本サービスが提供する情報は投資助言・売買推奨には該当しません。利用者は本サービスを情報収集の一手段として利用するものとし、投資の最終判断は自己の責任において行うものとします。`,
  },
  {
    title: '第2条（禁止事項）',
    content: `利用者は本サービスの利用にあたり、以下の行為を行ってはなりません。
・法令または公序良俗に違反する行為
・本サービスのシステムに過度な負荷をかける行為（APIの不正な大量アクセス等）
・本サービスが提供する情報を無断で第三者へ転売・再配布する行為
・他の利用者または第三者に対する誹謗中傷、脅迫その他有害な行為
・本サービスの運営を妨害する行為
・本サービスのコンテンツを商業目的で複製・改変・頒布する行為
・その他、当社が不適切と判断する行為`,
  },
  {
    title: '第3条（免責事項）',
    content: `当社は、本サービスにより提供する情報の完全性、正確性、有用性、適時性について保証しません。本サービスの情報に基づいて利用者が行った投資判断および取引の結果について、当社は一切の責任を負いません。システム障害・メンテナンス・天災等に起因するサービス停止による損害についても、当社は免責されるものとします。`,
  },
  {
    title: '第4条（サービス変更・終了）',
    content: `当社は、事前の通知なく本サービスの内容を変更し、または本サービスを終了することができます。サービスの変更・終了により利用者に生じた損害について、当社は一切の責任を負いません。Premiumプランのサービス終了にあたっては、原則として30日前に利用者へ通知するよう努めます。`,
  },
  {
    title: '第5条（著作権）',
    content: `本サービス上のコンテンツ（テキスト、UI、アルゴリズム等）の著作権は当社に帰属します。利用者は、当社の事前の書面による承諾なく、本サービスのコンテンツを複製・転載・改変・配布することはできません。利用者が本サービスに投稿・送信したデータについては、当社はサービス改善のために利用できるものとします。`,
  },
  {
    title: '第6条（準拠法）',
    content: `本規約の解釈および適用は、日本法に準拠するものとします。本サービスに関する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3]">
      <Nav />

      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-2">利用規約</h1>
        <p className="text-sm text-[#8B949E] mb-8">最終更新: 2026年6月1日</p>

        <p className="text-sm text-[#8B949E] mb-8 leading-relaxed">
          本利用規約（以下「本規約」）は、GOLD AI（以下「当社」）が提供するGOLD AI予測サービス（以下「本サービス」）の利用条件を定めるものです。本サービスを利用することで、本規約に同意したものとみなします。
        </p>

        <div className="space-y-8">
          {articles.map(({ title, content }) => (
            <section key={title}>
              <h2 className="text-base font-bold text-[#E3B341] mb-3">{title}</h2>
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5">
                <p className="text-sm text-[#8B949E] leading-relaxed whitespace-pre-line">{content}</p>
              </div>
            </section>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-xs text-[#8B949E]">
          <a href="/privacy" className="text-[#58A6FF] hover:underline">プライバシーポリシー</a>
          <a href="/disclaimer" className="text-[#58A6FF] hover:underline">免責事項</a>
        </div>
      </main>
    </div>
  );
}
