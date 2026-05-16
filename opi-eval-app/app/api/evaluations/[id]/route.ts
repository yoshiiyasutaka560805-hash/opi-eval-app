import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calculateDisplayScores } from '@/lib/verdict';
import { evaluationCache } from '@/lib/demoCache';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // DEMO_MODE: Check in-memory cache
    console.log('GET /evaluations/[id] - DEMO_MODE:', process.env.NEXT_PUBLIC_DEMO_MODE);
    console.log('GET /evaluations/[id] - Looking for ID:', id);
    console.log('GET /evaluations/[id] - Cache size:', evaluationCache.size);
    console.log('GET /evaluations/[id] - Cache keys:', Array.from(evaluationCache.keys()));

    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      const cached = evaluationCache.get(id);
      console.log('GET /evaluations/[id] - Found in cache:', !!cached);
      if (cached) {
        return NextResponse.json(cached);
      }
      console.log('GET /evaluations/[id] - Not found in cache, returning 404');
      return NextResponse.json({ error: '評価が見つかりません' }, { status: 404 });
    }

    // Production: Fetch from database
    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .eq('id', id)
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

