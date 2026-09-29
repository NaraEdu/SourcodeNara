/* =========================================================================
   NARA — MODERN 3D REDESIGN LAYER (nara-v2.js)
   Skrip tambahan murni aditif: hanya menambah animasi "muncul halus" saat
   kartu masuk ke layar. Tidak mengubah, menimpa, atau menghapus fungsi
   apa pun dari script.js / config/*.js.
   ========================================================================= */
(function () {
    "use strict";

    function markRevealTargets(root) {
        var scope = root || document;
        // #page-edukasi sengaja DIKECUALIKAN: style-v6-edukasi-perf.css sudah
        // menetralkan efek reveal ini secara visual khusus di halaman Edukasi
        // (opacity:1 !important, transform:none, transition:none — lihat
        // bagian 5 file itu), jadi menandai & mengamati kartu Edukasi di sini
        // hanya membebani IntersectionObserver tanpa hasil visual apa pun.
        // Mengecualikannya dari sumbernya (bukan cuma menyembunyikan lewat
        // CSS) menghapus beban IntersectionObserver + trigger MutationObserver
        // di bawah untuk setiap kartu Edukasi yang lewat viewport saat scroll.
        var selector = '.page.active:not(#page-edukasi) .card, ' +
            '.page.active:not(#page-edukasi) .edu-card, ' +
            '.page.active:not(#page-edukasi) .game-mission-card, ' +
            '.page.active:not(#page-edukasi) .dk-card, ' +
            '.page.active:not(#page-edukasi) .dk-stat-card, ' +
            '.page.active:not(#page-edukasi) .contact-card';
        var nodes = scope.querySelectorAll(selector);
        nodes.forEach(function (el) {
            if (!el.hasAttribute('data-reveal')) {
                el.setAttribute('data-reveal', '');
            }
        });
    }

    var observer = null;
    function getObserver() {
        if (observer) return observer;
        if (!('IntersectionObserver' in window)) return null;
        observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
        return observer;
    }

    function observeAll() {
        markRevealTargets(document);
        var obs = getObserver();
        var pending = document.querySelectorAll('[data-reveal]:not(.is-visible)');
        if (!obs) {
            pending.forEach(function (el) { el.classList.add('is-visible'); });
            return;
        }
        pending.forEach(function (el) { obs.observe(el); });
    }

    // Jalankan setelah halaman siap, dan setiap kali navigasi antar halaman
    // (fungsi goTo() aplikasi ini menambah/menghapus class "active" pada
    // .page — kita cukup mengamati perubahan itu tanpa menyentuh goTo()).
    //
    // AKAR MASALAH LAG SCROLL (ditemukan & diperbaiki di sini):
    // Versi sebelumnya memasang MutationObserver dengan subtree:true di
    // <main>, yang berarti PERUBAHAN CLASS APA PUN pada elemen apa pun di
    // dalam <main> — termasuk yang tidak ada hubungannya dengan navigasi
    // halaman — ikut memicu observeAll() (dua kali querySelectorAll penuh
    // ke seluruh dokumen + re-observe). Dua sumber class-churn yang paling
    // sering terjadi PERSIS SAAT SCROLL adalah:
    //   1) observer IntersectionObserver di atas ini sendiri, yang menambah
    //      class "is-visible" satu per satu setiap kali sebuah kartu masuk
    //      viewport saat halaman digulir — makin cepat scroll, makin sering
    //      class ini berubah, makin sering observeAll() dijalankan ulang;
    //   2) indikator titik carousel "Uji Pemahamanmu" (script.js) yang
    //      men-toggle class "is-active" pada tiap gesture scroll horizontal.
    // Keduanya saling memicu observeAll() secara beruntun tepat saat jari
    // pengguna sedang menggulir — inilah sumber delay/patah-patah yang
    // dirasakan, terutama saat scroll cepat (semakin banyak kartu lewat
    // viewport per detik, semakin banyak observeAll() dipanggil).
    // Perbaikan: amati HANYA perubahan class pada elemen .page itu sendiri
    // (subtree:false, target langsung), karena goTo() memang hanya men-
    // toggle class "active" di situ. Ini tetap mendeteksi setiap navigasi
    // antar halaman seperti semula, tapi tidak lagi bereaksi terhadap
    // class-churn di dalam konten (reveal, dots, status kartu, dll).
    document.addEventListener('DOMContentLoaded', function () {
        observeAll();

        var pages = document.querySelectorAll('.page');
        if (pages.length && 'MutationObserver' in window) {
            var mo = new MutationObserver(function () {
                observeAll();
            });
            pages.forEach(function (p) {
                mo.observe(p, { attributes: true, attributeFilter: ['class'] });
            });
        }
    });
})();
