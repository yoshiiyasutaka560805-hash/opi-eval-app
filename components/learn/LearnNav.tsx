'use client';

import { usePathname } from 'next/navigation';

export default function LearnNav() {
  const pathname = usePathname();
  const isLearn = pathname.startsWith('/learn');

  return (
    <nav className="border-b border-[#30363D] px-4 py-3 flex items-center gap-4">
      <a href="/dashboard" className="text-[#E3B341] font-bold">
        🪙 GOLD AI
      </a>
      <div className="flex-1" />
      <a href="/dashboard" className="text-sm text-[#8B949E] hover:text-[#E6EDF3]">
        ダッシュボード
      </a>
      <a href="/history" className="text-sm text-[#8B949E] hover:text-[#E6EDF3]">
        予測履歴
      </a>
      <a href="/pricing" className="text-sm text-[#8B949E] hover:text-[#E6EDF3]">
        料金
      </a>
      <a
        href="/learn"
        className={`text-sm font-medium transition-colors ${
          isLearn ? 'text-[#E3B341]' : 'text-[#8B949E] hover:text-[#E6EDF3]'
        }`}
      >
        📚 会計学習
      </a>
    </nav>
  );
}
