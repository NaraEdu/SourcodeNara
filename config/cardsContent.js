/* =========================================================================
   NARA — Konfigurasi Icon Card
   -------------------------------------------------------------------------
   Semua teks pada kartu "icon-card" (kartu fitur/keunggulan) diatur dari
   file ini — TIDAK PERLU mengedit index.html, style.css, atau script.js
   untuk mengubah isi kartu-kartu tersebut.

   ATURAN PENTING:
   - Key di dalam `iconCards` HARUS sama persis dengan atribut
     `data-icon-group` yang ada di index.html. Kalau key tidak ditemukan
     di index.html, kartu itu tidak dipakai (tidak akan error, hanya
     tidak dirender).
   - Field `page` pada icon card bersifat opsional. Isi dengan id halaman
     (tanpa awalan "page-") kalau kartu tersebut harus bisa diklik untuk
     pindah halaman, misalnya "konsultasi". Kosongkan / hapus field ini
     kalau kartu tidak perlu diklik.

   File ini dimuat sebagai <script> biasa (bukan module), jadi nilainya
   diekspos lewat `window.cardsContent`. config/renderCards.js akan
   membaca objek ini dan menerapkannya ke halaman secara otomatis.
   ========================================================================= */

window.cardsContent = {

  // =====================================================================
  // ICON CARDS — kartu fitur/keunggulan (ikon + judul + deskripsi singkat)
  // =====================================================================
  iconCards: {

    // Beranda — bagian "Kenapa NARA"
    // Field `expand` (opsional): teks penjelasan yang tampil saat card ditekan
    // (buka/tutup dengan animasi). Kosongkan / hapus field ini kalau card
    // tidak perlu bisa dibuka-tutup.
    "beranda-kenapa": [
      {
        icon: "<span class='material-symbols-rounded' translate='no' aria-hidden='true'>menu_book</span>",
        title: "Edukasi berbasis usia",
        desc: "Ketuk untuk memahami edukasi berbasis usia",
        expand: "Edukasi berbasis usia adalah pendekatan pembelajaran atau pemberian materi pendidikan yang disesuaikan dengan tingkat perkembangan psikologis, kognitif, motorik, dan sosial seseorang pada fase umur tertentu.",
      },
      {
        icon: "<span class='material-symbols-rounded' translate='no' aria-hidden='true'>shield</span>",
        title: "Keamanan digital",
        desc: "Ketuk untuk memahami keamanan digital",
        expand: "Keamanan digital adalah cara dan alat untuk melindungi perangkat, jaringan, serta data pribadi dari serangan atau pencurian di internet.",
      },
    ],

    // Halaman Orang Tua — Pendampingan Remaja
    "ortu-utama": [
      {
        icon: "<span class='material-symbols-rounded' translate='no' aria-hidden='true'>flag</span>",
        title: "Mengenali tanda anak butuh perhatian",
        desc: "Perubahan perilaku yang perlu diperhatikan orang tua.",
      },
      {
        icon: "<span class='material-symbols-rounded' translate='no' aria-hidden='true'>volunteer_activism</span>",
        title: "Menjadi pendamping yang tenang",
        desc: "Cara bersikap saat anak sedang menghadapi masa sulit.",
      },
    ],

    // Halaman Orang Tua — Komunikasi Orang Tua & Anak
    "ortu-komunikasi": [
      {
        icon: "<span class='material-symbols-rounded' translate='no' aria-hidden='true'>record_voice_over</span>",
        title: "Membuka percakapan",
        desc: "Cara memulai obrolan tanpa membuat anak merasa diinterogasi.",
      },
      {
        icon: "<span class='material-symbols-rounded' translate='no' aria-hidden='true'>hearing</span>",
        title: "Mendengarkan aktif",
        desc: "Memberi perhatian penuh saat anak sedang bercerita.",
      },
    ],

    // Halaman Orang Tua — Pengawasan Digital
    "ortu-pengawasan": [
      {
        icon: "<span class='material-symbols-rounded' translate='no' aria-hidden='true'>lock</span>",
        title: "Cyber safety keluarga",
        desc: "Keamanan digital yang bisa diterapkan bersama di rumah.",
      },
    ],

    // Halaman Materi — Pergaulan Sehat
    "sehat-utama": [
      {
        icon: "<span class='material-symbols-rounded' translate='no' aria-hidden='true'>check_circle</span>",
        title: "Ciri pergaulan sehat",
        desc: "Saling menghargai, saling mendukung, dan menjaga batasan pribadi.",
      },
      {
        icon: "<span class='material-symbols-rounded' translate='no' aria-hidden='true'>lightbulb</span>",
        title: "Tips berteman sehat",
        desc: "Pilih teman yang memberi pengaruh positif dan berani menolak ajakan yang tidak baik.",
      },
    ],

    // Halaman Materi — Free Sex dan Risikonya
    "freesex-utama": [
      {
        icon: "<span class='material-symbols-rounded' translate='no' aria-hidden='true'>verified_user</span>",
        title: "Consent dan batasan diri",
        desc: "Pentingnya persetujuan dan menyampaikan batas pribadi dengan tegas.",
      },
      {
        icon: "<span class='material-symbols-rounded' translate='no' aria-hidden='true'>record_voice_over</span>",
        title: "Berani berkata tidak",
        desc: "Cara menolak dengan percaya diri dan mencari bantuan saat merasa tertekan.",
      },
    ],

    // Halaman Materi — Revenge Porn
    "revenge-utama": [
      {
        icon: "<span class='material-symbols-rounded' translate='no' aria-hidden='true'>lock</span>",
        title: "Jaga privasi digital",
        desc: "Berpikir dua kali sebelum mengirim konten pribadi.",
      },
      {
        icon: "<span class='material-symbols-rounded' translate='no' aria-hidden='true'>health_and_safety</span>",
        title: "Langkah aman jika terjadi",
        desc: "Simpan bukti, jangan penuhi tuntutan pelaku, dan ceritakan kepada orang dewasa tepercaya.",
      },
    ],

    // Halaman Materi — Pergaulan Bebas
    "pergaulanbebas-utama": [
      {
        icon: "<span class='material-symbols-rounded' translate='no' aria-hidden='true'>groups</span>",
        title: "Kenali pengaruh teman",
        desc: "Tekanan teman sebaya dan cara mengatakan \"tidak\".",
      },
      {
        icon: "<span class='material-symbols-rounded' translate='no' aria-hidden='true'>explore</span>",
        title: "Ambil keputusan yang aman",
        desc: "Menjaga batasan diri dan mengenali situasi berisiko sejak awal.",
      },
    ],

    // Halaman Materi — Kesehatan Mental Remaja
    "mental-utama": [
      {
        icon: "<span class='material-symbols-rounded' translate='no' aria-hidden='true'>sentiment_satisfied</span>",
        title: "Kenali dan kelola emosi",
        desc: "Menghadapi stres sekolah dan kehidupan sehari-hari.",
      },
      {
        icon: "<span class='material-symbols-rounded' translate='no' aria-hidden='true'>chat_bubble</span>",
        title: "Bicara dengan orang tepercaya",
        desc: "Tahu kapan perlu mencari bantuan orang dewasa atau tenaga profesional.",
      },
    ],

    // Halaman Materi — Keamanan Digital
    "digital-utama": [
      {
        icon: "<span class='material-symbols-rounded' translate='no' aria-hidden='true'>encrypted</span>",
        title: "Jaga akun dan data pribadi",
        desc: "Password kuat dan tidak sembarangan membagikan data pribadi.",
      },
      {
        icon: "<span class='material-symbols-rounded' translate='no' aria-hidden='true'>campaign</span>",
        title: "Waspada penipuan online",
        desc: "Kenali phishing, tautan mencurigakan, dan akun palsu.",
      },
    ],

    // Halaman Materi — Literasi AI & Deepfake
    "ai-utama": [
      {
        icon: "<span class='material-symbols-rounded' translate='no' aria-hidden='true'>visibility</span>",
        title: "Kenali ciri deepfake",
        desc: "Gerakan wajah kaku, kedipan mata tidak wajar, dan pencahayaan tidak konsisten.",
      },
      {
        icon: "<span class='material-symbols-rounded' translate='no' aria-hidden='true'>shield</span>",
        title: "Langkah aman jika jadi korban",
        desc: "Simpan bukti, jangan sebarkan, dan laporkan.",
      },
    ],
  },
};
