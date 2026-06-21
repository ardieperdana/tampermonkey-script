// ==UserScript==
// @name         Firebase Twitter Domain Guard (Normalized + Ultimate Auto Trap)
// @namespace    twitterFirebaseGuard
// @version      3.1
// @updateURL    https://raw.githubusercontent.com/ardieperdana/tampermonkey-script/main/twitterdomainguard.user.js
// @downloadURL  https://raw.githubusercontent.com/ardieperdana/tampermonkey-script/main/twitterdomainguard.user.js
// @match        https://twitter.com/*
// @match        https://x.com/*
// @match        *://*.shopee.co.id/*
// @match        *://shopee.co.id/*
// @match        *://shp.ee/*
// @match        *://*.tokopedia.com/*
// @match        *://tokopedia.com/*
// @match        *://tokopedia.link/*
// @match        *://*.tiktok.com/*
// @match        *://tiktok.com/*
// @match        *://*.blibli.com/*
// @match        *://blibli.com/*
// @match        *://blib.li/*
// @match        *://*.lazada.co.id/*
// @match        *://lazada.co.id/*
// @match        *://*.bukalapak.com/*
// @match        *://bukalapak.com/*
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
    
    // Deteksi e-commerce jebakan
    const isShopee = hostname.includes("shopee") || hostname.includes("shp.ee");
    const isTokopedia = hostname.includes("tokopedia.com") || hostname.includes("tokopedia.link");
    const isTiktok = hostname.includes("tiktok.com");
    const isBlibli = hostname.includes("blibli.com") || hostname.includes("blib.li");
    const isLazada = hostname.includes("lazada");
    const isBukalapak = hostname.includes("bukalapak.com");
    
    const isTrapSite = isShopee || isTokopedia || isTiktok || isBlibli || isLazada || isBukalapak;

    // Tentukan nama e-commerce buat notifikasi
    let ecomName = "E-Commerce";
    if (isShopee) ecomName = "Shopee";
    else if (isTokopedia) ecomName = "Tokopedia";
    else if (isTiktok) ecomName = "TikTok";
    else if (isBlibli) ecomName = "Blibli";
    else if (isLazada) ecomName = "Lazada";
    else if (isBukalapak) ecomName = "Bukalapak";

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
    // 🛡️ MODE E-COMMERCE: EKSEKUSI JEBAKAN
    // ==========================================
    if (isTrapSite) {
        const trap = GM_getValue("pendingTrap", null);
        const now = Date.now();

        // Cek apakah ada klik dari Twitter dalam 15 detik terakhir
        if (trap && (now - trap.time < 15000)) {
            const domainAnjing = trap.domain;
            const safeKey = domainAnjing.replace(/\./g, "_");

            console.log(`🚨 Kena gocek ke ${ecomName}! Domain biang kerok:`, domainAnjing);

            // Tembak langsung ke Firebase
            GM_xmlhttpRequest({
                method: "PUT",
                url: BASE_URL + safeKey + ".json",
                data: JSON.stringify(domainAnjing),
                headers: { "Content-Type": "application/json" },
                onload: function() {
                    alert(`🚨 KENA GOCEK KE ${ecomName.toUpperCase()}!\nDomain sampah [${domainAnjing}] udah di-auto-block ke Firebase.`);
                    GM_setValue("pendingTrap", null); // Bersihin memori biar ga loop
                    
                    // Hapus tanda // di bawah ini kalau mau auto-close tab pas kegocek
                    // window.close(); 
                }
            });
        }
        return; // Setop eksekusi script lebih lanjut biar web e-commerce gak error
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

            // Kalo link aslinya t.co, coba gali teks aslinya
            if (targetDomain === 't.co') {
                const textDomain = normalizeDomain(a.innerText);
                const titleDomain = normalizeDomain(a.title);

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
        }, true);
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

    loadDomains();
    observeClicksForTrap();
    observeTimeline();

})();
