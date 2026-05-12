import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calculateDisplayScores } from '@/lib/verdict';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      return NextResponse.json({ error: '評価が見つかりません' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'エラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { impression_score, impression_memo } = body;

    // Get current evaluation to calculate final scores
    const { data: current, error: fetchError } = await supabase
      .from('evaluations')
      .select('ai_total')
      .eq('id', params.id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: '評価が見つかりません' }, { status: 404 });
    }

    // Calculate final display scores
    const displayScores = calculateDisplayScores(current.ai_total, impression_score || 0);

    // Update evaluation
    const { data, error } = await supabase
      .from('evaluations')
      .update({
        impression_score: impression_score || 0,
        impression_memo: impression_memo || '',
        total_score_internal: current.ai_total + (impression_score || 0),
        total_display_score: displayScores.total_display,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: '更新に失敗しました' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'エラーが発生しました' },
      { status: 500 }
    );
  }
}
