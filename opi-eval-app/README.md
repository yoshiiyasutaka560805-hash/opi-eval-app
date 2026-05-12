# 外国人介護人材 採用支援AI評価アプリ

特定技能・介護ビザ面接の**日本語能力評価を自動化**するAIアプリです。

## 特徴

### 🎯 安全性最優先の評価
- 流暢さではなく「指示理解」「報告精度」「安全意識」を最優先に評価
- 重大リスクフラグ（確認行動なし、緊急対応語彙なし）の自動検出
- 外国人特有の言語特性（母語干渉、代替表現）に対応した採点

### ⚡ 自動採点システム
- Claude AIが面接文字起こしを30〜60秒で採点
- 10のルールに基づくハルシネーション対策
- スコア根拠を直接引用して表示

### 📊 採用判定の根拠を提供
- 採用推奨/条件付き採用/見送りを自動判定
- 条件付き採用時は具体的な推奨アクションを提示
- 面接官の印象スコア（0〜20点）を加算

### 👥 面接と評価をセットで提供
- 面接質問ガイド（4つの必須質問）
- 各質問の採点基準を明示
- ガイド印刷対応

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **AI**: Claude API (`claude-sonnet-4-6`) with prompt caching
- **データベース**: Supabase (PostgreSQL)
- **スタイリング**: Tailwind CSS 4
- **グラフ**: Recharts（将来実装）
- **PDF**: @react-pdf/renderer（将来実装）

## セットアップ

詳しくは [SETUP.md](./SETUP.md) を参照してください。

### クイックスタート

```bash
# 1. 依存パッケージをインストール
npm install

# 2. .env.local.exampleをコピーして設定
cp .env.local.example .env.local
# 必須: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, ANTHROPIC_API_KEY

# 3. Supabaseでテーブルを作成
# supabase/migrations/001_create_tables.sql をSupabaseダッシュボードで実行

# 4. 開発サーバーを起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 使い方

### 1. 面接質問ガイドを確認
[/interview-guide](/interview-guide) で4つの必須質問を確認します。

### 2. 新規評価を作成
[/evaluations/new](/evaluations/new) から面接の文字起こしをアップロードします。

### 3. AI採点を実行
Claude APIが自動採点を行い、結果ページに遷移します。

### 4. 面接官が感性スコアを入力
第一印象スコア（0〜20点）を入力して最終スコアを確定します。

## 評価軸

### 現場安全能力（80点内部）
- 指示理解力
- 情報整理・報告精度
- 緊急・安全対応
- 申し送り・確認行動

### 言語能力（40点内部）
- 語彙・文法
- 談話構成
- ※言語足切りライン: 12点未満は採用推奨から除外

### 介護適性（20点内部）
- コミュニケーション適性
- ストレス耐性・継続意欲
- 安全意識
- 日本文化への適応

### 面接官感性評価（20点）
- 第一印象スコアを0〜20点で入力

### 合否判定（100点スケール）
- **採用推奨 🟢**: 80点以上 かつ 現場安全50点以上
- **条件付き採用 🟡**: 60〜79点 かつ 現場安全38点以上
- **再評価・見送り 🔴**: 60点未満 または 重大リスクフラグ

## ファイル構成

```
opi-eval-app/
├── app/
│   ├── page.tsx                      # ホームページ
│   ├── interview-guide/page.tsx       # 面接質問ガイド
│   ├── evaluations/
│   │   ├── new/page.tsx              # 評価フォーム
│   │   └── [id]/page.tsx             # 結果詳細ページ
│   ├── clients/page.tsx              # 施設管理（今後実装）
│   ├── candidates/page.tsx           # 受験者管理（今後実装）
│   └── api/
│       └── evaluations/
│           ├── route.ts              # POST: 新規評価作成
│           └── [id]/route.ts         # GET/PATCH: 評価取得・更新
├── lib/
│   ├── supabase.ts                   # Supabase CRUD
│   ├── evaluate.ts                   # Claude API呼び出し
│   └── verdict.ts                    # スコア計算・判定ロジック
├── types/
│   └── index.ts                      # TypeScript型定義
├── data/
│   └── interview-questions.ts        # 面接質問データ
└── supabase/
    └── migrations/
        └── 001_create_tables.sql     # DB スキーマ
```

## 実装ロードマップ

### ✅ Phase 1: 基本的な採点機能（実装済）
- 文字起こし入力 → AI採点 → 採用判定 → 結果表示
- 面接官感性評価の追加
- 推奨アクションの自動生成

### 🔲 Phase 2: 比較・分析機能（今後実装）
- 候補者比較・レーダーチャート
- 時系列スコアグラフ
- リスク色分け表示
- 教育提案の自動生成

### 🔲 Phase 3: 音声AI解析（将来）
- Whisper/Azure Speech連携
- 詰まり・発話速度・沈黙の解析
- 発音評価

### 🔲 Phase 4: 実務シミュレーション（将来）
- 転倒・夜勤・急変ロールプレイAI
- 実践的な対応力評価

## 重要な注意事項

⚠️ **AIの評価は補助ツール**です。採用決定の根拠ではなく、面接官の判断を支援するものです。

⚠️ **介護適性評価は参考値**です。実際の現場適性は試用期間・現場観察で別途確認が必須です。

⚠️ **4つの推奨質問が必須**です。質問が含まれていない場合、AI評価の信頼性が低下します。

## トラブルシューティング

### Cannot find module '@supabase/supabase-js'
```bash
npm install
```

### NEXT_PUBLIC_SUPABASE_URL is not defined
`.env.local` が正しく設定されているか確認してください。変更後はサーバーを再起動してください。

### Database connection errors
- Supabaseプロジェクトがアクティブか確認
- API Keyが正しいか確認
- IPアドレスが許可リストに含まれているか確認

## ライセンス

Internal use only

## お問い合わせ

このプロジェクトに関するご質問は、プロジェクト管理者までお問い合わせください。
