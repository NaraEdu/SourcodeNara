/* =========================================================================
   NARA — Apply Config
   -------------------------------------------------------------------------
   File ini membaca `window.appAppearance` dan `window.branding` (dari
   appAppearance.js & branding.js) lalu menerapkannya ke halaman:
     - Background Beranda (foto, overlay, gradient, glow, blur, mobile)
     - Logo (header, footer, favicon, manifest/app icon)
     - Fallback aman jika gambar gagal dimuat

   Tidak ada fitur NARA yang diubah di sini — file ini hanya menata ulang
   tampilan berdasarkan config, dan tidak menyentuh logika halaman lain
   di script.js.
   ========================================================================= */
(function () {
  "use strict";

  // ---- Fallback default (dipakai kalau config.js belum sempat dimuat) ----
  var appearance = window.appAppearance || {
    homeBackground: {
      image: "",
      mobileImage: "",
      position: "center",
      size: "cover",
      repeat: "no-repeat",
      blur: 0,
      overlay: { enabled: false, value: "" },
      gradient: { enabled: false, value: "" },
      glow: { enabled: false, value: "" },
      fallbackGradient: "linear-gradient(180deg, #0d162d 0%, #132242 60%, var(--bg) 96%)",
    },
  };

  var branding = window.branding || {
    appName: "NARA",
    fullName: "Navigasi Aman Remaja",
    logo: {
      image: "",
      alt: "Logo NARA",
      size: 38,
      borderRadius: 12,
      sizeMobile: null,
      fallbackLetter: "N",
      fallbackBackground: "linear-gradient(135deg, #1A2A4A, #4A9FF5)",
    },
  };

  var MOBILE_QUERY = "(max-width: 768px)";

  function isMobile() {
    return window.matchMedia && window.matchMedia(MOBILE_QUERY).matches;
  }

  // Cek apakah sebuah gambar bisa dimuat sebelum dipakai sebagai background,
  // supaya halaman tidak pernah tampil rusak/blank kalau URL-nya mati.
  function preload(url) {
    return new Promise(function (resolve) {
      if (!url) {
        resolve(false);
        return;
      }
      var img = new Image();
      img.onload = function () {
        resolve(true);
      };
      img.onerror = function () {
        resolve(false);
      };
      img.src = url;
    });
  }

  // ---------------------------------------------------------------------
  // 1. BACKGROUND BERANDA
  // ---------------------------------------------------------------------
  function buildTintLayers(bg) {
    var layers = [];
    if (bg.glow && bg.glow.enabled && bg.glow.value) layers.push(bg.glow.value);
    if (bg.gradient && bg.gradient.enabled && bg.gradient.value) layers.push(bg.gradient.value);
    if (bg.overlay && bg.overlay.enabled && bg.overlay.value) layers.push(bg.overlay.value);
    return layers.join(", ");
  }

  function applyHeroBackground() {
    var hero = document.querySelector(".hero");
    if (!hero) return;

    var bg = appearance.homeBackground || {};
    hero.style.background = bg.fallbackGradient || "var(--bg)";

    // Lapisan tint (overlay + gradient + glow), tidak termasuk foto
    var tintLayer = document.createElement("div");
    tintLayer.className = "hero-overlay-layer";
    var tintCss = buildTintLayers(bg);
    if (tintCss) tintLayer.style.background = tintCss;

    // Lapisan foto (terpisah supaya blur tidak ikut mem-blur konten)
    var photoLayer = document.createElement("div");
    photoLayer.className = "hero-photo-layer";
    photoLayer.style.backgroundPosition = bg.position || "center";
    photoLayer.style.backgroundSize = bg.size || "cover";
    photoLayer.style.backgroundRepeat = bg.repeat || "no-repeat";

    function refreshPosition() {
      var useMobilePos = isMobile() && bg.mobilePosition;
      photoLayer.style.backgroundPosition = useMobilePos ? bg.mobilePosition : (bg.position || "center");
    }
    if (bg.blur && bg.blur > 0) {
      photoLayer.style.filter = "blur(" + bg.blur + "px)";
      photoLayer.style.transform = "scale(1.08)";
    }

    hero.insertBefore(tintLayer, hero.firstChild);
    hero.insertBefore(photoLayer, hero.firstChild);

    function setPhoto(url) {
      preload(url).then(function (ok) {
        photoLayer.style.backgroundImage = ok ? 'url("' + url + '")' : "none";
      });
    }

    function refreshImage() {
      var useMobile = isMobile() && bg.mobileImage;
      setPhoto(useMobile ? bg.mobileImage : bg.image);
    }

    function refreshAll() {
      refreshImage();
      refreshPosition();
    }

    refreshAll();
    if (window.matchMedia) {
      var mq = window.matchMedia(MOBILE_QUERY);
      if (mq.addEventListener) mq.addEventListener("change", refreshAll);
      else if (mq.addListener) mq.addListener(refreshAll); // Safari lama
    }
  }

  // ---------------------------------------------------------------------
  // 2. LOGO (header, footer, favicon, manifest)
  // ---------------------------------------------------------------------
  function applyLogoSizeVars() {
    var logo = branding.logo || {};
    var style = document.createElement("style");
    var css =
      ":root{" +
      "--logo-size:" + (logo.size || 38) + "px;" +
      "--logo-radius:" + (logo.borderRadius != null ? logo.borderRadius : 12) + "px;" +
      "}";
    if (logo.sizeMobile) {
      css +=
        "@media (max-width:768px){:root{--logo-size:" + logo.sizeMobile + "px;}}";
    }
    style.textContent = css;
    document.head.appendChild(style);
  }

  function buildFallbackLogoNode(logo) {
    var span = document.createElement("span");
    span.className = "logo-fallback";
    span.textContent = (logo.fallbackLetter || "N").slice(0, 1).toUpperCase();
    span.style.background = logo.fallbackBackground || "linear-gradient(135deg, #1A2A4A, #4A9FF5)";
    return span;
  }

  function applyLogoMarks() {
    var logo = branding.logo || {};
    var marks = document.querySelectorAll(".logo .mark");
    if (!marks.length) return;

    preload(logo.image).then(function (ok) {
      marks.forEach(function (mark) {
        mark.innerHTML = "";
        if (ok) {
          var img = document.createElement("img");
          img.src = logo.image;
          img.alt = logo.alt || branding.appName || "Logo";
          img.className = "logo-img";
          mark.appendChild(img);
        } else {
          mark.appendChild(buildFallbackLogoNode(logo));
        }
      });
    });
  }

  function applyFavicon() {
    var logo = branding.logo || {};
    if (!logo.image) return;
    // Favicon & ikon aplikasi kini file lokal di index.html / manifest.json (assets/images/).
    // Jangan ditimpa oleh logo header.
    var staticIcon = document.querySelector('link[rel="icon"][data-static="true"]');
    if (staticIcon) return;
    preload(logo.image).then(function (ok) {
      if (!ok) return;
      var link = document.querySelector('link[rel="icon"]') || document.createElement("link");
      link.rel = "icon";
      link.href = logo.image;
      if (!link.parentNode) document.head.appendChild(link);
    });
  }

  function applyManifest() {
    // manifest.json statis (ikon di assets/images/) dipakai apa adanya; tidak dibuat ulang dari logo header.
    if (document.querySelector('link[rel="manifest"]')) return;
    var logo = branding.logo || {};
    var manifest = {
      name: branding.fullName || branding.appName || "NARA",
      short_name: branding.appName || "NARA",
      start_url: ".",
      display: "standalone",
      background_color: "#F6F8FC",
      theme_color: "#132242",
      icons: logo.image
        ? [{ src: logo.image, sizes: "192x192 512x512", type: "image/jpeg" }]
        : [],
    };
    try {
      var blob = new Blob([JSON.stringify(manifest)], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var link = document.querySelector('link[rel="manifest"]');
      if (link) link.href = url;
    } catch (e) {
      // Kalau gagal (mis. browser lama), biarkan manifest.json statis yang dipakai.
    }
  }

  function applyBrandText() {
    var nameNodes = document.querySelectorAll("[data-brand-name]");
    var subNodes = document.querySelectorAll("[data-brand-sub]");
    var footerNameNodes = document.querySelectorAll("[data-brand-footer-name]");
    nameNodes.forEach(function (el) {
      if (branding.appName) el.firstChild && (el.firstChild.textContent = branding.appName);
    });
    subNodes.forEach(function (el) {
      if (branding.fullName) el.textContent = branding.fullName;
    });
    footerNameNodes.forEach(function (el) {
      if (branding.appName) el.textContent = branding.appName;
    });
    if (branding.fullName && branding.appName) {
      document.title = branding.appName + " — " + branding.fullName;
    }
  }

  function init() {
    applyHeroBackground();
    applyLogoSizeVars();
    applyLogoMarks();
    applyFavicon();
    applyManifest();
    applyBrandText();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
