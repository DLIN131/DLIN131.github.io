// 播放器介面設定：位置（靠左 / 置中 / 靠右）與卡片背景模糊度
(function(){
    const STORAGE_KEY = "uiSettings";
    const DEFAULTS = { layout: "left", blur: 16 };

    let settings;
    try {
        settings = Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(STORAGE_KEY)));
    } catch (e) {
        settings = Object.assign({}, DEFAULTS);
    }

    const layoutBtns = document.querySelectorAll("#ui-layout [data-layout]");
    const blurInput = document.getElementById("ui-blur");
    const blurVal = document.getElementById("ui-blur-val");

    function apply(){
        document.body.dataset.layout = settings.layout;
        document.documentElement.style.setProperty("--card-blur", settings.blur + "px");
        layoutBtns.forEach(btn => btn.classList.toggle("active", btn.dataset.layout === settings.layout));
        blurInput.value = settings.blur;
        blurVal.textContent = settings.blur + "px";
        blurInput.style.setProperty("--fill", (settings.blur / blurInput.max) * 100 + "%");
    }

    function save(){
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }

    layoutBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            settings.layout = btn.dataset.layout;
            apply();
            save();
        });
    });
    blurInput.addEventListener("input", () => {
        settings.blur = Number(blurInput.value);
        apply();
        save();
    });

    apply();
})();
