import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase.from('clients').select('*').order('name');

    if (error) {
      return NextResponse.json(
        { error: '施設一覧の取得に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      clients: data || [],
      count: data?.length || 0,
    });
  } catch (error) {
    console.error('GET /api/clients error:', error);
    return NextResponse.json(
      { error: '施設一覧の取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, facility_type, contact_name } = body;

    if (!name) {
      return NextResponse.json(
        { error: '施設名は必須です' },
        { status: 400 }
      );
    }

    const clientId = uuidv4();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('clients')
      .insert([
        {
          id: clientId,
          name,
          facility_type: facility_type || '',
          contact_name: contact_name || '',
          safety_threshold_pct: 50,
          total_threshold_pct: 80,
          created_at: now,
        }
      ])
      .select();

    if (error) {
      console.error('Failed to create client:', error);
      return NextResponse.json(
        { error: '施設の作成に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      client: data?.[0],
      id: clientId,
    });
  } catch (error) {
    console.error('POST /api/clients error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '施設の作成に失敗しました' },
      { status: 500 }
    );
  }
}
