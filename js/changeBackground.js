const prevImgBtn = document.querySelector("#prevImg");
const nextImgBtn = document.querySelector("#nextImg");
////////////////////////////////////////////////////////////////////////////////////////////
/*                            控制網頁背景圖更換                                           */
///////////////////////////////////////////////////////////////////////////////////////////

let bgArr = ["../img/bg01.png","../img/bg02.png","../img/bg03.jpg","../img/bg04.jpg"];
let bg = "url(\"../img/bg.png\")"
let backgroundPostion = 0;
let bgIndex = bgArr.length-1;
let bgUrl = bg;
let intV = null;
const backgroundMoveDelay = 1200000;
// function changeBackgroundPosition(positionOffset){
//     backgroundPostion += positionOffset;
//     if(backgroundPostion>99.99){
//         backgroundPostion = 0;
//     }
//     else if(backgroundPostion<0){
//         backgroundPostion = 99.99;
//     }
//     // console.log(bgUrl);
//     // document.body.style.backgroundImage = bgUrl;
//     document.body.style.backgroundSize = "400% 100%";
//     document.body.style.backgroundPositionX = backgroundPostion + "%";
// }

// function autoPlayBg(){
//     intV =  setInterval(()=>{
//         // bgIndex++;
//         // if(bgIndex>bgArr.length-1){
//         //     bgIndex = 0;
//         // }
//         changeBackgroundPosition(33.33);
//     },backgroundMoveDelay);
// }
// autoPlayBg();

prevImgBtn.addEventListener("click",function(){
    bgIndex--;
    if(bgIndex < 0){
        bgIndex = bgArr.length-1;
    }
    let bgUrl = `url(\"${bgArr[bgIndex]}\")`;
    // console.log(bgUrl);
    document.body.style.backgroundImage = bgUrl;
    // clearInterval(intV);
    // changeBackgroundPosition(-33.33)
    // autoPlayBg();
})
nextImgBtn.addEventListener("click",function(){
    bgIndex++;
    if(bgIndex>bgArr.length-1){
        bgIndex = 0;
    }
    let bgUrl = `url(\"${bgArr[bgIndex]}\")`;
    // console.log(bgUrl);
    document.body.style.backgroundImage = bgUrl;
    // clearInterval(intV);
    // changeBackgroundPosition(33.33);
    // autoPlayBg();
})
