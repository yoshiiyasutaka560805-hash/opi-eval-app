'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  findModule,
  findLesson,
  getAdjacentLessons,
  markLessonComplete,
  isLessonComplete,
} from '@/lib/learnData';
import LearnNav from '@/components/learn/LearnNav';
import LessonVisual from '@/components/learn/LessonVisual';
import QuizWidget from '@/components/learn/QuizWidget';

interface Props {
  params: Promise<{ moduleId: string; lessonId: string }>;
}

const LEVEL_COLORS: Record<number, { text: string; badge: string }> = {
  1: { text: 'text-[#3FB950]', badge: 'bg-[#3FB950]/20 text-[#3FB950]' },
  2: { text: 'text-[#58A6FF]', badge: 'bg-[#58A6FF]/20 text-[#58A6FF]' },
  3: { text: 'text-[#E3B341]', badge: 'bg-[#E3B341]/20 text-[#E3B341]' },
};

export default function LessonPage({ params }: Props) {
  const { moduleId, lessonId } = use(params);
  const module = findModule(moduleId);
  const lesson = findLesson(moduleId, lessonId);

  const [completed, setCompleted] = useState(false);
  const [quizDone, setQuizDone] = useState(false);

  useEffect(() => {
    if (lesson) setCompleted(isLessonComplete(lesson.id));
  }, [lesson]);

  if (!module || !lesson) notFound();

  const { prev, next } = getAdjacentLessons(moduleId, lessonId);
  const colors = LEVEL_COLORS[module.level];
  const lessonIndex = module.lessons.findIndex((l) => l.id === lessonId);

  function handleQuizComplete(score: number, total: number) {
    markLessonComplete(lesson!.id, score, total);
    setCompleted(true);
    setQuizDone(true);
  }

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3]">
      <LearnNav />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#8B949E] mb-5 flex-wrap">
          <Link href="/learn" className="hover:text-[#E6EDF3]">
            📚 会計学習
          </Link>
          <span>/</span>
          <Link href={`/learn/${moduleId}`} className="hover:text-[#E6EDF3]">
            {module.title}
          </Link>
          <span>/</span>
          <span className={colors.text}>{lesson.title}</span>
        </div>

        {/* Lesson header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>
              Level {module.level} • {module.levelLabel}
            </span>
            <span className="text-xs text-[#8B949E]">
              レッスン {lessonIndex + 1} / {module.lessons.length}
            </span>
            {completed && (
              <span className="text-xs bg-[#3FB950]/20 text-[#3FB950] px-2 py-0.5 rounded-full font-bold">
                ✓ 完了
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-[#E6EDF3] mb-1">{lesson.title}</h1>
          <p className="text-[#8B949E] text-sm">{lesson.description}</p>
          <div className="flex gap-3 mt-2 text-xs text-[#8B949E]">
            <span>⏱ 約 {lesson.estimatedMinutes} 分</span>
            <span>❓ {lesson.quiz.length} 問</span>
          </div>
        </div>

        {/* Progress bar for this module */}
        <div className="mb-6">
          <div className="flex gap-1">
            {module.lessons.map((l, i) => (
              <div
                key={l.id}
                className={`h-1 flex-1 rounded-full ${
                  i < lessonIndex
                    ? 'bg-[#3FB950]'
                    : i === lessonIndex
                    ? 'bg-[#E3B341]'
                    : 'bg-[#30363D]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Visual */}
        <div className="mb-6">
          <LessonVisual visual={lesson.visual} />
        </div>

        {/* Body text */}
        <div className="mb-6 space-y-3">
          {lesson.bodyText.map((para, i) => (
            <p key={i} className="text-[#E6EDF3] text-sm leading-relaxed">
              {para}
            </p>
          ))}
        </div>

        {/* Key concepts */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-[#E6EDF3] mb-3 flex items-center gap-2">
            <span>📌</span> 重要用語
          </h2>
          <div className="space-y-2">
            {lesson.keyConcepts.map((kc) => (
              <div
                key={kc.term}
                className="bg-[#161B22] border border-[#30363D] rounded-lg p-3"
              >
                <div className="font-bold text-sm text-[#E3B341] mb-1">{kc.term}</div>
                <div className="text-xs text-[#8B949E] leading-relaxed mb-1">
                  {kc.definition}
                </div>
                {kc.example && (
                  <div className="text-xs text-[#58A6FF] bg-[#58A6FF]/10 rounded px-2 py-1 mt-1">
                    例：{kc.example}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quiz */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-[#E6EDF3] mb-3 flex items-center gap-2">
            <span>❓</span> 理解度チェック
          </h2>
          <QuizWidget quiz={lesson.quiz} onComplete={handleQuizComplete} />
        </div>

        {/* Completion message */}
        {quizDone && next && (
          <div className="bg-[#3FB950]/10 border border-[#3FB950]/40 rounded-xl p-4 mb-4 text-center">
            <div className="text-[#3FB950] font-bold mb-2">🎉 レッスン完了！</div>
            <Link
              href={`/learn/${moduleId}/${next.id}`}
              className="inline-block px-6 py-2.5 bg-[#E3B341] text-[#0D1117] font-bold rounded-lg hover:opacity-90 transition text-sm"
            >
              次のレッスンへ：{next.title} →
            </Link>
          </div>
        )}

        {quizDone && !next && (
          <div className="bg-[#E3B341]/10 border border-[#E3B341]/40 rounded-xl p-4 mb-4 text-center">
            <div className="text-[#E3B341] font-bold mb-1">🏆 モジュール完了！</div>
            <p className="text-xs text-[#8B949E] mb-3">
              {module.title} の全レッスンを完了しました。
            </p>
            <Link
              href="/learn"
              className="inline-block px-6 py-2.5 bg-[#E3B341] text-[#0D1117] font-bold rounded-lg hover:opacity-90 transition text-sm"
            >
              学習ハブに戻る →
            </Link>
          </div>
        )}

        {/* Lesson navigation */}
        <div className="flex gap-3">
          {prev ? (
            <Link
              href={`/learn/${moduleId}/${prev.id}`}
              className="flex-1 py-2.5 px-3 bg-[#161B22] border border-[#30363D] hover:border-[#58A6FF]/50 rounded-lg text-center text-xs text-[#8B949E] hover:text-[#E6EDF3] transition-all"
            >
              ← {prev.title}
            </Link>
          ) : (
            <Link
              href={`/learn/${moduleId}`}
              className="flex-1 py-2.5 px-3 bg-[#161B22] border border-[#30363D] hover:border-[#58A6FF]/50 rounded-lg text-center text-xs text-[#8B949E] hover:text-[#E6EDF3] transition-all"
            >
              ← レッスン一覧
            </Link>
          )}
          {next && (
            <Link
              href={`/learn/${moduleId}/${next.id}`}
              className="flex-1 py-2.5 px-3 bg-[#161B22] border border-[#30363D] hover:border-[#58A6FF]/50 rounded-lg text-center text-xs text-[#8B949E] hover:text-[#E6EDF3] transition-all"
            >
              {next.title} →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
