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

  -- 現場安全能力評価 (各20点, 計80点内部)
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

  -- 言語能力評価 (各20点, 計40点内部)
  vocabulary_grammar SMALLINT,
  vocabulary_grammar_reason TEXT,

  discourse_structure SMALLINT,
  discourse_structure_reason TEXT,

  language_total SMALLINT,
  language_fail_flag BOOLEAN DEFAULT false,

  -- 介護適性評価 (各5点, 計20点内部)
  care_communication SMALLINT,
  care_communication_reason TEXT,

  care_resilience SMALLINT,
  care_resilience_reason TEXT,

  care_safety_awareness SMALLINT,
  care_safety_awareness_reason TEXT,

  care_culture_fit SMALLINT,
  care_culture_fit_reason TEXT,

  care_total SMALLINT,

  -- AI合計 (0-140内部)
  ai_total SMALLINT,
  display_score SMALLINT,

  -- 最終スコア
  total_score_internal SMALLINT,
  total_display_score SMALLINT,

  -- 判定
  risk_flags JSONB,
  transcription_quality_warning BOOLEAN DEFAULT false,
  conversation_level TEXT CHECK (conversation_level IN ('Lv.1', 'Lv.2', 'Lv.3', 'Lv.4', 'Lv.5', 'Lv.6')),
  verdict TEXT CHECK (verdict IN ('recommended', 'conditional', 'rejected')),
  recommended_actions TEXT,

  -- コメント
  strengths TEXT,
  improvements TEXT,
  care_assessment TEXT,
  interviewer_comment TEXT,

  raw_response JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_candidates_client_id ON candidates(client_id);
CREATE INDEX idx_evaluations_candidate_id ON evaluations(candidate_id);
CREATE INDEX idx_evaluations_created_at ON evaluations(created_at DESC);
