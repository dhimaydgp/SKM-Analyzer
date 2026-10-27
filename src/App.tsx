import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { InputSection } from './components/InputSection';
import { ResultsTable } from './components/ResultsTable';
import { ReviewModal } from './components/ReviewModal';
import { JsonExportModal } from './components/JsonExportModal';
import { GlossaryModal } from './components/GlossaryModal';
import {
  PRESET_KOMENTAR_PURBALINGGA,
  formatAsInputText,
  heuristicClassifySingle,
} from './utils/classifierEngine';
import { InputComment, SkmClassificationResult } from './types/skm';
import { CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'workspace' | 'review' | 'export'>('workspace');
  const [inputText, setInputText] = useState<string>('');
  const [results, setResults] = useState<SkmClassificationResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [engineSource, setEngineSource] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedReviewItem, setSelectedReviewItem] = useState<SkmClassificationResult | null>(null);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Initialize with the standard representative Purbalingga presets on first mount
  useEffect(() => {
    const formatted = formatAsInputText(PRESET_KOMENTAR_PURBALINGGA);
    setInputText(formatted);

    // Initial local baseline classification
    const initialResults = PRESET_KOMENTAR_PURBALINGGA.map(c => heuristicClassifySingle(c));
    setResults(initialResults);
    setEngineSource('Sistem Aturan Purbalingga (Siap)');
  }, []);

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  // Run AI classification via server endpoint or fallback
  const handleClassify = async (comments: InputComment[]) => {
    setIsLoading(true);
    setNotification(null);

    try {
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comments }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data.results)) {
        setResults(data.results);
        setEngineSource(data.source === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash (AI Studio)' : 'Sistem Aturan Analis');
        showNotification(`Berhasil menganalisis ${data.results.length} komentar SKM.`, 'success');
      } else {
        throw new Error('Format respon tidak sesuai.');
      }
    } catch (err: any) {
      console.warn('API call failed, running high-precision client rule engine:', err?.message);
      // Run high-precision heuristic rule engine as fallback
      const fallbackResults = comments.map(c => heuristicClassifySingle(c));
      setResults(fallbackResults);
      setEngineSource('Sistem Aturan Lokal (Fallback)');
      showNotification(`Klasifikasi selesai dengan Sistem Aturan (${comments.length} komentar).`, 'info');
    } finally {
      setIsLoading(false);
    }
  };

  // Update item after human review
  const handleSaveReviewedItem = (updatedItem: SkmClassificationResult) => {
    setResults(prev => prev.map(item => (item.no === updatedItem.no ? updatedItem : item)));
    showNotification(`Komentar #${updatedItem.no} berhasil diperbarui & dicatat oleh petugas.`, 'success');
  };

  const needReviewCount = results.filter(r => r.perlu_cek && !r.diverifikasi).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-emerald-200">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold bg-slate-900 text-white animate-in slide-in-from-bottom-2">
          {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {notification.type === 'info' && <ShieldCheck className="w-4 h-4 text-amber-400" />}
          {notification.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        totalComments={results.length}
        needReviewCount={needReviewCount}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Workspace Tab: Input + Stats + Table */}
        {activeTab === 'workspace' && (
          <>
            {/* Input Section */}
            <InputSection
              inputText={inputText}
              setInputText={setInputText}
              onClassify={handleClassify}
              isLoading={isLoading}
              engineSource={engineSource}
            />

            {/* Stats Overview */}
            <StatsBar
              results={results}
              activeFilter={activeFilter}
              onSelectFilter={setActiveFilter}
            />

            {/* Results Table */}
            <ResultsTable
              results={results}
              onOpenReview={item => setSelectedReviewItem(item)}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
            />
          </>
        )}

        {/* Human Verification (Review) Tab */}
        {activeTab === 'review' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-800" />
                    <span>Panel Verifikasi Petugas Manusia (Human-in-the-Loop)</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Memfilter khusus komentar yang memerlukan perhatian manusia: potensi eskalasi (E1-E5), keyakinan rendah, atau data pribadi tersisa.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">
                    Sisa Butuh Verifikasi: <strong className="text-amber-800 tabular-nums">{needReviewCount}</strong> dari {results.length}
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <ResultsTable
                  results={results.filter(r => r.perlu_cek || r.eskalasi_perlu)}
                  onOpenReview={item => setSelectedReviewItem(item)}
                  activeFilter="all"
                  setActiveFilter={() => {}}
                />
              </div>
            </div>
          </div>
        )}

        {/* Format JSON & Export Tab */}
        {activeTab === 'export' && (
          <JsonExportModal
            results={results}
            onBack={() => setActiveTab('workspace')}
          />
        )}
      </main>

      {/* Review Modal */}
      <ReviewModal
        item={selectedReviewItem}
        onClose={() => setSelectedReviewItem(null)}
        onSave={handleSaveReviewedItem}
      />

      {/* Glossary & Rules Modal */}
      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Badan Kepegawaian, Pendidikan dan Pelatihan Daerah (BKPSDM) Kabupaten Purbalingga
          </span>
          <span className="text-slate-400">
            Sistem Klasifikasi Survei Kepuasan Masyarakat (Alpukat SKM)
          </span>
        </div>
      </footer>
    </div>
  );
}
