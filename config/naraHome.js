/* =========================================================
   NARA HOME — Beranda hub, pencarian/simpan materi Edukasi,
   dan statistik pribadi di halaman Data.
   Semua angka diambil dari NaraState (localStorage), tidak ada
   yang di-hardcode. Modul ini murni ADDITIF: tidak menghapus
   atau mengubah fungsi/ID lama, hanya menambah.
   ========================================================= */
(function (global) {
    'use strict';

    var KATEGORI_LABELS = {
        relasi: 'Relasi & Pergaulan',
        mental: 'Kesehatan Mental',
        digital: 'Keamanan Digital',
        ai: 'AI & Deepfake',
        ortu: 'Orang Tua & Remaja'
    };

    var DIGITAL_TIPS = [
        'Jangan pernah membagikan kata sandi ke siapa pun, termasuk teman dekat.',
        'Aktifkan verifikasi dua langkah di akun media sosial dan emailmu.',
        'Pikirkan dulu sebelum mengunggah foto/video yang menunjukkan lokasimu saat itu juga.',
        'Waspadai pesan atau tautan mencurigakan dari akun yang tidak dikenal.',
        'Atur akun media sosialmu ke mode privat agar hanya orang terpercaya yang bisa melihat.',
        'Jangan mudah percaya foto/video yang terlihat "terlalu sempurna" — bisa jadi hasil AI/deepfake.'
    ];

    function today() {
        var d = new Date();
        var m = String(d.getMonth() + 1); if (m.length < 2) m = '0' + m;
        var dd = String(d.getDate()); if (dd.length < 2) dd = '0' + dd;
        return d.getFullYear() + '-' + m + '-' + dd;   // tanggal LOKAL, bukan UTC
    }

    /* ---------------------------------------------------------
       SIMPAN MATERI (localStorage terpisah, tidak menyentuh
       sistem XP/streak yang sudah ada)
       --------------------------------------------------------- */
    var SAVED_KEY = 'nara_saved_materi';

    function getSavedMateri() {
        try { return JSON.parse(localStorage.getItem(SAVED_KEY) || '[]'); }
        catch (e) { return []; }
    }
    function setSavedMateri(arr) {
        try { localStorage.setItem(SAVED_KEY, JSON.stringify(arr)); } catch (e) {}
    }
    function isMateriSaved(id) { return getSavedMateri().indexOf(id) > -1; }

    function toggleSavedMateri(id) {
        var list = getSavedMateri();
        var idx = list.indexOf(id);
        var nowSaved;
        if (idx > -1) { list.splice(idx, 1); nowSaved = false; }
        else { list.push(id); nowSaved = true; }
        setSavedMateri(list);
        document.querySelectorAll('[data-save-id="' + id + '"]').forEach(function (btn) {
            btn.classList.toggle('is-saved', nowSaved);
            var ic = btn.querySelector('span');
            if (ic) ic.textContent = nowSaved ? 'bookmark' : 'bookmark_border';
        });
        if (typeof global.showToast === 'function') {
            global.showToast(nowSaved ? 'Materi disimpan.' : 'Materi dihapus dari simpanan.',
                '<span class="material-symbols-rounded" translate="no" aria-hidden="true">' + (nowSaved ? 'bookmark' : 'bookmark_border') + '</span>');
        }
        applyEduFilter();
    }
    global.toggleSavedMateri = toggleSavedMateri;

    /* ---------------------------------------------------------
       EDUKASI — pencarian + filter kategori + simpan materi
       --------------------------------------------------------- */
    var eduWired = false;

    function applyEduFilter() {
        var searchEl = document.getElementById('naraEduSearch');
        var q = searchEl ? searchEl.value.trim().toLowerCase() : '';
        var activeChip = document.querySelector('#naraEduChips .nara-chip.is-active');
        var kategori = activeChip ? activeChip.getAttribute('data-kategori') : 'semua';
        var saved = getSavedMateri();
        var visibleTotal = 0;

        document.querySelectorAll('.edu-card[data-materi-id]').forEach(function (card) {
            var id = card.getAttribute('data-materi-id');
            var title = (card.getAttribute('data-title') || '').toLowerCase();
            var cardKategori = card.getAttribute('data-kategori');
            var matchesSearch = !q || title.indexOf(q) > -1;
            var matchesKategori = kategori === 'semua' ||
                (kategori === 'tersimpan' ? saved.indexOf(id) > -1 : cardKategori === kategori);
            var show = matchesSearch && matchesKategori;
            card.style.display = show ? '' : 'none';
            if (show) visibleTotal++;
        });

        // Sembunyikan blok kategori (bukan blok Uji Pemahamanmu) jika semua kartunya tersembunyi
        document.querySelectorAll('.edu-cat-block').forEach(function (block) {
            var grid = block.querySelector('.edu-grid');
            if (!grid) return; // blok Uji Pemahamanmu tidak punya .edu-grid, jangan disentuh
            var anyVisible = Array.prototype.some.call(
                grid.querySelectorAll('.edu-card[data-materi-id]'),
                function (c) { return c.style.display !== 'none'; }
            );
            block.style.display = anyVisible ? '' : 'none';
        });

        var emptyEl = document.getElementById('naraEduEmpty');
        if (emptyEl) emptyEl.style.display = visibleTotal === 0 ? 'block' : 'none';
    }

    function refreshSaveButtons() {
        var saved = getSavedMateri();
        document.querySelectorAll('.edu-save-btn').forEach(function (btn) {
            var id = btn.getAttribute('data-save-id');
            var isSaved = saved.indexOf(id) > -1;
            btn.classList.toggle('is-saved', isSaved);
            var ic = btn.querySelector('span');
            if (ic) ic.textContent = isSaved ? 'bookmark' : 'bookmark_border';
        });
    }

    function wireEduControlsOnce() {
        if (eduWired) return;
        var searchEl = document.getElementById('naraEduSearch');
        if (searchEl) searchEl.addEventListener('input', applyEduFilter);
        var chipsWrap = document.getElementById('naraEduChips');
        if (chipsWrap) {
            chipsWrap.querySelectorAll('.nara-chip').forEach(function (chip) {
                chip.addEventListener('click', function () {
                    chipsWrap.querySelectorAll('.nara-chip').forEach(function (c) { c.classList.remove('is-active'); });
                    chip.classList.add('is-active');
                    applyEduFilter();
                });
            });
        }
        eduWired = true;
    }

    function renderEduEnhancements() {
        wireEduControlsOnce();
        refreshSaveButtons();
        applyEduFilter();
    }
    global.renderEduEnhancements = renderEduEnhancements;

    /* ---------------------------------------------------------
       TIPS KEAMANAN DIGITAL HARIAN
       --------------------------------------------------------- */
    function tipFlagKey() { return 'nara_tip_seen_' + today(); }

    function showDigitalTip() {
        var alreadySeen = localStorage.getItem(tipFlagKey()) === '1';
        var tip = DIGITAL_TIPS[new Date().getDate() % DIGITAL_TIPS.length];
        var wrap = document.createElement('div');
        wrap.className = 'modal-overlay';
        wrap.style.display = 'flex';
        wrap.innerHTML =
            '<div class="modal-box" style="text-align:center;max-width:340px;">' +
            '  <div style="font-size:2.4rem;margin-bottom:6px;"><span class="material-symbols-rounded" translate="no" aria-hidden="true">tips_and_updates</span></div>' +
            '  <h3 style="margin-bottom:8px;">Tips Keamanan Digital</h3>' +
            '  <p style="color:var(--text-muted);font-size:.9rem;margin-bottom:18px;">' + tip + '</p>' +
            '  <button class="btn btn-primary" style="width:100%;">Mengerti!</button>' +
            '</div>';
        wrap.querySelector('button').onclick = function () { wrap.remove(); };
        wrap.onclick = function (e) { if (e.target === wrap) wrap.remove(); };
        document.body.appendChild(wrap);
        if (!alreadySeen) {
            localStorage.setItem(tipFlagKey(), '1');
            if (global.NaraState) global.NaraState.addXP(10);
        }
        renderBerandaHub();
    }
    global.showDigitalTip = showDigitalTip;

    /* ---------------------------------------------------------
       BERANDA HUB — aktivitas hari ini, tantangan, rekomendasi,
       notifikasi internal
       --------------------------------------------------------- */
    function anyQuizDoneToday() {
        if (typeof global.isQuizDoneToday !== 'function') return false;
        var keys = ['hubunganku', 'pertemanan', 'moodquest', 'pergaulansehat', 'pergaulanbebas', 'digitalgame', 'aigame'];
        return keys.some(function (k) { return global.isQuizDoneToday(k); });
    }

    function buildActivities(state) {
        var materiDoneToday = global.NaraState ? global.NaraState.isMateriDoneToday() : false;
        var quizDoneToday = anyQuizDoneToday();
        var tipDoneToday = localStorage.getItem(tipFlagKey()) === '1';

        return [
            { id: 'baca', icon: 'menu_book', title: 'Baca Materi', desc: 'Selesaikan minimal 1 materi edukasi hari ini.', done: materiDoneToday, action: "goTo('edukasi')" },
            { id: 'kuis', icon: 'quiz', title: 'Kerjakan Kuis', desc: 'Uji pemahamanmu lewat salah satu tantangan di Edukasi.', done: quizDoneToday, action: "goToUjiPemahaman()" },
            { id: 'tips', icon: 'tips_and_updates', title: 'Tips Keamanan Digital', desc: 'Baca satu tips singkat menjaga keamanan digitalmu.', done: tipDoneToday, action: 'showDigitalTip()' }
        ];
    }

    /* Dipakai NaraState untuk tahu apakah semua misi hari ini sudah tuntas */
    global.getDailyActivityStatus = function () {
        var acts = buildActivities(global.NaraState ? global.NaraState.load() : {});
        var byId = {};
        var done = 0;
        acts.forEach(function (a) { byId[a.id] = !!a.done; if (a.done) done++; });
        /* Kartu "Cek Kondisi Diri" sudah dihapus dari Aktivitas Hari Ini, tapi badge
           Mental Health Explorer tetap butuh status Mood Quest -> tidak dihitung di done/total. */
        byId.cek = typeof global.isQuizDoneToday === 'function' && !!global.isQuizDoneToday('moodquest');
        return { done: done, total: acts.length, byId: byId };
    };

    function renderTodayActivities(state) {
        var wrap = document.getElementById('naraTodayActivities');
        if (!wrap) return null;
        var activities = buildActivities(state);
        var doneCount = activities.filter(function (a) { return a.done; }).length;

        wrap.innerHTML = activities.map(function (a) {
            return '<div class="nara-activity-item' + (a.done ? ' is-done' : '') + '" onclick="' + a.action + '">' +
                '<div class="ic"><span class="material-symbols-rounded" translate="no" aria-hidden="true">' + a.icon + '</span></div>' +
                '<div class="body"><h5>' + a.title + '</h5><p>' + a.desc + '</p></div>' +
                '<div class="status">' + (a.done
                    ? '<span class="status-dot done"></span><span class="material-symbols-rounded" translate="no" aria-hidden="true">check_circle</span> Selesai'
                    : '<span class="status-dot pending"></span>Belum dikerjakan') + '</div>' +
                '</div>';
        }).join('');

        var countEl = document.getElementById('naraActivityCount');
        if (countEl) countEl.textContent = doneCount + '/' + activities.length + ' selesai';
        return { activities: activities, doneCount: doneCount };
    }

    function renderDailyChallenge(activityInfo) {
        var bar = document.getElementById('naraChallengeBar');
        var status = document.getElementById('naraChallengeStatus');
        var text = document.getElementById('naraChallengeText');
        var card = document.getElementById('naraChallengeCard');
        if (!bar || !activityInfo) return;

        var target = 2;
        var doneCount = Math.min(activityInfo.doneCount, target);
        var pct = Math.round((doneCount / target) * 100);
        bar.style.width = pct + '%';

        var flagKey = 'nara_daily_challenge_' + today();
        var alreadyAwarded = localStorage.getItem(flagKey) === '1';

        if (alreadyAwarded) {
            status.textContent = 'Tantangan hari ini selesai! +15 XP bonus diperoleh.';
            text.textContent = 'Kerja bagus! Kembali lagi besok untuk tantangan baru.';
            if (card) card.classList.add('is-complete');
        } else {
            status.textContent = doneCount + '/' + target + ' aktivitas';
            text.textContent = 'Selesaikan minimal 2 aktivitas hari ini untuk bonus XP.';
            if (card) card.classList.remove('is-complete');
            if (activityInfo.doneCount >= target) {
                localStorage.setItem(flagKey, '1');
                if (global.NaraState) global.NaraState.addXP(15);
            }
        }
    }

    function renderRecommendations(state) {
        var wrap = document.getElementById('naraRecommendations');
        var countEl = document.getElementById('naraRecoCount');
        if (!wrap) return;
        var list = global.NARA_MATERI_LIST || [];
        var done = state.materiSelesai || [];
        var belum = list.filter(function (m) { return done.indexOf(m.id) === -1; }).slice(0, 3);

        if (belum.length === 0) {
            wrap.innerHTML = '<div class="nara-reco-item" onclick="goTo(\'edukasi\')">' +
                '<div class="ic"><span class="material-symbols-rounded" translate="no" aria-hidden="true">celebration</span></div>' +
                '<div class="body"><h5>Semua materi selesai!</h5><p>Coba Uji Pemahamanmu di halaman Edukasi.</p></div></div>';
            if (countEl) countEl.textContent = 'Semua selesai';
            return;
        }

        wrap.innerHTML = belum.map(function (m) {
            var kategoriLabel = KATEGORI_LABELS[m.kategori] || m.kategori;
            return '<div class="nara-reco-item" onclick="goTo(\'' + m.pageId.replace('page-', '') + '\')">' +
                '<div class="ic">' + m.icon + '</div>' +
                '<div class="body"><h5>' + m.title + '</h5><p>' + kategoriLabel + ' · ' + m.waktu + ' · +' + m.xp + ' XP</p></div>' +
                '</div>';
        }).join('');
        if (countEl) countEl.textContent = belum.length + ' materi';
    }

    function renderModulSaya(state) {
        var wrap = document.getElementById('naraModulSaya');
        if (!wrap) return;
        var list = global.NARA_MATERI_LIST || [];
        var done = state.materiSelesai || [];

        wrap.innerHTML = list.map(function (m) {
            var isDone = done.indexOf(m.id) > -1;
            return '<div class="nara-modul-item' + (isDone ? ' is-done' : '') + '" onclick="goTo(\'' + m.pageId.replace('page-', '') + '\')">' +
                '<div class="ic-wrap">' + m.icon + '</div>' +
                '<h5>' + m.title + '</h5>' +
                '<span data-materi-status="' + m.id + '"></span>' +
                '</div>';
        }).join('');

        // Isi status awal langsung (biar tidak kosong sebelum NaraState.render jalan lagi)
        wrap.querySelectorAll('[data-materi-status]').forEach(function (n) {
            var id = n.getAttribute('data-materi-status');
            var isDone = done.indexOf(id) > -1;
            n.innerHTML = isDone ? '<span class="material-symbols-rounded" translate="no" aria-hidden="true">check</span> Selesai' : 'Belum mulai';
            n.classList.toggle('is-done', isDone);
        });
    }

    function renderNotifBanner(state) {
        var wrap = document.getElementById('naraNotifBanner');
        if (!wrap) return;
        var list = global.NARA_MATERI_LIST || [];
        var done = state.materiSelesai || [];
        var doneTodayAny = (global.NaraState && global.NaraState.isMateriDoneToday()) || anyQuizDoneToday();
        var msgs = [];

        if (state.streak && state.streak.count > 0 && !doneTodayAny) {
            msgs.push({ icon: 'local_fire_department', text: 'Streak kamu (' + state.streak.count + ' hari) masih aman — selesaikan 1 aktivitas hari ini!', action: "goTo('edukasi')" });
        }
        if (done.length < list.length && !msgs.length) {
            msgs.push({ icon: 'auto_stories', text: 'Yuk lanjutkan materi yang belum selesai.', action: "goTo('edukasi')" });
        }
        if (done.length === list.length && list.length > 0) {
            msgs.push({ icon: 'emoji_events', text: 'Kamu sudah menyelesaikan semua materi edukasi. Keren!', action: "goTo('data')" });
        }

        wrap.innerHTML = msgs.slice(0, 1).map(function (m) {
            return '<div class="nara-notif-card" onclick="' + m.action + '">' +
                '<span class="material-symbols-rounded" translate="no" aria-hidden="true">' + m.icon + '</span>' +
                '<span>' + m.text + '</span></div>';
        }).join('');
    }

    var berandaRendering = false;
    function renderBerandaHub() {
        if (!global.NaraState || berandaRendering) return;
        berandaRendering = true;
        try {
            var state = global.NaraState.load();
            var activityInfo = renderTodayActivities(state);
            renderDailyChallenge(activityInfo);
            renderRecommendations(state);
            renderModulSaya(state);
            renderNotifBanner(state);
        } finally {
            berandaRendering = false;
        }
    }
    global.renderBerandaHub = renderBerandaHub;

    /* ---------------------------------------------------------
       BOOT
       --------------------------------------------------------- */
    function boot() {
        renderEduEnhancements();
        renderBerandaHub();
        /* sinkronkan progres harian (level/badge) setelah status aktivitas tersedia */
        if (global.NaraState) global.NaraState.render();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})(window);
