import Link from 'next/link';
import { MODULES } from '@/lib/learnData';
import LearnNav from '@/components/learn/LearnNav';
import LearnProgressSummary from '@/components/learn/LearnProgressSummary';

const LEVEL_STYLES: Record<
  number,
  { badge: string; border: string; icon: string }
> = {
  1: {
    badge: 'bg-[#3FB950]/20 text-[#3FB950] border border-[#3FB950]/30',
    border: 'border-[#3FB950]/30 hover:border-[#3FB950]/70',
    icon: '🟢',
  },
  2: {
    badge: 'bg-[#58A6FF]/20 text-[#58A6FF] border border-[#58A6FF]/30',
    border: 'border-[#58A6FF]/30 hover:border-[#58A6FF]/70',
    icon: '🔵',
  },
  3: {
    badge: 'bg-[#E3B341]/20 text-[#E3B341] border border-[#E3B341]/30',
    border: 'border-[#E3B341]/30 hover:border-[#E3B341]/70',
    icon: '🟡',
  },
};

export default function LearnPage() {
  const totalLessons = MODULES.reduce((s, m) => s + m.lessons.length, 0);
  const totalMinutes = MODULES.reduce(
    (s, m) => s + m.lessons.reduce((ss, l) => ss + l.estimatedMinutes, 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3]">
      <LearnNav />

      {/* Hero */}
      <section className="text-center py-12 px-4">
        <div className="inline-block text-5xl mb-4">📚</div>
        <h1 className="text-3xl md:text-4xl font-bold text-[#E6EDF3] mb-3">
          会計を学ぼう
        </h1>
        <p className="text-[#8B949E] max-w-xl mx-auto mb-2">
          初めて会社を立てた経営者のための、決算に向けた会計学習プログラム
        </p>
        <div className="flex justify-center gap-4 text-xs text-[#8B949E] mt-3">
          <span>📖 {totalLessons} レッスン</span>
          <span>⏱ 約 {totalMinutes} 分</span>
          <span>🎯 超基礎〜決算・税務</span>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 pb-16">
        {/* Progress Summary（クライアントアイランド） */}
        <LearnProgressSummary />

        {/* Learning path hint */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 mb-6 flex items-start gap-3">
          <span className="text-xl mt-0.5">💡</span>
          <div>
            <div className="text-sm font-semibold text-[#E6EDF3] mb-1">学習の進め方</div>
            <div className="text-xs text-[#8B949E] leading-relaxed">
              レベル1「超基礎」から順番に進めることをおすすめします。
              各レッスンには図解・用語解説・クイズがあり、視覚的に学べます。
              決算前に最低でもレベル1・2を完了することを目標にしましょう。
            </div>
          </div>
        </div>

        {/* Modules */}
        <div className="space-y-4">
          {MODULES.map((module) => {
            const style = LEVEL_STYLES[module.level];
            const totalMin = module.lessons.reduce((s, l) => s + l.estimatedMinutes, 0);

            return (
              <div
                key={module.id}
                className={`bg-[#161B22] border rounded-xl overflow-hidden transition-all ${style.border}`}
              >
                {/* Module Header */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{module.icon}</span>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.badge}`}
                          >
                            Level {module.level} • {module.levelLabel}
                          </span>
                        </div>
                        <h2 className="text-lg font-bold text-[#E6EDF3]">{module.title}</h2>
                        <p className="text-xs text-[#8B949E]">{module.subtitle}</p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-[#8B949E] flex-shrink-0">
                      <div>{module.lessons.length} レッスン</div>
                      <div>約 {totalMin} 分</div>
                    </div>
                  </div>

                  {/* Lesson list preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-4">
                    {module.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-2 text-xs text-[#8B949E]"
                      >
                        <span className="text-[#30363D]">•</span>
                        <span>{lesson.title}</span>
                        <span className="ml-auto text-[#30363D]">{lesson.estimatedMinutes}分</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href={`/learn/${module.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] rounded-lg text-sm font-medium text-[#E6EDF3] transition-colors"
                  >
                    {module.icon} {module.title}を学ぶ →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="mt-8 text-center text-xs text-[#8B949E] leading-relaxed">
          <p>
            ※ このコンテンツは学習・理解促進を目的としています。
            税務・会計の実務については税理士・公認会計士にご相談ください。
          </p>
        </div>
      </div>
    </div>
  );
}
