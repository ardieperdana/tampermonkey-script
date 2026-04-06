// ==UserScript==
// @name         4Play AUTO (FIXED FLOW)
// @namespace    ardie
// @version      5.3
// @match        *://4play.to/*
// @updateURL   https://raw.githubusercontent.com/ardieperdana/tampermonkey-script/main/4play.to-quick.user.js
// @downloadURL https://raw.githubusercontent.com/ardieperdana/tampermonkey-script/main/4play.to-quick.user.js
// @grant        none
// @run-at       document-idle
// @all-frames   true
// ==/UserScript==

(function() {
'use strict';

// ======================
// 🚀 4PLAY AUTOMATION
// ======================
async function run4PlayAutomation() {

    function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

    const templates = [
"Ini yang gua cari-cari, save dulu ya",
"Mantap admin",
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

    const text = templates[Math.floor(Math.random()*templates.length)];

    // STEP 1: klik balas
    const replyBtn = document.querySelector('.reply2see_reply');

    if (!replyBtn) {
        console.log("❌ Tombol balas tidak ditemukan");
        return;
    }

    replyBtn.click();
    console.log("✅ Klik balas");

    await sleep(1200);

    // STEP 2: isi komentar
    const textarea = document.querySelector('textarea');

    if (!textarea) {
        console.log("❌ Textarea tidak ditemukan");
        return;
    }

    textarea.value = text;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));

    await sleep(1000);

    // STEP 3: submit
    let submitBtn = document.querySelector('button[itemclassname="App-primaryControl"]');

    if (!submitBtn) {
        submitBtn = document.querySelector('button.Button--primary');
    }

    if (!submitBtn) {
        console.log("❌ Submit tidak ditemukan");
        return;
    }

    submitBtn.click();
    console.log("✅ Comment dikirim");

    // ======================
    // Not Hurry!
    // ======================

    // WAIT 1.5 DETIK
    await sleep(1500);

    // STEP 4: klik postingan awal
    const firstPostBtn = document.querySelector('a.Scrubber-first');

    if (firstPostBtn) {
        firstPostBtn.click();
        console.log("✅ Klik Postingan Awal");
    } else {
        console.log("❌ Tombol Postingan Awal tidak ditemukan");
    }

    // WAIT 1 DETIK
    await sleep(1000);

    // STEP 5: refresh
    console.log("🔄 Refresh...");
    location.reload();
}


// ======================
// OPTIONAL UNLOCK (NO COMMENT)
// ======================
document.querySelectorAll('.reply2see.locked').forEach(el=>{
    el.classList.remove('locked');
});


// ======================
// 🎯 FLOATING BUTTON
// ======================
function createButton(){

    const btn = document.createElement("button");
    btn.innerText = "🚀 4PLAY";

    btn.style.position = "fixed";
    btn.style.right = "20px";
    btn.style.top = "60%";
    btn.style.zIndex = "999999";
    btn.style.padding = "12px 16px";
    btn.style.background = "#ff4d6d";
    btn.style.color = "#fff";
    btn.style.border = "none";
    btn.style.borderRadius = "20px";
    btn.style.cursor = "pointer";

    btn.onclick = run4PlayAutomation;

    document.body.appendChild(btn);
}

// wait body ready
function init(){
    if (!document.body) return setTimeout(init, 300);
    createButton();
}

init();

})();
