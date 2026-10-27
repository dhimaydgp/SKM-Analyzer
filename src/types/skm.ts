/**
 * Schema & Type Definitions for BKPSDM Kabupaten Purbalingga
 * Alpukat SKM (Survei Kepuasan Masyarakat) Comment Classifier
 */

export type StatusData = "Bermakna" | "Tidak bermakna" | "Tidak relevan";

export type Sentimen = "Positif" | "Netral" | "Negatif" | "Campuran" | "Tidak dinilai";

export type JenisIsi = "Keluhan" | "Apresiasi" | "Saran" | "Pertanyaan";

export type TemaUtama =
  | "T1 Persyaratan"
  | "T2 Sistem, mekanisme, prosedur"
  | "T3 Waktu penyelesaian"
  | "T4 Biaya/tarif"
  | "T5 Produk spesifikasi layanan"
  | "T6 Kompetensi pelaksana"
  | "T7 Perilaku pelaksana"
  | "T8 Penanganan pengaduan, saran, masukan"
  | "T9 Sarana dan prasarana"
  | "T10 Sistem informasi/aplikasi"
  | "T11 Lainnya"
  | "Tidak ada";

export type EskalasiKategori =
  | "E1 dugaan pungli, gratifikasi, atau permintaan imbalan/uang"
  | "E2 dugaan pelecehan, perundungan, atau diskriminasi"
  | "E3 dugaan kecurangan, calo, atau manipulasi data/jalur belakang"
  | "E4 dugaan kebocoran atau penyalahgunaan data pribadi"
  | "E5 ancaman keselamatan atau kondisi darurat"
  | "Tidak ada";

export type Keyakinan = "Tinggi" | "Sedang" | "Rendah";

export interface SkmClassificationResult {
  no: number;
  komentar_asli?: string;
  status_data: StatusData;
  sentimen: Sentimen;
  jenis: JenisIsi[];
  tema_utama: TemaUtama;
  tema_sekunder: string[];
  eskalasi_perlu: boolean;
  eskalasi_kategori: EskalasiKategori;
  keyakinan: Keyakinan;
  perlu_cek: boolean;
  alasan_cek: string;
  bahasa_daerah: boolean;
  layanan_disebut: string;
  ringkasan: string;
  kutipan: string;
  
  // Reviewer Human-in-the-loop meta
  diverifikasi?: boolean;
  catatan_petugas?: string;
  petugas_pemeriksa?: string;
  waktu_verifikasi?: string;
}

export interface InputComment {
  no: number;
  komentar: string;
}
