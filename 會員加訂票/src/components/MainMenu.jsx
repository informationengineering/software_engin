// src/components/MainMenu.js

import React from 'react';
import { useNavigate } from 'react-router-dom'; 

/**
 * MainMenu Component: 應用程式的主選單/儀表板
 * 職責：引導使用者進入四大核心系統
 */
function MainMenu() {
    const navigate = useNavigate(); // 用於在 AppRouter 中進行路由跳轉

    return (
        <div className="main-menu-container container">
            <h1>🎬 威秀訂票系統 - 主選單</h1>
            <p>請選擇您要進入的功能系統：</p>
            
            <div className="button-grid">
                
                {/* 1. 訂票服務 (進入 BookingFlow) */}
                <button 
                    className="menu-button primary-btn" 
                    onClick={() => navigate('/booking')}
                >
                    🎟️ 訂票服務 (開始購票)
                </button>

                {/* 2. 電影展示系統 */}
                <button 
                    className="menu-button secondary-btn" 
                    onClick={() => navigate('/movies')}
                >
                    🎬 電影與場次展示
                </button>
                
                {/* 3. 會員中心 (這裡可以導向 Profile 或 Login) */}
                <button 
                    className="menu-button secondary-btn" 
                    onClick={() => {
                        // 檢查登入狀態，已登入導向 Profile，未登入導向 Login
                        const user = localStorage.getItem("memberUser");
                        navigate(user ? '/profile' : '/login');
                    }}
                >
                    👤 會員中心 / 登入
                </button>
                
                {/* 4. 訂票紀錄系統 */}
                <button 
                    className="menu-button secondary-btn" 
                    onClick={() => navigate('/history')}
                >
                    📜 訂單查詢/紀錄
                </button>

            </div>
            
            <div className="note-section">
                <p>💡 點擊上方的按鈕即可切換到對應的系統主頁面。</p>
            </div>
        </div>
    );
}

// 必須匯出，供 App.js 路由使用
export default MainMenu;