'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function NewEvaluationPage() {
  const [transcription, setTranscription] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [clientName, setClientName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!transcription.trim()) {
      setError('文字起こしを入力してください');
      return;
    }

    if (!candidateName.trim()) {
      setError('受験者名を入力してください');
      return;
    }

    if (!clientName.trim()) {
      setError('施設名を入力してください');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcription,
          candidateName,
          clientName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '評価に失敗しました');
      }

      const data = await response.json();
      window.location.href = `/evaluations/${data.evaluationId}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center gap-1">
            ← ホームに戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">新規評価を作成</h1>
          <p className="mt-2 text-gray-600">
            面接の文字起こしをアップロードして、AI採点を開始します
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-2">📋 事前確認</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ 以下の4つの質問が面接に含まれていますか？</li>
            <li className="ml-4">1. 指示理解力（食事介助シナリオ）</li>
            <li className="ml-4">2. 情報整理・報告精度（転倒報告）</li>
            <li className="ml-4">3. 緊急対応能力（急変対応）</li>
            <li className="ml-4">4. 確認行動・報連相（わからないことがあったら）</li>
            <li className="mt-2">
              <Link href="/interview-guide" className="text-blue-600 hover:underline font-semibold">
                → 面接質問ガイドを確認する
              </Link>
            </li>
          </ul>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}

          {/* Candidate Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                受験者名 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="例: 田中太郎"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                施設名 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="例: 〇〇高齢者施設"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Transcription */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              面接文字起こし <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">
              面接の会話をテキストで入力してください。話者ラベル（「面接官：」「受験者：」など）を含めると、より正確な評価ができます。
            </p>
            <textarea
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              placeholder={`例：
面接官：利用者の食事介助で、看護師から「ゆっくり・一口ずつ・むせたらすぐ止める」と言われたら、どう動きますか？
受験者：はい、わかりました。ゆっくり、一口ずつ...`}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              rows={15}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-2">
              {transcription.length} 文字
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  AI採点中...（30〜60秒）
                </>
              ) : (
                <>
                  <span>⚡</span>
                  AI採点を開始
                </>
              )}
            </button>

            <Link
              href="/"
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              キャンセル
            </Link>
          </div>

          {/* Information */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">❓ よくある質問</h3>
            <div className="space-y-4 text-sm text-gray-600">
              <div>
                <p className="font-semibold text-gray-900">どのくらい時間がかかりますか？</p>
                <p>通常30〜60秒です。ネットワーク状況によって変わる場合があります。</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">話者ラベルは必須ですか？</p>
                <p>いいえ。ただし含めると、受験者の発言のみを正確に評価できるため推奨です。</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">文字起こしの精度に不安があります</p>
                <p>
                  自動音声認識に誤りがある場合、AI評価に警告が表示されます。文字起こしは手動で確認することをお勧めします。
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
