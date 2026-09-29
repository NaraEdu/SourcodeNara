/* =========================================================
   NARA STATE — satu sumber data untuk XP, Level, Streak, Badge
   Tidak menghapus mekanisme lama (nara_hubunganku, nara_streak, dst),
   hanya menyatukannya supaya Dashboard, Edukasi, dan Data tidak
   menampilkan angka yang berbeda-beda / hardcoded.
   ========================================================= */
(function (global) {
    'use strict';

    var STORAGE_KEY = 'nara_global_state';

    function ic0(name) {
        return '<span class="material-symbols-rounded" translate="no" aria-hidden="true">' + name + '</span>';
    }

    var LEVELS = [
        { level: 1, name: 'Pemula',        min: 0 },
        { level: 2, name: 'Penjelajah',    min: 200 },
        { level: 3, name: 'Petualang',     min: 500 },
        { level: 4, name: 'Penjaga Aman',  min: 1000 },
        { level: 5, name: 'Sahabat NARA',  min: 2000 }
    ];

    /* Badge HARIAN: reset tiap hari. Ketujuhnya penuh = semua misi hari itu tuntas = naik level. */
    var BADGES = [
        { id: 'langkah_pertama',  emoji: ic0('eco'),                   title: 'Langkah Pertama',        desc: 'Menyelesaikan aktivitas pertamamu hari ini.', check: function (s, c) { return (s.dayXP || 0) > 0 || c.actDone > 0; } },
        { id: 'rajin_belajar',    emoji: ic0('menu_book'),             title: 'Rajin Belajar',          desc: 'Menyelesaikan 3 materi hari ini.',            check: function (s) { return s.materiSelesai.length >= 3; } },
        { id: 'digital_defender', emoji: ic0('shield'),                title: 'Digital Defender',       desc: 'Menuntaskan materi Keamanan Digital & Literasi AI hari ini.', check: function (s) { return s.materiSelesai.indexOf('digital') > -1 && s.materiSelesai.indexOf('ai') > -1; } },
        { id: 'jago_kuis',        emoji: ic0('handshake'),             title: 'Jago Kuis',              desc: 'Menyelesaikan satu kuis hari ini.',           check: function (s, c) { return !!(c.byId && c.byId.kuis); } },
        { id: 'mental_explorer',  emoji: ic0('psychology'),            title: 'Mental Health Explorer', desc: 'Menyelesaikan Mood Quest hari ini.',          check: function (s, c) { return !!(c.byId && c.byId.cek); } },
        { id: 'semua_materi',     emoji: ic0('local_fire_department'), title: 'Semua Materi Tuntas',    desc: 'Menyelesaikan seluruh materi hari ini.',      check: function (s, c) { return s.materiSelesai.length >= c.totalMateri; } },
        { id: 'nara_champion',    emoji: ic0('emoji_events'),          title: 'NARA Champion',          desc: 'Menuntaskan seluruh misi hari ini dan naik level.', check: function (s, c) { return isDayComplete(s, c); } }
    ];

    function localDate(d) {
        d = d || new Date();
        var m = String(d.getMonth() + 1); if (m.length < 2) m = '0' + m;
        var day = String(d.getDate()); if (day.length < 2) day = '0' + day;
        return d.getFullYear() + '-' + m + '-' + day;
    }
    /* Tanggal memakai jam LOKAL perangkat (bukan UTC), jadi reset harian terjadi tepat tengah malam. */
    function todayStr() { return localDate(new Date()); }
    function yesterdayStr() {
        var d = new Date(); d.setDate(d.getDate() - 1);
        return localDate(d);
    }
    function ic(name) {
        return '<span class="material-symbols-rounded" translate="no" aria-hidden="true">' + name + '</span>';
    }

    /* ---------------------------------------------------------
       MODEL GAME HARIAN
       - level        : PERMANEN. Naik +1 hanya jika SEMUA misi hari itu tuntas.
       - materi, badge, XP harian, status kuis : DIRESET setiap ganti hari.
       - streak       : bertambah tiap hari ada aktivitas, kembali 0 jika bolos sehari.
       --------------------------------------------------------- */
    function defaultState() {
        return {
            xp: 0,                       // total XP seumur hidup
            dayXP: 0,                    // XP yang diperoleh hari ini (reset harian)
            level: 1,                    // permanen
            dayDate: todayStr(),         // tanggal "hari ini" pada data harian di bawah
            dayComplete: false,          // true jika semua misi hari ini tuntas
            completedDays: {},           // { 'YYYY-MM-DD': true } hari yang tuntas penuh
            materiSelesai: [],           // reset harian
            materiSelesaiTanggal: {},    // reset harian
            quiz: {},                    // reset harian
            badges: [],                  // reset harian
            streak: { count: 0, last: null, history: {} }
        };
    }

    function levelFromXP(xp) {
        var lv = 1;
        for (var i = 0; i < LEVELS.length; i++) { if (xp >= LEVELS[i].min) lv = LEVELS[i].level; }
        return lv;
    }

    /* Ganti hari: kosongkan semua progres harian, level & streak tetap. */
    function rollover(state) {
        var today = todayStr();
        if (state.dayDate === today) return false;
        state.dayDate = today;
        state.dayComplete = false;
        state.dayXP = 0;
        state.materiSelesai = [];
        state.materiSelesaiTanggal = {};
        state.quiz = {};
        state.badges = [];
        return true;
    }

    function load() {
        var state;
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return defaultState();
            var parsed = JSON.parse(raw);
            var d = defaultState();
            state = Object.assign(d, parsed, {
                quiz: Object.assign({}, d.quiz, parsed.quiz),
                streak: Object.assign({}, d.streak, parsed.streak),
                completedDays: Object.assign({}, d.completedDays, parsed.completedDays),
                materiSelesaiTanggal: Object.assign({}, d.materiSelesaiTanggal, parsed.materiSelesaiTanggal)
            });
            /* Data lama (sebelum sistem harian) belum punya level: turunkan dari XP lama. */
            if (typeof parsed.level !== 'number') state.level = levelFromXP(parsed.xp || 0);
            state.level = Math.max(1, Math.min(LEVELS.length, state.level));
            if (!parsed.dayDate) state.dayDate = null;
        } catch (e) { return defaultState(); }
        if (rollover(state)) save(state);
        return state;
    }

    function save(state) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
    }

    function getLevelInfo(state) {
        var lv = Math.max(1, Math.min(LEVELS.length, (state && state.level) || 1));
        var cur = LEVELS[lv - 1], next = LEVELS[lv] || null;
        return {
            level: cur.level,
            name: cur.name,
            isMax: !next,
            nextLevel: next ? next.level : null,
            nextName: next ? next.name : null
        };
    }

    /* 7 tantangan tetap di Uji Pemahamanmu — dipakai untuk hitung total 17 misi (10 materi + 7 tantangan). */
    var TANTANGAN_KEYS = ['hubunganku', 'pertemanan', 'moodquest', 'pergaulansehat', 'pergaulanbebas', 'digitalgame', 'aigame'];

    function countTantanganDoneToday() {
        if (typeof global.isQuizDoneToday !== 'function') return 0;
        var n = 0;
        TANTANGAN_KEYS.forEach(function (k) { if (global.isQuizDoneToday(k)) n++; });
        return n;
    }

    /* Konteks harian: jumlah materi, status 3 aktivitas ringkas (dari naraHome.js), & status 7 tantangan. */
    function buildCtx() {
        var list = global.NARA_MATERI_LIST || [];
        var act = (typeof global.getDailyActivityStatus === 'function') ? global.getDailyActivityStatus() : null;
        return {
            totalMateri: list.length || 10,
            actDone: act ? act.done : 0,
            actTotal: act ? act.total : 3,
            byId: act ? act.byId : {},
            totalTantangan: TANTANGAN_KEYS.length,
            doneTantangan: countTantanganDoneToday()
        };
    }

    /* Naik level ketika 17 misi (10 materi + 7 tantangan) hari ini tuntas semua. */
    function isDayComplete(s, c) {
        return c.totalMateri > 0 && s.materiSelesai.length >= c.totalMateri &&
               c.totalTantangan > 0 && c.doneTantangan >= c.totalTantangan;
    }

    function bumpStreak(state) {
        var today = todayStr(), y = yesterdayStr();
        if (state.streak.last === today) {
            // sudah tercatat hari ini, tidak diapa-apakan
        } else if (state.streak.last === y) {
            state.streak.count += 1;
            state.streak.last = today;
        } else {
            state.streak.count = 1;
            state.streak.last = today;
        }
        state.streak.history[today] = true;
        try {
            /* sinkronkan dengan sistem streak lama (nara_streak) agar Dashboard/Edukasi/Data konsisten */
            localStorage.setItem('nara_streak', JSON.stringify({ count: state.streak.count, last: state.streak.last }));
        } catch (e) {}
        return state;
    }

    function checkStreakDecay(state) {
        var today = todayStr(), y = yesterdayStr();
        if (state.streak.last && state.streak.last !== today && state.streak.last !== y) {
            state.streak.count = 0;
        }
        return state;
    }

    function newlyEarnedBadges(state, ctx) {
        var earned = [];
        BADGES.forEach(function (b) {
            var already = state.badges.indexOf(b.id) > -1;
            if (!already && b.check(state, ctx)) {
                state.badges.push(b.id);
                earned.push(b);
            }
        });
        return earned;
    }

    function showModal(html) {
        try {
            var wrap = document.createElement('div');
            wrap.className = 'modal-overlay';
            wrap.style.display = 'flex';
            wrap.innerHTML = '<div class="modal-box" style="text-align:center;max-width:340px;">' + html +
                '<button class="btn btn-primary" style="width:100%;">Asyik!</button></div>';
            wrap.querySelector('button').onclick = function () { wrap.remove(); };
            wrap.onclick = function (e) { if (e.target === wrap) wrap.remove(); };
            document.body.appendChild(wrap);
        } catch (e) {}
    }

    function showBadgeModal(badge) {
        showModal(
            '<div style="font-size:3rem;margin-bottom:6px;">' + badge.emoji + '</div>' +
            '<h3 style="margin-bottom:4px;">Badge Baru Diperoleh!</h3>' +
            '<p style="font-weight:700;color:var(--navy-2);margin-bottom:6px;">' + badge.title + '</p>' +
            '<p style="color:var(--text-muted);font-size:.88rem;margin-bottom:18px;">' + badge.desc + '</p>'
        );
    }

    function showLevelUpModal(res, state) {
        var info = getLevelInfo(state);
        var title, body;
        if (res.leveled) {
            title = 'Naik ke Lv. ' + info.level + ' — ' + info.name + '!';
            body = 'Semua misi & badge hari ini sudah penuh. ' + (info.isMax
                ? 'Kamu sudah di level tertinggi. Tetap kerjakan tiap hari untuk menjaga streak!'
                : 'Besok semua misi direset. Selesaikan lagi untuk mencapai Lv. ' + info.nextLevel + ' (' + info.nextName + ').');
        } else {
            title = 'Misi Hari Ini Tuntas!';
            body = 'Kamu sudah di level tertinggi (' + info.name + '). Kembali besok untuk menjaga streak.';
        }
        showModal(
            '<div style="font-size:3rem;margin-bottom:6px;">' + ic('military_tech') + '</div>' +
            '<h3 style="margin-bottom:6px;">' + title + '</h3>' +
            '<p style="color:var(--text-muted);font-size:.88rem;margin-bottom:18px;">' + body + '</p>'
        );
    }

    /* Cek badge + apakah semua misi hari ini tuntas (=> level naik). Aman dipanggil berulang. */
    function sync() {
        var state = load();
        var ctx = buildCtx();
        var earned = newlyEarnedBadges(state, ctx);
        var res = null;
        if (!state.dayComplete && isDayComplete(state, ctx)) {
            state.dayComplete = true;
            state.completedDays[todayStr()] = true;
            var before = state.level;
            state.level = Math.min(LEVELS.length, before + 1);
            res = { from: before, to: state.level, leveled: state.level > before };
        }
        if (earned.length || res) {
            save(state);
            if (res) {
                setTimeout(function () { showLevelUpModal(res, state); }, 600);
            } else {
                earned.forEach(function (b, i) { setTimeout(function () { showBadgeModal(b); }, 550 + i * 400); });
            }
        }
        return state;
    }

    function addXP(amount) {
        var state = load();
        checkStreakDecay(state);
        state.xp += amount;
        state.dayXP = (state.dayXP || 0) + amount;
        bumpStreak(state);
        save(state);
        render();
        if (typeof global.showToast === 'function') {
            global.showToast('+' + amount + ' XP ' + ic('auto_awesome'), ic('star'));
        }
        return state;
    }

    function recordQuiz(key, score, total) {
        var state = load();
        state.quiz[key] = { score: score, total: total, date: todayStr() };
        save(state);
    }

    function markMateriDone(id, xpReward) {
        var state = load();
        if (state.materiSelesai.indexOf(id) > -1) return state; // sudah hari ini
        state.materiSelesai.push(id);
        state.materiSelesaiTanggal[id] = todayStr();
        save(state);
        return addXP(xpReward || 30);
    }

    function isMateriDoneToday() {
        var state = load();
        var today = todayStr();
        for (var key in state.materiSelesaiTanggal) {
            if (state.materiSelesaiTanggal[key] === today) return true;
        }
        return false;
    }

    function isMateriDone(id) {
        return load().materiSelesai.indexOf(id) > -1;
    }

    /* Render ke semua tempat yang menampilkan Level/Misi/Streak/Badge */
    function render() {
        sync();
        var state = load();
        checkStreakDecay(state);
        var info = getLevelInfo(state);
        var ctx = buildCtx();
        var totalMateri = ctx.totalMateri;
        var doneMateri = Math.min(state.materiSelesai.length, totalMateri);
        var dayTotal = totalMateri + ctx.totalTantangan;
        var dayDone = doneMateri + Math.min(ctx.doneTantangan, ctx.totalTantangan);
        var pct = state.dayComplete ? 100 : (dayTotal ? Math.round((dayDone / dayTotal) * 100) : 0);
        var remaining = Math.max(0, dayTotal - dayDone);

        var nextMsg;
        if (state.dayComplete) {
            nextMsg = info.isMax
                ? 'Misi hari ini tuntas! Kembali besok untuk menjaga streak. ' + ic('celebration')
                : 'Misi hari ini tuntas! Kembali besok untuk naik ke Lv. ' + info.nextLevel + '. ' + ic('celebration');
        } else {
            nextMsg = info.isMax
                ? remaining + ' misi lagi hari ini untuk menjaga streak'
                : remaining + ' misi lagi hari ini untuk naik ke Lv. ' + info.nextLevel;
        }

        setText('naraStatLevel', 'Lv. ' + info.level);
        setText('naraStatLevel2', 'Lv.' + info.level);
        setText('ujiLevelBadge', 'Lv. ' + info.level);
        /* Semua kartu tantangan di Uji Pemahamanmu memakai level yang sama —
           naik bersamaan hanya jika ketujuh tantangan (+ materi) sudah tuntas semua. */
        ['ujiHubungankuLvl', 'ujiPertemananLvl', 'ujiMentalLvl', 'ujiPergaulanLvl',
         'ujiDigitalLvl', 'ujiPergaulanBebasLvl', 'ujiAILvl'].forEach(function (id) {
            setText(id, 'Lv.' + info.level);
        });
        setText('naraStatTantangan', (Math.min(ctx.doneTantangan, ctx.totalTantangan)) + '/' + ctx.totalTantangan + ' tantangan selesai');
        setText('naraStatLevelName', info.name);
        setText('naraStatXP', (state.dayXP || 0) + ' XP');
        setText('naraStatXPFraction', dayDone + ' / ' + dayTotal + ' misi');
        setText('naraStatMateri', doneMateri + '/' + totalMateri + ' materi selesai');
        setText('naraStatStreak', state.streak.count + ' hari');
        setText('naraStatBadgeCount', state.badges.length + '/' + BADGES.length);
        setText('naraNextLevelMsg', nextMsg);

        var bar = document.getElementById('naraXPBar');
        if (bar) bar.style.width = pct + '%';
        var pctEl = document.getElementById('naraXPPercent');
        if (pctEl) pctEl.textContent = pct + '%';

        renderStreakWeek(state);
        renderBadgeRow(state);
        renderMateriStatuses(state);

        /* Dashboard ring + tile */
        var circle = document.getElementById('dashRingCircle');
        if (circle) {
            var circumference = 264;
            circle.setAttribute('stroke-dashoffset', String(circumference - (circumference * pct / 100)));
        }
        setText('dashRingPct', pct + '%');
        var dashBar = document.getElementById('dashProgressBar');
        if (dashBar) dashBar.style.width = pct + '%';
        var dashText = document.getElementById('dashProgressText');
        if (dashText) {
            dashText.textContent = state.dayComplete
                ? 'Misi hari ini tuntas! Kembali besok untuk lanjut ke level berikutnya.'
                : (dayDone === 0
                    ? 'Yuk mulai materi pertamamu hari ini.'
                    : 'Keren! ' + dayDone + ' dari ' + dayTotal + ' misi hari ini sudah selesai.');
        }
        setText('dashModulSaya', doneMateri + '/' + totalMateri + ' selesai');
        setText('dashLevelBadge', 'Lv. ' + info.level + ' · ' + info.name);
        setText('dashNextLevelMsg', nextMsg);
        setText('dashStreakInline', ic('local_fire_department') + ' ' + state.streak.count + ' hari');
        setText('dashBadgeCount', ic('emoji_events') + ' ' + state.badges.length + '/' + BADGES.length);

        /* Beri tahu modul lain (Beranda hub) supaya ikut memperbarui tampilan */
        if (typeof global.renderBerandaHub === 'function') global.renderBerandaHub();
    }

    function setText(id, val) {
        var el = document.getElementById(id);
        if (el) el.innerHTML = val;
    }

    function renderStreakWeek(state) {
        var el = document.getElementById('naraStreakWeek');
        if (!el) return;
        var days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
        var now = new Date();
        var dow = (now.getDay() + 6) % 7; // 0 = Senin
        var html = '';
        for (var i = 0; i < 7; i++) {
            var d = new Date(now);
            d.setDate(now.getDate() - (dow - i));
            var key = localDate(d);
            var active = !!state.streak.history[key];
            var isFuture = d > now && key !== todayStr();
            html += '<div class="streak-day' + (active ? ' is-active' : '') + '">' +
                '<span class="d-label">' + days[i] + '</span>' +
                '<span class="d-dot">' + (active ? '<span class="material-symbols-rounded" translate="no" aria-hidden="true">local_fire_department</span>' : (isFuture ? '·' : '○')) + '</span>' +
                '</div>';
        }
        el.innerHTML = html;
        var sub = document.getElementById('naraStreakSub');
        if (sub) sub.textContent = state.streak.count + ' hari berturut-turut';
    }

    function renderBadgeRow(state) {
        var el = document.getElementById('naraBadgeRow');
        if (!el) return;
        el.innerHTML = BADGES.map(function (b) {
            var got = state.badges.indexOf(b.id) > -1;
            return '<span class="badge-pill' + (got ? ' unlocked' : ' locked') + '" title="' + b.title + (got ? '' : ' (belum diperoleh)') + '">' + b.emoji + '</span>';
        }).join('');
    }

    function renderMateriStatuses(state) {
        var nodes = document.querySelectorAll('[data-materi-status]');
        nodes.forEach(function (n) {
            var id = n.getAttribute('data-materi-status');
            var done = state.materiSelesai.indexOf(id) > -1;
            n.innerHTML = done ? '<span class="material-symbols-rounded" translate="no" aria-hidden="true">check</span> Selesai' : 'Belum mulai';
            n.classList.toggle('is-done', done);
        });
    }

    function initMateriCompletionButtons() {
        var list = global.NARA_MATERI_LIST || [];
        list.forEach(function (m) {
            var page = document.getElementById(m.pageId);
            if (!page) return;
            var wrap = page.querySelector('.wrap.section') || page.querySelector('.wrap');
            if (!wrap || wrap.querySelector('.materi-complete-slot')) return;
            var slot = document.createElement('div');
            slot.className = 'card materi-complete-slot';
            slot.innerHTML =
                '<div class="materi-complete-inner">' +
                '  <div><h5 style="margin-bottom:2px;">Sudah membaca materi ini?</h5>' +
                '  <p style="color:var(--text-muted);font-size:.85rem;margin:0;">Tandai selesai untuk mendapatkan +' + m.xp + ' XP dan melacak progresmu.</p></div>' +
                '  <button class="btn btn-primary materi-complete-btn" type="button">Tandai Selesai</button>' +
                '</div>';
            wrap.appendChild(slot);
            var btn = slot.querySelector('.materi-complete-btn');
            function refreshBtn() {
                var done = isMateriDone(m.id);
                btn.innerHTML = done ? '<span class="material-symbols-rounded" translate="no" aria-hidden="true">check</span> Materi Selesai' : 'Tandai Selesai';
                btn.disabled = done;
                btn.classList.toggle('is-done-btn', done);
            }
            btn.addEventListener('click', function () {
                markMateriDone(m.id, m.xp);
                refreshBtn();
                if (typeof global.showToast === 'function') {
                    global.showToast('Materi selesai! <span class="material-symbols-rounded" translate="no" aria-hidden="true">celebration</span>', '<span class="material-symbols-rounded" translate="no" aria-hidden="true">check_circle</span>');
                }
            });
            document.addEventListener('nara:daychange', refreshBtn);
            refreshBtn();
        });
    }

    global.NaraState = {
        load: load,
        addXP: addXP,
        recordQuiz: recordQuiz,
        markMateriDone: markMateriDone,
        isMateriDone: isMateriDone,
        isMateriDoneToday: isMateriDoneToday,
        getLevelInfo: getLevelInfo,
        render: render,
        localDate: localDate,
        BADGES: BADGES,
        LEVELS: LEVELS
    };

    /* Deteksi pergantian hari saat aplikasi sedang terbuka (mis. lewat tengah malam). */
    var lastSeenDay = todayStr();
    function checkDayChange() {
        var now = todayStr();
        if (now === lastSeenDay) return;
        lastSeenDay = now;
        load();                       // memicu rollover + menyimpan data hari baru
        render();
        try { document.dispatchEvent(new CustomEvent('nara:daychange')); } catch (e) {}
        if (typeof global.updateUjiCards === 'function') { try { global.updateUjiCards(); } catch (e) {} }
        if (typeof global.showToast === 'function') {
            global.showToast('Hari baru! Misi harian sudah direset ' + ic('sync'), ic('today'));
        }
    }
    setInterval(checkDayChange, 30000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) checkDayChange(); });

    function boot() {
        initMateriCompletionButtons();
        render();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})(window);
