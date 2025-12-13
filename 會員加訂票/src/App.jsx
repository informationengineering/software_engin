// src/App.js

import React from "react";
// 引入 React Router 核心功能
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"; 

// =========================================================================
// --- 引入所有系統頁面與元件 (請確保檔案路徑與命名完全匹配) ---
// =========================================================================
import './axiosConfig';
// 1. 導航與佔位符元件 (MainMenu 必須實際創建)
import MainMenu from "./components/MainMenu";        
const MovieListPage = () => <h2>[🚧 電影展示系統尚未實作]</h2>; 
const HistoryPage = () => <h2>[🚧 訂票紀錄系統尚未實作]</h2>;

// 2. 會員系統頁面 (L, S, M, T 模組)
import Login from "./pages/Login"; 
import Register from "./pages/Register";
import Profile from "./pages/Profile"; 
import ForgetPassword from "./pages/ForgetPassword";
import TopUpPage from "./pages/TopUp"; 

// 3. 訂票核心流程
import BookingFlow from "./Booking/BookingFlow";       // 包含所有訂票步驟

// src/axiosConfig.js 或 App.js 頂部


/**
 * ProtectedRoute - 用於保護需要登入才能訪問的路由
 * 功能：檢查 localStorage 中是否有 "memberUser"。
 */
const ProtectedRoute = ({ element: Element, ...rest }) => {
    // 檢查登入狀態
    const isLoggedIn = !!localStorage.getItem("memberUser");
    
    // 如果已登入，渲染目標元件；否則，導航到登入頁
    return isLoggedIn ? <Element {...rest} /> : <Navigate to="/login" replace />;
};

// src/axiosConfig.js 或 App.js 頂部

import axios from 'axios';

// 設置請求攔截器
axios.interceptors.request.use(config => {
    // 1. 從儲存位置獲取 Token
    const token = localStorage.getItem('authToken'); 

    // 2. 如果 Token 存在，將其添加到 Authorization 標頭
    if (token) {
        // 使用 Bearer 格式是 API 驗證的標準格式
        config.headers.Authorization = `Bearer ${token}`; 
    }

    // 3. 繼續發送請求
    return config;
}, error => {
    return Promise.reject(error);
});

function App() {
    return (
        <Router>
            <Routes>
                
                {/* 1. 應用程式首頁：顯示主選單 (MainMenu) */}
                <Route path="/" element={<MainMenu />} />
                
                {/* 2. 會員系統 - 公開頁面 */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forget" element={<ForgetPassword />} />

                {/* 3. 會員系統 - 私有頁面 (需要登入保護) */}
                
                {/* /profile 和 /topup 必須在登入後才能訪問 */}
                <Route 
                    path="/profile" 
                    element={<ProtectedRoute element={Profile} />} 
                />
                <Route 
                    path="/topup" 
                    element={<ProtectedRoute element={TopUpPage} />} 
                />

                {/* 4. 訂票四大系統的入口 */}
                
                {/* 訂票流程核心：啟動 BookingFlow.js 內的所有步驟 */}
                <Route path="/booking" element={<BookingFlow />} /> 
                
                {/* 電影展示與訂票紀錄 (目前為佔位符) */}
                <Route path="/movies" element={<MovieListPage />} /> 
                <Route path="/history" element={<HistoryPage />} /> 

                {/* 5. 404 處理 */}
                <Route path="*" element={<h2>頁面不存在 (404 Not Found)</h2>} />
            </Routes>
        </Router>
    );
}

export default App;