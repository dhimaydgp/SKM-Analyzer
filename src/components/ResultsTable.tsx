import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Eye,
  Edit3,
  Globe,
  Tag,
  ShieldAlert,
  ArrowUpDown,
  Download,
} from 'lucide-react';
import { SkmClassificationResult } from '../types/skm';

interface ResultsTableProps {
  results: SkmClassificationResult[];
  onOpenReview: (item: SkmClassificationResult) => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({
  results,
  onOpenReview,
  activeFilter,
  setActiveFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedThemeFilter, setSelectedThemeFilter] = useState('ALL');
  const [sortField, setSortField] = useState<'no' | 'keyakinan' | 'perlu_cek'>('no');
  const [sortAsc, setSortAsc] = useState(true);

  // Filtered and searched data
  const filteredData = useMemo(() => {
    return results.filter(item => {
      // Metric filter
      if (activeFilter === 'need_review' && !item.perlu_cek) return false;
      if (activeFilter === 'escalation' && !item.eskalasi_perlu) return false;
      if (activeFilter === 'dialect' && !item.bahasa_daerah) return false;
      if (activeFilter === 'positive' && item.sentimen !== 'Positif') return false;
      if (activeFilter === 'negative' && item.sentimen !== 'Negatif') return false;

      // Theme filter
      if (selectedThemeFilter !== 'ALL') {
        if (!item.tema_utama.startsWith(selectedThemeFilter)) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchKomentar = item.komentar_asli?.toLowerCase().includes(query);
        const matchRingkasan = item.ringkasan.toLowerCase().includes(query);
        const matchKutipan = item.kutipan.toLowerCase().includes(query);
        const matchLayanan = item.layanan_disebut.toLowerCase().includes(query);
        const matchTema = item.tema_utama.toLowerCase().includes(query);
        if (!matchKomentar && !matchRingkasan && !matchKutipan && !matchLayanan && !matchTema) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortField === 'no') {
        return sortAsc ? a.no - b.no : b.no - a.no;
      }
      if (sortField === 'perlu_cek') {
        return sortAsc ? (a.perlu_cek === b.perlu_cek ? 0 : a.perlu_cek ? -1 : 1) : (a.perlu_cek === b.perlu_cek ? 0 : a.perlu_cek ? 1 : -1);
      }
      return 0;
    });
  }, [results, activeFilter, selectedThemeFilter, searchQuery, sortField, sortAsc]);

  const toggleSort = (field: 'no' | 'perlu_cek') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  if (results.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-12 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <Filter className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900 mb-1">
          Belum Ada Hasil Klasifikasi Komentar
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
          Masukkan komentar masyarakat dari survei kepuasan masyarakat (SKM) di formulir atas atau klik tombol muat contoh Purbalingga.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden mb-6">
      {/* Controls Bar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari komentar, layanan, ringkasan, atau kata kunci..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Tema:</span>
            <select
              value={selectedThemeFilter}
              onChange={e => setSelectedThemeFilter(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            >
              <option value="ALL">Semua Tema</option>
              <option value="T1">T1 Persyaratan</option>
              <option value="T2">T2 Sistem & Prosedur</option>
              <option value="T3">T3 Waktu Penyelesaian</option>
              <option value="T4">T4 Biaya/Tarif</option>
              <option value="T5">T5 Produk Spesifikasi</option>
              <option value="T6">T6 Kompetensi Pelaksana</option>
              <option value="T7">T7 Perilaku Pelaksana</option>
              <option value="T8">T8 Penanganan Pengaduan</option>
              <option value="T9">T9 Sarana & Prasarana</option>
              <option value="T10">T10 Aplikasi Alpukat</option>
              <option value="T11">T11 Lainnya</option>
            </select>
          </div>

          <div className="text-xs text-slate-500 tabular-nums">
            Menampilkan <strong>{filteredData.length}</strong> dari {results.length} data
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-700 font-semibold">
              <th
                onClick={() => toggleSort('no')}
                className="py-3 px-3 w-12 cursor-pointer hover:bg-slate-200/60"
              >
                <div className="flex items-center gap-1">
                  <span>No</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 min-w-[280px]">Komentar & Kutipan Terpilih</th>
              <th className="py-3 px-3 w-28">Status & Sentimen</th>
              <th className="py-3 px-3 min-w-[180px]">Tema Layanan</th>
              <th className="py-3 px-3 w-36">Eskalasi Khusus</th>
              <th
                onClick={() => toggleSort('perlu_cek')}
                className="py-3 px-3 w-28 cursor-pointer hover:bg-slate-200/60"
              >
                <div className="flex items-center gap-1">
                  <span>Pemeriksaan</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3 w-28 text-right">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredData.map(item => {
              const isNonMeaningful = item.status_data !== 'Bermakna';
              return (
                <tr
                  key={item.no}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    item.eskalasi_perlu
                      ? 'bg-red-50/20'
                      : item.perlu_cek && !item.diverifikasi
                      ? 'bg-amber-50/20'
                      : ''
                  }`}
                >
                  {/* No */}
                  <td className="py-3 px-3 font-mono font-medium text-slate-600 tabular-nums align-top">
                    {item.no}
                  </td>

                  {/* Komentar & Kutipan */}
                  <td className="py-3 px-4 align-top">
                    <div className="space-y-1">
                      {item.layanan_disebut && (
                        <div className="text-[11px] font-semibold text-emerald-800">
                          Layanan: {item.layanan_disebut}
                        </div>
                      )}
                      <p className="text-slate-900 font-medium text-xs leading-relaxed">
                        {item.komentar_asli || '-'}
                      </p>

                      {/* Ringkasan & Kutipan */}
                      {item.ringkasan && (
                        <div className="text-[11px] text-slate-600 pt-1">
                          <span className="font-semibold text-slate-700">Ringkasan:</span>{' '}
                          {item.ringkasan}
                        </div>
                      )}

                      {item.kutipan && (
                        <div className="text-[11px] text-slate-500 italic bg-slate-50 px-2 py-1 rounded border border-slate-200 inline-block mt-1">
                          "{item.kutipan}"
                        </div>
                      )}

                      {item.bahasa_daerah && (
                        <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium pt-0.5">
                          <Globe className="w-3 h-3" />
                          <span>Memuat dialek Banyumasan</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Status & Sentimen */}
                  <td className="py-3 px-3 align-top whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-slate-800">
                        {item.status_data}
                      </div>
                      <div>
                        {item.sentimen === 'Positif' && (
                          <span className="text-emerald-700 font-medium">Positif</span>
                        )}
                        {item.sentimen === 'Negatif' && (
                          <span className="text-rose-700 font-medium">Negatif</span>
                        )}
                        {item.sentimen === 'Campuran' && (
                          <span className="text-purple-700 font-medium">Campuran</span>
                        )}
                        {item.sentimen === 'Netral' && (
                          <span className="text-slate-600 font-medium">Netral</span>
                        )}
                        {item.sentimen === 'Tidak dinilai' && (
                          <span className="text-slate-400">Tidak dinilai</span>
                        )}
                      </div>
                      {item.jenis && item.jenis.length > 0 && (
                        <div className="text-[11px] text-slate-500">
                          {item.jenis.join(', ')}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Tema Layanan */}
                  <td className="py-3 px-3 align-top">
                    {isNonMeaningful ? (
                      <span className="text-slate-400 text-xs">Tidak ada</span>
                    ) : (
                      <div className="space-y-1">
                        <div className="text-xs font-semibold text-slate-900">
                          {item.tema_utama}
                        </div>
                        {item.tema_sekunder && item.tema_sekunder.length > 0 && (
                          <div className="text-[11px] text-slate-500">
                            Sekunder: {item.tema_sekunder.join(' · ')}
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Eskalasi */}
                  <td className="py-3 px-3 align-top">
                    {item.eskalasi_perlu ? (
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-red-700 font-bold text-xs">
                          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                          <span>{item.eskalasi_kategori.slice(0, 2)}</span>
                        </div>
                        <p className="text-[11px] text-red-800 leading-tight">
                          {item.eskalasi_kategori.slice(3)}
                        </p>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">Nihil</span>
                    )}
                  </td>

                  {/* Status Cek & Keyakinan */}
                  <td className="py-3 px-3 align-top">
                    <div className="space-y-1">
                      {item.perlu_cek ? (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-amber-700 font-semibold text-xs">
                            <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>Perlu Cek</span>
                          </div>
                          <div className="text-[10px] text-amber-800 leading-tight">
                            {item.alasan_cek || 'Verifikasi manusia'}
                          </div>
                        </div>
                      ) : (
                        <div className="text-slate-500 text-[11px]">Otomatis OK</div>
                      )}

                      <div className="text-[11px] text-slate-400">
                        Keyakinan: {item.keyakinan}
                      </div>

                      {item.diverifikasi && (
                        <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                          <CheckCircle className="w-3 h-3" />
                          <span>Diverifikasi</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 align-top text-right">
                    <button
                      onClick={() => onOpenReview(item)}
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded transition-colors shadow-xs inline-flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3 text-slate-500" />
                      <span>{item.diverifikasi ? 'Detail' : 'Periksa'}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
