import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 

const API_BASE = "http://localhost:3001/api/member";

export default function Profile() {
    // 🎯 關鍵修正 A: 新增 isLoading 狀態旗標
    const [isLoading, setIsLoading] = useState(true); 
    const [user, setUser] = useState(null); 
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        birthday: "",
        payAccount: "",
    });
    const [note, setNote] = useState("");
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

    // 🎯 核心載入邏輯：獨立的 loadProfileData 函式
    const loadProfileData = async (memberID) => {
        // 🎯 關鍵修正 B: 清理 memberID，移除所有非 ID 的字元 (解決 404 錯誤)
        const cleanMemberID = memberID ? String(memberID).split(':')[0] : null; 

        if (!cleanMemberID) {
            setNote("會員 ID 遺失，請重新登入。");
            setIsLoading(false); // 錯誤時解除載入狀態
            return;
        }

        try {
            const resp = await axios.get(`${API_BASE}/profile/${encodeURIComponent(cleanMemberID)}`);
            const data = resp.data;
            
            if (data.success && data.user) {
                const userData = data.user; 
                setFormData({
                    name: userData.memberName || "",         
                    email: userData.memberEmail || "",       
                    phone: userData.memberPhone || "",       
                    // 處理日期格式 (確保顯示 YYYY-MM-DD)
                    birthday: userData.memberBirth ? userData.memberBirth.split('T')[0] : "", 
                    payAccount: userData.memberPayAccount || "", 
                });
            } else {
                setNote(data.message || "讀取會員資料失敗");
            }
        } catch (err) {
            console.error("載入會員資料連線錯誤:", err);
            setNote("無法連線至後端或讀取資料失敗");
        } finally {
            // 🎯 關鍵修正 C: 無論成功或失敗，最終都解除載入狀態
            setIsLoading(false); 
        }
    };


    // 🎯 useEffect：處理流程控制與數據初始化
    useEffect(() => {
        const parsedUser = getStoredUser();

        if (!parsedUser || !parsedUser.memberID) {
            alert("請先登入");
            navigate("/login"); 
            return;
        }

        const memberID = parsedUser.memberID; 
        setUser(parsedUser); // 儲存基礎用戶資訊

        // 啟動資料載入
        loadProfileData(memberID);

    }, [navigate]); 

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // ... (handleSave 函式保持不變, 使用者可以自行補齊) ...
    const handleSave = async () => {
        setNote("儲存功能尚未完成。請確保您的後端 /api/member/profile/:memberID 支援 PUT 請求。");
        // 🚨 儲存邏輯的細節請參考我們前面的討論並補齊。
    };

    const handleLogout = () => {
        localStorage.removeItem("memberUser");
        navigate("/login"); 
    };

    // --- 渲染區塊 ---
    
    // 🎯 關鍵修正 D: 使用 isLoading 狀態來控制載入畫面
    if (isLoading) {
        return <div>正在載入會員資料...</div>;
    }

    if (!user || !formData.name) {
        // 載入結束，但資料為空，顯示錯誤或提示
        return <div>{note || "找不到會員資料，請檢查後端連線。"}</div>;
    }


    return (
        <div className="container">
            <nav>
                <a onClick={() => navigate('/')}>首頁</a>
                <a onClick={() => navigate('/login')}>登入</a>
                <a onClick={() => navigate('/register')}>註冊</a>
            </nav>

            <h2>會員資料</h2>
            <p style={{color: '#aaa', fontSize: '0.8em'}}>會員 ID: {user.memberID}</p>

            <form onSubmit={(e) => e.preventDefault()}>
                <label>
                    姓名
                    <input name="name" type="text" value={formData.name} onChange={handleChange} readOnly /> 
                </label>
                <label>
                    Email
                    <input name="email" type="email" value={formData.email} onChange={handleChange} />
                </label>
                <label>
                    手機
                    <input name="phone" type="text" value={formData.phone} onChange={handleChange} />
                </label>
                <label>
                    生日
                    <input name="birthday" type="date" value={formData.birthday} onChange={handleChange} readOnly /> 
                </label>
                <label>
                    付款帳號
                    <input name="payAccount" type="text" value={formData.payAccount} onChange={handleChange} />
                </label>

                <div className="profile-row">
                    <div>
                        <button type="button" onClick={handleSave}>
                            儲存修改
                        </button>
                    </div>
                    <div>
                        <button type="button" className="secondary" onClick={handleLogout}>
                            登出
                        </button>
                    </div>
                </div>

                <div className="note">{note}</div>
            </form>
        </div>
    );
}