const express = require('express');
const router = express.Router();
const db = require('../db'); // 匯入 db.js

// [登入功能]
// 前端呼叫：POST http://localhost:3001/api/member/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // 注意：欄位名稱要跟資料庫一致 (memberEmail, memberPwd)
        const [users] = await db.query(
            'SELECT * FROM memberProfile WHERE memberEmail = ? AND memberPwd = ?',
            [email, password]
        );

        if (users.length > 0) {
            // 登入成功，回傳會員資料 (不含密碼比較安全)
            const user = users[0];
            delete user.memberPwd; 
            res.json({ success: true, message: "登入成功", user });
        } else {
            res.status(401).json({ success: false, message: "帳號或密碼錯誤" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// [註冊功能]
// 前端呼叫：POST http://localhost:3001/api/member/register
router.post('/register', async (req, res) => {
    // 根據規格書 S1~S31 流程，這裡簡化為直接寫入
    const { id, name, email, password, phone, birthday } = req.body;
    try {
        // 先檢查 ID 是否重複
        const [check] = await db.query('SELECT memberID FROM memberProfile WHERE memberID = ?', [id]);
        if (check.length > 0) {
            return res.status(400).json({ success: false, message: "此身分證已註冊" });
        }

        // 寫入資料庫
        const sql = `INSERT INTO memberProfile 
                     (memberID, memberName, memberEmail, memberPwd, memberPhone, memberBirth) 
                     VALUES (?, ?, ?, ?, ?, ?)`;
        await db.query(sql, [id, name, email, password, phone, birthday]);
        
        res.json({ success: true, message: "註冊成功" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 👇 請組員注意：這是新增的 (對應規格書 T 模組 - 儲值)
// ==========================================

// [查詢餘額] (規格書 T2)
// 前端呼叫：GET http://localhost:3001/api/member/balance/:id
router.get('/balance/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT balance FROM memberCashCard WHERE memberID = ?', [req.params.id]);
        if (rows.length > 0) {
            res.json({ balance: rows[0].balance });
        } else {
            // 如果沒卡，可能是新會員，回傳 0
            res.json({ balance: 0 });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// [會員儲值] (規格書 T1, T7)
// 前端呼叫：POST http://localhost:3001/api/member/topup
router.post('/topup', async (req, res) => {
    const { memberID, amount } = req.body;
    try {
        // 更新餘額 (原本餘額 + 儲值金額)
        await db.query(
            'UPDATE memberCashCard SET balance = balance + ? WHERE memberID = ?', 
            [amount, memberID]
        );
        res.json({ success: true, message: "儲值成功" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 👇 請組員注意：這是新增的 (對應規格書 M 模組 - 資料變更)
// ==========================================

// [修改會員資料] (規格書 M1, M6)
// 前端呼叫：PUT http://localhost:3001/api/member/update
router.put('/update', async (req, res) => {
    const { memberID, newPhone, newEmail } = req.body;
    try {
        await db.query(
            'UPDATE memberProfile SET memberPhone = ?, memberEmail = ? WHERE memberID = ?',
            [newPhone, newEmail, memberID]
        );
        res.json({ success: true, message: "資料更新成功" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;