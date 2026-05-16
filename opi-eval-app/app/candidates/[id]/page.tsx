'use client';

import Link from 'next/link';
import { useEffect, useState, use } from 'react';
import { supabase, getCandidate, getEvaluations, uploadPDF, updateCandidatePDFUrls } from '@/lib/supabase';
import { Candidate, Evaluation } from '@/types';
import { formatDate, formatDateOnly } from '@/lib/utils';

export default function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const candidateData = await getCandidate(id);
        setCandidate(candidateData);

        const evaluationsData = await getEvaluations(id);
        setEvaluations(evaluationsData);
      } catch (err) {
        setError('データの読み込みに失敗しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handlePDFUpload = async (file: File, type: 'user' | 'result') => {
    if (!candidate) return;

    setUploading(true);
    setUploadError(null);

    try {
      const bucket = type === 'user' ? 'candidate-documents' : 'result-documents';
      const pdfUrl = await uploadPDF(bucket, file, candidate.id);

      if (type === 'user') {
        await updateCandidatePDFUrls(candidate.id, pdfUrl, undefined);
        setCandidate({ ...candidate, user_pdf_url: pdfUrl });
      } else {
        await updateCandidatePDFUrls(candidate.id, undefined, pdfUrl);
        setCandidate({ ...candidate, result_pdf_url: pdfUrl });
      }
    } catch (err) {
      setUploadError('ファイルのアップロードに失敗しました');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center text-gray-500">
          読み込み中...
        </div>
      </div>
    );
  }

  if (!candidate || error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/candidates" className="text-blue-600 hover:text-blue-800 mb-6 inline-flex items-center gap-1">
            ← 受験者管理に戻る
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-800">
            {error || '受験者情報が見つかりません'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <Link href="/candidates" className="text-blue-600 hover:text-blue-800 mb-6 inline-flex items-center gap-1">
          ← 受験者管理に戻る
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{candidate.name}</h1>
          <p className="mt-2 text-gray-600">{candidate.nationality} 出身 | {candidate.native_language}話者</p>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">基本情報</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">生年月日</p>
              <p className="text-lg font-medium text-gray-900">{formatDateOnly(candidate.birthdate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">ビザタイプ</p>
              <p className="text-lg font-medium text-gray-900">{candidate.visa_type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">介護経験</p>
              <p className="text-lg font-medium text-gray-900">{candidate.care_experience ? 'あり' : 'なし'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">面接日</p>
              <p className="text-lg font-medium text-gray-900">{formatDateOnly(candidate.interview_date)}</p>
            </div>
            {candidate.jlpt_level && (
              <div>
                <p className="text-sm text-gray-600">JLPT レベル</p>
                <p className="text-lg font-medium text-gray-900">{candidate.jlpt_level}</p>
              </div>
            )}
            {candidate.jft_score && (
              <div>
                <p className="text-sm text-gray-600">JFT スコア</p>
                <p className="text-lg font-medium text-gray-900">{candidate.jft_score}</p>
              </div>
            )}
          </div>
        </div>

        {/* Submission History */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">提出履歴</h2>
          <div className="space-y-4">
            {candidate.submission_history && candidate.submission_history.length > 0 ? (
              candidate.submission_history.map((submission, index) => (
                <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-b-0">
                  <div className="flex-shrink-0">
                    {submission.status === 'submitted' && (
                      <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                    )}
                    {submission.status === 'resubmission_requested' && (
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mt-2"></div>
                    )}
                    {submission.status === 'resubmitted' && (
                      <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">
                        {submission.status === 'submitted' && '提出済み'}
                        {submission.status === 'resubmission_requested' && '再度提出を求める'}
                        {submission.status === 'resubmitted' && '再提出済み'}
                      </p>
                      <p className="text-sm text-gray-600">{formatDate(submission.submitted_at)}</p>
                    </div>
                    {submission.notes && (
                      <p className="text-sm text-gray-600 mt-1">{submission.notes}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">提出履歴がありません</p>
            )}
          </div>
        </div>

        {/* PDF Upload Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">関連ドキュメント</h2>

          {uploadError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {uploadError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User PDF */}
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-3">受験者情報PDF</p>
              {candidate.user_pdf_url ? (
                <div className="space-y-2">
                  <a
                    href={candidate.user_pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                  >
                    📄 PDFを表示
                  </a>
                  <label className="block">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePDFUpload(file, 'user');
                        e.target.value = '';
                      }}
                      disabled={uploading}
                      className="hidden"
                    />
                    <span className="text-xs text-blue-600 hover:underline cursor-pointer">
                      別のファイルを選択
                    </span>
                  </label>
                </div>
              ) : (
                <label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePDFUpload(file, 'user');
                      e.target.value = '';
                    }}
                    disabled={uploading}
                    className="hidden"
                  />
                  <span className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer font-medium text-sm">
                    {uploading ? 'アップロード中...' : 'ファイルを選択'}
                  </span>
                </label>
              )}
            </div>

            {/* Result PDF */}
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-3">結果レポートPDF</p>
              {candidate.result_pdf_url ? (
                <div className="space-y-2">
                  <a
                    href={candidate.result_pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
                  >
                    📊 レポートを表示
                  </a>
                  <label className="block">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePDFUpload(file, 'result');
                        e.target.value = '';
                      }}
                      disabled={uploading}
                      className="hidden"
                    />
                    <span className="text-xs text-green-600 hover:underline cursor-pointer">
                      別のファイルを選択
                    </span>
                  </label>
                </div>
              ) : (
                <label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePDFUpload(file, 'result');
                      e.target.value = '';
                    }}
                    disabled={uploading}
                    className="hidden"
                  />
                  <span className="inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer font-medium text-sm">
                    {uploading ? 'アップロード中...' : 'ファイルを選択'}
                  </span>
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Evaluations */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">評価履歴</h2>
          {evaluations.length === 0 ? (
            <p className="text-gray-500">評価がまだ行われていません</p>
          ) : (
            <div className="space-y-2">
              {evaluations.map((evaluation) => (
                <Link
                  key={evaluation.id}
                  href={`/evaluations/${evaluation.id}`}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatDateOnly(evaluation.created_at)}
                    </p>
                    <p className="text-sm text-gray-600">スコア: {evaluation.display_score}/100</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {evaluation.verdict === 'recommended' && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        採用推奨
                      </span>
                    )}
                    {evaluation.verdict === 'conditional' && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        条件付き採用
                      </span>
                    )}
                    {evaluation.verdict === 'rejected' && (
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                        見送り
                      </span>
                    )}
                    <span className="text-blue-600">→</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
