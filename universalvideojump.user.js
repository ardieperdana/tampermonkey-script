// ==UserScript==
// @name         Universal Video Jump 5s + 30s PRO (FIXED)
// @namespace    jump5s
// @version      5.0
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
    "outlook.com"
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

    rightContainer.appendChild(forward5);
    rightContainer.appendChild(forward30);

    // ===== LEFT ======
    const leftContainer = document.createElement('div');
    leftContainer.className = "jump-controls-left";

    const back30 = document.createElement('button');
    back30.innerText = "-30";
    back30.onclick = () => jump(-30);

    const back5 = document.createElement('button');
    back5.innerText = "-5";
    back5.onclick = () => jump(-5);

    leftContainer.appendChild(back30);
    leftContainer.appendChild(back5);

    parent.appendChild(rightContainer);
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
.jump-controls-right{
    position:absolute;
    bottom:300px;
    right:60px;
    display:flex;
    gap:10px;
    z-index:2147483647;
}

.jump-controls-left{
    position:absolute;
    bottom:300px;
    left:60px;
    display:flex;
    gap:10px;
    z-index:2147483647;
}

.jump-controls-right button,
.jump-controls-left button{
    background: rgba(0,0,0,0.3);
    border:none;
    color:white;
    border-radius:50px;
    padding:10px 14px;
    font-size:16px;
    cursor:pointer;
}

@media (max-width:768px){

.jump-controls-right{
    bottom:80px;
    right:15px;
}

.jump-controls-left{
    bottom:80px;
    left:15px;
}

.jump-controls-right button,
.jump-controls-left button{
    padding:14px 18px;
    font-size:18px;
}

}
`;
document.head.appendChild(style);

// ======================
// LOOP
// ======================
setInterval(detectVideos,1000);

})();
