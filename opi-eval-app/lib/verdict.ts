import { EvaluationScore, VerdictType, ConversationLevel } from '@/types';

interface ScoringResult {
  safety_total: number; // 0-80
  language_total: number; // 0-40
  language_fail_flag: boolean;
  care_total: number; // 4-20
  ai_total: number; // 0-140 (safety + language + care)
  display_score: number; // 0-100 (AI score display)
  conversation_level: ConversationLevel;
}

interface VerdictResult {
  verdict: VerdictType;
  display_score: number;
  safety_display: number;
  language_display: number;
  care_display: number;
  ai_total: number;
  language_fail_flag: boolean;
  conversation_level: ConversationLevel;
  reason: string;
}

export function calculateScores(score: EvaluationScore): ScoringResult {
  // 現場安全 (0-80)
  const safety_total =
    score.instruction_comprehension +
    score.information_reporting +
    score.emergency_communication +
    score.confirmation_behavior;

  // 言語 (0-40)
  const language_total = score.vocabulary_grammar + score.discourse_structure;

  // 言語足切りライン
  const language_fail_flag = score.vocabulary_grammar < 12;

  // 介護適性 (4-20)
  const care_total =
    score.care_communication + score.care_resilience + score.care_safety_awareness + score.care_culture_fit;

  // AI合計 (0-140)
  const ai_total = safety_total + language_total + care_total;

  // 100点換算 (÷1.6 四捨五入)
  const display_score = Math.round(ai_total / 1.6);

  // 会話日本語レベル推定 (0-40の言語スコアから)
  const conversation_level = estimateConversationLevel(score.vocabulary_grammar, score.discourse_structure);

  return {
    safety_total,
    language_total,
    language_fail_flag,
    care_total,
    ai_total,
    display_score,
    conversation_level,
  };
}

export function determineVerdict(
  score: EvaluationScore,
  scoring: ScoringResult,
  safety_threshold_pct: number = 50,
  total_threshold_pct: number = 80,
): VerdictResult {
  const safety_display = Math.round(scoring.safety_total / 0.8); // 80点を100点換算
  const language_display = Math.round(scoring.language_total / 0.4); // 40点を100点換算
  const care_display = Math.round(scoring.care_total / 0.2); // 20点を100点換算

  // 基準値 (100点スケール)
  const safety_threshold = (80 * safety_threshold_pct) / 100 / 0.8; // 50%の場合、50点が閾値
  const total_threshold = (80 * total_threshold_pct) / 100 / 1.6; // 80%の場合、80点が閾値

  let verdict: VerdictType;
  let reason: string[] = [];

  // リスクフラグ評価
  if (score.risk_flags.no_confirmation || score.risk_flags.no_emergency_vocab) {
    verdict = 'rejected';
    reason.push('重大なリスクフラグが検出されました');
  } else if (scoring.language_fail_flag) {
    verdict = 'rejected';
    reason.push('言語能力が要件を満たしていません');
  } else if (scoring.display_score >= total_threshold && safety_display >= safety_threshold) {
    verdict = 'recommended';
    reason.push(`総合スコア${scoring.display_score}点以上、現場安全スコア${safety_display}点以上`);
  } else if (scoring.display_score >= 60 && safety_display >= safety_threshold * 0.76) {
    verdict = 'conditional';
    reason.push(`条件付き採用: スコア${scoring.display_score}点、現場安全${safety_display}点`);
  } else {
    verdict = 'rejected';
    reason.push(`スコアが閾値を下回っています: ${scoring.display_score}点`);
  }

  return {
    verdict,
    display_score: scoring.display_score,
    safety_display,
    language_display,
    care_display,
    ai_total: scoring.ai_total,
    language_fail_flag: scoring.language_fail_flag,
    conversation_level: scoring.conversation_level,
    reason: reason.join('; '),
  };
}

function estimateConversationLevel(
  vocabulary_score: number,
  discourse_score: number,
): ConversationLevel {
  const avg = (vocabulary_score + discourse_score) / 2;

  if (avg >= 18) {
    return 'Lv.6'; // 介護現場で自律的に業務遂行できる
  } else if (avg >= 14) {
    return 'Lv.5'; // 日常的な報告・連絡は問題なし
  } else if (avg >= 12) {
    return 'Lv.4'; // 基本的な意思疎通は成立
  } else if (avg >= 8) {
    return 'Lv.3'; // 簡単な指示は理解できる
  } else if (avg >= 6) {
    return 'Lv.2'; // 理解に支援が必要
  } else {
    return 'Lv.1'; // 日本語のみでの業務は困難
  }
}

export function roundToNearestHalf(num: number): number {
  return Math.round(num * 2) / 2;
}

export function calculateDisplayScores(
  ai_total: number,
  impression_score: number,
): { ai_display: number; total_display: number } {
  const ai_display = Math.round(ai_total / 1.6);
  const total_internal = ai_total + impression_score; // 0-160
  const total_display = Math.round(total_internal / 1.6); // 0-100

  return {
    ai_display,
    total_display,
  };
}
