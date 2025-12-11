import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './styles.css'; // 引入您的 CSS 樣式

// 設定 API 基礎 URL
const API_BASE_URL = 'http://localhost:3001/api/booking';

/**
 * 訂單紀錄組件
 */
const OrderHistory = () => {
    // 狀態管理
    const [activeTab, setActiveTab] = useState('payment-record');
    const [records, setRecords] = useState([]); // 儲存訂單列表
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 載入訂單歷史紀錄的函式 (GET /history API)
    // 使用 useCallback 以避免不必要的重新創建，並在 useEffect 中作為依賴項
    const loadOrderHistory = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // 串接 GET /history API
            const response = await axios.get('http://localhost:3001/api/history'); 
            
            if (response.data.success) {
                setRecords(response.data.records);
            } else {
                // 處理 API 返回的非成功狀態
                setError(response.data.message || '載入訂單失敗');
                setRecords([]);
            }
        } catch (err) {
            console.error('載入訂單歷史記錄錯誤:', err);
            // 處理網路錯誤或伺服器錯誤
            setError('無法連線到伺服器，請檢查後端服務是否運行。');
            setRecords([]);
        } finally {
            setLoading(false);
        }
    }, []); // 依賴為空，只在組件 mount 時創建一次

    // 在組件首次 mount 時載入資料
    useEffect(() => {
        loadOrderHistory();
    }, [loadOrderHistory]); // 確保在 loadOrderHistory 變更時重新執行 (儘管我們使用了 useCallback)

    // 退票功能的函式 (PUT /refund API)
    const handleRefund = async (orderNum) => {
        if (!window.confirm(`確定要退訂單編號 ${orderNum} 的票嗎？`)) return;

        try {
            // 串接 PUT /refund API
            const res = await axios.put(`${API_BASE_URL}/refund`, {
                orderNumber: orderNum
            });

            if (res.data.success) {
                alert("退票成功！畫面將會更新。");
                loadOrderHistory(); // 重新載入資料以更新畫面
            } else {
                alert(`退票失敗：${res.data.message || '未知錯誤'}`);
            }
        } catch (error) {
            console.error('退票請求錯誤:', error);
            alert("退票失敗！請檢查網路或稍後重試。");
        }
    };

    /**
     * 根據狀態顯示不同的訂單內容
     */
    const renderContent = () => {
        if (loading) {
            return <p className="loading-record">載入中，請稍候...</p>;
        }

        if (error) {
            return <p className="error-record">{error}</p>;
        }

        if (activeTab === 'payment-record') {
            if (records.length === 0) {
                return <p className="no-record">尚無任何付款購票記錄。</p>;
            }

            // 使用 JSX 渲染訂單列表 (取代原生 JS 的 innerHTML)
            return (
                <div>
                    {records.map(record => (
                        <div key={record.orderNumber} className="order-card">
                            {/* ✅ 1. 顯示名稱而非 ID */}
                            <h3>{record.movieName} ({record.orderNumber})</h3>
                            <p>影城：{record.cinemaName}</p>
                            <p>時間：{record.showingDate} {record.startTime}</p>
                            
                            {/* 使用 className 綁定 CSS 樣式 */}
                            <p>狀態：
                                <span className={`status-${record.orderStatusName.replace(/\s/g, '')}`}>
                                    {record.orderStatusName}
                                </span>
                            </p>

                            {/* ✅ 2. 退票按鈕 (只有狀態是'已付款'時才顯示) */}
                            {record.orderStatusName === '已付款' && (
                                <button 
                                    className="refund-button"
                                    // 綁定 onClick 事件，呼叫 handleRefund 函式
                                    onClick={() => handleRefund(record.orderNumber)}
                                >
                                    申請退票
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            );
        } else if (activeTab === 'stored-value-bill') {
            // 假設這個 Tab 目前沒有串接 API
            return <p className="no-record">尚無任何儲值卡訂票記錄。</p>;
        }
    };

    // 完整的 React 組件渲染
    return (
        <div className="container">
            <div className="main-content">
                <div className="section-box record-box">
                    {/* ... 頁面標頭 (不需變動) ... */}
                    <div className="header">
                        <h2>訂票信箱 <span className="email">someone@gmail.com</span></h2>
                        <p className="note">若購票失敗您的付款授權將取消不收取任何費用，回於 30 分鐘後重新確認。</p>
                    </div>

                    {/* Tab 按鈕 */}
                    <div className="tabs">
                        <button
                            className={`tab-button ${activeTab === 'payment-record' ? 'active' : ''}`}
                            onClick={() => setActiveTab('payment-record')}
                        >
                            付款購票記錄
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'stored-value-bill' ? 'active' : ''}`}
                            onClick={() => setActiveTab('stored-value-bill')}
                        >
                            儲值卡訂票記錄
                        </button>
                    </div>

                    {/* Tab 內容 (使用條件渲染取代 display: none 的 CSS 邏輯) */}
                    <div id="tab-content-area" className="tab-content active">
                        {renderContent()}
                    </div>

                    <div className="ticket-types-info">
                        <p><strong>票種說明：</strong>全票、優待、敬老、愛心、iShow儲值金票</p>
                    </div>
                </div>
            </div>
            
            {/* 側邊欄 (保持不動) */}
            {/* ... Sidebar HTML 內容 ... */}
        </div>
    );
};

export default OrderHistory;
