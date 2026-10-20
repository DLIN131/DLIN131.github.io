const sidebarEle = document.querySelector('.sidebar');
const toggleBtn = document.querySelectorAll(".toggle-btn")

function setSidebar(open){
    sidebarEle.classList.toggle('show', open);
    document.body.classList.toggle('sidebar-open', open);
}

toggleBtn.forEach(element => {
    element.addEventListener("click",function(){
        setSidebar(!sidebarEle.classList.contains('show'));
    })
});

document.addEventListener("keydown",function(e){
    if(e.key === "Escape" && sidebarEle.classList.contains('show')){
        setSidebar(false);
    }
});
