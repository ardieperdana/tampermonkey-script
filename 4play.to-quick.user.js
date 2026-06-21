// ==UserScript==
// @name         #day 4Play AUTO (GODMODE VERSION)
// @namespace    ardie
// @version      7.0
// @icon         https://4play.to/assets/logo-gafv6ktz.png
// @match        *://4play.to/koleksi/*
// @match        *://4play.to/*
// @updateURL    https://raw.githubusercontent.com/ardieperdana/tampermonkey-script/main/4play.to-quick.user.js
// @downloadURL  https://raw.githubusercontent.com/ardieperdana/tampermonkey-script/main/4play.to-quick.user.js
// @grant        none
// @run-at       document-end
// @all-frames   true
// ==/UserScript==

(function() {
    'use strict';

// Mengganti fungsi deteksi URL lama dengan deteksi elemen tombol balas
const isDetailPage = () => {
    return document.querySelector('.reply2see_reply') !== null ||
           document.querySelector('.ReplyPlaceholder') !== null ||
           document.querySelector('button.SplitDropdown-button') !== null;
};

    // ==========================================
    // 1. ANTI ADBLOCK & OVERLAY NUKE (4PLAY)
    // ==========================================
    function nuke4PlayAds() {
        // Hapus overlay transparan pembajak klik jika ada
        document.querySelectorAll('div[style*="position: fixed"][style*="z-index"]').forEach(el => {
            const style = getComputedStyle(el);
            if (parseInt(style.zIndex) >= 999 && el.offsetWidth >= window.innerWidth * 0.9) {
                el.remove();
            }
        });

        // Paksa unlock scrolling body jika terkunci anti-adblock
        if (document.body) {
            document.body.style.overflow = 'auto';
            document.body.style.pointerEvents = 'auto';
        }
    }
    setInterval(nuke4PlayAds, 1000);

    // ==========================================
    // 2. TEMPLATE KOMENTAR
    // ==========================================
    const templates = [
        "Ini yang gua cari-cari, save dulu ya", "Mantap admin",
        "Gila keren sih, gua download dulu", "Makasih banget udah share, kepake nih",
        "Ini legit banget, gua simpen dulu", "Mantap parah, izin ambil ya bro",
        "Wah dapet harta karun nih, thanks ya", "Nice banget ini, langsung gua amankan",
        "Ini sih legit, thanks banyak bro", "Akhirnya nemu juga, langsung save",
        "Mantap, ini yang gua butuhin", "Wah jarang ada yang share beginian",
        "Auto download ini mah", "Keren sih, langsung masuk koleksi",
        "Ini sih wajib disimpen", "Thanks ya, kepake banget ini",
        "Baru nemu, langsung gas download", "Mantap banget share-nya",
        "Ini sih gak boleh kelewat", "Wah mantap, langsung gua ambil",
        "Ini yang gua cari dari kemarin", "Gila ini lengkap banget",
        "Auto save sebelum hilang", "Keren banget sih, makasih ya"
    ];

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    // ==========================================
    // 3. MAIN AUTOMATION FLOW
    // ==========================================
    async function run4PlayAutomation() {
        console.log("🚀 4Play Automation Started");

        // STEP 1: Klik Balas / Reply
        const replyBtn = document.querySelector('.reply2see_reply') || document.querySelector('button.SplitDropdown-button');
        if (!replyBtn) {
            console.log("❌ Tombol balas tidak ditemukan");
            return;
        }
        replyBtn.click();
        console.log("✅ Klik balas");
        await sleep(1200);

        // STEP 2: Isi Komentar & Trigger Event
        const textarea = document.querySelector('textarea');
        if (!textarea) {
            console.log("❌ Textarea tidak ditemukan");
            return;
        }

        textarea.value = templates[Math.floor(Math.random() * templates.length)];
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.focus(); // 🌟 KUNCI: Supaya system web tahu kita beneran ngetik
        await sleep(1000);

        // STEP 3: Submit Komentar
        const submitBtn = document.querySelector('button.Composer-submit') ||
                          document.querySelector('button[itemclassname="App-primaryControl"]') ||
                          document.querySelector('button.Button--primary');

        if (!submitBtn) {
            console.log("❌ Tombol submit tidak ditemukan");
            return;
        }
        submitBtn.click();
        console.log("✅ Comment dikirim");
        await sleep(2000); // Beri jeda sedikit lebih lama untuk proses submit network

        // STEP 4: Kembali ke Postingan Utama (Biar ga stuck di paling bawah page)
        const firstPostBtn = document.querySelector('a.Scrubber-first');
        if (firstPostBtn) {
            firstPostBtn.click();
            console.log("✅ Kembali ke Postingan Awal");
            await sleep(1000);
        }

        // STEP 5: Auto Scroll ke konten tersembunyi yang sekarang sudah terbuka
        const hiddenContent = document.querySelector('.reply2see') || document.querySelector('.bbcode-hide');
        if (hiddenContent) {
            hiddenContent.scrollIntoView({ behavior: 'smooth', block: 'center' });
            console.log("✅ Scroll ke konten tersembunyi");
            await sleep(1000);
        }

        // STEP 6: Refresh Halaman untuk memastikan konten render ulang sempurna
        console.log("🔄 Refreshing page...");
        location.reload();
    }

    // ==========================================
    // 4. FLOATING BUTTON MANAGEMENT
    // ==========================================
    function createButton() {
        if (!document.body || document.getElementById("ardie-4play-btn")) return;

        const btn = document.createElement("button");
        btn.id = "ardie-4play-btn";
        btn.innerText = "🚀 4PLAY";

        btn.style.position = "fixed";
        btn.style.right = "20px";
        btn.style.top = "60%";
        btn.style.zIndex = "999999";
        btn.style.padding = "14px 18px";
        btn.style.background = "#ff4d6d";
        btn.style.color = "#fff";
        btn.style.border = "none";
        btn.style.borderRadius = "30px";
        btn.style.cursor = "pointer";
        btn.style.boxShadow = "0 4px 10px rgba(0,0,0,0.3)";
        btn.style.fontWeight = "bold";

        btn.onclick = run4PlayAutomation;
        document.body.appendChild(btn);
    }

    // Hanya munculkan tombol jika berada di halaman detail thread/diskusi
    setInterval(() => {
        if (isDetailPage()) {
            createButton();
        } else {
            const btn = document.getElementById("ardie-4play-btn");
            if (btn) btn.remove();
        }
    }, 1000);

})();
