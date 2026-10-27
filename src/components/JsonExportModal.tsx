import React, { useState } from 'react';
import { Copy, Check, Download, FileJson, FileSpreadsheet, ArrowLeft } from 'lucide-react';
import { SkmClassificationResult } from '../types/skm';

interface JsonExportModalProps {
  results: SkmClassificationResult[];
  onBack: () => void;
}

export const JsonExportModal: React.FC<JsonExportModalProps> = ({ results, onBack }) => {
  const [copied, setCopied] = useState(false);
  const [includeReviewMetadata, setIncludeReviewMetadata] = useState(false);

  // Strip internal properties to match the strict prompt output schema
  const cleanJsonData = results.map(item => {
    const base: Record<string, any> = {
      no: item.no,
      status_data: item.status_data,
      sentimen: item.sentimen,
      jenis: item.jenis,
      tema_utama: item.tema_utama,
      tema_sekunder: item.tema_sekunder,
      eskalasi_perlu: item.eskalasi_perlu,
      eskalasi_kategori: item.eskalasi_kategori,
      keyakinan: item.keyakinan,
      perlu_cek: item.perlu_cek,
      alasan_cek: item.alasan_cek,
      bahasa_daerah: item.bahasa_daerah,
      layanan_disebut: item.layanan_disebut,
      ringkasan: item.ringkasan,
      kutipan: item.kutipan,
    };

    if (includeReviewMetadata) {
      base.diverifikasi = item.diverifikasi || false;
      base.catatan_petugas = item.catatan_petugas || '';
      base.petugas_pemeriksa = item.petugas_pemeriksa || '';
      base.waktu_verifikasi = item.waktu_verifikasi || '';
    }

    return base;
  });

  const formattedJsonString = JSON.stringify(cleanJsonData, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedJsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([formattedJsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skm_alpukat_purbalingga_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    if (results.length === 0) return;

    const headers = [
      'No',
      'Komentar Asli',
      'Status Data',
      'Sentimen',
      'Jenis Isi',
      'Tema Utama',
      'Tema Sekunder',
      'Eskalasi Perlu',
      'Eskalasi Kategori',
      'Keyakinan',
      'Perlu Cek',
      'Alasan Cek',
      'Bahasa Daerah',
      'Layanan Disebut',
      'Ringkasan',
      'Kutipan',
    ];

    const rows = results.map(item => [
      item.no,
      `"${(item.komentar_asli || '').replace(/"/g, '""')}"`,
      `"${item.status_data}"`,
      `"${item.sentimen}"`,
      `"${item.jenis.join('; ')}"`,
      `"${item.tema_utama}"`,
      `"${item.tema_sekunder.join('; ')}"`,
      item.eskalasi_perlu ? 'Ya' : 'Tidak',
      `"${item.eskalasi_kategori}"`,
      `"${item.keyakinan}"`,
      item.perlu_cek ? 'Ya' : 'Tidak',
      `"${item.alasan_cek}"`,
      item.bahasa_daerah ? 'Ya' : 'Tidak',
      `"${item.layanan_disebut}"`,
      `"${item.ringkasan.replace(/"/g, '""')}"`,
      `"${item.kutipan.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skm_alpukat_purbalingga_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <button
            onClick={onBack}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Tabel Data</span>
          </button>
          <h2 className="text-base font-bold text-slate-900">
            Format Keluaran JSON & Ekspor Data SKM
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Array JSON murni sesuai aturan prompt: tanpa teks pembuka, penutup, atau markdown.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <label className="flex items-center gap-1.5 text-xs text-slate-600 mr-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeReviewMetadata}
              onChange={e => setIncludeReviewMetadata(e.target.checked)}
              className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-700"
            />
            <span>Sertakan Data Verifikasi Petugas</span>
          </label>

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Tersalin ke Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin JSON Array</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadJson}
            className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh JSON</span>
          </button>

          <button
            onClick={handleDownloadCsv}
            className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Unduh CSV</span>
          </button>
        </div>
      </div>

      <div className="mt-4">
        <div className="relative">
          <pre className="w-full h-[550px] p-4 bg-slate-900 text-emerald-300 rounded-lg text-xs font-mono overflow-auto leading-relaxed border border-slate-800 select-all">
            {formattedJsonString}
          </pre>
        </div>
      </div>
    </div>
  );
};
