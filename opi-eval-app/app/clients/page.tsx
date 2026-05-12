'use client';

import Link from 'next/link';

export default function ClientsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <Link href="/" className="text-blue-600 hover:text-blue-800 mb-6 inline-flex items-center gap-1">
          ← ホームに戻る
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">施設管理</h1>
          <p className="mt-2 text-gray-600">
            施設情報と採用ボーダーラインを一元管理します
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ このページについて</h3>
          <p className="text-blue-800">
            施設管理機能は現在開発中です。Supabaseの設定後、施設情報の登録・管理ができるようになります。
          </p>
        </div>

        {/* Coming Soon */}
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-4xl mb-4">🏢</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">施設管理機能（近日公開）</h3>
          <p className="text-gray-600 mb-6">
            このページでは、以下の機能が利用できるようになります：
          </p>
          <ul className="text-gray-700 space-y-2 mb-8 inline-block text-left">
            <li>✓ 施設情報の登録・編集</li>
            <li>✓ 採用ボーダーライン設定</li>
            <li>✓ 施設別の評価結果一覧</li>
            <li>✓ 受験者データの管理</li>
          </ul>
          <div>
            <p className="text-sm text-gray-500">
              まず<Link href="/evaluations/new" className="text-blue-600 hover:underline">新規評価を作成</Link>
              してみてください
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
