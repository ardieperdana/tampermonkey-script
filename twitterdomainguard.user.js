// ==UserScript==
// @name         Firebase Twitter Domain Guard (Normalized + Auto Trap)
// @namespace    twitterFirebaseGuard
// @version      3.0
// @updateURL    https://raw.githubusercontent.com/ardieperdana/tampermonkey-script/main/twitterdomainguard.user.js
// @downloadURL  https://raw.githubusercontent.com/ardieperdana/tampermonkey-script/main/twitterdomainguard.user.js
// @match        https://twitter.com/*
// @match        https://x.com/*
// @match        *://*.shopee.co.id/*
// @match        *://shopee.co.id/*
// @match        *://shp.ee/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      shitlink-517a6-default-rtdb.asia-southeast1.firebasedatabase.app
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const BASE_URL = "https://shitlink-517a6-default-rtdb.asia-southeast1.firebasedatabase.app/blockedDomains/";
    const LIST_URL = BASE_URL + ".json";

    const hostname = location.hostname.toLowerCase();
    const isTwitter = hostname.includes("twitter.com") || hostname.includes("x.com");
    const isShopee = hostname.includes("shopee") || hostname.includes("shp.ee");

    let domainList = [];

    // 🔥 Normalize input → always hostname only
    function normalizeDomain(input) {
        if (!input) return null;
        try {
            if (!input.startsWith("http")) {
                input = "https://" + input;
            }
            const url = new URL(input);
            return url.hostname.replace(/^www\./, "");
        } catch {
            return null;
        }
    }

    // ==========================================
    // 🛡️ MODE SHOPEE: EKSEKUSI JEBAKAN
    // ==========================================
    if (isShopee) {
        const trap = GM_getValue("pendingTrap", null);
        const now = Date.now();

        // Cek apakah ada klik dari Twitter dalam 15 detik terakhir
        if (trap && (now - trap.time < 15000)) {
            const domainAnjing = trap.domain;
            const safeKey = domainAnjing.replace(/\./g, "_");

            console.log("🚨 Kena gocek dari Twitter! Domain biang kerok:", domainAnjing);

            // Tembak langsung ke Firebase
            GM_xmlhttpRequest({
                method: "PUT",
                url: BASE_URL + safeKey + ".json",
                data: JSON.stringify(domainAnjing),
                headers: { "Content-Type": "application/json" },
                onload: function() {
                    alert(`🚨 KENA GOCEK!\nDomain sampah [${domainAnjing}] udah di-auto-block ke Firebase.`);
                    GM_setValue("pendingTrap", null); // Bersihin memori biar ga loop
                    
                    // Kalau lu mau tab-nya otomatis ketutup abis kegocek, 
                    // lu bisa hapus tanda // di bawah ini:
                    // window.close(); 
                }
            });
        }
        return; // Setop eksekusi script lebih lanjut biar Shopee gak error
    }


    // ==========================================
    // 🐦 MODE TWITTER: NORMAL GUARD + INTEL
    // ==========================================
    if (!isTwitter) return;

    // 🔥 Load
    function loadDomains() {
        GM_xmlhttpRequest({
            method: "GET",
            url: LIST_URL,
            onload: function(res) {
                try {
                    const data = JSON.parse(res.responseText);
                    domainList = data ? Object.values(data) : [];
                    console.log("Loaded Firebase Domains:", domainList);
                } catch(e) {
                    console.error(e);
                }
            }
        });
    }

    // 🔥 Add Manual
    function addDomain(domain) {
        const clean = normalizeDomain(domain);
        if (!clean) {
            alert("Invalid domain");
            return;
        }

        const safeKey = clean.replace(/\./g, "_");

        GM_xmlhttpRequest({
            method: "PUT",
            url: BASE_URL + safeKey + ".json",
            data: JSON.stringify(clean),
            headers: { "Content-Type": "application/json" },
            onload: function() {
                loadDomains();
                setTimeout(() => { highlight(); }, 300);
            }
        });
    }

    // 🔥 Highlight + Block Click
    function highlight() {
        if (!domainList.length) return;

        document.querySelectorAll("a").forEach(link => {
            const text = (link.innerText || "").toLowerCase();
            const href = (link.href || "").toLowerCase();

            domainList.forEach(domain => {
                if (text.includes(domain) || href.includes(domain)) {
                    link.style.color = "red";
                    link.style.fontWeight = "bold";
                    link.style.pointerEvents = "none";
                    link.style.cursor = "not-allowed";
                    link.style.opacity = "0.7";
                    link.title = "Blocked domain";
                    link.removeAttribute("href");
                }
            });
        });
    }

    // 🔥 Intel: Pantau Klik (Track Clicks)
    function observeClicksForTrap() {
        document.addEventListener('click', function(e) {
            const a = e.target.closest('a');
            if (!a) return;

            let targetDomain = normalizeDomain(a.href);

            // Kalo link aslinya t.co, coba gali teks aslinya (misal: cdn.dodimg.fun)
            if (targetDomain === 't.co') {
                const textDomain = normalizeDomain(a.innerText);
                const titleDomain = normalizeDomain(a.title);

                // Prioritaskan domain yang ada di teks kalau itu bukan t.co
                if (textDomain && textDomain !== 't.co' && textDomain.includes('.')) {
                    targetDomain = textDomain;
                } else if (titleDomain && titleDomain !== 't.co' && titleDomain.includes('.')) {
                    targetDomain = titleDomain;
                }
            }

            // Kalau domainnya valid dan bukan punya Twitter, catet ke memori jebakan
            if (targetDomain && !targetDomain.includes('twitter.com') && !targetDomain.includes('x.com') && targetDomain !== 't.co') {
                GM_setValue('pendingTrap', {
                    domain: targetDomain,
                    time: Date.now()
                });
                console.log("👀 Intel nyatet domain mencurigakan:", targetDomain);
            }
        }, true); // Pake mode capture biar nangkep klik sebelum tab baru kebuka
    }

    // 🔥 Floating Button
    const btn = document.createElement("div");
    btn.innerText = "Block Shit Domain";
    btn.style.cssText = `
        position:fixed;
        bottom:90px;
        right:320px;
        background:#fe6081;
        color:white;
        padding:8px 12px;
        border-radius:8px;
        cursor:pointer;
        z-index:999999;
        font-size:12px;
    `;

    btn.onclick = function() {
        const domain = prompt("Domain?");
        if (!domain) return;
        addDomain(domain.trim());
    };

    document.body.appendChild(btn);

    // 🔥 Mutation Observer
    function observeTimeline() {
        const observer = new MutationObserver(() => {
            highlight();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Eksekusi jalanin semua fungsi
    loadDomains();
    observeClicksForTrap();
    observeTimeline();

})();
