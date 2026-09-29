/* =========================================================================
   NARA — Liquid Glass Navbar: deteksi swipe & auto-scroll tab aktif
   Lapisan aditif — tidak mengubah goTo()/toggleSheet()/closeSheets() yang
   sudah ada di script.js. Hanya menambah class bantu ".is-scrollable" pada
   #bottomNav ketika kontennya melebihi lebar (dipakai oleh
   style-v12-liquidglass-navbar.css), dan memastikan tombol yang aktif
   selalu terlihat setelah berpindah menu.

   Aman dipanggil berkali-kali / oleh skrip lain: semua listener dipasang
   hanya sekali lewat penjaga window.__naraNavGlassInit.
   ========================================================================= */
(function () {
    if (window.__naraNavGlassInit) return;
    window.__naraNavGlassInit = true;

    function getNav() {
        return document.getElementById('bottomNav');
    }

    function updateScrollable() {
        var nav = getNav();
        if (!nav) return;
        var overflowing = nav.scrollWidth > nav.clientWidth + 1;
        nav.classList.toggle('is-scrollable', overflowing);
    }

    function scrollActiveIntoView() {
        var nav = getNav();
        if (!nav) return;
        var active = nav.querySelector('.bottom-nav-btn.active');
        if (active && typeof active.scrollIntoView === 'function') {
            try {
                active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            } catch (e) {
                /* browser lama tanpa opsi object: abaikan, bukan fatal */
            }
        }
    }

    function init() {
        updateScrollable();

        window.addEventListener('resize', updateScrollable, { passive: true });
        window.addEventListener('orientationchange', function () {
            setTimeout(updateScrollable, 120);
        }, { passive: true });

        var nav = getNav();
        if (nav) {
            /* Setelah tombol ditekan (goTo/toggleSheet dari script.js sudah
               berjalan lewat onclick masing-masing), pastikan tab aktif
               tetap terlihat di dalam area geser. */
            nav.addEventListener('click', function () {
                setTimeout(scrollActiveIntoView, 30);
            }, { passive: true });
        }
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
