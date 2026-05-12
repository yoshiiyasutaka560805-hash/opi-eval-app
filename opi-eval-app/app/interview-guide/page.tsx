import { interviewQuestions, caringAptiudeScoringAnchors } from '@/data/interview-questions';

export default function InterviewGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-8">
          <h1 className="text-3xl font-bold mb-2">外国人介護人材 採用支援AI</h1>
          <h2 className="text-xl font-semibold">面接質問ガイド</h2>
          <p className="mt-4 text-blue-100">
            このガイドは、適切に評価を行うための必須資料です。面接時に以下の4つの質問を必ず含めてください。
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 m-6">
          <h3 className="text-lg font-bold text-yellow-800 mb-2">⚠️ 重要</h3>
          <p className="text-yellow-700">
            以下の4つの質問が文字起こしに含まれていない場合、該当する評価項目の信頼性が大幅に低下します。
            AI評価結果には警告が表示されます。
          </p>
        </div>

        {/* Interview Questions */}
        <div className="p-8 space-y-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">【推奨面接質問】</h3>

          {interviewQuestions.map((q, idx) => (
            <div key={q.id} className="border border-gray-300 rounded-lg p-6 bg-gray-50">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-600 text-white font-bold">
                    {idx + 1}
                  </div>
                </div>
                <div className="flex-grow">
                  <h4 className="text-lg font-bold text-blue-600 mb-2">{q.ability}</h4>

                  {/* Question */}
                  <div className="bg-white p-4 rounded border-l-4 border-blue-400 mb-4">
                    <p className="text-gray-800 font-semibold">Q: {q.question}</p>
                  </div>

                  {/* Why This Matters */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 font-semibold mb-1">💡 なぜこの質問が重要か：</p>
                    <p className="text-gray-700 text-sm">{q.whyMatters}</p>
                  </div>

                  {/* Scoring Anchors */}
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-3">📊 採点基準（20点満点）：</p>
                    <div className="space-y-2">
                      {q.scoringAnchors.map((anchor, anchorIdx) => (
                        <div key={anchorIdx} className="bg-white p-3 rounded border border-gray-200">
                          <p className="font-semibold text-gray-800 text-sm">{anchor.level}</p>
                          <p className="text-gray-700 text-sm mt-1">{anchor.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Caring Aptitude Scoring */}
        <div className="bg-blue-50 p-8 border-t border-gray-300">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">【介護適性評価 採点基準】</h3>
          <p className="text-gray-700 mb-6">
            以下の4項目は会話の全体から判断します。それぞれ1〜5点で採点します。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {caringAptiudeScoringAnchors.map((item, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg border border-blue-200">
                <p className="font-bold text-blue-600 mb-1">{item.level}</p>
                <p className="text-gray-700 text-sm">{item.description}</p>
                <p className="text-gray-500 text-xs mt-2">満点: {item.points}点</p>
              </div>
            ))}
          </div>

          {/* Scoring Scale */}
          <div className="mt-8 bg-white p-6 rounded-lg border border-blue-300">
            <h4 className="font-bold text-gray-800 mb-4">5段階評価スケール：</h4>
            <div className="space-y-2 text-sm">
              <div className="flex gap-4">
                <span className="font-semibold text-green-600 w-12">5点</span>
                <span className="text-gray-700">
                  非常に優れている。その項目について明確で前向きな発言が複数ある
                </span>
              </div>
              <div className="flex gap-4">
                <span className="font-semibold text-green-500 w-12">4点</span>
                <span className="text-gray-700">良好。その項目に関連する適切な発言が見られる</span>
              </div>
              <div className="flex gap-4">
                <span className="font-semibold text-yellow-600 w-12">3点</span>
                <span className="text-gray-700">平均的。基本的に問題ないが、強みが明確でない</span>
              </div>
              <div className="flex gap-4">
                <span className="font-semibold text-orange-500 w-12">2点</span>
                <span className="text-gray-700">懸念あり。その項目について不十分な発言が見られる</span>
              </div>
              <div className="flex gap-4">
                <span className="font-semibold text-red-600 w-12">1点</span>
                <span className="text-gray-700">大きな懸念。その項目についてリスク信号が見られる</span>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="bg-gray-100 p-8 border-t border-gray-300">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">【使用方法】</h3>
          <ol className="list-decimal list-inside space-y-3 text-gray-700">
            <li>
              <strong>面接前の準備：</strong>このガイドを印刷し、面接官で共有します
            </li>
            <li>
              <strong>面接中：</strong>4つの質問を必ず含めて面接を実施します
            </li>
            <li>
              <strong>文字起こし：</strong>面接の会話を文字起こしします
            </li>
            <li>
              <strong>AI評価：</strong>文字起こしをアプリにアップロードし、自動採点を受けます
            </li>
            <li>
              <strong>面接官追加評価：</strong>印象スコア（0〜20点）を入力します
            </li>
            <li>
              <strong>採用判定：</strong>アプリから生成された推奨判定と推奨アクションを参考に採用決定を行います
            </li>
          </ol>
        </div>

        {/* Footer */}
        <div className="bg-gray-200 p-6 text-center text-sm text-gray-700 border-t border-gray-300">
          <p>このガイドは印刷して面接現場で使用できます</p>
          <p className="mt-2 text-xs text-gray-600">
            注: AI評価は採用決定の根拠ではなく、採用支援ツールです。最終決定は人間の判断で行ってください
          </p>
        </div>
      </div>

      {/* Print Button */}
      <div className="mt-8 text-center">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4H9a2 2 0 00-2 2v2a2 2 0 002 2h6a2 2 0 002-2v-2a2 2 0 00-2-2zm-6-4a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
          このガイドを印刷する
        </button>
      </div>
    </div>
  );
}
