import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GOLD AI - XAU/USD プロ予測',
  description: 'AIによるGOLD（XAU/USD）テクニカル分析情報提供ツール',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="dark">
      <body className="bg-[#0D1117] text-[#E6EDF3] min-h-screen">{children}</body>
    </html>
  );
}
