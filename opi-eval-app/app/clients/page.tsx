'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ClientData {
  id: string;
  name: string;
  facility_type: string;
  contact_name: string;
  contact_email: string;
  safety_threshold_pct: number;
  total_threshold_pct: number;
  created_at: string;
}

interface EvaluationData {
  id: string;
  candidate_name: string;
  total_display_score: number;
  verdict: string;
  created_at: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [evaluationCounts, setEvaluationCounts] = useState<Record<string, number>>({});
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [evaluations, setEvaluations] = useState<EvaluationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientsAndEvaluations();
  }, []);

  async function fetchClientsAndEvaluations() {
    try {
      // Fetch clients
      const clientRes = await fetch('/api/clients');
      const clientData = await clientRes.json();
      setClients(clientData.clients || []);

      // Fetch all evaluations
      const evalRes = await fetch('/api/evaluations');
      const evalData = await evalRes.json();

      // Count evaluations by client
      const counts: Record<string, number> = {};
      (clientData.clients || []).forEach((client: ClientData) => {
        counts[client.id] = (evalData.evaluations || []).filter(
          (e: EvaluationData) => e.candidate_id ? true : false
        ).length;
      });
      setEvaluationCounts(counts);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectClient(clientId: string) {
    setSelectedClientId(clientId);
    try {
      const res = await fetch(`/api/evaluations?client_id=${clientId}`);
      const data = await res.json();
      setEvaluations(data.evaluations || []);
    } catch (error) {
      console.error('Failed to fetch evaluations:', error);
      setEvaluations([]);
    }
  }

  const verdictLabel = {
    recommended: '推奨',
    conditional: '条件付き',
    rejected: '不適切',
  };

  const verdictColor = {
    recommended: 'bg-green-100 text-green-800',
    conditional: 'bg-yellow-100 text-yellow-800',
    rejected: 'bg-red-100 text-red-800',
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
          <h1 className="text-3xl font-bold text-gray-900">施設管理</h1>
          <p className="mt-2 text-gray-600">
            登録された施設と、受講した職員の評価履歴を確認します
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Clients List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">
                    登録施設 ({clients.length})
                  </h2>
                </div>

                <div className="divide-y divide-gray-200">
                  {clients.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                      <p className="text-gray-600">施設が登録されていません</p>
                      <p className="text-sm text-gray-500 mt-2">
                        API または管理画面から施設を追加してください
                      </p>
                    </div>
                  ) : (
                    clients.map((client) => (
                      <button
                        key={client.id}
                        onClick={() => handleSelectClient(client.id)}
                        className={`w-full text-left px-6 py-4 transition ${
                          selectedClientId === client.id
                            ? 'bg-blue-50 border-l-4 border-blue-600'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <h3 className="font-semibold text-gray-900">{client.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {client.facility_type || '種別未設定'}
                        </p>
                        <p className="text-sm text-blue-600 font-semibold mt-2">
                          評価件数: {evaluationCounts[client.id] || 0}件
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Evaluation Details */}
            <div className="lg:col-span-2">
              {selectedClientId ? (
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900">
                      受講した職員の履歴
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {evaluations.length} 件の評価記録
                    </p>
                  </div>

                  {evaluations.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                      <p className="text-gray-600">評価履歴がありません</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                      {evaluations.map((evaluation) => (
                        <div key={evaluation.id} className="px-6 py-4 hover:bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">
                                {evaluation.candidate_name}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                評価日：{new Date(evaluation.created_at).toLocaleDateString('ja-JP')}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-xl font-bold text-blue-600">
                                {evaluation.total_display_score}点
                              </div>
                              <span className={`inline-block text-xs px-2 py-1 rounded mt-1 ${
                                verdictColor[evaluation.verdict as keyof typeof verdictColor] || 'bg-gray-100 text-gray-800'
                              }`}>
                                {verdictLabel[evaluation.verdict as keyof typeof verdictLabel] || evaluation.verdict}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                  <div className="text-4xl mb-4">👈</div>
                  <p className="text-gray-600">左から施設を選択してください</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
