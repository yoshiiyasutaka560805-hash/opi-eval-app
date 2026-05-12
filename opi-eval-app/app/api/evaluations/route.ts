import { NextRequest, NextResponse } from 'next/server';
import { evaluateTranscription } from '@/lib/evaluate';
import { calculateScores, determineVerdict, calculateDisplayScores } from '@/lib/verdict';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcription, candidateName, clientName } = body;

    if (!transcription || !candidateName || !clientName) {
      return NextResponse.json(
        { error: '必須フィールドが不足しています' },
        { status: 400 }
      );
    }

    // Step 1: Call Claude API to evaluate
    const evaluationScore = await evaluateTranscription(transcription);

    // Step 2: Calculate scores
    const scoring = calculateScores(evaluationScore);

    // Step 3: Determine verdict (using default thresholds)
    const verdict = determineVerdict(evaluationScore, scoring, 50, 80);

    // Step 4: Create or get candidate record
    // For now, we'll create temporary records with just the names
    // In a full implementation, we'd look up existing clients and create proper references
    const candidateId = uuidv4();
    const evaluationId = uuidv4();

    // Step 5: Calculate final display scores (before impression score is added)
    const displayScores = calculateDisplayScores(scoring.ai_total, 0);

    // Step 6: Insert evaluation into database
    const { error: dbError } = await supabase.from('evaluations').insert([
      {
        id: evaluationId,
        candidate_id: candidateId,
        transcription,

        // Safety scores
        instruction_comprehension: evaluationScore.instruction_comprehension,
        instruction_comprehension_reason: evaluationScore.instruction_comprehension_reason,
        instruction_evidence: evaluationScore.instruction_evidence,

        information_reporting: evaluationScore.information_reporting,
        information_reporting_reason: evaluationScore.information_reporting_reason,
        information_evidence: evaluationScore.information_evidence,

        emergency_communication: evaluationScore.emergency_communication,
        emergency_communication_reason: evaluationScore.emergency_communication_reason,
        emergency_evidence: evaluationScore.emergency_evidence,

        confirmation_behavior: evaluationScore.confirmation_behavior,
        confirmation_behavior_reason: evaluationScore.confirmation_behavior_reason,
        confirmation_evidence: evaluationScore.confirmation_evidence,

        safety_total: scoring.safety_total,

        // Language scores
        vocabulary_grammar: evaluationScore.vocabulary_grammar,
        vocabulary_grammar_reason: evaluationScore.vocabulary_grammar_reason,

        discourse_structure: evaluationScore.discourse_structure,
        discourse_structure_reason: evaluationScore.discourse_structure_reason,

        language_total: scoring.language_total,
        language_fail_flag: scoring.language_fail_flag,

        // Care aptitude scores
        care_communication: evaluationScore.care_communication,
        care_communication_reason: evaluationScore.care_communication_reason,

        care_resilience: evaluationScore.care_resilience,
        care_resilience_reason: evaluationScore.care_resilience_reason,

        care_safety_awareness: evaluationScore.care_safety_awareness,
        care_safety_awareness_reason: evaluationScore.care_safety_awareness_reason,

        care_culture_fit: evaluationScore.care_culture_fit,
        care_culture_fit_reason: evaluationScore.care_culture_fit_reason,

        care_total: scoring.care_total,

        // AI scoring
        ai_total: scoring.ai_total,
        display_score: displayScores.ai_display,

        // Impression (initialized to 0)
        impression_score: 0,
        impression_memo: '',

        // Final scores
        total_score_internal: scoring.ai_total, // Will be updated after impression score
        total_display_score: displayScores.ai_display, // Will be updated after impression score

        // Verdict
        risk_flags: evaluationScore.risk_flags,
        transcription_quality_warning: evaluationScore.transcription_quality_warning,
        conversation_level: scoring.conversation_level,
        verdict: verdict.verdict,
        recommended_actions: evaluationScore.recommended_actions,

        // Comments
        strengths: evaluationScore.strengths,
        improvements: evaluationScore.improvements,
        care_assessment: evaluationScore.care_assessment,
        interviewer_comment: '',

        raw_response: evaluationScore,
      },
    ]);

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'データベース保存に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      evaluationId,
      candidateId,
      verdict: verdict.verdict,
      score: displayScores.ai_display,
    });
  } catch (error) {
    console.error('Evaluation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '評価処理に失敗しました' },
      { status: 500 }
    );
  }
}
