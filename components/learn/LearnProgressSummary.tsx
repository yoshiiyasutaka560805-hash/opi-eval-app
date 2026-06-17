'use client';

import { useEffect, useState } from 'react';
import { getTotalProgress, getModuleProgress, MODULES } from '@/lib/learnData';

const MOD_COLORS = ['bg-green-500', 'bg-blue-500', 'bg-amber-500'];

export default function LearnProgressSummary() {
  const [total, setTotal] = useState({ completed: 0, total: 0 });
  const [modProgress, setModProgress] = useState<{ completed: number; total: number }[]>([]);

  useEffect(() => {
    setTotal(getTotalProgress());
    setModProgress(MODULES.map((m) => getModuleProgress(m.id)));
  }, []);

  if (total.total === 0) return null;

  const pct = Math.round((total.completed / total.total) * 100);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-gray-800">学習進捗</span>
        <span className="text-xs text-gray-500">
          {total.completed}/{total.total} レッスン完了
        </span>
      </div>

      {/* 全体バー */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-3 overflow-hidden">
        <div
          className="h-2 rounded-full bg-gray-900 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* モジュール別 */}
      <div className="grid grid-cols-3 gap-2">
        {MODULES.map((m, i) => {
          const mp = modProgress[i] ?? { completed: 0, total: m.lessons.length };
          const mpPct = Math.round((mp.completed / mp.total) * 100);
          return (
            <div key={m.id} className="text-center">
              <div className="text-lg mb-1">{m.icon}</div>
              <div className="text-xs text-gray-500 mb-1 truncate">{m.title}</div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full transition-all ${MOD_COLORS[i]}`}
                  style={{ width: `${mpPct}%` }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {mp.completed}/{mp.total}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
