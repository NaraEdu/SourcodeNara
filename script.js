        // =====================================================================
        // HAK CIPTA NARA — JANGAN DIUBAH / DIHAPUS
        // =====================================================================
        const NARA_COPYRIGHT_OWNER = 'SMKN 2 Magetan';
        const NARA_COPYRIGHT_FOOTER = '© 2026 NARA — Navigasi Aman Remaja · Hak Cipta ' + NARA_COPYRIGHT_OWNER +
            '. Seluruh hak dilindungi.';
        const NARA_COPYRIGHT_ABOUT = '© 2026 NARA — Navigasi Aman Remaja\n' + NARA_COPYRIGHT_OWNER + '. Seluruh hak cipta dilindungi.';

        function enforceNaraCopyright() {
            const footerEl = document.getElementById('footerCopyright');
            if (footerEl && footerEl.textContent !== NARA_COPYRIGHT_FOOTER) {
                footerEl.textContent = NARA_COPYRIGHT_FOOTER;
            }
            const aboutEl = document.getElementById('hakCiptaText');
            if (aboutEl && aboutEl.textContent !== NARA_COPYRIGHT_ABOUT) {
                aboutEl.textContent = NARA_COPYRIGHT_ABOUT;
            }
        }
        document.addEventListener('DOMContentLoaded', enforceNaraCopyright);
        setInterval(enforceNaraCopyright, 1500);

        // =====================================================================
        // DETEKSI ANDROID
        // =====================================================================
        (function detectAndroidAppMode() {
            if (/Android/i.test(navigator.userAgent)) {
                document.documentElement.classList.add('is-android-app');
            }
        })();

        // =====================================================================
        // NAVIGASI
        // =====================================================================
        const navGroups = {
            beranda: 'beranda',
            dashboard: 'beranda',
            edukasi: 'edukasi',
            pergaulansehat: 'edukasi',
            pergaulanuji: 'edukasi',
            pergaulanbebas: 'edukasi',
            freesex: 'edukasi',
            revenge: 'edukasi',
            cek: 'edukasi',
            pertemanan: 'edukasi',
            digital: 'edukasi',
            digitaluji: 'edukasi',
            mental: 'edukasi',
            moodquest: 'edukasi',
            ortu: 'edukasi',
            ortukomunikasi: 'edukasi',
            ortupengawasan: 'edukasi',
            konsultasi: 'bantuan',
            rana: 'bantuan',
            data: 'data',
            tim: 'about',
            ai: 'edukasi',
            aiuji: 'edukasi',
            pergaulanbebasuji: 'edukasi',
            lapor: 'bantuan'
        };

        // Halaman disclaimer/footer global disembunyikan khusus pada menu
        // Edukasi, Bantuan, dan Data (sesuai permintaan). Tombol SOS dulu
        // ikut diatur di sini juga, tapi fiturnya sudah dihapus total dari
        // project (HTML & CSS-nya tidak ada lagi), jadi tidak relevan lagi.
        const CHROME_HIDDEN_GROUPS = ['edukasi', 'bantuan', 'data'];

        function updatePageChrome(group) {
            document.body.classList.toggle('hide-chrome', CHROME_HIDDEN_GROUPS.includes(group));
            // Footer (logo NARA, tagline, disclaimer, copyright) dihilangkan dari
            // halaman About sesuai permintaan -- selalu false di semua halaman,
            // termasuk About, sehingga tidak pernah muncul lagi.
            document.body.classList.toggle('show-footer', false);
        }

        function goTo(page, fromHistory) {
            // v20260913fix2: situs ini sekarang memakai scroll dokumen penuh
            // (bukan lagi tiap .page = kotak scroll sendiri), jadi posisi
            // scroll tiap halaman disimpan & dipulihkan manual di sini agar
            // Beranda dan Edukasi (dst.) tetap terasa independen seperti
            // sebelumnya — bukan tiba-tiba nyangkut di tengah halaman baru.
            const __prevPage = document.querySelector('.page.active');
            if (__prevPage) {
                window.__naraScrollPos = window.__naraScrollPos || {};
                window.__naraScrollPos[__prevPage.id] = window.scrollY || document.documentElement.scrollTop || 0;
            }
            document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
            const target = document.getElementById('page-' + page);
            if (target) target.classList.add('active');
            document.querySelectorAll('.nav-sheet button').forEach(b => {
                b.classList.toggle('active', b.dataset.page === page);
            });
            const group = navGroups[page] || 'beranda';
            document.querySelectorAll('.bottom-nav-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.group === group);
                if (b.dataset.group === group) b.setAttribute('aria-current', 'page');
                else b.removeAttribute('aria-current');
            });
            updatePageChrome(group);
            closeSheets();
            // Riwayat navigasi: tombol Back Android/browser kembali ke halaman
            // sebelumnya di dalam NARA, bukan langsung keluar aplikasi.
            if (target && !fromHistory) {
                const cur = history.state && history.state.page;
                if (cur !== page) {
                    try { history.pushState({ page: page }, '', '#' + page); } catch (e) {}
                }
            }
            if (target) {
                const __restoreY = (window.__naraScrollPos && window.__naraScrollPos[target.id]) || 0;
                window.scrollTo(0, __restoreY);
            }
            // Re-render quiz if on quiz page
            if (page === 'cek') initHubungankuQuiz();
            if (page === 'pertemanan') initPertemananQuiz();
            if (page === 'moodquest') checkMoodQuestToday();
            if (page === 'pergaulanuji') initScenarioGame();
            if (page === 'pergaulanbebasuji') checkPergaulanBebasToday();
            if (page === 'digitaluji') checkDigitalToday();
            if (page === 'aiuji') checkAiToday();
            if (page === 'data' && typeof initDataDK === 'function') initDataDK();
            if (page === 'lapor') initLaporPage();
            if (page === 'beranda' && typeof renderBerandaHub === 'function') renderBerandaHub();
            if (page === 'edukasi' && typeof renderEduEnhancements === 'function') renderEduEnhancements();
            updateUjiCards();
            updateStreak();
        }

        // Navigasi dari kartu "Kerjakan Kuis" (Aktivitas Hari Ini) langsung
        // menuju blok Uji Pemahamanmu di halaman Edukasi (bukan cuma ke atas halaman).
        function goToUjiPemahaman() {
            goTo('edukasi');
            setTimeout(() => {
                const section = document.getElementById('ujiSectionBlock');
                if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 50);
        }

        function toggleSheet(group) {
            const sheet = document.getElementById('sheet-' + group);
            if (!sheet) return;
            const wasOpen = sheet.classList.contains('open');
            closeSheets();
            if (!wasOpen) {
                sheet.classList.add('open');
                document.getElementById('sheetOverlay').classList.add('open');
            }
        }

        function closeSheets() {
            document.querySelectorAll('.nav-sheet').forEach(s => s.classList.remove('open'));
            document.getElementById('sheetOverlay').classList.remove('open');
        }

        // =====================================================================
        // TOAST
        // =====================================================================
        function showToast(msg, icon) {
            const t = document.getElementById('toast');
            t.innerHTML = (icon || '<span class="material-symbols-rounded" translate="no" aria-hidden="true">auto_awesome</span>') + ' ' + msg;
            t.classList.add('show');
            clearTimeout(t._timer);
            t._timer = setTimeout(() => t.classList.remove('show'), 2800);
        }

        // =====================================================================
        // LOCALSTORAGE HELPERS (DAILY RESET)
        // =====================================================================
        function getToday() {
            // tanggal LOKAL perangkat (bukan UTC) supaya reset harian tepat tengah malam
            const d = new Date();
            return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        }

        function getQuizState(key) {
            try {
                const data = localStorage.getItem('nara_' + key);
                return data ? JSON.parse(data) : null;
            } catch { return null; }
        }

        function saveQuizState(key, state) {
            localStorage.setItem('nara_' + key, JSON.stringify(state));
        }

        function isQuizDoneToday(key) {
            const state = getQuizState(key);
            if (!state) return false;
            return state.date === getToday() && state.completed === true;
        }

        function markQuizDone(key, score, extra) {
            const alreadyDoneToday = isQuizDoneToday(key);
            saveQuizState(key, {
                completed: true,
                date: getToday(),
                score: score || 0,
                ...(extra || {})
            });
            updateStreak();
            if (!alreadyDoneToday && window.NaraState) {
                NaraState.recordQuiz(key, score || 0, (extra && extra.total) || null);
                NaraState.addXP((extra && extra.xp) || 50);
            }
            const names = {
                hubunganku: 'Cek Hubunganku',
                pertemanan: 'Cek Pertemanan Ku',
                moodquest: 'Mood Quest',
                pergaulansehat: 'Latihan Pergaulan Sehat',
                pergaulanbebas: 'Pemahaman Pergaulan Bebas',
                digitalgame: 'Digital Defender Challenge',
                aigame: 'Asli atau Deepfake?'
            };
            showToast('<span class="material-symbols-rounded" translate="no" aria-hidden="true">celebration</span> ' + (names[key] || 'Tantangan') + ' selesai! +' + ((extra && extra.xp) || '50') + ' XP', '<span class="material-symbols-rounded" translate="no" aria-hidden="true">emoji_events</span>');
        }

        function getQuizScore(key) {
            const state = getQuizState(key);
            return state ? state.score : 0;
        }

        // =====================================================================
        // STREAK
        // =====================================================================
        function getStreak() {
            try {
                const data = localStorage.getItem('nara_streak');
                if (!data) return { count: 0, last: null };
                const parsed = JSON.parse(data);
                return parsed;
            } catch { return { count: 0, last: null }; }
        }

        function updateStreak() {
            const today = getToday();
            let streak = getStreak();
            const doneToday = isQuizDoneToday('hubunganku') || isQuizDoneToday('pertemanan') || isQuizDoneToday(
            'moodquest') || isQuizDoneToday('pergaulansehat') || isQuizDoneToday('pergaulanbebas') ||
            isQuizDoneToday('digitalgame') || isQuizDoneToday('aigame');
            if (doneToday) {
                if (streak.last === today) {
                    // already counted
                } else if (streak.last === getYesterday()) {
                    streak.count += 1;
                    streak.last = today;
                } else {
                    streak.count = 1;
                    streak.last = today;
                }
                localStorage.setItem('nara_streak', JSON.stringify(streak));
            } else {
                if (streak.last && streak.last !== today && streak.last !== getYesterday()) {
                    streak.count = 0;
                    localStorage.setItem('nara_streak', JSON.stringify(streak));
                }
            }
            const el = document.getElementById('streakCount');
            if (el) el.innerHTML = streak.count + ' <small>hari</small>';
            return streak;
        }

        function getYesterday() {
            const d = new Date();
            d.setDate(d.getDate() - 1);
            return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        }

        // =====================================================================
        // UPDATE UJI PEMAHAMAN CARDS
        // =====================================================================
        function updateUjiCards() {
            const hDone = isQuizDoneToday('hubunganku');
            const hScore = getQuizScore('hubunganku');
            const hCard = document.getElementById('ujiHubunganku');
            const hStatus = document.getElementById('hubungkuStatus');
            const hLink = document.getElementById('hubungkuLink');
            const hReset = document.getElementById('hubungkuReset');
            const hProg = document.getElementById('hubungkuProgress');
            const hBadge = document.getElementById('hubungkuBadge');
            if (hDone) {
                hStatus.innerHTML = '<span class="status-dot done"></span><span class="material-symbols-rounded" translate="no" aria-hidden="true">check_circle</span> Selesai (skor ' + hScore + '/7)';
                hLink.innerHTML = 'Lihat hasil → <span class="arrow">→</span>';
                hCard.classList.add('completed');
                hProg.style.width = '100%';
                hReset.innerHTML = '<span class="material-symbols-rounded" translate="no" aria-hidden="true">hourglass_top</span> Reset otomatis besok';
                hBadge.style.display = 'inline-flex';
            } else {
                hStatus.innerHTML = '<span class="status-dot pending"></span>Belum dikerjakan';
                hLink.innerHTML = 'Mulai → <span class="arrow">→</span>';
                hCard.classList.remove('completed');
                hProg.style.width = '0%';
                hReset.textContent = '';
                hBadge.style.display = 'none';
            }

            const pDone = isQuizDoneToday('pertemanan');
            const pScore = getQuizScore('pertemanan');
            const pCard = document.getElementById('ujiPertemanan');
            const pStatus = document.getElementById('pertemananStatus');
            const pLink = document.getElementById('pertemananLink');
            const pReset = document.getElementById('pertemananReset');
            const pProg = document.getElementById('pertemananProgress');
            const pBadge = document.getElementById('pertemananBadge');
            if (pDone) {
                pStatus.innerHTML = '<span class="status-dot done"></span><span class="material-symbols-rounded" translate="no" aria-hidden="true">check_circle</span> Selesai (skor ' + pScore + '/7)';
                pLink.innerHTML = 'Lihat hasil → <span class="arrow">→</span>';
                pCard.classList.add('completed');
                pProg.style.width = '100%';
                pReset.innerHTML = '<span class="material-symbols-rounded" translate="no" aria-hidden="true">hourglass_top</span> Reset otomatis besok';
                pBadge.style.display = 'inline-flex';
            } else {
                pStatus.innerHTML = '<span class="status-dot pending"></span>Belum dikerjakan';
                pLink.innerHTML = 'Mulai → <span class="arrow">→</span>';
                pCard.classList.remove('completed');
                pProg.style.width = '0%';
                pReset.textContent = '';
                pBadge.style.display = 'none';
            }

            const mDone = isQuizDoneToday('moodquest');
            const mScore = getQuizScore('moodquest');
            const mCard = document.getElementById('ujiMental');
            const mStatus = document.getElementById('mentalStatus');
            const mLink = document.getElementById('mentalLink');
            const mReset = document.getElementById('mentalReset');
            const mProg = document.getElementById('mentalProgress');
            const mBadge = document.getElementById('mentalBadge');
            if (mDone) {
                mStatus.innerHTML = '<span class="status-dot done"></span><span class="material-symbols-rounded" translate="no" aria-hidden="true">check_circle</span> Selesai (skor ' + mScore + '/4)';
                mLink.innerHTML = 'Lihat hasil → <span class="arrow">→</span>';
                mCard.classList.add('completed');
                mProg.style.width = '100%';
                mReset.innerHTML = '<span class="material-symbols-rounded" translate="no" aria-hidden="true">hourglass_top</span> Reset otomatis besok';
                mBadge.style.display = 'inline-flex';
            } else {
                mStatus.innerHTML = '<span class="status-dot pending"></span>Belum dikerjakan';
                mLink.innerHTML = 'Mulai → <span class="arrow">→</span>';
                mCard.classList.remove('completed');
                mProg.style.width = '0%';
                mReset.textContent = '';
                mBadge.style.display = 'none';
            }

            const psDone = isQuizDoneToday('pergaulansehat');
            const psScore = getQuizScore('pergaulansehat');
            const psCard = document.getElementById('ujiPergaulan');
            const psStatus = document.getElementById('pergaulanSehatStatus');
            const psLink = document.getElementById('pergaulanSehatLink');
            const psReset = document.getElementById('pergaulanSehatReset');
            const psProg = document.getElementById('pergaulanSehatProgress');
            const psBadge = document.getElementById('pergaulanSehatBadge');
            if (psCard && psStatus) {
                if (psDone) {
                    psStatus.innerHTML = '<span class="status-dot done"></span><span class="material-symbols-rounded" translate="no" aria-hidden="true">check_circle</span> Selesai (skor ' + psScore + '/4)';
                    psLink.innerHTML = 'Lihat hasil → <span class="arrow">→</span>';
                    psCard.classList.add('completed');
                    psProg.style.width = '100%';
                    psReset.innerHTML = '<span class="material-symbols-rounded" translate="no" aria-hidden="true">hourglass_top</span> Reset otomatis besok';
                    psBadge.style.display = 'inline-flex';
                } else {
                    psStatus.innerHTML = '<span class="status-dot pending"></span>Belum dikerjakan';
                    psLink.innerHTML = 'Mulai → <span class="arrow">→</span>';
                    psCard.classList.remove('completed');
                    psProg.style.width = '0%';
                    psReset.textContent = '';
                    psBadge.style.display = 'none';
                }
            }

            const pbDone = isQuizDoneToday('pergaulanbebas');
            const pbScore = getQuizScore('pergaulanbebas');
            const pbCard = document.getElementById('ujiPergaulanBebas');
            const pbStatus = document.getElementById('pergaulanBebasStatus');
            const pbLink = document.getElementById('pergaulanBebasLink');
            const pbReset = document.getElementById('pergaulanBebasReset');
            const pbProg = document.getElementById('pergaulanBebasProgress');
            const pbBadge = document.getElementById('pergaulanBebasBadge');
            if (pbCard) {
                if (pbDone) {
                    pbStatus.innerHTML = '<span class="status-dot done"></span><span class="material-symbols-rounded" translate="no" aria-hidden="true">check_circle</span> Selesai (skor ' + pbScore + '/' + pergaulanBebasScenarios.length + ')';
                    pbLink.innerHTML = 'Lihat hasil → <span class="arrow">→</span>';
                    pbCard.classList.add('completed');
                    pbProg.style.width = '100%';
                    pbReset.innerHTML = '<span class="material-symbols-rounded" translate="no" aria-hidden="true">hourglass_top</span> Reset otomatis besok';
                    pbBadge.style.display = 'inline-flex';
                } else {
                    pbStatus.innerHTML = '<span class="status-dot pending"></span>Belum dikerjakan';
                    pbLink.innerHTML = 'Mulai → <span class="arrow">→</span>';
                    pbCard.classList.remove('completed');
                    pbProg.style.width = '0%';
                    pbReset.textContent = '';
                    pbBadge.style.display = 'none';
                }
            }

            const dgDone = isQuizDoneToday('digitalgame');
            const dgScore = getQuizScore('digitalgame');
            const dgCard = document.getElementById('ujiDigital');
            const dgStatus = document.getElementById('digitalUjiStatus');
            const dgLink = document.getElementById('digitalUjiLink');
            const dgReset = document.getElementById('digitalUjiReset');
            const dgProg = document.getElementById('digitalUjiProgress');
            const dgBadge = document.getElementById('digitalUjiBadge');
            if (dgCard) {
                if (dgDone) {
                    dgStatus.innerHTML = '<span class="status-dot done"></span><span class="material-symbols-rounded" translate="no" aria-hidden="true">check_circle</span> Selesai (skor ' + dgScore + '/' + digitalScenarios.length + ')';
                    dgLink.innerHTML = 'Lihat hasil → <span class="arrow">→</span>';
                    dgCard.classList.add('completed');
                    dgProg.style.width = '100%';
                    dgReset.innerHTML = '<span class="material-symbols-rounded" translate="no" aria-hidden="true">hourglass_top</span> Reset otomatis besok';
                    dgBadge.style.display = 'inline-flex';
                } else {
                    dgStatus.innerHTML = '<span class="status-dot pending"></span>Belum dikerjakan';
                    dgLink.innerHTML = 'Mulai → <span class="arrow">→</span>';
                    dgCard.classList.remove('completed');
                    dgProg.style.width = '0%';
                    dgReset.textContent = '';
                    dgBadge.style.display = 'none';
                }
            }

            const aiDone = isQuizDoneToday('aigame');
            const aiUjiScore = getQuizScore('aigame');
            const aiCard = document.getElementById('ujiAI');
            const aiStatus = document.getElementById('aiUjiStatus');
            const aiLink = document.getElementById('aiUjiLink');
            const aiReset = document.getElementById('aiUjiReset');
            const aiProg = document.getElementById('aiUjiProgress');
            const aiBadge = document.getElementById('aiUjiBadge');
            if (aiCard) {
                if (aiDone) {
                    aiStatus.innerHTML = '<span class="status-dot done"></span><span class="material-symbols-rounded" translate="no" aria-hidden="true">check_circle</span> Selesai (skor ' + aiUjiScore + '/' + aiScenarios.length + ')';
                    aiLink.innerHTML = 'Lihat hasil → <span class="arrow">→</span>';
                    aiCard.classList.add('completed');
                    aiProg.style.width = '100%';
                    aiReset.innerHTML = '<span class="material-symbols-rounded" translate="no" aria-hidden="true">hourglass_top</span> Reset otomatis besok';
                    aiBadge.style.display = 'inline-flex';
                } else {
                    aiStatus.innerHTML = '<span class="status-dot pending"></span>Belum dikerjakan';
                    aiLink.innerHTML = 'Mulai → <span class="arrow">→</span>';
                    aiCard.classList.remove('completed');
                    aiProg.style.width = '0%';
                    aiReset.textContent = '';
                    aiBadge.style.display = 'none';
                }
            }
            updateStreak();
        }

        // =====================================================================
        // CEK HUBUNGANKU QUIZ
        // =====================================================================
        const hubungkuQuestions = [
            "Apakah pasangan menghargai batasanmu?",
            "Apakah kamu bebas mengatakan tidak?",
            "Apakah pasangan memaksa meminta foto pribadi?",
            "Apakah pasangan mengancam akan menyebarkan sesuatu?",
            "Apakah kamu merasa takut mengatakan pendapat?",
            "Apakah pasangan mengontrol akun media sosialmu?",
            "Apakah pasangan menghargai privasimu?"
        ];
        const hubungkuDangerIfYes = [false, false, true, true, true, true, false];
        let hubungkuIndex = 0,
            hubungkuScore = 0;

        function initHubungankuQuiz() {
            const card = document.getElementById('quizCardHubunganku');
            if (!card) return;
            if (isQuizDoneToday('hubunganku')) {
                const score = getQuizScore('hubunganku');
                showHubungkuResult(card, score, true);
                return;
            }
            hubungkuIndex = 0;
            hubungkuScore = 0;
            renderHubungkuQuestion(card);
        }

        function renderHubungkuQuestion(card) {
            if (hubungkuIndex >= hubungkuQuestions.length) {
                markQuizDone('hubunganku', hubungkuScore, { xp: 50 });
                showHubungkuResult(card, hubungkuScore, false);
                updateUjiCards();
                return;
            }
            const pct = (hubungkuIndex / hubungkuQuestions.length) * 100;
            card.innerHTML = `
                <div class="game-header">
                    <span class="game-icon"><span class="material-symbols-rounded" translate="no" aria-hidden="true">favorite</span></span>
                    <div class="game-stats">
                        <span><span class="material-symbols-rounded" translate="no" aria-hidden="true">star</span> Skor: ${hubungkuScore}</span>
                        <span><span class="material-symbols-rounded" translate="no" aria-hidden="true">push_pin</span> ${hubungkuIndex+1}/${hubungkuQuestions.length}</span>
                    </div>
                </div>
                <div class="quiz-progress">Pertanyaan ${hubungkuIndex+1}</div>
                <div class="quiz-progress-bar"><div style="width:${pct}%;"></div></div>
                <div class="quiz-q quiz-enter">
                    <span class="q-num">Soal ${hubungkuIndex+1}</span>
                    <br>${hubungkuQuestions[hubungkuIndex]}
                </div>
                <div class="quiz-opts">
                    <button onclick="answerHubungku(true, this)"><span class="material-symbols-rounded" translate="no" aria-hidden="true">thumb_up</span> Ya</button>
                    <button onclick="answerHubungku(false, this)"><span class="material-symbols-rounded" translate="no" aria-hidden="true">thumb_down</span> Tidak</button>
                </div>
            `;
        }

        function answerHubungku(isYes, btn) {
            if (btn) btn.blur();
            // Catatan: ini kuesioner refleksi diri tentang hubunganmu sendiri,
            // BUKAN kuis dengan jawaban benar/salah. Jadi jawaban tidak pernah
            // dilabeli "Benar"/"Salah" — itu hanya akan membingungkan (jawaban
            // yang sehat bisa terlihat seperti dianggap "salah"). Yang ditandai
            // hanyalah pilihan yang kamu pilih, lalu jawabanmu dihitung untuk
            // menyusun hasil akhir (aman / perlu diperhatikan / tanda bahaya).
            const isDangerSign = isYes === hubungkuDangerIfYes[hubungkuIndex];
            if (isDangerSign) hubungkuScore++;
            const btns = document.querySelectorAll('#quizCardHubunganku .quiz-opts button');
            btns.forEach(b => b.disabled = true);
            btn.classList.add('selected');
            showToast('<span class="material-symbols-rounded" translate="no" aria-hidden="true">check</span> Jawaban tersimpan', '<span class="material-symbols-rounded" translate="no" aria-hidden="true">favorite</span>');
            hubungkuIndex++;
            const card = document.getElementById('quizCardHubunganku');
            setTimeout(() => renderHubungkuQuestion(card), 700);
        }

        function showHubungkuResult(card, score, fromStorage) {
            let badgeClass, title, desc, emoji;
            if (score === 0) {
                badgeClass = 'safe';
                title = 'Hubungan relatif sehat';
                desc = 'Dari jawabanmu, hubunganmu menunjukkan tanda-tanda saling menghargai. Tetap jaga komunikasi terbuka dengan pasanganmu.';
                emoji = '<span class="material-symbols-rounded" translate="no" aria-hidden="true">favorite</span>';
            } else if (score <= 2) {
                badgeClass = 'watch';
                title = 'Ada hal yang perlu diperhatikan';
                desc = 'Ada beberapa pola yang sebaiknya kamu perhatikan bersama. Tidak apa-apa untuk membicarakannya, atau bercerita ke orang yang kamu percaya.';
                emoji = '<span class="material-symbols-rounded" translate="no" aria-hidden="true">favorite</span>';
            } else {
                badgeClass = 'danger';
                title = 'Ada tanda bahaya';
                desc = 'Jawabanmu menunjukkan beberapa tanda bahaya dalam hubungan ini. Kamu tidak sendirian — bicara dengan orang dewasa terpercaya atau psikolog bisa membantu.';
                emoji = '<span class="material-symbols-rounded" translate="no" aria-hidden="true">heart_broken</span>';
            }
            const ringClass = badgeClass + '-ring';
            const xpText = fromStorage ? ' (sudah dikerjakan hari ini)' : ' +50 XP <span class="material-symbols-rounded" translate="no" aria-hidden="true">auto_awesome</span>';
            card.innerHTML = `
                <div class="quiz-result">
                    <div class="result-score-ring ${ringClass}">
                        ${score}/7
                        <span class="ring-label">Skor</span>
                    </div>
                    <div class="result-badge ${badgeClass}">
                        <span class="badge-icon-big">${emoji}</span>
                        ${title}
                    </div>
                    <p style="color:var(--text-muted);margin:12px 0 18px;">${desc}</p>
                    <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:18px;"><span class="material-symbols-rounded" translate="no" aria-hidden="true">check_circle</span> Selesai hari ini${xpText}</p>
                    ${!fromStorage ? `<div class="reward-card" style="text-align:left;margin:0 0 18px;">
                        <div class="ic"><span class="material-symbols-rounded" translate="no" aria-hidden="true">military_tech</span></div>
                        <div><h5>Badge Heart Guardian</h5><p>+50 XP · Kamu hebat!</p></div>
                    </div>` : ''}
                    <button class="btn btn-primary" onclick="goTo('konsultasi')"><span class="material-symbols-rounded" translate="no" aria-hidden="true">chat_bubble</span> Saya ingin berkonsultasi</button>
                    <div style="margin-top:14px;">
                        <button class="btn btn-outline" onclick="resetHubungkuQuiz()"><span class="material-symbols-rounded" translate="no" aria-hidden="true">sync</span> Kerjakan Ulang Hari Ini</button>
                        <button class="btn btn-outline" style="margin-left:8px;" onclick="goTo('edukasi')"><span class="material-symbols-rounded" translate="no" aria-hidden="true">menu_book</span> Kembali ke Edukasi</button>
                    </div>
                </div>
            `;
            if (!fromStorage) createConfetti(card);
            updateUjiCards();
        }

        function resetHubungkuQuiz() {
            localStorage.removeItem('nara_hubunganku');
            initHubungankuQuiz();
            updateUjiCards();
            showToast('<span class="material-symbols-rounded" translate="no" aria-hidden="true">sync</span> Reset berhasil, kerjakan lagi!', '<span class="material-symbols-rounded" translate="no" aria-hidden="true">sync</span>');
        }

        // =====================================================================
        // CEK PERTEMANAN KU QUIZ
        // =====================================================================
        const pertemananQuestions = [
            "Apakah teman-temanmu menghargai perasaanmu?",
            "Apakah kamu bisa menjadi dirimu sendiri saat bersama mereka?",
            "Apakah teman-temanmu mendukungmu saat kamu sedang sulit?",
            "Apakah teman-temanmu pernah menyebarkan rahasiamu?",
            "Apakah kamu merasa aman dan nyaman saat bersama teman-temanmu?",
            "Apakah teman-temanmu pernah memaksamu melakukan hal yang tidak kamu inginkan?",
            "Apakah kalian bisa menyelesaikan konflik dengan baik?"
        ];
        const pertemananDangerIfYes = [false, false, false, true, false, true, false];
        let pertemananIndex = 0,
            pertemananScore = 0;

        function initPertemananQuiz() {
            const card = document.getElementById('quizCardPertemanan');
            if (!card) return;
            if (isQuizDoneToday('pertemanan')) {
                const score = getQuizScore('pertemanan');
                showPertemananResult(card, score, true);
                return;
            }
            pertemananIndex = 0;
            pertemananScore = 0;
            renderPertemananQuestion(card);
        }

        function renderPertemananQuestion(card) {
            if (pertemananIndex >= pertemananQuestions.length) {
                markQuizDone('pertemanan', pertemananScore, { xp: 50 });
                showPertemananResult(card, pertemananScore, false);
                updateUjiCards();
                return;
            }
            const pct = (pertemananIndex / pertemananQuestions.length) * 100;
            card.innerHTML = `
                <div class="game-header">
                    <span class="game-icon"><span class="material-symbols-rounded" translate="no" aria-hidden="true">handshake</span></span>
                    <div class="game-stats">
                        <span><span class="material-symbols-rounded" translate="no" aria-hidden="true">star</span> Skor: ${pertemananScore}</span>
                        <span><span class="material-symbols-rounded" translate="no" aria-hidden="true">push_pin</span> ${pertemananIndex+1}/${pertemananQuestions.length}</span>
                    </div>
                </div>
                <div class="quiz-progress">Pertanyaan ${pertemananIndex+1}</div>
                <div class="quiz-progress-bar"><div style="width:${pct}%;"></div></div>
                <div class="quiz-q quiz-enter">
                    <span class="q-num">Soal ${pertemananIndex+1}</span>
                    <br>${pertemananQuestions[pertemananIndex]}
                </div>
                <div class="quiz-opts">
                    <button onclick="answerPertemanan(true, this)"><span class="material-symbols-rounded" translate="no" aria-hidden="true">thumb_up</span> Ya</button>
                    <button onclick="answerPertemanan(false, this)"><span class="material-symbols-rounded" translate="no" aria-hidden="true">thumb_down</span> Tidak</button>
                </div>
            `;
        }

        function answerPertemanan(isYes, btn) {
            if (btn) btn.blur();
            // Sama seperti Cek Hubunganku: ini refleksi diri tentang pertemananmu
            // sendiri, bukan kuis benar/salah — jadi tidak dilabeli "Benar"/"Salah".
            const isDangerSign = isYes === pertemananDangerIfYes[pertemananIndex];
            if (isDangerSign) pertemananScore++;
            const btns = document.querySelectorAll('#quizCardPertemanan .quiz-opts button');
            btns.forEach(b => b.disabled = true);
            btn.classList.add('selected');
            showToast('<span class="material-symbols-rounded" translate="no" aria-hidden="true">check</span> Jawaban tersimpan', '<span class="material-symbols-rounded" translate="no" aria-hidden="true">favorite</span>');
            pertemananIndex++;
            const card = document.getElementById('quizCardPertemanan');
            setTimeout(() => renderPertemananQuestion(card), 700);
        }

        function showPertemananResult(card, score, fromStorage) {
            let badgeClass, title, desc, emoji;
            if (score === 0) {
                badgeClass = 'safe';
                title = 'Pertemanan sehat';
                desc = 'Dari jawabanmu, pertemananmu terlihat saling mendukung dan menghargai. Terus jaga komunikasi dan kepercayaan satu sama lain.';
                emoji = '<span class="material-symbols-rounded" translate="no" aria-hidden="true">favorite</span>';
            } else if (score <= 2) {
                badgeClass = 'watch';
                title = 'Ada hal yang perlu diperhatikan';
                desc = 'Ada beberapa pola dalam pertemananmu yang perlu diperhatikan. Coba bicarakan dengan temanmu atau cari dukungan dari orang dewasa terpercaya.';
                emoji = '<span class="material-symbols-rounded" translate="no" aria-hidden="true">favorite</span>';
            } else {
                badgeClass = 'danger';
                title = 'Ada tanda bahaya dalam pertemanan';
                desc = 'Jawabanmu menunjukkan beberapa tanda bahaya dalam pertemanan ini. Kamu berhak mendapatkan teman yang menghargaimu. Bicara dengan guru BK atau psikolog bisa membantu.';
                emoji = '<span class="material-symbols-rounded" translate="no" aria-hidden="true">heart_broken</span>';
            }
            const ringClass = badgeClass + '-ring';
            const xpText = fromStorage ? ' (sudah dikerjakan hari ini)' : ' +50 XP <span class="material-symbols-rounded" translate="no" aria-hidden="true">auto_awesome</span>';
            card.innerHTML = `
                <div class="quiz-result">
                    <div class="result-score-ring ${ringClass}">
                        ${score}/7
                        <span class="ring-label">Skor</span>
                    </div>
                    <div class="result-badge ${badgeClass}">
                        <span class="badge-icon-big">${emoji}</span>
                        ${title}
                    </div>
                    <p style="color:var(--text-muted);margin:12px 0 18px;">${desc}</p>
                    <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:18px;"><span class="material-symbols-rounded" translate="no" aria-hidden="true">check_circle</span> Selesai hari ini${xpText}</p>
                    ${!fromStorage ? `<div class="reward-card" style="text-align:left;margin:0 0 18px;">
                        <div class="ic"><span class="material-symbols-rounded" translate="no" aria-hidden="true">military_tech</span></div>
                        <div><h5>Badge Friendship Guardian</h5><p>+50 XP · Kamu hebat!</p></div>
                    </div>` : ''}
                    <button class="btn btn-primary" onclick="goTo('konsultasi')"><span class="material-symbols-rounded" translate="no" aria-hidden="true">chat_bubble</span> Saya ingin berkonsultasi</button>
                    <div style="margin-top:14px;">
                        <button class="btn btn-outline" onclick="resetPertemananQuiz()"><span class="material-symbols-rounded" translate="no" aria-hidden="true">sync</span> Kerjakan Ulang Hari Ini</button>
                        <button class="btn btn-outline" style="margin-left:8px;" onclick="goTo('edukasi')"><span class="material-symbols-rounded" translate="no" aria-hidden="true">menu_book</span> Kembali ke Edukasi</button>
                    </div>
                </div>
            `;
            if (!fromStorage) createConfetti(card);
            updateUjiCards();
        }

        function resetPertemananQuiz() {
            localStorage.removeItem('nara_pertemanan');
            initPertemananQuiz();
            updateUjiCards();
            showToast('<span class="material-symbols-rounded" translate="no" aria-hidden="true">sync</span> Reset berhasil, kerjakan lagi!', '<span class="material-symbols-rounded" translate="no" aria-hidden="true">sync</span>');
        }

        // =====================================================================
        // MOOD QUEST
        // =====================================================================
        const moodScenarios = [{
            situation: "Besok ada ujian besar dan kamu merasa jantung berdebar, sulit fokus belajar. Emosi apa yang kamu rasakan, dan apa strategi coping paling sehat?",
            options: [
                { text: "Cemas — coba atur napas dan buat jadwal belajar singkat", safe: true },
                { text: "Cemas — begadang semalaman sambil terus khawatir", safe: false },
                { text: "Cemas — hindari belajar sama sekali karena takut", safe: false }
            ],
            feedback: "Rasa cemas sebelum ujian itu wajar. Mengatur napas dan membuat rencana kecil membantu meredakan cemas secara sehat."
        }, {
            situation: "Kamu baru saja bertengkar dengan sahabat dan merasa marah serta sedih sekaligus. Apa langkah coping yang paling sehat?",
            options: [
                { text: "Balas menyerang lewat pesan agar puas", safe: false },
                { text: "Pendam sendiri dan pura-pura baik-baik saja", safe: false },
                { text: "Tenangkan diri dulu, lalu bicarakan baik-baik saat sudah lebih tenang", safe: true }
            ],
            feedback: "Memberi waktu untuk tenang sebelum bicara baik-baik adalah cara sehat mengelola konflik dan emosi campur aduk."
        }, {
            situation: "Kamu melihat temanmu akhir-akhir ini menyendiri, murung, dan jarang bicara. Apa cara mendukungnya dengan baik?",
            options: [
                { text: "Abaikan saja, mungkin cuma fase", safe: false },
                { text: "Tanyakan kabarnya dengan tulus dan dengarkan tanpa menghakimi", safe: true },
                { text: "Sebarkan ke teman lain agar viral dan dia ditegur", safe: false }
            ],
            feedback: "Mendukung teman dimulai dari mendengarkan dengan tulus tanpa menghakimi — itu bisa jadi langkah pertama yang berarti."
        }, {
            situation: "Kamu merasa sedih berkepanjangan selama berminggu-minggu, sulit tidur, dan kehilangan semangat melakukan hal yang biasa disukai. Apa langkah yang tepat?",
            options: [
                { text: "Tunggu saja sampai hilang sendiri", safe: false },
                { text: "Cerita ke orang dewasa terpercaya dan pertimbangkan bantuan profesional", safe: true },
                { text: "Simpan sendiri karena malu bercerita", safe: false }
            ],
            feedback: "Perasaan sedih berkepanjangan yang mengganggu keseharian adalah tanda penting untuk mencari dukungan dari orang tepercaya atau tenaga profesional."
        }];
        let moodIndex = 0,
            moodScore = 0;

        function checkMoodQuestToday() {
            const card = document.getElementById('moodGameCard');
            if (!card) return;
            if (isQuizDoneToday('moodquest')) {
                const score = getQuizScore('moodquest');
                showMoodResult(card, score, true);
                return;
            }
            moodIndex = 0;
            moodScore = 0;
            renderMoodScenario();
        }

        function renderMoodScenario() {
            const card = document.getElementById('moodGameCard');
            if (!card) return;
            const s = moodScenarios[moodIndex];
            if (!s) {
                markQuizDone('moodquest', moodScore, { xp: 100 });
                showMoodResult(card, moodScore, false);
                updateUjiCards();
                return;
            }
            const pct = (moodIndex / moodScenarios.length) * 100;
            card.innerHTML = `
                <div class="mq-topbar">
                    <span class="mq-chip"><span class="material-symbols-rounded" translate="no" aria-hidden="true">psychology</span> Mood Quest</span>
                    <div class="mq-stats">
                        <span><span class="material-symbols-rounded" translate="no" aria-hidden="true">star</span> Skor ${moodScore}</span>
                        <span class="mq-dot"></span>
                        <span id="moodProgress">Situasi ${moodIndex+1}/${moodScenarios.length}</span>
                    </div>
                </div>
                <div class="mq-progress-track"><div class="mq-progress-fill" style="width:${pct}%;"></div></div>
                <div class="mq-situation quiz-enter" id="moodSituation">${s.situation}</div>
                <div class="mq-opts" id="moodOpts"></div>
                <div class="mq-feedback" id="moodFeedback" style="display:none;"></div>
            `;
            const optsEl = document.getElementById('moodOpts');
            s.options.forEach((opt, i) => {
                const b = document.createElement('button');
                b.className = 'mq-opt-btn';
                b.textContent = opt.text;
                b.onclick = () => answerMoodGame(i, b);
                optsEl.appendChild(b);
            });
        }

        function answerMoodGame(i, btn) {
            const s = moodScenarios[moodIndex];
            document.querySelectorAll('#moodOpts button').forEach((b, idx) => {
                b.disabled = true;
                if (s.options[idx].safe) b.classList.add('correct');
                else if (idx === i) b.classList.add('wrong');
            });
            if (s.options[i].safe) {
                moodScore++;
                showToast('<span class="material-symbols-rounded" translate="no" aria-hidden="true">check_circle</span> Pilihan tepat!', '<span class="material-symbols-rounded" translate="no" aria-hidden="true">track_changes</span>');
            } else {
                showToast('<span class="material-symbols-rounded" translate="no" aria-hidden="true">cancel</span> Coba strategi lain', '<span class="material-symbols-rounded" translate="no" aria-hidden="true">chat_bubble_outline</span>');
            }
            const fb = document.getElementById('moodFeedback');
            fb.textContent = s.feedback;
            fb.style.display = 'block';
            setTimeout(() => {
                moodIndex++;
                renderMoodScenario();
            }, 1800);
        }

        function showMoodResult(card, score, fromStorage) {
            const xpText = fromStorage ? ' (sudah dikerjakan hari ini)' : ' +100 XP <span class="material-symbols-rounded" translate="no" aria-hidden="true">auto_awesome</span>';
            card.innerHTML = `
                <div class="mq-result">
                    <div class="mq-result-badge"><span class="material-symbols-rounded" translate="no" aria-hidden="true">favorite</span></div>
                    <h4 class="mq-result-title">Mind Guardian!</h4>
                    <p class="mq-result-sub">Kamu menjawab ${score} dari ${moodScenarios.length} situasi dengan tepat.</p>
                    <p class="mq-result-status"><span class="material-symbols-rounded" translate="no" aria-hidden="true">check_circle</span> Selesai hari ini${xpText}</p>
                    ${!fromStorage ? `<div class="reward-card mq-reward">
                        <div class="ic"><span class="material-symbols-rounded" translate="no" aria-hidden="true">emoji_events</span></div>
                        <div><h5>Badge Mind Guardian</h5><p>+100 XP · Luar biasa!</p></div>
                    </div>` : ''}
                    <div class="mq-result-actions">
                        <button class="btn btn-primary" onclick="goTo('konsultasi')"><span class="material-symbols-rounded" translate="no" aria-hidden="true">chat_bubble</span> Bicara dengan Layanan Psikologis</button>
                        <button class="btn btn-outline" onclick="resetMoodQuest()"><span class="material-symbols-rounded" translate="no" aria-hidden="true">sync</span> Kerjakan Ulang Hari Ini</button>
                        <button class="btn btn-outline" onclick="goTo('edukasi')"><span class="material-symbols-rounded" translate="no" aria-hidden="true">menu_book</span> Kembali ke Edukasi</button>
                    </div>
                </div>
            `;
            if (!fromStorage) createConfetti(card);
            updateUjiCards();
        }

        function resetMoodQuest() {
            localStorage.removeItem('nara_moodquest');
            checkMoodQuestToday();
            updateUjiCards();
            showToast('<span class="material-symbols-rounded" translate="no" aria-hidden="true">sync</span> Reset berhasil, kerjakan lagi!', '<span class="material-symbols-rounded" translate="no" aria-hidden="true">sync</span>');
        }

        // =====================================================================
        // PERGAULAN BEBAS - MINI GAME (menggunakan sistem XP/quiz yang sama)
        // =====================================================================
        const pergaulanBebasScenarios = [{
            situation: "Beberapa temanmu mengajak nongkrong sampai larut malam di tempat yang tidak kamu kenal, tanpa sepengetahuan orang tua. Apa respons paling aman?",
            options: [
                { text: "Ikut saja supaya tidak dikira anak rumahan", safe: false },
                { text: "Tolak dengan sopan dan beri tahu orang tua ke mana kamu pergi", safe: true },
                { text: "Ikut tapi bohong ke orang tua soal tujuannya", safe: false }
            ],
            feedback: "Menolak ajakan yang berisiko dan tetap terbuka pada orang tua adalah cara menjaga dirimu tetap aman."
        }, {
            situation: "Pacar atau gebetanmu mendesak untuk melakukan hal fisik yang belum kamu siap lakukan. Apa tindakan yang paling sehat?",
            options: [
                { text: "Menolak dengan tegas dan menjelaskan batasanmu", safe: true },
                { text: "Menuruti saja supaya hubungan tidak berakhir", safe: false },
                { text: "Diam saja walau merasa tidak nyaman", safe: false }
            ],
            feedback: "Kamu berhak menolak apa pun yang membuatmu tidak nyaman. Pasangan yang menghargaimu akan menerima batasanmu."
        }, {
            situation: "Teman dekat menawarkan rokok atau minuman keras dan bilang 'sekali saja tidak apa-apa'. Apa pilihan paling bijak?",
            options: [
                { text: "Coba sedikit saja karena penasaran", safe: false },
                { text: "Tolak dengan tegas dan jelaskan alasanmu", safe: true },
                { text: "Terima tapi simpan untuk nanti", safe: false }
            ],
            feedback: "Menolak zat berbahaya sejak awal melindungi kesehatan dan masa depanmu, meski hanya 'coba sekali'."
        }, {
            situation: "Kamu diajak berpacaran secara diam-diam dan diminta merahasiakannya dari keluarga serta teman dekat. Apa yang sebaiknya kamu lakukan?",
            options: [
                { text: "Ikuti saja karena merasa spesial", safe: false },
                { text: "Waspada — hubungan yang sehat tidak butuh disembunyikan penuh rahasia", safe: true },
                { text: "Rahasiakan tapi tetap merasa was-was", safe: false }
            ],
            feedback: "Permintaan untuk selalu dirahasiakan dan mengisolasimu dari orang terdekat bisa jadi tanda hubungan yang tidak sehat."
        }, {
            situation: "Kamu merasa sudah terlanjur berada dalam situasi pergaulan yang berisiko dan bingung harus bicara ke siapa. Apa langkah paling tepat?",
            options: [
                { text: "Diam dan pendam sendiri karena takut dimarahi", safe: false },
                { text: "Cari orang dewasa tepercaya atau konselor untuk bercerita", safe: true },
                { text: "Terus lanjutkan karena sudah kepalang tanggung", safe: false }
            ],
            feedback: "Tidak ada kata terlambat untuk mencari bantuan. Bicara dengan orang tepercaya adalah langkah berani dan tepat."
        }];
        let pergaulanBebasIndex = 0,
            pergaulanBebasScore = 0;

        function checkPergaulanBebasToday() {
            const card = document.getElementById('pergaulanBebasGameCard');
            if (!card) return;
            if (isQuizDoneToday('pergaulanbebas')) {
                const score = getQuizScore('pergaulanbebas');
                showPergaulanBebasResult(card, score, true);
                return;
            }
            pergaulanBebasIndex = 0;
            pergaulanBebasScore = 0;
            renderPergaulanBebasScenario();
        }

        function renderPergaulanBebasScenario() {
            const card = document.getElementById('pergaulanBebasGameCard');
            if (!card) return;
            const s = pergaulanBebasScenarios[pergaulanBebasIndex];
            if (!s) {
                markQuizDone('pergaulanbebas', pergaulanBebasScore, { xp: 100 });
                showPergaulanBebasResult(card, pergaulanBebasScore, false);
                updateUjiCards();
                return;
            }
            const pct = (pergaulanBebasIndex / pergaulanBebasScenarios.length) * 100;
            card.innerHTML = `
                <span class="game-tag"><span class="material-symbols-rounded" translate="no" aria-hidden="true">handshake</span> Pemahaman Pergaulan Bebas</span>
                <div class="game-header" style="margin-top:8px;">
                    <span class="game-icon"><span class="material-symbols-rounded" translate="no" aria-hidden="true">track_changes</span></span>
                    <div class="game-stats">
                        <span><span class="material-symbols-rounded" translate="no" aria-hidden="true">star</span> Skor: ${pergaulanBebasScore}</span>
                        <span><span class="material-symbols-rounded" translate="no" aria-hidden="true">push_pin</span> ${pergaulanBebasIndex+1}/${pergaulanBebasScenarios.length}</span>
                    </div>
                </div>
                <div class="quiz-progress">Situasi ${pergaulanBebasIndex+1}</div>
                <div class="quiz-progress-bar"><div style="width:${pct}%;"></div></div>
                <div class="game-situation quiz-enter">${s.situation}</div>
                <div class="game-opts" id="pergaulanBebasOpts"></div>
                <div class="game-feedback" id="pergaulanBebasFeedback" style="display:none;"></div>
            `;
            const optsEl = document.getElementById('pergaulanBebasOpts');
            s.options.forEach((opt, i) => {
                const b = document.createElement('button');
                b.textContent = opt.text;
                b.onclick = () => answerPergaulanBebas(i, b);
                optsEl.appendChild(b);
            });
        }

        function answerPergaulanBebas(i, btn) {
            const s = pergaulanBebasScenarios[pergaulanBebasIndex];
            document.querySelectorAll('#pergaulanBebasOpts button').forEach((b, idx) => {
                b.disabled = true;
                if (s.options[idx].safe) b.classList.add('correct');
                else if (idx === i) b.classList.add('wrong');
            });
            if (s.options[i].safe) {
                pergaulanBebasScore++;
                showToast('<span class="material-symbols-rounded" translate="no" aria-hidden="true">check_circle</span> Pilihan tepat!', '<span class="material-symbols-rounded" translate="no" aria-hidden="true">track_changes</span>');
            } else {
                showToast('<span class="material-symbols-rounded" translate="no" aria-hidden="true">cancel</span> Coba pikirkan lagi', '<span class="material-symbols-rounded" translate="no" aria-hidden="true">chat_bubble_outline</span>');
            }
            const fb = document.getElementById('pergaulanBebasFeedback');
            fb.textContent = s.feedback;
            fb.style.display = 'block';
            setTimeout(() => {
                pergaulanBebasIndex++;
                renderPergaulanBebasScenario();
            }, 1800);
        }

        function showPergaulanBebasResult(card, score, fromStorage) {
            const xpText = fromStorage ? ' (sudah dikerjakan hari ini)' : ' +100 XP <span class="material-symbols-rounded" translate="no" aria-hidden="true">auto_awesome</span>';
            card.innerHTML = `
                <div class="game-result">
                    <div class="badge-icon" style="background:linear-gradient(135deg,#FF9F43,#FFD9A8);"><span class="material-symbols-rounded" translate="no" aria-hidden="true">handshake</span></div>
                    <h4 style="margin-bottom:6px;">Teman Sehat Sejati!</h4>
                    <p style="color:var(--text-muted);margin-bottom:18px;">Kamu menjawab ${score} dari ${pergaulanBebasScenarios.length} situasi dengan tepat.</p>
                    <p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:18px;"><span class="material-symbols-rounded" translate="no" aria-hidden="true">check_circle</span> Selesai hari ini${xpText}</p>
                    ${!fromStorage ? `<div class="reward-card" style="text-align:left;margin:0 0 18px;">
                        <div class="ic"><span class="material-symbols-rounded" translate="no" aria-hidden="true">emoji_events</span></div>
                        <div><h5>Badge Pemahaman Pergaulan Bebas</h5><p>+100 XP · Luar biasa!</p></div>
                    </div>` : ''}
                    <button class="btn btn-outline" style="margin-top:14px;" onclick="resetPergaulanBebas()"><span class="material-symbols-rounded" translate="no" aria-hidden="true">sync</span> Kerjakan Ulang Hari Ini</button>
                    <div style="margin-top:10px;">
                        <button class="btn btn-primary" onclick="goTo('pergaulanbebas')"><span class="material-symbols-rounded" translate="no" aria-hidden="true">handshake</span> Kembali ke Materi</button>
                        <button class="btn btn-outline" style="margin-left:8px;" onclick="goTo('konsultasi')"><span class="material-symbols-rounded" translate="no" aria-hidden="true">chat_bubble</span> Bicara dengan Layanan Psikologis</button>
                        <button class="btn btn-outline" style="margin-left:8px;" onclick="goTo('edukasi')"><span class="material-symbols-rounded" translate="no" aria-hidden="true">menu_book</span> Kembali ke Edukasi</button>
                    </div>
                </div>
            `;
            if (!fromStorage) createConfetti(card);
            updateUjiCards();
        }

        function resetPergaulanBebas() {
            localStorage.removeItem('nara_pergaulanbebas');
            checkPergaulanBebasToday();
            updateUjiCards();
            showToast('<span class="material-symbols-rounded" translate="no" aria-hidden="true">sync</span> Reset berhasil, kerjakan lagi!', '<span class="material-symbols-rounded" translate="no" aria-hidden="true">sync</span>');
        }

        // =====================================================================
        // PERGAULAN SEHAT - INTERAKTIF SKENARIO
        // =====================================================================
        const scenarios = [{
            text: "Teman-temanmu mengajakmu bolos sekolah untuk pergi ke mal. Kamu tahu itu salah dan berisiko, tapi mereka terus mendesak. Apa yang kamu lakukan?",
            options: [
                { text: "Ikut saja, biar tidak dianggap cupu", safe: false },
                { text: "Tolak dengan sopan dan ajak mereka melakukan hal yang lebih positif", safe: true },
                { text: "Diam saja tapi tetap ikut karena takut kehilangan teman", safe: false }
            ],
            feedback: "Menolak dengan sopan dan mengajak alternatif positif menunjukkan keberanian dan integritas. Teman sejati akan menghargai keputusanmu."
        }, {
            text: "Seorang teman sering meminjam uangmu dan tidak pernah mengembalikan. Saat kamu menagih, dia malah marah dan mengatakan kamu pelit. Apa yang kamu lakukan?",
            options: [
                { text: "Diam saja dan terus meminjamkan uang agar tidak dianggap pelit", safe: false },
                { text: "Bicara baik-baik dan tegas tentang batasanmu, berhenti meminjamkan uang", safe: true },
                { text: "Memarahinya di depan orang lain agar dia malu", safe: false }
            ],
            feedback: "Menetapkan batasan dengan tegas tapi tetap sopan adalah tanda pergaulan sehat. Kamu berhak menjaga keuangan dan kenyamananmu."
        }, {
            text: "Kamu melihat temanmu di-bully oleh sekelompok orang. Mereka merendahkan dan mengejek temanmu. Apa yang akan kamu lakukan?",
            options: [
                { text: "Diam saja dan pura-pura tidak melihat", safe: false },
                { text: "Bergabung dengan mereka agar tidak ikut menjadi sasaran", safe: false },
                { text: "Menegur pelaku dan mendukung temanmu", safe: true }
            ],
            feedback: "Membela teman yang di-bully adalah tindakan berani dan menunjukkan karakter yang kuat. Jangan biarkan perundungan terjadi di depanmu."
        }, {
            text: "Teman dekatmu mulai menjauh dan bergaul dengan orang-orang yang menurutmu berbahaya. Kamu khawatir dia terpengaruh hal negatif. Apa yang kamu lakukan?",
            options: [
                { text: "Abaikan saja, bukan urusanku", safe: false },
                { text: "Menggosipkan dia ke teman lain agar mereka tahu", safe: false },
                { text: "Bicara empatik dan tulus dengannya, tawarkan dukunganmu", safe: true }
            ],
            feedback: "Pendekatan yang penuh empati dan tanpa menghakimi adalah cara terbaik untuk menjangkau teman yang sedang terpengaruh. Tawarkan dukungan, bukan kritik."
        }];
        let scenarioIndex = 0;
        let scenarioXP = 0;
        let scenarioStreak = 0;
        let scenarioCorrectCount = 0;
        // Jawaban yang sudah dipilih pada skenario yang sedang tampil (null = belum menjawab).
        let scenarioAnswered = null;
        // 'idle'    = belum dibuka/dimulai
        // 'playing' = latihan sedang berjalan
        // 'result'  = latihan selesai -> halaman hasil ditampilkan dan TIDAK mengulang otomatis
        let scenarioMode = 'idle';
        // true bila XP baru saja diperoleh pada penyelesaian pertama hari ini
        let scenarioResultFresh = false;
        // Jeda (ms) setelah menjawab sebelum otomatis pindah ke skenario berikutnya,
        // supaya penjelasan/feedback sempat dibaca. Ubah angka ini untuk mempercepat/memperlambat.
        const SCENARIO_AUTO_NEXT_DELAY = 3000;
        let scenarioTimer = null;
        const SCENARIO_OPTION_ICONS = ['<span class="material-symbols-rounded" translate="no" aria-hidden="true">group</span>', '<span class="material-symbols-rounded" translate="no" aria-hidden="true">chat_bubble</span>', '<span class="material-symbols-rounded" translate="no" aria-hidden="true">volume_off</span>', '<span class="material-symbols-rounded" translate="no" aria-hidden="true">handshake</span>'];

        // Titik masuk halaman latihan. Aman dipanggil berkali-kali (goTo memanggilnya
        // lebih dari sekali): TIDAK pernah memulai ulang latihan yang sedang berjalan
        // atau yang sudah selesai. Mengulang hanya lewat tombol "Kerjakan Ulang".
        function initScenarioGame() {
            // Hari sudah berganti / data dihapus -> hasil lama tidak berlaku lagi
            if (scenarioMode === 'result' && !isQuizDoneToday('pergaulansehat')) scenarioMode = 'idle';

            if (scenarioMode === 'result') {
                renderScenarioResultView();
                return;
            }
            if (scenarioMode === 'playing') {
                setScenarioView('play');
                renderScenario();
                return;
            }
            // Belum dimulai di sesi ini: bila hari ini sudah selesai, tampilkan hasilnya
            if (isQuizDoneToday('pergaulansehat')) {
                const saved = getQuizState('pergaulansehat') || {};
                scenarioCorrectCount = saved.score || 0;
                scenarioXP = saved.xp || 0;
                scenarioResultFresh = false;
                scenarioMode = 'result';
                renderScenarioResultView();
                return;
            }
            startScenarioGame();
        }

        function startScenarioGame() {
            clearTimeout(scenarioTimer);
            scenarioTimer = null;
            scenarioMode = 'playing';
            scenarioIndex = 0;
            scenarioXP = 0;
            scenarioStreak = 0;
            scenarioCorrectCount = 0;
            scenarioAnswered = null;
            scenarioResultFresh = false;
            setScenarioView('play');
            updateScenarioMeta();
            renderScenario();
        }

        function setScenarioView(view) {
            const play = document.getElementById('scenarioPlayArea');
            const res = document.getElementById('scenarioResultView');
            if (play) play.style.display = (view === 'result') ? 'none' : '';
            if (res) res.style.display = (view === 'result') ? 'block' : 'none';
        }

        function updateScenarioMeta() {
            const total = scenarios.length;
            const current = Math.min(scenarioIndex + 1, total);
            const pct = Math.round(((scenarioIndex) / total) * 100);
            const numEl = document.getElementById('scenarioStepLabel');
            const barEl = document.getElementById('scenarioProgressBar');
            const xpEl = document.getElementById('scenarioXP');
            const streakEl = document.getElementById('scenarioStreakBadge');
            if (numEl) numEl.textContent = `Skenario ${current} dari ${total}`;
            if (barEl) barEl.style.width = pct + '%';
            if (xpEl) xpEl.innerHTML = `<span class="material-symbols-rounded" translate="no" aria-hidden="true">star</span> ${scenarioXP} XP`;
            if (streakEl) {
                if (scenarioStreak >= 2) {
                    streakEl.style.display = 'inline-flex';
                    streakEl.innerHTML = `<span class="material-symbols-rounded" translate="no" aria-hidden="true">local_fire_department</span> Streak ${scenarioStreak}`;
                } else {
                    streakEl.style.display = 'none';
                }
            }
        }

        function renderScenario() {
            const s = scenarios[scenarioIndex];
            if (!s) {
                showScenarioResult();
                return;
            }
            updateScenarioMeta();
            const badgeEl = document.getElementById('scenarioBadge');
            if (badgeEl) badgeEl.innerHTML = `<span class="material-symbols-rounded" translate="no" aria-hidden="true">help</span> Skenario ${scenarioIndex + 1}`;
            document.getElementById('scenarioText').textContent = s.text;
            const optsEl = document.getElementById('scenarioOpts');
            optsEl.innerHTML = '';
            s.options.forEach((opt, i) => {
                const b = document.createElement('button');
                b.innerHTML = `<span class="opt-ic">${SCENARIO_OPTION_ICONS[i] || '<span class="material-symbols-rounded" translate="no" aria-hidden="true">chat_bubble_outline</span>'}</span><span class="opt-text">${opt.text}</span><span class="opt-check"><span class="material-symbols-rounded" translate="no" aria-hidden="true">check</span></span>`;
                b.onclick = () => answerScenario(i, b);
                optsEl.appendChild(b);
            });
            const fb = document.getElementById('scenarioFeedback');
            fb.className = 'scenario-feedback';
            fb.style.display = 'none';
            fb.innerHTML = '';
            // Kembali ke halaman ini di tengah latihan: pulihkan jawaban yang sudah dipilih
            if (scenarioAnswered !== null) paintScenarioAnswer(scenarioAnswered);
        }

        function answerScenario(i) {
            if (scenarioAnswered !== null) return; // sudah dijawab, jangan hitung dua kali
            const s = scenarios[scenarioIndex];
            if (!s || !s.options[i]) return;
            scenarioAnswered = i;
            if (s.options[i].safe) {
                scenarioXP += 25;
                scenarioStreak += 1;
                scenarioCorrectCount += 1;
                showToast('<span class="material-symbols-rounded" translate="no" aria-hidden="true">check_circle</span> Pilihan tepat! +25 XP', '<span class="material-symbols-rounded" translate="no" aria-hidden="true">track_changes</span>');
            } else {
                scenarioStreak = 0;
                showToast('<span class="material-symbols-rounded" translate="no" aria-hidden="true">cancel</span> Coba pikirkan lagi', '<span class="material-symbols-rounded" translate="no" aria-hidden="true">chat_bubble_outline</span>');
            }
            paintScenarioAnswer(i);
            // Setelah menjawab, otomatis lanjut ke skenario berikutnya (atau ke hasil di skenario terakhir)
            clearTimeout(scenarioTimer);
            scenarioTimer = setTimeout(nextScenario, SCENARIO_AUTO_NEXT_DELAY);
        }

        // Hanya menggambar tampilan jawaban (tanpa mengubah skor)
        function paintScenarioAnswer(i) {
            const s = scenarios[scenarioIndex];
            const btns = document.querySelectorAll('#scenarioOpts button');
            const isSafe = s.options[i].safe;
            btns.forEach((b, idx) => {
                b.disabled = true;
                if (idx === i) b.classList.add('selected');
                if (s.options[idx].safe) b.classList.add('correct');
                else if (idx === i) b.classList.add('wrong');
            });
            const fb = document.getElementById('scenarioFeedback');
            if (isSafe) {
                fb.innerHTML = `<div class="fb-title">Pilihan yang baik! Kamu memilih respons yang lebih aman <span class="material-symbols-rounded" translate="no" aria-hidden="true">thumb_up</span></div><p>${s.feedback}</p>`;
            } else {
                fb.innerHTML = `<div class="fb-title fb-title-warn">Yuk, coba lihat dari sudut pandang lain <span class="material-symbols-rounded" translate="no" aria-hidden="true">help</span></div><p>${s.feedback}</p>`;
            }
            fb.className = 'scenario-feedback show' + (isSafe ? ' fb-correct' : ' fb-wrong');
            fb.style.display = 'block';
            updateScenarioMeta();
        }

        function nextScenario() {
            clearTimeout(scenarioTimer);
            scenarioTimer = null;
            if (scenarioMode !== 'playing') return;
            scenarioIndex++;
            scenarioAnswered = null;
            renderScenario();
            scrollScenarioIntoView();
        }

        // Bila halaman latihan sedang dilihat, pastikan soal baru terlihat (tidak tertinggal di bawah)
        function scrollScenarioIntoView() {
            const page = document.getElementById('page-pergaulanuji');
            const area = document.getElementById('scenarioPlayArea');
            if (!page || !area || !page.classList.contains('active')) return;
            const top = area.getBoundingClientRect().top;
            if (top < 90) window.scrollTo({ top: window.scrollY + top - 90, behavior: 'smooth' });
        }

        // Dipanggil sekali saat skenario terakhir selesai: simpan hasil lalu tampilkan halaman hasil
        function showScenarioResult() {
            const alreadyDoneToday = isQuizDoneToday('pergaulansehat');
            if (!alreadyDoneToday) {
                markQuizDone('pergaulansehat', scenarioCorrectCount, { xp: scenarioXP });
            } else {
                // Pengerjaan ulang: perbarui skor terakhir, tanpa XP tambahan
                const prev = getQuizState('pergaulansehat') || {};
                saveQuizState('pergaulansehat', Object.assign({}, prev, {
                    completed: true,
                    date: getToday(),
                    score: scenarioCorrectCount
                }));
            }
            scenarioMode = 'result';
            scenarioResultFresh = !alreadyDoneToday;
            updateUjiCards();
            renderScenarioResultView();
            const pg = document.getElementById('page-pergaulanuji');
            if (pg && pg.classList.contains('active')) window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Menggambar halaman hasil (permanen, tidak menutup sendiri & tidak mengulang otomatis)
        function renderScenarioResultView() {
            const total = scenarios.length;

            let badgeText = '<span class="material-symbols-rounded" translate="no" aria-hidden="true">eco</span> Pemula Peka';
            if (scenarioCorrectCount === total) badgeText = '<span class="material-symbols-rounded" translate="no" aria-hidden="true">emoji_events</span> Sahabat Sehat Sejati';
            else if (scenarioCorrectCount >= Math.ceil(total / 2)) badgeText = '<span class="material-symbols-rounded" translate="no" aria-hidden="true">handshake</span> Teman yang Suportif';

            const scoreEl = document.getElementById('scenarioResultScore');
            const xpEl = document.getElementById('scenarioResultXP');
            const badgeEl = document.getElementById('scenarioResultBadge');
            const subEl = document.getElementById('scenarioResultSub');
            if (scoreEl) scoreEl.textContent = `${scenarioCorrectCount}/${total}`;
            if (xpEl) xpEl.innerHTML = scenarioResultFresh
                ? `<span class="material-symbols-rounded" translate="no" aria-hidden="true">star</span> ${scenarioXP} XP`
                : '<span class="material-symbols-rounded" translate="no" aria-hidden="true">check_circle</span> Selesai hari ini';
            if (badgeEl) badgeEl.innerHTML = badgeText;
            if (subEl) subEl.textContent = `Kamu memilih respons yang sehat pada ${scenarioCorrectCount} dari ${total} skenario.`;
            setScenarioView('result');
        }

        // Satu-satunya jalan untuk mengulang latihan: tombol "Kerjakan Ulang"
        function resetScenarioGame() {
            startScenarioGame();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showToast('<span class="material-symbols-rounded" translate="no" aria-hidden="true">sync</span> Latihan diulang, selamat mencoba!', '<span class="material-symbols-rounded" translate="no" aria-hidden="true">sync</span>');
        }


        // =====================================================================
        // DIGITAL DEFENDER GAME
        // =====================================================================
        const digitalScenarios = [{
            situation: "Kamu menerima pesan dari akun tak dikenal yang bilang menang undian dan diminta klik tautan serta memasukkan data akun media sosialmu. Apa yang kamu lakukan?",
            options: [
                { text: "Klik tautan dan isi datanya, siapa tahu benar", safe: false },
                { text: "Abaikan, blokir, dan laporkan akun tersebut", safe: true },
                { text: "Balas dan tanya lebih detail dulu", safe: false }
            ],
            feedback: "Tautan mencurigakan dari akun tak dikenal seringkali adalah phishing/penipuan. Jangan pernah memasukkan data akun ke tautan yang tidak jelas sumbernya."
        }, {
            situation: "Seorang teman online meminta password akun media sosialmu 'supaya bisa bantu atur akun'. Apa tindakan paling aman?",
            options: [
                { text: "Berikan, karena dia terlihat baik", safe: false },
                { text: "Tolak dengan sopan — password adalah rahasia pribadi", safe: true },
                { text: "Berikan tapi minta dia janji tidak menyalahgunakan", safe: false }
            ],
            feedback: "Password tidak boleh dibagikan ke siapa pun, termasuk teman dekat. Ini cara utama menjaga akunmu tetap aman."
        }, {
            situation: "Kamu melihat komentar yang merendahkan dan terus-menerus ditujukan ke temanmu di media sosial. Apa langkah paling tepat?",
            options: [
                { text: "Ikut berkomentar agar seru", safe: false },
                { text: "Diam saja, bukan urusanku", safe: false },
                { text: "Laporkan komentar tersebut dan dukung temanmu", safe: true }
            ],
            feedback: "Melaporkan cyberbullying dan mendukung korban adalah tindakan yang tepat — jangan ikut menyebarkan atau membiarkannya."
        }, {
            situation: "Akun baru yang belum lama kamu kenal online mengajak bertemu langsung berdua di tempat sepi. Apa yang sebaiknya kamu lakukan?",
            options: [
                { text: "Tolak ajakan tersebut dan ceritakan ke orang dewasa terpercaya", safe: true },
                { text: "Datang saja, mungkin dia baik", safe: false },
                { text: "Datang tapi rahasiakan dari orang tua", safe: false }
            ],
            feedback: "Ajakan bertemu dari orang yang baru dikenal online, apalagi di tempat sepi, adalah tanda bahaya (grooming). Selalu beri tahu orang dewasa terpercaya."
        }];
        let digitalIndex = 0,
            digitalScore = 0;

        function checkDigitalToday() {
            const card = document.getElementById('digitalGameCard');
            if (!card) return;
            if (isQuizDoneToday('digitalgame')) {
                showDigitalResult(true);
                return;
            }
            digitalIndex = 0;
            digitalScore = 0;
            renderDigitalScenario();
        }

        function renderDigitalScenario() {
            const s = digitalScenarios[digitalIndex];
            document.getElementById('digitalProgress').textContent = 'Situasi ' + (digitalIndex + 1) + ' dari ' +
                digitalScenarios.length;
            document.getElementById('digitalSituation').textContent = s.situation;
            const optsEl = document.getElementById('digitalOpts');
            optsEl.innerHTML = '';
            document.getElementById('digitalFeedback').style.display = 'none';
            s.options.forEach((opt, i) => {
                const b = document.createElement('button');
                b.textContent = opt.text;
                b.onclick = () => answerDigital(i, b);
                optsEl.appendChild(b);
            });
        }

        function answerDigital(i, btn) {
            const s = digitalScenarios[digitalIndex];
            document.querySelectorAll('#digitalOpts button').forEach((b, idx) => {
                b.disabled = true;
                if (s.options[idx].safe) b.classList.add('correct');
                else if (idx === i) b.classList.add('wrong');
            });
            if (s.options[i].safe) digitalScore++;
            const fb = document.getElementById('digitalFeedback');
            fb.textContent = s.feedback;
            fb.style.display = 'block';
            setTimeout(() => {
                digitalIndex++;
                if (digitalIndex < digitalScenarios.length) renderDigitalScenario();
                else showDigitalResult(false);
            }, 1800);
        }

        function showDigitalResult(fromStorage) {
            const card = document.getElementById('digitalGameCard');
            if (!card) return;
            const alreadyDoneToday = fromStorage || isQuizDoneToday('digitalgame');
            const score = fromStorage ? getQuizScore('digitalgame') : digitalScore;
            if (!alreadyDoneToday) markQuizDone('digitalgame', digitalScore, { xp: 100, total: digitalScenarios.length });
            card.innerHTML = `
                <div class="game-result">
                    <div class="badge-icon" style="background:linear-gradient(135deg,#4A9FF5,#1A2A4A);"><span class="material-symbols-rounded" translate="no" aria-hidden="true">shield</span></div>
                    <h4 style="margin-bottom:6px;">Digital Guardian!</h4>
                    <p style="color:var(--text-muted);margin-bottom:18px;">Kamu menjawab ${score} dari ${digitalScenarios.length} situasi dengan tepat.</p>
                    ${!fromStorage ? `<div class="card reward-card" style="text-align:left;">
                        <div class="ic"><span class="material-symbols-rounded" translate="no" aria-hidden="true">emoji_events</span></div>
                        <div><h5>Badge Digital Guardian</h5><p>+100 XP diperoleh</p></div>
                    </div>` : `<p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:18px;"><span class="material-symbols-rounded" translate="no" aria-hidden="true">check_circle</span> Sudah dikerjakan hari ini</p>`}
                    <button class="btn btn-outline" style="margin-top:14px;" onclick="resetDigitalGame()"><span class="material-symbols-rounded" translate="no" aria-hidden="true">sync</span> Ulangi Challenge</button>
                    <div style="margin-top:10px;">
                        <button class="btn btn-primary" onclick="goTo('digital')"><span class="material-symbols-rounded" translate="no" aria-hidden="true">shield</span> Kembali ke Materi</button>
                        <button class="btn btn-outline" style="margin-left:8px;" onclick="goTo('edukasi')"><span class="material-symbols-rounded" translate="no" aria-hidden="true">menu_book</span> Kembali ke Edukasi</button>
                    </div>
                </div>`;
            if (!fromStorage) createConfetti(card);
            updateUjiCards();
        }

        function resetDigitalGame() {
            digitalIndex = 0;
            digitalScore = 0;
            document.getElementById('digitalGameCard').innerHTML = `
                <span class="game-tag">Digital Defender Challenge</span>
                <div class="game-progress" id="digitalProgress">Situasi 1 dari 4</div>
                <div class="game-situation" id="digitalSituation"></div>
                <div class="game-opts" id="digitalOpts"></div>
                <div class="game-feedback" id="digitalFeedback" style="display:none;"></div>`;
            renderDigitalScenario();
        }

        // =====================================================================
        // AI LITERACY GAME
        // =====================================================================
        const aiScenarios = [{
            situation: "Sebuah video menunjukkan tokoh terkenal mengucapkan pernyataan kontroversial. Gerakan bibirnya sedikit tidak sinkron dengan suara, dan pencahayaan wajah berbeda dari latar belakang. Video ini kemungkinan...",
            options: [
                { text: "Asli, karena wajahnya sangat mirip", safe: false },
                { text: "Kemungkinan deepfake — periksa sumber resmi sebelum percaya", safe: true },
                { text: "Pasti asli karena viral", safe: false }
            ],
            feedback: "Bibir tidak sinkron dan pencahayaan tidak konsisten adalah ciri umum deepfake. Selalu cek sumber resminya."
        }, {
            situation: "Kamu menerima pesan suara dari 'temanmu' yang meminta transfer uang mendesak, tapi nada bicaranya terdengar datar dan sedikit terputus-putus. Apa yang sebaiknya kamu lakukan?",
            options: [
                { text: "Langsung transfer karena terdengar seperti temanmu", safe: false },
                { text: "Hubungi temanmu lewat cara lain untuk memastikan", safe: true },
                { text: "Abaikan tanpa mengecek sama sekali", safe: false }
            ],
            feedback: "Suara buatan AI (voice cloning) bisa terdengar mirip tapi sedikit tidak natural. Selalu konfirmasi lewat jalur lain sebelum bertindak."
        }, {
            situation: "Sebuah foto menunjukkan dua orang di suatu tempat, dengan arah bayangan yang tidak konsisten dan bentuk jari tangan yang terlihat aneh. Foto ini kemungkinan...",
            options: [
                { text: "Hasil manipulasi/AI — perlu diverifikasi", safe: true },
                { text: "Pasti asli karena resolusinya tinggi", safe: false },
                { text: "Tidak perlu diperiksa lebih lanjut", safe: false }
            ],
            feedback: "Bayangan yang tidak konsisten dan bentuk jari yang aneh adalah ciri umum gambar hasil AI generatif."
        }, {
            situation: "Kamu menemukan video yang menyebut namamu dengan wajah mirip kamu, padahal kamu tidak pernah membuatnya. Apa langkah paling tepat?",
            options: [
                { text: "Diam saja karena malu", safe: false },
                { text: "Simpan bukti, jangan sebarkan, dan laporkan ke orang dewasa terpercaya", safe: true },
                { text: "Membalas komentar yang menyebarkannya dengan emosi", safe: false }
            ],
            feedback: "Jika kamu menjadi korban deepfake, simpan bukti, jangan ikut menyebarkan, dan segera minta bantuan orang dewasa terpercaya atau pihak berwenang."
        }];
        let aiIndex = 0,
            aiScore = 0;

        function checkAiToday() {
            const card = document.getElementById('aiGameCard');
            if (!card) return;
            if (isQuizDoneToday('aigame')) {
                showAiResult(true);
                return;
            }
            aiIndex = 0;
            aiScore = 0;
            renderAiScenario();
        }

        function renderAiScenario() {
            const s = aiScenarios[aiIndex];
            document.getElementById('aiProgress').textContent = 'Kasus ' + (aiIndex + 1) + ' dari ' + aiScenarios.length;
            document.getElementById('aiSituation').textContent = s.situation;
            const optsEl = document.getElementById('aiOpts');
            optsEl.innerHTML = '';
            document.getElementById('aiFeedback').style.display = 'none';
            s.options.forEach((opt, i) => {
                const b = document.createElement('button');
                b.textContent = opt.text;
                b.onclick = () => answerAi(i, b);
                optsEl.appendChild(b);
            });
        }

        function answerAi(i, btn) {
            const s = aiScenarios[aiIndex];
            document.querySelectorAll('#aiOpts button').forEach((b, idx) => {
                b.disabled = true;
                if (s.options[idx].safe) b.classList.add('correct');
                else if (idx === i) b.classList.add('wrong');
            });
            if (s.options[i].safe) aiScore++;
            const fb = document.getElementById('aiFeedback');
            fb.textContent = s.feedback;
            fb.style.display = 'block';
            setTimeout(() => {
                aiIndex++;
                if (aiIndex < aiScenarios.length) renderAiScenario();
                else showAiResult(false);
            }, 1800);
        }

        function showAiResult(fromStorage) {
            const card = document.getElementById('aiGameCard');
            if (!card) return;
            const alreadyDoneToday = fromStorage || isQuizDoneToday('aigame');
            const score = fromStorage ? getQuizScore('aigame') : aiScore;
            if (!alreadyDoneToday) markQuizDone('aigame', aiScore, { xp: 100, total: aiScenarios.length });
            card.innerHTML = `
                <div class="game-result">
                    <div class="badge-icon" style="background:linear-gradient(135deg,#7C6FEF,#B44FD1);"><span class="material-symbols-rounded" translate="no" aria-hidden="true">smart_toy</span></div>
                    <h4 style="margin-bottom:6px;">AI Literacy Champion!</h4>
                    <p style="color:var(--text-muted);margin-bottom:18px;">Kamu menjawab ${score} dari ${aiScenarios.length} kasus dengan tepat.</p>
                    ${!fromStorage ? `<div class="card reward-card" style="text-align:left;">
                        <div class="ic"><span class="material-symbols-rounded" translate="no" aria-hidden="true">emoji_events</span></div>
                        <div><h5>Badge AI Literacy Champion</h5><p>+100 XP diperoleh</p></div>
                    </div>` : `<p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:18px;"><span class="material-symbols-rounded" translate="no" aria-hidden="true">check_circle</span> Sudah dikerjakan hari ini</p>`}
                    <button class="btn btn-outline" style="margin-top:14px;" onclick="resetAiGame()"><span class="material-symbols-rounded" translate="no" aria-hidden="true">sync</span> Ulangi Game</button>
                    <div style="margin-top:10px;">
                        <button class="btn btn-primary" onclick="goTo('ai')"><span class="material-symbols-rounded" translate="no" aria-hidden="true">smart_toy</span> Kembali ke Materi</button>
                        <button class="btn btn-outline" style="margin-left:8px;" onclick="goTo('edukasi')"><span class="material-symbols-rounded" translate="no" aria-hidden="true">menu_book</span> Kembali ke Edukasi</button>
                    </div>
                </div>`;
            if (!fromStorage) createConfetti(card);
            updateUjiCards();
        }

        function resetAiGame() {
            aiIndex = 0;
            aiScore = 0;
            document.getElementById('aiGameCard').innerHTML = `
                <span class="game-tag">Asli atau Deepfake?</span>
                <div class="game-progress" id="aiProgress">Kasus 1 dari 4</div>
                <div class="game-situation" id="aiSituation"></div>
                <div class="game-opts" id="aiOpts"></div>
                <div class="game-feedback" id="aiFeedback" style="display:none;"></div>`;
            renderAiScenario();
        }

        // =====================================================================
        // CONFETTI EFFECT
        // =====================================================================
        function createConfetti(container) {
            const colors = ['#4A9FF5', '#F5A623', '#1FAE6B', '#E14B4B', '#7C6FEF', '#B44FD1', '#FF6B6B', '#FFD93D'];
            const confettiContainer = document.createElement('div');
            confettiContainer.className = 'confetti';
            for (let i = 0; i < 30; i++) {
                const span = document.createElement('span');
                span.style.left = Math.random() * 100 + '%';
                span.style.top = '-10px';
                span.style.background = colors[Math.floor(Math.random() * colors.length)];
                span.style.width = (4 + Math.random() * 6) + 'px';
                span.style.height = (4 + Math.random() * 6) + 'px';
                span.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
                span.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';
                span.style.animationDelay = (Math.random() * 0.8) + 's';
                confettiContainer.appendChild(span);
            }
            container.appendChild(confettiContainer);
            setTimeout(() => confettiContainer.remove(), 4000);
        }

        // =====================================================================
        // RANA AI — DETEKSI KRISIS (bunuh diri / self-harm / bahaya langsung)
        // Dijalankan TERPISAH dan LEBIH DULU dari pencocokan topik biasa, supaya
        // sinyal krisis tidak pernah "kalah skor" dari topik lain dan selalu
        // memicu respons darurat, bukan jawaban umum.
        // =====================================================================
        const crisisKeywords = [
            // Ide bunuh diri (langsung, orang pertama)
            "bunuh diri", "bunuh diriku", "ingin bunuh diri", "mau bunuh diri", "pengen bunuh diri",
            "pingin bunuh diri", "niat bunuh diri", "rencana bunuh diri",
            "ingin mati", "pengen mati", "pingin mati", "mau mati saja", "lebih baik aku mati",
            "lebih baik mati saja", "mending mati", "capek hidup", "udah gak kuat hidup",
            "gak sanggup hidup", "tidak sanggup hidup", "gak kuat jalani hidup",
            "mengakhiri hidup", "mengakhiri hidupku", "mengakhiri semuanya", "mau mengakhiri hidup",
            "hidup gak ada gunanya", "hidup tidak berguna", "gak ada gunanya hidup",
            "gak pantas hidup", "tidak pantas hidup", "pengen menghilang selamanya",
            "pengen ngilang selamanya", "pengen tidur selamanya", "capek jadi manusia",
            "gak ada yang akan kehilangan aku", "dunia lebih baik tanpa aku",
            // Self-harm
            "menyakiti diri", "melukai diri", "menyayat diri", "menyayat tangan",
            "sayat pergelangan", "self harm", "selfharm", "self-harm", "nyilet", "nyayat",
            "overdosis", "minum obat banyak biar mati", "minum obat sekaligus banyak",
            // Variasi ejaan/gaul umum
            "pengen bunuh diriku", "pengen mati aja", "mau mati aja", "udah pengen mati",
            "gak kuat lagi hidup", "gapapa kalo aku mati", "gpp kalo aku mati", "aku mau nyerah hidup",
            "hidupku udah gak berarti", "gak ada gunanya lagi aku hidup"
        ];

        function detectCrisisSignal(rawText) {
            const text = normalizeText(rawText);
            if (!text) return false;
            return crisisKeywords.some(kw => text.includes(normalizeText(kw)));
        }

        function escapeHtml(str) {
            const div = document.createElement('div');
            div.textContent = String(str == null ? '' : str);
            return div.innerHTML;
        }

        function renderCrisisResponse() {
            const html =
                '<div class="rana-crisis-box" role="alert">' +
                '<div class="rana-crisis-title"><span class="material-symbols-rounded" translate="no" aria-hidden="true">favorite</span> Aku di sini bersamamu</div>' +
                '<p>Saya khawatir kamu sedang berada dalam situasi yang tidak aman.</p>' +
                '<p>Kamu tidak harus menghadapi ini sendirian. Perasaan seberat ini penting untuk segera dibicarakan dengan orang yang bisa membantu secara langsung — bukan hanya lewat chat ini.</p>' +
                '<p><b>Hubungi orang dewasa tepercaya atau bantuan profesional sekarang.</b></p>' +
                '<div class="rana-crisis-actions">' +
                '<a class="btn btn-primary" href="tel:112"><span class="material-symbols-rounded" translate="no" aria-hidden="true">call</span> Hubungi 112 (Darurat)</a>' +
                '<a class="btn btn-outline" href="tel:119"><span class="material-symbols-rounded" translate="no" aria-hidden="true">call</span> SEJIWA 119 ext. 8</a>' +
                '<button class="btn btn-outline" onclick="goTo(\'konsultasi\')"><span class="material-symbols-rounded" translate="no" aria-hidden="true">psychology</span> Bicara dengan Guru BK / Layanan Psikologis</button>' +
                '</div>' +
                '<p class="rana-crisis-footnote">RANA AI bukan layanan darurat dan tidak dapat menggantikan bantuan manusia. Kamu tidak perlu menceritakan detail apa pun di sini — cukup hubungi salah satu kontak di atas.</p>' +
                '</div>';
            appendMsg(html, 'bot');
        }

        // =====================================================================
        // RANA AI — BASIS PENGETAHUAN (diringkas)
        // =====================================================================
        const ranaTopics = [{
                id: "pergaulan-bebas",
                keywords: ["pergaulan bebas", "gaul bebas", "seks bebas", "pergaulan negatif", "salah pergaulan",
                    "salah gaul", "pergaulan", "bebas", "free sex", "hubungan seks", "seks di luar nikah",
                    "sebelum menikah"
                ],
                answer: "Pergaulan bebas merujuk pada pergaulan yang melewati batas-batas sehat dan dapat membawa risiko bagi diri sendiri. Yang penting adalah memahami batasan pribadi, menghargai consent, mampu menolak tekanan, serta membuat keputusan yang aman dan bertanggung jawab. Ingat, kamu berhak menolak dan menentukan sendiri apa yang nyaman untukmu."
            },
            {
                id: "consent",
                keywords: ["consent", "persetujuan", "setuju", "persetujuan dalam hubungan", "izin", "meminta izin",
                    "apa itu consent", "persetujuan bersama"
                ],
                answer: "Consent atau persetujuan adalah kesepakatan yang diberikan secara sadar, sukarela, dan jelas antara kedua pihak. Consent harus diberikan tanpa paksaan, tekanan, atau pengaruh alkohol/obat-obatan. Consent bisa dicabut kapan saja. Jika kamu atau pasangan tidak memberikan consent dengan sadar, itu bukan hubungan yang sehat."
            },
            {
                id: "batasan-diri",
                keywords: ["batasan diri", "menjaga batasan", "batasan dalam hubungan", "batasan dalam pacaran",
                    "cara menolak pasangan", "boundaries", "batasan", "hubungan", "pacaran", "batas pribadi"
                ],
                answer: "Menjaga batasan diri itu penting dan sehat. Beberapa cara yang bisa kamu lakukan:<ul><li>Kenali nilai dan batasan pribadimu</li><li>Bicarakan batasanmu dengan jelas dan tegas</li><li>Berani mengatakan 'tidak' tanpa merasa bersalah</li><li>Hargai batasan pasangan juga</li><li>Jangan ragu meminta bantuan jika merasa tertekan</li></ul>"
            },
            {
                id: "tekanan-teman",
                keywords: ["tekanan teman", "tekanan teman sebaya", "dipaksa teman", "gengsi sama teman",
                    "takut tidak diterima", "peer pressure", "teman sebaya", "diajak", "dipengaruhi teman",
                    "ikut-ikutan"
                ],
                answer: "Tekanan teman sebaya itu wajar dirasakan, tapi keputusanmu tetap milikmu. Coba:<ul><li>Kenali alasan di balik tekanan itu</li><li>Latih cara menolak dengan sopan tapi tegas</li><li>Cari teman/lingkaran yang mendukung pilihanmu</li><li>Bicara dengan orang dewasa terpercaya jika tekanannya berat</li><li>Ingat, teman sejati tidak akan memaksamu melakukan hal yang tidak nyaman</li></ul>"
            },
            {
                id: "konten-pribadi",
                keywords: ["konten pribadi", "penyebaran konten pribadi", "foto pribadi disebar",
                    "video pribadi disebar", "diancam sebarkan foto", "revenge porn", "chat pribadi bocor",
                    "disebarkan", "tersebar", "foto pribadi", "video pribadi", "diancam sebar", "sextortion",
                    "diperas", "ncii", "konten intim"
                ],
                priority: "crisis",
                answer: "Aku turut prihatin ini terjadi padamu. Yang terjadi bukan salahmu, dan kamu tidak sendirian. Ini langkah aman yang bisa langsung kamu lakukan:<ul><li>Jangan panik — tarik napas, dan cari orang dewasa terpercaya secepatnya</li><li>Jangan penuhi tuntutan pelaku (uang, konten tambahan, dll)</li><li>Jangan hapus bukti — simpan screenshot, chat, dan tautan terkait</li><li>Blokir & laporkan akun pelaku setelah bukti diamankan</li><li>Ceritakan ke orang tua, guru, konselor, atau psikolog kami</li></ul>Kamu bisa lanjut konsultasi rahasia (boleh pakai nama samaran) atau lihat kontak bantuan darurat di bawah ini."
            },
            {
                id: "sextortion",
                keywords: ["sextortion", "pemerasan", "diancam", "diminta uang", "diancam sebar", "diperas",
                    "pemerasan seksual"
                ],
                priority: "crisis",
                answer: "Sextortion adalah pemerasan dengan ancaman menyebarkan konten pribadi/intim. Jika kamu mengalaminya:<ul><li>Jangan panik — ini bukan salahmu</li><li>Jangan bayar atau penuhi tuntutan pelaku</li><li>Simpan semua bukti (chat, screenshot, tautan)</li><li>Blokir pelaku setelah bukti diamankan</li><li>Ceritakan ke orang dewasa terpercaya</li><li>Laporkan ke pihak berwenang</li></ul>Kamu berhak mendapat perlindungan dan dukungan."
            },
            {
                id: "dipaksa",
                keywords: ["memaksa", "dipaksa", "maksa", "terpaksa", "ada yang memaksa", "dipaksa melakukan",
                    "tidak mau tapi dipaksa", "dipaksa pasangan", "dipaksa pacar"
                ],
                answer: "Kamu berhak menolak apa pun yang tidak kamu inginkan, siapa pun yang memintanya — perasaan tidak nyamanmu itu valid. Jika ada yang memaksamu:<ul><li>Katakan 'tidak' dengan tegas dan jelas, kamu tidak perlu merasa bersalah</li><li>Jauhi situasi atau orang tersebut jika memungkinkan</li><li>Simpan bukti (pesan, chat, rekaman) jika ada</li><li>Segera cari orang dewasa terpercaya untuk membantu</li><li>Ingat, pemaksaan bukan salahmu — kamu tidak wajib menuruti tekanan siapa pun</li></ul>Kalau kamu merasa dalam bahaya, segera hubungi orang dewasa terpercaya atau tim konsultasi kami."
            },
            {
                id: "keamanan-digital",
                keywords: ["keamanan digital", "privasi digital", "privasi media sosial", "menjaga privasi",
                    "jaga privasi", "privasi", "data pribadi", "kata sandi", "password", "akun diretas",
                    "diretas", "phishing", "penipuan online", "tautan mencurigakan", "akun palsu",
                    "media sosial aman", "aman di internet", "aman di media sosial", "keamanan akun"
                ],
                answer: "Menjaga keamanan digital itu penting supaya kamu tetap aman saat beraktivitas online. Beberapa langkah yang bisa kamu lakukan:<ul><li>Gunakan kata sandi yang kuat dan jangan pakai yang sama di banyak akun</li><li>Aktifkan verifikasi dua langkah jika tersedia</li><li>Jangan sembarangan membagikan data pribadi seperti nama lengkap, alamat, lokasi, atau foto</li><li>Waspadai phishing, tautan mencurigakan, dan akun palsu</li><li>Atur privasi akun media sosialmu agar hanya orang yang kamu percaya yang bisa melihat kontenmu</li></ul>Kalau akunmu pernah diretas atau datamu disalahgunakan, segera ganti kata sandi dan ceritakan ke orang dewasa terpercaya atau tim konsultasi kami."
            },
            {
                id: "perundungan",
                keywords: ["sering dibully", "cyberbullying", "dihina online", "diteror", "dijahili", "dikatain",
                    "dibully", "bully", "perundungan", "dihina", "diejek", "dikucilkan", "diolok", "bodyshaming",
                    "body shaming"
                ],
                answer: "Perundungan (bullying), baik langsung maupun online, bukan hal yang harus kamu tanggung sendirian dan bukan salahmu mengalaminya. Beberapa langkah yang bisa membantu:<ul><li>Simpan bukti (pesan, screenshot, tangkapan layar)</li><li>Jangan balas dengan kekerasan atau hinaan serupa</li><li>Ceritakan pada orang dewasa terpercaya di rumah atau sekolah</li><li>Blokir & laporkan pelaku di platform yang digunakan</li><li>Ingat, kamu berharga dan tidak pantas diperlakukan seperti itu</li></ul>Kalau kamu butuh bicara lebih jauh, tim konsultasi kami siap mendengarkan."
            },
            {
                id: "cemas-sedih",
                keywords: ["cemas dan sedih", "susah tidur karena cemas", "khawatir berlebihan", "mood swing",
                    "perasaan campur aduk", "panik", "cemas", "gelisah", "sedih terus", "overthinking",
                    "takut berlebihan", "murung", "depresi", "kecemasan", "ansietas"
                ],
                answer: "Perasaan cemas atau sedih yang datang silih berganti itu bagian normal dari hidup, tapi kalau terasa berat dan berlangsung lama, kamu tidak perlu menghadapinya sendirian. Coba mulai dengan:<ul><li>Tarik napas dalam beberapa kali</li><li>Tuliskan apa yang kamu rasakan</li><li>Ceritakan ke orang dewasa terpercaya</li><li>Jangan ragu mencari bantuan profesional</li></ul>Untuk pendampingan yang lebih personal, kamu bisa bicara langsung dengan psikolog kami lewat fitur Konsultasi."
            },
            {
                id: "kecanduan-gadget",
                keywords: ["kecanduan gadget", "kecanduan hp", "kecanduan game", "kecanduan sosmed",
                    "kecanduan internet", "main hp terus", "tidak bisa lepas hp", "susah lepas hp",
                    "susah fokus karena hp", "screen time"
                ],
                answer: "Merasa sulit lepas dari gadget itu banyak dialami remaja, dan ada cara untuk mengelolanya secara bertahap:<ul><li>Tetapkan waktu khusus bebas gadget (misalnya saat makan atau sebelum tidur)</li><li>Gunakan fitur pengingat waktu layar</li><li>Ganti sebagian waktu dengan aktivitas offline yang kamu sukai</li><li>Cerita ke orang tua/wali untuk saling mendukung</li><li>Coba kurangi 15 menit setiap hari</li></ul>Kalau ini sudah mengganggu sekolah atau tidurmu, coba diskusikan lebih lanjut lewat fitur Konsultasi."
            },
            {
                id: "masalah-keluarga",
                keywords: ["masalah keluarga", "masalah dengan orang tua", "konflik keluarga", "tidak nyaman di rumah",
                    "orang tua cerai", "broken home", "sering dimarahi orang tua", "bertengkar dengan orang tua",
                    "orang tua", "dimarahi", "tidak akur", "keluarga berantakan"
                ],
                answer: "Hubungan dengan keluarga memang tidak selalu mudah, dan wajar jika kamu merasa lelah atau bingung. Beberapa hal yang bisa membantu:<ul><li>Cari waktu tenang untuk bicara, bukan saat emosi memuncak</li><li>Gunakan kalimat yang menjelaskan perasaanmu, bukan menyalahkan</li><li>Cari orang dewasa lain yang bisa jadi penengah/tempat curhat (guru BK, saudara, konselor)</li><li>Ingat, konflik keluarga bukan berarti orang tuamu tidak menyayangimu</li></ul>Jika situasinya berat atau kamu merasa tidak aman di rumah, sebaiknya bicara langsung dengan konselor atau psikolog kami."
            },
            {
                id: "stres-akademik",
                keywords: ["stres tugas sekolah", "stres sekolah", "tugas menumpuk", "burnout sekolah",
                    "deadline tugas", "takut nilai turun", "tertekan akademik", "banyak tugas", "nilai jelek",
                    "takut ujian", "tekanan akademik", "stres belajar", "ujian", "tugas"
                ],
                answer: "Tekanan akademik itu nyata dan wajar membuatmu lelah. Beberapa cara mengelolanya:<ul><li>Pecah tugas besar jadi langkah-langkah kecil</li><li>Atur waktu istirahat, jangan belajar terus-menerus tanpa jeda</li><li>Bicarakan bebanmu ke guru/orang tua — nilai bukan penentu nilai dirimu</li><li>Kenali kapan stres sudah berlebihan dan butuh bantuan tambahan</li><li>Ingat, kesehatan mentalmu lebih penting dari angka di rapor</li></ul>"
            },
            {
                id: "kesepian",
                keywords: ["merasa sendiri", "tidak ada yang peduli", "susah cari teman", "diabaikan teman",
                    "kesepian", "sendirian", "tidak punya teman", "dijauhi", "susah bergaul"
                ],
                answer: "Merasa kesepian atau sulit punya teman itu bisa terasa berat, tapi ini bisa membaik seiring waktu. Beberapa langkah kecil:<ul><li>Ikut kegiatan/komunitas yang sesuai minatmu</li><li>Mulai obrolan ringan dengan satu orang dulu</li><li>Ingat bahwa kualitas pertemanan lebih penting dari jumlahnya</li><li>Jangan bandingkan dirimu dengan orang lain di media sosial</li></ul>Kalau perasaan ini berlangsung lama dan berat, coba bicarakan dengan konselor sekolah atau tim konsultasi kami."
            },
            {
                id: "putus-cinta",
                keywords: ["baru putus", "susah move on", "kehilangan pasangan", "putus cinta", "patah hati",
                    "diselingkuhi", "ditinggal pacar", "mantan"
                ],
                answer: "Patah hati itu wajar terasa menyakitkan. Beri dirimu waktu untuk merasakannya, jangan dipendam sendiri — cerita ke teman atau keluarga yang kamu percaya bisa membantu. Hindari mengambil keputusan besar saat emosi masih tinggi, dan fokus dulu pada hal-hal yang membuatmu nyaman dan aman. Proses penyembuhan butuh waktu, dan tidak apa-apa untuk meminta dukungan."
            },
            {
                id: "grooming",
                keywords: ["grooming", "grooming online", "orang dewasa mendekati anak", "didekati orang asing",
                    "dirayu online", "manipulasi online", "pedofil", "anak dirayu"
                ],
                priority: "crisis",
                answer: "Grooming adalah proses manipulasi yang dilakukan orang dewasa untuk mendekati anak/remaja secara emosional, dengan tujuan eksploitasi. Ciri-cirinya:<ul><li>Memberi perhatian berlebihan dan pujian</li><li>Mencoba mengisolasi kamu dari keluarga/teman</li><li>Minta foto atau informasi pribadi</li><li>Mengancam atau memaksa jika kamu menolak</li></ul>Jika kamu merasa ada yang mencoba mendekatimu dengan cara ini:<ul><li>Jangan balas pesan mereka</li><li>Blokir dan laporkan akunnya</li><li>Ceritakan ke orang dewasa terpercaya</li><li>Jangan pernah bertemu langsung</li></ul>Kamu tidak sendiri — kami siap membantu."
            },
            {
                id: "hubungan-tidak-sehat",
                keywords: ["hubungan tidak sehat", "dikontrol pacar", "posesif berlebihan", "pasangan kasar",
                    "red flag hubungan", "selalu curiga", "toxic", "posesif", "mengontrol", "cemburu berlebihan",
                    "kekerasan dalam pacaran", "kdrp"
                ],
                answer: "Hubungan tidak sehat biasanya ditandai dengan:<ul><li>Kontrol berlebihan atas aktivitasmu</li><li>Ancaman atau intimidasi</li><li>Tidak menghargai batasanmu</li><li>Membuatmu takut menyampaikan pendapat</li><li>Cemburu yang berlebihan dan tidak beralasan</li></ul>Kamu bisa coba fitur 'Cek Hubunganku' untuk mengenali pola dalam hubunganmu sendiri. Jika kamu merasa tidak aman, bicara dengan orang dewasa terpercaya atau konselor."
            },
            {
                id: "kekerasan",
                keywords: ["kekerasan fisik", "kekerasan rumah tangga", "dianiaya orang tua", "dipukuli", "disiksa",
                    "kekerasan", "dipukul", "disakiti", "kdrt", "dianiaya", "kekerasan dalam rumah tangga"
                ],
                priority: "crisis",
                answer: "Kamu berhak merasa aman, dan apa yang terjadi bukan salahmu. Jika kamu sedang dalam bahaya langsung, segera cari tempat aman dan hubungi orang dewasa terpercaya atau layanan darurat 112. Simpan bukti jika memungkinkan dan jangan hadapi ini sendirian — laporkan ke guru BK, konselor, atau psikolog kami secepatnya. Kamu berharga dan berhak dilindungi."
            },
            {
                id: "dukung-teman",
                keywords: ["mendukung teman", "teman depresi", "teman sedih", "teman curhat", "cara membantu teman",
                    "teman bunuh diri", "teman tertekan"
                ],
                answer: "Mendukung teman yang sedang tertekan adalah tindakan yang sangat berarti. Beberapa cara yang bisa kamu lakukan:<ul><li>Dengarkan tanpa menghakimi</li><li>Tanyakan langsung: 'Aku bisa bantu apa?'</li><li>Jangan paksa mereka bercerita jika belum siap</li><li>Ingatkan mereka bahwa mereka berharga</li><li>Jika kamu khawatir keselamatannya, bicara dengan orang dewasa terpercaya</li></ul>Kamu tidak perlu jadi 'penyelamat' — cukup hadir dan mendengarkan sudah sangat berarti."
            },
            {
                id: "insecure",
                keywords: ["insecure", "membandingkan diri", "medsos bikin insecure", "iri dengan orang lain",
                    "tidak percaya diri", "minder", "body shaming", "dihina fisik"
                ],
                answer: "Membandingkan diri dengan orang lain di media sosial adalah jebakan yang sering membuat kita merasa tidak cukup baik. Ingat:<ul><li>Di media sosial, orang hanya menampilkan versi terbaik dari hidupnya</li><li>Setiap orang punya perjuangannya masing-masing</li><li>Kamu unik dengan caramu sendiri</li><li>Kurangi waktu di medsos dan perbanyak aktivitas yang membuatmu bahagia</li><li>Jika ini mengganggu kesehatan mentalmu, bicarakan dengan konselor</li></ul>Kamu berharga apa adanya."
            }
        ];

        function normalizeText(str) {
            return str.toLowerCase()
                .replace(/[^a-z0-9\s]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        }

        function stemWord(word) {
            return word
                .replace(/^(meng|meny|men|mem|me|di|ter|ber|per|pe|ke|se)/, '')
                .replace(/(kannya|annya|nya|kan|lah|kah|in|an|i|mu|ku|nya)$/, '');
        }

        function keywordScore(kwNorm, text, stems) {
            const kwWords = kwNorm.split(' ').filter(Boolean);
            if (!kwWords.length) return 0;
            if (text.includes(kwNorm)) return kwWords.length * 3;
            const kwStems = kwWords.map(stemWord);
            const allMatch = kwStems.every(ks => ks.length >= 2 && stems.includes(ks));
            return allMatch ? kwWords.length * 2 : 0;
        }

        function matchTopic(message) {
            const text = normalizeText(message);
            if (!text) return null;
            const tokens = text.split(' ').filter(Boolean);
            const stems = tokens.map(stemWord);
            const scored = ranaTopics.map(topic => {
                let best = 0,
                    total = 0;
                topic.keywords.forEach(kw => {
                    const s = keywordScore(normalizeText(kw), text, stems);
                    if (s > 0) { total += s; if (s > best) best = s; }
                });
                return { topic, best, total };
            });
            scored.sort((a, b) => {
                if (b.best !== a.best) return b.best - a.best;
                if (b.total !== a.total) return b.total - a.total;
                const aCrisis = a.topic.priority === 'crisis' ? 1 : 0;
                const bCrisis = b.topic.priority === 'crisis' ? 1 : 0;
                return bCrisis - aCrisis;
            });
            return scored[0] && scored[0].best > 0 ? scored[0].topic : null;
        }

        const crisisNote =
            '<div style="margin-top:10px;padding:10px 12px;background:var(--red-light);border-radius:12px;font-size:0.82rem;"><span class="material-symbols-rounded" translate="no" aria-hidden="true">call</span> Butuh bantuan segera? Hubungi <b>Layanan Sosial Kemensos 129</b> / WhatsApp 0811-1500-129, atau <b>SEJIWA 119 ext. 8</b> untuk dukungan psikologis. Dalam kondisi darurat/bahaya, hubungi <b>112</b>.</div>';

        function appendMsg(text, who) {
            const body = document.getElementById('chatBody');
            const div = document.createElement('div');
            div.className = 'msg ' + who;
            div.innerHTML = text;
            body.appendChild(div);
            body.scrollTop = body.scrollHeight;
        }

        function showTyping() {
            const body = document.getElementById('chatBody');
            const div = document.createElement('div');
            div.className = 'typing-indicator';
            div.id = 'typingIndicator';
            div.innerHTML = '<span></span><span></span><span></span>';
            body.appendChild(div);
            body.scrollTop = body.scrollHeight;
        }

        function hideTyping() {
            const el = document.getElementById('typingIndicator');
            if (el) el.remove();
        }

        function askRana(question) {
            appendMsg(escapeHtml(question), 'user');
            showTyping();
            setTimeout(() => {
                hideTyping();
                if (detectCrisisSignal(question)) {
                    renderCrisisResponse();
                    return;
                }
                const topic = matchTopic(question);
                let answer = topic ? topic.answer : 'Terima kasih sudah bercerita. Aku belum punya jawaban spesifik untuk itu di sini, tapi kamu bisa jelajahi modul Edukasi untuk info lebih lengkap, atau bicara langsung dengan psikolog kami jika butuh pendampingan yang lebih personal — ceritamu akan ditanggapi serius.';
                if (topic) {
                    appendMsg(answer, 'bot');
                    if (topic.priority === 'crisis') {
                        appendMsg(crisisNote, 'bot');
                    }
                    appendMsg(
                        'Mau pelajari lebih lanjut, atau lanjut cerita ke konselor/psikolog kami? <br><button class="btn btn-outline" style="margin-top:8px;margin-right:8px;padding:8px 14px;font-size:0.8rem;" onclick="goTo(\'edukasi\')"><span class="material-symbols-rounded" translate="no" aria-hidden="true">menu_book</span> Pelajari Materi</button><button class="btn btn-outline" style="margin-top:8px;padding:8px 14px;font-size:0.8rem;" onclick="goTo(\'konsultasi\')"><span class="material-symbols-rounded" translate="no" aria-hidden="true">psychology</span> Konsultasi</button>',
                        'bot'
                    );
                } else {
                    appendMsg(answer, 'bot');
                    appendMsg(
                        '<span class="material-symbols-rounded" translate="no" aria-hidden="true">lightbulb</span> Kamu bisa coba tanyakan tentang: pergaulan bebas, consent, revenge porn, keamanan digital, kesehatan mental, stres sekolah, atau masalah keluarga. Atau klik tombol di bawah untuk konsultasi langsung dengan psikolog.',
                        'bot'
                    );
                    appendMsg(
                        '<button class="btn btn-primary" style="margin-top:6px;padding:8px 16px;font-size:0.8rem;" onclick="goTo(\'konsultasi\')"><span class="material-symbols-rounded" translate="no" aria-hidden="true">psychology</span> Konsultasi Sekarang</button>',
                        'bot'
                    );
                }
            }, 600);
        }

        function sendChat() {
            const input = document.getElementById('chatInput');
            const val = input.value.trim();
            if (!val) return;
            askRana(val);
            input.value = '';
        }

        function reportToRana() {
            quickHelp('Saya mengalami penyebaran konten pribadi');
        }

        // Dipakai oleh Pusat Bantuan (halaman Data) — langsung membuka RANA AI
        // dan menanyakan topik yang relevan, supaya pengguna cepat mendapat
        // langkah-langkah aman tanpa harus mengetik ulang.
        function quickHelp(question) {
            goTo('rana');
            setTimeout(() => { askRana(question); }, 300);
        }

        // =====================================================================
        // BOOKING KONSULTASI
        // Catatan penting: WhatsApp TIDAK LAGI per-guru BK. Semua tombol
        // WhatsApp di fitur Konsultasi (Guru BK maupun Layanan Psikologis) selalu
        // diarahkan ke SATU WhatsApp Center resmi BK SMK Negeri 2 Magetan.
        // Konsultasi via email untuk Guru BK dikirim langsung ke email
        // masing-masing Guru BK yang dipilih (lihat GURU_BK_EMAILS di bawah).
        // =====================================================================
        const BK_WHATSAPP_CENTER = '6289528989835'; // +62 895-2898-9835 — WhatsApp Center resmi BK SMKN 2 Magetan
        // Email default NARA (dipakai untuk Layanan Psikologis & Kritik/Saran, serta
        // sebagai fallback jika nama Guru BK tidak ditemukan di GURU_BK_EMAILS).
        const NARA_EMAIL = 'supportnaraa@gmail.com';

        // =====================================================================
        // DAFTAR EMAIL GURU BK (konfigurasi terpusat)
        // Booking konsultasi Guru BK dikirim ke email di bawah ini sesuai
        // Guru BK yang dipilih pengguna pada modal "Pilih Guru BK".
        // =====================================================================
        const GURU_BK_EMAILS = {
            'Yulya Ambara W, S.Pd.': 'yulyabkskadama87@gmail.com',
            'Cicilia Sekar A, S.Pd.': 'ciciliasekar228@gmail.com',
            'Ismiati, S.Pd.': 'andintino01@gmail.com',
            'Dra. Purwari': 'purwaripurwari6@gmail.com',
            'Devi Primasari, S.Pd.': 'deviprimasari23@gmail.com',
            'Yuli Barasanti, S.Pd.': 'barasantiy@gmail.com'
        };

        // =====================================================================
        // DAFTAR EMAIL PSIKOLOG (konfigurasi terpusat)
        // Booking konsultasi Layanan Psikologis dikirim ke email di bawah ini sesuai
        // Layanan Psikologis yang dipilih pengguna pada modal "Pilih Layanan Psikologis".
        // =====================================================================
        const PSIKOLOG_EMAILS = {
            'Mokhamad Idris, S.Psi.': 'mokhamad37@gmail.com'
        };

        function generateAlias() {
            const num = Math.floor(1000 + Math.random() * 9000);
            return 'Pengguna_' + num;
        }

        let currentBookingPsyName = '';
        let currentBookingPsySpec = '';
        let currentBookingMethod = 'Langsung';
        let currentBookingRecipientEmail = NARA_EMAIL;

        // =====================================================================
        // BOOKING SISWA vs ORANG TUA/WALI
        // currentBookingUserType: 'student' (default) atau 'parent'.
        // currentBookingIdentityMode: 'alias' (default, privasi siswa) atau 'real'.
        // Nilai-nilai ini menentukan form mana yang tampil dan builder pesan
        // mana yang dipakai saat kirim WhatsApp/Email (lihat bagian bawah).
        // =====================================================================
        let currentBookingUserType = 'student';
        let currentBookingIdentityMode = 'alias';
        let currentBookingParentKategori = '';

        // recipientEmail bersifat opsional — jika tidak diisi, gunakan NARA_EMAIL
        // (perilaku lama tetap dipertahankan untuk pemanggilan yang tidak
        // menyertakan email tujuan spesifik, mis. konsultasi Layanan Psikologis).
        function openBooking(psyName, psySpec, recipientEmail) {
            const alias = generateAlias();
            currentBookingPsyName = psyName;
            currentBookingPsySpec = psySpec;
            currentBookingMethod = 'Langsung';
            currentBookingRecipientEmail = recipientEmail || NARA_EMAIL;
            currentBookingUserType = 'student';
            currentBookingIdentityMode = 'alias';
            currentBookingParentKategori = '';

            document.getElementById('bookingPsyName').textContent = 'Booking Konsultasi: ' + psyName;
            document.getElementById('bookingPsySpec').textContent = psySpec;
            document.getElementById('bookingAlias').textContent = alias;

            // reset form fields siswa untuk booking baru
            document.getElementById('bookNama').value = '';
            document.getElementById('bookKelas').value = '';
            document.getElementById('bookTopik').value = '';
            document.getElementById('bookTanggal').value = '';
            document.getElementById('bookWaktu').value = '';
            document.getElementById('bookPesan').value = '';
            document.querySelectorAll('.method-btn').forEach(b => b.classList.remove('active'));
            const defaultMethodBtn = document.querySelector('.method-btn[data-method="Langsung"]');
            if (defaultMethodBtn) defaultMethodBtn.classList.add('active');

            const aliasRadio = document.querySelector('input[name="bookIdentityMode"][value="alias"]');
            if (aliasRadio) aliasRadio.checked = true;

            // reset form fields orang tua/wali untuk booking baru
            const parentNama = document.getElementById('bookParentNama');
            if (parentNama) parentNama.value = '';
            const parentHubungan = document.getElementById('bookParentHubungan');
            if (parentHubungan) parentHubungan.value = '';
            const anakNama = document.getElementById('bookParentAnakNama');
            if (anakNama) anakNama.value = '';
            const anakKelas = document.getElementById('bookParentAnakKelas');
            if (anakKelas) anakKelas.value = '';
            const parentTopik = document.getElementById('bookParentTopik');
            if (parentTopik) parentTopik.value = '';
            document.querySelectorAll('.kategori-chip').forEach(b => b.classList.remove('active'));
            hideBookingFieldError('bookParentNamaError');
            hideBookingFieldError('bookParentHubunganError');

            // kembali ke langkah pemilihan jenis pengguna setiap kali modal dibuka
            const studentCard = document.getElementById('usertypeCardStudent');
            const parentCard = document.getElementById('usertypeCardParent');
            if (studentCard) studentCard.classList.remove('active');
            if (parentCard) parentCard.classList.remove('active');
            const userTypeStep = document.getElementById('bookingUserTypeStep');
            const formArea = document.getElementById('bookingFormArea');
            if (userTypeStep) userTypeStep.style.display = 'block';
            if (formArea) formArea.style.display = 'none';

            // tanggal booking tidak boleh sebelum hari ini
            const tanggalInput = document.getElementById('bookTanggal');
            if (tanggalInput) tanggalInput.min = todayDateString();
            clearBookingDateError();

            document.getElementById('bookingModal').classList.add('open');
        }

        // Dipanggil saat pengguna memilih "Saya Siswa" atau "Orang Tua / Wali"
        // pada langkah pertama modal booking. Menampilkan form yang sesuai
        // dengan transisi halus tanpa menampilkan dua form sekaligus.
        function selectBookingUserType(type) {
            currentBookingUserType = (type === 'parent') ? 'parent' : 'student';
            const isParent = currentBookingUserType === 'parent';

            const studentCard = document.getElementById('usertypeCardStudent');
            const parentCard = document.getElementById('usertypeCardParent');
            if (studentCard) studentCard.classList.toggle('active', !isParent);
            if (parentCard) parentCard.classList.toggle('active', isParent);

            const userTypeStep = document.getElementById('bookingUserTypeStep');
            const formArea = document.getElementById('bookingFormArea');
            if (userTypeStep) userTypeStep.style.display = 'none';
            if (formArea) formArea.style.display = 'block';

            const studentForm = document.getElementById('studentBookingForm');
            const parentForm = document.getElementById('parentBookingForm');
            if (studentForm) studentForm.style.display = isParent ? 'none' : 'block';
            if (parentForm) parentForm.style.display = isParent ? 'block' : 'none';

            const typeLabel = document.getElementById('bookingTypeLabel');
            if (typeLabel) typeLabel.textContent = isParent ? 'Booking Konsultasi Orang Tua / Wali' : 'Booking Konsultasi Siswa';

            const pesanLabel = document.getElementById('bookPesanLabel');
            const pesanInput = document.getElementById('bookPesan');
            if (pesanLabel) pesanLabel.textContent = isParent ? 'Ceritakan Secara Singkat' : 'Pesan tambahan (opsional)';
            if (pesanInput) {
                pesanInput.placeholder = isParent
                    ? 'Ceritakan kondisi atau hal yang ingin dikonsultasikan. Tidak perlu memasukkan informasi pribadi yang tidak diperlukan.'
                    : 'Ceritakan sedikit tentang yang ingin kamu bicarakan...';
            }

            hideBookingFieldError('bookParentNamaError');
            hideBookingFieldError('bookParentHubunganError');
            clearBookingDateError();
        }

        // Tombol kembali pada form booking — kembali ke langkah pemilihan
        // jenis pengguna tanpa menutup modal.
        function backToBookingUserType() {
            const userTypeStep = document.getElementById('bookingUserTypeStep');
            const formArea = document.getElementById('bookingFormArea');
            if (formArea) formArea.style.display = 'none';
            if (userTypeStep) userTypeStep.style.display = 'block';
        }

        // Menentukan apakah nama asli siswa disertakan pada pesan booking.
        function selectIdentityMode(mode) {
            currentBookingIdentityMode = (mode === 'real') ? 'real' : 'alias';
        }

        // Kategori permasalahan pada form orang tua bersifat opsional dan
        // hanya boleh memilih satu kategori (klik ulang untuk membatalkan).
        function toggleParentKategori(value, btn) {
            const wasActive = btn.classList.contains('active');
            document.querySelectorAll('.kategori-chip').forEach(b => b.classList.remove('active'));
            if (wasActive) {
                currentBookingParentKategori = '';
            } else {
                btn.classList.add('active');
                currentBookingParentKategori = value;
            }
        }

        function showBookingFieldError(id) {
            const el = document.getElementById(id);
            if (el) el.style.display = 'block';
        }

        function hideBookingFieldError(id) {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        }

        // Validasi field wajib sebelum pesan dikirim. Form siswa tidak
        // memiliki field wajib tambahan (nama asli tetap opsional).
        // Form orang tua/wali mewajibkan nama & hubungan dengan anak.
        function validateBookingBeforeSend() {
            if (currentBookingUserType !== 'parent') return true;

            let valid = true;
            const namaOrtu = document.getElementById('bookParentNama').value.trim();
            const hubungan = document.getElementById('bookParentHubungan').value;

            if (!namaOrtu) {
                showBookingFieldError('bookParentNamaError');
                valid = false;
            } else {
                hideBookingFieldError('bookParentNamaError');
            }

            if (!hubungan) {
                showBookingFieldError('bookParentHubunganError');
                valid = false;
            } else {
                hideBookingFieldError('bookParentHubunganError');
            }

            return valid;
        }

        // Mengubah tanggal YYYY-MM-DD menjadi format "10 September 2026".
        function formatBookingDate(dateStr) {
            if (!dateStr) return '';
            const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            const parts = dateStr.split('-');
            if (parts.length !== 3) return dateStr;
            const tahun = parts[0];
            const bulanIdx = parseInt(parts[1], 10) - 1;
            const tanggal = parseInt(parts[2], 10);
            if (!bulan[bulanIdx] || isNaN(tanggal)) return dateStr;
            return tanggal + ' ' + bulan[bulanIdx] + ' ' + tahun;
        }

        // Mengembalikan tanggal hari ini dalam format YYYY-MM-DD (waktu lokal)
        function todayDateString() {
            const now = new Date();
            const y = now.getFullYear();
            const m = String(now.getMonth() + 1).padStart(2, '0');
            const d = String(now.getDate()).padStart(2, '0');
            return y + '-' + m + '-' + d;
        }

        // Validasi: tanggal & waktu konsultasi tidak boleh sudah lewat.
        // Jika tanggal tidak diisi, dianggap valid (field opsional).
        function isBookingScheduleValid() {
            const tanggal = document.getElementById('bookTanggal').value;
            if (!tanggal) return true;

            const waktu = document.getElementById('bookWaktu').value;
            const scheduled = new Date(tanggal + 'T' + (waktu || '00:00'));
            const now = new Date();

            if (!waktu) {
                // hanya tanggal diisi: bandingkan per-hari, hari ini masih dianggap valid
                const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                return scheduled >= todayOnly;
            }
            return scheduled >= now;
        }

        function showBookingDateError() {
            const err = document.getElementById('bookTanggalError');
            if (err) err.style.display = 'block';
        }

        function clearBookingDateError() {
            const err = document.getElementById('bookTanggalError');
            if (err) err.style.display = 'none';
        }

        function selectBookingMethod(method, btn) {
            currentBookingMethod = method;
            document.querySelectorAll('.method-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }

        // =====================================================================
        // MESSAGE BUILDERS
        // Dipisah berdasarkan jenis pengguna (siswa / orang tua-wali) agar
        // format WhatsApp & email tetap sesuai kebutuhan masing-masing, dan
        // dipanggil oleh sendBookingWa()/sendBookingEmail() berdasarkan
        // currentBookingUserType. Field yang kosong tidak pernah ditampilkan
        // sebagai baris kosong pada pesan.
        // =====================================================================

        // Isi untuk email siswa (baris demi baris, digabung oleh pemanggil).
        function buildStudentBookingMessage() {
            const alias = document.getElementById('bookingAlias').textContent.trim();
            const nama = document.getElementById('bookNama').value.trim();
            const kelas = document.getElementById('bookKelas').value.trim();
            const topik = document.getElementById('bookTopik').value.trim();
            const tanggal = document.getElementById('bookTanggal').value;
            const waktu = document.getElementById('bookWaktu').value;
            const pesan = document.getElementById('bookPesan').value.trim();

            const lines = [
                'Halo, saya ingin booking konsultasi dengan ' + currentBookingPsyName + ' (' + currentBookingPsySpec + ').',
                'Jenis konsultasi: Siswa'
            ];
            if (currentBookingIdentityMode === 'real' && nama) {
                lines.push('Nama: ' + nama);
                lines.push('Nama samaran: ' + alias);
            } else {
                lines.push('Nama samaran: ' + alias + ' (identitas asli tidak dicantumkan demi privasi).');
            }
            if (kelas) lines.push('Kelas: ' + kelas);
            if (topik) lines.push('Topik konsultasi: ' + topik);
            if (tanggal) lines.push('Tanggal: ' + formatBookingDate(tanggal));
            if (waktu) lines.push('Waktu: ' + waktu);
            lines.push('Metode konsultasi: ' + currentBookingMethod);
            if (pesan) lines.push('Pesan tambahan: ' + pesan);
            return lines;
        }

        // Isi untuk email orang tua/wali.
        function buildParentBookingMessage() {
            const namaOrtu = document.getElementById('bookParentNama').value.trim();
            const hubungan = document.getElementById('bookParentHubungan').value;
            const namaAnak = document.getElementById('bookParentAnakNama').value.trim();
            const kelasAnak = document.getElementById('bookParentAnakKelas').value.trim();
            const topik = document.getElementById('bookParentTopik').value.trim();
            const tanggal = document.getElementById('bookTanggal').value;
            const waktu = document.getElementById('bookWaktu').value;
            const pesan = document.getElementById('bookPesan').value.trim();

            const lines = [
                'Halo, saya orang tua/wali siswa dan ingin booking konsultasi dengan ' + currentBookingPsyName + ' (' + currentBookingPsySpec + ').',
                'Jenis konsultasi: Orang Tua / Wali'
            ];
            if (namaOrtu) lines.push('Nama orang tua/wali: ' + namaOrtu);
            if (hubungan) lines.push('Hubungan dengan anak: ' + hubungan);
            lines.push('Nama anak: ' + (namaAnak || 'Disamarkan'));
            if (kelasAnak) lines.push('Kelas anak: ' + kelasAnak);
            if (currentBookingParentKategori) lines.push('Kategori: ' + currentBookingParentKategori);
            if (topik) lines.push('Topik konsultasi: ' + topik);
            if (tanggal) lines.push('Tanggal: ' + formatBookingDate(tanggal));
            if (waktu) lines.push('Waktu: ' + waktu);
            lines.push('Metode konsultasi: ' + currentBookingMethod);
            if (pesan) lines.push('Pesan tambahan: ' + pesan);
            return lines;
        }

        // Pesan WhatsApp SELALU menuju WhatsApp Center resmi BK, bukan nomor
        // pribadi guru BK. Baris pembuka mengikuti format wajib (menyebut
        // guru BK yang dipilih), lalu detail form booking (yang diisi user)
        // disertakan sebagai konteks tambahan agar admin/guru BK tidak perlu
        // tanya ulang dari awal. Format detail berbeda untuk siswa vs orang tua.
        function buildStudentWaMessage() {
            const namaGuru = (currentBookingPsyName || '').trim();
            const lines = [];

            if (namaGuru) {
                lines.push('Halo, saya ingin berkonsultasi dengan Guru BK SMK Negeri 2 Magetan.');
                lines.push('Saya ingin berkonsultasi dengan ' + namaGuru + '. Mohon bantuan untuk menghubungkan saya dengan Guru BK yang bersangkutan.');
            } else {
                lines.push('Halo, saya ingin berkonsultasi dengan Guru BK SMK Negeri 2 Magetan.');
                lines.push('Mohon bantuan untuk proses konsultasi saya.');
            }

            const aliasEl = document.getElementById('bookingAlias');
            const alias = aliasEl ? aliasEl.textContent.trim() : '';
            const nama = document.getElementById('bookNama').value.trim();
            const kelas = document.getElementById('bookKelas').value.trim();
            const topik = document.getElementById('bookTopik').value.trim();
            const tanggal = document.getElementById('bookTanggal').value;
            const waktu = document.getElementById('bookWaktu').value;
            const pesan = document.getElementById('bookPesan').value.trim();

            const detail = ['Jenis konsultasi: Siswa'];
            if (currentBookingIdentityMode === 'real' && nama) {
                detail.push('Nama: ' + nama);
            }
            if (alias) detail.push('Nama samaran: ' + alias);
            if (kelas) detail.push('Kelas: ' + kelas);
            if (topik) detail.push('Topik konsultasi: ' + topik);
            if (tanggal) detail.push('Tanggal diinginkan: ' + formatBookingDate(tanggal));
            if (waktu) detail.push('Waktu diinginkan: ' + waktu);
            if (currentBookingMethod) detail.push('Metode konsultasi: ' + currentBookingMethod);
            if (pesan) detail.push('Pesan tambahan: ' + pesan);

            lines.push('');
            lines.push('Detail booking:');
            lines.push(...detail);
            return lines.join('\n');
        }

        function buildParentWaMessage() {
            const namaGuru = (currentBookingPsyName || '').trim();
            const lines = [];

            if (namaGuru) {
                lines.push('Halo, saya orang tua/wali siswa dan ingin melakukan konsultasi dengan Guru BK SMK Negeri 2 Magetan.');
                lines.push('Saya ingin berkonsultasi dengan ' + namaGuru + '. Mohon bantuan untuk menghubungkan saya dengan Guru BK yang bersangkutan.');
            } else {
                lines.push('Halo, saya orang tua/wali siswa dan ingin melakukan konsultasi dengan Guru BK SMK Negeri 2 Magetan.');
                lines.push('Mohon bantuan untuk proses konsultasi saya.');
            }

            const namaOrtu = document.getElementById('bookParentNama').value.trim();
            const hubungan = document.getElementById('bookParentHubungan').value;
            const namaAnak = document.getElementById('bookParentAnakNama').value.trim();
            const kelasAnak = document.getElementById('bookParentAnakKelas').value.trim();
            const topik = document.getElementById('bookParentTopik').value.trim();
            const tanggal = document.getElementById('bookTanggal').value;
            const waktu = document.getElementById('bookWaktu').value;
            const pesan = document.getElementById('bookPesan').value.trim();

            const detail = ['Jenis konsultasi: Orang Tua / Wali'];
            if (namaOrtu) detail.push('Nama orang tua/wali: ' + namaOrtu);
            if (hubungan) detail.push('Hubungan dengan anak: ' + hubungan);
            detail.push('Nama anak: ' + (namaAnak || 'Disamarkan'));
            if (kelasAnak) detail.push('Kelas anak: ' + kelasAnak);
            if (currentBookingParentKategori) detail.push('Kategori: ' + currentBookingParentKategori);
            if (topik) detail.push('Topik konsultasi: ' + topik);
            if (tanggal) detail.push('Tanggal diinginkan: ' + formatBookingDate(tanggal));
            if (waktu) detail.push('Waktu diinginkan: ' + waktu);
            if (currentBookingMethod) detail.push('Metode konsultasi: ' + currentBookingMethod);
            if (pesan) detail.push('Pesan tambahan: ' + pesan);

            lines.push('');
            lines.push('Detail booking:');
            lines.push(...detail);
            lines.push('');
            lines.push('Terima kasih.');
            return lines.join('\n');
        }

        function sendBookingWa() {
            if (!isBookingScheduleValid()) {
                showBookingDateError();
                return;
            }
            if (!validateBookingBeforeSend()) return;
            clearBookingDateError();
            const waText = encodeURIComponent(
                currentBookingUserType === 'parent' ? buildParentWaMessage() : buildStudentWaMessage()
            );
            window.open('https://wa.me/' + BK_WHATSAPP_CENTER + '?text=' + waText, '_blank', 'noopener');
        }

        function sendBookingEmail() {
            if (!isBookingScheduleValid()) {
                showBookingDateError();
                return;
            }
            if (!validateBookingBeforeSend()) return;
            clearBookingDateError();
            const isParent = currentBookingUserType === 'parent';
            const subjectPrefix = isParent ? 'Booking Konsultasi Orang Tua/Wali - ' : 'Booking Konsultasi Siswa - ';
            const bodyLines = isParent ? buildParentBookingMessage() : buildStudentBookingMessage();
            const subject = encodeURIComponent(subjectPrefix + currentBookingPsyName);
            const body = encodeURIComponent(bodyLines.join('\n') + '\n\nTerima kasih.');
            const recipient = currentBookingRecipientEmail || NARA_EMAIL;
            window.location.href = 'mailto:' + recipient + '?subject=' + subject + '&body=' + body;
        }

        function closeBooking() {
            document.getElementById('bookingModal').classList.remove('open');
        }

        // =====================================================================
        // PEMILIHAN KONSELOR
        // =====================================================================
        const counselorData = {
            gurubk: {
                title: 'Pilih Guru BK',
                sub: 'Guru BK SMKN 2 Magetan',
                roleLabel: 'Guru BK SMKN 2 Magetan',
                avatar: '<span class="material-symbols-rounded" translate="no" aria-hidden="true">school</span>',
                names: Object.keys(GURU_BK_EMAILS)
            },
            psikolog: {
                title: 'Pilih Layanan Psikologis',
                sub: 'Layanan Psikologis Mitra NARA',
                roleLabel: 'Layanan Psikologis',
                avatar: '<span class="material-symbols-rounded" translate="no" aria-hidden="true">psychology</span>',
                names: ['Mokhamad Idris, S.Psi.']
            }
        };
        let selectedCounselorCategory = null;
        let selectedCounselorName = null;

        function openCounselorSelect(category) {
            selectedCounselorCategory = category;
            selectedCounselorName = null;
            const data = counselorData[category];
            document.getElementById('counselorModalTitle').textContent = data.title;
            document.getElementById('counselorModalSub').textContent = data.sub;
            renderCounselorList();
            document.getElementById('counselorInfoPanel').style.display = 'none';
            document.getElementById('counselorList').style.display = 'flex';
            document.getElementById('counselorModal').classList.add('open');
        }

        function renderCounselorList() {
            const data = counselorData[selectedCounselorCategory];
            const list = document.getElementById('counselorList');
            list.innerHTML = '';
            data.names.forEach(name => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'counselor-item';
                btn.innerHTML =
                    `<div class="counselor-item-avatar">${data.avatar}</div><div class="counselor-item-info"><div class="name">${name}</div><div class="role">${data.roleLabel}</div></div><div class="arrow">›</div>`;
                btn.onclick = () => selectCounselor(name);
                list.appendChild(btn);
            });
        }

        function selectCounselor(name) {
            selectedCounselorName = name;
            const data = counselorData[selectedCounselorCategory];
            document.getElementById('counselorList').style.display = 'none';
            document.getElementById('counselorInfoAvatar').innerHTML = data.avatar;
            document.getElementById('counselorInfoName').textContent = name;
            document.getElementById('counselorInfoRole').textContent = data.roleLabel;
            document.getElementById('counselorInfoPanel').style.display = 'block';
        }

        function backToCounselorList() {
            document.getElementById('counselorInfoPanel').style.display = 'none';
            document.getElementById('counselorList').style.display = 'flex';
        }

        function confirmCounselorBooking() {
            const data = counselorData[selectedCounselorCategory];
            closeCounselorSelect();
            // Guru BK: kirim ke email Guru BK yang dipilih. Layanan Psikologis: kirim ke
            // email Layanan Psikologis yang dipilih (lihat PSIKOLOG_EMAILS). Kategori
            // lain tetap memakai NARA_EMAIL seperti sebelumnya (openBooking
            // akan fallback otomatis jika recipientEmail tidak diberikan).
            let recipientEmail;
            if (selectedCounselorCategory === 'gurubk') {
                recipientEmail = GURU_BK_EMAILS[selectedCounselorName];
            } else if (selectedCounselorCategory === 'psikolog') {
                recipientEmail = PSIKOLOG_EMAILS[selectedCounselorName];
            }
            openBooking(selectedCounselorName, data.roleLabel, recipientEmail);
        }

        function closeCounselorSelect() {
            document.getElementById('counselorModal').classList.remove('open');
        }

        // =====================================================================
        // LAYANAN PSIKOLOGIS — Healing119/SEJIWA
        // Alur: modal #healingModal STEP 1 (pilih kategori: Siswa / Orang Tua /
        // Umum) -> STEP 2 (halaman layanan/form sesuai kategori, dengan tombol
        // "Kembali" ke STEP 1) -> tombol "Lanjut ke WhatsApp Healing119"
        // membuka WhatsApp Healing119/SEJIWA dengan pesan otomatis yang sesuai.
        // Tidak ada pemilihan psikolog maupun form booking manual di sini, dan
        // tidak ada halaman website Healing119 yang dibuka lebih dulu.
        // =====================================================================
        const HEALING119_WHATSAPP = '6281380073120'; // WhatsApp Healing119/SEJIWA

        const HEALING119_MESSAGES = {
            student: 'Halo Healing119, saya mengakses layanan melalui aplikasi NARA. Saya adalah siswa dan ingin mendapatkan dukungan psikologis.',
            parent: 'Halo Healing119, saya mengakses layanan melalui aplikasi NARA. Saya adalah orang tua/wali dan ingin mendapatkan dukungan psikologis.',
            general: 'Halo Healing119, saya mengakses layanan melalui aplikasi NARA dan ingin mendapatkan dukungan psikologis.'
        };

        // Konten STEP 2 (halaman layanan/form) untuk masing-masing kategori.
        const HEALING119_CATEGORY_INFO = {
            student: {
                title: 'Layanan Psikologis — Siswa',
                icon: 'person',
                desc: 'Bicarakan perasaan, stres sekolah, pertemanan, atau masalah pribadi lainnya secara rahasia bersama Healing119/SEJIWA.'
            },
            parent: {
                title: 'Layanan Psikologis — Orang Tua',
                icon: 'family_restroom',
                desc: 'Dapatkan pendampingan dalam menghadapi masalah anak dan cara terbaik mendukung kondisi psikologisnya bersama Healing119/SEJIWA.'
            },
            general: {
                title: 'Layanan Psikologis — Umum',
                icon: 'groups',
                desc: 'Layanan dukungan psikologis Healing119/SEJIWA terbuka untuk siapa saja yang membutuhkan teman bicara.'
            }
        };

        let selectedHealingCategory = null;

        // Membuka modal Layanan Psikologis, selalu mulai dari STEP 1
        // (pilihan kategori), apa pun state sebelumnya.
        function openHealingChoice() {
            selectedHealingCategory = null;
            const step1 = document.getElementById('healingStep1');
            const step2 = document.getElementById('healingStep2');
            if (step1) step1.classList.remove('healing-step-hidden');
            if (step2) step2.classList.add('healing-step-hidden');
            document.getElementById('healingModal').classList.add('open');
        }

        function closeHealingChoice() {
            document.getElementById('healingModal').classList.remove('open');
        }

        // Dipanggil saat pengguna memilih Siswa / Orang Tua / Umum pada
        // STEP 1. Menampilkan STEP 2 (halaman layanan/form) sesuai kategori.
        function selectHealingCategory(type) {
            const info = HEALING119_CATEGORY_INFO[type] || HEALING119_CATEGORY_INFO.student;
            selectedHealingCategory = HEALING119_CATEGORY_INFO[type] ? type : 'student';

            const titleEl = document.getElementById('healingStepTitle');
            const iconEl = document.getElementById('healingServiceIcon');
            const descEl = document.getElementById('healingServiceDesc');
            if (titleEl) titleEl.textContent = info.title;
            if (iconEl) iconEl.textContent = info.icon;
            if (descEl) descEl.textContent = info.desc;

            const step1 = document.getElementById('healingStep1');
            const step2 = document.getElementById('healingStep2');
            if (step1) step1.classList.add('healing-step-hidden');
            if (step2) step2.classList.remove('healing-step-hidden');
        }

        // Tombol "Kembali": dari STEP 2 kembali ke STEP 1 (pilihan kategori).
        function backToHealingChoice() {
            selectedHealingCategory = null;
            const step1 = document.getElementById('healingStep1');
            const step2 = document.getElementById('healingStep2');
            if (step2) step2.classList.add('healing-step-hidden');
            if (step1) step1.classList.remove('healing-step-hidden');
        }

        // Tombol "Lanjut ke WhatsApp Healing119" pada STEP 2: membuka
        // WhatsApp Healing119/SEJIWA dengan pesan otomatis sesuai kategori.
        function proceedHealingWhatsApp() {
            const type = selectedHealingCategory || 'student';
            const message = HEALING119_MESSAGES[type] || HEALING119_MESSAGES.student;
            const waUrl = 'https://wa.me/' + HEALING119_WHATSAPP + '?text=' + encodeURIComponent(message);
            closeHealingChoice();
            window.open(waUrl, '_blank', 'noopener');
        }

        // =====================================================================
        // KRITIK & SARAN — mengarahkan pengguna ke aplikasi email mereka
        // (mailto:) yang ditujukan ke tim developer NARA. Tidak ada backend,
        // tidak ada penyimpanan, dan tidak ada notifikasi "berhasil terkirim"
        // palsu — pengiriman sebenarnya terjadi lewat aplikasi email pengguna.
        // =====================================================================
        const LAPOR_DEVELOPER_EMAIL = 'supportnaraa@gmail.com';

        function initLaporPage() {
            const isiEl = document.getElementById('laporIsi');
            if (isiEl) isiEl.value = '';
            const isiErr = document.getElementById('laporIsiError');
            if (isiErr) isiErr.style.display = 'none';
        }

        // ---- KIRIM KRITIK & SARAN ----
        function submitLaporReport() {
            const isiEl = document.getElementById('laporIsi');
            if (!isiEl) return;

            const isi = isiEl.value.trim();
            const isiErr = document.getElementById('laporIsiError');

            if (!isi) {
                if (isiErr) isiErr.style.display = 'block';
                isiEl.focus();
                return;
            }
            if (isiErr) isiErr.style.display = 'none';

            const subject = 'Kritik & Saran NARA';
            const body = [
                'Halo Tim Developer NARA,',
                '',
                'Saya ingin menyampaikan kritik/saran berikut:',
                '',
                isi,
                '',
                'Terima kasih.'
            ].join('\n');

            const mailtoUrl = 'mailto:' + LAPOR_DEVELOPER_EMAIL
                + '?subject=' + encodeURIComponent(subject)
                + '&body=' + encodeURIComponent(body);

            window.location.href = mailtoUrl;
        }


        // =====================================================================
        // INISIALISASI
        // =====================================================================
        document.addEventListener('DOMContentLoaded', function() {
            updateUjiCards();
            updateStreak();

            const activePage = document.querySelector('.page.active');
            if (activePage) {
                const id = activePage.id;
                if (id === 'page-cek') initHubungankuQuiz();
                if (id === 'page-pertemanan') initPertemananQuiz();
                if (id === 'page-moodquest') checkMoodQuestToday();
                if (id === 'page-pergaulanuji') initScenarioGame();
                if (id === 'page-pergaulanbebasuji') checkPergaulanBebasToday();
                if (id === 'page-digitaluji') checkDigitalToday();
                if (id === 'page-aiuji') checkAiToday();
            }
        });

        // Override goTo
        const origGoTo = goTo;
        goTo = function(page) {
            origGoTo(page);
            setTimeout(() => {
                if (page === 'cek') initHubungankuQuiz();
                if (page === 'pertemanan') initPertemananQuiz();
                if (page === 'moodquest') checkMoodQuestToday();
                if (page === 'pergaulanuji') initScenarioGame();
                if (page === 'pergaulanbebasuji') checkPergaulanBebasToday();
                if (page === 'digitaluji') checkDigitalToday();
                if (page === 'aiuji') checkAiToday();
                updateUjiCards();
                updateStreak();
            }, 150);
        };

        // =====================================================================
        // CAROUSEL "UJI PEMAHAMANMU" — indikator titik & snap-to-tap
        // =====================================================================
        (function initUjiCarousel() {
            const track = document.getElementById('ujiGrid');
            const dotsWrap = document.getElementById('ujiDots');
            if (!track || !dotsWrap) return;

            const dots = Array.from(dotsWrap.querySelectorAll('.uji-dot'));
            let ticking = false;

            function activeIndexByScroll() {
                const cards = track.querySelectorAll('.game-mission-card');
                let closestIndex = 0;
                let closestDist = Infinity;
                cards.forEach(function(card, i) {
                    const dist = Math.abs(card.offsetLeft - track.scrollLeft);
                    if (dist < closestDist) {
                        closestDist = dist;
                        closestIndex = i;
                    }
                });
                return closestIndex;
            }

            function setActiveDot(index) {
                dots.forEach(function(dot, i) {
                    dot.classList.toggle('is-active', i === index);
                });
            }

            track.addEventListener('scroll', function() {
                if (ticking) return;
                ticking = true;
                requestAnimationFrame(function() {
                    setActiveDot(activeIndexByScroll());
                    ticking = false;
                });
            }, { passive: true });

            dots.forEach(function(dot, i) {
                dot.addEventListener('click', function() {
                    const cards = track.querySelectorAll('.game-mission-card');
                    const target = cards[i];
                    if (target) {
                        track.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
                    }
                });
            });

            window.addEventListener('resize', function() {
                setActiveDot(activeIndexByScroll());
            });
        })();

        // ===== Riwayat navigasi (tombol Back) =====
        document.addEventListener('DOMContentLoaded', function initNaraHistory() {
            const startHash = (location.hash || '').replace('#', '');
            const valid = startHash && document.getElementById('page-' + startHash);
            try { history.replaceState({ page: 'beranda' }, '', location.pathname + location.search); } catch (e) {}
            if (valid && startHash !== 'beranda') {
                goTo(startHash);
            }
            window.addEventListener('popstate', function (e) {
                const p = (e.state && e.state.page) || 'beranda';
                goTo(p, true);
            });
        });

        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('sw.js').catch(() => {});
            });
        }

        console.log('<span class="material-symbols-rounded" translate="no" aria-hidden="true">favorite</span> NARA — Navigasi Aman Remaja siap membantu.');
