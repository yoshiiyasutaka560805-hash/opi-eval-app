import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MODULES, findModule } from '@/lib/learnData';
import LearnNav from '@/components/learn/LearnNav';

interface Props {
  params: Promise<{ moduleId: string }>;
}

const LEVEL_COLORS: Record<number, { text: string; badge: string; bg: string }> = {
  1: { text: 'text-[#3FB950]', badge: 'bg-[#3FB950]/20 text-[#3FB950]', bg: 'bg-[#3FB950]/10' },
  2: { text: 'text-[#58A6FF]', badge: 'bg-[#58A6FF]/20 text-[#58A6FF]', bg: 'bg-[#58A6FF]/10' },
  3: { text: 'text-[#E3B341]', badge: 'bg-[#E3B341]/20 text-[#E3B341]', bg: 'bg-[#E3B341]/10' },
};

export default async function ModulePage({ params }: Props) {
  const { moduleId } = await params;
  const module = findModule(moduleId);
  if (!module) notFound();

  const colors = LEVEL_COLORS[module.level];
  const totalMinutes = module.lessons.reduce((s, l) => s + l.estimatedMinutes, 0);
  const allModuleIds = MODULES.map((m) => m.id);
  const currentIdx = allModuleIds.indexOf(moduleId);
  const prevModule = currentIdx > 0 ? MODULES[currentIdx - 1] : null;
  const nextModule = currentIdx < MODULES.length - 1 ? MODULES[currentIdx + 1] : null;

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3]">
      <LearnNav />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#8B949E] mb-6">
          <Link href="/learn" className="hover:text-[#E6EDF3]">
            📚 会計学習
          </Link>
          <span>/</span>
          <span className={colors.text}>{module.title}</span>
        </div>

        {/* Module Header */}
        <div className="mb-6">
          <div className="flex items-start gap-4 mb-4">
            <span className="text-5xl">{module.icon}</span>
            <div>
              <div className="mb-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>
                  Level {module.level} • {module.levelLabel}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-[#E6EDF3] mb-1">{module.title}</h1>
              <p className="text-[#8B949E] text-sm">{module.subtitle}</p>
            </div>
          </div>
          <div className="flex gap-4 text-xs text-[#8B949E]">
            <span>📖 {module.lessons.length} レッスン</span>
            <span>⏱ 約 {totalMinutes} 分</span>
          </div>
        </div>

        {/* Lessons */}
        <div className="space-y-3 mb-8">
          <h2 className="text-sm font-bold text-[#8B949E] uppercase tracking-wider mb-4">
            レッスン一覧
          </h2>
          {module.lessons.map((lesson, i) => (
            <Link
              key={lesson.id}
              href={`/learn/${moduleId}/${lesson.id}`}
              className="block bg-[#161B22] border border-[#30363D] hover:border-[#58A6FF]/50 rounded-xl p-4 transition-all group"
            >
              <div className="flex items-start gap-3">
                {/* Lesson number */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${colors.bg} ${colors.text}`}
                >
                  {i + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-[#E6EDF3] group-hover:text-[#58A6FF] transition-colors text-sm">
                      {lesson.title}
                    </h3>
                    <span className="text-xs text-[#8B949E] flex-shrink-0">
                      {lesson.estimatedMinutes}分
                    </span>
                  </div>
                  <p className="text-xs text-[#8B949E] mt-0.5">{lesson.description}</p>

                  {/* Key concept pills */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {lesson.keyConcepts.slice(0, 3).map((kc) => (
                      <span
                        key={kc.term}
                        className="text-xs bg-[#21262D] text-[#8B949E] rounded px-1.5 py-0.5"
                      >
                        {kc.term.split('（')[0]}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex-shrink-0 text-[#8B949E] group-hover:text-[#58A6FF] transition-colors">
                  →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Start button */}
        <Link
          href={`/learn/${moduleId}/${module.lessons[0].id}`}
          className="block w-full text-center py-3 bg-[#E3B341] text-[#0D1117] font-bold rounded-xl hover:opacity-90 transition mb-6"
        >
          {module.icon} このモジュールを始める
        </Link>

        {/* Module navigation */}
        <div className="flex gap-3">
          {prevModule && (
            <Link
              href={`/learn/${prevModule.id}`}
              className="flex-1 py-2 px-3 bg-[#161B22] border border-[#30363D] hover:border-[#58A6FF]/50 rounded-lg text-center text-xs text-[#8B949E] hover:text-[#E6EDF3] transition-all"
            >
              ← {prevModule.title}
            </Link>
          )}
          <Link
            href="/learn"
            className="flex-1 py-2 px-3 bg-[#161B22] border border-[#30363D] hover:border-[#58A6FF]/50 rounded-lg text-center text-xs text-[#8B949E] hover:text-[#E6EDF3] transition-all"
          >
            📚 一覧に戻る
          </Link>
          {nextModule && (
            <Link
              href={`/learn/${nextModule.id}`}
              className="flex-1 py-2 px-3 bg-[#161B22] border border-[#30363D] hover:border-[#58A6FF]/50 rounded-lg text-center text-xs text-[#8B949E] hover:text-[#E6EDF3] transition-all"
            >
              {nextModule.title} →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
