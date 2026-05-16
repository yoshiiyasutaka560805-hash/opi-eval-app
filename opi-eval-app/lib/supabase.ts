import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Client, Candidate, Evaluation } from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

// Client operations
export async function getClients() {
  const { data, error } = await supabase.from('clients').select('*');
  if (error) throw error;
  return data as Client[];
}

export async function getClient(id: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Client;
}

export async function createClient(client: Omit<Client, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('clients')
    .insert([client])
    .select()
    .single();
  if (error) throw error;
  return data as Client;
}

export async function updateClient(id: string, updates: Partial<Client>) {
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Client;
}

// Candidate operations
export async function getCandidates(clientId: string) {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Candidate[];
}

export async function getAllCandidates() {
  try {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Candidate[];
  } catch (err) {
    // デモモード: Supabase に接続できない場合、サンプルデータを返す
    console.log('Using demo mode data');
    return getDemoCandidates();
  }
}

function getDemoCandidates(): Candidate[] {
  return [
    {
      id: '1',
      client_id: '1',
      name: 'グエン・ティ・ハー',
      nationality: 'ベトナム',
      birthdate: '1995-05-15',
      visa_type: '特定技能1号',
      native_language: 'ベトナム語',
      care_experience: true,
      jlpt_level: 'N3',
      jft_score: 75,
      interview_date: '2026-05-10',
      submission_count: 1,
      last_submitted_at: '2026-05-10T10:00:00Z',
      submission_status: 'submitted',
      submission_history: [{ submitted_at: '2026-05-10T10:00:00Z', status: 'submitted' }],
      result_pdf_url: 'https://example.com/result1.pdf',
      created_at: '2026-05-10T10:00:00Z'
    },
    {
      id: '2',
      client_id: '1',
      name: 'マルセロ・サントス',
      nationality: 'ブラジル',
      birthdate: '1990-08-20',
      visa_type: '介護',
      native_language: 'ポルトガル語',
      care_experience: false,
      jlpt_level: 'N2',
      jft_score: 82,
      interview_date: '2026-05-12',
      submission_count: 1,
      last_submitted_at: '2026-05-12T14:30:00Z',
      submission_status: 'submitted',
      submission_history: [{ submitted_at: '2026-05-12T14:30:00Z', status: 'submitted' }],
      result_pdf_url: 'https://example.com/result2.pdf',
      created_at: '2026-05-12T14:30:00Z'
    },
    {
      id: '3',
      client_id: '1',
      name: 'フェ・アイラ',
      nationality: 'フィリピン',
      birthdate: '1998-03-10',
      visa_type: '特定技能1号',
      native_language: 'タガログ語',
      care_experience: true,
      jlpt_level: 'N3',
      jft_score: 70,
      interview_date: '2026-05-14',
      submission_count: 1,
      last_submitted_at: '2026-05-14T09:15:00Z',
      submission_status: 'submitted',
      submission_history: [{ submitted_at: '2026-05-14T09:15:00Z', status: 'submitted' }],
      result_pdf_url: 'https://example.com/result3.pdf',
      created_at: '2026-05-14T09:15:00Z'
    }
  ];
}

export async function getCandidate(id: string) {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Candidate;
}

export async function createCandidate(candidate: Omit<Candidate, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('candidates')
    .insert([candidate])
    .select()
    .single();
  if (error) throw error;
  return data as Candidate;
}

export async function updateCandidate(id: string, updates: Partial<Candidate>) {
  const { data, error } = await supabase
    .from('candidates')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Candidate;
}

// Evaluation operations
export async function getEvaluations(candidateId: string) {
  const { data, error } = await supabase
    .from('evaluations')
    .select('*')
    .eq('candidate_id', candidateId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Evaluation[];
}

export async function getEvaluation(id: string) {
  const { data, error } = await supabase
    .from('evaluations')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Evaluation;
}

export async function createEvaluation(evaluation: Omit<Evaluation, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('evaluations')
    .insert([evaluation])
    .select()
    .single();
  if (error) throw error;
  return data as Evaluation;
}

export async function updateEvaluation(id: string, updates: Partial<Evaluation>) {
  const { data, error } = await supabase
    .from('evaluations')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Evaluation;
}

export async function deleteEvaluation(id: string) {
  const { error } = await supabase.from('evaluations').delete().eq('id', id);
  if (error) throw error;
}

// PDF operations
export async function uploadPDF(bucket: 'candidate-documents' | 'result-documents', file: File, candidateId: string) {
  const timestamp = Date.now();
  const filename = `${candidateId}/${timestamp}-${file.name}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filename, file, { upsert: false });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filename);

  return urlData.publicUrl;
}

export async function getPDFUrl(bucket: 'candidate-documents' | 'result-documents', filename: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
  return data.publicUrl;
}

export async function updateCandidatePDFUrls(candidateId: string, userPdfUrl?: string, resultPdfUrl?: string) {
  const updates: Partial<Candidate> = {};
  if (userPdfUrl !== undefined) updates.user_pdf_url = userPdfUrl;
  if (resultPdfUrl !== undefined) updates.result_pdf_url = resultPdfUrl;

  return updateCandidate(candidateId, updates);
}
