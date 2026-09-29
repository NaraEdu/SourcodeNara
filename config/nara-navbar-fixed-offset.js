/* =========================================================================
   NARA — NAVBAR FIXED: offset otomatis (v17)
   -------------------------------------------------------------------------
   Pasangan dari styles/style-v17-navbar-fixed.css. Karena .navbar sekarang
   position:fixed (keluar dari flow dokumen), <main> butuh padding-top
   setinggi navbar supaya konten tidak tertutup. Tinggi itu diukur di sini
   secara real (bukan angka tetap) karena berubah-ubah tergantung:
     - safe-area-inset-top (notch/status bar di HP)
     - breakpoint desktop (padding header lebih besar di style.css)
     - kondisi "is-scrolled" (navbar sedikit mengecil saat discroll)
   Hasilnya ditulis ke custom property --navbar-h di <html>, lalu dipakai
   oleh CSS lewat `padding-top: var(--navbar-h, 84px)`.
   ========================================================================= */

(function () {
    'use strict';

    var navbar = document.querySelector('.navbar');
    if (!navbar) return;

    var root = document.documentElement;

    function setVar() {
        var h = navbar.getBoundingClientRect().height;
        if (h > 0) {
            root.style.setProperty('--navbar-h', h + 'px');
        }
    }

    // Ukur begitu layout siap, dan setiap kali ukuran bisa berubah.
    setVar();
    window.addEventListener('load', setVar);
    window.addEventListener('resize', setVar);
    window.addEventListener('orientationchange', function () {
        // Beri jeda sedikit — di sebagian browser mobile, dimensi viewport
        // (termasuk safe-area) baru final beberapa saat setelah event ini.
        setTimeout(setVar, 150);
    });

    // Navbar bisa berubah tinggi sedikit saat toggle class is-scrolled
    // (lihat nara-navbar-redesign.js) — ikut disesuaikan lewat ResizeObserver
    // kalau tersedia, supaya --navbar-h selalu akurat.
    if (typeof ResizeObserver === 'function') {
        var ro = new ResizeObserver(setVar);
        ro.observe(navbar);
    }
})();
