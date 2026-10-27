import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  Info,
} from 'lucide-react';
import {
  SkmClassificationResult,
  StatusData,
  Sentimen,
  JenisIsi,
  TemaUtama,
  EskalasiKategori,
  Keyakinan,
} from '../types/skm';

interface ReviewModalProps {
  item: SkmClassificationResult | null;
  onClose: () => void;
  onSave: (updatedItem: SkmClassificationResult) => void;
}

const ALL_TEMAS: TemaUtama[] = [
  'T1 Persyaratan',
  'T2 Sistem, mekanisme, prosedur',
  'T3 Waktu penyelesaian',
  'T4 Biaya/tarif',
  'T5 Produk spesifikasi layanan',
  'T6 Kompetensi pelaksana',
  'T7 Perilaku pelaksana',
  'T8 Penanganan pengaduan, saran, masukan',
  'T9 Sarana dan prasarana',
  'T10 Sistem informasi/aplikasi',
  'T11 Lainnya',
  'Tidak ada',
];

const ALL_ESKALASI: EskalasiKategori[] = [
  'Tidak ada',
  'E1 dugaan pungli, gratifikasi, atau permintaan imbalan/uang',
  'E2 dugaan pelecehan, perundungan, atau diskriminasi',
  'E3 dugaan kecurangan, calo, atau manipulasi data/jalur belakang',
  'E4 dugaan kebocoran atau penyalahgunaan data pribadi',
  'E5 ancaman keselamatan atau kondisi darurat',
];

export const ReviewModal: React.FC<ReviewModalProps> = ({ item, onClose, onSave }) => {
  if (!item) return null;

  const [formData, setFormData] = useState<SkmClassificationResult>({ ...item });
  const [officerName, setOfficerName] = useState(item.petugas_pemeriksa || 'Petugas Analis SKM');
  const [verificationNote, setVerificationNote] = useState(item.catatan_petugas || '');

  useEffect(() => {
    setFormData({ ...item });
    setOfficerName(item.petugas_pemeriksa || 'Petugas Analis SKM');
    setVerificationNote(item.catatan_petugas || '');
  }, [item]);

  const handleToggleJenis = (jenisVal: JenisIsi) => {
    const current = [...formData.jenis];
    const index = current.indexOf(jenisVal);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(jenisVal);
    }
    setFormData({ ...formData, jenis: current });
  };

  const handleSaveVerified = (markAsVerified: boolean) => {
    const updated: SkmClassificationResult = {
      ...formData,
      diverifikasi: markAsVerified,
      petugas_pemeriksa: officerName,
      catatan_petugas: verificationNote,
      waktu_verifikasi: markAsVerified ? new Date().toISOString() : undefined,
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-emerald-800 text-white flex items-center justify-center text-xs font-bold font-mono">
              #{formData.no}
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Pemeriksaan & Validasi Petugas Analis
              </h2>
              <p className="text-xs text-slate-500">
                Verifikasi manusia atas klasifikasi awal AI BKPSDM Purbalingga
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5 text-xs">
          {/* Escalation Alert if present */}
          {formData.eskalasi_perlu && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-red-900">
                  Perhatian: Komentar memuat indikasi {formData.eskalasi_kategori.slice(0, 2)}
                </span>
                <p className="text-red-700 mt-0.5 leading-relaxed">
                  Ingat: Petugas hanya menandai dugaan untuk ditindaklanjuti tim verifikator/inspektorat. Jangan menyimpulkan benar atau salahnya tuduhan di ringkasan.
                </p>
              </div>
            </div>
          )}

          {/* Original Comment */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">
              Teks Komentar Asli dari SKM Alpukat
            </label>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md font-mono text-xs text-slate-900 leading-relaxed">
              {formData.komentar_asli}
            </div>
          </div>

          {/* Service & Dialect Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Layanan Disebut (isi "" jika tidak disebut)
              </label>
              <input
                type="text"
                value={formData.layanan_disebut}
                onChange={e => setFormData({ ...formData, layanan_disebut: e.target.value })}
                placeholder="Contoh: Kenaikan Pangkat, Mutasi, Pensiun"
                className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-700 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="check-bahasa-daerah"
                checked={formData.bahasa_daerah}
                onChange={e => setFormData({ ...formData, bahasa_daerah: e.target.checked })}
                className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-700 w-4 h-4"
              />
              <label htmlFor="check-bahasa-daerah" className="text-slate-700 font-medium">
                Memuat Bahasa Daerah (Jawa/Banyumasan)
              </label>
            </div>
          </div>

          {/* Status Data, Sentimen & Keyakinan */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Status Data</label>
              <select
                value={formData.status_data}
                onChange={e =>
                  setFormData({ ...formData, status_data: e.target.value as StatusData })
                }
                className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-700 focus:outline-none"
              >
                <option value="Bermakna">Bermakna</option>
                <option value="Tidak bermakna">Tidak bermakna</option>
                <option value="Tidak relevan">Tidak relevan</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Sentimen</label>
              <select
                value={formData.sentimen}
                onChange={e =>
                  setFormData({ ...formData, sentimen: e.target.value as Sentimen })
                }
                className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-700 focus:outline-none"
              >
                <option value="Positif">Positif</option>
                <option value="Netral">Netral</option>
                <option value="Negatif">Negatif</option>
                <option value="Campuran">Campuran</option>
                <option value="Tidak dinilai">Tidak dinilai</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Keyakinan Analisis</label>
              <select
                value={formData.keyakinan}
                onChange={e =>
                  setFormData({ ...formData, keyakinan: e.target.value as Keyakinan })
                }
                className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-700 focus:outline-none"
              >
                <option value="Tinggi">Tinggi</option>
                <option value="Sedang">Sedang</option>
                <option value="Rendah">Rendah</option>
              </select>
            </div>
          </div>

          {/* Jenis Isi */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1.5">
              Jenis Isi (Pilih yang relevan)
            </label>
            <div className="flex gap-4">
              {(['Keluhan', 'Apresiasi', 'Saran', 'Pertanyaan'] as JenisIsi[]).map(j => (
                <label key={j} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.jenis.includes(j)}
                    onChange={() => handleToggleJenis(j)}
                    className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-700"
                  />
                  <span>{j}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tema Utama */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Tema Utama (T1 - T11)
            </label>
            <select
              value={formData.tema_utama}
              onChange={e =>
                setFormData({ ...formData, tema_utama: e.target.value as TemaUtama })
              }
              className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-700 focus:outline-none font-medium"
            >
              {ALL_TEMAS.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Eskalasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Kategori Eskalasi Khusus (E1 - E5)
              </label>
              <select
                value={formData.eskalasi_kategori}
                onChange={e => {
                  const val = e.target.value as EskalasiKategori;
                  setFormData({
                    ...formData,
                    eskalasi_kategori: val,
                    eskalasi_perlu: val !== 'Tidak ada',
                  });
                }}
                className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-700 focus:outline-none"
              >
                {ALL_ESKALASI.map(e => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Perlu Cek Manusia & Alasan
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  id="check-perlu-cek"
                  checked={formData.perlu_cek}
                  onChange={e => setFormData({ ...formData, perlu_cek: e.target.checked })}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <input
                  type="text"
                  value={formData.alasan_cek}
                  onChange={e => setFormData({ ...formData, alasan_cek: e.target.value })}
                  placeholder="Alasan cek..."
                  className="flex-1 p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-700 focus:outline-none text-xs"
                />
              </div>
            </div>
          </div>

          {/* Ringkasan (max 20 kata) & Kutipan (max 25 kata) */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">
                  Ringkasan (Maksimal 20 kata, bahasa baku)
                </label>
                <span className="text-[11px] text-slate-400">
                  {formData.ringkasan.split(/\s+/).filter(Boolean).length} / 20 kata
                </span>
              </div>
              <input
                type="text"
                value={formData.ringkasan}
                onChange={e => setFormData({ ...formData, ringkasan: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700">
                  Kutipan Tepat (Maksimal 25 kata persis dari teks)
                </label>
                <span className="text-[11px] text-slate-400">
                  {formData.kutipan.split(/\s+/).filter(Boolean).length} / 25 kata
                </span>
              </div>
              <input
                type="text"
                value={formData.kutipan}
                onChange={e => setFormData({ ...formData, kutipan: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded focus:ring-1 focus:ring-emerald-700 focus:outline-none italic"
              />
            </div>
          </div>

          {/* Officer Verification Form */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-emerald-900 font-semibold">
              <UserCheck className="w-4 h-4 text-emerald-700" />
              <span>Verifikasi oleh Petugas Manusia (BKPSDM)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-slate-700 block mb-1">Nama Petugas / NIP</label>
                <input
                  type="text"
                  value={officerName}
                  onChange={e => setOfficerName(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-emerald-700 text-xs"
                />
              </div>
              <div>
                <label className="font-medium text-slate-700 block mb-1">
                  Catatan Tindak Lanjut / Rekomendasi
                </label>
                <input
                  type="text"
                  value={verificationNote}
                  onChange={e => setVerificationNote(e.target.value)}
                  placeholder="Contoh: Diteruskan ke Bidang Mutasi untuk perbaikan SK..."
                  className="w-full p-2 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-emerald-700 text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-xs font-medium transition-colors"
          >
            Batal
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSaveVerified(false)}
              className="px-4 py-2 border border-emerald-700 text-emerald-800 hover:bg-emerald-50 rounded text-xs font-semibold transition-colors"
            >
              Simpan Perubahan (Belum Diverifikasi)
            </button>
            <button
              onClick={() => handleSaveVerified(true)}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Konfirmasi & Tandai Selesai Diperiksa</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
