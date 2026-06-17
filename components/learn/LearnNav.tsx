'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function LearnNav() {
  const pathname = usePathname();

  const links = [
    { href: '/learn', label: 'ホーム' },
    { href: '/learn/module-1', label: '超基礎' },
    { href: '/learn/module-2', label: '財務諸表' },
    { href: '/learn/module-3', label: '決算・税務' },
  ];

  return (
    <nav className="border-b border-[#E2E8F0] bg-white px-4 py-3 flex items-center gap-6">
      <Link href="/learn" className="flex items-center gap-2 font-bold text-[#1A56DB] text-lg">
        <span className="text-2xl">📊</span>
        <span>会計スタート</span>
      </Link>
      <div className="flex-1" />
      <div className="flex items-center gap-1">
        {links.map((l) => {
          const active =
            l.href === '/learn'
              ? pathname === '/learn'
              : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                active
                  ? 'bg-[#1A56DB]/10 text-[#1A56DB] font-semibold'
                  : 'text-[#6B7280] hover:text-[#1A56DB] hover:bg-[#1A56DB]/5'
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
