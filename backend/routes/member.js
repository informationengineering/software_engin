const express = require('express');
const router = express.Router();
const db = require('../db');

// ==========================================
// [API 1] 取得忘記密碼題目列表 (隨機排序)
// 前端呼叫：GET http://localhost:3001/api/member/questions
// ==========================================
router.get('/questions', async (req, res) => {
    try {
        // 雖然只選一題，但列表還是隨機排序給使用者選比較好
        const [questions] = await db.query('SELECT * FROM memberPwdQuestion ORDER BY RAND()');
        res.json(questions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// [API 2] 登入功能
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.query(
            'SELECT * FROM memberProfile WHERE memberEmail = ? AND memberPwd = ?',
            [email, password]
        );
        if (users.length > 0) {
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

// ==========================================
// [API 3] 註冊功能 (回歸單一問答)
// 對應規格書 S20~S23
// ==========================================
router.post('/register', async (req, res) => {
    // 接收前端資料：現在只需要單一的 pwdHintId 和 pwdHintAns
    const { id, name, email, password, phone, birthday, pwdHintId, pwdHintAns } = req.body;
    
    try {
        // 1. 檢查 ID 是否重複
        const [check] = await db.query('SELECT memberID FROM memberProfile WHERE memberID = ?', [id]);
        if (check.length > 0) {
            return res.status(400).json({ success: false, message: "此身分證已註冊" });
        }

        // 2. 寫入資料庫
        // 直接將問題 ID 和答案寫入 memberProfile，完全符合規格書 P.167
        const sql = `
            INSERT INTO memberProfile 
            (memberID, memberName, memberEmail, memberPwd, memberPhone, memberBirth, memberPwdHintId, memberPwdHintAns, memberConfirm) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, '111111')
        `;
        
        await db.query(sql, [id, name, email, password, phone, birthday, pwdHintId, pwdHintAns]);
        
        res.json({ success: true, message: "註冊成功" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// [API 4] 查詢餘額
router.get('/balance/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT balance FROM memberCashCard WHERE memberID = ?', [req.params.id]);
        res.json({ balance: rows.length > 0 ? rows[0].balance : 0 });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// [API 5] 會員儲值
router.post('/topup', async (req, res) => {
    const { memberID, amount } = req.body;
    try {
        const [check] = await db.query('SELECT * FROM memberCashCard WHERE memberID = ?', [memberID]);
        if (check.length === 0) {
            await db.query('INSERT INTO memberCashCard (memberID, balance) VALUES (?, ?)', [memberID, amount]);
        } else {
            await db.query('UPDATE memberCashCard SET balance = balance + ? WHERE memberID = ?', [amount, memberID]);
        }
        res.json({ success: true, message: "儲值成功" });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// [API 6] 修改會員資料
router.put('/update', async (req, res) => {
    const { memberID, newPhone, newEmail } = req.body;
    try {
        await db.query('UPDATE memberProfile SET memberPhone = ?, memberEmail = ? WHERE memberID = ?', [newPhone, newEmail, memberID]);
        res.json({ success: true, message: "資料更新成功" });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
