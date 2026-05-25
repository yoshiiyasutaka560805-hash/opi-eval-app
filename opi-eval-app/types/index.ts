export type VerdictType = 'recommended' | 'conditional' | 'rejected';
export type VisaType = '特定技能1号' | '介護';
export type JLPTLevel = 'N1' | 'N2' | 'N3' | 'N4' | 'N5';
export type ConversationLevel = 'Lv.1' | 'Lv.2' | 'Lv.3' | 'Lv.4' | 'Lv.5' | 'Lv.6';

export interface Client {
  id: string;
  name: string;
  facility_type: string;
  contact_name: string;
  safety_threshold_pct: number; // default 50
  total_threshold_pct: number; // default 80
  created_at: string;
}

export interface SubmissionHistory {
  submitted_at: string;
  status: 'submitted' | 'resubmission_requested' | 'resubmitted';
  notes?: string;
}

export interface Candidate {
  id: string;
  client_id: string;
  name: string;
  nationality: string;
  birthdate: string;
  visa_type: VisaType;
  native_language: string;
  care_experience: boolean;
  jlpt_level?: JLPTLevel;
  jft_score?: number;
  interview_date: string;
  submission_count: number;
  last_submitted_at: string;
  submission_status: 'submitted' | 'resubmission_requested' | 'resubmitted';
  submission_history: SubmissionHistory[];
  user_pdf_url?: string;
  result_pdf_url?: string;
  created_at: string;
}

export interface RiskFlags {
  no_confirmation: boolean;
  no_emergency_vocab: boolean;
  only_wakarimashita: boolean;
  disorganized_report: boolean;
}

export interface EvaluationScore {
  instruction_comprehension: number;
  instruction_comprehension_reason: string;
  instruction_evidence: string;

  information_reporting: number;
  information_reporting_reason: string;
  information_evidence: string;

  emergency_communication: number;
  emergency_communication_reason: string;
  emergency_evidence: string;

  confirmation_behavior: number;
  confirmation_behavior_reason: string;
  confirmation_evidence: string;

  vocabulary_grammar: number;
  vocabulary_grammar_reason: string;

  discourse_structure: number;
  discourse_structure_reason: string;

  care_communication: number;
  care_communication_reason: string;

  care_resilience: number;
  care_resilience_reason: string;

  care_safety_awareness: number;
  care_safety_awareness_reason: string;

  care_culture_fit: number;
  care_culture_fit_reason: string;

  risk_flags: RiskFlags;
  transcription_quality_warning: boolean;
  strengths: string;
  improvements: string;
  care_assessment: string;
  care_assessment_disclaimer: string;
  scoring_verdict: VerdictType;
  recommended_actions: string;
}

export interface Evaluation {
  id: string;
  candidate_id: string;
  candidate_name: string;
  client_id: string;
  client_name: string;
  transcription: string;

  // 現場安全能力評価 (各20点, 計80点内部)
  instruction_comprehension: number;
  instruction_comprehension_reason: string;
  instruction_evidence: string;

  information_reporting: number;
  information_reporting_reason: string;
  information_evidence: string;

  emergency_communication: number;
  emergency_communication_reason: string;
  emergency_evidence: string;

  confirmation_behavior: number;
  confirmation_behavior_reason: string;
  confirmation_evidence: string;

  safety_total: number; // 0-80 (internal)

  // 言語能力評価 (各20点, 計40点内部)
  vocabulary_grammar: number;
  vocabulary_grammar_reason: string;

  discourse_structure: number;
  discourse_structure_reason: string;

  language_total: number; // 0-40 (internal)
  language_fail_flag: boolean; // <12点の場合true

  // 介護適性評価 (各5点, 計20点内部)
  care_communication: number;
  care_communication_reason: string;

  care_resilience: number;
  care_resilience_reason: string;

  care_safety_awareness: number;
  care_safety_awareness_reason: string;

  care_culture_fit: number;
  care_culture_fit_reason: string;

  care_total: number; // 4-20 (内部スコア)

  // AI合計 (0-140内部)
  ai_total: number;
  display_score: number; // 0-100 (÷1.6四捨五入)

  // 最終スコア
  total_score_internal: number; // 0-140
  total_display_score: number; // 0-100

  // 判定
  risk_flags: RiskFlags;
  transcription_quality_warning: boolean;
  conversation_level: ConversationLevel;
  verdict: VerdictType;
  recommended_actions: string;

  // コメント
  strengths: string;
  improvements: string;
  care_assessment: string;
  interviewer_comment: string;

  raw_response: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface EvaluationForm {
  transcription: string;
  candidate_id: string;
}

export interface ScoringResult {
  score: EvaluationScore;
  created_at: string;
}
