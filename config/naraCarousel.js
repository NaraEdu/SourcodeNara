/* =========================================================
   NARA CAROUSEL — Banner utama beranda (reusable component)
   -----------------------------------------------------------
   - Swipe/drag horizontal (touch & mouse) untuk pindah slide.
   - Dots indikator otomatis dibuat sesuai jumlah slide, dan
     dot yang aktif menampilkan progress bar mundur sebelum
     pindah ke slide berikutnya (menunjukkan banner "geser
     sendiri" secara visual, bukan cuma tiba-tiba berpindah).
   - Autoplay tiap ~4.5 detik, berhenti sementara saat swipe,
     saat kursor/hover di atas banner (desktop), saat tab
     browser tidak aktif, dan otomatis lanjut lagi setelahnya.
   - Loop halus dari slide terakhir -> slide pertama (memakai
     teknik "clone" slide di kedua ujung, jadi tidak ada lompatan
     kasar saat kembali ke slide 1).
   - Konten slide (judul & deskripsi) fade-in halus setiap kali
     slide menjadi aktif, agar transisi terasa lebih hidup.
   - Aksesibilitas: bisa dinavigasi pakai tombol panah kiri/kanan
     saat banner difokuskan (klik/Tab), aria-hidden dikelola per
     slide, dan ada live-region tersembunyi yang mengumumkan
     judul slide aktif untuk pembaca layar.
   - Modul ini murni ADDITIF: tidak menyentuh fitur/ID lain.
   ========================================================= */
(function (global) {
    'use strict';

    function initCarousel(root) {
        var track = root.querySelector('.nara-carousel-track');
        var dotsWrap = document.getElementById(root.getAttribute('aria-owns-dots') || '') ||
            root.parentElement.querySelector('.nara-carousel-dots');
        if (!track || !dotsWrap) return;

        var originalSlides = Array.prototype.slice.call(track.children);
        var total = originalSlides.length;
        if (total < 2) return;

        // --- Live-region tersembunyi untuk pembaca layar ---
        var liveRegion = document.createElement('div');
        liveRegion.className = 'nara-carousel-live';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        root.parentElement.insertBefore(liveRegion, root.nextSibling);

        // --- Tandai tiap slide asli untuk aksesibilitas ---
        originalSlides.forEach(function (slide, i) {
            slide.setAttribute('role', 'group');
            slide.setAttribute('aria-roledescription', 'slide');
            slide.setAttribute('aria-label', (i + 1) + ' dari ' + total);
        });

        // --- Clone slide pertama & terakhir untuk loop halus ---
        var firstClone = originalSlides[0].cloneNode(true);
        var lastClone = originalSlides[total - 1].cloneNode(true);
        firstClone.setAttribute('aria-hidden', 'true');
        lastClone.setAttribute('aria-hidden', 'true');
        track.appendChild(firstClone);
        track.insertBefore(lastClone, track.firstChild);

        var slides = Array.prototype.slice.call(track.children); // total + 2
        var index = 1; // posisi slide asli pertama di dalam array clone
        var reduceMotion = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var AUTOPLAY_MS = 4500;
        root.style.setProperty('--autoplay-ms', AUTOPLAY_MS + 'ms');

        // Banner bisa difokuskan (Tab) supaya panah kiri/kanan berfungsi
        if (!root.hasAttribute('tabindex')) root.setAttribute('tabindex', '0');

        // --- Dots (tiap dot punya "isi" progress untuk indikator autoplay) ---
        dotsWrap.innerHTML = '';
        var dots = [];
        for (var i = 0; i < total; i++) {
            var dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'nara-dot';
            dot.setAttribute('role', 'tab');
            dot.setAttribute('aria-label', 'Ke banner ' + (i + 1) + ' dari ' + total);
            var fill = document.createElement('span');
            fill.className = 'nara-dot-fill';
            dot.appendChild(fill);
            (function (slideIdx) {
                dot.addEventListener('click', function () {
                    stopAutoplay();
                    goTo(slideIdx + 1, true);
                    scheduleAutoplayResume();
                });
            })(i);
            dotsWrap.appendChild(dot);
            dots.push({ el: dot, fill: fill });
        }

        function realIndex() {
            var n = ((index - 1) % total + total) % total;
            return n;
        }

        function updateDots(restartProgress) {
            var r = realIndex();
            dots.forEach(function (d, i) {
                var active = i === r;
                d.el.classList.toggle('is-active', active);
                d.el.setAttribute('aria-selected', active ? 'true' : 'false');
                if (active && restartProgress !== false && !reduceMotion) {
                    // Reset lalu paksa reflow agar animasi progress mulai dari nol
                    d.fill.classList.remove('is-running');
                    void d.fill.offsetWidth;
                    d.fill.classList.add('is-running');
                } else if (!active) {
                    d.fill.classList.remove('is-running');
                }
            });
        }

        function pauseDotProgress() {
            dots.forEach(function (d) { d.fill.style.animationPlayState = 'paused'; });
        }
        function resumeDotProgress() {
            dots.forEach(function (d) { d.fill.style.animationPlayState = 'running'; });
        }

        function announceCurrent() {
            var real = slides[index];
            if (!real) return;
            var title = real.querySelector('h4');
            if (title) liveRegion.textContent = title.textContent;
        }

        function refreshVisualState() {
            // aria-hidden per slide asli + retrigger animasi masuk konten
            originalSlides.forEach(function (slide, i) {
                var isCurrent = i === realIndex();
                slide.setAttribute('aria-hidden', isCurrent ? 'false' : 'true');
                var content = slide.querySelector('.slide-content');
                if (content) {
                    content.classList.remove('is-in');
                    if (isCurrent) {
                        void content.offsetWidth; // reflow supaya animasi restart
                        content.classList.add('is-in');
                    }
                }
            });
        }

        function setTransform(animate) {
            track.classList.toggle('no-anim', !animate);
            track.style.transform = 'translateX(-' + (index * 100) + '%)';
        }

        function goTo(newIndex, animate) {
            index = newIndex;
            setTransform(animate !== false && !reduceMotion);
            updateDots(true);
            refreshVisualState();
            announceCurrent();
        }

        function next() { goTo(index + 1, true); }
        function prev() { goTo(index - 1, true); }

        track.addEventListener('transitionend', function (e) {
            if (e.target !== track) return;
            if (index === 0) {
                index = total;
                setTransform(false);
            } else if (index === slides.length - 1) {
                index = 1;
                setTransform(false);
            }
            updateDots(false);
        });

        // --- Autoplay ---
        var autoplayTimer = null;
        var resumeTimer = null;
        var hovering = false;

        function startAutoplay() {
            if (reduceMotion || hovering) return;
            stopAutoplay();
            autoplayTimer = setInterval(next, AUTOPLAY_MS);
            resumeDotProgress();
        }
        function stopAutoplay() {
            if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; }
            pauseDotProgress();
        }
        function scheduleAutoplayResume() {
            if (resumeTimer) clearTimeout(resumeTimer);
            resumeTimer = setTimeout(startAutoplay, 1200);
        }

        // --- Jeda otomatis saat kursor mouse berada di atas banner (desktop) ---
        if (global.matchMedia && global.matchMedia('(hover: hover) and (pointer: fine)').matches) {
            root.addEventListener('mouseenter', function () {
                hovering = true;
                stopAutoplay();
            });
            root.addEventListener('mouseleave', function () {
                hovering = false;
                scheduleAutoplayResume();
            });
        }

        // --- Navigasi keyboard (panah kiri/kanan saat banner difokuskan) ---
        root.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                stopAutoplay();
                next();
                scheduleAutoplayResume();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                stopAutoplay();
                prev();
                scheduleAutoplayResume();
            }
        });

        // --- Drag / Swipe (pointer events: mendukung touch & mouse) ---
        var dragging = false;
        var startX = 0;
        var deltaX = 0;
        var widthPx = 0;

        function onPointerDown(e) {
            if (e.button !== undefined && e.button !== 0) return; // klik kanan/tengah diabaikan
            dragging = true;
            deltaX = 0;
            widthPx = root.getBoundingClientRect().width;
            startX = (e.touches ? e.touches[0].clientX : e.clientX);
            track.classList.add('no-anim');
            stopAutoplay();
            if (e.pointerId !== undefined && track.setPointerCapture) {
                try { track.setPointerCapture(e.pointerId); } catch (err) {}
            }
        }

        function onPointerMove(e) {
            if (!dragging) return;
            var x = (e.touches ? e.touches[0].clientX : e.clientX);
            deltaX = x - startX;
            var basePct = -index * widthPx;
            track.style.transform = 'translateX(' + (basePct + deltaX) + 'px)';
        }

        function onPointerUp() {
            if (!dragging) return;
            dragging = false;
            track.classList.remove('no-anim');

            var threshold = Math.max(40, widthPx * 0.15);
            if (deltaX <= -threshold) {
                goTo(index + 1, true);
            } else if (deltaX >= threshold) {
                goTo(index - 1, true);
            } else {
                setTransform(true);
            }
            deltaX = 0;
            scheduleAutoplayResume();
        }

        if (global.PointerEvent) {
            track.addEventListener('pointerdown', onPointerDown);
            global.addEventListener('pointermove', onPointerMove, { passive: true });
            global.addEventListener('pointerup', onPointerUp, { passive: true });
            global.addEventListener('pointercancel', onPointerUp, { passive: true });
        } else {
            // Fallback untuk browser tanpa Pointer Events
            track.addEventListener('touchstart', onPointerDown, { passive: true });
            track.addEventListener('touchmove', onPointerMove, { passive: true });
            track.addEventListener('touchend', onPointerUp, { passive: true });
            track.addEventListener('mousedown', onPointerDown);
            global.addEventListener('mousemove', onPointerMove);
            global.addEventListener('mouseup', onPointerUp);
        }

        // Jeda autoplay saat tab browser tidak aktif (hemat baterai, hindari lompat slide)
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) stopAutoplay();
            else scheduleAutoplayResume();
        });

        // --- Jeda HANYA saat halaman Beranda sendiri benar-benar disembunyikan
        //     (mis. pengguna buka tab navbar lain: Edukasi/Bantuan/Data/About —
        //     ini men-set display:none lewat class "active" di script.js).
        //     Sekadar men-scroll ke bawah di dalam halaman Beranda TIDAK
        //     dianggap "hilang": banner tetap lanjut geser & progress dots
        //     tetap berjalan di belakang layar, tidak mulai dari nol lagi
        //     begitu di-scroll balik ke atas.
        //     Begitu halaman Beranda terlihat lagi, tampilan (teks slide +
        //     dots) disinkronkan ulang agar tidak ada yang nyangkut/kacau. ---
        var pageEl = null;
        if (root.closest) {
            pageEl = root.closest('.page');
        } else {
            var p = root.parentElement;
            while (p) {
                if (p.classList && p.classList.contains('page')) { pageEl = p; break; }
                p = p.parentElement;
            }
        }
        if (pageEl && global.MutationObserver) {
            var pageWasActive = pageEl.classList.contains('active');
            var pageObserver = new global.MutationObserver(function () {
                var isActive = pageEl.classList.contains('active');
                if (isActive && !pageWasActive) {
                    refreshVisualState();
                    updateDots(true);
                    scheduleAutoplayResume();
                } else if (!isActive && pageWasActive) {
                    stopAutoplay();
                }
                pageWasActive = isActive;
            });
            pageObserver.observe(pageEl, { attributes: true, attributeFilter: ['class'] });
        }

        // Init
        setTransform(false);
        updateDots(true);
        refreshVisualState();
        startAutoplay();
    }

    function boot() {
        var root = document.getElementById('naraCarousel');
        if (root) initCarousel(root);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})(window);
