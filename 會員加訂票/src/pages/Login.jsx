// src/pages/Login.js

// 假設您的 App.js 已經引入了 axios，這裡可以直接使用
// 假設您的 App.js 已經配置了 react-router-dom，我們可以使用 useNavigate
import { useNavigate } from 'react-router-dom'; 
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
const API_BASE = "http://localhost:3001/api/member";
const getStoredToken = () => {
    return localStorage.getItem("authToken");
};
/**
 * Login Component：處理會員登入頁面的所有邏輯與 UI (L1 - L11)
 */
function Login() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [note, setNote] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [isLoggedIn, setIsLoggedIn] = React.useState(false); 
    
    const navigate = useNavigate(); 

    // 輔助函式：從 localStorage 讀取用戶資料
    const getStoredUser = () => {
        const userJson = localStorage.getItem("memberUser");
        if (userJson) {
            try {
                return JSON.parse(userJson);
            } catch (e) {
                return null;
            }
        }
        return null;
    };

    // L2 CheckLoginState() / 檢查登入狀態
    React.useEffect(() => {
        const user = getStoredUser();
        if (user) {
            setIsLoggedIn(true);
            setNote("已登入：" + (user.name || user.memberName)); // 🎯 修正：兼容兩種可能的欄位名
        } else {
            setIsLoggedIn(false);
            setNote("");
        }
    }, []);

    // L1 Login() main handler
    // src/pages/Login.js (修正 handleLogin 函式)

// L1 Login() main handler
const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
        setNote("請輸入 Email 和密碼");
        return;
    }

    setIsLoading(true);
    setNote("");
    let userToStore = null; 

    try {
        // L1 API 呼叫 (發送 email 和 password)
        const resp = await axios.post(`${API_BASE}/login`, {
            email: email, 
            password: password
        });
        
        const data = resp.data;

        if (data.success) {
            // L5 登入成功
            
            // 🎯 關鍵修正 A：安全儲存 JWT Token
            if (data.token) {
                localStorage.setItem("authToken", data.token);
            }
            
            // 儲存用戶資訊
            if (data.user ) {
                userToStore = {
                    memberID: data.user.memberID,
                    name: data.user.memberName || data.user.name || '會員',
                    memberEmail: data.user.memberEmail
                };
                localStorage.setItem("memberUser", JSON.stringify(userToStore));
            } else {
                localStorage.setItem("memberUser", JSON.stringify({ memberID: data.memberID, name: '會員' }));
            }

            // L6 設置狀態並導航
            setIsLoggedIn(true);
            setNote("登入成功！");
            
            // 立即導航到個人資料頁面
            navigate('/profile'); 
            
            // 登入成功後立即退出，防止 finally 區塊干擾
            return; 

        } else {
            setNote(data.message || "帳號或密碼錯誤");
        }
    } catch (err) {
        console.error(err);
        setNote("無法連線至後端（請確認 server 已啟動）");
    } finally {
        // 🎯 修正：在登入失敗時才解除載入狀態
        if (!isLoggedIn) {
            setIsLoading(false);
        }
    }
};
    // L11 Logout()
    const handleLogout = () => {
        localStorage.removeItem("memberUser");
        localStorage.removeItem("authToken");
        setIsLoggedIn(false);
        setNote("已登出");
        setEmail(""); 
        setPassword("");
        // 導航到根目錄或主選單
        navigate('/'); 
    };

    // 渲染 UI (取代 login.html 的結構)
    return (
        <div className="container login-page-container">
            {/* 導航 (取代 Nav 標籤) */}
            <nav className="app-nav">
                <a onClick={() => navigate('/')}>首頁</a>
                <a onClick={() => navigate('/login')} className={isLoggedIn ? 'disabled' : ''}>登入</a>
                <a onClick={() => navigate('/register')}>註冊</a>
                <a onClick={() => navigate('/forget')}>忘記密碼</a>
            </nav>

            <h2>會員登入</h2>
            <form id="loginForm" onSubmit={handleLogin}>
                
                {/* 登入狀態下顯示用戶資訊，並隱藏表單 */}
                {isLoggedIn ? (
                    <div className="logged-in-info">
                        <p>{note}</p>
                        <p>歡迎回來，{getStoredUser()?.name || getStoredUser()?.memberName}！</p>
                        <p>前往 <a onClick={() => navigate('/profile')}>個人資料</a> 頁面。</p>
                    </div>
                ) : (
                    <React.Fragment>
                        <label>
                            Email
                            <input 
                                id="inputEmail" 
                                type="email" 
                                required 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </label>
                        <label>
                            密碼
                            <input 
                                id="inputPassword" 
                                type="password" 
                                required 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </label>
                    </React.Fragment>
                )}
                
                {/* 登入/登出按鈕切換 */}
                {!isLoggedIn && (
                    <button 
                        id="btnLogin" 
                        type="submit"
                        disabled={isLoading}
                        className="primary-button"
                    >
                        {isLoading ? '登入中...' : '登入'}
                    </button>
                )}

                {isLoggedIn && (
                    <button 
                        id="btnLogout" 
                        type="button" 
                        className="secondary-button" 
                        onClick={handleLogout}
                        style={{marginTop: '10px'}}
                    >
                        登出
                    </button>
                )}
                
                {/* 訊息顯示 (L5) */}
                <div className="note" id="loginNote">{note}</div>
            </form>
        </div>
    );
}

// 必須匯出，供 App.js 路由使用
export default Login;