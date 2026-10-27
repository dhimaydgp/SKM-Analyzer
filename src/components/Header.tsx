import React from 'react';
import { ShieldCheck, BookOpen, FileText, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  activeTab: 'workspace' | 'review' | 'export';
  setActiveTab: (tab: 'workspace' | 'review' | 'export') => void;
  onOpenGlossary: () => void;
  totalComments: number;
  needReviewCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenGlossary,
  totalComments,
  needReviewCount,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark with official insignia styling */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center font-bold text-sm tracking-wider shadow-sm">
              BP
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-slate-900 tracking-tight whitespace-nowrap">
                Alpukat SKM Analyzer
              </span>
              <span className="text-xs text-slate-500 whitespace-nowrap">
                BKPSDM Kabupaten Purbalingga
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('workspace')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                activeTab === 'workspace'
                  ? 'text-emerald-800 font-semibold border-b-2 border-emerald-800'
                  : ''
              }`}
            >
              Data & Analisis
            </button>
            <button
              onClick={() => setActiveTab('review')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 pb-0.5 ${
                activeTab === 'review'
                  ? 'text-emerald-800 font-semibold border-b-2 border-emerald-800'
                  : ''
              }`}
            >
              <span>Verifikasi Petugas</span>
              {needReviewCount > 0 && (
                <span className="text-xs px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-semibold tabular-nums">
                  {needReviewCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                activeTab === 'export'
                  ? 'text-emerald-800 font-semibold border-b-2 border-emerald-800'
                  : ''
              }`}
            >
              Format JSON & Laporan
            </button>
            <button
              onClick={onOpenGlossary}
              className="text-slate-500 hover:text-slate-800 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Kamus & Aturan SKM</span>
            </button>
          </nav>

          {/* Zone 3: Primary Status Action */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-xs text-slate-500 hidden sm:flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Standar Analisis Awal</span>
            </div>
            <button
              onClick={() => setActiveTab('export')}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-md transition-colors shadow-sm whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Ekspor JSON</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
