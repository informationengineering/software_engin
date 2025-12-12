const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

// 1. 中介軟體設定
app.use(cors()); // 允許前端跨網域存取
app.use(express.json()); // 允許解析 JSON 格式的請求

// 2. 匯入路由檔案
const memberRoutes = require('./routes/member');
const movieRoutes = require('./routes/movie');
const bookingRoutes = require('./routes/booking');

// 3. 設定路由路徑 (分配網址)
// 會員組員用的網址開頭都是 /api/member
app.use('/api/member', memberRoutes);

// 電影展示組員用的網址開頭都是 /api/movie
app.use('/api/movie', movieRoutes);

// 訂票/紀錄組員用的網址開頭都是 /api/booking
const bookingRouter = require('./routes/booking');
app.use('/api/booking', bookingRoutes);

// 4. 啟動伺服器
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 伺服器運行於 http://localhost:${PORT}`);
});
