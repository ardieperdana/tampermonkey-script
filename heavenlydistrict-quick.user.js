// ==UserScript==
// @name         HeavenlyDistrict Manual Auto + Anti Adblock GODMODE
// @namespace    http://tampermonkey.net/
// @version      5.0
// @updateURL   https://raw.githubusercontent.com/ardieperdana/tampermonkey-script/main/heavenlydistrict-quick.user.js
// @downloadURL https://raw.githubusercontent.com/ardieperdana/tampermonkey-script/main/heavenlydistrict-quick.user.js
// @match        https://heavenlydistrict.vip/d/*
// @match        https://heavenlydistrict.vip/
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';
const isDetailPage = location.pathname.startsWith('/d/');
// ======================
// ULTRA ANTI ADBLOCK (FINAL)
// ======================
function nukeAdblock() {
    // 1. Remove overlay utama
    document.querySelectorAll('#adbock-wall-heavenly').forEach(el => el.remove());

    // 2. Remove semua overlay fixed brutal
    document.querySelectorAll('*').forEach(el => {
        const style = getComputedStyle(el);

        if (
            style.position === 'fixed' &&
            parseInt(style.zIndex) >= 999 &&
            (
                el.offsetWidth >= window.innerWidth * 0.9 &&
                el.offsetHeight >= window.innerHeight * 0.9
            )
        ) {
            el.remove();
        }
    });

    // 3. Kill script sumber (IMPORTANT)
    document.querySelectorAll('script[src*="warpcapessecretly"]').forEach(s => s.remove());

    // 4. Unlock total
    document.body.classList.remove('no-touch');
    document.body.style.overflow = 'auto';
    document.body.style.pointerEvents = 'auto';

    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.pointerEvents = 'auto';
}

// Run terus-terusan (ini kuncinya)
setInterval(nukeAdblock, 500);

// Observer (backup)
new MutationObserver(nukeAdblock).observe(document.documentElement, {
    childList: true,
    subtree: true
});
    // ======================
    // TEMPLATE KOMENTAR
    // ======================
    const templates = [
"Ini yang gua cari-cari, save dulu ya",
"Gila keren sih, gua download dulu",
"Makasih banget udah share, kepake nih",
"Ini legit banget, gua simpen dulu",
"Mantap parah, izin ambil ya bro",
"Wah dapet harta karun nih, thanks ya",
"Nice banget ini, langsung gua amankan",
"Ini sih legit, thanks banyak bro",
"Akhirnya nemu juga, langsung save",
"Mantap, ini yang gua butuhin",
"Wah jarang ada yang share beginian",
"Auto download ini mah",
"Keren sih, langsung masuk koleksi",
"Ini sih wajib disimpen",
"Thanks ya, kepake banget ini",
"Baru nemu, langsung gas download",
"Mantap banget share-nya",
"Ini sih gak boleh kelewat",
"Wah mantap, langsung gua ambil",
"Ini yang gua cari dari kemarin",
"Gila ini lengkap banget",
"Auto save sebelum hilang",
"Keren banget sih, makasih ya",
"Ini sih rare banget",
"Langsung masuk bookmark",
"Thanks bro, ini berguna banget",
"Mantap jiwa, langsung download",
"Ini sih fix disimpen",
"Gak nyangka nemu ini disini",
"Langsung gua koleksiin",
"Ini sih gacor banget",
"Keren parah, thanks share-nya",
"Langsung amankan sebelum ilang",
"Ini sih premium banget",
"Mantap share beginian",
"Fix ini gua download sekarang",
"Cakep banget ini, langsung gua download",
"Gua bookmark dulu sebelum ilang",
"Keren sih ini, makasih banyak ya",
"Pas banget lagi butuh, saved dulu",
"Baru nemu ini, langsung gua simpen",
"Wah ini kepake banget sih, thanks ya",
"Gua ambil dulu ya, siapa tau kepake",
"Ini sih wajib save",
"Makasih ya, jarang ada yang share beginian",
"Pas banget nemunya, gua download dulu",
"Keren banget sih, gua amankan dulu",
"Ini beneran ngebantu, makasih ya",
"Gua simpen dulu sebelum lupa",
"Wah mantep, langsung gua pake nih"
    ];

    function getRandomTemplate() {
        return templates[Math.floor(Math.random() * templates.length)];
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


(function() {
    'use strict';

    function removeAdblockOverlay() {
        const adblock = document.querySelector('#adbock-wall-heavenly');
        if (adblock) {
            adblock.remove();
            console.log('Adblock overlay removed');
        }

        document.body.classList.remove('no-touch');
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
    }

    removeAdblockOverlay();

    const observer = new MutationObserver(() => {
        removeAdblockOverlay();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();


    // ======================
    // MAIN AUTOMATION
    // ======================
    async function runAutomation() {

        console.log("🚀 Automation Started");

        const openBtn = document.querySelector(
            'button.SplitDropdown-button i.fa-reply'
        )?.closest('button');

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

        const submitBtn = document.querySelector(
            'button[itemclassname="App-primaryControl"]'
        );

        if (!submitBtn) {
            console.log("❌ Submit button tidak ditemukan");
            return;
        }

        submitBtn.click();
        console.log("✅ Comment Submitted");

        await sleep(1500);

        const firstPostBtn = document.querySelector('a.Scrubber-first');

        if (firstPostBtn) {
            firstPostBtn.click();
            console.log("✅ Postingan Awal diklik");
        }

        await sleep(1000);

        const replyToSee = document.querySelector('.xx2see.reply');

        if (replyToSee) {
            replyToSee.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
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

    // ======================
    // FLOATING BUTTON
    // ======================
function initButton() {
    if (!document.body) {
        return setTimeout(initButton, 300);
    }

    // prevent duplicate
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

    btn.onclick = runAutomation;

    document.body.appendChild(btn);
}

// run terus biar tahan SPA
setInterval(() => {
    if (isDetailPage) {
        initButton();
    }
}, 1000);
})();
