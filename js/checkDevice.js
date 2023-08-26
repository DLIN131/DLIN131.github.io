const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (!isMobile) {
            // 如果不是手機，載入指定的 JS 檔案
            const script = document.createElement('script');
            script.src = './js/live2d.js'; // 替換為你的 JS 檔案路徑
            script.defer = true; // 延遲載入，保證在 body 結束後載入
            document.body.appendChild(script);
        }