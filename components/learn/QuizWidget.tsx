'use client';

import { useState } from 'react';
import { QuizQuestion } from '@/lib/learnData';

interface Props {
  quiz: QuizQuestion[];
  onComplete: (score: number, total: number) => void;
}

type Phase = 'answering' | 'answered' | 'done';

export default function QuizWidget({ quiz, onComplete }: Props) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>('answering');
  const [score, setScore] = useState(0);

  const q = quiz[current];
  const isLast = current === quiz.length - 1;

  function handleSelect(idx: number) {
    if (phase !== 'answering') return;
    setSelected(idx);
    setPhase('answered');
    if (idx === q.correctIndex) setScore((s) => s + 1);
  }

  function handleNext() {
    if (isLast) {
      const finalScore = selected === q.correctIndex ? score : score;
      onComplete(finalScore, quiz.length);
      setPhase('done');
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setPhase('answering');
    }
  }

  if (phase === 'done') {
    const finalScore =
      selected !== null && selected === quiz[quiz.length - 1].correctIndex ? score : score;
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm space-y-3">
        <div className="text-4xl">{finalScore === quiz.length ? '🎉' : '📝'}</div>
        <div className="text-xl font-bold text-gray-900">{finalScore}/{quiz.length} 問正解</div>
        <div className="text-sm text-gray-500">
          {finalScore === quiz.length
            ? '全問正解！素晴らしいです。'
            : finalScore >= quiz.length / 2
            ? 'よくできました。復習してさらに定着させましょう。'
            : 'もう一度レッスンを読み直してみましょう。'}
        </div>
        <div className="inline-block bg-green-100 text-green-700 rounded-full px-4 py-1 text-sm font-bold">
          レッスン完了 ✓
        </div>
      </div>
    );
  }

  const labels = ['A', 'B', 'C', 'D'];

  function optionCls(idx: number) {
    if (phase === 'answering') {
      return 'border-gray-200 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50 cursor-pointer';
    }
    if (idx === q.correctIndex) return 'border-green-400 bg-green-50 text-green-800';
    if (idx === selected) return 'border-red-400 bg-red-50 text-red-800';
    return 'border-gray-200 bg-white text-gray-400 opacity-50';
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400">
          問 {current + 1} / {quiz.length}
        </span>
        <div className="flex gap-1">
          {quiz.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < current ? 'bg-green-400' : i === current ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 問題文 */}
      <p className="text-sm font-medium text-gray-800 leading-relaxed">{q.question}</p>

      {/* 選択肢 */}
      <div className="space-y-2">
        {q.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left text-sm transition-all ${optionCls(idx)}`}
          >
            <span
              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                phase === 'answered' && idx === q.correctIndex
                  ? 'bg-green-500 border-green-500 text-white'
                  : phase === 'answered' && idx === selected && idx !== q.correctIndex
                  ? 'bg-red-500 border-red-500 text-white'
                  : 'border-gray-300 text-gray-500'
              }`}
            >
              {labels[idx]}
            </span>
            <span className="flex-1">{opt}</span>
            {phase === 'answered' && idx === q.correctIndex && (
              <span className="text-green-600 text-xs font-bold">✓ 正解</span>
            )}
            {phase === 'answered' && idx === selected && idx !== q.correctIndex && (
              <span className="text-red-500 text-xs font-bold">✗</span>
            )}
          </button>
        ))}
      </div>

      {/* 解説 */}
      {phase === 'answered' && (
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <div className="text-xs font-bold text-blue-600 mb-1">解説</div>
          <div className="text-xs text-gray-600 leading-relaxed">{q.explanation}</div>
        </div>
      )}

      {/* 次へボタン */}
      {phase === 'answered' && (
        <button
          onClick={handleNext}
          className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition text-sm"
        >
          {isLast ? '結果を見る →' : '次の問題 →'}
        </button>
      )}
    </div>
  );
}
