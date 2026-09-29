/* =========================================================================
   NARA — Render Icon Card
   -------------------------------------------------------------------------
   Membaca `window.cardsContent` (config/cardsContent.js) dan menampilkannya
   ke dalam elemen `[data-icon-group]` di index.html.
   Tidak menyimpan teks apa pun di sini — semua teks ada di file config,
   file ini murni logika tampilan.

   Kalau sebuah key tidak ditemukan di cardsContent.js, elemen terkait
   dibiarkan apa adanya (markup statis di index.html dipakai sebagai
   fallback), supaya halaman tidak pernah tampil kosong / rusak.
   ========================================================================= */
(function () {
    "use strict";

    function cfg() {
        return window.cardsContent || { iconCards: {} };
    }

    function esc(str) {
        var d = document.createElement("div");
        d.textContent = str == null ? "" : String(str);
        return d.innerHTML;
    }

    // ---------------------------------------------------------------
    // ICON CARDS
    // ---------------------------------------------------------------
    function renderIconGroups() {
        var groups = document.querySelectorAll("[data-icon-group]");
        var data = cfg().iconCards || {};

        groups.forEach(function (group) {
            var key = group.getAttribute("data-icon-group");
            var items = data[key];
            if (!items || !items.length) return; // fallback: biarkan markup statis

            var html = "";
            items.forEach(function (item) {
                var hasPage = !!item.page;
                var hasExpand = !hasPage && !!item.expand;
                var attrs = "";
                var extraClass = "";
                if (hasPage) {
                    attrs = ' style="cursor:pointer;" onclick="goTo(\'' + esc(item.page) + '\')"';
                } else if (hasExpand) {
                    extraClass = " has-expand";
                    attrs = ' style="cursor:pointer;" tabindex="0" role="button" aria-expanded="false"' +
                        ' onclick="toggleIconCardExpand(this)"' +
                        ' onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();toggleIconCardExpand(this);}"';
                }
                html += '<div class="card icon-card' + extraClass + '"' + attrs + '>';
                html += '<div class="ic">' + (item.icon || '') + '</div>';
                html += '<h4>' + esc(item.title) + '</h4>';
                html += '<p>' + esc(item.desc) + '</p>';
                if (hasExpand) {
                    html += '<div class="icon-card-expand"><div class="icon-card-expand-inner"><p>' + esc(item.expand) + '</p></div></div>';
                }
                html += '</div>';
            });
            group.innerHTML = html;
        });
    }

    // ---------------------------------------------------------------
    // ICON CARD — buka/tutup penjelasan (expand/collapse)
    // ---------------------------------------------------------------
    window.toggleIconCardExpand = function (cardEl) {
        if (!cardEl) return;
        var panel = cardEl.querySelector(".icon-card-expand");
        if (!panel) return;
        var isOpen = panel.classList.contains("open");

        if (isOpen) {
            panel.style.maxHeight = panel.scrollHeight + "px"; // titik awal transisi
            requestAnimationFrame(function () {
                panel.style.maxHeight = "0px";
            });
            panel.classList.remove("open");
            cardEl.setAttribute("aria-expanded", "false");
        } else {
            panel.classList.add("open");
            panel.style.maxHeight = panel.scrollHeight + "px";
            cardEl.setAttribute("aria-expanded", "true");
        }
    };

    function init() {
        renderIconGroups();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
