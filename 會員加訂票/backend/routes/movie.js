const express = require('express');
const router = express.Router();
const db = require('../db');

// ./routes/movie.js (新增此路由，用於訂票流程)
// ./routes/movie.js (新增此路由，用於獲取電影場次清單)

// [新增：根據電影ID取得場次清單]
// 前端呼叫：GET http://localhost:3001/api/movie/showtimes?movieId=1
// ./routes/movie.js (修正後的 /showtimes 路由)

router.get('/showtimes', async (req, res) => {
    try {
        const movieId = req.query.movieId; 
        
        if (!movieId) {
            return res.status(400).json({ message: "缺少 movieId 參數" });
        }

        // 🎯 修正後的 SQL 語法：使用正確的表格和欄位名稱
        const sql = `
            SELECT 
                s.showingID, s.showingDate, s.startTime,
                c.cinemaID, c.cinemaName,   -- 來自 cinema 表
                t.theaterName,              -- 來自 theater 表
                v.versionName               -- 來自 playversion 表
            FROM showing s
            JOIN theater t ON s.theaterID = t.theaterID
            JOIN cinema c ON t.cinemaID = c.cinemaID
            JOIN playversion v ON s.versionID = v.versionID 
            WHERE s.movieID = ?
            ORDER BY s.showingDate, s.startTime
        `;

        const [showtimes] = await db.query(sql, [movieId]);
        res.json(showtimes); 
    } catch (error) {
        console.error("查詢場次錯誤:", error);
        res.status(500).json({ error: 'SQL 執行錯誤！請查看後端終端機。' });
    }
});

// ./routes/booking.js (新增此路由)


// ... (您的其他路由: /showing, /all, /detail, /cinemas) ...
// [新增：取得訂票流程所需的電影清單]
// 前端呼叫：GET http://localhost:3001/api/movie/showing
router.get('/showing', async (req, res) => {
    try {
        // ** 請根據您的資料庫邏輯來查詢 **
        // 這裡可以查詢所有電影，或者只查詢有設定場次的電影
        const [showingMovies] = await db.query('SELECT * FROM movie'); 
        
        // 這是確保您的程式碼能夠通過連線錯誤的第一步。
        res.json(showingMovies); 
    } catch (error) {
        // 確保錯誤能被捕獲，防止伺服器崩潰
        res.status(500).json({ error: '無法取得正在上映電影列表: ' + error.message });
    }
});

// [取得所有電影]
// 前端呼叫：GET http://localhost:3001/api/movie/all
router.get('/all', async (req, res) => {
    try {
        const [movies] = await db.query('SELECT * FROM movie');
        res.json(movies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// [取得單一電影詳細資訊]
// 前端呼叫：GET http://localhost:3001/api/movie/detail/1 (1是電影ID)
router.get('/detail/:id', async (req, res) => {
    try {
        const movieID = req.params.id;
        const [movie] = await db.query('SELECT * FROM movie WHERE movieID = ?', [movieID]);
        if (movie.length > 0) {
            res.json(movie[0]);
        } else {
            res.status(404).json({ message: "找不到電影" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// [取得影城列表]
// 前端呼叫：GET http://localhost:3001/api/movie/cinemas
router.get('/cinemas', async (req, res) => {
    try {
        const [cinemas] = await db.query('SELECT * FROM cinema');
        res.json(cinemas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;