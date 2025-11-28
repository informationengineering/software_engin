// detail.js - 詳細頁邏輯

const urlParams = new URLSearchParams(window.location.search);
let currentMovieId = parseInt(urlParams.get('id'));
const BASE_IMG_URL = 'http://localhost:3001/'; 

// === 輔助函式：依照 SQL 資料表 `grade` 轉換 ID ===
function getGradeName(id) {
    const map = { 
        1: "普遍級", 
        2: "保護級", 
        3: "輔12級", 
        4: "輔15級", 
        5: "限制級" 
    };
    return map[id] || "普遍級";
}

// === 輔助函式：依照 SQL 資料表 `movietype` 轉換 ID ===
function getTypeName(id) {
    const map = { 
        1: "動作", 
        2: "愛情", 
        3: "科幻", 
        4: "恐怖", 
        5: "動畫", 
        6: "劇情" 
    };
    return map[id] || "精選電影";
}

async function initDetailPage() {
    try {
        // 1. 同時抓取「電影」和「影城」資料
        const [movieRes, cinemaRes] = await Promise.all([
            fetch('http://localhost:3001/api/movie/all'),
            // 假設後端有提供 api/cinema/all，如果沒有則會忽略錯誤
            fetch('http://localhost:3001/api/cinema/all').catch(() => null) 
        ]);

        if (!movieRes.ok) throw new Error('無法取得電影資料');

        const movies = await movieRes.json();
        const cinemas = cinemaRes ? await cinemaRes.json() : [];

        console.log('詳細頁拿到電影資料:', movies);

        // 如果沒有指定 ID，預設顯示第一部
        if (!currentMovieId && movies.length > 0) {
            currentMovieId = movies[0].movieID;
        }

        // 2. 建立上方下拉選單
        const dropdown = document.getElementById('movie-selector');
        movies.forEach(m => {
            const option = document.createElement('option');
            option.value = m.movieID;
            option.textContent = m.movieName;
            if (m.movieID === currentMovieId) option.selected = true;
            dropdown.appendChild(option);
        });

        // 選單切換事件
        dropdown.addEventListener('change', function() {
            window.location.href = `detail.html?id=${this.value}`;
        });

        // 3. 找出目前要顯示的那部電影
        const movie = movies.find(m => m.movieID === currentMovieId);

        if (movie) {
            renderMovieDetail(movie, cinemas);
        } else {
            document.body.innerHTML = "<h1 style='text-align:center; padding:100px;'>找不到該電影資料</h1>";
        }

    } catch (error) {
        console.error(error);
        document.body.innerHTML = "<h1 style='text-align:center; padding:100px;'>無法連接資料庫，請檢查後端</h1>";
    }
}

function renderMovieDetail(movie, cinemas) {
    // === 填入電影基本資料 (對應 SQL 欄位) ===
    document.getElementById('bread-title').textContent = movie.movieName;
    document.getElementById('m-title').textContent = movie.movieName;
    // SQL 沒有英文片名欄位，先留空
    document.getElementById('m-en-title').textContent = ""; 
    
    // 處理圖片
    let imgSrc = movie.movieImg;
    if (imgSrc && !imgSrc.startsWith('http')) imgSrc = BASE_IMG_URL + imgSrc;
    document.getElementById('m-poster').src = imgSrc;

    document.getElementById('m-date').textContent = movie.movieStart; // 上映日
    document.getElementById('m-director').textContent = movie.director; // 導演
    document.getElementById('m-cast').textContent = movie.actors; // 主演 (SQL欄位名是 actors)
    document.getElementById('m-length').textContent = movie.movieTime; // 片長
    
    // 類型與分級轉換
    document.getElementById('m-genre').textContent = getTypeName(movie.movieTypeID);
    const ratingTag = document.querySelector('.tag-rating');
    if(ratingTag) ratingTag.textContent = getGradeName(movie.gradeID);

    // 劇情簡介 (SQL欄位名是 movieInfo)
    const desc = movie.movieInfo || "暫無簡介";
    document.getElementById('m-desc').innerHTML = desc.replace(/\n/g, '<br>');

    // === 處理預告片 (SQL欄位名是 movieTrailer) ===
    const trailerSection = document.querySelector('.trailer-section');
    const videoFrame = document.getElementById('m-video');

    if (movie.movieTrailer) {
        trailerSection.style.display = 'block';
        videoFrame.src = movie.movieTrailer; 
    } else {
        trailerSection.style.display = 'none';
    }

    // === 填入右側影城列表 (資料來自 cinema 表) ===
    const formatContainer = document.getElementById('format-list-container');
    formatContainer.innerHTML = '';

    if (cinemas && cinemas.length > 0) {
        const li = document.createElement('li');
        li.textContent = "全台上映影城";
        const popup = document.createElement('div');
        popup.className = 'cinema-popup';

        cinemas.forEach(cinema => {
            const link = document.createElement('a');
            link.className = 'cinema-link';
            // SQL 欄位: cinemaName, googleMap
            link.textContent = `▸ ${cinema.cinemaName}`; 
            if(cinema.googleMap) link.href = cinema.googleMap;
            link.target = "_blank";
            popup.appendChild(link);
        });

        li.appendChild(popup);
        formatContainer.appendChild(li);
    } else {
        formatContainer.innerHTML = '<li style="cursor:default">暫無影城資訊</li>';
    }
    document.querySelector('.booking-title').innerHTML = "<span>🎥</span> 影城資訊";
}

// 啟動頁面邏輯
initDetailPage();