'use client';

import { useEffect, useState } from 'react';
import { getTotalProgress, getModuleProgress, MODULES } from '@/lib/learnData';
import ProgressBar from './ProgressBar';

export default function LearnProgressSummary() {
  const [total, setTotal] = useState({ completed: 0, total: 0 });
  const [modProgress, setModProgress] = useState<{ completed: number; total: number }[]>([]);

  useEffect(() => {
    setTotal(getTotalProgress());
    setModProgress(MODULES.map((m) => getModuleProgress(m.id)));
  }, []);

  if (total.total === 0) return null;

  return (
    <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-[#E6EDF3]">全体の進捗</span>
        <span className="text-xs text-[#8B949E]">
          {total.completed}/{total.total} レッスン
        </span>
      </div>
      <ProgressBar completed={total.completed} total={total.total} showLabel={false} />
      <div className="grid grid-cols-3 gap-2 mt-3">
        {MODULES.map((m, i) => (
          <div key={m.id} className="text-center">
            <div className="text-xs text-[#8B949E] mb-1 truncate">{m.title}</div>
            <ProgressBar
              completed={modProgress[i]?.completed ?? 0}
              total={modProgress[i]?.total ?? m.lessons.length}
              color={i === 0 ? '#3FB950' : i === 1 ? '#58A6FF' : '#E3B341'}
              showLabel={false}
            />
            <div className="text-xs text-[#8B949E] mt-0.5">
              {modProgress[i]?.completed ?? 0}/{modProgress[i]?.total ?? m.lessons.length}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
