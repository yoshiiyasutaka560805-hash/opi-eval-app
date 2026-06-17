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
    if (idx === q.correctIndex) {
      setScore((s) => s + 1);
    }
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
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 text-center space-y-4">
        <div className="text-4xl">{finalScore === quiz.length ? '🎉' : '📝'}</div>
        <div className="text-xl font-bold text-[#E6EDF3]">
          {finalScore}/{quiz.length} 問正解
        </div>
        <div className="text-[#8B949E] text-sm">
          {finalScore === quiz.length
            ? '全問正解！素晴らしいです。'
            : finalScore >= quiz.length / 2
            ? 'よくできました。復習してさらに定着させましょう。'
            : 'もう一度レッスンを読み直してみましょう。'}
        </div>
        <div className="inline-block bg-[#E3B341]/20 text-[#E3B341] rounded-full px-4 py-1 text-sm font-bold">
          レッスン完了 ✓
        </div>
      </div>
    );
  }

  const optionLabels = ['A', 'B', 'C', 'D'];

  function getOptionStyle(idx: number) {
    if (phase === 'answering') {
      return 'bg-[#21262D] border-[#30363D] hover:border-[#58A6FF] cursor-pointer';
    }
    if (idx === q.correctIndex) {
      return 'bg-[#3FB950]/20 border-[#3FB950]';
    }
    if (idx === selected && idx !== q.correctIndex) {
      return 'bg-[#F85149]/20 border-[#F85149]';
    }
    return 'bg-[#21262D] border-[#30363D] opacity-50';
  }

  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#8B949E]">
          クイズ {current + 1} / {quiz.length}
        </span>
        <div className="flex gap-1">
          {quiz.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < current
                  ? 'bg-[#3FB950]'
                  : i === current
                  ? 'bg-[#E3B341]'
                  : 'bg-[#30363D]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="text-[#E6EDF3] font-medium text-sm leading-relaxed">
        {q.question}
      </div>

      {/* Options */}
      <div className="space-y-2">
        {q.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left text-sm transition-all ${getOptionStyle(idx)}`}
          >
            <span
              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                phase === 'answered' && idx === q.correctIndex
                  ? 'bg-[#3FB950] border-[#3FB950] text-white'
                  : phase === 'answered' && idx === selected && idx !== q.correctIndex
                  ? 'bg-[#F85149] border-[#F85149] text-white'
                  : 'border-[#30363D] text-[#8B949E]'
              }`}
            >
              {optionLabels[idx]}
            </span>
            <span className="text-[#E6EDF3]">{opt}</span>
            {phase === 'answered' && idx === q.correctIndex && (
              <span className="ml-auto text-[#3FB950] text-xs font-bold">✓ 正解</span>
            )}
            {phase === 'answered' && idx === selected && idx !== q.correctIndex && (
              <span className="ml-auto text-[#F85149] text-xs font-bold">✗ 不正解</span>
            )}
          </button>
        ))}
      </div>

      {/* Explanation */}
      {phase === 'answered' && (
        <div className="bg-[#0D1117] rounded-lg p-3 border border-[#30363D]">
          <div className="text-xs font-bold text-[#E3B341] mb-1">解説</div>
          <div className="text-xs text-[#8B949E] leading-relaxed">{q.explanation}</div>
        </div>
      )}

      {/* Next button */}
      {phase === 'answered' && (
        <button
          onClick={handleNext}
          className="w-full py-2.5 bg-[#E3B341] text-[#0D1117] font-bold rounded-lg hover:opacity-90 transition text-sm"
        >
          {isLast ? '結果を見る →' : '次の問題 →'}
        </button>
      )}
    </div>
  );
}
