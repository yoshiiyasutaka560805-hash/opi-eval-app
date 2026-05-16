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
