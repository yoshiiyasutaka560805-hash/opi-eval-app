-- 評価テーブル
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_name TEXT NOT NULL,
  facility_name TEXT NOT NULL,
  interview_transcript TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI評価結果テーブル
CREATE TABLE IF NOT EXISTS evaluation_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,

  -- スコア（各セクション）
  safety_score INTEGER,           -- 現場安全能力（80点満点）
  language_score INTEGER,         -- 言語能力（40点満点）
  aptitude_score INTEGER,         -- 介護適性（20点満点）

  -- AI評価結果
  ai_assessment TEXT,             -- AI評価のサマリー
  safety_details JSONB,           -- 現場安全の詳細評価
  language_details JSONB,         -- 言語能力の詳細評価
  aptitude_details JSONB,         -- 介護適性の詳細評価
  risk_flags JSONB,               -- リスクフラグ
  recommended_actions TEXT,       -- 推奨アクション

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 面接官スコアテーブル
CREATE TABLE IF NOT EXISTS interviewer_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,

  -- 面接官感性スコア
  impression_score INTEGER CHECK (impression_score >= 0 AND impression_score <= 20),

  -- 最終判定
  verdict TEXT,                   -- 採用推奨/条件付き採用/見送り
  final_score INTEGER,            -- 最終スコア（100点満点）
  notes TEXT,                     -- メモ

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_evaluations_created_at ON evaluations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_evaluation_results_evaluation_id ON evaluation_results(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_interviewer_scores_evaluation_id ON interviewer_scores(evaluation_id);

-- Row Level Security (RLS) を有効化
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviewer_scores ENABLE ROW LEVEL SECURITY;

-- デフォルトポリシー（社内ユーザーのみアクセス可能）
-- 認証ユーザーならアクセス可能
CREATE POLICY "Enable read access for authenticated users" ON evaluations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON evaluations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON evaluations
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete access for authenticated users" ON evaluations
  FOR DELETE USING (auth.role() = 'authenticated');

-- evaluation_results のポリシー
CREATE POLICY "Enable read access for authenticated users" ON evaluation_results
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON evaluation_results
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON evaluation_results
  FOR UPDATE USING (auth.role() = 'authenticated');

-- interviewer_scores のポリシー
CREATE POLICY "Enable read access for authenticated users" ON interviewer_scores
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON interviewer_scores
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON interviewer_scores
  FOR UPDATE USING (auth.role() = 'authenticated');
