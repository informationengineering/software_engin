// src/pages/ForgetPassword.js
import axios from 'axios';
import React from 'react';
import { useNavigate } from 'react-router-dom'; 
// 假設您的 App.js 已經引入了 axios

const API_BASE = "http://localhost:3001/api/member";

/**
 * ForgetPassword Component：處理密碼重設流程
 */
function ForgetPassword() {
    // 狀態管理：取代 DOM 元素的值和顯示/隱藏
    const [account, setAccount] = React.useState('');
    const [answer, setAnswer] = React.useState('');
    const [newPwd, setNewPwd] = React.useState('');
    const [question, setQuestion] = React.useState(null); // null: 未查詢, string: 題目
    const [note, setNote] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const navigate = useNavigate();

    // 取得密碼提示題目 (fetchPwdQuestion)
    const fetchPwdQuestion = async (acc) => {
        try {
            const resp = await axios.get(`${API_BASE}/pwd-question?account=${encodeURIComponent(acc)}`);
            const j = resp.data;
            if (j.success && j.question) return j.question;
            return null;
        } catch (err) {
            console.warn("pwd-question error:", err);
            const errorMsg = err.response?.data?.message || err.message; 
            setNote(`❌ 無法取得題目：${errorMsg}`); // 使用 setNote 在外部顯示錯誤
            return null;
        }
    };

    // 處理「取得提示題目」按鈕點擊 (btnGetQuestion)
    const handleGetQuestion = async () => {
        setNote("");
        if (!account) {
            setNote("請先輸入帳號 (Email)");
            return;
        }

        setIsLoading(true);
        setNote("嘗試從後端取得密碼提示題目...");

        try { // 🎯 新增 try/catch 區塊來捕捉 Axios 錯誤
            const resp = await axios.get(`${API_BASE}/pwd-question?account=${encodeURIComponent(account)}`);
            const j = resp.data;
 
            if (j.success && j.question) {
            setQuestion(j.question);
            setNote("請回答提示題目並輸入新密碼。");
            } else {
                setQuestion("(無題目可取得，請輸入您註冊時記得的答案)");
                setNote(j.message || "找不到帳號或題目。請直接輸入答案與新密碼重置。"); // 使用後端訊息
            }
        } catch (err) {
            console.error("Get Question Error:", err);
            const errorMsg = err.response?.data?.message || "無法連線至後端";
            setNote(`❌ ${errorMsg}`);
        } finally {
            setIsLoading(false);
        }
    };

    // 處理「重設密碼」按鈕點擊 (btnReset)
    const handleResetPassword = async () => {
        if (isLoading) return;
        
        if (!account || !answer || !newPwd) {
            setNote("請完整填寫帳號、答案與新密碼");
            return;
        }

        setIsLoading(true);
        setNote("正在重設密碼...");

        try {
            // API 呼叫：重設密碼 (forget-password)
            const resp = await axios.post(`${API_BASE}/forget-password`, { 
                account, 
                hintAnswer : answer, 
                newPassword: newPwd 
            });
            const j = resp.data;

            if (j.success) {
                setNote("✅ 密碼修改成功，請用新密碼登入");
                // 導航到 /login (取代 location.href = "login.html")
                setTimeout(() => navigate('/login'), 1000); 
            } else {
                setNote(j.error || "密碼修改失敗");
            }
        } catch (err) {
            console.error(err);
            setNote("❌ 伺服器錯誤或無法連線");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container forget-password-page">
            {/* 導航 (使用 useNavigate 取代舊版 nav 標籤) */}
            <nav className="app-nav">
                <a onClick={() => navigate('/')}>首頁</a>
                <a onClick={() => navigate('/login')}>登入</a>
                <a onClick={() => navigate('/register')}>註冊</a>
            </nav>

            <h2>忘記密碼</h2>

            <div id="stepForm">
                <label>
                    帳號 (Email)
                    {/* 綁定 account 狀態 */}
                    <input 
                        id="fpAccount" 
                        type="email" 
                        required 
                        value={account}
                        onChange={(e) => setAccount(e.target.value)}
                        disabled={isLoading}
                    />
                </label>
                
                <button 
                    id="btnGetQuestion" 
                    type="button"
                    onClick={handleGetQuestion}
                    disabled={isLoading || !!question}
                >
                    {isLoading ? '處理中...' : '取得你的密碼提示題目'}
                </button>
                
                {/* 狀態切換：當 question 有值時才顯示這塊區域 (取代 style="display:none") */}
                {question && (
                    <div id="questionArea" style={{marginTop: '12px'}}>
                        <div><strong>你的題目：</strong><span id="pwdQuestionText">{question}</span></div>
                        
                        <label>
                            答案：
                            <input 
                                id="fpAnswer" 
                                type="text" 
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                disabled={isLoading}
                            />
                        </label>
                        
                        <label>
                            新密碼：
                            <input 
                                id="fpNewPwd" 
                                type="password" 
                                value={newPwd}
                                onChange={(e) => setNewPwd(e.target.value)}
                                disabled={isLoading}
                            />
                        </label>
                        
                        <button 
                            id="btnReset" 
                            type="button" 
                            onClick={handleResetPassword}
                            disabled={isLoading}
                            className="primary-button"
                        >
                            重設密碼
                        </button>
                    </div>
                )}

                <div className="note" id="fpNote" style={{marginTop: '15px'}}>{note}</div>
            </div>
        </div>
    );
}

// 必須匯出，供 App.js 路由使用
export default ForgetPassword;