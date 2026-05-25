# Supabaseセットアップガイド

このガイドに従って、Supabaseを設定して受験者管理機能を実装します。

## ステップ1: Supabaseプロジェクトの作成

1. https://supabase.com にアクセス
2. **Sign Up** をクリック
3. メールアドレスとパスワードで登録（またはGitHub/Googleでログイン）
4. ダッシュボードで **New Project** をクリック
5. 以下を入力：
   - **Project name**: `opi-eval-app` (任意の名前でも可)
   - **Database password**: 安全なパスワードを設定
   - **Region**: 最寄りのリージョンを選択（`ap-northeast-1`（東京）推奨）
6. **Create new project** をクリック
7. プロジェクト作成完了までお待ちください（5-10分）

## ステップ2: 認証情報の取得

プロジェクト作成後：

1. Supabaseダッシュボードで、左サイドバーの **Settings** → **API** をクリック
2. 以下の情報をコピー：
   - **Project URL**: `https://xxx.supabase.co` の形式
   - **Anon Key (public)**: `eyJhbGciOiJIUzI1NiIs...` の形式

## ステップ3: 環境変数の設定

`opi-eval-app/.env.local` ファイルを編集：

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here

# Google Generative AI API Key (Gemini)
GOOGLE_GENERATIVE_AI_KEY=your-google-api-key-here

# Anthropic API Key
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# Demo Mode (OFF)
NEXT_PUBLIC_DEMO_MODE=false
```

**重要**: ファイルを保存後、開発サーバーを再起動してください！

## ステップ4: データベーステーブルの作成

### 方法A: Supabaseダッシュボード（推奨）

1. Supabaseダッシュボードで **SQL Editor** をクリック
2. 左上の **New Query** をクリック
3. 以下のSQLをコピーしてペースト：

```sql
-- Create clients table (施設マスタ)
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  facility_type TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  safety_threshold_pct SMALLINT DEFAULT 50,
  total_threshold_pct SMALLINT DEFAULT 80,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create candidates table (受験者)
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  nationality TEXT NOT NULL,
  birthdate DATE NOT NULL,
  visa_type TEXT NOT NULL CHECK (visa_type IN ('特定技能1号', '介護')),
  native_language TEXT NOT NULL,
  care_experience BOOLEAN DEFAULT false,
  jlpt_level TEXT CHECK (jlpt_level IN ('N1', 'N2', 'N3', 'N4', 'N5')),
  jft_score SMALLINT,
  interview_date DATE NOT NULL,
  submission_count SMALLINT DEFAULT 0,
  last_submitted_at TIMESTAMPTZ,
  submission_status TEXT NOT NULL DEFAULT 'submitted' CHECK (submission_status IN ('submitted', 'resubmission_requested', 'resubmitted')),
  submission_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create evaluations table (採点結果)
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  candidate_name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  transcription TEXT NOT NULL,

  instruction_comprehension SMALLINT,
  instruction_comprehension_reason TEXT,
  instruction_evidence TEXT,
  information_reporting SMALLINT,
  information_reporting_reason TEXT,
  information_evidence TEXT,
  emergency_communication SMALLINT,
  emergency_communication_reason TEXT,
  emergency_evidence TEXT,
  confirmation_behavior SMALLINT,
  confirmation_behavior_reason TEXT,
  confirmation_evidence TEXT,
  safety_total SMALLINT,

  vocabulary_grammar SMALLINT,
  vocabulary_grammar_reason TEXT,
  discourse_structure SMALLINT,
  discourse_structure_reason TEXT,
  language_total SMALLINT,
  language_fail_flag BOOLEAN DEFAULT false,

  care_communication SMALLINT,
  care_communication_reason TEXT,
  care_resilience SMALLINT,
  care_resilience_reason TEXT,
  care_safety_awareness SMALLINT,
  care_safety_awareness_reason TEXT,
  care_culture_fit SMALLINT,
  care_culture_fit_reason TEXT,
  care_total SMALLINT,

  ai_total SMALLINT,
  display_score SMALLINT,
  total_score_internal SMALLINT,
  total_display_score SMALLINT,

  risk_flags JSONB,
  transcription_quality_warning BOOLEAN DEFAULT false,
  conversation_level TEXT CHECK (conversation_level IN ('Lv.1', 'Lv.2', 'Lv.3', 'Lv.4', 'Lv.5', 'Lv.6')),
  verdict TEXT CHECK (verdict IN ('recommended', 'conditional', 'rejected')),
  recommended_actions TEXT,

  strengths TEXT,
  improvements TEXT,
  care_assessment TEXT,
  interviewer_comment TEXT,

  raw_response JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_candidates_client_id ON candidates(client_id);
CREATE INDEX idx_evaluations_candidate_id ON evaluations(candidate_id);
CREATE INDEX idx_evaluations_created_at ON evaluations(created_at DESC);
```

4. 右上の **▶ Run** をクリック
5. 成功メッセージが表示されたら完了！

## ステップ5: テスト施設データの登録

同じSQL Editorで、以下を実行：

```sql
INSERT INTO clients (name, facility_type, contact_name, safety_threshold_pct, total_threshold_pct)
VALUES 
  ('テスト施設A', '特別養護老人ホーム', '田中太郎', 50, 80),
  ('テスト施設B', '老健施設', '佐藤次郎', 55, 85),
  ('テスト施設C', '訪問介護事業所', '鈴木花子', 48, 78);
```

## ステップ6: 動作確認

1. 開発サーバーが起動している場合は、**再起動** してください
   ```bash
   # サーバーを停止 (Ctrl+C)
   # サーバーを起動
   npm run dev
   ```

2. ブラウザで http://localhost:3000/candidates にアクセス

3. 以下が表示されたら成功です：
   - ✅ 施設選択ドロップダウンに「テスト施設A」「テスト施設B」「テスト施設C」が表示
   - ✅ エラーメッセージなし
   - ✅ 「新規登録」ボタンが機能
   - ✅ 受験者一覧が表示（初期状態は空）

## ステップ7: テスト受験者の登録

1. 「+ 新規登録」ボタンをクリック
2. 以下のテストデータを入力：
   - **施設**: テスト施設A
   - **氏名**: 田中太郎
   - **国籍**: ベトナム
   - **生年月日**: 1995-05-15
   - **ビザタイプ**: 特定技能1号
   - **母語**: ベトナム語
   - **介護経験**: チェック
   - **面接日**: 2026-05-20
   - **JLPT レベル**: N3
   - **JFT スコア**: 75

3. 「登録」をクリック
4. 受験者詳細ページが表示されたら成功！

## トラブルシューティング

### "施設情報の読み込みに失敗しました" エラー

**原因**: Supabaseの認証情報が間違っている

**解決策**:
1. `.env.local` の `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を確認
2. Supabaseダッシュボードで再度コピーして貼り付け
3. 開発サーバーを再起動
4. ブラウザキャッシュをクリア（Ctrl+Shift+Delete）

### テーブルが作成されない

**原因**: SQLクエリが実行されていない

**解決策**:
1. Supabaseの SQL Editor で、全てのSQLが実行済みか確認
2. エラーメッセージがないか確認
3. テーブル一覧で `clients`, `candidates`, `evaluations` が存在するか確認（左サイドバー）

### 受験者を登録できない

**原因**: 施設が存在しないか、データベースに接続できていない

**解決策**:
1. Supabase ダッシュボードで `clients` テーブルにデータが存在するか確認
2. ブラウザコンソール（F12）でエラーメッセージを確認
3. `.env.local` を再度確認して開発サーバーを再起動

## 次のステップ

- ✅ 受験者管理機能が確立されました
- ⬜ 施設管理機能の実装（設定ページ）
- ⬜ 評価の実装とPDF出力

何か問題があれば、ブラウザの開発者ツール（F12 → Console）でエラーメッセージを確認してください。
