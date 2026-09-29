/* =========================================================================
   NARA — App Appearance Config
   -------------------------------------------------------------------------
   Semua pengaturan background & efek visual Beranda ada di sini.
   Ubah nilai di bawah untuk mengganti tampilan — TIDAK PERLU mengedit
   index.html, style.css, atau script.js.

   File ini dimuat sebagai <script> biasa (bukan module), jadi nilainya
   diekspos lewat `window.appAppearance`. applyConfig.js akan membaca
   objek ini dan menerapkannya ke halaman secara otomatis.
   ========================================================================= */

window.appAppearance = {
  homeBackground: {
    // Gambar utama untuk desktop / tablet. Kosong = tanpa foto background
    // (Beranda memakai gradient navy dari `fallbackGradient` di bawah).
    image: "",

    // Gambar khusus mobile (opsional). Kosongkan ("") untuk memakai `image` yang sama.
    // Di layar kecil posisi digeser sedikit lewat CSS media query (lihat .hero-photo-layer)
    // supaya bagian tengah gambar tetap terlihat, jadi tidak perlu file terpisah.
    mobileImage: "",

    // Posisi & ukuran gambar (nilai CSS background-position / background-size)
    position: "center 38%",
    // Posisi khusus layar kecil (HP) supaya bagian tengah gambar tetap terlihat
    // saat lebar layar memotong sisi kiri/kanan foto. Kosongkan ("") untuk
    // memakai `position` yang sama di semua ukuran layar.
    mobilePosition: "center 30%",
    size: "cover",
    repeat: "no-repeat",

    // Blur pada foto background dalam px. 0 = tidak blur.
    blur: 0,

    // Overlay navy transparan di atas foto (gradient gelap → transparan) supaya
    // teks tetap kontras tinggi tanpa menghilangkan warna biru cerah & elemen
    // komik pada gambar aslinya. Opacity dijaga di kisaran 45–60%.
    overlay: {
      enabled: false,
      value: "linear-gradient(180deg, rgba(10,18,40,0.6) 0%, rgba(10,18,40,0.5) 45%, rgba(10,18,40,0.45) 75%, rgba(10,18,40,0.55) 100%)",
    },

    // Lapisan gradient tambahan (independen dari overlay di atas)
    gradient: {
      enabled: false,
      value: "linear-gradient(180deg, rgba(15,25,55,0.65), rgba(10,12,30,0.92))",
    },

    // Efek glow / ambient light tambahan di atas overlay
    glow: {
      enabled: false,
      value: "radial-gradient(circle at 80% 0%, rgba(74,159,245,0.35), rgba(74,159,245,0) 60%)",
    },

    // Dipakai jika foto gagal dimuat (lihat item Fallback di bawah)
    fallbackGradient: "linear-gradient(180deg, #0d162d 0%, #132242 60%, var(--bg) 96%)",
  },
};
