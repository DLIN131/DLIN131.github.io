const toggleBtn = document.querySelectorAll(".toggle-btn")
toggleBtn.forEach(element => {
    element.addEventListener("click",function(){
        document.querySelector('.sidebar').classList.toggle('show');
    })
});
