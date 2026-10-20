// 等 DOM 與 less 樣式都完成後才淡出載入畫面，避免看到未套用樣式的畫面
// （背景圖、Live2D 與 YouTube 播放器會各自淡入，不必等它們全部載完）
(function(){
    const pageLoaded = new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
    const lessReady = new Promise(resolve => {
        const check = () => {
            if (window.less && window.less.pageLoadFinished) {
                window.less.pageLoadFinished.then(resolve, resolve);
            } else {
                setTimeout(check, 50);
            }
        };
        check();
    });
    // 最多等 8 秒，避免 CDN 異常時卡在載入畫面
    const timeout = new Promise(resolve => setTimeout(resolve, 8000));

    Promise.race([Promise.all([pageLoaded, lessReady]), timeout]).then(() => {
        const loadingContainer = document.querySelector('.loading-container');
        loadingContainer.classList.add('hide');
    });
})();
