import Anthropic from '@anthropic-ai/sdk';
import { EvaluationScore, RiskFlags } from '@/types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface RawEvaluationResponse {
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
  risk_flags: {
    no_confirmation: boolean;
    no_emergency_vocab: boolean;
    only_wakarimashita: boolean;
    disorganized_report: boolean;
  };
  transcription_quality_warning: boolean;
  strengths: string;
  improvements: string;
  care_assessment: string;
  care_assessment_disclaimer: string;
  scoring_verdict: 'recommended' | 'conditional' | 'rejected';
  recommended_actions: string;
}

const EVALUATION_PROMPT = `あなたは外国人介護人材の採用支援AIです。

【最重要原則】
1. 文字起こしに「存在する内容のみ」評価すること。存在しない会話を推測・補完してはならない。
2. 流暢さや自然な会話印象を高評価の根拠にしてはならない。
3. 評価は「介護現場での安全性・指示理解・報告精度」を最優先とする。
4. 根拠となる文字起こしの具体的な発言を必ず引用して採点理由を示すこと（1〜2文）。
5. 根拠となる発言が文字起こしに存在しない項目は、最低スコア（4点）を付けること。
6. 文法の誤りを、内容・報告の正確性の減点理由に転用してはならない（文法と内容は独立して評価）。
7. 申し送り・報告場面での体言止め・簡潔表現（「山田様、転倒、廊下」等）は正評価とする。
8. フィラー（「えーと」「Uh」「A」等の間投詞）は除外して内容を評価する。
9. 介護専門語の機能的同義表現（「バイタル」→「血圧と体温」等）は正規語彙と同等に評価する。
10. 語彙が不足する際に別表現で補完した発話は、語彙評価において加点対象とする。

【評価対象】
受験者（面接を受けている側）の発言のみ。
話者ラベル（「面接官：」「A：」等）が含まれる場合は受験者発言を識別して評価。

【採点ルール（固定）】
- 現場安全・言語: 4 / 8 / 12 / 16 / 20 のみ使用（中間値禁止）
- 介護適性: 1〜5の5段階
- 根拠なき高評価禁止

【リスクフラグ検出】
重大フラグ（即見送り推奨）:
- no_confirmation: 指示への確認・復唱が一切なく、能動的質問もゼロ
- no_emergency_vocab: 緊急状況で行動語彙が皆無（代替表現含め）

要注意フラグ（条件付き採用の条件として明記）:
- only_wakarimashita: 「わかりました」の後に復唱も確認質問もない（承認のみ）
- disorganized_report: 報告の意味伝達が不成立（文法ではなく内容基準）

【条件付き採用の場合】
scoring_verdict が "conditional" の場合、recommended_actions に具体的な推奨アクションを必ず記述すること。

【改善点（improvements）作成時の注意】
- 絶対に「文字起こし品質」「音声認識」「転写精度」などの文字起こしに起因する問題を含めてはならない
- 改善点は受験者本人の能力改善に関わるもののみ記述すること
- 例えば「XX という発言が不明瞭であり」「文字が読み取れない部分があり」などは絶対に含めないこと

【出力形式（JSON固定）】
{
  "instruction_comprehension": int, "instruction_comprehension_reason": str, "instruction_evidence": str,
  "information_reporting": int, "information_reporting_reason": str, "information_evidence": str,
  "emergency_communication": int, "emergency_communication_reason": str, "emergency_evidence": str,
  "confirmation_behavior": int, "confirmation_behavior_reason": str, "confirmation_evidence": str,
  "vocabulary_grammar": int, "vocabulary_grammar_reason": str,
  "discourse_structure": int, "discourse_structure_reason": str,
  "care_communication": int, "care_communication_reason": str,
  "care_resilience": int, "care_resilience_reason": str,
  "care_safety_awareness": int, "care_safety_awareness_reason": str,
  "care_culture_fit": int, "care_culture_fit_reason": str,
  "risk_flags": {
    "no_confirmation": bool,
    "no_emergency_vocab": bool,
    "only_wakarimashita": bool,
    "disorganized_report": bool
  },
  "transcription_quality_warning": bool,
  "strengths": str,
  "improvements": str,
  "care_assessment": str,
  "care_assessment_disclaimer": "このスコアは面接発言からの推定値です。実際の現場適性は試用期間・現場観察で別途確認が必要です。",
  "scoring_verdict": "recommended" | "conditional" | "rejected",
  "recommended_actions": str
}

【会話文字起こし】
{transcription}`;

export async function evaluateTranscription(transcription: string): Promise<EvaluationScore> {
  try {
    const prompt = EVALUATION_PROMPT.replace('{transcription}', transcription);

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract JSON from response
    const responseText = response.content
      .filter((block) => block.type === 'text')
      .map((block) => (block.type === 'text' ? block.text : ''))
      .join('');

    // Parse JSON - handle both full response as JSON and JSON within markdown code blocks
    let jsonString = responseText;
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonString = jsonMatch[1].trim();
    } else if (responseText.includes('{')) {
      const startIdx = responseText.indexOf('{');
      const endIdx = responseText.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1) {
        jsonString = responseText.substring(startIdx, endIdx + 1).trim();
      }
    }

    let parsed: RawEvaluationResponse;
    try {
      parsed = JSON.parse(jsonString) as RawEvaluationResponse;
    } catch (parseError) {
      console.error('JSON パースエラー:', parseError);
      console.error('レスポンステキスト:', responseText);
      // フォールバック: デモ評価を返す
      return generateDemoEvaluation();
    }

    // Validate scores
    validateScores(parsed);

    return parsed as EvaluationScore;
  } catch (error) {
    console.error('Evaluation error:', error);
    throw new Error(`Failed to evaluate transcription: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function validateScores(scores: RawEvaluationResponse): void {
  const safetyScores = [
    scores.instruction_comprehension,
    scores.information_reporting,
    scores.emergency_communication,
    scores.confirmation_behavior,
  ];

  const languageScores = [scores.vocabulary_grammar, scores.discourse_structure];

  const careScores = [
    scores.care_communication,
    scores.care_resilience,
    scores.care_safety_awareness,
    scores.care_culture_fit,
  ];

  const validSafetyValues = [4, 8, 12, 16, 20];
  const validCareValues = [1, 2, 3, 4, 5];

  for (const score of safetyScores) {
    if (!validSafetyValues.includes(score)) {
      throw new Error(`Invalid safety score: ${score}. Must be one of ${validSafetyValues.join(', ')}`);
    }
  }

  for (const score of languageScores) {
    if (!validSafetyValues.includes(score)) {
      throw new Error(`Invalid language score: ${score}. Must be one of ${validSafetyValues.join(', ')}`);
    }
  }

  for (const score of careScores) {
    if (!validCareValues.includes(score)) {
      throw new Error(`Invalid care score: ${score}. Must be one of ${validCareValues.join(', ')}`);
    }
  }
}

function generateDemoEvaluation(): EvaluationScore {
  return {
    instruction_comprehension: 16,
    instruction_comprehension_reason: 'デモ評価：複数の指示を正確に理解し復唱',
    instruction_evidence: 'デモデータ',
    information_reporting: 16,
    information_reporting_reason: 'デモ評価：5W1Hで整理した報告',
    information_evidence: 'デモデータ',
    emergency_communication: 12,
    emergency_communication_reason: 'デモ評価：緊急対応の基本語彙あり',
    emergency_evidence: 'デモデータ',
    confirmation_behavior: 16,
    confirmation_behavior_reason: 'デモ評価：確認行動が見られる',
    confirmation_evidence: 'デモデータ',
    vocabulary_grammar: 16,
    vocabulary_grammar_reason: 'デモ評価：基本的な語彙文法は問題なし',
    discourse_structure: 16,
    discourse_structure_reason: 'デモ評価：報告の論理性良好',
    care_communication: 4,
    care_communication_reason: 'デモ評価：基本的なコミュニケーション',
    care_resilience: 4,
    care_resilience_reason: 'デモ評価：継続意欲が見られる',
    care_safety_awareness: 4,
    care_safety_awareness_reason: 'デモ評価：安全意識の発言あり',
    care_culture_fit: 3,
    care_culture_fit_reason: 'デモ評価：日本の介護文化への適応は不明',
    risk_flags: {
      no_confirmation: false,
      no_emergency_vocab: false,
      only_wakarimashita: false,
      disorganized_report: false,
    },
    transcription_quality_warning: false,
    strengths: 'デモ評価：指示理解と報告精度が良好',
    improvements: 'デモ評価：介護文化への適応度確認が必要',
    care_assessment: 'デモ評価：基本的な適性は確認できました。実際の現場適応は試用期間で判断してください。',
    care_assessment_disclaimer: 'このスコアは面接発言からの推定値です。実際の現場適性は試用期間・現場観察で別途確認が必要です。',
    scoring_verdict: 'conditional',
    recommended_actions: 'デモ評価：初期配置時のペア研修を推奨',
  };
}
