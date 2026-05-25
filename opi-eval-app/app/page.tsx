'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            外国人介護人材 採用支援AI評価アプリ
          </h1>
          <p className="mt-2 text-gray-600">特定技能・介護ビザ面接の日本語能力評価を自動化</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Key Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">このアプリについて</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-blue-600">
              <div className="text-3xl mb-2">🎤</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                面接文字起こし評価
              </h3>
              <p className="text-gray-600 text-sm">
                面接の会話を文字起こしするだけで、Claude AIが自動採点します
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-green-600">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                安全性を最優先
              </h3>
              <p className="text-gray-600 text-sm">
                流暢さより「指示理解」「報告精度」「安全意識」を重視した評価
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-purple-600">
              <div className="text-3xl mb-2">💼</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                採用の根拠を提供
              </h3>
              <p className="text-gray-600 text-sm">
                推奨アクション付きで、条件付き採用の次のステップまで提示
              </p>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">クイックスタート</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/interview-guide"
              className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition border-l-4 border-blue-600 cursor-pointer"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                📋 面接質問ガイド
              </h3>
              <p className="text-gray-600 mb-4">
                評価に必須の4つの質問と採点基準を確認できます。印刷対応。
              </p>
              <span className="inline-block text-blue-600 font-semibold">
                ガイドを見る →
              </span>
            </Link>

            <Link
              href="/evaluations/new"
              className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition border-l-4 border-green-600 cursor-pointer"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                ⚡ 新規評価を作成
              </h3>
              <p className="text-gray-600 mb-4">
                面接の文字起こしをアップロードして、AI採点を開始します
              </p>
              <span className="inline-block text-green-600 font-semibold">
                評価を開始 →
              </span>
            </Link>

            <Link
              href="/clients"
              className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition border-l-4 border-purple-600 cursor-pointer"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                🏢 施設管理
              </h3>
              <p className="text-gray-600 mb-4">
                採用ボーダーラインなど、施設毎の設定を管理します
              </p>
              <span className="inline-block text-purple-600 font-semibold">
                施設を管理 →
              </span>
            </Link>

            <Link
              href="/candidates"
              className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition border-l-4 border-orange-600 cursor-pointer"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                👥 受験者管理
              </h3>
              <p className="text-gray-600 mb-4">
                候補者の情報と、過去の評価履歴を一元管理します
              </p>
              <span className="inline-block text-orange-600 font-semibold">
                受験者を検索 →
              </span>
            </Link>
          </div>
        </section>

        {/* Key Information */}
        <section className="bg-blue-50 rounded-lg border border-blue-200 p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">⚠️ 重要な注意事項</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                <strong>AIの評価は補助ツール：</strong>
                採用決定の根拠ではなく、面接官の判断を支援するツールです。最終決定は人間が行ってください
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                <strong>必須質問：</strong>
                4つの推奨質問が面接に含まれていない場合、AI評価の信頼性が低下します
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                <strong>適性評価は参考値：</strong>
                介護の現場適性は、面接では完全に判定できません。試用期間での現場観察が必須です
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                <strong>言語能力評価の限界：</strong>
                文字起こしは音声情報（発音・流ちょうさ）を含みません。参考レベルです
              </span>
            </li>
          </ul>
        </section>

        {/* Technical Info */}
        <section className="bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">技術スタック</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Next.js 16', desc: 'フレームワーク' },
              { name: 'Claude AI', desc: 'AI採点エンジン' },
              { name: 'Supabase', desc: 'データベース' },
              { name: 'Tailwind CSS', desc: 'スタイリング' },
            ].map((tech, idx) => (
              <div key={idx} className="bg-white p-4 rounded border border-gray-200">
                <p className="font-semibold text-gray-900">{tech.name}</p>
                <p className="text-xs text-gray-600">{tech.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-400 text-sm">
            © 2026 Foreign Care Worker Hiring Support AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
