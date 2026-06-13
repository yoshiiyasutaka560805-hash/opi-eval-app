const Nav = () => (
  <nav className="border-b border-[#30363D] px-4 py-3 flex items-center gap-4">
    <a href="/dashboard" className="text-[#E3B341] font-bold">🪙 GOLD AI</a>
    <div className="flex-1" />
    <a href="/dashboard" className="text-sm text-[#8B949E] hover:text-[#E6EDF3]">ダッシュボード</a>
    <a href="/history" className="text-sm text-[#8B949E] hover:text-[#E6EDF3]">予測履歴</a>
    <a href="/pricing" className="text-sm text-[#8B949E] hover:text-[#E6EDF3]">料金</a>
  </nav>
);

const sections = [
  {
    title: '収集する情報',
    content: `当社は以下の情報を収集します。

【アカウント情報】
・メールアドレス（登録時）
・パスワード（ハッシュ化して保存）

【利用情報】
・分析リクエストの履歴（実行日時・使用した時間足・シグナル結果）
・API使用量（1日あたりのリクエスト数）
・通知設定・表示設定（ローカルストレージ）

【技術的情報】
・IPアドレス（セキュリティ目的）
・ブラウザの種類・OSバージョン（障害調査目的）
・Cookieおよびセッション情報`,
  },
  {
    title: '利用目的',
    content: `収集した情報は以下の目的で利用します。

・本サービスの提供および改善
・ユーザー認証およびアカウント管理
・API使用量の管理とプラン制限の適用
・Premiumプランの決済処理（Stripe）
・不正アクセスの検知とセキュリティ確保
・サービスに関する重要なお知らせの送信
・予測精度の集計・公開（個人を特定しない形で）`,
  },
  {
    title: '第三者提供',
    content: `当社は、以下の場合を除き、収集した個人情報を第三者に提供しません。

・利用者本人の同意がある場合
・法令に基づく場合（裁判所・行政機関からの開示要請等）
・人の生命・身体・財産を保護するために必要な場合

【利用する外部サービス】
・Supabase（認証・データベース）：認証情報・分析履歴
・Stripe（決済）：Premiumプランの決済処理
・Google Analytics（アクセス解析）：匿名化されたアクセスデータ

これらのサービスは各社のプライバシーポリシーに従って情報を管理します。`,
  },
  {
    title: 'Cookieの使用',
    content: `本サービスはCookieおよび類似技術を以下の目的で使用します。

・セッション管理（ログイン状態の維持）
・設定の保存（表示設定・通知設定をlocalStorageに保存）
・アクセス解析（Google Analyticsによる匿名の利用状況分析）

ブラウザの設定でCookieを無効にすることができますが、一部機能が正常に動作しない場合があります。`,
  },
  {
    title: 'データの保管と削除',
    content: `・アカウント情報はアカウント削除時に抹消します
・分析履歴は最大12ヶ月間保管し、その後自動的に削除します
・ログデータは最大90日間保管します
・アカウント削除のご希望はお問い合わせよりご連絡ください`,
  },
  {
    title: 'お問い合わせ',
    content: `個人情報の取り扱いに関するご質問・ご要望は以下までお問い合わせください。

GOLD AI 個人情報相談窓口
メール: privacy@gold-ai.example.com

個人情報の開示・訂正・利用停止のご請求については、本人確認のうえ、合理的な期間内に対応いたします。`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3]">
      <Nav />

      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-2">プライバシーポリシー</h1>
        <p className="text-sm text-[#8B949E] mb-8">最終更新: 2026年6月1日</p>

        <p className="text-sm text-[#8B949E] mb-8 leading-relaxed">
          GOLD AI（以下「当社」）は、利用者の個人情報の保護を重要な責務と認識し、個人情報の保護に関する法律（個人情報保護法）を遵守します。本プライバシーポリシーは、当社が提供するGOLD AI予測サービスにおける個人情報の取り扱いについて定めます。
        </p>

        <div className="space-y-8">
          {sections.map(({ title, content }) => (
            <section key={title}>
              <h2 className="text-base font-bold text-[#E3B341] mb-3">{title}</h2>
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5">
                <p className="text-sm text-[#8B949E] leading-relaxed whitespace-pre-line">{content}</p>
              </div>
            </section>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-xs text-[#8B949E]">
          <a href="/terms" className="text-[#58A6FF] hover:underline">利用規約</a>
          <a href="/disclaimer" className="text-[#58A6FF] hover:underline">免責事項</a>
        </div>
      </main>
    </div>
  );
}
