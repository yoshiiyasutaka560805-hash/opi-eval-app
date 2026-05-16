import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase.from('candidates').select('*').order('name');

    if (error) {
      return NextResponse.json(
        { error: '受験者一覧の取得に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      candidates: data || [],
      count: data?.length || 0,
    });
  } catch (error) {
    console.error('GET /api/candidates error:', error);
    return NextResponse.json(
      { error: '受験者一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, client_id, nationality, birthdate, visa_type, native_language, care_experience, jlpt_level, jft_score, interview_date } = body;

    if (!name || !client_id || !nationality) {
      return NextResponse.json(
        { error: '受験者名、施設、国籍は必須です' },
        { status: 400 }
      );
    }

    const candidateId = uuidv4();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('candidates')
      .insert([
        {
          id: candidateId,
          name,
          client_id,
          nationality,
          birthdate: birthdate || null,
          visa_type: visa_type || '特定技能1号',
          native_language: native_language || '',
          care_experience: care_experience || false,
          jlpt_level: jlpt_level || null,
          jft_score: jft_score || null,
          interview_date: interview_date || now,
          submission_count: 0,
          last_submitted_at: now,
          submission_status: 'submitted',
          submission_history: [],
          created_at: now,
        }
      ])
      .select();

    if (error) {
      console.error('Failed to create candidate:', error);
      return NextResponse.json(
        { error: '受験者の作成に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      candidate: data?.[0],
      id: candidateId,
    });
  } catch (error) {
    console.error('POST /api/candidates error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '受験者の作成に失敗しました' },
      { status: 500 }
    );
  }
}
