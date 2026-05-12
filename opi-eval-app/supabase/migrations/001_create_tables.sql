-- Create clients table (施設マスタ)
create table if not exists public.clients (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  facility_type text,
  contact_name text,
  safety_threshold_pct int2 default 50,
  total_threshold_pct int2 default 80,
  created_at timestamp with time zone default now()
);

alter table public.clients enable row level security;

-- Create candidates table (受験者)
create table if not exists public.candidates (
  id uuid default gen_random_uuid() primary key,
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  nationality text,
  birthdate date,
  visa_type text not null check (visa_type in ('特定技能1号', '介護')),
  native_language text,
  care_experience boolean default false,
  jlpt_level text,
  jft_score int2,
  interview_date date,
  created_at timestamp with time zone default now()
);

alter table public.candidates enable row level security;
create index idx_candidates_client_id on public.candidates(client_id);
create index idx_candidates_interview_date on public.candidates(interview_date);

-- Create evaluations table (採点結果)
create table if not exists public.evaluations (
  id uuid default gen_random_uuid() primary key,
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  transcription text not null,

  -- 現場安全能力評価 (各20点, 計80点内部)
  instruction_comprehension int2,
  instruction_comprehension_reason text,
  instruction_evidence text,

  information_reporting int2,
  information_reporting_reason text,
  information_evidence text,

  emergency_communication int2,
  emergency_communication_reason text,
  emergency_evidence text,

  confirmation_behavior int2,
  confirmation_behavior_reason text,
  confirmation_evidence text,

  safety_total int2,

  -- 言語能力評価 (各20点, 計40点内部)
  vocabulary_grammar int2,
  vocabulary_grammar_reason text,

  discourse_structure int2,
  discourse_structure_reason text,

  language_total int2,
  language_fail_flag boolean default false,

  -- 介護適性評価 (各5点, 計20点内部)
  care_communication int2,
  care_communication_reason text,

  care_resilience int2,
  care_resilience_reason text,

  care_safety_awareness int2,
  care_safety_awareness_reason text,

  care_culture_fit int2,
  care_culture_fit_reason text,

  care_total int2,

  -- AI合計 (0-140内部)
  ai_total int2,
  display_score int2,

  -- 感性加点 (0-20)
  impression_score int2 default 0,
  impression_memo text,

  -- 最終スコア
  total_score_internal int2,
  total_display_score int2,

  -- 判定
  risk_flags jsonb default '{"no_confirmation": false, "no_emergency_vocab": false, "only_wakarimashita": false, "disorganized_report": false}'::jsonb,
  transcription_quality_warning boolean default false,
  conversation_level text,
  verdict text not null check (verdict in ('recommended', 'conditional', 'rejected')),
  recommended_actions text,

  -- コメント
  strengths text,
  improvements text,
  care_assessment text,
  interviewer_comment text,

  raw_response jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.evaluations enable row level security;
create index idx_evaluations_candidate_id on public.evaluations(candidate_id);
create index idx_evaluations_created_at on public.evaluations(created_at);
create index idx_evaluations_verdict on public.evaluations(verdict);

-- Create updated_at trigger for evaluations
create or replace function update_evaluations_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_evaluations_updated_at
before update on public.evaluations
for each row
execute function update_evaluations_updated_at();
