const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
// ... (前面的 showing 與 seats 相關 API 不用改，保留原樣即可) ...
// 為了節省篇幅，這裡省略 showing 和 seats 的 API，請保留原本的。
// ./routes/booking.js (新增此路由)

// [新增：取得所有票種清單]
// 前端呼叫：GET http://localhost:3001/api/booking/ticketclass
router.get('/ticketclass',authMiddleware, async (req, res) => {
    try {
        // 🎯 查詢 ticketclass 表格，獲取 ID, 名稱和價格
        const [classes] = await db.query('SELECT * FROM ticketclass');
        
        // 檢查數據是否為空 (建議加入)
        if (classes.length === 0) {
            return res.status(404).json({ message: "資料庫中沒有票種資訊。" });
        }
        
        res.json(classes);
    } catch (error) {
        console.error("查詢票種錯誤:", error);
        res.status(500).json({ error: 'SQL 執行錯誤，無法載入票種資訊。' });
    }
});

// ./routes/booking.js (新增座位狀態 API)
router.get('/seatcondition/:showingId',authMiddleware, async (req, res) => {
    try {
        const showingId = req.params.showingId; // 獲取 URL 參數中的場次 ID
        
        if (!showingId) {
            return res.status(400).json({ message: "缺少場次 ID 參數" });
        }
        
        // 🎯 查詢 seatcondition 表格，獲取該場次的所有座位狀態
        const [seats] = await db.query(
            'SELECT * FROM seatcondition WHERE showingID = ?', 
            [showingId]
        );
        
        if (seats.length === 0) {
            // 如果資料庫中沒有該場次的座位資訊，返回 404
            return res.status(404).json({ message: "該場次無座位資訊或場次 ID 錯誤。" });
        }
        
        res.json(seats);
    } catch (error) {
        console.error("查詢座位狀態錯誤:", error);
        res.status(500).json({ error: 'SQL 執行錯誤，無法載入座位資訊。' });
    }
});

// ./routes/booking.js (新增餐點菜單 API)

// [新增：取得所有餐點及類型名稱]
// 前端呼叫：GET http://localhost:3001/api/booking/meals/menu
router.get('/meals/menu',authMiddleware, async (req, res) => {
    try {
        // 🎯 JOIN meals 和 mealstype，以取得中文分類名稱
        const sql = `
            SELECT 
                m.mealsID, m.mealsName, m.mealsPrice, m.mealsPhoto, 
                mt.MealsTypeName   /* 關鍵：前端需要這個欄位來分類 */
            FROM meals m
            JOIN mealstype mt ON m.mealsTypeID = mt.mealsTypeID;
        `;
        const [meals] = await db.query(sql);
        
        // 檢查數據是否為空
        if (meals.length === 0) {
            return res.status(404).json({ message: "資料庫中沒有餐點菜單資訊。" });
        }
        
        res.json(meals);
    } catch (error) {
        console.error("查詢餐點菜單錯誤:", error);
        res.status(500).json({ error: 'SQL 執行錯誤，無法載入餐點菜單資訊。' });
    }
});
// [送出訂單] (保留原本的，不用改)
// ./routes/booking.js (最終結帳 /create 路由)

router.post('/create',authMiddleware, async (req, res) => {
    const memberID = req.user.memberID;
    
    // 假設前端傳入的 payload 包含所有這些欄位
    const {  showingID, seats, chooseMeal, ticketTypeID, ticketNums, totalPrice } = req.body; 
    
    // 預先產生訂單號碼和取票序號
    const orderNumber = 'ORD' + Date.now(); 
    const getTicketNum = Math.floor(10000 + Math.random() * 90000); 

    // 處理訂單狀態：2 (已付款)
    const orderStatusID = 2; 

    try {
        const sql = `
            INSERT INTO bookingrecord 
            (orderNumber, memberID, showingID, time, seat, chooseMeal, ticketTypeID, ticketNums, orderStatusID, totalPrice, getTicketNum) 
            VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?)
        `;
        
        await db.query(sql, [
            orderNumber, 
            memberID, 
            showingID, 
            seats, 
            chooseMeal, 
            ticketTypeID, 
            ticketNums, 
            orderStatusID, 
            totalPrice, 
            getTicketNum
        ]);

        // 成功後返回訂單資訊給前端
        res.json({ success: true, message: '訂單建立成功', orderNumber, getTicketNum });

    } catch (error) {
        console.error("建立訂單失敗:", error);
        // 🚨 關鍵：失敗時一定要回傳 success: false，否則前端會卡住
        res.status(500).json({ success: false, message: '伺服器處理訂單錯誤', error: error.message });
    }
});

// ==========================================
// 👇 請組員注意：這裡有重大更新 (對應規格書 In 模組)
// ==========================================

// [查詢會員訂票紀錄 - 加強版]
// 前端呼叫：GET http://localhost:3001/api/booking/history/:memberId
// 修正：原本只回傳 ID，現在透過 JOIN 回傳中文名稱 (影城名、狀態名)
router.get('/history/:memberId',authMiddleware, async (req, res) => {
    const memberIDFromToken = req.user.memberID;
    if (memberIDFromToken !== req.params.memberId) {
         return res.status(403).json({ error: "無權存取其他會員的記錄" });
    }

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
            
        const [records] = await db.query(sql, [memberIDFromToken]);
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
router.put('/refund', authMiddleware,async (req, res) => {
    const memberIDFromToken = req.user.memberID;
    const { orderNumber } = req.body;

    try {
        const [orderCheck] = await db.query(
            'SELECT memberID FROM bookingRecord WHERE orderNumber = ?',
            [orderNumber]
        );
        
        if (orderCheck.length === 0 || orderCheck[0].memberID !== memberIDFromToken) {
            return res.status(403).json({ success: false, message: "無權操作此訂單或訂單不存在" });
        }

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