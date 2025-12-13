// src/pages/TopUpPage.js

import React from 'react';
import { useNavigate } from 'react-router-dom'; 
// 假設您的 App.js 已經引入了 axios

const API_BASE = "http://localhost:3001/api/member";
const TOPUP_API = `${API_BASE}/topup`;       // 儲值交易 API
const CHECK_BALANCE_API = `${API_BASE}/balance`; // 查詢餘額 API


/**
 * TopUpPage Component：處理會員儲值流程 (T1 - T7)
 */
function TopUpPage() {
    // 狀態管理：取代 DOM 查詢
    const [memberId, setMemberId] = React.useState('');
    const [amount, setAmount] = React.useState('');
    const [payAccount, setPayAccount] = React.useState('');
    const [balance, setBalance] = React.useState('--');
    const [resultMsg, setResultMsg] = React.useState({ text: '', type: 'default' });
    const [isLoading, setIsLoading] = React.useState(false);

    const navigate = useNavigate();

    // T4：檢查銀行帳號（React 實現）
    const checkPayAccount = (account) => {
        // 假設銀行帳號長度需為 8 碼
        return account && account.length === 8;
    };

    // T2：查詢餘額 (searchBalance)
    const searchBalance = async () => {
        if (!memberId) {
            setResultMsg({ text: "請先輸入會員編號", type: 'error' });
            return;
        }

        setIsLoading(true);
        setResultMsg({ text: "查詢中...", type: 'default' });
        
        try {
            // 連接後端 API 查詢餘額
            const resp = await axios.get(`${CHECK_BALANCE_API}?memberId=${encodeURIComponent(memberId)}`);
            
            if (resp.data.success) {
                setBalance(resp.data.balance);
                setResultMsg({ text: "餘額查詢成功。", type: 'success' });
            } else {
                setBalance('--');
                setResultMsg({ text: resp.data.message || "會員不存在或查詢失敗", type: 'error' });
            }

        } catch (err) {
            console.error(err);
            setBalance('--');
            setResultMsg({ text: "❌ 無法連線至後端查詢餘額", type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    // T1：主流程：儲值卡儲值 (topUpCard)
    const handleTopUp = async () => {
        const parsedAmount = parseInt(amount);

        // --- 驗證 ---
        if (!memberId || !parsedAmount || parsedAmount <= 0 || !payAccount) {
            setResultMsg({ text: "請完整填寫所有欄位，儲值金額需大於 0", type: 'error' });
            return;
        }
        if (!checkPayAccount(payAccount)) {
            setResultMsg({ text: "銀行帳號格式錯誤（需 8 碼）", type: 'error' });
            return;
        }
        
        // 儲值確認
        if (!window.confirm(`確認為會員 ${memberId} 儲值 ${parsedAmount} 元嗎？`)) return;

        setIsLoading(true);
        setResultMsg({ text: "儲值交易處理中...", type: 'default' });

        try {
            // T7：紀錄加值資訊 (實際連後端執行交易)
            const resp = await axios.post(TOPUP_API, {
                memberId: memberId,
                amount: parsedAmount,
                payAccount: payAccount
            });
            
            if (resp.data.success) {
                // T5 顯示成功，並更新餘額
                setResultMsg({ 
                    text: `✅ 儲值成功！新餘額：${resp.data.newBalance} 元`, 
                    type: 'success' 
                });
                setBalance(resp.data.newBalance); // 假設後端回傳 newBalance
            } else {
                // T6 顯示失敗
                setResultMsg({ text: resp.data.message || "儲值交易失敗", type: 'error' });
            }
        } catch (err) {
            console.error(err);
            setResultMsg({ text: "❌ 伺服器錯誤或無法連線", type: 'error' });
        } finally {
            setIsLoading(false);
            setAmount(''); // 清空金額欄位
            setPayAccount(''); // 清空帳號欄位
        }
    };
    
    // 根據 type 決定訊息的樣式
    const getMsgStyle = () => {
        if (resultMsg.type === 'error') return { color: 'red', fontWeight: 'bold' };
        if (resultMsg.type === 'success') return { color: 'green', fontWeight: 'bold' };
        return { color: '#666' };
    };


    return (
        <div className="container topup-page-container">
            {/* 導航 */}
            <nav className="app-nav">
                <a onClick={() => navigate('/')}>首頁</a>
                <a onClick={() => navigate('/profile')}>會員中心</a>
            </nav>

            <h2>💳 會員儲值</h2>

            {/* T3 會員編號輸入與餘額查詢 */}
            <label>會員編號（身分證字號）</label>
            <input 
                id="memberIdInput" 
                type="text" 
                placeholder="例如：A123456789"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value.trim().toUpperCase())}
            />

            <button 
                onClick={searchBalance} 
                disabled={isLoading || !memberId}
                style={{marginTop: '10px', marginBottom: '10px'}}
            >
                查詢餘額
            </button>
            <p id="balanceDisplay" style={{fontSize: '1.2em'}}>
                餘額：<span style={{color: '#ff6600', fontWeight: 'bold'}}>{balance}</span> 元
            </p>

            <hr style={{margin: '20px 0'}} />

            {/* 儲值表單 */}
            <div id="topUpArea">
                <label>儲值金額</label>
                <input 
                    id="amountInput" 
                    type="number" 
                    min="1" 
                    placeholder="輸入儲值金額"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />

                <label>銀行帳號</label>
                <input 
                    id="payAccountInput" 
                    type="text" 
                    placeholder="請輸入扣款銀行帳號（需 8 碼）"
                    value={payAccount}
                    onChange={(e) => setPayAccount(e.target.value)}
                />

                {/* 執行儲值 */}
                <button 
                    onClick={handleTopUp}
                    disabled={isLoading || !memberId || !amount || !payAccount}
                    className="checkout-button"
                    style={{marginTop: '20px'}}
                >
                    {isLoading ? '處理中...' : '確認儲值'}
                </button>
            </div>

            {/* 訊息顯示 (T5, T6) */}
            <p id="resultMsg" style={{...getMsgStyle(), marginTop: '15px'}}>{resultMsg.text}</p>
        </div>
    );
}

// 必須匯出，供 App.js 路由使用
export default TopUpPage;