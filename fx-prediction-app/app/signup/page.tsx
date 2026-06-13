'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Plan = 'free' | 'premium';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [plan, setPlan] = useState<Plan>('free');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password || !confirm) {
      setError('全ての項目を入力してください。');
      return;
    }
    if (password !== confirm) {
      setError('パスワードが一致しません。');
      return;
    }
    if (password.length < 8) {
      setError('パスワードは8文字以上で設定してください。');
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
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-4xl mb-2">🪙</div>
            <h1 className="text-2xl font-bold text-[#E3B341]">新規登録</h1>
            <p className="text-sm text-[#8B949E] mt-1">無料でGOLD AI分析を始める</p>
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
                パスワード（8文字以上）
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none focus:border-[#58A6FF] transition"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="block text-sm text-[#8B949E] mb-1" htmlFor="confirm">
                パスワード（確認）
              </label>
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none focus:border-[#58A6FF] transition"
                autoComplete="new-password"
              />
            </div>

            {/* Plan selection */}
            <div>
              <p className="text-sm text-[#8B949E] mb-2">プランを選択</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPlan('free')}
                  className={`p-3 rounded-lg border text-left transition ${
                    plan === 'free'
                      ? 'border-[#58A6FF] bg-[#58A6FF]/10'
                      : 'border-[#30363D] hover:border-[#58A6FF]/50'
                  }`}
                >
                  <div className="font-semibold text-sm">Free</div>
                  <div className="text-xs text-[#8B949E] mt-0.5">無料 · 1日3回</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPlan('premium')}
                  className={`p-3 rounded-lg border text-left transition ${
                    plan === 'premium'
                      ? 'border-[#E3B341] bg-[#E3B341]/10'
                      : 'border-[#30363D] hover:border-[#E3B341]/50'
                  }`}
                >
                  <div className="font-semibold text-sm text-[#E3B341]">Premium</div>
                  <div className="text-xs text-[#8B949E] mt-0.5">¥2,980/月 · 無制限</div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E3B341] text-[#0D1117] font-bold py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? '登録中...' : '登録する'}
            </button>

            <p className="text-xs text-[#8B949E] text-center">
              登録することで
              <a href="/terms" className="text-[#58A6FF] hover:underline mx-1">利用規約</a>
              および
              <a href="/privacy" className="text-[#58A6FF] hover:underline mx-1">プライバシーポリシー</a>
              に同意したものとみなします。
            </p>
          </form>

          <p className="text-center text-sm text-[#8B949E] mt-4">
            既にアカウントをお持ちの方は{' '}
            <Link href="/login" className="text-[#58A6FF] hover:underline">
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
