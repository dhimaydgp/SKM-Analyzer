import React, { useState } from 'react';
import { X, BookOpen, Shield, Globe, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { BANYUMASAN_GLOSSARY } from '../utils/classifierEngine';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'themes' | 'escalation' | 'dialect' | 'rules'>('themes');

  const themesList = [
    {
      code: 'T1',
      title: 'Persyaratan',
      desc: 'Kejelasan, kesesuaian, kemudahan persyaratan administratif. Syarat yang tidak jelas atau berubah-ubah masuk T1. Jika yang dikeluhkan lamanya proses, pindah ke T3.',
    },
    {
      code: 'T2',
      title: 'Sistem, mekanisme, prosedur',
      desc: 'Alur, tahapan, birokrasi berbelit. Alur berbelit padahal aplikasi normal masuk T2. Gangguan teknis aplikasi masuk T10.',
    },
    {
      code: 'T3',
      title: 'Waktu penyelesaian',
      desc: 'Kecepatan dan ketepatan waktu dibanding yang dijanjikan, termasuk lama menunggu/antre. Jika yang dikeluhkan tempat tunggu yang tidak nyaman, masuk T9.',
    },
    {
      code: 'T4',
      title: 'Biaya/tarif',
      desc: 'Kewajaran dan kesesuaian biaya. Dugaan permintaan uang tetap masuk T4 dan juga ditandai Eskalasi E1.',
    },
    {
      code: 'T5',
      title: 'Produk spesifikasi layanan',
      desc: 'Hasil layanan (SK, surat, dokumen) sesuai janji dan benar isinya, misalnya salah ketik nama pada SK. Sikap petugas saat dikoreksi masuk T7.',
    },
    {
      code: 'T6',
      title: 'Kompetensi pelaksana',
      desc: 'Pengetahuan dan keterampilan petugas (paham aturan, jawaban konsisten, mampu menjelaskan). Soal sikap/keramahan masuk T7.',
    },
    {
      code: 'T7',
      title: 'Perilaku pelaksana',
      desc: 'Kesopanan, keramahan, kedisiplinan, keadilan perlakuan. Dugaan pelecehan/diskriminasi masuk T7 dan juga ditandai Eskalasi E2.',
    },
    {
      code: 'T8',
      title: 'Penanganan pengaduan, saran, masukan',
      desc: 'Ketersediaan kanal dan ketanggapan tindak lanjut. Isi pengaduan sendiri masuk tema substansinya; T8 hanya jika soal penanganannya.',
    },
    {
      code: 'T9',
      title: 'Sarana dan prasarana',
      desc: 'Fasilitas fisik (ruang tunggu, loket, toilet, parkir, akses disabilitas, kebersihan). Perangkat lunak masuk T10.',
    },
    {
      code: 'T10',
      title: 'Sistem informasi/aplikasi',
      desc: 'Kendala atau kemudahan aplikasi dan layanan digital Alpukat SKM (error, lambat, gagal login, tampilan). Informasi syarat yang tidak jelas di aplikasi masuk T1.',
    },
    {
      code: 'T11',
      title: 'Lainnya',
      desc: 'Bermakna tetapi tidak cocok T1-T10, termasuk di luar kewenangan BKPSDM, atau komentar umum tanpa konteks layanan ("pelayanannya begitu saja").',
    },
  ];

  const escalationsList = [
    {
      code: 'E1',
      title: 'Dugaan pungli, gratifikasi, imbalan/uang',
      desc: 'Permintaan uang pelicin, uang rokok, salam tempel, atau biaya tidak resmi.',
    },
    {
      code: 'E2',
      title: 'Dugaan pelecehan, perundungan, diskriminasi',
      desc: 'Perlakuan tidak adil, diskriminasi latar belakang, perundungan, atau pelecehan verbal/fisik.',
    },
    {
      code: 'E3',
      title: 'Dugaan kecurangan, calo, manipulasi data/jalur belakang',
      desc: 'Penggunaan orang dalam, calo pengurusan, manipulasi berkas atau nomor antrian.',
    },
    {
      code: 'E4',
      title: 'Dugaan kebocoran/penyalahgunaan data pribadi',
      desc: 'NIP, nomor KTP/KK, kontak atau berkas rahasia disebar tanpa izin.',
    },
    {
      code: 'E5',
      title: 'Ancaman keselamatan atau kondisi darurat',
      desc: 'Ancaman kekerasan, bahaya fisik, atau situasi darurat di lingkungan kantor.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-800" />
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Pedoman Analisis & Glosarium SKM BKPSDM Purbalingga
              </h2>
              <p className="text-xs text-slate-500">
                Panduan resmi klasifikasi komentar survei kepuasan masyarakat
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

        {/* Tab Controls */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-200 bg-slate-50/30">
          <button
            onClick={() => setActiveTab('themes')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'themes'
                ? 'border-emerald-800 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            11 Tema Layanan (T1 - T11)
          </button>
          <button
            onClick={() => setActiveTab('escalation')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'escalation'
                ? 'border-emerald-800 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Kategori Eskalasi (E1 - E5)
          </button>
          <button
            onClick={() => setActiveTab('dialect')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'dialect'
                ? 'border-emerald-800 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Glosarium Banyumasan
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'rules'
                ? 'border-emerald-800 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Aturan & Batasan Petugas
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto text-xs space-y-4">
          {activeTab === 'themes' && (
            <div className="space-y-3">
              <p className="text-slate-600">
                Pilih satu <strong>tema_utama</strong> yang paling ditekankan atau penyebab utama kepuasan/ketidakpuasan. Jika dua hal sama kuat, tema yang pertama disebut menjadi utama. Tema sekunder maksimal dua.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {themesList.map(t => (
                  <div key={t.code} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded text-[11px] font-mono">
                        {t.code}
                      </span>
                      <span className="font-semibold text-slate-900">{t.title}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{t.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'escalation' && (
            <div className="space-y-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-900 text-xs">
                <strong>Prinsip Penandaan Eskalasi:</strong> Petugas hanya MENANDAI dugaan untuk ditindaklanjuti. Dilarang menyimpulkan tuduhan benar atau salah. Ringkasan harus netral (contoh: "Penulis menyampaikan dugaan adanya permintaan uang.").
              </div>
              <div className="space-y-2">
                {escalationsList.map(e => (
                  <div key={e.code} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-3">
                    <span className="font-bold text-red-700 bg-red-100 px-2 py-1 rounded text-xs font-mono shrink-0">
                      {e.code}
                    </span>
                    <div>
                      <h4 className="font-semibold text-slate-900">{e.title}</h4>
                      <p className="text-slate-600 text-[11px] mt-0.5">{e.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'dialect' && (
            <div className="space-y-3">
              <p className="text-slate-600">
                Komentar masyarakat di Kabupaten Purbalingga sering menggunakan kosakata bahasa Jawa dialek Banyumasan. Bila terdeteksi, tandai <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-800">bahasa_daerah = true</code>.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(BANYUMASAN_GLOSSARY).map(([kata, arti]) => (
                  <div key={kata} className="p-2 bg-slate-50 border border-slate-200 rounded text-xs">
                    <span className="font-semibold text-slate-900">{kata}</span>
                    <span className="text-slate-400 mx-1.5">=</span>
                    <span className="text-slate-600">{arti}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-3 text-slate-700">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <h4 className="font-bold text-slate-900">Peran & Batasan Petugas Analis</h4>
                <ul className="list-disc list-inside space-y-1.5 text-[11px] text-slate-600">
                  <li>Tugas adalah analisis awal klasifikasi komentar yang akan diperiksa petugas manusia.</li>
                  <li><strong>Tidak mengambil keputusan</strong>, tidak menilai kinerja individu pegawai, dan tidak menyimpulkan benar atau salahnya tuduhan.</li>
                  <li><strong>Kutipan:</strong> potongan teks yang disalin persis (maksimal 25 kata) tanpa memperbaiki ejaan.</li>
                  <li><strong>Ringkasan:</strong> maksimal 20 kata, bahasa Indonesia baku, hanya memuat isi komentar.</li>
                  <li><strong>Data Pribadi:</strong> Bila masih terlihat nama orang, NIP, telepon, atau alamat, tandai <code className="text-amber-800">perlu_cek = true</code> dan samarkan dengan <code>[DISAMARKAN]</code>.</li>
                  <li>Jika ragu, turunkan keyakinan dan tandai <code>perlu_cek = true</code>.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-emerald-800 text-white rounded text-xs font-semibold hover:bg-emerald-900 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
