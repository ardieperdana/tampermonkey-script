// ==UserScript==
// @name         Universal Video Jump
// @namespace    jump5s
// @version      6.8
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
let isHiddenByUser = false; 

// ======================
// GET ACTIVE VIDEO
// ======================
function getActiveVideo(){
    const videos = [...document.querySelectorAll("video")];
    if(videos.length === 0) return null;

    let playing = videos.find(v => !v.paused && !v.ended && v.readyState > 2);
    if(playing) return playing;

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
    let startX, startY, initialLeft, initialTop;

    function startDrag(clientX, clientY) {
        el.isCurrentlyDragging = true; 
        
        el.style.bottom = ""; // Lepas jangkar bottom
        el.setAttribute('data-dragged', 'true');
        
        startX = clientX;
        startY = clientY;
        
        initialLeft = el.offsetLeft;
        initialTop = el.offsetTop;
    }

    function moveDrag(clientX, clientY) {
        if(!isDragging) return;
        let dx = clientX - startX;
        let dy = clientY - startY;
        
        el.style.left = (initialLeft + dx) + "px";
        el.style.top  = (initialTop + dy) + "px";
        el.style.transform = "none";
    }
    
    function endDrag() {
        isDragging = false;
        if(el) el.isCurrentlyDragging = false; 
    }

    // Mouse Events
    el.addEventListener("mousedown", (e)=>{
        if(e.target.closest('button') || e.target.closest('.jump-toggle-back')) return;
        isDragging = true;
        startDrag(e.clientX, e.clientY);
    });

    document.addEventListener("mousemove", (e)=>{
        if(!isDragging) return;
        moveDrag(e.clientX, e.clientY);
    });

    document.addEventListener("mouseup", endDrag);

    // Touch Events
    el.addEventListener("touchstart", (e)=>{
        if(e.target.closest('button') || e.target.closest('.jump-toggle-back')) return;
        isDragging = true;
        const touch = e.touches[0];
        startDrag(touch.clientX, touch.clientY);
    }, { passive: true });

    document.addEventListener("touchmove", (e)=>{
        if(!isDragging) return;
        if(e.cancelable) e.preventDefault(); 
        const touch = e.touches[0];
        moveDrag(touch.clientX, touch.clientY);
    }, { passive: false });

    document.addEventListener("touchend", endDrag);
}

// ======================
// CLAMP TO BOUNDARY
// ======================
function clampToBoundary(el){
    if(!el || !el.parentElement) return;

    const parent = el.parentElement;
    const pW = parent.clientWidth || window.innerWidth;
    const pH = parent.clientHeight || window.innerHeight;

    if(pW === 0 || pH === 0) return; 

    let left = el.offsetLeft;
    let top  = el.offsetTop;

    if(left < 0) left = 4;
    if(top  < 0) top  = 4;
    if(left + el.offsetWidth > pW) left = pW - el.offsetWidth - 4;
    if(top + el.offsetHeight > pH) top  = pH - el.offsetHeight - 4;

    el.style.bottom    = "";
    el.style.left      = left + "px";
    el.style.top       = top  + "px";
    el.style.transform = "none";
}

// ======================
// INITIALIZE SINGLE CONTROLS
// ======================
function initControls() {
    if (globalControls) return globalControls;

    const leftContainer = document.createElement('div');
    leftContainer.className = "jump-controls-left";
    leftContainer.isCurrentlyDragging = false; 
    makeDraggable(leftContainer);

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

    addFullscreenListener(()=>{
        setTimeout(() => { updatePosition(); }, 150);
    });
    
    window.addEventListener("resize", ()=>{
        setTimeout(() => { 
            if(globalControls && globalControls.hasAttribute('data-dragged') && !globalControls.isCurrentlyDragging){
                clampToBoundary(globalControls); 
            }
        }, 200);
    });

    return globalControls;
}

// ======================
// MANAGEMENT & RE-ANCHOR LOOP
// ======================
function updatePosition() {
    const video = getActiveVideo();
    if (!video) {
        if (globalControls && globalControls.parentElement) {
            globalControls.parentElement.removeChild(globalControls);
        }
        return;
    }

    const parent = video.parentElement;
    if (!parent) return;

    const container = initControls();
    
    if (container.isCurrentlyDragging) return; 

    const fs = getFullscreenElement();

    if (parent.style.position !== 'relative' && parent.style.position !== 'absolute') {
        parent.style.position = 'relative';
    }

    if (fs) {
        // Mode Fullscreen
        if (!fs.contains(container)) {
            fs.appendChild(container);
            
            if (!container.hasAttribute('data-dragged')) {
                container.style.left      = "20px";
                container.style.top       = "calc(50% - 25px)"; // Pindah ke tengah
                container.style.bottom    = "auto";
            } else {
                setTimeout(() => clampToBoundary(container), 50);
            }
        }
    } else {
        // Mode Normal
        if (container.parentElement !== parent) {
            parent.appendChild(container);
            
            if (!container.hasAttribute('data-dragged')) {
                container.style.left      = "20px";
                container.style.top       = "calc(50% - 25px)"; // Pindah ke tengah
                container.style.bottom    = "auto";
            } else {
                setTimeout(() => clampToBoundary(container), 50);
            }
        }
    }
}

// ======================
// KEYBOARD CONTROL
// ======================
if(!window.jumpListenerAdded){
    window.jumpListenerAdded = true;
    document.addEventListener('keydown', function(e){
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;

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
    left: 20px;
    top: calc(50% - 25px); /* Default di tengah vertikal */
    bottom: auto;
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
    user-select: none;
    -webkit-user-select: none;
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
}

.jump-controls-left button:hover {
    background: rgba(255,255,255,0.3);
}

.jump-controls-left button:active {
    background: rgba(255,255,255,0.5);
    transform: scale(0.95);
}

/* ── MOBILE ── */
@media (max-width: 768px) {
    .jump-controls-left {
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
// RUNNING LOOP
// ======================
setInterval(updatePosition, 800);

})();
