// ==UserScript==
// @name         #day Sub Auto Extract
// @namespace    https://github.com/day
// @version      1.2
// @icon         https://cdn-icons-png.flaticon.com/512/2876/2876107.png
// @updateURL    https://img.statically.io/gh/ardieperdana/tampermonkey-script/main/subautoextract.user.js
// @downloadURL  https://img.statically.io/gh/ardieperdana/tampermonkey-script/main/subautoextract.user.js
// @description  Download subtitle langsung tanpa ZIP (Subsource + SubDL)
// @author       day
// @match        https://subsource.net/subtitle/*
// @match        https://subdl.com/*
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js
// ==/UserScript==

(function () {
    'use strict';

    function log(...args) {
        console.log("[SubExtract]", ...args);
    }

    async function handleDownload(e) {

        e.preventDefault();
        e.stopPropagation();

        const button = e.currentTarget;

        if (button.dataset.busy)
            return;

        button.dataset.busy = "1";

        const oldHTML = button.innerHTML;

        button.style.opacity = ".6";
        button.style.pointerEvents = "none";
        button.innerHTML = "⏳ Extracting...";

        try {

            log("Downloading ZIP...");

            const isSubsource = location.hostname.includes("subsource.net");

            const res = await fetch(button.href, {
                credentials: isSubsource ? "include" : "omit",
                redirect: "follow"
            });

            if (!res.ok)
                throw new Error("HTTP " + res.status);

            const blob = await res.blob();

            log("Blob", blob.type, blob.size);

            const zip = await JSZip.loadAsync(blob);

            const subtitles = Object.values(zip.files).filter(file =>
                !file.dir &&
                /\.(srt|ass|ssa|sub)$/i.test(file.name)
            );

            if (!subtitles.length)
                throw new Error("Subtitle tidak ditemukan di ZIP.");

            log("Files:", subtitles.map(f => f.name));

            for (const file of subtitles) {

                const data = await file.async("blob");

                const url = URL.createObjectURL(data);

                const a = document.createElement("a");

                a.href = url;
                a.download = file.name.split("/").pop();

                document.body.appendChild(a);

                a.click();

                a.remove();

                setTimeout(() => URL.revokeObjectURL(url), 3000);

            }

            log("Done");

        }
        catch (err) {

            console.error(err);
            alert(err.message);

        }
        finally {

            button.innerHTML = oldHTML;
            button.style.opacity = "";
            button.style.pointerEvents = "";
            delete button.dataset.busy;

        }

    }

    function attach() {

        document.querySelectorAll(
            [
                'a[href*="api.subsource.net/v1/subtitle/download"]',
                'a[href*="dl.subdl.com/subtitle/"]'
            ].join(",")
        ).forEach(button => {

            if (button.dataset.dayExtract)
                return;

            button.dataset.dayExtract = "1";

            button.addEventListener("click", handleDownload);

        });

    }

    attach();

    new MutationObserver(attach).observe(document.body, {
        childList: true,
        subtree: true
    });

})();
