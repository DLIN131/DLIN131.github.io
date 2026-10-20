const prevImgBtn = document.querySelector("#prevImg");
const nextImgBtn = document.querySelector("#nextImg");
////////////////////////////////////////////////////////////////////////////////////////////
/*                            控制網頁背景圖更換                                           */
///////////////////////////////////////////////////////////////////////////////////////////

// 兩個背景層交替淡入淡出，切換時不會閃白
const bgArr = ["./img/bg-red.png","./img/bg-blue.png","./img/bg01.png","./img/bg02.png","./img/bg03.jpg","./img/bg04.jpg"];
const bgLayers = [document.querySelector("#bg-layer-a"), document.querySelector("#bg-layer-b")];
let activeLayer = 0;
let bgIndex = Number(localStorage.getItem("bgIndex"));
if(!(bgIndex >= 0 && bgIndex < bgArr.length)){
    bgIndex = 0;
}
let bgRequest = 0;

function showBackground(index){
    const request = ++bgRequest;
    const url = bgArr[index];
    // 先把圖片載好再切換，避免淡入到一半的空白畫面
    const img = new Image();
    img.onload = img.onerror = function(){
        if(request !== bgRequest) return;
        const next = bgLayers[1 - activeLayer];
        next.style.backgroundImage = `url("${url}")`;
        next.classList.add("active");
        bgLayers[activeLayer].classList.remove("active");
        activeLayer = 1 - activeLayer;
    };
    img.src = url;
    localStorage.setItem("bgIndex", index);
}

function stepBackground(step){
    bgIndex = (bgIndex + step + bgArr.length) % bgArr.length;
    showBackground(bgIndex);
}

prevImgBtn.addEventListener("click",function(){
    stepBackground(-1);
})
nextImgBtn.addEventListener("click",function(){
    stepBackground(1);
})

// 手機版不顯示背景圖
if(!window.matchMedia("(max-width: 450px)").matches){
    showBackground(bgIndex);
}
