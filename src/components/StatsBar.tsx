import React from 'react';
import { AlertTriangle, AlertCircle, MessageSquare, ThumbsUp, ThumbsDown, Globe, CheckCircle } from 'lucide-react';
import { SkmClassificationResult } from '../types/skm';

interface StatsBarProps {
  results: SkmClassificationResult[];
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({ results, activeFilter, onSelectFilter }) => {
  const total = results.length;
  const meaningful = results.filter(r => r.status_data === 'Bermakna').length;
  const needReview = results.filter(r => r.perlu_cek).length;
  const escalation = results.filter(r => r.eskalasi_perlu).length;
  const banyumasan = results.filter(r => r.bahasa_daerah).length;
  
  const positive = results.filter(r => r.sentimen === 'Positif').length;
  const negative = results.filter(r => r.sentimen === 'Negatif').length;
  const neutral = results.filter(r => r.sentimen === 'Netral').length;
  const mixed = results.filter(r => r.sentimen === 'Campuran').length;
  const verified = results.filter(r => r.diverifikasi).length;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm mb-6">
      {/* Alert Banner for Escalations if any */}
      {escalation > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center justify-between text-xs text-red-900">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-semibold">
              Perhatian: Terdeteksi {escalation} komentar dengan potensi dugaan eskalasi (Pungli/Pelecehan/Kecurangan).
            </span>
            <span className="text-red-700 hidden sm:inline">
              Data hanya ditandai untuk pemeriksaan petugas inspektorat/tim verifikator, bukan vonis kebenaran.
            </span>
          </div>
          <button
            onClick={() => onSelectFilter('escalation')}
            className="px-2.5 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors whitespace-nowrap shrink-0"
          >
            Lihat Eskalasi
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Komentar */}
        <button
          onClick={() => onSelectFilter('all')}
          className={`text-left p-3 rounded-md transition-colors border ${
            activeFilter === 'all'
              ? 'bg-slate-50 border-slate-400'
              : 'border-slate-100 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Total Masukan</span>
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-bold text-slate-900 tabular-nums">
            {total}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {meaningful} Bermakna
          </div>
        </button>

        {/* Butuh Periksa (Perlu Cek) */}
        <button
          onClick={() => onSelectFilter('need_review')}
          className={`text-left p-3 rounded-md transition-colors border ${
            activeFilter === 'need_review'
              ? 'bg-amber-50/70 border-amber-400'
              : 'border-slate-100 hover:bg-amber-50/40'
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-xs font-medium">Perlu Cek Manusia</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-amber-900 tabular-nums">
            {needReview}
          </div>
          <div className="text-[11px] text-amber-700 mt-0.5">
            {verified} Sudah diverifikasi
          </div>
        </button>

        {/* Eskalasi */}
        <button
          onClick={() => onSelectFilter('escalation')}
          className={`text-left p-3 rounded-md transition-colors border ${
            activeFilter === 'escalation'
              ? 'bg-red-50/70 border-red-400'
              : 'border-slate-100 hover:bg-red-50/30'
          }`}
        >
          <div className="flex items-center justify-between text-red-700 mb-1">
            <span className="text-xs font-medium">Eskalasi (E1-E5)</span>
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
          </div>
          <div className="text-xl font-bold text-red-900 tabular-nums">
            {escalation}
          </div>
          <div className="text-[11px] text-red-600 mt-0.5">
            {escalation > 0 ? 'Prioritas verifikasi' : 'Nihil eskalasi'}
          </div>
        </button>

        {/* Bahasa Banyumasan */}
        <button
          onClick={() => onSelectFilter('dialect')}
          className={`text-left p-3 rounded-md transition-colors border ${
            activeFilter === 'dialect'
              ? 'bg-emerald-50/70 border-emerald-400'
              : 'border-slate-100 hover:bg-emerald-50/30'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-800 mb-1">
            <span className="text-xs font-medium">Banyumasan / Jawa</span>
            <Globe className="w-3.5 h-3.5 text-emerald-700" />
          </div>
          <div className="text-xl font-bold text-emerald-950 tabular-nums">
            {banyumasan}
          </div>
          <div className="text-[11px] text-emerald-700 mt-0.5">
            Dialek lokal Purbalingga
          </div>
        </button>

        {/* Sentimen Positif */}
        <button
          onClick={() => onSelectFilter('positive')}
          className={`text-left p-3 rounded-md transition-colors border ${
            activeFilter === 'positive'
              ? 'bg-emerald-50/70 border-emerald-400'
              : 'border-slate-100 hover:bg-emerald-50/30'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-xs font-medium">Sentimen Positif</span>
            <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-900 tabular-nums">
            {positive}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Apresiasi masyarakat
          </div>
        </button>

        {/* Sentimen Negatif & Keluhan */}
        <button
          onClick={() => onSelectFilter('negative')}
          className={`text-left p-3 rounded-md transition-colors border ${
            activeFilter === 'negative'
              ? 'bg-rose-50/70 border-rose-400'
              : 'border-slate-100 hover:bg-rose-50/30'
          }`}
        >
          <div className="flex items-center justify-between text-rose-700 mb-1">
            <span className="text-xs font-medium">Sentimen Negatif</span>
            <ThumbsDown className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-xl font-bold text-rose-900 tabular-nums">
            {negative}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {mixed} Campuran / {neutral} Netral
          </div>
        </button>
      </div>
    </div>
  );
};
