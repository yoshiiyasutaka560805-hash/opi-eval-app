'use client';

import Link from 'next/link';

export default function CandidatesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <Link href="/" className="text-blue-600 hover:text-blue-800 mb-6 inline-flex items-center gap-1">
          ← ホームに戻る
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">受験者管理</h1>
          <p className="mt-2 text-gray-600">
            受験者情報と過去の評価履歴を一元管理します
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ このページについて</h3>
          <p className="text-blue-800">
            受験者管理機能は現在開発中です。Supabaseの設定後、受験者情報の登録・評価履歴の表示ができるようになります。
          </p>
        </div>

        {/* Coming Soon */}
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">受験者管理機能（近日公開）</h3>
          <p className="text-gray-600 mb-6">
            このページでは、以下の機能が利用できるようになります：
          </p>
          <ul className="text-gray-700 space-y-2 mb-8 inline-block text-left">
            <li>✓ 受験者情報の登録・編集</li>
            <li>✓ 過去の評価結果一覧</li>
            <li>✓ 複数回受験時の成績推移グラフ</li>
            <li>✓ 候補者比較機能</li>
            <li>✓ 母語・経験による分析</li>
          </ul>
          <div>
            <p className="text-sm text-gray-500">
              まず<Link href="/evaluations/new" className="text-blue-600 hover:underline">新規評価を作成</Link>
              してみてください
            </p>
          </div>
        </div>

        {/* Roadmap */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-4">📅 実装ロードマップ</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-green-600 font-bold">✓</span>
              <div>
                <p className="font-semibold text-gray-900">Phase 1: 基本的な採点機能</p>
                <p className="text-sm text-gray-600">文字起こし入力 → AI採点 → 結果表示（完了）</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-yellow-600 font-bold">◐</span>
              <div>
                <p className="font-semibold text-gray-900">Phase 2: 比較・分析機能</p>
                <p className="text-sm text-gray-600">候補者比較、時系列グラフ（開発中）</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-gray-400 font-bold">○</span>
              <div>
                <p className="font-semibold text-gray-600">Phase 3: 音声AI解析</p>
                <p className="text-sm text-gray-500">Whisper/Azure Speech連携（将来）</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-gray-400 font-bold">○</span>
              <div>
                <p className="font-semibold text-gray-600">Phase 4: 実務シミュレーション</p>
                <p className="text-sm text-gray-500">ロールプレイAI（将来）</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
