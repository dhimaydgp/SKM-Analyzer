import {
  InputComment,
  SkmClassificationResult,
  StatusData,
  Sentimen,
  JenisIsi,
  TemaUtama,
  EskalasiKategori,
  Keyakinan,
} from '../types/skm';

export const BANYUMASAN_GLOSSARY: Record<string, string> = {
  'ora': 'tidak',
  'wis': 'sudah',
  'durung': 'belum',
  'suwe': 'lama',
  'cepet': 'cepat',
  'kudu': 'harus',
  'piye': 'bagaimana',
  'kepriwe': 'bagaimana',
  'kepriben': 'bagaimana',
  'ngerti': 'paham',
  'mbulet': 'berbelit',
  'bingung': 'bingung',
  'mangkel': 'kesal',
  'apik': 'bagus',
  'matur nuwun': 'terima kasih',
  'maturnuwun': 'terima kasih',
  'inyong': 'saya',
  'rika': 'anda',
  'tenan': 'sungguh',
  'ora kepenak': 'tidak nyaman',
  'syarate': 'syaratnya',
  'rampung': 'selesai',
  'gancang': 'cepat',
  'dewek': 'sendiri',
  'pisan': 'sekali',
  'angel': 'susah',
  'duwit': 'uang',
  'jere': 'katanya',
  'ora genah': 'tidak jelas',
};

const BANYUMASAN_WORDS = Object.keys(BANYUMASAN_GLOSSARY);

// Check if text has local Banyumasan / Javanese dialect
export function detectBahasaDaerah(text: string): boolean {
  const lower = text.toLowerCase();
  return BANYUMASAN_WORDS.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lower);
  });
}

// Mask personal data (NIP, Phone numbers, explicit names)
export function redactPII(text: string): { redactedText: string; hasPII: boolean } {
  let hasPII = false;
  let result = text;

  // Detect 18-digit NIP (standard Indonesian civil servant ID, e.g. 198501012010011001)
  const nipRegex = /\b(19\d{16}|20\d{16}|\d{18})\b/g;
  if (nipRegex.test(result)) {
    hasPII = true;
    result = result.replace(nipRegex, '[DISAMARKAN]');
  }

  // Detect phone numbers (08xxx or +628xxx)
  const phoneRegex = /(\+62|62|0)8[1-9][0-9]{7,11}\b/g;
  if (phoneRegex.test(result)) {
    hasPII = true;
    result = result.replace(phoneRegex, '[DISAMARKAN]');
  }

  // Detect explicit name patterns if preceded by "Bapak/Ibu/Sdr/Nama:"
  const namePattern = /\b(Bapak|Ibu|Pak|Bu|Sdr|Sdri)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/g;
  if (namePattern.test(result)) {
    hasPII = true;
    result = result.replace(namePattern, '$1 [DISAMARKAN]');
  }

  return { redactedText: result, hasPII };
}

// Parse input string in "NO: <nomor> | KOMENTAR: <teks>" format
export function parseInputText(text: string): InputComment[] {
  if (!text || !text.trim()) return [];

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const results: InputComment[] = [];

  let currentNo = 1;

  for (const line of lines) {
    // Format: NO: <nomor> | KOMENTAR: <teks>
    const match = line.match(/^NO:\s*(\d+)\s*\|\s*KOMENTAR:\s*(.+)$/i);
    if (match) {
      results.push({
        no: parseInt(match[1], 10),
        komentar: match[2].trim(),
      });
      continue;
    }

    // Alternative numbered format: "1. Komentar" or "1) Komentar"
    const numMatch = line.match(/^(\d+)[\.\)]\s*(.+)$/);
    if (numMatch) {
      results.push({
        no: parseInt(numMatch[1], 10),
        komentar: numMatch[2].trim(),
      });
      continue;
    }

    // Plain text line
    results.push({
      no: currentNo++,
      komentar: line,
    });
  }

  return results;
}

// Format comments back into the standard prompt format
export function formatAsInputText(comments: InputComment[]): string {
  return comments.map(c => `NO: ${c.no} | KOMENTAR: ${c.komentar}`).join('\n');
}

// Detect mentioned service
export function detectLayanan(text: string): string {
  const lower = text.toLowerCase();
  const services = [
    { key: 'kenaikan pangkat', name: 'Kenaikan Pangkat' },
    { key: 'pangkat', name: 'Kenaikan Pangkat' },
    { key: 'mutasi', name: 'Mutasi Pegawai' },
    { key: 'pensiun', name: 'Pensiun' },
    { key: 'sk pensiun', name: 'Pensiun' },
    { key: 'karpeg', name: 'KARPEG' },
    { key: 'karis', name: 'KARIS/KARSU' },
    { key: 'karsu', name: 'KARIS/KARSU' },
    { key: 'sk ', name: 'Penerbitan SK' },
    { key: 'sk berkala', name: 'Kenaikan Gaji Berkala' },
    { key: 'cuti', name: 'Layanan Cuti' },
    { key: 'tubel', name: 'Tugas Belajar' },
    { key: 'ibell', name: 'Izin Belajar' },
    { key: 'alasan izin', name: 'Izin Belajar' },
    { key: 'pppk', name: 'Pengadaan PPPK/CPNS' },
    { key: 'cpns', name: 'Pengadaan PPPK/CPNS' },
    { key: 'alpukat', name: 'Aplikasi Alpukat SKM' },
    { key: 'uji kompetensi', name: 'Uji Kompetensi/Asesmen' },
    { key: 'diklat', name: 'Pendidikan dan Pelatihan' },
  ];

  for (const s of services) {
    if (lower.includes(s.key)) {
      return s.name;
    }
  }

  return '';
}

// Rule-based heuristic classification for fallback or offline validation
export function heuristicClassifySingle(c: InputComment): SkmClassificationResult {
  const rawText = c.komentar.trim();
  const lower = rawText.toLowerCase();

  // 1. Status Data Check
  const nonMeaningful = ['-', '.', 'ok', 'oke', 'tidak ada', 'nihil', 'xxx', 'na', 'n/a', 'no', 'none', 'tdk ada'];
  if (!rawText || nonMeaningful.includes(lower)) {
    return {
      no: c.no,
      komentar_asli: rawText,
      status_data: 'Tidak bermakna',
      sentimen: 'Tidak dinilai',
      jenis: [],
      tema_utama: 'Tidak ada',
      tema_sekunder: [],
      eskalasi_perlu: false,
      eskalasi_kategori: 'Tidak ada',
      keyakinan: 'Tinggi',
      perlu_cek: false,
      alasan_cek: '',
      bahasa_daerah: false,
      layanan_disebut: '',
      ringkasan: '',
      kutipan: '',
    };
  }

  // Check irrelevant (spam, ads)
  if (lower.includes('slot gacor') || lower.includes('jual beli obat') || lower.includes('klik link')) {
    return {
      no: c.no,
      komentar_asli: rawText,
      status_data: 'Tidak relevan',
      sentimen: 'Tidak dinilai',
      jenis: [],
      tema_utama: 'Tidak ada',
      tema_sekunder: [],
      eskalasi_perlu: false,
      eskalasi_kategori: 'Tidak ada',
      keyakinan: 'Tinggi',
      perlu_cek: false,
      alasan_cek: '',
      bahasa_daerah: false,
      layanan_disebut: '',
      ringkasan: '',
      kutipan: '',
    };
  }

  // 2. Personal data & redaction
  const { redactedText, hasPII } = redactPII(rawText);

  // 3. Language check
  const isBanyumasan = detectBahasaDaerah(rawText);

  // 4. Escalation detection
  let eskalasiPerlu = false;
  let eskalasiKategori: EskalasiKategori = 'Tidak ada';

  if (
    lower.includes('pungli') ||
    lower.includes('uang pelicin') ||
    lower.includes('uang rokok') ||
    lower.includes('amplop') ||
    lower.includes('salam tempel') ||
    lower.includes('minta uang') ||
    lower.includes('biaya siluman') ||
    lower.includes('bayar di luar ketentuan')
  ) {
    eskalasiPerlu = true;
    eskalasiKategori = 'E1 dugaan pungli, gratifikasi, atau permintaan imbalan/uang';
  } else if (
    lower.includes('pelecehan') ||
    lower.includes('perundungan') ||
    lower.includes('dibeda-bedakan') ||
    lower.includes('diskriminasi') ||
    lower.includes('sara') ||
    lower.includes('dihina')
  ) {
    eskalasiPerlu = true;
    eskalasiKategori = 'E2 dugaan pelecehan, perundungan, atau diskriminasi';
  } else if (
    lower.includes('calo') ||
    lower.includes('jalur belakang') ||
    lower.includes('orang dalam') ||
    lower.includes('titipan') ||
    lower.includes('manipulasi')
  ) {
    eskalasiPerlu = true;
    eskalasiKategori = 'E3 dugaan kecurangan, calo, atau manipulasi data/jalur belakang';
  } else if (
    lower.includes('bocor') ||
    lower.includes('data pribadi disebar') ||
    lower.includes('nik saya dipakai')
  ) {
    eskalasiPerlu = true;
    eskalasiKategori = 'E4 dugaan kebocoran atau penyalahgunaan data pribadi';
  } else if (
    lower.includes('ancaman') ||
    lower.includes('mengancam') ||
    lower.includes('darurat') ||
    lower.includes('kekerasan fisik')
  ) {
    eskalasiPerlu = true;
    eskalasiKategori = 'E5 ancaman keselamatan atau kondisi darurat';
  }

  // 5. Sentiment & Jenis
  const positiveWords = ['puas', 'bagus', 'apik', 'mantap', 'ramah', 'cepat', 'cepet', 'matur nuwun', 'terima kasih', 'sangat membantu', 'profesional', 'mudah', 'jelas', 'top', 'keren'];
  const negativeWords = ['kecewa', 'lambat', 'suwe', 'mbulet', 'lama', 'ribet', 'susah', 'angel', 'buruk', 'parah', 'error', 'antre', 'menunggu', 'bingung', 'mangkel', 'tidak jelas', 'ora kepenak', 'berbelit'];
  
  const hasPos = positiveWords.some(w => lower.includes(w));
  const hasNeg = negativeWords.some(w => lower.includes(w)) || eskalasiPerlu;

  let sentimen: Sentimen = 'Netral';
  if (hasPos && hasNeg) {
    sentimen = 'Campuran';
  } else if (hasPos) {
    sentimen = 'Positif';
  } else if (hasNeg) {
    sentimen = 'Negatif';
  }

  const jenis: JenisIsi[] = [];
  if (hasNeg || eskalasiPerlu) jenis.push('Keluhan');
  if (hasPos) jenis.push('Apresiasi');
  if (lower.includes('tolong') || lower.includes('mohon') || lower.includes('sebaiknya') || lower.includes('saran') || lower.includes('harus ditambah') || lower.includes('perlu diperbaiki')) {
    jenis.push('Saran');
  }
  if (lower.includes('?') || lower.includes('bagaimana') || lower.includes('piye') || lower.includes('kepriwe') || lower.includes('kapan')) {
    jenis.push('Pertanyaan');
  }
  if (jenis.length === 0) {
    jenis.push(sentimen === 'Positif' ? 'Apresiasi' : 'Keluhan');
  }

  // 6. Theme detection
  let temaUtama: TemaUtama = 'T11 Lainnya';
  const temaSekunder: string[] = [];

  if (lower.includes('aplikasi') || lower.includes('alpukat') || lower.includes('server') || lower.includes('error') || lower.includes('login') || lower.includes('web') || lower.includes('down') || lower.includes('sistem')) {
    temaUtama = 'T10 Sistem informasi/aplikasi';
  } else if (lower.includes('syarat') || lower.includes('syarate') || lower.includes('berkas') || lower.includes('dokumen pendukung')) {
    temaUtama = 'T1 Persyaratan';
  } else if (lower.includes('suwe') || lower.includes('lama') || lower.includes('lambat') || lower.includes('cepet') || lower.includes('cepat') || lower.includes('antri') || lower.includes('waktu') || lower.includes('menunggu')) {
    temaUtama = 'T3 Waktu penyelesaian';
  } else if (lower.includes('alur') || lower.includes('mbulet') || lower.includes('berbelit') || lower.includes('tahapan') || lower.includes('birokrasi') || lower.includes('prosedur')) {
    temaUtama = 'T2 Sistem, mekanisme, prosedur';
  } else if (lower.includes('biaya') || lower.includes('tarif') || lower.includes('gratis') || lower.includes('bayar') || eskalasiKategori.startsWith('E1')) {
    temaUtama = 'T4 Biaya/tarif';
  } else if (lower.includes('salah ketik') || lower.includes('sk keliru') || lower.includes('format') || lower.includes('dokumen salah')) {
    temaUtama = 'T5 Produk spesifikasi layanan';
  } else if (lower.includes('ramah') || lower.includes('jutek') || lower.includes('sopan') || lower.includes('tidak sopan') || lower.includes('disiplin') || lower.includes('sikap petugas')) {
    temaUtama = 'T7 Perilaku pelaksana';
  } else if (lower.includes('paham') || lower.includes('tidak paham') || lower.includes('kompeten') || lower.includes('penjelasan berbelit') || lower.includes('tidak tahu aturan')) {
    temaUtama = 'T6 Kompetensi pelaksana';
  } else if (lower.includes('ruang') || lower.includes('loket') || lower.includes('kursi') || lower.includes('toilet') || lower.includes('parkir') || lower.includes('ac') || lower.includes('fasilitas')) {
    temaUtama = 'T9 Sarana dan prasarana';
  } else if (lower.includes('pengaduan') || lower.includes('laporan saya') || lower.includes('tidak dibalas') || lower.includes('respon wa')) {
    temaUtama = 'T8 Penanganan pengaduan, saran, masukan';
  }

  // Secondary theme
  if (temaUtama !== 'T7 Perilaku pelaksana' && (lower.includes('ramah') || lower.includes('jutek') || lower.includes('petugas'))) {
    temaSekunder.push('T7 Perilaku pelaksana');
  }
  if (temaUtama !== 'T3 Waktu penyelesaian' && (lower.includes('lama') || lower.includes('suwe') || lower.includes('lambat'))) {
    temaSekunder.push('T3 Waktu penyelesaian');
  }

  // 7. Keyakinan & Perlu Cek
  const words = rawText.split(/\s+/).filter(Boolean);
  let keyakinan: Keyakinan = 'Tinggi';
  if (words.length <= 3) {
    keyakinan = 'Sedang';
  } else if (lower.includes('hebat sekali') && (lower.includes('rusak') || lower.includes('bobrok') || lower.includes('parah'))) {
    // Sarcasm detection -> Rendah
    keyakinan = 'Rendah';
  } else if (isBanyumasan && lower.includes('ora')) {
    keyakinan = 'Sedang';
  }

  let perluCek = false;
  let alasanCek = '';

  if (eskalasiPerlu) {
    perluCek = true;
    alasanCek = `Eskalasi ${eskalasiKategori.slice(0, 2)} terdeteksi`;
  } else if (hasPII) {
    perluCek = true;
    alasanCek = 'Data pribadi tersisa';
  } else if (keyakinan === 'Rendah') {
    perluCek = true;
    alasanCek = 'Keyakinan rendah / teks ambigu';
  } else if (isBanyumasan) {
    perluCek = false; // standard known dialect words don't require check unless unknown
  }

  // 8. Kutipan & Ringkasan (max 25 words kutipan, max 20 words ringkasan)
  const kutipanWords = redactedText.split(/\s+/).slice(0, 25).join(' ');
  const service = detectLayanan(rawText);

  let ringkasan = '';
  if (eskalasiPerlu) {
    ringkasan = `Penulis menyampaikan ${eskalasiKategori.toLowerCase().replace(/e\d+\s*/, '')}${service ? ` terkait layanan ${service}` : ''}.`;
  } else if (sentimen === 'Positif') {
    ringkasan = `Apresiasi atas pelayanan${service ? ` ${service}` : ''} yang cepat dan memuaskan.`;
  } else if (sentimen === 'Negatif') {
    ringkasan = `Keluhan masyarakat mengenai ${temaUtama.split(' ').slice(1).join(' ')}${service ? ` pada layanan ${service}` : ''}.`;
  } else {
    ringkasan = `Penyampaian masukan dan pertanyaan terkait pelayanan${service ? ` ${service}` : ''}.`;
  }

  // Ensure ringkasan <= 20 words
  ringkasan = ringkasan.split(/\s+/).slice(0, 20).join(' ');

  return {
    no: c.no,
    komentar_asli: rawText,
    status_data: 'Bermakna',
    sentimen,
    jenis,
    tema_utama: temaUtama,
    tema_sekunder: temaSekunder.slice(0, 2),
    eskalasi_perlu: eskalasiPerlu,
    eskalasi_kategori: eskalasiKategori,
    keyakinan,
    perlu_cek: perluCek,
    alasan_cek: alasanCek,
    bahasa_daerah: isBanyumasan,
    layanan_disebut: service,
    ringkasan,
    kutipan: kutipanWords,
  };
}

// Preset comments representative of BKPSDM Purbalingga SKM surveys
export const PRESET_KOMENTAR_PURBALINGGA: InputComment[] = [
  {
    no: 1,
    komentar: 'Pelayanan kenaikan pangkat suwe tenan, padahal syarate wis lengkap kabeh dikirim lewat Alpukat SKM.',
  },
  {
    no: 2,
    komentar: 'Matur nuwun sanget, pengurusan SK pensiun orang tua saya cepet dan petugas loket BKPSDM ramah pisan.',
  },
  {
    no: 3,
    komentar: 'Ada oknum yang menawarkan bantuan mengurus mutasi lebih cepat kalau mau memberi amplop uang rokok 500 ribu.',
  },
  {
    no: 4,
    komentar: 'Aplikasi Alpukat SKM sering gagal login dan lambat waktu unggah berkas PDF KARPEG.',
  },
  {
    no: 5,
    komentar: 'Nama pada petikan SK mutasi saya salah ketik satu huruf pada gelar sarjana, mohon segera diperbaiki.',
  },
  {
    no: 6,
    komentar: 'Saya Bapak [NAMA] NIP 198205122008011002 no telp 081234567890 menanyakan status berkas cuti tahunan apakah sudah disetujui?',
  },
  {
    no: 7,
    komentar: 'Alur pengajuan tugas belajar mbulet, bolak-balik diminta tanda tangan fisik padahal katanya sudah serba digital.',
  },
  {
    no: 8,
    komentar: 'Ruang tunggu loket pelayanan BKPSDM Purbalingga sejuk, bersih, dan ada fasilitas charger hp yang sangat bermanfaat.',
  },
  {
    no: 9,
    komentar: 'ok',
  },
  {
    no: 10,
    komentar: 'Pelayanan secara keseluruhan sudah baik dan cepat, tapi tolong ditambah kursi roda untuk akses lansia dan difabel.',
  },
];
