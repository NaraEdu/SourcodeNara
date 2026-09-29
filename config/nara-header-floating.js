/* =========================================================================
   NARA — HEADER SCROLL ANIMATION ala Android Collapsing App Bar (v13)
   Aditif murni: tidak mengubah goTo/toggleSheet/script.js yang sudah ada.

   Cara kerja singkat:
   1) Setiap event scroll pada ".page" aktif dibaca (lihat catatan struktur
      scroll di bawah), lalu progres collapse (0..1) dihitung dari
      scrollTop dibagi COLLAPSE_RANGE, dan ditulis sebagai CSS custom
      property --nara-scroll + --nara-elev pada elemen .navbar setiap
      frame (requestAnimationFrame) SELAMA user men-scroll — inilah yang
      membuat animasi mengikuti jari secara 1:1, bukan animasi terjadwal.
   2) Setelah scroll berhenti (tidak ada event baru selama SNAP_DELAY ms)
      dan posisi header sedang "setengah collapse", header di-snap halus
      ke posisi penuh terbuka atau penuh collapse — meniru app bar
      Android dengan flag snap (Gmail, Google Photos, dst).

   PENTING (struktur scroll situs ini):
   html/body/main memakai overflow:hidden; setiap ".page" adalah scroll
   container sendiri (overflow-y:auto), hanya satu yang aktif. Karena
   event "scroll" tidak bubble, listener dipasang pada FASE CAPTURE di
   document supaya tetap menangkap scroll dari ".page" manapun yang aktif.
   ========================================================================= */

(function () {
    'use strict';

    var navbar = document.querySelector('.navbar');
    var navbarInner = document.querySelector('.navbar-inner');
    if (!navbar || !navbarInner) return;

    var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var COLLAPSE_RANGE = 80;      // px — jarak scroll untuk collapse penuh
    var ELEV_SATURATE = 26;       // px — shadow sudah penuh sebelum collapse penuh (efek Material)
    var GLASS_ON_AT = 0.06;       // ambang --nara-elev untuk menyalakan backdrop-filter
    var SNAP_DELAY = 140;         // ms diam sebelum snap dievaluasi
    var SNAP_OPEN_BELOW = 0.35;   // jika progres < ini saat berhenti → snap terbuka penuh
    var SNAP_DURATION = 220;      // ms durasi animasi snap

    var currentScrollTop = 0;
    var lastAppliedProgress = -1;
    var ticking = false;
    var glassOn = false;

    var snapTimer = null;
    var snapRAF = null;
    var isSnapping = false;

    function clamp01(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); }
    function easeOutCubic(x) { return 1 - Math.pow(1 - x, 3); }

    function getActivePage() {
        return document.querySelector('main > .page.active') || document.querySelector('.page.active');
    }

    function applyProgress(scrollTop) {
        var t = clamp01(scrollTop / COLLAPSE_RANGE);
        var elev = clamp01(scrollTop / ELEV_SATURATE);

        if (t === lastAppliedProgress) return;
        lastAppliedProgress = t;

        navbar.style.setProperty('--nara-scroll', t.toFixed(4));
        navbar.style.setProperty('--nara-elev', elev.toFixed(4));

        var shouldGlass = elev > GLASS_ON_AT;
        if (shouldGlass !== glassOn) {
            glassOn = shouldGlass;
            navbarInner.classList.toggle('has-glass', glassOn);
        }
    }

    function flush() {
        ticking = false;
        applyProgress(currentScrollTop);
    }

    function requestFlush(scrollTop) {
        currentScrollTop = scrollTop;
        if (!ticking) {
            ticking = true;
            window.requestAnimationFrame(flush);
        }
    }

    /* ---- Snap: begitu scroll berhenti di posisi "setengah collapse",
       dorong halus ke posisi penuh terbuka/collapse (tidak dilakukan
       kalau prefers-reduced-motion aktif — snap sendiri termasuk
       "motion effect" tambahan di luar gerakan scroll asli user). ---- */
    function cancelSnap() {
        if (snapTimer) { clearTimeout(snapTimer); snapTimer = null; }
        if (snapRAF) { window.cancelAnimationFrame(snapRAF); snapRAF = null; }
        if (isSnapping) {
            isSnapping = false;
            navbar.classList.remove('is-snapping');
        }
    }

    function scheduleSnapCheck() {
        if (prefersReducedMotion) return;
        if (snapTimer) clearTimeout(snapTimer);
        snapTimer = setTimeout(runSnap, SNAP_DELAY);
    }

    function runSnap() {
        var page = getActivePage();
        if (!page) return;
        var t = clamp01(currentScrollTop / COLLAPSE_RANGE);
        if (t <= 0 || t >= 1) return; // sudah di salah satu ujung, tidak perlu snap

        var targetScrollTop = (t < SNAP_OPEN_BELOW) ? 0 : COLLAPSE_RANGE;
        // Kalau target sama dgn posisi konten yang mustahil dicapai (mis. halaman
        // sangat pendek), scrollTo akan otomatis clamp sendiri oleh browser.
        var startTop = page.scrollTop;
        var distance = targetScrollTop - startTop;
        if (Math.abs(distance) < 1) return;

        isSnapping = true;
        navbar.classList.add('is-snapping');
        var startTime = null;

        function step(ts) {
            if (startTime === null) startTime = ts;
            var elapsed = ts - startTime;
            var progress = clamp01(elapsed / SNAP_DURATION);
            var eased = easeOutCubic(progress);
            var newTop = startTop + distance * eased;
            page.scrollTop = newTop;
            requestFlush(newTop);

            if (progress < 1) {
                snapRAF = window.requestAnimationFrame(step);
            } else {
                isSnapping = false;
                navbar.classList.remove('is-snapping');
                snapRAF = null;
            }
        }
        snapRAF = window.requestAnimationFrame(step);
    }

    function syncWithActivePage() {
        var page = getActivePage();
        var scrollTop = page ? page.scrollTop : (window.scrollY || document.documentElement.scrollTop || 0);
        lastAppliedProgress = -1; // paksa re-apply walau angkanya kebetulan sama
        requestFlush(scrollTop);
    }

    /* 1) Tangkap event scroll dari ".page" manapun (fase capture, karena
          scroll event tidak bubble ke document secara normal). */
    document.addEventListener('scroll', function (e) {
        var target = e.target;
        if (!target || target.nodeType !== 1) return;
        var isPage = target.classList && target.classList.contains('page');
        var isDocLike = (target === document || target === document.documentElement);
        if (!isPage && !isDocLike) return;

        // Scroll asli dari user/jari membatalkan snap yang sedang berjalan
        // supaya tidak "berebut" posisi dengan gestur yang sedang aktif.
        if (isSnapping) cancelSnap();

        requestFlush(target.scrollTop != null ? target.scrollTop : window.scrollY);
        scheduleSnapCheck();
    }, { capture: true, passive: true });

    // 2) Fallback window scroll (jika suatu saat layout berubah jadi window-scroll).
    window.addEventListener('scroll', function () {
        if (isSnapping) cancelSnap();
        requestFlush(window.scrollY || document.documentElement.scrollTop || 0);
        scheduleSnapCheck();
    }, { passive: true });

    // 3) Saat berpindah halaman (".page.active" berubah), sinkronkan ulang
    //    segera karena halaman baru bisa saja sudah punya scrollTop > 0.
    var main = document.querySelector('main');
    if (main && window.MutationObserver) {
        var observer = new MutationObserver(function (mutations) {
            for (var i = 0; i < mutations.length; i++) {
                if (mutations[i].attributeName === 'class') {
                    cancelSnap();
                    syncWithActivePage();
                    break;
                }
            }
        });
        var pages = main.querySelectorAll('.page');
        for (var i = 0; i < pages.length; i++) {
            observer.observe(pages[i], { attributes: true, attributeFilter: ['class'] });
        }
    }

    // 4) Sinkronisasi awal & saat resize/orientasi berubah.
    function init() {
        syncWithActivePage();
        window.addEventListener('resize', syncWithActivePage, { passive: true });
        window.addEventListener('orientationchange', function () {
            setTimeout(syncWithActivePage, 120);
        }, { passive: true });
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
    window.addEventListener('load', syncWithActivePage, { passive: true });
})();
