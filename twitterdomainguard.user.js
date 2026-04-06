// ==UserScript==
// @name         Firebase Twitter Domain Guard (Normalized)
// @namespace    twitterFirebaseGuard
// @version      2.0
// @updateURL   https://raw.githubusercontent.com/ardieperdana/tampermonkey-script/main/twitterdomainguard.user.js
// @downloadURL https://raw.githubusercontent.com/ardieperdana/tampermonkey-script/main/twitterdomainguard.user.js
// @match        https://twitter.com/*
// @match        https://x.com/*
// @grant        GM_xmlhttpRequest
// @connect      shitlink-517a6-default-rtdb.asia-southeast1.firebasedatabase.app
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const BASE_URL = "https://shitlink-517a6-default-rtdb.asia-southeast1.firebasedatabase.app/blockedDomains/";
    const LIST_URL = BASE_URL + ".json";

    let domainList = [];

    // 🔥 Normalize input → always hostname only
    function normalizeDomain(input) {
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

    // 🔥 Load
    function loadDomains() {
        GM_xmlhttpRequest({
            method: "GET",
            url: LIST_URL,
            onload: function(res) {
                try {
                    const data = JSON.parse(res.responseText);
                    domainList = data ? Object.values(data) : [];
                    console.log("Loaded:", domainList);
                } catch(e) {
                    console.error(e);
                }
            }
        });
    }

    // 🔥 Add
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
            headers: {
                "Content-Type": "application/json"
            },
            onload: function() {
    loadDomains();
    setTimeout(() => {
        highlight();
    }, 300); // kasih delay dikit biar list kebaca
}
        });
    }

    // 🔥 Highlight
    function highlight() {
    if (!domainList.length) return;

    document.querySelectorAll("a").forEach(link => {
        const text = (link.innerText || "").toLowerCase();
        const href = (link.href || "").toLowerCase();

        domainList.forEach(domain => {
            if (text.includes(domain) || href.includes(domain)) {
                link.style.color = "red";
                link.style.fontWeight = "bold";
            }
        });
    });
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

    loadDomains();
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
observeTimeline();

})();
