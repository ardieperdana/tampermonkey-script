// ==UserScript==
// @name         Universal Video Jump
// @namespace    jump5s
// @version      5.8
// @updateURL   https://raw.githubusercontent.com/ardieperdana/tampermonkey-script/main/universalvideojump.user.js
// @downloadURL https://raw.githubusercontent.com/ardieperdana/tampermonkey-script/main/universalvideojump.user.js
// @match        *://*/*
// @grant        none
// @run-at       document-idle
// @all-frames   true
// ==/UserScript==

(function() {
'use strict';

// ======================
// DOMAIN BLACKLIST
// ======================
const blockedSites = [
    "web.telegram.org",
    "t.me",
    "youtube.com",
    "daysignature.my.id",
    "chatgpt.com",
    "outlook.com",
    "tiktok.com"
];

if (blockedSites.some(site => location.hostname.includes(site))) {
    console.log("⛔ Script disabled on this site:", location.hostname);
    return;
}

// ======================
// GET ACTIVE VIDEO
// ======================
function getActiveVideo(){
    const videos = [...document.querySelectorAll("video")];
    if(videos.length === 0) return null;

    let playing = videos.find(v => !v.paused && !v.ended);
    if(playing) return playing;

    let biggest = videos.sort((a,b)=>
        (b.offsetWidth*b.offsetHeight)-(a.offsetWidth*a.offsetHeight)
    )[0];

    return biggest || null;
}

// ======================
// FULLSCREEN HELPER
// Handles vendor prefixes for mobile (iOS Safari, Android Chrome)
// ======================
function getFullscreenElement(){
    return document.fullscreenElement
        || document.webkitFullscreenElement
        || document.mozFullScreenElement
        || document.msFullscreenElement
        || null;
}

function addFullscreenListener(callback){
    document.addEventListener("fullscreenchange",       callback);
    document.addEventListener("webkitfullscreenchange", callback);
    document.addEventListener("mozfullscreenchange",    callback);
    document.addEventListener("MSFullscreenChange",     callback);
}

// ======================
// JUMP FUNCTION
// ======================
function jump(seconds){
    const video = getActiveVideo();
    if(!video) return;
    video.currentTime += seconds;
    video.dispatchEvent(new Event('timeupdate'));
    console.log("⏩ Jump:", seconds, "sec");
}

// ======================
// VOLUME FUNCTION
// ======================
function changeVolume(delta){
    const video = getActiveVideo();
    if(!video) return;
    let newVolume = video.volume + (delta / 100);
    newVolume = Math.max(0, Math.min(1, newVolume));
    video.volume = newVolume;
    console.log("🔊 Volume:", Math.round(newVolume * 100) + "%");
}

// ======================
// DRAG (mouse + touch)
// ======================
function makeDraggable(el){
    let isDragging = false;
    let offsetX, offsetY;

    el.addEventListener("mousedown", (e)=>{
        isDragging = true;
        offsetX = e.clientX - el.getBoundingClientRect().left;
        offsetY = e.clientY - el.getBoundingClientRect().top;
        e.preventDefault();
    });

    document.addEventListener("mousemove", (e)=>{
        if(!isDragging) return;
        el.style.left      = (e.clientX - offsetX) + "px";
        el.style.top       = (e.clientY - offsetY) + "px";
        el.style.bottom    = "auto";
        el.style.transform = "none";
    });

    document.addEventListener("mouseup", ()=>{ isDragging = false; });

    el.addEventListener("touchstart", (e)=>{
        isDragging = true;
        const touch = e.touches[0];
        offsetX = touch.clientX - el.getBoundingClientRect().left;
        offsetY = touch.clientY - el.getBoundingClientRect().top;
        // jangan preventDefault di sini biar scroll tetap jalan
    }, { passive: true });

    document.addEventListener("touchmove", (e)=>{
        if(!isDragging) return;
        const touch = e.touches[0];
        el.style.left      = (touch.clientX - offsetX) + "px";
        el.style.top       = (touch.clientY - offsetY) + "px";
        el.style.bottom    = "auto";
        el.style.transform = "none";
    }, { passive: true });

    document.addEventListener("touchend", ()=>{ isDragging = false; });
}

// ======================
// CLAMP POSITION
// Pastiin button ga keluar layar setelah resize / rotate
// ======================
function clampToViewport(el){
    const rect = el.getBoundingClientRect();
    const vw   = window.innerWidth;
    const vh   = window.innerHeight;

    let left = rect.left;
    let top  = rect.top;

    if(left < 0)               left = 4;
    if(top  < 0)               top  = 4;
    if(left + rect.width > vw) left = vw - rect.width - 4;
    if(top + rect.height > vh) top  = vh - rect.height - 4;

    el.style.left      = left + "px";
    el.style.top       = top  + "px";
    el.style.bottom    = "auto";
    el.style.transform = "none";
}

// ======================
// RE-ANCHOR
// Pindahin container ke parent yang tepat sesuai kondisi fullscreen
// ======================
function reAnchor(leftContainer, video){
    const fs     = getFullscreenElement();
    const parent = video.parentElement;

    if(fs){
        // Fullscreen aktif — taruh di elemen fullscreen
        if(!fs.contains(leftContainer)){
            fs.appendChild(leftContainer);
        }
        // Reset ke posisi aman (pojok kiri bawah fullscreen)
        leftContainer.style.left      = "12px";
        leftContainer.style.bottom    = "48px";    // naik dikit hindari native controls
        leftContainer.style.top       = "auto";
        leftContainer.style.transform = "none";
    } else {
        // Normal — balik ke parent video
        if(parent && !parent.contains(leftContainer)){
            parent.appendChild(leftContainer);
        }
        leftContainer.style.left      = "20px";
        leftContainer.style.bottom    = "8px";
        leftContainer.style.top       = "auto";
        leftContainer.style.transform = "none";
    }
}

// ======================
// CREATE BUTTONS
// ======================
function createControls(video){
    if(video.dataset.jumpAdded) return;
    video.dataset.jumpAdded = "true";

    const parent = video.parentElement;
    if(!parent) return;

    parent.style.position = 'relative';

    const leftContainer = document.createElement('div');
    leftContainer.className = "jump-controls-left";
    makeDraggable(leftContainer);

    const btnDefs = [
        { label: "-30", fn: ()=> jump(-30)       },
        { label: "-5",  fn: ()=> jump(-5)        },
        { label: "♫-",  fn: ()=> changeVolume(-10)},
        { label: "♫+",  fn: ()=> changeVolume(10) },
        { label: "+5",  fn: ()=> jump(5)         },
        { label: "+30", fn: ()=> jump(30)        },
    ];

    btnDefs.forEach(({ label, fn }) => {
        const btn    = document.createElement('button');
        btn.innerText = label;
        btn.onclick  = fn;
        leftContainer.appendChild(btn);
    });

    parent.appendChild(leftContainer);

    // ── Fullscreen handler ──
    addFullscreenListener(()=>{
        // Tunggu sebentar biar browser selesai masuk/keluar fullscreen
        setTimeout(()=>{
            reAnchor(leftContainer, video);
            clampToViewport(leftContainer);
        }, 150);
    });

    // ── Orientasi & resize (penting untuk HP landscape/portrait) ──
    window.addEventListener("resize", ()=>{
        setTimeout(()=>{
            clampToViewport(leftContainer);
        }, 200);
    });

    screen.orientation?.addEventListener("change", ()=>{
        setTimeout(()=>{
            reAnchor(leftContainer, video);
            clampToViewport(leftContainer);
        }, 300);
    });
}

// ======================
// DETECT VIDEOS
// ======================
function detectVideos(){
    document.querySelectorAll('video').forEach(v => createControls(v));
}

// ======================
// KEYBOARD CONTROL
// ======================
if(!window.jumpListenerAdded){
    window.jumpListenerAdded = true;

    document.addEventListener('keydown', function(e){
        if(e.key === "ArrowLeft")  jump(-30);
        if(e.key === "ArrowRight") jump(30);
        if(e.key === ",")          jump(-5);
        if(e.key === ".")          jump(5);
        if(e.key === "-")          changeVolume(-10);
        if(e.key === "=")          changeVolume(10);
    });
}

// ======================
// STYLE
// ======================
const style = document.createElement("style");
style.innerHTML = `
.jump-controls-left {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    gap: 8px;
    position: absolute;
    bottom: 8px;
    left: 20px;
    top: auto;
    transform: none;
    z-index: 2147483647;
    padding: 6px 8px;
    border-radius: 14px;
    /* backdrop blur biar keliatan di atas video gelap/terang */
    background: rgba(0,0,0,0.15);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    cursor: grab;
    /* jangan overflow hidden — malah bikin button kepotong */
    overflow: visible;
    box-sizing: border-box;
    /* max-width relative ke viewport, bukan parent */
    max-width: calc(100vw - 24px);
}

.jump-controls-left:active {
    cursor: grabbing;
}

.jump-controls-left button {
    flex-shrink: 0;
    background: rgba(0,0,0,0.30);
    border: none;
    color: white;
    border-radius: 12px;
    padding: 8px 16px;
    font-size: 18px;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s;
    /* min tap target 44px sesuai HIG */
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
}

.jump-controls-left button:hover,
.jump-controls-left button:active {
    background: rgba(255,255,255,0.35);
    transform: scale(1.1);
}

/* ── MOBILE ── */
@media (max-width: 768px) {
    .jump-controls-left {
        bottom: 52px;   /* naik dari native controls HP */
        left: 8px;
        gap: 6px;
        padding: 4px 6px;
        /* font lebih kecil tapi tap target tetap layak */
    }

    .jump-controls-left button {
        padding: 6px 10px;
        font-size: 13px;
        min-width: 38px;
        min-height: 38px;
        border-radius: 9px;
    }
}

/* ── LANDSCAPE mobile (lebar > tinggi) ── */
@media (max-height: 500px) and (orientation: landscape) {
    .jump-controls-left {
        bottom: 8px;
        gap: 4px;
        padding: 3px 5px;
    }

    .jump-controls-left button {
        padding: 4px 8px;
        font-size: 12px;
        min-width: 34px;
        min-height: 34px;
    }
}
`;
document.head.appendChild(style);

// ======================
// LOOP
// ======================
setInterval(detectVideos, 1000);

})();
