/**********************************/
//variable and fetch data function//
/**********************************/

const API_KEY = "AIzaSyDiWp98C7yAeOmww4UPauEGc1G0yAgYSIs";
const api = "https://www.googleapis.com/youtube/v3/playlistItems?key=AIzaSyDiWp98C7yAeOmww4UPauEGc1G0yAgYSIs";
const part = "contentDetails,snippet,status";
let playlistId = "";//"PLR3WiLknrVUZX033xFGw8ISMA_RdXUnNk";
const maxResults = 50;
let nextpageT;
// auth = "959560237311-13dbj26mjffjcph7r49pq3c57lbvpgrr.apps.googleusercontent.com"
const videoTitleEle = document.querySelector("#video-title");
const randomBtn = document.querySelector("#random-btn");
const loadImgEle = document.querySelector("#load-img");
const prevSongBtn = document.querySelector("#prev-song");
const nextSongBtn = document.querySelector("#next-song");
const searchBtn = document.querySelector("#search");
const searchListBtn = document.querySelector("#search-list-btn");
const searchListTxt = document.querySelector("#search-list");
const orderBtn = document.querySelector("#order");
const useLocalStorageBtn = document.querySelector("#use-localStorage"); 
const listIdHistory = document.querySelector("#listIdHistoryCollect");
const clearListIdHistory = document.querySelector("#clearListIdHistory");

let orderFlag = true;
let youtubeData = null;
let snippetData=[];
let playlistIdTempArr = [];
let timer;
let oldIndex = -1;
let listIdDataArr = [];

async function fetchData(){
    do{
        const res = await axios.get("https://www.googleapis.com/youtube/v3/playlistItems",{
            params:{
                part: part,// 必填，把需要的資訊列出來
                playlistId: playlistId,// 播放清單的id
                maxResults: maxResults,// 預設為五筆資料，可以設定1~50
                pageToken: nextpageT,
                key: API_KEY
        }
    })
    youtubeData = res.data;
    console.log(youtubeData);
    for(let i=0;i<youtubeData.items.length;i++){
        if(youtubeData.items[i].snippet.title !== "Deleted video" 
        && youtubeData.items[i].snippet.title !=="Private video"){
            snippetData.push(youtubeData.items[i].snippet);
        }
        
    }
    nextpageT = youtubeData.nextPageToken;
    }while(nextpageT !== undefined) 
    console.log(snippetData);
}

// console.log(listIdDataArr);
async function fetchListName(){
    const res = await axios.get("https://www.googleapis.com/youtube/v3/playlists",{
        params:{
            part:"snippet",
            id:playlistId,
            key:API_KEY
        }
    })
    const listIdData = {
        name:res.data.items[0].snippet.title,
        value:playlistId
    }
    // localStorage.removeItem("listIdData");
    setListIdDataArr(listIdData);
    saveListIdData();
    addListIdDataToSelect();
}

 /* 使用locastorage紀錄清單Id資料 */
function saveListIdData(){
    localStorage.setItem("listIdData",JSON.stringify(listIdDataArr));
}
function setListIdDataArr(listIdData){
    if(localStorage.getItem("listIdData") !== null){
        listIdDataArr = JSON.parse(localStorage.getItem("listIdData"));
        for(let i=0;i<listIdDataArr.length;i++){
            if(listIdDataArr[i].value === playlistId){
                return;
            }
        }
    }  
    // console.log(listIdDataArr);
    listIdDataArr.push(listIdData);
}
function addListIdDataToSelect(){
    if(listIdDataArr !== null){
        const listData =  listIdDataArr.map(item => `<option value=${item.value}>${item.name}</option>`);
        listIdHistory.innerHTML = listData;
    }
    
}

function onLoadListIdData(){
    if(JSON.parse(localStorage.getItem("listIdData") !== null)){
        listIdDataArr = JSON.parse(localStorage.getItem("listIdData"));
        addListIdDataToSelect();
    }
}
onLoadListIdData();



listIdHistory.addEventListener("click",function(e){
    document.getElementById("playlist-url").value = e.target.value;
})

/* 清除Id清單歷史紀錄*/
clearListIdHistory.addEventListener("click",function(){
    localStorage.removeItem("listIdData");
    listIdDataArr = [];
    listIdHistory.innerHTML = `<option value = "">null</option>`
})


/****************************************************************/ 
/*                         youtube iframe api                   */ 
/****************************************************************/ 
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);




var player;
let videoId = "";

function onYouTubeIframeAPIReady(){
    player = new YT.Player('player',{
        fitToBackground: true,
        height: '360',
        width: '640',
        videoId: videoId,
        playerVars: { 
        //自訂參數
        // 'autoplay':1,
        'controls': 1, //控制列，0:隱藏，1:顯示(默認)
        //'fs': 0, //全屏按鈕，0:隱藏，1:顯示(默認)
        //'iv_load_policy': 3, //影片註釋，1:顯示(默認)，3:不顯示
        //'rel': 0,//顯示相關視頻，0:不顯示，1:顯示(默認)
        //'modestbranding': 0, //YouTube標籤，0:顯示(默認)，1:不顯示//'playsinline': 1 //在iOS的播放器中全屏播放，0:全屏(默認)，1:內嵌
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          }
    })
}

// 4. The API will call this function when the video player is ready.
let onPlayerReadyEvent;
function onPlayerReady(event) {
    onPlayerReadyEvent = event;
    console.log(event);
    // videoTitleEle.addEventListener("change",function(e){
    //     console.log(e.target);
    // event.target.loadVideoById(e.target.value);
    
    // })

  }



  // 5. The API calls this function when the player's state changes.
      //    The function indicates that when playing a video (state=1),
      //    the player should play for six seconds and then stop.

function onPlayerStateChange(event) {
    // console.log(event);
    clearTimeout(timer);
    timer = setTimeout(()=>{
        if(event.data === -1){
            let index = videoTitleEle.selectedIndex;
            if(videoTitleEle.options[index+1].value !==undefined){
                videoTitleEle.options[index+1].selected = "selected"; 
                index = videoTitleEle.selectedIndex;
                changeOptionBackground(index);
                onPlayerReadyEvent.target.loadVideoById(videoTitleEle.options[index].value);
                updateLocalStorage("listIndex",videoTitleEle.selectedIndex);      
            }
        }
    },1000)
    if(event.data === 0){
        // console.log(event.data); 
        let index = videoTitleEle.selectedIndex;
        if(videoTitleEle.options[index+1].value !==undefined){
            videoTitleEle.options[index+1].selected = "selected"; 
            index = videoTitleEle.selectedIndex;
            changeOptionBackground(index);
            onPlayerReadyEvent.target.loadVideoById(videoTitleEle.options[index].value);
            updateLocalStorage("listIndex",videoTitleEle.selectedIndex);      
        }
        
    }
}
function stopVideo() {
    player.stopVideo();
}

////////////////////////////////////////////////////////////////////////////////////////////
/*************************主要功能分界******************************************************/
///////////////////////////////////////////////////////////////////////////////////////////


// const videoTitleEle = document.querySelector("#video-title");
// videoTitleEle.addEventListener("change",function(e){
//     console.log(e.target.value);
//     onYouTubeIframeAPIReady();
//     player.videoId = e.target.value;
//     console.log(player.event);
    
// })



//建立播放清單到select區域
function appendVideoTitle(mapData){
    videoTitleEle.style.display = "block";
    let optionMap = mapData.map(item => `<option value=${item.resourceId.videoId} index=${item.position}>${item.position+'.'+item.title}</option>`);
    console.log(optionMap);
    videoTitleEle.innerHTML = optionMap;
}

//檢查播放清單id
function checkPlaylistIdExist(playlistId,idArr){
    for (let i = 0; i < idArr.length; i++) {
        if(playlistId === idArr[i]){
            alert("playlist had been exist");
            return true;
        }
    }
    idArr.push(playlistId);
    return false;
}








//主要執行獲取資料函式與一些基本設定
async function main(){
    loadImgEle.style.display = "inline";
    searchBtn.disabled = true;
    try{
        await fetchListName();
        await fetchData();
    }catch(e){
        // console.log(e);
        alert("the playlist id is not exist or uncorrect");
    }
    
    loadImgEle.style.display = "none";
    searchBtn.disabled = false;
    updateLocalStorage("playlist",snippetData);
    // console.log(snippetData.length);
    nextSongBtn.style.display = prevSongBtn.style.display = randomBtn.style.display = "inline";
    appendVideoTitle(snippetData);
   
}

//appendPlaylistEvent
searchBtn.addEventListener("click",function(){
    const PLID = document.getElementById("playlist-url").value;
    if(!checkPlaylistIdExist(PLID,playlistIdTempArr)){
        playlistId = PLID;
        main();
    }
    
})










//////////////////////////////////////////////////////////////////////
//***********************************localStorage******************//
/////////////////////////////////////////////////////////////////////
function updateLocalStorage(keyName ,value){
    localStorage.setItem(keyName,JSON.stringify(value));
    // console.log("localstorage");
}
function useLocalStorageItem(keyName){
    snippetData = JSON.parse(localStorage.getItem(keyName));
    // console.log("localStorageList"+snippetData);
    appendVideoTitle(snippetData);
    let index = localStorage.getItem("listIndex");
    videoTitleEle.options[index].selected = "selected";
    changeOptionBackground(index);
    onPlayerReadyEvent.target.loadVideoById(videoTitleEle.options[index].value);
}
useLocalStorageBtn.addEventListener("click",function(){
    useLocalStorageItem("playlist");
})
















/////////////////////////////////////////////////////////////////////
//////**********************button area function*******************//
////////////////////////////////////////////////////////////////////

//將選項的背景顏色修改
function changeOptionBackground(index){
    if(oldIndex !== index && oldIndex !== -1){
        videoTitleEle.options[oldIndex].style.background = "linear-gradient(rgb(44, 245, 195) 80%, hwb(0 3% 97%))";
    }
    oldIndex = index;
    // console.log(index);
    videoTitleEle.options[index].style.background = "yellow";
}

//點擊清單切換
videoTitleEle.addEventListener("change",function(e){
    e.preventDefault();
    console.log(e.target);
    let index = videoTitleEle.selectedIndex;
    changeOptionBackground(index);
    onPlayerReadyEvent.target.loadVideoById(e.target.value);
    updateLocalStorage("listIndex",videoTitleEle.selectedIndex);      
    
})

//切換上一首
function changeToPrevSong(e){
    let index = videoTitleEle.selectedIndex;
    if(videoTitleEle.options[index-1].value !==undefined){
        videoTitleEle.options[index-1].selected = "selected"; 
        index = videoTitleEle.selectedIndex;
        changeOptionBackground(index);
        onPlayerReadyEvent.target.loadVideoById(videoTitleEle.options[index].value);
        updateLocalStorage("listIndex",videoTitleEle.selectedIndex);      
        
    }
}
prevSongBtn.addEventListener("click",changeToPrevSong);

//切換下一首
function changeToNextSong(e){
    let index = videoTitleEle.selectedIndex;
    if(videoTitleEle.options[index+1].value !==undefined){
        videoTitleEle.options[index+1].selected = "selected"; 
        index = videoTitleEle.selectedIndex;
        changeOptionBackground(index);
        onPlayerReadyEvent.target.loadVideoById(videoTitleEle.options[index].value);
        updateLocalStorage("listIndex",videoTitleEle.selectedIndex);      
        
    }
}
nextSongBtn.addEventListener("click",changeToNextSong);


//隨機排列
function Shuffle(arr){
    for (let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
}

let shuffleArr;
let shuffleFlag = false;
randomBtn.addEventListener("click",function(){
    shuffleArr = snippetData.slice(0);
    shuffleFlag = true;
    orderFlag = false;
    Shuffle(shuffleArr);
    appendVideoTitle(shuffleArr); 
})
//順序排列
orderBtn.addEventListener("click",function(){
    if(!orderFlag){
        appendVideoTitle(snippetData);
    }
    shuffleFlag = false;
})



//搜尋歌曲
searchListBtn.addEventListener("click",function(){
    const videoName = searchListTxt.value.trim().toLowerCase();
    console.log(videoName);
    let result;
    if(shuffleFlag){
        result = shuffleArr.filter((item) => item.title.toLowerCase().match(videoName));
    }
    else{
        result = snippetData.filter((item) => item.title.toLowerCase().match(videoName));
    }
    console.log(result);
    appendVideoTitle(result);
})


/********************************************************************************************/
/*                                       鍵盤控制                                           */
/*******************************************************************************************/

document.addEventListener("keydown",function(e){
    console.log(e.key);
    let currentTime = onPlayerReadyEvent.target.getCurrentTime();
    let volume = onPlayerReadyEvent.target.getVolume();
    switch(e.key){
        case "w":
            try {
                changeToPrevSong();
            } catch (error) {
                console.log(error);
            }
            break;
        case "s":
            try {
                changeToNextSong();
            } catch (error) {
                console.log(error);
            }
            break;
        case "a":
            try {
                currentTime-=5;
                onPlayerReadyEvent.target.seekTo(currentTime);
            } catch (error) {
                console.log(error);
            }
            break;
        case "d":
            try {
                currentTime+=5;
                onPlayerReadyEvent.target.seekTo(currentTime);
            } catch (error) {
                console.log(error);
            }
            break;
        case "ArrowUp":
            try {
                e.preventDefault();
                volume+=5;
                onPlayerReadyEvent.target.setVolume(volume);
            } catch (error) {
                console.log(error);
            }
            break;
        case "ArrowDown":
            try {
                e.preventDefault();
                volume-=5;
                onPlayerReadyEvent.target.setVolume(volume);
            } catch (error) {
                console.log(error);
            }
            break;
        default:
            break;
    }
})

