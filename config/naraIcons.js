/* =========================================================================
   NARA — Config Icon Terpusat
   -------------------------------------------------------------------------
   Sumber tunggal untuk seluruh icon gambar resmi Materi Edukasi NARA.
   Semua icon berasal dari asset resmi (bukan emoji, bukan icon library).

   Jangan menambahkan icon baru di sini kecuali file gambarnya memang
   sudah ditambahkan ke folder assets/icons/.
   ========================================================================= */
(function (global) {
    "use strict";

    // -------------------------------------------------------------------
    // 1. Sumber path gambar resmi (sesuai file di assets/icons/)
    // -------------------------------------------------------------------
    var NARA_ICONS = {
        pergaulanSehat:        "assets/icons/pergaulan_sehat.png",
        freeSex:                "assets/icons/free_sex.png",
        revengePorn:            "assets/icons/revenge_porn.png",
        pergaulanBebas:         "assets/icons/pergaulan_bebas.png",
        kesehatanMental:        "assets/icons/kesehatan_mental.png",
        literasiAiDeepfake:     "assets/icons/literasi_ai_deepfake.png",
        keamananDigital:        "assets/icons/keamanan_digital.png",
        pendampinganRemaja:     "assets/icons/pendampingan_remaja.png",
        komunikasiOrangTuaAnak: "assets/icons/komunikasi_orang_tua_anak.png",
        pengawasanDigital:      "assets/icons/pengawasan_digital.png"
    };

    // -------------------------------------------------------------------
    // 2. Mapping icon → id materi (dipakai untuk render kartu di index.html)
    //    id ini sama dengan id pada config/materiList.js & goTo(id)
    // -------------------------------------------------------------------
    var EDUCATION_ICONS_BY_ID = {
        pergaulansehat: NARA_ICONS.pergaulanSehat,
        freesex: NARA_ICONS.freeSex,
        revenge: NARA_ICONS.revengePorn,
        pergaulanbebas: NARA_ICONS.pergaulanBebas,
        mental: NARA_ICONS.kesehatanMental,
        ai: NARA_ICONS.literasiAiDeepfake,
        digital: NARA_ICONS.keamananDigital,
        ortu: NARA_ICONS.pendampinganRemaja,
        ortukomunikasi: NARA_ICONS.komunikasiOrangTuaAnak,
        ortupengawasan: NARA_ICONS.pengawasanDigital
    };

    // Mapping berdasarkan judul (opsional, sesuai contoh permintaan)
    var EDUCATION_ICONS_BY_TITLE = {
        "Pergaulan Sehat": NARA_ICONS.pergaulanSehat,
        "Free Sex": NARA_ICONS.freeSex,
        "Revenge Porn": NARA_ICONS.revengePorn,
        "Pergaulan Bebas": NARA_ICONS.pergaulanBebas,
        "Kesehatan Mental": NARA_ICONS.kesehatanMental,
        "Literasi AI & Deepfake": NARA_ICONS.literasiAiDeepfake,
        "Keamanan Digital": NARA_ICONS.keamananDigital,
        "Pendampingan Remaja": NARA_ICONS.pendampinganRemaja,
        "Komunikasi Orang Tua & Anak": NARA_ICONS.komunikasiOrangTuaAnak,
        "Pengawasan Digital": NARA_ICONS.pengawasanDigital
    };

    global.NARA_ICONS = NARA_ICONS;
    global.EDUCATION_ICONS_BY_ID = EDUCATION_ICONS_BY_ID;
    global.EDUCATION_ICONS_BY_TITLE = EDUCATION_ICONS_BY_TITLE;

    // -------------------------------------------------------------------
    // 3. Fallback bila gambar gagal dimuat — sembunyikan img, JANGAN
    //    diganti dengan emoji. Dipanggil lewat atribut onerror di <img>.
    // -------------------------------------------------------------------
    global.naraIconFallback = function (imgEl) {
        if (imgEl && imgEl.style) {
            imgEl.style.display = "none";
        }
    };
})(window);
