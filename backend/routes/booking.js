const express = require('express');
const router = express.Router();
const db = require('../db');

// ... (前面的 showing 與 seats 相關 API 不用改，保留原樣即可) ...
// 為了節省篇幅，這裡省略 showing 和 seats 的 API，請保留原本的。

// [送出訂單] (保留原本的，不用改)
router.post('/create', async (req, res) => {
    // ... (保留原本程式碼) ...
});

// ==========================================
// 👇 請組員注意：這裡有重大更新 (對應規格書 In 模組)
// ==========================================

// [查詢會員訂票紀錄 - 加強版]
// 前端呼叫：GET http://localhost:3001/api/booking/history/:memberId
// 修正：原本只回傳 ID，現在透過 JOIN 回傳中文名稱 (影城名、狀態名)
router.get('/history/:memberId', async (req, res) => {
    try {
        const sql = `
            SELECT 
                b.orderNumber, b.time, b.seat, b.totalPrice, b.getTicketNum, b.ticketNums,
                m.movieName, m.movieImg,
                s.showingDate, s.startTime,
                c.cinemaName, 
                t.theaterName,
                os.orderStatusName, -- 回傳 "已付款" 而不是 "2"
                tc.ticketTypeName   -- 回傳 "一般" 而不是 "1"
            FROM bookingRecord b
            JOIN showing s ON b.showingID = s.showingID
            JOIN movie m ON s.movieID = m.movieID
            JOIN theater t ON s.theaterID = t.theaterID
            JOIN cinema c ON t.cinemaID = c.cinemaID
            JOIN orderStatus os ON b.orderStatusID = os.orderStatusID
            JOIN ticketType tc ON b.ticketTypeID = tc.ticketTypeID
            WHERE b.memberID = ?
            ORDER BY b.time DESC`; // 照時間新到舊排
            
        const [records] = await db.query(sql, [req.params.memberId]);
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 👇 請組員注意：這是新增的 (對應規格書 R 模組)
// ==========================================

// [退票功能]
// 前端呼叫：PUT http://localhost:3001/api/booking/refund
router.put('/refund', async (req, res) => {
    const { orderNumber } = req.body;
    try {
        // 1. 將訂單狀態改為 3 (已取消) 或 4 (已退款)
        // 根據規格書 R8: RecordRefund
        await db.query(
            'UPDATE bookingRecord SET orderStatusID = 3 WHERE orderNumber = ?', 
            [orderNumber]
        );
        
        // 2. (進階) 應該要把座位釋放出來 (將 seatCondition 改回 1)
        // 這邊簡化處理，先只改狀態
        
        res.json({ success: true, message: "退票成功" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;