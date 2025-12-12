const express = require('express');
const router = express.Router();
const db = require('../db');

// ==========================================
// [Part 1] 快速訂票選單 API (保留原樣)
// ==========================================

// 1. 取得所有影城
router.get('/options/cinemas', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM cinema');
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// 2. 根據影城 -> 找電影
router.get('/options/movies', async (req, res) => {
    const { cinemaID } = req.query;
    try {
        const sql = `
            SELECT DISTINCT m.movieID, m.movieName 
            FROM movie m 
            JOIN showing s ON m.movieID = s.movieID 
            WHERE s.theaterID LIKE CONCAT(?, '%')`; 
        const [rows] = await db.query(sql, [cinemaID]);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// 3. 根據影城+電影 -> 找日期
router.get('/options/dates', async (req, res) => {
    const { cinemaID, movieID } = req.query;
    try {
        const sql = `
            SELECT DISTINCT showingDate 
            FROM showing 
            WHERE theaterID LIKE CONCAT(?, '%') AND movieID = ? 
            ORDER BY showingDate`;
        const [rows] = await db.query(sql, [cinemaID, movieID]);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// 4. 根據影城+電影+日期 -> 找場次(時間)
router.get('/options/times', async (req, res) => {
    const { cinemaID, movieID, showDate } = req.query;
    try {
        const sql = `
            SELECT showingID, startTime 
            FROM showing 
            WHERE theaterID LIKE CONCAT(?, '%') AND movieID = ? AND showingDate = ? 
            ORDER BY startTime`;
        const [rows] = await db.query(sql, [cinemaID, movieID, showDate]);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// ==========================================
// [Part 2] 訂票與訂單功能 (新增部分)
// ==========================================

// [送出訂單] (保留原本的結構，這裡假設您有實作或保留)
router.post('/create', async (req, res) => {
    // 這裡放您原本的訂票邏輯
    // 如果還沒寫，可以先回傳一個測試訊息
    res.json({ success: true, message: "訂單建立功能尚未實作" });
});

// [查詢會員訂票紀錄 - 加強版] (對應規格書 In 模組)
router.get('/history/:memberId', async (req, res) => {
    try {
        const sql = `
            SELECT 
                b.orderNumber, b.time, b.seat, b.totalPrice, b.getTicketNum, b.ticketNums,
                m.movieName, m.movieImg,
                s.showingDate, s.startTime,
                c.cinemaName, 
                t.theaterName,
                os.orderStatusName, 
                tc.ticketTypeName   
            FROM bookingRecord b
            JOIN showing s ON b.showingID = s.showingID
            JOIN movie m ON s.movieID = m.movieID
            JOIN theater t ON s.theaterID = t.theaterID
            JOIN cinema c ON t.cinemaID = c.cinemaID
            JOIN orderStatus os ON b.orderStatusID = os.orderStatusID
            JOIN ticketType tc ON b.ticketTypeID = tc.ticketTypeID
            WHERE b.memberID = ?
            ORDER BY b.time DESC`; 
            
        const [records] = await db.query(sql, [req.params.memberId]);
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// [退票功能] (對應規格書 R 模組)
router.put('/refund', async (req, res) => {
    const { orderNumber } = req.body;
    try {
        // 1. 將訂單狀態改為 3 (已取消/已退票)
        await db.query(
            'UPDATE bookingRecord SET orderStatusID = 3 WHERE orderNumber = ?', 
            [orderNumber]
        );
        
        // 2. (進階TODO) 之後記得要把座位的 seatCondition 改回 1 (空位)
        
        res.json({ success: true, message: "退票成功" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
