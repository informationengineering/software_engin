// booking_backend/middleware/authMiddleware.js (新增此檔案)
const jwt = require('jsonwebtoken');

// 🚨 必須與會員系統的密鑰完全一致！
const JWT_SECRET = 'a'; // 👈 強制使用這個值
console.log('Verification Secret (Hex):', Buffer.from(JWT_SECRET, 'utf8').toString('hex'));
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // 如果沒有 Token，直接返回 401
        return res.status(401).json({ success: false, message: '請先登入會員' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('✅ JWT VERIFIED SUCCESS. MemberID:', decoded.memberID);
        req.user = decoded; // 將會員資訊附加到 req.user
        next(); 
    } catch (error) {
        console.error('❌ JWT VERIFICATION FAILED. Error Name:', error.name, 'Message:', error.message);
        
        // 錯誤處理 (保持不變)
        if (error.name === 'TokenExpiredError') {
             return res.status(401).json({ success: false, message: '登入憑證已過期，請重新登入' });
        }
        return res.status(401).json({ success: false, message: '登入憑證無效或格式錯誤，請重新登入' });
    }
};

module.exports = authMiddleware;