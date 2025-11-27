require('dotenv').config(); // 讀取 .env 的設定
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 測試連線
pool.getConnection()
    .then(conn => {
        console.log("✅ MySQL 資料庫連線成功！");
        conn.release();
    })
    .catch(err => {
        console.error("❌ 資料庫連線失敗:", err);
    });

module.exports = pool;