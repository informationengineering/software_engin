// home.js - 首頁邏輯

const container = document.getElementById('banner-container');
// 設定後端圖片的基礎網址 (請依據你的後端設定調整，通常是 http://localhost:3001/)
const BASE_IMG_URL = 'http://localhost:3001/'; 

async function fetchMovies() {
    try {
        // 1. 抓取電影資料
        const response = await fetch('http://localhost:3001/api/movie/all');
        
        if (!response.ok) {
            throw new Error('API 回應錯誤');
        }

        const movies = await response.json();
        console.log('首頁成功拿到電影:', movies);

        container.innerHTML = '';

        movies.forEach(item => {
            // 處理圖片路徑：如果是相對路徑 (img/movies/...)，就補上 base url
            let imgSrc = item.movieImg;
            if (imgSrc && !imgSrc.startsWith('http')) {
                imgSrc = BASE_IMG_URL + imgSrc;
            }

            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            
            // 使用 SQL 資料表中的欄位：movieID, movieName, movieStart
            slide.innerHTML = `
                <a href="detail.html?id=${item.movieID}" style="display:block; width:100%; height:100%;">
                    <img src="${imgSrc}" alt="${item.movieName}">
                    
                    <div class="slide-info">
                        <h2>${item.movieName}</h2>
                        <p>${item.movieStart} 上映</p>
                    </div>

                    <div class="booking-overlay">
                        <span class="booking-link">安裝官方APP訂票</span>
                        <span class="booking-link">官網線上訂票</span>
                    </div>
                </a>
            `;
            container.appendChild(slide);
        });

        // 初始化輪播
        new Swiper('.swiper', {
            loop: true,
            autoplay: { delay: 5000 },
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
            pagination: { el: '.swiper-pagination' },
        });

    } catch (error) {
        console.error('抓取資料失敗:', error);
        container.innerHTML = '<div style="color:white; padding:50px; text-align:center;">連線失敗，請確認後端伺服器已開啟</div>';
    }
}

// 執行
fetchMovies();