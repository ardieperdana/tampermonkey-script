// ==UserScript==
// @name         Universal Video Jump
// @namespace    jump5s
// @version      5.6
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

    // prioritas: yang lagi play
    let playing = videos.find(v => !v.paused && !v.ended);
    if(playing) return playing;

    // fallback: video terbesar
    let biggest = videos.sort((a,b)=>
        (b.offsetWidth*b.offsetHeight)-(a.offsetWidth*a.offsetHeight)
    )[0];

    return biggest || null;
}

// ======================
// JUMP FUNCTION
// ======================
function jump(seconds){
    const video = getActiveVideo();
    if(!video) return;

    video.currentTime += seconds;

    // paksa update UI player
    video.dispatchEvent(new Event('timeupdate'));

    console.log("⏩ Jump:", seconds, "sec", video);
}

// ======================
// Volume FUNCTION
// ======================
    function changeVolume(delta){
    const video = getActiveVideo();
    if(!video) return;

    let newVolume = video.volume + (delta / 100);
    newVolume = Math.max(0, Math.min(1, newVolume)); // clamp 0 - 1

    video.volume = newVolume;

    console.log("🔊 Volume:", Math.round(newVolume * 100) + "%");
}
// ======================
// Drag
// ======================
    function makeDraggable(el){
    let isDragging = false;
    let offsetX, offsetY;

    // ===== MOUSE (PC) =====
    el.addEventListener("mousedown", (e)=>{
        isDragging = true;
        offsetX = e.clientX - el.getBoundingClientRect().left;
        offsetY = e.clientY - el.getBoundingClientRect().top;
    });

    document.addEventListener("mousemove", (e)=>{
        if(!isDragging) return;
    
        el.style.left = (e.clientX - offsetX) + "px";
        el.style.top = (e.clientY - offsetY) + "px";
    
        el.style.bottom = "auto";   // 🔥 WAJIB
        el.style.transform = "none";
    });

    document.addEventListener("mouseup", ()=>{
        isDragging = false;
    });

    // ===== TOUCH (HP) =====
    el.addEventListener("touchstart", (e)=>{
        isDragging = true;
        const touch = e.touches[0];
        offsetX = touch.clientX - el.getBoundingClientRect().left;
        offsetY = touch.clientY - el.getBoundingClientRect().top;
    });

    document.addEventListener("touchmove", (e)=>{
        if(!isDragging) return;
    
        const touch = e.touches[0];
    
        el.style.left = (touch.clientX - offsetX) + "px";
        el.style.top = (touch.clientY - offsetY) + "px";
    
        el.style.bottom = "auto";   // 🔥 WAJIB
        el.style.transform = "none";
    });

    document.addEventListener("touchend", ()=>{
        isDragging = false;
    });
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

    // ===== RIGHT ======
    const rightContainer = document.createElement('div');
    rightContainer.className = "jump-controls-right";

    const forward5 = document.createElement('button');
    forward5.innerText = "+5";
    forward5.onclick = () => jump(5);

    const forward30 = document.createElement('button');
    forward30.innerText = "+30";
    forward30.onclick = () => jump(30);

    // ===== LEFT ======
    const leftContainer = document.createElement('div');
    leftContainer.className = "jump-controls-left";
    makeDraggable(leftContainer);
 // ===== VOLUME ======
    const volDown = document.createElement('button');
    volDown.innerText = "♫-";
    volDown.onclick = () => changeVolume(-10);
    
    const volUp = document.createElement('button');
    volUp.innerText = "♫+";
    volUp.onclick = () => changeVolume(10);
// ===== //END VOLUME ======
    const back30 = document.createElement('button');
    back30.innerText = "-30";
    back30.onclick = () => jump(-30);

    const back5 = document.createElement('button');
    back5.innerText = "-5";
    back5.onclick = () => jump(-5);

    leftContainer.appendChild(back30);
    leftContainer.appendChild(back5);
    leftContainer.appendChild(volDown);
    leftContainer.appendChild(volUp);
    leftContainer.appendChild(forward5);
    leftContainer.appendChild(forward30);

// ga perlu rightContainer lagi
parent.appendChild(leftContainer);

    // fullscreen fix
    document.addEventListener("fullscreenchange",()=>{
        const fs = document.fullscreenElement;

        if(fs && fs.contains(video)){
            fs.appendChild(rightContainer);
            fs.appendChild(leftContainer);
        }else if(!fs){
            parent.appendChild(rightContainer);
            parent.appendChild(leftContainer);
        }
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

    document.addEventListener('keydown',function(e){

        if(e.key === "ArrowLeft") jump(-5);
        if(e.key === "ArrowRight") jump(5);

        if(e.key === ",") jump(-30);
        if(e.key === ".") jump(30);

    });
}

// ======================
// STYLE
// ======================
const style = document.createElement("style");
style.innerHTML = `
.jump-controls-left{
    display:inline-flex;
    align-items:center;
    height:auto;
    width: fit-content;
    max-width: max-content;
    position:absolute;
    bottom:8px;
    left:20px;
    transform:none;
    display:flex;
    gap:8px;
    z-index:2147483647;
    padding:6px 4px;
    overflow:hidden;
}

.jump-controls-left button{
background: rgba(0,0,0,0.25);
    border:none;
    color:white;
    border-radius:12px;
    padding:8px 16px;
    font-size:18px;
    cursor:pointer;
    transition: 0.2s;
}

.jump-controls-left button:hover{
    background: rgba(255,255,255,0.35);
    transform: scale(1.1);
}

.jump-controls-left{
    cursor: grab;
}

.jump-controls-left:active{
    cursor: grabbing;
}

/* MOBILE */
@media (max-width:768px){

.jump-controls-left{
    bottom:30px;
    gap:22px;
    padding:3px 6px;
}

.jump-controls-left button{
    padding:4px 6px;
    font-size:11px;
}

}
`;
document.head.appendChild(style);
    
// ======================
// LOOP
// ======================
setInterval(detectVideos,1000);

})();
