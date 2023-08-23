const downloadpageBox = document.querySelector(".downloadpage-box");
const searchListBtn = document.querySelector("#search-list-btn");
const searchListTxt = document.querySelector("#search-list");



function showResults(data){
    let htmlResults =  data.map(item => 
        `
        <div class="list-item-container" id=${item.resourceId.videoId}>
            <div class="list-item">
                <img src=${item.thumbnails.default.url}></img>
                <div><p>${item.position+1} ${item.title}</p></div>
            </div>
        </div>
        `
    )
    let videolistHTML = htmlResults.join("");
    downloadpageBox.innerHTML = videolistHTML;
    downLoadSong();
}

function searchSong(data){
    const videoName = searchListTxt.value.trim().toLowerCase();
    // console.log(videoName);
    let result = data.filter((item) => item.title.toLowerCase().match(videoName));
    showResults(result)
}


//將每個元素添加事件處理並進行下載的動作
async function downLoadSong(){
    const listEle = downloadpageBox.querySelectorAll(".list-item-container");
    // console.log(listEle);
    listEle.forEach((element) => {
        element.addEventListener("click",async (e) => {
            e.preventDefault();
            const params = {
                videoId: element.getAttribute("id"),
                title: element.querySelector("p").innerHTML
            }
            // console.log(params);
            try {
              const response = await fetch(`https://ytdl-server-byvu.onrender.com/${params.videoId}`);
              const blob = await response.blob();
            //   console.log(blob);
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${params.title}.mp3`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            } catch (error) {
              alert("server side has error");
            }
          })
    });
}

async function  main(){
    //獲取存在localstorage的清單
    let listdataArr = JSON.parse(localStorage.getItem("playlist"));

    if (listdataArr){
        showResults(listdataArr);
        searchListBtn.addEventListener("click",function(){
            searchSong(listdataArr);
        });
        searchListTxt.addEventListener('keydown', function(event) {
            if (event.key === "Enter") {
                searchSong(listdataArr); // 执行搜索操作
            }
        });
    }
    else{
        downloadpageBox.innerHTML = `<div>no data</div>`
    }
    
}
main();
