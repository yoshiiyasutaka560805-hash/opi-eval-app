'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください。');
      return;
    }
    setLoading(true);
    // MVP: redirect to dashboard on any submit
    await new Promise((r) => setTimeout(r, 500));
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3] flex flex-col">
      <nav className="border-b border-[#30363D] px-4 py-3 flex items-center gap-4">
        <a href="/" className="text-[#E3B341] font-bold">🪙 GOLD AI</a>
        <div className="flex-1" />
        <a href="/dashboard" className="text-sm text-[#8B949E] hover:text-[#E6EDF3]">ダッシュボード</a>
        <a href="/history" className="text-sm text-[#8B949E] hover:text-[#E6EDF3]">予測履歴</a>
        <a href="/pricing" className="text-sm text-[#8B949E] hover:text-[#E6EDF3]">料金</a>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-4xl mb-2">🪙</div>
            <h1 className="text-2xl font-bold text-[#E3B341]">ログイン</h1>
            <p className="text-sm text-[#8B949E] mt-1">GOLD AI アカウントにサインイン</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 space-y-4"
          >
            {error && (
              <div className="bg-[#F85149]/10 border border-[#F85149]/30 text-[#F85149] text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm text-[#8B949E] mb-1" htmlFor="email">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none focus:border-[#58A6FF] transition"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm text-[#8B949E] mb-1" htmlFor="password">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none focus:border-[#58A6FF] transition"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E3B341] text-[#0D1117] font-bold py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>

          <p className="text-center text-sm text-[#8B949E] mt-4">
            アカウントをお持ちでない方は{' '}
            <Link href="/signup" className="text-[#58A6FF] hover:underline">
              新規登録
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
