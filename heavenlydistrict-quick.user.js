// ==UserScript==
// @name         #day HeavenlyDistrict Auto + Anti Adblock
// @icon         https://heavenlydistrict.vip/assets/logo-gfyiumpz.png
// @namespace    http://tampermonkey.net/
// @version      5.3
// @updateURL    https://raw.githubusercontent.com/ardieperdana/tampermonkey-script/main/heavenlydistrict-quick.user.js
// @downloadURL  https://raw.githubusercontent.com/ardieperdana/tampermonkey-script/main/heavenlydistrict-quick.user.js
// @match        https://heavenlydistrict.vip/d/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    const isDetailPage = () => location.pathname.startsWith('/d/');

    // ==========================================
    // 1. ULTRA ANTI ADBLOCK & AD BLOCKER (FINAL)
    // ==========================================
    function nukeAdblock() {
        // --- BLOKIR IKLAN A-ADS (UPDATE) ---
        // Hapus container utama berdasarkan ID
        document.querySelectorAll('#aads-banner-slot').forEach(el => el.remove());
        // Hapus iframe jika masih lolos menggunakan selector src a-ads
        document.querySelectorAll('iframe[src*="a-ads.com"]').forEach(el => el.remove());

        // --- ANTI-ADBLOCK BYPASS ---
        // Remove overlay utama web
        document.querySelectorAll('#adbock-wall-heavenly').forEach(el => el.remove());

        // Remove semua overlay fixed brutal
        document.querySelectorAll('*').forEach(el => {
            const style = getComputedStyle(el);
            if (
                style.position === 'fixed' &&
                parseInt(style.zIndex) >= 999 &&
                (el.offsetWidth >= window.innerWidth * 0.9 && el.offsetHeight >= window.innerHeight * 0.9)
            ) {
                el.remove();
            }
        });

        // Kill script sumber pelacak adblock
        document.querySelectorAll('script[src*="warpcapessecretly"]').forEach(s => s.remove());

        // Unlock total scrolling & touch
        if (document.body) {
            document.body.classList.remove('no-touch');
            document.body.style.overflow = 'auto';
            document.body.style.pointerEvents = 'auto';
        }
        if (document.documentElement) {
            document.documentElement.style.overflow = 'auto';
            document.documentElement.style.pointerEvents = 'auto';
        }
    }

    // Jalankan nukeAdblock berkala & pakai MutationObserver sebagai backup
    setInterval(nukeAdblock, 500);

    const observer = new MutationObserver(nukeAdblock);
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    // ==========================================
    // 2. TEMPLATE KOMENTAR
    // ==========================================
    const templates = [
"Izin sedot gan, sekalian manasin supra bapak", "Jejak dulu gan, sambil ganti oli gardan Megapro",
"Mantap share-nya, kebetulan lagi nyari kampas rem Vario", "Langsung download, tapi bentar ngecek ban serep Pajero Sport dulu",
"Wah dapet harta karun nih, tuker tambah sama spion Scoopy kiri bisa gan?", "Izin amankan file, mumpung karburator RX King lagi dibersihin",
"Mantap gan, langsung gua save di kalkulator Casio", "Izin comot gan, mau gua burning ke disket",
"Makasih ya, lumayan file-nya buat ganjel pintu kulkas", "File-nya aman kan gan? Gak bikin kipas angin di rumah muter kebalik?",
"Izin download, mau gua print terus gua tempel di ruang tamu", "Izin download gan, mau ngecek ada khodamnya apa enggak",
"Save dulu dah, nunggu tukang siomay lewat baru berani buka", "Download sekarang sebelum di-take down sama RT setempat",
"Gua amankan dulu, nunggu gerhana matahari total baru berani di-ekstrak", "Mantap jiwa, sembur air yasin dulu biar file-nya gak corrupt",
"Sedot dulu gan, kebetulan Indomie kuah gua udah mateng", "Makasih link-nya, semoga bapak lu menang lomba burung kicau tingkat RW",
"Izin save, nunggu kucing gua beranak kembar tiga baru buka password rar", "Keren parah, langsung gua download sambil kayang",
"Akhirnya nemu juga, otw nyeduh tolak angin pake es batu"
    ];

    function getRandomTemplate() {
        return templates[Math.floor(Math.random() * templates.length)];
    }

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // ==========================================
    // 3. MAIN AUTOMATION
    // ==========================================
    async function runAutomation() {
        console.log("🚀 Automation Started");

        const openBtn = document.querySelector('button.SplitDropdown-button i.fa-reply')?.closest('button');
        if (!openBtn) {
            console.log("❌ Tombol Balas tidak ditemukan");
            return;
        }

        openBtn.click();
        await sleep(1000);

        const textarea = document.querySelector('textarea');
        if (!textarea) {
            console.log("❌ Textarea tidak ditemukan");
            return;
        }

        textarea.value = getRandomTemplate();
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.focus();

        await sleep(1000);

        const submitBtn = document.querySelector('button[itemclassname="App-primaryControl"]');
        if (!submitBtn) {
            console.log("❌ Submit button tidak ditemukan");
            return;
        }

        submitBtn.click();
        console.log("✅ Comment Submitted");

        await sleep(3500);

        const firstPostBtn = document.querySelector('a.Scrubber-first');
        if (firstPostBtn) {
            firstPostBtn.click();
            console.log("✅ Postingan Awal diklik");
        }

        await sleep(1000);

        const replyToSee = document.querySelector('.xx2see.reply');
        if (replyToSee) {
            replyToSee.scrollIntoView({ behavior: 'smooth', block: 'center' });
            console.log("✅ Scroll ke Reply to See");
        }

        await sleep(1500);

        const likeBtn = [...document.querySelectorAll('button.Button--link span.Button-label')]
            .find(el => el.textContent.trim().toLowerCase() === 'suka');

        if (likeBtn) {
            likeBtn.closest('button').click();
            console.log("✅ Tombol Suka diklik");
        } else {
            console.log("❌ Tombol Suka tidak ditemukan");
        }

        console.log("🎯 Automation Finished");
    }

    // ==========================================
    // 4. FLOATING BUTTON
    // ==========================================
    function initButton() {
        if (!document.body) return;
        if (document.getElementById("ardie-auto-btn")) return;

        const btn = document.createElement("button");
        btn.id = "ardie-auto-btn";
        btn.innerText = "🚀 AUTO";

        btn.style.position = "fixed";
        btn.style.right = "20px";
        btn.style.top = "50%";
        btn.style.transform = "translateY(-50%)";
        btn.style.padding = "14px 18px";
        btn.style.background = "#ff4d6d";
        btn.style.color = "#fff";
        btn.style.border = "none";
        btn.style.borderRadius = "30px";
        btn.style.cursor = "pointer";
        btn.style.zIndex = "999999";
        btn.style.boxShadow = "0 4px 10px rgba(0,0,0,0.3)";

        btn.onclick = runAutomation;

        document.body.appendChild(btn);
    }

    setInterval(() => {
        if (isDetailPage()) {
            initButton();
        } else {
            const btn = document.getElementById("ardie-auto-btn");
            if (btn) btn.remove();
        }
    }, 1000);
})();
