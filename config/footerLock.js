/* =========================================================================
   NARA — Footer Copyright Lock
   -------------------------------------------------------------------------
   Teks hak cipta di footer TIDAK ditulis polos di HTML/JS. Teks disimpan
   dalam bentuk terenkode (Base64) di sini, lalu dirender ke halaman saat
   runtime. Sebuah MutationObserver terus mengawasi elemen ini: jika ada
   yang mencoba mengubah isinya secara manual (mis. lewat DevTools /
   inspect element), teks otomatis dikembalikan ke versi asli seketika.

   CATATAN JUJUR: ini BUKAN enkripsi yang benar-benar tidak bisa ditembus.
   Karena ini web client-side, siapa pun yang membuka file source (termasuk
   file ini) tetap bisa membaca/mengubah kodenya. Mekanisme ini hanya
   mencegah perubahan iseng/cepat lewat tampilan browser atau editor yang
   tidak menyentuh file ini secara langsung — bukan proteksi tingkat
   keamanan sungguhan.

   Untuk mengubah teks hak cipta secara SAH: ganti nilai `ENC` di bawah ini
   dengan hasil Base64 dari teks baru.
   ========================================================================= */
(function () {
  "use strict";

  // Base64 dari: "© 2026 NARA — Navigasi Aman Remaja · Hak Cipta SMKN 2 Magetan. Seluruh hak dilindungi."
  var ENC = "wqkgMjAyNiBOQVJBIOKAlCBOYXZpZ2FzaSBBbWFuIFJlbWFqYSDCtyBIYWsgQ2lwdGEgU01LTiAyIE1hZ2V0YW4uIFNlbHVydWggaGFrIGRpbGluZHVuZ2ku";

  function decode(str) {
    try {
      return decodeURIComponent(escape(window.atob(str)));
    } catch (e) {
      return "";
    }
  }

  var TEXT = decode(ENC);

  function render() {
    var el = document.getElementById("footerCopyright");
    if (!el) return null;
    if (el.textContent !== TEXT) {
      el.textContent = TEXT;
    }
    return el;
  }

  function guard(el) {
    if (!el || !window.MutationObserver) return;
    var observer = new MutationObserver(function () {
      if (el.textContent !== TEXT) {
        observer.disconnect();
        el.textContent = TEXT;
        observer.observe(el, { childList: true, characterData: true, subtree: true });
      }
    });
    observer.observe(el, { childList: true, characterData: true, subtree: true });
  }

  function init() {
    var el = render();
    guard(el);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
