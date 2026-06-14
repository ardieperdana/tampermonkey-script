// ==UserScript==
// @name         Universal Video Jump
// @namespace    jump5s
// @version      6.3
// @updateURL    https://raw.githubusercontent.com/ardieperdana/tampermonkey-script/main/universalvideojump.user.js
// @downloadURL  https://raw.githubusercontent.com/ardieperdana/tampermonkey-script/main/universalvideojump.user.js
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

let globalControls = null;
let isHiddenByUser = false; // Flag biar kalau di-close ga nongol lagi otomatis

// ======================
// GET ACTIVE VIDEO
// ======================
function getActiveVideo(){
    const videos = [...document.querySelectorAll("video")];
    if(videos.length === 0) return null;

    // Cari yang beneran lagi diputar
    let playing = videos.find(v => !v.paused && !v.ended && v.readyState > 2);
    if(playing) return playing;

    // Kalau ga ada yang putar, cari yang paling gede ukurannya di layar
    let biggest = videos.sort((a,b)=>
        (b.offsetWidth*b.offsetHeight)-(a.offsetWidth*a.offsetHeight)
    )[0];

    return biggest || null;
}

// ======================
// FULLSCREEN HELPER
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
// JUMP & VOLUME FUNCTIONS
// ======================
function jump(seconds){
    const video = getActiveVideo();
    if(!video) return;
    video.currentTime += seconds;
    video.dispatchEvent(new Event('timeupdate'));
}

function changeVolume(delta){
    const video = getActiveVideo();
    if(!video) return;
    let newVolume = video.volume + (delta / 100);
    newVolume = Math.max(0, Math.min(1, newVolume));
    video.volume = newVolume;
}

// ======================
// DRAG HANDLER
// ======================
function makeDraggable(el){
    let isDragging = false;
    let offsetX, offsetY;

    el.addEventListener("mousedown", (e)=>{
        if(e.target.classList.contains('jump-close-btn') || e.target.classList.contains('jump-toggle-back')) return;
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

    document.addEventListener("mouseup", () => { isDragging = false; });

    el.addEventListener("touchstart", (e)=>{
        if(e.target.classList.contains('jump-close-btn') || e.target.classList.contains('jump-toggle-back')) return;
        isDragging = true;
        const touch = e.touches[0];
        offsetX = touch.clientX - el.getBoundingClientRect().left;
        offsetY = touch.clientY - el.getBoundingClientRect().top;
    }, { passive: true });

    document.addEventListener("touchmove", (e)=>{
        if(!isDragging) return;
        const touch = e.touches[0];
        el.style.left      = (touch.clientX - offsetX) + "px";
        el.style.top       = (touch.clientY - offsetY) + "px";
        el.style.bottom    = "auto";
        el.style.transform = "none";
    }, { passive: true });

    document.addEventListener("touchend", () => { isDragging = false; });
}

function clampToViewport(el){
    if(!el) return;
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
// INITIALIZE SINGLE CONTROLS
// ======================
function initControls() {
    if (globalControls) return globalControls;

    const leftContainer = document.createElement('div');
    leftContainer.className = "jump-controls-left";
    makeDraggable(leftContainer);

    // Tombol silang merah
    const closeBtn = document.createElement('button');
    closeBtn.className = "jump-close-btn";
    closeBtn.innerText = "×";
    closeBtn.title = "Sembunyikan";
    closeBtn.onclick = (e) => {
        e.stopPropagation();
        isHiddenByUser = true;
        leftContainer.classList.add('hidden');
    };
    leftContainer.appendChild(closeBtn);

    // Tombol kembalikan (Show)
    const toggleBackBtn = document.createElement('div');
    toggleBackBtn.className = "jump-toggle-back";
    toggleBackBtn.innerText = "▶";
    toggleBackBtn.title = "Tampilkan Kontrol";
    toggleBackBtn.onclick = (e) => {
        e.stopPropagation();
        isHiddenByUser = false;
        leftContainer.classList.remove('hidden');
    };
    leftContainer.appendChild(toggleBackBtn);

    // Tombol Navigasi
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

    globalControls = leftContainer;

    // Listener Fullscreen & Resize global
    addFullscreenListener(()=>{
        setTimeout(() => { updatePosition(); }, 150);
    });
    window.addEventListener("resize", ()=>{
        setTimeout(() => { clampToViewport(globalControls); }, 200);
    });

    return globalControls;
}

// ======================
// MANAGEMENT & RE-ANCHOR LOOP
// ======================
function updatePosition() {
    const video = getActiveVideo();
    if (!video) {
        // Kalau ga ada video aktif, sembunyikan container utama
        if (globalControls && globalControls.parentElement) {
            globalControls.parentElement.removeChild(globalControls);
        }
        return;
    }

    const parent = video.parentElement;
    if (!parent) return;

    const container = initControls();
    const fs = getFullscreenElement();

    // Pastikan parent video punya position relative supaya tombol presisi
    if (parent.style.position !== 'relative' && parent.style.position !== 'absolute') {
        parent.style.position = 'relative';
    }

    if (fs) {
        // Mode Fullscreen
        if (!fs.contains(container)) {
            fs.appendChild(container);
            container.style.left      = "12px";
            container.style.bottom    = "48px";
            container.style.top       = "auto";
        }
    } else {
        // Mode Normal (Tempel di parent video yang sedang aktif)
        if (container.parentElement !== parent) {
            parent.appendChild(container);
            container.style.left      = "20px";
            container.style.bottom    = "8px";
            container.style.top       = "auto";
        }
    }
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
    background: rgba(0,0,0,0.15);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    cursor: grab;
    overflow: visible;
    box-sizing: border-box;
    max-width: calc(100vw - 24px);
}

.jump-controls-left:active {
    cursor: grabbing;
}

.jump-close-btn {
    position: absolute;
    top: -22px;
    left: 8px;
    background: #ff4d4d !important;
    color: white !important;
    border: none;
    border-radius: 6px !important;
    width: 24px !important;
    height: 24px !important;
    min-width: 24px !important;
    min-height: 24px !important;
    padding: 0 !important;
    font-size: 16px !important;
    font-weight: bold;
    display: flex !important;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0,0,0,0.15);
    z-index: 2147483647;
}

.jump-close-btn:hover {
    background: #ff1a1a !important;
    transform: scale(1.1);
}

.jump-toggle-back {
    display: none;
    background: rgba(0,0,0,0.8);
    color: #ff4d4d;
    padding: 8px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 12px;
    width: 20px;
    height: 20px;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 5px rgba(0,0,0,0.5);
}

.jump-controls-left.hidden {
    background: transparent;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    box-shadow: none;
    padding: 0;
    width: 35px;
    height: 35px;
}
.jump-controls-left.hidden > * {
    display: none !important;
}
.jump-controls-left.hidden .jump-toggle-back {
    display: flex !important;
}

.jump-controls-left button {
    flex-shrink: 0;
    background: rgba(0,0,0,0.5);
    border: none;
    color: white;
    border-radius: 12px;
    padding: 8px 16px;
    font-size: 18px;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s;
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
        bottom: 52px;
        left: 8px;
        gap: 6px;
        padding: 4px 6px;
    }

    .jump-controls-left button {
        padding: 6px 10px;
        font-size: 13px;
        min-width: 38px;
        min-height: 38px;
        border-radius: 9px;
    }

    .jump-close-btn {
        top: -20px;
        left: 4px;
        width: 20px !important;
        height: 20px !important;
        min-width: 20px !important;
        min-height: 20px !important;
        font-size: 14px !important;
    }
}
`;
document.head.appendChild(style);

// ======================
// RUNNING LOOP (Smarter Watcher)
// ======================
setInterval(updatePosition, 800);

})();
