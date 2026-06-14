'use client';
import { useState, useEffect } from 'react';
import type { Timeframe } from '@/types';

const TIMEFRAMES: { value: Timeframe; label: string }[] = [
  { value: '5min', label: '5分足' },
  { value: '15min', label: '15分足' },
  { value: '30min', label: '30分足' },
  { value: '1h', label: '1時間足' },
  { value: '4h', label: '4時間足' },
  { value: 'daily', label: '日足' },
];

const INTERVALS = [
  { value: '15', label: '15分' },
  { value: '30', label: '30分' },
  { value: '60', label: '1時間' },
  { value: 'off', label: 'OFF' },
] as const;

interface Settings {
  notificationsEnabled: boolean;
  notificationThreshold: number;
  autoCheckInterval: string;
  defaultTimeframe: Timeframe;
}

const DEFAULT_SETTINGS: Settings = {
  notificationsEnabled: false,
  notificationThreshold: 70,
  autoCheckInterval: '30',
  defaultTimeframe: '4h',
};

const STORAGE_KEY = 'gold-ai-settings';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [quotaUsed] = useState(7); // demo value
  const quotaLimit = 25;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSettings(JSON.parse(stored) as Settings);
    } catch {
      // ignore
    }
  }, []);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#E6EDF3]">
      <nav className="border-b border-[#30363D] px-4 py-3 flex items-center gap-4">
        <a href="/dashboard" className="text-[#E3B341] font-bold">🪙 GOLD AI</a>
        <div className="flex-1" />
        <a href="/dashboard" className="text-sm text-[#8B949E] hover:text-[#E6EDF3]">ダッシュボード</a>
        <a href="/history" className="text-sm text-[#8B949E] hover:text-[#E6EDF3]">予測履歴</a>
        <a href="/pricing" className="text-sm text-[#8B949E] hover:text-[#E6EDF3]">料金</a>
      </nav>

      <main className="max-w-xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold">設定</h1>

        {/* Notification settings */}
        <section className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 space-y-5">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span>🔔</span> 通知設定
          </h2>

          {/* Enable toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">ブラウザ通知を有効にする</p>
              <p className="text-xs text-[#8B949E] mt-0.5">シグナル発生時にプッシュ通知を受け取る</p>
            </div>
            <button
              onClick={() => update('notificationsEnabled', !settings.notificationsEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.notificationsEnabled ? 'bg-[#3FB950]' : 'bg-[#30363D]'
              }`}
              aria-pressed={settings.notificationsEnabled}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.notificationsEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Threshold slider */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[#8B949E]">通知閾値（信頼度）</span>
              <span className="text-[#E3B341] font-bold">{settings.notificationThreshold}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={90}
              step={5}
              value={settings.notificationThreshold}
              onChange={(e) => update('notificationThreshold', Number(e.target.value))}
              disabled={!settings.notificationsEnabled}
              className="w-full accent-[#E3B341] disabled:opacity-40"
            />
            <div className="flex justify-between text-xs text-[#8B949E] mt-1">
              <span>50%</span>
              <span>90%</span>
            </div>
          </div>

          {/* Auto-check interval */}
          <div>
            <p className="text-sm text-[#8B949E] mb-2">自動チェック間隔</p>
            <div className="grid grid-cols-4 gap-2">
              {INTERVALS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => update('autoCheckInterval', value)}
                  disabled={!settings.notificationsEnabled}
                  className={`py-1.5 rounded-lg text-sm border transition disabled:opacity-40 ${
                    settings.autoCheckInterval === value
                      ? 'border-[#58A6FF] bg-[#58A6FF]/10 text-[#58A6FF]'
                      : 'border-[#30363D] text-[#8B949E] hover:border-[#58A6FF]/50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Display settings */}
        <section className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span>🖥️</span> 表示設定
          </h2>
          <div>
            <p className="text-sm text-[#8B949E] mb-2">デフォルト時間足</p>
            <div className="grid grid-cols-3 gap-2">
              {TIMEFRAMES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => update('defaultTimeframe', value)}
                  className={`py-2 rounded-lg text-sm border transition ${
                    settings.defaultTimeframe === value
                      ? 'border-[#E3B341] bg-[#E3B341]/10 text-[#E3B341]'
                      : 'border-[#30363D] text-[#8B949E] hover:border-[#E3B341]/50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* API quota */}
        <section className="bg-[#161B22] border border-[#30363D] rounded-xl p-5">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <span>📊</span> API使用状況
          </h2>
          <p className="text-sm text-[#8B949E] mb-2">
            本日 <span className="text-[#E6EDF3] font-bold">{quotaUsed}</span> /{' '}
            <span className="text-[#E6EDF3] font-bold">{quotaLimit}</span> リクエスト使用
          </p>
          <div className="w-full bg-[#0D1117] rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${(quotaUsed / quotaLimit) * 100}%`,
                backgroundColor: quotaUsed / quotaLimit > 0.8 ? '#F85149' : '#3FB950',
              }}
            />
          </div>
          <p className="text-xs text-[#8B949E] mt-2">
            残り {quotaLimit - quotaUsed} 回。上限はJSTの午前0時にリセットされます。
          </p>
        </section>

        {/* Save button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-[#E3B341] text-[#0D1117] font-bold rounded-lg hover:opacity-90 transition"
          >
            設定を保存
          </button>
          {saved && (
            <span className="text-sm text-[#3FB950]">✓ 保存しました</span>
          )}
        </div>
      </main>
    </div>
  );
}
