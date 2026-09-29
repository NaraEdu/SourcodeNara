/* =========================================================================
   NARA — Konfigurasi Data Dispensasi Nikah 2025–2026
   -------------------------------------------------------------------------
   Sumber: file "DATA Dispensasi Nikah 2025-2026" (tabel resmi, diberikan pengguna).
   Seluruh angka pada objek `years` di bawah ini SAMA PERSIS dengan sumber —
   TIDAK ADA angka yang dikarang, dibulatkan, atau diubah.

   ATURAN PENTING (jangan dilanggar saat memperbarui data ini):
   - Jangan pernah mengisi angka tanpa sumber resmi.
   - Setiap tahun baru cukup ditambahkan sebagai key baru di `years`
     (mis. `2027: { ... }`) dengan struktur field yang identik.
   - `perkaraDiputus` (kabul/tolak/cabut/gugur) adalah rincian resmi dari
     kolom "PERKARA DIPUTUS" pada sumber. Total "Perkara Diputus" yang
     ditampilkan di kartu ringkasan dihitung sebagai penjumlahan
     kabul+tolak+cabut+gugur (bukan angka baru dari luar sumber).
   - `perkaraBerjalan` = jumlah perkara yang masih berjalan/berproses pada
     tahun tersebut (dicatat terpisah pada sumber, mis. catatan "PERKARA
     BERJALAN 6 DI TAHUN 2026"). Diisi `null` jika sumber tidak mencatatkan
     angka ini untuk tahun tersebut — JANGAN diisi 0 secara asal.

   File ini dimuat sebagai <script> biasa sehingga isinya diekspos lewat
   `window.dataDKConfig`.
   ========================================================================= */

window.dataDKConfig = {

    meta: {
        title: "Data Dispensasi Nikah 2025–2026",
        subtitle: "Statistik Data Berdasarkan Tahun",
        sourceShort: "Data Dispensasi Nikah — Dokumen Resmi",
        lastUpdated: "2026",
        note: "Seluruh data dan angka pada halaman ini bersumber dari data resmi Pengadilan Agama dan disajikan sesuai dengan sumber aslinya."
    },

    // Urutan tahun yang tersedia (dipakai untuk membangun tab pemilih tahun)
    yearOrder: [2025, 2026],

    years: {

        2025: {
            label: "2025",
            perkaraMasuk: 68,
            perkaraDiputus: { kabul: 63, tolak: 0, cabut: 3, gugur: 2 },
            penyebab: { hamil: 51, tidakHamil: 17 },
            usia: { under15: 1, r1519: 67 },
            pendidikan: { tidakSekolah: 1, sd: 13, smp: 48, sma: 6 },
            jenisKelamin: { L: 20, P: 48 },
            perkaraBerjalan: null
        },

        2026: {
            label: "2026",
            perkaraMasuk: 34,
            perkaraDiputus: { kabul: 27, tolak: 1, cabut: 1, gugur: 0 },
            penyebab: { hamil: 11, tidakHamil: 23 },
            usia: { under15: 1, r1519: 33 },
            pendidikan: { tidakSekolah: 1, sd: 6, smp: 21, sma: 7 },
            jenisKelamin: { L: 7, P: 27 },
            perkaraBerjalan: 6
        }

    }
};
