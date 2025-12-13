// src/axiosConfig.js (新增此檔案)
import axios from 'axios';

// 設置請求攔截器
axios.interceptors.request.use(config => {
    const token = localStorage.getItem('authToken'); 

    // 檢查目標 URL 是否是您的 API (避免傳給外部網站)
    // 這裡假設所有 API 都發送到 localhost:3001
    if (token ) {
        // 標準格式：Authorization: Bearer <Token>
        config.headers.Authorization = `Bearer ${token}`; 
    }

    return config;
}, error => {
    return Promise.reject(error);
});

// 你需要在你的 App.js 或 main.js 檔案中頂部引入這個配置一次：
// import './axiosConfig';