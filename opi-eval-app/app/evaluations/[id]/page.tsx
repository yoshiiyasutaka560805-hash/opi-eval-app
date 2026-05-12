'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Evaluation } from '@/types';

export default function EvaluationDetailPage({ params }: { params: { id: string } }) {
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [impressionScore, setImpressionScore] = useState(0);
  const [impressionMemo, setImpressionMemo] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        const response = await fetch(`/api/evaluations/${params.id}`);
        if (!response.ok) {
          throw new Error('評価データの取得に失敗しました');
        }
        const data = await response.json();
        setEvaluation(data);
        setImpressionScore(data.impression_score || 0);
        setImpressionMemo(data.impression_memo || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvaluation();
  }, [params.id]);

  const handleSaveImpression = async () => {
    if (!evaluation) return;
    setIsSaving(true);

    try {
      const response = await fetch(`/api/evaluations/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          impression_score: impressionScore,
          impression_memo: impressionMemo,
        }),
      });

      if (!response.ok) {
        throw new Error('保存に失敗しました');
      }

      setEvaluation(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">評価データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !evaluation) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center gap-1">
            ← ホームに戻る
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-800">
            {error || '評価データが見つかりません'}
          </div>
        </div>
      </div>
    );
  }

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'recommended':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'conditional':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getVerdictLabel = (verdict: string) => {
    switch (verdict) {
      case 'recommended':
        return '採用推奨 🟢';
      case 'conditional':
        return '条件付き採用 🟡';
      case 'rejected':
        return '再評価・見送り 🔴';
      default:
        return '判定待ち';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Navigation */}
        <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center gap-1">
          ← ホームに戻る
        </Link>

        {/* Header Card */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-6">
          <div className="bg-blue-600 text-white p-6">
            <h1 className="text-3xl font-bold mb-2">評価結果</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-blue-100">
              <div>
                <p className="text-sm opacity-90">受験者名</p>
                <p className="text-lg font-semibold">受験者ID: {evaluation.candidate_id.slice(0, 8)}</p>
              </div>
              <div>
                <p className="text-sm opacity-90">評価日</p>
                <p className="text-lg font-semibold">
                  {new Date(evaluation.created_at).toLocaleDateString('ja-JP')}
                </p>
              </div>
              <div>
                <p className="text-sm opacity-90">会話レベル</p>
                <p className="text-lg font-semibold">{evaluation.conversation_level}</p>
              </div>
            </div>
          </div>

          {/* Score and Verdict */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-2">AI採点スコア</p>
                <div className="text-5xl font-bold text-gray-900">
                  {evaluation.display_score}
                  <span className="text-2xl text-gray-500">/100</span>
                </div>
              </div>
              <div className={`px-6 py-3 rounded-lg border-2 font-bold text-lg ${getVerdictColor(evaluation.verdict)}`}>
                {getVerdictLabel(evaluation.verdict)}
              </div>
            </div>
          </div>

          {/* Risk Flags */}
          {(evaluation.risk_flags.no_confirmation ||
            evaluation.risk_flags.no_emergency_vocab ||
            evaluation.risk_flags.only_wakarimashita ||
            evaluation.risk_flags.disorganized_report) && (
            <div className="p-6 bg-yellow-50 border-b border-yellow-200">
              <h3 className="font-bold text-yellow-900 mb-3">⚠️ リスクフラグ</h3>
              <div className="space-y-1">
                {evaluation.risk_flags.no_confirmation && (
                  <p className="text-sm text-yellow-800">🔴 <strong>重大:</strong> 指示確認がない</p>
                )}
                {evaluation.risk_flags.no_emergency_vocab && (
                  <p className="text-sm text-yellow-800">🔴 <strong>重大:</strong> 緊急対応語彙が欠如</p>
                )}
                {evaluation.risk_flags.only_wakarimashita && (
                  <p className="text-sm text-yellow-800">🟡 <strong>要注意:</strong> 「わかりました」のみの確認</p>
                )}
                {evaluation.risk_flags.disorganized_report && (
                  <p className="text-sm text-yellow-800">🟡 <strong>要注意:</strong> 報告が散漫</p>
                )}
              </div>
            </div>
          )}

          {evaluation.transcription_quality_warning && (
            <div className="p-6 bg-orange-50 border-b border-orange-200">
              <p className="text-sm text-orange-800">
                ⚠️ <strong>文字起こし品質:</strong> 認識不能・省略箇所が多い可能性があります。採点信頼性が低下しています。
              </p>
            </div>
          )}

          {evaluation.language_fail_flag && (
            <div className="p-6 bg-red-50 border-b border-red-200">
              <p className="text-sm text-red-800">
                ⛔ <strong>言語能力要件未達:</strong> 語彙・文法スコアが基準に達していません
              </p>
            </div>
          )}
        </div>

        {/* Detailed Scores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Safety Scores */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">現場安全能力（80点満点）</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-gray-700">1. 指示理解力</span>
                  <span className="text-lg font-bold text-gray-900">{evaluation.instruction_comprehension}/20</span>
                </div>
                <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full"
                    style={{ width: `${(evaluation.instruction_comprehension / 20) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">{evaluation.instruction_comprehension_reason}</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-gray-700">2. 情報整理・報告精度</span>
                  <span className="text-lg font-bold text-gray-900">{evaluation.information_reporting}/20</span>
                </div>
                <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full"
                    style={{ width: `${(evaluation.information_reporting / 20) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">{evaluation.information_reporting_reason}</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-gray-700">3. 緊急・安全対応</span>
                  <span className="text-lg font-bold text-gray-900">{evaluation.emergency_communication}/20</span>
                </div>
                <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full"
                    style={{ width: `${(evaluation.emergency_communication / 20) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">{evaluation.emergency_communication_reason}</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-gray-700">4. 申し送り・確認行動</span>
                  <span className="text-lg font-bold text-gray-900">{evaluation.confirmation_behavior}/20</span>
                </div>
                <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full"
                    style={{ width: `${(evaluation.confirmation_behavior / 20) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">{evaluation.confirmation_behavior_reason}</p>
              </div>
            </div>
          </div>

          {/* Language Scores */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">言語能力（40点満点）</h3>
            <div className="space-y-4 mb-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-gray-700">語彙・文法</span>
                  <span className="text-lg font-bold text-gray-900">{evaluation.vocabulary_grammar}/20</span>
                </div>
                <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-green-600 h-full"
                    style={{ width: `${(evaluation.vocabulary_grammar / 20) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">{evaluation.vocabulary_grammar_reason}</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-semibold text-gray-700">談話構成</span>
                  <span className="text-lg font-bold text-gray-900">{evaluation.discourse_structure}/20</span>
                </div>
                <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-green-600 h-full"
                    style={{ width: `${(evaluation.discourse_structure / 20) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">{evaluation.discourse_structure_reason}</p>
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-4 border-t pt-4 border-b pb-2">
              介護適性（20点満点）
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>コミュニケーション適性</span>
                <span className="font-bold">{evaluation.care_communication}/5</span>
              </div>
              <div className="flex justify-between">
                <span>ストレス耐性・継続意欲</span>
                <span className="font-bold">{evaluation.care_resilience}/5</span>
              </div>
              <div className="flex justify-between">
                <span>安全意識</span>
                <span className="font-bold">{evaluation.care_safety_awareness}/5</span>
              </div>
              <div className="flex justify-between">
                <span>日本文化への適応</span>
                <span className="font-bold">{evaluation.care_culture_fit}/5</span>
              </div>
            </div>
          </div>
        </div>

        {/* Impression Score */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">【面接官 感性評価】第一印象スコア（0〜20点）</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">スコア: {impressionScore} / 20</span>
                <span className="text-xs text-gray-500">
                  {impressionScore <= 5
                    ? '基本的な接遇'
                    : impressionScore <= 10
                      ? '標準的な態度'
                      : impressionScore <= 15
                        ? '好印象'
                        : '優秀'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={impressionScore}
                onChange={(e) => setImpressionScore(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">メモ（任意）</label>
              <textarea
                value={impressionMemo}
                onChange={(e) => setImpressionMemo(e.target.value)}
                placeholder="例：自発的な挨拶、笑顔、配慮ある言動など..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={3}
              />
            </div>

            <button
              onClick={handleSaveImpression}
              disabled={isSaving}
              className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {isSaving ? '保存中...' : '感性スコアを保存'}
            </button>
          </div>

          {/* Final Score */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">AI採点 + 感性評価</p>
                <p className="text-gray-600 text-sm mb-2">
                  {evaluation.display_score} + {impressionScore} = <span className="text-2xl font-bold">
                    {Math.round(evaluation.display_score + impressionScore * 0.625)}
                  </span>{' '}
                  / 100
                </p>
              </div>
              <div className="text-xs text-gray-500">
                ※感性評価(20点)は100点スケールに換算されます
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations and Comments */}
        {evaluation.verdict === 'conditional' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-yellow-900 mb-3">推奨アクション</h3>
            <p className="text-yellow-800 whitespace-pre-wrap">{evaluation.recommended_actions}</p>
          </div>
        )}

        {/* Strengths and Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-bold text-green-900 mb-3">✓ 強み</h3>
            <p className="text-green-800 text-sm whitespace-pre-wrap">{evaluation.strengths}</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h3 className="font-bold text-orange-900 mb-3">△ 改善点</h3>
            <p className="text-orange-800 text-sm whitespace-pre-wrap">{evaluation.improvements}</p>
          </div>
        </div>

        {/* Care Assessment */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-bold text-blue-900 mb-2">介護適性所見</h3>
          <p className="text-blue-800 text-sm whitespace-pre-wrap mb-3">{evaluation.care_assessment}</p>
          <p className="text-xs text-blue-700 italic">{evaluation.care_assessment_disclaimer || '免責事項'}</p>
        </div>

        {/* Footer */}
        <div className="flex gap-4 justify-center">
          <Link href="/" className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition">
            ホームに戻る
          </Link>
          <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
            PDFをダウンロード
          </button>
        </div>
      </div>
    </div>
  );
}
