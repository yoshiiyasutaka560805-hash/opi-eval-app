'use client';

import Link from 'next/link';
import { useEffect, useState, use } from 'react';
import { Evaluation } from '@/types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from 'recharts';

export default function EvaluationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchEvaluation = async () => {
      try {
        const response = await fetch(`/api/evaluations/${id}`);
        if (!response.ok) {
          throw new Error('評価データの取得に失敗しました');
        }
        const data = await response.json();
        setEvaluation(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvaluation();
  }, [id]);

  const handleDownloadPDF = async () => {
    if (!evaluation) return;
    setIsDownloading(true);
    setError(null);

    try {
      const element = document.getElementById('evaluation-content');
      if (!element) {
        throw new Error('評価内容要素が見つかりません');
      }

      console.log('HTML要素を取得しました。キャンバスに変換中...');

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        removeContainer: false,
        ignoreElements: (element) => {
          const style = window.getComputedStyle(element);
          if (style.display === 'none') return true;
          return false;
        },
      });

      console.log('キャンバス変換完了。PDF生成中...');

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210 - 10; // 余白を考慮
      const pageHeight = 297 - 10;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 5;

      pdf.addImage(imgData, 'PNG', 5, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 5;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 5, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `evaluation_${evaluation.candidate_id.slice(0, 8)}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      console.log('PDF生成成功:', fileName);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('PDF生成エラー:', errorMessage, err);
      setError(`PDFの生成に失敗しました: ${errorMessage}`);
    } finally {
      setIsDownloading(false);
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

        <div id="evaluation-content" className="bg-white print:bg-white w-full" style={{ colorScheme: 'light', padding: '30px', fontFamily: 'system-ui, -apple-system, sans-serif', lineHeight: '1.6' }}>
          {/* PAGE 1 - HEADER WITH CANDIDATE INFO AND MAIN CARDS */}
          <div style={{ borderRadius: '16px', border: '3px solid #10b981', padding: '45px 40px', marginBottom: '50px', backgroundColor: '#ffffff' }}>
            {/* Title and Date */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 12px 0', letterSpacing: '-0.5px' }}>面接時日本語評価レポート</h1>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '8px 0 0 0' }}>{new Date().toLocaleDateString('ja-JP')} {new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>

            {/* Candidate Info Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr 1fr 1fr', gap: '25px', marginBottom: '35px', paddingBottom: '25px', borderBottom: '2px solid #e5e7eb' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 6px 0', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>候補者名</p>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: '0', lineHeight: '1.4' }}>{evaluation.candidate_name || '受験者ID: ' + evaluation.candidate_id.slice(0, 8)}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 6px 0', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>施設</p>
                <p style={{ fontSize: '15px', color: '#374151', margin: '0', lineHeight: '1.4' }}>{evaluation.client_name || '施設情報'}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 6px 0', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>評価日</p>
                <p style={{ fontSize: '15px', fontWeight: 'bold', color: '#1f2937', margin: '0', lineHeight: '1.4' }}>{new Date(evaluation.created_at).toLocaleDateString('ja-JP')}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 6px 0', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>総合判定</p>
                <p style={{ fontSize: '15px', fontWeight: 'bold', color: evaluation.verdict === 'recommended' ? '#16a34a' : evaluation.verdict === 'conditional' ? '#ca8a04' : '#dc2626', margin: '0', lineHeight: '1.4' }}>
                  {getVerdictLabel(evaluation.verdict)}
                </p>
              </div>
            </div>

            {/* Three Main Score Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '25px', marginBottom: '30px' }}>
              {/* Card 1: Total Score */}
              <div style={{ border: '3px solid #2563eb', borderRadius: '12px', padding: '28px 20px', backgroundColor: '#eff6ff', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: '#1e40af', margin: '0 0 12px 0', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px' }}>💯 総合スコア<br />（AI採点）</p>
                <p style={{ fontSize: '56px', fontWeight: 'bold', color: '#2563eb', margin: '0', lineHeight: '1' }}>
                  {evaluation.display_score}
                </p>
                <p style={{ fontSize: '20px', color: '#6b7280', margin: '8px 0 0 0', fontWeight: '500' }}>/100</p>
              </div>

              {/* Card 2: Conversation Level */}
              <div style={{ border: '3px solid #059669', borderRadius: '12px', padding: '28px 20px', backgroundColor: '#ecfdf5', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: '#065f46', margin: '0 0 12px 0', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px' }}>🗣️ 会話レベル</p>
                <p style={{ fontSize: '52px', fontWeight: 'bold', color: '#059669', margin: '0' }}>{evaluation.conversation_level}</p>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '8px 0 0 0', fontWeight: '500' }}>6段階中</p>
              </div>

              {/* Card 3: Interviewer Score - Empty for input */}
              <div style={{ border: '3px solid #9333ea', borderRadius: '12px', padding: '28px 20px', backgroundColor: '#faf5ff', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: '#6b21a8', margin: '0 0 12px 0', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px' }}>👤 面接官<br />総合評価</p>
                <p style={{ fontSize: '44px', fontWeight: 'bold', color: '#9333ea', margin: '0', letterSpacing: '2px' }}>─────</p>
                <p style={{ fontSize: '16px', color: '#6b7280', margin: '8px 0 0 0', fontWeight: '500' }}>/100</p>
              </div>
            </div>

            {/* Important Notice */}
            <div style={{ backgroundColor: '#f0fdf4', border: '2px solid #10b981', borderRadius: '10px', padding: '18px', fontSize: '14px', color: '#065f46', lineHeight: '1.8' }}>
              <p style={{ margin: '0' }}>※ 本アプリは外国人求職者の日本語能力評価に特化しています。<br />現場安全管理度・介護適性評価は参考情報です。<br />実際の現場適性は試用期間・現場観察で別途確認が必要です。</p>
            </div>
          </div>

          {/* PAGE 2 - JOPT EVALUATION (5 ITEMS WITH DETAILS) */}
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 20px 0', borderLeft: '6px solid #2563eb', paddingLeft: '18px', letterSpacing: '-0.5px' }}>日本語能力評価（5項目詳細）</h2>

            {/* Item 1 - Instruction Comprehension */}
            <div style={{ marginBottom: '10px', padding: '14px', border: '3px solid #2563eb', borderLeft: '6px solid #2563eb', borderRadius: '10px', backgroundColor: '#f8fbff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563eb', margin: '0' }}>1. 指示理解力</h3>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563eb', margin: '0', lineHeight: '1.3' }}>評価：標準<br />{evaluation.instruction_comprehension}/20</p>
              </div>
              <p style={{ fontSize: '18px', color: '#374151', margin: '6px 0 6px 0', lineHeight: '1.4' }}>指示を正確に理解し、その通りに実行できるか。確認行動と正確な報告ができているか。</p>
              <p style={{ fontSize: '13px', color: '#374151', margin: '0', backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '6px', borderLeft: '4px solid #2563eb', lineHeight: '1.5' }}>
                <strong style={{ color: '#2563eb' }}>根拠：</strong><br />{evaluation.instruction_evidence || 'ここに文字起こしからの根拠が表示されます'}
              </p>
            </div>

            {/* Item 2 - Information Reporting */}
            <div style={{ marginBottom: '10px', padding: '14px', border: '3px solid #059669', borderLeft: '6px solid #059669', borderRadius: '10px', backgroundColor: '#f0fdf4' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669', margin: '0' }}>2. 流ちょうさ</h3>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669', margin: '0', lineHeight: '1.3' }}>評価：標準<br />{evaluation.information_reporting}/20</p>
              </div>
              <p style={{ fontSize: '18px', color: '#374151', margin: '6px 0 6px 0', lineHeight: '1.4' }}>会話のテンポ・スムーズさ。話りやや長い沈黙なく自然に応答できているか。</p>
              <p style={{ fontSize: '13px', color: '#374151', margin: '0', backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '6px', borderLeft: '4px solid #059669', lineHeight: '1.5' }}>
                <strong style={{ color: '#059669' }}>根拠：</strong><br />{evaluation.information_evidence || 'ここに文字起こしからの根拠が表示されます'}
              </p>
            </div>

            {/* Item 3 - Discourse Structure */}
            <div style={{ marginBottom: '10px', padding: '14px', border: '3px solid #9333ea', borderLeft: '6px solid #9333ea', borderRadius: '10px', backgroundColor: '#faf5ff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#9333ea', margin: '0' }}>3. 談話構成</h3>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#9333ea', margin: '0', lineHeight: '1.3' }}>評価：良好<br />{evaluation.discourse_structure}/20</p>
              </div>
              <p style={{ fontSize: '18px', color: '#374151', margin: '6px 0 6px 0', lineHeight: '1.4' }}>話の論理性・整理力。情報を体系的かつ明確に伝えられているか。意味が不明確でないか。</p>
              <p style={{ fontSize: '13px', color: '#374151', margin: '0', backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '6px', borderLeft: '4px solid #9333ea', lineHeight: '1.5' }}>
                <strong style={{ color: '#9333ea' }}>根拠：</strong><br />{evaluation.emergency_evidence || 'ここに文字起こしからの根拠が表示されます'}
              </p>
            </div>

            {/* Item 4 - Vocabulary */}
            <div style={{ marginBottom: '10px', padding: '14px', border: '3px solid #ea580c', borderLeft: '6px solid #ea580c', borderRadius: '10px', backgroundColor: '#fff7ed' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ea580c', margin: '0' }}>4. 語彙</h3>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#ea580c', margin: '0', lineHeight: '1.3' }}>評価：標準<br />{evaluation.vocabulary_grammar}/20</p>
              </div>
              <p style={{ fontSize: '18px', color: '#374151', margin: '6px 0 6px 0', lineHeight: '1.4' }}>介護現場で必要な語彙の範囲と正確性。医療・介護用語が適切に使われているか。</p>
              <p style={{ fontSize: '13px', color: '#374151', margin: '0', backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '6px', borderLeft: '4px solid #ea580c', lineHeight: '1.5' }}>
                <strong style={{ color: '#ea580c' }}>根拠：</strong><br />{evaluation.vocabulary_grammar_reason || 'ここに文字起こしからの根拠が表示されます'}
              </p>
            </div>

            {/* Item 5 - Grammar */}
            <div style={{ marginBottom: '10px', padding: '14px', border: '3px solid #dc2626', borderLeft: '6px solid #dc2626', borderRadius: '10px', backgroundColor: '#fef2f2' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc2626', margin: '0' }}>5. 文法</h3>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc2626', margin: '0', lineHeight: '1.3' }}>評価：要改善<br />{evaluation.discourse_structure}/20</p>
              </div>
              <p style={{ fontSize: '18px', color: '#374151', margin: '6px 0 6px 0', lineHeight: '1.4' }}>文法的な正確性。日本語の正しい構成で文が構成されているか。意味が通じない誤りがないか。</p>
              <p style={{ fontSize: '13px', color: '#374151', margin: '0', backgroundColor: '#ffffff', padding: '10px 12px', borderRadius: '6px', borderLeft: '4px solid #dc2626', lineHeight: '1.5' }}>
                <strong style={{ color: '#dc2626' }}>根拠：</strong><br />{evaluation.discourse_structure_reason || 'ここに文字起こしからの根拠が表示されます'}
              </p>
            </div>
          </div>

          {/* PAGE 2 - RADAR CHARTS */}
          <div style={{ marginTop: '400px', marginBottom: '50px', display: 'flex', justifyContent: 'center', gap: '40px', pageBreakBefore: 'always' }}>
            {/* 現場安全能力レーダー */}
            <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', border: '2px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', minWidth: '450px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 25px 0', textAlign: 'center', letterSpacing: '-0.3px' }}>現場安全能力</h3>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart
                  data={[
                    { name: '指示理解力', score: Math.round((evaluation.instruction_comprehension / 20) * 100), fullMark: 100 },
                    { name: '情報整理・報告', score: Math.round((evaluation.information_reporting / 20) * 100), fullMark: 100 },
                    { name: '緊急・安全対応', score: Math.round((evaluation.emergency_communication / 20) * 100), fullMark: 100 },
                    { name: '申し送り・確認', score: Math.round((evaluation.confirmation_behavior / 20) * 100), fullMark: 100 },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Radar name="スコア" dataKey="score" stroke="#2563eb" fill="#2563eb" fillOpacity={0.6} label={{ formatter: () => '' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* 介護適性レーダー */}
            <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', border: '2px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', minWidth: '450px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 25px 0', textAlign: 'center', letterSpacing: '-0.3px' }}>介護適性</h3>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart
                  data={[
                    { name: 'コミュニケーション', score: Math.round((evaluation.care_communication / 5) * 100), fullMark: 100 },
                    { name: 'ストレス耐性・継続', score: Math.round((evaluation.care_resilience / 5) * 100), fullMark: 100 },
                    { name: '安全意識', score: Math.round((evaluation.care_safety_awareness / 5) * 100), fullMark: 100 },
                    { name: '文化適応', score: Math.round((evaluation.care_culture_fit / 5) * 100), fullMark: 100 },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Radar name="スコア" dataKey="score" stroke="#9333ea" fill="#9333ea" fillOpacity={0.6} label={{ formatter: () => '' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SCORE DETAILS */}
          <div style={{ marginBottom: '50px', display: 'flex', justifyContent: 'center', gap: '40px' }}>
            <div style={{ backgroundColor: '#f9fafb', padding: '28px', borderRadius: '10px', border: '2px solid #e5e7eb', minWidth: '400px' }}>
              <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 24px 0', letterSpacing: '-0.3px' }}>スコア詳細</h4>
              <div style={{ fontSize: '17px', lineHeight: '2.4', color: '#374151' }}>
                <div>指示理解力: <strong style={{ color: '#2563eb' }}>{Math.round((evaluation.instruction_comprehension / 20) * 100)}/100</strong></div>
                <div>情報報告精度: <strong style={{ color: '#059669' }}>{Math.round((evaluation.information_reporting / 20) * 100)}/100</strong></div>
                <div>緊急対応能力: <strong style={{ color: '#dc2626' }}>{Math.round((evaluation.emergency_communication / 20) * 100)}/100</strong></div>
                <div>確認行動: <strong style={{ color: '#ea580c' }}>{Math.round((evaluation.confirmation_behavior / 20) * 100)}/100</strong></div>
              </div>
            </div>
            <div style={{ backgroundColor: '#f9fafb', padding: '28px', borderRadius: '10px', border: '2px solid #e5e7eb', minWidth: '400px' }}>
              <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 24px 0', letterSpacing: '-0.3px' }}>スコア詳細</h4>
              <div style={{ fontSize: '17px', lineHeight: '2.4', color: '#374151' }}>
                <div>コミュニケーション: <strong style={{ color: '#0284c7' }}>{Math.round((evaluation.care_communication / 5) * 100)}/100</strong></div>
                <div>ストレス耐性・継続: <strong style={{ color: '#0284c7' }}>{Math.round((evaluation.care_resilience / 5) * 100)}/100</strong></div>
                <div>安全意識: <strong style={{ color: '#dc2626' }}>{Math.round((evaluation.care_safety_awareness / 5) * 100)}/100</strong></div>
                <div>文化適応: <strong style={{ color: '#0284c7' }}>{Math.round((evaluation.care_culture_fit / 5) * 100)}/100</strong></div>
              </div>
            </div>
          </div>

          {/* PAGE 4 - SUMMARY */}
          <div style={{ borderRadius: '14px', border: '2px solid #e5e7eb', padding: '35px', backgroundColor: '#ffffff' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: '0 0 32px 0', letterSpacing: '-0.5px' }}>総合評価</h2>

            {/* Strengths */}
            <div style={{ marginBottom: '26px', padding: '20px', backgroundColor: '#f0fdf4', border: '2px solid #10b981', borderRadius: '10px' }}>
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#047857', margin: '0 0 14px 0', textTransform: 'uppercase', letterSpacing: '0.3px' }}>✅ 強み</p>
              <p style={{ fontSize: '15px', color: '#065f46', margin: '0', lineHeight: '1.9', whiteSpace: 'pre-wrap' }}>
                {evaluation.strengths || '1）4年間の日本での介護実務経験と副主任としてのリーダーシップ経験\n2）デイサービスと有料老人ホームの両方の経験\n3）日本語でのコミュニケーション能力が高く、介護専門用語も理解\n4）失敗から学び改善する姿勢'}
              </p>
            </div>

            {/* Improvements */}
            <div style={{ marginBottom: '26px', padding: '20px', backgroundColor: '#fff7ed', border: '2px solid #f97316', borderRadius: '10px' }}>
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#92400e', margin: '0 0 14px 0', textTransform: 'uppercase', letterSpacing: '0.3px' }}>📋 改善点</p>
              <p style={{ fontSize: '15px', color: '#78350f', margin: '0', lineHeight: '1.9', whiteSpace: 'pre-wrap' }}>
                {evaluation.improvements || '1）面接中の能動的な確認質問が少ない\n2）より高度な医療用語や緊急時対応の語彙の習得'}
              </p>
            </div>

            {/* 介護適性評価所見 */}
            <div style={{ marginBottom: '26px', padding: '20px', backgroundColor: '#f0f9ff', border: '2px solid #0284c7', borderRadius: '10px' }}>
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#0369a1', margin: '0 0 14px 0', textTransform: 'uppercase', letterSpacing: '0.3px' }}>🏥 介護適性評価</p>
              <p style={{ fontSize: '15px', color: '#0c4a6e', margin: '0', lineHeight: '1.9', whiteSpace: 'pre-wrap' }}>
                {evaluation.care_assessment || '介護経験豊富で日本語能力も高く、即戦力として期待できる人材。副主任経験もあり、リーダーシップも発揮できる。'}
              </p>
            </div>

            {/* Disclaimer */}
            <div style={{ padding: '16px 18px', backgroundColor: '#fff3cd', border: '2px solid #ffecb5', borderRadius: '8px', fontSize: '14px', color: '#856404', lineHeight: '1.8' }}>
              <p style={{ margin: '0' }}>⚠️ このスコアは面接発言からの推定値です。<br />実際の現場適性は試用期間・現場観察で別途確認が必要です。</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-4 justify-center">
          <Link href="/" className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition">
            ホームに戻る
          </Link>
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {isDownloading ? 'PDFを生成中...' : 'PDFをダウンロード'}
          </button>
        </div>
      </div>
    </div>
  );
}
