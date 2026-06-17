import Link from 'next/link';
import { MODULES } from '@/lib/learnData';
import LearnNav from '@/components/learn/LearnNav';
import LearnProgressSummary from '@/components/learn/LearnProgressSummary';

const LEVEL_STYLES: Record<number, { badge: string; border: string; dot: string; bg: string }> = {
  1: { badge: 'bg-green-100 text-green-700', border: 'border-green-200 hover:border-green-400', dot: 'bg-green-500', bg: 'bg-green-50' },
  2: { badge: 'bg-blue-100 text-blue-700', border: 'border-blue-200 hover:border-blue-400', dot: 'bg-blue-500', bg: 'bg-blue-50' },
  3: { badge: 'bg-amber-100 text-amber-700', border: 'border-amber-200 hover:border-amber-400', dot: 'bg-amber-500', bg: 'bg-amber-50' },
};

export default function LearnPage() {
  const totalLessons = MODULES.reduce((s, m) => s + m.lessons.length, 0);
  const totalMinutes = MODULES.reduce(
    (s, m) => s + m.lessons.reduce((ss, l) => ss + l.estimatedMinutes, 0),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <LearnNav />

      {/* Hero */}
      <section className="bg-white border-b border-gray-200 py-12 px-4 text-center">
        <div className="text-5xl mb-4">📊</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">会計スタート</h1>
        <p className="text-gray-500 max-w-md mx-auto text-sm mb-4">
          初めて会社を立てた方のための会計・簿記学習プログラム。
          決算に向けて、基礎から段階的に学べます。
        </p>
        <div className="flex justify-center gap-6 text-xs text-gray-400">
          <span>📖 {totalLessons} レッスン</span>
          <span>⏱ 合計約 {totalMinutes} 分</span>
          <span>🎯 3つのレベル</span>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* 進捗サマリー */}
        <LearnProgressSummary />

        {/* 学習のヒント */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex gap-3">
          <span className="text-xl flex-shrink-0 mt-0.5">💡</span>
          <div>
            <div className="text-sm font-semibold text-blue-800 mb-1">学習の進め方</div>
            <div className="text-xs text-blue-700 leading-relaxed">
              Level 1「超基礎」から順に進めましょう。各レッスンには図解・用語カード・
              確認問題が段階的に登場し、読み進めながら自然に理解が深まります。
              決算前に Level 2 まで完了することを目標に！
            </div>
          </div>
        </div>

        {/* モジュール一覧 */}
        <div className="space-y-4">
          {MODULES.map((module) => {
            const style = LEVEL_STYLES[module.level];
            const totalMin = module.lessons.reduce((s, l) => s + l.estimatedMinutes, 0);

            return (
              <div
                key={module.id}
                className={`bg-white rounded-2xl border shadow-sm transition-all ${style.border}`}
              >
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl ${style.bg} flex items-center justify-center text-2xl flex-shrink-0`}>
                      {module.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
                          Level {module.level} • {module.levelLabel}
                        </span>
                      </div>
                      <h2 className="text-base font-bold text-gray-900">{module.title}</h2>
                      <p className="text-xs text-gray-500">{module.subtitle}</p>
                    </div>
                    <div className="text-right text-xs text-gray-400 flex-shrink-0">
                      <div>{module.lessons.length} レッスン</div>
                      <div>約 {totalMin} 分</div>
                    </div>
                  </div>

                  {/* レッスン一覧プレビュー */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mb-4">
                    {module.lessons.map((lesson, i) => (
                      <div key={lesson.id} className="flex items-center gap-2 text-xs text-gray-500">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`} />
                        <span>{lesson.title}</span>
                        <span className="ml-auto text-gray-400">{lesson.estimatedMinutes}分</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href={`/learn/${module.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition"
                  >
                    {module.icon} {module.title}を学ぶ →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-gray-400">
          ※ このコンテンツは学習・理解促進を目的としています。
          税務・会計の実務については税理士・公認会計士にご相談ください。
        </p>
      </div>
    </div>
  );
}
