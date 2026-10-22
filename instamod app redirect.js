// ==UserScript==
//@name         Redirect InstMod to InstaMod.app
//@namespace    http://tampermonkey.net/
//@version      1.0
//@description  Secara otomatis mengalihkan domain instmod.com ke instamod.app
//@author       Kamu
//@match        https://*.instmod.com/*
//@match        http://*.instmod.com/*
//@run-at       document-start
//@grant        none
//==/UserScript==

(function() {
    'use strict';
    
    // Ambil URL saat ini
    const currentUrl = window.location.href;
    
    // Ganti domain instmod.com dengan instamod.app
    const newUrl = currentUrl.replace(/instmod\.com/i, 'instamod.app');
    
    // Lakukan redirect langsung jika URL berbeda
    if (newUrl !== currentUrl) {
        window.location.replace(newUrl);
    }
})();