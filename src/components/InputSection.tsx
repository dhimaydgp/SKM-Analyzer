import React, { useState } from 'react';
import { Play, Sparkles, RotateCcw, Upload, FileCode, CheckCircle, HelpCircle } from 'lucide-react';
import { PRESET_KOMENTAR_PURBALINGGA, formatAsInputText, parseInputText } from '../utils/classifierEngine';
import { InputComment } from '../types/skm';

interface InputSectionProps {
  inputText: string;
  setInputText: (text: string) => void;
  onClassify: (comments: InputComment[]) => void;
  isLoading: boolean;
  engineSource: string;
}

export const InputSection: React.FC<InputSectionProps> = ({
  inputText,
  setInputText,
  onClassify,
  isLoading,
  engineSource,
}) => {
  const [quickSingle, setQuickSingle] = useState('');
  const [activeInputMode, setActiveInputMode] = useState<'batch' | 'single'>('batch');

  const handleLoadPresets = () => {
    setInputText(formatAsInputText(PRESET_KOMENTAR_PURBALINGGA));
  };

  const handleClear = () => {
    setInputText('');
  };

  const handleSubmitBatch = () => {
    const parsed = parseInputText(inputText);
    if (parsed.length === 0) return;
    onClassify(parsed);
  };

  const handleSubmitSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSingle.trim()) return;
    const singleComment: InputComment[] = [{ no: 1, komentar: quickSingle.trim() }];
    onClassify(singleComment);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        setInputText(content);
      }
    };
    reader.readAsText(file);
  };

  const parsedCount = parseInputText(inputText).length;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm mb-6">
      {/* Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-slate-100 rounded-lg flex items-center gap-1">
            <button
              onClick={() => setActiveInputMode('batch')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeInputMode === 'batch'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Batch Format Standar
            </button>
            <button
              onClick={() => setActiveInputMode('single')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeInputMode === 'single'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Uji Coba Komentar Cepat
            </button>
          </div>
          <span className="text-xs text-slate-400">|</span>
          <span className="text-xs text-slate-500 font-mono">
            Format: NO: &lt;nomor&gt; | KOMENTAR: &lt;teks&gt;
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <label className="cursor-pointer px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1">
            <Upload className="w-3.5 h-3.5" />
            <span>Unggah File (.txt/.csv)</span>
            <input type="file" accept=".txt,.csv" onChange={handleFileUpload} className="hidden" />
          </label>
          <button
            onClick={handleLoadPresets}
            className="px-2.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors flex items-center gap-1"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Muat Contoh SKM Purbalingga (10 Komentar)</span>
          </button>
          {inputText && (
            <button
              onClick={handleClear}
              className="px-2 py-1 text-xs text-slate-500 hover:text-slate-800 transition-colors"
            >
              Kosongkan
            </button>
          )}
        </div>
      </div>

      {activeInputMode === 'batch' ? (
        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Teks Masukan Komentar Survei Kepuasan Masyarakat (SKM)
          </label>
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            rows={7}
            placeholder={`NO: 1 | KOMENTAR: Pelayanan kenaikan pangkat suwe tenan, padahal syarate wis lengkap kabeh dikirim lewat Alpukat SKM.\nNO: 2 | KOMENTAR: Matur nuwun sanget, pengurusan SK pensiun orang tua saya cepet dan petugas ramah pisan.\nNO: 3 | KOMENTAR: ok`}
            className="w-full text-xs font-mono p-3 border border-slate-300 rounded-md bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent leading-relaxed text-slate-800"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3">
            <div className="text-xs text-slate-500 flex items-center gap-3">
              <span>
                Terdeteksi: <strong className="text-slate-800 tabular-nums">{parsedCount}</strong> komentar
              </span>
              <span>·</span>
              <span className="text-slate-600">Model: Gemini 3.8 Flash (Server-Side)</span>
              {engineSource && (
                <>
                  <span>·</span>
                  <span className="text-emerald-700 font-medium">Mesin: {engineSource}</span>
                </>
              )}
            </div>

            <button
              onClick={handleSubmitBatch}
              disabled={isLoading || parsedCount === 0}
              className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-300 text-white text-xs font-semibold rounded-md shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Mengklasifikasikan Komentar...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Jalankan Klasifikasi Analisis Awal</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmitSingle} className="mt-4">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Uji Cepat Satu Komentar
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={quickSingle}
              onChange={e => setQuickSingle(e.target.value)}
              placeholder="Contoh: Petugas pelayanan ramah dan cepat, tapi parkiran motor kurang luas..."
              className="flex-1 text-xs p-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
            <button
              type="submit"
              disabled={isLoading || !quickSingle.trim()}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-300 text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Analisis</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
