import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MODULES, findModule } from '@/lib/learnData';
import LearnNav from '@/components/learn/LearnNav';

interface Props {
  params: Promise<{ moduleId: string }>;
}

const LEVEL_STYLES: Record<number, { badge: string; bar: string; accent: string; bg: string; border: string }> = {
  1: { badge: 'bg-green-100 text-green-700', bar: 'bg-green-500', accent: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  2: { badge: 'bg-blue-100 text-blue-700', bar: 'bg-blue-500', accent: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  3: { badge: 'bg-amber-100 text-amber-700', bar: 'bg-amber-500', accent: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
};

export default async function ModulePage({ params }: Props) {
  const { moduleId } = await params;
  const module = findModule(moduleId);
  if (!module) notFound();

  const style = LEVEL_STYLES[module.level];
  const totalMinutes = module.lessons.reduce((s, l) => s + l.estimatedMinutes, 0);
  const allModuleIds = MODULES.map((m) => m.id);
  const currentIdx = allModuleIds.indexOf(moduleId);
  const prevModule = currentIdx > 0 ? MODULES[currentIdx - 1] : null;
  const nextModule = currentIdx < MODULES.length - 1 ? MODULES[currentIdx + 1] : null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <LearnNav />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link href="/learn" className="hover:text-blue-600">📚 会計スタート</Link>
          <span>/</span>
          <span className="text-gray-700">{module.title}</span>
        </div>

        {/* Module header */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-xl ${style.bg} flex items-center justify-center text-3xl flex-shrink-0`}>
              {module.icon}
            </div>
            <div className="flex-1">
              <div className="mb-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
                  Level {module.level} • {module.levelLabel}
                </span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">{module.title}</h1>
              <p className="text-sm text-gray-500">{module.subtitle}</p>
              <div className="flex gap-4 text-xs text-gray-400 mt-2">
                <span>📖 {module.lessons.length} レッスン</span>
                <span>⏱ 約 {totalMinutes} 分</span>
              </div>
            </div>
          </div>
        </div>

        {/* レッスン一覧 */}
        <div className="space-y-2 mb-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">レッスン一覧</h2>
          {module.lessons.map((lesson, i) => (
            <Link
              key={lesson.id}
              href={`/learn/${moduleId}/${lesson.id}`}
              className="block bg-white border border-gray-200 hover:border-blue-300 rounded-2xl p-4 transition-all group shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${style.bg} ${style.accent}`}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm">
                      {lesson.title}
                    </h3>
                    <span className="text-xs text-gray-400 flex-shrink-0">{lesson.estimatedMinutes}分</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{lesson.description}</p>
                  {/* 用語プレビュー */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {lesson.keyConcepts.slice(0, 3).map((kc) => (
                      <span key={kc.term} className="text-xs bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">
                        {kc.term.split('（')[0]}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-gray-300 group-hover:text-blue-400 transition-colors flex-shrink-0">→</span>
              </div>
            </Link>
          ))}
        </div>

        {/* 開始ボタン */}
        <Link
          href={`/learn/${moduleId}/${module.lessons[0].id}`}
          className="block w-full text-center py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-700 transition mb-6 text-sm"
        >
          {module.icon} 最初のレッスンを始める →
        </Link>

        {/* モジュールナビ */}
        <div className="flex gap-3">
          {prevModule && (
            <Link
              href={`/learn/${prevModule.id}`}
              className="flex-1 py-2.5 px-3 bg-white border border-gray-200 hover:border-blue-300 rounded-xl text-center text-xs text-gray-500 hover:text-blue-600 transition-all shadow-sm"
            >
              ← {prevModule.title}
            </Link>
          )}
          <Link
            href="/learn"
            className="flex-1 py-2.5 px-3 bg-white border border-gray-200 hover:border-blue-300 rounded-xl text-center text-xs text-gray-500 hover:text-blue-600 transition-all shadow-sm"
          >
            📚 一覧に戻る
          </Link>
          {nextModule && (
            <Link
              href={`/learn/${nextModule.id}`}
              className="flex-1 py-2.5 px-3 bg-white border border-gray-200 hover:border-blue-300 rounded-xl text-center text-xs text-gray-500 hover:text-blue-600 transition-all shadow-sm"
            >
              {nextModule.title} →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
