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

// ミニクイズ（1問版）
function MiniQuiz({
  question,
  options,
  correctIndex,
  explanation,
}: {
  question: string;
  options: readonly [string, string, string, string];
  correctIndex: number;
  explanation: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const labels = ['A', 'B', 'C', 'D'];

  return (
    <div className="my-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">🧠</span>
        <span className="text-sm font-bold text-blue-700">確認問題</span>
      </div>
      <p className="text-sm font-medium text-gray-800 mb-3">{question}</p>
      <div className="space-y-2">
        {options.map((opt, idx) => {
          let cls = 'border-gray-200 bg-white text-gray-700 hover:border-blue-400 cursor-pointer';
          if (answered) {
            if (idx === correctIndex) cls = 'border-green-400 bg-green-50 text-green-800';
            else if (idx === selected) cls = 'border-red-400 bg-red-50 text-red-800';
            else cls = 'border-gray-200 bg-white text-gray-400 opacity-60';
          }
          return (
            <button
              key={idx}
              onClick={() => !answered && setSelected(idx)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-sm transition-all ${cls}`}
            >
              <span className="font-bold w-5 flex-shrink-0">{labels[idx]}</span>
              <span>{opt}</span>
              {answered && idx === correctIndex && <span className="ml-auto text-green-600 font-bold">✓</span>}
              {answered && idx === selected && idx !== correctIndex && <span className="ml-auto text-red-500 font-bold">✗</span>}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="mt-3 text-xs text-gray-600 bg-white rounded-lg p-2 border border-gray-200">
          <span className="font-semibold text-blue-700">解説：</span>{explanation}
        </div>
      )}
    </div>
  );
}

// 用語カード
function ConceptCard({ term, definition, example }: { term: string; definition: string; example?: string }) {
  return (
    <div className="my-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-xl p-4">
      <div className="flex items-start gap-2">
        <span className="text-base mt-0.5">📌</span>
        <div>
          <div className="font-bold text-amber-800 text-sm mb-1">{term}</div>
          <div className="text-sm text-gray-700 leading-relaxed">{definition}</div>
          {example && (
            <div className="mt-1.5 text-xs text-amber-700 bg-amber-100 rounded px-2 py-1">
              例：{example}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const LEVEL_STYLES: Record<number, { badge: string; bar: string; accent: string }> = {
  1: { badge: 'bg-green-100 text-green-700', bar: 'bg-green-500', accent: 'text-green-600' },
  2: { badge: 'bg-blue-100 text-blue-700', bar: 'bg-blue-500', accent: 'text-blue-600' },
  3: { badge: 'bg-amber-100 text-amber-700', bar: 'bg-amber-500', accent: 'text-amber-600' },
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
  const style = LEVEL_STYLES[module.level];
  const lessonIndex = module.lessons.findIndex((l) => l.id === lessonId);

  function handleQuizComplete(score: number, total: number) {
    markLessonComplete(lesson!.id, score, total);
    setCompleted(true);
    setQuizDone(true);
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <LearnNav />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-5 flex-wrap">
          <Link href="/learn" className="hover:text-blue-600">📚 会計スタート</Link>
          <span>/</span>
          <Link href={`/learn/${moduleId}`} className="hover:text-blue-600">{module.title}</Link>
          <span>/</span>
          <span className="text-gray-700">{lesson.title}</span>
        </div>

        {/* Lesson header */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
              Level {module.level} • {module.levelLabel}
            </span>
            <span className="text-xs text-gray-400">
              レッスン {lessonIndex + 1} / {module.lessons.length}
            </span>
            {completed && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold ml-auto">
                ✓ 完了
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="flex gap-1 mb-4">
            {module.lessons.map((l, i) => (
              <div
                key={l.id}
                className={`h-1.5 flex-1 rounded-full ${
                  i < lessonIndex ? style.bar : i === lessonIndex ? `${style.bar} opacity-60` : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-1">{lesson.title}</h1>
          <p className="text-sm text-gray-500">{lesson.description}</p>
          <div className="flex gap-3 mt-2 text-xs text-gray-400">
            <span>⏱ 約 {lesson.estimatedMinutes} 分</span>
            <span>❓ {lesson.quiz.length} 問</span>
          </div>
        </div>

        {/* ── メインコンテンツ：段落ごとに図解・用語・クイズを挟む ── */}
        <div className="space-y-0">
          {lesson.sections.map((section, i) => (
            <div key={i}>
              {/* 本文段落 */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-3">
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                  {section.text}
                </p>
              </div>

              {/* 図解（段落の直後） */}
              {section.visual && (
                <div className="mb-3">
                  <LessonVisual visual={section.visual} />
                </div>
              )}

              {/* 用語カード（段落の直後） */}
              {section.concept && (
                <div className="mb-3">
                  <ConceptCard {...section.concept} />
                </div>
              )}

              {/* ミニクイズ（段落の直後） */}
              {section.miniQuiz && (
                <div className="mb-3">
                  <MiniQuiz
                    question={section.miniQuiz.question}
                    options={section.miniQuiz.options}
                    correctIndex={section.miniQuiz.correctIndex}
                    explanation={section.miniQuiz.explanation}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── まとめ用語一覧 ── */}
        {lesson.keyConcepts.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6 mt-3">
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>📖</span> このレッスンの重要用語まとめ
            </h2>
            <div className="space-y-2">
              {lesson.keyConcepts.map((kc) => (
                <div key={kc.term} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                  <div className={`font-bold text-sm mb-0.5 ${style.accent}`}>{kc.term}</div>
                  <div className="text-xs text-gray-600 leading-relaxed">{kc.definition}</div>
                  {kc.example && (
                    <div className="text-xs text-blue-600 mt-1 bg-blue-50 rounded px-2 py-0.5">
                      例：{kc.example}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 理解度チェック（末尾クイズ） ── */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">✏️</span>
            <h2 className="text-sm font-bold text-gray-900">理解度チェック</h2>
          </div>
          <QuizWidget quiz={lesson.quiz} onComplete={handleQuizComplete} />
        </div>

        {/* ── 完了メッセージ ── */}
        {quizDone && next && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-4 text-center">
            <div className="text-green-700 font-bold text-base mb-1">🎉 レッスン完了！</div>
            <p className="text-xs text-gray-500 mb-3">次のレッスンに進みましょう</p>
            <Link
              href={`/learn/${moduleId}/${next.id}`}
              className="inline-block px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition text-sm"
            >
              {next.title} →
            </Link>
          </div>
        )}

        {quizDone && !next && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-4 text-center">
            <div className="text-amber-700 font-bold text-base mb-1">🏆 モジュール完了！</div>
            <p className="text-xs text-gray-500 mb-3">{module.title} の全レッスンを修了しました</p>
            <Link
              href="/learn"
              className="inline-block px-6 py-2.5 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition text-sm"
            >
              学習ハブに戻る →
            </Link>
          </div>
        )}

        {/* ── ナビゲーション ── */}
        <div className="flex gap-3">
          {prev ? (
            <Link
              href={`/learn/${moduleId}/${prev.id}`}
              className="flex-1 py-2.5 px-3 bg-white border border-gray-200 hover:border-blue-300 rounded-xl text-center text-xs text-gray-500 hover:text-blue-600 transition-all shadow-sm"
            >
              ← {prev.title}
            </Link>
          ) : (
            <Link
              href={`/learn/${moduleId}`}
              className="flex-1 py-2.5 px-3 bg-white border border-gray-200 hover:border-blue-300 rounded-xl text-center text-xs text-gray-500 hover:text-blue-600 transition-all shadow-sm"
            >
              ← レッスン一覧
            </Link>
          )}
          {next && (
            <Link
              href={`/learn/${moduleId}/${next.id}`}
              className="flex-1 py-2.5 px-3 bg-white border border-gray-200 hover:border-blue-300 rounded-xl text-center text-xs text-gray-500 hover:text-blue-600 transition-all shadow-sm"
            >
              {next.title} →
            </Link>
          )}
        </div>

        <div className="mt-8 text-center text-xs text-gray-400">
          ※ このコンテンツは学習目的です。税務・会計の実務は税理士にご相談ください。
        </div>
      </div>
    </div>
  );
}
