'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase, getClients, createCandidate } from '@/lib/supabase';
import { Client, VisaType, JLPTLevel } from '@/types';

export default function NewCandidatePage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    client_id: '',
    name: '',
    nationality: '',
    birthdate: '',
    visa_type: '特定技能1号' as VisaType,
    native_language: '',
    care_experience: false,
    jlpt_level: '' as JLPTLevel | '',
    jft_score: '',
    interview_date: '',
  });

  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await getClients();
        setClients(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, client_id: data[0].id }));
        }
      } catch (err) {
        setError('施設情報の読み込みに失敗しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadClients();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (!formData.client_id || !formData.name || !formData.nationality || !formData.birthdate ||
          !formData.visa_type || !formData.native_language || !formData.interview_date) {
        setError('必須項目をすべて入力してください');
        setSubmitting(false);
        return;
      }

      const now = new Date().toISOString();
      const candidate = {
        client_id: formData.client_id,
        name: formData.name,
        nationality: formData.nationality,
        birthdate: formData.birthdate,
        visa_type: formData.visa_type,
        native_language: formData.native_language,
        care_experience: formData.care_experience,
        jlpt_level: formData.jlpt_level ? (formData.jlpt_level as JLPTLevel) : undefined,
        jft_score: formData.jft_score ? parseInt(formData.jft_score) : undefined,
        interview_date: formData.interview_date,
        submission_count: 1,
        last_submitted_at: now,
        submission_status: 'submitted' as const,
        submission_history: [
          {
            submitted_at: now,
            status: 'submitted' as const,
          }
        ],
      };

      const newCandidate = await createCandidate(candidate);
      router.push(`/candidates/${newCandidate.id}`);
    } catch (err) {
      setError('受験者の登録に失敗しました');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center text-gray-500">
          読み込み中...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Navigation */}
        <Link href="/candidates" className="text-blue-600 hover:text-blue-800 mb-6 inline-flex items-center gap-1">
          ← 受験者管理に戻る
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">新規受験者登録</h1>
          <p className="mt-2 text-gray-600">受験者情報を入力して登録します</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
          {/* Client Selection */}
          <div>
            <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 mb-2">
              施設 <span className="text-red-500">*</span>
            </label>
            <select
              id="client_id"
              name="client_id"
              value={formData.client_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">施設を選択してください</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              氏名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Nationality */}
          <div>
            <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 mb-2">
              国籍 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nationality"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例: ベトナム"
              required
            />
          </div>

          {/* Birthdate */}
          <div>
            <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 mb-2">
              生年月日 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="birthdate"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Visa Type */}
          <div>
            <label htmlFor="visa_type" className="block text-sm font-medium text-gray-700 mb-2">
              ビザタイプ <span className="text-red-500">*</span>
            </label>
            <select
              id="visa_type"
              name="visa_type"
              value={formData.visa_type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="特定技能1号">特定技能1号</option>
              <option value="介護">介護</option>
            </select>
          </div>

          {/* Native Language */}
          <div>
            <label htmlFor="native_language" className="block text-sm font-medium text-gray-700 mb-2">
              母語 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="native_language"
              name="native_language"
              value={formData.native_language}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例: ベトナム語"
              required
            />
          </div>

          {/* Care Experience */}
          <div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="care_experience"
                checked={formData.care_experience}
                onChange={handleChange}
                className="w-4 h-4 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">介護経験あり</span>
            </label>
          </div>

          {/* JLPT Level */}
          <div>
            <label htmlFor="jlpt_level" className="block text-sm font-medium text-gray-700 mb-2">
              JLPT レベル (任意)
            </label>
            <select
              id="jlpt_level"
              name="jlpt_level"
              value={formData.jlpt_level}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">未入力</option>
              <option value="N1">N1</option>
              <option value="N2">N2</option>
              <option value="N3">N3</option>
              <option value="N4">N4</option>
              <option value="N5">N5</option>
            </select>
          </div>

          {/* JFT Score */}
          <div>
            <label htmlFor="jft_score" className="block text-sm font-medium text-gray-700 mb-2">
              JFT スコア (任意)
            </label>
            <input
              type="number"
              id="jft_score"
              name="jft_score"
              value={formData.jft_score}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
            />
          </div>

          {/* Interview Date */}
          <div>
            <label htmlFor="interview_date" className="block text-sm font-medium text-gray-700 mb-2">
              面接日 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="interview_date"
              name="interview_date"
              value={formData.interview_date}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Button Group */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400"
            >
              {submitting ? '登録中...' : '登録'}
            </button>
            <Link
              href="/candidates"
              className="flex-1 px-6 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 font-medium text-center"
            >
              キャンセル
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
