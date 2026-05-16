'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Candidate } from '@/types';

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [candidatesRes, evaluationsRes] = await Promise.all([
          fetch('/api/candidates'),
          fetch('/api/evaluations'),
        ]);

        if (!candidatesRes.ok || !evaluationsRes.ok) {
          throw new Error('データの読み込みに失敗しました');
        }

        const candidatesData = await candidatesRes.json();
        const evaluationsData = await evaluationsRes.json();
        setCandidates(candidatesData.candidates || []);
        setEvaluations(evaluationsData.evaluations || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : '受験者情報の読み込みに失敗しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getCandidateEvaluations = (candidateId: string) => {
    return evaluations.filter(e => e.candidate_id === candidateId);
  };

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
          <p className="mt-2 text-gray-600">受験者の面接日時と評価結果を確認できます</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* Candidates List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">読み込み中...</div>
          ) : candidates.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>受験者データがありません</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">名前</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">国籍</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">評価履歴</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {candidates.map((candidate) => {
                    const candidateEvals = getCandidateEvaluations(candidate.id);
                    return (
                      <tr key={candidate.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{candidate.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{candidate.nationality || '未設定'}</td>
                        <td className="px-6 py-4 text-sm">
                          {candidateEvals.length > 0 ? (
                            <div className="flex gap-2 flex-wrap">
                              {candidateEvals.map((eval_) => (
                                <Link
                                  key={eval_.id}
                                  href={`/evaluations/${eval_.id}`}
                                  className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs font-medium"
                                >
                                  📊 {new Date(eval_.created_at).toLocaleDateString('ja-JP')}
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">評価なし</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
