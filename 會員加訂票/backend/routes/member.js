const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'a'; // 👈 強制使用這個值
console.log('Signing Secret (Hex):', Buffer.from(JWT_SECRET, 'utf8').toString('hex'));
// 🎯 檢查點 1: 請確認 '../db' 路徑是正確的！
const db = require('../db'); 
console.log('DB connection module loaded successfully.');
// 輔助函式：由於 API 6 現在直接從 DB 查詢問題文本，我們不需要這個輔助函式了。
// 但為了 API 1 的隨機題目列表，我們需要確保 memberPwdQuestion 表格中包含題目文本。

// 🎯 診斷 Log，用於確認路由檔是否被載入
console.log('--- Member Routes Loaded ---'); 

// =========================================================================
// [API 1] 取得忘記密碼題目列表 (GET /api/member/questions)
// =========================================================================
router.get('/questions', async (req, res) => {
    try {
        // 假設 memberPwdQuestion 表格中有名為 memberPwdHintContent 的欄位
        const [questions] = await db.query('SELECT * FROM memberPwdQuestion ORDER BY RAND()');
        res.json(questions);
    } catch (error) { 
        console.error("API 1 錯誤:", error);
        res.status(500).json({ success: false, error: error.message }); 
    }
});

// ----------------------------------------------------------------------
// [API 2] 會員登入 (POST /api/member/login)
// ----------------------------------------------------------------------
router.post('/login', async (req, res) => {
    const { email, password } = req.body; 
    try {
        const [users] = await db.query(
            'SELECT * FROM memberprofile WHERE memberEmail = ? AND memberPwd = ?',
            [email, password] 
        );
        
        if (users.length > 0) {
            const user = users[0];
            delete user.memberPwd; 

            const token = jwt.sign(
            { memberID: user.memberID, memberEmail: user.memberEmail }, 
            JWT_SECRET, 
            { expiresIn: '1h' } // 設定 Token 有效期限，例如 1 小時
        );
        console.log('JWT_SECRET used for signing:', JWT_SECRET); 
        console.log('Generated Token:', token);
            res.json({ success: true, user: user, memberID: user.memberID, message: "登入成功",token: token }); 
        } else {
            res.status(401).json({ success: false, message: "帳號或密碼錯誤" });
        }
    } catch (error) {
        console.error("API 2 錯誤:", error);
        res.status(500).json({ success: false, message: '伺服器錯誤，無法完成登入。' });
    }
});

// ----------------------------------------------------------------------
// [API 3] 會員註冊 (POST /api/member/register)
// ----------------------------------------------------------------------
// ./routes/member.js (新增會員註冊路由)

// ----------------------------------------------------------------------
// [API 1] 會員註冊 (POST /api/member/register)
// ----------------------------------------------------------------------
router.post('/register', async (req, res) => {
    // 🎯 從前端 Register.jsx 接收所有欄位
    const { 
        memberID, 
        memberName, 
        memberEmail, 
        memberPwd, 
        memberPhone, 
        memberBirth, 
        memberPwdHintID, 
        memberPwdHintAns,
        memberPayAccount
    } = req.body;

    // --- 1. 檢查必填欄位 ---
    // 根據您的資料表 (image_91a21a.png)，memberID、memberEmail 和 memberPwd 應為必填。
    if (!memberID || !memberName || !memberEmail || !memberPwd || !memberPhone || 
        !memberBirth || !memberPwdHintID || !memberPwdHintAns || !memberPayAccount) 
    { 
        return res.status(400).json({ 
            success: false, 
            message: '所有欄位都是必填的，請勿留空。' 
        });
    }

    try {
        // --- 2. 檢查帳號是否重複 ---
        const [existingUser] = await db.query(
            // 檢查 memberID 或 memberEmail 是否已存在
            'SELECT memberID FROM memberprofile WHERE memberID = ? OR memberEmail = ?',
            [memberID, memberEmail]
        );

        if (existingUser.length > 0) {
            // 如果重複，通常返回 409 Conflict，但也可返回一般錯誤訊息
            return res.status(409).json({ success: false, message: '會員ID或Email已被註冊' });
        }

        // --- 3. 執行註冊 (新增資料) ---
        const [result] = await db.query(
            `INSERT INTO memberprofile (
                memberID, memberName, memberEmail, memberPwd, memberPhone, memberBirth, 
                memberPwdHintID, memberPwdHintAns, memberPayAccount, memberConfirm
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?,?)`,
            [
                memberID, 
                memberName || '',        // 允許空字串
                memberEmail, 
                memberPwd, 
                memberPhone || '',       // 允許空字串
                memberBirth || null,     // 允許 null
                memberPwdHintID || null, // 允許 null
                memberPwdHintAns || '' ,  // 允許空字串
                memberPayAccount || '',
                '111111'
            ]
        );

        // 註冊成功
        res.status(201).json({ 
            success: true, 
            message: '會員註冊成功', 
            memberID: memberID 
        });

    } catch (error) {
        console.error('會員註冊伺服器錯誤:', error);
        res.status(500).json({ success: false, message: '伺服器內部錯誤，註冊失敗' });
    }
});

// ----------------------------------------------------------------------
// [API 4] 查詢會員餘額 (GET /api/member/balance/:memberId)
// ----------------------------------------------------------------------
router.get('/balance/:memberId', async (req, res) => {
    try {
        const memberId = req.params.memberId;
        
        const [result] = await db.query(
            'SELECT balance FROM membercashcard WHERE memberID = ?', 
            [memberId]
        );

        res.json({ success: true, balance: result.length > 0 ? result[0].balance : 0 });
    } catch (error) {
        console.error("API 4 錯誤:", error);
        res.status(500).json({ success: false, error: '伺服器錯誤，無法查詢餘額。' });
    }
});

// ----------------------------------------------------------------------
// [API 5] 會員儲值 (POST /api/member/topup)
// ----------------------------------------------------------------------
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
    } catch (error) { 
        console.error("API 5 錯誤:", error);
        res.status(500).json({ success: false, error: error.message }); 
    }
});

// ----------------------------------------------------------------------
// [API 6] 查詢密碼提示問題 (GET /api/member/pwd-question?account=...)
// ----------------------------------------------------------------------
// ./routes/member.js (API 6 最終修正版)

router.get('/pwd-question', async (req, res) => {
    const account = req.query.account; 

    if (!account) {
        return res.status(400).json({ success: false, message: "缺少帳號參數" });
    }

    try {
        // 1. 查詢 memberprofile，找出該帳號選擇的 memberPwdHintID
        const [userRows] = await db.query(
            // 修正：這裡只查 ID，因為答案在 profile 表中，但只有驗證時才需要
            'SELECT memberPwdHintID FROM memberprofile WHERE memberEmail = ? OR memberID = ?',
            [account, account]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ success: false, message: "找不到此帳號" });
        }
        
        const hintID = userRows[0].memberPwdHintID;

        // 2. 🎯 關鍵修正：從 memberPwdQuestion 表中，查詢儲存「題目文本」的欄位
        // 🚨 請將 memberPwdHintContent 替換為您資料庫中實際的欄位名稱！
        const [questionRows] = await db.query(
            'SELECT memberPwdHintContent FROM memberPwdQuestion WHERE memberPwdHintID = ?', 
            [hintID]
        );

        if (questionRows.length === 0) {
            return res.status(404).json({ success: false, message: "找不到對應的提示問題文本" });
        }

        // 🎯 關鍵修正：這裡也必須使用正確的欄位名
        const memberPwdHintContent = questionRows[0].memberPwdHintContent; // 替換為您實際的欄位名
        
        res.json({ 
            success: true, 
            question: memberPwdHintContent, 
            hintID: hintID 
        });

    } catch (error) {
        // 🚨 這是拋出 500 錯誤的地方
        console.error("API 6 查詢密碼提示問題錯誤 (請檢查 memberPwdQuestion 欄位名稱):", error);
        res.status(500).json({ success: false, message: '伺服器內部錯誤' });
    }
});

// ----------------------------------------------------------------------
// [API 7] 查詢會員資料 (GET /api/member/profile/:memberID)
// ----------------------------------------------------------------------
router.get('/profile/:memberID', async (req, res) => {
    try {
        const memberID = req.params.memberID;
        
        const [rows] = await db.query(
            'SELECT memberID, memberName, memberEmail, memberPhone, memberBirth, memberPwdHintID, memberPwdHintAns, memberPayAccount FROM memberprofile WHERE memberID = ?', 
            [memberID]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "找不到該會員資料" });
        }

        res.json({ success: true, user: rows[0] });
    } catch (error) {
        console.error("API 7 錯誤:", error);
        res.status(500).json({ success: false, message: '伺服器錯誤，無法載入會員資料' });
    }
});

// ----------------------------------------------------------------------
// [API 8] 修改會員資料 (PUT /api/member/update)
// ----------------------------------------------------------------------
router.put('/update', async (req, res) => {
    const { memberID, memberName, memberEmail, memberPhone, memberPayAccount } = req.body;

    try {
        const sql = `
            UPDATE memberProfile SET 
                memberName = ?, 
                memberEmail = ?, 
                memberPhone = ?, 
                memberPayAccount = ?
            WHERE memberID = ?
        `;
        
        const [result] = await db.query(sql, [
            memberName, 
            memberEmail, 
            memberPhone, 
            memberPayAccount, 
            memberID
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "找不到會員或資料無變動" });
        }

        res.json({ success: true, message: "資料更新成功" });
    } catch (error) { 
        console.error("API 8 錯誤:", error);
        res.status(500).json({ success: false, error: error.message }); 
    }
});

// ./routes/member.js (新增重設密碼路由)

// ./routes/member.js (新增重設密碼路由)

// ----------------------------------------------------------------------
// [API 9] 忘記密碼 - 重設密碼 (POST /api/member/forget-password)
// ----------------------------------------------------------------------
router.post('/forget-password', async (req, res) => {
    // 🎯 接收前端傳來的：帳號 (account)、新密碼 (newPassword)、和密碼提示答案 (hintAnswer)
    const { account, newPassword, hintAnswer } = req.body; 

    if (!account || !newPassword || !hintAnswer) {
        return res.status(400).json({ success: false, message: "缺少必要參數" });
    }

    try {
        // 1. 驗證帳號和答案是否匹配
        const [checkRows] = await db.query(
            // 檢查 memberEmail 或 memberID 且答案 (memberPwdHintAns) 必須匹配
            'SELECT memberID FROM memberprofile WHERE (memberEmail = ? OR memberID = ?) AND memberPwdHintAns = ?',
            [account, account, hintAnswer]
        );

        if (checkRows.length === 0) {
            return res.status(401).json({ success: false, message: "帳號或提示答案不正確" });
        }

        const memberID = checkRows[0].memberID;

        // 2. 更新密碼
        await db.query(
            'UPDATE memberprofile SET memberPwd = ? WHERE memberID = ?',
            [newPassword, memberID]
        );

        res.json({ success: true, message: "密碼已成功更新" });

    } catch (error) {
        console.error("重設密碼錯誤:", error);
        res.status(500).json({ success: false, message: '伺服器內部錯誤，無法更新密碼' });
    }
});
// ----------------------------------------------------------------------
// 9. 匯出路由 (供 server.js 引用)
// ----------------------------------------------------------------------
module.exports = router;