/* =========================================================================
   NARA — NAVBAR REDESIGN FINAL (v15) — logic scroll
   Menggantikan nara-header-floating.js (v13). Pendekatan baru jauh lebih
   sederhana: bukan menghitung progres 0..1 per-frame, melainkan cuma dua
   state — "top" dan "scrolled" — yang di-toggle lewat satu class CSS
   (.is-scrolled pada .navbar-inner). Transisi visual (background, blur,
   shadow) sepenuhnya ditangani CSS `transition` di style-v15 (260ms),
   jadi JS di sini hanya bertugas menentukan KAPAN class itu aktif.

   Dipakai hysteresis (ON di atas 14px, OFF di bawah 6px) supaya navbar
   tidak "kedip" berpindah state saat posisi scroll pas di sekitar batas.

   v20260913fix2: situs ini sekarang memakai scroll dokumen penuh
   (html/body yang discroll, bukan lagi tiap ".page" jadi kotak scroll
   sendiri — lihat style-edukasi-scroll-final.css). Jadi posisi scroll
   yang relevan cukup window.scrollY / document.documentElement.scrollTop;
   listener khusus per-".page" (fase capture) sudah tidak diperlukan lagi.
   ========================================================================= */

(function () {
    'use strict';

    var navbarInner = document.querySelector('.navbar-inner');
    if (!navbarInner) return;

    var SCROLL_ON = 14;   // px — mulai jadi "scrolled" setelah melewati ini
    var SCROLL_OFF = 6;   // px — kembali "top" setelah turun di bawah ini

    var isScrolled = false;
    var ticking = false;
    var currentScrollTop = 0;

    function getScrollTop() {
        return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    }

    function applyState(scrollTop) {
        if (!isScrolled && scrollTop > SCROLL_ON) {
            isScrolled = true;
            navbarInner.classList.add('is-scrolled');
        } else if (isScrolled && scrollTop <= SCROLL_OFF) {
            isScrolled = false;
            navbarInner.classList.remove('is-scrolled');
        }
    }

    function flush() {
        ticking = false;
        applyState(currentScrollTop);
    }

    function requestFlush(scrollTop) {
        currentScrollTop = scrollTop;
        if (!ticking) {
            ticking = true;
            window.requestAnimationFrame(flush);
        }
    }

    function sync() {
        requestFlush(getScrollTop());
    }

    // 1) Scroll dokumen (satu-satunya sumber scroll sekarang).
    window.addEventListener('scroll', function () {
        requestFlush(getScrollTop());
    }, { passive: true });

    // 2) Saat pindah halaman (".page.active" berubah), sinkronkan ulang —
    //    halaman baru bisa saja tampil dengan posisi scroll berbeda
    //    (lihat pemulihan posisi scroll per halaman di script.js goTo()).
    var main = document.querySelector('main');
    if (main && window.MutationObserver) {
        var observer = new MutationObserver(function (mutations) {
            for (var i = 0; i < mutations.length; i++) {
                if (mutations[i].attributeName === 'class') {
                    sync();
                    break;
                }
            }
        });
        var pages = main.querySelectorAll('.page');
        for (var i = 0; i < pages.length; i++) {
            observer.observe(pages[i], { attributes: true, attributeFilter: ['class'] });
        }
    }

    // 3) Sinkronisasi awal & saat resize/orientasi berubah.
    function init() {
        sync();
        window.addEventListener('resize', sync, { passive: true });
        window.addEventListener('orientationchange', function () {
            setTimeout(sync, 120);
        }, { passive: true });
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
    window.addEventListener('load', sync, { passive: true });
})();
