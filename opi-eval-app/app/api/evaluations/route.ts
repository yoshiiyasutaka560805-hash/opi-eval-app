import { NextRequest, NextResponse } from 'next/server';
import { evaluateTranscription } from '@/lib/evaluate';
import { calculateScores, determineVerdict, calculateDisplayScores } from '@/lib/verdict';
import { supabase } from '@/lib/supabase';
import { evaluationCache } from '@/lib/demoCache';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { transcription, candidateName, clientName, candidateId } = body;

    if (!transcription || !candidateName || !clientName) {
      return NextResponse.json(
        { error: '必須フィールドが不足しています' },
        { status: 400 }
      );
    }

    // Step 0: If no candidateId provided, create a new candidate
    if (!candidateId) {
      candidateId = uuidv4();

      // Get or create client
      let clientId = null;
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('name', clientName)
        .single();

      if (existingClient) {
        clientId = existingClient.id;
      } else {
        // Create new client if not exists
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert([{
            name: clientName,
            facility_type: '',
            contact_name: '',
            contact_email: '',
            safety_threshold_pct: 50,
            total_threshold_pct: 80,
          }])
          .select('id')
          .single();

        if (newClient) {
          clientId = newClient.id;
        }
      }

      // Create candidate with all required fields
      const now = new Date().toISOString();
      const { error: candidateError } = await supabase.from('candidates').insert([
        {
          id: candidateId,
          name: candidateName,
          client_id: clientId || '00000000-0000-0000-0000-000000000000',
          nationality: '未設定',
          birthdate: new Date().toISOString().split('T')[0],
          visa_type: '特定技能1号',
          native_language: '未設定',
          care_experience: false,
          interview_date: now,
          submission_count: 1,
          last_submitted_at: now,
          submission_status: 'submitted',
          submission_history: [{ submitted_at: now, status: 'submitted' }],
        }
      ]);

      if (candidateError) {
        console.error('Failed to create candidate:', candidateError);
        return NextResponse.json(
          { error: '受験者の登録に失敗しました' },
          { status: 500 }
        );
      }
    }

    // Step 1: Call Claude API to evaluate
    const evaluationScore = await evaluateTranscription(transcription);

    // Step 2: Calculate scores
    const scoring = calculateScores(evaluationScore);

    // Step 3: Determine verdict (using default thresholds)
    const verdict = determineVerdict(evaluationScore, scoring, 50, 80);

    // Step 4: Use provided candidate ID or generated one
    const evaluationId = uuidv4();

    // Step 5: Calculate final display scores (before impression score is added)
    const displayScores = calculateDisplayScores(scoring.ai_total, 0);

    // Step 6: Prepare evaluation data
    // Get client_id from candidate if not already set
    let evaluationClientId = null;
    if (!evaluationClientId) {
      const { data: candidateData } = await supabase
        .from('candidates')
        .select('client_id')
        .eq('id', candidateId)
        .single();
      evaluationClientId = candidateData?.client_id || null;
    }

    const evaluationData = {
      id: evaluationId,
      candidate_id: candidateId,
      candidate_name: candidateName,
      client_id: evaluationClientId,
      client_name: clientName,
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

      // Final scores
      total_score_internal: scoring.ai_total,
      total_display_score: displayScores.ai_display,

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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // DEMO_MODE: Use in-memory cache instead of database
    console.log('NEXT_PUBLIC_DEMO_MODE:', process.env.NEXT_PUBLIC_DEMO_MODE);
    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      evaluationCache.set(evaluationId, evaluationData);
      console.log('Evaluation saved to in-memory cache:', evaluationId);
      console.log('Cache size after save:', evaluationCache.size);
      console.log('Cache contents:', Array.from(evaluationCache.keys()));
    } else {
      // Production: Save to database
      const { error: dbError } = await supabase.from('evaluations').insert([evaluationData]);
      if (dbError) {
        console.error('Database error:', dbError);
        return NextResponse.json(
          { error: 'データベース保存に失敗しました' },
          { status: 500 }
        );
      }
    }

    const response = {
      evaluationId,
      candidateId,
      verdict: verdict.verdict,
      score: displayScores.ai_display,
    };
    console.log('POST /evaluations - Returning response:', response);
    console.log('POST /evaluations - Final cache size:', evaluationCache.size);
    console.log('POST /evaluations - Final cache keys:', Array.from(evaluationCache.keys()));
    return NextResponse.json(response);
  } catch (error) {
    console.error('Evaluation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '評価処理に失敗しました' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');

    // DEMO_MODE: Return cached evaluations
    console.log('GET /evaluations - DEMO_MODE:', process.env.NEXT_PUBLIC_DEMO_MODE);
    console.log('GET /evaluations - Cache size:', evaluationCache.size);

    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      let evaluations = Array.from(evaluationCache.values());
      if (clientId) {
        evaluations = evaluations.filter((e) => e.client_id === clientId);
      }
      console.log('GET /evaluations - Returning', evaluations.length, 'evaluations');
      return NextResponse.json({
        evaluations,
        count: evaluations.length,
      });
    }

    // Production: Fetch from database
    let query = supabase.from('evaluations').select('*');
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: '評価一覧の取得に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      evaluations: data || [],
      count: data?.length || 0,
    });
  } catch (error) {
    console.error('GET evaluations error:', error);
    return NextResponse.json(
      { error: '評価一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}
