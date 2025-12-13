// src/Member/ProfileManager.js

const API_BASE = "http://localhost:3001/api/member";

// 輔助函式：從 localStorage 讀取用戶資料
function getMemberFromStorage() {
    const userJson = localStorage.getItem("memberUser");
    if (userJson) {
        try {
            return JSON.parse(userJson);
        } catch (e) {
            localStorage.removeItem("memberUser");
            return null;
        }
    }
    return null;
}

/**
 * ProfileManager 主元件：處理會員資料的讀取、顯示、修改、儲存 (M2 & M6)
 * @param {object} props - 包含 onLogout 函式，用於全站登出。
 */
function ProfileManager({ onLogout }) {
    const user = React.useMemo(() => getMemberFromStorage(), []); // 登入用戶的 ID
    const [profileData, setProfileData] = React.useState({}); // 實際顯示/編輯的 profile 資料
    const [note, setNote] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(true);

    // --- M2 讀取會員資料 (初始載入) ---
    React.useEffect(() => {
        if (!user || !user.id) {
            // 這個情況理論上會被 ProtectedRoute 擋住，但以防萬一
            setNote("未登入或會員資料錯誤，請重新登入。");
            setIsLoading(false);
            return;
        }
        
        const loadProfile = async () => {
            try {
                // M2 ShowMemberInfo: 讀取會員資料
                const resp = await axios.get(`${API_BASE}/profile/${encodeURIComponent(user.id)}`);
                const j = resp.data;

                if (!j.success) {
                    setNote(j.error || "讀取會員資料失敗");
                    return;
                }
                
                // 填入欄位
                setProfileData({
                    id: user.id,
                    name: j.data.name || "",
                    email: j.data.email || "",
                    phone: j.data.phone || "",
                    birthday: j.data.birthday || "",
                    payAccount: j.data.pay_account || "",
                });

            } catch (err) {
                console.error(err);
                setNote("無法連線至後端服務");
            } finally {
                setIsLoading(false);
            }
        };

        loadProfile();
    }, [user]);

    // 處理輸入框變動：更新 profileData 狀態
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        // 欄位 ID: pName, pEmail... 轉換為 name, email...
        const fieldName = id.slice(1).toLowerCase();
        setProfileData(prev => ({ ...prev, [fieldName]: value }));
    };

    // --- M6 SaveChange (儲存修改) ---
    const handleSave = async () => {
        setNote("");
        const updated = profileData;

        // 驗證
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\d{10}$/;
        if (!emailRegex.test(updated.email)) { setNote("信箱格式錯誤，請檢查"); return; }
        if (!phoneRegex.test(updated.phone)) { setNote("手機格式錯誤，須為 10 位數字"); return; }
        
        try {
            // M6 Update API 呼叫
            const resp = await axios.put(`${API_BASE}/profile/${encodeURIComponent(updated.id)}`, {
                name: updated.name,
                email: updated.email,
                phone: updated.phone,
                birthday: updated.birthday,
                payAccount: updated.payAccount
            });
            
            const j = resp.data;
            if (j.success) {
                setNote("✅ 資料已成功更新！");
                
                // 更新 localStorage，保持登入狀態資料與最新 profile 同步
                const updatedUser = { 
                    ...user, 
                    name: updated.name, 
                    email: updated.email, 
                    phone: updated.phone 
                };
                localStorage.setItem("memberUser", JSON.stringify(updatedUser));
                
            } else {
                setNote(j.error || "更新失敗，請稍後再試。");
            }
        } catch (err) {
            console.error(err);
            setNote("❌ 無法連線至後端服務進行更新。");
        }
    };
    
    // M11 Logout in profile page
    const handleLogout = () => {
        onLogout(); // 呼叫 AppRouter 傳遞下來的登出函式
    };
    
    // 渲染載入狀態
    if (isLoading) {
        return <div className="loading-state">載入會員資料中，請稍候...</div>;
    }

    return (
        <div id="profileArea">
            <form id="profileForm">
                {/* 欄位展示與綁定 */}
                <label>姓名 <input id="pName" type="text" value={profileData.name} onChange={handleInputChange} /></label>
                <label>Email <input id="pEmail" type="email" value={profileData.email} onChange={handleInputChange} /></label>
                <label>手機 <input id="pPhone" type="text" value={profileData.phone} onChange={handleInputChange} /></label>
                <label>生日 <input id="pBirth" type="date" value={profileData.birthday} onChange={handleInputChange} /></label>
                <label>付款帳號 <input id="pPay" type="text" value={profileData.payAccount} onChange={handleInputChange} /></label>

                <div className="profile-row">
                    <div><button id="btnSave" type="button" onClick={handleSave}>儲存修改</button></div>
                    <div><button id="btnLogout" className="secondary" type="button" onClick={handleLogout}>登出</button></div>
                </div>

                <div className="note" id="profileNote">{note}</div>
            </form>
        </div>
    );
}

export default ProfileManager;