/* =========================================================================
   NARA — Render Data DK 2025–2026
   -------------------------------------------------------------------------
   Membaca `window.dataDKConfig` (config/dataDK.js) dan menampilkannya di
   bagian "Data DK 2025–2026" pada halaman Data (#page-data). File ini
   murni logika tampilan — semua angka ada di config/dataDK.js.
   ========================================================================= */
(function () {
    "use strict";

    var state = {
        built: false,
        selectedYear: null,
        detailOpen: false
    };

    function cfg() {
        return window.dataDKConfig || { yearOrder: [], years: {}, meta: {} };
    }

    function esc(str) {
        var d = document.createElement("div");
        d.textContent = str == null ? "" : String(str);
        return d.innerHTML;
    }

    function fmt(n) {
        if (n == null || isNaN(n)) return "-";
        return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    function diputusTotal(y) {
        var d = y.perkaraDiputus || {};
        return (d.kabul || 0) + (d.tolak || 0) + (d.cabut || 0) + (d.gugur || 0);
    }

    // ---------------------------------------------------------------
    // INIT — dipanggil setiap kali halaman Data dibuka
    // ---------------------------------------------------------------
    window.initDataDK = function () {
        var c = cfg();
        if (!c.yearOrder || !c.yearOrder.length) return;

        if (!state.selectedYear) {
            state.selectedYear = c.yearOrder[c.yearOrder.length - 1]; // tahun terbaru default
        }

        if (!state.built) {
            buildHeader();
            buildYearTabs();
            buildCompare();
            state.built = true;
        }
        renderPanel();
    };

    // ---------------------------------------------------------------
    // HEADER
    // ---------------------------------------------------------------
    function buildHeader() {
        var c = cfg();
        var holder = document.getElementById("dataDKHeader");
        if (!holder) return;

        var html = '<div class="dk-header-top">';
        html += '<span class="dk-badge"><span class="material-symbols-rounded" translate="no" aria-hidden="true">verified</span> ' + esc(c.meta.sourceShort || "Data Dispensasi Nikah") + '</span>';
        html += '<span class="dk-updated"><span class="material-symbols-rounded" translate="no" aria-hidden="true">schedule</span> Diperbarui: ' + esc(c.meta.lastUpdated || "-") + '</span>';
        html += '</div>';
        html += '<h2 class="dk-title">' + esc(c.meta.title || "Data Dispensasi Nikah 2025–2026") + '</h2>';
        html += '<p class="dk-subtitle">' + esc(c.meta.subtitle || "Statistik Data Berdasarkan Tahun") + '</p>';
        if (c.meta.note) html += '<p class="dk-note">' + esc(c.meta.note) + '</p>';

        holder.innerHTML = html;
    }

    // ---------------------------------------------------------------
    // TAB PEMILIH TAHUN
    // ---------------------------------------------------------------
    function buildYearTabs() {
        var c = cfg();
        var holder = document.getElementById("dataDKYearTabs");
        if (!holder) return;

        var html = '<div class="dk-year-tabs" role="tablist" aria-label="Pilih tahun data">';
        c.yearOrder.forEach(function (yr) {
            var active = (yr === state.selectedYear);
            html += '<button type="button" class="dk-year-tab' + (active ? ' active' : '') + '" role="tab" aria-selected="' + active + '" data-year="' + yr + '">' + esc(yr) + '</button>';
        });
        html += '</div>';
        holder.innerHTML = html;

        holder.querySelectorAll(".dk-year-tab").forEach(function (btn) {
            btn.addEventListener("click", function () {
                var yr = parseInt(btn.getAttribute("data-year"), 10);
                if (yr === state.selectedYear) return;
                state.selectedYear = yr;
                holder.querySelectorAll(".dk-year-tab").forEach(function (b) {
                    var isActive = b === btn;
                    b.classList.toggle("active", isActive);
                    b.setAttribute("aria-selected", isActive);
                });
                renderPanel();
            });
        });
    }

    // ---------------------------------------------------------------
    // PERBANDINGAN TAHUN 2025 vs 2026
    // -------------------------------------------------------------
    // Kartu ini statis (tidak mengikuti tab pemilih tahun) dan hanya
    // dibangun sekali. Angka diambil langsung dari `window.dataDKConfig`
    // (2025 & 2026), jadi kalau data di config/dataDK.js diperbarui,
    // kartu ini otomatis ikut ter-update tanpa perlu diedit manual.
    // ---------------------------------------------------------------
    function buildCompare() {
        var c = cfg();
        var holder = document.getElementById("dataDKCompare");
        if (!holder) return;

        var yA = c.years[2025];
        var yB = c.years[2026];
        if (!yA || !yB) { holder.innerHTML = ""; return; }

        var items = [
            { label: "Perkara Masuk", a: yA.perkaraMasuk, b: yB.perkaraMasuk },
            { label: "Perkara Diputus", a: diputusTotal(yA), b: diputusTotal(yB) }
        ];

        var html = '<div class="card dk-card dk-compare-card">';
        html += '<h4 class="dk-card-title"><span class="material-symbols-rounded" translate="no" aria-hidden="true">compare_arrows</span> Perbandingan Tahun 2025 vs 2026</h4>';
        html += '<p class="dk-card-sub">Perubahan jumlah per kategori dari 2025 ke 2026.</p>';
        html += '<div class="dk-compare-bars">';

        items.forEach(function (it) {
            var max = Math.max(it.a || 0, it.b || 0) || 1;
            var pctA = Math.max(4, Math.round((it.a || 0) / max * 100));
            var pctB = Math.max(4, Math.round((it.b || 0) / max * 100));

            html += '<div class="dk-compare-group">';
            html += '<span class="dk-compare-bar-label">' + esc(it.label) + '</span>';

            html += '<div class="dk-compare-bar-row" title="' + esc(it.label) + ' 2025: ' + fmt(it.a) + '">';
            html += '<span class="dk-compare-yr">2025</span>';
            html += '<div class="dk-compare-track"><div class="dk-compare-fill" style="width:' + pctA + '%;background:var(--gray);"></div></div>';
            html += '<b>' + fmt(it.a) + '</b>';
            html += '</div>';

            html += '<div class="dk-compare-bar-row" title="' + esc(it.label) + ' 2026: ' + fmt(it.b) + '">';
            html += '<span class="dk-compare-yr">2026</span>';
            html += '<div class="dk-compare-track"><div class="dk-compare-fill" style="width:' + pctB + '%;background:var(--blue);"></div></div>';
            html += '<b>' + fmt(it.b) + '</b>';
            html += '</div>';

            html += '</div>';
        });

        html += '</div></div>';
        holder.innerHTML = html;
    }

    // ---------------------------------------------------------------
    // PANEL UTAMA (berubah sesuai tahun terpilih)
    // ---------------------------------------------------------------
    function renderPanel() {
        var c = cfg();
        var holder = document.getElementById("dataDKPanel");
        if (!holder) return;

        var y = c.years[state.selectedYear];
        if (!y) { holder.innerHTML = ""; return; }

        var total = diputusTotal(y);
        var html = "";

        html += '<div class="dk-fade-wrap" key="' + state.selectedYear + '">';

        // ---- Ringkasan Statistik ----
        html += '<div class="dk-summary-grid">';
        html += dkStatCard("assignment", y.perkaraMasuk, "Perkara Masuk", "--blue");
        html += dkStatCard("gavel", total, "Perkara Diputus", "--navy");
        html += dkStatCard("male", y.jenisKelamin.L, "Laki-laki", "--blue");
        html += dkStatCard("female", y.jenisKelamin.P, "Perempuan", "--magenta");
        html += dkStatCard("pregnant_woman", y.penyebab.hamil, "Hamil", "--orange");
        html += dkStatCard("child_care", y.usia.under15, "Usia <15", "--purple");
        html += dkStatCard("groups", y.usia.r1519, "Usia 15–19", "--purple");
        html += dkStatCard("no_accounts", y.pendidikan.tidakSekolah, "Tidak Sekolah", "--red");
        html += dkStatCard("school", y.pendidikan.sd, "SD", "--teal");
        html += dkStatCard("school", y.pendidikan.smp, "SMP", "--teal");
        html += dkStatCard("school", y.pendidikan.sma, "SMA", "--teal");
        html += '</div>';

        if (y.perkaraBerjalan != null) {
            html += '<div class="dk-inline-note"><span class="material-symbols-rounded" translate="no" aria-hidden="true">hourglass_top</span> Perkara berjalan (masih diproses) di tahun ' + esc(y.label) + ': <b>' + fmt(y.perkaraBerjalan) + '</b></div>';
        }

        // ---- Status Perkara ----
        html += '<div class="card dk-card">';
        html += '<h4 class="dk-card-title"><span class="material-symbols-rounded" translate="no" aria-hidden="true">balance</span> Status Perkara — ' + esc(y.label) + '</h4>';
        html += '<p class="dk-card-sub">Rincian keputusan dari total ' + fmt(total) + ' perkara diputus.</p>';
        html += '<div class="dk-status-list">';
        html += dkStatusRow("Kabul", y.perkaraDiputus.kabul, total, "--green");
        html += dkStatusRow("Tolak", y.perkaraDiputus.tolak, total, "--red");
        html += dkStatusRow("Cabut", y.perkaraDiputus.cabut, total, "--yellow");
        html += dkStatusRow("Gugur", y.perkaraDiputus.gugur, total, "--purple");
        html += '</div></div>';

        // ---- Jenis Kelamin ----
        var gTotal = y.jenisKelamin.L + y.jenisKelamin.P;
        var pctL = gTotal ? (y.jenisKelamin.L / gTotal * 100) : 0;
        var pctP = gTotal ? (y.jenisKelamin.P / gTotal * 100) : 0;
        html += '<div class="card dk-card">';
        html += '<h4 class="dk-card-title"><span class="material-symbols-rounded" translate="no" aria-hidden="true">wc</span> Jenis Kelamin — ' + esc(y.label) + '</h4>';
        html += '<div class="dk-donut-row">';
        html += '<div class="dk-donut" style="background:conic-gradient(var(--blue) 0% ' + pctL.toFixed(1) + '%, var(--magenta) ' + pctL.toFixed(1) + '% 100%);" title="Laki-laki: ' + fmt(y.jenisKelamin.L) + ' · Perempuan: ' + fmt(y.jenisKelamin.P) + '">';
        html += '<div class="dk-donut-hole">' + fmt(gTotal) + '<span>total</span></div>';
        html += '</div>';
        html += '<div class="dk-donut-legend">';
        html += '<span class="dk-legend-item"><i style="background:var(--blue)"></i>Laki-laki (L) — <b>' + fmt(y.jenisKelamin.L) + '</b> <small>(' + pctL.toFixed(1) + '%)</small></span>';
        html += '<span class="dk-legend-item"><i style="background:var(--magenta)"></i>Perempuan (P) — <b>' + fmt(y.jenisKelamin.P) + '</b> <small>(' + pctP.toFixed(1) + '%)</small></span>';
        html += '</div></div></div>';

        // ---- Usia ----
        html += '<div class="card dk-card">';
        html += '<h4 class="dk-card-title"><span class="material-symbols-rounded" translate="no" aria-hidden="true">cake</span> Kelompok Usia — ' + esc(y.label) + '</h4>';
        html += dkBarChart([
            { label: "<15 tahun", value: y.usia.under15, colorVar: "--purple" },
            { label: "15–19 tahun", value: y.usia.r1519, colorVar: "--blue" }
        ]);
        html += '</div>';

        // ---- Pendidikan ----
        html += '<div class="card dk-card">';
        html += '<h4 class="dk-card-title"><span class="material-symbols-rounded" translate="no" aria-hidden="true">school</span> Tingkat Pendidikan — ' + esc(y.label) + '</h4>';
        html += dkBarChart([
            { label: "Tidak Sekolah", value: y.pendidikan.tidakSekolah, colorVar: "--red" },
            { label: "SD", value: y.pendidikan.sd, colorVar: "--teal" },
            { label: "SMP", value: y.pendidikan.smp, colorVar: "--teal" },
            { label: "SMA", value: y.pendidikan.sma, colorVar: "--teal" }
        ]);
        html += '</div>';

        // ---- Detail (Penyebab hamil/tidak hamil + tombol Lihat Detail) ----
        html += '<div class="card dk-card">';
        html += '<button type="button" class="dk-detail-toggle" id="dkDetailToggle"><span><span class="material-symbols-rounded" translate="no" aria-hidden="true">info</span> Lihat Detail Penyebab</span><span class="material-symbols-rounded dk-detail-chevron" translate="no" aria-hidden="true">expand_more</span></button>';
        html += '<div class="dk-detail-body' + (state.detailOpen ? ' is-open' : '') + '" id="dkDetailBody">';
        html += dkBarChart([
            { label: "Hamil", value: y.penyebab.hamil, colorVar: "--orange" },
            { label: "Tidak Hamil", value: y.penyebab.tidakHamil, colorVar: "--blue" }
        ]);
        html += '<p class="dk-detail-text">Data penyebab ini mencatat kondisi pemohon pada perkara dispensasi kawin (DK) di tahun ' + esc(y.label) + '.</p>';
        html += '</div></div>';

        html += '</div>'; // .dk-fade-wrap

        holder.innerHTML = html;
        animateCountUps(holder);

        var toggleBtn = document.getElementById("dkDetailToggle");
        if (toggleBtn) {
            toggleBtn.addEventListener("click", function () {
                state.detailOpen = !state.detailOpen;
                var body = document.getElementById("dkDetailBody");
                if (body) body.classList.toggle("is-open", state.detailOpen);
                toggleBtn.classList.toggle("is-open", state.detailOpen);
            });
            if (state.detailOpen) toggleBtn.classList.add("is-open");
        }
    }

    function dkStatCard(icon, value, label, colorVar) {
        return '<div class="dk-stat-card" style="border-top-color:var(' + colorVar + ');">' +
            '<div class="dk-stat-ic" style="color:var(' + colorVar + ');"><span class="material-symbols-rounded" translate="no" aria-hidden="true">' + icon + '</span></div>' +
            '<div class="dk-stat-num" data-countup="' + (value == null ? 0 : value) + '">0</div>' +
            '<div class="dk-stat-lbl">' + esc(label) + '</div>' +
            '</div>';
    }

    function dkStatusRow(label, value, total, colorVar) {
        var pct = total ? (value / total * 100) : 0;
        return '<div class="dk-status-row" title="' + esc(label) + ': ' + fmt(value) + ' dari ' + fmt(total) + '">' +
            '<div class="dk-status-row-top"><span>' + esc(label) + '</span><b>' + fmt(value) + '</b></div>' +
            '<div class="dk-progress"><div class="dk-progress-fill" style="width:' + pct.toFixed(1) + '%;background:var(' + colorVar + ');"></div></div>' +
            '</div>';
    }

    function dkBarChart(items) {
        var max = Math.max.apply(null, items.map(function (i) { return i.value || 0; }));
        var html = '<div class="dk-bar-chart">';
        items.forEach(function (it) {
            var h = max ? Math.max(6, Math.round((it.value || 0) / max * 100)) : 6;
            html += '<div class="dk-bar-col" title="' + esc(it.label) + ': ' + fmt(it.value) + '">';
            html += '<div class="dk-bar-value">' + fmt(it.value) + '</div>';
            html += '<div class="dk-bar-track"><div class="dk-bar-fill" style="height:' + h + '%;background:var(' + it.colorVar + ');"></div></div>';
            html += '<div class="dk-bar-label">' + esc(it.label) + '</div>';
            html += '</div>';
        });
        html += '</div>';
        return html;
    }

    // ---------------------------------------------------------------
    // ANIMASI ANGKA
    // ---------------------------------------------------------------
    function animateCountUps(scope) {
        var nums = scope.querySelectorAll("[data-countup]");
        nums.forEach(function (el) {
            var target = parseFloat(el.getAttribute("data-countup"));
            if (isNaN(target)) return;
            var dur = 500;
            var start = null;
            function step(ts) {
                if (!start) start = ts;
                var progress = Math.min(1, (ts - start) / dur);
                el.textContent = Math.round(progress * target);
                if (progress < 1) requestAnimationFrame(step);
                else el.textContent = target;
            }
            requestAnimationFrame(step);
        });
    }

})();
