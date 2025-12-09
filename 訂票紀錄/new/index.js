// 新增：處理退票功能的函式
// 接收 orderNumber 作為參數，並調用退票 API
const handleRefund = async (orderNum) => {
    // 檢查 axios 是否可用
    if (typeof axios === 'undefined') {
        alert("錯誤：未載入 Axios 函式庫！");
        return;
    }

    if (!window.confirm(`確定要退訂單編號 ${orderNum} 的票嗎？`)) return;

    try {
        // 使用您提供的退票 API 資訊
        const res = await axios.put('http://localhost:3001/api/booking/refund', {
            orderNumber: orderNum
        });

        if (res.data.success) {
            alert("退票成功！畫面將會更新。");
            // 這裡記得重新呼叫一次 API 更新畫面
            loadOrderHistory(); // 重新載入訂單列表
        } else {
            // 處理 API 返回的非成功但無錯誤的情況（例如退票失敗的原因）
            alert(`退票失敗：${res.data.message || '未知錯誤'}`);
        }
    } catch (error) {
        console.error('退票請求錯誤:', error);
        // 處理網路錯誤或伺服器錯誤
        alert("退票失敗！請檢查網路或稍後重試。");
    }
};

// 新增：根據 API 資料渲染 HTML 列表的函式
const renderOrders = (records) => {
    const content = document.getElementById('payment-record');
    
    // 如果沒有紀錄，顯示「尚無任何記錄」
    if (!records || records.length === 0) {
        content.innerHTML = '<p class="no-record">尚無任何付款購票記錄。</p>';
        return;
    }

    // 清空現有內容並準備渲染新的訂單卡片
    content.innerHTML = '';
    
    records.forEach(record => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        
        // 1. 顯示名稱而非 ID (已在下方 HTML 結構中實現)
        let html = `
            <h3>${record.movieName} (${record.orderNumber})</h3>
            <p>影城：${record.cinemaName}</p>
            <p>時間：${record.showingDate} ${record.startTime}</p>
            <p>狀態：<span class="status-${record.orderStatusName.replace(/\s/g, '')}">${record.orderStatusName}</span></p>
        `;

        // 2. 新增退票按鈕 (只有狀態是 '已付款' 時才顯示)
        if (record.orderStatusName === '已付款') {
            html += `
                <button class="refund-button" data-order-number="${record.orderNumber}">
                    申請退票
                </button>
            `;
        }
        
        orderCard.innerHTML = html;
        content.appendChild(orderCard);
    });
    
    // 為所有新生成的退票按鈕添加事件監聽器
    document.querySelectorAll('.refund-button').forEach(button => {
        button.addEventListener('click', function() {
            const orderNum = this.getAttribute('data-order-number');
            handleRefund(orderNum);
        });
    });
};

// 新增：載入訂單歷史紀錄的函式 (GET /history API)
const loadOrderHistory = async () => {
    const content = document.getElementById('payment-record');
    content.innerHTML = '<p class="loading-record">載入中，請稍候...</p>'; // 顯示載入中訊息

    try {
        // 假設您的訂單 API 在這個位置
        const response = await fetch('http://localhost:3001/api/history'); 
        
        if (!response.ok) {
            throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 假設 API 返回的資料結構為 { success: true, records: [...] }
        if (data.success) {
            renderOrders(data.records);
        } else {
            content.innerHTML = `<p class="error-record">載入訂單失敗：${data.message || '伺服器返回非成功狀態'}</p>`;
        }
        
    } catch (error) {
        console.error('載入訂單歷史記錄錯誤:', error);
        content.innerHTML = '<p class="error-record">無法連線到伺服器，請檢查後端服務是否運行。</p>';
    }
};


// 原始程式碼的修改：確保載入完成後，執行初始的資料載入
document.addEventListener('DOMContentLoaded', function() {
    // 呼叫新增的函式，在頁面載入完成後立即載入訂單資料
    loadOrderHistory(); // <--- 更改點：新增此行，開始載入資料

    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // 原始 Tab 切換邏輯 (不需變動)
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有按鈕和內容的 active 狀態
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // 取得目標內容區塊的 ID
            const targetId = this.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);

            // 啟用被點擊的按鈕
            this.classList.add('active');

            // 顯示對應的內容區塊
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
});
